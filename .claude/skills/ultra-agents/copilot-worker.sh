#!/usr/bin/env bash
# copilot-worker.sh — LOCAL-ONLY Jr. Worker invocation wrapper (git-excluded; never pushed).
# Deterministic, Windows-safe wrapper around GitHub Copilot CLI headless mode.
# Orchestrator (Opus) calls this; it prints the path to the worker's result on success.
#
# Structural read-only guarantee: Copilot's own docs — "Denial rules always take precedence
# over allow rules, even --allow-all-tools." So read mode = --allow-all-tools (for non-interactive)
# + --deny-tool write + --deny-tool shell  ⇒  worker runs autonomously but CANNOT mutate files.
# Paths are default-confined to cwd (-C repo) + subdirs (no --allow-all-paths).
#
# STALL GUARD — Sev S1 (PLAN_STATIC_TO_DYNAMIC Phase 1 / LR-069 §3.4)
# Graduating incident: tavily-mcp-build-01 killed producing at 600s, 2026-07-10
# Ramp discipline per LR-069 §3.3 (announce → deny): lands WARN-ONLY (STALL_MODE=warn).
# Promote to kill only after ≥20 dispatches with zero false STALL-WARNs on completed runs.
# Config knobs in ~/.claude/delegation/config.json: "STALL_MODE" (warn|kill|off, default warn),
# "STALL_WARN_SECS" (default 300 — 2× the max observed healthy-silent gap of 3–4+ min).
# Liveness = byte-growth of live-output.log (combined stdout+stderr) — NOT process logs
# (--log-dir output freezes after startup and is NOT a valid liveness signal).
#
# Usage:
#   copilot-worker.sh --task <spec-file> [--mode read|edit] [--model <id>] [--effort <lvl>]
#                     [--agent <name>] [--run-id <id>] [--timeout <sec>] [--allow '<pattern>']
#                     --work-type <build|review|verify|draft|rca|walk|probe|research>
#                     [--attempt <N>]
#   --agent <name> loads a role-primed custom agent from ~/.copilot/agents/<name>.agent.md
#     (e.g. council-planner / council-reviewer). When set, custom-instruction loading stays ON
#     (priming needs it), and if --model is NOT given the agent's pinned model (read from the
#     agent file's own `model:` frontmatter) is used.
# Exit: 0 + prints result path on success; 1 on failure (empty/err/timeout); 2 on bad args.
#
# EFFORT (per-model floor — user directive, verified against real CLI capability metadata
# 2026-07-06, `--log-level debug` request logs): the CLI accepts an unsupported --effort value
# WITHOUT erroring and silently substitutes the MODEL'S OWN DEFAULT (observed: claude-opus-4.6 /
# claude-sonnet-4.6 given "--effort xhigh" silently resolved to "defaultReasoningEffort=medium" —
# worse than even "high", and NOT the requested ceiling). Confirmed valid tiers per model
# (from the CLI's own model_capabilities/agent-schema, not assumed):
#   claude-opus-4.6 / claude-sonnet-4.6 : low, medium, high, max   (NO xhigh, NO none)
#   gpt-5.5 / gpt-5.3-codex             : none, low, medium, high, xhigh (NO max)
# So the wrapper computes the correct top tier PER MODEL FAMILY after model resolution — never a
# single blanket value — and auto-corrects (with a stderr warning) if the caller's --effort
# doesn't match the resolved model's family, rather than letting the CLI silently degrade it.
set -uo pipefail

MODE="read"
MODEL="claude-sonnet-4.6"          # default worker model; override per task
EFFORT=""; EFFORT_SET=false        # resolved AFTER model is known — see effort-registry logic below
AGENT=""; MODEL_SET=false
TASK=""; TASK_INLINE=""; RUN_ID=""; TIMEOUT="600"; TIMEOUT_EXPLICIT=0; WORK_TYPE=""
TICKET=""; INTERROGATE=""; QUESTIONS=""
ATTEMPT=1
SESSION_CONTINUE=false; SESSION_CONNECT=""; MAX_CREDITS=""
EXTRA=()
DISPATCHER="CEO"; SESSION_ID=""; PARENT_RUN_ID=""; DEPTH=0  # LCD07: provenance fields

while [ $# -gt 0 ]; do
  case "$1" in
    --task)        TASK="$2"; shift 2;;
    --task-inline) TASK_INLINE="$2"; shift 2;;
    --continue)    SESSION_CONTINUE=true; shift;;
    --connect)     SESSION_CONNECT="$2"; shift 2;;
    --max-credits) MAX_CREDITS="$2"; shift 2;;
    --mode)        MODE="$2"; shift 2;;
    --model)       MODEL="$2"; MODEL_SET=true; shift 2;;
    --effort)      EFFORT="$2"; EFFORT_SET=true; shift 2;;
    --agent)       AGENT="$2"; shift 2;;
    --run-id)      RUN_ID="$2"; shift 2;;
    --timeout)     TIMEOUT="$2"; TIMEOUT_EXPLICIT=1; shift 2;;
    --ticket)      TICKET="$2"; shift 2;;               # ticket mode: prepend DUTY_STACK, route report to delegation/reports
    --interrogate) INTERROGATE="$2"; shift 2;;          # prior run-id whose task+result to re-embed for follow-up questions
    --questions)   QUESTIONS="$2"; shift 2;;            # file of follow-up questions (pairs with --interrogate)
    --allow)       EXTRA+=(--allow-tool "$2"); shift 2;; # narrow extra allow, e.g. 'shell(git log)'
    --work-type)   WORK_TYPE="$2"; shift 2;;             # REQUIRED: work-type for ledger + timeout/effort cap routing
    --attempt)     ATTEMPT="$2"; shift 2;;               # retry ordinal written to ledger (default 1)
    --dispatcher)    DISPATCHER="$2"; shift 2;;    # LCD07: who dispatched (default CEO)
    --session-id)    SESSION_ID="$2"; shift 2;;    # LCD07: Claude session ID (or env CLAUDE_SESSION_ID)
    --parent-run-id) PARENT_RUN_ID="$2"; shift 2;; # LCD07: for bounces/retries
    --depth)         DEPTH="$2"; shift 2;;         # LCD07: nesting depth 0=top
    *) echo "copilot-worker: unknown arg: $1" >&2; exit 2;;
  esac
done

# LCD07: SESSION_ID env fallback (--session-id flag takes precedence)
[ -n "$SESSION_ID" ] || SESSION_ID="${CLAUDE_SESSION_ID:-}"

# ── Phase 0: WORK_TYPE required + enum-validated (PLAN_STATIC_TO_DYNAMIC) ──────────────────────
# Applies to ALL modes (task, ticket, interrogate). A typo like --work-type biuld must never
# fall through the table silently.
_WORK_TYPE_ENUM="build|review|verify|draft|rca|walk|probe|research|orchestrate"
if [ -z "$WORK_TYPE" ]; then
  echo "copilot-worker: --work-type required; valid values: ${_WORK_TYPE_ENUM}" >&2
  exit 2
fi
case "$WORK_TYPE" in
  build|review|verify|draft|rca|walk|probe|research|orchestrate) ;;
  *)
    echo "copilot-worker: unknown --work-type '$WORK_TYPE'; valid values: ${_WORK_TYPE_ENUM}" >&2
    exit 2
    ;;
esac

# ── Provenance warn (announce-only, NEVER deny) — fdle 2026-07-25, Rutvik in-chat GO ───────────
# scripts/check-agent-provenance.mjs PT2 resolves a review back to the run it reviewed via
# parent_run_id (falling back to session_id grouping). Measured 2026-07-25 across 1239 real runs:
# session_id present on 143, parent_run_id on 61, and **100% of review pairs resolved ASSUMED** —
# cross-vendor independence had never been machine-provable, only asserted by the dispatcher.
# Cause was omitted flags at dispatch, not a wrapper bug; these warns make the omission visible at
# the moment it happens. Second-order: with session_id null, PT4 teaming-detection cannot group and
# prints "No single-vendor sessions detected" — a vacuous pass that reads exactly like a clean run.
# Deliberately warn-only: a deny would block dispatch on a bookkeeping field, and LR-069 §3.3
# forbids landing a new S1 gate straight at deny. Purely additive — no control-flow change.
if [ -z "${SESSION_ID:-}" ]; then
  echo "copilot-worker: WARN — no --session-id (and no CLAUDE_SESSION_ID). This run cannot be grouped into a session; provenance teaming-detection (PT4) will pass vacuously for it." >&2
fi
case "$WORK_TYPE" in
  review|verify)
    if [ -z "${PARENT_RUN_ID:-}" ]; then
      echo "copilot-worker: WARN — --work-type '$WORK_TYPE' with no --parent-run-id. The run being reviewed cannot be resolved, so its independence reads as ASSUMED, which is NOT a pass. Pass --parent-run-id <run-id of the work under review>." >&2
    fi
    ;;
esac

# Validate --attempt and --timeout: both must match ^[1-9][0-9]*$ (positive int, no leading zero).
# Guards shell arithmetic below; catches garbage passed via --timeout/--attempt flags (D4).
case "$ATTEMPT" in
  *[!0-9]*|''|0*) echo "copilot-worker: --attempt must be a positive integer (^[1-9][0-9]*\$); got '$ATTEMPT'" >&2; exit 2;;
esac
case "$TIMEOUT" in
  *[!0-9]*|''|0*) echo "copilot-worker: --timeout must be a positive integer (^[1-9][0-9]*\$); got '$TIMEOUT'" >&2; exit 2;;
esac

# ── --ticket + --interrogate setup (unchanged) ─────────────────────────────────────────────────
DUTY_STACK="$HOME/.claude/delegation/DUTY_STACK.md"
TICKET_MODE=false
if [ -n "$TICKET" ]; then
  [ -f "$TICKET" ] || { echo "copilot-worker: --ticket file missing: '$TICKET'" >&2; exit 2; }
  TASK="$TICKET"; TICKET_MODE=true; MODE="edit"
fi

