# Discount Matrix — Search Criteria Test Cases

**Module**: discount-matrix
**Submodule**: CRT
**Page**: Location Settings → Discount Matrix (`/settings/discount-matrix`) — Search Criteria bar
**Test Entity**: Office 1604
**Updated**: 2026-08-25
**Total TCs**: 30
**Coverage mode**: QUICK (L1)
**Governing Requirement**: NM-3530
**Verified against**: field inventory `discount-matrix-criteria-2026-08-25.md`; machine denominator `reports/walk-coverage/dsm-crt-skelgate.json` (17 elements, resting state); dropdown option sets and at-rest values read live 2026-08-25; threshold range, coercion behaviour and dirty-tracking measured live 2026-08-25 — `reports/walk-coverage/dsm-gav-boundary-probe.json` and `reports/walk-coverage/dsm-revert-styling-probe.json`

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Country | none — `<button role="combobox">`, no accessible name; structural anchor only | Dropdown / combobox (Radix) | `United States` |
| Currency | none — same constraint | Dropdown / combobox (Radix) | `USD` |
| Business Tier | none — same constraint | Dropdown / combobox (Radix) | `Standard` |
| GAV Discount Threshold | none — use `name="gavDiscountThreshold"` | Numeric, percentage-formatted. Rendered as `type="text"` with `inputmode="decimal"`, so there is no browser-level number validation — every check below is the application's own | **Not fixed — see the warning below.** Accepted range measured as `0`–`100` |
| Save (criteria) | none — use text content | Button | Disabled at rest |
| More information | none — use `aria-label="More information"` | Button | Enabled |
| Left-panel collapse toggle | none — use text content | Button | Enabled |

The criteria bar carries **zero** `data-testid` attributes. `GAV Discount Threshold` is the only control
with a stable non-structural anchor; the three dropdowns are `<button role="combobox">` with no accessible
name, so `getByRole('combobox', { name })` cannot resolve them and they must be reached positionally.

> **GAV Discount Threshold has no assertable default.** The machine walk recorded `0%` at 17:31 on
> 2026-08-25; a live read at 18:5x the same day returned `15%`. Nothing was released between those two
> reads — the field simply carries whatever the last save left behind, and it is the one criteria control
> tests mutate. **No case may assert a hardcoded value for this field.** Every case reads the current
> value first, then restores it, and proves the restore by reloading.

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| The criteria bar is the last thing to hydrate | The three dropdowns resolve around t=31s; `gavDiscountThreshold` not until t=91–100s. Readiness is the loading-placeholder census reaching zero — a page read before that shows unpopulated controls and is what produced two earlier wrong "empty" readings. |
| Country offers four countries | `United States`, `Mexico`, `Canada`, `Bahamas` |
| Currency offers three currencies | `USD`, `CAD`, `MXN` |
| Business Tier offers three tiers | `Standard`, `Las Vegas`, `SVP Productions` |
| Opening and dismissing a list is not an edit | Escape closes the list and leaves the selection unchanged; Save stays disabled |
| Save is disabled at rest | It persists the GAV threshold only; the three dropdowns re-query without needing a save |
| The threshold is percentage-formatted | Never set it with a single fill — a formatted numeric input on this app silently corrupts the value that way. Type it character by character. |
| A save is only proven by reloading | Save disables optimistically on click, so a disabled button is not evidence the value persisted. Reload and read the field back. |
| The threshold accepts 0 through 100 | `0` and `100` are accepted; `101` and above turn the outline red and disable Save. Measured 2026-08-25 across `0`, `1`, `50`, `99`, `100`, `101`, `999`. |
| One decimal place is kept, a second is dropped | `12.5` stays `12.5%`; `1.23` collapses to `1.2%` on blur. |
| Out-of-range is signalled without words | The only cues are a red outline and a disabled Save button. No text anywhere on the page states that the limit is 100. |
| Non-conforming input is rewritten rather than refused | `-5` → `5%`, `1.2.3` → `1.2%`, `1e2` → `12%`, `007` → `7%`, empty → `0%`. Letters never enter the field at all. Each rewrite lands silently with Save enabled. |
| A negative value is impossible to enter | The minus sign is refused at the keystroke, so the range floor is proved by `0` being accepted, not by a below-zero rejection. |
| Undoing an edit clears the dirty state | Retyping the original value re-disables Save. The comparison runs on blur, so Save reads as enabled while the cursor is still in the field. |

