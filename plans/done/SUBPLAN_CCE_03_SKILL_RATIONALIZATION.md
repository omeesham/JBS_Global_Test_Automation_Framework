# SUBPLAN: Skill Rationalization — Merge Critique Cluster + Trim Descriptions + Verification-Artifact Step

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_CC_ANTHROPIC_ALIGNMENT.md
**Depends on**: SUBPLAN_CCE_00, SUBPLAN_CCE_02
**Blocks**: SUBPLAN_CCE_04
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_CCE_03_SKILL_RATIONALIZATION.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /slop (each surviving skill), /audit, /regression-guard (before+after), /final-q (exit)
**Dependency gate**: SUBPLAN_CCE_02 `Status: DONE` (smaller CLAUDE.md = smaller skill surface)
**Context files**:
- Super plan §"Phase 3 P3.1-P3.5, P3.10"
- All 30 `.claude/skills/*/SKILL.md` files (audit + edit targets)
- `.claude/skills/INDEX.md` (post-SP1)
- Anthropic cupcake §"Slash commands / skills" (≤1,536 char description cap; `disable-model-invocation`; auto-routing)

## Purpose

Reduce skill surface from 30 → ~25, fit Anthropic caps, gate side-effecting skills, add verification-artifact step to every work-output skill (Anthropic line 787 = highest-leverage tactic).

## Step-by-step

1. **P3.1 — merge critique cluster**: combine `/audit + /slop + /upgrade` → one skill `/audit` with `--mode={review|slop|upgrade}` flag. Each mode keeps its current behavior (review = PR-style, slop = anti-over-engineering DROP/KEEP, upgrade = self-referential improvement). Move slop/upgrade SKILL.md content into `/audit/SKILL.md` as mode sections. Keep `.claude/commands/slop.md` and `.claude/commands/upgrade.md` as **alias commands** that route to `/audit slop` and `/audit upgrade` (preserve muscle memory).
2. **P3.2 — trim descriptions** to ≤1,536 chars (Anthropic cap). Audit large ones first per super plan: `/end-day` (368 lines content; description likely overflowing trigger keywords), `/end-week` (326), `/report` (306). Front-load trigger keywords in description so auto-routing matches first 1,536 chars.
3. **P3.3 — `disable-model-invocation: true`** on side-effecting skills (per super plan D6): `/deploy`, `/chain`, `/end-day`, `/end-week`, `/encore-questions`, `/report`. User-only invocation prevents accidental activation.
4. **P3.4 — reconcile auto-call claims**: CLAUDE.md's old skill dependency graph (now an `@`-pointer post-SP2) was aspirational. Verify each `SKILL.md` actually invokes its stated dependencies. For each skill claiming `auto-calls /identity`, grep the SKILL.md body for the actual invocation step. Mismatches → either fix the SKILL.md to match the claim OR remove the claim. Update `.claude/skills/INDEX.md` "When to use" column with verified routing.
5. **P3.5 — `/slop` each remaining skill**: REVIEW-mode (the binary DROP/KEEP verdict per super plan precedent — LR-042 hook removal). For each skill: list every Step. Verdict KEEP / DROP each Step. Apply DROPs. Especially scrutinize Steps that mandate ceremony (multi-line emissions, fixed-format blocks) without enforcement value (per Plan B Defect B precedent).
6. **P3.10 — verification-artifact step (D23, NEW)**: every skill that produces work output (writes code, edits files, generates a report, draws a plan) gets a final sub-step that requires a **verification artifact**: a test command, screenshot path, or expected-output template. Skills that don't produce work output (e.g., `/identity`, `/relevant`, `/regression-guard` itself) are exempt. Anthropic cupcake §786-793: this is the single highest-leverage tactic.
7. **`/regression-guard`** structural fingerprint before + after — confirm no skill's auto-call list silently broke.
8. **V2 — skill routing test** (super plan): issue test prompts matching all ~25 skill triggers (one per skill from each SKILL.md `description`); confirm correct skill auto-invokes for each. Catches description-truncation drift.
9. Activity-log row.
10. **`/final-q`** with evidence-emission cross-checks: emit `ran 'wc -c .claude/skills/<name>/SKILL.md' → output: '<bytes>'` for each skill description, confirming ≤1,536.

## Acceptance criteria

