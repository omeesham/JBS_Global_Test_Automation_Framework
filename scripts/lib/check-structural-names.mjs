/**
 * check-structural-names.mjs — Structural naming gate (LR-073, severity S0).
 *
 * Graduating incident: 2026-07-28, commit a544dcd72 — six client-facing workbooks
 * shipped named with Jira ticket IDs (corporate-override-nm2268.xlsx through -nm2273.xlsx).
 *
 * What it does: prevents ticket IDs (nm####) from becoming structural names on
 * client-shippable paths. Checks (1) file/directory basenames in shippable scopes,
 * and (2) three named registry structures whose keys/stems propagate into file names.
 * Never opens arbitrary file content — names and the three registry structures only.
 *
 * Modes:
 *   node scripts/lib/check-structural-names.mjs            — scan whole repo (clean-tree / npm)
 *   node scripts/lib/check-structural-names.mjs --staged   — scan staged added/renamed paths (pre-commit)
 *   node scripts/lib/check-structural-names.mjs --target=<dir> — scan extracted directory (ship path)
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'fs';
import { resolve, dirname, basename, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

// ── Ticket-ID basename pattern ──────────────────────────────────────────────
// Detects ticket IDs like nm###/NM### anywhere inside a filename or directory segment — they are caught even when glued into a larger word.
// Does not match longer digit runs: sequences with five or more digits are ignored (e.g., 'nm22680' is not considered a ticket ID).
const TICKET_ID_RX = /nm-?\d{3,4}(?!\d)/i;

// ── Shippable path scopes (relative to repo root or target dir) ─────────────
const SCOPE_GLOBS = [
  /^clients\/[^/]+\/testcases\//,
  /^clients\/[^/]+\/tests\//,
  /^clients\/[^/]+\/src\//,
  /^clients\/[^/]+\/config\//,
  /^clients\/[^/]+\/specs_planning\/test-cases\//,
];

// ── Exclusions ───────────────────────────────────────────────────────────────
const EXCLUDE_RX = [
  /specs_planning\/_internal\//,
  /\/\.playwright-cli\//,
  /\/\.auth\//,
  /^plans\//,
];

// ── Telemetry ────────────────────────────────────────────────────────────────
function fireTelemetry(verdict, target) {
  try {
    const stateDir = resolve(REPO_ROOT, '.claude', 'state');
    if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
    appendFileSync(
      join(stateDir, 'gate-fires.log'),
      `check-structural-names, ${new Date().toISOString()}, ${verdict}, ${target}\n`
    );
  } catch { /* telemetry failure must never affect gate verdict */ }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function inScope(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  if (EXCLUDE_RX.some(rx => rx.test(norm))) return false;
  return SCOPE_GLOBS.some(rx => rx.test(norm));
}

function checkBasename(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  // Check every path segment, not just the final filename
  const segments = norm.split('/');
  for (const seg of segments) {
    if (TICKET_ID_RX.test(seg)) return seg;
  }
  return null;
}

