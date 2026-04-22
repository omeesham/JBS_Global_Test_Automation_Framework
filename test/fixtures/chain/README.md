# chain/ — test fixtures for `/chain` orchestration

Files here back unit + simulated tests for `.claude/hooks/chain-orchestrator.sh`. They never enter the real `plans/pending/` queue.

## Fixtures

| File | Purpose |
|---|---|
| `SUBPLAN_CHAIN_TEST_001_GREEN.md` | Minimal GREEN-verdict subplan (LR-041 frontmatter; ping.txt append) |
| `SUBPLAN_CHAIN_TEST_002_GREEN.md` | GREEN subplan depending on 001 |
| `SUBPLAN_CHAIN_TEST_003_YELLOW.md` | Deliberately YELLOW; tests pause path |
| `transcript-green.txt` | Canned transcript ending with `## /final-q audit` → GREEN |
| `transcript-yellow.txt` | ...YELLOW |
| `transcript-no-audit.txt` | "Verdict" mentioned only in prose — parser must return NONE |
| `transcript-two-audits.txt` | Two audit blocks (YELLOW then GREEN) — parser must return LAST (GREEN) |
| `transcript-audit-no-verdict.txt` | Audit heading present but no Verdict line → NONE |
| `queue.json` | Queue override for `CHAIN_QUEUE_OVERRIDE` env (test-only) |
| `stop-hook-input.json` | Canned Stop-hook stdin for feeding chain-orchestrator.sh |
| `_scratch/` | Runtime artifacts (gitignored) — fixture subplans append here |

## Running the smoke tests

```bash
# 1. Parse-verdict unit tests (source chain-guards.sh; loop over fixtures)
source .claude/hooks/lib/chain-guards.sh
for f in test/fixtures/chain/transcript-*.txt; do
  echo "$(basename "$f"): $(parse_verdict "$f")"
done

# 2. Orchestrator mock-spawn (no real claude child)
export CHAIN_STATE_DIR="/tmp/chain-orchestrator-test"
rm -rf "$CHAIN_STATE_DIR"
source .claude/hooks/lib/chain-state.sh
cs_init "$(cat test/fixtures/chain/queue.json | node -e '
  const q = JSON.parse(require("fs").readFileSync(0,"utf8"));
  const state = {
    schemaVersion: 1, status: "running", currentIndex: 0,
    branch: "client_deliverable", queue: q.queue,
    budget: {
      dailyCap: 10, resumeCap: 5, weeklyBudget: 50,
      executedToday: 0, executedThisWeek: 0,
      executedThisBatch: 0, batchCap: 10,
      lastInvocationKind: "start"
    }
  };
  console.log(JSON.stringify(state));
')"

CHAIN_SPAWN_CMD="echo MOCK-SPAWN" \
  cat test/fixtures/chain/stop-hook-input.json \
  | bash .claude/hooks/chain-orchestrator.sh
```

## DO NOT

- Move any `SUBPLAN_CHAIN_TEST_*.md` into `plans/pending/` — they would be picked up by the real queue builder.
- Commit anything under `_scratch/` — it's gitignored by the local `.gitignore`.
- Delete the `transcript-*.txt` files without updating Phase 4 unit tests.
