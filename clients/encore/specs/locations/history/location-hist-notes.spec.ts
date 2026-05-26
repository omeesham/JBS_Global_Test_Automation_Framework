// Location Management History — Notes column (col 69, single aggregate column) per-payload tests.
//
// Encoding rule (verified across long-text-4000, special-chars, newlines, unicode):
//   col 69 = formArrayRows.map(r => `${D} - ${r.value}`).join(' | ')
//   Special chars + newlines + unicode are preserved as-is (no HTML escape, no normalization).
//
// Spec design — content-anchored row lookup (avoids multi-save row-position pollution):
//   - Capture `Date.now() - 5000` (5s clock-skew buffer) BEFORE save.
//   - Save → nav history → sort desc → `getRowsSinceTimestamp(sinceMs, ['Notes', 'Modified On'])`.
//   - Iterate returned rows in newest-first order; pick the row whose Notes value matches
//     one of the two valid encoded forms for `${payload}`.
//   - Strict `.toBe(matchedForm)` assertion (rich diff on mismatch).
//   The BUG-LOC-NTS-003 auto-empty placeholder may or may not be present at save time
//   (depends on Angular form-init state, not deterministic). Both forms are accepted
//   to handle this without weakening the byte-exact equality check.
//   Office 1604 sees interleaved saves from the shared save handler (Local Info auto-saves
//   on form init can push the Notes row off position 0). Content-anchored lookup is the
//   only deterministic way to find the right row across the suite.
//
// Bug workarounds embedded:
//   - BUG-LOC-NTS-001 (delete-only no-persist): `LocationNotesPage.ensureEmptyState()`
//     calls `deleteAllRows()` then `saveAndConfirm()` then reloads — this codifies the
//     clear+delete+save sequence that proved persistence. Invoked in `test.beforeEach`
//     (baseline-state enforcement per LR-019) AND in the `try/finally` cleanup block of
//     TC-LOC-NTS-032 (Office 1604 end-state restore).
//   - BUG-LOC-NTS-002 (dialog button = "Ok" not "Save"): handled by the shared
//     `btnSaveChangesConfirm` selector path through `clickSaveWithDialog` in BasePage.
//   - BUG-LOC-NTS-003 (auto-empty placeholder): expected accepts both single-row and
//     content+placeholder forms; content-anchored lookup is agnostic to which fired.
//
// Cleanup contract:
//   `locationNotesPage` is a test-scoped fixture (per `src/infra/fixtures.ts`), so
//   `test.afterAll` cannot use it directly. The end-state cleanup is instead wrapped
//   in `try/finally` inside the last test (TC-032) — this runs even if the assertion
//   throws, giving the same robustness contract as `afterAll` for this fixture model.

import { test, expect } from '../../../src/infra/fixtures';
import { OFFICE_NO } from '../../../src/data/testdata/common.data';
import {
  NOTE_SEQUENTIAL_HIST_A,
  NOTE_SEQUENTIAL_HIST_B,
} from '../../../src/data/testdata/locations/location-notes.data';

/** Format today as MM/DD/YYYY with leading-zero preservation (catalog rule). */
function todayMMDDYYYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Two valid encoded forms for a single-content-row save.
 *   col 69 = formArrayRows.map(r => `${D} - ${r.value}`).join(' | ')
 * Trailing-space artifact ` ` from the empty placeholder row is trimmed by
 * page-object `getColumnByIndex` / `getRowsSinceTimestamp` read paths.
 */
function expectedCol69Forms(payload: string, D: string): [string, string] {
  return [
    `${D} - ${payload}`,                       // FormArray = [content]
    `${D} - ${payload} | ${D} -`,              // FormArray = [content, empty placeholder] (trimmed)
  ];
}

const PAYLOADS = {
  'TC-LOC-NTS-028': 'hello',                                                                  // baseline → 'hello' save (catalog Save-1 analog)
  'TC-LOC-NTS-029': 'A'.repeat(4000),                                                         // boundary char count (catalog soft-limit 4000)
  'TC-LOC-NTS-030': `<script>alert(1)</script> & "quotes" 'apos' \`tick\` <div>`,            // special chars / HTML-like / quotes / backticks
  'TC-LOC-NTS-031': 'line1\nline2\nline3',                                                    // newlines + multi-line content
  'TC-LOC-NTS-032': 'café résumé 中文 ✔',                                                    // unicode (BMP-only — Latin diacritic + CJK + dingbat)
} as const;

