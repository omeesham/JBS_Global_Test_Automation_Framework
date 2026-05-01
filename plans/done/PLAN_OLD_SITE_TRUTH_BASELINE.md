---
**Plan**: PLAN_OLD_SITE_TRUTH_BASELINE
**Status**: DONE
**Priority**: P0 (top — supersedes all other pending planning work)
**Created**: 2026-04-23
**ExecutionAuthored**: 2026-04-24
**Executed**: 2026-04-24
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**Tags**: truth-source, workflow-change, requirements, old-site, encore-questions, baseline
---

## What This Is

A **top-priority architectural change** to how we find answers and establish truth for requirements, test cases, and bug verification across the entire Encore pipeline.

**Old site URL**: https://navigator2.training.psav.com/#/
Same account credentials, same selectors — just the old UI. Original features work there.

---

## Rutvik's Directive (verbatim, 2026-04-23)

> best way to find answers - https://navigator2.training.psav.com/#/ (not yet active, but same account, same selectors, etc... just old UI)
>
> so current e2e is just UI updates, og features are stable supposedly in old website.. to verify current behaviour and check for test cases, we have to go there and check aswell..
>
> i feel its better for requirements agent to visit old site, gather requireemtns, then planner starts exploring the new website, so we can have ideal case vs whats up right now... and to find answers, we run to old website whose features are working fine, if we find issues in e2e, go to old, if we dont find ans there (bug/question unanswered) then ASK the encore guys...
>
> very big update of things this would be not just encore questions skill, save a plan for this, do nothing else, keep this prompt saved there.... add to it...... maybe this would become a top prio task as it would change our assumptions game forever.....
>
> do no research, save this in a new pending plans folder, make researching and fitting this as top prio out of all... this is our baseline for truth getting....

---

## Proposed Truth Hierarchy

```
QUESTION / UNCERTAINTY arises
        ↓
1. Check OLD site (navigator2.training.psav.com/#/)
   └── feature works there? → that IS the expected behavior
   └── still unclear? ↓
2. Check OLD site for edge cases / boundary behavior
   └── still no answer? ↓
3. ASK Encore QA guys
   └── confirmed? → update REQUIREMENTS.md + plans
```

---

## Proposed Workflow Change

### Requirements Phase
- Requirements agent visits OLD site first
- Gathers requirements from OLD site behavior (ground truth / ideal state)
- Documents what SHOULD work (based on old)

### Planning Phase
- Planner explores NEW site
- Compares new vs old: ideal (old) vs current (new)
- Gaps = potential bugs OR intentional UI changes

