/**
 * One-shot DOM EXPLORATION spec: dumps EVERY data-testid present on each
 * Location Settings tab + dialog. Output:
 *   reports/testid-verification/dom-explore-<YYYY-MM-DD>.json
 *
 * Schema:
 *   {
 *     generated, office,
 *     tabsExplored,
 *     perTab: [{ tab: string, error?: string, testids: string[] }]
 *   }
 *
 * Inverse of location-testid-verify.spec.ts:
 *   - verify spec: probes the engineer's CLAIMED testids (PRESENT/ABSENT)
 *   - explore spec: lists what testids ACTUALLY exist in the live DOM (ground truth)
 *
 * Run on demand with shell-env credential override:
 *   NAVIGATOR_USERNAME=... NAVIGATOR_PASSWORD=... NAVIGATOR_MFA_SECRET=... \
 *     npx playwright test clients/encore/tests/specs/_verification/location-testid-explore.spec.ts \
 *     --project=chrome --workers=1 --headed
 */
import * as fs from 'fs';
import * as path from 'path';
import { test } from '../../../tests/setup/fixtures';
import { OFFICE_NO } from '../../../tests/test-data/common.data';

type TabReport = { tab: string; error?: string; testids: string[] };

const REPORT_DIR = path.join(process.cwd(), 'reports', 'testid-verification');
const REPORT_FILE = path.join(REPORT_DIR, `dom-explore-${new Date().toISOString().slice(0, 10)}.json`);

const allReports: TabReport[] = [];

async function dumpTestids(page: any, tab: string, navError?: string): Promise<void> {
  const testids: string[] = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-testid]')) as HTMLElement[];
    return Array.from(new Set(els.map((el) => el.getAttribute('data-testid') || '').filter(Boolean))).sort();
  });
  const report: TabReport = navError
    ? { tab, error: navError, testids }
    : { tab, testids };
  allReports.push(report);
  console.log(`[explore] ${tab} — testids=${testids.length}${navError ? ' err=' + navError : ''}`);
}

test.describe('TestID Exploration — Location Settings live DOM dump (one-shot, 2026-04-29)', () => {
  // NO serial mode: each test runs independently, failures do not cascade.

  test.afterAll(async () => {
    if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
    const summary = {
      generated: new Date().toISOString(),
      office: OFFICE_NO,
      tabsExplored: allReports.length,
      perTab: allReports,
    };
    fs.writeFileSync(REPORT_FILE, JSON.stringify(summary, null, 2));
    console.log(`\n[explore] Report: ${REPORT_FILE}`);
    console.log(`[explore] Tabs explored: ${summary.tabsExplored}`);
    summary.perTab.forEach(t => console.log(`  ${t.tab}: ${t.testids.length} testid${t.testids.length === 1 ? '' : 's'}${t.error ? ' (error: ' + t.error + ')' : ''}`));
  });

  test('Local Info tab — dump all data-testid', async ({ locationLocalInfoPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try { await locationLocalInfoPage.navigateToLocalInfoTab(OFFICE_NO); }
    catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Local Info', err);
  });

  test('Currency tab — dump all data-testid', async ({ locationCurrencyPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try { await locationCurrencyPage.navigateToCurrencyTab(OFFICE_NO); }
    catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Currency', err);
  });

  test('Pricing tab — dump all data-testid (skeleton-tolerant)', async ({ locationPricingPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try { await locationPricingPage.navigateToPricingTab(OFFICE_NO); }
    catch (e: any) {
      err = (e?.message || String(e)).slice(0, 240);
      // Even if readiness wait failed, dump whatever testids are present in the rendered DOM
      // (the skeleton itself may carry testids, or the sub-tab nav may have testids)
    }
    await dumpTestids(page, 'Pricing', err);
  });

  test('Account & Address tab — dump all data-testid', async ({ locationAccountAddressPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try { await locationAccountAddressPage.navigateToAccountAndAddressTab(OFFICE_NO); }
    catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Account+Address', err);
  });

  test('Account List dialog — open then dump all data-testid', async ({ locationAccountAddressPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try {
      await locationAccountAddressPage.navigateToAccountAndAddressTab(OFFICE_NO);
      await page.locator('[data-testid="location-settings-btn-lookup-venue"]').click({ timeout: 10_000 });
      await page.waitForTimeout(2500);
    } catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Account List Dialog', err);
    await page.keyboard.press('Escape').catch(() => {});
  });

  test('Select Customer Address dialog — open then dump all data-testid', async ({ locationAccountAddressPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try {
      await locationAccountAddressPage.navigateToAccountAndAddressTab(OFFICE_NO);
      await page.locator('[data-testid="location-settings-btn-venue-address"]').click({ timeout: 10_000 });
      await page.waitForTimeout(2500);
    } catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Select Customer Address Dialog', err);
    await page.keyboard.press('Escape').catch(() => {});
  });

  test('Shared Setup Locations tab — dump all data-testid', async ({ locationSharedSetupLocationsPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try { await locationSharedSetupLocationsPage.navigateToSharedSetupTab(OFFICE_NO); }
    catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Shared Setup', err);
  });

  test('Change Local Office dialog — open then dump all data-testid', async ({ locationSharedSetupLocationsPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try {
      await locationSharedSetupLocationsPage.navigateToSharedSetupTab(OFFICE_NO);
      await page.locator('[data-testid="location-settings-btn-change-local-office"]').click({ timeout: 10_000 });
      await page.waitForTimeout(2500);
    } catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Change Local Office Dialog', err);
    await page.keyboard.press('Escape').catch(() => {});
  });

  test('Notes tab — dump all data-testid', async ({ locationNotesPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try { await locationNotesPage.navigateToNotesTab(OFFICE_NO); }
    catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Notes', err);
  });

  test('Legal tab — dump all data-testid', async ({ locationLegalPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try { await locationLegalPage.navigateToLegalTab(OFFICE_NO); }
    catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Legal', err);
  });

  test('Auto Add-On tab — dump all data-testid', async ({ locationAutoAddonPage, page }) => {
    test.setTimeout(120_000);
    let err: string | undefined;
    try { await locationAutoAddonPage.navigateToAutoAddonTab(OFFICE_NO); }
    catch (e: any) { err = (e?.message || String(e)).slice(0, 240); }
    await dumpTestids(page, 'Auto Add-On', err);
  });
});
