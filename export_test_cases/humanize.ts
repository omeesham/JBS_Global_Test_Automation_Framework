/**
 * humanize.ts — Shared text-humanization helpers for client-facing exports.
 *
 * Extracted from `to-csv.ts:383-597` (private static methods) and exposed as
 * pure functions so multiple emitters (`to-csv.ts`, `to-xlsx.ts`) produce
 * byte-identical output for the same TC.
 *
 * Phase A.5 of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION lands this module so
 * `xlsx:build --list-only` and `--with-run` modes produce the same humanized
 * cells that `to-csv.ts` writes for the CSV-format MD parsing intermediary.
 *
 * Scope: text transformation only — no markdown parsing, no I/O, no test-case
 * domain logic. Each function is a pure (text → text) helper.
 */

import { TestStep } from './types';

// ──────────────────────────────────────────────────────────────────────────
// Unicode + markdown sanitization
// ──────────────────────────────────────────────────────────────────────────

/**
 * Replace Unicode characters with ASCII equivalents.
 * Note: ✓/✔ checkmarks normalized to `->` so the action↔expected arrow-split
 * works for files that use them as separators.
 */
export function sanitizeUnicode(value: string): string {
  return value
    .replace(/→/g, '->')
    .replace(/[✓✔]/g, '->')
    .replace(/×/g, 'x')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/‘/g, "'")
    .replace(/’/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/…/g, '...');
}

/**
 * Strip markdown chrome (bold, code spans), drop emoji, normalize whitespace.
 * Calls sanitizeUnicode first so smart-quotes/em-dashes/checkmarks normalize
 * BEFORE the chrome-strip step.
 * Safe for all human columns (Steps, Expected Result, Preconditions, Notes, Title).
 * Bold becomes a quoted value to match the plain-English review style.
 */
export function cleanMarkdown(text: string): string {
  if (!text) return '';
  return sanitizeUnicode(text)
    .replace(/\*\*([^*]+)\*\*/g, '"$1"')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[✅⚠️❌❄]/gu, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .trim();
}

// ──────────────────────────────────────────────────────────────────────────
// DOM-attribute / a11y-tree → plain English
// ──────────────────────────────────────────────────────────────────────────

/**
 * Translate DOM-attribute and a11y-tree phrasings into plain English.
 * Safe for Steps, Expected Result, Title, and Notes. Preserves accessibility
 * property names like aria-label / aria-valuenow that may be deliberately
 * documented.
 * Apply order: cleanMarkdown → humanizeAssertion (so quote/backtick stripping
 * happens first).
 */
