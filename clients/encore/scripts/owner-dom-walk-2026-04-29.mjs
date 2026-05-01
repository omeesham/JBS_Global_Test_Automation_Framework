// OWNER live DOM walk for PLAN-53 testid verification.
// Uses creds passed via env (NOT .env files) per plan HARD STOP rule.
// Dumps all data-testids per Location Settings surface to reports/testid-verification/myown-*.json.

import { chromium } from 'playwright';
import { authenticator } from 'otplib';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/';
const USERNAME = process.env.NAVIGATOR_USERNAME;
const PASSWORD = process.env.NAVIGATOR_PASSWORD;
const TOTP_SECRET = process.env.NAVIGATOR_MFA_SECRET;
const OFFICE = '1604';
const OUT_DIR = 'reports/testid-verification';
const TODAY = '2026-04-29';
const PREFIX = 'myown';
const APP_HOST = 'cloudapps-e2e.encoreglobal.com';

if (!USERNAME || !PASSWORD || !TOTP_SECRET) {
  console.error('Missing creds. Required env: NAVIGATOR_USERNAME, NAVIGATOR_PASSWORD, NAVIGATOR_MFA_SECRET');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function out(name) { return path.join(OUT_DIR, `${PREFIX}-${name}-${TODAY}.json`); }
function save(name, data) {
  const p = out(name);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`[saved] ${p}`);
}

async function dumpAllTestids(page) {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid]'))
      .map(el => el.getAttribute('data-testid'))
      .filter(Boolean)
      .sort();
  });
}

async function dumpDialog(page) {
  return await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]'));
    const visible = all.filter(d => {
      if (d.getAttribute('aria-hidden') === 'true') return false;
      const r = d.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (visible.length === 0) {
      return { found: false, totalDialogsInDom: all.length };
    }
    const dialog = visible[visible.length - 1];
    const containerTestid = dialog.getAttribute('data-testid');
    const innerTestids = Array.from(dialog.querySelectorAll('[data-testid]'))
      .map(el => el.getAttribute('data-testid'))
      .filter(Boolean)
      .sort();
    return {
      found: true,
      role: dialog.getAttribute('role'),
      containerHasTestid: !!containerTestid,
      containerTestid: containerTestid,
      innerTestidsCount: innerTestids.length,
      innerTestids,
      dialogHTMLSnippet: dialog.outerHTML.slice(0, 500),
      dialogTextSnippet: (dialog.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300),
    };
  });
}

async function angularStable(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  // Settle Angular without networkidle (LR-023).
  await page.waitForTimeout(2500);
}

async function safeClick(page, selector) {
  await page.locator(selector).first().click({ timeout: 15_000 });
}

