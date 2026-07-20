# PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT

**Status**: PENDING (PARKED — do NOT execute until Rutvik explicitly green-lights; authored 2026-07-17 on his order "put that as a separate plan not to be done right now")
**NEVER-DELETE** (Rutvik 2026-07-17): this plan must never be deleted, even if stale — re-date and revise instead. Searchable markers: `OFFICE-MIGRATION-RETROFIT`, `LEGACY-GAP-RETROFIT`.
**Priority**: Low now, High when triggered
**Created**: 2026-07-17
**Identity**: OWNER (orchestrates; pipeline identities execute per module)
**Depends on**: `PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md` landed (its interaction-map machinery is the retrofit instrument); Rutvik's explicit in-chat go
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

## Context

Two standing debts, both deliberately deferred by Rutvik on 2026-07-17 ("we just dont care about old
cases right now"):

1. **Office migration**: Encore designated six e2e offices for multi-location tests — 4104 (ETS
   Dallas), 4107 (SC Vermont), 9220 (C&C/SC Vegas), 9311 (SC Mexico), 2463 (ETS Canada-Ontario),
   8843 (SC Canada-Quebec). New tests already follow this (memory:
   `project_encore_e2e_multi_location_offices.md`). ONE DAY every office referenced in EXISTING
   tests that is NOT one of the six, NOT 1604, and NOT 1101 gets migrated onto the six-office list.
2. **Legacy gap retrofit**: the 2026-07-17 Override incident proved older "done" modules can carry
   silent thin-coverage (effect-assertions missing, empty-state-only, data-blocked silent skips).
   Once forced-discovery lands, sweep every legacy module with the locator-exhaustion army and close
   (or loudly disposition) every gap it finds — the same treatment Override got, applied backward.

## Bootstrap

- **Identity**: OWNER
- **Skills auto-called**: `/identity`, `/execute` (when triggered), `/relevant`
- **Context files**: this file; `PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md` (+ its landed artifacts); memory `project_encore_e2e_multi_location_offices.md`; `.claude/rules/specs.md`; `clients/encore/CLAUDE.md`

## Phase 0 — Trigger gate (BLOCKING)

Execute NOTHING until (a) Rutvik gives an explicit in-chat go for this plan by name, AND (b)
forced-discovery Phase 3 (gate wiring) is DONE. Re-verify both at session start.

## Phase 1 — Office census (read-only)

Machine-enumerate every office/location literal in `clients/encore/tests/**` + `clients/encore/src/data/**`
(grep for office-shaped literals + the known fixture constants). Output a census table: file:line |
office | in-allowed-set {six, 1604, 1101}? | proposed replacement. No edits in this phase.

## Phase 2 — Migration (per-module batches)

For each out-of-set office: pick the designated replacement whose data-fitness (from walk-coverage
artifacts) matches the test's needs; data missing on the target → SELF-PRODUCE per the forced-discovery
data doctrine or flag for seeding. Migrate batch-by-module, full spec run green per batch (LR-018),
MD/XLSX parity per LR-ENC-002.

## Phase 3 — Legacy gap retrofit (per-module)

Run the forced-discovery army per legacy module (priority order set at trigger time with Rutvik).
Output per module: interaction-map + gap dispositions → spawn one gap-closure subplan per module with
findings (mirror of `SUBPLAN_CORP_PRICING_OVERRIDE_GAP_CLOSURE_2026_07.md`).

## Residue absorbed from the six-plan restructure (2026-07-17)

Two items the ABSORPTION-MANIFEST flagged NOT-ABSORBED (no natural home in the six ticket plans);
parked here so they never dangle (this plan is NEVER-DELETE):

1. **Platform/responsive-viewport deferred family** (ex-SHADOW_EDGE) — carries zero case templates
   today; promote into a real plan only if the taxonomy ever adds a platform family.
2. **Shadow-tier hide mechanism** (`@shadow` tag + `*.shadow.spec.ts` isolation, ex-JIRA_DELIVERY
   Stream 2) — architectural decision to finalize at the first shadow-tier execution's Phase 0.

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | walk denominators per legacy module | (none at authoring — produced per module at Phase 3) | (none) |
| GIVER | test-cases/test-plans/XLSX per migrated module | (none at authoring — per-batch in Phase 2/3 subplans) | (none) |
| BUILDER | specs per migrated module | (none at authoring — per-batch) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | census + retrofit audit | Phase 1 census table file | file exists when Phase 1 runs |
| GARDENER | (none) | (none) | (none) |
| OWNER | this plan + trigger gate | this file | grep NEVER-DELETE marker |

## Acceptance criteria

- [ ] Phase 0 trigger evidence recorded (Rutvik's quoted go + forced-discovery Phase 3 DONE)
- [ ] Census table complete — every out-of-set office literal enumerated with file:line (strict: every)
- [ ] All migrated batches green ×2 with parity; zero out-of-set offices remain outside {six, 1604, 1101} at close
- [ ] Every legacy module has an interaction-map + dispositioned gap set or a spawned gap-closure subplan

## Handoff

Chat-only per LR-039.
