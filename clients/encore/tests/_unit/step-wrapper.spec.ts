import { test, expect } from '@playwright/test';
import { wrapWithSteps, camelToLabel, resolveLabel } from '../../src/fixtures/step-wrapper';

// Minimal fake page-object: verifies the proxy passes `page` and sync helpers
// through untouched and runs async methods through the labelled-step wrapper,
// without launching a browser or hitting the app.
class FakePage {
  constructor(public readonly page: unknown) {}
  getLabelSync(): string {
    return 'sync-value';
  }
  async doAction(): Promise<string> {
    return 'async-value';
  }
}

test('wrapped .page returns the raw page object unchanged', () => {
  const rawPage = { marker: 'the-real-page' };
  const wrapped = wrapWithSteps(new FakePage(rawPage), 'FakePage');
  expect(wrapped.page).toBe(rawPage);
  expect(typeof wrapped.page).toBe('object');
});

test('sync methods return their value directly, not a Promise', () => {
  const wrapped = wrapWithSteps(new FakePage({}), 'FakePage');
  const result = wrapped.getLabelSync();
  expect(result).toBe('sync-value');
  expect(result).not.toBeInstanceOf(Promise);
});

test('async methods resolve their value through the wrapper', async () => {
  const wrapped = wrapWithSteps(new FakePage({}), 'FakePage');
  await expect(wrapped.doAction()).resolves.toBe('async-value');
});

test('camelToLabel translates jargon and drops stripped tokens', () => {
  expect(camelToLabel('reloadAndNavigateToSSLTab')).toBe(
    'Reload and navigate to Shared Setup Locations tab',
  );
  expect(camelToLabel('navigateToEctTab')).toBe('Navigate to ECT Settings tab');
  expect(camelToLabel('captureLocPricingCsvRows')).toBe('Capture Location pricing CSV rows');
});

test('hand-label overrides beat the auto-derived label', () => {
  expect(resolveLabel('LocalOfficeEctPage', 'navigateToEctTab')).toBe('Open ECT Settings tab');
  expect(resolveLabel('LocalOfficeEctPage', 'navigateToCurrencyTab')).toBe(
    'Navigate to currency tab',
  );
});

test('excluded class names are returned unwrapped', () => {
  const raw = new FakePage({});
  const wrapped = wrapWithSteps(raw, 'LoginPage', { exclude: ['LoginPage'] });
  expect(wrapped).toBe(raw);
});
