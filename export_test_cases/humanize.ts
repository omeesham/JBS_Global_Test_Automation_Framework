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


// ──────────────────────────────────────────────────────────────────────────
// Unicode + markdown sanitization
// ──────────────────────────────────────────────────────────────────────────

/**
 * Replace Unicode characters with ASCII equivalents.
 * Note: ✓/✔ checkmarks are context-aware (LR-ENC-004 V3 closure, 2026-06-05).
 * As CONTENT — backticked (`✔`), parenthesized ((✓)/(✗)), or a `=✓` value — they
 * become words so they never corrupt a cell. As a bare space-delimited SEPARATOR
 * (action ✔ expected) they stay `->` for the action↔expected step-split.
 */
export function sanitizeUnicode(value: string): string {
  return value
    .replace(/→/g, '->')
    // content checkmarks first (so a checkmark used as content is never read as
    // the action↔expected separator); bare separator checkmark stays '->' below.
    // Tight match only (no inner whitespace): a genuine content checkmark is `✔`. The
    // loose `\s*` form falsely spanned the gap between two SEPARATE code-spans when a bare
    // `✓` action→expected separator sat between them (`` `[testid]` ✓ `alertdialog` ``),
    // welding "check mark" onto the next word (NTS-008, 2026-06-25). A spaced `✓` now falls
    // through to the bare `->` separator rule below, as intended.
    .replace(/`[✓✔]`/g, 'check mark')
    .replace(/\(\s*[✓✔]\s*\)/g, '(checked)')
    .replace(/\(\s*[✕✖✗✘]\s*\)/g, '(unchecked)')
    .replace(/=\s*[✓✔]/g, '= checked')
    .replace(/=\s*[✕✖✗✘]/g, '= unchecked')
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
 * Safe for Steps, Expected Result, Title, and Notes. Translates aria-checked /
 * -selected / -invalid clauses here; the remaining raw ARIA property names
 * (aria-label / aria-valuenow / role="…") are stripped downstream in
 * scrubInternalVocab (LR-ENC-004 V2 — the deliverable carries zero ARIA markup).
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
    // Newline-safe (2026-06-29): horizontal-only collapse so a strip that leaves
    // `space+\n` at a step boundary cannot fuse two numbered steps (see the same
    // fix in scrubInternalVocab). Single-line cells are unaffected (no `\n`).
    .replace(/[ \t]+/g, ' ')
    .replace(/[^\S\n]+([,.;])/g, '$1')
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

// NOTE (2026-06-11, PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): the duplicated
// TAB_MAP + generatePreconditions/convert*ToHuman surface that used to live here
// was DEAD code (zero importers — to-csv.ts uses its own private copies) and a
// drift hazard against the module-codes.json registry. Removed. Submodule
// semantics live in export_test_cases/module-codes.json; precondition phrases
// live in to-csv.ts TAB_MAP.

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
  // Host-relative API endpoints, optionally prefixed by an HTTP verb and a leading
  // path segment (e.g. "GET /navigator/api/location/pricing/strategies"). Consume the
  // verb + WHOLE path together so we never leave a mangled "/navigatorthe API"
  // (closure-audit D2 scrub-bug fix, 2026-06-05 — the old /\/api\// rule started at
  // "/api/" and stranded the "/navigator" prefix). Verb form first, then bare path.
  s = s.replace(/\b(?:GET|POST|PUT|PATCH|DELETE)\s+(?:\/[a-z0-9_-]+)*\/api\/[a-z0-9/_-]+/gi, 'the API request');
  s = s.replace(/(?:\/[a-z0-9_-]+)*\/api\/[a-z0-9/_-]+/gi, 'the API');
  // Spec-internal helper function calls (e.g., isHistoryTableEmpty(),
  // fillNote(0, "a"), saveAndConfirm(), validateBillWayDate()). Strip the
  // camelCase-form `Name(...)` only — requires lowercase-start + at least one
  // CapitalizedWord (so prose like `column(content)` is NOT a false match).
  // 2026-05-27 tightening per v2 audit truncation findings.
  s = s.replace(/\b[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]+\s*\([^)]*\)/g, '');
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
    // ARIA role names → plain UI nouns (client deliverable should not read like an
    // accessibility tree). Idempotent: 'dropdown'/'field'/'panel' contain no role tokens.
    [/\bcombobox\b/gi, 'dropdown'],
    [/\bspinbutton\b/gi, 'field'],
    [/\btextboxes\b/gi, 'fields'],
    [/\btextbox\b/gi, 'field'],
    // Container roles + the Radix component-library name (LR-ENC-004 V2, 2026-06-05).
    // Radix stripped BEFORE listbox so "Radix listbox" collapses to "dropdown".
    [/\btabpanel\b/gi, 'panel'],
    [/\balertdialog\b/gi, 'alert dialog'],
    [/\bRadix\b\s*/g, ''],
    [/\blistbox\b/gi, 'dropdown'],
    // Angular "dirty"/"pristine" change-tracking jargon → plain English. Specific
    // "dirty-state tracking" first so it reads as "change tracking", then the
    // standalone forms collapse to "unsaved changes".
    [/\bdirty[- ]?state tracking\b/gi, 'change tracking'],
    [/\bdirty[- ]?(?:state|flag)\b/gi, 'unsaved changes'],
  ];
  for (const [re, replacement] of DOM_ANGULAR_TRANSLATIONS) s = s.replace(re, replacement);

  // ── Client-deliverable hardening (LR-ENC-004 V2, 2026-06-05) ──
  // Strip ARIA role/attribute markup, raw test-env hostnames, and internal
  // authoring tags the token-lint denylist did not catch. Runs after the
  // DOM_ANGULAR_TRANSLATIONS word-swaps and before the final id-label pass +
  // whitespace cleanup, so any double-spaces introduced here collapse below.
  // role="..." (+ any trailing aria-* attrs), with optional wrapping parens.
  s = s.replace(/\s*\(?\s*role\s*=\s*"[^"]*"(?:\s+aria-[a-z]+\s*=\s*"[^"]*")*\s*\)?/gi, ' ');
  // aria-NAME="value" attribute forms.
  s = s.replace(/\s*aria-[a-z]+\s*=\s*"[^"]*"/gi, '');
  // Bare ARIA property names → plain words (keeps a11y-test prose readable).
  s = s.replace(/\baria-label\b/gi, 'accessible name')
       .replace(/\baria-valuenow\b/gi, 'current value')
       .replace(/\baria-[a-z]+\b/gi, '');
  // Full app URL → relative route (drop test-env scheme+host, keep the path).
  s = s.replace(/https?:\/\/[^/\s]*encoreglobal\.com/gi, '');
  // Internal authoring tags: [FIXME], [WIP], [TODO], [BUG...], (FCC), (WIP), (TODO).
  s = s.replace(/\s*\[(?:FIXME|WIP|TODO|BUG)[^\]]*\]/gi, '')
       .replace(/\s*\((?:FCC|WIP|TODO)\)/gi, '');
  // Double-"the" typo backstop (provably safe — "the the" is never valid English).
  s = s.replace(/\bthe the\b/gi, 'the');
  // Leading internal status tag at the START of a cell ("DROPPED — …", "WIP: …").
  // Anchored to cell-start + a separator so a legit mid-sentence word ("dropped
  // frames", "deferred to NTS-038") is never touched (LR-ENC-004 V3, 2026-06-05).
  s = s.replace(/^\s*(?:DROPPED|NOT-AUTOMATABLE|DEFERRED|WIP|TODO)\s*[-–—:]\s*/i, '');

  // Element-id selectors that slipped past convertElementIdsToLabels (e.g. the
  // Notes-column path does not run it, so `btnSavePricing` leaked into client
  // cells). Idempotent on already-translated text. Keeps the deliverable free of
  // raw chk*/spin*/drp*/btn*/txt*/lbl* identifiers.
  s = convertElementIdsToLabels(s);
  // De-shout internal CONSTANT_NAME test-fixture references (e.g. NOTE_3999_CHARS,
  // LEGAL_INVALID_SC_VALUE, LEGAL_ALT_SC) that appear in step text. Keep the words,
  // drop the SCREAMING_SNAKE signature so client cells don't read like code
  // identifiers. Only matches ALL-CAPS tokens with >=2 underscore-joined segments,
  // so legit prose and acronyms (USD, LDW, ECT) are untouched.
  s = s.replace(/\b[A-Z][A-Z0-9]*_[A-Z0-9_]{2,}\b/g, t => t.toLowerCase().replace(/_/g, ' '));

  // ── Test-mechanic / QA-artifact leftovers (LR-ENC-004 V3 closure, 2026-06-05) ──
  // Bare harness helpers that slip past the camelCase-call strip (no parens), the
  // automation.<method>() driver calls, and the now-dangling connector word
  // ("via"/"per"/"by"/"from") they leave in front of an arrow / punctuation / EOL.
  s = s.replace(/\bensureDefaultState\b/g, '');
  s = s.replace(/\bautomation\.[a-z][a-zA-Z0-9]*\([^)]*\)/gi, '');
  s = s.replace(/\b(?:via|per|by|from|for|with|as)\s+(?=(?:->|→)|[)\].;,]|\s*$)/gi, '');
  // Internal QA-artifact / change-tracking jargon → plain English.
  s = s.replace(/\bwalk-evidence\b/gi, 'a live walk');
  s = s.replace(/\bform-dirty\b/gi, 'unsaved-changes');
  s = s.replace(/\bthis TC\b/g, 'this test case');

  // ── Coverage-depth taxonomy + surface-case labels (audit 2026-06-25). The internal
  //    L1/L2/L3 depth markers (QUICK = L1, DEEP = L2/L3) belong ONLY on the
  //    `**Surface_Family**:` line — which is NOT an emitted column. A GIVER appended them
  //    to the human `## TC-…:` heading and they shipped into the NM-2260 Search Titles.
  //    Strip the parenthesized markers + the SBC / Surface_Family labels from any client
  //    cell. Backed by the xlsx-lint deny-list (fail-green backstop). ──
  s = s.replace(/\s*\((?:QUICK|DEEP)\b[^)]*\)/gi, ''); // (QUICK) (DEEP) (DEEP/FLAG)
  s = s.replace(/\s*\(\s*FLAG\s*\)/gi, '');
  s = s.replace(/\bSurface[_ ]Family\b/gi, '');
  s = s.replace(/\bSBC\b/g, '');

  // ── Tier-2 test-method jargon → plain English (a reviewer reads the behavior, not how
  //    we automate it). Multi-word forms first so the single-word fallbacks leave no
  //    fragment. Backed by the deny-list (content-anchored / positive-control / nth()). ──
  s = s.replace(/\bnth\s*\(\s*[^)]*\)/gi, 'row position');  // nth(N) / nth(0)
  s = s.replace(/\bnth\s+row\s+index\b/gi, 'row position');
  s = s.replace(/\bby\s+content[- ]anchor(?:ed)?\b/gi, 'by content');
  s = s.replace(/\bcontent[- ]anchored\b/gi, 'content-based');
  s = s.replace(/\bcontent\s+anchor\b/gi, 'content');
  s = s.replace(/\bPositive[- ]control\b/g, 'Baseline check');
  s = s.replace(/\bpositive[- ]control\b/g, 'baseline check');

  // ── Selector / automation-directive jargon (audit 2026-06-25 round 2). CSS/Playwright
  //    selectors and "do NOT use …" test directives are pure automation-speak a reviewer
  //    never needs. Drop the `(e.g., tr:has-text(…) or ID-based anchor)` hint, translate a
  //    `tag:has-text("X")` selector into "the \"X\" <tag>", and strip the directive tail. ──
  s = s.replace(/\s*\(e\.g\.,?[^()]*has-text\([^)]*\)[^()]*\)/gi, '');
  s = s.replace(/\b([a-z]+):has-text\(\s*"([^"]*)"\s*\)/gi, 'the "$2" $1');
  s = s.replace(/:has-text\(\s*"([^"]*)"\s*\)/gi, '"$1"');
  s = s.replace(/\busing a content-based selector\b/gi, 'by its content');
  s = s.replace(/[-–—,;]?\s*do NOT use\b[^.\n]*?(?:row[- ]index|hard[- ]?cod|position|count|selector|nth)[^.\n]*/gi, '');

  // ── Positional / DOM-internal jargon → plain English. ──
  s = s.replace(/\bhard[- ]?cod(?:e|ed|ing)\b/gi, 'fixed');
  s = s.replace(/\brow[- ]index\s+(\d+)/gi, 'row $1');
  s = s.replace(/\brow[- ]index\b/gi, 'position');
  s = s.replace(/\bordinal\s+position\b/gi, 'position');
  s = s.replace(/\bordinal\b/gi, 'position');
  s = s.replace(/\bin the DOM\b/gi, 'on the page');

  // ── Leaked spec-helper index-calls (the Notes module ships these because they are
  //    lowercase — the camelCase-call strip above cannot see `row(0, …)` / `value(0)`).
  //    Translate the regular forms into plain steps; backed by the deny-list. ──
  s = s.replace(/\bFor i in 0\.\d+\s*:/gi, 'For each note row:');
  s = s.replace(/\bif i\s*>\s*0\b/gi, 'after the first row');
  // Resolve nested `"X".repeat(N)` BEFORE the paste/fill rules below, so the inner `)` of
  // repeat() does not truncate their non-greedy argument capture (NTS-044).
  s = s.replace(/"([^"]*)"\.repeat\(\s*(\d+)\s*\)/gi, '"$1" repeated $2 times');
  s = s.replace(/\bfill the note row\(\s*(\d+)\s*,\s*([^)]*?)\s*\)/gi, 'type $2 into note row $1');
  s = s.replace(/\bfill the note row\(\s*i\s*,\s*([^)]*?)\s*\)/gi, 'type $1 into the note row');
  s = s.replace(/\bread the note value\(\s*(\d+)\s*\)\s*returns\b/gi, 'note row $1 reads');
  s = s.replace(/\bread the note value\(\s*i\s*\)/gi, "the note row's value");
  s = s.replace(/\b(?:the )?note value\(\s*(\d+)\s*\)/gi, 'note row $1');
  s = s.replace(/\bclear the note row\(\s*(\d+)\s*\)/gi, 'clear note row $1');
  s = s.replace(/\bdelete the row\(\s*(\d+)\s*\)/gi, 'delete note row $1');
  s = s.replace(/\bpaste into the note\(\s*(\d+)\s*,\s*([^)]*?)\s*\)/gi, 'paste $2 into note row $1');
  s = s.replace(/\bappend text to the note\(\s*(\d+)\s*,\s*([^)]*?)\s*\)/gi, 'append $2 to note row $1');
  s = s.replace(/\bvalue\(\s*(\d+)\s*\)/gi, "row $1's value");
  s = s.replace(/\brow\(\s*(\d+)\s*\)/gi, 'row $1');
  // Internal clarification-question IDs (e.g. CPR-DETAIL-Q1) → the plain-English
  // phrase the other modules already use for raised product questions.
  s = s.replace(/\braised as [A-Z]{2,}-[A-Z]+-Q\d+\b/g, 'raised as a clarification for the product team');
  s = s.replace(/\b[A-Z]{2,}-[A-Z]+-Q\d+\b/g, 'a clarification for the product team');
  // Trailing internal divergence-ledger code ("; D6)" / ", D2]") → drop the code.
  s = s.replace(/[;,]\s*D\d+\s*(?=[)\].]|$)/g, '');

  // Collapse parens left EMPTY or separator/connector-only by the strips above
  // ("()", "( )", "( - )", "(LR-026)"→"()", "(... — MCP)"→"(... — )", "(X per )").
  s = s.replace(/\s*[-–—,;:/]+\s*\)/g, ')')
       .replace(/\(\s*[-–—,;:/+]+\s*/g, '(')
       .replace(/\s+\)/g, ')')
       .replace(/\s*\(\s*\)/g, '');

  // Cleanup: collapse whitespace + dangling punctuation introduced by the
  // strips above (matches humanizeAssertion's trailing cleanup).
  // NEWLINE-SAFE (2026-06-29 fix): collapse only HORIZONTAL whitespace runs.
  // The previous `\s{2,}` matched a `space+\n` pair left when a strip removed a
  // trailing `(per …)` parenthetical at end-of-step, collapsing both into ONE
  // space and FUSING two numbered steps onto one line (LI-003/004/078, SRC-056).
  // `[^\S\n]` is "whitespace that is not a newline", so step-boundary newlines
  // survive while real double-spaces still collapse. Single-line cells (titles,
  // expected) contain no `\n`, so their behaviour is unchanged.
  s = s.replace(/[^\S\n]{2,}/g, ' ')
       .replace(/[^\S\n]+([,.;:])/g, '$1')
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
