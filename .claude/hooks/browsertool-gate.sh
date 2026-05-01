#!/usr/bin/env bash
# browsertool-gate.sh — PreToolUse hook enforcing `BrowserTool` frontmatter.
#
# STATUS: SHIPS DISABLED in .claude/settings.json (SP-PWC2-06 + LR-043
# remediation discipline). This wrapper + check-browsertool.mjs exist so
# SP-PWC2-07's pilot can flip the hook on after measuring token delta. Do
# NOT enable without running the pilot.
#
# WHAT IT DOES (when enabled):
#   Reads the currently-executing subplan's `**BrowserTool**:` frontmatter
#   (pointer resolved from transcript /execute invocation → chain-sessions
#   log fallback). Denies cross-class browser-tool calls:
#     - BrowserTool=cli    + mcp__Claude_in_Chrome__*  → deny
#     - BrowserTool=chrome + Bash with `playwright-cli` → deny
#     - BrowserTool=both | none → allow (permissive)
#   Override handshake: `[OVERRIDE-REQUEST]` + user-typed `override approved`
#   in last ≤3 assistant turns (mirrors LR-043 pattern, tolerant markdown-
#   wrapper regex).
#
# HOW TO ENABLE (SP-PWC2-07 pilot decides):
#   1. Run parity test: `npm run check:browsertool-parity` → MUST pass.
#   2. Run a pilot module with BrowserTool=both; measure false-positive rate.
#   3. If 0 false-positives, edit .claude/settings.json:
#        hooks.PreToolUse[].hooks[] → add a second entry:
#          { "type": "command", "command": "bash .claude/hooks/browsertool-gate.sh" }
#        Register under matcher "Bash|mcp__Claude_in_Chrome__.*" (exact
#        namespace regex is Claude-Code-specific; confirm syntax in code.claude.com/docs).
#   4. Add a permissions.allow entry for the hook path.
#   5. Re-run pilot subplan to confirm the hook fires + denies correctly.
#   6. Log enablement in the activity log.
#
# HOW TO DISABLE: remove the entry added in step 3. Files stay on disk.
#
# DESIGN LESSONS FROM LR-043 (CLAUDE.md L712+ REMEDIATION NOTICE):
#   - Fail-open on ANY error path — broken hook must not wedge sessions.
#   - Read the CURRENT subplan pointer (transcript /execute scan), NOT an
#     ancestor plan's frontmatter (stale-parent trap from §5 adversarial
#     audit of PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST).
#   - OWNER is not a magic bypass here — BrowserTool is subplan-scoped, not
#     identity-scoped. The override handshake is the only bypass path.
#   - No Stop-mode implementation. Stop-side audit (switch counts, drop
#     logging) lives in /final-q Step 4.5 + chain-orchestrator, not here.
#
# Mechanism identical to identity-switch-gate.sh: extract transcript_path +
# full stdin JSON, hand both to the node checker, emit the checker's stdout
# verbatim. Exit 0 always.

set -u

input=$(cat 2>/dev/null || true)

# Prevent recursive firing (no Stop mode here, but defensive).
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

transcript_path=$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
  exit 0
fi

# PreToolUse input has "tool_name"; hand FULL stdin JSON as argv[3] so the
# checker can see both tool_name and tool_input without extra parsing.
tool_name=$(printf '%s' "$input" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

if [ -z "$tool_name" ]; then
  # Not a PreToolUse event (no tool_name). BrowserTool gate only cares about
  # tool calls; no-op on anything else.
  exit 0
fi

lib_dir="$(dirname "${BASH_SOURCE[0]}")/lib"
result=$(node "$lib_dir/check-browsertool.mjs" "$transcript_path" "$input" 2>/dev/null || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
