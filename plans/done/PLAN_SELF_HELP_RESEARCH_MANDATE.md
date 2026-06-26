# PLAN: Self-Help Research Mandate — wire Rovo (Jira/Confluence) into every identity before it asks the user

**Status**: DONE
**Executed**: 2026-06-22
**Priority**: P0
**Created**: 2026-06-22
**Identity**: OWNER
**Depends on**: none
**Blocks**: SUBPLAN_PRODUCTS_00_FOUNDATION.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Author**: Rutvik (via Claude Opus 4.8)
**ActiveClient**: encore

---

## Context

Rovo (the Atlassian MCP, `encore.atlassian.net`, server id `351f3923-…`) is wired up and connected, but
referenced by **zero rules, zero agent prompts, zero skills** — only in one plan body
(`PLAN_CORP_PRICING_REWALK_REMEDIATION.md:45`) as a one-off Rutvik ran manually. The consequence is a
systemic fuckup: a requirements gatherer about to automate a brand-new module never reads its
Jira/Confluence requirements; agents escalate "UNKNOWN / ask the user" instead of self-helping; TC details
that live in tickets are never consulted. Rutvik caught this during Products planning and locked the fix as
its **own standalone plan, landed first**, because it touches 6 agent prompts + 2 rules + 2 skills + 1
memory file — broader than any single module plan. Because the fix lives in rules + agent prompts, **every
future FCC/module plan inherits it automatically** — no per-plan re-adding.

Audit basis (5 fresh-context Sonnet auditors, all verbatim-cited): HUNTER (`REQUIREMENTS.md`) has Jira
**last** in its truth hierarchy and Rovo tools are **not in its `tools:` frontmatter** (it cannot call
Jira even if it wanted to); GIVER/BUILDER build TCs purely from DOM + local `REQUIREMENTS.md`;
HEALER/WATCHDOG file BUG / escalate FEATURE_CHANGE / ask-user with no "is this by-design?" Jira check;
`feedback_self_first_research.md` chain omits Jira; `/encore-questions` kill-list drops DOM/old-site
questions but not Jira-answerable ones. Ground truth already in-repo and ignored:
`jira-defect-crossref-2026-06-09.md` (Search NM-1445, Strategy NM-1441, Detail NM-1443, …), tracked
`clients/encore/docs/Pricing-Functional Details-JIRA STORIES 1.docx` + `clients/encore/docs/jira_pricing_test_cases.xlsx`.

This is a "restructure plan" per LR-050 (changes intake/escalation posture framework-wide). The stale-slop
it touches is enumerated in §Stale-slop below, in-scope, not deferred.

---

## Bootstrap

**Identity**: OWNER (edits rules + agent prompts + skills + memory — framework-owned paths)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (BEFORE + AFTER snapshots over the touched rule/agent/skill files)
- `/final-q` (mandatory exit per LR-042)

**Context files**:
- `docs/read_only_docs/LEARNED_RULES.md` (LR-063 lands here; current max LR-062)
- `clients/encore/CLAUDE.md` (LR-ENC-004 lands here; current max LR-ENC-003)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, §14 Self-Unblocking Map)
- `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT}.md`
- `.claude/skills/encore-questions/SKILL.md`

---

## Phase 0.0 — Pre-execution self-audit gate (MANDATORY, BLOCKING — run by the EXECUTOR session, NEVER by the author, NEVER skipped)

> This plan was authored 2026-06-22 as a planning blueprint. Its claims are a point-in-time snapshot and
> may have drifted (rule numbers minted since, files moved, agent prompts already changed). Before ANY edit
> lands, the executing session MUST adversarially re-verify the whole plan against the **live repo** —
> `/ultrathink` + enemy-based, judge-level (AI-Council-grade), fresh-context. Do NOT trust this plan's own
> claims; verify each from disk. The gate emits a dated verdict artifact and **HALTs on any defect** — no
> blind execution.

1. **Fan out ≤5 fresh-context auditors** (model ≤ current class; Sonnet fine), each owning one dimension,
   then synthesize. NO auditor rubber-stamps — each must cite `file:line` evidence (AUD-017 /
   `feedback_verify_synthesis_refutations.md`).
