# SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE — move already-resolved plans out of pending/ + repair the broken Status field

**Status**: PENDING
**Priority**: P1
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
- `plans/pending/PLAN_LOSSLESS_DEEP_TRIM.md` (§Re-Proof Protocol, §Ledger row 3)
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