if [ -n "$INTERROGATE" ]; then
  PRIOR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && git rev-parse --show-toplevel 2>/dev/null || pwd)/.claude/state/ua-worker/$INTERROGATE"
  [ -f "$PRIOR_DIR/result.md" ] || { echo "copilot-worker: --interrogate: no result.md for prior run '$INTERROGATE'" >&2; exit 2; }
  [ -n "$QUESTIONS" ] && [ -f "$QUESTIONS" ] || { echo "copilot-worker: --interrogate requires --questions <file>" >&2; exit 2; }
  IQ_DIR="$(dirname "$PRIOR_DIR")/interrogate-$INTERROGATE-$(cat "$QUESTIONS" | wc -c | tr -d ' ')"
  mkdir -p "$IQ_DIR"
  {
    echo "# INTERROGATION of prior run: $INTERROGATE"
    echo; echo "## Original task"; [ -f "$PRIOR_DIR/task.md" ] && cat "$PRIOR_DIR/task.md" || echo "(original task file unavailable)"
    echo; echo "## Prior result"; cat "$PRIOR_DIR/result.md"
    echo; echo "## Follow-up questions to answer"; cat "$QUESTIONS"
  } > "$IQ_DIR/task.md"
  TASK="$IQ_DIR/task.md"
fi

command -v copilot >/dev/null 2>&1 || { echo "copilot CLI not on PATH" >&2; exit 2; }
# Inline mode: skip file check now; TASK will be written to RUN_DIR after REPO/RUN_DIR are computed.
[ -n "$TASK_INLINE" ] || { [ -n "$TASK" ] && [ -f "$TASK" ] || { echo "copilot-worker: --task spec file missing: '$TASK'" >&2; exit 2; }; }
case "$MODE" in read|edit) ;; *) echo "copilot-worker: --mode must be read|edit" >&2; exit 2;; esac

REPO="$(git -C "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" rev-parse --show-toplevel 2>/dev/null || pwd)"
if [ -n "$TASK_INLINE" ]; then
  # Inline mode: derive RUN_ID from text length (no file yet); RUN_DIR created below.
  [ -n "$RUN_ID" ] || RUN_ID="$(node -e "console.log(require('crypto').randomUUID())")" # LCD07: UUID replaces PID-filesize (AH-15)
else
  [ -n "$RUN_ID" ] || RUN_ID="$(node -e "console.log(require('crypto').randomUUID())")" # LCD07: UUID (AH-15)
fi
RUN_DIR="$REPO/.claude/state/ua-worker/$RUN_ID"

# V5 FRESH-FILE GUARANTEE (CHEATPROOF Phase 3): refuse to start if output artifacts already exist.
# Kills the shared-verdict-file collusion vector — no two seats (or a silent retry) can overwrite
# each other's results. Legitimate retries must use --attempt N with a distinct --run-id.
for _chk_f in "$RUN_DIR/result.md" "$RUN_DIR/meta.json"; do
  if [ -f "$_chk_f" ]; then
    echo "copilot-worker: FATAL — output file already exists: $_chk_f (run_id=$RUN_ID). Use a unique run-id per dispatch. Refusing to start." >&2
    exit 2
  fi
done

mkdir -p "$RUN_DIR"
# MF-3: persist inline text to RUN_DIR/task.md so --interrogate rebuilds the brief correctly.
if [ -n "$TASK_INLINE" ]; then
  TASK="$RUN_DIR/task.md"
  printf '%s\n' "$TASK_INLINE" > "$TASK"
fi
RESULT="$RUN_DIR/result.md"; ERR="$RUN_DIR/err.txt"; META="$RUN_DIR/meta.json"
LEDGER="$REPO/.claude/state/ua-worker/ledger.jsonl"

# ── PLAN61 P1c: declared-output parser, hoisted so BOTH the pre-dispatch stub writer and the
# post-run oracle (LEDGER-TRUTH A1) use ONE implementation. Parse rules unchanged: strictly
# anchored to the canonical `OUTPUT (LITERAL ABSOLUTE):` token, Windows paths normalized to POSIX.
_parse_declared_output() {
  local _raw _out _drv
  { [ "$TICKET_MODE" = true ] && [ -n "${TICKET:-}" ] && [ -f "${TICKET:-}" ]; } || return 0
  _raw="$(grep -am1 -E '^[[:space:]]*(\*\*)?OUTPUT \(LITERAL ABSOLUTE\)(\*\*)?[[:space:]]*:' "$TICKET" 2>/dev/null \
    | sed -E 's/^[^:]*:[[:space:]]*//; s/^`//; s/`[[:space:]]*$//; s/[[:space:]]*$//')"
  [ -n "$_raw" ] || return 0
  case "$_raw" in
    /*) _out="$_raw" ;;
    [A-Za-z]:[/\\]*)
      command -v cygpath >/dev/null 2>&1 && _out="$(cygpath -u "$_raw" 2>/dev/null || true)"
      if [ -z "$_out" ]; then
        _drv="$(printf '%s' "$_raw" | cut -c1 | tr 'A-Z' 'a-z')"
        _out="/${_drv}$(printf '%s' "$_raw" | cut -c3- | tr '\\' '/')"
      fi
      ;;
    *) echo "copilot-worker: WARN — OUTPUT (LITERAL ABSOLUTE) is not an absolute path, ignoring: $_raw" >&2; return 0 ;;
  esac
  printf '%s' "$_out"
}

# ── PLAN61 P1c: STEP-0 stub. The largest death class (batch-write / no-deliverable — 164 corrected
# deaths, 139 of them AFTER the 2026-07-17 write-as-you-go doctrine landed) is a worker that reasons
# for twenty minutes and dies before its first write. Prose could not fix it, so the wrapper now
# creates the file itself: "append as you go" needs no file creation, and the dispatcher gets a
# launch-proof artifact within seconds of dispatch.
# The stub marker is DELIBERATELY DISTINCT from the A4 `NO DELIVERABLE` sentinel, and the oracle
# below treats a stub-ONLY file as missing. So Tooth 1 stays falsifiable: a wrapper-written file can
# never read as a delivered artifact, whether the worker replaced the stub or appended beneath it.
# PLAN61 telemetry defaults — every new ledger field has a defined value on EVERY path, so a run
# that skips a phase still records a truthful row rather than an empty/unset one.
MODEL_VERDICT="OK"      # P5: OK | SUSPECT-nested
BOUNCE_READY=""         # P3: path to a queued stall-bounce ticket
DEATH_CLASS=""          # P7: C1..C12 / UNCLASSIFIED, derived only when the run is not ok
NETWORK_RETRY=false     # P4: true when this process was auto-retried after a network death
[ "${_PLAN61_NET_RETRY:-0}" = "1" ] && NETWORK_RETRY=true
_PLAN61_STUB_MARK='copilot-worker: STEP-0 stub'
_DECLARED_EARLY="$(_parse_declared_output)"
if [ -n "$_DECLARED_EARLY" ] && [ ! -e "$_DECLARED_EARLY" ]; then
  mkdir -p "$(dirname "$_DECLARED_EARLY")" 2>/dev/null || true
  printf '<!-- %s (run %s) — REPLACE this line with your report, or APPEND below it. A file left as stub-only is recorded ok=false / no-deliverable. Write your section headings NOW, before any analysis. -->\n' \
    "$_PLAN61_STUB_MARK" "$RUN_ID" > "$_DECLARED_EARLY" 2>/dev/null \
    && echo "copilot-worker: STEP-0 stub written → $_DECLARED_EARLY" >&2
fi

# ── UW: uplink supervisor path vars + fire helper (announce-mode — log-only) ─────────────────
UPLINK_DIR="$HOME/.claude/delegation"
UPLINK_LOG="$UPLINK_DIR/uplink.log"; UPLINK_LEDGER="$UPLINK_DIR/uplink-ledger.jsonl"; UPLINK_CACHE="$UPLINK_DIR/uplink-cache.jsonl"
GATE_FIRES="$REPO/.claude/state/gate-fires.log"
_uplink_fire(){ local _r="$1"; local _t; _t="$(date -Iseconds 2>/dev/null||echo '?')"; mkdir -p "$UPLINK_DIR" "$(dirname "$GATE_FIRES")"; printf 'CONSULT-WOULD-FIRE %s uplink %s run=%s\n' "$_t" "$_r" "$RUN_ID" >>"$UPLINK_LOG"; printf 'uplink,%s,announce,%s\n' "$_t" "$RUN_ID" >>"$GATE_FIRES"; }

# ── UW-1: uplink budget check (announce-mode — log-only, never blocks) ─────────────────────────
if [ "$TICKET_MODE" = true ]; then
  _date_today="$(date -I 2>/dev/null)"
  [[ "$_date_today" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || { echo "copilot-worker: WARNING — date -I returned invalid output; budget check skipped" >&2; _date_today="INVALID_DATE_SENTINEL"; }
  _uplink_today="$(grep -E '"ts"[[:space:]]*:[[:space:]]*"'"$_date_today" "$UPLINK_LEDGER" 2>/dev/null | wc -l | tr -d ' ')"
  _uplink_budget="$(grep -oE '"max_consults_per_day"[[:space:]]*:[[:space:]]*[0-9]+' "$HOME/.claude/delegation/uplink-policy.json" 2>/dev/null | grep -oE '[0-9]+' || echo 20)"
  case "$_uplink_budget" in ''|*[!0-9]*) _uplink_budget=20 ;; esac
  [ "$_uplink_today" -ge "$_uplink_budget" ] && _uplink_fire "budget-would-exceed"
fi

# ── Phase 1: defaults-only timeout table (PLAN_STATIC_TO_DYNAMIC) ──────────────────────────────
# Explicit --timeout ALWAYS wins over this table (TIMEOUT_EXPLICIT=1 short-circuits).
# Table is generous — the stall guard is the precision instrument; the ceiling is the safety net.
if [ "$TIMEOUT_EXPLICIT" = "0" ]; then
  case "$WORK_TYPE" in
    probe|verify)   TIMEOUT=600  ;;
    draft|review)   TIMEOUT=900  ;;
    rca)            TIMEOUT=1200 ;;
    walk)           TIMEOUT=1500 ;;
    build|research) TIMEOUT=1800 ;;
  esac
fi

# ── Phase 1: stall guard config (safe fallbacks when keys absent — same grep pattern as MAX_WORKERS)
_STALL_MODE_RAW="$(grep -oE '"STALL_MODE"[[:space:]]*:[[:space:]]*"[a-z]+"' \
  "$HOME/.claude/delegation/config.json" 2>/dev/null | grep -oE '"[a-z]+"$' | tr -d '"' || true)"
STALL_MODE="${_STALL_MODE_RAW:-warn}"
case "$STALL_MODE" in warn|kill|off) ;; *) STALL_MODE="warn" ;; esac

_STALL_WARN_SECS_RAW="$(grep -oE '"STALL_WARN_SECS"[[:space:]]*:[[:space:]]*[0-9]+' \
  "$HOME/.claude/delegation/config.json" 2>/dev/null | grep -oE '[0-9]+' || true)"
# Config beats env: STALL_WARN_SECS env var is the low-precedence fallback (for test/CI overrides).
# Precedence: config.json value > STALL_WARN_SECS env var > 300 (hard default).
STALL_WARN_SECS="${_STALL_WARN_SECS_RAW:-${STALL_WARN_SECS:-300}}"
case "$STALL_WARN_SECS" in ''|*[!0-9]*) STALL_WARN_SECS=300 ;; esac

# ── LCD04: bounce-specific config (env-overridable — LCD04_CONFIG_PATH for tests) ─────────────────
_LCD04_CFG="${LCD04_CONFIG_PATH:-$HOME/.claude/delegation/config.json}"
STALL_ACTION="$(grep -oE '"stall_guard_action"[[:space:]]*:[[:space:]]*"[a-z+]+"' "$_LCD04_CFG" 2>/dev/null | grep -oE '"[a-z+]+"$' | tr -d '"' || true)"
STALL_ACTION="${STALL_ACTION:-warn}"
STALL_BOUNCE_DELAY="$(grep -oE '"stall_guard_bounce_delay_s"[[:space:]]*:[[:space:]]*[0-9]+' "$_LCD04_CFG" 2>/dev/null | grep -oE '[0-9]+' || true)"
STALL_BOUNCE_DELAY="${STALL_BOUNCE_DELAY:-60}"
case "$STALL_BOUNCE_DELAY" in ''|*[!0-9]*) STALL_BOUNCE_DELAY=60 ;; esac
STALL_MAX_BOUNCES="$(grep -oE '"stall_guard_max_bounces"[[:space:]]*:[[:space:]]*[0-9]+' "$_LCD04_CFG" 2>/dev/null | grep -oE '[0-9]+' || true)"
STALL_MAX_BOUNCES="${STALL_MAX_BOUNCES:-2}"
case "$STALL_MAX_BOUNCES" in ''|*[!0-9]*) STALL_MAX_BOUNCES=2 ;; esac
STALL_QUEUE_DIR="${STALL_QUEUE_DIR:-$HOME/.claude/delegation/stall-queue}"

# Permission profile. Deny precedence makes read mode a hard sandbox.
PERM=(--allow-all-tools)
if [ "$MODE" = "read" ]; then
  PERM+=(--deny-tool write --deny-tool shell)
fi

# Agent priming (council mode). When --agent is set: load the role-primed custom agent AND
# keep custom instructions enabled (drop --no-custom-instructions); let the agent's pinned
# model win unless --model was explicitly given. Resolve the REAL pinned model by reading the
# agent file's own `model:` frontmatter line — needed so the effort-family logic below knows
# what it's actually talking to (a placeholder string like "agent-pinned(x)" can't be classified).
AGENT_ARGS=(); CI_FLAG=(--no-custom-instructions); MODEL_ARGS=(--model "$MODEL")
if [ -n "$AGENT" ]; then
  AGENT_ARGS=(--agent "$AGENT")
  CI_FLAG=()
  # AGENT-MODE --model EXCLUSION (argv hygiene — check-dispatch-argv.mjs enforces this).
  # The CLI ignores --model when --agent is set, using the agent's pin instead (verified
  # 2026-07-22). Passing --model alongside --agent records a model the CLI never ran.
  # The variant path below is the correct mechanism to set the dispatch model.
  MODEL_ARGS=()
  AGENT_FILE="$HOME/.copilot/agents/${AGENT}.agent.md"
  # Death-RCA Fix C (2026-07-24, Rutvik GO, TICKET-death-rca-fixBC): unconditional existence check.
  # Previously only the MODEL_SET=true variant branch checked, so a missing agent file surfaced as
  # the CLI's opaque `No such agent: <name>, available:` (empty list) instead of a clear FATAL here.
  # Graduating deaths: dtemp-draft-review-r1 / r1c (death-rca.md rows 4, 6).
  if [ ! -f "$AGENT_FILE" ]; then
    echo "copilot-worker: FATAL — --agent '$AGENT' given but $AGENT_FILE does not exist. Refusing to dispatch." >&2
    exit 2
  fi
  PINNED_MODEL="$(grep -m1 '^model:' "$AGENT_FILE" 2>/dev/null | sed 's/^model:[[:space:]]*//' | tr -d '\r')"
  # Resolve intended model: explicit --model wins, then agent pin, then placeholder.
  if [ "$MODEL_SET" = false ]; then
    if [ -n "$PINNED_MODEL" ]; then
      MODEL="$PINNED_MODEL"
    else
      MODEL="agent-pinned($AGENT)"
    fi
  fi
  # Force variant for every agent dispatch with a known model. The canonical agent name may
  # be intercepted by CLI built-in defaults (observed: council-worker's claude-sonnet-4.6 pin
  # silently resolved to claude-haiku-4.5). A freshly-written variant routes around this.
  case "$MODEL" in
    agent-pinned\(*\))
      echo "copilot-worker: FATAL — agent '$AGENT' has no model: pin and no --model given. Cannot dispatch under canonical name (prefix-collision risk). Pin a model in $AGENT_FILE or pass --model." >&2
      exit 2
      ;;
    *)
      VARIANT="v--$(printf '%s' "$MODEL" | tr -c 'A-Za-z0-9._-' '-')--${AGENT}"
      VARIANT_FILE="$HOME/.copilot/agents/${VARIANT}.agent.md"
      awk -v m="$MODEL" 'BEGIN{d=0} /^model:/ && !d {print "model: " m; d=1; next} {print}' \
        "$AGENT_FILE" > "$VARIANT_FILE" || {
          echo "copilot-worker: FATAL — could not write variant agent $VARIANT_FILE." >&2; exit 2; }
      _got="$(grep -m1 '^model:' "$VARIANT_FILE" 2>/dev/null | sed 's/^model:[[:space:]]*//' | tr -d '\r')"
      if [ "$_got" != "$MODEL" ]; then
        echo "copilot-worker: FATAL — variant agent $VARIANT_FILE pins '$_got', expected '$MODEL'. Refusing to dispatch." >&2
        exit 2
      fi
      AGENT_ARGS=(--agent "$VARIANT")
      ;;
  esac
