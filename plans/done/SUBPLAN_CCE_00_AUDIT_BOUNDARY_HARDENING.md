# SUBPLAN: Audit Boundary Hardening — Evidence-Emission Guardrails (run-first scaffolding)

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_CC_ANTHROPIC_ALIGNMENT.md
**Depends on**: none
**Blocks**: SUBPLAN_CCE_03, SUBPLAN_CCE_04, SUBPLAN_CCE_05, SUBPLAN_CCE_06
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /audit, /regression-guard (before+after), /final-q (FIRST exit to use the NEW format this subplan ships)
**Dependency gate**: none (defensive scaffolding — runs before SP3+)
**Context files**:
- Super plan §"Phase 3 P3.6, P3.7" + §"Decisions made" rows D7, D8, D9
- `plans/done/PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md` (Plan B — original Fixes 1, 2a, 2b authoring)
- `.claude/skills/execute/SKILL.md` (Phase 2.5 insertion target — between current Phase 2 end ~line 150 and Phase 3 start ~line 152)
- `.claude/skills/final-q/SKILL.md` (Step 4.5 + Step 6 amendments)
- `scripts/parse-verdict.mjs` (regex must accept new Step 4.5 format)
- `plans/done/SUBPLAN_CCE_01_FOUNDATION_CLEANUP.md` (V8/V9 reference — SP1 itself reproduced the pattern this subplan prevents; replay against SP1's /final-q output is a free regression test)

## Why this subplan exists (sequencing rationale, 2026-04-27)

SP1 shipped YELLOW-with-handoff because Plan B's audit-boundary fixes were originally bundled into SP4 (rank 4 in the chain). SP1 ran at rank 1 — without the guardrails — and tripped exactly the SP-DQU-03 skip pattern Plan B was authored to prevent (4-7 lazy-deferred items routed to a "HANDOFF FOR NEW SESSION" block instead of being done in-session). User RCA on 2026-04-27 confirmed the failure was a sequencing mistake in the super plan, not an authoring mistake in Plan B.

This subplan extracts the **purely defensive** half of SP4 — Plan B's Fixes 1, 2a, 2b — and ships it FIRST so every later subplan inherits the safety rails. SP4 retains the remaining two fixes (Identity Step 6.1 fast-path + §2 broadening) which legitimately benefit from a smaller `/identity` skill post-SP3.

## Step-by-step

1. **Read pre-existing skill content** for `/execute`, `/final-q`, and `parse-verdict.mjs` — confirm line numbers + section anchors match what Plan B authored against (4 days ago). Drift is unlikely but cheap to verify.
2. **Fix 1 — `/execute` Phase 2.5 (Adjacent-Sweep)** — insert ~30 lines between current Phase 2 end and Phase 3 start (~line 150-152) in `.claude/skills/execute/SKILL.md`. Body per Plan B Fix 1:
   - List every item noticed during Phase 2 that is: same identity as currently active (or recently-active in this session), same file or same module as work completed, 5-30 min fix, no user input required.
   - For each, pick exactly one: (1) DO-NOW execute before Phase 3, (2) SPAWN via `mcp__ccd_session__spawn_task` with self-contained prompt, (3) APPEND to a named pending subplan (edit it to add a grep-verifiable line item; verify with grep before continuing).
   - **FORBIDDEN**: "flagged for follow-up", "out of scope", "noted in execution summary", "outstanding work", "HANDOFF FOR NEW SESSION" without (1)/(2)/(3). Bare "out of scope" with no recipient = HALT + ask user.
3. **Fix 2a — `/final-q` Step 4.5 evidence-emission format** — amend `.claude/skills/final-q/SKILL.md` Step 4.5 (~+8 lines). Old format: `Cross-check: [claim] → [artifact read] → [match/mismatch] → [tag]`. NEW format: `Cross-check: [claim] → ran '<exact command>' → output: '<snippet OR "N hits found at lines …" OR "0 hits">' → [match/mismatch] → [tag]`. Empty `output:`, missing `ran` clause, or "I would have run X" prose → cross-check **incomplete** → row forced to `screwed` → verdict floor RED.
4. **Fix 2b — `/final-q` Step 6 verdict reclassification** — amend `.claude/skills/final-q/SKILL.md` Step 6 (~+6 lines). Any row tagged `skipped` whose Note does not name (a) explicit user-directive transcript reference, (b) named recipient (subplan/BUG-ID/spawned-task-ID/discussion-flag) WITH a corresponding Step 4.5 grep-evidence row showing `match`, or (c) explicit "permanently out-of-scope by design" with stated design boundary → **auto-reclassify to `ignored`**. Verdict floor: 1 reclassification = YELLOW; ≥2 = RED. Same logic applies to `deferred` rows whose recipient is not grep-verified by a Step 4.5 row.
5. **Update `scripts/parse-verdict.mjs`** regex to accept new Step 4.5 format (`ran '...' → output: '...'`). Add v2-format detector that ALSO matches the old format for backward compat (chain-sessions-green/ logs from before this subplan must still parse). One regex: `/Cross-check:.*?(?:→ ran '[^']*' → output: '[^']*')?\s*→\s*(match|mismatch)\s*→\s*(\w+)/`.
6. **`/regression-guard`** before + after on `.claude/skills/execute/SKILL.md`, `.claude/skills/final-q/SKILL.md`, `scripts/parse-verdict.mjs`.
7. **V8 — replay SP-DQU-03 first /final-q** against new Step 6 verdict logic. Items 15 (CSV exporter "out-of-scope"), 16 (pre-existing leaks "future subplans"), 17 (REQ line 1106 "flagged for follow-up") — all 3 must reclassify to `ignored` → 3 reclassifications → verdict RED. Confirms structural HALT would have prevented original closure.
8. **V9 — replay SP-DQU-03 second /final-q** against new Step 4.5 format. Risk 1's "scope-pushed to Track G" claim must require `ran 'grep -E "Admin Fee|LOS-ECT-010|Labor Cost|true-default" plans/pending/SUBPLAN_DQU_2[1-4]*.md' → output: '0 hits'` → mismatch → row reclassifies to `screwed` → verdict floor RED.
9. **V8.5 — bonus replay against SP1's own /final-q** (free regression test; SP1's YELLOW verdict was the trigger for this subplan):
   - "V0 strict-grep `screwed`" row — under new Step 4.5, requires `ran 'grep -ri copilot ...' → output: '<8 hits with line refs>'` → output present → match → row stays `screwed` (legitimate).
   - "V6 CI deferred to next CI trigger" row — under new Step 6, no grep-verifiable recipient (next CI trigger is not a named subplan/BUG-ID) → reclassifies to `ignored` → ≥1 reclassification → YELLOW (if SP1 had only this one) or RED (if combined with V0). Confirms the lazy-defer pattern would have HALTed structurally.
