# SUBPLAN_CORP_PRICING_NM2262_DATE_AND_COVERAGE_HARDENING — Date-column hardening + "no silent partial coverage" cure + open-thread disposition

**Status**: DONE
**Executed**: 2026-07-07
**Priority**: P1
**Created**: 2026-07-07
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: none (NM-2262 Loc Export subplan already closed — this is a follow-up hardening pass)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: acceptEdits
**BrowserTool**: none

---

## Context

`plans/done/SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md` closed with TC-CPR-TIO-023 validating 8 of the
11 exported CSV columns — the 3 date columns (`UseDate`/`StartDate`/`EndDate`) were silently left
unasserted. Not flagged, not researched as a gap, just absent. It surfaced only because Rutvik asked
directly. Root cause: "I don't know these columns' format" was treated as a free skip instead of a
research trigger, and the existing guard (LR-031) only catches **explicit** SKIP/NOT-AUTOMATABLE —
silent under-assertion inside a passing test slips through every structural gate. Rutvik's correction:
the failure isn't "an offer got dropped," it's *"why wasn't the date check part of the coverage in the
first place, automatically?"*

### Evidence gathered (no assumptions)
- **Real export samples** (`.playwright-cli/LocationPricebooks-20260623-*.csv`, both files, full-file
  grep): `UseDate` = `0` in every row; `StartDate`/`EndDate` empty in every row; zero ISO/US dates
  anywhere in either sample.
- **NM-2262 Jira**: no column spec — "Automate location pricing export + verify the exported file" + a
  screenshot.
- **Confluence "Pricing" microservice doc** (NM space): `LocationPricebook` carries alternate pricing
  strategies with **effective date ranges** → `UseDate` = a use-a-date-window flag; `StartDate`/`EndDate`
  = that window, empty when the flag is off.
- **Conclusion**: an exact date-format regex has nothing to match today (no `UseDate=1` sample exists) —
  but a cross-field window invariant is fully grounded and non-guessing.

---

## Bootstrap

**Identity**: OWNER (deterministic file edits — spec/data/rule/memory/plan authoring; no pipeline-role
artifact requires a switch)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/relevant` (Phase 0.5 — done inline in the parent `/execute` session)
- `/regression-guard` (wrap — before/after snapshot on touched files)
- `/final-q` (Phase 4 — mandatory exit)

**Context files**:
- `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent)
- `plans/done/SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md` (the subplan whose TC-023 gap this hardens)
- `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` (TC-023/024)
- `clients/encore/src/data/corporate-pricing/toolbar-io.ts` (`locExport`)
- `plans/done/SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md` (regression-coverage recipient for
  NM-1997/1998/2005)
- `.claude/rules/specs.md` (LR-031 sibling; new LR-068 lands here)
- `.claude/rules/deliverable.md` (LR-058 — plain-English shipped source)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-031, LR-040, LR-046)
- `clients/encore/CLAUDE.md` (LR-ENC-002 FCC parity)

**Anti-Assumption Gates**:
- [ ] No date-format regex authored without a populated `UseDate=1` sample — the gap is documented as
      data-blocked, not silently dropped.
- [ ] No gate/hook added for "silent partial coverage" detection — heuristic + false-positive prone;
      rule + memory only (slop-free constraint).
- [ ] NM-1997/1998/2005 not built here — different surface (Equipment/Max-Discount export), tracked as a
      named requirement in NM-2264, not implemented in this subplan.
- [ ] No silent checkpoint (LR-060).

---

## Phase 0 — Dependency + browser-tool gate

1. `Depends on: none` — proceed directly.
2. `BrowserTool: none` — evidence is already on disk (real export samples read this session); the live
   download happens only via the test runner at verification (`npx playwright test`), not a manual
   browser walk.
