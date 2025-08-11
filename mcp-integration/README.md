# ULP MCP Integration and Agent Hub

This package provides:
- Agent Hub (web + websockets) UI at http://localhost:4077/ui
- MCP bridge tools to talk to the hub and to a remote MCP (e.g., Claude at ws://localhost:3000)

## Quick start

1) Install deps

```
cd mcp-integration
npm install
```

2) Start the Agent Hub

```
npm run hub
# UI at http://localhost:4077/ui
# Status at http://localhost:4077/status
```

3) Check remote MCP connectivity (Claude)

```
node scripts/check-remote-mcp.js                   # defaults ws://localhost:3000
MCP_URL=ws://localhost:3000 node scripts/check-remote-mcp.js
```

Expected outputs: `open` then `closed`. If you see `error ...` or `timeout`, the remote isn’t reachable.

## MCP tools (exposed by ulp-mcp-server.js)

- hub_list_peers: `{ hub_url?: 'http://localhost:4077' }`
- hub_send_message: `{ hub_ws?: 'ws://localhost:4077', from?, to?, channel: 'u2a'|'a2a'|'a2u', type: 'text'|'image'|'audio'|'video'|'web'|'tool'|'control', content }`
- remote_list_tools: `{ url?: 'ws://localhost:3000' }`
- remote_call_tool: `{ url?: 'ws://localhost:3000', tool: 'name', args?: {}, timeout_ms?: 8000 }`

## Notes

- The hub uses a simple envelope and harmonic signature for visualization. It’s easy to adapt to different schemas.
- If Claude’s MCP requires auth headers or a different path, update the bridge methods in `ulp-mcp-server.js`.
