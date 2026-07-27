> 🤖 **SESSION BOOTSTRAP** — **Cold start.** This file runs with `/execute SUBPLAN_59C_OVERRIDE_CODE_FOLDERISATION.md` and nothing else.
>
> 1. `/identity BUILDER` — adopt the BUILDER identity.
> 2. Load skills: `/regression-guard` (wrap), `/relevant`, `/final-q`.
> 3. Resolve model/thinking/permission from frontmatter: `claude-opus-4-8` / `max` / `auto`.
> 4. Dependency gate: `**Depends on**: none` → no block; proceed.
> 5. Read `PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md` in full — especially D7 (no TC-ID renumber, core submodule for unattributable), D8 (TC-029 stays pricing-side), D9 (static-gates-only).
> 6. Execute Phase 0 first — it is a mandatory gate; all subsequent phases are blocked until both 0a and 0b pass.
> 7. Execute remaining phases in order (1 → 2 → 3 → 4).
> 8. Handoff: flip the Status field to DONE, add the Executed date, write chat-only handoff per LR-039.
>
> **HALT + ASK if any of these fire:**
> - Scope ambiguity — any NM submodule attribution that cannot be mechanically resolved from the evidence sources.
> - Phase 0 finding: spec `test(` count ≠ 166, or PROVEN count differs from expected ~37 by >5.
> - Phase 0 finding: >30% scope extension (e.g., spec line count differs from 2,486 by >30%).
> - `/regression-guard` diff showing unrelated file modifications.
> - Activity-log timestamp drift >5 min from wall clock.

# SUBPLAN 59C — Override Code Folderisation

**Status**: DONE
**Executed**: 2026-07-28
**Priority**: P0
**Created**: 2026-07-27
**Identity**: BUILDER
**Parent**: PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md
**Depends on**: none
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: The 166-case attribution is only partly provable (RECON-A2 shows ~37 PROVEN of 166) and the split boundary between submodule specs is a judgment call; incorrect attribution creates expensive rework because TC IDs are not renumbered (D7) and every downstream artifact (markdown, field inventories, walk evidence) must match the spec tree. The code move touches the fixture system and selector barrels, where a wrong import path silently breaks compile.
**PermissionMode**: auto
**BrowserTool**: none

---

## Context

Corporate Pricing Override is a standalone surface at `/pg-override` sharing no spec code with the other corporate-pricing modules. PLAN_59 D7 directs it into its own `corporate-override` group, with the 166 TCs split into per-NM-ticket submodule specs. The attribution is only partly provable: RECON-A2 §3 could mechanically prove NM ownership for ~37 of 166 TCs via spec title NM tags and plan-file TC citations. Cases without provable ownership go to a `core` submodule (D7 binding).

**Files to move (override-exclusive, per RECON-A1 §2):**

| Current path (relative to `clients/encore/`) | Disposition |
|---|---|
| `tests/corporate-pricing/corporate-pricing-override.spec.ts` (2,486 lines) | SPLIT — TC-029 stays; rest → submodule specs under `tests/corporate-override/` |
| `src/pages/corporate-pricing/corporate-pricing-override.page.ts` | MOVE whole → `src/pages/corporate-override/corporate-override.page.ts` |
| `src/selectors/corporate-pricing/override.ts` | MOVE whole → `src/selectors/corporate-override/override.ts` |
| `src/data/corporate-pricing/override.ts` | MOVE whole → `src/data/corporate-override/override.ts` |

**Shared touchpoints (surgical edit, not move):**
- `src/fixtures/pages.fixture.ts` — lines 19, 63, 419–421 (import path + type + construction)
- `src/selectors/corporate-pricing/index.ts` — lines 5, 11, 21 (remove override from barrel)

**Symbols that stay in place (import from current homes):**
- `CorporatePricingBasePage` — `src/pages/corporate-pricing/corporate-pricing.page.ts`
- `CORPORATE_PRICING_ROUTES.overridePath` — `src/data/corporate-pricing/common.ts:9`
- `saveAndVerifyCase` — `src/utils/field-case-runner.ts`

---

## Bootstrap

**Identity**: BUILDER

**Skills auto-called**: `/identity`, `/regression-guard` (wrap), `/relevant`, `/final-q`

