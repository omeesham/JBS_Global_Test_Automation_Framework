---
name: HIST per-column tests — anchor row lookup by content, not by row 0
description: Multi-save pollution from shared save handlers (e.g., Local Info auto-saving when Notes tab is loaded) makes "read row 0 of history" non-deterministic. Use content-anchored lookup with timestamp filter.
type: feedback
originSessionId: 7b010c81-a47f-4646-89b5-67f923a03734
---
When authoring HIST per-column tests for Encore Location Management History (or any
multi-tab settings page with a shared save handler), do NOT trust `getColumnByIndex(0, N)`
after `sortByModifiedOnDesc + waitForRecentTopRow`. The "newest row" may belong to a
sibling tab's auto-save (Local Info auto-saves on form init are the known culprit on
Office 1604 settings page).

**Pattern**:
```ts
const sinceMs = Date.now() - 5_000;            // 5s back-buffer for clock skew
await page.saveAndConfirm();
await historyPage.navigateToHistoryTab(OFFICE_NO);
await historyPage.setRowsPerPage('50');         // raise from default 20 — interleaved saves overflow
await historyPage.sortByModifiedOnDesc();
await historyPage.waitForRecentTopRow();
const rows = await historyPage.getRowsSinceTimestamp(sinceMs, ['Notes', 'Modified On']);
const matched = rows.find(r => r.Notes === formA || r.Notes === formB);
expect(matched).toBeDefined();
expect([formA, formB]).toContain(matched!.Notes);
```

**Why**: shared `[data-testid="location-settings-btn-save"]` saves all dirty form sections.
Angular dirty-state per LR-026 manifests reliably: opening Notes tab marks Local Info dirty
(form init writes default values into otherwise-pristine fields), so clicking Save fires
TWO save events at distinct timestamps. The Notes save and Local Info save each produce a
history row; the second one (whichever Angular flushes last) sits at position 0.

**How to apply**: any new HIST per-column test under
`tests/specs/setup/locations/history/*.spec.ts` where you need to verify what a specific
save persisted in a specific column. Discovered while authoring PLAN_PILOT_NOTES_TESTS
TC-LOC-NTS-028..032 (2026-05-11); first try used `getColumnByIndex(0, 69)` and got 2-3 of 5
TCs failing due to interleaved Local Info history rows pushing my Notes row off position 0.
The `getRowsSinceTimestamp` helper already exists on `LocationManagementHistoryPage`
(line 216) — use it. Cross-ref `clients/encore/tests/specs/setup/locations/history/location-hist-notes.spec.ts`
for the live reference implementation.
