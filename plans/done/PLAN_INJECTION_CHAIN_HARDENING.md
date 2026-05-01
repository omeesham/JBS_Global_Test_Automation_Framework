# PLAN: Auto-Injection Chain Hardening — Future-Proof the Rule Reach

**Status**: DONE
**Executed**: 2026-04-29
**Priority**: P0-EMERGENCY (auto-injection infrastructure — foundation for all 9 pending DQU module audits + every future audit on every client; without LR-048 + Fix 1's bug-filing path-coverage, the SP-DQU-04 LI-style accidental baseline catch becomes coincidence rather than system. Land BEFORE SP-DQU-12..20 execute or the colleague catches us again.)
**Created**: 2026-04-29
**Identity**: OWNER
**Depends on**: none
**Blocks**: none (improvement plan; doesn't gate other work, but every other audit / bugfix / find-bugs subplan inherits its safety net)
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

After the 2026-04-29 DQU baseline-first surgical fix landed (LR-045 row 4 + D11/D12 + Phase 0.5b in 9 subplans + LR-034 `baselineComparison` field), a repo-wide audit of the auto-injection chain was performed. The chain — **path-scoped rules → /execute Phase 0 → /relevant grep → TodoWrite hook → subplan body** — is mostly robust, but has 3 structural gaps that could fail silently as new rules, skills, subplans, and clients are added:

1. **Bug-filing path-coverage hole** — `reports/bugs/**/*.json` is not in any path-scoped rule's `paths:` frontmatter. LR-034's now-mandatory `baselineComparison` field requires the agent to *remember* it; no auto-load fires when editing a bug file.
2. **No subplan structural minimum** — `pipeline.md` has authoring rules (LR-020 / LR-027 / LR-028 / LR-040 / LR-041 / LR-046 / TodoWrite Tagging Contract) but does not enumerate the *structural* minimum (Bootstrap section / Phase 0 / Phase 0.5b conditional / Acceptance / Handoff). New subplans authored without consulting an existing example may miss required sections — including baseline-first when applicable.
3. **No subplan template file** — `plans/CONVENTIONS.md` defines naming + frontmatter but there is no `plans/pending/_TEMPLATE_SUBPLAN.md` or equivalent skeleton to copy from. Agents author subplans by mimicking the most recent neighbor — drift propagates.

This plan applies surgical fixes that close all three gaps without adding hooks, skills, agents, or new rule files. Total expected diff: ~3 files, ~50 lines.

---

## Repo-wide injection chain (current state, 2026-04-29)

| Layer | Mechanism | Coverage | Gap? |
|---|---|---|---|
| Path-scoped rules (`.claude/rules/*.md`) | `paths:` frontmatter auto-loads on matching file edit | 8 rules cover plans, specs, page objects, selectors, scripts, hooks, identity, baseline, inventory, browser-tool, REQUIREMENTS.md, source code, website | ⚠️ `reports/bugs/**/*.json` uncovered |
| /execute Phase 0 Step 4 (LR scan) | Skill text mandates scanning `.claude/rules/<topic>.md` + `LEARNED_RULES.md` + client CLAUDE.md | All LRs reachable for /execute sessions | ✅ |
| /execute Phase 0 Step 5 (master plan read) | Skill text mandates reading parent plan if referenced | D11/D12 + parent context land for any subplan with `**Parent**:` field | ✅ |
| /relevant Step 2.6 (LR-rule path-glob) | greps `.claude/rules/*.md` for paths matching subtask files; tags TodoWrite | LR-NNN tags injected with reason | ✅ |
| /relevant Step 2.6 cross-cutting scan | also greps `LEARNED_RULES.md` triggers | LR-034 baselineComparison trigger reachable | ✅ |
| Subplan body (Bootstrap + Phases) | Read on `/execute <subplan>` | Phase 0.5b in audit subplans (post-fix) | ⚠️ no structural minimum forces new subplans to include it |
| TodoWrite hook (SP02B) | PreToolUse Edit/Write/MultiEdit denies untagged todos during /execute | Tag enforcement during /execute only | (intentional — hook scope is /execute by design) |
| CLAUDE.md @-references | Loaded on demand when relevant | `LEARNED_RULES.md` (cross-cutting) + per-client CLAUDE.md | ✅ |

Rules audited (8 total): `angular.md`, `baseline.md`, `browser-tool.md`, `data.md`, `hooks-identity.md`, `inventory.md`, `pipeline.md`, `specs.md`. Inventory of `paths:` frontmatter confirmed.

---

## Locked decisions (do not re-litigate)

| ID | Decision | Rationale |
|---|---|---|
| D1 | Add `reports/bugs/**/*.json` to `baseline.md` paths frontmatter (NOT a new rule file). | LR-045 row 4 already mentions `baselineComparison`; baseline.md is the natural home. New file = slop. |
| D2 | Add a "Subplan Structural Minimum" section to `pipeline.md` (NOT a new rule file). | pipeline.md is the path-scoped rule that auto-loads on `plans/**/*.md` edits. Anything else = slop. |
| D3 | Add `plans/pending/_TEMPLATE_SUBPLAN.md` (TEMPLATE-DRAFT status) as a copy-paste skeleton. | CONVENTIONS.md:9 explicitly authorizes `Status: TEMPLATE-DRAFT` in `pending/`; lifecycle rule 4 names exactly this case. Reindex script picks it up automatically (Acceptance #4 satisfied without rewording). |
| D4 | NO new hook. NO new skill. NO new agent. NO validator script in this plan. | Layered enforcement (path-scoped rule + skill text + template + TodoWrite hook for /execute) is sufficient. Adding a structural validator is a separate plan if pattern breaks. |
| D5 | NO change to /find-bugs / /audit / /bugfix / /rca / /cleanup auto-call lists. | Adding `/relevant` to their auto-calls is a bigger scope change affecting non-DQU work. Out of scope. Document as future consideration. |
| D6 | Plan-mode work flows through OWNER identity. | Per AGENT_SHARED_RULES §2.1, the touched paths (`.claude/rules/*.md` + `plans/**`) are OWNER-RW (framework-infrastructure scope). GARDENER's RW per §2 is `src/pages/`, `src/common/base-page.ts`, `tests/` only — pipeline code, not framework rules / plans. Original D6 said "GARDENER" — corrected during Phase 2.5 Adjacent-Sweep on first execution (ALL-077 path (a)). |

---

## Fixes (3 surgical edits)

### Fix 1 — Bug-filing auto-load (1 line)

**File**: `.claude/rules/baseline.md`
**Edit**: add `"reports/bugs/**/*.json"` to the `paths:` frontmatter list.
**Effect**: any agent editing or creating a `BUG-*.json` triggers baseline.md auto-load. Row 4 of LR-045 (which is already in baseline.md) reminds the agent that `baselineComparison` is mandatory per LR-034. Closes the bug-filing injection gap for ANY agent in ANY skill (including standalone `/find-bugs`, `/bugfix`, manual file creation).

**Verification**: edit any test BUG-*.json file → confirm baseline.md loads in agent context (visible in injected rule list at session start or at edit-time).

### Fix 2 — Subplan Structural Minimum (~25 lines added to pipeline.md)

**File**: `.claude/rules/pipeline.md`
**Edit**: add new section `## Subplan Structural Minimum (LR-048)` after the existing TodoWrite Tagging Contract section. Body:

```markdown
## LR-048: Subplan Structural Minimum

Every NEW subplan in `plans/pending/` MUST include these sections in this order:

1. **Title** + **Frontmatter** — Status / Priority / Created / Identity / Parent (subplans only) / Depends on / Model / Thinking / PermissionMode / BrowserTool (per `.claude/rules/browser-tool.md` if any browser work).
2. **Context** — why this subplan exists; provenance line if revived/superseded.
3. **Bootstrap** — Identity, Skills auto-called, Context files (every rule the subplan depends on must be in this list, including parent plan path).
4. **Phase 0** — Dependency + browser-tool gate. Mandatory.
5. **Phase 0.5b — Baseline-first walk** — CONDITIONAL: REQUIRED when ANY of:
   - Identity = WATCHDOG
   - Skills includes `/find-bugs`
   - Title contains "audit" / "neutral-eye" / "find-bugs" / "module audit"
   - Subplan output drives TC corrections
   Phase 0.5b emits or consumes `clients/${ACTIVE_CLIENT}/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md` per LR-045 row 4. `baselineScope: baseline-absent` is allowed (NOT a HALT) when the feature is net-new on the active site.
6. **Phase 1+** — actual work, identity-scoped.
7. **Acceptance criteria** — checkboxes; for catalog/MCP-driven subplans (LR-040 trigger: SP-B-*, SP-C-*, SP-D-*, or any subplan whose Step-by-Step enumerates parents/columns/TCs), classify every enumerated item as (a)/(b)/(c) per LR-040. Non-catalog subplans use ordinary checkbox acceptance criteria.
8. **Handoff** — chat-only per `feedback_handoff_in_chat_only.md`; describes outcomes per LR-039 (no obstacle claims).

**Skeleton reference**: `plans/pending/_TEMPLATE_SUBPLAN.md` is the canonical copy-paste source (Status: TEMPLATE-DRAFT). New subplans copy from there, then customize.

**Trigger**: every new subplan authored under `plans/pending/SUBPLAN_*.md` or `plans/pending/PLAN_*.md`. Enforced by:
- This rule's path-scope (auto-loads on plan-file edits via `paths: plans/**/*.md`).
- `/planning` Step 3 validation (cross-checks new plan against this section).
- GARDENER sweeps periodically per `PLAN_PLANS_GARDENER_SWEEP.md`.

**Graduated from**: 2026-04-29 — repo-wide auto-injection audit found 9 SP-DQU-12..20 subplans inconsistent in their Phase 0.5b structure (some had it, some didn't, until amended in the same audit). LR-048 prevents recurrence by codifying the minimum.
```

**Effect**: any agent authoring a new subplan auto-loads pipeline.md (via existing `plans/**/*.md` path-scope) and sees LR-048 as a gate.

### Fix 3 — Subplan Template File (~80 lines new file)

**File**: `plans/pending/_TEMPLATE_SUBPLAN.md` (new)
**Status**: TEMPLATE-DRAFT (per CONVENTIONS.md lifecycle rule 4 — keep in pending/ with TEMPLATE-DRAFT status)
**Body**: a runnable skeleton covering all 8 sections from LR-048, with `<placeholder>` markers and inline comments showing where to fill in. Includes the Phase 0.5b conditional block ready to be uncommented when applicable.

The template lives at `plans/pending/_TEMPLATE_SUBPLAN.md` (CONVENTIONS.md:9 + lifecycle rule 4 — `TEMPLATE-DRAFT` is an authorized status in `pending/`; path-scoped under pipeline.md `plans/**/*.md`; auto-indexed by `scripts/plans-reindex.mjs`). Agents copy → rename (drop the leading `_`) → flip `Status` to `PENDING` → fill placeholders.

---

## Out of scope (intentional — slop-rejected)

- **New hook for subplan structure validation** — adds friction without clear ROI. If LR-048 is bypassed in practice, a validator script can be added later as a separate plan.
- **Auto-calling `/relevant` from `/find-bugs` / `/audit` / `/bugfix` / `/rca` / `/cleanup`** — bigger architectural change affecting non-DQU work. Path-scoped rules already auto-load on file edits, which covers most of the same surface. Document as future consideration if observed gaps appear.
- **Moving LR-034 from `LEARNED_RULES.md` to a path-scoped rule file** — Fix 1 (adding `reports/bugs/**/*.json` to baseline.md paths) achieves the same auto-load behavior with less churn.
- **New `.claude/rules/bugs.md` rule file** — pure infrastructure; baseline.md already covers the use case via Fix 1.
- **Promoting `/find-bugs` to enforce TodoWrite tag gate outside `/execute`** — the SP02B hook is intentionally scoped to `/execute`; expanding it changes semantic of "audit-mode skills" vs "execution-mode skills".
- **Future-client baseline rule generator** — when a new client is onboarded, they author their own `LR-{CLIENT}-001` per LR-045's per-client clause. Generator script is over-engineering for a once-per-client setup.
- **Auto-validation that every `**Parent**:` field points to an existing file** — already covered by `/planning` Step 3 + GARDENER sweep.

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| LR-048 too strict — blocks legitimate ad-hoc plans | The `**Phase 0.5b — CONDITIONAL`" wording and the listed conditions are explicit. Plans that don't meet any of the 4 conditions are NOT required to include Phase 0.5b. Audit subplans MUST. |
| Template drift — `_TEMPLATE_SUBPLAN.md` becomes stale | GARDENER sweep checks template against LR-048 every cycle. If LR-048 changes, template updates. |
| Agents skip reading pipeline.md when authoring | path-scoped auto-load fires on any `plans/**/*.md` edit, including the agent's own plan-file edit. The agent CANNOT edit a plan file without loading pipeline.md. |
| Fix 1's `reports/bugs/**/*.json` glob over-matches (e.g., would fire on `reports/bugs/INDEX.json`) | baseline.md content is general enough that loading it on any bug-related edit is informative, not noisy. Acceptable. |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] `.claude/rules/baseline.md` paths frontmatter includes `reports/bugs/**/*.json` (path-scoped Fix 1).
- [ ] `.claude/rules/pipeline.md` includes `## LR-048: Subplan Structural Minimum` section with all 8 sections enumerated and the Phase 0.5b conditional spec (Fix 2).
- [ ] `plans/pending/_TEMPLATE_SUBPLAN.md` exists with `Status: TEMPLATE-DRAFT` and contains all 8 sections from LR-048 with `<placeholder>` markers (Fix 3).
- [ ] `npm run plans:reindex` regenerated `plans/INDEX.md` (template visible; this plan visible).
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp gate.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on the 3 touched files.
- [ ] No new hook, skill, agent, or rule file created (slop discipline verified).

---

## Verification

End-to-end sanity check after fixes land:

1. **Fix 1 verification**: open any existing `reports/bugs/BUG-*.json` for edit. Confirm baseline.md is in injected rule context (look for "Baseline-Truth Workflow (LR-045)" heading or grep transcript). If present → Fix 1 working.

2. **Fix 2 verification**:
   ```bash
   grep -n "LR-048" .claude/rules/pipeline.md  # expect 1+ hits in section heading + trigger
   grep -nE "Phase 0\.5b.*Baseline-first" .claude/rules/pipeline.md  # expect 1 hit
   ```

3. **Fix 3 verification**:
   ```bash
   ls -la plans/pending/_TEMPLATE_SUBPLAN.md  # exists
   grep -n "Status.*TEMPLATE-DRAFT" plans/pending/_TEMPLATE_SUBPLAN.md  # expect 1 hit
   grep -cE "^## (Context|Bootstrap|Phase 0|Phase 0\.5b|Acceptance|Handoff)" plans/pending/_TEMPLATE_SUBPLAN.md  # expect 6+
   ```

4. **End-to-end smoke**: simulate authoring a new audit subplan by copying `_TEMPLATE_SUBPLAN.md` → `plans/pending/SUBPLAN_TEST.md` → confirm pipeline.md auto-loads → fill in Identity=WATCHDOG → confirm LR-048 makes Phase 0.5b mandatory. Delete the test file after verification.

5. **/regression-guard before/after** — the 3 touched files must not break any existing reference.

---

## Handoff (post-execution)

Chat summary: 3 files touched, 0 new infrastructure, ~50-line diff. The injection chain now has structural redundancy for bug-filings (Fix 1) AND a forcing function for new subplan authoring (Fix 2 + Fix 3). Future audit / find-bugs / module-audit subplans inherit baseline-first via LR-048 + LR-045 row 4 — no agent can credibly skip it without it being conspicuously visible in code review.

No obstacle claims per LR-039.

---

### Execution Summary (2026-04-29)

**Pre-execution review (`/review`)** caught 3 issues + 1 nitpick before any work landed; user audited the review against repo state, confirmed all valid, and authorized Q1=LR-048 / Q2=`plans/pending/_TEMPLATE_SUBPLAN.md` / Q3=tighten Section 7. Plan body amended in 3 fixes (LR-047→LR-048 rename × 14 occurrences via `replace_all`; template path top-level→`plans/pending/` × 10 occurrences + 2 unique-rationale rewrites; Section 7 LR-040 trigger explicit) before `/execute` was invoked.

**Phase 0.1 cross-check** returned `skipped: true` (plan has no Artifacts/Deliverables section — the script's `applicable` precondition failed). Identity gate evaluation surfaced a 4th issue not caught at /review time: D6 originally said "GARDENER-owned per AGENT_SHARED_RULES §2", but per §2.1 the touched paths (`.claude/rules/*.md` + `plans/**`) are OWNER-RW; GARDENER's RW per §2 is `src/pages/`, `src/common/base-page.ts`, `tests/` only. Disposition: **Phase 2.5 Adjacent-Sweep DO-NOW** — D6 rationale rewritten + frontmatter Identity flipped GARDENER→OWNER. Recorded as ALL-077 path (a) — subplan misclassified at authoring time. Logged as LR-020 micro-incident: the same-day grep miss reviewer flagged for /compile-learnings recurrence-tracking.

**Fixes landed**:

1. **Fix 1** (`.claude/rules/baseline.md`): `paths:` frontmatter gained `"reports/bugs/**/*.json"`. baseline.md now auto-loads on any `BUG-*.json` Edit/Write — surfaces LR-045 row 4 + LR-034 `baselineComparison` mandate to filers / verifiers / closers regardless of skill context. Diff: +1 line. SHA: `e0073...→1d01c9...`.
2. **Fix 2** (`.claude/rules/pipeline.md`): `## LR-048: Subplan Structural Minimum` appended after the TodoWrite Tagging Contract. 8 mandated sections (Title+Frontmatter, Context, Bootstrap, Phase 0, Phase 0.5b conditional, Phase 1+, Acceptance, Handoff). Phase 0.5b CONDITIONAL with 4 trigger predicates (Identity=WATCHDOG, Skills includes `/find-bugs`, title token match, drives TC corrections). Section 7 LR-040 trigger scoped to catalog/MCP-driven subplans only (per /review Q3). Diff: +28 lines. SHA: `cc7f91...→0260fb...`.
3. **Fix 3** (`plans/pending/_TEMPLATE_SUBPLAN.md`, NEW): 158-line skeleton, `Status: TEMPLATE-DRAFT`. All 8 LR-048 sections + Phase 2.5 + Verification (extra structure beyond LR-048 minimum). Inline comments guide the copy/rename/Status-flip workflow. SHA: `8505204...`.

**TCs implemented**: 3 surgical edits + 1 Phase 2.5 sweep correction.
**TCs dropped**: none.
**TCs deferred**: none.
**Slop discipline preserved**: 0 new hooks, 0 new skills, 0 new agents, 0 new rule files. All 7 "Out of scope" alternatives from the plan body remain rejected. Total file footprint: 3 files touched (planned), +1 file unintentionally amended in Phase 2.5 (the plan itself, D6 + frontmatter Identity correction — same file already in scope, not a new file).

**Verification artifacts**:

```bash
grep -nE 'reports/bugs' .claude/rules/baseline.md            # → line 7 (Fix 1 verified)
grep -c "LR-048" .claude/rules/pipeline.md                   # → 2 hits (heading + body) — Fix 2 verified
grep -nE "Phase 0\.5b.*Baseline-first" .claude/rules/pipeline.md  # → line 237 (Fix 2 verified)
ls -la plans/pending/_TEMPLATE_SUBPLAN.md                    # → 7099 bytes, 158 lines (Fix 3 verified)
grep -cE "^## (Context|Bootstrap|Phase 0|Phase 0\.5b|Acceptance|Handoff)" plans/pending/_TEMPLATE_SUBPLAN.md  # → 6 (LR-048 minimum met)
grep -rn "^## LR-047" .claude/rules/ docs/read_only_docs/    # → only the original /identity rule (no collision)
```

**Pre/post regression-guard** snapshots written to `.claude/state/regression-guard-injection-chain-{before,after}.txt`. All 8 existing `## LR-*` headings in pipeline.md stayed at unchanged line numbers (12, 25, 48, 61, 84, 110, 136, 178). All 3 existing path globs in baseline.md frontmatter preserved. No silent breakage on adjacent files (12 references to baseline.md/pipeline.md across `.claude/agents/`, `.claude/skills/`, `plans/`, activity log — none required updates since changes were additive).

**LR-020 self-graded micro-incident**: at plan authoring (2026-04-29 morning), the LR-NNN allocation step grep'd `LEARNED_RULES.md` but did not catch that LR-047 had been graduated *the same day* — same-session collision on a freshly-numbered rule. Reviewer's /review caught it. Single-Agent-Failure-Mode pattern: same-day rule graduations need a final pre-finalize grep, not a session-start grep. Tag for `/compile-learnings` recurrence sweep — 2nd such collision in 30 days would graduate to a hook check.

**Future-proofing achieved**: any agent in any skill (including standalone `/find-bugs`, `/bugfix`, manual file creation) editing a `BUG-*.json` will see baseline.md + LR-045 row 4 in injected context. Any agent authoring a `plans/pending/SUBPLAN_*.md` will see LR-048 + the template skeleton. Existing 9 SP-DQU-12..20 subplans already amended in the precursor surgical fix; new subplans on this client (or any future client) inherit the safety net by default.
