# SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT — Loc Pricing Export real download round-trip + file-content verification

> **⚠ SBC ID correction (2026-06-24):** surface/behavior cases use **ordinary 3-segment IDs** (`TC-CPR-<SUB>-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT** the 4-segment `-SBC-` / `-SBC-MAX-` infix this plan body references (that shape is rejected by `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) + `docs/read_only_docs/CASE_GENERATION_STANDARD.md`.

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-24
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: none
**Blocks**: SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli

---

## Context

Deliverable for Jira NM-2262 — "Automate Location Pricing Export WITH verification of the exported file."
`TC-CPR-TIO-012` (existing) covers the trigger+endpoint only: it asserts `GET …/api/location/pricing/location-export?locale=en-US` fires and returns 200. It never captures a real file, reads its contents, or asserts anything about the CSV structure. This subplan adds the **REAL download round-trip** — `waitForEvent('download')` → save to disk → read/parse CSV → assert filename/extension/non-empty/expected-header/columns — and builds the reusable `LocPricingExportHelper` page-object method that NM-2264 (Export All variants) will reuse. New TC band: **TC-CPR-TIO-018..** (next free TIO numbers after the existing 001–017).

**SOURCE A fold** (from `SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` Phase 2, bullet 6): "Real file round-trip stays in EDGE_P3 — APPEND grep-verifiable line items there (LR-040b)." That note pointed the I/O work to EDGE_P3 as a stub; this dedicated Jira deliverable supersedes that deferral for the Loc Pricing Export slice and owns it end-to-end. The `SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` acceptance criterion "Real file round-trip APPENDed to EDGE_P3" is satisfied by the existence of this targeted subplan: the grep-verifiable line item in EDGE_P3 is the "Export / Import real file I/O round-trip" seed entry whose `Loc Pricing Export` split lands here.

**SOURCE B fold** (from `SUBPLAN_CORP_PRICING_EDGE_P3.md` Phase 1+ seed list): "Export / Import real file I/O round-trip … actual download round-trip (`waitForEvent('download')` + assert file/format per the 4 variants — All Equipment/Labor Pricing/Max Discount) AND real import upload. Needs a download-dir + committed fixture files." This subplan takes ownership of the Loc-Pricing-Export half of that seed item (the `GET …/location-export` endpoint only; the 4-variant gated Export▾ download and real import upload are separate Jira deliverables).

**Walk-evidence confirmation** (walk-evidence-corporate-pricing-2026-06-23.md, §B row B11): `Loc Pricing Export` = direct CSV download `LocationPricebooks_<ts>.csv` via `GET …/api/location/pricing/location-export?locale=en-US` → [200]. No dialog. Unchanged by the 2026-06-10 drift (the gated Year+Currency dialog was adopted ONLY by `Export ▾` / `Import ▾`, NOT by `Loc Pricing Export`). This subplan is the UNCHANGED slice.

---

## Bootstrap

**Identity**: OWNER (multi-identity span: GIVER catalog → BUILDER specs + helper → HEALER first-run → GARDENER helper polish)

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots on all touched files)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/ultracoverage` (Phase 1.2 — full case expansion for the download+file-content surface)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files** (every rule + parent + reference this subplan loads):
- `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent)
- `plans/pending/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE A — fold origin)
- `plans/pending/SUBPLAN_CORP_PRICING_EDGE_P3.md` (SOURCE B — fold origin)
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` (walk evidence — §B row B11 is the canonical live oracle for `Loc Pricing Export`)
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/003/004; LR-036)
- `.claude/rules/specs.md` (LR-019 per-test baseline, LR-061 positive-control)
- `.claude/rules/browser-tool.md` (LR-054 playwright-cli ≠ npx playwright; BrowserTool=cli)
- `.claude/rules/baseline.md` (LR-045; LR-ENC-001 baseline-absent declaration)
- `.claude/rules/pipeline.md` (LR-048 structure; LR-046 strict-line; LR-027 closure)
- `.claude/rules/inventory.md` (LR-062 machine denominator; LR-065 surface behavior-cases)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§3 surface/behavior families)

