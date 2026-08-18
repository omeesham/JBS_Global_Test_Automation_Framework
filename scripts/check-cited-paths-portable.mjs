#!/usr/bin/env node
// check-cited-paths-portable.mjs — Detect paths that resolve on this machine but would fail elsewhere.
// Sev: S0 (false-green class — LR-069 §3.1). Graduating incident: 2026-08 colleague blocked 2 days
// by untracked files cited in plans that passed locally but failed on fresh clone.
//
// Two independent checks:
//   Check A (clone check): runs closure validator inside a temp --local clone (committed-only tree).
//   Check B (case check): finds paths that resolve on Windows but differ in case from git ls-files.
//
// Positive controls: each check validates itself against a synthetic fixture (created in a temp
// directory outside the repo, never inside it). A control that depends on a real defect in the repo
// is self-erasing by construction — fixing the defect kills the control.
// If a control fails to fire, the script aborts non-zero (dead detector = false green).

import { readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join, dirname, basename, relative } from 'node:path';
import { execSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

// === Path extraction (reused from validate-plan-closure.mjs — same regexes, same exclusions) ===
const CITED_PATH_RX_PLAIN = /(?<![A-Za-z0-9_])((?:\.[a-zA-Z]|[a-zA-Z0-9_-])(?:[a-zA-Z0-9_.-]|[\/\\])+\.(?:png|jpg|jpeg|mp4|webm|zip|json|trace|yml|yaml|html|svg|gif|pdf|log|txt|har|xml|md|csv|diff|patch))(?![A-Za-z0-9_])/g;
const CITED_PATH_RX_MD = /\[[^\]]*\]\(([^)]+\.(?:png|jpg|jpeg|mp4|webm|zip|json|trace|yml|yaml|html|svg|gif|pdf|log|txt|har|xml|md|csv|diff|patch))\)/g;

