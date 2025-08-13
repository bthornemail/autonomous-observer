// Production Readiness Orchestrator
// - Connects to Agent Hub (WS)
// - Requests production-readiness tasks from all agents
// - Aggregates responses, enriches via Knowledge Trie
// - Writes Now/Next/Later plan to Markdown and JSON
// - Optionally persists to Redis if available

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const HUB_WS_URL = process.env.HUB_WS_URL || 'ws://localhost:8081';
const COPILOT_ID = process.env.COPILOT_ID || 'prod-orchestrator';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const KNOWLEDGE_TRIE_PATH = process.env.KNOWLEDGE_TRIE_PATH || path.resolve(__dirname, '../../..', 'merged-knowledge-trie.json');
const OUTPUT_DIR = process.env.PLAN_OUTPUT_DIR || path.resolve(__dirname, '../../..');
const REPORTS_DIR = path.resolve(__dirname, '../../..', 'cleaned-reports');
const COLLECT_WINDOW_MS = Number(process.env.COLLECT_WINDOW_MS || 20000);

// Optional Redis client (graceful if missing)
let createClient;
try {
    ({ createClient } = await import('redis'));
} catch (e) {
    // Redis client not installed; continue with in-memory
}

class StateStore {
    constructor() {
        this.enabled = false;
        this.mem = {
            agents: new Map(),
            tasks: new Map(),
        };
        this.client = null;
    }

    async init(url) {
        if (!createClient) return; // no redis lib
        try {
            this.client = createClient({ url });
            this.client.on('error', (err) => console.error('[redis] error', err.message));
            await this.client.connect();
            this.enabled = true;
            console.log(`[redis] connected: ${url}`);
        } catch (e) {
            console.warn('[redis] unavailable, falling back to in-memory:', e.message);
            this.enabled = false;
        }
    }

    async setJSON(key, value) {
        if (this.enabled) {
            await this.client.set(key, JSON.stringify(value));
        } else {
            this.mem[key] = value;
        }
    }

    async getJSON(key) {
        if (this.enabled) {
            const raw = await this.client.get(key);
            return raw ? JSON.parse(raw) : null;
        }
        return this.mem[key] || null;
    }

    async close() {
        if (this.client && this.enabled) await this.client.quit();
    }
}

function loadKnowledgeTrie() {
    const candidates = [
        KNOWLEDGE_TRIE_PATH,
        path.resolve(__dirname, '../../..', 'axiomatic-trie-complete.json'),
        path.resolve(__dirname, '../../..', 'merged-knowledge-trie.json'),
    ];
    for (const p of candidates) {
        try {
            if (fs.existsSync(p)) {
                const text = fs.readFileSync(p, 'utf-8');
                const json = JSON.parse(text);
                console.log(`[trie] loaded ${p}`);
                return { path: p, data: json };
            }
        } catch (e) {
            console.warn('[trie] failed to load', p, e.message);
        }
    }
    console.warn('[trie] no knowledge trie found; continuing without enrichment');
    return { path: null, data: null };
}

function seedBootstrapTasks() {
    // Minimal bootstrap set derived from prior repo context
    return [
        { id: 'sec-jwt-bridge', title: 'Add JWT support to UBHP/CUE bridge with dual-accept (API key + JWT) window', area: 'security', priority: 'now' },
        { id: 'sec-cors-allowlist', title: 'Tighten CORS allowlist for bridge and hub UI', area: 'security', priority: 'now' },
        { id: 'obs-prom-metrics', title: 'Expose Prometheus /metrics for hub and bridge (reqs, channels, heartbeats, 429s)', area: 'observability', priority: 'now' },
        { id: 'ci-cd', title: 'Add CI: lint, typecheck, tests; add CD for deploy assets (systemd, Nginx)', area: 'ci-cd', priority: 'now' },
        { id: 'tests-integration', title: 'Write integration tests for hub routing and bridge rate limiting', area: 'testing', priority: 'now' },
        { id: 'docs-ops', title: 'Add operations runbook: health endpoints, envs, service management', area: 'docs', priority: 'next' },
        { id: 'ui-heartbeat', title: 'UI: heartbeat badges and channel counters view', area: 'ui', priority: 'next' },
        { id: 'auth-rotation', title: 'Key rotation procedure and secret management guidance', area: 'security', priority: 'next' },
        { id: 'perf-backpressure', title: 'Backpressure and message size limits in hub', area: 'performance', priority: 'later' },
    ];
}

function enrichWithTrie(tasks, trieData) {
    if (!trieData) return tasks;
    // Lightweight heuristic enrichment: tag tasks that appear in trie concepts
    try {
        const text = JSON.stringify(trieData).toLowerCase();
        return tasks.map((t) => {
            const tags = [];
            if (text.includes('jwt')) tags.push('jwt');
            if (text.includes('prometheus') || text.includes('observability')) tags.push('observability');
            if (text.includes('rate limit')) tags.push('rate-limit');
            if (text.includes('codacy') || text.includes('quality')) tags.push('code-quality');
            return { ...t, tags };
        });
    } catch {
        return tasks;
    }
}

