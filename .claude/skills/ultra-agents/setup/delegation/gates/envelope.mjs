#!/usr/bin/env node
// envelope.mjs — Pre-dispatch snapshotter.
// CLI: node envelope.mjs --ticket <file> --out <manifest.json>
// Outputs sha256+mtime of every repo path named in the ticket, plus dispatch timestamp.

import { readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
let ticketPath = '', outPath = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ticket' && args[i + 1]) { ticketPath = args[++i]; continue; }
  if (args[i] === '--out' && args[i + 1]) { outPath = args[++i]; continue; }
}
if (!ticketPath || !outPath) {
  console.error('Usage: node envelope.mjs --ticket <file> --out <manifest.json>');
  process.exit(2);
}

const ticketText = readFileSync(resolve(ticketPath), 'utf8');

// Extract file paths from ticket text.
// Matches backtick-quoted paths and bare paths with extensions.
const pathPatterns = [
  /`([^`\s]+\.\w{1,6})`/g,                     // `path/to/file.ext`
  /(?:^|\s)((?:[\w./-]+\/)?[\w.-]+\.\w{1,6})/gm, // bare path/to/file.ext
];

const seenPaths = new Set();
const files = [];

for (const pattern of pathPatterns) {
  let m;
  while ((m = pattern.exec(ticketText)) !== null) {
    const rawPath = m[1].replace(/\//g, '\\');
    if (seenPaths.has(rawPath)) continue;
    seenPaths.add(rawPath);

    const absPath = resolve(rawPath);
    if (!existsSync(absPath)) continue;

    try {
      const stat = statSync(absPath);
      if (!stat.isFile()) continue;
      const hash = createHash('sha256').update(readFileSync(absPath)).digest('hex');
      files.push({
        path: rawPath,
        abs_path: absPath,
        sha256: hash,
        mtime: stat.mtime.toISOString(),
        size: stat.size,
      });
    } catch { /* skip unreadable files */ }
  }
}

const envelope = {
  dispatch_timestamp: new Date().toISOString(),
  ticket: resolve(ticketPath),
  files,
};

writeFileSync(resolve(outPath), JSON.stringify(envelope, null, 2) + '\n');
console.log(`Envelope written: ${files.length} files snapshotted → ${outPath}`);
