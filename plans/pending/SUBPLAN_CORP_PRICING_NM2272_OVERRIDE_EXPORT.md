# SUBPLAN_CORP_PRICING_NM2272_OVERRIDE_EXPORT — Export file-IO edge cases + Excel-drift + import dialog guards

**Status**: PENDING
**Priority**: P1
**Created**: 2026-07-17
**Identity**: BUILDER
**Depends on**: SUBPLAN_CORP_PRICING_NM2271_GRID_EQUIPMENT_LABOR.md
**Blocks**: SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

> Superseded-by-the-six: absorbs export file-IO edge cases + Excel-drift slice from the allocation
> matrix. NM-2272 owns tenant-wide export validation, import dialog guard states, malformed/empty
> fixture handling, and CSV-vs-Excel drift detection.

---

## Context

NM-2272 covers the Override grid's Export and Import surfaces. The Export button produces a tenant-wide
CSV file (8,996 data rows across all offices, 9-column header — live-confirmed 2026-07-17, evidence E).
The Import dialog has three controls:
Upload file / Cancel / Upload (disabled until a file is selected). Malformed.csv and empty.csv test
fixtures already exist in the repo. Healthy data beds for export/import testing: 1105 and 1107.

**Walk-certified data beds**: Export — tenant-wide scope, **8,996 data rows**, 9-column header
(live-confirmed 2026-07-17, evidence E, `walk-evidence-corporate-pricing-override-2026-07-17-E.md`
Step 2; CSV SHA256=749CFF8C…). Import dialog — Upload file / Cancel / Upload(disabled) (walk-certified).
Healthy beds — 1105, 1107. Fixture files — malformed.csv, empty.csv (existing).

**Gap provenance**: Allocation matrix NM-2272 row in TICKET-six-ticket-plans.md.

**Bug findings (live-confirmed 2026-07-17)**: NM-2011 — office 1604 dup-key 4543 HTTP 500 LIVE, wrongly closed "could not recreate" (evidence C). NM-1940 — export file fails re-import on empty-Override-Price row LIVE (evidence E). NM-2186 — import UI stuck "Uploading… 50%", applies in background LIVE (evidence E). Dialog Active checkbox — `activeOnly` param appears server-side ignored, BUG-CANDIDATE (evidence C Job 3).

---

## Bootstrap

