/**
 * testrail-format.ts — shared step-expansion + test-data logic
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
 * Split a numbered step blob ("1. a 2. b 3. c") into its parts, each part still
 * carrying its authored `N. ` prefix.
 *
 * SEQUENCE-AWARE (2026-06-26 fix): a `N.` is only treated as a step boundary when
 * `N` equals the next expected step number (1, 2, 3, …). This is what stops a
 * content number that ends a sentence — `…for office 1604. 3. Wait…`, `…591.`,
 * `…2026.` — from being mistaken for a step delimiter: `1604` is not the next
 * expected step, so it stays inside the sentence and the number is preserved.
 * The previous `split(/(?<!\d)(?=\d+\.\s)/)` matched ANY `\d+\.\s`, which ate the
 * `1604` and mis-numbered every following step (CPR-SRC-001 shipped `3. 4. Wait…`
 * with `office` dangling). Numbering is sequential in every authored case, so a
 * strict `N === expected` test is exact for the corpus.
 *
 * Falls back to a single part when no leading-`1.` boundary exists (un-numbered
 * step blob), preserving the whole text.
 */
export function splitNumberedSteps(raw: string): string[] {
  if (!raw) return [];
  // Period-only boundary (`N. `), NOT `N)` — top-level steps are authored `1. 2. 3.`
  // (verified: zero source files number top-level steps with `N)`), while a `)` after a
  // number is content: a negative BVA value at a line end (`…offset to -2)`), or a `2)`
  // sub-marker. Matching `N)` made `-2)` look like the next expected step (CPR/LOS BVA
  // cases shipped `2. 2) 2.`). The leading-number strip in parseSteps still tolerates `N)`.
  const re = /(\d+)\.\s/g;
  const boundaries: number[] = [];
  let expected = 1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (parseInt(m[1]!, 10) === expected) {
      boundaries.push(m.index);
      expected += 1;
    }
  }
  if (boundaries.length === 0) {
    const t = raw.trim();
    return t ? [t] : [];
  }
  const parts: string[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i]!;
    const end = i + 1 < boundaries.length ? boundaries[i + 1]! : raw.length;
    const seg = raw.slice(start, end).trim();
    if (seg) parts.push(seg);
  }
  return parts;
}

/**
 * Split a compound step on `; ` into atomic actions — but ONLY at parenthesis
 * depth 0. A semicolon INSIDE a parenthetical is content, not a step boundary:
 * a list ("(a searchable popover; first entry …)"), an example
 * ("(e.g., '; DROP TABLE)"), or an inline clause ("(checked; grid unchanged)").
 * Splitting there breaks the balanced parens into two cells with a dangling
 * "(" / ")" each (the SRC-008 / ECT-013 / LI-111 unbalanced-paren defect, 2026-06-29).
 * Mirrors the old `/;\s+(?=[A-Za-z(])/` rule — split on `;` followed by
 * whitespace + a letter or `(` — but gated on depth === 0.
 */
function splitTopLevelSemicolons(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')') { if (depth > 0) depth--; }
    else if (ch === ';' && depth === 0 && /^\s+[A-Za-z(]/.test(text.slice(i + 1))) {
      out.push(text.slice(last, i));
      last = i + 1;
    }
  }
  out.push(text.slice(last));
  return out;
}

/**
 * Split a numbered step blob into atomic actions.
 * Port of `_gen-testrail.ts:parseSteps` (1:1, behaviour preserved). Splits on the
 * `¶` paragraph marker or newlines, strips the leading `N.`/`N)` numbering, then
 * further splits a step on `; ` (at paren depth 0 — see splitTopLevelSemicolons)
 * before a capital/paren so compound steps become separate atomic rows.
 */
export function parseSteps(raw: string): string[] {
  if (!raw) return [];
  const text = raw.replace(/\r\n/g, '\n').trim();
  const chunks = text.split(/\s*¶\s*|\n/).map(c => c.trim()).filter(Boolean);
  const parts = chunks.map(c => c.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
  const atomic: string[] = [];
  for (const p of parts) {
    for (const sub of splitTopLevelSemicolons(p)) {
      // Strip trailing `;` and any dangling action↔expected separator run
      // (`->`, `--`, `-->`) left at a step boundary — a step never ends in a
      // separator. Mirrors the same strip in to-csv.convertAgentStepsToHumanWithNotes
      // so the CSV oracle and the XLSX cells stay byte-for-byte in lockstep.
      const s = sub.trim().replace(/;+$/, '').replace(/\s*[-–—>]{2,}\s*$/, '').trim();
      if (s) atomic.push(s);
    }
  }
  return atomic;
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
