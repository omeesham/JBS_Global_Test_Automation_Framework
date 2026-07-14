# SUBPLAN_LCD_08_MEMORY_HINTS — Worker memory hints (P3 LOW — PARKED)

**Status**: Pending
**Priority**: P3 (LOW — PARKED, do NOT promote)
**Created**: 2026-07-13
**Identity**: OWNER
**Parent**: PLAN_LAZY_CEO_DELEGATOR.md
**Depends on**: SUBPLAN_LCD_05_LEARNING_LANES.md, SUBPLAN_LCD_06_SELF_PRUNING.md (BLOCKED until BOTH land; Step 4 requires LCD_06 decay/prune step to exist)
**Blocks**: none
**Runs-after**: LCD_06 (LAST in run-order; LCD_06 must land before Step 4 can execute)
**Collides-with**: none
**Model**: claude-opus-4-6
**PermissionMode**: default
**RiskAcknowledged**: HIGH — stale/poisoned memories, PII persistence, learning-lane bypass

---

## Risk Gate (why P3, not P0)

Both frontier evaluators (Opus + GPT) independently concluded: **genuinely useful but NOT safe to promote**. Prompt caching already captures the clean token-saving win. Durable worker memory adds only moderate extra savings + quality while introducing S0/S1 risks:

- **Stale memory**: same-day code/selector moves invalidate persisted lessons
- **Context rot**: a bad lesson persisted early poisons many future dispatches
- **False confidence**: worker trusts memory over fresh observation
- **Secret/PII persistence**: accidental credential/data storage in memory files
- **Learning-lane bypass**: worker-written memory as an unreviewed learning channel (circumvents CEO verify-pointer membrane from LCD_05)

This subplan is LAST in the run-order. It MUST NOT block or reorder any P0 delegation-fix subplan.

---

## Minimal Safe Design (both evaluators converged — simplest form only)

### Scope

One tiny scoped file per agent: `~/.copilot/agents/<agent-name>.hints.md`

### Content rules (HINTS ONLY, not truth)

- Stores ONLY short behavioral/domain lessons: selector quirks, timing gotchas, validation patterns, "never do X on this module"
- **NEVER**: code blobs, credentials, user/client data, test data, unverified hypotheses, full technique
- Max entry: 2 lines per hint
- Max file: ~2KB total (~40 hints)

### Injection

- Injected AFTER the stable cached prompt prefix (existing agent system prompt)
- Under header: `## HINTS ONLY — verify before relying`
- Retrieval-gated: top-k most relevant to current ticket (by keyword match against ticket GOAL + SCOPE)
- Never injected into prompt prefix (would break caching)

### Write controls

- **Per-agent namespace**: generator hints go only to generator.hints.md
- **Domain write-gate**: only the CEO (via `/reflect` or `/compile-learnings`) can write hints — workers CANNOT write their own memory (prevents learning-lane bypass)
- **Append-only atomic writes**: tmp+rename, never in-place edit
- **Source filtering**: NO writes from failed/healer/debug/blocked runs (bad runs don't teach)

### Decay (Ebbinghaus-inspired)

- **30-day stale-mark**: hints not referenced in 30 days get `[STALE]` prefix
- **60-day prune**: `[STALE]` hints past 60 days are archived to `<agent>.hints-archive.md`
- **CEO audit**: before trusting any worker output, CEO can delete/edit any hint (LR-042 poisoned-memory catch)

### Integration with LCD_05 (learning lanes)

- Hints are a SUBSET of the worker-lane: only graduated, verified lessons become hints
- Flow: worker mistake → `/reflect` routes to agent § Lessons (LCD_05) → `/compile-learnings` graduates recurring pattern → hint written to `.hints.md`
- CEO verify-pointer exists in dispatcher-lessons for every hint (membrane rule from LCD_05)
- A hint that a CEO audit marks as wrong → deleted + counter-lesson written to agent § Lessons

---

## Step-by-Step (for when this plan is eventually promoted)

1. Create hint file schema and write/read utilities
2. Add hint-injection to `copilot-worker.sh` ticket context loading (after DUTY_STACK, before ticket body)
3. Add CEO-only write path in `/compile-learnings` graduation step
4. Add 30/60 day decay cron check to `/compile-learnings` pruning step (LCD_06)
5. Test: dispatch worker with relevant hint → confirm hint appears in worker context under "HINTS ONLY" header
6. Test: attempt worker self-write → confirm denied
7. Test: 60-day-old hint → confirm archived

---

## Verification Artifact

- Hint file content showing ≤2KB, correct format
- Worker context showing hint injection under "HINTS ONLY" header
- Decay test: stale-marked hint at 30d, pruned at 60d

---

## Rollback

- Delete `~/.copilot/agents/*.hints.md` files
- Revert copilot-worker.sh hint-injection addition
- Revert `/compile-learnings` hint-write step
