# SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL — Export ▾ 4-variant drift-fix + real download round-trip

> **⚠ SBC ID correction (2026-06-24):** surface/behavior cases use **ordinary 3-segment IDs** (`TC-CPR-<SUB>-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT** the 4-segment `-SBC-` / `-SBC-MAX-` infix this plan body references (that shape is rejected by `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) + `docs/read_only_docs/CASE_GENERATION_STANDARD.md`.

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-24
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli

---

## Context

Delivers [NM-2264](https://encore.atlassian.net/browse/NM-2264) — "Automate Pricing Export All."
Folds two source artifacts:

**SOURCE A — `SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` Export ▾ DRIFT-FIX**: the 10 stale
`TC-CPR-TIO-*` Export tests (001–006 + any Export-adjacent) were written against a contract that no
longer exists. The live-walk evidence (`walk-evidence-corporate-pricing-2026-06-23.md` B2–B6) proves
that all 4 Export ▾ variants now open a shared Year(s)(1–3)+Currency precondition dialog (Continue
disabled until both fields set) — then on Continue a single `GET
…/api/location/pricing/pricing-export?isLabor=&isMaxDiscount=&currencyId=&years=` [200] fires
with the variant-specific `isLabor`/`isMaxDiscount` flags and the gate-chosen `currencyId`+`years`
params. No direct-fire, no separate per-variant endpoints, no old contract. All stale TCs must be
corrected to this new contract.

**SOURCE B — `SUBPLAN_CORP_PRICING_EDGE_P3.md` real file-I/O round-trip slice**: the EDGE_P3 stub
designated the "actual download round-trip per variant via `waitForEvent('download')` + assert
file/format for each of the 4 variants" as the heavy I/O slice — that slice is now fully owned here
for all 4 Export ▾ variants: All Equipment Pricing, All Labor Pricing, All Equipment Max Discount,
All Labor Max Discount. EDGE_P3's STUB remains in place (it is the last gating child of the master);
this subplan is a DECLARED grepping recipient for that deferred I/O work (LR-040(b)).

**NM-2262 download helper reuse**: `SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md` builds the download
helper (Playwright `waitForEvent('download')` wrapper, filename-pattern matchers, CSV-header
assertions) used by the Loc Pricing Export path. This subplan inherits and extends that helper for
the 4 gated Export ▾ variants (same infra, different precondition dialog + params). The
`Depends on` frontmatter reflects the mandatory sequencing.

---

## Bootstrap

**Identity**: OWNER (multi-identity span: GIVER → BUILDER → HEALER; OWNER short-circuits §2 per
LR-043)

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots of touched files)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/ultracoverage` (core — full coverage of Export ▾ 4 variants per NM-2264)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent)
- `plans/pending/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE A — drift-fix contract)
- `plans/pending/SUBPLAN_CORP_PRICING_EDGE_P3.md` (SOURCE B — real I/O round-trip seed)
- `plans/pending/SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md` (download helper Depends-on)
- `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` (live
  evidence rows B1–B6 for the Year+Currency gate + POST-CONTINUE network contract)
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/003/004; LR-036; LR-008; LR-012; LR-017)
- `.claude/rules/specs.md` (LR-019 per-test baseline; LR-061 positive-control)
- `.claude/rules/angular.md` (LR-009 net-zero / dirty-state guard)
- `.claude/rules/browser-tool.md` (LR-054; CLI-vs-Chrome matrix)
- `.claude/rules/pipeline.md` (LR-041; LR-046; LR-048; LR-060)
- `.claude/rules/inventory.md` (LR-062; LR-064; LR-065)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (§3 surface/behavior families)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership; ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-034; LR-040; LR-044; LR-049; LR-054; LR-059)

**Anti-Assumption Gates**:
- [ ] Phase 0.5b declares `baselineScope: baseline-absent` (Export ▾ dialog is a new-site-only
  contract; no equivalent old-site behavior — LR-ENC-001 baseline-absent path).
- [ ] No "control un-drivable" classification without overlay-clear + reload + positive-control
  (Gate 3 — LR-061).
