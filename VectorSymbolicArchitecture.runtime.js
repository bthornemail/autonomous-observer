// Minimal JS runtime version of VectorSymbolicArchitecture
// Includes FFT-based circular convolution for 'fft' backend without requiring TS build

class VectorSymbolicArchitecture {
  constructor(dimension = 1024, backend = 'fft') {
    this.phi = (1 + Math.sqrt(5)) / 2;
    this.vectorDimension = dimension;
    this.backend = backend;
  }

  // --- Public API used by tests ---
  bindVectors(...vectors) {
    if (!vectors.length) throw new Error('Cannot bind empty vector set');
    let result = vectors[0];
    for (let i = 1; i < vectors.length; i++) {
      result = this.vectorBind(result, vectors[i]);
    }
    return result;
  }

  unbindVector(boundVector, knownVector) {
    if (this.backend === 'fft') {
      const recovered = circularDeconvolution(boundVector.dimensions, knownVector.dimensions, 0);
      return {
        dimensions: this.normalizeVector(recovered),
        semanticBinding: `unbind(${boundVector.semanticBinding}, ${knownVector.semanticBinding})`,
        phiRatio: this.phi,
      };
    }
    // naive correlation fallback
    const N = this.vectorDimension;
    const out = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const k = (i - j + N) % N;
        out[k] += boundVector.dimensions[i] * knownVector.dimensions[j];
      }
    }
    return {
      dimensions: this.normalizeVector(out),
      semanticBinding: `unbind(${boundVector.semanticBinding}, ${knownVector.semanticBinding})`,
      phiRatio: this.phi,
    };
  }

  // Exposed in tests via bracket access
  encodeHDVector(input, properties) {
    if (this.backend === 'fft') {
      // Deterministic unitary HRR-style encoding with unit-magnitude spectrum
      const N = this.vectorDimension;
      const seed = hashToSeed(`${input}|${JSON.stringify(properties)}`);
      const rand = mulberry32(seed);
      const F = new Array(N);
      // DC component
      F[0] = complex(1, 0);
      const half = Math.floor(N / 2);
      for (let k = 1; k < N; k++) F[k] = complex(0, 0); // init
      // Conjugate symmetric spectrum to ensure real time-domain vector
      const upper = (N % 2 === 0) ? (half - 1) : half;
      for (let k = 1; k <= upper; k++) {
        const theta = 2 * Math.PI * rand();
        const c = complex(Math.cos(theta), Math.sin(theta));
        F[k] = c;
        F[N - k] = conj(c);
      }
      if (N % 2 === 0) {
        // Nyquist frequency must be real for conjugate symmetry
        F[half] = complex(1, 0);
      }
      const x = idftDirect(F);
      const dims = new Array(N);
      for (let n = 0; n < N; n++) dims[n] = x[n].re;
      return {
        dimensions: this.normalizeVector(dims),
        semanticBinding: input,
        phiRatio: this.phi,
      };
    } else {
      const dims = new Array(this.vectorDimension).fill(0);
      for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        const index = (charCode * this.phi * (i + 1)) % this.vectorDimension;
        dims[Math.floor(index)] += 1;
      }
      properties.forEach((prop, idx) => {
        const propStr = String(prop);
        for (let i = 0; i < propStr.length; i++) {
          const charCode = propStr.charCodeAt(i);
          const index = (charCode * this.phi * (idx + 1)) % this.vectorDimension;
          dims[Math.floor(index)] += Math.pow(this.phi, idx);
        }
      });
      return {
        dimensions: this.normalizeVector(dims),
        semanticBinding: input,
        phiRatio: this.phi,
      };
    }
  }

  // --- Internals ---
  normalizeVector(dimensions) {
    const mag = Math.sqrt(dimensions.reduce((s, d) => s + d * d, 0));
    return mag > 0 ? dimensions.map((d) => d / mag) : dimensions;
  }

  vectorBind(v1, v2) {
    if (this.backend === 'fft') {
      const bound = circularConvolution(v1.dimensions, v2.dimensions);
      return {
        dimensions: this.normalizeVector(bound),
        semanticBinding: `bind(${v1.semanticBinding}, ${v2.semanticBinding})`,
        phiRatio: this.phi,
      };
    }
    const N = this.vectorDimension;
    const out = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const k = (i + j) % N;
        out[k] += v1.dimensions[i] * v2.dimensions[j];
      }
    }
    return {
      dimensions: this.normalizeVector(out),
      semanticBinding: `bind(${v1.semanticBinding}, ${v2.semanticBinding})`,
      phiRatio: this.phi,
    };
  }
}

// --- FFT utilities (radix-2 Cooley–Tukey, recursive) + Bluestein for arbitrary N ---
function isPowerOfTwo(n) { return (n & (n - 1)) === 0; }
function nextPowerOfTwo(n) { let p = 1; while (p < n) p <<= 1; return p; }

function complex(re = 0, im = 0) { return { re, im }; }
function add(a, b) { return { re: a.re + b.re, im: a.im + b.im }; }
function sub(a, b) { return { re: a.re - b.re, im: a.im - b.im }; }
function mul(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }
function conj(a) { return { re: a.re, im: -a.im }; }

