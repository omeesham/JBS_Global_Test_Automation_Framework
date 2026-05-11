#!/usr/bin/env node
// relevant-injection.mjs — the actual work of the UserPromptSubmit hook.
//
// Reads the Claude Code hook stdin JSON, runs the headless /relevant scan
// (`scripts/run-relevant-scan.mjs`) on the user's prompt, formats the structured
// scan result as a Markdown additionalContext block, and emits the hook-protocol
// JSON to stdout per Claude Code's UserPromptSubmit contract:
//
//   { "hookSpecificOutput": {
//       "hookEventName": "UserPromptSubmit",
//       "additionalContext": "...markdown..." } }
//
// Skip rules:
//   1. trivial prompts — fewer than 20 chars AND no action verb → empty stdout
//   2. empty scan result — no matched rules / skills / patterns → empty stdout
//
// Fail-OPEN: any uncaught exception logs to .claude/state/hook-failures.log and
// emits empty stdout (= no injection). Companion bash wrapper exits 0.

import { readFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const STATE_DIR = join(REPO_ROOT, ".claude", "state");
const FAILURE_LOG = join(STATE_DIR, "hook-failures.log");
const SCAN_SCRIPT = join(REPO_ROOT, "scripts", "run-relevant-scan.mjs");

// 10s wall budget — generous; typical scan is <50ms (measured 25ms at v1).
const SCAN_TIMEOUT_MS = 10_000;
// Stay under Claude Code's 10k additionalContext spill threshold with margin.
const CONTEXT_CHAR_CAP = 9000;
// Trivial-prompt threshold.
const TRIVIAL_LEN = 20;

// Action verbs that warrant rule injection even on short prompts.
const ACTION_VERB_RE = /\b(save|fix|add|run|build|edit|move|create|delete|remove|update|deploy|ship|finalize|close|generate|plan|spec|test|review|audit|implement|refactor|migrate|chain|reflect|execute|hook|rule|gate)\b/i;

function logFailure(reason) {
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    appendFileSync(FAILURE_LOG, `${new Date().toISOString()} relevant-injection.mjs: ${reason}\n`);
  } catch {
    // swallow — fail-OPEN must never throw
  }
}

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function parsePayload(raw) {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    logFailure(`stdin JSON parse: ${e.message}`);
    return null;
  }
}

function runScan(prompt) {
  const scanInput = JSON.stringify({ prompt });
  const r = spawnSync("node", [SCAN_SCRIPT], {
    input: scanInput,
    encoding: "utf8",
    timeout: SCAN_TIMEOUT_MS,
    windowsHide: true,
  });
  if (r.error) {
    logFailure(`scan spawn: ${r.error.message}`);
    return null;
  }
  if (r.status !== 0) {
    logFailure(`scan exit ${r.status}: ${(r.stderr || "").slice(0, 300)}`);
    return null;
  }
  if (!r.stdout) return null;
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    logFailure(`scan JSON parse: ${e.message}`);
    return null;
  }
}