**Identity**: BUILDER

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/final-q`

**Context files**:
- Walk-evidence A+B (2026-07-17); allocation matrix
- `.claude/rules/specs.md` (LR-019, LR-066, LR-067, LR-068)
- `clients/encore/CLAUDE.md` (LR-ENC-002, LR-ENC-005)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm NM2271 is done. Walk-evidence files exist.
2. Read navigation.md, agent-mistakes.md (BUILDER), patterns.md.
3. LR scan: LR-019, LR-022, LR-066, LR-067, LR-068, LR-ENC-002, LR-ENC-005.
4. `BrowserTool=cli`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

Consumed from walk fleet 2026-07-17. `baselineScope: baseline-absent` (net-new module).

---

## Phase 1 — Export tenant-wide CSV (BUILDER)

1. Author NEW TC(s): trigger Export on bed 1105 or 1107 — assert download completes, filename matches
   the live-confirmed pattern `ProductGroupOverrides_YYYYMMDD_HHMMSSUTC.csv` (e.g.
   `ProductGroupOverrides_20260717_154159UTC.csv`, evidence E Step 2), file is non-empty.
2. Assert tenant-wide scope: exported data row count equals **8,996** rows (live-confirmed 2026-07-17,
   evidence E Step 2; CSV SHA256=749CFF8C…; use a dynamic count assertion ≥ 8000 not a hardcoded value
   per LR-022 — 8,996 is the observed baseline, not a contract).
3. Assert exact 9-column header row (live-confirmed en-US, NM-2044/2045 NOT reproduced in en-US
   locale per evidence E Step 2):
   `Location Id,Product Group Id,Product Group Name,Is Labor,Currency,Current Price,Override Price,Override Discount,Is Active`
   Keep any localization-drift TC for non-en-US locales; note en-US baseline is clean.
4. Assert scope is tenant-wide: export includes rows for offices other than the currently selected
   office in the location picker (not filtered by picker selection).

---

## Phase 2 — Export file content integrity (BUILDER)

1. Author NEW TC(s): parse the exported CSV — verify column count per row equals 9 (no ragged rows),
   verify no truncation (last row is complete), verify encoding is valid UTF-8.
2. Spot-check a known row: for bed 1105/1107, verify at least one row in the export matches a
   known Override Price / Max Discount % value visible in the grid (content-anchored, not index).

---

## Phase 3 — Excel-drift detection (BUILDER)

1. Author NEW TC(s): open the exported CSV in a context that simulates Excel consumption — verify
   that numeric columns (Override Price, Max Discount %) are not corrupted by Excel auto-formatting
   (e.g. leading zeros preserved, no date coercion on numeric strings, no scientific notation on
   large numbers).
2. If the export produces `.xlsx` natively, adjust assertions to the actual format. If CSV-only,
   assert that values round-trip cleanly through a CSV parse without drift.

---

## Phase 4 — Import dialog guard states (BUILDER)

1. Author NEW TC(s): open Import dialog — assert initial state: Upload file button visible, Cancel
   button visible, Upload button visible but disabled.
2. Assert Cancel closes the dialog without side effects (grid unchanged).
3. Assert Upload button remains disabled until a file is selected via Upload file.

---

## Phase 5 — Import malformed file handling (BUILDER)

1. Author NEW TC(s): upload malformed.csv fixture via Import dialog — assert application displays a
   user-facing error message (not a raw stack trace or HTTP 500). Assert grid data is unchanged
   after the failed import attempt.
2. Author NEW TC: upload empty.csv fixture — assert application handles gracefully (error message
   or no-op), grid data unchanged.
3. Do NOT use office 1604 — it returns HTTP 500 **on location selection alone** (NM-2011, dup key 4543),
   so a test aimed at it dies before reaching the import surface. Never use.
4. **The "healthy bed" offices named in this plan (1105/1107) are candidates, not certified.** NM-2272
   runs BEFORE NM-2273, so it hits this risk first: run the target-certification checklist from
   `SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md` **Phase 0.7** before authoring any TC that writes,
   and consume the office it certifies. Added 2026-07-23 (Rutvik) — same instruction, applied where it
   bites first.

---

## Phase 6 — Import valid file round-trip (BUILDER)

1. Author NEW TC (if import is functional): export → re-import the same file → verify grid state
   matches pre-export state (round-trip integrity). Use bed 1105 or 1107.
2. If import is not yet functional or behind a feature flag, record as `blocked-pending-question`
   with evidence from the walk.

---

## Phase 7 — PARKED: Office alignment (from PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT)

**PARKED** — do NOT execute until Rutvik explicitly green-lights. Migrate tests to designated offices.
9311/2463 ZERO override data; data seeding prerequisite. Provenance: Rutvik 2026-07-17.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW / APPEND with grep-verification. Bare deferral = HALT + ask.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | test-cases MD + test-plan MD + XLSX | `clients/encore/specs_planning/test-cases/corporate_pricing_override_test_cases.md` (export + import + Excel-drift + fixture TCs) | `npm run check:tc-parity` exit 0 |
| BUILDER | corporate-override-export.spec.ts + page object extensions | `clients/encore/tests/corporate-override/corporate-override-export.spec.ts` (all Phase 1–6 TCs) | `npx playwright test --list` resolves new TC IDs; spec run green ×2 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |

---

## Acceptance criteria

- [ ] Export TC: tenant-wide 8,996 data rows downloaded; filename matches `ProductGroupOverrides_YYYYMMDD_HHMMSSUTC.csv` pattern
- [ ] Export TC: 9-column header order matches walk-certified sequence
- [ ] Export content integrity TC: no ragged rows, no truncation, valid UTF-8
- [ ] Export spot-check TC: known grid value appears in exported file (content-anchored)
- [ ] Excel-drift TC: numeric columns survive round-trip without format corruption
- [ ] Import dialog guard TC: initial state (Upload file / Cancel / Upload-disabled)
- [ ] Import malformed.csv TC: user-facing error, grid unchanged
- [ ] Import empty.csv TC: graceful handling, grid unchanged
- [ ] Import round-trip TC: export → re-import → grid matches (or blocked-pending-question)
- [ ] Office alignment PARKED with Rutvik-deferral provenance
- [ ] Per-test baseline (LR-019); save honesty (LR-067); effect deltas (LR-068)
- [ ] MD + test-plan + XLSX parity (LR-ENC-002); `npm run check:tc-parity` exit 0
- [ ] Full override spec run green ×2; `/regression-guard`; activity-log; `/final-q`

---

## Verification

```bash
npx playwright test --list corporate-pricing-override   # expect: new TC IDs for all phases
npm run check:tc-parity                                  # expect: exit 0
```

---

## Handoff (post-execution)

Chat-only per LR-039. Export file-IO edge cases, Excel-drift detection, import dialog guards, and
fixture-based error handling complete. NM2273 inherits as the final sprint ticket carrying the
SHADOW_FRAMEWORK_CLOSURE audit/gate-ramp tail.
