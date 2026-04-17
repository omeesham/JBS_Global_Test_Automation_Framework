/**
 * @agent-doc
 * PURPOSE: Resolve repo-root and per-client absolute paths for pipeline scripts.
 *          Single source of truth for ACTIVE_CLIENT selection so callers never
 *          hardcode "encore" or assume the current single-tenant layout.
 *          Also exports SHARED_PATHS — the canonical map of all pipeline
 *          artifact locations, consumed by 30+ scripts and re-exported from
 *          shared-types.ts for backward compatibility.
 * OWNER: human-only
 * IMPACT: critical (SP-MT-04) — every pipeline script resolves paths through
 *         SHARED_PATHS. Breaking this breaks the entire pipeline.
 * DEPENDS-ON: Node's path module, process.env.ACTIVE_CLIENT.
 * USED-BY: scripts/shared-types.ts (re-exports SHARED_PATHS), scripts/shared-paths.mjs
 *          (sibling for .mjs callers), and all pipeline scripts (via shared-types).
 * RULES: Use path.join only. Never hand-concatenate with '/'. Never throw on
 *        missing ACTIVE_CLIENT — default to 'encore' so the single-tenant case
 *        keeps working. Do NOT mutate process.env.
 *        SHARED_PATHS is a frozen object literal, evaluated at module load.
 *        ACTIVE_CLIENT must be set before this module is required (dotenv-flow
 *        loads env at process start). Callers that need to observe a mid-process
 *        ACTIVE_CLIENT change must spawn a child process, not re-require.
 */

import * as path from 'path';

const DEFAULT_CLIENT = 'encore';

/**
 * Repo root (the directory containing package.json / tsconfig.json).
 * Resolved relative to this file's location: scripts/shared-paths.ts -> ../
 */
const REPO_ROOT = path.resolve(__dirname, '..');

/** Active client id, read from process.env.ACTIVE_CLIENT. Defaults to 'encore'. */
export function activeClient(): string {
  const v = process.env.ACTIVE_CLIENT;
  return v && v.trim().length > 0 ? v.trim() : DEFAULT_CLIENT;
}

/** Absolute path to the active client's root: <repo>/clients/<activeClient>/. */
export function clientRoot(): string {
  return path.join(REPO_ROOT, 'clients', activeClient());
}

/** Absolute path relative to the active client's root. */
export function clientPath(rel: string): string {
  return path.join(clientRoot(), rel);
}

/** Absolute path to the repo root (framework root). */
export function frameworkRoot(): string {
  return REPO_ROOT;
}

/** Absolute path relative to the framework root. */
export function frameworkPath(rel: string): string {
  return path.join(REPO_ROOT, rel);
}

/**
 * Canonical map of all pipeline artifact locations.
 *
 * Keys that mirror the historical shared-types.SHARED_PATHS shape are preserved
 * (strict superset) so existing callers need zero import changes after SP-MT-04.
 *
 * Values are absolute paths resolved at module-load time against the current
 * ACTIVE_CLIENT. See module header for the mid-process swap constraint.
 */
export const SHARED_PATHS = Object.freeze({
  // Client-scoped root
  clientRoot:       clientRoot(),

  // _internal (agent working dir)
  queue:            clientPath(path.join('specs_planning', '_internal', 'agent-queue.json')),
  mistakes:         clientPath(path.join('specs_planning', '_internal', 'agent-mistakes.md')),
  learnings:        clientPath(path.join('specs_planning', '_internal', 'agent-mistakes.md')),
  activityLog:      clientPath(path.join('specs_planning', '_internal', 'agent-activity-log.md')),
  performance:      clientPath(path.join('specs_planning', '_internal', 'agent-performance.json')),
  escalations:      clientPath(path.join('specs_planning', '_internal', 'agent-escalations.json')),
  notifications:    clientPath(path.join('specs_planning', '_internal', 'agent-notifications')),
  testIdInventory:  clientPath(path.join('specs_planning', '_internal', 'testid-inventory')),
  testIdRegistry:   clientPath(path.join('specs_planning', '_internal', 'test-id-registry.json')),

  // Planning artifacts
  testCases:        clientPath(path.join('specs_planning', 'test-cases')),
  testPlans:        clientPath(path.join('specs_planning', 'test-plans')),
  audits:           clientPath(path.join('specs_planning', 'audits')),

  // Client docs
  requirements:     clientPath(path.join('docs', 'REQUIREMENTS.md')),
  requirementsDoc:  clientPath(path.join('docs', 'REQUIREMENTS.md')),
  moduleRegistry:   clientPath(path.join('docs', 'MODULE_REGISTRY.md')),

  // Client code (scanned by catalog/lint scripts)
  specs:            clientPath(path.join('tests', 'specs')),
  pages:            clientPath(path.join('src', 'pages')),
  selectors:        clientPath(path.join('src', 'selectors')),
  fixtures:         clientPath(path.join('tests', 'setup', 'fixtures.ts')),
  testData:         clientPath(path.join('tests', 'test-data')),
  exports:          clientPath('exports'),
  envDir:           clientPath(path.join('config', 'environments')),

  // Framework-shared (not per-client)
  agentsDir:        frameworkPath(path.join('.github', 'agents')),
  reports:          frameworkPath('reports'),
});
