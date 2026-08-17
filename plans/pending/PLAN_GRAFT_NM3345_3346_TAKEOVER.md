> 🤖 **SESSION BOOTSTRAP — live orchestration record.** This plan is being executed by the grafting CEO session that authored it (not a cold `/execute` target). If a cold session ever picks it up: Identity OWNER, read the two HANDOFF sections named in Context, check the Phase table for the first non-DONE row, and continue from there. HALT + ask Rutvik on: any suite red beyond the 3 declared bug-evidence tests that cannot be triaged, any live-app data mutation beyond documented test rows, any scope growth past the listed phases.

# PLAN_GRAFT_NM3345_3346_TAKEOVER

**Status**: Pending
**Created**: 2026-08-06
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**Parent**: PLAN_TERMS_CONDITIONS_AUTOMATION.md + PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md (both grafted, both PENDING)

## Context

Colleague branch `NM-3345_3346` (tip `abfbb6a`, base `d1159203c`) carries two modules' work, handed off deliberately unfinished: T&C (92 cases, 72 tests **never run**, walk denominator undercounted by 9 RTE toolbar controls, Cx closure gate honestly failing) and SCT (renumber 059..086→056..083 applied but **never independently audited**, 7-phase closeout plan unexecuted, tombstone question UNRULED). Authority: the two `## HANDOFF 2026-08-06` sections in `plans/pending/PLAN_TERMS_CONDITIONS_AUTOMATION.md` and `plans/pending/SUBPLAN_SCT_RENUMBER_DEFERRED_SHARED_WRITES.md`. This session grafts, proves, and finishes both.

## Graft record (Step 1–2 of /graft — DONE this session)

- 55/59 files spliced byte-identical via `git checkout origin/NM-3345_3346 -- <paths>`.
- 3 collision files 3-way merged (base `d1159203c`), union-resolved, zero markers left: `clients/encore/CLAUDE.md` (their env bullet + LR-ENC-007 inserted at content anchors), `agent-activity-log.md` (both tails kept), `agent-mistakes.md` (their 2026-08-03 section appended).
- `plans/INDEX.md` regenerated via `npm run plans:reindex`, never merged (LR-035).
- **NOT staged.** Per /graft Step 4 the index syncs only after the E2E proof is green. No commit this session without a separate ship decision.

## Phases

| # | Phase | Runs | Status |
|---|---|---|---|
| P1 | Gate battery on grafted tree: `tsc --noEmit`, `check:tc-parity`, `check:per-test-baseline`, `check:step-labels`, `check:spec-quality` — repo root, exit codes on own lines (never after a pipe) | verifier worker (gpt-5-mini) | dispatched |
| P2a | SCT renumber audit, Reviewer A (spec surface): contiguity 001..083, zero dupes, no stale 084-086, transform purity vs before-state `origin/NM-3345` | gpt-5.5 xhigh | dispatched |
| P2b | SCT renumber audit, Reviewer B (records): module-codes.json gapLedger/renames, **tombstone ruling** (renames-map sufficient vs 056/057/058 permanently retired), cross-refs, D1–D8 context | gpt-5.5 xhigh | dispatched |
| P2c | Fight round: both reviews → claude author seat defends → aligned result → CEO adjudicates tombstone ruling with Rutvik visibility | opus author | after P2a+P2b |
| P3 | T&C suite first-ever run: 72 tests, batched ~10, serialized, office 1604. Expected: 3 deliberate reds (TC-044/045/046 — bug evidence, MUST NOT be repaired to green); every other red = triage (spec defect vs app bug vs env), fix specs, re-run to stable | workers, batched | after P1 green |
| P4 | SCT confirming suite: 83 tests, batched ~10, serialized, office 1604 (per SCT closeout Phase 5; LR-018 run-all is the only truth) | workers, batched | after P3 (same office — no parallel app sessions) |
| P5 | Execute `plans/pending/PLAN_WALK_STATE_CONTRACT_REALIGN.md` on the grafted tree: Phase 0 self-verify, F4-v2 verifier extension + fixture, F2 language-filter opener (trigger known from handoff: `terms-conditions-language-filter-trigger`, Radix combobox, retry recipe), F3 row-added push, F1 contract realign both modules both files, re-enumerate, re-run verify-denominator + validate-plan-closure | per that plan | after P4 |
| P5b | **Probe-runner build** (the handoff-confirmed gap: the per-archetype probe artifact does NOT exist anywhere): build the runner that produces F4-v2 JSON receipts (module, state_label, walk_artifact, trigger, observed_keys_before/after, generated_by, generated_at, git_head) for `expand:row-language` + `edit:html-cell`, run it for both modules, receipts land under `reports/walk-coverage/`. This also surfaces the 9 RTE toolbar controls for the denominator | per PLAN_WALK_STATE_CONTRACT_REALIGN Preconditions | inside P5, before its Phase 4 |
| P6 | Records + closure: SCT D1–D8 into mistake ledger (append-only), activity-log rows, live-app dirty-row note (WALKX rename retry once — DEF-TNC-005 live instance; page has no delete), closure gates for `PLAN_TERMS_CONDITIONS_AUTOMATION` + `PLAN_SERVICE_CHARGE_TEXT_AUTOMATION` + SCT closeout subplan run honestly — flip DONE only on genuine PASS | CEO + workers | last |
| P7 | /graft Step 4: `git add` all graft+fix paths, `git diff --quiet` drift assert, GRAFT CLEAN. No commit — ship is a separate Rutvik decision | CEO | after P6 |

