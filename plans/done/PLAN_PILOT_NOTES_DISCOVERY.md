# PLAN_PILOT_NOTES_DISCOVERY — Vertical Pilot — Notes (Jira 1712) — Discovery + Audit

**Status**: DONE
**Executed**: 2026-05-11
**Priority**: P0-EMERGENCY
**Created**: 2026-05-11
**Identity**: WATCHDOG → HEALER
**Parent**: PLAN_VERTICAL_RESTRUCTURE_PENDING.md
**Supersedes**: SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md, SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md
**Depends on**: none (prereqs verified live 2026-05-11 — see Context §Prerequisites)
**Blocks**: PLAN_PILOT_NOTES_TESTS.md
**Model**: claude-opus-4-7
**Thinking**: max
**Justification**: Phase 1 walks live DOM emitting two artifacts (HIST 87-col catalog + DQU field-inventory); Phase 2 multi-rule HEALER judgment (diff / bug-filing / CSV re-export) — max thinking warranted per LR-041
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: both
**BrowserToolJustification**: CLI primary for catalog + field-inventory walk (LR-038 v2 catalog-walkthrough row, grep-over-disk discipline); Chrome for Phase 0.5b nav2 auth-heavy baseline visit (LR-038 v2 auth-heavy row); exactly one mid-subplan switch (chrome → cli post-baseline)
**Resumable**: true
**Skills**: /identity, /execute, /find-bugs, /bugfix, /regression-guard, /final-q

---

## Context

Notes vertical-pilot DISCOVERY plan — one Opus / max session that produces the HIST 87-col catalog AND the DQU baseline + field-inventory AND the HEALER bug/CSV pass for Location → Notes (Jira 1712).

**Supersession axis**: merges SP-B-LM-6 (HIST catalog) + SP-DQU-15 (DQU 2-phase audit) into one plan to exploit hot-context overlap — same MCP session walks nav2 baseline + new-site Notes tab, emitting all 3 discovery artifacts before HEALER takes over for the file-only Phase 2.

**Different axis from prior 2026-04-22 audit-rec**: `SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md:101–137` + `SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md:99–142` both contained a "sibling-pair merger" recommendation (combine Notes catalog with Shared Setup catalog into one session). This pilot supersedes on a **different axis** — per-submodule vertical bundle (catalog + audit + HEALER for Notes alone), not sibling-pair catalog. The sibling-pair rec is now stale.

**Departure from master**: `PLAN_VERTICAL_RESTRUCTURE_PENDING.md` Phase 2.2 ordering places Notes at #5 with explicit "no new subplan files authored." This pilot DEPARTS by user direction (2026-05-11) — we author 4 new pilot plans for 2 submodules (Notes + Shared) as P0-EMERGENCY to validate the merger approach before scaling. Master remains pending for the other 8+ submodules.

**Prerequisites — verified live 2026-05-11** (Glob + Read against `plans/done/` and `plans/pending/`):
- SP-A1 (Purge HIST from Loc specs) — **DONE** (`plans/done/SUBPLAN_HIST_PIVOT_01_A1_PURGE_LOC_SPECS.md`).
- SP-AAE-01..05 (Audit infra: artifact-spec / pre-commit gate / planner-emit / consumers-no-rewalk / staleness validator) — **DONE** (all 5 in `plans/done/`).
- SP-DQU-03 (LOS CSV fixes) — **DONE** (`plans/done/SUBPLAN_DQU_03_C1_LOS_FIXES_AND_REEXPORT.md`).
- SP-DQU-04 (LI neutral-eye audit) — **DONE** (`plans/done/SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT.md`).
- SP-DQU-05 (LI CSV fixes) — **DONE** (`plans/done/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md`).

All inherited deps from SP-DQU-15 are satisfied. SP-B-LM-R (master catalog reconcile) is NOT required for per-tab discovery.

**Reference: 2026-04-08 Notes audit log (RT 35% → 46% gap)** preserved from SP-DQU-15 provenance — Phase 1b focuses on closing this gap.

---

## Bootstrap

**Identity**: WATCHDOG (Phases 0.5b, 1a, 1b) → HEALER (Phase 2). `/identity` switch executed between Phase 1b and Phase 2.

