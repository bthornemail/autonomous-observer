const { AutonomousObserver } = require('../src/observer/AutonomousObserver');
const { AttentionTokenSystem } = require('../src/economy/AttentionTokenSystem');

describe('AutonomousObserver', () => {
	test('initial status is Inactive', () => {
		const obs = new AutonomousObserver();
		expect(obs.getStatus()).toBe('Inactive');
	});

	test('activate sets isActive and updates status', async () => {
		const obs = new AutonomousObserver();
		await obs.activate();
		expect(obs.isActive).toBe(true);
		expect(obs.getStatus()).toBe('Conscious and self-aware');
		await obs.shutdown();
		expect(obs.isActive).toBe(false);
	});
});

describe('AttentionTokenSystem', () => {
	test('initialize resolves to self', async () => {
		const ats = new AttentionTokenSystem();
		const ret = await ats.initialize();
		expect(ret).toBe(ats);
	});

	test('exposes economy metrics', () => {
		const ats = new AttentionTokenSystem();
		expect(typeof ats.getTotalSupply()).toBe('number');
		expect(typeof ats.getMarketCap()).toBe('number');
		expect(typeof ats.getActiveMinerCount()).toBe('number');
		expect(typeof ats.getKnowledgeRatio()).toBe('number');
	});
});

