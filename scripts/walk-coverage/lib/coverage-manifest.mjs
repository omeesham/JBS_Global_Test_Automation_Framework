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
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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

// Artifacts dated on/after this date MUST include a Coverage Manifest or the gate denies.
// Configurable via opts.manifestMandatoryDate (tests) or closure-config.json manifest_mandatory_date.
export const MANIFEST_MANDATORY_DATE = '2026-07-22';

// Allowlist patterns for `out-of-scope` row reason text. Reason must be ≥20 chars AND match at
// least one pattern. Prevents blanket OOS dumps with no cited rule or structural justification.
const OOS_CITATION_RX = [
  /^LR-\d{3}/i,
  /^LR-ENC-\d{3}/i,
  /^ALL-\d{3}/i,
  /^NM-\d{3,5}/i,
  /^EXEMPT:(LR-\w+|NM-\d{3,5})\b/i,
  /^not-interactive\b/i,
  /^outside-module\b/i,
  /^third-party\b/i,
  /^duplicate-of:/i,
];

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

  const completionRef = (t.match(/(?:\*\*)?Completion_Record(?:\*\*)?\s*:\s*([^\n]+)/i) || [])[1]?.trim() || '';
  const hasCompletionRecord = !!completionRef;
  return { mcpDate, hasManifest, ratio, ratioComplete, crossCheck, crossCheckClean, partial, undispositioned, manifestRows, completionRef, hasCompletionRecord };
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

// Verify the completion-record JSON referenced by a manifest's `Completion_Record:` frontmatter key.
// Returns { ok, reason, data }. Handles halted status with exemption check (Item 5 gate side).
function checkCompletionRecord(completionRef, artifactPath) {
  if (!completionRef) return { ok: false, reason: 'Completion_Record absent' };
  const jsonRel = completionRef.replace(/\s*\(.*\)$/, '').trim();
  const jsonPath = isAbsolute(jsonRel) ? jsonRel : join(REPO_ROOT, jsonRel);
  if (!existsSync(jsonPath)) return { ok: false, reason: `Completion_Record JSON not found: ${jsonRel}` };
  let data;
  try { data = JSON.parse(readFileSync(jsonPath, 'utf-8')); } catch { return { ok: false, reason: 'Completion_Record JSON unparseable' }; }
  const cr = data.completion_record;
  if (!cr) return { ok: false, reason: 'Completion_Record JSON lacks completion_record field' };
  if (cr.status === 'halted') {
    // Item 5: check for a valid unexpired human exemption in .claude/walk-exemptions.json
    const exemptionsPath = join(REPO_ROOT, '.claude/walk-exemptions.json');
    let exemptions = [];
    try {
      if (existsSync(exemptionsPath)) {
        exemptions = JSON.parse(readFileSync(exemptionsPath, 'utf-8')).exemptions || [];
      }
    } catch { /* no valid exemptions */ }
    const now = new Date();
    const match = exemptions.find(e =>
      (cr.surfaces_attempted || []).some(s => s.includes(e.module)) &&
      e.expires && new Date(e.expires) > now
    );
    if (match) return { ok: true, reason: `HALTED but exempted: ${match.reason} (by ${match.granted_by})` };
    return { ok: false, reason: `HALTED — no valid exemption. halt_reasons: ${(cr.halt_reasons || []).join('; ')}` };
  }
  if (cr.status !== 'complete') return { ok: false, reason: `Completion_Record unknown status: ${cr.status}` };
  // Anti-tamper: content_sha256 is REQUIRED for complete records — its absence means the hash check was skipped.
  if (!cr.content_sha256) {
    return { ok: false, reason: 'Completion_Record missing content_sha256 — re-run enumerate-page.mjs' };
  }
  const stripped = JSON.parse(JSON.stringify(data));
  delete stripped.completion_record.content_sha256;
  const expected = createHash('sha256').update(JSON.stringify(stripped, null, 2) + '\n').digest('hex');
  if (cr.content_sha256 !== expected) return { ok: false, reason: 'Completion_Record JSON content_sha256 mismatch (file tampered)' };
  return { ok: true, data: cr };
}

// ISO dates sort lexically. Missing date → conservatively NOT grandfathered (in-scope).
export function isGrandfathered(mcpDate, landingDate = COVERAGE_GATE_LANDING_DATE) {
  if (!mcpDate) return false;
  return mcpDate < landingDate;
}

// Returns the YYYY-MM-DD of the first git commit that added artifactPath, or null on any error/untracked.
// Uses --diff-filter=A so only the add-commit is returned; the last output line is the oldest (first-add).
function getGitFirstCommitDate(artifactPath) {
  if (!artifactPath) return null;
  try {
    const relPath = artifactPath.startsWith(REPO_ROOT)
      ? artifactPath.slice(REPO_ROOT.length).replace(/^[\\/]/, '').replace(/\\/g, '/')
      : artifactPath.replace(/\\/g, '/');
    const result = spawnSync(
      'git',
      ['log', '--follow', '--diff-filter=A', '--format=%aI', '--', relPath],
      { cwd: REPO_ROOT, encoding: 'utf-8', timeout: 5000 }
    );
    if (result.status !== 0 || result.error || !result.stdout) return null;
    const lines = result.stdout.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    const m = lines[lines.length - 1].match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  } catch {
    // git unavailable, not a repo, or unexpected error — treat as null (enforced, not grandfathered).
    return null;
  }
}

