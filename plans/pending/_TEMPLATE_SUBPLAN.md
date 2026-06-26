# SUBPLAN_<INITIATIVE>_<NN>_<PHASE> — <one-line goal>

<!--
  CANONICAL SUBPLAN SKELETON. Status TEMPLATE-DRAFT keeps it in plans/pending/ but
  out of the dependency-sort buckets. To author a new subplan:

    1. cp plans/pending/_TEMPLATE_SUBPLAN.md plans/pending/SUBPLAN_<NAME>.md
    2. Drop the leading underscore from the filename.
    3. Flip Status from TEMPLATE-DRAFT to PENDING (or GATED).
    4. Replace every <placeholder> below.
    5. Delete sections that don't apply. The ONLY skip-allowed sections are
       Phase 0.5b and Parent:. Parent: is dropped only for a top-level PLAN_*.md.
       Phase 0.5b may be dropped ONLY for a genuine net-new feature with no
       baseline — and even then NOT silently: declare `baselineScope:
       baseline-absent` in the subplan (per LR-ENC-001). If the subplan drives
       TC corrections or files bugs, Phase 0.5b is NON-DELETABLE (Anti-Assumption
       Gate 1; PLAN_BIG_PIVOT_FCC_MASTER.md §Anti-Assumption Gates).
    6. Run: node scripts/check-subplan-identity.mjs plans/pending/<your-file>.md
       (Phase 0.1 cross-check; HALT if violations are reported.)

  All 8 sections (Title/Frontmatter, Context, Bootstrap, Phase 0, Phase 0.5b
  conditional, Phase 1+, Acceptance, Handoff) are mandated by LR-048 in
  .claude/rules/pipeline.md. Do not delete sections silently.
-->

**Status**: TEMPLATE-DRAFT
**Priority**: P0 | P1 | P2 | P3
**Created**: <YYYY-MM-DD>
**Identity**: HUNTER | GIVER | BUILDER | HEALER | WATCHDOG | GARDENER | OWNER
**Parent**: <PARENT_PLAN_FILENAME>.md  <!-- subplans only; delete for top-level PLAN_*.md -->
**Depends on**: <predecessor subplan filename(s)>, or `none`
**Blocks**: <subplan filename(s) that wait on this>, or `none`
**Model**: claude-opus-4-8 | claude-sonnet-4-6
**Thinking**: mid | hi | xhi | max  <!-- LR-041: forbidden combos rejected -->
**PermissionMode**: auto | plan | acceptEdits | bypassPermissions  <!-- bypassPermissions requires RiskAcknowledged: true -->
**RiskAcknowledged**: <true | n/a>
**BrowserTool**: cli | chrome | both | none  <!-- LR-038 v2 — per .claude/rules/browser-tool.md -->
**BrowserToolJustification**: <one-line>  <!-- only when BrowserTool=both -->
**Justification**: <one-line>  <!-- LR-041: required for Sonnet=mid OR Opus=max; delete otherwise -->

---

## Context

<Why does this subplan exist? Two-to-five sentences. Provenance line if revived/superseded.>

<If revived from a prior plan: "Revived from plans/done/<old>.md (closed YYYY-MM-DD); reopened because <reason>.">
<If superseded: "Supersedes <old>.md; differences: <list>.">

---

## Bootstrap

**Identity**: <CODENAME — must match Identity frontmatter above>

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/final-q` (Phase 4 — mandatory exit per LR-042)
- <other relevant skills, e.g. /audit, /find-bugs, /bugfix>

**Context files** (every rule + parent + reference this subplan loads):
- `<Parent plan path if any>`
- `.claude/rules/<topic>.md` <!-- list every path-scoped rule that auto-loads on this subplan's edits -->
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)
- `clients/${ACTIVE_CLIENT}/CLAUDE.md` <!-- if client-specific work -->

**Anti-Assumption Gates** (binding for FCC + any TC-correcting / bug-filing subplan — per `PLAN_BIG_PIVOT_FCC_MASTER.md` §Anti-Assumption Gates):
- [ ] Phase 0.5b baseline walk EXECUTED before any behavior classification / bug filing (Gate 1 — LR-045 / LR-ENC-001 / LR-048 §5).
- [ ] No "corrupt / atypical / app-wide / regression" claim on <2 evidence sources — 2 offices OR new-site+baseline (Gate 2 — LR-061).
- [ ] No control marked un-drivable without overlay-clear + reload + PO-selector-vs-live-DOM diff + DOM-inspect (Gate 3 — LR-061 / LR-021).
- [ ] No env-rationalized deferral of env-independent work; env defers only the env-blocked step (Gate 4 — LR-060).
- [ ] Un-skip + LR-019 harden applied atomically in the same change (Gate 5 — LR-021 corollary).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block recorded — no silent PENDING checkpoint (Gate 6 — LR-060).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on:` plans are all in `plans/done/` (or `none`).
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for this surface; pull listed findings instead of re-exploring.
3. Read `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` — filter by your identity prefix (HUNTER → REQ-* / ALL-*; GIVER → PLN-* / ALL-*; etc.).
4. Read `.claude/context/patterns.md` — match decision-tree patterns to your subtasks.
5. LR scan — every active LR rule whose Trigger fires for this subplan's work.
6. **Browser-tool announcement** (LR-038 v2): emit one line declaring `BrowserTool=<cli|chrome|both|none>` and the reason. Required when the subplan touches a live website.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — REQUIRED when ANY of)

