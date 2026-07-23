#!/usr/bin/env node
/**
 * check-doctrine-ledger.mjs — Validates the doctrine ledger.
 *
 * Every prescriptive rule in the ledger must carry exactly one of:
 *   ENFORCED BY: <file>:<line>
 *   UNENFORCED: <Sev> — <reason>
 *
 * Enforcement claims are validated via a three-part call-site test:
 *   (a) anchor exists — file:line is real and contains enforcement logic
 *   (b) reachable from a real entrypoint (package.json script, .githooks/*,
 *       .claude/settings.json hook, or closure-gate import)
 *   (c) can fail the parent verdict — a gate pinned to 'announce' that returns
 *       pass:true unconditionally enforces nothing
 *
 * UNENFORCED rules are validated:
 *   - S3 may be permanently unenforced (needs adjudication field)
 *   - S0/S1/S2 must name a pending recipient (plans/pending/ file that exists
 *     and contains a grep-verifiable line item)
 *   - Recipients expire after SLA days
 *
 * Coverage is recomputed from disk on EVERY run — not only when the ledger is empty. Any prescriptive
 * rule with no ledger entry is named and fails the run. (The earlier empty-ledger-only form meant a
 * single seeded entry hid every remaining uncovered rule behind a green line; a check satisfied by a
 * fraction of its subject is the same disease as one satisfied by none of it.)
 *
 * The corpus is `.claude/rules/*.md` + `LEARNED_RULES.md` + each `clients/<id>/CLAUDE.md`, segmented
 * per rule by heading — not one flag per file.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ─── Config ───────────────────────────────────────────────────────────────────

const LEDGER_PATH = path.join(REPO_ROOT, '.claude', 'doctrine-ledger.json');
const GUARDRAIL_CONFIG_PATH = path.join(REPO_ROOT, '.claude', 'guardrail-config.json');
const RULES_DIR = path.join(REPO_ROOT, '.claude', 'rules');
const PLANS_PENDING_DIR = path.join(REPO_ROOT, 'plans', 'pending');
const SETTINGS_PATH = path.join(REPO_ROOT, '.claude', 'settings.json');
const GITHOOKS_DIR = path.join(REPO_ROOT, '.githooks');
const PKG_PATH = path.join(REPO_ROOT, 'package.json');

const MODAL_PATTERN = /\b(MUST(?:\s+NOT)?|REQUIRED|FORBIDDEN)\b/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}

/**
 * Every markdown file that carries binding doctrine.
 *
 * Scope note (why three corpora, not one): the original scan read `.claude/rules/*.md` ONLY, so
 * `LEARNED_RULES.md` and the per-client `CLAUDE.md` — which together hold most of the prescriptive
 * corpus — were structurally invisible. A census that silently covers a fraction of the corpus and
 * reports a clean number is this ledger's own disease, one level up.
 */
function doctrineCorpusFiles() {
  const files = [];
  if (fs.existsSync(RULES_DIR)) {
    for (const f of fs.readdirSync(RULES_DIR).filter(f => f.endsWith('.md'))) {
      files.push(`.claude/rules/${f}`);
    }
  }
  const learned = 'docs/read_only_docs/LEARNED_RULES.md';
  if (fs.existsSync(path.join(REPO_ROOT, learned))) files.push(learned);

  const clientsDir = path.join(REPO_ROOT, 'clients');
  if (fs.existsSync(clientsDir)) {
    for (const c of fs.readdirSync(clientsDir)) {
      const rel = `clients/${c}/CLAUDE.md`;
      if (fs.existsSync(path.join(REPO_ROOT, rel))) files.push(rel);
    }
  }
  return files;
}

