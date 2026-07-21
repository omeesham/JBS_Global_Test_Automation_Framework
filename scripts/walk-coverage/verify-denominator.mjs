#!/usr/bin/env node
// scripts/walk-coverage/verify-denominator.mjs
// PLAN_EXHAUSTIVE_WALK_GUARANTEE — W-DENOM gate (item 4 denominator integrity + item 7 spot audit).
//
// Exports:
//   verifyDenominator(artifactText, jsonPath) — checks machine-enumerated keys match manifest rows.
//   spotAudit(artifactText)                   — random sample of covered-by-TC rows, asserts TC
//                                               ids exist in clients/encore/tests/**/*.spec.ts.
//
// Design: requiredStates are read from lib/module-config.mjs (pure data, no playwright deps).
// enumerate-page.mjs imports playwright at top level so importing it directly would drag heavy
// deps into this gate; the extracted module-config.mjs avoids that. The MODULE_CONFIG export in
// enumerate-page.mjs is retained for other consumers of the full walk config.
// FAIL-CLOSED: any gate-can't-verify condition returns ok:false (never silently passes).
//
// Refs: LR-062 (denominator discipline), LR-065 (case-generation taxonomy).

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { extractManifestRows } from './lib/coverage-manifest.mjs';
import { MODULE_CONFIG as MODULE_REQUIRED_STATES } from './lib/module-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

// ---- normalize -------------------------------------------------------------------------------
// Lowercase + trim only. Prefix (testid:|id:|…) is PRESERVED so two distinct machine keys that
// differ only by prefix (e.g. testid:save vs id:save) map to distinct Set entries and each
// requires its own manifest row. extractManifestRows also returns controlRef with the prefix,
// so both sides compare prefixed strings and the match is still exact.
function normalize(key) {
  return (key || '').toLowerCase().trim();
}

// ---- unreachable exemptions ------------------------------------------------------------------
function loadUnreachableExemptions() {
  const exemptionsPath = join(REPO_ROOT, '.claude', 'walk-exemptions.json');
  const keys = new Set();
  try {
    if (existsSync(exemptionsPath)) {
      const data = JSON.parse(readFileSync(exemptionsPath, 'utf-8'));
      for (const e of (data.unreachable_exemptions || [])) {
        for (const k of (e.keys || [])) keys.add(normalize(k));
      }
    }
  } catch { /* no valid exemptions */ }
  return keys;
}

// ---- spec file finder -----------------------------------------------------------------------
function findSpecFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      try {
        if (statSync(full).isDirectory()) findSpecFiles(full, acc);
        else if (entry.endsWith('.spec.ts')) acc.push(full);
      } catch { /* ignore inaccessible entries */ }
    }
  } catch { /* ignore unreadable dir */ }
  return acc;
}

// ---- crypto random index selection ----------------------------------------------------------
function pickRandom(arr, n) {
  if (n >= arr.length) return [...arr];
  const selected = [];
  const used = new Set();
  let attempts = 0;
  while (selected.length < n && attempts < n * 10) {
    attempts++;
    const bytes = randomBytes(4);
    const idx = bytes.readUInt32BE(0) % arr.length;
    if (!used.has(idx)) { used.add(idx); selected.push(arr[idx]); }
  }
  return selected;
}

// ---- verifyDenominator ----------------------------------------------------------------------
/**
 * Verify the machine-enumerated denominator against the coverage manifest.
 *
 * @param {string} artifactText  Full markdown text of the walk artifact.
 * @param {string} jsonPath      Absolute path to the enumerator's walk-coverage JSON.
 * @returns {{ ok: boolean, reason?: string, reasons?: string[] }}
 *   ok:false with reasons on any gate failure. FAIL-CLOSED: missing/unreadable JSON → ok:false.
 */
