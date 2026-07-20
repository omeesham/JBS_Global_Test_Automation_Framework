#!/usr/bin/env bash
# chain-guards.sh — guard functions for chain orchestrator hook.
# Source chain-state.sh first (this file depends on cs_* helpers).
#
# Public functions:
#   parse_verdict <transcript>      — LAST "## /final-q audit" block's GREEN|YELLOW|RED|NONE
#   check_branch                    — exit 0 if git HEAD matches chain.json .branch
#   check_stop_marker               — exit 0 if chain.STOP absent
#   check_cap <batch|daily|weekly>  — exit 0 if counter < cap
#   check_cli_effort_supports_xhigh — exit 0 if `claude --effort xhigh --help` wouldn't reject
#   map_effort_for_cli <authoring-scale>  — prints CLI --effort value (clamps xhi→high on old CLI)
#   write_pause_notice <reason>     — writes PAUSE_NOTICE.md with diagnostic
#   pause_chain <reason>            — cs_pause + write_pause_notice

set -u

# shellcheck disable=SC1091
source "$(dirname "${BASH_SOURCE[0]}")/chain-state.sh"

# parse_verdict <transcript-path>
# Finds the LAST "## /final-q audit" heading in the transcript and returns
# GREEN|YELLOW|RED from the next ~3000 chars. NONE if no audit heading exists.
# Delegates to node — handles JSONL transcripts (Claude Code stores these) and plain-text fixtures.
# Tolerant to both `**Verdict**: GREEN` and `**Verdict: GREEN**` formats.
parse_verdict() {
  local transcript="$1"
  node "$(dirname "${BASH_SOURCE[0]}")/parse-verdict.mjs" "$transcript"
}

check_branch() {
  local expected current
  expected=$(cs_get .branch 2>/dev/null) || return 1
  current=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)
  [ "$current" = "$expected" ]
}

check_stop_marker() { [ ! -f "$CHAIN_STATE_DIR/chain.STOP" ]; }

check_cap() {
  local kind="$1"
  local counter cap
  case "$kind" in
    batch)
      counter=$(cs_get .budget.executedThisBatch 2>/dev/null)
      cap=$(cs_get .budget.batchCap 2>/dev/null)
      ;;
    daily)
      counter=$(cs_get .budget.executedToday 2>/dev/null)
      cap=$(cs_get .budget.dailyCap 2>/dev/null)
      ;;
    weekly)
      counter=$(cs_get .budget.executedThisWeek 2>/dev/null)
      cap=$(cs_get .budget.weeklyBudget 2>/dev/null)
      ;;
    *)
      echo "check_cap: unknown kind '$kind'" >&2
      return 1
      ;;
  esac
  [ -n "$counter" ] && [ -n "$cap" ] && [ "$counter" -lt "$cap" ]
}

# Detects whether local `claude` CLI accepts --effort xhigh.
# v2.1.111+ supports it for Opus 4.7; older versions hard-error.
check_cli_effort_supports_xhigh() {
  local ver
  ver=$(claude --version 2>/dev/null | awk '{print $1}')
  [ -z "$ver" ] && return 1
  # Parse MAJOR.MINOR.PATCH and compare against 2.1.111
  local major minor patch
  IFS='.' read -r major minor patch <<< "$ver"
  [ "$major" -gt 2 ] && return 0
  [ "$major" -lt 2 ] && return 1
  [ "$minor" -gt 1 ] && return 0
  [ "$minor" -lt 1 ] && return 1
  [ "$patch" -ge 111 ]
}

# Map authoring-scale effort (mid|hi|xhi|max) → CLI --effort value.
# Clamps xhi → high if local CLI doesn't support xhigh (old version).
map_effort_for_cli() {
  local authoring="$1"
  case "$authoring" in
    lo|low) echo "low" ;;
    mid|medium) echo "medium" ;;
    hi|high) echo "high" ;;
    xhi|xhigh)
      if check_cli_effort_supports_xhigh; then
        echo "xhigh"
      else
        echo "high"  # clamp for old CLI; upgrade via `claude update`
      fi
      ;;
    max) echo "max" ;;
    *)   echo "high" ;;  # unknown authoring value → safe default
  esac
}

write_pause_notice() {
  local reason="$1"
  local notice="$CHAIN_STATE_DIR/chain-sessions/PAUSE_NOTICE.md"
  mkdir -p "$(dirname "$notice")"
  local idx current_file current_verdict
  idx=$(cs_get .currentIndex 2>/dev/null || echo '?')
  current_file=$(cs_get ".queue.$idx.file" 2>/dev/null || echo '(unknown)')
  current_verdict=$(cs_get ".queue.$idx.verdict" 2>/dev/null || echo '(none)')
  {
    echo "# Chain PAUSED — $(date -Iseconds)"
    echo ""
    echo "**Reason**: $reason"
    echo "**Current index**: $idx"
    echo "**Last subplan**: $current_file"
    echo "**Last verdict**: $current_verdict"
    echo ""
    echo "## Budget"
    echo "- batch:  $(cs_get .budget.executedThisBatch 2>/dev/null || echo ?) / $(cs_get .budget.batchCap 2>/dev/null || echo ?)"
    echo "- daily:  $(cs_get .budget.executedToday 2>/dev/null || echo ?) / $(cs_get .budget.dailyCap 2>/dev/null || echo ?)"
    echo "- weekly: $(cs_get .budget.executedThisWeek 2>/dev/null || echo ?) / $(cs_get .budget.weeklyBudget 2>/dev/null || echo ?)"
    echo ""
    # Uplink ASK surfacing (PLAN_UPLINK_PROTOCOL P5.3): if the paused subplan's session emitted a
    # structured [UPLINK-ASK] <class>: <one-liner>? marker, surface the QUESTION verbatim so
    # /chain status shows Rutvik the ask, not just a state dump.
    local sesslog="$CHAIN_STATE_DIR/chain-sessions/${current_file}.log"
    local asks=""
    [ -f "$sesslog" ] && asks=$(grep -aoE '\[UPLINK-ASK\][^\r]*' "$sesslog" 2>/dev/null | sort -u)
    if [ -n "$asks" ]; then
      echo "## ASK (from the paused session — answer these, then \`/chain resume\`)"
      printf '%s\n' "$asks" | sed 's/^\[UPLINK-ASK\][[:space:]]*/- /'
      echo ""
    fi
    echo "## To act"
    echo "- \`/chain status\` — view current state"
    echo "- \`/chain resume\` — continue from currentIndex (YELLOW/RED requires \`/chain skip\` first)"
    echo "- \`/chain skip\` — mark current subplan skipped, advance index, stay paused"
    echo "- \`/chain stop\` — abort the chain"
    echo "- \`touch .claude/state/chain.STOP\` — panic-abort on next hook fire"
  } > "$notice"
}

pause_chain() {
  local reason="$1"
  cs_pause "$reason" || true
  write_pause_notice "$reason"
}
