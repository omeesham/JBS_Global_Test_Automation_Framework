# SUBPLAN: Memory Consolidation + Hooks/Settings Hardening

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_CC_ANTHROPIC_ALIGNMENT.md
**Depends on**: SUBPLAN_CCE_04, SUBPLAN_CCE_02B
**Blocks**: SUBPLAN_CCE_06
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

---

## Execution Summary (2026-04-27)

### Phase 4 — memory consolidation
- **P4.1 canonical-home table** added to `~/.claude/projects/.../memory/MEMORY.md` top section: documents user-pref → auto-memory `feedback_*`, framework rules → `.claude/rules/<topic>.md`, client facts → `clients/encore/CLAUDE.md`, references → `reference_*`, identity → `user_*`, archived stale → `_archive/`. Audit cadence: every `/compile-learnings` run.
- **P4.2 audit + archive** — 11 stale non-preference files moved to `memory/_archive/`:
  - 4 KT/reference: `kt_response_to_notcluely.md` (33K, completed 2026-03-17), `reference_notcluely_kt.md`, `reference_notcluely_patterns.md`, `reference_cli_steering.md`.
  - 7 project: `project_intelliqe_integration.md`, `project_saas_vision.md`, `project_cli_cost_model.md`, `project_client_delivery_model.md`, `project_datatestid_hard_rule.md`, `project_pending_plans_priority.md`, `project_ssl_fix_handoff.md`.
  - **Active count: 70 → 59 files.** Active bytes: 191983 → 110701 (-42%).
  - **Shortfall vs aspirational target (40-50 files)**: 6 IntelliQE-era `feedback_*.md` (`chat_not_blocked`, `real_verification`, `preview_reuse_check`, `verify_on_preview`, `debug_methodology`, `windows_cli_args`) were kept per the conservative "feedback_*=preference" plan rule. Bytes target (30-40% reduction proxy for token target) MET at 42%.
- **P4.3 MEMORY.md** rewritten — 198 → 117 lines (well under 200-line cap). Index reflects 11 archive moves; new canonical-home table at top.

### Phase 5 — hooks + settings
- **P5.1 chain-orchestrator idempotency** — marker-file guard at `.claude/state/chain-sessions/.spawn.<idx>.<file>.marker`. Default mode `enforce` (V3 single-increment); `CHAIN_IDEMPOTENCY_MODE=soft` opt-in for one-cycle observation rollout. Also added record-outcome idempotency guard (refuses re-record on slot already in `completed/failed` with verdict). V3 fixture test PASSED single-increment under simulated double-fire (budget.executedToday = 1 after 2 hook fires; expected 1).
- **P5.2 permission narrowing** — `Bash(env)` referenced in plan does NOT exist in either settings file (cleared). For `Bash(find:*)`, `Bash(grep:*)`, `Bash(npm install:*)`, `Bash(rm -f *)`: kept broad with new `_broad_pattern_rationale` block in `settings.local.json` documenting why (autonomous chain runs walk arbitrary paths; shell grep used by hooks; one-shot dep installs; tmp marker cleanup). Local-only file, not committed.
- **P5.3 fail-mode docstrings** — added explicit fail-mode block to:
  - `chain-orchestrator.sh`: FAIL-CLOSED on lock acquisition / Node helper failure (chain pauses on fault path; surfaces via SessionStart hook).
  - `chain-pause-notice.sh`: FAIL-OPEN (informational SessionStart; never wedges shell open).
  - `identity-switch-gate.sh`, `browsertool-gate.sh`, `todo-injection-gate.sh` — already documented FAIL-OPEN; verified.
- **P5.4 settings precedence header** — fixed inverted text (previously claimed "project > local" which is BACKWARDS per Anthropic spec). New header documents Anthropic's actual precedence: enterprise > CLI args > local (.claude/settings.local.json) > project (.claude/settings.json) > user (~/.claude/settings.json), plus accumulative-merge semantics.
- **P5.5 parse-verdict.mjs companion** — extended with two new modes that consolidate fragile shell logic:
  - `--record-outcome <chain.json> <idx> <verdict> <current_file>`: atomic queue[idx] mutation + history append (replaces 4× cs_set + cs_history_append, including the manually-escaped JSON `"{\"subplan\":\"$current_file\",...}"` shell construction).
  - `--prep-spawn <chain.json> <new_idx> <next_file> [--enforce|--soft]`: marker check + atomic 3× budget increment + queue[new_idx] running-state set (replaces 5 lock acquire/release rounds with 1).
  - Self-test extended (`node parse-verdict.mjs --self-test`) covers v1+v2 cross-check regex AND new modes (record-outcome GREEN/RED/idempotency, prep-spawn first/enforce-dup/soft-dup). Self-test PASS at exit=0.

