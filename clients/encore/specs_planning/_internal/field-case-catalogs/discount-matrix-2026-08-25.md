# Field-Case Catalog — Discount Matrix (CRT / RWP / LOA)

**Module**: discount-matrix
**Date**: 2026-08-25
**CoverageMode**: QUICK (L1) — per PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK
**Field inventory**: one per submodule, each 100% dispositioned with CrossCheck clean —
`../field-inventories/discount-matrix-criteria-2026-08-25.md` (17/17) ·
`../field-inventories/discount-matrix-region-weekly-peaks-2026-08-25.md` (20/20) ·
`../field-inventories/discount-matrix-location-activation-2026-08-25.md` (20/20).
Union across the three states = 35 elements (11 shared chrome counted once, 6 Company Matrix, 9 per tab).
*(Split 2026-08-27 from the single module-wide `discount-matrix-2026-08-25.md`, to match how every other module pairs one inventory per test-case file; content carried over unchanged.)*
**Evidence**: `reports/walk-coverage/dsm-gav-boundary-probe.json` (15 typed values, attributes, option sets) · `reports/walk-coverage/dsm-revert-styling-probe.json` (clean revert, out-of-range styling, checkbox model) · three walk manifests (dsm-crt-skelgate / dsm-rwp--tab-region-weekly-peaks / dsm-loa--tab-location-activation)
**Case files**: `../../test-cases/setup/discount-matrix/` — CRT 30, RWP 26, LOA 13 = **69** *(corrected 2026-08-26: the earlier "RWP 19 = 60" undercounted the RWP band, which held 21 cases at the time; RWP-022/-023/-024 — the owner-authorized io trio — brought it to 24; 2026-08-27: the criteria-bar cross-tab quartet RWP-025/-026 + LOA-012/-013 brings the module to 69)*
**2026-08-25 late-day correction**: the LOA tab is NOT empty — the morning walk read the ~40s loading window as final. Probes `dsm-loa-load-timeline-probe.json` / `dsm-loa-affordance-probe.json` / `dsm-loa-affordance-probe2.json` / `dsm-loa-active-editor-probe.json` prove both offices carry the full country-scoped listing (2041 US locations), data landing ~43s after tab click. LOA rows below reflect the corrected contract; two defects were found in the process (search unresponsive — restated 2026-08-26 to a ~2-min post-load dead window during which typed input is silently ignored, working afterwards; grid not sortable despite the governing ticket's "sortable / filterable" scope).
**Scope note**: Company Matrix (CMX) is out of scope — NM-3343 owns that tab. Its 6 machine-enumerated controls are dispositioned out-of-scope in the inventory, not covered here.

---

## §1 Axis 1 — per-field FCC mapping (field-case-generation.md §2)

### GAV Discount Threshold — Numeric (`input[name="gavDiscountThreshold"]`, `type="text"` + `inputmode="decimal"`)

Measured range **0–100**, one decimal place kept, second dropped. No browser-level validation
(native validity stayed `valid` on all 15 probed values) — every check below is the application's.

| §2 template cell | Case(s) | Note |
|---|---|---|
| Positive: min | TC-DSM-CRT-015 | `0` accepted |
| Positive: mid | TC-DSM-CRT-010 | `20` → `20%` |
| Positive: max | TC-DSM-CRT-016 | `100` accepted |
| BVA: min−1 | TC-DSM-CRT-022 | Not enterable — the minus sign is refused at the keystroke, so the floor is proven by `0` being accepted (015). 022 records the silent sign-strip |
| BVA: max+1 | TC-DSM-CRT-017 | `101` refused — aria-invalid + Save disabled, no message anywhere names the limit |
| BVA: far out of range | TC-DSM-CRT-018 | `999` refused the same way |
| BVA: decimal step | TC-DSM-CRT-019 | `12.5` kept intact |
| Negative: `abc` | TC-DSM-CRT-020 | Letters filtered at keystroke; blur falls back to `0%` (model corruption ⇒ case ends in reload) |
| Negative: `1.2.3` | TC-DSM-CRT-021 | Silently rewritten to `1.2%` |
| Negative: `-5` | TC-DSM-CRT-022 | Silently rewritten to `5%` |
| Negative: leading zero | TC-DSM-CRT-023 | `007` → `7%` (benign) |
| Negative: scientific | TC-DSM-CRT-024 | `1e2` → `12%` (means 100, becomes 12) |
| Negative: empty | TC-DSM-CRT-025 | Blur substitutes `0%`; red state exists only while focused |
| Save-cycle: new fill | TC-DSM-CRT-010 | |
| Save-cycle: edit + persist | TC-DSM-CRT-011 | Save → reload → read back → restore through the same path |
| Save-cycle: revert-disables-Save | TC-DSM-CRT-026 | Comparison runs on blur — Save reads enabled while the cursor is still in the field |

§2.1 rejection-affordance oracle: every refused/rewritten value asserts both the announced signal
(`aria-invalid` / the substituted value itself) **and** that a natural Tab escapes the field —
measured: focus escaped on all 15 probed values, no trap.

### Country / Currency / Business Tier — Dropdown (Radix), criteria bar

Re-query controls, not saved fields — selecting an option re-keys the grid without a save, so
the §2 "each-option save+reload" cell is replaced by each-option re-query.

| §2 template cell | Case(s) |
|---|---|
| Option set verbatim | TC-DSM-CRT-002 / -003 / -004 |
| Each documented option exercised | Country: -007 (Canada), -027 (Mexico), -028 (Bahamas), resting United States · Currency: -008 (CAD), -029 (MXN), resting USD · Business Tier: -009 (Las Vegas), -030 (SVP Productions), resting Standard |
| Open/dismiss is not an edit | TC-DSM-CRT-006 |
| Invalid value via DOM tamper | out-of-scope for QUICK — deferred to deep pass |
| Re-query effect asserted per TAB STATE (added 2026-08-27) | The rows above drive the dropdowns on the LANDING tab and assert the selection round-trip only. The re-query EFFECT is asserted per tab state: RWP grid re-scope + currency cascade + switch-back restore — TC-DSM-RWP-025; LOA listing swap + cascade + restore — TC-DSM-LOA-012 (probes `dsm-critbar-rwp-probe.json` / `dsm-critbar-loa-probe.json`). The landing tab's own grid re-scope effect remains asserted nowhere (CRT-007's title says "re-queries the grid" but its oracle is the dropdown value) — deferred-to-DEEP: cmx-grid-requery-effect (needs a tier-grid content oracle across a country switch). Bar-save from non-landing tabs: TC-DSM-RWP-026 / TC-DSM-LOA-013. Currency/Tier changed FROM a non-landing tab — deferred-to-DEEP: critbar-currency-tier-per-tab (same mechanics as Country, measured cascade makes Country the high-signal probe; ≥20-char reason recorded here) |

