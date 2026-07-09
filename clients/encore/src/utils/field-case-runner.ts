/**
 * Field-coverage lifecycle runner. Orchestrates the per-field-case discipline:
 *   baseline → act → expectBeforeSave? → save → expectAfterSave? → reload → expectAfterReload → cleanup
 *
 * Each field-coverage test calls saveAndVerifyCase() once with the case's spec. The runner is page-agnostic —
 * the spec passes the page-object's `saveAndConfirm` and `reload` callbacks, so SSL / other modules
 * reuse this same runner unchanged.
 *
 * Each phase runs inside a numbered, plain-English report step so the HTML/Allure report reads as the
 * test case's lifecycle ("Step 1: Reset…" through "Step 7: Restore…") rather than raw locator calls.
 */

import { test } from '@playwright/test';

export interface FieldCase {
  /** TC ID for traceability, e.g. "TC-LOC-NTS-033" (canonical submodule-only form — no extra segment). */
  id: string;
  /** Human-readable label for logs and Allure. */
  label: string;
  /** Bring the page to a known starting state (DB-clean equivalent). REQUIRED. */
  baseline: () => Promise<void>;
  /** Perform the one field-level change the case is testing. REQUIRED. */
  act: () => Promise<void>;
  /** Optional pre-save assertions (UI state: counter, dirty flag, button enable). */
  expectBeforeSave?: () => Promise<void>;
  /** Page-object's save-and-confirm-dialog method. REQUIRED. */
  saveAndConfirm: () => Promise<void>;
  /** Optional post-save assertions BEFORE reload (button disabled, dialog closed). */
  expectAfterSave?: () => Promise<void>;
  /** Page-object's reload-and-renavigate method. REQUIRED. */
  reload: () => Promise<void>;
  /** The persisted-value assertion AFTER reload. REQUIRED. */
  expectAfterReload: () => Promise<void>;
  /** Restore the page/DB to empty for the next case. RECOMMENDED. */
  cleanup?: () => Promise<void>;
}

/**
 * Execute one field-coverage case end-to-end. Throws on any step failure (Playwright assertions
 * propagate naturally — no catch/swallow). Each test() block calls this exactly once.
 *
 * Failure isolation: cleanup runs in a finally-equivalent — even if expectAfterReload
 * throws, cleanup still attempts to restore state for the next case. If cleanup itself throws,
 * the original assertion error is preserved (Playwright still reports the test failure).
 */
export async function saveAndVerifyCase(c: FieldCase): Promise<void> {
  let primaryError: unknown = null;
  try {
    await test.step(`[${c.id}] Step 1: Reset the page to a clean starting state`, async () => {
      await c.baseline();
    });
    await test.step(`[${c.id}] Step 2: Make the change under test`, async () => {
      await c.act();
    });
    const expectBeforeSave = c.expectBeforeSave;
    if (expectBeforeSave) {
      await test.step(`[${c.id}] Step 3: Check the on-screen state before saving`, async () => {
        await expectBeforeSave();
      });
    }
    await test.step(`[${c.id}] Step 4: Save the change and confirm the dialog`, async () => {
      await c.saveAndConfirm();
    });
    const expectAfterSave = c.expectAfterSave;
    if (expectAfterSave) {
      await test.step(`[${c.id}] Step 5: Check the on-screen state after saving`, async () => {
        await expectAfterSave();
      });
    }
    await test.step(`[${c.id}] Step 6: Reload the page and confirm the value was saved`, async () => {
      await c.reload();
      await c.expectAfterReload();
    });
  } catch (err) {
    primaryError = err;
    throw err;
  } finally {
    const cleanup = c.cleanup;
    if (cleanup) {
      try {
        await test.step(`[${c.id}] Step 7: Restore the starting state for the next test`, async () => {
          await cleanup();
        });
      } catch (cleanupErr) {
        // eslint-disable-next-line no-unsafe-finally -- conditional throw only fires when primaryError is null, so there is no in-flight throw to override; otherwise the cleanup error is intentionally suppressed in favor of the primary assertion error.
        if (!primaryError) throw cleanupErr;
      }
    }
  }
}
