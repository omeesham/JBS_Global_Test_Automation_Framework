---
name: OWNER edits to pipeline-owned paths still need an activity-log row
description: §2 short-circuits the hard-deny for OWNER, but the audit-trail obligation (LR-028) remains. Any OWNER work that lands on selectors / pages / specs / test-data / test-cases / test-plans / REQUIREMENTS.md needs a row in agent-activity-log.md so the next pipeline session sees what changed and why.
type: feedback
originSessionId: 4add5afd-d918-4625-8460-69663fdc2651
---
OWNER has unrestricted write per LR-043 §A's `canWrite()` short-circuit, but that's an access-control concession — NOT a bookkeeping concession. Per LR-028 every session that modifies pipeline artifacts (specs, page objects, selectors, test data, test cases, test plans, REQUIREMENTS.md) appends a row to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md`. The "Agent" column accepts `owner` as a value (precedent: 2026-04-27T17:45 row, 2026-04-28T16:15 row, etc.).

**Why:** in the 2026-04-29 testid migration, OWNER touched 11 files under `clients/encore/src/selectors/setup/locations/`, `clients/encore/src/pages/setup/locations/`, and `clients/encore/tests/specs/_verification/`. The first /final-q audit incorrectly classified the activity-log row as "skipped — OWNER non-pipeline work; activity log is for pipeline agents per shared rules." That reasoning was wrong: the activity log is keyed on the FILES TOUCHED, not the agent identity. OWNER editing pipeline-owned files still leaves a trail. The next BUILDER/HEALER session that opens those selectors needs context for what changed and why.

**How to apply:**
- Before ending any OWNER session that touched any of: `src/selectors/**`, `src/pages/**`, `tests/specs/**`, `tests/test-data/**`, `specs_planning/test-cases/**`, `specs_planning/test-plans/**`, `docs/REQUIREMENTS.md` — append a row.
- Format: `| YYYY-MM-DDThh:mm | owner | done | <files-pipe-separated> | <plan-id + outcome + reason + identity + browser-tool + LR-honors> |`
- LR-037 timestamp gate: the When timestamp must be ≥ all touched-file mtimes. Use wall-clock at append time.
- Notes column: include `plan-id`, `outcome:pass|partial|fail`, brief reason, `Identity: OWNER`, browser tool used, and any LR rules honored. Greppable structured fields preferred (per the file's header comment).
- This is a per-session obligation, not per-edit. One row covers all related edits in the session.