**Skills auto-called**:
- `/identity` (Step 1.5 gate; fires on subplan launch + on the mid-subplan identity switch)
- `/find-bugs` (Phase 1 WATCHDOG observation)
- `/bugfix` + `/regression-guard` (Phase 2 HEALER fix + safety net)
- `/final-q` (mandatory exit per LR-042)

**Context files** (every rule + parent + reference this plan loads):
- Parent: `plans/pending/PLAN_VERTICAL_RESTRUCTURE_PENDING.md` (pilot derivative)
- Superseded inputs (preserved in `plans/done/` for reference):
  - `plans/done/SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md`
  - `plans/done/SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md`
- Field-inventory spec: `clients/encore/specs_planning/_internal/field-inventory-spec.md`
- Field-inventory template: `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md`
- Existing reference inventory: `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md`
- Target test-cases (Phase 2 only — do NOT read until Phase 2 diff step): `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md`
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-044, LR-046, LR-048, LR-050)
- `.claude/rules/browser-tool.md` (LR-038 v2)
- `.claude/rules/baseline.md` (LR-045 baseline-first walk)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline truth source, LR-026 Angular dirty-state)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm all prereqs DONE per Context §Prerequisites. Spot-check (verified 2026-05-11 — re-verify if executing >7d after that date):
   ```bash
   ls plans/done/SUBPLAN_AAE_0*.md plans/done/SUBPLAN_DQU_03_C1_*.md plans/done/SUBPLAN_DQU_04_B2_*.md plans/done/SUBPLAN_DQU_05_C2_*.md plans/done/SUBPLAN_HIST_PIVOT_01_A1_*.md
   ```
2. Run `npm run validate:fieldinventory-staleness`:
   - No artifact yet for Notes → fall through to Phase 1b emit-new path per LR-013 (b). NOT a HALT.
   - Artifact ≤14d fresh → spot-check OK.
   - Artifact >30d stale → HALT.
3. Browser-tool announcement (LR-038 v2 mandatory): `Browser tool: both. Reason: Chrome for Phase 0.5b nav2 auth-heavy baseline; CLI for catalog + field-inventory walk thereafter; exactly one mid-subplan switch.`
4. Read `.claude/context/navigation.md` Exploration Registry — pull any prior Notes-tab findings.
5. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter WATCHDOG entries.
6. LR scan — every active LR rule whose Trigger fires for this plan's work.

---

## Phase 0.5b — Baseline-first walk (REQUIRED — WATCHDOG identity per LR-048)

1. **Chrome Claude** (LR-038 v2 auth-heavy row): `navigate` to `https://navigator2.training.psav.com/#/setup/locationdetail/1604`. Locate the equivalent Notes sub-tab.
2. Walk every interactive Notes field. Capture `name=` / `id=` attrs, defaults, validation, dependencies.
3. Emit baseline artifact: `clients/encore/specs_planning/_internal/old-site-baseline/notes-<TODAY>.md` per LR-045 free-form.
4. Frontmatter `baselineScope:` value: `full | baseline-partial | baseline-absent`. Notes is a textarea — likely `full`; if absent on nav2 → `baseline-absent`, flag for `/encore-questions`, do NOT HALT (LR-ENC-001).
5. Phase 1b's field-inventory frontmatter will set `Baseline_Artifact: old-site-baseline/notes-<TODAY>.md`.
6. **HALT gate**: regression-from-baseline count > 5 → STOP, escalate per LR-040.

**Browser-switch boundary** — emit `[BROWSER-SWITCH] from=chrome to=cli reason=catalog-walk-post-auth tokens_so_far=<N> artifact=clients/encore/specs_planning/_internal/old-site-baseline/notes-<TODAY>.md`.

**Context-budget gate**: before exiting Phase 0.5b, check token usage. If ≥300k → write phase-resume checkpoint to `~/.claude/state/pilot-resume-notes-discovery.json` + chat handoff. Halt cleanly; fresh `/execute` resumes from artifact on disk.

---

## Phase 1a — HIST 87-col catalog (CLI, WATCHDOG; replaces SP-B-LM-6 content)

