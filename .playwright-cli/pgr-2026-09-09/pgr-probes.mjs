// Deterministic probes for the Product Groups LIST page (NM-2258 deep re-walk, 2026-09-09) — v2:
// A) search loader captured with an in-page MutationObserver + 25 ms sampler (no network delay),
// B) column resize drag + persistence, C) header reorder drag + persistence, D) Reset to Default View.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const DIR = '.playwright-cli/pgr-2026-09-09';
const out = { date: new Date().toISOString() };
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  // ready = grid header painted, skeletons gone, Grid Options rendered, then a hydration grace (LR-ENC-008: enabled is not wired)
  const ready = async () => { await page.waitForSelector('text=Service Type', { timeout: 60000 }); await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 }); await page.waitForSelector('main button[aria-haspopup="menu"]', { timeout: 60000 }); await page.waitForTimeout(3000); };
  await page.goto(URL, { waitUntil: 'domcontentloaded' }); await ready();
  const widths = () => page.evaluate(() => [...document.querySelectorAll('thead th')].map(th => [th.innerText.trim(), Math.round(th.getBoundingClientRect().width)]));
  const settings = () => page.evaluate(() => localStorage.getItem('product-groups-table-settings'));
  const headerOrder = () => page.evaluate(() => [...document.querySelectorAll('thead th')].map(th => th.innerText.trim()));
  const search = page.locator('input[placeholder]');
  // ---- A) loader: observer + sampler installed BEFORE the search fires
  await page.evaluate(() => {
    const t0 = performance.now();
    const sel = '.animate-spin, [class*="loader"], [class*="spinner"], svg[class*="lucide-loader"], [data-slot="skeleton"], [aria-busy="true"]';
    const w = window; w.__obs = []; w.__samples = [];
    const rec = (node, kind) => w.__obs.push({ t: Math.round(performance.now() - t0), kind, tag: node.tagName, cls: ((node.getAttribute && node.getAttribute('class')) || '').slice(0, 90), inForm: !!node.closest('form') });
    const mo = new MutationObserver(ms => { for (const m of ms) { for (const n of m.addedNodes) { if (n.nodeType !== 1) continue; if (n.matches(sel)) rec(n, 'added'); n.querySelectorAll(sel).forEach(x => rec(x, 'added-desc')); } if (m.type === 'attributes' && m.target.nodeType === 1 && m.target.matches(sel)) rec(m.target, 'attr:' + m.attributeName); } });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-busy'] });
    const inp = document.querySelector('input[placeholder]'); const btn = [...document.querySelectorAll('main form button')].find(b => b.type === 'submit');
    let last = '';
    w.__timer = setInterval(() => { const s = { t: Math.round(performance.now() - t0), spin: document.querySelectorAll('main .animate-spin, main svg[class*="lucide-loader"]').length, skel: document.querySelectorAll('[data-slot="skeleton"]').length, inpDis: inp.disabled, btnDis: btn ? btn.disabled : null, rows: document.querySelectorAll('tbody tr').length, formSvg: [...document.querySelectorAll('main form svg')].map(x => (x.getAttribute('class') || '').split(' ').filter(c => /lucide-|animate-/.test(c)).join('+')).join(',') }; const key = JSON.stringify([s.spin, s.skel, s.inpDis, s.btnDis, s.rows, s.formSvg]); if (key !== last) { w.__samples.push(s); last = key; } }, 25);
  });
  await search.fill('ZZ E2E'); await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: DIR + '/16-loader-during-search.png' });
  let got = false; for (let i = 0; i < 2 && !got; i++) { try { await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 12000 }); got = true; } catch (e) { out.searchRetry = (out.searchRetry || 0) + 1; await search.press('Enter'); } }
  await page.waitForTimeout(1500);
  out.loader = await page.evaluate(() => { clearInterval(window.__timer); return { observer: window.__obs.slice(0, 40), samples: window.__samples.slice(0, 40), rows: document.querySelectorAll('tbody tr').length, count: (document.querySelector('main').innerText.match(/[0-9,]+ product groups? found/) || [])[0] || null }; });
  // ---- B) column resize: drag the Name handle +120 px
  out.resize = { before: await widths(), settingsBefore: await settings() };
  const handle = page.locator('button[aria-label="Resize column productGroupName"]');
  const hb = await handle.boundingBox(); out.resize.handleBox = hb;
  if (hb) {
    const x = hb.x + hb.width / 2, y = hb.y + hb.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 20, y, { steps: 5 }); await page.mouse.move(x + 120, y, { steps: 20 }); await page.mouse.up();
    await page.waitForTimeout(800);
  }
  out.resize.after = await widths(); out.resize.settingsAfter = await settings();
  await page.screenshot({ path: DIR + '/17-after-resize.png' });
  await page.reload({ waitUntil: 'domcontentloaded' }); await ready(); await page.waitForTimeout(1500);
  out.resize.afterReload = await widths(); out.resize.settingsAfterReload = await settings();
  // ---- C) column reorder: drag the Name header grip onto the Service Type header
  out.reorder = { before: await headerOrder() };
  const grip = page.locator('thead th').nth(0).locator('svg.lucide-grip-vertical');
  const gb = await grip.boundingBox(); out.reorder.gripBox = gb;
  const target = await page.locator('thead th').nth(2).boundingBox(); out.reorder.targetBox = target;
  if (gb && target) {
    const sx = gb.x + gb.width / 2, sy = gb.y + gb.height / 2, dx = target.x + target.width / 2, dy = target.y + target.height / 2;
    await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + 10, sy + 2, { steps: 5 }); await page.mouse.move(dx, dy, { steps: 25 }); await page.waitForTimeout(300); await page.mouse.up();
    await page.waitForTimeout(1000);
  }
  out.reorder.afterMouseDrag = await headerOrder(); out.reorder.settingsAfterDrag = await settings();
  if (JSON.stringify(out.reorder.afterMouseDrag) === JSON.stringify(out.reorder.before)) {
    try { await page.locator('thead th').nth(0).dragTo(page.locator('thead th').nth(2), { timeout: 15000 }); } catch (e) { out.reorder.dragToError = String(e).slice(0, 160); }
    await page.waitForTimeout(1000);
    out.reorder.afterDragTo = await headerOrder(); out.reorder.settingsAfterDragTo = await settings();
  }
  await page.screenshot({ path: DIR + '/18-after-reorder.png' });
  await page.reload({ waitUntil: 'domcontentloaded' }); await ready(); await page.waitForTimeout(1500);
  out.reorder.afterReload = await headerOrder();
  // ---- D) Reset to Default View
  const gb2 = await page.evaluate(() => { const b = [...document.querySelectorAll('main button[aria-haspopup=menu]')].find(b => !b.closest('thead')); return b ? '#' + b.id : null; });
  out.reset = { gridBtnSelector: gb2 };
  if (gb2) { await page.click(gb2); await page.getByRole('menuitem', { name: 'Reset to Default View' }).click(); await page.waitForTimeout(1500); }
  out.reset.widths = await widths(); out.reset.order = await headerOrder(); out.reset.settings = await settings();
  await page.screenshot({ path: DIR + '/19-after-reset-default-view.png' });
} catch (e) {
  out.error = String(e).slice(0, 400);
} finally {
  await browser.close();
}
fs.writeFileSync(DIR + '/probes-resize-loader.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
