# PLAN: Master Field-Case Coverage (FCC) Paradigm — All-Modules Strategic Tracker

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-19
**Identity**: OWNER
**Depends on**: none
**Blocks**: per-module FCC subplans (named in §Roadmap below)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none
**Skills**: /execute (children only), /audit, /final-q
**Author**: Rutvik (via Claude Opus 4.7)
**Justification**: master/tracker plan whose body is strategic doctrine + module roadmap; the executable work is delegated to children subplans (Notes is first — see §Roadmap). This file itself is `plan` PermissionMode because its only "work" is reading + emitting other plan filenames; the children carry their own `auto` mode.

---

## 🚦 Status 2026-05-19 — Pilot armed; Notes child is queue position #1.

This master plan is the **doctrine + roadmap** for the framework-wide pivot to **field-level case coverage** (FCC). All execution lives in children subplans. The first executable child is:

- [SUBPLAN_NOTES_FCC_PILOT.md](SUBPLAN_NOTES_FCC_PILOT.md) — paradigm install (one-time, framework-wide) + Notes pilot.

When that subplan closes GREEN, the paradigm is installed for every subsequent module. The master remains open until every module in §Roadmap has its own FCC subplan closed.

---

## Context

The user is pivoting framework testing posture from **form-level saves** (fill many fields, click Save once) to **field-level cases** (every field change is independently saved, refreshed, and verified). Goal: per-case failure isolation — one case failing must not block the next. Mandate phrase: "shiny as fuck" coverage — no case left uncovered for the pilot module.

Cross-references:
- External QA framework guide digested 2026-05-19 ("Architecting Autonomous Quality Assurance: A Comprehensive Framework for Web Field Validation, Test Generation, and Coverage Maximization"). The paradigm doctrine in §Doctrine below is its actionable distillation.
- Existing in-repo coverage: ~90% of the guide is already encoded as bug-archetypes (ARCH-002/005/009/010/013/014) + LR rules (LR-009/010/022/026/051/052/053). The ~10% gap is **per-field-type coverage-generation templates** — captured in the new `field-case-generation.md` taxonomy doc (installed by the Notes subplan, Phase 1).

This is a "restructure plan" per LR-050 (changes the testing paradigm framework-wide). Stale-slop cleanup is enumerated below in §Stale-slop and the bulk is executed by the Notes subplan; the master tracks the remaining strategic items.

---

## Doctrine (the FCC paradigm — applies to every module)

1. **Per-case independence**. Each FCC test = one independent `test()` block. Own baseline, own cleanup, no `dependencyGate(['TC-...'])` chain inside the FCC describe block.
2. **Lifecycle**. Every FCC test runs the same shape: `baseline → act → expectBeforeSave? → save → expectAfterSave? → reload → expectAfterReload → cleanup`. Orchestrated by the single runner `clients/encore/src/core/field-case-runner.ts` `saveAndVerifyCase()`.
3. **Block placement**. FCC `test.describe(...)` block goes at the **TOP** of each module's spec; the existing TCs stay **UNTOUCHED at the BOTTOM**. "Don't ruin already hard work" constraint.
4. **Taxonomy-driven**. Every module's FCC catalog is derived from `clients/encore/specs_planning/_internal/field-case-generation.md` §2 per-field-type templates. New field types → append a row to the taxonomy doc + grow the catalog.
5. **3-tier save verification** (per taxonomy §1):
   - Tier 1 (mandatory): UI reload + DOM read of persisted value (always done today).
   - Tier 2 (recommended, partial): network 2xx + response payload structure check (today's `clickSaveWithDialog` catches errors but doesn't structurally validate payload — FCC follow-up).
   - Tier 3 (future): direct DB query — out of current framework scope; aspirational.
6. **Anti-patterns** (binding):
   - LR-051: no `.toBe(true)` on OR-expressions in FCC asserts.
   - LR-052: no fixed `waitForTimeout` inside polling loops.
   - LR-053: no strict row-count assertions where placeholder bugs are documented (e.g. BUG-LOC-NTS-003).
   - LR-022: no hardcoded structural counts as assertions.

---

## Roadmap (children subplans)

### Pilot
- [SUBPLAN_NOTES_FCC_PILOT.md](SUBPLAN_NOTES_FCC_PILOT.md) — **P0-EMERGENCY, ready, queue position #1**. Includes paradigm install (Phase 1, one-time) + Notes pilot (Phases 2–7). 32 net-new FCC tests for Notes.

### User-owned (not authored or executed from this master)
- **SSL (Shared Setup Locations)** — owner runs in a separate session. Reuses the paradigm + taxonomy installed by the Notes subplan. Existing 24 SSL TCs preserved at BOTTOM of spec; net-new FCC block at TOP. **Do NOT author a subplan for SSL from this master** — user-owned, hands off.

### Future per-module subplans (named for parent-cascade closure, not yet authored)

Authored AFTER Notes subplan closes GREEN and SSL is delivered by user. One subplan per module, each ~200–400 lines using the paradigm. Files will be created with this exact naming (so parent-cascade per LR-027 finds them):

- `SUBPLAN_LOCAL_INFORMATION_FCC.md`
- `SUBPLAN_CURRENCY_FCC.md`
- `SUBPLAN_PRICING_FCC.md`
- `SUBPLAN_ACCOUNT_ADDRESS_FCC.md`
- `SUBPLAN_LEGAL_FCC.md`
- `SUBPLAN_AUTO_ADDON_FCC.md`
- `SUBPLAN_LOCAL_OFFICE_BASIC_INFO_FCC.md`
- `SUBPLAN_ECT_SETTINGS_FCC.md`
- `SUBPLAN_HIST_PER_COLUMN_FCC.md` (covers Location Management History spec restructure if needed)