function categorize(tasks) {
    const buckets = { now: [], next: [], later: [] };
    for (const t of tasks) {
        const p = ['now', 'next', 'later'].includes(t.priority) ? t.priority : 'next';
        buckets[p].push(t);
    }
    return buckets;
}

function writeOutputs(plan) {
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const jsonPath = path.join(REPORTS_DIR, 'production-readiness-plan.json');
    fs.writeFileSync(jsonPath, JSON.stringify(plan, null, 2));
    const mdPath = path.join(OUTPUT_DIR, 'PRODUCTION_READINESS_PLAN.md');
    const md = [
        `# Production Readiness Plan`,
        '',
        `Generated at: ${new Date().toISOString()}`,
        plan.trie?.path ? `Knowledge trie: ${plan.trie.path}` : '',
        '',
        '## Now',
        ...plan.now.map((t) => `- [ ] ${t.title} (${t.area}${t.tags?.length ? ', tags: ' + t.tags.join(', ') : ''})`),
        '',
        '## Next',
        ...plan.next.map((t) => `- [ ] ${t.title} (${t.area}${t.tags?.length ? ', tags: ' + t.tags.join(', ') : ''})`),
        '',
        '## Later',
        ...plan.later.map((t) => `- [ ] ${t.title} (${t.area}${t.tags?.length ? ', tags: ' + t.tags.join(', ') : ''})`),
        '',
        '---',
        '',
        'Notes:',
        '- Plan combines agent responses with bootstrap tasks and trie enrichment.',
    ].filter(Boolean).join('\n');
    fs.writeFileSync(mdPath, md, 'utf-8');
    console.log('[plan] wrote', mdPath, 'and', jsonPath);
    return { mdPath, jsonPath };
}

function requestEnvelope() {
    return {
        meta: {
            channel: 'u2a',
            type: 'request',
            topic: 'prod-readiness-plan',
            from: COPILOT_ID,
            ts: Date.now(),
        },
        payload: {
            ask: 'Provide your production readiness tasks: id, title, area, priority (now|next|later), optional tags',
        },
    };
}

async function main() {
    const store = new StateStore();
    await store.init(REDIS_URL);

    const trie = loadKnowledgeTrie();
    const aggregate = new Map(); // id -> task
    const agents = new Map(); // agentId -> meta

    let ws;
    let connected = false;
    try {
        ws = new WebSocket(HUB_WS_URL);
    } catch (e) {
        console.warn('[ws] cannot initialize:', e.message);
    }

    const kickoff = () => {
        const env = requestEnvelope();
        try {
            ws.send(JSON.stringify(env));
            console.log('[ws] requested tasks from agents');
        } catch (e) {
            console.warn('[ws] send failed:', e.message);
        }
    };

    setTimeout(async () => {
        console.log(`[plan] collection window ended (${COLLECT_WINDOW_MS}ms)`);
        const bootstrap = seedBootstrapTasks();
        // Merge bootstrap into aggregate (avoid duplicates by id)
        for (const t of bootstrap) aggregate.set(t.id, t);
        const tasks = Array.from(aggregate.values());
        const enriched = enrichWithTrie(tasks, trie.data);
        const buckets = categorize(enriched);
        const plan = { trie: { path: trie.path }, agents: Array.from(agents.keys()), ...buckets };
        await store.setJSON('prod:plan', plan);
        writeOutputs(plan);
        await store.close();
        if (connected) ws.close();
        process.exit(0);
    }, COLLECT_WINDOW_MS);

    const handleMessage = async (raw) => {
        try {
            const msg = JSON.parse(raw);
            const meta = msg.meta || {};
            const payload = msg.payload || {};
            if (meta.channel === 'a2u' && (meta.topic === 'prod-readiness-plan' || payload.topic === 'prod-readiness-plan')) {
                const from = meta.from || 'unknown-agent';
                agents.set(from, { lastSeen: Date.now() });
                const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
                for (const t of tasks) {
                    if (!t || !t.id || !t.title) continue;
                    aggregate.set(t.id, t);
                }
                await store.setJSON('prod:agents', Array.from(agents.keys()));
                await store.setJSON('prod:tasks', Array.from(aggregate.values()));
                console.log(`[collect] received ${tasks.length} tasks from ${from} (unique total: ${aggregate.size})`);
            }
        } catch (e) {
            // ignore parse errors
        }
    };

    if (ws) {
        ws.on('open', () => {
            connected = true;
            console.log('[ws] connected to hub:', HUB_WS_URL);
            // Announce presence
            const presence = {
                meta: { channel: 'u2a', type: 'presence', from: COPILOT_ID, ts: Date.now() },
                payload: { role: 'production-orchestrator' },
            };
            ws.send(JSON.stringify(presence));
            kickoff();
        });
        ws.on('message', handleMessage);
        ws.on('error', (err) => console.warn('[ws] error', err.message));
        ws.on('close', () => console.log('[ws] closed'));
    }

    // Offline mode if not connected within 2 seconds
    setTimeout(() => {
        if (!connected) {
            console.warn('[ws] offline mode: proceeding without hub responses');
            // Let the timer elapse and finalize with bootstrap + trie
        }
    }, 2000);
}

main().catch((e) => {
    console.error('[fatal]', e);
    process.exit(1);
});
