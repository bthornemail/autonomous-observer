#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const args = [
  'harmonic-template',
  '--dim=128',
  '--seed=smoke',
  '--base=3',
  '--harmonics=1,2,4',
  '--gain=0.2',
  '--placeholders=k:7:0.8,range:10..20:0.1',
  '--out=./dist/harmonic-smoke.json'
];

const res = spawnSync('npx', ['--workspace', '@ulp/harmonic-template-engine', ...args], { stdio: 'inherit' });
process.exit(res.status ?? 1);