<!--
  KEEP IT (and fill it in) when ANY of these match:
    - Identity = WATCHDOG
    - Skills (above) include /find-bugs
    - Title contains "audit", "neutral-eye", "find-bugs", or "module audit"
    - Subplan output drives TC corrections in test-cases/ or test-plans/
    - Subplan files or reclassifies any reports/bugs/BUG-*.json

  NON-DELETABLE in all the above (Anti-Assumption Gate 1, LR-045/LR-ENC-001/LR-048 §5):
  this section must EXECUTE, not just exist at authoring time. It may be dropped ONLY
  for a genuine net-new feature with no baseline — and then NOT silently: declare
  `baselineScope: baseline-absent` per LR-ENC-001 (NOT a HALT). Skipping a required
  baseline walk and recording observed states as fact is the exact 2026-06-18 Pricing
  fuckup this gate prevents.
-->

1. Visit baseline truth source first per `.claude/rules/baseline.md` workflow row 4.
2. Emit or refresh `clients/${ACTIVE_CLIENT}/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md` if missing or stale (>14 days old per LR-013 spot-check).
3. Visit new site, classify every observed-vs-baseline divergence as:
   - (a) regression-from-baseline,
   - (b) intentional UX change (cite REQUIREMENTS.md / Jira),
   - (c) baseline-absent (record `baselineScope: baseline-absent` per LR-ENC-001 — NOT a HALT).
4. Bug filings carry `baselineComparison` + `baselineEvidence` per LR-034 (every BUG-*.json under `reports/bugs/` auto-loads `baseline.md` per its path-scope).
5. Produce a `## Baseline diff` section in the findings doc.

---

## Phase 1+ — Actual work (identity-scoped)

<!-- Decompose into atomic, verifiable steps. One bullet per logical change. -->

1. <step>
2. <step>
3. <step>
...

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix you noticed during Phase 1+ that is (same identity) + (same file/module) + (5–30 min) + (no user input needed), pick exactly one:

- **DO-NOW** — execute it before Phase 3 closure.
- **SPAWN** — `mcp__ccd_session__spawn_task` with self-contained prompt + acceptance criteria.
- **APPEND** — edit a named pending subplan to add a grep-verifiable line item; verify with `grep -F "<the line>" plans/pending/<file>` before continuing.

Bare "out of scope" / "flagged for follow-up" with no recipient = HALT + ask user (per LR-040 + LR-046).

---

## Acceptance criteria (LR-040 closure gate)

<!--
  For catalog/MCP-driven subplans (LR-040 trigger: SP-B-*, SP-C-*, SP-D-*, or
  any subplan whose Step-by-Step enumerates parents / columns / TCs):
  classify EVERY enumerated item as (a) MCP-proven, (b) inference-classified
  with a grep-verifiable line item in a named recipient subplan, or (c)
  user-flagged with a named bug-ID / discussion-item flag.
  Non-catalog subplans use ordinary checkbox criteria.
-->

- [ ] <criterion 1>
- [ ] <criterion 2>
- [ ] (If this subplan drives a field-inventory / baseline walk) Coverage Manifest present: machine-enumerated via scripts/walk-coverage/enumerate-page.mjs, every union element dispositioned, CrossCheck: clean, Coverage_Ratio 100% (LR-062 / closure Cx).
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

<!-- Runnable checks the next session can re-run to confirm completion. -->

```bash
# <one-line description>
<bash command>  # expect: <output>
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md`. Describes outcomes per LR-039 (no obstacle claims; never name a specific failure mode in this section).

<one-paragraph outcome description: what landed, what closes, what the next subplan in the chain inherits>
