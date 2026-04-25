#!/usr/bin/env node
/**
 * plans-reindex.mjs — Auto-regenerate plans/INDEX.md from filesystem state.
 *
 * Walks plans/pending/ + plans/done/, parses metadata from each .md header,
 * and writes a complete INDEX.md. This file is the source of truth for plan
 * discovery and MUST be auto-generated — do not hand-edit.
 *
 * Flags:
 *   --check   Exit 1 if regenerated output differs from current INDEX.md
 *             (for CI / pre-commit gating)
 *   --quiet   Suppress stdout summary
 *
 * Parses from the first ~40 lines of each plan file:
 *   - Title:          first `# <text>` line
 *   - Status:         `**Status**: X`  OR  `Status: X`
 *   - Priority:       `**Priority**: X`
 *   - Created:        `**Created**: YYYY-MM-DD`
 *   - Executed:       `**Executed**: YYYY-MM-DD`
 *   - Parent:         `**Parent**: X` (marks this file as a subplan)
 *   - Depends on:     `**Depends on**: SP-XXX, SP-YYY` (dependency chain)
 *   - Model:          `**Model**: claude-opus-4-7 | claude-sonnet-4-6` (LR-041)
 *   - Thinking:       `**Thinking**: mid | hi | xhi | max` (LR-041)
 *   - PermissionMode: `**PermissionMode**: auto | acceptEdits | bypassPermissions` (LR-041)
 *   - BrowserTool:    `**BrowserTool**: cli | chrome | both | none` (LR-038 v2)
 *
 * Dependency resolution:
 *   Each plan's `**Depends on**` field is parsed for SP-* identifiers and
 *   .md filename refs. A reverse lookup is built (SP-id → file) from every
 *   plan's title. Pending plans whose dependencies resolve to other pending
 *   plans are separated into a "Blocked" section; only truly unblocked plans
 *   appear in "Ready to Execute".
 *
 * Missing fields fall back to file mtime / inference where reasonable.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PLANS_DIR = path.join(REPO_ROOT, 'plans');
const PENDING_DIR = path.join(PLANS_DIR, 'pending');
const DONE_DIR = path.join(PLANS_DIR, 'done');
const INDEX_PATH = path.join(PLANS_DIR, 'INDEX.md');

const TODAY = new Date().toISOString().slice(0, 10);
const STALE_DAYS = 14;

const args = process.argv.slice(2);
const CHECK_MODE = args.includes('--check');
const QUIET = args.includes('--quiet');

/** Strip **bold** wrappers and pipe-table formatting from a value. */
function cleanValue(raw) {
  if (!raw) return '';
  return raw
    .replace(/^\*+|\*+$/g, '')
    .replace(/^`|`$/g, '')
    .split('|')[0]
    .trim();
}

function parseField(header, label) {
  // Matches both  **Label**: value   and   Label: value
  const re = new RegExp(
    `(?:^|\\n)\\s*(?:\\*\\*)?${label}(?:\\*\\*)?\\s*:\\s*([^\\n]+)`,
    'i',
  );
  const m = header.match(re);
  return m ? cleanValue(m[1]) : '';
}

