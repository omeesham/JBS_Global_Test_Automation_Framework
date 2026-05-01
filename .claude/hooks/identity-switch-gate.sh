#!/usr/bin/env bash
# identity-switch-gate.sh — dual-mode hook for identity enforcement.
#
# Fires on:
#   PreToolUse (matcher: "Edit|Write|NotebookEdit|MultiEdit")
#     — denies writes where the target path is outside the ground-truth
#       identity's §2 ownership, unless a valid override is in transcript.
#   Stop
#     — detects banner drift (banner text ≠ last /identity Skill invocation)
#       or identity switch without Step 6.5 Constraint Extract emission.
#
# Ground-truth identity = last `Skill` tool_use invoking "identity" in the
# transcript. Banner text is UX-only; does NOT constrain writes.
#
# Mechanism delegated to `lib/check-identity-switch.mjs`. This shell wrapper:
#   1. Skips on stop_hook_active=true (prevents infinite loops — Stop mode).
#   2. Extracts transcript_path + tool_input from stdin JSON.
#   3. Invokes node helper; emits its stdout verbatim as the hook response.
#
# Fail-open on any error — broken gate must never wedge the session.
#
# To disable: remove the matching entry from .claude/settings.json or rename
# this file. Companion hook: chain-orchestrator.sh (final-q-gate.sh,
# rubber-stamp-gate.sh, override-discipline-gate.sh removed 2026-04-23).

set -u

input=$(cat 2>/dev/null || true)

# Prevent recursive stop-hook firing.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

transcript_path=$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
  exit 0
fi

# Detect mode: PreToolUse input has "tool_name", Stop input does not.
# Extract the tool portion if present (compact-json form passed through
# Claude Code hook harness).
tool_name=$(printf '%s' "$input" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)

lib_dir="$(dirname "${BASH_SOURCE[0]}")/lib"

if [ -n "$tool_name" ]; then
  # PreToolUse: pass full stdin JSON as argv[3].
  result=$(node "$lib_dir/check-identity-switch.mjs" "$transcript_path" "$input" 2>/dev/null || true)
  if [ -n "$result" ]; then
    # check-identity-switch.mjs emits full JSON on deny; short JSON on allow.
    # Either way, emit verbatim. On empty (fail-open), let the harness default.
    printf '%s' "$result"
  fi
  exit 0
else
  # Stop mode.
  result=$(node "$lib_dir/check-identity-switch.mjs" "$transcript_path" 2>/dev/null || echo allow)
  if [ "$result" = "allow" ]; then
    exit 0
  fi
  # Node emits a full JSON block for block decisions in Stop mode.
  # If non-JSON "block", construct the reminder here (defensive).
  if printf '%s' "$result" | grep -q '"decision"'; then
    printf '%s' "$result"
  elif [ "$result" = "block" ]; then
    cat <<'JSON'
{"decision": "block", "reason": "Identity gate (Stop) — banner drift or identity switch without Step 6.5 Constraint Extract. See SP-IDS-01 + SP-IDS-03. Ground truth is the last /identity invocation, not the banner text."}
JSON
  fi
  exit 0
fi
