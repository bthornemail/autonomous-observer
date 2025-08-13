// Minimal browser-side implementations adapted from the Node engine
// Uses same determinism: unitarySpectrum, selectCarrierBins, QPSK phases

function mulberry32(seed){ let t = seed >>> 0; return function(){ t += 0x6D2B79F5; let r = Math.imul(t ^ (t>>>15), 1|t); r ^= r + Math.imul(r ^ (r>>>7), 61|r); return ((r ^ (r>>>14))>>>0)/4294967296; } }

function hashToSeed(str){
  // 32-bit from SHA-256 first four words xor (browser crypto)
  const enc = new TextEncoder();
  // Synchronous fallback hash: FNV-1a 32
  let h = 0x811c9dc5; const data = enc.encode(str);
  for (let i=0;i<data.length;i++){ h ^= data[i]; h = Math.imul(h, 0x01000193); }
  return h>>>0;
}

function unitarySpectrum(dim, seed){
  const rand = mulberry32(seed);
  const spec = new Array(dim).fill(0).map(()=>({re:0,im:0}));
  spec[0] = {re:1, im:0};
  const even = (dim%2===0); if (even) spec[dim>>1] = {re:1, im:0};
  const half = Math.floor(dim/2);
  for (let k=1;k<half+(even?0:1);k++){
    const theta = 2*Math.PI*rand();
    const re = Math.cos(theta), im = Math.sin(theta);
    spec[k] = {re,im}; spec[dim-k] = {re, im:-im};
  }
  return spec;
}

function idftReal(spec){
  const N = spec.length; const out = new Float64Array(N);
  for (let n=0;n<N;n++){
    let re=0, im=0;
    for (let k=0;k<N;k++){
      const ang = (2*Math.PI*k*n)/N; const c=Math.cos(ang), s=Math.sin(ang);
      const a=spec[k].re, b=spec[k].im;
      re += a*c - b*s; im += a*s + b*c;
    }
    out[n] = re / N;
  }
  // normalize
  let norm=0; for (let i=0;i<N;i++) norm+=out[i]*out[i]; norm=Math.sqrt(norm)||1;
  for (let i=0;i<N;i++) out[i]/=norm; return out;
}

function dftOfReal(x){
  const N=x.length; const out=new Array(N);
  for (let k=0;k<N;k++){
    let re=0, im=0; const angBase=-2*Math.PI*k/N;
    for (let n=0;n<N;n++){ const ang=angBase*n; const c=Math.cos(ang), s=Math.sin(ang); const xn=x[n]; re+=xn*c; im+=xn*s; }
    out[k]={re,im};
  }
  return out;
}

function crc32(buf){ let c=(~0)>>>0; for(let i=0;i<buf.length;i++){ c^=buf[i]; for(let j=0;j<8;j++){ const m=-(c&1); c=(c>>>1) ^ (0xEDB88320 & m); } } return (~c)>>>0; }

function selectCarrierBins(dim, seed, count){
  const half=Math.floor(dim/2); const upper=(dim%2===0)?(half-1):half; const cand=[]; for(let k=1;k<=upper;k++) cand.push(k);
  const rand=mulberry32(seed ^ 0xA5A5A5A5);
  for(let i=cand.length-1;i>0;i--){ const j=Math.floor(rand()*(i+1)); [cand[i],cand[j]]=[cand[j],cand[i]]; }
  return cand.slice(0, Math.min(count, cand.length)).sort((a,b)=>a-b);
}

function symbolToPhase2b(sym){ switch(sym&3){ case 0: return 0; case 1: return Math.PI/2; case 2: return Math.PI; case 3: return 3*Math.PI/2; default: return 0; } }
function phaseToSymbol2b(theta){ let a=theta%(2*Math.PI); if(a<0) a+=2*Math.PI; const sector=Math.round((a/(Math.PI/2))%4)&3; return sector; }

