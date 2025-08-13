#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'public');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0] || '/');
  let filePath = path.join(root, urlPath);
  if (urlPath === '/' || urlPath === '') filePath = path.join(root, 'index.html');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === '.html' ? 'text/html' : ext === '.json' ? 'application/json' : 'text/plain';
    res.statusCode = 200;
    res.setHeader('Content-Type', type + '; charset=utf-8');
    res.end(data);
  });
});

server.listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