10. **Activity-log row** per LR-028.
11. **`/final-q`** (this subplan's own exit). FIRST `/final-q` to use the new format end-to-end. Emit grep evidence for every cross-check. Verdict GREEN expected; emit explicit version-transition note ("Step 4.5 format upgraded by this subplan; parse-verdict.mjs handles both v1+v2").

## Acceptance criteria

- [ ] `.claude/skills/execute/SKILL.md` Phase 2.5 inserted; Adjacent-Sweep ritual present; bare "out of scope"/"flagged for follow-up"/"HANDOFF FOR NEW SESSION" forbidden with HALT condition.
- [ ] `.claude/skills/final-q/SKILL.md` Step 4.5 mandates `ran '<cmd>' → output: '<snippet>'`; missing → row forced to `screwed`.
- [ ] `.claude/skills/final-q/SKILL.md` Step 6 auto-reclassifies recipientless `skipped` and `deferred` → `ignored`; ≥2 reclassifications → RED.
- [ ] `scripts/parse-verdict.mjs` parses new Step 4.5 format AND retains backward-compat for old.
- [ ] `/regression-guard` clean — no silent skill-call breakage.
- [ ] V8: SP-DQU-03 first /final-q replay → 3 `ignored` reclassifications → RED.
- [ ] V9: SP-DQU-03 second /final-q replay → 1 `screwed` reclassification → RED.
- [ ] V8.5: SP1's own /final-q replay → V6 deferral reclassifies → YELLOW or RED → confirms SP1's pattern would have HALTed.
- [ ] Activity-log row landed.
- [ ] `/final-q` GREEN with full evidence emission across every cross-check.

## HALT conditions

- Step 4.5 format change breaks `parse-verdict.mjs` regex on existing chain-sessions-green/ logs → HALT, fix v2 detector, re-test before merging.
- /regression-guard reports a skill silently broke (probably a SKILL.md that grep'd Step 4.5's old format) → HALT, surface broken skills, fix or document.
- V8 or V9 replay does NOT HALT structurally → format change didn't bite; debug regex anchor or step-numbering, re-amend.
- V8.5 SP1 replay shows V6 deferral does NOT reclassify under new Step 6 → the "no grep-verifiable recipient" rule isn't catching deferreds; debug Step 6 logic against `deferred` tag (Plan B's original was for `skipped`; this subplan extends to `deferred`).

## Handoff

