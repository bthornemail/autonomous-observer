#!/usr/bin/env node
// Minimal WS ping to Claude Coordination Hub (default ws://localhost:8081)
import WebSocket from 'ws';

const url = process.env.CLAUDE_HUB_URL || 'ws://localhost:8081';
const cIdx = process.argv.indexOf('--content');
const tIdx = process.argv.indexOf('--to');
const content = cIdx > -1 ? process.argv[cIdx + 1] : (process.env.HUB_MSG || 'ping from copilot');
const target = tIdx > -1 ? process.argv[tIdx + 1] : (process.env.HUB_TARGET || 'broadcast');

const msg = {
  type: 'human_message',
  sender: 'copilot_universe',
  receiver: target,
  content,
  harmonic_signature: 'air_octahedron_copilot_universe',
  timestamp: Date.now(),
};

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log(`connected to ${url}`);
  ws.send(JSON.stringify(msg));
});

ws.on('message', (data) => {
  try {
    const payload = JSON.parse(data);
  console.log('recv', payload.type || 'message', 'from', payload.sender || 'unknown');
  } catch {
    console.log('recv raw', String(data).slice(0, 200));
  }
  // close after first response
  try { ws.close(); } catch {}
});

ws.on('error', (e) => {
  console.error('ws error:', e.message);
});

ws.on('close', () => {
  console.log('closed');
});
