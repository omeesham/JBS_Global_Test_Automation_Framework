/**
 * @experiment EXP-AUTH-STATE-SHARED (2026-04-30)
 *
 * Shared-storage-state helpers for parallel-worker auth without MFA conflicts.
 * Cleanup target: deleted on experiment failure or auto-user provisioning.
 * Search marker: EXP-AUTH-STATE-SHARED
 */

import * as fs from 'fs';
import * as path from 'path';
import * as lockfile from 'proper-lockfile';
import { Page, BrowserContext } from '@playwright/test';

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
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    try {
      await page.goto(baseUrl, { timeout: 90_000, waitUntil: 'domcontentloaded' });

      if (page.url().toLowerCase().includes('login.microsoftonline.com')) {
        return false;
      }

      try {
        await page
          .getByRole('heading', { name: 'Dashboard', level: 1 })
          .waitFor({ state: 'visible', timeout: 30_000 });
        return true;
      } catch {
        if (page.url().toLowerCase().includes('login.microsoftonline.com')) return false;
        if (attempt === MAX_TRIES) return false;
      }
    } catch (err) {
      if (attempt === MAX_TRIES) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[auth-storage] validateState attempt ${attempt} threw, giving up: ${msg}`);
        return false;
      }
    }
  }
  return false;
}

export function deleteState(): void {
  try {
    if (fs.existsSync(STATE_PATH)) fs.unlinkSync(STATE_PATH);
  } catch {
    /* best effort */
  }
}
