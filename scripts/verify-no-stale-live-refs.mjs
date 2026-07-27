#!/usr/bin/env node
/**
 * verify-no-stale-live-refs.mjs — the live layer must carry zero references to paths
 * that have been relocated: the POM restructure (2026-06-05) moved src/core, src/infra,
 * src/data/testdata, and specs/; the workbook move (2026-07) renamed test_cases_xlsx/ to
 * testcases/.
 *
 * Converts SILENT future-agent blindness into a LOUD failure: a shell script, config,
 * workflow file, or agent doc that still points at a moved path would break the delivery
 * pipeline or steer the next agent to recreate the old shape.
 *
 * Scans all tracked files with known text extensions (.ts .tsx .js .mjs .cjs .sh .bash
 * .json .md .yml .yaml) plus extensionless files that carry a shell shebang.
 * Skips node_modules/.git/build outputs via .gitignore (git ls-files already omits them).
 *
 * Built by PLAN_ENCORE_POM_RESTRUCTURE (2026-06-05). Widened 2026-07 to cover shell,
 * JSON, YAML, and all markdown (not just the TypeScript/doc layer). Exit 0 = clean; 1 = stale refs found.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// Stale-path token classes. Each entry represents a path that was relocated; any tracked
// file that still contains the old form is a stale reference.
const TOKENS = [
  // POM restructure 2026-06-05: src/core, src/infra, data/testdata, specs/ → tests/
  /src\/infra\/fixtures/,
  /\bdata\/testdata/, // bare — catches brace-shorthand like src/{pages,data/testdata}/
  /src\/core\/base-page/,
  /src\/core\/field-case-runner/,
  /clients\/encore\/specs\//,
  /clients\/\$\{ACTIVE_CLIENT\}\/specs\//,
  /(?:^|[\s`'"(])specs\/(?:locations|local-office|corporate-pricing)\//,
  // Brace-shorthand dir-list naming the old `specs` test dir beside `src` —
  // e.g. `clients/${ACTIVE_CLIENT}/{src,specs}/`. The POM restructure (2026-06-05)
  // renamed `specs/`→`tests/`; an agent file that enumerates client dirs as a brace
  // group silently kept the old name (MAINTAINER.md:31 dead-file sweep drift, caught
  // 2026-06-24 by PLAN_IDENTITY_ENFORCEMENT Layer 5). Requiring BOTH `src` AND `specs`
  // in the same `{...}` group is the POM dir-pair signature — it deliberately does NOT
  // match a rule-pack glob like `.claude/rules/{specs,angular,...}.md` (no `src`) and
  // won't match `specs_planning` (`\bspecs\b` has no boundary before `_`).
  /\{(?=[^}]*\bsrc\b)[^}]*\bspecs\b[^}]*\}/,
  // Workbook directory rename 2026-07: test_cases_xlsx/ → testcases/
  /test_cases_xlsx/,
  // Corporate-override restructure 2026-07: override files moved from corporate-pricing/ to corporate-override/
  /(?:data|selectors)\/corporate-pricing\/override/,
  /(?:pages|tests)\/corporate-pricing\/corporate-pricing-override/,
];

// Extension-based filter (applied within path-scoped check below): only scan text files
// that can contain path references. Avoids binary files that happen to share an extension.
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.sh', '.bash', '.json', '.md', '.yml', '.yaml']);

// Live layer = tracked files that tools and agents treat as current truth.
// Path-scoped so history logs, archive docs, and test-fixture strings don't generate noise.
const INCLUDE = (p) => {
  const ext = path.extname(p).toLowerCase();
  if (!TEXT_EXT.has(ext) && ext !== '') return false; // skip binary / non-text
  return (
    /^clients\/[^/]+\/(src|tests)\//.test(p) ||
    /^clients\/[^/]+\/CLAUDE\.md$/.test(p) ||
    p === 'CLAUDE.md' ||
    p === 'docs/read_only_docs/AGENT_SHARED_RULES.md' ||
    /^\.claude\/(agents|rules|context|skills)\//.test(p) ||
    /^clients\/[^/]+\/specs_planning\/_internal\/field-(case-generation|inventory-spec)\.md$/.test(p) ||
    /^scripts\//.test(p) ||
    /^plans\/pending\//.test(p) ||
    /^\.github\/workflows\//.test(p)   // CI/CD workflow YAML files
  );
};

// Excluded: test fixtures that intentionally reference old paths, frozen plans that
// document old→new by design, this guard itself, and a few legacy docs.
const EXCLUDE = (p) =>
  /\.claude\/worktrees\//.test(p) ||
  /^\.work\//.test(p) ||
  /^scripts\/test-fixtures\//.test(p) ||
  /^scripts\/sp00-fixme-path\.test\.ts$/.test(p) || // test fixture: intentionally tests stale-path resolution
  /CURRENT_STATE\.md$/.test(p) ||
  /restructure-map-/.test(p) ||
  /verify-no-stale-live-refs\.mjs$/.test(p) ||
  /^plans\/pending\/PLAN_ENCORE_POM_RESTRUCTURE\.md$/.test(p) ||
  /^plans\/pending\/PLAN_DELIVERABLE_RESTRUCTURE_2026_05_19\.md$/.test(p) ||
  /^plans\/pending\/PLAN_CODEBASE_CLEANUP\.md$/.test(p) ||
  /^plans\/pending\/PLAN_TIMEOUT_CENTRALIZATION\.md$/.test(p) || // mentions old path in an explicit "(was X pre-restructure)" historical note
  /^plans\/pending\/SUBPLAN_59A_TESTCASE_PIPELINE\.md$/.test(p) || // performed the test_cases_xlsx→testcases rename; its mapping tables and acceptance criteria must name the old path
  /^\.claude\/context\/navigation\.md$/.test(p); // migration-guidance doc: lists old→new pairs as instructional context for agents

const tracked = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf8' })
  .split(/\r?\n/).filter(Boolean);

const hits = [];
let scanned = 0;
for (const rel of tracked) {
  if (!INCLUDE(rel) || EXCLUDE(rel)) continue;
  let text;
  try { text = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8'); } catch { continue; }
  // Extensionless files: only scan if they carry a shell shebang
  if (path.extname(rel) === '' && !text.startsWith('#!')) continue;
  scanned++;
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
