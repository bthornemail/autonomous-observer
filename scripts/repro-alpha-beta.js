#!/usr/bin/env node
const path = require('path');
const { VectorSymbolicArchitecture } = require(path.resolve(__dirname, '..', 'VectorSymbolicArchitecture.runtime.js'));

function rmse(a, b) { const N=a.length; let s=0; for (let i=0;i<N;i++){const d=a[i]-b[i]; s+=d*d;} return Math.sqrt(s/N); }

function run(N) {
  const vsa = new VectorSymbolicArchitecture(N, 'fft');
  const a = vsa.encodeHDVector('alpha', ['x', 42]);
  const b = vsa.encodeHDVector('beta', ['y', 7]);
  const bound = vsa.bindVectors(a, b);
  const recoveredB = vsa.unbindVector(bound, a);
  const e = rmse(recoveredB.dimensions, b.dimensions);
  console.log(`N=${N} rmse=${e}`);
}

run(1024);
run(1500);
