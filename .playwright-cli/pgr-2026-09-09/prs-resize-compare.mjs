// Sibling comparison: does a +200 px resize drag track the pointer on the Products grid (13 columns)?
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products';
const DIR = '.playwright-cli/pgr-2026-09-09';
const out = { date: new Date().toISOString(), page: 'products' };
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('thead th', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  const m = () => page.evaluate(() => { const t = document.querySelector('main table'); const p = t.parentElement; return { table: Math.round(t.getBoundingClientRect().width), container: Math.round(p.getBoundingClientRect().width), scrollW: p.scrollWidth, firstTh: Math.round(t.querySelector('thead th').getBoundingClientRect().width), firstThStyle: (t.querySelector('thead th').getAttribute('style') || '').split(';')[0], tableStyle: t.getAttribute('style'), sizing: JSON.parse(localStorage.getItem('product-table-settings') || '{}').columnSizing }; });
  out.before = await m();
  const handle = page.locator('button[aria-label^="Resize column"]').first(); out.handle = await handle.getAttribute('aria-label');
  const hb = await handle.boundingBox(); const x = hb.x + hb.width / 2, y = hb.y + hb.height / 2;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 10, y, { steps: 3 }); await page.mouse.move(x + 200, y, { steps: 25 }); await page.mouse.up(); await page.waitForTimeout(700);
  out.after200 = await m();
  await page.screenshot({ path: DIR + '/22-products-resize-compare.png' });
} catch (e) { out.error = String(e).slice(0, 300); } finally { await browser.close(); }
fs.writeFileSync(DIR + '/probes-products-resize-compare.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
