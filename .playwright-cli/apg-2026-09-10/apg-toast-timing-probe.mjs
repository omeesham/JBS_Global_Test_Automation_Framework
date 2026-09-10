// Times the success toast against the post-save navigation: observer armed before the click records
// every toast added or removed (with the URL at that moment); the URL is sampled every 100 ms.
import { createRequire } from 'module';
const require = createRequire('C:/Encore Framework/package.json');
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUTDIR;
const BASE = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const API = '/navigator/api/location/add-update-product-group';
const out = { started: new Date().toISOString() };
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ storageState: 'C:/Encore Framework/clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const settle = () => page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
const nameBox = () => page.locator('input[name="productGroupName"]');
const descBox = () => page.locator('input[name="productGroupDescription"]');
const navs = [];
page.on('framenavigated', (f) => { if (f === page.mainFrame()) navs.push({ t: Date.now(), url: f.url() }); });
try {
  await page.goto(BASE + '/add', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Sub Classes', { timeout: 60000 });
  await settle();
  const stamp = Date.now();
  const name = 'ZZ E2E Toast ' + stamp;
  await nameBox().click(); await nameBox().pressSequentially(name, { delay: 30 });
  await descBox().click(); await descBox().pressSequentially('Toast timing ' + stamp, { delay: 30 });
  await page.locator('button[role="combobox"]:not([data-testid])').click();
  const opt = page.locator('[role="option"]').first();
  await opt.waitFor({ timeout: 15000 }); await opt.click();
  const rows = page.locator('[draggable="true"]');
  await rows.first().waitFor({ timeout: 30000 });
  await rows.nth(0).dblclick();
  await page.waitForTimeout(1500);
  // Arm the toast observer in the page before clicking Save.
  await page.evaluate(() => {
    const w = window;
    w.__toastLog = [];
    const isToast = (n) => n instanceof HTMLElement && (n.matches('[data-sonner-toast]') || n.querySelector('[data-sonner-toast]'));
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) if (isToast(n)) w.__toastLog.push({ t: Date.now(), ev: 'added', text: n.innerText.trim().slice(0, 80), url: location.pathname });
        for (const n of m.removedNodes) if (isToast(n)) w.__toastLog.push({ t: Date.now(), ev: 'removed', text: n.innerText.trim().slice(0, 80), url: location.pathname });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    w.__toastObs = obs;
  });
  const t0 = Date.now();
  const created = page.waitForResponse((r) => r.url().includes(API) && r.request().method() === 'POST', { timeout: 30000 })
    .then((r) => ({ t: Date.now() - t0, status: r.status() })).catch((e) => ({ none: String(e).split('\n')[0] }));
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const samples = [];
  const toastLogs = [];
  for (let i = 0; i < 80; i++) {
    await page.waitForTimeout(100);
    const s = await page.evaluate(() => ({
      path: location.pathname,
      toasts: Array.from(document.querySelectorAll('[data-sonner-toast]')).map((e) => e.innerText.trim().slice(0, 60)),
      log: (window.__toastLog || []).length,
      hasObserver: !!window.__toastObs,
    })).catch(() => null);
    if (s) samples.push({ t: Date.now() - t0, ...s });
  }
  out.create = await created;
  out.navigations = navs.map((n) => ({ t: n.t - t0, url: n.url.replace(BASE, '') }));
  out.observerLog = await page.evaluate(() => window.__toastLog || null).catch(() => 'page context lost');
  // Compress the samples: keep only changes.
  const changes = [];
  let prev = '';
  for (const s of samples) { const key = s.path + '|' + s.toasts.join('/') + '|' + s.hasObserver; if (key !== prev) { changes.push(s); prev = key; } }
  out.sampleChanges = changes;
  out.sampleCount = samples.length;
  await page.screenshot({ path: OUT + '/probe-toast-after-save.png' });
} catch (e) {
  out.error = String(e).split('\n').slice(0, 3).join(' | ');
} finally {
  out.finished = new Date().toISOString();
  fs.writeFileSync(OUT + '/apg-toast-timing-probe.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
}
