#!/usr/bin/env node

// Agent Hub: Web + WebSocket bridge for multi-agent communication and MCP integration
// - Serves a minimal UI for chat + media
// - Provides ws channels for: user<->hub, hub<->agents, agent<->agent
// - Simple message envelope with harmonicSignature for routing

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 8081;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Connection registries and lightweight observability
const clients = new Map(); // id -> ws
const agents = new Map(); // id -> ws
const clientMeta = new Map(); // id -> { connectedAt, lastSeen }
const agentMeta = new Map(); // id -> { connectedAt, lastSeen, lastHeartbeat }
const channelCounts = { a2a: 0, u2a: 0, a2u: 0 };
const metrics = { connections_total: 0, disconnects_total: 0, messages_total: 0 };

// Serve static UI
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/ui', express.static(path.join(__dirname, 'webui')));
app.get('/', (_req, res) => res.redirect('/ui'));
// Simple status for discovery
app.get('/status', (_req, res) => {
  res.json({
    clients: Array.from(clients.keys()),
    agents: Array.from(agents.keys()),
    counts: { clients: clients.size, agents: agents.size },
    metrics: {
      channels: channelCounts,
      agents: Array.from(agentMeta.entries()).map(([id, m]) => ({ id, lastSeen: m.lastSeen, lastHeartbeat: m.lastHeartbeat }))
    }
  });
});

// Prometheus metrics endpoint
app.get('/metrics', (_req, res) => {
  const lines = [];
  lines.push('# HELP hub_connections_total Total websocket connections opened');
  lines.push('# TYPE hub_connections_total counter');
  lines.push(`hub_connections_total ${metrics.connections_total}`);
  lines.push('# HELP hub_disconnects_total Total websocket connections closed');
  lines.push('# TYPE hub_disconnects_total counter');
  lines.push(`hub_disconnects_total ${metrics.disconnects_total}`);
  lines.push('# HELP hub_messages_total Total messages received');
  lines.push('# TYPE hub_messages_total counter');
  lines.push(`hub_messages_total ${metrics.messages_total}`);
  lines.push('# HELP hub_channel_messages_total Messages per channel');
  lines.push('# TYPE hub_channel_messages_total counter');
  lines.push(`hub_channel_messages_total{channel="a2a"} ${channelCounts.a2a}`);
  lines.push(`hub_channel_messages_total{channel="u2a"} ${channelCounts.u2a}`);
  lines.push(`hub_channel_messages_total{channel="a2u"} ${channelCounts.a2u}`);
  lines.push('# HELP hub_connected_clients Current connected clients');
  lines.push('# TYPE hub_connected_clients gauge');
  lines.push(`hub_connected_clients ${clients.size}`);
  lines.push('# HELP hub_connected_agents Current connected agents');
  lines.push('# TYPE hub_connected_agents gauge');
  lines.push(`hub_connected_agents ${agents.size}`);
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(lines.join('\n'));
});

// Health endpoints
app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.get('/readyz', (_req, res) => {
  // Consider ready if server is up; optionally require at least 1 listener
  const ready = true;
  res.status(ready ? 200 : 503).json({ ready });
});

// (moved) connection registries defined above

function send(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch { }
}

function broadcast(map, obj) {
  for (const [, ws] of map.entries()) {
    send(ws, obj);
  }
}

// Basic harmonic signature util (placeholder)
function harmonicSignature(payload) {
  const base = payload == null ? '' : payload;
  const str = typeof base === 'string' ? base : (() => { try { return JSON.stringify(base) || ''; } catch { return ''; } })();
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 131 + str.charCodeAt(i)) >>> 0;
  return 'hs-' + h.toString(16);
}

// Envelope schema
// {
//   role: 'user'|'agent'|'system',
//   from: string,
//   to?: string,
//   type: 'text'|'image'|'audio'|'video'|'web'|'tool'|'control',
//   content: any,
//   signature?: string,
//   meta?: { channel?: 'a2a'|'u2a'|'a2u', sessionId?: string }
// }

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.split('?')[1] || '');
  const id = params.get('id') || `conn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const kind = params.get('kind') || 'client'; // 'client' or 'agent'

  if (kind === 'agent') {
    agents.set(id, ws);
    agentMeta.set(id, { connectedAt: Date.now(), lastSeen: Date.now(), lastHeartbeat: undefined });
  } else {
    clients.set(id, ws);
    clientMeta.set(id, { connectedAt: Date.now(), lastSeen: Date.now() });
  }
  metrics.connections_total += 1;
  send(ws, { role: 'system', type: 'control', content: { connected: true, id, kind } });
  console.log(`[hub] ${kind} connected: ${id}`);

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }
    metrics.messages_total += 1;
    msg.signature = msg.signature || harmonicSignature(msg.content);
    msg.from = msg.from || id;
    // observability updates
    if (kind === 'agent') {
      const meta = agentMeta.get(id);
      if (meta) meta.lastSeen = Date.now();
    } else {
      const meta = clientMeta.get(id);
      if (meta) meta.lastSeen = Date.now();
    }
    const ch = msg.meta?.channel;
    if (ch && Object.prototype.hasOwnProperty.call(channelCounts, ch)) channelCounts[ch] += 1;
    if (msg.type === 'control' && msg.content && (msg.content.heartbeat || msg.content.type === 'heartbeat')) {
      const meta = agentMeta.get(id);
      if (meta) meta.lastHeartbeat = Date.now();
    }

    // Routing rules
    if (msg.meta?.channel === 'a2a' && msg.to) {
      const target = agents.get(msg.to);
      if (target) send(target, msg);
      return;
    }
    if (msg.meta?.channel === 'u2a') {
      // fanout to all agents or a specific one
      if (msg.to) {
        const target = agents.get(msg.to);
        if (target) send(target, msg);
      } else {
        broadcast(agents, msg);
      }
      return;
    }
    if (msg.meta?.channel === 'a2u') {
      // agent -> all clients or a specific one
      if (msg.to) {
        const target = clients.get(msg.to);
        if (target) send(target, msg);
      } else {
        broadcast(clients, msg);
      }
      return;
    }
    // default echo back
    send(ws, { role: 'system', type: 'control', content: { ack: true, signature: msg.signature } });
  });

  ws.on('close', () => {
    if (kind === 'agent') {
      agents.delete(id);
      agentMeta.delete(id);
    } else {
      clients.delete(id);
      clientMeta.delete(id);
    }
    metrics.disconnects_total += 1;
    console.log(`[hub] ${kind} disconnected: ${id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[hub] listening on http://localhost:${PORT} (UI at /ui)`);
});