2. **Dimension A — number/path integrity (LR-020):** confirm `LR-063` is still free in
   `docs/read_only_docs/LEARNED_RULES.md`; `LR-ENC-004` still free in `clients/encore/CLAUDE.md`; and the
   per-agent ids (`REQ-015`/`PLN-051`/`GEN-045`/`HLR-NNN`/`AUD-NNN`) are each above the live high-water mark
   in their agent file. If any collides, the gate REASSIGNS the next free number and rewrites the plan
   before proceeding. Confirm every file the plan names exists at the cited path.
3. **Dimension B — claim re-verification (do NOT trust the snapshot):** re-confirm the 5 audit findings on
   the LIVE files — (a) `REQUIREMENTS.md` `tools:` frontmatter lacks the Rovo tools, (b) Jira is last in its
   truth hierarchy, (c) GIVER/BUILDER never consult Jira, (d) HEALER/WATCHDOG escalate without a by-design
   check, (e) `feedback_self_first_research.md` chain + `/encore-questions` kill-list omit Jira. Any finding
   that is **already fixed** → strike that touchpoint from Phase 1 (prevents re-doing settled work = slop).
4. **Dimension C — capability proof:** confirm the Rovo server id `351f3923-22c5-4ff0-a7bd-339c0028aae5`
   matches the live tool list and `getVisibleJiraProjects` returns projects (or record the headless
   `[ROVO-SKIP]` degrade path is wired). A plan that wires tools that don't resolve is dead on arrival.
5. **Dimension D — slop / worthiness:** every touchpoint in §1.2 must be (i) necessary, (ii)
   non-duplicative of an existing rule/prompt clause, (iii) the minimal change that achieves the outcome.
   Flag any over-engineering (new files where an edit suffices, redundant rules) → DROP before executing.
6. **Dimension E — goal-completion proof:** trace each Acceptance criterion to a concrete Phase-1 edit that
   makes it pass. Any acceptance line with no producing edit = the plan does NOT get done what it claims →
   HALT and fix the plan.
7. **Verdict:** emit `clients/encore/specs_planning/_internal/pre-exec-audit-self-help-mandate-<DATE>.md`
   with a per-dimension PROCEED/DEFECT table + an overall `VERDICT: PROCEED | HALT`. **PROCEED is required
   before Phase 0.** Any DEFECT → fix the plan (or escalate to the user for a steering call) and re-run the
   gate; never execute around a DEFECT.

## Phase 0 — Dependency + capability gate

1. `Depends on:` = none — proceed.
2. Confirm last-used framework LR = LR-062 → **LR-063** is free. Confirm last-used Encore LR = LR-ENC-003
   → **LR-ENC-004** is free. Confirm last-used per-agent rule ids before minting: REQUIREMENTS REQ-NNN,
   PLANNER PLN-NNN, GENERATOR GEN-NNN, HEALER HLR-NNN, AUDIT AUD-NNN (grep each agent file's existing
   rule-id high-water mark; the design names REQ-015 / PLN-051 / GEN-045 / HLR-029 / AUD-018 as the
   intended next ids — Phase 0.0 Dimension A (2026-06-22) verified each is free against the live
   high-water marks REQ-014 / PLN-050 / GEN-044 / HLR-028 / AUD-017).
3. Capture the Rovo server id verbatim from the live tool list (`351f3923-22c5-4ff0-a7bd-339c0028aae5`) —
   the `tools:` frontmatter additions must use the exact MCP tool names.
4. BrowserTool: none (rule/prompt edits only; no live app).

---

## Phase 1 — The edits

### 1.1 — Two new rules

**LR-063 (framework, `docs/read_only_docs/LEARNED_RULES.md`) — Self-help research mandate.** Before any
agent/skill declares "unknown / UNCERTAIN / REQUIREMENT-GAP / BASELINE-ABSENT" or escalates to the user,
it MUST run the chain **in order**: (1) self/context → (2) repo artifacts → (3) **Rovo Jira/Confluence**
(mandatory when the question is product-behavior OR a new module is being walked) → (4) web → (5) user
(only for genuine high-impact-steering decisions). Headless caveat: if the Atlassian MCP is absent, log
`[ROVO-SKIP: MCP not connected]` and continue — **never silently skip, never silently proceed as if
researched.** Trigger: every REQUIREMENT-GAP / BASELINE-ABSENT / UNCERTAIN classification; new-module
intake; every `/encore-questions` batch; LR-034 Step 1 "no documented requirement."