### Select Year / Region — Dropdown (Radix), RWP tab

| §2 template cell | Case(s) |
|---|---|
| Option set | TC-DSM-RWP-002 (growing newest-first list with the three seed years as its fixed tail — reshaped 2026-08-26 when year creation went live) / -003 (28 regions, `LA / AL` presence per NM-3293) |
| Each option / list ends | Years: newest resting (-001, computed), reference 2027 date-pinned (-008/-012), 2026 (-012), 2025 (-015), created years (-022) — seed set complete, list top always the latest creation. Regions: Atlanta resting = first option, Austin mid (-011, -024), `VA / W PA` last (-016, -023); full 28-sweep deferred to deep |

### Peak / Standard / Non-Peak — Checkbox triplet (Radix, 52 rows × 3), RWP grid

Measured model 2026-08-25: mutually exclusive on tick (ticking one clears the other), **and** the
ticked box can be cleared to zero. NM-3238's reported cannot-uncheck does not reproduce.

| §2 template cell | Case(s) |
|---|---|
| Check (move classification) | TC-DSM-RWP-017 |
| Uncheck (clear to zero) | TC-DSM-RWP-014 — also records the zero-classification contradiction with -007's one-per-row rule (observation DSM-OBS-3) |
| Toggle-then-revert Save stays disabled | TC-DSM-RWP-018 |
| Toggle → save → reload | TC-DSM-RWP-019 |
| Toggle → Cancel discards (toolbar closes) | TC-DSM-RWP-021 |
| Region data completeness on the NM-3293 risk region | TC-DSM-RWP-020 |
| Data rule: exactly one per row | TC-DSM-RWP-007 |