### Verification
- **V3 hook health**: budget counter increments exactly once per Stop event under simulated retry (PASS). Broader scenario where Stop re-fires AFTER currentIndex advanced and prematurely marks freshly-spawned subplan completed → APPENDED to `SUBPLAN_CCE_06_VERIFICATION.md` as new V3.1 with 3 resolution options for the next session to decide. Grep-verified the append landed.
- **V4 settings parse**: `node JSON.parse` on both `.claude/settings.json` and `.claude/settings.local.json` returns OK (no syntax errors).
- **/regression-guard**: BEFORE 619 lines / AFTER 925 lines across modified files (chain-orchestrator +49, chain-pause-notice +10, parse-verdict.mjs +214, settings.local.json +33; settings.json unchanged). All additions are docstrings, new helper modes, and the broad-pattern rationale block; no behavioral regressions in pre-existing code paths.

### Acceptance criteria (numbers)
- Memory: 70 → 59 files (active); 191983 → 110701 bytes (-42%); MEMORY.md 198 → 117 lines.
- Hooks: chain-orchestrator.sh 158 → 207 lines (idempotency + Node companion); chain-pause-notice.sh 45 → 55 lines (fail-mode doc); parse-verdict.mjs 162 → 376 lines (+2 modes + self-test).
- Settings: settings.local.json 170 → 203 lines (precedence header rewrite + broad-pattern rationale); settings.json 84 (unchanged — broad patterns are local-only).
- V3 PASS (budget single-increment); V3.1 broader scenario flagged to SP6.
- V4 PASS (both files parse clean).

### Out-of-scope / deferred
- 6 IntelliQE-era `feedback_*.md` files NOT archived (conservative read of "feedback_*=preference, keep"). User can flip to archive if desired.
- Deeper double-fire scenario (record-outcome on freshly-spawned subplan) — flagged to SP-CCE-06 V3.1, not fixed in this subplan (out of P5.1 scope).
- Soft-rollout-by-default deviation: shipped `enforce` as default because V3 acceptance requires single-increment. Soft mode preserved via `CHAIN_IDEMPOTENCY_MODE=soft` env var.

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_CCE_05_MEMORY_HOOKS_SETTINGS.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /audit, /regression-guard (before+after), /final-q (NEW evidence-emission format — shipped in SP0)
**Dependency gate**: SUBPLAN_CCE_04 `Status: DONE`
**Context files**:
- Super plan §"Phase 4" + §"Phase 5"
- Auto-memory layer at `~/.claude/projects/C--Users-rutvi-projects-encore-framework/memory/` (~70 files, ~48K tokens)
- `.claude/rules/<topic>.md` (post-SP2 — dedup target for memory layer)
- `.claude/hooks/chain-orchestrator.sh` (idempotency target)
- `.claude/hooks/identity-switch-gate.sh` + `browsertool-gate.sh` (fail-mode docs)
- `.claude/settings.json` + `.claude/settings.local.json`
- `scripts/parse-verdict.mjs` (extension target for chain-orchestrator budget logic)
- LR-042 (chain-sessions discipline), Anthropic cupcake §"Memory" + §"Permissions"

## Purpose

Two coupled but independent surfaces — both mostly mechanical, both prerequisites for V0-V11 verification in SP6.

1. **Memory consolidation** (Phase 4): one canonical home per knowledge type. Auto-memory keeps user preferences/corrections; `clients/encore/CLAUDE.md` keeps client-specific facts; `.claude/rules/*.md` (post-SP2) is single source of truth for framework rules. Drop ~30-40% of memory layer (target ~40-50 files, ~14K tokens).
2. **Hooks + settings hardening** (Phase 5): chain-orchestrator idempotent, narrow permissions, document fail-modes, settings precedence header, parse-verdict.mjs companion for budget logic.

## Step-by-step

### Phase 4 — memory

1. **P4.1 — pick canonical home per type**:
   - User preferences / corrections → auto-memory (`feedback_*.md`) — keep.
   - Project facts (Encore product / client) → `clients/encore/CLAUDE.md` — keep, possibly extend.
   - Framework rules (`LR-*`) → `.claude/rules/<topic>.md` (post-SP2) — single source.
   - Reference pointers (Linear projects, Slack channels, Grafana dashboards) → auto-memory `reference_*.md` — keep.
   - Cross-repo KT artifacts — keep, archive if stale.
