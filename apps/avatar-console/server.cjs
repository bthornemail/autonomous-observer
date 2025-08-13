#!/usr/bin/env node
// Minimal static file server + WS relay for Avatar Console
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = Number(process.env.PORT || 5174);
const HUB_URL = process.env.TETRA_HUB_URL || 'ws://localhost:8081';

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let f = 'index.html';
  if (req.url && req.url !== '/') f = req.url.slice(1);
  const file = path.join(__dirname, 'static', f);
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
  fs.createReadStream(file).pipe(res);
});

const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const c of clients) if (c.readyState === 1) c.send(msg);
}

// Bridge from hub → browser clients (read-only for now; browser sends commands back)
const hub = new WebSocket(HUB_URL);

hub.on('open', () => console.log('[console] connected to hub:', HUB_URL));

hub.on('message', (data) => {
  try {
    const obj = JSON.parse(data.toString());
    // simple pass-through; UI will filter by type
    broadcast({ kind: 'hub', payload: obj });
  } catch {}
});

hub.on('error', (e) => console.error('[console] hub error', e.message));

server.listen(PORT, () => console.log(`[console] http://localhost:${PORT}`));
