#!/usr/bin/env node
/**
 * verify-no-stale-live-refs.mjs — the LIVE layer must carry zero references to the
 * pre-2026-06-05 client paths the POM restructure moved.
 *
 * Converts SILENT future-agent blindness into a LOUD failure: a doc / contract / agent
 * prompt / live-forward plan that still points at `src/core`, `src/infra`,
 * `src/data/testdata`, or `specs/` would steer the next agent to recreate the old shape,
 * defeating the restructure's permanence. This guard greps the live layer and fails on
 * any stale token.
 *
 * Built by PLAN_ENCORE_POM_RESTRUCTURE (2026-06-05). Exit 0 = clean; 1 = ≥1 stale ref.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// The 5 moved-path token classes (the old client shape). Anchored so the NEW paths
// (`src/data/<module>`, `specs_planning/`) are NOT matched.
const TOKENS = [
  /src\/infra\/fixtures/,
  /src\/data\/testdata/,
  /src\/core\/base-page/,
  /src\/core\/field-case-runner/,
  /clients\/encore\/specs\//,
  /clients\/\$\{ACTIVE_CLIENT\}\/specs\//,
  /(?:^|[\s`'"(])specs\/(?:locations|local-office|corporate-pricing)\//,
];

// Live layer = tracked files an agent reads as current truth.
const INCLUDE = (p) =>
  /^clients\/[^/]+\/(src|tests)\//.test(p) ||
  /^clients\/[^/]+\/CLAUDE\.md$/.test(p) ||
  p === 'CLAUDE.md' ||
  p === 'docs/read_only_docs/AGENT_SHARED_RULES.md' ||
  /^\.claude\/(agents|rules|context|skills)\//.test(p) ||
  /^clients\/[^/]+\/specs_planning\/_internal\/field-(case-generation|inventory-spec)\.md$/.test(p) ||
  /^scripts\//.test(p) ||
  /^plans\/pending\//.test(p);

// Excluded: history, the 3 frozen plans (documenting old→new by design), legacy doc,
// test fixtures, this guard + its own restructure-map artifact.
const EXCLUDE = (p) =>
  /\.claude\/worktrees\//.test(p) ||
  /^\.work\//.test(p) ||
  /^scripts\/test-fixtures\//.test(p) ||
  /CURRENT_STATE\.md$/.test(p) ||
  /restructure-map-/.test(p) ||
  /verify-no-stale-live-refs\.mjs$/.test(p) ||
  /^plans\/pending\/PLAN_ENCORE_POM_RESTRUCTURE\.md$/.test(p) ||
  /^plans\/pending\/PLAN_DELIVERABLE_RESTRUCTURE_2026_05_19\.md$/.test(p) ||
  /^plans\/pending\/PLAN_CODEBASE_CLEANUP\.md$/.test(p);

const tracked = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf8' })
  .split(/\r?\n/).filter(Boolean);

const hits = [];
let scanned = 0;
for (const rel of tracked) {
  if (!INCLUDE(rel) || EXCLUDE(rel)) continue;
  scanned++;
  let text;
  try { text = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8'); } catch { continue; }
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    for (const re of TOKENS) {
      if (re.test(lines[i])) { hits.push(`${rel}:${i + 1}: ${lines[i].trim().slice(0, 120)}`); break; }
    }
  }
}

if (hits.length) {
  console.error(`[verify-no-stale-live-refs] ${hits.length} stale pre-restructure path ref(s) in the live layer:`);
  for (const h of hits.slice(0, 40)) console.error('  ' + h);
  if (hits.length > 40) console.error(`  … and ${hits.length - 40} more`);
  process.exit(1);
}
console.log(`[verify-no-stale-live-refs] OK — live layer carries zero pre-restructure path refs (${scanned} live files scanned)`);
process.exit(0);