Each future subplan inherits the paradigm — no re-installing the runner, taxonomy, or agent prompt sections. Each does only: HUNTER baseline freshness → GIVER catalog + TCs → BUILDER spec FCC block + page-object helpers + data → WATCHDOG completeness audit → GARDENER sweep → OWNER closure.

### DQU pause

`PLAN_DQU_V6.md` + every `SUBPLAN_DQU_*` currently in `plans/pending/` is **paused** until every module in §Roadmap has its FCC subplan closed. Re-evaluate DQU scope after the FCC sweep completes — quality+quantity goals overlap heavily with FCC findings; some DQU subplans may be subsumed.

Pause mechanism: no new edits to DQU subplans; no `/execute` of DQU subplans; INDEX.md priority unchanged (DQU subplans remain visible but blocked by this paradigm-shift directive). When the FCC sweep closes, OWNER triages each remaining DQU subplan: subsume / keep / drop.

---

## Strategic sequencing (one-paragraph summary for context-loaded agents)

Notes ships first as the pilot; SSL ships next via the user's separate session; then every other module gets its own FCC subplan (one per module, see §Roadmap); DQU resumes only after every module is FCC-covered. The runner, taxonomy doc, and agent prompt updates installed by the Notes subplan are framework-wide one-time work — they persist across all future module subplans without re-installation.

---

## Stale-slop cleanup (LR-050)

Cleanup enumerated and **assigned to the Notes subplan** (executed there, not re-listed in future module subplans):

1. **Field-inventory testid drift** (`notes-2026-05-11.md` claims 3 fields have no testid; selectors file shows they do) — assigned to Notes subplan Phase 3.
2. **CLAUDE.md @-refs missing the taxonomy doc row** — assigned to Notes subplan Phase 1.2.
3. **AGENT_SHARED_RULES.md §2 missing `field-case-catalogs/` ownership row** — assigned to Notes subplan Phase 1.3.
4. **6 agent prompts (REQUIREMENTS / PLANNER / GENERATOR / HEALER / AUDIT / MAINTAINER) lack FCC Paradigm section** — assigned to Notes subplan Phase 1.4 + sync 1.5.
5. **No `src/core/field-case-runner.ts`** — assigned to Notes subplan Phase 4.1.
6. **No `field-case-catalogs/` directory** — created by Notes subplan Phase 3.1.
7. **No FCC TC namespace in any test-cases markdown** — Notes adds the first instance Phase 3.2; other modules follow per their own subplans.

Out-of-scope (deferred to named follow-up plans, NOT this master's cascade):

- **BUG-LOC-NTS-002 dialog "Ok" vs "Save"** page-scoped selector helper — escalation filed by the Notes subplan in `agent-escalations.json` Phase 3.4. If escalation results in real spec failures, follow-up plan `PLAN_LOC_SETTINGS_OK_DIALOG_HELPER.md` will be authored separately.
- **Identity skill table stale path reference** (`.github/agents/playwright-*.agent.md` vs actual `.claude/agents/*.md`) — pre-existing drift unrelated to FCC.
- **`field-case-runner.ts` promotion** to root `src/` when 2nd client lands — taxonomy §4 promotion criterion.

---

## Acceptance criteria (master-level — closes when ALL true)

- [ ] Notes subplan closed GREEN with all 32 FCC tests passing + 37 existing main TCs unchanged + 5 HIST TCs unchanged.
- [ ] SSL FCC coverage shipped by user (separate session; visible as a closed subplan or as documentation that SSL FCC landed).
- [ ] Every module in §Roadmap "Future per-module subplans" has a subplan in `plans/done/`.
- [ ] DQU triage decision recorded (per remaining DQU subplan: subsumed / kept / dropped) in a follow-up plan or in this master's Execution Summary.
- [ ] `/regression-guard` snapshot before/after = no silent breakage in framework-wide artifacts touched by paradigm install.
- [ ] Activity-log row appended per LR-028 for each child subplan closure.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042 at master closure.

---

## Verification (runnable from any future session)

```bash
# Confirm paradigm doc exists
ls clients/encore/specs_planning/_internal/field-case-generation.md  # expect: file present

# Confirm runner exists and has the saveAndVerifyCase export
grep -n "export async function saveAndVerifyCase" clients/encore/src/core/field-case-runner.ts  # expect: 1 hit

# Confirm 6 agent prompts have the FCC Paradigm section
grep -l "## FCC Paradigm" .claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md  # expect: 6 paths

# Confirm CLAUDE.md @-ref row
grep -n "field-case-generation.md" CLAUDE.md  # expect: 1+ hits

# Confirm field-case-catalogs directory exists with at least the Notes catalog
ls clients/encore/specs_planning/_internal/field-case-catalogs/  # expect: notes-2026-05-19.md (plus future modules)

# Confirm Notes spec has the FCC describe block at TOP
grep -n "Location Notes — FCC" clients/encore/tests/specs/setup/locations/location-notes.spec.ts  # expect: line number < existing 'Location Notes @locations @notes' line
```

---

## Handoff (chat-only per feedback_handoff_in_chat_only.md)

This master plan governs the FCC paradigm rollout across all modules. The Notes subplan (queue position #1) is the executable that installs the paradigm and ships the Notes pilot. SSL is user-owned. Every other module gets a future subplan per §Roadmap naming. DQU is paused until the FCC sweep completes. Closure of this master happens when every module's FCC subplan is in `plans/done/` and DQU has been triaged.
