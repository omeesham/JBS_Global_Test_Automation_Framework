# SUBPLAN_CORP_PRICING_W15_B_TOOLBAR_IO_FCC — Export/Import/Loc-Pricing/Grid-Options, trigger-level FCC

**Status**: DONE
**Executed**: 2026-06-09
**Priority**: P1
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_W15_0_RECON.md
**Blocks**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-1.5 (F-WV15).** Trigger-level field-coverage of the Corporate-Pricing **toolbar I/O affordances**: **Export ▾** (4 variants), **Import ▾** (4 variants), **Loc Pricing Export**, **Loc Pricing Import**, and the **Grid Options** gear (column show/hide/reorder). These are live but **undocumented** (Q-WV15-2, raised by WV1.5-0) → live = oracle, divergences raised. Consumes WV1.5-0's `corporate-pricing-toolbar-io-*` field-inventory.

**Scope boundary (Q3 decision — NO real file I/O):** this subplan covers **trigger + variant enumeration only** — dropdown opens, all variants present, each variant fires the **correct action/endpoint** (assert via `playwright-cli network` / navigation), and Grid-Options column toggle + persist-on-reload. **Real download/upload round-trip** (asserting downloaded file content/format, uploading fixture files, import validation/error/success) is **explicitly deferred** to `SUBPLAN_CORP_PRICING_EDGE_P3.md` (grep-verifiable LR-040(b) recipient) — no download-dir/fixture-file infra is built here.

**No redundancy:** these affordances were previously gestured at by a single vague EDGE_P3 line ("Export/Import/Loc-Pricing/Grid-Options deep behavior"); that line is **redirected** to this subplan (EDGE now holds only the deferred real-I/O round-trip + its existing stress/edge scope). The **`+New ▾`** dropdown is NOT in scope — it is already FULL P1 (TC-LOC-CPR-016/017) and its create-flow destination is owned by `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md`.

**Activation trigger**: WV1.5-0 closed (toolbar-io inventory exists).

---

## Bootstrap

