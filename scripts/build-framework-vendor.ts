#!/usr/bin/env ts-node
/**
 * DEPRECATED 2026-05-19 — vendoring removed in PLAN_DIST_REGRESSION_AND_N_FIXES.
 * Clients now ship clients/<id>/src/ directly via git archive — no compiled output.
 * Output dir clients/<id>/dist/ is gitignored (.gitignore: clients/*/dist/).
 * Cleanup tracked by PLAN_ROOT_CLIENT_DEDUPE.md. Do not invoke; do not extend.
 *
 * scripts/build-framework-vendor.ts
 *
 * Vendor-build the framework (src/) into clients/<id>/dist/framework/.
 *
 * Path A contract (PLAN_CLIENT_DELIVERABLE_REBUILD):
 *   - Compiles src/ via tsconfig.build.json into clients/<id>/dist/framework/
 *   - Excludes pipeline-only paths (orchestrator/server/worker/agent-notification-writer
 *     all live under pipeline/ post-Workstream-B; never get vendored).
 *   - Idempotent: identical src/ → byte-identical output.
 *   - Emits clients/<id>/dist/framework/.vendor-meta.json with {srcCommit, srcMtimes, builtAt}
 *     so the pre-commit hook can detect drift.
 *   - Refuses to run if pipeline/ doesn't exist (catch-out-of-order: Workstream B must
 *     have completed before vendoring is meaningful).
 *
 * Usage:
 *   ts-node scripts/build-framework-vendor.ts --client=encore
 *   npm run vendor:build -- --client=encore
 *   npm run vendor:build:all       # loops over every clients/* via build-framework-vendor-all.mjs
 */

import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');

interface VendorMeta {
  srcCommit: string;
  srcMtimes: Record<string, number>;
  builtAt: string;
  builtBy: string;
  excludedPaths: string[];
}

function parseArgs(): { client: string } {
  const arg = process.argv.slice(2).find((a) => a.startsWith('--client='));
  if (!arg) {
    console.error('[vendor-build] ERROR: --client=<id> required');
    process.exit(1);
  }
  return { client: arg.slice('--client='.length) };
}

function assertPipelineExists(): void {
  const pipelineDir = path.join(REPO_ROOT, 'pipeline');
  if (!fs.existsSync(pipelineDir)) {
    console.error(
      '[vendor-build] ERROR: pipeline/ does not exist at repo root.\n' +
        '  Vendor-build refuses to run until pipeline-runtime relocation has completed\n' +
        '  (orchestrator, server, worker, agent-notification-writer must live under pipeline/).\n' +
        '  See plans/pending/PLAN_CLIENT_DELIVERABLE_REBUILD.md (Workstream B).'
    );
    process.exit(1);
  }
}

function assertClientExists(client: string): string {
  const clientDir = path.join(REPO_ROOT, 'clients', client);
  if (!fs.existsSync(clientDir) || !fs.statSync(clientDir).isDirectory()) {
    console.error(`[vendor-build] ERROR: clients/${client}/ does not exist.`);
    process.exit(1);
  }
  return clientDir;
}

function rmrf(target: string): void {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

function getSrcCommit(): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf-8' }).trim();
  } catch {
    return 'UNKNOWN';
  }
}

function walkSrc(srcRoot: string, base = ''): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(path.join(srcRoot, base), { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...walkSrc(srcRoot, rel));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(rel);
    }
  }
  return out;
}

function collectSrcMtimes(srcRoot: string): Record<string, number> {
  const mtimes: Record<string, number> = {};
  for (const rel of walkSrc(srcRoot)) {
    const full = path.join(srcRoot, rel);
    mtimes[rel] = Math.floor(fs.statSync(full).mtimeMs);
  }
  return mtimes;
}

function buildTsc(tsconfigPath: string, outDir: string): void {
  // Use the project's tsc via npx (works on Windows + Linux + Mac).
  const cmd = `npx tsc -p "${tsconfigPath}" --outDir "${outDir}"`;
  try {
    execSync(cmd, { cwd: REPO_ROOT, stdio: 'inherit' });
  } catch (err) {
    console.error('[vendor-build] tsc failed.');
    process.exit(1);
  }
}

function writeVendorMeta(metaPath: string, meta: VendorMeta): void {
  // Stable serialization for byte-identical output across runs (ordered keys, no whitespace drift).
  const stable = {
    srcCommit: meta.srcCommit,
    srcMtimes: Object.fromEntries(
      Object.entries(meta.srcMtimes).sort(([a], [b]) => a.localeCompare(b))
    ),
    builtAt: meta.builtAt,
    builtBy: meta.builtBy,
    excludedPaths: [...meta.excludedPaths].sort(),
  };
  fs.writeFileSync(metaPath, JSON.stringify(stable, null, 2) + '\n', 'utf-8');
}

function main(): void {
  const { client } = parseArgs();
  assertPipelineExists();
  const clientDir = assertClientExists(client);

  const srcRoot = path.join(REPO_ROOT, 'src');
  if (!fs.existsSync(srcRoot)) {
    console.error('[vendor-build] ERROR: src/ does not exist at repo root.');
    process.exit(1);
  }

  const vendorOut = path.join(clientDir, 'dist', 'framework');
  const tsconfigBuild = path.join(REPO_ROOT, 'tsconfig.build.json');
  if (!fs.existsSync(tsconfigBuild)) {
    console.error('[vendor-build] ERROR: tsconfig.build.json not found at repo root.');
    process.exit(1);
  }

  console.log(`[vendor-build] client=${client}`);
  console.log(`[vendor-build] srcRoot=${srcRoot}`);
  console.log(`[vendor-build] vendorOut=${vendorOut}`);

  // Clean previous output for idempotency.
  rmrf(vendorOut);
  fs.mkdirSync(vendorOut, { recursive: true });

  // Build src/ → vendorOut. tsconfig.build.json's exclude already drops adapter __tests__;
  // pipeline/ is not under src/ post-Workstream-B so nothing in pipeline/ ends up here.
  buildTsc(tsconfigBuild, vendorOut);

  // Drop tsbuildinfo files (idempotency: their timestamps drift run-to-run).
  for (const f of fs.readdirSync(vendorOut)) {
    if (f.endsWith('.tsbuildinfo')) fs.unlinkSync(path.join(vendorOut, f));
  }

  // Emit vendor-meta.
  const srcMtimes = collectSrcMtimes(srcRoot);
  const meta: VendorMeta = {
    srcCommit: getSrcCommit(),
    srcMtimes,
    builtAt: new Date().toISOString(),
    builtBy: process.env.USER || process.env.USERNAME || 'unknown',
    excludedPaths: ['src/data/adapters/__tests__/**'],
  };
  const metaPath = path.join(vendorOut, '.vendor-meta.json');
  writeVendorMeta(metaPath, meta);

  // Stable hash summary (helps diagnose drift).
  const hash = crypto.createHash('sha256').update(JSON.stringify(meta.srcMtimes)).digest('hex');
  console.log(`[vendor-build] OK  src-mtime-hash=${hash.slice(0, 12)}  files=${Object.keys(srcMtimes).length}`);
  console.log(`[vendor-build] meta written: ${path.relative(REPO_ROOT, metaPath)}`);
}

main();
