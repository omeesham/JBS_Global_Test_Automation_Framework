/**
 * Field-Case (FCC) lifecycle runner. Orchestrates the per-field-case discipline:
 *   baseline → act → expectBeforeSave? → save → expectAfterSave? → reload → expectAfterReload → cleanup
 *
 * Each FCC test calls saveAndVerifyCase() once with the case's spec. The runner is page-agnostic —
 * the spec passes the page-object's `saveAndConfirm` and `reload` callbacks, so SSL / other modules
 * reuse this same runner unchanged.
 *
 * See: field-case-generation taxonomy (agent-only) — FCC paradigm origin.
 */

export interface FieldCase {
  /** TC ID for traceability, e.g. "TC-LOC-NTS-033" (canonical submodule-only form per 2026-05-26 naming policy — no -FCC- segment). */
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
 * Execute one FCC case end-to-end. Throws on any step failure (Playwright assertions
 * propagate naturally — no catch/swallow). Each test() block calls this exactly once.
 *
 * Failure isolation: cleanup runs in a finally-equivalent — even if expectAfterReload
 * throws, cleanup still attempts to restore state for the next case. If cleanup itself throws,
 * the original assertion error is preserved (Playwright still reports the test failure).
 */
export async function saveAndVerifyCase(c: FieldCase): Promise<void> {
  let primaryError: unknown = null;
  try {
    await c.baseline();
    await c.act();
    if (c.expectBeforeSave) await c.expectBeforeSave();
    await c.saveAndConfirm();
    if (c.expectAfterSave) await c.expectAfterSave();
    await c.reload();
    await c.expectAfterReload();
  } catch (err) {
    primaryError = err;
    throw err;
  } finally {
    if (c.cleanup) {
      try {
        await c.cleanup();
      } catch (cleanupErr) {
        // eslint-disable-next-line no-unsafe-finally -- conditional throw only fires when primaryError is null, so there is no in-flight throw to override; otherwise the cleanup error is intentionally suppressed in favor of the primary assertion error.
        if (!primaryError) throw cleanupErr;
      }
    }
  }
}
