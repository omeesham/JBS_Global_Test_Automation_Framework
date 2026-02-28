/**
 * Explore Local Info + Currency tab live state from Navigator Cloud.
 * Run: npx ts-node scripts/explore-local-info.ts
 */
import { chromium } from '@playwright/test';
import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';
import * as fs from 'fs';

dotenvFlow.config({ path: path.join(__dirname, '..', 'config', 'environments'), node_env: 'development', silent: true });

interface FieldState {
  testid: string;
  checked?: boolean | null;
  disabled?: boolean | null;
  value?: string;
  type: string;
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Try loading saved auth state
  const stateFile = path.join(__dirname, '..', 'config', 'secrets', '.auth-state.json');
  if (fs.existsSync(stateFile)) {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    if (state.cookies?.length) await context.addCookies(state.cookies);
  }

  const base = process.env.BASE_URL || '';
  console.log(`Navigating to ${base}locations/1604/settings/location`);
  await page.goto(`${base}locations/1604/settings/location`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // If redirected to sign-in, stop
  if (page.url().includes('sign-in') || page.url().includes('microsoftonline')) {
    console.log('[ERR] Not authenticated -- run specs first to create auth session');
    await browser.close();
    process.exit(1);
  }

  // ── LOCAL INFORMATION TAB ──────────────────────────────────────────────────
  const liTab = page.locator('[data-testid="location-settings-sub-tab-local-information"]');
  if (await liTab.isVisible()) {
    await liTab.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  }

  const localInfoState: FieldState[] = await page.evaluate(() => {
    const results: { testid: string; checked: boolean | null; disabled: boolean | null; value: string; type: string }[] = [];
    // Checkboxes
    document.querySelectorAll('[data-testid]').forEach(container => {
      const testid = container.getAttribute('data-testid') || '';
      if (!testid.startsWith('location-settings-checkbox-')) return;
      const btn = container.querySelector('button[role="checkbox"]') as HTMLButtonElement | null;
      if (!btn) return;
      const checked = btn.getAttribute('aria-checked') === 'true';
      const disabled = btn.hasAttribute('disabled') || btn.getAttribute('data-disabled') !== null || btn.getAttribute('aria-disabled') === 'true';
      results.push({ testid, checked, disabled, value: '', type: 'checkbox' });
    });
    // Spinbuttons
    document.querySelectorAll('[data-testid]').forEach(container => {
      const testid = container.getAttribute('data-testid') || '';
      if (!testid.startsWith('location-settings-input-')) return;
      const input = container.querySelector('input') as HTMLInputElement | null;
      if (!input) return;
      const disabled = input.disabled || input.getAttribute('aria-disabled') === 'true';
      results.push({ testid, checked: null, disabled, value: input.value, type: input.type || 'text' });
    });
    // Dropdowns
    document.querySelectorAll('[data-testid]').forEach(container => {
      const testid = container.getAttribute('data-testid') || '';
      if (!testid.startsWith('location-settings-select-')) return;
      const btn = container.querySelector('button[role="combobox"]') as HTMLButtonElement | null;
      if (!btn) return;
      const disabled = btn.disabled || btn.getAttribute('aria-disabled') === 'true';
      results.push({ testid, checked: null, disabled, value: btn.textContent?.trim() || '', type: 'select' });
    });
    return results;
  });

  console.log('\n=== LOCAL INFORMATION TAB ===');
  console.log('CHECKBOXES:');
  localInfoState.filter(f => f.type === 'checkbox').forEach(f => {
    const testid = f.testid.replace('location-settings-checkbox-', '');
    console.log(`  ${testid}: checked=${f.checked}, disabled=${f.disabled}`);
  });
  console.log('\nINPUTS/SPINS:');
  localInfoState.filter(f => f.type !== 'checkbox' && f.type !== 'select').forEach(f => {
    const testid = f.testid.replace('location-settings-input-', '');
    console.log(`  ${testid}: value="${f.value}", disabled=${f.disabled}`);
  });
  console.log('\nDROPDOWNS:');
  localInfoState.filter(f => f.type === 'select').forEach(f => {
    const testid = f.testid.replace('location-settings-select-', '');
    console.log(`  ${testid}: value="${f.value}", disabled=${f.disabled}`);
  });

  // also check left panel
  console.log('\nLEFT PANEL:');
  const leftPanel: { key: string; value: string; disabled: boolean }[] = await page.evaluate(() => {
    const fields = [
      'location-settings-input-primary-location-no',
      'location-settings-input-location-no',
      'location-settings-input-location-name',
      'location-settings-input-pay-to-name',
      'location-settings-checkbox-active',
      'location-settings-checkbox-is-union',
      'location-settings-checkbox-use-ecommerce',
      'location-settings-checkbox-enable-productions-orders',
    ];
    return fields.map(key => {
      const el = document.querySelector(`[data-testid="${key}"]`);
      if (!el) return { key, value: 'NOT FOUND', disabled: true };
      const input = el.querySelector('input,button') as HTMLInputElement | HTMLButtonElement | null;
      if (!input) return { key, value: 'NO INPUT', disabled: true };
      const value = (input as HTMLInputElement).value ?? input.textContent?.trim() ?? '';
      const disabled = (input as HTMLInputElement).disabled || input.getAttribute('aria-disabled') === 'true' || input.getAttribute('data-disabled') !== null;
      return { key, value, disabled };
    });
  });
  leftPanel.forEach(f => console.log(`  ${f.key.replace('location-settings-', '')}: value="${f.value}", disabled=${f.disabled}`));

  // ── CURRENCY TAB ───────────────────────────────────────────────────────────
  const curTab = page.locator('[data-testid="location-settings-sub-tab-currency"]');
  if (await curTab.isVisible()) {
    await curTab.click();
    await page.waitForTimeout(2000);
  }
  const currencyState: { testid: string; checked: boolean; disabled: boolean; value: string }[] = await page.evaluate(() => {
    const keys = [
      'location-settings-checkbox-usd-selected','location-settings-checkbox-usd-default','location-settings-select-usd-merchant',
      'location-settings-checkbox-cad-selected','location-settings-checkbox-cad-default','location-settings-select-cad-merchant',
      'location-settings-checkbox-mxn-selected','location-settings-checkbox-mxn-default','location-settings-select-mxn-merchant',
    ];
    return keys.map(key => {
      const el = document.querySelector(`[data-testid="${key}"]`);
      if (!el) return { testid: key, checked: false, disabled: true, value: 'NOT FOUND' };
      const input = el.querySelector('button,input') as HTMLButtonElement | HTMLInputElement | null;
      if (!input) return { testid: key, checked: false, disabled: true, value: 'NO INPUT' };
      const checked = input.getAttribute('aria-checked') === 'true' || (input as HTMLInputElement).checked;
      const disabled = (input as HTMLInputElement).disabled || input.getAttribute('aria-disabled') === 'true' || input.getAttribute('data-disabled') !== null;
      const value = (input as HTMLInputElement).value || input.textContent?.trim() || '';
      return { testid: key, checked, disabled, value };
    });
  });

  console.log('\n=== CURRENCY TAB ===');
  currencyState.forEach(f => console.log(`  ${f.testid.replace('location-settings-checkbox-','chk').replace('location-settings-select-','drp')}: checked=${f.checked}, disabled=${f.disabled}, value="${f.value}"`));

  console.log('\n[OK] Exploration complete');
  await page.waitForTimeout(1000);
  await browser.close();
})().catch(e => { console.error('[ERR]', e.message); process.exit(1); });
