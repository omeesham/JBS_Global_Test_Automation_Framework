/**
 * scripts/lib/forbidden-patterns.mjs
 *
 * SINGLE SOURCE OF TRUTH for "what internal vocabulary / files must never ship to a client".
 * Imported by BOTH enforcement layers so they can never drift apart:
 *
 *   - scripts/verify-no-forbidden.mjs        — commit/ship-time DETECTIVE gate
 *                                              (.githooks pre-commit `--staged-diff`, ship `--target`)
 *   - .claude/hooks/lib/check-jargon.mjs     — write-time PREVENTIVE gate (LR-058)
 *                                              (PreToolUse Edit/Write/NotebookEdit — blocks the token
 *                                               from ever being written into a shippable file)
 *
 * The detective gate caught the 2026-06-11 reintroduction of 25 jargon comment lines AFTER the
 * 2026-06-10 scrub — but only at `git add` time, because both build sessions left work uncommitted.
 * The preventive hook closes that window by scanning new content at write time. Putting the pattern
 * sets here means one edit updates both layers; a pattern added for the gate is automatically
 * enforced at authoring time too.
 */

// ── File-path deny globs (structural — these PATHS never ship) ────────────────
export const DENY_GLOBS = [
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
  /\/\.git\//,
  /\/\.github\//,
  /\/\.claude\//,
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

// ── Repo-wide markers (sentinels that should never appear anywhere) ───────────
export const MARKER_GREP = [/TEMP_RUTVIK_EXPERIMENT/, /v-rutvik/, /khosariya/];

// ── Client-shipping-only markers (hard tokens) ───────────────────────────────
// Scanned ONLY in client-shipping files (target output, or a staged path under
// clients/<id>/ that would survive the DENY_GLOB filter). Framework-internal files
// (rules, docs, hooks, root CLAUDE.md) legitimately reference these terms, so applying
// them repo-wide would wedge normal commits.
export const MARKER_GREP_CLIENT_ONLY = [
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

// ── Source-comment jargon (soft tokens — GATE-INVISIBLE to the hard set above) ─
// Internal-process vocabulary that must never ship inside client source comments/JSDoc.
// These don't break a build, only professionalism/readability, so this curated array
// extends the same client-shipping scope to them. A one-time scrub is not enough — this
// makes a reintroduction fail the ship/commit gate AND (via the preventive hook) the write.
//
// FAIL-GREEN DISCIPLINE: every pattern here was confirmed to have ZERO occurrences in the
// clean shipped tree before being added, so the gate wedges nothing legitimate. Patterns are
// deliberately unambiguous internal IDs/artifacts. DELIBERATELY EXCLUDED (would false-positive
// on legitimate code/vocab, or kept by product decision): `NM-####` (client's own Jira tickets),
// `oracle` (legit: OracleProductCode field / Oracle DB), `recon` (matches reconcile/reconnect),
// `FCC` (used in functional `@fcc` tags + describe titles), `Path [C-Z]` (collides with Windows
// drive paths like `Path D:\`), `F11` (a keyboard key), and the `field-case-runner.ts` filename
// (a real shipped file legitimately referenced by name). This array is intentionally distinct from
// `xlsx-lint-rules.mjs` `BANNED` — that one is tuned for plain-English workbook cells and is far
// more aggressive than is safe for source (Angular, Playwright, data-testid, HTTP verbs, etc.).
export const SOURCE_COMMENT_JARGON = [
  // Internal rule / requirement IDs
  /\bLR-(?:ENC-)?\d{3}\b/,
  /\b(?:ALL|AUD|PLN|GEN|HLR)-\d{2,3}\b/,
  /\bREQ-\d{3}\b/,
  // Internal doctrine / section references. Widened 2026-06-11 from /\bDoctrine\s+\d/
  // (case-sensitive, no infix) to also catch the lowercase "doctrine item N" form that
  // shipped in the 2026-06-11 reintroduction.
  /\b[Dd]octrine\s+(?:item\s+)?\d/,
  /§/,
  // Internal wave / phase / question IDs
  /\bWave-1\.5\b/,
  /\bWV15\b/,
  /\bQ-WV\d/,
  /\bCPR-WV/,
  /\bCPR-\d+-Q\d/,
  /\bW15-[0-9A-Za-z]/,
  /\bEDGE_P\d/,
  // Internal artifact names / paths. The `rca-*.md` + `_internal/` patterns were added
  // 2026-06-11 — the reintroduction referenced `rca-launcher-dialog-misses-2026-06-11.md`
  // and `_internal/...` paths, neither of which the original (walk-evidence / field-inventor)
  // patterns covered, so a comment carrying ONLY those tokens would have shipped.
  /\bwalk-evidence\b/,
  /\bfield-inventor/,
  /\bneutral-eye\b/,
  /\bencore-questions\b/,
  /\brejection-affordance\b/,
  /\brca-[a-z0-9-]+\.md\b/,
  /\b_internal\//,
];

// ── Shared helpers ───────────────────────────────────────────────────────────
export function matchesDeny(rel) {
  return DENY_GLOBS.some((re) => re.test(rel));
}

// True when a repo path would survive the DENY_GLOB filter and ship inside
// clients/<id>/. Used to scope the client-only + source-comment pattern sets.
export function isClientShipping(rel) {
  const norm = String(rel).replace(/\\/g, '/');
  const m = norm.match(/^clients\/[^/]+\/(.+)$/);
  if (!m) return false;
  return !matchesDeny('/' + m[1]);
}