**Anti-Assumption Gates**:
- [ ] Phase 0.5b baseline — `baselineScope: baseline-absent` declared (net-new feature; Loc Export has no old-site analog that tests file content).
- [ ] No "un-drivable download" claim without consulting LR-054 Table 2 first (`waitForEvent('download')` IS a supported `playwright-cli` / Playwright pattern per test runner; the download helper uses `@playwright/test` page event — consult CLI_BROWSER_GUIDE.md §2 before any capability claim).
- [ ] Mutation safety confirmed — export is read-only; no restore needed; uses stable office 1604 fixture.
- [ ] TC-CPR-TIO-012 endpoint-only behavior NOT re-covered (that TC stays; this band adds the file-I/O layer on top).
- [ ] No silent checkpoint (Gate 6 — LR-060).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on: none` — no predecessor subplan to gate on; proceed directly.
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for `corporate-pricing/toolbar-io` surface; pull listed findings instead of re-exploring. The 2026-06-23 walk-evidence is the canonical live oracle; do NOT re-walk `Loc Pricing Export` unless the evidence is stale (>14 days from execution date).
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter by OWNER / ALL-* entries; pay special attention to download-helper, false-green, and forced-pass patterns.
4. Read `.claude/context/patterns.md` — match decision-tree patterns to download round-trip + file-content assertion subtasks.
5. LR scan — active LRs whose triggers fire: LR-019 (per-test baseline, LR-ENC-001 baseline-absent), LR-054 (CLI vs test-runner distinction), LR-040 (closure-gate), LR-046 (strict-line HALT), LR-048 (structural minimum), LR-ENC-002 (FCC parity), LR-027 (closure), LR-028 (activity-log).
6. **Browser-tool announcement** (LR-038 v2): `BrowserTool=cli`. Reason: spec authoring + helper implementation + first-run execution are all deterministic; no visual/CSS assertion needed; `@playwright/test` `waitForEvent('download')` runs inside the test runner (npx playwright test), NOT inside playwright-cli — consult LR-054 Table 2. The CLI side (playwright-cli) is used ONLY if a live walk-proof is needed; the actual download assertion is a test-runner construct.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

`baselineScope: baseline-absent` — LR-ENC-001. Loc Pricing Export file-content verification is net-new on the active site; no old-site equivalent exists that tests the downloaded CSV structure. The live oracle is the 2026-06-23 walk-evidence §B row B11: `GET …/api/location/pricing/location-export?locale=en-US → [200], direct CSV download LocationPricebooks_<ts>.csv`. Intent oracle: NM-2262 Jira ticket (automate with file verification). No baseline walk required; this declaration is the honest close per LR-ENC-001 (NOT a HALT).

`## Baseline diff`: baseline-absent; intent oracle = NM-2262 Jira + 2026-06-23 walk-evidence §B B11.

---

## Phase 1 — GIVER: catalog the download + file-content surface; expand TC band

1. **Consume SOURCE A + SOURCE B folds** — read SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md Phase 2 bullet 6 and SUBPLAN_CORP_PRICING_EDGE_P3.md §Phase 1+ "Export / Import real file I/O round-trip" seed entry. Confirm this subplan owns the Loc-Pricing-Export half (direct GET, no dialog, no variant gate).
2. **Re-verify walk-evidence oracle** — read `walk-evidence-corporate-pricing-2026-06-23.md` §B row B11; confirm `locale=en-US` param, `LocationPricebooks_<ts>.csv` filename pattern, and 200 status. This is the SOURCE OF TRUTH for endpoint shape; do not re-walk unless artifact is >14 days old.
3. **Run `/ultracoverage`** on the Loc Pricing Export surface: the surface is a file-I/O button (trigger → download → CSV file). Apply `field-case-generation.md` §3 file-I/O family + §2 trigger/affordance cases. Enumerate:
   - **TC-CPR-TIO-018**: Loc Pricing Export `waitForEvent('download')` captures a real file (not just the 200 endpoint; the download event fires and `suggestedFilename` matches `LocationPricebooks_*.csv`).
   - **TC-CPR-TIO-019**: Downloaded file is non-empty (byte count > 0; CSV is parseable).
   - **TC-CPR-TIO-020**: Downloaded CSV contains the expected header row (column names match the live grid: e.g., Location, Product Group, etc. — verify header against a live parse during first run; do NOT hardcode assumed column names until confirmed by a live download at first-run RCA step if they differ).
   - **TC-CPR-TIO-021**: `locale=en-US` param is present in the request URL (request intercepted via `page.waitForRequest` or `waitForEvent('download')` route capture; confirmed from walk-evidence B11).
   - **TC-CPR-TIO-022**: Edge — button is still reachable and fires a new download on a second consecutive click (non-destructive re-trigger; no dialog blocks; no state residue from first download).
   - *(Optional P3 edge — author stub only, not in initial automation)*: Empty dataset behavior (if office 1604 had zero location pricebooks, would the file be empty-but-valid CSV with header only, or a 200 with zero bytes?). Mark `test.skip` with a data-setup note until a suitable empty-state office is confirmed.
