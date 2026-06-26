# Encore Questions — Corporate Pricing Detail (Pricebook Management, NM-1443) divergences

**Date**: 2026-06-05
**Module**: Corporate Pricing → Pricebook Details → Pricing Detail tab (`/settings/corporate-pricing/details/<guid>`)
**Source**: SUBPLAN_CORP_PRICING_1443_DETAIL_P1 GIVER live walk (Playwright CLI, office 1604, pricebook `2021-PB6`)
**Oracle**: DOCX `Pricing-Functional Details-JIRA STORIES 1.docx` §NM-1443
**Status**: DRAFT — awaiting `/encore-questions` Tier-A review + (if unresolved) escalation to the Encore team

> Per master Doctrine 2: each DOCX divergence is asserted as live reality in the tests AND raised here as a clarification — never silently absorbed. Neither item is filed as a `BUG-*` (both are spec-vs-build clarifications, not application defects).

---

## Q3 — Product-group grid is FLAT in management mode; the DOCX item hierarchy is absent (CPR-DETAIL-Q3)

**DOCX (NM-1443 §2 Pricing Detail)** describes the grid as **Product Groups, which can be expanded to show the individual Items / Products inside each group** — i.e. an expand/collapse hierarchy on each row.

**Live (2026-06-05)** renders the management-mode grid **flat**:
- Every product-group row is a single, non-expandable row. There is no per-row expand/collapse control.
- The seven chevron controls visible on the page belong to the application's navigation sidebar, not to the grid rows.
- No item-level (individual Item / Product) detail is reachable inside the management-mode grid.

- **Question**: is the expandable item hierarchy meant to ship in management mode (editing an existing pricebook), or only in the New-Pricebook build mode? If it is intended for management mode, the flat grid is an omission; if it is New-Pricebook-only, the DOCX wording should be scoped to that mode.
- **Assessment**: likely scoped to New-Pricebook mode (where groups and their items are assembled). In management mode the user edits price overrides on already-associated groups, so a flat list is sufficient. Low-to-medium risk — confirm the intended scope so the spec coverage matches the design.
- **Impact on tests**: the management-mode tests assert the flat grid (no expand/collapse control present). If the hierarchy is later added to management mode, new expand/collapse coverage is required.

---

## Q4 — Price column updates to the saved override; the DOCX says Base Price is a fixed reference (CPR-DETAIL-Q4)

**DOCX (NM-1443 §2 Pricing Detail)** states the **Base Price displays the original global price for reference** — i.e. a read-only column pinned to the catalogue price.

**Live (2026-06-05)** behaves differently:
- The Price column is read-only (it has no editable input), matching the DOCX intent that it is not directly editable.
- BUT after a New Price override is entered and saved, on reload the Price column **shows the saved override value**, not the original catalogue price. The override supersedes the displayed Price; the New Price input clears (it is a staging field).

- **Question**: is "Base Price" meant to stay pinned to the original catalogue price as a permanent reference, or is it correct that the Price column reflects the latest saved override after a save? The live behavior is the latter.
- **Assessment**: medium impact. If the intent is a fixed reference, the post-save Price column should still show the catalogue price (with the override shown elsewhere), and the current behavior is a divergence. If the intent is "Price = the effective price after overrides," the live behavior is correct and the DOCX wording ("original global price for reference") is misleading.
- **Impact on tests**: the override-persistence test asserts the live behavior (the saved override becomes the row's Price on reload). If "Base Price stays pinned" is later confirmed as the intent, that assertion changes.

---

## Resolution path

1. `/encore-questions` Tier A: re-confirm both against any newer DOCX revision / a second office / New-Pricebook build mode.
2. If unresolved internally → forward Q3 + Q4 to the Encore product team (per LR-ENC-001 escalation chain).
3. Tests stay GREEN against live reality in the interim (Doctrine 2 — assert live, raise divergence, never a deliberately-failing test for a non-defect).
