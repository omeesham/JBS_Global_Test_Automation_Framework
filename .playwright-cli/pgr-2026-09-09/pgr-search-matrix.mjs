// Search-semantics matrix, saved to disk: each term typed by keys, a 600 ms settle (measured debounce < 250 ms), Enter.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups';
const DIR = '.playwright-cli/pgr-2026-09-09';
const TERMS = ['ZZ E2E', 'zz e2e', '   ZZ E2E   ', 'Group 1788335968232', '1788335968232 Group', 'Automated group create check', 'Group Automated', "&'", '<b>', '%', '_', '@', 'zzzz-no-match-9f3', '     ', 'ZZ E2E Group 1788335968232', 'a'.repeat(200), ''];
const out = { date: new Date().toISOString(), results: [] };
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Service Type', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
  await page.waitForSelector('main button[aria-haspopup="menu"]', { timeout: 60000 }); await page.waitForTimeout(1500);
  const inp = page.locator('input[placeholder]');
  const read = () => page.evaluate(() => { const rows = [...document.querySelectorAll('tbody tr')].map(r => [...r.querySelectorAll('td')].map(td => td.innerText.trim())); return { count: (document.querySelector('main').innerText.match(/[0-9,]+ product groups? found/) || [])[0] || null, rows: rows.length, first: rows[0] ? rows[0][0] : null, last: rows.length ? rows[rows.length - 1][0] : null, noResults: /No results/.test(document.querySelector('main').innerText), box: document.querySelector('input[placeholder]').value, boxLen: document.querySelector('input[placeholder]').value.length, searched: JSON.parse(sessionStorage.getItem('navigator:productGroups:searchState') || '{"state":{}}').state.searchText, allMatch: null }; });
  for (const term of TERMS) {
    await inp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
    if (term) await page.keyboard.type(term, { delay: 15 });
    await page.waitForTimeout(600);
    if (term === '') await page.getByRole('button', { name: 'Search', exact: true }).click(); else await page.keyboard.press('Enter');
    await page.waitForTimeout(3500);
    const r = await read();
    const t = term.trim().toLowerCase();
    r.allMatch = t ? await page.evaluate((needle) => [...document.querySelectorAll('tbody tr')].every(tr => tr.innerText.toLowerCase().includes(needle)), t) : null;
    out.results.push({ term: term.length > 30 ? term.slice(0, 12) + '…(' + term.length + ' chars)' : term, ...r });
    console.log(JSON.stringify(out.results[out.results.length - 1]));
  }
} catch (e) { out.error = String(e).slice(0, 300); console.log(out.error); } finally { await browser.close(); }
fs.writeFileSync(DIR + '/probes-search-matrix.json', JSON.stringify(out, null, 2));
