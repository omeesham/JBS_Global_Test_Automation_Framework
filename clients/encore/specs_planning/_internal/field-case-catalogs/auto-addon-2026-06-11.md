# Field-Case Catalog — Auto Add-On

**Subplan**: SUBPLAN_AUTO_ADDON_FCC.md (Phase 2)
**Identity**: GIVER
**Date**: 2026-06-11
**Inputs**: `field-inventories/auto-addon-2026-06-11.md`, `false-green-sweeps/auto-addon-2026-06-11.md` (Phase-1.5 verdict table), `tests/locations/location-auto-addon.spec.ts` (19 runtime TCs)
**Fields under test**: 5 independent checkboxes — Encore Music (EM), Wireless Presenter (WP), Express Content Design Session (ECDS, default-unchecked), Wordly (WD), Labor (LB). No validation, no cross-field deps, no text/numeric/date input, no filtering.

## Final outcome: **ZERO net-new TCs** (honest-zero GREEN)

The 20 documented TCs (19 runtime) provide full (field × case) coverage. Per the subplan's honest-zero clause, the catalog proving full coverage IS the deliverable — no filler tests authored. Reasoning: 5 simple independent booleans; TC-020 (bulk-invert all 5) + TC-011 (multi-field) discharge per-item persistence, and the dialog/nav/smart-diff paths are each directly proven. Matches the Legal precedent (mostly LR-040(b) outcome-discharge).

## Coverage ledger — (field, assertion) proven per documented TC

| TC | What it proves | Field(s) |
|---|---|---|
| TC-001 | tab navigates; 5 items render (count) | all (count) |
| TC-002 | default state of all 5 + Save disabled on clean load | EM✓ WP✓ ECDS✗ WD✓ LB✓ |
| TC-003 | toggle checked→unchecked enables Save (smart diff) | EM |
| TC-004 | toggle unchecked→checked enables Save | ECDS |
| TC-005 | revert toggle re-disables Save (LR-009 smart diff) | ECDS |
| TC-006 | Save dialog appears (heading/body verbatim) | form-level |
| TC-007 | Save dialog Cancel dismisses without saving; pending preserved; Save stays enabled | form-level |
| TC-008 | Save dialog Ok saves; toast "Local information updated"; Save re-disables | ECDS + form-level |
| TC-009 | toggle-on persists after reload | ECDS (check-persist) |
| TC-010 | Save disabled on fresh load, no changes | form-level |
| TC-011 | multiple toggles saved together persist after reload | ECDS (check-persist) + EM (uncheck-persist) |
| TC-012 | sub-tab switch with dirty form is silent (no dialog); pending preserved | form-level |
| TC-013 | nav-away with dirty form opens "Unsaved changes" dialog (heading/body verbatim) | ECDS + form-level |
| TC-014 | Unsaved-changes Stay keeps user on page; pending intact | form-level |
| TC-015 | Unsaved-changes Discard navigates away; original saved state retained | ECDS (discard = no-persist) + form-level |
| TC-016 | item list (corrected: country-scoped, same 5 across locations) — Manual | all (count semantics) |
| TC-017 | uncheck persists after save+reload | WD (uncheck-persist) |
| TC-018 | uncheck persists after save+reload | LB (uncheck-persist, `true_` testid variant) |
| TC-019 | Save-dialog Cancel does NOT persist after reload (negative) | ECDS (cancel = no-persist) |
| TC-020 | bulk invert ALL 5 persists after save+reload (per-item post-reload assertion for every field) | EM,WP,WD,LB (uncheck-persist) + ECDS (check-persist) |

## Gap matrix — 5 fields × Checkbox taxonomy §2 + form-level

Cell classification: **(a)** implement net-new · **(b)** already-covered-by-outcome (cite TC) · **(c)** not-applicable / deferred (cite reason).

### Per-field checkbox cases

