#!/usr/bin/env node
/**
 * scripts/validate-delivery-manifest.mjs
 *
 * Validates the delivery manifest before it can be committed.
 * Checks (per plan Phase 5.1):
 *   1. No duplicate module codes.
 *   2. Every status is in the enum (delivered|approved-next|withheld|internal-only|unknown).
 *   3. Every "delivered" row has a non-empty evidence sha.
 *   4. No "withheld" or "internal-only" row carries a delivered_on date.
 *   5. Every listed path (specs, workbooks, src) exists in the working tree under clients/<id>/.
 *   6. Every shared[] entry is an object with path/category/reason and passes the Phase 1.5
 *      structural deny rules.
 *   7. Every "approved-next" row's approved_ref resolves: the file exists, the line exists,
 *      the blob sha matches, and the referenced text names the module code.
 *      On sha mismatch the error message names the Phase 1.6 recovery procedure.
 *
 * Usage:
 *   node scripts/validate-delivery-manifest.mjs [--manifest=<path>] [--help]
 *
 * Exit codes:  0 = manifest is valid  |  1 = defects found  |  2 = setup error
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const STATUS_ENUM = new Set(['delivered', 'approved-next', 'withheld', 'internal-only', 'unknown']);
const VALID_CATEGORIES = new Set(['framework', 'config', 'fixture', 'tooling']);

// ── helpers ───────────────────────────────────────────────────────────────────

function usage() {
  console.log([
    'Usage:',
    '  node scripts/validate-delivery-manifest.mjs [--manifest=<path>]',
    '',
    'Options:',
    '  --manifest=<path>  Path to the manifest. Defaults to',
    '                     scripts/deliverable/delivery-manifest.<client-from-manifest>.json',
    '                     (auto-detected from the standard location).',
    '  --help             Print this message.',
    '',
    'Exit codes:  0 = valid  |  1 = defects found  |  2 = setup error',
  ].join('\n'));
}

function arg(name) {
  const f = process.argv.find((a) => a.startsWith(`--${name}=`));
  return f ? f.slice(`--${name}=`.length) : null;
}
const hasFlag = (n) => process.argv.includes(`--${n}`);

function norm(p) { return String(p).replace(/\\/g, '/').replace(/^\/+/, ''); }

/** Git blob sha for the content of a file (sha1 of "blob <size>\0<content>"). */
function blobSha(filePath) {
  try {
    return execFileSync('git', ['hash-object', '--', filePath], { cwd: REPO_ROOT, encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

/** Phase 1.5 deny rules for shared[] entries. Returns an array of reason strings or []. */
function sharedEntryDenyReasons(entryPath, withheldModuleDirs) {
  const n = norm(entryPath);
  const reasons = [];

  if (/\/tests\/[^/]+\.spec\.[jt]sx?$/.test(`/${n}`) || n.match(/^tests\/.*\.spec\.[jt]sx?$/)) {
    reasons.push('shared[] must not contain spec files (tests/**/*.spec.ts)');
  }
  if (/\/testcases\/.*\.xlsx$/i.test(`/${n}`) || n.match(/^testcases\/.*\.xlsx$/i)) {
    reasons.push('shared[] must not contain workbook files (testcases/**/*.xlsx)');
  }
  if (/^tests\/_/.test(n) || /\/tests\/_/.test(`/${n}`)) {
    reasons.push('shared[] must not contain files under tests/_*/ (internal test directories)');
  }

  // src/pages/**, src/data/**, src/selectors/** under a withheld-module directory
  const withheldPrefixMatch = /^src\/(?:pages|data|selectors)\/([^/]+)\//.exec(n);
  if (withheldPrefixMatch) {
    const moduleDir = withheldPrefixMatch[1];
    if (withheldModuleDirs.has(moduleDir)) {
      reasons.push(
        `shared[] must not contain src/pages|data|selectors under a withheld module directory` +
        ` ("${moduleDir}" belongs to a withheld or internal-only module)`
      );
    }
  }

  return reasons;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (hasFlag('help')) { usage(); process.exit(0); }

  // Find manifest path
  const manifestArg = arg('manifest');
  let manifestPath;
  if (manifestArg) {
    manifestPath = path.resolve(manifestArg);
  } else {
    // Auto-detect: scan scripts/deliverable/ for delivery-manifest.*.json
    const delivDir = path.join(REPO_ROOT, 'scripts', 'deliverable');
    const candidates = fs.existsSync(delivDir)
      ? fs.readdirSync(delivDir).filter((f) => /^delivery-manifest\.[^.]+\.json$/.test(f))
      : [];
    if (candidates.length === 0) {
      console.error('[validate-delivery-manifest] Error: no manifest found in scripts/deliverable/.');
      console.error('  Run with --manifest=<path> to specify the location.');
      process.exit(2);
    }
    if (candidates.length > 1) {
      console.error(
        `[validate-delivery-manifest] Error: multiple manifests found (${candidates.join(', ')}).` +
        ' Use --manifest=<path> to specify which one to validate.'
      );
      process.exit(2);
    }
    manifestPath = path.join(delivDir, candidates[0]);
  }

  if (!fs.existsSync(manifestPath)) {
    console.error(`[validate-delivery-manifest] Error: manifest not found: ${manifestPath}`);
    process.exit(2);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (e) {
    console.error(`[validate-delivery-manifest] Error: manifest is not valid JSON: ${e.message}`);
    process.exit(2);
  }

  const clientId = manifest.client;
  if (!clientId) {
    console.error('[validate-delivery-manifest] Error: manifest missing "client" field.');
    process.exit(2);
  }

  const clientRoot = path.join(REPO_ROOT, 'clients', clientId);
  const modules = manifest.modules;

  if (!Array.isArray(modules) || modules.length === 0) {
    console.error('[validate-delivery-manifest] FAIL: manifest has no modules[] — empty manifest is invalid.');
    process.exit(1);
  }

  const defects = [];
  const warn = (msg) => defects.push(msg);

  // ── Check 1: No duplicate module codes ───────────────────────────────────────
  const seenCodes = new Map();
  for (const mod of modules) {
    if (!mod.code) { warn(`MISSING-CODE: a module entry has no "code" field`); continue; }
    if (seenCodes.has(mod.code)) {
      warn(`DUPLICATE-CODE: module code "${mod.code}" appears more than once`);
    }
    seenCodes.set(mod.code, true);
  }

  // Build withheld module dirs for shared[] deny check.
  // A directory is "withheld-owned" only when NO delivered/approved-next module has src[]
  // entries under it — a directory shared between delivered and withheld modules is not denied.
  const dirModuleStatuses = new Map();
  for (const mod of modules) {
    for (const p of (mod.src ?? [])) {
      const m = norm(p).match(/^src\/(?:pages|data|selectors)\/([^/]+)\//);
      if (!m) continue;
      if (!dirModuleStatuses.has(m[1])) dirModuleStatuses.set(m[1], new Set());
      dirModuleStatuses.get(m[1]).add(mod.status);
    }
  }
  const withheldModuleDirs = new Set();
  for (const [dir, statuses] of dirModuleStatuses) {
    const hasApproved = [...statuses].some((s) => s === 'delivered' || s === 'approved-next');
    if (!hasApproved) withheldModuleDirs.add(dir);
  }

  for (const mod of modules) {
    const id = mod.code ?? '(no code)';

    // ── Check 2: Status in enum ─────────────────────────────────────────────
    if (!STATUS_ENUM.has(mod.status)) {
      warn(`INVALID-STATUS [${id}]: status="${mod.status}" is not in the allowed enum ` +
           `(delivered|approved-next|withheld|internal-only|unknown)`);
    }

    // ── Check 3: Delivered row must have a resolvable evidence reference ────
    if (mod.status === 'delivered') {
      if (!mod.evidence || typeof mod.evidence !== 'string' || mod.evidence.trim() === '') {
        warn(`MISSING-EVIDENCE [${id}]: status="delivered" but evidence is absent or empty.` +
             ' Add the git commit sha from the delivery branch.');
      } else {
        const ref = mod.evidence.trim();
        if (!/^[0-9a-f]+$/i.test(ref)) {
          warn(
            `INVALID-EVIDENCE-FORMAT [${id}]: evidence="${ref}" is not a valid git object reference.\n` +
            `  Evidence must be a hexadecimal git commit sha (7-40 characters).\n` +
            `  Fix: set evidence to the real commit sha from the delivery branch.`
          );
        } else {
          let objType = null;
          try {
            objType = execFileSync('git', ['cat-file', '-t', '--', ref], {
              cwd: REPO_ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
            }).trim();
          } catch { /* git cat-file failed — object does not exist */ }
          if (!objType) {
            warn(
              `UNRESOLVABLE-EVIDENCE [${id}]: evidence="${ref}" does not resolve to a git object.\n` +
              `  git cat-file -t ${ref} — the referenced object does not exist in this repository.\n` +
              `  Fix: set evidence to the real commit sha from the delivery branch. If the\n` +
              `        delivery remote has not been fetched, run: git fetch <delivery-remote>`
            );
          }
        }
      }
    }

    // ── Check 4: Withheld/internal-only must not have delivered_on ──────────
    if (mod.status === 'withheld' || mod.status === 'internal-only') {
      if (mod.delivered_on) {
        warn(`SPURIOUS-DELIVERED-ON [${id}]: status="${mod.status}" module carries` +
             ` delivered_on="${mod.delivered_on}" — remove this field.`);
      }
    }

    // ── Check 5: Every listed path exists under clients/<id>/ ───────────────
    const allPaths = [...(mod.specs ?? []), ...(mod.workbooks ?? []), ...(mod.src ?? [])];
    for (const p of allPaths) {
      const abs = path.join(clientRoot, p);
      if (!fs.existsSync(abs)) {
        warn(`MISSING-PATH [${id}]: "${p}" does not exist at ${abs}.` +
             ' Update the manifest path or restore the file.');
      }
    }

    // ── Check 7: approved-next rows must have a resolvable approved_ref ──────
    if (mod.status === 'approved-next') {
      if (!mod.approved_ref) {
        warn(
          `MISSING-APPROVED-REF [${id}]: status="approved-next" but approved_ref is absent or null.\n` +
          `  Fix: set approved_ref to { "path": "<repo-file>", "line": <n>, "blob_sha": "<sha>" }\n` +
          `  pointing at a pre-existing approval source (activity-log row, plan line, approval log).\n` +
          `  See Phase 1.6 of the delivery plan for the approved_ref format and recovery procedure.`
        );
      } else {
        const ref = mod.approved_ref;
        // ref must be an object with path, line, blob_sha
        if (typeof ref !== 'object' || !ref.path || !ref.line || !ref.blob_sha) {
          warn(
            `MALFORMED-APPROVED-REF [${id}]: approved_ref must be an object with` +
            ' "path", "line" (number), and "blob_sha" (string) fields.'
          );
        } else {
          const refAbsPath = path.join(REPO_ROOT, ref.path);
          if (!fs.existsSync(refAbsPath)) {
            warn(
              `UNRESOLVABLE-APPROVED-REF [${id}]: approved_ref.path "${ref.path}" does not exist.\n` +
              `  Fix: re-point approved_ref at a file that exists in the repository.`
            );
          } else {
            // Check blob sha
            const currentSha = blobSha(refAbsPath);
            if (currentSha && currentSha !== ref.blob_sha) {
              warn(
                `APPROVED-REF-SHA-MISMATCH [${id}]: approved_ref.blob_sha "${ref.blob_sha}" does not\n` +
                `  match the current blob sha "${currentSha}" for "${ref.path}".\n` +
                `  The approval source file has changed since approved_ref was recorded.\n` +
                `  Recovery (Phase 1.6):\n` +
                `    1. Inspect the original approval: git show ${ref.blob_sha}\n` +
                `    2. Re-point approved_ref at an unchanged source (a commit-pinned path\n` +
                `       or an append-only log that has not moved), OR obtain fresh approval.\n` +
                `    3. Do NOT edit blob_sha to silence this error without completing step 1 or 2 —\n` +
                `       that defeats the entire control this field exists to enforce.`
              );
            } else {
              // Check line exists and contains the module code
              let lines;
              try {
                lines = fs.readFileSync(refAbsPath, 'utf-8').split(/\r?\n/);
              } catch {
                warn(`APPROVED-REF-READ-ERROR [${id}]: could not read "${ref.path}".`);
                lines = null;
              }
              if (lines) {
                const lineIdx = Number(ref.line) - 1; // 1-based → 0-based
                if (lineIdx < 0 || lineIdx >= lines.length) {
                  warn(
                    `APPROVED-REF-LINE-MISSING [${id}]: approved_ref.line ${ref.line} is out of` +
                    ` range (file has ${lines.length} lines).`
                  );
                } else if (!lines[lineIdx].includes(id)) {
                  warn(
                    `APPROVED-REF-CODE-ABSENT [${id}]: line ${ref.line} of "${ref.path}" does not` +
                    ` name the module code "${id}".\n` +
                    `  Line content: ${lines[lineIdx].trim().slice(0, 120)}\n` +
                    `  Fix: point approved_ref at a line that explicitly names "${id}".`
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  // ── Check 6: shared[] entries pass Phase 1.5 deny rules ────────────────────
  if (!Array.isArray(manifest.shared)) {
    warn('MISSING-SHARED: manifest has no shared[] array. Add shared[] (may be empty []).');
  } else {
    for (const entry of manifest.shared) {
      if (typeof entry !== 'object' || entry === null) {
        warn(`SHARED-INVALID-ENTRY: shared[] contains a non-object entry: ${JSON.stringify(entry)}.` +
             ' Each entry must be { path, category, reason }.');
        continue;
      }
      if (!entry.path) {
        warn('SHARED-MISSING-PATH: a shared[] entry has no "path" field.');
        continue;
      }
      if (!entry.category || !VALID_CATEGORIES.has(entry.category)) {
        warn(
          `SHARED-INVALID-CATEGORY [${entry.path}]: category="${entry.category}" is not in` +
          ` (framework|config|fixture|tooling).`
        );
      }
      if (!entry.reason || entry.reason.length < 20) {
        warn(
          `SHARED-SHORT-REASON [${entry.path}]: reason must be at least 20 characters` +
          ` (plain English, explains why this file is shared).`
        );
      }
      const denyReasons = sharedEntryDenyReasons(entry.path, withheldModuleDirs);
      for (const r of denyReasons) {
        warn(`SHARED-DENY [${entry.path}]: ${r}.`);
      }
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  if (defects.length === 0) {
    console.log(`[validate-delivery-manifest] PASS — manifest is valid (${modules.length} modules).`);
    process.exit(0);
  }

  console.error(`[validate-delivery-manifest] FAIL — ${defects.length} defect(s) in ${manifestPath}:\n`);
  for (const d of defects) {
    console.error(d);
    console.error('');
  }
  process.exit(1);
}

main().catch((e) => {
  console.error('[validate-delivery-manifest] Unexpected error:', e.message);
  process.exit(2);
});
