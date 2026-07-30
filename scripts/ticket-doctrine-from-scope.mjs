#!/usr/bin/env node
/**
 * ticket-doctrine-from-scope.mjs — M1 offline helper for SUBPLAN_PARITY_INJECTION_SYSTEM.
 *
 * Given a delegation ticket's SCOPE path list, matches each path against the
 * `paths:` frontmatter globs of every `.claude/rules/*.md` file and prints the
 * matching rule file paths (one per line, deduplicated, sorted lexicographically).
 *
 * Matching uses filesystem-independent glob-intersection (globsIntersect): for each
 * SCOPE entry and rule glob, asks "does there exist at least one concrete path
 * matching both?" This handles concrete paths, glob SCOPE entries, and non-existent
 * dirs correctly without any FS walk.
 *
 * Usage:
 *   node scripts/ticket-doctrine-from-scope.mjs <path> [<path> ...]
 *   node scripts/ticket-doctrine-from-scope.mjs --ticket <ticketFile>
 *   node scripts/ticket-doctrine-from-scope.mjs --self-test
 *
 * Exit codes:
 *   0 — success (no matches → nothing printed, still 0)
 *   non-zero — error (stderr) or self-test failure
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minimatch, braceExpand } from 'minimatch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const RULES_DIR = join(REPO_ROOT, '.claude', 'rules');

const MINIMATCH_OPTS = { dot: true };

/** Normalize any path to forward slashes (POSIX). */
function toPosix(p) {
  return p.replace(/\\/g, '/');
}

/** Returns true if the string contains glob metacharacters: * ? [ { */
function hasGlobChars(str) {
  return /[*?[{]/.test(str);
}

/**
 * Replace glob metacharacters in a single segment with 'x',
 * producing a representative concrete segment for cross-testing.
 * Only called when the segment already has glob characters.
 *
 * @param {string} p — single path segment (no '/')
 * @returns {string}
 */
function repr(p) {
  return p
    .replace(/\{[^}]*\}/g, 'x')
    .replace(/\[[^\]]*\]/g, 'x')
    .replace(/\*/g, 'x')
    .replace(/\?/g, 'x');
}

/**
 * Returns true iff there exists at least one concrete segment matching both
 * single-segment glob patterns (no '/' in p or q).
 *
 * Sound in the no-false-NEGATIVE sense — returns true whenever some concrete
 * segment matches both; may over-approximate (return true with no common
 * concrete segment) only when a `[...]` class or `?` is present. Never returns
 * false when an overlap exists.
 *
 * @param {string} p
 * @param {string} q
 * @returns {boolean}
 */