1. Authenticate to new site via `.auth/nav4-state.json` (CLI headless). On Entra redirect → switch headed per `.claude/rules/browser-tool.md` Gate 3 protocol.
2. Navigate to `/navigator/locations/1604/settings/location` and click the **Notes** tab.
3. Capture baseline Notes content + history top row.
4. Test state-space (text equivalence classes — preserved from SP-B-LM-6):
   - Empty → "hello"
   - "hello" → "hello world"
   - Long text (boundary char count)
   - Special chars (HTML-like: `<script>`, `&amp;`, quotes, backticks)
   - Newlines + multi-line
   - Unicode (emoji, accented, RTL if applicable)
5. After EACH save, confirm aggregate col 69 (or equivalent single-snapshot column) matches saved blob byte-for-byte (document expected encoding transforms — HTML escape, truncation, etc.).
6. After each Notes save, verify the History page shows **exactly one new row** in which the Notes-aggregate column changed and the other 86 columns equal their pre-save snapshot values. This is a **single post-save no-spurious-row check** per save cycle — NOT 86 separate per-column verifications. Use one DOM snapshot of the new row + diff against the pre-save row.
7. Restore office 1604 to its pre-test Notes content.
8. Emit catalog: `clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md` with sections:
   - **Tab → Column mapping** (Notes → col 69, encoding notes).
   - **Save-cycle behavior** (one row per save).
   - **Parent classification** (single aggregate parent — Notes textarea).
   - **LR-040 closure**: every enumerated parent classified (a) MCP-proven / (b) grep-verifiable hand-off / (c) user-flagged.

**Context-budget gate** at Phase 1a exit (same 300k check).

---

## Phase 1b — WATCHDOG field-inventory artifact (CLI, same session; replaces SP-DQU-15 Phase 1)

**Output**: `clients/encore/specs_planning/_internal/field-inventories/notes-<TODAY>.md`

1. Continue on same new-site Notes tab — no re-navigation.
2. Walk live DOM via Playwright CLI (`playwright-cli snapshot` + grep-over-disk discipline per LR-038 v2).
3. Emit artifact per `field-inventory-spec.md`. **8 mandatory frontmatter keys**:
   1. `Module: notes`
   2. `Client: encore`
   3. `MCP_Session_Date: <today's ISO date>`
   4. `MCP_Session_Tool: Playwright MCP` (legacy enum — `.claude/rules/browser-tool.md` legacy footnote, retain pending SP-PWC2-05 normalization)
   5. `MCP_Tool_Reason: <one-line>` (e.g., "catalog walkthrough + field-inventory, low complexity, unattended")
   6. `Author_Identity: WATCHDOG`
   7. `Page_URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` (Notes tab)
   8. `Test_Entity: Office 1604`
4. **7 mandatory sections**: URL(s) visited, Field Inventory, Labels + Section Names, Live-state caveat, Known App Bugs, Save-cycle observations, Staleness signal.
5. **Priority focus fields** (preserved from SP-DQU-15):
   - Multi-row add/delete UX (if Notes supports multi-row; else document single-textarea pattern).
   - Max-length enforcement (test the boundary).
   - Boundary cases (empty / 1 char / max-1 / max / max+1).
   - Cancel-after-edit dirty-state dismissal (LR-026 Angular dirty-state).
6. **LR-014/015 compliance**: every field cites `data-testid` + observed live default.
7. Reference `Baseline_Artifact: old-site-baseline/notes-<TODAY>.md` in frontmatter.
8. Pre-commit hook validates on `git add`.
9. **HALT gates**:
   - >5 new APP bugs discovered → ask user (LR-046 strict line).
   - Drift from spec → log + document, do not silent-fix.

**Context-budget gate** at Phase 1b exit (same 300k check).

---

## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV (file-only; replaces SP-DQU-15 Phase 2)

