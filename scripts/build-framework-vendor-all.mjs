#!/usr/bin/env node
/**
 * scripts/build-framework-vendor-all.mjs
 *
 * Loops over every clients/<id>/ and runs the vendor-build for each.
 * Used by `npm run vendor:build:all`.
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIENTS_DIR = path.join(REPO_ROOT, 'clients');

if (!fs.existsSync(CLIENTS_DIR)) {
  console.error('[vendor-build:all] ERROR: clients/ does not exist at repo root.');
  process.exit(1);
}

const clients = fs
  .readdirSync(CLIENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'))
  .map((d) => d.name);

if (clients.length === 0) {
  console.warn('[vendor-build:all] WARNING: no clients/* directories found.');
  process.exit(0);
}

console.log(`[vendor-build:all] clients: ${clients.join(', ')}`);

let failures = 0;
for (const client of clients) {
  console.log(`\n[vendor-build:all] ===== ${client} =====`);
  try {
    execSync(`npx ts-node scripts/build-framework-vendor.ts --client=${client}`, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
  } catch {
    failures += 1;
    console.error(`[vendor-build:all] FAILED: ${client}`);
  }
}

if (failures > 0) {
  console.error(`\n[vendor-build:all] ${failures} client(s) failed.`);
  process.exit(1);
}

console.log(`\n[vendor-build:all] OK — vendored ${clients.length} client(s).`);
