#!/usr/bin/env node
/**
 * xlsx-lint-rules.mjs — Single source of truth for the Encore deliverable workbook
 * deny-list (vocabulary) + cross-column integrity checks (LR-ENC-004).
 *
 * Imported by every gate so build / commit / ship enforce the SAME rules (ALL-026 DRY):
 *   - scripts/xlsx-vocab-lint.mjs        — commit-time CLI (npm run xlsx:lint)
 *   - export_test_cases/to-xlsx.ts       — build-time self-fail (dynamic import)
 *   - scripts/verify-no-forbidden.mjs    — ship-time gate (LR-049)
 *
 * Two leak classes are detected:
 *   1. VOCAB  — internal/agent/framework/slang/speculation tokens in any client cell.
 *   2. INTEGRITY — cross-column contradictions the token scan cannot see. The
 *      'Notes / Reason' cell is now reason-ONLY (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER):
 *      the whole cell IS the curated reason, optionally marked "Blocked — "
 *      (splitNotesReason); execution is the 'Automation Status' column:
 *        C1  Automation Status == 'Pass' AND a "Blocked — " segment    → FAIL (join bug)
 *        C2  Coverage Status / Automation Status outside the enum       → FAIL
 *        C3  Automation Status == 'Blocked' AND no "Blocked — " segment → WARN (kept-visible reason missing)
 *        C4  Coverage Status == 'Manual' AND (status set OR "Blocked — " segment) → FAIL
 *        C5  "Blocked — " segment under 4 words excl. marker (not allowlisted) → FAIL (internal label, not a sentence)
 *        C9  Notes / Reason anti-pollution gate (reason-only enforcement) → FAIL
 *            (Pass row populated / "Cleanup after test…" breadcrumb / non-curated
 *             blank-execution commentary). See lintWorkbook + §2.7 of the declutter plan.
 *        C6  per-sheet TC IDs duplicated OR out of canonical order     → FAIL (LR-ENC-004 V3 — rows must read in ascending TC-ID order; renumbering is forbidden because IDs are spec keys, so the EMITTER sorts and C6 re-asserts it)
 *        C7  garbled output — empty/dangling parens, a separator stranded before
 *            ')', "(->)", an ATTRIBUTED HTML tag (`<span class="…">`; bare `<div>`
 *            test-input is allowed), or a cell truncated to a trailing backtick
 *            → FAIL (LR-ENC-004 V3 closure — the leftovers humanize.ts strips at
 *            source; this is the fail-green backstop. See the CORRUPTION array.)
 *
 * The SUMMARY footer row of every sheet is exempt (it carries roll-up metrics, not TC data).
 * The Overview banner (title rows 1-2) is scanned for vocab; its metric rows are exempt.
 */
import XLSX from 'xlsx';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * ID-grammar registry loader (export_test_cases/module-codes.json) — single
 * source of truth for module/submodule codes and sheet ownership. Shared by C8
 * below and any gate that needs code semantics. Shape-asserted: a malformed
 * registry fails every gate loudly. (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION 2026-06-11)
 */
export function loadModuleRegistry() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const reg = JSON.parse(
    readFileSync(path.join(here, '..', 'export_test_cases', 'module-codes.json'), 'utf8').replace(/^﻿/, '')
  );
  if (!reg?.modules?.LOC?.name || !reg?.submodules?.LOC?.CUR?.sheet) {
    throw new Error('[xlsx-lint] module-codes.json failed shape assert — modules/submodules missing');
  }
  return reg;
}

/**
 * Client-facing columns scanned for banned vocabulary. Kept in lockstep with
 * MODULE_SHEET_HEADERS in export_test_cases/to-xlsx.ts.
 *
 * Merged TestRail step-expanded schema (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT,
 * 2026-06-11): 'Steps' + 'Expected Result' are the CANONICAL keys — readWorkbookRows
 * maps the load-bearing 'Steps (Step)' / 'Steps (Expected Result)' aliases onto them,
 * so listing the canonical names here scans every step cell EXACTLY ONCE (listing the
 * alias names too would double-count). Retired in the merge (LR-050 dead keys): the
 * separate 'Notes', 'Automation Execution', 'If Failed Reason of Failure' columns
 * (folded into 'Notes / Reason' + renamed 'Automation Status') and 'Automation Type'
 * (the retired _testrail.xlsx twin's column).
 */
export const CHECKED_COLS = [
  'TC ID', 'Title', 'Module', 'Submodule',
  'Test Data', 'Type', 'Priority',
  'Coverage Status', 'Automation Status',
  'Preconditions', 'Steps', 'Expected Result',
  'Notes / Reason', // reason-only, last column (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER)
];

/**
 * Step-expanded → canonical header aliases (normalized in readWorkbookRows). The
 * merged single workbook keeps canonical 'TC ID' / 'Submodule' headers, so the former
 * 'ID' / 'Sub-Module' TestRail aliases are retired (LR-050). The 'Steps (*)' aliases
 * are now LOAD-BEARING — the only path the step columns reach the canonical keys.
 */
export const HEADER_ALIASES = {
  'Steps (Step)': 'Steps',
  'Steps (Expected Result)': 'Expected Result',
};

/**
 * Allowed enum values per status column (SUMMARY row exempt). '' = legitimately blank.
 * The '' member is ALSO the continuation-row contract (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT):
 * step-expanded continuation rows carry blank status cells, and integrity checks C1–C5
 * tolerate them only because both enums contain '' — by design, NOT slop. EXECUTION_ENUM
 * now governs the 'Automation Status' column (renamed from 'Automation Execution' in the merge).
 */