fi

# Dynamic model-effort registry. Auto-detects newly-enabled models + their reasoning tiers via a
# one-shot `--log-level debug` capability probe, self-registers them, and serves the verified top
# tier on subsequent dispatches — so a model enabled next month needs no code change here. Fail-closed:
# an unknown model whose tiers cannot be verified hard-exits (2) rather than risking the silent
# effort-fallback bug (opus-4.6 + xhigh → ran at medium). The sourced block sets EFFORT_TOP, applies
# the EFFORT_SET override warning, sets EFFORT, and builds EFFORT_ARGS (omitting --effort for models
# with no reasoning_effort enum, e.g. haiku-4.5). Seed rows + probe evidence live outside the repo:
# ~/.claude/delegation/model-registry.json (verified 2026-07-09/07-10).
_DYNREG_BLOCK="$HOME/.claude/delegation/registry-block.sh"
if [ ! -f "$_DYNREG_BLOCK" ]; then
  echo "copilot-worker: FATAL — model-registry block missing ($_DYNREG_BLOCK). Refusing to dispatch (would risk an unverified-effort fallback)." >&2
  exit 2
fi
# Save the caller's explicit --effort request before the registry block potentially auto-corrects it.
# Used below to promote the registry's "warn + auto-correct" into a hard exit 2 (Phase 2).
_EFFORT_REQUESTED="$EFFORT"
CONTEXT_ARGS=()  # Safe default; overridden by registry-block.sh if model supports long context
# shellcheck source=/dev/null
. "$_DYNREG_BLOCK"

# ── Phase 2: explicit --effort validation (PLAN_STATIC_TO_DYNAMIC) ─────────────────────────────
# The registry block auto-corrects an invalid effort tier with a warning. We promote that to
# exit 2 so the caller gets a hard signal rather than silent effort degradation.
if [ "$EFFORT_SET" = "true" ] && [ -n "$_EFFORT_REQUESTED" ] && [ "$EFFORT" != "$_EFFORT_REQUESTED" ]; then
  echo "copilot-worker: --effort '$_EFFORT_REQUESTED' is not a valid tier for model '$MODEL' (registry resolved to '$EFFORT'); use a valid tier from the model registry or omit to apply the work-type cap default." >&2
  exit 2
fi

# ── Phase 2: work-type effort cap (PLAN_STATIC_TO_DYNAMIC) ─────────────────────────────────────
# Only applies when (a) --effort was NOT explicitly passed, AND (b) the model has a verified effort
# enum (EFFORT_ARGS non-empty — omitted for haiku-4.5 which has no reasoning_effort enum).
# Cap table (research-backed: arxiv 2604.10739 — overthinking degrades accuracy on structured tasks):
#   verify|probe → low    (deterministic spot-checks; minimal reasoning needed)
#   draft        → medium (write-once structured output; top tier is wasteful)
#   all else     → top tier (EFFORT_TOP from registry; no cap applied)
# Tier ordering for cap eligibility: none=0 low=1 medium=2 high=3 max=4 xhigh=4
_tier_rank() { case "$1" in none) echo 0;; low) echo 1;; medium) echo 2;; high) echo 3;; max) echo 4;; xhigh) echo 4;; *) echo 5;; esac; }

if [ "$EFFORT_SET" = "false" ] && [ "${#EFFORT_ARGS[@]}" -gt 0 ]; then
  _cap_effort=""
  case "$WORK_TYPE" in
    verify|probe) _cap_effort="low"    ;;
    draft)        _cap_effort="medium" ;;
    *)            _cap_effort=""       ;;  # top tier — no cap
  esac
  if [ -n "$_cap_effort" ]; then
    # Apply cap only if _cap_effort is a tier the model actually supports (rank ≤ EFFORT_TOP rank)
    if [ "$(_tier_rank "$_cap_effort")" -le "$(_tier_rank "$EFFORT_TOP")" ]; then
      EFFORT="$_cap_effort"
      EFFORT_ARGS=(--effort "$EFFORT")
    fi
  fi
fi

# Ticket mode: prepend the DUTY_STACK contract so the worker inherits the full senior-engineer duty set.
PROMPT="$(cat "$TASK")"
if [ "$TICKET_MODE" = true ] && [ -f "$DUTY_STACK" ]; then
  PROMPT="$(cat "$DUTY_STACK")

