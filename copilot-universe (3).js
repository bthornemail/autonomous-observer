#!/usr/bin/env node
'use strict';
/**
 * Copilot Universe (Coordinator)
 * - Connects to the Agent Hub via WebSocket
 * - Announces presence to UI and agents
 * - Requests "top 3 tasks" from each agent to refine data/systems
 * - Aggregates replies for a short window and broadcasts a concise refinement plan
 */

const WebSocket = require('ws');
const axios = require('axios');

const HUB_HTTP = process.env.HUB_HTTP_URL || 'http://localhost:8081';
const HUB_WS = process.env.HUB_WS_URL || 'ws://localhost:8081';
const ID = process.env.COPILOT_ID || 'copilot_universe';
const REFINE_WINDOW_MS = Number(process.env.REFINE_WINDOW_MS || 8000);

async function getStatus() {
  try {
    const res = await axios.get(`${HUB_HTTP}/status`, { headers: { accept: 'application/json' }, timeout: 2500 });
    return res.data;
  } catch (_) {
    return null;
  }
}

function send(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch { }
}

function presenceForClients() {
  return {
    role: 'agent',
    from: ID,
    type: 'text',
    meta: { channel: 'a2u' },
    content: {
      intent: 'presence',
      id: ID,
      message: 'GitHub Copilot online: coordinating refinement tasks. Reply here to guide priorities.'
    }
  };
}

function introForAgents(targetId) {
  return {
    role: 'agent',
    from: ID,
    to: targetId,
    type: 'text',
    meta: { channel: targetId ? 'a2a' : 'u2a' },
    content: {
      intent: 'intro',
      message: 'Hi—this is GitHub Copilot. What call sign should I use for you? I\'m coordinating a refinement sweep.'
    }
  };
}

function taskRequest(targetId) {
  return {
    role: 'agent',
    from: ID,
    to: targetId,
    type: 'text',
    meta: { channel: targetId ? 'a2a' : 'u2a' },
    content: {
      intent: 'task_request',
      message: 'Please provide your top 3 tasks to refine data and communication flows. Prefer JSON with { tasks: [{ title, why, owner?, effort?: "S/M/L" }] }.'
    }
  };
}

function refinementPlanMessage(plan, channel = 'a2a') {
  return {
    role: 'agent',
    from: ID,
    type: 'text',
    meta: { channel },
    content: {
      intent: 'refinement_plan',
      plan
    }
  };
}

function normalizeTasksFromContent(content) {
  // Accept a variety of shapes and try to coerce to [{ title, why, owner, effort }]
  try {
    if (!content) return [];
    if (Array.isArray(content)) {
      return content.map(x => (typeof x === 'string' ? { title: x } : x)).filter(Boolean);
    }
    if (typeof content === 'string') {
      // Try JSON; otherwise split simple bullets/lines
      try { const obj = JSON.parse(content); return normalizeTasksFromContent(obj.tasks || obj); } catch { }
      return content
        .split(/\r?\n/)
        .map(l => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
        .map(title => ({ title }));
    }
    if (typeof content === 'object') {
      if (Array.isArray(content.tasks)) return normalizeTasksFromContent(content.tasks);
      if (content.task || content.title) return [{ title: content.title || content.task, why: content.why, owner: content.owner, effort: content.effort }];
    }
  } catch { }
  return [];
}

function makePlan(sources) {
  // sources: [{ from, tasks: [...] }]
  const seen = new Set();
  const merged = [];
  for (const src of sources) {
    for (const t of src.tasks) {
      const key = (t.title || '').toLowerCase().trim();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ ...t, proposedOwner: t.owner || src.from });
    }
  }

  // Simple heuristic prioritization
  const buckets = { now: [], next: [], later: [] };
  for (const t of merged) {
    const title = (t.title || '').toLowerCase();
    const effort = (t.effort || '').toUpperCase();
    const small = effort === 'S' || /quick|small|minor|lint|format/.test(title);
    if (/hub|websocket|status|heartbeat|sync|bridge/.test(title)) buckets.now.push(t);
    else if (/index|vector|chunk|embed|dedup|schema|unify|normalize|redis/.test(title)) buckets.now.push(t);
    else if (/docs|readme|guide|how to|ui/.test(title)) buckets.next.push(t);
    else if (/test|coverage|ci|codacy|quality/.test(title)) buckets.next.push(t);
    else if (/deploy|publish|release|package/.test(title)) buckets.later.push(t);
    else if (small) buckets.now.push(t);
    else buckets.next.push(t);
  }

  const plan = {
    generatedBy: ID,
    generatedAt: new Date().toISOString(),
    windowMs: REFINE_WINDOW_MS,
    summary: `Aggregated ${merged.length} unique tasks from ${sources.length} sources. Prioritized into phases: now/next/later.`,
    phases: {
      now: buckets.now.slice(0, 7),
      next: buckets.next.slice(0, 10),
      later: buckets.later.slice(0, 10)
    }
  };
  return plan;
}

