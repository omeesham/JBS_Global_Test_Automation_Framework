#!/usr/bin/env node
/**
 * check-fieldinventory-staleness.mjs — SP-AAE-05 staleness signal (AAE-D6).
 *
 * Walks every field-inventory artifact at
 *   clients/<client>/specs_planning/_internal/field-inventories/*.md
 * and parses the **MCP_Session_Date** frontmatter line. For each artifact,
 * computes age vs `today` and emits a verdict:
 *
 *   age <= 14 days        → fresh   (silent in default output)
 *   14 < age <= 30 days   → warn    (printed; exit 0)
 *   age > 30 days OR none → halt    (printed; exit 2 — except module scope)
 *
 * This is the runtime side of the AAE-D6 freshness window contract:
 * planner/generator/auditor agents call this at session start (per their
 * agent file Phase 0.5 "freshness gate" step) and honor the exit code:
 *   0 = proceed (artifact fresh; or warn but consumable)
 *   2 = HALT (artifact stale or missing — emit/refresh per Phase 0.5b)
 *
 * Flags:
 *   --module <kebab-name>       Scope to one module. Exits 2 if no fresh
 *                               artifact for that module; exits 0 if fresh
 *                               or warn-only.
 *   --client <name>             Default: encore (or first directory found).
 *   --today <YYYY-MM-DD>        Inject `today` for deterministic tests.
 *   --warn-days <n>             Default 14. Below this = fresh.
 *   --halt-days <n>             Default 30. Above this = halt.
 *   --out <path>                Write JSON report.
 *   --json                      Emit JSON to stdout (default: human summary).
 *   --test-root <dir>           Override repo root.
 *   --verbose
 *
 * Sibling: scripts/check-tc-has-fieldinventory.mjs (SP-AAE-02 — pre-commit)
 * Sibling: scripts/check-tc-mcp-citations.mjs (SP-AAE-05 — citation heuristic)
 * Parent plan: PLAN_AGENT_AUTHORING_EFFICIENCY.md (AAE-D6)
 * Subplan: plans/pending/SUBPLAN_AAE_05_HEURISTIC_STALENESS.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

const DEFAULT_WARN_DAYS = 14;
const DEFAULT_HALT_DAYS = 30;
const ARTIFACT_FILENAME_RE = /^(.+)-(\d{4}-\d{2}-\d{2})\.md$/;
const MCP_SESSION_DATE_RE = /^\*\*MCP_Session_Date\*\*:\s*(\d{4}-\d{2}-\d{2})\s*$/m;

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = {
    repoRoot: DEFAULT_REPO_ROOT,
    module: null,
    client: null,
    today: null,
    warnDays: DEFAULT_WARN_DAYS,
    haltDays: DEFAULT_HALT_DAYS,
    out: null,
    json: false,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--test-root') { out.repoRoot = path.resolve(argv[++i]); continue; }
    if (a === '--module') { out.module = argv[++i]; continue; }
    if (a === '--client') { out.client = argv[++i]; continue; }
    if (a === '--today') { out.today = argv[++i]; continue; }
    if (a === '--warn-days') { out.warnDays = Number(argv[++i]); continue; }
    if (a === '--halt-days') { out.haltDays = Number(argv[++i]); continue; }
    if (a === '--out') { out.out = path.resolve(argv[++i]); continue; }
    if (a === '--json') { out.json = true; continue; }
    if (a === '--verbose') { out.verbose = true; continue; }
    if (a === '--help' || a === '-h') {
      console.log('Usage: check-fieldinventory-staleness.mjs [--module <kebab>] [--client <name>] [--today YYYY-MM-DD] [--warn-days 14] [--halt-days 30] [--out <json>] [--json] [--verbose]');
      process.exit(0);
    }
  }
  return out;
}

// ---------- date helpers ----------
export function daysBetween(isoOlder, isoNewer) {
  const a = Date.parse(isoOlder + 'T00:00:00Z');
  const b = Date.parse(isoNewer + 'T00:00:00Z');
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Infinity;
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

export function todayIso() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------- artifact discovery ----------
function listClients(repoRoot) {
  const clientsDir = path.join(repoRoot, 'clients');
  if (!fs.existsSync(clientsDir)) return [];
  return fs.readdirSync(clientsDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

function fieldInventoryDir(repoRoot, client) {
  return path.join(repoRoot, 'clients', client, 'specs_planning', '_internal', 'field-inventories');
}

/**
 * Scan a single client's field-inventories directory.
 *
 * @returns {Array<{ client, module, file, filenameDate, sessionDate, ageDays, verdict }>}
 */
