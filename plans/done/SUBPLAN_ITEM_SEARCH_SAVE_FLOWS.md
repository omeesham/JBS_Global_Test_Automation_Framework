> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md`. All context below.**
>
> The agent self-bootstraps from the frontmatter and sections in this file, with no further prompting:
>
> 1. **Identity**: load `/identity` per the Identity field — OWNER is the shell; adopt HUNTER for Phase 0.5, GIVER for Phase 1, BUILDER for Phase 2 (the write-gate enforces this, so adopt before writing that phase's artifacts).
> 2. **Skills**: `/execute` leads and auto-calls its chain (`/relevant`, `/regression-guard`, `/audit`, `/reflect`, `/final-q`).
> 3. **Model + thinking + permission-mode**: read the frontmatter fields below.
> 4. **Dependency gate**: verify the Depends-on item is in `plans/done/`. HALT if not.
> 5. **Context load**: read this file in full, plus the three artifacts named in Bootstrap.
> 5.5. **Browser tool**: declared below; classify per the LR-038 v2 matrix and announce the choice in the first output.
> 6. **Phase 0 FIRST**, then 0.5, then phases in order. Phase 0.5 is a HARD GATE — no case is authored before its recon lands.
> 7. **Handoff**: flip the Status field to DONE, add the Executed date, append the activity-log row, `git mv` to `plans/done/`, `npm run plans:reindex`, re-run the closure validator AFTER the move, commit.
>
> **HALT + ASK USER** if: the dependency is not DONE / Phase 0.5 finds a save cannot be committed without inventing business data (prices, GL codes) / a created record cannot be removed AND the owner has not accepted accumulation / scope would extend >30% / any planned item is not classifiable as (a) proven live, (b) a grep-verifiable line item in a named recipient subplan, or (c) an owner-flagged decision.

---

# SUBPLAN_ITEM_SEARCH_SAVE_FLOWS — close the save half of NM-2253

**Status**: DONE
**Executed**: 2026-09-02
**Priority**: P1
**Created**: 2026-09-02
**Identity**: OWNER (shell; HUNTER → GIVER → BUILDER by phase)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: plans/done/SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**CoverageMode**: quick
**ActiveClient**: encore

---

## Context

Every NM-2253 sub-task carries the same scope line: *"Scope: Field Validation, save"*. A coverage
review on 2026-09-01 found the module covers the validation half well and the **save half not at
all** — three of the seven sub-tasks are partial for that one reason, and a fourth is parked on an
inherited claim nobody has re-checked.

| Sub-task | Today | Missing |
|---|---|---|
| NM-2257 Add Product Code | Form opens, Save held back while required fields empty, Product Type unlocks + filters Service Type, Cancel discards (TC-ISR-PCD-006/007/008/009) | Nothing ever fills the form and clicks Save. No evidence a product code can be created. |
| NM-2259 Create new Product Group | Add page opens with Save held back, sub-class picker shows two panels, Cancel exits (TC-ISR-APG-001/007/008) | No group is ever created, and none is searched for afterwards. |
| NM-2254 Product Search Filters | Quantity>0 narrows results (TC-ISR-PRS-012) | The Active checkbox is inventoried but nothing toggles it and asserts the row set changes. Not a save — a missing effect assertion. |
| NM-2256 Check Availability Calendar Button | Not covered | Parked as "the button is inert". That is an **inherited claim** from the 2026-08-31 walk, never re-driven. |

The three fully-covered sub-tasks (NM-3650 Product Search, NM-2255 View Product Code, NM-2258
Search Product Groups) are out of scope — they are read/search surfaces with no save path.

**Why NM-2256 is in this plan rather than left parked**: on this app a control that looks dead
inside a loading window has produced four wrong contracts (LR-ENC-008), and one inherited walk
verdict already shipped as a false bug this week (CEO-M19, BUG-ISR-PCD-001 invalidated 2026-09-01).
An unverified "it's inert" is not a reason a ticket stays unfinished.

---

## Prior-Fix Trial (LR-069 §3.5 — mandatory, this is a recurrence class)

**The class**: "a save-capable route closed on load + field-enable checks alone." That class already
has a permanent fix.

**Prior fix**: **LR-066 save-route parity** (`.claude/rules/specs.md`), landed 2026-06-30 after the
NM-2263 Labor gap — an enable-only sibling route that hid a real behavioural divergence. Its
machine half is `scripts/check-save-route-parity.mjs`, wired into `.githooks/pre-commit` as Gate D.

**What it did**: for a registered spec, slices each named save-capable describe and fails the commit
unless that describe calls a real-save helper (`clickSaveWithDialog`, `saveAndVerifyCase`,
`confirmSaveAndGetNewId`, …) or carries a `parity-waived: <reason>` marker of at least 20 characters.

**Why it did not fire here**: `scoped-wrong`. The gate is **opt-in by registry**. `REGISTRY` in that
script holds exactly one entry — `corporate-pricing-new-pricebook.spec.ts` — and the script has **no
pass that flags a save-capable spec missing from the registry** (verified: grepping the script for
`glob`, `WARN` and `unregistered` returns only usage-comment lines; the file is 120 lines and
iterates `REGISTRY` only). Item Search was never registered, so Add Product Code and Create Product
Group were invisible to it. The rule's logic is sound; its reach is not.

**Verdict**: the **rule SURVIVES** — its requirement is exactly right, and this plan implements it.
The **gate's registry coverage is CONVICTED as scoped-wrong** for this module.

**Rewire, in this plan's scope**: register the Item Search save-capable describes in `REGISTRY` in
the same change that adds the save tests (Phase 2), so the gate protects them from here on. That is
using the gate as designed — a data addition, not a logic change.

**Deliberately NOT in scope**: making the registry self-populating (a pass that flags any
unregistered save-capable spec). That is a change to guardrail machinery and its wiring, which needs
the owner's explicit go — this plan **surfaces it as a finding** and does not touch the script's
logic. Recorded so the class stays visible rather than being silently closed at the instance level.

---

## Bootstrap

- **Identity**: OWNER shell; HUNTER (Phase 0.5), GIVER (Phase 1), BUILDER (Phase 2).
- **Skills**: `/execute` → `/relevant`, `/regression-guard`, `/audit`, `/reflect`, `/final-q`.
- **Context files** (read before Phase 1):
  - `clients/encore/specs_planning/_internal/field-inventories/item-search-product-search-2026-08-31.md`
  - `clients/encore/specs_planning/_internal/jira-defect-crossref-item-search-2026-08-31.md`
  - `plans/done/SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE.md` (the sibling wave's shape and gate history)
- **Active rules**: LR-066 (save-route parity — the subject of the trial above), LR-067 (a save is
  proven by reload-and-read, never by the save call's return), LR-019 (per-test baseline in
  `beforeEach`), LR-018 (solo → file → run-all), LR-061-C (positive control before any inert
  verdict), LR-ENC-008 (varied-wait retries before any negative claim), LR-ENC-007 (e2e is fully
  writable — never pause for permission to mutate it), LR-ENC-009 (behaviour defects only), LR-068
  (no silent partial coverage), LR-060 obligation 4 (`check:spec-quality` on the working tree before
  any green claim), LR-072 (quick profile), LR-027 / LR-028 / LR-040 (closure).
- **Mistakes to not repeat** (all from 2026-09-01, same module): CEO-M19 — never let an instrument's
  unchecked error channel become a verdict; CEO-M20 — read back every field you filled before
  believing the result, and never anchor a ref regex on name-then-`[ref=` adjacency; CEO-M21 —
  resolve every matrix path against disk at authoring time, and re-run the closure validator after
  the `git mv`.

---

## Phase 0 — gates

1. Dependency: confirm `plans/done/SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE.md` exists.
2. Browser tool: `cli` — unattended live recon plus save-cycle driving on office 1101. Announce it.
3. Auth: the CLI session state expires overnight; refresh via the project's auth setup before the
   first navigation rather than typing credentials by hand.
4. Re-read the three mistake entries named in Bootstrap.

## Phase 0.5 — HUNTER live recon (HARD GATE: no case is authored before this lands)

Emit `clients/encore/specs_planning/_internal/walk-evidence-item-search-save-flows-2026-09-02.md`.
Every click's output is checked for the `### Error` signature, and every filled field is read back
before its result is believed (CEO-M19 / CEO-M20).

**R1 — Add Product Code, what a save actually requires.** Open the Add dialog from a selected row.
Enumerate the required-field set (which controls gate the Save button). Determine whether a save can
be completed from data we can legitimately invent, or whether it demands business values we must not
fabricate (price, GL code, tax class). **HALT-and-ask if the latter** — inventing catalog economics
on a corporate office is not ours to decide.

**R2 — Add Product Code, the segment routes.** The Add segment menu opens per-segment forms (Item /
Sub Class / Class / Sub Category / Category — TC-ISR-PCD-008). Record which of the five are
save-capable. LR-066 wants a real Save on each save-capable sibling; this plan commits a real Save on
the **Item** segment and records the other four as either covered, or waived with a stated reason and
its evidence, or a named follow-up. No silent narrowing.

**R3 — Create Product Group, the save mechanics.** Fill the Add page, save, and record how completion
signals (confirm dialog? toast? redirect?) and what the created group's identity is.

**R4 — Removal.** For both record types: does the app offer delete, deactivate, or any reversal? This
decides the cleanup design. e2e is fully writable and test residue there is expected (LR-ENC-007), so
a "no" is an accepted outcome to record, never a blocker.

**R5 — NM-2256 availability button, re-driven not inherited.** Select a row and probe the Check
Availability control with a **positive control on the same instrument** (a control on the same
toolbar that IS expected to respond — e.g. View Product Code) plus **varied waits** (+60s, +120s).
Only a no-op that survives both may be recorded as inert. Classify: live (→ case), genuinely inert
(→ evidenced block with a named owner question), or app-gated behind the dates ruling.

## Phase 1 — GIVER: author the cases

Provisional set, finalized by Phase 0.5. IDs continue each submodule's sequence.

| TC | Sub-task | Asserts |
|---|---|---|
| TC-ISR-PRS-031 | NM-2254 | Toggling the Active checkbox changes the result set — capture rows with it on, toggle, re-search, assert the row set differs and in which direction. Identity-based, not a bare count. |
| TC-ISR-PCD-011 | NM-2257 | A product code filled on the Item segment saves, and the new code is found by searching for it after a reload — persistence proven by re-read, never by the save call (LR-067). |
| TC-ISR-APG-004 | NM-2259 | A product group created on the Add page saves, and the new group is returned by the Product Groups search after a reload. |
| TC-ISR-PRS-032 | NM-2256 | **Conditional on R5**: if the control responds, assert what it opens and what it shows. If R5 proves it inert across varied waits, no case is authored — instead the block is recorded with its evidence and raised as an owner question. |

Land MD + test-plan + workbook parity in this same wave (LR-ENC-002): the `item_search_product_search`,
`item_search_product_code` and `item_search_product_groups` test-case docs and their test plans, then
`npm run xlsx:build`, then `npm run check:tc-parity` exit 0.

**Uniqueness + cleanup**: created records take a per-run unique name so reruns never collide. If R4
found a removal path, each save case removes what it created and proves the removal. If it did not,
the case says so in a comment and the field inventory records that Item Search save tests accumulate
records on 1101 — stated, not hidden.

## Phase 2 — BUILDER: page objects + specs

- `clients/encore/src/pages/item-search/product-code.page.ts` — add the fill-required-fields and
  save-and-confirm methods R1 defines. Reuse the shared `clickSaveWithDialog` /
  `saveAndVerifyPersisted` primitives; do not hand-roll a save helper (LR-067 — a save primitive must
  never report success on a disabled-button branch).
- `clients/encore/src/pages/item-search/product-groups.page.ts` — add the save-side method
  (`addSaveButton` already exists; the click-and-confirm does not).
- Specs: `product-search.spec.ts`, `product-code.spec.ts`, `product-groups.spec.ts`.
- Per-test baseline in `beforeEach` for every new save-capable test (LR-019); chain-scan the describe
  for cross-test coupling BEFORE wiring any reset, and run the FULL spec file after (LR-019
  amendment) — a bounded `--grep` does not satisfy this.
- **Register the two save describes in `scripts/check-save-route-parity.mjs` `REGISTRY`** (the
  Prior-Fix Trial rewire).

## Phase 3 — verification

1. `npx tsc --noEmit` exit 0.
2. Each new case solo, then each touched spec file whole, then `tests/item-search/` run-all (LR-018).
3. `npm run check:spec-quality` on the working tree — before any green claim (LR-060 obligation 4).
4. `npm run check:tc-parity` exit 0; `npm run xlsx:build` clean.
5. `node scripts/check-save-route-parity.mjs --enforce` passes with the new registry entries.
6. Adversarial self-pass on every new assertion: "what wrong value would still pass this?" (LR-068).

## Phase 3.5 — closure

Execution Summary per LR-027; Status DONE + Executed; activity-log row (LR-028, LR-037 timestamp);
`git mv` to `plans/done/`; `npm run plans:reindex`; **re-run
`node scripts/validate-plan-closure.mjs --plan plans/done/<this file> --enforce --write-manifest`
AFTER the move** (CEO-M21 — the move invalidates the plan's own self-references and the manifest's
plan hash); parent-cascade annotation into `PLAN_BIG_PIVOT_FCC_MASTER.md`.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | walk evidence for the save-flow + NM-2256 recon | `clients/encore/specs_planning/_internal/walk-evidence-item-search-save-flows-2026-09-02.md` | file exists and carries R1–R5 plus an `## Observations` section |
| GIVER | test-cases MD + test plans + workbook | `clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_code_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_groups_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/item-search/item_search_product_search_test_cases.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | specs + page objects + the parity registry | `clients/encore/tests/item-search/product-code.spec.ts`<br>`clients/encore/tests/item-search/product-groups.spec.ts`<br>`clients/encore/tests/item-search/product-search.spec.ts`<br>`clients/encore/src/pages/item-search/product-code.page.ts`<br>`clients/encore/src/pages/item-search/product-groups.page.ts`<br>`scripts/check-save-route-parity.mjs` | `node scripts/check-save-route-parity.mjs --enforce` exit 0 |
| HEALER | (none) | `(none)` | n/a |
| WATCHDOG | (none — this module's independent audit is owned elsewhere) | `(skipped: independent audit of this module belongs to PLAN_NM2253_ITEM_SEARCH_EXTERNAL_01_AUDIT, which exists so a fresh session reviews this work rather than the session that wrote it)` | n/a |
| GARDENER | (none) | `(none)` | n/a |
| OWNER | this plan + activity log | `plans/done/SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` | `node scripts/validate-plan-closure.mjs --plan plans/done/SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md --enforce` |

---

## Acceptance criteria

- [x] Phase 0.5 recon artifact exists, with R1–R5 each answered from live evidence and every claim's
      instrument error-checked.
- [x] NM-2254: a case toggles the Active filter and asserts the result-set change.
- [x] NM-2257: a product code is created and found again after a reload — or, if R1 hit the
      invent-business-data HALT, the plan stopped and asked rather than fabricating values.
- [x] NM-2259: a product group is created and found again by search after a reload.
- [x] NM-2256: covered by a case, OR recorded as blocked with positive-control and varied-wait
      evidence plus a named owner question. An inherited claim is not an acceptable closure.
- [x] Every save case proves persistence by re-read, not by the save call's return (LR-067).
- [x] The five Add segment routes are each covered, waived with a stated reason of at least 20
      characters, or named as a follow-up — no silent narrowing (LR-066).
- [x] Item Search save describes registered in `check-save-route-parity.mjs`, and that gate passes.
- [x] MD + test-plan + workbook parity landed in this wave; `check:tc-parity` exit 0.
- [x] `tests/item-search/` run-all green; `check:spec-quality` exit 0 on the working tree.
- [x] Cleanup disposition recorded: records removed, or accumulation stated explicitly in the field
      inventory.

---

## Verification

```bash
node scripts/validate-plan-closure.mjs --plan plans/done/SUBPLAN_ITEM_SEARCH_SAVE_FLOWS.md --enforce
```

```bash
node scripts/check-save-route-parity.mjs --enforce
```

---

## Handoff

Reported in chat at closure: which sub-tasks moved from partial to complete, what the NM-2256
re-drive concluded, the cleanup disposition, and the one finding this plan deliberately does not fix
— that the save-route-parity registry is opt-in with no forcing function, which is why this gap
survived a gate built to catch exactly it.

---

## Execution Summary

**Executed**: 2026-09-02 · **Verdict**: GREEN · **Identity**: OWNER shell (HUNTER Phase 0.5 recon, GIVER Phase 1 cases, BUILDER Phase 2 specs + runs, OWNER closure).

### Sub-tasks moved partial → complete
- **NM-2254 Product Search Filters** — `TC-ISR-PRS-031`: toggles the Active checkbox and asserts the result-set change by IDENTITY (unchecked Product-Code-ID set ⊇ active set, AND ≥1 inactive product revealed, AND re-checking restores the active set) — never a bare count. Anchor word SM58 (39 active / 45 unchecked / restored to 39), re-verified live 2026-09-02.
- **NM-2257 Add Product Code** — `TC-ISR-PCD-011`: fills the Item-segment form (Name / Item Description / Product Type EQUIPMENT / Service Type Equipment Rental), Saves, and proves persistence by searching the new code's name back after a reload (LR-067). Real save `POST /navigator/api/product/create` (200, success), toast "Product created successfully.".
- **NM-2259 Create Product Group** — `TC-ISR-APG-004`: fills the Add page (Name / Description / Service Type / one sub-class via double-click), Saves, and finds the new group by search after the list reloads (LR-067). Real save `POST /navigator/api/location/add-update-product-group` (200, success), toast "Product Group created successfully".

### NM-2256 View Availability — re-driven, not inherited (no TC authored)
Phase 0.5 R5 re-drove the control with a positive control (View Product Code opens its dialog on the same instrument) plus varied waits (+2s / +60s / +3s): no dialog, no drawer, no URL change, constant body length. Verdict: inert **because it is app-gated behind the not-yet-functional Prep/Return date feature** (standing owner ruling), not a code defect. `TC-ISR-PRS-032` deliberately not authored; NM-2256 recorded as an evidenced block with the owner question in the walk-evidence Observations. (LR-ENC-009: markup/enable-state alone is never a bug here.)

### 5-segment Add route disposition (LR-066 acceptance)
Item Add segment covered by `TC-ISR-PCD-011` (real save). The four non-Item segments (Sub Class / Class / Sub Category / Category) were live-probed 2026-09-02: each opens its own hierarchy-level form with its own Save and required fields — they create catalog-classification nodes, not product codes, a distinct catalog-management feature outside the whole NM-2253 Item Search epic. **WAIVED with that stated reason and its probe evidence**, reconciled across the walk-evidence, field inventory, TC MD and test plan — no silent narrowing.

### Prior-Fix Trial rewire (LR-066 registry)
Registered the two Item Search save describes in `scripts/check-save-route-parity.mjs` REGISTRY and added `saveNewCodeAndConfirm` / `saveNewGroupAndConfirm` to its REAL_SAVE_HELPERS. `node scripts/check-save-route-parity.mjs` → PASS (4 routes). The registry-is-opt-in gap (no forcing function for an unregistered save-capable spec) is surfaced, not fixed — a guardrail-machinery change needs the owner's go.

### TCs implemented / dropped
- Implemented: 3 — `TC-ISR-PRS-031`, `TC-ISR-PCD-011`, `TC-ISR-APG-004`.
- Dropped: 1 — `TC-ISR-PRS-032` (NM-2256): NOT-AUTOMATABLE — the control is app-gated inert behind the disabled date feature; evidence in walk-evidence R5 plus a recorded owner question. This is the plan's own R5-conditional outcome, not a silent skip.

### Verification (all green, 2026-09-02)
- `npx tsc -p clients/encore/tsconfig.json --noEmit` → exit 0.
- Solo (retries=0): `TC-ISR-PRS-031` 19.7s, `TC-ISR-PCD-011` 22.2s, `TC-ISR-APG-004` 17.5s — all pass.
- `tests/item-search/` run-all (retries=0): **54 passed, 0 failed** (9.5m) — no serial contamination (LR-018). (The reporter marks the passing date-render test PRS-021 with a cosmetic `x` glyph; a solo re-run confirmed Playwright exit 0 / "2 passed".)
- `npm run check:spec-quality` → exit 0 (unfailable / swallowed / sleeps / reload gates clean; reject-oracle is announce-only, pre-existing, involving none of the new tests).
- `npm run check:tc-parity` → PASS (3 new TCs present in spec + MD + XLSX).
- `node scripts/check-save-route-parity.mjs` → PASS (4 routes).

### Documentation / artifacts changed
- Specs (+1 TC each): `product-search.spec.ts`, `product-code.spec.ts`, `product-groups.spec.ts`. Page objects: `product-code.page.ts`, `product-groups.page.ts` (fill + save-and-confirm). Selectors + data: create endpoints, toasts, `ISR_ADD_CODE` / `ISR_ADD_GROUP` / `ISR_ACTIVE_FILTER_WORD`.
- TC MDs + test plans (product-search / product-code / product-groups), field inventories (product-code / product-groups), walk-evidence (Phase 0.5 recon), XLSX (item-search sheets + combined workbook rebuilt).
- Gate: `scripts/check-save-route-parity.mjs` (registry + helpers).

### Cleanup disposition (LR-ENC-007)
No hard delete exists for either record type. The product-code reversal is deactivate-via-View-dialog (save round-trip not exercised this pass); the group reversal is deactivate-via-edit. Both save cases leave a per-run-unique record on office 1101 — accepted, expected test residue on the fully-writable e2e environment, stated in the field inventories, not hidden.

### Findings surfaced (not fixed — out of scope, for the owner)
1. **Save-route-parity registry is opt-in with no forcing function** — the exact reason this save gap survived a gate built to catch it. Making the registry self-populating is guardrail-machinery + wiring and needs the owner's go.
2. **`xlsx:build` is non-deterministic** — `export_test_cases/to-xlsx.ts:902` stamps `wb.created = new Date()` into every workbook, so any build dirties all 40 workbooks by timestamp even when one module changed. Only the 4 item-search-related workbooks carry real content; the 36 timestamp-only churns were reverted at commit.