---

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Page hydrates on office 1604 | Loading placeholders reach zero and `input[name="gavDiscountThreshold"]` resolves |
| 2 | Criteria combobox count | 3 — `button[role="combobox"]` |
| 3 | Country at rest and its options | `United States`; 4 options — `United States`, `Mexico`, `Canada`, `Bahamas` |
| 4 | Currency at rest and its options | `USD`; 3 options — `USD`, `CAD`, `MXN` |
| 5 | Business Tier at rest and its options | `Standard`; 3 options — `Standard`, `Las Vegas`, `SVP Productions` |
| 6 | Escape leaves each selection untouched | Confirmed for all three controls |
| 7 | GAV threshold live value | `15%` at probe time; `0%` in the same day's earlier machine walk — value is residue, not a default |
| 8 | Criteria Save at rest | `disabled = true` |
| 9 | GAV threshold anchor | `name="gavDiscountThreshold"` resolves |
| 10 | Tab strip | `Company Matrix` (active on load), `Region Weekly Peaks`, `Location Activation` |
| 11 | data-testid coverage | Zero across the whole criteria bar |
| 12 | Threshold accepted range | `0`, `1`, `50`, `99`, `100` accepted; `101` and `999` refused — outline red, Save disabled |
| 13 | Threshold input contract | `type="text"`, `inputmode="decimal"`, `placeholder="0%"`; native validity stayed `valid` for every value tried, so the app owns all validation |
| 14 | Out-of-range visual signal | Outline `oklch(0.577 0.245 27.325)` when refused vs `oklch(0.9 0.015 286)` when accepted; a page-wide text scan for any wording naming the limit returned nothing |
| 15 | Focus is never trapped | A natural Tab moved focus out of the field on all 15 values tried, including the refused ones |
| 16 | Silent coercions | `-5`→`5%`, `1.2.3`→`1.2%`, `1e2`→`12%`, `007`→`7%`, empty→`0%`; `abc` never enters the field |
| 17 | Undo clears the dirty state | `15%` → `20%` enables Save; retyping `15%` disables it again |
| 18 | Evidence | `reports/walk-coverage/dsm-gav-boundary-probe.json` · `reports/walk-coverage/dsm-revert-styling-probe.json` |

---

## TC-DSM-CRT-001: The criteria bar loads with all four controls populated

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The automation account has access to office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings → Discount Matrix for office 1604 | The page begins loading |
| 2 | Wait until no loading placeholders remain and the GAV Discount Threshold field is present | The criteria bar has finished hydrating |
| 3 | Read Country, Currency and Business Tier | They show `United States`, `USD` and `Standard` |
| 4 | Read the GAV Discount Threshold field | It holds a percentage-formatted value — the exact number is not asserted |

**Notes**: Readiness case. Step 2 is the load-bearing step: reading before the placeholders clear returns empty controls, which is what produced two incorrect "the dropdowns are empty" observations earlier in the walk.

---

## TC-DSM-CRT-002: Country offers the four supported countries

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Country control | The country list opens |
| 2 | Read every option | Exactly four are offered: `United States`, `Mexico`, `Canada`, `Bahamas` |
| 3 | Press Escape | The list closes and Country still shows `United States` |

**Notes**: Option-set case. Dismissing with Escape mutates nothing.

---

## TC-DSM-CRT-003: Currency offers the three supported currencies

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Currency control | The currency list opens |
| 2 | Read every option | Exactly three are offered: `USD`, `CAD`, `MXN` |
| 3 | Press Escape | The list closes and Currency still shows `USD` |

**Notes**: Option-set case. The currency set is narrower than the country set — Bahamas has no matching currency entry, which is worth knowing before any pairing case is written at DEEP depth.

---

## TC-DSM-CRT-004: Business Tier offers the three configured tiers

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Business Tier control | The tier list opens |
| 2 | Read every option | Exactly three are offered: `Standard`, `Las Vegas`, `SVP Productions` |
| 3 | Press Escape | The list closes and Business Tier still shows `Standard` |

**Notes**: Option-set case. `Las Vegas` and `SVP Productions` are named tiers rather than generic levels, so the set is data-driven and may differ per office.

---

## TC-DSM-CRT-005: Save is disabled when nothing has been changed

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Without touching any control, read the criteria-bar Save button | It is disabled |

**Notes**: Pristine-state contract.

---

