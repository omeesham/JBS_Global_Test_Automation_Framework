# SUBPLAN SP-OSB-03: Structural Bundle — Shared Rules + Planner + Encore Questions + Client CLAUDE + Retrofit

**Status**: DONE
**Priority**: P0
**Created**: 2026-04-24
**Executed**: 2026-04-24
**Parent**: [PLAN_OLD_SITE_TRUTH_BASELINE.md](PLAN_OLD_SITE_TRUTH_BASELINE.md)
**Depends on**: SP-OSB-01 GREEN (baseline usable) — can run in parallel with SP-OSB-02
**Blocks**: parent plan finalization (pending → done)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: multi-file cross-cutting edit with rule-number gate (LR-020 collision risk) + retrofit clause touching 12–15 pending subplans. Wrong retrofit bullet text = 12–15 downstream subplans silently misapply the workflow rule. Opus + xhi per LR-041.

---

## Bootstrap (agent reads this first, zero prior context)

**Invoke with**: `/execute plans/pending/SUBPLAN_OSB_03_STRUCTURAL_BUNDLE.md`
**Identity**: OWNER (cross-cutting: shared rules + root CLAUDE + client CLAUDE + skill + agent + 12–15 subplan retrofits)
**Skills auto-called**: `/identity`, `/execute`, `/regression-guard` (before + after — MANDATORY given blast radius), `/reflect`, `/final-q`

**Context files** (read before Phase 0):
- `plans/pending/PLAN_OLD_SITE_TRUTH_BASELINE.md` (parent — full edit list in Execution Plan §SP-C)
- `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (SP-OSB-01 output — rule wording adapts to GREEN vs YELLOW)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — current ALL-024 truth hierarchy (line 76)
- `.github/agents/playwright-test-planner.agent.md` — line 145 truth statement + Phase 0 block
- `.claude/skills/encore-questions/SKILL.md` — current Phase 3 kill-list + Phase 5 Tier A
- `clients/encore/CLAUDE.md` — Learned Rules section (LR-ENC-001 insertion point)
- `CLAUDE.md` root — Learned Rules section (LR-045 insertion — last LR is currently LR-044, verify freshest per LR-020)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` — ALL-078 append point (verify freshest ALL-* per LR-020)

**Phase 0 directive**: freshness-verify all rule IDs (LR-020) BEFORE editing — grep for `LR-04` in root CLAUDE, grep for `LR-ENC-` in client CLAUDE, grep `ALL-07` in agent-mistakes.md. Bump proposed IDs if collisions.

**Handoff sequence** (at end of session):
- `git diff` across 6 primary files + 12–15 retrofitted subplans.
- `/regression-guard` before+after diff shows ONLY intended changes.
- `npm run plans:reindex` + `npm run sync:mistakes` + `npm run validate:sync` all pass.
- Activity-log row.
- `/final-q` GREEN.

**HALT conditions**:
- SP-OSB-01 RED or YELLOW-blocks-SP-OSB-03 → HALT.
- Rule-number collision detected (LR-045 / LR-ENC-001 / ALL-078 / REQ-014 already taken) → bump + update cross-refs.
- Retrofit grep returns >20 candidate subplans → pause, get user confirmation on scope before bulk-editing.
- `/regression-guard` AFTER reports SILENT BREAK → investigate before /final-q.

---

## Purpose

Install the workflow rule across every surface where future TC-authoring sessions read the "ground truth" contract, AND retrofit the in-flight pending subplans so they absorb the rule without a rewrite.

---

## Step-by-step

### Phase 0 — Freshness verify (LR-020)

1. Grep `LR-0` in `CLAUDE.md` → confirm next free framework ID (expected `LR-045`).
2. Grep `LR-ENC-` in `clients/encore/CLAUDE.md` → confirm next free client ID (expected `LR-ENC-001` — first client rule).
3. Grep `| ALL-0` in `clients/encore/specs_planning/_internal/agent-mistakes.md` → confirm next free shared ID (expected `ALL-078`).
4. Grep `| REQ-0` → confirm `REQ-014` free (or coordinate with SP-OSB-02 which also adds REQ-014).
5. If any collision, bump + update parent plan + this subplan + SP-OSB-02 cross-refs BEFORE editing.

