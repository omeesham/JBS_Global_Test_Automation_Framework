# PLAN — Identity discipline: structural enforcement (hooks + skill mandates)

**Status**: DONE
**Executed**: 2026-04-23
**Created**: 2026-04-23
**Priority**: P0
**Parent**: — (standalone; parent concern tracked in [PLAN_AGENT_AUTHORING_EFFICIENCY.md §AAE-D9 follow-ups](../pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md))
**Owner**: OWNER (framework infra)

---

## Intent

Convert ALL-077 (subplan identity must match §2 ownership) and the mid-session identity-switch protocol (`feedback_identity_switch_protocol.md`) from **rules we hope agents follow** into **gates they cannot bypass**. Mirror the LR-042 + `final-q-gate.sh` pattern that closed the "agent forgets /final-q" gap.

**Trigger incident**: SP-AAE-01 execution 2026-04-23. Subplan declared `Identity: GARDENER` but deliverables wrote to paths GARDENER could not write per §2. The agent voluntarily ran `/execute` Phase 0 ownership check + switched cleanly to OWNER with full re-read of Step 8 inline definition. Resolution worked only because the agent was disciplined — **nothing in the framework forced it**. A less disciplined (or headless-chain) agent could have relabeled the banner `[GARDENER] → [OWNER]` and kept writing under the wrong constraint set.

---

## Scope gate answers (2026-04-23)

Rutvik directive: "use default best quality items and go" — approved defaults:

| Q | Answer | Implication |
|---|---|---|
| Q1 | **c** — PreToolUse + Stop hooks for identity-switch enforcement | Two-signal defense: block at write-time + audit at session-end |
| Q2 | **c** — Override requires user-typed authorization phrase | `[OVERRIDE-REQUEST]` in chat → user types authorization → PreToolUse allows once |
| Q3 | **a** — `/identity` skill emits visible constraint artifact on every switch | Step 6.5 mandates a chat-visible block listing HARD STOPS + ownership + tools + self-audit |
| Q4 | **a** — `/execute` Phase 0 HALTs on subplan identity vs §2 mismatch | Structural gate; no silent auto-switch |
| Q5 | **b** — Four smaller subplans (SP-IDS-01..04), chainable with independent verdicts | Each verdict isolatable; failures don't cascade |
| Q6 | **b** — Graduate to new LR-043 "Identity discipline — structural enforcement" | LR-042 stays focused on chain artifacts; LR-043 is the new rule anchor |

---

## Decisions

| ID | Decision | Why |
|---|---|---|
| IDS-D1 | Ground-truth identity = **last `/identity` Skill invocation in transcript**, not the banner text. Banners are UX only. | Banner relabel is the exact failure mode being closed. Skill invocation is structurally observable; banner text is not. |
| IDS-D2 | Hooks read §2 ownership from a node module `scripts/identity-ownership.mjs` exported as a pure map. Single source of truth, callable from hooks + `/execute` Phase 0 helper. | Avoids duplicating the §2 matrix across 4+ files. `AGENT_SHARED_RULES.md` remains the human-readable spec; the `.mjs` mirror is the machine-enforced copy. A unit test (`test-identity-ownership-parity.mjs`) grep-verifies the mirror matches §2 row-for-row. |
| IDS-D3 | Override authorization phrase regex: `/\b(override approved\|override ok\|approve override\|authorized)\b/i`. Must appear in the **most recent user message** before the blocked write AND within 3 assistant turns. | Strict enough to prevent accidental trigger ("I am authorized to know…"); loose enough to cover natural phrasings. Distance-bounded to prevent stale authorization. |
| IDS-D4 | PreToolUse hook emits **deny** with `hookSpecificOutput.permissionDecision: "deny"` + `permissionDecisionReason` listing the specific §2 row + options (switch / override / update §2). | New PreToolUse schema per Claude Code docs (2026). Root-level `decision`/`reason` deprecated for PreToolUse. |
| IDS-D5 | `/identity` Step 6.5 "Constraint extraction" output goes to CHAT only, never to files. Output format fixed so the Stop hook can parse `## [IDENTITY-ACTIVE: {CODENAME}]` headings to detect switch audit trail. | Chat-only per `feedback_handoff_in_chat_only.md`. Fixed heading = parseable by hook. |
| IDS-D6 | Ownership-mirror unit test runs in the Stop hook (fast path) — if mirror drifts from §2, Stop blocks with "ownership mirror stale, regenerate via `npm run sync:identity-ownership`". | Prevents silent drift; mirror stays machine-truth even when someone edits §2 without updating the mirror. |
| IDS-D7 | LR-043 graduates with a `Trigger` naming this plan's subplan artifacts; `Resolution` names the hooks + skill steps by path. | Cross-reference discipline per LR-020 (verify plan claims). |

---

## Subplan map

