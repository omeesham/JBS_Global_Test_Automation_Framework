# PLAN — Comprehensive Agent-Identity Standards Realignment + Structural Cure for FCC-Pattern Mistakes

**Status**: DONE
**Executed**: 2026-05-25
**Priority**: HIGH
**Created**: 2026-05-25
**Identity**: OWNER
**Author**: OWNER
**Depends on**: (none — standalone)
**Model**: claude-opus-4-7
**Thinking**: max
**Justification**: Multi-rule judgment across 13 files spanning skill / agent / rule / hook / client-config layers; structural cure requires Opus + max per LR-041 (RCA / closure gates / multi-rule judgment tier).
**PermissionMode**: acceptEdits
**BrowserTool**: none

---

## Context

**Why this exists**: FCC pilot (Notes module, May 2026) + Notes/SSL spec pilots landed 40 FCC TCs (26 Notes + 14 SSL) in `.spec.ts` files but skipped (a) `clients/encore/specs_planning/test-cases/*.md`, (b) `clients/encore/specs_planning/test-plans/*.md`, (c) CSV exports via `to-csv.ts`, (d) accurate Execution Summary documenting these gaps, (e) per-identity satisfaction. Symptom: SP00 of `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT` shows 391 CSV rows mapped, 264 Yes / 127 No, 9 fail-fixme, 100 red-flag findings; the 264 match is only CSV TCs that *also* exist in a spec — ~85 spec TCs are CSV-invisible.

**User intent (2026-05-25, verbatim)**:
1. "Update them [identity sys prompts] to current repo standards if they are not already to make sure everything is setup properly."
2. "Find the reason why FCC messed up, find all places where FCC subplans / parent messed up."
3. "Ultrathink a solution in which we do minimal changes to make sure whatever was already messed up will never be messed up… each subplan's job is to make sure each identity is satisfied by the execution of the subplan… no work should be left unplanned/unexecuted at any cost."
4. "ultrathink and go through everything not just one thing, fix it properly, no patchy stuff, take best approach to fix things without being lazy in any corner."

**SP00..SP08 already owns retroactive cleanup of existing CSV/MD/test-plan backlog**; this plan is the **forward-looking structural cure** so DQU (next pilot) and beyond cannot repeat the pattern.

**Authoring trail**: this plan was drafted in scratch under the user's transient `~/.claude/plans/` directory then promoted to repo per `feedback_save_plan_location.md` (e.g. the scratch dir holds session-scoped drafts that never become the canonical home). Three audit-add findings (Edit 1.4 SKILL.md:259, Edit 1.5.5 AGENT_SHARED_RULES.md:801, Edit 2.7 RUTVIK.agent.md:19), one prose correction (sync:mistakes is no-op for `.claude/agents/` post-2026-04-27 Copilot eviction — drop SYNC-ONLY framing per scratch-plan §7 O1 recommendation), and one count fix (51 → 40 FCC TCs) were folded in during promotion.

---

## Bootstrap

