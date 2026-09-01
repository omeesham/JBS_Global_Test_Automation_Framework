# SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE — close the barcode search gap on Item Search Products (OR-4 data now supplied)

**Status**: PENDING
**Priority**: P1
**Created**: 2026-09-01
**Identity**: OWNER (shell; GIVER → BUILDER by phase)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: none (PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md already closed — this extends it)
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**CoverageMode**: quick

---

## Context

The barcode box on Item Search → Products was inventoried during the NM-2253 QUICK wave but could only be
covered negatively: a garbage value produced the "No results" empty state (TC-ISR-PRS-013), while every
positive case was blocked on real barcode numbers. That block was recorded as open question **OR-4**
("for barcode verification I will provide few barcode numbers; it should filter those products").

The owner supplied barcode numbers on 2026-09-01, so OR-4 is unblocked and this subplan closes the gap.

A live recon pass ran the same day (playwright-cli, office 1101, error-checked clicks) against the supplied
numbers and against `NM-1494` — the Jira ticket that specifies the field. The recon findings below are
**observed facts**, each reproduced live; they define the case set rather than being assumed by it.

**Supplied barcode data (office 1121 assets, all resolving on the 1101 Products page):**

| Barcode | Format | Resolves to (Item / Product Code ID) |
|---|---|---|
| `5052320` | numeric | Allen & Heath ZED24 / 28592 |
| `1013104` | numeric | Shure SCM268 / 627 |
| `5148547` | numeric | Soundcraft Si Expression 1 (16 Ch) / 73551 |
| `DFW0082529` | alphanumeric | Shure ULXD1 Bodypack - G50 / 71154 |
| `DFW0082517` | alphanumeric | Shure ULXD1 Bodypack - G50 / 71154 |
| `5056210`, `5056526`, `5056530`, `5056516`, `5192290`, `DFW0082547`, `5189939` | mixed | not yet resolved — spare pool for Phase 1 |

**Recon findings (2026-09-01, live, each error-checked):**

1. A valid barcode returns **exactly one product row** — the product the asset is scanned under. Confirmed on 5 barcodes.
2. **Both formats work**: plain numeric and the `DFW`-prefixed alphanumeric form.
3. **Many-to-one is real**: `DFW0082529` and `DFW0082517` are different physical assets that resolve to the
   same product code (71154). This is the asset→product relationship the feature exists to express.
4. **Case-insensitive**: lowercase `dfw0082529` returns the same single row as the uppercase form.
5. **Exact match only**: the partial `505232` returns 0 products and the empty state — no prefix matching.
6. **Whitespace is significant**: `" 5052320 "` (verified in the DOM as a 9-character value) returns 0 products.
   Per **NM-1494** the field implements Code 39, whose charset explicitly includes SPACE — so a space is a
   legal barcode character and *not* trimming it is defensible. This is recorded as a **discussion item**, not
   a bug, and Phase 1 must classify it deliberately rather than inherit this reading.
7. **Barcode and Any Field are mutually exclusive**: typing in either box clears the other, the same
   relationship the Location/Region pair has (already covered by TC-ISR-PRS-009). Nothing currently tests this
   for the Any Field ↔ Barcode pair — it is a genuine coverage gap discovered by this recon.
8. **Office 1101 is sufficient** — no office switch is needed despite the assets belonging to office 1121.
9. `Reset` clears the barcode box (already asserted by TC-ISR-PRS-002; re-confirmed).

**Governing spec — NM-1494 (Done)**: "Barcode search: Code 39, ≤42 chars, charset A–Z 0–9 `$ - / + %` space;
field not required." This is the intent-truth oracle for the charset and length cases; live DOM remains the
render-truth oracle per the truth hierarchy.

---

## Bootstrap

**Identity**: OWNER shell — Phase 1 runs as GIVER, Phase 2 as BUILDER, Phase 3 as WATCHDOG.

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch, and per-phase per Layer 2)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots on the touched spec + page object)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` (parent)
- `plans/done/PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md` (the wave this extends)
- `plans/pending/SUBPLAN_PRODUCTS_DQU.md` (DEEP recipient for anything deferred)
- `.claude/rules/inventory.md` (LR-062 denominator, LR-064 walk, LR-072 quick mode)
- `.claude/rules/specs.md` (LR-018 run-all, LR-019 per-test baseline, LR-068 no silent partial coverage)
- `.claude/rules/pipeline.md` (LR-027/028/040/041/044/048)
- `.claude/rules/baseline.md` (LR-045 baseline workflow)
- `.claude/rules/deliverable.md` (LR-058 no internal jargon in shipped source)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md`
- `clients/encore/CLAUDE.md` (LR-ENC-004 Jira-first, LR-ENC-007 two environments, LR-ENC-008 loading windows, LR-ENC-009 no markup-accessibility bugs)
- `clients/encore/specs_planning/_internal/field-inventories/item-search-product-search-2026-08-31.md`
- `clients/encore/specs_planning/_internal/jira-defect-crossref-item-search-2026-08-31.md` (NM-1494, OR-4)

