#!/usr/bin/env node
// scripts/ticket-skill-scan.mjs
// Ticket-mode skill scanner for the dispatcher. Reads .claude/skills/INDEX.md
// directly, cross-references the skill-transfer-registry, and returns ONLY
// TRANSFERABLE skills with their TRUE matchType (DIRECT/INFORM/VERIFY/WRAP).
// No cap. Work-type heuristic layer.
//
// Usage:
//   node scripts/ticket-skill-scan.mjs --goal "<text>" [--work-type <type>]
//   node scripts/ticket-skill-scan.mjs --work-type rca [--goal "<text>"]
//
// Output (stdout, exit 0):
//   {
//     "applicable": [
//       {"skill": "/rca", "matchType": "DIRECT", "trigger": "root cause, why is this failing"},
//       {"skill": "/regression-guard", "matchType": "WRAP", "trigger": "any code change"}
//     ],
//     "work_type": "rca",
//     "transferable_count": 2,
//     "total_index_skills": 33
//   }
//
// Deliberately NOT a wrapper around run-relevant-scan.mjs — different contract:
// that scanner caps at TOP_N_SKILLS=4 and forces matchType:"INFORM" (advisory
// context for Claude). This scanner has a ROUTING contract: completeness, no cap,
// true match types for the dispatcher to populate DOCTRINE.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STOPWORDS } from "./lib/stopwords.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

const INDEX_PATH = resolve(REPO_ROOT, ".claude/skills/INDEX.md");
const REGISTRY_PATH = resolve(REPO_ROOT, ".claude/state/ua-worker/skill-transfer-registry.md");

// Code-mutation keywords: trigger the build→/regression-guard heuristic.
// Excludes non-mutating words: deploy, ship, push, release.
const CODE_MUTATION_KEYWORDS = new Set([
  "fix", "implement", "refactor", "create", "edit", "add", "change",
  "modify", "write", "build",
]);

// Research-pattern keywords: trigger the draft→/research heuristic.
const RESEARCH_PATTERN_KEYWORDS = new Set([
  "research", "investigate", "explore", "survey", "unfamiliar", "practices",
]);

// Stopwords imported from scripts/lib/stopwords.mjs

function safeRead(p) {
  try { return readFileSync(p, "utf8"); } catch { return null; }
}

// Tokenize text — identical algorithm to run-relevant-scan.mjs scoreRule().
function tokenize(text) {
  if (!text) return [];
  const raw = text.slice(0, 1000).toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length >= 3 && !STOPWORDS.has(w));
  const seen = new Set();
  const out = [];
  for (const t of raw) {
    if (!seen.has(t)) { seen.add(t); out.push(t); }
  }
  return out;
}

// Expand a single token to stem variants — identical to run-relevant-scan.mjs.
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
  if (t.startsWith("sub") && t.length >= 6) variants.add(t.slice(3));
  if (t.startsWith("re") && t.length >= 5) variants.add(t.slice(2));
  return Array.from(variants);
}

function countDistinctMatches(promptVariants, fieldTokens) {
  if (!fieldTokens || fieldTokens.size === 0) return 0;
  let h = 0;
  const matched = new Set();
  for (const variants of promptVariants) {
    for (const v of variants) {
      if (fieldTokens.has(v) && !matched.has(v)) {
        matched.add(v);
        h++;
        break;
      }
    }
  }
  return h;
}

// Field-weighted scoring — same formula as run-relevant-scan.mjs:
//   score = 3 × titleHits + 2 × triggerHits + 1 × bodyHits
// No pathGlobBonus (skills have no path scope).
function scoreRule(promptVariants, rule) {
  const titleToks = new Set(tokenize(rule.title || ""));
  const trigToks = new Set(tokenize(rule.triggerLine || ""));
  const bodyToks = new Set(tokenize(rule.body || ""));
  const tHits = countDistinctMatches(promptVariants, titleToks);
  const trHits = countDistinctMatches(promptVariants, trigToks);
  const bHits = countDistinctMatches(promptVariants, bodyToks);
  return {
    score: 3 * tHits + 2 * trHits + 1 * bHits,
    hits: tHits + trHits + bHits,
  };
}

// Parse INDEX.md table rows into {skill, triggers, matchType} objects.
// Each table row: | /skill-name | trigger text | MATCHTYPE | auto-calls |
// Some trigger cells contain \| (escaped pipe in markdown) — replace with
// a placeholder before splitting so the column count stays stable.
const PIPE_ESC = "\x00P\x00";
function parseIndexSkills(content) {
  const skills = [];
  const validMatchTypes = new Set(["DIRECT", "INFORM", "VERIFY", "WRAP"]);
  for (const line of content.split("\n")) {
    if (!line.startsWith("| /")) continue;
    const safeLine = line.replace(/\\\|/g, PIPE_ESC);
    const parts = safeLine.split("|").map((s) => s.replace(/\x00P\x00/g, "|").trim()).filter(Boolean);
    if (parts.length < 3) continue;
    const skill = parts[0];
    const triggers = parts[1];
    const matchType = parts[2];
    if (!skill.startsWith("/")) continue;
    if (!validMatchTypes.has(matchType)) continue;
    skills.push({ skill, triggers, matchType });
  }
  return skills;
}