- [ ] Un-skip + LR-019 harden applied atomically in the same change (Gate 5 — LR-021 corollary).
- [ ] All phases complete OR user-signed `## Deferral Authorization` block — no silent PENDING
  checkpoint (Gate 6 — LR-060).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md` is in `plans/done/` (or `plans/pending/`
   with its download helper artifacts already committed and importable). If PENDING without the
   helper artifact, HALT and ask user before proceeding.
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for `corporate-pricing /
   toolbar / Export ▾`; pull listed findings instead of re-exploring. The 2026-06-23 walk-evidence
   (B1–B6) is the canonical finding for this surface.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter OWNER + BUILDER +
   HEALER rows; specifically check for any GEN-B7 (sr-only), toolbar-io staleness patterns, or
   download assertion pitfalls.
4. Read `.claude/context/patterns.md` — match decision-tree patterns for download-assertion,
   network-intercept, and dialog-interaction subtasks.
5. LR scan — every active LR rule whose trigger fires here: LR-019, LR-040, LR-041, LR-046,
   LR-048, LR-054, LR-059, LR-060, LR-061, LR-062, LR-ENC-001, LR-ENC-002.
6. **Browser-tool announcement** (LR-038 v2 / LR-054): `BrowserTool=cli`. Reason: functional
   spec-fix + download-round-trip assertions; deterministic, unattended; `playwright-cli network`
   captures the `pricing-export` GET + params; no visual/CSS rows. Consult LR-054 Table 2 before
   any capability claim about `playwright-cli` vs `npx playwright`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

`baselineScope: baseline-absent` per LR-ENC-001. The Export ▾ Year+Currency precondition dialog is
a new-site-only design with no equivalent old-site Navigator UI behavior. The 2026-06-23
walk-evidence (`walk-evidence-corporate-pricing-2026-06-23.md` rows B1–B6) is the sole truth source
for this surface. No old-site walk required; no `## Baseline diff` needed. The LR-ENC-001 clause
explicitly authorizes this declaration without HALT.

---

## Phase 1 — GIVER: correct the stale TC-CPR-TIO Export tests + author new round-trip TCs

### 1.1 — Identify drifted TC-CPR-TIO Export tests

The following TCs were authored against the old contract (direct-fire on Export variant click, no
dialog). They are DRIFTED-RED against the current app and must be corrected:

- **TC-CPR-TIO-001** — "Export ▾ opens and lists all 4 export variants" — precondition-level; can
  be KEPT but must be verified against current menu behavior (B1: 4 menuitems present). Correct title
  and steps if stale.
- **TC-CPR-TIO-002** — "Export 'All Equipment Pricing' fires the equipment-pricing export endpoint"
  — DRIFTED: no longer a direct-click-to-request. Must be rewritten: variant click → dialog
  appears → Year+Currency gate → Continue → GET fires. Steps, assertions, and network intercept
  updated to match B2–B6.
- **TC-CPR-TIO-003** — "Export 'All Labor Pricing' fires the labor-pricing export endpoint" —
  DRIFTED: same shape as 002; rewrite to new dialog+gate+network contract with `isLabor=true`.
- **TC-CPR-TIO-004** — "Export 'All Equipment Max Discount' fires the equipment-max-discount export
  endpoint" — DRIFTED: rewrite to dialog+gate+network with `isMaxDiscount=true`.
- **TC-CPR-TIO-005** — "Export 'All Labor Max Discount' fires the labor-max-discount export
  endpoint" — DRIFTED: rewrite to dialog+gate+network with `isLabor=true&isMaxDiscount=true`.
- **TC-CPR-TIO-006** — "Export ▾ menu dismisses on outside-click" — verify against current menu;
  correct if the dialog interaction changes the outside-click behavior.

For each corrected TC, update: Title (if stale), Steps (dialog interaction inserted), Expected
Results (dialog appears, Continue disabled, Continue enables on both-set, GET fires with correct
params [200]), and add `Depends_On` reference to the new dialog-contract TC if applicable.

### 1.2 — Author new TC band: Year(s)+Currency precondition dialog contract

