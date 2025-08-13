#!/usr/bin/env node
// Quick connectivity check to a remote MCP (default ws://localhost:3000)
import WebSocket from 'ws';
import http from 'node:http';

const wsUrl = process.env.MCP_URL || 'ws://localhost:3000';
const httpUrl = wsUrl.replace(/^ws/, 'http');
const candidatePaths = (process.env.MCP_WS_PATHS || '/,/ws,/mcp,/socket,/connect,/mcp/ws,/v1/mcp').split(',').map(s => s.trim());
const candidateProtocols = (process.env.MCP_WS_PROTOCOLS || 'default,mcp,jsonrpc').split(',').map(s => s.trim());

function checkHTTP(u) {
	return new Promise((resolve) => {
		try {
			const req = http.get(u, (res) => {
				const { statusCode } = res; res.resume();
				resolve({ ok: true, statusCode });
			});
			req.on('error', (e) => resolve({ ok: false, error: e.message }));
			req.setTimeout(3000, () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
		} catch (e) { resolve({ ok: false, error: String(e) }); }
	});
}

function checkWS(u, protoLabel = 'default') {
	return new Promise((resolve) => {
		let timer;
		try {
			const protocols = protoLabel === 'default' ? undefined : [protoLabel];
			const ws = new WebSocket(u, protocols);
			ws.on('open', () => { resolve({ ok: true, event: 'open', protocol: ws.protocol || protoLabel }); try{ ws.close(); }catch{} clearTimeout(timer); });
			ws.on('error', (e) => { resolve({ ok: false, error: e.message, protocol: protoLabel }); clearTimeout(timer); });
			timer = setTimeout(() => { resolve({ ok: false, error: 'timeout', protocol: protoLabel }); try{ ws.close(); }catch{} }, 4000);
		} catch (e) { resolve({ ok: false, error: String(e), protocol: protoLabel }); }
	});
}

async function main() {
		const httpRes = await checkHTTP(httpUrl);
		const wsMatrix = {};
		for (const p of candidatePaths) {
			const full = p === '/' || p === '' ? wsUrl : wsUrl.replace(/\/$/, '') + p;
			wsMatrix[p || '/'] = {};
			for (const proto of candidateProtocols) {
				// eslint-disable-next-line no-await-in-loop
				wsMatrix[p || '/'][proto] = await checkWS(full, proto);
				if (wsMatrix[p || '/'][proto].ok) break; // stop at first success per path
			}
		}
		const out = { http: httpRes, ws: wsMatrix };
	// Print compact one-line result for quick inspection
	console.log(JSON.stringify(out));
}

main().catch((e) => { console.error('check failed', e); process.exit(1); });
