#!/usr/bin/env node
const path = require('path');
const { VectorSymbolicArchitecture } = require(path.resolve(__dirname, '..', 'VectorSymbolicArchitecture.runtime.js'));

function dftMag(x) {
  const N = x.length;
  const mags = new Array(N);
  for (let k = 0; k < N; k++) {
    let re = 0, im = 0;
    const angBase = -2 * Math.PI * k / N;
    for (let n = 0; n < N; n++) {
      const ang = angBase * n;
      const c = Math.cos(ang), s = Math.sin(ang);
      re += x[n] * c;
      im += x[n] * s;
    }
    mags[k] = Math.hypot(re, im);
  }
  const min = Math.min(...mags);
  const max = Math.max(...mags);
  const mean = mags.reduce((a,b)=>a+b,0)/N;
  return { min, max, mean };
}

function check(label, N, input, props) {
  const vsa = new VectorSymbolicArchitecture(N, 'fft');
  const v = vsa.encodeHDVector(input, props).dimensions;
  const stats = dftMag(v);
  console.log(`${label} N=${N} min|X|=${stats.min} mean|X|=${stats.mean} max|X|=${stats.max}`);
}

check('a', 1024, 'a', ['x', 1]);
check('alpha', 1024, 'alpha', ['x', 42]);
check('b', 1024, 'b', ['y', 2]);
check('beta', 1024, 'beta', ['y', 7]);
