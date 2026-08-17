# SUBPLAN_CORP_PRICING_NM2271_GRID_EQUIPMENT_LABOR — Populated Labor + editable save-cycles + dirty guard + pagination + NM-1932 + volume/a11y/picker-stub/integration

**Status**: DONE
**Executed**: 2026-07-21
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
> grid accessibility from SHADOW_EDGE + PICKER_1101 (now UNBLOCKED — see Phase 8) + cross-field
> strategy×detail integration slice from SHADOW_INTEGRATION.

---

## Amendment log — 2026-07-20 pre-execution audit

The 2026-07-17 walk evidence (files A–F) was absent from the executing machine and was hand-delivered
on 2026-07-20; it now lives at `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-{A..F}.md`
(+ `-READ-ME-FIRST.md`). Auditing this plan's claims **against** that evidence surfaced eight defects.
All are corrected in-place below and marked `CORRECTED 2026-07-20` / `⚠` at their site.

| # | Defect | Correction |
|---|---|---|
| D1 | Phase 8 claimed add-by-**double-click** was "confirmed (evidence D Steps 3+5+6)". Double-click appears in **no** walk file; D Step 3 is drag, Step 5 is discard verification, Step 6 is the Labor picker count. | Claim removed. Phase 8 is drag-only unless double-click is probed live. |
| D2 | Phase 4 pagination bed 1974 (161 Eq / 9 pages) is **uncertified** — count is B-narration-only, both first-row and 50-per-page probes returned empty (NOT-CAPTURED), and "Pagination controls (1974)" sits under B's Skipped Probes. | Bed swapped to **9460 Labor** (212 rows / 11 pages), fully certified in walk A with two verify files and `provenance: live`. |
| D3 | Phase 2 required "click Save → persist → recovery after reload", but **no walk ever committed a Save** (A, B, D all close "NO SAVE COMMITS"); Max Discount % and Active editable probes were explicitly skipped as "expected identical behavior". | Phase 2 gains a mandatory Step 0 live save-probe + dated `-SAVE.md` addendum that must precede any save-cycle TC. |
| D4 | Phase 3 required both Stay and Discard; only **Discard** was ever exercised (A and D). | Stay flagged unwalked, probe-before-assert. Added the certified dialog contract + the `page.goto()`-fires-native-`beforeunload` landmine from D Step 4. |
| D5 | `activeOnly` bug attributed to "evidence C Job 3, BUG-CANDIDATE" — C Job 3 concluded the **opposite** ("checkbox IS functional… NOT silent/inert"). | Re-attributed to **evidence F Step 5, BUG-CONFIRMED-B**, with its evidence chain. |
| D6 | "Gap provenance: RCA-MATRIX.md" — artifact **never existed** (inherited by NM2268/2269/2270). | Provenance re-pointed at the six walk files; phantom citation documented. |
| D7 | Row constants sourced from walk A, but walk E ran real UPSERT-ALL imports that moved Mod Date on all matching rows (1105/PG 272: 06/12 → 07/17 09:51 PM). | Mod Date literals banned; assert relative change or presence only. |
| D8 | Phase 5 made SELF-PRODUCE primary — needs the unwalked save commit, on the exact row shape NM-1940 rejects, against a shared bed, with no restore-failure path. | Inverted: read-only 1115 / PG 286 is primary; self-produce deferred and gated on Phase 2 §0. |

Plan-hygiene fixes landed alongside: Per-Identity matrix paths corrected to their real
`test-cases/setup/corporate-pricing/…` locations and reduced to bare multi-line paths (LR-055 C6);
the acceptance criterion demanding "PICKER_1101 BLOCKED phase recorded verbatim" removed as it
contradicted Phase 8's UNBLOCKED status.

**Still open, not silently absorbed**: Phase 9's dependency-map input does not exist (NM2268 closed
DONE citing it — LR-055 C3 violation in a closed plan); Phase 7 accessibility has **zero** supporting
evidence in any walk and is a discovery phase, not an authoring phase.

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

