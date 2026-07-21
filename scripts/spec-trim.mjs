#!/usr/bin/env node
/**
 * spec-trim.mjs — slice a Playwright spec file to a chosen set of test cases.
 *
 * Uses the TypeScript AST — NOT regex or brace-counting — so template literals,
 * strings with braces, and embedded comments never corrupt the output.
 *
 * Usage:
 *   node scripts/spec-trim.mjs <spec-path> --keep=<selector> [--out=<path>] [--dry-run]
 *   node scripts/spec-trim.mjs <spec-path> --drop=<selector> [--out=<path>] [--dry-run]
 *
 * <selector>  comma-separated TC IDs and/or inclusive ranges, e.g.
 *               TC-CPR-OVR-001..TC-CPR-OVR-041,TC-CPR-OVR-045
 *               TC-CPR-OVR-001..041,TC-CPR-OVR-045
 *             Both range ends must share the same alphabetic prefix.
 *             An abbreviated numeric end (e.g. "041" in "..041") inherits the
 *             start's prefix.  A fully-prefixed end with a different prefix is
 *             an error (e.g. TC-CPR-OVR-001..TC-CPR-DET-005 → exit 2).
 *
 * --keep and --drop are mutually exclusive; supplying both or neither → exit 2.
 * Default output: rewrite in place. --out writes elsewhere. --dry-run prints a
 * summary and writes nothing.
 *
 * Exit codes: 0 success · 1 verification failure · 2 bad arguments
 *
 * INTERNAL TOOLING — NEVER ships to the client.
 */

import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TC_ID_RE = /TC-[A-Z]+(?:-[A-Z]+)*-\d+/;
const TC_ID_RE_G = new RegExp(TC_ID_RE.source, 'g');

/** Playwright callee shapes recognised as leaf test nodes. */
const TEST_CALLEES = new Set(['test', 'test.skip', 'test.fixme', 'test.only', 'test.fail']);
/** Playwright callee shapes recognised as describe containers. */
const DESCRIBE_CALLEES = new Set([
  'test.describe',
  'test.describe.skip',
  'test.describe.parallel',
  'test.describe.serial',
  'test.describe.only',
  'test.describe.fixme',
  'describe',
  'describe.skip',
]);

// ---------------------------------------------------------------------------
// Custom error types
// ---------------------------------------------------------------------------

export class ArgError extends Error { constructor(msg) { super(msg); this.name = 'ArgError'; } }
export class TcIdError extends Error { constructor(msg) { super(msg); this.name = 'TcIdError'; } }

// ---------------------------------------------------------------------------
// Selector parsing
// ---------------------------------------------------------------------------

/**
 * Parse a selector string into a detailed breakdown of TC IDs by origin.
 *
 * Tokens:  single TC IDs or inclusive ranges separated by commas.
 * Ranges:  "TC-CPR-OVR-001..TC-CPR-OVR-041"  (full-ID both ends)
 *          "TC-CPR-OVR-001..041"               (abbreviated numeric end)
 * Mixed-prefix ranges (TC-CPR-OVR-001..TC-CPR-DET-005) → ArgError.
 *
 * Returns:
 *   ids          — full union of all requested TC IDs
 *   explicitIds  — single TC IDs listed directly (not from a range)
 *   endpointIds  — start and end IDs of each range (must exist in the file)
 *
 * Interior range IDs (ids − explicitIds − endpointIds) are allowed to be
 * absent from the source file (legitimate gaps); missing endpoints or
 * explicitly listed IDs are caller errors.
 *
 * @param {string} selectorStr
 * @returns {{ ids: Set<string>, explicitIds: Set<string>, endpointIds: Set<string> }}
 */
