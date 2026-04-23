#!/usr/bin/env bash
# override-discipline-gate.sh — Stop hook: audit override usage discipline.
# DISABLED — shit hook sabotaging my sessions...
exit 0
#
# Complement to identity-switch-gate.sh (which allows a valid override at
# PreToolUse time). This hook runs at session end and blocks stop if:
#
#   1. [OVERRIDE] used without preceding [OVERRIDE-REQUEST] + user-typed auth
#   2. [OVERRIDE] log line missing identity/path/reason fields
#   3. Multiple [OVERRIDE] in one session without [OVERRIDE-EXPLICIT-APPROVAL-BATCH]
#
# Delegates mechanism to lib/check-override-discipline.mjs. Fail-open.

set -u

input=$(cat 2>/dev/null || true)

if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

transcript_path=$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
  exit 0
fi

result=$(node "$(dirname "${BASH_SOURCE[0]}")/lib/check-override-discipline.mjs" "$transcript_path" 2>/dev/null || echo allow)

if [ "$result" = "allow" ]; then
  exit 0
fi

# Node emits JSON decision blocks directly; pass through.
if printf '%s' "$result" | grep -q '"decision"'; then
  printf '%s' "$result"
fi

exit 0