export async function encode(buffer, {dim, seed}){
  const s = typeof seed==='number' ? seed : hashToSeed(String(seed||'harmonic'));
  let spec = unitarySpectrum(dim, s);
  const bitsPerSym=2; const payload = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const meta = new Uint8Array(8);
  const dv = new DataView(meta.buffer);
  dv.setUint32(0, payload.byteLength>>>0); dv.setUint32(4, crc32(payload));
  const totalBits = (payload.byteLength + meta.byteLength) * 8;
  const half=Math.floor(dim/2); const usable=(dim%2===0)?(half-1):half; const binsNeeded = Math.ceil(totalBits / bitsPerSym);
  if (binsNeeded>usable) throw new Error(`Insufficient capacity: need ${binsNeeded}, have ${usable}`);
  const bins = selectCarrierBins(dim, s, binsNeeded);
  const all = new Uint8Array(meta.byteLength + payload.byteLength);
  all.set(meta,0); all.set(payload,8);
  let bitIdx=0;
  for(let i=0;i<bins.length;i++){
    let sym=0; for(let b=0;b<bitsPerSym;b++){ const byte=all[(bitIdx>>3)]||0; const bit=(byte>>(7-(bitIdx&7)))&1; sym=(sym<<1)|bit; bitIdx++; }
    const phase=symbolToPhase2b(sym); const re=Math.cos(phase), im=Math.sin(phase); const k=bins[i];
    spec[k]={re,im}; spec[(dim-k)%dim]={re, im:-im};
  }
  const vector = Array.from(idftReal(spec));
  return { vector, manifest: { version:1, dim, seed:s>>>0, modulation:'qpsk-2b', bitsPerSymbol:2, bins, payloadBytes: payload.byteLength, crc32: crc32(payload)>>>0 } };
}

export async function decode(j, {dim, seed} = {}){
  const vector = j.vector || j; const N = vector.length; const X = dftOfReal(vector);
  const man = j.manifest || {}; let d = dim || man.dim || N; let s = (seed!=null) ? (typeof seed==='number'?seed:hashToSeed(String(seed))) : man.seed;
  if (!d) throw new Error('Missing dimension');
  const bitsPerSym = 2; let bins = man.bins; let payloadBytes = man.payloadBytes; let expectedCrc = man.crc32;
  if (!bins || payloadBytes==null){
    if (s==null) throw new Error('Seed required when manifest missing');
    const hdrSyms = Math.ceil((8*8)/bitsPerSym); const cand = selectCarrierBins(d, s, hdrSyms);
    const outHdr = new Uint8Array(8); let bitIdx=0;
    for(let i=0;i<cand.length;i++){
      const k=cand[i]; const z=X[k]; const theta=Math.atan2(z.im, z.re); const sym=phaseToSymbol2b(theta);
      for(let b=bitsPerSym-1;b>=0;b--){ const bit=(sym>>b)&1; const bytePos=bitIdx>>3; const bitPos=7-(bitIdx&7); if(bytePos<outHdr.length) outHdr[bytePos]|=(bit<<bitPos); bitIdx++; }
    }
    const dv=new DataView(outHdr.buffer); payloadBytes=dv.getUint32(0); expectedCrc=dv.getUint32(4);
    const totalBits=(payloadBytes+8)*8; const binsNeeded=Math.ceil(totalBits/bitsPerSym); bins=selectCarrierBins(d, s, binsNeeded);
  }
  const totalBits=(payloadBytes+8)*8; const syms=Math.ceil(totalBits/bitsPerSym); const out = new Uint8Array(payloadBytes+8); let bitIdx=0;
  for(let i=0;i<syms;i++){
    const k=bins[i]; const z=X[k]; const theta=Math.atan2(z.im, z.re); const sym=phaseToSymbol2b(theta);
    for(let b=bitsPerSym-1;b>=0;b--){ const bit=(sym>>b)&1; const bytePos=bitIdx>>3; const bitPos=7-(bitIdx&7); if(bytePos<out.length) out[bytePos]|=(bit<<bitPos); bitIdx++; }
  }
  const dv=new DataView(out.buffer); const declaredLen=dv.getUint32(0); const declaredCrc=dv.getUint32(4); const payload=out.slice(8,8+declaredLen);
  const actualCrc=crc32(payload)>>>0; if (declaredLen!==payloadBytes) throw new Error('Length mismatch'); if (actualCrc!==declaredCrc || (expectedCrc!=null && actualCrc!==expectedCrc)) throw new Error('CRC mismatch');
  return payload;
}

// --- Plan-aware carriers and Merkaba ternary overlay ---

