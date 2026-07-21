#!/usr/bin/env node
/**
 * src-trim.mjs — dead-code elimination for a client source tree.
 *
 * Usage:
 *   node scripts/src-trim.mjs --root=<treeDir> [--dry-run] [--json]
 *
 * Algorithm:
 *   Whole-tree reference scan (all .ts under --root) → AST export-finder →
 *   dead = zero references outside declaration node → fixed-point loop →
 *   reuse pruneUnusedImports.
 *
 * Correctness rule: keep as UNRESOLVED whenever reachability is ambiguous.
 * Never remove: type-only exports, side-effect imports, default exports.
 *
 * The tool ONLY modifies files inside the --root tree it is given.
 * Operate on a scratch copy; never pass a real repo root.
 *
 * INTERNAL TOOLING — NEVER ships to the client.
 */

import ts from 'typescript';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function walkFiles(dir, suffix) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkFiles(full, suffix));
    else if (ent.isFile() && ent.name.endsWith(suffix)) out.push(full);
  }
  return out;
}

function resolveRelativeImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const c = base + ext;
    if (existsSync(c)) return c;
  }
  if (existsSync(base) && !base.endsWith(path.sep)) return base;
  return null;
}

function readFile(file, mem) {
  const norm = path.normalize(file);
  if (mem.has(norm)) return mem.get(norm);
  try { return readFileSync(file, 'utf8'); } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// pruneUnusedImports — ported verbatim from spec-trim.mjs
// ─────────────────────────────────────────────────────────────────────────────

function pruneUnusedImports(sourceText) {
  const sf = ts.createSourceFile('_prune.ts', sourceText, ts.ScriptTarget.Latest, true);
  let lastImportEnd = 0;
  const importDecls = [];
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    lastImportEnd = stmt.getEnd();
    importDecls.push(stmt);
  }
  if (importDecls.length === 0) return sourceText;
  const body = sourceText.slice(lastImportEnd);
  const isUsed = (name) => new RegExp(`\\b${escapeRegExp(name)}\\b`).test(body);

  const replacements = [];
  for (const decl of importDecls) {
    const clause = decl.importClause;
    if (!clause) continue;
    if (clause.isTypeOnly) continue;
    const nb = clause.namedBindings;
    const defaultName = clause.name?.text;
    if (!nb) {
      if (defaultName && !isUsed(defaultName))
        replacements.push({ pos: decl.getFullStart(), end: decl.getEnd(), text: '' });
      continue;
    }
    if (ts.isNamespaceImport(nb)) {
      if (!isUsed(nb.name.text))
        replacements.push({ pos: decl.getFullStart(), end: decl.getEnd(), text: '' });
      continue;
    }
    if (ts.isNamedImports(nb)) {
      const defaultUsed = defaultName ? isUsed(defaultName) : false;
      const usedElems = nb.elements.filter(el => el.isTypeOnly || isUsed(el.name.text));
      if (usedElems.length === 0 && !defaultUsed) {
        replacements.push({ pos: decl.getFullStart(), end: decl.getEnd(), text: '' });
      } else if (usedElems.length < nb.elements.length) {
        const usedSrc = usedElems.map(el => sourceText.slice(el.getStart(), el.getEnd()).trim());
        replacements.push({ pos: nb.getStart(), end: nb.getEnd(), text: `{ ${usedSrc.join(', ')} }` });
      }
    }
  }
  if (replacements.length === 0) return sourceText;
  const sorted = [...replacements].sort((a, b) => b.pos - a.pos);
  let result = sourceText;
  for (const { pos, end, text } of sorted) result = result.slice(0, pos) + text + result.slice(end);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reachability — BFS from spec roots, collecting body-token refs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All word-boundary identifiers from the non-import body of a source file.
 * Conservative: includes identifiers in comments and string literals so we
 * never accidentally remove a member whose name appears only as a string key.
 */
function collectBodyRefs(sourceText) {
  const sf = ts.createSourceFile('_r.ts', sourceText, ts.ScriptTarget.Latest, true);
  let lastImportEnd = 0;
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt)) lastImportEnd = stmt.getEnd();
  }
  const body = sourceText.slice(lastImportEnd);
  return new Set((body.match(/\b[A-Za-z_$][A-Za-z0-9_$]*\b/g)) || []);
}

/**
 * Patterns that make static removal of exported members unsafe.
 * Returns de-duped reason strings; empty array = clean.
 */
