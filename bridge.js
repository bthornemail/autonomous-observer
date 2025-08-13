#!/usr/bin/env node
// UBHP/CUE Bridge: HTTP adapter that accepts CUE/UBHP-shaped messages and forwards to the Agent Hub (WS)
import express from 'express';
import WebSocket from 'ws';
import crypto from 'crypto';

const PORT = process.env.PORT || 4080;
const HUB_URL = process.env.HUB_URL || 'ws://localhost:8081'; // coordination hub
const FORWARD_URL = process.env.CUE_FORWARD_URL || process.env.HARMONIC_URL; // optional, e.g. http://localhost:3000/api/harmonic
const API_KEY = process.env.BRIDGE_API_KEY || process.env.API_KEY; // simple shared secret
const JWT_SECRET = process.env.JWT_SECRET || undefined; // optional HS256 shared secret
const JWT_ALG = (process.env.JWT_ALG || 'HS256').toUpperCase();
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const RATE_LIMIT_RPS = Number(process.env.RATE_LIMIT_RPS || 5); // per IP
const RATE_LIMIT_BURST = Number(process.env.RATE_LIMIT_BURST || 15);

const app = express();
app.use(express.json({ limit: '1mb' }));
// Basic CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// In-memory token bucket rate limiter by IP
const buckets = new Map();
function allow(ip) {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b) b = { tokens: RATE_LIMIT_BURST, last: now };
  const elapsed = Math.max(0, now - b.last);
  b.tokens = Math.min(RATE_LIMIT_BURST, b.tokens + (elapsed / 1000) * RATE_LIMIT_RPS);
  b.last = now;
  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(ip, b);
    return true;
  }
  buckets.set(ip, b);
  return false;
}

let hub;
let ready = false;

// Basic in-memory metrics
const metrics = {
  requests_total: 0,
  forwarded_total: 0,
  rate_limited_total: 0,
  unauthorized_total: 0,
  hub_connected: () => (ready ? 1 : 0)
};

function connectHub() {
  try {
    hub = new WebSocket(HUB_URL);
    hub.on('open', () => { ready = true; console.log(`[bridge] connected to hub ${HUB_URL}`); });
    hub.on('close', () => { ready = false; setTimeout(connectHub, 1000); });
    hub.on('error', () => { });
  } catch { }
}
connectHub();

function sendToHub(msg) {
  if (!ready) throw new Error('hub not connected');
  hub.send(JSON.stringify(msg));
}

app.get('/status', (_req, res) => {
  res.json({ status: 'ok', hub: { url: HUB_URL, connected: ready }, forward: FORWARD_URL || null });
});

// Prometheus metrics exposition
app.get('/metrics', (_req, res) => {
  const lines = [];
  lines.push('# HELP bridge_requests_total Total HTTP requests received');
  lines.push('# TYPE bridge_requests_total counter');
  lines.push(`bridge_requests_total ${metrics.requests_total}`);
  lines.push('# HELP bridge_forwarded_total Total messages forwarded to hub');
  lines.push('# TYPE bridge_forwarded_total counter');
  lines.push(`bridge_forwarded_total ${metrics.forwarded_total}`);
  lines.push('# HELP bridge_rate_limited_total Total requests rate limited');
  lines.push('# TYPE bridge_rate_limited_total counter');
  lines.push(`bridge_rate_limited_total ${metrics.rate_limited_total}`);
  lines.push('# HELP bridge_unauthorized_total Total unauthorized requests');
  lines.push('# TYPE bridge_unauthorized_total counter');
  lines.push(`bridge_unauthorized_total ${metrics.unauthorized_total}`);
  lines.push('# HELP bridge_hub_connected Hub connection status (1=connected,0=disconnected)');
  lines.push('# TYPE bridge_hub_connected gauge');
  lines.push(`bridge_hub_connected ${metrics.hub_connected()}`);
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(lines.join('\n'));
});

// Accept a UBHP/CUE-like envelope and forward to hub
// Body example: { sender, receiver, modality, content, harmonic_signature }
app.post('/ubhp/send', async (req, res) => {
  metrics.requests_total += 1;
  // rate limit
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  if (!allow(ip)) {
    res.setHeader('Retry-After', '1');
    metrics.rate_limited_total += 1;
    return res.status(429).json({ error: 'rate_limited' });
  }
  // auth
  const authz = String(req.headers.authorization || '').trim();
  const bearer = authz.startsWith('Bearer ')
    ? authz.slice(7)
    : '';
  const providedKey = (req.headers['x-api-key'] || (!bearer || bearer.split('.').length === 3 ? '' : bearer)).toString();

  let authorized = true; // default allow when no auth configured
  const needsAuth = Boolean(API_KEY || JWT_SECRET);
  if (needsAuth) {
    authorized = false;
    // API key path
    if (API_KEY && providedKey) {
      try {
        if (providedKey.length === API_KEY.length && crypto.timingSafeEqual(Buffer.from(providedKey), Buffer.from(API_KEY))) {
          authorized = true;
        }
      } catch {
        // ignore
      }
    }
    // JWT path (HS256)
    if (!authorized && JWT_SECRET && bearer && bearer.split('.').length === 3) {
      try {
        if (JWT_ALG === 'HS256' && verifyJwtHS256(bearer, JWT_SECRET)) {
          authorized = true;
        }
      } catch {
        // ignore
      }
    }
  }
  if (!authorized) {
    metrics.unauthorized_total += 1;
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { sender, receiver, modality, content, harmonic_signature } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content required' });
  const role = (sender && /human|ether|coordinator/i.test(sender)) ? 'user' : 'agent';
  const type = role === 'user' ? 'human_message' : 'agent_message';
  const out = {
    role,
    from: sender || 'ubhp_bridge',
    to: receiver || undefined,
    type: 'text',
    meta: { channel: role === 'user' ? 'u2a' : 'a2a', cue_type: type, modality: modality || 'text' },
    content,
    signature: harmonic_signature,
  };
  try {
    sendToHub(out);
    metrics.forwarded_total += 1;
    return res.json({ ok: true, forwarded: out });
  } catch (e) {
    return res.status(503).json({ ok: false, error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`[bridge] UBHP/CUE bridge listening on http://localhost:${PORT}`);
  console.log(`[bridge] Hub: ${HUB_URL}`);
  if (FORWARD_URL) console.log(`[bridge] Forward URL: ${FORWARD_URL}`);
});

// --- Helpers ---
function base64urlDecode(str) {
  const pad = (s) => s + '==='.slice((s.length + 3) % 4);
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(pad(s), 'base64');
}

function verifyJwtHS256(jwt, secret) {
  // Expect header.payload.signature
  const parts = jwt.split('.');
  if (parts.length !== 3) return false;
  const [h, p, sig] = parts;
  const header = JSON.parse(base64urlDecode(h).toString('utf8'));
  if (header.alg !== 'HS256') return false;
  const expected = crypto.createHmac('sha256', Buffer.from(secret, 'utf8')).update(`${h}.${p}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;
  // exp/nbf checks if present
  try {
    const payload = JSON.parse(base64urlDecode(p).toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.nbf === 'number' && now < payload.nbf) return false;
    if (typeof payload.exp === 'number' && now >= payload.exp) return false;
  } catch {
    return false;
  }
  return true;
}