// Parse registry to collect TRANSFERABLE skill names (section after
// "### TRANSFERABLE skills" header, up to the next "###" section).
function loadTransferableSkills(content) {
  const transferable = new Set();
  let inTransferable = false;
  for (const line of content.split("\n")) {
    if (/^###\s+TRANSFERABLE\s+skills/.test(line)) {
      inTransferable = true;
      continue;
    }
    if (inTransferable && /^###/.test(line)) {
      inTransferable = false;
    }
    if (inTransferable) {
      // Match rows: | N | `/skill-name` | description |
      const m = line.match(/\|\s*`(\/[^`]+)`\s*\|/);
      if (m) transferable.add(m[1]);
    }
  }
  return transferable;
}

function parseArgs() {
  let goal = "";
  let workType = "";
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith("--goal=")) goal = a.slice("--goal=".length);
    else if (a === "--goal" && process.argv[i + 1] !== undefined) goal = process.argv[++i];
    else if (a.startsWith("--work-type=")) workType = a.slice("--work-type=".length);
    else if (a === "--work-type" && process.argv[i + 1] !== undefined) workType = process.argv[++i];
  }
  return { goal, workType };
}

function main() {
  const { goal, workType } = parseArgs();

  const indexContent = safeRead(INDEX_PATH);
  if (!indexContent) {
    process.stderr.write(`ticket-skill-scan: FATAL: INDEX.md not found: ${INDEX_PATH}\n`);
    process.exit(1);
  }

  const registryContent = safeRead(REGISTRY_PATH);
  if (!registryContent) {
    process.stderr.write(`ticket-skill-scan: FATAL: registry not found: ${REGISTRY_PATH}\n`);
    process.exit(1);
  }

  const allSkills = parseIndexSkills(indexContent);
  const transferableNames = loadTransferableSkills(registryContent);
  const transferableSkills = allSkills.filter((s) => transferableNames.has(s.skill));

  const goalTokens = tokenize(goal);
  const goalVariants = goalTokens.map(expandToken);

  const applicable = [];
  const seen = new Set();

  // Keyword scoring pass — no cap, true matchType from INDEX.
  if (goalVariants.length > 0) {
    const scored = transferableSkills.map((s) => {
      const { score, hits } = scoreRule(goalVariants, {
        title: s.skill,
        triggerLine: s.triggers,
        body: "",
      });
      return { ...s, score, hits };
    });
    scored.sort((a, b) => b.score - a.score || a.skill.localeCompare(b.skill));
    for (const s of scored) {
      if (s.hits >= 1 && !seen.has(s.skill)) {
        seen.add(s.skill);
        applicable.push({
          skill: s.skill,
          matchType: s.matchType,
          trigger: s.triggers.split(",")[0].trim(),
        });
      }
    }
  }

  // Work-type heuristic layer.
  if (workType === "rca") {
    // Always include /rca for rca work-type.
    if (!seen.has("/rca")) {
      const sk = transferableSkills.find((s) => s.skill === "/rca");
      if (sk) {
        seen.add("/rca");
        applicable.unshift({ skill: "/rca", matchType: sk.matchType, trigger: sk.triggers.split(",")[0].trim() });
      }
    }
  }

  if (workType === "build") {
    // Include /regression-guard ONLY when goal contains a code-mutation keyword.
    // Excludes: deploy, ship, push, release.
    const hasMutation = goalTokens.some((t) => CODE_MUTATION_KEYWORDS.has(t));
    if (hasMutation && !seen.has("/regression-guard")) {
      const sk = transferableSkills.find((s) => s.skill === "/regression-guard");
      if (sk) {
        seen.add("/regression-guard");
        applicable.push({ skill: "/regression-guard", matchType: sk.matchType, trigger: sk.triggers.split(",")[0].trim() });
      }
    }
  }

  if (workType === "draft") {
    // Include /research when goal contains research-pattern keywords.
    const hasResearch = goalTokens.some((t) => RESEARCH_PATTERN_KEYWORDS.has(t));
    if (hasResearch && !seen.has("/research")) {
      const sk = transferableSkills.find((s) => s.skill === "/research");
      if (sk) {
        seen.add("/research");
        applicable.push({ skill: "/research", matchType: sk.matchType, trigger: sk.triggers.split(",")[0].trim() });
      }
    }
  }

  process.stdout.write(
    JSON.stringify({
      applicable,
      work_type: workType,
      transferable_count: applicable.length,
      total_index_skills: allSkills.length,
    })
  );
}

main();
