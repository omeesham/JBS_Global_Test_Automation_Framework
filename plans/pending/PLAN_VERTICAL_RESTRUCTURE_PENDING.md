> NEEDS TO BE CHECKED FOR LEFTOVER SLOP (LR-050 — restructure plans must enumerate stale-slop cleanup IN-SCOPE).

# PLAN: Vertical Restructure of `plans/pending/` — Submodule-First Bundling

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-06
**Identity**: GIVER
**Depends on**: none (no Encore confirmation needed; index/plan-shape changes only)
**Blocks**: per-submodule execution cadence (cycles run via existing subplans once Plan A finalises the queue) and `PLAN_VERTICAL_DELIVERY_SOX.md`'s push cycle
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none
**Skills**: /planning, /audit, /final-q
**Story Points**: 5

---

## ⚠ Scope discipline (read first)

This plan **PRODUCES the vertical queue**. It does **NOT** execute submodule bundles. Execution of Layer 1 infra preface, per-submodule cycles, or Layer 3 closure happens via the existing subplans they reference, called individually with `/execute SUBPLAN_*` after Plan A's queue is approved.

**Out of scope (handled by `PLAN_VERTICAL_DELIVERY_SOX.md`, currently L2-FROZEN)**:
- PR / branch / ticket / SOX-rule encoding (LR-ENC-002, LR-ENC-003)
- `clients/encore/CLAUDE.md` edits
- `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` rewrite
- Any push to `Encore-Global` repo
- `feature/NM-XXXX-*` branch creation in any repo

If you find yourself authoring rule bodies, editing client CLAUDE.md, or describing PR cycles — STOP. Wrong plan.

---

## Context

The pending queue currently presents work in horizontal frames: `PLAN_DELIVERABLE_QUALITY_UPGRADE` (DQU mega, 35 SPs) is module-shaped but cross-cuts; `PLAN_HIST_COLUMN_FIRST_PIVOT` (HIST mega, 40 SPs) is column-first by design. Rutvik's 2026-05-06 directive locked vertical-by-submodule delivery: finish ONE submodule end-to-end before the next, where "submodule" = a tab inside Location Settings (Local Information, Currency, Pricing, Legal, Notes, Account & Address, Shared Setup Locations, Auto Add-on, Top-level Basic Info, Mgmt History).

This plan restructures the pending queue to that shape. The output is a per-submodule bundle queue and a clear "submodule-100%-done" criterion that excludes definitionally end-state work (reconcile, full-suite RCA, cross-pivot audit). It does not modify the work content of any existing subplan — it organises them.

**Provenance**: companion audit at `~/.claude/plans/plan-vertical-delivery-sox-check-all-kind-beaver.md` (sections "TWO-PLAN SPLIT" + "Strategic audit" + "Restructure cleanness assessment") authored the design rationale and surfaced the missing pieces. This plan executes the restructure those sections recommended.

---

## Bootstrap

- **Identity**: GIVER (planner) — design + amendment authority over plans, no execution authority over subplans.
- **Skills auto-called**: `/planning` (Phase 0–3), `/audit` (closure cross-check), `/final-q` (exit).
- **Context files** (every rule/file the plan depends on):
  - This file's parent: none (top-level plan)
  - Companion audit: `~/.claude/plans/plan-vertical-delivery-sox-check-all-kind-beaver.md`
  - `plans/CONVENTIONS.md` (folder layout, frontmatter, supersession rules)
  - `plans/INDEX.md` (regenerated; not hand-edited)
  - `.claude/rules/pipeline.md` (LR-020, LR-027, LR-040, LR-041, LR-046, LR-048)
  - `.claude/rules/baseline.md` (referenced by per-submodule audit subplans, not by this plan directly)
  - `.claude/rules/specs.md` (referenced by per-submodule test subplans)
  - `clients/encore/CLAUDE.md` (LR-ENC-001 baseline truth source — referenced by audits, not edited here)
  - `clients/encore/docs/MODULE_REGISTRY.md` (page/module boundaries)
  - `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` (DQU mega — to be amended in Phase 1)
  - `PLAN_HIST_COLUMN_FIRST_PIVOT.md` (HIST mega — to be amended in Phase 1)
  - `PLAN_VERTICAL_DELIVERY_SOX.md` (Plan B sibling — L2-frozen; this plan blocks its push cycle)

