#!/usr/bin/env node
/**
 * One-off reverification — opens 3 dialogs on /locations/1112/settings/location
 * and dumps EVERY data-testid in scope (page + dialog) so we can suffix-match
 * against the 8 dark-red rows from _audit-matrix-2026-04-30.json.
 *
 * Why this exists: the original audit only did exact-string matches against the
 * full expected testid (e.g. `location-settings-modal-select-customer-address-btn-save`).
 * Rutvik's screenshot proved that some testids ship with a different prefix
 * (e.g. `location-settings-btn-save` instead of `location-settings-modal-...-btn-save`),
 * which exact-match would flag MISSING. This script does suffix-match instead.
 *
 * Run: node scripts/reverify-location-testids.mjs
 */
import { chromium } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), '..');
const STATE_PATH = path.join(REPO_ROOT, '.auth', 'encore-state.json');
const OUT_DIR = path.join(REPO_ROOT, 'reports', 'testid-verification');
const STAMP = '2026-04-30-reverify';
const SCREENSHOT_DIR = path.join(OUT_DIR, 'screenshots', '2026-04-30-reverify');
const BASE_URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/';
const TARGET_URL = `${BASE_URL}locations/1112/settings/location`;

if (!fs.existsSync(STATE_PATH)) {
  console.error(`[FATAL] storage state missing at ${STATE_PATH}. Run \`npx playwright test --project=setup\` first.`);
  process.exit(2);
}
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const EXPECTED = {
  row36: { full: 'location-settings-modal-select-customer-address',                 suffix: 'modal-select-customer-address' },
  row37: { full: 'location-settings-modal-select-customer-address-input-search',    suffix: 'input-search' },
  row39: { full: 'location-settings-modal-select-customer-address-btn-select',      suffix: 'btn-select' },
  row40: { full: 'location-settings-modal-select-customer-address-btn-cancel',      suffix: 'btn-cancel' },
  row41: { full: 'location-settings-modal-select-customer-address-btn-save',        suffix: 'btn-save' },
  row44: { full: 'location-settings-modal-select-customer-address-label-total-addresses', suffix: 'label-total-addresses' },
  row64: { full: 'location-settings-modal-save-changes',                            suffix: 'modal-save-changes' },
  row70: { full: 'location-settings-modal-error',                                   suffix: 'modal-error' },
};

const log = (...a) => console.log('[reverify]', ...a);

async function dumpAllTestids(page, scopeSelector = 'body') {
  return await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return { rootFound: false, all: [] };
    const els = root.querySelectorAll('[data-testid]');
    const all = Array.from(els).map((e) => ({
      testid: e.getAttribute('data-testid'),
      tag: e.tagName.toLowerCase(),
      role: e.getAttribute('role') || null,
      text: (e.textContent || '').trim().slice(0, 60),
    }));
    return { rootFound: true, all };
  }, scopeSelector);
}

async function dumpDialogs(page) {
  return await page.evaluate(() => {
    const out = [];
    for (const sel of ['[role="dialog"]', '[role="alertdialog"]']) {
      const dialogs = document.querySelectorAll(sel);
      dialogs.forEach((d, i) => {
        const dialogTestid = d.getAttribute('data-testid');
        const inner = d.querySelectorAll('[data-testid]');
        out.push({
          role: sel,
          index: i,
          dialogTestid,
          allDataAttrs: Array.from(d.attributes).map((a) => a.name).filter((n) => n.startsWith('data-')),
          textSnippet: (d.textContent || '').trim().slice(0, 200),
          innerCount: inner.length,
          innerTestids: Array.from(inner).map((e) => e.getAttribute('data-testid')),
        });
      });
    }
    return out;
  });
}