**Gap provenance**: the six walk-evidence files
`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-{A..F}.md`
(+ `-READ-ME-FIRST.md` hand-off note). **CORRECTED 2026-07-20**: prior revisions of this plan (and of
NM2268/2269/2270) cited `RCA-MATRIX.md` as gap provenance. **No such artifact was ever created** —
searched repo-wide and across every plausible name; the only near-name is
`rca-corp-pricing-detail-nm2260-2026-06-24.md`, an unrelated June RCA. The reconciliation content
lives inline in the six walk files as observation/verdict blocks. Do not wait for it or reconstruct one.

**Evidence-strength caveats (read before certifying anything against these — 2026-07-20)**:
- **Walk B is materially weaker than A/D/F.** It was reconstructed after the walk hit a 1-hour wall;
  it carries its own ~10-row NOT-CAPTURED table and a Skipped-Probes list. Claims sourced from B's
  `live-output.log` narration have no corroborating tee'd verify file. Every 1974 pagination number
  is in that class (see Phase 4).
- **No walk ever committed a Save.** A, B and D all close with "NO SAVE COMMITS"; C and F are
  declared READ-ONLY. Persistence and post-reload recovery are therefore UNWALKED (see Phase 2).
- **Raw tee'd directories (`raw-A/` … `raw-EA4/`) were not handed over** — claims cannot be re-hashed
  at source. Every technical claim is stated verbatim in the prose, which is what TCs are authored from.
- **Walk E is the sole mutating walk.** It ran real imports with UPSERT-ALL semantics, which updated
  Mod Date + Updated By on *all* matching rows — e.g. 1105/PG 272 moved 06/12/2026 07:57 PM →
  07/17/2026 09:51 PM (evidence E). **Any Mod Date literal taken from walk A is stale.** Never assert
  a Mod Date constant; assert relative change or presence only.

**Bug findings (live-confirmed 2026-07-17)**: NM-2011 — office 1604 dup-key 4543 HTTP 500 LIVE, wrongly closed "could not recreate" (evidence C Job 1, verbatim body `{"message":"An item with the same key has already been added. Key: 4543"}`, both repro orders). NM-1940 — export file fails re-import on empty-Override-Price row LIVE (evidence E). NM-2186 — import UI stuck "Uploading… 50%", applies in background LIVE (evidence E). Change-Local-Office dialog `activeOnly` — **BUG-CONFIRMED-B, not a candidate** (evidence **F** Step 5, NOT evidence C): `POST /api/location/location-lookup` returns the identical 2,651 active-only set for both `activeOnly:true` and `activeOnly:false`; office 1222 is `active:false` per `/api/location/1222` yet never appears under either value; positive control 4107 appears correctly. **CORRECTED 2026-07-20** — the prior "appears server-side ignored, BUG-CANDIDATE (evidence C Job 3)" attribution was wrong on both source and confidence: C Job 3 concluded the *opposite* ("Active checkbox IS functional — triggers POST location-lookup when toggled, NOT silent/inert") and flagged only an unresolved 512-vs-0 data-state discrepancy.

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

> **⚠ EVIDENCE GAP — the load-bearing half of this phase is UNWALKED (flagged 2026-07-20).**
> What IS certified (evidence A, `provenance: live`): the Override Price cell becomes a **spinbutton**
> on click; Save is `[disabled]` before edit and **enabled** after `fill 99.99` + Tab/blur; dirty state
> triggers. What is **NOT** certified: **Save was never clicked in any walk** — A, B and D all close
> with "NO SAVE COMMITS". So the commit response, any success toast, and post-reload recovery are
> unobserved. Additionally, walk A **explicitly skipped** the Max Discount % and Active editable-cell
> probes, reasoning "expected identical behavior" — that is an assumption, not evidence, and this
> phase requires all three fields.
> **Therefore: Phase 2 opens with a live probe (Step 0) that establishes save-commit behaviour
> first-hand. Do NOT author a save-cycle assertion from the walk files — they do not contain one.**

