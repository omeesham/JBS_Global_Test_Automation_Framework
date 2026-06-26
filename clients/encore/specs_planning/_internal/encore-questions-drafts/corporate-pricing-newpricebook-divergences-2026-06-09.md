> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

# Encore Questions — Corporate Pricing New Pricebook create flow (NM-1440) divergences

**Date**: 2026-06-09
**Module**: Corporate Pricing → New Pricebook (`/settings/corporate-pricing/add?type=equipment|labor`)
**Source**: SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK GIVER live walk (Playwright CLI, office 1604, both Equipment + Labor options)
**Oracle**: DOCX `Pricing-Functional Details-JIRA STORIES 1.docx` §NM-1440 + XLSX helpers `TC-ENC-PRC-1440-001..025`
**Status**: RAISED — `/encore-questions` Tier-A review. Q3 + Q4 flagged for Encore-team confirmation (possible product gaps); Q1/Q2/Q5 dispositioned internally as intentional UI.

> Per master Doctrine 2 + the FCC-field-testing extension: each divergence is asserted as live reality in the tests AND raised here — never silently absorbed, never false-filed as a `BUG-*` (all are spec-vs-build clarifications). The single walk-created stray record is disclosed under Q4.

---

## Q1 — Price Book Type is a disabled/display-only field on the create page (route-param-fixed)

**XLSX helpers 007/008/009** assume an in-page **Price Book Type dropdown** (select Equipment / select Labor / "lists only Equipment and Labor").

**Live (2026-06-09)**: on `/add?type=equipment` the `Labor / Equipment` combobox is **disabled** with value `Equipment`; on `/add?type=labor` it is **disabled** with value `Labor`. The Equipment/Labor choice is made upstream at the Search `+ New ▾` split-button (already covered by TC-LOC-CPR-016/017); the create page only reflects it.

- **Disposition**: intentional UI split (choice at entry point, display-only on destination). Not a defect. Tests assert Type is present, correct per route param, and disabled.
- **Assessment**: low risk; dispositioned internally.

---

## Q2 — New Pricing Strategy dialog has boolean flags, not a "Type" field

**XLSX helpers 016/020** describe adding a strategy with "**Strategy Name + Type**" (and "Add blocked when Strategy Type is empty").

**Live (2026-06-09)**: the "New Pricing Strategy" dialog has **Strategy Name + four boolean flags** (Is GSO / Is Active [checked by default] / Is Internal / Is Productions) — there is **no separate "Type" field**. (Mirrors the Pricing Strategy editor on the Details page.)

- **Disposition**: the flags express the strategy classification; helper 020's "type empty" case does not apply. Empty **Name** is the real gating case (covered — see Q-note below). Dispositioned internally.
- **Live add-gating**: clicking "Add" with an empty Strategy Name is a **no-op** (Total unchanged, dialog stays open) — asserted in the spec.

---

## Q3 — Price Year accepts decimals and 2-digit values client-side — possible validation gap

**XLSX helper 013** expects a **decimal** Price Year to be **rejected**; helper 010 implies a 4-digit year.

**Live (2026-06-09)**: the Price Year input rejects **alpha** (reverts to last valid) but **accepts** a decimal (`"20.5"`) and a 2-digit value (`"12"`) — Save stays enabled in both cases. Server-side validation on commit was **not** exercised (no-commit design — see Q4).

- **Question (Encore team)**: should Price Year enforce a 4-digit integer client-side? Today only non-numeric is blocked; `20.5` / `12` pass the client save-gate.
- **Assessment**: possible client-validation gap. Raised. Not filed as a BUG (server may still reject on commit; unverified). The spec asserts the *verified* client behaviors (empty blocks Save; alpha rejected) and documents the decimal/short-year acceptance without asserting persistence.

---

## Q4 — A committed New Pricebook has no UI delete / deactivate path (irreversible)

**Live (2026-06-09)**: after a successful save the app redirects to the new pricebook's Details page, but **no delete, deactivate, or remove affordance exists anywhere** — not on the Details page (only Pricing Strategy / Pricing Detail / Save), not on the Search action bar (New / Pricing Override / Loc Pricing Export-Import / Export / Import / Grid Options), not in the Actions menu, not at row level. A created pricebook is permanent via the UI.

- **Question (Encore team)**: is there an intended path to delete or deactivate a pricebook created in error? (Affects test-data hygiene and real user error-recovery.)
- **Impact on automation**: this is why the New Pricebook spec is **no-commit** — it asserts the create-form behavior + Save *reachability* (Save enabled → "Save Changes" dialog appears → Cancel) and never confirms the commit in CI, so CI never accretes records.
- **Disclosure (mutation-safety transparency)**: the GIVER walk committed **one** record `QA-AUTODEL-20260609-EQ` (GUID `ecf3a7cd-34e4-44e6-8a8f-b007447e2a73`, office 1604) — the only way to learn the save endpoint + post-save redirect (LR-056 discovery procedure). It cannot be removed via the UI; if a delete path or DB cleanup is available, this record can be purged.

---

## Q5 — Save requires at least one strategy (not stated as such in the DOCX)

**DOCX R1440-9 "Empty-Shell"** says Save handles an empty **product-group** array gracefully.

**Live (2026-06-09)**: Save is disabled until **Pricebook Name + Price Year + ≥1 strategy** are all present. With zero strategies, Save stays disabled regardless of header completeness. Product groups remain optional (Empty-Shell = zero product groups, still ≥1 strategy).

- **Disposition**: a strategy appears to be mandatory; "Empty-Shell" refers to product groups, not strategies. Tests assert the ≥1-strategy precondition. Confirm the rule with the Encore team if "save with zero strategies" was intended to be allowed.
- **Assessment**: low risk; most likely intentional (a pricebook needs at least one pricing strategy).

---

## Resolution path

1. `/encore-questions` Tier A: confirm Q1/Q2/Q5 are intentional UI against any newer DOCX revision.
2. Forward **Q3** (Price Year validation) and **Q4** (no delete path + stray record) to the Encore product team (LR-ENC-001 escalation chain) — these are possible product gaps with real-user impact.
3. Tests stay GREEN against live reality in the interim (Doctrine 2 — assert live, raise divergence, never a deliberately-failing test for a non-defect; no-commit for the irreversible save).