export function scanClient({ repoRoot, client, today, warnDays, haltDays }) {
  const dir = fieldInventoryDir(repoRoot, client);
  if (!fs.existsSync(dir)) return [];

  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === '_TEMPLATE.md') continue;
    if (!f.endsWith('.md')) continue;
    const m = f.match(ARTIFACT_FILENAME_RE);
    if (!m) continue;
    const moduleName = m[1];
    const filenameDate = m[2];

    const full = path.join(dir, f);
    const content = fs.readFileSync(full, 'utf8');
    const fmMatch = content.match(MCP_SESSION_DATE_RE);

    let sessionDate, ageDays, verdict, note;
    if (!fmMatch) {
      sessionDate = null;
      ageDays = Infinity;
      verdict = 'halt';
      note = 'missing-mcp-session-date';
    } else {
      sessionDate = fmMatch[1];
      ageDays = daysBetween(sessionDate, today);
      if (sessionDate !== filenameDate) {
        verdict = 'halt';
        note = 'filename-date-mismatch';
      } else if (ageDays < 0) {
        verdict = 'fresh';
        note = 'future-dated';
      } else if (ageDays <= warnDays) {
        verdict = 'fresh';
        note = null;
      } else if (ageDays <= haltDays) {
        verdict = 'warn';
        note = `age ${ageDays} > warnDays ${warnDays}`;
      } else {
        verdict = 'halt';
        note = `age ${ageDays} > haltDays ${haltDays}`;
      }
    }

    out.push({ client, module: moduleName, file: f, filenameDate, sessionDate, ageDays, verdict, note });
  }
  return out;
}

/**
 * Scan all clients (or a specific one) and aggregate.
 */
export function buildReport({ repoRoot, client = null, today, warnDays, haltDays }) {
  const clients = client ? [client] : listClients(repoRoot);
  let artifacts = [];
  for (const c of clients) {
    artifacts = artifacts.concat(scanClient({ repoRoot, client: c, today, warnDays, haltDays }));
  }

  const byVerdict = { fresh: 0, warn: 0, halt: 0 };
  for (const a of artifacts) byVerdict[a.verdict]++;

  return {
    generatedAt: new Date().toISOString(),
    today,
    repoRoot,
    warnDays,
    haltDays,
    totals: {
      artifacts: artifacts.length,
      ...byVerdict,
    },
    artifacts,
  };
}

/**
 * Module-scoped check (called by agent session-start hook).
 *   - If a fresh artifact exists for the module → return { verdict: 'fresh', ... }
 *   - If only warn-aged artifacts exist          → return { verdict: 'warn', ... }
 *   - If only halt-aged or none                  → return { verdict: 'halt', ... }
 *
 * Multiple artifacts per module are allowed (latest by sessionDate wins).
 */
export function moduleVerdict({ repoRoot, client, module: moduleName, today, warnDays, haltDays }) {
  const arts = scanClient({ repoRoot, client, today, warnDays, haltDays })
    .filter(a => a.module === moduleName);
  if (arts.length === 0) {
    return { verdict: 'halt', reason: 'no-artifact', module: moduleName, client };
  }
  // Pick the artifact with the smallest ageDays (= newest sessionDate).
  arts.sort((a, b) => a.ageDays - b.ageDays);
  const best = arts[0];
  return { verdict: best.verdict, ...best, candidates: arts.length };
}

