const { AttentionTokenSystem } = require('../src/economy/AttentionTokenSystem');

(async () => {
  const ats = new AttentionTokenSystem();
  await ats.initialize();
  const iterations = 1_000_000;
  for (let i = 0; i < 10_000; i++) ats.getTotalSupply();
  const start = process.hrtime.bigint();
  let s = 0;
  for (let i = 0; i < iterations; i++) s += ats.getTotalSupply();
  const end = process.hrtime.bigint();
  const ns = Number(end - start);
  const opsPerSec = Math.round((iterations * 1e9) / (ns || 1));
  const report = {
    test: 'AttentionTokenSystem#getTotalSupply',
    iterations,
    nsElapsed: ns,
    opsPerSec,
    sum: s
  };
  console.log(JSON.stringify(report, null, 2));
})();