4. **Author the TC-MD entries** (TC-CPR-TIO-018..022+) in `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md` — append after TC-CPR-TIO-017. Each entry: Priority / Status / Type table, Depends_On, Automatable, Preconditions, Steps, Expected, Data.
5. **Update test-plan** to include the new TC IDs in the toolbar-io scenario band.
6. **Rebuild XLSX deliverable** via `npm run xlsx:build` (or the `planner:post-complete` alias) after TC-MD is authored — LR-ENC-002 structural enforcement.
7. **Run `npm run check:tc-parity`** — must exit 0 before GIVER work is considered done.

---

## Phase 1b — Axis-2 Surface-Family Ultracoverage (Case-Generation Standard — the 7 families)

> **Why this phase exists:** Axis-1 cases cover one control at a time. The
> [Case-Generation Standard](../../docs/read_only_docs/CASE_GENERATION_STANDARD.md) Axis 2 (7 active surface
> families) covers behaviors that live *between* cells — result-fidelity, pagination, sorting, combination,
> render-state, empty/volume, persistence. Apply only families whose **trigger** holds; record an inapplicable
> family as `out-of-scope:<family>=<reason ≥20 chars>` per LR-065. The execution walk confirms each trigger live
> (LR-064). **These dispositions FOLD INTO the LR-062 100% completeness gate** — a surface with no
> `behavior-cases:` disposition is undispositioned = closure-gate Cx FAIL. SBC TCs ride `check:tc-parity`; no
> separate surface-parity script. Encore oracles per `field-case-generation.md` §3. QUICK = `TC-CPR-TIO-SBC-*`
> (L1 must-assert); DEEP = `TC-CPR-TIO-SBC-MAX-*` (L2/L3 exhaustive). Number within the SBC band at execution by
> reading the live MD/spec for the next free SBC number; scope each TC title by surface ("Loc Export") to avoid
> collision with the other toolbar-I/O surfaces sharing the TIO page band.

Loc Pricing Export is a file-I/O action (trigger → CSV download), not a query grid: result-fidelity (the exported file IS the result of the dataset) + empty-vol apply; pagination / sorting / combination / render-state / persistence are out-of-scope (the export is a parameterless full-dataset GET — `locale=en-US` only per walk-evidence B11 — with no grid state composing into the file).

| Family | Trigger | QUICK (`-SBC-`) must-assert | DEEP (`-SBC-MAX-`) exhaustive | Encore oracle |
|---|---|---|---|---|
| result-fidelity | the exported file is the result of the grid dataset | file non-empty + expected header columns (promotes TC-CPR-TIO-019/020) | exported CSV content matches the live grid rows (the round-trip oracle); row count reflects the dataset; value-format fidelity (currency in CSV) | the file is the oracle; `locale=en-US` param (B11); header columns confirmed from a LIVE parse at first run, never hardcoded |
| empty-vol | empty dataset vs large dataset | a non-empty file with ≥1 data row (promotes TC-CPR-TIO-020 rowCount>0) | empty-state office → header-only-but-valid CSV vs zero-byte (promotes the TIO-023 empty-dataset stub); large-dataset export completes without truncation | office 1604 has ≥1 row; the empty-state case needs a confirmed empty office (data-setup note) |

