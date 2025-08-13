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

// --- Binary payload encode/decode into spectrum phases ---
// Modulation: QPSK (2 bits per carrier bin) with phases {0, π/2, π, 3π/2}

function crc32(buf) {
  // Standard CRC-32 (IEEE 802.3) implementation
  let c = ~0 >>> 0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(c & 1);
      c = (c >>> 1) ^ (0xEDB88320 & mask);
    }
  }
  return (~c) >>> 0;
}

function dftOfReal(x) {
  // Returns complex spectrum length N
  const N = x.length;
  const out = new Array(N);
  for (let k = 0; k < N; k++) {
    let re = 0, im = 0;
    const angBase = -2 * Math.PI * k / N;
    for (let n = 0; n < N; n++) {
      const ang = angBase * n;
      const c = Math.cos(ang), s = Math.sin(ang);
      const xn = x[n];
      re += xn * c;
      im += xn * s;
    }
    out[k] = { re, im };
  }
  return out;
}

function selectCarrierBins(dim, seed, count) {
  // Deterministically select `count` distinct bins in (1..upper) avoiding DC/Nyquist and ensuring symmetry
  const half = Math.floor(dim / 2);
  const upper = (dim % 2 === 0) ? (half - 1) : half; // last usable k on positive side
  const candidates = [];
  for (let k = 1; k <= upper; k++) candidates.push(k);
  const rand = mulberry32(seed ^ 0xA5A5A5A5);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, Math.min(count, candidates.length)).sort((a, b) => a - b);
}

function symbolToPhase2b(sym) {
  // 2-bit symbol 0..3 -> phase
  switch (sym & 3) {
    case 0: return 0;
    case 1: return Math.PI / 2;
    case 2: return Math.PI;
    case 3: return 3 * Math.PI / 2;
    default: return 0;
  }
}

function phaseToSymbol2b(theta) {
  // Normalize to [0, 2π)
  let a = theta % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  const sector = Math.round((a / (Math.PI / 2)) % 4) & 3; // nearest of 4 quadrants
  return sector;
}

export function encodeBinaryToVector(buffer, { dim, seed }) {
  if (!Number.isInteger(dim) || dim <= 0) throw new Error('dim must be a positive integer');
  const s = typeof seed === 'number' ? seed : hashToSeed(String(seed ?? 'harmonic'));
  // Build base unitary spectrum
  let spec = unitarySpectrum(dim, s);
  // Capacity planning
  const bitsPerSym = 2; // QPSK
  const payload = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const metaBuf = Buffer.alloc(8);
  metaBuf.writeUInt32BE(payload.length >>> 0, 0);
  metaBuf.writeUInt32BE(crc32(payload), 4);
  const totalBits = (payload.length + metaBuf.length) * 8;
  const half = Math.floor(dim / 2);
  const usable = (dim % 2 === 0) ? (half - 1) : half;
  const binsNeeded = Math.ceil(totalBits / bitsPerSym);
  if (binsNeeded > usable) {
    throw new Error(`Insufficient capacity: need ${binsNeeded} carrier bins, have ${usable}. Increase dim.`);
  }
  const bins = selectCarrierBins(dim, s, binsNeeded);
  // Stream bits
  const allBytes = Buffer.concat([metaBuf, payload]);
  let bitIdx = 0;
  for (let i = 0; i < bins.length; i++) {
    let sym = 0;
    for (let b = 0; b < bitsPerSym; b++) {
      const byte = allBytes[(bitIdx >> 3)] ?? 0;
      const bit = (byte >> (7 - (bitIdx & 7))) & 1;
      sym = (sym << 1) | bit;
      bitIdx++;
    }
    const phase = symbolToPhase2b(sym);
    const re = Math.cos(phase), im = Math.sin(phase);
    const k = bins[i];
    spec[k] = { re, im };
    spec[(dim - k) % dim] = { re, im: -im }; // conjugate mirror
  }
  const vec = idftReal(spec);
  // normalize
  let norm = 0; for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1; for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  const manifest = {
    version: 1,
    dim,
    seed: s >>> 0,
    modulation: 'qpsk-2b',
    bitsPerSymbol: bitsPerSym,
    bins,
    payloadBytes: payload.length,
    crc32: crc32(payload) >>> 0,
  };
  return { vector: Array.from(vec), spec, manifest };
}

