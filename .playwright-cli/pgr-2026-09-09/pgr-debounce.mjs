// Debounce-threshold probe: type "ZZ E2E" by keys (40 ms/char), pause N ms, press Enter — which text did the
// search use? Fresh context per pause. Then, in one context, a second search edited quickly before Enter.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const DIR = '.playwright-cli/pgr-2026-09-09';
const out = { date: new Date().toISOString(), pauses: [], staleSecond: null };
const browser = await chromium.launch({ headless: true });
const state = (page) => page.evaluate(() => ({ searchText: JSON.parse(sessionStorage.getItem('navigator:productGroups:searchState') || '{"state":{}}').state.searchText, count: (document.querySelector('main').innerText.match(/[0-9,]+ product groups? found/) || [])[0] || null, rows: document.querySelectorAll('tbody tr').length, box: document.querySelector('input[placeholder]').value }));
async function fresh() { const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } }); const page = await ctx.newPage(); await page.goto(URL, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('text=Service Type', { timeout: 60000 }); await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 }); await page.waitForSelector('main button[aria-haspopup="menu"]', { timeout: 60000 }); await page.waitForTimeout(1500); return { ctx, page }; }
try {
  for (const pause of [0, 250, 500, 750, 1000, 1500, 2500]) {
    const { ctx, page } = await fresh(); const inp = page.locator('input[placeholder]');
    await inp.click(); await page.keyboard.type('ZZ E2E', { delay: 40 }); await page.waitForTimeout(pause); await page.keyboard.press('Enter');
    await page.waitForTimeout(4000); const s = await state(page); out.pauses.push({ pause, ...s, usedTypedText: s.searchText === 'ZZ E2E' }); console.log(JSON.stringify(out.pauses[out.pauses.length - 1]));
    await ctx.close();
  }
  const { ctx, page } = await fresh(); const inp = page.locator('input[placeholder]');
  await inp.click(); await page.keyboard.type('ZZ E2E', { delay: 40 }); await page.waitForTimeout(2500); await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 30000 }); await page.waitForTimeout(1500);
  const first = await state(page);
  await inp.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('Audio', { delay: 40 }); await page.keyboard.press('Enter');
  await page.waitForTimeout(5000); const second = await state(page);
  out.staleSecond = { first, second, staleTermSearched: second.searchText !== 'Audio' }; console.log(JSON.stringify(out.staleSecond));
  await page.screenshot({ path: DIR + '/21-stale-second-search.png' });
  await ctx.close();
} catch (e) { out.error = String(e).slice(0, 300); console.log(out.error); } finally { await browser.close(); }
fs.writeFileSync(DIR + '/probes-debounce.json', JSON.stringify(out, null, 2));