---

$PROMPT"
fi

# ── A6b: session continuity args + A6b runaway-cost leash ───────────────────────────────────────
SESSION_ARGS=()
[ "$SESSION_CONTINUE" = "true" ] && SESSION_ARGS+=(--continue)
[ -n "$SESSION_CONNECT" ] && SESSION_ARGS+=(--connect "$SESSION_CONNECT")

# Max-credits: explicit flag wins; fall back to config key MAX_AI_CREDITS; omit if unset.
MAX_CREDITS_ARGS=()
if [ -z "$MAX_CREDITS" ]; then
  MAX_CREDITS="$(grep -oE '"MAX_AI_CREDITS"[[:space:]]*:[[:space:]]*[0-9]+' \
    "$HOME/.claude/delegation/config.json" 2>/dev/null | grep -oE '[0-9]+' || true)"
fi
# ── PLAN61 P2: per-work-type credit FLOOR ──────────────────────────────────────────────────────
# 47 corrected deaths were budget exhaustion, 33 of them AFTER the "estimate x2, floor 250-400"
# doctrine was written down (2026-07-17, re-sharpened 2026-07-24). Prose kept losing because the
# cap is hand-typed at dispatch time. The floor is now mechanical. It only ever RAISES a cap and
# always announces itself — a floor that could kill a dispatch would be a new death class, which is
# precisely what this plan exists to prevent.
# Floors are derived from the corrected census: every post-2026-07-24 C1 death was dispatched below
# these numbers. Keep this block's BEGIN/END markers and one-line format — scripts/dispatch-preflight.mjs
# parses them at runtime rather than keeping a second copy that could drift.
# ── PLAN61-FLOORS-BEGIN ──
#   build:250 research:250 rca:250 walk:250 orchestrate:250 review:200 verify:100 probe:100 draft:100
# ── PLAN61-FLOORS-END ──
_credit_floor() {
  case "$1" in
    build|research|rca|walk|orchestrate) echo 250 ;;
    review)                              echo 200 ;;
    verify|probe|draft)                  echo 100 ;;
    *)                                   echo 100 ;;
  esac
}
BUDGET_FLOORED=false
_p61_floor="$(_credit_floor "$WORK_TYPE")"
case "$MAX_CREDITS" in
  ''|*[!0-9]*) _p61_given="" ;;   # unset or non-numeric — treat as absent, never arithmetic-error
  *)           _p61_given="$MAX_CREDITS" ;;
esac
if [ -z "$_p61_given" ] || [ "$_p61_given" -lt "$_p61_floor" ]; then
  echo "copilot-worker: BUDGET-FLOOR: raised ${_p61_given:-unset}→${_p61_floor} for work-type '${WORK_TYPE}' (PLAN61 P2)" >&2
  MAX_CREDITS="$_p61_floor"
  BUDGET_FLOORED=true
fi
[ -n "$MAX_CREDITS" ] && MAX_CREDITS_ARGS=(--max-ai-credits "$MAX_CREDITS")

# ── UW-2: advisory inject — prepend ## ADVISORY (BINDING) when present (announce-mode) ─────────
if [ -f "$RUN_DIR/advisory.md" ]; then
  PROMPT="## ADVISORY (BINDING)
$(cat "$RUN_DIR/advisory.md")

---

$PROMPT"
  _uplink_fire "advisory-injected"
fi

# Global concurrency cap (MAX_WORKERS, default 5): atomic mkdir slot-lock with PID + run-id, stale
# cleanup (>timeout+120s), bounded wait. mkdir is atomic on Windows/git-bash — no lockfile race.
LOCKROOT="$HOME/.claude/delegation/locks"
MAX_WORKERS="$(grep -oE '"MAX_WORKERS"[[:space:]]*:[[:space:]]*[0-9]+' "$HOME/.claude/delegation/config.json" 2>/dev/null | grep -oE '[0-9]+' || echo 5)"
# /ultra-agents boost (Rutvik-approved 2026-07-09): goal-scoped env override lifts the cap for THIS
# dispatch only — hard ceiling 20, non-numeric ignored. The skill invocation is the approval; the
# boost dies naturally when Claude stops prefixing dispatches (goal lapse). Base config stays 5.
if [ -n "${UA_MAX_WORKERS:-}" ]; then
  case "$UA_MAX_WORKERS" in
    ''|*[!0-9]*) : ;;
    *)
      BOOST="$UA_MAX_WORKERS"
      [ "$BOOST" -gt 20 ] && BOOST=20
      if [ "$BOOST" -gt "$MAX_WORKERS" ]; then
        MAX_WORKERS="$BOOST"
        echo "copilot-worker: worker cap boosted to $MAX_WORKERS for this dispatch (ultra, ceiling 20)" >&2
      fi
      ;;
  esac
fi
mkdir -p "$LOCKROOT"
MYLOCK=""
acquire_slot() {
  local waited=0 stale=$((TIMEOUT + 120))
  while :; do
    for d in "$LOCKROOT"/slot-*; do
      [ -d "$d" ] || continue
      local born; born="$(cat "$d/born" 2>/dev/null || echo 0)"
      local now; now="$(date +%s 2>/dev/null || echo 0)"
      [ "$now" -gt 0 ] && [ "$born" -gt 0 ] && [ $((now - born)) -gt "$stale" ] && rm -rf "$d" 2>/dev/null
    done
    local n; n="$(ls -d "$LOCKROOT"/slot-* 2>/dev/null | wc -l | tr -d ' ')"
    if [ "$n" -lt "$MAX_WORKERS" ]; then
      MYLOCK="$LOCKROOT/slot-$$-$RUN_ID"
      if mkdir "$MYLOCK" 2>/dev/null; then
        printf '%s\n' "$(date +%s 2>/dev/null || echo 0)" > "$MYLOCK/born"
        printf 'pid=%s run=%s\n' "$$" "$RUN_ID" > "$MYLOCK/who"
        return 0
      fi
    fi
    sleep 3; waited=$((waited + 3))
    if [ "$waited" -ge "$stale" ]; then
      echo "copilot-worker: WARNING — waited ${waited}s for a free worker slot (cap=$MAX_WORKERS); proceeding without a slot." >&2
      return 1
    fi
  done
}
# D8: CLI-drift sentinel — the Copilot CLI self-updates; a renamed/removed flag would break every
# dispatch silently. Capture the version each run (cheap); only on a CHANGE re-verify the flags this
# wrapper depends on still exist in --help. Warn LOUDLY, never block (the CLI's own unknown-flag error
# is the fail-closed backstop; this is the early-warning layer).
_cli_ver_file="$HOME/.claude/delegation/cli-version.txt"
_cli_ver_now="$(copilot --version 2>/dev/null | head -1)"
_cli_ver_prev="$(cat "$_cli_ver_file" 2>/dev/null || echo "")"
if [ -n "$_cli_ver_now" ] && [ "$_cli_ver_now" != "$_cli_ver_prev" ]; then
  _cli_help="$(copilot --help 2>/dev/null)"
  _cli_missing=""
  for _f in -p --model --effort --context --deny-tool --allow-tool --no-remote --log-dir --agent; do
    printf '%s' "$_cli_help" | grep -q -- "$_f" || _cli_missing="$_cli_missing $_f"
  done
  if [ -n "$_cli_missing" ]; then
    echo "copilot-worker: WARNING — CLI version changed ($_cli_ver_prev -> $_cli_ver_now) and REQUIRED flags MISSING from --help:$_cli_missing — dispatch may break; verify the wrapper against the new CLI." >&2
  else
    echo "copilot-worker: note — CLI version changed ($_cli_ver_prev -> $_cli_ver_now); all required flags still present." >&2
  fi
  mkdir -p "$(dirname "$_cli_ver_file")"; printf '%s\n' "$_cli_ver_now" > "$_cli_ver_file"
fi

acquire_slot || true
trap '[ -n "$MYLOCK" ] && rm -rf "$MYLOCK" 2>/dev/null' EXIT

# ── C3: Write-time prefix-collision assertion (TICKET-fdle-p1-prefix-kill) ──────────────────────
# Before every dispatch: if the name about to be passed to --agent is a prefix of any OTHER agent
# file, hard-exit naming both. Structural — a fix that can silently regress is not structural.
_dispatch_name=""
if [ "${#AGENT_ARGS[@]}" -gt 0 ]; then _dispatch_name="${AGENT_ARGS[1]}"; fi
if [ -n "$_dispatch_name" ]; then
  for _af in "$HOME/.copilot/agents/"*.agent.md; do
    [ -f "$_af" ] || continue
    _an="$(basename "$_af" .agent.md)"
    [ "$_an" = "$_dispatch_name" ] && continue
    case "$_an" in "${_dispatch_name}"*)
      echo "copilot-worker: FATAL — prefix collision: '--agent $_dispatch_name' is a prefix of agent '$_an'. The CLI would resolve to the wrong agent. Refusing to dispatch." >&2
      exit 2 ;; esac
  done
fi

# ── Phase 1: background dispatch + foreground watchdog (PLAN_STATIC_TO_DYNAMIC) ───────────────
# Dispatch runs in the background. The watchdog runs in the MAIN shell so EXIT_REASON and
# STALL_WARNS are modifiable without inter-process communication.
#
# Liveness = combined byte-growth of live-output.log (stdout+stderr merged via process
# substitution) checked against last snapshot. Copilot stdout is BURSTY — healthy workers can
# be silent 3–4+ min; N=300s (STALL_WARN_SECS) is 2× the observed worst-case healthy gap.
# --log-dir process logs freeze after startup and are NOT a valid liveness signal.
#
# D1: process-group kill — TERM to the group → 10s bounded wait → KILL -9 to group.
# setsid (preferred): creates a new session; $DISPATCH_PID == PGID leader → kill -- -$PID targets group.
# job_control (fallback): set -m places each bg job in a new process group; PID == PGID leader.
# none (last resort): plain TERM+KILL on single PID — children of a TERM-ignoring leader may survive.
_pg_mode="none"
if command -v setsid >/dev/null 2>&1; then
  _pg_mode="setsid"
elif (set -m; true) 2>/dev/null; then
  _pg_mode="job_control"
fi

LIVE_LOG="$RUN_DIR/live-output.log"
STALL_LOG="$RUN_DIR/stall.log"
STALL_WARNS=0
EXIT_REASON="success"