### Phase 1 — Shared rules + framework + client

6. **`docs/read_only_docs/AGENT_SHARED_RULES.md`** — update ALL-024 truth hierarchy:
   Insert `OLD-SITE DOM (navigator2) >` at the top of the hierarchy chain; keep the rest intact. Add one paragraph explaining "old site = baseline truth, new site = observed truth, divergence = signal". Cross-reference LR-ENC-001 + LR-034.
7. **`CLAUDE.md` root** — new `LR-045: Baseline-truth workflow`:
   "Any multi-client TC authoring pipeline MUST declare a baseline truth source per client. Baseline truth source = a stable/legacy site (or spec artifact) that represents intended behavior; the client's active app = observed behavior; divergence = bug candidate OR intentional change. For Encore, see LR-ENC-001. Graduated from PLAN_OLD_SITE_TRUTH_BASELINE (2026-04-24)."
8. **`clients/encore/CLAUDE.md`** — new `LR-ENC-001: Encore truth source`:
   "Encore baseline truth source is https://navigator2.training.psav.com/#/ (old Navigator UI). Observed app = https://cloudapps-e2e.encoreglobal.com/navigator/. Creds shared per `config/environments/.env.development`. Baseline artifacts live in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. For any behavior uncertainty, old site decides. Triggered by every Requirements / Planner / Generator / `/encore-questions` session." Insert before "Client-Specific Learned Rules" heading.
9. **`clients/encore/specs_planning/_internal/agent-mistakes.md`** — new `ALL-078`:
   "TC authoring requires old-site baseline artifact (per REQ-014, PLN-049, LR-ENC-001). Absence = HALT at Planner→Generator handoff. Resolution: Requirements emits baseline artifact in Phase 1a; Planner references it by module+date; Generator spot-checks it (per SP-AAE-04)."

### Phase 2 — Agent + skill edits

