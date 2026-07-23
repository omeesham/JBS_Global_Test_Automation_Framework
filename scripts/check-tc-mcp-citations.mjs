#!/usr/bin/env node
/**
 * check-tc-mcp-citations.mjs — SP-AAE-05 authoring-from-spec heuristic (AAE-D5).
 *
 * Walks every test-case markdown under
 *   clients/<client>/specs_planning/test-cases/**\/*.md
 * and counts TC blocks that lack any MCP citation. A TC block is a section
 * starting at `^## TC-` and ending at the next `^## ` (or EOF / `^---+$` row).
 *
 * Citation forms recognised inside a TC block:
 *   - per-TC `**MCP_VERIFICATION_LOG**: ...`              (preferred — strongest)
 *   - per-TC `[MCP-VERIFIED YYYY-MM-DD, <citation>]`      (inline tag — also strong)
 *   - per-TC `MCP_VERIFICATION_LOG:` plain marker         (weakest acceptable)
 *
 * File-level coverage (file has `^## MCP_VERIFICATION_LOG` section heading)
 * is ALSO counted, but as a separate "file-level anchor" signal — it is NOT
 * a substitute for per-TC citation in strict mode. Reports emit BOTH counts.
 *
 * Output: a JSON report (stdout or --out path) summarising per-file +
 * aggregate counts. Exit code:
 *   0 — no violations against the baseline (or no baseline configured)
 *   2 — script error (bad args, unreadable file, etc.)
 *
 * The script never blocks — it warns. Exit 1 is reserved for the case where
 * --baseline is supplied AND new violations exceed the baseline (CI gate).
 *
 * Sibling: scripts/check-tc-has-fieldinventory.mjs (SP-AAE-02 — pre-commit gate)
 * Parent plan: PLAN_AGENT_AUTHORING_EFFICIENCY.md (AAE-D5)
 * Subplan: plans/pending/SUBPLAN_AAE_05_HEURISTIC_STALENESS.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

const TC_HEADING_RE = /^##\s+(TC-[A-Z0-9]+(?:-[A-Z0-9]+)+)\b.*$/i;
const ANY_H2_RE = /^##\s/;
const TC_SEPARATOR_RE = /^---+\s*$/;
const FILE_LEVEL_ANCHOR_RE = /^##\s+MCP_VERIFICATION_LOG\b/i;

// Per-TC citation patterns (order: strongest first).
const PER_TC_CITATION_PATTERNS = [
  /\*\*MCP_VERIFICATION_LOG\*\*\s*:/i,
  /\[MCP-VERIFIED\s+\d{4}-\d{2}-\d{2}\b/i,
  /MCP_VERIFICATION_LOG\s*:/i, // weakest fallback (covers non-bold inline)
];

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = {
    repoRoot: DEFAULT_REPO_ROOT,
    out: null,
    baseline: null,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--test-root') { out.repoRoot = path.resolve(argv[++i]); continue; }
    if (a === '--out') { out.out = path.resolve(argv[++i]); continue; }
    if (a === '--baseline') { out.baseline = path.resolve(argv[++i]); continue; }
    if (a === '--verbose') { out.verbose = true; continue; }
    if (a === '--help' || a === '-h') {
      console.log('Usage: check-tc-mcp-citations.mjs [--test-root <dir>] [--out <json>] [--baseline <json>] [--verbose]');
      process.exit(0);
    }
  }
  return out;
}

// ---------- TC-block extraction ----------
/**
 * Split a TC markdown file into TC blocks. Each block is the contiguous run
 * of lines from a `^## TC-...` heading through (but not including) the next
 * `^## ` heading. The `---` row that separates TCs is treated as in-block
 * scaffolding and is therefore part of the block (mirrors the format in-repo).
 *
 * @returns {Array<{id: string, headerLine: number, body: string}>}
 */
export function extractTcBlocks(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const blocks = [];
  let cur = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tcMatch = line.match(TC_HEADING_RE);
    if (tcMatch) {
      if (cur) blocks.push(cur);
      cur = { id: tcMatch[1], headerLine: i + 1, lines: [line] };
      continue;
    }
    if (ANY_H2_RE.test(line)) {
      if (cur) { blocks.push(cur); cur = null; }
      continue;
    }
    if (cur) cur.lines.push(line);
  }
  if (cur) blocks.push(cur);

  return blocks.map(b => ({ id: b.id, headerLine: b.headerLine, body: b.lines.join('\n') }));
}

/**
 * Detect whether a TC block contains any per-TC MCP citation.
 *
 * @param {string} body — the TC block body (output of extractTcBlocks)
 * @returns {{ cited: boolean, pattern: string | null }}
 */
export function tcCitationStatus(body) {
  for (const re of PER_TC_CITATION_PATTERNS) {
    if (re.test(body)) return { cited: true, pattern: re.source };
  }
  return { cited: false, pattern: null };
}

/**
 * Detect file-level `## MCP_VERIFICATION_LOG` anchor sections.
 * @returns {number} count of file-level anchor sections
 */
export function countFileLevelAnchors(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  let n = 0;
  for (const l of lines) if (FILE_LEVEL_ANCHOR_RE.test(l)) n++;
  return n;
}

// ---------- file walker ----------
function walkTcMarkdownFiles(repoRoot) {
  const out = [];
  const clientsDir = path.join(repoRoot, 'clients');
  if (!fs.existsSync(clientsDir)) return out;
  for (const client of fs.readdirSync(clientsDir)) {
    const tcRoot = path.join(clientsDir, client, 'specs_planning', 'test-cases');
    if (!fs.existsSync(tcRoot)) continue;
    walkDir(tcRoot, out);
  }
  return out;
}