function extractCitedPaths(body) {
  const paths = new Set();
  const lines = body.split('\n');
  let inFence = false;
  let ancestorHeading = '';

  for (const line of lines) {
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^#{1,6}\s/.test(line)) { ancestorHeading = line; continue; }
    if (/^>\s/.test(line)) continue;
    if (/\be\.g\.\b|\bhypothetical\b|\bwould be\b|<placeholder>|<TBD>/i.test(line)) continue;
    if (/## Example|## Templates|## Hypothetical/i.test(ancestorHeading)) continue;

    let m;
    const plainRx = new RegExp(CITED_PATH_RX_PLAIN.source, 'g');
    while ((m = plainRx.exec(line)) !== null) paths.add(m[1]);
    const mdRx = new RegExp(CITED_PATH_RX_MD.source, 'g');
    while ((m = mdRx.exec(line)) !== null) paths.add(m[1]);
  }
  return [...paths];
}

function normalizePath(p) { return p.replace(/\\/g, '/'); }

function filterCitedPaths(rawPaths, planBasename) {
  const results = [];
  for (const rawP of rawPaths) {
    const norm = normalizePath(rawP);
    if (/^https?:\/\//.test(norm)) continue;
    if (!norm.includes('/')) continue;
    if (/^node_modules\/|^dist\/|^build\/|^coverage\//.test(norm)) continue;
    if (/<|>|\{|\}/.test(norm)) continue;
    if (/^[A-Z][A-Z0-9_]*_(?:DIR|PATH|ROOT)\//.test(norm)) continue;
    if (/(?:^|\/)(?:foo|bar|baz|qux|example|placeholder|sample)\.[a-z]+$/i.test(norm)) continue;
    if (/^(?:Users|home)\/[^/]+\/\.claude\//i.test(norm)) continue;
    if (/^~\//.test(rawP) || /^~\//.test(norm)) continue;
    if (/^\.claude\/plans\//.test(norm)) continue;
    if (planBasename) {
      if (norm === `plans/done/${planBasename}`) continue;
      if (norm === `plans/pending/${planBasename}`) continue;
      if (norm === `plans/_closure_manifests/${planBasename}.manifest.json`) continue;
    }

    let resolved = norm;
    if (/^[A-Z]:[/]/.test(rawP) || rawP.startsWith('/')) {
      const rel = relative(REPO_ROOT, rawP.replace(/\\/g, '/'));
      if (rel.startsWith('..')) continue;
      resolved = normalizePath(rel);
    }
    results.push(resolved);
  }
  return results;
}

// === Check B: Case mismatch detector ===
function detectCaseMismatches(mdFilePaths, gitFilesLower, readFile) {
  const mismatches = [];
  for (const mdFile of mdFilePaths) {
    let body;
    try { body = readFile(mdFile); } catch { continue; }
    const rawPaths = extractCitedPaths(body);
    const filtered = filterCitedPaths(rawPaths, basename(mdFile));

    for (const p of filtered) {
      const low = p.toLowerCase();
      if (gitFilesLower.has(low)) {
        const realPaths = gitFilesLower.get(low);
        if (!realPaths.includes(p)) {
          mismatches.push({ cited: p, real: realPaths[0], file: mdFile });
        }
      }
    }
  }
  return mismatches;
}

function runCheckB() {
  const gitFilesList = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf-8' }).trim().split('\n');
  const gitFilesLower = new Map();
  for (const f of gitFilesList) {
    const low = f.toLowerCase();
    if (!gitFilesLower.has(low)) gitFilesLower.set(low, []);
    gitFilesLower.get(low).push(f);
  }

  const mdFiles = gitFilesList.filter(f => f.endsWith('.md'));
  const readFile = (fp) => readFileSync(join(REPO_ROOT, fp), 'utf-8');
  return detectCaseMismatches(mdFiles, gitFilesLower, readFile);
}

// === Check B synthetic control (runs outside the repo in a temp dir) ===
function runCheckBControl() {
  const gitFilesList = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf-8' }).trim().split('\n');
  const gitFilesLower = new Map();
  for (const f of gitFilesList) {
    const low = f.toLowerCase();
    if (!gitFilesLower.has(low)) gitFilesLower.set(low, []);
    gitFilesLower.get(low).push(f);
  }

  // Find a real tracked file with a recognized extension and mixed case in its path
  const recognizedExts = /\.(md|json|yml|yaml|txt|html|csv|xml|log|svg|pdf)$/;
  let targetFile = null;
  for (const f of gitFilesList) {
    if (f.includes('/') && recognizedExts.test(f) && f !== f.toLowerCase()) {
      targetFile = f; break;
    }
  }
  if (!targetFile) {
    // Fallback: any file with recognized extension and a directory
    targetFile = gitFilesList.find(f => f.includes('/') && recognizedExts.test(f));
  }
  if (!targetFile) return { fired: false, quiet: false, error: 'No suitable target file in git ls-files' };

  // Build a wrong-case citation: lowercase the entire path (guaranteed different since targetFile !== targetFile.toLowerCase())
  const wrongCase = targetFile.toLowerCase();

  // Synthetic fixture: a fake .md "file" body citing the wrong-case path
  const fixturePositive = `## Deliverables\n\nSee ${wrongCase} for details.\n`;
  // Near-miss 1: correct case (should NOT fire)
  const fixtureCorrectCase = `## Deliverables\n\nSee ${targetFile} for details.\n`;
  // Near-miss 2: prose word "Package.json" at start of sentence (should NOT fire as a path)
  const fixtureProse = `## Notes\n\nPackage.json bloat is a known issue in monorepos.\n`;

  // Run detector against synthetic fixtures using the real git index
  const syntheticMd = '__synthetic_control__.md';

  // Positive: wrong case must fire
  const readPositive = (fp) => { if (fp === syntheticMd) return fixturePositive; throw new Error('not found'); };
  const hitsPositive = detectCaseMismatches([syntheticMd], gitFilesLower, readPositive);
  const fired = hitsPositive.length > 0;

  // Near-miss: correct case must NOT fire
  const readCorrect = (fp) => { if (fp === syntheticMd) return fixtureCorrectCase; throw new Error('not found'); };
  const hitsCorrect = detectCaseMismatches([syntheticMd], gitFilesLower, readCorrect);

  // Near-miss: prose must NOT fire
  const readProse = (fp) => { if (fp === syntheticMd) return fixtureProse; throw new Error('not found'); };
  const hitsProse = detectCaseMismatches([syntheticMd], gitFilesLower, readProse);

  const quiet = hitsCorrect.length === 0 && hitsProse.length === 0;

  return {
    fired,
    quiet,
    target: targetFile,
    wrongCase,
    correctCaseHits: hitsCorrect.length,
    proseHits: hitsProse.length,
  };
}

// === Check A: Clone check ===
function runCheckA() {
  const tmpBase = join(tmpdir(), `portable-check-${randomBytes(4).toString('hex')}`);
  mkdirSync(tmpBase, { recursive: true });
  const cloneDir = join(tmpBase, 'repo');

  const dirty = execSync('git status --porcelain', { cwd: REPO_ROOT, encoding: 'utf-8' }).trim();
  const dirtyFiles = dirty ? dirty.split('\n').filter(l => /^[AM?]/.test(l)).map(l => l.slice(3)) : [];

  try {
    execSync(`git clone --local --no-hardlinks "${REPO_ROOT}" "${cloneDir}"`, { encoding: 'utf-8', stdio: 'pipe' });

    const planFiles = execSync('git ls-files plans/', { cwd: REPO_ROOT, encoding: 'utf-8' })
      .trim().split('\n').filter(f => f.endsWith('.md'));

    const results = { total: planFiles.length, pass: 0, fail: 0, failures: [], dirtyWarnings: [] };

    for (const pf of planFiles) {
      const clonePath = join(cloneDir, pf);
      if (!existsSync(clonePath)) continue;

      let body;
      try { body = readFileSync(clonePath, 'utf-8'); } catch { continue; }
      const rawPaths = extractCitedPaths(body);
      const filtered = filterCitedPaths(rawPaths, basename(pf));

      const missing = [];
      for (const p of filtered) {
        const absLocal = join(REPO_ROOT, p);
        const absClone = join(cloneDir, p);
        const existsLocal = existsSync(absLocal);
        const existsClone = existsSync(absClone);

        if (existsLocal && !existsClone) {
          if (dirtyFiles.some(d => normalizePath(d) === p)) {
            results.dirtyWarnings.push({ plan: pf, path: p, reason: 'uncommitted file' });
          } else {
            missing.push(p);
          }
        }
      }

      if (missing.length > 0) {
        results.fail++;
        results.failures.push({ plan: pf, missingInClone: missing });
      } else {
        results.pass++;
      }
    }

    return { results, tmpBase };
  } catch (e) {
    try { rmSync(tmpBase, { recursive: true, force: true }); } catch {}
    throw e;
  }
}

// === Check A synthetic control (uses an existing gitignored file — writes nothing) ===
function runCheckAControl(cloneDir) {
  // Find a gitignored FILE that already exists locally but not in clone
  const candidates = [
    'clients/encore/.auth/encore-state.json',
    '.auth/encore-state.json',
    '.claude/state/gate-fires.log',
    '.vscode/settings.json',
  ];
  let existingGitignored = null;
  for (const c of candidates) {
    const absLocal = join(REPO_ROOT, c);
    const absClone = join(cloneDir, c);
    if (existsSync(absLocal) && !existsSync(absClone)) {
      existingGitignored = c;
      break;
    }
  }
  if (!existingGitignored) return { fired: false, error: 'No existing gitignored file found for control' };

  // Synthetic plan body citing the existing gitignored path
  const syntheticBody = `# Synthetic Control Plan\n\n## Artifacts\n\nSee ${existingGitignored} for state.\n`;

  // Run path extraction on the synthetic body
  const rawPaths = extractCitedPaths(syntheticBody);
  const filtered = filterCitedPaths(rawPaths, 'synthetic-control.md');

  // Check: path resolves locally but not in clone
  const found = filtered.some(p => {
    const absLocal = join(REPO_ROOT, p);
    const absClone = join(cloneDir, p);
    return existsSync(absLocal) && !existsSync(absClone);
  });

  return { fired: found, citedPath: existingGitignored };
}

// === Main ===
function main() {
  console.log('=== check-cited-paths-portable.mjs ===\n');

  let abortB = false;
  let abortA = false;

  // --- Check B: Case mismatches ---
  console.log('--- Check B: Case mismatch detection ---');
  const mismatches = runCheckB();

  // Synthetic positive control for Check B
  const controlB = runCheckBControl();

  if (!controlB.fired) {
    console.error('ABORT Check B: Synthetic positive control did not fire. The detector may be dead.');
    console.error(`  Target: ${controlB.target || '(none)'}, wrong-case: ${controlB.wrongCase || '(none)'}`);
    abortB = true;
  } else if (!controlB.quiet) {
    console.error('ABORT Check B: Near-miss control FAILED — detector fired on a non-defect.');
    console.error(`  Correct-case hits: ${controlB.correctCaseHits}, Prose hits: ${controlB.proseHits}`);
    abortB = true;
  } else {
    console.log('Control B: PASSED');
    console.log(`  Positive: wrong-case "${controlB.wrongCase}" flagged (FIRED)`);
    console.log(`  Near-miss: correct-case quiet (0 hits), prose "Package.json" quiet (0 hits)`);
  }

  console.log(`Case mismatches found: ${mismatches.length}`);
  for (const mm of mismatches) {
    console.log(`  MISMATCH in ${mm.file}:`);
    console.log(`    cited: ${mm.cited}`);
    console.log(`    real:  ${mm.real}`);
  }
  console.log('');

  // --- Check A: Clone check ---
  console.log('--- Check A: Clone-based untracked-dependency detection ---');
  const { results, tmpBase } = runCheckA();
  const cloneDir = join(tmpBase, 'repo');

  // Synthetic positive control for Check A
  const controlA = runCheckAControl(cloneDir);

  if (!controlA.fired) {
    console.error('ABORT Check A: Synthetic positive control did not fire. The detector may be dead.');
    console.error(`  Error: ${controlA.error || 'fixture path was not detected as missing in clone'}`);
    abortA = true;
  } else {
    console.log(`Control A: PASSED (synthetic gitignored path "${controlA.citedPath}" detected)`);
  }

  console.log(`Plans scanned: ${results.total}`);
  console.log(`Pass: ${results.pass}`);
  console.log(`Fail: ${results.fail}`);

  if (results.dirtyWarnings.length > 0) {
    console.log(`\nWARNING — uncommitted files (not reported as failures):`);
    for (const w of results.dirtyWarnings) {
      console.log(`  ${w.plan} -> ${w.path} (${w.reason})`);
    }
  }

  if (results.failures.length > 0) {
    // Group failures by cited path for actionability
    const pathCounts = new Map();
    const pathGitignored = new Map();
    for (const f of results.failures) {
      for (const p of f.missingInClone) {
        pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
        if (!pathGitignored.has(p)) {
          // Determine if gitignored or simply absent from git
          try {
            const checkResult = execFileSync('git', ['check-ignore', '-q', '--', p], { cwd: REPO_ROOT, encoding: 'utf-8', stdio: 'pipe' });
            pathGitignored.set(p, true);
          } catch {
            pathGitignored.set(p, false);
          }
        }
      }
    }

    // Sort by count descending
    const sorted = [...pathCounts.entries()].sort((a, b) => b[1] - a[1]);

    console.log(`\n--- Check A: Grouped findings (${results.fail} failing plans, ${sorted.length} distinct paths) ---`);
    console.log('  Path | Count | Status');
    console.log('  ' + '-'.repeat(80));
    for (const [p, count] of sorted) {
      const status = pathGitignored.get(p) ? 'gitignored' : 'absent';
      console.log(`  ${p} | ${count} | ${status}`);
    }

    console.log(`\n  Full list (plan -> missing paths):`);
    for (const f of results.failures) {
      console.log(`  ${f.plan}:`);
      for (const p of f.missingInClone) {
        console.log(`    - ${p}`);
      }
    }
  }

  // Cleanup temp clone
  try { rmSync(tmpBase, { recursive: true, force: true }); } catch {}
  const cloneGone = !existsSync(tmpBase);
  console.log(`\nTemp clone cleanup: ${cloneGone ? 'DONE (directory removed)' : 'FAILED (directory still exists)'}`);

  // Summary
  if (abortA || abortB) {
    const which = [abortB && 'Check B', abortA && 'Check A'].filter(Boolean).join(' + ');
    console.error(`\nABORT: Control failure in ${which}. Exit 2.`);
    process.exit(2);
  }

  if (mismatches.length > 0) {
    console.log(`\nSUMMARY: ${mismatches.length} case mismatch(es), ${results.fail} clone-check failure(s). Controls: both PASSED.`);
  } else {
    console.log(`\nSUMMARY: 0 case mismatches, ${results.fail} clone-check failure(s). Controls: both PASSED.`);
  }
  process.exit(0);
}

main();
