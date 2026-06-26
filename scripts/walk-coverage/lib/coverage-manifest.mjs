// scripts/walk-coverage/lib/coverage-manifest.mjs
// PLAN_EXHAUSTIVE_WALK_GUARANTEE — Phase 4 shared coverage-completeness logic.
//
// ONE source of truth for "is this walk artifact's Coverage Manifest complete?", imported by BOTH
// enforcement layers so they can never drift:
//   - scripts/validate-plan-closure.mjs  → closure check Cx (PREVENTIVE; DENIES Status: DONE)
//   - .claude/hooks/lib/check-execution-completion.mjs → 2nd decision branch (DETECTIVE; Stop warn)
//
// A walk artifact (field-inventory / old-site-baseline) is COMPLETE only when its frontmatter shows
// Coverage_Ratio = 100%, CrossCheck = clean, no `coverageScope: PARTIAL`, and zero undispositioned
// manifest rows (LR-062 / M3). Artifacts whose MCP_Session_Date precedes the landing date are
// GRANDFATHERED (not applicable until their next refresh). Artifacts with no Coverage Manifest at
// all are likewise not-applicable (they never opted into the manifest contract).
//
// PROVENANCE GATE (SUBPLAN_CGS_B_WALK_INTEGRITY — Pillar B): completeness alone never asked WHETHER
// an observation-claiming disposition was actually OBSERVED live or merely classified-from-spec. The
// corp-pricing rewalk flipped DONE with controls classified from the Jira spec instead of live-clicked,
// and this gate passed. So a disposition that CLAIMS observation (affordance-probed / read-only-verified)
// on an artifact dated on/after PROVENANCE_GATE_LANDING_DATE must carry `provenance: live` AND a cited
// machine-emitted `evidence:` artifact that (a) exists, (b) is not stale/reused (its embedded date is not
// older than the walk's session), and (c) names that control. `provenance: oracle` = classified-from-spec
// and is rejected on an observation-claiming row. A `provenance: oracle` / missing-provenance /
// missing-or-stale-evidence row makes the whole manifest incomplete AND sets `provenanceFail` (the
// fabrication signal the closure gate turns into a whole-plan rejection + integrity strike).

import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// REPO_ROOT = three levels up from this lib file (scripts/walk-coverage/lib/).
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export const COVERAGE_GATE_LANDING_DATE = '2026-06-19';

// The provenance sub-gate lands AFTER the coverage gate (2026-06-19): observation-claiming rows must
// carry machine evidence only for walks dated on/after this date. Walks dated before it are
// provenance-grandfathered (the ratio / crosscheck / undispositioned checks still apply when they
// post-date COVERAGE_GATE_LANDING_DATE). This is what stops the gate from retroactively failing the
// pre-existing manifests (e.g. pricing-2026-06-19) that never carried a provenance token.
export const PROVENANCE_GATE_LANDING_DATE = '2026-06-24';

// Dispositions that ASSERT a live observation of a control — these need machine evidence on a
// provenance-gated artifact. `out-of-scope` is honest inference (no observation claim, never gated).
// `covered-by-TC` carries its TC-ID as inherent evidence (a runnable spec), so it is not evidence-gated
// here — but a `covered-by-TC` row that ALSO declares `provenance: oracle` is self-contradictory and is
// rejected. The fabrication this gate prevents is exactly the corp-pricing miss: a control dispositioned
// affordance-probed / read-only-verified by reading the spec instead of live-clicking it.
const OBSERVATION_DISPOSITIONS = ['affordance-probed', 'read-only-verified'];
const ALL_DISPOSITIONS = ['covered-by-TC', 'affordance-probed', 'read-only-verified', 'out-of-scope'];