// ---------- entry point ----------
function main() {
  const args = parseArgs(process.argv.slice(2));
  const today = args.today || todayIso();

  // Module-scoped path (agent session-start hook).
  if (args.module) {
    const client = args.client || pickDefaultClient(args.repoRoot);
    if (!client) {
      console.error(`[check-fieldinventory-staleness] no clients/ directory under ${args.repoRoot}`);
      process.exit(2);
    }
    const v = moduleVerdict({
      repoRoot: args.repoRoot, client, module: args.module,
      today, warnDays: args.warnDays, haltDays: args.haltDays,
    });

    if (args.json) {
      process.stdout.write(JSON.stringify(v, null, 2) + '\n');
    } else {
      console.error(`[fieldinventory-staleness] module=${args.module} client=${client} verdict=${v.verdict}` +
        (v.sessionDate ? ` sessionDate=${v.sessionDate} ageDays=${v.ageDays}` : ` reason=${v.reason || v.note || ''}`));
    }
    if (v.verdict === 'halt') process.exit(2);
    process.exit(0);
  }

  // Repo-wide report path (CI / baseline generation).
  const report = buildReport({
    repoRoot: args.repoRoot, client: args.client, today,
    warnDays: args.warnDays, haltDays: args.haltDays,
  });

  // Zero artifacts = the check never ran. Fail loudly with distinct messages.
  if (report.totals.artifacts === 0) {
    const clients = args.client ? [args.client] : listClients(args.repoRoot);
    if (clients.length === 0) {
      console.error(`[check-fieldinventory-staleness] FAIL: no clients/ directory found under ${args.repoRoot}`);
    } else {
      const dirs = clients.map(c => fieldInventoryDir(args.repoRoot, c));
      const existing = dirs.filter(d => fs.existsSync(d));
      if (existing.length === 0) {
        console.error(`[check-fieldinventory-staleness] FAIL: no field-inventories directory exists. Looked in:\n${dirs.map(d => '  ' + d).join('\n')}`);
      } else {
        console.error(`[check-fieldinventory-staleness] FAIL: field-inventories directories exist but contain no matching artifacts. Looked in:\n${existing.map(d => '  ' + d).join('\n')}`);
      }
    }
    process.exit(2);
  }

  if (args.out) {
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(args.out, JSON.stringify(report, null, 2));
    if (args.verbose) console.error(`[check-fieldinventory-staleness] wrote ${args.out}`);
  }

  if (args.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    console.error('[check-fieldinventory-staleness] summary');
    console.error(`  today:           ${today}`);
    console.error(`  artifacts found: ${report.totals.artifacts}`);
    console.error(`  fresh:           ${report.totals.fresh}`);
    console.error(`  warn:            ${report.totals.warn}`);
    console.error(`  halt:            ${report.totals.halt}`);
    if (report.totals.warn > 0 || report.totals.halt > 0) {
      console.error('');
      for (const a of report.artifacts) {
        if (a.verdict === 'fresh') continue;
        console.error(`  ${a.verdict.toUpperCase()}  ${a.client}/${a.module}/${a.file}  age=${a.ageDays}d  note=${a.note || ''}`);
      }
    }
  }

  // Repo-wide invocation does NOT exit nonzero on warns/halts —
  // CI consumers can inspect the JSON and decide. Module-scoped
  // path (above) is the one that exits 2 on halt for agent hooks.
  process.exit(0);
}

function pickDefaultClient(repoRoot) {
  const envClient = process.env.ACTIVE_CLIENT;
  if (envClient) return envClient;
  const cs = listClients(repoRoot);
  if (cs.includes('encore')) return 'encore';
  return cs[0] || null;
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
