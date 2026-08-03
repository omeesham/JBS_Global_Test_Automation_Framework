#!/usr/bin/env node
// scripts/run-relevant-scan.mjs
// Headless port of /relevant Steps 2.5+2.6+2.7. Scans path-scoped rule packs,
// cross-cutting LEARNED_RULES.md, client-specific CLAUDE.md, agent-mistakes.md,
// patterns.md, and skill triggers against a user prompt; emits structured JSON
// for the UserPromptSubmit hook (.claude/hooks/relevant-injection.sh) to format
// as `additionalContext` system-reminder injection.
//
// Usage:
//   node scripts/run-relevant-scan.mjs --prompt="text"
//   echo '{"prompt":"text"}' | node scripts/run-relevant-scan.mjs
//   node scripts/run-relevant-scan.mjs --self-test
//
// Output (stdout, exit 0):
//   {
//     "binding":   [{"rule":"LR-035","title":"...","why":"...","source":"..."}],
//     "advisory":  [{"tag":"ALL-072","title":"...","why":"..."}],
//     "skills":    [{"name":"/execute","matchType":"INFORM","why":"..."}],
//     "patterns":  [{"name":"...","why":"..."}],
//     "promptKeywords": ["plan","pending","save"],
//     "scanMs": 12
//   }
//
// Fail-safe: any exception writes to stderr, but stdout is always valid JSON
// (empty result on error). Caller (hook) treats empty as no-injection.
//
// Acceptance (per PLAN_PROMPT_INJECTION_GATE Phase 1):
//   `node scripts/run-relevant-scan.mjs --prompt="save plan in pending"`
//   returns JSON whose `binding[]` contains an entry with rule === "LR-035".

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { STOPWORDS } from "./lib/stopwords.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

// Detect direct CLI run vs ES-module import. When this file is `import`ed (e.g.
// from a self-test runner or another tool), we must NOT execute main() — it
// would consume stdin and emit JSON, polluting the importer's stdout.
const IS_DIRECT_RUN =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

const ACTIVE_CLIENT = process.env.ACTIVE_CLIENT || "encore";

// Output caps. Keep injection terse — Claude Code's additionalContext field has
// a 10,000-char cap above which it spills to a file (per UserPromptSubmit docs).
const TOP_N_BINDING = 6;
const TOP_N_ADVISORY = 4;
const TOP_N_SKILLS = 4;
const TOP_N_PATTERNS = 3;
const MIN_HITS = 1;

// Tokenize prompt up to this length (prevents wall-of-text prompts from blowing
// up keyword expansion).
const PROMPT_TOKEN_CAP_CHARS = 1000;

// Common stopwords imported from scripts/lib/stopwords.mjs

