# SUBPLAN: Rules Doc v2 — Add Rule 5 (Tags) + Rule 6 (Live-DOM-First)

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-06 (converter must be ready before rules reference the Tags column)
**Blocks**: SP-DQU-08 (tag rollout needs rules in place first so agents apply them consistently)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_07_E2_RULES_DOC_UPDATE.md`
**Identity**: GARDENER
**Skills auto-called**: /identity, /simplify
**Model + thinking**: Sonnet + medium
**Dependency gate**: SP-DQU-06 `Status: DONE`
**Context files**:
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (existing 4 rules)
- `plans/done/SUBPLAN_HIST_PIVOT_42_L1_TC_AUTHORING_RULES.md` (original rules doc installation)
- `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` (sample metadata table — Basic Information tab; sibling files for HIS + ECT post-2026-05-05 split)
**Phase 0 directive**: read current rules doc fully before editing. Preserve Rules 1-4 verbatim. Append-only revision log.
**HALT conditions**:
- Graduation-to-LR-041 trigger hit (3+ subplans without new leaks) — separately path: flag, do not remove from rules doc yet.

---

## Purpose

Add Rule 5 (required Tags) + Rule 6 (Live-DOM-first) to `tc-authoring-rules.md`. Extend grep gates. Update known-leaks table. Bump revision log.

## Step-by-step

1. Read current rules doc.
2. Insert Rule 5 between Rule 4 and "Phase 0 enforcement" section:

   ```markdown
   ### Rule 5 — Required TC tags

   Every TC's metadata table must include a non-empty Tags column (4th column, after Priority | Status | Type).

   **Allowed tags** (one or more, comma-separated):
   - `POSITIVE` — happy path, valid inputs, save succeeds.
   - `NEGATIVE` — invalid inputs, validation fires, save disabled or rejected.
   - `E2E` — crosses more than one module or persists through save + reload + navigate.
   - `UI` — verifies rendering, labels, defaults, visual state; no data change.
   - `API` — verifies backend state, history row, or persisted record directly.
   - `SMOKE` — minimum-viable must-pass; page loads, core CTA visible.
   - `REGRESSION` — guards a previously-filed bug; MUST link a BUG-* ID in the TC's Notes or metadata.

   **Multiple tags allowed**: `NEGATIVE, UI` is valid. `POSITIVE, E2E, API` is valid.

   **Forbidden**: empty Tags cell on any TC. Unknown tag values (outside the 7 above).
   ```

3. Insert Rule 6 after Rule 5:

   ```markdown
   ### Rule 6 — Live-DOM-first for every new or corrected TC

   Every new TC and every corrected-existing TC must carry a `**MCP_VERIFICATION_LOG**:` line in its agent-only section citing:
   - Date of DOM observation (YYYY-MM-DD).
   - Evidence source (neutral-eye audit file path OR MCP session ID OR Chrome Claude session timestamp).
   - One-line description of what was observed (e.g., "Prep Date Offset accepts only -n or 0; tab-out with 5 triggers aria-invalid=true, save stays disabled").

   Rationale: 11 TCs in the 2026-04-22 client review were defective specifically because they were authored from an idealized spec instead of the live app.
   ```

4. Extend Phase 0 enforcement greps:
   - Add: `grep -niE '^\| [^|]+ \| [^|]+ \| [^|]+ \|[[:space:]]*\|' <file>` — 4-column metadata row with empty Tags cell = Rule 5 violation.
   - Add: `grep -c 'MCP_VERIFICATION_LOG' <file>` — count must match TC count in the file (one per TC).
   - Add the three new greps into the existing 4-grep bash block.

5. Update Known Leaks table: append rows for any new leaks discovered in SP-02/03/04/05 neutral-eye audits (e.g., if the LI MD had stale phrasing that was fixed).

6. Bump Revision History:
   - `- **2026-04-22 (v2)** — Rules 5 (Tags) + Rule 6 (Live-DOM-first) added. Graduation path: when Rules 5-6 survive 3+ subplan executions without new leak discoveries, graduate alongside Rules 1-4 to framework-level as LR-041 in root CLAUDE.md (SP-K1 framework rules sweep destination).`

7. Run the 6 greps on the rules doc itself as a sanity check (the doc may reference forbidden words in examples — that's OK, but make sure only "example" blocks do).

8. Activity-log row.

## Acceptance criteria

- [ ] Rule 5 + Rule 6 present with full definitions and examples.
- [ ] Phase 0 enforcement has 6 greps (original 4 + 2 new for Tags + MCP log).
- [ ] Known Leaks table updated if SP-02/04 findings include new leaks.
- [ ] Revision log v2 entry added.
- [ ] Activity-log row appended.

## Handoff

Next: SP-DQU-08 (tag rollout). Rules are live — authors now know exactly what to write. Chat summary: rules doc updated, grep gates extended.
