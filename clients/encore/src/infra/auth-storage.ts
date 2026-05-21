/**
 * AUTH-STATE-SHARED — shared-storage-state helpers for parallel-worker auth.
 *
 * Lock-and-share pattern: a single setup project acquires a file-lock, performs a
 * fresh SSO login, and writes .auth/encore-state.json atomically.
 * All worker projects then consume the saved state read-only via use.storageState,
 * avoiding simultaneous fresh-login collisions across parallel workers.
 *
 * Search marker: AUTH-STATE-SHARED
 */

import * as fs from 'fs';
import * as path from 'path';
import * as lockfile from 'proper-lockfile';
import { Page, BrowserContext, Browser } from '@playwright/test';
import { recordCall as recordRetryCall, type AttemptRecord } from '../utils/retry-telemetry';
import { LoginPage } from '../pages/auth/login.page';
import type { IConfig } from '../types';

export const AUTH_DIR = path.resolve(process.cwd(), '.auth');
export const STATE_PATH = path.join(AUTH_DIR, 'encore-state.json');
export const LOCK_TARGET = path.join(AUTH_DIR, 'encore-state.lock-target');

const LOCK_OPTS: lockfile.LockOptions = {
  retries: { retries: 30, minTimeout: 1000, maxTimeout: 3000, factor: 1 },
  stale: 120_000,
  realpath: false,
};

export function ensureAuthDir(): void {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
  if (!fs.existsSync(LOCK_TARGET)) fs.writeFileSync(LOCK_TARGET, '', 'utf-8');
}

export async function acquireLock(): Promise<() => Promise<void>> {
  ensureAuthDir();
  return lockfile.lock(LOCK_TARGET, LOCK_OPTS);
}

export type StorageStateFile = { cookies?: unknown[]; origins?: unknown[] };

export function readStateOrNull(): StorageStateFile | null {
  try {
    if (!fs.existsSync(STATE_PATH)) return null;
    const raw = fs.readFileSync(STATE_PATH, 'utf-8');
    return JSON.parse(raw) as StorageStateFile;
  } catch {
    return null;
  }
}

export async function writeStateAtomic(context: BrowserContext): Promise<void> {
  ensureAuthDir();
  const tmp = `${STATE_PATH}.tmp`;
  await context.storageState({ path: tmp });
  fs.renameSync(tmp, STATE_PATH);
}

export async function validateState(page: Page, baseUrl: string): Promise<boolean> {
  const MAX_TRIES = 3;
  const callRecord: AttemptRecord[] = [];
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const t0 = Date.now();
    try {
      await page.goto(baseUrl, { timeout: 90_000, waitUntil: 'domcontentloaded' });

      const currentUrl = page.url().toLowerCase();
      if (currentUrl.includes('login.microsoftonline.com') || currentUrl.includes('/auth/sign-in')) {
        callRecord.push({ attemptN: attempt, durationMs: Date.now() - t0, outcome: 'fail' });
        recordRetryCall('validateState', callRecord);
        return false;
      }

      try {
        await page
          .getByRole('heading', { name: 'Dashboard', level: 1 })
          .waitFor({ state: 'visible', timeout: 30_000 });
        callRecord.push({ attemptN: attempt, durationMs: Date.now() - t0, outcome: 'pass' });
        recordRetryCall('validateState', callRecord);
        return true;
      } catch {
        callRecord.push({ attemptN: attempt, durationMs: Date.now() - t0, outcome: 'fail' });
        if (page.url().toLowerCase().includes('login.microsoftonline.com') || page.url().toLowerCase().includes('/auth/sign-in')) {
          recordRetryCall('validateState', callRecord);
          return false;
        }
        if (attempt === MAX_TRIES) {
          recordRetryCall('validateState', callRecord);
          return false;
        }
      }
    } catch (err) {
      callRecord.push({ attemptN: attempt, durationMs: Date.now() - t0, outcome: 'fail' });
      if (attempt === MAX_TRIES) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[auth-storage] validateState attempt ${attempt} threw, giving up: ${msg}`);
        recordRetryCall('validateState', callRecord);
        return false;
      }
    }
  }
  recordRetryCall('validateState', callRecord);
  return false;
}

export function deleteState(): void {
  try {
    if (fs.existsSync(STATE_PATH)) fs.unlinkSync(STATE_PATH);
  } catch {
    /* best effort */
  }
}

/**
 * Group A-2 (lifecycle refactor 2026-05-21): single source of truth
 * for SSO login. Both `auth.setup.ts` and `fixtures.ts:refreshSharedState` consume this.
 *
 * Each caller keeps its own retry policy + caller-specific logging — this helper covers
 * only the core SSO step (context + goto + loginWithMicrosoft + Dashboard wait). Callers
 * own writeStateAtomic + close + retry budgeting.
 *
 * On loginWithMicrosoft returning false, the helper closes the context and throws. On
 * any other failure (goto / Dashboard wait), the context is left open and the error
 * propagates — callers are expected to close in their own catch/finally.
 */
export async function performSsoLogin(
  browser: Browser,
  baseUrl: string,
  config: IConfig,
  credentials: { username: string; password: string },
): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('dialog', async (dialog) => {
    if (dialog.type() === 'beforeunload') {
      try { await dialog.accept(); } catch { /* already handled */ }
    }
  });
  try {
    await page.goto(baseUrl, { timeout: 78_000 });
    const loginPage = new LoginPage(page, config);
    const success = await loginPage.loginWithMicrosoft(
      credentials.username,
      credentials.password,
    );
    if (!success) {
      await ctx.close();
      throw new Error('loginWithMicrosoft returned false');
    }
    await page
      .getByRole('heading', { name: 'Dashboard', level: 1 })
      .waitFor({ state: 'visible', timeout: 60_000 });
    return { ctx, page };
  } catch (err) {
    // On any throw past newContext, propagate but DON'T leak the context — callers vary
    // (auth.setup retries with a fresh ctx, fixtures.ts treats it as terminal). Best-effort
    // close here; if the context is already closed, ignore.
    try { await ctx.close(); } catch { /* ignore */ }
    throw err;
  }
}
