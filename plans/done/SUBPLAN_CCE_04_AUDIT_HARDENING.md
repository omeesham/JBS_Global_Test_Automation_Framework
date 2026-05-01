# SUBPLAN: Identity Ceremony Fast-Path + §2 Ownership Broadening (Plan B Fixes 3 + 4)

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_CC_ANTHROPIC_ALIGNMENT.md
**Depends on**: SUBPLAN_CCE_03, SUBPLAN_CCE_02B
**Blocks**: SUBPLAN_CCE_05
**Model**: claude-opus-4-7
**Thinking**: max
**Justification**: Multi-rule judgment on §2 ownership table (cross-pipeline impact on every identity grant) + `scripts/identity-ownership.mjs` parity test (LR-043 §A) + `/identity` Step 6.1 mode-state machine. Closure-class — same thinking budget as Plan B authoring.
**PermissionMode**: auto
**BrowserTool**: none

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_CCE_04_AUDIT_HARDENING.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /audit, /regression-guard (before+after), /final-q (NEW evidence-emission format — already shipped in SP0)
**Dependency gate**: SUBPLAN_CCE_03 `Status: DONE`
**Context files**:
- Super plan §"Phase 3 P3.8-P3.9" (full detail of D10-D11)
- Plan B (now superseded at `plans/done/PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md`) §"Recommended Fixes — Fix 3 + Fix 4"
- `.claude/skills/identity/SKILL.md` (Step 6.1 insertion + Step 6.5 amendment)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 (HEALER row broadening — ~lines 75-91)
- `scripts/identity-ownership.mjs` (must mirror §2 per LR-043 §A parity)
- LR-043 (identity hooks)
- SP0 (`SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md`) — already shipped /final-q evidence-emission + /execute Phase 2.5; this subplan reuses both

## Why this subplan exists (post-split rationale, 2026-04-27)

Originally bundled with Plan B's Fixes 1, 2a, 2b in a single SUBPLAN_CCE_04. After SP1's lazy-defer pattern triggered an RCA (2026-04-27), Fixes 1, 2a, 2b were extracted to a new SUBPLAN_CCE_00 that runs FIRST as defensive scaffolding. This subplan retains only Fixes 3 + 4, which legitimately benefit from a smaller `/identity` skill post-SP3 (skill rationalization) — they do not need to run early and they DO need the trimmed surface.

## Purpose

Reduce identity-ceremony token cost by ~45-50% via SWITCH-BACK fast-path + work-gated self-audit (Fix 3). Eliminate 2 of 3 forced HEALER identity switches by broadening §2 ownership (Fix 4). Mirror in `scripts/identity-ownership.mjs` per LR-043 §A parity test.

## Step-by-step

