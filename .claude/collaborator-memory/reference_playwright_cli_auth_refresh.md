---
name: reference-playwright-cli-auth-refresh
description: "How to refresh an expired playwright-cli Encore auth session (state-file path gotcha included)"
metadata:
  node_type: memory
  type: reference
  originSessionId: 38d0a46b-daca-4faa-9d6e-d76d0b09e3de
---

When a `playwright-cli` session redirects to `/navigator/auth/sign-in` (or `login.microsoftonline.com`), the stored auth is expired. Do **not** hand-drive Microsoft SSO — reuse the suite's tested login (the automation user has no MFA):

1. `cd clients/encore && npx playwright test --project=setup` — runs `tests/auth.setup.ts`, which loads `.env.local` creds, auto-drives the Navigator "Continue Now" → Microsoft SSO → "Stay signed in", and **rewrites `clients/encore/.auth/encore-state.json`** (validates session+csrf cookies). ~40s. (Local runs default to `.env.local` per LR-ENC-003 — never set `CI_ENV=e2e`.)
2. Load that fresh file into the CLI: `playwright-cli -s=e2e open` → `playwright-cli -s=e2e state-load clients/encore/.auth/encore-state.json` → navigate.

**Gotcha (cost a retry 2026-07-06):** the suite writes to **`clients/encore/.auth/encore-state.json`**, but the repo ALSO has a stale root **`.auth/encore-state.json`** (older). `playwright-cli state-load` the *client* path, not the root one. Verify landing with `playwright-cli --raw -s=e2e eval "() => window.location.href"` — it must stay on the app URL, not bounce to `/auth/sign-in` a few seconds later.

Cross-ref: [[feedback_browser_tool_selection]], [[reference_playwright_cli_and_subagent_limits]]. Browser-tool Gate 3 (try-it-and-see) in `.claude/rules/browser-tool.md`.
