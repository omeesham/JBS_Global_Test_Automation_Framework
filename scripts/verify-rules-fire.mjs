#!/usr/bin/env node
/**
 * verify-rules-fire.mjs — every `.claude/rules/*.md` `paths:` glob must match ≥1 live file.
 *
 * Converts SILENT rule-rot into a LOUD pipeline:validate failure: when a restructure moves
 * files (e.g. specs/ → tests/), a path-scoped rule whose glob still points at the old path
 * silently stops auto-loading — future agents never see the rule. This guard fails the moment
 * any glob matches zero files.
 *
 * Built by PLAN_ENCORE_POM_RESTRUCTURE (2026-06-05). Exit 0 = all globs live; 1 = ≥1 dead glob.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const RULES_DIR = path.join(REPO_ROOT, '.claude', 'rules');
const IGNORE = ['**/node_modules/**', '.claude/worktrees/**', '.work/**'];

function parsePathGlobs(src) {
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return [];
  const globs = [];
  let inPaths = false;
  for (const line of fm[1].split(/\r?\n/)) {
    if (/^paths:\s*$/.test(line)) { inPaths = true; continue; }
    if (inPaths) {
      const m = line.match(/^\s*-\s*["']?([^"'\r\n]+?)["']?\s*$/);
      if (m) { globs.push(m[1].trim()); continue; }
      if (/^\S/.test(line)) inPaths = false; // next top-level frontmatter key
    }
  }
  return globs;
}

const dead = [];
let checked = 0;
for (const f of fs.readdirSync(RULES_DIR).filter((n) => n.endsWith('.md'))) {
  for (const g of parsePathGlobs(fs.readFileSync(path.join(RULES_DIR, f), 'utf8'))) {
    checked++;
    let matches = [];
    try { matches = globSync(g, { cwd: REPO_ROOT, dot: true, ignore: IGNORE }); } catch { matches = []; }
    if (matches.length === 0) dead.push(`${f} :: ${g}`);
  }
}

if (dead.length) {
  console.error(`[verify-rules-fire] ${dead.length} DEAD glob(s) (match 0 live files) — rule silently stopped firing:`);
  for (const d of dead) console.error('  ' + d);
  process.exit(1);
}
console.log(`[verify-rules-fire] OK — all ${checked} .claude/rules/*.md paths: globs match ≥1 live file`);
process.exit(0);
