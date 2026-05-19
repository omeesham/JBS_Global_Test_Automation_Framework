> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LM-1: MCP Catalog — Currency Tab → 87-col Location Management History

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: DONE
**Priority**: P0
**Created**: 2026-04-20
**Executed**: 2026-04-22
**Depends on**: SP-A1 complete
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (≤15 parents, Currency has 9 parents)

---

## Cause

Map Currency tab's 9 parent fields to the 87-col Location Management History. A prior MCP session (2026-04-17) found 6 of 9 parents are silently NOT-TRACKED (all 3 Merchant, all 3 IsDefault). This subplan formalizes that finding, plus handles col 5 "Currency" multi-checkbox state-space (7 valid combos) and col 63 "Currency" duplicate.

---

## Scope

**Target tab**: Location Management → Currency tab (office 1604).
**Parents (9 total)**: USD Selected, CAD Selected, MXN Selected, USD Is Default, CAD Is Default, MXN Is Default, USD Merchant, CAD Merchant, MXN Merchant.
**Target surface**: 87-col Location Management History.
**Known findings to verify/formalize** (from 2026-04-17 MCP):
- Col 5 "Currency" tracks Selected set as comma-separated list ("USD", "USD, CAD", "USD, CAD, MXN"). TRACKED.
- Col 63 "Currency" (duplicate header) — Pricing-owned. Stays "" for all Currency saves. Cross-contamination guard target.
- Merchant + IsDefault — NOT-TRACKED (all 6 fields). Candidate CUR-BUG-A, CUR-BUG-B.

---

## Method

1. MCP navigate to office 1604 → Location Settings → Currency tab.
2. Capture 87-col history top row baseline.
3. Record current state of all 9 Currency parents (baseline).
4. For each state in the 7-valid-combo matrix of Selected (USD only, CAD only, MXN only, USD+CAD, USD+MXN, CAD+MXN, USD+CAD+MXN):
   a. Set the combo + a valid default.
   b. Save. Wait for dirty-state cleared (LR-026).
   c. Diff 87-col top row. Confirm col 5 = expected string.
   d. Confirm col 63 unchanged (should stay "").
   e. Confirm no other col accidentally changes.
5. For each of 6 NOT-TRACKED parents (3 Merchants + 3 IsDefault):
   a. Change the parent value (e.g., USD Merchant 316370 → 316426).
   b. Save.
   c. Scan FULL 87-col row for any substring match (`316370`, `316426`, `Bahamas`, `PSAV US`, `Merchant`, `Default`). Expect ZERO matches outside Modified By column.
   d. Record as NOT-TRACKED with evidence.
6. Negative cases to record:
   - Cancel save → row count unchanged.
   - No-op save (clean form) → Save button disabled → 0 rows.
   - Validation-block (all 3 unchecked) → Save disabled → 0 rows.
7. Restore office 1604 Currency state to baseline.

---

## Output File

`clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md` per format in SP-B-LO-1. Plus add a "State-space coverage matrix" section for col 5 with all 7 combos mapped to expected values.

---

## KEEP list

- Office 1604 final state = baseline restored.
- SP1 MCP findings artifact.
- All other root-tab catalogs — do not touch.

---

## Step-by-Step Execution

Standard catalog procedure from SP-B-LO-1 adapted for Currency. State-space matrix is REQUIRED output for col 5.

---

## Verification

1. Catalog file exists.
2. 7 state-space combos tested + captured for col 5.
3. 6 NOT-TRACKED parents confirmed with phantom-row evidence.
4. Col 63 cross-contamination proved zero across all 7 Currency saves.
5. Negative cases (cancel, no-op, validation-block) documented.
6. Office 1604 baseline restored.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity-log row:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md | SP-B-LM-1 — MCP catalog: Currency → 87-col hist. 3 TRACKED (Selected), 6 NOT-TRACKED (Merchant+IsDefault). 7-combo state matrix complete. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Prior MCP 2026-04-17 already proved Merchant + IsDefault NOT-TRACKED. This session re-verifies + formalizes per the new catalog format.
- 87-col Location Management History uses Unicode ✔ for booleans (LR-036, encoding: `unicode`).
- LR-025 Radix retry for sort buttons if needed — helpers exist on `location-management-history.page.ts`.
- Currency tab is the PROOF-OF-PATTERN tab. SP-D1 (currency hist spec) consumes this catalog directly.

---

## Dependencies

- SP-A1 complete.
- Unblocks SP-B-LM-R + SP-D1.

---

## Execution Summary (2026-04-22)

**Catalog**: [clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md](../../clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md) — 9 parents cataloged via 9 save-cycles + 3 negative cases on office 1604 (Parker Palm Springs). Clean 1-col diffs on every Currency-tab save; zero col 63 cross-contamination; baseline restored 9/9 parents byte-match.

**Parents cataloged (9 / 9)**

