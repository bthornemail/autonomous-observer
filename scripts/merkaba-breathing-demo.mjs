#!/usr/bin/env node
import { getPlanBins, encodeMerkabaTrits } from '../packages/harmonic-template-engine/index.mjs';

// Triangular walk over integers in [-R, R] with reflection
function triWalk(R) {
  const seq = [0];
  for (let x = 1; x <= R; x++) seq.push(x);
  for (let x = R - 1; x >= -R; x--) seq.push(x);
  for (let x = -R + 1; x <= 0; x++) seq.push(x);
  return seq;
}

const dim = 4096;
const seed = 'merkaba-breath';
const plan = 'merkaba125+3';
const bins = getPlanBins(dim, seed, plan);
const anchors = plan.endsWith('+3') ? 3 : 0;

// Map (u,v,w) to carrier index in merkaba125 order (u-major, then v, then w)
const uvwToIndex = (u, v, w) => anchors + (u * 25 + v * 5 + w);
const clamp5 = x => ((x % 5) + 5) % 5;

const R = 4; // radius per your pattern
const walk = triWalk(R);
const frames = 24; // a short breathing cycle

function symbol(t) {
  return t < 0 ? '-' : (t > 0 ? '+' : '0');
}

function renderGrid(trits) {
  // Print five 5x5 slices for v = 0..4
  let out = '';
  for (let v = 0; v < 5; v++) {
    out += `v=${v}\n`;
    for (let u = 0; u < 5; u++) {
      let row = '';
      for (let w = 0; w < 5; w++) {
        const idx = uvwToIndex(u, v, w);
        const t = trits[idx] ?? 0;
        row += symbol(t);
      }
      out += row + '\n';
    }
    out += '\n';
  }
  return out;
}

function frameTrits(t) {
  // Build a trits array aligned to bins.length
  const trits = new Array(bins.length).fill(0);
  // Keep anchors neutral for stability
  for (let a = 0; a < anchors; a++) trits[a] = 0;

  // Breathing: for k=1..3 layers, set a moving (u, v=k, w=(t+k)%5) point to sign(n)
  const n = walk[t % walk.length];
  const s = Math.sign(n); // -1, 0, +1
  for (let k = 1; k <= 3; k++) {
    const u = clamp5(Math.abs(n));
    const v = clamp5(k);
    const w = clamp5(t + k);
    const idx = uvwToIndex(u, v, w);
    if (idx < trits.length) trits[idx] = s;
  }

  return trits;
}

(async () => {
  console.log(`Merkaba breathing demo: dim=${dim} plan=${plan} carriers=${bins.length}`);
  for (let t = 0; t < frames; t++) {
    const trits = frameTrits(t);
    const { vector } = encodeMerkabaTrits(trits, { dim, seed, plan });
    console.log(`\nFrame ${t+1}/${frames}`);
    console.log(renderGrid(trits));
    // Optionally, compute or log vector energy or checksums for debugging
    const l2 = Math.sqrt(vector.reduce((s,x)=>s+x*x,0));
    console.log(`L2=${l2.toFixed(6)}`);
  }
})();
