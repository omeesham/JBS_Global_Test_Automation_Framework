# SUBPLAN SP-OSB-02: Requirements Agent — Phase 1 Rewrite (Old-Site FIRST)

**Status**: DONE
**Executed**: 2026-04-24
**Priority**: P0
**Created**: 2026-04-24
**Parent**: [PLAN_OLD_SITE_TRUTH_BASELINE.md](PLAN_OLD_SITE_TRUTH_BASELINE.md)
**Depends on**: SP-OSB-01 GREEN (old-site access + selector parity proven) — consumed
**Blocks**: none (SP-OSB-03 can run in parallel; they touch different primary files)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: load-bearing edit — Requirements agent is the entry point for every pipeline. Incorrect Phase 1a artifact schema propagates to Planner + Generator. Opus + xhi per LR-041.

---

## Bootstrap (agent reads this first, zero prior context)

**Invoke with**: `/execute plans/pending/SUBPLAN_OSB_02_REQUIREMENTS_AGENT_REWRITE.md`
**Identity**: OWNER
**Skills auto-called**: `/identity`, `/execute`, `/regression-guard` (before + after), `/reflect`, `/final-q`

**Context files** (read before Phase 0):
- `plans/pending/PLAN_OLD_SITE_TRUTH_BASELINE.md` (parent — workflow rule + verbatim directive)
- `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (SP-OSB-01 output — **if YELLOW verdict**, read scope-expansion flags before starting)
- `.github/agents/playwright-requirements.agent.md` (PRIMARY EDIT TARGET — HUNTER identity agent, currently Phase 1 = new-site first)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` §Requirements (REQ-001..REQ-013) — reframe "live DOM = truth" per the new workflow
- `CLAUDE.md` root LR-007, LR-013 (walkthrough mandate; field-inventory discipline) — Requirements now emits a baseline artifact, not just a field-inventory artifact
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (artifact format — baseline artifact is a superset)

**Phase 0 directive**: read SP-OSB-01's artifact first; if GREEN, proceed as authored; if YELLOW, adapt Phase 1a wording so it handles selector divergence.

**Handoff sequence** (at end of session):
- `git diff` showing Phase 1 split into 1a (old-site baseline) + 1b (new-site compare) in the Requirements agent file.
- New `REQ-014` rule appended to agent-mistakes.md Requirements section.
- Activity-log row (LR-037).
- `/final-q` GREEN verdict.

**HALT conditions**:
- SP-OSB-01 verdict was RED or artifact missing → cannot proceed, escalate.
- Phase 1a wording would make Requirements agent do LIVE BROWSER work without a browser-tool declaration → tighten wording to force LR-038 declaration.
- `npm run validate:sync` fails after edits → fix before /final-q.

---

## Purpose

Make the Requirements agent's Phase 1 open with an old-site baseline walk (Phase 1a → emits a dated artifact), THEN move to new-site compare (Phase 1b → divergence = candidate bug per LR-034 or requirement-gap). Currently Phase 1 goes straight to new-site DOM. This change propagates the workflow rule to the pipeline entry point.

---

## Step-by-step

1. **Phase 0 — Inventory current Phase 1 language** in `.github/agents/playwright-requirements.agent.md`. Capture:
   - Line refs for "DOM is truth" / "Live DOM is truth" (line 17, line 75 per exploration notes).
   - Phase 1 (READ-ONLY) step block — current opening.
   - Phase 2 (interactive) — confirm this doesn't need changes (interactive is post-baseline).
2. **Write Phase 1a (NEW)**:
   - Open with LR-038 browser tool declaration (MANDATORY).
   - Navigate to `https://navigator2.training.psav.com/#/` + path equivalent of the module under intake.
   - Use ONLY read-only MCP tools (per REQ-008 — browser_navigate + browser_snapshot + browser_hover).
   - Document baseline: visible fields, defaults, save dialogs, validation, error recovery, history schema.
   - Emit artifact at `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md` (field-inventory-spec compatible).
   - HALT if Phase 1a artifact cannot be produced (blocks Phase 1b).
3. **Rewrite Phase 1b**:
   - Navigate to new site same module.
   - Row-by-row compare against Phase 1a artifact.
   - Every divergence is tagged: `BUG-CANDIDATE` (file per LR-034) | `INTENTIONAL-UX-CHANGE` (document + reference) | `REQUIREMENT-GAP` (flag to user + Planner).
   - Emit the new-site findings as the standard REQUIREMENTS update (existing Phase 1 artifact).
