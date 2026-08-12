#!/usr/bin/env node
/**
 * scripts/verify-approved-scope.mjs
 *
 * Allowlist gate — every file in a client payload must resolve to an approved module.
 * An unresolved file, or a file whose module is withheld/internal-only/unknown, always
 * fails. The gate is fail-closed: unknown is denied, never allowed.
 *
 * Five checks run on every payload file:
 *   1. Resolution        — file must appear in manifest (modules specs/workbooks/src,
 *                          shared[], or aggregate_workbooks[]).
 *   2. Module status     — resolved module's specs and workbooks must be delivered or
 *                          approved-next. Withheld module src/ files are allowed per
 *                          owner ruling.
 *   3. Import boundary   — (informational) logs imports crossing into a withheld module's
 *                          directory. Not a violation per owner ruling.
 *   4. TC id membership  — every TC-* token in a test()/describe() title must be listed
 *                          in the module's tc_ids[].
 *   5. TC id presence    — every test() title must carry at least one TC-* token.
 *      Const-array interpolation (`${item.tc}: …` over a const array with tc fields)
 *      is resolved and the extracted TC ids are validated.
 *   6. Body scan         — spec body is scanned for route fragments and testid tokens
 *                          belonging to withheld modules; a hit fails the check even when
 *                          the file path, imports, and TC ids all pass.
 *
 * Usage:
 *   node scripts/verify-approved-scope.mjs --target=<dir> --client=<id> [--manifest=<path>]
 *   node scripts/verify-approved-scope.mjs --help
 *
 * Exit codes:  0 = all checks pass  |  1 = violations found  |  2 = usage / setup error
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SHIPPABLE   = new Set(['delivered', 'approved-next']);
const BLOCKED     = new Set(['withheld', 'internal-only', 'unknown']);
const SPEC_EXTS   = new Set(['.spec.ts', '.spec.js', '.spec.tsx', '.spec.jsx']);
const SOURCE_EXTS = new Set(['.ts', '.js', '.tsx', '.jsx', '.mts', '.mjs', '.cjs']);

// ── helpers ──────────────────────────────────────────────────────────────────

function usage() {
  console.log([
    'Usage:',
    '  node scripts/verify-approved-scope.mjs --target=<dir> --client=<id> [--manifest=<path>]',
    '',
    'Options:',
    '  --target=<dir>     Extracted payload directory to check.',
    '  --client=<id>      Client id (e.g. "encore"). Locates selector files for the body scan.',
    '  --manifest=<path>  Delivery manifest JSON. Defaults to',
    '                     scripts/deliverable/delivery-manifest.<client>.json',
    '  --help             Print this message.',
    '',
    'Exit codes:  0 = all checks pass  |  1 = violations  |  2 = usage / setup error',
  ].join('\n'));
}

function arg(name) {
  const f = process.argv.find((a) => a.startsWith(`--${name}=`));
  return f ? f.slice(`--${name}=`.length) : null;
}
const hasFlag = (n) => process.argv.includes(`--${n}`);

function walkDir(root) {
  const out = [];
  const walk = (rel) => {
    const abs = rel ? path.join(root, rel) : root;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const next = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(next);
      else if (e.isFile()) out.push(next);
    }
  };
  walk('');
  return out;
}

function norm(p) { return String(p).replace(/\\/g, '/').replace(/^\/+/, ''); }

function parseImports(src) {
  const out = [];
  const re = /(?:import\s+(?:[^'"]*?\bfrom\s+)?|import\s*\(\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src)) !== null) out.push(m[1]);
  return out;
}

function resolveRelImport(specifier, fromFile) {
  if (!specifier.startsWith('.')) return null;
  const dir = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/')) : '';
  const joined = dir ? `${dir}/${specifier}` : specifier;
  // manual posix normalize (no node:path.posix available in all contexts)
  const parts = joined.split('/');
  const resolved = [];
  for (const p of parts) {
    if (p === '..') resolved.pop();
    else if (p !== '.') resolved.push(p);
  }
  return resolved.join('/');
}

function candidatePaths(resolved) {
  return [
    resolved,
    `${resolved}.ts`,
    `${resolved}.js`,
    `${resolved}.tsx`,
    `${resolved}/index.ts`,
    `${resolved}/index.js`,
  ];
}

function resolveNonRelativeImport(specifier, clientRoot, baseUrl, tsPaths) {
  // 1. Try tsconfig paths aliases
  if (tsPaths) {
    for (const [pattern, targets] of Object.entries(tsPaths)) {
      const prefix = pattern.replace(/\*$/, '');
      if (!specifier.startsWith(prefix)) continue;
      const suffix = specifier.slice(prefix.length);
      for (const target of targets) {
        const resolved = norm(target.replace('*', suffix));
        for (const ext of ['', '.ts', '.js', '.tsx', '/index.ts', '/index.js']) {
          if (fs.existsSync(path.join(clientRoot, resolved + ext))) return resolved;
        }
      }
    }
  }
  // 2. Try baseUrl resolution
  if (baseUrl) {
    const basePath = norm(path.join(baseUrl, specifier));
    for (const ext of ['', '.ts', '.js', '.tsx', '/index.ts', '/index.js']) {
      if (fs.existsSync(path.join(clientRoot, basePath + ext))) return basePath;
    }
  }
  return null;
}

function isSpec(relNorm) {
  return SPEC_EXTS.has(path.extname(relNorm) === '.ts' && relNorm.endsWith('.spec.ts')
    ? '.spec.ts'
    : relNorm.endsWith('.spec.js') ? '.spec.js' : '');
}

// ── TC id extraction ──────────────────────────────────────────────────────────

/**
 * Find `const ARRAY_NAME = [{ propName: 'value', … }, …]` in src and return the
 * string values of propName across all elements.  Returns null if not found.
 */