(async () => {
  console.log(`=== OWNER live DOM walk @ ${new Date().toISOString()} ===`);
  console.log(`User: ${USERNAME}, Office: ${OFFICE}`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[browser-error] ${msg.text().slice(0, 200)}`);
  });

  // ---- Login flow (mirrors clients/encore/src/pages/login.page.ts) ----
  console.log('--- Login flow ---');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  console.log(`[login] Initial URL: ${page.url()}`);

  // Step 0: Continue Now (if shown)
  try {
    await page.waitForSelector('button:has-text("Continue Now")', { state: 'visible', timeout: 10_000 });
    await page.click('button:has-text("Continue Now")');
    console.log('[login] Clicked Continue Now');
  } catch {
    console.log('[login] No Continue Now (skipped)');
  }

  // Step 1: MS login redirect
  await page.waitForURL(u => u.toString().includes('login.microsoftonline.com'), { timeout: 60_000 });
  await page.waitForSelector('input[type="email"][name="loginfmt"]', { state: 'visible', timeout: 30_000 });
  await page.fill('input[type="email"][name="loginfmt"]', USERNAME);
  await page.click('input[type="submit"][value="Next"]');
  console.log('[login] Email submitted');

  // Step 2: Password
  await page.waitForSelector('input[type="password"][name="passwd"]', { state: 'visible', timeout: 30_000 });
  await page.fill('input[type="password"][name="passwd"]', PASSWORD);
  await page.click('input[type="submit"][value="Sign in"]');
  console.log('[login] Password submitted');

  // Step 3: MFA
  try {
    await page.waitForSelector('input[name="otc"]', { state: 'visible', timeout: 15_000 });
    const totp = authenticator.generate(TOTP_SECRET);
    console.log(`[login] TOTP generated (length=${totp.length})`);
    await page.fill('input[name="otc"]', totp);
    await page.click('input[type="submit"][value="Verify"]');
    await page.waitForSelector('input[name="otc"]', { state: 'hidden', timeout: 30_000 }).catch(() => {});
    console.log('[login] MFA submitted');
  } catch {
    console.log('[login] No MFA challenge (skipped)');
  }

  // Step 4: Stay signed in
  try {
    await page.waitForSelector('input[type="submit"][value="Yes"]', { state: 'visible', timeout: 5000 });
    await page.click('input[type="submit"][value="Yes"]');
    console.log('[login] Stay-signed-in: Yes');
  } catch {
    console.log('[login] No Stay-signed-in prompt');
  }

  // Step 5: App reached — wait for auth callback to fully resolve, NOT just "any URL on host"
  await page.waitForURL(u => {
    const url = u.toString();
    return url.includes(APP_HOST) && !url.includes('login.microsoftonline.com');
  }, { timeout: 60_000 });
  await page.waitForLoadState('domcontentloaded');
  // Give NextAuth callback a moment to redirect to /locations or /home
  await page.waitForTimeout(4000);
  const postAuthUrl = page.url();
  console.log(`[login] Post-auth URL: ${postAuthUrl}`);

  // HARD CHECK: did we actually authenticate, or did NextAuth callback fail?
  if (postAuthUrl.includes('error=') || postAuthUrl.includes('/auth/sign-in')) {
    console.error(`[login] AUTH FAILED — landed on sign-in/error page: ${postAuthUrl}`);
    console.error('[login] OAuthCallback usually means: user not provisioned in Navigator Cloud,');
    console.error('[login] account needs manual bootstrap, or transient backend error.');
    console.error('[login] Halting before walking surfaces to avoid fake "0 testids" dumps.');
    await browser.close();
    process.exit(2);
  }

  // Verify presence of authenticated app shell
  const isAuth = await page.evaluate(() => {
    return document.body && document.body.innerText.length > 100 &&
           !window.location.pathname.includes('/auth/sign-in');
  });
  if (!isAuth) {
    console.error(`[login] AUTH check failed — page body too small or on sign-in. URL: ${postAuthUrl}`);
    await browser.close();
    process.exit(2);
  }
  console.log('[login] [OK] Authenticated — body has content, no sign-in path');

  // Save state for re-use
  await context.storageState({ path: '.auth/myown-state.json' });
  console.log('[login] Saved storage state to .auth/myown-state.json');

  // ---- Surface walks ----
  const surfaces = [
    { name: 'localinfo', slug: 'local-information' },
    { name: 'currency', slug: 'currency' },
    { name: 'pricing', slug: 'pricing' },
    { name: 'account-address', slug: 'account-and-address' },
    { name: 'shared-setup', slug: 'shared-setup-locations' },
    { name: 'notes', slug: 'notes' },
    { name: 'legal', slug: 'legal' },
    { name: 'auto-addon', slug: 'auto-add-on' },
  ];

  const surfaceCounts = {};
  for (const s of surfaces) {
    const url = `https://${APP_HOST}/navigator/setup/locations/${OFFICE}/${s.slug}`;
    console.log(`\n[walk] -> ${s.name} | ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await angularStable(page);
    const testids = await dumpAllTestids(page);
    surfaceCounts[s.name] = testids.length;
    console.log(`[walk] ${s.name}: ${testids.length} testids`);
    save(s.name, testids);
  }

  console.log('\n=== Surface counts ===');
  for (const [k, v] of Object.entries(surfaceCounts)) console.log(`  ${k}: ${v}`);

  // ---- Dialog walks ----
  // 1. Account List dialog
  console.log('\n--- Dialog: Account List ---');
  await page.goto(`https://${APP_HOST}/navigator/setup/locations/${OFFICE}/account-and-address`, { waitUntil: 'domcontentloaded' });
  await angularStable(page);
  await safeClick(page, '[data-testid="location-settings-btn-lookup-venue"]');
  await page.waitForTimeout(2500);
  save('dlg-account-list', await dumpDialog(page));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // 2. Select Customer Address dialog (Venue Address button)
  console.log('--- Dialog: Select Customer Address ---');
  await safeClick(page, '[data-testid="location-settings-btn-venue-address"]');
  await page.waitForTimeout(2500);
  save('dlg-customer-address', await dumpDialog(page));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // 3. Change Local Office dialog
  console.log('--- Dialog: Change Local Office ---');
  await page.goto(`https://${APP_HOST}/navigator/setup/locations/${OFFICE}/shared-setup-locations`, { waitUntil: 'domcontentloaded' });
  await angularStable(page);
  // Try multiple selectors — engineer indexes by row (-1 for second row, -0 first, etc.)
  const addBtnSelectors = [
    '[data-testid="location-settings-btn-add-shared-location-1"]',
    '[data-testid="location-settings-btn-add-shared-location-0"]',
    '[data-testid="location-settings-table-shared-setup"] tbody tr:last-child button',
  ];
  let opened = false;
  for (const sel of addBtnSelectors) {
    try {
      await page.click(sel, { timeout: 5000 });
      console.log(`[dlg] Clicked: ${sel}`);
      opened = true;
      break;
    } catch {}
  }
  if (!opened) console.log('[dlg] Could not find Add button — Change Local Office not opened');
  await page.waitForTimeout(2500);
  save('dlg-change-local-office', await dumpDialog(page));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // 4. Save Changes alertdialog
  console.log('--- Dialog: Save Changes ---');
  await page.goto(`https://${APP_HOST}/navigator/setup/locations/${OFFICE}/local-information`, { waitUntil: 'domcontentloaded' });
  await angularStable(page);
  // Use a low-impact toggle to dirty the form (apply-ldw is innocuous; can be reverted)
  const dirtyToggleSelectors = [
    '[data-testid="location-settings-checkbox-apply-ldw"]',
    '[data-testid="location-settings-checkbox-allow-dpcd"]',
    '[data-testid="location-settings-checkbox-active"]',
  ];
  let dirtied = false;
  for (const sel of dirtyToggleSelectors) {
    try {
      await page.click(sel, { timeout: 5000 });
      console.log(`[dirty] Toggled: ${sel}`);
      dirtied = true;
      break;
    } catch {}
  }
  if (!dirtied) console.log('[dirty] Could not toggle any field');
  await page.waitForTimeout(800);
  await safeClick(page, '[data-testid="location-settings-btn-save"]');
  await page.waitForTimeout(2500);
  save('dlg-save-changes', await dumpDialog(page));
  // Cancel the save dialog (keep our toggle in place to fire Unsaved Changes next)
  try {
    await page.click('[role="alertdialog"] button:has-text("Cancel")', { timeout: 5000 });
    console.log('[dlg] Cancelled Save dialog');
  } catch {
    console.log('[dlg] Could not cancel Save dialog');
  }
  await page.waitForTimeout(1500);

  // 5. Unsaved Changes alertdialog — try multiple navigation paths
  console.log('--- Dialog: Unsaved Changes ---');
  // Form should still be dirty from step 4
  // Path A: click Currency sub-tab
  let unsavedFound = false;
  try {
    await page.click('[data-testid="location-settings-sub-tab-currency"]', { timeout: 5000 });
    await page.waitForTimeout(2500);
    const probeA = await dumpDialog(page);
    if (probeA.found) {
      console.log('[unsaved] PATH A (sub-tab click) opened a dialog');
      save('dlg-unsaved-changes', probeA);
      unsavedFound = true;
    } else {
      console.log('[unsaved] PATH A: no dialog (tab nav succeeded directly)');
    }
  } catch (err) {
    console.log(`[unsaved] PATH A error: ${err.message?.slice(0, 100)}`);
  }

  // Path B: if nothing fired, try clicking the top-level Management History tab
  if (!unsavedFound) {
    try {
      await page.goto(`https://${APP_HOST}/navigator/setup/locations/${OFFICE}/local-information`, { waitUntil: 'domcontentloaded' });
      await angularStable(page);
      // Re-dirty
      for (const sel of dirtyToggleSelectors) {
        try { await page.click(sel, { timeout: 3000 }); break; } catch {}
      }
      await page.waitForTimeout(800);
      await page.click('[data-testid="location-settings-tab-management-history"]', { timeout: 5000 });
      await page.waitForTimeout(2500);
      const probeB = await dumpDialog(page);
      if (probeB.found) {
        console.log('[unsaved] PATH B (top-level tab) opened a dialog');
        save('dlg-unsaved-changes', probeB);
        unsavedFound = true;
      } else {
        console.log('[unsaved] PATH B: no dialog');
      }
    } catch (err) {
      console.log(`[unsaved] PATH B error: ${err.message?.slice(0, 100)}`);
    }
  }

  // Path C: final attempt — programmatic navigation away
  if (!unsavedFound) {
    try {
      await page.goto(`https://${APP_HOST}/navigator/setup/locations/${OFFICE}/local-information`, { waitUntil: 'domcontentloaded' });
      await angularStable(page);
      for (const sel of dirtyToggleSelectors) {
        try { await page.click(sel, { timeout: 3000 }); break; } catch {}
      }
      await page.waitForTimeout(800);
      // Use back button
      await page.goBack();
      await page.waitForTimeout(2500);
      const probeC = await dumpDialog(page);
      if (probeC.found) {
        console.log('[unsaved] PATH C (back nav) opened a dialog');
        save('dlg-unsaved-changes', probeC);
        unsavedFound = true;
      } else {
        console.log('[unsaved] PATH C: no dialog');
      }
    } catch (err) {
      console.log(`[unsaved] PATH C error: ${err.message?.slice(0, 100)}`);
    }
  }

  if (!unsavedFound) {
    console.log('[unsaved] Could NOT trigger Unsaved Changes dialog via 3 paths — engineer claim NOT VERIFIED');
    save('dlg-unsaved-changes', {
      found: false,
      attempts: ['sub-tab-click', 'top-level-tab-click', 'browser-back'],
      conclusion: 'dialog did not fire on any of 3 navigation paths',
    });
  }

  // ---- Summary ----
  const summary = {
    when: new Date().toISOString(),
    user: USERNAME,
    office: OFFICE,
    surfaceCounts,
    files: surfaces.map(s => out(s.name)).concat([
      out('dlg-account-list'),
      out('dlg-customer-address'),
      out('dlg-change-local-office'),
      out('dlg-save-changes'),
      out('dlg-unsaved-changes'),
    ]),
  };
  save('walk-summary', summary);

  await browser.close();
  console.log('\n=== DONE ===');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
