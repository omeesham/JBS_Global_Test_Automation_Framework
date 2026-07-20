# SUBPLAN_CORP_PRICING_OVERRIDE_GAP_CLOSURE_2026_07

**Status**: SUPERSEDED (2026-07-17 — absorbed item-for-item into the six per-ticket plans SUBPLAN_CORP_PRICING_NM2268..NM2273; proof: .claude/state/ua-worker/chips/delegation-temp/out-ticket-split/ABSORPTION-MANIFEST.md)
**Priority**: High — closes the 2026-07-17 confirmed coverage gaps in Product Group Override
**Created**: 2026-07-17
**Identity**: BUILDER
**Parent**: (none — standalone gap-closure; relates to `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` and the done `SUBPLAN_CORP_PRICING_NM2267_OVERRIDE.md` without being a child of either)
**Depends on**: walk-fleet outputs (`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-A.md` + `-B.md`, summaries at `.claude/state/ua-worker/chips/delegation-temp/out-override-walk/`); RCA matrix (`.claude/state/ua-worker/chips/delegation-temp/out-override-rca/RCA-MATRIX.md`)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

## Context

Two independent repo-static analyses (2026-07-16, opus + gpt cross-provider) plus Rutvik's own live
checks confirmed the Override module's tests catalog controls without asserting their EFFECTS, and
skip data-dependent cases instead of self-producing/self-serving data. The tenant export analysis
(2026-07-16) already identified the data beds: Active-only effect → office 1105 (2 inactive rows);
pagination + populated Labor → 9460 (216 rows / 212 Labor) or 1974 (173/12); blank Override Price
(NM-1932) → office 1115 (1 existing row) or self-produce. Gaps are enumerated as phases below; the
2026-07-17 walk fleet certifies each bed live before authoring.

## Bootstrap

- **Identity**: BUILDER (`/identity BUILDER` first)
- **Skills auto-called**: `/identity`, `/regression-guard` (wrap), `/final-q`
- **Context files**: this file; both walk-evidence files above; RCA-MATRIX.md; `.claude/rules/specs.md` (LR-019, LR-066, LR-067, LR-068); `.claude/rules/angular.md`; `clients/encore/CLAUDE.md` (LR-ENC-002 FCC parity); `clients/encore/specs_planning/_internal/field-case-generation.md`

## Phase 0 — Dependency + browser-tool gate

BLOCKING inputs: both walk-evidence files + RCA-MATRIX.md must exist. BrowserTool: cli (LR-038).
Offices for NEW tests: prefer the Encore-designated six (4104/4107/9220/9311/2463/8843) IF the walk
certifies they carry the needed data; otherwise use the certified data-bed office and note it.
Existing wired offices (1606 etc.) stay untouched per Rutvik 2026-07-16.

## Phase 0.5b — Baseline-first walk

Consumed from the 2026-07-17 walk fleet (dated artifacts above) — no separate re-walk unless a bed
fails live certification.

## Phase 1+ — Gap closure GROUPED BY SPRINT TICKET (NM-2268..2273)

Each phase is self-contained → executable and branchable SEPARATELY (one PR per Jira ticket, so each
ticket shows "something new"). Every TC lands MD + test-plan + XLSX parity IN the same phase
(LR-ENC-002). "walkable-now" = the 2026-07-17 walk certified a live data bed; "BLOCKED" = external dep.

### Phase T2268 — NM-2268 Location Search  [walkable-now, thin]
- Location-search inside the "Change Local Office" picker: search an office by number, assert the
  picker narrows to matching rows, Select applies. (OVR-029/030 already cover navigation +
  Select-gating; this adds the search-narrowing effect — one new case.)

### Phase T2269 — NM-2269 Override Filters (after Location Search)  [walkable-now]
- Active-only checkbox EFFECT — office 1105: assert row-count + identity delta both directions
  (walk baseline 9→7).
- Currency filter EFFECT — assert the row set narrows when a currency is picked; needs a
  multi-currency office (walk residual). If no in-corporate-group office has multi-currency rows,
  mark data-blocked + escalate per the data doctrine — do NOT silent-skip.

