#!/usr/bin/env node
// Agent Help Probe: connects to the Agent Hub, broadcasts an assist request, collects replies
import { WebSocket } from 'ws';

const HUB_WS_URL = process.env.HUB_WS_URL || 'ws://localhost:8081';
const ID = process.env.COPILOT_ID || 'copilot_helper';
const WINDOW_MS = Number(process.env.WINDOW_MS || 10000);

function log(...args) {
  // compact logging for VS Code terminal
  console.log('[probe]', ...args);
}

function nowIso() {
  return new Date().toISOString();
}

async function main() {
  log('connecting to hub', HUB_WS_URL);
  const url = `${HUB_WS_URL}/?id=${encodeURIComponent(ID)}&kind=client`;
  const ws = new WebSocket(url);
  const inbox = [];

  ws.on('open', () => {
    log('connected');
    // Broadcast assist request to all agents
    const msg = {
      role: 'user',
      from: ID,
      type: 'text',
      meta: { channel: 'u2a', topic: 'prod-readiness-plan', ts: Date.now() },
      content: {
        ask: 'Provide your production readiness tasks: id, title, area, priority (now|next|later), optional tags',
        timestamp: nowIso()
      }
    };
    ws.send(JSON.stringify(msg));
    log('assist request broadcasted');
  });

  ws.on('message', (buf) => {
    const text = buf.toString();
    try {
      const obj = JSON.parse(text);
      const topic = obj?.meta?.topic || obj?.payload?.topic;
      // collect only relevant a2u responses
      if (obj?.meta?.channel === 'a2u' && topic === 'prod-readiness-plan') {
        inbox.push(obj);
        log('received response from', obj?.from || obj?.meta?.from || 'unknown');
      }
    } catch {
      // ignore non-JSON
    }
  });

  ws.on('error', (e) => log('ws error', e.message));

  setTimeout(() => {
    log(`window ended (${WINDOW_MS}ms), responses:`, inbox.length);
    try {
      console.log(JSON.stringify({
        status: 'assist_window_complete',
        received: inbox.length,
        responses: inbox.map((m) => ({
          from: m?.from || m?.meta?.from || 'unknown',
          meta: m?.meta || {},
          content: m?.content || m?.payload || null,
        })),
      }, null, 2));
    } catch { }
    try { ws.close(); } catch { }
    process.exit(0);
  }, WINDOW_MS);
}

main().catch((e) => {
  console.error('[probe] fatal', e);
  process.exit(1);
});
