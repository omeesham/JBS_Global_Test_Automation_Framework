// Dead-window probe (LR-ENC-008): how long after load is the group search silently swallowed?
// Each run is a FRESH context; a search attempt (fill + Enter, or the Search button) fires every ~1 s
// until the grid reacts (skeletons or rows). Varied waits: immediate ×2, after 20 s, and via the button.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const DIR = '.playwright-cli/pgr-2026-09-09';
const out = { date: new Date().toISOString(), runs: [] };
const browser = await chromium.launch({ headless: true });
async function run(label, firstDelayMs, useButton) {
  const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage(); const r = { label, firstDelayMs, useButton, attempts: [] };
  const t0 = Date.now(); await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Service Type', { timeout: 60000 }); r.headerAt = Date.now() - t0;
  await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 }); r.skeletonsGoneAt = Date.now() - t0;
  await page.waitForSelector('main button[aria-haspopup="menu"]', { timeout: 60000 }); r.gridOptionsAt = Date.now() - t0;
  await page.waitForTimeout(firstDelayMs);
  const inp = page.locator('input[placeholder]');
  for (let i = 0; i < 30; i++) {
    const at = Date.now() - t0; await inp.fill('ZZ E2E'); const val = await inp.inputValue();
    if (useButton) await page.getByRole('button', { name: 'Search', exact: true }).click(); else await inp.press('Enter');
    let ok = false; try { await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0 || document.querySelectorAll('[data-slot=skeleton]').length > 0, null, { timeout: 1000 }); ok = true; } catch (e) {}
    r.attempts.push({ i, at, val, ok }); if (ok) { r.firstSuccessAt = at; r.attemptsNeeded = i + 1; break; }
  }
  try { await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 15000 }); } catch (e) { r.rowsTimeout = true; }
  r.rows = await page.locator('tbody tr').count(); r.count = await page.evaluate(() => (document.querySelector('main').innerText.match(/[0-9,]+ product groups? found/) || [])[0] || null);
  await ctx.close(); out.runs.push(r);
}
try { await run('enter-immediate-A', 0, false); await run('enter-immediate-B', 0, false); await run('enter-after-20s', 20000, false); await run('button-immediate', 0, true); }
catch (e) { out.error = String(e).slice(0, 300); } finally { await browser.close(); }
fs.writeFileSync(DIR + '/probes-dead-window.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.runs.map(r => ({ label: r.label, headerAt: r.headerAt, skeletonsGoneAt: r.skeletonsGoneAt, gridOptionsAt: r.gridOptionsAt, firstSuccessAt: r.firstSuccessAt, attemptsNeeded: r.attemptsNeeded, rows: r.rows, count: r.count, vals: [...new Set(r.attempts.map(a => a.val))] })), null, 1), out.error || '');
