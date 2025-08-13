#!/usr/bin/env node
// Static server for Universe Graph
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 5175);

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

server.listen(PORT, () => console.log(`[universe-graph] http://localhost:${PORT}`));
