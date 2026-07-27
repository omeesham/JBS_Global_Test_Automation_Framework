# Corporate Pricing — Product Group Override Test Cases — Navigation

**Module**: corporate-pricing | **Total**: 1 | **Status**: Automated | **Updated**: 2026-07-27

---

## TC-CPR-OVR-029: The Search action bar "Pricing Override" button navigates to the Override screen
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none
**Automatable**: Yes

**Preconditions**: Authenticated on the Corporate Pricing Search screen.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Search action bar "Pricing Override" button -> the app navigates to `/pg-override` | The app navigates away from the Search screen toward the Product Group Override screen. |
| 2 | Read the URL and heading -> URL contains `/pg-override` | The current URL contains `/pg-override`, confirming the navigation succeeded. |
| 3 | heading is "Product Group Override" | The page heading reads "Product Group Override". |

**Expected**: The "Pricing Override" action-bar button navigates from the Search screen to the Override screen.
**Data**: office context (default)

---

## FIELD INVENTORY

N/A — this file contains only TC-CPR-OVR-029, a URL-level navigation test (Search → Override screen). No editable fields are exercised. The full Override screen field inventory lives in `corporate-override/corporate_override_core_test_cases.md`.

## Validation Rules

N/A — TC-CPR-OVR-029 verifies only that the "Pricing Override" action-bar button navigates to `/pg-override`. No field-level validation rules apply. See `corporate-override/corporate_override_core_test_cases.md` for Override field validation rules.

## MCP_VERIFICATION_LOG

Navigation to the Override screen was verified as part of the Override screen MCP walk (2026-06-09, office 1604) and re-verified 2026-07-09 (office 1606, TC-029..037 batch). Full verification log in `corporate-override/corporate_override_core_test_cases.md`.

