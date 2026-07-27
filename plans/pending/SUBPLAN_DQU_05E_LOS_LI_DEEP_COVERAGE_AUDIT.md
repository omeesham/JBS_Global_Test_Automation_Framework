# SUBPLAN: LOS + LI Deep Coverage Retro-Audit (baseline-first + ISTQB depth-grid)

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-29
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-03 (LOS fixes DONE), SP-DQU-05 (LI fixes DONE), LR-045 row 4 amendment (DONE 2026-04-29)
**Blocks**: HIST column-first pivot — any HIST subplan touching LOS or LI specs (SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS, SUBPLAN_HIST_PIVOT_24/25 LI tests, etc.)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: both
**BrowserToolJustification**: Chrome for nav2 baseline walk (auth-heavy, exploration, user at machine per LR-038 v2). CLI for e2e depth-grid TC verification (catalog walkthrough, grep-over-disk discipline). Mid-subplan switch logged per `[BROWSER-SWITCH]` protocol.

---

## Provenance

User feedback 2026-04-29: "we need enough test cases that cover our ass for these 2 modules such that when we do hist later, we have full in depth coverage for these 2 modules of local office and locations... no new issues from anyone that we have missed test cases".

The 11 LOS + 11 LI colleague flags were addressed (SP-DQU-03/05) but two structural gaps remain:

1. **No baseline diff** — SP-DQU-02 (LOS audit, 2026-04-22) ran 2 days before LR-ENC-001 was graduated; SP-DQU-04 (LI audit, 2026-04-27) accidentally used baseline (caught BUG-LI-001) but did not produce a per-module baseline artifact. Neither module has `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`.
2. **No depth-grid coverage** — TCs were authored against observed behavior but not systematically against ISTQB-standard required-TC lists (BVA + equivalence partitioning + cross-field + error-guessing). Coverage gaps exist per type (e.g., date offsets have no max-boundary or float-input TCs; phone fields have no international-format or paste-behavior TCs).

HIST pivot will build column-first specs on top of these TCs. Gaps now → gaps in HIST → client review round 2.

## Bootstrap

- **Invoke with**: `/execute SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md`
- **Identity**: WATCHDOG (Phase 1+2) → HEALER (Phase 3+4)
- **Skills auto-called**: `/identity`, `/find-bugs` (Phase 1+2), `/bugfix` + `/regression-guard` (Phase 3+4), `/final-q` (close)
- **Context files**:
  - `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md` (depth-grid rubric — D12)
  - `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` (60 BAS TCs) + `local_office_history_test_cases.md` (7 HIS) + `local_office_ect_test_cases.md` (18 ECT) — split into 3 sibling files on 2026-05-05; 85 TCs total
  - `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` (77 TCs)
  - `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (access-verify oracle)
  - `clients/encore/CLAUDE.md` (LR-ENC-001), `.claude/rules/baseline.md` (LR-045)
  - `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md` (existing artifact, ≤14d fresh on first run; refresh if stale at execute time)
  - `reports/bugs/BUG-LOS-*.json` + `reports/bugs/BUG-LI-*.json` (existing 7 bugs — verificationLog updates per LR-044)

## Phase 0 — Dependency + browser-tool gate

1. Confirm `Status: DONE` on SP-DQU-03, SP-DQU-05.
2. Grep `.claude/rules/baseline.md` for "Audit / Neutral-eye" — confirms LR-045 row 4 is in place.
3. Announce browser tool: `Browser tool: Both. Chrome for nav2 baseline walk; CLI for e2e depth-grid verification. BrowserToolJustification: pilot module retro-audit per D11.`
4. **HALT** if any dependency gate fails.

## Phase 1 — WATCHDOG: nav2 baseline walks for LOS-BAS + LI

For each module, in Chrome Claude (LR-038 v2 row "auth-heavy + exploration"):

### Module 1: Local Office Settings — Basic Information tab

1. `navigate` to `https://navigator2.training.psav.com/#/setup/locationdetail/1604`.
2. Locate Basic Information equivalent — old site has ONE URL with embedded tabs per LR-ENC-001.
3. `read_page` — capture all tab names, headings.
4. `javascript_tool` — enumerate every input/select/textarea/button via `name=` / `id=` attributes (zero `data-testid` per OSB-ACCESS-VERIFY §2). Log: name, id, default, validation behavior, conditional dependencies.
5. Walk every interactive field on the equivalent of LOS BAS:
   - Date Offsets (Prep, Return, Set, Strike, Delivery, Pickup) — defaults, validation, NM-1264 cross-field.
   - Phone 1, Phone 2 — validation, format, required-vs-optional.
   - Misc Settings checkboxes — default state, cascade (Use Fulfillment → Use Equipments QC).
   - Default Order Type dropdown — option count, default selection.
   - PO Number, PO Number Label — text, save behavior.
   - Section Configuration — section list, active checkmarks, edit behavior.
   - Default Logo — checkbox states, Company Logo dropdown.
   - Discount Exemptions — toggle behavior.
   - Save dialog — exact text + button labels.
   - Unsaved Changes dialog — exact text + Stay/Discard.
