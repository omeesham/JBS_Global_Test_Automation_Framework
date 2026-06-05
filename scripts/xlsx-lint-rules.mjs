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
 *   2. INTEGRITY — cross-column contradictions the token scan cannot see:
 *        C1  reason present  AND  Automation Execution == 'Pass'      → FAIL (join bug)
 *        C2  Coverage Status / Automation Execution outside the enum  → FAIL
 *        C3  Automation Execution == 'Blocked' AND reason empty       → WARN (kept-visible reason missing)
 *        C4  Coverage Status == 'Manual' AND (reason OR execution set) → FAIL (Manual must be blank)
 *        C5  reason present AND under 4 words (not allowlisted)        → FAIL (internal label, not a client sentence)
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
import { existsSync } from 'fs';

/**
 * Client-facing columns scanned for banned vocabulary.
 * 'Specific Field' + 'Tags' removed 2026-06-05 (LR-ENC-004 V2) — both columns were
 * dropped from the deliverable (100% empty across all cases). Kept in lockstep with
 * MODULE_SHEET_HEADERS in export_test_cases/to-xlsx.ts.
 */
export const CHECKED_COLS = [
  'TC ID', 'Title', 'Module', 'Submodule',
  'Preconditions', 'Steps', 'Expected Result', 'Notes',
  'Coverage Status', 'Automation Execution', 'If Failed Reason of Failure',
];

/** Allowed enum values per status column (SUMMARY row exempt). '' = legitimately blank. */
export const COVERAGE_ENUM = new Set(['Automated', 'Pending Automation', 'Manual', '']);
export const EXECUTION_ENUM = new Set(['Pass', 'Fail', 'Skipped', 'Blocked', '']);

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
    for (const r of sheetRows) rows.push({ sheet: sheetName, ...r });
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

    // ── vocab scan ──
    for (const col of CHECKED_COLS) {
      const v = String(r[col] ?? '');
      if (!v) continue;
      for (const b of BANNED) {
        const m = v.match(b.re);
        if (m) {
          vocabHits.push({
            sheet: r.sheet, tcId, col, pattern: b.name, match: m[0],
            sample: v.length > 130 ? v.slice(0, 130) + '…' : v,
          });
        }
      }
    }

    // ── corruption scan (C7) — garbled output the vocab denylist can't see:
    //    empty/dangling parens, arrow-in-parens, attributed HTML, a cell truncated
    //    to a trailing backtick. humanize.ts prevents each at source (LR-ENC-004 V3,
    //    2026-06-05); this is the fail-green backstop. ──
    for (const col of CHECKED_COLS) {
      const v = String(r[col] ?? '');
      if (!v) continue;
      for (const c of CORRUPTION) {
        const m = v.match(c.re);
        if (m) integrityViolations.push({
          code: 'C7', sheet: r.sheet, tcId,
          detail: `${c.name} in ${col}: "${m[0].trim()}" :: ${v.length > 80 ? v.slice(0, 80) + '…' : v}`,
        });
      }
    }

    // ── integrity scan ──
    const cov = String(r['Coverage Status'] ?? '').trim();
    const exec = String(r['Automation Execution'] ?? '').trim();
    const reason = String(r['If Failed Reason of Failure'] ?? '').trim();

    // C1 — reason present but execution claims Pass (upstream join bug)
    if (exec === 'Pass' && reason !== '') {
      integrityViolations.push({
        code: 'C1', sheet: r.sheet, tcId,
        detail: `Automation Execution='Pass' but carries a failure reason: "${reason.slice(0, 80)}…"`,
      });
    }
    // C2 — status enum
    if (!COVERAGE_ENUM.has(cov)) {
      integrityViolations.push({ code: 'C2', sheet: r.sheet, tcId, detail: `Coverage Status not in enum: "${cov}"` });
    }
    if (!EXECUTION_ENUM.has(exec)) {
      integrityViolations.push({ code: 'C2', sheet: r.sheet, tcId, detail: `Automation Execution not in enum: "${exec}"` });
    }
    // C4 — Manual must be blank execution + blank reason
    if (cov === 'Manual' && (reason !== '' || exec !== '')) {
      integrityViolations.push({
        code: 'C4', sheet: r.sheet, tcId,
        detail: `Coverage Status='Manual' must have blank Execution and Reason (got exec="${exec}", reason="${reason.slice(0, 60)}")`,
      });
    }
    // C5 — reason must read as a client sentence, not an internal label. A non-empty
    // reason under 4 words is almost always dev shorthand ("JobCosting", "Oracle
    // required", "batch isolation"). Allowlisted rows (no documented cause, ship
    // as-is per owner) are exempt; every other TC fails so future labels can't leak.
    if (reason !== '' && !TERSE_REASON_ALLOWLIST.has(tcId)
        && reason.split(/\s+/).filter(Boolean).length < 4) {
      integrityViolations.push({
        code: 'C5', sheet: r.sheet, tcId,
        detail: `If Failed Reason reads as an internal label, not a client sentence: "${reason}"`,
      });
    }
    // C3 (warn) — Blocked with no reason (Rutvik wants app-bug reasons kept visible)
    if (exec === 'Blocked' && reason === '') {
      warnings.push({ code: 'C3', sheet: r.sheet, tcId, detail: `Blocked but no reason text` });
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