### Phase T2270 — NM-2270 Override Grid Filters (incl. grid search)  [walkable-now]
- Grid "Filter Product Groups" search EFFECT — office 1105: type a Product Group substring, assert
  rows narrow (walk baseline 9→2 on "Camlok"), clear restores.
- Column sort EFFECT — first-cell changes on asc/desc per sortable column (sort is a dropdown menu,
  not a toggle — walk finding).
- Grid Options → Reset to Default — toggle a column off, Reset, assert default column set restores
  (restore server prefs after).

### Phase T2271 — NM-2271 Grid Equipment and Labor  [walkable-now, largest]
- Labor POPULATED grid — bed 9460 (212 Labor) or 1974: render + sort + filter + editable-cell
  Save-cycle mirroring Equipment (LR-066 parity). Closes the empty-state-only gap.
- Editable cell Save-cycle both tabs — Override Price / Max Discount % / Active: edit → Save enables
  → persist → recovery (LR-019 per-test baseline, LR-067 save-honesty).
- Dirty-state guard — edit a cell, navigate away, assert "Unsaved changes" dialog + Stay/Discard
  (walk-confirmed).
- Pagination + rows-per-page — bed 9460/1974: page nav asserts first-row change; 20→50 asserts count.
- NM-1932 blank Override Price — SELF-PRODUCE (blank + save + assert + restore) on a designated
  office; 1115 is the read-only fallback bed (renders "—" em-dash, walk-confirmed).
- Add-Override picker stays PARKED in `plans/pending/SUBPLAN_CORP_PRICING_OVERRIDE_PICKER_1101.md`
  (your explicit "no") — NOT in scope; cross-ref only.

### Phase T2272 — NM-2272 Override Export  [walkable-now, thin]
- Export scope assertion — assert the download is tenant-wide (ignores selected office) + filename
  pattern + 9-column header order (OVR-032/038 cover download + rows; this adds tenant-wide-scope +
  header). NOTE: pending Encore confirm whether tenant-wide is by-design (question already queued).

### Phase T2273 — NM-2273 Override Import  [BLOCKED — honest: no new runnable case now]
- Upload round-trip stays BLOCKED (server 4543 crash on 1604 + no valid import fixture). Only the
  existing dialog-open/Cancel (OVR-033) is runnable. When Encore fixes 4543 AND supplies a valid CSV
  fixture: author upload + validation + success round-trip + failure-message. Until then this ticket
  has NO new foldable test — do NOT fake one.

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | walk evidence | (skipped: consumed from the 2026-07-17 walk fleet artifacts — walk-evidence-corporate-pricing-override-2026-07-17-A.md + -B.md) | grep both files exist |
| GIVER | test-cases MD + test-plan MD + XLSX | new TC rows for phases 1-7 in corporate_pricing_override_test_cases.md + test plan + `npm run xlsx:build` | `npm run check:tc-parity` exit 0 |
| BUILDER | corporate-pricing-override.spec.ts (+ page object as needed) | effect-TCs for phases 1-7, first-run pass | `npx playwright test --list` resolves new TC IDs; full spec run green ×2 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none — audit runs post-closure via /chain_audit) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |

## Acceptance criteria

- [ ] Each ticket phase (T2268–T2272; T2273 stays BLOCKED) lands spec + MD + test-plan + XLSX in the same change (LR-ENC-002), independently branchable per ticket
- [ ] Every new effect-TC asserts a before/after delta, not presence (LR-068 corollary — "what wrong value would still pass?")
- [ ] Per-test baseline per LR-019 on every new save-capable test; save honesty per LR-067
- [ ] Phase 8 blocker row recorded with the Encore dependency named; phase 9 cross-ref verified (grep PICKER_1101 exists)
- [ ] Full override spec run green ×2 + `npm run check:spec-quality` clean on the working tree (LR-060 ob.4)
- [ ] No office already wired in existing tests changed (Rutvik 2026-07-16)

## Handoff

Chat-only per LR-039. Outcomes, not obstacles.