START_TS="$(date -Iseconds 2>/dev/null || date -u '+%Y-%m-%dT%H:%M:%SZ')" # LCD07: wall-clock start
_secs_start=$(date +%s)

# _kill_dispatch: TERM to process group → 10s bounded wait → KILL -9.
# Negative-PID form (kill -- -PGID) is safe because both setsid and job_control modes
# guarantee $DISPATCH_PID is the PGID leader of the dispatched process tree.
_kill_dispatch() {
  case "$_pg_mode" in
    setsid|job_control)
      kill -TERM -- "-$DISPATCH_PID" 2>/dev/null || kill -TERM "$DISPATCH_PID" 2>/dev/null || true
      local _kw=0
      while kill -0 "$DISPATCH_PID" 2>/dev/null && [ "$_kw" -lt 10 ]; do
        sleep 1; _kw=$((_kw + 1))
      done
      if kill -0 "$DISPATCH_PID" 2>/dev/null; then
        kill -KILL -- "-$DISPATCH_PID" 2>/dev/null || kill -KILL "$DISPATCH_PID" 2>/dev/null || true
      fi
      ;;
    *)
      kill -TERM "$DISPATCH_PID" 2>/dev/null || true
      local _kw=0
      while kill -0 "$DISPATCH_PID" 2>/dev/null && [ "$_kw" -lt 10 ]; do
        sleep 1; _kw=$((_kw + 1))
      done
      if kill -0 "$DISPATCH_PID" 2>/dev/null; then
        kill -KILL "$DISPATCH_PID" 2>/dev/null || true
      fi
      ;;
  esac
}

# Background dispatch: stdout → RESULT (callers read this path) + live-output.log;
# stderr → ERR (existing usage-warning grep still works) + live-output.log.
# Process substitution tees each stream into live-output.log for the combined liveness signal
# while preserving the original stdout-only RESULT and stderr-only ERR files.
case "$_pg_mode" in
  setsid)
    setsid copilot -p "$PROMPT" -s --no-ask-user \
      "${MODEL_ARGS[@]}" "${EFFORT_ARGS[@]}" "${CONTEXT_ARGS[@]}" \
      -C "$REPO" \
      "${AGENT_ARGS[@]}" "${PERM[@]}" "${EXTRA[@]}" \
      "${SESSION_ARGS[@]}" "${MAX_CREDITS_ARGS[@]}" \
      --no-remote --no-color "${CI_FLAG[@]}" --log-dir "$RUN_DIR" --log-level debug \
      > >(tee -a "$LIVE_LOG" > "$RESULT") 2> >(tee -a "$LIVE_LOG" > "$ERR") &
    ;;
  job_control)
    set -m
    copilot -p "$PROMPT" -s --no-ask-user \
      "${MODEL_ARGS[@]}" "${EFFORT_ARGS[@]}" "${CONTEXT_ARGS[@]}" \
      -C "$REPO" \
      "${AGENT_ARGS[@]}" "${PERM[@]}" "${EXTRA[@]}" \
      "${SESSION_ARGS[@]}" "${MAX_CREDITS_ARGS[@]}" \
      --no-remote --no-color "${CI_FLAG[@]}" --log-dir "$RUN_DIR" --log-level debug \
      > >(tee -a "$LIVE_LOG" > "$RESULT") 2> >(tee -a "$LIVE_LOG" > "$ERR") &
    set +m
    ;;
  *)
    copilot -p "$PROMPT" -s --no-ask-user \
      "${MODEL_ARGS[@]}" "${EFFORT_ARGS[@]}" "${CONTEXT_ARGS[@]}" \
      -C "$REPO" \
      "${AGENT_ARGS[@]}" "${PERM[@]}" "${EXTRA[@]}" \
      "${SESSION_ARGS[@]}" "${MAX_CREDITS_ARGS[@]}" \
      --no-remote --no-color "${CI_FLAG[@]}" --log-dir "$RUN_DIR" --log-level debug \
      > >(tee -a "$LIVE_LOG" > "$RESULT") 2> >(tee -a "$LIVE_LOG" > "$ERR") &
    ;;
esac
DISPATCH_PID=$!

# Foreground watchdog: runs in current shell context so variable writes go directly to parent scope.
# Polls every 15s — acceptable granularity for a system where healthy gaps reach 3–4+ min.
_last_bytes=0
_silent_secs=0
_stall_episode=0  # suppresses duplicate WARNs within one silent episode; resets on growth
_bounce_fired=0   # resets per episode; prevents duplicate bounce per silent stretch
_bounce_count=0   # cumulative bounces across all episodes this run; does NOT reset on growth

while kill -0 "$DISPATCH_PID" 2>/dev/null; do
  sleep 15
  _elapsed=$(( $(date +%s) - _secs_start ))

  # Wall ceiling: elapsed ≥ TIMEOUT → TERM+bounded-wait+KILL the group, tag wall_ceiling (exit 124).
  if [ "$_elapsed" -ge "$TIMEOUT" ]; then
    _kill_dispatch
    EXIT_REASON="wall_ceiling"
    break
  fi

  if [ "$STALL_MODE" != "off" ]; then
    # Liveness: sum of bytes in live-output.log (combined stream); result.md is a subset
    # already included (stdout goes to both). Reading live-output.log alone is sufficient.
    _cur_bytes="$(wc -c < "$LIVE_LOG" 2>/dev/null || echo 0)"

    if [ "$_cur_bytes" -gt "$_last_bytes" ]; then
      # Growth — worker is alive; reset stall counters and clear episode flag
      _last_bytes="$_cur_bytes"
      _silent_secs=0
      _stall_episode=0
      _bounce_fired=0   # new episode can fire another bounce
    else
      _silent_secs=$(( _silent_secs + 15 ))
      # Fire at most one WARN per silent episode (_stall_episode prevents repeat warns
      # for the same silent stretch; clears when growth resumes above)
      if [ "$_silent_secs" -ge "$STALL_WARN_SECS" ] && [ "$_stall_episode" = "0" ]; then
        _iso_ts="$(date -u '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date '+%Y-%m-%dT%H:%M:%SZ')"
        echo "STALL-WARN ${_iso_ts} ${_silent_secs}s-silent" >> "$STALL_LOG"
        STALL_WARNS=$(( STALL_WARNS + 1 ))
        _stall_episode=1
        echo "copilot-worker: STALL-WARN at elapsed=${_elapsed}s — no output for ${_silent_secs}s (run $RUN_ID, STALL_MODE=${STALL_MODE})" >&2
        _uplink_fire "stall"
        if [ "$STALL_MODE" = "kill" ]; then
          _kill_dispatch
          EXIT_REASON="stall"
          break
        fi
        # STALL_MODE=warn (default): append warning and keep watching — do NOT kill
      fi
      # LCD04: warn+bounce — after STALL_WARN + STALL_BOUNCE_DELAY, pre-write bounce ticket once per episode
      if [ "$STALL_ACTION" = "warn+bounce" ] && [ "$_stall_episode" = "1" ] && [ "${_bounce_fired:-0}" != "1" ]; then
        if [ "$_silent_secs" -ge "$(( STALL_WARN_SECS + STALL_BOUNCE_DELAY ))" ]; then
          if [ "${_bounce_count:-0}" -lt "$STALL_MAX_BOUNCES" ]; then
            _bounce_count=$(( ${_bounce_count:-0} + 1 ))
            mkdir -p "$STALL_QUEUE_DIR"
            _bounce_file="${STALL_QUEUE_DIR}/${RUN_ID}-bounce.md"
            cp "$TASK" "$_bounce_file"
            { printf '\n## STALL-CONTEXT\n'; printf 'Prior dispatch stalled at %ss. This is attempt %s.\n' "$_silent_secs" "$(( ATTEMPT + 1 ))"; printf 'If the same stall occurs, escalate +1 tier per worker-ext.md:73-85.\n'; } >> "$_bounce_file"
            echo "STALL-BOUNCE READY: ${_bounce_file} queued. Dispatch it or wait for original — DO NOT RESCUE INLINE." >&2
            # PLAN61 P3: the bounce ticket has been pre-written since 2026-07-16 and fired 372 times,
            # yet 74 post-2026-07-24 stall deaths still ran to terminal — because a file quietly
            # queued in a directory nobody watches is not a handoff. Surface it as a runnable command
            # and record the path in the ledger row, so the bounce is consumable instead of archival.
            BOUNCE_READY="$_bounce_file"
            {
              printf 'STALL-BOUNCE COMMAND (copy-paste to re-dispatch this ticket):\n'
              printf '  bash %s --ticket %s --agent %s --model %s --mode %s --work-type %s --max-credits %s --run-id %s-b%s --attempt %s --parent-run-id %s\n' \
                "${BASH_SOURCE[0]}" "$_bounce_file" "$AGENT" "$MODEL" "$MODE" "$WORK_TYPE" \
                "${MAX_CREDITS:-250}" "$RUN_ID" "${_bounce_count}" "$(( ATTEMPT + 1 ))" "$RUN_ID"
            } >&2
            _bounce_fired=1
          else
            _iso_ts2="$(date -u '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date '+%Y-%m-%dT%H:%M:%SZ')"
            echo "STALL-EXHAUST ${_iso_ts2} max-bounces=${STALL_MAX_BOUNCES} run=${RUN_ID}" >> "$STALL_LOG"
            echo "STALL-EXHAUST: max bounces (${STALL_MAX_BOUNCES}) exhausted for run ${RUN_ID}" >&2
            _bounce_fired=1
          fi
        fi
      fi
    fi
  fi
done

# Collect dispatch exit code; give process substitution subshells a moment to flush.
wait "$DISPATCH_PID" 2>/dev/null
EXIT=$?
wait

SECS=$(( $(date +%s) - _secs_start ))
END_TS="$(date -Iseconds 2>/dev/null || date -u '+%Y-%m-%dT%H:%M:%SZ')" # LCD07: wall-clock end

