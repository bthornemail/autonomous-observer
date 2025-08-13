#!/usr/bin/env node
// POST a small harmonic message to Harmonic Interface (default http://localhost:3000/api/harmonic)
import http from 'node:http';

const endpoint = process.env.HARMONIC_URL || 'http://localhost:3000/api/harmonic';
const argContentIdx = process.argv.indexOf('--content');
const customContent = argContentIdx > -1 ? process.argv[argContentIdx + 1] : (process.env.HARMONIC_MSG || 'ULP Copilot connectivity check');
const argSenderIdx = process.argv.indexOf('--sender');
const argReceiverIdx = process.argv.indexOf('--receiver');
const sender = argSenderIdx > -1 ? process.argv[argSenderIdx + 1] : (process.env.HARMONIC_SENDER || 'copilot_universe');
const receiver = argReceiverIdx > -1 ? process.argv[argReceiverIdx + 1] : (process.env.HARMONIC_RECEIVER || 'coordinator');

const payload = {
  sender,
  receiver,
  modality: 'consciousness',
  content: customContent,
  harmonic_signature: {
    pattern: 'tetrahedron',
    layers: 3,
    color_frequency: 42,
    sacred_ratio: 1.618,
  },
};

function postJSON(url, body) {
  return new Promise((resolve, reject) => {
    try {
      const { hostname, port, pathname } = new URL(url);
      const data = Buffer.from(JSON.stringify(body));
      const req = http.request({
        hostname,
        port: port || 80,
        path: pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      }, (res) => {
        let chunks = '';
        res.on('data', (d) => { chunks += d; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: chunks });
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

postJSON(endpoint, payload)
  .then((res) => {
    console.log('HTTP', res.statusCode);
    try { console.log(JSON.parse(res.body)); } catch { console.log(res.body.slice(0, 400)); }
  })
  .catch((e) => {
    console.error('send error:', e.message);
    process.exitCode = 1;
  });
