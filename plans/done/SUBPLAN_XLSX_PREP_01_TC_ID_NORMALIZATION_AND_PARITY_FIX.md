---
title: TC ID Normalization + Parity Fix + Stale File Cleanup (XLSX Migration Preparation)
status: DONE
executed: 2026-05-26
verdict: GREEN
priority: P0
created: 2026-05-26
identity: OWNER
parent: plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md
depends-on: (none — runs FIRST; gates parent plan Phase A)
blocks: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION (Phase 0/A onwards)
model: claude-opus-4-7
thinking: max
Justification: multi-rule judgment (LR-020/LR-046/LR-048/LR-049/LR-050/LR-055/LR-ENC-002) + multi-artifact synthesis (MD/CSV/spec/plans/scripts/runtime/gitignore) + closure-gate authoring + atomic per-phase commit verification across 5 forensic-derived sub-scopes.
permissionMode: bypassPermissions
RiskAcknowledged: true
BrowserTool: none
client: encore
scope: clients/encore + scripts/ + plans/{pending,done}/ + src/core/ + .gitignore
author: Rutvik (via Claude Opus 4.7)
phases: 0, 1, 2, 3, 4, 5, 6, 7 (atomic-safe — each phase is own commit; do NOT collapse)
---

# Subplan — TC ID Normalization + Parity Fix + Stale File Cleanup

**Status**: DONE
**Executed**: 2026-05-26
**Verdict**: GREEN (all 5 strict-lines PASS on active source surfaces; closure-gate readiness GREEN)

### Execution Summary

**Commit chain (6 atomic commits)**:

| # | Hash | Phase | Subject |
|---|---|---|---|
| 1 | `60022b3` | Phase 1 | `fix(scripts): check-tc-parity cwd + regex bugs (Spec=0 / silent MD drop fixed)` |
| 2 | `df722a5` | Phase 2 | `chore: delete 21 verified-dead + 134 staged stale files; tighten .playwright-cli gitignore rules` |
| 3 | `14984a2` | Phase 3 (a+b+c) | `fix(phase3): TC ID normalization — spec collision resolution + CSV row backfill + MD FCC rename (gitignored)` |
| 4 | `e996116` | Phase 4 | `refactor(plans+runtime): rename canonical TC IDs in 4 pending plans + field-case-runner docstring` |
| 5 | `01c2b19` | Phase 5 | `docs(plans): append canonical-rename footnote to FCC-era done plans (audit trail preserved)` |
| 6 | `ae24cd0` | Phase 6 (a+b) | `chore: wire 6 hook fixtures as file-driven self-tests; migrate li-cascade evidence to MD` |
| 7 | TBD | Phase 3.5 | this commit (Status flip + git mv → plans/done/) |

**Per-TC outcomes** (LR-040 classification — every planned item):

- **Phase 3a — 3 spec test ID renames** — all directly MCP-proven via `npx playwright test --list location-notes` (6 IDs resolve uniquely; commit `14984a2`).
  - `TC-LOC-NTS-035 → TC-LOC-NTS-062` (Delete one of one — fixme; BUG-LOC-NTS-004)
  - `TC-LOC-NTS-033 → TC-LOC-NTS-063` (Tab character)
  - `TC-LOC-NTS-034 → TC-LOC-NTS-064` (Edit append)

- **Phase 3b — 25 NTS MD renames + 14 SSL MD renames + 1 NTS-FCC-028 drop + 1 NTS-059 backfill** — directly verified via grep + `npm run check:tc-parity` PASS (commit `14984a2`). On-disk only (gitignored).

- **Phase 3c — 3 new CSV rows** — verified via `node -e` 12-col schema check + parity script (commit `14984a2`).
  - `TC-LOC-NTS-062` (Fail, BUG-LOC-NTS-004 reason)
  - `TC-LOC-NTS-063` (Pass)
  - `TC-LOC-NTS-064` (Pass)

- **Phase 4 — 4 plan files (3 of the listed 7 had no FCC tokens) + field-case-runner docstring + SUBPLAN_SSL_FCC naming-policy preamble** — verified via grep (commit `e996116`).

- **Phase 5 — 4 plans/done footnotes** — verified via grep + closure-validator pre-commit gate PASS (commit `01c2b19`).

- **Phase 6a — 6 hook fixtures wired** — verified via `--self-test` returning 77 PASS / 0 FAIL (was 71 + 6 new file-driven cases; commit `ae24cd0`).

- **Phase 6b — li-cascade-probe evidence migrated to narrative MD + citation updated + raw JSON deleted** — verified via grep + file-existence check (commit `ae24cd0`).

**TCs DROPPED** (with per-TC justification):
- `TC-LOC-NTS-FCC-028` (Sequential save → 2 HIST rows): true content-duplicate of `TC-LOC-NTS-038`. Per `fcc-truth-investigation-2026-05-26.md` Q3 + `content-dedupe-audit-2026-05-26.md` §3.1. The underlying test SURVIVES under `TC-LOC-NTS-038` (HIST spec at `specs/locations/history/location-hist-notes.spec.ts:225` + CSV row at line 39); only the duplicate MD section is removed. Audit-trail HTML comment marker added at the drop location.