**LR-ENC-004 (Encore, `clients/encore/CLAUDE.md`) — Jira-first intake for new modules.** Before HUNTER
Phase 1a (old-site walk) for any module with no baseline artifact, AND before GIVER authors TCs touching a
BASELINE-ABSENT field: search `encore.atlassian.net` via Rovo for the module's NM tickets + Confluence
spec; record findings in `_internal/jira-defect-crossref-<module>-<DATE>.md` and a `jira_tickets: [...]`
frontmatter key on the baseline artifact (the structural enforcement point). Only if NO ticket exists does
the feature route to `/encore-questions`. Every Jira fact is a **LEAD**, re-verified against DOM truth
(ALL-024) before it enters a TC.

### 1.2 — Agent-prompt + skill + memory touchpoints (all OWNER-owned)

| File | Change | New rule id (verify free before minting) |
|---|---|---|
| `.claude/agents/REQUIREMENTS.md` | add the 5 Rovo MCP tools to `tools:` frontmatter; new **Phase 0.5 Rovo research** step before Phase 1a (emit `jira-defect-crossref` + `jira_tickets:`); HALT if an in-flight behavioral-change NM ticket exists; truth-hierarchy note: Jira/Confluence = **intent truth** (parallel track), DOM = **render truth** | REQ-015 |
| `.claude/agents/PLANNER.md` | new **Phase 0.75 Jira/Confluence enrichment** → `## Jira/Confluence Findings` section in field-inventory; HARD STOP: no cross-field/boundary/business-rule TC without a Jira check (classify contradiction intentional / app-bug / stale) | PLN-051 |
| `.claude/agents/GENERATOR.md` | **unknown-expected-value gate**: verify non-artifact assertions via Jira before asserting; tag `// DOM-only — no Jira story` when none found | GEN-045 |
| `.claude/agents/HEALER.md` | **Jira pre-disposition check** before escalating FEATURE_CHANGED_BIG / removing a test (by-design ticket → reclassify EXPECTED_BEHAVIOR; open ticket → cite it in `requirementSource`). For the **BUG** disposition, **cite existing LR-034 Step 1** ("find the original source … Jira") rather than restating it — Dim D TRIM-1 (avoid duplicating LR-034). | HLR-029 |
| `.claude/agents/AUDIT.md` | **pre-escalation self-help**: search Jira/Confluence before `UNCERTAIN`→user and `FEATURE_CHANGE`→Requirements; add Jira/Confluence to the finding evidence taxonomy + as a valid LR-061 2nd evidence source | AUD-018 |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` §14 | add Jira/Confluence rows to the Self-Unblocking Map ("might be a known bug" / "uncertain feature change") | — |
| `.claude/skills/encore-questions/SKILL.md` | Phase 3 kill-list gains "Jira-answerable in <5 min → DROP"; query Rovo before shipping any question | — |
| auto-memory `feedback_self_first_research.md` | insert Jira/Confluence into the chain: self → repo → **Rovo/Jira/Confluence** → web → user | — |
| `clients/encore/specs_planning/_internal/field-inventory-spec.md` | add an **optional** `## Jira/Confluence Findings` section to the artifact contract so PLANNER's Phase 0.75 output is spec-governed (prevents agent-prompt ↔ spec drift; Dim D TRIM-2) | — |

### 1.3 — Headless-degradation pattern (so `/chain` runs don't false-green)

Rovo is interactively-authenticated; it may be **absent in headless/cron `/chain` runs**. Therefore: a
human-attended OWNER/HUNTER session runs the Rovo research **once** and commits the
`jira-defect-crossref-<module>-<DATE>.md` artifact; headless subplan runs **consume the committed file**
rather than calling Rovo live. Any artifact produced without Rovo carries `rovo_available: false` so
downstream knows the ticket list is unverified. Canary: call `getVisibleJiraProjects` first; empty/error →
treat Rovo as unavailable, log `[ROVO-SKIP]`, degrade to repo-only sources.

---

## Stale-slop cleanup (LR-050)

