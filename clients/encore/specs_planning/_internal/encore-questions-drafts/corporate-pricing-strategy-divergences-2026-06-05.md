# Encore Questions — Corporate Pricing Pricebook Management / Pricing Strategy (NM-1441) divergences

**Date**: 2026-06-05
**Module**: Corporate Pricing → Pricebook Details / Pricing Strategy (`/settings/corporate-pricing/details/<id>`)
**Source**: SUBPLAN_CORP_PRICING_1441_STRATEGY_P1 GIVER live walk (Playwright CLI, office 1604)
**Oracle**: DOCX `Pricing-Functional Details-JIRA STORIES 1.docx` §NM-1441
**Status**: RAISED — `/encore-questions` Tier-A review complete; CPR-STRAT-Q1 forwarded for Encore-team confirmation (CPR-STRAT-Q2/Q3 dispositioned internally, see below)

> Per master Doctrine 2: each DOCX divergence is asserted as live reality in the tests AND raised here as a clarification — never silently absorbed. None is filed as a `BUG-*` (all are spec-vs-build clarifications, not application defects).

---

## Q1 — Pricebook Details: DOCX names 3 management tabs (incl. History), live renders only 2 (History absent) — **raised for Encore-team confirmation**

**DOCX (NM-1441 §Tabs/Sections)** describes **3** tabs on the Pricebook Details page:
`Pricing Strategy, Pricing Detail, History`.

**Live (2026-06-05)** renders **2** tabs only:
- `Pricing Strategy` (active by default on load)
- `Pricing Detail` (present, activates on click)
- **`History` tab is ABSENT** — it does not render anywhere in the tab row.

- The DOCX itself labels the History tab "(Placeholder)" and ties it to a separate ticket (NM-1444), so the absence reads as "expected-not-yet-built" rather than a regression.
- **Question**: is the History tab intended to ship as part of the Pricebook Details page, and is it simply not built yet (tracked separately), or has it been dropped from the final design? (Tests currently assert the live 2-tab reality AND assert the History tab is absent, so they stay green either way.)
- **Assessment**: low risk; most likely a not-yet-built placeholder. The 2-tab state is asserted as live; the History tab's future arrival is tracked under its own work item. No defect.

---

## Q2 — "Add New" opens a dialog first, where the DOCX implies an inline append

**DOCX (NM-1441 §Pricing Strategy actions)** describes "Add New" as appending a fresh strategy to the list (reads as an inline add).

**Live (2026-06-05)**: the Add ("+") control opens a **"New Pricing Strategy" dialog** first (Strategy Name field + 4 flag checkboxes + Cancel/Add/Close); clicking "Add" in the dialog appends the new strategy row.

- **Disposition**: UI refinement (a guided dialog is richer than a bare inline append), not a defect. The test asserts the live dialog flow.
- **Assessment**: benign, intentional. Dispositioned internally — no Encore-team escalation needed unless the dialog flow is later removed.

---

## Q3 — Strategy flag interdependency (Is Internal / Is GSO disabled when Is Productions is checked) not described in the DOCX

**DOCX (NM-1441 §Pricing Strategy flags)** lists the four flags `Is Productions / Is Internal / Is GSO / Is Active` without describing any interdependency.

**Live (2026-06-05, on the "2022-NP Tier 1" pricebook)**: when `Is Productions` is checked, `Is Internal` and `Is GSO` are **disabled**.

- **Disposition**: an interdependency the DOCX does not mention; the each-flag and boundary coverage is deferred to the FCC follow-up (`SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md`).
- **Assessment**: likely intentional business logic; confirm the exact rule (which flags gate which) during FCC follow-up. Dispositioned internally for now.

---

## Resolution path

1. `/encore-questions` Tier A: re-confirm Q1 against any newer DOCX revision / a second office; confirm Q2/Q3 are intentional.
2. If Q1 is unresolved internally → forward to the Encore product team (per LR-ENC-001 escalation chain) to confirm whether the History tab is planned-but-unbuilt vs dropped.
3. Tests stay GREEN against live reality in the interim (Doctrine 2 — assert live, raise divergence, never a deliberately-failing test for a non-defect).
