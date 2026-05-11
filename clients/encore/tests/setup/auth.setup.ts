/**
 * AUTH-STATE-SHARED — Playwright "setup project" entrypoint.
 *
 * Runs ONCE before any test project (Playwright serializes via dependencies: ['setup']).
 * Produces .auth/encore-state.json which all downstream workers consume read-only via
 * use.storageState. Lock-and-share pattern: file-lock around fresh login prevents
 * simultaneous fresh-login collisions across parallel workers.
 *
 * Search marker: AUTH-STATE-SHARED
 */

import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@client/pages/login.page';
import { CommonMethods } from '@framework/utils/common-methods';
import { CredentialLoader } from '@framework/common/credential-loader';
import { recordCall as recordRetryCall, type AttemptRecord } from '@framework/utils/retry-telemetry';
import {
  STATE_PATH,
  acquireLock,
  readStateOrNull,
  validateState,
  writeStateAtomic,
} from './auth-storage';

setup('acquire shared auth state', async ({ browser }) => {
  setup.setTimeout(300_000);

  const baseUrl = process.env.BASE_URL || 'https://cloudapps-e2e.encoreglobal.com/navigator/';

  // Fast path: existing state passes validation -> reuse
  if (readStateOrNull()) {
    const ctx = await browser.newContext({ storageState: STATE_PATH });
    const page = await ctx.newPage();
    const ok = await validateState(page, baseUrl);
    await ctx.close();
    if (ok) {
      console.log('[auth.setup] existing state valid -> reuse');
      return;
    }
    console.log('[auth.setup] existing state stale -> refresh under lock');
  } else {
    console.log('[auth.setup] no state file -> fresh login under lock');
  }

  // Slow path: acquire lock, re-check (another process may have refreshed while we waited)
  const release = await acquireLock();
  try {
    if (readStateOrNull()) {
      const ctx = await browser.newContext({ storageState: STATE_PATH });
      const page = await ctx.newPage();
      const ok = await validateState(page, baseUrl);
      await ctx.close();
      if (ok) {
        console.log('[auth.setup] state refreshed by peer while waiting -> reuse');
        return;
      }
    }

    // Perform full SSO login -- internal 3-attempt retry loop covers MS transient
    // bursts ("Sorry, but we're having trouble signing you in" / ConnectionTimeOut).
    // Runs INSIDE the file lock, so peer workers wait on the lock, not on a half-success.
    const credentials = await CredentialLoader.loadCredentials({ type: 'env' });
    const config = CommonMethods.initProp();

    const MAX_ATTEMPTS = 3;
    let savedCtx: import('@playwright/test').BrowserContext | null = null;
    let lastErr: unknown = null;
    const callRecord: AttemptRecord[] = [];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const t0 = Date.now();
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      page.on('dialog', async (dialog) => {
        if (dialog.type() === 'beforeunload') await dialog.accept();
      });

      try {
        await page.goto(baseUrl, { timeout: 78_000 });
        const loginPage = new LoginPage(page, config);
        const success = await loginPage.loginWithMicrosoft(
          credentials.username,
          credentials.password,
        );
        if (!success) throw new Error('loginWithMicrosoft returned false');

        await page
          .getByRole('heading', { name: 'Dashboard', level: 1 })
          .waitFor({ state: 'visible', timeout: 60_000 });

        savedCtx = ctx;
        callRecord.push({ attemptN: attempt, durationMs: Date.now() - t0, outcome: 'pass' });
        console.log(`[auth.setup] login succeeded on attempt ${attempt}/${MAX_ATTEMPTS}`);
        break;
      } catch (err) {
        lastErr = err;
        callRecord.push({ attemptN: attempt, durationMs: Date.now() - t0, outcome: 'fail' });
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[auth.setup] attempt ${attempt}/${MAX_ATTEMPTS} failed: ${msg}`);
        await ctx.close();
        if (attempt < MAX_ATTEMPTS) {
          // Brief wait between attempts to let MS-side transient settle
          await new Promise((resolve) => setTimeout(resolve, 5_000));
        }
      }
    }

    recordRetryCall('login', callRecord);

    if (!savedCtx) {
      throw new Error(
        `[auth.setup] SSO login failed after ${MAX_ATTEMPTS} attempts: ${
          lastErr instanceof Error ? lastErr.message : String(lastErr)
        }`,
      );
    }

    await writeStateAtomic(savedCtx);
    console.log(`[auth.setup] state saved -> ${STATE_PATH}`);

    await savedCtx.close();

    // Validation pass on a fresh context -> proves the saved state is reusable
    const verifyCtx = await browser.newContext({ storageState: STATE_PATH });
    const verifyPage = await verifyCtx.newPage();
    const valid = await validateState(verifyPage, baseUrl);
    await verifyCtx.close();
    expect(valid, 'saved state must validate from a fresh context').toBe(true);
    console.log('[auth.setup] state validates from fresh context -> ready for parallel workers');
  } finally {
    await release();
  }
});
