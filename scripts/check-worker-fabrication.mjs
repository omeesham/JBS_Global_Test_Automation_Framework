#!/usr/bin/env node
/**
 * check-worker-fabrication.mjs
 *
 * Sev: S1 — silent quality drift (unverified worker claims accepted as truth).
 * Graduating incident: dispatcher integrity work, 2026-07-25 — worker reports
 * were accepted with no machine check that their claims were backed by traces.
 * Justification: S1 not S0 because fabrication is caught before commit/ship
 * (this gate runs pre-accept); S1 not S2 because undetected fabrication
 * directly erodes trust in the entire delegation pyramid.
 *
 * Reads a completed UA-worker run's own artifacts and checks whether each
 * claim in the parity report is backed by a machine trace.
 *
 * Exit codes:  0 = CLEAN   |   1 = FABRICATION_SUSPECTED   |   2 = UNCHECKABLE
 *
 * Usage:
 *   node scripts/check-worker-fabrication.mjs --run <runDirPath>
 *   node scripts/check-worker-fabrication.mjs --self-test
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync, readdirSync, statSync, appendFileSync } from 'node:fs';
import { join, resolve, isAbsolute, dirname, basename } from 'node:path';
import { execSync, execFileSync } from 'node:child_process';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);

// Bug 2: real source extensions that qualify as file citations (not code member-access like args.repoRoot)
const REAL_EXTENSIONS = new Set(['mjs','js','ts','tsx','jsx','json','md','sh','txt','yml','yaml','html','css','py']);
// Bug 1: lazy-built global index of .verify.txt files for hash-based artifact resolution
let _verifyIndex = null;
// F5 basename fallback: Map<basename, absolutePath[]> — built once per run, cached
let _basenameIndex = null;
const BASENAME_SKIP = new Set(['node_modules', '.git', 'test-results', 'playwright-report']);

// ─────────────────────────── CLI ───────────────────────────

const args = process.argv.slice(2);

if (args[0] === '--self-test') {
  process.exit(selfTest());
} else if (args[0] === '--run' && args[1]) {
  process.exit(runCheck(resolve(args[1])));
} else {
  console.error('Usage:');
  console.error('  node scripts/check-worker-fabrication.mjs --run <runDirPath>');
  console.error('  node scripts/check-worker-fabrication.mjs --self-test');
  process.exit(2);
}

// ─────────────────────────── Main ──────────────────────────

function runCheck(runDir) {
  const findings = [];
  const uncheckable = [];
  let claimCount = 0;
  let repoRoot = null;

  // Finalizer: every exit prints VERDICT and appends telemetry on non-zero
  function finish(verdict, exitCode) {
    console.log(`VERDICT: ${verdict}`);
    if (exitCode !== 0) {
      const root = repoRoot || (existsSync(runDir) ? findRepoRoot(runDir) : process.cwd());
      fireTelemetry('check-worker-fabrication', verdict, basename(runDir), root);
    }
    return exitCode;
  }

  // Fail closed: missing run dir
  if (!existsSync(runDir)) {
    console.log(`UNCHECKABLE: run dir does not exist: ${runDir}`);
    return finish('UNCHECKABLE (run dir missing)', 2);
  }

  // Fail closed: missing result.md
  const resultPath = join(runDir, 'result.md');
  if (!existsSync(resultPath)) {
    console.log(`UNCHECKABLE: result.md not found in ${runDir}`);
    return finish('UNCHECKABLE (result.md missing)', 2);
  }

  let report;
  try {
    report = readFileSync(resultPath, 'utf8');
  } catch (e) {
    console.log(`UNCHECKABLE: result.md unreadable: ${e.message}`);
    return finish('UNCHECKABLE (result.md unreadable)', 2);
  }

  if (!report.trim()) {
    console.log(`UNCHECKABLE: result.md is empty in ${runDir}`);
    return finish('UNCHECKABLE (result.md empty)', 2);
  }

  // Read meta.json (optional — F6 needs it)
  const metaPath = join(runDir, 'meta.json');
  let meta = null;
  let metaMalformed = false;
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    } catch (e) {
      metaMalformed = true;
      console.log(`WARNING: meta.json exists but is malformed: ${e.message}`);
    }
    // Meta must be a non-array object — null, arrays, scalars, strings fail closed
    if (!metaMalformed && (meta === null || typeof meta !== 'object' || Array.isArray(meta))) {
      metaMalformed = true;
      console.log(`WARNING: meta.json is not a usable object (got ${meta === null ? 'null' : Array.isArray(meta) ? 'array' : typeof meta})`);
      meta = null;
    }
  }

  repoRoot = findRepoRoot(runDir);

  // Check if logs exist (a run without logs must never exit 0)
  const hasProcessLog = readdirSync(runDir).some(f => /^process-.*\.log$/.test(f));
  const hasLiveLog = existsSync(join(runDir, 'live-output.log'));
  const logsMissing = !hasProcessLog && !hasLiveLog;

  // ── Checks in priority order ──

  console.log('[F5] Checking quote provenance...');
  claimCount += checkF5(report, repoRoot, findings, uncheckable, meta);

  console.log('[F7] Checking parse-coverage dilution...');
  checkParseCoverage(report, claimCount, findings);

  console.log('[F1] Checking claimed edits...');
  claimCount += checkF1(report, repoRoot, findings);

  console.log('[F4] Checking claimed artifacts...');
  claimCount += checkF4(report, repoRoot, runDir, findings, meta);

  console.log('[F6] Checking verdict vs exit code...');
  claimCount += checkF6(report, meta, metaMalformed, findings);

  // BLOCKER 5 (gap): meta exists without exit field — verdict claims unverifiable
  const metaNoExit = meta && !metaMalformed && (meta.exit === undefined || meta.exit === null);
  const hasVerdictClaim = /^\s*VERDICT:\s*\S+/m.test(report);
  if (metaNoExit && hasVerdictClaim) {
    uncheckable.push({ id: 'F6', reason: 'meta.json present without exit field — verdict/exit alignment unverifiable' });
  }

  // F2 & F3: substrate cannot support these checks
  uncheckable.push({ id: 'F2', reason: 'process-*.log records CLI runtime, not tool invocations; live-output.log is narrative only' });
  uncheckable.push({ id: 'F3', reason: 'no file-read trace exists in process-*.log or live-output.log' });

  if (logsMissing) {
    uncheckable.push({ id: 'LOGS', reason: `Missing: process-*.log=${hasProcessLog}, live-output.log=${hasLiveLog}` });
  }

  // ── Output ──

  console.log('\n' + '='.repeat(60));
  console.log(`RUN: ${basename(runDir)}`);
  console.log('='.repeat(60));

  if (findings.length > 0) {
    console.log(`\nFABRICATION_SUSPECTED (${findings.length} finding(s)):\n`);
    for (const f of findings) {
      console.log(`  [${f.id}] ${f.type}`);
      console.log(`    CLAIM: ${f.claim}`);
      console.log(`    EVIDENCE: ${f.evidence}`);
      console.log();
    }
  }

  if (uncheckable.length > 0) {
    console.log(`UNCHECKABLE checks (${uncheckable.length}):`);
    for (const u of uncheckable) {
      console.log(`  [${u.id}] ${u.reason}`);
    }
  }

  // Zero claims = uncheckable, not clean
  if (claimCount === 0) {
    console.log('\nUNCHECKABLE: zero claims parsed from result.md');
    return finish('UNCHECKABLE (zero claims)', 2);
  }

  console.log(`\nCLAIMS_CHECKED: ${claimCount}`);

  let verdict;
  let exitCode;

  if (findings.length > 0) {
    verdict = 'FABRICATION_SUSPECTED';
    exitCode = 1;
  } else if (logsMissing) {
    verdict = 'UNCHECKABLE (logs missing)';
    exitCode = 2;
  } else if (metaNoExit && hasVerdictClaim) {
    verdict = 'UNCHECKABLE (meta without exit)';
    exitCode = 2;
  } else if (uncheckable.some(u => u.id === 'F5')) {
    verdict = 'UNCHECKABLE (F5 ambiguous or superseded)';
    exitCode = 2;
  } else {
    verdict = 'CLEAN';
    exitCode = 0;
  }

  return finish(verdict, exitCode);
}

// ─────────────────── F5: Quote Provenance ──────────────────

function checkF5(report, repoRoot, findings, uncheckable, meta) {
  let claims = 0;
  const lines = report.split('\n');

  const MIN_QUOTE_CHARS = 20;

  // Pattern A: file.ext:N or file.ext:N-M followed by quoted text
  // BLOCKER 1: accept negative/zero line numbers so they can be caught
  const fileLineQuoteRe = /([a-zA-Z0-9_\-./\\]+\.[a-zA-Z]{1,10}):(-?\d+)(?:-(-?\d+))?[:\s]+["'`]([^"'`]{5,})["'`]/;

  for (const line of lines) {
    const m = line.match(fileLineQuoteRe);
    if (!m) continue;
    const [, filePath, lineStr, endLineStr, quotedText] = m;
    const citedLine = parseInt(lineStr, 10);

    if (/^(http|ftp|mailto)/i.test(filePath)) continue;

    // Bug 2: skip bare identifier.identifier (e.g. args.repoRoot) — must have real source extension or path separator
    if (!isRealFileCitation(filePath)) continue;

    // BLOCKER 1: malformed line citation (negative or zero) = fail closed
    if (citedLine <= 0) {
      claims++;
      findings.push({
        id: 'F5', type: 'FABRICATED_QUOTE',
        claim: `${filePath}:${lineStr}: "${truncate(quotedText, 80)}"`,
        evidence: `Malformed line citation (${lineStr}): line numbers must be positive`,
      });
      continue;
    }

    let resolved = resolvePath(filePath, repoRoot);

    // BLOCKER 3: containment check — citations must resolve within repo
    if (resolved && !isContainedIn(resolved, repoRoot)) {
      claims++;
      findings.push({
        id: 'F5', type: 'FABRICATED_QUOTE',
        claim: `${filePath}:${citedLine}: "${truncate(quotedText, 80)}"`,
        evidence: `Cited path escapes repository root: ${filePath}`,
      });
      continue;
    }

    // Missing cited file — try basename fallback before calling fabricated
    if (!resolved || !existsSync(resolved)) {
      const bn = basename(filePath);
      const matches = getBasenameIndex(repoRoot).get(bn) || [];
      if (matches.length === 0) {
        claims++;
        findings.push({
          id: 'F5', type: 'FABRICATED_QUOTE',
          claim: `${filePath}:${citedLine}: "${truncate(quotedText, 80)}"`,
          evidence: `Cited file does not exist: ${filePath}`,
        });
        continue;
      } else if (matches.length >= 2) {
        // Ambiguous basename — cannot attribute; UNCHECKABLE, never FABRICATED_QUOTE
        claims++;
        uncheckable.push({ id: 'F5', reason: `Ambiguous basename "${bn}" (${matches.length} matches) — citation unattributable` });
        continue;
      }
      // Exactly one match — resolve to it; re-run containment check
      resolved = matches[0];
      if (!isContainedIn(resolved, repoRoot)) {
        claims++;
        findings.push({
          id: 'F5', type: 'FABRICATED_QUOTE',
          claim: `${filePath}:${citedLine}: "${truncate(quotedText, 80)}"`,
          evidence: `Basename-resolved path escapes repository root: ${resolved}`,
        });
        continue;
      }
    }

    // BLOCKER 4: cited path must be a readable regular file
    if (!isRegularFile(resolved)) {
      claims++;
      findings.push({
        id: 'F5', type: 'FABRICATED_QUOTE',
        claim: `${filePath}:${citedLine}: "${truncate(quotedText, 80)}"`,
        evidence: `Cited path is not a readable regular file: ${filePath}`,
      });
      continue;
    }

    claims++;
    const fileContent = safeRead(resolved);
    if (fileContent === null) continue;

    const normQuote = normalizeWS(quotedText);
    // Bug 3: strip leading diff marker ("+"/"-") before searching — workers quote diff blocks
    const _diffMark = quotedText.match(/^([+\-])\s+/);
    const normQuoteClean = _diffMark ? normalizeWS(quotedText.replace(/^[+\-]\s*/, '')) : normQuote;

    // Minimum quote-context policy (use stripped form if it is longer)
    const normQuoteForLen = normQuoteClean.length > normQuote.length ? normQuoteClean : normQuote;
    if (normQuoteForLen.length < MIN_QUOTE_CHARS) {
      findings.push({
        id: 'F5', type: 'WEAK_PROVENANCE',
        claim: `${filePath}:${citedLine}: "${truncate(quotedText, 80)}"`,
        evidence: `Quote too short for reliable provenance (${normQuote.length} chars, minimum ${MIN_QUOTE_CHARS})`,
      });
      continue;
    }

    // BLOCKER 2: length is not provenance — require substantive alphanumeric content
    // Use cleaned quote for alpha check so a diff prefix doesn't dilute the density
    const _quoteForAlpha = normQuoteClean.length >= MIN_QUOTE_CHARS ? normQuoteClean : normQuote;
    const alphaCount = (_quoteForAlpha.match(/[a-zA-Z0-9]/g) || []).length;
    if (alphaCount < MIN_QUOTE_CHARS || alphaCount / _quoteForAlpha.length < 0.3) {
      findings.push({
        id: 'F5', type: 'WEAK_PROVENANCE',
        claim: `${filePath}:${citedLine}: "${truncate(quotedText, 80)}"`,
        evidence: `Quote lacks substantive content (${alphaCount} alphanumeric chars, ${(alphaCount / _quoteForAlpha.length * 100).toFixed(0)}% density — minimum 30%)`,
      });
      continue;
    }

    const normFile = normalizeWS(fileContent);
    const fileLines = fileContent.split('\n');

    // Compare at the exact cited line/range — no tolerance window.
    // A citation is a precise claim; delta-1 drift is WRONG_LINE_ATTRIBUTION.
    const citedEnd = endLineStr ? parseInt(endLineStr, 10) : citedLine;
    const windowStart = Math.max(0, citedLine - 1);
    const windowEnd = Math.min(fileLines.length, citedEnd);
    const lineWindow = fileLines.slice(windowStart, windowEnd).join('\n');

    // Bug 3: also try the diff-prefix-stripped form when checking line window and full file
    const normLineWindow = normalizeWS(lineWindow);
    if (normLineWindow.includes(normQuote) ||
        (normQuoteClean !== normQuote && normLineWindow.includes(normQuoteClean))) continue;

    if (normFile.includes(normQuote) || (normQuoteClean !== normQuote && normFile.includes(normQuoteClean))) {
      findings.push({
        id: 'F5', type: 'WRONG_LINE_ATTRIBUTION',
        claim: `${filePath}:${citedLine}: "${truncate(quotedText, 80)}"`,
        evidence: `Text found in ${filePath} but NOT at cited line ${citedLine}`,
      });
    } else {
      // Bug 3: for "-" diff removal lines, check git history before calling fabricated
      if (_diffMark && _diffMark[1] === '-' && normQuoteClean.length >= MIN_QUOTE_CHARS) {
        if (wasEverInGitHistory(normQuoteClean, repoRoot)) continue;
      }
      // Staleness: file modified after run ended — quote may have been accurate when written
      if (isFileModifiedSinceRun(resolved, meta)) {
        uncheckable.push({ id: 'F5', reason: `Superseded: ${basename(resolved)} modified after run ts_end — quote may have been accurate when written` });
        continue;
      }
      findings.push({
        id: 'F5', type: 'FABRICATED_QUOTE',
        claim: `${filePath}:${citedLine}: "${truncate(quotedText, 80)}"`,
        evidence: `Text not found in ${resolved} (whitespace-normalized comparison)`,
      });
    }
  }

  // Pattern B: fenced code block attributed to a file on the preceding line
  for (let i = 0; i < lines.length; i++) {
    if (!/^```/.test(lines[i])) continue;
    if (i === 0) continue;
    const attrLine = lines[i - 1];
    const fileMatch = attrLine.match(/([a-zA-Z0-9_\-./\\]+\.[a-zA-Z]{1,10})/);
    if (!fileMatch) continue;
    if (!/\b(from|in|file|source|see|at|of)\b|[`:]/.test(attrLine)) continue;

    const filePath = fileMatch[1];
    if (/^(http|ftp|mailto)/i.test(filePath)) continue;
    // Bug 2: skip code expressions — only real source extensions or paths
    if (!isRealFileCitation(filePath)) continue;

    const blockLines = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (/^```/.test(lines[j])) break;
      blockLines.push(lines[j]);
    }
    if (blockLines.length === 0) continue;

    let resolved = resolvePath(filePath, repoRoot);

    // BLOCKER 3: containment check for Pattern B
    if (resolved && !isContainedIn(resolved, repoRoot)) {
      claims++;
      findings.push({
        id: 'F5', type: 'FABRICATED_QUOTE',
        claim: `Code block attributed to ${filePath}`,
        evidence: `Cited path escapes repository root: ${filePath}`,
      });
      continue;
    }

    // Missing cited file — try basename fallback before calling fabricated
    if (!resolved || !existsSync(resolved)) {
      const bn = basename(filePath);
      const matches = getBasenameIndex(repoRoot).get(bn) || [];
      if (matches.length === 0) {
        claims++;
        findings.push({
          id: 'F5', type: 'FABRICATED_QUOTE',
          claim: `Code block attributed to ${filePath}`,
          evidence: `Cited file does not exist: ${filePath}`,
        });
        continue;
      } else if (matches.length >= 2) {
        claims++;
        uncheckable.push({ id: 'F5', reason: `Ambiguous basename "${bn}" (${matches.length} matches) — code block unattributable` });
        continue;
      }
      resolved = matches[0];
      if (!isContainedIn(resolved, repoRoot)) {
        claims++;
        findings.push({
          id: 'F5', type: 'FABRICATED_QUOTE',
          claim: `Code block attributed to ${filePath}`,
          evidence: `Basename-resolved path escapes repository root: ${resolved}`,
        });
        continue;
      }
    }

    // BLOCKER 4: must be a regular file
    if (!isRegularFile(resolved)) {
      claims++;
      findings.push({
        id: 'F5', type: 'FABRICATED_QUOTE',
        claim: `Code block attributed to ${filePath}`,
        evidence: `Cited path is not a readable regular file: ${filePath}`,
      });
      continue;
    }

    claims++;
    const fileContent = safeRead(resolved);
    if (fileContent === null) continue;

    const normFile = normalizeWS(fileContent);
    const substantiveLines = blockLines.filter(l => l.trim().length > 3);
    // Bug 3: strip leading diff markers before matching block lines
    const unmatched = substantiveLines.filter(l => {
      const lNorm = normalizeWS(l);
      const lClean = normalizeWS(l.replace(/^[+\-]\s*/, ''));
      return !normFile.includes(lNorm) && !normFile.includes(lClean);
    });

    if (unmatched.length > 0 && unmatched.length >= substantiveLines.length * 0.5) {
      // Staleness: ALL lines missing AND file modified after run ended → superseded, not fabricated
      if (unmatched.length === substantiveLines.length && isFileModifiedSinceRun(resolved, meta)) {
        uncheckable.push({ id: 'F5', reason: `Superseded: ${basename(resolved)} modified after run ts_end — all ${unmatched.length} lines absent may be due to later edits` });
      } else {
        findings.push({
          id: 'F5', type: 'FABRICATED_QUOTE',
          claim: `Code block attributed to ${filePath}: "${truncate(unmatched[0], 60)}"`,
          evidence: `${unmatched.length}/${substantiveLines.length} lines not found in ${resolved}`,
        });
      }
    }
  }

  return claims;
}

// ────────────── F1: Claimed Edit With No Change ────────────

function checkF1(report, repoRoot, findings) {
  const section = extractSection(report, 'DIFF_SUMMARY');
  if (!section) return 0;

  let claims = 0;
  const claimedPaths = new Set();

  // Extract file paths from common DIFF_SUMMARY formats
  const patterns = [
    /(?:created|edited|modified|changed|added|updated)[:\s]+([a-zA-Z0-9_\-./\\]+\.[a-zA-Z]{1,10})/gi,
    /^[-*]\s+([a-zA-Z0-9_\-./\\]+\.[a-zA-Z]{1,10})/gm,
    /([a-zA-Z0-9_\-./\\]+\.[a-zA-Z]{1,10})\s*[:(|]\s*[+\-\d]/gm,
    /([a-zA-Z0-9_\-./\\]+\.[a-zA-Z]{1,10})\s+\(\+\d+/gm,
  ];

  for (const re of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(section)) !== null) {
      const p = m[1];
      if (/^(none|the|and|or|if|is|was|not|no)\./i.test(p)) continue;
      if (/^(http|ftp|mailto)/i.test(p)) continue;
      claimedPaths.add(p);
    }
  }

  for (const cp of claimedPaths) {
    claims++;
    const resolved = resolvePath(cp, repoRoot);

    if (!resolved) {
      findings.push({
        id: 'F1', type: 'UNBACKED_EDIT_CLAIM',
        claim: `DIFF_SUMMARY references: ${cp}`,
        evidence: 'Cannot resolve path from repo root',
      });
      continue;
    }

    if (!existsSync(resolved)) {
      // Double-check with git: maybe the file was deleted intentionally
      let inGit = false;
      try {
        execFileSync('git', ['ls-files', '--error-unmatch', resolved], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' });
        inGit = true;
      } catch { /* not tracked or deleted */ }

      if (!inGit) {
        findings.push({
          id: 'F1', type: 'UNBACKED_EDIT_CLAIM',
          claim: `DIFF_SUMMARY references: ${cp}`,
          evidence: `File does not exist at ${resolved} and is not tracked by git`,
        });
      }
    }
  }

  return claims;
}

// ─────────────── F4: Claimed Artifact Absent ───────────────

function checkF4(report, repoRoot, runDir, findings, meta) {
  const section = extractSection(report, 'VERIFY_ARTIFACTS');
  if (!section) return 0;

  // Skip sections that are just "none" or similar
  if (/^\s*(none|n\/a|—|--)\s*$/im.test(section)) return 0;

  // Bug 1: declared output dir — workers write artifacts to their chip output dir, not the run dir
  const outputDir = meta && typeof meta.outputDir === 'string' ? meta.outputDir :
                    meta && typeof meta.out === 'string' ? meta.out : null;

  // Bug 1 fix: only extract claims from citation-shaped lines, not prose.
  // Shape A: any line carrying sha256= — an explicit artifact claim row.
  // Shape B: any markdown list-item line (- / * / N.) naming an artifact file.
  // A filename embedded in a prose sentence (no sha256=, not a list item) is not a claim.
  // Structural shape, not a negation-word denylist — the next honest phrasing won't slip through.
  //
  // Bug 2 fix: tolerate optional backticks around both the filename and the hash value.
  // Match sha256= then optional `, then hex digits, then optional ` (case-insensitive).
  const artifactFileRe = /`([a-zA-Z0-9_\-./\\]+\.(?:verify\.txt|txt|json|log|md))`|([a-zA-Z0-9_\-./\\]+\.(?:verify\.txt|txt|json|log|md))/;
  const artifactHashRe = /sha256=`?([0-9a-fA-F]{6,64})`?/i;

  let claims = 0;
  const checked = new Set();

  for (const line of section.split('\n')) {
    const isListItem = /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line);
    const hasSha256 = artifactHashRe.test(line);
    if (!hasSha256 && !isListItem) continue;

    const fileM = line.match(artifactFileRe);
    if (!fileM) continue;
    const art = fileM[1] || fileM[2];
    if (checked.has(art)) continue;
    checked.add(art);
    claims++;

    const hashM = line.match(artifactHashRe);
    const claimedHash = hashM ? hashM[1].toLowerCase() : null;

    // (a) Found in run dir — valid
    if (existsSync(join(runDir, art))) continue;

    // (b) Found in declared output dir — valid
    if (outputDir && existsSync(join(outputDir, art))) continue;

    // Containment: artifact path must resolve within repo root (same rule as F5)
    const inRepo = resolvePath(art, repoRoot);
    if (inRepo && !isContainedIn(inRepo, repoRoot)) {
      findings.push({
        id: 'F4', type: 'MISSING_ARTIFACT',
        claim: `VERIFY_ARTIFACTS references: ${art}`,
        evidence: `Artifact path escapes repository root: ${art}`,
      });
      continue;
    }

    // Check repo-relative path
    if (inRepo && existsSync(inRepo)) continue;

    // Hash-first: sha256 match against any .verify.txt found on disk
    if (claimedHash && findByHash(claimedHash, repoRoot)) continue;

    findings.push({
      id: 'F4', type: 'MISSING_ARTIFACT',
      claim: `VERIFY_ARTIFACTS references: ${art}`,
      evidence: claimedHash
        ? `Hash ${claimedHash} not found in run dir, output dir, repo, ~/.claude, or ~/.copilot`
        : `Not found at ${join(runDir, art)}` + (inRepo ? ` or ${inRepo}` : ''),
    });
  }

  return claims;
}

// ──────────── F6: Verdict Contradicts Exit Code ────────────

function checkF6(report, meta, metaMalformed, findings) {
  let claims = 0;

  // BLOCKER 5: malformed meta.json is itself a finding
  if (metaMalformed) {
    claims++;
    findings.push({
      id: 'F6', type: 'VERDICT_EXITCODE_CONFLICT',
      claim: 'meta.json exists but is unparseable',
      evidence: 'Malformed meta.json cannot validate verdict — fail closed',
    });
    return claims;
  }

  if (!meta) return 0;

  // BLOCKER 5: exit must be a number type if present
  const hasExit = meta.exit !== undefined && meta.exit !== null;
  if (hasExit && typeof meta.exit !== 'number') {
    claims++;
    findings.push({
      id: 'F6', type: 'VERDICT_EXITCODE_CONFLICT',
      claim: `meta.json exit is type "${typeof meta.exit}" value ${JSON.stringify(meta.exit)}`,
      evidence: `exit must be a number, got ${typeof meta.exit} — type coercion rejected`,
    });
    return claims;
  }

  // BLOCKER 5: ok:false with exit 0 is an internal contradiction
  if ('ok' in meta && meta.ok === false && hasExit && meta.exit === 0) {
    claims++;
    findings.push({
      id: 'F6', type: 'VERDICT_EXITCODE_CONFLICT',
      claim: 'meta.json: ok=false but exit=0',
      evidence: 'Wrapper bookkeeping contradiction: the wrapper wrote ok=false (failure) with exit=0 (success) — these fields are set by the wrapper, not the worker; investigate wrapper state',
    });
  }

  if (!hasExit) return claims;
  const exitCode = meta.exit;

  // Only match VERDICT: at line start (optional whitespace). This excludes
  // test-output descriptions like "RED: VERDICT: FAIL" or "GREEN: VERDICT: PASS"
  // that appear inside self-test output quoted in the report.
  const verdictLineRe = /^\s*VERDICT:\s*(\S+)/gm;
  let m;
  while ((m = verdictLineRe.exec(report)) !== null) {
    const verdict = m[1].toUpperCase();
    claims++;

    const isPass = /^(PASS|CLEAN|GREEN|SUCCESS|ACCEPTED)/.test(verdict);
    const isFail = /^(FAIL|REJECT|ERROR)/.test(verdict);

    if (isPass && exitCode !== 0) {
      findings.push({
        id: 'F6', type: 'VERDICT_EXITCODE_CONFLICT',
        claim: `Report claims success: "${truncate(m[0].trim(), 60)}"`,
        evidence: `meta.json exit = ${exitCode} (non-zero)`,
      });
    }

    if (isFail && exitCode === 0) {
      findings.push({
        id: 'F6', type: 'VERDICT_EXITCODE_CONFLICT',
        claim: `Report claims failure: "${truncate(m[0].trim(), 60)}"`,
        evidence: `meta.json exit = 0 (success)`,
      });
    }
  }

  return claims;
}

// ──────────────────────── Utilities ────────────────────────

function extractSection(report, name) {
  const re = new RegExp(`^##\\s+${name}\\b[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$)`, 'm');
  const m = report.match(re);
  return m ? m[1].trim() : null;
}

