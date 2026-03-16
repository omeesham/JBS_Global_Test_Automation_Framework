#!/bin/bash
echo "=== IntelliQE — Dev Startup ==="

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Kill all child processes on exit (prevents orphans on Ctrl+C or kill)
trap 'kill 0' EXIT

# Check PostgreSQL
if command -v pg_isready &>/dev/null; then
  pg_isready -h localhost -p 5432 -q && echo "[OK] PostgreSQL running" || echo "[WARN] PostgreSQL not running — DB features disabled"
else
  echo "[WARN] pg_isready not found — skipping PG check"
fi

# Check Claude CLI
if command -v claude &>/dev/null; then
  echo "[OK] Claude CLI found ($(claude --version 2>/dev/null | head -1))"
else
  echo "[FAIL] Claude CLI not found. Install: https://docs.anthropic.com/claude-code"
  exit 1
fi

# Auto-restart wrapper with backoff (max 3s)
restart_with_backoff() {
  local name="$1"; shift
  local delay=1
  while true; do
    echo "[$name] Starting..."
    "$@"
    local exit_code=$?
    echo "[$name] Exited (code=$exit_code). Restarting in ${delay}s..."
    sleep "$delay"
    delay=$((delay < 3 ? delay + 1 : 3))
  done
}

# Start all services with auto-restart
echo "Starting Encore backend (port 3100)..."
restart_with_backoff "Encore" bash -c "cd '$ROOT' && npm run server:start" &

echo "Starting website backend (port 3001)..."
restart_with_backoff "Backend" bash -c "cd '$ROOT/website/backend' && npm run dev" &

echo "Starting frontend (port 5173)..."
restart_with_backoff "Frontend" bash -c "cd '$ROOT/website/frontend' && npm run dev" &

echo "Starting worker..."
restart_with_backoff "Worker" bash -c "cd '$ROOT' && npm run worker:start" &

echo "=== All services starting with auto-restart. Open http://localhost:5173 ==="
wait