### Bug Verification
- Any failing test / unclear behavior → go to old site first
- If old site shows the correct behavior → new site deviation = bug candidate
- If old site ALSO has the behavior → not a bug (it's by design)
- If old site doesn't have the feature → no comparison baseline → ask Encore

### Encore Questions Skill
- `/encore-questions` kill-list updated: "DOM-walkable on OLD site" kills a question
- Verify on old site first before surfacing to Encore QA
- Old site evidence becomes the `stepsToReproduce` source for requirements

---

## Scope of Impact (needs research before execution)

This plan likely touches:
- [ ] `clients/encore/CLAUDE.md` — truth hierarchy rule
- [ ] `.github/agents/playwright-framework-maintainer.agent.md` — old-site verification step
- [ ] `.github/agents/playwright-test-planner.agent.md` — Phase 0 visit old site
- [ ] Requirements agent prompt (if exists) — primary consumer of old site
- [ ] `/encore-questions` SKILL.md — kill-list + Phase 5 verify protocol
- [ ] `docs/read_only_docs/AGENT_SHARED_RULES.md` — truth hierarchy shared rule
- [ ] All pending subplans — may need "verify on old site" Phase 0 step

---

## Research Questions (to answer before sub-planning)

1. Is navigator2.training.psav.com actually accessible with current `.env.development` creds?
2. Are the selectors truly identical (same data-testids)? Need spot-check on 1 module.
3. Does the Requirements agent currently have a prompt / agent file, or is it ad-hoc?
4. Which pending subplans have open questions that old-site verification could close TODAY?
5. How does the old site handle History / Pricing / Local Info modules we're currently testing?
6. Do we need a separate Playwright project config to point tests at old site URL?

---

## Sub-plans to Create (after research)

- `SUBPLAN_OLD_SITE_ACCESS_VERIFY.md` — confirm creds + selector parity (Sonnet hi, quick)
- `SUBPLAN_OLD_SITE_REQUIREMENTS_AGENT_UPDATE.md` — update requirements agent workflow
- `SUBPLAN_OLD_SITE_PLANNER_UPDATE.md` — planner Phase 0 = old-site walkthrough first
- `SUBPLAN_OLD_SITE_ENCORE_QUESTIONS_UPDATE.md` — update `/encore-questions` kill-list + Phase 5
- `SUBPLAN_OLD_SITE_SHARED_RULES_UPDATE.md` — encode truth hierarchy in AGENT_SHARED_RULES.md

---

## Notes / Additions

*(Append future notes here as the plan evolves)*

- 2026-04-23: Plan created from Rutvik's directive. No research done yet. Awaiting top-priority queue slot.
- 2026-04-24: Execution plan authored (see below). User decisions captured: bundle into 3 subplans; SP-A bundles BUG oracle checks (HIS-001/002, LOC-ECT-001, LI-001) during same login session; retrofit all pending TC-generation subplans via one-bullet Phase 0 append.

---

# Execution Plan (authored 2026-04-24, Rutvik + Claude Opus 4.7)

> Supersedes the "Sub-plans to Create" list above with a concrete, user-approved 3-subplan shape. This section is the contract the next `/execute` session runs against.

## Why this change (Rutvik directive, verbatim — 2026-04-24)

> "we basically got a truth source to know how should our e2e app behave like... this applies to all test case generation we are gonna do.. the subplans in pending already, they are for improving test cases, if we do not look at baseline, we would make shit cases again"

> "explore old website before exploring the new website to find bugs even before automation scripts are written.... check behaviour of old site, verify on new site, find bugs, create automation according to real baseline"

**Workflow rule** (becomes LR-045 / LR-ENC-001 during SP-C): old site = baseline truth; new site = observed truth; divergence = signal (bug candidate, requirement-gap, or intentional UX change). Applies to every TC authoring loop — Requirements → Planner → Generator.

## Baseline URL

https://navigator2.training.psav.com/#/setup/locationdetail/1604

Same creds as new site (per parent directive — `config/environments/.env.development`). SP-A proves this.

## Current state inventory (explored read-only 2026-04-24)

| # | Surface | Has old-site concept? | Edit shape in SP-C |
|---|---|---|---|
| 1 | `docs/read_only_docs/AGENT_SHARED_RULES.md` (ALL-024) | NO — says "MCP DOM = truth" | Insert OLD-SITE above MCP DOM in truth hierarchy |
| 2 | `.github/agents/playwright-requirements.agent.md` (HUNTER, EXISTS) | NO — "DOM is truth" | SP-B: Phase 1 splits into 1a (old site baseline) + 1b (new site compare) |
| 3 | `.github/agents/playwright-test-planner.agent.md` (GIVER, line 145) | NO — "Live DOM is truth" | Phase 0.5 re-check old site if uncertainty |
| 4 | `.claude/skills/encore-questions/SKILL.md` | NO | Phase 3 kill-list gains "DOM-walkable on OLD SITE in <5 min"; Phase 5 Tier A checks old site first |
| 5 | `clients/encore/CLAUDE.md` | NO | New `LR-ENC-001` naming old site as Encore truth source |
| 6 | `.github/agents/playwright-framework-maintainer.agent.md` | NO | No rule addition (maintainer doesn't author TCs) |
| 7 | `playwright.config.ts` | `BASE_URL` only | OPTIONAL `chrome-old-site` project — DEFERRED unless SP-A shows scripted need |
| 8 | Pending TC-generation subplans (12–15 files) | NO | One-bullet Phase 0 append with pointer to LR-ENC-001 + old-site-baseline artifact |

**Requirements agent DOES exist** at `.github/agents/playwright-requirements.agent.md` (HUNTER identity). Answer to parent plan's Q3 — yes, so SP-B updates, not creates.

## The 3 subplans (execution order)

### SP-A — `SUBPLAN_OSB_01_ACCESS_VERIFY_AND_ROAM.md` (HARD GATE)

| Field | Value |
|---|---|
| Identity | HUNTER (live DOM exploration) |
| Model | claude-opus-4-7 |
| Thinking | xhi |
| PermissionMode | auto |
| Browser tool | Claude in Chrome (LR-038: exploratory, auth-heavy SSO, user at machine) |
| Depends on | none |
| Blocks | SP-B, SP-C (HARD — if RED, workflow rule cannot ship) |

**Scope**:
1. Navigate to `https://navigator2.training.psav.com/#/setup/locationdetail/1604` — prove auth flow works with current `.env.development` creds.
2. Selector-parity spot-check: `document.querySelectorAll('[data-testid]')` count + sample 5 well-known testids from `clients/encore/src/selectors/setup/local-office/*.ts`.
3. Walk Local Office tabs — Basic Info, ECT, Local Info — note structural differences vs `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` (tab count, field count, visible labels).
4. **BUG oracle bundle** (per user directive: "check whatever u would like and note things somewhere"):
   - **BUG-HIS-001**: toggle EnableMultidayPricing → save → Location Management History row produced?
   - **BUG-HIS-002**: change Merchant Currency → save → history row produced?
   - **BUG-LOC-ECT-001**: set Benefits Multiplier 0.11 → save → reload → persisted?
   - **BUG-LI-001**: Oracle fields with SkipBilling=unchecked → aria-required set? Save validation feedback or silent no-op?
5. Compare old-site history schema (cols, headers, boolean render format per LR-036) vs new-site findings (LM=87 cols Unicode ✔ / LOS=42 cols SVG lucide-check).

**Artifact** (written during execution):
`clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` — creds outcome + selector-parity sample + per-tab field counts + per-bug oracle verdicts with DOM/network evidence per LR-033. Follows `field-inventory-spec.md` spirit, scoped to cross-module baseline observations.

**Exit criteria** (Verdict):
- **GREEN**: auth ok + ≥4/5 sample testids present + oracle verdicts actionable → SP-B, SP-C unblocked.
- **YELLOW**: auth ok but selector divergence significant → flag before SP-B/SP-C, scope may expand.
- **RED**: auth fails OR 1604 404/403 → HALT, file access-failure bug, ask user for alternate creds/URL.

**BUG verification discipline (LR-044)**: every oracle check MCP-confirmed on fresh pages, network-evidenced per LR-033, filed/updated per LR-034 schema, `verificationLog` entry appended.

### SP-B — `SUBPLAN_OSB_02_REQUIREMENTS_AGENT_REWRITE.md`

| Field | Value |
|---|---|
| Identity | OWNER (framework agent file + mistake rules cross-reference) |
| Model | claude-opus-4-7 |
| Thinking | xhi |
| PermissionMode | auto |
| Depends on | SP-A GREEN |

**Edits**:
1. `.github/agents/playwright-requirements.agent.md` — split Phase 1 into 1a (old-site baseline FIRST, artifact emitted) + 1b (new-site compare row-by-row, divergence = candidate bug per LR-034 or requirement-gap).
2. Reframe REQ-001..REQ-013 "live DOM is truth" → "old-site DOM = baseline truth; new-site DOM = observed truth; divergence = signal".
3. Add `REQ-014` to `agent-mistakes.md` Requirements section: Phase 1a artifact MANDATORY before handoff to Planner.

### SP-C — `SUBPLAN_OSB_03_STRUCTURAL_BUNDLE.md`

| Field | Value |
|---|---|
| Identity | OWNER (cross-cutting) |
| Model | claude-opus-4-7 |
| Thinking | xhi |
| PermissionMode | auto |
| Depends on | SP-A GREEN |

**Edits**:
1. `docs/read_only_docs/AGENT_SHARED_RULES.md` — update ALL-024 truth hierarchy to insert OLD-SITE DOM at top. One-paragraph explanation. Cross-reference LR-ENC-001, LR-034.
2. `.github/agents/playwright-test-planner.agent.md` — update line 145 + Phase 0.5 re-check old-site on uncertainty.
3. `.claude/skills/encore-questions/SKILL.md` — Phase 3 kill-list gains "DOM-walkable on OLD SITE in <5 min"; Phase 5 Tier A first step = check old site.
4. `clients/encore/CLAUDE.md` — new `LR-ENC-001` naming old site as Encore truth source + creds pointer + baseline-artifact directory convention.
5. `clients/encore/specs_planning/_internal/agent-mistakes.md` — new `ALL-078`: TC authoring requires old-site baseline artifact per PLN-049/REQ-014; absence = HALT at Planner→Generator handoff.
6. `CLAUDE.md` (root) — new framework `LR-045`: baseline-truth workflow. Other clients inherit pattern without copying Encore URL.
7. **Retrofit clause** — grep `plans/pending/SUBPLAN_*.md` for TC-generation subplans. Single-bullet Phase 0 append:
   > *"Old-site baseline check (LR-ENC-001 / ALL-078): before authoring any TC, open the corresponding page on navigator2.training.psav.com and record baseline behavior in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<date>.md`. Reference this artifact in the Execution Summary under 'Old-site baseline: consulted Y/N + evidence'."*
   Target: every `SUBPLAN_HIST_PIVOT_*.md` and `SUBPLAN_SP-*.md` whose Step-by-Step generates test cases. Estimated 12–15 files.
8. OPTIONAL `playwright.config.ts` — `chrome-old-site` project. DEFERRED.
9. `.claude/context/navigation.md` — new §B row linking the workflow; §C registry row after first old-site-baseline artifact lands.

## Session boundary

**This plan ships**: the 3 subplans authored into `plans/pending/` during next /execute. No production edits until subplans run. Parent plan (this file) moves pending → done only after SP-A/B/C all GREEN.

**Bright-line rule**: SP-C's retrofit clause is a ONE-BULLET append per pending subplan. No test-case rewrites. Scope expansion only on explicit user ask.

## Risks & open items

- **R1** — Selector parity unknown until SP-A. If significantly different, retrofit value drops; scope expands to "observe, don't automate" variant of SP-C.
- **R2** — Creds might fail on old site → RED verdict, HALT.
- **R3** — BUG oracle bundling adds ~20 min to SP-A. Acceptable per user directive.
- **R4** — Retrofit blast radius: 12–15 files, one-line each. `/regression-guard` before/after surfaces unintended diffs.
- **R5** — Rule-number collisions (LR-045, LR-ENC-001, ALL-078, REQ-014). Per LR-020, verify freshest IDs during SP-C execution.
- **Discussion-item vs bug** (`feedback_discussion_item_not_bug.md`): feature empty-everywhere + no-UI-path + no-Jira on BOTH sides = discussion-item, not a filed bug.

## Verification (end-to-end)

1. SP-A GREEN: `OSB-ACCESS-VERIFY-2026-04-24.md` exists, `/final-q` GREEN, oracle verdicts have MCP + network evidence.
2. SP-B: `git diff` shows Phase 1 split into 1a/1b + REQ-014 added. `npm run validate:sync` + `npm run sync:mistakes` per ALL-004.
3. SP-C: `/regression-guard` before/after on 6 surfaces + all retrofitted subplans. Grep old-site URL mentions: 0 before → N>6 after. `npm run plans:reindex`.
4. End-to-end smoke: `/execute` on one retrofitted pending subplan in scratch session — Phase 0 halts without old-site baseline artifact for the module. Halt = retrofit works.
5. Parent plan finalization: this file moves pending → done with Execution Summary.

## Out of scope

- Authoring test cases against old-site baseline for any specific module (that's downstream retrofitted subplans).
- Deleting / rewriting ALL-024 (only inserting OLD-SITE above it).
- Adding Playwright `chrome-old-site` project (deferred, R1).
- Running Playwright specs against old site. Baseline = TC generation source only; specs still run against new site.

---

## Execution Summary (2026-04-24, OWNER)

Parent plan's deliverable WAS the 3 subplans. All 3 landed GREEN within the single day the directive was issued.

| Subplan | Executed | Verdict | Done file |
|---|---|---|---|
| SP-OSB-01 ACCESS_VERIFY_AND_ROAM | 2026-04-24 (morning) | GREEN | `plans/done/SUBPLAN_OSB_01_ACCESS_VERIFY_AND_ROAM.md` |
| SP-OSB-02 REQUIREMENTS_AGENT_REWRITE | 2026-04-24 (midday) | GREEN | `plans/done/SUBPLAN_OSB_02_REQUIREMENTS_AGENT_REWRITE.md` |
| SP-OSB-03 STRUCTURAL_BUNDLE | 2026-04-24 (afternoon) | GREEN | `plans/done/SUBPLAN_OSB_03_STRUCTURAL_BUNDLE.md` |

### 6 research questions — all answered

| # | Answer | Evidence |
|---|---|---|
| Q1 Old site accessible with current creds? | YES | SP-OSB-01 §1 — CiC inherited SSO; 1604 loaded |
| Q2 Selectors identical? | NO — zero testid parity | SP-OSB-01 §2 — 0 data-testids on old site |
| Q3 Requirements agent exists? | YES — `.github/agents/playwright-requirements.agent.md` | SP-OSB-02 updated it (Phase 1a/1b split) |
| Q4 Old-site-answerable open questions today? | 11+ HIST-pivot subplans unblocked | SP-OSB-01 §4 (BUG-HIS-001/002 verdicts: phantom not tracked) |
| Q5 Old site handle History / Pricing / Local Info? | Different architecture — 1 URL w/ embedded tabs; LM History 87 cols identical to new site | SP-OSB-01 §3 + §5 |
| Q6 Separate Playwright project for old site? | NO — observation-only, zero automation viability | SP-OSB-01 §2 + §6 |

### Risks — final disposition

- **R1 Selector parity** → confirmed ZERO; retrofit wording adjusted to "visit + observe" (FLAG-01); scope did NOT expand. Closed.
- **R2 Creds** → GREEN per SP-OSB-01 §1. Closed.
- **R3 BUG oracle bundling time** → absorbed by SP-OSB-01 within session budget. Closed.
- **R4 Retrofit blast radius** → 13 files, surgical diffs, no Step-by-step mechanics altered. Closed.
- **R5 Rule-number collisions** → zero collisions (LR-045 / LR-ENC-001 / ALL-078 all free; REQ-014 added by SP-OSB-02 as planned). Closed.
- **Discussion-item vs filed bug** → respected — baseline-absent features flagged for `/encore-questions` escalation, not filed as bugs.

### Shipped artifacts

**Rules** (new): LR-045 (framework, root CLAUDE.md), LR-ENC-001 (Encore, client CLAUDE.md), ALL-078 (shared, agent-mistakes.md), REQ-014 (requirements agent, via SP-OSB-02).
**Rules** (amended): ALL-024 (truth hierarchy now leads with old-site DOM).
**Agents**: playwright-requirements Phase 1a/1b split; playwright-test-planner Phase 0.5 baseline consultation block; planner line 145 truth statement reworded.
**Skills**: `/encore-questions` Phase 3 kill-list + Phase 5 Tier A gained old-site-first logic.
**Navigation**: `.claude/context/navigation.md` §B routing + §C registry rows for old-site baseline.
**Subplan retrofits**: 13 HIST_PIVOT_20..32 TC-gen subplans with Phase 0 baseline bullet.
**Baseline artifact**: `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (first of the new artifact class).
**Bug verifications** (per LR-044): BUG-HIS-001 / BUG-HIS-002 / BUG-LOC-ECT-001 / BUG-LI-001 all re-verified against baseline with `verificationLog` entries.

### Downstream unblocks

- **11+ HIST-pivot subplans** (SP-D1..SP-D10, SP-B-LM-3a/3b/4..9): assertion direction decided as "phantom not tracked" for EnableMultidayPricing + Merchant Currency columns (SP-OSB-01 §4).
- **Requirements agent future sessions**: now structurally compelled to emit old-site baseline artifact as Phase 1a deliverable (REQ-014 HALT gate).
- **Planner future sessions**: now structurally compelled to reference baseline artifact in field-inventory `Baseline_Artifact` frontmatter (PLN-049 amended).
- **TC-generation subplan executions**: all 13 retrofitted subplans now carry the Phase 0 baseline-consultation bullet.

### Deferred / out of scope (unchanged)

- Playwright `chrome-old-site` project (R1, parent-plan deferred). Revisit if observation-only proves insufficient.
- Authoring test cases against baseline for any specific module (that's downstream TC-gen subplan work, not this parent plan).

### Verdict: **GREEN**

User directive 2026-04-23 ("old site = truth source; this is our baseline for truth getting") is now fully installed as the workflow contract across 8 framework surfaces + 13 retrofitted subplans, within the same-day window the directive was issued.

## Appendix — partial answers to parent's 6 research questions

1. **Old-site accessible with current creds?** → UNKNOWN; SP-A is the proof gate.
2. **Selectors identical?** → UNKNOWN; SP-A spot-check. R1 if different.
3. **Requirements agent exists?** → YES. `.github/agents/playwright-requirements.agent.md` (HUNTER). SP-B updates it.
4. **Old-site-answerable open questions today?** → 11+ HIST-pivot subplans (SP-D1..SP-D10, SP-B-LM-3a/3b/4..9) deferred on BUG-HIS-001/002 outcomes; SP-A oracle bundle resolves.
5. **Old site handle History / Pricing / Local Info?** → UNKNOWN; SP-A artifact captures.
6. **Separate Playwright project for old site?** → DEFERRED. Revisit post SP-A.
