# SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE — move already-resolved plans out of pending/ + repair the broken Status field

**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0
**Created**: 2026-06-12
**Identity**: OWNER
**Parent**: PLAN_LOSSLESS_DEEP_TRIM.md
**Depends on**: SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md
**Blocks**: SUBPLAN_TRIM_06_CLOSURE.md
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

`plans/pending/` carries plans whose own frontmatter already says they are resolved (SUPERSEDED / SUBSUMED / RESOLVED-BY — e.g. SUBPLAN_DQU_18 SUBSUMED, SUBPLAN_DQU_33 SUPERSEDED) plus TRIM_02's fresh SUPERSEDED flips — queue noise. One plan (PLAN_BUG_HUNTING_RULEBOOK_V2) has NO clean top-level Status field; a body line at ~:95 mimics one (`**Status**: \`BUG_HUNT_TO_DISPOSITION\` is typed as...`), confusing parsers. This session does moves + one Status repair + one reindex. NO plan deletion, ever. Ledger row 3 of the parent.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**: `/identity` · `/regression-guard` · `/relevant` · `/final-q`

**Context files**:
- `plans/done/PLAN_LOSSLESS_DEEP_TRIM.md` (§Re-Proof Protocol, §Ledger row 3)
- `.claude/rules/pipeline.md` (LR-027 — moves of resolved-not-DONE plans: the supersession/subsumption note in the file body is the closure record; verify it exists, never invent an Execution Summary)
- `.claude/rules/plan-closure.md` (LR-055 — no DONE flips happen here)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-035)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm SUBPLAN_TRIM_02 in `plans/done/`.
2. navigation.md + agent-mistakes.md (ALL-*) + LR scan. BrowserTool=none.

(Phase 0.5b not applicable.)

---

## Phase 1 — Work

