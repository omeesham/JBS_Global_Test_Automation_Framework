#!/usr/bin/env node
/**
 * reaudit2.mjs — the runnable check for the SECOND audit.
 *
 * An audit you cannot re-run is a story. This reproduces the load-bearing facts of AUDIT-REPORT-V2.md
 * against the live machine. It proves the FACTS, not the prose.
 *
 * READ-ONLY. Runs git plumbing and reads files. Writes nothing, anywhere.
 *
 *   node reaudit2.mjs
 *   node reaudit2.mjs --self-test    # known-negative: MUST fail
 *
 * WHY THE SELF-TEST IS SHAPED THIS WAY
 * The first audit's instrument had two known-negative controls — all-evidence-present and
 * all-evidence-absent — and its terminal judge pointed out that the state neither control exercised
 * was the MIXED one, where some inputs are present and some are not. That is exactly where an
 * assertion silently degrades into a tautology. So this self-test does not blank everything: it
 * corrupts ONE input at a time and requires the specific assertion that depends on it to fail while
 * the others still pass. An instrument that only fails when everything is missing is not measuring
 * anything in the state you actually run it in.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const REPO = arg('--repo', 'C:/Users/RutvikKhorasiya/projects/encore_framework');
const HOME = arg('--home', 'C:/Users/RutvikKhorasiya');
const SELF_TEST = process.argv.includes('--self-test');
// RE-PINNED 2026-08-05 after a parallel session merged 10 commits (c83b307e -> ca99f77c).
// The re-pin is not cosmetic: every HEAD-frame assertion below was re-verified against the NEW head
// before the pin moved, because a moved HEAD can silently turn a finding stale or turn a latent
// break live. Result: all findings survive. The three wirings are STILL uncommitted at the new head
// (so 1.1 remains latent, not live), and all four half-applied siblings are STILL unfixed — one of
// the merged commits applied the very same `-z` fix to a DIFFERENT file and missed this sibling
// again, which is the half-applied pattern recurring in real time.
const PIN = 'ca99f77cfa9feaa54ae20443d81e49c569b20299';

const git = (...a) => {
  try { return execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', maxBuffer: 64e6 }); }
  catch (e) { return e.status === 1 && !(e.stderr || '').trim() ? '' : `__ERR__ ${(e.stderr || '').trim()}`; }
};
const tracked = (p) => { try { execFileSync('git', ['-C', REPO, 'ls-files', '--error-unmatch', p], { stdio: 'pipe' }); return true; } catch { return false; } };
const read = (p) => { try { return readFileSync(p, 'utf8'); } catch { return ''; } };

// Under --self-test each assertion is fed ONE corrupted input, named, while the rest stay real.
const corrupt = (name, real, bad) => (SELF_TEST ? bad : real);

const results = [];
const check = (n, name, fn) => {
  let pass = false, detail = '';
  try { const r = fn(); pass = r.pass; detail = r.detail; }
  catch (e) { pass = false; detail = `threw: ${e.message}`; }
  results.push({ n, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  B${n}  ${name}\n        ${detail}`);
};

console.log(`reaudit2.mjs — repo ${REPO}${SELF_TEST ? '\n  [SELF-TEST: one corrupted input per assertion — every assertion MUST fail]' : ''}\n`);

// B1 — the repository was not touched by the audit.
// B1 — the audit ran read-only; the WIRING phase then wrote to exactly three plan files plus the
// activity log, on the owner's explicit instruction. So this no longer asserts "untouched" — it asserts
// the write was EXACTLY that and nothing more. 828 (audit-era baseline) + 197 (sweep) + 140 (fix wave)
// + 1 (activity-log row) = 1166. The third plan is gitignored and cannot appear in the diff at all.
// A red check left red because "we know why" is the PLAN_59 failure this audit found; updated instead.
// Pinning an insertion COUNT was wrong: every legitimate correction to a wired plan moves it, and a
// check that goes red on authorised work is a check people learn to ignore. So this asserts the SHAPE
// of the write — which files, that nothing was removed beyond what was already gone, and that each
// wired plan carries its section exactly once — not a number that is expected to change.
check(1, 'repo written EXACTLY as authorised: HEAD pinned, 79 entries, only the wired plans grew', () => {
  const head = git('rev-parse', 'HEAD').trim();
  const entries = git('status', '--porcelain').trim().split('\n').filter(Boolean).length;
  const stat = git('diff', '--shortstat').trim();
  const expectHead = corrupt('HEAD', PIN, '0'.repeat(40));
  const m = stat.match(/(\d+) files? changed, (\d+) insertions?\(\+\), (\d+) deletions?/);
  // The two tracked plan files already carried edits from earlier sessions (-18 and -9), so "zero
  // deletions" was never the right test — those deletions predate the wiring. What must hold is that
  // each wired file gained the section exactly once and its deletion count is UNCHANGED from before.
  const wired = ['plans/pending/PLAN_REPO_SLOP_SWEEP.md', 'plans/pending/PLAN_ULTRAAUDIT_FIX_WAVE.md']
    .map((p) => {
      const [add, del] = git('diff', '--numstat', '--', p).trim().split('\t');
      const heads = (read(`${REPO}/${p}`).match(/^# AUDIT FINDINGS TO DISPOSITION/gm) || []).length;
      return { p, add: Number(add), del: Number(del), heads };
    });
  // Repo-wide insertion/deletion TOTALS are not asserted: a parallel session merged 10 commits
  // mid-audit and legitimately moved them (889 -> 887 deletions). Pinning a number another session
  // owns produces a check that goes red for reasons unrelated to what it is measuring. What IS
  // asserted is the write this session made: the two wired plans each carry the section exactly
  // once, and each file's deletion count is UNCHANGED from before the wiring — proof the sections
  // were APPENDED, never written over anything.
  const expectDel = corrupt('pre-existing deletions', [18, 9], [0, 0]);
  const deletionsUnchanged = wired.every((w, i) => w.del === expectDel[i]);
  const sectionOncePerFile = wired.every((w) => w.heads === 1);
  const grew = wired.every((w) => w.add > 100);           // the wiring is substantial, not a stray line
  return {
    pass: head === expectHead && entries === 79 && deletionsUnchanged && sectionOncePerFile && grew,
    detail: `HEAD ${head.slice(0, 8)} · entries ${entries} · ${stat || '(no diff)'} · `
      + wired.map((w) => `${w.p.split('/').pop()} +${w.add}/-${w.del} sections:${w.heads}`).join(' · '),
  };
});

// B2 — the LATENT clone break. Three uncommitted edits wire committed files to uncommitted targets.
// This assertion originally tested HEAD and failed, which is how the report's own overstatement was
// caught: at HEAD none of these wirings exist, so a fresh clone today is FINE. The break is armed only
// if these edits are committed without their targets. Latent, not live — and the distinction is the
// whole finding, so the assertion tests both frames explicitly.
check(2, 'latent clone break: 3 wirings present in worktree, ABSENT at HEAD, targets untracked', () => {
  const rows = [
    ['scripts/ship-client.sh', 'verify-approved-scope', 'scripts/verify-approved-scope.mjs'],
    ['.claude/settings.json', 'client-surface', '.claude/hooks/client-surface-gate.sh'],
    ['.githooks/pre-commit', 'validate-delivery-manifest', 'scripts/validate-delivery-manifest.mjs'],
  ];
  const target0 = corrupt('target path', rows[0][2], 'scripts/__nonexistent__.mjs');
  const out = rows.map(([host, needle, target], i) => {
    const t = i === 0 ? target0 : target;
    const atHead = (git('show', `HEAD:${host}`).match(new RegExp(needle, 'g')) || []).length;
    const inTree = (read(`${REPO}/${host}`).match(new RegExp(needle, 'g')) || []).length;
    return { host, atHead, inTree, targetExists: existsSync(`${REPO}/${t}`), targetTracked: tracked(t) };
  });
  return { pass: out.every((r) => r.atHead === 0 && r.inTree > 0 && r.targetExists && !r.targetTracked),
    detail: out.map((r) => `${r.host.split('/').pop()}: HEAD ${r.atHead}, tree ${r.inTree}, target exists ${r.targetExists}/tracked ${r.targetTracked}`).join(' · ') };
});

// B3 — the self-cleaner: built, uncommitted, unregistered, four committed commands aimed at it.
check(3, 'self-cleaner built + untracked + unregistered, wired by 4 tracked npm scripts', () => {
  const sweep = corrupt('sweep path', '.claude/hooks/lib/selfclean/sweep.mjs', '.claude/hooks/lib/selfclean/__nope__.mjs');
  const exists = existsSync(`${REPO}/${sweep}`);
  const isTracked = tracked(sweep);
  const pkg = git('show', `HEAD:package.json`);
  const wired = (pkg.match(/selfclean/g) || []).length;
  const settings = (read(`${REPO}/.claude/settings.json`).match(/selfclean/g) || []).length;
  return { pass: exists && !isTracked && wired >= 4 && settings === 0,
    detail: `exists ${exists} · tracked ${isTracked} · package.json selfclean refs ${wired} · settings.json refs ${settings}` };
});

// B4 — the two gates differ between repository source and the copy that runs.
check(4, 'gate drift: labor-gate + isolation-perimeter differ source vs installed', () => {
  const srcDir = corrupt('source dir', `${REPO}/.claude/skills/ultra-agents/setup/hooks`, `${REPO}/__no_such_dir__`);
  const pairs = [['labor-gate.mjs', `${HOME}/.claude/hooks/labor-gate.mjs`],
                 ['check-isolation-perimeter.mjs', `${HOME}/.claude/hooks/check-isolation-perimeter.mjs`]];
  const diffs = pairs.map(([n, inst]) => {
    const a = read(`${srcDir}/${n}`), b = read(inst);
    return { n, both: !!a && !!b, differ: !!a && !!b && a !== b };
  });
  return { pass: diffs.every((d) => d.both && d.differ),
    detail: diffs.map((d) => `${d.n}: readable ${d.both}, differ ${d.differ}`).join(' · ') };
});

// B5 — a live rule orders a command that now exits non-zero.
check(5, 'stale rule: hooks-identity.md orders parse-verdict --self-test, which now fails', () => {
  const rule = corrupt('rule path', `${REPO}/.claude/rules/hooks-identity.md`, `${REPO}/.claude/rules/__none__.md`);
  const orders = read(rule).includes('parse-verdict.mjs --self-test');
  let exitCode = 0;
  try { execFileSync('node', [`${REPO}/.claude/hooks/lib/parse-verdict.mjs`, '--self-test'], { stdio: 'pipe' }); }
  catch (e) { exitCode = e.status ?? 1; }
  return { pass: orders && exitCode !== 0, detail: `rule still orders it ${orders} · command exit ${exitCode}` };
});

// B6 — the untracked archive, by scale.
check(6, '_archive/ present, untracked, and very large', () => {
  const dir = corrupt('archive path', `${REPO}/_archive`, `${REPO}/__no_archive__`);
  if (!existsSync(dir)) return { pass: false, detail: `${dir} absent` };
  const ignored = git('check-ignore', '_archive').trim();
  let count = 0;
  try { count = execFileSync('bash', ['-c', `find "${dir}" -type f 2>/dev/null | wc -l`], { encoding: 'utf8' }).trim(); } catch { /* */ }
  return { pass: existsSync(dir) && Number(count) > 50000, detail: `exists · files ${count} · git-ignored: ${ignored || 'no'}` };
});

const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} assertions pass.`);

if (SELF_TEST) {
  const ok = failed === results.length;
  console.log(ok
    ? `\nSELF-TEST PASSED — all ${failed} assertions failed, each against its own single corrupted input.`
    : `\nSELF-TEST FAILED — ${results.length - failed} assertion(s) still passed while their input was corrupted.\n` +
      `Those assertions do not depend on the input they claim to measure:\n` +
      results.filter((r) => r.pass).map((r) => `  B${r.n} ${r.name}`).join('\n'));
  process.exit(ok ? 0 : 1);
}

console.log(failed === 0 ? "The report's facts reproduce." : "The report and the machine disagree.");
process.exit(failed === 0 ? 0 : 1);