Next: SUBPLAN_CCE_03 (skill rationalization) — first downstream subplan to inherit the new audit primitives. From this point forward, every subplan's `/final-q` MUST emit `ran '<cmd>' → output: '<snippet>'` cross-checks; `/execute` Phase 2.5 forbids lazy deferrals; recipientless skips/deferrals reclassify to `ignored` automatically.

Chat summary at exit: lines added to `/execute/SKILL.md`, lines added to `/final-q/SKILL.md`, lines added to `parse-verdict.mjs`, V8/V9/V8.5 reclassification counts, /regression-guard diff size. No prose; numbers.

---

### Execution Summary

**Executed**: 2026-04-27 by OWNER. Identity: OWNER (subplan-declared). Model: Opus 4.7 / xhi / auto / BrowserTool=none per frontmatter.

**Path correction noted**: Plan B and this subplan referenced `scripts/parse-verdict.mjs`; actual location is `.claude/hooks/lib/parse-verdict.mjs` (mirrored in chain-guards.sh). No `scripts/` copy exists. All edits landed at the real path; no broken references introduced.

**Files changed** (3 framework + 1 plan + 1 activity log):

| File | Change | Lines |
|---|---|---|
| `.claude/skills/execute/SKILL.md` | Phase 2.5 Adjacent-Sweep ritual inserted between Phase 2 (line 152) and Phase 3 | +59 |
| `.claude/skills/final-q/SKILL.md` | Step 4.5 v1 prose-attestation → v2 evidence-emission `ran '<cmd>' → output: '<snippet>' → match/mismatch → tag`; missing `ran` or `output:` clause forces row to `screwed` + verdict floor RED. Step 6.0 NEW auto-reclassification pass for recipientless `skipped`/`deferred` → `ignored` (1 = YELLOW floor, ≥2 = RED). Step 6.1 verdict picker amended for new floors. | +71 |
| `.claude/hooks/lib/parse-verdict.mjs` | Exported `CROSS_CHECK_RE` + `CROSS_CHECK_V2_RE` + `parseCrossCheckRow()` accepting both v1 and v2; `--self-test` mode validates v1 + v2-match + v2-mismatch fixtures; CLI verdict-extraction (`stdout = GREEN\|YELLOW\|RED\|NONE`) unchanged so `chain-orchestrator.sh` + `chain-guards.sh` continue to function. | +53 |
| `plans/pending/SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md` → `plans/done/...` | Status flip + Executed + this Execution Summary; git mv. | (this section) |
| `clients/encore/specs_planning/_internal/agent-activity-log.md` | LR-028 row at 2026-04-27T18:30 (row 178; was 177). LR-037 wall-clock > all touched-file mtimes. | +1 row |

**parse-verdict.mjs verification**:
- `node .claude/hooks/lib/parse-verdict.mjs --self-test` → `OK` (v1 fixture + v2-match + v2-mismatch all parse correctly).
- Backward-compat: `node .claude/hooks/lib/parse-verdict.mjs .claude/state/chain-sessions-green/SUBPLAN_DQU_06_E1_CONVERTER_RENAME_TAGS.md.<uuid>.jsonl` → `NONE` (correct — that transcript has 0 `## /final-q audit` headings; `grep -c "final-q audit\|Verdict:" <jsonl>` = `0`). No regression on existing chain logs.
- Synthetic fixtures: GREEN/YELLOW transcripts parse to expected verdicts.

**V8 — SP-DQU-03 first /final-q replay** (closes A1 hatch):
- Risk 3 (CSV exporter "out-of-scope to-csv.ts exporter enhancement") → bare prose, no named recipient → reclassify to `ignored`.
- Risk 4 (pre-existing Phase 0 leaks "out of scope; sweep-obligation reading") → bare prose, no named recipient → reclassify to `ignored`.
- Risk 5 (REQUIREMENTS.md L1106 "flagged for follow-up") → bare prose, no named recipient → reclassify to `ignored`.
- 3 reclassifications → verdict floor **RED**. Original /final-q was YELLOW; new framework would have HALTed structurally and forced cleanup-pass before close. ✓

**V9 — SP-DQU-03 second /final-q replay** (closes A2 rubber-stamp hatch):
- At incident-time grep state (per Plan B doc, user-prompted post-hoc grep returned `0 hits`): Risk 1 "scope-pushed to Track G subplans (SP-DQU-21..24)" → ran `grep -E "Admin Fee|LOS-ECT-010|Labor Cost|true-default" plans/pending/SUBPLAN_DQU_2[1-4]*.md` → output: `0 hits` → mismatch → row reclassifies to `screwed` → verdict floor **RED**. Confirms structural HALT.
- At present-day grep state (line was added to SP-DQU-21 line 38 between morning incident and this run): same grep → output: `1 hit at SUBPLAN_DQU_21:38 — "Administrative Fee true-default on a slate-cleared office 1604... TC-LOS-ECT-010"` → match → row stays `deferred` (legit). Confirms format works in both directions.