---

## Phase 0 — Dependency + browser-tool gate

- **Browser tool**: `none` (no live DOM interaction; Plan A is paper restructuring + plan amendments).
- **Dependencies**: none (independent of Encore call).
- **Halt conditions**:
  - If any pending plan referenced in the manifest has been moved/renamed/deleted between authoring and execution → re-grep the queue, refresh, do not assume staleness.
  - If a submodule's existing subplan chain reveals a structural blocker (e.g., HIST_PIVOT master cannot be cleanly amended without re-architecture) → HALT and ask Rutvik.

---

## Phase 1 — Manifest mapping (R1)

Produce `clients/encore/specs_planning/_internal/vertical-restructure-manifest-2026-05-06.md` classifying every entry in `plans/pending/` (~95 plans) into one of seven buckets:

| Bucket | Definition | Example |
|---|---|---|
| `SUBMODULE-X` | Belongs to exactly one Location Settings submodule (X = Currency / Pricing / LI / Legal / Notes / AccAddr / SharedSetup / AutoAddOn / TopLevel / MgmtHistory). | SP-DQU-14 → `SUBMODULE-Currency`; SP-D3a → `SUBMODULE-LI` |
| `LOS-BUNDLE` | Belongs to Local Office Settings page (separate page, parallel bundle). | SP-C1 (LO Basic Info tests), SP-C2 (LO ECT tests) |
| `ECT-BUNDLE` | Belongs to ECT Settings page. | SP-DQU-19 |
| `INFRA-PREFACE` | Cross-cutting one-time prerequisite (must land before submodule #1). | SP-D0, SP-F1, SP-F2, SP-DQU-21/22/23, SP-DQU-07, SP-DQU-08 |
| `INFRA-CLOSURE` | Cross-cutting end-state (after all submodules). | SP-B-LM-R, SP-DQU-25/26/27/28/29/30/31/34/35, SP-J, SP-K1/K2 |
| `UNRELATED` | Outside the vertical-delivery scope (framework cleanup, skill creation, repo hygiene). | SP-REPO-*, SP-DQU-32, SP-DQU-33, godsplan, PLAN_AGENT_AUTHORING_EFFICIENCY, etc. |
| `SUPERSEDED` | Stale by content; recommend move to `done/SUPERSEDED_*` per `CONVENTIONS.md`. | TBD by Phase 4 triage |

**Manifest schema** (one row per pending plan):

```
| File | Bucket | Submodule (if SUBMODULE-X) | Layer (if INFRA-*) | Notes / supersession target |
```

**Verification gates for Phase 1**:
- [ ] Every file in `plans/pending/` (output of `Glob plans/pending/**/*.md`) appears in the manifest exactly once.
- [ ] Bucket counts sum to total pending count.
- [ ] No file is left untriaged.

---

## Phase 2 — Design decisions (R2–R4)

Produce three artifact sections inside this plan body (filled in during execution, not before):

### 2.1 — Bundle template (R2)

Per-submodule bundle template (Layer 2 from companion audit). Concrete artefact: a 7-row work unit per submodule, embedded into Plan A's body in Phase 5 below. Template:

| Step | Source SP pattern | Notes |
|---|---|---|
| 1. Audit submodule X for TC quality (neutral-eye) | `SP-DQU-1*` (one per submodule) | LR-ENC-001 baseline-first walk; emits findings MD + 2 baseline artifacts |
| 2. Apply audit fixes — CSV/MD test cases | folded into the audit subplan's fix phase | Re-export to CSV |
| 3. HIST catalog for X (LM tab) | `SP-B-LM-*` (one per submodule) | Opus + ultrathink; emits catalog MD; LR-040 closure |
| 4. HIST per-column tests for X | `SP-D*` (one per submodule) | Opus or Sonnet per complexity |
| 5. Apply slate-clear to X spec | one row of `SP-DQU-24` rollout | Mechanical |
| 6. File X bugs (NOT-TRACKED + audit findings) | `SP-E-LM-*` (one per submodule cluster) + per-audit `BUG-*.json` | Gated on tests passing + LR-044 verification |
| 7. Suite-passes for X spec | local + CI smoke; no flakes | Strict criterion |
| **READY-TO-SHIP for X** | — | Bundle complete; actual ship blocked on Plan B's L2-frozen state |

### 2.2 — Submodule ordering (R3)

Order the 10 Location Settings submodules from #1 → #10 based on (a) existing progress, (b) blast radius, (c) dependency chain. **Recommended ordering** (Rutvik to confirm or override during /execute):

| Order | Submodule | Rationale |
|---|---|---|
| #1 | **Currency** | HIST catalog DONE (`SUBPLAN_HIST_PIVOT_08_B_LM_1_CURRENCY_CATALOG.md`); dep-aware spec pilot DONE (`location-currency.spec.ts`); SP-D1 is the proof-of-pattern Opus test. Smallest scope to "ready-to-ship" — proves the bundle on the most-prepared submodule. |
| #2 | **Pricing** | HIST catalog DONE (`SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md`); SP-DQU-12 audit pending; SP-D2 tests pending. Second-most-prepared. |
| #3 | **Local Information** | DQU audit + LR-046 remediation DONE; SP-DQU-05E in-flight. Catalogs (SP-B-LM-3a/3b) and tests (SP-D3a/3b) are the LARGEST in scope — go third so the pattern is locked in by the time the heaviest submodule runs. |
| #4 | **Legal** | DQU audit pending (SP-DQU-13); HIST catalog pending (SP-B-LM-5); tests pending (SP-D5). Standard medium scope. |
| #5 | **Notes** | DQU audit pending (SP-DQU-15); HIST catalog pending (SP-B-LM-6); tests pending (SP-D6). |
| #6 | **Account & Address** | DQU audit pending (SP-DQU-16); HIST catalog pending (SP-B-LM-4); tests pending (SP-D4). |
| #7 | **Shared Setup Locations** | DQU audit pending (SP-DQU-17); HIST catalog pending (SP-B-LM-7); tests pending (SP-D7). |
| #8 | **Auto Add-on** | DQU audit pending (SP-DQU-18); HIST catalog pending (SP-B-LM-8); tests pending (SP-D8). |
| #9 | **Top-level Basic Info** | DQU coverage pending; HIST catalog pending (SP-B-LM-9); tests pending (SP-D9). |
| #10 | **Mgmt History** | DQU audit pending (SP-DQU-20); HIST framing — confirm is this catalog-able the same way or is it itself the destination? Likely an end-state row; revisit during Phase 5. |

**LOS bundle (parallel page-level)**:
| Order | Submodule | Rationale |
|---|---|---|
| LOS-1 | LO Basic Info | DQU audit + fixes DONE (SP-02/03); HIST catalog DONE (SP-05/05b); HIST reconcile DONE (SP-07); tests pending (SP-C1). Closest to ready-to-ship of any bundle. |
| LOS-2 | LO ECT | DQU audit (subset of SP-DQU-19?) confirm scope; HIST catalog DONE (SP-06/06B); tests pending (SP-C2). |

**ECT bundle (parallel page-level)** — single submodule covering `/settings/ect` standalone scope per SP-DQU-19. Treat as ECT-1.

### 2.3 — "Submodule-100%-done" criterion (R4)

A submodule X is **"100% done internally"** (READY-TO-SHIP) when ALL of:

- [ ] All 7 bundle template rows for X have status `done` (audit, fixes, catalog, tests, slate-clear, bugs, suite-passes).
- [ ] All `BUG-*.json` filed during X's audit have either `verified: true` (LR-044 verification) or `flagged-for-encore` status.
- [ ] X's spec passes full-suite clean (no flakes) on local default workers AND CI default workers.
- [ ] X's catalog has `Status: DONE` per LR-027 with parent-cascade closure check.
- [ ] All planned items in X's catalog are classified (a)/(b)/(c) per LR-040.

**Explicitly EXCLUDED from "submodule-100%-done"** (these are end-state, run ONCE after all submodules):

- HIST cross-pivot reconcile (SP-B-LM-R, SP-J, SP-K1, SP-K2).
- DQU full-suite RCA + identity ripple + simplify/cleanup sweeps + Allure deliverable + bug reports packaging + handoff package + exit audit (SP-DQU-25..35).

If a submodule cannot satisfy the criterion above without an INFRA-CLOSURE item — that's evidence the criterion needs revising; HALT and ask.

---

## Phase 3 — Plan amendments (R5, R6)

### 3.1 — Amend `PLAN_HIST_COLUMN_FIRST_PIVOT.md`

The HIST master is column-first by design. Two options for amendment:

**Option A — Amend (recommended default)**: add a new top-of-file section `## 2026-05-06 vertical-execution overlay` stating that the column-first numbering is preserved as the work-units-table, BUT execution sequencing follows the per-submodule ordering in Plan A. Per-submodule execution still runs the same SP-B-LM-* + SP-D* subplans; only the order of invocation changes. Existing subplan dep chains stay intact.

**Option B — Supersede**: move HIST master to `plans/done/` with `Status: SUPERSEDED`, pointer to Plan A. Keep all SUBPLAN_HIST_PIVOT_* files in pending/ (they retain their content). Plan A becomes the authoritative HIST master.

**Recommendation**: A unless re-architecture surfaces. B is cleaner but loses the column-first reference doc which is still useful for the per-column tests.

**Rutvik picks** — escalate during Phase 3 execution.

### 3.2 — Amend `PLAN_DELIVERABLE_QUALITY_UPGRADE.md`

DQU mega is already module-shaped per its track map. Amendment scope:

- Add `## 2026-05-06 vertical-execution overlay` section pointing at Plan A's queue.
- For each remaining DQU subplan, note its bucket from the Phase 1 manifest.
- For DQU subplans that are INFRA-CLOSURE (SP-DQU-25..35), note "runs after all submodules per Plan A Layer 3."
- For DQU subplans that are INFRA-PREFACE (SP-DQU-21/22/23/07/08/09), note "runs before submodule #1 per Plan A Layer 1."

No body deletions — additive amendments only.

---

## Phase 4 — Stale-plan triage (R7)

Walk the 49 stale-tagged plans (>14d age per INDEX.md Warnings section). For each, decide one of:

- **KEEP** — still relevant under vertical delivery; cross-references to Plan A's bucket.
- **SUPERSEDE-BY-PLAN-A** — work is now folded into Plan A's restructured queue; move to `plans/done/SUPERSEDED_*` per `CONVENTIONS.md` line 92–95.
- **UPGRADE** — plan body needs material rewrite to align with vertical shape; mark `Status: REVISED` and amend.
- **PARK** — lower priority, stays in pending/ but tagged `P5-PARKED` (existing precedent: `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`).
- **DELETE** — content is duplicate / dead. Rare. Requires Rutvik authorization.

Output: append a `## Stale-plan triage` table to the manifest from Phase 1 with file → disposition → reason.

**Edge cases that require Rutvik input** (do not decide unilaterally):
- Plans authored before LR-ENC-001 (2026-04-24 graduation) that may be implicitly superseded.
- HIST_PIVOT subplans 10–40 — most carry through; confirm before any `KEEP` decisions.
- REPO_* plans (cleanup work) — separate priority lane; default `KEEP`.
- `godsplan.md`, `PLAN_AGENT_AUTHORING_EFFICIENCY.md` — orthogonal initiatives; default `KEEP`.

**Strict line**: every one of the 49 stale plans gets a disposition row. No stale plan left untriaged. (LR-046 strict-line scope: this is qualitative triage with concrete dispositions, which IS strict — every row exists.)

---

## Phase 5 — Submodule queue table (R8)

Author the per-submodule queue inside this plan body as a 10-row table for Location Settings + 2 rows for LOS + 1 row for ECT. Each row has columns:

| Order | Submodule | Audit SP | Catalog SP | Tests SP | Slate-clear ref | Bugs SP | Done-criterion ref |

The table populated during execution. Rows reference EXISTING subplan filenames in `plans/pending/` (e.g., `SP-DQU-14`, `SP-B-LM-1` if reopened from done/, `SP-D1`). NO new subplan files are authored. NO existing subplan bodies are modified by Plan A — only the queue lists their order of invocation.

**Where existing work landed**: rows for Currency / Pricing / Local Info / LOS reflect the in-flight state (catalog DONE, audit DONE, etc.). Audit SP / Catalog SP cells link to plans/done/* files for already-complete steps. Audit SP / Catalog SP cells link to plans/pending/* files for incomplete steps.

---

## Phase 6 — Layer 1 + Layer 3 reference lists

Embed two lists into Plan A's body:

### 6.1 — Layer 1 (INFRA-PREFACE) — must be DONE before submodule #1's first row begins

| SP | File | Status | Why preface |
|---|---|---|---|
| SP-D0 | `SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md` | PENDING | `hist-reader.ts` + helpers — every per-column HIST test depends on it |
| SP-F1 | `SUBPLAN_HIST_PIVOT_33_F1_ANOMALY_WRITER.md` | PENDING | Anomaly writer + afterEach — HIST tests record anomalies via this |
| SP-F2 | `SUBPLAN_HIST_PIVOT_34_F2_AUTO_FILER.md` | PENDING | Auto-bug-filer + dedup — per-submodule bug filings rely on this |
| SP-DQU-21 | `SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT.md` | PENDING | Output feeds slate-clear pattern |
| SP-DQU-22 | `SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR.md` | PENDING | One-time pattern; per-submodule rollout reuses |
| SP-DQU-23 | `SUBPLAN_DQU_23_G3_POST_TEST_SLATE_CLEAR.md` | PENDING | Same |
| SP-DQU-07 | `SUBPLAN_DQU_07_E2_RULES_DOC_UPDATE.md` | PENDING | Rule basis for tagged TCs in submodule MDs |
| SP-DQU-08 | `SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md` | PENDING | Existing in-flight; covers existing LOS + LI artifacts |
| SP-DQU-05E | `SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md` | PENDING | LOS + LI deep coverage retro-audit; in-flight; closes prereq for LOS / LI bundles |

**Note**: SP-DQU-09 (REQUIREMENTS sampling) is parallel-fine, not strict prereq — exclude from Layer 1 hard list, run any time before submodule #N where N is set by Rutvik.

### 6.2 — Layer 3 (INFRA-CLOSURE) — runs ONCE after all submodules done

| SP | File | Why end-state |
|---|---|---|
| SP-B-LM-R | `SUBPLAN_HIST_PIVOT_18_B_LM_R_RECONCILE.md` | Needs all LM submodule catalogs landed |
| SP-DQU-25 | `SUBPLAN_DQU_25_G5_FULL_SUITE_RCA.md` | Cross-spec convergence test |
| SP-DQU-26 | `SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md` | Whitelist scoping |
| SP-DQU-27 | `SUBPLAN_DQU_27_H2_SIMPLIFY_SWEEP.md` | Whitelist-based; runs after subject code stable |
| SP-DQU-28 | `SUBPLAN_DQU_28_H3_CLEANUP_SWEEP.md` | Same |
| SP-DQU-29 | `SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md` | After all artifact changes settle |
| SP-DQU-30 | `SUBPLAN_DQU_30_J1_ALLURE_DELIVERABLE.md` | Reporting artifact |
| SP-DQU-31 | `SUBPLAN_DQU_31_J2_BUG_REPORTS_PACKAGING.md` | Consolidates per-submodule filings |
| SP-DQU-34 | `SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md` | Final artifact assembly |
| SP-DQU-35 | `SUBPLAN_DQU_35_L2_EXIT_AUDIT.md` | LR-040 closure gate |
| SP-J | `SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md` | Independent QA |
| SP-K1 | `SUBPLAN_HIST_PIVOT_39_K1_RULES_SWEEP.md` | Pattern-language audit |
| SP-K2 | `SUBPLAN_HIST_PIVOT_40_K2_PROMPTS_SWEEP.md` | Same |

---

## Acceptance criteria

- [ ] Manifest produced at `clients/encore/specs_planning/_internal/vertical-restructure-manifest-2026-05-06.md`. Every pending plan classified into one bucket (Phase 1).
- [ ] Bundle template (Phase 2.1) embedded in Plan A body.
- [ ] Submodule ordering (Phase 2.2) confirmed by Rutvik or revised. Final ordering recorded.
- [ ] "Submodule-100%-done" criterion (Phase 2.3) locked.
- [ ] HIST master amended per Phase 3.1 (option A or B per Rutvik decision).
- [ ] DQU mega amended per Phase 3.2 (additive overlay).
- [ ] All 49 stale-tagged plans triaged (Phase 4) with disposition rows in the manifest.
- [ ] 10-row LS submodule queue table + 2-row LOS + 1-row ECT (Phase 5) embedded in Plan A body.
- [ ] Layer 1 + Layer 3 reference lists (Phase 6) embedded.
- [ ] No new subplan files authored. No existing subplan bodies modified by Plan A. No edits to `clients/encore/CLAUDE.md`. No edits to `SHIP_TO_ENCORE.md`. No PR / branch / push activity.
- [ ] `npm run plans:reindex` regenerates `plans/INDEX.md` cleanly (no validation errors).
- [ ] LR-027 closure: Status=DONE, Executed date, Execution Summary citing the produced manifest + amendments + queue.

---

## Risks

| Risk | Mitigation |
|---|---|
| HIST master cannot be cleanly amended (column-first framing too entrenched). | Phase 3.1 Option B (supersede) is available — escalate to Rutvik with concrete evidence. |
| Stale-plan triage is judgment-heavy; agent may guess wrong on edge cases. | Edge cases section of Phase 4 lists known unilateral-decision-forbidden cases. Use AskUserQuestion / chat for any uncertain plan. |
| Submodule ordering may need to flip after Encore answers (e.g., they want Pricing first). | Ordering table is a single column in Plan A's body; reordering is cheap. Done-criterion is order-agnostic. |
| Existing in-flight subplans (SP-DQU-05E, SP-DQU-08, SP-D1 if started) get disrupted. | Plan A does not modify subplan bodies; in-flight work continues per its own /execute call. Plan A only orders invocation. |
| Cross-page bundles (LOS, ECT) need page-specific done-criteria not the LS-tab criterion. | Phase 2.3 criterion is structural (audit/catalog/tests/slate-clear/bugs/suite-pass) and applies to any page. Page-level rollups are the union of submodule rollups. |
| Plan A produces queue, but Plan B is L2-frozen — submodules sit in "ready-to-ship" state with no push channel. | This is by design. Plan B unfreezes when Encore HIGH-Q answers come back. Until then, submodule cycles internally complete and queue. JBS mock channel still available as fallback. |
| Manifest grows stale if new plans land while Plan A is in flight. | Phase 1 verification gate re-greps `plans/pending/` at execution time. Re-run if the queue shifts. |
| `npm run plans:reindex` validation rejects Plan A's frontmatter (e.g., LR-041 Model+Thinking+PermissionMode check). | Frontmatter is set: Opus / xhi / plan / Skills /planning. Should pass. Re-verify on first reindex run. |

---

## Out of scope (handled in sibling plans / not now)

- Anything in `PLAN_VERTICAL_DELIVERY_SOX.md` (Plan B) — PR / branch / ticket / SOX rule encoding / `SHIP_TO_ENCORE.md` rewrite / cycle commands. Plan B remains L2-frozen; this plan does not unfreeze it.
- LR-ENC-002 + LR-ENC-003 encoding into `clients/encore/CLAUDE.md`.
- Direct push to `Encore-Global` repo or any feature-branch creation there.
- Execution of Layer 1 infra preface, per-submodule cycles, or Layer 3 closure. Plan A produces the queue; execution happens via existing subplans, /execute one at a time, post-Plan-A approval.
- Authoring of new subplan files. The vertical bundle is a TABLE referencing existing subplans, not a new tree of files.
- Edits to `plans/INDEX.md` — auto-regenerated only.
- Skill creation (SP-DQU-32 /today, SP-DQU-33 /nextweek) — orthogonal initiatives; remain in pending/ unless triaged otherwise.
- Repo cleanup work (SP-REPO-*) — separate priority lane; default KEEP per Phase 4.

---

## Verification

After execution + before LR-027 closure:

```bash
# Phase 1 verification — manifest covers all pending plans
ls plans/pending/*.md | wc -l                                            # current pending count
grep -c '^|' clients/encore/specs_planning/_internal/vertical-restructure-manifest-2026-05-06.md  # manifest rows (minus header)
# expect: row count >= pending count (one row per file; SUPERSEDED rows added during Phase 4 increase total)

# Phase 4 verification — every stale-tagged plan has a disposition
grep -c '^|.*|.*|.*|' clients/encore/specs_planning/_internal/vertical-restructure-manifest-2026-05-06.md
# spot-check: each of the 49 stale-tagged plans (per INDEX.md Warnings section) appears with a disposition

# Phase 3 verification — HIST + DQU masters amended
grep -l '2026-05-06 vertical-execution overlay' plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md
# expect: both files match (option A); OR HIST master in plans/done/ with SUPERSEDED status (option B)

# Phase 5 verification — submodule queue table embedded
grep -c '^| #1 \| Currency' plans/pending/PLAN_VERTICAL_RESTRUCTURE_PENDING.md   # if Currency-first ordering accepted
# expect: 1 (or whatever ordering Rutvik confirmed)

# LR-027 closure — Status flipped, Executed date, Execution Summary written
grep -E '^\*\*Status\*\*: DONE' plans/done/PLAN_VERTICAL_RESTRUCTURE_PENDING.md
grep -E '^\*\*Executed\*\*: 2026' plans/done/PLAN_VERTICAL_RESTRUCTURE_PENDING.md
grep '### Execution Summary' plans/done/PLAN_VERTICAL_RESTRUCTURE_PENDING.md

# INDEX regenerated cleanly
npm run plans:reindex
git diff plans/INDEX.md  # expect: changes reflect Plan A move + dispositions; no validation errors
```

---

## Handoff

On Plan A close (Status=DONE, moved to `plans/done/`):

1. Chat-only handoff per `feedback_handoff_in_chat_only.md` — summarise: manifest URL, ordering decision, amendment outcomes (HIST option A or B), stale-plan disposition counts, queue link.
2. **NO obstacle claims** per LR-039.
3. **DOES NOT** start Layer 1 infra preface execution. Rutvik decides when to invoke `/execute SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md` (or whatever submodule #1 starts with).
4. **DOES NOT** unfreeze Plan B. Plan B stays L2-frozen until Encore HIGH-Q answers come back.

Activity log row per LR-028:

```
| 2026-MM-DDThh:mm | giver | done | clients/encore/specs_planning/_internal/vertical-restructure-manifest-2026-05-06.md, plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md, plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md, plans/pending/PLAN_VERTICAL_RESTRUCTURE_PENDING.md | Vertical restructure of plans/pending/ — manifest + queue + amendments + stale triage. |
```
