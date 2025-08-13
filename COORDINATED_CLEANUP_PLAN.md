# Coordinated Cleanup Plan

Status: Draft (for claude-code branch)
Owner: Cleanup Crew (Claude Code + Copilot + Human)
Updated: 2025-08-11

## Goals

- Reduce repo noise (build artifacts, caches, logs) without losing history.
- Standardize ignores across workspaces/apps.
- Provide safe, reversible scripts for junior contributors.
- Preserve knowledge trie and audit docs.

## Scope (Phase 1 – Safe/Non-destructive)

- Add root .gitignore and verify `packages/*` and `apps/*` inherit it.
- Add npm scripts: repo:inspect (dry-run), repo:clean (safe), repo:deepclean (opt-in).
- Do not delete any source or docs.

## Scope (Phase 2 – Targeted)

- Migrate oversized generated JSON reports to cleaned-reports/ (kept) and exclude future generations from Git.
- Ensure canonical reports remain under docs/.
- Identify duplicate binary assets and keep one authoritative copy.

## Tasks

1) Root .gitignore in place (Node, build, caches, env, logs, archives).
2) Safe scripts:
   - repo:inspect – list what would be removed.
   - repo:clean – remove node_modules/ and build outputs only.
   - repo:deepclean – also remove caches/coverage (no source).
3) Workspace parity: verify each workspace inherits ignores; add local .gitignore only as needed.
4) Document rollback and cautions.

## Commands

- Inspect (dry-run): npm run repo:inspect
- Clean (safe): npm run repo:clean
- Deep clean (opt-in): npm run repo:deepclean

## Rollback

If something seems off:
- git restore -s HEAD -- .
- Or: git checkout -- .
- Nothing in this plan deletes tracked files without explicit commit.

## Notes

- Knowledge trie JSONs under root are preserved; consider moving future large generations to cleaned-reports/.
- Autonomous Observer subproject follows the same rules.

