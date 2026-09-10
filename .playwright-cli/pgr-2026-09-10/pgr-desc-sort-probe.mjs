// Read-only probe: the ZZ E2E family's Description column unsorted, sorted descending and ascending
// through the column menu, so the order the app produces can be compared with a code-point order.
import { createRequire } from 'module';
const require = createRequire('C:/Encore Framework/package.json');
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUTDIR;
const BASE = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const out = { started: new Date().toISOString() };
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ storageState: 'C:/Encore Framework/clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const settle = () => page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
const column = (name) => page.evaluate((col) => {
  const headers = Array.from(document.querySelectorAll('thead th')).map((t) => (t.textContent || '').trim());
  const idx = headers.indexOf(col);
  return Array.from(document.querySelectorAll('tbody tr')).map((r) => ((r.querySelectorAll('td').item(idx) || {}).textContent || '').trim());
}, name);
const sortBy = async (col, item) => {
  await page.getByRole('button', { name: col, exact: true }).first().click();
  await page.locator('[role="menu"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(1200);
  await page.locator('[role="menuitem"], [role="menuitemcheckbox"]').filter({ hasText: item }).first().click();
  await page.waitForTimeout(500);
  await settle();
  await page.waitForTimeout(500);
};
try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await settle();
  await page.evaluate(() => { localStorage.removeItem('product-groups-table-settings'); sessionStorage.clear(); });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await settle();
  const search = page.getByPlaceholder('Search Product Groups...');
  await search.click(); await search.pressSequentially('ZZ E2E', { delay: 30 }); await page.waitForTimeout(900); await search.press('Enter');
  await page.waitForFunction(() => /[\d,]+\s+product groups?\s+found/.test(document.body.innerText), null, { timeout: 60000 });
  await settle();
  out.count = (await page.locator('body').innerText()).match(/[\d,]+\s+product groups?\s+found/)[0];
  out.rowsPerPage = await page.locator('button[role="combobox"]').filter({ hasText: /^(10|20|30|40|50)$/ }).first().textContent();
  out.unsorted = { names: await column('Name'), descriptions: await column('Description') };
  await sortBy('Description', 'Sort descending');
  out.descDescending = await column('Description');
  await sortBy('Description', 'Sort ascending');
  out.descAscending = await column('Description');
  await sortBy('Service Type', 'Sort descending');
  out.serviceDescending = await column('Service Type');
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  out.check = {
    descendingIsCodePointDescending: out.descDescending.filter(Boolean).every((v, i, arr) => i === 0 || cmp(arr[i - 1], v) >= 0),
    ascendingIsCodePointAscending: out.descAscending.filter(Boolean).every((v, i, arr) => i === 0 || cmp(arr[i - 1], v) <= 0),
    descendingIsCaseInsensitiveDescending: out.descDescending.filter(Boolean).every((v, i, arr) => i === 0 || arr[i - 1].toLowerCase().localeCompare(v.toLowerCase()) >= 0),
    ascendingIsCaseInsensitiveAscending: out.descAscending.filter(Boolean).every((v, i, arr) => i === 0 || arr[i - 1].toLowerCase().localeCompare(v.toLowerCase()) <= 0),
  };
  await page.screenshot({ path: OUT + '/probe-desc-sort-descending.png', fullPage: true });
} catch (e) {
  out.error = String(e).split('\n').slice(0, 3).join(' | ');
} finally {
  out.finished = new Date().toISOString();
  fs.writeFileSync(OUT + '/pgr-desc-sort-probe.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
}