function carrierPlan(dim, seed, planName){
  const name = (planName||'auto').toLowerCase();
  if (name === 'auto') return null;
  const half=Math.floor(dim/2); const upper=(dim%2===0)?(half-1):half; const all=[]; for(let k=1;k<=upper;k++) all.push(k);
  const rand = mulberry32((seed>>>0) ^ 0x7E571DEE);
  for (let i=all.length-1;i>0;i--){ const j=Math.floor(rand()*(i+1)); [all[i],all[j]]=[all[j],all[i]]; }
  if (name==='pentad7' || name==='pentad7+1'){
    const groups=7, per=7; const need=groups*per; if (all.length<need) throw new Error('Not enough bins');
    const heptads=[]; let idx=0; for (let g=0; g<groups; g++){ heptads.push(all.slice(idx, idx+per).sort((a,b)=>a-b)); idx+=per; }
    let carriers = heptads.flat();
    if (name==='pentad7+1'){
      let best=null, bestD=-1; for (let k=idx;k<all.length;k++){ const cand=all[k]; let dmin=Infinity; for (const b of carriers) dmin=Math.min(dmin, Math.abs(cand-b)); if (dmin>bestD){ bestD=dmin; best=cand; } }
      if (best!=null) carriers=[best].concat(carriers);
    }
    return carriers;
  }
  if (name==='merkaba125' || name==='merkaba125+3'){
    const need=125; if (all.length<need) throw new Error('Not enough bins');
    const picked = all.slice(0, need).sort((a,b)=>a-b);
    const carriers=[]; let idx=0; const grid=new Array(5);
    for (let u=0;u<5;u++){ grid[u]=new Array(5); for (let v=0;v<5;v++){ grid[u][v]=new Array(5); for (let w=0;w<5;w++){ grid[u][v][w]=picked[idx++]; } } }
    for (let u=0;u<5;u++){ for (let v=0;v<5;v++){ for (let w=0;w<5;w++) carriers.push(grid[u][v][w]); } }
    if (name==='merkaba125+3'){
      const anchorSet=[]; const distToSet=(k)=>{ let dmin=Infinity; for (const b of carriers) dmin=Math.min(dmin, Math.abs(k-b)); for (const a of anchorSet) dmin=Math.min(dmin, Math.abs(k-a)); return dmin; };
      for (let t=0; t<3 && need+t<all.length;){ let best=null, bestD=-1; for (let i=need;i<all.length;i++){ const k=all[i]; const d=distToSet(k); if (d>bestD){ bestD=d; best=k; } } if (best==null) break; anchorSet.push(best); t++; }
      return anchorSet.concat(carriers);
    }
    return carriers;
  }
  throw new Error(`Unknown plan: ${planName}`);
}

export function getPlanBins(dim, seed, plan='merkaba125+3'){
  const s = typeof seed==='number' ? seed : hashToSeed(String(seed||'harmonic'));
  return carrierPlan(dim, s, plan);
}

function tritToPhase3PSK(t){ return t===-1 ? -2*Math.PI/3 : (t===1 ? 2*Math.PI/3 : 0); }
function phaseToTrit3PSK(theta){
  const reps=[-2*Math.PI/3, 0, 2*Math.PI/3]; let a=theta%(2*Math.PI); if(a<0) a+=2*Math.PI; if(a>Math.PI) a-=2*Math.PI;
  let best=0, bd=Infinity; for (let i=0;i<reps.length;i++){ const d=Math.abs(a-reps[i]); if (d<bd){ bd=d; best=i; } }
  return best===0 ? -1 : (best===1 ? 0 : 1);
}

export function encodeMerkabaTrits(trits, {dim, seed, plan='merkaba125+3'}={}){
  const s = typeof seed==='number' ? seed : hashToSeed(String(seed||'harmonic'));
  let spec = unitarySpectrum(dim, s);
  const bins = carrierPlan(dim, s, plan);
  const count = Math.min(trits.length, bins.length);
  for (let i=0;i<count;i++){
    const phase = tritToPhase3PSK(trits[i]); const re=Math.cos(phase), im=Math.sin(phase); const k=bins[i];
    spec[k]={re,im}; spec[(dim-k)%dim]={re, im:-im};
  }
  const vector = Array.from(idftReal(spec));
  return { vector, manifest: { version:1, dim, seed:s>>>0, plan, modulation:'3psk-1trit', trits: count } };
}

