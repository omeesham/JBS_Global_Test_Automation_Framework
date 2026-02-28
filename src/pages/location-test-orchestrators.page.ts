/**
 * @agent-doc
 * PURPOSE: Abstract intermediate class providing test orchestration methods (boundary, dependency,
 *          max-length) for Location tab page objects. Extracted from LocationFormHelpers (FIX-A.4).
 * OWNER: generator
 * IMPACT: medium -- LocationLocalInfoPage extends this. Changes affect boundary/dependency/maxLength tests.
 * DEPENDS-ON: LocationFormHelpers, SetupSelectors, logger.ts
 * USED-BY: src/pages/location-local-info.page.ts
 * RULES: Never add field-level interactions here -- those belong in LocationFormHelpers.
 *        Never add tab-specific selectors here.
 */

import { LocationFormHelpers } from './location-form-helpers.page';
import { SetupSelectors } from '../selectors';

export abstract class LocationTestOrchestrators extends LocationFormHelpers {
  // ─────────────────────────────────────────────────────────────────────────────
  // TEST ORCHESTRATORS -- boundary testing, dependency, max-length
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Full boundary test cycle: set -> (invalid: verify error) / (valid: save -> reload -> verify -> restore -> save).
   * Uses abstract isSaveEnabled / clickSave / reloadAndNavigateToLocalInfo from subclass.
   */
  async testBoundaryValue(
    spinKey: keyof typeof SetupSelectors,
    value: string,
    valid: boolean,
    errorContains: string | undefined,
    restoreValue: string,
    officeNo: string = '1604',
    restoreEnableKey?: keyof typeof SetupSelectors,
  ): Promise<{ passed: boolean; detail: string }> {
    await this.setSpinValue(spinKey, value);

    if (!valid && errorContains) {
      await this.getElement(spinKey).press('Tab');
      const hasError = await this.hasValidationError(errorContains);
      if (!hasError) {
        // Cat-B: some borderline values disable Save silently without an inline error paragraph.
        const saveDisabled = !(await this.isSaveEnabled());
        if (!saveDisabled) {
          return { passed: false, detail: `Expected error containing "${errorContains}", none found; Save also enabled -- app accepted the value` };
        }
        await this.setSpinValue(spinKey, restoreValue);
        await this.clickSave();
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        return { passed: true, detail: `${value} -> silently invalid (save disabled, no inline error -- Cat-B) [ok]` };
      }
      await this.setSpinValue(spinKey, restoreValue);
      await this.clickSave();
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      return { passed: true, detail: `${value} -> invalid (error shown) [ok]` };
    }

    await this.clickSave();
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await this.reloadAndNavigateToLocalInfo(officeNo);

    const spin = await this.getSpinState(spinKey);
    const hasError = await this.hasValidationError('Number must be');
    if (hasError) {
      return { passed: false, detail: `Expected no error, got validation error` };
    }
    if (!spin.disabled) {
      const spinNum = parseFloat(spin.value);
      const expectedDisplayNum = parseFloat(value) * 100;
      if (isNaN(spinNum) || Math.abs(spinNum - expectedDisplayNum) > 0.01) {
        return { passed: false, detail: `Expected display~=${expectedDisplayNum.toFixed(2)} (fill "${value}"x100), got value="${spin.value}"` };
      }
    }

    if (restoreEnableKey) { await this.checkCheckbox(restoreEnableKey); }
    await this.setSpinValue(spinKey, restoreValue);
    await this.clickSave();
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    return { passed: true, detail: `${value} -> valid [ok]` };
  }

  /**
   * Test checkbox dependency: trigger -> verify target state -> restore.
   */
  async testDependency(
    trigger: keyof typeof SetupSelectors,
    triggerAction: 'check' | 'uncheck',
    target: keyof typeof SetupSelectors,
    targetType: 'spin' | 'checkbox',
    expectedDisabled: boolean,
    expectedChecked: boolean | undefined,
    restore: Array<{ key: keyof typeof SetupSelectors; action: 'check' | 'uncheck' }>,
    spinRestore?: { key: keyof typeof SetupSelectors; value: string },
  ): Promise<{ passed: boolean; failures: string[] }> {
    const failures: string[] = [];
    if (triggerAction === 'check') { await this.checkCheckbox(trigger); } else { await this.uncheckCheckbox(trigger); }

    if (targetType === 'checkbox') {
      const state = await this.getCheckboxState(target);
      if (state.disabled !== expectedDisabled) failures.push(`${target} disabled: expected ${expectedDisabled}, got ${state.disabled}`);
      if (expectedChecked !== undefined && state.checked !== expectedChecked) failures.push(`${target} checked: expected ${expectedChecked}, got ${state.checked}`);
    } else {
      const disabled = await this.isFieldDisabled(target);
      if (disabled !== expectedDisabled) failures.push(`${target} disabled: expected ${expectedDisabled}, got ${disabled}`);
    }

    for (const r of restore) {
      if (r.action === 'check') { await this.checkCheckbox(r.key); } else { await this.uncheckCheckbox(r.key); }
    }
    if (spinRestore) { await this.setSpinValue(spinRestore.key, spinRestore.value); }
    await this.clickSave();
    return { passed: failures.length === 0, failures };
  }

  /**
   * Test maxLength enforcement: fill overlong string -> verify truncation.
   */
  async testMaxLength(
    fieldKey: keyof typeof SetupSelectors,
    maxLength: number,
    restoreValue: string,
  ): Promise<{ passed: boolean; detail: string }> {
    const actualMax = await this.getMaxLength(fieldKey);
    if (actualMax !== maxLength) return { passed: false, detail: `maxLength: expected ${maxLength}, got ${actualMax}` };
    const overlong = 'A'.repeat(maxLength * 2 + 10);
    await this.fillText(fieldKey, overlong);
    const truncated = await this.getTextValue(fieldKey);
    if (truncated.length > maxLength) return { passed: false, detail: `Truncation failed: length ${truncated.length} > ${maxLength}` };
    await this.fillText(fieldKey, restoreValue);
    await this.clickSave();
    return { passed: true, detail: `maxLength=${maxLength} enforced [ok]` };
  }
}