## Decision Doctrine (pre-ruled by Fable 2026-08-06 — the executing model applies these rules, it does not re-derive them)

1. **Tombstone adjudication (P2c)**: adopt Reviewer B's ruling IF the fight round aligns AND the review shows external references were actually searched (Jira/bug-records/allure-history greps shown, not asserted). Escalate to Rutvik ONLY if: the seats deadlock after one defense round, OR the aligned ruling is (b) tombstones-permanent — because (b) reopens the visible ID gap Rutvik explicitly ordered closed, and that trade is his, not ours.
2. **T&C suite red-triage (P3)**: TC-044/045/046 MUST stay red — they are bug evidence; a worker "fixing" one to green is a defect, bounce it. Every other red gets classified: (a) spec defect → bounce to the authoring worker with the failure output, max 2 fix cycles then /rca; (b) app bug → file per missing-testid/bug-report policy, spec stays red as evidence, named in the closure record; (c) env/auth flake → one clean retry, then ENV-BLOCKED. Never edit page objects/selectors to make an assertion pass without reading the DOM evidence first.
3. **SCT suite (P4)**: their side ran it green twice pre-handoff; any red here is NEW → suspect the graft or shared-tree state first (diff the failing spec's dependencies against origin/NM-3345_3346 before blaming the test).
4. **Walk-state plan (P5)**: execute as written — it is council-hardened; do NOT redesign F4-v2 or soften its failure branches. Its Phase 0 HALT conditions are answered by the T&C handoff (probe artifact: does not exist → P5b builds the runner; trigger: `terms-conditions-language-filter-trigger` with the 3-attempt retry recipe; cascade timeout: N=1, re-run once, persistent → /rca).
5. **Escalate to Rutvik, always**: any commit/push/ship decision; any live-app mutation beyond documented automation rows; any scope growth past the phase table; any worker deadlock surviving one full bounce cycle.
6. **Do not** run xlsx:build or plans:reindex while any worker is live on the tree; serialize suite batches (shared office 1604); every dispatch carries --max-credits at 3× estimate and --parent-run-id graft-takeover.

## Not in this goal (arrived with the graft, listed so they are not silently dropped)

- `SUBPLAN_WALK_TOOLING_SILENT_GREEN.md` and `SUBPLAN_DOCTRINE_LEDGER_AND_XLSX_STAMP.md` — their plans, now in our pending queue via INDEX; separate goals.
- Interaction map for T&C — blocked on `scripts/check-interaction-coverage.mjs` which is a deliverable of `PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md`, not this plan.

## Verification artifact

```bash
node scripts/validate-plan-closure.mjs --plan plans/pending/PLAN_TERMS_CONDITIONS_AUTOMATION.md --dry-run --json
```
Expected end-state: Cx PASS after P5; suite proof artifacts under `.claude/state/ua-worker/chips/graft-takeover/`.

## Prior-Fix Trial

Recurrence class: walk-state contract unsatisfiable (prior fix = the five-state contract, CONVICTED `scoped-wrong` in PLAN_WALK_STATE_CONTRACT_REALIGN, which this plan executes rather than layering over). The T&C denominator undercount is the SAME conviction seen from the other side — the missing 9 controls live behind the unwalked `edit:html-cell` state; P5b closes both with one mechanism.

## Final phase (FP) — merge the two Terms and Conditions spec files into one

**Owner instruction, 2026-08-06 (Rutvik, verbatim intent):** once everything else is done, the last
task is a council delegation that merges the two T&C specs into
`terms-conditions.spec.ts` (DONE — merged 2026-08-07), matching the shape Service Charge Text
already has (one file, one describe block, 83 tests). **No full-suite re-run at this stage** — the
guarantee comes from code review, not from another execution. Quality is guaranteed by the CEO;
the merge must be correct in every corner, with no defect of any kind introduced.

### Why this is safe to do without re-running
The two files hold **disjoint** test-id sets — verified 2026-08-06:

- grid: `001-010`, `027-029`, `036`, `059-068`, `070-071`, `073-080` (34 tests)
- content: `011-026`, `030-032`, `034-035`, `037-053` (38 tests)
- overlap: **none**

So the merge is an ordering-and-concatenation operation, not a renumbering one. Nothing has to be
renamed, and that is precisely what makes a review-only guarantee defensible: every test body can
be proven byte-identical to its pre-merge form.

### Hard constraints for the merging council
1. **No test body may change.** Not an assertion, not a locator, not a title, not a TC id, not a
   `@step` label. The merged file's test bodies must be byte-identical to their originals; that
   equality is the acceptance criterion and it is mechanically checkable.
2. **Test count must be exactly 72** — 34 + 38, verified by count before and after.
3. Tests are ordered by TC id ascending, in one `describe` block.
4. The two import blocks are unioned; every imported symbol must still be used, and none dropped.
   An unused import or a missing one is a defect.
5. Shared `beforeEach` / helper logic must be reconciled deliberately, not merged blindly — if the
   two files set up differently, the difference is stated and resolved explicitly, never silently
   dropped. This is the single highest-risk corner of the merge.
6. The file header comment describes the merged scope honestly and carries no stale claim inherited
   from either original (both originals contain claims already proven wrong).
7. Delete both originals only after the merged file typechecks clean.
8. `npx tsc --noEmit` from `clients/encore` exits 0.

### Council shape
Author seat merges; a cross-family reviewer independently verifies test-body byte-equality and the
count, then the author defends. Only the aligned result reaches the CEO. A reviewer that merely
reads the merged file has not done the job — it must diff each test body against the original.

## Open question — is the Angular stability wait actually a signal?

`BasePage.waitForAngularStable` (`clients/encore/src/pages/base.page.ts:184`) resolves immediately
when `window.getAllAngularTestabilities` is absent, and resolves anyway after a 10-second fallback.
Several helpers in both page objects lean on it to gate a poll loop against a pending server round
trip — including the language-filter postcondition's two-consecutive-zero-poll guard, whose author
explicitly assumed no server filter is slower than the 600 ms window.

If testability is not exposed on this build, every one of those waits is a no-op that has never
varied, and a signal that never varies is not a signal. **Confirm once, on the live app, whether
`getAllAngularTestabilities` is defined** — a single evaluate call answers it. Until then, treat any
helper resting on that wait as unproven, not as protected.

Not urgent: the affected postconditions each carry an independent check as well, so this is a
robustness question rather than a correctness blocker.

## Terminal step — ship (owner goal, 2026-08-07)

Rutvik's standing goal for this session: finish everything, then push via `/push-encore-deliverables`.
Explicit condition: **no rushed or low-quality deliverable, in any form.** The goal auto-clears on a
successful push; it is not cleared by hand.

Gate before invoking the push skill — every one of these, no exceptions:

1. Every test in both modules measured, and every failure either fixed-and-proven or dispositioned
   with a written reason. A test whose fix has not been proven by a run does not count as fixed.
2. The 23 weak assertions hardened, and the suites re-run afterwards — hardening has surfaced a new
   failure every single time tonight, so the run after is not optional.
3. Two clean full runs of both modules.
4. The two Terms and Conditions spec files merged per the Final phase section above.
5. Graft Step 4: stage the grafted paths, then `git diff --quiet` must exit 0 — index equals the
   tested worktree.
6. Plan closures.

The push skill **requires a branch name and it is always the user's choice** — ask for it at push
time, never assume one. Read the skill in full before invoking it, not from memory.