function tokenize(text) {
  if (!text) return [];
  const truncated = text.slice(0, PROMPT_TOKEN_CAP_CHARS).toLowerCase();
  // Keep _ and - inside identifiers (plans-reindex, agent-mistakes); strip / . :
  // so paths like plans/pending/ split into ['plans','pending'] and identifiers
  // like INDEX.md split into ['index','md'].
  const raw = truncated
    .replace(/[^a-z0-9_\-\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length >= 3 && !STOPWORDS.has(w));
  // Deduplicate while preserving order.
  const seen = new Set();
  const out = [];
  for (const t of raw) {
    if (!seen.has(t)) { seen.add(t); out.push(t); }
  }
  return out;
}

// Expand a single prompt token to its match-equivalent stem variants.
// Catches plan↔plans, plan↔subplan, spec↔specs, etc., without expensive NLP.
function expandToken(t) {
  const variants = new Set([t]);
  if (t.length >= 4) {
    if (t.endsWith("s")) variants.add(t.slice(0, -1));
    else variants.add(t + "s");
  }
  if (t.length >= 5) {
    if (t.endsWith("ed")) variants.add(t.slice(0, -2));
    if (t.endsWith("ing")) variants.add(t.slice(0, -3));
  }
  // Stem-match for common compound prefixes.
  if (t.startsWith("sub") && t.length >= 6) variants.add(t.slice(3));
  if (t.startsWith("re") && t.length >= 5) variants.add(t.slice(2));
  return Array.from(variants);
}

function safeRead(p) {
  try { return readFileSync(p, "utf8"); } catch { return ""; }
}

// --- rule parsers -----------------------------------------------------------

// Parse LR-NNN / LR-ENC-NNN blocks from a markdown chunk.
function parseLrBlocks(md) {
  const out = [];
  const headRe = /^#{2,4}\s+(LR-(?:ENC-)?\d+)\s*[:\-—]\s*([^\n]+)$/gm;
  const heads = [];
  let m;
  while ((m = headRe.exec(md)) !== null) {
    heads.push({ idx: m.index, id: m[1], title: m[2].trim() });
  }
  for (let i = 0; i < heads.length; i++) {
    const start = heads[i].idx;
    const end = i + 1 < heads.length ? heads[i + 1].idx : md.length;
    const body = md.slice(start, end);
    const trig = body.match(/\*\*Trigger\*\*:\s*([^\n]+)/);
    out.push({
      id: heads[i].id,
      title: heads[i].title,
      triggerLine: trig ? trig[1].trim() : "",
      body: body.slice(0, 800),
    });
  }
  return out;
}

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const fm = {};
  const body = m[1];
  const desc = body.match(/^description:\s*(.+)$/m);
  if (desc) fm.description = desc[1].trim();
  const pathsMatch = body.match(/^paths:\s*\n((?:\s*-\s*.+\n?)+)/m);
  if (pathsMatch) {
    fm.paths = pathsMatch[1]
      .split("\n")
      .map((l) => l.match(/^\s*-\s*"?([^"\s]+)"?\s*$/))
      .filter(Boolean)
      .map((mm) => mm[1].trim());
  }
  return fm;
}

function loadPathScopedRules() {
  const dir = join(REPO_ROOT, ".claude", "rules");
  if (!existsSync(dir)) return [];
  const out = [];
  for (const fname of readdirSync(dir)) {
    if (!fname.endsWith(".md")) continue;
    const md = safeRead(join(dir, fname));
    if (!md) continue;
    const fm = parseFrontmatter(md);
    for (const b of parseLrBlocks(md)) {
      out.push({
        id: b.id,
        title: b.title,
        triggerLine: b.triggerLine,
        body: b.body,
        source: `path-scoped: .claude/rules/${fname}`,
        sourceFile: fname,
        paths: fm.paths || [],
        description: fm.description || "",
      });
    }
  }
  return out;
}

function loadCrossCuttingRules() {
  const md = safeRead(join(REPO_ROOT, "docs", "read_only_docs", "LEARNED_RULES.md"));
  if (!md) return [];
  return parseLrBlocks(md).map((b) => ({
    id: b.id,
    title: b.title,
    triggerLine: b.triggerLine,
    body: b.body,
    source: "cross-cutting: docs/read_only_docs/LEARNED_RULES.md",
    sourceFile: "LEARNED_RULES.md",
    paths: [],
    description: "",
  }));
}

function loadClientRules() {
  const md = safeRead(join(REPO_ROOT, "clients", ACTIVE_CLIENT, "CLAUDE.md"));
  if (!md) return [];
  return parseLrBlocks(md).map((b) => ({
    id: b.id,
    title: b.title,
    triggerLine: b.triggerLine,
    body: b.body,
    source: `client: clients/${ACTIVE_CLIENT}/CLAUDE.md`,
    sourceFile: `clients/${ACTIVE_CLIENT}/CLAUDE.md`,
    paths: [],
    description: "",
  }));
}

