#!/usr/bin/env node
import { encodeBinaryToVector, decodeVectorToBinary } from '../packages/harmonic-template-engine/index.mjs';

function run(plan){
  const dim = 4096; const seed = 'merkaba';
  const payload = Buffer.alloc(0);
  const { vector, manifest } = encodeBinaryToVector(payload, { dim, seed, plan });
  const out = decodeVectorToBinary(vector, { dim, seed, plan });
  const ok = Buffer.compare(payload, out) === 0;
  console.log(`[${plan}] round-trip ok=${ok} carriers=${manifest.bins.length}`);
  if (!ok) process.exit(1);
}

run('merkaba125');
run('merkaba125+3');
console.log('merkaba smoke passed');