# ── Post-dispatch model verification (TICKET-fdle-modelverify-r1, FIX: TICKET-fdle-dispatch-hardening-r1) ──
# The CLI emits `Using model` lines to the DEBUG LOG (process-*.log in $RUN_DIR), NOT to
# live-output.log. Prior code grepped $LIVE_LOG — always empty → inert guard (UNVERIFIED on
# every healthy run). Two observed formats (both co-exist in one file):
#   1. Using model "claude-sonnet-4.5" from custom agent "council-worker--claude-sonnet-4.5"
#   2. Using model: claude-sonnet-4.5
# Multiple lines per run are normal (same model logged several times). Disagreement = finding.
_MODEL_VERIFY_FILE="$RUN_DIR/model-verify.txt"
: > "$_MODEL_VERIFY_FILE"
for _dbg_log in "$RUN_DIR"/process-*.log; do
  [ -f "$_dbg_log" ] || continue
  # ANCHORED (fdle-p1 2026-07-25): must match a real CLI log line — ISO timestamp + [LEVEL]
  # at line start. An unanchored 'Using model' substring also matches this guard's own source
  # comments whenever a worker reads copilot-worker.sh and the CLI echoes the file into its
  # debug log as a JSON "content" value — that self-poisoning produced a false MULTI_MODEL
  # FATAL and killed a healthy run. Anchoring is load-bearing, not cosmetic.
  grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z \[[A-Z]+\] Using model' "$_dbg_log" 2>/dev/null >> "$_MODEL_VERIFY_FILE" || true
done
_ACTUAL_MODEL=""
if [ -s "$_MODEL_VERIFY_FILE" ]; then
  # Parse both formats, deduplicate. sed -n: only print successful substitutions.
  # Format 1: Using model "X" ... → capture X (BRE groups).
  # Format 2: Using model: X → capture X. Branch (t) skips format 2 if format 1 matched.
  _MODELS_PARSED="$(sed -n '
    s/.*Using model[[:space:]]*"\([^"]*\)".*/\1/p; t
    s/.*Using model:[[:space:]]*\([^[:space:]]*\).*/\1/p
  ' "$_MODEL_VERIFY_FILE" | tr -d '\r' | sort -u)"
  _MODEL_COUNT="$(printf '%s\n' "$_MODELS_PARSED" | grep -c . || true)"
  # PLAN61 P5: multi-model is NOT proof of substitution. Nearly every ticket permits up to 3
  # sub-agents, and a permitted nested spawn puts a second model id in the same debug log — so the
  # old "count > 1 = FATAL, refuse to record" rule deleted the ledger rows of at least 4 runs whose
  # work was complete and correct on disk (2026-07-27 x2, 2026-07-30 q123-rh-A/rh-C). A vanished row
  # is worse than a flagged one: it makes every ledger-derived count silently under-report.
  # The real discriminator is the PRIMARY model — the FIRST `Using model` line, emitted by the main
  # session before any sub-agent spawns. Primary == pinned means the wrapper got what it asked for.
  _PRIMARY_MODEL="$(sed -n '
    s/.*Using model[[:space:]]*"\([^"]*\)".*/\1/p; t
    s/.*Using model:[[:space:]]*\([^[:space:]]*\).*/\1/p
  ' "$_MODEL_VERIFY_FILE" | tr -d '\r' | head -1)"
  if [ "$_MODEL_COUNT" -gt 1 ] && [ "$_PRIMARY_MODEL" = "$MODEL" ]; then
    echo "copilot-worker: WARN — debug log contains multiple models: $(printf '%s\n' "$_MODELS_PARSED" | tr '\n' ' '| sed 's/ $//'). Primary matches the pin ('$MODEL'), so this reads as permitted sub-agent use — RECORDING the row with model_verdict=SUSPECT-nested." >&2
    MODEL_VERDICT="SUSPECT-nested"
    _ACTUAL_MODEL="$_PRIMARY_MODEL"
  elif [ "$_MODEL_COUNT" -gt 1 ]; then
    echo "copilot-worker: FATAL — debug log contains MULTIPLE DISTINCT models: $(printf '%s\n' "$_MODELS_PARSED" | tr '\n' ' '| sed 's/ $//') and the PRIMARY model '$_PRIMARY_MODEL' is not the pinned '$MODEL' — refusing to record." >&2
    printf '{"run_id":"%s","model_intended":"%s","models_found":"%s","verdict":"MULTI_MODEL_CAUGHT"}\n' \
      "$RUN_ID" "$MODEL" "$(printf '%s\n' "$_MODELS_PARSED" | tr '\n' ',' | sed 's/,$//')" > "$META"
    [ -n "$MYLOCK" ] && rm -rf "$MYLOCK" 2>/dev/null
    exit 1
  elif [ "$_MODEL_COUNT" -eq 1 ]; then
    _ACTUAL_MODEL="$_MODELS_PARSED"
  fi
fi
if [ -n "$_ACTUAL_MODEL" ] && [ "$_ACTUAL_MODEL" != "$MODEL" ]; then
  echo "copilot-worker: FATAL — CLI ran '$_ACTUAL_MODEL' but wrapper intended '$MODEL'. Refusing to record a false ledger row." >&2
  printf '{"run_id":"%s","model_intended":"%s","model_actual":"%s","verdict":"SUBSTITUTION_CAUGHT"}\n' \
    "$RUN_ID" "$MODEL" "$_ACTUAL_MODEL" > "$META"
  [ -n "$MYLOCK" ] && rm -rf "$MYLOCK" 2>/dev/null
  exit 1
fi
if [ -z "$_ACTUAL_MODEL" ]; then
  echo "copilot-worker: WARN — could not verify model from CLI debug output; recording as UNVERIFIED." >&2
  MODEL="UNVERIFIED(${MODEL})"
fi

# ── LEDGER-TRUTH A1: sample the ticket's DECLARED deliverable BEFORE any wrapper write ─────────
# PLAN_DELEGATION_LEDGER_TRUTH Tooth 1. Ordering is load-bearing: the wrapper later copies its own
# report next to this path, so if the sample happened after that copy the oracle would be checking
# a file the wrapper itself created — an unfalsifiable gate, the exact defect this plan removes.
# Parse is STRICTLY anchored to the canonical token: 71 legacy tickets carry ~5 other OUTPUT
# spellings, and reports contain decoys like "OUTPUT: (no output) EXIT:0 -> PASS". Only the exact
# `OUTPUT (LITERAL ABSOLUTE):` form arms this tooth; anything else leaves it dormant (no false positives).
DECLARED_OUTPUT=""; DELIVERABLE_STATE="not-declared"
# PLAN61 P1c: one parser, defined once near RUN_DIR setup and reused here. Behaviour identical to
# the inline block it replaces — the pre-dispatch stub writer must not be able to drift from it.
DECLARED_OUTPUT="$(_parse_declared_output)"
if [ -n "$DECLARED_OUTPUT" ]; then
  # A file carrying the wrapper's OWN sentinel counts as missing — otherwise a stub written by a
  # previous failed run would read as a delivered artifact on the next attempt. The wrapper only
  # ever recognizes its own marker here, never a worker-authored shape.
  # PLAN61 P1c adds the second wrapper-owned shape: the STEP-0 stub. Counting NON-STUB non-blank
  # lines (rather than testing line 1) is load-bearing — it must read as `missing` when the worker
  # wrote nothing, yet as `present` the moment the worker APPENDS beneath the stub, which is exactly
  # what duty 0 tells it to do. A line-1 test would mark real appended work as missing.
  _p61_nonstub=1
  if [ -s "$DECLARED_OUTPUT" ]; then
    _p61_nonstub="$(grep -av "$_PLAN61_STUB_MARK" "$DECLARED_OUTPUT" 2>/dev/null | grep -c '[^[:space:]]' || true)"
    [ -n "$_p61_nonstub" ] || _p61_nonstub=0
  fi
  if [ -s "$DECLARED_OUTPUT" ] && [ "$_p61_nonstub" -gt 0 ] \
     && ! head -1 "$DECLARED_OUTPUT" 2>/dev/null | grep -qa 'copilot-worker: NO DELIVERABLE'; then
    DELIVERABLE_STATE="present"
  else
    DELIVERABLE_STATE="missing"
    [ "${_p61_nonstub:-1}" -eq 0 ] && echo "copilot-worker: STEP-0 stub was never replaced — worker wrote nothing to $DECLARED_OUTPUT" >&2
  fi
fi

# Classify exit_reason if watchdog did not already set it (wall_ceiling or stall)
if [ "$EXIT_REASON" = "success" ] && [ "$EXIT" -ne 0 ]; then
  EXIT_REASON="error"
fi
# Backward-compat: wall_ceiling maps to exit code 124 (existing callers may check this value)
if [ "$EXIT_REASON" = "wall_ceiling" ]; then
  EXIT=124
fi

OK=false
{ [ "$EXIT" -eq 0 ] && [ -s "$RESULT" ]; } && OK=true

# ── UW-4: post-exit wire evaluation (announce-mode — log-only) ─────────────────────────────────
[ "$ATTEMPT" -ge 2 ] && _uplink_fire "attempt-ge-2"
{ [ "$OK" != true ] && [ ! -s "$RESULT" ]; } && _uplink_fire "empty-result"
[ "$STALL_WARNS" -gt 0 ] && _uplink_fire "recovered-stall"
# ── ASK detection (deterministic — supervisor is dumb code, not a digest read) ─────────────────
ASK_OPEN=false
if [ "$TICKET_MODE" = true ]; then
  if grep -qiE '^##[[:space:]]+ASK' "$RESULT" 2>/dev/null; then
    _asect="$(awk 'BEGIN{f=0} /^##[[:space:]]+ASK/{f=1;next} /^##[[:space:]]/{f=0} f' "$RESULT")"
    echo "$_asect" | grep -qivE '^[[:space:]]*(none|n/?a)?[[:space:]]*$' && ASK_OPEN=true
  else
    ASK_OPEN="missing-section"
  fi
fi

