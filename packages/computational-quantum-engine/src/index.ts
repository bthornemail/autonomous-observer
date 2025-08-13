export * from './fft';
export * from './circularConvolution';
import { circularConvolution, circularDeconvolution } from './circularConvolution';

export interface CQEBindResult {
  bound: number[];
}

export interface CQEEngineConfig {
  epsilon?: number;
}

export class ComputationalQuantumEngine {
  private epsilon: number;
  constructor(cfg: CQEEngineConfig = {}) {
    this.epsilon = cfg.epsilon ?? 1e-8;
  }
  bind(a: number[], b: number[]): CQEBindResult {
    return { bound: circularConvolution(a, b) };
  }
  unbind(bound: number[], known: number[]): number[] {
    return circularDeconvolution(bound, known, this.epsilon);
  }
  normalize(x: number[]): number[] {
    const norm = Math.hypot(...x);
    if (!isFinite(norm) || norm === 0) return x.slice();
    return x.map(v => v / norm);
  }
}
