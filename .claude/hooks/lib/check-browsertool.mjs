#!/usr/bin/env node
// check-browsertool.mjs — PreToolUse decision logic for the BrowserTool gate.
//
// Purpose: enforce SP-PWC2-02's `**BrowserTool**:` frontmatter field on the
// currently-executing subplan. If the subplan says `BrowserTool: cli`, deny
// `mcp__Claude_in_Chrome__*` tool calls. If it says `BrowserTool: chrome`,
// deny `Bash` calls whose `command` invokes `playwright-cli`. `both` and
// `none` are permissive.
//
// POSTURE: ships DISABLED in .claude/settings.json per SP-PWC2-06 + the
// LR-043 remediation lesson (CLAUDE.md L712+). Only SP-PWC2-07's pilot
// decides whether to flip it on, after measuring token delta + verifying
// false-positive rate == 0 on one real module.
//
// ARGV contract (mirror of check-identity-switch.mjs):
//   argv[2] = transcript_path (JSONL produced by Claude Code)
//   argv[3] = the FULL PreToolUse stdin JSON (includes tool_name + tool_input)
//   (Stop mode intentionally NOT implemented — BrowserTool is a PreToolUse-only
//   concern; Stop-mode audit lives in /final-q Step 4.5 + chain-orchestrator's
//   verdict parser.)
//
// ACTIVE-SUBPLAN POINTER (avoids the LR-043 stale-parent-frontmatter trap):
//
//   Source-of-truth hierarchy — first hit wins:
//     (1) TRANSCRIPT SCAN — find the most recent user message matching
//         `/execute <SUBPLAN_*.md>` OR the most recent `Skill` tool_use with
//         input.skill === "execute" whose args references a plan file. This
//         covers BOTH interactive /execute AND chain-spawned /execute (the
//         spawned child session's transcript starts with the same /execute
//         invocation).
//     (2) CHAIN-SESSIONS FALLBACK — newest-mtime file matching
//         `.claude/state/chain-sessions/SUBPLAN_*.log` OR `*.md.log`. Only
//         used if the transcript has no /execute invocation (edge: hook
//         fires on the first tool_call BEFORE the agent has emitted any
//         text yet; unlikely for normal sessions but defensive).
//     (3) No pointer → FAIL-OPEN (allow). Hook must not wedge sessions that
//         aren't running under an /execute umbrella. This is deliberate —
//         wrong-tool blast radius is wasted tokens, not data loss
//         (PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md §Enforcement
//         strategy).
//
//   Deliberately NOT used: ancestor-plan frontmatter (LR-043 §5 adversarial
//   audit fixture — "SP-PWC2-06 hook reads stale parent-plan frontmatter");
//   banner text (LR-043 ground-truth lesson — banners are UX, not truth).
//
// OVERRIDE path (mirrors LR-043 handshake, with the tolerant-regex fix that
// accepts markdown-wrapped `[OVERRIDE-REQUEST]` tags):
//   Last ≤3 assistant turns contain `[OVERRIDE-REQUEST]` (line-anchored,
//   markdown-tolerant) referencing EITHER the tool name, the literal phrase
//   "browser tool", OR the subplan file basename; AND a following user turn
//   contains an authorization phrase from OVERRIDE_AUTH_RX.
//
// FAIL-OPEN policy: any parse error, missing file, or ambiguous state →
// emit `permissionDecision: "allow"`. Breaking the hook must never wedge a
// session (LR-043 §A scoping fix preserves this).

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");

// --- Constants / regexes ---

// Allowed BrowserTool frontmatter values (PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST
// §BrowserTool frontmatter field spec). Parity-checked by
// scripts/check-browsertool-parity.mjs against the plan markdown.
export const BROWSERTOOL_VALUES = ["cli", "chrome", "both", "none"];

