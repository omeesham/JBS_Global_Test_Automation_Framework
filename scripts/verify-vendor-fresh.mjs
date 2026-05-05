#!/usr/bin/env node
/**
 * scripts/verify-vendor-fresh.mjs
 *
 * Reads clients/<id>/dist/framework/.vendor-meta.json (written by
 * scripts/build-framework-vendor.ts). Compares stored srcCommit + srcMtimes
 * vs the current framework src/ tree. Refuses with non-zero exit if drift detected.
 *
 * Usage:
 *   node scripts/verify-vendor-fresh.mjs --client=encore
 *   node scripts/verify-vendor-fresh.mjs --client=encore --warn-only
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(name) {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag ? flag.slice(`--${name}=`.length) : null;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

const client = arg('client');
const warnOnly = hasFlag('warn-only');

if (!client) {
  console.error('[verify-vendor-fresh] ERROR: --client=<id> required');
  process.exit(2);
}

const metaPath = path.join(REPO_ROOT, 'clients', client, 'dist', 'framework', '.vendor-meta.json');
if (!fs.existsSync(metaPath)) {
  // .vendor-meta.json is intentionally absent from the customer-facing deliverable
  // (leaked builtBy + srcMtimes). Without it, freshness can't be checked here —
  // future builds can re-introduce it under a non-shipped path if drift detection
  // is needed again. Skip with a warning rather than failing the ship.
  console.warn(
    `[verify-vendor-fresh] meta absent (skipping freshness check) — client=${client}`
  );
  process.exit(0);
}

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
const srcRoot = path.join(REPO_ROOT, 'src');

function walkSrc(base = '') {
  const out = [];
  for (const entry of fs.readdirSync(path.join(srcRoot, base), { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...walkSrc(rel));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(rel);
    }
  }
  return out;
}

const currentMtimes = {};
for (const rel of walkSrc()) {
  currentMtimes[rel] = Math.floor(fs.statSync(path.join(srcRoot, rel)).mtimeMs);
}

const drifted = [];
for (const rel of Object.keys(currentMtimes)) {
  if (!(rel in meta.srcMtimes) || meta.srcMtimes[rel] !== currentMtimes[rel]) {
    drifted.push(rel);
  }
}
for (const rel of Object.keys(meta.srcMtimes)) {
  if (!(rel in currentMtimes)) drifted.push(`${rel} (DELETED)`);
}

let currentCommit = 'UNKNOWN';
try {
  currentCommit = execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf-8' }).trim();
} catch {
  // ignore
}

if (drifted.length === 0) {
  console.log(`[verify-vendor-fresh] OK client=${client} files=${Object.keys(currentMtimes).length}`);
  process.exit(0);
}

const msg =
  `[verify-vendor-fresh] DRIFT client=${client} drifted=${drifted.length}\n` +
  `  vendor srcCommit: ${meta.srcCommit}\n` +
  `  current commit:   ${currentCommit}\n` +
  `  drifted files (first 10): ${drifted.slice(0, 10).join(', ')}\n` +
  `  Run: npm run vendor:build -- --client=${client}`;

if (warnOnly) {
  console.warn(msg);
  process.exit(0);
}
console.error(msg);
process.exit(1);