6. Emit `clients/encore/specs_planning/_internal/old-site-baseline/local-office-settings-2026-04-29.md` per LR-045 free-form format. Frontmatter: `baselineScope: baseline-partial` (BAS covered; ECT + History tabs are baseline-absent per LR-ENC-001).

### Module 2: Local Information

1. Same Chrome session — switch to Local Information equivalent tab.
2. Walk every field per `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` field inventory header (54 total: 8 inputs + 41 checkboxes + 2 comboboxes + 2 radios + 1 button).
3. Priority focus: Oracle Product/Dept/Org dependency, SkipBilling cascade, BillingCycle, EnableIDCBilling, DisplayTax auto-set, Threshold dual-dependency, Service Charge children (BUG-LI-002), Allow C&C/ETS/Resort Tax % reset.
4. Emit `clients/encore/specs_planning/_internal/old-site-baseline/local-information-2026-04-29.md`. Frontmatter: `baselineScope: full` (LI is on baseline).

### Baseline diff classification (both modules)

For each field on each module, classify e2e behavior vs baseline as:
- **regression-from-baseline** — old site behaves correctly, new site has degraded behavior. File BUG-*.json per LR-034 with `baselineComparison: regression-from-baseline`.
- **intentional-UX-change** — divergence is documented in REQUIREMENTS.md / Jira / NM-* ticket. Cross-link.
- **baseline-absent** — feature net-new on e2e (ECT, Local Office Settings as separate URL). Record `baselineScope: baseline-absent` per row.

**HALT gate**: if regression-from-baseline count > 5 → STOP, escalate to user before Phase 2.

## Phase 2 — WATCHDOG: depth-grid coverage matrix

Switch browser tool: `[BROWSER-SWITCH] from=chrome to=cli reason=catalog-walkthrough-grep-over-disk artifact=field-inventories/<module>-2026-04-29.md`.

For each module's field inventory × required-TC grid (per `_TEMPLATE.md` §Coverage depth grid):

1. Build a coverage matrix table — one row per `field × required-TC`. Columns: `Field name`, `Field type`, `Required TC`, `Existing TC ID (or GAP)`, `Status` (COVERED / GAP / N-A — with justification).
2. For every COVERED row, cite the existing TC ID (e.g., `TC-LOS-BAS-002`).
3. For every GAP row, draft a 1-line proposed TC title (will be authored in Phase 3).
4. For every N-A row, justify (e.g., "field is read-only display only, no validation TCs apply").
5. Emit `clients/encore/specs_planning/_internal/coverage-audits/los-li-depth-coverage-2026-04-29.md` with sections:
   - `## LOS coverage matrix` (table)
   - `## LI coverage matrix` (table)
   - `## GAP list` (every uncovered field × required-TC, ranked by field criticality)
   - `## N-A list` (with justifications)
   - `## Baseline diff summary` (rolling up Phase 1 findings)

**HALT gate**: GAP count > 50 → STOP, escalate to user before Phase 3 with summary breakdown by field type.

