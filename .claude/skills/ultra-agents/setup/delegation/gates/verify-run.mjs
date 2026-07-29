#!/usr/bin/env node
/**
 * verify-run.mjs — Anti-cheat acceptance verifier (gates-A).
 *
 * CLI contract (T3):
 *   node verify-run.mjs --report <path> [--manifest <envelope.json>] [--window <ISO>..<ISO>]
 *
 * Output: single JSON line to stdout:
 *   {"run_id":…,"verdict":"GENUINE"|"FABRICATED"|"UNPROVABLE","reasons":[…]}
 *
 * Exit: 0 only on GENUINE; 1 on FABRICATED or UNPROVABLE.
 *
 * Trap compliance:
 *   T1 — birthtime is NEVER positive evidence (Windows copy-trap)
 *   T2 — CHECK3 string matching only on report's own execution output, not quoted evidence
 *   T3 — CLI args (--report/--manifest/--window), stdout JSON, exit codes
 *   T4 — ±5 min tolerance on window START edge only; post-end = FABRICATED
 *   T5 — GENUINE always has non-empty reasons (structural invariant)
 *   T6 — basename resolution across run_dir/sandbox_dir
 *   T7 — sanity on derived durations (reject > 86400s)
 */

import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { resolve, dirname, basename, join } from 'node:path';

// ── CHEATPROOF Phase 6b: self-integrity check ────────────────────────────────
// Refuse to run if this file sha256 does not match the Rutvik-owned pin.
// Prevents a tampered verifier from silently green-washing rounds.
(function selfCheck() {
  try {
    const HOME_SC = (process.env.HOME || process.env.USERPROFILE || '').replace(/\\/g, '/');
    const pinPath = HOME_SC + '/.claude/delegation/private/gates.sha256';
    if (!existsSync(pinPath)) return; // pin not installed — soft-allow (announce era)
    const mySha = createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex');
    const line = readFileSync(pinPath, 'utf8').split(/\r?\n/).find(l => l.includes('verify-run.mjs'));
    const pinnedSha = line && line.trim().split(/\s+/)[0];
    if (pinnedSha && pinnedSha.toLowerCase() !== mySha.toLowerCase()) {
      process.stderr.write('verify-run: FATAL — self sha256 ' + mySha + ' != pinned ' + pinnedSha +
        '. Refusing (possible tamper). Re-pin the gates dir hashes into the private pin file.' + String.fromCharCode(10));
      process.exit(3);
    }
  } catch { /* fail-open during announce ramp; harden after promotion */ }
})();

// ── Arg parsing (T3) ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let reportPath = '', manifestPath = '', windowStr = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--report' && args[i + 1]) { reportPath = args[++i]; continue; }
  if (args[i] === '--manifest' && args[i + 1]) { manifestPath = args[++i]; continue; }
  if (args[i] === '--window' && args[i + 1]) { windowStr = args[++i]; continue; }
}
if (!reportPath) {
  process.stderr.write('Usage: node verify-run.mjs --report <path> [--manifest <envelope.json>] [--window <ISO>..<ISO>]\n');
  process.exit(2);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function sha256file(fpath) {
  return createHash('sha256').update(readFileSync(fpath)).digest('hex');
}

function parseWindow(w) {
  if (!w) return null;
  const parts = w.split('..');
  if (parts.length !== 2) return null;
  const start = new Date(parts[0]);
  const end = new Date(parts[1]);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  // T7: reject absurd durations (> 24 hours)
  const durationSec = (end - start) / 1000;
  if (durationSec < 0 || durationSec > 86400) return null;
  return { start, end };
}

/** T6: recursive basename search */
function searchDirRecursive(targetName, dir, depth = 0) {
  if (depth > 5) return null;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const hit = searchDirRecursive(targetName, join(dir, entry.name), depth + 1);
        if (hit) return hit;
      } else if (entry.name === targetName) {
        return join(dir, entry.name);
      }
    }
  } catch { /* permission/access errors */ }
  return null;
}