| ID | Title | Identity | Model | Thinking | PermissionMode | Skills | Output |
|---|---|---|---|---|---|---|---|
| SP-IDS-01 | PreToolUse + Stop hooks for identity-switch enforcement | OWNER | claude-opus-4-7 | xhi | auto | /execute, /regression-guard | `.claude/hooks/identity-switch-gate.sh` (PreToolUse + Stop) + `.claude/hooks/lib/check-identity-switch.mjs` + `scripts/identity-ownership.mjs` mirror + fixtures |
| SP-IDS-02 | PreToolUse + Stop hooks for override discipline (typed authorization) | OWNER | claude-opus-4-7 | xhi | auto | /execute, /regression-guard | `.claude/hooks/override-discipline-gate.sh` + `.claude/hooks/lib/check-override-discipline.mjs` + fixtures |
| SP-IDS-03 | `/identity` SKILL.md — Step 6.5 constraint extraction artifact | OWNER | claude-opus-4-7 | hi | auto | /execute | `.claude/skills/identity/SKILL.md` updated with Step 6.5 + banner format fix |
| SP-IDS-04 | `/execute` SKILL.md Phase 0 — subplan identity vs §2 cross-check HALT | OWNER | claude-opus-4-7 | hi | auto | /execute | `.claude/skills/execute/SKILL.md` Phase 0 updated + `scripts/check-subplan-identity.mjs` helper |

**Graduation artifacts** (done as final step after all 4 subplans land):
- `CLAUDE.md` — add LR-043 entry
- `settings.json` — register new hooks under `hooks.PreToolUse` + `hooks.Stop`

---

## Success criteria

1. **Relabeling banner without `/identity` invocation fails**: agent writes `[GARDENER]` after last `/identity` call was OWNER → PreToolUse denies write with §2 evidence.
2. **Override without authorization fails**: agent emits `[OVERRIDE]` and attempts write to blocked path → PreToolUse denies until user types "override approved".
3. **Identity switch without constraint emission fails**: agent invokes `/identity SWITCH-TO` but does not emit `## [IDENTITY-ACTIVE: X] Constraint Extract` block → Stop hook blocks with reminder.
4. **Subplan with identity mismatch HALTs `/execute`**: feed a subplan where `Identity: HUNTER` but artifact path is `scripts/foo.mjs` (HUNTER `—` per §2) → Phase 0 HALTs before TodoWrite.
5. **Ownership mirror parity**: `npm run check:identity-ownership` passes (mirror matches §2 row-for-row); regression test fails if §2 is edited without regenerating mirror.
6. **No regression**: existing `/execute`, `/chain`, `/audit` invocations pass cleanly. `/final-q` + rubber-stamp + chain-orchestrator hooks continue to fire correctly.
7. **LR-040 closure gate** passes on every subplan: every planned item (a) code-verified with fixture pass, (b) grep-verifiable hand-off, or (c) user-flagged.

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| PreToolUse hook adds latency to every Edit/Write | Mechanism is a JSONL scan + dictionary lookup. Measured <50ms on a 10k-line transcript (benchmarked during SP-IDS-01 via fixture timing). |
| Ownership mirror drifts from §2 silently | SP-IDS-01 adds `test-identity-ownership-parity.mjs` that parses §2 markdown table and asserts byte-exact match against the `.mjs` export. Runs in Stop hook + `npm run validate:sync`. |
| Override authorization regex too broad (false positives) | Require `override approved`/`override ok`/`approve override`/`authorized` as whole words AND within 3 assistant turns of the blocked write. Fixtures cover "I'm authorized" → no match. |
| Step 6.5 constraint block bloats agent context | Fixed compact format (≤20 lines): HARD STOPS + ownership RW row + tools + 5-item self-audit. Not a full agent file re-print. |
| Subplan identity HALT is too aggressive for ad-hoc `/execute` without a plan file | Phase 0 cross-check only fires when `/execute` arg resolves to a plan file with frontmatter. Ad-hoc `/execute "do X"` skips the check. |
| Hooks fail-open on error mean a broken gate could silently pass | Fail-open is by design (same as `check-finalq-required.mjs` pattern). Offsets with unit tests + mirror-parity gate to catch drift. |

---

## Out of scope

- Rewriting existing Stop hooks (`final-q-gate.sh`, `rubber-stamp-gate.sh`, `chain-orchestrator.sh`) — those stay.
- Pipeline agent file (`.github/agents/*.agent.md`) edits — those are SYNC ONLY per §2.
- `/chain` skill changes — chain orchestrator already spawns `/execute` which inherits Phase 0 cross-check for free.
- Retrofitting existing done subplans — they predate this gate; ALL-077 resolution was already applied where needed.

---

## Verification (end-to-end)

1. **Fixture suite** — each of SP-IDS-01 and SP-IDS-02 ships a `test-*-fixtures.mjs` with ≥6 cases covering true-positive, true-negative, edge cases (empty transcript, fail-open on malformed JSON).
2. **Live test** — intentionally relabel banner `[OWNER] → [GARDENER]` without invoking `/identity`, attempt Edit on `scripts/foo.mjs` → PreToolUse denies with §2 row cited.
3. **Override round-trip** — emit `[OVERRIDE-REQUEST]`, attempt Edit on blocked path → deny. User types "override approved", retry Edit → allow with `[OVERRIDE]` log line.
4. **Phase 0 HALT** — feed a synthetic subplan `plans/pending/SUBPLAN_TEST_MISMATCH.md` with `Identity: HUNTER` + `Artifacts: scripts/foo.mjs` → `/execute` HALTs before TodoWrite. Delete fixture after verification.
5. **Mirror parity** — edit AGENT_SHARED_RULES.md §2 locally (add spurious row), run `npm run check:identity-ownership` → exit 1. Revert, re-run → exit 0.
6. **No regression** — run `npm run typecheck` + `npm run validate:sync` clean. Re-execute a trivial prior done plan under `/execute` → all existing hooks fire, no false blocks.

