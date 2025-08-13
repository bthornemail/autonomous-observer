#!/usr/bin/env node
// CQE + VSA smoke test without Jest. Exits 0 on pass, 1 on failure.
const path = require('path');
const { VectorSymbolicArchitecture } = require(path.resolve(__dirname, '..', 'VectorSymbolicArchitecture.runtime.js'));

function rmse(a, b) {
  const N = a.length;
  let s = 0;
  for (let i = 0; i < N; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s / N);
}

function runCase(N, label) {
  const vsa = new VectorSymbolicArchitecture(N, 'fft');
  const a = vsa.encodeHDVector('alpha', ['x', 42]);
  const b = vsa.encodeHDVector('beta', ['y', 7]);
  const bound = vsa.bindVectors(a, b);
  const recoveredB = vsa.unbindVector(bound, a);
  const e = rmse(recoveredB.dimensions, b.dimensions);
  console.log(`[${label}] N=${N} RMSE=${e}`);
  return e < 1e-10;
}

async function main() {
  const ok1 = runCase(1024, 'pow2');
  const ok2 = runCase(1500, 'non-pow2');
  if (!ok1 || !ok2) {
    console.error('Smoke test failed');
    process.exit(1);
  }

  // Tiny perf sample (bind only), keep sizes modest to avoid long runtimes
  const N = 2048;
  const vsaFFT = new VectorSymbolicArchitecture(N, 'fft');
  const vsaNaive = new VectorSymbolicArchitecture(N, 'naive');
  const a = vsaFFT.encodeHDVector('gamma', ['p', 3]);
  const b = vsaFFT.encodeHDVector('delta', ['q', 9]);

  const t1 = Date.now();
  const boundFFT = vsaFFT.bindVectors(a, b);
  const t2 = Date.now();
  const fftMs = t2 - t1;

  const t3 = Date.now();
  const boundNaive = vsaNaive.bindVectors(a, b);
  const t4 = Date.now();
  const naiveMs = t4 - t3;

  console.log(`[perf] N=${N} bind: fft=${fftMs}ms, naive=${naiveMs}ms`);
  console.log('Smoke test passed');
}

main().catch((e) => { console.error(e); process.exit(1); });
