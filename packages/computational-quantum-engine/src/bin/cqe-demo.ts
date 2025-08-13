#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;
import { ComputationalQuantumEngine } from '..';

function randVec(n: number): number[] {
  const v = new Array<number>(n);
  for (let i = 0; i < n; i++) v[i] = Math.random() * 2 - 1;
  return v;
}

async function main() {
  const n = Number(process.env.DIM || 1024);
  const engine = new ComputationalQuantumEngine({ epsilon: 1e-8 });
  const a = randVec(n);
  const b = randVec(n);
  const { bound } = engine.bind(a, b);
  const approxB = engine.unbind(bound, a);
  // measure reconstruction error
  const err = Math.sqrt(approxB.reduce((s, v, i) => s + (v - b[i]) * (v - b[i]), 0) / n);
  console.log(JSON.stringify({ n, rmse: err }));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
