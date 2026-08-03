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
# HOW TO ENABLE / DISABLE: see docs/read_only_docs/CLI_BROWSER_GUIDE.md §6.4.
#
# Design note: OWNER is not a bypass — BrowserTool is subplan-scoped, not
# identity-scoped. The override handshake is the only bypass path.
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
