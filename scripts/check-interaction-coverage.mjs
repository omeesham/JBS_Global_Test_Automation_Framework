#!/usr/bin/env node
/**
 * scripts/check-interaction-coverage.mjs
 * PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION Phase 3 — Interaction-coverage closure gate.
 *
 * Gate class: S1 (LR-069 §3.1, reconciled 2026-07-25) — fabricated evidence / false-green.
 *   Ramp: announce → deny per guardrail-config.json. Initially proposed as S0 but the owner's
 *   config implements S1 ramp discipline (announce first); S0 requires deny-on-landing.
 *   DOM counts are rendering artifacts (NM-2172). Claim-driven dispositions with no
 *   machine-readable backing reproduce the NM-2011 / 1117 class.
 * Graduating incident: 2026-07-17 Corporate Pricing override walk — five CRUD invariants
 *   existed and none was instantiated on the surface; a dead filter, an error-shown-but-applied
 *   save, a rejected own-export, a DOM-only count, and a claim-driven disposition all shipped
 *   as covered.
 *
 * Validates interaction-map coverage artifacts against the Phase 1 schema.
 * R4 enforcement: every element MUST carry emissionStatus — silence is a schema violation.
 * R3 enforcement: context-selector records MUST cite a secondSource.
 *
 * CLI:
 *   node scripts/check-interaction-coverage.mjs --self-test           → exit 0 on all pass
 *   node scripts/check-interaction-coverage.mjs --file <path.json>    → exit 0/1
 *   node scripts/check-interaction-coverage.mjs --plan <planPath.md>  → exit 0/1
 *
 * ESM, Node >=18. Matches repo script style (check-recurrence-trial.mjs).
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync, readdirSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { resolve, join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const STATE_DIR = join(ROOT, '.claude', 'state');
const GATE_FIRES_LOG = join(STATE_DIR, 'gate-fires.log');
const GATE_NAME = 'check-interaction-coverage';
const SCHEMA_MODULE_PATH = join(__dirname, 'walk-coverage', 'interaction-map-schema.mjs');
const ARTIFACTS_DIR = join(__dirname, 'walk-coverage', 'interaction-maps');

// ── Helpers ─────────────────────────────────────────────────────────────────

function norm(p) { return String(p).replace(/\\/g, '/'); }

// Parses a basis string into { prefix: string|null, content: string }.
// Normalises the prefix to lowercase; requires non-empty content after colon.
// Returns null for non-string input.
function parseBasis(basisStr) {
  if (typeof basisStr !== 'string') return null;
  const trimmed = basisStr.trim();
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx === -1) return { prefix: null, content: trimmed };
  return {
    prefix: trimmed.slice(0, colonIdx).toLowerCase(),
    content: trimmed.slice(colonIdx + 1).trim(),
  };
}

function fireTelemetry(verdict, target) {
  mkdirSync(dirname(GATE_FIRES_LOG), { recursive: true });
  appendFileSync(GATE_FIRES_LOG,
    `${GATE_NAME}, ${new Date().toISOString()}, ${verdict}, ${target}\n`);
}

// ── Schema loading (fail-closed on missing/broken) ──────────────────────────

async function loadSchema() {
  if (!existsSync(SCHEMA_MODULE_PATH)) {
    return {
      ok: false,
      error: `Schema module missing: ${norm(relative(ROOT, SCHEMA_MODULE_PATH))} — fail-closed (gate never ran)`,
    };
  }
  try {
    const mod = await import(`file://${SCHEMA_MODULE_PATH.replace(/\\/g, '/')}`);
    if (typeof mod.validateMap !== 'function' || !Array.isArray(mod.VALID_EMISSION_STATUSES)) {
      return { ok: false, error: 'Schema module loaded but missing expected exports — fail-closed' };
    }
    return { ok: true, mod };
  } catch (err) {
    return { ok: false, error: `Schema module failed to load: ${err.message} — fail-closed` };
  }
}

// ── Core validation ─────────────────────────────────────────────────────────

function validateArtifact(map, schema) {
  const checks = [];
  const { validateMap, VALID_EMISSION_STATUSES } = schema;

  // Null/non-object element guard (controlled failure, no TypeError crash)
  if (Array.isArray(map.elements)) {
    const invalidEls = map.elements.filter(el => !el || typeof el !== 'object');
    if (invalidEls.length > 0) {
      return {
        pass: false,
        checks: [{
          name: 'element-integrity',
          verdict: 'FAIL',
          pass: false,
          reason: `ELEMENT INTEGRITY VIOLATION: ${invalidEls.length} null/non-object element(s) in elements array — crash prevented, controlled failure`,
        }],
      };
    }
  }

  // Degenerate-probe guard: PROBED elements must carry actual probe data
  const degenerateProbeViolations = [];
  if (Array.isArray(map.elements)) {
    for (const el of map.elements) {
      if (el.emissionStatus === 'PROBED') {
        if (!Array.isArray(el.probes) || el.probes.length === 0 ||
            el.probes.some(p => !p || typeof p !== 'object')) {
          degenerateProbeViolations.push(el.elementId || '(unknown)');
        }
      }
    }
  }
  checks.push({
    name: 'degenerate-probe-guard',
    verdict: degenerateProbeViolations.length === 0 ? 'PASS' : 'UNCHECKABLE',
    pass: degenerateProbeViolations.length === 0,
    reason: degenerateProbeViolations.length === 0
      ? 'All PROBED elements carry well-formed probe arrays'
      : `UNCHECKABLE (≠ PASS): ${degenerateProbeViolations.length} PROBED element(s) with missing/empty/malformed probes array — ` +
        `"I probed it" with no probe data is not evidence: [${degenerateProbeViolations.join(', ')}]`,
  });

  // Semantic class invariant (anti-relabeling defense — BLOCKER 1)
  // Evidence on an element must be consistent with its declared class.
  // Mismatches indicate deliberate relabeling to evade oracle scoping → UNCHECKABLE.
  const classMismatches = [];
  if (Array.isArray(map.elements)) {
    for (const el of map.elements) {
      if (el.persistedStateReRead != null && el.class !== 'io') {
        classMismatches.push(el.elementId || '(unknown)');
      } else if ((el.capability === 'export' || el.capability === 'import') && el.class !== 'io') {
        classMismatches.push(el.elementId || '(unknown)');
      } else if (el.secondSource != null && el.class !== 'context-selector') {
        classMismatches.push(el.elementId || '(unknown)');
      } else if (el.class !== 'io' && Array.isArray(el.probes)) {
        // F3 defense: probe action/prose naming io verbs reveals true nature.
        // Where declared class and evidence disagree, trust the evidence.
        const IO_VERB_RE = /\b(?:sav(?:e[ds]?|ing)|persist(?:ed|s|ing)?|commit(?:ted|s|ting)?|export(?:ed|s|ing)?|import(?:ed|s|ing)?|appl(?:y|ied|ies|ying))\b/i;
        const hasIoEvidence = el.probes.some(p => {
          if (!p || typeof p !== 'object') return false;
          for (const [, v] of Object.entries(p)) {
            if (typeof v === 'string' && IO_VERB_RE.test(v)) return true;
          }
          return false;
        });
        if (hasIoEvidence) classMismatches.push(el.elementId || '(unknown)');
      }
    }
  }
  checks.push({
    name: 'semantic-class-invariant',
    verdict: classMismatches.length === 0 ? 'PASS' : 'UNCHECKABLE',
    pass: classMismatches.length === 0,
    reason: classMismatches.length === 0
      ? 'All elements have class consistent with their evidence profile'
      : `UNCHECKABLE (≠ PASS): ${classMismatches.length} element(s) carry evidence inconsistent with declared class — ` +
        `class labels cannot hide a row's true nature: [${classMismatches.join(', ')}]`,
  });

  // R4: every element must carry emissionStatus (anti-silence)
  const r4Violations = [];
  if (Array.isArray(map.elements)) {
    for (const el of map.elements) {
      if (!el.emissionStatus || !VALID_EMISSION_STATUSES.includes(el.emissionStatus)) {
        r4Violations.push(el.elementId || '(unknown)');
      }
    }
  }
  checks.push({
    name: 'R4-anti-silence',
    pass: r4Violations.length === 0,
    reason: r4Violations.length === 0
      ? 'All elements carry emissionStatus'
      : `R4 VIOLATION: ${r4Violations.length} element(s) missing/invalid emissionStatus: [${r4Violations.join(', ')}]`,
  });

  // R3: context-selector must cite secondSource
  const r3Violations = [];
  if (Array.isArray(map.elements)) {
    for (const el of map.elements) {
      if (el.class === 'context-selector') {
        if (!el.secondSource || typeof el.secondSource !== 'object' ||
            !el.secondSource.type?.trim() || !el.secondSource.ref?.trim()) {
          r3Violations.push(el.elementId || '(unknown)');
        }
      }
    }
  }
  checks.push({
    name: 'R3-second-source',
    pass: r3Violations.length === 0,
    reason: r3Violations.length === 0
      ? 'All context-selector elements cite secondSource'
      : `R3 VIOLATION: ${r3Violations.length} context-selector(s) missing secondSource: [${r3Violations.join(', ')}]`,
  });

  // Zero-effect / differential-data (1222 class): a control whose toggle produces
  // no observable delta must reach DIFFERENTIAL-DATA-REQUIRED and fire the data ladder.
  // A zero-delta row without that disposition fails closed.
  const zeroEffectViolations = [];
  if (Array.isArray(map.elements)) {
    for (const el of map.elements) {
      if (el.effectObserved === false) {
        if (el.disposition !== 'DIFFERENTIAL-DATA-REQUIRED') {
          zeroEffectViolations.push(el.elementId || '(unknown)');
        }
      }
    }
  }
  checks.push({
    name: 'zero-effect-disposition',
    pass: zeroEffectViolations.length === 0,
    reason: zeroEffectViolations.length === 0
      ? 'All zero-effect elements carry DIFFERENTIAL-DATA-REQUIRED disposition'
      : `ZERO-EFFECT VIOLATION: ${zeroEffectViolations.length} element(s) with effectObserved:false lack DIFFERENTIAL-DATA-REQUIRED disposition: [${zeroEffectViolations.join(', ')}]`,
  });

  // Unclassified-element guard: any element carrying UNCLASSIFIED in class, emissionStatus,
  // or disposition is an unclassifiable control — a loud unknown that blocks closure.
  // Field-case-generation.md §5: UNCLASSIFIED must never pass silently.
  {
    const unclassifiedEls = [];
    if (Array.isArray(map.elements)) {
      for (const el of map.elements) {
        if (el.class === 'UNCLASSIFIED' ||
            el.emissionStatus === 'UNCLASSIFIED' ||
            el.disposition === 'UNCLASSIFIED') {
          unclassifiedEls.push(el.elementId || '(unknown)');
        }
      }
    }
    checks.push({
      name: 'unclassified-element',
      verdict: unclassifiedEls.length === 0 ? 'PASS' : 'FAIL',
      pass: unclassifiedEls.length === 0,
      reason: unclassifiedEls.length === 0
        ? 'No UNCLASSIFIED elements — extractor classified all controls'
        : `UNCLASSIFIED VIOLATION: ${unclassifiedEls.length} element(s) carry UNCLASSIFIED — ` +
          `unclassifiable controls block closure; each must be resolved before this map closes: ` +
          `[${unclassifiedEls.join(', ')}]`,
    });
  }

  // Oracle 2 — ui-vs-persisted-parity (NM-2186 class)
  // Evidence-keyed: any PROBED element carrying persistedStateReRead claims persistence,
  // regardless of declared class (semantic invariant prevents class-relabeling escape).
  // COMMIT-probe: re-read must show state landed. DISCARD-probe: re-read must show nothing persisted.
  // Precedence within this oracle: FAIL > UNCHECKABLE > PASS.
  //
  // UNCHECKABLE (≠ PASS) when, for a persistence-claiming PROBED element:
  //   - persistedStateReRead is absent, null, or not an object
  //   - persistedStateReRead.agrees is absent, wrong type (e.g. string "false"), or any non-boolean
  //   - probeType is 'DISCARD' but nothingPersisted is not explicitly true
  //
  // FAIL when ANY element (regardless of class) carries persistedStateReRead.agrees === false.
  // A misclassified save-probe still reports disagreement; element class must not hide the violation.
  {
    const allElements = Array.isArray(map.elements) ? map.elements : [];
    // Evidence-based filter: includes io/PROBED AND any PROBED element with persistedStateReRead
    const ioProbed = allElements.filter(el =>
      el.emissionStatus === 'PROBED' && (el.class === 'io' || el.persistedStateReRead != null)
    );

    // UNCHECKABLE class 1: io/PROBED elements with absent or malformed persistedStateReRead.
    // Covers: absent, null, non-object, empty object {}, missing agrees key, wrong-type agrees.
    const missing = ioProbed.filter(el => {
      if (!el.persistedStateReRead || typeof el.persistedStateReRead !== 'object') return true;
      if (typeof el.persistedStateReRead.agrees !== 'boolean') return true;
      return false;
    });

    // UNCHECKABLE class 2: io/PROBED DISCARD probes without explicit nothingPersisted:true.
    // A DISCARD probe claims nothing was saved; the oracle must verify the inverse, not assume it.
    // agrees:true alone is not proof — nothingPersisted:true is required to settle the claim.
    const discardUncheckable = ioProbed.filter(el =>
      el.persistedStateReRead &&
      typeof el.persistedStateReRead === 'object' &&
      typeof el.persistedStateReRead.agrees === 'boolean' &&
      el.persistedStateReRead.agrees === true &&
      el.persistedStateReRead.probeType === 'DISCARD' &&
      el.persistedStateReRead.nothingPersisted !== true
    );

    // FAIL: ANY element (regardless of class) with persistedStateReRead.agrees === false.
    // Literal boolean false only — string "false" is UNCHECKABLE (wrong type), not FAIL.
    const disagree = allElements.filter(el =>
      el.persistedStateReRead &&
      typeof el.persistedStateReRead === 'object' &&
      el.persistedStateReRead.agrees === false
    );

    if (disagree.length > 0) {
      checks.push({
        name: 'ui-vs-persisted-parity',
        verdict: 'FAIL',
        pass: false,
        reason: `UI-VS-PERSISTED VIOLATION: ${disagree.length} suspicion row(s) — ` +
          `UI claim and persisted state disagree: [${disagree.map(e => e.elementId || '(unknown)').join(', ')}]`,
      });
    } else if (missing.length > 0 || discardUncheckable.length > 0) {
      const uncheckableEls = [...missing, ...discardUncheckable];
      checks.push({
        name: 'ui-vs-persisted-parity',
        verdict: 'UNCHECKABLE',
        pass: false,
        reason: `UNCHECKABLE (≠ PASS): ${uncheckableEls.length} io/PROBED element(s) missing or malformed persistedStateReRead — ` +
          `field absent from this artifact; oracle cannot verify parity without it: [${uncheckableEls.map(e => e.elementId || '(unknown)').join(', ')}]`,
      });
    } else {
      checks.push({
        name: 'ui-vs-persisted-parity',
        verdict: 'PASS',
        pass: true,
        reason: ioProbed.length === 0
          ? 'No io/PROBED elements — oracle 2 does not apply'
          : 'All io/PROBED elements carry persistedStateReRead with agreeing claims',
      });
    }
  }

  // Oracle 3 — round-trip-invariant (NM-1940 class)
  // Evidence-keyed: any element with capability field indicates io nature regardless of class.
  // UNCHECKABLE (≠ PASS) when io elements lack capability field AND the surface shows export/import evidence.
  // FAIL when export+import pair exists with no roundTripDisposition.
  // Save-only surfaces (no capability anywhere) → oracle N/A, PASS (no false positive).
  {
    const allElements = Array.isArray(map.elements) ? map.elements : [];
    // Evidence-based: elements with capability field OR class='io' are io-like
    const ioLikeEls = allElements.filter(el => el.class === 'io' || el.capability);
    const hasAnyCap = ioLikeEls.some(el => el.capability);
    const ioWithoutCap = ioLikeEls.filter(el => !el.capability);

    // Only require capability when the surface shows evidence of export/import activity
    if (ioLikeEls.length > 0 && ioWithoutCap.length > 0 && hasAnyCap) {
      checks.push({
        name: 'round-trip-invariant',
        verdict: 'UNCHECKABLE',
        pass: false,
        reason: `UNCHECKABLE (≠ PASS): ${ioWithoutCap.length} io element(s) missing capability field — ` +
          `field absent from this artifact; cannot determine export+import pairing: [${ioWithoutCap.map(e => e.elementId || '(unknown)').join(', ')}]`,
      });
    } else {
      const hasExport = ioLikeEls.some(el => el.capability === 'export');
      const hasImport = ioLikeEls.some(el => el.capability === 'import');
      const exportImportEls = ioLikeEls.filter(el => el.capability === 'export' || el.capability === 'import');
      const hasRoundTrip = exportImportEls.some(
        el => typeof el.roundTripDisposition === 'string' && el.roundTripDisposition.trim()
      );

      if (hasExport && hasImport && !hasRoundTrip) {
        checks.push({
          name: 'round-trip-invariant',
          verdict: 'FAIL',
          pass: false,
          reason: 'ROUND-TRIP VIOLATION: surface exposes both export and import io elements but no roundTripDisposition — rejection of own output = suspicion',
        });
      } else {
        checks.push({
          name: 'round-trip-invariant',
          verdict: 'PASS',
          pass: true,
          reason: (hasExport && hasImport)
            ? 'Export+import pair found with roundTripDisposition — invariant satisfied'
            : 'No export+import pair on this surface — oracle 3 does not apply',
        });
      }
    }
  }

  // Oracle 4 — count-source (NM-2172 virtualization)
  // Row/list counts must assert against API response or footer total, NEVER DOM node count.
  // countSource lives in probe.after — not a top-level element field.
  // FAIL: any probe.after has countSource starting with "dom:" (DOM count = invalid probe).
  // UNCHECKABLE: probe has count-related keys (matching /[Cc]ount$/) but no countSource recorded.
  // PASS: no count-claiming probes found, or all recorded sources are non-dom.
  {
    const allElements = Array.isArray(map.elements) ? map.elements : [];
    const countFails = [];
    const countRequestFailed = [];
    const countUncheckable = [];

    function probeHasCountKeys(probe) {
      // Detects count observations by key name — case-insensitive, recursive.
      // Covers explicit aliases (numRows, total, rowTotal, itemsFound, records) and
      // any key containing "count" (e.g. rowCount, recordCount_v2, domRowCount).
      // Recursion catches counts nested deeper than probe.before/after top-level.
      const COUNT_RE = /count/i;
      const COUNT_ALIAS_RE = /^(numrows?|total|rowtotal|itemsfound|records?)$/i;
      function hasCountKey(obj) {
        if (!obj || typeof obj !== 'object') return false;
        for (const [k, v] of Object.entries(obj)) {
          if (COUNT_RE.test(k) || COUNT_ALIAS_RE.test(k)) return true;
          if (v && typeof v === 'object' && hasCountKey(v)) return true;
        }
        return false;
      }
      return hasCountKey(probe.before) || hasCountKey(probe.after);
    }

    for (const el of allElements) {
      if (!Array.isArray(el.probes)) continue;
      let elFail = false, elUncheckable = false, elRequestFailed = false;
      for (const probe of el.probes) {
        const after = probe.after;
        if (!after || typeof after !== 'object') continue;
        if ('countSource' in after) {
          const src = after.countSource;
          if (typeof src === 'string') {
            const normSrc = src.trim().toLowerCase();
            if (normSrc.startsWith('dom:') || normSrc.startsWith('dom-')) {
              // DOM prefix (exact) or prefix-adjacent bypass (dom-api:, etc.) → invalid probe
              elFail = true;
              break;
            }
            if (/\bfrom\s+dom\b/.test(normSrc)) {
              // Source explicitly annotates DOM-derived data — contradictory claim; UNCHECKABLE.
              elUncheckable = true;
            } else {
              // Allowlist: only demonstrably valid sources pass (api:, footer:)
              const VALID_SOURCE_PREFIXES = ['api:', 'footer:'];
              if (!normSrc || !VALID_SOURCE_PREFIXES.some(p => normSrc.startsWith(p))) {
                elUncheckable = true; // unrecognized source — absence of proof ≠ proof of validity
              } else {
                // F1 defense: prefix says intent, content says truth.
                // DOM API tokens in the value override a valid prefix — fail closed.
                const DOM_CONTENT_RE = /queryselector|document\.|getelement|innertext|\.rows\b|childnodes/;
                if (DOM_CONTENT_RE.test(normSrc)) {
                  elUncheckable = true;
                } else {
                  // HTTP status precondition: a count taken while the request was failing is not
                  // a measurement. Absent status is not evidence of success — fail conservatively.
                  const httpStat = after.httpStatus;
                  if (httpStat === undefined || httpStat === null) {
                    elUncheckable = true; // absent status → UNCHECKABLE
                  } else if (typeof httpStat === 'number' && httpStat >= 200 && httpStat < 300) {
                    // 2xx → valid observation; count source accepted
                  } else {
                    elRequestFailed = true; // non-2xx → REQUEST-FAILED
                    break;
                  }
                }
              }
            }
          } else {
            elUncheckable = true; // non-string countSource; cannot classify
          }
        } else if (probeHasCountKeys(probe)) {
          elUncheckable = true;
        }
      }
      const id = el.elementId || '(unknown)';
      if (elFail) countFails.push(id);
      else if (elRequestFailed) countRequestFailed.push(id);
      else if (elUncheckable) countUncheckable.push(id);
    }

    if (countFails.length > 0) {
      checks.push({
        name: 'count-source',
        verdict: 'FAIL',
        pass: false,
        reason: `COUNT-SOURCE VIOLATION: ${countFails.length} element(s) use DOM node counts — ` +
          `virtualized grids render ~2 rows regardless of real total; DOM count is a rendering artifact, not a count: ` +
          `[${countFails.join(', ')}]`,
      });
    } else if (countRequestFailed.length > 0) {
      checks.push({
        name: 'count-source',
        verdict: 'REQUEST-FAILED',
        pass: false,
        reason: `REQUEST-FAILED: ${countRequestFailed.length} element(s) have count observations sourced from a failed request (non-2xx status) — ` +
          `a count taken while the underlying request was failing is not a measurement; zero-delta from two failed counts is not evidence about the control: ` +
          `[${countRequestFailed.join(', ')}]`,
      });
    } else if (countUncheckable.length > 0) {
      checks.push({
        name: 'count-source',
        verdict: 'UNCHECKABLE',
        pass: false,
        reason: `UNCHECKABLE (≠ PASS): ${countUncheckable.length} element(s) record count data without a countSource field — ` +
          `absence of a source is not proof of a good source: [${countUncheckable.join(', ')}]`,
      });
    } else {
      checks.push({
        name: 'count-source',
        verdict: 'PASS',
        pass: true,
        reason: 'No DOM-only count evidence found — all count sources are valid or no count-claiming probes present',
      });
    }
  }

  // Oracle 5 — claim-census (1117 + NM-2011)
  // Basis prefix is normalised to lowercase — CLAIM:x is treated as claim:x (no case escape).
  // Known prefixes: observed | claim | census. Empty content after colon → UNCHECKABLE.
  // Census validation: content non-empty AND artifact must exist on disk.
  // Per-claim binding requires a schema-level link field (not present); document-level
  // binding is implemented: any valid census in the map corroborates claims on the same surface.
  {
    const KNOWN_PREFIXES = ['observed', 'claim', 'census'];
    const allElements = Array.isArray(map.elements) ? map.elements : [];
    const claimEls = [];
    const uncheckableBasisEls = [];
    let hasValidCensus = false;
    const validCensusEntries = [];

    for (const el of allElements) {
      const parsed = parseBasis(el.basis);
      if (!parsed) continue; // non-string basis — schema validation handles it
      const { prefix, content } = parsed;
      if (prefix === null || !KNOWN_PREFIXES.includes(prefix)) {
        if (el.basis && String(el.basis).trim()) uncheckableBasisEls.push(el);
        continue;
      }
      if (!content) {
        uncheckableBasisEls.push(el); // known prefix but nothing after colon → UNCHECKABLE
        continue;
      }
      if (prefix === 'claim') {
        claimEls.push(el);
      } else if (prefix === 'census') {
        // Census must resolve, have meaningful content, and bind to claims on this surface.
        const absPath = existsSync(content) ? content :
          existsSync(resolve(ROOT, content)) ? resolve(ROOT, content) : null;
        if (!absPath) {
          uncheckableBasisEls.push(el); // census artifact missing
          continue;
        }
        let censusContent;
        try { censusContent = readFileSync(absPath, 'utf-8'); } catch {
          uncheckableBasisEls.push(el); continue;
        }
        if (!censusContent.trim()) { uncheckableBasisEls.push(el); continue; }
        // Reject known non-census formats (package manifests, configs)
        let isUnrelatedFormat = false;
        try {
          const j = JSON.parse(censusContent);
          if (j && typeof j === 'object' &&
              ('dependencies' in j || 'devDependencies' in j || 'scripts' in j)) {
            isUnrelatedFormat = true;
          }
        } catch { /* not JSON — fine for text census */ }
        if (isUnrelatedFormat) { uncheckableBasisEls.push(el); continue; }
        // Binding: path or content must relate to census/evidence/surface
        const surfaceName = (map.surface || '').toLowerCase();
        const cl = censusContent.toLowerCase();
        const pl = content.toLowerCase();
        const bound =
          pl.includes('census') || pl.includes('verify') || pl.includes('evidence') || pl.includes('walk') ||
          cl.includes('census') || cl.includes('verified') || cl.includes('confirmed') ||
          (surfaceName.length > 3 && cl.includes(surfaceName));
        if (bound) { validCensusEntries.push({ el, content: censusContent }); }
        else { uncheckableBasisEls.push(el); }
      }
      // observed: with non-empty content → valid, no tracking needed
    }

    // F2 defense: census must demonstrably link to claim subjects.
    // An artifact that does not mention what the claim is about corroborates nothing.
    if (validCensusEntries.length > 0) {
      if (claimEls.length > 0) {
        const claimSubjectTokens = new Set();
        for (const cel of claimEls) {
          const p = parseBasis(cel.basis);
          if (p && p.content) {
            for (const tok of p.content.toLowerCase().split(/[-_\s.,;:\/]+/)) {
              if (tok.length > 2) claimSubjectTokens.add(tok);
            }
          }
        }
        for (const { el: censusEl, content: cc } of validCensusEntries) {
          const ccl = cc.toLowerCase();
          const linked = [...claimSubjectTokens].some(tok => ccl.includes(tok));
          if (linked) { hasValidCensus = true; }
          else { uncheckableBasisEls.push(censusEl); }
        }
      } else {
        hasValidCensus = true;
      }
    }

    const isFail = claimEls.length > 0 && !hasValidCensus;
    const isUncheckable = !isFail && uncheckableBasisEls.length > 0;

    if (isFail) {
      checks.push({
        name: 'claim-census',
        verdict: 'FAIL',
        pass: false,
        reason: `CLAIM-CENSUS VIOLATION: ${claimEls.length} element(s) carry claim-sourced dispositions with no valid census evidence — ` +
          `external claims must be verified against machine-readable data before steering a disposition: ` +
          `[${claimEls.map(e => e.elementId || '(unknown)').join(', ')}]`,
      });
    } else if (isUncheckable) {
      checks.push({
        name: 'claim-census',
        verdict: 'UNCHECKABLE',
        pass: false,
        reason: `UNCHECKABLE (≠ PASS): ${uncheckableBasisEls.length} element(s) carry an invalid or unresolvable basis — ` +
          `expected observed:|claim:|census: with non-empty content, census artifacts must exist on disk: ` +
          `[${uncheckableBasisEls.map(e => e.elementId || '(unknown)').join(', ')}]`,
      });
    } else {
      checks.push({
        name: 'claim-census',
        verdict: 'PASS',
        pass: true,
        reason: claimEls.length === 0
          ? 'No claim-sourced dispositions — oracle 5 does not apply'
          : `${claimEls.length} claim(s) corroborated by verified census artifact(s)`,
      });
    }
  }

  // Full schema validation (catches structural issues beyond R3/R4)
  const schemaResult = validateMap(map);
  checks.push({
    name: 'schema-valid',
    pass: schemaResult.valid,
    reason: schemaResult.summary,
  });

  return { pass: checks.every(c => c.pass), checks };
}

