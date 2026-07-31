---
name: preview_start reused does not mean alive
description: When preview_start returns reused=true, always verify the server is actually listening with a health check or port check
type: feedback
---

`preview_start` returning `reused: true` does NOT guarantee the server process is alive. The preview system caches the server entry but the underlying process may have crashed.

**Why:** Backend showed "reused" and logs showed successful startup from a previous run, but `netstat` proved port 3001 wasn't listening. The Vite proxy then returned 500 for all `/api/*` requests, which looked like an application error but was just a dead backend.

**How to apply:** After any `preview_start` with `reused: true`:
1. Run `curl -s http://localhost:<port>/api/health` or equivalent health check
2. If connection refused → `preview_stop` then `preview_start` again (fresh)
3. Don't trust cached logs — they may be from the previous (now-dead) process run
