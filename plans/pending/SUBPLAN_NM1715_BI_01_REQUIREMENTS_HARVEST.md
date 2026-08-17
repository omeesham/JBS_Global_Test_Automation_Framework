# SUBPLAN_NM1715_BI_01_REQUIREMENTS_HARVEST — write down, for the first time, what Basic Information is actually supposed to do

**Status**: PENDING
**Priority**: P0
**Created**: 2026-08-13
**Identity**: HUNTER
**Parent**: PLAN_NM1715_LOC_BASIC_INFO_COVERAGE.md
**Depends on**: none
**Blocks**: SUBPLAN_NM1715_BI_02_FIELD_DENOMINATOR.md
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**CoverageMode**: quick
**CompactionBudget**: ~1

---

## Context

NM-1715 ("Automate Local Office --> Basic Information") is a one-line story: *Tool: Playwright ·
Scope: Field Validation, save · Environments: E2E · Outcome: Included in regression suite*. No
acceptance criteria, no comments, no linked issues. It tells us to automate, not what correct looks
like.

The requirements exist — in Jira, not in this repo. **NM-956 "UI: Local Office Settings — Basic
Information Validations"** (Done, 2026-08-05) is the validations spec. Nothing local cites it.

This subplan closes that gap before anyone walks a page or writes a test case, so every downstream
test case can name the requirement it enforces instead of encoding whatever the app happened to do
on the day it was observed.

It also repairs a defect in the 2026-08-13 repo census
(the nm1715 inventory worker chip output, local ua-worker state and not tracked). That census built its denominator
from a **filename** regex (`location|local.?office|basic.?info`), so any artifact named for its
concern rather than its module was invisible to it. That is how it missed
`field-case-catalogs/launcher-dialogs-2026-06-11.md` — a catalog about this exact sub-module's Pay To
Address launcher — and how it wrongly reported the field-case-catalog as missing when
`left-panel-basic-information-2026-06-03.md` is on disk. Its `## STALENESS` broken-ref section is
unreliable and must not be inherited.

---

## Bootstrap

**Identity**: HUNTER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/relevant` (Phase 0.5 injection)
- `/regression-guard` (wrap — before + after)
- `/final-q` (Phase 4 exit, LR-042)

**Context files**:
- `plans/pending/PLAN_NM1715_LOC_BASIC_INFO_COVERAGE.md` (parent)
- `.claude/rules/pipeline.md` · `.claude/rules/inventory.md` · `.claude/rules/baseline.md`
- `clients/encore/CLAUDE.md` (LR-ENC-001, LR-ENC-004 Jira-first, LR-ENC-005 office 1101 vs 1604)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-063 self-help research mandate)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`