export function decodeMerkabaTrits(j, {dim, seed, plan='merkaba125+3', count}={}){
  const vector = j.vector || j; const N = vector.length; const X = dftOfReal(vector);
  const s = typeof seed==='number' ? seed : hashToSeed(String(seed||'harmonic'));
  const bins = carrierPlan(dim||N, s, plan);
  const n = Math.min(count ?? bins.length, bins.length);
  const out = new Array(n);
  for (let i=0;i<n;i++){ const k=bins[i]; const z=X[k]; const theta=Math.atan2(z.im, z.re); out[i]=phaseToTrit3PSK(theta); }
  return out;
}
// --- Patricia trie helpers (browser) ---

async function sha256Hex(bytes){
  const buf = bytes.buffer ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) : bytes;
  if (crypto && crypto.subtle && crypto.subtle.digest) {
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const view = new Uint8Array(hashBuf);
    return Array.from(view).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  // Fallback (not cryptographically strong)
  let h = 0; const v = new Uint8Array(buf);
  for (let i=0;i<v.length;i++){ h = ((h<<5)-h + v[i])|0; }
  return (h>>>0).toString(16).padStart(8,'0');
}

function chunkBuffer(buf, chunkSize=8192){ const parts=[]; for(let i=0;i<buf.length;i+=chunkSize){ parts.push(buf.subarray(i, Math.min(i+chunkSize, buf.length))); } return parts; }

function canonicalizeJson(value){
  const seen = new WeakSet();
  const sorter = (v) => {
    if (v && typeof v === 'object'){
      if (seen.has(v)) throw new Error('Cyclic JSON not supported');
      seen.add(v);
      if (Array.isArray(v)) return v.map(sorter);
      const keys = Object.keys(v).sort(); const out={};
      for (const k of keys) out[k] = sorter(v[k]);
      return out;
    }
    return v;
  };
  const norm = sorter(value);
  return JSON.stringify(norm);
}

export async function encodeBufferToTrie(buffer, { dim=1024, seed='trie', chunkSize=8192, includeVectors=false }={}){
  const s = typeof seed==='number' ? seed : hashToSeed(String(seed));
  const chunks = chunkBuffer(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer), chunkSize);
  const entries = []; const leaves = {};
  for (let i=0;i<chunks.length;i++){
    const c = chunks[i]; const hash = await sha256Hex(c);
    const chunkSeed = (s ^ hashToSeed(hash))>>>0;
    const meta = { index:i, size:c.length, hash, dim, seed: chunkSeed };
    if (includeVectors){
      const { vector, manifest } = await encode(c, { dim, seed: chunkSeed });
      meta.vector = vector; meta.vectorManifest = manifest;
    }
    entries.push({ keyHex: hash, value: { hash, index: i } });
    leaves[hash] = meta;
  }
  // Minimal compressed trie: not used by decoder here, but included for completeness
  const keys = Object.keys(leaves).sort();
  const root = await sha256Hex(new TextEncoder().encode(keys.join('')));
  return { version:1, kind:'patricia-trie-chunks', root, dim, seed: s>>>0, chunkSize, chunkCount: chunks.length, trie: { /* omitted */ }, leaves };
}

export async function encodeJsonToTrie(jsonValue, opts){
  const canonical = canonicalizeJson(jsonValue);
  return encodeBufferToTrie(new TextEncoder().encode(canonical), opts);
}

export async function decodeTrieToBuffer(manifest){
  // Requires per-chunk vectors embedded
  const hashes = Object.keys(manifest.leaves).map(h=>({ h, i: manifest.leaves[h].index })).sort((a,b)=>a.i-b.i);
  const parts = [];
  for (const {h} of hashes){
    const leaf = manifest.leaves[h];
    if (!leaf.vector || !leaf.vectorManifest) throw new Error('Manifest missing vectors; cannot decode offline');
    const payload = await decode({ vector: leaf.vector, manifest: leaf.vectorManifest }, {});
    parts.push(payload);
  }
  // Concatenate Uint8Arrays
  const total = parts.reduce((n,a)=>n+a.length,0); const out = new Uint8Array(total);
  let off=0; for (const p of parts){ out.set(p, off); off+=p.length; }
  return out;
}