async function main() {
  const status = await getStatus();
  const knownAgents = Array.isArray(status?.agents) ? status.agents : [];
  const likelyTargets = knownAgents.filter(id => /claude|ollama|copilot|observer|hub/i.test(String(id)));

  const ws = new WebSocket(`${HUB_WS}/?id=${encodeURIComponent(ID)}&kind=agent`);
  let isOpen = false;
  let signoffSent = false;
  const collected = []; // { from, tasks: [...] }
  let finalizeTimer = null;

  function signoff(reason = 'shutdown') {
    if (!isOpen || signoffSent) return;
    send(ws, { role: 'agent', from: ID, type: 'control', meta: { channel: 'a2u' }, content: `GitHub Copilot signing off (${reason})` });
    signoffSent = true;
  }

  function scheduleFinalize() {
    if (finalizeTimer) return;
    finalizeTimer = setTimeout(() => {
      const plan = makePlan(collected);
      // Broadcast plan to agents and mirror to UI
      send(ws, refinementPlanMessage(plan, 'a2a'));
      send(ws, refinementPlanMessage(plan, 'a2u'));
    }, REFINE_WINDOW_MS);
  }

  ws.on('open', () => {
    isOpen = true;
    // Presence announcements
    send(ws, presenceForClients());
    if (likelyTargets.length > 0) {
      for (const target of likelyTargets) send(ws, introForAgents(target));
    } else {
      send(ws, introForAgents());
    }

    // Task request (targeted and broadcast)
    if (likelyTargets.length > 0) {
      for (const target of likelyTargets) send(ws, taskRequest(target));
    }
    send(ws, taskRequest());

    scheduleFinalize();
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(String(data));
      if (msg && msg.role === 'agent') {
        const c = msg.content;
        const intent = (c?.intent || '').toLowerCase();
        if (intent === 'task_suggestion' || intent === 'task_list' || intent === 'tasks' || intent === 'refinement_tasks') {
          const tasks = normalizeTasksFromContent(c?.tasks ?? c);
          if (tasks.length > 0) {
            collected.push({ from: msg.from || 'unknown', tasks });
            scheduleFinalize();
          }
        }
      }
    } catch {
      // ignore non-JSON chatter
    }
  });

  ws.on('close', () => process.exit(0));
  ws.on('error', (e) => { console.error('[copilot-universe] ws error:', e.message); process.exit(1); });

  process.on('SIGINT', () => { signoff('SIGINT'); try { ws.close(); } catch { } setTimeout(() => process.exit(0), 150); });
  process.on('SIGTERM', () => { signoff('SIGTERM'); try { ws.close(); } catch { } setTimeout(() => process.exit(0), 150); });

  // Exit quickly if hub is unreachable
  setTimeout(() => {
    if (!isOpen) {
      console.error('[copilot-universe] hub not reachable, exiting');
      try { ws.terminate(); } catch { }
      process.exit(2);
    }
  }, 4000);
}

main();