3. LR scan: LR-031 (SKIP investigation — sibling being authored as LR-068), LR-040 (closure completeness
   — NM-1997/1998/2005 routing), LR-046 (strict-line HALT — n/a, no strict numeric line here), LR-058
   (plain-English shipped source), LR-ENC-002 (FCC parity), LR-027/028 (closure + activity log).

---

## Phase 1 — Workstream A: Tighten TC-023 date columns (provable-now + cross-field invariant)

Files: `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` (TC-023),
`clients/encore/src/data/corporate-pricing/toolbar-io.ts` (`locExport`).

1. **Data** — add to `locExport`: `useDateColumn: 'UseDate'`, `dateWindowColumns: ['StartDate', 'EndDate']`
   as `readonly` tuple, with a plain-English comment grounding it in the observed sample + the pricing
   spec's date-window concept — no internal rule/plan IDs in the comment (LR-058).
2. **Spec** — extend the TC-023 `offenders` loop:
   - `UseDate` domain check: value must be `'0'` or `'1'`.
   - Cross-field window invariant: `UseDate==='0'` ⇒ `StartDate===''` AND `EndDate===''`;
     `UseDate==='1'` ⇒ `StartDate!==''` AND `EndDate!==''`.
   - Do NOT add a date-string format regex — data-blocked (no `UseDate=1` sample exists in any export to
     date). Document this boundary in a comment near the loop.
   - Update the TC-023 title to mention the date-window check.

---

## Phase 2 — Workstream B: Cure "silent partial coverage" (structural, slop-free)

1. Author new rule **LR-068** in `.claude/rules/specs.md` (verify LR-068 is still the next free number
   before writing — grep confirmed LR-067 is the current max as of this session).
2. Write `feedback_no_silent_partial_coverage.md` in the auto-memory dir + one `MEMORY.md` index line.
3. **No gate/hook** — reliably detecting "should-have-asserted-field-X" is heuristic/false-positive
   prone; that noise is the slop this subplan is explicitly avoiding. Rule + memory + agent-awareness
   only.

---

## Phase 3 — Workstream C: Disposition every other open thread

1. **TC-024 (empty-export skip)** — rewrite the skip justification per LR-031: the endpoint is
   tenant-wide (exports ALL locations, confirmed — the sample spans offices starting at 1101), so an
   empty result needs a zero-location-pricing **tenant**, not merely an empty office, and that is
   unavailable on the shared e2e server. Stays skipped, now exhaustively justified.
2. **NM-1997 / NM-1998 / NM-2005** — add a tracked **Regression coverage** requirement block to
   `SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md` naming each defect + the concrete assertion its
   round-trip test must add (unique `(LocationNo, PriceBook, Currency)` rows → 1997/1998; all active
   pricebooks present + no labor PGs on the max-discount variant → 2005). Grep-verify the line lands
   (LR-040(b)).
3. **Filename pattern** — verified OK already (TC-018 green ×2 proves underscore pattern); no action,
   just record in the Execution Summary.
4. **Bounded sibling sweep** — scan TC-018..024 + the `captureCsvDownload` helper for any other
   silently-unasserted field; fix or document each. Bounded to this spec + helper.

---

## Phase 4 — Parity sync (LR-ENC-002)

