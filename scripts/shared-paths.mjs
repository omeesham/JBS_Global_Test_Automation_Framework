/**
 * @agent-doc
 * PURPOSE: ESM sibling of shared-paths.ts. Provides client-aware path
 *          resolution for .mjs callers (which cannot import .ts directly).
 *          Currently consumed by scripts/validate-activity-log.mjs.
 * OWNER: human-only
 * IMPACT: medium — path drift vs the .ts sibling would corrupt activity-log
 *         validation. Keep in sync; shared-paths.test.mjs asserts equality.
 * DEPENDS-ON: Node's path module + fileURLToPath, process.env.ACTIVE_CLIENT.
 * USED-BY: scripts/validate-activity-log.mjs
 * RULES: Implementation must match shared-paths.ts exactly for any key both
 *        files export. If you add a key here, add it to the .ts too and
 *        extend the drift-check in shared-paths.test.mjs.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_CLIENT = 'encore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

export function activeClient() {
  const v = process.env.ACTIVE_CLIENT;
  return v && v.trim().length > 0 ? v.trim() : DEFAULT_CLIENT;
}

export function clientRoot() {
  return path.join(REPO_ROOT, 'clients', activeClient());
}

export function clientPath(rel) {
  return path.join(clientRoot(), rel);
}

export function frameworkRoot() {
  return REPO_ROOT;
}

export function frameworkPath(rel) {
  return path.join(REPO_ROOT, rel);
}

export const SHARED_PATHS = Object.freeze({
  clientRoot:   clientRoot(),
  activityLog:  clientPath(path.join('specs_planning', '_internal', 'agent-activity-log.md')),
});
