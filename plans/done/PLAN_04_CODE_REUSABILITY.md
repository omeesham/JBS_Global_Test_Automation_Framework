# Plan 04: Code Reusability Overhaul

**Status**: DONE 2026-03-03 — all 4 fixes applied, typecheck passes, sync complete

**Problem**: Same code duplicated across 3+ page objects. Agents create new methods instead of using existing ones. ~230 lines of duplicated code identified.

---

## Duplicated Code Inventory

| Pattern | Files Duplicated In | Lines | Priority |
|---------|-------------------|-------|----------|
| Save dialog confirmation | Currency, Pricing, LocalInfo pages | ~45 | HIGH |
| Tab navigation | Currency, Pricing, LocalInfo pages | ~75 | HIGH |
| Checkbox toggle (Radix UI) | Currency, Pricing pages | ~40 | HIGH |
| Dropdown open/read/close | Currency, Pricing pages | ~30 | HIGH |
| Wait-for-load patterns | All 3 pages | ~10 | MEDIUM |
| Text content trimming | All 3 pages | ~8 | LOW |

---

## Fix 1: Extract Save Dialog to BasePage (HIGH)

**Current** (duplicated in 3 page objects):
```typescript
// Each page has its own clickSave() with identical dialog handling
async clickSave(): Promise<void> {
  const saveBtn = this.getElement('btnSavePricing'); // or btnSaveCurrency, etc.
  await saveBtn.click();
  const dialog = this.getElement('dlgSaveChanges');
  const visible = await dialog.waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true).catch(() => false);
  if (visible) {
    await this.getElement('btnSaveChangesConfirm').click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
  }
  await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}
```

**Fix**: Add to `src/common/base-page.ts`:
```typescript
protected async clickSaveWithDialog(
  saveBtnKey: string,
  dialogKey: string = 'dlgSaveChanges',
  confirmBtnKey: string = 'btnSaveChangesConfirm',
  timeout: number = 5000
): Promise<void> {
  const saveBtn = this.getElement(saveBtnKey);
  if (await saveBtn.isDisabled()) {
    Log.info('Save button disabled — skipping click');
    return;
  }
  await saveBtn.click();
  const dialog = this.getElement(dialogKey);
  const dialogVisible = await dialog.waitFor({ state: 'visible', timeout })
    .then(() => true).catch(() => false);
  if (dialogVisible) {
    Log.info('Save confirmation dialog appeared — confirming');
    await this.getElement(confirmBtnKey).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10_000 });
  }
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
}
```

**Page objects then become**:
```typescript
async clickSave(): Promise<void> {
  await this.clickSaveWithDialog('btnSavePricing');
}
```

---

## Fix 2: Extract Tab Navigation to BasePage (HIGH)

**Current** (duplicated logic in 3 page objects):
```typescript
async navigateToPricingTab(officeNo = '1604'): Promise<void> {
  const currentUrl = this.page.url();
  if (!currentUrl.includes(`locations/${officeNo}/settings`)) {
    await this.navigateTo(`${base}locations/${officeNo}/settings/location`);
  }
  const tab = this.getElement('tabPricing');
  const isSelected = await tab.getAttribute('aria-selected');
  if (isSelected !== 'true') {
    await tab.click();
  }
  await this.getElement('chkCorporatePricing').waitFor({ state: 'visible', timeout: 15000 });
}
```

**Fix**: Add to `src/common/base-page.ts`:
```typescript
protected async navigateToSubTab(
  tabKey: string,
  readinessElementKey: string,
  officeNo: string = '1604',
  settingsPath: string = 'location'
): Promise<void> {
  const currentUrl = this.page.url();
  const expectedPath = `locations/${officeNo}/settings`;
  if (!currentUrl.includes(expectedPath)) {
    const baseUrl = process.env.BASE_URL || '';
    await this.navigateTo(`${baseUrl}/navigator/${expectedPath}/${settingsPath}`);
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  }
  const tab = this.getElement(tabKey);
  const isSelected = await tab.getAttribute('aria-selected');
  if (isSelected !== 'true') {
    await tab.click();
  }
  await this.getElement(readinessElementKey).waitFor({ state: 'visible', timeout: 15_000 });
}
```

---

## Fix 3: Extract Radix Checkbox Helpers to BasePage (HIGH)

**Current** (Radix UI checkboxes use button[role="checkbox"] not native input):
```typescript
// Duplicated in Currency and Pricing pages
async getCheckboxState(selectorKey: string) {
  const el = this.getElement(selectorKey);
  const ariaChecked = await el.getAttribute('aria-checked');
  return { checked: ariaChecked === 'true', disabled: await el.isDisabled() };
}

async checkCheckbox(selectorKey: string) {
  const { checked } = await this.getCheckboxState(selectorKey);
  if (!checked) await this.getElement(selectorKey).click();
}
```

