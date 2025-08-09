#!/usr/bin/env node
const AutonomousUniverseRouter = require('../src/universe/AutonomousUniverseRouter');

const router = new AutonomousUniverseRouter({
  universePort: process.env.UNIVERSE_PORT || 3001,
  mcpPort: process.env.MCP_PORT || 3002,
  a2aPort: process.env.A2A_PORT || 3003,
});

process.on('SIGINT', async () => {
  try { await router.stop?.(); } catch (_) {}
  process.exit(0);
});
