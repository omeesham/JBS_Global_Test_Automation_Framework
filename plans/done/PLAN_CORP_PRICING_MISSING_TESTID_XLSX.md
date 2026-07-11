# PLAN: Corporate Pricing — Missing-`data-testid` Report (Jira-ready xlsx) + Stale-Skip Confirmation

**Status**: DONE
**Executed**: 2026-07-10
**Priority**: P1
**Created**: 2026-07-10
**Identity**: OWNER (internal report compilation — no pipeline artifacts touched)
**Depends on**: None (source reports already exist and are live-verified)
**Model**: claude-opus-4-8 · **Thinking**: xhi · **PermissionMode**: acceptEdits
**BrowserTool**: none (compilation from already live-verified artifacts — no new DOM claims)
**Skills**: /execute, /regression-guard, /final-q

> **Provenance**: User request 2026-07-10 — confirm where the Corporate Pricing missing-testid data lives, then produce a Jira-ready report in the exact format previously approved by Encore for the Locations and Local Office modules (`LOCATION_MISSING_TESTID_REPORT.xlsx` / `LOCAL_OFFICE_MISSING_TESTID_REPORT.xlsx`, verified by reading the real files in `C:\Users\rutvi\Downloads`). Approved in Plan Mode this session (scratch draft materialized here per the save-plan-location preference).

---

## Context

1. **Flag 1 (where does the data live?)** — the missing-testid hunt for Corporate Pricing is already done, twice, both at `clients/encore/specs_planning/_internal/`: `testid-gap-report-2026-07-06.md` (v2, live-DOM verified per LR-029) and `corporate-pricing-missing-testids-report.md` (2026-06-05 + 2026-06-08 addendum). Correctly classified as an **enhancement ask, not a defect** (LR-034 excludes missing-testid gaps from bug filing). Nothing has been sent to Encore yet.
2. **Flag 2 (stale skips?)** — confirm no corp-pricing test is still *skipped* (instead of running on a fallback locator) because of a missing testid under the old pre-2026-07-06 policy. A dedicated grep sweep this session found **zero** qualifying instances; the module's two skips (`TC-CPR-TIO-024` — data-fixture gap; `TC-CPR-OVR-023` — blocked on app bug BUG-CPR-OVR-001) are unrelated to testids. If a real candidate ever turns up: un-skip, run original logic first (LR-021), pick the best-available locator, run green, log the gap — never leave coverage dark.
3. **Deliverable**: one Jira-ready xlsx, Corporate Pricing only, in the approved 4-column format. It is filed into Jira manually by the user and must **never ship via the client deliverable**.

## What gets built

**One new file**: `clients/encore/specs_planning/_internal/CORPORATE_PRICING_MISSING_TESTID_REPORT.xlsx`