0. **Live probe FIRST (mandatory, blocks Steps 1–3).** On 1105 Equipment, edit Override Price on ONE
   row, click Save, and capture: the network request/response (method, URL, status, body), any toast
   or dialog, the post-save Save-button state, and the row state after a full reload. Repeat the
   observation for Max Discount % and for the Active toggle. Record findings into a dated addendum
   `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-<DATE>-SAVE.md`
   (this is the first walk in this module's history to commit a save — say so in the file, and record
   the original value + the restore).
1. Author NEW TC(s) from the Step-0 findings: Override Price / Max Discount % / Active — edit cell →
   Save button enables → click Save → persist → recovery after reload. Per LR-019 per-test baseline in
   `beforeEach`; per LR-067 save-honesty (Save actually commits, verified by reload).
2. Test on BOTH Equipment (1105) and Labor tabs. **Labor bed**: 1105 Labor has 2 rows (655 General -
   Ops, 656 General - Utility, both `aria-checked=false`) — small and adequate; 9460 Labor (212 rows)
   is the alternative. **NOT 1974** — its Labor=12 is B-narration-only with no verify file.
3. Active cell: Equipment = SVG lucide-check toggle; Labor = checkbox aria-checked toggle (LR-036).
   Note evidence D reports the dragged Equipment row carrying BOTH `aria-checked=false` and
   "svg-inactive" — probe the actual attribute per tab in Step 0 rather than trusting one form.
4. **Restore discipline**: every mutation restores the original value in the same test. Record the
   pre-edit value before writing. 1105 is a shared bed used by NM2269/NM2270 TCs.

---

## Phase 3 — Dirty-state guard dialog (BUILDER)

1. Author NEW TC: edit a cell → navigate away → assert alertdialog "Unsaved changes" appears with
   heading + message + Stay/Discard buttons (walk-A certified). Test both: (a) Stay → remains on page
   with edit intact; (b) Discard → navigates away, edit lost.
   > **⚠ The Stay path is UNWALKED (flagged 2026-07-20).** Both walks that reached this dialog clicked
   > **Discard** only (evidence A: Discard → 1105/home; evidence D Step 4: Discard → 4104/home).
   > Nothing anywhere exercises **Stay**, so "remains on page with edit intact" is an expectation, not
   > an observation. Probe Stay live before asserting it.
2. Data bed: 1105 (walk-A: edit Override Price → click Home → dialog → Discard → 1105/home).
3. **Certified dialog contract** (evidence A + D agree verbatim): role `alertdialog`; heading
   "Unsaved changes"; body "Are you sure you want to leave this view? Any unsaved changes will be
   lost."; buttons "Stay" | "Discard".
4. **⚠ NAVIGATION MECHANISM MATTERS — spec-authoring landmine (evidence D Step 4, flagged 2026-07-20).**
   The React `alertdialog` fires only on an **in-app link click** (e.g. the Home link). A
   `page.goto()` away from a dirty grid instead triggers **native `beforeunload` dialogs** — walk D
   needed two `dialog-dismiss` calls and never reached the alertdialog that way. Author these TCs
   with an in-app click, not `page.goto()`; if any helper navigates via `goto`, register a
   `page.on('dialog', …)` handler or the test will hang.

---

## Phase 4 — Pagination + rows-per-page (BUILDER)

> **BED CHANGED 2026-07-20: 1974 → 9460 Labor.** The plan originally specified 1974 (161 Equipment,
> 9 pages). **Every one of those numbers is uncertified.** In evidence B, 1974's pagination is
> narration-only and its probes came back empty: the 161-count was never independently confirmed
> (`snapshot-1974-equipment.verify.txt` was never read), `1974-page1-firstrow.verify.txt` returned
> empty → NOT-CAPTURED, `1974-50perpage-rowcount.verify.txt` returned empty → NOT-CAPTURED, and
> "Pagination controls (1974)" is listed under B's **Skipped Probes (Walk Hit Time Wall)**.
> Evidence A meanwhile carries a **fully certified** pagination bed (`provenance: live`, two verify
> files) that the plan overlooked. Use it.

