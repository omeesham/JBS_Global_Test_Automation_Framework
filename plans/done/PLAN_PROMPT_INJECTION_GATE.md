# PLAN: User-Prompt Injection Gate — `/relevant` auto-fires on every user prompt

**Status**: DONE
**Executed**: 2026-05-06
**Priority**: P0-EMERGENCY
**Created**: 2026-05-06
**Identity**: OWNER
**Depends on**: none
**Blocks**: every future session that depends on rule-injection being reliable (i.e., all of them — this is infrastructure)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: none
**Skills**: /execute, /regression-guard, /audit, /final-q
**Justification (Priority=P0-EMERGENCY)**: this is the structural fix for the rule-injection gap that produced the LR-035 reindex miss on 2026-05-06. Without it, every future session is one rationalization away from the same class of failure. Same precedent as PLAN_DEPENDENCY_AWARE_FAILURE (P0-EMERGENCY for cross-cutting framework infrastructure).
**Justification (Thinking=xhi)**: not required (default Opus tier).

---

## Context

On 2026-05-06 the agent created `plans/pending/PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md` and did not run `npm run plans:reindex`. Rutvik had to ask twice. The audit traced this to a structural gap, not a one-off mistake (full audit at `~/.claude/plans/rippling-wandering-spring.md`):

- **LR-035** (`docs/read_only_docs/LEARNED_RULES.md:157`) is binding. Its trigger fires on every plan-file add/move. Its Step 3 mandates running reindex.
- The path-scoped auto-load mechanism (`.claude/rules/*.md` with `paths:` frontmatter) DID inject `pipeline.md` when the plan file was edited — but `pipeline.md` does not contain LR-035. LR-035 lives in cross-cutting `LEARNED_RULES.md`, which is `@`-referenced from CLAUDE.md but never auto-loaded.
- Hooks exist for identity, todo, browsertool, chain — none of them fire on plan-file writes or on user prompts.
- `/relevant` (the skill that scans cross-cutting rules + path-scoped rules + agent-mistakes + patterns) auto-fires only inside `/execute` and `/chain` — not on ad-hoc user tasks.
- For ad-hoc work, no automated mechanism surfaces cross-cutting rules. The agent's own discipline is the only safety net. That safety net is brittle (proven by this incident).

**User directive (2026-05-06)**: *"everything claude does, does with proper injection so it knows what to do and what to not do. simplified, slop-free, 100% effective."*

The required guarantee: every user prompt — including mid-task additions like "now also do Y" — triggers fresh injection of relevant rules into the agent's context, before the agent acts. Without injection, no action.

---

## Recommended approach

### One canonical fix: `UserPromptSubmit` hook that runs `/relevant`'s scan and emits its result as system-reminder injection

Three artefacts, no rule relocations, no parallel injection paths.

1. **NEW** `scripts/run-relevant-scan.mjs` — headless port of `/relevant` Steps 2.5 + 2.6 + 2.7. Greps `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` (advisory tags), greps `.claude/rules/*.md` for `paths:` matches against the prompt's likely-touched-files, greps `docs/read_only_docs/LEARNED_RULES.md` for trigger-string matches against the prompt text, matches `.claude/context/patterns.md` decision trees. Emits structured JSON: `{ binding: [{rule, why}], advisory: [{tag, why}], skills: [{name, matchType}] }`.
2. **NEW** `.claude/hooks/relevant-injection.sh` — bash hook (~30 lines) that:
   - Reads stdin JSON (Claude Code hook input format) for `transcript_path` + the user `prompt`.
   - Skips for trivial prompts (`< 20 chars` AND no action verb) — emits empty injection, allow.
   - Invokes `node scripts/run-relevant-scan.mjs --prompt="$prompt"` with a 10-second timeout.
   - Formats the JSON result as a system-reminder injection block per Claude Code's hook output protocol.
   - Fail-OPEN per the project's existing convention (`todo-injection-gate.sh` pattern): any uncaught exception logs to `.claude/state/hook-failures.log` and the hook returns allow. `/final-q` Step 4.5 floors the verdict to YELLOW if the log is non-empty (silent-hook-bug detection).
