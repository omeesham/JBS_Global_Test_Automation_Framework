#!/usr/bin/env node
// test-browsertool-fixtures.mjs — fixture sanity check for check-browsertool.mjs.
//
// Run: node .claude/hooks/lib/test-browsertool-fixtures.mjs
// Exit 1 on any fixture mismatch.
//
// Covers the full decision matrix documented in check-browsertool.mjs:
//   BrowserTool=cli    + chrome tool  → deny
//   BrowserTool=cli    + cli tool     → allow
//   BrowserTool=chrome + cli tool     → deny
//   BrowserTool=chrome + chrome tool  → allow
//   BrowserTool=both                  → allow
//   BrowserTool=none                  → allow
//   missing subplan pointer           → allow
//   subplan missing BrowserTool field → allow
//   override handshake                → allow
//   non-browser tool (Edit, Read)     → allow (short-circuit)
//
// DESIGN: test subplan files are written directly into plans/pending/ with a
// _TEST_BROWSERTOOL_ prefix. We cannot use a fake-repo env override because
// check-browsertool.mjs resolves REPO_ROOT from __dirname with no env escape.
// The _TEST_ prefix keeps them sorted first and easy to grep+delete.
// The finally-block cleanup is MANDATORY — plans:reindex:check complains if
// test files linger after the run.

import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const checker = join(__dirname, "check-browsertool.mjs");

// Build a tmp fake-repo shadow so the checker's findPlanFile() has predictable
// subplan files regardless of whatever exists in the real repo.

const tmpPlansShadow = join(__dirname, "..", "..", "..", "plans", "pending");
const testFiles = [
  {
    name: "_TEST_BROWSERTOOL_CLI.md",
    body: `# Test fixture — BrowserTool=cli\n\n**BrowserTool**: cli\n\nThis file is a test fixture. Safe to delete.\n`,
  },
  {
    name: "_TEST_BROWSERTOOL_CHROME.md",
    body: `# Test fixture — BrowserTool=chrome\n\n**BrowserTool**: chrome\n\nThis file is a test fixture. Safe to delete.\n`,
  },
  {
    name: "_TEST_BROWSERTOOL_BOTH.md",
    body: `# Test fixture — BrowserTool=both\n\n**BrowserTool**: both\n**BrowserToolJustification**: test fixture\n\nThis file is a test fixture. Safe to delete.\n`,
  },
  {
    name: "_TEST_BROWSERTOOL_NONE.md",
    body: `# Test fixture — BrowserTool=none\n\n**BrowserTool**: none\n\nThis file is a test fixture. Safe to delete.\n`,
  },
  {
    name: "_TEST_BROWSERTOOL_MISSING.md",
    body: `# Test fixture — no BrowserTool field\n\n**Status**: Pending\n\nThis file is a test fixture with no BrowserTool frontmatter. Safe to delete.\n`,
  },
];

const createdTestFiles = [];
for (const tf of testFiles) {
  const p = join(tmpPlansShadow, tf.name);
  writeFileSync(p, tf.body);
  createdTestFiles.push(p);
}

// Also ensure a transcript tmp dir.
const dir = mkdtempSync(join(tmpdir(), "bt-fix-"));

let passed = 0;
let failures = 0;

// --- Transcript helpers (same shape as test-identity-switch-fixtures.mjs) ---

function asst(text, tools = []) {
  const content = [{ type: "text", text }];
  for (const t of tools) {
    if (typeof t === "string") content.push({ type: "tool_use", name: t, input: {} });
    else content.push({ type: "tool_use", name: t.name, input: t.input || {} });
  }
  return JSON.stringify({ message: { role: "assistant", content } });
}
function user(text) {
  return JSON.stringify({ message: { role: "user", content: [{ type: "text", text }] } });
}