**Anti-Assumption Gates**:
- [ ] Phase 0.5b consumed-or-refreshed before any behavior classification (Gate 1).
- [ ] No "app-wide / regression / defect" claim on <2 evidence sources (Gate 2 — LR-061).
- [ ] No control called un-drivable without overlay-clear + reload + selector-vs-DOM diff + DOM inspect (Gate 3).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] Un-skip + LR-019 harden applied atomically (Gate 5).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block recorded (Gate 6).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. `Depends on: none` — nothing to confirm.
2. Read `.claude/context/navigation.md` (R00); Item Search is in the Exploration Registry — consume the listed
   findings, do not re-explore the module.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md`, filtered to ALL-* plus the active phase
   prefix. **CEO-M17 and CEO-M19 are binding here**: every probe click is checked for `### Error` output before
   its result is trusted, and no negative verdict is recorded from an unverified instrument.
4. Read `.claude/context/patterns.md` — the "before declaring a control un-drivable" node applies.
5. LR scan per the Context files list above.
6. **Browser-tool announcement**: `BrowserTool=cli` — deterministic input trials over a known field, unattended,
   no visual/CSS assertion needed.

---

## Phase 0.5b — Baseline-first walk (CONSUME — artifact is 1 day old)

The module's field inventory `item-search-product-search-2026-08-31.md` is dated 2026-08-31, well inside the
LR-013 14-day window, so this phase takes the **spot-check path**, not a re-walk:

1. Spot-check 3 fields on live DOM (barcode box, Any Field box, Reset) — testid resolves, default matches,
   enabled state matches. Log the 3-row `WALKTHROUGH_LOG`.
2. Drift on any of the three → fall through to a full re-walk and emit a refreshed dated inventory.
3. Old-site baseline: `baselineScope: baseline-absent` — the 2026-08-31 old-site walk was environment-blocked
   (navigator2 rejects the automated-browser TLS handshake; recorded in
   `old-site-baseline/item-search-2026-08-31.md`). Per LR-ENC-001 this is a recorded scope, **not a HALT**, and
   no regression claim may be made against a baseline that was never observed.
4. Update the inventory's barcode row (line 49) — replace "owner-provided numbers pending for positive data"
   with the observed positive behavior and the `OR-4 closed 2026-09-01` provenance.

---

## Phase 1 — GIVER: author the case set

Author **TC-ISR-PRS-022 … TC-ISR-PRS-030** (the PRS band currently ends at 021) into
`clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md`,
plus the matching test-plan scenarios, then rebuild the workbook.

| TC | Case | Oracle |
|---|---|---|
| TC-ISR-PRS-022 | A numeric barcode returns the single product it is scanned under | exactly 1 row; the row's Item + Product Code ID match the expected product |
| TC-ISR-PRS-023 | An alphanumeric (`DFW`-prefixed) barcode resolves the same way | exactly 1 row, expected Item + Product Code ID |
| TC-ISR-PRS-024 | Two different barcodes on the same product code both resolve to it | both searches return the same single Product Code ID (71154) |
| TC-ISR-PRS-025 | Barcode matching ignores letter case | lowercase form returns the same single row as uppercase |
| TC-ISR-PRS-026 | A partial barcode matches nothing (exact match only) | 0 products + the "No results" empty state |
| TC-ISR-PRS-027 | Typing a barcode clears Any Field, and typing in Any Field clears the barcode | each box empties when the other is filled — both directions asserted |
| TC-ISR-PRS-028 | A barcode search survives leaving and returning to the page | executed barcode + its single result restore (mirrors TC-ISR-PRS-018) |
| TC-ISR-PRS-029 | The barcode result row drives the product-code toolbar | select the row → View Product Code opens on the matching product |
| TC-ISR-PRS-030 | Barcode length/charset behave per the governing spec (≤42 chars, Code 39 charset) | over-length and out-of-charset input rejected or non-matching, per what the live probe shows |

**Case-authoring rules for this phase:**
- Every expected value comes from a live read in this session, never from this plan's prose (LR-015).
- The barcode numbers live in `clients/encore/src/data/item-search/item-search.ts` as named constants, not
  inline in the spec — one constant per role (`ISR_BARCODE_NUMERIC`, `ISR_BARCODE_ALPHANUMERIC`,
  `ISR_BARCODE_SHARED_PRODUCT_A/B`, `ISR_BARCODE_PARTIAL`).
- **Assertion strength (LR-068 corollary)**: assert the resolved Product Code ID literally, never merely
  "row count is 1" — a wrong product with the right count must fail.
- **The whitespace reading is re-driven, not inherited.** Phase 1 re-runs the padded-value probe with a
  positive control in the same instrument run and then classifies it explicitly as by-design (Code 39 includes
  SPACE, per NM-1494), a defect, or a discussion item. If it is by-design it is recorded as a note on
  TC-ISR-PRS-026, not filed. **No bug is filed without the LR-034 evidence set.**
- Deliverable comments carry the reason in plain English, never internal rule IDs (LR-058).

Exit: `npm run check:tc-parity` exit 0; `npm run xlsx:build` clean.

---