function loadAgentMistakes() {
  const md = safeRead(
    join(REPO_ROOT, "clients", ACTIVE_CLIENT, "specs_planning", "_internal", "agent-mistakes.md")
  );
  if (!md) return [];
  // Table rows: | ID | Rule | Resolution |
  const out = [];
  const re =
    /^\|\s*((?:ALL|GEN|HLR|AUD|PLN|REQ|MNT|COP|HUNTER|GIVER)-\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/gm;
  let m;
  while ((m = re.exec(md)) !== null) {
    out.push({
      id: m[1],
      title: m[2].trim().slice(0, 240),
      triggerLine: m[3].trim().slice(0, 240),
      body: "",
      source: "agent-mistakes",
      paths: [],
      description: "",
    });
  }
  return out;
}

function loadPatterns() {
  const md = safeRead(join(REPO_ROOT, ".claude", "context", "patterns.md"));
  if (!md) return [];
  const out = [];
  const headRe = /^##\s+Pattern:\s+(.+)$/gm;
  const heads = [];
  let m;
  while ((m = headRe.exec(md)) !== null) heads.push({ idx: m.index, name: m[1].trim() });
  for (let i = 0; i < heads.length; i++) {
    const start = heads[i].idx;
    const end = i + 1 < heads.length ? heads[i + 1].idx : md.length;
    const body = md.slice(start, end);
    const sig = body.match(/\*\*When you see\*\*[:\*]+\s*([^\n]+)/);
    out.push({
      id: `PAT:${heads[i].name}`,
      name: heads[i].name,
      title: heads[i].name,
      triggerLine: sig ? sig[1].trim() : "",
      body: body.slice(0, 400),
    });
  }
  return out;
}

function loadSkills() {
  const skillsDir = join(REPO_ROOT, ".claude", "skills");
  if (!existsSync(skillsDir)) return [];
  const out = [];
  for (const e of readdirSync(skillsDir)) {
    const sp = join(skillsDir, e, "SKILL.md");
    const md = safeRead(sp);
    if (!md) continue;
    const desc = md.match(/^description:\s*(.+)$/m);
    out.push({ name: `/${e}`, description: desc ? desc[1].trim().slice(0, 240) : "" });
  }
  return out;
}

// --- scoring ---------------------------------------------------------------
//
// Field-weighted scoring (replaces IDF). Title hits matter most because rule
// titles are the most direct semantic signal; trigger lines are next; body
// tokens are noise-prone (precedent text, cross-refs, etc). We tokenize each
// field independently and count distinct prompt-variant matches per field.
//
//   score = 3 × titleHits + 2 × triggerHits + 1 × bodyHits + pathGlobBonus

function countDistinctMatches(promptVariants, fieldTokens) {
  if (!fieldTokens || fieldTokens.size === 0) return 0;
  let h = 0;
  const matched = new Set();
  for (const variants of promptVariants) {
    for (const v of variants) {
      if (fieldTokens.has(v) && !matched.has(v)) {
        matched.add(v);
        h++;
        break; // each prompt token counts once per field
      }
    }
  }
  return h;
}

function scoreRule(promptVariants, rule) {
  // Note: rule.description (path-scoped frontmatter) is intentionally excluded
  // from scoring — it's identical for every rule in the same rule-pack file
  // (e.g., pipeline.md's description is "Plan / subplan authoring + execution
  // + closure discipline" for all of LR-020/027/028/040/...). Including it
  // would uniformly inflate every rule in the pack and starve more-specific
  // matches like LR-035. Path-glob bonus already supplies the surface signal.
  const titleToks = new Set(tokenize(rule.title || ""));
  const trigToks = new Set(tokenize(rule.triggerLine || ""));
  const bodyToks = new Set(tokenize(rule.body || ""));
  const tHits = countDistinctMatches(promptVariants, titleToks);
  const trHits = countDistinctMatches(promptVariants, trigToks);
  const bHits = countDistinctMatches(promptVariants, bodyToks);
  const pb = pathGlobBonus(promptVariants, rule.paths);
  return {
    score: 3 * tHits + 2 * trHits + 1 * bHits + pb,
    hits: tHits + trHits + bHits,
  };
}

// Boost rules whose `paths:` glob references a directory token present in the prompt.
function pathGlobBonus(promptToks, paths) {
  if (!paths || paths.length === 0) return 0;
  const flatPromptTokens = new Set(promptToks.flat());
  for (const g of paths) {
    const segments = g.toLowerCase().split(/[\\/]/).filter((s) => s && !/[*?[\]]/.test(s));
    for (const seg of segments) {
      if (flatPromptTokens.has(seg)) return 2.5;
      const stem = seg.endsWith("s") ? seg.slice(0, -1) : seg + "s";
      if (flatPromptTokens.has(stem)) return 2.0;
    }
  }
  return 0;
}

function shortReason(s) {
  if (!s) return "";
  return s.replace(/\s+/g, " ").trim().slice(0, 180);
}

// --- main scan -------------------------------------------------------------

export function scan(prompt) {
  const promptToks = tokenize(prompt);
  if (promptToks.length === 0) {
    return {
      binding: [],
      advisory: [],
      skills: [],
      patterns: [],
      promptKeywords: [],
      scanMs: 0,
    };
  }
  const t0 = Date.now();
  const promptVariants = promptToks.map(expandToken);

  // --- LR rules (binding) ---
  const lr = [...loadPathScopedRules(), ...loadCrossCuttingRules(), ...loadClientRules()];
  const lrScored = lr.map((r) => ({ ...r, ...scoreRule(promptVariants, r) }));
  const binding = lrScored
    .filter((r) => r.hits >= MIN_HITS || r.score >= 2.5)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, TOP_N_BINDING)
    .map((r) => ({
      rule: r.id,
      title: r.title,
      why: shortReason(r.triggerLine || r.description || r.title),
      source: r.source,
    }));

  // --- agent-mistakes (advisory) ---
  const advisory = loadAgentMistakes()
    .map((r) => ({ ...r, ...scoreRule(promptVariants, r) }))
    .filter((r) => r.hits >= MIN_HITS)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N_ADVISORY)
    .map((r) => ({ tag: r.id, title: r.title.slice(0, 120), why: shortReason(r.triggerLine) }));

  // --- patterns (advisory) ---
  const patterns = loadPatterns()
    .map((p) => ({ ...p, ...scoreRule(promptVariants, p) }))
    .filter((p) => p.hits >= MIN_HITS)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N_PATTERNS)
    .map((p) => ({ name: p.name, why: shortReason(p.triggerLine || p.name) }));

  // --- skills (use name/description as title/trigger surrogates) ---
  const matchedSkills = loadSkills()
    .map((s) => {
      const sr = scoreRule(promptVariants, {
        title: s.name,
        triggerLine: s.description,
        description: "",
        body: "",
        paths: [],
      });
      return { ...s, ...sr };
    })
    .filter((s) => s.hits >= MIN_HITS)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N_SKILLS)
    .map((s) => ({ name: s.name, matchType: "INFORM", why: shortReason(s.description) }));

  return {
    binding,
    advisory,
    skills: matchedSkills,
    patterns,
    promptKeywords: promptToks,
    scanMs: Date.now() - t0,
  };
}