// Chrome-class tool predicate. Any MCP call in Anthropic's Claude-in-Chrome
// namespace counts. Preview MCP (`mcp__Claude_Preview__*`) is intentionally
// excluded — it's a dev-server inspector, orthogonal to the CLI-vs-Chrome
// choice (CLI_BROWSER_GUIDE.md §1). Playwright MCP
// (`mcp__plugin_playwright_playwright__*`) is ALSO excluded — it's the
// retiring path per LR-038 v2; the hook doesn't gate a dying tool.
const CHROME_MCP_RX = /^mcp__Claude_in_Chrome__/;

// Playwright-CLI predicate. Matches the binary name in Bash `command` input.
// Accepts both the global binary (`playwright-cli <cmd>`) and `npx`-invoked
// forms (`npx playwright-cli <cmd>`, `npx @playwright/cli <cmd>`).
// Trailing \b on both alternatives rejects `playwright-clinic` and
// `@playwright/client`. Leading \b only on `playwright-cli` — `@` is a
// non-word char so `\b@` is the WRONG anchor; the `@` itself is
// distinctive enough that accidental substring match is near-zero.
const PLAYWRIGHT_CLI_RX = /(?:\bplaywright-cli\b|@playwright\/cli\b)/;

// Same tolerant regex as check-identity-switch.mjs (LR-043 remediation —
// accepts markdown wrappers: backticks, blockquote, bullet, emphasis).
const OVERRIDE_REQUEST_RX = /(?:^|\n)[\s`>*_-]*\[OVERRIDE-REQUEST\][\s`]*\S/;
const OVERRIDE_AUTH_RX = /\b(override approved|override ok|approve override|authorized to override|i authorize|you are authorized)\b/i;

// User-message /execute invocation. Case-sensitive on the slash-command;
// matches any `.md` file after `/execute ` (relative path or bare filename).
// Deliberately permissive on the filename prefix — SUBPLAN_* and PLAN_* are
// conventions, not a guaranteed naming rule, and the downstream frontmatter
// lookup already fails-open if the file doesn't exist or lacks BrowserTool.
const EXECUTE_PLAN_RX = /\/execute\s+(?:\S*?\/)?([A-Za-z0-9_][A-Za-z0-9_.-]*\.md)\b/;

// --- Entry (script-mode only) ---
//
// Guard: when this module is imported (e.g. by scripts/check-browsertool-parity.mjs
// for the BROWSERTOOL_VALUES export), the top-level logic MUST NOT run — it
// calls process.exit() and would terminate the importer prematurely. The
// self-path match pattern is identical to scripts/identity-ownership.mjs L273.

const __filename = fileURLToPath(import.meta.url).replace(/\\/g, "/");
const invokedPath = process.argv[1] ? process.argv[1].replace(/\\/g, "/") : "";
const runAsMain = invokedPath === __filename || invokedPath.endsWith("/check-browsertool.mjs");

if (runAsMain) {
  main();
}

