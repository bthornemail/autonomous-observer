const fs = require('fs');
const path = require('path');

function scanFileFor(patterns, file) {
	const content = fs.readFileSync(file, 'utf8');
	return patterns.some((p) => p.test(content));
}

describe('Security hygiene', () => {
	test('no dangerous dynamic eval in core modules', () => {
		const targets = [
			path.join(__dirname, '..', 'src/observer/AutonomousObserver.js'),
			path.join(__dirname, '..', 'src/economy/AttentionTokenSystem.js'),
			path.join(__dirname, '..', 'src/cue/CUEFramework.js'),
		].filter(fs.existsSync);

		const patterns = [/\beval\(/, /new Function\(/];
		for (const file of targets) {
			const hasBad = scanFileFor(patterns, file);
			expect(hasBad).toBe(false);
		}
	});
});

