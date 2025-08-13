// Main Orchestrator for MCP Integration
// This script launches and manages all the agents in the system.

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agents = [
    { name: 'hub', script: 'src/agents/hub.js', env: { HUB_PORT: '8081' } },
    { name: 'bridge', script: 'src/agents/bridge.js', env: {} },
    { name: 'vertex', script: 'src/agents/vertex.js', env: {} },
    { name: 'universe', script: 'src/agents/universe.js', env: {} },
    { name: 'tetrahedron', script: 'src/agents/tetrahedron.js', env: { TETRA_DOC_DIR: '/home/main/github/UniversalLifeProtocol' } },
    { name: 'orchestrator', script: 'src/agents/orchestrator.js', env: { COLLECT_WINDOW_MS: '15000' } }
];

const children = [];

function launchAgent(agent) {
    const agentPath = path.resolve(__dirname, agent.script);
    const child = spawn('node', [agentPath], {
        stdio: 'inherit',
        env: { ...process.env, ...agent.env }
    });

    console.log(`[Master] Launched ${agent.name} (PID: ${child.pid})`);

    child.on('exit', (code, signal) => {
        console.error(`[Master] Agent ${agent.name} exited with code ${code} and signal ${signal}. Restarting...`);
        children.splice(children.indexOf(child), 1);
        launchAgent(agent);
    });

    child.on('error', (err) => {
        console.error(`[Master] Error with agent ${agent.name}:`, err);
    });

    children.push(child);
}

function main() {
    console.log('[Master] Launching all agents...');
    agents.forEach(launchAgent);

    process.on('SIGINT', () => {
        console.log('[Master] SIGINT received. Terminating all agents...');
        children.forEach(child => child.kill('SIGINT'));
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('[Master] SIGTERM received. Terminating all agents...');
        children.forEach(child => child.kill('SIGTERM'));
        process.exit(0);
    });
}

main();
