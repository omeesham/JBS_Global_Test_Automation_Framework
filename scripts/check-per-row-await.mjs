#!/usr/bin/env node
/**
 * check-per-row-await.mjs — a per-element await loop must never sit under a fixed wait budget.
 *
 * MEASURED DEFECT (2026-08-20, Service Charge History). `getHistoryRows()` read the grid one row at a
 * time — `await rows.nth(i).getByRole('cell').allTextContents()` inside `for (let i = 1; i < count; i++)`
 * where `count` came from `await rows.count()`. Its only caller, `waitUntilHistoryLoaded()`, wrapped it
 * in `expect.poll(..., { timeout: 30_000 })`. The History grid gains a row on every save and never loses
 * one, so the read cost grows every run: at 384 rows the traces measured 383 sequential round-trips at a
 * 107 ms median and ONE call taking 41.7 s against a 30 s budget. The poll predicate never returned even
 * once and 14 of 15 tests died. The grid was fully rendered the whole time, so the failure presented as
 * app slowness and sent two independent reviewers to the wrong root cause. The fix was a single
 * `evaluateAll` — one round-trip regardless of row count.
 *
 * TIER 1 — ENFORCED (`--enforce` → exit 1). The killer combination ONLY: an UNCAPPED per-element await
 * loop that is reachable, within the same file, from a fixed-timeout wait predicate (`expect.poll(...)`,
 * `page.waitForFunction(...)`, or any helper taking a predicate plus a `{ timeout }` budget). Reachability
 * is transitive across same-file `this.method()` calls, so `poll → a() → b() → loop` is caught. The
 * per-request cost of the loop is unbounded while the budget is fixed, so the wait is guaranteed to
 * fail once the data grows. Narrow by construction — false positives should be near zero.
 *
 * TIER 2 — ANNOUNCE ONLY (never affects the exit code). The broader class: any await on a per-element
 * locator inside a loop whose bound came from `await <locator>.count()` with no cap. Reported as INFO
 * with file:line plus a one-line total, so the real distribution becomes visible before anyone decides
 * whether it deserves a gate. Deliberately NOT enforced: an allowlist everyone rubber-stamps is worse
 * than no gate.
 *
 * NOT flagged (bounded reads — these are correct and must stay silent):
 *   - `const count = Math.min(await rows.count(), n); for (let i = 0; i < count; i++) …` — capped.
 *   - a numeric-literal bound, or a bound whose origin is not a `.count()` read.
 *   - a single per-element await with no loop around it (`rows.first().innerText()`).
 *   - anything inside a comment or a string literal — the source is scrubbed of comments, strings and
 *     regex literals (offsets preserved) BEFORE any pattern runs, so a prose description of this very
 *     pattern cannot trip the gate.
 * Escape hatch: `// per-row-await-exempt: <reason>` on the loop line or the comment block above it.
 *
 * IN SCOPE — page objects `clients/<client>/src/pages/**\/*.ts` and specs `clients/<client>/tests/**\/*.spec.ts`.
 * WARN-ONLY by default (exit 0). `--enforce` makes a TIER 1 finding exit 1 (the pre-commit/CI gate mode).
 * Convention sibling: scripts/check-reload-wait.mjs (same pure-function + main() + .test.mjs shape).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markerInCommentBlockAbove, walkSpecFiles } from './lib/spec-scan-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

const EXEMPT_RE = /per-row-await-exempt\s*:/i;

// Call names that open a test/reporting block, never a wait budget. A `test(...)` body can contain both
// an arrow and a `timeout` key by coincidence; treating it as a wait region would make every method it
// calls tier-1-eligible. Blacklisted so the generic wait-region rule cannot swallow a whole test.
const NON_WAIT_CALLEES = new Set([
  'test', 'it', 'describe', 'suite', 'step', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll', 'expect',
]);

// Statement/expression keywords that take a paren but are not calls.
const NOT_A_CALL = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'typeof', 'await', 'function', 'yield', 'do',
  'else', 'new', 'delete', 'void', 'in', 'of', 'instanceof', 'case', 'throw', 'super', 'constructor',
]);

// ---------------------------------------------------------------------------------------------
// 1. Scrubber — blank out comments, strings and regex literals, preserving byte offsets and lines.
//    Everything downstream matches ONLY on real code, which is what makes criterion "a description
//    cannot trigger the gate" structural rather than a promise.
// ---------------------------------------------------------------------------------------------

/** Chars/keywords after which a `/` starts a regex literal rather than a division. */
function regexAllowedBefore(prevChar, prevWord) {
  if (prevChar === '') return true;
  if ('(,=:[!&|?{};+-*%~^<>'.includes(prevChar)) return true;
  return ['return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'instanceof', 'do', 'else', 'yield', 'await'].includes(prevWord);
}

/**
 * Replace every comment, string-literal and regex-literal character with a space (newlines kept), so
 * line/column offsets in the result map 1:1 onto the original source.
 * @param {string} text
 * @returns {string}
 */
export function scrubSource(text) {
  const src = String(text ?? '');
  const out = src.split('');
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  let i = 0;
  let prevChar = '';
  let prevWord = '';
  while (i < src.length) {
    const c = src[i];
    const c2 = src[i + 1];
    if (c === '/' && c2 === '/') {
      let j = i; while (j < src.length && src[j] !== '\n') j++;
      blank(i, j); i = j; continue;
    }
    if (c === '/' && c2 === '*') {
      let j = i + 2; while (j < src.length && !(src[j] === '*' && src[j + 1] === '/')) j++;
      j = Math.min(j + 2, src.length);
      blank(i, j); i = j; continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === c) { j++; break; }
        j++;
      }
      blank(i + 1, j - 1 >= i + 1 ? j - 1 : i + 1); // keep the quotes as structure, blank the contents
      i = j; prevChar = c; prevWord = ''; continue;
    }
    if (c === '/' && regexAllowedBefore(prevChar, prevWord)) {
      let j = i + 1; let inClass = false; let closed = false;
      while (j < src.length && src[j] !== '\n') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') inClass = true;
        else if (src[j] === ']') inClass = false;
        else if (src[j] === '/' && !inClass) { j++; closed = true; break; }
        j++;
      }
      if (closed) {
        while (j < src.length && /[a-z]/.test(src[j])) j++; // trailing flags
        blank(i, j); i = j; prevChar = ' '; prevWord = ''; continue;
      }
    }
    if (/\S/.test(c)) {
      if (/[\w$]/.test(c)) {
        let j = i; while (j < src.length && /[\w$]/.test(src[j])) j++;
        prevWord = src.slice(i, j); prevChar = src[j - 1];
        i = j; continue;
      }
      prevChar = c; prevWord = '';
    }
    i++;
  }
  return out.join('');
}