| # | Parent | Target col | Status | Evidence |
|---|---|---|---|---|
| P1 | Currency Selected (combined USD/CAD/MXN) | col 5 "Currency" | TRACKED | 7-combo state matrix — Saves 1–7, 9 |
| P2 | USD IsDefault | — | NOT-TRACKED (direct) | Saves 4, 9 — no col reflects Default swap |
| P3 | CAD IsDefault | — | NOT-TRACKED (direct) | Saves 4, 6 |
| P4 | MXN IsDefault | — | NOT-TRACKED (direct) | Saves 6, 7 |
| P5 | USD Merchant | — | NOT-TRACKED (direct) | Save 8 — isolated Merchant change 316370→316426, phantom row (only Modified On diffed) |
| P6 | CAD Merchant | — | NOT-TRACKED (inferred) | 1 option on office 1604 (no alternate) — classified by pattern |
| P7 | MXN Merchant | — | NOT-TRACKED (inferred) | 0 options on office 1604 — classified by pattern |
| P8–P10 | USD/CAD/MXN Selected (component parents) | col 5 via P1 | TRACKED via P1 | App persists the Selected SET, not per-currency bits |

**State-space matrix (col 5 "Currency")**: all 7 non-empty subsets of {USD, CAD, MXN} MCP-verified. Serialization rule: comma-space-joined, **fixed code order USD, CAD, MXN** (not alphabetical, not insertion order). 0-subset prevented by app (Save disabled).

**Col 63 cross-contamination guard**: col 63 stayed `""` for every one of the 9 Currency-tab saves → zero cross-contamination; col 63 is Pricing-tab-owned and orthogonal.

**Negative cases**: 3 confirmed (N1 Cancel = dialog closes, no row added, form stays dirty; N2 No-op = Save button disabled when form pristine; N3 Validation-block = all 3 Selected=FALSE → Save button disabled silently, no aria-invalid). Also captured the shared "Unsaved changes / Stay|Discard" navigation guard as a side-effect during N1 teardown.

**MCP verification timeline (2026-04-22, office 1604, Claude in Chrome + Playwright MCP mid-session fallback)**
1. 09:42–09:51 UTC — Azure B2C `guest.encoreglobal.com/oauth2/authresp` ConnectionTimeOut on 3 attempts (correlation IDs `10fed2d9-b20a-4626-881e-de856c39f4fc`, `feeddca5-2b32-49dd-a3fb-3bf1fd33f605`, `611a442d-f5e5-4c30-b7bb-937059775812`). Session paused. Tenant recovered after user confirmation.
2. 10:39 UTC — re-authenticated via Claude in Chrome (persisted Microsoft "Stay signed in" session), landed on office 1604 Location Settings.
3. Phase 1 — 9 Currency parents baseline captured (USD only selected + default; USD Merchant `316370 - PSAV US/USD`; CAD Merchant `316446 - PSAV Canada/CAD`; MXN Merchant empty). 87-col history top row at 04/21/2026 02:59:07 PM (SP-B-LO-R's last save).
4. Phase 2 Saves 1–7 (10:45:28 AM – 10:54:12 AM) — all 7 Selected subsets; col 5 serialization rule proven; IsDefault NOT-TRACKED proven via Saves 4 (USD+CAD default swap) and 6 (MXN default on).
5. Phase 3 Save 8 (10:55:49 AM) — USD Merchant NOT-TRACKED proven via isolated phantom-row save.
6. Phase 5 — Cancel negative case at ~10:57, No-op + Validation-block at ~10:58. Unsaved-changes Stay/Discard dialog captured as side-effect.
7. Phase 6 Save 9 (10:59:43 AM) — baseline restored. 9/9 parents byte-match pre-session.

**Plan-document updates**
- Created [clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md](../../clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md) (new, ~260 lines).
- This subplan: Status → DONE, Executed 2026-04-22, this Execution Summary added.
- Activity log row appended per LR-028 / LR-037.

**Test pass confirmation**: N/A for this session — no test code written. The catalog is an input artifact for SP-D1 (location-hist-currency.spec.ts) and SP-B-LM-R (reconciliation).

**Rules honored**: LR-020 (every catalog claim backed by MCP evidence; prior 2026-04-17 findings re-verified not trusted), LR-025 (Radix option click pattern — synthetic dispatch failed on `[role="option"]`, fell back to `find` + `computer.left_click` for USD Merchant restoration), LR-026 (Angular dirty-state — Save-button-disabled ≠ form pristine; used explicit dirty-state reads before every save), LR-027 (this Execution Summary), LR-028 (activity-log row to follow), LR-032 (all findings from live MCP drives; zero theory), LR-033 (network activity implicitly used — save XHR `/navigator/api/location/navigator-settings` 200 PUT confirmed by top-row timestamp updates), LR-035 (plans:reindex to follow), LR-037 (activity-log wall-clock time ≥ mtime of touched files), LR-038 (browser tool choice announced + mid-session switch documented).

**Deferred / follow-up items**
- CAD Merchant + MXN Merchant direct save-cycle evidence — requires an office with ≥2 CAD or ≥1 MXN merchant options. Current inference (pattern match with directly-proven USD Merchant) is sound; retry on multi-merchant office for conclusive proof. Handed off to SP-E-LM-CUR.
- SP-D1's Currency-tab save dialog selector: current framework `btnSaveChangesConfirm` resolves to "Save" button but Location Settings dialog uses **"Ok"**. SP-D1 implementation must override or parameterize.

**Unblocks**: SP-B-LM-R (Location Management reconciliation — col 5 + col 63 mappings locked in), SP-D1 (location-hist-currency.spec.ts — 7-combo state matrix + 3 NOT-TRACKED guards + 3 negative cases all specified), SP-E-LM-CUR (6 bug candidates CUR-BUG-A trio + CUR-BUG-B trio ready for LR-034 filing once user approves).

outcome:pass, attempts:1, rules-written:0.