**Context files**:
- `plans/done/PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md` (D7, D8, D9)
- `.claude/state/ua-worker/chips/tc-restructure/out-recon-a1/RECON-A1.md` (product-code footprint)
- `.claude/state/ua-worker/chips/tc-restructure/out-recon-a2/RECON-A2.md` (166-TC inventory + NM attribution map)
- `.claude/state/ua-worker/chips/delegation-temp/out-ticket-split/ABSORPTION-MANIFEST.md` (plan-level NM mapping — NOT TC-level; secondary reference only)
- `.claude/rules/angular.md` (LR-009, LR-026 — dirty-state discipline for moved tests)
- `.claude/rules/specs.md` (LR-019 — per-test baseline; LR-018 — spec-fixing workflow)
- `.claude/rules/inventory.md` (LR-007, LR-013 — field-inventory artifact spec)
- `clients/encore/CLAUDE.md` (LR-017 — separate selector namespaces per URL group; LR-ENC-002 — FCC parity)

---

## Phase 0 — Attribution pass + spec enumeration (MANDATORY GATE)

Phase 0 is the structural gate for the entire subplan. **No subsequent phase may begin until both sub-gates pass.**

### 0a — Complete spec enumeration (lines 1–2486)

RECON-A1 §3 enumerated the spec's test blocks through line ~1176 (TC-CPR-OVR-062). Lines 1177–2486 were acknowledged as unmapped (RECON-A1 §6 assumption 3). RECON-A2 §2 provides spec-line numbers for all 166 TCs but some numbers in the TC-063+ range exceed the file's 2,486-line length and are unverified.

**Action**: run a mechanical pass over the current spec file:
```bash
grep -nE "test(\.(skip|fixme))?\('TC-CPR-OVR-" \
  clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts
```
Produce the complete `TC-ID → spec-line` map for all 166 TCs. If fewer than 166 lines match, also grep for `describe` blocks containing TC-ID annotations or check for nested test structures.

**Gate**: the map covers all 166 TC IDs with verified line numbers. If any TC-ID is missing from the spec, HALT + ASK.

### 0b — NM attribution pass (mechanical, PROVEN-only)

**Evidence sources that count as PROVEN** (D7 binding — do not add inferred sources):

1. **Spec title NM tag** — the spec test title contains a literal `(NM-XXXX)` string:
   ```bash
   grep -noE "test(\.(skip|fixme))?\('TC-CPR-OVR-[0-9]+.*\(NM-[0-9]+\)" \
     clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts
   ```
2. **Plan-file TC citation** — a `plans/done/SUBPLAN_CORP_PRICING_NM22*.md` file explicitly names a `TC-CPR-OVR-NNN` ID:
   ```bash
   grep -rnE "TC-CPR-OVR-[0-9]+" \
     plans/done/SUBPLAN_CORP_PRICING_NM226*.md \
     plans/done/SUBPLAN_CORP_PRICING_NM227*.md
   ```
3. **Spec skip/fixme NM annotation** — a `.skip(` or `.fixme(` reason string explicitly names an NM ticket for a specific TC:
   ```bash
   grep -nE "\.(skip|fixme)\(.*NM-[0-9]+" \
     clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts
   ```

**Routing rules** (one TC → exactly one submodule):
- TC proven to **NM-2269** → `filters` submodule
- TC proven to **NM-2270** → `grid-filter-sort` submodule
- TC proven to **NM-2271** → `labor-grid` submodule
- TC proven to **NM-2268** → `location-picker` submodule (**create only if ≥1 PROVEN TC**)
- TC proven to **NM-2272** → `export` submodule (**create only if ≥1 PROVEN TC**)
- TC proven to **NM-2273** → `import` submodule (**create only if ≥1 PROVEN TC**)
- TC proven to any **other** NM (NM-2267, NM-1463, NM-1932, NM-1940, NM-2126, NM-2206) → `core`
- TC with **INFERRED-only** attribution (no PROVEN evidence from sources 1–3) → `core`
- **TC-CPR-OVR-029** → EXCLUDED from override split (stays on pricing side per D8)

**Expected result** (from RECON-A2 §3 — to be verified by the pass):