- **Identity**: OWNER (governance edits across `.claude/agents/*.md`, `.claude/skills/identity/SKILL.md`, `.claude/rules/pipeline.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md`, `.githooks/pre-commit`, `clients/encore/CLAUDE.md`, `clients/encore/specs_planning/_internal/agent-mistakes.md`).
- **Skills auto-called**: `/execute` (current run; auto-routes `/relevant`, `/regression-guard`, `/audit`, `/reflect`), `/final-q` (Phase 4 exit per LR-042).
- **Context files**:
  - `.claude/context/navigation.md` — R00 universal first-step lookup.
  - `clients/encore/specs_planning/_internal/agent-mistakes.md` — ALL-071 / ALL-072 / ALL-077.
  - `.claude/context/patterns.md` — Save/Submit + Radix UI decision trees.
  - `.claude/rules/pipeline.md` — LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-049, LR-050, LR-055 + TodoWrite Tagging Contract.
  - `.claude/rules/hooks-identity.md` — LR-042 (chain artifacts), LR-043 (identity discipline).
  - `.claude/rules/data.md` — LR-001..006 (function signatures, catalog parity, error handling, React, external data).
  - `.claude/rules/baseline.md` — LR-045 (baseline-truth workflow).
  - `.claude/rules/browser-tool.md` — LR-038 v2, LR-054.
  - `.claude/rules/inventory.md` — LR-007/013/014/015/016/029.
  - `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 (file ownership), §19 (audit integrity).
  - `docs/read_only_docs/LEARNED_RULES.md` — ALL-071 (spec ↔ MD ↔ CSV parity).
  - `clients/encore/CLAUDE.md` — LR-ENC-001 (baseline truth source), LR-008/012/017/036.

---

## Per-Identity Satisfaction (LR-048 v2 dogfood — forward-compatible)

This plan is an OWNER governance plan; pipeline identities are not exercised. Matrix is included as forward-compatibility because Layer 4 lands LR-048 v2 in this same execution.

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | — no requirements / baseline-walk work | — |
| GIVER | (none) | — no test-cases / test-plans / CSV authoring | — |
| BUILDER | (none) | — no spec authoring | — |
| HEALER | (none) | — no RCA / spec-fix work | — |
| WATCHDOG | (none) | — Phase 3 self-verification only (OWNER session per /audit §0, not WATCHDOG self-audit per AUD-017) | — |
| GARDENER | (none) | — no DRY / dead-code sweep | — |
| OWNER | `.claude/skills/identity/SKILL.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md`, `.claude/agents/{GENERATOR,PLANNER,AUDIT,HEALER,MAINTAINER,REQUIREMENTS,RUTVIK.agent}.md`, `.githooks/pre-commit`, `.claude/rules/pipeline.md`, `clients/encore/CLAUDE.md`, `clients/encore/specs_planning/_internal/agent-mistakes.md` | Path realignment + 7-agent FCC contract closure + 3 pre-commit gates + LR-048 v2 matrix + LR-ENC-002 + 2 mistake-table rows | `grep -rn "\.github/agents/" .claude/skills/identity/SKILL.md docs/read_only_docs/AGENT_SHARED_RULES.md .claude/agents/` → 0 lines; `grep -nE "tests/(\*\*)?" docs/read_only_docs/AGENT_SHARED_RULES.md` → 0 lines; all 6 `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md` paths resolve. |

---

## Audit Findings (forensic synthesis from this session's read passes + audit-add discoveries)

### 2.1 FCC mistake root cause (1-line)

`.claude/agents/GENERATOR.md` FCC Paradigm section (lines 39–49) lists 5 steps for FCC spec authoring but contains **no step** requiring PLANNER's MD / test-plan / field-case-catalog to exist BEFORE spec writing. BUILDER followed its sys-prompt; the prompt is the bug.

### 2.2 The /identity standards drift (cascading + audit-add discoveries)

| Location | Stale reference | Reality |
|---|---|---|
| `.claude/skills/identity/SKILL.md` lines 114-122 (Step 2 table) | `.github/agents/playwright-{X}.agent.md` (6 rows) | `.claude/agents/{AUDIT,GENERATOR,HEALER,MAINTAINER,PLANNER,REQUIREMENTS}.md` |
| `.claude/skills/identity/SKILL.md` line 149 (Step 3 Gate 2) | `all tools permitted except direct .github/agents/*.agent.md edits (must use npm run sync:mistakes)` | sync:mistakes is no-op for `.claude/agents/` post-2026-04-27 Copilot eviction; drop SYNC-ONLY framing |
| `.claude/skills/identity/SKILL.md` line 259 (Step 6.5 template) — **audit-add** | `all except .github/agents/*.agent.md direct edits` for OWNER | Same as above |
| `.claude/skills/identity/SKILL.md` lines 316, 323 (Step 8 OWNER inline) | HARD STOP #3 + SYNC ONLY row reference `.github/agents/*` | Same as above |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` line 101 (§2 row) | OWNER `.github/agents/**` SYNC ONLY | `.claude/agents/**` RW for OWNER governance edits |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` line 105 (§2 footnote) | GARDENER scope includes `tests/` | `tests/` retired 2026-04-30 client-deliverable rebuild — replaced by per-client `src/utils/` |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` line 113 | `Script-Controlled: .github/agents/* — modify ONLY via npm run sync:mistakes` | Drop SYNC-ONLY; mistake graduation is now direct OWNER edit; sync script no-op for these paths |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` line 121 (§2.1) | OWNER READ `clients/${ACTIVE_CLIENT}/tests/**` | `clients/${ACTIVE_CLIENT}/specs/**` |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` line 801 (§19.4) — **audit-add** | hypothetical legacy reference to `.github/agents/playwright-pipeline-audit.agent.md` HARD STOP 0a | `.claude/agents/AUDIT.md` HARD STOP 0a |
| `.claude/agents/RUTVIK.agent.md` line 19 — **audit-add** | `clients/encore/tests/` in per-client surface ownership | `clients/encore/specs/` (post-2026-04-30 rebuild) |

**Impact**: every `/identity X` Step 2 ("READ the agent file in full") reads a missing path → role-drift hallucination → HARD STOPs never internalized → FCC-style mistakes go un-blocked.

### 2.3 Per-agent FCC-paradigm gaps (read-confirmed 2026-05-25)

| Agent file | Current FCC contract | Gap |
|---|---|---|
| `GENERATOR.md` (lines 39-49) | 5 FCC steps (runner, top-placement, independence, untouched-bottom, data file) | No "verify PLANNER artifacts exist FIRST" step; no post-write parity gate |
| `PLANNER.md` (lines 47-59) | Field-case-catalog mandate + test-cases.md append + selector hygiene escalation | HARD STOP #8 (TC-PLAN SYNC) doesn't explicitly call out FCC IDs; post-complete (HARD STOP #10) doesn't enforce CSV row-count == MD TC count |
| `AUDIT.md` (lines 44-55) | FCC Completeness mode | No "audit-runs check:tc-parity FIRST" gate; no Identity-Drift sweep mode |
| `HEALER.md` (HARD STOPS 0-5) | Diagnostics-first, RCA-tree, no guess-patch | No HARD STOP for MD sync when fix renames/adds/removes TC IDs |
| `MAINTAINER.md` (HARD STOPS 0-5) | Read-only on selectors, no business logic | Doesn't explicitly disclaim parity ownership (could drift into spec/MD edits during refactor) |
| `REQUIREMENTS.md` (lines 39-45) | OLD/NEW baseline truth, no clicks | No FCC scope note (HUNTER could try to author FCC if scope unclear) |

### 2.4 Enforcement infrastructure inventory (verified 2026-05-25)

All needed scripts exist; almost none are wired into pre-commit:

| Script | Path | Flags verified | Currently wired? |
|---|---|---|---|
| `npm run check:tc-parity` | `scripts/check-tc-parity.ts` | `--fix-csv` only (NO `--module`) | ❌ Manual |
| `npm run check:tc-parity:fix` | same + `--fix-csv` | regenerates CSVs from MD | ❌ Manual |
| `npm run validate:activity-log` | `scripts/validate-activity-log.mjs` | `--json --quiet --baseline= --recent=N --latest-per-file` | ❌ Manual |
| `npm run validate:activity-log:preflight` | same + `--latest-per-file --recent=5` | preflight noise-reduction | ❌ Manual |
| `validate-plan-closure.mjs` | `scripts/validate-plan-closure.mjs` | `--plan --enforce --changed --staged --report-only --content-from-stdin --json --write-manifest` | ✅ `.claude/hooks/plan-closure-gate.sh` (PreToolUse on Edit/Write + Bash matcher) |
| `.githooks/pre-commit` | 4 gates: plans-reindex, TC-MD ↔ field-inventory, vendor-fresh (warn-only), BUG-1 page-fixture | ❌ Does NOT call check:tc-parity or validate:activity-log or validate-plan-closure |
| `.githooks/pre-push` | vendor-fresh (deprecated no-op), deny-list-forbidden | ❌ No parity gate |

### 2.5 Quantification of the existing mistake (from SP00 + glob audit)

- Notes module: 26 FCC TCs + 32 main + 5 HIST = 63 spec TCs; MD has 37 rows; CSV **missing entirely**.
- Local-office: 14 SSL FCC TCs in spec; CSVs merged into one file (should be 3: BAS, HIS, ECT).
- **Total FCC TCs added without GIVER artifacts: 40** (26 Notes + 14 SSL — the scratch plan's "51+" claim was inflated; 40 is the audited count).
- ~85 spec TCs are CSV-invisible (the 391 − 264 gap user observed).
- All four FCC-related plans (parent + SP-NOTES-FCC, SP-FCC-COMPLETION) closed `Status: DONE` with `YELLOW` verdict citing pre-existing test brittleness — none cited "MD/CSV/test-plan not regenerated" as explicit non-deliverables (LR-027 §c never invoked).

---

## Solution Architecture (8 layers — audit-adds 1.4, 1.5.5, 2.7 promoted to core)

Ordering is execution-order — each layer depends on its predecessors landing first.

### Layer 1 — `/identity` SKILL.md path realignment (4 edits)

**File**: `.claude/skills/identity/SKILL.md`

**Edit 1.1** — Step 2 table lines 114-122: replace 6 stale `.github/agents/playwright-*.agent.md` rows with `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md`.

**Edit 1.2** — Step 3 Gate 2 line 149: replace OWNER prose to drop SYNC-ONLY framing per scratch-plan §7 O1. New prose: `OWNER identity: all tools permitted. Agent files (.claude/agents/*.md) are governance-owned by OWNER and modified via direct edits; there is no SYNC-ONLY enforcement (npm run sync:mistakes is a no-op for .claude/agents/ post-2026-04-27 Copilot eviction). Mistake graduation from agent-mistakes.md to agent HARD STOPS / scope clauses is a manual OWNER process per ALL-077.`

**Edit 1.3** — Step 8 OWNER inline lines 316, 323: rewrite HARD STOP #3 + SYNC ONLY row to remove `.github/agents/*` references and drop sync-only framing; replace with direct-edit OWNER governance note.

**Edit 1.4** (**audit-add**) — Step 6.5 template line 259: replace `"all except .github/agents/*.agent.md direct edits" for OWNER` with `"all tools permitted (no SYNC-ONLY constraint post-2026-04-27)" for OWNER`.

**Verification**:
```bash
grep -n "\.github/agents/" .claude/skills/identity/SKILL.md  # Expected: 0 lines
ls .claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md  # Expected: all 6 exist
```

### Layer 1.5 — `AGENT_SHARED_RULES.md` §2 + §19.4 path audit (5 edits)

**File**: `docs/read_only_docs/AGENT_SHARED_RULES.md`

**Edit 1.5.1** — §2 row 101: `.github/agents/**` SYNC ONLY → `.claude/agents/**` RW for OWNER (governance edits direct; sync workflow no-op post-2026-04-27).

**Edit 1.5.2** — §2 line 105 (GARDENER scope footnote): drop `tests/`; add `clients/${ACTIVE_CLIENT}/src/utils/`; append retirement note.

**Edit 1.5.3** — §2 line 113 (Script-Controlled row): rewrite to drop SYNC-ONLY framing — `.claude/agents/*.md` files are direct OWNER edits; mistake graduation is manual per ALL-077; sync-agent-mistakes.ts is no-op for these paths and retained pending separate decommission decision.

**Edit 1.5.4** — §2.1 line 121: `clients/${ACTIVE_CLIENT}/tests/**` → `clients/${ACTIVE_CLIENT}/specs/**`.

**Edit 1.5.5** (**audit-add**) — §19.4 line 801: hypothetical legacy reference `.github/agents/playwright-pipeline-audit.agent.md` HARD STOP 0a → `.claude/agents/AUDIT.md` HARD STOP 0a.

**Verification**:
```bash
grep -nE "(\.github/agents|tests/(\*\*)?)" docs/read_only_docs/AGENT_SHARED_RULES.md  # Expected: 0 lines (or only refs with date-stamped historical context)
```

### Layer 2 — Per-agent FCC-paradigm closure (7 files: 6 pipeline + RUTVIK.agent)

#### 2.1 `.claude/agents/GENERATOR.md` (BUILDER) — primary FCC fix

Add HARD STOP #11 after #10 (EXACT COMBOBOX MATCH, line 23):

> 11. **NO SPEC WITHOUT GIVER ARTIFACTS (FCC parity, ALL-071)**: before writing or editing any FCC test (TC-<MOD>-FCC-NNN) in a `.spec.ts`, verify ALL THREE exist for the module: (a) `clients/${ACTIVE_CLIENT}/specs_planning/test-cases/<module>_test_cases.md` contains a `## Field-Case Coverage (FCC)` block enumerating each TC ID; (b) `clients/${ACTIVE_CLIENT}/specs_planning/test-plans/<module>.md` enumerates each FCC TC as a Scenario row; (c) `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-case-catalogs/<module>-<YYYY-MM-DD>.md` exists and is ≤14 days old. Any missing → HALT, escalate to PLANNER (GIVER) via `agent-escalations.json`. FCC-pilot regression fix (2026-05-25).

Augment FCC Paradigm section — insert as new step 6 after current step 5:

> 6. **Post-write parity gate** (FCC mistake prevention, 2026-05-25): after the spec is written and `npx playwright test --list` confirms TC IDs resolve, run `npm run check:tc-parity`. Exit 0 → continue to Phase 3 (First Run). Exit 1 → HALT, escalate to PLANNER for MD/test-plan/CSV reconciliation. NEVER declare done with parity gaps. The pre-commit hook also enforces this — bypassing via `--no-verify` is a §16 (autonomy) violation.

Augment Workflow step 8 (Self-audit) — append two items:

> - `npm run check:tc-parity` returns exit 0 (0 spec-orphan, 0 MD-orphan, 0 CSV-orphan).
> - Activity-log row for this session names the FCC TC IDs added + parity-check output snippet per LR-042 evidence-emission.

#### 2.2 `.claude/agents/PLANNER.md` (GIVER) — sole owner of MD/test-plans/CSV

Augment HARD STOP #8 (TC-PLAN SYNC line 21) — append:

> FCC TCs are TCs — same rule. Every `TC-<MOD>-FCC-NNN` in `test-cases/<module>_test_cases.md` MUST appear in `test-plans/<module>.md` Scenarios with matching content. Cross-check at queue-unlock; mismatch → HALT, do not unblock BUILDER.

Augment HARD STOP #10 (POST-COMPLETE line 23) — append:

> Augmented self-check (2026-05-25 FCC-fix): confirm `clients/${ACTIVE_CLIENT}/test_cases_csv/<module>_test_cases.csv` row count == (FCC block TC count + main TC count) from the MD. Mismatch → re-run `to-csv.ts`, re-verify. BUILDER is structurally blocked from spec authoring without this (per GENERATOR.md HARD STOP #11).

Augment FCC Paradigm section — append Closure gate paragraph:

> **Closure gate** (2026-05-25): before flipping queue-stage to `pending_generation`, planner-post-complete output MUST show `selfAuditPassed=true`, `csvExported=true`, AND CSV row count == MD's TC count (FCC + main). Hand-off contract to BUILDER is that all three artifacts (MD, test-plan, catalog) are present and consistent.

#### 2.3 `.claude/agents/AUDIT.md` (WATCHDOG) — terminal quality guardian

Insert Workflow step 1.5 between current 1 and 2:

> 1.5. **Parity pre-check (FCC mistake prevention, 2026-05-25)**: every audit invocation runs `npm run check:tc-parity` BEFORE any mode-specific work. Any non-zero exit = CRITICAL P0 finding "FCC parity violation across repo"; emit per-module spec-orphan / MD-orphan / CSV-orphan counts in findings table BEFORE proceeding to requested mode. Parity violation discovered = block "no findings" verdict on audit regardless of mode outcome.

Add new Modes table row:

> | Identity-Drift | "audit identity", "audit agent files" | per-agent sys-prompt audit: each `.claude/agents/*.md` references current paths (post-2026-04-30 — no `.github/agents/`, no `tests/`); HARD STOPS consistent with `AGENT_SHARED_RULES.md` §2; FCC parity HARD STOP exists in GENERATOR.md (#11); CSV-regen step exists in PLANNER.md post-complete; activity-log timestamps within LR-037 tolerance. |

#### 2.4 `.claude/agents/HEALER.md` — fix-mode parity sync

Add HARD STOP #6 after #5 (BEFOREUNLOAD TRAP, line 18):

> 6. **NO SPEC EDIT WITHOUT MD SYNC (FCC parity, ALL-071)**: if a fix adds, removes, or renames any TC ID in a `.spec.ts`, the corresponding row in `clients/${ACTIVE_CLIENT}/specs_planning/test-cases/<module>_test_cases.md` MUST be updated in the same commit. Pure test-body fixes (no TC inventory change) do not require MD edit. Run `npm run check:tc-parity` exit 0 before closing. If a removal needs `test.skip('missing-coverage: <reason>')`, still update MD row Status accordingly.

Augment Self-audit (Workflow step 7) — append:

> - `npm run check:tc-parity` returns exit 0 after the fix.
> - If TC was removed via `test.skip('missing-coverage')`, MD row's Status is set to `Manual (missing-coverage)` with the same reason text.

#### 2.5 `.claude/agents/MAINTAINER.md` (GARDENER) — explicit parity disclaimer

Augment HARD STOP #5 (READ-ONLY ON SELECTORS, line 18) — append:

>    **Explicit out-of-scope (2026-05-25 FCC-fix)**: GARDENER does NOT regenerate CSVs, sync MD↔spec, or author FCC tests. Those are GIVER/BUILDER/HEALER turf per ALL-071. GARDENER may flag a parity gap as P0 in sweep output (escalate to BUILDER if spec-orphan, GIVER if MD/CSV-orphan), but never makes spec / MD / CSV edits.

Augment Workflow step 5 (`npm run check:tc-parity` row) — append:

>    Flag parity gaps in the sweep report as P0 with named recipient (BUILDER if spec-orphan, GIVER if MD/CSV-orphan).

#### 2.6 `.claude/agents/REQUIREMENTS.md` (HUNTER) — scope clarity

Augment FCC Paradigm section (lines 39-45) — append:

> **Scope note (2026-05-25 FCC-fix)**: HUNTER does NOT author FCC TCs and does NOT edit `test-cases/*.md`. FCC paradigm is introduced at GIVER's `field-case-catalogs/` phase from this baseline artifact. HUNTER's REQUIREMENTS.md and `old-site-baseline/<module>-<YYYY-MM-DD>.md` updates are upstream truth; FCC additions are downstream derivatives owned by GIVER + BUILDER per ALL-071.

#### 2.7 `.claude/agents/RUTVIK.agent.md` — stale-path correction (**audit-add**)

Edit line 19 (per-client surface row): `clients/encore/tests/` → `clients/encore/specs/`. The post-2026-04-30 client-deliverable rebuild retired root `tests/` and per-client `clients/<id>/tests/`; specs now live at `clients/<id>/specs/` per LR-049 / repo structure note in root CLAUDE.md.

### Layer 3 — Pre-commit gate wiring (3 new gates)

**File**: `.githooks/pre-commit`

Insert three new conditional blocks before final `exit 0` (current line 53):

```bash
# --- 5) ALL-071: spec ↔ MD ↔ CSV parity (FCC mistake prevention, 2026-05-25). ----
if git diff --cached --name-only --diff-filter=ACMR \
     | grep -qE '^clients/[^/]+/specs/.*\.spec\.ts$'; then
  echo "[pre-commit] spec file staged → running check:tc-parity (ALL-071)..." >&2
  if ! npm run --silent check:tc-parity; then
    echo "[pre-commit] HALT: ALL-071 parity gap. Fix MD/test-plan/CSV before commit." >&2
    echo "         Inspect: npm run check:tc-parity" >&2
    echo "         Auto-fix CSVs only: npm run check:tc-parity:fix (still requires MD updates manually)" >&2
    exit 1
  fi
fi

# --- 6) LR-028 + LR-037: activity-log timestamp validation. ----------------------
if git diff --cached --name-only --diff-filter=ACMR | grep -qE 'agent-activity-log\.md$'; then
  echo "[pre-commit] activity-log staged → validating LR-037 timestamps..." >&2
  if ! node scripts/validate-activity-log.mjs --latest-per-file --recent=5 --quiet; then
    echo "[pre-commit] HALT: activity-log row backdated relative to referenced file mtimes (LR-037)." >&2
    exit 1
  fi
fi

# --- 7) LR-027 + LR-040: plan-finalization closure check. -----------------------
if git diff --cached --name-only --diff-filter=ACMR | grep -qE '^plans/(pending|done)/.*\.md$'; then
  echo "[pre-commit] plan file staged → running validate-plan-closure (LR-027 + LR-040)..." >&2
  if ! node scripts/validate-plan-closure.mjs --staged --enforce; then
    echo "[pre-commit] HALT: plan Status flip without Execution Summary OR closure-gate (a/b/c) gap." >&2
    exit 1
  fi
fi
```

**Cost**: 24 LOC added. **Blast radius**: pre-commit is `--no-verify`-bypassable (legitimate emergency escape); each gate fires only when relevant files are staged. Gate C is defense-in-depth alongside the existing PreToolUse `plan-closure-gate.sh` (catches git CLI commits that bypass agent session).

### Layer 4 — LR-048 v2: per-identity satisfaction matrix

**File**: `.claude/rules/pipeline.md`

Augment LR-048 (Subplan Structural Minimum) — insert item 6.5 between current item 6 (Phase 1+) and item 7 (Acceptance criteria):

> 6.5. **Per-identity satisfaction matrix** (FCC mistake prevention, 2026-05-25 — LR-048 v2) — REQUIRED whenever a subplan's body or downstream effects produce, modify, or delete any of: `.spec.ts`, `test-cases/*.md`, `test-plans/*.md`, CSV exports under `test_cases_csv/`, `field-case-catalogs/*.md`, `field-inventories/*.md`, `REQUIREMENTS.md`, `agent-mistakes.md`, or `_internal/old-site-baseline/*.md`.
>
>    The subplan body MUST contain a section `## Per-Identity Satisfaction` with a table enumerating HUNTER / GIVER / BUILDER / HEALER / WATCHDOG / GARDENER + owned artifact + concrete deliverable + acceptance command for each.
>
>    Rules: any cell marked `(none)` is acceptable AND must be EXPLICITLY MARKED — silence ≠ "no work", silence = LR-048 violation. Each non-`(none)` cell's Acceptance command MUST appear in Phase 3.5 closure step (LR-027) with evidence-emission format. At Status flip to DONE, every non-`(none)` cell is classified (a)/(b)/(c) per LR-040.
>
>    **Why this exists**: SUBPLAN_NOTES_FCC_PILOT (2026-05-21) added 26 Notes FCC TCs to specs but did not enumerate GIVER's deliverables (MD FCC block, test-plan Scenarios, CSV re-export). Without a structural matrix, those items silently became "future cleanup" — exactly what PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT is now retroactively remediating. The matrix is the structural prevention.
>
>    **Cross-refs**: LR-040 (closure-gate completeness); LR-050 (restructure plans enumerate stale-slop cleanup); LR-027 (execution summary mandatory); ALL-071 (spec-MD parity).

### Layer 5 — Client-level parity rule in `clients/encore/CLAUDE.md`

**File**: `clients/encore/CLAUDE.md`

Insert after LR-008 (line 77 area, before LR-012):

> ### LR-ENC-002: FCC parity is structural — never lazy-defer MD/CSV/test-plan updates
>
> When any subplan produces, modifies, or deletes a `clients/encore/specs/**/*.spec.ts` test case (FCC or non-FCC), the parity contract is structural — enforced by:
> 1. Per-agent HARD STOPS (BUILDER #11, HEALER #6, AUDIT step 1.5, PLANNER #8+#10) — agents HALT on missing MD/test-plan/CSV.
> 2. Pre-commit hook gates A/B/C in `.githooks/pre-commit` — commits HALT on parity gaps, backdated activity-log rows, or plan closure without Execution Summary.
> 3. LR-048 v2 Per-Identity Satisfaction Matrix — subplans cannot leave artifact obligations unscoped at authoring time.
>
> If you ever feel like "I'll do the MD/CSV later in a follow-up subplan" — that's the FCC mistake pattern. STOP. Author the parity work IN the current subplan, OR explicitly mark it `(none)` in the matrix with a one-line justification.
>
> **Trigger**: every subplan touching Encore spec / test-case / test-plan / CSV artifacts.
> **Graduated from**: SUBPLAN_NOTES_FCC_PILOT (2026-05-21) closure-gate gap → PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT retroactive cleanup → this plan's structural prevention.
> **Cross-refs**: ALL-071 (framework parity rule); LR-027 (execution summary); LR-040 (closure-gate); LR-048 v2 (subplan matrix); BUILDER HARD STOP #11.

### Layer 6 — Codify FCC mistake as agent-mistakes entries (TABLE format)

**File**: `clients/encore/specs_planning/_internal/agent-mistakes.md`

This file uses TABLE format (`| ID | Rule | Resolution |`) per the file's canonical convention — NOT heading format. Two new rows: one in Planner section (insert after PLN-049 at line 161), one in Generator section (insert after GEN-043 at line 202). Use next-safe IDs: **GEN-044** (next past GEN-043) and **PLN-050** (next past PLN-049).

GEN-044 row:
> | GEN-044 | FCC specs require PLANNER artifacts FIRST. Before writing/editing any `TC-<MOD>-FCC-NNN` block in a `.spec.ts`, verify (a) `test-cases/<module>_test_cases.md` `## Field-Case Coverage (FCC)` block enumerates each TC ID, (b) `test-plans/<module>.md` has matching Scenario rows, (c) `field-case-catalogs/<module>-<YYYY-MM-DD>.md` ≤14 days old. Any missing → HALT, escalate to GIVER. Post-write: `npm run check:tc-parity` exit 0 required before declaring done. Pre-commit Gate A enforces structurally. | SP-NOTES-FCC + SP-SSL-FCC (2026-05-21): added 40 FCC TCs (26 Notes + 14 SSL) across .spec.ts files without GIVER artifacts. 85 spec TCs CSV-invisible per SP00 of PLAN_MD_CSV_SPEC_PARITY (2026-05-25). BUILDER HARD STOP #11 + pre-commit Gate A added 2026-05-25 (PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE). LR-ENC-002 client-level summary. |