**Out-of-scope dispositions (LR-065 token — reason ≥20 chars; execution confirms the export ignores grid state):**
- `out-of-scope:pagination=Loc Pricing Export is a single full-dataset CSV GET with no rows-per-page control on the action; grid paging does not affect the exported file`
- `out-of-scope:sorting=the export endpoint emits a server-ordered CSV; grid sort is not a request parameter, so there is no sort behavior on the export surface to assert`
- `out-of-scope:combination=Loc Pricing Export is a parameterless full-dataset GET (locale only per B11); active grid filter/sort/paginate state does not compose into the exported file`
- `out-of-scope:render-state=Loc Pricing Export is a toolbar action button, not a cell-rendering grid; CSV value-format fidelity is covered under result-fidelity, not link/boolean render cells`
- `out-of-scope:persistence=the export is a stateless read-only download with no persisted UI state (no sort/filter/page setting on the action) to survive reload`

**Disposition rule:** at execution, the Loc Pricing Export surface carries a `behavior-cases:<families>` disposition (LR-065) — result-fidelity + empty-vol covered (each ≥1 QUICK SBC TC), the other five carrying their `out-of-scope:<family>=<reason>` tokens. Leaving it undispositioned DENIES closure (LR-062 Cx). The DEEP `-SBC-MAX-` band is authored to full exhaustion per the Standard L2/L3 (this is `/ultracoverage`).

## Phase 2 — BUILDER: build the reusable download helper + spec

### 2.1 — Download helper (reusable by NM-2264)

Author `LocPricingExportHelper` as a method on the existing `CorporatePricingSearchPage` (or as a standalone util at `clients/encore/src/utils/download-helper.ts` if the method grows to >~60 lines). Design for reuse by NM-2264 (Export All variants):

```typescript
// Suggested signature (adjust to match project conventions)
async downloadLocPricingExport(page: Page): Promise<{
  filename: string;
  content: string;         // raw CSV text
  headers: string[];       // parsed first row
  rowCount: number;        // number of data rows (excludes header)
}> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('<Loc Pricing Export button selector>').click(),
  ]);
  const path = await download.path();
  const content = fs.readFileSync(path!, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  return {
    filename: download.suggestedFilename(),
    content,
    headers: lines[0]?.split(',').map(h => h.trim()) ?? [],
    rowCount: lines.length - 1,
  };
}
```

- Helper design goal: NM-2264 calls the SAME helper per variant, passing only the variant label (e.g., `'All Equipment Pricing'`) as a parameter — the gated Export▾ flow adds the Year+Currency gate steps before delegating to the same file-read/parse logic.
- Use `fs.readFileSync` synchronously after `await download.path()` (path resolves only after the download completes). Import `fs` from `'node:fs'`.
- Download path is a temp path; the helper returns the parsed content, not the path (callers should not hold onto a temp path).

### 2.2 — Selector

Confirm or add the `Loc Pricing Export` button selector to `clients/encore/src/selectors/corporate-pricing/pricing.ts` (check existing file first — avoid duplication). Walk-evidence B11 confirms it is a toolbar button with visible text "Loc Pricing Export"; use `button:has-text("Loc Pricing Export")` or the project's testid pattern if one exists. Consult `clients/encore/src/selectors/` before adding.

### 2.3 — Spec block

Author TC-CPR-TIO-018..022+ in `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`, appended after TC-CPR-TIO-017:

