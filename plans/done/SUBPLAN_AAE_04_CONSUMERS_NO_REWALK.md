# SUBPLAN SP-AAE-04: Generator + Auditor Refactor — Consume Artifact, Spot-Check Only

**Status**: DONE
**Executed**: 2026-04-25
**Priority**: P0-CYCLE-1
**Created**: 2026-04-23
**Parent**: PLAN_AGENT_AUTHORING_EFFICIENCY.md
**Depends on**: SP-AAE-01 (format), SP-AAE-02 (gate), SP-AAE-03 (planner emits)
**Blocks**: SP-AAE-06 (parallel rollout — rollout assumes consumers are efficient)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: Amending LR-007 (MCP-verify all planner claims) is load-bearing on generator correctness. If the spot-check budget is wrong, we either re-burn context (too high) or miss drift (too low). Opus + xhi for threshold calibration.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_AAE_04_CONSUMERS_NO_REWALK.md`
**Identity**: OWNER (reassigned 2026-04-25 per parent plan AAE-D9 follow-up — original GARDENER could not write `.github/agents/**` SYNC-ONLY paths or root `CLAUDE.md` OWNER-RW path; AAE-D9 explicitly directed OWNER for SP-AAE-04)
**Skills auto-called**: /identity, /execute, /upgrade
**Context files** (read before Phase 0):
- `plans/pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md` (parent — AAE-D4: read artifact + spot-check 2-3 fields; full re-walk only on drift)
- `plans/done/SUBPLAN_AAE_01_ARTIFACT_SPEC.md` + `SUBPLAN_AAE_03_PLANNER_EMIT_ARTIFACT.md`
- `.claude/agents/GENERATOR.agent.md` + `.claude/agents/AUDITOR.agent.md` (or `WATCHDOG.agent.md`) — identity files
- `.github/copilot-instructions.md` (if consumer logic lives there too)
- LR-007 + LR-013 + LR-016 (accessibility tree ≠ HTML tags)

**Phase 0 directive**: inventory every file that defines generator/auditor Phase 0.5 behavior. Capture current re-walk language.

**Handoff sequence**:
- Activity-log row (LR-037) listing every file modified + the LR-007 amendment text.
- Chat: consumers are efficient; parallel rollout (SP-AAE-06) can proceed.

**HALT conditions**:
- Spot-check budget (2-3 fields) causes a dry-run generator to miss real drift → tighten to 5 fields with a re-walk fallback.
- LR-007 amendment weakens verification such that a planner error could slip through → HALT, consult user on threshold.

---

## Purpose

Cut generator + auditor DOM traversal from full re-walk (~15+ tool calls) to spot-check only (2-3 tool calls) when a fresh field-inventory artifact exists. Full re-walk remains as a fallback when the spot-check detects drift.

## Step-by-step

1. **Phase 0 — Consumer definition inventory**:
   - List every file that defines generator + auditor Phase 0.5 language.
   - Capture the existing LR-007 re-verify mandate and the LR-013 walkthrough mandate.
2. **Edit generator identity** (`.claude/agents/GENERATOR.agent.md`):
   - Phase 0.5 now reads: "if `field-inventories/<module>-*.md` exists and MCP_Session_Date is ≤14 days old, READ it first. Select 2-3 random fields; verify current DOM matches artifact's default + validation + testid. If all 3 match, Phase 0.5 is complete. If any disagrees, emit `DRIFT_DETECTED` → full re-walk + update artifact."
3. **Edit auditor identity** (`WATCHDOG.agent.md`):
   - Auditor Phase 0.5 now reads: "verify artifact ↔ DOM (not artifact ↔ TCs). Pick 3 fields from the artifact, confirm live DOM still matches. If yes, artifact is trusted; proceed to TC↔artifact audit (purely MD vs MD, no DOM)."
4. **Amend LR-007 in `CLAUDE.md`**:
   - Current text: "MCP-verify ALL planner claims before writing spec code."
   - New text: "MCP-verify the planner's field-inventory artifact by spot-checking 2-3 random fields. Full re-walk is required ONLY if spot-check detects drift. Graduated by SP-AAE-04 (2026-04-23)."
5. **Amend LR-013**: "Phase 0.5 is complete when (a) field-inventory artifact read + spot-checked if ≤14 days old, OR (b) new artifact emitted if stale/missing."
6. **Instrument dry-run**: run a generator session on a module that has a fresh artifact (e.g., LOS) → count DOM tool calls. Must be ≤5 (3 spot-check + 2 navigation). Capture in activity-log.
7. **Instrument drift-case dry-run**: deliberately corrupt one field's default in the artifact → run generator → confirm `DRIFT_DETECTED` fires and full re-walk kicks in.

---

## Artifacts produced / modified

- `.claude/agents/GENERATOR.agent.md` (or equivalent) — Phase 0.5 rewritten.
- `.claude/agents/WATCHDOG.agent.md` — auditor Phase 0.5 rewritten.
- `.github/copilot-instructions.md` (if applicable).
- `CLAUDE.md` — LR-007 + LR-013 amended.
- Instrumentation evidence in activity-log (tool-call counts for happy + drift paths).

## Success criteria

- [ ] Generator dry-run on fresh-artifact module: ≤5 DOM tool calls.
- [ ] Generator dry-run on corrupted artifact: DRIFT_DETECTED fires; full re-walk engages.
- [ ] Auditor dry-run: artifact-vs-DOM spot check succeeds; rest of audit is MD-only.
- [ ] LR-007 + LR-013 amended with SP-AAE-04 graduation reference.
- [ ] No in-flight session breaks (regression-guard passes before + after).
- [ ] LR-040 closure gate passed.

## Handoff

- Activity-log row with instrumentation evidence.
- Chat: system fix complete end-to-end (SP-AAE-01..04); parallel rollout (SP-AAE-06) can start any time.
- On close: `git mv` to `plans/done/`, update Status + Executed, run `npm run plans:reindex`.

---

### Execution Summary (2026-04-25)

**Identity**: OWNER (reassigned mid-execution from authored GARDENER per parent plan AAE-D9 follow-up — `.github/agents/**` is `SYNC ONLY` for OWNER per §2 + root `CLAUDE.md` is OWNER-RW per §2.1; AAE-D9 explicitly directed OWNER for SP-AAE-04. Re-classification logged in subplan Bootstrap line 22.)

**Steps implemented (5 of 7)**:
1. ✅ **Phase 0 — Consumer inventory**: read `.github/agents/playwright-test-generator.agent.md`, `.github/agents/playwright-pipeline-audit.agent.md`, `.github/copilot-instructions.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md` §2, current LR-007 + LR-013 in `CLAUDE.md`. `.claude/agents/` checked: only `COLLEAGUE.agent.md` + `RUTVIK.agent.md` present (no GENERATOR/WATCHDOG files there) — pipeline agents live under `.github/agents/`. `copilot-instructions.md` confirmed to delegate to `CLAUDE.md`; no Phase 0.5 / LR-007 / LR-013 duplication, no edit needed.
2. ✅ **Generator edit** (`.github/agents/playwright-test-generator.agent.md`): split Phase 0.5 into **Phase 0.5a (artifact spot-check, ≤5 DOM tool calls, preferred)** and **Phase 0.5b (full UI walkthrough, fallback on drift / staleness >30d / missing artifact)**. Inserted spot-check WALKTHROUGH_LOG format (3 rows: testid resolves / default matches / enabled-disabled matches) as canonical Phase 0.5 evidence post-amendment. Updated **Phase 0.5 Gate** to accept either path. Existing GEN-029 / GEN-035 / Phase 0.5 Verification Checklist preserved under 0.5b.
3. ✅ **Auditor edit** (`.github/agents/playwright-pipeline-audit.agent.md`): amended Mode 2 Step 2 — split into **2a (artifact ↔ DOM 3-field spot-check + then MD-only TC ↔ artifact audit)** and **2b (full DOM walk fallback)**. Drift handling: emit `DRIFT_DETECTED` → fall through to 2b AND refresh artifact (WATCHDOG-UPDATE per AAE-D9 + §2 ownership for `field-inventories/<module>-*.md`).
4. ✅ **LR-007 amended in `CLAUDE.md`** (line 223): rewritten from "MCP-verify ALL planner claims" to "MCP-verify the planner's field-inventory artifact via spot-check (2-3 random fields). Full re-walk required ONLY when spot-check detects drift, artifact is missing, or it is >30 days stale (per AAE-D6)." Original spirit retained as a sub-paragraph (planner-OFTEN-wrong reminder + LOS 2026-03-24 incident citation). Trigger expanded to include WATCHDOG Mode 2. Graduated-from line cites SP-AAE-04 (2026-04-25) + SP-DQU-02 root cause.
5. ✅ **LR-013 amended in `CLAUDE.md`** (line 251): "Phase 0.5 completion gate" rewritten to TWO satisfaction paths — **(a)** fresh-artifact spot-check path (preferred — ≤14 days, 3-row spot-check WALKTHROUGH_LOG IS valid evidence) AND **(b)** emit-new-artifact path (fallback — when missing / >30 days stale / drift). Both paths still require all 8 frontmatter keys + 7 sections + LR-014 testid coverage. Trigger expanded to include WATCHDOG Mode 2 audits. Forward reference "(SP-AAE-04 will refactor...)" replaced with present-tense "(SP-AAE-04 amended LR-007 + LR-013 to make spot-check the canonical verification...)".

**Steps deferred (2 of 7)**: per LR-040 path (b) with grep-verifiable hand-off:
6. ⏸ **Instrument dry-run** (≤5 DOM tool calls on fresh-artifact happy path).
7. ⏸ **Instrument drift-case dry-run** (corrupt one field's default → DRIFT_DETECTED fires).

**Reason for deferral**: at 2026-04-25, `clients/encore/specs_planning/_internal/field-inventories/` contains ONLY `_TEMPLATE.md` — zero real per-module field-inventory artifacts exist yet (verified via `ls`). Steps 6-7 require a fresh artifact to dry-run against, which requires a planner session (PLN-049 / SP-AAE-03 emits). The earliest natural opportunity is SP-AAE-06 Wave 1 (which spawns planner sessions for the first 3 modules). HALT conditions in this subplan ("spot-check budget too small to catch drift" / "amendment weakens verification") cannot be validated without a real artifact + a real generator dry-run.

**Hand-off (LR-040 path b)**: line item added to `plans/pending/SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md` Step 2 Wave 1 (line 86) — instrumentation calibration on the FIRST module: capture (a) DOM tool-call count happy path + (b) deliberately corrupt + verify DRIFT_DETECTED. HALT wave on miss → file SP-AAE-04 follow-up. Grep-verifiable: `grep -n "Instrumentation calibration (deferred from SP-AAE-04" plans/pending/SUBPLAN_AAE_06_*.md`.

**Files modified**:
- `.github/agents/playwright-test-generator.agent.md` (Phase 0.5 split + Gate)
- `.github/agents/playwright-pipeline-audit.agent.md` (Mode 2 Step 2 split)
- `CLAUDE.md` (LR-007 + LR-013 amended)
- `plans/pending/SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md` (Wave 1 instrumentation hand-off)
- `plans/pending/SUBPLAN_AAE_04_CONSUMERS_NO_REWALK.md` (Identity reassignment + this Execution Summary)

**Files NOT modified (and why)**:
- `.github/copilot-instructions.md` — delegates to CLAUDE.md, no Phase 0.5 / LR-007 / LR-013 duplication
- `.claude/agents/*.agent.md` — only COLLEAGUE + RUTVIK templates, no pipeline identities live here
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — §2 already encodes field-inventory ownership rows (added by SP-AAE-01); no new ownership semantics needed for this subplan
- `.claude/skills/execute/SKILL.md` / `audit/SKILL.md` — neither references Phase 0.5 directly; the skill calls `/identity` + reads CLAUDE.md, which now carries the amended rules

**LR-040 closure**: every planned item classified —
- Steps 1-5 → (a) MCP-proven equivalent (directly implemented + grep-verified against artifact edits)
- Steps 6-7 → (b) grep-verifiable hand-off in SP-AAE-06 line 86
- HALT conditions (budget too small / amendment too weak) → (b) same hand-off (SP-AAE-06 wave 1 explicitly HALTs on miss)

**Cross-checks (post-execution audit per claim_vs_artifact_crosscheck)**:
- Generator Phase 0.5a/0.5b headings present: `grep -nE "Phase 0.5a|Phase 0.5b|Phase 0.5 Gate" .github/agents/playwright-test-generator.agent.md` → 7 hits at lines 164, 165, 169, 177, 195, 197, 266
- Auditor 2a/2b headings: `grep -nE "2a|2b|TC \\xe2\\x86\\x94 artifact" .github/agents/playwright-pipeline-audit.agent.md` → hits at lines 122-128
- LR-007 amendment: heading at CLAUDE.md:223 reads "amended by SP-AAE-04, 2026-04-25"
- LR-013 amendment: gate paragraph at CLAUDE.md:271 reads "amended by SP-AAE-04, 2026-04-25"
- SP-AAE-06 hand-off: line 86 contains `Instrumentation calibration (deferred from SP-AAE-04 steps 6-7)`

**Risks / known limitations**:
- The 2-3 field spot-check budget is unvalidated empirically — if SP-AAE-06 Wave 1 finds drift on a field NOT in the random 3, the spot-check missed it. Mitigation: planner is still the single DOM-walk source; mismatched TCs surface in Wave 1 client-review simulation (Step 6 of SP-AAE-06). If miss-rate >0, raise budget to 5 + re-amend LR-007.
- Selector verification in 0.5a checks only `data-testid` attribute presence + value; it does NOT verify cross-field validation timing (LR-010) or async behaviors (LR-026). Those remain Phase 1/Phase 2 generator concerns. The artifact's `Cross-field deps` column carries this info forward without a DOM round-trip.
- WATCHDOG MUST refresh stale/drifted artifacts per AAE-D9 §2; if WATCHDOG runs without RW on `<module>-*.md` (legacy session), the auditor edit's "WATCHDOG-UPDATE" instruction silently fails. SP-AAE-01 already added the §2 row, so this should be live, but worth confirming on first WATCHDOG run.
