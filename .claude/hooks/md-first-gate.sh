#!/usr/bin/env bash
# md-first-gate.sh — PreToolUse write-time hook (matcher: "Edit|Write|NotebookEdit").
#
# Sev=S1 — graduated by the 2026-07-08 MD↔XLSX↔spec parity slip: a spec test()
# whose TC-ID had no MD source row was committed via --no-verify (commit 664ae0cc),
# silently drifting the test-case deliverable from its MD/XLSX source of truth.
#
# Refuses writing a Playwright spec test() whose TC-<MOD>-<SUB>-NNN ID has no
# matching header in the module's MD test-case file. MD-first: the deliverable
# (MD → XLSX) must lead the spec implementation, not trail it.
#
# Mode knob: md_first_mode in .claude/guardrail-config.json (announce|deny|off).
# Fire telemetry: every deny/announce verdict appended to .claude/state/gate-fires.log.
#
# Mechanism mirrors jargon-gate.sh: pipe full stdin JSON to the node checker, emit
# its stdout verbatim. Fail-OPEN if the checker is missing — never wedge a session.
#
# Companion: .claude/hooks/lib/check-md-first.mjs (logic + self-test).

set -u

input=$(cat 2>/dev/null || true)

# Recursive-call guard (defensive — Edit → PreToolUse hook → any tool).
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

lib_path="$(dirname "${BASH_SOURCE[0]}")/lib/check-md-first.mjs"

if [ ! -f "$lib_path" ]; then
  mkdir -p .claude/state 2>/dev/null || true
  printf '%s\n' "$(date -u +%FT%TZ) md-first-gate.sh: lib missing at $lib_path; allowing." \
    >> .claude/state/hook-failures.log 2>/dev/null || true
  exit 0
fi

result=$(printf '%s' "$input" | node "$lib_path" 2>>.claude/state/hook-failures.log || true)

if [ -n "$result" ]; then
  printf '%s' "$result"
fi

exit 0
