#!/usr/bin/env bash
# test-substitution-guard.sh — fire the model-substitution guard on a REAL mismatch.
#
# The guard is an inline block in copilot-worker.sh. This harness EXTRACTS that block
# verbatim from the live file at test time (never a re-implementation — a hand-copied
# guard would prove nothing about the shipped one) and runs it against doctored run dirs.
#
# Extraction anchors: from the `_MODEL_VERIFY_FILE=` assignment through the UNVERIFIED warn.
set -uo pipefail
WRAPPER=".claude/skills/ultra-agents/copilot-worker.sh"
TMP="${TMPDIR:-/tmp}/subguard-$$"
mkdir -p "$TMP"

# --- extract the guard block verbatim -------------------------------------------------
GUARD="$TMP/guard.sh"
# NOTE: the trailing `if [ -z "$_ACTUAL_MODEL" ]` block must be captured THROUGH its closing `fi`.
# Cutting on the UNVERIFIED line leaves an unterminated `if` — the block then dies on a syntax
# error and exits 0, which reads as PASS on every non-firing case. That false green was observed
# on the first run of this harness; the syntax check below is what makes the result trustworthy.
awk '/^_MODEL_VERIFY_FILE=/{f=1} f{print; if(seen && /^fi$/) exit} /MODEL="UNVERIFIED\(\$\{MODEL\}\)"/{seen=1}' \
  "$WRAPPER" > "$GUARD"
LINES=$(wc -l < "$GUARD")
echo "EXTRACTED_GUARD_LINES: $LINES"
if [ "$LINES" -lt 20 ]; then
  echo "FATAL: extraction failed (got $LINES lines) — anchors drifted. Test is INVALID, not passing." >&2
  exit 3
fi
# HARD GATE: the extracted block must be syntactically valid bash. Without this, a truncated
# extraction turns every non-firing case into a fake PASS.
if ! bash -n "$GUARD" 2>"$TMP/synerr"; then
  echo "FATAL: extracted guard is not valid bash — $(cat "$TMP/synerr"). Test is INVALID, not passing." >&2
  exit 3
fi
echo "GUARD_SYNTAX: valid"
grep -q 'SUBSTITUTION_CAUGHT' "$GUARD" || { echo "FATAL: extracted block has no SUBSTITUTION_CAUGHT — wrong slice." >&2; exit 3; }
grep -q 'MULTI_MODEL_CAUGHT'  "$GUARD" || { echo "FATAL: extracted block has no MULTI_MODEL_CAUGHT — wrong slice." >&2; exit 3; }
echo

PASS=0; FAIL=0
run_case() {
  local name="$1" intended="$2" expect_exit="$3" expect_verdict="$4"; shift 4
  local rd="$TMP/$name"; mkdir -p "$rd"
  if [ "$#" -gt 0 ]; then
    : > "$rd/process-test.log"
    for line in "$@"; do printf '%s\n' "$line" >> "$rd/process-test.log"; done
  fi
  local out rc
  out=$( RUN_DIR="$rd" MODEL="$intended" RUN_ID="$name" META="$rd/meta.json" MYLOCK="" \
         bash -c 'RUN_DIR="$RUN_DIR"; MODEL="$MODEL"; RUN_ID="$RUN_ID"; META="$META"; MYLOCK=""; . "$0"; echo "GUARD_PASSED_THROUGH model=$MODEL"' \
         "$GUARD" 2>&1 )
  rc=$?
  local verdict="(none)"
  [ -f "$rd/meta.json" ] && verdict=$(grep -oE '"verdict":"[A-Z_]+"' "$rd/meta.json" 2>/dev/null || echo "(none)")
  local ok=1
  [ "$rc" = "$expect_exit" ] || ok=0
  case "$verdict" in *"$expect_verdict"*) ;; *) [ -n "$expect_verdict" ] && ok=0 ;; esac
  if [ "$ok" = 1 ]; then PASS=$((PASS+1)); echo "PASS  $name  (exit=$rc verdict=$verdict)"
  else FAIL=$((FAIL+1)); echo "FAIL  $name  exit=$rc (want $expect_exit) verdict=$verdict (want $expect_verdict)"; fi
  echo "      guard said: $(printf '%s' "$out" | head -1)"
}

TS='2026-07-25T12:00:00.000Z [INFO] Using model'

echo "=== T1 REAL MISMATCH: log says sonnet-4.5, wrapper intended opus-4.6 ==="
run_case t1-mismatch "claude-opus-4.6" 1 "SUBSTITUTION_CAUGHT" \
  "$TS \"claude-sonnet-4.5\" from custom agent \"council-worker\""

echo
echo "=== T2 HONEST MATCH: log and intent agree (guard must NOT fire) ==="
run_case t2-match "claude-opus-4.6" 0 "" \
  "$TS \"claude-opus-4.6\" from custom agent \"council-worker\""

echo
echo "=== T3 MULTI-MODEL: two distinct models in one log ==="
run_case t3-multi "claude-opus-4.6" 1 "MULTI_MODEL_CAUGHT" \
  "$TS \"claude-opus-4.6\" from custom agent \"council-worker\"" \
  "$TS: claude-haiku-4.5"

echo
echo "=== T4 NO LOG: must warn UNVERIFIED, never silently pass as verified ==="
run_case t4-nolog "claude-opus-4.6" 0 ""

echo
echo "=== T5 SELF-POISONING REGRESSION: guard's own source text in the log must be ignored ==="
run_case t5-poison "claude-opus-4.6" 0 "" \
  "$TS \"claude-opus-4.6\" from custom agent \"council-worker\"" \
  '  "content": "  # 1. Using model \"claude-sonnet-4.5\" from custom agent ..."' \
  '    s/.*Using model[[:space:]]*"\([^"]*\)".*/\1/p; t'

echo
echo "SUBGUARD_RESULT: pass=$PASS fail=$FAIL"
rm -rf "$TMP"
[ "$FAIL" = 0 ]