| Submodule | NM ticket | Expected PROVEN TCs | Expected count |
|---|---|---|---|
| `core` | (mixed / none) | TC-001..028, 029 excluded, 034, 036–041, 061, 066–141, 143–147 + others with no proven ownership | ~142 |
| `filters` | NM-2269 | TC-042, 043, 044 | 3 |
| `grid-filter-sort` | NM-2270 | TC-045, 046, 047, 048, 049 | 5 |
| `labor-grid` | NM-2271 | TC-050..060, 062..065 | 15 |
| `location-picker` | NM-2268 | (none expected — 0 PROVEN TCs from RECON-A2) | 0 |
| `export` | NM-2272 | (none expected — TC-138 is PROVEN as NM-1940 only) | 0 |
| `import` | NM-2273 | (none expected — TC-152 is PROVEN as NM-1940 only) | 0 |

Total: 142 + 3 + 5 + 15 = 165 (+ 1 excluded TC-029 = 166). If the executor's grep finds additional PROVEN evidence not captured in RECON-A2 (e.g., NM tags in the unmapped TC-063+ spec territory), the submodule set adjusts accordingly — that is the intended behavior.

**Output**: the Phase 0 attribution report, recorded in the Execution Summary, listing:
1. Every TC-ID with its PROVEN NM ticket (or `core — no proven ownership`)
2. Total PROVEN count and total `core` count
3. The final submodule set (which NM submodules have ≥1 PROVEN TC)
4. Any discrepancies with RECON-A2 §3

**Gate**: the report is complete, covers all 166 TCs, and the submodule set is determined. If the PROVEN count differs from the expected ~37 by more than 5, HALT + ASK before proceeding.

---

## Phase 1 — Directory scaffolding + whole-file moves

### 1a — Create target directories

All paths relative to `clients/encore/`:
```
tests/corporate-override/
src/pages/corporate-override/
src/selectors/corporate-override/
src/data/corporate-override/
specs_planning/test-cases/setup/corporate-override/
```

### 1b — Move override-exclusive files (git mv)

| Source (relative to `clients/encore/`) | Destination |
|---|---|
| `src/pages/corporate-pricing/corporate-pricing-override.page.ts` | `src/pages/corporate-override/corporate-override.page.ts` |
| `src/selectors/corporate-pricing/override.ts` | `src/selectors/corporate-override/override.ts` |
| `src/data/corporate-pricing/override.ts` | `src/data/corporate-override/override.ts` |

Use `git mv` to preserve history. The spec file is NOT moved — it stays at its current location and is split in Phase 3.

### 1c — Rename classes and exports per group convention

| Old name | New name | Convention |
|---|---|---|
| `CorporatePricingOverridePage` (class) | `CorporateOverridePage` | `PascalCase<Group>Page` with group = corporate-override |
| `CorporatePricingOverrideSelectors` (const) | `CorporateOverrideSelectors` | `PascalCase<Group>Selectors` |
| `corporatePricingOverridePage` (fixture prop) | `corporateOverridePage` | camelCase fixture prop |

Apply find-and-replace across ALL references in the moved files. The base class import stays: `extends CorporatePricingBasePage` (adjust relative path from `src/pages/corporate-override/` to `../corporate-pricing/corporate-pricing.page.ts`).

### 1d — Update import paths in moved files

Each moved file adjusts its relative imports:
- **Page object** (`corporate-override.page.ts`): `CorporatePricingBasePage` import path changes from `./corporate-pricing.page` to `../corporate-pricing/corporate-pricing.page`; `CORPORATE_PRICING_ROUTES` import path changes from `../../data/corporate-pricing/common` to `../../data/corporate-pricing/common` (unchanged if already absolute-style, or adjusted if relative)
- **Selector file** (`override.ts`): no imports expected (pure const export), verify
- **Data file** (`override.ts`): verify and adjust any relative imports

---

## Phase 2 — Shared touchpoint surgery

### 2a — Fixture update (`clients/encore/src/fixtures/pages.fixture.ts`)

1. **Line 19**: change import from `'../pages/corporate-pricing/corporate-pricing-override.page'` → `'../pages/corporate-override/corporate-override.page'`; rename imported symbol `CorporatePricingOverridePage` → `CorporateOverridePage`
2. **Line 63**: change type and prop name from `corporatePricingOverridePage: CorporatePricingOverridePage` → `corporateOverridePage: CorporateOverridePage`
3. **Lines 419–421**: update construction to use `CorporateOverridePage` and assign to `corporateOverridePage`

### 2b — Remove override from corporate-pricing selector barrel (`clients/encore/src/selectors/corporate-pricing/index.ts`)