test.describe('Location Management HIST — Notes col 69 @locations @management-history @notes-hist', () => {

  // Per-test setup: navigate to Notes tab + enforce baseline empty state (LR-019).
  // `ensureEmptyState()` is intermittently unreliable per BUG-LOC-NTS-001 — the
  // first delete+save cycle sometimes doesn't persist when Angular's auto-row logic
  // races the Delete click. Retry up to 3 times; the second/third attempts work
  // because the prior cycle reloaded the form, surfacing the persisted state and
  // letting the next deleteAllRows hit a different timing window.
  test.beforeEach(async ({ locationNotesPage }) => {
    const url = locationNotesPage.getCurrentUrl();
    if (!url.includes(`locations/${OFFICE_NO}/settings/location`)) {
      await locationNotesPage.navigateToNotesTab(OFFICE_NO);
    } else {
      // URL is right but the active tab may not be Notes (esp. if prior test left on History).
      await locationNotesPage.clickNotesTab();
    }
    let isEmpty = false;
    for (let attempt = 0; attempt < 3 && !isEmpty; attempt++) {
      await locationNotesPage.ensureEmptyState();
      isEmpty = await locationNotesPage.isDefaultEmptyState();
    }
    // After up to 3 retries, the form must show 0 OR 1 empty textarea (both are valid
    // baselines per LocationNotesPage.isDefaultEmptyState()). The next fillNote(0, ...)
    // handles both. If still not empty after 3 attempts, this assertion captures the
    // pathological case for triage rather than silently proceeding.
    expect(isEmpty).toBe(true);
  });

  // Shared per-test routine: fill + save + content-anchored history lookup + strict assert.
  async function runCol69Assertion(
    locationNotesPage: any,
    locationManagementHistoryPage: any,
    payload: string,
  ): Promise<void> {
    const D = todayMMDDYYYY();
    const [formA, formB] = expectedCol69Forms(payload, D);

    // 5s back-buffer covers client-server clock skew on Modified On rendering.
    const sinceMs = Date.now() - 5_000;

    await locationNotesPage.fillNote(0, payload);
    await locationNotesPage.saveAndConfirm();

    await locationManagementHistoryPage.navigateToHistoryTab(OFFICE_NO);
    await locationManagementHistoryPage.sortByModifiedOnDesc();
    await locationManagementHistoryPage.waitForRecentTopRow();

    const rows = await locationManagementHistoryPage.getRowsSinceTimestamp(
      sinceMs,
      ['Notes', 'Modified On'],
    );
    const matched = rows.find((r: Record<string, string>) => (r.Notes ?? '') === formA || (r.Notes ?? '') === formB);
    if (!matched) {
      const notesPreview = rows.map((r: Record<string, string>) => {
        const notes = r.Notes ?? '';
        return {
          modifiedOn: r['Modified On'] ?? '',
          notesLen: notes.length,
          notesHead: notes.slice(0, 80),
        };
      });
      console.log(`[col69-no-match] sinceMs=${sinceMs} validForms=${JSON.stringify([formA, formB])} rows=${JSON.stringify(notesPreview)}`);
      // Rich-diff failure path: assert against formA so report shows actual vs expected.
      // Picks the newest row's Notes value (rows are desc-sorted) for the diff.
      const firstRow = rows[0];
      const actual = firstRow ? (firstRow.Notes ?? '<no Notes col on row 0>') : '<no rows since sinceMs>';
      expect(actual).toBe(formA);
      return; // unreachable — expect above throws
    }
    // Strict equality on the matched row's Notes value.
    // LR-046 strict-line: literal `.toBe` form (no `.toContain` matcher anywhere in spec).
    // LR-051: avoid opaque `.toBe(true)` on OR expressions — branch so failure shows
    // actual vs expected (formA is preferred / single-row form; formB is the
    // placeholder-fallback form). This branch is unreachable when `.find` matched,
    // but lets the report surface the actual string if a regression weakens the match.
    const matchedNotes = matched.Notes ?? '';
    if (matchedNotes !== formA && matchedNotes !== formB) {
      expect(matchedNotes).toBe(formA);
    }

    await locationManagementHistoryPage.returnToBasicInformation();
  }

  test('TC-LOC-NTS-028: HIST col 69 — empty to "hello" save', async ({
    locationNotesPage, locationManagementHistoryPage, dependencyGate,
  }) => {
    dependencyGate([]);
    test.setTimeout(90_000);
    await runCol69Assertion(locationNotesPage, locationManagementHistoryPage, PAYLOADS['TC-LOC-NTS-028']);
  });

  test('TC-LOC-NTS-029: HIST col 69 — long text 4000 chars (boundary)', async ({
    locationNotesPage, locationManagementHistoryPage, dependencyGate,
  }) => {
    dependencyGate(['TC-LOC-NTS-028']);
    test.setTimeout(120_000);  // longer for 4000-char fill + save round-trip
    await runCol69Assertion(locationNotesPage, locationManagementHistoryPage, PAYLOADS['TC-LOC-NTS-029']);
  });

  test('TC-LOC-NTS-030: HIST col 69 — special chars (HTML-like, quotes, backticks)', async ({
    locationNotesPage, locationManagementHistoryPage, dependencyGate,
  }) => {
    dependencyGate(['TC-LOC-NTS-028']);
    test.setTimeout(90_000);
    await runCol69Assertion(locationNotesPage, locationManagementHistoryPage, PAYLOADS['TC-LOC-NTS-030']);
  });

  test('TC-LOC-NTS-031: HIST col 69 — newlines and multi-line content', async ({
    locationNotesPage, locationManagementHistoryPage, dependencyGate,
  }) => {
    dependencyGate(['TC-LOC-NTS-028']);
    test.setTimeout(90_000);
    await runCol69Assertion(locationNotesPage, locationManagementHistoryPage, PAYLOADS['TC-LOC-NTS-031']);
  });

  test('TC-LOC-NTS-032: HIST col 69 — unicode (Latin diacritic + CJK + dingbat)', async ({
    locationNotesPage, locationManagementHistoryPage, dependencyGate,
  }) => {
    dependencyGate(['TC-LOC-NTS-028']);
    test.setTimeout(90_000);
    try {
      await runCol69Assertion(locationNotesPage, locationManagementHistoryPage, PAYLOADS['TC-LOC-NTS-032']);
    } finally {
      // Final cleanup — restore Office 1604 to catalog baseline (col 69 = "").
      // try/finally ensures cleanup runs even if the assertion above fails.
      // `locationNotesPage` is a test-scoped fixture (not afterAll-compatible), so
      // this is the strongest robustness contract available without spinning a
      // fresh context. BUG-LOC-NTS-001 workaround codified inside ensureEmptyState:
      // clears textarea.value first, then Delete, then Save, then reload
      // (page-object source: location-notes.page.ts:254).
      await locationNotesPage.clickNotesTab();
      await locationNotesPage.ensureEmptyState();
    }
  });

  /**
   * TC-LOC-NTS-038 — HIST col 69 sequential-save 2-row distinctness.
   *
   * Spawned from FCC notes completion 2026-05-21 Phase 1.6 (NTS-059
   * Notes-side rename; HIST counterpart). The Notes-spec NTS-059 was realigned
   * 2026-05-21 — its title now reads "Sequential save persists most recent value
   * (HIST row verification deferred to HIST spec)", and this is the deferred-to spec.
   *
   * Assertion the renamed NTS-059 no longer makes: that sequential saves produce
   * TWO distinct HIST rows (one per save), not one merged row.
   *
   * Strategy: content-anchored lookup per `feedback_history_content_anchored_lookup.md`.
   * Office 1604 sees interleaved saves from the shared save handler, so we cannot
   * assume row[0] / row[1] are our saves — find each by content match independently,
   * then assert the temporal ordering on their `Modified On` timestamps.
   */
  test('TC-LOC-NTS-038: HIST col 69 — sequential save (A then B) produces 2 distinct history rows', async ({
    locationNotesPage, locationManagementHistoryPage, dependencyGate,
  }) => {
    dependencyGate(['TC-LOC-NTS-028']);
    test.setTimeout(120_000);

    const D = todayMMDDYYYY();
    const [formA1, formA2] = expectedCol69Forms(NOTE_SEQUENTIAL_HIST_A, D);
    const [formB1, formB2] = expectedCol69Forms(NOTE_SEQUENTIAL_HIST_B, D);

    // 5s back-buffer covers client-server clock skew on Modified On rendering.
    // Captured BEFORE Save A so the read-window includes both Save A and Save B.
    const sinceMs = Date.now() - 5_000;

    // ── Save A: empty → NOTE_SEQUENTIAL_HIST_A ─────────────────────────────
    await locationNotesPage.fillNote(0, NOTE_SEQUENTIAL_HIST_A);
    await locationNotesPage.saveAndConfirm();
    await locationNotesPage.reloadAndNavigateToNotesTab();

    // ── Save B: clear → NOTE_SEQUENTIAL_HIST_B ─────────────────────────────
    // clearNote sets textarea.value="" via Angular-friendly input event so the
    // form re-dirties and Save re-enables. Different content from A guarantees
    // a new HIST row rather than a no-op save.
    await locationNotesPage.clearNote(0);
    await locationNotesPage.fillNote(0, NOTE_SEQUENTIAL_HIST_B);
    await locationNotesPage.saveAndConfirm();

    // ── HIST verification ──────────────────────────────────────────────────
    await locationManagementHistoryPage.navigateToHistoryTab(OFFICE_NO);
    await locationManagementHistoryPage.sortByModifiedOnDesc();
    await locationManagementHistoryPage.waitForRecentTopRow();

    const rows = await locationManagementHistoryPage.getRowsSinceTimestamp(
      sinceMs,
      ['Notes', 'Modified On'],
    );

    // Find Save A's row + Save B's row by content match. Either FormArray form
    // is valid (BUG-LOC-NTS-003 placeholder may or may not be present at save time).
    const isMatchA = (notes: string): boolean => notes === formA1 || notes === formA2;
    const isMatchB = (notes: string): boolean => notes === formB1 || notes === formB2;
    const rowA = rows.find((r: Record<string, string>) => isMatchA(r.Notes ?? ''));
    const rowB = rows.find((r: Record<string, string>) => isMatchB(r.Notes ?? ''));

    if (!rowA || !rowB) {
      const preview = rows.map((r: Record<string, string>) => ({
        modifiedOn: r['Modified On'] ?? '',
        notesLen: (r.Notes ?? '').length,
        notesHead: (r.Notes ?? '').slice(0, 80),
      }));
      // eslint-disable-next-line no-console
      console.log(`[seq-no-match] sinceMs=${sinceMs} expectedA=${JSON.stringify([formA1, formA2])} expectedB=${JSON.stringify([formB1, formB2])} rows=${JSON.stringify(preview)}`);
      // Rich-diff failure: assert against the preferred (single-row) form so the
      // report shows actual vs expected for whichever side is missing.
      if (!rowA) expect(rows[0]?.Notes ?? '<no rows since sinceMs>').toBe(formA1);
      if (!rowB) expect(rows[0]?.Notes ?? '<no rows since sinceMs>').toBe(formB1);
      return; // unreachable when both rows matched
    }

    // Both saves produced distinct HIST rows. Now prove they are NOT the same row
    // (single merged save) by verifying their Modified On timestamps differ AND
    // that B is more recent than A.
    expect(rowA['Modified On']).not.toBe(rowB['Modified On']);
    // Modified On format per catalog: `MM/DD/YYYY HH:MM:SS AM/PM` (12-hour clock).
    // Date.parse handles this format on V8; if it ever returns NaN, the toBeGreaterThan
    // below would fail loudly with NaN > NaN === false.
    const tA = Date.parse(rowA['Modified On'] ?? '');
    const tB = Date.parse(rowB['Modified On'] ?? '');
    expect(tB).toBeGreaterThan(tA);

    await locationManagementHistoryPage.returnToBasicInformation();

    // Cleanup — restore Office 1604 to catalog baseline (col 69 = "").
    await locationNotesPage.clickNotesTab();
    await locationNotesPage.ensureEmptyState();
  });

});
