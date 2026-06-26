---
artifact: field-case-catalog
module: account-address
client: encore
catalog_date: 2026-05-29
author_identity: GIVER
field_inventory: clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29.md
old_site_baseline: clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-05-29.md
false_green_sweep: clients/encore/specs_planning/_internal/false-green-sweeps/account-address-2026-05-29.md
target_spec: clients/encore/specs/locations/location-account-address.spec.ts
parent_subplan: plans/pending/SUBPLAN_ACCOUNT_ADDRESS_FCC.md
net_new_count: 3
net_new_ids: TC-LOC-ACC-029, TC-LOC-ACC-030, TC-LOC-ACC-031
---

# Field-Case Catalog — Account & Address — 2026-05-29

GIVER exhaustive (field × case-class) gap analysis per `SUBPLAN_ACCOUNT_ADDRESS_FCC.md` Phase 2. De-dup is by **PROVEN OUTCOME**, not by exact action (STRICT-LINE-B): a cell is **(b) covered** if its end-assertion is already proven by ANY existing test (including multi-field tests); a net-new **(a)** is justified only if it proves ≥1 assertion absent from the Step-2.0b ledger; **(c)** is a named deferral per LR-040(c).

Grounded in: the live field inventory (2026-05-29 CLI walk), the old-site baseline (`baselineScope: baseline-partial` — new-site picker/phone surface is baseline-absent, so the live new-site DOM is the truth source), and the GREEN false-green sweep.

---

## §1 — Step 2.0b Coverage Ledger (what each existing test PROVES)

