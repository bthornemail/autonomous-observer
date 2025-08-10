const { AttentionTokenSystem } = require('../src/economy/AttentionTokenSystem');

describe('Performance benchmark', () => {
	test('measure getTotalSupply throughput', async () => {
		const ats = new AttentionTokenSystem();
		await ats.initialize();
		const iterations = 100000;
		// Warmup
		for (let i = 0; i < 1000; i++) ats.getTotalSupply();
		const start = Date.now();
		let sum = 0;
		for (let i = 0; i < iterations; i++) sum += ats.getTotalSupply();
		const ms = Date.now() - start;
		const opsPerSec = Math.round((iterations / (ms || 1)) * 1000);
		// Basic sanity checks
		expect(sum).toBeGreaterThan(0);
		// Emit a simple benchmark line for visibility in CI logs
		console.log(`[bench] getTotalSupply: ${iterations} ops in ${ms}ms => ~${opsPerSec} ops/sec`);
	});
});