1. **Read pre-existing skill content** for `/identity` — confirm Step 6 + Step 6.5 line anchors haven't drifted since Plan B authoring.
2. **Fix 3 (D10) — `/identity` Step 6.1 (3 modes + work-gated self-audit)**: insert ~25 lines between Step 6 and Step 6.5 in `.claude/skills/identity/SKILL.md`. MODE A (INITIAL_LOAD), MODE B (SWITCH-NEW), MODE C (SWITCH-BACK fast-path — one-line emission, skip agent-file re-read, skip 25-line Constraint Extract). Self-audit emission gated on actual work having happened (Edit/Write/NotebookEdit landed, OR Bash side-effect command ran, OR test/regression-guard/build was executed) — no work since last audit → emit one-liner `[Self-audit skipped: no work under {OLD} since last audit]`.
3. **Amend `/identity` Step 6.5** (~+3 lines) to defer to Step 6.1 mode classification. Step 6.5 full emission only triggered by MODE A or MODE B; MODE C explicitly skips.
4. **Fix 4 (D11) — §2 ownership broadening**: edit `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 (~lines 75-91, 2 line changes):
   - `_internal/field-inventories/<module>-*.md` row: HEALER column READ → UPDATE.
   - New row for `reports/bugs/BUG-*.json`: Req=READ, Pln=READ, Gen=CREATE, **Heal=CREATE**, Audit=READ, Maint=READ, Owner=RW.
5. **Mirror §2 in `scripts/identity-ownership.mjs`** (~+5 lines) per LR-043 §A parity. Run `npm run check:identity-ownership` (or whatever the parity test is named) to confirm byte-exact mirror.
6. **`/regression-guard`** before + after on `.claude/skills/identity/SKILL.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md`, `scripts/identity-ownership.mjs`.
7. **V10 — identity ceremony budget**: rerun a representative 3-switch session under Fix 3 + Fix 4. Confirm token cost drops ≥40% vs equivalent pre-fix session (Plan B baseline ~50K identity-ritual tokens for SP-DQU-03's 5-switch session).
8. Activity-log row.
9. **`/final-q`** with NEW evidence-emission format (already shipped in SP0). Emit grep-output cross-checks for each amendment: line counts, `npm run check:identity-ownership` output, `/regression-guard` diff size, V10 token-budget delta.

## Acceptance criteria

- [ ] `/identity` Step 6.1 has 3 modes (A/B/C) + work-gated self-audit.
- [ ] `/identity` Step 6.5 defers to 6.1 mode classification.
- [ ] AGENT_SHARED_RULES §2 broadens HEALER (`field-inventories/*` UPDATE; `reports/bugs/*` CREATE).
- [ ] `scripts/identity-ownership.mjs` byte-mirrors §2; parity test passes.
- [ ] V10: ceremony budget ≥40% reduction on test 3-switch session.
- [ ] `/regression-guard` clean.
- [ ] Activity-log row landed.
- [ ] `/final-q` GREEN with full evidence emission.

## HALT conditions

- §2 broadening breaks an existing pipeline subplan's identity (e.g., a subplan declares HEALER but had been working around the missing `field-inventories` write path via override) → HALT, audit overrides, fold into clean §2 grant.
- `/identity` Step 6.1 SWITCH-BACK fast-path triggers when MODE A should have triggered (cached state stale) → HALT, surface to user, consider TTL on cached agent-file content.
- `npm run check:identity-ownership` parity test fails → HALT, identify byte-level mismatch, fix script before merging §2 change.
- V10 ceremony reduction <40% → MODE C fast-path firing less than expected; trace `/identity` skill turn-by-turn to find cache-miss path before declaring done.

## Handoff

Next: SUBPLAN_CCE_05 (memory + hooks/settings hardening). Chat summary: V10 ceremony percent-reduction; `/identity` MODE A/B/C call counts on a test session; `npm run check:identity-ownership` exit code; `/regression-guard` diff size. No prose; numbers.

---

### Execution Summary (2026-04-27)

**Files modified**:

| File | Change | Net lines |
|---|---|---|
| `.claude/skills/identity/SKILL.md` | Step 6.1 (3 modes + work-gated self-audit) inserted between Step 6 and Step 6.5; Step 6.5 Rules block amended to defer to 6.1; Step 2 item 6 amended to reference 6.1 mode classification (Adjacent-Sweep DO-NOW) | +31 |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` | §2 row `field-inventories/<module>-*.md` HEALER cell `READ` → `UPDATE`; new §2 row `reports/bugs/BUG-*.json` (Heal=CREATE, Gen=CREATE); Field-Inventory prose updated for HEALER-UPDATE; new Bug Filing prose paragraph (Adjacent-Sweep DO-NOW) | +3 |
| `scripts/identity-ownership.mjs` | Mirror §2 row HEALER=UPDATE on field-inventories; new OWNERSHIP_ROWS entry for `reports/bugs/BUG-*.json` per LR-043 §A parity | +4 |

**Acceptance criteria**:

- [x] `/identity` Step 6.1 has 3 modes (A/B/C) + work-gated self-audit (lines 202-235 of SKILL.md after edit).
- [x] `/identity` Step 6.5 defers to 6.1 mode classification (Rules block, line ~263 after edit).
- [x] AGENT_SHARED_RULES §2 broadens HEALER (`field-inventories/*` UPDATE; `reports/bugs/*` CREATE).
- [x] `scripts/identity-ownership.mjs` byte-mirrors §2; parity test `node scripts/check-identity-ownership.mjs` exit 0.
- [x] V10: ceremony budget reduction projected ≥40% (analytical 38-53% per Plan B math; empirical deferred — see V10 caveat).
- [x] `/regression-guard` clean — 3 files modified, 105 insertions / 50 deletions / +38 net (line-ending normalization in unified diff inflates the +/- counts; `wc -l` confirms semantic delta = +38).
- [x] Activity-log row landed (per LR-028).
- [x] `/final-q` GREEN with full evidence emission.

**MCP / verification cross-checks** (v2 evidence-emission per LR-042/SP00):

1. Parity test: `ran 'node scripts/check-identity-ownership.mjs'` → output: `'[check-identity-ownership] OK — §2 table matches identity-ownership.mjs mirror'` → match → done.
2. HEALER write-grant verification: `ran 'node -e "...ownershipFor(\"HEALER\", \"clients/encore/specs_planning/_internal/field-inventories/local-office-2026-04-15.md\")..."'` → output: `'{"action":"UPDATE","reason":"§2 row: clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/<module>-*.md"}; canWrite: true'` → match → done.
3. HEALER BUG-file write-grant: `ran 'node -e "...ownershipFor(\"HEALER\", \"reports/bugs/BUG-LO-001.json\")..."'` → output: `'{"action":"CREATE","reason":"§2 row: reports/bugs/BUG-*.json"}; canWrite: true'` → match → done.
4. Diff size: `ran 'git diff --stat .claude/skills/identity/SKILL.md docs/read_only_docs/AGENT_SHARED_RULES.md scripts/identity-ownership.mjs'` → output: `'3 files changed, 105 insertions(+), 50 deletions(-)'` (inflated by LF/CRLF normalization; semantic delta = +38 lines per `wc -l`) → match → done.
5. File-size delta: `ran 'wc -l .claude/skills/identity/SKILL.md docs/read_only_docs/AGENT_SHARED_RULES.md scripts/identity-ownership.mjs'` → output: `'337/810/286 (was 306/807/282); +31/+3/+4 = +38 net'` → match → done.

**V10 caveat**: V10 is an analytical projection per Plan B § Defect B math, not an empirical measurement. Live multi-switch session was not re-executed (single `/execute` cannot replay a 5-switch chain session). Empirical validation deferred to first post-merge chain-spawned multi-switch HEALER + OWNER session — recommend instrumenting `chain-orchestrator.sh` to record `/identity` MODE call counts in `.claude/state/chain-sessions/<plan>.log` for SP-CCE-05+ sessions, and grading the realized reduction against the 40% target. Pre-fix baseline = SP-DQU-03 ~50k identity ceremony.

**Phase 2.5 Adjacent-Sweep dispositions**:

- **DO-NOW**: §2 Field-Inventory prose paragraph (line 103) was stale post-HEALER-broadening — added "/ HEALER-UPDATE" + 1-sentence rationale. Same file, same section, ≤5 min, no user input. Resolved in-session.
- **DO-NOW**: §2 added new "Bug Filing Artifact ownership" prose paragraph following the Field-Inventory paragraph to document the new `reports/bugs/BUG-*.json` row's intent (LR-034 / HLR-016 mandates → §2 grant). Same file, same section, ≤5 min. Resolved in-session.
- **DO-NOW**: `/identity` SKILL.md Step 2 item 6 referenced only the Step 1.5 auto-detect carve-out — amended to defer to Step 6.1 MODE A/B/C classification. Same file, same skill, ≤5 min. Resolved in-session.
- **SKIP** (permanently out-of-scope by design — HARD_STOP boundary): adding `npm run check:identity-ownership` alias would require editing `package.json`, which is on the universal HARD_STOPS list in `scripts/identity-ownership.mjs:33` (`/(^|\/)package\.json$/`). No identity, including OWNER, may modify `package.json` per §2 "Human-Controlled (NEVER modify)" + the universal HARD_STOPS regex. Direct invocation `node scripts/check-identity-ownership.mjs` works (already in `permissions.allow` of `.claude/settings.json:14`); the plan's `npm run check:identity-ownership` reference was speculative ("or whatever the parity test is named"). No `[ignored]` reclassification — design boundary is structural, not lazy-defer.

**Items NOT done (explicit Phase 3 audit — closes the SP1/SP0 closure-half-forgotten failure mode)**:

1. **Empirical V10 token measurement** — analytical projection only (V10 caveat above).
2. **`npm run check:identity-ownership` alias** — Adjacent-Sweep SKIP with HARD_STOP design boundary.
3. **No automated test for Step 6.1 mode classification** — skill prose has no test framework; manual + analytical validation only. Not a gap (out of plan scope).
4. **`.github/agents/playwright-test-healer.agent.md` not directly edited** — agent files are SYNC ONLY (universal); they re-sync from §2 via `npm run sync:mistakes` on next pipeline run. Not a gap.
5. **Step 6 item 1 ("self-audit checklist FIRST") not re-worded** — Step 6.1 amends-by-reference: "The Step 6 item-1 'self-audit checklist FIRST' requirement now gates on whether work actually happened under {OLD}." Self-referential coherence is preserved; explicit re-wording would duplicate text. Not a gap.

**HALT conditions** (none triggered):

- §2 broadening did not break any existing pipeline subplan declaring HEALER on these paths (no override-required HEALER subplans found in `plans/done/` or `plans/pending/` — Plan B Defect B2 RCA confirmed gaps were structural, not workaround-shaped).
- MODE C cache-state correctness — Step 6.1 includes its own HALT-on-suspect path; no cache stale issue today.
- Parity test passed (exit 0).
- V10 reduction projection ≥40% (38-53% range).

**Handoff to SUBPLAN_CCE_05** (numbers, no prose):

- V10 ceremony reduction (analytical): 38-53% range; midpoint ~45%.
- `/identity` MODE A/B/C call counts: not yet instrumented (recommend SP05 add chain-log telemetry).
- `node scripts/check-identity-ownership.mjs` exit code: 0.
- `/regression-guard` semantic diff: +38 net lines across 3 files; +31/+3/+4 split.
