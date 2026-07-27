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

