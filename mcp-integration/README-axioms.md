# MCP Axiom Tools

This repository exposes test-and-sign tools via the ULP MCP Server (`mcp-integration/ulp-mcp-server.js`).

Tools:

- axiom_run_tests: Compiles CQE (tsc) and runs CQE+VSA smoke, plus
   pentad/merkaba demos. Returns summary and logs.
- axiom_sign: Signs a passing summary with SHA-256 (optional HMAC). Writes
   artifacts to axioms/axiom-[timestamp].json.
- cqe_bind_unbind_assert: Single assertion for bind/unbind RMSE < 1e-10.

Quick use with the MCP server:
1) Start the server (stdio):
   node mcp-integration/ulp-mcp-server.js

2) From your MCP client, call:

   - List tools → run axiom_run_tests
   - If pass=true, pass returned summary to axiom_sign

Env:

- MCP_AXIOM_SECRET: Optional HMAC key for axiom_sign.
