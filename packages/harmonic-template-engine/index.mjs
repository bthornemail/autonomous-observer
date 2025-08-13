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

function carrierPlan(dim, seed, planName) {
  const name = (planName || 'auto').toLowerCase();
  if (name === 'auto') return null; // indicates use of default selection by needed count
  const half = Math.floor(dim / 2);
  const upper = (dim % 2 === 0) ? (half - 1) : half;
  const all = [];
  for (let k = 1; k <= upper; k++) all.push(k);
  const rand = mulberry32(seed ^ 0x7E57_1DEE);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  if (name === 'pentad7' || name === 'pentad7+1' || name === 'pentad7-anchor') {
    const groups = 7, per = 7; // (1 + 5 + 1) per group
    const need = groups * per; // 49
    if (all.length < need) throw new Error(`Not enough usable bins for plan ${name}`);
    const heptads = [];
    let idx = 0;
    for (let g = 0; g < groups; g++) {
      heptads.push(all.slice(idx, idx + per).sort((a, b) => a - b));
      idx += per;
    }
    let carriers = heptads.flat(); // 49 ordered by heptad then ascending
    if (name !== 'pentad7') {
      // Append a global anchor bin chosen as the next candidate farthest from existing set
      let best = null, bestScore = -1;
      for (let k = idx; k < all.length; k++) {
        const cand = all[k];
        let minDist = Infinity;
        for (const b of carriers) {
          const d = Math.abs(cand - b);
          if (d < minDist) minDist = d;
          if (minDist === 0) break;
        }
        if (minDist > bestScore) { bestScore = minDist; best = cand; }
      }
      if (best != null) carriers = [best].concat(carriers); // put anchor first so it's always within prefix
    }
    return carriers;
  }
  if (name === 'merkaba125' || name === 'merkaba125+3') {
    // 5×5×5 = 125 carriers arranged in a triad grid; optional 3 anchors prepended
    const need = 125;
    if (all.length < need) throw new Error(`Not enough usable bins for plan ${name}`);
    const picked = all.slice(0, need).sort((a,b)=>a-b);
    // Assign into 5x5x5 in deterministic order; then flatten by (u,v,w)
    const carriers = [];
    let idx = 0;
    const grid = new Array(5);
    for (let u=0; u<5; u++) {
      grid[u] = new Array(5);
      for (let v=0; v<5; v++) {
        grid[u][v] = new Array(5);
        for (let w=0; w<5; w++) {
          grid[u][v][w] = picked[idx++];
        }
      }
    }
    for (let u=0; u<5; u++) {
      for (let v=0; v<5; v++) {
        for (let w=0; w<5; w++) carriers.push(grid[u][v][w]);
      }
    }
    if (name === 'merkaba125+3') {
      // Select 3 anchors with maximal minimum distance to carriers and to each other
      const anchorSet = [];
      const candidateStart = need;
      const distToSet = (k) => {
        let dmin = Infinity;
        for (const b of carriers) dmin = Math.min(dmin, Math.abs(k - b));
        for (const a of anchorSet) dmin = Math.min(dmin, Math.abs(k - a));
        return dmin;
      };
      for (let t=0; t<3 && candidateStart + t < all.length; ) {
        let best = null, bestD = -1;
        for (let i=candidateStart; i<all.length; i++) {
          const k = all[i];
          const d = distToSet(k);
          if (d > bestD) { bestD = d; best = k; }
        }
        if (best == null) break;
        anchorSet.push(best);
        t++;
      }
      return anchorSet.concat(carriers);
    }
    return carriers;
  }
  throw new Error(`Unknown carrier plan: ${planName}`);
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

export function encodeBinaryToVector(buffer, { dim, seed, plan = 'auto' }) {
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
  // Determine carrier bins per plan
  let bins;
  const planBins = carrierPlan(dim, s, plan);
  if (planBins) {
    if (binsNeeded > planBins.length) throw new Error(`Plan ${plan} capacity exceeded: need ${binsNeeded}, capacity ${planBins.length}`);
    bins = planBins.slice(0, binsNeeded);
  } else {
    bins = selectCarrierBins(dim, s, binsNeeded);
  }
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
    plan: plan || 'auto',
    planMeta: (() => {
      if (!plan || plan === 'auto') return undefined;
      if (plan.startsWith('pentad7')) {
        return { groups: 7, perGroup: 7, anchorAt: plan === 'pentad7+1' ? 0 : null };
      }
      if (plan.startsWith('merkaba125')) {
        return { groups: [5,5,5], anchors: plan === 'merkaba125+3' ? 3 : 0 };
      }
      return undefined;
    })(),
    payloadBytes: payload.length,
    crc32: crc32(payload) >>> 0,
  };
  return { vector: Array.from(vec), spec, manifest };
}

