# Plan 15: Framework Maintainer Agent

**Status**: PENDING
**Priority**: P1 — no agent currently catches code quality issues, type duplication, or repo drift
**Scope**: Create one agent file + 12 rules. One session. First sweep has 14 known issues pre-loaded.
**Prerequisite**: PLAN_14 done first (clean repo = clean baseline for the agent)

---

## What This Agent Does

Checks code quality, reusability, and repo health. Different from Audit agent:
- **Audit** = agent compliance, pipeline correctness, rule enforcement
- **Maintainer** = code quality, DRY, dead files, type hygiene, folder conventions

Runs on demand (not in pipeline). Invoked after a batch of specs, before a release, or when user asks "is the repo clean?"

---

## Agent File

Create `.github/agents/playwright-framework-maintainer.agent.md`

**YAML frontmatter:**
```yaml
name: playwright-framework-maintainer
description: 'Framework Maintainer: code quality, reusability, repo health. Use when you need to check for dead files, duplicate code, missing exports, inconsistent patterns.'
tools: ['vscode', 'execute', 'read/readFile', 'agent', 'edit', 'search', 'todo']
model: Claude Sonnet 4.5
```

No MCP browser. This agent reads code, not websites.

**HARD STOPS:**
0. MISTAKES FIRST
1. USER SAYS STOP = STOP
2. NO BUSINESS LOGIC CHANGES — never change test assertions, expected values, or application business rules. Structural refactoring IS allowed (data-driven loops, method extraction, import consolidation) as long as WHAT the tests verify doesn't change
3. VERIFY BEFORE DELETE — grep for references. If referenced → do NOT delete

**Workflow (single mode — sweep):**
1. `npx tsc --noEmit` — compile check
2. `npm run validate:sync` — rule sync check
3. Grep for duplicate interfaces across `src/pages/` and `src/common/`
4. Verify every `*.page.ts` is exported from `src/pages/index.ts`
5. Verify every selector partition is imported in `src/selectors/index.ts`
6. Check page object methods against BasePage for duplication
7. Find `.bak`, `.tmp`, unreferenced files
8. Check `.spec.ts` files are in `tests/` not `src/`
9. Report findings + fix what's safe to fix
10. `npm run validate:sync` — final gate

**File Permissions:**
- READ-WRITE: `src/pages/`, `src/common/base-page.ts`, `tests/`, `package.json`, `specs_planning/agent-mistakes.md`
- READ-ONLY: everything else (selectors, scripts, agent prompts)

---

## Rules (MNT-001 through MNT-012)

Initial 7 + 5 from spec audit (2026-03-04). Add more from real sweep findings.

| ID | Rule | Resolution |
|----|------|------------|
| MNT-001 | Duplicate interface detection: grep for same `{ field: type }` shape in 2+ page objects. Canonical source wins, others import | CheckboxState shape defined 4× (3 named interfaces in page objects + 1 inline return type in BasePage) |
| MNT-002 | Barrel export completeness: every `*.page.ts` must be in `src/pages/index.ts`. Every selector partition must be in `src/selectors/index.ts` | LocationPricingPage missing from barrel |
| MNT-003 | Method duplication: if same pattern exists in BasePage AND a page object, the page object must delegate. Not reimplement | Currency reimplemented checkbox helpers that exist in FormHelpers; Pricing `reloadPricingTab` reimplements BasePage `navigateToSubTab` pattern |
| MNT-004 | Selector registry compliance: no raw CSS selectors in page object methods. Use `getElement(key)` or `getLocator(key)` | Pricing hardcoded data-testid in waitForSaveEnabled |
| MNT-005 | Dead file detection: `.bak`, `.tmp`, `.orig` files = delete. Files not imported anywhere = investigate | 4 .bak files accumulated |
| MNT-006 | Test location: `.spec.ts` files belong in `tests/`, not `src/` | 5 adapter tests in src/data/adapters/__tests__/ |
| MNT-007 | `npx tsc --noEmit` and `npm run validate:sync` must both pass clean after any changes | — |
| MNT-008 | Data-driven test compaction: when 2+ tests have identical flow differing only in a selector key or value, refactor into a `for...of` loop over a data array. Each test still gets its own TC ID via template literal | Pricing TC-024/025 (checkbox persistence) + TC-026..030 (dropdown persistence) = 7 identical-flow tests that should be 2 data-driven loops. ~120 lines → ~35 |
| MNT-009 | Shared test constants: values used identically in 3+ spec files must live in a shared constants file (`tests/test-data/common.data.ts`), not be redefined per spec | `OFFICE_NO = '1604'` defined identically in 3 specs |
| MNT-010 | Timeout consolidation: `test.setTimeout()` should be set at `test.describe` level as default. Per-test overrides only for genuinely exceptional tests (e.g., multi-step save-reload cycles) | 12+ scattered setTimeout calls in pricing spec alone |
| MNT-011 | Stale JSDoc cleanup: duplicate or outdated JSDoc comment blocks must be removed. One JSDoc per method/class | LocalInfo page has duplicate JSDoc on `navigateToLocalInfoTab` |
| MNT-012 | Shared utility extraction: methods used by 2+ page objects with identical logic (differing only in selector keys) must be extracted to BasePage with parameterized keys | `waitForSaveEnabled` (save button polling) only on Pricing but all tabs have save buttons. `getColumnHeadersByKeys` pattern in 2 pages. `getFieldDisplayValue` pattern in 3 methods |