export function parseSelectorDetailed(selectorStr) {
  const ids = new Set();
  const explicitIds = new Set();
  const endpointIds = new Set();
  for (const part of selectorStr.split(',')) {
    const token = part.trim();
    if (!token) continue;
    const dotDot = token.indexOf('..');
    if (dotDot !== -1) {
      const startStr = token.slice(0, dotDot);
      const endStr = token.slice(dotDot + 2);
      if (!startStr || !endStr) throw new ArgError(`malformed range (empty start or end): "${token}"`);
      const startM = startStr.match(/^((?:TC-)?(?:[A-Z]+(?:-[A-Z]+)*-)?)(\d+)$/);
      if (!startM) throw new ArgError(`range start is not a valid TC ID: "${startStr}"`);
      const prefix = startM[1];
      const width = startM[2].length;
      const from = parseInt(startM[2], 10);
      let to;
      if (/^\d+$/.test(endStr)) {
        // Abbreviated: inherit prefix from start
        to = parseInt(endStr, 10);
      } else {
        const endM = endStr.match(/^((?:TC-)?(?:[A-Z]+(?:-[A-Z]+)*-)?)(\d+)$/);
        if (!endM) throw new ArgError(`range end is not a valid TC ID: "${endStr}"`);
        if (endM[1] !== prefix) {
          throw new ArgError(`range endpoints must share the same alphabetic prefix: "${startStr}" vs "${endStr}"`);
        }
        to = parseInt(endM[2], 10);
      }
      if (from > to) throw new ArgError(`range start > end: "${token}"`);
      endpointIds.add(`${prefix}${String(from).padStart(width, '0')}`);
      endpointIds.add(`${prefix}${String(to).padStart(width, '0')}`);
      for (let n = from; n <= to; n++) {
        ids.add(`${prefix}${String(n).padStart(width, '0')}`);
      }
    } else {
      if (!TC_ID_RE.test(token)) throw new ArgError(`not a valid TC ID: "${token}"`);
      ids.add(token);
      explicitIds.add(token);
    }
  }
  if (ids.size === 0) throw new ArgError('selector produced no TC IDs');
  return { ids, explicitIds, endpointIds };
}

/**
 * Parse a selector string into a Set of TC IDs.
 * Convenience wrapper around parseSelectorDetailed for callers that only need the ID set.
 *
 * @param {string} selectorStr
 * @returns {Set<string>}
 */
export function parseSelector(selectorStr) {
  return parseSelectorDetailed(selectorStr).ids;
}

// ---------------------------------------------------------------------------
// AST helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a call-expression callee into its root identifier and property chain.
 * Returns null for unrecognised callee shapes (dynamic expressions, etc.).
 *
 * @param {ts.Expression} node
 * @returns {{ root: string, chain: string[] } | null}
 */
function resolveCallee(node) {
  if (ts.isIdentifier(node)) return { root: node.text, chain: [] };
  if (ts.isPropertyAccessExpression(node)) {
    const obj = resolveCallee(node.expression);
    if (!obj) return null;
    return { root: obj.root, chain: [...obj.chain, node.name.text] };
  }
  return null;
}

/**
 * If a statement is a test/describe call we recognise, return its metadata.
 * Returns null for hooks, imports, variable declarations, and other statements.
 *
 * @param {ts.Statement} stmt
 * @returns {{ kind: 'test'|'describe', callee: string, title: string|null, bodyStmts: ts.Statement[]|null } | null}
 */
export function identifyCall(stmt) {
  if (!ts.isExpressionStatement(stmt)) return null;
  const expr = stmt.expression;
  if (!ts.isCallExpression(expr)) return null;
  const c = resolveCallee(expr.expression);
  if (!c) return null;
  const calleeStr = c.root + (c.chain.length ? '.' + c.chain.join('.') : '');

  let kind;
  if (TEST_CALLEES.has(calleeStr)) kind = 'test';
  else if (DESCRIBE_CALLEES.has(calleeStr)) kind = 'describe';
  else return null;

  // First argument = title string
  let title = null;
  const firstArg = expr.arguments[0];
  if (firstArg) {
    if (ts.isStringLiteral(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg)) {
      title = firstArg.text;
    }
  }

  // For describes: extract body statements from the callback (last argument)
  let bodyStmts = null;
  if (kind === 'describe') {
    const callback = expr.arguments[expr.arguments.length - 1];
    if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) {
      const body = callback.body;
      if (ts.isBlock(body)) bodyStmts = [...body.statements];
    }
  }

  return { kind, callee: calleeStr, title, bodyStmts };
}