| TC | Field(s) | Proven assertion(s) (outcome) |
|---|---|---|
| TC-001 | layout | two cards (Venue + Master) visible |
| TC-002 | Venue Name | read-only/disabled + value = "Parker Palm Springs" |
| TC-003 | Account List dialog | opens with filters + action buttons + table |
| TC-004 | Account **Name** filter | search returns matching account (poll "Parker Palm Springs") |
| TC-005 | Account List Select + row-checkbox | Select disabled-until-row-checked → enabled after check |
| TC-006 | Account List Cancel | cancel closes without changing venue name |
| TC-007 | Account List Reset | reset clears Name filter + empties table |
| TC-008 | Venue Address dialog | opens; search visible; row count = 7 |
| TC-009 | Address Select + row-checkbox | Select disabled-until-checked → enabled |
| TC-010 | Address search | client-side filter REDUCES rows + contains match |
| TC-011 | Address Save | always disabled (before + after row check) — invariant |
| TC-012 | Master Address dialog | opens the SAME dialog; row count = 7 |
| TC-013 | Venue display fields | City/State/Zip/Country read-only |
| TC-014 | Master display fields | City/State/Zip/Country read-only |
| TC-015 | Phone 1 | clear → required inline error (aria-invalid + icon) |
| TC-016 | Phone 2 | empty → no validation (aria-invalid=false) |
| TC-017 | Save | disabled when no pending changes (at rest) |
| TC-018 | Phone 2 / Save | field change → Save enables |
| TC-019 | Phone 2 / Save | fill → save+confirm → Save disables |
| TC-020 | Phone 2 | save value PERSISTS after reload |
| TC-022 | Save dialog | Cancel in Save Changes dialog discards (no persist) |
| TC-023 | Phone 1 / Save | clear → invalid + icon, BUT Save stays ENABLED (app doesn't block) |
| TC-025 | Account **Address** filter | search returns matching results (poll "Beverly") |
| TC-026 | Account **City** filter | search returns matching results (poll "LOS ANGELES") |
| TC-027 | Venue Address selection | select alt → display changes + Save dirties + reload restores (NON-persist) |
| TC-028 | Account selection | re-select same account → save → venue name persists after reload |

Dropped (gaps, not skips): TC-021 (Phone 1 round-trip — NOT-AUTOMATABLE account-linked revert), TC-024 (tab-switch unsaved-changes dialog — does not appear).

---

## §2 — Exhaustive (field × case-class) Gap Matrix (STRICT-LINE-A/G — every cell classified)

| Field | Case-class | Shape | Covered? (ledger) | Cite | Disposition |
|---|---|---|---|---|---|
| Phone 1 | empty → required indicator | negative | YES | TC-015, TC-023 | **(b)** |
| Phone 1 | empty → Save not blocked | negative | YES | TC-023 | **(b)** |
| Phone 1 | positive new-value save+reload | save-cycle | NO | — | **(c)** NOT-AUTOMATABLE — account-linked revert (TC-021; field-inv §Known App Bugs; masked `fill` no-dirty / server overwrites with account phone) |
| Phone 1 | edit-overwrite save+reload | save-cycle | NO | — | **(c)** same NOT-AUTOMATABLE |
| Phone 1 | BVA max / special chars save+reload | save-cycle | NO | — | **(c)** same (masked + account-linked; persistence meaningless) |
| Phone 1 | revert-to-original → Save disabled | save-state | NO | — | **(c)** deferred — depends on the finicky masked-`fill` dirty path TC-021 proved unreliable; flake risk, not authored |
| Phone 2 | positive save+reload persist | save-cycle | YES | TC-019+TC-020 | **(b)** |
| Phone 2 | change → Save enables | save-state | YES | TC-018 | **(b)** |
| Phone 2 | empty → no validation | negative | YES | TC-016 | **(b)** |
| Phone 2 | **clear (valid-empty) save+reload → empty persists** | save-cycle | NO | — | **(a) TC-LOC-ACC-029** |
| Phone 2 | edit-overwrite alternate value persist | save-cycle | YES (same outcome) | TC-020 | **(b)** collapsed (re-proves Phone2-persists) |
| Phone 2 | BVA max / special chars | save-cycle | NO | — | **(c)** not-meaningful (masked input normalizes; normalized-value persist == positive) |
| Account selection | open dialog (mechanic) | structural | YES | TC-003 | **(b)** |
| Account selection | Select disabled-until-checked | selection | YES | TC-005 | **(b)** |
| Account selection | Cancel no-persist | selection | YES | TC-006 | **(b)** |
| Account selection | same-account → save → persists | save-cycle | YES | TC-028 | **(b)** |
| Account selection | **different**-account → save → persists | save-cycle | NO | — | **(c)** DEFERRED — no ORIGINAL_ACCOUNT restore constant; STRICT-LINE-F server-state-restore-not-deterministic; permanent 1604 contamination risk (plan restorability tier) |
| Account **Name** filter | search returns results | filter | YES | TC-004 | **(b)** |
| Account **Address** filter | search returns results | filter | YES | TC-025 | **(b)** |
| Account **City** filter | search returns results | filter | YES | TC-026 | **(b)** |
| Account **Number** filter | search returns matching account | filter | NO | — | **(a) TC-LOC-ACC-030** (verified live: AC000107 → 1 row "Parker Palm Springs") |
| Account **State** dropdown filter | option narrows results (LR-025, 59 opts) | filter | NO | — | **(c)** DEFERRED (discussion-item) — live 2026-05-29: selecting CA returned 25 **mixed-state** rows (CA + BAJA CALIFORNIA SUR + YUCATAN); Radix-select→Angular-form commit + filter result-semantics uncertain + LR-025 flake; needs dedicated filter-behavior RCA before authoring |
| Account **Country** dropdown filter | option narrows results (LR-025, 255 opts) | filter | NO | — | **(c)** DEFERRED (discussion-item) — same class as State; not verified clean this pass |
| Account List | negative search → "No results." | filter | NO | — | **(c)** not-authored — server no-match render not verified this session; low value; future pass with live verify |
| Account List Reset | clears multi-field filter set | filter | YES (outcome) | TC-007 | **(b)** (reset-clears outcome proven; multi-field re-proves same) |
| Venue Address | dialog opens + structure (7 rows) | structural | YES | TC-008 | **(b)** |
| Venue Address | Select disabled-until-checked | selection | YES | TC-009 | **(b)** |
| Venue Address | Save always disabled (invariant) | invariant | YES | TC-011 | **(b)** |
| Venue Address | client search REDUCES rows | filter | YES | TC-010 | **(b)** |
| Venue Address | **search → clear restores full 7-row set** | filter | NO | — | **(a) TC-LOC-ACC-031** (client-side, deterministic) |
| Venue Address | select alt → display change + dirty + NON-persist | display/save-cycle | YES | TC-027 | **(b)** |
| Master Address | opens same dialog | structural | YES | TC-012 | **(b)** |
| Master Address | select alt → display change + non-persist | display | YES (same outcome) | TC-027 | **(b)** collapsed (same address-selection-nonpersist outcome) |
| Venue Name | read-only + value | read-only | YES | TC-002 | **(b)** |
| Venue display | City/State/Zip/Country read-only | read-only | YES | TC-013 | **(b)** |
| Master display | City/State/Zip/Country read-only | read-only | YES | TC-014 | **(b)** |
| Save | disabled at rest | save-state | YES | TC-017 | **(b)** |
| Save | enables on change | save-state | YES | TC-018 | **(b)** |
| Save | flow → confirm → disables | save-cycle | YES | TC-019 | **(b)** |
| Save | persists after reload | save-cycle | YES | TC-020 | **(b)** |
| Save dialog | Cancel → discards | save-state | YES | TC-022 | **(b)** |
| Layout | two cards visible | structural | YES | TC-001 | **(b)** |
| Tab nav | dirty + tab-switch → unsaved-changes dialog | dialog | NO | — | **(c)** NOT-AUTOMATABLE — TC-024 dropped (dialog does not appear); LR-021 re-verify already flagged in test-cases.md TC-024 note (named recipient); out of this additive subplan's net-new scope |

**Every applicable taxonomy cell is classified (a)/(b)/(c).** No cell left unclassified → STRICT-LINE-A/G satisfied.

---

## §3 — Net-new TC Catalog (sequential from TC-LOC-ACC-029, no `-FCC-` segment)

| ID | Label | Field | Case-class | Shape | Expected outcome | Restore obligation (STRICT-LINE-F) |
|---|---|---|---|---|---|---|
| TC-LOC-ACC-029 | Phone 2 cleared value persists empty after reload | Phone 2 | clear (valid-empty) save-cycle | save-cycle (`saveAndVerifyCase`) | baseline seeds Phone 2 = a value + save; clear Phone 2 → Save enables → save+confirm → reload → Phone 2 is empty | cleanup `ensureDefaultState()` (Phone 2 → empty baseline) — restorable |
| TC-LOC-ACC-030 | Account List Account Number filter returns matching account | Account Number filter | positive filter search | filter (`test()` + `expect.poll`) | open Account List → fill Account Number = `AC000107` → Search → results contain "Parker Palm Springs" → Cancel | none (filter not saved); Cancel closes dialog |
| TC-LOC-ACC-031 | Address dialog search filter then clear restores full set | Address dialog search | filter clear-restores | filter (`test()`) | open Venue Address dialog (7 rows) → search "Beverly" (rows reduce) → clear search → rows restore to 7 → Cancel | none (client-side filter; Cancel closes dialog) |

**STRICT-LINE-C**: net-new spec growth target = **3** tests (±15% → 3). 

---

## §4 — STRICT-LINE audit (catalog-side)

- **A** (every taxonomy case enumerated + classified): ✓ §2 matrix — all cells (a)/(b)/(c).
- **B** (zero duplication by proven outcome): ✓ 3 net-new each prove an assertion absent from §1 ledger; Phone2 edit-overwrite + Master-address-display collapsed to (b).
- **G** (max-coverage floor — every applicable cell (a)/(b)/(c) with cite): ✓ §2.
- Net-new bounded + honest: 3 (a), 13 (b)-cited groups, 8 (c) deferrals — the (c) count reflects the live reality (Phone 1 account-linked, address non-persist, dropdown-filter uncertain, account-different contamination-risk) the adversarial audit predicted. This is honest exhaustive classification, NOT artificial capping (STRICT-LINE-G) and NOT forced flaky (a) tests (`feedback_skip_discipline`).

---

## §5 — Deferral destinations (LR-040 (c) completeness)

| Deferred cell | (c) destination |
|---|---|
| Phone 1 positive/edit/BVA/revert save | Documented app-limitation (account-linked revert) — TC-021 dropped (test-cases.md) + field-inventory §Known App Bugs discussion-item. No new bug filed (by-design-vs-bug uncertain per `feedback_discussion_item_not_bug`). |
| Account different-account persist | Restorability tier in subplan (server-state-restore-not-deterministic); recorded here + in field inventory. Would require an `ORIGINAL_ACCOUNT` capture+restore mechanism — out of scope this subplan. |
| State / Country dropdown filters | Discussion-item: dropdown-filter result-semantics need dedicated RCA (live evidence: CA→25 mixed-state rows). Recorded here + field-inventory §Known gaps. Candidate for a future filter-behavior subplan. |
| Account List negative search | Recorded here as future-pass-with-live-verify (low value). |
| Tab-switch unsaved-changes dialog | TC-024 dropped + LR-021 re-verify note already in test-cases.md (named recipient). |
