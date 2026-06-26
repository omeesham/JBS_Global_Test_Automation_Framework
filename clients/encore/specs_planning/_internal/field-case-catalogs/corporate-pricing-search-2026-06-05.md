> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

---
module: corporate-pricing-search
phase: 1 (P1 DOCX-functional — FCC field-matrix is Wave-2 P2)
date: 2026-06-05
identity: GIVER
subplan: plans/pending/SUBPLAN_CORP_PRICING_1445_SEARCH_P1.md
field_inventory: clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.md
baseline: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
helper_workbook: clients/encore/docs/jira_pricing_test_cases.xlsx (sheet "NM-1445 Pricing Search", 30 TC-ENC-PRC-1445-* helpers)
docx_oracle: clients/encore/docs/Pricing-Functional Details-JIRA STORIES 1.docx §NM-1445
---

# Field-Case Catalog — Corporate Pricing Search (NM-1445), P1 slice

> **Scope**: this is the **P1 (DOCX-functional)** slice per master Doctrine 1 (P1 first, FCC second, edge third). The full FCC field-matrix (BVA / each-option / negative / compound) is **Wave-2 P2**, authored on activation of `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md` (which consumes this catalog + the field-inventory). The `(b)` rows below point at that grep-verifiable recipient (LR-040(b)).

## Field-state corrections applied (live walk, truth hierarchy: live DOM > DOCX > helper XLSX)

| Correction | DOCX/helper claim | Live truth (2026-06-05) | Disposition |
|---|---|---|---|
| Filter model | "All filtering client-side, no API calls" | **server-side, on Search button** (`/pricing/strategies?<params>`); staging only on input | D2 divergence RAISED (encore-questions); tests assert live |
| Results columns | 8 (incl "Productions Currency") | **9** (Is Productions + Currency split) | D1 divergence RAISED; cover 8 names + assert 9 |
| Pricing Strategy filter | dropdown (helpers 009/010) | **text input** ("Enter strategy") | corrected to text-filter cases |
| Active Only default | unspecified (helper 003 [ASSUMPTION]) | **checked** | resolved |
| Component-load endpoint | `[/api/Pricebook/All/List]` (placeholder) | `/navigator/api/location/pricing/strategies` | placeholder→real |

## 1. Coverage ledger — what each P1 TC proves

| TC | Field / surface | Assertion proven |
|---|---|---|
| TC-LOC-CPR-001 | component / list endpoint | single `/pricing/strategies` call on mount + grid populates |
| TC-LOC-CPR-002 | grid columns | all 8 DOCX names present + live 9 (D1 split) |
| TC-LOC-CPR-003 | all 7 filters | default/baseline state (Active Only checked) + item-count pattern |
| TC-LOC-CPR-004 | boolean columns | Unicode ✔ / empty render (LR-036) |
| TC-LOC-CPR-005 | Pricebook (text) | stage on type → Search narrows server-side (`pricebookName` param) |
| TC-LOC-CPR-006 | Pricing Strategy (text) | text-input stage → Search narrows (corrected from dropdown) |
| TC-LOC-CPR-007 | Currency (dropdown) | options [All Currencies, USD, CAD, MXN] + select→Search narrows |
| TC-LOC-CPR-008 | Location (dropdown) | default "All Locations" + searchable options present (>200) |
| TC-LOC-CPR-009 | Is Internal (checkbox) | stage → Search narrows to internal (`isInternal=true`) |
| TC-LOC-CPR-010 | Is Labor (checkbox) | stage → Search narrows (`isLabor=true`) |
| TC-LOC-CPR-011 | Active Only (checkbox) | default checked; uncheck → Search reveals inactive |
| TC-LOC-CPR-012 | Reset | clears all inputs + restores full list (client-side) |
| TC-LOC-CPR-013 | network (staging) | no `/pricing/strategies` call while typing/selecting (D2 client-side stage) |
| TC-LOC-CPR-014 | network (Search) | Search submits one server query with staged params (D2 server-side) |
| TC-LOC-CPR-015 | row → details | Price Book name click → `/details/<guid>` (D4) |
| TC-LOC-CPR-016 | New → Equipment | route-param `?type=equipment` (DOCX R1445-4 Must) |
| TC-LOC-CPR-017 | New → Labor | route-param `?type=labor` (DOCX R1445-4 Must) |
| TC-LOC-CPR-018 | action bar | 7 buttons present + New affordance |