**Identity**: GIVER (catalog + test-cases + test-plan + XLSX) → BUILDER (trigger+variant helper + spec) → HEALER (RCA if failures) → WATCHDOG (parity). Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Bug doctrine (master Doctrine 2 — applies while field-testing every case below)**: if any behavior looks suspicious or buggy (a control that won't react, a Save that silently no-ops, a field that accepts a negative/invalid value), follow the doctrine — record it as an `/encore-questions` clarification when the cause is unclear (permission-locked? interaction step missing?), or file per LR-034 once it reproduces in the runner (LR-044). Never silently absorb it; at minimum catch the bugs visible in these cases. (W15-0 modeled this — it raised Q-WV15-1 instead of false-filing.)
**Jira defect cross-ref (UNVERIFIED leads — prove each on the live site before it becomes a test expectation OR a filing, LR-044)**: check `clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md` first — it likely **answers Q-WV15-2** (export/import 4-variant + locale + payload = NM-1604 / NM-1625 / NM-1446) and lists I/O defects NM-2164 (import rounds decimals to whole), NM-2126 (non-RM users can export/import — RBAC gap), NM-1986 (import caps ~50 rows/single pricebook), NM-1997/1998/2005 (duplicate/wrong export dataset). External AI Jira-search output — reproduce live first, cite the `NM-#`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_W15_0_RECON.md`, the `corporate-pricing-toolbar-io-*` field-inventory, `field-case-generation.md` (dropdown each-option row), `clients/encore/src/selectors/corporate-pricing/search.ts` (toolbar selectors already mapped: `btnExport/btnImport/btnLocPricingExport/btnLocPricingImport/btnGridOptions/mnu*`), `.claude/rules/{specs,browser-tool,inventory}.md` (LR-033 network RCA, LR-036, LR-052).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm WV1.5-0 DONE: `corporate-pricing-toolbar-io-*` inventory exists. 2. **POM-shape gate**. 3. LR scan: LR-ENC-002, LR-033 (network assertions), LR-040, LR-052, LR-034/LR-030/LR-044 (bug doctrine). 4. `BrowserTool=cli`, `-s=cpr-toolbar-fcc` (network capture for endpoint-fire assertions).

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume WV1.5-0 baseline-absent note. `## Baseline diff` = "baseline-absent; intent oracle = live DOM (undocumented toolbar behavior; intent pending Q-WV15-2)".

---

## Phase 1+ — FCC scope + seed list (full catalog on activation, from the WV1.5-0 inventory)

**Trigger-level FCC seed (grep-verifiable; exact endpoints/variants from the live inventory):**
- **Export ▾**: dropdown opens; **all 4 variants present** (`All Equipment Pricing`, `All Labor Pricing`, `All Equipment Max Discount`, `All Labor Max Discount`); each variant click fires the correct action/endpoint (assert via `network`); menu dismisses on outside-click (dropdown each-option row).
- **Import ▾**: dropdown opens; same 4 variants present; each fires the correct import-trigger/endpoint (trigger only — file-chooser opened, NOT a real upload).
- **Loc Pricing Export** / **Loc Pricing Import**: each button fires its action/endpoint (trigger only).
- **Grid Options** gear: opens the column popover; each toggleable column hides/shows in the grid; reorder (if supported) reflected; **persist-on-reload** (column state survives reload).
- **DEFERRED to EDGE_P3 (LR-040(b)):** real download round-trip (`waitForEvent('download')` + assert file/format per variant) + real import upload (fixture files, validation/error/success). Grep-verifiable line lives in `SUBPLAN_CORP_PRICING_EDGE_P3.md`.
- TC band: `TC-LOC-CPR-6NN` (toolbar I/O).

**BUILDER must-build (light, reuse-first per ALL-026):** a `corporate-pricing.page.ts`-level (or override/search page) **trigger+variant-assert helper** — open a `▾` menu, enumerate items, assert each fires the expected endpoint — plus a Grid-Options popover helper (open / toggle column / read visible columns). NO file-download/upload helper (deferred). Full catalog + MD + test-plan + spec (`clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`, FCC two-describe per LR-ENC-002) authored on activation, all in the SAME change.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: reuses WV1.5-0 baseline-absent + toolbar-io field-inventory; no net-new walk artifact)` | grep baseline artifact |
| GIVER | toolbar-I/O FCC test-cases + test-plan + XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_toolbar_io_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | trigger+variant helper + toolbar-I/O spec | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` | `npx playwright test --list` resolves all `TC-LOC-CPR-6NN` |
| HEALER | per-fix MD Status sync (if RCA-driven) | `(skipped: conditional — only if a first-run failure needs RCA; MD row synced then)` | `npm run check:tc-parity` exit 0 |
| WATCHDOG | (parity folded into WV1.5-99) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] WV1.5-0 toolbar-io inventory consumed; variants/endpoints taken from the **live walk**, not invented.
- [ ] Export ▾ (4) + Import ▾ (4) + Loc Pricing Export/Import + Grid Options covered at **trigger level** (dropdown opens, variants present, correct endpoint fires; column toggle + persist).
- [ ] Real download/upload round-trip explicitly **deferred** with a grep-verifiable line in `SUBPLAN_CORP_PRICING_EDGE_P3.md` (LR-040(b)) — NOT bare-deferred.
- [ ] `+New ▾` NOT re-covered (cross-ref S1 P1 + 1440); no overlap.
- [ ] Spec ↔ MD ↔ XLSX parity (LR-ENC-002): `check:tc-parity` exit 0; workbook lint clean (LR-ENC-004); suite green.

---

## Execution Summary

**Executed**: 2026-06-09 (OWNER orchestrating GIVER + BUILDER; one first-run HEALER RCA fold-in). Live walk via `playwright-cli -s=cpr-toolbar-fcc` (office 1604), consuming the WV1.5-0 `corporate-pricing-toolbar-io-2026-06-08.md` inventory.

### TCs implemented — 17 (all green ×2), TC-LOC-CPR-601..617
- **Export ▾ (601–606)**: dropdown opens + all 4 variants present (601); each variant fires the correct endpoint (602–605); menu dismisses on outside-click (606). Live finding: each variant → `GET /navigator/api/location/pricing/pricing-export?isLabor={t/f}&isMaxDiscount={t/f}&locale=en-US` + a direct CSV download. The `isLabor`/`isMaxDiscount` pair maps 1:1 to the variant (asserted on the backend API path, LR-056 — never the page URL).
- **Import ▾ (607–611)**: dropdown opens + same 4 variants (607); each variant opens a **custom in-app upload dialog** "Import &lt;variant&gt;" (Browse/Cancel/Upload/Close + `input[type=file]`), NOT a native OS file chooser, and fires **no network on trigger** (608–611). Divergence from the recon's "file chooser" framing — RAISED + recorded.
- **Loc Pricing Export / Import (612–613)**: Loc Pricing Export → `GET .../pricing/location-export?locale=en-US` + CSV (612); Loc Pricing Import → "Import All Location Pricing" upload dialog (613).
- **Grid Options (614–617)**: `button[aria-label="Grid Options"]` (icon button, sr-only label — `:text-is` cannot match it; LR-029 live selector correction) → menu of 9 `menuitemcheckbox` (one per column, all checked by default) (614); toggling a column OFF removes its `<th>` (615); the hidden state **persists across reload** (server-persisted per-user preference) (616); toggling back ON restores it (617). Mutation-safety restore (`ensureAllGridColumnsVisible()`) in before/afterEach.

