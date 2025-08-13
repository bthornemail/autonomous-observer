#!/usr/bin/env node
// UBHP/CUE Bridge: HTTP adapter that accepts CUE/UBHP-shaped messages and forwards to the Agent Hub (WS)
import express from 'express';
import WebSocket from 'ws';

const PORT = process.env.PORT || 4080;
const HUB_URL = process.env.HUB_URL || 'ws://localhost:8081'; // coordination hub
const FORWARD_URL = process.env.CUE_FORWARD_URL || process.env.HARMONIC_URL; // optional, e.g. http://localhost:3000/api/harmonic

const app = express();
app.use(express.json({ limit: '1mb' }));

let hub;
let ready = false;

function connectHub() {
  try {
    hub = new WebSocket(HUB_URL);
    hub.on('open', () => { ready = true; console.log(`[bridge] connected to hub ${HUB_URL}`); });
    hub.on('close', () => { ready = false; setTimeout(connectHub, 1000); });
    hub.on('error', () => {});
  } catch {}
}
connectHub();

function sendToHub(msg) {
  if (!ready) throw new Error('hub not connected');
  hub.send(JSON.stringify(msg));
}

app.get('/status', (_req, res) => {
  res.json({ status: 'ok', hub: { url: HUB_URL, connected: ready }, forward: FORWARD_URL || null });
});

// Accept a UBHP/CUE-like envelope and forward to hub
// Body example: { sender, receiver, modality, content, harmonic_signature }
app.post('/ubhp/send', async (req, res) => {
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
