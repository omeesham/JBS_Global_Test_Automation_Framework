// Drag each of the four column-resize handles +60 px and record the stored sizing key and rendered widths.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const DIR = '.playwright-cli/pgr-2026-09-09';
const out = { date: new Date().toISOString(), handles: [] };
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Service Type', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
  await page.waitForSelector('main button[aria-haspopup="menu"]', { timeout: 60000 });
  const inp = page.locator('input[placeholder]');
  await inp.click(); await page.keyboard.type('ZZ E2E', { delay: 30 }); await page.waitForTimeout(600); await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 30000 }); await page.waitForTimeout(800);
  const m = () => page.evaluate(() => ({ th: [...document.querySelectorAll('thead th')].map(th => Math.round(th.getBoundingClientRect().width)), sizing: JSON.parse(localStorage.getItem('product-groups-table-settings') || '{}').columnSizing }));
  out.before = await m();
  const labels = await page.locator('button[aria-label^="Resize column"]').evaluateAll(els => els.map(e => e.getAttribute('aria-label')));
  for (const label of labels) {
    const h = page.locator('button[aria-label="' + label + '"]'); const hb = await h.boundingBox();
    const x = hb.x + hb.width / 2, y = hb.y + hb.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 8, y, { steps: 3 }); await page.mouse.move(x + 60, y, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(600);
    out.handles.push({ label, ...(await m()) });
  }
  await page.screenshot({ path: DIR + '/24-resize-all-handles.png' });
} catch (e) { out.error = String(e).slice(0, 300); } finally { await browser.close(); }
fs.writeFileSync(DIR + '/probes-resize-all-handles.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
