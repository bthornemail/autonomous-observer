#!/usr/bin/env node
const path = require('path');
const { VectorSymbolicArchitecture } = require(path.resolve(__dirname, '..', 'VectorSymbolicArchitecture.runtime.js'));

function rmse(a, b) { const N = a.length; let s=0; for (let i=0;i<N;i++) { const d=a[i]-b[i]; s += d*d; } return Math.sqrt(s/N); }

function testN(N) {
  const vsa = new VectorSymbolicArchitecture(N, 'fft');
  const a = vsa.encodeHDVector('a', ['x', 1]);
  const b = vsa.encodeHDVector('b', ['y', 2]);
  const bound = vsa.bindVectors(a, b);
  const recB = vsa.unbindVector(bound, a);
  const e = rmse(recB.dimensions, b.dimensions);
  console.log(`N=${N} rmse=${e}`);
}

[8,9,15,16,32,64,128,256,512,1024,1500].forEach(testN);