### Create Year window — dialog behind Add Year, RWP toolbar (driven 2026-08-26, owner-authorized)

Measured contracts (RWP MD MCP rows 24–25; `reports/walk-coverage/dsm-rwp-io-mutating-probe.json`):
controls disabled ~40s while the window loads its own data (NM-3074), year list offers only
unconfigured years starting at newest+1, picking a year auto-fills Week 1 Start Date and the
Last Week of Previous Year read-out, `Initialize with previous year` ON by default, creation
~59s, the new year lands as a full copy and becomes the resting year. Creation is permanent —
no delete exists — so the case always creates newest+1, keeping runs repeatable.

| Control / behaviour | Case(s) |
|---|---|
| Year selector (offered set = unconfigured only, newest+1 first) | TC-DSM-RWP-022 |
| `Initialize with previous year` default + copy semantics | TC-DSM-RWP-022 (default ON asserted; full-copy proven on all 52 rows) |
| Create action (window closes, year joins list top, fresh load rests on it) | TC-DSM-RWP-022 |
| Window's own slow load (ready-gate on control enablement) | TC-DSM-RWP-022 rides it; NM-3074 already tracks the slowness — not re-filed |
| Deviating create paths (init OFF, cancel-after-pick, picking newest+2 over a gap) | deferred-to-DEEP: rwp-create-year-variants (each is another permanent server-side year on a shared office; QUICK proves the default path end-to-end) |

### LOA search box + row controls — unblocked 2026-08-25 (the "zero locations" read was a loading-window misread)

| Control / behaviour | Case(s) | Measured contract |
|---|---|---|
| Search box two-phase state | TC-DSM-LOA-003 | Disabled during the ~43s load, enabled once rows land |
| Search filtering | TC-DSM-LOA-010 | ACCEPTED WARM-UP (owner ruling 2026-08-26; BUG-DSM-LOA-001 withdrawn) — input is honoured only ~2 min after the tab renders, then `1102` filters to `1 matching locations`; the case passes by retyping in bounded rounds until the warm-up ends |
| Search box §2 Plain-text case set (boundary / negative / casing / partial) | deferred-to-DEEP: loa-search-input-contract | Not authored at QUICK, with reason: the control responds only after its accepted ~2-min warm-up (owner ruling 2026-08-26; BUG-DSM-LOA-001 withdrawn — the filter works once ready, so the steady-state input contract is measurable, but partial/casing/negative characterisation on a 2041-row shared grid is DEEP-depth work); QUICK proves the steady-state happy path via TC-DSM-LOA-010. (Disposition history: "blocked-by-BUG-DSM-LOA-001" → deferred after the same-day restatement → reason reworded after the same-day withdrawal.) |
| Active flag inline editor | TC-DSM-LOA-009 | Label button `Yes`/`No` swaps to an inline checkbox reflecting the value; toggle → dirty → Cancel discards (never saved in probes) |
| Workflow Start Date cell | deferred-to-DEEP: loa-date-cell-editor (per-row date editing is a persisting grid mutation; QUICK covers the affordance record only — editable input, `MM/DD/YYYY` placeholder, `Open calendar` opens a calendar dialog) |
| Header sort | TC-DSM-LOA-011 | Display-only by design — header click reorders nothing and no `aria-sort` exists; the owner ruled sorting is not part of this grid's design (2026-08-26, BUG-DSM-LOA-002 withdrawn; legacy does not sort either); spec pins the no-reorder contract as a passing case |

---

## §2 Axis 2 — SBC families (field-case-generation.md §3, LR-065)

