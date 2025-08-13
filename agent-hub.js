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

const PORT = process.env.PORT || 4077;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

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
    counts: { clients: clients.size, agents: agents.size }
  });
});

// Connection registries
const clients = new Map(); // id -> ws
const agents = new Map(); // id -> ws

function send(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch {}
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

  if (kind === 'agent') agents.set(id, ws); else clients.set(id, ws);
  send(ws, { role: 'system', type: 'control', content: { connected: true, id, kind } });
  console.log(`[hub] ${kind} connected: ${id}`);

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }
    msg.signature = msg.signature || harmonicSignature(msg.content);
    msg.from = msg.from || id;

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
    if (kind === 'agent') agents.delete(id); else clients.delete(id);
    console.log(`[hub] ${kind} disconnected: ${id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[hub] listening on http://localhost:${PORT} (UI at /ui)`);
});
