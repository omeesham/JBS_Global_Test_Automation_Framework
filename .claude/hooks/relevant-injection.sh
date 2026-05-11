#!/usr/bin/env bash
# relevant-injection.sh — UserPromptSubmit hook that fires the headless /relevant
# scan and emits its result as `additionalContext` system-reminder injection.
#
# Closes the rule-injection gap that produced the LR-035 reindex miss on
# 2026-05-06: path-scoped rules auto-load when matching files are EDITED, but
# never on the user prompt that PRECEDES the edit. This hook fires on every
# UserPromptSubmit (including mid-task additions like "now also do Y") and
# surfaces the relevant binding LR rules + skills + patterns ahead of any tool
# call in the next assistant turn. Authoritative implementation reference:
# `plans/pending/PLAN_PROMPT_INJECTION_GATE.md`.
#
# Companion pieces:
#   .claude/hooks/lib/relevant-injection.mjs  — does the actual work
#   scripts/run-relevant-scan.mjs              — headless port of /relevant
#
# This bash wrapper:
#   1. captures stdin (Claude Code hook input JSON)
#   2. applies a recursive-call guard (parity with todo-injection-gate.sh)
#   3. delegates to the .mjs lib, passing stdin verbatim
#   4. fail-OPEN — any error logs to .claude/state/hook-failures.log + exit 0
#
# A broken hook MUST NEVER wedge the session.

set -u

input=$(cat 2>/dev/null || true)

# Recursive-call guard. UserPromptSubmit hooks should never receive this flag,
# but we keep it for parity with the rest of the hook family.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

state_dir=".claude/state"
mkdir -p "$state_dir" 2>/dev/null || true
failure_log="$state_dir/hook-failures.log"

if [ -z "${input:-}" ]; then
  exit 0
fi

lib_path=".claude/hooks/lib/relevant-injection.mjs"
if [ ! -f "$lib_path" ]; then
  printf '%s relevant-injection.sh: lib missing at %s; allowing.\n' \
    "$(date -u +%FT%TZ)" "$lib_path" >> "$failure_log" 2>/dev/null || true
  exit 0
fi

result=$(printf '%s' "$input" | node "$lib_path" 2>>"$failure_log" || true)

if [ -n "${result:-}" ]; then
  printf '%s' "$result"
fi

exit 0