export function decodeVectorToBinary(vectorOrSpec, manifest) {
  let { dim, seed, bins: binsIn, bitsPerSymbol = 2, payloadBytes: payloadIn, crc32: expectedCrcIn } = manifest || {};
  // Get spectrum
  let spec;
  if (Array.isArray(vectorOrSpec) && typeof vectorOrSpec[0] === 'number') {
    // Time-domain vector was provided
    const X = dftOfReal(vectorOrSpec);
    spec = X;
    if (!dim) dim = vectorOrSpec.length;
  } else if (Array.isArray(vectorOrSpec) && typeof vectorOrSpec[0] === 'object') {
    spec = vectorOrSpec;
    if (!dim) dim = spec.length;
  } else if (vectorOrSpec && Array.isArray(vectorOrSpec.vector)) {
    const X = dftOfReal(vectorOrSpec.vector);
    spec = X;
    if (!dim) dim = vectorOrSpec.vector.length;
  } else {
    throw new Error('Unsupported input for decode: provide time-domain vector array or spec or {vector}');
  }
  if (!dim) throw new Error('decode requires dim (in manifest or deduced from vector)');
  // If we don't know bins/payload yet, derive header using the first 32 carrier bins from candidate order
  let bins = binsIn;
  let payloadBytes = payloadIn;
  let expectedCrc = expectedCrcIn;
  if (!bins || payloadBytes == null) {
    if (seed == null) throw new Error('decode needs seed when bins/payload are not provided');
    const hdrSyms = Math.ceil((8 * 8) / bitsPerSymbol); // 8 byte header
    const cand = selectCarrierBins(dim, typeof seed === 'number' ? seed : hashToSeed(String(seed)), hdrSyms);
    const outHdr = Buffer.alloc(8);
    let bitIdxHdr = 0;
    for (let i = 0; i < cand.length; i++) {
      const k = cand[i];
      if (k == null || k < 0 || k >= spec.length) continue;
      const z = spec[k];
      if (!z) continue;
      const theta = Math.atan2(z.im, z.re);
      const sym = phaseToSymbol2b(theta);
      for (let b = bitsPerSymbol - 1; b >= 0; b--) {
        const bit = (sym >> b) & 1;
        const bytePos = (bitIdxHdr >> 3);
        const bitPos = 7 - (bitIdxHdr & 7);
        if (bytePos < outHdr.length) outHdr[bytePos] |= (bit << bitPos);
        bitIdxHdr++;
      }
    }
    if (bitIdxHdr < 8 * 8) throw new Error('Failed to recover header from vector with provided seed/dim');
    payloadBytes = outHdr.readUInt32BE(0);
    expectedCrc = outHdr.readUInt32BE(4);
    const totalBits = (payloadBytes + 8) * 8;
    const binsNeeded = Math.ceil(totalBits / bitsPerSymbol);
    bins = selectCarrierBins(dim, typeof seed === 'number' ? seed : hashToSeed(String(seed)), binsNeeded);
  }

  const totalBits = (payloadBytes + 8) * 8; // length+crc header
  const syms = Math.ceil(totalBits / bitsPerSymbol);
  const out = Buffer.alloc(payloadBytes + 8);
  let bitIdx = 0;
  for (let i = 0; i < syms; i++) {
    const k = bins[i];
    const z = spec[k];
    const theta = Math.atan2(z.im, z.re);
    const sym = phaseToSymbol2b(theta);
    for (let b = bitsPerSymbol - 1; b >= 0; b--) {
      const bit = (sym >> b) & 1; // MSB-first to mirror encoder
      const bytePos = (bitIdx >> 3);
      const bitPos = 7 - (bitIdx & 7);
      if (bytePos < out.length) out[bytePos] |= (bit << bitPos);
      bitIdx++;
    }
  }
  const declaredLen = out.readUInt32BE(0);
  const declaredCrc = out.readUInt32BE(4);
  const payload = out.slice(8, 8 + declaredLen);
  const actualCrc = crc32(payload) >>> 0;
  if (declaredLen !== payloadBytes) throw new Error(`Manifest length mismatch: ${payloadBytes} vs ${declaredLen}`);
  if (actualCrc !== declaredCrc || (expectedCrc != null && actualCrc !== ((expectedCrc >>> 0)))) throw new Error('CRC32 check failed; data corrupted or wrong manifest');
  return payload;
}

export default { generateTemplate, applyPlaceholdersToData, hashToSeed, encodeBinaryToVector, decodeVectorToBinary };