---

## Workflow Steps (expanded)

Add to the existing sweep workflow:

```
11. Spec compaction scan: for each .spec.ts file, count tests with identical flow structure.
    If 2+ tests differ only by selector key / data value → flag for data-driven refactor (MNT-008)
12. Shared constants scan: grep for identical const values across 3+ spec files → flag for extraction (MNT-009)
13. Timeout audit: count test.setTimeout() calls per describe block.
    If >50% of tests override → suggest describe-level default (MNT-010)
14. JSDoc lint: find methods with 2+ JSDoc blocks → flag stale duplicate (MNT-011)
15. Cross-page utility scan: find methods with identical logic in 2+ page objects.
    If only selector keys differ → flag for BasePage extraction (MNT-012)
```

---

## Execution Steps

1. Add MNT-001..012 to `specs_planning/agent-mistakes.md` (new MNT section)
2. Create `.github/agents/playwright-framework-maintainer.agent.md` following the structure of existing agents
3. `npm run sync:mistakes` — propagates MNT rules to agent file
4. `npm run validate:sync` — must pass
5. Update `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 Agent Roster — add "Framework Maintainer = GARDENER"

---

## First Task After Creation: Known Issues Inventory

Run a sweep on the post-PLAN_14 repo. The following 14 issues were found by spec audit (2026-03-04) and are pre-loaded for the GARDENER to fix:

### High Priority (fix immediately)

| # | Issue | File(s) | MNT Rule | Est. Lines Saved |
|---|-------|---------|----------|-----------------|
| 1 | TC-024 + TC-025 identical checkbox persistence flow → data-driven loop | `location-pricing.spec.ts` lines 322-367 | MNT-008 | ~25 |
| 2 | TC-026..TC-030 identical dropdown persistence flow → data-driven loop | `location-pricing.spec.ts` lines 369-417 | MNT-008 | ~35 |
| 3 | `LocationPricingPage` missing from `src/pages/index.ts` barrel | `src/pages/index.ts` | MNT-002 | — |
| 4 | `CheckboxState` / `CurrencyCheckboxState` / `PricingCheckboxState` — 3 identical interfaces | `location-form-helpers.page.ts`, `location-currency.page.ts`, `location-pricing.page.ts` | MNT-001 | ~8 |

### Medium Priority (improve after high priority)

| # | Issue | File(s) | MNT Rule | Est. Lines Saved |
|---|-------|---------|----------|-----------------|
| 5 | `getColumnHeaders()` identical pattern in Currency + Pricing → extract `getColumnHeadersByKeys()` to BasePage | `location-currency.page.ts`, `location-pricing.page.ts` | MNT-012 | ~12 |
| 6 | `getMerchantValue` / `getDropdownValue` / `getCurrencyFilterValue` — same pattern → extract `getFieldDisplayValue()` to BasePage | `location-currency.page.ts`, `location-pricing.page.ts` | MNT-012 | ~10 |
| 7 | `OFFICE_NO = '1604'` defined in 3 specs → shared `tests/test-data/common.data.ts` | 3 spec files | MNT-009 | ~3 |
| 8 | `waitForSaveEnabled` only on Pricing → move to BasePage (all tabs have save buttons) | `location-pricing.page.ts` | MNT-012 | ~0 (reuse gain) |
| 9 | Pricing `reloadPricingTab` reimplements navigate pattern instead of navigate-away + `navigateToSubTab` | `location-pricing.page.ts` | MNT-003 | ~5 |
| 10 | Stale duplicate JSDoc on `navigateToLocalInfoTab` | `location-local-info.page.ts` lines 47-52 | MNT-011 | ~5 |

### Low Priority (nice to have)

| # | Issue | File(s) | MNT Rule |
|---|-------|---------|----------|
| 11 | 12+ scattered `test.setTimeout()` calls in pricing spec → describe-level default | `location-pricing.spec.ts` | MNT-010 |
| 12 | Currency uses `isChecked()` on Radix buttons — should use `aria-checked` like Pricing does | `location-currency.page.ts` | Investigate (potential correctness bug, not just style) |
| 13 | `reloadAndNavigateToLocalInfo` abstract method name is tab-specific → rename to `reloadAndNavigateToTab` | `location-form-helpers.page.ts` | MNT-003 |
| 14 | `networkidle` used extensively — consider targeted waits where possible | multiple page objects | Investigate (flakiness risk) |

**Expected result after first sweep**: Pricing spec drops from ~420 lines to ~300. Cross-page duplication reduced by ~40 lines in page objects. All barrel exports complete.

Capture any NEW findings as MNT-013+ rules.
