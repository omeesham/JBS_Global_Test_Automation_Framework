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
 * Parses from the first ~30 lines of each plan file:
 *   - Title:    first `# <text>` line
 *   - Status:   `**Status**: X`  OR  `Status: X`
 *   - Priority: `**Priority**: X`
 *   - Created:  `**Created**: YYYY-MM-DD`
 *   - Executed: `**Executed**: YYYY-MM-DD`
 *   - Parent:   `**Parent**: X` (marks this file as a subplan)
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

  const mtime = stat.mtime.toISOString().slice(0, 10);
  return {
    file: path.basename(filePath),
    title,
    status,
    priority,
    created,
    executed,
    parent,
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

function buildPendingSection(pending) {
  const sorted = sortPending(pending);
  const { roots, children } = groupSubplans(sorted);

  const rows = [];
  for (const p of roots) {
    rows.push([
      `[${p.file}](pending/${p.file})`,
      p.title,
      fmtPriority(p.priority),
      fmtStatus(p.status) || 'PENDING',
      p.created || p.mtime,
    ]);
    const kids = children.get(p.file) || [];
    for (const c of kids) {
      rows.push([
        `↳ [${c.file}](pending/${c.file})`,
        c.title,
        fmtPriority(c.priority),
        fmtStatus(c.status) || 'PENDING',
        c.created || c.mtime,
      ]);
    }
  }

  return renderTable(['File', 'Title', 'Priority', 'Status', 'Created'], rows);
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

**Totals**: ${pendingCount} pending · ${doneCount} done · ${staleCount} stale (>${STALE_DAYS}d) · ${doneInPendingCount} DONE-in-pending

---

## Warnings

### Pending Stale (>${STALE_DAYS} days)

${buildStaleWarnings(pending)}

### DONE-in-pending (should be moved to done/)

${buildDoneInPendingWarnings(pending)}

---

## Execution Queue (pending/)

Sorted by priority (P0 → P3), then newest first. Subplans (with \`Parent:\` field pointing to another pending plan) are nested under their parent.

${buildPendingSection(pending)}

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