## 2. Gap matrix — surface × case-type (a = P1 net-new / b = FCC-P2 deferred / c = N/A or documented-deferral)

| Surface | Default/baseline | Positive narrow (P1) | BVA / special / each-option | Compound | Network classification | Class + disposition |
|---|---|---|---|---|---|---|
| Pricebook (text) | TC-003 (a) | TC-005 (a) | **(b) FCC-P2** (overflow 007, special 008) | (b) | TC-013/014 (a) | P1 covered; BVA→(b) |
| Pricing Strategy (text) | TC-003 (a) | TC-006 (a) | **(b) FCC-P2** (no-match, special) | (b) | TC-013 (a) | P1 covered; edges→(b) |
| Location (dropdown) | TC-003/008 (a) | TC-008 presence (a) | **(b) FCC-P2** each-option (2652, LR-025) | (b) | TC-013 (a) | default+presence P1; each-option→(b) |
| Currency (dropdown) | TC-003/007 (a) | TC-007 (a) | **(b) FCC-P2** each-currency | (b) | TC-013 (a) | enum + one-narrow P1; each→(b) |
| Is Internal (checkbox) | TC-003 (a) | TC-009 (a) | n/a (c) | (b) compound | TC-013/014 (a) | P1 covered |
| Is Labor (checkbox) | TC-003 (a) | TC-010 (a) | n/a (c) | (b) | TC-013 (a) | P1 covered |
| Active Only (checkbox) | TC-003/011 (a) | TC-011 (a) | n/a (c) | (b) | TC-013 (a) | P1 covered |
| Reset | n/a | TC-012 (a) | idempotency edge (b) | TC-012 (a) | TC-012 (a) | P1 covered |
| Grid columns | TC-002 (a) | n/a | n/a (c) | n/a | n/a | P1 covered |
| Booleans | TC-004 (a) | n/a | n/a (c) | n/a | n/a | P1 covered (LR-036) |
| Row→details | n/a | TC-015 (a) | n/a (c) | n/a | n/a | P1 covered (D4) |
| New route-param | n/a | TC-016/017 (a) | n/a (c) | n/a | n/a | P1 covered (DOCX Must) |
| Action bar | TC-018 (a) | n/a | Pricing Override dest **(c)** DOCX-TBD | n/a | n/a | presence P1; deep-nav (c) |
| Compound multi-filter | n/a | n/a | n/a | **(b) FCC-P2** (helper 030) | (b) | deferred |

DOM-tamper negative cases → (c) low-ROI / ALL-088 (Radix combobox text-tamper crashes the host page) — never authored against the Location/Currency comboboxes.

## 3. Deferred items (LR-040 — grep-verifiable recipients)

**(b) → `plans/pending/SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md`** (exists; seed list appended with these items 2026-06-05):
- Pricebook BVA/overflow (helper 007), special-chars literal (helper 008).
- Pricing Strategy / Location / Currency each-option enumeration.
- Compound multi-filter (helper 030).
- Reset idempotency edges.
- Per-filter Search query-param shape (D2 deep network).

**(c) documented (no recipient needed)**:
- "Pricing Override" / "Price Over-ride" navigation destination — DOCX line 22 "URL: TBD"; destination page not built. Presence covered (TC-018).
- Location each-option across 2652 options — representative behavior proven by Currency (TC-007).

**Total**: 18 P1 TCs (`TC-LOC-CPR-001..018`, Search band 001–099). 30 helpers fully classified (27 → P1, 007/008/030 → (b), 028-destination → (c)).
