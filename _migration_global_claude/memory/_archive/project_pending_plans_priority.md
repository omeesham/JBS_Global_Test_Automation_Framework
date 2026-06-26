---
name: Pending Plans Priority Queue
description: Rated priority of 9 remaining pending plans — decontamination DONE (committed f721e15), client delivery P0 next, maintainer sweep needs re-review
type: project
---

## Completed Plans
| Plan | Committed | Notes |
|------|-----------|-------|
| P0_LOCAL_OFFICE_DECONTAMINATION | f721e15 (2026-03-26) | 98 files, moved to plans/done/. Also resolved MAINTAINER_SWEEP SP-01, SP-02, SP-04, SP-09 (collision fixes + barrel exports + LR-017) |

## Pending Plans Priority (updated 2026-03-26)

| Priority | Plan | Status | Effort |
|----------|------|--------|--------|
| P0 | CLIENT_REPO_DELIVERY | Pending — DO FIRST (client-facing, IP leak risk) | Medium |
| P1 | RCA_FULL_RUN_FAILURES | Quick investigation — 7 test failures, likely transient | Small |
| P1 | MAINTAINER_SWEEP | **NEEDS RE-REVIEW** — SP-01/02/04/09 done by decontamination. Only SP-05 (waitForNetworkIdle) + SP-06 (CheckboxState) remain. Plan references stale paths. | Small |
| P2 | CODEBASE_CLEANUP | Cherry-pick Part A (dead files, 30 min) first, defer B5 (22 files). B2 confirmed done. B4 overlaps MAINTAINER SP-06. | Mixed |
| P2 | FULL_CHAIN_AUDIT | Rule registry integrity + 4 code fixes. LR-017 already done. Stale paths need refresh. | Medium |
| P2 | GENERATOR_AUDIT_AUTO_ADDON | 6 rules + 1 code fix (blind toggleCheckbox). Stale paths need refresh. | Small |
| P3 | CHAT_UI_BUGS | 10 bugs, top 3 critical (no feedback, no cancel, wrong status) | Large |
| P3 | VISUAL_DEBUG_SKILL | Agent debugging skill — nice to have, 80% already covered | Medium |
| P4 | BUG_HUNTING_RULEBOOK | 8 subplans, DB migration, all agents — strategic, multi-week | Very Large |

**Why:** Client delivery = revenue. Quick wins (RCA, dead code) = high ROI. Maintainer sweep shrunk dramatically.

**How to apply:** Execute in this order. Maintainer sweep needs path refresh before execution — only 2 items remain. Cherry-pick zero-risk parts of P2 plans.