## TC-DSM-CRT-006: Opening and dismissing a dropdown does not dirty the form

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Country list and press Escape | The list closes and Country is unchanged |
| 2 | Open the Currency list and press Escape | The list closes and Currency is unchanged |
| 3 | Open the Business Tier list and press Escape | The list closes and Business Tier is unchanged |
| 4 | Read the Save button | It is still disabled |

**Notes**: Negative dirty-state case. Browsing a list is not an edit; only a committed change may enable Save.

---

## TC-DSM-CRT-007: Changing Country re-queries the grid

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604 on the Company Matrix tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Country list and choose `Canada` | Country shows `Canada` and the page issues a re-query |
| 2 | Wait until no loading placeholders remain | The grid finishes reloading for the new criteria |
| 3 | Restore: open the Country list and choose `United States` | Country shows `United States` and the grid reloads again |

**Notes**: Re-query case. The criteria dropdowns re-key the grid without a save, so this changes no stored data. Step 2 must gate on the placeholders clearing — the grid keeps its previous row count while reloading.

---

## TC-DSM-CRT-008: Changing Currency re-queries the grid

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604 on the Company Matrix tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Currency list and choose `CAD` | Currency shows `CAD` and the page issues a re-query |
| 2 | Wait until no loading placeholders remain | The grid finishes reloading |
| 3 | Restore: choose `USD` again | Currency shows `USD` and the grid reloads |

**Notes**: Re-query case on the second criteria axis. No save, so no stored data changes.

---

## TC-DSM-CRT-009: Changing Business Tier re-queries the grid

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604 on the Company Matrix tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Business Tier list and choose `Las Vegas` | Business Tier shows `Las Vegas` and the page issues a re-query |
| 2 | Wait until no loading placeholders remain | The grid finishes reloading |
| 3 | Restore: choose `Standard` again | Business Tier shows `Standard` and the grid reloads |

**Notes**: Re-query case on the third criteria axis. No save, so no stored data changes.

---

## TC-DSM-CRT-010: The threshold accepts a whole number and renders it as a percentage

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured for the restore in step 5 |
| 2 | Clear the field | The field is empty |
| 3 | Type `20` one character at a time | The field holds `20` |
| 4 | Move focus away from the field | The field renders `20%` and Save becomes enabled |
| 5 | Restore: clear the field, type the captured starting value one character at a time, and move focus away | The field returns to its starting value |

**Notes**: Positive formatting case. Step 3 types character by character deliberately — setting a formatted numeric input on this app in a single fill silently writes a different number than the one requested. The starting value is read rather than assumed because this field carries residue from previous runs.

---

## TC-DSM-CRT-011: A saved threshold survives a reload

**Automatable**: Yes — mutating; restores its own change.
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field, type `20` one character at a time, and move focus away | The field renders `20%` and Save is enabled |
| 3 | Click Save | The save is submitted |
| 4 | Reload the page and wait until the criteria bar has hydrated | The page is freshly loaded |
| 5 | Read the GAV Discount Threshold field | It reads `20%` |
| 6 | Restore: set the field back to the captured starting value, save, reload, and read it back | The field reads the captured starting value again |

**Notes**: Persistence case, and the only mutating case in this file. Step 4 is mandatory: Save disables the moment it is clicked, so a disabled button proves nothing about whether the value reached the server. Step 6 restores through the same save-and-reload path so the office is left as it was found — a restore that is not verified by reload is not a restore.

---

## TC-DSM-CRT-012: The tab strip offers three tabs with Company Matrix active

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the tab strip left to right | Exactly three tabs are present: `Company Matrix`, `Region Weekly Peaks`, `Location Activation` |
| 2 | Read which tab is selected on load | `Company Matrix` is the active tab |

**Notes**: Structural case. Company Matrix being the landing tab is why the resting-state walk enumerates its panel rather than either of the other two.

---

## TC-DSM-CRT-013: The header information control is available

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the `More information` control in the page header | It is present and enabled |

**Notes**: Presence-only. What the control opens has not been probed — this QUICK walk deliberately opened no header popovers — so the case asserts availability and stops there rather than describing content nobody has seen.

---

## TC-DSM-CRT-014: The left panel can be collapsed and restored

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Locate the left-panel collapse toggle | It is present and enabled |
| 2 | Click it | The left settings panel collapses and the Discount Matrix content stays visible |
| 3 | Click it again | The left panel is restored |

**Notes**: Page-chrome case. Included because the toggle is part of this page's machine-enumerated element set, and because collapsing the panel must not disturb the criteria bar beside it.

---

