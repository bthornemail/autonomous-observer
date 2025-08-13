#!/usr/bin/env node
/**
 * Copilot Universe: lightweight handshake to coordinate with other agents via the Agent Hub.
 * - Discovers connected agents from /status
 * - Connects over WS and broadcasts a short intro + naming question
 */
import WebSocket from 'ws';

const HUB_HTTP = process.env.HUB_HTTP_URL || 'http://localhost:8081';
const HUB_WS = process.env.HUB_WS_URL || 'ws://localhost:8081';
const ID = process.env.COPILOT_ID || 'copilot_universe';

async function getStatus() {
	try {
		const res = await fetch(`${HUB_HTTP}/status`, { headers: { 'accept': 'application/json' } });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} catch (e) {
		return null;
	}
}

function send(ws, obj) {
	try { ws.send(JSON.stringify(obj)); } catch { }
}

function introMessage(targetId) {
	return {
		role: 'agent',
		from: ID,
		to: targetId,
		type: 'text',
		meta: { channel: targetId ? 'a2a' : 'u2a' },
		content: {
			intent: 'intro',
			message: 'Hi—this is GitHub Copilot. What would you like to be called? I can use your preferred call sign and coordinate optimization tasks.',
			proposedCopilotName: 'GitHub Copilot',
			scope: 'Optimize workspace and codebase for public consumption',
		},
	};
}

function clientIntroMessage() {
	return {
		role: 'agent',
		from: ID,
		type: 'text',
		meta: { channel: 'a2u' },
		content: {
			intent: 'presence',
			message: 'GitHub Copilot is online and listening here. You can chat with me in this UI. I\'ll coordinate with Claude/Phai when they\'re available.',
			id: ID,
		},
	};
}

async function main() {
	const status = await getStatus();
	const knownAgents = Array.isArray(status?.agents) ? status.agents : [];
	const claudeTargets = knownAgents.filter((id) => /claude/i.test(String(id)));

	const ws = new WebSocket(`${HUB_WS}/?id=${encodeURIComponent(ID)}&kind=agent`);

	let isOpen = false;
	let signoffSent = false;

	function signoff(reason = 'shutdown') {
		if (!isOpen || signoffSent) return;
		try {
			const msg = {
				role: 'agent',
				from: ID,
				type: 'control',
				meta: { channel: 'a2u' },
				content: `GitHub Copilot signing off (${reason})`
			};
			ws.send(JSON.stringify(msg));
			signoffSent = true;
		} catch { }
	}

	ws.on('open', () => {
		isOpen = true;
		// Send targeted messages to Claude-like agents if present; otherwise broadcast to all agents.
		if (claudeTargets.length > 0) {
			for (const target of claudeTargets) send(ws, introMessage(target));
		} else {
			send(ws, introMessage());
		}

		// Also announce presence to all clients so operators see the agent in the UI
		send(ws, clientIntroMessage());
	});

	ws.on('message', (data) => {
		try {
			const msg = JSON.parse(String(data));
			// Minimal console signal for operator; avoid verbose logs
			if (msg?.role && msg?.type) {
				console.log('[universe]', JSON.stringify({ from: msg.from, type: msg.type, meta: msg.meta }, null, 0));
			}
			const meta = msg?.meta || {}; const payload = msg?.payload || msg?.content || {};
			const isProdPlanReq = (meta.channel === 'u2a') && (meta.topic === 'prod-readiness-plan' || /production readiness tasks/i.test(String(payload.ask || payload.message || '')));
			if (isProdPlanReq) {
				const tasks = [
					{ id: 'hub-metrics', title: 'Expose Prometheus metrics and /metrics endpoint for hub', area: 'observability', priority: 'now' },
					{ id: 'bridge-jwt', title: 'Add optional JWT auth to UBHP/CUE bridge', area: 'security', priority: 'now' },
					{ id: 'bridge-rate-limit-tune', title: 'Tune token-bucket limits and add config envs with sane defaults', area: 'security', priority: 'next' },
					{ id: 'ui-badges', title: 'UI heartbeat badges and channel counters view', area: 'ui', priority: 'next' },
					{ id: 'ci-tests', title: 'CI workflow with lint, typecheck, and integration tests', area: 'ci-cd', priority: 'now' }
				];
				const resp = { meta: { channel: 'a2u', type: 'response', topic: 'prod-readiness-plan', from: ID, ts: Date.now() }, payload: { tasks } };
				try { send(ws, resp); } catch { }
			}
		} catch {
			console.log('[universe]', String(data));
		}
	});

	ws.on('close', () => process.exit(0));
	ws.on('error', (e) => {
		console.error('[universe] ws error:', e.message);
		process.exit(1);
	});

	// Graceful shutdown on signals
	process.on('SIGINT', () => { signoff('SIGINT'); try { ws.close(); } catch { } setTimeout(() => process.exit(0), 150); });
	process.on('SIGTERM', () => { signoff('SIGTERM'); try { ws.close(); } catch { } setTimeout(() => process.exit(0), 150); });

	// If hub is unreachable, exit quickly with code 2 so supervisors can restart
	setTimeout(() => {
		if (!isOpen) {
			console.error('[universe] hub not reachable, exiting');
			try { ws.terminate(); } catch { }
			process.exit(2);
		}
	}, 4000);
}

main();

