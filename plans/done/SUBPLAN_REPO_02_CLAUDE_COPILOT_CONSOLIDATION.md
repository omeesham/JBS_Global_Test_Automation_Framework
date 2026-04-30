# SUBPLAN: Claude/Copilot Consolidation

**Status**: PENDING
**Priority**: P1
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Goal

Make Claude the single source of truth. Copilot reads Claude's files, not its own parallel copy. Company colleagues use Copilot CLI — it must work by referencing Claude's rules.

## Problem

Rules live in two places: CLAUDE.md (LR-001 through LR-037) AND copilot-instructions.md (ALL-001 through ALL-012). Copilot already has "Claude mode" detection (lines 1-74) that reads Claude files — but lines 75-339 are a parallel system. Drift and contradiction are inevitable.

## Direction

1. Slim `.github/copilot-instructions.md` to thin pointer — keep only Copilot-specific @playwright-* agent delegation + references to CLAUDE.md and AGENT_SHARED_RULES.md
2. Deduplicate any rules that exist in both files
3. Verify sync infrastructure: `scripts/shared-types.ts` SHARED_PATHS and AGENT_FILE_MAP
4. Run `npm run validate:sync` after changes
5. Document the source-of-truth chain

## Key Files

- `.github/copilot-instructions.md` (17K — to be slimmed)
- `CLAUDE.md` (36K — primary, keep)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (shared, keep as-is)
- `scripts/shared-types.ts` (SHARED_PATHS nerve center)
- `.github/agents/*.agent.md` (6 files — keep for Copilot, synced from registry)

## What NOT to Do

- Don't delete `.github/agents/` — Copilot needs them
- Don't merge skills into Copilot — skills are Claude-only by design
- Don't break `npm run validate:sync`
