#!/usr/bin/env node
import { encodeMerkabaTrits, decodeMerkabaTrits, getPlanBins } from '../packages/harmonic-template-engine/index.mjs';

const dim = 4096, seed = 'merkaba', plan = 'merkaba125+3';
const bins = getPlanBins(dim, seed, plan);
// Build a short trit message: cycle -1,0,1 along first 27 bins
const trits = Array.from({length: 27}, (_,i)=> (i%3===0?-1:(i%3===1?0:1)));
const { vector, manifest } = encodeMerkabaTrits(trits, { dim, seed, plan });
const out = decodeMerkabaTrits(vector, { dim, seed, plan, count: trits.length });
const ok = trits.every((t,i)=>t===out[i]);
console.log(`merkaba trits round-trip ok=${ok} plan=${plan} carriers=${bins.length}`);
if (!ok) process.exit(1);
console.log('first 27 decoded trits:', out.join(','));