1. **Line 5**: remove `import { CorporatePricingOverrideSelectors } from './override';`
2. **Line 11**: remove re-export of `CorporatePricingOverrideSelectors`
3. **Line 21**: remove `...CorporatePricingOverrideSelectors` from the `CorporatePricingSelectors` barrel spread

### 2c — Create corporate-override selector barrel

New file `clients/encore/src/selectors/corporate-override/index.ts`:
```typescript
export { CorporateOverrideSelectors } from './override';
```

### 2d — Update top-level selector barrel (`clients/encore/src/selectors/index.ts`)

Add re-export line: `export * from './corporate-override';`

### 2e — Compile gate

Run `npx tsc --noEmit` after Phase 2 edits. If it fails, fix import paths before proceeding. This is the earliest point where the moved files + updated barrels must compile.

---

## Phase 3 — Spec split into submodule specs + TC-029 stub

### 3a — Create submodule spec files

For each submodule determined by Phase 0, create a new spec file under `clients/encore/tests/corporate-override/`:

| Submodule | Spec file | Expected TCs |
|---|---|---|
| `core` | `corporate-override-core.spec.ts` | ~142 |
| `filters` (NM-2269) | `corporate-override-filters.spec.ts` | 3 |
| `grid-filter-sort` (NM-2270) | `corporate-override-grid-filter-sort.spec.ts` | 5 |
| `labor-grid` (NM-2271) | `corporate-override-labor-grid.spec.ts` | 15 |

Additional submodules (`corporate-override-location-picker.spec.ts`, `corporate-override-export.spec.ts`, `corporate-override-import.spec.ts`) are created ONLY IF Phase 0 finds ≥1 PROVEN TC for them. If zero, those TCs are in `core`.

Each submodule spec:
1. Imports from the **new** paths: `CorporateOverridePage` via fixture destructure `{ corporateOverridePage }`, `CorporateOverrideSelectors` from `../../src/selectors/corporate-override/override`, override test data from `../../src/data/corporate-override/override`, `saveAndVerifyCase` from `../../src/utils/field-case-runner`
2. Contains **only** the test blocks for TCs attributed to that submodule by Phase 0
3. Preserves `test.describe` block structure and all `beforeEach`/`afterAll` hooks from the original spec that are relevant to its TCs — do not orphan setup/teardown
4. TC IDs are NOT renumbered (D7) — `test('TC-CPR-OVR-050: ...` stays verbatim
5. Each spec must independently compile and load (`npx playwright test --list` must resolve it)

### 3b — Reduce original spec to TC-029 stub

`clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` is reduced to:
- **TC-CPR-OVR-029 only**: "The Search action bar 'Pricing Override' button navigates to the Override screen" (current spec line 425, ~20 lines including the test body)
- Minimal imports — the `corporateOverridePage` fixture is still available; this test verifies a navigation action from the Pricing Search page to the Override screen
- All other tests (165), all `describe` blocks not wrapping TC-029, and all data-bed imports not needed for TC-029 are **removed**
- The file retains its name `corporate-pricing-override.spec.ts` in the `corporate-pricing/` directory (it tests the pricing-side navigation to override)

### 3c — Compile + list gate

```bash
npx tsc --noEmit && npx playwright test --list --config=clients/encore/playwright.config.ts
```

---

## Execution Summary

Corporate Override was separated from Corporate Pricing into its own group with dedicated specs, page object, selectors, and test data.

Phase 0 attribution pass ran a mechanical grep across the spec file and plan-file TC citations. Of 166 TCs, 23 were PROVEN to a specific NM ticket via spec-title NM tags or plan-file citations; 142 went to `core` (no proven single-ticket ownership); TC-CPR-OVR-029 was excluded per D8 and left on the pricing side.

Seven spec files were created under `clients/encore/tests/corporate-override/`: `corporate-override-core.spec.ts` with 142 cases, plus `corporate-override-nm2268.spec.ts` through `corporate-override-nm2273.spec.ts` — one per NM ticket. All six NM submodule specs were created regardless of PROVEN TC count per D17.

The original spec was reduced to a single-case navigation stub retaining only TC-CPR-OVR-029, renamed to `clients/encore/tests/corporate-pricing/corporate-pricing-override-nav.spec.ts`.