function findByBasename(name, dirs) {
  for (const dir of dirs) {
    if (!dir) continue;
    try {
      if (!existsSync(dir)) continue;
      const hit = searchDirRecursive(name, dir);
      if (hit) return hit;
    } catch { /* noop */ }
  }
  return null;
}

// ── Load report ──────────────────────────────────────────────────────────────
let reportText;
try {
  reportText = readFileSync(resolve(reportPath), 'utf8');
} catch (e) {
  process.stdout.write(JSON.stringify({ run_id: 'unknown', verdict: 'UNPROVABLE', reasons: [`Report file unreadable: ${e.message}`] }) + '\n');
  process.exit(1);
}

// Extract run_id from report header
let runId = 'unknown';
const ticketMatch = reportText.match(/^#\s*REPORT\s+TICKET-(.+)/m);
if (ticketMatch) runId = ticketMatch[1].trim();

// ── Parse report sections ────────────────────────────────────────────────────
function extractSection(text, heading) {
  // Find the heading line
  const headRe = new RegExp(`^##\\s+${heading}\\b[^\\n]*`, 'm');
  const headMatch = headRe.exec(text);
  if (!headMatch) return '';
  const startIdx = headMatch.index + headMatch[0].length;
  // Find the next ## heading (or end of string)
  const rest = text.slice(startIdx);
  const nextHead = rest.search(/^##\s/m);
  const section = nextHead === -1 ? rest : rest.slice(0, nextHead);
  return section.trim();
}

const diffSummary = extractSection(reportText, 'DIFF_SUMMARY');
const verifyOutput = extractSection(reportText, 'VERIFY_OUTPUT');
const verifyArtifacts = extractSection(reportText, 'VERIFY_ARTIFACTS');

// ── Parse claimed file modifications from DIFF_SUMMARY ───────────────────────
function extractClaimedFiles(diffText) {
  const files = [];
  const lines = diffText.split('\n');
  for (const line of lines) {
    const btMatch = line.match(/`([^`]+\.\w+)`/);
    if (btMatch) {
      const p = btMatch[1].replace(/\//g, '\\');
      if (!files.includes(p)) files.push(p);
      continue;
    }
    const dashMatch = line.match(/^-\s+(\S+\.\w+)/);
    if (dashMatch) {
      const p = dashMatch[1].replace(/\//g, '\\');
      if (!files.includes(p)) files.push(p);
    }
  }
  return files;
}

/** Determine if DIFF_SUMMARY marks a file as "created" */
function isClaimedCreated(claimed) {
  const escaped = claimed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fwdEscaped = claimed.replace(/\\/g, '/').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return !!(
    diffSummary.match(new RegExp(escaped + '[^\\n]*created', 'i')) ||
    diffSummary.match(new RegExp(fwdEscaped + '[^\\n]*created', 'i'))
  );
}

const claimedFiles = extractClaimedFiles(diffSummary);

// ── Determine run directory ──────────────────────────────────────────────────
function findRunDir(rptPath) {
  const rptDir = dirname(resolve(rptPath));
  if (existsSync(join(rptDir, 'meta.json'))) return rptDir;
  const rptName = basename(rptPath, '.report.md');
  let d = rptDir;
  for (let i = 0; i < 10; i++) {
    const candidate = join(d, '.claude', 'state', 'ua-worker', rptName);
    if (existsSync(join(candidate, 'meta.json'))) return candidate;
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  const cwdCandidate = join(process.cwd(), '.claude', 'state', 'ua-worker', rptName);
  if (existsSync(join(cwdCandidate, 'meta.json'))) return cwdCandidate;
  return null;
}

const runDir = findRunDir(reportPath);

// Expanded candidate dirs for basename resolution (Fix 2: T6 across sibling/parent dirs)
const candidateDirs = [
  runDir,
  dirname(resolve(reportPath)),
  process.cwd(),
  // sandbox build dir (common dispatch artifact location)
  runDir ? join(dirname(runDir), 'build') : null,
  runDir ? dirname(runDir) : null,  // parent of run dir
].filter(Boolean);

let meta = null;
if (runDir) {
  try { meta = JSON.parse(readFileSync(join(runDir, 'meta.json'), 'utf8')); } catch { /* noop */ }
}
if (meta && meta.run_id) runId = meta.run_id;

// ── Load manifest ────────────────────────────────────────────────────────────
let manifest = null;
if (manifestPath) {
  try { manifest = JSON.parse(readFileSync(resolve(manifestPath), 'utf8')); } catch { /* noop */ }
}

// ── Derive window ────────────────────────────────────────────────────────────
const runWindow = parseWindow(windowStr) || (meta && runDir ? (() => {
  const procLogs = readdirSync(runDir).filter(f => f.startsWith('process-') && f.endsWith('.log'));
  if (procLogs.length > 0) {
    const tsMatch = procLogs[0].match(/process-(\d+)-/);
    if (tsMatch) {
      const startMs = parseInt(tsMatch[1]);
      const secs = meta.secs || 600;
      // T7: reject nonsensical durations
      if (secs > 86400 || secs < 0) return null;
      return { start: new Date(startMs), end: new Date(startMs + secs * 1000) };
    }
  }
  return null;
})() : null);

const reasons = [];

// ════════════════════════════════════════════════════════════════════════════════
// CHECK 1 — DISK-TRUTH
// ════════════════════════════════════════════════════════════════════════════════
function check1DiskTruth() {
  if (claimedFiles.length === 0) return;

  if (manifest && manifest.files) {
    // Manifest mode: compare pre-dispatch hashes with current hashes
    for (const claimed of claimedFiles) {
      const normalizedClaimed = claimed.replace(/\\/g, '/');

      // T6: try exact path, then basename resolution
      let absPath = resolve(claimed);
      let entry = manifest.files.find(f => {
        const norm = f.path.replace(/\\/g, '/');
        return norm === normalizedClaimed ||
               normalizedClaimed.endsWith(norm) ||
               norm.endsWith(normalizedClaimed);
      });

      if (entry) {
        const manifestAbsPath = resolve(entry.path);
        if (!existsSync(manifestAbsPath)) {
          // T6: try basename search across all candidate dirs
          const hit = findByBasename(basename(claimed), candidateDirs);
          if (!hit) {
            reasons.push(`UNPROVABLE: CHECK1: claimed modified '${claimed}' but file not found at any candidate location`);
            continue;
          }
          absPath = hit;
        } else {
          absPath = manifestAbsPath;
        }
        const currentHash = sha256file(absPath);
        if (currentHash === entry.sha256) {
          reasons.push(`FABRICATED: CHECK1: claimed modified '${claimed}' but sha256 unchanged from manifest (${currentHash.slice(0, 12)}…)`);
        } else {
          // Hash differs — positive evidence of modification
          // Check mtime against window for additional confidence
          if (runWindow) {
            const stat = statSync(absPath);
            const mtime = new Date(stat.mtimeMs);
            if (mtime >= runWindow.start && mtime <= runWindow.end) {
              reasons.push(`VERIFIED: CHECK1: '${claimed}' hash differs from manifest; mtime ${mtime.toISOString()} within window`);
            } else {
              // Hash changed but mtime outside window — still modified, just can't pin timing
              reasons.push(`VERIFIED: CHECK1: '${claimed}' hash differs from manifest (content changed)`);
            }
          } else {
            reasons.push(`VERIFIED: CHECK1: '${claimed}' hash differs from manifest (content changed)`);
          }
        }
      } else {
        // File not in manifest → claimed as newly created
        if (!existsSync(absPath)) {
          // T6: basename fallback across all candidate dirs
          const hit = findByBasename(basename(claimed), candidateDirs);
          if (!hit) {
            reasons.push(`UNPROVABLE: CHECK1: claimed created '${claimed}' but file not found at any candidate location`);
          } else {
            // File found by basename — existence confirms creation (T1: no birthtime needed)
            reasons.push(`VERIFIED: CHECK1: '${claimed}' not in manifest and exists on disk (creation confirmed via basename at ${hit})`);
          }
        } else {
          // File exists and wasn't in manifest → creation confirmed by existence
          reasons.push(`VERIFIED: CHECK1: '${claimed}' not in manifest and exists on disk (creation confirmed)`);
        }
      }
    }
  } else if (runWindow) {
    // Retro mode: no manifest — use window + mtime for modifications,
    // existence for creations. T1: birthtime is NEVER positive evidence.
    const TOLERANCE_MS = 5 * 60 * 1000; // T4: 5 min start-edge tolerance

    for (const claimed of claimedFiles) {
      let absPath = resolve(claimed);

      if (!existsSync(absPath)) {
        // T6: basename fallback across all candidate dirs
        const hit = findByBasename(basename(claimed), candidateDirs);
        if (!hit) {
          reasons.push(`UNPROVABLE: CHECK1: claimed '${claimed}' but file not found at any candidate location`);
          continue;
        }
        absPath = hit;
      }

      const stat = statSync(absPath);
      const mtime = new Date(stat.mtimeMs);
      const created = isClaimedCreated(claimed);

      if (created) {
        // For CREATED files: existence IS the evidence (T1 — no birthtime).
        // The file existing when the report claims creating it, combined with
        // no manifest showing it pre-existed, is sufficient positive evidence.
        reasons.push(`VERIFIED: CHECK1: '${claimed}' claimed created and exists on disk`);
      } else {
        // For MODIFIED files: mtime must be within window (T1: only mtime counts)
        const mtimeInWindow = mtime >= runWindow.start && mtime <= runWindow.end;

        if (mtimeInWindow) {
          reasons.push(`VERIFIED: CHECK1: '${claimed}' mtime ${mtime.toISOString()} within window`);
        } else {
          // Check T4: start-edge tolerance (mtime slightly before window start)
          const beforeStart = runWindow.start - mtime;
          if (beforeStart > 0 && beforeStart <= TOLERANCE_MS) {
            // Within 5 min before start — T4 soft evidence, not fabrication
            reasons.push(`WEAK: CHECK1: '${claimed}' mtime ${mtime.toISOString()} is ${Math.round(beforeStart/1000)}s before window start (T4 tolerance)`);
          } else {
            // mtime outside window — cannot confirm timing (possible cross-run interference)
            reasons.push(`UNPROVABLE: CHECK1: '${claimed}' mtime ${mtime.toISOString()} outside window — cannot confirm timing (possible cross-run interference)`);
          }
        }
      }
    }
  } else {
    // No manifest and no window — cannot verify
    if (claimedFiles.length > 0) {
      reasons.push(`UNPROVABLE: CHECK1: no manifest or window to verify ${claimedFiles.length} claimed file changes`);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CHECK 2 — LEDGER (process/session log analysis)
// ════════════════════════════════════════════════════════════════════════════════
function check2Ledger() {
  if (!runDir) return; // Silently skip — CHECK1 carries the weight

  const procLogs = readdirSync(runDir).filter(f => f.startsWith('process-') && f.endsWith('.log'));
  if (procLogs.length === 0) return;

  const procLogContent = readFileSync(join(runDir, procLogs[0]), 'utf8');

  // Extract workspace ID
  const wsMatch = procLogContent.match(/Workspace initialized:\s+([0-9a-f-]+)/);
  const workspaceId = wsMatch ? wsMatch[1] : null;

  // Try to find session-state data
  const homeDir = process.env.USERPROFILE || process.env.HOME || '';
  const sessionPaths = [
    join(homeDir, '.copilot', 'session-state', workspaceId || ''),
    join(homeDir, '.copilot', 'sessions', workspaceId || ''),
  ].filter(p => workspaceId && existsSync(p));

  let sessionData = null;
  for (const sp of sessionPaths) {
    try {
      const files = readdirSync(sp);
      for (const f of files) {
        if (f.includes('conversation') || f.includes('events') || f.includes('turns')) {
          try { sessionData = readFileSync(join(sp, f), 'utf8'); break; } catch { /* noop */ }
        }
      }
      if (sessionData) break;
    } catch { /* noop */ }
  }

  const hasEditClaims = claimedFiles.length > 0;

  // Check SUB-DISPATCHES claims
  const subDispatchSection = extractSection(reportText, 'SUB-DISPATCHES') ||
                              extractSection(reportText, 'SUB_DISPATCHES');
  const hasSUBDISPATCHES = subDispatchSection.length > 0 &&
    !subDispatchSection.match(/^\s*(none|n\/?a)?\s*$/i);

  if (hasSUBDISPATCHES) {
    if (sessionData) {
      const taskToolCalls = (sessionData.match(/Task|task|agent/gi) || []).length;
      if (taskToolCalls === 0) {
        reasons.push('FABRICATED: CHECK2: report claims SUB-DISPATCHES but session data shows zero task/agent tool invocations');
      }
    } else {
      // Verify claimed run-ids exist on disk
      const claimedRunIds = [];
      for (const line of subDispatchSection.split('\n')) {
        const idMatch = line.match(/\b([a-z][\w-]+-\d+)\b/);
        if (idMatch) claimedRunIds.push(idMatch[1]);
      }
      const repoRoot = process.cwd();
      for (const rid of claimedRunIds) {
        const subDir = join(repoRoot, '.claude', 'state', 'ua-worker', rid);
        if (!existsSync(subDir)) {
          reasons.push(`FABRICATED: CHECK2: SUB-DISPATCHES claims run '${rid}' but no run directory found`);
        }
      }
    }
  }

  // If session data exists, check for write-tool evidence
  if (hasEditClaims && sessionData) {
    const writeToolHits = (sessionData.match(/\b(edit|create|write|MultiEdit)\b/gi) || []).length;
    if (writeToolHits === 0) {
      reasons.push('FABRICATED: CHECK2: report claims file edits but session data shows zero write-tool invocations');
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CHECK 3 — RE-EXEC (T2: only match report's OWN claimed execution output)
// ════════════════════════════════════════════════════════════════════════════════
function check3ReExec() {
  // T2: Only analyze the report's OWN VERIFY_OUTPUT/VERIFY_ARTIFACTS.
  // Blockquoted text ("> ...") and "the report claimed..." patterns are
  // QUOTED EVIDENCE about another report — never match against those.
  const verifySection = verifyArtifacts || verifyOutput;
  if (!verifySection) return;

  // T2: Strip blockquoted lines and "claimed..." attribution lines
  const ownOutput = verifySection
    .split('\n')
    .filter(line => !line.startsWith('>') && !line.match(/^\s*the report claimed/i))
    .join('\n');

  // T2: Strip fenced code blocks that contain quoted evidence
  const lines = ownOutput.split('\n');
  const strippedLines = [];
  let inFence = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      strippedLines.push(line);
    }
  }
  const cleanOutput = strippedLines.join('\n');

  // Look for test command references in own output
  const testRunMatch = cleanOutput.match(/node\s+(\S+\.test\.m?js)/);

  // Extract metrics from OWN output only
  const passedCountMatch = cleanOutput.match(/(\d+)\s+passed/);
  const nodeTestCountMatch = cleanOutput.match(/ℹ\s+tests\s+(\d+)/);
  const nodeTestPassMatch = cleanOutput.match(/ℹ\s+pass\s+(\d+)/);

  if (testRunMatch) {
    const testFile = testRunMatch[1];
    const absTestFile = resolve(testFile);

    if (!existsSync(absTestFile)) {
      reasons.push(`FABRICATED: CHECK3: verify command references '${testFile}' but file does not exist`);
      return;
    }

    // Only re-exec known-safe test files
    if (!/\.test\.m?js$/.test(testFile)) return;

    try {
      const realOutput = execSync(`node "${absTestFile}"`, {
        cwd: dirname(absTestFile),
        timeout: 30000,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const realPassedMatch = realOutput.match(/(\d+)\s+passed/);
      const realNodeTestMatch = realOutput.match(/ℹ\s+tests\s+(\d+)/);

      // Format mismatch
      if (nodeTestCountMatch && !realNodeTestMatch && realPassedMatch) {
        reasons.push(`FABRICATED: CHECK3: report uses node:test format but binary produces simple format`);
      }
      if (passedCountMatch && !realPassedMatch && realNodeTestMatch) {
        reasons.push(`FABRICATED: CHECK3: report uses simple format but binary produces node:test format`);
      }

      // Count mismatch
      if (passedCountMatch && realPassedMatch && passedCountMatch[1] !== realPassedMatch[1]) {
        reasons.push(`FABRICATED: CHECK3: report claims ${passedCountMatch[1]} passed but re-exec shows ${realPassedMatch[1]}`);
      }
      if (nodeTestCountMatch && realNodeTestMatch && nodeTestCountMatch[1] !== realNodeTestMatch[1]) {
        reasons.push(`FABRICATED: CHECK3: report claims ${nodeTestCountMatch[1]} tests but re-exec shows ${realNodeTestMatch[1]}`);
      }
    } catch (e) {
      if (passedCountMatch || nodeTestCountMatch) {
        reasons.push(`FABRICATED: CHECK3: report claims test success but re-exec failed: ${e.message.split('\n')[0]}`);
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXECUTE ALL CHECKS
// ════════════════════════════════════════════════════════════════════════════════
try { check1DiskTruth(); } catch (e) {
  reasons.push(`UNPROVABLE: CHECK1: internal error: ${e.message}`);
}
try { check2Ledger(); } catch (e) {
  reasons.push(`UNPROVABLE: CHECK2: internal error: ${e.message}`);
}
try { check3ReExec(); } catch (e) {
  reasons.push(`UNPROVABLE: CHECK3: internal error: ${e.message}`);
}

// ════════════════════════════════════════════════════════════════════════════════
// VERDICT (T5: GENUINE always requires non-empty reasons)
// ════════════════════════════════════════════════════════════════════════════════
const hasFabricated = reasons.some(r => r.startsWith('FABRICATED'));
const hasUnprovable = reasons.some(r => r.startsWith('UNPROVABLE'));
const hasWeak = reasons.some(r => r.startsWith('WEAK'));
const hasVerified = reasons.some(r => r.startsWith('VERIFIED'));

let verdict;
if (hasFabricated) {
  verdict = 'FABRICATED';
} else if (hasUnprovable) {
  verdict = 'UNPROVABLE';
} else if (hasWeak && !hasVerified) {
  // Only weak/soft evidence with nothing verified → UNPROVABLE (T4)
  verdict = 'UNPROVABLE';
} else if (hasVerified) {
  // T5: GENUINE requires positive evidence (VERIFIED reasons present)
  verdict = 'GENUINE';
} else if (claimedFiles.length === 0 && !diffSummary) {
  verdict = 'UNPROVABLE';
  reasons.push('UNPROVABLE: report contains no verifiable claims');
} else {
  // Claims exist but no checks produced evidence either way
  verdict = 'UNPROVABLE';
  reasons.push('UNPROVABLE: claims present but no positive or negative evidence found');
}

process.stdout.write(JSON.stringify({ run_id: runId, verdict, reasons }) + '\n');
process.exit(verdict === 'GENUINE' ? 0 : 1);