export function verifyDenominator(artifactText, jsonPath) {
  // 1. Load JSON — FAIL-CLOSED: missing or unreadable always returns ok:false.
  if (!existsSync(jsonPath)) return { ok: false, reason: 'JSON not found/unreadable' };
  let data;
  try {
    data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  } catch {
    return { ok: false, reason: 'JSON not found/unreadable' };
  }
  if (!data || !Array.isArray(data.entries)) {
    return { ok: false, reason: 'JSON not found/unreadable' };
  }

  const reasons = [];

  // 2. Build normalized key sets.
  const machineKeys = new Set(data.entries.map(e => normalize(e.key)));
  const manifestRows = extractManifestRows(artifactText);
  const manifestKeys = new Set(manifestRows.map(r => normalize(r.controlRef)));

  // 4a. missing = machineKeys \ manifestKeys → any non-empty → FAIL.
  const missing = [...machineKeys].filter(k => !manifestKeys.has(k));
  if (missing.length > 0) {
    reasons.push(`${missing.length} machine key(s) missing from manifest: ${missing.slice(0, 10).join(', ')}`);
  }

  // 4b. inflation = manifestKeys \ machineKeys → if > 5% of |machineKeys| → FAIL.
  if (machineKeys.size > 0) {
    const inflation = [...manifestKeys].filter(k => !machineKeys.has(k));
    if (inflation.length / machineKeys.size > 0.05) {
      reasons.push(`manifest inflation ${inflation.length}/${machineKeys.size} (${Math.round(inflation.length / machineKeys.size * 100)}% > 5%): ${inflation.slice(0, 5).join(', ')}`);
    }
  }

  // 5. UNREACHABLE entries without exemption → FAIL.
  const exemptedUnreachable = loadUnreachableExemptions();
  const unreachable = data.entries.filter(
    e => e.status === 'UNREACHABLE' && !exemptedUnreachable.has(normalize(e.key)),
  );
  if (unreachable.length > 0) {
    reasons.push(`${unreachable.length} UNREACHABLE element(s) without exemption: ${unreachable.map(e => e.key).slice(0, 5).join(', ')}`);
  }

  // 6. requiredStates — parse Walk_State from artifactText, compare against MODULE_REQUIRED_STATES.
  const walkLineM = artifactText.match(/Walk_State\s*:\s*([^\n]+)/i);
  if (!walkLineM) {
    reasons.push('Walk_State line missing/unparseable — cannot verify required states');
  } else {
    const line = walkLineM[1];
    const modM = line.match(/\bmodule=(\S+)/);
    const walkedM = line.match(/\bwalked=\[([^\]]*)\]/);
    if (!modM || !walkedM) {
      reasons.push('Walk_State line missing/unparseable — cannot verify required states');
    } else {
      const moduleName = modM[1].trim();
      const walkedLabels = new Set(
        walkedM[1].split(',').map(s => s.trim()).filter(Boolean),
      );
      const requiredStates = MODULE_REQUIRED_STATES[moduleName]?.requiredStates ?? null;
      if (requiredStates !== null) {
        for (const { label } of requiredStates) {
          if (!walkedLabels.has(label)) {
            reasons.push(`required walk state missing: "${label}" (module: ${moduleName})`);
          }
        }
      }
      // If requiredStates is null, module has no required states — no check performed.
    }
  }

  if (reasons.length === 0) return { ok: true };
  return { ok: false, reason: reasons.join('; '), reasons };
}

// ---- spotAudit -------------------------------------------------------------------------------
/**
 * Spot-audit: draw N random non-out-of-scope rows from the Coverage Manifest; for each
 * covered-by-TC row, verify its TC id appears in clients/encore/tests/**\/*.spec.ts.
 *
 * N = min(5, max(1, ceil(rows * 0.1))). Seed comes from crypto.randomBytes (gate-time, unpredictable).
 *
 * @param {string} artifactText  Full markdown text of the walk artifact.
 * @returns {{ ok: boolean, failures: string[], checked: number }}
 */
export function spotAudit(artifactText) {
  const allRows = extractManifestRows(artifactText);
  const eligible = allRows.filter(r => r.disposition !== 'out-of-scope');

  if (eligible.length === 0) return { ok: true, failures: [], checked: 0 };

  const n = Math.min(5, Math.max(1, Math.ceil(eligible.length * 0.1)));
  const sample = pickRandom(eligible, n);

  // Lazy-load spec files once.
  const specDir = join(REPO_ROOT, 'clients', 'encore', 'tests');
  const specFiles = findSpecFiles(specDir);
  const specContents = specFiles.map(f => {
    try { return readFileSync(f, 'utf-8'); } catch { return ''; }
  });

  const failures = [];
  const TC_RX = /TC-([A-Z]+-[A-Z]+-\d{3})/;

  for (const row of sample) {
    if (row.disposition !== 'covered-by-TC') continue;
    const tcM = row.raw.match(TC_RX);
    if (!tcM) { failures.push(`${row.controlRef}: covered-by-TC but no valid TC id`); continue; }
    const tcId = `TC-${tcM[1]}`;
    const found = specContents.some(content => content.includes(tcId));
    if (!found) {
      failures.push(`${row.controlRef}: TC ${tcId} not found in any spec file`);
    }
  }

  return { ok: failures.length === 0, failures, checked: sample.length };
}
