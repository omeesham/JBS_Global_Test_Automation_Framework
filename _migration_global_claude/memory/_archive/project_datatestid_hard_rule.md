---
name: data-testid forward rule
description: All NEW Encore specs must use data-testid — missing = bug from Encore's side. Existing selectors grandfathered.
type: project
---

Encore's AI agent generates `data-testid` for every interactive element in Navigator4.

**Why:** Encore generates these automatically via their AI agent. Our test framework should prefer data-testid for all new code.

**How to apply:**
- **NEW specs/TCs**: MUST use data-testid. Missing on Encore page = file TESTID_MISSING bug, skip test. No workaround selectors.
- **EXISTING selectors**: Grandfathered. Keep working as-is. Convert opportunistically when files are touched for other reasons.
- Exceptions (workarounds always allowed): Microsoft SSO pages, browser-native dialogs, Angular Material shared dialogs
- Current state (2026-03-27): 82% data-testid, 18% alternatives (SSO external ~10, dialogs ~25, grids ~12)
- Formalized as ALL-059 in AGENT_SHARED_RULES.md (pending execution of Bug Hunting Rulebook v2)
