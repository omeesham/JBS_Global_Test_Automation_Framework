---
name: feedback_missing_testid_report_policy
description: "Missing-testid Jira report — report EVERY control that could carry a testid, including generic/non-unique ones (annotate); only un-triggerable controls go to UNVERIFIED"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dcd74011-29eb-4bec-b929-23c28f23877f
---

For the Encore missing-`data-testid` Jira report (`ENCORE_MISSING_TESTID_REPORT.xlsx`, gitignored, filed manually — never shipped via git-archive), the reporting policy Rutvik set (2026-07-10):

- **Report every control that COULD and SHOULD carry a testid but doesn't** — "we are supposed to report all missing datatest id; if it's possible to put a data-testid there, we report it."
- **Generic / non-unique testid = KEEP-and-report, with annotation** — e.g. 3 Search filter checkboxes all share `e2e-checkbox` (non-unique, can't target one). These STAY in the shipping sheet; the Element cell annotates the non-uniqueness so Encore adds proper per-control testids. Do NOT remove them just because a generic testid exists.
- **Un-triggerable controls → `UNVERIFIED_NEEDS_TRIGGER` tab, never asserted in the shipping sheet** (LR-029). A row that can't be reached live (e.g. the publish/import-delta review modal that only renders after a real CSV import) is moved to the clearly-labelled unverified tab, not left CONFIRMED.
- **Card chrome (`e2e-card-header`/`title`) is excluded** — structural, not a targetable control.

**Why:** the report's job is to give Encore a complete list of gaps to fix, not a filtered list of what we happened to automate. A generic testid is still a gap. But an unverified claim in an external Jira report is a credibility risk, so unreached rows are quarantined honestly.

**How to apply:** when building/extending any missing-testid report — report all could-and-should gaps (annotate generics), quarantine un-triggerable rows to UNVERIFIED, exclude card chrome. Verify live per [[feedback_testid_golden_rule]] (LR-029/LR-014) and cross-check reviewer refutations per [[feedback_verify_synthesis_refutations]].
