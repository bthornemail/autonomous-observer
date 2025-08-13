# Rule Trie Research Plan

Purpose: Establish a structured, queryable Rule Trie used as a pre-mutation
guardrail for code changes, agent behaviors, and operational policies across
the Copilot Universe.

## Objectives

- Define a canonical, source-of-truth Rule Trie to guide automated and human
  changes before edits land.
- Encode rules as small, composable nodes with predicates, proofs,
  remediations, and references.
- Make rules queryable from MCP tools, CI hooks, and local scripts to gate or
  scaffold changes.

## Outcomes

- JSON Schema for rule nodes and edges (Rule Trie).
- Seed Rule Trie derived from current repo conventions and production-readiness
  goals.
- Integration points: MCP server tool, Hub/Bridge preflight, CI
  pre-commit/pre-push checks.

## Scope and Taxonomy

- Rule Categories: security, observability, testing, performance, docs,
  platform, style.
- Targets: files (globs), services (hub, bridge, agents), languages (js/ts),
  endpoints (/status, /metrics), config (env vars), and workflows (MCP/Hub
  messages).
- Node Types:
  - policy: high-level requirement (e.g., "Bridge must support JWT or API
    key").
  - constraint: concrete predicate over code/workflow (e.g., "bridge.js
    exposes /metrics").
  - remediation: fix template, recipes, or autofix hints.
  - reference: link to docs/specs/evidence.

## Data Model (high level)

- id: stable string (kebab-case).
- title, description, rationale, category, severity (info|warn|block).
- appliesTo: { files: [globs], services: [names], languages: ["js","ts"],
  endpoints?: ["/metrics"] }.
- predicates: [ { type: "regex|ast|http|metric|file|custom", expr/config } ].
- action: { onFail: "block|warn|auto-fix", fixes?: [patch templates or
  commands] }.
- evidence: { references: [urls], examples?: { good: [...], bad: [...] } }.
- edges: { depends_on?: [ids], supersedes?: [ids], related?: [ids] }.

See `docs/rule-trie/rule-trie.schema.json` for the full schema proposal.

## Sources of Truth (Research Inputs)

- Internal: PRODUCTION_READINESS_PLAN.md, hub/bridge code, MCP configs, docs in
  docs/, autonomous-observer, cleaned reports.
- External: OWASP ASVS (auth), 12-factor app, Prometheus exposition format,
  Node/Express best practices, ESLint/Prettier configs, project conventions.

## Methodology

1. Inventory and Mine
   - Parse repo: identify services, endpoints, env vars, and existing
     conventions.
   - Extract candidate rules from docs, TODOs, and PR comments.
2. Normalize
   - Collapse duplicates, define stable ids, and attach references.
   - Define predicates (regex/AST/HTTP checks) per rule.
3. Validate
   - Dry-run rules on current repo; mark violations and confirm intent with
     maintainers.
4. Prioritize
   - Tag severity and action; phase into now/next/later.
5. Integrate
   - Expose MCP tool "rule_trie_check" to query rule status by id/category.
   - Add CI gate for severity=block rules.
   - Optional preflight in Hub/Bridge startup to log violations.

## Deliverables and Milestones

- D1: Schema + seed ruleset (this change).
- D2: MCP tool to query/check rules; report generation.
- D3: CI integration (Git hooks and workflow checks) + autofix samples.
- D4: Coverage expansion (perf/tests/docs) + living governance.

## Governance and Updates

- Versioned JSON with semver.
- Changes via PR with rationale and references.
- Automated drift reports when rules conflict or are superseded.

## Initial Rule Focus (Seed)

- security: bridge requires JWT or API key; rate limiting must be enabled;
  CORS allowlist not wildcard in prod.
- observability: hub and bridge expose /metrics with key counters; /status
  returns counts.
- testing/quality: minimal integration tests for hub routing and bridge rate
  limiting.
- docs: operations runbook for health endpoints and service management.

## Next Steps

- Wire an MCP tool to load `docs/rule-trie/rule-trie.seed.json` and evaluate
  basic regex/file predicates.
- Add a CI job that runs the rule checker and fails on severity=block.
- Gradually replace regex predicates with AST/HTTP probes where appropriate.

---

Coordinator: GitHub Copilot
Date: 2025-08-12