1. Author NEW TC: bed **9460 Labor** — certified in evidence A:
   - 212 rows, "212 items found"; default 20/page; **11 pages** (20 × 10 + 12)
   - Page 1 first row = **"Banners Design"**; page 2 first row = **"Candids Video Engineer - FULL DAY"**
     (confirmed different); last page (11) holds 12 rows
   - Go-to-first / prev: **disabled on page 1**, enabled on pages 2+
   - Go-to-next / last: **enabled on page 1**, disabled on the last page
   - Rows-per-page options: **10, 20 (default), 30, 40, 50**; 20→50 shows 50 rows, total 212 unchanged
   Navigate to page 2 → assert first-row identity changes; change rows-per-page 20→50 → assert visible
   row count increases; assert nav-control enablement at both ends.
2. LR-022: do NOT hardcode row counts; use relative assertions (count > previous count, first-row
   identity changes). The certified constants above are for **oracle selection and bed sanity**, not
   for brittle equality assertions — assert the *relationship*, and treat a total-count mismatch as a
   bed-drift signal, not a test failure to paper over.
3. If a live check shows 9460 Labor has drifted from 212 rows, re-derive page count from the live
   total rather than pinning it; record the drift in the execution summary.

---

## Phase 5 — NM-1932 blank Override Price render (BUILDER)