// ── Registry lint ─────────────────────────────────────────────────────────────
function lintRegistries() {
  const violations = [];

  // 1. module-codes.json — keys and mdBasename values under submodules.<MOD>.<CODE>
  const mcPath = join(REPO_ROOT, 'export_test_cases', 'module-codes.json');
  if (existsSync(mcPath)) {
    const mc = JSON.parse(readFileSync(mcPath, 'utf8'));
    for (const [mod, codes] of Object.entries(mc.submodules ?? {})) {
      for (const [code, entry] of Object.entries(codes)) {
        if (TICKET_ID_RX.test(code)) {
          violations.push(`module-codes.json submodule key "${mod}.${code}" looks like a ticket ID`);
        }
        if (entry.mdBasename && TICKET_ID_RX.test(entry.mdBasename)) {
          violations.push(`module-codes.json mdBasename "${entry.mdBasename}" (${mod}.${code}) looks like a ticket ID`);
        }
      }
    }
  }

  // 2. to-xlsx.ts SPLIT_FILE_MAP — stem values
  const xlsxPath = join(REPO_ROOT, 'export_test_cases', 'to-xlsx.ts');
  if (existsSync(xlsxPath)) {
    const src = readFileSync(xlsxPath, 'utf8');
    // Extract SPLIT_FILE_MAP block: from its opening brace to its closing brace
    const mapMatch = src.match(/const SPLIT_FILE_MAP[^=]*=\s*\{([\s\S]*?)\};/);
    if (mapMatch) {
      const block = mapMatch[1];
      // Match stem: 'value' entries
      const stemRx = /\bstem:\s*['"]([^'"]+)['"]/g;
      let m;
      while ((m = stemRx.exec(block)) !== null) {
        if (TICKET_ID_RX.test(m[1])) {
          violations.push(`to-xlsx.ts SPLIT_FILE_MAP stem "${m[1]}" looks like a ticket ID`);
        }
      }
    }

    // 3 & 4. to-xlsx.ts SHEET_NAMES and SHEET_DISPLAY_NAMES — keys only
    for (const [mapName, label] of [['SHEET_NAMES', 'SHEET_NAMES'], ['SHEET_DISPLAY_NAMES', 'SHEET_DISPLAY_NAMES']]) {
      const snMatch = src.match(new RegExp(`const ${mapName}[^=]*=\\s*\\{([\\s\\S]*?)\\};`));
      if (snMatch) {
        const block = snMatch[1];
        const keyRx = /^\s*(?:['"]([^'"]+)['"]|([a-zA-Z_$][a-zA-Z0-9_$]*))\s*:/gm;
        let m;
        while ((m = keyRx.exec(block)) !== null) {
          const key = m[1] ?? m[2];
          if (key && TICKET_ID_RX.test(key)) {
            violations.push(`to-xlsx.ts ${label} key "${key}" looks like a ticket ID`);
          }
        }
      }
    }
  }

  return violations;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isStaged = args.includes('--staged');
const targetArg = args.find(a => a.startsWith('--target='));
const targetDir = targetArg ? targetArg.slice('--target='.length) : null;

const t0 = Date.now();
const violations = [];

if (isStaged) {
  // Pre-commit mode: check staged added/renamed paths
  const staged = execSync('git diff --cached --name-only --diff-filter=AR', { cwd: REPO_ROOT })
    .toString().trim();
  if (staged) {
    for (const relPath of staged.split('\n').filter(Boolean)) {
      if (!inScope(relPath)) continue;
      const hit = checkBasename(relPath);
      if (hit) violations.push(`[path] ${relPath} — segment "${hit}" matches ticket-ID pattern`);
    }
  }
} else if (targetDir) {
  // Ship-time mode: scan extracted target directory
  const absTarget = resolve(targetDir);
  const files = execSync('find . -type f -o -type d', { cwd: absTarget })
    .toString().trim().split('\n').filter(Boolean);
  for (const f of files) {
    const rel = f.replace(/^\.\//, '');
    // For ship-time, scope as clients/<id>/... but target is already stripped to client root
    // Wrap as clients/encore/<rel> for scope check, then use rel for message
    const scopeRel = `clients/_ship_/${rel}`;
    if (EXCLUDE_RX.some(rx => rx.test(rel.replace(/\\/g, '/')))) continue;
    const hit = checkBasename(rel);
    if (hit) violations.push(`[ship] ${rel} — segment "${hit}" matches ticket-ID pattern`);
  }
} else {
  // Clean-tree / npm script mode: scan repo using git ls-files
  const files = execSync('git ls-files', { cwd: REPO_ROOT })
    .toString().trim().split('\n').filter(Boolean);
  for (const relPath of files) {
    if (!inScope(relPath)) continue;
    const hit = checkBasename(relPath);
    if (hit) violations.push(`[path] ${relPath} — segment "${hit}" matches ticket-ID pattern`);
  }
}

// Always run registry lint (registries exist at known repo paths regardless of mode)
const regViolations = lintRegistries();
violations.push(...regViolations);

const elapsed = Date.now() - t0;

if (violations.length > 0) {
  console.error('[check-structural-names] DENY — LR-073: structural names must be feature-based.');
  console.error('[check-structural-names] Ticket IDs (nm####) are only legal as content, not as file/directory/registry names on shippable paths.');
  console.error('[check-structural-names] Violations found:');
  for (const v of violations) {
    console.error(`  • ${v}`);
  }
  console.error(`[check-structural-names] Fix: rename using a feature-based name (e.g. "corporate-override-location-filter", not "corporate-override-nm2268").\n`);
  for (const v of violations) {
    fireTelemetry('deny', v);
  }
  console.error(`[check-structural-names] Runtime: ${elapsed}ms`);
  process.exit(1);
} else {
  console.log(`[check-structural-names] PASS — no structural ticket-ID names found. (${elapsed}ms)`);
  process.exit(0);
}