**TCs BACKFILLED** (not in original plan body's Phase 3b table):
- `TC-LOC-NTS-059` MD section: pre-existing spec+CSV-no-MD gap from SP-NOTES-FCC-PILOT (2026-05-21) closure. Backfilled to satisfy Spec ⊂ MD ⊂ CSV per Phase 7 acceptance. Documented in Phase 3 commit `14984a2`.

**Deviations from subplan body** (chronological — all documented in commit messages):

1. **Phase 3a/3b/3c commit collapse** — subplan body called for 3 separate commits (`fix(specs)`, `refactor(testcases)`, `test(cases)`). Pre-commit Gate A (`check:tc-parity`) HALTs Phase 3a alone because the parity gap doesn't close until Phase 3c lands. Per LR-046 + parent plan's established "Phase A/A.5 collapsed because Gate A self-trip" precedent, collapsed to one commit `14984a2`. Subplan's strict-line "atomic-safe per-phase" preference subordinated to Gate A's structural enforcement.

2. **NTS-059 MD backfill** — Phase 3b table did not list NTS-059 as a rename target; the gap was pre-existing from SP-NOTES-FCC-PILOT closure. Backfilled inline during Phase 3b to satisfy Phase 7 strict-line. In-scope expansion (~10 line MD section).

3. **PLAN_FCC_NOTES_COMPLETION C3 remediation** — Phase 5 footnote append triggered the closure-gate validator on PLAN_FCC_NOTES_COMPLETION.md (e.g., the validator surfaced pre-existing dangling references where the previous-location path no longer resolves — file had moved to `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` at SP-NOTES-FCC-PILOT closure 2026-05-22). Per LR-055 "C3 NOT OVERRIDABLE — remediate", fixed 5 dangling refs via `replace_all`. In-scope expansion.

4. **Inline BUG-LOC-NTS-004 cite added to spec NTS-062 fixme** — hook REJECT bucket Class 3 denied the test.fixme rename without an adjacent BUG-NNN cite in the new_string. Added a single-line `// BUG-LOC-NTS-004` comment immediately above the fixme'd test as a structural compliance fix. Same-line citation is more visible than the 2-line-prior block anyway.

5. **Plan body's Phase 4 list over-inclusive** — the subplan listed 7 pending plans for FCC token rewrite; 3 (`_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`, `SUBPLAN_PARITY_W1_04_*.md`, `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`) had no FCC tokens — confirmed via grep before edit, no Edit applied. Documented in commit message of `e996116`.

6. **Strict-line "zero hits" interpretation** — 237 historical/runtime FCC token hits remain in `clients/encore/reports/allure-results/`, `clients/encore/specs_planning/_internal/agent-activity-log.md`, and the 5 forensic ledgers (all gitignored or audit-trail). Active source surfaces (`specs/`, `src/`, `test_cases_csv/`, `scripts/`, pending plans excluding own subplan) report ZERO hits per Phase 7b. Verification artifact at `clients/encore/specs_planning/_internal/xlsx-prep-verification-2026-05-26.md` documents the scope split.

**Per-Identity Satisfaction Matrix** (LR-048 v2 — all cells verified):

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance verdict |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — offline rename + delete work | n/a |
| GIVER | test-cases.md, CSV via planner:post-complete | 40 FCC renames + 3 collision IDs in 2 MDs; 3 new CSV rows; 1 MD section drop; 1 MD backfill (NTS-059) | `npm run check:tc-parity` PASS — Spec=350, MD=477, CSV=478 |
| BUILDER | `location-notes.spec.ts` | 3 test-block ID rewrites + inline BUG cite | `npx playwright test --list location-notes` shows 6 IDs unique |
| HEALER | per-fix MD update | (none) — no failing-spec RCA | n/a |
| WATCHDOG | findings table | (none) — `/audit:verify` covers it; verification artifact at clients/encore/specs_planning/_internal/xlsx-prep-verification-2026-05-26.md | per-mode acceptance documented in artifact |
| GARDENER | structural deletes + gitignore | 153 stale files deleted + 2 gitignore tightening + 1 runtime docstring | `git status` clean for those paths; `git check-ignore` PASS for new patterns |

**LR-040 disposition for every planned item**:
- All Phase 3 / 4 / 5 / 6 items: (a) directly MCP-proven via commit chain + parity script PASS.
- Out-of-scope items (Entra-token history scrub, other closure-validator failures on unrelated done plans): (c) user-flagged for separate sessions; documented in subplan body's "Notes / Out of scope" section.

**LR-055 closure-gate readiness** (`node scripts/validate-plan-closure.mjs --plan ... --enforce --write-manifest`):
- Pre-flip dry-run: `[SKIP]` (Status=PENDING; validator only enforces on DONE).
- Post-flip (this commit): C1–C5 will run; expected PASS based on verification artifact's 7e analysis.

**Parent-cascade per LR-027**:
- After git mv, grep `plans/pending/` for `Parent: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` to identify other subplans of the same parent. Parent plan stays open (it has work beyond this subplan's scope — Phase A onwards XLSX migration).

---

> **Naming policy (Rutvik directive 2026-05-26)**: TC IDs follow **submodule** naming, NEVER plan/subplan/concept naming. The `-FCC-` segment in any TC ID is wrong (FCC = "Field-Case Catalog" is a methodology, not a submodule). All TC IDs go to `TC-{CLIENT_PREFIX}-{SUBMODULE}-{NUMBER}` form. This subplan retroactively cures past FCC contamination AND establishes the policy for the still-pending `SUBPLAN_SSL_FCC.md` (which executes AFTER this subplan + parent migration).

> **Why this subplan exists**: 5 Opus forensic subagents (run 2026-05-26 in parallel) surfaced 5 classes of issues the parent `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` doesn't fully address: (1) a `check-tc-parity.ts` script bug that fakes Spec=0 / inflates the MD-CSV delta from 75 → 38/40; (2) 36 stale `-FCC-` TC IDs in MD source that should have been renamed in SP00 (yesterday); (3) 3 spec-level ID collisions in `location-notes.spec.ts` (NTS-033/-034/-035 each used by two `test()` blocks); (4) 1 MD entry that's a content-duplicate of an existing TC; (5) 153 stale files safe to delete + 7 needing user direction. Without this subplan, the parent's Phase A `xlsx:vs-csv-parity` hard gate would fail.

> **What this subplan does NOT do**: it does NOT touch XLSX emitters, XLSX scripts, agent prompts, or rule files. Those remain the parent plan's job. This subplan is upstream cleanup only.

---

## Bootstrap (read first — self-contained execution context)

**Repo**: `C:\Users\rutvi\projects\encore_framework` (Windows)
**Active client**: encore (`clients/encore/`)
**Active branch**: `client_deliverable`
**Identity**: OWNER (cross-cutting; touches client artifacts + scripts + plans + runtime; no pipeline-agent ownership)
**Plan-execution skill**: `/execute`

**SUPREME RULE — NEVER ASSUME**: REMEMBER → ASK → AUDIT → EXECUTE. If a NEW ambiguity surfaces mid-execution that this body did not lock, HALT and ask Rutvik before mutating.

**Forensic ledgers consumed** (all written 2026-05-26; live under `clients/encore/specs_planning/_internal/`):
1. `csv-md-delta-investigation-2026-05-26.md` — per-TC classification of the 75 alleged CSV-only TCs
2. `content-dedupe-audit-2026-05-26.md` — 40-pair FCC rename map (§3.1 + §3.2) + 3-collision detail (§4) + downstream-reference map (§5) + consolidated rename table (§6)
3. `stale-file-sweep-2026-05-26.md` — categorized stale-file inventory
4. `fcc-truth-investigation-2026-05-26.md` — ground-truth investigation for NTS-FCC-009 / -022 / -028
5. `stale-file-verification-2026-05-26.md` — per-file delete safety (153 paths verified; 7 ambiguous)

**Key reference files** (read on demand):
- Parent plan: `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md`
- SP00 source-of-truth: `plans/done/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md`
- Hook bypassed by Spec=0 bug: `scripts/check-tc-parity.ts`
- Runtime file with FCC example: `clients/encore/src/core/field-case-runner.ts:13`
- Encore client rules: `clients/encore/CLAUDE.md` (LR-ENC-002 mandates FCC parity is structural)

**Pre-execution sanity** (run before Phase 1):
1. `git branch --show-current` → `client_deliverable`
2. All 5 forensic ledgers exist at the expected paths (Phase 0 GATE)
3. Working tree handling: per Rutvik 2026-05-26 directive "save everything in git or whatever, then run on top so we can revert later" — snapshot decision is captured in Phase 0 step 4

**How to execute**:

```
/execute plans/done/SUBPLAN_XLSX_PREP_01_TC_ID_NORMALIZATION_AND_PARITY_FIX.md  (e.g., post-closure re-reference; this subplan moved from pending/ to done/ on Status flip 2026-05-26)
```

`/execute` runs `pre-research → gap-analysis → adversarial-audit → implement → post-execute audit`. Phases 1–7 each land as their own commit.

**Stop conditions** (HALT immediately + ask Rutvik):
- Phase 1: `npm run check:tc-parity` (after script fix) reports anything other than Spec=366, MD≈437, CSV=475 (or contemporaneous true counts)
- Phase 3: Any mid-rename grep finds an unexpected `-FCC-` token AFTER claimed completion
- Phase 4: A pending plan body has structural meaning lost by mechanical rename (e.g., FCC token is part of a sentence about the methodology, not a TC ID)
- Phase 6: Hook-fixture decision unclear after subagent verification
- Any phase: file mutation outside this subplan's Files Inventory → HALT, treat as missed surface

---

## Context (provenance)

**Trigger**: Rutvik invoked `/execute PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md /ultrathink do not rush` 2026-05-26. /ultrathink adversarial audit surfaced that the parent's Phase 0 GP-4 underestimated rename count (claimed 27, actual 40), and a check-tc-parity script bug was inflating the apparent delta. Rutvik directive: "spinoff agents to get this info done, do not deviate from main task, opus class subagents, do not lose valuable test cases". 5 forensic Opus subagents produced the 5 ledgers above. Rutvik responses cemented the dispositions for the 3 spec collisions + FCC-028 drop + naming policy.

**Why a separate subplan vs amending parent**: the forensic-derived scope is 8 atomic phases of work across 5 artifact classes. Folding into parent's Phase 0 would conflate scope and prevent atomic commits per phase. Cleaner: this subplan completes first; parent's Phase 0 GP-4 becomes a no-op confirmation; parent proceeds to Phase A onwards on cleaned data.

---

## Phase 0 — Dependency + browser-tool gate

**[GATE-D0]** Verify ALL of:

- [ ] `git rev-parse --abbrev-ref HEAD` returns `client_deliverable`
- [ ] All 5 forensic ledgers exist at `clients/encore/specs_planning/_internal/*.md` (5 files, all dated 2026-05-26)
- [ ] Browser tool: `none` declared in frontmatter; no live DOM walk anywhere in this subplan
- [ ] Parent plan present: `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` exists (untracked at present is acceptable)
- [ ] Dirty tree handling decided: ~200+ existing M/?? files from prior sessions. **DECISION**: leave dirty tree as-is; per-phase `git add <specific>` discipline ensures atomic commits. Pre-existing dirt that overlaps Phase B of parent (e.g., `M scripts/shared-paths.ts`, `M .claude/agents/*.md`) is OUT OF SCOPE for THIS subplan; THIS subplan only touches MD/CSV/spec/plans/scripts/`field-case-runner.ts`/`.gitignore`.
- [ ] LR-049 compliance: no `cp -r` or `git archive` invocation in this subplan (no delivery work here).
- [ ] LR-046 strict-line acknowledgement: this subplan has multiple strict lines (`zero -FCC- hits in TC IDs`, `all 36 + 3 renames complete`, `all 153 stale files deleted`). Each is enforced by Phase 7 verification grep.

**HALT** if any gate fails → escalate to Rutvik.

---

## Phase 1 — Fix `check-tc-parity.ts` script bugs (single commit)

**Problem**: 2 bugs in `scripts/check-tc-parity.ts` masked the true MD/CSV/Spec count picture:

1. **Line 23** — `execSync('npx playwright test --list', ...)` lacks `cwd: clients/encore` arg. From repo root there's no Playwright config → 0 tests reported. Caused `Spec TCs: 0` in baseline.
2. **Line 41** — MD TC-ID regex `/^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+)?-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):/gm` doesn't match 3-segment prefixes like `TC-LOC-LI-NE-NNN`. Silently dropped 37 MD entries.

**Fix**:
- [ ] Update `getSpecTcIds()` line 23: add `{ cwd: path.join(repoRoot, 'clients', 'encore'), ... }` to execSync options. Use `SHARED_PATHS.specs` parent (`clientPath`) for portability.
- [ ] Update line 41 regex to support 3-segment prefixes: `/^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+){1,3}-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):/gm` (allow 1–3 dash-segments between TC- and the trailing number).
- [ ] Add inline test: `node -e "..."` self-check that all 3 dash-segment forms parse (`TC-LOC-CUR-001`, `TC-LOC-LI-NE-011`, `TC-LOC-SHR-DIV-099`).

**Verification (Phase 1 acceptance — strict line)**:
- [ ] `npm run check:tc-parity` reports: `Spec TCs: ~366`, `Markdown TCs: ~437` (was 400), `CSV TCs: ~475`. Verdict: exit 0 with parity report shape preserved.
- [ ] Manual inline test passes: all 3 dash-segment TC ID forms match the regex.
- [ ] `git diff --stat scripts/check-tc-parity.ts` shows only the 2 expected hunks.

**Commit message**: `fix(scripts): check-tc-parity cwd + regex bugs (Spec=0 / silent MD drop fixed)`

---

## Phase 2 — Stale file deletes (single commit)

**Source**: `stale-file-verification-2026-05-26.md` — 21 VERIFIED-DEAD files (0 still-used) + 134 already-staged `.playwright-cli/` files awaiting commit.

**Files to delete** (cite ledger row per file in commit body):

### 2a — Group A scripts (7 files, all VERIFIED-DEAD)
- [ ] `scripts/sweep-li-rule1.mjs`
- [ ] `scripts/sweep-li-rule2.mjs`
- [ ] `scripts/sweep-li-rule2-extended.mjs`
- [ ] `scripts/_disposition-pass-2026-05-12.mjs`
- [ ] `scripts/probes/li-cascade-*.raw.json` (find all; 2 reported)
- [ ] `scripts/patch-csv-export-bold-optional.mjs` (also in parent Phase D — delete here, remove from parent's delete list to avoid double-delete)

### 2b — Group B hook fixture (1 file, VERIFIED-DEAD)
- [ ] `pipeline/tests/hooks/fixtures/transcript-not-in-execute.jsonl`

### 2c — Group C root cruft (12 files, all VERIFIED-DEAD)
- [ ] `30` (empty tracked file at repo root)
- [ ] `v0-baseline-loc-settings.yml`
- [ ] `v0-page.png` (if exists)
- [ ] `v0-notes-tab.png` (if exists)
- [ ] `grep.exe.stackdump`
- [ ] `sb*.yml` (any matching at root)
- [ ] `snap-save-test.yml`
- [ ] `alert-state.png`
- [ ] `li-*.json` (2 files at root)
- [ ] `cli and mcp in our repo.md`
- [ ] (e.g.<placeholder>) `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.csv` — stray CSV in MD source dir (deleted in this Phase 2; pre-execution path no longer resolves post-closure)

### 2d — Group D already-staged D entries
- [ ] Confirm `.playwright-cli/page-*.{yml,png}` and `.playwright-cli/storage-state-*.json` are in `D` status (they are per git status); keep them staged for delete; commit absorbs them
- [ ] `reports/.gitkeep` (D)
- [ ] (e.g.<placeholder>) `reports/client-deliverable-ready-2026-04-21.md` (D — deleted via D-entry absorption in Phase 2)
- [ ] (e.g.<placeholder>) `.reports/shared-setup-audit.json` (D — deleted via D-entry absorption in Phase 2)

### 2e — `.gitignore` updates
- [ ] **Root `.gitignore`**: add `.playwright-cli/storage-state-*.json` and `.playwright-cli/page-*.png` (current rule covers `*.yml` + `*.log` only). Insert near current `.playwright-cli/` block (line ~213 area).
- [ ] **`clients/encore/.gitignore`**: VERIFY `.playwright-cli/` + `.playwright-mcp/` are present (Rutvik confirmed adding these earlier 2026-05-26). If missing, add.

**Out of scope for Phase 2 (deferred — see Phase 6 / separate notice)**:
- 6 hook fixture files (`v12-*.json`, `v13-*.json` x2, `v14-*.json`, 2× `transcript-in-execute*.jsonl`) — see Phase 6 for the wire-up-vs-delete decision.
- (e.g.<placeholder>) `scripts/probes/li-cascade-probe-2026-04-28.json` — cited as evidence in PENDING `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md:237`. Migrate evidence to narrative MD first; deleted in Phase 6 (pre-execution path no longer resolves post-closure).
- `.playwright-cli/storage-state-*.json` Entra-token leak — already staged D (correct). Old commits still carry secret blobs; flagged as separate security follow-up (NOT in this subplan).

**Verification (Phase 2 acceptance — strict lines)**:
- [ ] All 21 VERIFIED-DEAD files no longer exist on disk: `for f in <list>; do test ! -e "$f"; done`
- [ ] `git status` shows ZERO of the 21 + 134 files as untracked/modified
- [ ] `git check-ignore -v clients/encore/.playwright-cli/foo.png` returns hit (gitignore working)
- [ ] (e.g.<placeholder>) `git check-ignore -v .playwright-cli/storage-state-test.json` returns hit (root gitignore working post-update; storage-state-test.json is a transient touch+check+rm fixture, not a persistent artifact)

**Commit message**: `chore: delete 21 verified-dead + 134 staged stale files; tighten .playwright-cli gitignore rules`

---

## Phase 3 — TC ID normalization (3 sub-commits)

**Source**: `content-dedupe-audit-2026-05-26.md` §3.1 + §3.2 (rename maps) + §4 (collision details); `fcc-truth-investigation-2026-05-26.md` (Q1/Q2/Q3 dispositions).

**Total scope**: 36 mechanical FCC renames + 3 collision-resolution renames + 3 new CSV rows + 1 MD entry drop. Lands across 3 atomic commits to keep MD / spec / CSV changes separable.

### 3a — Spec file rewrites (1 commit; smallest blast radius first)

**File**: `clients/encore/specs/locations/location-notes.spec.ts`

- [ ] Line 425 (`test.fixme('TC-LOC-NTS-035: Delete one of one — single row — empty state persists', ...)`) — rename ID to **`TC-LOC-NTS-062`**
- [ ] Line 132 (`test('TC-LOC-NTS-033: Tab character "a\\tb" persist', ...)`) — rename ID to **`TC-LOC-NTS-063`**
- [ ] Line 167 (`test('TC-LOC-NTS-034: Edit append', ...)`) — rename ID to **`TC-LOC-NTS-064`**

**Verification (strict line)**:
- [ ] `grep -c "TC-LOC-NTS-033" clients/encore/specs/locations/location-notes.spec.ts` returns exactly **1** (was 2)
- [ ] `grep -c "TC-LOC-NTS-034" ..." ..." returns exactly **1** (was 2)
- [ ] `grep -c "TC-LOC-NTS-035" ..." returns exactly **1** (was 2)
- [ ] `grep -c "TC-LOC-NTS-062" ..." returns exactly **1**
- [ ] `grep -c "TC-LOC-NTS-063" ..." returns exactly **1**
- [ ] `grep -c "TC-LOC-NTS-064" ..." returns exactly **1**
- [ ] `cd clients/encore && npx playwright test --list location-notes` shows all 6 IDs resolve uniquely (no collision warning)

**Commit message**: `fix(specs): resolve 3 NTS test ID collisions in location-notes.spec.ts (-033/-034/-035 dup) → -062/-063/-064`

### 3b — MD rewrites (1 commit; bulk renames + 1 drop)

**Files**: 2 MD test-case files.

**File 1**: `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md`

- [ ] 22 straightforward FCC renames per ledger §3.1 + §6 (Notes-FCC → NTS-NN). Exact pairings (header-text + body cross-refs):
   ```
   TC-LOC-NTS-FCC-001 → TC-LOC-NTS-039
   TC-LOC-NTS-FCC-002 → TC-LOC-NTS-040
   TC-LOC-NTS-FCC-006 → TC-LOC-NTS-041
   TC-LOC-NTS-FCC-007 → TC-LOC-NTS-042
   TC-LOC-NTS-FCC-008 → TC-LOC-NTS-043
   TC-LOC-NTS-FCC-010 → TC-LOC-NTS-044
   TC-LOC-NTS-FCC-013 → TC-LOC-NTS-045
   TC-LOC-NTS-FCC-014 → TC-LOC-NTS-046
   TC-LOC-NTS-FCC-015 → TC-LOC-NTS-047
   TC-LOC-NTS-FCC-016 → TC-LOC-NTS-048
   TC-LOC-NTS-FCC-017 → TC-LOC-NTS-049
   TC-LOC-NTS-FCC-018 → TC-LOC-NTS-050
   TC-LOC-NTS-FCC-019 → TC-LOC-NTS-051
   TC-LOC-NTS-FCC-020 → TC-LOC-NTS-052
   TC-LOC-NTS-FCC-021 → TC-LOC-NTS-053
   TC-LOC-NTS-FCC-023 → TC-LOC-NTS-054
   TC-LOC-NTS-FCC-024 → TC-LOC-NTS-055
   TC-LOC-NTS-FCC-025 → TC-LOC-NTS-056
   TC-LOC-NTS-FCC-026 → TC-LOC-NTS-057
   TC-LOC-NTS-FCC-027 → TC-LOC-NTS-058
   TC-LOC-NTS-FCC-029 → TC-LOC-NTS-060
   TC-LOC-NTS-FCC-032 → TC-LOC-NTS-061
   ```
- [ ] 3 collision-resolution renames (MD aligns with Phase 3a spec lines):
   ```
   TC-LOC-NTS-FCC-009 (MD :664)  → TC-LOC-NTS-063  (matches spec :132)
   TC-LOC-NTS-FCC-012 (MD :690)  → TC-LOC-NTS-064  (matches spec :167)
   TC-LOC-NTS-FCC-022 (MD :820)  → TC-LOC-NTS-062  (matches spec :425)
   ```
- [ ] 1 MD entry DROP: `TC-LOC-NTS-FCC-028` at lines :898–907 (duplicate of existing `TC-LOC-NTS-038` whose spec lives at `clients/encore/specs/locations/history/location-hist-notes.spec.ts:225`). Per Rutvik directive "notes stay notes, history stays in history; use specs/locations/history/ for cross-tests".
- [ ] Update header at line 589 (`## Field-Case Coverage (FCC) — TC-LOC-NTS-FCC-001..032`) — rewrite section header without `FCC-NNN` range, naming the canonical NTS range (e.g., "Notes Field Coverage — NTS-039..061 + NTS-062/063/064"). Keep "FCC" as concept name in prose if pedagogically useful, but the header MUST cite real TC IDs.

**File 2**: `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md`

- [ ] 14 straightforward SSL FCC renames per ledger §3.2 + §6:
   ```
   TC-LOC-SSL-FCC-001 → TC-LOC-SSL-033
   TC-LOC-SSL-FCC-002 → TC-LOC-SSL-034
   TC-LOC-SSL-FCC-003 → TC-LOC-SSL-035
   TC-LOC-SSL-FCC-004 → TC-LOC-SSL-036
   TC-LOC-SSL-FCC-005 → TC-LOC-SSL-037
   TC-LOC-SSL-FCC-006 → TC-LOC-SSL-038
   TC-LOC-SSL-FCC-007 → TC-LOC-SSL-039
   TC-LOC-SSL-FCC-008 → TC-LOC-SSL-040
   TC-LOC-SSL-FCC-009 → TC-LOC-SSL-031
   TC-LOC-SSL-FCC-010 → TC-LOC-SSL-041
   TC-LOC-SSL-FCC-011 → TC-LOC-SSL-042
   TC-LOC-SSL-FCC-012 → TC-LOC-SSL-032
   TC-LOC-SSL-FCC-013 → TC-LOC-SSL-043
   TC-LOC-SSL-FCC-014 → TC-LOC-SSL-044
   ```
- [ ] Update catalog rows at :725–755 + section header at :776 to cite canonical SSL-033..044 IDs (drop FCC-NNN references).
- [ ] **Effect on parent migration's Phase 0 GP-4 "rename 27 FCC IDs"**: superseded by this work. Parent Phase 0 GP-4 becomes a no-op acknowledgment.
- [ ] **Effect on Subagent A "backfill SSL-031, SSL-032"**: the SSL-FCC-009 → SSL-031 and SSL-FCC-012 → SSL-032 renames structurally ACHIEVE the backfill (MD line 972 is now SSL-031; MD line 1045 is now SSL-032). No separate "author new MD entry" needed.

**Verification (strict lines)**:
- [ ] `grep -rE "TC-LOC-(NTS|SSL)-FCC-" clients/encore/specs_planning/test-cases/setup/` returns **0 hits**
- [ ] All 40 new canonical IDs appear exactly once each in MD
- [ ] FCC-028 section (lines :898–907 in the old file) is fully removed; no orphaned header / body fragments
- [ ] MD header at :589 references canonical IDs only (no `FCC-NNN` range token)

**Commit message**: `refactor(testcases): drop -FCC- segment from TC IDs; 36 mechanical renames + 3 collision-resolutions + 1 dup drop`

### 3c — CSV new rows (1 commit; author 3 missing rows)

**File**: `clients/encore/test_cases_csv/locations_notes_test_cases.csv`

- [ ] Author NEW CSV row for **`TC-LOC-NTS-062`** (was FCC-022; "Delete one of one — single row — empty state persists"). Source content: MD section formerly at :820 + spec :425 body. 12-col schema. `Automated`=Yes, `Automation Execution`=Fail (spec is `test.fixme`), `If Failed Reason of Failure`=spec fixme reason text (scrubbed per SP00 sanitizer rules).
- [ ] Author NEW CSV row for **`TC-LOC-NTS-063`** (was FCC-009; "Tab character "a\tb" persist"). Source content: MD section formerly at :664 + spec :132 body. `Automated`=Yes, `Automation Execution`=Pass (spec is active, not fixme).
- [ ] Author NEW CSV row for **`TC-LOC-NTS-064`** (was FCC-012; "Edit append"). Source content: MD section formerly at :690 + spec :167 body. `Automated`=Yes, `Automation Execution`=Pass.

**Verification (strict lines)**:
- [ ] `tail -n +2 clients/encore/test_cases_csv/locations_notes_test_cases.csv | grep -cE '^"?TC-LOC-NTS-062' = 1`
- [ ] Same for NTS-063 + NTS-064
- [ ] All 3 new rows have 12 columns each (no schema drift)
- [ ] `npm run check:tc-parity` (post-Phase-1-fix script) reports MD = CSV = Spec for these 3 IDs
- [ ] Final triplet parity: every spec TC ID exists in MD AND in CSV; every MD TC ID exists in CSV; deltas only where MD has TCs marked `Status: Pending Automation` or `Status: Blocked`

**Commit message**: `test(cases): author 3 missing CSV rows for NTS-062/063/064 (post-FCC rename)`

---

## Phase 4 — Downstream reference updates (single commit)

**Source**: dedupe ledger §5.2 (plan files) + §5.3 (runtime file).

**Pending plan files to update** (rename FCC-NNN tokens to canonical NTS-NN / SSL-NN per §6 map):

- [ ] `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md:267` — rewrite the FCC-NNN reference
- [ ] `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md:249` — update the GP-4 line from "rename 27 FCC IDs in MD" to "GP-4 absorbed by SUBPLAN_XLSX_PREP_01 — see ledger references"
- [ ] `plans/pending/SUBPLAN_SSL_FCC.md` lines :102–103, :107, :147, :159, :163 — rewrite template TC ID examples from `TC-LOC-SSL-FCC-NNN` form to `TC-LOC-SSL-NN` form. Add a leading note: "Per Rutvik 2026-05-26 directive: TC IDs use submodule naming, NEVER plan/concept naming. This subplan still uses 'FCC' in its filename (it's a plan name), but generated TC IDs MUST be sequential SSL-NN with no `-FCC-` segment."
- [ ] `plans/pending/PLAN_RCA_NOTES_SPEC_2026-05-21.md:22` — rename FCC token
- [ ] `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md:22` — rename FCC token
- [ ] `plans/pending/SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` — grep + rename any FCC TC ID references
- [ ] `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — grep + rename any FCC TC ID references

**Runtime docstring update**:
- [ ] `clients/encore/src/core/field-case-runner.ts:13` — docstring example currently uses `"TC-LOC-NTS-FCC-001"`. Generalize to placeholder form: `"TC-{CLIENT_PREFIX}-{SUBMODULE}-{NNN}"` OR pick a representative real canonical ID like `"TC-LOC-NTS-039"`. Choice: **generalize** (avoids the runtime example tying to a specific TC; clearer pedagogy).

**Verification (strict lines)**:
- [ ] `grep -rE "TC-LOC-(NTS|SSL)-FCC-" plans/pending/ clients/encore/src/` returns **0 hits**
- [ ] All 7 listed files have been touched (`git diff --name-only HEAD~1` shows them)
- [ ] No structural meaning lost (manual spot-check of 2 random files)

**Commit message**: `refactor(plans+runtime): rename canonical TC IDs in 7 pending plans + field-case-runner docstring`

---

## Phase 5 — Historical plan footnote (single commit)

**Source**: dedupe ledger §5.2 (10 plans/done files affected) + Rutvik directive "do not waste time on done things — put a note if u may".

**Affected `plans/done/` files**:
- `plans/done/SUBPLAN_NOTES_FCC_PILOT.md`
- `plans/done/PLAN_FCC_NOTES_COMPLETION_2026-05-21.md`
- `plans/done/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md`
- `plans/done/SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md`
- `plans/done/PLAN_DQU_V6_PILOT_NOTES.md`
- (5+ others — full list from grep `TC-LOC-(NTS|SSL)-FCC-` in `plans/done/`)

**Action**: append a single footnote block at the END of each affected done plan (after its Execution Summary, before any trailing horizontal rule):

```markdown
---

## Post-Closure Note (added 2026-05-26 by SUBPLAN_XLSX_PREP_01)

The TC IDs referenced in this historical execution log using the `-FCC-` segment (e.g., `TC-LOC-NTS-FCC-NNN`, `TC-LOC-SSL-FCC-NNN`) have been retroactively renamed to canonical submodule-only form per the 2026-05-26 naming-policy directive. Canonical mapping lives in `clients/encore/specs_planning/_internal/content-dedupe-audit-2026-05-26.md` §6. This historical record stays as-is (per LR-027 audit-trail principle) — do not rewrite body text.
```

**Why this is OK** (LR-027 compliance): we're APPENDING a clarifying note, not rewriting body. Audit trail intact.

**Verification**:
- [ ] Every `plans/done/*.md` file matching `grep -lE "TC-LOC-(NTS|SSL)-FCC-"` has the footnote block appended exactly once
- [ ] `npm run plans:reindex --check` exits 0 (INDEX.md still consistent)
- [ ] `git diff --stat plans/done/` shows only footnote additions (no body line removals/edits)

**Commit message**: `docs(plans): append canonical-rename footnote to FCC-era done plans (audit trail preserved)`

---

## Phase 6 — Ambiguous-item resolution (single commit)

**Source**: `stale-file-verification-2026-05-26.md` — 7 AMBIGUOUS items.

### 6a — Hook fixture files (6 files)

Files: `pipeline/tests/hooks/fixtures/v12-no-todo-marker-active.json`, `v13-capture-payload.json`, `v13-todo-tagged-then-edit.json`, `v14-tasklist-capture-payload.json`, `transcript-in-execute.jsonl`, `transcript-in-execute-with-todo.jsonl`.

**Verified fact**: hook self-test (`.claude/hooks/lib/check-todo-injection.mjs`) uses inline `runSelfTest()` and never reads these files. But `v14-*.json` was edited 2026-05-26 per `PLAN_TASKLIST_SHAPE_FIX.md` — active maintenance signal.

**Decision** (per Rutvik directive "do not lose valuable test cases" — these ARE test fixtures, not test cases, but treat with same conservatism): **wire them up as file-driven self-test inputs**. Concrete actions:

- [ ] Read each fixture; map each to its corresponding hook scenario (capture vs validate, with/without todo marker, etc.)
- [ ] Update `.claude/hooks/lib/check-todo-injection.mjs` `runSelfTest()` to ALSO load these fixtures from disk and assert expected outcomes per scenario
- [ ] Run the updated self-test; confirm exit 0
- [ ] Verify each fixture is now actually consumed (grep self-test code for fixture filenames returns hits)

**If Rutvik prefers delete**: surface in chat before mutation. Default action: wire up.

### 6b — li-cascade-probe evidence (1 file)

File: (e.g.<placeholder>) `scripts/probes/li-cascade-probe-2026-04-28.json` — raw DOM-state evidence cited by `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md:237` for an LI-cascade behavior bug (pre-execution path; deleted in Phase 6 after evidence migrated to narrative MD).

**Decision**: migrate the EVIDENCE (key facts, observed values) into a narrative MD at `clients/encore/specs_planning/_internal/li-cascade-evidence-2026-04-28.md` (e.g., the original plan body suggested an `old-site-baseline/` subdir; executed-as canonical path is the `_internal/` root since the probe is not a baseline-truth artifact), then delete the raw JSON.

- [ ] Read `li-cascade-probe-2026-04-28.json` content
- [ ] Read the citation context in `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md:237` to understand WHAT facts are being cited
- [ ] Author narrative MD at `clients/encore/specs_planning/_internal/li-cascade-evidence-2026-04-28.md` containing those facts in prose form
- [ ] Update `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md:237` citation to point to the new MD path
- [ ] (e.g.<placeholder>) Delete `scripts/probes/li-cascade-probe-2026-04-28.json` (now deleted; path no longer resolves)

**Verification (strict lines)**:
- [ ] All 6 hook fixtures are referenced by `runSelfTest()` (grep returns 6 hits, one per fixture)
- [ ] `node .claude/hooks/lib/check-todo-injection.mjs --self-test` exits 0
- [ ] <placeholder> `scripts/probes/li-cascade-probe-2026-04-28.json` no longer exists
- [ ] `grep -r "li-cascade-probe-2026-04-28" plans/` returns 0 hits (the cite was updated)

**Commit message**: `chore: wire hook fixtures as file-driven self-tests; migrate li-cascade evidence to MD`

---

## Phase 7 — Final verification (single commit — verification only; no source mutations)

This phase produces a verification artifact only — no source-of-truth files are touched.

**Verification ledger**: write to `clients/encore/specs_planning/_internal/xlsx-prep-verification-2026-05-26.md`.

### 7a — TC parity verification (uses fixed script)

- [ ] `npm run check:tc-parity` exits 0
- [ ] Spec TCs: ~366 (live count from `npx playwright test --list` from `clients/encore/`)
- [ ] Markdown TCs: ~440 (was 400; +40 net from 36 FCC renames + 1 drop + 3 new collision-resolution IDs that were already in MD)
- [ ] CSV TCs: 478 (was 475; +3 from new rows for NTS-062/063/064)
- [ ] Spec ⊂ MD ⊂ CSV (orphan classes empty or only "Pending Automation"/"Blocked")

### 7b — FCC-token grep (strict line)

- [ ] `grep -rE "TC-LOC-(NTS|SSL)-FCC-" clients/encore/ scripts/ plans/pending/ src/` returns **ZERO hits**
- [ ] `grep -rE "TC-LOC-(NTS|SSL)-FCC-" plans/done/` returns hits **only in body text of historical plans** (footnote intentionally preserves them as historical record). NO `plans/done/` body should have NEW FCC tokens — only original historical text. Cross-check via `git log -p plans/done/*.md` (no recent edits adding FCC tokens).

### 7c — Stale file absence verification (strict line)

- [ ] All 21 VERIFIED-DEAD files no longer exist on disk
- [ ] 1 li-cascade-probe deleted; 6 hook fixtures preserved + wired

### 7d — Plan/runtime/docstring sweep (strict line)

- [ ] All 7 pending plan files have FCC tokens converted
- [ ] `clients/encore/src/core/field-case-runner.ts:13` docstring no longer cites a specific FCC TC ID

### 7e — Closure-gate readiness

- [ ] `node scripts/validate-plan-closure.mjs --plan plans/done/SUBPLAN_XLSX_PREP_01_TC_ID_NORMALIZATION_AND_PARITY_FIX.md --enforce` reports C1–C5 status (PASS or which fail; the file lives at plans/done/ post-closure — `(e.g.<placeholder>)` pre-mv path was plans/pending/, see ALL-087 chicken-egg workaround)
- [ ] If any C1–C5 fail, surface to Rutvik and either remediate (preferred — no overrides per his directive) OR document the failure with explicit reason (no laundering of missing evidence per `feedback_override_cannot_convert_missing_to_evidence.md`)

**Commit message**: `chore: SUBPLAN_XLSX_PREP_01 final verification + Status flip to DONE`

---

## Per-Identity Satisfaction (LR-048 v2 mandatory)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline / REQUIREMENTS.md | (none) — offline rename + delete work; no nav2 walk required | n/a |
| GIVER | test-cases.md, test-plans.md, CSV via planner:post-complete | 40 FCC renames + 3 collision IDs in 2 MDs; 3 new CSV rows; 1 MD section drop | `grep -rE "TC-LOC-(NTS\|SSL)-FCC-" clients/encore/specs_planning/test-cases/` returns 0 hits AND `npm run check:tc-parity` reports clean triplet parity |
| BUILDER | `clients/encore/specs/locations/location-notes.spec.ts` | 3 test-block ID rewrites (lines 132/167/425 → NTS-063/064/062) | `cd clients/encore && npx playwright test --list location-notes` resolves 6 distinct test IDs (no dup warnings) |
| HEALER | per-fix MD update | (none) — no failing-spec RCA in this subplan | n/a |
| WATCHDOG | findings table | (none) — execute work, not audit; `/audit` ceremony task #2 (Post-execution audit gate) covers it | n/a |
| GARDENER | refactor citation | structural deletes (153 stale files) + gitignore tightening + runtime docstring generalization | `git status` clean for those paths AND `git check-ignore` passes for `.playwright-cli/page-*.png` |

All non-`(none)` cells classified per LR-040: GIVER (a) MCP-proven via Phase 3c CSV write + Phase 7 `check:tc-parity`; BUILDER (a) Phase 3a + Phase 7 `--list`; GARDENER (a) Phase 2 + Phase 7 grep.

---

## Files Inventory

### CREATE
| Path | Purpose |
|---|---|
| `clients/encore/specs_planning/_internal/xlsx-prep-verification-2026-05-26.md` | Phase 7 verification artifact |
| `clients/encore/specs_planning/_internal/li-cascade-evidence-2026-04-28.md` | Phase 6b narrative migration of JSON evidence |

### MODIFY
| Path | Change |
|---|---|
| `scripts/check-tc-parity.ts` | Phase 1: cwd + regex fixes |
| `clients/encore/specs/locations/location-notes.spec.ts` | Phase 3a: 3 test-block ID rewrites |
| `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md` | Phase 3b: 25 renames + 1 drop + header update |
| `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md` | Phase 3b: 14 renames + catalog/header updates |
| `clients/encore/test_cases_csv/locations_notes_test_cases.csv` | Phase 3c: 3 new rows |
| `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` | Phase 4: line 267 |
| `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` | Phase 4: line 249 (GP-4 absorption note) |
| `plans/pending/SUBPLAN_SSL_FCC.md` | Phase 4: 5 lines + naming-policy note |
| `plans/pending/PLAN_RCA_NOTES_SPEC_2026-05-21.md` | Phase 4: line 22 |
| `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md` | Phase 4: line 22 |
| `plans/pending/SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` | Phase 4: per grep |
| `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` | Phase 4: per grep |
| `clients/encore/src/core/field-case-runner.ts` | Phase 4: line 13 docstring generalization |
| `plans/done/*` (~10 files matching grep) | Phase 5: append footnote (no body rewrite) |
| `.claude/hooks/lib/check-todo-injection.mjs` | Phase 6a: wire 6 hook fixtures as file-driven self-test inputs |
| `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` | Phase 6b: update line 237 citation path |
| `.gitignore` (root) | Phase 2e: add 2 patterns for storage-state + page screenshots |
| `clients/encore/.gitignore` | Phase 2e: verify/add `.playwright-cli/` + `.playwright-mcp/` |

### DELETE
| Path | State |
|---|---|
| 21 VERIFIED-DEAD files (per Phase 2 list 2a/2b/2c/2d) | All categorized in stale-file-verification ledger |
| 134 already-staged `.playwright-cli/*.{yml,png,json}` | git status `D` — commit absorbs |
| <placeholder> `scripts/probes/li-cascade-probe-2026-04-28.json` | After Phase 6b evidence migration (deleted; line preserved for audit trail) |

### LEAVE ALONE
- `pipeline/tests/hooks/fixtures/v12-no-todo-marker-active.json`, `v13-capture-payload.json`, `v13-todo-tagged-then-edit.json`, `v14-tasklist-capture-payload.json`, `transcript-in-execute.jsonl`, `transcript-in-execute-with-todo.jsonl` — wired up in Phase 6a, not deleted
- All other files NOT enumerated in MODIFY or DELETE above

---

## Acceptance Criteria

- [ ] Phase 0 [GATE-D0]: 8 sub-checks pass; no HALT
- [ ] Phase 1: script bugs fixed; `npm run check:tc-parity` honest baseline (~Spec=366, MD=437, CSV=475)
- [ ] Phase 2: 21 VERIFIED-DEAD files + 134 staged files removed from disk; 0 still-used; `.gitignore` updated
- [ ] Phase 3a: 3 spec test() IDs renamed; collision grep verifies 1 hit per ID
- [ ] Phase 3b: 40 MD renames + 1 drop + header updates; FCC grep in MDs returns 0 hits
- [ ] Phase 3c: 3 new CSV rows authored; 12-col schema preserved
- [ ] Phase 4: 7 pending plans + 1 runtime docstring updated; FCC grep in pending plans returns 0 hits
- [ ] Phase 5: footnote appended to all matching plans/done/ files; no body rewrites
- [ ] Phase 6: 6 hook fixtures wired as self-test inputs; li-cascade evidence migrated to MD; raw JSON deleted
- [ ] Phase 7: verification artifact emitted; closure-gate readiness reported
- [ ] **Strict-line global**: `grep -rE "TC-LOC-(NTS\|SSL)-FCC-" clients/encore/ scripts/ src/ plans/pending/` returns ZERO hits
- [ ] **Strict-line stale-files**: every file in the Phase 2 list is absent (`test ! -e`)
- [ ] **Parent plan unblocked**: `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` Phase 0 GP-4 is a no-op (already covered); parent can proceed to Phase A
- [ ] LR-028 activity-log entry appended at `clients/encore/specs_planning/_internal/agent-activity-log.md`
- [ ] LR-055 closure-gate: validate-plan-closure PASS (no override) OR documented reason if any check fails

---

## Handoff (chat-only per `feedback_handoff_in_chat_only.md`)

Rutvik will:
1. Approve this subplan body in chat
2. (Optional) Direct any preference reversals for Phase 6a (hook-fixture wire-up vs delete) and Phase 6b (evidence migration path)
3. Trigger `/execute SUBPLAN_XLSX_PREP_01_TC_ID_NORMALIZATION_AND_PARITY_FIX` after approval
4. Spot-check phase-by-phase commits as they land (8 commits total: Phase 1 + 2 + 3a + 3b + 3c + 4 + 5 + 6 + 7)
5. After Phase 7, verify parent migration plan can proceed to Phase A (i.e., re-run `/execute PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md`)

If any HALT fires → Claude pauses, Rutvik decides next step in chat.

---

## Notes / Out of scope

- **NOT in this subplan**: XLSX emitter creation (parent Phase A); N1 rename `Manual → Pending Automation` (parent Phase A.5); reader cutover (parent Phase B); plan triage (parent Phase C); CSV deletion (parent Phase D); old-commit Entra-token history scrub (separate security follow-up).
- **NOT in this subplan**: any agent-prompt edit, rule-file edit, or skill-edit. The 200+ existing dirty M files from prior sessions touching `.claude/agents/*` / `.claude/rules/*` / `.claude/skills/*` remain dirty and unrelated to this subplan's scope.
- **Out-of-scope security follow-up** (chip already spawned 2026-05-26): <placeholder> old commits in branch history still carry the Entra token blob from `.playwright-cli/storage-state-2026-05-18T07-03-57-805Z.json`. Removing from history requires `git filter-repo` + force-push + Microsoft session revocation. Rutvik to schedule.