/**
 * Extract the first TC ID from a test title. Returns null when none is found.
 *
 * @param {string|null} title
 * @returns {string|null}
 */
export function extractTcId(title) {
  if (!title) return null;
  const m = title.match(TC_ID_RE);
  return m ? m[0] : null;
}

/**
 * Return the removal span for a statement: full start (including leading
 * trivia: whitespace + preceding comments) through end.
 *
 * @param {ts.Statement} stmt
 * @returns {{ pos: number, end: number }}
 */
function nodeSpan(stmt) {
  return { pos: stmt.getFullStart(), end: stmt.getEnd() };
}

function getLineNumber(stmt, sourceText) {
  return sourceText.slice(0, stmt.getStart()).split('\n').length;
}

// ---------------------------------------------------------------------------
// Core trimming
// ---------------------------------------------------------------------------

/**
 * Recursively compute removal spans for a list of statements.
 *
 * A test node is removed when `shouldRemove(tcId)` is true.
 * A describe is removed when ALL of its direct test/describe children are
 * removed (recursively — an outer describe emptied by inner removals also goes).
 *
 * @param {ts.Statement[]} statements
 * @param {string} sourceText
 * @param {(id: string) => boolean} shouldRemove
 * @returns {{ spans: {pos:number,end:number}[], removedCount: number, totalCount: number, warnings: string[] }}
 */
export function computeRemovals(statements, sourceText, shouldRemove) {
  const spans = [];
  const warnings = [];
  let removedCount = 0;
  let totalCount = 0; // test/describe nodes only

  for (const stmt of statements) {
    const call = identifyCall(stmt);
    if (!call) {
      // Fail closed: an unrecognised test.* call carrying a TC ID must be an error, never a
      // silent keep. Unknown shapes whose first argument matches the TC-ID pattern are rejected.
      if (ts.isExpressionStatement(stmt)) {
        const callExpr = stmt.expression;
        if (ts.isCallExpression(callExpr)) {
          const c = resolveCallee(callExpr.expression);
          if (c && c.root === 'test' && callExpr.arguments.length > 0) {
            const firstArg = callExpr.arguments[0];
            let argTitle = null;
            if (ts.isStringLiteral(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg)) {
              argTitle = firstArg.text;
            }
            if (argTitle && TC_ID_RE.test(argTitle)) {
              const calleeStr = c.root + (c.chain.length ? '.' + c.chain.join('.') : '');
              throw new TcIdError(
                `unknown test-family callee "${calleeStr}" at line ${getLineNumber(stmt, sourceText)} ` +
                `contains TC ID "${extractTcId(argTitle)}" — ` +
                `add "${calleeStr}" to TEST_CALLEES or DESCRIBE_CALLEES in spec-trim.mjs`
              );
            }
          }
        }
      }
      continue; // hook, import, variable, etc. — not a test/describe
    }

    totalCount++;

    if (call.kind === 'describe') {
      if (!call.bodyStmts) {
        // Unrecognised body shape — keep as-is and warn
        warnings.push(`describe at line ${getLineNumber(stmt, sourceText)} has an unrecognised callback shape — kept as-is`);
        continue;
      }
      const inner = computeRemovals(call.bodyStmts, sourceText, shouldRemove);
      warnings.push(...inner.warnings);

      if (inner.totalCount > 0 && inner.removedCount === inner.totalCount) {
        // Every test/describe child was removed → describe is empty, remove it
        spans.push(nodeSpan(stmt));
        removedCount++;
      } else {
        // Describe partially or fully survives — propagate inner removal spans
        spans.push(...inner.spans);
      }
    } else {
      // Leaf test node
      if (!call.title) {
        warnings.push(`test at line ${getLineNumber(stmt, sourceText)} has no string-literal title — kept as-is`);
        continue;
      }
      const tcId = extractTcId(call.title);
      if (!tcId) {
        throw new TcIdError(
          `test at line ${getLineNumber(stmt, sourceText)} has no TC ID in its title: "${call.title}"\n` +
          `  All tests must carry a TC ID (e.g. TC-CPR-OVR-001) — cannot safely filter without one.`
        );
      }
      if (shouldRemove(tcId)) {
        spans.push(nodeSpan(stmt));
        removedCount++;
      }
    }
  }

  return { spans, removedCount, totalCount, warnings };
}