## TC-DSM-CRT-015: The threshold accepts zero, the bottom of its range

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `0` one character at a time | The field holds `0` |
| 3 | Move focus away from the field | The field renders `0%`, keeps its normal grey outline, and Save becomes enabled |
| 4 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: Bottom-of-range positive case. `0` is accepted with no error styling, which is what makes it the minimum rather than a rejected value. Nothing is saved — the reload in step 4 discards the edit, so the office is left untouched.

---

## TC-DSM-CRT-016: The threshold accepts one hundred, the top of its range

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `100` one character at a time | The field holds `100` |
| 3 | Move focus away from the field | The field renders `100%`, keeps its normal grey outline, and Save becomes enabled |
| 4 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: Top-of-range positive case, and the upper half of the boundary pair with TC-DSM-CRT-017. `100` is the largest value the field accepts; `101` is refused. The two cases must stay adjacent — if the limit ever moves, both fail together and the change is unmissable.

---

## TC-DSM-CRT-017: One above the maximum is refused

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `101` one character at a time | The field holds `101` |
| 3 | Read the field's outline | It has turned red, marking the value as out of range |
| 4 | Read the Save button | It is disabled, so the out-of-range value cannot be submitted |
| 5 | Press Tab to move focus away naturally | Focus leaves the field — the red state does not trap the cursor |
| 6 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: Boundary rejection case, one above the maximum proved by TC-DSM-CRT-016. Step 5 uses a natural Tab and is run before any other key, because pressing Escape first would hide a focus trap rather than reveal one. Worth knowing when this fails: the app announces the rejection **only** through the red outline and the disabled Save button. No message anywhere on the page states that the limit is 100, so a user who types 105 sees Save go grey with no explanation of why.

---

## TC-DSM-CRT-018: A far out-of-range value is refused the same way

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `999` one character at a time | The field holds `999` |
| 3 | Read the field's outline and the Save button | The outline is red and Save is disabled |
| 4 | Press Tab to move focus away naturally | Focus leaves the field — the refusal does not trap the cursor |
| 5 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: Confirms the refusal is a real range check rather than an off-by-one guard that only catches values just past the limit. Step 4 mirrors TC-DSM-CRT-017's escape check — every refusal case proves both halves: the rejection is announced AND the user can leave the field.

---

## TC-DSM-CRT-019: The threshold accepts one decimal place

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `12.5` one character at a time | The field holds `12.5` |
| 3 | Move focus away from the field | The field renders `12.5%` with its normal grey outline and Save becomes enabled |
| 4 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: The threshold is not whole-numbers-only. One decimal place is kept intact; a second one is dropped, which TC-DSM-CRT-021 covers.

---

## TC-DSM-CRT-020: Letters never reach the threshold field

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `abc` one character at a time | The field stays empty — none of the three letters is accepted |
| 3 | Read the field's outline and the Save button | The outline is red and Save is disabled while the field is empty |
| 4 | Move focus away from the field | The field falls back to `0%` and the red outline clears |
| 5 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: The field filters letters at the keystroke, so they never enter the value at all. Step 4 is the part that matters: a user who types letters does not get an error to correct — they get a silent `0%`. Any automated run that enters non-numeric text must reload afterwards rather than typing a good value back, because retyping is not a reliable repair on this framework.

---

## TC-DSM-CRT-021: A malformed number is silently changed to a different one

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `1.2.3` one character at a time | The field holds `1.23` — the second decimal point is dropped as it is typed |
| 3 | Move focus away from the field | The field renders `1.2%` — the trailing digit is dropped too |
| 4 | Read the field's outline and the Save button | The outline is normal grey and Save is enabled |
| 5 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: Behaviour worth watching. The user typed `1.2.3` and the field ends up holding `1.2%`, a valid number they never asked for, with no error and Save ready to commit it. The app repairs malformed input instead of refusing it. This case records what the app does today; if the intended behaviour is to reject rather than rewrite, this case is the one that will need changing.

---

## TC-DSM-CRT-022: A negative value silently loses its minus sign

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `-5` one character at a time | The field holds `5` — the minus sign is refused as it is typed |
| 3 | Move focus away from the field | The field renders `5%` with a normal grey outline and Save becomes enabled |
| 4 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: Same class as TC-DSM-CRT-021 and the most consequential of the three. A user who enters `-5` gets `5%` — a positive discount they did not ask for — with nothing on screen indicating the value changed. Because the minus is stripped at the keystroke, there is no way to enter a below-zero value at all, which is why the range floor is proved by TC-DSM-CRT-015 accepting `0` rather than by a below-minimum rejection.