// ---------------------------------------------------------------------------------------------
// 2. Bracket matching + line lookup helpers.
// ---------------------------------------------------------------------------------------------

/** Map every open bracket offset to its matching close offset (and vice versa) in scrubbed text. */
function bracketMap(s) {
  const fwd = new Map();
  const stack = [];
  const PAIRS = { '(': ')', '[': ']', '{': '}' };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[' || c === '{') stack.push([c, i]);
    else if (c === ')' || c === ']' || c === '}') {
      for (let k = stack.length - 1; k >= 0; k--) {
        if (PAIRS[stack[k][0]] === c) { fwd.set(stack[k][1], i); stack.length = k; break; }
      }
    }
  }
  return fwd;
}

function lineStarts(s) {
  const starts = [0];
  for (let i = 0; i < s.length; i++) if (s[i] === '\n') starts.push(i + 1);
  return starts;
}

function offsetToLine(starts, off) {
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= off) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

// ---------------------------------------------------------------------------------------------
// 3. Method extraction — name → { start, end } of the body, on scrubbed text.
// ---------------------------------------------------------------------------------------------

const METHOD_HEAD_RE = /(?:^|\n)[ \t]+(?:(?:public|private|protected|static|override|readonly|async)[ \t]+)*([A-Za-z_$][\w$]*)[ \t]*(?:<[^<>()]*>)?[ \t]*\(/g;

/**
 * Find class-member method bodies. A header only counts when its `)` is followed (after an optional
 * `: ReturnType`) by a `{` — which rejects bare statement calls like `doThing(x);`.
 * @returns {Array<{name: string, headStart: number, bodyStart: number, bodyEnd: number}>}
 */
export function findMethods(scrubbed, fwd) {
  const methods = [];
  METHOD_HEAD_RE.lastIndex = 0;
  let m;
  while ((m = METHOD_HEAD_RE.exec(scrubbed)) !== null) {
    const name = m[1];
    if (NOT_A_CALL.has(name)) continue;
    const openParen = m.index + m[0].length - 1;
    const closeParen = fwd.get(openParen);
    if (closeParen === undefined) continue;
    // After `)`, allow a return-type annotation, then require `{`.
    let j = closeParen + 1;
    while (j < scrubbed.length && /\s/.test(scrubbed[j])) j++;
    if (scrubbed[j] === ':') {
      let depth = 0;
      while (j < scrubbed.length) {
        const c = scrubbed[j];
        if (c === '<' || c === '(' || c === '[') depth++;
        else if (c === '>' || c === ')' || c === ']') depth--;
        else if (c === '{' && depth <= 0) break;
        else if (c === ';' && depth <= 0) break;
        j++;
      }
    }
    if (scrubbed[j] !== '{') continue;
    const bodyEnd = fwd.get(j);
    if (bodyEnd === undefined) continue;
    methods.push({ name, headStart: m.index, bodyStart: j, bodyEnd });
  }
  // Keep only outermost methods (a nested function inside a body is not a class member).
  return methods.filter((a) => !methods.some((b) => b !== a && b.bodyStart < a.headStart && a.bodyEnd < b.bodyEnd));
}

// ---------------------------------------------------------------------------------------------
// 4. Loop analysis — is this a per-element await loop, and is its bound capped?
// ---------------------------------------------------------------------------------------------

const C_STYLE_HEAD_RE = /^\s*(?:let|var|const)?\s*([A-Za-z_$][\w$]*)\s*=[^;]*;\s*\1\s*[<!]=?\s*([^;]+);/;
const FOR_OF_HEAD_RE = /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s+of\s+([\s\S]+)$/;

/**
 * Classify a loop bound expression. `origins` maps a variable name to the RHS it was assigned from
 * earlier in the enclosing body.
 * @returns {'count-uncapped'|'count-capped'|'all'|'literal'|'unknown'}
 */
export function classifyBound(boundExpr, origins) {
  const expr = String(boundExpr ?? '').trim();
  const resolve = (e, depth) => {
    if (/Math\s*\.\s*min\s*\(/.test(e)) return 'count-capped';
    if (/\.\s*count\s*\(\s*\)/.test(e)) return 'count-uncapped';
    if (/\.\s*(?:all|elementHandles)\s*\(\s*\)/.test(e)) return 'all';
    if (/^\(?\s*-?\d[\d_]*\s*\)?$/.test(e)) return 'literal';
    const idm = /^([A-Za-z_$][\w$]*)(?:\s*\.\s*length)?$/.exec(e);
    if (idm && depth < 4 && origins.has(idm[1])) return resolve(origins.get(idm[1]), depth + 1);
    return 'unknown';
  };
  return resolve(expr, 0);
}

/** Collect `const|let|var NAME = <rhs>;` assignments appearing before `limit` in `body`. */
function collectOrigins(body, limit) {
  const origins = new Map();
  const re = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=;]+)?=\s*([^;]+);/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    if (m.index >= limit) break;
    origins.set(m[1], m[2]);
  }
  return origins;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * Does `body` await something derived from the loop's per-element accessor?
 * Direct   : `await … .nth(i) …` / `await … [i] …` in one statement.
 * Indirect : `const cells = rows.nth(i).locator('td');` then `await cells.count()`.
 * for-of   : `for (const el of await loc.all())` then `await el.innerText()`.
 */
function awaitsPerElement(body, kind, idxVar) {
  const v = escapeRe(idxVar);
  if (kind === 'for-of') {
    return new RegExp(`await[^;]*\\b${v}\\b`).test(body);
  }
  const accessor = new RegExp(`\\.\\s*nth\\s*\\(\\s*${v}\\s*\\)|\\[\\s*${v}\\s*\\]`);
  // Direct: an await and a per-element accessor inside the same statement.
  for (const stmt of body.split(';')) {
    if (/\bawait\b/.test(stmt) && accessor.test(stmt)) return true;
  }
  // Indirect: a variable bound to the per-element accessor, then awaited.
  const assignRe = new RegExp(`(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*(?::[^=;]+)?=\\s*([^;]*(?:\\.\\s*nth\\s*\\(\\s*${v}\\s*\\)|\\[\\s*${v}\\s*\\])[^;]*);`, 'g');
  let m;
  while ((m = assignRe.exec(body)) !== null) {
    if (new RegExp(`await[^;]*\\b${escapeRe(m[1])}\\b`).test(body)) return true;
  }
  return false;
}

/**
 * Find per-element await loops inside `[from, to)` of the scrubbed source.
 * @returns {Array<{offset: number, boundKind: string, idxVar: string, kind: string}>}
 */
export function findPerElementLoops(scrubbed, fwd, from, to) {
  const found = [];
  const forRe = /\bfor\s*(?:await\s*)?\(/g;
  forRe.lastIndex = from;
  let m;
  while ((m = forRe.exec(scrubbed)) !== null) {
    if (m.index >= to) break;
    const openParen = m.index + m[0].length - 1;
    const closeParen = fwd.get(openParen);
    if (closeParen === undefined || closeParen > to) continue;
    const head = scrubbed.slice(openParen + 1, closeParen);

    let kind = null, idxVar = null, boundExpr = null;
    const c = C_STYLE_HEAD_RE.exec(head);
    if (c) { kind = 'c-style'; idxVar = c[1]; boundExpr = c[2]; }
    else {
      const f = FOR_OF_HEAD_RE.exec(head);
      if (f) { kind = 'for-of'; idxVar = f[1]; boundExpr = f[2]; }
    }
    if (!kind) continue;

    // Loop body: a block, or the single statement that follows.
    let j = closeParen + 1;
    while (j < scrubbed.length && /\s/.test(scrubbed[j])) j++;
    let bodyStart, bodyEnd;
    if (scrubbed[j] === '{') { bodyStart = j; bodyEnd = fwd.get(j) ?? to; }
    else { bodyStart = j; bodyEnd = scrubbed.indexOf(';', j); if (bodyEnd < 0 || bodyEnd > to) bodyEnd = Math.min(j + 400, to); }
    const body = scrubbed.slice(bodyStart, bodyEnd + 1);

    if (!awaitsPerElement(body, kind, idxVar)) continue;

    const origins = collectOrigins(scrubbed.slice(from, to), m.index - from);
    const boundKind = classifyBound(boundExpr, origins);
    found.push({ offset: m.index, boundKind, idxVar, kind });
  }
  return found;
}

// ---------------------------------------------------------------------------------------------
// 5. Budgeted wait regions — expect.poll / waitForFunction / any predicate + `{ timeout }` helper.
// ---------------------------------------------------------------------------------------------

/**
 * A `{ timeout … }` object literal that is a DIRECT argument of the call region (relative paren depth
 * 0, relative brace depth 1). This is what stops a whole `test(...)` block from reading as a budget.
 */
function hasDirectTimeoutArg(region) {
  let paren = 0, brace = 0;
  for (let i = 0; i < region.length; i++) {
    const c = region[i];
    if (c === '(') paren++;
    else if (c === ')') paren--;
    else if (c === '{') brace++;
    else if (c === '}') brace--;
    else if (paren === 0 && brace === 1 && /[A-Za-z_$]/.test(c)) {
      const w = /^[\w$]+/.exec(region.slice(i));
      if (w && w[0] === 'timeout' && /^\s*[:,}]/.test(region.slice(i + w[0].length))) return true;
      if (w) i += w[0].length - 1;
    }
  }
  return false;
}

/** An `=>` that is a direct argument of the call region (not buried inside a nested block). */
function hasDirectArrow(region) {
  let paren = 0, brace = 0;
  for (let i = 0; i < region.length - 1; i++) {
    const c = region[i];
    if (c === '(') paren++;
    else if (c === ')') paren--;
    else if (c === '{') brace++;
    else if (c === '}') brace--;
    else if (c === '=' && region[i + 1] === '>' && paren === 0 && brace === 0) return true;
  }
  return false;
}

/**
 * Find every fixed-timeout wait region: `[start, end]` offsets of the call's argument list.
 * @returns {Array<{callee: string, start: number, end: number}>}
 */
export function findWaitRegions(scrubbed, fwd) {
  const regions = [];
  const callRe = /(?:([A-Za-z_$][\w$]*)\s*\.\s*)?([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = callRe.exec(scrubbed)) !== null) {
    const callee = m[2]; // m[1] is the optional receiver — unused; the callee name is what qualifies.
    if (NOT_A_CALL.has(callee)) continue;
    const openParen = m.index + m[0].length - 1;
    const closeParen = fwd.get(openParen);
    if (closeParen === undefined) continue;
    const region = scrubbed.slice(openParen + 1, closeParen);

    // `.poll(...)` (always `expect.poll`, incl. the `await expect\n  .poll(` line-broken form) and
    // `waitForFunction(...)` are wait budgets by definition — both carry a timeout whether or not one
    // is written out, so an unbounded predicate under either is fatal by construction.
    let qualifies = callee === 'poll' || callee === 'waitForFunction';
    if (!qualifies && !NON_WAIT_CALLEES.has(callee)) {
      qualifies = hasDirectArrow(region) && hasDirectTimeoutArg(region);
    }
    if (!qualifies) continue;
    regions.push({ callee, start: openParen + 1, end: closeParen });
    callRe.lastIndex = m.index + m[0].length; // allow nested regions to be found too
  }
  return regions;
}

/** Same-file method names invoked in `region` — `this.x(` and bare `x(` only (never `other.x(`). */
function calledMethodNames(region, methodNames) {
  const out = new Set();
  const re = /(^|[^.\w$])(?:this\s*\.\s*)?([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(region)) !== null) {
    if (methodNames.has(m[2])) out.add(m[2]);
  }
  // Second pass, not redundant: the first regex consumes a leading separator char, so back-to-back
  // calls like `a(this.b())` can leave no separator for `this.b(` to match against. This pass has no
  // such prefix requirement and recovers those.
  const thisRe = /this\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g;
  while ((m = thisRe.exec(region)) !== null) {
    if (methodNames.has(m[1])) out.add(m[1]);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// 6. The scanner.
// ---------------------------------------------------------------------------------------------

/**
 * Scan one file's source.
 * @param {string} text — file source
 * @returns {{tier1: Array<{line:number,snippet:string,detail:string}>, tier2: Array<{line:number,snippet:string,alsoTier1:boolean}>}}
 */
export function findPerRowAwaits(text) {
  const src = String(text ?? '');
  const scrubbed = scrubSource(src);
  const fwd = bracketMap(scrubbed);
  const starts = lineStarts(src);
  const rawLines = src.split(/\r?\n/);
  const lineOf = (off) => offsetToLine(starts, off);
  const snippetAt = (off) => (rawLines[lineOf(off) - 1] ?? '').trim();
  const exemptAt = (off) => {
    const i = lineOf(off) - 1;
    return EXEMPT_RE.test(rawLines[i] ?? '') || markerInCommentBlockAbove(rawLines, i, EXEMPT_RE);
  };

  const methods = findMethods(scrubbed, fwd);
  const methodNames = new Set(methods.map((m) => m.name));

  // Loops per method, plus loops that live outside any method (top-level helpers, spec bodies).
  const loopsByMethod = new Map();
  const allLoops = [];
  for (const meth of methods) {
    const loops = findPerElementLoops(scrubbed, fwd, meth.bodyStart, meth.bodyEnd);
    loopsByMethod.set(meth.name, loops);
    for (const l of loops) allLoops.push({ ...l, method: meth.name });
  }
  const covered = (off) => methods.some((m) => off >= m.bodyStart && off <= m.bodyEnd);
  for (const l of findPerElementLoops(scrubbed, fwd, 0, scrubbed.length)) {
    if (!covered(l.offset)) allLoops.push({ ...l, method: null });
  }

  // Call graph over same-file methods, then transitive "reaches an unbounded per-element loop".
  const callsOf = new Map();
  for (const meth of methods) {
    callsOf.set(meth.name, calledMethodNames(scrubbed.slice(meth.bodyStart, meth.bodyEnd), methodNames));
  }
  const UNBOUNDED = new Set(['count-uncapped', 'all']);
  const memo = new Map();
  function reachesLoop(name, seen = new Set()) {
    if (memo.has(name)) return memo.get(name);
    if (seen.has(name)) return null;
    seen.add(name);
    const own = (loopsByMethod.get(name) ?? []).find((l) => UNBOUNDED.has(l.boundKind));
    if (own) { memo.set(name, { via: [name], loop: own }); return memo.get(name); }
    for (const callee of callsOf.get(name) ?? []) {
      if (callee === name) continue;
      const r = reachesLoop(callee, seen);
      if (r) { const hit = { via: [name, ...r.via], loop: r.loop }; memo.set(name, hit); return hit; }
    }
    memo.set(name, null);
    return null;
  }

  // TIER 1 — an unbounded per-element loop under a fixed wait budget.
  const tier1 = [];
  const tier1LoopOffsets = new Set();
  for (const region of findWaitRegions(scrubbed, fwd)) {
    const regionText = scrubbed.slice(region.start, region.end);
    // (a) the loop sits inline in the predicate
    for (const l of findPerElementLoops(scrubbed, fwd, region.start, region.end)) {
      if (!UNBOUNDED.has(l.boundKind)) continue;
      if (exemptAt(l.offset) || tier1LoopOffsets.has(l.offset)) continue;
      tier1LoopOffsets.add(l.offset);
      tier1.push({
        line: lineOf(l.offset),
        snippet: snippetAt(l.offset),
        detail: `per-element await loop (bound: ${l.boundKind}) inline in ${region.callee}(…) at line ${lineOf(region.start)}`,
      });
    }
    // (b) the predicate calls a same-file method that transitively contains one
    for (const name of calledMethodNames(regionText, methodNames)) {
      const hit = reachesLoop(name);
      if (!hit) continue;
      if (exemptAt(hit.loop.offset) || tier1LoopOffsets.has(hit.loop.offset)) continue;
      tier1LoopOffsets.add(hit.loop.offset);
      tier1.push({
        line: lineOf(hit.loop.offset),
        snippet: snippetAt(hit.loop.offset),
        detail: `per-element await loop (bound: ${hit.loop.boundKind}) reachable from ${region.callee}(…) at line ${lineOf(region.start)} via ${hit.via.join(' -> ')}`,
      });
    }
  }
  tier1.sort((a, b) => a.line - b.line);

  // TIER 2 — the broader class: uncapped `await …count()`-bounded per-element loops, announce only.
  const tier2 = [];
  const seen2 = new Set();
  for (const l of allLoops) {
    if (l.boundKind !== 'count-uncapped') continue;
    if (seen2.has(l.offset)) continue;
    seen2.add(l.offset);
    tier2.push({ line: lineOf(l.offset), snippet: snippetAt(l.offset), alsoTier1: tier1LoopOffsets.has(l.offset), method: l.method });
  }
  tier2.sort((a, b) => a.line - b.line);

  return { tier1, tier2 };
}

// ---------- file walker ----------
export function walkPageFiles(repoRoot) {
  const out = [];
  const clientsDir = path.join(repoRoot, 'clients');
  if (!fs.existsSync(clientsDir)) return out;
  for (const client of fs.readdirSync(clientsDir)) {
    const pagesRoot = path.join(clientsDir, client, 'src', 'pages');
    if (!fs.existsSync(pagesRoot)) continue;
    walkDir(pagesRoot, out);
  }
  return out;
}

function walkDir(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkDir(full, out); continue; }
    if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
}

/** Page objects + spec files, the two surfaces where a page-driving loop can live. */
export function walkScanFiles(repoRoot) {
  return [...walkPageFiles(repoRoot), ...walkSpecFiles(repoRoot)];
}

export function buildReport({ repoRoot, filePaths }) {
  const files = [];
  let tier1Total = 0;
  let tier2Total = 0;
  for (const full of filePaths) {
    const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
    const { tier1, tier2 } = findPerRowAwaits(fs.readFileSync(full, 'utf8'));
    if (tier1.length || tier2.length) files.push({ file: rel, tier1, tier2 });
    tier1Total += tier1.length;
    tier2Total += tier2.length;
  }
  return { tier1Total, tier2Total, files };
}

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = { repoRoot: DEFAULT_REPO_ROOT, enforce: false, files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--test-root') { out.repoRoot = path.resolve(argv[++i]); continue; }
    if (a === '--file') { out.files.push(path.resolve(argv[++i])); continue; }
    if (a === '--enforce') { out.enforce = true; continue; }
    if (a === '--staged') { continue; } // accepted for pre-commit call parity; full-scan is fast + static
    if (a === '--help' || a === '-h') {
      console.log('Usage: check-per-row-await.mjs [--enforce] [--test-root <dir>] [--file <path>]…');
      process.exit(0);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const adHoc = args.files.length > 0;
  const filePaths = adHoc ? args.files : walkScanFiles(args.repoRoot);

  // VACUOUS-ON-ZERO guard: a check with nothing to check is broken, not passing.
  if (filePaths.length === 0) {
    const clientsDir = path.join(args.repoRoot, 'clients');
    if (!fs.existsSync(clientsDir)) {
      console.error(`[check-per-row-await] FAIL — clients/ directory not found at ${clientsDir}`);
    } else {
      console.error('[check-per-row-await] FAIL — no page-object or spec files found under clients/*/src/pages/ or clients/*/tests/');
    }
    process.exit(1);
  }

  const reportRoot = adHoc ? path.dirname(filePaths[0]) : args.repoRoot;
  const report = buildReport({ repoRoot: reportRoot, filePaths });

  console.error('[check-per-row-await] summary');
  console.error(`  scanned ${filePaths.length} file(s)`);
  console.error(`  TIER 1 (enforced) per-element await loops under a fixed wait budget: ${report.tier1Total}`);
  for (const f of report.files) {
    for (const v of f.tier1) {
      console.error(`  ERROR ${f.file}:${v.line}  ${v.detail}`);
      console.error(`        ${v.snippet}`);
    }
  }
  if (report.tier1Total === 0) {
    console.error('  none — no unbounded per-element read sits under a fixed-timeout wait.');
  }

  console.error(`  TIER 2 (announce only) uncapped await-in-loop over await .count(): ${report.tier2Total}`);
  for (const f of report.files) {
    for (const v of f.tier2) {
      console.error(`  INFO  ${f.file}:${v.line}${v.method ? `  [${v.method}]` : ''}${v.alsoTier1 ? '  (also TIER 1)' : ''}  ${v.snippet}`);
    }
  }
  if (report.tier2Total === 0) {
    console.error('  none — every per-element loop is capped or not count-derived.');
  }

  process.exit(args.enforce && report.tier1Total > 0 ? 1 : 0);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
