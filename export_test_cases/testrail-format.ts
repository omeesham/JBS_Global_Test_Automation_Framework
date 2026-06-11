/**
 * testrail-format.ts — shared step-expansion + per-step-expected + test-data logic
 * for the merged TestRail-layout deliverable workbook.
 *
 * Extracted out of the retired `scripts/_gen-testrail.ts` converter
 * (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT, 2026-06-11). The single deliverable
 * `encore_test_cases.xlsx` is now emitted directly by `to-xlsx.ts` in TestRail
 * step-expanded shape — one first row per case (cols 1-11) plus N continuation
 * rows carrying only `Steps (Step)` + `Steps (Expected Result)`. This module owns
 * the three transforms the old converter did so the emitter (and its unit tests)
 * share ONE source of truth:
 *
 *   - parseSteps(raw)            — split a numbered step blob into atomic actions
 *   - perStepExpected(...)       — synthesise a per-step expected (final = authored)
 *   - deriveTestData(stepsText)  — config-driven, client-safe Test Data column
 *
 * Pure functions, no I/O. `_gen-testrail.ts` is deleted; this is its successor.
 */

// ── Test Data context (config, NOT hardcoded inline) ──────────────────────────
//
// Single config point for the sanitized client-facing Test Data header. The
// 2026-06-11 sanitisation (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION) removed the
// banned test host, raw role string, and `(existing fixture)` / `(created by
// Planner)` provenance from this header; keeping the labels here (not inlined in
// deriveTestData) is what the merge plan means by "labels from config". The
// office id is env-overridable with the canonical 1604 test office as default.
export const TEST_DATA_CONTEXT = {
  user: 'automation user (location-edit permission)',
  officeId: process.env.ENCORE_TEST_OFFICE ?? '1604',
  application: 'Navigator',
} as const;

/** TestRail-ism constants (Type / Priority are fixed columns in the layout). */
export const DEFAULT_TYPE = 'Functional';
export const DEFAULT_PRIORITY = 'Medium';

/**
 * Split a numbered step blob into atomic actions.
 * Port of `_gen-testrail.ts:parseSteps` (1:1, behaviour preserved). Splits on the
 * `¶` paragraph marker or newlines, strips the leading `N.`/`N)` numbering, then
 * further splits a step on `; ` before a capital/paren so compound steps become
 * separate atomic rows.
 */