// ---------------------------------------------------------------------------
// Text reconstruction
// ---------------------------------------------------------------------------

/**
 * Remove the given spans from sourceText, returning the spliced result.
 * Spans MUST NOT overlap; they are sorted before use.
 *
 * @param {string} sourceText
 * @param {{pos:number, end:number}[]} spans
 * @returns {string}
 */
export function spliceOut(sourceText, spans) {
  const sorted = [...spans].sort((a, b) => a.pos - b.pos);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].pos < sorted[i - 1].end) {
      throw new Error(
        `[spec-trim] internal: overlapping removal spans at ` +
        `${sorted[i - 1].pos}–${sorted[i - 1].end} and ${sorted[i].pos}–${sorted[i].end}`
      );
    }
  }
  let result = '';
  let cursor = 0;
  for (const { pos, end } of sorted) {
    result += sourceText.slice(cursor, pos);
    cursor = end;
  }
  result += sourceText.slice(cursor);
  return result;
}

// ---------------------------------------------------------------------------
// Safety checks
// ---------------------------------------------------------------------------

/**
 * Walk an AST and collect TC IDs from test titles only (not from bodies or
 * describe titles). This is the authoritative count for balance checks.
 *
 * @param {string} text
 * @returns {Set<string>}
 */
export function extractTcIdsFromTitles(text) {
  const sf = ts.createSourceFile('_check.ts', text, ts.ScriptTarget.Latest, true);
  const ids = new Set();
  function walk(stmts) {
    for (const stmt of stmts) {
      const call = identifyCall(stmt);
      if (!call) continue;
      if (call.kind === 'test' && call.title) {
        const id = extractTcId(call.title);
        if (id) ids.add(id);
      } else if (call.kind === 'describe' && call.bodyStmts) {
        walk(call.bodyStmts);
      }
    }
  }
  walk([...sf.statements]);
  return ids;
}

/**
 * Obtain syntax diagnostics for an in-memory TypeScript source text using a
 * minimal virtual program (avoids hitting the file system).
 *
 * @param {string} text
 * @returns {readonly ts.Diagnostic[]}
 */
function getSyntaxDiagnostics(text) {
  const fileName = '_spec-trim-check.ts';
  const host = {
    fileExists: (f) => f === fileName,
    readFile: (f) => f === fileName ? text : undefined,
    getSourceFile: (f, lv) => f === fileName ? ts.createSourceFile(f, text, lv, true) : undefined,
    writeFile: () => {},
    getDefaultLibFileName: () => 'lib.d.ts',
    useCaseSensitiveFileNames: () => true,
    getCanonicalFileName: (f) => f,
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    getNewLine: () => '\n',
    directoryExists: () => true,
  };
  const program = ts.createProgram([fileName], { noLib: true, noResolve: true }, host);
  return program.getSyntacticDiagnostics();
}

/**
 * Count leaf test-family nodes (test/test.skip/test.fixme/test.only) using
 * the AST.  Regex-based counting is unreliable because `test(` can appear
 * inside string literals or comments and produce false positives.
 *
 * @param {string} text
 * @returns {number}
 */
