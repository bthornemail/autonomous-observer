/**
 * Lightweight complex FFT (Cooley-Tukey, radix-2) for real sequences.
 * - FFT, IFFT on arrays of length power-of-two
 * - Complex numbers as { re, im }
 */

export interface Complex { re: number; im: number }

export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

export function fft(input: Complex[]): Complex[] {
  const n = input.length;
  if (!isPowerOfTwo(n)) throw new Error(`FFT length must be power of two, got ${n}`);
  const a = input.slice();
  // bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >>> 1;
    for (; j & bit; bit >>>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
  }
  // Danielson-Lanczos
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wlen = { re: Math.cos(ang), im: Math.sin(ang) };
    for (let i = 0; i < n; i += len) {
      let w = { re: 1, im: 0 };
      for (let j = 0; j < (len >>> 1); j++) {
        const u = a[i + j];
        const v = multiplyComplex(a[i + j + (len >>> 1)], w);
        a[i + j] = { re: u.re + v.re, im: u.im + v.im };
        a[i + j + (len >>> 1)] = { re: u.re - v.re, im: u.im - v.im };
        w = multiplyComplex(w, wlen);
      }
    }
  }
  return a;
}

export function ifft(input: Complex[]): Complex[] {
  // Conjugate, FFT, conjugate, scale by 1/n
  const n = input.length;
  const conj = input.map(({ re, im }) => ({ re, im: -im }));
  const y = fft(conj);
  return y.map(({ re, im }) => ({ re: re / n, im: -im / n }));
}

export function multiplyComplex(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

export function divideComplex(a: Complex, b: Complex, eps = 1e-12): Complex {
  const denom = b.re * b.re + b.im * b.im;
  const d = denom < eps ? eps : denom;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}

export function realToComplex(x: number[], padTo?: number): Complex[] {
  const n = padTo ?? x.length;
  const out: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) out[i] = { re: i < x.length ? x[i] : 0, im: 0 };
  return out;
}

export function complexToReal(x: Complex[]): number[] {
  const out = new Array<number>(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i].re;
  return out;
}
