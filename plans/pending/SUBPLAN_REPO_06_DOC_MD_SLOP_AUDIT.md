# SUBPLAN: Doc & MD Slop Audit

**Status**: PENDING
**Priority**: P1-CYCLE-2
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Goal

Audit every MD file and doc that agents have edited. Clean data slop, stale references, contradictions, bloat. If scope is too large, create sub-subplans per document group.

## Scope

**INCLUDE**: REQUIREMENTS.md, specs_planning/test-cases/*.md, specs_planning/test-plans/*.md, AGENT_SHARED_RULES.md, `.github/agents/*.agent.md` (6 files), README files, any other MD that agents touched.

**EXCLUDE**: Client-supplied `.docx` files (not our slop). `plans/done/` (historical — don't rewrite history).

## What to Look For

- Stale rule references (citing deleted/renamed rules)
- Contradictions between docs (e.g., REQUIREMENTS.md says X, live DOM says Y — flag per LR-030)
- Outdated file paths (pre-decontamination `locations/` → should be `setup/locations/`)
- Bloated sections that could be condensed
- Agent-generated filler text (AI slop — verbose, says nothing)
- Outdated test case statuses (says SKIP but test passes now)
- Requirements that don't match live DOM (potential app bugs — file per LR-034)

## Direction

Walk through each doc, audit content against live codebase. Session has full freedom to decide what's slop vs legitimate content. Can create sub-subplans if scope exceeds one session.
