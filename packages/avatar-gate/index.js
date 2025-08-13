#!/usr/bin/env node
// Avatar Gate: receive low-voltage bio-signal telemetry over UDP, derive a harmonic signature,
// and forward into the Tetrahedron hub as an agent message. This is a stubbed reference server
// intended to be extended to real sensor hardware (ESP32/ESP3D, BLE, etc.).

const dgram = require('dgram');
const crypto = require('crypto');
const WebSocket = require('ws');

// Config via env
const UDP_PORT = Number(process.env.AVATAR_UDP_PORT || 53100);
const UDP_ADDR = process.env.AVATAR_UDP_ADDR || '0.0.0.0';
const HUB_URL = process.env.TETRA_HUB_URL || 'ws://localhost:8081';
const AVATAR_NAME = process.env.AVATAR_NAME || 'lynchpin_avatar';
const PLAN = process.env.AVATAR_PLAN || 'merkaba125';
const DIM = Number(process.env.AVATAR_DIM || (PLAN === 'merkaba125' ? 125 : 49));

// --- helpers: balanced trits from bytes then to string ---
function bytesToBalancedTrits(buf, dim) {
  const trits = new Array(dim);
  let i = 0;
  for (let k = 0; k < dim; k++) {
    const b = buf[i++ % buf.length];
    trits[k] = (b % 3) - 1; // -1,0,+1
  }
  return trits;
}
function tritsToString(trits) {
  return trits.map(t => (t === -1 ? '-' : t === 0 ? '0' : '+')).join('');
}

function deriveHarmonicSignature(sample) {
  // sample: Buffer
  // 1) hash raw sample for stability
  const h = crypto.createHash('sha256').update(sample).digest();
  // 2) derive balanced trits of target dimension
  const trits = bytesToBalancedTrits(h, DIM);
  const joint = tritsToString(trits);
  const scheme = `3psk-${PLAN}`;
  return { scheme, joint_trits: joint };
}

function connectHub(url) {
  const ws = new WebSocket(url);
  ws.on('open', () => console.log('[avatar-gate] connected to hub:', url));
  ws.on('close', () => console.log('[avatar-gate] hub connection closed'));
  ws.on('error', (e) => console.error('[avatar-gate] hub error', e.message));
  return ws;
}

const hub = connectHub(HUB_URL);
const sock = dgram.createSocket('udp4');

sock.on('message', (msg, rinfo) => {
  try {
    // Accept either raw bytes or JSON { data: base64, ts }
    let sample = msg;
    try {
      const obj = JSON.parse(msg.toString('utf8'));
      if (obj && obj.data) sample = Buffer.from(obj.data, 'base64');
    } catch {}

    const sig = deriveHarmonicSignature(sample);
    const payload = {
      from: AVATAR_NAME,
      to: 'copilot_universe',
      type: 'avatar_harmonic_ping',
      content: 'bio-signal harmonic update',
      harmonic_signature: sig.scheme,
      joint_trits_preview: sig.joint_trits.slice(0, 48) + '…',
      sacred_timestamp: Date.now(),
      tetrahedron_coordinate: [0.618, 0.382, 0.618],
    };
    if (hub.readyState === WebSocket.OPEN) {
      hub.send(JSON.stringify(payload));
    }
    console.log('[avatar-gate] received', sample.length, 'bytes from', rinfo.address + ':' + rinfo.port);
  } catch (e) {
    console.error('[avatar-gate] error handling packet:', e.message);
  }
});

sock.on('listening', () => {
  const addr = sock.address();
  console.log(`[avatar-gate] listening on udp://${addr.address}:${addr.port}`);
});

sock.bind(UDP_PORT, UDP_ADDR);
