# ULP Monorepo Restructure: SDK, Provider/Broker, Client, Seeds

Objective: consolidate history and reorganize into a production-grade structure for spawning and connecting autonomous “universes” (agents + data + agreements), exposing a clean SDK, a provider/broker server, client packages, and reproducible seeds.

## Target layout (packages/ workspace)

packages/

- ulp-sdk/                # Core TypeScript SDK (types, client adapters, utilities)
- ulp-mcp-provider/       # Front-facing Provider/Broker MCP server (stdio/http)
- ulp-mcp-client/         # Front-facing client package (host integrations + helpers)
- ulp-seeds/              # Seed packs: data, prompts, templates, fixtures
- ulp-governance/         # Governance artifacts: proposal schemas, validators
- ulp-reputation-graph/   # Graph DSL + persistence (Neo4j/Memgraph bindings)
- ulp-index/              # Vector + search indexers (Qdrant/Chroma + Meilisearch)
- ulp-devkit/             # Dev tooling: codemods, scaffolds, codegen, E2E harness

apps/

- ulp-universe-sim/       # Local universe spawner (CLI + dashboard)
- ulp-observer/           # Existing autonomous-observer app (migrate here later)

config/

- mcp/                    # Composable MCP configs (dev, ci, prod)
- lint/                   # ESLint, Prettier, Markdownlint shared configs
- ts/                     # TS project references

## Package contracts

### ulp-sdk

- Types: Veritas claims, Consensio agreements, credentials, dispute outcomes
- Client: MCP host client wrapper + typed tooling (with codegen based on discovery)
- Utilities: provenance hashing, signature helpers, embedding adapters
- Error model: typed results with discriminated unions; retry/backoff utilities

### ulp-mcp-provider (Broker)

- Purpose: unified MCP server exposing
  - Evidence: fetch/search/scrape; vector/search entries; provenance receipts
  - State: Prisma-backed canonical store; versioned migrations
  - Reputation: graph ops; attestations; score calculators
  - Governance: proposal lifecycles; policy checks; PR helpers
  - Execution: sandbox/job queue runners; external MCP delegates
- Transport: stdio (local dev) + optional HTTP/SSE
- Multi-tenant: workspace isolation; per-tenant secrets via env/keystore

### ulp-mcp-client

- Purpose: thin client for hosts (VS Code, Claude Code, Cline, Cursor) with
  - Autodiscovery + typings
  - Helper flows (seed universe, open PR, run test plan, produce report)
  - Safe-ops guardrails for file/git access

### ulp-seeds

- Data packs: demo identities (DID/VC stubs), listings, agreements, disputes
- Index packs: vector + search bootstrap
- Scenarios: scripted multi-universe interactions and expected outcomes

## Development stack alignment

- Use docs/DEV_MCP_STACK.md as the baseline for servers
- Provider delegates to external servers (filesystem, git, fetch, prisma, qdrant, meili, codacy, snyk, etc.)
- Client ships convenience installers for dev profiles

## Migration plan

1. Workspace prep
   - Add PNPM/Turbo (or Nx) for multi-package orchestration
   - Create packages per layout; move existing MCP code under ulp-mcp-provider
2. Code extraction
   - Centralize shared types/utilities into ulp-sdk
   - Route existing Codacy bridge under provider with proper tool names
3. Index & graph
   - Introduce ulp-index (Qdrant/Chroma + Meili) and ulp-reputation-graph (Neo4j/Memgraph)
   - Add ETL jobs to import current reports into vector/search/graph
4. Seeds
   - Extract canonical examples from cleaned-reports/ and docs into ulp-seeds
   - Provide make:seed CLI via ulp-universe-sim
5. Clients
   - Build ulp-mcp-client host adapters (VS Code/Claude Code config generators)
6. Quality gates
   - Unify ESLint/Prettier/Markdownlint + TypeScript references
   - CI: run codacy + snyk + unit/e2e; fail on regressions

## Versioning & releases

- Independent package versions with changesets
- Provider/server pinned to SDK minor; client pinned to SDK minor

## Security & secrets

- Strict env var loading (dotenv-safe); never commit secrets
- Optional keychain/backed secret providers per environment

## Next actionable steps

- Approve layout and package list
- I’ll scaffold packages + initial READMEs + tsconfigs + lint configs, migrate current MCP files, and wire the dev MCP profile.