Extend the TIO band from TC-CPR-TIO-018 (next free after TC-CPR-TIO-017). Author the following new
TCs covering the dialog contract shared by all 4 variants:

- **TC-CPR-TIO-018** — Dialog appears for each of the 4 Export ▾ variants (parametrized assertion):
  click each variant → titled "Export" dialog renders with Year(s) combobox + Currency combobox +
  Cancel / Continue (disabled) / Close buttons.
- **TC-CPR-TIO-019** — Continue remains disabled when only Year(s) is set (no Currency).
- **TC-CPR-TIO-020** — Continue remains disabled when only Currency is set (no Year(s)).
- **TC-CPR-TIO-021** — Continue enables when BOTH Year(s) + Currency are set.
- **TC-CPR-TIO-022** — Cancel dismisses the dialog without firing any network request.
- **TC-CPR-TIO-023** — Year(s) boundary: selecting 1 year (minimum) is accepted and enables
  Continue (given Currency also set).
- **TC-CPR-TIO-024** — Year(s) boundary: selecting 3 years (maximum) is accepted; Continue enables.
- **TC-CPR-TIO-025** — Currency options present: USD, CAD, MXN (each renders as a selectable
  option).
- **TC-CPR-TIO-026** — Each Currency option (USD / CAD / MXN) produces the correct `currencyId`
  param in the GET request when Continue fires (live network assertion per walk-evidence B6).

### 1.3 — Author new TC band: real file-I/O download round-trip (all 4 variants)

Continue the band from TC-CPR-TIO-027:

- **TC-CPR-TIO-027** — All Equipment Pricing download round-trip: Year=2026, Currency=USD →
  Continue → `waitForEvent('download')` → assert: filename matches `*Equipment*Pricing*` or known
  pattern, extension is `.csv` or `.xlsx` (verify against live), file size > 0 bytes, CSV header row
  contains expected column names for Equipment Pricing (confirm headers from walk-evidence or a
  live CLI probe of the downloaded file). Param assertion: `isLabor=false`, `isMaxDiscount=false`.
- **TC-CPR-TIO-028** — All Labor Pricing download round-trip: same Year+Currency gate → Continue →
  capture file → assert filename contains `Labor`, extension correct, non-empty, CSV header reflects
  labor columns. Param: `isLabor=true`, `isMaxDiscount=false`.
- **TC-CPR-TIO-029** — All Equipment Max Discount download round-trip: → assert filename contains
  `MaxDiscount` or `Max` + `Equipment`, non-empty, CSV header includes Max Discount column.
  Param: `isLabor=false`, `isMaxDiscount=true`.
- **TC-CPR-TIO-030** — All Labor Max Discount download round-trip: → assert filename and CSV header
  reflect Labor + Max Discount. Param: `isLabor=true`, `isMaxDiscount=true`.

For each download TC: capture the download event via `waitForEvent('download')`, save to a temp
dir, read the first line (header row), assert non-empty file size, assert correct HTTP 200 on the
backing `GET pricing-export` request (via Playwright `request` intercept or `network` log), and
discard the temp file after assertion.

### 1.4 — Update test-cases MD + test-plan

Update `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`:
- Correct TC-CPR-TIO-001 through TC-CPR-TIO-006 in-place (drift-fix).
- Append TC-CPR-TIO-018 through TC-CPR-TIO-030 as new entries in the TIO section.

Update the matching test-plan MD (toolbar I/O section) to reflect the corrected + new TCs.

Run `npm run xlsx:build` (planner:post-complete) to rebuild
`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` with the updated TIO entries. Verify with
`npm run check:tc-parity` → exit 0.

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
> reading the live MD/spec for the next free SBC number; scope each TC title by surface ("Export All") to avoid
> collision with the other toolbar-I/O surfaces sharing the TIO page band.

