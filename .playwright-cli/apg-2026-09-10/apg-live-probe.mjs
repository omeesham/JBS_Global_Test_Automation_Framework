// Live probe (e2e, office 1101): where a successful Add lands and the Save state after the save;
// Edit page Save state when the Name is cleared all at once (Ctrl+A, Delete) versus one character at a time.
import { createRequire } from 'module';
const require = createRequire('C:/Encore Framework/package.json');
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUTDIR;
const BASE = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const API = '/navigator/api/location/add-update-product-group';
const out = { started: new Date().toISOString(), steps: [] };
const log = (k, v) => { out.steps.push({ t: new Date().toISOString(), k, v }); console.log(k, JSON.stringify(v)); };
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ storageState: 'C:/Encore Framework/clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const settle = () => page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
const saveBtn = () => page.getByRole('button', { name: 'Save', exact: true });
const nameBox = () => page.locator('input[name="productGroupName"]');
const descBox = () => page.locator('input[name="productGroupDescription"]');
const toasts = () => page.locator('[data-sonner-toast]').allInnerTexts();
const state = async () => ({
  url: page.url(),
  saveEnabled: await saveBtn().isEnabled({ timeout: 2000 }).catch(() => null),
  nameVisible: await nameBox().isVisible().catch(() => false),
  nameValue: await nameBox().inputValue({ timeout: 2000 }).catch(() => null),
  nameInvalid: await nameBox().getAttribute('aria-invalid').catch(() => null),
  toasts: await toasts(),
});
const firstLine = (e) => String(e).split('\n')[0];
const postWatch = (ms) => page.waitForResponse((r) => r.url().includes(API) && r.request().method() === 'POST', { timeout: ms })
  .then(async (r) => ({ status: r.status(), body: (await r.text().catch(() => '')).slice(0, 300) }))
  .catch((e) => ({ none: firstLine(e) }));
try {
  // ---------------- Part A: create a group, watch the landing and the Save button
  await page.goto(BASE + '/add', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Sub Classes', { timeout: 60000 });
  await settle();
  log('A0 add page landing', await state());
  const stamp = Date.now();
  const name = 'ZZ E2E Probe ' + stamp;
  await nameBox().click(); await nameBox().pressSequentially(name, { delay: 30 });
  await descBox().click(); await descBox().pressSequentially('Probe description ' + stamp, { delay: 30 });
  await page.locator('button[role="combobox"]:not([data-testid])').click();
  const opt = page.locator('[role="option"]').first();
  await opt.waitFor({ timeout: 15000 });
  const optText = await opt.innerText();
  await opt.click();
  const rows = page.locator('[draggable="true"]');
  await rows.first().waitFor({ timeout: 30000 });
  await rows.nth(0).dblclick();
  await page.waitForTimeout(1500);
  log('A1 form filled', { name, serviceType: optText, subClassesAdded: await page.locator('button.text-xs.cursor-pointer').count(), ...(await state()) });
  const created = postWatch(30000);
  await saveBtn().click();
  log('A2 create response', await created);
  await page.waitForTimeout(1500);
  log('A3 1.5 s after Save', await state());
  for (const ms of [3000, 5000, 10000]) { await page.waitForTimeout(ms); log('A4 after another ' + ms + ' ms', await state()); }
  await page.screenshot({ path: OUT + '/probe-A-after-save.png' });
  if (/\/add\/?$/.test(page.url())) {
    const again = postWatch(15000);
    await saveBtn().click({ timeout: 5000 }).catch((e) => log('A5 second Save click failed', firstLine(e)));
    log('A5 second Save response', await again);
    await page.waitForTimeout(1500);
    log('A5 after second Save', await state());
  }
  // ---------------- Part B: open the new group's Edit page from the list
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await settle();
  const search = page.getByPlaceholder('Search Product Groups...');
  await search.click(); await search.pressSequentially(name, { delay: 30 }); await page.waitForTimeout(900); await search.press('Enter');
  await page.waitForFunction(() => /[\d,]+\s+product groups?\s+found/.test(document.body.innerText), null, { timeout: 60000 });
  await settle();
  const bodyText = await page.locator('body').innerText();
  const countText = (bodyText.match(/[\d,]+\s+product groups?\s+found/) || [null])[0];
  const headers = (await page.locator('thead th').allTextContents()).map((t) => t.trim());
  log('B0 list search', { countText, headers, rowText: await page.locator('tbody tr').first().innerText().catch(() => null) });
  await page.locator('tbody tr').first().locator('td').nth(headers.indexOf('Name')).click();
  await page.waitForURL(/\/product-groups\/edit\/\d+/, { timeout: 30000 });
  await settle();
  await nameBox().waitFor({ timeout: 30000 });
  await page.waitForTimeout(1000);
  const editUrl = page.url();
  log('B1 edit page landing', { heading: await page.getByRole('heading').first().textContent().catch(() => null), ...(await state()) });
  // B2: clear the Name all at once
  await nameBox().click(); await page.keyboard.press('Control+a'); await page.keyboard.press('Delete');
  await page.waitForTimeout(1000);
  log('B2 after Ctrl+A, Delete', await state());
  await page.screenshot({ path: OUT + '/probe-B2-ctrl-a-delete.png' });
  if (await saveBtn().isEnabled().catch(() => false)) {
    const resp = postWatch(8000);
    await saveBtn().click();
    log('B3 Save clicked with an empty Name - response', await resp);
    await page.waitForTimeout(1500);
    log('B3 after Save', await state());
    await page.screenshot({ path: OUT + '/probe-B3-after-save-empty.png' });
    await page.goto(editUrl, { waitUntil: 'domcontentloaded' }); await settle(); await nameBox().waitFor({ timeout: 30000 }); await page.waitForTimeout(1000);
    log('B3 reload - persisted name', await state());
  } else {
    log('B3 Save stayed disabled - nothing clicked', {});
  }
  // B4: fresh page, clear one character at a time
  await page.goto(editUrl, { waitUntil: 'domcontentloaded' }); await settle(); await nameBox().waitFor({ timeout: 30000 }); await page.waitForTimeout(1000);
  const before = await nameBox().inputValue();
  await nameBox().click(); await page.keyboard.press('End');
  const seen = [];
  for (let i = 0; i < before.length; i++) {
    await page.keyboard.press('Backspace');
    if (i === 0 || i === Math.floor(before.length / 2) || i === before.length - 1) {
      await page.waitForTimeout(700);
      seen.push({ removed: i + 1, saveEnabled: await saveBtn().isEnabled().catch(() => null), nameValue: await nameBox().inputValue() });
    }
  }
  await page.waitForTimeout(1000);
  log('B4 cleared one character at a time', { before, seen, ...(await state()) });
  await page.screenshot({ path: OUT + '/probe-B4-char-by-char.png' });
  // B5: positive control - a real change enables Save on the Edit page
  await nameBox().pressSequentially(before + ' X', { delay: 30 });
  await page.waitForTimeout(1000);
  log('B5 typed a changed name (positive control)', await state());
} catch (e) {
  log('ERROR', String(e).split('\n').slice(0, 3).join(' | '));
  await page.screenshot({ path: OUT + '/probe-error.png' }).catch(() => {});
} finally {
  out.finished = new Date().toISOString();
  fs.writeFileSync(OUT + '/apg-live-probe.json', JSON.stringify(out, null, 2));
  await browser.close();
}