**Anti-Assumption Gates**:
- [ ] Gate 4 — no env-rationalized deferral of env-independent work. This subplan touches no browser; nothing here is env-blockable.
- [ ] Gate 6 — all phases complete or a user-signed `## Deferral Authorization` recorded.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. `Depends on: none` — proceed.
2. Read `.claude/context/navigation.md` Exploration Registry for Locations / Local Office; pull findings rather than re-exploring.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md`, filtered to `REQ-*` / `ALL-*`.
4. Read `.claude/context/patterns.md` for matching decision-tree patterns.
5. LR scan — LR-ENC-004, LR-063, LR-062, LR-035.
6. **Browser-tool announcement**: `BrowserTool=none` — this subplan reads Jira/Confluence and the repo. No live site.

---

## Phase 0.5b — Baseline-first walk

**Not applicable.** This subplan performs no behavior classification, files no bugs, and corrects no
test cases — it only gathers written requirements and enumerates artifacts. The baseline walk is
owned by `SUBPLAN_NM1715_BI_03_OLDSITE_BASELINE.md`. Declared explicitly per LR-048 §5 rather than
deleted silently.

---

## Phase 1 — Jira / Confluence harvest (LR-ENC-004, LR-063)

1. Pull **NM-956** in full — description, comments, attachments, linked issues. This is the anchor.
2. Pull the supporting set, each in full:
   | Key | Why it matters here |
   |---|---|
   | NM-977 | Location Settings — confirmation modal for unsaved changes |
   | NM-3358 | QA defect — unsaved-changes dialog not displayed on navigation |
   | NM-980 | `canEdit` permission handling across all location settings children |
   | NM-1090 | Sync all tab data + validate all rules on **each save** (cross-tab) |
   | NM-1146 | Billing cycle disabled + info tooltip driven by API response |
   | NM-933 | Account List lookup displayed on clicking Name (launcher affordance) |
   | NM-845 | "Pay To Address" retrieval strategy |
   | NM-1455 | `GetLocationPayToList` API integration in Location Details — Pay To Address |
   | NM-3133 | Local Office Settings — default Labor Type values for new location creation |
   | NM-3322 | Active/inactive locations in the Location lookup modal + filtering |
   | NM-1481 | Spike — Admin Location Settings and Bulk Edit |
3. **Paginate past 50.** The dispatcher's scan used `maxResults: 50` and returned exactly 50 — the
   cap was hit, so the result set is truncated by construction. Re-run with pagination until
   `nextPageToken` is absent. Report the true total.
4. Search Confluence for Basic Information / Location Settings specifications.
5. Record every stated requirement as one row: requirement text, Jira key, status, and whether it is
   a durable product rule or a one-off defect note.

**Output**: `clients/encore/specs_planning/_internal/requirements-nm1715-basic-information-2026-08-13.md`

---

## Phase 2 — Content-based artifact sweep (repairs the census defect)

1. Build the denominator with `git ls-files` — it works on this path (2,192 tracked files). This is
   the LR-062 machine denominator; a model-judged list is not acceptable.
2. Grep **content**, not filenames:
   `left-panel-basic-information|TC-LOC-LP|Pay To|payToId|basic information|launcher`
3. Produce a corrected artifact table that **must** include, at minimum:
   - `clients/encore/specs_planning/_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md`
   - `clients/encore/specs_planning/_internal/field-case-catalogs/left-panel-basic-information-2026-06-03.md`
   - every false-green-sweep, RCA, and walk-evidence file that mentions this module
4. For each of the census's four claimed broken refs, state VERIFIED-MISSING or FALSE-ALARM with the
   check that settled it.

---

## Phase 3 — Fold durable requirements into the record

The requirements of record live at **`clients/encore/docs/REQUIREMENTS.md`** (verified 2026-08-13 —
under `docs/`, *not* `specs_planning/`). Add every durable NM-956 product rule there with its Jira
key. The `_internal/requirements-nm1715-*.md` file is the working harvest; `docs/REQUIREMENTS.md` is
the record. Do not create a second source of truth.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For each adjacent fix noticed in Phase 1–3 that is same-identity + same-module + 5–30 min + needs no
user input, pick exactly one: **DO-NOW**, **SPAWN** (`mcp__ccd_session__spawn_task`), or **APPEND**
(named pending subplan + `grep -F` verification). Bare "out of scope" = HALT + ask (LR-040 / LR-046).

---

## Per-Identity Satisfaction

Dated cells are refreshed to the actual emission date at closure (C6).

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | requirements harvest + REQUIREMENTS.md fold | `clients/encore/specs_planning/_internal/requirements-nm1715-basic-information-2026-08-13.md`<br>`clients/encore/docs/REQUIREMENTS.md` | `grep -c "NM-[0-9]" clients/encore/specs_planning/_internal/requirements-nm1715-basic-information-2026-08-13.md` exit > 0 |
| GIVER | (none) | `(none)` | — |
| BUILDER | (none) | `(none)` | — |
| WATCHDOG | (none) | `(none)` | — |
| HEALER | (none) | `(none)` | — |
| GARDENER | (none) | `(none)` | — |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] `requirements-nm1715-basic-information-2026-08-13.md` exists with ≥1 row per harvested ticket, every row carrying a Jira key.
- [ ] True Jira result count reported, with proof pagination ran past the 50 cap.
- [ ] Corrected artifact table includes `launcher-dialogs-2026-06-11.md` and `left-panel-basic-information-2026-06-03.md`.
- [ ] All four census broken-ref claims marked VERIFIED-MISSING or FALSE-ALARM with evidence.
- [ ] `git ls-files` count stated as the denominator.
- [ ] Every durable NM-956 requirement present in `clients/encore/docs/REQUIREMENTS.md` with its key.
- [ ] `/regression-guard` before/after — no silent breakage.
- [ ] Activity-log row per LR-028, timestamp ≥ all touched-file mtimes (LR-037).
- [ ] `/final-q` verdict emitted per LR-042.

---

## Verification

```bash
# Requirements harvest exists and every row cites a Jira key
grep -c "NM-[0-9]" clients/encore/specs_planning/_internal/requirements-nm1715-basic-information-2026-08-13.md

# The catalog the census missed is now accounted for
grep -c "launcher-dialogs-2026-06-11" clients/encore/specs_planning/_internal/requirements-nm1715-basic-information-2026-08-13.md

# NM-956 landed in the record, not just the harvest
grep -c "NM-956" clients/encore/docs/REQUIREMENTS.md
```

---

## Handoff (post-execution)

The module's requirements exist locally for the first time, each traceable to a Jira key, and the
artifact picture is rebuilt from file content rather than filenames so concern-named work is no
longer invisible. `SUBPLAN_NM1715_BI_02_FIELD_DENOMINATOR.md` inherits the requirement rows to check
the live page against, and the corrected artifact table to avoid re-walking ground prior sessions
already covered.
