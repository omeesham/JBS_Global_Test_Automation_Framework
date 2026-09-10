import { createRequire } from 'node:module';
const require = createRequire('C:/Encore Framework/package.json');
const { chromium } = require('playwright');
const fs = require('node:fs');
const URL0 = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const KEY = 'navigator:productGroups:searchState';
const out = { date: new Date().toISOString(), runs: [] };
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ storageState: 'C:/Encore Framework/clients/encore/.auth/encore-state.json' });
const page = await ctx.newPage();
const ready = () => page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0 && !!document.querySelector('input[placeholder="Search Product Groups..."]'), null, { timeout: 120000 });
const arm = () => page.evaluate(() => {
  const w = window; w.__w?.observer.disconnect();
  const watch = { loaderSeen: false, skeletonSeen: false, loaderAt: null, skeletonAt: null, t0: performance.now(), observer: new MutationObserver(() => {
    if (!watch.loaderSeen && document.querySelector('main form svg.lucide-loader-circle')) { watch.loaderSeen = true; watch.loaderAt = Math.round(performance.now() - watch.t0); }
    if (!watch.skeletonSeen && document.querySelector('[data-slot=skeleton]')) { watch.skeletonSeen = true; watch.skeletonAt = Math.round(performance.now() - watch.t0); }
  }) };
  watch.observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  w.__w = watch;
});
const read = () => page.evaluate(() => ({
  loaderSeen: window.__w?.loaderSeen ?? null, loaderAt: window.__w?.loaderAt ?? null, skeletonSeen: window.__w?.skeletonSeen ?? null, skeletonAt: window.__w?.skeletonAt ?? null,
  loaderNow: !!document.querySelector('main form svg.lucide-loader-circle'), skeletonNow: document.querySelectorAll('[data-slot=skeleton]').length,
  session: sessionStorage.getItem('navigator:productGroups:searchState'),
  count: (document.body.innerText.match(/[\d,]+\s+product groups?\s+found/) || [])[0] || null,
  rows: document.querySelectorAll('tbody tr').length,
  box: document.querySelector('input[placeholder="Search Product Groups..."]')?.value ?? null,
}));
const box = () => page.locator('input[placeholder="Search Product Groups..."]');
const typeFast = async (t) => { await box().click(); await page.keyboard.press('Control+a'); await page.keyboard.press('Delete'); await box().pressSequentially(t, { delay: 40 }); };
const sample = async (label, ms = [0, 100, 300, 700, 1500, 3000, 6000]) => { const s = []; let last = 0; for (const m of ms) { await page.waitForTimeout(m - last); last = m; s.push({ at: m, ...(await read()) }); } out.runs.push({ label, samples: s }); };
try {
  await page.goto(URL0, { waitUntil: 'domcontentloaded' }); await ready();
  out.onMount = await read();
  await arm(); await typeFast('ZZ E2E'); await page.keyboard.press('Enter'); await sample('fresh-fast-enter');
  await arm(); await page.waitForTimeout(1000); await page.keyboard.press('Enter'); await sample('slow-enter-after-1s');
  await arm(); await typeFast('Audio'); await page.keyboard.press('Enter'); await sample('executed-fast-edit');
  await arm(); await page.waitForTimeout(1000); await page.keyboard.press('Enter'); await sample('slow-enter-after-1s-b');
  await page.getByRole('button', { name: 'Reset', exact: true }).click(); await page.waitForTimeout(1500);
  out.afterReset = await read();
  await arm(); await typeFast('ZZ E2E'); await page.keyboard.press('Enter'); await sample('after-reset-fast-enter');
  await page.evaluate((k) => sessionStorage.removeItem(k), KEY); await page.reload({ waitUntil: 'domcontentloaded' }); await ready();
  out.afterForgetReload = await read();
  await arm(); await typeFast('ZZ E2E'); await page.keyboard.press('Enter'); await sample('forget-reload-fast-enter');
} catch (e) { out.error = String(e); }
fs.writeFileSync(process.env.SPDIR + '/debounce-signals.json', JSON.stringify(out, null, 1));
await browser.close();