function suffixMatch(testidList, suffix) {
  const matches = testidList.filter((t) => t.testid.endsWith(suffix) || t.testid.includes(`-${suffix}`));
  return matches;
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({
    storageState: STATE_PATH,
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);

  const result = {
    _meta: {
      generated: new Date().toISOString(),
      target: TARGET_URL,
      method: 'suffix-match against page-wide and dialog-scope data-testids',
    },
    scenarios: {},
  };

  log('Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Capture page-wide baseline of every testid present on /settings/location landing
  const baseline = await dumpAllTestids(page, 'body');
  result._meta.pageBaselineTestidCount = baseline.all.length;
  fs.writeFileSync(
    path.join(OUT_DIR, `reverify-baseline-page-${STAMP}.json`),
    JSON.stringify(baseline.all, null, 2),
  );
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '00-landing.png'), fullPage: true });
  log(`Landing page testid count: ${baseline.all.length}`);

  // ---------- SCENARIO 1: Account & Address -> Select Customer Address dialog ----------
  log('SCENARIO 1: Account & Address -> Select Customer Address dialog');
  result.scenarios.customerAddressDialog = { steps: [] };
  try {
    // Click Account and Address sub-tab
    const accountTab = page.getByRole('tab', { name: /Account and Address/i }).first();
    await accountTab.click();
    await page.waitForTimeout(1500);
    result.scenarios.customerAddressDialog.steps.push('clicked Account and Address tab');

    // Click venue Address button (testid: location-settings-btn-venue-address)
    const venueAddrBtn = page.locator('[data-testid="location-settings-btn-venue-address"]');
    await venueAddrBtn.waitFor({ state: 'visible', timeout: 10000 });
    await venueAddrBtn.click();
    await page.waitForTimeout(2000);
    result.scenarios.customerAddressDialog.steps.push('clicked venue address button');

    // Verify dialog opened
    const dialog = page.locator('[role="dialog"]:has-text("Select Customer Address")').first();
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    result.scenarios.customerAddressDialog.steps.push('dialog visible');

    // Capture screenshot + dump all testids
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-customer-address.png'), fullPage: true });
    const pageDump = await dumpAllTestids(page, 'body');
    const dialogDumps = await dumpDialogs(page);
    result.scenarios.customerAddressDialog.pageWideTestidCount = pageDump.all.length;
    result.scenarios.customerAddressDialog.pageWideTestids = pageDump.all.map((t) => t.testid).sort();
    result.scenarios.customerAddressDialog.dialogs = dialogDumps;

    // Suffix match for rows 36, 37, 39, 40, 41, 44
    result.scenarios.customerAddressDialog.suffixMatches = {
      row36: suffixMatch(pageDump.all, EXPECTED.row36.suffix),
      row37: suffixMatch(pageDump.all, EXPECTED.row37.suffix),
      row39: suffixMatch(pageDump.all, EXPECTED.row39.suffix),
      row40: suffixMatch(pageDump.all, EXPECTED.row40.suffix),
      row41: suffixMatch(pageDump.all, EXPECTED.row41.suffix),
      row44: suffixMatch(pageDump.all, EXPECTED.row44.suffix),
    };

    // Close dialog (try Cancel / Close)
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(1000);
  } catch (err) {
    result.scenarios.customerAddressDialog.error = err.message;
    log('SCENARIO 1 FAILED:', err.message);
  }

  // ---------- SCENARIO 2: Local Information -> dirty -> Save -> Save Changes dialog ----------
  log('SCENARIO 2: Local Information -> Save Changes alertdialog');
  result.scenarios.saveChangesDialog = { steps: [] };
  try {
    const liTab = page.getByRole('tab', { name: /Local Information/i }).first();
    await liTab.click();
    await page.waitForTimeout(1500);
    result.scenarios.saveChangesDialog.steps.push('clicked Local Information tab');

    // Toggle any checkbox to dirty form
    const firstCheckbox = page.locator('button[role="checkbox"]').first();
    await firstCheckbox.waitFor({ state: 'visible', timeout: 10000 });
    await firstCheckbox.click();
    await page.waitForTimeout(500);
    result.scenarios.saveChangesDialog.steps.push('toggled first checkbox');

    // Click Save (use page-level location-settings-btn-save per Rutvik's screenshot)
    const saveBtn = page.locator('[data-testid="location-settings-btn-save"]');
    await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    await saveBtn.click();
    await page.waitForTimeout(1500);
    result.scenarios.saveChangesDialog.steps.push('clicked Save button');

    // Wait for alertdialog
    const alertDialog = page.locator('[role="alertdialog"]:has-text("Save Changes")').first();
    await alertDialog.waitFor({ state: 'visible', timeout: 10000 });
    result.scenarios.saveChangesDialog.steps.push('alertdialog visible');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-save-changes.png'), fullPage: true });
    const pageDump2 = await dumpAllTestids(page, 'body');
    const dialogDumps2 = await dumpDialogs(page);
    result.scenarios.saveChangesDialog.pageWideTestidCount = pageDump2.all.length;
    result.scenarios.saveChangesDialog.pageWideTestids = pageDump2.all.map((t) => t.testid).sort();
    result.scenarios.saveChangesDialog.dialogs = dialogDumps2;
    result.scenarios.saveChangesDialog.suffixMatches = {
      row64: suffixMatch(pageDump2.all, EXPECTED.row64.suffix),
    };

    // Cancel out of save dialog so we don't actually save
    const cancelBtn = page.locator('[role="alertdialog"] button:has-text("Cancel")').first();
    await cancelBtn.click();
    await page.waitForTimeout(1000);

    // Revert the checkbox toggle so the form is clean again
    await firstCheckbox.click().catch(() => {});
    await page.waitForTimeout(500);
  } catch (err) {
    result.scenarios.saveChangesDialog.error = err.message;
    log('SCENARIO 2 FAILED:', err.message);
  }

  // ---------- SCENARIO 3: Force Error dialog by intercepting the save endpoint ----------
  log('SCENARIO 3: Force Error dialog via route interception');
  result.scenarios.errorDialog = { steps: [] };
  try {
    // Intercept the save endpoint and force HTTP 500
    await page.route(/\/api\/.*\/(location|update-properties|local-information|local-info).*$/i, async (route) => {
      log('Intercepting:', route.request().method(), route.request().url());
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'forced-500-for-reverify', isSuccess: false, message: 'Internal Server Error' }),
      });
    });
    result.scenarios.errorDialog.steps.push('installed route handler -> 500');

    // Re-dirty form
    const firstCheckbox2 = page.locator('button[role="checkbox"]').first();
    await firstCheckbox2.waitFor({ state: 'visible', timeout: 10000 });
    await firstCheckbox2.click();
    await page.waitForTimeout(500);

    const saveBtn2 = page.locator('[data-testid="location-settings-btn-save"]');
    await saveBtn2.click();
    await page.waitForTimeout(1500);

    // Confirm save in the Save Changes alertdialog
    const okBtn = page.locator('[role="alertdialog"] button:has-text("Ok")').first();
    if (await okBtn.isVisible().catch(() => false)) {
      await okBtn.click();
      result.scenarios.errorDialog.steps.push('clicked Ok in Save Changes dialog');
    }
    await page.waitForTimeout(3000);

    // Look for Error dialog
    const errDialog = page.locator('[role="alertdialog"]').filter({ hasText: /error/i }).first();
    const errVisible = await errDialog.isVisible({ timeout: 5000 }).catch(() => false);
    result.scenarios.errorDialog.steps.push(`error dialog visible: ${errVisible}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-error-attempt.png'), fullPage: true });
    const pageDump3 = await dumpAllTestids(page, 'body');
    const dialogDumps3 = await dumpDialogs(page);
    result.scenarios.errorDialog.pageWideTestidCount = pageDump3.all.length;
    result.scenarios.errorDialog.pageWideTestids = pageDump3.all.map((t) => t.testid).sort();
    result.scenarios.errorDialog.dialogs = dialogDumps3;
    result.scenarios.errorDialog.suffixMatches = {
      row70: suffixMatch(pageDump3.all, EXPECTED.row70.suffix),
    };
  } catch (err) {
    result.scenarios.errorDialog.error = err.message;
    log('SCENARIO 3 FAILED:', err.message);
  }

  // ---------- SUMMARY ----------
  result.summary = {};
  for (const [row, exp] of Object.entries(EXPECTED)) {
    let matches = [];
    for (const scen of Object.values(result.scenarios)) {
      const sm = scen.suffixMatches?.[row];
      if (sm && sm.length > 0) matches.push(...sm.map((m) => m.testid));
    }
    matches = [...new Set(matches)];
    const exactHit = matches.includes(exp.full);
    const suffixHit = matches.length > 0;
    result.summary[row] = {
      expectedFull: exp.full,
      expectedSuffix: exp.suffix,
      verdict: exactHit ? 'EXACT-PRESENT' : suffixHit ? 'SUFFIX-PRESENT-DIFFERENT-PREFIX' : 'TRULY-MISSING',
      matchedTestids: matches,
    };
  }

  const outFile = path.join(OUT_DIR, `reverify-${STAMP}.json`);
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
  log(`\nWrote ${outFile}`);
  log('\n=== SUMMARY ===');
  for (const [row, s] of Object.entries(result.summary)) {
    log(`  ${row} (${s.expectedSuffix}): ${s.verdict}` + (s.matchedTestids.length ? ` -> ${s.matchedTestids.join(', ')}` : ''));
  }

  await page.waitForTimeout(2000);
  await browser.close();
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
