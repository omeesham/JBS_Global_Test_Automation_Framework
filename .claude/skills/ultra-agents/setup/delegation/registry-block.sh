#!/usr/bin/env bash
# registry-block.sh — Dynamic model effort registry for copilot-worker.sh.
#
# USAGE: source this file AFTER MODEL is set; it sets EFFORT_TOP and EFFORT_ARGS.
#   Drop-in replacement for lines 117–139 of copilot-worker.sh (the static case block).
#
# PARSE ANCHOR (verified 2026-07-10 against real gpt-5-mini probe log):
#   Capability form:  "reasoning_effort": [    ← array; items on separate lines
#   Schema decoy:     "reasoning_effort": {    ← JSON-Schema property; ignored
#   Anchor: grep/awk pattern '"reasoning_effort": \[' matches ONLY the array form.
#   The decoy at line 948 of process-1783669002380-4484.log uses { not [ → no false positive.
#
# REGISTRY FILE: model-registry.json (same directory as this script).
#   effort_top is stored directly — no re-parse at dispatch time.
#   probe_dir is an audit anchor; its absence does not block the row.
#
# AUTO-PROBE: _dynreg_auto_probe runs a --log-level debug copilot session for unknown
#   models and appends a new row. Known models (in registry) skip the probe entirely.

_dynreg_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_dynreg_reg="$_dynreg_dir/model-registry.json"