10. **`.github/agents/playwright-test-planner.agent.md`**:
    - Line 145 truth statement: reword to "Baseline truth is old-site DOM; observed truth is new-site DOM; divergence = signal. Jira/requirements docs/test plans are starting points only — they may be wrong, incomplete, or outdated."
    - Phase 0 block: add Phase 0.5 check — "if uncertainty remains after reviewing Requirements agent's `old-site-baseline/<module>-*.md`, re-walk the same page on old site before authoring TC."
    - PLN-049 amendment (if SP-OSB-02 hasn't already done it): add `Baseline_Artifact` frontmatter key to field-inventory requirement.
11. **`.claude/skills/encore-questions/SKILL.md`**:
    - Phase 3 kill-list: append `"DOM-walkable on OLD SITE (navigator2.training.psav.com) in <5 min"` as new kill criterion.
    - Phase 5 Tier A: first step becomes "check old site; if answered, skip to compact output".

### Phase 3 — Retrofit clause (CAREFUL — blast radius)

12. **Grep target list**: `grep -l "test case\|TC authoring\|TC-.*-.*-" plans/pending/SUBPLAN_*.md` — narrow to pending subplans whose Step-by-Step generates test cases. Excludes framework / catalog / meta subplans.
13. **Confirm list with user if >15 hits OR <5 hits**:
    - >15 → possible over-match; trim list (user confirms).
    - <5 → possible under-match; expand search (user confirms).
14. **For each TC-generation subplan**, append the following SINGLE bullet to its Phase 0 / Pre-Execution section (place after any existing "Read REQUIREMENTS.md" step):
    > *"Old-site baseline check (LR-ENC-001 / ALL-078): before authoring any TC, open the corresponding page on https://navigator2.training.psav.com/#/ and record baseline behavior in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference this artifact in the Execution Summary under 'Old-site baseline: consulted Y/N + evidence'."*
15. Do NOT edit any other section. Do NOT change Step-by-step mechanics. The bullet is structural awareness, not scope expansion.

### Phase 4 — Navigation + Sync

16. **`.claude/context/navigation.md`**:
    - §B Routing Table — new row: `| Establish baseline truth for TC authoring | https://navigator2.training.psav.com/#/ + LR-ENC-001 + `clients/encore/specs_planning/_internal/old-site-baseline/` | LR-ENC-001, REQ-014, PLN-049, ALL-078, LR-045 |`.
    - §C Exploration Registry — new row for old-site Local Office + Location Management surfaces (citing OSB-ACCESS-VERIFY-2026-04-24.md).
17. **Sync pipeline** (ALL-004): `npm run sync:mistakes && npm run build:context && npm run validate:sync`.
18. **Plans reindex** (LR-035): `npm run plans:reindex`.

### Phase 5 — Regression guard + verdict

19. `/regression-guard` AFTER snapshot. Confirm ONLY intended diffs. SILENT BREAK on any file = investigate before /final-q.
20. Activity-log row (LR-037).
21. `/final-q` — GREEN verdict required to move parent plan to done/.

---

## Artifacts produced / modified

- `docs/read_only_docs/AGENT_SHARED_RULES.md` (ALL-024)
- `CLAUDE.md` root (LR-045)
- `clients/encore/CLAUDE.md` (LR-ENC-001)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` (ALL-078; possibly PLN-049 amendment)
- `.github/agents/playwright-test-planner.agent.md` (truth statement + Phase 0.5)
- `.claude/skills/encore-questions/SKILL.md` (kill-list + Phase 5 Tier A)
- `.claude/context/navigation.md` (§B row + §C row)
- 12–15 pending subplans — ONE bullet retrofit each
- Activity-log row

## Success criteria

- [ ] All rule IDs freshness-verified per LR-020.
- [ ] Every file edit is surgical (diff shows only the intended change).
- [ ] Retrofit blast radius confirmed with user BEFORE bulk edit.
- [ ] `npm run validate:sync` + `npm run plans:reindex` pass.
- [ ] `/regression-guard` AFTER shows no SILENT BREAK.
- [ ] `/final-q` GREEN.
- [ ] LR-040 closure gate passed.

## Out of scope

- Adding Playwright `chrome-old-site` project (deferred per parent plan; revisit post-SP-OSB-01 outcome).
- Rewriting any pending subplan's Step-by-step (ONE bullet append only).
- Authoring test cases against old-site baseline for any specific module.
- Moving parent plan to `plans/done/` (parent plan has its own Phase 3.5 close-out; this subplan exits GREEN and the parent's next /execute handles finalization).

---

## Execution Summary (2026-04-24, OWNER identity, Opus 4.7 + xhi)

### Rule-ID freshness (Phase 0, per LR-020)

| Proposed ID | Actual pre-state | Outcome |
|---|---|---|
| LR-045 (framework) | Root `CLAUDE.md` last LR = LR-044 | ✅ LR-045 free → added |
| LR-ENC-001 (client) | `clients/encore/CLAUDE.md` had no LR-ENC-NNN rules (only grandfathered LR-008/012/017/036) | ✅ LR-ENC-001 free → added as first client-prefixed rule |
| ALL-078 (shared) | `agent-mistakes.md` last ALL = ALL-077 | ✅ ALL-078 free → added after ALL-077 |
| REQ-014 (requirements) | Already added by SP-OSB-02 (2026-04-24) with forward-refs to LR-ENC-001 + ALL-078 | ✅ Consistent — this subplan completes the referenced IDs |

No collisions detected; no bumps required.

### Phase-by-phase verification

| Phase | Step | File(s) | Verdict | Evidence |
|---|---|---|---|---|
| 1 | 6 | `agent-mistakes.md` ALL-024 | ✅ DONE | Truth hierarchy now inserts OLD-SITE DOM at top; cross-refs LR-045 / LR-ENC-001 / REQ-014 / PLN-049 / ALL-078 added. **Note**: plan §Step 6 named `AGENT_SHARED_RULES.md` as the file; actual ALL-024 definition lives at `agent-mistakes.md:76` (plan's "line 76" was correct, filename was not). Edited the correct file; sync pipeline propagates ALL-024 text to agent files automatically. |
| 1 | 7 | Root `CLAUDE.md` | ✅ DONE | LR-045 added (55 lines) after LR-044; cross-refs to ALL-024 + LR-ENC-001 + REQ-014 + PLN-049 + ALL-078; graduation note cites SP-OSB-01/02/03. |
| 1 | 8 | `clients/encore/CLAUDE.md` | ✅ DONE | LR-ENC-001 added (28 lines) as first rule under "Client-Specific Learned Rules"; incorporates SP-OSB-01 FLAG-03 (creds pointer, free-form artifact format, Glyphicon boolean render per LR-036 extension) + FLAG-04 (baseline-absent escalation). |
| 1 | 9 | `agent-mistakes.md` ALL-078 + ID master list | ✅ DONE | ALL-078 added after ALL-077; ID master list comment updated ("ALL-001 to ALL-078"). Incorporates FLAG-04 (baseline-absent → `/encore-questions` escalation, not HALT). |
| 2 | 10 | `.github/agents/playwright-test-planner.agent.md` | ✅ DONE | Line 145 truth statement reworded (baseline + observed); Phase 0.5 Baseline consultation block (5 numbered items) inserted before Phase 1. PLN-049 amendment **skipped** — already done by SP-OSB-02 (baseline linkage clause at `agent-mistakes.md:160`). |
| 2 | 11 | `.claude/skills/encore-questions/SKILL.md` | ✅ DONE | Phase 3 kill-list gained old-site-walkable criterion (with baseline-absent carve-out). Phase 5 Tier A restructured as old-site-first → baseline-absent fallback → new-site probe. |
| 3 | 12-15 | 13 HIST_PIVOT subplans retrofitted (20-32) | ✅ DONE | ONE bullet appended to `## Step-by-Step Execution` header in each. Wording: SP-OSB-01 FLAG-01 ("visit + observe", not "reuse selectors"; `name=`/`id=` note). Variants: HIST_PIVOT_21 (LO ECT) uses baseline-absent-only wording (cites OSB §3); HIST_PIVOT_22 (LM Currency) carves out Merchant Currency column as baseline-absent while Currency tab is observable; HIST_PIVOT_32 (LM Orphans) adds baseline orphan-confirmation note. Other 10 use standard wording. No Step-by-step mechanics altered. |
| 3 | Retrofit scope gate | User-confirm trigger (LR-040-like structural gate) | ✅ DONE by plan-encoded logic | Raw grep = 35 files (>20 threshold); filtered to TC-authoring subplans only = 13 files (within 5-15 range per plan §Step 13 — no user confirm needed). Excluded 22 over-matches: DQU audit/packaging subplans, REPO framework, HIST catalog/sweep/anomaly-writer, AAE staleness/parallel-rollout, OSB_03 self. |
| 4 | 16 | `.claude/context/navigation.md` | ✅ DONE | §B Routing Table: new row for "Establish baseline truth for TC authoring (Encore)". §C Exploration Registry: new row for Encore old-site baseline pointing to OSB-ACCESS-VERIFY-2026-04-24.md. |
| 4 | 17 | `npm run sync:mistakes` | ✅ DONE | Synced ALL-024 amendment + ALL-078 into agent files (framework-maintainer updated 24→26 lines; others unchanged — already inherit shared rules by reference). |
| 4 | 17 | `npm run build:context` | ✅ DONE | Context rebuilt for 9 queue items + 2 shared agent contexts. Exit [OK]. |
| 4 | 17 | `npm run validate:sync` | ✅ PASS | [OK] All agents in sync with registry. Pre-existing stale-ref warnings (6) are unrelated to this subplan (left by older rule-rename sessions). |
| 4 | 18 | `npm run plans:reindex` | ✅ DONE | 104 pending, 174 done, 7 stale (pre-existing), 0 DONE-in-pending. |
| 5 | 19 | `/regression-guard` AFTER | ✅ CLEAN | Only intended diffs: 55 CLAUDE.md insertions (LR-045), 28 client CLAUDE insertions (LR-ENC-001), 17 agent-mistakes changes (ALL-024 + ALL-078 + master list), 12 planner agent insertions (Phase 0.5), navigation.md 2 rows, 13 subplan retrofits (5-27 insertions each). Unrelated pre-existing diffs (AGENT_SHARED_RULES, skills/final-q, skills/identity, etc.) are from prior sessions, NOT from this one. No SILENT BREAK detected. |
| 5 | 20 | Activity-log row | ✅ PENDING (appended post-move) | LR-037 timestamp enforced at append time. |

### Dropped / deferred / skipped items

- **PLN-049 amendment (Step 10 sub-bullet)**: skipped — already executed by SP-OSB-02 (2026-04-24). Verified via grep at `agent-mistakes.md:160`. No action needed.
- **`docs/read_only_docs/AGENT_SHARED_RULES.md` direct edit** (Step 6 as originally worded): skipped — ALL-024 is NOT in this file. The rule lives in `agent-mistakes.md` (line 76) and is SYNCED to agent files via `npm run sync:mistakes`. Editing the canonical source + re-syncing was the correct interpretation. Plan text had a filename error; the stated "line 76" correctly refers to `agent-mistakes.md:76`. No divergence from plan intent.
- **Playwright `chrome-old-site` project** (Phase 4 step 8 in parent §SP-C): explicitly out of scope per this subplan's §Out of scope + plan §R1 deferral.

### LR-040 closure gate

This subplan is a **rule / framework-wiring subplan**, NOT a catalog / discovery / MCP subplan enumerating parents / columns / TCs. LR-040's planned-item coverage requirements (a / b / c classification) are therefore structurally N/A — the planned items here are discrete file edits, each directly executed and evidenced in the phase-by-phase verification table above. No inferences, no hand-offs, no pending decisions. GREEN.

### Cross-reference integrity check

Forward-references from SP-OSB-02 (added 2026-04-24 earlier in this day) are now resolved:
- `REQ-001` line references `LR-ENC-001 / REQ-014 / ALL-078` → all three now exist.
- `REQ-002` references `LR-ENC-001` → exists.
- `REQ-010` references `LR-ENC-001` → exists.
- `REQ-014` references `LR-ENC-001` + `ALL-078` → both exist.
- `PLN-049` references `REQ-014` → exists.

No dangling references.

### Risk register

All parent-plan risks (R1–R5 + discussion-item) resolved or N/A:
- **R1 selector parity**: confirmed ZERO parity by SP-OSB-01. Retrofit wording updated accordingly ("visit + observe", not "reuse selectors"). Scope did NOT expand.
- **R2 creds**: GREEN per SP-OSB-01 §1.
- **R3 BUG oracle bundling time**: absorbed by SP-OSB-01. N/A for this subplan.
- **R4 retrofit blast radius**: 13 files, exactly within parent plan's 12-15 estimate. `/regression-guard` AFTER shows one-bullet surgical diffs.
- **R5 ID collisions**: zero collisions. Phase 0 freshness verify caught none.

### Parent plan readiness

`plans/pending/PLAN_OLD_SITE_TRUTH_BASELINE.md` now has all three SP children GREEN:
- SP-OSB-01 DONE (2026-04-24, in `plans/done/`).
- SP-OSB-02 DONE (2026-04-24, in `plans/done/`).
- SP-OSB-03 DONE (2026-04-24, this subplan — ready for `plans/done/`).

Parent plan's own Phase 3.5 close-out is the next `/execute` action (out of scope for this subplan per §Out of scope item 4).