function parseTitle(header) {
  const m = header.match(/^#\s+(.+?)\s*$/m);
  return m ? cleanValue(m[1]) : '';
}

/** Extract the plan's own SP identifier from its title, e.g. "SUBPLAN SP-DQU-03: …" → "SP-DQU-03" */
function extractSpId(title) {
  const m = title.match(/\bSP-([\w-]+)/);
  return m ? `SP-${m[1]}` : null;
}

/**
 * Parse `**Depends on**` text into a deduplicated list of dependency identifiers.
 * Handles: SP-* identifiers, range notation (SP-AAE-01..05), and bare .md filenames.
 * Returns [] for "NONE", "nothing", or when no identifiers are found.
 */
function parseDependsOn(raw) {
  if (!raw) return [];
  const lower = raw.trim().toLowerCase();
  // Fast-path: explicit none declarations
  if (/^none\b/.test(lower) || /^nothing\b/.test(lower) || lower === 'can run anytime') return [];

  const refs = new Set();

  // Expand range notation: SP-AAE-01..05 → SP-AAE-01 … SP-AAE-05
  for (const m of raw.matchAll(/SP-([\w-]*?)(\d+)\.\.(\d+)/g)) {
    const prefix = m[1];
    const start = parseInt(m[2], 10);
    const end = parseInt(m[3], 10);
    const width = m[2].length; // preserve zero-padding width
    for (let i = start; i <= end; i++) {
      refs.add(`SP-${prefix}${String(i).padStart(width, '0')}`);
    }
  }

  // Remove already-handled ranges so we don't double-match
  const withoutRanges = raw.replace(/SP-[\w-]*?\d+\.\.\d+/g, '');

  // All remaining SP-* identifiers
  for (const m of withoutRanges.matchAll(/\bSP-([\w-]+)/g)) {
    refs.add(`SP-${m[1]}`);
  }

  // Explicit .md filename references
  for (const m of raw.matchAll(/\b((?:SUBPLAN|PLAN)_\w+\.md)\b/gi)) {
    refs.add(m[1]);
  }

  // Bare plan name references (no .md, all-caps identifier style)
  for (const m of raw.matchAll(/\b(PLAN_[A-Z0-9_]+)\b/g)) {
    refs.add(m[1]);
  }

  return [...refs];
}

/**
 * Derive an SP identifier from a plan's filename as a fallback when the title
 * doesn't contain one. Handles two patterns:
 *   SUBPLAN_GROUP_NN_*   → SP-GROUP-NN    (e.g. SUBPLAN_DQU_03_* → SP-DQU-03)
 *   SUBPLAN_GROUP_NNa_*  → SP-GROUP-NNa   (e.g. SUBPLAN_DQU_06a_* → SP-DQU-06a)
 * Returns null if no pattern matches.
 */
function deriveSpIdFromFilename(filename) {
  const stem = filename.replace(/\.md$/i, '');
  const m = stem.match(/^SUBPLAN_([A-Z]+)_(\d+[a-z]?)_/i);
  if (m) return `SP-${m[1].toUpperCase()}-${m[2]}`;
  return null;
}

/**
 * Build a reverse lookup: identifier → { file, inDone }.
 * Keys (in priority order, first-writer wins):
 *   1. SP-* extracted from title  (most explicit — e.g. HIST_PIVOT plans embed "SP-B-LM-3a:" in title)
 *   2. SP-* derived from filename  (fallback — e.g. SUBPLAN_DQU_03_* → SP-DQU-03)
 *   3. Exact filename
 *   4. Filename stem (no .md, for bare plan-name refs)
 */
function buildPlanLookup(pending, done) {
  const lookup = new Map();
  const add = (key, file, inDone) => {
    if (key && !lookup.has(key)) lookup.set(key, { file, inDone });
  };

  for (const [inDone, plans] of [[false, pending], [true, done]]) {
    for (const p of plans) {
      // 1. Title-based SP identifier (highest priority)
      const spIdFromTitle = extractSpId(p.title);
      if (spIdFromTitle) add(spIdFromTitle, p.file, inDone);

      // 2. Filename-based SP identifier fallback
      const spIdFromFile = deriveSpIdFromFilename(p.file);
      if (spIdFromFile) add(spIdFromFile, p.file, inDone);

      // 3 & 4. Filename and stem
      add(p.file, p.file, inDone);
      add(p.file.replace(/\.md$/i, ''), p.file, inDone);
    }
  }
  return lookup;
}

/**
 * Resolve a plan's dependency identifiers against the lookup.
 * Returns the list of { ref, file } entries that are still in pending/.
 */
function resolveBlockers(depIds, lookup) {
  const blockers = [];
  for (const ref of depIds) {
    const entry = lookup.get(ref);
    if (entry && !entry.inDone) {
      blockers.push({ ref, file: entry.file });
    }
    // Unresolvable refs are silently skipped (external/archived plan, no gate)
  }
  return blockers;
}

function daysBetween(dateStr, refStr = TODAY) {
  if (!dateStr) return null;
  const d1 = Date.parse(dateStr);
  const d2 = Date.parse(refStr);
  if (Number.isNaN(d1) || Number.isNaN(d2)) return null;
  return Math.round((d2 - d1) / 86_400_000);
}

function parsePlanFile(filePath) {
  const stat = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  // Header = first 40 lines (covers both tight and verbose front-matter styles)
  const header = content.split(/\r?\n/).slice(0, 40).join('\n');

  const title = parseTitle(header) || path.basename(filePath, '.md');
  const statusRaw = parseField(header, 'Status');
  const status = statusRaw ? statusRaw.toUpperCase().split(/\s+/)[0] : '';
  const priority = parseField(header, 'Priority');
  const created = parseField(header, 'Created');
  const executed = parseField(header, 'Executed') || parseField(header, 'Completed');
  const parent = parseField(header, 'Parent') || parseField(header, 'Parent audit') || parseField(header, 'Parent plan');
  const model = parseField(header, 'Model');
  const thinking = parseField(header, 'Thinking');
  const permissionMode = parseField(header, 'PermissionMode');
  const browserTool = parseField(header, 'BrowserTool');
  const dependsOnRaw = parseField(header, 'Depends on');
  const dependsOn = parseDependsOn(dependsOnRaw);

  const mtime = stat.mtime.toISOString().slice(0, 10);
  return {
    file: path.basename(filePath),
    title,
    status,
    priority,
    created,
    executed,
    parent,
    dependsOn,
    model,
    thinking,
    permissionMode,
    browserTool,
    mtime,
  };
}

function listPlans(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePlanFile(path.join(dir, f)));
}

