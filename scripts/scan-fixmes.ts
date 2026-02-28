#!/usr/bin/env ts-node
/**
 * FIXME Scanner -- scans spec files for // FIXME and // NOT-AUTOMATABLE comments.
 * Extracts TC ID, category, reason. Writes reports/fixme-registry.json.
 *
 * Usage: npm run fixme:scan
 */

import * as fs from 'fs';
import * as path from 'path';

interface FixmeEntry {
  tcId: string;
  category: string;
  reason: string;
  file: string;
  line: number;
  // Lifecycle fields (Fix 10)
  createdAt: string;          // ISO timestamp when first scanned
  status: 'open' | 'resolved' | 'wont-fix';
  resolvedAt?: string;        // ISO timestamp when resolved
  resolvedBy?: string;        // Agent that resolved it
  relatedMistakeId?: string;  // Link to agent-mistakes.md rule that caused/fixed it
  queueItemId?: string;       // Queue item this belongs to
}

const SPECS_DIR = path.join(__dirname, '../tests/specs');
const OUTPUT_FILE = path.join(__dirname, '../reports/fixme-registry.json');

/** TC ID pattern: full format TC-XXX-YY-NNN (used as fallback for surrounding-line lookup) */
const TC_ID_FULL = /TC-[A-Z]+-[A-Z]+-\d+/;

/** Match TC references: full format (TC-LOC-LI-001) or short (TC-037, TC-007A, TC-037/035) */
const TC_WITH_REASON = /TC-(?:[A-Z]+-[A-Z]+-\d+|\d+[A-Z]?(?:\/\d+[A-Z]?)*)\s*(?:\(([^)]+)\))?/g;

/** Matches // FIXME or // NOT-AUTOMATABLE comments with optional TC ID and reason. */
const FIXME_PATTERN = /\/\/\s*(FIXME|NOT-AUTOMATABLE)\s*[:\-]?\s*(.*)/i;

/** Expand a TC reference into individual TC IDs. E.g. "TC-037/035" -> ["TC-037", "TC-035"] */
function expandTcRef(ref: string): string[] {
  if (/^TC-[A-Z]+-[A-Z]+-\d+$/.test(ref)) return [ref];
  const body = ref.replace(/^TC-/, '');
  return body.split('/').map(p => `TC-${p}`);
}

function findSpecFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSpecFiles(fullPath));
    } else if (entry.name.endsWith('.spec.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Detect module prefix from spec file path (e.g. tests/specs/locations/ -> LOC) */
const MODULE_PREFIX_MAP: Record<string, string> = {
  locations: 'LOC', setup: 'SET', users: 'USR', clients: 'CLT',
  dashboard: 'DSH', reports: 'RPT', billing: 'BIL', admin: 'ADM',
};

function detectModulePrefix(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const specsIdx = parts.indexOf('specs');
  if (specsIdx >= 0 && parts[specsIdx + 1]) {
    const moduleName = parts[specsIdx + 1]!.toLowerCase();
    return MODULE_PREFIX_MAP[moduleName] || moduleName.toUpperCase().substring(0, 3);
  }
  return '';
}

/** Detect queue item ID from spec file (reads // spec: header) */
function detectQueueItemId(content: string): string | undefined {
  const match = content.match(/\/\/ spec:\s*([\w-]+)/i);
  return match?.[1];
}

function scanFile(filePath: string): FixmeEntry[] {
  const entries: FixmeEntry[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
  const modulePrefix = detectModulePrefix(relPath);
  const queueItemId = detectQueueItemId(content);
  const now = new Date().toISOString();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const fixmeMatch = line.match(FIXME_PATTERN);
    if (!fixmeMatch) continue;

    const matchTag = fixmeMatch[1] ?? '';
    const matchRest = (fixmeMatch[2] ?? '').trim();
    const isNotAutomatable = matchTag.toUpperCase() === 'NOT-AUTOMATABLE';

    // Parse explicit category prefix: "Cat-A (...): ..." or "Cat-B: ..."
    let baseCategory = isNotAutomatable ? 'NOT-AUTOMATABLE' : 'Cat-A';
    let bodyText = matchRest;
    const catPrefixMatch = matchRest.match(/^(Cat-[A-Z])\b[^:]*:\s*/i);
    if (catPrefixMatch) {
      baseCategory = catPrefixMatch[1]!;
      bodyText = matchRest.slice(catPrefixMatch[0].length);
    }

    // Apply keyword refinement only when no explicit category was provided
    if (!catPrefixMatch && !isNotAutomatable) {
      const lowerBody = bodyText.toLowerCase();
      if (lowerBody.includes('permission') || lowerBody.includes('role') || lowerBody.includes('env')) {
        baseCategory = 'Cat-B';
      }
    }

    // Extract all TC references with their parenthetical reasons
    let tcFound = false;
    TC_WITH_REASON.lastIndex = 0;
    let refMatch;
    while ((refMatch = TC_WITH_REASON.exec(bodyText)) !== null) {
      const fullRef = refMatch[0].replace(/\s*\(.*/, '').trim();
      const reason = refMatch[1] || bodyText || baseCategory;
      const ids = expandTcRef(fullRef);
      for (const id of ids) {
        // Add module prefix to short TC IDs (TC-037 -> TC-LOC-037)
        const fullId = id.match(/^TC-\d+/) && modulePrefix ? id.replace('TC-', `TC-${modulePrefix}-`) : id;
        entries.push({ tcId: fullId, category: baseCategory, reason, file: relPath, line: i + 1, createdAt: now, status: 'open', queueItemId });
        tcFound = true;
      }
    }

    // Fallback: no TC IDs found in comment -- try surrounding lines, then UNKNOWN
    if (!tcFound) {
      const tcMatch = line.match(TC_ID_FULL) ??
        (i > 0 ? lines[i - 1]?.match(TC_ID_FULL) ?? null : null) ??
        (i < lines.length - 1 ? lines[i + 1]?.match(TC_ID_FULL) ?? null : null);
      entries.push({
        tcId: tcMatch?.[0] ?? 'UNKNOWN',
        category: baseCategory,
        reason: bodyText || baseCategory,
        file: relPath,
        line: i + 1,
        createdAt: now,
        status: 'open',
        queueItemId,
      });
    }
  }

  // Also scan for test.fixme() calls
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i]!;
    if (currentLine.includes('test.fixme(')) {
      const tcMatch = currentLine.match(TC_ID_FULL) ??
        (i > 0 ? lines[i - 1]?.match(TC_ID_FULL) ?? null : null);
      entries.push({
        tcId: tcMatch?.[0] ?? 'UNKNOWN',
        category: 'FIXME-CALL',
        reason: 'test.fixme() call in spec',
        file: relPath,
        line: i + 1,
        createdAt: now,
        status: 'open',
        queueItemId,
      });
    }
  }

  return entries;
}

function main(): void {
  const specFiles = findSpecFiles(SPECS_DIR);
  const allEntries: FixmeEntry[] = [];

  for (const file of specFiles) {
    allEntries.push(...scanFile(file));
  }

  // Ensure reports directory exists
  const reportsDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Merge with existing registry to preserve lifecycle data (resolved entries, timestamps)
  let existingEntries: FixmeEntry[] = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingEntries = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    } catch { /* ignore */ }
  }

  // Build lookup of existing entries by tcId+file for lifecycle preservation
  const existingMap = new Map<string, FixmeEntry>();
  for (const e of existingEntries) {
    existingMap.set(`${e.tcId}::${e.file}`, e);
  }

  // Merge: preserve createdAt, resolvedAt, resolvedBy, relatedMistakeId from existing
  const mergedEntries = allEntries.map(entry => {
    const key = `${entry.tcId}::${entry.file}`;
    const existing = existingMap.get(key);
    if (existing) {
      return {
        ...entry,
        createdAt: existing.createdAt || entry.createdAt,
        resolvedAt: existing.resolvedAt,
        resolvedBy: existing.resolvedBy,
        relatedMistakeId: existing.relatedMistakeId,
        queueItemId: entry.queueItemId || existing.queueItemId,
        status: entry.status, // Re-scanned = still open
      };
    }
    return entry;
  });

  // Mark previously tracked entries that are no longer in scan as resolved
  const currentKeys = new Set(mergedEntries.map(e => `${e.tcId}::${e.file}`));
  for (const existing of existingEntries) {
    const key = `${existing.tcId}::${existing.file}`;
    if (!currentKeys.has(key) && existing.status === 'open') {
      mergedEntries.push({
        ...existing,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
      });
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedEntries, null, 2) + '\n', 'utf-8');
  const openCount = mergedEntries.filter(e => e.status === 'open').length;
  const resolvedCount = mergedEntries.filter(e => e.status === 'resolved').length;
  console.log(`FIXME scan complete: ${mergedEntries.length} total (${openCount} open, ${resolvedCount} resolved) -> reports/fixme-registry.json`);
}

main();
