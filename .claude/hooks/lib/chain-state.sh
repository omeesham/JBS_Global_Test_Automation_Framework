#!/usr/bin/env bash
# chain-state.sh — state read/write helpers for chain orchestration.
# Backed by a node JSON helper (jq unavailable on this Git Bash).
# mkdir-based locking (flock unavailable). Source this file; don't exec it.
#
# Public functions:
#   cs_init_dirs              — mkdir -p .claude/state + subdirs
#   cs_exists                 — test -f chain.json (exit 0 if present)
#   cs_get <path>             — stdout = value at dotted path; exit 1 if missing
#   cs_set <path> <json>      — write value (locked, atomic). JSON parsed if valid.
#   cs_inc <path>             — numeric increment (locked, atomic)
#   cs_history_append <json>  — push object onto .history[] (locked)
#   cs_pause <reason>         — set status=paused + pauseReason (locked)
#   cs_init <json>            — initialize chain.json from given JSON (locked)
#   cs_lock_acquire           — mkdir-based lock (15s timeout)
#   cs_lock_release           — rmdir lock dir

set -u

CHAIN_STATE_DIR="${CHAIN_STATE_DIR:-.claude/state}"
CHAIN_STATE_FILE="$CHAIN_STATE_DIR/chain.json"
CHAIN_STATE_LOCK="$CHAIN_STATE_DIR/chain.lock.d"
CHAIN_NODE_HELPER="$(dirname "${BASH_SOURCE[0]}")/chain-state.mjs"

cs_init_dirs() {
  mkdir -p "$CHAIN_STATE_DIR/chain-sessions" "$CHAIN_STATE_DIR/chain-archive"
}

cs_exists() { [ -f "$CHAIN_STATE_FILE" ]; }

cs_lock_acquire() {
  mkdir -p "$CHAIN_STATE_DIR"
  local tries=0
  while ! mkdir "$CHAIN_STATE_LOCK" 2>/dev/null; do
    tries=$((tries + 1))
    if [ "$tries" -gt 15 ]; then
      echo "chain-state: lock timeout ($CHAIN_STATE_LOCK held)" >&2
      return 1
    fi
    sleep 1
  done
  return 0
}

cs_lock_release() { rmdir "$CHAIN_STATE_LOCK" 2>/dev/null || true; }

cs_get() {
  node "$CHAIN_NODE_HELPER" get "$CHAIN_STATE_FILE" "$1"
}

cs_set() {
  cs_lock_acquire || return 1
  node "$CHAIN_NODE_HELPER" set "$CHAIN_STATE_FILE" "$1" "$2"
  local rc=$?
  cs_lock_release
  return $rc
}

cs_inc() {
  cs_lock_acquire || return 1
  node "$CHAIN_NODE_HELPER" inc "$CHAIN_STATE_FILE" "$1"
  local rc=$?
  cs_lock_release
  return $rc
}

cs_history_append() {
  cs_lock_acquire || return 1
  node "$CHAIN_NODE_HELPER" history-append "$CHAIN_STATE_FILE" "$1"
  local rc=$?
  cs_lock_release
  return $rc
}

cs_pause() {
  cs_lock_acquire || return 1
  node "$CHAIN_NODE_HELPER" pause "$CHAIN_STATE_FILE" "$1"
  local rc=$?
  cs_lock_release
  return $rc
}

cs_init() {
  cs_init_dirs
  cs_lock_acquire || return 1
  node "$CHAIN_NODE_HELPER" init "$CHAIN_STATE_FILE" "$1"
  local rc=$?
  cs_lock_release
  return $rc
}