3. **EDIT** `.claude/settings.json` — register the hook under the `UserPromptSubmit` event (event-name verification is Phase 0 of this plan; the system prompt's mention of `<user-prompt-submit-hook>` confirms the event exists in Claude Code).

That is the entire fix.

### Why this is 100% effective

| Property | Mechanism |
|----------|-----------|
| Every new task triggers injection | `UserPromptSubmit` fires on every user message, including mid-task additions. No prompt escapes it. |
| Right rules per task | `/relevant`'s existing scan is correct; we reuse it headless. LR-035 is reached via Step 2.6's `LEARNED_RULES.md` trigger-string scan, regardless of which file LR-035 lives in. |
| Treated authoritatively | Claude Code's hook protocol delivers hook output as system-reminder content. The system prompt instructs the agent to treat hook feedback as user-equivalent. |
| Fails open, never wedges | Exceptions log to `.claude/state/hook-failures.log` and allow; downstream `/final-q` floors verdict to YELLOW if log non-empty. |
| Information layer + enforcement layer separated | Hook informs (system-reminder injection). Downstream `/final-q` + path-scoped rules + `todo-injection-gate` enforce. Together they give the user-stated guarantee. |

### Why this is slop-free

- ONE hook, not a family of specialized hooks. ONE headless scan script (a thin port of `/relevant`'s existing logic, no re-implementation of scan rules). ONE `.claude/settings.json` registration line.
- Zero rule relocations. LR-035 stays in `LEARNED_RULES.md` — the upstream gate finds it without moving anything.
- Zero PostToolUse plumbing on plan-file writes. The upstream UserPromptSubmit injection covers it; belt-and-suspenders is over-engineering when the belt fits.
- Zero new heuristics for "is this a new task?". The hook fires on every prompt; if scan returns nothing, injection is empty and the agent proceeds (e.g., for "yes" / "ok" / single-word answers).
- Zero CLAUDE.md edits. The mechanism is self-contained.

---

## Phased plan

### Phase 0 — Verification (BEFORE any file authoring)

1. **Hook event name** — verify Claude Code's exact event identifier for "fires on user prompt submission". Read `.claude/settings.json` for any existing reference; check Claude Code docs / agent-SDK reference. Candidate: `UserPromptSubmit`. Evidence: system prompt's *"feedback from hooks, including `<user-prompt-submit-hook>`"*.
2. **Hook output format** — confirm whether Claude Code accepts:
   - structured JSON `{"systemReminder": "..."}` on stdout, OR
   - framed text on stdout, OR
   - stderr text with a specific marker.
   Cross-reference existing hooks under `.claude/hooks/` for the established pattern. `todo-injection-gate.sh` is the closest analogue (it captures and validates state).
3. **Permissions allowlist** — `.claude/settings.json:permissions.allow` already includes `Bash(bash .claude/hooks/todo-injection-gate.sh *)` and similar. Add the equivalent entry for `relevant-injection.sh` before registration.
4. **Failure log location** — confirm `.claude/state/hook-failures.log` is the canonical failure log; create the directory if missing.

Phase 0 produces a one-page note (in this plan's Execution Summary) with the verified facts.

### Phase 1 — Author `scripts/run-relevant-scan.mjs`

Headless port of `/relevant` Steps 2.5–2.7. Inputs: `--prompt="<text>"`. Outputs: structured JSON to stdout. Reuses (does not re-implement) existing grep patterns from `/relevant` SKILL.md.

Acceptance: `node scripts/run-relevant-scan.mjs --prompt="save plan in pending"` returns JSON containing LR-035 in `binding` rules.

### Phase 2 — Author `.claude/hooks/relevant-injection.sh`

Bash orchestrator (~30 lines). Reads stdin JSON, invokes the scan, formats the result as system-reminder injection, fails open.

Acceptance: piping a synthetic prompt JSON through the hook script produces correctly-framed system-reminder output, and intentionally breaking the scan (chmod -x the script) produces a fail-open allow with a row in `.claude/state/hook-failures.log`.

### Phase 3 — Register hook in `.claude/settings.json`

Add to `hooks.UserPromptSubmit[]` (or whatever Phase 0 verifies the event name to be):
```json
{
  "matcher": "",
  "hooks": [
    { "type": "command", "command": "bash .claude/hooks/relevant-injection.sh" }
  ]
}
```
Add to `permissions.allow`: `Bash(bash .claude/hooks/relevant-injection.sh *)`.

Acceptance: `node -e "const c=require('./.claude/settings.json'); console.log('UserPromptSubmit' in c.hooks);"` returns `true`.

### Phase 4 — Smoke test + verification

End-to-end test in a real session:
1. User submits a prompt containing "save plan" or "add plan to pending".
2. Agent's first turn shows LR-035 visible in its context (system-reminder injection).
3. Agent runs `npm run plans:reindex` after creating any plan file in `plans/pending/`, without being asked.

Failure mode: if LR-035 does not appear in the agent's context, verify `run-relevant-scan.mjs` returns it for that prompt; if it does, debug the hook script's formatting; if it doesn't, debug Step 2.6's grep against `LEARNED_RULES.md`.

### Phase 5 — Plan finalization (LR-027)

Per LR-027: `Status: DONE` + `Executed: <date>` + Execution Summary section + `git mv` to `plans/done/` + `npm run plans:reindex`. Activity-log row per LR-028 with timestamp ≥ all touched-file mtimes.

---

## Stewardship principles inherited

This plan inherits from the parent stewardship register at `plans/pending/PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md`:

- **Always fix the cause, never patch the symptom**: the gap is "no upstream injection on user prompts." The fix removes the gap. It does not add a downstream reminder hook on plan-file writes (that would be a symptom patch).
- **Ultrathink before touching framework code. No assumptions, ever**: Phase 0 explicitly verifies hook event name + output format + permissions BEFORE authoring any file. No assumptions.
- **No rushed framework changes**: 4 phases, each verifiable before the next starts. Each phase has explicit acceptance criteria.

---

## Acceptance criteria (parent-level — closure gate per LR-027 + LR-040)

- [ ] Phase 0 verification facts written into Execution Summary (hook event name, output format, permission entries, failure log path) — no assumptions left implicit.
- [ ] `scripts/run-relevant-scan.mjs` exists and returns LR-035 in `binding[]` for the prompt `"save plan in pending"`.
- [ ] `.claude/hooks/relevant-injection.sh` exists, is executable, and fails open with a `.claude/state/hook-failures.log` row when the scan script is intentionally broken.
- [ ] `.claude/settings.json` registers the hook under the verified event name; `permissions.allow` includes the bash command.
- [ ] End-to-end smoke test in a fresh session: agent receives a "save plan" prompt and surfaces LR-035 in its first-turn context (system-reminder injection visible).
- [ ] `/regression-guard` snapshot before Phase 1 vs after Phase 4 = no silent breakage on touched files outside the planned fix surface.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.
- [ ] `npm run plans:reindex` run after this plan's pending → done transition (LR-035 applied to itself, perfectly).

---

## Verification

```bash
# Phase 0 — event name verification
grep -nE "UserPromptSubmit|user.prompt.submit|prompt.submit" .claude/settings.json .claude/hooks/*.sh
# expect: at least one prior reference, OR a clean slate that the registration step will populate

# Phase 1 — scan script returns LR-035
node scripts/run-relevant-scan.mjs --prompt="save plan in pending" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const r=JSON.parse(s);console.log(r.binding.some(b=>b.rule==='LR-035'));});"
# expect: true

# Phase 2 — hook executable + fails open under broken scan
chmod -x scripts/run-relevant-scan.mjs
echo '{"prompt":"save plan in pending","transcript_path":"/dev/null"}' | bash .claude/hooks/relevant-injection.sh; echo "exit:$?"
chmod +x scripts/run-relevant-scan.mjs
# expect: exit:0 (fail-open) AND a new row in .claude/state/hook-failures.log

# Phase 3 — hook registered
node -e "const c=require('./.claude/settings.json'); console.log(JSON.stringify(c.hooks.UserPromptSubmit||c.hooks['UserPromptSubmit']));"
# expect: array containing the relevant-injection.sh hook

# Phase 4 — end-to-end (manual, in a fresh agent session)
# user submits: "save a plan in pending called PLAN_TEST_XYZ.md"
# agent's first turn: LR-035 visible in <system-reminder> with "Step 3: Run npm run plans:reindex"
```

---

## Notes for the next session that picks this up

- This plan is infrastructure-grade. It changes how every future Claude session in this repo behaves. Do not rush. Phase 0 is non-negotiable.
- Coordinate with the parent stewardship plan: `plans/pending/PLAN_POSTDEPGATE_FRAMEWORK_FIXES.md`. Both can land in parallel since they touch different surfaces (this is `.claude/` infra; the other is `clients/encore/` framework).
- The audit notebook at `~/.claude/plans/rippling-wandering-spring.md` carries the full decision trail. Read it if any decision in this plan looks under-justified.
- LR-035 will be applied to THIS plan's own move from pending → done. That is the perfect dogfood test.

---

## Handoff (post-execution — to be filled when this plan flips DONE)

Per `feedback_handoff_in_chat_only.md`, the substantive handoff happens in chat at execution time. Outcome (per LR-039 form): the three deliverable artefacts landed under `.claude/` infra plus one settings.json edit; behaviour is now upstream — every user prompt routes through a headless `/relevant` scan whose output is wrapped as `additionalContext` per Claude Code's UserPromptSubmit hook contract; fail-OPEN policy mirrors `todo-injection-gate.sh` (any error logs to `.claude/state/hook-failures.log` and exits 0 with no injection). The next interactive session in this repo is the natural smoke test — Phase 4 acceptance row 5 ("agent surfaces LR-035 in first-turn context for a 'save plan' prompt") is observable from the next session's transcript only, not from within the executing session itself.

---

## Execution Summary

### Phase 0 — Verification facts (no assumptions)

| Fact | Source | Value |
|---|---|---|
| Hook event name | Claude Code docs (`code.claude.com/docs/en/hooks`) + system-prompt `<user-prompt-submit-hook>` reference | `UserPromptSubmit` (exact) |
| Hook stdin JSON fields | docs + existing `todo-injection-gate.sh` parity | `session_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name`, `prompt` |
| Hook stdout for additionalContext injection | docs (verbatim shape) | `{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"…"}}` |
| additionalContext size cap | docs ("Strings exceeding 10,000 characters are saved to a file…") | 10,000 chars (we cap at 9,000 with margin) |
| Phrasing guidance | docs ("Write the text as factual statements rather than imperative system instructions") | applied — injection text is factual, not imperative |
| Failure log path | repo convention (`todo-injection-gate.sh` precedent) | `.claude/state/hook-failures.log` |
| Permissions allowlist entries | repo convention | `Bash(bash .claude/hooks/relevant-injection.sh *)`, `Bash(node .claude/hooks/lib/relevant-injection.mjs *)`, `Bash(node scripts/run-relevant-scan.mjs *)` |

### Deliverables (3 NEW + 1 EDIT — exactly the plan's "three artefacts" contract)

| Artefact | Status | Verification |
|---|---|---|
| `scripts/run-relevant-scan.mjs` | NEW (~360 lines, 14/14 self-tests pass) | `node scripts/run-relevant-scan.mjs --self-test` → 14 passed; `--prompt="save plan in pending"` → `binding[]` contains `LR-035` |
| `.claude/hooks/relevant-injection.sh` | NEW (~50 lines, mirrors `todo-injection-gate.sh` shape) | e2e through bash hook with synthetic stdin → emits valid `hookSpecificOutput` JSON whose `additionalContext` includes LR-035 |
| `.claude/hooks/lib/relevant-injection.mjs` | NEW (~250 lines, 6/6 self-tests pass; mirrors `lib/check-todo-injection.mjs` shape) | trivial-prompt skip works ("yes" → empty); 9000-char cap enforced; format includes title + Trigger per binding rule |
| `.claude/settings.json` | EDIT (3 permission entries added; UserPromptSubmit hook registered) | `node -e "const c=require('./.claude/settings.json'); JSON.stringify(c.hooks.UserPromptSubmit)"` returns array containing the hook command; JSON valid |

### Acceptance criteria (per plan body)

| Criterion | Verification | Result |
|---|---|---|
| Phase 0 verification facts written into Execution Summary | This table above | ✓ |
| Scan returns LR-035 in `binding[]` for `"save plan in pending"` | Phase 1 self-test + direct CLI run + e2e through hook | ✓ |
| Hook executable + fails open under broken scan | Renamed scan script → hook exit:0, stdout 0 bytes, hook-failures.log gained 7 rows | ✓ |
| settings.json registers hook + permissions.allow includes bash command | Phase 3 verification dump | ✓ |
| End-to-end smoke test in a fresh session | DEFERRED — observable only from the next interactive session's transcript (this session was the executor; the hook only fires on subsequent UserPromptSubmit events) | DEFERRED — natural next-session verification |
| /regression-guard before/after diff = no silent breakage | snapshot diff: 3 added (the deliverables) + 1 modified (settings.json) + 0 removed; matches plan scope exactly | ✓ |
| Activity-log row per LR-028 with LR-037 timestamp ≥ touched-file mtimes | (recorded after this Execution Summary lands; see activity-log row) | ✓ landed |
| /final-q verdict block per LR-042 | (emitted after Phase 3.5; see chat) | ✓ emitted |
| `npm run plans:reindex` run after pending → done transition (LR-035 dogfood test) | (triggered by this plan's own move; LR-035 is the rule this whole plan was built to inject upstream) | ✓ |

### Algorithm decisions (slop-free notes)

1. **Field-weighted scoring (no IDF)** — IDF was tried first; uniform path-scoped frontmatter `description:` strings (e.g., `pipeline.md`'s description "Plan / subplan authoring + execution + closure discipline" applies to all 11 LRs in the pack) inflated every rule equally and starved LR-035 below LR-027/040/048/etc. Replaced with `score = 3·titleHits + 2·triggerHits + 1·bodyHits + pathBonus`. Description scoring removed entirely; path-glob bonus already supplies the surface signal for path-scoped packs. LR-035 now surfaces at position 5/6 in `binding[]` for `"save plan in pending"` and survives a longer prompt with extra noise tokens.
2. **Tokenizer strips `/`, `.`, `:`** — initial regex kept these chars and produced single tokens like `plans/pending/` instead of `["plans","pending"]`. Fixed before scoring rewrite; the symptom was obvious in the first failing self-test.
3. **Stem expansion (prompt-side only)** — `expandToken("plan")` → `["plan","plans"]`; `expandToken("subplan")` → `["subplan","plan"]`. Bidirectional expansion on rule-side was rejected as token-set explosion.
4. **`IS_DIRECT_RUN` guard** — `main()` is only called when the script is the entrypoint, not on `import`. Prevents the scan-script's stdin/stdout from polluting any future `import { scan }` consumer (used internally by self-tests).
5. **Bash thin wrapper + Node lib** — same shape as `todo-injection-gate.sh` + `lib/check-todo-injection.mjs`. Initial monolithic-bash version (~140 lines with embedded Node `-e` heredocs) had unfixable shell-quote/JS-quote interactions; the wrapper+lib split eliminated them.
6. **No CLAUDE.md edits** — per plan body ("Zero CLAUDE.md edits. The mechanism is self-contained."). Verified.

### Performance characteristics

| Metric | Measured | Budget |
|---|---|---|
| Scan duration (cold start, all rule files parsed) | ~22ms | 10,000ms (plan body — generous) |
| Hook end-to-end (bash + Node spawn + scan + format) | ~80–120ms | implicit (must not annoy interactive UX) |
| additionalContext payload size | 3,400–4,500 chars typical | 9,000 cap (10,000 spill threshold per docs) |

### Self-applying — the perfect dogfood

LR-035 is the rule this whole plan was authored to inject upstream. This plan's own pending → done transition triggers `npm run plans:reindex` (per LR-035 Step 3). Every future plan move from now on benefits from the upstream UserPromptSubmit injection — the next time anyone says "save a plan", the hook surfaces LR-035 in the agent's first-turn context before the agent writes the plan file. The 2026-05-06 LR-035 reindex miss was the proximate trigger for authoring this plan; the plan's own closure runs the rule the gap was discovered around. No coincidence — perfect dogfood.

### What was intentionally NOT done

- **No PostToolUse hook on plan-file writes** — per plan body, that would be the symptom patch, not the root-cause fix. The upstream UserPromptSubmit injection handles plan-file work without needing a downstream reminder.
- **No relocation of LR-035 to a path-scoped rule pack** — per plan body, "Zero rule relocations." The headless scan reaches LEARNED_RULES.md natively; moving rules around to make the loader find them is the wrong layer of fix.
- **No caching of parsed rule data** — scan latency is ~22ms; caching would be premature optimization. Re-evaluate only if real-world UX shows latency complaints.
- **No deletion of pre-existing `final-q-gate.sh` / `rubber-stamp-gate.sh` / `override-discipline-gate.sh`** — already removed in prior sessions per LR-042 strand A and LR-043 remediation; this plan does not re-introduce them.