Export ▾ All is a 4-variant file-I/O flow behind a Year(s)+Currency precondition gate: result-fidelity (each variant's file is the result of its scope), combination (the variant × Year × Currency multi-parameter gate), and empty-vol apply; pagination / sorting / render-state / persistence are out-of-scope.

| Family | Trigger | QUICK (`-SBC-`) must-assert | DEEP (`-SBC-MAX-`) exhaustive | Encore oracle |
|---|---|---|---|---|
| result-fidelity | each variant's file is the result of its scope | each variant file non-empty + expected header (promotes TC-CPR-TIO-027..030) | each variant's content reflects its `isLabor`/`isMaxDiscount` scope; CSV columns differ per variant OR assert on the network param when the structure is identical (do not assert falsely on identical structure) | the file + the GET param are the dual oracle (B6); confirm headers from a LIVE parse, never hardcoded |
| combination | variant × Year(s) × Currency is a multi-parameter gate surface | one variant + one Year + one Currency → correct params on Continue (promotes TC-CPR-TIO-026) | bounded **pairwise** covering-array across {4 variants} × {Year 1 / 3} × {USD / CAD / MXN} — NOT full cartesian; each combo's GET params verified | currencyId mapping (B6); Year(s) 1–3 limit; pairwise keeps the matrix bounded (Standard combinatorial method) |
| empty-vol | each variant on empty vs large dataset | a non-empty file per variant | per-variant empty-state (header-only) + large-dataset completion | empty-state needs a confirmed empty office; per-variant volume |

**Out-of-scope dispositions (LR-065 token — reason ≥20 chars; execution confirms):**
- `out-of-scope:pagination=Export ▾ emits a full-dataset file per variant with no rows-per-page control on the action; grid paging does not affect the export`
- `out-of-scope:sorting=the export GET emits a server-ordered file; grid sort is not a request parameter, so there is no sort behavior on the export surface to assert`
- `out-of-scope:render-state=the Export ▾ surface is a precondition dialog + action, not a cell-rendering grid; combobox option rendering is an Axis-1 dropdown field case (TC-CPR-TIO-025), not a render-state link/boolean cell`
- `out-of-scope:persistence=the Export ▾ Year+Currency dialog is modal and resets on each open; there is no persisted surface state to survive reload`

**Disposition rule:** at execution, the Export ▾ All surface carries a `behavior-cases:<families>` disposition (LR-065) — result-fidelity + combination + empty-vol covered (each ≥1 QUICK SBC TC), the other four carrying their `out-of-scope:<family>=<reason>` tokens. Leaving it undispositioned DENIES closure (LR-062 Cx). The DEEP `-SBC-MAX-` band (esp. the combination pairwise matrix) is authored to full exhaustion per the Standard L2/L3 (this is `/ultracoverage`).

---

## Phase 2 — BUILDER: implement spec corrections + download assertions

### 2.1 — Correct the 6 stale Export spec blocks in the toolbar-io spec

File: `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`

For each stale TC (002–005 + 001 if description updated, 006 if affected):
- Update the `test(...)` description to match the corrected TC title.
- Replace direct-click-to-network assertion with the new dialog interaction:
  1. Click the Export ▾ variant menu item (e.g., "All Equipment Pricing").
  2. Assert the titled "Export" dialog renders (`expect(dialog).toBeVisible()`).
  3. Assert Continue is `disabled` before fields are set.
  4. Fill Year(s) combobox (select one year, e.g., 2026).
  5. Assert Continue is still `disabled` (single-field intermediate — covers TC-CPR-TIO-019/020
     at the unit TC level; the dedicated TCs exercise this more explicitly).
  6. Fill Currency combobox (select USD).
  7. Assert Continue is now `enabled`.
  8. Set up network intercept for `GET *pricing-export*`.
  9. Click Continue.
  10. Assert intercepted request URL contains correct `isLabor` + `isMaxDiscount` + `currencyId`
      + `years` params matching the variant (per walk-evidence B6).
  11. Assert response status 200.
  12. Assert dialog closes after Continue.
- Reuse the NM-2262 download-helper import where the round-trip TCs need it.

### 2.2 — Implement the new dialog-contract TCs (TC-CPR-TIO-018 through TC-CPR-TIO-026)

Add a new `describe` block (or integrate with existing TIO describe) for the dialog contract tests.
Each test follows the standard: open Export ▾ → click a variant → exercise the specific dialog
condition → assert as specified in Phase 1.2.

For TC-CPR-TIO-022 (Cancel): intercept any `pricing-export` request BEFORE clicking Cancel;
assert NO request fires after Cancel click; assert dialog is closed.

For TC-CPR-TIO-023/024 (Year boundaries): use 1-year selection (minimum) and 3-year selection
(maximum); assert Continue enables with Currency also set.

For TC-CPR-TIO-025/026 (Currency options): enumerate the combobox options (assert USD, CAD, MXN
present); for TC-026, test each currency and assert `currencyId` maps correctly in the GET params
(USD=1 per walk-evidence B6; CAD/MXN currencyIds to be verified live via a CLI probe if not already
in walk-evidence).

### 2.3 — Implement the 4 real download round-trip TCs (TC-CPR-TIO-027 through TC-CPR-TIO-030)

Reuse the NM-2262 download helper (import from the path established by that subplan, e.g.,
`src/utils/download-helper.ts` or equivalent). Each download TC:

1. Navigate to Corporate Pricing search page.
2. Click Export ▾ → target variant.
3. Fill Year(s) = one year (e.g., 2026) + Currency = USD.
4. Set up `waitForEvent('download')` listener.
5. Click Continue → await download.
6. Assert: `download.suggestedFilename()` matches expected pattern for the variant.
7. Save to temp path; read file (or header line); assert non-empty (`fs.statSync(path).size > 0`).
8. Assert CSV header contains expected column names for the variant.
9. Assert `isLabor` / `isMaxDiscount` flags in the backing GET request match the variant.
10. Clean up temp file.

For the `isLabor`/`isMaxDiscount` content reflection assertion: verify if the actual CSV header
columns differ between Equipment (isLabor=false) and Labor (isLabor=true) variants. If the
column set is identical and only the data differs, assert on the network param instead and note
the finding in the TC. Do NOT assert falsely on content if the structure is identical — cite the
network param assertion as the dispositive test.

### 2.4 — Per-test LR-019 baselines

Every new and corrected test must have a per-test baseline (LR-019): navigate fresh, assert the
initial state before any Export ▾ interaction (Export ▾ button visible + enabled, toolbar present,
grid loaded with ≥1 row). This is the LR-019 positive-control line — no test starts mid-flight.

---

## Phase 3 — HEALER: first-run RCA (conditional)

On any first-run red after Phase 2 implementation:
- Read `failure-summary.json` + `results.json` BEFORE any re-run or patch (LR-024).
- Run `/rca` (artifact-first, mama-led per the RCA skill) — do NOT guess-patch without evidence.
- Every fix cites the artifact row that motivated it.
- Positive-control before any "un-drivable" classification (LR-061): try overlay-clear + reload +
  alternate selector before declaring any control not drivable.
- Bug doctrine (LR-034 / LR-044): if behavior looks suspicious (Continue never enables, network
  call misfires, download never arrives) — reproduce via `playwright-cli` CLI, then:
  - If unclear: file via `/encore-questions`.
  - If confirmed: file per LR-034 / BUG-*.json.
  - Never silently absorb the deviation.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phase 1+–3 that is (OWNER/same-identity) + (same
file/module) + (5–30 min) + (no user input needed), pick exactly one disposition:

- **DO-NOW** — execute it before Phase 3.5 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan with a grep-verifiable line item; verify with `grep
  -F "<line>" plans/pending/<file>` before continuing.

Bare "out of scope" / "flagged for follow-up" with no concrete recipient = HALT + ask user
(LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — baseline-absent declared; no REQUIREMENTS.md change; live contract sourced from walk-evidence 2026-06-23) | `(none)` | (none) |
| GIVER | test-cases MD + test-plan + XLSX workbook | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec file + download helper import | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts` | `npx playwright test --list` resolves TC-CPR-TIO-001..030 |
| HEALER | per-fix evidence citations (conditional — only if first-run reds require HEALER fixes) | `(skipped: conditional — only if first-run reds; replaced at close with fixed spec path if HEALER work occurred, else no HEALER artifact)` | `npx playwright test corporate-pricing-toolbar-io --workers=1` green ×2 |
| WATCHDOG | (none — closure audit is a separate subplan; no neutral-eye walk assigned here) | `(none)` | (none) |
| GARDENER | (none — no structural refactor in scope) | `(none)` | (none) |
| OWNER | closure ceremony | `(skipped: closure ceremony only — deliverables are the GIVER/BUILDER artifacts above; OWNER verifies all cells + runs acceptance commands at Phase 3.5)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] TC-CPR-TIO-001 through TC-CPR-TIO-006 corrected to the new Year(s)+Currency dialog contract
  in both the MD and the spec; all 6 pass green ×2 against the current app.
