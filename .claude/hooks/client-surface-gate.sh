#!/usr/bin/env bash
# client-surface-gate.sh — PreToolUse write-time hook (matcher: "Edit|Write|NotebookEdit").
#
# Sev=S0 — graduated by the 2026-07-30 client-surface bloat measurement: clients/encore/
# contained a self-nested clients/ dir, 26 loose scratch files, five stray .claude/ state
# dirs, and a 418 MB in-place _internal.zip. Nothing noticed for six months.
#
# Denies agent writes to clients/<id>/ that fall outside the declared allowlist or match
# one of four proven deny classes (A1 self-nesting, A2 stray dot-dirs, A3 root loose files,
# A4 in-place archives). A1-A4 are evaluated BEFORE the allowlist.
#
# Mode knob: client_surface_write_mode in .claude/guardrail-config.json (off|announce|deny).
# Env CLIENT_SURFACE_MODE overrides the config file.
# Fire telemetry: every deny/announce verdict appended to .claude/state/gate-fires.log.
#
# Mechanism mirrors md-first-gate.sh: pipe full stdin JSON to the node checker, emit
# its stdout verbatim. Fail-OPEN if the checker is missing — never wedge a session.
#
# Companion: .claude/hooks/lib/check-client-surface-write.mjs (logic + self-test).

set -u

input=$(cat 2>/dev/null || true)

# Recursive-call guard (defensive — Edit → PreToolUse hook → any tool).
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

lib_path="$(dirname "${BASH_SOURCE[0]}")/lib/check-client-surface-write.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) client-surface-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

result=$(printf '%s' "$input" | node "$lib_path" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