function runFixture(name, fixture, toolInput, expectDecision) {
  const path = join(dir, `${name}.jsonl`);
  writeFileSync(path, fixture.join("\n"));
  const toolInputArg = JSON.stringify(toolInput).replace(/"/g, '\\"');
  let out;
  try {
    out = execSync(`node "${checker}" "${path}" "${toolInputArg}"`, { encoding: "utf8" }).trim();
  } catch (e) {
    out = `ERROR(${e.message})`;
  }
  let decision = "parse-error";
  try { decision = JSON.parse(out).hookSpecificOutput?.permissionDecision ?? "missing"; } catch { /* */ }
  const ok = decision === expectDecision;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  expect=${expectDecision}  got=${decision}  ${ok ? "" : "raw=" + out}`);
  if (ok) passed++; else failures++;
}

try {
  // === CORE MATRIX ===

  // 1. cli + Chrome MCP → deny
  runFixture("cli_plus_chrome_deny", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting execution."),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: { url: "https://example.com" } },
  "deny");

  // 2. cli + Bash playwright-cli → allow
  runFixture("cli_plus_playwright_cli_allow", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting execution."),
  ],
  { tool_name: "Bash", tool_input: { command: "playwright-cli open https://example.com" } },
  "allow");

  // 3. cli + Bash non-playwright → allow (non-browser Bash ignored)
  runFixture("cli_plus_ls_allow", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting execution."),
  ],
  { tool_name: "Bash", tool_input: { command: "ls -la" } },
  "allow");

  // 4. chrome + Bash playwright-cli → deny
  runFixture("chrome_plus_playwright_cli_deny", [
    user("/execute _TEST_BROWSERTOOL_CHROME.md"),
    asst("Starting execution."),
  ],
  { tool_name: "Bash", tool_input: { command: "playwright-cli snapshot" } },
  "deny");

  // 5. chrome + Chrome MCP → allow
  runFixture("chrome_plus_chrome_allow", [
    user("/execute _TEST_BROWSERTOOL_CHROME.md"),
    asst("Starting execution."),
  ],
  { tool_name: "mcp__Claude_in_Chrome__read_page", tool_input: {} },
  "allow");

  // 6. both + any browser tool → allow
  runFixture("both_plus_chrome_allow", [
    user("/execute _TEST_BROWSERTOOL_BOTH.md"),
    asst("Starting execution."),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "allow");

  runFixture("both_plus_cli_allow", [
    user("/execute _TEST_BROWSERTOOL_BOTH.md"),
    asst("Starting execution."),
  ],
  { tool_name: "Bash", tool_input: { command: "playwright-cli open" } },
  "allow");

  // 7. none + any browser tool → allow
  runFixture("none_plus_chrome_allow", [
    user("/execute _TEST_BROWSERTOOL_NONE.md"),
    asst("Starting execution."),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "allow");

  // === EDGE CASES ===

  // 8. No /execute in transcript → allow (no active subplan)
  runFixture("no_subplan_pointer_allow", [
    user("random chat"),
    asst("sure, let me help."),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "allow");

  // 9. Subplan missing BrowserTool field → allow (fail-open)
  runFixture("missing_field_allow", [
    user("/execute _TEST_BROWSERTOOL_MISSING.md"),
    asst("Starting execution."),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "allow");

  // 10. Non-browser tool (Edit) → allow (short-circuit, class=neither)
  runFixture("non_browser_tool_allow", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting execution."),
  ],
  { tool_name: "Edit", tool_input: { file_path: "scripts/foo.mjs" } },
  "allow");

  // === OVERRIDE HANDSHAKE ===

  // 11. cli + Chrome MCP + override-request + user auth → allow
  runFixture("override_allow", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting execution."),
    asst("[OVERRIDE-REQUEST] need `mcp__Claude_in_Chrome__navigate` for one visual assertion on _TEST_BROWSERTOOL_CLI.md — reason: pixel-blind CLI can't verify this."),
    user("override approved"),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "allow");

  // 12. cli + Chrome MCP + override-request BUT no user auth → deny
  runFixture("override_no_auth_deny", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting execution."),
    asst("[OVERRIDE-REQUEST] need `mcp__Claude_in_Chrome__navigate` — reason: visual."),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "deny");

  // 13. cli + Chrome MCP + user auth BUT no override-request → deny
  runFixture("override_no_request_deny", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting execution."),
    user("override approved"),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "deny");

  // 14. Override request too far in the past (>3 asst turns) → deny
  runFixture("override_stale_deny", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting."),
    asst("[OVERRIDE-REQUEST] for `mcp__Claude_in_Chrome__navigate` on _TEST_BROWSERTOOL_CLI.md."),
    user("override approved"),
    asst("ack."),
    asst("turn 2 after auth."),
    asst("turn 3 after auth."),
    asst("turn 4 after auth."),  // pushes request out of 3-turn window
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "deny");

  // 15. Override request for a DIFFERENT tool/subplan → deny
  runFixture("override_wrong_scope_deny", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting."),
    asst("[OVERRIDE-REQUEST] need to edit scripts/unrelated.mjs — file-write override."),
    user("override approved"),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "deny");

  // === MARKDOWN-WRAPPED OVERRIDE-REQUEST (LR-043 remediation regex fix) ===

  // 16. Blockquoted [OVERRIDE-REQUEST] accepted
  runFixture("override_blockquote_allow", [
    user("/execute _TEST_BROWSERTOOL_CLI.md"),
    asst("Starting."),
    asst("> [OVERRIDE-REQUEST] need mcp__Claude_in_Chrome__navigate for pixel check on _TEST_BROWSERTOOL_CLI.md."),
    user("override approved"),
  ],
  { tool_name: "mcp__Claude_in_Chrome__navigate", tool_input: {} },
  "allow");

  // === PLAYWRIGHT-CLI COMMAND VARIANTS ===

  // 17. chrome + npx playwright-cli → deny
  runFixture("chrome_plus_npx_playwright_cli_deny", [
    user("/execute _TEST_BROWSERTOOL_CHROME.md"),
    asst("Starting."),
  ],
  { tool_name: "Bash", tool_input: { command: "npx playwright-cli snapshot" } },
  "deny");

  // 18. chrome + @playwright/cli → deny
  runFixture("chrome_plus_scoped_pkg_deny", [
    user("/execute _TEST_BROWSERTOOL_CHROME.md"),
    asst("Starting."),
  ],
  { tool_name: "Bash", tool_input: { command: "npx @playwright/cli open" } },
  "deny");

  // 19. chrome + unrelated command containing substring "playwright" → allow
  runFixture("chrome_plus_unrelated_allow", [
    user("/execute _TEST_BROWSERTOOL_CHROME.md"),
    asst("Starting."),
  ],
  { tool_name: "Bash", tool_input: { command: "echo 'my-playwright-clinic'" } },
  "allow");

  console.log("");
  if (failures > 0) {
    console.error(`FAILED — ${passed} passed, ${failures} failed.`);
    process.exit(1);
  }
  console.log(`ALL PASS — ${passed} fixtures.`);
} finally {
  // Clean up test subplan files.
  const { unlinkSync, existsSync } = await import("node:fs");
  for (const p of createdTestFiles) {
    try { if (existsSync(p)) unlinkSync(p); } catch { /* ignore */ }
  }
}
