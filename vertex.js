#!/usr/bin/env node
/**
 * Copilot Vertex client
 * Connects to the Agent Hub and sends/receives messages with a fixed id.
 */
import WebSocket from 'ws';

const HUB_WS = process.env.HUB_WS_URL || 'ws://localhost:8081';
const ID = process.env.COPILOT_ID || 'copilot_universe_vertex';
const HEARTBEAT_MS = Math.max(1000, parseInt(process.env.HEARTBEAT_MS || '30000', 10) || 30000);

const url = `${HUB_WS}/?id=${encodeURIComponent(ID)}&kind=agent`;
const ws = new WebSocket(url);
let heartbeatTimer = null;

ws.on('open', () => {
  console.log(`[copilot] connected to ${HUB_WS} as ${ID}`);
  const hello = { role: 'agent', from: ID, type: 'text', content: 'Copilot vertex online', meta: { channel: 'a2u' } };
  ws.send(JSON.stringify(hello));

  // Heartbeat to keep presence visible and provide a lightweight liveness signal
  try { if (heartbeatTimer) clearInterval(heartbeatTimer); } catch { }
  heartbeatTimer = setInterval(() => {
    try {
      const hb = { role: 'agent', from: ID, type: 'control', meta: { channel: 'a2u' }, content: { intent: 'heartbeat', id: ID, ts: new Date().toISOString() } };
      ws.send(JSON.stringify(hb));
    } catch { }
  }, HEARTBEAT_MS);
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(String(data));
    console.log('[copilot] recv', { from: msg?.from, meta: msg?.meta, type: msg?.type });
    const meta = msg?.meta || {}; const payload = msg?.payload || msg?.content || {};
    const isProdPlanReq = (meta.channel === 'u2a') && (meta.topic === 'prod-readiness-plan' || /production readiness tasks/i.test(String(payload.ask || payload.message || '')));
    if (isProdPlanReq) {
      const tasks = [
        { id: 'vertex-heartbeat-config', title: 'Document and parameterize heartbeat interval (HEARTBEAT_MS) per environment', area: 'ops', priority: 'now', tags: ['android', 'termux'] },
        { id: 'vertex-restart-policy', title: 'Ensure supervisor (systemd/Termux) restart policy with jitter and backoff', area: 'reliability', priority: 'now' },
        { id: 'vertex-connectivity-watch', title: 'Add basic connectivity watchdog and exponential reconnect', area: 'reliability', priority: 'next' },
        { id: 'vertex-logging', title: 'Unify minimal JSON logs for heartbeats/events', area: 'observability', priority: 'next' }
      ];
      const resp = { meta: { channel: 'a2u', type: 'response', topic: 'prod-readiness-plan', from: ID, ts: Date.now() }, payload: { tasks } };
      try { ws.send(JSON.stringify(resp)); } catch { }
    }
  } catch { console.log('[copilot] recv', String(data)); }
});

ws.on('close', () => {
  console.log('[copilot] disconnected');
  try { if (heartbeatTimer) clearInterval(heartbeatTimer); } catch { }
  // Exit to allow a supervisor script to restart us (useful on Termux)
  process.exit(2);
});
ws.on('error', (e) => {
  console.error('[copilot] error', e.message);
  try { if (heartbeatTimer) clearInterval(heartbeatTimer); } catch { }
  process.exit(1);
});

// Graceful termination
process.on('SIGINT', () => { try { if (heartbeatTimer) clearInterval(heartbeatTimer); ws.close(); } catch { }; setTimeout(() => process.exit(0), 100); });
process.on('SIGTERM', () => { try { if (heartbeatTimer) clearInterval(heartbeatTimer); ws.close(); } catch { }; setTimeout(() => process.exit(0), 100); });