---

## TC-DSM-CRT-023: Leading zeros are dropped

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `007` one character at a time | The field holds `007` while it is being typed |
| 3 | Move focus away from the field | The field renders `7%` |
| 4 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: Normalisation case, and the benign member of the coercion group — `007` and `7` mean the same number, so rewriting one to the other loses nothing.

---

## TC-DSM-CRT-024: Scientific notation is silently changed to a different number

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and type `1e2` one character at a time | The field holds `12` — the letter is refused and the digits close up |
| 3 | Move focus away from the field | The field renders `12%` with a normal grey outline and Save becomes enabled |
| 4 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: `1e2` means one hundred. The field discards the letter and joins the surviving digits into `12`, so the user is left holding twelve percent with no warning. Third and last of the silent-rewrite group with TC-DSM-CRT-021 and TC-DSM-CRT-022.

---

## TC-DSM-CRT-025: Clearing the threshold falls back to zero percent

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it | The starting value is captured |
| 2 | Clear the field and leave it empty | The field is empty, its outline turns red, and Save is disabled |
| 3 | Move focus away from the field | The field fills itself with `0%` and the red outline clears |
| 4 | Reload the page without saving | The field returns to the captured starting value |

**Notes**: Empty-input case. The threshold cannot be left blank — the app substitutes zero on blur. Step 2 and step 3 must be asserted separately: the red outline exists only while focus is in the empty field, so a check that runs after blur would see a clean `0%` and conclude, wrongly, that clearing the field was accepted without comment.

---

## TC-DSM-CRT-026: Undoing an edit returns Save to disabled

**Automatable**: Yes
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current GAV Discount Threshold value and remember it, and read the Save button | The starting value is captured and Save is disabled |
| 2 | Clear the field, type a different valid value one character at a time, and move focus away | The field shows the new value and Save is enabled |
| 3 | Clear the field, type the captured starting value back one character at a time, and move focus away | The field shows the original value again and Save returns to disabled |

**Notes**: Dirty-tracking case. The form compares values rather than merely noticing the field was touched, so restoring the original genuinely cancels the edit. Step 3 must read Save only after focus has left the field — the comparison runs on blur, and Save reads as enabled for as long as the cursor is still in the box. No reload is needed to clean up: step 3 already leaves the form pristine.

---

## TC-DSM-CRT-027: Selecting Mexico re-queries the grid

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604 on the Company Matrix tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Country list and choose `Mexico` | Country shows `Mexico` and the page issues a re-query |
| 2 | Wait until no loading placeholders remain | The grid finishes reloading for the new country |
| 3 | Restore: open the Country list and choose `United States` | Country shows `United States` and the grid reloads again |

**Notes**: Third of the four countries. Country is a filter, not a saved setting, so this changes no stored data and no Save is pressed.

---

## TC-DSM-CRT-028: Selecting Bahamas re-queries the grid

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604 on the Company Matrix tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Country list and choose `Bahamas` | Country shows `Bahamas` and the page issues a re-query |
| 2 | Wait until no loading placeholders remain | The grid finishes reloading for the new country |
| 3 | Restore: open the Country list and choose `United States` | Country shows `United States` and the grid reloads again |

**Notes**: Fourth and last country. With TC-DSM-CRT-007 and TC-DSM-CRT-027 this completes every option the Country list offers.

---

## TC-DSM-CRT-029: Selecting MXN re-queries the grid

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604 on the Company Matrix tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Currency list and choose `MXN` | Currency shows `MXN` and the page issues a re-query |
| 2 | Wait until no loading placeholders remain | The grid finishes reloading |
| 3 | Restore: choose `USD` again | Currency shows `USD` and the grid reloads |

**Notes**: Third and last currency. With TC-DSM-CRT-008 this completes the Currency list.

---

## TC-DSM-CRT-030: Selecting SVP Productions re-queries the grid

**Automatable**: Yes
**Surface_Family**: result-fidelity (QUICK)
**Preconditions**: The Discount Matrix page is open and hydrated for office 1604 on the Company Matrix tab.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Business Tier list and choose `SVP Productions` | Business Tier shows `SVP Productions` and the page issues a re-query |
| 2 | Wait until no loading placeholders remain | The grid finishes reloading |
| 3 | Restore: choose `Standard` again | Business Tier shows `Standard` and the grid reloads |

**Notes**: Third and last business tier. With TC-DSM-CRT-009 this completes the Business Tier list.

---