// ── --file mode ─────────────────────────────────────────────────────────────

async function checkFile(filePath) {
  const absPath = resolve(filePath);

  if (!existsSync(absPath)) {
    return {
      pass: false,
      checks: [{
        name: 'artifact-exists',
        pass: false,
        reason: `Coverage artifact missing: ${filePath} — fail-closed (gate cannot validate what it cannot read)`,
      }],
    };
  }

  const schemaResult = await loadSchema();
  if (!schemaResult.ok) {
    return { pass: false, checks: [{ name: 'schema-load', pass: false, reason: schemaResult.error }] };
  }

  let map;
  try {
    const raw = readFileSync(absPath, 'utf-8');
    map = JSON.parse(raw);
  } catch (err) {
    return {
      pass: false,
      checks: [{
        name: 'artifact-parse',
        pass: false,
        reason: `Coverage artifact unreadable: ${err.message} — fail-closed`,
      }],
    };
  }

  return validateArtifact(map, schemaResult.mod);
}

// ── --plan mode ─────────────────────────────────────────────────────────────

async function checkPlan(planPath, { artifactsDir } = {}) {
  const targetDir = artifactsDir || ARTIFACTS_DIR;
  const schemaResult = await loadSchema();
  if (!schemaResult.ok) {
    return { pass: false, checks: [{ name: 'schema-load', pass: false, reason: schemaResult.error }] };
  }

  // Three mechanically distinct states for the artifacts directory.
  // R4 rationale: silence must be distinguishable from "checked, found nothing."

  // State 1: Directory absent — no walk work produced artifacts for this plan.
  if (!existsSync(targetDir)) {
    return {
      pass: true,
      checks: [{
        name: 'artifacts-dir-absent',
        pass: true,
        reason: `Artifacts directory does not exist: ${norm(relative(ROOT, targetDir))} — no walk work produced artifacts for this plan`,
      }],
    };
  }

  // State 3: Directory unreadable — fail-closed (no bare catch).
  let dirEntries;
  try {
    dirEntries = readdirSync(targetDir);
  } catch (err) {
    return {
      pass: false,
      checks: [{
        name: 'artifacts-dir-unreadable',
        pass: false,
        reason: `Artifacts directory unreadable: ${norm(relative(ROOT, targetDir))} — ${err.code || err.message} — fail-closed (gate cannot validate what it cannot read)`,
      }],
    };
  }

  // State 2: Directory present but empty — a walk ran and produced nothing.
  const artifactFiles = dirEntries
    .filter(f => f.endsWith('.json'))
    .map(f => join(targetDir, f));

  if (artifactFiles.length === 0) {
    return {
      pass: false,
      checks: [{
        name: 'artifacts-dir-empty',
        pass: false,
        reason: `Artifacts directory present but contains no .json files: ${norm(relative(ROOT, targetDir))} — walk produced no coverage artifacts`,
      }],
    };
  }

  // Validate each artifact
  const allChecks = [];
  let allPass = true;
  for (const ap of artifactFiles) {
    let map;
    try {
      map = JSON.parse(readFileSync(ap, 'utf-8'));
    } catch (err) {
      allChecks.push({
        name: `parse:${basename(ap)}`,
        pass: false,
        reason: `Unreadable: ${err.message} — fail-closed`,
      });
      allPass = false;
      continue;
    }
    const result = validateArtifact(map, schemaResult.mod);
    for (const c of result.checks) {
      allChecks.push({ ...c, name: `${basename(ap)}:${c.name}` });
    }
    if (!result.pass) allPass = false;
  }

  return { pass: allPass, checks: allChecks };
}