function expi(theta) { return { re: Math.cos(theta), im: Math.sin(theta) }; }

function fft(arr) {
  const n = arr.length;
  if (n === 1) return [complex(arr[0].re, arr[0].im)];
  const half = n >> 1;
  const even = new Array(half);
  const odd = new Array(half);
  for (let i = 0; i < half; i++) {
    even[i] = arr[2 * i];
    odd[i] = arr[2 * i + 1];
  }
  const Fe = fft(even);
  const Fo = fft(odd);
  const out = new Array(n);
  for (let k = 0; k < half; k++) {
    const tw = expi((-2 * Math.PI * k) / n);
    const t = mul(tw, Fo[k]);
    out[k] = add(Fe[k], t);
    out[k + half] = sub(Fe[k], t);
  }
  return out;
}

function ifft(arr) {
  const n = arr.length;
  // Conjugate, FFT, conjugate, scale
  const conjugated = arr.map(conj);
  const F = fft(conjugated);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const c = conj(F[i]);
    out[i] = { re: c.re / n, im: c.im / n };
  }
  return out;
}

function realToComplex(arr, size) {
  const out = new Array(size);
  for (let i = 0; i < size; i++) {
    out[i] = complex(i < arr.length ? arr[i] : 0, 0);
  }
  return out;
}

// Convolution of complex sequences via power-of-two FFT
function convComplex(a, b) {
  const n = a.length + b.length - 1;
  const L = nextPowerOfTwo(n);
  const A = fft([...a, ...new Array(L - a.length).fill(complex(0, 0))]);
  const B = fft([...b, ...new Array(L - b.length).fill(complex(0, 0))]);
  const C = new Array(L);
  for (let i = 0; i < L; i++) C[i] = mul(A[i], B[i]);
  const c = ifft(C);
  return c.slice(0, n);
}

// Bluestein's algorithm for DFT of arbitrary length N
function dftDirect(xc) {
  const N = xc.length;
  const out = new Array(N);
  for (let k = 0; k < N; k++) {
    let sumRe = 0, sumIm = 0;
    const angBase = -2 * Math.PI * k / N;
    for (let n = 0; n < N; n++) {
      const ang = angBase * n;
      const c = { re: Math.cos(ang), im: Math.sin(ang) };
      // xc[n] * c
      sumRe += xc[n].re * c.re - xc[n].im * c.im;
      sumIm += xc[n].re * c.im + xc[n].im * c.re;
    }
    out[k] = { re: sumRe, im: sumIm };
  }
  return out;
}

function idftDirect(X) {
  const N = X.length;
  const out = new Array(N);
  for (let n = 0; n < N; n++) {
    let sumRe = 0, sumIm = 0;
    const angBase = 2 * Math.PI * n / N;
    for (let k = 0; k < N; k++) {
      const ang = angBase * k;
      const c = { re: Math.cos(ang), im: Math.sin(ang) };
      sumRe += X[k].re * c.re - X[k].im * c.im;
      sumIm += X[k].re * c.im + X[k].im * c.re;
    }
    out[n] = { re: sumRe / N, im: sumIm / N };
  }
  return out;
}

// --- Deterministic PRNG helpers for encoding ---
function hashToSeed(str) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circularConvolution(x, y) {
  if (x.length !== y.length) throw new Error('Vector length mismatch');
  const N = x.length;
  const X = dftDirect(realToComplex(x, N));
  const Y = dftDirect(realToComplex(y, N));
  const Z = new Array(N);
  for (let i = 0; i < N; i++) Z[i] = mul(X[i], Y[i]);
  const z = idftDirect(Z);
  const out = new Array(N);
  for (let i = 0; i < N; i++) out[i] = z[i].re;
  return out;
}

function circularDeconvolution(bound, known, eps = 0) {
  if (bound.length !== known.length) throw new Error('Vector length mismatch');
  const N = bound.length;
  const Z = dftDirect(realToComplex(bound, N));
  const X = dftDirect(realToComplex(known, N));
  let minAbs = Infinity;
  for (let i = 0; i < N; i++) {
    const mag = Math.hypot(X[i].re, X[i].im);
    if (mag < minAbs) minAbs = mag;
  }
  let y;
  if (minAbs > 1e-8) {
    // Well-conditioned: true deconvolution
    const Y = new Array(N);
    for (let i = 0; i < N; i++) {
      const denom = X[i].re * X[i].re + X[i].im * X[i].im + eps;
      const num = mul(Z[i], conj(X[i]));
      Y[i] = { re: num.re / denom, im: num.im / denom };
    }
    y = idftDirect(Y);
  } else {
    // Ill-conditioned: fall back to correlation (no division)
    const Yc = new Array(N);
    for (let i = 0; i < N; i++) Yc[i] = mul(Z[i], conj(X[i]));
    y = idftDirect(Yc);
  }
  const out = new Array(N);
  for (let i = 0; i < N; i++) out[i] = y[i].re;
  return out;
}

module.exports = { VectorSymbolicArchitecture };
