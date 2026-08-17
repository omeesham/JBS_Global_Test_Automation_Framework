# SUBPLAN — Walker Observation Mandate (+ the Corp-Pricing error-state bug that exposed the gap)

**Status**: PENDING (B1 landed 2026-06-26; B2 + Part 2 remain)
**Priority**: High
**Created**: 2026-06-26
**Identity**: OWNER (RCA, rule authoring, bug filing); GIVER for TC edits
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: chrome (Part 2 bug is visual; CLI is structurally blind to it)
**Provenance**: approved plan `~/.claude/plans/this-is-a-new-noble-shell.md` (interactive session 2026-06-26); user directive: all walkers must report any bug (high-prio) + suggestion/improvement (low-prio); assume nothing, verify everything.

---

## Context

User found a UI bug on **Corporate Pricing → Pricing Detail**: an out-of-range **New Price** (e.g. `5646464`) makes the cell's error state **render broken — "the field goes sideways."** The pipeline walked this surface (NM2260) and never filed it. The fix is two-track: (Track A) file the triggering bug; (Track B) close the standing-mandate gap so every walker reports bugs (high-prio) + suggestions (low-prio) on every walk.

## Part 1 — Verified gap analysis (DONE)

Skeleton existed (`ALL-042..044`, `LR-034`, per-walker BUG→LR-034 hooks, discussion-item triage) but 6 holes let a pure-visual defect slip: (1) LR-034 triggers excluded "agent eyeballs a visual defect"; (2) bug rules functional-only by example; (3) the ALL-044 escalation channel dormant + unenforced (no `agent-escalations.json` exists); (4) walk artifact + completeness gate are coverage-only — no defect/suggestion slot; (5) no suggestions/improvements channel; (6) GIVER captured error *text* not *render*, and `/find-bugs` is user-invoked only. Full citations in the approved plan.

## Part 2 — File the triggering bug (Track A — REMAINS; needs live browser)

1. **Verify (Chrome, human-in-loop; LR-034 Step 2 + LR-ENC-004)**: reproduce the broken render live, capture the real numeric cap + CSS cause + screenshot; reproduce on office 1604 too; Rovo/Jira + `reports/bugs/` dedup first.
2. **File** the bug report file (exists locally, untracked runtime artifact) (LR-034 schema; `severity: medium`, `baselineComparison: baseline-absent`, `affectedTests: [TC-CPR-DET-023]`).
3. **Pattern sweep** (every editable grid cell shares the inline-editor): Max Discount (>100), Override Price, etc. File each instance.
4. **Coverage fix** (GIVER, LR-ENC-002 parity): upgrade TC-CPR-DET-023 + Max Discount sibling to the **dual oracle** — keep `aria-invalid` AND add a `boundingBox()` geometry assertion (invalid cell ⊄ its column); `test.fixme('bug-blocked: BUG-CPR-DET-001')`. Sync MD + XLSX + test-plan.

## Part 3 — Walker Observation Mandate (Track B)

**Phase B1 — DONE 2026-06-26** (see Execution Progress).
**Phase B2 — enforcement (REMAINS; "heavier, follows"):**
- Extend the LR-062 closure gate (`scripts/walk-coverage/lib/coverage-manifest.mjs` `coverageVerdict` + `scripts/validate-plan-closure.mjs`) so a walk-driven plan can't flip `DONE` unless the cited walk-evidence artifact has the `## Observations` section present (or explicit `none`).
- WATCHDOG HARD STOP #12 (landed) is the detective half; B2 adds the preventive machine gate.

---

## Execution Progress — 2026-06-26 (B1 landed, OWNER)

Framework files edited this session (the mandate + recording slot + point-of-action enforcement):

1. `docs/read_only_docs/AGENT_SHARED_RULES.md` — **ALL-045** added to the Universal Bug Detection block (header `ALL-042..045`): visual/UX/layout/rendering defects are bugs too; **2-tier priority** (bug = HIGH → LR-034; suggestion = LOW → record); every walk records `## Observations`; folds in the discussion-item rule.
2. `docs/read_only_docs/LEARNED_RULES.md` — **LR-034 trigger list** extended: "a walker visually notices a UI/UX/layout/rendering defect (per ALL-045)" is now a filing trigger; render-state must be SEEN, not inferred from `aria-invalid` (WCAG ARIA21).
3. `.claude/rules/inventory.md` — **LR-064**: defined the mandatory `## Observations` section (Bugs/Defects + Suggestions/Improvements buckets, explicit `none`) on the walk-evidence artifact; added an `anomaly:` slot to the TDW worker raw-evidence format.
4. `.claude/agents/REQUIREMENTS.md` — **HARD STOP #13** (Observation reporting).
5. `.claude/agents/PLANNER.md` — **HARD STOP #23** (Observation reporting + error-RENDER capture, not just text).
6. `.claude/agents/AUDIT.md` — **HARD STOP #12** (Observation-trail audit; rubber-stamp-`none` check sibling to #3).

**Scope note**: GENERATOR/HEALER (secondary walkers) inherit the mandate via the shared ALL-045 rule — they don't author the walk-evidence artifact, so no per-prompt HARD STOP was added (deliberate minimalism). The new standalone LR was **slop-dropped** (`/audit slop` #8) — ALL-045 is the home.

**Remaining**: Part 2 (bug file — needs live browser) · Part 2.4 coverage fix · Phase B2 (closure-gate code) · quality gates (post-execution audit MUST be a fresh session per AUD-017; `/reflect`; activity-log).

## Verification artifact (re-runnable)
- `grep -n "ALL-045" docs/read_only_docs/AGENT_SHARED_RULES.md` → hits the new rule.
- `grep -rn "## Observations" .claude/rules/inventory.md` → hits the section definition.
- `grep -c "HARD STOP #13\|HARD STOP #23\|HARD STOP #12" .claude/agents/{REQUIREMENTS,PLANNER,AUDIT}.md` → one each.
- (After Part 2) confirm the local CPR detail bug report exists; `npm run check:tc-parity` exit 0.
