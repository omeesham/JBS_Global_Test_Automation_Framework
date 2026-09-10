// Column-resize response probe: drag the Name handle +50 / +150 / +300 / -300 px and measure header,
// cell, table and container widths plus the stored sizing after each drag.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const DIR = '.playwright-cli/pgr-2026-09-09';
const out = { date: new Date().toISOString() };
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Service Type', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
  await page.waitForSelector('main button[aria-haspopup="menu"]', { timeout: 60000 });
  const inp = page.locator('input[placeholder]');
  for (let i = 0; i < 20; i++) { await inp.fill('ZZ E2E'); await inp.press('Enter'); try { await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 1500 }); break; } catch (e) { out.searchAttempts = i + 2; } }
  await page.waitForTimeout(1000);
  const m = () => page.evaluate(() => { const t = document.querySelector('main table'); const p = t.parentElement; return { table: Math.round(t.getBoundingClientRect().width), container: Math.round(p.getBoundingClientRect().width), scrollW: p.scrollWidth, th: [...t.querySelectorAll('thead th')].map(th => Math.round(th.getBoundingClientRect().width)), td: [...t.querySelectorAll('tbody tr:first-child td')].map(td => Math.round(td.getBoundingClientRect().width)), thStyle: [...t.querySelectorAll('thead th')].map(th => th.getAttribute('style')), tableStyle: t.getAttribute('style'), tableClass: (t.getAttribute('class') || '').slice(0, 120), sizing: JSON.parse(localStorage.getItem('product-groups-table-settings') || '{}').columnSizing }; });
  out.before = await m();
  const drag = async (dx) => { const hb = await page.locator('button[aria-label="Resize column productGroupName"]').boundingBox(); const x = hb.x + hb.width / 2, y = hb.y + hb.height / 2; await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + (dx > 0 ? 10 : -10), y, { steps: 3 }); await page.mouse.move(x + dx, y, { steps: Math.max(10, Math.round(Math.abs(dx) / 8)) }); await page.mouse.up(); await page.waitForTimeout(700); return { handleX: Math.round(x), releasedAt: Math.round(x + dx) }; };
  for (const dx of [50, 150, 300]) { const d = await drag(dx); out['drag+' + dx] = { ...d, ...(await m()) }; }
  await page.screenshot({ path: DIR + '/20-resize-response.png' });
  const d = await drag(-300); out['drag-300'] = { ...d, ...(await m()) };
} catch (e) { out.error = String(e).slice(0, 400); } finally { await browser.close(); }
fs.writeFileSync(DIR + '/probes-resize-response.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