export function segmentIntersect(p, q) {
  if (p === '*' || q === '*') return true;
  if (!hasGlobChars(p) && !hasGlobChars(q)) return p === q;

  // Brace-expand both sides so `{a,b}` alternation is tested exactly, not collapsed.
  const ps = braceExpand(p);
  const qs = braceExpand(q);
  for (const a of ps) {
    for (const b of qs) {
      if (a === '*' || b === '*') return true;
      if (!hasGlobChars(a) && !hasGlobChars(b)) { if (a === b) return true; continue; }
      // SOUNDNESS BIAS: char-classes `[...]` and `?` cannot be intersected by representative
      // tokens without false negatives. Over-approximate — return true ("might intersect")
      // rather than risk silently dropping a real doctrine match. An extra rule is safe;
      // a missed rule is the bug this matcher exists to prevent.
      if (/[[?]/.test(a) || /[[?]/.test(b)) return true;
      // Only `*` wildcards remain in both — representative cross-test is sound here.
      if (minimatch(repr(a), b, MINIMATCH_OPTS) || minimatch(repr(b), a, MINIMATCH_OPTS)) return true;
    }
  }
  return false;
}

/**
 * Returns true iff there exists at least one concrete path matching BOTH glob patterns.
 * Filesystem-independent — works for any two globs, including over non-existent dirs.
 *
 * Uses memoized segment-wise recursion; '**' matches zero or more whole segments.
 *
 * @param {string} a — first glob (POSIX path)
 * @param {string} b — second glob (POSIX path)
 * @returns {boolean}
 */
export function globsIntersect(a, b) {
  const A = a.split('/');
  const B = b.split('/');
  const memo = new Map();

  function everyStarStar(arr, start) {
    for (let i = start; i < arr.length; i++) {
      if (arr[i] !== '**') return false;
    }
    return true;
  }

  function go(ai, bi) {
    const key = `${ai}:${bi}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    let result;
    if (ai === A.length && bi === B.length) {
      result = true;
    } else if (ai === A.length) {
      result = everyStarStar(B, bi);
    } else if (bi === B.length) {
      result = everyStarStar(A, ai);
    } else if (A[ai] === '**') {
      result = go(ai + 1, bi) || go(ai, bi + 1);
    } else if (B[bi] === '**') {
      result = go(ai, bi + 1) || go(ai + 1, bi);
    } else if (segmentIntersect(A[ai], B[bi])) {
      result = go(ai + 1, bi + 1);
    } else {
      result = false;
    }

    memo.set(key, result);
    return result;
  }

  return go(0, 0);
}

/**
 * Parse a single YAML block-list item (line starting with whitespace + '- ').
 * Handles double-quoted, single-quoted, and unquoted (with optional trailing comment).
 *
 * @param {string} line
 * @returns {string | null}
 */
function parseListItem(line) {
  const stripped = line.replace(/^\s+-\s+/, '');
  const dq = /^"([^"]+)"/.exec(stripped);
  if (dq) return dq[1];
  const sq = /^'([^']+)'/.exec(stripped);
  if (sq) return sq[1];
  // Unquoted: strip trailing comment and whitespace.
  const val = stripped.replace(/\s*#.*$/, '').trim();
  return val || null;
}

/**
 * Parse the `paths:` list from a YAML frontmatter block (first `---`…`---`).
 * Returns [] when no frontmatter or no `paths:` key is present.
 *
 * Handles: double-quoted, single-quoted, unquoted with trailing comments,
 * and inline-array form (paths: ["a", "b"]).
 *
 * LR-006: validates structure before accessing nested properties.
 *
 * @param {string} content — raw file content
 * @returns {string[]}
 */
export function parseFrontmatterPaths(content) {
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (!fmMatch) return [];

  const lines = fmMatch[1].split(/\r?\n/);
  const paths = [];
  let inPaths = false;

  for (const line of lines) {
    if (/^paths:/.test(line)) {
      inPaths = true;
      // Handle inline-array form: paths: ["a","b"] or paths: ['a','b']
      const inlineArr = /^paths:\s*\[([^\]]+)\]/.exec(line);
      if (inlineArr) {
        const items = inlineArr[1]
          .split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, '').trim())
          .filter(Boolean);
        paths.push(...items);
        inPaths = false; // inline form — no block list follows
      }
      continue;
    }
    if (inPaths) {
      if (/^\s+-\s+/.test(line)) {
        const val = parseListItem(line);
        if (val) paths.push(val);
      } else if (line.trim() && !/^\s/.test(line)) {
        break; // another top-level key — stop
      }
    }
  }

  return paths;
}

/**
 * Load all `.md` rule files from rulesDir.
 * Throws on missing directory or unreadable file.
 *
 * @param {string} rulesDir — absolute path to the rules directory
 * @returns {Array<{ruleFile: string, globs: string[]}>}
 */
export function loadRules(rulesDir) {
  if (!existsSync(rulesDir)) {
    throw new Error(`rules directory not found: ${rulesDir}`);
  }
  const entries = readdirSync(rulesDir).filter(f => f.endsWith('.md')).sort();
  return entries.map(entry => {
    const fullPath = join(rulesDir, entry);
    const content = readFileSync(fullPath, 'utf8');
    const globs = parseFrontmatterPaths(content);
    return { ruleFile: `.claude/rules/${entry}`, globs };
  });
}

/**
 * Given input SCOPE entries (concrete paths or globs) and loaded rules,
 * returns matching rule file paths (deduplicated, sorted lexicographically).
 *
 * Uses globsIntersect for all matching — filesystem-independent.
 * Normalizes backslashes to forward slashes before matching.
 *
 * @param {string[]} inputPaths — SCOPE entries (may be globs or concrete paths)
 * @param {Array<{ruleFile: string, globs: string[]}>} rules
 * @returns {string[]}
 */
export function findMatchingRules(inputPaths, rules) {
  const matched = new Set();
  for (const rawEntry of inputPaths) {
    const entry = toPosix(rawEntry);
    for (const { ruleFile, globs } of rules) {
      if (!matched.has(ruleFile) && globs.some(g => globsIntersect(entry, g))) {
        matched.add(ruleFile);
      }
    }
  }
  return [...matched].sort();
}

/**
 * Parse the `## SCOPE` section's bullet list from a ticket file.
 * Extracts lines beginning with `- ` and strips trailing inline comments/annotations.
 *
 * @param {string} content — raw ticket file content
 * @returns {string[]}
 */
export function parseScopePaths(content) {
  const lines = content.split(/\r?\n/);
  const paths = [];
  let inScope = false;

  for (const line of lines) {
    if (/^## SCOPE/.test(line)) {
      inScope = true;
      continue;
    }
    if (inScope) {
      if (/^##/.test(line)) break; // next section — stop
      const m = /^-\s+(\S+)/.exec(line);
      if (m) paths.push(m[1]);
    }
  }

  return paths;
}

// ---------- bundled self-test ----------

function runSelfTest() {
  let passed = 0;
  let failed = 0;

  function ok(name, cond, detail) {
    if (cond) {
      console.log(`PASS ${name}`);
      passed++;
    } else {
      console.log(`FAIL ${name}`);
      if (detail) console.log(`     ${detail}`);
      failed++;
    }
  }

  function eq(name, actual, expected) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    ok(name, a === e, `expected ${e} got ${a}`);
  }

  // Load real rules once for integration cases (expected derived from live globs, not hardcoded).
  const rules = loadRules(RULES_DIR);

  // ---------- mechanism tests (synthetic rules) ----------

  // 1. ** zero-segment: path with no sub-directory must match tests/**/*.spec.ts
  eq(
    '** zero-segment: tests/foo.spec.ts matches tests/**/*.spec.ts',
    findMatchingRules(['tests/foo.spec.ts'], [{ ruleFile: 'x', globs: ['tests/**/*.spec.ts'] }]),
    ['x'],
  );

  // 2. ** multi-segment: deep path must match the same glob
  eq(
    '** multi-segment: tests/a/b/foo.spec.ts matches tests/**/*.spec.ts',
    findMatchingRules(['tests/a/b/foo.spec.ts'], [{ ruleFile: 'x', globs: ['tests/**/*.spec.ts'] }]),
    ['x'],
  );

  // 3. * does not cross /: root README.md must NOT match clients/*/README.md
  eq(
    '* does not cross /: README.md does not match clients/*/README.md',
    findMatchingRules(['README.md'], [{ ruleFile: 'x', globs: ['clients/*/README.md'] }]),
    [],
  );

  // 4. * matches within one segment: clients/encore/README.md matches clients/*/README.md
  eq(
    '* within-segment: clients/encore/README.md matches clients/*/README.md',
    findMatchingRules(['clients/encore/README.md'], [{ ruleFile: 'x', globs: ['clients/*/README.md'] }]),
    ['x'],
  );

  // 5. dedup: same path twice yields each rule exactly once
  {
    const r = findMatchingRules(
      ['src/foo.ts', 'src/foo.ts'],
      [{ ruleFile: 'x', globs: ['src/**/*.ts'] }],
    );
    eq('dedup: same path twice → rule once', r, ['x']);
  }

  // 6. no-match path: unrelated path yields empty set
  eq(
    'no-match: random-file.txt does not match src/**/*.ts',
    findMatchingRules(['random-file.txt'], [{ ruleFile: 'x', globs: ['src/**/*.ts'] }]),
    [],
  );

  // 7. multi-rule match — derived from live globs (not hardcoded from ticket table).
  //    For clients/encore/tests/foo.spec.ts, compute expected by checking each rule's
  //    globs directly (via minimatch on a concrete path), then verify findMatchingRules agrees.
  {
    const testPath = 'clients/encore/tests/foo.spec.ts';
    const expected = rules
      .filter(r => r.globs.some(g => minimatch(testPath, g, MINIMATCH_OPTS)))
      .map(r => r.ruleFile)
      .sort();
    const actual = findMatchingRules([testPath], rules);
    eq(`multi-rule match: ${testPath} (derived from live globs)`, actual, expected);
    ok(`multi-rule match: at least 2 rules matched`, actual.length >= 2, `got ${JSON.stringify(actual)}`);
  }

  // 8. no-match with real rules: README.md matches zero live rules
  {
    const actual = findMatchingRules(['README.md'], rules);
    eq('integration no-match: README.md matches zero live rules', actual, []);
  }

  // 9. output is sorted lexicographically
  {
    const r = findMatchingRules(
      ['src/foo.ts'],
      [
        { ruleFile: '.claude/rules/z.md', globs: ['src/**/*.ts'] },
        { ruleFile: '.claude/rules/a.md', globs: ['src/**/*.ts'] },
      ],
    );
    eq('sorted output', r, ['.claude/rules/a.md', '.claude/rules/z.md']);
  }

  // 10. trailing /** glob matches nested paths
  eq(
    'trailing /**: .claude/hooks/deep/foo.sh matches .claude/hooks/**',
    findMatchingRules(['.claude/hooks/deep/foo.sh'], [{ ruleFile: 'x', globs: ['.claude/hooks/**'] }]),
    ['x'],
  );

  // 11-13. glob-scope: SCOPE entry is a glob — globsIntersect resolves without FS walk.
  //        clients/*/tests/** should yield specs.md (derived from live globs, not hardcoded).
  {
    const scopeGlob = 'clients/*/tests/**';
    const actual = findMatchingRules([scopeGlob], rules, REPO_ROOT);
    ok(`glob-scope: ${scopeGlob} includes .claude/rules/specs.md`, actual.includes('.claude/rules/specs.md'), `got ${JSON.stringify(actual)}`);
    ok(`glob-scope: ${scopeGlob} yields at least 1 rule`, actual.length >= 1, `got ${JSON.stringify(actual)}`);
  }

  // 12. regression: concrete path still works when (now-ignored) repoRoot is passed
  {
    const concretePath = 'scripts/ticket-doctrine-from-scope.mjs';
    const actual = findMatchingRules([concretePath], rules, REPO_ROOT);
    ok(`regression: concrete ${concretePath} includes data.md`, actual.includes('.claude/rules/data.md'), `got ${JSON.stringify(actual)}`);
  }

  // 13. glob-scope no-match: SCOPE glob over a structurally non-overlapping prefix → empty
  {
    const noMatchGlob = 'nonexistent-xyz-abc-dir/**';
    const actual = findMatchingRules([noMatchGlob], rules, REPO_ROOT);
    eq(`glob-scope no-match: ${noMatchGlob} returns empty`, actual, []);
  }

  // 14. concrete path (no glob metacharacters) matches by direct glob-intersection —
  //     no FS walk exists in the round-5 architecture; this is purely glob-vs-glob.
  eq(
    'concrete path: scripts/foo.mjs matches scripts/**/*.mjs',
    findMatchingRules(['scripts/foo.mjs'], [{ ruleFile: 'x', globs: ['scripts/**/*.mjs'] }]),
    ['x'],
  );

  // 15. ROUND-5 false-NEGATIVE guard (the deleted prefix heuristic MISSED this):
  //     a future-client docs glob must intersect baseline.md's clients/*/docs/REQUIREMENTS.md,
  //     because clients/brand_new/docs/REQUIREMENTS.md is a concrete path matching BOTH globs.
  {
    const scopeGlob = 'clients/brand_new/docs/**/*.md';
    const actual = findMatchingRules([scopeGlob], rules);
    ok(`round-5 false-negative: '${scopeGlob}' includes .claude/rules/baseline.md`,
      actual.includes('.claude/rules/baseline.md'), `got ${JSON.stringify(actual)}`);
  }

  // 16. ROUND-5 false-POSITIVE guard (the deleted prefix heuristic WRONGLY included these):
  //     a *.md scope under tests/ must NOT match rules whose globs end in .spec.ts / .ts,
  //     because no concrete filename ends in both .md and .spec.ts.
  {
    const scopeGlob = 'clients/brand_new/tests/**/*.md';
    const actual = findMatchingRules([scopeGlob], rules);
    ok(`round-5 false-positive: '${scopeGlob}' EXCLUDES .claude/rules/specs.md`,
      !actual.includes('.claude/rules/specs.md'), `got ${JSON.stringify(actual)}`);
    ok(`round-5 false-positive: '${scopeGlob}' EXCLUDES .claude/rules/angular.md`,
      !actual.includes('.claude/rules/angular.md'), `got ${JSON.stringify(actual)}`);
  }

  // 17. globsIntersect: *.md ∩ *.spec.ts = false (different extensions cannot share a segment)
  ok('globsIntersect: *.md ∩ *.spec.ts = false', !globsIntersect('*.md', '*.spec.ts'),
    'expected false — different suffix patterns cannot produce a common concrete segment');

  // 17-20. DEFECT-7: glob SCOPE entry over a non-existent directory yields correct rules
  //        via globsIntersect — no repoRoot needed.
  {
    const scopeGlob = 'clients/brand_new/tests/**';
    const actual = findMatchingRules([scopeGlob], rules);
    ok(`DEFECT-7: '${scopeGlob}' includes .claude/rules/specs.md`, actual.includes('.claude/rules/specs.md'), `got ${JSON.stringify(actual)}`);
    ok(`DEFECT-7: '${scopeGlob}' includes .claude/rules/angular.md`, actual.includes('.claude/rules/angular.md'), `got ${JSON.stringify(actual)}`);
    ok(`DEFECT-7: '${scopeGlob}' includes .claude/rules/browser-tool.md`, actual.includes('.claude/rules/browser-tool.md'), `got ${JSON.stringify(actual)}`);
    ok(`DEFECT-7: '${scopeGlob}' includes .claude/rules/deliverable.md`, actual.includes('.claude/rules/deliverable.md'), `got ${JSON.stringify(actual)}`);
  }

  // ---------- globsIntersect unit tests (segment-level algorithm) ----------

  // 21. *.md ∩ REQUIREMENTS.md = true (concrete .md name matches *.md pattern)
  ok('globsIntersect: *.md ∩ REQUIREMENTS.md = true',
    globsIntersect('*.md', 'REQUIREMENTS.md'),
    'expected true — REQUIREMENTS.md is a concrete .md segment');

  // 22. a/**/b ∩ a/b = true (** matches zero segments)
  ok('globsIntersect: a/**/b ∩ a/b = true (**=zero)',
    globsIntersect('a/**/b', 'a/b'),
    'expected true — ** can match zero segments so a/**/b includes a/b');

  // 23. a/*/c ∩ a/x/c = true (* matches one segment)
  ok('globsIntersect: a/*/c ∩ a/x/c = true',
    globsIntersect('a/*/c', 'a/x/c'),
    'expected true — * matches the literal segment x');

  // 24. a/*/c ∩ a/c = false (* requires exactly one segment, cannot match zero)
  ok('globsIntersect: a/*/c ∩ a/c = false (* != zero segments)',
    !globsIntersect('a/*/c', 'a/c'),
    'expected false — * must consume exactly one segment');

  // ---------- parseFrontmatterPaths hardening (DEFECT-B) ----------

  // 25. Single-quoted items
  {
    const content = `---\ndescription: test\npaths:\n  - 'scripts/**'\n  - 'src/**/*.ts'\n---\n`;
    eq('parseFrontmatterPaths: single-quoted items',
      parseFrontmatterPaths(content), ['scripts/**', 'src/**/*.ts']);
  }

  // 26. Trailing comment stripped from double-quoted and unquoted items
  {
    const content = `---\npaths:\n  - "scripts/**/*.mjs" # trailing comment\n  - src/**/*.ts # another\n---\n`;
    eq('parseFrontmatterPaths: trailing comment stripped',
      parseFrontmatterPaths(content), ['scripts/**/*.mjs', 'src/**/*.ts']);
  }

  // 27. Inline-array form
  {
    const content = `---\npaths: ["src/**", "dist/**"]\n---\n`;
    eq('parseFrontmatterPaths: inline-array form',
      parseFrontmatterPaths(content), ['src/**', 'dist/**']);
  }

  // ---------- R5 integration: false-positive reduction & false-negative fix ----------

  // 28-30. clients/brand_new/tests/**/*.md — suffix .md is incompatible with
  //        specs/angular/deliverable globs (those require .spec.ts or .ts).
  {
    const actual = findMatchingRules(['clients/brand_new/tests/**/*.md'], rules);
    ok(`R5: tests/**/*.md: no specs.md (*.spec.ts ∩ *.md = false)`,
      !actual.includes('.claude/rules/specs.md'),
      `specs.md unexpectedly matched; got ${JSON.stringify(actual)}`);
    ok(`R5: tests/**/*.md: no angular.md (*.ts ∩ *.md = false)`,
      !actual.includes('.claude/rules/angular.md'),
      `angular.md unexpectedly matched; got ${JSON.stringify(actual)}`);
    ok(`R5: tests/**/*.md: no deliverable.md (*.ts ∩ *.md = false)`,
      !actual.includes('.claude/rules/deliverable.md'),
      `deliverable.md unexpectedly matched; got ${JSON.stringify(actual)}`);
  }

  // 31. clients/brand_new/docs/**/*.md — baseline.md MUST be included (REQUIREMENTS.md overlap).
  {
    const actual = findMatchingRules(['clients/brand_new/docs/**/*.md'], rules);
    ok(`R5: docs/**/*.md: baseline.md included (REQUIREMENTS.md overlap)`,
      actual.includes('.claude/rules/baseline.md'),
      `baseline.md missing; got ${JSON.stringify(actual)}`);
  }

  // 18. soundness (reviewer counterexamples): within-segment {}, [], ? must NOT false-negative.
  ok('soundness: a/{b,c}/z ∩ a/{c,d}/z (via a/c/z)', globsIntersect('a/{b,c}/z', 'a/{c,d}/z'), 'brace overlap missed');
  ok('soundness: a/[ab]/z ∩ a/[bc]/z (via a/b/z)', globsIntersect('a/[ab]/z', 'a/[bc]/z'), 'char-class overlap missed');
  ok('soundness: a/a?/z ∩ a/?b/z (via a/ab/z)', globsIntersect('a/a?/z', 'a/?b/z'), '? overlap missed');
  // regression: brace with NO overlap still returns false (over-approx must not swallow this).
  ok('soundness: a/{b,c}/z ∩ a/{d,e}/z = false (no common alt)', !globsIntersect('a/{b,c}/z', 'a/{d,e}/z'), 'brace non-overlap wrongly true');

  console.log(`\n${passed + failed} cases: ${passed} PASS, ${failed} FAIL`);
  process.exit(failed > 0 ? 1 : 0);
}

// ---------- main ----------

function main() {
  const argv = process.argv.slice(2);

  if (argv[0] === '--self-test') {
    runSelfTest();
    return;
  }

  let inputPaths;

  if (argv[0] === '--ticket') {
    const ticketFile = argv[1];
    if (!ticketFile) {
      console.error('error: --ticket requires a file path');
      process.exit(1);
    }
    if (!existsSync(ticketFile)) {
      console.error(`error: ticket file not found: ${ticketFile}`);
      process.exit(1);
    }
    const content = readFileSync(ticketFile, 'utf8');
    inputPaths = parseScopePaths(content);
    if (inputPaths.length === 0) process.exit(0);
  } else {
    if (argv.length === 0) {
      console.error('usage: node scripts/ticket-doctrine-from-scope.mjs <path> [<path> ...]');
      console.error('       node scripts/ticket-doctrine-from-scope.mjs --ticket <ticketFile>');
      console.error('       node scripts/ticket-doctrine-from-scope.mjs --self-test');
      process.exit(1);
    }
    inputPaths = argv;
  }

  let rules;
  try {
    rules = loadRules(RULES_DIR);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(1);
  }

  const results = findMatchingRules(inputPaths, rules);
  for (const m of results) console.log(m);
}

// Only run when invoked directly, not when imported as a module.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