Update TC-023/024 entries in `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_loc_export_test_cases.md` (originally `corporate_pricing_toolbar_io_test_cases.md` at execution time; relocated 2026-07-09T21:53 by commit 3156c352's toolbar-io fold)
+ the test-plan coverage index, then `npm run xlsx:build`.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For each adjacent fix noticed during Phases 1-4 that is OWNER-scoped + same file/module + ≤30 min + no
user input needed: DO-NOW / SPAWN / APPEND-with-grep-verify. Bare "out of scope" with no recipient =
HALT + ask.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — no new baseline surface; NM-2262 baseline-absent declaration already covers this data) | (none) | (none) |
| GIVER | test-cases MD + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_loc_export_test_cases.md` (originally `corporate_pricing_toolbar_io_test_cases.md` at execution time; relocated 2026-07-09T21:53 by commit 3156c352's toolbar-io fold)<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + data | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`<br>`clients/encore/src/data/corporate-pricing/toolbar-io.ts` | `npx playwright test corporate-pricing-toolbar-io --grep "TC-CPR-TIO-023" --workers=1` green |
| HEALER | (skipped: TC-023 date-window tightening is additive to a proven-green oracle; no first-run RCA expected — if the live run surfaces drift, this row's disposition updates in the Execution Summary) | (skipped: additive change to a green test, no RCA anticipated) | `npx playwright test corporate-pricing-toolbar-io --workers=1` green ×1 |
| WATCHDOG | (none — closure audit is parent plan's own do-or-die step) | (none) | (none) |
| GARDENER | rule + memory authoring | `.claude/rules/specs.md`<br>(skipped: the paired memory file lives in the user's global auto-memory directory outside this git repo, by design of the auto-memory system) | grep `LR-068` in specs.md |
| OWNER | closure ceremony + NM2264 regression-coverage block | `plans/done/SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md` | `grep -F "NM-1997" plans/done/SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md` |

---

## Acceptance criteria

- [ ] TC-023 asserts all 11 columns (8 existing + UseDate domain + StartDate/EndDate cross-field
      invariant) — green ×1 minimum, ×2 if the full-suite run is cheap enough.
- [ ] TC-024 skip justification rewritten with tenant-wide reasoning (still skipped, now exhaustive per
      LR-031).
- [ ] LR-068 authored in `.claude/rules/specs.md`, unique number confirmed via grep before write.
- [ ] `feedback_no_silent_partial_coverage.md` + MEMORY.md line written.
- [ ] NM-1997/1998/2005 regression-coverage block landed in NM2264 subplan, grep-verified.
- [ ] Sibling sweep of TC-018..024 + helper completed, findings recorded (even if "none found").
- [ ] `npx tsc --noEmit` — 0 errors.
- [ ] `npm run check:tc-parity` + `npm run xlsx:build` pass.
- [ ] `npm run plans:reindex:check` clean.
- [ ] Activity-log row per LR-028.

---

## Verification

```bash
cd clients/encore && npx tsc --noEmit
# expect: 0 errors

npx playwright test corporate-pricing-toolbar-io --grep "TC-CPR-TIO-023" --workers=1 --retries=0
# expect: 1 passed

npx playwright test corporate-pricing-toolbar-io --workers=1 --retries=0
# expect: 23 passed, 1 skipped (TC-024)

npm run check:tc-parity
# expect: exit 0

npm run xlsx:build
# expect: exit 0

npm run plans:reindex:check
# expect: clean
```

---

## Handoff (chat-only per LR-039)

TC-023 now asserts every exported column including the date-window invariant; TC-024 stays skipped with
an honest tenant-wide justification. LR-068 + the memory file are the durable cure for the underlying
"silent partial coverage" failure class. NM-1997/1998/2005 are named, grep-verifiable requirements inside
NM-2264 — not built here, that subplan owns the equipment/max-discount export round-trip.

---

## Execution Summary

**Executed**: 2026-07-07

**Workstream A (TC-023 date hardening)**: `clients/encore/src/data/corporate-pricing/toolbar-io.ts` gained
`useDateColumn: 'UseDate'` + `dateWindowColumns: ['StartDate', 'EndDate']` on `locExport`.
`clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` TC-CPR-TIO-023 extended:
`UseDate` domain check (`'0'`/`'1'`) + cross-field window invariant (`UseDate==='0'` ⇒ both date columns
empty; `UseDate==='1'` ⇒ both populated). No date-string format regex added — data-blocked, no
`UseDate=1` sample exists in any observed export; documented as a boundary, not a silent gap. Title
updated to mention the date-window check. Verified green individually (`--grep "TC-CPR-TIO-023"` →
1 passed) and in the full suite.

**Workstream B (silent-partial-coverage cure)**: new rule `LR-068` authored in `.claude/rules/specs.md`
(confirmed LR-067 was the prior max via repo-wide grep before writing — no collision). Paired memory
file `feedback_no_silent_partial_coverage.md` written + indexed in `MEMORY.md`. Deliberately NO
gate/hook — heuristic "did this test assert every field" detection is false-positive prone; this is an
authoring-time awareness rule per the user's slop-free directive.

**Workstream C (open-thread disposition)**:
1. TC-CPR-TIO-024 skip justification rewritten: the endpoint is tenant-wide (confirmed — every export
   sample spans all locations, starting at office 1101), so an empty result needs a zero-pricebook
   *tenant*, not merely an empty office; unavailable on the shared e2e server. Stays skipped, now
   exhaustively justified per LR-031.
2. NM-1997/1998/2005 — added `### 1.5 — Regression coverage requirements` to
   `plans/done/SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md`, naming each defect's concrete regression
   assertion (unique `(LocationNo, PriceBook, Currency)` tuples for 1997/1998; active-pricebook coverage
   + no-stray-labor-rows for 2005), grep-verified present. Not built here — different surface
   (Equipment/Max-Discount export), correctly deferred per LR-046 (this subplan's scope is Loc Pricing
   Export only).
3. Filename pattern — no action needed; TC-CPR-TIO-018 already proves the underscore pattern green ×2
   from the NM-2262 closure.
4. Bounded sibling sweep of TC-CPR-TIO-018..024 + `captureCsvDownload`/`downloadLocPricingExport` in
   `corporate-pricing-search.page.ts` — no other silently-unasserted fields found. Each of TC-018/019/
   021/022 checks exactly what its title claims (filename / non-empty+parseable / locale param /
   fresh-download-on-reclick); the helper's parse is already faithful (trim-free, BOM-stripped) per the
   prior NM-2262 audit fix.

**Parity sync (LR-ENC-002)**: TC-023/024 entries updated in
`corporate_pricing_toolbar_io_test_cases.md` (title, steps, expected, `Surface_Family` disposition note)
and `corporate_pricing_toolbar_io_test_plan.md` (scenario + summary bullet). `npm run xlsx:build` rebuilt
the workbook clean (0 vocab hits, 0 integrity violations).

**Verification (evidence)**:
- `npx tsc --noEmit` (from `clients/encore/`) → 0 errors.
- `npx playwright test corporate-pricing-toolbar-io --grep "TC-CPR-TIO-023" --workers=1 --retries=0` →
  `2 passed` (auth setup + TC-023).
- `npx playwright test corporate-pricing-toolbar-io --workers=1 --retries=0` → `16 passed, 8 failed,
  1 skipped`. The 8 failures are the **pre-existing, documented** 2026-06-10 Year+Currency dialog drift
  (TC-CPR-TIO-002/003/004/005 Export▾ + TC-CPR-TIO-008/009/010/011 Import▾) — same TC-IDs the NM-2262
  Execution Summary already recorded as owned by NM-2264/NM-2305, unaffected by this subplan's changes
  (this subplan touched zero lines in the Export▾/Import▾ describe blocks). TC-024 skipped as expected.
- `npm run check:tc-parity` → `PASS: All spec TCs are present in both markdown and XLSX deliverable.`
- `npm run xlsx:build` → OK, 778 rows, 0 lint violations.
- `grep -F "NM-1997"` / `grep -F "NM-2005"` on `SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md` → both found.

**Plan deviations (what + why)**: none — executed as planned. The only judgment call was the exact
wording of the tenant-wide TC-024 justification and the LR-068 rule body, both within the plan's stated
intent.

**Out-of-scope / not built here**: NM-1997/1998/2005 regression assertions themselves (tracked as
named requirements in NM-2264, per Workstream C item 2 above — different surface, correctly not
implemented in this subplan).
