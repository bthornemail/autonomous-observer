import { Complex, fft, ifft, multiplyComplex, divideComplex, realToComplex, nextPowerOfTwo } from './fft';

/**
 * Circular convolution via FFT: O(N log N)
 * If length not power-of-two, uses zero-pad to next power-of-two, then wraps to N.
 */
export function circularConvolution(x: number[], y: number[]): number[] {
  const n = x.length;
  if (y.length !== n) throw new Error('Length mismatch');
  const m = nextPowerOfTwo(n);
  const X = fft(realToComplex(x, m));
  const Y = fft(realToComplex(y, m));
  const Z: Complex[] = new Array(m);
  for (let i = 0; i < m; i++) Z[i] = multiplyComplex(X[i], Y[i]);
  const z = ifft(Z);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = z[i].re; // wrap-around inherent
  return out;
}

/**
 * Deconvolution (approximate unbinding): z ⊘ x ≈ y using frequency-domain division.
 * Adds epsilon to avoid blow-up at near-zero frequencies.
 */
export function circularDeconvolution(z: number[], x: number[], eps = 1e-8): number[] {
  const n = z.length;
  if (x.length !== n) throw new Error('Length mismatch');
  const m = nextPowerOfTwo(n);
  const Z = fft(realToComplex(z, m));
  const X = fft(realToComplex(x, m));
  const Y: Complex[] = new Array(m);
  for (let i = 0; i < m; i++) {
    // stabilize division
    const denom = { re: X[i].re, im: X[i].im };
    const num = { re: Z[i].re, im: Z[i].im };
    const d = denom.re * denom.re + denom.im * denom.im;
    const safeDenom = d < eps ? { re: denom.re + eps, im: denom.im } : denom;
    Y[i] = divideComplex(num, safeDenom, eps);
  }
  const y = ifft(Y);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = y[i].re;
  return out;
}