function normalizeWS(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function truncate(s, n) {
  return s.length > n ? s.substring(0, n) + '...' : s;
}

function resolvePath(filePath, repoRoot) {
  if (!filePath || !repoRoot) return null;
  const norm = filePath.replace(/\\/g, '/');
  if (isAbsolute(norm)) return resolve(norm);
  return resolve(join(repoRoot, norm));
}

// BLOCKER 3: containment check — resolved path must be within repo root
function isContainedIn(filePath, root) {
  const resolvedFile = resolve(filePath);
  const resolvedRoot = resolve(root);
  const normFile = resolvedFile.replace(/\\/g, '/').toLowerCase();
  const normRoot = resolvedRoot.replace(/\\/g, '/').toLowerCase();
  return normFile === normRoot || normFile.startsWith(normRoot + '/');
}

// BLOCKER 4: must be a readable regular file (not directory, device, etc.)
function isRegularFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

// MAJOR 6: parse-coverage dilution — flag when claim-like lines vastly exceed parsed claims
function checkParseCoverage(report, parsedClaims, findings) {
  const lines = report.split('\n');
  const claimLikeRe = /[a-zA-Z0-9_\-./\\]+\.[a-zA-Z]{1,10}:\s*-?\d+/;
  let claimLikeCount = 0;
  for (const line of lines) {
    if (claimLikeRe.test(line)) claimLikeCount++;
  }
  if (claimLikeCount > 0 && parsedClaims > 0) {
    const unparsed = claimLikeCount - parsedClaims;
    if (unparsed >= 3 && unparsed > parsedClaims) {
      findings.push({
        id: 'F7', type: 'PARSE_COVERAGE_DILUTION',
        claim: `${parsedClaims} claims fully parsed but ${claimLikeCount} claim-like lines detected`,
        evidence: `${unparsed} claim-like lines evaded full parsing — potential dilution attack`,
      });
    }
  }
}

function findRepoRoot(startDir) {
  let dir = resolve(startDir);
  for (let i = 0; i < 20; i++) {
    if (existsSync(join(dir, '.git'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  try {
    return execSync('git rev-parse --show-toplevel', { cwd: startDir, encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    return startDir;
  }
}

function safeRead(p) {
  try {
    const st = statSync(p);
    if (st.size > 5 * 1024 * 1024) return null;
    return readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

// ──────────────────── Fire Telemetry ───────────────────────

function fireTelemetry(gateName, verdict, target, repoRoot) {
  try {
    const logPath = join(repoRoot, '.claude', 'state', 'gate-fires.log');
    const dir = dirname(logPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const line = `${gateName}, ${new Date().toISOString()}, ${verdict}, ${target}\n`;
    appendFileSync(logPath, line);
  } catch { /* telemetry is best-effort */ }
}

// ──────────────────── Bug Fixes — Utilities ────────────────

// Bug 2: a citation is a real file reference only if it has a known source extension OR a path separator
function isRealFileCitation(filePath) {
  if (filePath.includes('/') || filePath.includes('\\')) return true;
  const dot = filePath.lastIndexOf('.');
  if (dot === -1) return false;
  const ext = filePath.substring(dot + 1).toLowerCase();
  // Short extensions (≤2 chars: .d, .c, .h, .o) are real file types, not code member-access
  if (ext.length <= 2) return true;
  return REAL_EXTENSIONS.has(ext);
}

// Bug 1: build and cache a global index of .verify.txt files (sha256 → absolutePath)
function getVerifyIndex(repoRoot) {
  if (_verifyIndex !== null) return _verifyIndex;
  _verifyIndex = new Map();
  const home = homedir();
  for (const dir of [repoRoot, join(home, '.claude'), join(home, '.copilot')]) {
    if (existsSync(dir)) walkVerifyDir(dir, _verifyIndex, 0);
  }
  return _verifyIndex;
}

function walkVerifyDir(dir, index, depth) {
  if (depth > 12) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const fp = join(dir, e.name);
    if (e.isDirectory()) {
      walkVerifyDir(fp, index, depth + 1);
    } else if (e.isFile() && e.name.endsWith('.verify.txt')) {
      try {
        const hash = createHash('sha256').update(readFileSync(fp)).digest('hex');
        index.set(hash, fp);
      } catch { /* skip unreadable */ }
    }
  }
}

// Bug 1: find any .verify.txt whose sha256 starts with (or equals) the claimed hash prefix
function findByHash(claimedHash, repoRoot) {
  const h = claimedHash.toLowerCase();
  for (const [fullHash, path] of getVerifyIndex(repoRoot)) {
    if (fullHash.startsWith(h)) return path;
  }
  return null;
}

// Bug 3: check git history for text that appeared in a diff removal line
function wasEverInGitHistory(text, repoRoot) {
  try {
    const out = execFileSync('git', ['log', `-S${text.substring(0, 200)}`, '--oneline'], {
      cwd: repoRoot, encoding: 'utf8', stdio: 'pipe', timeout: 8000,
    });
    return out.trim().length > 0;
  } catch { return false; }
}

// F5 basename fallback: build Map<basename, absolutePath[]> over the repo tree once, then cache.
function getBasenameIndex(repoRoot) {
  if (_basenameIndex !== null) return _basenameIndex;
  _basenameIndex = new Map();
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!BASENAME_SKIP.has(e.name)) walk(join(dir, e.name));
      } else if (e.isFile()) {
        const abs = join(dir, e.name);
        if (!_basenameIndex.has(e.name)) _basenameIndex.set(e.name, []);
        _basenameIndex.get(e.name).push(abs);
      }
    }
  }
  walk(repoRoot);
  return _basenameIndex;
}

// F5 staleness guard: true when the file was modified after the run ended (ts_end is ISO-8601).
function isFileModifiedSinceRun(resolvedPath, meta) {
  if (!meta || typeof meta.ts_end !== 'string') return false;
  try {
    const runEndMs = Date.parse(meta.ts_end);
    if (!isFinite(runEndMs)) return false;
    return statSync(resolvedPath).mtimeMs > runEndMs;
  } catch { return false; }
}

// ─────────────────────── Self-Test ─────────────────────────

function selfTest() {
  console.log('Running self-test...\n');

  const tmpBase = join(tmpdir(), `fab-test-${Date.now()}`);
  mkdirSync(tmpBase, { recursive: true });

  const results = [];

  try {
    // ── F5 RED: fabricated quote ──
    results.push(runCase(tmpBase, 'F5-RED', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'test-source.txt:1: "this text absolutely does not exist anywhere"',
        '## DIFF_SUMMARY',
        '- test-source.txt: +1/-0',
      ].join('\n'),
      files: { 'test-source.txt': 'the actual file content is completely different from the claim' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'FABRICATED_QUOTE',
    }));

    // ── F5 GREEN: real quote ──
    results.push(runCase(tmpBase, 'F5-GREEN', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'test-source.txt:1: "the actual file content is here for real"',
        '## DIFF_SUMMARY',
        '- test-source.txt: +1/-0',
      ].join('\n'),
      files: { 'test-source.txt': 'the actual file content is here for real' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── F1 RED: claimed edit, file missing ──
    results.push(runCase(tmpBase, 'F1-RED', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '1 file created: nonexistent-phantom.ts (+10 lines)',
        '## VERIFY_ARTIFACTS',
        'none',
      ].join('\n'),
      files: {},
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'UNBACKED_EDIT_CLAIM',
    }));

    // ── F1 GREEN: claimed edit, file exists ──
    results.push(runCase(tmpBase, 'F1-GREEN', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '1 file created: real-file.ts (+10 lines)',
        '## VERIFY_ARTIFACTS',
        'none',
      ].join('\n'),
      files: { 'real-file.ts': 'export const x = 1;' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── F4 RED: claimed artifact missing ──
    results.push(runCase(tmpBase, 'F4-RED', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'build.verify.txt sha256=abc123 cmd=`npm run build`',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'MISSING_ARTIFACT',
    }));

    // ── F4 GREEN: claimed artifact exists (in run dir) ──
    results.push(runCase(tmpBase, 'F4-GREEN', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'build.verify.txt sha256=abc123 cmd=`npm run build`',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      runFiles: { 'build.verify.txt': 'Build succeeded\n0 errors' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── F6 RED: verdict PASS but exit 1 ──
    results.push(runCase(tmpBase, 'F6-RED', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
        '',
        'VERDICT: PASS — all checks pass',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 1 },
      expectExit: 1,
      expectType: 'VERDICT_EXITCODE_CONFLICT',
    }));

    // ── F6 GREEN: verdict and exit code agree ──
    results.push(runCase(tmpBase, 'F6-GREEN', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
        '',
        'VERDICT: PASS — all checks pass',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── F5 RED: missing cited file (reviewer finding 1) ──
    results.push(runCase(tmpBase, 'F5-RED-MISSING-FILE', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'missing-source.txt:1: "this file does not exist anywhere in the repo"',
        'real-source.txt:1: "the real source content that actually exists here"',
        '## DIFF_SUMMARY',
        '- real-source.txt: +1/-0',
      ].join('\n'),
      files: { 'real-source.txt': 'the real source content that actually exists here' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'FABRICATED_QUOTE',
    }));

    // ── F5 RED: wrong line attribution (reviewer finding 2) ──
    results.push(runCase(tmpBase, 'F5-RED-WRONG-LINE', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:1: "this text only appears on line five of the source file"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'line one\nline two\nline three\nline four\nthis text only appears on line five of the source file\n' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'WRONG_LINE_ATTRIBUTION',
    }));

    // ── F5 RED: weak provenance / partial substring (reviewer finding 3) ──
    results.push(runCase(tmpBase, 'F5-RED-WEAK', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'large-file.txt:1: "const x = 1"',
        '## DIFF_SUMMARY',
        '- large-file.txt: +1/-0',
      ].join('\n'),
      files: { 'large-file.txt': 'lots of code here\nconst x = 1\nmore code and content to fill the file out' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'WEAK_PROVENANCE',
    }));

    // ── F5 RED: wrong line delta-1 (the exact defect payload) ──
    results.push(runCase(tmpBase, 'F5-RED-WRONG-LINE-D1', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:1: "the secret sentence lives on line two of this file"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'line one placeholder content here\nthe secret sentence lives on line two of this file\n' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'WRONG_LINE_ATTRIBUTION',
    }));

    // ── F5 GREEN: correct line control (same quote, right line) ──
    results.push(runCase(tmpBase, 'F5-GREEN-CORRECT-LINE', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:2: "the secret sentence lives on line two of this file"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'line one placeholder content here\nthe secret sentence lives on line two of this file\n' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── F4 RED: malformed meta.json (reviewer finding 4) ──
    results.push(runCase(tmpBase, 'F4-RED-META-MALFORMED', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'source-file.txt:1: "this legitimate quote exists in the source file at line one"',
        '## DIFF_SUMMARY',
        '- source-file.txt: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
      ].join('\n'),
      files: { 'source-file.txt': 'this legitimate quote exists in the source file at line one' },
      rawMeta: '{"exit":0,"ok":tru',
      expectExit: 1,
      expectType: 'VERDICT_EXITCODE_CONFLICT',
    }));

    // ── BLOCKER 1 RED: negative cited line ──
    results.push(runCase(tmpBase, 'F5-RED-NEGATIVE-LINE', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:-1: "this citation has a negative line number which is invalid"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'this citation has a negative line number which is invalid\nline two' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'FABRICATED_QUOTE',
    }));

    // ── BLOCKER 1 GREEN: positive line works ──
    results.push(runCase(tmpBase, 'F5-GREEN-POSITIVE-LINE', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:1: "this citation has a valid positive line number and matches"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'this citation has a valid positive line number and matches\nline two' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── BLOCKER 2 RED: dashes as quote (non-substantive) ──
    results.push(runCase(tmpBase, 'F5-RED-DASHES', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:1: "-------------------------"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': '-------------------------\nreal content here' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'WEAK_PROVENANCE',
    }));

    // ── BLOCKER 2 RED: semicolons as quote (non-substantive) ──
    results.push(runCase(tmpBase, 'F5-RED-SEMICOLONS', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:1: ";;;;;;;;;;;;;;;;;;;;;;;;;"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': ';;;;;;;;;;;;;;;;;;;;;;;;;\nreal content here' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'WEAK_PROVENANCE',
    }));

    // ── BLOCKER 3 RED: path traversal escapes repo ──
    results.push(runCase(tmpBase, 'F5-RED-TRAVERSAL', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        '../outside-parent.txt:1: "this text is in a file outside the repo boundary"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'placeholder' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'FABRICATED_QUOTE',
    }));

    // ── BLOCKER 3 RED: absolute path outside repo ──
    results.push(runCase(tmpBase, 'F5-RED-ABSOLUTE-PATH', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'C:/Windows/system32/fake.txt:1: "this absolute path is outside the repo root entirely"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'placeholder' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'FABRICATED_QUOTE',
    }));

    // ── BLOCKER 4 RED: directory cited as file ──
    results.push(runCase(tmpBase, 'F5-RED-DIRECTORY', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'subdir.d:1: "this citation points to a directory not a regular file"',
      ].join('\n'),
      files: {},
      dirs: ['subdir.d'],
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'FABRICATED_QUOTE',
    }));

    // ── BLOCKER 5 RED: ok:false with exit 0 ──
    results.push(runCase(tmpBase, 'F6-RED-OK-FALSE', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
        '',
        'VERDICT: PASS — all good',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0, ok: false },
      expectExit: 1,
      expectType: 'VERDICT_EXITCODE_CONFLICT',
    }));

    // ── BLOCKER 5 RED: exit as string "0" ──
    results.push(runCase(tmpBase, 'F6-RED-STRING-EXIT', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
        '',
        'VERDICT: PASS — all good',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: "0" },
      expectExit: 1,
      expectType: 'VERDICT_EXITCODE_CONFLICT',
    }));

    // ── BLOCKER 5 GREEN: valid numeric meta with ok:true ──
    results.push(runCase(tmpBase, 'F6-GREEN-VALID-META', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
        '',
        'VERDICT: PASS — all good',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0, ok: true },
      expectExit: 0,
      expectType: null,
    }));

    // ── BLOCKER 5 RED: meta exists without exit field (verdict unverifiable) ──
    results.push(runCase(tmpBase, 'F6-RED-MISSING-EXIT', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
        '',
        'VERDICT: PASS — all checks pass',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { ok: true },
      expectExit: 2,
      expectType: 'meta without exit',
    }));

    // ── BLOCKER 5 GREEN: meta has valid exit field (verdict verifiable) ──
    results.push(runCase(tmpBase, 'F6-GREEN-EXIT-PRESENT', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
        '',
        'VERDICT: PASS — all checks pass',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { ok: true, exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── MAJOR 6 RED: parse-coverage dilution ──
    results.push(runCase(tmpBase, 'F7-RED-DILUTION', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:1: "the only fully parsed claim in this entire report section"',
        'src.txt:2 unquoted citation that evades the full parser but looks like claim',
        'src.txt:3 another unquoted line referencing code that cannot be verified',
        'src.txt:4 yet another unparseable reference buried among real content here',
        'src.txt:5 continuing the dilution pattern with more fake looking references',
        'src.txt:6 more dilution lines that bury the single honest parsed claim here',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'the only fully parsed claim in this entire report section\nline2\nline3\nline4\nline5\nline6' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'PARSE_COVERAGE_DILUTION',
    }));

    // ── MAJOR 6 GREEN: no dilution when all claims parse ──
    results.push(runCase(tmpBase, 'F7-GREEN-NO-DILUTION', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:1: "first real parsed claim that matches the file content exactly"',
        'src.txt:2: "second real parsed claim also matching the source file content"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'first real parsed claim that matches the file content exactly\nsecond real parsed claim also matching the source file content\n' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── META SHAPE RED: meta.json = null ──
    results.push(runCase(tmpBase, 'F6-RED-META-NULL', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      rawMeta: 'null',
      expectExit: 1,
      expectType: 'VERDICT_EXITCODE_CONFLICT',
    }));

    // ── META SHAPE RED: meta.json = array ──
    results.push(runCase(tmpBase, 'F6-RED-META-ARRAY', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      rawMeta: '[1,2,3]',
      expectExit: 1,
      expectType: 'VERDICT_EXITCODE_CONFLICT',
    }));

    // ── META SHAPE RED: meta.json = scalar ──
    results.push(runCase(tmpBase, 'F6-RED-META-SCALAR', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      rawMeta: '42',
      expectExit: 1,
      expectType: 'VERDICT_EXITCODE_CONFLICT',
    }));

    // ── F4 RED: out-of-tree artifact that EXISTS (path-escape) ──
    results.push(runCase(tmpBase, 'F4-RED-ESCAPE', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        '../outside-escape.verify.txt sha256=abc123 cmd=`echo test`',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      parentFiles: { 'outside-escape.verify.txt': 'fake artifact outside repo' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'MISSING_ARTIFACT',
    }));

    // ── Bug 1 GREEN: artifact in declared meta.outputDir, not in run dir ──
    results.push(runCase(tmpBase, 'F4-GREEN-OUTPUT-DIR', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'build.verify.txt sha256=cafebabe cmd=`npm run build`',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      outputFiles: { 'build.verify.txt': 'Build output artifact for test' },
      expectExit: 0,
      expectType: null,
    }));

    // ── Bug 2 GREEN: args.repoRoot is a code expression, not a file citation ──
    results.push(runCase(tmpBase, 'F5-GREEN-CODE-EXPR', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
        '## ASK',
        'args.repoRoot:5: "some text that looks like a file citation but is not one"',
        'pathFormFailures.join:10: "another code expression resembling a file citation"',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── Bug 2 RED: scripts/ghost.mjs has known extension and does not exist ──
    results.push(runCase(tmpBase, 'F5-RED-GHOST-FILE', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'scripts/ghost.mjs:10: "this is a quote from a file that does not exist anywhere"',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'none',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'FABRICATED_QUOTE',
    }));

    // ── Bug 3 GREEN: diff prefix stripped, text IS in the file at cited line ──
    results.push(runCase(tmpBase, 'F5-GREEN-DIFF-PREFIX', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'src.txt:1: "-  const report = buildReport({ repoRoot: cwd })"',
        '## DIFF_SUMMARY',
        '- src.txt: +1/-0',
      ].join('\n'),
      files: { 'src.txt': 'const report = buildReport({ repoRoot: cwd })' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── Bug 1 GREEN: negated prose with .verify.txt in text — structural shape absent, not a claim ──
    results.push(runCase(tmpBase, 'F4-GREEN-BUG1-NEGATION', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        'No artifact files written (ticket forbade file creation: "no .verify.txt, no output dir"). Both commands pasted inline above.',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── Bug 1 RED: genuine list-item citation of ghost file — must fire ──
    results.push(runCase(tmpBase, 'F4-RED-BUG1-CITATION', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        '- ghost-artifact.verify.txt sha256=deadbeef1234deadbeef1234deadbeef1234deadbeef1234deadbeef1234dead cmd=`node test.mjs`',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'MISSING_ARTIFACT',
    }));

    // ── Bug 2 GREEN: backtick-wrapped hash, artifact exists in run dir — must not fire ──
    results.push(runCase(tmpBase, 'F4-GREEN-BUG2-BACKTICK', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        '- `backtick-test.verify.txt` sha256=`aabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd` cmd=`node test.mjs`',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      runFiles: { 'backtick-test.verify.txt': 'test output content' },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── Bug 2 RED: backtick-wrapped hash, artifact missing — must fire ──
    results.push(runCase(tmpBase, 'F4-RED-BUG2-BACKTICK', {
      report: [
        '# REPORT TICKET-test',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
        '## VERIFY_ARTIFACTS',
        '- `missing-backtick.verify.txt` sha256=`1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef` cmd=`node test.mjs`',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'MISSING_ARTIFACT',
    }));

    // ── F5 GREEN: bare basename exists at one location (basename fallback resolves it) ──
    results.push(runCase(tmpBase, 'F5-GREEN-BARE-BASENAME', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'generate-invariants.mjs:5: "the actual content that lives on line five of this file"',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
      ].join('\n'),
      files: {
        'dummy.ts': 'x',
        'scripts/walk-coverage/generate-invariants.mjs': 'line1\nline2\nline3\nline4\nthe actual content that lives on line five of this file\n',
      },
      meta: { exit: 0 },
      expectExit: 0,
      expectType: null,
    }));

    // ── F5 RED: bare basename that exists nowhere in the tree → must still fire FABRICATED_QUOTE ──
    results.push(runCase(tmpBase, 'F5-RED-BARE-BASENAME-MISSING', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'ghost-nowhere-file.mjs:1: "this file does not exist anywhere in the tree at all indeed"',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
      ].join('\n'),
      files: { 'dummy.ts': 'x' },
      meta: { exit: 0 },
      expectExit: 1,
      expectType: 'FABRICATED_QUOTE',
    }));

    // ── F5 UNCHECKABLE: ambiguous basename matches multiple files → must not fire FABRICATED_QUOTE ──
    results.push(runCase(tmpBase, 'F5-UNCHECKABLE-BASENAME-AMBIGUOUS', {
      report: [
        '# REPORT TICKET-test',
        '## DOCTRINE_READ',
        'ambiguous-helper.ts:1: "content that could belong to either of the two files with this basename"',
        '## DIFF_SUMMARY',
        '- dummy.ts: +1/-0',
      ].join('\n'),
      files: {
        'dummy.ts': 'x',
        'src/helpers/ambiguous-helper.ts': 'content that could belong to either of the two files with this basename',
        'src/other/ambiguous-helper.ts': 'content that could belong to either of the two files with this basename',
      },
      meta: { exit: 0 },
      expectExit: 2,
      expectType: 'Ambiguous basename',
    }));

    // ── Print results ──

    console.log('\n' + '='.repeat(60));
    console.log('SELF-TEST RESULTS');
    console.log('='.repeat(60));

    let allPassed = true;
    for (const r of results) {
      const icon = r.passed ? 'PASS' : 'FAIL';
      console.log(`  [${icon}] ${r.name}: exit=${r.actualExit} (expected ${r.expectExit})${!r.passed ? ' <<< MISMATCH' : ''}`);
      if (!r.passed) {
        allPassed = false;
        if (r.stdout) {
          const relevantLines = r.stdout.split('\n').filter(l => /FABRICAT|UNBACKED|MISSING|VERDICT_EXIT|UNCHECKABLE|WEAK_PROV|WRONG_LINE|PARSE_COV/.test(l));
          for (const rl of relevantLines) console.log(`         ${rl.trim()}`);
        }
      }
    }

    const passCount = results.filter(r => r.passed).length;
    console.log(`\n  ${passCount}/${results.length} passed`);
    console.log(`  RED cases:   ${results.filter(r => r.name.includes('RED')).map(r => `${r.name}(${r.passed ? 'pass' : 'FAIL'})`).join(', ')}`);
    console.log(`  GREEN cases: ${results.filter(r => r.name.includes('GREEN')).map(r => `${r.name}(${r.passed ? 'pass' : 'FAIL'})`).join(', ')}`);

    return allPassed ? 0 : 1;

  } finally {
    try { rmSync(tmpBase, { recursive: true, force: true }); } catch { /* best effort */ }
  }
}

function runCase(tmpBase, name, opts) {
  console.log(`  Running case: ${name}...`);
  const caseDir = join(tmpBase, name);
  const runDir = join(caseDir, 'run');
  mkdirSync(runDir, { recursive: true });
  mkdirSync(join(caseDir, '.git'), { recursive: true });

  // Bug 1 support: create an output dir (separate from run dir) and set meta.outputDir
  let resolvedMeta = opts.meta;
  if (opts.outputFiles) {
    const outDir = join(caseDir, 'out');
    mkdirSync(outDir, { recursive: true });
    for (const [p, content] of Object.entries(opts.outputFiles)) {
      const fp = join(outDir, p);
      mkdirSync(dirname(fp), { recursive: true });
      writeFileSync(fp, content);
    }
    resolvedMeta = resolvedMeta ? { ...resolvedMeta, outputDir: outDir } : { outputDir: outDir };
  }

  // Write run artifacts
  writeFileSync(join(runDir, 'result.md'), opts.report);
  if (opts.rawMeta !== undefined) {
    writeFileSync(join(runDir, 'meta.json'), opts.rawMeta);
  } else if (resolvedMeta !== undefined) {
    writeFileSync(join(runDir, 'meta.json'), JSON.stringify(resolvedMeta));
  }
  writeFileSync(join(runDir, 'live-output.log'), 'worker output');
  writeFileSync(join(runDir, 'process-test.log'), 'debug log');

  // Write source files at repo root (caseDir)
  for (const [p, content] of Object.entries(opts.files || {})) {
    const fp = join(caseDir, p);
    mkdirSync(dirname(fp), { recursive: true });
    writeFileSync(fp, content);
  }

  // Create directories at repo root (for BLOCKER 4 test)
  for (const d of (opts.dirs || [])) {
    mkdirSync(join(caseDir, d), { recursive: true });
  }

  // Create files above repo root (for path-escape tests)
  for (const [p, content] of Object.entries(opts.parentFiles || {})) {
    const fp = join(tmpBase, p);
    mkdirSync(dirname(fp), { recursive: true });
    writeFileSync(fp, content);
  }

  // Write files inside run dir
  for (const [p, content] of Object.entries(opts.runFiles || {})) {
    writeFileSync(join(runDir, p), content);
  }

  // Execute as subprocess to capture exit code
  let stdout = '';
  let actualExit = 0;
  try {
    stdout = execSync(`node "${__filename}" --run "${runDir}"`, {
      encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (e) {
    stdout = (e.stdout || '') + (e.stderr || '');
    actualExit = e.status ?? 2;
  }

  let passed = actualExit === opts.expectExit;
  if (opts.expectType && !stdout.includes(opts.expectType)) passed = false;
  // GREEN cases must not contain any finding types
  if (opts.expectType === null) {
    const findingTypes = ['FABRICATED_QUOTE', 'UNBACKED_EDIT_CLAIM', 'MISSING_ARTIFACT', 'VERDICT_EXITCODE_CONFLICT', 'WEAK_PROVENANCE', 'WRONG_LINE_ATTRIBUTION', 'PARSE_COVERAGE_DILUTION'];
    if (findingTypes.some(ft => stdout.includes(ft))) passed = false;
  }

  return { name, passed, actualExit, expectExit: opts.expectExit, expectType: opts.expectType, stdout };
}
