> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

---
module: corporate-pricing-search
phase: 2 (P2 FCC field-matrix — BVA / each-option / negative / compound)
date: 2026-06-10
identity: GIVER
subplan: plans/pending/SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md
field_inventory: clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-10.md
base_catalog: clients/encore/specs_planning/_internal/field-case-catalogs/corporate-pricing-search-2026-06-05.md
baseline: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md (baseline-absent)
docx_oracle: clients/encore/docs/Pricing-Functional Details-JIRA STORIES 1.docx §NM-1445
taxonomy: clients/encore/specs_planning/_internal/field-case-generation.md
---

# Field-Case Catalog — Corporate Pricing Search (NM-1445), **FCC P2 slice**

> **Scope**: the Wave-2 FCC field-matrix (BVA / special / each-option / compound / reset-idempotency) for the Search page. Consumes the P1 catalog's `(b)` deferrals (helpers 007/008/030 + each-option enumeration) and the live FCC walk (`field-inventories/corporate-pricing-search-2026-06-10.md`). Read-only screen → **no save-cycle**; the §2 "Save-cycle" column collapses to "Search-cycle" (stage → Search → server re-query → restore).

## (b) deferrals consumed from the P1 catalog (LR-040 receipt)

The P1 catalog `## 3. Deferred items` routed these here; this FCC slice discharges each:

| P1 (b) item | Discharged by |
|---|---|
| Pricebook BVA/overflow (helper 007) | TC-LOC-CPR-020 |
| Pricebook special-chars literal (helper 008) | TC-LOC-CPR-021 |
| Compound multi-filter (helper 030) | TC-LOC-CPR-030 |
| Pricing Strategy / Currency / Location each-option enumeration | TC-LOC-CPR-023 / 024 / 025 |
| Reset idempotency edges | TC-LOC-CPR-029 |
| Per-filter Search query-param shape (D2 deep network) | asserted inside TC-019..030 (every case asserts its live param) |

## Field-state truths applied (live walk 2026-06-10 — truth hierarchy: live DOM > DOCX > helper XLSX)