PLN-050 row:
> | PLN-050 | FCC TCs are TCs — same TC-PLAN SYNC + post-complete + CSV-regen rules apply. Every `TC-<MOD>-FCC-NNN` in `test-cases/<module>_test_cases.md` MUST appear in `test-plans/<module>.md` Scenarios with matching content. `planner:post-complete` self-check confirms CSV row count == (FCC block TC count + main TC count). Missing match → HALT at queue-stage flip to `pending_generation`. BUILDER cannot pick up the queue entry until parity is satisfied. | SP-NOTES-FCC + SP-SSL-FCC (2026-05-21): PLANNER did not run `planner:post-complete` after adding FCC TCs → CSV never re-exported, test-plan never got Scenario rows. PLANNER HARD STOP #8 + #10 augmented 2026-05-25 (PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE). LR-ENC-002 client-level summary. |

Update file-head ID master list comment counters: `GEN-001 to GEN-044` and add a new note line: `NOTE: GEN-044 + PLN-050 from PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE (2026-05-25 FCC structural cure).`

### Layer 7 — DEFERRED: PreToolUse spec-write advisory hook

**File**: `.claude/hooks/lib/check-spec-md-parity.mjs` (NEW) + `.claude/settings.json` matcher

**Recommendation**: **DEFER** unless Layers 1–6 prove insufficient after 2 weeks of observation. Layers 1–4 already catch the gap at write-time (HARD STOP #11), at commit-time (pre-commit Gate A), and at audit-time (WATCHDOG step 1.5). PreToolUse adds ~35 LOC + 1 new hook for ~1 minute earlier catch — marginal value vs rule-inflation fatigue (LR-043 remediation principle).

Defer-condition reconsider: if commits land with `--no-verify` repeatedly AND HARD STOP #11 is being ignored (visible in agent transcripts), promote Layer 7 to active. Track in a follow-up plan `PLAN_LAYER_7_PRETOOLUSE_ESCALATION.md` only when needed.

---

## Files Manifest (13 files — audit-add 2.7 promoted)

| # | File | Edit type | LOC delta | Layer |
|---|---|---|---|---|
| 1 | `.claude/skills/identity/SKILL.md` | Step 2 table + Step 3 Gate 2 + Step 8 inline + Step 6.5 template | +3 net | 1 (4 edits) |
| 2 | `docs/read_only_docs/AGENT_SHARED_RULES.md` | §2 row 101 + line 105 + line 113 + §2.1 line 121 + §19.4 line 801 | ±0 net | 1.5 (5 edits) |
| 3 | `.claude/agents/GENERATOR.md` | HARD STOP #11 + FCC §6 + self-audit | +12 | 2.1 |
| 4 | `.claude/agents/PLANNER.md` | HARD STOP #8/#10 augment + FCC closure-gate | +9 | 2.2 |
| 5 | `.claude/agents/AUDIT.md` | Step 1.5 + Identity-Drift Mode | +7 | 2.3 |
| 6 | `.claude/agents/HEALER.md` | HARD STOP #6 + self-audit | +5 | 2.4 |
| 7 | `.claude/agents/MAINTAINER.md` | HARD STOP #5 augment + workflow step 5 augment | +4 | 2.5 |
| 8 | `.claude/agents/REQUIREMENTS.md` | FCC scope note | +3 | 2.6 |
| 9 | `.claude/agents/RUTVIK.agent.md` | line 19 stale-path fix (`tests/` → `specs/`) | ±0 | 2.7 (audit-add) |
| 10 | `.githooks/pre-commit` | 3 new gates (A, B, C) | +24 | 3 |
| 11 | `.claude/rules/pipeline.md` (LR-048) | item 6.5 per-identity matrix | +25 | 4 |
| 12 | `clients/encore/CLAUDE.md` | LR-ENC-002 | +12 | 5 |
| 13 | `clients/encore/specs_planning/_internal/agent-mistakes.md` | GEN-044 + PLN-050 table rows + ID counter update | +5 | 6 |

**Total: ~109 LOC across 13 files**. Zero file rewrites. Zero deletions. All changes are append/insert/edit-in-place.

---

## Build Sequence

1. **Pre-flight reads** (done): all 6 pipeline agent files + RUTVIK.agent.md, AGENT_SHARED_RULES.md, SKILL.md, pre-commit/pre-push, clients/encore/CLAUDE.md, 4 script files, navigation.md, agent-mistakes.md, patterns.md, all `.claude/rules/*.md` covering the LRs cited.
2. **Plan relocation** (done at /execute Phase 2 start): write canonical plan to `plans/pending/PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE.md`.
3. **Layer 1** (SKILL.md): restores `/identity` agent-file loading. Without this, downstream agent-file edits don't get internalized when the user runs /identity.
4. **Layer 1.5** (AGENT_SHARED_RULES.md): makes §2 ownership table consistent with current paths; pipeline-identity write-gate (`identity-switch-gate.sh`) reads from this table.
5. **Layer 2 in order**: GENERATOR.md (FCC root cause) → PLANNER.md (upstream contract) → AUDIT.md (cross-check enforcement) → HEALER.md (fix-mode parity) → MAINTAINER.md (out-of-scope) → REQUIREMENTS.md (scope clarity) → RUTVIK.agent.md (stale-path correction).
6. **Layer 3** (pre-commit gates): independently verifiable.
7. **Layer 4** (LR-048 v2): codifies per-identity contract that Layers 1.5 + 2 enforce per-agent.
8. **Layer 5** (clients/encore/CLAUDE.md LR-ENC-002): client-level summary, last so it references stable Layer 2/3/4 IDs.
9. **Layer 6** (agent-mistakes.md): TABLE rows + ID counter update, must be AFTER Layer 2 sets the hard stops the entries reference.
10. **Phase 3.5 closure**: flip Status: DONE + Execution Summary + activity-log row + `git mv` to `done/` + `npm run plans:reindex`. (Single-shot commit at the end stages all 14 file changes including this plan.)
11. **Phase 4 `/final-q`**: verdict with evidence-emission per layer.

---

## Verification Plan (per /execute Phase 3 + /final-q evidence-emission)

### 6.1 Path drift eliminated

```bash
grep -rn "\.github/agents/" .claude/skills/identity/SKILL.md docs/read_only_docs/AGENT_SHARED_RULES.md .claude/agents/ 2>&1 | grep -v "^Binary"
# Expected: 0 lines

grep -nE "(\s|^)tests/(\*\*)?(\s|$)" docs/read_only_docs/AGENT_SHARED_RULES.md .claude/agents/RUTVIK.agent.md
# Expected: 0 lines (or historical-only with date stamps)

for f in REQUIREMENTS PLANNER GENERATOR HEALER AUDIT MAINTAINER; do
  test -f ".claude/agents/$f.md" && echo "OK: $f" || echo "MISSING: $f"
done
# Expected: 6 OK, 0 MISSING
```

### 6.2 Pre-commit gates wired

```bash
grep -nE "(check:tc-parity|validate-activity-log|validate-plan-closure)" .githooks/pre-commit
# Expected: 3+ matches
```

### 6.3 Per-agent FCC hard stops landed

```bash
grep -nE "(HARD STOP #?11|HARD STOP #?6.*MD SYNC|step 1\.5.*Parity pre-check|Identity-Drift|Closure gate|Scope note.*HUNTER|Explicit out-of-scope)" \
  .claude/agents/{GENERATOR,PLANNER,AUDIT,HEALER,MAINTAINER,REQUIREMENTS}.md
# Expected: 7+ matches across 6 files
```

### 6.4 Rules / mistakes landed

```bash
grep -n "LR-048 v2\|Per-identity satisfaction matrix" .claude/rules/pipeline.md
# Expected: matches in LR-048 body

grep -n "LR-ENC-002" clients/encore/CLAUDE.md
# Expected: 1+ matches

grep -nE "^\| (GEN-044|PLN-050) \|" clients/encore/specs_planning/_internal/agent-mistakes.md
# Expected: 2 rows
```

### 6.5 Plan-closure validator dry-run

```bash
node scripts/validate-plan-closure.mjs --plan plans/pending/PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE.md --report-only
# Expected: PASS (Status: PENDING; closure not yet flipped)
```

---

## Open Questions (carried from scratch; partial resolution during execution)

1. **O1 — sync:mistakes workflow status**: RESOLVED during execution per scratch §7 O1 recommendation — SYNC-ONLY framing dropped throughout (Layer 1.2/1.3/1.4/1.5.3). `sync-agent-mistakes.ts` script is no-op for `.claude/agents/*` since 2026-04-27 Copilot eviction; decommission decision deferred to a separate Maintainer sweep.

2. **O2 — check:tc-parity per-module flag**: Deferred per scratch §9. Pre-commit runs in ~10-30s when a spec is staged (acceptable).

3. **O3 — Layer 2 stale-path audit beyond FCC fixes**: RESOLVED during execution — `.claude/agents/RUTVIK.agent.md:19` stale `clients/encore/tests/` reference promoted from audit-add to Layer 2.7. All 6 pipeline agent files verified post-2026-04-30 path-clean otherwise.

4. **O4 — ts-node startup overhead in pre-commit `check:tc-parity`**: Acceptable (~3-5s). Keep `npm run` form for readability.

5. **O5 — Pre-commit Gate C redundancy with PreToolUse**: Intentional defense-in-depth. PreToolUse catches agent-session edits; pre-commit catches git CLI / external editor commits that bypass the agent session.

---

## Out of Scope (explicit)

- **Closing the existing FCC backlog** — SP00..SP08 of PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT owns retroactive cleanup. This plan is forward-looking only.
- **Layer 7 PreToolUse spec-write hook** — deferred unless Layers 1–6 prove insufficient after 2 weeks (LR-043 rule-inflation fatigue).
- **CI/GitHub Actions parity gate** — pre-commit + pre-push + PreToolUse sufficient given existing discipline.
- **Adding `--module=<module>` flag to `check-tc-parity.ts`** — performance enhancement, not correctness fix.
- **Patching `sync-agent-mistakes.ts` for `.claude/agents/`** — separate Maintainer sweep; prose has been corrected to acknowledge no-op state. APPEND target: a future `PLAN_MAINTAINER_SWEEP_2026_06.md` or similar (no current named recipient — flagged in Adjacent-Sweep Phase 2.5).
- **Rewriting any agent file from scratch** — all 7 agents are post-2026-04-30 path-clean (after RUTVIK.agent.md:19 fix) and structurally correct; only FCC-related HARD STOP/scope additions are needed.

---

## Execution Summary

**Date executed**: 2026-05-25
**Executed by**: OWNER session (claude-opus-4-7, thinking=max, `/execute /ultrathink`)
**Total files modified**: 15 (13 from manifest + this plan + 1 Phase 2.5 APPEND target).

### Layers landed (8/8 — all in-scope work shipped)

| Layer | File(s) | Edits | Verification (grep) |
|---|---|---|---|
| 1 | `.claude/skills/identity/SKILL.md` | Step 2 table (6 rows), Step 3 Gate 2 prose, Step 8 OWNER inline (HARD STOP #3 + SYNC ONLY row), Step 6.5 template | `grep "\.github/agents/" .claude/skills/identity/SKILL.md` → 0 lines |
| 1.5 | `docs/read_only_docs/AGENT_SHARED_RULES.md` | §2 row 101, §2 line 105 footnote, §2 line 113 Script-Controlled, §2.1 line 121, §19.4 line 801 | `grep "\.github/agents/" docs/read_only_docs/AGENT_SHARED_RULES.md` → 0 lines; `grep "tests/" docs/read_only_docs/AGENT_SHARED_RULES.md` → 0 lines |
| 2.1 | `.claude/agents/GENERATOR.md` | HARD STOP #11 (NO SPEC WITHOUT GIVER ARTIFACTS), FCC §6 (Post-write parity gate), self-audit append (parity exit 0 + activity-log) | `grep "HARD STOP #?11\|Post-write parity gate" .claude/agents/GENERATOR.md` → 3 hits |
| 2.2 | `.claude/agents/PLANNER.md` | HARD STOP #8 FCC clause, HARD STOP #10 CSV count check, FCC Closure gate paragraph | `grep "FCC clause\|Closure gate" .claude/agents/PLANNER.md` → 2 hits |
| 2.3 | `.claude/agents/AUDIT.md` | Workflow step 1.5 (Parity pre-check), Modes table new Identity-Drift row | `grep "Parity pre-check\|Identity-Drift" .claude/agents/AUDIT.md` → 2 hits |
| 2.4 | `.claude/agents/HEALER.md` | HARD STOP #6 (NO SPEC EDIT WITHOUT MD SYNC), self-audit parity items | `grep "HARD STOP #?6\|MD SYNC" .claude/agents/HEALER.md` → 2 hits |
| 2.5 | `.claude/agents/MAINTAINER.md` | HARD STOP #5 Explicit out-of-scope clause, Workflow step 5 P0 recipient note | `grep "Explicit out-of-scope" .claude/agents/MAINTAINER.md` → 1 hit |
| 2.6 | `.claude/agents/REQUIREMENTS.md` | FCC Paradigm Scope note (HUNTER does NOT author FCC) | `grep "Scope note.*HUNTER\|HUNTER does NOT" .claude/agents/REQUIREMENTS.md` → 1 hit |
| 2.7 | `.claude/agents/RUTVIK.agent.md` | line 19 `clients/encore/tests/` → `clients/encore/specs/` (audit-add) | `grep "clients/encore/tests/" .claude/agents/RUTVIK.agent.md` → 0 lines |
| 3 | `.githooks/pre-commit` | Gate 5 (ALL-071 check:tc-parity), Gate 6 (LR-028/LR-037 activity-log), Gate 7 (LR-027/LR-040 plan-closure) | `grep "check:tc-parity\|validate-activity-log\|validate-plan-closure" .githooks/pre-commit` → 6+ hits |
| 4 | `.claude/rules/pipeline.md` | LR-048 item 6.5 — Per-Identity Satisfaction Matrix (LR-048 v2) | `grep "LR-048 v2\|Per-Identity Satisfaction Matrix" .claude/rules/pipeline.md` → 1+ hits |
| 5 | `clients/encore/CLAUDE.md` | LR-ENC-002 (FCC parity is structural) inserted after LR-ENC-001 | `grep "LR-ENC-002" clients/encore/CLAUDE.md` → 2 hits (header + body) |
| 6 | `clients/encore/specs_planning/_internal/agent-mistakes.md` | PLN-050 row (Planner section), GEN-044 row (Generator section), ID master list bump (GEN-043 → GEN-044) + new NOTE line | `grep "^\\| (GEN-044\\|PLN-050) \\\|" clients/encore/specs_planning/_internal/agent-mistakes.md` → 2 hits |

### Audit-adds promoted from plan-mode audit findings (not patches — structural improvements)

Three audit findings during plan-mode review were promoted to core layers rather than left as deferred:

- **Layer 1.4 (SKILL.md:259 Step 6.5 template)**: original scratch plan missed this stale `.github/agents/*.agent.md` reference. Folded into Layer 1.
- **Layer 1.5.5 (AGENT_SHARED_RULES.md:801 §19.4 footnote)**: original scratch plan missed this hypothetical legacy `.github/agents/playwright-pipeline-audit.agent.md` reference. Folded into Layer 1.5.
- **Layer 2.7 (RUTVIK.agent.md:19 stale `clients/encore/tests/`)**: original scratch plan claimed "all 6 agent files post-2026-04-30 path-clean"; was false for the 7th non-pipeline agent file. Promoted to Layer 2.

### Prose corrections applied during execution

- **SYNC-ONLY framing dropped throughout** (per scratch plan §7 O1 recommendation). `scripts/sync-agent-mistakes.ts` is no-op for `.claude/agents/*` post-2026-04-27 Copilot eviction; all four SYNC-ONLY references (Edit 1.2, 1.3, 1.4 in SKILL.md + Edit 1.5.3 in AGENT_SHARED_RULES.md) now describe direct OWNER governance edits with no SYNC enforcement.
- **FCC count fix 51 → 40** in Audit Findings §2.5 (26 Notes + 14 SSL = 40 verified across SP-NOTES-FCC + SP-SSL-FCC parent plans; scratch plan's "51+" claim was inflated).

### Phase 2.5 Adjacent-Sweep dispositions

Two out-of-scope items APPENDed to `plans/pending/PLAN_MAINTAINER_SWEEP.md` as named-recipient line items per LR-040 §b (NOT phantom hand-offs):

- **SP-MNT-FCC-01** — Patch or formally decommission `scripts/sync-agent-mistakes.ts` (no-op for `.claude/agents/*` since 2026-04-27).
- **SP-MNT-FCC-02** — Add `--module=<module>` flag to `scripts/check-tc-parity.ts` (performance enhancement for pre-commit Gate A).

Verification: `grep "SP-MNT-FCC-0[12]" plans/pending/PLAN_MAINTAINER_SWEEP.md` → 2 hits.

Remaining "out-of-scope" items in plan §9 are either self-trigger-conditioned (Layer 7 PreToolUse hook — defer-and-promote-if-needed clause) or already-named-recipient (SP00..SP08 of PLAN_MD_CSV_SPEC_PARITY for FCC backlog cleanup). No phantom hand-offs.

### LR-001..006 implementation defect scan (`.claude/rules/data.md`)

- **LR-001 (function signatures)**: N/A — no function calls across modules introduced; all edits are markdown / bash hooks.
- **LR-002 (catalog parity)**: PASS — Layer 6 adds 2 mistake-table rows with matching agent-file HARD STOPS (BUILDER #11 ↔ GEN-044; PLANNER #8/#10 ↔ PLN-050). LR-048 v2 matrix references all 6 pipeline identities (no orphaned catalog entries).
- **LR-003 (no empty catch)**: N/A — no try/catch in bash hooks; pre-commit gates use explicit `exit 1` on failure with `echo` to stderr.
- **LR-004 (React cleanup)**: N/A — no React code.
- **LR-005 (useCallback deps)**: N/A — no React hooks.
- **LR-006 (external data validation)**: PASS — pre-commit gates use `git diff --cached --name-only --diff-filter=ACMR` with explicit `grep -qE` pattern matching (no blind parsing).

### Verification artifact (D23 — runnable)

```bash
# Path-drift gate
grep -rn "\.github/agents/" .claude/skills/identity/SKILL.md docs/read_only_docs/AGENT_SHARED_RULES.md .claude/agents/ 2>&1 | grep -v "^Binary" | grep -v "AUDIT.md:30:" | grep -v "REQUIREMENTS.md:.*no \`\.github/agents/\`"
# Expected: 0 lines (AUDIT.md:30 + REQUIREMENTS.md prose mentions of `.github/agents/` are intentional Identity-Drift meta-references)

# All 6 pipeline agent paths resolve
for f in REQUIREMENTS PLANNER GENERATOR HEALER AUDIT MAINTAINER; do test -f ".claude/agents/$f.md" && echo "OK: $f" || echo "MISSING: $f"; done
# Expected: 6 OK, 0 MISSING

# Pre-commit gates wired
grep -nE "(check:tc-parity|validate-activity-log|validate-plan-closure)" .githooks/pre-commit | wc -l
# Expected: 6+

# LR-048 v2 + LR-ENC-002 + GEN-044 + PLN-050 + SP-MNT-FCC-0{1,2} all greppable
grep -l "LR-048 v2" .claude/rules/pipeline.md && grep -l "LR-ENC-002" clients/encore/CLAUDE.md && grep -nE "^\\| (GEN-044|PLN-050) \\\|" clients/encore/specs_planning/_internal/agent-mistakes.md && grep "SP-MNT-FCC-0[12]" plans/pending/PLAN_MAINTAINER_SWEEP.md
# Expected: 4+ greppable artifacts
```

### Deviations from plan body

- **3 audit-add edits promoted** (1.4 / 1.5.5 / 2.7) — not deviations, additions that strengthen the plan (per user directive "no patchy stuff, take best approach without being lazy in any corner").
- **1.2/1.3/1.5.3 prose rewritten** per scratch §7 O1 recommendation — not a deviation, an explicit recommendation followed.
- **Layer 6 used TABLE format** (not heading format) — corrected during execution: the file's canonical convention is `| ID | Rule | Resolution |` tables, the scratch plan body had used `### GEN-XXX:` heading prose form which would not match the file's existing 200+ rows. TABLE format matches file convention.
- **Layer 6 IDs**: used GEN-044 (next past GEN-043) and PLN-050 (next past PLN-049 — scratch plan had named PLN-048 as highest, but PLN-049 was added in a prior session for field-inventory artifact; PLN-050 is the actual next-safe).
- **Layer 7 stays DEFERRED** per plan §3 — no promotion.

### Out-of-scope items closure-gate disposition (LR-040 a/b/c classification)

| Item | Classification | Disposition |
|---|---|---|
| Existing FCC backlog cleanup | (b) | SP00..SP08 of PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT — grep-verifiable existing recipient |
| Layer 7 PreToolUse spec-write hook | (c) | Self-trigger-conditioned defer (reconsider in 2 weeks if `--no-verify` abuse appears in chain audits) |
| `sync-agent-mistakes.ts` patch/decommission | (b) | SP-MNT-FCC-01 in `plans/pending/PLAN_MAINTAINER_SWEEP.md` (APPENDed during Phase 2.5) |
| `check-tc-parity.ts` `--module` flag | (b) | SP-MNT-FCC-02 in `plans/pending/PLAN_MAINTAINER_SWEEP.md` (APPENDed during Phase 2.5) |
| CI/GitHub Actions parity gate | (c) | Self-trigger-conditioned defer (add if `--no-verify` becomes a habit) |
| Rewriting agent files from scratch | n/a | Not needed — all 7 agents path-clean after Layer 2.7 |

Every out-of-scope item has a named recipient (b) or a self-trigger-conditioned defer (c). Zero phantom hand-offs.

---

## Activity-Log Row (appended at /execute Phase 3.5 end, per LR-028 + LR-037)

Format (timestamp set at completion):

```
| 2026-05-25Thh:mm | OWNER | done | plans/pending/PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE.md, .claude/skills/identity/SKILL.md, docs/read_only_docs/AGENT_SHARED_RULES.md, .claude/agents/GENERATOR.md, .claude/agents/PLANNER.md, .claude/agents/AUDIT.md, .claude/agents/HEALER.md, .claude/agents/MAINTAINER.md, .claude/agents/REQUIREMENTS.md, .claude/agents/RUTVIK.agent.md, .githooks/pre-commit, .claude/rules/pipeline.md, clients/encore/CLAUDE.md, clients/encore/specs_planning/_internal/agent-mistakes.md | FCC structural cure: 8 layers across 14 files. L1 SKILL.md path realignment (4 edits incl 1.4 audit-add). L1.5 AGENT_SHARED_RULES.md §2 + §19.4 audit (5 edits incl 1.5.5 audit-add). L2 per-agent FCC HARD STOPs (7 files incl 2.7 RUTVIK audit-add). L3 pre-commit gates A/B/C (ALL-071/LR-028/LR-027). L4 LR-048 v2 per-identity satisfaction matrix. L5 LR-ENC-002 client-level rule. L6 GEN-044 + PLN-050 mistake-table rows. SYNC-ONLY framing dropped per scratch O1 (sync-agent-mistakes.ts no-op for .claude/agents/ post-2026-04-27). 51→40 FCC count fix. Closes forward-looking FCC mistake pattern; SP00..SP08 owns retroactive cleanup. |
```