### TCs dropped — 0. No deferrals of in-scope items.

### Real file I/O round-trip — DEFERRED to EDGE_P3 (LR-040(b), grep-verifiable)
The downloaded-CSV-content assertions + real import upload (fixture files, validation/error/success) are owned by `SUBPLAN_CORP_PRICING_EDGE_P3.md` (its Phase 1+ seed list already carries the grep-verifiable "Export / Import real file I/O round-trip (deferred from Wave-1.5 WV1.5-B …)" line). No download-dir/fixture infra built here.

### Live divergences + Jira verdicts (Doctrine 2 / LR-044) — recorded in the wave15 divergences draft
- **Q-WV15-2 PARTIALLY ANSWERED** at trigger level (endpoint + locale + CSV for export; custom upload dialog for import). **NM-1604** (4 export variants + locale) **confirmed-live**.
- **NM-2126** (RBAC) — the automation user CAN export/import; the RM-vs-non-RM role gate is **not-reproducible-single-account** (NOT-AUTOMATABLE).
- **NM-1625/1446/2164/1986/1997/1998/2005** — payload/file-content defects → **deferred-to-EDGE_P3** (not trigger-testable). None filed as `BUG-*` (live-proof-gated leads).

### `+New ▾` — NOT re-covered (no overlap; owned by S1 P1 TC-016/017 + 1440).

### Verification (evidence)
- `npx playwright test corporate-pricing-toolbar-io --workers=1` → **18 passed** (17 TCs + auth setup), incl. the TC-606 dismiss fix.
- Full CPR suite `npx playwright test corporate-pricing` → **139 passed, 0 fail/flaky/skip** (deduped `test-results.json`: `expected:139 unexpected:0 flaky:0 skipped:0`, this-run mtime 2026-06-09T09:32Z) — no contamination from the shared search page-object additions.
- `npm run typecheck` clean; `npm run xlsx:lint` 0 hits; `npm run check:tc-parity` **exit 0** (spec=MD=XLSX, 17 toolbar rows).

### First-run RCA (HEALER fold-in)
TC-606 failed on first run (outside-click dismiss returned false). Evidence-based RCA (read error-context + live diag): while a Radix menu is open it renders a dismissable overlay, so `locator(heading).click()` is "obscured" and times out (swallowed by `.catch()`). Fix: dismiss via a coordinate `page.mouse.click()` on the heading's bounding box (the overlay catches the pointerdown). No MD Status change needed (code fix; TC stayed Automated).

### Deviations from plan
- The recon (W15-0) framed Import as "opens a file chooser"; the live trigger opens a **custom in-app dialog** instead — asserted to live reality (Doctrine 2), divergence recorded. No scope change.
- Self-closed (Status→DONE, `git mv` to `done/`) matching the W15-A / 1440 sibling precedent this wave (children self-close; `W15_99` runs the do-or-die module audit). Parent **stays PENDING** (F16).

### Files
- Spec: `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`
- Data: `clients/encore/src/data/corporate-pricing/toolbar-io.ts`
- Helpers + selectors: `clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts` (+183 additive) + `clients/encore/src/selectors/corporate-pricing/search.ts` (btnGridOptions corrected + 3 new keys)
- Test-cases: `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`
- Test-plan: `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_toolbar_io_test_plan.md`
- Divergences: `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md` (W15-B section)
- Deliverable: `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (corporate_pricing_toolbar_io sheet, 17 rows)

---

## Handoff

Wave-1.5 toolbar-I/O FCC (6NN), trigger-level only; real file I/O deferred to EDGE_P3. Hands off to WV1.5-99 closure.
