#!/usr/bin/env bash
# jargon-gate.sh — PreToolUse wrapper for the LR-058 write-time jargon gate.
#
# Fires on PreToolUse (matcher: "Edit|Write|NotebookEdit"). Passes the harness
# stdin JSON to .claude/hooks/lib/check-jargon.mjs, which DENIES the write when
# the new content of an isClientShipping() file carries internal jargon
# (MARKER_GREP_CLIENT_ONLY + SOURCE_COMMENT_JARGON from scripts/lib/forbidden-patterns.mjs).
# Framework-internal paths (.claude/, plans/, specs_planning/, pipeline/, scripts/, root)
# are not shippable → never scanned. Scrubs (jargon in old content only) always pass.
#
# Fail-OPEN: any error → reason appended to .claude/state/hook-failures.log, allow.
# A broken gate must never wedge the session.
#
# Companion hooks: todo-injection-gate.sh, identity-switch-gate.sh, plan-closure-gate.sh.

set -u

input=$(cat 2>/dev/null || true)

# Recursive-call guard (defensive — Edit -> PreToolUse hook -> any tool).
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

lib_path="$(dirname "${BASH_SOURCE[0]}")/lib/check-jargon.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) jargon-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

# Pass full stdin JSON to lib; lib emits the PreToolUse hook-response JSON verbatim.
result=$(printf '%s' "$input" | node "$lib_path" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
