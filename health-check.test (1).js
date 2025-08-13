const server = require('../../ulp-mcp-server');

describe('MCP Integration - Health Check', () => {
  test('healthCheck function exists and returns ok', async () => {
    expect(typeof server.healthCheck).toBe('function');
    const res = await server.healthCheck();
    expect(res).toEqual({ status: 'ok' });
  });
});