# _dynreg_parse_effort LOG_FILE
# Parses a --log-level debug process log for the model's effort tier array.
# ANCHOR: "reasoning_effort": [   (capability block, array form)
# IGNORE: "reasoning_effort": {   (agent JSON-Schema property, object form — decoy)
# Returns the last element of the array (= highest supported tier), or "none" if absent.
_dynreg_parse_effort() {
  local log_file="$1"
  [ -f "$log_file" ] || { echo "none"; return 0; }

  # Quick gate: if no array form present, return "none" immediately.
  # grep BRE: \[ is literal [; does NOT match { (the schema decoy form).
  if ! grep -q '"reasoning_effort": \[' "$log_file"; then
    echo "none"; return 0
  fi

  # Multi-line awk: collect items between first "reasoning_effort": [ and its closing ].
  # Rule order is deliberate: opening-line rule fires with `next` (skips body), closing-line
  # rule clears `found`, item-line rule accumulates. `last` ends up holding the final tier.
  local top
  top=$(awk '
    /^[[:space:]]*"reasoning_effort": \[/ { found=1; last=""; next }
    found && /^[[:space:]]*\]/ { found=0; next }
    found { v=$0; gsub(/[",[:space:]\r]/, "", v); if (length(v)>0) last=v }
    END { print (length(last)>0 ? last : "none") }
  ' "$log_file")

  echo "${top:-none}"
}

# _dynreg_lookup MODEL
# Returns effort_top from model-registry.json for MODEL, or "" if not found.
_dynreg_lookup() {
  local model="$1"
  [ -f "$_dynreg_reg" ] || { echo ""; return 0; }
  node -e "
    const r = JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));
    const m = (r.models || []).find(x => x.id === process.argv[2]);
    process.stdout.write(m ? m.effort_top : '');
  " "$_dynreg_reg" "$model" 2>/dev/null || echo ""
}

# _dynreg_lookup_context MODEL
# Returns true if model supports long_context per model-registry.json, false otherwise.
_dynreg_lookup_context() {
  local model="$1"
  [ -f "$_dynreg_reg" ] || { echo "false"; return 0; }
  node -e "
    var r = JSON.parse(require(\"fs\").readFileSync(process.argv[1], \"utf8\"));
    var m = (r.models || []).find(function(x){ return x.id === process.argv[2]; });
    process.stdout.write(m && m.supports_long_context === true ? \"true\" : \"false\");
  " "$_dynreg_reg" "$model" 2>/dev/null || echo "false"
}

# _dynreg_parse_long_context LOG_FILE
# Parses a --log-level debug process log for a real long-context capability declaration.
# ANCHOR: "long_context": {   (unescaped capability/pricing block — the genuine declaration)
# IGNORE: escaped long_context nested inside a JSON string, bare mentions, and
#   max_context_window_tokens (window size is not a capability tier — gpt-5-mini 264000 and
#   gpt-5.3-codex 400000 carry no long_context block and are correctly false).
# Same object-vs-decoy discrimination principle as _dynreg_parse_effort above.
# Validated 2026-07-25 against all 8 hand-verified registry rows: 8/8 agreement.
# Returns "true" or "false".
_dynreg_parse_long_context() {
  local log_file="$1"
  [ -f "$log_file" ] || { echo "false"; return 0; }
  if grep -q '"long_context": {' "$log_file"; then echo "true"; else echo "false"; fi
}

# _dynreg_auto_probe MODEL REPO
# Runs a minimal --log-level debug copilot session to discover a new model's effort tiers.
# Parses the resulting process log and appends a new row to model-registry.json.
# Exits 2 if the model is not available (CLI reports unavailability in err.txt).
# BLOCKER: requires `copilot` on PATH with `--log-level debug` support. Confirm flag name
#   from `copilot --help` before first use; the real probe-gpt-5-mini-auto session was
#   run externally — this function has not yet been exercised live (see TEST-EVIDENCE.md §6).
_dynreg_auto_probe() {
  local model="$1"
  local repo="${2:-$REPO}"
  local probe_dir="$HOME/.claude/state/ua-worker/probe-${model}-auto"
  mkdir -p "$probe_dir"

  # Minimal probe: just enough to get the model_capabilities debug block in the log.
  timeout 120 copilot -p "capabilities" -s \
    --model "$model" --log-level debug \
    --log-dir "$probe_dir" \
    --no-remote --no-color --no-ask-user \
    -C "$repo" \
    >/dev/null 2>"$probe_dir/err.txt" || true

  # Detect model-not-available before touching the registry.
  if grep -qiE '(is not available|not found|unknown model)' "$probe_dir/err.txt" 2>/dev/null; then
    grep -iE '(is not available|not found|unknown model)' "$probe_dir/err.txt" >&2
    echo "copilot-worker: auto-probe for '$model' — model not available. Not adding to registry." >&2
    rm -rf "$probe_dir"
    return 2
  fi

  local log_file
  log_file=$(find "$probe_dir" -maxdepth 1 -name "process-*.log" 2>/dev/null | head -1)
  if [ -z "$log_file" ]; then
    echo "copilot-worker: auto-probe for '$model' — no process log found in $probe_dir" >&2
    return 1
  fi

  local effort; effort=$(_dynreg_parse_effort "$log_file")
  local slc;    slc=$(_dynreg_parse_long_context "$log_file")

  # Atomic JSON append (write to tmp then rename).
  local tmp="${_dynreg_reg}.tmp.$$"
  node -e "
    const fs = require('fs');
    const reg = fs.existsSync(process.argv[1])
      ? JSON.parse(fs.readFileSync(process.argv[1], 'utf8'))
      : { version: '1', models: [] };
    const idx = (reg.models || []).findIndex(m => m.id === process.argv[2]);
    const row = {
      id: process.argv[2],
      effort_top: process.argv[3],
      supports_long_context: process.argv[6] === 'true',
      tiers: [],
      probe_dir: process.argv[4],
      note: 'auto-probed ' + new Date().toISOString().slice(0, 10)
    };
    if (idx >= 0) reg.models[idx] = row; else reg.models.push(row);
    fs.writeFileSync(process.argv[5], JSON.stringify(reg, null, 2) + '\n');
  " "$_dynreg_reg" "$model" "$effort" "$probe_dir" "$tmp" "$slc" && mv "$tmp" "$_dynreg_reg"

  echo "copilot-worker: auto-probe for '$model' → effort_top='$effort' (appended to registry)" >&2
  echo "$effort"
}

# ── Main dispatch ────────────────────────────────────────────────────────────
# Resolves EFFORT_TOP and EFFORT_ARGS for the MODEL already set by copilot-worker.sh.
# Mirrors the static case block at lines 117–139 — same variable contract, same exit codes.
#
# Guard: discover.sh sets _disc_source_guard=true before sourcing this file to suppress
# the dispatch block (which requires MODEL to be set). When unset, defaults to false and
# dispatch runs exactly as before — backward-compatible.

if [ "${_disc_source_guard:-false}" != true ]; then

EFFORT_TOP=$(_dynreg_lookup "$MODEL")

if [ -z "$EFFORT_TOP" ]; then
  echo "copilot-worker: '$MODEL' not in dynamic registry — running auto-probe..." >&2
  EFFORT_TOP=$(_dynreg_auto_probe "$MODEL" "${REPO:-$(pwd)}") || {
    echo "copilot-worker: FATAL — '$MODEL' is not in the verified registry and auto-probe failed." \
         "Refusing to dispatch (silent effort-fallback risk). Add a row or probe manually." >&2
    exit 2
  }
fi

if [ -z "$EFFORT_TOP" ]; then
  echo "copilot-worker: FATAL — effort resolution returned empty for '$MODEL'. Refusing to dispatch." >&2
  exit 2
fi

# Caller effort override check — same warning as the static registry.
if [ "${EFFORT_SET:-false}" = true ] && [ "$EFFORT" != "$EFFORT_TOP" ] && [ "$EFFORT_TOP" != "none" ]; then
  echo "copilot-worker: WARNING — '$MODEL' top verified tier is '$EFFORT_TOP', not requested '$EFFORT'" \
       "(CLI would silently degrade). Auto-correcting to '$EFFORT_TOP'." >&2
fi
EFFORT="$EFFORT_TOP"

EFFORT_ARGS=()
[ "$EFFORT" != "none" ] && EFFORT_ARGS=(--effort "$EFFORT")

# Context tier resolution (TICKET-fdle-dispatch-hardening-r1). Registry-driven, not hardcoded.
CONTEXT_ARGS=()
_LONG_CTX=$(_dynreg_lookup_context "$MODEL")
if [ "$_LONG_CTX" = "true" ]; then
  CONTEXT_ARGS=(--context long_context)
fi

fi