- [ ] TC-CPR-TIO-018 through TC-CPR-TIO-030 authored in MD + spec; all 13 new TCs pass green ×2.
- [ ] Dialog contract covered: dialog appears per variant; Continue disabled until both Year(s) +
  Currency set; Continue disabled with only one field set; Continue enables when both set; Cancel
  aborts with no network request; Year(s) 1 / 3 boundary both accepted.
- [ ] Currency each-option (USD / CAD / MXN) present and produces correct `currencyId` param on
  Continue (TC-CPR-TIO-025/026 green).
- [ ] Real download round-trip for all 4 variants (TC-CPR-TIO-027–030): `waitForEvent('download')`
  captures a file; filename/extension/non-empty size/CSV-header each asserted; `isLabor` +
  `isMaxDiscount` flags reflected in network param assertion.
- [ ] NM-2262 download helper correctly imported and reused — no duplicated download-utility code.
- [ ] `npm run check:tc-parity` exit 0 (MD ↔ spec TC-ID parity).
- [ ] `npm run xlsx:lint` exit 0 (workbook integrity).
- [ ] `npm run typecheck` exit 0 (no TypeScript errors introduced).
- [ ] **Axis-2 surface families dispositioned (LR-065 → LR-062 Cx)**: the Export ▾ All surface carries a `behavior-cases:` disposition for all 7 families — result-fidelity + combination + empty-vol each ≥1 QUICK `TC-CPR-TIO-SBC-*` + full DEEP `TC-CPR-TIO-SBC-MAX-*` (combination DEEP = bounded pairwise across the 4 variants × Year × Currency); pagination/sorting/render-state/persistence each an `out-of-scope:<family>=<reason ≥20 chars>` token.
- [ ] `/regression-guard` BEFORE snapshot ↔ AFTER snapshot: no silent breakage on touched files
  beyond the intended changes.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] Do-or-die execution audit: every fold item from SOURCE A (drift-fix contract) and SOURCE B
  (real I/O round-trip) is present as a grep-verifiable line in the spec and/or MD — no phantom
  hand-off.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
