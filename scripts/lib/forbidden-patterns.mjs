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
  // Internal unit-test directory (tests/_unit) — framework self-tests, never client deliverables.
  /\/tests\/_unit\//,
  // Any underscore-prefixed internal test subdirectory (generalised form of the above).
  /\/tests\/_[^/]+\//,
];

// ── Repo-wide markers (sentinels that should never appear anywhere) ───────────
// The last entry is the profanity / crude-word guard (added 2026-07-03). Its
// source is deliberately OBFUSCATED (`f(?:u)ck`, not the literal token) so this
// pattern module — and the write-time jargon hook that imports it — never
// self-match on their own definition, and a naive `grep` of the repo for the
// literal word returns zero. It matches the whole family case-insensitively:
// the bare word, unfuck*, fuckup*, fucked. (A rare base64 blob can contain the
// substring; such report files live under deny-listed specs_planning and are not
// normally committed — rename/exclude if one ever trips this.)
export const MARKER_GREP = [/TEMP_RUTVIK_EXPERIMENT/, /v-rutvik/, /khosariya/, /f(?:u)ck/i];

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

  // ── Runtime Proxy interception in client page-object code ─────────────────
  // Sev: S1 — silent quality drift; a Proxy intercepting method calls hides
  // per-method labelling from every reader of the source.
  // Graduating incident: PLAN_FIX_AT_SOURCE_NOT_WRAPPERS, 2026-07-31 — the
  // page-object step Proxy was retired and replaced by per-method @step decorators.
  // Scope: client source only (isClientShipping path gate applied by consumers).
  /\bnew Proxy\s*\(/,
  /\bProxyHandler\b/,
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
  /\b(?:ALL|AUD|PLN|GEN|HLR|MNT)-\d{2,3}\b/,
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
  /\bwalk[ -]evidence\b/i,
  /\bfield[ -]inventor/i,
  /\bneutral-eye\b/,
  /\bencore-questions\b/,
  /\brejection-affordance\b/,
  /\brca-[a-z0-9-]+\.md\b/,
  /\b_internal\//,
  // Renamed-away directory paths — dead in shipped source. The test dir was renamed
  // `specs/` -> `tests/`; any surviving `specs/` reference in a shipped comment/doc is stale.
  // Safe: `specs/` never matches `specs_planning/` (underscore, not slash).
  /\bspecs\//,

  // ── 2026-07-09 comment-scrub additions ──────────────────────────────────────
  // Families found leaking in shipped test/page/selector comments during the
  // deliverable comment-scrub. Every pattern below was FAIL-GREEN verified: ZERO
  // occurrences across the 124 cleaned client-source files before being added, so
  // the write-time hook + ship gate wedge nothing legitimate. Two families are
  // deliberately NARROWED (not the bare word) to avoid colliding with possible
  // Encore equipment codes / product-group names:
  //   - RCA  -> only the label forms (RCA-fix / RCA note / RCA <TC-ID> / RCA <date>),
  //             NOT bare "RCA" (could be an equipment connector code).
  //   - MCP  -> only "MCP-verified" / "MCP verification" / "MCP-RCA" tool refs,
  //             NOT bare "MCP".
  //   - The refactor "Group A-1" label is caught via `lifecycle refactor` below,
  //             not a standalone `Group [A-Z]-\d` (that would hit product groups).
  // Refactor-changelog labels
  /\blifecycle refactor\b/i,
  /\bRelocated 20\d\d\b/,
  // Root-Cause-Analysis process labels (narrowed — see note above)
  /\bRCA[- ](?:fix|note|protocol|Step|[A-Z]{2,5}-\d|\d{4}-\d{2}-\d{2})/,
  /\bmama-led\b/,
  /\bprobe outcome\b/i,
  /\baudit refit\b/i,
  // AI-tooling / agent-fleet vocabulary
  /\bMCP[ -]?(?:verif|RCA)/i,
  /\bSubagent [A-Z]\b/,
  // Internal plan / artifact references
  /\bsubplan\b/i,
  /\bmaster plan\b/i,
  /\bExecution Summary\b/, // case-sensitive: the plan-section artifact name, not lowercase prose
  /\bchat handoff\b/i,
  /\bfield-coverage catalog\b/i,
  /\bcatalog\/MD\b/,
  /\bREQUIREMENTS(?:_API)?\.md\b/,
  /\bdependency-gate removal\b/i,
  // Fragile cross-file line-pointers (`base.page.ts:448`, `auth.setup.ts:121`) — line
  // numbers drift; the reference rots. Bans the `<file>.ts:<line>` / `<file>.page.ts:<line>` form.
  /\b[a-z][\w-]*\.(?:page\.)?ts:\d+/,

  // ── 2026-08-08 internal-tracking-ID denylist ─────────────────────────────────
  // Internal defect / bug tracking identifiers that follow the PREFIX-MODULE-NNN
  // shape. Graduating incident: DEF-TNC-002 and DEF-TNC-005 shipped in four
  // client-visible test names on 2026-08-07 because `DEF-` was never on the list.
  // This is a DENYLIST (not a true floor): it enumerates every internal-tracker
  // prefix family judged plausible for this team's workflows. If a new family
  // emerges, the alternation must be extended — the pattern will not catch unknown
  // prefixes automatically. A broader floor (match any PREFIX-MODULE-NNN and
  // exclude known-safe prefixes) was considered but rejected: the false-positive
  // surface is too wide — product codes, equipment IDs, and Angular enum tokens
  // all share the shape, and an exclusion list that must grow with every new
  // legitimate token is more fragile than a denylist that grows only when a new
  // internal tracker family is invented (rare, auditable event).
  // DELIBERATELY EXCLUDED from the denylist:
  //   `NM-####` — the client's own Jira tickets (LR-058 mandate: must never match).
  //   `TC-`     — deliverable test-case naming convention, not internal tracking.
  // Fix: reword the sentence so the meaning survives without the identifier —
  // never delete the sentence, and never bypass the gate.
  /\b(?:DEF|BUG|FIX|INC|ESC|ISSUE|TASK|FEAT|ENH|RFE)-[A-Z]{2,5}(?:-[A-Z]{2,5})?-?\d+\b/,
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