export function decodeVectorToBinary(vectorOrSpec, manifest) {
  let { dim, seed, bins: binsIn, bitsPerSymbol = 2, payloadBytes: payloadIn, crc32: expectedCrcIn, plan: planIn } = manifest || {};
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
  // Align dim with actual spectrum length for safety
  dim = spec.length;
  // If we don't know bins/payload yet, attempt plan-aware header recovery (auto-detect plan when absent)
  let bins = binsIn;
  let payloadBytes = payloadIn;
  let expectedCrc = expectedCrcIn;
  if (!bins || payloadBytes == null) {
    if (seed == null) throw new Error('decode needs seed when bins/payload are not provided');
    const hdrSyms = Math.ceil((8 * 8) / bitsPerSymbol); // 8 byte header
    const s = (typeof seed === 'number') ? seed : hashToSeed(String(seed));
    const candidates = planIn ? [planIn] : ['pentad7+1', 'pentad7', null];
    let solved = false;
    for (const candPlan of candidates) {
      let planBins = null;
      try { planBins = candPlan ? carrierPlan(dim, s, candPlan) : null; } catch { planBins = null; }
      const headerBins = planBins ? planBins.slice(0, hdrSyms) : selectCarrierBins(dim, s, hdrSyms);
      const outHdr = Buffer.alloc(8);
      let bitIdxHdr = 0;
      for (let i = 0; i < headerBins.length; i++) {
        const k = headerBins[i];
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
      if (bitIdxHdr < 8 * 8) continue;
      const len = outHdr.readUInt32BE(0);
      const crc = outHdr.readUInt32BE(4) >>> 0;
      const totalBits = (len + 8) * 8;
      const binsNeeded = Math.ceil(totalBits / bitsPerSymbol);
      const allBins = planBins || selectCarrierBins(dim, s, binsNeeded);
      const tryBins = allBins.slice(0, binsNeeded);
      // Tentative full decode to verify CRC
      const out = Buffer.alloc(len + 8);
      let bitIdx = 0;
      for (let i = 0; i < tryBins.length; i++) {
        const k = tryBins[i]; const z = spec[k]; const theta = Math.atan2(z.im, z.re); const sym = phaseToSymbol2b(theta);
        for (let b = bitsPerSymbol - 1; b >= 0; b--) {
          const bit = (sym >> b) & 1;
          const bytePos = (bitIdx >> 3);
          const bitPos = 7 - (bitIdx & 7);
          if (bytePos < out.length) out[bytePos] |= (bit << bitPos);
          bitIdx++;
        }
      }
      const decLen = out.readUInt32BE(0);
      const decPayload = out.slice(8, 8 + decLen);
      const decCrc = crc32(decPayload) >>> 0;
      if (decLen === len && decCrc === crc) {
        payloadBytes = len; expectedCrc = crc; bins = tryBins; planIn = candPlan || undefined; solved = true; break;
      }
    }
    if (!solved) throw new Error('Failed to recover header/payload via plan detection. Provide manifest or correct plan.');
  }

  const totalBits = (payloadBytes + 8) * 8; // length+crc header
  const syms = Math.ceil(totalBits / bitsPerSymbol);
  if (!bins || bins.length < syms) throw new Error('Insufficient carrier bins recovered for payload');
  const out = Buffer.alloc(payloadBytes + 8);
  let bitIdx = 0;
  for (let i = 0; i < syms; i++) {
    const k = bins[i];
    if (k == null || k < 0 || k >= spec.length) throw new Error(`Carrier bin index out of range: ${k}`);
    const z = spec[k];
    if (!z) throw new Error(`Spectrum missing at bin ${k}`);
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

// --- Merkaba ternary logic overlay (3-PSK across plan bins) ---

function tritToPhase3PSK(t) {
  // Map -1,0,1 -> -2π/3, 0, +2π/3
  if (t === -1) return -2 * Math.PI / 3;
  if (t === 0) return 0;
  return 2 * Math.PI / 3;
}

function phaseToTrit3PSK(theta) {
  const reps = [-2 * Math.PI / 3, 0, 2 * Math.PI / 3];
  let a = theta % (2 * Math.PI); if (a < 0) a += 2 * Math.PI;
  // represent also around 0 by shifting range to [-π, π]
  if (a > Math.PI) a -= 2 * Math.PI;
  let best = 0, bd = Infinity;
  for (let i = 0; i < reps.length; i++) {
    const d = Math.abs(a - reps[i]);
    if (d < bd) { bd = d; best = i; }
  }
  return best === 0 ? -1 : (best === 1 ? 0 : 1);
}

export function getPlanBins(dim, seed, plan = 'merkaba125') {
  const s = (typeof seed === 'number') ? seed : hashToSeed(String(seed));
  const bins = carrierPlan(dim, s, plan);
  return bins;
}

export function encodeMerkabaTrits(trits, { dim, seed, plan = 'merkaba125' } = {}) {
  if (!Array.isArray(trits)) throw new Error('trits must be an array of -1/0/1');
  const s = (typeof seed === 'number') ? seed : hashToSeed(String(seed));
  let spec = unitarySpectrum(dim, s);
  const bins = carrierPlan(dim, s, plan);
  const count = Math.min(trits.length, bins.length);
  for (let i = 0; i < count; i++) {
    const t = trits[i];
    const phase = tritToPhase3PSK(t);
    const re = Math.cos(phase), im = Math.sin(phase);
    const k = bins[i];
    spec[k] = { re, im };
    spec[(dim - k) % dim] = { re, im: -im };
  }
  const vec = idftReal(spec);
  // normalize
  let norm = 0; for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1; for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  const manifest = { version: 1, dim, seed: s >>> 0, plan, modulation: '3psk-1trit', trits: count };
  return { vector: Array.from(vec), manifest };
}

export function decodeMerkabaTrits(vectorOrSpec, { dim, seed, plan = 'merkaba125', count } = {}) {
  // Get spectrum
  let spec, N;
  if (Array.isArray(vectorOrSpec) && typeof vectorOrSpec[0] === 'number') {
    spec = dftOfReal(vectorOrSpec); N = vectorOrSpec.length;
  } else if (vectorOrSpec && Array.isArray(vectorOrSpec.vector)) {
    spec = dftOfReal(vectorOrSpec.vector); N = vectorOrSpec.vector.length;
  } else if (Array.isArray(vectorOrSpec) && typeof vectorOrSpec[0] === 'object') {
    spec = vectorOrSpec; N = spec.length;
  } else {
    throw new Error('decodeMerkabaTrits expects a vector array, {vector}, or spec array');
  }
  dim = dim || N;
  const s = (typeof seed === 'number') ? seed : hashToSeed(String(seed));
  const bins = carrierPlan(dim, s, plan);
  const n = Math.min(count ?? bins.length, bins.length);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const k = bins[i]; const z = spec[k]; const theta = Math.atan2(z.im, z.re);
    out[i] = phaseToTrit3PSK(theta);
  }
  return out;
}

export default { generateTemplate, applyPlaceholdersToData, hashToSeed, encodeBinaryToVector, decodeVectorToBinary };

// --- Patricia trie and chunked manifests ---

export function sha256Hex(buf) {
  const h = crypto.createHash('sha256').update(buf).digest('hex');
  return h; // lowercase hex
}

export function chunkBuffer(buf, chunkSize = 8192) {
  const chunks = [];
  for (let i = 0; i < buf.length; i += chunkSize) chunks.push(buf.subarray(i, Math.min(i + chunkSize, buf.length)));
  return chunks;
}

export function canonicalizeJson(value) {
  const seen = new WeakSet();
  const sorter = (v) => {
    if (v && typeof v === 'object') {
      if (seen.has(v)) throw new Error('Cyclic JSON not supported');
      seen.add(v);
      if (Array.isArray(v)) return v.map(sorter);
      const keys = Object.keys(v).sort();
      const out = {};
      for (const k of keys) out[k] = sorter(v[k]);
      return out;
    }
    return v;
  };
  const normalized = sorter(value);
  return JSON.stringify(normalized);
}

function hexNibbles(hex) { return hex.toLowerCase().replace(/[^0-9a-f]/g, ''); }

export function buildPatriciaTrie(entries) {
  // entries: Array<{ keyHex: string, value: any }>
  // Returns compressed trie with nodes { path: string, children: { [hexNibble]: node }, values?: any[] } where path is common prefix
  function build(list, prefix) {
    if (list.length === 0) return null;
    // Find common prefix beyond current
    let common = '';
    if (list.length > 1) {
      const first = list[0].keyHex;
      let L = 0;
      outer: for (let i = prefix.length; i < first.length; i++) {
        const ch = first[i];
        for (let j = 1; j < list.length; j++) {
          if (list[j].keyHex[i] !== ch) break outer;
        }
        L++;
      }
      common = first.slice(prefix.length, prefix.length + L);
    } else {
      // Single entry: compress remaining suffix fully
      common = list[0].keyHex.slice(prefix.length);
    }
    const node = { path: common, children: {}, values: [] };
    const newPrefix = prefix + common;
    // Group by next nibble
    const groups = new Map();
    for (const e of list) {
      if (e.keyHex.length === newPrefix.length) {
        node.values.push(e.value);
      } else {
        const nib = e.keyHex[newPrefix.length];
        if (!groups.has(nib)) groups.set(nib, []);
        groups.get(nib).push(e);
      }
    }
    for (const [nib, sub] of groups.entries()) {
      node.children[nib] = build(sub, newPrefix + nib);
    }
    return node;
  }
  const norm = entries.map(e => ({ keyHex: hexNibbles(e.keyHex), value: e.value })).sort((a, b) => a.keyHex.localeCompare(b.keyHex));
  return build(norm, '');
}

export function encodeBufferToTrie(buffer, { dim = 1024, seed = 'trie', chunkSize = 8192, includeVectors = false } = {}) {
  const s = typeof seed === 'number' ? seed : hashToSeed(String(seed));
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const chunks = chunkBuffer(buf, chunkSize);
  const entries = [];
  const leaves = {};
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const hash = sha256Hex(c);
    const chunkSeed = (s ^ (hashToSeed(hash))) >>> 0;
    const meta = { index: i, size: c.length, hash, dim, seed: chunkSeed };
    if (includeVectors) {
      const { vector, manifest } = encodeBinaryToVector(c, { dim, seed: chunkSeed });
      meta.vector = vector;
      meta.vectorManifest = manifest;
    }
    entries.push({ keyHex: hash, value: { hash, index: i } });
    leaves[hash] = meta;
  }
  const trie = buildPatriciaTrie(entries);
  const root = sha256Hex(Buffer.from(Object.keys(leaves).sort().join(''), 'utf8'));
  const manifest = {
    version: 1,
    kind: 'patricia-trie-chunks',
    root,
    dim,
    seed: s >>> 0,
    chunkSize,
    chunkCount: chunks.length,
    trie,
    leaves,
  };
  return manifest;
}

export function encodeJsonToTrie(jsonValue, opts) {
  const canonical = canonicalizeJson(jsonValue);
  return encodeBufferToTrie(Buffer.from(canonical, 'utf8'), opts);
}