function main() {
  const transcript = process.argv[2];
  const toolInputJson = process.argv[3];

  if (!transcript || !existsSync(transcript) || !toolInputJson) {
    emitAllow();
    return;
  }

  let messages;
  try {
    const raw = readFileSync(transcript, "utf8");
    messages = [];
    for (const line of raw.split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        const msg = obj.message ?? obj;
        if (msg && msg.role) messages.push(msg);
      } catch { /* skip unparseable lines */ }
    }
  } catch {
    emitAllow();
    return;
  }

  let toolInput;
  try {
    toolInput = JSON.parse(toolInputJson);
  } catch {
    emitAllow();
    return;
  }

  const toolName = toolInput.tool_name || toolInput.name || "";
  const input = toolInput.tool_input || toolInput.input || {};

  // Early exit: if the tool isn't browser-class at all, don't even bother
  // resolving the active subplan. Cheap path for the hot loop (most
  // PreToolUse invocations aren't browser tools).
  const toolClass = classifyTool(toolName, input);
  if (toolClass === "neither") {
    emitAllow();
    return;
  }

  // Resolve active subplan.
  const activeSubplan = resolveActiveSubplan(messages);
  if (!activeSubplan) {
    // No /execute umbrella detected. Fail-open — hook is opt-in enforcement
    // scoped to chain/execute sessions, not ad-hoc chat.
    emitAllow("no-active-subplan");
    return;
  }

  // Read subplan frontmatter for BrowserTool value.
  const browserTool = readBrowserToolField(activeSubplan.path);
  if (!browserTool) {
    emitAllow("subplan-missing-browsertool-field");
    return;
  }

  if (browserTool === "both" || browserTool === "none") {
    emitAllow(`BrowserTool=${browserTool}`);
    return;
  }

  // Deny-table:
  //   BrowserTool=cli    + toolClass=chrome → deny
  //   BrowserTool=chrome + toolClass=cli    → deny
  // Everything else allowed.
  if (browserTool === "cli" && toolClass === "chrome") {
    if (hasOverrideAuthorization(messages, activeSubplan.basename, toolName)) {
      emitAllow(`[OVERRIDE] ${toolName} authorized — user-typed approval matched`);
      return;
    }
    emitDeny({
      browserTool,
      toolClass: "Chrome MCP",
      toolName,
      subplan: activeSubplan.basename,
    });
    return;
  }

  if (browserTool === "chrome" && toolClass === "cli") {
    if (hasOverrideAuthorization(messages, activeSubplan.basename, toolName)) {
      emitAllow(`[OVERRIDE] playwright-cli authorized — user-typed approval matched`);
      return;
    }
    emitDeny({
      browserTool,
      toolClass: "Playwright CLI",
      toolName,
      subplan: activeSubplan.basename,
      command: input.command,
    });
    return;
  }

  // Class matches subplan's declared tool (cli+cli or chrome+chrome) → allow.
  emitAllow(`BrowserTool=${browserTool}, tool matches class`);
}

// --- Helpers ---

function classifyTool(toolName, input) {
  if (CHROME_MCP_RX.test(toolName)) return "chrome";
  if (toolName === "Bash") {
    const cmd = typeof input.command === "string" ? input.command : "";
    if (PLAYWRIGHT_CLI_RX.test(cmd)) return "cli";
  }
  return "neither";
}

