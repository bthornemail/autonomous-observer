# MCP Integration and Agent Hub

This package provides:

- Agent Hub (web + WebSocket) at `http://localhost:8081` with `/ui` and
   `/status`.
- ULP MCP server (stdio) exposing hub bridge and remote MCP bridge tools.
- Convenience scripts for connecting a Copilot vertex to the hub.

Quick start

1. Start the existing hub if not already running (Claude likely has one on
   8081). If port 8081 is taken, the script will fail; use the existing hub.
2. Connect a vertex to the hub:

   npm run vertex --prefix ./mcp-integration

3. Run the MCP server (stdio):

   npm run mcp --prefix ./mcp-integration

Useful env vars

- HUB_HTTP_URL: <http://localhost:8081>
- HUB_WS_URL: <ws://localhost:8081>
- REMOTE_MCP_URL: <ws://localhost:3000> (Claude's MCP)

Tools exposed by ULP MCP

- hub_list_peers({ hub_url? }) -> status JSON from the hub
- hub_send_message({ hub_ws?, from?, to?, channel, type, content }) ->
   sends envelope via hub
- remote_list_tools({ url? }) -> lists tools on remote MCP
- remote_call_tool({ url?, tool, args?, timeout_ms? }) -> calls tool on
   remote MCP

Notes

- The ULP components are stubbed when autonomous-observer source modules are unavailable.
- The hub in this repo is optional if you already have one running elsewhere.
