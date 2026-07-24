#!/usr/bin/env node
/**
 * scripts/check-enforcement-claims.mjs
 * Sev: S1 | Graduating incident: 2026-07-24 gate-census found 5 FAKE enforcement claims
 *
 * Checks that rule/doc/skill files claiming a firing mechanism actually have that
 * mechanism wired on disk. Lines carrying honesty markers pass automatically.
 *
 * Usage:
 *   node scripts/check-enforcement-claims.mjs [--enforce|--announce]
 *   --announce (default): print warnings, exit 0
 *   --enforce: print warnings, exit 1 if any failures
 */

import { readFileSync, existsSync, appendFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ── Config ──────────────────────────────────────────────────────────────────

const MODE = process.argv.includes('--enforce') ? 'enforce' : 'announce';

// Corpus: files to scan for enforcement claims
const CORPUS_GLOBS = [
  'CLAUDE.md',
  '.claude/rules/*.md',
  'docs/read_only_docs/LEARNED_RULES.md',
  'docs/read_only_docs/AGENT_SHARED_RULES.md',
];

// Dynamically add client CLAUDE.md and skill SKILL.md files
function gatherCorpus() {
  const files = [];
  for (const pattern of CORPUS_GLOBS) {
    if (pattern.includes('*')) {
      const dir = resolve(ROOT, pattern.replace(/\/\*\.md$/, ''));
      if (existsSync(dir)) {
        for (const f of readdirSync(dir)) {
          if (f.endsWith('.md')) files.push(join(dir, f));
        }
      }
    } else {
      const p = resolve(ROOT, pattern);
      if (existsSync(p)) files.push(p);
    }
  }
  // clients/*/CLAUDE.md
  const clientsDir = resolve(ROOT, 'clients');
  if (existsSync(clientsDir)) {
    for (const c of readdirSync(clientsDir)) {
      const p = join(clientsDir, c, 'CLAUDE.md');
      if (existsSync(p)) files.push(p);
    }
  }
  // .claude/skills/*/SKILL.md
  const skillsDir = resolve(ROOT, '.claude/skills');
  if (existsSync(skillsDir)) {
    for (const s of readdirSync(skillsDir)) {
      const p = join(skillsDir, s, 'SKILL.md');
      if (existsSync(p)) files.push(p);
    }
  }
  return files;
}

// Claim detection regex — requires the line to NAME a mechanism
const CLAIM_RE = /(?:enforced\s+(?:structurally\s+)?by|hook\s+(?:blocks|refuses|denies)|pre-commit\s+gate|pre-push\s+hook|PreToolUse|PostToolUse|Stop[\s-]hook|CI\s+required\s+check)/i;

// Honesty markers that make a claim PASS without wiring check
const MARKER_RE = /\[NOT-YET-WIRED\]|\[NOT-WIRED-BY-DESIGN:[^\]]+\]|\[AGENT-DISCIPLINE\]|\[WIRED:\s*([^\]]+)\]/;

// Paths that count as wired mechanisms
function mechanismExists(text) {
  // Extract backtick-quoted paths or inline paths
  const pathCandidates = [];
  const backtickMatches = text.match(/`([^`]+)`/g) || [];
  for (const m of backtickMatches) {
    const inner = m.slice(1, -1);
    if (/\.(mjs|js|ts|sh)$/.test(inner) || /^\.(?:claude|githooks|github)\//.test(inner)) {
      pathCandidates.push(inner);
    }
  }
  // Also try to find bare script/hook references
  const bareRefs = text.match(/(?:scripts|\.githooks|\.claude\/hooks)\/[\w/.-]+/g) || [];
  pathCandidates.push(...bareRefs);

  for (const candidate of pathCandidates) {
    const full = resolve(ROOT, candidate);
    if (existsSync(full)) return true;
  }
  return false;
}

// Check if line references an npm script that exists
function npmScriptExists(text) {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
  const scripts = Object.keys(pkg.scripts || {});
  for (const s of scripts) {
    if (text.includes(s)) return true;
  }
  return false;
}

// ── Main ────────────────────────────────────────────────────────────────────

const corpus = gatherCorpus();
const failures = [];

for (const file of corpus) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relPath = file.replace(ROOT + '\\', '').replace(ROOT + '/', '').replace(/\\/g, '/');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!CLAIM_RE.test(line)) continue;

    // Check ±2 lines for honesty markers
    const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join('\n');
    const markerMatch = context.match(MARKER_RE);
    if (markerMatch) {
      // If [WIRED: <path>], verify the path exists
      if (markerMatch[1]) {
        const wiredPath = markerMatch[1].trim();
        if (existsSync(resolve(ROOT, wiredPath))) continue; // PASS
        // WIRED marker but path missing = FAIL
        failures.push({ file: relPath, line: i + 1, claim: line.trim().slice(0, 120), why: `[WIRED] path not found: ${wiredPath}` });
        continue;
      }
      continue; // Other markers = PASS
    }

    // No marker — check if a named mechanism exists on disk
    if (mechanismExists(line) || npmScriptExists(line)) continue;
    // Check context lines too
    if (mechanismExists(context) || npmScriptExists(context)) continue;

    failures.push({ file: relPath, line: i + 1, claim: line.trim().slice(0, 120), why: 'no wired mechanism found on disk; no honesty marker' });
  }
}

// ── Output ──────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.log(`\n[check-enforcement-claims] ${failures.length} unverified claim(s) (mode: ${MODE}):\n`);
  for (const f of failures) {
    console.log(`  ${f.file}:${f.line} | ${f.claim}`);
    console.log(`    WHY: ${f.why}\n`);
  }
} else {
  console.log(`[check-enforcement-claims] All claims verified or marked. (mode: ${MODE})`);
}

// Fire telemetry
const logPath = resolve(ROOT, '.claude/state/gate-fires.log');
const ts = new Date().toISOString();
try {
  mkdirSync(dirname(logPath), { recursive: true });
  appendFileSync(logPath, `enforcement-claims, ${ts}, ${failures.length > 0 ? 'warn' : 'clean'}, ${MODE}, fails=${failures.length}\n`);
} catch {
  // Telemetry loss is acceptable; blocking a commit is not
}

if (MODE === 'enforce' && failures.length > 0) {
  process.exit(1);
}
process.exit(0);