# ── LEDGER-TRUTH A2: work-outcome teeth (PLAN_DELEGATION_LEDGER_TRUTH §4) ──────────────────────
# Before this, `ok` was exit-code + non-empty-file, so a worker that burned its budget, wrote a
# prose note and touched nothing recorded ok:true/exit_reason:"success" (reproduced 9x, 2026-07-22/23).
# Two floors + one downgrade-only shape check. Floors first: a positive condition must be MET.
# `OK` itself is deliberately NOT reassigned — it still drives the process exit path below, so exit
# codes stay byte-identical. Only the LEDGER's view of the run changes (owner directive: truthfulness
# of the ledger row and the report location, nothing else).
REPORT_SECTIONS=0
if [ "$TICKET_MODE" = true ]; then
  # Per-section BOOLEAN sum, never a raw match count — a report repeating "## ASK" twice must score
  # 1 for that section, or the floor is trivially inflatable. Ticket mode prepends DUTY_STACK, so
  # every ticket-mode worker was contractually handed this exact schema.
  _sec_result=0
  for _sec in DOCTRINE_READ FILES_INSPECTED PLAN DIFF_SUMMARY VERIFY_ARTIFACTS \
              DOCS_UPDATED EXTERNAL_CONTENT_CONSUMED CLEANUP ASK BLOCKERS_DEVIATIONS; do
    grep -qaiE "^##[[:space:]]+${_sec}" "$RESULT" 2>/dev/null && _sec_result=$(( _sec_result + 1 ))
  done
  # Also scan the ticket's declared OUTPUT path (already parsed above as DECLARED_OUTPUT) and take
  # the higher count. A sentinel stub (first line: copilot-worker: NO DELIVERABLE) always scores
  # zero — it is the wrapper's own marker that nothing was delivered; counting its sections would
  # convert the clearest failure signal into a pass. Only raise, never lower.
  _sec_output=0
  if [ -n "$DECLARED_OUTPUT" ] && [ -s "$DECLARED_OUTPUT" ] && \
     ! head -1 "$DECLARED_OUTPUT" 2>/dev/null | grep -qa 'copilot-worker: NO DELIVERABLE'; then
    for _sec in DOCTRINE_READ FILES_INSPECTED PLAN DIFF_SUMMARY VERIFY_ARTIFACTS \
                DOCS_UPDATED EXTERNAL_CONTENT_CONSUMED CLEANUP ASK BLOCKERS_DEVIATIONS; do
      grep -qaiE "^##[[:space:]]+${_sec}" "$DECLARED_OUTPUT" 2>/dev/null && _sec_output=$(( _sec_output + 1 ))
    done
  fi
  [ "$_sec_output" -gt "$_sec_result" ] && REPORT_SECTIONS="$_sec_output" || REPORT_SECTIONS="$_sec_result"
fi
VERDICT_NEGATIVE=false
if [ "$TICKET_MODE" = true ] && grep -qaiE '(VERDICT[^A-Za-z0-9]{0,6}(NOT-?(FIXED|COMPLETE|DONE|REACHED)|BLOCKED))|SESSION LIMIT REACHED|session (budget )?exhausted|budget[ -]exhausted' "$RESULT" 2>/dev/null; then
  VERDICT_NEGATIVE=true
fi

LEDGER_OK="$OK"; LEDGER_EXIT_REASON="$EXIT_REASON"
# Process-level reasons (wall_ceiling / stall / error) are upstream causes and always win — a tooth
# must never relabel them. Among the teeth: hardest fact first.
if [ "$OK" = true ] && [ "$EXIT_REASON" = "success" ] && [ "$TICKET_MODE" = true ]; then
  if [ "$DELIVERABLE_STATE" = "missing" ]; then
    LEDGER_OK=false; LEDGER_EXIT_REASON="no-deliverable"
  elif [ "$REPORT_SECTIONS" -eq 0 ]; then
    # Deliberately NOT called "budget-exhausted": a zero-section report may be a crash, a CLI abort
    # or a refusal. Naming a cause we did not observe would be an assumption; state only what is seen.
    LEDGER_OK=false; LEDGER_EXIT_REASON="no-report-schema"
  elif [ "$VERDICT_NEGATIVE" = true ]; then
    LEDGER_OK=false; LEDGER_EXIT_REASON="budget-exhausted"
  fi
fi
# ── PLAN61 P4: network deaths get their own exit_reason ────────────────────────────────────────
# 8 corrected deaths were network failures that the first census filed as batch-write deaths, because
# the missing output was louder than the cause. Mislabelled deaths send the next RCA down the wrong
# path, so name the proximate cause when the evidence is explicit.
if [ "$LEDGER_OK" != true ] && [ "$LEDGER_EXIT_REASON" != "wall_ceiling" ] && [ "$LEDGER_EXIT_REASON" != "stall" ]; then
  if grep -qaiE 'ENOTFOUND|dns error|No such host|ECONNRESET|error sending request|failed native model HTTP request' "$ERR" 2>/dev/null; then
    LEDGER_EXIT_REASON="network"
  fi
fi

# ── PLAN61 P7: derive the death class so every future death self-classifies in the ledger ───────
# Single source of truth: scripts/death-census.mjs owns the taxonomy and its regexes. The wrapper
# never keeps a second copy — a duplicated classifier is guaranteed drift. Tolerant by design: if
# the script is absent or misbehaves, the field stays empty and nothing else changes.
if [ "$LEDGER_OK" != true ] && [ -f "$REPO/scripts/death-census.mjs" ]; then
  DEATH_CLASS="$(node "$REPO/scripts/death-census.mjs" --classify-one \
    --run-dir "$RUN_DIR" --exit-reason "$LEDGER_EXIT_REASON" --exit "$EXIT" \
    --secs "$SECS" --stall-warns "$STALL_WARNS" --deliverable "$DELIVERABLE_STATE" 2>/dev/null \
    | tr -d '\r\n' | head -c 24)"
fi

if [ "$LEDGER_OK" != true ]; then
  echo "copilot-worker: LEDGER-TRUTH — run $RUN_ID recorded ok=false exit_reason=$LEDGER_EXIT_REASON death_class=${DEATH_CLASS:-none} (report_sections=$REPORT_SECTIONS deliverable=$DELIVERABLE_STATE). Process exit code is UNCHANGED ($EXIT) by design." >&2
fi

