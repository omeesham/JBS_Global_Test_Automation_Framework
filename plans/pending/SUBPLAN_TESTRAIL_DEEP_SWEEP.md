# SUBPLAN_TESTRAIL_DEEP_SWEEP — other-module gap audit + non-deliverable Notes/MGH reference sweep

> **REBASE NOTE (2026-06-11 · PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT):** the standalone TestRail demo workbook (`encore_test_cases_testrail.xlsx`) and its `scripts/_gen-testrail.ts` converter are **RETIRED** — the single `encore_test_cases.xlsx` now carries the TestRail step-expanded layout directly. Any reference here to the demo/twin workbook is historical; the live TestRail-format output is the merged single deliverable.

**Status**: PENDING
**Priority**: P2
**Created**: 2026-06-05
**Identity**: OWNER
**Parent**: PLAN_TESTRAIL_DEMO_EXCEL_AND_DELIVERABLE_RETITLE.md
**Depends on**: none (parent's deliverable pass is complete; this is the long-tail cleanup)
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**BrowserToolJustification**: n/a — pure grep/MD/doc sweep; gap discovery is header-grep, not live DOM.

---

## Context

The parent plan delivered, on 2026-06-05, the deliverable-only fast path: Notes renumber
(survivors contiguous 001–058), re-ID of the 6 HIST col-69 cases to `TC-LOC-MGH-020..025`,
a standard-conformant retitle of 61 cases, the rebuilt `encore_test_cases.xlsx`, and the
throwaway TestRail demo `encore_test_cases_testrail.xlsx`. Two long-tail items were
**deliberately deferred** to this subplan so delivery stayed fast:

1. **Other 15 modules' ID gaps** were never audited (parent scoped Notes only).
2. **Non-deliverable references** to the renumbered Notes IDs / re-IDed MGH IDs were left
   untouched (parent touched only the deliverable artifacts: MD test-cases, specs, the
   xlsx, blocked-reasons.json, field-case-runner comment).

> **HARD LESSON from the parent (embed in Phase 1):** the parent almost shipped a
> duplicate-ID defect because the Notes "gaps" `028/029/030/031/032/038` were **not
> deletions** — they were live HIST col-69 cases that had been *moved* to the
> management_history sheet while keeping their `TC-LOC-NTS-` prefix. A naive
> "renumber survivors into the gaps" would have collided with those live IDs.
> **A gap in a module's sheet is NOT proof the case was deleted.** Always determine
> WHY each gap exists (deleted vs relocated to another sheet/spec) before renumbering.

## Bootstrap

- **Identity**: OWNER (spans deliverable renumber of non-Notes modules + non-deliverable doc edits; OWNER short-circuits §2 per LR-043).
- **Skills auto-called**: `/identity` (gate), `/execute` (orchestration), `/regression-guard` (wrap), `/final-q` (exit).
- **Context files (read before work)**:
  - `plans/done/PLAN_TESTRAIL_DEMO_EXCEL_AND_DELIVERABLE_RETITLE.md` (parent — Execution Summary has the exact maps used)
  - `.claude/rules/pipeline.md` (LR-020, LR-027, LR-040, LR-046, LR-048, LR-050)
  - `.claude/rules/plan-closure.md` (LR-055 C1–C6)
  - `clients/encore/CLAUDE.md` (LR-ENC-001 baseline truth, LR-ENC-004 deliverable hygiene)
  - `docs/read_only_docs/AGENT_SHARED_RULES.md` (ALL-083: done-plan history is audit trail — do NOT rewrite)
  - `clients/encore/specs_planning/_internal/agent-mistakes.md` (ALL-071 parity, ALL-083)

## Phase 0 — Dependency + browser-tool gate

- Confirm parent is in `plans/done/` with a complete Execution Summary (the renumber/re-ID maps live there).
- BrowserTool = none (declared). No live DOM. If any sub-task is found to need live verification, STOP and re-author (do not silently switch).

## Phase 1 — Other-module gap audit (discovery FIRST, renumber only if safe)

1. For each of the 15 non-Notes modules, grep the MD headers (`## TC-…:`) and list the numeric
   sequence per sub-series. Flag any non-contiguous run.
2. **For every flagged gap, classify the CAUSE before any renumber** (the parent's hard lesson):
   - (a) **Genuine deletion** — the ID exists in NO spec, NO other MD sheet, NO xlsx sheet → a real gap.
   - (b) **Relocated** — the ID is live under a different sheet/spec (like Notes→MGH) → NOT a gap; leave it, or re-ID it to its host module's prefix (the parent's `TC-LOC-MGH-020..025` pattern) only with user sign-off.
   - (c) **Intentional reserved/sub-series** (e.g., `-NE-` negative-enumeration series) → not a defect.
3. Only after classification: renumber survivors for genuine-deletion gaps, using the parent's
   two-phase placeholder technique, across that module's MD + spec + data + blocked-reasons.json,
   and rebuild the xlsx. **If closing a gap would collide with a live ID anywhere → HALT + ask the
   user** (LR-046). Run `npm run check:tc-parity` (exit 0) after each module.

## Phase 2 — Non-deliverable reference sweep (Notes shift + MGH re-ID)

Parent map (from its Execution Summary): `TC-LOC-NTS-028..032/038 → TC-LOC-MGH-020..025`;
`TC-LOC-NTS-033..064 → 028..058`. Update **live** non-deliverable references to the new IDs:

1. `plans/pending/*.md` (active plans) — update stale Notes IDs to new IDs.
2. `reports/bugs/*.json` — open bugs referencing Notes IDs (per LR-044, update `stepsToReproduce`/links).
3. Internal docs: `clients/encore/specs_planning/_internal/{walk-evidence,old-site-baseline,field-inventories,field-case-catalogs}/**`, `catalogs/**`, `agent-mistakes.md`, `docs/REQUIREMENTS.md`, `docs/MODULE_REGISTRY.md`, `.claude/context/navigation.md` registry rows.
4. **DO NOT rewrite `plans/done/*.md`** — per ALL-083 done-plan bodies are frozen audit trail; a stale
   ID there is a historical record, not a defect. (Leave them; note the count in the summary.)

## Phase 3 — Non-deliverable title-reference sweep

Titles are functionally inert (grep/dependencyGate key on ID, never title — verified by parent).
Sweep is **cosmetic only**: update any live internal doc that quotes a now-changed title verbatim
so docs read true. Low priority; done-plans excluded (ALL-083).

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline / REQUIREMENTS.md | `(none)` — no new behavior discovered; observation-only references updated under OWNER | `(none)` |
| GIVER | test-cases MD + xlsx (if a genuine gap is renumbered) | per-module MD edits + `npm run xlsx:build` rebuild (path emitted in Execution Summary at run time) OR `(skipped: no genuine-deletion gaps found in the 15 modules audited)` | `npm run check:tc-parity` exit 0 |
| BUILDER | specs/*.spec.ts (if a gap renumber touches a spec) | spec ID edits in lockstep with MD (path in Execution Summary) OR `(skipped: no spec-affecting renumber required)` | `npx playwright test --list` resolves all IDs |
| HEALER | per-fix MD sync | `(none)` — not RCA-driven | `(none)` |
| WATCHDOG | findings | `(none)` — not an audit subplan | `(none)` |
| GARDENER | non-deliverable doc references | swept reference list (Execution Summary enumerates files changed by class) | `npm run typecheck` clean |

## Acceptance criteria (LR-040 — classify every enumerated item at closure)

- [ ] All 15 non-Notes modules audited for gaps; each gap classified (a)/(b)/(c) with evidence.
- [ ] Genuine-deletion gaps renumbered (or `(skipped: none found)`); `check:tc-parity` exit 0.
- [ ] Live non-deliverable references (pending plans, open bugs, internal docs, navigation registry) updated to the new IDs; per-class file count recorded.
- [ ] `plans/done/*.md` explicitly LEFT unchanged (count recorded; ALL-083 cited).
- [ ] `npm run xlsx:build` + `npm run xlsx:lint` clean if any deliverable was touched.

## Handoff

Chat-only per `feedback_handoff_in_chat_only.md`. Report outcomes (modules audited, gaps found +
classification, references swept by class, done-plans intentionally skipped) with no obstacle claims
(LR-039). If any gap-close would collide with a live ID, HALT and surface to the user (LR-046).
