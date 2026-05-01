---
description: Field-inventory artifact + walkthrough + DOM-verify discipline
paths:
  - "clients/*/specs_planning/_internal/**/*.md"
  - "clients/*/specs_planning/_internal/field-inventories/**/*.md"
  - "src/selectors/**/*.ts"
---

# Field Inventory & Walkthrough Discipline

Path-scoped rule pack — loads when authoring or consuming field-inventory artifacts, walkthroughs, or selector files.

## LR-007: MCP-verify the planner's field-inventory artifact via spot-check (amended by SP-AAE-04, 2026-04-25)

Before writing ANY test assertion, verify the planner's field-inventory artifact by **spot-checking 2–3 random fields** on the live DOM (testid resolves, default value matches, enabled/disabled state matches). A full re-walk of every planner claim is required ONLY when the spot-check detects drift, the artifact is missing, or it is >30 days stale (per AAE-D6). This cuts generator+auditor DOM traversal from 3× to 1× per module per cycle while preserving verification when drift is real.

**Drift handling**: any disagreement on (testid resolves / default matches / state matches) across the 3 spot-checked fields = `DRIFT_DETECTED` → fall through to full UI walkthrough (generator Phase 0.5b / auditor Mode 2 step 2b) AND emit a refreshed dated artifact.

**Original spirit retained**: Never trust planner data without live verification. The planner is OFTEN wrong. Pre-amendment incident — Opus skipped this step entirely and caused 5 of 8 generator failures (LOS 2026-03-24, 47 spec issues). Post-amendment, the spot-check IS the verification — skip it and you re-create the same failure class on top of a stale artifact.

**Trigger**: Every generator session start AND every WATCHDOG agent-audit (Mode 2) session. Enforced by PF-G5 gate (accepts the spot-check WALKTHROUGH_LOG as valid walkthrough evidence per LR-013).

## LR-013: Phase 0.5 is MANDATORY — walkthrough before code, artifact before complete

Generator MUST complete Phase 0.5 walkthrough as its FIRST action before writing any spec code, page object, or test data. The pre-run gate (PF-G5) WILL halt on retry if walkthrough is missing or invalid. On first run the gate warns — but skipping Phase 0.5 guarantees failure.

**Phase 0.5 completion gate** (graduated from SP-AAE-03, 2026-04-23; amended by SP-AAE-04, 2026-04-25): the walkthrough is complete via EITHER of two satisfaction paths:

(a) **Fresh-artifact spot-check path** (preferred — generator Phase 0.5a / auditor Mode 2 step 2a): a field-inventory artifact at `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/<module>-<YYYY-MM-DD>.md` exists with `MCP_Session_Date` ≤14 days from today (or 14–30 days with a logged `STALENESS_WARNING`); the consumer reads it, spot-checks 2–3 random fields on live DOM, and ALL spot-checked fields agree on (testid resolves / default matches / enabled-disabled matches). The 3-row spot-check WALKTHROUGH_LOG IS valid Phase 0.5 evidence — no full re-walk is required.

(b) **Emit-new-artifact path** (fallback — generator Phase 0.5b / auditor Mode 2 step 2b): no artifact exists, the artifact is >30 days stale (`Stale-after` per AAE-D6), OR the spot-check detected drift. The consumer runs the full per-TC live walkthrough AND emits/refreshes the dated field-inventory artifact at the end.

Both paths require: all 8 mandatory frontmatter keys and 7 mandatory sections per `field-inventory-spec.md`; `## Field Inventory` table with a non-empty row (data-testid or LR-014 fallback) for every interactive field; `MCP_Session_Date` equal to the filename date.

Planner emits via PLN-049; generator + auditor consume the artifact via spot-check (SP-AAE-04 amended LR-007 + LR-013 to make spot-check the canonical verification — full re-walk is now the drift fallback, not the default). SP-AAE-02 pre-commit hook rejects TC-MD edits lacking a same-module artifact ≤14 days old. Static catalog-pivot sessions that never call `browser_navigate` are structurally exempt (Phase 1/2 not executed).

**Trigger**: Every generator session start AND every planner Phase 1/2 Manual QA session that walks live DOM AND every WATCHDOG Mode 2 agent audit. Enforced by PF-G5 gate + SP-AAE-02 pre-commit hook (PF-G5 accepts the 3-row spot-check log as valid walkthrough evidence post-SP-AAE-04).

## LR-014: FIELD INVENTORY testid column must be complete

Every row in planner's FIELD INVENTORY must have a non-empty data-testid value or explicit fallback strategy "(no testid — use aria-label/text)". Blank testid cells cause generator to guess selectors → spec failures. Planner rule PLN-039.
**Trigger**: Every planner session producing FIELD INVENTORY.

## LR-015: Default values and states come from dated MCP sessions only

Default field values, enabled/disabled states, and dropdown option lists must come from a DOM read on a dated MCP session. The FIELD INVENTORY date is the timestamp. Structural counts (tab count, column headers) must match FIELD INVENTORY but don't need separate tags. Never hardcode a server-data value without MCP proof.
**Trigger**: Any test data constant or assertion on default state.

## LR-016: Accessibility tree element types do NOT match actual HTML tags

The Playwright accessibility tree reports `img` for SVG elements, `row` for `<tr>`, `cell` for `<td>`, etc. NEVER derive CSS selectors from accessibility tree element types. Always verify actual HTML tag via `browser_evaluate(() => el.tagName)` before writing selectors like `svg`, `img`, `tr`, `td`. The accessibility tree is for FINDING elements, not for understanding their DOM structure.
**Trigger**: Any Phase 0.5 walkthrough or healer session examining DOM structure.

## LR-029: Never audit selectors without live DOM verification

When auditing data-testid coverage or generating missing-testid reports: NEVER audit selector files alone — always verify against the LIVE DOM via MCP. Selector files show what WE USE, not what EXISTS in the app. The app may have data-testids we never adopted, or testids may have been added since we wrote our selectors. Auditing files without DOM = false positives = embarrassment.

Pattern: navigate to each page/tab, run `document.querySelectorAll('[data-testid]')`, cross-reference against our selector values.

**Trigger**: Any task involving testid coverage analysis or bug reporting to external teams.
**Graduated from**: Session 2026-04-09 — 17 false positives found in MISSING_TESTID_REPORT.md.