// ── Self-test ───────────────────────────────────────────────────────────────

async function selfTest() {
  const schemaResult = await loadSchema();
  if (!schemaResult.ok) {
    console.error(`VERDICT: FAIL — ${schemaResult.error}`);
    process.exit(1);
  }

  let total = 0, fails = 0;

  function assert(cond, label) {
    total++;
    if (cond) {
      console.log(`  PASS: ${label}`);
    } else {
      fails++;
      console.error(`  ** FAIL **: ${label}`);
    }
  }

  // T1: Valid artifact passes
  console.log('\n=== T1: Valid artifact ===');
  const validMap = {
    version: '1.0.0', surface: 'test-surface',
    elements: [
      { elementId: 'active-filter', class: 'filter', emissionStatus: 'PROBED',
        probes: [{ action: 'toggle' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt' },
      { elementId: 'office-selector', class: 'context-selector', emissionStatus: 'PROBED',
        probes: [{ action: 'select' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        secondSource: { type: 'api-list', ref: 'GET /api/offices' } },
    ],
  };
  const r1 = validateArtifact(validMap, schemaResult.mod);
  assert(r1.pass, 'Valid map with R4+R3 satisfied → PASS');

  // T2: R4 violation (missing emissionStatus)
  console.log('\n=== T2: R4 violation (missing emissionStatus) ===');
  const r4Map = {
    version: '1.0.0', surface: 'test',
    elements: [{ elementId: 'broken-filter', class: 'filter',
      disposition: 'COVERED', basis: 'observed:walk.txt' }],
  };
  const r2 = validateArtifact(r4Map, schemaResult.mod);
  assert(!r2.pass, 'Missing emissionStatus → FAIL');
  assert(r2.checks.some(c => c.name === 'R4-anti-silence' && !c.pass), 'R4-anti-silence check fails');

  // T3: R3 violation (missing secondSource on context-selector)
  console.log('\n=== T3: R3 violation (missing secondSource) ===');
  const r3Map = {
    version: '1.0.0', surface: 'test',
    elements: [{ elementId: 'office-selector', class: 'context-selector', emissionStatus: 'PROBED',
      probes: [{ action: 'select' }], effectObserved: true,
      disposition: 'COVERED', basis: 'observed:walk.txt' }],
  };
  const r3 = validateArtifact(r3Map, schemaResult.mod);
  assert(!r3.pass, 'Missing secondSource → FAIL');
  assert(r3.checks.some(c => c.name === 'R3-second-source' && !c.pass), 'R3-second-source check fails');

  // T4: Both R4 + R3 violations named individually
  console.log('\n=== T4: Both R4 + R3 violations ===');
  const bothMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'no-emission', class: 'filter', disposition: 'COVERED', basis: 'observed:walk.txt' },
      { elementId: 'no-source', class: 'context-selector', emissionStatus: 'PROBED',
        probes: [{ action: 'select' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt' },
    ],
  };
  const r4 = validateArtifact(bothMap, schemaResult.mod);
  assert(!r4.pass, 'Both violations → FAIL');
  assert(r4.checks.some(c => c.name === 'R4-anti-silence' && !c.pass), 'R4 violation named individually');
  assert(r4.checks.some(c => c.name === 'R3-second-source' && !c.pass), 'R3 violation named individually');

  // T5: Missing artifact file → fail-closed
  console.log('\n=== T5: Missing artifact (fail-closed) ===');
  const r5 = await checkFile(join(ROOT, 'nonexistent', 'artifact.json'));
  assert(!r5.pass, 'Missing artifact → FAIL');
  assert(r5.checks[0].reason.includes('fail-closed'), 'Names fail-closed');

  // T6: Malformed JSON → fail-closed
  console.log('\n=== T6: Malformed artifact (fail-closed) ===');
  const tmpDir = join(STATE_DIR, 'tmp');
  mkdirSync(tmpDir, { recursive: true });
  const badPath = join(tmpDir, `bad-artifact-${Date.now()}.json`);
  writeFileSync(badPath, '{ not valid json !!!');
  const r6 = await checkFile(badPath);
  assert(!r6.pass, 'Malformed JSON → FAIL');
  assert(r6.checks[0].reason.includes('fail-closed'), 'Names fail-closed');
  try { unlinkSync(badPath); } catch { /* cleanup */ }

  // T7: --plan with absent artifacts dir → explicit PASS with distinct name
  console.log('\n=== T7: Plan with absent artifacts dir → PASS (named) ===');
  const r7 = await checkPlan(join(ROOT, 'plans', 'pending', 'any-plan.md'));
  assert(r7.pass, 'Absent artifacts dir → PASS');
  assert(r7.checks[0].name === 'artifacts-dir-absent', 'Named outcome: artifacts-dir-absent');
  assert(r7.checks[0].reason.includes('does not exist'), 'Reason names the absent state');

  // T8: --plan with empty artifacts dir → FAIL
  console.log('\n=== T8: Plan with empty artifacts dir → FAIL ===');
  const emptyDir = join(tmpDir, `empty-artifacts-${Date.now()}`);
  mkdirSync(emptyDir, { recursive: true });
  const r8 = await checkPlan(join(ROOT, 'plans', 'pending', 'any-plan.md'), { artifactsDir: emptyDir });
  assert(!r8.pass, 'Empty artifacts dir → FAIL');
  assert(r8.checks[0].name === 'artifacts-dir-empty', 'Named outcome: artifacts-dir-empty');
  assert(r8.checks[0].reason.includes('no .json files'), 'Reason names the empty state');
  try { rmdirSync(emptyDir); } catch { /* cleanup */ }

  // T9: --plan with unreadable artifacts dir → fail-closed
  console.log('\n=== T9: Plan with unreadable artifacts dir → fail-closed ===');
  const unreadablePath = join(tmpDir, `unreadable-sim-${Date.now()}`);
  writeFileSync(unreadablePath, 'not-a-directory');
  const r9 = await checkPlan(join(ROOT, 'plans', 'pending', 'any-plan.md'), { artifactsDir: unreadablePath });
  assert(!r9.pass, 'Unreadable artifacts dir → FAIL');
  assert(r9.checks[0].name === 'artifacts-dir-unreadable', 'Named outcome: artifacts-dir-unreadable');
  assert(r9.checks[0].reason.includes('fail-closed'), 'Names fail-closed');
  assert(r9.checks[0].reason.includes(norm(relative(ROOT, unreadablePath))), 'Names the path');
  try { unlinkSync(unreadablePath); } catch { /* cleanup */ }

  // T10: Three states produce three DIFFERENT named outcomes
  console.log('\n=== T10: Three states are mechanically distinct ===');
  const stateNames = new Set([r7.checks[0].name, r8.checks[0].name, r9.checks[0].name]);
  assert(stateNames.size === 3, 'All three outcomes have distinct names');
  const stateReasons = new Set([r7.checks[0].reason, r8.checks[0].reason, r9.checks[0].reason]);
  assert(stateReasons.size === 3, 'All three outcomes have distinct reason strings');

  // T11: Zero-effect element without DIFFERENTIAL-DATA-REQUIRED → FAIL
  console.log('\n=== T11: Zero-effect without DIFFERENTIAL-DATA-REQUIRED → FAIL ===');
  const zeroEffectMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'active-filter', class: 'filter', emissionStatus: 'PROBED',
        probes: [{ action: 'toggle' }], effectObserved: false,
        disposition: 'COVERED', basis: 'observed:walk.txt' },
    ],
  };
  const r11 = validateArtifact(zeroEffectMap, schemaResult.mod);
  assert(!r11.pass, 'Zero-effect with COVERED disposition → FAIL');
  assert(r11.checks.some(c => c.name === 'zero-effect-disposition' && !c.pass), 'zero-effect-disposition check fails');

  // T12: Zero-effect element WITH DIFFERENTIAL-DATA-REQUIRED → check passes
  console.log('\n=== T12: Zero-effect with DIFFERENTIAL-DATA-REQUIRED → zero-effect check passes ===');
  const zeroEffectOkMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'active-filter', class: 'filter', emissionStatus: 'PROBED',
        probes: [{ action: 'toggle' }], effectObserved: false,
        disposition: 'DIFFERENTIAL-DATA-REQUIRED', basis: 'observed:walk.txt' },
    ],
  };
  const r12 = validateArtifact(zeroEffectOkMap, schemaResult.mod);
  assert(r12.checks.find(c => c.name === 'zero-effect-disposition').pass, 'Zero-effect with DIFFERENTIAL-DATA-REQUIRED → zero-effect check passes');

  // T13: Oracle 2 RED — io/PROBED missing persistedStateReRead → UNCHECKABLE (not PASS)
  console.log('\n=== T13: Oracle 2 — io/PROBED missing persistedStateReRead → UNCHECKABLE ===');
  const o2MissingMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'save-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt' },
    ],
  };
  const r13 = validateArtifact(o2MissingMap, schemaResult.mod);
  assert(!r13.pass, 'io/PROBED without persistedStateReRead → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r13.checks.some(c => c.name === 'ui-vs-persisted-parity' && c.verdict === 'UNCHECKABLE'),
    'ui-vs-persisted-parity verdict is UNCHECKABLE');

  // T14: Oracle 2 RED — persistedStateReRead.agrees=false → FAIL (suspicion row)
  console.log('\n=== T14: Oracle 2 — persistedStateReRead disagrees → FAIL ===');
  const o2DisagreeMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'save-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: false, note: 'UI said saved but reload shows old value' } },
    ],
  };
  const r14 = validateArtifact(o2DisagreeMap, schemaResult.mod);
  assert(!r14.pass, 'io/PROBED with persistedStateReRead.agrees=false → FAIL (suspicion row)');
  assert(r14.checks.some(c => c.name === 'ui-vs-persisted-parity' && c.verdict === 'FAIL'),
    'ui-vs-persisted-parity verdict is FAIL for suspicion row');

  // T15: Oracle 2 GREEN — persistedStateReRead.agrees=true → oracle passes
  console.log('\n=== T15: Oracle 2 — persistedStateReRead agrees → ui-vs-persisted-parity PASS ===');
  const o2AgreeMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'save-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true, note: 'Reload confirmed state landed' } },
    ],
  };
  const r15 = validateArtifact(o2AgreeMap, schemaResult.mod);
  assert(r15.checks.find(c => c.name === 'ui-vs-persisted-parity').pass,
    'io/PROBED with persistedStateReRead.agrees=true → ui-vs-persisted-parity passes');

  // T16: Oracle 3 RED — export+import io with no roundTripDisposition → FAIL
  console.log('\n=== T16: Oracle 3 — export+import without roundTripDisposition → FAIL ===');
  const o3FailMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'export-btn', class: 'io', emissionStatus: 'PROBED', capability: 'export',
        probes: [{ action: 'click-export' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true } },
      { elementId: 'import-btn', class: 'io', emissionStatus: 'PROBED', capability: 'import',
        probes: [{ action: 'click-import' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true } },
    ],
  };
  const r16 = validateArtifact(o3FailMap, schemaResult.mod);
  assert(!r16.pass, 'export+import io with no roundTripDisposition → FAIL');
  assert(r16.checks.some(c => c.name === 'round-trip-invariant' && c.verdict === 'FAIL'),
    'round-trip-invariant verdict is FAIL for missing roundTripDisposition');

  // T17: Oracle 3 GREEN — export+import io WITH roundTripDisposition → oracle passes
  console.log('\n=== T17: Oracle 3 — export+import with roundTripDisposition → round-trip-invariant PASS ===');
  const o3PassMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'export-btn', class: 'io', emissionStatus: 'PROBED', capability: 'export',
        probes: [{ action: 'click-export' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true },
        roundTripDisposition: 'ACCEPTED' },
      { elementId: 'import-btn', class: 'io', emissionStatus: 'PROBED', capability: 'import',
        probes: [{ action: 'click-import' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true } },
    ],
  };
  const r17 = validateArtifact(o3PassMap, schemaResult.mod);
  assert(r17.checks.find(c => c.name === 'round-trip-invariant').pass,
    'export+import io with roundTripDisposition=ACCEPTED → round-trip-invariant passes');

  // T18: B3.1 — persistedStateReRead empty object {} → oracle 2 UNCHECKABLE (not PASS)
  console.log('\n=== T18: Oracle 2 — persistedStateReRead empty object → UNCHECKABLE ===');
  const o2EmptyObjMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'save-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: {} },
    ],
  };
  const r18 = validateArtifact(o2EmptyObjMap, schemaResult.mod);
  assert(!r18.pass, 'io/PROBED with empty persistedStateReRead {} → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r18.checks.some(c => c.name === 'ui-vs-persisted-parity' && c.verdict === 'UNCHECKABLE'),
    'ui-vs-persisted-parity is UNCHECKABLE for empty persistedStateReRead — agrees missing, type wrong');

  // T19: B3.2 — agrees key missing → oracle 2 UNCHECKABLE (not PASS)
  console.log('\n=== T19: Oracle 2 — persistedStateReRead missing agrees key → UNCHECKABLE ===');
  const o2NoAgreesMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'save-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { note: 'forgot to set agrees field' } },
    ],
  };
  const r19 = validateArtifact(o2NoAgreesMap, schemaResult.mod);
  assert(!r19.pass, 'io/PROBED with persistedStateReRead missing agrees → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r19.checks.some(c => c.name === 'ui-vs-persisted-parity' && c.verdict === 'UNCHECKABLE'),
    'ui-vs-persisted-parity is UNCHECKABLE when agrees key absent — absence ≠ agree');

  // T20: B3.3 — agrees as string "false" → oracle 2 UNCHECKABLE (not FAIL, not PASS)
  console.log('\n=== T20: Oracle 2 — agrees as string "false" → UNCHECKABLE (not FAIL) ===');
  const o2StringFalseMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'save-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: 'false' } },
    ],
  };
  const r20 = validateArtifact(o2StringFalseMap, schemaResult.mod);
  assert(!r20.pass, 'io/PROBED with agrees="false" (string) → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r20.checks.some(c => c.name === 'ui-vs-persisted-parity' && c.verdict === 'UNCHECKABLE'),
    'ui-vs-persisted-parity is UNCHECKABLE for string agrees — wrong type, not a literal boolean false');

  // T21: B3.4 — filter element with agrees:false → FAIL (not silently skipped)
  console.log('\n=== T21: Oracle 2 — non-io element with agrees:false → FAIL (not PASS) ===');
  const o2FilterDisagreeMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'active-filter', class: 'filter', emissionStatus: 'PROBED',
        probes: [{ action: 'toggle' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: false, note: 'misclassified save-probe carrying disagreement' } },
    ],
  };
  const r21 = validateArtifact(o2FilterDisagreeMap, schemaResult.mod);
  assert(!r21.pass, 'filter element with persistedStateReRead.agrees=false → FAIL (not PASS)');
  assert(r21.checks.some(c => c.name === 'ui-vs-persisted-parity' && c.verdict === 'FAIL'),
    'ui-vs-persisted-parity is FAIL for misclassified element — class must not hide the violation');

  // T22: B3.5 — DISCARD probe with agrees:true, no nothingPersisted → UNCHECKABLE (not PASS)
  console.log('\n=== T22: Oracle 2 — DISCARD probe, agrees:true, no nothingPersisted → UNCHECKABLE ===');
  const o2DiscardMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'cancel-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-cancel' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true, probeType: 'DISCARD' } },
    ],
  };
  const r22 = validateArtifact(o2DiscardMap, schemaResult.mod);
  assert(!r22.pass, 'DISCARD probe with agrees:true, no nothingPersisted → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r22.checks.some(c => c.name === 'ui-vs-persisted-parity' && c.verdict === 'UNCHECKABLE'),
    'ui-vs-persisted-parity is UNCHECKABLE for DISCARD probe — agrees:true alone does not prove nothing persisted');

  // T23: B4 — unrelated io row carries roundTripDisposition; export/import pair does not → FAIL
  console.log('\n=== T23: Oracle 3 — unrelated io row has roundTripDisposition, pair lacks it → FAIL ===');
  const o3UnrelatedRowMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'export-btn', class: 'io', emissionStatus: 'PROBED', capability: 'export',
        probes: [{ action: 'click-export' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true } },
      { elementId: 'import-btn', class: 'io', emissionStatus: 'PROBED', capability: 'import',
        probes: [{ action: 'click-import' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true } },
      { elementId: 'print-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-print' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true },
        roundTripDisposition: 'ACCEPTED' },
    ],
  };
  const r23 = validateArtifact(o3UnrelatedRowMap, schemaResult.mod);
  assert(!r23.pass, 'export+import pair with no roundTripDisposition; only unrelated print row has it → FAIL');
  assert(r23.checks.some(c => c.name === 'round-trip-invariant' && c.verdict === 'UNCHECKABLE'),
    'round-trip-invariant is UNCHECKABLE — print-btn missing capability, pair disposition not bound to pair elements');

  // T24: Precedence — FAIL (oracle 2) + UNCHECKABLE (oracle 5) coexist → overall FAIL, exit 1
  console.log('\n=== T24: Precedence — FAIL outranks UNCHECKABLE → FAIL verdict, exit 1 ===');
  const precedenceMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      // oracle 2: agrees:false on any element → FAIL
      { elementId: 'probe-io-save', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: false, note: 'parity violation' } },
      // oracle 5: unrecognized basis prefix → UNCHECKABLE
      { elementId: 'probe-io-unchk', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-export' }], effectObserved: true,
        disposition: 'COVERED', basis: 'manual:unrecognized-prefix',
        persistedStateReRead: { agrees: true } },
    ],
  };
  const r24 = validateArtifact(precedenceMap, schemaResult.mod);
  assert(!r24.pass, 'FAIL (oracle 2) + UNCHECKABLE (oracle 5) coexist → overall fails');
  assert(r24.checks.some(c => c.name === 'ui-vs-persisted-parity' && c.verdict === 'FAIL'),
    'oracle 2 verdict is FAIL');
  assert(r24.checks.some(c => c.name === 'claim-census' && c.verdict === 'UNCHECKABLE'),
    'oracle 5 verdict is UNCHECKABLE');
  // Simulate CLI precedence logic: FAIL must outrank UNCHECKABLE
  const hasFail24 = r24.checks.some(c => !c.pass && c.verdict !== 'UNCHECKABLE');
  assert(hasFail24,
    'FAIL outranks UNCHECKABLE — CLI emits FAIL (exit 1), not UNCHECKABLE (exit 2)');

  // T25: Oracle 4 RED — dom countSource → count-source FAIL
  console.log('\n=== T25: Oracle 4 — dom countSource → count-source FAIL ===');
  const o4DomMap = {
    version: '1.0.0', surface: 'test',
    elements: [{
      elementId: 'pagination-ctrl', class: 'pagination', emissionStatus: 'PROBED',
      probes: [{ action: 'count-probe', before: { rowCount: 0 }, after: { rowCount: 0, countSource: 'dom:raw-count.verify.txt' } }],
      effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
    }],
  };
  const r25 = validateArtifact(o4DomMap, schemaResult.mod);
  assert(!r25.pass, 'dom countSource → FAIL (DOM count = invalid probe)');
  assert(r25.checks.some(c => c.name === 'count-source' && c.verdict === 'FAIL'),
    'count-source verdict is FAIL for dom: source');

  // T26: Oracle 4 RED — count keys without countSource → UNCHECKABLE
  console.log('\n=== T26: Oracle 4 — count keys, no countSource → UNCHECKABLE ===');
  const o4UncheckMap = {
    version: '1.0.0', surface: 'test',
    elements: [{
      elementId: 'pagination-ctrl', class: 'pagination', emissionStatus: 'PROBED',
      probes: [{ action: 'count-probe', before: { rowCount: 10 }, after: { rowCount: 10 } }],
      effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
    }],
  };
  const r26 = validateArtifact(o4UncheckMap, schemaResult.mod);
  assert(!r26.pass, 'count keys with no countSource → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r26.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'),
    'count-source verdict is UNCHECKABLE when source not recorded');

  // T27: Oracle 4 GREEN — api countSource → count-source PASS (honest control)
  console.log('\n=== T27: Oracle 4 — api countSource → count-source PASS ===');
  const o4ApiMap = {
    version: '1.0.0', surface: 'test',
    elements: [{
      elementId: 'pagination-ctrl', class: 'pagination', emissionStatus: 'PROBED',
      probes: [{ action: 'count-probe', before: { rowCount: 50 }, after: { rowCount: 50, countSource: 'api:GET /api/items returns 50', httpStatus: 200 } }],
      effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
    }],
  };
  const r27 = validateArtifact(o4ApiMap, schemaResult.mod);
  assert(r27.checks.find(c => c.name === 'count-source').pass,
    'api: countSource → count-source PASS');

  // T28: Oracle 4 GREEN — no count probes → oracle N/A, count-source PASS
  console.log('\n=== T28: Oracle 4 — no count probes → count-source PASS (N/A) ===');
  const o4NoCountMap = {
    version: '1.0.0', surface: 'test',
    elements: [{
      elementId: 'active-filter', class: 'filter', emissionStatus: 'PROBED',
      probes: [{ action: 'toggle', before: { state: 'off' }, after: { state: 'on' } }],
      effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
    }],
  };
  const r28 = validateArtifact(o4NoCountMap, schemaResult.mod);
  assert(r28.checks.find(c => c.name === 'count-source').pass,
    'no count-related probe keys → count-source PASS (oracle N/A)');

  // T29: Oracle 5 RED — basis: "claim:*" with no census → claim-census FAIL
  console.log('\n=== T29: Oracle 5 — claim basis, no census → claim-census FAIL ===');
  const o5ClaimMap = {
    version: '1.0.0', surface: 'test',
    elements: [{
      elementId: 'office-data', class: 'io', emissionStatus: 'PROBED',
      probes: [{ action: 'check-data', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED',
      basis: 'claim:client-said-office-has-data',
      persistedStateReRead: { agrees: true },
    }],
  };
  const r29 = validateArtifact(o5ClaimMap, schemaResult.mod);
  assert(!r29.pass, 'claim basis with no census → FAIL');
  assert(r29.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'),
    'claim-census verdict is FAIL for unverified claim');

  // T30: Oracle 5 RED — unrecognized basis prefix → claim-census UNCHECKABLE
  console.log('\n=== T30: Oracle 5 — unrecognized basis prefix → UNCHECKABLE ===');
  const o5UnknownMap = {
    version: '1.0.0', surface: 'test',
    elements: [{
      elementId: 'some-element', class: 'io', emissionStatus: 'PROBED',
      probes: [{ action: 'probe', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED',
      basis: 'manual:verified-by-hand',
      persistedStateReRead: { agrees: true },
    }],
  };
  const r30 = validateArtifact(o5UnknownMap, schemaResult.mod);
  assert(!r30.pass, 'unrecognized basis prefix → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r30.checks.some(c => c.name === 'claim-census' && c.verdict === 'UNCHECKABLE'),
    'claim-census verdict is UNCHECKABLE for unrecognized basis prefix');

  // T31: Oracle 5 GREEN — claim + valid census (real file) both present → claim-census PASS
  console.log('\n=== T31: Oracle 5 — claim + valid census (real file) present → claim-census PASS ===');
  mkdirSync(tmpDir, { recursive: true });
  const tmpCensusFile31 = join(tmpDir, `census-t31-${Date.now()}.verify.txt`);
  writeFileSync(tmpCensusFile31, 'census: 3 offices confirmed by API response\n');
  const o5CensusMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'office-claim', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'check-data', before: {}, after: {} }],
        effectObserved: true, disposition: 'COVERED',
        basis: 'claim:client-said-office-has-data',
        persistedStateReRead: { agrees: true } },
      { elementId: 'office-census', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'api-census', before: {}, after: {} }],
        effectObserved: true, disposition: 'COVERED',
        basis: `census:${tmpCensusFile31}`,
        persistedStateReRead: { agrees: true } },
    ],
  };
  const r31 = validateArtifact(o5CensusMap, schemaResult.mod);
  assert(r31.checks.find(c => c.name === 'claim-census').pass,
    'claim + valid census (real file) both present → claim-census PASS');
  try { unlinkSync(tmpCensusFile31); } catch { /* cleanup */ }

  // T32: Oracle 5 GREEN — observed basis only, no claims → oracle N/A, claim-census PASS
  console.log('\n=== T32: Oracle 5 — observed basis only → claim-census PASS (N/A) ===');
  const o5ObservedMap = {
    version: '1.0.0', surface: 'test',
    elements: [{
      elementId: 'filter-el', class: 'filter', emissionStatus: 'PROBED',
      probes: [{ action: 'toggle' }], effectObserved: true,
      disposition: 'COVERED', basis: 'observed:walk-A.txt',
    }],
  };
  const r32 = validateArtifact(o5ObservedMap, schemaResult.mod);
  assert(r32.checks.find(c => c.name === 'claim-census').pass,
    'observed-only basis → claim-census PASS (no claims to verify)');

  // T33: Precedence — oracle 4 FAIL + oracle 5 UNCHECKABLE coexist → overall FAIL (exit 1)
  console.log('\n=== T33: Precedence — oracle 4 FAIL + oracle 5 UNCHECKABLE → FAIL outranks UNCHECKABLE ===');
  const o45PrecedenceMap = {
    version: '1.0.0', surface: 'test',
    elements: [{
      elementId: 'dom-count-el', class: 'pagination', emissionStatus: 'PROBED',
      probes: [{ action: 'count', before: { rowCount: 0 }, after: { rowCount: 0, countSource: 'dom:count.verify.txt' } }],
      effectObserved: true, disposition: 'COVERED',
      basis: 'manual:not-classified',
    }],
  };
  const r33 = validateArtifact(o45PrecedenceMap, schemaResult.mod);
  assert(!r33.pass, 'oracle 4 FAIL + oracle 5 UNCHECKABLE → overall fails');
  assert(r33.checks.some(c => c.name === 'count-source' && c.verdict === 'FAIL'),
    'count-source verdict is FAIL');
  assert(r33.checks.some(c => c.name === 'claim-census' && c.verdict === 'UNCHECKABLE'),
    'claim-census verdict is UNCHECKABLE');
  const hasFail33 = r33.checks.some(c => !c.pass && c.verdict !== 'UNCHECKABLE');
  assert(hasFail33,
    'FAIL outranks UNCHECKABLE — CLI emits FAIL (exit 1), not UNCHECKABLE (exit 2)');

  // ── Hardening cases (adversarial R1 defend-and-fix) ──────────────────────

  // T34: Oracle 4 RED — DOM uppercase (case bypass) → FAIL
  console.log('\n=== T34: Oracle 4 — DOM: uppercase → FAIL ===');
  const r34 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 0 }, after: { rowCount: 0, countSource: 'DOM:raw-count.verify.txt' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r34.pass, 'DOM: (uppercase) → FAIL (case bypass caught)');
  assert(r34.checks.some(c => c.name === 'count-source' && c.verdict === 'FAIL'), 'count-source FAIL for uppercase DOM:');

  // T35: Oracle 4 RED — leading whitespace before dom: → FAIL
  console.log('\n=== T35: Oracle 4 — leading space dom: → FAIL ===');
  const r35 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 0 }, after: { rowCount: 0, countSource: ' dom:raw-count.verify.txt' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r35.pass, 'leading-space dom: → FAIL (whitespace bypass caught)');
  assert(r35.checks.some(c => c.name === 'count-source' && c.verdict === 'FAIL'), 'count-source FAIL for leading-space dom:');

  // T36: Oracle 4 RED — dom-api: prefix-adjacent bypass → FAIL
  console.log('\n=== T36: Oracle 4 — dom-api: prefix bypass → FAIL ===');
  const r36 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 0 }, after: { rowCount: 0, countSource: 'dom-api:raw-count.verify.txt' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r36.pass, 'dom-api: → FAIL (dom- prefix bypass caught)');
  assert(r36.checks.some(c => c.name === 'count-source' && c.verdict === 'FAIL'), 'count-source FAIL for dom- prefix');

  // T37: Oracle 4 RED — api:...(from dom) annotation → UNCHECKABLE
  // Decision: "from dom" annotation on a non-dom prefix is internally contradictory —
  // the source claim cannot be verified; UNCHECKABLE is safer than PASS.
  console.log('\n=== T37: Oracle 4 — api:(from dom) annotation → UNCHECKABLE ===');
  const r37 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 0 }, after: { rowCount: 10, countSource: 'api:GET /items (from dom)' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r37.pass, 'api:(from dom) → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r37.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'), 'count-source UNCHECKABLE for from-dom annotation');

  // T38: Oracle 5 RED — census: empty after colon → invalid census → FAIL
  console.log('\n=== T38: Oracle 5 — census: empty → invalid census → FAIL ===');
  const r38 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [
    { elementId: 'claim-el', class: 'io', emissionStatus: 'PROBED', probes: [{ action: 'p', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED', basis: 'claim:some-claim', persistedStateReRead: { agrees: true } },
    { elementId: 'census-el', class: 'io', emissionStatus: 'PROBED', probes: [{ action: 'p', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED', basis: 'census:', persistedStateReRead: { agrees: true } },
  ]}, schemaResult.mod);
  assert(!r38.pass, 'census: empty content + claim → FAIL (empty census is not corroboration)');
  assert(r38.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'), 'claim-census FAIL — empty census: invalid');

  // T39: Oracle 5 RED — census: whitespace-only → invalid census → FAIL
  console.log('\n=== T39: Oracle 5 — census: whitespace → invalid census → FAIL ===');
  const r39 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [
    { elementId: 'claim-el', class: 'io', emissionStatus: 'PROBED', probes: [{ action: 'p', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED', basis: 'claim:some-claim', persistedStateReRead: { agrees: true } },
    { elementId: 'census-el', class: 'io', emissionStatus: 'PROBED', probes: [{ action: 'p', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED', basis: 'census:   ', persistedStateReRead: { agrees: true } },
  ]}, schemaResult.mod);
  assert(!r39.pass, 'census: whitespace-only + claim → FAIL');
  assert(r39.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'), 'claim-census FAIL — whitespace census: invalid');

  // T40: Oracle 5 RED — census: non-existent artifact → invalid census → FAIL
  console.log('\n=== T40: Oracle 5 — census: non-existent artifact → FAIL ===');
  const r40 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [
    { elementId: 'claim-el', class: 'io', emissionStatus: 'PROBED', probes: [{ action: 'p', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED', basis: 'claim:some-claim', persistedStateReRead: { agrees: true } },
    { elementId: 'census-el', class: 'io', emissionStatus: 'PROBED', probes: [{ action: 'p', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED', basis: 'census:no-such-artifact.verify.txt', persistedStateReRead: { agrees: true } },
  ]}, schemaResult.mod);
  assert(!r40.pass, 'census: non-existent file + claim → FAIL (unresolvable census)');
  assert(r40.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'), 'claim-census FAIL — non-existent census artifact');

  // T41-T45: Oracle 4 RED — count-key aliases without countSource → UNCHECKABLE
  console.log('\n=== T41-T45: Oracle 4 — count aliases (numRows/total/rowTotal/itemsFound/recordCount_v2) → UNCHECKABLE ===');
  for (const [label, key] of [['numRows','numRows'],['total','total'],['rowTotal','rowTotal'],['itemsFound','itemsFound'],['recordCount_v2','recordCount_v2']]) {
    const rAlias = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
      elementId: 'grid', class: 'pagination', emissionStatus: 'PROBED',
      probes: [{ action: 'cp', before: { [key]: 0 }, after: { [key]: 50 } }],
      effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
    }]}, schemaResult.mod);
    assert(!rAlias.pass, `${label} without countSource → FAIL (UNCHECKABLE ≠ PASS)`);
    assert(rAlias.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'), `count-source UNCHECKABLE for ${label}`);
  }

  // T46: Oracle 4 RED — count key nested inside probe.after sub-object → UNCHECKABLE
  console.log('\n=== T46: Oracle 4 — nested rowCount inside after.stats → UNCHECKABLE ===');
  const r46 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'grid', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: {}, after: { stats: { rowCount: 50 } } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r46.pass, 'nested rowCount (inside after.stats) without countSource → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r46.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'), 'count-source UNCHECKABLE for nested count key');

  // T47: Oracle 5 RED — observed: with empty content → UNCHECKABLE
  console.log('\n=== T47: Oracle 5 — observed: empty content → UNCHECKABLE ===');
  const r47 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'filter-el', class: 'filter', emissionStatus: 'PROBED',
    probes: [{ action: 'toggle' }], effectObserved: true, disposition: 'COVERED', basis: 'observed:',
  }]}, schemaResult.mod);
  assert(!r47.pass, 'observed: with empty content → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r47.checks.some(c => c.name === 'claim-census' && c.verdict === 'UNCHECKABLE'), 'claim-census UNCHECKABLE for empty observed:');

  // T48: Oracle 5 RED — CLAIM:x uppercase → treated as claim:, not downgraded to UNCHECKABLE
  console.log('\n=== T48: Oracle 5 — CLAIM:x uppercase → FAIL (not UNCHECKABLE) ===');
  const r48 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'claim-el', class: 'io', emissionStatus: 'PROBED',
    probes: [{ action: 'p', before: {}, after: {} }],
    effectObserved: true, disposition: 'COVERED', basis: 'CLAIM:uppercase-bypass',
    persistedStateReRead: { agrees: true },
  }]}, schemaResult.mod);
  assert(!r48.pass, 'CLAIM: (uppercase) → FAIL (not downgraded to UNCHECKABLE)');
  assert(r48.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'), 'claim-census FAIL for uppercase CLAIM: — case is not an escape hatch');

  // ── New cases (BLOCKER 1-3, MAJOR 4-7 defence) ──────────────────────────────

  // T49: BLOCKER 1 RED — relabeled save row (class='guard', has persistedStateReRead) → semantic invariant UNCHECKABLE
  console.log('\n=== T49: BLOCKER 1 — relabeled save (class=guard, has persistedStateReRead) → UNCHECKABLE ===');
  const r49 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'save-relabeled', class: 'guard', emissionStatus: 'PROBED',
    probes: [{ action: 'click-save' }], effectObserved: true,
    disposition: 'COVERED', basis: 'observed:walk.txt',
    persistedStateReRead: { agrees: true },
  }]}, schemaResult.mod);
  assert(!r49.pass, 'relabeled save row (class=guard with persistedStateReRead) → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r49.checks.some(c => c.name === 'semantic-class-invariant' && !c.pass),
    'semantic-class-invariant catches class mismatch — persistedStateReRead on non-io class');

  // T50: BLOCKER 1 RED — relabeled export (class='menu-disclosure', has capability) → semantic invariant UNCHECKABLE
  console.log('\n=== T50: BLOCKER 1 — relabeled export (class=menu-disclosure, capability=export) → UNCHECKABLE ===');
  const r50 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'export-relabeled', class: 'menu-disclosure', emissionStatus: 'PROBED',
    capability: 'export',
    probes: [{ action: 'click-export' }], effectObserved: true,
    disposition: 'COVERED', basis: 'observed:walk.txt',
    persistedStateReRead: { agrees: true },
  }]}, schemaResult.mod);
  assert(!r50.pass, 'relabeled export (class=menu-disclosure with capability=export) → FAIL');
  assert(r50.checks.some(c => c.name === 'semantic-class-invariant' && !c.pass),
    'semantic-class-invariant catches capability on non-io class');

  // T51: BLOCKER 2 RED — browser:document.querySelectorAll → UNCHECKABLE (not PASS)
  console.log('\n=== T51: BLOCKER 2 — browser: countSource → UNCHECKABLE ===');
  const r51 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 0 }, after: { rowCount: 5, countSource: 'browser:document.querySelectorAll' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r51.pass, 'browser: countSource → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r51.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'),
    'count-source UNCHECKABLE for browser: — not in allowlist');

  // T52: BLOCKER 2 RED — empty string countSource → UNCHECKABLE
  console.log('\n=== T52: BLOCKER 2 — empty countSource → UNCHECKABLE ===');
  const r52 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 0 }, after: { rowCount: 5, countSource: '' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r52.pass, 'empty countSource → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r52.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'),
    'count-source UNCHECKABLE for empty string — absence is never proof');

  // T53: BLOCKER 2 RED — client-side:querySelectorAll → UNCHECKABLE
  console.log('\n=== T53: BLOCKER 2 — client-side: countSource → UNCHECKABLE ===');
  const r53 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 0 }, after: { rowCount: 5, countSource: 'client-side:querySelectorAll' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r53.pass, 'client-side: countSource → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r53.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'),
    'count-source UNCHECKABLE for client-side: — not in allowlist');

  // T54: BLOCKER 2 GREEN — footer: countSource → PASS
  console.log('\n=== T54: BLOCKER 2 — footer: countSource → PASS ===');
  const r54 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 50 }, after: { rowCount: 50, countSource: 'footer:Total 50 items', httpStatus: 200 } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(r54.checks.find(c => c.name === 'count-source').pass, 'footer: countSource → count-source PASS');

  // T55: BLOCKER 3 RED — census: unrelated format (package.json-like) → FAIL
  console.log('\n=== T55: BLOCKER 3 — census: package-manifest format → FAIL ===');
  mkdirSync(tmpDir, { recursive: true });
  const tmpPkgFile = join(tmpDir, `fake-pkg-${Date.now()}.json`);
  writeFileSync(tmpPkgFile, JSON.stringify({ name: 'unrelated', dependencies: { foo: '1.0.0' }, scripts: { test: 'jest' } }));
  const r55 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [
    { elementId: 'claim-el', class: 'io', emissionStatus: 'PROBED', probes: [{ action: 'p', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED', basis: 'claim:pricing-data', persistedStateReRead: { agrees: true } },
    { elementId: 'census-el', class: 'io', emissionStatus: 'PROBED', probes: [{ action: 'c', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED', basis: `census:${tmpPkgFile}`, persistedStateReRead: { agrees: true } },
  ]}, schemaResult.mod);
  assert(!r55.pass, 'census: package-manifest format + claim → FAIL');
  assert(r55.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'),
    'claim-census FAIL — unrelated format cannot corroborate');
  try { unlinkSync(tmpPkgFile); } catch { /* cleanup */ }

  // T56: MAJOR 4 GREEN — save-only io (no capability anywhere) → oracle 3 PASS
  console.log('\n=== T56: MAJOR 4 — save-only io (no capability) → round-trip-invariant PASS ===');
  const r56 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'save-btn', class: 'io', emissionStatus: 'PROBED',
    probes: [{ action: 'click-save' }], effectObserved: true,
    disposition: 'COVERED', basis: 'observed:walk.txt',
    persistedStateReRead: { agrees: true },
  }]}, schemaResult.mod);
  assert(r56.checks.find(c => c.name === 'round-trip-invariant').pass,
    'save-only io (no capability on surface) → round-trip-invariant PASS (oracle N/A, no false positive)');

  // T57: MAJOR 5 RED — PROBED with no probes key → UNCHECKABLE
  console.log('\n=== T57: MAJOR 5 — PROBED, no probes key → UNCHECKABLE ===');
  const r57 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'ghost', class: 'filter', emissionStatus: 'PROBED',
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r57.pass, 'PROBED with no probes key → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r57.checks.some(c => c.name === 'degenerate-probe-guard' && c.verdict === 'UNCHECKABLE'),
    'degenerate-probe-guard UNCHECKABLE for missing probes');

  // T58: MAJOR 5 RED — PROBED with probes:[] → UNCHECKABLE
  console.log('\n=== T58: MAJOR 5 — PROBED, probes:[] → UNCHECKABLE ===');
  const r58 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'ghost', class: 'filter', emissionStatus: 'PROBED',
    probes: [], effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r58.pass, 'PROBED with probes:[] → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r58.checks.some(c => c.name === 'degenerate-probe-guard' && c.verdict === 'UNCHECKABLE'),
    'degenerate-probe-guard UNCHECKABLE for empty probes array');

  // T59: MAJOR 5 RED — PROBED with probes:{} (object) → UNCHECKABLE
  console.log('\n=== T59: MAJOR 5 — PROBED, probes:{} → UNCHECKABLE ===');
  const r59 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'ghost', class: 'filter', emissionStatus: 'PROBED',
    probes: {}, effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r59.pass, 'PROBED with probes:{} → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r59.checks.some(c => c.name === 'degenerate-probe-guard' && c.verdict === 'UNCHECKABLE'),
    'degenerate-probe-guard UNCHECKABLE for object probes');

  // T60: MAJOR 6 RED — null element → controlled FAIL, no TypeError
  console.log('\n=== T60: MAJOR 6 — null element → controlled FAIL ===');
  const r60 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [
    null,
    { elementId: 'ok', class: 'filter', emissionStatus: 'PROBED', probes: [{ action: 'toggle' }],
      effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt' },
  ]}, schemaResult.mod);
  assert(!r60.pass, 'null element → controlled FAIL (no crash)');
  assert(r60.checks.some(c => c.name === 'element-integrity' && c.verdict === 'FAIL'),
    'element-integrity FAIL for null element — crash prevented');

  // T61: BLOCKER 1 comprehensive — coordinated relabeling attack map → does NOT exit 0
  console.log('\n=== T61: BLOCKER 1 — coordinated relabeling attack → does NOT pass ===');
  const relabelAttackMap = {
    version: '1.0.0', surface: 'test-surface',
    elements: [
      // save relabeled to guard
      { elementId: 'save-as-guard', class: 'guard', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true } },
      // export relabeled to menu-disclosure
      { elementId: 'export-as-menu', class: 'menu-disclosure', emissionStatus: 'PROBED',
        capability: 'export',
        probes: [{ action: 'click-export' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true } },
      // count with empty countSource relabeled to add-picker
      { elementId: 'count-as-picker', class: 'add-picker', emissionStatus: 'PROBED',
        probes: [{ action: 'count', before: { rowCount: 10 }, after: { rowCount: 10, countSource: '' } }],
        effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt' },
    ],
  };
  const r61 = validateArtifact(relabelAttackMap, schemaResult.mod);
  assert(!r61.pass, 'coordinated relabeling attack → does NOT pass (exit ≠ 0)');
  assert(r61.checks.some(c => c.name === 'semantic-class-invariant' && !c.pass),
    'semantic-class-invariant catches the relabeling');
  assert(r61.checks.some(c => c.name === 'count-source' && !c.pass),
    'count-source allowlist catches empty countSource');

  // T62: MAJOR 4 GREEN — full honest save-only map (control) → overall PASS
  console.log('\n=== T62: MAJOR 4 — full honest save-only map → PASS (0% FP) ===');
  const honestSaveMap = {
    version: '1.0.0', surface: 'test',
    elements: [
      { elementId: 'save-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-save' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true } },
      { elementId: 'cancel-btn', class: 'io', emissionStatus: 'PROBED',
        probes: [{ action: 'click-cancel' }], effectObserved: true,
        disposition: 'COVERED', basis: 'observed:walk.txt',
        persistedStateReRead: { agrees: true, probeType: 'DISCARD', nothingPersisted: true } },
    ],
  };
  const r62 = validateArtifact(honestSaveMap, schemaResult.mod);
  assert(r62.pass, 'honest save-only map → overall PASS (0% false positive rate)');

  // ── R3 defense cases (F1-F3) ──────────────────────────────────────────────

  // T63: F1 RED — api:document.querySelectorAll → count-source UNCHECKABLE (DOM content overrides prefix)
  console.log('\n=== T63: F1 — api:document.querySelectorAll → count-source UNCHECKABLE ===');
  const r63 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 0 }, after: { rowCount: 5, countSource: 'api:document.querySelectorAll rows' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r63.pass, 'api:document.querySelectorAll → FAIL (UNCHECKABLE ≠ PASS)');
  assert(r63.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'),
    'count-source UNCHECKABLE — DOM API content overrides valid api: prefix');

  // T64: F1 GREEN — api:GET /items (genuine API, control for T63)
  console.log('\n=== T64: F1 — api:GET /items → count-source PASS (control) ===');
  const r64 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'pg', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'cp', before: { rowCount: 50 }, after: { rowCount: 50, countSource: 'api:GET /items', httpStatus: 200 } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(r64.checks.find(c => c.name === 'count-source').pass,
    'api:GET /items (genuine API) → count-source PASS');

  // T65: F2 RED — census: unrelated artifact (claim subject not mentioned) → FAIL
  console.log('\n=== T65: F2 — census: unrelated to claim subject → FAIL ===');
  mkdirSync(tmpDir, { recursive: true });
  const tmpUnrelatedCensus = join(tmpDir, `census-unrelated-${Date.now()}.json`);
  writeFileSync(tmpUnrelatedCensus, JSON.stringify({ fixtures: ['kernel-test-A', 'kernel-test-B'], generated: '2026-07-01' }));
  const r65 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [
    { elementId: 'claim-el', class: 'io', emissionStatus: 'PROBED',
      probes: [{ action: 'check-data', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED',
      basis: 'claim:office-pricing-rates',
      persistedStateReRead: { agrees: true } },
    { elementId: 'census-el', class: 'io', emissionStatus: 'PROBED',
      probes: [{ action: 'census-check', before: {}, after: {} }],
      effectObserved: true, disposition: 'COVERED',
      basis: `census:${tmpUnrelatedCensus}`,
      persistedStateReRead: { agrees: true } },
  ]}, schemaResult.mod);
  assert(!r65.pass, 'census: unrelated to claim subject → FAIL');
  assert(r65.checks.some(c => c.name === 'claim-census' && !c.pass),
    'claim-census catches unlinkable census — artifact does not mention claim subject');
  try { unlinkSync(tmpUnrelatedCensus); } catch { /* cleanup */ }

  // T66: F3 RED — stealth relabel (class=add-picker, action=click-save) → UNCHECKABLE
  console.log('\n=== T66: F3 — stealth relabel (action=click-save on non-io) → UNCHECKABLE ===');
  const r66 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'stealth-save', class: 'add-picker', emissionStatus: 'PROBED',
    probes: [{ action: 'click-save', result: 'record saved to database' }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r66.pass, 'stealth relabel (class=add-picker, action=click-save) → FAIL');
  assert(r66.checks.some(c => c.name === 'semantic-class-invariant' && !c.pass),
    'semantic-class-invariant catches io verb in probe action on non-io class');

  // T67: F3 RED — stealth relabel via prose (class=menu-disclosure, probe result mentions persist)
  console.log('\n=== T67: F3 — stealth relabel via prose (persisted in result) → UNCHECKABLE ===');
  const r67 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'stealth-persist', class: 'menu-disclosure', emissionStatus: 'PROBED',
    probes: [{ action: 'click-menu-item', result: 'data persisted to server' }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r67.pass, 'stealth relabel (class=menu-disclosure, prose=persisted) → FAIL');
  assert(r67.checks.some(c => c.name === 'semantic-class-invariant' && !c.pass),
    'semantic-class-invariant catches io verb in probe prose on non-io class');

  // T68: F3 GREEN — genuine add-picker (no io verbs) → semantic-class-invariant PASS
  console.log('\n=== T68: F3 — genuine add-picker (no io verbs) → PASS ===');
  const r68 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'honest-picker', class: 'add-picker', emissionStatus: 'PROBED',
    probes: [{ action: 'open-picker', result: 'dropdown expanded' }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(r68.checks.find(c => c.name === 'semantic-class-invariant').pass,
    'genuine add-picker (no io verbs) → semantic-class-invariant PASS');

  // T69: REQUEST-FAILED RED — footer: countSource + httpStatus 500 → REQUEST-FAILED
  console.log('\n=== T69: Oracle 4 — footer: countSource + httpStatus 500 → REQUEST-FAILED ===');
  const r69 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'office-1604-grid', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'load-grid', before: { rowCount: 0 }, after: { rowCount: 0, countSource: 'footer:0 items found', httpStatus: 500 } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r69.pass, 'footer: countSource + httpStatus 500 → FAIL (REQUEST-FAILED ≠ COVERED)');
  assert(r69.checks.some(c => c.name === 'count-source' && c.verdict === 'REQUEST-FAILED'),
    'count-source verdict is REQUEST-FAILED for non-2xx status');

  // T70: UNCHECKABLE — footer: countSource + absent httpStatus → UNCHECKABLE (not COVERED)
  console.log('\n=== T70: Oracle 4 — footer: countSource + absent httpStatus → UNCHECKABLE ===');
  const r70 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'grid-no-status', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'load-grid', before: { rowCount: 0 }, after: { rowCount: 0, countSource: 'footer:0 items found' } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r70.pass, 'footer: countSource + absent httpStatus → FAIL (UNCHECKABLE ≠ COVERED)');
  assert(r70.checks.some(c => c.name === 'count-source' && c.verdict === 'UNCHECKABLE'),
    'count-source verdict is UNCHECKABLE when httpStatus absent — absence of status ≠ evidence of success');

  // T71: HONEST CONTROL — footer: countSource + httpStatus 200 + rowCount 0 → count-source PASS
  // A genuine zero (empty table) must not be blocked; only failed-request zeros are rejected.
  console.log('\n=== T71: Oracle 4 — footer: 2xx + count 0 → count-source PASS (honest control) ===');
  const r71 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'empty-grid', class: 'pagination', emissionStatus: 'PROBED',
    probes: [{ action: 'load-grid', before: { rowCount: 0 }, after: { rowCount: 0, countSource: 'footer:0 items found', httpStatus: 200 } }],
    effectObserved: true, disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(r71.checks.find(c => c.name === 'count-source').pass,
    'footer: 2xx + count 0 → count-source PASS (genuine empty table is a valid observation)');

  // T72: UNCLASSIFIED element → FAIL naming the offending elementId
  console.log('\n=== T72: UNCLASSIFIED element → FAIL naming the id ===');
  const r72 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'mystery-control', class: 'filter', emissionStatus: 'UNCLASSIFIED',
    disposition: 'UNCLASSIFIED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(!r72.pass, 'UNCLASSIFIED element → FAIL');
  assert(r72.checks.some(c => c.name === 'unclassified-element' && !c.pass),
    'unclassified-element check fails');
  assert(r72.checks.find(c => c.name === 'unclassified-element').reason.includes('mystery-control'),
    'failure names the offending elementId');

  // T73: No UNCLASSIFIED elements → unclassified-element PASS (honest control)
  console.log('\n=== T73: No UNCLASSIFIED elements → unclassified-element PASS (honest control) ===');
  const r73 = validateArtifact({ version: '1.0.0', surface: 'test', elements: [{
    elementId: 'clean-filter', class: 'filter', emissionStatus: 'PROBED',
    probes: [{ action: 'toggle' }], effectObserved: true,
    disposition: 'COVERED', basis: 'observed:walk.txt',
  }]}, schemaResult.mod);
  assert(r73.checks.find(c => c.name === 'unclassified-element').pass,
    'No UNCLASSIFIED elements → unclassified-element PASS');

  fireTelemetry(fails === 0 ? 'pass' : 'fail', 'self-test');

  console.log(`\n=== Results: ${total - fails}/${total} passed ===`);
  if (fails) { console.error(`VERDICT: FAIL (${fails} failures)`); process.exit(1); }
  console.log('VERDICT: PASS');
  process.exit(0);
}

// ── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--self-test')) {
  await selfTest();
} else if (args.includes('--file')) {
  const filePath = args[args.indexOf('--file') + 1];
  if (!filePath) { console.error('Usage: --file <path.json>'); process.exit(1); }

  const result = await checkFile(filePath);
  fireTelemetry(result.pass ? 'pass' : 'fail', norm(relative(ROOT, resolve(filePath))));

  const hasFail1 = result.checks.some(c => !c.pass && c.verdict !== 'UNCHECKABLE');
  const hasUncheckable1 = result.checks.some(c => c.verdict === 'UNCHECKABLE');
  console.log(`VERDICT: ${result.pass ? 'PASS' : (hasFail1 ? 'FAIL' : 'UNCHECKABLE')}`);
  for (const c of result.checks)
    console.log(`  ${c.name}: ${c.pass ? 'PASS' : (c.verdict === 'UNCHECKABLE' ? 'UNCHECKABLE' : 'FAIL')} — ${c.reason}`);
  process.exit(result.pass ? 0 : (hasFail1 ? 1 : 2));
} else if (args.includes('--plan')) {
  const planPath = args[args.indexOf('--plan') + 1];
  if (!planPath) { console.error('Usage: --plan <planPath.md>'); process.exit(1); }

  const result = await checkPlan(planPath);
  fireTelemetry(result.pass ? 'pass' : 'fail', norm(relative(ROOT, resolve(planPath))));

  const hasFail2 = result.checks.some(c => !c.pass && c.verdict !== 'UNCHECKABLE');
  const hasUncheckable2 = result.checks.some(c => c.verdict === 'UNCHECKABLE');
  console.log(`VERDICT: ${result.pass ? 'PASS' : (hasFail2 ? 'FAIL' : 'UNCHECKABLE')}`);
  for (const c of result.checks)
    console.log(`  ${c.name}: ${c.pass ? 'PASS' : (c.verdict === 'UNCHECKABLE' ? 'UNCHECKABLE' : 'FAIL')} — ${c.reason}`);
  process.exit(result.pass ? 0 : (hasFail2 ? 1 : 2));
} else {
  console.log('Usage:\n  --self-test           Run built-in test suite\n  --file <path.json>    Validate interaction-map artifact\n  --plan <planPath.md>  Check plan for interaction-map coverage');
  process.exit(1);
}