```typescript
test.describe('Loc Pricing Export — real file round-trip (NM-2262)', () => {
  // TC-CPR-TIO-018
  test('TC-CPR-TIO-018: Loc Pricing Export triggers a real file download with the expected filename pattern', async ({ corporatePricingSearchPage: p }) => {
    const result = await p.downloadLocPricingExport(p.page);
    expect(result.filename).toMatch(/^LocationPricebooks_.*\.csv$/);
  });

  // TC-CPR-TIO-019
  test('TC-CPR-TIO-019: Downloaded Loc Pricing Export file is non-empty and parseable as CSV', async ({ corporatePricingSearchPage: p }) => {
    const result = await p.downloadLocPricingExport(p.page);
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.headers.length).toBeGreaterThan(0);
  });

  // TC-CPR-TIO-020
  test('TC-CPR-TIO-020: Downloaded CSV contains the expected header columns', async ({ corporatePricingSearchPage: p }) => {
    const result = await p.downloadLocPricingExport(p.page);
    // Verify header columns — actual column names confirmed at first run against live CSV.
    // Update EXPECTED_HEADERS constant after first-run confirmation (Phase 3 RCA step).
    expect(result.headers.length).toBeGreaterThan(0);
    expect(result.rowCount).toBeGreaterThan(0); // office 1604 must have ≥1 location pricebook row
  });

  // TC-CPR-TIO-021
  test('TC-CPR-TIO-021: Loc Pricing Export request includes locale=en-US param', async ({ corporatePricingSearchPage: p }) => {
    const [request] = await Promise.all([
      p.page.waitForRequest(req => req.url().includes('location-export') && req.url().includes('locale=en-US')),
      p.clickLocPricingExport(), // or inline click via selector
    ]);
    expect(request.url()).toContain('locale=en-US');
  });

  // TC-CPR-TIO-022
  test('TC-CPR-TIO-022: Loc Pricing Export fires a fresh download on a second consecutive click', async ({ corporatePricingSearchPage: p }) => {
    const r1 = await p.downloadLocPricingExport(p.page);
    const r2 = await p.downloadLocPricingExport(p.page);
    expect(r2.filename).toMatch(/^LocationPricebooks_.*\.csv$/);
    expect(r2.content.length).toBeGreaterThan(0);
  });
});
```

- Each test uses per-test baseline (LR-019): navigate fresh to the search page before each test via the fixture; do NOT rely on shared state between tests.
- `test.setTimeout(30_000)` on download tests (network round-trip + write to temp path).
- Empty-dataset edge (TC-CPR-TIO-023 stub): `test.skip(true, 'Requires empty-location-pricebook office — data setup not confirmed; see NM-2262 note.')`.

### 2.4 — TC-CPR-TIO-012 re-verify (SOURCE A fold — endpoint UNCHANGED)

TC-CPR-TIO-012 covers the endpoint-trigger only (direct CSV `location-export`, UNCHANGED by 2026-06-10 drift). Confirm it is still green after the new helper is wired — it must remain GREEN (it tests a different assertion layer: the 200 response, not the file content). Do NOT modify TC-CPR-TIO-012's assertion; it stays as the fast smoke check.

---

## Phase 3 — HEALER: first-run RCA (conditional)