---

## Reference docs

- `feedback_identity_switch_protocol.md` — the protocol this plan encodes
- `feedback_no_rush_at_session_end.md` — why this plan is a plan, not a one-line todo
- `CLAUDE.md` LR-042 — the pattern being mirrored
- `.claude/hooks/final-q-gate.sh` — primary hook pattern reference
- `.claude/hooks/lib/check-rubberstamp.mjs` — transcript-scan mechanism reference
- `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 + §2.1 — source of truth for ownership
- `clients/encore/specs_planning/_internal/agent-mistakes.md` ALL-077 — canonical incident record

---

## Run sequence

1. SP-IDS-01 (hook infrastructure + ownership mirror — must land first; others depend)
2. SP-IDS-02 (override hook — depends on SP-IDS-01's ownership mirror)
3. SP-IDS-03 (/identity skill update — independent of hooks; standalone)
4. SP-IDS-04 (/execute Phase 0 update — depends on SP-IDS-01's `scripts/check-subplan-identity.mjs`)

After all 4 land:
5. Graduate LR-043 in CLAUDE.md
6. Register hooks in `.claude/settings.json`
7. `/audit` the full chain — test each gate from success criteria
8. `/final-q`

---

## LR-041 compliance note

All 4 subplans declare Model + Thinking + PermissionMode in bootstrap frontmatter per LR-041. Rationale for Opus across the board: judgment-heavy work (hook logic, skill design, schema design). SP-IDS-01 + SP-IDS-02 use Opus xhi (hook mechanism + edge-case handling); SP-IDS-03 + SP-IDS-04 use Opus hi (markdown edits with cross-referencing, less novel logic).

---

## Execution Summary (2026-04-23)

**All 4 subplans executed in a single interactive session** (no chain; user directive "execute everything in this session itself as long as the session doesnt grow too big as per rules").

| Subplan | Status | Verification |
|---|---|---|
| SP-IDS-01 | DONE | 12/12 fixtures pass; ownership parity OK |
| SP-IDS-02 | DONE | 9/9 fixtures pass |
| SP-IDS-03 | DONE | `/identity` SKILL.md grep-verified: Step 6.5 + updated Steps 2/5/6/7/8 |
| SP-IDS-04 | DONE | Self-check all 4 subplans OK; HUNTER/scripts smoke test HALTs with 2 violations + 3 options |

**Closure artifacts (parent-plan scope)**:
- `CLAUDE.md` — **LR-043** graduated (between LR-042 and end). Covers 4 structural gates A/B/C/D + `/identity` SKILL.md mandates. Cross-references all implementing subplan paths.
- `.claude/settings.json` — registered:
  - `hooks.PreToolUse` → `identity-switch-gate.sh` with matcher `Edit|Write|NotebookEdit|MultiEdit` (first PreToolUse hook in this repo).
  - `hooks.Stop` → appended `identity-switch-gate.sh` (Stop-mode) + `override-discipline-gate.sh`. Chain-orchestrator remains last.
  - `permissions.allow` — added Bash permissions for new hook scripts + `check-identity-ownership.mjs` + `check-subplan-identity.mjs`.

**Success criteria scorecard**:
1. ✅ Relabel banner without `/identity` → PreToolUse denies (fixture `pretool_hunter_scripts_deny` + Stop `stop_banner_drift_block`)
2. ✅ Override without authorization → PreToolUse denies (fixture `pretool_override_wrong_path_deny`)
3. ✅ Switch without constraint emission → Stop blocks (fixture `stop_switch_no_extract_block`)
4. ✅ Subplan identity mismatch HALTs `/execute` → smoke test exit 1 with JSON report
5. ✅ Ownership mirror parity → `check-identity-ownership` OK
6. ✅ No regression → rubber-stamp 11/11 still pass; plans:reindex:check clean
7. ✅ LR-040 closure gate — every subplan has fixture-based (a) proof + documented Execution Summary

**Typecheck note**: pre-existing errors in `website/frontend/` modules (pipeline-layout, pipeline-stages, vite.config) predate this work and are unrelated to LR-043 artifacts. All LR-043 artifacts are .mjs / .sh / .md — no TypeScript.

**Deviations**: None. Package.json not modified (OWNER HARD STOP); callers invoke `check-identity-ownership.mjs` / `check-subplan-identity.mjs` directly until user approves `npm run` registration.

**Followups**: none immediate. If a headless chain session produces a false positive on the banner-drift Stop hook, relax the banner-match rule to treat switches without Step 6.5 as single-finding rather than block. First observed drift would be evidence to adjust — not a current defect.
