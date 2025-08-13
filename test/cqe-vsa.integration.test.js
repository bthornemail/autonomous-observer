/*
  CQE + VSA integration test: verifies bind/unbind property for fft backend
*/

const path = require('path');

describe('VSA fft backend bind/unbind', () => {
  // Use the JS runtime version to avoid TS compile during Jest
  const VSA = require(path.resolve(__dirname, '..', 'VectorSymbolicArchitecture.runtime.js'));

  it('recovers the second vector when unbinding with the first (power-of-two)', () => {
    const N = 1024;
    const vsa = new VSA.VectorSymbolicArchitecture(N, 'fft');
    const a = vsa['encodeHDVector']('alpha', ['x', 42]);
    const b = vsa['encodeHDVector']('beta', ['y', 7]);
    const bound = vsa.bindVectors(a, b);
    const recoveredB = vsa.unbindVector(bound, a);

    const rmse = Math.sqrt(
      recoveredB.dimensions.reduce((acc, v, i) => acc + Math.pow(v - b.dimensions[i], 2), 0) / N
    );
    expect(rmse).toBeLessThan(1e-10);
  });

  it('recovers for non-power-of-two dimension via internal zero-padding', () => {
    const N = 1500; // not a power of two
    const vsa = new VSA.VectorSymbolicArchitecture(N, 'fft');
    const a = vsa['encodeHDVector']('gamma', ['p', 3]);
    const b = vsa['encodeHDVector']('delta', ['q', 9]);
    const bound = vsa.bindVectors(a, b);
    const recoveredB = vsa.unbindVector(bound, a);

    const rmse = Math.sqrt(
      recoveredB.dimensions.reduce((acc, v, i) => acc + Math.pow(v - b.dimensions[i], 2), 0) / N
    );
    expect(rmse).toBeLessThan(1e-10);
  });
});
