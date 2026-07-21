---
artifact: phase-0-verification
module: shared-setup-locations
client: encore
session_date: 2026-05-22
author_identity: OWNER
parent_subplan: plans/pending/SUBPLAN_SSL_FALSE_GREEN_SWEEP.md
parent_plan: plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md
template: nested-orbit v2 Phase 0
verdict: PROCEED
---

# Phase 0 Empirical Verification Gate — Shared Setup Locations (2026-05-22)

Required by `SUBPLAN_SSL_FALSE_GREEN_SWEEP.md` Phase 0.8/0.9, which mandates the nested-orbit v2 (`~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-nested-orbit.md`) Phase 0 checks before any sweep code touches.

## Verdict: **PROCEED**

The four nested-orbit v2 Phase 0 checks (0.1–0.4) were authored for the Notes pilot's live-code fixture refactor. They are applied to this SSL sweep as a *check-or-N/A* matrix below. SSL spec is **post-A-1-rewrite** (the same refactor whose pre-state nested-orbit v2 sought to verify); the page-collision theory cannot apply to a spec that already lacks bare-`page` destructures, so checks 0.1–0.3 are NOT-APPLICABLE-FOR-SSL with explicit reason. Check 0.4 (per-TC baseline) is deferred to Phase 4.1 of this subplan which IS the baseline run since no spec-logic changes occur.

## Live-state truth verification

| Plan claim | Verified | Evidence |
|---|---|---|
| SSL spec exists | ✓ | `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` present |
| 30 `test()` blocks | ✓ | `grep -cE "^\s*test\(" → 30` |
| 3 `test.fixme` at lines 76, 420, 514 | ✓ | `grep -nE "test\.fixme\(" → 76 / 420 / 514` (plan body cites 510 — actual is 514; drift acknowledged in subplan §Live-state truth row 3) |
| 42 page-object async methods | ✓ | `grep -cE "^\s*async\s+\w+\s*\(" page.ts → 42` |
| 18 selectors | ✓ | `grep -cE "^\s*[a-zA-Z_]+:" selectors → 18` |
| Page object reuse helpers exist | ✓ | `triggerBeforeunloadAndStay` (page.ts:46), `discardAndReturn` (:65), `ensureCleanSSLTable` (:82) — to be preserved per plan §Phase 3 Constraints |

## Nested-orbit v2 Phase 0 checks — applied to SSL sweep

### 0.1 — Page-collision theory

**Status: NOT-APPLICABLE-FOR-SSL (theory cannot fail; structurally cleaned).**

Sweep 2 (`,\s*page\s*[,}]` bare-`page` destructure alongside custom fixture) returned **0 hits** when run against the current SSL spec. The page-collision probe inserted into a destructuring test (`console.log('PAGE-IDENTITY:', page === locationNotesPage.page)`) cannot be inserted into the SSL spec because no test in this spec destructures bare `page`. TC-029 at line 484 — the only spec entry the master plan §False-Green Sweep tagged as a known false-green — already uses `const realPage = pg.page;` (line 494) per nested-orbit v2 §A-1 fix decision.

Evidence: `grep -cE "\{[^}]*,\s*page\s*[,}]" clients/encore/specs/locations/location-shared-setup-locations.spec.ts → 0`. Master plan line 143 strict zero gate is **already satisfied** before any sweep work begins.

### 0.2 — Context-options propagation (Council Flag 1 expanded)

**Status: NOT-APPLICABLE-FOR-SSL (framework-wide gap; owned by nested-orbit plan, not SSL sweep).**

The `browser.newContext({ storageState: STATE_PATH })` in `fixtures.ts:151-152` only applies `storageState`. Project `use:` (`viewport: 1920×1080`, `locale: 'en-US'`, `timezoneId: 'America/New_York'`, etc.) is not inherited. This is a framework-wide concern — it affects every spec, not just SSL — and is in the scope of `nested-orbit` plan Group A-4. The SSL sweep modifies only fixme comments + new markdown artifacts; it does not touch fixtures or context options. No verification cycle in this subplan needs to assert specific viewport/locale values.

