# SUBPLAN_LCD_06_SELF_PRUNING — Ongoing anti-bloat mechanism

**Status**: DONE
**Executed**: 2026-07-16
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

`PLAN_LOSSLESS_DEEP_TRIM` + its 6 subplans do manual one-shot pruning. This subplan generalizes that into an ONGOING mechanism: a metric for "too bloated to traverse," a trigger cadence, archive-never-delete semantics, and provable never-prune-a-live-branch guarantees. Covers both CEO and worker lanes, plus the home delegation state directory.

---

## Preconditions

- LCD_05 landed (lane boundaries defined — pruning must respect them)
- `PLAN_LOSSLESS_DEEP_TRIM.md` exists with its Re-Proof Protocol (§ lines 31-47) and Untouchables list
- Owner intent: archive/recover, never delete user data (`PLAN_LOSSLESS_DEEP_TRIM.md:19-24`)

---

## Step-by-Step

### Phase 1 — Define bloat metrics and thresholds

1. Create a pruning-policy file in the home delegation dir:
   ```markdown
   # Pruning Policy (ongoing mechanism)
   
   ## Bloat metrics (machine-checkable)
   - plans/pending/ file count: THRESHOLD = 40 (currently ~133; post-TRIM target ≤40)
   - dispatcher-lessons.md line count: THRESHOLD = 30 (LCD_05 cap)
   - worker-primer.md line count: THRESHOLD = 80 (LCD_05 cap)
   - Per-agent *.agent.md § Lessons entry count: THRESHOLD = 20
   - delegation reports/ file count: THRESHOLD = 50 (retain 50 most recent)
   - state ua-worker/ directory count: THRESHOLD = 100 worker-result dirs
   - Memory body files (feedback_*.md): THRESHOLD = 60 (currently 59 per MEMORY.md:5)
   
   ## Trigger cadence
   - CHECK: Every `/compile-learnings` run (weekly or flagged)
   - ACTION: If ANY metric exceeds threshold → initiate pruning pass for that surface
   
   ## Archive semantics (OWNER HARD RULE: never delete)
   - Plans: mv to plans/done/ with SUPERSEDED/SUBSUMED/RESOLVED-BY note (existing TRIM protocol)
   - Reports: mv to a delegation reports _archive/ dir (outside active dir listing)
   - Worker results: mv to a state ua-worker _archive/ dir (compressed)
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

### Phase 3 — Retention for delegation state (home delegation dir)

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
   - Log the check result to a pruning-log file in the home delegation dir (date + metrics + action)

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
- Delete the pruning-policy file from the home delegation dir
- Revert `/compile-learnings` SKILL.md pruning-check step
- No data was deleted (archive-only); archived files can be mv'd back

---

## Execution Summary

**Executed 2026-07-16 via the copilot council loop** (Claude = dispatcher only; zero inline self-work on deliverables). Executor: claude-opus-4.6 (runs lcd06-build-0716 R1/R2/R3). Cross-provider reviewer: gpt-5.5 (run lcd06-review-0716 → BOUNCE with 2 defects; run lcd06-review-0716-r2 → GREEN with its own probe re-run 49/49). Round trail: R1 hit the credit cap after writing all 5 build files (verify phase unrun); R2 verify-only bounce ran the battery clean; review bounced 2 defects; R3 fixed both + added probe P8; re-review GREEN.

### Deliverables (all landed 2026-07-16)

1. **Pruning policy** — placed at `C:\Users\rutvi\.claude\delegation\pruning-policy.md` (staged source `.claude/state/ua-worker/lcd06-build-0716-artifacts/pruning-policy.staged.md`, hash-identical after placement). Contains all 7 bloat metrics with thresholds, trigger cadence (every `/compile-learnings`), 4 archive-semantics rows (never delete), and all 5 never-prune guards (LIVE-BRANCH / ACTIVE-SESSION / WORKTREE-LOCK / SEQUENTIAL-DEPENDENCY / UNTOUCHABLES).
2. **Re-proof automation** — `scripts/prune-check.mjs`: 5-class live-reference grep per candidate, JSON verdict per path, never-prune guards applied as pre-filters BEFORE the ref scan, exit codes 0 (all safe) / 1 (any live-ref, fail-safe) / 2 (input error — missing candidate is a loud failure, never a silent "safe").
3. **Skill integration** — `.claude/skills/compile-learnings/SKILL.md` gained Step 4.7 "§ Pruning Check": metric table, prune-check gate on candidates, dated row appended to a pruning-log file in the home delegation dir, and the verbatim constraint "**Rutvik confirmation REQUIRED before any archival — no autonomous deletion ever.**" Phase-3 retention rules included as a table (ledger.jsonl / self_incidents.log / grants-audit.log NEVER prune; reports keep-50; stall-queue 7 days; nudge-counter 30 days). Zero base headings removed — LCD_05's Step 3.5 and Step 4.6 survive verbatim (probe P6 fingerprint, 16/16 headings).

### Verification (Phase 5 items, all machine-proven)

Battery: `.claude/state/ua-worker/lcd06-build-0716-artifacts/probes.verify.txt` — **49 PASS / 0 FAIL** (builder run; reviewer independently re-ran the same battery 49/49 in its own artifacts dir).

- Item 6 (known-dead → safe): probe P2 — fixture referenced by nothing → verdict `safe`, exit 0.
- Item 7 (known-live → live-ref): probe P3 — fixture referenced by a caller → verdict `live-ref` with the caller in `refs[]`, exit 1.
- Item 8 (threshold snapshot): probe P7 read-only real-state metrics — plans/pending 118 vs threshold 40 (OVER, pending TRIM); dispatcher-lessons 49 lines vs 30 (OVER); reports 236 vs 50 (OVER); memory feedback files 101 vs 60 (OVER); ua-worker dirs 6 vs 100 (OK). Over-threshold surfaces are the TRIM family's queue — no archival performed (Phase 4 rule: owner confirmation required).
- Item 9 (guards): probe P4a fresh-mtime → UNTOUCHABLE ACTIVE-SESSION; P4b `.lock` sidecar → UNTOUCHABLE WORKTREE-LOCK; P5 batch exit-1 fail-safe; P8 nonexistent candidate → exit 2 + stderr (no false-safe).

Integrity: `sha256-manifest.txt` in the artifacts dir covers all staged files, fixtures, and the probe runner.

### Defects found by cross-review (both fixed in R3)

- DEFECT-1 (HARD): memory-metric path pointed at a nonexistent home `.claude/memory/` dir — the metric would have reported N/A forever and never fired. Fixed: runtime project-slug derivation with a directory-scan fallback; P7 now reports the real numeric count (101).
- DEFECT-2 (medium): a missing candidate path returned verdict `safe` (false negative). Fixed: loud failure, exit 2 + stderr; new probe P8 pins the behavior.

### Deviations from plan

- Exit-code contract extended beyond the plan's exit-1 spec: exit 2 added for input errors (reviewer-driven, D12 lesson — a validator must treat missing expected input as loud failure).
- The plan's literal policy text hardcoded the memory path; the landed version derives the project slug at runtime instead (same metric, correct target).
- Nothing was archived, moved, or deleted in this execution — the plan lands the MECHANISM only; every future archival requires explicit owner confirmation per Phase 4.

### Documentation

- LR-028 activity-log row appended for this closure.
- Parent `PLAN_LAZY_CEO_DELEGATOR.md` annotated with the child DONE line per LR-027 parent-cascade.
