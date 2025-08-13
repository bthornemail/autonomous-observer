#!/usr/bin/env node
// Runs both CQE smokes and signs an axiom JSON to dist/axioms
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function run(cmd, opts={}) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], ...opts }).toString();
}

// Deterministic 3-PSK trit derivation from content digest and a label
function deriveTritsFromDigest(digestBuf, dim, labelBuf) {
  const trits = new Array(dim);
  let counter = 0;
  let filled = 0;
  // Mix inputs for stream expansion
  const seed = Buffer.concat([Buffer.from('CQE-HARMONIC'), labelBuf, digestBuf]);
  while (filled < dim) {
    const block = crypto
      .createHash('sha256')
      .update(seed)
      .update(Buffer.from([counter++ & 0xff]))
      .digest();
    for (let j = 0; j < block.length && filled < dim; j++) {
      const v = block[j] % 3; // 0,1,2
      trits[filled++] = v - 1; // -1,0,+1
    }
  }
  return trits;
}

function tritsToString(trits) {
  return trits.map(t => (t === -1 ? '-' : t === 0 ? '0' : '+')).join('');
}

function makeHarmonicRefs({ planName, dim, digestHex }) {
  const digestBuf = Buffer.from(digestHex, 'hex');
  const refs = ['A', 'B'].map(lbl => {
    const labelBuf = Buffer.from(lbl + ':' + planName);
    const trits = deriveTritsFromDigest(digestBuf, dim, labelBuf);
    const tritStr = tritsToString(trits);
    const hrid = crypto
      .createHash('sha256')
      .update(Buffer.from(tritStr, 'utf8'))
      .update(labelBuf)
      .digest('hex');
    return {
      label: lbl,
      plan: planName,
      dim,
      psk: '3-PSK',
      trits: tritStr,
      hrid,
    };
  });
  // Combine trits via mod-3 to form the joint trits (primary identity for wallet signing)
  const a = Array.from(refs[0].trits, ch => (ch === '-' ? -1 : ch === '+' ? 1 : 0));
  const b = Array.from(refs[1].trits, ch => (ch === '-' ? -1 : ch === '+' ? 1 : 0));
  const len = Math.min(a.length, b.length);
  const jointTrits = new Array(len).fill(0).map((_, i) => {
    const m = (((a[i] + 1) + (b[i] + 1)) % 3) - 1; // -1,0,1
    return m;
  });
  const jointTritsStr = tritsToString(jointTrits);
  return { scheme: `3psk-${planName}`, refs, joint_trits: jointTritsStr };
}

// Map plan name to a numeric plan code for path segments
function planCodeFor(planName) {
  if (/merkaba/i.test(planName)) return 125;
  if (/pentad/i.test(planName)) return 49;
  return 33; // default small prime-ish
}

// Convert hex string into N 31-bit integers suitable for BIP32 (non-hardened) path segments
function hexToPathSegments(hex, count) {
  const buf = Buffer.from(hex, 'hex');
  const segs = [];
  let i = 0;
  while (segs.length < count) {
    const b0 = buf[i % buf.length];
    const b1 = buf[(i + 1) % buf.length];
    const b2 = buf[(i + 2) % buf.length];
    const b3 = buf[(i + 3) % buf.length];
    const u32 = ((b0 << 24) >>> 0) | (b1 << 16) | (b2 << 8) | b3;
    segs.push(u32 & 0x7fffffff); // 31-bit
    i += 4;
  }
  return segs;
}

function buildBip32Path({ coinType = 60, orgTag = 'ULP', planName, dim, jointHex, segmentCount = 4 }) {
  // Encode org as 24-bit ASCII packed integer (e.g., 'ULP' -> 0x55 0x4C 0x50)
  const orgInt = orgTag
    .slice(0, 3)
    .padEnd(3, '\0')
    .split('')
    .reduce((acc, ch) => (acc << 8) | ch.charCodeAt(0), 0) >>> 0;
  const planCode = planCodeFor(planName);
  const segs = hexToPathSegments(jointHex, segmentCount);
  const hardened = (n) => `${n | 0}'`;
  const nonH = (n) => `${n | 0}`;
  const path = [
    'm',
    hardened(44),
    hardened(coinType),
    hardened(orgInt),
    hardened(planCode),
    hardened(dim),
    ...segs.map(nonH),
  ].join('/');
  return { path, purpose: 44, coin_type: coinType, org: orgInt, plan_code: planCode, segments: segs };
}