// Determine whether an artifact is SUBJECT TO the mandate (coverage gate / manifest requirement).
// Uses ONLY non-forgeable signals — mtime is author-forgeable (touch -d) and is deliberately excluded.
// Fail-closed: on any uncertainty, treat the artifact as subject to the mandate.
//
// ENFORCE (subject) if ANY:
//   - signals.hasCompletionRecord: machine completion record present on this artifact
//   - git first-commit date >= mandatoryDate: file was added on/after the mandate
//   - git UNKNOWN / untracked (no first-commit date): a NEW file — always enforce
// GRANDFATHER (not subject) ONLY if: !hasCompletionRecord AND git-first-commit-date EXISTS AND < mandatoryDate.
export function isSubjectToMandate(artifactPath, signals, mandatoryDate = MANIFEST_MANDATORY_DATE) {
  if (signals.hasCompletionRecord) return true;
  const gitDate = getGitFirstCommitDate(artifactPath);
  if (gitDate !== null) {
    return gitDate >= mandatoryDate;
  }
  // No git date — file is untracked or git unavailable. mtime is author-forgeable, so we
  // never use it as a grandfather signal. Fail toward enforcement on all such uncertainty.
  return true;
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
  const { artifactPath = '', provenanceLandingDate = PROVENANCE_GATE_LANDING_DATE, manifestMandatoryDate = MANIFEST_MANDATORY_DATE } = opts;
  const s = parseCoverageSignals(text);
  if (!s.hasManifest) {
    if (!isSubjectToMandate(artifactPath, s, manifestMandatoryDate)) {
      return { applicable: false, complete: true, reasons: ['no-coverage-manifest (pre-mandatory-date)'], provenanceFail: false, signals: s };
    }
    return { applicable: true, complete: false,
      reasons: [`Coverage Manifest ABSENT — run \`npm run walk:enumerate\` (LR-062). Mandatory for artifacts dated >= ${manifestMandatoryDate}`],
      provenanceFail: false, signals: s };
  }
  if (!isSubjectToMandate(artifactPath, s, landingDate)) {
    return { applicable: false, complete: true, reasons: [`grandfathered (git-old TRACKED artifact, no Completion_Record, first-commit < ${landingDate})`], provenanceFail: false, signals: s };
  }
  const reasons = [];
  if (!s.ratioComplete) reasons.push(`Coverage_Ratio not 100% (${s.ratio ? (s.ratio.n + '/' + s.ratio.m) : 'missing/unparseable'})`);
  if (!s.crossCheckClean) reasons.push(`CrossCheck != clean ("${s.crossCheck || 'missing'}")`);
  if (s.partial) reasons.push('coverageScope: PARTIAL present');
  if (s.undispositioned > 0) reasons.push(`${s.undispositioned} undispositioned manifest row(s)`);

  // === Provenance sub-gate (SUBPLAN_CGS_B) — only for artifacts on/after PROVENANCE_GATE_LANDING_DATE ===
  let provenanceFail = false;
  if (isSubjectToMandate(artifactPath, s, provenanceLandingDate)) {
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

  // Item 3: out-of-scope citation validation + 15% global cap
  const oosRows = (s.manifestRows || []).filter(r => r.disposition === 'out-of-scope');
  const totalRows = (s.manifestRows || []).length;
  for (const row of oosRows) {
    const reasonText = row.raw.match(/out-of-scope\s*:\s*([^|`\n]+)/i)?.[1]?.trim() || '';
    if (reasonText.length < 20) {
      reasons.push(`out-of-scope "${row.controlRef}" reason <20 chars`);
    }
    if (!OOS_CITATION_RX.some(rx => rx.test(reasonText))) {
      reasons.push(`out-of-scope "${row.controlRef}" lacks allowlist citation`);
    }
  }
  if (totalRows > 0 && oosRows.length / totalRows > 0.15) {
    reasons.push(`out-of-scope rows exceed 15% global cap (${oosRows.length}/${totalRows} = ${Math.round(oosRows.length / totalRows * 100)}%)`);
  }

  // Item 2 gate side: Completion_Record required for post-mandatory-date artifacts
  if (isSubjectToMandate(artifactPath, s, manifestMandatoryDate)) {
    if (!s.hasCompletionRecord) {
      reasons.push('Completion_Record frontmatter missing — re-run enumerate-page.mjs');
    } else if (artifactPath) {
      const crCheck = checkCompletionRecord(s.completionRef, artifactPath);
      if (!crCheck.ok) reasons.push(crCheck.reason);
    }
  }

  return { applicable: true, complete: reasons.length === 0, reasons, provenanceFail, signals: s };
}