| Family | Trigger holds? | QUICK coverage |
|---|---|---|
| result-fidelity | Yes — RWP rows derive from Year/Region; LOA search filters at steady state | RWP-008/-011/-012/-015/-016 (rows follow the selected Year/Region — real delta asserts) · LOA-010 (search — passing steady-state case; the ~2-min warm-up is accepted behaviour, owner ruling 2026-08-26) · **CRT re-dispositioned 2026-08-26 per the plan's own §1c proposal**: out-of-scope:result-fidelity(CRT)=the criteria bar returns no row set of its own — CRT-007/-008/-009/-027…-030 assert selection persistence plus a settle that tolerates a no-op re-query, so the row-set fidelity claim lives with the owning grids (RWP/LOA), not with CRT |
| pagination | No | out-of-scope:pagination=no paginator or rows-per-page control on any of the three surfaces (machine walk 2026-08-25; the populated LOA grid virtualizes instead of paging — ~28 rendered rows against a 2041 total) |
| sorting | Yes — LOA re-probed with rows present (2026-08-25 evening) | LOA-011 (header sort — display-only by design per the owner's 2026-08-26 ruling, BUG-DSM-LOA-002 withdrawn; the case pins that clicks never reorder the listing). RWP remains without a sort affordance — its grid is a fixed 52-week calendar. |
| combination | No | out-of-scope:combination=criteria selects are single-select re-query keys, no compound filter/sort/paginate surface exists here |
| render-state | Yes | CRT-001/-012/-013/-014 · RWP-001/-004/-013 · LOA-001/-007/-008 |
| empty-vol | Yes | RWP-005/-006 (52-row volume + loading-state discrimination) · RWP-020 (LA / AL — the NM-3293 risk region — loads the complete classified year; probe dsm-rwp-laal-probe.json 2026-08-26) · LOA-002/-005/-006 (count footer as the load oracle, bounded virtualized window, country-scoped parity across offices) |
| persistence | Yes | RWP-019 (save survives reload) · RWP-021 (Cancel discards a pending change and closes the toolbar — the NM-3485 corrected contract; probe dsm-rwp-cancel-revert-probe.json 2026-08-26) · RWP-024 (import persists with no Save click — reload-verified) · CRT-011 rides the same family on the field axis · LOA: deferred-to-DEEP: loa-persistence-save-path (persisting shared-data grid mutation; the dirty-and-discard half is covered at QUICK by TC-DSM-LOA-009) |
| io | Yes — the RWP toolbar carries Add Year / Export / Import (driven 2026-08-26 under the owner's mutation authorization) | RWP-022 (year creation end-to-end) · RWP-023 (export download — name + non-trivial size; cell-level read-back deferred to deep) · RWP-024 (import round-trip on `Austin` — applies to the grid AND persists with no Save click) · CRT / LOA: out-of-scope:io=no file or creation control on either surface (machine walk 2026-08-25) |

Each applicable family carries ≥1 QUICK TC; each inapplicable family carries its reason above.

---

## §3 Net-new IDs authored under this catalog

- CRT: TC-DSM-CRT-001 … -030 (30; -015 … -030 added after the boundary probe closed the Axis-1 gap)
- RWP: TC-DSM-RWP-001 … -026 (26; -014 rewritten from placeholder to measured case; -015 … -019 added with the probe evidence; -020/-021 added 2026-08-26 from the LA / AL and Cancel-revert probes — the two plan proposals the audit found dropped; -022/-023/-024 added 2026-08-26 when the owner authorized the io flows — year creation, export, import round-trip, measured contracts in RWP MD MCP rows 24–27; -025/-026 added 2026-08-27 closing the criteria-bar cross-tab gap — country re-scope + cascade, bar save from this tab, two-Save independence, `dsm-critbar-rwp-probe.json`)
- LOA: TC-DSM-LOA-001 … -013 (13; all automatable after the 2026-08-25 populated-state correction; -010/-011 pass after the 2026-08-26 owner rulings — the search warm-up is accepted loading behaviour and the headers are display-only by design; both bug reports withdrawn; -012/-013 added 2026-08-27 closing the criteria-bar cross-tab gap — country listing swap + cascade, bar save from this tab, `dsm-critbar-loa-probe.json`; -012 also retires the LOA plan's "per-country listing re-query" deep-tier deferral)

No `-FCC-` namespace block is used: this module's case files were authored with field cases inline
from the start, so the catalog maps to the main band rather than a separate FCC appendix.