## Phase 3 — HEALER: gap-fill TCs + bug filings

Switch identity: `/identity HEALER`.

1. For every GAP from Phase 2 coverage matrix:
   - Author a new TC in the appropriate MD file with all required metadata (Priority | Status | Type | Tags | MCP_VERIFICATION_LOG citation).
   - TC title plain English per Rule 3; no symbols (Rule 1); no bold UI labels (Rule 2); no bug-descriptor language (Rule 4); Tags column populated (Rule 5).
   - Each new TC gets a fresh-or-spot-checked field-inventory citation per LR-013.

2. For every regression-from-baseline from Phase 1:
   - File `BUG-LOS-*.json` or `BUG-LI-*.json` per LR-034 schema with mandatory `baselineComparison: regression-from-baseline` field.
   - Add `Status: Blocked by BUG-*` metadata to affected TCs.
   - Rewrite affected TCs against documented expected behavior (Rule 4).

3. For every intentional-UX-change:
   - Update `clients/encore/CLAUDE.md (was REQUIREMENTS.md, removed 2026-05-19 per unified-matsumoto plan)` with the change rationale + cross-link to NM-* / Jira if available.
   - HUNTER identity required for REQUIREMENTS.md edits per R11 — switch identity if needed.

4. Rebuild the XLSX deliverable: `npm run xlsx:build` — re-parses every edited MD (LOS settings/history/ect siblings post-2026-05-05 split + LI) through the in-memory parity oracle into the single `clients/encore/testcases/encore_test_cases.xlsx` workbook (one sheet per module). The per-module CSV re-export was retired in PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase D.

5. Run Phase 0 greps (4 from `tc-authoring-rules.md`) on both edited MDs. Zero hits required on edited TCs.

## Phase 4 — Verification + closure

1. **Re-run depth-grid matrix** — every field × required-TC = COVERED or N-A. ZERO remaining GAPs (LR-046 strict-line gate; APPEND-and-close forbidden).
2. **`/regression-guard` snapshot** before Phase 1 + after Phase 3. Diff = no silent breakage; all changes intentional.
3. **Update field-inventory headers** in both MDs with new TC counts.
4. **Activity-log row** per LR-037 wall-clock.
5. **Parent-cascade gate (LR-027 amended)** — grep `plans/pending/` for `SUBPLAN_*.md` with `**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md`. If zero → close parent PLAN. Otherwise → leave open.

## Acceptance criteria (LR-040 closure gate — every item classified (a)/(b)/(c))

- [ ] 2 baseline artifacts emitted: `old-site-baseline/local-office-settings-2026-04-29.md` (`baselineScope: baseline-partial`) + `old-site-baseline/local-information-2026-04-29.md` (`baselineScope: full`).
- [ ] Coverage audit doc emitted at `_internal/coverage-audits/los-li-depth-coverage-2026-04-29.md` with all 4 mandatory sections.
- [ ] Every GAP from Phase 2 → either new TC authored (path a) OR documented N-A with explicit justification (path c).
- [ ] Every `regression-from-baseline` from Phase 1 → BUG-*.json filed with `baselineComparison: regression-from-baseline` (path a) OR user-flagged discussion-item per `feedback_discussion_item_not_bug.md` (path c).
- [ ] Every `intentional-UX-change` → REQUIREMENTS.md updated under HUNTER identity (path a).
- [ ] Both CSVs re-exported with new TC counts visible. Phase 0 greps return zero hits on edited TCs.
- [ ] `/regression-guard` before/after diff = no silent breakage.
- [ ] Activity-log row appended.
- [ ] LR-046 strict-line gate: ZERO remaining GAPs after Phase 4 (no APPEND-and-close to a future subplan).

## Handoff to next subplan / phase

Next: HIST column-first pivot can resume on LOS + LI specs. Chat summary:
- GAP count (Phase 2) + filled count (Phase 3).
- New BUG-*.json count (regression-from-baseline).
- New TC count per module.
- Baseline artifact paths.
- Any escalations.

No obstacle claims per LR-039. Handoffs in chat only per `feedback_handoff_in_chat_only.md`.