function countTestCallsAST(text) {
  const sf = ts.createSourceFile('_check.ts', text, ts.ScriptTarget.Latest, true);
  let count = 0;
  function walk(stmts) {
    for (const stmt of stmts) {
      const call = identifyCall(stmt);
      if (!call) continue;
      if (call.kind === 'test') count++;
      else if (call.kind === 'describe' && call.bodyStmts) walk(call.bodyStmts);
    }
  }
  walk([...sf.statements]);
  return count;
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * Report imported binding names that no longer appear in the non-import portion
 * of the file. Side-effect-only imports (no clause) and type-only imports are
 * excluded — they are always considered in-use.
 *
 * @param {string} text
 * @returns {string[]}
 */
function findUnusedImports(text) {
  const sf = ts.createSourceFile('_check.ts', text, ts.ScriptTarget.Latest, true);
  const importedNames = [];
  let lastImportEnd = 0;
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    lastImportEnd = stmt.getEnd();
    const clause = stmt.importClause;
    if (!clause) continue;
    if (clause.isTypeOnly) continue; // `import type { … }` — never counted as unused
    if (clause.name) importedNames.push(clause.name.text);
    const nb = clause.namedBindings;
    if (!nb) continue;
    if (ts.isNamedImports(nb)) {
      for (const el of nb.elements) {
        if (!el.isTypeOnly) importedNames.push(el.name.text); // skip inline `type` specifiers
      }
    } else if (ts.isNamespaceImport(nb)) {
      importedNames.push(nb.name.text);
    }
  }
  const body = text.slice(lastImportEnd);
  return importedNames.filter(name => !new RegExp(`\\b${escapeRegExp(name)}\\b`).test(body));
}

/**
 * Remove import bindings that are not referenced in the non-import body of the file.
 * Side-effect-only imports (`import './setup'`) and type-only imports (`import type { … }`)
 * are never removed. Inline type-only specifiers (`import { type Foo, Bar }`) are also kept.
 * If ALL named bindings of a declaration are unused, the whole declaration is removed.
 * If ONLY SOME are unused, just the named-imports list is rewritten without those specifiers.
 *
 * @param {string} sourceText
 * @returns {string}
 */
export function pruneUnusedImports(sourceText) {
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

  // Collect text-span replacements (applied bottom-up to preserve earlier positions).
  const replacements = [];

  for (const decl of importDecls) {
    const clause = decl.importClause;
    if (!clause) continue;           // side-effect import (`import './setup'`) — never touch
    if (clause.isTypeOnly) continue; // `import type { … }` — never touch

    const nb = clause.namedBindings;
    const defaultName = clause.name?.text;

    if (!nb) {
      // Only a default binding: `import Foo from '…'`
      if (defaultName && !isUsed(defaultName)) {
        replacements.push({ pos: decl.getFullStart(), end: decl.getEnd(), text: '' });
      }
      continue;
    }

    if (ts.isNamespaceImport(nb)) {
      // `import * as Foo from '…'`
      if (!isUsed(nb.name.text)) {
        replacements.push({ pos: decl.getFullStart(), end: decl.getEnd(), text: '' });
      }
      continue;
    }

    if (ts.isNamedImports(nb)) {
      const defaultUsed = defaultName ? isUsed(defaultName) : false;
      const usedElems = nb.elements.filter(el => {
        if (el.isTypeOnly) return true; // inline `type` specifier — never remove
        return isUsed(el.name.text);
      });

      if (usedElems.length === 0 && !defaultUsed) {
        // All bindings unused → remove whole declaration
        replacements.push({ pos: decl.getFullStart(), end: decl.getEnd(), text: '' });
      } else if (usedElems.length < nb.elements.length) {
        // Some named bindings unused → rewrite just the named-imports braces
        const usedSrc = usedElems.map(el => sourceText.slice(el.getStart(), el.getEnd()).trim());
        replacements.push({ pos: nb.getStart(), end: nb.getEnd(), text: `{ ${usedSrc.join(', ')} }` });
      }
    }
  }

  if (replacements.length === 0) return sourceText;

  // Apply bottom-up to preserve earlier positions
  const sorted = [...replacements].sort((a, b) => b.pos - a.pos);
  let result = sourceText;
  for (const { pos, end, text } of sorted) {
    result = result.slice(0, pos) + text + result.slice(end);
  }
  return result;
}

