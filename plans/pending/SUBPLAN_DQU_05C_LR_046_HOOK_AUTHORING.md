# SUBPLAN SP-DQU-05C — Structural enforcement hook for LR-046 (strict plan lines)

**Status**: Pending
**Priority**: P1-CYCLE-1
**Created**: 2026-04-28
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Spawned by**: SP-DQU-05B Phase 4 (LR-046 prose landed; hook authoring deferred for adversarial audit + dedicated planning)
**Depends on**: SP-DQU-05B `Status: DONE` (LR-046 prose must exist before hook fixtures can target it)
**Blocks**: nothing (LR-046's skill-mandate enforcement in `/execute` Phase 4 + `/final-q` Step 3 already covers the prose layer; hook is the structural backstop for chain-spawned runs that bypass interactive review)
**Identity**: OWNER (hook code lives in `.claude/hooks/`, `.claude/hooks/lib/`, `scripts/`, `.claude/settings.json` — all OWNER RW)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**Skills**: /planning (Step 1 — adversarial audit per SUPREME RULE), /execute, /regression-guard, /final-q

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md`

**Phase 0 directive**: read LR-046 verbatim from `.claude/rules/pipeline.md` BEFORE designing fixtures — the hook's classification logic must mirror the rule's "strict trigger" enumeration exactly. Drift between rule prose and hook regex = silent enforcement gap.

**Context files** (read before Phase 0):
- `.claude/rules/pipeline.md` LR-046 (the rule body — drives fixture design + regex spec)
- `.claude/hooks/identity-switch-gate.sh` + `.claude/hooks/lib/check-identity-switch.mjs` (precedent — PreToolUse pattern, fail-OPEN policy, override-handshake parity)
- `.claude/hooks/todo-injection-gate.sh` + `.claude/hooks/lib/check-todo-injection.mjs` (precedent — TodoWrite-state capture pattern + transcript-driven `/execute` detection)
- `.claude/settings.json` (hook registration point)
- `plans/done/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` Execution Summary (the closure that motivated LR-046 — fixture #1 reproduces this scenario)
- `plans/done/SUBPLAN_DQU_05B_STRICT_PLAN_LINE_REMEDIATION.md` Execution Summary (the remediation that landed LR-046 prose — fixture #0 = "post-LR-046 the hook would have caught SP-DQU-05's close")

**HALT conditions**:
- LR-046 prose changes during this subplan's execution → HALT, re-baseline fixtures.
- `/planning` Step 1 adversarial audit surfaces a regex that false-positives on common plan body phrasings ("zero-day vulnerability", "all 3 cases must X", etc.) — HALT, refine spec before code.
- Hook would deny edits in chain-spawned `/chain` runs that have no interactive override path — HALT, design the chain-orchestrator-aware bypass.

---

## Purpose

LR-046's prose-layer enforcement (skill mandate in `/execute` Phase 4 + verdict floor in `/final-q` Step 3) covers interactive sessions where the agent walks the closure manually. **It does NOT cover chain-spawned `/chain` runs** that close without human review — exactly the failure mode SP-DQU-05 demonstrated (the Phase 0 grep evidence existed in the agent's transcript; nothing structurally stopped the close).

This subplan installs a `PreToolUse` hook that fires when a TodoWrite call updates an entry's status to `completed` AND that entry's content references a strict numeric/boolean line. The hook re-executes the corresponding grep against live file state and denies the status flip if the strict marker is unsatisfied — the same structural pattern as `todo-injection-gate.sh`.

---

## Artifacts produced

| Path | Ownership (OWNER) | Action |
|---|---|---|
| `.claude/hooks/strict-line-gate.sh` | RW | CREATE |
| `.claude/hooks/lib/check-strict-line.mjs` | RW | CREATE |
| `.claude/hooks/lib/test-strict-line-fixtures.mjs` | RW | CREATE (≥12 fixtures: SP-DQU-05 reproducer, false-positive guards, edge cases) |
| `.claude/settings.json` | RW | UPDATE (register PostToolUse on `TodoWrite` for capture; PreToolUse on `TodoWrite` for status-flip validation) |
| `package.json` | RW | UPDATE (add `test:strict-line` script + wire into `test:hooks` aggregator) |
| `.claude/rules/pipeline.md` | RW | UPDATE (LR-046 body's "Trigger" section gets a "Hook enforcement" subsection citing `strict-line-gate.sh` + behavior contract — the prose-vs-code parity stake) |

---

## Step-by-step

### Phase 0 — Context loading + LR-046 verbatim read + regression fingerprint

Standard /execute Phase 0 + read LR-046 word-for-word. Snapshot `.claude/hooks/`, `.claude/settings.json`, `.claude/rules/pipeline.md` line counts.

### Phase 1 — `/planning` step (adversarial audit per SUPREME RULE)

Run `/planning` to design:

1. **Strict-line regex** — must capture the LR-046 trigger tokens (`zero` / `all N` literal-number / `every <noun>` / `100%` / `must equal X` / `no exceptions` / numeric Acceptance-Criteria checkbox `- [ ] N=0`) without false-positive on:
   - "zero-day", "zero downtime" (idioms — token used non-strictly)
   - "all 3 cases must be considered" (qualitative, not strict)
   - "every reasonable effort" (qualitative)
2. **TodoWrite-state schema extension** — extend `.claude/state/todo-state-${session_id}.json` with a `strict_lines` array per entry: `{entry_index, marker_text, grep_pattern, file_path, expected_count}`. The agent populates this when authoring the todo (or `/relevant` injects it from plan body parse).
3. **Live-grep execution** — at status-flip-to-completed time, hook re-runs the captured `grep_pattern` against `file_path`, compares hit-count to `expected_count`. Mismatch → deny with full LR-046 quote + 3 options (do-now / spawn / append + ask user).
4. **Chain-spawned bypass** — if transcript shows `/chain` parent context (orchestrator-spawned), hook MUST still fire. The fix for chain runs: chain-orchestrator pauses with `verdict-NONE` at parent's `/final-q`; user resolves interactively. No "auto-approve in chain" escape hatch.
5. **Override handshake** — same one-shot pattern as LR-043 §A (`[OVERRIDE-REQUEST]` → user authorization phrase → 3-turn allow window). Required for legitimate edge-case rescopes.
6. **Fail-OPEN policy** — any uncaught exception → log to `.claude/state/hook-failures.log` + allow. `/final-q` Step 4.5 floors verdict to YELLOW if log is non-empty.

`/planning` Step 4 adversarial audit MUST stress-test the regex against ≥20 real plan bodies in `plans/done/` for false-positive rate. Target: <2% false-positive on a 50-plan sample.

### Phase 2 — Implementation

Mirror `identity-switch-gate.sh` + `todo-injection-gate.sh` patterns:

- `strict-line-gate.sh` — bash dispatcher (same fail-OPEN, mode-arg, lib-path-check shape as the precedents)
- `check-strict-line.mjs` — node lib with `--capture` (PostToolUse) + `--validate` (PreToolUse on TodoWrite)
- `test-strict-line-fixtures.mjs` — ≥12 fixtures covering: SP-DQU-05 reproducer (exact transcript), zero-hits-met (allow), zero-hits-unmet (deny), all-N-met, every-row-met, qualitative-language (allow — false-positive guard), idiom guards, override-handshake-active, chain-spawned context, missing-state-file (fail-OPEN allow).
- `.claude/settings.json` — register PostToolUse on `TodoWrite` (capture) + PreToolUse on `TodoWrite` (validate at status-flip).
- `package.json` — `test:strict-line` script; wire into `test:hooks` aggregator.

### Phase 3 — Wire LR-046 prose to the hook (parity stake)

Update LR-046 body's "Trigger" section in `.claude/rules/pipeline.md` to cite the hook by path + reference `test-strict-line-fixtures.mjs` as the parity contract. Without this wiring, prose drift → silent enforcement gap.

### Phase 4 — Verification + finalization

- `npm run test:strict-line` — all ≥12 fixtures pass.
- Manual smoke test: replay SP-DQU-05's transcript-shape against the hook, verify deny + correct LR-046 quote.
- `/regression-guard` AFTER + diff review.
- `/final-q` with v2 evidence-emission per LR-042.
- Plan finalization (Status DONE + Execution Summary + `git mv` to `done/` + `npm run plans:reindex` + parent-cascade per LR-027).
- Activity-log row per LR-028 + LR-037.

---

## Acceptance criteria

- [ ] `.claude/hooks/strict-line-gate.sh` exists, executable, fail-OPEN policy verified.
- [ ] `.claude/hooks/lib/check-strict-line.mjs` exists, exports `--capture` + `--validate` modes.
- [ ] `.claude/hooks/lib/test-strict-line-fixtures.mjs` exists with ≥12 fixtures, all passing.
- [ ] SP-DQU-05 reproducer fixture: status-flip-to-completed on todo with content "Run Phase 0 greps zero hits required" + live grep hits >0 → hook DENIES with LR-046 quote.
- [ ] False-positive guard fixtures: "zero-day", "zero downtime", "all reasonable", "every effort" → hook ALLOWS.
- [ ] Override-handshake fixture: `[OVERRIDE-REQUEST]` + user authorization within 3 turns → one-shot allow.
- [ ] `npm run test:strict-line` passes.
- [ ] `npm run test:hooks` aggregator runs the new test target.
- [ ] LR-046 prose in `pipeline.md` cites the hook + fixture file (parity stake).
- [ ] `.claude/settings.json` registers both hook events.
- [ ] `/regression-guard` AFTER fingerprint matches BEFORE except for the listed Artifacts.
- [ ] `/final-q` GREEN verdict.
- [ ] Activity-log row appended.

---

## Why a separate subplan, not inline in SP-DQU-05B

Three reasons (matches SP-DQU-05B's authoring rationale, with hook-specific specifics):

1. **`/planning` + adversarial audit per SUPREME RULE** — hook authoring is structural-enforcement work with verdict-floor implications. Not a quick edit.
2. **LR-046 prose lands first** — fixture design depends on the rule body being stable. SP-DQU-05B writes the prose; SP-DQU-05C tests against it.
3. **Token budget** — SP-DQU-05B was already a full session (Phase 1+2+3 lint sweep + LR-046 authoring + memory mirror). Folding hook authoring would push past 500k context.

---

## Handoff to next subplan

Once SP-DQU-05C is DONE → SP-DQU-06 (converter rename Specific Field to Tags) resumes the original DQU sequence.

No obstacle claims (LR-039).