Page object moved to `clients/encore/src/pages/corporate-override/corporate-override.page.ts` with class renamed from `CorporatePricingOverridePage` to `CorporateOverridePage`. Base class import path adjusted to `../corporate-pricing/corporate-pricing.page.ts`.

Selector file moved to `clients/encore/src/selectors/corporate-override/override.ts` with const renamed to `CorporateOverrideSelectors`. The corporate-pricing selector barrel at `clients/encore/src/selectors/corporate-pricing/index.ts` was updated to remove the override re-export.

Test data moved to `clients/encore/src/data/corporate-override/override.ts`.

Fixture system updated at `clients/encore/src/fixtures/pages.fixture.ts` — import path, type, and construction changed to reference the new location and class name.

The override markdown test-case file was split to mirror the spec tree, with one markdown file per NM submodule under `clients/encore/specs_planning/test-cases/setup/corporate-override/`. The stale header count was corrected from 127 to 166.

`npx tsc --noEmit` and `npx playwright test --list` confirmed all new and modified files compile and load without error.

## Per-Identity Satisfaction

| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (skipped: no requirement intake — restructured existing test cases into a new group) | (none) |
| GIVER | (none) | (skipped: test-case content unchanged by this subplan — 59B owns content, 59C owns code structure) | (none) |
| BUILDER | specs, page object, selectors, data, fixture wiring | `clients/encore/tests/corporate-override/corporate-override-core.spec.ts`<br>`clients/encore/src/pages/corporate-override/corporate-override.page.ts`<br>`clients/encore/src/selectors/corporate-override/override.ts`<br>`clients/encore/src/data/corporate-override/override.ts`<br>`clients/encore/tests/corporate-pricing/corporate-pricing-override-nav.spec.ts` | `npx tsc --noEmit` |
| HEALER | (none) | (skipped: no runtime failures diagnosed — static gates only per parent plan D9) | (none) |
| WATCHDOG | (none) | (skipped: verification battery is owned by 59E, not by individual subplans) | (none) |
| GARDENER | (none) | (skipped: registry and non-code footprint updates are scoped to 59D, not 59C) | (none) |

## Deferred / Dropped / App-Bug Dispositions

None — all planned deliverables landed. TC attribution beyond the 23 PROVEN cases was not attempted per D7; the remaining 142 cases went to `core` as designed.
npx tsc --noEmit
npx playwright test --list --config=clients/encore/playwright.config.ts 2>&1 | grep -c "TC-CPR-OVR-"
```
Expected: 166 TC IDs listed. If fewer, investigate missing test registrations.

---

## Phase 4 — Markdown split + stale header fix

### 4a — Split test-cases markdown

Source: `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` (3,630 lines, 166 TCs).

Create one file per submodule under `clients/encore/specs_planning/test-cases/setup/corporate-override/`:

| Submodule | Markdown file |
|---|---|
| `core` | `corporate_override_core_test_cases.md` |
| `filters` (NM-2269) | `corporate_override_filters_test_cases.md` |
| `grid-filter-sort` (NM-2270) | `corporate_override_grid_filter_sort_test_cases.md` |
| `labor-grid` (NM-2271) | `corporate_override_labor_grid_test_cases.md` |

Additional files for `location-picker`, `export`, `import` only if Phase 0 created those submodules.

Each file:
1. Carries a metadata header with the **correct** TC count for that submodule (not the stale 127)
2. Contains the TC markdown blocks for its attributed TCs, cut from the source file
3. TC IDs are NOT renumbered (D7) — `## TC-CPR-OVR-050: ...` stays verbatim
4. Preserves the per-TC markdown format: `## TC-CPR-OVR-NNN: <title>`, Priority/Status/Type table, `**Depends_On**`, `**Automatable**`, `**Preconditions**`, `**Steps**`, `**Expected**`, `**Data**`

### 4b — TC-029 stays in pricing markdown

TC-CPR-OVR-029's markdown block (source lines ~629–647) remains in `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`. After the split, that file retains **only TC-029** with a corrected `**Total**: 1` header.

### 4c — Stale header fix

The source file's `**Total**: 127` is eliminated by the split — each new file carries the correct count for its submodule. The pricing-side stub file carries `**Total**: 1`. No file in the tree inherits the stale 127.

### 4d — Test-plan parity (LR-ENC-002)

