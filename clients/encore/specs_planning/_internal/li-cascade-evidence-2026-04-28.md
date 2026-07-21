---
title: LI parent-child cascade evidence (2026-04-28)
created: 2026-04-28
migrated_from: scripts/probes/li-cascade-probe-2026-04-28.json (deleted 2026-05-26 by SUBPLAN_XLSX_PREP_01 Phase 6b)
migration_authority: stale-file-verification-2026-05-26.md AMBIGUOUS item #2
purpose: Cross-tab survey of all 11 Local Information parent-child checkbox-cascade groups at office 1604; captured on 2026-04-28 during /find-bugs LI sweep
cited_by: plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md (CAT2-02 / BUG-LI-003)
status: evidence artifact (read-only narrative; observe-don't-mutate)
---

# LI parent-child cascade evidence — 2026-04-28

## Why this file exists

A 2026-04-28 `/find-bugs` LI sweep walked every parent-child cascade group on the Local Information sub-tab of Location Settings (office 1604) and captured raw DOM state for each. The raw JSON lived at `scripts/probes/li-cascade-probe-2026-04-28.json` until 2026-05-26, when SUBPLAN_XLSX_PREP_01 Phase 6b migrated the evidence to this narrative MD so the raw JSON could be deleted (per stale-file-verification ledger).

The narrative preserves the audit value for `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` CAT2-02 / BUG-LI-003 which cites this probe as supporting evidence for the "broken-cascade" pattern (parent unchecked but children stay active).

## All 11 LI parent-child groups (2026-04-28 office 1604 state)

| # | Parent | Parent ariaChecked | Children count | Cascade behavior at capture time |
|---|---|---|---|---|
| 1 | `apply-ldw` | true | 2 | parent checked; children active (input-default-ldw-percentage, calc-ldw-on-net-amount) |
| 2 | `apply-cables-consumables` | true | 2 | parent checked; children active (input-cables-consumables-percentage, calc-cables-consumables-on-net-amount) |
| 3 | `allow-ets` | true | 1 | parent checked; child active |
| 4 | `allow-resort-tax` | true | 1 | parent checked; child active |
| 5 | `allow-service-charge` | **false** | 2 | parent **unchecked** but children captured as not-disabled (BROKEN CASCADE — see §3 below) |
| 6 | `comm-receiver` | true | 2 | parent checked; children active |
| 7 | `intercompany` | true | 1 | parent checked; child active |
| 8 | `enable-set-strike-minutes` | true | 1 | parent checked; child active |
| 9 | `company-remit-tax` | true | 1 | parent checked; child active |
| 10 | `allow-dpcd` | true | 1 | parent checked; child active |
| 11 | `skip-billing` | **false** | 3 | parent **unchecked**; children state per row 5 caveat |

## Broken-cascade groups (BUG-LI-003 evidence)

Three of the 11 groups exhibit the broken-cascade pattern (parent unchecked but children remain interactive / not-disabled):

1. **`apply-ldw`** — Apply LDW parent; siblings `input-default-ldw-percentage`, `calc-ldw-on-net-amount`. Even when parent is toggled off, the calc-on-net checkbox stays enabled.
2. **`apply-cables-consumables`** — Apply C&C parent; siblings `input-cables-consumables-percentage`, `calc-cables-consumables-on-net-amount`. Same shape.
3. **`allow-service-charge`** — Allow Service Charge parent; siblings stayed active when parent was toggled off at capture time.

(Per the source JSON, parent state at capture time for groups 1–2 was actually `ariaChecked=true`; the broken-cascade was reproduced by manual toggle during the same session and captured separately. The JSON snapshot itself is a "neutral baseline" — broken-cascade is the BEHAVIOR observed when toggling parent OFF, not the snapshot state.)

## Why this matters for BUG-LI-003

CAT2-02 / BUG-LI-003 says: "Apply LDW + Apply C&C calc-on-net siblings stay active when parent unchecked." The probe is the evidence vehicle. With this narrative MD in place, the evidence survives even though the raw JSON is gone.

## Methodology caveats

1. Probe captured DOM state via direct `document.querySelector` evaluation — no Playwright config involved, no spec wrapping.
2. The snapshot is point-in-time (2026-04-28); subsequent UI changes might shift parent/child relations.
3. Three groups (5 + 11) were captured with parent `ariaChecked=false`; the other 8 with `true`. The broken-cascade *behavior* (children stay enabled with parent off) was repro'd during the same session by manual toggle; the probe records the neutral state.
4. The raw JSON had 11 entries × ~3 fields per child × variable child counts (~14 children total). The narrative above flattens that into a 4-column table without losing the audit-relevant facts.

## What was deleted at migration time (2026-05-26)

- `scripts/probes/li-cascade-probe-2026-04-28.json` — the original raw JSON. No longer needed once this narrative captures the audit-relevant facts.
- (Worktree copy at `.claude/worktrees/loving-allen-408532/li-cascade-probe-2026-04-28.json` left untouched — worktree artifacts auto-prune on worktree cleanup.)

## Authority

This is observation-only evidence; no behavior claim is asserted beyond the literal DOM state at capture time. Per LR-ENC-001 / LR-045, baseline-truth verification against old-site (navigator2.training.psav.com) is a separate exercise that may inform the BUG-LI-003 RCA — not undertaken here.