export function humanizeAssertion(text: string): string {
  if (!text) return '';
  return text
    // ── Full-clause patterns (most specific first) ──
    .replace(/Tab has\s+aria-selected(?:="?(?:true|false)"?)?/gi, 'tab is selected')
    .replace(/Button with[^,;|\n]*data-testid\s*=\s*"[^"]+"/gi, 'button is shown')
    .replace(/Poll until\s+aria-invalid\s*=\s*"?true"?/gi, 'wait until a validation error appears')
    .replace(/Poll until\s+aria-invalid\s*=\s*"?false"?/gi, 'wait until the validation error clears')
    .replace(/(\bfield\b|\bField\b|\binput\b|\bInput\b)\s+(?:gets|has|shows)\s+aria-invalid(?:\s*=\s*"?true"?)?/gi, '$1 shows a validation error')
    .replace(/(\bfield\b|\bField\b|\binput\b|\bInput\b)\s+(?:no longer has|does(?:n['’]t| not| NOT)\s+have)\s+aria-invalid/gi, '$1 is valid')
    .replace(/no longer has\s+aria-invalid/gi, 'is valid again')
    .replace(/does(?:n['’]t| not| NOT)\s+have\s+aria-invalid/gi, 'is valid')
    .replace(/(?:Triggers?|triggers?)\s+aria-invalid/gi, 'triggers a validation error')
    .replace(/aria-invalid\s+set/gi, 'shows a validation error')
    // ── Attribute=value patterns (quoted and bare) ──
    .replace(/aria-selected\s*=\s*"?true"?/gi, 'is selected')
    .replace(/aria-selected\s*=\s*"?false"?/gi, 'is not selected')
    .replace(/aria-checked\s*=\s*"?true"?/gi, 'is checked')
    .replace(/aria-checked\s*=\s*"?false"?/gi, 'is not checked')
    .replace(/aria-invalid\s*=\s*"?true"?/gi, 'is invalid')
    .replace(/aria-invalid\s*=\s*"?false"?/gi, 'is valid')
    .replace(/aria-disabled\s*=\s*"?true"?/gi, 'is disabled')
    .replace(/aria-disabled\s*=\s*"?false"?/gi, 'is enabled')
    .replace(/disabled\s*=\s*"?true"?/gi, 'is disabled')
    .replace(/(?:has|with)\s+disabled\s+attribute/gi, 'is disabled')
    .replace(/(?:no|without)\s+disabled\s+attribute/gi, 'is enabled')
    .replace(/disabled\s+attribute/gi, 'is disabled')
    // ── Bare attribute names (last-resort; safe ones only) ──
    .replace(/\baria-invalid\b/gi, 'validation error')
    // ── Tab / heading / panel phrasings ──
    .replace(/h\d\s+heading\s+visible/gi, 'heading is visible')
    .replace(/(\d+)\s+tabs?\s+in\s+tablist/gi, '$1 tabs are visible')
    .replace(/Tab\s+panel\s+visible/gi, 'tab content is visible')
    // ── Value / title patterns ──
    .replace(/Input\s+value\s*=\s*"([^"]+)"/gi, 'field shows "$1"')
    .replace(/Page\s+title\s*=\s*"([^"]+)"/gi, 'page title is "$1"')
    // ── data-testid stragglers (bracketed form first) ──
    .replace(/\[\s*data-testid\s*=\s*"[^"]+"\s*\]/gi, '')
    .replace(/\s*data-testid\s*=\s*"[^"]+"\s*/gi, ' ')
    // ── Cleanup whitespace and dangling punctuation introduced by the strips ──
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/^[\s,.;|]+|[\s,.;|]+$/g, '')
    .trim();
}

// ──────────────────────────────────────────────────────────────────────────
// Element-ID → UI label
// ──────────────────────────────────────────────────────────────────────────

/** Convert camelCase to readable label. "ApplyLDW" → "Apply LDW". */
export function camelToLabel(camel: string): string {
  return camel
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

/** Convert element IDs to human-readable UI labels (quoted, not markdown bold). */
export function convertElementIdsToLabels(text: string): string {
  return text
    .replace(/chk([A-Z][a-zA-Z]+)/g, (_, name) => `"${camelToLabel(name)}" checkbox`)
    .replace(/spin([A-Z][a-zA-Z]+)/g, (_, name) => `"${camelToLabel(name)}" field`)
    .replace(/drp([A-Z][a-zA-Z]+)/g, (_, name) => `"${camelToLabel(name)}" dropdown`)
    .replace(/btn([A-Z][a-zA-Z]+)/g, (_, name) => `"${camelToLabel(name)}" button`)
    .replace(/txt([A-Z][a-zA-Z]+)/g, (_, name) => `"${camelToLabel(name)}" text field`)
    .replace(/lbl([A-Z][a-zA-Z]+)/g, (_, name) => `"${camelToLabel(name)}" label`)
    .replace(/value="([^"]+)"/gi, '"$1"')
    .replace(/Value="([^"]+)"/gi, '"$1"');
}

// ──────────────────────────────────────────────────────────────────────────
// Submodule / preconditions
// ──────────────────────────────────────────────────────────────────────────

/**
 * Canonical submodule-to-tab mapping. Single source of truth.
 * When adding a new submodule code: add here ONCE, derivers read from here.
 */
export const TAB_MAP: Record<string, { submodule: string; tab: string }> = {
  CUR: { submodule: 'currency', tab: 'Currency tab is active' },
  PRI: { submodule: 'pricing', tab: 'Pricing tab is active' },
  PRC: { submodule: 'pricing', tab: 'Pricing tab is active' },
  LI: { submodule: 'local_information', tab: 'Local Information tab is active' },
  LCL: { submodule: 'local_information', tab: 'Local Information tab is active' },
  LP: { submodule: 'left_panel', tab: 'Basic Information tab is active' },
  LGL: { submodule: 'legal', tab: 'Legal tab is active' },
  ACC: { submodule: 'account_address', tab: 'Account and Address tab is active' },
  NTS: { submodule: 'notes', tab: 'Notes tab is active' },
  SSL: { submodule: 'shared_setup_locations', tab: 'Shared Setup Locations tab is active' },
  AAO: { submodule: 'auto_addon', tab: 'Auto Add-On tab is active' },
  MGH: { submodule: 'management_history', tab: 'Location Management History tab is active' },
  BAS: { submodule: 'basic_information', tab: 'Basic Information tab is active' },
  HST: { submodule: 'history', tab: 'Location Settings History tab is active' },
  HIS: { submodule: 'history', tab: 'Location Settings History tab is active' },
  ECT: { submodule: 'ect_settings', tab: 'ECT Settings tab is active' },
  HIST: { submodule: 'history_integration', tab: 'Location Management History tab is active' },
  HISL: { submodule: 'history_integration', tab: 'Location Settings History tab is active' },
};

/** Generate preconditions from test case context when not provided. */
export function generatePreconditions(id: string, _type: string, steps: string): string {
  const preconditions: string[] = [];

  if (id.includes('TC-LOC')) {
    preconditions.push('Office 1604 is open in Navigator');
    const subMatch = id.match(/TC-LOC-([A-Z]+)-(?:\d+|[A-Z]+)/);
    const subCode = subMatch?.[1] ?? '';
    const tabEntry = subCode ? TAB_MAP[subCode] : undefined;
    preconditions.push(tabEntry ? tabEntry.tab : 'Basic Information tab is active');
  }

  if (id.includes('TC-LOS')) {
    preconditions.push('Local Office Settings page is open (Office 1604)');
    const subMatch = id.match(/TC-LOS-([A-Z]+)-(?:\d+|[A-Z]+)/);
    const subCode = subMatch?.[1] ?? '';
    const tabEntry = subCode ? TAB_MAP[subCode] : undefined;
    preconditions.push(tabEntry ? tabEntry.tab : 'Basic Information tab is active');
  }

  if (/Apply LDW|chkApplyLDW/i.test(steps)) {
    preconditions.push('"Apply LDW" checkbox is in default state');
  }
  if (/LDW Percentage|spinLDWPercentage/i.test(steps)) {
    preconditions.push('"LDW Percentage" field shows default value (0.04)');
  }

  return preconditions.join('. ') + (preconditions.length > 0 ? '.' : '');
}

/** Convert preconditions array to human-readable string (fallback). */
export function convertPreconditionsToHuman(preconditions: string[]): string {
  if (!preconditions || preconditions.length === 0) return '';
  return preconditions.map(p => convertElementIdsToLabels(p)).join('; ');
}

/**
 * Convert steps array to human-readable string (fallback).
 * Action-only output; per-step expected drops out (Expected Result column carries it).
 */
export function convertStepsToHuman(steps: TestStep[]): string {
  if (!steps || steps.length === 0) return '';
  return steps.map(s => `${s.stepNumber}. ${convertElementIdsToLabels(s.action)}`).join('\n');
}

/** Convert expected results array to human-readable string (fallback). */
export function convertExpectedToHuman(expectedResults: string[]): string {
  if (!expectedResults || expectedResults.length === 0) return '';
  return expectedResults.map(r => convertElementIdsToLabels(r)).join('; ');
}

// ──────────────────────────────────────────────────────────────────────────
// Internal-vocabulary scrubbing (Phase D-prep, 2026-05-27)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Strip internal vocabulary that leaked into customer-facing cells per the
 * Phase D pre-audit (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION). All 5 audit
 * subagents independently surfaced these patterns in Title / Steps /
 * Expected Result / Notes columns:
 *
 *   - Bug / plan / rule IDs: `BUG-LI-002`, `BUG-LOC-NTS-001`, `SP-DQU-04`,
 *     `LR-026`, `LR-ENC-002`, `PLN-049`
 *   - Agent stamps: `MCP-verified`, `MCP_VERIFICATION_LOG: ...`, `MCP-1`,
 *     `(MCP-4)`, `RCA 2026-05-12`, `observed 2026-04-27`
 *   - Audit prose: `per SP-DQU-04`, `per BUG-LI-001`, `Filed as ...`,
 *     `(filed)`, `CORRECTION from 2026-02-19`, `PRIMARY_SYMPTOM_RESOLVED`
 *   - Internal-team author addressees: `<!-- TODO 2026-05-20 (Rutvik): ...-->`
 *   - Spec-internal API names + Angular control names (`form.pristine`,
 *     `form.invalid`, `isHistoryTableEmpty()`)
 *   - Internal API paths: `/api/location/check-unbilled`
 *
 * Aggressive on token classes; conservative on prose around them (so the
 * surrounding sentence still reads). Run AFTER humanizeAssertion +
 * convertElementIdsToLabels so DOM markers are already translated.
 */
export function scrubInternalVocab(text: string): string {
  if (!text) return '';
  let s = text;

  // HTML comments addressed to internal users (covers the 412-char "Rutvik"
  // TODO + any future <!-- TODO ... --> / <!-- NOTE ... --> blocks).
  s = s.replace(/<!--[\s\S]*?-->/g, '');

  // MCP_VERIFICATION_LOG section: from the marker through end of line.
  s = s.replace(/MCP_VERIFICATION_LOG\s*:[^\n]*/gi, '');

  // Audit-trail parentheticals: "(per SP-DQU-04 ...)", "(per BUG-LI-001 ...)",
  // "(filed as ...)", "(observed YYYY-MM-DD)", "(rewritten per ... — ...)",
  // "(form-validity gate per ...)", "(PRIMARY_SYMPTOM_RESOLVED 2026-04-28)".
  s = s.replace(/\(\s*(?:per|filed as|observed|rewritten per|form-validity gate per|MCP[- ]\d+|MCP[- ]verified|PRIMARY_SYMPTOM_RESOLVED)\b[^)]*\)/gi, '');

  // Standalone "Filed as BUG-...." / "CORRECTION from YYYY-MM-DD" sentences
  // (drop the whole sentence — they don't add customer value).
  s = s.replace(/(?:^|[.;\n])\s*Filed as[^.\n]*\.?/g, '');
  s = s.replace(/(?:^|[.;\n])\s*CORRECTION from \d{4}-\d{2}-\d{2}[^.\n]*\.?/g, '');
  // RCA YYYY-MM-DD references — drop wherever they appear (mid-sentence
  // parentheticals are common: "(Angular dirty state — RCA 2026-05-12: ...)").
  // Strip from "RCA" through end-of-clause (next `)` / `,` / `;` / `.`).
  s = s.replace(/[\s,—-]*RCA \d{4}-\d{2}-\d{2}[^)\n.;,]*[)\n.;,]?/g, '');
  // FIXME(BUG-…) prefix on If Failed Reason cells: drop the wrapper, keep
  // the human-readable reason text that follows the colon.
  s = s.replace(/\bFIXME\s*\(\s*BUG-[A-Z]+(?:-[A-Z]+)*-\d+\s*\)\s*:\s*/g, '');
  // Plain "FIXME(...)" wrappers around any other bug-id-looking content.
  s = s.replace(/\bFIXME\s*\(\s*[^)]{1,60}\s*\)\s*:?\s*/g, '');

  // Bare-token strips (work everywhere in prose). Order matters — longest first.
  const BARE_TOKENS: RegExp[] = [
    /\bBUG-[A-Z]+(?:-[A-Z]+)*-\d+\b/g,             // BUG-LI-002, BUG-LOC-NTS-001
    /\bSP-[A-Z]+(?:-[A-Z0-9]+)*-\d+[a-zA-Z]?\b/g,  // SP-DQU-04, SP-AAE-02
    /\bSUBPLAN_[A-Z0-9_]+\b/g,                     // SUBPLAN_XLSX_PREP_01
    /\bPLAN_[A-Z0-9_]+\b/g,                        // PLAN_CSV_TO_XLSX_...
    /\bLR-(?:ENC-)?\d+\b/g,                         // LR-026, LR-ENC-002
    /\b(?:PLN|GEN|HLR|AUD|ALL|COP|REQ|MOD|SHR|MCP)-\d+[A-Z]?\b/g, // PLN-049, ALL-077
    /\bMCP[- ]verified\b/gi,                        // "MCP-verified", "MCP verified"
    /\bMCP[- ]\d+\b/g,                              // MCP-1, MCP-4
    /\bPRIMARY_SYMPTOM_RESOLVED\b/g,
    /\bMCP_VERIFICATION_LOG\b/gi,                   // residual after the section strip above
  ];
  for (const re of BARE_TOKENS) s = s.replace(re, '');

  // Internal API paths and Angular control idioms when they appear bare in
  // customer-facing prose. Conservative scope — only flag the specific tokens
  // surfaced by Phase D pre-audit subagents 3 + 4.
  s = s.replace(/\bform\.(pristine|invalid|dirty|valid|touched|pending)\b/g, 'the form');
  s = s.replace(/\/api\/[a-z0-9/_-]+/gi, 'the API');
  // Spec-internal helper function calls (e.g., isHistoryTableEmpty(),
  // fillNote(0, "a"), saveAndConfirm(), validateBillWayDate()). Strip the
  // camelCase-form `Name(...)` only — requires lowercase-start + at least one
  // CapitalizedWord (so prose like `column(content)` is NOT a false match).
  // 2026-05-27 tightening per v2 audit truncation findings.
  s = s.replace(/\b[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]+\([^)]*\)/g, '');
  // Bare spec-helper identifiers in Steps cells. Conservative set — only the
  // well-known harness verbs that cannot be confused with prose.
  // DROPPED 2026-05-27 per v2 audit: `baseline → Capture baseline state`,
  // `act → Perform the action`, `reload → Reload the page` — all three caused
  // grammar regressions in mid-clause prose ("treat as setup baseline" →
  // "treat as setup Capture baseline state"; "after add+save+reload" →
  // "after add+save+Reload the page"). Translation belongs in MD source.
  const SPEC_HELPER_TRANSLATIONS: Array<[RegExp, string]> = [
    [/\bensureEmptyState\b/g, 'Ensure the table is in its empty state (delete any existing rows and save)'],
    [/\bsaveAndConfirm\b/g, 'Click Save and confirm the dialog'],
    [/\breloadAndNavigateToNotesTab\b/g, 'Reload the page and navigate to the Notes tab'],
    [/\breloadAndNavigateTo[A-Z][a-zA-Z]*Tab\b/g, 'Reload the page and navigate back to the same tab'],
    [/\bexpectBeforeSave\b/g, 'Verify the expected state before saving'],
    [/\bexpectAfterSave\b/g, 'Verify the expected state after saving'],
    [/\bexpectAfterReload\b/g, 'Verify the expected state after reload'],
  ];
  for (const [re, replacement] of SPEC_HELPER_TRANSLATIONS) s = s.replace(re, replacement);

  // Angular / DOM-specific tokens that surfaced in customer-facing cells per
  // Phase D pre-audit. Replace with plain-English equivalents.
  const DOM_ANGULAR_TRANSLATIONS: Array<[RegExp, string]> = [
    [/<thead>/g, 'header row'],
    [/<tbody>/g, 'table body'],
    [/\bFormArray\b/g, 'internal list state'],
    [/\bFormControl\.(dirty|invalid|valid|touched|pristine|pending)\b/g, 'the form'],
    [/\bFormControl\b/g, 'form field'],
    [/\bFormGroup\b/g, 'form'],
  ];
  for (const [re, replacement] of DOM_ANGULAR_TRANSLATIONS) s = s.replace(re, replacement);

  // Cleanup: collapse whitespace + dangling punctuation introduced by the
  // strips above (matches humanizeAssertion's trailing cleanup).
  s = s.replace(/\s{2,}/g, ' ')
       .replace(/\s+([,.;:])/g, '$1')
       .replace(/[ \t]+\n/g, '\n')
       .replace(/^[\s,.;|]+|[\s,.;|]+$/g, '')
       .trim();

  return s;
}

/** Composite: cleanMarkdown → humanizeAssertion → convertElementIdsToLabels → scrubInternalVocab. */
export function humanize(text: string): string {
  if (!text) return '';
  return scrubInternalVocab(
    convertElementIdsToLabels(humanizeAssertion(cleanMarkdown(text))),
  );
}
