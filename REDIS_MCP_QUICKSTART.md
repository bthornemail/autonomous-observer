# Redis MCP Quickstart (Claude + VS Code)

Use Redis with Claude (and optionally VS Code Copilot) via the free Model Context Protocol Redis server. This stays zero-cost and local-first.

## Requirements
- Redis server (local or remote)
- Node.js 18+ (for running the MCP server via npx)
- Docker (optional, only if you prefer to run Redis via container)

## Start a Redis instance

Choose one approach:

- Linux service (Debian/Ubuntu):
```bash
sudo apt-get update
sudo apt-get install -y redis-server
sudo systemctl enable --now redis-server
# default URI: redis://localhost:6379
```

- Docker (any OS):
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
# default URI: redis://localhost:6379
```

## Run the Redis MCP server
Set REDIS_URL to your Redis instance and start the MCP server (stdio):

```bash
export REDIS_URL=redis://localhost:6379
npx @modelcontextprotocol/server-redis
```

Keep this running while you use Claude or Copilot.

## Claude configuration
Your repo already has `.claude/settings.local.json` with the Redis MCP server enabled under `enabledMcpjsonServers`. Ensure the MCP server process above is running and that your Claude runtime can discover it (project-level `.mcp.json`, or your editor’s MCP integration).

## VS Code Copilot configuration (optional)
If you’d like Copilot Chat to use Redis tools, add this to your project `.mcp.json` (create if missing) or to `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-redis"],
      "env": {
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}
```

Note: If you already manage MCP servers elsewhere (global config), keep this in sync, but avoid duplicating conflicting entries.

## Sanity check
- In Claude or Copilot Chat, list available tools; you should see Redis.
- Try a simple set/get round-trip using the Redis tool operations (names may differ depending on client UI):
  - Set: key = `mcp:test`, value = `hello` (with TTL optional)
  - Get: key = `mcp:test` → expect `hello`

If the tool isn’t available:
- Verify the MCP server process is running (npx server above).
- Verify REDIS_URL points to a reachable instance.
- Check that your editor is using the project `.mcp.json` (or your global MCP config), and restart the editor if needed.

## Tips
- Use a separate Redis db or key prefix per project: `REDIS_URL=redis://localhost:6379/3` or prefix keys with `ulp:`.
- For remote Redis, prefer TLS URLs and credentials, and do not commit secrets.
- If port conflicts occur, remap Redis with Docker (`-p 6380:6379`) and update REDIS_URL accordingly.