// --- CLI dispatch ----------------------------------------------------------

function readPromptFromStdinOrArg() {
  // --prompt="text" or --prompt text
  for (let i = 0; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith("--prompt=")) return a.slice("--prompt=".length);
    if (a === "--prompt" && process.argv[i + 1]) return process.argv[i + 1];
  }
  // Stdin (JSON or raw text)
  try {
    const raw = readFileSync(0, "utf8");
    if (!raw) return "";
    const trimmed = raw.trim();
    if (trimmed.startsWith("{")) {
      try {
        const obj = JSON.parse(trimmed);
        return obj.prompt || obj.user_prompt || "";
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  } catch {
    return "";
  }
}

function emitEmpty() {
  process.stdout.write(
    JSON.stringify({
      binding: [],
      advisory: [],
      skills: [],
      patterns: [],
      promptKeywords: [],
      scanMs: 0,
    })
  );
}

function main() {
  if (process.argv.includes("--self-test")) {
    runSelfTest();
    return;
  }
  const prompt = readPromptFromStdinOrArg();
  if (!prompt) {
    emitEmpty();
    return;
  }
  try {
    const result = scan(prompt);
    process.stdout.write(JSON.stringify(result));
  } catch (e) {
    process.stderr.write(`run-relevant-scan error: ${e.message}\n`);
    emitEmpty();
  }
}

// --- self-test --------------------------------------------------------------

function runSelfTest() {
  let pass = 0, fail = 0;
  function t(name, fn) {
    try {
      const ok = !!fn();
      if (ok) { pass++; console.log(`PASS ${name}`); }
      else { fail++; console.log(`FAIL ${name}`); }
    } catch (e) {
      fail++; console.log(`FAIL ${name}: ${e.message}`);
    }
  }

  t("tokenize empty prompt", () => tokenize("").length === 0);
  t("tokenize keeps domain tokens", () => {
    const toks = tokenize("save plan in pending");
    return toks.includes("save") && toks.includes("plan") && toks.includes("pending");
  });
  t("tokenize drops stopwords", () => {
    const toks = tokenize("the and or in to for");
    return toks.length === 0;
  });
  t("expandToken plan -> plans", () => {
    return expandToken("plan").includes("plans");
  });
  t("expandToken subplan -> plan stem", () => {
    return expandToken("subplan").includes("plan");
  });
  t("parseLrBlocks finds LR-NNN heading", () => {
    const md = `# foo\n\n## LR-035: plans/INDEX.md is auto-generated\n\nSome text.\n**Trigger**: Any work.\n`;
    const blocks = parseLrBlocks(md);
    return blocks.length === 1 && blocks[0].id === "LR-035";
  });
  t("parseFrontmatter extracts paths", () => {
    const md = `---\ndescription: foo\npaths:\n  - "plans/**/*.md"\n  - ".claude/skills/**/SKILL.md"\n---\n# title`;
    const fm = parseFrontmatter(md);
    return Array.isArray(fm.paths) && fm.paths.includes("plans/**/*.md");
  });

  // Acceptance criterion from PLAN_PROMPT_INJECTION_GATE Phase 1.
  t("scan('save plan in pending') returns LR-035 in binding[]", () => {
    const r = scan("save plan in pending");
    return r.binding.some((b) => b.rule === "LR-035");
  });
  t("scan('save plan in pending') has scanMs >= 0", () => {
    const r = scan("save plan in pending");
    return typeof r.scanMs === "number" && r.scanMs >= 0;
  });
  t("scan empty prompt returns no matches", () => {
    const r = scan("");
    return r.binding.length === 0 && r.advisory.length === 0;
  });
  t("scan returns promptKeywords", () => {
    const r = scan("save plan in pending");
    return r.promptKeywords.includes("plan") && r.promptKeywords.includes("pending");
  });
  t("pathGlobBonus matches plans/** glob via 'plan' stem", () => {
    return pathGlobBonus([["plan", "plans"]], ["plans/**/*.md"]) > 0;
  });
  t("scan('fix the navbar visual') does NOT pull LR-035", () => {
    const r = scan("fix the navbar visual styling");
    // navbar-related prompt should not surface LR-035
    return !r.binding.some((b) => b.rule === "LR-035");
  });
  t("scan does not crash on long prompt", () => {
    const long = "save plan ".repeat(500);
    const r = scan(long);
    return Array.isArray(r.binding);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

if (IS_DIRECT_RUN) main();
