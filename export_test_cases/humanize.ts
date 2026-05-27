/**
 * humanize.ts — Shared text-humanization helpers for client-facing exports.
 *
 * Extracted from `to-csv.ts:383-597` (private static methods) and exposed as
 * pure functions so multiple emitters (`to-csv.ts`, `to-xlsx.ts`) produce
 * byte-identical output for the same TC.
 *
 * Phase A.5 of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION lands this module so
 * `xlsx:build --list-only` and `--with-run` modes produce the same humanized
 * cells that `to-csv.ts` historically wrote, and `xlsx-vs-csv-parity.mjs`
 * exits 0 without the `--from-csv` bootstrap.
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

/** Composite: cleanMarkdown → humanizeAssertion → convertElementIdsToLabels. */
export function humanize(text: string): string {
  if (!text) return '';
  return convertElementIdsToLabels(humanizeAssertion(cleanMarkdown(text)));
}