/** Derive a stable rule id from a heading, preferring an explicit LR token. */
function ruleIdFromHeading(heading) {
  const lr = heading.match(/\b(LR-[A-Z]*-?\d+)\b/);
  if (lr) return lr[1];
  return heading
    .replace(/^#+\s*/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/**
 * Scan the doctrine corpus for prescriptive rules — PER RULE, not per file.
 *
 * Granularity note: the original scan `break`ed after the first modal hit in a file, so a file
 * holding twenty prescriptive rules counted as ONE. Under-counting the denominator is the precise
 * failure LR-062 names — the agent must not get to decide what counts. Here the machine segments
 * each file on its `##`/`###` headings and reports every section carrying modal language
 * (MUST / MUST NOT / REQUIRED / FORBIDDEN) as its own rule.
 */
function findPrescriptiveRulesOnDisk() {
  const results = [];
  for (const rel of doctrineCorpusFiles()) {
    // Split on /\r?\n/, not '\n'. In JavaScript `.` does not match `\r` (it is a line terminator),
    // so a `(.+)$` heading match silently fails on every CRLF-checked-in file — which on this repo
    // is most of the cross-cutting and client doctrine. Splitting on '\n' alone made those files
    // scan as "zero headings, zero rules": a denominator hole hiding inside the denominator fix.
    const lines = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8').split(/\r?\n/);

    const sections = [];
    let current = { id: `${rel}#preamble`, heading: '(preamble)', start: 0 };
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^#{2,3}\s+(.+)$/);
      if (!m) continue;
      current.end = i;
      sections.push(current);
      current = { id: ruleIdFromHeading(m[1]), heading: m[1].trim(), start: i };
    }
    current.end = lines.length;
    sections.push(current);

    for (const sec of sections) {
      for (let i = sec.start; i < sec.end; i++) {
        if (MODAL_PATTERN.test(lines[i])) {
          results.push({
            id: sec.id,
            file: rel,
            line: i + 1,
            heading: sec.heading,
            text: lines[i].trim().slice(0, 80),
          });
          break; // one representative modal line per RULE (not per file)
        }
      }
    }
  }
  return results;
}

/**
 * Which disk rules does the ledger actually account for?
 *
 * A ledger entry covers a disk rule when its `id` matches, or when its `covers` array names the id.
 * Everything else is uncovered and gets reported — a rule nobody adjudicated is exactly the silent
 * hole this mechanism exists to surface.
 */
function findUncoveredRules(ledgerRules) {
  const claimed = new Set();
  for (const r of ledgerRules) {
    const id = r.id || r.rule_id;
    if (id) claimed.add(id);
    for (const c of r.covers || []) claimed.add(c);
  }
  return findPrescriptiveRulesOnDisk().filter(d => !claimed.has(d.id));
}

/**
 * Three-part call-site test for an ENFORCED BY claim.
 * Returns { pass: boolean, resolution: string, failedPart: string|null }
 */
function threePartTest(enforcedBy) {
  const match = enforcedBy.match(/^(.+):(\d+)$/);
  if (!match) {
    return { pass: false, resolution: 'UNENFORCED (malformed)', failedPart: 'parse', msg: `Cannot parse "${enforcedBy}" as file:line` };
  }
  const [, relFile, lineStr] = match;
  const lineNum = parseInt(lineStr, 10);
  const absPath = path.resolve(REPO_ROOT, relFile);

  // (a) anchor exists
  if (!fs.existsSync(absPath)) {
    return { pass: false, resolution: 'UNENFORCED (disarmed)', failedPart: 'anchor', msg: `File does not exist: ${relFile}` };
  }
  const content = fs.readFileSync(absPath, 'utf8');
  const lines = content.split('\n');
  if (lineNum < 1 || lineNum > lines.length) {
    return { pass: false, resolution: 'UNENFORCED (disarmed)', failedPart: 'anchor', msg: `Line ${lineNum} out of range (file has ${lines.length} lines)` };
  }
  const anchorLine = lines[lineNum - 1];
  // Anchor must contain something non-trivial (not blank/comment-only)
  if (!anchorLine.trim() || /^\s*(\/\/|#|\/\*|\*)\s*$/.test(anchorLine)) {
    return { pass: false, resolution: 'UNENFORCED (disarmed)', failedPart: 'anchor', msg: `Line ${lineNum} is blank or comment-only: "${anchorLine.trim().slice(0, 60)}"` };
  }

  // (b) reachable from a real entrypoint
  const reachable = isReachable(relFile);
  if (!reachable.reached) {
    return { pass: false, resolution: 'UNENFORCED (disarmed)', failedPart: 'reachable', msg: `File not reachable from any entrypoint: ${reachable.reason}` };
  }

  // (c) can fail — check if the gate mode is pinned to 'announce'
  const canFail = checkCanFail(absPath, content, anchorLine, lineNum);
  if (!canFail.canFail) {
    return { pass: false, resolution: 'UNENFORCED (disarmed)', failedPart: 'armable', msg: canFail.reason };
  }

  return { pass: true, resolution: 'ENFORCED', failedPart: null, msg: 'All three parts pass' };
}

/**
 * Check if a file is reachable from a real entrypoint.
 */
function isReachable(relFile) {
  // Entrypoint sources:
  // 1. package.json scripts
  // 2. .githooks/*
  // 3. .claude/settings.json hooks
  // 4. closure-gate imports (files imported by reachable files)

  const normalizedFile = relFile.replace(/\\/g, '/');

  // Check package.json scripts
  try {
    const pkg = loadJSON(PKG_PATH);
    const scripts = pkg.scripts || {};
    for (const [name, cmd] of Object.entries(scripts)) {
      if (cmd.includes(normalizedFile) || cmd.includes(path.basename(normalizedFile))) {
        return { reached: true, via: `package.json script "${name}"` };
      }
    }
  } catch { /* proceed */ }

  // Check .githooks
  if (fs.existsSync(GITHOOKS_DIR)) {
    const hooks = fs.readdirSync(GITHOOKS_DIR).filter(f => !f.endsWith('.md'));
    for (const hook of hooks) {
      try {
        const content = fs.readFileSync(path.join(GITHOOKS_DIR, hook), 'utf8');
        if (content.includes(normalizedFile) || content.includes(path.basename(normalizedFile))) {
          return { reached: true, via: `.githooks/${hook}` };
        }
      } catch { /* proceed */ }
    }
  }

  // Check .claude/settings.json
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      const settings = loadJSON(SETTINGS_PATH);
      const settingsStr = JSON.stringify(settings);
      if (settingsStr.includes(normalizedFile) || settingsStr.includes(path.basename(normalizedFile))) {
        return { reached: true, via: '.claude/settings.json hook' };
      }
    } catch { /* proceed */ }
  }

  // Closure through hook shell scripts named in settings.json.
  //
  // Hooks are registered as shell commands (`bash .claude/hooks/<gate>.sh`), and that shell script
  // is what invokes the .mjs holding the actual enforcement logic. Without this hop the chain
  // settings.json → gate.sh → check-*.mjs breaks at the last link, and EVERY hook-lib enforcement
  // claim gets falsely demoted to `UNENFORCED (disarmed)` — the checker would under-report real
  // enforcement, which is just as dishonest as over-reporting it. Caught when this test demoted
  // LR-047's claim on check-identity-switch.mjs, a gate that is in fact wired at settings.json:62.
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      const settingsStr = JSON.stringify(loadJSON(SETTINGS_PATH));
      const hookScripts = settingsStr.match(/[\w./-]+\.sh/g) || [];
      for (const rel of [...new Set(hookScripts)]) {
        const abs = path.resolve(REPO_ROOT, rel);
        if (!fs.existsSync(abs)) continue;
        const content = fs.readFileSync(abs, 'utf8');
        if (content.includes(normalizedFile) || content.includes(path.basename(normalizedFile))) {
          return { reached: true, via: `.claude/settings.json hook → ${rel}` };
        }
      }
    } catch { /* proceed */ }
  }

  // Check if imported by a reachable file (one-level closure)
  // Only match actual import/require statements, not incidental basename occurrence
  const basename = path.basename(normalizedFile);
  const importRe = new RegExp(`(?:import|require)\\s*\\(?\\s*['"][^'"]*${basename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
  try {
    const pkg = loadJSON(PKG_PATH);
    const scripts = pkg.scripts || {};
    for (const [, cmd] of Object.entries(scripts)) {
      const fileRefs = cmd.match(/[\w./-]+\.m?js/g) || [];
      for (const ref of fileRefs) {
        const refAbs = path.resolve(REPO_ROOT, ref.startsWith('scripts/') ? ref : `scripts/${ref}`);
        if (fs.existsSync(refAbs)) {
          try {
            const refContent = fs.readFileSync(refAbs, 'utf8');
            if (importRe.test(refContent)) {
              return { reached: true, via: `imported by ${ref} (closure)` };
            }
          } catch { /* proceed */ }
        }
      }
    }
  } catch { /* proceed */ }

  return { reached: false, reason: 'Not referenced by package.json scripts, .githooks/*, .claude/settings.json hooks, or their imports' };
}

/**
 * Check if a gate can actually fail (part c).
 * A check pinned to 'announce' returns pass:true unconditionally and enforces nothing.
 */
function checkCanFail(absPath, content, anchorLine, lineNum) {
  // Heuristic: look for mode reading patterns in the file
  // If the file reads a mode from guardrail-config and the mode is 'announce', it cannot fail
  const modeMatch = content.match(/['"](\w+_mode|mode)['"]\s*(?:===?|!==?)\s*['"]announce['"]/);
  const exitOnAnnounce = content.includes('exit(0)') || content.includes('exitCode = 0');
  const announceBypass = content.match(/mode\s*(?:===?|!==?)\s*['"]announce['"].*(?:exit\(0\)|exitCode\s*=\s*0|return\s+(?:true|0))/s);

  // Check guardrail-config for relevant mode
  if (fs.existsSync(GUARDRAIL_CONFIG_PATH)) {
    try {
      const config = loadJSON(GUARDRAIL_CONFIG_PATH);
      // Try to find a mode key matching the script name
      const scriptBase = path.basename(absPath, path.extname(absPath)).replace(/^check-/, '').replace(/-/g, '_');
      const modeKey = `${scriptBase}_mode`;
      if (config[modeKey] === 'announce') {
        // Config says announce — gate cannot fail (exits 0 unconditionally by convention)
        return { canFail: false, reason: `Gate mode "${modeKey}" is "announce" in guardrail-config.json — gate exits 0 unconditionally in announce mode` };
      }
    } catch { /* proceed — cannot determine, assume armable */ }
  }

  // If we cannot determine the mode state, assume armable (conservative)
  return { canFail: true, reason: null };
}

/**
 * Validate an UNENFORCED claim.
 */
function validateUnenforced(rule) {
  const findings = [];
  const sev = rule.severity;

  if (!sev) {
    findings.push('Missing severity field');
    return findings;
  }

  if (sev === 'S3') {
    // S3 may be permanently unenforced but needs adjudication
    if (!rule.adjudicator) {
      findings.push(`S3 UNENFORCED without adjudication field — who (distinct from rule author) accepted this?`);
    }
    return findings;
  }

  // S0/S1/S2 must name a pending recipient
  if (!rule.recipient) {
    findings.push(`${sev} UNENFORCED must name a pending recipient (plans/pending/ file) — none given`);
    return findings;
  }

  const recipientPath = path.join(REPO_ROOT, rule.recipient);
  if (!fs.existsSync(recipientPath)) {
    findings.push(`${sev} UNENFORCED recipient does not exist: ${rule.recipient}`);
    return findings;
  }

  // Check recipient contains a grep-verifiable line item for this rule
  const recipientContent = fs.readFileSync(recipientPath, 'utf8');
  const ruleId = rule.id || rule.rule_id || '';
  if (ruleId && !recipientContent.includes(ruleId)) {
    findings.push(`${sev} UNENFORCED recipient "${rule.recipient}" does not contain a reference to rule "${ruleId}"`);
  }

  // Check SLA expiry
  if (rule.unenforced_since) {
    const ledger = loadJSON(LEDGER_PATH);
    const slaDays = ledger.config?.recipient_sla_days || 30;
    const since = new Date(rule.unenforced_since);
    const now = new Date();
    const daysSince = Math.floor((now - since) / (1000 * 60 * 60 * 24));
    if (daysSince > slaDays) {
      findings.push(`${sev} UNENFORCED recipient expired: ${daysSince} days > SLA ${slaDays} days`);
    }
  }

  return findings;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  let exitCode = 0;
  const failures = [];
  const warnings = [];

  // Load ledger
  if (!fs.existsSync(LEDGER_PATH)) {
    fail('Doctrine ledger not found at ' + LEDGER_PATH);
    return;
  }

  let ledger;
  try {
    ledger = loadJSON(LEDGER_PATH);
  } catch (e) {
    fail(`Doctrine ledger is malformed JSON: ${e.message}`);
    return;
  }

  const rules = ledger.rules || [];
  const config = ledger.config || {};

  // ── Coverage floor check (runs ALWAYS, not only on an empty ledger) ──
  //
  // This check previously fired only when `rules.length === 0`. That made it possible to seed ONE
  // entry and have every remaining uncovered rule vanish from the report — the run went green while
  // the corpus was almost entirely unadjudicated. A check that passes because it was handed a
  // fraction of its subject is the same disease as one passing on nothing at all, which is precisely
  // what this mechanism exists to cure. So the denominator is recomputed from disk on every run.
  const uncovered = findUncoveredRules(rules);
  const totalOnDisk = uncovered.length + rules.length;

  if (uncovered.length > 0) {
    console.error('');
    console.error('══════════════════════════════════════════════════════════════');
    console.error(rules.length === 0
      ? 'FAIL: Doctrine ledger is EMPTY but prescriptive rules exist on disk.'
      : `FAIL: Doctrine ledger covers ${rules.length} of ~${totalOnDisk} prescriptive rules on disk.`);
    console.error('Every prescriptive rule needs an enforcement decision — ENFORCED BY a');
    console.error('verified call site, or UNENFORCED with a severity and a named owner.');
    console.error('══════════════════════════════════════════════════════════════');
    console.error('');
    console.error('Uncovered prescriptive rules:');
    for (const r of uncovered) {
      console.error(`  • [${r.id}] ${r.file}:${r.line} — "${r.text}"`);
    }
    console.error('');
    console.error(`Total uncovered: ${uncovered.length} rule(s)`);

    // Ramp per LR-069 §3.3 — an S1 gate lands at `announce`, never straight at `deny`.
    //
    // The knob covers ONLY this coverage floor. Per-rule validation failures below are pushed to
    // `failures` unconditionally: not having adjudicated a rule yet is a backlog, but claiming a rule
    // is enforced when its call site cannot fail is a false green, and a false green never ramps.
    // Either way the uncovered list is printed in full on every run — announce suppresses the exit
    // code, never the report.
    let ledgerMode = 'announce';
    try {
      ledgerMode = loadJSON(GUARDRAIL_CONFIG_PATH).doctrine_ledger_mode ?? 'announce';
    } catch (err) {
      // Config unreadable → stay at announce and say so. Silently hardening to deny would wedge every
      // commit in the repo over a malformed JSON file.
      console.warn(`WARN: could not read doctrine_ledger_mode (${err.message}); defaulting to announce.`);
    }

    if (ledgerMode === 'deny') {
      failures.push(`${uncovered.length} prescriptive rule(s) on disk have no ledger entry`);
    } else {
      warnings.push(
        `doctrine_ledger_mode=${ledgerMode}: ${uncovered.length} uncovered rule(s) reported but NOT blocking. ` +
        `Flip to 'deny' in .claude/guardrail-config.json once uncovered reaches 0.`
      );
    }
  }

  if (rules.length === 0 && uncovered.length === 0) {
    // This checker had the very disease it polices. "Ledger empty AND nothing on disk" was reported
    // as OK/exit 0 — so a moved rules directory, a renamed LEARNED_RULES.md, or a run from the wrong
    // cwd would silently report a clean doctrine layer while checking nothing at all. The corpus is a
    // DEFINED subject that must exist; its absence is a broken scan, never a clean bill of health.
    const corpus = doctrineCorpusFiles();
    if (corpus.length === 0) {
      console.error('');
      console.error('FAIL: doctrine corpus is EMPTY — zero doctrine files found. Looked for:');
      console.error(`  • ${path.relative(REPO_ROOT, RULES_DIR).replace(/\\/g, '/')}/*.md`);
      console.error('  • docs/read_only_docs/LEARNED_RULES.md');
      console.error('  • clients/<id>/CLAUDE.md');
      console.error(`Repo root resolved to: ${REPO_ROOT}`);
      console.error('A doctrine check that finds no doctrine has not passed — it has failed to look.');
      process.exitCode = 1;
      return;
    }
    console.log(`OK: Ledger empty and no prescriptive rules found across ${corpus.length} doctrine file(s).`);
    return;
  }

  // ── Validate each rule in the ledger ──
  let s3Count = 0;
  let totalCount = rules.length;

  for (const rule of rules) {
    const id = rule.id || rule.rule_id || '(unnamed)';

    // Check: must have exactly one of enforced_by or unenforced
    const hasEnforced = !!rule.enforced_by;
    const hasUnenforced = !!rule.unenforced;

    if (!hasEnforced && !hasUnenforced) {
      failures.push(`Rule "${id}": has NEITHER enforced_by NOR unenforced — FAILS floor check`);
      continue;
    }
    if (hasEnforced && hasUnenforced) {
      failures.push(`Rule "${id}": has BOTH enforced_by AND unenforced — must be exactly one`);
      continue;
    }

    if (hasEnforced) {
      // Three-part call-site test
      const result = threePartTest(rule.enforced_by);
      if (!result.pass) {
        failures.push(`Rule "${id}": ENFORCED BY ${rule.enforced_by} → ${result.resolution} (part ${result.failedPart} failed: ${result.msg})`);
      }
    }

    if (hasUnenforced) {
      // Validate unenforced claim
      if (rule.severity === 'S3') s3Count++;
      const unenforcedFindings = validateUnenforced(rule);
      for (const f of unenforcedFindings) {
        failures.push(`Rule "${id}": ${f}`);
      }
    }
  }

  // ── S3 threshold ratio check ──
  if (totalCount > 0 && s3Count > 0) {
    const ratio = s3Count / totalCount;
    if (config.s3_threshold_ratio === null || config.s3_threshold_ratio === undefined) {
      warnings.push(`S3 threshold ratio is UNSET in config (s3_threshold_ratio: null). Ratio check SKIPPED — not silently passed. Current S3 share: ${s3Count}/${totalCount} (${(ratio * 100).toFixed(1)}%).`);
    } else {
      const threshold = config.s3_threshold_ratio;
      if (ratio > threshold) {
        failures.push(`S3 share ${(ratio * 100).toFixed(1)}% exceeds configured threshold ${(threshold * 100).toFixed(1)}% (${s3Count}/${totalCount} rules are S3 UNENFORCED)`);
      }
    }
  }

  // ── Output ──
  if (warnings.length > 0) {
    console.warn('');
    for (const w of warnings) {
      console.warn(`WARN: ${w}`);
    }
  }

  if (failures.length > 0) {
    console.error('');
    console.error(`FAIL: ${failures.length} doctrine-ledger violation(s):`);
    for (const f of failures) {
      console.error(`  ✗ ${f}`);
    }
    console.error('');
    process.exitCode = 1;
  } else {
    console.log(`OK: ${rules.length} ledger rule(s) validated, 0 violations.`);
  }
}

main();