- Single sheet named `CORP_PRICING_MISSING_TESTID` — the originally intended `CORPORATE_PRICING_MISSING_TESTID` is 32 chars and Excel hard-caps sheet names at 31; the shortened name keeps the `<MODULE>_MISSING_TESTID` convention (filename is unaffected).
- Exactly 4 columns in this order: `Module | Sub Module | Element | Current Selector` (matches the approved Locations / Local Office reports — no status/severity/suggested-name columns).
- `Module` = `Corporate Pricing` on every row.
- `Sub Module` = screen: `Search`, `Product Group Override`, `New Pricebook (Equipment & Labor)`, `Pricebook Details`, `Pricing Strategy`, `Pricing Detail`. The New Pricebook create page is ONE screen reached via `?type=equipment|labor` with fully shared controls, so it gets one sub-module — duplicating all its rows per route would violate the one-row-per-control rule.
- One row per genuinely-missing-testid control (deduped — e.g. the Override partition's duplicate pointer to the Search "Pricing Override" button is not repeated). The 3 Search filter checkboxes that carry the generic `e2e-checkbox` testid are included with a note that the value is non-unique (cannot target a specific checkbox — functionally the same gap). The two card-chrome hooks (`e2e-card-header`, `e2e-card-title`) are excluded (not controls; they also appear in no selector file).
- Plain formatting: bold header row, sensible column widths, text wrap. No colors/screenshots/status columns (those belong to a different, richer internal audit format from 2026-04-30 — not the approved external format).

## Source of truth for the rows

The 6 corp-pricing selector files (already LR-029 live-verified per `clients/encore/specs_planning/_internal/testid-gap-report-2026-07-06.md` §4 — this is a compilation task, not a new audit):

- `clients/encore/src/selectors/corporate-pricing/search.ts` — 47 controls
- `clients/encore/src/selectors/corporate-pricing/override.ts` — 37 keys − 1 duplicate = 36 controls
- `clients/encore/src/selectors/corporate-pricing/details.ts` — 10 controls (Pricebook Details shell)
- `clients/encore/src/selectors/corporate-pricing/pricing-detail.ts` — 9 controls
- `clients/encore/src/selectors/corporate-pricing/new-pricebook.ts` — 13 controls
- `clients/encore/src/selectors/corporate-pricing/strategy.ts` — 7 controls

**Total: 122 rows.**

Count reconciliation (the v2 gap-report's §4 gate counts said 75; a research agent said 25/25 for search/override): the v2 numbers are **stale** — search.ts and override.ts grew with the export/import dialog work landed 2026-07-07/08. The gate script (`node scripts/check-testid-preference.mjs`) run fresh on 2026-07-10 reports 33 (search) + 31 (override) + 8 + 8 + 6 + 6 = 92 non-testid selector *lines* for corp-pricing; the 122 figure counts *distinct controls* per file key (the gate's line-counting heuristic and per-key control enumeration measure different things). The xlsx rows come from reading every key in every file, which is the precise ground truth.

Element descriptions are short human-readable control descriptions (from the constant name + the file's own comments + the prose recommendation list in `clients/encore/specs_planning/_internal/corporate-pricing-missing-testids-report.md`), plain English, no internal jargon.

## Build mechanism

One-off Node script (session scratchpad, not committed) using `exceljs` from the repo's `node_modules` — same library as the existing report scripts. Run once, verify, discard.

## Verification

1. Re-open the generated xlsx via Node and dump as CSV: correct sheet name, correct 4-column header, no blank cells, no `e2e-card-header`/`e2e-card-title` rows, the 3 `e2e-checkbox` rows carry the non-uniqueness note.
2. Row count = 122 (per-file: 47/36/10/9/13/7).
3. `git check-ignore` + `git status` on the new xlsx prove it is gitignored (root `.gitignore` `clients/*/specs_planning/` line) — structurally cannot ship via `client:ship` (`git archive`-based per LR-049).
4. Chat handoff reports: file path, row count, sub-module breakdown, Flag-2 zero-findings confirmation. User files it into Jira manually.

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | internal report artifact (gitignored) | clients/encore/specs_planning/_internal/CORPORATE_PRICING_MISSING_TESTID_REPORT.xlsx | `git check-ignore` shows the path is ignored; Node read-back shows 122 rows |

## Out of scope

- Locations / Local Office modules (already have their approved reports).
- Jira ticket creation (user files manually; Atlassian MCP returned 503 all session).
- Any change to the two existing internal markdown gap-reports.
- Any change to selectors, specs, or page objects.

### Execution Summary

**Executed**: 2026-07-10, same session as authoring (approved in Plan Mode, materialized here, executed via /execute).

**Deliverable produced**:
- `clients/encore/specs_planning/_internal/CORPORATE_PRICING_MISSING_TESTID_REPORT.xlsx` — 122 rows (Search 47, Product Group Override 36, New Pricebook 13, Pricebook Details 10, Pricing Strategy 7, Pricing Detail 9), single sheet `CORP_PRICING_MISSING_TESTID`, 4 columns (`Module | Sub Module | Element | Current Selector`) matching the approved Locations / Local Office format.

**Verification results** (all run 2026-07-10):
1. Node read-back of the generated xlsx: sheet name and 4-column header exact; 122 data rows; 0 blank cells; 0 `e2e-card-header`/`e2e-card-title` rows; exactly 3 checkbox rows carry the non-uniqueness note. PASS.
2. Row tally matched the per-file enumeration (47/36/13/10/7/9 = 122); build script asserts the tally and aborts on mismatch. PASS.
3. `git check-ignore -v` → matched `.gitignore` line 182 (`clients/*/specs_planning/`); the file is absent from `git status`, so it structurally cannot ship via the git-archive ship path. PASS.
4. Regression check: only repo-tracked change from this execution is this plan file itself; no existing file modified. PASS.

**Deviations from the Plan-Mode draft (both forced/justified, documented in body)**:
1. Sheet name `CORP_PRICING_MISSING_TESTID` instead of the drafted 32-char name — Excel hard-caps sheet names at 31 chars.
2. One `New Pricebook (Equipment & Labor)` sub-module instead of two per-route sub-modules — the create page is a single screen with fully shared controls; splitting would duplicate all 13 rows and violate the draft's own one-row-per-control rule.

**Flag-2 confirmation**: zero stale testid-caused skips in corporate pricing — the module's two skips (`TC-CPR-TIO-024`: data-fixture gap; `TC-CPR-OVR-023`: blocked on app bug BUG-CPR-OVR-001) are unrelated to testids. Nothing to un-skip; the un-skip protocol stands for any future candidate.

**TCs implemented**: none planned — this plan produces a report artifact only (no spec/selector/page-object/test-case changes). Rows were compiled read-only from `clients/encore/src/selectors/corporate-pricing/search.ts`, `override.ts`, `details.ts`, `pricing-detail.ts`, `new-pricebook.ts`, `strategy.ts` (none modified).

**Documentation changes**: this plan file; session row appended to `clients/encore/specs_planning/_internal/agent-activity-log.md`.
