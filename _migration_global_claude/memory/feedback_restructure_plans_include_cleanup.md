---
name: Restructure plans must enumerate stale-slop cleanup IN-SCOPE
description: Restructure plans (rebuild / migrate / vendor / client-split / multi-tenant / deliverable / promote / consolidate) must enumerate their own stale-slop cleanup as in-scope tasks. Deferring to "discover later" subplans is forbidden.
type: feedback
originSessionId: 1e5f51c2-def7-46ad-a283-c080bc9b52b6
---
When authoring a plan that restructures architecture, every cleanup task that becomes obvious from the restructure MUST live in the SAME plan body — not a follow-up subplan. Plan author has perfect knowledge at authoring time; once the restructure lands, that knowledge evaporates.

**Why**: 2026-05-06 — root `playwright.config.ts:66` still at `fullyParallel: true` 6 days after the client config locked it `false` as a dependencyGate hard rule. `PLAN_CLIENT_DELIVERABLE_REBUILD` (2026-04-30) shipped without enumerating root-vs-client cleanup → 8 file classes drifted; `PLAN_ROOT_CLIENT_DEDUPE.md` cleans up retroactively. User directive: "make sure this mistake never happens again ... do not be lazy when planning big stuff like these."

**How to apply**: see LR-050 in `.claude/rules/pipeline.md` for triggers + enforcement.

Cross-refs: framework rule body at `.claude/rules/pipeline.md` LR-050. Auto-mode does NOT suppress this — restructure cleanup enumeration is the core of restructure planning, not routine.
