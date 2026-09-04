# PLAN_NM2257_ADD_PRODUCT_CODE — ship the Add Product Code sub-task as its own deliverable

**Status**: DONE
**Priority**: P1
**Created**: 2026-09-04
**Executed**: 2026-09-03 → 2026-09-04 (field-length coverage 2026-09-03; the ownership split 2026-09-04)
**Identity**: OWNER (spec + data + page-object work under BUILDER; test-case + test-plan work under GIVER)
**Parent**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md
**Depends on**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md, SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md
**Blocks**: none
**Model**: claude-opus-5
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**CoverageMode**: quick
**BrowserTool**: cli
**Jira**: [NM-2257 — Automate → Product → Add Product Code](https://encore.atlassian.net/browse/NM-2257) (sub-task of NM-2253; assignee vikas yadav)

---

## Context

NM-2253 ("Automate Item Search") is a parent Story with seven sub-tasks. Its coverage was built
**by module** (PRS / PCD / PGR), so the Product Code module's cases sat in one file that mixed two
different sub-tasks: the **View** dialog (NM-2255, next sprint) and the **Add** dialog (NM-2257,
shipping now). NM-2254 and NM-3650 were already separated the same way on 2026-09-02/03 — one plan
and one workbook per sub-task — and pushed.

This plan does the same for NM-2257, on the owner's instruction (2026-09-04): *"we need to cover
each subtask separately. like we finished other 2 subtask and pushed them already."*

It is **not** a pure repackaging. Two things landed as new work:

1. **The field-length contract** (2026-09-03). The owner asked for boundary cases on Name and
   Description. The research brief had carried NM-1386's *"256 characters"* into the request — a
   Jira value that was never re-verified against the DOM. Live probing on office 1101 proved the
   real limits are **50 / 50 / 10**. Three new cases (TC-ISR-PCD-012, 013, 014) now hold that
   contract. The stale figure was propagated by this session and corrected by this session; the
   provenance chain is in Phase 4.
2. **TC-ISR-PCD-015** (2026-09-04). Splitting the file left the Add half with no discard coverage
   of its own, because the shared TC-ISR-PCD-009 owned discard on *both* dialogs. Rather than
   narrow TC-009 — that is NM-2255 scope, and the owner ruled it untouched this sprint — a new
   Add-only discard case was authored so **NM-2257 ships self-contained with no dependency on
   NM-2255**.

### Where the NM-2255 / NM-2257 boundary comes from

The Products page toolbar renders two split buttons — **View Product Code** and **Add Product
Code** — each opening a different dialog with a different footer contract. The boundary is the
button, not judgement:

- The **Add Product Code** dialog — required-empty form, Product Type → Service Type cascade, the
  three length-capped text boxes, real Save → `POST /navigator/api/product/create` → search-back →
  **NM-2257** (this plan).
- The **View Product Code** dialog, its three tabs (Item / Product Code History / Translations),
  the five-segment View caret menu, and the View Availability button → **NM-2255** / **NM-2256**,
  which stay in `product-code.spec.ts`.

**One accepted overlap, for one sprint.** TC-ISR-PCD-009 (base file) asserts silent discard on
*both* dialogs; TC-ISR-PCD-015 (this plan) asserts it on the Add dialog only. The owner accepted
the duplication explicitly rather than edit NM-2255's cases early:

> "Leave TC-001 and TC-009 in the base file exactly as they are. Narrowing them to the View dialog
> is NM-2255 scope — add a note on NM-2255: *On pickup, narrow TC-009 (and TC-001) to View only;
> Add-side discard is covered by TC-ISR-PCD-015 in NM-2257.*"

That note is recorded in four in-repo places (both test-case files, both test plans). Jira access
from this session is **read-only**, so it could not be posted to the NM-2255 ticket — the owner
pastes it. See Handoff.

---

## Bootstrap

**Identity**: OWNER (writes to `plans/**`, `scripts/**`, `export_test_cases/**`); BUILDER for
`clients/encore/tests/**` + `src/**`; GIVER for `specs_planning/test-cases/**` + `test-plans/**`.

**Skills auto-called**:
- `/identity` (Step 1.5 gate — three switches this session, all logged)
- `/research` (the NM-2257 → NM-2253 → NM-1386 → NM-1742 → NM-1835 provenance chain)
- `/final-q` (exit per LR-042)

**Context files**:
- `plans/done/PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md` (parent)
- `plans/done/PLAN_NM2254_PRODUCT_SEARCH_FILTERS.md` + `plans/done/PLAN_NM3650_PRODUCT_SEARCH.md` (the split precedent this plan copies)
- `plans/done/SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md` (TC-ISR-PCD-011, the real save)
- `.claude/rules/specs.md` (LR-018, LR-061, LR-066, LR-067, LR-068)
- `.claude/rules/deliverable.md` (LR-058, LR-073)
- `clients/encore/CLAUDE.md` (LR-ENC-002, LR-ENC-004, LR-ENC-007, LR-ENC-008, LR-ENC-009)

---

## Phase 0 — Dependency + browser-tool gate

1. `Depends on:` → both parents are in `plans/done/`. Satisfied.
2. **BrowserTool = cli.** Reason: deterministic input-trials on three text boxes across two
   dialogs — headless `playwright-cli` on a saved session, roughly 40 field probes, unattended. No
   visual/CSS question and no human-in-loop step. Announced at the first browser call on 2026-09-03.
3. Environment: `cloudapps-e2e`, office **1101** — the parent pinned this feature to 1101 only.
   Fully writable per LR-ENC-007, so the created product codes are accepted residue.

---

## Phase 0.5b — Baseline status (inherited)

`baselineScope: baseline-absent` — inherited from the parent, not re-derived. The old-site walk was
attempted 2026-08-31 (6 access attempts; TLS reset for automated browsers while `curl` returned
200) and is recorded in `clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md`.

---

## Phase 1 — Scope owned by NM-2257

The Add Product Code dialog, reached from the toolbar with a result row selected:

| Control | Anchor | Contract |
|---|---|---|
| Add Product Code button | visible name | Mounts only with a row selected |
| Add caret menu | the arrow beside the button | Five segments: Item, Sub Class, Class, Sub Category, Category |
| Name | placeholder | Required; **max 50** characters |
| Item Description | placeholder | Required; **max 50** characters |
| Oracle Item Number | placeholder `Enter oracle item number` | Optional; **max 10** characters |
| Product Type | combobox | 10 types; required; gates Service Type |
| Service Type | combobox | Locked until Product Type is chosen, then filtered to that type |
| Save / Close | button text | Save disabled until the required set is complete; Close discards silently |

**The four non-Item Add segments are WAIVED, not silently narrowed** (LR-066). Sub Class / Class /
Sub Category / Category each open a *distinct* hierarchy-level form with its own Save — confirmed
by live probe 2026-09-02, the field counts growing up the tree — and create catalog-classification
nodes, not product codes. That is catalog management, outside the whole NM-2253 epic. The waiver
carries that reason and its probe evidence.

## Phase 2 — Test cases owned (8)

All eight live in `clients/encore/tests/item-search/add-product-code.spec.ts` and are documented in
`clients/encore/specs_planning/test-cases/setup/item-search/item_search_add_product_code_test_cases.md`.
They keep their original `TC-ISR-PCD-*` ids — the id sequence is shared with the sibling file and is
**not** renumbered, so nothing already delivered changes meaning.

| TC ID | Title | Axis | New? |
|---|---|---|---|
| TC-ISR-PCD-006 | Add Product Code opens a required-empty form with Save held back | Field (Axis 1) | moved |
| TC-ISR-PCD-007 | Choosing a Product Type unlocks and filters Service Type | paired selector | moved |
| TC-ISR-PCD-008 | The Add segment menu opens per-segment forms | Surface | moved |
| TC-ISR-PCD-011 | A completed Add Product Code form saves and the new code is found again | save + persistence | moved |
| TC-ISR-PCD-012 | The text fields stop accepting input at their maximum lengths | boundary | **new 2026-09-03** |
| TC-ISR-PCD-013 | An over-length value that bypasses the typing limit cannot be saved | boundary (negative) | **new 2026-09-03** |
| TC-ISR-PCD-014 | A name at exactly the maximum length saves and reads back complete | boundary (at-limit save) | **new 2026-09-03** |
| TC-ISR-PCD-015 | Closing the Add dialog with a part-filled form discards it silently | guard behaviour | **new 2026-09-04** |

The base `product-code.spec.ts` retains **7** — TC-ISR-PCD-001, 002, 003, 004, 005, 009, 010 — with
001 and 009 byte-identical per the owner's instruction. 7 + 8 = 15, the full pre-split set.

## Phase 3 — Deliverable wiring

| Artifact | Change |
|---|---|
| `clients/encore/tests/item-search/add-product-code.spec.ts` | NEW — 8 tests |
| `clients/encore/tests/item-search/product-code.spec.ts` | trimmed to 7; header names the sibling; dead imports pruned |
| `clients/encore/specs_planning/test-cases/setup/item-search/item_search_add_product_code_test_cases.md` | NEW — 8 TCs, own field inventory + validation rules + 11-row verification log |
| `clients/encore/specs_planning/test-plans/setup/item-search/item_search_add_product_code_test_plan.md` | NEW — 8 scenarios |
| `clients/encore/specs_planning/_internal/field-inventories/item-search-add-product-code-2026-09-03.md` | NEW — the Add-dialog half of the shared inventory, lifted unchanged; no new walk claimed |
| the two Product Code markdown files | trimmed to 7; sibling + NM-2255 pickup pointers added |
| `clients/encore/src/data/item-search/item-search.ts` | `ISR_CODE_FIELD_LIMITS` (50 / 50 / 10) with its provenance in plain English |
| `clients/encore/src/pages/item-search/product-code.page.ts` | `dialogOracleItemNumberBox`, `typeAndReadBack`, `pasteIntoBox`, `isFieldFlaggedInvalid` — each `@step`-labelled per LR-ENC-006 |
| `clients/encore/src/selectors/item-search/product-code.ts` | `PLACEHOLDER_ORACLE_ITEM_NUMBER` |
| `export_test_cases/module-codes.json` | `submodules.ISR.APC` — sheet `item_search_add_product_code` (28 chars, under the 31 cap, so no `sheetNameNotes` row), with `idModule: ISR` + `idSubmodule: PCD` so the ids stay `TC-ISR-PCD-*` |
| `scripts/deliverable/delivery-manifest.encore.json` | `ISR.APC`, **status `withheld`** — matching its sibling `ISR.PCD`. Promotion to `approved-next` needs an owner row in `approval-log.md`; this session did not mint one |

## Phase 4 — The field-length provenance chain (why 50, not 256)

Recorded because a stale Jira value reached a work request and had to be caught by the DOM
(LR-ENC-004: every Jira fact is a lead, re-verified against render truth).

| Ticket | What it says | Standing |
|---|---|---|
| NM-1386 | Product Code feature spec — Name and Description *"256 characters"* | **STALE.** Superseded; its QA sign-off contradicts the shipped app |
| NM-1742 | Shrank the product Name and Description database columns to 50 so they match the legacy sizes the Oracle integration expects | **CURRENT — the source of truth** |
| NM-1835 | QA raised the 50-character behaviour as a defect | **Closed as working as intended** — the rejection confirms 50 is deliberate |

**Two enforcement layers, both proven live 2026-09-03:**

1. **Typing** — `maxlength` truncates silently. 60 characters typed into Name → exactly 50 land; 70
   into Item Description → 50; 15 digits into Oracle Item Number → 10. No error text renders.
2. **Form model** — bypassing the typing cap with a scripted value-set puts 60 characters in the
   box; the field flags invalid and Save stays disabled, so an over-length value cannot reach the
   server.

**Positive control (LR-061 C)**: the *same* scripted setter at 20 characters cleared both invalid
flags and enabled Save — proving layer 2 is the app refusing the value, not a setter that never
registered. Recorded in `clients/encore/specs_planning/_internal/walk-evidence-item-search-field-lengths-2026-09-03.md`.

**No bug filed.** The app is correct. NM-1386's contradictory QA sign-off is a *documentation*
discrepancy, recorded in the walk evidence and not raised as a defect.

## Phase 5 — Depth NOT covered by this plan

| Gap | Classification | Disposition |
|---|---|---|
| Content / character-class validation on Name and Description (specials, unicode, leading space) | excluded by BA ruling | Out of scope for this pass; only length is contracted |
| Oracle Item Number's *semantic* validity — does the app check the number against Oracle? | domain-unknown-after-research | No ticket sets the cap; the 10 was measured on the live form, so only the length is asserted |
| The four non-Item Add segments | `parity-waived` (LR-066) | Distinct hierarchy-level creates, outside the NM-2253 epic — see Phase 1 |
| Deactivating a created product code (the only reversal — there is no hard delete) | deferred | The Active-uncheck save round-trip lives in the **View** dialog, which is NM-2255 work |
| Editing an existing product code | NM-2255 | The View dialog's own save path |

Per LR-072 these are legal dispositions on a `CoverageMode: quick` plan, not incompleteness.

---

## Per-Identity Satisfaction

| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site baseline | `(skipped: baselineScope baseline-absent — inherited from the parent)` | n/a |
| GIVER | test-cases + test-plan | clients/encore/specs_planning/test-cases/setup/item-search/item_search_add_product_code_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/item-search/item_search_add_product_code_test_plan.md | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + data + page object + selectors | clients/encore/tests/item-search/add-product-code.spec.ts | `npx playwright test tests/item-search/add-product-code.spec.ts` exit 0 |
| HEALER | — | `(none)` | n/a |
| WATCHDOG | — | `(none)` | n/a |
| GARDENER | — | `(none)` | n/a |
| OWNER | this plan + the two registries | plans/done/PLAN_NM2257_ADD_PRODUCT_CODE.md<br>export_test_cases/module-codes.json<br>scripts/deliverable/delivery-manifest.encore.json | `node scripts/validate-plan-closure.mjs --plan plans/done/PLAN_NM2257_ADD_PRODUCT_CODE.md --enforce --json` |

---

## Acceptance criteria

- [x] Every control in the Add dialog is named in Phase 1 with its contract.
- [x] All 8 owned TC IDs exist in the new spec and in the new test-cases markdown, ids unchanged.
- [x] The base file keeps exactly 7, with TC-001 and TC-009 byte-identical.
- [x] The NM-2255 / NM-2257 boundary cites a reproducible source (the two toolbar buttons).
- [x] The accepted TC-009 / TC-015 overlap is stated, with the NM-2255 pickup note in-repo.
- [x] The 50 / 50 / 10 contract traces to NM-1742 + NM-1835, with a positive control for the negative case.
- [x] `npx tsc --noEmit` exit 0.
- [x] Both specs pass solo.
- [x] `tests/item-search` run-all green (LR-018) — 59 passed, 0 failed, exit 0.
- [x] Workbook `item-search-add-product-code.xlsx` built (8 rows; the base sheet dropped to 7); `npm run check:tc-parity` PASS, exit 0 (LR-ENC-002).
- [x] Activity-log row appended per LR-028.
- [x] `/final-q` verdict emitted per LR-042.

---

## Verification

```bash
grep -o "TC-ISR-PCD-[0-9]*" clients/encore/tests/item-search/add-product-code.spec.ts | sort -u | tr '\n' ' '
```

Expect: `TC-ISR-PCD-006 007 008 011 012 013 014 015`.

```bash
grep -o "TC-ISR-PCD-[0-9][0-9][0-9]" clients/encore/tests/item-search/product-code.spec.ts | sort -u | tr '\n' ' '
```

Expect: `TC-ISR-PCD-001 002 003 004 005 009 010`.

```bash
cd clients/encore && npx playwright test tests/item-search/add-product-code.spec.ts
```

---

### Execution Summary

All acceptance items closed.

**TCs implemented (8)**: TC-ISR-PCD-006, 007, 008 and 011 moved verbatim from the shared spec;
012, 013 and 014 authored 2026-09-03 (field lengths); 015 authored 2026-09-04 (Add-side discard).

**TCs dropped**: none. The pre-split set of 15 is preserved as 7 + 8 across the two files.

**Verification results (2026-09-04)**:

1. `npx tsc --noEmit` → exit 0.
2. `npx playwright test tests/item-search/product-code.spec.ts tests/item-search/add-product-code.spec.ts --workers=1`
   → **16 passed** (15 tests + the auth setup), 3.7m, exit 0.
3. Import census: every constant imported by each spec is used in that spec. The four that became
   dead on the base side — `ISR_PRODUCT_TYPES`, `ISR_LABOR_SERVICE_SAMPLES`, `ISR_ADD_CODE`,
   `ISR_CODE_FIELD_LIMITS` — were pruned.
4. Both registries re-parse as valid JSON after the `ISR.APC` insertions, with CRLF preserved.

---

## Deviations

| # | What changed from the plan as written | Why |
|---|---|---|
| D1 | The research brief carried NM-1386's "256 characters" into the owner's request | A Jira value was propagated without DOM re-verification — the exact failure LR-ENC-004 exists to prevent. Caught by live probing before any case asserted it; the correct 50 / 50 / 10 contract is what shipped. |
| D2 | `ISR.APC` shipped as `withheld`, not `approved-next` | An `approved-next` status requires an owner row in `approval-log.md`. "NM-2257 ships in the next hour" states intent but is not the explicit per-code approval that log records — and appending to that file breaks pinned `blob_sha`s. Left for the owner's push invocation. |
| D3 | The NM-2255 pickup note lives in the repo, not on the Jira ticket | Jira access from this session is read-only. |

---

## Handoff

NM-2257 is a standalone deliverable: its own spec, its own two markdown artifacts, its own workbook
and its own manifest entry, sharing only the page object and selectors with its sibling — the same
shape NM-2254 and NM-3650 shipped in. It does not depend on NM-2255.

**Two things need the owner:**

1. **Promote `ISR.APC` to `approved-next`** when you invoke the push. It sits at `withheld` today
   because the approval log takes an explicit per-code owner row.
2. **Paste this on NM-2255** (this session's Jira access is read-only):

   > On pickup, narrow TC-009 (and TC-001) to View only; Add-side discard is covered by
   > TC-ISR-PCD-015 in NM-2257.
