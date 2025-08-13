#!/usr/bin/env node
// Demonstrate using a harmonic template vector with the VSA runtime bind/unbind pipeline
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { VectorSymbolicArchitecture } = require(path.resolve(__dirname, '..', 'VectorSymbolicArchitecture.runtime.js'));

function rmse(a, b) {
  const N = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < N; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s / N);
}

function ensureHarmonicVector(vecPath) {
  if (fs.existsSync(vecPath)) return true;
  // Try to generate one via the CLI under the package workspace
  console.log('Vector not found, generating via harmonic-template CLI...');
  const args = [
    '--workspace', '@ulp/harmonic-template-engine', 'harmonic-template',
    '--dim=1024', '--seed=demo-hv', '--base=7', '--harmonics=1,2,3,5', '--gain=0.5',
    '--placeholders=k:5:0.8,k:13:0.2,range:100..120:0.1',
    `--out=${vecPath}`
  ];
  const res = spawnSync('npx', args, { stdio: 'inherit' });
  return res.status === 0 && fs.existsSync(vecPath);
}

function main() {
  const vecPath = path.resolve(__dirname, '..', 'packages', 'harmonic-template-engine', 'dist', 'report-vector.json');
  if (!ensureHarmonicVector(vecPath)) {
    console.error('Failed to generate harmonic vector. Aborting.');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(vecPath, 'utf8'));
  const hv = data.vector;
  const N = hv.length;
  const vsa = new VectorSymbolicArchitecture(N, 'fft');

  const a = vsa.encodeHDVector('alpha', ['x', 42]);
  const harmonic = { dimensions: hv, semanticBinding: 'harmonic' };

  const bound = vsa.bindVectors(a, harmonic);
  const recovered = vsa.unbindVector(bound, harmonic);
  const e = rmse(recovered.dimensions, a.dimensions);
  console.log(`[harmonic-vsa] N=${N} RMSE(recover alpha)=${e}`);
  if (e > 1e-10) {
    console.error('Harmonic VSA demo failed accuracy threshold');
    process.exit(1);
  }
  console.log('Harmonic VSA demo passed');
}

main();
