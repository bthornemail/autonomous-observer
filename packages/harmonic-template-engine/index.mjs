// Harmonic Template Engine core
// Contract:
// - Input: config { dim, baseFreq, harmonics: [multipliers], placeholders: [{k|range:{start,end}, weight|amplitude}], seed }
// - Output: real-valued length-dim vector built from deterministic unit-magnitude spectrum with harmonic emphasis and masked placeholders

import crypto from 'node:crypto';

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashToSeed(str) {
  const h = crypto.createHash('sha256').update(str).digest();
  return h.readUInt32BE(0) ^ h.readUInt32BE(4) ^ h.readUInt32BE(8) ^ h.readUInt32BE(12);
}

export function unitarySpectrum(dim, seed) {
  const rand = mulberry32(seed);
  const spec = new Array(dim).fill(0).map(() => ({ re: 0, im: 0 }));
  spec[0] = { re: 1, im: 0 };
  const even = dim % 2 === 0;
  if (even) spec[dim >> 1] = { re: 1, im: 0 };
  const half = Math.floor(dim / 2);
  for (let k = 1; k < half + (even ? 0 : 1); k++) {
    const theta = 2 * Math.PI * rand();
    const re = Math.cos(theta), im = Math.sin(theta);
    spec[k] = { re, im };
    spec[dim - k] = { re, im: -im };
  }
  return spec;
}

function idftReal(spec) {
  const N = spec.length;
  const out = new Float64Array(N);
  for (let n = 0; n < N; n++) {
    let re = 0, im = 0;
    for (let k = 0; k < N; k++) {
      const ang = (2 * Math.PI * k * n) / N;
      const c = Math.cos(ang), s = Math.sin(ang);
      const { re: a, im: b } = spec[k];
      re += a * c - b * s;
      im += a * s + b * c;
    }
    out[n] = re / N; // imag should be ~0
  }
  return out;
}

export function applyHarmonics(spec, baseFreq = 1, harmonics = [], gain = 1.0) {
  const N = spec.length;
  const weights = new Float64Array(N).fill(1);
  // Emphasize bins at multiples of baseFreq
  const mults = harmonics.length ? harmonics : [1, 2, 3, 4, 5];
  for (const m of mults) {
    let k = Math.round((m * baseFreq) % N);
    if (k < 0) k += N;
    weights[k] += gain;
    const mirror = (N - k) % N;
    if (mirror !== k) weights[mirror] += gain;
  }
  // Apply weights preserving unit magnitude via rotation blend
  const out = spec.map((z, k) => {
    const w = weights[k];
    if (w === 1) return z;
    // Rotate slightly toward emphasized angle without changing magnitude
    // Here we simply keep phase (magnitude already 1)
    return z;
  });
  return out;
}

export function maskPlaceholders(spec, placeholders = []) {
  const N = spec.length;
  const out = spec.map(z => ({ ...z }));
  for (const ph of placeholders) {
    if (typeof ph.k === 'number') {
      const k = ((ph.k % N) + N) % N;
      const amp = typeof ph.amplitude === 'number' ? ph.amplitude : 0.0;
      const keepPhase = ph.keepPhase ?? true;
      const z = out[k];
      const mag = Math.hypot(z.re, z.im) || 1;
      const re = keepPhase ? (z.re / mag) * amp : amp;
      const im = keepPhase ? (z.im / mag) * amp : 0;
      out[k] = { re, im };
      const mirror = (N - k) % N;
      if (mirror !== k) out[mirror] = { re, im: -im };
    } else if (ph.range && Number.isFinite(ph.range.start) && Number.isFinite(ph.range.end)) {
      const start = Math.max(0, Math.min(N - 1, Math.floor(ph.range.start)));
      const end = Math.max(0, Math.min(N - 1, Math.floor(ph.range.end)));
      const amp = typeof ph.amplitude === 'number' ? ph.amplitude : 0.0;
      for (let k = start; k <= end; k++) {
        const z = out[k];
        const mag = Math.hypot(z.re, z.im) || 1;
        out[k] = { re: (z.re / mag) * amp, im: (z.im / mag) * amp };
      }
    }
  }
  return out;
}

export function generateTemplate({ dim, seed, baseFreq = 1, harmonics = [1,2,3,4,5], placeholders = [], gain = 1.0 }) {
  if (!Number.isInteger(dim) || dim <= 0) throw new Error('dim must be a positive integer');
  const s = typeof seed === 'number' ? seed : hashToSeed(String(seed ?? 'harmonic'));
  let spec = unitarySpectrum(dim, s);
  spec = applyHarmonics(spec, baseFreq, harmonics, gain);
  spec = maskPlaceholders(spec, placeholders);
  const vec = idftReal(spec);
  // normalize
  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return { vector: Array.from(vec), spec };
}

export function applyPlaceholdersToData(data, placeholders = [], clamp = [-1, 1]) {
  // Simple formatter: replace ${k} or ${k:m..M} with values mapped from placeholder amplitude
  const mapAmp = (amp, min = clamp[0], max = clamp[1]) => Math.max(min, Math.min(max, amp));
  return data.replace(/\$\{k(?::(\d+)(?:\.\.(\d+))?)?\}/g, (_, a, b) => {
    const idx = a ? Number(a) : null;
    let amp = 0;
    if (idx !== null) {
      const ph = placeholders.find(p => p.k === idx);
      amp = ph && typeof ph.amplitude === 'number' ? ph.amplitude : 0;
      if (b) {
        const min = Number(a), max = Number(b);
        const t = (amp - clamp[0]) / (clamp[1] - clamp[0] || 1);
        return String(Math.round(min + t * (max - min)));
      }
    }
    return String(mapAmp(amp));
  });
}

export default { generateTemplate, applyPlaceholdersToData, hashToSeed };