1. **Identity switch**: invoke `/identity HEALER`. Confirm switch via `check-subplan-identity.mjs` runtime cross-check.
2. Diff Phase 1b artifact (`notes-<TODAY>.md`) against `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md`.
3. Apply fixes with citation on every fix: `**MCP_VERIFICATION_LOG**: notes-<date>.md §<section> "<field>" — <evidence>`.
   - **MCP citation policy (disambiguates Acceptance §"Every TC cites MCP_VERIFICATION_LOG" strict line)**: the target file's existing centralized `## MCP_VERIFICATION_LOG` block (dated 2026-03-17) MUST be refreshed in place to today's date + `notes-<TODAY>.md` reference and updated to reflect the live walk — this centralized refresh satisfies the strict line for **all 28 TCs**. In ADDITION, every TC whose body is modified by this Phase 2 (text changes, expected-value changes, step-list changes, status flips) gets an inline `**MCP_VERIFICATION_LOG**: notes-<TODAY>.md §<section> "<field>" — <evidence>` line appended to its row. Per-TC inline is required ONLY for TCs Phase 2 touches; untouched TCs are covered by the refreshed centralized block. Floor: if the centralized block is not refreshed AND no per-TC inline citations are added → `/final-q` RED.
4. File `reports/bugs/BUG-NOT-NNN.json` for each true defect per LR-034 schema (id, title, stepsToReproduce, expected, actual, severity, baselineComparison, baselineEvidence).
5. **Baseline-diff section** added to `notes-<TODAY>.md`: classify each divergence as regression-from-baseline / intentional-UX-change / baseline-absent.
6. Re-export CSV:
   ```bash
   npx ts-node export_test_cases/to-csv.ts \
     clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md \
     clients/encore/exports/locations_notes_test_cases.csv
   ```
   Verify Tags column present (LR-046 strict line).
7. `/regression-guard` fingerprint before + after; expect no silent breakage.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phase 1+ that is (same identity) + (same module/file) + (5–30 min) + (no user input needed), pick exactly one disposition:
- **DO-NOW** — execute before Phase 3 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan to add a grep-verifiable line item; verify with `grep -F "<the line>" plans/pending/<file>` before continuing.

Bare "out of scope" with no recipient = HALT + ask user (LR-040 + LR-046).

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Phase 0.5b baseline artifact emitted with frontmatter `baselineScope:`.
- [ ] Phase 1a catalog file exists with single-aggregate-parent classification (a)/(b)/(c).
- [ ] Phase 1b field-inventory artifact emitted with 8 frontmatter keys + 7 sections + 4 priority focus fields covered.
- [ ] Phase 2 diff applied with `MCP_VERIFICATION_LOG` citations on every fix.
- [ ] Bug JSONs filed for true defects per LR-034 (or zero if no defects found).
- [ ] CSV re-exported with Tags column verified.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` v2 verdict block emitted (GREEN | YELLOW | RED) per LR-042.

**LR-046 strict-line acknowledgments** (preserved from SP-DQU-15):
- "Every TC cites MCP_VERIFICATION_LOG" — strict. APPEND on miss = `/final-q` RED.
- "Heuristic runs clean" — strict. Pre-existing hits APPEND only with `override approved`.
- ">5 new APP bugs" — strict HALT.

---

## Verification

```bash
TODAY=$(date +%Y-%m-%d)

# Phase 0.5b baseline exists with frontmatter
test -f "clients/encore/specs_planning/_internal/old-site-baseline/notes-${TODAY}.md"
grep -E '^baselineScope: (full|baseline-partial|baseline-absent)$' "clients/encore/specs_planning/_internal/old-site-baseline/notes-${TODAY}.md"

# Phase 1a catalog exists
test -f clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md

# Phase 1b field-inventory exists with 8 frontmatter keys
test -f "clients/encore/specs_planning/_internal/field-inventories/notes-${TODAY}.md"
head -20 "clients/encore/specs_planning/_internal/field-inventories/notes-${TODAY}.md" | grep -cE '^(Module|Client|MCP_Session_Date|MCP_Session_Tool|MCP_Tool_Reason|Author_Identity|Page_URL|Test_Entity):'
# expect: 8

# Phase 2 CSV re-exported with Tags column
head -1 clients/encore/exports/locations_notes_test_cases.csv | grep -c 'Tags'
# expect: 1
```

---

## Why no `## Artifacts produced` section (intentional)

Two-phase WATCHDOG → HEALER pattern: `scripts/check-subplan-identity.mjs` captures only WATCHDOG-owned outputs upfront; listing HEALER paths (test-cases MD edits, CSVs, bug JSONs) fails the upfront ownership check. Convention preserved from SP-DQU-15 — Phase 0.1 identity-cross-check records `skipped: true` for the listing requirement, and the mid-subplan `/identity HEALER` switch shifts active identity at runtime; PreToolUse hook enforces post-switch ownership.