In-scope, fixed by this plan (not deferred to "discover later"):
1. `feedback_self_first_research.md` chain missing Jira/Confluence — fixed in 1.2.
2. `REQUIREMENTS.md` truth-hierarchy lists Jira last + omits it from callable tools — fixed in 1.2.
3. `AGENT_SHARED_RULES.md` §14 Self-Unblocking Map has no Jira rows — fixed in 1.2.
4. `/encore-questions` kill-list omits Jira-answerable questions — fixed in 1.2.
5. `field-inventory-spec.md` would drift from PLANNER's new `## Jira/Confluence Findings` output unless the spec declares the section — fixed in 1.2 (optional-section addition; Dim D TRIM-2).

---

## Acceptance criteria

- [ ] **Phase 0.0 pre-execution self-audit artifact exists with `VERDICT: PROCEED`** (`clients/encore/specs_planning/_internal/pre-exec-audit-self-help-mandate-<DATE>.md`) — emitted BEFORE any Phase 1 edit.
- [ ] `grep -c "LR-063" docs/read_only_docs/LEARNED_RULES.md` ≥ 1.
- [ ] `grep -c "LR-ENC-004" clients/encore/CLAUDE.md` ≥ 1.
- [ ] `grep -l "351f3923" .claude/agents/REQUIREMENTS.md` resolves (Rovo tools in HUNTER `tools:`).
- [ ] Each agent carries its concrete self-help rule id: `grep -c "REQ-015" .claude/agents/REQUIREMENTS.md` ≥ 1; `grep -c "PLN-051" .claude/agents/PLANNER.md` ≥ 1; `grep -c "GEN-045" .claude/agents/GENERATOR.md` ≥ 1; `grep -c "HLR-029" .claude/agents/HEALER.md` ≥ 1; `grep -c "AUD-018" .claude/agents/AUDIT.md` ≥ 1.
- [ ] `grep -ic "jira-answerable" .claude/skills/encore-questions/SKILL.md` ≥ 1 (the specific new kill-list criterion — not a pre-existing incidental jira/rovo mention).
- [ ] `feedback_self_first_research.md` chain includes Rovo/Jira/Confluence.
- [ ] `grep -ic "jira\|confluence" docs/read_only_docs/AGENT_SHARED_RULES.md` ≥ 1 within the §14 Self-Unblocking Map (new rows).
- [ ] `grep -c "Jira/Confluence Findings" clients/encore/specs_planning/_internal/field-inventory-spec.md` ≥ 1 (optional section added; Dim D TRIM-2).
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
ls clients/encore/specs_planning/_internal/pre-exec-audit-self-help-mandate-*.md  # Phase 0.0 verdict artifact
grep -c "VERDICT: PROCEED" clients/encore/specs_planning/_internal/pre-exec-audit-self-help-mandate-*.md  # expect: >= 1
grep -c "LR-063" docs/read_only_docs/LEARNED_RULES.md            # expect: >= 1
grep -c "LR-ENC-004" clients/encore/CLAUDE.md                    # expect: >= 1
grep -l "351f3923" .claude/agents/REQUIREMENTS.md                # Rovo tools in HUNTER tools:
grep -c "REQ-015" .claude/agents/REQUIREMENTS.md                 # expect: >= 1
grep -c "PLN-051" .claude/agents/PLANNER.md                      # expect: >= 1
grep -c "GEN-045" .claude/agents/GENERATOR.md                    # expect: >= 1
grep -c "HLR-029" .claude/agents/HEALER.md                       # expect: >= 1
grep -c "AUD-018" .claude/agents/AUDIT.md                        # expect: >= 1
grep -ic "jira-answerable" .claude/skills/encore-questions/SKILL.md   # expect: >= 1
grep -ic "jira\|confluence" docs/read_only_docs/AGENT_SHARED_RULES.md # §14 rows; expect: >= 1
grep -c "Jira/Confluence Findings" clients/encore/specs_planning/_internal/field-inventory-spec.md  # expect: >= 1
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. On close, every identity self-helps via Rovo
(self → repo → Rovo/Jira/Confluence → web → user) before asking the user; new-module intake reads Jira
first. `SUBPLAN_PRODUCTS_00_FOUNDATION.md` inherits working Jira access for its Products walk.

---

## Execution Summary

**Executed**: 2026-06-22 by OWNER (Opus 4.8) via `/execute` + `/ultrathink`. BrowserTool: none (rule/prompt edits only; no live app).

### Phase 0.0 — Pre-execution self-audit (BLOCKING gate, PASSED)

