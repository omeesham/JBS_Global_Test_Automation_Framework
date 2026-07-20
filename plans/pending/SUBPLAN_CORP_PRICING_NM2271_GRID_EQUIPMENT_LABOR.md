# SUBPLAN_CORP_PRICING_NM2271_GRID_EQUIPMENT_LABOR — Populated Labor + editable save-cycles + dirty guard + pagination + NM-1932 + volume/a11y/picker-stub/integration

**Status**: PENDING
**Priority**: P1
**Created**: 2026-07-17
**Identity**: BUILDER
**Depends on**: SUBPLAN_CORP_PRICING_NM2270_GRID_FILTERS.md
**Blocks**: SUBPLAN_CORP_PRICING_NM2272_OVERRIDE_EXPORT.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

> Superseded-by-the-six: absorbs GAP_CLOSURE Phase T2271 (largest) + volume/virtualization stress +
> grid accessibility from SHADOW_EDGE + PICKER_1101 verbatim as BLOCKED phase + cross-field
> strategy×detail integration slice from SHADOW_INTEGRATION.

---

## Context

NM-2271 is the largest of the six sprint tickets. It covers: (1) populated Labor grid with real data,
(2) editable cell Save-cycles on both Equipment and Labor tabs, (3) dirty-state guard dialog,
(4) pagination + rows-per-page, (5) NM-1932 blank Override Price render ("—" em-dash). It also
absorbs volume/virtualization stress (591-row large grid), grid accessibility, the PICKER_1101 stub
(as a BLOCKED phase), and the cross-field strategy×detail integration slice.

**Walk-certified data beds**: Labor populated — 9460 (212 Labor rows, walk-A) or 1974 (12 Labor,
walk-B). Pagination — 1974 (161 Equipment, 9 pages at 20/page, walk-B). Editable cell — 1105
(Override Price spinbutton edit → Save enables, walk-A). Dirty-state guard — 1105 (alertdialog
"Unsaved changes" / Stay / Discard, walk-A). NM-1932 — 1115 (PG 286 "01D Double Screen Set Kit",
Override Price renders "—" em-dash in `<span class="text-muted-foreground">`, walk-B). LR-036:
Equipment = SVG lucide-check; Labor = role="checkbox" aria-checked button (walk-A finding).
**1117 verified EMPTY 2026-07-17** (tenant export cross-ref, 0 rows in 8,996-row tenant dump; evidence C,
`walk-evidence-corporate-pricing-override-2026-07-17-C.md` Job 2) — NOT a valid Labor bed; use
9460 (212 rows) or 1974 (12 rows).

**Gap provenance**: RCA-MATRIX.md.

**Bug findings (live-confirmed 2026-07-17)**: NM-2011 — office 1604 dup-key 4543 HTTP 500 LIVE, wrongly closed "could not recreate" (evidence C). NM-1940 — export file fails re-import on empty-Override-Price row LIVE (evidence E). NM-2186 — import UI stuck "Uploading… 50%", applies in background LIVE (evidence E). Dialog Active checkbox — `activeOnly` param appears server-side ignored, BUG-CANDIDATE (evidence C Job 3).

---

## Bootstrap