# All TIO tests listed (expect TC-CPR-TIO-001..030 resolved)
npx playwright test --list 2>/dev/null | grep "TC-CPR-TIO"

# Parity gate (MD ↔ spec)
npm run check:tc-parity                        # expect: exit 0

# Workbook lint
npm run xlsx:lint                              # expect: exit 0

# TypeScript
npm run typecheck                              # expect: exit 0

# Closure dry-run
node scripts/validate-plan-closure.mjs --dry-run plans/pending/SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md

# Spec run (single worker, no retries — first-run green verification)
npx playwright test corporate-pricing-toolbar-io --workers=1 --retries=0
```

---

## Handoff

Chat-only summary per `feedback_handoff_in_chat_only.md`. Describes outcomes per LR-039 (no
obstacle claims; never name a specific failure mode in this section).

On completion: the 10 formerly-DRIFTED-RED Export ▾ TCs are corrected to the current
Year(s)+Currency dialog contract and pass green; 13 new TCs covering the dialog, boundary values,
currency options, and real file download round-trip for all 4 variants are authored and green.
NM-2264 "Automate Pricing Export All" is fully covered. The next subplan in the Jira delivery chain
(NM-2265 Import All, NM-2305 Loc Pricing Import) may inherit the established dialog-interaction
pattern and the `waitForEvent('download')` helper.