function extractIdsFromArray(src, arrName, propName) {
  const arrRe = new RegExp(
    `(?:const|let|var)\\s+${arrName}\\s*(?::[^=]+=|=)\\s*\\[([\\s\\S]*?)\\]\\s*(?:as\\s+const)?\\s*;`,
    'g'
  );
  const arrM = arrRe.exec(src);
  if (!arrM) return null;
  const propRe = new RegExp(`\\b${propName}\\s*:\\s*['"]([^'"]+)['"]`, 'g');
  const ids = [];
  let pm;
  while ((pm = propRe.exec(arrM[1])) !== null) ids.push(pm[1]);
  return ids.length > 0 ? ids : null;
}

/**
 * Given `for (const varName of ARRAY)` in src, find ARRAY either inline in src or
 * via an import statement in src, then return the values of propName from each element.
 * Returns null when the array cannot be located.
 */
function findLoopArrayIds(src, srcFile, varName, propName, targetRoot, clientId) {
  const loopRe = new RegExp(`for\\s*\\(\\s*(?:const|let)\\s+${varName}\\s+of\\s+(\\w+)`, 'g');
  const loopM  = loopRe.exec(src);
  if (!loopM) return null;
  const arrName = loopM[1];

  // Try inline definition first
  const inline = extractIdsFromArray(src, arrName, propName);
  if (inline) return inline;

  // Follow import statements that export arrName
  const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let im;
  while ((im = importRe.exec(src)) !== null) {
    const names = im[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0].trim());
    if (!names.includes(arrName)) continue;
    const resolved = resolveRelImport(im[2], srcFile);
    if (!resolved) continue;
    for (const cand of candidatePaths(resolved)) {
      // Check payload, then repo client source
      const bases = [targetRoot, path.join(REPO_ROOT, 'clients', clientId)];
      for (const base of bases) {
        const abs = path.join(base, cand);
        if (!fs.existsSync(abs)) continue;
        let modSrc;
        try { modSrc = fs.readFileSync(abs, 'utf-8'); } catch { continue; }
        const ids = extractIdsFromArray(modSrc, arrName, propName);
        if (ids) return ids;
      }
    }
  }
  return null;
}

/**
 * Extract TC-* tokens and detect titles missing a TC id.
 * Also handles split template literals: `TC-XXX-${var.prop}: …` by resolving the
 * source array (inline or via import).  Unresolvable split patterns are returned
 * separately as warnings — they are never emitted as bare prefixes.
 *
 * Returns: { tcTokens: Set<string>, missingTc: string[], unresolvablePatterns: {template, line}[] }
 */