## Phase 2 — BUILDER: implement the specs

1. Extend `clients/encore/src/pages/item-search/product-search.page.ts` only if a needed helper is missing —
   `typeBarcode` / `readBarcodeValue` / `readAnyFieldValue` are the likely additions. Reuse the existing search,
   row-count, and header helpers; **no new runner**.
2. Add TC-ISR-PRS-022…030 to `clients/encore/tests/item-search/product-search.spec.ts` in the existing describe.
3. Per-test baseline (LR-019): each test starts from `ensureCleanSearch` so a prior test's criteria cannot leak.
4. Run each new test **solo first**, then the whole file, then the module (LR-018 — run-all is the only truth).
5. Run `npm run check:spec-quality` on the **working tree** before any "green" claim (LR-060 obligation 4).

---

## Phase 3 — WATCHDOG: verify

1. Confirm every case in the Phase 1 table exists in both the markdown and the spec, with matching IDs.
2. Confirm no case asserts row-count alone where a product identity is available (LR-068 corollary).
3. Confirm the whitespace disposition carries a stated classification and evidence, not an inherited reading.
4. Confirm the inventory's barcode row and the OR-4 open-question record are both updated.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent items noticed during recon, each already routed — no bare "out of scope":

- **APPEND** — the Active-filter effect case and the Grid Options "Reset to Default View" click-function are
  already line items in `plans/pending/SUBPLAN_PRODUCTS_DQU.md` (added 2026-09-01). Verify with
  `grep -c "Active.*filter checkbox EFFECT" plans/pending/SUBPLAN_PRODUCTS_DQU.md`.
- **APPEND** — barcode interaction with the Location / Region / date criteria (does a barcode search ignore
  them, or AND with them?) is deliberately DEEP-tier: append it to `SUBPLAN_PRODUCTS_DQU.md` as
  `deferred-to-DEEP` rather than widening this quick wave.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | `(skipped: navigator2 blocks automated-browser TLS; baseline-absent recorded 2026-08-31 per LR-ENC-001)` | grep `baselineScope` in the module baseline artifact |
| GIVER | test-cases MD + test-plan + inventory + workbook | `clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/item-search/item_search_product_search_test_plan.md`<br>`clients/encore/specs_planning/_internal/field-inventories/item-search-product-search-2026-08-31.md`<br>`clients/encore/testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object + test data | `clients/encore/tests/item-search/product-search.spec.ts`<br>`clients/encore/src/pages/item-search/product-search.page.ts`<br>`clients/encore/src/data/item-search/item-search.ts` | `npx playwright test tests/item-search/product-search.spec.ts` all green |
| HEALER | (none) | `(none)` | n/a |
| WATCHDOG | Phase 3 verification | `(skipped: verification findings are emitted in-session to chat and the activity log, no standalone audit artifact for a nine-case extension)` | Phase 3 checklist in the Execution Summary |
| GARDENER | (none) | `(none)` | n/a |
| OWNER | this plan + activity log | `plans/pending/SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` | `node scripts/validate-plan-closure.mjs --plan plans/pending/SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE.md --enforce` |

---

## Acceptance criteria

- [ ] All nine cases TC-ISR-PRS-022…030 exist in markdown, test plan, workbook and spec with matching IDs.
- [ ] Every one of the owner's supplied barcodes is either used by a case or explicitly accounted for as a
      spare (LR-068 — no silent partial coverage of the supplied data set).
- [ ] Each positive case asserts the resolved product's identity, not just a row count.
- [ ] The whitespace behavior carries an explicit classification (by-design / defect / discussion item) with
      its evidence and a re-driven probe — never an inherited reading.
- [ ] OR-4 is recorded as closed, naming the date the numbers arrived and the cases that consumed them.
- [ ] The inventory's barcode row no longer says positive data is pending.
- [ ] `npm run check:tc-parity` exit 0; `npm run check:spec-quality` clean on the working tree.
- [ ] Full `product-search.spec.ts` run green, then the whole Item Search module green.
- [ ] `/regression-guard` before/after shows no silent breakage on the touched files.
- [ ] Activity-log row appended per LR-028 with an LR-037-compliant timestamp.
- [ ] `/final-q` verdict block emitted per LR-042.

---

## Verification

```bash
# The nine new cases resolve in the runner (expect: 9 lines)
cd clients/encore && npx playwright test tests/item-search/product-search.spec.ts --list | grep -c "TC-ISR-PRS-02[2-9]\|TC-ISR-PRS-030"
```

```bash
# Markdown / spec / workbook parity holds (expect: PASS)
npm run check:tc-parity
```

```bash
# The barcode numbers live in test data, not inline in the spec (expect: 0)
grep -c "5052320\|DFW0082529" clients/encore/tests/item-search/product-search.spec.ts
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. Describes what landed: the barcode field moves from
negative-only coverage to a full positive case set built on real supplied data, OR-4 closes, the Any Field ↔
Barcode exclusivity gap found during recon is covered, and anything about barcode-versus-other-criteria
interaction passes to the DEEP wave in `SUBPLAN_PRODUCTS_DQU.md`.