**Fix**: Add to `src/common/base-page.ts`:
```typescript
protected async getRadixCheckboxState(elementKey: string): Promise<{ checked: boolean; disabled: boolean }> {
  const el = this.getElement(elementKey);
  const ariaChecked = await el.getAttribute('aria-checked').catch(() => null);
  return { checked: ariaChecked === 'true', disabled: await el.isDisabled() };
}

protected async setRadixCheckbox(elementKey: string, checked: boolean): Promise<void> {
  const state = await this.getRadixCheckboxState(elementKey);
  if (state.checked !== checked) {
    await this.getElement(elementKey).click();
  }
}
```

---

## Fix 4: Extract Dropdown Options Reader to BasePage (HIGH)

```typescript
protected async getComboboxOptions(dropdownKey: string): Promise<string[]> {
  const el = this.getElement(dropdownKey);
  await el.click();
  const listbox = this.page.locator('[role="listbox"]');
  await listbox.waitFor({ state: 'visible', timeout: 5_000 });
  const options = await listbox.locator('[role="option"]').allTextContents();
  await this.page.keyboard.press('Escape');
  return options.map(o => o.trim()).filter(o => o.length > 0);
}

protected async selectComboboxOption(dropdownKey: string, optionText: string): Promise<void> {
  const el = this.getElement(dropdownKey);
  await el.click();
  const listbox = this.page.locator('[role="listbox"]');
  await listbox.waitFor({ state: 'visible', timeout: 5_000 });
  await listbox.locator(`[role="option"]:has-text("${optionText}")`).click();
}
```

---

## New Agent Rules

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Renumbered ALL-013 to ALL-020 (PLAN_06 owns ALL-013..019).
     Added Fix 5 (Spec-Level Code Reuse) and updated rule references.
     WHY: User concern: "only highly reusable code goes in specs, nothing redundant should ever be
     allowed on the repo. every code that has 2x or more uses, has to be setup as reusable."
     Original PLAN_04 only covered page object level DRY (BasePage extraction). Spec-level patterns
     (shared beforeEach, repeated assertions, copy-pasted navigation) were not addressed.
     Verified: tests/setup/fixtures.ts exists (228 lines, 6+ custom fixtures including worker-scoped
     authenticatedSession and test-scoped page objects). Infrastructure for spec-level DRY is ready.
     Priority order per Reviewer 1: page object method > shared fixture > helper in tests/setup/ > duplication. -->

```
| ALL-020 | Before creating any page object method, search BasePage and existing page objects for the same pattern. If it exists, reuse it. If it should be shared, extract to BasePage first. Duplicated methods across page objects = defect | Pricing audit: clickSave(), checkbox toggle, tab navigation, dropdown read — all duplicated from Currency/LocalInfo pages |
| GEN-020 | Before Phase 1, check if the target page's patterns (save dialog, tab nav, checkbox, dropdown) are already implemented in other page objects. If yes, those methods MUST be in BasePage before creating the new page object — don't duplicate | |
```

---

## Fix 5: Spec-Level Code Reuse (NEW)

<!-- SURGICAL EDIT 2026-03-03 by Copilot — New section
     WHY: PLAN_04 Fixes 1-4 cover page object DRY. This covers spec file DRY.
     USER DIRECTIVE: "every code that has 2x or more uses, has to be setup as reusable in our repo"
     EVIDENCE: All 3 production specs use test.describe.serial with authenticatedSession fixture.
     No beforeAll/beforeEach hooks in production specs — setup is done via worker fixtures.
     But as more specs are created, repeated navigation/assertion patterns across specs will emerge.
     This fix prevents that duplication proactively. -->

Spec files must follow the same DRY mandate as page objects:

| Pattern | Rule | Extract To |
|---------|------|------------|
| Shared navigation/setup used by 2+ specs | Extract to fixture | `tests/setup/fixtures.ts` |
| Repeated assertion patterns (save → reload → verify persistence) across 2+ specs | Extract to page object method | `src/pages/{page}.page.ts` or `src/common/base-page.ts` |
| 3+ similar TCs with different data | Data-driven with array | `test.describe` with data array in same spec |
| Common cleanup/teardown | Shared fixture teardown | `tests/setup/fixtures.ts` |

**Priority order** (highest to lowest):
1. **Page object method** — if the pattern involves interacting with page elements
2. **Shared fixture** in `tests/setup/fixtures.ts` — if the pattern is test lifecycle (setup/teardown)
3. **Helper in `tests/setup/`** — if the pattern is utility/data transformation
4. **Duplication in spec** — NEVER acceptable for 2+ uses

**New rules** (in PLAN_05): ALL-026 (spec-level DRY mandate), GEN-022 (search existing specs before writing setup)

---

## Execution Steps

1. Add 4 methods to `src/common/base-page.ts` (clickSaveWithDialog, navigateToSubTab, getRadixCheckboxState/setRadixCheckbox, getComboboxOptions/selectComboboxOption)
2. Refactor `location-currency.page.ts` to use BasePage methods
3. Refactor `location-pricing.page.ts` to use BasePage methods
4. Refactor `location-local-information.page.ts` to use BasePage methods (if applicable)
5. Run all specs to verify no regressions
6. Update agent-mistakes.md with ALL-013 and GEN-020
