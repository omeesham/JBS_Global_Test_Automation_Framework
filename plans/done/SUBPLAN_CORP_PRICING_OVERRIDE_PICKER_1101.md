# SUBPLAN_CORP_PRICING_OVERRIDE_PICKER_1101

**Status**: SUPERSEDED (2026-07-17 — absorbed item-for-item into the six per-ticket plans SUBPLAN_CORP_PRICING_NM2268..NM2273; proof: .claude/state/ua-worker/chips/delegation-temp/out-ticket-split/ABSORPTION-MANIFEST.md)
**Priority**: Low — gated on an external blocker (see below)
**Created**: 2026-07-13
**Identity**: BUILDER
**Parent**: (none — standalone recipient stub)
**Depends on**: filed 1604 import defect (Encore-side fix, not tracked in this repo)
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto

## Context

Parked scope from `plans/done/SUBPLAN_CORP_PRICING_NM2267_OVERRIDE.md` (Execution Summary,
"TCs dropped / dispositioned" section, 2026-07-09): the currency-gated Add-Override picker
(Equipment/Labor drag + double-click, multi-currency-add block) was deliberately deferred rather
than authored, because it needs office 1101 (not the standard 1604/1606 test offices) plus
net-new page-object infrastructure, and is gated behind a filed 1604 import defect on the
Encore side. This stub file is the LR-040(c) grep-verifiable recipient the parent subplan named
at closure time — it did not exist until now, which the closure gate correctly flagged.

## Bootstrap

- **Identity**: BUILDER
- **Skills auto-called**: `/identity`, `/planning` (when this is picked up and fleshed out)
- **Context files**: `plans/done/SUBPLAN_CORP_PRICING_NM2267_OVERRIDE.md` (parent — read the
  "Parked" section + Execution Summary before starting), `clients/encore/CLAUDE.md` (LR-ENC-005
  — office 1101 is the corporate-office master location), root `CLAUDE.md`.

## Phase 0 — Dependency + browser-tool gate

**Blocked** until the filed 1604 import defect is resolved on the Encore side. This is an
external blocker, not an environment flake — per LR-060 obligation 2, this is a legitimate
HALT-and-defer, not an avoidable deferral. Re-check defect status before starting Phase 1.

## Phase 1+ (deferred until unblocked)

When picked up: live Phase 1A walk on office 1101 (per LR-ENC-005 — Commission/Labor-class
corporate-only data lives there, not 1604/1606) covering:
- Currency-gated Add-Override picker: drag-to-add, double-click-to-add
- Equipment vs Labor product-group branching
- Multi-currency-add block behavior

Author page-object + selectors + test-data + specs + test-cases MD + test-plan MD + XLSX rebuild
per the standard FCC parity contract (LR-ENC-002) once the walk is complete.

## Per-Identity Satisfaction

(Not yet applicable — no spec/MD/XLSX work has started. This section will be filled in when the
subplan is picked up and fleshed out past this stub.)

## Acceptance criteria

- [ ] Filed 1604 import defect confirmed resolved (or a working alternative approach found)
- [ ] Phase 1A live walk on office 1101 complete
- [ ] Currency-gated picker (drag + double-click + multi-currency-add) covered by TCs

## Handoff

Chat-only per `feedback_handoff_in_chat_only.md`. This stub exists solely to satisfy the
LR-040(c) named-recipient requirement for the parent subplan's closure — it is genuinely
low-priority and blocked, not being actively worked.
