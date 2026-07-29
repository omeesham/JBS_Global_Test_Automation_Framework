<!-- source: plans/pending/SUBPLAN_LCD_06_SELF_PRUNING.md Phase 1 — 2026-07-16 — dispatcher applies to home delegation dir -->
# Pruning Policy (ongoing mechanism)

## Bloat metrics (machine-checkable)
- plans/pending/ file count: THRESHOLD = 40 (currently ~133; post-TRIM target ≤40)
- dispatcher-lessons.md line count: THRESHOLD = 30 (LCD_05 cap)
- worker-primer.md line count: THRESHOLD = 80 (LCD_05 cap)
- Per-agent *.agent.md § Lessons entry count: THRESHOLD = 20
- ~/.claude/delegation/reports/ file count: THRESHOLD = 50 (retain 50 most recent)
- ~/.claude/state/ua-worker/ directory count: THRESHOLD = 100 worker-result dirs
- Memory body files (feedback_*.md): THRESHOLD = 60 (currently 59 per MEMORY.md:5)

## Trigger cadence
- CHECK: Every `/compile-learnings` run (weekly or flagged)
- ACTION: If ANY metric exceeds threshold → initiate pruning pass for that surface

## Archive semantics (OWNER HARD RULE: never delete)
- Plans: mv to plans/done/ with SUPERSEDED/SUBSUMED/RESOLVED-BY note (existing TRIM protocol)
- Reports: mv to ~/.claude/delegation/reports/_archive/ (outside active dir listing)
- Worker results: mv to ~/.claude/state/ua-worker/_archive/ (compressed)
- Memory bodies: mv to memory/_archive/ with mtime tag (existing compile-learnings pattern)
- Agent lessons: graduate to worker-primer.md, prune from agent file (LCD_05)

## Never-prune guards (provable)
- LIVE-BRANCH: Any plan whose Status ≠ done/superseded/cancelled → UNTOUCHABLE
- ACTIVE-SESSION: Any file with mtime < 24h → UNTOUCHABLE (avoid pruning in-flight work)
- WORKTREE-LOCK: Any path with .lock sidecar → UNTOUCHABLE
- SEQUENTIAL-DEPENDENCY: If plan B depends-on plan A, A cannot be pruned until B is done
- UNTOUCHABLES (inherit from TRIM): plans/INDEX.md, CLAUDE.md, worker-ext.md, AGENT_SHARED_RULES.md

## Delegation state retention (Phase 3 — ~/.claude/delegation/)

| File / Dir | Rule |
|---|---|
| `ledger.jsonl` | NEVER prune — append-only audit log |
| `reports/` | Retain 50 most recent; archive older by mtime |
| `self_incidents.log` | NEVER prune — audit evidence |
| `grants-audit.log` | NEVER prune |
| `stall-queue/` | Prune bounce tickets older than 7 days (ephemeral) |
| `session-role.json` | Overwritten per session — no growth, no action needed |
| `session-bash-nudges.json` | Prune entries older than 30 days |