function extractTcInfo(src, srcFile, targetRoot, clientId) {
  const tcTokens = new Set();
  const missingTc = []; // test() titles without a TC-* token
  const unresolvablePatterns = []; // split-template patterns that could not be resolved

  // Match test()/it()/describe() — capture title as string or template literal
  const re = /\b(test|it|describe)\s*\(\s*(?:`((?:[^`\\]|\\.)*)`|'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const kind = m[1]; // test | it | describe
    const raw = (m[2] ?? m[3] ?? m[4] ?? '').trim();

    // CASE 1 — whole id in variable: `${item.tc}: …`
    const wholeIdMatch = raw.match(/\$\{(\w+)\.tc\}/);
    if (wholeIdMatch) {
      const varName = wholeIdMatch[1];
      const loopRe = new RegExp(`for\\s*\\(\\s*(?:const|let)\\s+${varName}\\s+of\\s+(\\w+)`, 'g');
      const loopM  = loopRe.exec(src);
      if (loopM) {
        const arrName = loopM[1];
        const arrRe   = new RegExp(
          `(?:const|let)\\s+${arrName}\\s*(?::[^=]+=|=)\\s*\\[([\\s\\S]*?)\\]\\s*(?:as\\s+const)?\\s*;`,
          'g'
        );
        const arrM = arrRe.exec(src);
        if (arrM) {
          const tcRe = /\btc\s*:\s*['"]?(TC-[A-Z0-9-]+)['"]?/g;
          let tm;
          while ((tm = tcRe.exec(arrM[1])) !== null) tcTokens.add(tm[1]);
        }
      }
      // Template with ${item.tc} is considered to carry TC ids — don't add to missingTc
      continue;
    }

    // CASE 2 — TC prefix + variable property: `TC-XXX-YYY-${var.prop}: …`
    // Catches split literals where the numeric suffix lives in a data-object property.
    // Also catches ternary/complex expressions to prevent them reaching the plain scan.
    const prefixInterpol = raw.match(/^(TC-[A-Z0-9]+-[A-Z0-9]+-)\$\{(\w+)(?:\.(\w+))?/);
    if (prefixInterpol) {
      const prefix   = prefixInterpol[1]; // e.g. "TC-LOC-NTS-"
      const varName  = prefixInterpol[2]; // iteration variable name
      const propName = prefixInterpol[3]; // property name, undefined for ternary/complex

      let resolved = false;
      if (propName) {
        const ids = findLoopArrayIds(src, srcFile, varName, propName, targetRoot, clientId);
        if (ids) {
          ids.forEach((id) => tcTokens.add(`${prefix}${id}`));
          resolved = true;
        }
      }
      if (!resolved) {
        const lineNum = src.slice(0, m.index).split('\n').length;
        unresolvablePatterns.push({ template: raw.slice(0, 100), line: lineNum });
      }
      continue; // never fall through to the plain scan — avoids emitting the bare prefix
    }

    // CASE 3 — plain string or simple template
    // A test's ID is the LEADING TC-* token at the start of the title, before the colon.
    // TC-shaped tokens later in the prose are cross-references, not identifiers.
    const leadingMatch = raw.match(/^(TC-[A-Z0-9-]+)/);
    if (leadingMatch) {
      tcTokens.add(leadingMatch[1]);
    }

    // test()/it() titles must carry a leading TC-* token
    if ((kind === 'test' || kind === 'it') && !leadingMatch) {
      missingTc.push(raw.length > 100 ? raw.slice(0, 97) + '…' : raw);
    }
  }

  return { tcTokens, missingTc, unresolvablePatterns };
}

// ── Withheld surface tokens (for body scan) ───────────────────────────────────

function extractSelectorTokens(src) {
  const routes = new Set();
  const testids = new Set();

  // Route fragments: string literals that are URL-path-like
  const strRe = /['"`](\/[a-z0-9][a-z0-9-/]*)[`'"]/g;
  let m;
  while ((m = strRe.exec(src)) !== null) {
    const s = m[1];
    if (s.length > 2 && s.length < 120) routes.add(s);
  }

  // data-testid values from getByTestId / data-testid references
  const tidRe = /(?:getByTestId|data-testid)\s*[=([\s]*['"`]([a-z][a-z0-9_-]+)['"`]/g;
  while ((m = tidRe.exec(src)) !== null) testids.add(m[1]);

  return { routes, testids };
}

function loadManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    console.error(`[verify-approved-scope] FAIL: manifest not found: ${manifestPath}`);
    console.error('  Fix: create the delivery manifest at scripts/deliverable/delivery-manifest.<client>.json');
    process.exit(2);
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (e) {
    console.error(`[verify-approved-scope] FAIL: manifest is not valid JSON: ${e.message}`);
    process.exit(2);
  }
  if (!Array.isArray(manifest.modules) || manifest.modules.length === 0) {
    console.error('[verify-approved-scope] FAIL: manifest has no modules — an empty manifest cannot approve any file.');
    process.exit(1);
  }
  return manifest;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (hasFlag('help')) { usage(); process.exit(0); }

  const targetDir = arg('target');
  const clientId  = arg('client');

  if (!targetDir || !clientId) {
    console.error('[verify-approved-scope] Error: --target=<dir> and --client=<id> are required.\n');
    usage();
    process.exit(2);
  }

  const targetRoot = path.resolve(targetDir);
  if (!fs.existsSync(targetRoot) || !fs.statSync(targetRoot).isDirectory()) {
    console.error(`[verify-approved-scope] Error: target is not a directory: ${targetDir}`);
    process.exit(2);
  }

  const defaultManifestPath = path.join(
    REPO_ROOT, 'scripts', 'deliverable', `delivery-manifest.${clientId}.json`
  );
  const manifestPath = arg('manifest') ? path.resolve(arg('manifest')) : defaultManifestPath;
  const manifest = loadManifest(manifestPath);

  // ── Load tsconfig for non-relative import resolution (baseUrl + paths) ────
  const clientRoot = path.join(REPO_ROOT, 'clients', clientId);
  let tsBaseUrl = null;
  let tsPaths = null;
  try {
    const tsRaw = fs.readFileSync(path.join(clientRoot, 'tsconfig.json'), 'utf-8');
    // Strip JSONC comments (// and /* */) before parsing
    const tsClean = tsRaw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const tsConfigRaw = JSON.parse(tsClean);
    tsBaseUrl = tsConfigRaw.compilerOptions?.baseUrl || null;
    tsPaths = tsConfigRaw.compilerOptions?.paths || null;
  } catch { /* no tsconfig — non-relative imports treated as external */ }

  // ── Build lookup tables ─────────────────────────────────────────────────────

  // normalized path → { code, status }
  const pathToModule = new Map();
  // paths belonging to withheld/internal-only modules
  const withheldPaths = new Set();
  // module code → Set of approved tc ids
  const moduleTcIds = new Map();

  for (const mod of manifest.modules) {
    const status = mod.status ?? 'unknown';
    moduleTcIds.set(mod.code, new Set(Array.isArray(mod.tc_ids) ? mod.tc_ids : []));
    const allPaths = [
      ...(mod.specs      ?? []),
      ...(mod.workbooks  ?? []),
      ...(mod.src        ?? []),
    ];
    for (const p of allPaths) {
      const n = norm(p);
      pathToModule.set(n, { code: mod.code, status });
      if (BLOCKED.has(status)) withheldPaths.add(n);
    }
  }

  const sharedPaths = new Set();
  if (Array.isArray(manifest.shared)) {
    for (const e of manifest.shared) {
      const p = typeof e === 'string' ? e : e?.path;
      if (p) sharedPaths.add(norm(p));
    }
  }

  const aggregatePaths = new Set();
  if (Array.isArray(manifest.aggregate_workbooks)) {
    for (const e of manifest.aggregate_workbooks) {
      const p = typeof e === 'string' ? e : e?.path;
      if (p) aggregatePaths.add(norm(p));
    }
  }

  // ── Build withheld surface tokens for body scan (check 6) ──────────────────
  const withheldRoutes  = new Set();
  const withheldTestIds = new Set();
  // Track per-withheld-module routes for zero-coverage warning (routes only — primary discriminator).
  const perModuleWithheldRoutes = new Map(); // code → Set<string>

  const clientSrcSelectors = path.join(REPO_ROOT, 'clients', clientId, 'src', 'selectors');

  function collectSurfaceTokens(mod, routeTarget, testIdTarget) {
    // Derive route fragments from spec paths: tests/local-office/… → /local-office
    for (const sp of (mod.specs ?? [])) {
      const parts = norm(sp).split('/');
      if (parts[0] === 'tests' && parts[1]) {
        routeTarget.add(`/${parts[1]}`);
        routeTarget.add(`/${parts[1]}/`);
      }
    }
    // Read selector files (repo source, not payload)
    for (const sp of (mod.specs ?? [])) {
      const parts = norm(sp).split('/');
      if (parts[0] !== 'tests' || !parts[1]) continue;
      const selDir = path.join(clientSrcSelectors, parts[1]);
      if (!fs.existsSync(selDir)) continue;
      for (const f of walkDir(selDir)) {
        if (!f.endsWith('.ts') && !f.endsWith('.js')) continue;
        try {
          const src = fs.readFileSync(path.join(selDir, f), 'utf-8');
          const { routes, testids } = extractSelectorTokens(src);
          routes.forEach((r) => routeTarget.add(r));
          testids.forEach((t) => testIdTarget.add(t));
        } catch { /* skip unreadable */ }
      }
    }
    // Explicitly listed selector src[] files
    for (const sp of (mod.src ?? [])) {
      if (!norm(sp).includes('selector')) continue;
      const abs = path.join(REPO_ROOT, 'clients', clientId, sp);
      if (!fs.existsSync(abs)) continue;
      try {
        const src = fs.readFileSync(abs, 'utf-8');
        const { routes, testids } = extractSelectorTokens(src);
        routes.forEach((r) => routeTarget.add(r));
        testids.forEach((t) => testIdTarget.add(t));
      } catch { /* skip */ }
    }
  }

  for (const mod of manifest.modules) {
    if (!BLOCKED.has(mod.status)) continue;
    const modRoutes = new Set();
    collectSurfaceTokens(mod, modRoutes, withheldTestIds);
    perModuleWithheldRoutes.set(mod.code, modRoutes);
    modRoutes.forEach((r) => withheldRoutes.add(r));
  }

  // ── Subtract delivered-module tokens — only keep distinguishing tokens ──────
  // A token shared with any delivered/approved-next module is not evidence of a
  // withheld surface (e.g. /locations is the parent path for both delivered and
  // withheld location modules and must not block delivered specs).
  const deliveredRoutes  = new Set();
  const deliveredTestIds = new Set();
  for (const mod of manifest.modules) {
    if (BLOCKED.has(mod.status)) continue;
    collectSurfaceTokens(mod, deliveredRoutes, deliveredTestIds);
  }

  const routesBefore  = withheldRoutes.size;
  const testIdsBefore = withheldTestIds.size;
  for (const r of deliveredRoutes)  withheldRoutes.delete(r);
  for (const t of deliveredTestIds) withheldTestIds.delete(t);
  console.log(
    `[verify-approved-scope] body-scan token set: ` +
    `routes ${routesBefore}→${withheldRoutes.size} distinguishing, ` +
    `testids ${testIdsBefore}→${withheldTestIds.size} distinguishing ` +
    `(after subtracting delivered-module tokens)`
  );

  // Warn when a withheld module ends up with zero distinguishing route tokens —
  // the body scan has no coverage for it and that gap should be visible.
  for (const [code, modRoutes] of perModuleWithheldRoutes) {
    if (![...modRoutes].some((r) => withheldRoutes.has(r))) {
      console.warn(
        `[verify-approved-scope] NOTICE: withheld module "${code}" has zero distinguishing ` +
        `body-scan tokens after subtraction — body scan cannot detect leaks for this module.`
      );
    }
  }

  // ── Walk payload and check every file ──────────────────────────────────────
  const files = walkDir(targetRoot);
  const violations = [];

  for (const relFile of files) {
    const relNorm = norm(relFile);

    // ── Check 1 & 2: Resolution + status ─────────────────────────────────────
    const modEntry   = pathToModule.get(relNorm);
    const isShared   = sharedPaths.has(relNorm);
    const isAggrWb   = aggregatePaths.has(relNorm);

    if (!modEntry && !isShared && !isAggrWb) {
      violations.push(
        `UNRESOLVED  ${relNorm}\n` +
        `  Rule: every payload file must appear in the manifest (modules[].specs/workbooks/src,\n` +
        `        shared[], or aggregate_workbooks[]).\n` +
        `  Fix:  add this file to the manifest under its module (or shared[]) and commit the change.`
      );
      continue; // no further checks on unresolved files
    }

    if (modEntry && BLOCKED.has(modEntry.status)) {
      const isSpecOrWorkbook = relNorm.startsWith('tests/') || relNorm.endsWith('.xlsx');
      if (isSpecOrWorkbook) {
        violations.push(
          `BLOCKED-MODULE  ${relNorm}\n` +
          `  Rule: module ${modEntry.code} has status="${modEntry.status}" — not approved for delivery.\n` +
          `  Fix:  remove this file from the payload. To change scope, edit the manifest with\n` +
          `        approval evidence and commit; do not use a command-line override.`
        );
      }
    }

    // ── Check 3: Import boundary (informational — per owner ruling) ───────────
    const ext = path.extname(relNorm);
    if (SOURCE_EXTS.has(ext)) {
      let src;
      try { src = fs.readFileSync(path.join(targetRoot, relFile), 'utf-8'); }
      catch { continue; }

      const imports = parseImports(src);
      for (const specifier of imports) {
        let resolved = resolveRelImport(specifier, relNorm);
        if (!resolved) {
          if (specifier.startsWith('node:')) continue;
          resolved = resolveNonRelativeImport(specifier, clientRoot, tsBaseUrl, tsPaths);
          if (!resolved) continue;
        }
        for (const candidate of candidatePaths(resolved)) {
          if (withheldPaths.has(candidate)) {
            const target = pathToModule.get(candidate);
            console.log(
              `[verify-approved-scope] INFO: import in ${relNorm} references` +
              `${target ? ` withheld module "${target.code}"` : ' a withheld module'}` +
              ` ("${specifier}" → ${candidate}) — retained per owner ruling.`
            );
            break;
          }
        }
      }

      // ── Checks 4, 5, 6: Spec-only ──────────────────────────────────────────
      if (relNorm.endsWith('.spec.ts') || relNorm.endsWith('.spec.js') ||
          relNorm.endsWith('.spec.tsx') || relNorm.endsWith('.spec.jsx')) {

        if (modEntry) {
          const tcIds = moduleTcIds.get(modEntry.code) ?? new Set();
          const { tcTokens, missingTc, unresolvablePatterns } = extractTcInfo(src, relNorm, targetRoot, clientId);

          // Check 4: every TC-* token must be in tc_ids[]
          for (const tc of tcTokens) {
            if (!tcIds.has(tc)) {
              violations.push(
                `UNKNOWN-TC-ID  ${relNorm}  [${tc}]\n` +
                `  Rule: TC id "${tc}" is not listed in module "${modEntry.code}" tc_ids[].\n` +
                `  Fix:  add "${tc}" to tc_ids[] in the manifest, or remove it from the spec.`
              );
            }
          }

          // Check 5: every test() title must carry a TC-* token
          for (const title of missingTc) {
            violations.push(
              `MISSING-TC-ID  ${relNorm}\n` +
              `  Rule: every test() title must carry a TC-* token.\n` +
              `  Title: "${title}"\n` +
              `  Fix:  add the TC identifier to the test title, e.g. "TC-XXX-001 verifies …".`
            );
          }

          // Unresolvable split-template patterns — violation (fail closed)
          for (const { template, line } of unresolvablePatterns) {
            violations.push(
              `UNRESOLVABLE-TC-PATTERN  ${relNorm}:${line}\n` +
              `  Rule: a TC id pattern that cannot be statically resolved is unapproved until proven otherwise.\n` +
              `  Pattern: "${template}"\n` +
              `  Fix:  replace the dynamic pattern with explicit TC id literals, or add the\n` +
              `        data source to a location the gate can resolve.`
            );
          }
        }

        // Check 6: body scan for withheld surface tokens
        for (const route of withheldRoutes) {
          if (src.includes(route)) {
            violations.push(
              `WITHHELD-ROUTE  ${relNorm}\n` +
              `  Rule: spec body references a route fragment belonging to a withheld surface.\n` +
              `  Token: "${route}"\n` +
              `  Fix:  remove any navigation to or assertion on unapproved surfaces.`
            );
          }
        }
        for (const tid of withheldTestIds) {
          const tidRe = new RegExp(
            `getByTestId\\s*\\(\\s*['"\`]${tid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`
          );
          if (tidRe.test(src)) {
            violations.push(
              `WITHHELD-TESTID  ${relNorm}\n` +
              `  Rule: spec body uses a testid belonging to a withheld surface.\n` +
              `  Token: "${tid}"\n` +
              `  Fix:  remove this locator reference.`
            );
          }
        }
      }
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  if (violations.length === 0) {
    console.log(`[verify-approved-scope] PASS — ${files.length} file(s) checked, all approved scope.`);
    process.exit(0);
  }

  console.error(
    `[verify-approved-scope] FAIL — ${violations.length} violation(s) across ${files.length} file(s):\n`
  );
  for (const v of violations) {
    console.error(v);
    console.error('');
  }
  process.exit(1);
}

main().catch((e) => {
  console.error('[verify-approved-scope] Unexpected error:', e.message);
  process.exit(2);
});