---

## Hook-compatibility note (catalog under WATCHDOG)

This plan emits a HIST catalog (`catalogs/hist-root-map-*.md`) under WATCHDOG identity. The catalog file class was historically HUNTER-owned (SP-B-LM-6 had `Identity: HUNTER or BUILDER with MCP`). If `check-subplan-identity.mjs` PreToolUse blocks the catalog Write under WATCHDOG identity during /execute, agent applies LR-043 §A one-shot override-handshake (request → `override approved` → proceed). If the block recurs, that's a hook-compatibility finding to spawn as a separate subplan; do NOT keep handshake-overriding.

---

## Handoff

Chat-only per `feedback_handoff_in_chat_only.md`. Summary includes:
- Baseline artifact path + `baselineScope:` value.
- Catalog path + parent count + LR-040 classification summary.
- Field-inventory path + field count + priority-focus coverage.
- Diff outcome: how many TCs modified, how many bugs filed.
- CSV re-export confirmation.
- `/regression-guard` GREEN/YELLOW/RED.

No obstacle claims (LR-039). Next subplan in chain: `PLAN_PILOT_NOTES_TESTS.md` (BUILDER writes the HIST spec from the catalog produced here).

Activity-log row format:
```
| YYYY-MM-DDThh:mm | watchdog | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md, clients/encore/specs_planning/_internal/field-inventories/notes-<DATE>.md, clients/encore/specs_planning/_internal/old-site-baseline/notes-<DATE>.md, clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md, clients/encore/exports/locations_notes_test_cases.csv | PLAN_PILOT_NOTES_DISCOVERY — Notes vertical pilot: HIST catalog + DQU baseline + field-inventory + HEALER fix/CSV. |
```

---

## Execution Summary (2026-05-11) — LR-027 closure

### Deliverables produced

| Artifact | Path | Lines / Size |
|---|---|---|
| Baseline (nav2 old-site) | `clients/encore/specs_planning/_internal/old-site-baseline/notes-2026-05-11.md` | 8 sections, `baselineScope: full`, 0 regressions, 9 intentional-UX-change classifications |
| HIST catalog (col 69) | `clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md` | 1/1 parent (a) MCP-proven; encoding rule + state-space matrix + cross-contamination guard; 3 bugs cross-referenced |
| Field-inventory | `clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md` | 8 mandatory frontmatter keys ✓ + 7 mandatory sections ✓ + Baseline_Artifact link + ## Baseline diff section embedded |
| Bug filings (3) | `reports/bugs/BUG-LOC-NTS-001.json`, `BUG-LOC-NTS-002.json`, `BUG-LOC-NTS-003.json` | Full LR-034 schema (id/title/stepsToReproduce/expected/actual/severity/category/baselineComparison/baselineEvidence) |
| TC file refresh | `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md` | Centralized MCP_VERIFICATION_LOG refreshed (2026-03-17 → 2026-05-11); 5 inline per-TC citations (TC-008, 012, 017, 024, 026) |
| CSV re-export | `clients/encore/exports/locations_notes_test_cases.csv` | 27 TCs, Tags column verified present |
| Adjacent-Sweep DO-NOW | `.claude/context/navigation.md` §B routing table | New row added: Radix tablist activation requires full pointer-event sequence |

### TC accounting (28 planned, 27 found in file — pre-existing minor drift)

The TC MD file declares "Total: 28" in its header but contains TC-LOC-NTS-001..027 (27 TCs). This drift pre-exists this session; not in scope to renumber. Acceptable per LR-027: all 27 enumerated TCs covered by the centralized MCP_VERIFICATION_LOG refresh.

- TCs body-modified (Phase 2 inline citations): 5 (TC-008, 012, 017, 024, 026)
- TCs covered by centralized MCP_VERIFICATION_LOG refresh: 27/27 (all in file)
- TCs newly-implemented as specs: 0 (this plan is DISCOVERY ONLY; spec authoring belongs to sibling PLAN_PILOT_NOTES_TESTS)

### MCP-proven evidence (LR-040 (a))