/**
 * Run all post-production safety checks on the trimmed output.
 * Any hard error → caller must NOT write the file and must exit 1.
 *
 * @param {string} output        trimmed source text
 * @param {Set<string>} keepSet  TC IDs that SHOULD appear in the output (already intersected with input)
 * @param {Set<string>} dropSet  TC IDs that MUST NOT appear anywhere in the output
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function runSafetyChecks(output, keepSet, dropSet) {
  const errors = [];
  const warnings = [];

  // 1. Re-parse: zero syntax diagnostics
  const syntaxDiags = getSyntaxDiagnostics(output);
  if (syntaxDiags.length > 0) {
    const sf = ts.createSourceFile('_check.ts', output, ts.ScriptTarget.Latest, false);
    for (const d of syntaxDiags) {
      const pos = d.start ?? 0;
      const { line } = sf.getLineAndCharacterOfPosition(pos);
      errors.push(`SAFETY-1 re-parse: syntax error at line ${line + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
    }
  }

  // 2. Exact set match (against the keep set already bounded to what exists in input)
  const outputIds = extractTcIdsFromTitles(output);
  const missing = [...keepSet].filter(id => !outputIds.has(id));
  const extra = [...outputIds].filter(id => !keepSet.has(id));
  if (missing.length > 0) errors.push(`SAFETY-2 TC IDs expected in output but absent: ${missing.join(', ')}`);
  if (extra.length > 0)   errors.push(`SAFETY-2 TC IDs in output but not in keep set: ${extra.join(', ')}`);

  // 3. No partial survivors: dropped TC IDs must not appear ANYWHERE in the output (incl. comments)
  for (const id of dropSet) {
    if (output.includes(id)) {
      errors.push(`SAFETY-3 dropped TC ID still present in output (including comments): ${id}`);
    }
  }

  // 4. Balance: test-family call count == number of TC IDs from titles in output
  const callCount = countTestCallsAST(output);
  if (callCount !== outputIds.size) {
    errors.push(`SAFETY-4 balance: ${callCount} test-family calls but ${outputIds.size} TC IDs in titles`);
  }

  // 5. Import sanity — pruneUnusedImports runs before safety checks, so any remaining
  // unused import means pruning missed a case. Treat as a hard error: shipping a file
  // with noUnusedLocals violations would fail the client's typecheck.
  const unused = findUnusedImports(output);
  if (unused.length > 0) {
    errors.push(`SAFETY-5 unused imports remain after pruning (noUnusedLocals will reject): ${unused.join(', ')}`);
  }

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

/**
 * @param {string[]} argv  process.argv
 * @returns {{ specPath: string, mode: 'keep'|'drop', selectorStr: string, outPath: string|null, dryRun: boolean }}
 */
