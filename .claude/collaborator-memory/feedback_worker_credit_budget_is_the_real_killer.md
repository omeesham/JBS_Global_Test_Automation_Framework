---
name: feedback-worker-credit-budget-is-the-real-killer
description: "Copilot workers die on AI-credit exhaustion, not stalls or batch writes — 30 credits buys ~4 model turns; dispatch build tickets at 200"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8e8a38b6-2071-4cbd-a694-d72b98d4f1c9
  modified: 2026-07-25T12:31:22.422Z
---

**`--max-credits 30` is not a floor, it is a death sentence for any real build ticket.** The Copilot
CLI injects a `<session_limits_status>` block into the worker's own conversation:

```
Remaining session limits: 30 AI credits.
Remaining session limits: 8.99 AI credits.
Remaining session limits: 2.55 AI credits. Final model call for this session:
do not call tools; summarize progress, state what remains, and stop.
```

At 2.55 the CLI **orders the worker to stop and summarize**. The worker obeys, writes a
"Session Budget Exhausted" report, and exits 0. From outside this is indistinguishable from a stall
or a lazy worker — and it is neither.

**Measured 2026-07-25, two runs, same shape:**
- opus-4.6: 30 → 8.99 → 2.55, dead in **43 seconds** after ~5 tool calls (~7-10 credits/turn)
- sonnet-4.6: 30 → 17.62 → 12.17 → 2.48, dead after 4 turns (~5-9 credits/turn)

**Credits scale with CONTEXT SIZE, not wall-clock.** Every ticket dispatch prepends the 11.8KB
DUTY_STACK, plus the CLI injects the entire skill catalog into the system prompt. The worker is
already carrying a large context before it reads one line of the ticket. So a *short* ticket does
not buy more turns — the floor cost is the preamble.

**How to apply:**
- `--max-credits 200` for `build`/`rca`/`walk` tickets (~25-40 turns). 30 is fine only for a
  one-shot `probe`.
- Before diagnosing a zero-output death as a stall, batch-write, or laziness, run:
  `grep -oE 'Remaining session limits: [0-9.]+ AI credits' <runDir>/process-*.log`
  Four descending numbers ending near zero = credit exhaustion, full stop. No other theory needed.
- A worker's own "budget exhausted" claim is one of the few worker claims that IS machine-verifiable
  — verify it rather than dismissing it. Here the worker was telling the truth and I had it filed as
  a fabrication candidate.

**Why this matters beyond dispatch:** `meta.json` records `tokens_in: null`, `tokens_out: null` and
`exit: 0`, and the ledger writes `ok=false exit_reason=no-report-schema`. None of those name the real
cause. The only honest signal is inside the debug log. Related:
[[feedback-worker-one-file-per-dispatch]] (a DIFFERENT death mode — batched Write calls; do not
conflate them), [[reference-delegation-tooling-gotchas]], [[feedback-copilot-output-untrusted]].
