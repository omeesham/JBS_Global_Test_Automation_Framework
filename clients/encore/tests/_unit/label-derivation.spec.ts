import { test, expect } from '@playwright/test';
import { camelToLabel, resolveLabel } from '../../src/fixtures/label-derivation';

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