function walkDir(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkDir(full, out); continue; }
    if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
}

// ---------- core evaluator ----------
/**
 * Build a citation-coverage report from a list of file paths.
 *
 * @param {object} opts
 * @param {string} opts.repoRoot
 * @param {string[]} opts.filePaths — absolute paths
 * @returns {object} report
 */
export function buildReport({ repoRoot, filePaths }) {
  const fileReports = [];
  let totalTcs = 0;
  let totalCited = 0;
  let totalFileLevelAnchors = 0;
  let filesWithoutAnyCitation = 0;

  for (const full of filePaths) {
    const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
    const text = fs.readFileSync(full, 'utf8');
    const blocks = extractTcBlocks(text);
    const fileLevelAnchors = countFileLevelAnchors(text);
    const tcs = blocks.map(b => {
      const status = tcCitationStatus(b.body);
      return { id: b.id, headerLine: b.headerLine, cited: status.cited, pattern: status.pattern };
    });
    const cited = tcs.filter(t => t.cited).length;
    const uncited = tcs.length - cited;

    fileReports.push({
      file: rel,
      tcCount: tcs.length,
      perTcCited: cited,
      perTcUncited: uncited,
      fileLevelAnchors,
      uncitedTcIds: tcs.filter(t => !t.cited).map(t => t.id),
    });

    totalTcs += tcs.length;
    totalCited += cited;
    totalFileLevelAnchors += fileLevelAnchors;
    if (cited === 0 && fileLevelAnchors === 0) filesWithoutAnyCitation++;
  }

  return {
    generatedAt: new Date().toISOString(),
    repoRoot,
    totals: {
      files: fileReports.length,
      tcs: totalTcs,
      perTcCited: totalCited,
      perTcUncited: totalTcs - totalCited,
      fileLevelAnchors: totalFileLevelAnchors,
      filesWithoutAnyCitation,
    },
    files: fileReports,
  };
}

/**
 * Compare a fresh report against a baseline. Returns the delta and a verdict.
 *
 * @returns {{ ok: boolean, deltas: object, message: string }}
 */
export function diffAgainstBaseline(report, baseline) {
  const newUncited = report.totals.perTcUncited;
  const baseUncited = baseline.totals?.perTcUncited ?? 0;
  const delta = newUncited - baseUncited;
  return {
    ok: delta <= 0,
    deltas: {
      perTcUncited: delta,
      filesWithoutAnyCitation: report.totals.filesWithoutAnyCitation - (baseline.totals?.filesWithoutAnyCitation ?? 0),
    },
    message: delta <= 0
      ? `OK — uncited TCs ${newUncited} <= baseline ${baseUncited}`
      : `REGRESSION — uncited TCs grew from ${baseUncited} to ${newUncited} (+${delta})`,
  };
}

// ---------- entry point ----------
function main() {
  const args = parseArgs(process.argv.slice(2));

  const clientsDir = path.join(args.repoRoot, 'clients');
  if (!fs.existsSync(clientsDir)) {
    console.error(`[check-tc-mcp-citations] FAIL — clients directory not found at ${clientsDir}`);
    process.exit(2);
  }

  const filePaths = walkTcMarkdownFiles(args.repoRoot);
  if (filePaths.length === 0) {
    console.error(`[check-tc-mcp-citations] FAIL — no test-case markdown files found under ${clientsDir}/*/specs_planning/test-cases/`);
    process.exit(2);
  }

  const report = buildReport({ repoRoot: args.repoRoot, filePaths });

  if (args.out) {
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(args.out, JSON.stringify(report, null, 2));
    if (args.verbose) console.log(`[check-tc-mcp-citations] wrote ${args.out}`);
  }

  // Human summary on stderr (so --out can pipe stdout JSON)
  console.error('[check-tc-mcp-citations] summary');
  console.error(`  files scanned: ${report.totals.files}`);
  console.error(`  TC blocks:     ${report.totals.tcs}`);
  console.error(`  per-TC cited:  ${report.totals.perTcCited}  (${pct(report.totals.perTcCited, report.totals.tcs)})`);
  console.error(`  per-TC uncited: ${report.totals.perTcUncited}  (${pct(report.totals.perTcUncited, report.totals.tcs)})`);
  console.error(`  file-level anchors: ${report.totals.fileLevelAnchors}`);
  console.error(`  files with NO citation (per-TC OR file-level): ${report.totals.filesWithoutAnyCitation}`);

  if (args.baseline) {
    if (!fs.existsSync(args.baseline)) {
      console.error(`[check-tc-mcp-citations] baseline missing — writing first baseline to ${args.baseline}`);
      fs.mkdirSync(path.dirname(args.baseline), { recursive: true });
      fs.writeFileSync(args.baseline, JSON.stringify(report, null, 2));
      process.exit(0);
    }
    const baseline = JSON.parse(fs.readFileSync(args.baseline, 'utf8'));
    const verdict = diffAgainstBaseline(report, baseline);
    console.error(`[check-tc-mcp-citations] baseline check: ${verdict.message}`);
    process.exit(verdict.ok ? 0 : 1);
  }

  process.exit(0);
}

function pct(n, total) {
  if (!total) return 'n/a';
  return `${((n / total) * 100).toFixed(1)}%`;
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
