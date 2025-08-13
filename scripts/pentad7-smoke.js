#!/usr/bin/env node
import { encodeBinaryToVector, decodeVectorToBinary } from '../packages/harmonic-template-engine/index.mjs';

function run(plan){
  const dim = 1024; const seed = 'pentad';
  const payload = Buffer.from(''); // empty payload
  const { vector, manifest } = encodeBinaryToVector(payload, { dim, seed, plan });
  const out = decodeVectorToBinary(vector, manifest);
  const ok = Buffer.compare(payload, out) === 0;
  console.log(`[${plan}] round-trip ok=${ok} carriers=${manifest.bins.length}`);
  if (!ok) process.exit(1);
}

run('pentad7');
run('pentad7+1');

console.log('pentad7 smoke passed');