function parseArgs(argv) {
  const [, , specPath, ...rest] = argv;
  if (!specPath || specPath.startsWith('--')) throw new ArgError('missing <spec-path>');
  const keepArg = rest.find(a => a.startsWith('--keep='));
  const dropArg = rest.find(a => a.startsWith('--drop='));
  const outArg  = rest.find(a => a.startsWith('--out='));
  const dryRun  = rest.includes('--dry-run');
  if (keepArg && dropArg) throw new ArgError('--keep and --drop are mutually exclusive');
  if (!keepArg && !dropArg) throw new ArgError('must supply either --keep=<selector> or --drop=<selector>');
  const mode = keepArg ? 'keep' : 'drop';
  const selectorStr = keepArg ? keepArg.slice('--keep='.length) : dropArg.slice('--drop='.length);
  const outPath = outArg ? outArg.slice('--out='.length) : null;
  return { specPath, mode, selectorStr, outPath, dryRun };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (e) {
    if (e instanceof ArgError) {
      console.error(`[spec-trim] bad arguments: ${e.message}`);
      console.error('Usage: node scripts/spec-trim.mjs <spec-path> --keep=<selector>|--drop=<selector> [--out=<path>] [--dry-run]');
      process.exit(2);
    }
    throw e;
  }

  const { specPath, mode, selectorStr, outPath, dryRun } = args;

  if (!existsSync(specPath)) {
    console.error(`[spec-trim] file not found: ${specPath}`);
    process.exit(2);
  }

  let operandSet;
  let parsedDetail;
  try {
    parsedDetail = parseSelectorDetailed(selectorStr);
    operandSet = parsedDetail.ids;
  } catch (e) {
    if (e instanceof ArgError) {
      console.error(`[spec-trim] bad selector: ${e.message}`);
      process.exit(2);
    }
    throw e;
  }

  const sourceText = readFileSync(specPath, 'utf8');
  const sf = ts.createSourceFile(specPath, sourceText, ts.ScriptTarget.Latest, true);

  // Determine effective keep/drop sets against what actually exists in the input
  const allInputIds = extractTcIdsFromTitles(sourceText);
  const { explicitIds, endpointIds } = parsedDetail;

  // Explicit IDs and range endpoints must be present — absent means a typo, exit 1
  const hardRequired = new Set([...explicitIds, ...endpointIds]);
  const hardMissing = [...hardRequired].filter(id => !allInputIds.has(id));
  if (hardMissing.length > 0) {
    for (const id of hardMissing) {
      console.error(`[spec-trim] error: requested TC ID not found in input: ${id}`);
    }
    process.exit(1);
  }

  // Interior range IDs may be legitimately absent (spec gaps — warn, proceed)
  const interiorIds = new Set([...operandSet].filter(id => !hardRequired.has(id)));
  const gapIds = [...interiorIds].filter(id => !allInputIds.has(id));
  if (gapIds.length > 0) {
    console.warn(`[spec-trim] warning: ${gapIds.length} interior range ID(s) not found in input (gaps): ${gapIds.join(', ')}`);
  }

  let keepSet, dropSet;
  if (mode === 'keep') {
    keepSet = new Set([...operandSet].filter(id => allInputIds.has(id)));
    dropSet  = new Set([...allInputIds].filter(id => !operandSet.has(id)));
  } else {
    dropSet  = new Set([...operandSet].filter(id => allInputIds.has(id)));
    keepSet  = new Set([...allInputIds].filter(id => !operandSet.has(id)));
  }

  // Compute removal spans
  const shouldRemoveFn = mode === 'keep'
    ? (id) => !operandSet.has(id)
    : (id) => operandSet.has(id);

  let removalResult;
  try {
    removalResult = computeRemovals([...sf.statements], sourceText, shouldRemoveFn);
  } catch (e) {
    if (e instanceof TcIdError) {
      console.error(`[spec-trim] ${e.message}`);
      process.exit(1);
    }
    throw e;
  }

  for (const w of removalResult.warnings) console.warn(`[spec-trim] warning: ${w}`);

  // Produce trimmed output
  const trimmedOutput = spliceOut(sourceText, removalResult.spans);

  // Prune imports left unused by the trim so the output satisfies noUnusedLocals (D4).
  const output = pruneUnusedImports(trimmedOutput);

  // Safety checks — any error prevents writing
  const { errors, warnings: safetyWarnings } = runSafetyChecks(output, keepSet, dropSet);
  for (const w of safetyWarnings) console.warn(`[spec-trim] ${w}`);

  if (errors.length > 0) {
    for (const e of errors) console.error(`[spec-trim] ${e}`);
    console.error('[spec-trim] safety checks failed — no file written');
    process.exit(1);
  }

  const keptCount  = keepSet.size;
  const droppedCount = dropSet.size;

  if (dryRun) {
    console.log(`[spec-trim] dry-run: would write ${outPath ?? specPath}`);
    console.log(`[spec-trim] kept: ${keptCount}, dropped: ${droppedCount}`);
    if (gapIds.length > 0) {
      console.log(`[spec-trim] interior range gaps (${gapIds.length}): ${gapIds.join(', ')}`);
    }
    process.exit(0);
  }

  // Write output
  const dest = outPath ?? specPath;
  if (outPath) {
    const dir = path.dirname(path.resolve(outPath));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  writeFileSync(dest, output, 'utf8');
  console.log(`[spec-trim] wrote ${dest}`);
  console.log(`[spec-trim] kept: ${keptCount}, dropped: ${droppedCount}`);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