> **PRIMARY/FALLBACK INVERTED 2026-07-20.** The plan made SELF-PRODUCE primary and the read-only bed
> the fallback. That is backwards on the evidence: SELF-PRODUCE needs a save commit that **no walk has
> ever performed** (Phase 2 §0), on precisely the row shape evidence E proves the import path rejects
> (NM-1940: "the exported file contains a row with no Override Price, and the import rejects it —
> only 1 such row in the entire 8,996-row export"), against a shared bed, with no restore-failure
> path defined. The read-only bed meanwhile is the single best-captured artifact in walk B.

1. **PRIMARY — read-only bed 1115 / PG 286 "01D Double Screen Set Kit"** (walk-B certified, verbatim
   DOM capture). Assert the blank Override Price renders as an em-dash. Certified DOM:
   ```json
   { "textContent": "\"—\"",
     "innerHTML": "<div role=\"button\" tabindex=\"0\" class=\"…\"><span class=\"text-muted-foreground\">—</span></div>",
     "isEmpty": false }
   ```
   Note this row is also the office's only **INACTIVE** row (1115 = 9 rows total, 8 active).
2. Assert `textContent === '—'` NOT `textContent === ''` (walk finding — blank Override Price renders
   as em-dash, not empty cell). `innerHTML.includes('text-muted-foreground')` is the equivalent check.
3. **SELF-PRODUCE — deferred, do NOT author in this subplan.** It is gated on Phase 2 §0 first
   establishing save-commit behaviour live. If Phase 2 §0 lands cleanly and time allows, a
   self-produce TC MAY be added — but only with an explicit restore-failure path (capture the original
   value, restore in `finally`, and fail loudly if restore does not verify). Otherwise carry it as an
   LR-040(b) line item into the recipient subplan named in the Execution Summary.

---

## Phase 6 — Volume/virtualization stress (from SHADOW_EDGE)

1. Author NEW TC: bed **9460 Labor** (212 rows / 11 pages — the largest certified bed; 1974 dropped
   per Phase 4) — page through to the last page, verify content-anchored read integrity: read a row on
   page 1, navigate to the last page, return to page 1, verify same row content (LR-022 no hardcoded
   counts — content anchor, not index). Certified anchor: page 1 first row = "Banners Design".

---

## Phase 7 — Grid accessibility (from SHADOW_EDGE)

1. Author NEW TC(s): keyboard navigation on the Override grid — Tab into grid, arrow-key between cells,
   Enter to activate edit, Escape to cancel. ARIA roles on grid/dialogs: grid container has
   appropriate role, editable cells have spinbutton role (walk-A: Override Price = spinbutton).
2. If keyboard nav is not fully functional, record gaps as `blocked-pending-question` per LR-031.

---

## Phase 8 — Add-Override picker: currency-gated drag (BUILDER) [UNBLOCKED 2026-07-17]

**UNBLOCKED 2026-07-17** — the add-override mechanism was live-cracked (evidence D,
`walk-evidence-corporate-pricing-override-2026-07-17-D.md`). There is NO dedicated Add button on
the toolbar; the add affordance is a **currency-gated Product Group Picker** panel that appears in
the left search area ONLY when a specific currency (USD/CAD/MXN, not ALL) is selected for a location.
Add a row by **drag** (`playwright-cli drag <picker-row-ref> <override-tabpanel-ref>`) — this is the
one and only mechanism any walk confirmed (evidence D Step 3).

> **⚠ CORRECTED 2026-07-20 — "double-click" was never confirmed.** The prior revision read "…or by
> **double-click** on a picker row — both mechanisms confirmed (evidence D Steps 3+5+6)". That
> citation does not hold: evidence D Step 3 is the **drag** execution, Step 5 is the post-Discard
> row-count verification (rowCount=1), and Step 6 is the Labor-tab picker check (draggable=430).
> **Double-click appears nowhere in evidence D, nor in A, B, C, E or F.** Do not author a
> double-click TC against this claim. If double-click support is wanted, probe it live first and
> author only on a fresh observation.

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

> **✅ INPUT RECOVERED + PHASE RESOLVED (2026-07-21).** The map was absent from this machine on
> 2026-07-20 (flagged then as an LR-055 C3 gap against the already-closed NM2268). It arrived in the
> `_internal` archive hand-off and is now installed at
> `clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-2026-07-18.md`
> (9,570 bytes; 27 fields mapped == inventory total; Gap 0). NM2268's C3 citation is therefore
> **satisfied** — it was a sync gap on this clone, not a phantom deliverable. No re-derivation was
> performed (that would have masked the gap rather than closed it).
>
> **Disposition: `independent-verified`.** The map records a `depends-on` for all 27 fields and
> **every one is intra-page** — `none` / `Select a location` / `location selected` / `Picker dialog is
> open` / `at least one row checkbox is checked` / `at least one editable cell is dirty` / `a save has
> occurred`. The tokens `strategy`, `detail` and `pricebook` appear **zero** times in the map. There
> are therefore **no Override ↔ Strategy/Detail cross-page edges to author integration tests against**
> — precisely the condition step 2 below defines. Evidence:
> `grep -icE "strategy|detail|pricebook" <map>` → `0`; `grep -oE '\*\*depends-on\*\*: .*' <map> | sort -u`
> → 14 distinct values, all intra-page.

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

**Sweep executed 2026-07-20/21. Six adjacent findings, each with a concrete disposition:**

| # | Finding | Disposition | Verification |
|---|---|---|---|
| A1 | `check:tc-parity` exited 1 on a `CRITICAL` block: 18 `TC-CPR-IMA-*` TCs existed in the passing spec but had **no markdown deliverable** (NM-2265 landed the spec, never the MD). | **DO-NOW** — authored `corporate_pricing_import_all_test_cases.md` (18 TCs, titles verbatim from the spec) + matching test-plan; XLSX rebuilt. | `npm run check:tc-parity` → exit 0, `PASS: All spec TCs are present in both markdown and XLSX deliverable.` |
| A2 | NM2268's dependency-map was cited in a closed plan but absent on this clone (flagged 2026-07-20 as an LR-055 C3 gap). | **RESOLVED** — recovered from the owner's `_internal` archive and installed verbatim; explicitly NOT re-derived (re-deriving would have masked the gap). | `ls clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-2026-07-18.md` → 9,570 bytes |
| A3 | The Override spec was absent from the per-test-baseline registry despite carrying save-capable describes (pre-existing gap; my new Labor save-cycle describe would have widened it). | **DO-NOW** — registered both save-cycle describes as `mechanism: 'fcc'` in `scripts/check-per-test-baseline.mjs`. | `npm run check:per-test-baseline` → `17 registered entr(y/ies) compliant (3 waived, 14 enforced), 0 warning(s)` (was 12 enforced) |
| A4 | Accessibility defects found during the Phase 7 probe: both modal dialogs render `aria-hidden="true"` while visually modal; no arrow-key navigation between grid cells. | **RECORDED per the plan's own Phase 7 rule** — `blocked-pending-question` (LR-031), captured as BUG-CANDIDATEs in the walk-evidence `## Observations` Bugs bucket + as documented non-asserted gaps on TC-CPR-OVR-062. Not filed as `BUG-*.json` (LR-034 confirm-and-minimize pass not run). | `grep -A5 '## Observations' clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-20-SAVE.md` |
| A5 | **`npm run client:ship -- --client=encore` currently ABORTS.** `ship-client.sh` (`set -euo pipefail`) runs `verify-no-forbidden.mjs --client=encore` as its line-34 pre-flight; that check exits 1 because **328 agent-only files are tracked** under `clients/encore/` (its `.env.local`, its `CLAUDE.md`, its `docs/` requirements doc, all of its `specs_planning/`). Since `git archive HEAD` ships tracked files, the gate is correctly refusing an IP leak (LR-049 defense layer 3 working as designed). Pre-existing — those paths were already tracked as of sync commit `3d43c6e`, before this plan's execution. | **HALT + ASK (per this ritual's own rule)** — surfaced to the owner, NOT silently deferred and NOT unilaterally fixed. Resolving it means either `git rm --cached` across 328 files (restoring the per-client gitignore design) or an explicit decision that this repo intentionally tracks them; both are team-wide, hard-to-reverse policy calls outside this plan's contract. | `node scripts/verify-no-forbidden.mjs --client=encore; echo $?` → `1`; `git log --oneline -1 -- clients/encore/.env.local` → `3d43c6e` (pre-dates this plan) |
| A6 | `TC-CPR-OVR-027` (pre-existing NM-2270-era test) flaked once on a `net::ERR_ABORTED` navigation during green-x2 run 1. | **OBSERVED, no verdict** — did not reproduce across runs 2/3/4. Per LR-061 a single unreproduced observation does not support a code-defect verdict, and it is not this plan's test. Recorded here rather than "fixed" speculatively. | run logs under `clients/encore/reports/green-x2/` — appears in run1 only |
| A7 | **A quality gate silently deletes tracked plan files.** `check:browsertool-parity` → `.claude/hooks/lib/test-browsertool-fixtures.mjs` writes 5 `_TEST_BROWSERTOOL_*.md` fixtures into the REAL `plans/pending/` and removes them at cleanup (documented design choice, "Downside: pollutes plans/pending/"). Those fixtures are **committed to git** (as of `3d43c6e`), so merely RUNNING the gate leaves 5 unintended deletions in the working tree — which a closing session could commit without noticing. Caught by the structural fingerprint diff, not by any gate. | **DO-NOW (restore)** — `git checkout --` on all 5; working tree deletions back to 0. The underlying design (test fixtures tracked in `plans/pending/`) is left as a flagged finding for the owner — un-tracking them is a repo-policy change outside this plan. | `git status --porcelain \| grep -c '^ D'` → `0`; `git log --oneline -1` on the five fixture files → `3d43c6e` (tracked, pre-existing; fixtures later deleted in commit 10f73944d) |

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | walk-evidence (live save/guard/a11y probe addendum) | clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-20-SAVE.md<br>(skipped: walkthrough YAML was a per-run execution artifact, not tracked in the repo) | `ls` walk-evidence file; `## Observations` section present with both buckets |
| GIVER | test-cases MD + test-plan MD + XLSX | clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md<br>clients/encore/testcases/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0 |
| BUILDER | corporate-pricing-override spec (post-restructure split) + page object extensions | clients/encore/tests/corporate-override/corporate-override-labor-grid.spec.ts<br>clients/encore/src/pages/corporate-override/corporate-override.page.ts<br>clients/encore/src/data/corporate-override/override.ts | `npx playwright test --list` resolves new TC IDs; spec run green ×2 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |

