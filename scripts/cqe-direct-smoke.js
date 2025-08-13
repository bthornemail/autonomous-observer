#!/usr/bin/env node
// Direct CQE smoke test: circular convolution + deconvolution
// Usage: node scripts/cqe-direct-smoke.js --json --pow2 1024 --nonpow2 1500 --thresh 1e-10

const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { json: false, pow2: 1024, nonpow2: 1500, thresh: 1e-10 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') opts.json = true;
    else if (a === '--pow2') opts.pow2 = parseInt(args[++i], 10);
    else if (a === '--nonpow2') opts.nonpow2 = parseInt(args[++i], 10);
    else if (a === '--thresh' || a === '--rmse' || a === '--threshold') opts.thresh = parseFloat(args[++i]);
  }
  return opts;
}

function rmse(a, b) {
  const n = a.length; let s = 0;
  for (let i = 0; i < n; i++) { const d = a[i] - b[i]; s += d * d; }
  return Math.sqrt(s / n);
}

function prng(seed) {
  // simple xorshift32 for deterministic vectors
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17; x >>>= 0;
    x ^= x << 5; x >>>= 0;
    return (x & 0xffffffff) / 0x100000000;
  };
}

function makeVec(n, seed) {
  const r = prng(seed);
  const v = new Array(n);
  for (let i = 0; i < n; i++) v[i] = r() * 2 - 1; // [-1,1)
  return v;
}

async function runCase(N, seedA, seedB, thresh) {
  const cqe = require(path.resolve(__dirname, '..', 'packages', 'computational-quantum-engine', 'dist', 'index.js'));
  const { ComputationalQuantumEngine } = cqe;
  const engine = new ComputationalQuantumEngine({ epsilon: 1e-8 });
  const a = makeVec(N, seedA);
  const b = makeVec(N, seedB);
  const { bound } = engine.bind(a, b);
  const recovered = engine.unbind(bound, a);
  const e = rmse(recovered, b);
  return { N, rmse: e, pass: e < thresh };
}

async function main() {
  const opts = parseArgs();
  const results = {};
  try {
    // Ensure compiled code exists: the MCP tool compiles before calling this
    const pow2 = await runCase(opts.pow2, 12345, 67890, opts.thresh);
    const nonpow2 = await runCase(opts.nonpow2, 11111, 22222, opts.thresh);
    const pass = pow2.pass && nonpow2.pass;
    const out = { pass, pow2, nonpow2 };
    if (opts.json) {
      process.stdout.write(JSON.stringify(out));
    } else {
      console.log(out);
    }
    process.exit(pass ? 0 : 1);
  } catch (err) {
    const out = { pass: false, error: String(err && err.message || err) };
    if (opts.json) process.stdout.write(JSON.stringify(out)); else console.error(out);
    process.exit(1);
  }
}

main();

