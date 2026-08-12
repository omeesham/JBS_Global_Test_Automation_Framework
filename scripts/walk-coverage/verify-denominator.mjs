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
import { loadFieldCaseTaxonomy } from './lib/field-case-parser.mjs';
import { computePathA, computePathB, reconcile } from './lib/case-parity.mjs';

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
        // Item 1(c): a resting-only declaration must cite evidence (enumeration run reference).
        // A hand-written justification comment is not evidence.
        const nonResting = requiredStates.filter(s => s.label !== 'resting');
        if (nonResting.length === 0) {
          const restingEntry = requiredStates.find(s => s.label === 'resting');
          if (!restingEntry || !restingEntry.evidence) {
            reasons.push(`RESTING-ONLY TAUTOLOGY: module "${moduleName}" declares only resting as a required state with no evidence citation. Add an 'evidence' field citing the enumeration run that found zero openers.`);
          }
        }
      } else {
        // Item 2: an unregistered module FAILS — unknown module has no verification, which is
        // vacuous-on-zero at the surface level. Never a silent pass.
        reasons.push(`UNREGISTERED MODULE: "${moduleName}" has no entry in MODULE_REQUIRED_STATES — cannot verify required states. Register it in lib/module-config.mjs.`);
      }
    }
  }

  // Item 3: Unresolved-probe ratio becomes a failing condition.
  // Reads unresolved_probe_mode from .claude/guardrail-config.json (announce-first per LR-069 §3.3).
  if (data.derived_types) {
    const allKeys = Object.keys(data.derived_types);
    const unresolvedKeys = allKeys.filter(k => {
      const dt = data.derived_types[k];
      return dt.probe === 'unresolved' || dt.probe === 'unresolvable';
    });
    const total = allKeys.length;
    const unresolvedCount = unresolvedKeys.length;
    if (total > 0) {
      const fraction = unresolvedCount / total;
      // Read threshold from guardrail-config; default 0.5 (50%)
      let unresolvedThreshold = 0.5;
      let unresolvedMode = 'announce';
      try {
        const gcPath = join(REPO_ROOT, '.claude', 'guardrail-config.json');
        if (existsSync(gcPath)) {
          const gc = JSON.parse(readFileSync(gcPath, 'utf-8'));
          if (gc.unresolved_probe_mode) unresolvedMode = gc.unresolved_probe_mode;
          if (typeof gc.unresolved_probe_threshold === 'number') unresolvedThreshold = gc.unresolved_probe_threshold;
        }
      } catch { /* fail-safe to defaults */ }
      if (fraction > unresolvedThreshold) {
        const pct = Math.round(fraction * 100);
        const sample = unresolvedKeys.slice(0, 10).join(', ');
        const msg = `UNRESOLVED-PROBE-RATIO: ${unresolvedCount}/${total} (${pct}%) exceeds threshold ${Math.round(unresolvedThreshold * 100)}%. Offending keys: ${sample}`;
        if (unresolvedMode === 'deny') {
          reasons.push(msg);
        } else {
          // announce mode: report but do not block
          reasons.push(`[ANNOUNCE] ${msg}`);
        }
      }
    }
  }

  // ── Phase 3: two-path denominator parity, tolerance ZERO ────────────────────────────────────
  // Path A (archetype expansion from derived_types × taxonomy) and Path B (census of emitted case
  // rows) are computed independently and must agree EXACTLY. The 37-vs-79 disagreement survived
  // because nobody ever put the two numbers beside each other; both are printed here either way.
  if (data.derived_types) {
    try {
      const taxonomy = loadFieldCaseTaxonomy();
      const pathA = computePathA(data.derived_types, taxonomy);

      // Path B needs the emitter's actual output. Its ABSENCE is a failure, never a skip —
      // "no case rows to compare" is exactly the vacuous-on-zero pass this plan exists to kill.
      const rowsPath = join(REPO_ROOT, 'reports', 'walk-coverage', 'case-rows.json');
      if (!existsSync(rowsPath)) {
        reasons.push(
          `PARITY UNVERIFIABLE: no case-rows artifact at reports/walk-coverage/case-rows.json — ` +
          `run emit-case-rows.mjs --out=<that path>. Path A computed ${pathA.total}; Path B unknown. ` +
          `An unverifiable denominator fails rather than passing silently.`
        );
      } else {
        const raw = JSON.parse(readFileSync(rowsPath, 'utf-8'));
        const rows = Array.isArray(raw) ? raw : (raw.rows || raw.case_rows || []);
        const parity = reconcile(pathA, computePathB(rows));
        console.log(parity.report);
        reasons.push(...parity.reasons);
      }
    } catch (err) {
      // A taxonomy that will not parse means the denominator cannot be computed at all. That is a
      // hard failure: silently continuing would report a verdict on a number nobody produced.
      reasons.push(`PARITY ERROR: ${err.message}`);
    }
  }

  // ── G1 enforcement (PLAN_COVERAGE_TIER_CONTRACT Phase 3.3):
  // A deferred-to-DEEP row may not also carry any classification claim.
  // Deferral + any classification token on the same row = FAIL.
  const CLASSIFICATION_TOKENS = ['read-only-verified', 'affordance-probed', 'covered-by-TC', 'provenance:'];
  const deferralRows = manifestRows.filter(r => r.disposition === 'deferred-to-DEEP');
  for (const row of deferralRows) {
    const raw = (row.raw || '').toLowerCase();
    const clash = CLASSIFICATION_TOKENS.find(t => raw.includes(t.toLowerCase()));
    if (clash) {
      reasons.push(
        `G1 VIOLATION: row "${row.controlRef}" carries deferred-to-DEEP AND classification token "${clash}" — ` +
        `a deferral is "not walked", never "read-only" / "affordance-probed" / "covered"`
      );
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