---

## Acceptance criteria

- [ ] Labor populated grid TC: render + sort + filter with real data on 9460 (212 Labor rows)
- [ ] Phase 2 §0 live save-probe run and its dated `-SAVE.md` addendum written BEFORE any save-cycle TC
- [ ] Editable cell Save-cycle TCs: Override Price / Max Discount % / Active on both tabs (LR-067)
- [ ] Dirty-state guard TC: alertdialog Stay + Discard paths tested (Stay probed live first — unwalked)
- [ ] Pagination TC: page nav + rows-per-page change on **9460 Labor** (212 rows, 11 pages) — NOT 1974
- [ ] NM-1932 TC: blank Override Price renders "—" em-dash on read-only bed 1115 / PG 286
- [ ] Volume/virtualization stress TC: content-anchored read integrity across pages
- [ ] Grid accessibility TC(s): keyboard nav + ARIA roles (or explicit blocked-pending-question)
- [ ] Phase 8 authored against **drag only** — no double-click TC unless separately probed live
- [ ] Cross-field integration TC(s) from dependency-map artifact — OR, if the artifact is absent,
      an LR-040(b) line item in a named PENDING recipient subplan (see Phase 9)
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

## Execution Summary

**Planned**: populated Labor grid + editable save-cycles on both tabs + dirty-state guard + pagination
+ NM-1932 blank render + volume stress + grid accessibility + currency-gated picker/drag + cross-field
integration. **Delivered**: 16 new TCs (TC-CPR-OVR-050…065), all green ×2.