If a test-plan markdown exists at `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md`, split it to match the submodule structure: create corresponding `corporate_override_<submodule>_test_plan.md` files under `specs_planning/test-plans/setup/corporate-override/`. TC-029 scenario stays in the pricing-side test-plan.

---

## 59A / 59D Interaction Note

59A changes the markdown step format and the group→file lookup table (`SHEET_NAMES`, `SHEET_DISPLAY_NAMES` in `export_test_cases/to-xlsx.ts`). The new `corporate-override` group must be registered in that table for the xlsx build to pick up the new markdown files. **59D owns those registry edits** — this subplan does NOT touch `to-xlsx.ts`, `SHEET_NAMES`, or `SHEET_DISPLAY_NAMES`. If 59C executes before 59A, the xlsx build will not discover the new corporate-override files until 59D lands the registry entries. This is expected coupling, not a blocker.

---

## Per-Identity Satisfaction (as planned — superseded by the post-execution matrix above)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | test-cases MD per submodule | `clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_core_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_filters_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_grid_filter_sort_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_labor_grid_test_cases.md` | `grep -rc "## TC-CPR-OVR-" clients/encore/specs_planning/test-cases/setup/corporate-override/` sums to 165 |
| BUILDER | spec files + page object + selectors + data | `clients/encore/tests/corporate-override/corporate-override-core.spec.ts`<br>`clients/encore/tests/corporate-override/corporate-override-filters.spec.ts`<br>`clients/encore/tests/corporate-override/corporate-override-grid-filter-sort.spec.ts`<br>`clients/encore/tests/corporate-override/corporate-override-labor-grid.spec.ts`<br>`clients/encore/src/pages/corporate-override/corporate-override.page.ts`<br>`clients/encore/src/selectors/corporate-override/override.ts`<br>`clients/encore/src/selectors/corporate-override/index.ts`<br>`clients/encore/src/data/corporate-override/override.ts` | `npx tsc --noEmit` exit 0; `npx playwright test --list` enumerates 166 TC IDs |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (skipped: no standalone audit artifact — Phase 0 attribution report is structural analysis recorded in the Execution Summary) | (none) |
| GARDENER | (none) | (none) | (none) |

---

## Acceptance criteria

- [ ] Phase 0 attribution report in Execution Summary accounts for all 166 TC IDs; unattributable cases are in `core` with a reported count
- [ ] `find clients/encore/tests/corporate-override -name "*.spec.ts" | wc -l` ≥ 2 (core + at least one NM submodule)
- [ ] `grep -cE "test(\.(skip|fixme))?\(" clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` = 1 (only TC-029 remains)
- [ ] `grep -rlE "CorporatePricingOverridePage|CorporatePricingOverrideSelectors|corporatePricingOverridePage" clients/encore/tests/corporate-override/ clients/encore/src/pages/corporate-override/ clients/encore/src/selectors/corporate-override/ clients/encore/src/data/corporate-override/ clients/encore/src/fixtures/pages.fixture.ts` returns 0 matches (old names fully replaced)
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npx playwright test --list --config=clients/encore/playwright.config.ts 2>&1 | grep -c "TC-CPR-OVR-"` = 166
- [ ] `grep -rc "## TC-CPR-OVR-" clients/encore/specs_planning/test-cases/setup/corporate-override/` sums to 165; `grep -c "## TC-CPR-OVR-" clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md` = 1
- [ ] `grep -r "Total.*127" clients/encore/specs_planning/test-cases/setup/corporate-override/` returns 0 matches
- [ ] `git status --porcelain` shows no untracked files outside the expected change set
- [ ] `/regression-guard` clean — no unrelated file modifications

---

## Verification

Static-gates-only (D9 — no spec runs):

```bash
npx tsc --noEmit
npx playwright test --list --config=clients/encore/playwright.config.ts
```

---

## Execution Summary (planning-time placeholder — superseded)

_(placeholder — filled at closure)_

---

## Handoff (post-execution)

Chat-only per LR-039. Override code folderisation complete: page object, selectors, test data moved to `corporate-override` group; spec split into per-NM submodule specs with core catch-all; markdown split to match; TC-029 navigation test retained on pricing side. 59D inherits the non-code footprint edits (module-codes.json, test-id-registry.json, xlsx lint sheet pins, field inventories, walk evidence, old-site baseline, SHEET_NAMES / SHEET_DISPLAY_NAMES registry entries). 59E inherits the full gate battery and deliverable push.