// Resolves the active-subplan pointer. Returns { path, basename } or null.
function resolveActiveSubplan(messages) {
  // (1) Transcript scan: most recent user /execute invocation, or Skill
  //     tool_use with skill=execute.
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const t = textOf(msg.content);
    const m = EXECUTE_PLAN_RX.exec(t);
    if (m) {
      const planBasename = basename(m[1]);
      const resolved = findPlanFile(planBasename);
      if (resolved) return { path: resolved, basename: planBasename };
    }
    // Also scan tool_use content on assistant turns — /execute invoked via Skill.
    if (msg.role === "assistant" && Array.isArray(msg.content)) {
      for (const c of msg.content) {
        if (c?.type === "tool_use" && c.name === "Skill" && c.input?.skill === "execute") {
          const args = String(c.input.args || "");
          const mm = EXECUTE_PLAN_RX.exec("/execute " + args);
          if (mm) {
            const planBasename = basename(mm[1]);
            const resolved = findPlanFile(planBasename);
            if (resolved) return { path: resolved, basename: planBasename };
          }
        }
      }
    }
  }

  // (2) chain-sessions/*.log fallback — newest-mtime file.
  const chainDir = join(REPO_ROOT, ".claude", "state", "chain-sessions");
  if (existsSync(chainDir)) {
    try {
      const entries = readdirSync(chainDir)
        .filter((f) => f.endsWith(".log"))
        .map((f) => ({ f, mtime: statSync(join(chainDir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      if (entries.length > 0) {
        // Filename format: <SUBPLAN_BASENAME>.md.log (see chain-orchestrator.sh L134).
        const planBasename = entries[0].f.replace(/\.log$/, "");
        const resolved = findPlanFile(planBasename);
        if (resolved) return { path: resolved, basename: planBasename };
      }
    } catch { /* fall through */ }
  }

  return null;
}

function findPlanFile(planBasename) {
  // Look under plans/pending then plans/done.
  const candidates = [
    join(REPO_ROOT, "plans", "pending", planBasename),
    join(REPO_ROOT, "plans", "done", planBasename),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

// Extract BrowserTool frontmatter value. Accepts both `**BrowserTool**: cli`
// (bold) and `BrowserTool: cli` (plain) inside a leading markdown metadata
// block. Case-insensitive on the value; normalized to lowercase.
function readBrowserToolField(planPath) {
  let raw;
  try { raw = readFileSync(planPath, "utf8"); } catch { return null; }
  // Only scan the top ~80 lines — frontmatter lives at the head of the file.
  const head = raw.split(/\r?\n/).slice(0, 120).join("\n");
  const m = /(?:^|\n)\s*\*{0,2}BrowserTool\*{0,2}\s*:\s*([A-Za-z]+)\s*(?:\n|$)/.exec(head);
  if (!m) return null;
  const v = m[1].trim().toLowerCase();
  return BROWSERTOOL_VALUES.includes(v) ? v : null;
}

function hasOverrideAuthorization(messages, subplanBasename, toolName) {
  let sawRequest = false;
  let sawAuth = false;
  let asstTurnCount = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      asstTurnCount++;
      if (asstTurnCount > 3) break;
      const t = textOf(msg.content);
      if (OVERRIDE_REQUEST_RX.test(t)) {
        // The override must reference either the tool namespace, the literal
        // phrase "browser tool", or the subplan basename. This avoids
        // accidentally activating on an identity-gate [OVERRIDE-REQUEST] for
        // a file-write that happens to be in the same turn window.
        if (
          t.includes(toolName) ||
          /browser\s+tool/i.test(t) ||
          t.includes(subplanBasename)
        ) {
          sawRequest = true;
        }
      }
    } else if (msg.role === "user") {
      const t = textOf(msg.content);
      if (OVERRIDE_AUTH_RX.test(t)) sawAuth = true;
    }
    if (sawRequest && sawAuth) return true;
  }
  return false;
}

function textOf(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  let out = "";
  for (const c of content) {
    if (typeof c === "string") { out += c + "\n"; continue; }
    if (c?.type === "text" && typeof c.text === "string") out += c.text + "\n";
  }
  return out;
}

function emitAllow(reason) {
  const out = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
    },
  };
  if (reason) out.hookSpecificOutput.permissionDecisionReason = reason;
  process.stdout.write(JSON.stringify(out));
}

function emitDeny({ browserTool, toolClass, toolName, subplan, command }) {
  const cmdDetail = command ? ` (command: \`${command.slice(0, 80)}${command.length > 80 ? "..." : ""}\`)` : "";
  const reason =
    `[BROWSERTOOL-GATE] Subplan ${subplan} declares BrowserTool=${browserTool}, ` +
    `but the pending call is ${toolClass} (${toolName})${cmdDetail}. ` +
    `Per LR-038 v2 + SP-PWC2-06, this is a wrong-tool call. ` +
    `Options: (1) use the correct transport — ${browserTool === "cli" ? "Playwright CLI via Bash" : "Claude in Chrome MCP"}; ` +
    `(2) if the task genuinely needs the other tool, log ` +
    `\`[BROWSER-SWITCH] from=${browserTool} to=${browserTool === "cli" ? "chrome" : "cli"} reason=<one-line>\` ` +
    `in the activity log and either edit the subplan to \`BrowserTool: both\` (+ BrowserToolJustification) OR split into two subplans; ` +
    `(3) one-shot override: emit \`[OVERRIDE-REQUEST]\` referencing this tool or subplan, then ask the user to type "override approved" in chat before retrying. ` +
    `See docs/read_only_docs/CLI_BROWSER_GUIDE.md §6.3.`;
  const out = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(out));
}