function clean(s, max = 200) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function formatInjection(result) {
  const binding = Array.isArray(result.binding) ? result.binding : [];
  const advisory = Array.isArray(result.advisory) ? result.advisory : [];
  const skills = Array.isArray(result.skills) ? result.skills : [];
  const patterns = Array.isArray(result.patterns) ? result.patterns : [];
  const kws = Array.isArray(result.promptKeywords) ? result.promptKeywords.slice(0, 12) : [];

  if (binding.length + advisory.length + skills.length + patterns.length === 0) {
    return "";
  }

  const lines = [];
  lines.push(
    "Framework rule scan (auto-fired on user prompt — /relevant Steps 2.5+2.6+2.7 headless port; PLAN_PROMPT_INJECTION_GATE)."
  );
  if (kws.length) lines.push(`Prompt keywords: ${kws.join(", ")}.`);
  lines.push("");

  if (binding.length) {
    lines.push("Binding LR rules likely active (apply per each rule's Trigger):");
    for (const b of binding) {
      const rule = clean(b.rule, 16);
      const title = clean(b.title, 120);
      const why = clean(b.why, 160);
      const src = clean(b.source, 80);
      const head = `${rule}${src ? ` (${src})` : ""}`;
      lines.push(`- ${head} — ${title}${why ? ` — Trigger: ${why}` : ""}`);
    }
    lines.push("");
  }

  if (skills.length) {
    lines.push("Skills to consider:");
    for (const s of skills) {
      lines.push(`- ${clean(s.name, 32)} (${clean(s.matchType, 16) || "INFORM"}) — ${clean(s.why, 140)}`);
    }
    lines.push("");
  }

  if (patterns.length) {
    lines.push("Decision-tree patterns matching this prompt:");
    for (const p of patterns) {
      lines.push(`- ${clean(p.name, 80)} — ${clean(p.why, 160)}`);
    }
    lines.push("");
  }

  if (advisory.length) {
    lines.push("Agent-mistakes hits (advisory — strong hint, not binding):");
    for (const a of advisory) {
      lines.push(`- ${clean(a.tag, 16)} — ${clean(a.title, 140)}`);
    }
    lines.push("");
  }

  lines.push(
    "Injection is advisory; respect each rule's Trigger condition. Not every listed rule fires for every prompt — read the title + Trigger and apply judgment. Source: PLAN_PROMPT_INJECTION_GATE (closes the LR-035 miss from 2026-05-06)."
  );

  let out = lines.join("\n");
  if (out.length > CONTEXT_CHAR_CAP) {
    out = out.slice(0, CONTEXT_CHAR_CAP) + "\n…[truncated to fit additionalContext cap]";
  }
  return out;
}

function emit(additionalContext) {
  if (!additionalContext) return; // empty stdout = no injection
  const payload = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext,
    },
  };
  process.stdout.write(JSON.stringify(payload));
}

function main() {
  // Self-test mode for ad-hoc verification: `node relevant-injection.mjs --self-test`.
  if (process.argv.includes("--self-test")) {
    runSelfTest();
    return;
  }

  let raw;
  try {
    raw = readStdin();
  } catch (e) {
    logFailure(`readStdin: ${e.message}`);
    return;
  }

  const payload = parsePayload(raw);
  if (!payload) return;

  const prompt = String(payload.prompt || payload.user_prompt || "");
  if (!prompt) return;

  // Trivial prompt skip.
  if (prompt.length < TRIVIAL_LEN && !ACTION_VERB_RE.test(prompt)) {
    return;
  }

  let result;
  try {
    result = runScan(prompt);
  } catch (e) {
    logFailure(`runScan threw: ${e.message}`);
    return;
  }
  if (!result) return;

  const additionalContext = formatInjection(result);
  emit(additionalContext);
}

// --- self-test --------------------------------------------------------------

function runSelfTest() {
  let pass = 0,
    fail = 0;
  function t(name, fn) {
    try {
      const ok = !!fn();
      if (ok) {
        pass++;
        console.log(`PASS ${name}`);
      } else {
        fail++;
        console.log(`FAIL ${name}`);
      }
    } catch (e) {
      fail++;
      console.log(`FAIL ${name}: ${e.message}`);
    }
  }

  t("formatInjection empty result returns empty string", () => {
    const out = formatInjection({ binding: [], advisory: [], skills: [], patterns: [], promptKeywords: [] });
    return out === "";
  });

  t("formatInjection includes LR id + title", () => {
    const out = formatInjection({
      binding: [{ rule: "LR-035", title: "plans/INDEX.md is auto-generated", why: "trigger text", source: "path-scoped: pipeline.md" }],
      advisory: [],
      skills: [],
      patterns: [],
      promptKeywords: ["plan"],
    });
    return out.includes("LR-035") && out.includes("plans/INDEX.md");
  });

  t("formatInjection caps at CONTEXT_CHAR_CAP", () => {
    const big = "x".repeat(20_000);
    const out = formatInjection({
      binding: [{ rule: "LR-035", title: big, why: big, source: big }],
      advisory: [],
      skills: [],
      patterns: [],
      promptKeywords: [],
    });
    return out.length <= CONTEXT_CHAR_CAP + 60;
  });

  t("ACTION_VERB_RE matches 'save plan'", () => ACTION_VERB_RE.test("save plan"));
  t("ACTION_VERB_RE does not match 'ok'", () => !ACTION_VERB_RE.test("ok"));

  t("clean trims and limits", () => {
    return clean("  hello   world  \n\nfoo", 20) === "hello world foo";
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