function detectAmbiguous(sourceText) {
  const reasons = new Set();
  const sf = ts.createSourceFile('_a.ts', sourceText, ts.ScriptTarget.Latest, true);
  function walk(node) {
    // Dynamic bracket access: obj[nonLiteralExpr]
    if (ts.isElementAccessExpression(node)) {
      const arg = node.argumentExpression;
      if (!ts.isStringLiteral(arg) && !ts.isNumericLiteral(arg))
        reasons.add('dynamic bracket access (obj[expr])');
    }
    // export * re-export barrel
    if (ts.isExportDeclaration(node) && !node.exportClause)
      reasons.add('export * re-export barrel');
    ts.forEachChild(node, walk);
  }
  walk(sf);
  // Decorator usage (can call arbitrary exported members)
  if (/@[A-Za-z]/.test(sourceText)) reasons.add('decorator usage');
  return [...reasons];
}

// Whole-tree reference collection: every .ts/.tsx under root contributes references,
// not just files reachable from spec roots. (roots param intentionally dropped.)
function collectAllRefs(rootDir, srcDir, mem) {
  const allFiles = [...walkFiles(rootDir, '.ts'), ...walkFiles(rootDir, '.tsx')];
  const nameToFiles = new Map();
  const ambiguous = new Map();
  const normSrc = path.normalize(srcDir);
  for (const file of allFiles) {
    const norm = path.normalize(file);
    const src = readFile(file, mem);
    if (!src) continue;
    for (const ref of collectBodyRefs(src)) {
      if (!nameToFiles.has(ref)) nameToFiles.set(ref, new Set());
      nameToFiles.get(ref).add(norm);
    }
    const reasons = detectAmbiguous(src);
    if (reasons.length > 0 && norm.startsWith(normSrc)) ambiguous.set(norm, reasons);
  }
  return { nameToFiles, ambiguous };
}

// ─────────────────────────────────────────────────────────────────────────────
// Export enumeration via TypeScript AST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enumerate removable exported members from source text.
 * Never includes: type aliases, interfaces, default exports, private/protected
 * class members, constructors, or ambient declarations.
 *
 * @returns {Array<{ name: string, kind: string, node: ts.Node, sf: ts.SourceFile }>}
 */
