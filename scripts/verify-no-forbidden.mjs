#!/usr/bin/env node
/**
 * scripts/verify-no-forbidden.mjs
 *
 * Single source of truth for "what must NEVER ship to a client". Used by:
 *   - scripts/ship-client.sh pre-flight (--client=<id>)
 *   - scripts/ship-client.sh post-flight (--target=<path>)
 *   - .githooks/pre-commit (--staged-diff)
 *   - .githooks/pre-push  (--staged="<file>")
 *
 * Modes:
 *   --client=<id>   : git ls-files clients/<id>/ + filter against DENY_GLOBS, fail if any match.
 *   --target=<path> : walk <path> recursively + filter against DENY_GLOBS, fail if any match.
 *   --staged-diff   : scan staged file contents for MARKER_GREP, fail on any hit.
 *   --staged=<file> : check a single staged path against DENY_GLOBS.
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const DENY_GLOBS = [
  /\/CLAUDE\.md$/,
  /\/specs_planning\//,
  /\/readable_externals\//,
  // Entire per-client docs/ folder is internal — never ships (read-only guides,
  // REQUIREMENTS.md, MODULE_REGISTRY.md, JIRA story/test docs). Broadened 2026-06-08
  // from the three specific entries: docs/ no longer ships. Unanchored so it matches
  // both the stripped client path (/docs/...) and the full path (/clients/<id>/docs/...).
  /\/docs\//,
  /\/api-testing\/REQUIREMENTS_API\.md$/,
  /\/\.auth\//,
  /^\.git\//,
  /^\.github\//,
  /^\.claude\//,
  /\/agent-mistakes\.md$/,
  /\/agent-activity-log\.md$/,
  /\/agent-performance\.json$/,
  /\/agent-metrics-report\.md$/,
  /\/agent-escalations\.json$/,
  /\/agent-learnings\.md$/,
  /\/test-id-registry\.json$/,
  /\/daily-status-bank\.json$/,
  /\/active-experiments\.md$/,
  /\.env\.local$/,
  /\.env\..+\.local$/,
  /\.env\.server$/,
  /^\/pipeline\//,
  // Date-stamped throwaway tools under clients/<id>/scripts/ — denies one-off
  // dated helpers (e.g., foo-2026-04-29.mjs) while allowing permanent ones
  // (preserve-allure-history.js, archive-allure.js, etc.). Root scripts/ is
  // structurally outside `git archive HEAD clients/<id>/`, so no extra rule
  // is needed for it here.
  /\/clients\/[^/]+\/scripts\/.*-\d{4}-\d{2}-\d{2}\.(mjs|js|ts)$/,
  // Stale env files that no code path loads — Encore runs only the e2e env.
  /\.env\.production$/,
  /\.env\.staging$/,
  /\.env\.example$/,
];

// Patterns scanned across every staged or shipped file (sentinels that should
// never appear anywhere in the repo).
const MARKER_GREP = [/TEMP_RUTVIK_EXPERIMENT/, /v-rutvik/, /khosariya/];

// Patterns scanned ONLY in client-shipping files (target output, or a staged
// path under clients/<id>/ that would survive the DENY_GLOB filter). Framework-
// internal files (rules, docs, hooks, root CLAUDE.md) legitimately reference
// these terms, so applying them repo-wide would wedge normal commits.
const MARKER_GREP_CLIENT_ONLY = [
  // Plan / ticket IDs
  /\bPLAN_[A-Z0-9_]+\b/,
  /\bSUBPLAN_[A-Z0-9_]+\b/,
  /\bSP-[A-Z]{2,}-\d+\b/,
  // Pipeline identity codenames
  /\b(HUNTER|GIVER|BUILDER|HEALER|WATCHDOG|GARDENER)\b/,
  /\bOWNER\b(?!_)/,
  // Internal artifact paths
  /\bagent-(mistakes|activity-log|performance|queue|escalations|learnings)\b/,
  /\bspecs_planning\b/,
  /\breadable_externals\b/,
  /\bread_only_docs\b/,
  // Build-process leaks
  /\bvendor:build\b/,
  /\bvendor-meta\b/,
  /\bPath [AB]\b/,
  // Vendor identity
  /\bJBS\b/,
  /\bIntelliQE\b/i,
  /\bRutviK[-_]?JBS\b/,
  /\bencore_deliverables_test\b/,
  // Tooling identity
  /\.claude\//,
  /@agent-doc\b/,
  // Internal date-stamped report paths
  /reports\/testid-verification\//,
  /JIRA_VERIFICATION_\d{4}-\d{2}-\d{2}/,
];

// LR-054 / ALL-077 — manufactured-blocker banned-phrase regexes. Scanned ONLY
// in path-scoped target artifacts (walk-evidence / neutral-eye-audits /
// field-inventories) where the pattern shipped on 2026-05-18. Plan files
// (plans/pending/, plans/done/) and rule/skill/memory files legitimately
// reference these phrases when defining or quarantining them — they are NOT
// scanned. This array is intentionally separate from MARKER_GREP (repo-wide,
// would false-positive on legitimate engineering vocabulary) — same scoping
// approach as MARKER_GREP_CLIENT_ONLY (gated by isClientShipping above).
const BANNED_PHRASES = [
  /Section 0 — Live-Walk Blocker/i,
  /Section 0 — .{0,40}Blocker\b/i,
  /UNFILLED-BLOCKED-SECTION/,
  /\bstructural blocker\b/i,
  /\bprovisioning invariant\b/i,
  /\bunattended execution risks?\b/i,
  /\bindefinite if .{1,80} fires\b/i,
  /\bPath \d+ \(NOT taken in this session\)/i,
  /\bcannot complete .{0,80}strict.{0,40}line.{0,80}in this single session\b/i,
];

// Target paths for BANNED_PHRASES scan (pre-commit/pre-push). Returns true
// only for the three artifact path classes where the pattern shipped.
function isBannedPhraseTarget(rel) {
  if (!rel) return false;
  const norm = String(rel).replace(/\\/g, '/');
  if (!/^clients\/[^/]+\/specs_planning\/_internal\//.test(norm)) return false;
  if (/\/walk-evidence-[^/]+\.md$/.test(norm)) return true;
  if (/\/neutral-eye-audits\/.+\.md$/.test(norm)) return true;
  if (/\/field-inventories\/.+\.md$/.test(norm)) return true;
  // agent-mistakes.md is excluded by default — it legitimately discusses the
  // pattern in the ALL-077 row.
  return false;
}

// Strings that must NOT appear in the shipped per-client .gitignore — they leak
// JBS-internal terminology to the customer (plan IDs, ship-pipeline mechanics,
// internal directory names). The JBS-context patterns live at root .gitignore
// instead, so the per-client .gitignore stays customer-neutral.
const GITIGNORE_LEAK_MARKERS = [
  /PLAN_/,
  /pipeline/i,
  /git archive/i,
  /specs_planning/,
  /readable_externals/,
  /read_only_docs/,
];

function arg(name) {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag ? flag.slice(`--${name}=`.length) : null;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

function matchesDeny(rel) {
  return DENY_GLOBS.some((re) => re.test(rel));
}

// XLSX deliverable vocab + integrity gate (LR-ENC-004). The DENY_GLOB / MARKER_GREP
// scans above are text-based and cannot see inside the binary .xlsx, so lint every
// workbook under <dir>/test_cases_xlsx/ with the SAME shared rules used at build and
// commit time. Hard-fails the ship on any banned vocab or status/reason contradiction.
async function lintXlsxDir(dir, label) {
  if (!fs.existsSync(dir)) return;
  const xlsxFiles = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.xlsx'));
  if (xlsxFiles.length === 0) return;
  const { lintWorkbook, formatReport } = await import('./xlsx-lint-rules.mjs');
  for (const f of xlsxFiles) {
    const result = lintWorkbook(path.join(dir, f));
    if (!result.ok) {
      console.error(`[verify-no-forbidden] ${label} XLSX deliverable '${f}' failed the vocab/integrity lint (LR-ENC-004):`);
      console.error(formatReport(result));
      process.exit(1);
    }
    console.log(`[verify-no-forbidden] OK ${label} XLSX '${f}' clean (${result.rowsScanned} rows)`);
  }
}

// True when a staged repo path would survive the DENY_GLOB filter and ship
// inside clients/<id>/. Used to scope MARKER_GREP_CLIENT_ONLY in pre-commit.
function isClientShipping(rel) {
  const m = rel.match(/^clients\/[^/]+\/(.+)$/);
  if (!m) return false;
  return !matchesDeny('/' + m[1]);
}

function walkDir(root, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, prefix), { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walkDir(root, rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

async function checkClient(client) {
  let listing;
  try {
    listing = execSync(`git ls-files clients/${client}/`, { cwd: REPO_ROOT, encoding: 'utf-8' });
  } catch {
    console.error(`[verify-no-forbidden] git ls-files failed for clients/${client}/`);
    process.exit(2);
  }
  const tracked = listing.split(/\r?\n/).filter(Boolean);
  // Strip leading clients/<id>/ for glob matching.
  const stripped = tracked.map((p) => p.replace(new RegExp(`^clients/${client}/`), '/'));
  const offending = stripped.filter(matchesDeny);
  if (offending.length > 0) {
    console.error(
      `[verify-no-forbidden] client=${client} found ${offending.length} forbidden file(s) tracked under clients/${client}/:\n` +
        offending.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }
  await lintXlsxDir(path.join(REPO_ROOT, 'clients', client, 'test_cases_xlsx'), `client=${client}`);
  console.log(`[verify-no-forbidden] OK client=${client} tracked=${tracked.length}`);
}

async function checkTarget(target) {
  const root = path.resolve(target);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`[verify-no-forbidden] target not a directory: ${target}`);
    process.exit(2);
  }
  const files = walkDir(root).map((p) => `/${p.replace(/\\/g, '/')}`);
  const offending = files.filter(matchesDeny);
  if (offending.length > 0) {
    console.error(
      `[verify-no-forbidden] target=${target} found ${offending.length} forbidden file(s):\n` +
        offending.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }

  // Marker grep — scan all text-ish files for forbidden literals. Target is
  // the actual shipped output, so client-only patterns apply to every file.
  const targetPatterns = [...MARKER_GREP, ...MARKER_GREP_CLIENT_ONLY];
  const offenders = [];
  for (const rel of walkDir(root)) {
    if (/\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|pdf|zip|tar|gz|7z)$/i.test(rel)) continue;
    let buf;
    try {
      buf = fs.readFileSync(path.join(root, rel), 'utf-8');
    } catch {
      continue;
    }
    for (const re of targetPatterns) {
      if (re.test(buf)) {
        offenders.push(`${rel} :: ${re}`);
        break;
      }
    }
  }
  if (offenders.length > 0) {
    console.error(
      `[verify-no-forbidden] target=${target} found ${offenders.length} marker-hit file(s):\n` +
        offenders.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }

  // Per-client .gitignore content check: shipped .gitignore must not leak
  // JBS-internal terminology. Patterns ride at root .gitignore instead.
  const gitignorePath = path.join(root, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreText = fs.readFileSync(gitignorePath, 'utf-8');
    const leaks = GITIGNORE_LEAK_MARKERS.filter((re) => re.test(gitignoreText));
    if (leaks.length > 0) {
      console.error(
        `[verify-no-forbidden] target=${target} .gitignore leaks JBS terminology: ${leaks.map((re) => re.toString()).join(', ')}`
      );
      process.exit(1);
    }
  }

  await lintXlsxDir(path.join(root, 'test_cases_xlsx'), `target=${target}`);
  console.log(`[verify-no-forbidden] OK target=${target} files=${files.length}`);
}

function hasStatusDoneAnyForm(content) {
  const header = content.slice(0, 2000);
  const re = /(?:^|\n)\s*(?:\*\*)?Status(?:\*\*)?\s*:\s*([^\n]+)/i;
  const m = header.match(re);
  if (!m) return false;
  const val = m[1].replace(/^\*+|\*+$/g, '').replace(/^`|`$/g, '').split('|')[0].trim();
  return val.toUpperCase() === 'DONE';
}

function checkStagedDiff() {
  let listing;
  try {
    listing = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    });
  } catch {
    process.exit(0);
  }
  const staged = listing.split(/\r?\n/).filter(Boolean);
  const offenders = [];
  // LR-054 / ALL-077 banned-phrase exemption list — files that legitimately
  // discuss the pattern when defining or quarantining it.
  const BANNED_EXEMPT_PATHS = new Set([
    '.claude/rules/browser-tool.md',
    'clients/encore/specs_planning/_internal/agent-mistakes.md',
  ]);
  const bannedOffenders = [];
  for (const rel of staged) {
    if (rel.startsWith('plans/done/')) continue; // historical artifacts
    // NB3 fix: closure-gate-aware pending skip — if staged plan has Status: DONE, run markers regardless
    if (rel.startsWith('plans/pending/')) {
      let planBuf;
      try {
        planBuf = execSync(`git show :${rel}`, { cwd: REPO_ROOT, encoding: 'utf-8' });
      } catch { continue; }
      if (!hasStatusDoneAnyForm(planBuf)) continue;
    }
    if (rel === 'scripts/verify-no-forbidden.mjs') continue; // self-reference: this script's own MARKER_GREP literals
    if (rel === '.claude/hooks/lib/check-todo-injection.mjs') continue; // self-reference: hook's own BANNED_PHRASES + self-test literals
    if (rel === '.claude/hooks/lib/check-plan-closure.mjs') continue; // self-reference: hook's own regex literals
    // Binary file extensions — text-pattern MARKER_GREP/BANNED_PHRASES regex on
    // compressed/binary bytes produces false positives (e.g., zip-compressed
    // XLSX bytes randomly matching 3-letter tokens like /\bJBS\b/). Binary
    // deliverables are content-checked separately (e.g., xlsx:dump for XLSX).
    if (/\.(xlsx|xlsm|xls|png|jpg|jpeg|gif|pdf|ico|zip|tar|gz|woff2?|ttf|eot|otf|mp4|webm|wav|mp3)$/i.test(rel)) continue;
    let buf;
    try {
      buf = execSync(`git show :${rel}`, { cwd: REPO_ROOT, encoding: 'utf-8' });
    } catch {
      continue;
    }
    // Repo-wide markers always apply. Client-only markers apply only when
    // the staged path would actually ship inside clients/<id>/.
    const patterns = isClientShipping(rel)
      ? [...MARKER_GREP, ...MARKER_GREP_CLIENT_ONLY]
      : MARKER_GREP;
    for (const re of patterns) {
      if (re.test(buf)) {
        offenders.push(`${rel} :: ${re}`);
        break;
      }
    }
    // LR-054 / ALL-077 banned-phrase scan — path-scoped to artifact files
    // (walk-evidence / neutral-eye-audits / field-inventories) only.
    if (isBannedPhraseTarget(rel) && !BANNED_EXEMPT_PATHS.has(rel.replace(/\\/g, '/'))) {
      for (const re of BANNED_PHRASES) {
        const m = buf.match(re);
        if (m) {
          bannedOffenders.push(`${rel} :: ${JSON.stringify(m[0])}`);
          break;
        }
      }
    }
  }
  if (offenders.length > 0) {
    console.error(
      `[verify-no-forbidden] staged-diff: ${offenders.length} marker-hit file(s):\n` +
        offenders.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }
  if (bannedOffenders.length > 0) {
    console.error(
      `[verify-no-forbidden] staged-diff: ${bannedOffenders.length} manufactured-blocker phrase(s) ` +
        `denied by LR-039 + LR-054 + ALL-077 (default auth-refresh path = LoginPage.loginWithMicrosoft; ` +
        `see .claude/rules/browser-tool.md LR-054 + docs/read_only_docs/CLI_BROWSER_GUIDE.md Table 2 + ` +
        `clients/encore/specs_planning/_internal/agent-mistakes.md ALL-077):\n` +
        bannedOffenders.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }
  console.log('[verify-no-forbidden] OK staged-diff (no marker hits)');
}

function checkStagedFile(file) {
  // Pre-push per-file mode: refuse if path itself matches DENY_GLOBS (relative to repo root).
  const rel = file.replace(/\\/g, '/');
  if (matchesDeny(`/${rel}`) && rel.startsWith('clients/')) {
    console.error(`[verify-no-forbidden] staged forbidden path: ${rel}`);
    process.exit(1);
  }
  process.exit(0);
}

const client = arg('client');
const target = arg('target');
const staged = arg('staged');

if (client) await checkClient(client);
else if (target) await checkTarget(target);
else if (hasFlag('staged-diff')) checkStagedDiff();
else if (staged) checkStagedFile(staged);
else {
  console.error(
    'Usage: verify-no-forbidden.mjs --client=<id> | --target=<path> | --staged-diff | --staged=<file>'
  );
  process.exit(2);
}
