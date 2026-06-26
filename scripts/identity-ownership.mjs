// identity-ownership.mjs — machine mirror of AGENT_SHARED_RULES.md §2 + §2.1.
//
// Single source of truth for hook-time + /execute-time identity ownership
// enforcement. The markdown §2 table is the HUMAN-readable spec; this file is
// its MACHINE-readable twin. Keep in sync; the parity checker
// `scripts/check-identity-ownership.mjs` fails if they drift.
//
// Codenames: HUNTER (Requirements) | GIVER (Planner) | BUILDER (Generator)
//            HEALER | WATCHDOG (Audit) | GARDENER (Framework Maintainer)
//            OWNER (non-pipeline, Step 8 inline in /identity SKILL.md)
//
// Action vocabulary (from §2):
//   "RW"       — full read + write
//   "CREATE"   — may create new files in this area
//   "UPDATE"   — may modify existing files
//   "ADD"      — may append new entries (selectors, methods)
//   "APPEND"   — may append rows to log/markdown, never rewrite
//   "FIX"      — may modify in narrow repair scope
//   "REFACTOR" — structural changes only, not business logic
//   "READ"     — read-only
//   "SYNC"     — read-only in-place; modified only via a sync script
//   "—"        — no access
//
// Unauthorized actions: HARD_STOP (returned by ownershipFor for paths matching
// the universal HARD STOPS list — .env*, playwright.config.*, package.json,
// tsconfig.json, .ci/*). No identity writes these; only humans.

export const IDENTITIES = ["HUNTER", "GIVER", "BUILDER", "HEALER", "WATCHDOG", "GARDENER", "OWNER"];

// Universal HARD STOPS (from §2 "Human-Controlled (NEVER modify)").
// Glob patterns; checked first, override all identity grants.
export const HARD_STOPS = [
  /(^|\/)\.env(\.|$)/,
  /(^|\/)playwright\.config\.[cmj]?ts?$/,
  /(^|\/)package\.json$/,
  /(^|\/)tsconfig(\..+)?\.json$/,
  /(^|\/)\.ci\//,
];

// Script-controlled paths — any identity may only READ; .github/agents/* files
// are modified ONLY via `npm run sync:mistakes`.
export const SYNC_ONLY = [
  /(^|\/)\.github\/agents\/.*\.agent\.md$/,
];

// Rows from AGENT_SHARED_RULES.md §2 "File Ownership (Compact)" table.
// Each row: {pattern, grants: {IDENTITY: ACTION}}.
// Client-scoped paths use `${ACTIVE_CLIENT}` literal — resolved at lookup time.
//
// IMPORTANT: Keep these row objects in declaration order matching the §2 table.
// The parity checker matches row-by-row by `pattern` string; do not re-order.