5 dimensions audited fresh-context (4 Sonnet subagents for A/B/D/E + inline Rovo canary for C). Verdict artifact: `clients/encore/specs_planning/_internal/pre-exec-audit-self-help-mandate-2026-06-22.md` carries `VERDICT: PROCEED`. Capability proven live: `atlassianUserInfo` active, cloudId `03ec286f-d928-4c2c-b782-c8cce703ce2a`, `getVisibleJiraProjects` returned the project list, server id `351f3923-…` matches the live tool list. Dimension B confirmed all 5 audited gaps still live (zero touchpoints struck).

### Edits landed (all verified — see ## Verification)

**Two new rules**
- LR-063 (`docs/read_only_docs/LEARNED_RULES.md`) — Self-help research mandate (chain self → repo → Rovo → web → user; `[ROVO-SKIP]` headless caveat).
- LR-ENC-004 (`clients/encore/CLAUDE.md`) — Jira-first intake for new modules (`jira-defect-crossref-*` artifact + `jira_tickets:` frontmatter as the greppable enforcement point).

**Seven agent / skill / memory touchpoints**
- `.claude/agents/REQUIREMENTS.md` (REQ-015) — 5 Rovo MCP tools added to `tools:`; Phase 0.5 Rovo research step (HALT on in-flight behavioral NM ticket); two-axis truth note.
- `.claude/agents/PLANNER.md` (PLN-051) — Phase 0.75 Jira/Confluence enrichment + HARD STOP #20.
- `.claude/agents/GENERATOR.md` (GEN-045) — unknown-expected-value Jira gate + `// DOM-only` tag (HARD STOP #14).
- `.claude/agents/HEALER.md` (HLR-029) — Jira pre-disposition check scoped to FEATURE_CHANGED_BIG + remove-test; BUG disposition cites LR-034 Step 1 (HARD STOP #8).
- `.claude/agents/AUDIT.md` (AUD-018) — pre-escalation self-help (HARD STOP #5) + Jira in finding evidence taxonomy + LR-061 2nd-source + disposition annotations.
- `docs/read_only_docs/AGENT_SHARED_RULES.md` §14 — 2 Jira/Confluence Self-Unblocking-Map rows.
- `.claude/skills/encore-questions/SKILL.md` — Phase 3 kill-list "Jira-answerable via Rovo in < 5 min → DROP".
- auto-memory `feedback_self_first_research.md` — chain now self → repo → Rovo/Jira/Confluence → web → Rutvik (MEMORY.md pointer synced).

**Headless-degradation pattern (§1.3)** woven into every touchpoint (`getVisibleJiraProjects` canary; `[ROVO-SKIP]` log; `rovo_available: false`; consume committed crossref file).

### Deviations from the authored plan (every one authorized by the Phase 0.0 gate; every deliverable landed)

1. `HLR-NNN` → **HLR-029**, `AUD-NNN` → **AUD-018** (Dim A — verified next-free vs live high-water marks HLR-028 / AUD-017).
2. Two Context-prose file paths corrected to `clients/encore/docs/…` (Dim A).
3. HEALER edit scoped to FEATURE_CHANGED_BIG + remove-test, cites LR-034 Step 1 for BUG (Dim D TRIM-1 — avoids duplicating LR-034).
4. ADDED: `clients/encore/specs_planning/_internal/field-inventory-spec.md` gains the OPTIONAL `## Jira/Confluence Findings` section so PLANNER Phase 0.75 output is spec-governed (Dim D TRIM-2 — prevents prompt↔spec drift).
5. Acceptance criteria strengthened: concrete per-agent `grep -c` ids; `jira-answerable` tightened criterion; new §14 + field-inventory-spec criteria (Dim E).
6. Phase 2.5 Adjacent-Sweep (DO-NOW): `.claude/rules/baseline.md` (LR-045) truth hierarchy gained the same two-axis intent/render note (prevents the drift this plan would otherwise create); `field-inventory-spec.md` revision-history entry added.

### Verification result

All acceptance criteria pass (see ## Verification). `/regression-guard` before/after = CLEAN — no existing rule-id lost; only REQUIREMENTS `tools:` gained 5 Rovo entries; section-heading counts stable. No tests run (framework-rule edits; no app behavior touched). Downstream: `SUBPLAN_PRODUCTS_00_FOUNDATION.md` inherits working Jira access for its Products walk.