function fmtStatus(s) {
  if (!s) return '—';
  return s;
}

function fmtPriority(p) {
  if (!p) return '—';
  return p;
}

function fmtModel(m) {
  if (!m) return '—';
  if (m === 'claude-opus-4-7') return 'Opus';
  if (m === 'claude-sonnet-4-6') return 'Sonnet';
  return m;
}

function fmtThinking(t) {
  return t || '—';
}

function fmtPerm(p) {
  if (!p) return '—';
  if (p === 'bypassPermissions') return 'bypass';
  return p;
}

function fmtBrowserTool(b) {
  return b || '—';
}

function escapeCell(v) {
  return String(v ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function renderTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `|${headers.map(() => '---').join('|')}|`;
  const body = rows.map((r) => `| ${r.map(escapeCell).join(' | ')} |`).join('\n');
  return [head, sep, body].filter(Boolean).join('\n');
}

function sortPending(plans) {
  // Sort: priority rank (P0 < P1 < P2 < P3 < —) then created date desc
  const pRank = (p) => {
    const m = String(p).match(/P(\d)/i);
    return m ? Number(m[1]) : 99;
  };
  return [...plans].sort((a, b) => {
    const d = pRank(a.priority) - pRank(b.priority);
    if (d !== 0) return d;
    const ac = a.created || a.mtime;
    const bc = b.created || b.mtime;
    return bc.localeCompare(ac);
  });
}

function sortDone(plans) {
  // Sort by executed date desc (fallback to mtime)
  return [...plans].sort((a, b) => {
    const ae = a.executed || a.mtime;
    const be = b.executed || b.mtime;
    return be.localeCompare(ae);
  });
}

function groupSubplans(plans) {
  // Returns { roots: Plan[], children: Map<fileName, Plan[]> }
  const byFile = new Map(plans.map((p) => [p.file, p]));
  const children = new Map();
  const roots = [];
  for (const p of plans) {
    let parentKey = '';
    if (p.parent) {
      // parent might be a path or just a filename; match by basename
      const base = path.basename(p.parent.replace(/[`\\]/g, '').split(/\s+/)[0]);
      if (byFile.has(base)) parentKey = base;
    }
    if (parentKey) {
      if (!children.has(parentKey)) children.set(parentKey, []);
      children.get(parentKey).push(p);
    } else {
      roots.push(p);
    }
  }
  return { roots, children };
}

/**
 * Topologically sort plans by dependency depth (Kahn's algorithm variant).
 * Tier 0 = no pending blockers. Tier N = all blockers in tiers 0..N-1.
 * Within each tier, plans are ordered by priority then created-date desc.
 *
 * Returns { ordered: Plan[] (with pendingBlockers attached), cycle: Plan[] }.
 * `cycle` contains any plans that couldn't be placed (indicates an authoring
 * error — circular dependency). Renderer surfaces them in a separate section.
 */
function topoSortPlans(plans, lookup) {
  // Annotate each plan with its current pending blockers.
  const annotated = plans.map((p) => ({
    plan: p,
    blockers: resolveBlockers(p.dependsOn, lookup),
  }));

  // Set of files that have already been placed in some tier.
  const placed = new Set();
  const ordered = [];
  const remaining = new Set(annotated.map((a) => a.plan.file));

  // Repeatedly extract the next tier: plans whose blockers all point at
  // plans already in `placed` (or at done/ — those resolve to no blocker
  // already, so blockers list stays empty for them).
  while (remaining.size > 0) {
    const tierPlans = annotated
      .filter((a) => remaining.has(a.plan.file))
      .filter((a) => a.blockers.every((b) => placed.has(b.file)));

    if (tierPlans.length === 0) break; // cycle detected — bail

    // Sort within the tier by priority then created desc.
    const tierSorted = sortPending(tierPlans.map((a) => a.plan));
    for (const p of tierSorted) {
      const a = annotated.find((x) => x.plan.file === p.file);
      ordered.push(a);
      placed.add(p.file);
      remaining.delete(p.file);
    }
  }

  // Anything left = part of a cycle.
  const cycle = annotated.filter((a) => remaining.has(a.plan.file));
  return { ordered, cycle };
}

function buildPendingSection(pending, done) {
  const lookup = buildPlanLookup(pending, done);
  const { roots, children } = groupSubplans(pending);

  // Roots with pending children = parent containers (not directly executable)
  const parentRoots = roots.filter((r) => children.has(r.file));
  const executableRoots = roots.filter((r) => !children.has(r.file));

  // Candidate executable plans = childless roots + all subplans
  const allSubplans = [...children.values()].flat();
  const candidates = [...executableRoots, ...allSubplans];

  // Topologically sort: dependency depth, then priority+date within tier.
  const { ordered, cycle } = topoSortPlans(candidates, lookup);

  // Single execution-order table.
  const formatBlockers = (blockers) =>
    blockers.length === 0
      ? '— (ready)'
      : blockers.map((b) => `[${b.ref}](pending/${b.file})`).join(', ');

  const execRows = ordered.map((a, i) => {
    const p = a.plan;
    return [
      String(i + 1),
      `[${p.file}](pending/${p.file})`,
      p.title,
      fmtPriority(p.priority),
      formatBlockers(a.blockers),
      fmtStatus(p.status) || 'PENDING',
      fmtModel(p.model),
      fmtThinking(p.thinking),
      fmtPerm(p.permissionMode),
      fmtBrowserTool(p.browserTool),
      p.created || p.mtime,
    ];
  });
  const execTable = execRows.length > 0
    ? renderTable(
        ['Pos', 'File', 'Title', 'Priority', 'Blocked by', 'Status', 'Model', 'Effort', 'Perm', 'Tool', 'Created'],
        execRows,
      )
    : '_No executable plans pending._';

  // Cycle warning (renders empty in normal state)
  let cycleSection = '';
  if (cycle.length > 0) {
    const cycleRows = cycle.map((a) => [
      `[${a.plan.file}](pending/${a.plan.file})`,
      a.plan.title,
      a.blockers.map((b) => `[${b.ref}](pending/${b.file})`).join(', '),
    ]);
    cycleSection =
      `\n\n### ⚠️ Cycle Detected\n` +
      `These plans form a circular dependency (authoring error). Resolve by editing \`**Depends on**\` fields.\n\n` +
      renderTable(['File', 'Title', 'Blocked by'], cycleRows);
  }

  // Parent Plans section — unchanged semantics.
  const parentRows = parentRoots.map((p) => [
    `[${p.file}](pending/${p.file})`,
    p.title,
    fmtPriority(p.priority),
    fmtStatus(p.status) || 'PENDING',
    String(children.get(p.file).length),
    p.created || p.mtime,
  ]);
  const parentTable = parentRows.length > 0
    ? renderTable(['File', 'Title', 'Priority', 'Status', 'Pending Subplans', 'Created'], parentRows)
    : '_No parent plans with pending subplans._';

  return (
    `### Execution Order\n` +
    `Single dependency-sorted list. Top of the table = run first.\n` +
    `\`Blocked by\` shows pending dependencies (clickable). Empty = ready right now.\n` +
    `Within each dependency tier, plans are sorted by priority (P0 → P3) then newest first.\n\n` +
    `${execTable}` +
    cycleSection +
    `\n\n### Parent Plans (Waiting on Subplans)\n` +
    `These stay in \`pending/\` until their last subplan closes them (LR-027 parent-cascade). Do not execute directly.\n\n` +
    `${parentTable}`
  );
}

function buildDoneSection(done) {
  const sorted = sortDone(done);
  const rows = sorted.map((p) => [
    `[${p.file}](done/${p.file})`,
    p.title,
    fmtStatus(p.status) || 'DONE',
    p.executed || p.mtime,
  ]);
  return renderTable(['File', 'Title', 'Status', 'Completed'], rows);
}

function buildStaleWarnings(pending) {
  const stale = pending
    .filter((p) => {
      if ((p.status || '').startsWith('DONE')) return false;
      const anchor = p.created || p.mtime;
      const age = daysBetween(anchor);
      return age !== null && age > STALE_DAYS;
    })
    .map((p) => ({ ...p, age: daysBetween(p.created || p.mtime) }))
    .sort((a, b) => b.age - a.age);

  if (stale.length === 0) {
    return '_None — all pending plans are under 14 days old._';
  }
  const rows = stale.map((p) => [
    `[${p.file}](pending/${p.file})`,
    `${p.age}d`,
    p.created || p.mtime,
    fmtPriority(p.priority),
  ]);
  return renderTable(['File', 'Age', 'Created', 'Priority'], rows);
}

function buildDoneInPendingWarnings(pending) {
  const bad = pending.filter((p) => (p.status || '').startsWith('DONE'));
  if (bad.length === 0) {
    return '_None — pending/ is clean._';
  }
  const rows = bad.map((p) => [
    `[${p.file}](pending/${p.file})`,
    p.executed || '—',
    p.title,
  ]);
  return renderTable(['File', 'Executed', 'Title'], rows);
}

function buildSessionLog(pending, done) {
  // Derive recent activity from file mtimes — last 30 days
  const all = [...pending.map((p) => ({ ...p, where: 'pending' })), ...done.map((p) => ({ ...p, where: 'done' }))];
  const recent = all
    .filter((p) => {
      const age = daysBetween(p.mtime);
      return age !== null && age <= 30;
    })
    .sort((a, b) => b.mtime.localeCompare(a.mtime))
    .slice(0, 40);

  if (recent.length === 0) return '_No plan files modified in the last 30 days._';
  const rows = recent.map((p) => [
    p.mtime,
    p.where,
    `[${p.file}](${p.where}/${p.file})`,
    fmtStatus(p.status) || '—',
  ]);
  return renderTable(['Date', 'Folder', 'File', 'Status'], rows);
}

function render(pending, done) {
  const pendingCount = pending.length;
  const doneCount = done.length;
  const staleCount = pending.filter((p) => {
    if ((p.status || '').startsWith('DONE')) return false;
    const age = daysBetween(p.created || p.mtime);
    return age !== null && age > STALE_DAYS;
  }).length;
  const doneInPendingCount = pending.filter((p) => (p.status || '').startsWith('DONE')).length;

  return `# Plans Index

**Last updated**: ${TODAY}
**Auto-generated** by \`npm run plans:reindex\` — do not hand-edit. Edits will be overwritten.

**Refresh model**: this file is **fully regenerated** every time the script runs — there is no "move" or "add" between sections. When a plan moves \`pending/\` → \`done/\`, the next reindex re-evaluates every plan's dependencies and re-sorts the table from scratch. Triggers: manual \`npm run plans:reindex\`, pre-commit hook (\`.githooks/pre-commit\` runs \`:check\` and fails the commit if INDEX is stale), and \`/execute\` Phase 3.5 step 3 (LR-035).

**Totals**: ${pendingCount} pending · ${doneCount} done · ${staleCount} stale (>${STALE_DAYS}d) · ${doneInPendingCount} DONE-in-pending

---

## Warnings

### Pending Stale (>${STALE_DAYS} days)

${buildStaleWarnings(pending)}

### DONE-in-pending (should be moved to done/)

${buildDoneInPendingWarnings(pending)}

---

## Execution Queue (pending/)

${buildPendingSection(pending, done)}

---

## Done (done/)

Completed plans, sorted by Executed date desc. Historical reference — do not modify.

${buildDoneSection(done)}

---

## Folder Structure

\`\`\`
plans/
  INDEX.md              ← this file (auto-generated)
  pending/              ← active plans (${pendingCount} files)
  done/                 ← completed plans (${doneCount} files)
\`\`\`

When completing a plan:
1. Update \`**Status**: DONE\` and add \`**Executed**: YYYY-MM-DD\` in the plan file
2. \`git mv plans/pending/X.md plans/done/X.md\`
3. Run \`npm run plans:reindex\` to refresh this file

---

## Session Log (last 30 days, file mtime)

${buildSessionLog(pending, done)}
`;
}

function main() {
  const pending = listPlans(PENDING_DIR);
  const done = listPlans(DONE_DIR);
  const output = render(pending, done);

  if (CHECK_MODE) {
    const current = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf8') : '';
    if (current.trim() !== output.trim()) {
      console.error('[plans:reindex --check] INDEX.md is STALE. Run: npm run plans:reindex');
      process.exit(1);
    }
    if (!QUIET) console.log('[plans:reindex --check] INDEX.md is up to date.');
    return;
  }

  fs.writeFileSync(INDEX_PATH, output, 'utf8');
  if (!QUIET) {
    const staleCount = pending.filter((p) => {
      if ((p.status || '').startsWith('DONE')) return false;
      const age = daysBetween(p.created || p.mtime);
      return age !== null && age > STALE_DAYS;
    }).length;
    const doneInPendingCount = pending.filter((p) => (p.status || '').startsWith('DONE')).length;
    console.log(
      `[plans:reindex] wrote INDEX.md — ${pending.length} pending, ${done.length} done, ` +
      `${staleCount} stale, ${doneInPendingCount} DONE-in-pending`,
    );
  }
}

main();