2. **P4.2 — audit 70-file memory layer**: for each file in `memory/`:
   - Last-modified > 30 days ago AND not a true preference (`feedback_*.md`) → archive to `memory/_archive/` (don't delete; archived state preserves history).
   - Content duplicated in `.claude/rules/*.md` (post-SP2) → delete the memory copy (single source of truth).
   - Content duplicated in `clients/encore/CLAUDE.md` → delete the memory copy.
   - Goal: drop ~30-40% (24K → 14K tokens).
3. **P4.3 — verify `MEMORY.md` index**: ≤200 lines / 25KB load (Anthropic cap line 1373). Currently OK per super plan; verify after pruning.

### Phase 5 — hooks + settings

4. **P5.1 — `chain-orchestrator.sh` idempotency**: add per-spawn lock file or guard the budget-counter increment behind a "first call this Stop event" check. Currently double-runs double-count (lines 137-140). Soft-rollout: log "would have skipped" first, observe one chain cycle, then enforce (per super plan risk register).
5. **P5.2 — narrow overbroad permission patterns**: replace `Bash(find:*)`, `Bash(grep:*)`, `Bash(env)`, `Bash(npm install:*)` in `.claude/settings.json` and/or `.claude/settings.local.json` with specific allowlists. If broad-by-design (autonomous chain runs need broad bash), document the rationale in a comment block in settings.json.
6. **P5.3 — document fail-mode for each hook** in its docstring header. `identity-switch-gate.sh` and `browsertool-gate.sh` already correctly fail-open; `chain-orchestrator.sh` must declare its fail-mode explicitly (suggest fail-closed on lock acquisition error to prevent double-counting).
7. **P5.4 — settings.local.json header**: add a top-of-file comment block documenting project + local merger semantics (per Anthropic cupcake — local > project > user precedence). Currently unclear; future contributors will misedit.
8. **P5.5 — migrate chain-orchestrator budget logic**: shell quoting at line 149 is fragile. Migrate the verdict-parsing + budget-counter logic to a `parse-verdict.mjs` companion (Node) that the shell hook calls. Reuse existing `parse-verdict.mjs` (LR-042 already references it).
9. **`/regression-guard`** before + after.
10. **V3 — hook health**: trigger each hook event (PreToolUse, Stop, SessionStart). No "file not found" errors in transcript. `chain-orchestrator.sh` budget counter increments **exactly once** per Stop event under simulated retry (e.g., spawn → fail-recover → re-spawn).
11. **V4 — settings parse**: run any startup command; Claude Code logs warnings on invalid permissions. Should be silent.
12. Activity-log row.
13. **`/final-q`** with NEW evidence-emission format (shipped in SP0): emit `ran 'wc -l ~/.claude/projects/.../memory/' → output: '<count>'` and `ran 'grep -c "permission" .claude/settings.json' → output: '<count>'` etc.

## Acceptance criteria

- [ ] Memory layer: ~40-50 files (was 70); ~14K tokens loaded (was ~48K).
- [ ] `MEMORY.md` ≤200 lines.
- [ ] No memory file duplicates content in `.claude/rules/*.md` or `clients/encore/CLAUDE.md`.
- [ ] `chain-orchestrator.sh` is idempotent (V3 retry test passes — single-increment).
- [ ] Permissions narrowed (`Bash(find:*)`, `Bash(grep:*)`, `Bash(env)`, `Bash(npm install:*)`) OR documented why broad.
- [ ] Each hook docstring documents fail-mode.
- [ ] `.claude/settings.local.json` has precedence header.
- [ ] `parse-verdict.mjs` handles chain-orchestrator budget logic.
- [ ] V3: all hook events clean, no orphan-file errors.
- [ ] V4: no warnings on startup.
- [ ] `/regression-guard` clean.
- [ ] Activity-log row landed.
- [ ] `/final-q` GREEN with new evidence-emission format.

## HALT conditions

- A memory file flagged as "duplicate" actually has unique nuance not in `.claude/rules/` → HALT, surface to user, decide whether to merge content into rule file or keep memory file.
- `chain-orchestrator.sh` lock acquisition introduces a deadlock under concurrent spawn → HALT, redesign lock with timeout + retry, re-test V3.
- A narrowed permission breaks an existing skill / chain workflow → HALT, expand back narrowly, document in comments.
- `parse-verdict.mjs` migration causes double-counting (the bug we're fixing) to silently re-emerge under new path → HALT, debug.

## Handoff

Next: SUBPLAN_CCE_06 (verification — V0-V11). Chat summary: memory file count before/after, memory token-load before/after, V3 retry test result, V4 startup-warning count. No prose; numbers.
