---
name: SSL spec fix handoff
description: PLAN_AUDIT_SHARED_SETUP execution state — test data fixed, 3 tasks remaining. Resume point for next session.
type: project
---

## SSL Spec Fix — COMPLETED (2026-04-07)

**Summary**: Sonnet executed PLAN_AUDIT_SHARED_SETUP. Opus fixed all failures and completed docs.

**Key fixes applied by Opus**:
1. **Location ghost pattern** — 1099 and 990001 both permanently ghosted in dialog after save+delete. Root cause: app bug where delete+save doesn't clear server-side dialog exclusion list. Fix: TC-011/TC-012 use 990002 (never saved). TC-018..TC-024 use name search "Miami" with dynamic capture (ghost-proof — pool of ~69 locations).
2. **Sort-order assumption** — all code assumed self=row1, added=row2. When added location number < 1604, sort puts it at row 1. Fix: `findNonSelfRow()` page object method + `ensureCleanSSLTable()` uses it.
3. **TC-007 dirty state** — reload broke it (different timing). Fix: reverted to original approach (no reload), added pre-assertion and increased timeout.
4. **Docs updated**: test cases 17→24, test plan 17→24.

**Result**: 24/24 pass.

**How to apply:** This is done. No further action needed.