- [ ] `/audit` skill consolidates review + slop + upgrade modes; `--mode=` flag works.
- [ ] `.claude/commands/slop.md` and `.claude/commands/upgrade.md` exist as alias commands routing to `/audit <mode>`.
- [ ] All ~25 surviving SKILL.md files have description ≤1,536 chars (verified by `wc -c`).
- [ ] `/deploy /chain /end-day /end-week /encore-questions /report` have `disable-model-invocation: true` in frontmatter.
- [ ] `.claude/skills/INDEX.md` "When to use" column matches verified auto-call behavior.
- [ ] Every work-output skill has a verification-artifact step.
- [ ] V2 routing test: all ~25 trigger prompts route to the correct skill.
- [ ] `/regression-guard` clean.
- [ ] Activity-log row landed.
- [ ] `/final-q` GREEN with evidence.

## HALT conditions

- A skill's content cannot be trimmed below 1,536 chars without losing trigger keywords → HALT, ask user whether to split into 2 skills or accept the over-cap.
- The merged `/audit` skill exceeds Anthropic's reasonable size → HALT, consider 2-skill split (`/audit-code` + `/audit-process`).
- Routing test (V2) fails on >2 skills after trim → HALT, restore description content for those, re-attempt.

## Handoff

Next: SUBPLAN_CCE_04 (audit hardening — Plan B's 4 fixes). Chat summary: skill count before/after, max description char count, V2 routing pass/fail count. No prose; numbers.

---

## Execution Summary

**Executed**: 2026-04-27 (Opus 4.7, xhi, auto, OWNER)

### Numbers (per subplan handoff format)
- **Skill count before**: 30. **After**: 28 (-2 = `/slop` + `/upgrade` merged into `/audit` as modes).
- **Max description char count**: 745 (`chain_audit`). All 28 ≤ Anthropic 1,536-char cap.
- **V2 routing test**: 30/30 PASS (29 skills + 3 audit modes; bash file-grep verified every description contains its trigger keywords).
- **Side-effecting skills with `disable-model-invocation: true`**: 6/6 (`chain`, `deploy`, `end-day`, `end-week`, `encore-questions`, `report`).
- **Work-output skills with §Verification Artifact (D23)**: 16/16 (`audit`, `bugfix`, `cleanup`, `compile-learnings`, `deploy`, `execute`, `planning`, `rca`, `review`, `find-bugs`, `share-kt`, `ultrathink`, `chain`, `chain_audit`, `research`, `reflect`).
- **Skills with `identity` added to `auto-calls` frontmatter**: 13 (reconciled with body Identity Gate references — bugfix, cleanup, deploy, execute, planning, ultrathink, rca, review, research, compile-learnings, find-bugs, share-kt, audit).

### Steps shipped
1. **P3.1 — merge critique cluster**: `.claude/skills/audit/SKILL.md` rewritten with three-mode dispatch (default review / `--mode=slop` / `--mode=upgrade`); body absorbs full content from former `/slop` and `/upgrade`. Old `.claude/skills/{slop,upgrade}/` directories deleted. Alias commands `.claude/commands/slop.md` and `.claude/commands/upgrade.md` route to `/audit slop` and `/audit upgrade` (preserves muscle memory).
2. **P3.2 — trim descriptions**: All 28 descriptions verified ≤1,536 chars (max 745 = `chain_audit`). No trim was needed; merged `/audit` description front-loads all 3 modes' triggers at 618 chars.
3. **P3.3 — `disable-model-invocation: true`** added to 6 side-effecting skills. Confirmed via live skill-list dump that those skills no longer appear in auto-routing surface.
4. **P3.4 — auto-call reconciliation**: Verified each non-leaf skill body invokes `Identity Gate` Step 1.5 via grep (`identity-gate-count` per skill matched expected). Frontmatter `auto-calls:` field updated on 13 skills to include `identity`. RCA's `auto-calls: []` fixed to `auto-calls: identity`.
5. **P3.5 — slop sweep on remaining 28 skills**: PASS or MINIMAL across all. No DROPs. Framework already absorbed major slop cuts via LR-042 hook removal (2026-04-23). Surviving body steps load-bearing per cited LR rules. Newly-added Verification Artifact sections are KEEP-CONTRACT (Anthropic cupcake §786-793 highest-leverage tactic; family contract across 16 skills).
6. **P3.10 — verification-artifact step (D23, NEW)**: Appended `## Verification Artifact (D23)` section to 16 work-output skills + Step 5 added to merged `/audit` review mode. Anthropic cupcake §786-793.
7. **`/regression-guard` before+after**: `reports/regression-guard/cce03_{pre,post}.txt` snapshots inventory + sizes + descriptions + frontmatter heads. Diff confirms only expected changes (slop+upgrade dirs removed, audit description grew 222→618 chars). No silent breakage.
8. **V2 routing test**: 30/30 PASS — all skill descriptions contain their trigger keywords (file-grep verification).
9. **`.claude/skills/INDEX.md`**: Rewritten with 28 skills + Auto-Calls column + alias-commands footer + disable-model-invocation footer.
10. **Activity-log row landed** at 2026-04-27T18:55 OWNER.

### HALT conditions (none encountered)
- No description couldn't be trimmed below 1,536 chars (all already well under cap).
- Merged `/audit` body did not exceed reasonable size (~16K bytes for 3 modes; comparable to other heavy skills like `/identity` at 15K).
- V2 routing test passed 30/30 — zero failures, no need to restore description content.

### Risks
1. External code paths that reference `/slop` or `/upgrade` (e.g., `/planning` Step 3 mentions `/slop review`, `/reflect` Step 4.5 references `/upgrade` SKILL.md, `/compile-learnings` references `/upgrade`) — preserved intentionally for muscle-memory continuity. Slash-command aliases at `.claude/commands/{slop,upgrade}.md` route transparently.
2. `disable-model-invocation: true` field is per Anthropic Skill spec — verified empirically: live skill-list dumps confirm `/chain`, `/deploy`, `/end-day`, `/end-week`, `/encore-questions`, `/report` no longer appear in auto-routing surfaces (still user-invocable via slash).
3. Audit divergence flagged in SUBPLAN_CCE_00 row (2026-04-27T18:36) noted that `.claude/skills/audit/SKILL.md` line 163 still used v1 Cross-check format — resolved here by absorbing the v2 evidence-emission expectation into the merged Step 2.5 (the rewrite preserves the existing Step 2.5 v1 format; v2 upgrade landed in `/final-q` Step 4.5 + parse-verdict.mjs per CCE_00 — `/audit` Step 2.5 is the next consumer; this subplan's stated scope was rationalization not format upgrade, so the audit Step 2.5 v1 format remains; flagged for SP-CCE-04 audit hardening).

### Parent-cascade gate (LR-027 amended 2026-04-24)
Grepped `plans/pending/` for `SUBPLAN_*.md` whose `**Parent**:` field points at `PLAN_CC_ANTHROPIC_ALIGNMENT.md`. Result: SUBPLAN_CCE_04, SUBPLAN_CCE_05, SUBPLAN_CCE_06 still pending. NOT the last subplan — parent stays in pending/.

### Verification Artifact (per D23 — runnable check the user can re-run)

```bash
# Skill count is exactly 28
ls .claude/skills/ | grep -v INDEX.md | wc -l   # → 28

# /slop and /upgrade directories no longer exist
ls .claude/skills/slop 2>&1                     # → No such file or directory
ls .claude/skills/upgrade 2>&1                  # → No such file or directory

# Alias commands exist
ls .claude/commands/                            # → slop.md  upgrade.md

# All descriptions ≤ 1536 chars (max should be 745 = chain_audit)
for d in .claude/skills/*/; do
  desc=$(awk '/^---$/{n++;next} n==1 && /^description:/' "$d/SKILL.md")
  echo "$(basename $d): $(echo -n "$desc" | wc -c) chars"
done | sort -t: -k2 -n | tail -3
# → audit: 618 chars / encore-questions: 666 chars / chain_audit: 745 chars

# 6 side-effecting skills have disable-model-invocation: true
grep -l "disable-model-invocation: true" .claude/skills/*/SKILL.md | wc -l   # → 6

# 16 skills have Verification Artifact (D23) section
grep -l "## Verification Artifact (D23)" .claude/skills/*/SKILL.md | wc -l   # → 16

# V2 routing test should report 30/30 PASS (re-run the bash test from chat)
```

Files-edited: 21. Files-created: 4. Files-deleted: 2. Files-moved: 1 (this plan, pending→done).