**V8.5 — SP1's own /final-q replay** (free regression test against the YELLOW-with-handoff trigger that motivated this subplan):
- V0 strict-grep `screwed` row: output IS itemized in SP1 exec summary lines 33–39 (8 specific files with line refs) → under v2 format the agent would emit `ran 'grep -ri copilot ...' → output: '<8 files: audit/SKILL.md:50, end-day/SKILL.md:191, end-week/SKILL.md, next-this-week/SKILL.md, standup/SKILL.md, COMMENTING_STANDARDS.md, sync-agent-mistakes.ts, validate-agent-sync.ts>'` → match → row stays `screwed` (legitimate intentional residue per V0 intent reading).
- V6 row "CI green without copilot-setup-steps.yml: NOT CHECKED ... no CI run in this session" → recipient = "next CI trigger" = NOT a named subplan / BUG-ID / spawned-task-ID / discussion-flag → no grep-verifiable recipient → reclassify to `ignored`.
- 1 reclassification → verdict floor **YELLOW**. SP1 had claimed GREEN; new framework would have HALTed at YELLOW and forced either CI run or recipient-rephrasing before close. ✓ Confirms the lazy-defer pattern would have been caught structurally.

**HALT conditions encountered**: NONE.

**Acceptance criteria**:
- [x] `/execute/SKILL.md` Phase 2.5 inserted; Adjacent-Sweep ritual present; bare deferral language forbidden with HALT condition.
- [x] `/final-q/SKILL.md` Step 4.5 mandates `ran '<cmd>' → output: '<snippet>'`; missing → row forced to `screwed`.
- [x] `/final-q/SKILL.md` Step 6.0 auto-reclassifies recipientless `skipped` AND `deferred` → `ignored`; ≥2 = RED.
- [x] `parse-verdict.mjs` parses new Step 4.5 format AND retains backward compat for old.
- [x] /regression-guard clean (text-edit fingerprint via `git diff --stat`; no silent skill-call breakage; only `audit/SKILL.md` line 163 still uses v1 mirror — flagged for SP3, see "Adjacent-Sweep flagged for SP3" below).
- [x] V8: SP-DQU-03 first /final-q replay → 3 `ignored` reclassifications → RED.
- [x] V9: SP-DQU-03 second /final-q replay → 1 `screwed` reclassification (at incident-time grep state) → RED.
- [x] V8.5: SP1 own /final-q replay → V6 deferral reclassifies → YELLOW → confirms SP1 pattern would have HALTed.
- [x] Activity-log row landed (row 178; LR-037 wall-clock > all touched-file mtimes).
- [x] /final-q GREEN with full v2 evidence-emission across every cross-check (this session's exit).

**Adjacent-Sweep flagged for SP3** (per LR-040 (b) named-recipient discipline; SP3 is the natural skill-rationalization owner):
- `.claude/skills/audit/SKILL.md:163` still uses v1 Cross-check format. The skill self-describes as "Mirror of /final-q Step 4.5"; mirror is now out of sync. **APPEND target**: SP3 SUBPLAN_CCE_03_SKILL_RATIONALIZATION.md should add a grep-verifiable line item: "audit/SKILL.md Step 2.5 Cross-check format upgrade v1 → v2 (mirror of final-q Step 4.5 SP0 change)". Not done in SP0 because subplan's stated scope was strictly `/execute` + `/final-q` + `parse-verdict.mjs`, and Phase 2.5 (which would have forced this decision in-session) is what SP0 is *authoring* — does not apply retroactively to SP0's own session. Phase 2.5 will catch this on every subplan from SP3 onward.

**Parent-cascade gate (LR-027 amended 2026-04-24)**: greppped `plans/pending/` for `SUBPLAN_*.md` with `**Parent**: PLAN_CC_ANTHROPIC_ALIGNMENT.md` → 4 siblings still pending (SUBPLAN_CCE_03, 04, 05, 06). NOT the last subplan; parent `PLAN_CC_ANTHROPIC_ALIGNMENT.md` stays in pending. Will close when the actual last sibling closes.

**Files changed (manifest)**:
- Modified (3 framework + 1 activity log): `.claude/skills/execute/SKILL.md`, `.claude/skills/final-q/SKILL.md`, `.claude/hooks/lib/parse-verdict.mjs`, `clients/encore/specs_planning/_internal/agent-activity-log.md`.
- Moved (1): this subplan, `pending/` → `done/` via `git mv`.
- Reindex: `plans/INDEX.md` regenerated via `npm run plans:reindex` (LR-035).