| Deliverable | Status | Path |
|---|---|---|
| TC-050/051/052 — populated Labor grid: render + text filter + column sort on 9460 (212 Labor rows) | DONE | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` |
| TC-053/054/055 — Labor save-cycles: Override Price / Max Discount % / Active, persist + restore | DONE | same spec |
| TC-056/057 — unsaved-changes guard: Stay keeps page+edit, Discard leaves and drops | DONE | same spec |
| TC-058/059 — pagination: nav-button end-states + first-row identity change; rows-per-page 20→50 | DONE | same spec |
| TC-060 — content-anchored round trip across the full page range (volume integrity) | DONE | same spec |
| TC-061 — NM-1932 blank Override Price renders em-dash + muted span (read-only bed 1115/PG 286) | DONE | same spec |
| TC-062 — keyboard: Enter opens editor, Escape cancels without dirtying | DONE | same spec |
| TC-063/064/065 — currency-gated picker; drag staging (no request until Save, 0.00/inactive landing, Discard drops); Labor-tab parity | DONE | same spec |
| Page-object extensions — 15 new methods (pagination ×4, unsaved-guard ×3, keyboard ×2, picker ×3, `getItemsFoundTotal`, tab-aware `ensureDefaultState`) | DONE | `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` |
| Selectors — 9 new (pagination aria-labels, unsaved-dialog scoped by title, picker search + draggable rows) | DONE | `clients/encore/src/selectors/corporate-pricing/override.ts` |
| Data beds — 5 new (Labor mutation, Labor volume, em-dash, picker, unsaved-dialog contract) | DONE | `clients/encore/src/data/corporate-pricing/override.ts` |
| Test-cases MD + test-plan — 16 TC rows + a dated live-verification block | DONE | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md` |
| Phase 2 §0 live save-probe (first Labor save commit in module history) | DONE | `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-20-SAVE.md` (walkthrough YAML was a per-run execution artifact, not tracked) |
| Phase 9 — cross-field integration | `independent-verified` | dependency-map recovered + installed; all 27 fields intra-page, zero Strategy/Detail edges |
| Phase 10 — office alignment | **SKIPPED (PARKED)** — unchanged; requires explicit owner green-light per the plan's own parking note. Not executed, not silently absorbed. | — |
| Adjacent-sweep A1 — 18 `TC-CPR-IMA-*` markdown deliverable restored (cleared a pre-existing parity CRITICAL) | DONE | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_import_all_test_cases.md` (the matching test-plan was authored during execution but not retained in the final commit) |
| Adjacent-sweep A3 — Override spec registered in the per-test-baseline gate | DONE | `scripts/check-per-test-baseline.mjs` |

**Verification** (every command run on the working tree, output quoted):
- `npx playwright test corporate-pricing-override` **green ×2 on the final code** — run 3 `64 passed (13.8m)`, run 4 `64 passed (17.2m)`, **2 skipped, 0 flaky in both**. Artifacts + sha256: `clients/encore/reports/green-x2/run{3,4}-postfix-2026-07-21.log`.
- `npx playwright test --list corporate-pricing-override` → `Total: 66 tests in 2 files`; all 16 new TC IDs resolve.
- `npm run check:tc-parity` → exit 0, `PASS: All spec TCs are present in both markdown and XLSX deliverable.`
- `npm run check:spec-quality` (LR-060 ob.4, working tree) → PASS, 0 findings across all sub-gates.
- `npm run check:per-test-baseline` → `17 registered entr(y/ies) compliant (3 waived, 14 enforced), 0 warning(s)`.
- `npm run check:step-labels` → `PASS … 0 violations`; `check:browsertool-parity` → PASS; `check:lr-embed-parity` → PASS.
- `npm run xlsx:build` → `vocab hits: 0, integrity violations: 0` (16 NM-ref + 2 bare-date hits were stripped at MD source first).
- `npx tsc --noEmit` → clean.
- Structural fingerprint vs `HEAD`: **purely additive** — 15 methods, 9 selectors, 5 data-bed exports added; **zero removals or signature changes**.

**Deviations** (all recorded at their site, marked `CORRECTED 2026-07-20`):
1. Eight plan defects found by auditing the plan **against** the recovered walk evidence, fixed before execution — see the Amendment log. Load-bearing ones: the Phase 8 "double-click confirmed" claim was **fabricated** (present in no walk file) and was removed; the Phase 4 pagination bed was swapped 1974 → 9460 Labor because every 1974 number is NOT-CAPTURED in walk B while 9460 is fully certified in walk A.
2. Phase 2 gained a mandatory live save-probe (§0) because **no walk had ever committed a Save** — A, B and D all close "NO SAVE COMMITS". The probe made the first Labor save commit in the module's history and restored the bed.
3. Phase 3's Stay path was unwalked (both walks only ever clicked Discard); probed live before it was asserted.
4. Phase 5 inverted to the certified read-only bed; self-produce deferred (needs a save on the exact row shape NM-1940 rejects).
5. Two of my own test defects, caught by the runs and fixed rather than retried into green: a stale row-count baseline read before the currency re-render (TC-064), and a 15s navigation budget that flaked on green-x2 run 1 (TC-056 → 30s, matching the page object's existing budget for that operation class). Logged as R-536/R-537.
6. Environment was a fresh clone — `npm ci` (root + client), chromium, and `auth.setup` (automated SSO) were run to make any verification possible at all.

**Known-open, NOT absorbed** (full detail + evidence in Phase 2.5 A4–A7):
- **A5 — `npm run client:ship -- --client=encore` currently ABORTS.** Its `verify-no-forbidden --client=encore` pre-flight exits 1 on 328 tracked agent-only files under `clients/encore/`. Pre-existing as of sync commit `3d43c6e`; the gate is correctly refusing an IP leak. Owner decision required — deliberately not touched here.
- **A7 — `check:browsertool-parity` deletes 5 tracked `_TEST_BROWSERTOOL_*.md` plan files as a side effect of running.** Restored this session; the tracked-fixture design is an owner call.
- **A4 — two accessibility BUG-CANDIDATEs** (both save dialogs `aria-hidden` while visually modal; no arrow-key grid navigation), recorded per Phase 7's own `blocked-pending-question` rule, not filed as `BUG-*.json` (LR-034 confirm-and-minimize pass not run).
- **A6** — `TC-CPR-OVR-027` flaked once (nav abort) in run 1, did not reproduce in runs 2/3/4; no verdict claimed.

---

## Handoff (post-execution)

Chat-only per LR-039. Populated Labor grid, Labor save-cycles, the unsaved-changes guard (both paths),
pagination + volume integrity, the NM-1932 em-dash render, keyboard access, and the currency-gated
picker with drag staging — 16 TCs, green ×2. Phase 9 closed `independent-verified` from the recovered
dependency map; Phase 10 remains PARKED pending owner green-light. NM2272 inherits as the next sprint
ticket, and should be aware the Encore ship path is blocked until A5 is resolved.