1. **Regenerate the authoritative move list in-session** (never trust this file's examples): scan frontmatter-position Status of every `plans/pending/*.md` — collect values in {SUPERSEDED, SUBSUMED, RESOLVED-BY*}. Cross-check each candidate's body documents its resolution (pointer to the superseding/subsuming work). Missing documentation → DROP from move list + log (do not move undocumented files).
2. For each verified candidate: `git mv plans/pending/<f> plans/done/<f>`. Fix inward self-references per navigation.md row 58 pattern (grep body for its own pending/ path first).
3. **PLAN_BUG_HUNTING_RULEBOOK_V2.md repair**: insert a real frontmatter `**Status**: PENDING` block at top (match sibling format); reword the body line at ~:95 so it no longer starts a line with `**Status**:` (e.g. "**Disposition typing**: ..."). No other content changes.
4. Single `npm run plans:reindex` pass; confirm pre-commit `:check` passes and the moved files left the Execution Queue.
5. Emit the **>14d-stale pending-plans list as a chat-only triage FLAG** (from INDEX §Warnings) — explicitly NO action; backlog triage is a user prioritization decision, out of trim scope.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW only for parent-ledger items; discoveries → next-batch ledger.

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Every moved file: frontmatter-position resolved Status + documented resolution in body (logged per file, LR-042 evidence format).
- [ ] Zero deletions; zero DONE flips; `git mv` only.
- [ ] RULEBOOK_V2 has exactly ONE line matching `^\*\*Status\*\*:` and it is in frontmatter position.
- [ ] `npm run plans:reindex` clean; INDEX totals shifted by exactly the move count.
- [ ] Stale-plans triage flag list emitted in chat (no file action).
- [ ] Activity-log row (LR-028); `/final-q` verdict (LR-042).

## Verification

```bash
grep -rl --include="*.md" -E "^\*\*Status\*\*: (SUPERSEDED|SUBSUMED|RESOLVED-BY)" plans/pending/ | wc -l   # expect: 0
grep -cE "^\*\*Status\*\*:" plans/pending/PLAN_BUG_HUNTING_RULEBOOK_V2.md                                  # expect: 1
npm run plans:reindex:check 2>/dev/null || node scripts/validate-plan-layout.mjs                            # expect: pass
```

## Handoff (post-execution)

Chat-only. Outcome: N plans relocated with per-file evidence, RULEBOOK_V2 parseable, INDEX regenerated, stale-backlog flag list delivered for user triage.

---

## Execution Summary

**Council regime: analysis by gpt-5.5 (`trim03-analysis-0716`, fresh disk re-proof per candidate), cross-provider disk-claim audit by claude-opus-4.6 (`trim03-review-0716`, GREEN — all 16 Status claims re-verified, superseding artifacts all exist, coverage exact 15+1, zero Untouchables hits). Moves + repair executed by dispatcher (OWNER ceremony).**

### Moves (15, `git mv` only — statuses stay resolved-not-DONE per this plan's LR-027 note; zero deletions, zero DONE flips)
PLAN_CODEBASE_CLEANUP, PLAN_GENERATOR_AUDIT_AUTO_ADDON, PLAN_MAINTAINER_SWEEP, PLAN_MASTER_REPO_CLEANUP, SUBPLAN_DQU_12_F1a_PRICING_AUDIT, SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT, SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL, SUBPLAN_REPO_03/04/05/06/07/10/11/12 — all now in `plans/done/`, each with frontmatter-position resolved Status (SUPERSEDED ×12, SUBSUMED ×2, RESOLVED-BY ×1) + in-body resolution pointer (re-verified per candidate by the cross-review's 16-row PASS table at `.claude/state/ua-worker/trim03-review-0716-artifacts/verdict.md`).

### Review FINDING-1 resolved BEFORE the C1 move
NB-8/NB-9 (SP-MNT-FCC-01 `scripts/sync-agent-mistakes.ts` patch/decommission; SP-MNT-FCC-02 `scripts/check-tc-parity.ts` `--module` flag) re-homed to `plans/pending/SUBPLAN_MNT_FCC_REHOME.md` — preserves the LR-040 §b linkage that superseding PLAN_MAINTAINER_SWEEP would have orphaned. FINDING-2 (thin C8–C15 evidence in the analysis) accepted — facts independently confirmed by the review.

### RULEBOOK_V2 repair
`plans/pending/PLAN_BUG_HUNTING_RULEBOOK_V2.md`: real `**Status**: PENDING` inserted in frontmatter position; body line ~:95 reworded `**Status**:` → `**Disposition typing**:`. `grep -cE "^\*\*Status\*\*:"` = 1.

### Verification (ran 2026-07-16)
- ran `grep -rl -E "^\*\*Status\*\*: (SUPERSEDED|SUBSUMED|RESOLVED-BY)" plans/pending/ | wc -l` → output: `0`
- ran `grep -cE "^\*\*Status\*\*:" plans/pending/PLAN_BUG_HUNTING_RULEBOOK_V2.md` → output: `1`
- ran `node scripts/validate-plan-layout.mjs --check` → output: `0 RED` (327 YELLOW pre-existing, none introduced by this run)
- ran `npm run plans:reindex` → output: `120 pending, 434 done, 102 stale, 0 DONE-in-pending` — exact shift: 134−15+1(new NB-8/9 recipient stub)=120 pending; 419+15=434 done.

### Stale triage flag (chat-only, no action — user prioritization)
Emitted in chat 2026-07-16: 102 pending plans >14d; oldest: PLAN_FULL_CHAIN_AUDIT (114d), PLAN_PLAYWRIGHT_CLI_ADOPTION (106d), PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE (104d, P5-PARKED), PLAN_PLANS_INDEX_AUTOREGEN (92d), SUBPLAN_REPO_08_RENAME_JBS (91d), PLAN_DELIVERABLE_QUALITY_UPGRADE (85d, P0-CYCLE-1).

### Deviations
- SUBPLAN_DQU_12 body line 133 contains its own `plans/pending/` path inside a quoted `mv` command of a never-fired conditional step — left untouched (historical instruction prose, not a live cross-reference; minimal-touch).