### 0.3 — Trace fidelity for manual context

**Status: NOT-APPLICABLE-FOR-SSL (framework-wide; not in sweep scope).**

Same scope as 0.2 — the trace-attachment behavior on manual `newContext()` calls is framework-wide. SSL sweep produces no spec/PO code that would benefit from per-test trace attachment.

### 0.4 — Per-TC baseline (LR-024 evidence)

**Status: DEFERRED TO PHASE 4.1 — Phase 4.1 IS the baseline.**

Nested-orbit v2 0.4 asks the executor to run every TC individually with `--headed --retries=0 --grep` and capture pass/fail + error message + screenshot. For the Notes pilot this established a pre-refactor baseline. For this SSL sweep there is **no refactor** — Phase 3 modifies only fixme comment text (not test bodies); Phase 5 amends the master plan. The spec executes the same code post-sweep as it does pre-sweep. Phase 4.1 (`npx playwright test … --retries=0 --workers=1`) at the end of the sweep therefore *is* the per-TC baseline AND the post-change verification in one. Phase 4.2 re-run confirms no flake.

## Strict-line gates (LR-046) — pre-existing state acknowledgement

User authorization captured 2026-05-22 (`AskUserQuestion` chat) for both:

| Plan Phase 0 gate | Actual file state | User-authorized verdict |
|---|---|---|
| 0.5 `npm run typecheck` — "clean (no pre-existing TS errors)" | ~30 pre-existing TS1434 / TS1003 / TS1005 syntax errors in `scripts/build-framework-vendor.ts` (build script, not spec runtime) | **PROCEED** — flagged here; out of SSL sweep scope. SSL surface (spec + page object + selectors + data + fixtures imports) compiles cleanly. |
| 0.6 `git status` — "clean working tree on `client_deliverable` branch (or successor)" | ~60 pre-existing modifications + ~140 deletions of `.playwright-cli/*.yml` scratch files. SSL-specific files (spec / page object / selectors / data / walk-evidence) are NOT modified. `PLAN_BIG_PIVOT_FCC_MASTER.md` IS modified (will receive Phase 5 amendment). | **PROCEED** — plan author wrote this subplan today (2026-05-22) with this exact tree state; the SSL surface itself is clean. |

Both pre-existing states predate this subplan's creation. No SSL-specific surface is in conflict. The pre-existing dirty state is the well-known starting condition of the `client_deliverable` branch on 2026-05-22.

## BrowserTool announcement (Phase 0.4)

Per LR-038 v2 + LR-054, emitted in chat at session start:

> "Browser tool: Playwright CLI. Reason: false-green sweep verification + LR-021 corollary live-DOM checks on the 3 app-bug fixmes. Spec re-runs use `npx playwright test` which is a different binary per LR-054 Table 2."

LR-021 corollary live-DOM walks for the 3 fixme'd tests were *not* executed — user authorized skip 2026-05-22 (`AskUserQuestion`):

- TC-026 (line 420 — Miami `'1233'` phantom): user manually confirmed bug PRESENT 2026-05-22.
- TC-030 (line 514 — random Delete non-clickable): user manually confirmed bug PRESENT 2026-05-22.
- TC-007 (line 76 — Shares Inventory net-zero revert): user authorized fixme+comment trust rule ("if its fixme with a comment around it in spec, its fine to skip"); status preserved with `awaiting re-verification` note.

LR-021 corollary requires "verify the app bug is still present via live DOM check; if still present, re-skip with updated comment citing 2026-05-22 verification date + bug cite" — for TC-026 and TC-030 the user's manual probe is the live-DOM check (a stronger evidence source than agent CLI walk). For TC-007 the strict line is satisfied by the comment text containing `2026-05-22`; evidence weight is "user-authorized fixme+comment trust rule pending future re-verification".

## Final verdict

**PROCEED.** All Phase 0 checks resolve to either PASS, NOT-APPLICABLE-FOR-SSL-WITH-REASON, DEFERRED-TO-PHASE-4.1, or PROCEED-WITH-USER-AUTHORIZED-FLAG. No HALT condition fires.
