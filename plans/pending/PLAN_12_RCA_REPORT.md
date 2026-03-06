# Plan 12: Pipeline Overhaul RCA Report

**Status**: PENDING
**Priority**: P2 — reference document, no code changes
**Estimated Scope**: Create one file (`plans/RCA_PIPELINE_OVERHAUL.md`). Documentation only.
**Trigger**: Independent deep audit of the 8-plan pipeline overhaul completed 2026-03-04. Findings need to be preserved as a reference for future pipeline work and agent governance decisions.

---

## Why This Matters

The 2026-03 pipeline overhaul was the largest change to the agent governance system. An independent RCA found 30+ issues across 5 categories, identified root causes, and critiqued the initial Copilot RCA. This knowledge needs to be accessible so:

1. Future plan authors know what went wrong and don't repeat mistakes
2. Future auditors have a baseline to compare against
3. The Copilot agent executing plans can reference this to understand WHY verification steps exist

---

## Deliverable

Create `plans/RCA_PIPELINE_OVERHAUL.md` with the following sections:

### Section 1: Outcome Scorecard
Table mapping each SYSTEMS_AUDIT fix (1-13) to: target outcome, actual outcome, verdict (DONE/PARTIAL/NOT DONE/DEFERRED). Key finding: structural goals achieved, quantitative cleanup incomplete, 3 fixes had no plan coverage.

### Section 2: Defect Inventory
Full catalog of 30+ issues found, organized by category:
- **A: Stale Cross-References** (11 findings, 3 CRITICAL in active scripts)
- **B: Plan-Promised But Never Delivered** (7 findings including 3 dropped SYSTEMS_AUDIT fixes)
- **C: ID Collisions and Renumbering** (5 findings, 3 resolved via surgical edits, 2 unresolved in plan text)
- **D: Plans Contradicting Their Own Audit** (4 findings including NEVER DO contradiction)
- **E: Structural Design Flaws in Plans** (6 findings — topic-scoping, no verification grep, PLAN_06 quality)

### Section 3: Root Cause Analysis
Six root causes with evidence:
- **RC-1**: Migration-as-afterthought (plans scope by TOPIC not by MIGRATION — cross-cutting refs fall through)
- **RC-2**: Plan-reality drift with no reconciliation (plans never updated after implementation)
- **RC-3**: No prose-reference validation (validate:sync covers structured data, not comments/prose)
- **RC-4**: Model reasoning gaps (no self-verification, literal plan execution, no cross-plan reasoning)
- **RC-5**: No plan coverage tracking (3 of 13 audit fixes silently dropped)
- **RC-6**: PLAN_06 quality (questions not specifications — unverifiable completion)

### Section 4: Defect Taxonomy
Table categorizing recurring vs novel defect types. Recurring: stale refs after migration, count mismatches, plan-vs-reality divergence. Novel: ID collision across concurrent plans, audit-fix coverage gaps.

### Section 5: Critique of Initial Copilot RCA
What the Copilot's own RCA got right (defect taxonomy, Five Why's methodology, RC-4 migration ownership insight) and what it missed (no outcome analysis, missed NEVER DO contradiction, missed agent-learnings.md in 3 prompts, understated finding count, "tooling not model quality" incorrect framing).

### Section 6: Lessons for Future Plans
- Own migrations as first-class tasks, not side-effects of topic plans
- Every plan must have verifiable completion criteria (code diffs, not questions)
- After execution, update plan file with actual IDs and completion evidence
- When adding rules, verify they don't contradict the audit findings that prompted them
- Map every audit fix to a plan — unmapped fixes must be explicitly marked DEFERRED

---

## Execution Steps

1. Create `plans/RCA_PIPELINE_OVERHAUL.md` with the sections above
2. Source data from:
   - This plan file (structure/outline)
   - The independent RCA analysis performed 2026-03-04 (findings, evidence, root causes)
   - `plans/SYSTEMS_AUDIT_RCA.md` (original audit findings for scorecard)
   - `specs_planning/_internal/agent-mistakes.md` (current rule state for verification)
   - `scripts/validate-agent-sync.ts` (validation coverage for gap analysis)
3. No code changes needed — this is documentation only

---

## What NOT to Do

- Do NOT copy-paste the Copilot's RCA verbatim — this is an independent analysis with different conclusions
- Do NOT editorialize or assign blame — state findings with evidence
- Do NOT include recommendations that duplicate PLAN_09/10/11 — reference those plans instead