# LCD07 Phase 1+3: enriched META + ledger. New fields: ts, ts_end, tokens_in, tokens_out,
# cost_usd (null — copilot CLI does not surface token counts at worker depth; workers must
# self-report in VERIFY_ARTIFACTS; wrapper records null here), dispatcher, session_id,
# ticket_id, parent_run_id, depth, effective_cap, sub_agents.
# ALL existing fields preserved byte-identical in meaning; additive-only — old parsers skip unknowns.
# Phase 3: parse sub_agents from worker report ## SUB_AGENTS section (absent → [] — no behavior change)
_SUB_AGENTS_JSON="$(V_RESULT="$RESULT" node -e "
var fs=require('fs'),result=process.env.V_RESULT;
if(!result||!fs.existsSync(result)){process.stdout.write('[]');process.exit(0);}
var txt=fs.readFileSync(result,'utf8');
var m=txt.match(/##\s+SUB_AGENTS[\s\S]*?(?=\n##\s|$)/);
if(!m){process.stdout.write('[]');process.exit(0);}
var rows=(m[0].match(/^\|[^|\n]+\|[^|\n]+\|[^|\n]*\|[^|\n]*\|[^|\n]*\|/gm)||[]);
var agents=[];
rows.forEach(function(r){
  if(/^\|\s*[-:]+/.test(r)||/name.*model.*ok/i.test(r))return;
  var c=r.split('|').slice(1,-1).map(function(x){return x.trim();});
  if(c.length<3)return;
  var ok=(c[2]||'').toLowerCase()==='true'||(c[2]||'').toLowerCase()==='yes';
  var s=parseFloat(c[3]);
  agents.push({name:c[0]||null,model:c[1]||null,ok:ok,secs:isNaN(s)?null:s,work_type:c[4]||null,
    tokens_in:null,tokens_out:null,cost_usd:null,files:null,
    _tokens_note:'worker did not self-report',_files_note:'worker did not report'});
});
process.stdout.write(JSON.stringify(agents));
" 2>/dev/null || printf '[]')"

# LCD07 Phase 1: enriched META (single file per run — no lock needed; $META path is unique to RUN_DIR)
V_RUN_ID="$RUN_ID" V_MODE="$MODE" V_MODEL="$MODEL" V_AGENT="$AGENT" \
V_WORK_TYPE="$WORK_TYPE" V_EFFORT="$EFFORT" V_EXIT="$EXIT" V_OK="$LEDGER_OK" \
V_SECS="$SECS" V_EXIT_REASON="$LEDGER_EXIT_REASON" V_STALL_WARNS="$STALL_WARNS" \
V_REPORT_SECTIONS="$REPORT_SECTIONS" V_DELIVERABLE="$DELIVERABLE_STATE" V_VERDICT_NEG="$VERDICT_NEGATIVE" \
V_ATTEMPT="$ATTEMPT" V_ASK_OPEN="$ASK_OPEN" V_RESULT="$RESULT" \
V_TS="$START_TS" V_TS_END="$END_TS" \
V_DISPATCHER="${DISPATCHER:-CEO}" V_SESSION_ID="${SESSION_ID:-}" \
V_TICKET_ID="$(basename "${TICKET:-}")" V_PARENT_RUN_ID="${PARENT_RUN_ID:-}" \
V_DEPTH="${DEPTH:-0}" V_MAX_WORKERS="${MAX_WORKERS:-5}" V_SUB_AGENTS="$_SUB_AGENTS_JSON" \
V_BUDGET_FLOORED="$BUDGET_FLOORED" V_MODEL_VERDICT="$MODEL_VERDICT" V_DEATH_CLASS="$DEATH_CLASS" \
V_BOUNCE_READY="$BOUNCE_READY" V_NETWORK_RETRY="$NETWORK_RETRY" \
node -e "var e=process.env,ask=e.V_ASK_OPEN;if(ask==='true')ask=true;else if(ask==='false')ask=false;var sa;try{sa=JSON.parse(e.V_SUB_AGENTS);}catch(x){sa=[];}var o={run_id:e.V_RUN_ID,ts:e.V_TS||null,ts_end:e.V_TS_END||null,tokens_in:null,tokens_out:null,cost_usd:null,dispatcher:e.V_DISPATCHER||'CEO',session_id:e.V_SESSION_ID||null,ticket_id:e.V_TICKET_ID||null,parent_run_id:e.V_PARENT_RUN_ID||null,depth:+e.V_DEPTH||0,effective_cap:+e.V_MAX_WORKERS||5,sub_agents:sa,mode:e.V_MODE,model:e.V_MODEL,agent:e.V_AGENT,work_type:e.V_WORK_TYPE,effort:e.V_EFFORT,exit:+e.V_EXIT,ok:e.V_OK==='true',secs:+e.V_SECS,exit_reason:e.V_EXIT_REASON,stall_warns:+e.V_STALL_WARNS,attempt:+e.V_ATTEMPT,ask_open:ask,report_sections:+e.V_REPORT_SECTIONS||0,deliverable:e.V_DELIVERABLE||null,budget_floored:e.V_BUDGET_FLOORED==='true',model_verdict:e.V_MODEL_VERDICT||'OK',death_class:e.V_DEATH_CLASS||null,bounce_ready:e.V_BOUNCE_READY||null,network_retry:e.V_NETWORK_RETRY==='true',verdict_negative:e.V_VERDICT_NEG==='true',result:e.V_RESULT};process.stdout.write(JSON.stringify(o)+'\n');" >"$META"

# LCD07 Phase 1 (lock): mkdir spin-lock for ledger append — portable: Git Bash on Windows has NO flock.
# Availability-over-strictness: if lock times out, append without lock + stderr warning (telemetry).
_LEDGER_LOCK="${LEDGER}.lock"
_lock_ok=false; _li=0
while [ "$_li" -lt 50 ]; do
  if mkdir "$_LEDGER_LOCK" 2>/dev/null; then _lock_ok=true; break; fi
  sleep 0.1; _li=$(( _li + 1 ))
done
[ "$_lock_ok" != true ] && echo "copilot-worker: WARN — ledger lock timed out after 5s; appending without lock (telemetry only)" >&2
V_RUN_ID="$RUN_ID" V_MODE="$MODE" V_MODEL="$MODEL" V_AGENT="$AGENT" \
V_WORK_TYPE="$WORK_TYPE" V_EFFORT="$EFFORT" V_EXIT="$EXIT" V_OK="$LEDGER_OK" \
V_SECS="$SECS" V_EXIT_REASON="$LEDGER_EXIT_REASON" V_STALL_WARNS="$STALL_WARNS" \
V_REPORT_SECTIONS="$REPORT_SECTIONS" V_DELIVERABLE="$DELIVERABLE_STATE" V_VERDICT_NEG="$VERDICT_NEGATIVE" \
V_ATTEMPT="$ATTEMPT" V_ASK_OPEN="$ASK_OPEN" \
V_TS="$START_TS" V_TS_END="$END_TS" \
V_DISPATCHER="${DISPATCHER:-CEO}" V_SESSION_ID="${SESSION_ID:-}" \
V_TICKET_ID="$(basename "${TICKET:-}")" V_PARENT_RUN_ID="${PARENT_RUN_ID:-}" \
V_DEPTH="${DEPTH:-0}" V_MAX_WORKERS="${MAX_WORKERS:-5}" V_SUB_AGENTS="$_SUB_AGENTS_JSON" \
V_BUDGET_FLOORED="$BUDGET_FLOORED" V_MODEL_VERDICT="$MODEL_VERDICT" V_DEATH_CLASS="$DEATH_CLASS" \
V_BOUNCE_READY="$BOUNCE_READY" V_NETWORK_RETRY="$NETWORK_RETRY" \
node -e "var e=process.env,ask=e.V_ASK_OPEN;if(ask==='true')ask=true;else if(ask==='false')ask=false;var sa;try{sa=JSON.parse(e.V_SUB_AGENTS);}catch(x){sa=[];}var o={run_id:e.V_RUN_ID,ts:e.V_TS||null,ts_end:e.V_TS_END||null,tokens_in:null,tokens_out:null,cost_usd:null,dispatcher:e.V_DISPATCHER||'CEO',session_id:e.V_SESSION_ID||null,ticket_id:e.V_TICKET_ID||null,parent_run_id:e.V_PARENT_RUN_ID||null,depth:+e.V_DEPTH||0,effective_cap:+e.V_MAX_WORKERS||5,sub_agents:sa,mode:e.V_MODE,model:e.V_MODEL,agent:e.V_AGENT,work_type:e.V_WORK_TYPE,effort:e.V_EFFORT,exit:+e.V_EXIT,ok:e.V_OK==='true',secs:+e.V_SECS,exit_reason:e.V_EXIT_REASON,stall_warns:+e.V_STALL_WARNS,attempt:+e.V_ATTEMPT,ask_open:ask,report_sections:+e.V_REPORT_SECTIONS||0,deliverable:e.V_DELIVERABLE||null,budget_floored:e.V_BUDGET_FLOORED==='true',model_verdict:e.V_MODEL_VERDICT||'OK',death_class:e.V_DEATH_CLASS||null,bounce_ready:e.V_BOUNCE_READY||null,network_retry:e.V_NETWORK_RETRY==='true',verdict_negative:e.V_VERDICT_NEG==='true'};process.stdout.write(JSON.stringify(o)+'\n');" >>"$LEDGER"
[ "$_lock_ok" = true ] && rmdir "$_LEDGER_LOCK" 2>/dev/null || true

# LCD07 Phase 4: activity-log parity — one table row per dispatch matching the live parser format.
# Contract = validate-activity-log.mjs parseRowLine: | When | Agent | Action | Files | Notes |
# Files = "(none)" → validator skips (no path tokens → no-files-extracted) → exits 0 (valid).
# DEVIATION from plan lines 108-112: plan block is aspirational free-text; live validator parses
# a markdown TABLE with 5 pipe-delimited columns. Resolution: write a table row — accepted cleanly.
_ACTLOG_PATH="$REPO/clients/encore/specs_planning/_internal/agent-activity-log.md"
_ACTLOG_TS="$(date '+%Y-%m-%dT%H:%M' 2>/dev/null || echo '1970-01-01T00:00')"
_ACTLOG_TICKET="$(basename "${TICKET:-${TASK:-unknown}}")"
_ACTLOG_NOTES="[delegation] ${_ACTLOG_TICKET} — ${MODEL} ${WORK_TYPE} ok=${OK}"
if [ -f "$_ACTLOG_PATH" ]; then
  printf '| %s | %s | %s | %s | %s |\n' \
    "$_ACTLOG_TS" "${DISPATCHER:-CEO}/copilot-worker" "dispatch" "(none)" "$_ACTLOG_NOTES" \
    >> "$_ACTLOG_PATH" 2>/dev/null || echo "copilot-worker: WARN — activity-log append failed (non-fatal)" >&2
fi

# Surface (not self-limit) any GitHub weekly-usage warnings.
grep -iE "usage|weekly|quota|premium|limit" "$ERR" 2>/dev/null | head -3 >&2 || true

# ── LEDGER-TRUTH A4: report placement — deliberately BEFORE the failure exit below ─────────────
# This block previously sat AFTER the `exit` at the bottom of the file, so a FAILED run copied its
# report nowhere — precisely the runs a dispatcher most needs to read. Same write-order defect class
# as R-531/D7 in this same file: an anchor must sit where the record is still written.
if [ "$TICKET_MODE" = true ]; then
  REPORTS="$HOME/.claude/delegation/reports"
  mkdir -p "$REPORTS"
  cp "$RESULT" "$REPORTS/$RUN_ID.report.md" 2>/dev/null || true
  # Honour the ticket's declared OUTPUT path so a dispatcher who checks where they pointed the worker
  # finds something. The report goes to a DISTINCT wrapper-owned filename — never to the declared
  # deliverable path itself, which would forge the very artifact Tooth 1 samples.
  if [ -n "$DECLARED_OUTPUT" ]; then
    _out_dir="$(dirname "$DECLARED_OUTPUT")"
    mkdir -p "$_out_dir" 2>/dev/null || true
    cp "$RESULT" "$_out_dir/worker-report.md" 2>/dev/null || true
    # Deliverable absent: leave a sentinel at the declared path so it resolves rather than 404-ing.
    # A1 reads this sentinel back as `missing`, so a later attempt cannot mistake it for delivery.
    # Never overwrite a deliverable that IS present.
    if [ "$DELIVERABLE_STATE" = "missing" ]; then
      {
        printf '<!-- copilot-worker: NO DELIVERABLE (run %s) -->\n\n' "$RUN_ID"
        printf 'The worker did not write this file. Ledger row: ok=false exit_reason=%s.\n' "$LEDGER_EXIT_REASON"
        printf 'The worker report is beside this file as worker-report.md\n'
      } > "$DECLARED_OUTPUT" 2>/dev/null || true
    fi
  fi
fi

# ── PLAN61 P4: bounded auto-retry on a network death ───────────────────────────────────────────
# Deliberately placed at the tail and implemented with exec, NOT by restructuring the dispatch +
# watchdog loop: this file is the single most load-bearing script in the delegation system, and a
# rewrite of its core would risk every dispatch to fix a class worth 8 deaths.
# The failed run keeps its truthful ledger row (already written above) — the retry is a clean fresh
# run under a derived run-id. `_PLAN61_NET_RETRY` makes a second retry impossible, so there is no
# loop. The slot lock is released explicitly because exec replaces the process and the EXIT trap
# would never fire.
if [ "$OK" != true ] && [ "$LEDGER_EXIT_REASON" = "network" ] && [ "${_PLAN61_NET_RETRY:-0}" != "1" ] \
   && [ ! -s "$RESULT" ] && [ "$SECS" -lt 120 ] && [ "$TICKET_MODE" = true ]; then
  echo "copilot-worker: NETWORK-RETRY — run $RUN_ID died on a network error after ${SECS}s with no output. Retrying ONCE as ${RUN_ID}-nr1 after 60s backoff." >&2
  [ -n "$MYLOCK" ] && rm -rf "$MYLOCK" 2>/dev/null
  sleep 60
  export _PLAN61_NET_RETRY=1
  exec bash "${BASH_SOURCE[0]}" --ticket "$TICKET" --agent "$AGENT" --model "$MODEL" \
    --mode "$MODE" --work-type "$WORK_TYPE" --max-credits "$MAX_CREDITS" \
    --run-id "${RUN_ID}-nr1" --attempt "$ATTEMPT" \
    --dispatcher "${DISPATCHER:-CEO}" --session-id "${SESSION_ID:-}" --parent-run-id "$RUN_ID"
fi

if [ "$OK" != true ]; then
  [ "$EXIT_REASON" = "wall_ceiling" ] && echo "copilot-worker: WALL-CEILING after ${TIMEOUT}s (run $RUN_ID)" >&2
  [ "$EXIT_REASON" = "stall" ] && echo "copilot-worker: STALL-KILL after ${SECS}s silent (run $RUN_ID)" >&2
  echo "copilot-worker: FAILED exit=$EXIT exit_reason=$EXIT_REASON stall_warns=$STALL_WARNS empty=$([ -s "$RESULT" ] && echo no || echo yes) — see $ERR" >&2
  head -20 "$ERR" >&2
  # Exit with the actual process code; wall_ceiling keeps exit 124 per backward-compat contract.
  # Guard against exit 0 on empty-result failure (OK=false but copilot itself exited 0).
  _fail_code="${EXIT:-1}"; [ "$_fail_code" -eq 0 ] && _fail_code=1; exit "$_fail_code"
fi

echo "$RESULT"