export const COVERAGE_ENUM = new Set(['Automated', 'Pending Automation', 'Manual', '']);
export const EXECUTION_ENUM = new Set(['Pass', 'Fail', 'Skipped', 'Blocked', '']);

/**
 * Notes / Reason segment extraction (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER). The
 * 'Notes / Reason' column is now reason-ONLY — the whole cell IS the curated reason
 * (optionally marked "Blocked — "); tc.notes is no longer appended, so there is no
 * "\n\nNotes: " tail to slice off. C1/C3/C4/C5 act on the reason segment, so they read
 * it here. The marker MUST stay byte-identical to composeReason() in
 * export_test_cases/to-xlsx.ts (BLOCKED_MARKER_RE) — any drift silently defeats the
 * integrity checks. The {reasonPart, hasBlocked, blockedReason} shape is preserved
 * (C1/C3/C4/C5 + the continuation-row test consume it).
 */
export const BLOCKED_MARKER_RE = /^Blocked\s*[—–-]\s*/i;
export function splitNotesReason(cell) {
  const reasonPart = String(cell ?? '').trim();
  const hasBlocked = BLOCKED_MARKER_RE.test(reasonPart);
  // Reason text with the "Blocked — " marker stripped, for C5's client-sentence word-count
  // (which must EXCLUDE the marker so "Blocked" + "—" do not pad a 2-word internal label to 4).
  const blockedReason = hasBlocked ? reasonPart.replace(BLOCKED_MARKER_RE, '').trim() : '';
  return { reasonPart, hasBlocked, blockedReason };
}

/**
 * Grandfathered terse reasons (C5 exemptions, 2026-06-05). These 8 Local Information
 * rows ship with a short internal-shorthand reason because NO blocking cause is
 * documented in the MD source (all marked `Automatable: Yes`, no app-bug) and the
 * owner chose to leave them as-is rather than fabricate a reason (NEVER-ASSUME). C5
 * still fails on any FUTURE terse reason for any other TC.
 */
export const TERSE_REASON_ALLOWLIST = new Set([
  'TC-LOC-LI-008', 'TC-LOC-LI-008A', 'TC-LOC-LI-018', 'TC-LOC-LI-028',
  'TC-LOC-LI-033', 'TC-LOC-LI-036', 'TC-LOC-LI-040', 'TC-LOC-LI-066',
]);

/**
 * Canonical TC-ID comparator (LR-ENC-004 V3). Numeric-aware natural order so
 * `024` < `024A` < `025`, the `NE-*` sub-series groups after the plain numeric
 * block, and the non-numeric `SKIP-BILLING` sorts last. `export_test_cases/to-xlsx.ts`
 * sorts emitted rows with the identical one-line expression; C6 (below) re-asserts the
 * emitted order equals this, so any divergence between the twin and this canonical
 * comparator fails the build/commit/ship gate.
 */
export function compareTcId(a, b) {
  return String(a).localeCompare(String(b), 'en', { numeric: true });
}

/**
 * Banned-vocabulary deny-list. Each entry { name, re }. Tightly scoped so it fires on
 * genuine internal/slang/framework/speculation leaks ONLY — NOT on legitimate UI-role
 * nouns (checkbox/dialog/dropdown/field) which are normal client test vocabulary.
 *
 * The professional rewrite "pending an application fix" / "a known application issue"
 * is intentionally ALLOWED — only the informal forms ("Pending Encore fix",
 * "Encore-reported", "app bug") are banned.
 */