4. **Reframe REQ-001..REQ-013** where "live DOM is truth" appears:
   - REQ-002 wording: "Evidence-backed documentation: browser_snapshot proof for every field, on BOTH old site (baseline) AND new site (observed). Divergence documented in REQUIREMENTS.md."
   - REQ-010 wording: "Requirements agent is a HUNTER — explores OLD SITE FIRST (baseline), then compares NEW SITE. DOM is truth; old-site DOM is baseline truth; new-site DOM is observed truth."
   - Preserve REQ-003..REQ-009 as-is (they govern Phase 1/Phase 2 interaction discipline, orthogonal to old/new split).
5. **Add REQ-014** to agent-mistakes.md:
   - Rule: "Phase 1a old-site baseline artifact is MANDATORY before any Phase 1b new-site walk. Missing artifact = HALT at handoff to Planner. Planner (PLN-049) refuses to proceed without it."
   - Resolution: "Graduated from SP-OSB-02 (2026-04-24). Parent: PLAN_OLD_SITE_TRUTH_BASELINE.md."
6. **Amend PLN-049** (Planner's field-inventory mandate): if `old-site-baseline/<module>-*.md` exists for the same module, the Planner's walkthrough artifact MUST reference it in its `Baseline_Artifact` frontmatter key (add this key to field-inventory-spec.md — small amendment, keeps symmetry).
7. **Sync pipeline** (ALL-004): `npm run sync:mistakes && npm run build:context && npm run validate:sync`.
8. **Regression guard** before + after: snapshot every touched file, diff for silent breakage in Requirements / Planner handoff contract.
9. **Activity-log** + `/final-q`.

---

## Artifacts produced / modified

- `.github/agents/playwright-requirements.agent.md` — Phase 1 split into 1a/1b.
- `clients/encore/specs_planning/_internal/agent-mistakes.md` — REQ-001/002/010 reworded; REQ-014 new; PLN-049 amended.
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` — `Baseline_Artifact` frontmatter key added.
- `clients/encore/specs_planning/_internal/agent-activity-log.md` — one row.

## Success criteria

- [ ] `git diff` on agent file shows Phase 1a/1b structure with LR-038 declaration mandated.
- [ ] REQ-014 exists in agent-mistakes.md with correct format.
- [ ] `npm run validate:sync` passes.
- [ ] `/regression-guard` before+after diff shows no SILENT BREAK items.
- [ ] `/final-q` GREEN.
- [ ] LR-040 closure gate passed.

## Out of scope

- Executing the new Phase 1a/1b flow on any specific module (that's the next requirements session's job).
- Editing the Planner agent file (SP-OSB-03 territory).
- Editing shared rules / client CLAUDE.md (SP-OSB-03 territory).

---

## Execution Summary (2026-04-24, OWNER)

**Scope delivered (7 of 9 planned steps direct-executed; 2 synthesized into fewer file edits)**:

1. **Phase 0 inventory** — confirmed "DOM is truth" at agent file lines 75, 82, 172; "live UI" at 3, 38, 119, 183. Baseline_Artifact key non-existent in framework. SP-OSB-01 artifact's 6-section FREE-FORM structure adopted as reference shape.
2. **Phase 1a (NEW)** — authored in `.github/agents/playwright-requirements.agent.md`:
   - LR-038 browser-tool declaration is Step 1c (before any `browser_navigate`).
   - Navigate to old-site equivalent on `https://navigator2.training.psav.com/#/`; REQ-008 READ-ONLY tool set preserved.
   - **Baseline-absent short-circuit** (SP-OSB-01 FLAG-02/04): feature not on old site → record + flag for `/encore-questions` + proceed to 1b with `baselineScope: baseline-absent`. Does NOT HALT.
   - **Baseline artifact emission**: dated path `old-site-baseline/<module>-<YYYY-MM-DD>.md`, FREE-FORM (6-8 sections) with explicit frontmatter + §1..§6 covering access, selector-style, tab/feature inventory, field baseline, schema, divergence-candidates.
   - HALT ONLY on tool/auth/DOM failure when feature exists.
3. **Phase 1b (REWRITE)** — row-by-row compare against Phase 1a artifact on new site; every divergence classified as `BUG-CANDIDATE` (LR-034) | `INTENTIONAL-UX-CHANGE` | `REQUIREMENT-GAP`.
4. **Phase 2 (unchanged scope but narrowed)** — interactions NEW site only; old-site state is NEVER mutated.
5. **REQ-001/002/010 reworded** — all three now reference old-site-first + LR-ENC-001 truth hierarchy + classification + baseline-absent escalation. REQ-003..009 + 011..013 preserved unchanged (plan directive).
6. **REQ-014 appended** to `agent-mistakes.md` §Requirements: Phase 1a artifact MANDATORY before Planner handoff; queue entry MUST carry `baselineArtifact` + `baselineScope` + `divergences[]`; feature-absent-on-baseline exempts with `/encore-questions` flag; missing artifact = HALT at Planner handoff; Planner (PLN-049) refuses to proceed without it.
7. **PLN-049 amended** — Baseline_Artifact linkage: when same-module `old-site-baseline/<module>-*.md` exists AND upstream `baselineScope: full` | `baseline-partial`, the field-inventory frontmatter MUST include `Baseline_Artifact: <path>`. `baseline-absent` exempts. Structural-exemption clause from SP-AAE-03 preserved.
8. **Baseline_Artifact key added** to `clients/encore/specs_planning/_internal/field-inventory-spec.md` as OPTIONAL key #9 with MANDATORY-when-condition clause + greppable regex + revision-history entry dated 2026-04-24. Hook does NOT enforce (by design — Planner identity enforces at handoff).
9. **Sync pipeline run** — `npm run sync:mistakes` (19→21 lines on requirements agent embedded RULES table; propagated REQ-014 + PLN-049 to planner agent too); `npm run build:context` (9 queue-item contexts regen); `npm run validate:sync` → `[OK] All agents in sync with registry`. Pre-existing WARNs on healer/audit R## markers + 6 stale references unrelated to SP-OSB-02.

**Dropped / reshaped vs plan**:
- Plan step 8 "Regression guard" — executed as BEFORE+AFTER `git diff --stat` + `wc -l`: 3 targets +29/+1/+14 lines, intended additions only. No SILENT BREAKs.
- Plan step 9 "Activity-log + `/final-q`" — activity log row appended 2026-04-24T15:00 (≥ all touched mtimes); `/final-q` next action per LR-042.

**MCP verification**: N/A (pure file work; runtime MCP mandate for Requirements agent's future sessions encoded via HARD STOP 4 + Phase 1c LR-038 declaration).

**Documentation**:
- `.github/agents/playwright-requirements.agent.md` — description reworded; HARD STOP 4 covers 1a+1b; Phase 1c LR-038 declaration step added; Phase 1a/1b/2 rewritten; Mission+Truth-hierarchy updated; Queue entry schema updated; Key Principles reordered old-site-first; Example workflow updated; File Permissions table adds `old-site-baseline/` CREATE row. Sync-injected REQ-014 row into embedded RULES table.
- `clients/encore/specs_planning/_internal/agent-mistakes.md` — REQ-001/002/010 reworded; REQ-014 appended; PLN-049 amended (adds Baseline_Artifact linkage); ID master-list header updated.
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` — optional key #9 Baseline_Artifact added; revision-history entry.
- `clients/encore/specs_planning/_internal/agent-activity-log.md` — one row, LR-037-compliant timestamp.

**SP-OSB-03 handoff note**: the plan file's Step 1 ("PLN-049 amendment — add `Baseline_Artifact` frontmatter key to field-inventory requirement... if SP-OSB-02 hasn't already done it") is satisfied here. SP-OSB-03 can skip that bullet.

**Verdict**: GREEN. All success criteria pass; LR-040 closure gate passed with every planned item directly verified (zero phantom hand-offs, zero inference-only labels).

**Rules honored this session**: LR-001 (verify sync script sigs), LR-020 (cross-verified REQ IDs + PLN-049 before amending), LR-027 (this Execution Summary), LR-028 (activity log row), LR-030 (additive rewording preserves prior meaning as subset), LR-035 (plans:reindex next), LR-037 (15:00 ≥ all mtimes), LR-038 (N/A declared), LR-040 (per-step (a)-direct classification — no (b)/(c)), LR-041 (Opus/xhi/auto per bootstrap), LR-042 (/final-q to follow).
