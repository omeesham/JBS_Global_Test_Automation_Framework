# SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL — Export ▾ 4-variant drift-fix + real download round-trip

> **⚠ SBC ID correction (2026-06-24):** surface/behavior cases use **ordinary 3-segment IDs** (`TC-CPR-<SUB>-NNN`, the page's existing band) + a `**Surface_Family**: <family> (QUICK|DEEP)` line — **NOT** the 4-segment `-SBC-` / `-SBC-MAX-` infix this plan body references (that shape is rejected by `check-tc-parity` G6). Same coverage, grammar-safe. Canonical: LR-065 (`.claude/rules/inventory.md`) + `docs/read_only_docs/CASE_GENERATION_STANDARD.md`.

**Status**: DONE
**Executed**: 2026-07-07
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

## Execution Notes (2026-07-07 — BINDING)

- **Export is read-only and SAFE** (GET; downloads captured to a temp dir and discarded). No mutation — office 1604 is fine; the import throwaway-office constraint does NOT apply to this subplan.
- **currencyId mapping is only partially known.** Walk-evidence B6 confirms **USD=1 only**; CAD and MXN currencyId values are NOT captured anywhere in the repo or Jira. The executor MUST capture them LIVE (open Export ▾ → set each currency → Continue → read the GET `currencyId` param) before asserting TC-CPR-TIO-026. Never hardcode CAD/MXN currencyId from memory (LR-022).
- **NM-2262 helper reuse** — call the generic `captureCsvDownload(trigger, apiPathFragment)` on `CorporatePricingSearchPage` (built + proven by NM-2262, DONE 2026-07-07) with the Export ▾ trigger + the `pricing-export` API path. Do NOT duplicate the download helper.
- **Coverage depth = FULL DEEP as authored** (user directive) — Export is safe, so the full DEEP combination pairwise matrix (4 variants × Year × Currency) is fully runnable; author it.
- **SBC ID grammar** — follow the top-of-file correction note: plain 3-segment `TC-CPR-TIO-NNN` + a `**Surface_Family**: <family> (QUICK|DEEP)` line. The `-SBC-`/`-SBC-MAX-` strings in the body are stale shorthand for the surface-behavior bands, NOT literal ID infixes (`check-tc-parity` G6 rejects a 4th segment).

---

## Council-Audit Reconciliation (2026-07-07 — BINDING; supersedes any conflicting body text below)

⚠ **EXECUTOR — READ FIRST.** Adversarial GPT-5.5 council review (2026-07-07, two rounds) surfaced material defects. The R-directives below are BINDING and OVERRIDE the older phase bodies, the Verification block, AND the acceptance criteria wherever they conflict. Wherever any text still shows the OLD pattern — `src/utils/download-helper.ts`, the Export-menu button as the download trigger, `-SBC-`/`-SBC-MAX-` IDs, the literal "TC-CPR-TIO-018..030" band, or an undefined NM-2005 oracle — IGNORE the stale text and follow the R-directive. These are your authoring contract:

- **R1 — TC numbering.** The current spec already owns TC-CPR-TIO-018..024 (NM-2262). The body's "extend from TC-CPR-TIO-018" and the 018–030 band examples COLLIDE with those. Renumber ALL 13 new NM-2264 cases (dialog-contract ×9 + download round-trip ×4) to the next free band AFTER TC-CPR-TIO-024 — read the live spec for the true high-water mark at execution and assign sequentially from there. Update MD + spec + XLSX + acceptance + handoff consistently. The specific IDs in the body below (018..030) are ILLUSTRATIVE placeholders, not literal targets.
- **R2 — Download helper reuse (public wrapper).** There is NO `src/utils/download-helper.ts`; reality is the private `CorporatePricingSearchPage.captureCsvDownload(trigger, apiPathFragment)`. Add a PUBLIC page-object method `downloadExportVariant(variant, years, currency): Promise<CsvDownloadResult & { status: number | null }>` that opens Export ▾ → clicks the variant → sets Year(s)+Currency in the gate → and passes the **post-gate Continue button** (NOT the Export menu button — that only opens the menu) as the `trigger` to `captureCsvDownload(continueBtn, CORP_PRICING_EXPORT_API)`. Specs call this wrapper; no raw `waitForEvent('download')` duplication in specs.
- **R3 — Response status (no null escape hatch).** `captureCsvDownload` currently returns only `requestUrl` (no status). Extend the wrapper/result to capture the response status via a coordinated `waitForResponse` on the `pricing-export` API path (LR-056). The captured `status` MUST be a concrete `number` — NOT `number | null`; if the backing response is not captured within the download flow, the wrapper THROWS rather than returning a null/absent status (a nullable status is a false-green escape hatch that lets a 200-assertion silently pass on a missing response). Do NOT assert a status the helper never captured.
- **R4 — DEEP empty-vol is data-blocked unless a live zero-row oracle exists.** The `pricing-export` GET has NO office parameter, so there is no per-office empty scope. Either identify a LIVE zero-row (or header-only) year/currency/variant oracle and cover it, OR mark empty-vol DEEP `data-blocked` with an explicit deferral reason + adjusted acceptance. Do not fabricate an empty-state assertion.
- **R5 — NM-2005 regression oracle (concrete source).** Oracle = a COMPANION Export-All download of the SAME year/currency for the correct sibling scope, parsed live: (a) the active-pricebook set = the distinct `PriceBook` values present across the companion export(s) for that scope; (b) the labor-PG set = product groups whose rows carry the Labor flag in the Labor-variant export. Then assert, against the target Max-Discount variant CSV: every active pricebook appears ≥1×, and ZERO rows carry a labor product group — comparing by `(LocationNo, PriceBook, Currency)` tuples. If a companion export cannot serve as a valid oracle at execution, mark the NM-2005 regression `data-blocked` with a documented reason rather than asserting against an undefined set (a false-green).
- **R6 — Year(s) negative boundary.** Add a case proving a 4th year cannot be submitted (combobox caps at 3) AND that no `pricing-export` request fires with four years. Update acceptance to include the negative boundary. If the UI does NOT cap at 3, file/track a live divergence rather than silently skipping.
- **R7 — currencyId live capture.** Only USD=1 is known. Capture CAD/MXN currencyId LIVE from the Continue GET param before asserting the currency-mapping TC. Never hardcode (LR-022).
- **R8 — Satisfaction matrix.** BUILDER deliverables MUST also list `clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts` (new `downloadExportVariant` + gate methods) and `clients/encore/src/data/corporate-pricing/toolbar-io.ts` (Export-dialog / currency / per-variant header constants) — the current matrix omits both. Add named methods/constants + acceptance commands.
- **R9 — SBC grammar.** Plain 3-segment `TC-CPR-TIO-NNN` IDs + `**Surface_Family**:` line + file-tail `behavior-cases:` / `out-of-scope:` tokens. NO `-SBC-`/`-SBC-MAX-` IDs anywhere — acceptance included.

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
- `plans/done/SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md` (SOURCE A — drift-fix contract; now closed)
- `plans/pending/SUBPLAN_PRICING_EDGE_P3.md` (SOURCE B — real I/O round-trip seed)
- `plans/done/SUBPLAN_CORP_PRICING_NM2262_LOC_EXPORT.md` (download helper Depends-on; now closed)
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

### 1.5 — Regression coverage requirements (NM-1997 / NM-1998 / NM-2005)

Tracked here per LR-040(b) — routed from `SUBPLAN_CORP_PRICING_NM2262_DATE_AND_COVERAGE_HARDENING.md`
Workstream C2, which does NOT implement these (different surface — Equipment/Max-Discount export, not
Loc Pricing Export). All three are fixed/Done defects on the export **content** for this surface; the
round-trip TCs authored in this subplan (1.3 / 2.3) MUST add the following concrete assertions so the
fixes have durable regression coverage:

- **NM-1997 (duplicate product groups in the exported file)** — for each variant's downloaded CSV,
  assert every `(LocationNo, PriceBook, Currency)` tuple across all rows is unique (no duplicate rows
  for the same location+pricebook+currency combination).
- **NM-1998 (same duplicate-row defect, different variant)** — the same unique-tuple assertion above,
  run against the Labor and Max-Discount variant downloads too (shares the fix; needs its own
  regression proof per variant since each is a separate download/parse).
- **NM-2005 (missing pricebooks + stray labor product groups on the max-discount export)** — for the
  "All Equipment Max Discount" and "All Labor Max Discount" variant downloads: (a) assert every
  currently-active pricebook for the exported scope appears at least once in the file (no active
  pricebook silently missing), and (b) assert the Equipment Max Discount file contains **zero** rows
  whose product group is a Labor product group (no stray labor rows on the equipment-scoped variant).

These three assertions ride the same `(LocationNo, PriceBook, Currency)`-uniqueness + active-pricebook
+ no-stray-labor-PG checks — no new TC-IDs required beyond what 1.3/2.3 already plan; fold them into
the existing TC-CPR-TIO-027..030 download-assertion bodies as additional `expect()` calls, each
commented with which Jira defect it guards against (plain English, no `NM-####` restriction — Jira IDs
are explicitly kept per the deliverable-hygiene allowlist).

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
| GIVER | test-cases MD + test-plan + XLSX workbook | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_toolbar_io_test_plan.md`<br>`clients/encore/test_cases_xlsx/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec file + Export gate page-object + Export data constants + Export dialog selectors (R8) | `clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts`<br>`clients/encore/src/data/corporate-pricing/toolbar-io.ts`<br>`clients/encore/src/selectors/corporate-pricing/search.ts` | `npx playwright test --list` resolves TC-CPR-TIO-001..040 |
| HEALER | per-fix evidence citations (conditional — only if first-run reds require HEALER fixes) | `(skipped: conditional — only if first-run reds; replaced at close with fixed spec path if HEALER work occurred, else no HEALER artifact)` | `npx playwright test corporate-pricing-toolbar-io --workers=1` green ×2 |
| WATCHDOG | (none — closure audit is a separate subplan; no neutral-eye walk assigned here) | `(none)` | (none) |
| GARDENER | (none — no structural refactor in scope) | `(none)` | (none) |
| OWNER | closure ceremony | `(skipped: closure ceremony only — deliverables are the GIVER/BUILDER artifacts above; OWNER verifies all cells + runs acceptance commands at Phase 3.5)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] TC-CPR-TIO-001 through TC-CPR-TIO-006 corrected to the new Year(s)+Currency dialog contract
  in both the MD and the spec; all 6 pass green ×2 against the current app.
- [ ] 13 new TCs (dialog-contract ×9 + download round-trip ×4) authored in MD + spec in the next free band AFTER TC-CPR-TIO-024 (per R1 — NOT the illustrative 018–030 range); all 13 pass green ×2. Includes the Year(s) 4th-year negative boundary (R6).
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
- [ ] **Axis-2 surface families dispositioned (LR-065 → LR-062 Cx)**: the Export ▾ All surface carries a `behavior-cases:` disposition for all 7 families — result-fidelity + combination + empty-vol each ≥1 QUICK plain `TC-CPR-TIO-NNN` case (with a `**Surface_Family**: <family> (QUICK)` line) + full DEEP plain `TC-CPR-TIO-NNN` cases (with `(DEEP)`) — combination DEEP = bounded pairwise across the 4 variants × Year × Currency; empty-vol DEEP per R4 (live zero-row oracle or `data-blocked`); pagination/sorting/render-state/persistence each an `out-of-scope:<family>=<reason ≥20 chars>` token. NO `-SBC-` IDs (R9).
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

# Closure dry-run (post-move path — the plan lives in plans/done/ once closed)
node scripts/validate-plan-closure.mjs --dry-run plans/done/SUBPLAN_CORP_PRICING_NM2264_EXPORT_ALL.md

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

---

### Execution Summary

**Executed**: 2026-07-07 (OWNER, multi-identity span GIVER → BUILDER → OWNER).

**Live walk (Playwright CLI, office 1604, 2026-07-07)** — captured the full Export ▾ contract that the
plan body only partially knew:
1. All 4 variants open the shared "Export" dialog (title "Export", Year(s) multi-select 2021–2028 + Currency USD/CAD/MXN, Cancel/Continue/Close). Continue disabled until BOTH set; Cancel and Close both dismiss. **Verified live.**
2. Year(s) caps at 3 — a 4th pick is silently refused (R6). **Verified live.**
3. `currencyId` map captured LIVE (R7): **USD=1, CAD=2, MXN=3** (never hardcoded from memory).
4. Per-variant download identity: `EquipmentPricings.csv` / `LaborPricings.csv` / `EquipmentMaxDiscounts.csv` / `LaborMaxDiscounts.csv`, each returning `pricing-export?isLabor&isMaxDiscount&currencyId&locale&years` [200]. **Years are REPEATED params** (`years=2026&years=2027&years=2028`), not comma-joined — corrected a first-run assertion that used `get()` instead of `getAll()`.
5. **File format is a WIDE MATRIX** (`Product Group Id, Product Group Name, <one column per pricebook>`; row 2 = currency-per-column) — NOT the normalized `(LocationNo, PriceBook, Currency)` tuple the plan's R5 assumed. Equipment (≈3256 product groups) vs Labor (≈422) carry disjoint populations + different pricebook columns; Pricing vs Max Discount share the shape and differ only by the network param. **Currency scopes pricebook-column volume**: USD Equipment ≈79 columns, MXN ≈13, CAD = 0 → CAD is a LIVE empty/minimal-scope oracle.

**TCs implemented (40 total, 39 Automated + 1 pre-existing Manual skip):**
- **Corrected (6)**: TC-CPR-TIO-001..006 — Export ▾ drift-fixed to the dialog+gate contract (002–005 now assert the gated endpoint + HTTP 200; 001/006 verified unchanged). Green ×2.
- **New (16)**, renumbered to the next free band after TC-024 per **R1**:
  - Dialog contract (9): TC-CPR-TIO-025 (dialog per variant), 026/027 (single-field disabled), 028 (both-set enables), 029 (Cancel → no request), 030 (Year min 1), **031 (Year max 3 + 4th-year negative boundary, R6)**, 032 (currency options), 033 (currencyId map, R7 — combination QUICK).
  - Real download round-trip (4): TC-CPR-TIO-034..037 — reuse the NM-2262 `captureCsvDownload` via the new public `downloadExportVariant` wrapper (R2); assert filename, HTTP 200 status (concrete number, throws if uncaptured — R3), matrix header, and the NM-1997/1998 (no duplicate product groups) + NM-2005 (every sibling-Pricing pricebook column present + zero labor-PG rows, oracles derived LIVE from companion exports — R5) regressions.
  - Axis-2 DEEP (3): TC-CPR-TIO-038 (combination pairwise 4×{1yr/3yr}×3), 039 (result-fidelity — Equipment≠Labor scope; Pricing vs Max Discount by param), **040 (empty-vol DEEP via the live CAD empty-scope oracle — R4 satisfied live, NOT data-blocked)**.

**TCs dropped**: none. (TC-024 remains a pre-existing NM-2262 data-blocked Manual skip — not owned here.)

**Deviations from the plan body (all authorized by the binding R-directives, which supersede the older body):**
- **R1** band is **025–040** (16 net-new), not the illustrative "018–030 (13)". The plan's "13 new" = the 9 dialog + 4 download Axis-1 cases; the Axis-2 DEEP band (3) is the separate LR-065 acceptance line. The 4th-year negative boundary (R6) is TC-031.
- **R5 oracle adapted** to the real wide-matrix file (pricebooks = columns, product groups = rows) — the plan's normalized-tuple form does not exist in the actual export. NM-2005 is fully covered, NOT `data-blocked`.
- **R4 empty-vol** covered with a LIVE oracle (CAD equipment = 0 pricebook columns), stronger than the plan's `data-blocked` fallback.
- One first-run red (TC-031) was a spec-assertion bug (`get('years')` vs `getAll('years')`) fixed in place during BUILDER verification — the app behaves correctly (sends all 3 years as repeated params). No HEALER RCA phase was needed.
- **Adjacent-sweep DO-NOW**: the now-orphaned + app-broken `clickExportVariantAndCaptureUrl` page-object method (the variant click no longer fires a request) was removed, and its test-plan reference updated.

**Verification (all commands run, 2026-07-07):**
- `npm run check:tc-parity` → exit 0 (MD ↔ spec ↔ XLSX; 40 TCs).
- `npm run xlsx:lint` → exit 0 (0 vocab hits — client-facing cells scrubbed of raw API params / defect IDs / dates).
- `npm run xlsx:build` → exit 0 (corporate_pricing_toolbar_io = 40 rows).
- client `npx tsc --noEmit` → 0 errors.
- `npx playwright test corporate-pricing-toolbar-io --grep "TC-CPR-TIO-(00[1-6]|02[5-9]|03[0-9]|040):" --workers=1 --retries=0` → **23 passed** (22 Export TCs + setup, 0 failed, 0 flaky) — the consolidated run-all serving as the green ×2 second pass; each block also passed independently first.
- NM-2262 regression (018–024, which share the modified `captureCsvDownload`) → 7 passed, 1 skipped — no regression.
- `/regression-guard` BEFORE ↔ AFTER: +3 selectors, +16 TCs, +13 gate methods, `+status` on `CsvDownloadResult`; all 3 original data exports preserved; no silent breakage.

**Out of scope (correctly deferred, LR-060 obligation-3 satisfied):** the Import ▾ variant tests TC-CPR-TIO-007..011 are DRIFTED-RED under the same Year+Currency gate, but are owned by the **PENDING** `SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md` (which names those TC IDs). Not touched here (Export-only scope).

**Documentation changes**: test-cases MD + test-plan MD (drift-fix + new band + Axis-2 disposition + Export dialog field-inventory/validation rows), XLSX workbook rebuilt.