export function parseSteps(raw: string): string[] {
  if (!raw) return [];
  const text = raw.replace(/\r\n/g, '\n').trim();
  const chunks = text.split(/\s*¶\s*|\n/).map(c => c.trim()).filter(Boolean);
  const parts = chunks.map(c => c.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
  const atomic: string[] = [];
  for (const p of parts) {
    for (const sub of p.split(/;\s+(?=[A-Za-z(])/)) {
      const s = sub.trim().replace(/;+$/, '');
      if (s) atomic.push(s);
    }
  }
  return atomic;
}

/**
 * Synthesise a per-step expected result. Port of `_gen-testrail.ts:perStepExpected`
 * (1:1). The LAST step returns the case's authored expected verbatim; middle steps
 * get a heuristic expected derived from the action verb. `subModule` is the human
 * display submodule (e.g. "Local Information", "Currency") — never the machine slug
 * (no underscores reach a client cell).
 */
export function perStepExpected(step: string, caseExpected: string, isLast: boolean, subModule: string): string {
  if (isLast) return caseExpected.trim();
  const s = step.toLowerCase();
  const subLower = (subModule || '').toLowerCase();
  if (/^(ensure the table is empty|ensure no rows|make sure no rows)/.test(s)) return `The ${subModule} surface shows its documented empty state.`;
  if (/^navigate to https/.test(s) || (s.includes('navigate to') && s.includes('page'))) return `The page loads and the ${subModule} surface is reachable.`;
  if (s.includes('open') && subLower && s.includes(subLower) && s.includes('tab')) return `The ${subModule} tab is active and its content is rendered.`;
  if (/^click "add"|^click add|^click the "add"/.test(s) || s.includes('click "add"')) return 'A new empty row is added and the input receives focus.';
  if (/^(type |paste )/.test(s) || s.includes('fill the row') || s.includes('fill row') || s.includes('fill the new') || s.includes('fill the note row')) return 'The typed/pasted text appears in the input and any counter updates.';
  if (/^click "save"|^click save/.test(s) || s.includes('click left-panel "save"')) return 'The save confirmation dialog appears.';
  if (s.includes('confirm the dialog') || /^click "ok"|^click ok/.test(s)) return 'The dialog closes and the save is persisted; the Save button becomes disabled.';
  if (s.includes('click "cancel"') || /^click cancel/.test(s)) return 'The dialog closes without saving and the form remains dirty.';
  if (s.includes('reload the page') || /^(reload page|reload )/.test(s)) return 'The page reloads successfully.';
  if (s.includes('navigate back') && s.includes('tab')) return `The ${subModule} tab opens and renders the persisted state.`;
  if (/^read /.test(s)) return 'The expected value is read from the row.';
  if (/^(verify |assert |observe)/.test(s)) {
    let target = step.includes(' ') ? step.slice(step.indexOf(' ') + 1) : step;
    target = target.replace(/^(that\s+|the\s+)/i, '').trim();
    if (!target) target = 'the expected state';
    target = target.charAt(0).toUpperCase() + target.slice(1);
    return `${target} is observed in the UI as described.`;
  }
  if (s.includes('click "delete"') || s.includes('delete the row') || s.includes('click delete')) return 'The targeted row is removed from the table.';
  if (s.includes('clear ') && s.includes('row')) return "The targeted row's input becomes empty and any counter updates.";
  if (/^press the escape|^press escape/.test(s)) return 'The dialog closes.';
  if (s.includes('tab through')) return 'Focus moves through each interactive element in tab order.';
  if (s.includes('navigate away')) return 'The browser fires its built-in beforeunload confirmation dialog.';
  if (s.includes('click on the page background') || s.includes('click outside')) return "The dialog's reaction is observed and recorded.";
  return 'The action completes successfully with no error.';
}

/** UI labels that are not meaningful sample inputs (skipped in deriveTestData). */
const UI_LABELS_SKIP = new Set(['Add', 'Save', 'Delete', 'Ok', 'Cancel', 'No Data Available', 'No Notes Available', '(0 Left)']);

/**
 * Build the client-safe Test Data column from a case's step text. Port of
 * `_gen-testrail.ts:deriveTestData` with the header sourced from TEST_DATA_CONTEXT
 * (config) rather than an inline literal. Emits the standing context lines plus up
 * to 6 quoted sample inputs scraped from the steps, and synthetic injection samples
 * when the steps reference `<script>`/`alert(1)`/`DROP TABLE`.
 */
export function deriveTestData(stepsText: string): string {
  const lines = [
    `User: ${TEST_DATA_CONTEXT.user}`,
    `Location: test office ${TEST_DATA_CONTEXT.officeId}`,
    `Application: ${TEST_DATA_CONTEXT.application}`,
  ];
  const seen = new Set<string>();
  let idx = 1;
  for (const m of stepsText.matchAll(/"([^"\n]{1,80})"/g)) {
    const lit = m[1];
    if (!lit || UI_LABELS_SKIP.has(lit) || seen.has(lit)) continue;
    seen.add(lit);
    lines.push(`Sample input ${idx}: "${lit}"`);
    idx += 1;
    if (idx > 6) break;
  }
  if (stepsText.includes('<script>') || stepsText.includes('alert(1)')) lines.push('Sample script-injection input: <script>alert(1)</script>');
  if (stepsText.toUpperCase().includes('DROP TABLE')) lines.push("Sample SQL-injection input: '; DROP TABLE ...; --");
  return lines.join('\n');
}
