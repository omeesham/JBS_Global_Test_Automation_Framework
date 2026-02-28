# Location Auto Add-On Test Cases
**Module**: locations | **Total**: 16 | **Status**: Manual | **Updated**: 2026-02-19

---

## FIELD INVENTORY & DISCOVERY

**Auto Add-On Tab** (1 element type, dynamic list):
| Element | Type | State | Value (1604) |
|---|---|---|---|
| Checkbox list | list of `button[role="checkbox"][data-slot="checkbox"]` | inside shadow DOM (`next-location-settings`) | 5 items |
| Encore Music | checkbox | CHECKED | `aria-checked="true"` |
| Wireless Presenter | checkbox | CHECKED | `aria-checked="true"` |
| Express Content Design Session | checkbox | UNCHECKED | `aria-checked="false"` |
| Wordly | checkbox | CHECKED | `aria-checked="true"` |
| Labor | checkbox | CHECKED | `aria-checked="true"` |

**Behavioral Notes (Verified Live 2026-02-19)**:
- Checkbox items vary per location — 1604 shows 5 items
- **DISCREPANCY**: Requirements agent (2026-02-18) documented 6 items for office 1604, including "Test Labor - Jonathan". Live verification 2026-02-19 found only 5 items — "Test Labor - Jonathan" is no longer present in the DOM for office 1604. Remaining 5 items confirmed: Encore Music, Wireless Presenter, Express Content Design Session, Wordly, Labor.
- No dedicated Save — relies on shared left-panel **Save** button
- Toggling any checkbox -- Save button activates (fires `[LocationDetail] Unsaved changes event received: true`)
- Reverting a toggle to original state does NOT disable Save (event-based tracking doesn't reset)
- No inline validation or required-field errors — pure toggle selection
- Checkboxes are inside shadow DOM: `next-location-settings` custom element
- Selector pattern: `next-location-settings >> div:has(label:text-is("ItemName")) button[data-slot="checkbox"]`

---

## TC-LOC-AAO-001: Verify Auto Add-On tab navigation and panel load
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Navigate to Setup > Location > office 1604 ✓ Location detail opens 2. Click **Auto Add-On** tab ✓ Tab becomes selected 3. Verify tabpanel "Auto Add-On" is visible ✓ Panel loads with checkbox list 4. Verify at least 1 checkbox item is present ✓ Items visible
**Expected**: Auto Add-On tabpanel loads, checkbox list renders without errors
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-AAO-002: Verify correct item count displayed for location 1604
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab for office 1604 ✓ Tabpanel loads 2. Count all checkbox items in the list ✓ 5 items present 3. Verify item labels match expected set ✓ "Encore Music", "Wireless Presenter", "Express Content Design Session", "Wordly", "Labor"
**Expected**: Exactly 5 items for location 1604 with correct labels
**Data**: office=1604 | expected_count=5
**Automatable**: Yes

---

## TC-LOC-AAO-003: Verify checked items show checked state on load
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab ✓ Tabpanel loads 2. Verify **Encore Music** checkbox ✓ `aria-checked="true"`, `data-state="checked"` 3. Verify **Wireless Presenter** checkbox ✓ `aria-checked="true"` 4. Verify **Wordly** checkbox ✓ `aria-checked="true"` 5. Verify **Labor** checkbox ✓ `aria-checked="true"`
**Expected**: All 4 checked items show checked state on initial load without any user interaction
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-AAO-004: Verify unchecked item shows unchecked state on load
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab ✓ Tabpanel loads 2. Verify **Express Content Design Session** checkbox ✓ `aria-checked="false"`, `data-state="unchecked"` 3. Confirm no visual check indicator ✓ Checkbox visually empty
**Expected**: Express Content Design Session shows unchecked on initial load
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-AAO-005: Verify Save button is disabled on initial tab load
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Navigate fresh to office 1604 ✓ Location detail opens 2. Click **Auto Add-On** tab without making changes ✓ Tabpanel loads 3. Verify left-panel **Save** button ✓ Button is `disabled` (no changes pending)
**Expected**: Save button disabled when Auto Add-On tab is opened with no modifications
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-AAO-006: Toggle checked item to unchecked — Save button activates
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab ✓ Encore Music is checked 2. Click **Encore Music** checkbox ✓ `aria-checked` changes from `"true"` to `"false"` 3. Verify Save button ✓ Left-panel **Save** is now enabled (no longer disabled)
**Expected**: Unchecking a checked item activates the Save button
**Data**: office=1604 | item="Encore Music" | from=checked | to=unchecked
**Cleanup**: Click **Encore Music** again to restore to checked state
**Automatable**: Yes

---

## TC-LOC-AAO-007: Toggle unchecked item to checked — Save button activates
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab ✓ Express Content Design Session is unchecked 2. Click **Express Content Design Session** ✓ `aria-checked` changes from `"false"` to `"true"` 3. Verify Save button ✓ Left-panel **Save** is now enabled
**Expected**: Checking an unchecked item activates the Save button
**Data**: office=1604 | item="Express Content Design Session" | from=unchecked | to=checked
**Cleanup**: Click **Express Content Design Session** again to restore to unchecked state
**Automatable**: Yes

---

## TC-LOC-AAO-008: Toggle and revert — Save button remains enabled
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab ✓ Encore Music checked 2. Click **Encore Music** to uncheck ✓ Save button activates 3. Click **Encore Music** again to re-check ✓ Checkbox back to original state 4. Verify Save button ✓ Still enabled (does not reset to disabled)
**Expected**: Reverting a toggle does not disable the Save button — unsaved-change tracking is event-based and does not auto-reset
**Data**: office=1604 | item="Encore Music"
**Cleanup**: Navigate away without saving (use Back to Location Search -- Discard)
**Automatable**: Yes

---

## TC-LOC-AAO-009: Click Save with unsaved changes — confirmation dialog appears
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab ✓ Express Content Design Session unchecked 2. Click **Express Content Design Session** ✓ Save button activates 3. Click **Save** button ✓ Confirmation dialog appears 4. Verify dialog heading "Save Changes" ✓ 5. Verify dialog body "Are you sure you want to save the changes?" ✓ 6. Verify dialog has **Cancel** and **Save** buttons ✓
**Expected**: `dlgSaveChanges` dialog appears with exact text and two buttons; dialog is `[role="alertdialog"]`
**Data**: office=1604 | item="Express Content Design Session"
**Cleanup**: Click **Cancel** in dialog; click **Express Content Design Session** to restore unchecked state
**Automatable**: Yes

---

## TC-LOC-AAO-010: Cancel save dialog — no change persisted
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab, click **Express Content Design Session** ✓ Checked; Save activates 2. Click **Save** ✓ Confirmation dialog appears 3. Click **Cancel** in dialog ✓ Dialog closes 4. Verify **Express Content Design Session** still shows checked ✓ DOM state unchanged 5. Reload page ✓ Express Content Design Session returns to unchecked (original)
**Expected**: Cancelling the save dialog does not persist the change; reload confirms original state
**Data**: office=1604 | item="Express Content Design Session"
**Automatable**: Yes

---

## TC-LOC-AAO-011: Confirm save — changes persist after page reload
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab, click **Express Content Design Session** ✓ Checked; Save activates 2. Click **Save** ✓ Dialog appears 3. Confirm save ✓ Dialog closes; changes saved 4. Reload page ✓ Page reloads for office 1604 5. Open **Auto Add-On** tab ✓ Tabpanel loads 6. Verify **Express Content Design Session** ✓ Still checked (`aria-checked="true"`)
**Expected**: Confirmed save persists checkbox state across page reload
**Data**: office=1604 | item="Express Content Design Session"
**Cleanup**: Uncheck **Express Content Design Session**, Save, Confirm -- restore original state
**Automatable**: Yes

---

## TC-LOC-AAO-012: Toggle multiple items — all changes tracked as single unsaved state
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab ✓ 4 checked, 1 unchecked 2. Click **Encore Music** (uncheck) ✓ Save activates 3. Click **Express Content Design Session** (check) ✓ Save still enabled 4. Click **Wordly** (uncheck) ✓ Save still enabled 5. Verify all 3 changes are visually reflected ✓ State matches clicks 6. Verify Save button ✓ Still enabled (one Save handles all pending changes)
**Expected**: Multiple toggle changes combine into a single unsaved state; Save button stays enabled across all of them
**Data**: office=1604
**Cleanup**: Revert all 3 items to original state; navigate away without saving
**Automatable**: Yes

---

## TC-LOC-AAO-013: Navigate away with unsaved changes — discard prompt
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab, click **Express Content Design Session** ✓ Checked; Save activates 2. Click **Back to Location Search** button ✓ 3. Verify dialog heading "Unsaved Changes" ✓ 4. Verify dialog body "Are you sure you want to leave this view? Any unsaved changes will be lost." ✓ 5. Verify dialog has **Cancel** and **OK** buttons ✓ (no role=dialog; custom div wrapper)
**Expected**: Navigating away triggers `dlgUnsavedChanges` dialog — distinct from Save dialog; uses **OK** not **Save**
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-AAO-014: Discard unsaved changes — original state restored
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Auto Add-On** tab, click **Express Content Design Session** ✓ Checked 2. Click **Back to Location Search** ✓ "Unsaved Changes" dialog appears 3. Click **OK** in dialog ✓ Navigation proceeds to location search page 4. Navigate back to office 1604 **Auto Add-On** tab ✓ Tab loads 5. Verify **Express Content Design Session** ✓ `aria-checked="false"` (original state)
**Expected**: Clicking **OK** in `dlgUnsavedChanges` discards changes and navigates away; reload shows original state
**Data**: office=1604 | item="Express Content Design Session"
**Automatable**: Yes

---

## TC-LOC-AAO-015: Verify Auto Add-On tab with no items configured — blocked (training-env)
| Priority | Status | Type |
|----------|--------|------|
| Low | Blocked (training-env) | User-Requested |

**Blocked**: No alternative location without Auto Add-On items could be identified in the training environment. Cannot verify empty-state behavior (blank panel vs. placeholder message) until a location with zero configured items is available.

**When unblocked, verify**:
1. Navigate to Setup > Location > [location with no add-ons] ✓ Location detail opens
2. Click **Auto Add-On** tab ✓ Tabpanel loads
3. Verify empty list ✓ No checkboxes present; either blank panel or placeholder message
4. Verify **Save** button ✓ Disabled (no changes possible with empty list)

**Expected**: Location with no add-ons configured shows empty panel without errors; Save remains disabled
**Data**: office=to be identified when alternative location available
**Automatable**: Blocked:Cat-A training-env

---

## TC-LOC-AAO-016: Items vary per location — different location shows different list — blocked (training-env)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Blocked (training-env) | User-Requested |

**Blocked**: No confirmed alternative location with a different Auto Add-On item set could be identified in the training environment during planning (2026-02-19). Cannot verify cross-location item variability until a second location is available for comparison.

**When unblocked, verify**:
1. Open **Auto Add-On** tab for office 1604 ✓ 5 items shown: Encore Music, Wireless Presenter, Express Content Design Session, Wordly, Labor
2. Navigate to [second location] ✓ Location detail loads
3. Click **Auto Add-On** tab on second location ✓ Tab loads
4. Verify item list differs from office 1604 ✓ Different add-on items and/or item count

**Expected**: Auto Add-On checkbox list is location-specific — item sets differ between locations
**Data**: office=1604 (baseline, 5 items) | office=to be identified when alternative location available

**Automatable**: Blocked:Cat-A training-env