export const BANNED = [
  // ── framework / tooling identifiers (carried over from the original token lint) ──
  { name: 'Angular bare', re: /\bAngular\b/i },
  { name: 'Playwright bare', re: /\bPlaywright\b/i },
  { name: 'data-testid', re: /data-testid/i },
  { name: '.page.ts ref', re: /\.page\.ts/i },
  { name: '.spec.ts ref', re: /\.spec\.ts/i },
  { name: 'getByTestId', re: /getByTestId/ },
  { name: 'test.fixme', re: /\btest\.fixme\b/i },
  { name: 'FormControl', re: /\bFormControl\b/ },
  { name: 'MCP-N verified', re: /MCP-?[0-9]*\s+verified/i },
  { name: 'MCP_VERIFICATION_LOG', re: /MCP_VERIFICATION_LOG/ },
  { name: 'verificationLog', re: /\bverificationLog\b/i },
  { name: 'error-context', re: /\berror-context\b/i },
  { name: 'reports/bugs path', re: /reports\/bugs/i },
  { name: 'field-case-runner', re: /\bfield-case-runner\b/i },
  // ── bug / ticket identifiers ──
  { name: 'BUG-XXX-NNN id', re: /\bBUG-[A-Z]{2,}-?[A-Z]*-?\d+/ },
  { name: 'FIXME(BUG) wrapper', re: /\bFIXME\s*\(/i },
  { name: 'NM-NNN ticket', re: /\bNM-\d{2,5}\b/ },
  // ── spec-helper method names ──
  { name: 'spec helper expectAfter*', re: /\bexpectAfter[A-Z]/ },
  { name: 'spec helper expectBefore*', re: /\bexpectBefore[A-Z]/ },
  { name: 'spec helper ensureEmpty*', re: /\bensureEmpty[A-Z]/ },
  { name: 'spec helper saveAndConfirm', re: /\bsaveAndConfirm\b/ },
  { name: 'spec helper saveAndVerifyCase', re: /\bsaveAndVerifyCase\b/ },
  { name: 'spec helper reloadAndNavigate*', re: /\breloadAndNavigate/ },
  { name: 'spec helper waitForSave*', re: /\bwaitForSave[A-Z]/ },
  { name: 'spec helper clickAdd', re: /\bclickAdd\(/ },
  { name: 'lowercase camelCase fn', re: /\b[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]+\([^)]*\)/ },
  // ── DOM / backend internals ──
  { name: 'DOM textarea.value', re: /textarea\.value/ },
  { name: 'DOM form.pristine', re: /\bform\.pristine/ },
  { name: 'dirty-state/flag', re: /\bdirty[- ]?(state|flag)\b/i },
  { name: 'backend ERR_/BILLING_', re: /(ERR_(LEFT|LEGAL)|BILLING_)/ },
  { name: 'backend hideRemitTax', re: /\bhideRemitTax\b/ },
  { name: 'backend CheckDiscount', re: /\bCheckDiscount\b/ },
  { name: 'backend updateControlStatus', re: /\bupdateControlStatus\b/ },
  { name: 'backend ADD_LOCATION.', re: /ADD_LOCATION\./ },
  { name: 'ARIA combobox role', re: /\bcombobox\b/i },
  { name: 'ARIA spinbutton role', re: /\bspinbutton\b/i },
  // ── ARIA container roles + raw a11y markup + Radix component-lib + internal tags
  //    + test-env hostname (LR-ENC-004 V2, 2026-06-05 — the classes the token lint
  //    missed in the first cleanup; humanize.ts strips them at source, these are the
  //    fail-green backstop). ──
  { name: 'ARIA tabpanel role', re: /\btabpanel\b/i },
  { name: 'ARIA alertdialog role', re: /\balertdialog\b/i },
  { name: 'ARIA listbox role', re: /\blistbox\b/i },
  { name: 'Radix component lib', re: /\bRadix\b/i },
  { name: 'ARIA attribute', re: /\baria-[a-z]+/i },
  { name: 'role= attribute', re: /\brole\s*=\s*"/i },
  { name: 'internal [FIXME] tag', re: /\[FIXME\b[^\]]*\]/i },
  { name: 'internal (FCC) tag', re: /\(FCC\)/ },
  // Leading internal status tag ("DROPPED — …", "WIP: …") at the START of a cell.
  // Anchored to cell-start + a separator so a legit mid-sentence word ("dropped
  // frames", "deferred to NTS-038") is never flagged (LR-ENC-004 V3, 2026-06-05).
  { name: 'leading internal status tag', re: /^\s*(?:DROPPED|NOT-AUTOMATABLE|DEFERRED|WIP|TODO)\s*[-–—:]/i },
  { name: 'test-env hostname', re: /\b(?:cloudapps-e2e|encoreglobal\.com)\b/i },
  // ── HTTP / API internals ──
  { name: 'API NNN status', re: /\bAPI\s+\d{3}\b/i },
  { name: 'NNN Internal Server Error', re: /\b\d{3}\s+Internal Server Error\b/i },
  { name: 'HTTP verb + endpoint', re: /\b(POST|GET|PUT|DELETE|PATCH)\s+[a-z][\w/-]+/ },
  // ── informal / slang ──
  { name: 'app bug', re: /\bapp bug\b/i },
  { name: 'flake/flaky', re: /\bflak(e|es|y|iness)\b/i },
  { name: 'vanish', re: /\bvanish(es|ed|ing)?\b/i },
  { name: 'no-op', re: /\bno-?ops?\b/i },
  { name: 'dead-Delete', re: /\bdead[- ]?Delete\b/i },
  { name: 'spins forever/until', re: /\bspin(s|ning)?\s+(forever|until|\d)/i },
  { name: 'envelope (jargon)', re: /\benvelope\b/i },
  { name: 'compounds the flake', re: /\bcompounds?\b/i },
  { name: 'net-zero (jargon)', re: /\bnet-zero\b/i },
  { name: 'Pending Encore fix', re: /\bPending Encore fix\b/i },
  { name: 'Encore-reported', re: /\bEncore-reported\b/i },
  { name: 'Re-skipped', re: /\bre-?skipped\b/i },
  // Narrow to the internal "SKIP RCA" marker — a bare \bSKIP\b false-positives on
  // legitimate feature/TC-ID names like "Skip Billing" / TC-LOC-LI-SKIP-BILLING.
  { name: 'SKIP RCA', re: /\bSKIP\s+RCA\b/i },
  // ── speculation / internal-process ──
  { name: 'hypothesis', re: /\bhypothes(is|es|ize)\b/i },
  { name: 'unverified', re: /\bunverified\b/i },
  { name: 'RCA marker', re: /\bRCA\b/ },
  { name: 'CORRECTION', re: /\bCORRECTION\b/ },
  { name: 'Requirements discrepancy', re: /\bRequirements? discrepanc(y|ies)\b/i },
  { name: 'DEFERRED(', re: /\bDEFERRED\s*\(/ },
  { name: 'Tier-N', re: /\bTier-?\d\b/i },
  // ── bare ISO date (volatile / internal authoring stamp) ──
  { name: 'bare YYYY-MM-DD', re: /\b202[0-9]-\d{2}-\d{2}\b/ },
  // ── authoring-residue (LR-ENC-004 V3, 2026-06-05 — closure-audit D2; the token
  //    lint was blind to these so 34 Corporate Pricing rows shipped DOCX/helper-id/
  //    assumption/section/mangled-endpoint residue. humanize.ts scrubs at source;
  //    these are the fail-green backstop. Blast-radius scan confirmed each token is
  //    CPR-only across the workbook, so adding them breaks no other module's rows). ──
  { name: 'DOCX source ref', re: /\bDOCX\b/i },
  { name: 'helper TC-ENC id', re: /\bTC-ENC[A-Z0-9-]*/i },
  { name: 'authoring [ASSUMPTION] tag', re: /\[ASSUMPTION/i },
  { name: 'section symbol ref', re: /§/ },
  { name: 'mangled endpoint navigatorthe', re: /navigatorthe/i },
  { name: 'helpers reference', re: /\bhelpers?\s+TC-/i },
  // ── additional jargon classes (LR-ENC-004 V3 closure follow-up, 2026-06-05).
  //    Confirmed 0 occurrences across all 16 sheets at add-time (humanize.ts scrubs
  //    each at source); fail-green backstop so a regression cannot ship. ──
  { name: 'Doctrine ref', re: /\bDoctrine\b/i },
  { name: 'FCC phase tag', re: /\bFCC[ -]?P\d/i },
  { name: 'encore-questions ref', re: /encore-questions/i },
  { name: 'walk-evidence ref', re: /\bwalk-evidence\b/i },
  { name: 'clarification question id', re: /\b[A-Z]{2,}-[A-Z]+-Q\d+\b/ },
  { name: 'pricing/strategies endpoint', re: /\/pricing\/strategies/i },
  { name: 'navigator api path', re: /\/navigator\/api\b/i },
  { name: 'query param leak', re: /\b(?:isActive|isInternal|isLabor|pageNumber|pageSize|pricebookName)=/i },
  { name: 'full GUID', re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i },
  { name: 'pw pressSequentially', re: /\bpressSequentially\b/ },
  { name: 'pw check/uncheck call', re: /\.(?:un)?check\(\)/ },
  { name: 'spec helper ensureDefaultState', re: /\bensureDefaultState\b/ },
  { name: 'test fixture var', re: /\b(?:detail|strategy)Fixture\b/ },
  { name: 'automation driver call', re: /\bautomation\.[a-z]/i },
  { name: 'form-dirty jargon', re: /\bform-dirty\b/i },
  // ── Wave-1.5 closure follow-up (W15-99 defect B1, 2026-06-09). The token class the
  //    deny-list was SHAPE-BLIND to: the 'clarification question id' rule above
  //    (/\b[A-Z]{2,}-[A-Z]+-Q\d+\b/) structurally cannot match `Q-WV15-1` (the `Q`
  //    leads, there is no `-Q\d` tail) nor `CPR-WV15-Q3` (the digits inside `WV15`
  //    break the `[A-Z]+` run); and there was no entry for the LR-036 render-format
  //    debugging jargon. These shipped in the corporate_pricing_override sheet until
  //    scrubbed this session. Confirmed 0 occurrences across all sheets after the
  //    scrub — fail-green backstop so this class cannot regress. ──
  { name: 'wave clarification id (Q-WVnn-n)', re: /\bQ-WV\d+-\d+/i },
  { name: 'wave clarification id (PFX-WVnn-Qn)', re: /\b[A-Z]{2,}-WV\d+-Q\d+/i },
  { name: 'render-format lucide-check', re: /\blucide-check\b/i },
  { name: 'render-format Glyphicon', re: /\bGlyphicon\b/i },
  { name: 'Nth render format jargon', re: /\b\d+(?:st|nd|rd|th)\s+render\s+format\b/i },
  { name: 'recon (provenance jargon)', re: /\brecon\b/i },
  { name: 'framework rule-id (LR-NNN)', re: /\bLR-(?:ENC-)?\d{3}\b/i },
  // ── migration-context leak (task follow-up to PLAN_EXCEL_REVERT_RECOVERY, 2026-06-10).
  //    "new site" / "old site" / nav2 hostnames reveal the old-vs-new-site migration to
  //    the client. 6 Local Information cells were reworded to the neutral "the live site"
  //    phrasing this session; confirmed 0 occurrences across all sheets at add-time —
  //    fail-green backstop so the class cannot regress. ("on-site" / "Navigator" stay
  //    legal: the word-boundary regexes match only the hyphen/space compound forms.) ──
  { name: 'migration-context new site', re: /\bnew[ -]site\b/i },
  { name: 'migration-context old site', re: /\bold[ -]site\b/i },
  { name: 'migration-context nav2 host', re: /\bnav2\b|navigator2/i },
  // ── deny-list shape-gap closure (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER §2.8,
  //    2026-06-11). Belt-and-suspenders for any future HAND-WRITTEN curated reason:
  //    dropping tc.notes already removed the leak VECTOR, but these whole-class tokens
  //    (agent-mistakes 2026-06-09 B1: the deny-list was shape-blind to them) had slipped
  //    past before. Confirmed 0 occurrences across all sheets of the rebuilt workbook at
  //    add-time — fail-green backstop so the class cannot regress. ──
  { name: 'MCP ref', re: /\bMCP\s+ref\b/i },
  { name: 'per source code', re: /\bper\s+source\s+code\b/i },
  { name: 'Jira tool ref', re: /\bJira\b/i },
  // ── coverage-depth taxonomy leak (audit 2026-06-25 — QUICK/DEEP/(DEEP/FLAG) shipped
  //    to the NM-2260 corporate_pricing_search Titles; the deny-list was shape-blind to
  //    this class so xlsx:lint false-greened a leaking workbook). These are the internal
  //    L1/L2/L3 depth labels from CASE_GENERATION_STANDARD — they belong ONLY on the
  //    `**Surface_Family**:` line (which is not an emitted column), NEVER in a shipped
  //    cell. The parenthesized form is the exact leak signature so prose like "deep link"
  //    / "quick filter" is never a false match. humanize.ts strips them at source; these
  //    are the fail-green backstop (ALL/ARCH logged this session). ──
  { name: 'coverage depth marker (QUICK/DEEP)', re: /\((?:QUICK|DEEP)\b[^)]*\)/i },
  { name: 'SBC depth token', re: /\bSBC\b/ },
  { name: 'Surface_Family label', re: /Surface[_ ]Family/i },
  { name: 'internal FLAG marker', re: /\bDEEP\/FLAG\b|\(\s*FLAG\s*\)/i },
  // ── Tier-2: internal test-method jargon (reworded to plain English at source by
  //    humanize.ts; this is the regression backstop). A reviewer reads behavior, not how
  //    we automate it. Confirmed 0 occurrences across all sheets only AFTER the rebuild;
  //    pre-rebuild these correctly FAIL on the corporate-pricing cells. ──
  { name: 'content-anchored method', re: /content[- ]anchored/i },
  { name: 'positive-control method', re: /positive[- ]control/i },
  { name: 'nth(N) selector', re: /\bnth\(/i },
  // ── Selector / automation-internal leaks (audit 2026-06-25 round 2 — confirmed code
  //    tokens a reviewer must never see; humanize.ts rewrites them at source, these are the
  //    fail-green backstop). Each scoped tight enough to never hit legitimate UI vocab
  //    ("Currency Selector" control name, "anchor row" prose) — only literal code shapes. ──
  { name: 'css/pw :has-text selector', re: /:has-text\(/i },
  { name: 'querySelector/locator call', re: /querySelector|\.locator\(/i },
  { name: 'DOM innerHTML/textContent', re: /\binnerHTML\b|\btextContent\b/ },
  { name: 'xpath selector', re: /\bxpath\b|\/\/[a-z]+\[@/i },
  { name: 'hardcoded (automation)', re: /\bhard[- ]?cod(?:e|ed|ing)\b/i },
  { name: 'row-index (positional)', re: /\brow[- ]index\b/i },
  { name: 'in the DOM (automation)', re: /\bin the DOM\b/i },
  { name: 'spec-helper call on index', re: /\b(?:row|value|note|cell)\(\s*\d/i },
  { name: 'JS .repeat() call', re: /\.repeat\(\s*\d/i },
];

/**
 * Output-corruption patterns (C7) — garbled cells the vocab denylist cannot see.
 * They arise when humanize.ts strips an internal token and leaves debris, or when a
 * checkmark is misread as the action↔expected separator (which truncated a step).
 * humanize.ts now prevents each at source; this is the fail-green backstop
 * (LR-ENC-004 V3, 2026-06-05). NOTE: a BARE `<div>` (no attributes) is legitimate
 * test-input content (e.g. "type <div> to verify HTML handling"), so the HTML rule
 * fires only on ATTRIBUTED tags (`<span class="…">`).
 */
export const CORRUPTION = [
  { name: 'empty/dangling paren', re: /\(\s*[-–—;,:/+]*\s*\)/ },
  { name: 'trailing separator before close-paren', re: /[ \t][-–—;,:/]\s*\)/ },
  { name: 'arrow-in-parens', re: /\(\s*->\s*\)/ },
  { name: 'attributed HTML tag', re: /<[a-z][a-z0-9]*\s+[a-z][a-z-]*\s*=\s*["']/i },
  { name: 'truncated trailing backtick', re: /`[ \t]*$/m },
];

/**
 * Read every data row from the workbook, tagged with its sheet.
 * Skips the Overview sheet. Throws if the workbook is missing.
 */
export function readWorkbookRows(xlsxPath) {
  if (!existsSync(xlsxPath)) {
    throw new Error(`[xlsx-lint] workbook not found: ${xlsxPath} (run "npm run xlsx:build" first)`);
  }
  const wb = XLSX.readFile(xlsxPath);
  const rows = [];
  for (const sheetName of wb.SheetNames) {
    if (sheetName === 'Overview') continue;
    const sheetRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
    // ownerTcId carry-forward (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT): step-expanded
    // continuation rows have a blank TC ID. Track the last non-blank TC ID per sheet so a
    // vocab/C7 hit on a continuation row reports an actionable owning TC, not tcId=''.
    let ownerTcId = '';
    for (const r of sheetRows) {
      // Normalize step-expanded headers onto canonical keys so every check
      // (vocab, C6 id-order, C7 corruption, C8 congruence) sees the cells.
      for (const [alias, canonical] of Object.entries(HEADER_ALIASES)) {
        if (alias in r && !(canonical in r)) r[canonical] = r[alias];
      }
      const rid = String(r['TC ID'] ?? r['Test ID'] ?? '').trim();
      if (rid && rid !== 'SUMMARY') ownerTcId = rid;
      rows.push({ sheet: sheetName, ownerTcId, ...r });
    }
  }
  return rows;
}

/**
 * Lint a workbook. Returns:
 *   { ok, rowsScanned, vocabHits[], integrityViolations[], warnings[] }
 * ok === true  ⇔  zero vocab hits AND zero integrity violations (warnings do not fail).
 */
export function lintWorkbook(xlsxPath) {
  const allRows = readWorkbookRows(xlsxPath);
  const vocabHits = [];
  const integrityViolations = [];
  const warnings = [];

  // C9c curated-reason registry (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER §2.7). The
  // set of TC IDs that legitimately carry a curated reason on a non-fail/skip/blocked
  // row (e.g. the ~21 "Not yet automated …" / "Kept as a manual check …" reasons in
  // export_test_cases/blocked-reasons.json). FAIL-OPEN: null ⇒ registry unavailable
  // (the shipped --target archive extract has no export_test_cases/) ⇒ C9c is skipped,
  // never false-failing a ship. C9a/C9b are workbook-only and always hold.
  let curatedReasonIds = null;
  try {
    const brPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'export_test_cases', 'blocked-reasons.json');
    if (existsSync(brPath)) {
      const br = JSON.parse(readFileSync(brPath, 'utf8').replace(/^﻿/, ''));
      curatedReasonIds = new Set(
        Object.entries(br)
          .filter(([k, v]) => k.startsWith('TC-') && v && String(v.reason || '').trim() !== '')
          .map(([k]) => k)
      );
    }
  } catch { curatedReasonIds = null; } // unreadable ⇒ degrade to C9a/C9b only (never false-fail a ship)

  // Overview banner scan (LR-ENC-004 V2): readWorkbookRows skips the Overview sheet,
  // so scan its client-facing title rows (1-2) explicitly for internal vocab such as
  // "(mode: list-only)". The bare-date rule is excluded here — the banner legitimately
  // carries a generation timestamp; the metric rows (3+) are exempt entirely.
  const ovWb = XLSX.readFile(xlsxPath);
  const ovSheet = ovWb.Sheets['Overview'];
  if (ovSheet) {
    const ovRows = XLSX.utils.sheet_to_json(ovSheet, { header: 1, defval: '' });
    for (let i = 0; i < Math.min(2, ovRows.length); i++) {
      const cell = String((ovRows[i] && ovRows[i][0]) || '');
      if (!cell) continue;
      for (const b of BANNED) {
        if (b.name === 'bare YYYY-MM-DD') continue; // generation timestamp is legit in the banner
        const m = cell.match(b.re);
        if (m) vocabHits.push({
          sheet: 'Overview', tcId: `(banner ${i + 1})`, col: 'title',
          pattern: b.name, match: m[0], sample: cell.length > 130 ? cell.slice(0, 130) + '…' : cell,
        });
      }
    }
  }

  for (const r of allRows) {
    const tcId = String(r['TC ID'] || r['Test ID'] || '');
    if (tcId === 'SUMMARY') continue; // roll-up footer row — exempt
    // Attribute hits to the owning TC: continuation rows have a blank TC ID, so fall
    // back to the carried-forward ownerTcId (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT).
    const hitTcId = tcId || r.ownerTcId || '';

    // ── vocab scan (runs on ALL rows incl. continuation step-rows — step text is
    //    client-visible and MUST stay scanned) ──
    for (const col of CHECKED_COLS) {
      const v = String(r[col] ?? '');
      if (!v) continue;
      for (const b of BANNED) {
        const m = v.match(b.re);
        if (m) {
          vocabHits.push({
            sheet: r.sheet, tcId: hitTcId, col, pattern: b.name, match: m[0],
            sample: v.length > 130 ? v.slice(0, 130) + '…' : v,
          });
        }
      }
    }

    // ── corruption scan (C7) — garbled output the vocab denylist can't see:
    //    empty/dangling parens, arrow-in-parens, attributed HTML, a cell truncated
    //    to a trailing backtick. humanize.ts prevents each at source (LR-ENC-004 V3,
    //    2026-06-05); this is the fail-green backstop. Runs on continuation rows too. ──
    for (const col of CHECKED_COLS) {
      const v = String(r[col] ?? '');
      if (!v) continue;
      for (const c of CORRUPTION) {
        const m = v.match(c.re);
        if (m) integrityViolations.push({
          code: 'C7', sheet: r.sheet, tcId: hitTcId,
          detail: `${c.name} in ${col}: "${m[0].trim()}" :: ${v.length > 80 ? v.slice(0, 80) + '…' : v}`,
        });
      }
    }

    // ── fused-step + unbalanced-paren scan (C7 extension, 2026-06-29). Backstops the
    //    two exporter-corruption classes root-fixed this date: (1) humanize.ts collapsed
    //    a `space+\n` left by a stripped trailing `(per …)` note into one space, fusing
    //    two numbered steps onto one cell (LI-003/004/078); (2) testrail-format.ts split
    //    a `; ` INSIDE a balanced parenthetical, leaving a dangling "(" / ")" half
    //    (SRC-008 / ECT-013 / LI-111). Both fail the build if they ever regress. ──
    const stepV = String(r['Steps'] ?? '');
    const lead = stepV.match(/^\s*(\d+)\.\s/);
    if (lead) {
      const next = parseInt(lead[1], 10) + 1;
      // A clean atomic step cell carries ONE leading "N." and no later sequential
      // "(N+1)." boundary. The `\s` before guards against a value like "20." (where
      // the digit run is preceded by another digit, not whitespace).
      if (new RegExp(`(?:^|\\s)${next}\\.\\s`).test(stepV.slice(lead[0].length))) {
        integrityViolations.push({
          code: 'C7', sheet: r.sheet, tcId: hitTcId,
          detail: `fused steps in Steps: step ${lead[1]} runs into step ${next}: "${stepV.length > 80 ? stepV.slice(0, 80) + '…' : stepV}"`,
        });
      }
    }
    for (const pcol of ['Title', 'Steps', 'Expected Result', 'Preconditions']) {
      const v = String(r[pcol] ?? '');
      if (!v) continue;
      let depth = 0, unbalanced = false;
      for (let k = 0; k < v.length; k++) {
        const ch = v[k];
        if (ch === '(') depth++;
        else if (ch === ')') { if (depth === 0) { unbalanced = true; break; } depth--; }
      }
      if (unbalanced || depth !== 0) {
        integrityViolations.push({
          code: 'C7', sheet: r.sheet, tcId: hitTcId,
          detail: `unbalanced parentheses in ${pcol}: "${v.length > 80 ? v.slice(0, 80) + '…' : v}"`,
        });
      }
    }

    // ── integrity scan (Automation Status = execution axis; the reason-only
    //    'Notes / Reason' cell is the curated reason, optionally "Blocked — " marked) ──
    const cov = String(r['Coverage Status'] ?? '').trim();
    const exec = String(r['Automation Status'] ?? '').trim();
    const nr = String(r['Notes / Reason'] ?? '').trim();
    const { hasBlocked, blockedReason } = splitNotesReason(r['Notes / Reason']);

    // C1 — Pass row carrying a "Blocked — " reason segment (upstream join bug). The
    // broader "any populated Pass cell" case is caught by C9a below; C1 stays the
    // narrow marked-segment signal that pinpoints a join bug specifically.
    if (exec === 'Pass' && hasBlocked) {
      integrityViolations.push({
        code: 'C1', sheet: r.sheet, tcId: hitTcId,
        detail: `Automation Status='Pass' but Notes / Reason carries a "Blocked — " segment: "${blockedReason.slice(0, 80)}…"`,
      });
    }
    // C2 — status enum
    if (!COVERAGE_ENUM.has(cov)) {
      integrityViolations.push({ code: 'C2', sheet: r.sheet, tcId: hitTcId, detail: `Coverage Status not in enum: "${cov}"` });
    }
    if (!EXECUTION_ENUM.has(exec)) {
      integrityViolations.push({ code: 'C2', sheet: r.sheet, tcId: hitTcId, detail: `Automation Status not in enum: "${exec}"` });
    }
    // C4 — Manual must have a blank Automation Status AND no "Blocked — " reason
    // segment. (A Manual row may legitimately carry a curated plain reason, e.g.
    // "Kept as a manual check …" — that is allowed; only a status or a "Blocked — "
    // marker trips C4.)
    if (cov === 'Manual' && (exec !== '' || hasBlocked)) {
      integrityViolations.push({
        code: 'C4', sheet: r.sheet, tcId: hitTcId,
        detail: `Coverage Status='Manual' must have blank Automation Status and no "Blocked — " reason (got status="${exec}", blockedReason="${blockedReason.slice(0, 60)}")`,
      });
    }
    // C5 — the "Blocked — " reason segment must read as a client sentence, not an
    // internal label. Word count EXCLUDES the marker (per §Notes/Reason merge), so a
    // 2-word label ("Oracle required") still fails the >=4-word rule. Non-blocked
    // reasons (Skipped/Pending keep their own status word) and plain Notes are not
    // checked. Allowlisted rows (no documented cause, ship as-is per owner) are exempt.
    if (hasBlocked && !TERSE_REASON_ALLOWLIST.has(hitTcId)
        && blockedReason.split(/\s+/).filter(Boolean).length < 4) {
      integrityViolations.push({
        code: 'C5', sheet: r.sheet, tcId: hitTcId,
        detail: `Blocked reason reads as an internal label, not a client sentence: "${blockedReason}"`,
      });
    }
    // C3 (warn) — Blocked execution but no "Blocked — " reason segment (Rutvik wants
    // app-bug reasons kept visible).
    if (exec === 'Blocked' && !hasBlocked) {
      warnings.push({ code: 'C3', sheet: r.sheet, tcId: hitTcId, detail: `Blocked but no reason text` });
    }

    // ── C9 — Notes / Reason anti-pollution gate (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER
    //    §2.7; the permanent lock). The column is the curated execution-reason channel
    //    ONLY; cleanup/commentary must never ship. Fires on first-rows (TC ID present);
    //    continuation rows have a blank TC ID and a blank Notes / Reason by construction.
    //    C9a + C9b are workbook-only (zero external-file dependency) so they hold at ship
    //    --target where the archive extract has no export_test_cases/; C9c is conditional
    //    on the curated-reason registry (fail-open → skipped when the registry is absent). ──
    if (tcId) {
      // C9a — a clean automated pass has nothing to explain → cell must be empty.
      if (exec === 'Pass' && nr) {
        integrityViolations.push({ code: 'C9', sheet: r.sheet, tcId: hitTcId,
          detail: `Notes / Reason populated on a Pass row — a clean pass needs no note (cleanup/commentary must not ship): "${nr.slice(0, 80)}"` });
      }
      // C9b — cleanup breadcrumbs are test-maintenance, never client content.
      if (/^Cleanup after test\b/i.test(nr)) {
        integrityViolations.push({ code: 'C9', sheet: r.sheet, tcId: hitTcId,
          detail: `Notes / Reason carries a "Cleanup after test…" breadcrumb — must not ship: "${nr.slice(0, 80)}"` });
      }
      // C9c (CONDITIONAL — only when blocked-reasons.json is present; silently skipped in
      // the shipped extract). A blank-execution row may carry a reason ONLY if it is a
      // curated reason in blocked-reasons.json. Any other populated blank-exec cell is
      // commentary that slipped in.
      if (curatedReasonIds && exec === '' && nr && !curatedReasonIds.has(hitTcId)) {
        integrityViolations.push({ code: 'C9', sheet: r.sheet, tcId: hitTcId,
          detail: `Notes / Reason populated on a non-fail/skip/blocked row with no curated reason in blocked-reasons.json — commentary leak: "${nr.slice(0, 80)}"` });
      }
    }
  }

  // C6 — per-sheet TC IDs must be UNIQUE and in canonical (compareTcId) order
  // (LR-ENC-004 V3). Catches duplicate IDs (previously unguarded by parity, which is
  // set-based) and any future un-sorted emit / removed sort in to-xlsx.ts. The SUMMARY
  // footer + blank rows are skipped. One out-of-order report per sheet is enough signal.
  const idsBySheet = new Map();
  for (const r of allRows) {
    const id = String(r['TC ID'] || r['Test ID'] || '');
    if (id === '' || id === 'SUMMARY') continue;
    if (!idsBySheet.has(r.sheet)) idsBySheet.set(r.sheet, []);
    idsBySheet.get(r.sheet).push(id);
  }
  for (const [sheet, ids] of idsBySheet) {
    const seen = new Set();
    for (const id of ids) {
      if (seen.has(id)) {
        integrityViolations.push({ code: 'C6', sheet, tcId: id, detail: `duplicate TC ID within sheet` });
      }
      seen.add(id);
    }
    const sorted = [...ids].sort(compareTcId);
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] !== sorted[i]) {
        integrityViolations.push({
          code: 'C6', sheet, tcId: ids[i],
          detail: `TC IDs out of order at row ${i + 1}: found "${ids[i]}", expected "${sorted[i]}" (rows must be sorted by TC ID)`,
        });
        break;
      }
    }
  }

  // C8 — registry congruence (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION 2026-06-11):
  // every data row's Module/Submodule cells must equal the registry values for
  // its sheet, and the row's TC-ID module+submodule codes must match the sheet's
  // registered owner. This is the semantic check whose absence let 150 corporate
  // pricing rows ship Module="locations". One violation per sheet×kind is enough signal.
  {
    const registry = loadModuleRegistry();
    const sheetOwner = new Map();
    for (const [mod, subs] of Object.entries(registry.submodules)) {
      for (const [sub, e] of Object.entries(subs)) sheetOwner.set(e.sheet, { mod, sub, name: e.name, moduleName: registry.modules[mod].name });
    }
    // Strict mode (unregistered sheet = FAIL) applies to the canonical deliverable;
    // other workbooks (TestRail format — display sheet names) get C8 only on
    // registry-registered sheets, while vocab/C6/C7 cover them via HEADER_ALIASES.
    const strictC8 = path.basename(xlsxPath) === 'encore_test_cases.xlsx';
    const reported = new Set();
    const once = (key, v) => { if (!reported.has(key)) { reported.add(key); integrityViolations.push(v); } };
    for (const r of allRows) {
      const tcId = String(r['TC ID'] || '');
      if (!tcId.startsWith('TC-') || tcId === 'SUMMARY') continue;
      const owner = sheetOwner.get(r.sheet);
      if (!owner) { if (strictC8) once(`${r.sheet}:unreg`, { code: 'C8', sheet: r.sheet, tcId, detail: `sheet not registered to any submodule in module-codes.json` }); continue; }
      const modCell = String(r['Module'] ?? '');
      const subCell = String(r['Submodule'] ?? '');
      if (modCell !== owner.moduleName) once(`${r.sheet}:mod`, { code: 'C8', sheet: r.sheet, tcId, detail: `Module cell "${modCell}" ≠ registry "${owner.moduleName}"` });
      if (subCell !== owner.name) once(`${r.sheet}:sub`, { code: 'C8', sheet: r.sheet, tcId, detail: `Submodule cell "${subCell}" ≠ registry "${owner.name}"` });
      const idm = tcId.match(/^TC-([A-Z]+)-([A-Z]+)-/);
      if (idm && (idm[1] !== owner.mod || idm[2] !== owner.sub)) {
        once(`${r.sheet}:id:${tcId}`, { code: 'C8', sheet: r.sheet, tcId, detail: `ID codes ${idm[1]}/${idm[2]} ≠ sheet owner ${owner.mod}/${owner.sub}` });
      }
    }
  }

  return {
    ok: vocabHits.length === 0 && integrityViolations.length === 0,
    rowsScanned: allRows.length,
    vocabHits,
    integrityViolations,
    warnings,
  };
}

/** Human-readable report for CLI / build-fail output. */
export function formatReport(result) {
  const lines = [];
  lines.push(`[xlsx-lint] rows scanned: ${result.rowsScanned}`);
  lines.push(`[xlsx-lint] vocab hits: ${result.vocabHits.length}, integrity violations: ${result.integrityViolations.length}, warnings: ${result.warnings.length}`);

  if (result.vocabHits.length) {
    // group by pattern name
    const byPattern = {};
    for (const h of result.vocabHits) (byPattern[h.pattern] ??= []).push(h);
    const sorted = Object.entries(byPattern).sort((a, b) => b[1].length - a[1].length);
    lines.push('');
    lines.push('── VOCAB ──');
    for (const [name, list] of sorted) {
      lines.push(`--- ${name}: ${list.length} hit(s) ---`);
      for (const h of list.slice(0, 6)) {
        lines.push(`  [${h.sheet}/${h.tcId}/${h.col}] '${h.match}' :: ${h.sample}`);
      }
      if (list.length > 6) lines.push(`  ... +${list.length - 6} more`);
    }
  }

  if (result.integrityViolations.length) {
    lines.push('');
    lines.push('── INTEGRITY (FAIL) ──');
    for (const v of result.integrityViolations) {
      lines.push(`  [${v.code}] [${v.sheet}/${v.tcId}] ${v.detail}`);
    }
  }

  if (result.warnings.length) {
    lines.push('');
    lines.push('── WARNINGS (non-fatal) ──');
    for (const w of result.warnings.slice(0, 30)) {
      lines.push(`  [${w.code}] [${w.sheet}/${w.tcId}] ${w.detail}`);
    }
    if (result.warnings.length > 30) lines.push(`  ... +${result.warnings.length - 30} more`);
  }

  lines.push('');
  lines.push(result.ok
    ? '[xlsx-lint] PASS — workbook is clean of internal vocab and status/reason contradictions.'
    : `[xlsx-lint] FAIL — ${result.vocabHits.length} vocab hit(s) + ${result.integrityViolations.length} integrity violation(s).`);
  return lines.join('\n');
}
