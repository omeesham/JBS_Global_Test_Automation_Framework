# {Feature} Test Cases

**Module**: {module} | **Total**: N | **Automated**: 0 | **Manual**: N

---

<!--
DUAL-FORMAT TEST CASE SYSTEM
============================
This template demonstrates how to write test cases with BOTH:
- AGENT fields: Technical, parser-optimized (element IDs, code syntax)
- HUMAN fields: QA-readable (UI labels, narrative steps, plain English)

WHY: Agents need element IDs for automation. QA needs readable instructions.
HOW: CSV export filters by audience - human export excludes _for_agent columns.

FIELD TRANSLATION RULES:
| Element ID Prefix | Human Label Format |
|------------------|-------------------|
| chkApplyLDW      | "Apply LDW" checkbox |
| spinLDWPercentage| "LDW Percentage" field |
| drpOracleOrg     | "Oracle Organization" dropdown |
| btnSave          | "Save" button |
| txtUsername      | "Username" text field |

SECTION ORDER (required):
1. Priority/Status/Type table
2. Preconditions (Human) - setup state in plain English
3. Steps (Human) - numbered narrative steps with bold UI labels
4. Expected Result (Human) - per-step visual expectations
5. Notes - warnings, quirks, edge case behavior
6. Steps - agent format (element IDs, arrows)
7. Expected - agent format (validation syntax)
8. Data - agent format (key=value pairs)
-->

## TC-{MOD}-001: {Title - Human-Readable Description}

| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Preconditions (Human)**:
- Office 1604 is open in Navigator
- Local Information tab is active
- "Apply LDW" checkbox is checked with "LDW Percentage" showing 0.04

**Steps (Human)**:
1. Note the current **LDW Percentage** value (should be 0.04).
2. Uncheck the **Apply LDW** checkbox.
3. Observe the **LDW Percentage** field.
4. Re-check the **Apply LDW** checkbox.
5. Observe the **LDW Percentage** field again.

**Expected Result (Human)**:
- Step 2: Apply LDW checkbox becomes unchecked.
- Step 3: LDW Percentage field is **disabled** and value resets to **0** (not 0.04).
- Step 4: Apply LDW checkbox becomes checked.
- Step 5: LDW Percentage is **enabled** but value remains **0** — original value is NOT restored.

**Notes**: ⚠️ Common confusion: value does not restore on re-check. This is intentional behavior. Cleanup: restore to valid value after test.

**Steps**: 1. Read spinLDWPercentage → Store "0.04" 2. Uncheck chkApplyLDW → Unchecked 3. Verify spinLDWPercentage → Disabled, value="0" 4. Re-check chkApplyLDW → Checked 5. Verify spinLDWPercentage → Enabled, value="0"

**Expected**: Unchecking Apply LDW disables spinbutton AND resets value to 0. Re-checking enables it but value stays 0.

**Data**: `chkApplyLDW=toggle` | `spinLDWPercentage=0.04->0->0` | **CLEANUP REQUIRED**

---

## TC-{MOD}-002: {Another Test Case - Shows Minimal Human Fields}

| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Agent-Discovered |

<!-- MINIMAL HUMAN FIELDS: If you only provide agent fields, 
     the CSV exporter will auto-convert element IDs to UI labels.
     However, explicit human fields are PREFERRED for accuracy. -->

**Preconditions (Human)**:
- User is on Settings page

**Steps (Human)**:
1. Click the **Submit** button.
2. Verify the success message appears.

**Expected Result (Human)**:
- Step 1: Form submits without errors.
- Step 2: "Changes saved successfully" message is displayed.

**Steps**: 1. Click btnSubmit → Success 2. Verify lblMessage → "Changes saved"

**Expected**: Form submits successfully with confirmation message.

**Data**: `btnSubmit=click` | `lblMessage=Changes saved`

---

<!--
EXPORT COMMANDS:
  Human export (default): npx ts-node export_test_cases/to-csv.ts ./input.md ./output.csv
  Agent export:           npx ts-node export_test_cases/to-csv.ts ./input.md ./output.csv --type=agent
  Full export:            npx ts-node export_test_cases/to-csv.ts ./input.md ./output.csv --type=full

REFERENCE:
  See export_test_cases/README.md for full documentation.
-->