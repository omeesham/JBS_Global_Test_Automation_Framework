# Encore Questions — Corporate Pricing Search (NM-1445) divergences

**Date**: 2026-06-05
**Module**: Corporate Pricing → Search (`/settings/corporate-pricing`)
**Source**: SUBPLAN_CORP_PRICING_1445_SEARCH_P1 GIVER live walk (Playwright CLI, office 1604)
**Oracle**: DOCX `Pricing-Functional Details-JIRA STORIES 1.docx` §NM-1445
**Status**: DRAFT — awaiting `/encore-questions` Tier-A review + (if unresolved) escalation to the Encore team

> Per master Doctrine 2: each DOCX divergence is asserted as live reality in the tests AND raised here as a clarification — never silently absorbed. Neither item is filed as a `BUG-*` (both are spec-vs-build clarifications, not application defects).

---

## Q1 — Results grid: DOCX says 8 columns, live renders 9 (D1)

**DOCX (NM-1445 §Columns/Fields to Display)** lists **8** columns:
`Price Book, Price Book Strategy, Price Year, is GSO, is Internal, is Labor, is Active, Productions Currency`.

**Live (2026-06-05)** renders **9** columns — the DOCX's single "Productions Currency" is split into **two** columns: `Is Productions` (boolean) + `Currency` (e.g. USD).

- All 8 DOCX-named columns ARE present (gospel coverage satisfied); the divergence is the extra split.
- **Question**: is the 8→9 split (separate `Is Productions` boolean + `Currency` value column) the intended final design, or should "Productions Currency" be a single combined column per the DOCX? (Tests currently assert the live 9 + verify all 8 DOCX names present.)
- **Assessment**: likely a benign, intentional UI expansion (a boolean flag + a currency code are more useful separated). Low risk.

---

## Q2 — Filtering is server-side (on Search), not client-side as the DOCX states (D2) — **higher impact**

**DOCX (NM-1445 §Search Criteria Section, Logic)** states verbatim:
> "All filtering in this section must be performed **client-side**. **No API calls** should be triggered when typing or selecting filters."

**Live (2026-06-05, network-verified)**:
- On component load, a single `GET /navigator/api/location/pricing/strategies?isActive=true&isInternal=false&isLabor=false&pageNumber=1&pageSize=50` populates the grid (server pagination, `pageSize=50`, 591 total).
- Typing in a text filter, toggling a checkbox, or selecting a dropdown fires **no** API call and does **not** change the grid — the filter is **staged**.
- Clicking **Search** fires a **new** `GET /pricing/strategies?<all staged filters as query params>` (e.g. `&isInternal=true` → "3 items"; `&pricebookName=2021-PB6` → "1 item"). **Filtering is performed SERVER-SIDE, on the Search button.**
- Reset restores the form defaults + the full 591-row list **client-side** (cached original list; no call).

- **Narrow technicality**: the DOCX's "no API calls when typing or selecting" is literally TRUE (staging fires nothing). But the DOCX's headline premise — "all filtering client-side" — is **FALSE**: the filtering is a server query triggered by Search, with server-side pagination.
- **Question**: is the server-side, Search-button-triggered, paginated filter model the intended final design (superseding the DOCX "client-side" wording, which reads as an early-draft assumption)? The DOCX itself marks the Search action endpoint "Search Pricing (Work in Progress) → Call [API_Endpoint]", suggesting the server path was always the plan.
- **Impact on tests**: P1 cases assert the live staging+Search-server-query model (the load fires exactly one list call; typing/selecting fires none; Search submits a server query and narrows; Reset restores). If the DOCX "client-side" wording is later honored instead, these assertions change.

---

## Resolution path

1. `/encore-questions` Tier A: re-confirm both against any newer DOCX revision / a second office.
2. If unresolved internally → forward Q1 + Q2 to the Encore product team (per LR-ENC-001 escalation chain).
3. Tests stay GREEN against live reality in the interim (Doctrine 2 — assert live, raise divergence, never a deliberately-failing test for a non-defect).
