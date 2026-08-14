#!/usr/bin/env bash
# visibility-reconcile.sh — Stop-hook wrapper for the invisible-dispatch detective layer.
#
# Fires on:
#   Stop (no matcher — every Stop event)
#     — reconciles dispatch-ledger rows for this session against visible tool-call
#       commands in the transcript. Any ledger row with no matching visible call
#       (matched by run_id one-to-one) is flagged as an invisible dispatch. Rows
#       with no session_id are flagged as unattributed. Persists an alert JSON to
#       .claude/state/invisible-dispatch-alerts-<session_id>.json and emits a loud
#       WARN to stderr. Never blocks (Stop hooks cannot veto — LR-060/LR-069).
#
# Fail-OPEN policy: any error → write reason to .claude/state/hook-failures.log,
# silent exit 0. A broken gate must never wedge the session.
#
# Companion: lib/check-visibility-reconcile.mjs (logic, pure exported functions).

set -u

input=$(cat 2>/dev/null || true)

# Recursive-call guard.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Empty stdin → silent allow.
if [ -z "$input" ]; then exit 0; fi

_fail() {
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) visibility-reconcile.sh: $1; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
}

lib_path="$(dirname "${BASH_SOURCE[0]}")/lib/check-visibility-reconcile.mjs"
if [ ! -f "$lib_path" ]; then _fail "lib missing at $lib_path"; exit 0; fi

result=$(printf '%s' "$input" | node "$lib_path" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s\n' "$result" >&2
fi

exit 0