| Field | toggle→Save-enables | check-persist (save+reload) | uncheck-persist (save+reload) | revert→Save-disables (LR-009) |
|---|---|---|---|---|
| Encore Music (EM) | (b) TC-003 direct (uncheck-enables); same mechanic | (b) default-checked proven by TC-002 across suite saves; re-check direction discharged by TC-011/020 cleanup + TC-002 | (b) TC-011 ✓ + TC-020 ✓ | (b) TC-005 proves mechanic on ECDS; same smart-diff form-level |
| Wireless Presenter (WP) | (b) TC-020 toggles WP + asserts Save enabled | (b) default-checked (TC-002) + TC-020 restore | (b) TC-020 ✓ | (b) smart-diff form-level (TC-005) |
| Express Content Design Session (ECDS) | (a→covered) TC-004 direct (check-enables) | (b) TC-009 ✓ + TC-011 ✓ + TC-020 ✓ | (b) default-unchecked (TC-002/010); cancel/discard no-persist TC-019/015 | (b) TC-005 direct ✓ |
| Wordly (WD) | (b) TC-020 + smart-diff mechanic | (b) default-checked (TC-002) + TC-017 restore | (b) TC-017 ✓ + TC-020 ✓ | (b) smart-diff form-level (TC-005) |
| Labor (LB) | (b) TC-020 + smart-diff mechanic | (b) default-checked (TC-002) + TC-018 restore | (b) TC-018 ✓ + TC-020 ✓ | (b) smart-diff form-level (TC-005) |

Per-field `toggle→enables` / `revert→disables` for WP/WD/LB are discharged-by-outcome: the smart-diff is a **form-level** behavior proven directly on EM (TC-003) + ECDS (TC-004/005), and TC-020 toggles all 5 and asserts Save enabled — applying it to WP/WD/LB individually is the same mechanic, different data (LR-040(b)). Authoring per-item enable/disable tests = filler the subplan forbids.

### Form-level cases

| Case | Verdict | Discharging TC |
|---|---|---|
| Save dialog appears | (b) | TC-006 |
| Save dialog Cancel (dismiss, no save) | (b) | TC-007 |
| Save dialog Ok (save + toast + re-disable) | (b) | TC-008 |
| Save disabled on fresh load | (b) | TC-010 |
| Sub-tab switch silent (no dialog) | (b) | TC-012 |
| Unsaved-changes dialog on nav-away | (b) | TC-013 |
| Unsaved Stay | (b) | TC-014 |
| Unsaved Discard (navigate + no-persist) | (b) | TC-015 |
| Cancel no-persist (negative round-trip) | (b) | TC-019 |
| Bulk multi-field persist | (b) | TC-011 + TC-020 |
| Item-list semantics (count) | (b) | TC-001 (count 5) + TC-016 (corrected) |

### Tier-2 / cross-cutting candidates

| Candidate | Verdict | Reason |
|---|---|---|
| Tier-2 network-status assert (taxonomy §1 — assert save POST 200) | **(c) deferred — redundant + LR-056 risk** | the persistence-after-reload TCs (009/011/017/018/020) read the persisted server state on a fresh load — that IS the server-side proof. An explicit `waitForResponse('/navigator/api/location/update-properties')` adds LR-056 RSC-noise risk (the `?_rsc=` GETs) for zero new signal. Not authored. |
| NM-1462/64/65 country-scoped item rules | **(c) not-testable-on-1604** | single US office; item set fixed at 5 for countryId=1. LR-040(c) discussion item (field inventory §Known gaps). Out of 1604-only scope (user-fact #3). |
| LM-History rows from Auto Add-On save | **(c) no workstream** | user-fact: no history rows. Not isolable on CI-active shared 1604. |

## TC-016 disposition (keep ID — feedback_renumber_verify_gap_cause)

Old premise ("Item Count Is Location-Specific") is **falsified** by user-fact #1 + live evidence (`auto-addon-types?countryId=1` country-scoped loader; nav2 item-list parity = same 5). Re-scope the TC-016 body to: the item list is the same 5 across locations within a country (country-scoped, not location-specific) — premise corrected 2026-06-11; stays **Manual** (the cross-country variation that WOULD exercise a different count is not reachable on 1604). ID retained.

## Bug candidates

None. No live-walk divergence survived the LR-044 oracle (nav2 baseline parity + REQUIREMENTS-level expectation). No `BUG-LOC-AAO-NNN` filed.

## Net-new TC list

**(none)** — honest-zero. The catalog above is the coverage proof.