| Correction vs P1 | P1 claim | FCC-walk truth | Where used |
|---|---|---|---|
| Pricing Strategy param | `strategyName` (guessed "by symmetry") | **`pricingStrategyName`** | TC-023 |
| Currency param | (not enumerated) | **`currencyId`** int — USD=1, CAD=2, MXN=3 | TC-024 |
| Location param | (not enumerated) | **`locationNo`** (office #) | TC-025 |
| Active Only off | (assumed `isActive=false`) | **param OMITTED** when unchecked | TC-028 |
| Is Labor semantics | (assumed "narrows") | labor is a **different/larger set** (631 vs 592), not a narrow | TC-027 |
| Pricebook boundaries | (deferred) | no `maxlength`; special chars literal+encoded+no-crash+escapable; whitespace → full list | TC-020/021/022 |

## 1. Coverage ledger — what each FCC TC proves (per field-case-generation §2)

| TC | Field / surface | §2 case-type | Assertion proven |
|---|---|---|---|
| TC-LOC-CPR-019 | Pricebook (text) | Negative — no-match | `pricebookName=<rand>` server query → `0 items found` |
| TC-LOC-CPR-020 | Pricebook (text) | BVA — overflow (max+) | 250-char input accepted (no maxlength, full literal staged) → server `0 items`, no crash + §2.1 oracle |
| TC-LOC-CPR-021 | Pricebook (text) | Negative — special chars | literal `%_'"<>&#` staged, URL-encoded in query, `0 items`, **no client-side exception**, `aria-invalid=null`, **Tab escapes** (§2.1 (a)+(b)) |
| TC-LOC-CPR-022 | Pricebook (text) | Negative — whitespace-only | `pricebookName=+++` → **full 592 list** (server ignores whitespace), no crash + §2.1 oracle |
| TC-LOC-CPR-023 | Pricing Strategy (text) | Negative — no-match | `pricingStrategyName=<rand>` → `0 items` (corrects the P1 param guess) |
| TC-LOC-CPR-024 | Currency (combobox) | each documented option | USD/CAD/MXN each stage → Search carries the live `currencyId` (1/2/3); distinct server query per option |
| TC-LOC-CPR-025 | Location (combobox) | each-option (representative, LR-025) | select first real location → `locationNo=<office#>` + grid narrows (2652 opts → representative, not enumerated) |
| TC-LOC-CPR-026 | Is Internal (checkbox) | toggle + revert | on → `isInternal=true` (changes set), off → Search → restores base count |
| TC-LOC-CPR-027 | Is Labor (checkbox) | toggle + revert | on → `isLabor=true` (labor set), off → Search → restores base count |
| TC-LOC-CPR-028 | Active Only (checkbox) | toggle + revert | uncheck → `isActive` param OMITTED → reveals inactive; re-check → `isActive=true` → restores base |
| TC-LOC-CPR-029 | Reset | idempotency edge | Reset after compound restores full list with **0 server calls**; **double-Reset = no-op** (still 0 calls); inputs cleared |
| TC-LOC-CPR-030 | Compound multi-filter | compound (helper 030) | text + dropdown + checkbox staged → **single** Search query carries all params (`pricebookName`+`currencyId`+`isInternal`); 0 calls while staging |

## 2. Gap matrix — surface × case-type (a=P1 covered / **F=FCC P2 net-new here** / c=N/A or documented-deferral)

| Surface | Default | Positive narrow | BVA / special / each-option | Negative | Compound | Class |
|---|---|---|---|---|---|---|
| Pricebook (text) | a (TC-003) | a (TC-005) | **F** overflow (020) | **F** no-match (019), special (021), whitespace (022) | F (030) | FCC done |
| Pricing Strategy (text) | a (TC-003) | a (TC-006) | shares Pricebook text class (021 covers special) | **F** no-match (023) | F (030) | FCC done |
| Currency (combobox) | a (TC-003/007) | a (TC-007 USD) | **F** each-option CAD/MXN/USD param (024) | tamper → (c) ALL-088 | F (030) | FCC done |
| Location (combobox) | a (TC-003/008) | a (TC-008 presence) | **F** representative each-option (025, LR-025) | tamper → (c) ALL-088 | (c) low-ROI | representative |
| Is Internal (checkbox) | a (TC-003) | a (TC-009) | n/a (c) | n/a | **F** revert (026) + compound (030) | FCC done |
| Is Labor (checkbox) | a (TC-003) | a (TC-010) | n/a (c) | n/a | **F** revert (027) | FCC done |
| Active Only (checkbox) | a (TC-003/011) | a (TC-011) | n/a (c) | n/a | **F** revert (028) | FCC done |
| Reset | n/a | a (TC-012) | **F** double-idempotency + no-call (029) | n/a | a (TC-012) | FCC done |

**§2.1 rejection-affordance oracle** applied to every Negative/BVA case (020/021/022): each asserts **(a) announced** (`aria-invalid` stays null — no false rejection; the input is a search filter that accepts any literal) AND **(b) escapable** (a natural Tab blurs focus out — recorded BEFORE any cleanup Escape; the helper never auto-Escapes first). Graduated from the 2026-06-10 `TC-523` focus-trap miss. Live result: the plain `<input>` is safe (escapes, no crash) — unlike the Radix combobox (ALL-088, never tampered).

## 3. Deferred / out-of-scope (LR-040)

- **(c)** Location exhaustive each-option across 2652 options — representative single-location proven (TC-025); full enumeration is low-ROI + LR-025 large-dropdown territory. Documented, no further recipient.
- **(c)** DOM-tamper negative cases on the Location/Currency Radix comboboxes — **forbidden** (ALL-088: combobox text-tamper crashes the host page). Never authored.
- **(EDGE_P3)** 591-row virtualization stress + content-anchored integrity under compound filters → already owned by `SUBPLAN_CORP_PRICING_EDGE_P3.md` (not re-covered here).

**Total**: 12 FCC TCs `TC-LOC-CPR-019..030` (Search band 001–099, continuing after S1's 001–018). All live-grounded 2026-06-10; 0 app bugs; 0 new `/encore-questions` clarifications (the param contract is correct-looking, just previously unverified).
