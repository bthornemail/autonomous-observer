#!/usr/bin/env node
/*
 * Tetrahedron Coordinator
 * - Watches for TETRAHEDRON_STARTUP_GUIDE.md and TETRAHEDRON_ARCHITECTURE.md
 * - Summarizes and parses tasks from markdown
 * - Announces presence to UI and queries agents for alignment
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

const HUB_WS = process.env.HUB_WS_URL || 'ws://localhost:8081';
const ID = process.env.COPILOT_ID || 'tetrahedron_coordinator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOC_DIR = process.env.TETRA_DOC_DIR || path.resolve(__dirname, '../../UniversalLifeProtocol');
const FILES = Array.from(new Set([
    // Core Tetrahedron docs
    'TETRAHEDRON_STARTUP_GUIDE.md',
    'TETRAHEDRON_ARCHITECTURE.md',
    // Additional coordination artifacts
    'AGENT_COORDINATION_MANIFEST.md',
    'DEPLOYMENT_COMPLETE.md',
    'SACRED_TRUTH_SYNTHESIS.md',
    'autonomous-observer/CLAUDE_CODE_VERTEX.md',
    'docs/announcements/SEAMLESS_ACCESS_COMPLETE.md',
]));

function send(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch { } }

function presence(summary) {
    return {
        role: 'agent',
        from: ID,
        type: 'text',
        meta: { channel: 'a2u' },
        content: {
            intent: 'presence', id: ID,
            message: 'Tetrahedron coordinator online',
            docs: summary,
        }
    };
}

function taskRequest() {
    return {
        role: 'agent', from: ID, type: 'text', meta: { channel: 'u2a' },
        content: {
            intent: 'task_request',
            message: 'Share top 3 actions to align with Tetrahedron docs. JSON preferred: { tasks: [{ title, why, owner?, effort?: "S/M/L" }] }'
        }
    };
}

function parseTasks(md) {
    const tasks = [];
    if (!md || typeof md !== 'string') return tasks;
    // Extract under headings with "task" or TODO, and general task-like bullets
    const lines = md.split(/\r?\n/);
    let inTaskSection = false;
    for (const raw of lines) {
        const line = raw.trim();
        if (/^#{1,6}\s+.*(tasks?|todo|action)/i.test(line)) { inTaskSection = true; continue; }
        if (/^#{1,6}\s+/.test(line)) { inTaskSection = false; }
        const m = line.match(/^[-*]\s+(\[.\]\s+)?(.+)/);
        if (m && (inTaskSection || /\b(task|todo|fix|secure|deploy|test|doc)/i.test(m[2]))) {
            tasks.push({ title: m[2].trim() });
        }
    }
    return tasks;
}

function readDocs() {
    const out = [];
    for (const f of FILES) {
        const p = path.join(DOC_DIR, f);
        try {
            const s = fs.statSync(p);
            if (!s.isFile()) continue;
            const data = fs.readFileSync(p, 'utf8');
            out.push({ file: f, path: p, size: s.size, mtimeMs: s.mtimeMs, tasks: parseTasks(data).slice(0, 20) });
        } catch { /* ignore */ }
    }
    return out;
}

function slugify(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80);
}

function buildProdTasksFromDocs() {
    const docs = readDocs();
    const combined = docs.flatMap(d => d.tasks.map((t) => ({
        id: `${slugify(d.file)}__${slugify(t.title)}`,
        title: t.title,
        area: /secure|auth|jwt|keys?/i.test(t.title) ? 'security'
            : /deploy|systemd|nginx|service|ops/i.test(t.title) ? 'ops'
                : /test|ci|quality|codacy|lint/i.test(t.title) ? 'testing'
                    : 'coordination',
        priority: /now|immediate|urgent/i.test(t.title) ? 'now' : 'next',
        tags: ['tetrahedron', d.file]
    })));
    // Keep a concise set
    return combined.slice(0, 20);
}

async function main() {
    const url = `${HUB_WS}/?id=${encodeURIComponent(ID)}&kind=agent`;
    const ws = new WebSocket(url);
    let opened = false;

    function announce() {
        const docs = readDocs();
        send(ws, presence(docs.map(d => ({ file: d.file, size: d.size, tasksFound: d.tasks.length }))));
        // If any tasks were parsed, broadcast a brief plan snapshot to UI
        const combined = docs.flatMap(d => d.tasks.map(t => ({ ...t, source: d.file })));
        if (combined.length) {
            send(ws, { role: 'agent', from: ID, type: 'text', meta: { channel: 'a2u' }, content: { intent: 'refinement_plan', preview: combined.slice(0, 10) } });
        }
        // Ask agents for alignment
        send(ws, taskRequest());
    }

    ws.on('open', () => { opened = true; announce(); });
    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(String(data));
            const meta = msg?.meta || {}; const payload = msg?.payload || msg?.content || {};
            const isProdPlanReq = (meta.channel === 'u2a') && (meta.topic === 'prod-readiness-plan' || /production readiness tasks/i.test(String(payload.ask || payload.message || '')));
            if (isProdPlanReq) {
                const tasks = buildProdTasksFromDocs();
                const resp = {
                    meta: { channel: 'a2u', type: 'response', topic: 'prod-readiness-plan', from: ID, ts: Date.now() },
                    payload: { tasks }
                };
                send(ws, resp);
            }
        } catch { /* ignore */ }
    });
    ws.on('close', () => process.exit(0));
    ws.on('error', () => process.exit(1));

    // Watch docs for changes (best effort)
    try {
        fs.mkdirSync(DOC_DIR, { recursive: true });
        for (const f of FILES) {
            const p = path.join(DOC_DIR, f);
            try { fs.watch(p, { persistent: false }, () => { if (opened) announce(); }); } catch { /* ignore if not present */ }
        }
    } catch { }

    // Exit if cannot connect in time
    setTimeout(() => { if (!opened) process.exit(2); }, 5000);
}

main();