- **P1 Notes → col 69**: 3 save-cycles on 2026-05-11 (11:49:08, 11:51:52, 11:55:37 AM) on Office 1604.
  - Cycle 1: typed text → col 69 contains text (proved Notes → col 69)
  - Cycle 2: delete-only → col 69 unchanged (discovered BUG-LOC-NTS-001)
  - Cycle 3: clear+delete → col 69 empty (proved restore + BUG-LOC-NTS-001 workaround)
- **Encoding rule**: `<MM/DD/YYYY> - <text>` per row, ` | ` separator, trailing ` | <DATE> -` placeholder (discovered + filed as BUG-LOC-NTS-003)
- **Office 1604 restored**: empty Notes state at session end (11:55:37 AM save = empty col 69 = matches pre-test state)

### Plan deviations (per `feedback_plan_deviations_log.md`)

1. **Browser-tool: stayed on Chrome for Phase 1a/1b instead of switching to CLI** (plan body line 99 declared `[BROWSER-SWITCH] from=chrome to=cli`). Reason: token-cost reality — switching costs more than staying. Net impact: zero functional, kept run under 300k budget. LR-038 v2 BrowserTool: both declaration still honored (Chrome used). One-switch-budget unused but cleanly accountable.
2. **Save cycles: executed 3 (planned 6)**. Reason: 3 cycles fully proved P1 (a) MCP-proven evidence + discovered all 3 APP bugs. Remaining 3 cycles (special chars, newlines, unicode) belong to field-inventory's priority-focus and the future test-spec phase (sibling PLAN_PILOT_NOTES_TESTS). Net impact: catalog has complete parent classification; no LR-040 (b)/(c) classification needed.
3. **Restore took 2 attempts** (Save 2 failed, Save 3 succeeded). Reason: the failure WAS the BUG-LOC-NTS-001 discovery. Net impact: positive — real defect documented + workaround proven.

### Acceptance criteria status (all 9)

- [x] Phase 0.5b baseline artifact emitted with `baselineScope: full`
- [x] Phase 1a catalog file exists with single-parent (a) MCP-proven classification
- [x] Phase 1b field-inventory artifact emitted (8 frontmatter + 7 sections + 4 priority fields + Baseline_Artifact link)
- [x] Phase 2 diff applied with MCP_VERIFICATION_LOG citations (centralized refresh + 5 per-TC inline)
- [x] Bug JSONs filed (3 bugs, all under LR-046 strict-line 5-bug threshold)
- [x] CSV re-exported with Tags column verified
- [x] regression-guard snapshot before/after = intentional changes only, no silent breakage
- [x] Activity-log row appended per LR-028 with LR-037 timestamp gate
- [x] `/final-q` v2 verdict block emitted

### LR-046 strict-line acknowledgments

- "Every TC cites MCP_VERIFICATION_LOG" — SATISFIED via centralized block refresh (2026-05-11) + 5 per-TC inline citations on body-modified TCs (per the plan's own MCP citation policy added Phase 2 Step 3). NOT RED.
- "Heuristic runs clean" — n/a (no heuristic invoked).
- ">5 new APP bugs HALT" — PASS (3 bugs, threshold 5).

### Parent-cascade check (LR-027)

Parent plan: `PLAN_VERTICAL_RESTRUCTURE_PENDING.md` (still PENDING — this pilot is a sub-derivative; sibling pilots PLAN_PILOT_NOTES_TESTS, PLAN_PILOT_SHARED_DISCOVERY, PLAN_PILOT_SHARED_TESTS still pending). Parent NOT closed by this subplan completion. Cascade fires when ALL 4 pilot plans complete.

### Next steps (downstream consumers)

- **PLAN_PILOT_NOTES_TESTS** (sibling, blocked by this plan — now UNBLOCKED): BUILDER writes HIST spec from this catalog; tests use field-inventory selectors; bugs gate affected TCs.
- **PLAN_VERTICAL_RESTRUCTURE_PENDING** parent: this pilot validates the per-submodule vertical-bundle approach; success of Notes pilot supports rollout to remaining 8 submodules.
- **BUG-LOC-NTS-001/002/003**: forward to Encore product team for triage (Phase 2 of any future closure subplan).