export const OWNERSHIP_ROWS = [
  {
    pattern: "clients/${ACTIVE_CLIENT}/tests/**/*.spec.ts",
    grants: { HUNTER: "—", GIVER: "—", BUILDER: "CREATE", HEALER: "FIX", WATCHDOG: "READ", GARDENER: "REFACTOR", OWNER: "READ" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/src/data/**",
    grants: { HUNTER: "—", GIVER: "—", BUILDER: "CREATE", HEALER: "FIX", WATCHDOG: "READ", GARDENER: "READ", OWNER: "READ" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/src/pages/**/*.page.ts",
    grants: { HUNTER: "—", GIVER: "READ", BUILDER: "ADD", HEALER: "FIX", WATCHDOG: "READ", GARDENER: "REFACTOR", OWNER: "READ" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/src/pages/base.page.ts",
    grants: { HUNTER: "—", GIVER: "READ", BUILDER: "—", HEALER: "—", WATCHDOG: "READ", GARDENER: "REFACTOR", OWNER: "READ" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/src/selectors/**",
    grants: { HUNTER: "—", GIVER: "ADD", BUILDER: "ADD", HEALER: "FIX", WATCHDOG: "READ", GARDENER: "READ", OWNER: "READ" },
  },
  {
    pattern: "src/utils/env-config.ts",
    grants: { HUNTER: "—", GIVER: "READ", BUILDER: "ADD", HEALER: "FIX", WATCHDOG: "READ", GARDENER: "READ", OWNER: "READ" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md",
    grants: { HUNTER: "UPDATE", GIVER: "READ", BUILDER: "READ", HEALER: "READ", WATCHDOG: "READ", GARDENER: "READ", OWNER: "READ" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-queue.json",
    grants: { HUNTER: "CREATE", GIVER: "RW", BUILDER: "RW", HEALER: "RW", WATCHDOG: "RW", GARDENER: "READ", OWNER: "READ" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/test-cases/**",
    grants: { HUNTER: "—", GIVER: "CREATE", BUILDER: "UPDATE", HEALER: "UPDATE", WATCHDOG: "READ", GARDENER: "READ", OWNER: "UPDATE" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/test-plans/**",
    grants: { HUNTER: "—", GIVER: "CREATE", BUILDER: "READ", HEALER: "READ", WATCHDOG: "READ", GARDENER: "READ", OWNER: "READ" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md",
    grants: { HUNTER: "APPEND", GIVER: "APPEND", BUILDER: "APPEND", HEALER: "APPEND", WATCHDOG: "RW", GARDENER: "APPEND", OWNER: "APPEND" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md",
    grants: { HUNTER: "APPEND", GIVER: "APPEND", BUILDER: "APPEND", HEALER: "APPEND", WATCHDOG: "APPEND", GARDENER: "APPEND", OWNER: "APPEND" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/rca-*.md",
    grants: { HUNTER: "READ", GIVER: "READ", BUILDER: "READ", HEALER: "CREATE", WATCHDOG: "READ", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/intake/<module>-<agent>-*.md",
    grants: { HUNTER: "CREATE", GIVER: "CREATE", BUILDER: "CREATE", HEALER: "CREATE", WATCHDOG: "CREATE", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/old-site-baseline/<module>-*.md",
    grants: { HUNTER: "CREATE", GIVER: "READ", BUILDER: "READ", HEALER: "UPDATE", WATCHDOG: "UPDATE", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/walk-evidence-*.md",
    grants: { HUNTER: "CREATE", GIVER: "CREATE", BUILDER: "READ", HEALER: "UPDATE", WATCHDOG: "UPDATE", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/bug-archetypes.md",
    grants: { HUNTER: "APPEND", GIVER: "APPEND", BUILDER: "READ", HEALER: "APPEND", WATCHDOG: "APPEND", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/_TEMPLATE.md",
    grants: { HUNTER: "READ", GIVER: "READ", BUILDER: "READ", HEALER: "READ", WATCHDOG: "READ", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/<module>-*.md",
    grants: { HUNTER: "READ", GIVER: "CREATE", BUILDER: "READ", HEALER: "UPDATE", WATCHDOG: "UPDATE", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventory-spec.md",
    grants: { HUNTER: "READ", GIVER: "READ", BUILDER: "READ", HEALER: "READ", WATCHDOG: "READ", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-case-generation.md",
    grants: { HUNTER: "READ", GIVER: "RW", BUILDER: "READ", HEALER: "READ", WATCHDOG: "READ", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-case-catalogs/<module>-*.md",
    grants: { HUNTER: "READ", GIVER: "RW", BUILDER: "READ", HEALER: "READ", WATCHDOG: "READ", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "reports/bugs/BUG-*.json",
    grants: { HUNTER: "READ", GIVER: "READ", BUILDER: "CREATE", HEALER: "CREATE", WATCHDOG: "READ", GARDENER: "READ", OWNER: "RW" },
  },
  {
    pattern: "scripts/**",
    grants: { HUNTER: "—", GIVER: "—", BUILDER: "—", HEALER: "—", WATCHDOG: "—", GARDENER: "—", OWNER: "RW" },
  },
  {
    pattern: "config/**",
    grants: { HUNTER: "—", GIVER: "—", BUILDER: "—", HEALER: "—", WATCHDOG: "—", GARDENER: "—", OWNER: "RW" },
  },
  {
    pattern: ".claude/skills/**",
    grants: { HUNTER: "—", GIVER: "—", BUILDER: "—", HEALER: "—", WATCHDOG: "—", GARDENER: "—", OWNER: "RW" },
  },
  {
    pattern: "plans/**",
    grants: { HUNTER: "—", GIVER: "—", BUILDER: "—", HEALER: "—", WATCHDOG: "—", GARDENER: "—", OWNER: "RW" },
  },
  {
    // §2 post-2026-04-27 Copilot eviction: governance-owned, direct OWNER edits,
    // no SYNC-ONLY. `.github/agents/*.agent.md` legacy SYNC behavior (if those
    // files exist) is still covered by the SYNC_ONLY array above.
    pattern: ".claude/agents/**",
    grants: { HUNTER: "—", GIVER: "—", BUILDER: "—", HEALER: "—", WATCHDOG: "—", GARDENER: "—", OWNER: "RW" },
  },
];

// OWNER Step 8 inline extensions — not in the main §2 table because they are
// OWNER-only catch-alls. These are checked AFTER OWNERSHIP_ROWS so specific
// rows in the table take precedence.
export const OWNER_CATCHALL_RW = [
  /^\.claude\/hooks\//,
  /^\.claude\/context\//,
  /^\.claude\/state\//,
  /^\.claude\/settings\.json$/,
  /^\.claude\/agents\//,
  /^docs\//,       // general docs — REQUIREMENTS is governed by specific row above
  /^website\//,
  /^CLAUDE\.md$/,
];

export const OWNER_CATCHALL_READ = [
  /^tests\//,
  /^clients\/[^/]+\/src\//,
  /^clients\/[^/]+\/tests\//,
  /^clients\/[^/]+\/CLAUDE\.md$/,
];

// Resolve ${ACTIVE_CLIENT} placeholder to env var or default.
function resolveActiveClient(pattern) {
  const client = process.env.ACTIVE_CLIENT || "encore";
  return pattern.replaceAll("${ACTIVE_CLIENT}", client);
}

// Convert a glob-style pattern to a RegExp.
// Supports: ** (recursive), * (single segment), <placeholder> (single segment).
function globToRegExp(glob) {
  const resolved = resolveActiveClient(glob);
  let rx = "";
  let i = 0;
  while (i < resolved.length) {
    const c = resolved[i];
    if (c === "*" && resolved[i + 1] === "*") {
      // ** matches any path (including /)
      rx += ".*";
      i += 2;
      if (resolved[i] === "/") i++; // consume trailing /
    } else if (c === "*") {
      rx += "[^/]*";
      i++;
    } else if (c === "<") {
      // <placeholder> — match one path segment
      const end = resolved.indexOf(">", i);
      if (end === -1) { rx += "\\<"; i++; continue; }
      rx += "[^/]+";
      i = end + 1;
    } else if ("/.+?()[]{}\\$^|".includes(c)) {
      rx += "\\" + c;
      i++;
    } else {
      rx += c;
      i++;
    }
  }
  return new RegExp("^" + rx + "$");
}

/**
 * Returns the ownership cell for (identity, path).
 *
 * Precedence:
 *   1. HARD_STOPS → "HARD_STOP" (never writable by any identity)
 *   2. Explicit OWNERSHIP_ROWS match (most-specific wins — last matching row)
 *   3. SYNC_ONLY → "SYNC ONLY" for any identity (read effectively)
 *   4. OWNER catch-all RW → "RW" (OWNER only)
 *   5. OWNER catch-all READ → "READ" (OWNER only)
 *   6. Default → "—"
 */
export function ownershipFor(identity, rawPath) {
  if (!IDENTITIES.includes(identity)) {
    return { action: "—", reason: `unknown identity: ${identity}` };
  }

  // Normalize path to forward slashes, strip leading ./
  const path = rawPath.replace(/\\/g, "/").replace(/^\.\//, "");

  // 1. Hard stops universal
  for (const rx of HARD_STOPS) {
    if (rx.test(path)) return { action: "HARD_STOP", reason: "Human-controlled file — no identity writes" };
  }

  // 2. Most-specific OWNERSHIP_ROWS match. Iterate all rows; last match wins.
  let match = null;
  for (const row of OWNERSHIP_ROWS) {
    const rx = globToRegExp(row.pattern);
    if (rx.test(path)) match = row;
  }
  if (match) {
    return { action: match.grants[identity], reason: `§2 row: ${match.pattern}` };
  }

  // 3. Sync-only universal (agent files)
  for (const rx of SYNC_ONLY) {
    if (rx.test(path)) return { action: identity === "OWNER" ? "SYNC ONLY" : "READ", reason: "Script-controlled — sync only" };
  }

  // 4–5. OWNER catch-alls
  if (identity === "OWNER") {
    for (const rx of OWNER_CATCHALL_RW) {
      if (rx.test(path)) return { action: "RW", reason: "OWNER §2.1 catch-all RW" };
    }
    for (const rx of OWNER_CATCHALL_READ) {
      if (rx.test(path)) return { action: "READ", reason: "OWNER §2.1 catch-all READ" };
    }
  }

  // 6. Default deny
  return { action: "—", reason: "no matching §2 row; default deny" };
}

/**
 * Convenience: does this identity have write access to this path?
 * Write-enabling actions: RW, CREATE, UPDATE, ADD, APPEND, FIX, REFACTOR.
 * Non-write: READ, SYNC ONLY, HARD_STOP, —.
 *
 * OWNER short-circuit (SCOPED 2026-04-23, LR-043 §A): OWNER bypasses §2
 * entirely. Identity is a context-switching layer (load the right system
 * prompt so Claude doesn't hallucinate a pipeline agent's scope), not an
 * access-control layer for the non-pipeline owner. Pipeline identities
 * (HUNTER/GIVER/BUILDER/HEALER/WATCHDOG/GARDENER) still enforce §2 — the
 * original SP-AAE-01 need stays satisfied. `ownershipFor()` keeps its
 * OWNER catch-alls for introspection / deny-message rendering.
 */
export function canWrite(identity, path) {
  if (identity === "OWNER") return true;
  const { action } = ownershipFor(identity, path);
  return new Set(["RW", "CREATE", "UPDATE", "ADD", "APPEND", "FIX", "REFACTOR"]).has(action);
}

// ---------------------------------------------------------------------------
// Pipeline-artifact derivation (PLAN_IDENTITY_ENFORCEMENT Layer 1).
//
// Pure inversion of OWNERSHIP_ROWS — no new ownership table. Used by the
// identity-switch hook's Layer-1 branch to ask the question the OWNER
// short-circuit never asks: "is this OWNER about to write a PIPELINE role's
// test deliverable inside an execution context, with that role's HARD STOPs
// unloaded?"
// ---------------------------------------------------------------------------

// Pipeline (non-OWNER) identities, in IDENTITIES declaration order (drives
// tie-breaking in ownerRoleFor).
const PIPELINE_IDENTITIES = IDENTITIES.filter((id) => id !== "OWNER");

// Write-grant priority for "primary author" derivation. CREATE (makes the file)
// outranks RW outranks the narrower writes; APPEND last (shared-log grant).
// READ / SYNC ONLY / HARD_STOP / "—" are not writes and are absent here.
const WRITE_GRANT_PRIORITY = ["CREATE", "RW", "UPDATE", "ADD", "FIX", "REFACTOR", "APPEND"];

// "Strong" (role-authoring) write grants. APPEND is deliberately EXCLUDED: the
// only APPEND-for-OWNER rows are the shared ceremony logs (agent-mistakes.md,
// agent-activity-log.md) that OWNER writes legitimately as LR-028 closure
// ceremony — gating those would break the ceremony. See isPipelineArtifact.
const STRONG_WRITE_GRANTS = new Set(["CREATE", "RW", "UPDATE", "ADD", "FIX", "REFACTOR"]);

// Most-specific OWNERSHIP_ROWS match (last match wins — same precedence as
// ownershipFor). Returns the row object or null.
function mostSpecificRow(rawPath) {
  const path = rawPath.replace(/\\/g, "/").replace(/^\.\//, "");
  let match = null;
  for (const row of OWNERSHIP_ROWS) {
    if (globToRegExp(row.pattern).test(path)) match = row;
  }
  return match;
}

/**
 * isPipelineArtifact(path) — true iff `path` is a PIPELINE-role-owned test
 * deliverable (so an OWNER write to it inside /execute means the role's HARD
 * STOPs are NOT loaded), and NOT OWNER framework territory.
 *
 * Definition (intent-faithful to PLAN_IDENTITY_ENFORCEMENT Layer 1 — see the
 * plan's deviation note: the literal "CREATE/RW" criterion is widened to "any
 * STRONG write" so the plan's own example list — selectors=ADD, REQUIREMENTS=
 * HUNTER UPDATE — is honoured, and narrowed by an OWNER≠APPEND clause so the
 * shared ceremony logs are NOT gated):
 *   true iff the most-specific §2 row grants some pipeline (non-OWNER) identity a
 *   STRONG write (CREATE/RW/UPDATE/ADD/FIX/REFACTOR) AND OWNER's own grant on
 *   that row is not "APPEND".
 * Framework territory (scripts/**, plans/**, config/**, .claude/skills/**,
 * .claude/agents/**, and the OWNER catch-alls) gives pipeline roles "—" → false.
 * HARD_STOPS and unmatched paths → false.
 */
export function isPipelineArtifact(rawPath) {
  const path = rawPath.replace(/\\/g, "/").replace(/^\.\//, "");
  for (const rx of HARD_STOPS) if (rx.test(path)) return false;
  const row = mostSpecificRow(path);
  if (!row) return false;
  if (row.grants.OWNER === "APPEND") return false; // shared ceremony log (LR-028)
  return PIPELINE_IDENTITIES.some((id) => STRONG_WRITE_GRANTS.has(row.grants[id]));
}

/**
 * ownerRoleFor(path) — the PRIMARY pipeline identity that owns `path` as a
 * writer (inverts OWNERSHIP_ROWS), or null if no pipeline role writes it.
 *
 * "Primary" = highest-priority write grant per WRITE_GRANT_PRIORITY on the
 * most-specific matching row; ties broken by IDENTITIES order (HUNTER < GIVER <
 * BUILDER < HEALER < WATCHDOG < GARDENER). Examples: *.spec.ts → BUILDER
 * (CREATE); test-cases → GIVER (CREATE); REQUIREMENTS.md → HUNTER (UPDATE);
 * selectors → GIVER (ADD, ties with BUILDER, GIVER wins by order). Used to
 * render the Layer-1 deny/announce message ("run /identity <ROLE>").
 */
export function ownerRoleFor(rawPath) {
  const row = mostSpecificRow(rawPath);
  if (!row) return null;
  let best = null;
  let bestRank = Infinity;
  for (const id of PIPELINE_IDENTITIES) {
    const rank = WRITE_GRANT_PRIORITY.indexOf(row.grants[id]);
    if (rank !== -1 && rank < bestRank) {
      bestRank = rank;
      best = id;
    }
  }
  return best;
}

// CLI: `node scripts/identity-ownership.mjs <identity> <path>`
//      `node scripts/identity-ownership.mjs --owner-role <path>`  → primary role | "none"
//      `node scripts/identity-ownership.mjs --is-artifact <path>` → true/false (exit 0/1)
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? process.argv[1].replace(/\\/g, "/") : "";
const selfPath = __filename.replace(/\\/g, "/");
if (invokedPath === selfPath || invokedPath.endsWith("/identity-ownership.mjs")) {
  const argv = process.argv.slice(2);
  if (argv[0] === "--owner-role") {
    if (!argv[1]) { console.error("usage: node identity-ownership.mjs --owner-role <path>"); process.exit(2); }
    console.log(ownerRoleFor(argv[1]) ?? "none");
    process.exit(0);
  }
  if (argv[0] === "--is-artifact") {
    if (!argv[1]) { console.error("usage: node identity-ownership.mjs --is-artifact <path>"); process.exit(2); }
    const yes = isPipelineArtifact(argv[1]);
    console.log(String(yes));
    process.exit(yes ? 0 : 1);
  }
  const [identity, path] = argv;
  if (!identity || !path) {
    console.error("usage: node identity-ownership.mjs <IDENTITY> <path> | --owner-role <path> | --is-artifact <path>");
    process.exit(2);
  }
  const result = ownershipFor(identity, path);
  console.log(JSON.stringify(result));
  process.exit(canWrite(identity, path) ? 0 : 1);
}