**Identity**: BUILDER

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/final-q`

**Context files**:
- Walk-evidence A+B (2026-07-17); RCA-MATRIX.md
- `.claude/rules/specs.md` (LR-019, LR-066, LR-067, LR-068)
- `clients/encore/CLAUDE.md` (LR-ENC-002, LR-036, LR-ENC-005)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm NM2270 is done. Walk-evidence files exist.
2. Read navigation.md, agent-mistakes.md (BUILDER), patterns.md.
3. LR scan: LR-019, LR-022, LR-036, LR-066, LR-067, LR-068, LR-ENC-002, LR-ENC-005.
4. `BrowserTool=cli`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

Consumed from walk fleet 2026-07-17. `baselineScope: baseline-absent` (net-new module).

---

## Phase 1 — Labor POPULATED grid (BUILDER)

1. Author NEW TC(s): bed 9460 (212 Labor rows) or 1974 (12 Labor) — render Labor tab with populated
   data; assert row count > 0; verify sort + filter work identically to Equipment (LR-066 parity).
   Editable-cell Save-cycle on Labor mirrors Equipment (Phase 2).
2. LR-036 boolean render: Labor tab uses `role="checkbox" aria-checked` (NOT SVG lucide-check like
   Equipment) — use the correct detection per tab.

---

## Phase 2 — Editable cell Save-cycles both tabs (BUILDER)

1. Author NEW TC(s): Override Price / Max Discount % / Active — edit cell → Save button enables →
   click Save → persist → recovery after reload. Per LR-019 per-test baseline in `beforeEach`;
   per LR-067 save-honesty (Save actually commits, verified by reload).
2. Test on BOTH Equipment (1105) and Labor (9460/1974) tabs.
3. Active cell: Equipment = SVG lucide-check toggle; Labor = checkbox aria-checked toggle (LR-036).

---

## Phase 3 — Dirty-state guard dialog (BUILDER)

1. Author NEW TC: edit a cell → navigate away → assert alertdialog "Unsaved changes" appears with
   heading + message + Stay/Discard buttons (walk-A certified). Test both: (a) Stay → remains on page
   with edit intact; (b) Discard → navigates away, edit lost.
2. Data bed: 1105 (walk-A: edit Override Price → click Home → dialog → Discard → 1105/home).

---

## Phase 4 — Pagination + rows-per-page (BUILDER)

1. Author NEW TC: bed 1974 (161 Equipment, 9 pages) — navigate to page 2 → assert first-row changes;
   change rows-per-page 20→50 → assert visible row count increases. Assert page nav controls work.
2. LR-022: do NOT hardcode row counts; use relative assertions (count > previous count, first-row
   identity changes).

---

## Phase 5 — NM-1932 blank Override Price render (BUILDER)

1. Author NEW TC: SELF-PRODUCE on a designated office — set Override Price to blank + save + assert
   renders "—" (em-dash) + restore original value. Fallback read-only bed: 1115 PG 286 (renders "—"
   em-dash in `<span class="text-muted-foreground">`, walk-B certified).
2. Assert `textContent === '—'` NOT `textContent === ''` (walk finding — blank Override Price renders
   as em-dash, not empty cell).

---

## Phase 6 — Volume/virtualization stress (from SHADOW_EDGE)

1. Author NEW TC: bed 9460 or 1974 (largest pagination bed) — scroll through all pages, verify
   content-anchored read integrity: read a row on page 1, navigate to last page, return to page 1,
   verify same row content (LR-022 no hardcoded counts — content anchor, not index).

---

## Phase 7 — Grid accessibility (from SHADOW_EDGE)

1. Author NEW TC(s): keyboard navigation on the Override grid — Tab into grid, arrow-key between cells,
   Enter to activate edit, Escape to cancel. ARIA roles on grid/dialogs: grid container has
   appropriate role, editable cells have spinbutton role (walk-A: Override Price = spinbutton).
2. If keyboard nav is not fully functional, record gaps as `blocked-pending-question` per LR-031.

---

## Phase 8 — Add-Override picker: currency-gated drag/double-click (BUILDER) [UNBLOCKED 2026-07-17]

**UNBLOCKED 2026-07-17** — the add-override mechanism was live-cracked (evidence D,
`walk-evidence-corporate-pricing-override-2026-07-17-D.md`). There is NO dedicated Add button on
the toolbar; the add affordance is a **currency-gated Product Group Picker** panel that appears in
the left search area ONLY when a specific currency (USD/CAD/MXN, not ALL) is selected for a location.
Add a row by **drag** (`playwright-cli drag <picker-row-ref> <override-tabpanel-ref>`) or by
**double-click** on a picker row — both mechanisms confirmed (evidence D Steps 3+5+6).

**TC(s) to author (data bed: office 4104, evidence D):**
1. Select office 4104 → set Currency to USD → assert Product Group Picker panel appears in the left
   search area (picker API: `GET /api/location/corporate-price-pg-override/product-group?locationNo=4104&currencyId=1`
   → 200 with 3,358 Equipment rows). Assert picker is ABSENT when Currency = ALL.
2. Drag a picker row into the Equipment grid tabpanel → assert:
   - Grid rowCount increases by 1
   - New row: Override Price = 0.00, Active = INACTIVE (aria-checked=false), Mod Date = empty
   - Save button enabled (dirty state confirmed)
   - NO network call fires during drag (drag is client-side; POST fires only on explicit Save)
3. Click Discard via "Unsaved changes" alertdialog → assert grid row count restored (row gone after
   page reload confirms no persistence).
4. Repeat steps 1–2 on Labor tab: Currency=USD → picker shows 420 Labor rows → drag one into
   `[role=tabpanel][aria-label="Labor"]` → assert same landing state (Override Price=0.00, INACTIVE).
5. Key selectors per evidence D: Currency combobox `combobox "Currency :"` (Radix UI, id=pg-ref-currency);
   picker rows `[draggable=true]` TR elements in the picker table (NOT the override grid table);
   override tabpanels `[role=tabpanel][aria-label="Equipment"]` / `[role=tabpanel][aria-label="Labor"]`;
   Unsaved changes dialog `[role=alertdialog]` Discard button.

**Multi-currency add block**: NOT yet verified — open sub-item. The picker mechanism works for
single-currency offices (USD on 4104, evidence D); multi-currency-add behavior (CAD/MXN picker on
a multi-currency bed) remains unverified until a confirmed multi-currency bed is available.

**Prior claim corrected**: Walk-A observation "no add button" was accurate for a toolbar button;
the picker IS the add affordance and is currency-gated (not absent). Evidence: D.

---

## Phase 9 — Cross-field strategy×detail integration (from SHADOW_INTEGRATION)

1. Author NEW TC(s) from the dependency-map artifact (produced by NM2268 Phase 2): for every
   `depends-on` cross-page edge involving Override ↔ Strategy/Detail, author an integration test
   verifying the data flow (e.g. Override Price reflected in Detail display, strategy selection
   affecting Override grid). Consume the map, do not re-derive.
2. If the dependency-map shows no Override-specific cross-page edges, record as
   `independent-verified` with evidence.

---

## Phase 10 — PARKED: Office alignment (from PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT)

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
| GIVER | test-cases MD + test-plan MD + XLSX | `clients/encore/specs_planning/test-cases/corporate_pricing_override_test_cases.md` (Labor + save-cycle + dirty-guard + pagination + NM-1932 + volume + a11y + integration TCs) | `npm run check:tc-parity` exit 0 |
| BUILDER | corporate-pricing-override.spec.ts + page object extensions | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` (all Phase 1–9 TCs) | `npx playwright test --list` resolves new TC IDs; spec run green ×2 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |

---

## Acceptance criteria

- [ ] Labor populated grid TC: render + sort + filter with real data on 9460/1974
- [ ] Editable cell Save-cycle TCs: Override Price / Max Discount % / Active on both tabs (LR-067)
- [ ] Dirty-state guard TC: alertdialog Stay + Discard paths tested
- [ ] Pagination TC: page nav + rows-per-page change on 1974 (161 rows)
- [ ] NM-1932 TC: blank Override Price renders "—" em-dash (self-produce or 1115 read-only)
- [ ] Volume/virtualization stress TC: content-anchored read integrity across pages
- [ ] Grid accessibility TC(s): keyboard nav + ARIA roles (or explicit blocked-pending-question)
- [ ] PICKER_1101 BLOCKED phase recorded verbatim with Rutvik-deferral provenance
- [ ] Cross-field integration TC(s) from dependency-map artifact
- [ ] LR-036 boolean render per tab honored (Equipment SVG vs Labor checkbox)
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

Chat-only per LR-039. Largest sprint ticket: populated Labor, editable save-cycles, dirty guard,
pagination, NM-1932, volume stress, accessibility, cross-field integration, plus PICKER_1101 recorded
as BLOCKED. NM2272 inherits as the next sprint ticket.