On first run of TC-CPR-TIO-018..022+:
1. Read `failure-summary.json` BEFORE any re-run (LR-024 / `feedback_read_artifacts_before_rerun.md`).
2. Classify failure by artifact evidence: selector miss → update selector; download path null → check `download.path()` call order (must await before `readFileSync`); header mismatch → read the actual first line from the downloaded CSV and update the `EXPECTED_HEADERS` constant accordingly (do NOT hardcode assumed column names that weren't confirmed from a live file).
3. After confirming the actual CSV headers from a live first run, update TC-CPR-TIO-020 to assert the exact header columns (replace the placeholder comment with `const EXPECTED_HEADERS = ['Location', ...]`).
4. Suspicious behavior (e.g., 200 but zero-byte file, `suggestedFilename` empty, `download.path()` returns null) → file via `/encore-questions` per LR-034/LR-044 before asserting.
5. Run the individual spec first: `npx playwright test corporate-pricing-toolbar-io --grep "NM-2262" --workers=1 --retries=0`; confirm green before running the full suite.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For each adjacent fix noticed during Phase 1+/Phase 2 that is OWNER-scoped + same file/module + ≤30 min + no user input needed, pick exactly one disposition:

- **DO-NOW** — execute before Phase 3.5 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — add a grep-verifiable line item to a named pending subplan; verify with `grep -F "<line>" plans/pending/<file>` before continuing.

Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (LR-040 + LR-046).

Candidates to evaluate:
- The `LocPricingImportHelper` (TC-CPR-TIO-013's dialog) — if the helper naturally extends to an upload-fixture variant, DO-NOW is fine if ≤30 min; otherwise SPAWN.
- Any selector consolidation in `clients/encore/src/selectors/corporate-pricing/pricing.ts` observed while adding the Loc Export selector — DO-NOW if trivial; APPEND to SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION if non-trivial.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — baseline-absent declared; walk-evidence 2026-06-23 is the oracle; no new baseline walk required) | (none) | (none) |
| GIVER | test-cases MD + test-plan + XLSX workbook | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec (new TC block) + download helper + selector | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts`<br>`clients/encore/src/selectors/corporate-pricing/pricing.ts` | `npx playwright test corporate-pricing-toolbar-io --grep "NM-2262" --workers=1` green |
| HEALER | first-run fixes (conditional) | `(skipped: conditional — only if first-run reds; replaced at close with the fixed spec path if HEALER work was needed, else (none))` | `npx playwright test corporate-pricing-toolbar-io --workers=1` green ×2 |
| WATCHDOG | (none — closure audit is parent plan's do-or-die audit step) | (none) | (none) |
| GARDENER | (none — helper polish deferred to NM-2264 if reuse refactor is needed; Phase 2.5 Adjacent-Sweep decides) | (none) | (none) |
| OWNER | closure ceremony + handoff | `(skipped: closure ceremony only — deliverables are the GIVER/BUILDER artifacts above; handoff is chat-only per LR-039)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] TC-CPR-TIO-018..022 green ×2 consecutive runs on office 1604 (`npx playwright test corporate-pricing-toolbar-io --grep "NM-2262" --workers=1`).
- [ ] TC-CPR-TIO-012 (endpoint-only re-verify) still green — UNCHANGED behavior confirmed, not regressed.
- [ ] Real file asserted (not just 200 endpoint): at minimum `filename` matches pattern, `content.length > 0`, `headers.length > 0`, `rowCount > 0` — these are the non-negotiable file-content assertions that TC-CPR-TIO-012 does NOT provide.
- [ ] `locale=en-US` param captured in TC-CPR-TIO-021 from a real network intercept (not mocked).
- [ ] `LocPricingExportHelper` exists in `corporate-pricing-search.page.ts` (or `src/utils/download-helper.ts`) with a documented return type; NM-2264 can call it without modification to the core download+parse logic.
- [ ] `npm run check:tc-parity` exit 0 — TC-MD and spec IDs are in sync; no orphaned IDs.
- [ ] `npm run xlsx:lint` exit 0 (or `npm run xlsx:build` exit 0 if lint is not a separate script) — XLSX freshness gate.
- [ ] `npm run typecheck` clean on all touched files.
- [ ] Every fold item present: SOURCE A endpoint re-verify (TC-CPR-TIO-012 green) + SOURCE B real I/O round-trip (TC-CPR-TIO-018..022 green + helper authored).
- [ ] **Axis-2 surface families dispositioned (LR-065 → LR-062 Cx)**: the Loc Pricing Export surface carries a `behavior-cases:` disposition for all 7 families — result-fidelity + empty-vol each ≥1 QUICK `TC-CPR-TIO-SBC-*` + full DEEP `TC-CPR-TIO-SBC-MAX-*` (result-fidelity DEEP = exported-content-matches-grid round-trip); pagination/sorting/combination/render-state/persistence each an `out-of-scope:<family>=<reason ≥20 chars>` token.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] Do-or-die audit (parent plan's WATCHDOG step) passes — no false-green, no forced assertions.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
# Full toolbar-io suite — expect all green (018..022 new; 012 re-verified)
npx playwright test corporate-pricing-toolbar-io --workers=1 --retries=0
# expect: all green, no skips except the data-blocked empty-dataset stub

# TC parity — expect exit 0
npm run check:tc-parity
# expect: exit 0, no orphaned TC IDs

# Typecheck
npm run typecheck
# expect: 0 errors

# Helper exists
grep -F "downloadLocPricingExport" clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts
# expect: at least one match (the method signature)

# New TC IDs in spec
grep -F "TC-CPR-TIO-018" clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts
# expect: match found
```

---

## Handoff (post-execution — chat-only per LR-039)

The download round-trip for `Loc Pricing Export` is fully automated: `LocPricingExportHelper` lives in the search page object, returns a typed `{filename, content, headers, rowCount}` struct, and is covered by TC-CPR-TIO-018..022 green ×2. The helper is the primary handoff to NM-2264 (Export All): the NM-2264 subplan calls `downloadLocPricingExport` after completing the Year+Currency gate steps for each of the 4 Export▾ variants — the core download+parse logic requires no modification. TC-CPR-TIO-012 (endpoint smoke) remains green and is deliberately NOT subsumed — it is the fast CI smoke check; the new band provides the file-content layer above it.
