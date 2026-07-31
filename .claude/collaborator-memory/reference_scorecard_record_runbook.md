---
name: scorecard-record-runbook
description: "Exact scorecard.mjs record invocation from repo cwd — LEDGER_PATH env required, --ticket flag name, work-type enum lags wrapper"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 14569614-5e89-4e43-8d5e-2e823ba75442
---

Recording dispatch outcomes (mandated at receipt time by worker-ext.md) from the repo cwd:

```
LEDGER_PATH="$(pwd)/.claude/state/ua-worker/ledger.jsonl" \
node "$HOME/.claude/delegation/scorecard.mjs" record \
  --run-id <id> --ticket <TICKET-id> --work-type <type> \
  --outcome <green|bounced-then-green|refuted|env-blocked|failed> \
  --bounces <n> --ts <ISO>
```

Gotchas (all hit 2026-07-12): flag is `--ticket` NOT `--ticket-id`; without `LEDGER_PATH` the recorder reads the ledger in ITS OWN dir (`~/.claude/delegation/ledger.jsonl`) → "run_id not found"; recorder's work-type enum (`build,review,verify,draft,rca,walk,probe`) LAGS the wrapper enum (`research` missing) — fix planned in plans/pending/PLAN_UPLINK_PROTOCOL.md Phase 3.5; until it lands, research outcomes are unrecordable (do not mislabel them as probe).
