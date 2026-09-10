// First-submit probe: in a FRESH context the first group search is swallowed and the second works.
// Variants isolate the cause: fill vs keyboard typing, Enter vs Search button, a pause between typing and
// submitting, and a neutral click before typing. Each variant waits 8 s for ANY grid reaction.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const DIR = '.playwright-cli/pgr-2026-09-09';
const out = { date: new Date().toISOString(), runs: [] };
const browser = await chromium.launch({ headless: true });
const reacted = (page, ms) => page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0 || document.querySelectorAll('[data-slot=skeleton]').length > 0 || /[1-9][0-9,]* product groups? found/.test(document.querySelector('main').innerText), null, { timeout: ms }).then(() => true).catch(() => false);
async function run(label, act) {
  const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage(); const r = { label };
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Service Type', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
  await page.waitForSelector('main button[aria-haspopup="menu"]', { timeout: 60000 });
  await page.waitForTimeout(1500);
  const inp = page.locator('input[placeholder]');
  const t0 = Date.now(); await act(page, inp); r.valueAfterAct = await inp.inputValue();
  r.firstReacted = await reacted(page, 8000); r.firstMs = Date.now() - t0;
  r.countAfterFirst = await page.evaluate(() => (document.querySelector('main').innerText.match(/[0-9,]+ product groups? found/) || [])[0] || null);
  r.sessionAfterFirst = await page.evaluate(() => sessionStorage.getItem('navigator:productGroups:searchState'));
  if (!r.firstReacted) { const t1 = Date.now(); await inp.press('Enter'); r.secondReacted = await reacted(page, 8000); r.secondMs = Date.now() - t1; }
  await page.waitForTimeout(1500); r.rows = await page.locator('tbody tr').count();
  await ctx.close(); out.runs.push(r); console.log(JSON.stringify(r));
}
try {
  await run('fill+Enter', async (p, i) => { await i.fill('ZZ E2E'); await i.press('Enter'); });
  await run('fill,wait3s,Enter', async (p, i) => { await i.fill('ZZ E2E'); await p.waitForTimeout(3000); await i.press('Enter'); });
  await run('click-input,type-keys,Enter', async (p, i) => { await i.click(); await p.keyboard.type('ZZ E2E', { delay: 40 }); await p.keyboard.press('Enter'); });
  await run('click-input,type-keys,Search-button', async (p, i) => { await i.click(); await p.keyboard.type('ZZ E2E', { delay: 40 }); await p.getByRole('button', { name: 'Search', exact: true }).click(); });
  await run('neutral-click,fill,Enter', async (p, i) => { await p.locator('main').click({ position: { x: 300, y: 600 } }); await i.fill('ZZ E2E'); await i.press('Enter'); });
  await run('fill,Search-button', async (p, i) => { await i.fill('ZZ E2E'); await p.getByRole('button', { name: 'Search', exact: true }).click(); });
} catch (e) { out.error = String(e).slice(0, 300); console.log(out.error); } finally { await browser.close(); }
fs.writeFileSync(DIR + '/probes-first-submit.json', JSON.stringify(out, null, 2));
