#!/usr/bin/env node
// Derive stateless identifiers from a harmonic joint (trits) for connectionless routing
// Outputs: QUIC CID (16 bytes), MAC-48 (locally administered), EUI-64, UUIDv4-styled, BLE manufacturer data

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function planCodeFor(planName) {
  if (!planName) return 33;
  if (/merkaba/i.test(planName)) return 125;
  if (/pentad/i.test(planName)) return 49;
  return 33;
}

function deriveBytes(len, seedBuf, labelBuf = Buffer.from('')) {
  const out = Buffer.alloc(len);
  let off = 0, counter = 0;
  while (off < len) {
    const block = crypto
      .createHash('sha256')
      .update(Buffer.from('CQE-STATELESS-ID'))
      .update(labelBuf)
      .update(seedBuf)
      .update(Buffer.from([counter++ & 0xff]))
      .digest();
    const take = Math.min(block.length, len - off);
    block.copy(out, off, 0, take);
    off += take;
  }
  return out;
}

function latestAxiom(distDir) {
  const dir = path.resolve(distDir || 'dist/axioms');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && f.startsWith('cqe-axiom-'))
    .map(f => path.join(dir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0] || null;
}

function toHex(buf){ return '0x' + Buffer.from(buf).toString('hex'); }

function makeQUICcid(seedBuf, planName, dim, len = 16) {
  const plan = planCodeFor(planName) & 0xff;
  const dimByte = (dim || 0) & 0xff;
  const core = deriveBytes(len, seedBuf, Buffer.from('quic-cid'));
  // Stamp header for routing (v=1, plan, dim, flags)
  core[0] = 0x01;       // version
  core[1] = plan;       // plan code
  core[2] = dimByte;    // dim low byte
  core[3] = 0x00;       // flags/reserved
  return core;
}

function makeMAC48(seedBuf) {
  const mac = deriveBytes(6, seedBuf, Buffer.from('mac48'));
  // Locally administered, unicast: set bit1 of first octet, clear bit0
  mac[0] = (mac[0] | 0x02) & 0xFE;
  return mac;
}

function makeEUI64(seedBuf) {
  const eui = deriveBytes(8, seedBuf, Buffer.from('eui64'));
  // Set locally administered in the U/L bit
  eui[0] = eui[0] | 0x02;
  return eui;
}

function makeUUIDv4(seedBuf) {
  const u = deriveBytes(16, seedBuf, Buffer.from('uuid'));
  u[6] = (u[6] & 0x0f) | 0x40; // version 4
  u[8] = (u[8] & 0x3f) | 0x80; // variant 10
  return u;
}

function makeBLEManufacturerData(seedBuf, planName, dim) {
  // 2 bytes company ID (0xFFFF test), 1 byte scheme code, 1 byte dim low, 1 byte len, up to 26 bytes payload
  const payload = deriveBytes(26, seedBuf, Buffer.from('ble-mfg'));
  const buf = Buffer.alloc(2 + 1 + 1 + 1 + payload.length);
  buf.writeUInt16LE(0xFFFF, 0); // test company ID
  buf[2] = planCodeFor(planName) & 0xff;
  buf[3] = (dim || 0) & 0xff;
  buf[4] = payload.length & 0xff;
  payload.copy(buf, 5);
  return buf;
}

function main(){
  // Args: --joint <tritsStr> or --from-axiom <path> or default to latest dist/axioms
  const args = process.argv.slice(2);
  let joint = null, axiomPath = null, planName = null, dim = null;
  for (let i=0;i<args.length;i++){
    const a = args[i];
    if (a === '--joint') joint = args[++i];
    else if (a === '--from-axiom') axiomPath = args[++i];
    else if (a === '--plan') planName = args[++i];
    else if (a === '--dim') dim = Number(args[++i]);
  }
  if (!joint) {
    const p = axiomPath || latestAxiom('dist/axioms');
    if (!p) {
      console.error('No joint provided and no axiom found. Use --joint or build an axiom first.');
      process.exit(2);
    }
    const ax = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!(ax && ax.harmonic_signature && ax.harmonic_signature.joint_trits)) {
      console.error('Axiom missing harmonic_signature.joint_trits');
      process.exit(2);
    }
    joint = ax.harmonic_signature.joint_trits;
    planName = planName || (ax.harmonic_signature && ax.harmonic_signature.scheme ? String(ax.harmonic_signature.scheme).replace(/^3psk-/, '') : null);
    dim = dim || (ax.tetrahedron && ax.tetrahedron.dim);
    axiomPath = p;
  }
  // Seed bytes from the joint trits string
  const seed = crypto.createHash('sha256').update(joint, 'utf8').digest();
  const quic = makeQUICcid(seed, planName, dim, 16);
  const mac48 = makeMAC48(seed);
  const eui64 = makeEUI64(seed);
  const uuid = makeUUIDv4(seed);
  const ble = makeBLEManufacturerData(seed, planName, dim);

  const out = {
    source: axiomPath ? path.basename(axiomPath) : '(cli)',
    plan: planName || null,
    dim: dim || null,
    joint_preview: joint.slice(0, 32) + '…',
    quic_cid16: toHex(quic),
    mac48: toHex(mac48),
    eui64: toHex(eui64),
    uuid_v4: toHex(uuid),
    ble_mfg: toHex(ble),
    notes: {
      mac48: 'Locally administered, unicast. Compact, non-invertible.',
      quic: 'CID embeds version/plan/dim for stateless routing. Length=16.',
      uuid_v4: 'Random-like; carries state via seeded bytes.',
      ble_mfg: 'Fits into ADV manufacturer data; test company ID 0xFFFF.'
    }
  };
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) main();