export function parseCoverageSignals(text) {
  const t = text || '';
  // Tolerate optional **bold** wrappers on frontmatter keys (real artifacts use both forms — SA-2).
  const mcpDate = (t.match(/(?:\*\*)?MCP_Session_Date(?:\*\*)?\s*:\s*(\d{4}-\d{2}-\d{2})/i) || [])[1] || '';
  const hasManifest = /^#{2,3}\s+Coverage Manifest/im.test(t) || /(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:/i.test(t);

  const ratioM = t.match(/(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:\s*(\d+)\s*\/\s*(\d+)/i);
  let ratioComplete = false, ratio = null;
  if (ratioM) {
    const n = +ratioM[1], m = +ratioM[2];
    ratio = { n, m };
    ratioComplete = m > 0 && n === m;
  } else if (/(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:[^\n]*\b100\s*%/i.test(t)) {
    ratioComplete = true; ratio = { explicit: '100%' };
  }

  const ccM = t.match(/(?:\*\*)?CrossCheck(?:\*\*)?\s*:\s*([^\n]+)/i);
  const crossCheck = ccM ? ccM[1].trim().replace(/^`|`$/g, '').replace(/<[^>]*>/g, '').trim() : '';
  const crossCheckClean = /^clean\b/i.test(crossCheck);

  const partial = /(?:\*\*)?coverageScope(?:\*\*)?\s*:\s*['"`]?\s*PARTIAL/i.test(t);
  const undispositioned = (t.match(/_undispositioned_/g) || []).length;
  const manifestRows = extractManifestRows(t);

  return { mcpDate, hasManifest, ratio, ratioComplete, crossCheck, crossCheckClean, partial, undispositioned, manifestRows };
}

// Parse the Coverage Manifest table rows. Each row is a markdown table line whose cells carry a
// disposition token (`covered-by-TC` / `affordance-probed` / `read-only-verified` / `out-of-scope`).
// We capture per row: { disposition, controlRef (the id/key cell, prefix-stripped), provenance
// (live|oracle|''), evidence (the `evidence:` pointer, or ''), raw }. Scans only the Coverage
// Manifest section so unrelated tables elsewhere in the artifact are never misread.
export function extractManifestRows(text) {
  const t = text || '';
  const headingM = t.match(/^#{2,3}\s+Coverage Manifest[^\n]*$/im);
  if (!headingM) return [];
  const after = t.slice(headingM.index + headingM[0].length);
  // Section ends at the next markdown heading of any level.
  const nextHeading = after.match(/^#{1,6}\s/m);
  const section = nextHeading ? after.slice(0, nextHeading.index) : after;

  const rows = [];
  for (const line of section.split('\n')) {
    if (!/^\s*\|/.test(line)) continue;                 // not a table row
    if (/^\s*\|[-:\s|]+\|\s*$/.test(line)) continue;     // separator row
    const cells = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
    // Disposition cell = first cell whose (backtick-stripped) text starts with a known token.
    let disposition = '';
    for (const c of cells) {
      const bare = c.replace(/^`+|`+$/g, '').trim();
      const hit = ALL_DISPOSITIONS.find(d => bare.toLowerCase().startsWith(d.toLowerCase() + ':') || bare.toLowerCase() === d.toLowerCase());
      if (hit) { disposition = hit; break; }
    }
    if (!disposition) continue;                          // header row or non-disposition row
    // controlRef = the id/key cell — first cell that looks like `prefix:value` / `testid:…` / `id:…`.
    let controlRef = '';
    for (const c of cells) {
      const bare = c.replace(/^`+|`+$/g, '').trim();
      if (/^(testid|id|struct|aria|role|name):/i.test(bare)) { controlRef = bare; break; }
    }
    if (!controlRef && cells.length > 1) controlRef = cells[1].replace(/^`+|`+$/g, '').trim();
    const provM = line.match(/provenance\s*:\s*(live|oracle)\b/i);
    const evM = line.match(/evidence\s*:\s*([^\s|`]+)/i);
    rows.push({
      disposition,
      controlRef,
      provenance: provM ? provM[1].toLowerCase() : '',
      evidence: evM ? evM[1] : '',
      raw: line.trim(),
    });
  }
  return rows;
}

// The distinctive token of a controlRef for the "evidence names the control" (c) check —
// strip a leading `prefix:` and any backticks, keep the first identifier-ish chunk.
function controlCoreToken(controlRef) {
  if (!controlRef) return '';
  const noPrefix = controlRef.replace(/^(testid|id|struct|aria|role|name):/i, '').replace(/`/g, '').trim();
  const m = noPrefix.match(/[A-Za-z0-9_-]{3,}/);
  return m ? m[0] : noPrefix;
}

// Verify a `provenance: live` row's cited machine-emitted evidence artifact, per task 2's (a)/(b)/(c).
// Resolves the evidence pointer (absolute | repo-relative | relative to the artifact's own dir).
//   (a) exists  — the file resolves on disk;
//   (b) fresh   — if the evidence embeds any ISO date, the newest is NOT older than the walk's session
//                 (mtime is deliberately NOT used — git checkout / CI clone reset mtimes → non-deterministic);
//   (c) names   — the evidence content mentions the control's distinctive token.
// Returns { ok, reason }. Best-effort: callers without artifactPath skip this (text-only mode) and
// rely on the oracle / missing-provenance text checks alone.
function checkEvidenceArtifact(evidencePointer, controlRef, mcpDate, artifactPath) {
  if (!evidencePointer) return { ok: false, reason: `provenance: live but no 'evidence:' pointer cited` };
  const candidates = [];
  if (isAbsolute(evidencePointer)) candidates.push(evidencePointer);
  else {
    if (artifactPath) candidates.push(join(dirname(artifactPath), evidencePointer));
    candidates.push(join(REPO_ROOT, evidencePointer));
  }
  let resolved = '';
  for (const c of candidates) { try { if (existsSync(c)) { resolved = c; break; } } catch { /* ignore */ } }
  if (!resolved) return { ok: false, reason: `evidence file not found: ${evidencePointer}` };
  let content = '';
  try { content = readFileSync(resolved, 'utf-8'); } catch { return { ok: false, reason: `evidence file unreadable: ${evidencePointer}` }; }
  // (c) names the control
  const core = controlCoreToken(controlRef);
  if (core && !content.toLowerCase().includes(core.toLowerCase())) {
    return { ok: false, reason: `evidence ${evidencePointer} does not name the control "${core}"` };
  }
  // (b) not stale/reused — embedded dates must not predate the walk session
  if (mcpDate) {
    const dates = (content.match(/\d{4}-\d{2}-\d{2}/g) || []).sort();
    if (dates.length > 0 && dates[dates.length - 1] < mcpDate) {
      return { ok: false, reason: `evidence ${evidencePointer} is stale/reused (newest embedded date ${dates[dates.length - 1]} < session ${mcpDate})` };
    }
  }
  return { ok: true, reason: '' };
}

// ISO dates sort lexically. Missing date → conservatively NOT grandfathered (in-scope).
export function isGrandfathered(mcpDate, landingDate = COVERAGE_GATE_LANDING_DATE) {
  if (!mcpDate) return false;
  return mcpDate < landingDate;
}

/**
 * @param {string} text  the walk artifact's full markdown.
 * @param {string} [landingDate]  the coverage-gate grandfather date.
 * @param {{artifactPath?:string, provenanceLandingDate?:string}} [opts]
 *   artifactPath enables on-disk evidence verification (exists / fresh / names-control). Without it,
 *   the provenance check degrades to text-only (still rejects `oracle` + missing-provenance on
 *   observation rows; deep evidence-file verification is deferred). provenanceLandingDate overrides
 *   PROVENANCE_GATE_LANDING_DATE (testing).
 * @returns {{ applicable:boolean, complete:boolean, reasons:string[], provenanceFail:boolean, signals:object }}
 *   applicable=false (and complete=true) when grandfathered OR no Coverage Manifest present —
 *   Cx only governs walk artifacts that opted into the manifest contract on/after the landing date.
 *   provenanceFail=true marks a FABRICATION-class failure (oracle / missing-provenance / missing-or-stale
 *   evidence on an observation-claiming row) — distinct from a mundane ratio/crosscheck incompleteness —
 *   so the closure gate can reject the whole walk and write an integrity strike.
 */
export function coverageVerdict(text, landingDate = COVERAGE_GATE_LANDING_DATE, opts = {}) {
  const { artifactPath = '', provenanceLandingDate = PROVENANCE_GATE_LANDING_DATE } = opts;
  const s = parseCoverageSignals(text);
  if (!s.hasManifest) return { applicable: false, complete: true, reasons: ['no-coverage-manifest'], provenanceFail: false, signals: s };
  if (isGrandfathered(s.mcpDate, landingDate)) {
    return { applicable: false, complete: true, reasons: [`grandfathered (MCP_Session_Date ${s.mcpDate} < ${landingDate})`], provenanceFail: false, signals: s };
  }
  const reasons = [];
  if (!s.ratioComplete) reasons.push(`Coverage_Ratio not 100% (${s.ratio ? (s.ratio.n + '/' + s.ratio.m) : 'missing/unparseable'})`);
  if (!s.crossCheckClean) reasons.push(`CrossCheck != clean ("${s.crossCheck || 'missing'}")`);
  if (s.partial) reasons.push('coverageScope: PARTIAL present');
  if (s.undispositioned > 0) reasons.push(`${s.undispositioned} undispositioned manifest row(s)`);

  // === Provenance sub-gate (SUBPLAN_CGS_B) — only for artifacts on/after PROVENANCE_GATE_LANDING_DATE ===
  let provenanceFail = false;
  if (!isGrandfathered(s.mcpDate, provenanceLandingDate)) {
    for (const row of (s.manifestRows || [])) {
      const ref = row.controlRef || '(unlabeled row)';
      if (OBSERVATION_DISPOSITIONS.includes(row.disposition)) {
        if (row.provenance === 'oracle') {
          reasons.push(`row "${ref}" claims observation (${row.disposition}) but provenance: oracle — classify live or move out-of-scope`);
          provenanceFail = true;
        } else if (row.provenance !== 'live') {
          reasons.push(`row "${ref}" ${row.disposition} missing 'provenance: live' + machine evidence (un-fakeable proof required on observation rows)`);
          provenanceFail = true;
        } else {
          // provenance: live — verify the cited evidence artifact (deep check needs artifactPath;
          // even without it, a missing 'evidence:' pointer is a text-detectable fail).
          if (!row.evidence) {
            reasons.push(`row "${ref}" provenance: live but cites no 'evidence:' artifact`);
            provenanceFail = true;
          } else if (artifactPath) {
            const ev = checkEvidenceArtifact(row.evidence, row.controlRef, s.mcpDate, artifactPath);
            if (!ev.ok) { reasons.push(`row "${ref}" ${ev.reason}`); provenanceFail = true; }
          }
        }
      } else if (row.disposition === 'covered-by-TC' && row.provenance === 'oracle') {
        reasons.push(`row "${ref}" covered-by-TC contradicts provenance: oracle (a TC is live evidence; oracle = classified-from-spec)`);
        provenanceFail = true;
      }
    }
  }

  return { applicable: true, complete: reasons.length === 0, reasons, provenanceFail, signals: s };
}