function main() {
  const pow2 = Number(process.env.CQE_POW2 || 1024);
  const nonpow2 = Number(process.env.CQE_NONPOW2 || 1500);
  const thresh = Number(process.env.CQE_THRESH || 1e-10);
  const planName = process.env.CQE_HARM_PLAN || 'merkaba125';
  const harmonicDim = Number(process.env.CQE_HARM_DIM || (planName === 'merkaba125' ? 125 : 49));
  const includeSha = process.env.CQE_INCLUDE_SHA === '1';

  const directJson = run(`node scripts/cqe-direct-smoke.js --json --pow2 ${pow2} --nonpow2 ${nonpow2} --thresh ${thresh}`);
  const direct = JSON.parse(directJson);
  const vsaOut = run('node scripts/cqe-vsa-smoke.js');
  const vsaOk = /Smoke test passed/.test(vsaOut);

  const pass = !!(direct && direct.pass && vsaOk);
  const axiom = {
    kind: 'axiom',
    name: 'CQE-Convolution-Deconvolution-Unitary',
    version: '1.0.0',
    validatedAt: new Date().toISOString(),
    pow2_dim: pow2,
    nonpow2_dim: nonpow2,
    rmse_threshold: thresh,
    results: { direct, vsaOk },
    pass,
  };

  // Prepare a temporary digest to seed harmonic refs (internal only if includeSha=false)
  const data = Buffer.from(JSON.stringify(axiom));
  const sha = crypto.createHash('sha256').update(data).digest('hex');
  if (includeSha) {
    axiom.signature = { algo: 'sha256', digest: sha };
  }
  // Add harmonic reference signature (plan-aware); seed from digest to ensure determinism
  const harmonic = makeHarmonicRefs({ planName, dim: harmonicDim, digestHex: sha });
  axiom.harmonic_signature = harmonic;
  // Build HD path from a hex derived from joint trits (hash for numeric segments only; not stored unless includeSha)
  const jointHex = crypto.createHash('sha256').update(harmonic.joint_trits, 'utf8').digest('hex');
  axiom.hd = buildBip32Path({ coinType: 60, orgTag: 'ULP', planName, dim: harmonicDim, jointHex, segmentCount: 4 });
  // Provide lightweight tetrahedral vertex seeds derived from harmonic joint (for routing/config)
  const vertexNames = ['claude_code', 'brian_thorne', 'copilot_universe', 'ollama_local'];
  axiom.tetrahedron = {
    plan: planName,
    dim: harmonicDim,
    vertices: vertexNames.map(name => ({
      name,
      seed: crypto.createHash('sha256').update(jointHex + '|' + name).digest('hex').slice(0, 32),
    })),
  };

  const outDir = path.resolve('dist', 'axioms');
  fs.mkdirSync(outDir, { recursive: true });
  const ts = Date.now();
  const outPath = path.join(outDir, `cqe-axiom-${ts}.json`);
  // Prepare a wallet-sign request bundle for provenance (sign the joint trits via EIP-191 personal_sign)
  const signReq = {
    kind: 'wallet_sign_request',
    purpose: 'provenance',
    standard: 'eip191-personal_sign',
    message: harmonic.joint_trits,
    hint: 'Use personal_sign on the exact joint trits string; the wallet adds the EIP-191 prefix.',
    hd_path: axiom.hd.path,
    harmonic_scheme: axiom.harmonic_signature.scheme,
    harmonic_joint_trits_preview: harmonic.joint_trits.slice(0, 48) + '…',
    artifact: path.basename(outPath),
    chain_id: process.env.EVM_CHAIN_ID || null,
    registry: process.env.HARMONIC_REGISTRY_ADDRESS || null,
    sha256: includeSha ? sha : null,
  };
  const signReqPath = path.join(outDir, `cqe-axiom-${ts}.sign.json`);
  fs.writeFileSync(signReqPath, JSON.stringify(signReq, null, 2));

  // Optionally attach an externally produced wallet signature/address via env
  const addrEnv = process.env.ETH_ADDRESS;
  const sigEnv = process.env.ETH_SIGNATURE_HEX || process.env.ETH_SIGNATURE;
  if (addrEnv && sigEnv) {
    axiom.wallet_signature = {
      type: 'eip191-personal_sign',
      message: harmonic.joint_trits,
      address: addrEnv,
      signature: sigEnv,
      note: 'Primary provenance is wallet signature over harmonic joint trits.',
      sha256: includeSha ? sha : undefined,
    };
  }

  fs.writeFileSync(outPath, JSON.stringify(axiom, null, 2));
  console.log(
    JSON.stringify(
      {
        status: pass ? 'pass' : 'fail',
        outPath,
        harmonic_scheme: axiom.harmonic_signature.scheme,
  joint_preview: harmonic.joint_trits.slice(0, 32) + '…',
        signRequest: signReqPath,
  sha256: includeSha ? sha : null,
      },
      null,
      2
    )
  );
  process.exit(pass ? 0 : 1);
}

if (require.main === module) main();