function enumerateExports(file, sourceText) {
  const sf = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const out = [];
  const SK = ts.SyntaxKind;

  const hasModifier = (node, kind) => !!(node.modifiers?.some(m => m.kind === kind));
  const isExported = (node) => hasModifier(node, SK.ExportKeyword);
  const isDefault = (node) => hasModifier(node, SK.DefaultKeyword);
  const isDeclare = (node) => hasModifier(node, SK.DeclareKeyword);
  const isPrivate = (node) =>
    hasModifier(node, SK.PrivateKeyword) || hasModifier(node, SK.ProtectedKeyword);

  for (const stmt of sf.statements) {
    // Skip type-only constructs
    if (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) continue;
    // Skip ambient
    if (isDeclare(stmt)) continue;
    // Must be exported
    if (!isExported(stmt)) continue;
    // Never remove default exports
    if (isDefault(stmt)) continue;

    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name))
          out.push({ name: decl.name.text, kind: 'variable', node: stmt, sf });
      }
      continue;
    }

    if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      out.push({ name: stmt.name.text, kind: 'function', node: stmt, sf });
      continue;
    }

    if (ts.isClassDeclaration(stmt) && stmt.name) {
      for (const member of stmt.members) {
        if (!ts.isMethodDeclaration(member) && !ts.isPropertyDeclaration(member)) continue;
        if (!member.name) continue;
        if (isPrivate(member)) continue;
        const name = (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
          ? member.name.text : null;
        if (!name || name === 'constructor') continue;
        out.push({ name, kind: 'method', node: member, sf });
      }
    }
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Member-scoped ambiguity narrowing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * For a src file already flagged as ambiguous, returns the subset of
 * candidateNames whose own name is specifically implicated in a dynamic or
 * string-key context within that file.
 *
 * Conservative all-or-nothing cases:
 *  - export* barrel: any name may be re-exported → all implicated.
 *  - decorator usage: reflection may access any member → all implicated.
 *
 * Narrow case (non-literal bracket obj[expr]):
 *  - A name is implicated only if it appears as a string literal in the file
 *    (it could be the runtime key passed to that bracket).
 *
 * String-literal bracket obj['name']:
 *  - Exactly that name is implicated.
 */
function getImplicatedNames(sourceText, candidateNames) {
  const implicated = new Set();
  if (candidateNames.size === 0) return implicated;

  // Decorator: conservative — any decorator may introspect all members via reflection
  if (/@[A-Za-z]/.test(sourceText)) {
    for (const n of candidateNames) implicated.add(n);
    return implicated;
  }

  const sf = ts.createSourceFile('_i.ts', sourceText, ts.ScriptTarget.Latest, true);
  let hasBarrel = false;
  let hasNonLiteralBracket = false;

  function walk(node) {
    if (ts.isExportDeclaration(node) && !node.exportClause) { hasBarrel = true; }
    if (ts.isElementAccessExpression(node)) {
      const arg = node.argumentExpression;
      if (ts.isStringLiteral(arg) && candidateNames.has(arg.text)) {
        implicated.add(arg.text);
      }
      if (!ts.isStringLiteral(arg) && !ts.isNumericLiteral(arg)) {
        hasNonLiteralBracket = true;
      }
    }
    ts.forEachChild(node, walk);
  }
  walk(sf);

  // export* barrel: all names potentially re-exported under unknown aliases
  if (hasBarrel) {
    for (const n of candidateNames) implicated.add(n);
    return implicated;
  }

  // Non-literal bracket obj[expr]: a name is implicated only if it appears as a
  // string literal in the file — otherwise it cannot be the runtime key value.
  if (hasNonLiteralBracket) {
    for (const name of candidateNames) {
      if (new RegExp(`['"]${escapeRegExp(name)}['"]`).test(sourceText)) {
        implicated.add(name);
      }
    }
  }

  return implicated;
}

// ─────────────────────────────────────────────────────────────────────────────
// One trim pass over all src/ files
// ─────────────────────────────────────────────────────────────────────────────

function collapseBlankLines(text) {
  return text.replace(/\n{3,}/g, '\n\n');
}

/**
 * One pass: for each src/ file, remove exported members not in allRefs.
 * Re-enumerates after each removal (AST position safety).
 *
 * @returns {{ modified: Map<string,string>, removed: string[], unresolved: string[] }}
 */
function trimPass(srcDir, nameToFiles, ambiguous, mem) {
  const srcFiles = [
    ...walkFiles(srcDir, '.ts'),
    ...walkFiles(srcDir, '.tsx'),
  ];
  const modified = new Map();
  const removed = [];
  const unresolved = [];

  // A member is dead iff (a) no OTHER file references its name, AND (b) within its own file the name
  // appears only at its declaration (exclude the declaration span, check the rest of the file text).
  const isDead = (name, fileNorm, fileText, declNode) => {
    const files = nameToFiles.get(name);
    if (files) {
      for (const f of files) { if (f !== fileNorm) return false; }
    }
    const re = new RegExp(`\\b${escapeRegExp(name)}\\b`);
    const start = declNode.getFullStart();
    const end = declNode.getEnd();
    return !re.test(fileText.slice(0, start)) && !re.test(fileText.slice(end));
  };

  for (const file of srcFiles) {
    const norm = path.normalize(file);
    let text = readFile(file, mem);
    if (!text) continue;

    const fileAmbig = ambiguous.get(norm);
    if (fileAmbig) {
      // Member-scoped keep: only keep as UNRESOLVED if this specific name is
      // implicated in a dynamic/string-key context. Dead members whose name never
      // appears in such a context are removed despite the file-level ambiguity flag.
      const deadMembers = enumerateExports(file, text).filter(
        exp => isDead(exp.name, norm, text, exp.node)
      );
      if (deadMembers.length > 0) {
        const implicated = getImplicatedNames(text, new Set(deadMembers.map(e => e.name)));
        for (const exp of deadMembers) {
          if (implicated.has(exp.name))
            unresolved.push(`${path.relative(srcDir, file)}::${exp.name} (${fileAmbig.join('; ')})`);
        }
        const toRemoveNames = new Set(
          deadMembers.filter(e => !implicated.has(e.name)).map(e => `${e.name}::${e.kind}`)
        );
        if (toRemoveNames.size > 0) {
          let changed = false;
          for (const nameKind of [...toRemoveNames]) {
            const [name, kind] = nameKind.split('::');
            const fresh = enumerateExports(file, text).find(e => e.name === name && e.kind === kind);
            if (!fresh) continue;
            const start = fresh.node.getFullStart();
            const end = fresh.node.getEnd();
            text = text.slice(0, start) + text.slice(end);
            text = collapseBlankLines(text);
            removed.push(`${path.relative(srcDir, file)}::${name}`);
            changed = true;
          }
          if (changed) {
            text = pruneUnusedImports(text);
            modified.set(norm, text);
          }
        }
      }
      continue;
    }

    // Collect names to remove (those not referenced by any file other than their own)
    const toRemoveNames = new Set(
      enumerateExports(file, text)
        .filter(e => isDead(e.name, norm, text, e.node))
        .map(e => `${e.name}::${e.kind}`)
    );
    if (toRemoveNames.size === 0) continue;

    let changed = false;

    // Remove one at a time, re-enumerating to get fresh AST positions
    for (const nameKind of [...toRemoveNames]) {
      const [name, kind] = nameKind.split('::');
      const fresh = enumerateExports(file, text).find(e => e.name === name && e.kind === kind);
      if (!fresh) continue; // already gone

      const start = fresh.node.getFullStart();
      const end = fresh.node.getEnd();
      text = text.slice(0, start) + text.slice(end);
      text = collapseBlankLines(text);
      removed.push(`${path.relative(srcDir, file)}::${name}`);
      changed = true;
    }

    if (changed) {
      text = pruneUnusedImports(text);
      modified.set(norm, text);
    }
  }

  return { modified, removed, unresolved };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixed-point loop
// ─────────────────────────────────────────────────────────────────────────────

function trimToFixedPoint(rootDir, testsDir, srcDir, dryRun) {
  const roots = [
    ...walkFiles(testsDir, '.spec.ts'),
    ...walkFiles(testsDir, '.spec.tsx'),
  ];
  if (roots.length === 0) {
    process.stderr.write(`WARN: no *.spec.ts files found under ${testsDir}\n`);
  }

  const mem = new Map(); // normalized path → modified text
  let allRemoved = [];
  const seenUnresolved = new Set();
  const allUnresolved = [];
  let passes = 0;

  for (let i = 0; i < 20; i++) {
    const { nameToFiles, ambiguous } = collectAllRefs(rootDir, srcDir, mem);
    const { modified, removed, unresolved } = trimPass(srcDir, nameToFiles, ambiguous, mem);

    for (const u of unresolved) {
      if (!seenUnresolved.has(u)) { seenUnresolved.add(u); allUnresolved.push(u); }
    }

    passes++;
    if (removed.length === 0) break;

    allRemoved = allRemoved.concat(removed);
    for (const [norm, text] of modified) mem.set(norm, text);
  }

  if (!dryRun) {
    for (const [norm, text] of mem) writeFileSync(norm, text, 'utf8');
  }

  return { removed: allRemoved, unresolved: allUnresolved, passes };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { dryRun: false, json: false, root: null };
  for (const a of argv.slice(2)) {
    if (a === '--dry-run') { args.dryRun = true; continue; }
    if (a === '--json')    { args.json = true;   continue; }
    const m = a.match(/^--root=(.+)$/);
    if (m) args.root = m[1];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.root) {
    process.stderr.write('Usage: node scripts/src-trim.mjs --root=<treeDir> [--dry-run] [--json]\n');
    process.exit(2);
  }

  const rootDir  = path.resolve(args.root);
  const testsDir = path.join(rootDir, 'tests');
  const srcDir   = path.join(rootDir, 'src');

  if (!existsSync(rootDir)) {
    process.stderr.write(`ERROR: root does not exist: ${rootDir}\n`);
    process.exit(1);
  }
  if (!existsSync(srcDir)) {
    process.stderr.write(`ERROR: src/ not found under root: ${srcDir}\n`);
    process.exit(1);
  }

  const { removed, unresolved, passes } = trimToFixedPoint(rootDir, testsDir, srcDir, args.dryRun);

  if (args.json) {
    process.stdout.write(JSON.stringify({ dryRun: args.dryRun, passes, removed, unresolved }, null, 2) + '\n');
  } else {
    const mode = args.dryRun ? 'DRY RUN' : 'WRITTEN';
    process.stdout.write(`\nsrc-trim report (${mode})\n`);
    process.stdout.write(`  Fixed-point passes : ${passes}\n`);
    process.stdout.write(`  Removed            (${removed.length}):\n`);
    for (const r of removed) process.stdout.write(`    - ${r}\n`);
    process.stdout.write(`  Kept as UNRESOLVED (${unresolved.length}):\n`);
    for (const u of unresolved) process.stdout.write(`    ? ${u}\n`);
  }
}

main();
