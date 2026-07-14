# SUBPLAN_LCD_06_SELF_PRUNING — Ongoing anti-bloat mechanism

**Status**: Pending
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**Parent**: PLAN_LAZY_CEO_DELEGATOR.md
**Depends on**: SUBPLAN_LCD_05_LEARNING_LANES.md
**Blocks**: SUBPLAN_LCD_08 (Step 4 of LCD_08 requires LCD_06 decay/prune step)
**Runs-after**: LCD_05
**Collides-with**: PLAN_LOSSLESS_DEEP_TRIM (same surface — this generalizes what TRIM does manually)
**Model**: claude-opus-4-6
**PermissionMode**: default
**RiskAcknowledged**: HIGH — incorrect pruning could eat a live branch or active learning

---

## Objective

`PLAN_LOSSLESS_DEEP_TRIM` + its 6 subplans do manual one-shot pruning. This subplan generalizes that into an ONGOING mechanism: a metric for "too bloated to traverse," a trigger cadence, archive-never-delete semantics, and provable never-prune-a-live-branch guarantees. Covers both CEO and worker lanes, plus the `~/.claude/delegation/` state directory.

---

## Preconditions

- LCD_05 landed (lane boundaries defined — pruning must respect them)
- `PLAN_LOSSLESS_DEEP_TRIM.md` exists with its Re-Proof Protocol (§ lines 31-47) and Untouchables list
- Owner intent: archive/recover, never delete user data (`PLAN_LOSSLESS_DEEP_TRIM.md:19-24`)

---

## Step-by-Step

### Phase 1 — Define bloat metrics and thresholds

1. Create `~/.claude/delegation/pruning-policy.md`:
   ```markdown
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
   ```

### Phase 2 — Re-Proof Protocol (imported from PLAN_LOSSLESS_DEEP_TRIM)

2. Every pruning candidate must pass the Re-Proof before archival:
   - `grep -rn "<filename-stem>" --include="*.md" --include="*.mjs" --include="*.ts" --include="*.sh" --include="*.json"` → zero live callers outside plans/done/
   - If ANY live reference found → DROP from pruning candidate list, log reason
   - This is the same protocol from `PLAN_LOSSLESS_DEEP_TRIM.md:31-47`, now automated into a script

3. Create `scripts/prune-check.mjs`:
   - Input: list of candidate paths
   - For each: run the 5-class grep (code refs, plan refs, config refs, hook refs, doc refs)
   - Output: `{path, verdict: "safe"|"live-ref", refs: [...]}` JSON per candidate
   - Exit 1 if ANY candidate has live refs (fail-safe)

### Phase 3 — Retention for delegation state (`~/.claude/delegation/`)

4. Define retention rules:
   - `ledger.jsonl`: NEVER prune (append-only audit log)
   - `reports/`: retain 50 most recent; archive older (by mtime)
   - `self_incidents.log`: NEVER prune (audit evidence)
   - `grants-audit.log`: NEVER prune
   - `stall-queue/`: prune bounce tickets older than 7 days (ephemeral by nature)
   - `session-role.json`: overwritten per session (no growth)
   - `session-bash-nudges.json`: prune entries older than 30 days

### Phase 4 — Integration with `/compile-learnings`

5. Add a "§ Pruning Check" step to `/compile-learnings` SKILL.md:
   - After graduation (existing), run bloat metric checks
   - If any threshold exceeded: emit a list of candidates to the session log
   - Require Rutvik confirmation before any archival action (no autonomous deletion)
   - Log the check result to `~/.claude/delegation/pruning-log.md` (date + metrics + action)

### Phase 5 — Verification

6. Run `scripts/prune-check.mjs` on a known-dead file → confirm "safe" verdict
7. Run on a known-live file → confirm "live-ref" verdict with correct ref list
8. Verify thresholds: `find plans/pending/ -name "*.md" | wc -l` → compare to threshold
9. Verify never-prune guards: create a .lock file next to a candidate → confirm it's excluded

---

## Verification Artifact

- `prune-check.mjs` output for test candidates (safe and live-ref)
- Pruning-policy.md content with all thresholds defined
- Metric snapshot showing current state vs thresholds

---

## Rollback

- Delete `scripts/prune-check.mjs`
- Delete `~/.claude/delegation/pruning-policy.md`
- Revert `/compile-learnings` SKILL.md pruning-check step
- No data was deleted (archive-only); archived files can be mv'd back
