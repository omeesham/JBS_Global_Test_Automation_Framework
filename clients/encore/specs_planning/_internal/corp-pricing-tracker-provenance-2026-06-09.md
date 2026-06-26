> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

# Corporate Pricing tracker — provenance & classification ledger

**Date**: 2026-06-09
**Purpose**: source-of-truth audit trail for `clients/encore/test_cases_xlsx/tracker_corp_pricing.xlsx`. Every tracker row maps to a dated live-walk artifact (no assumptions) and carries a read-only Jira dedupe verdict (so we never hand Encore back a ticket they already filed/fixed). **Internal only — gitignored, never ships. The xlsx itself contains no Jira IDs.**

**Evidence-freshness basis (LR-007/LR-013)**: all source artifacts are dated 2026-06-05 / 2026-06-08 / 2026-06-09 — ≤4 days old, inside the ≤14-day freshness window. Per the spot-check path, fresh dated field-inventories / encore-questions drafts / subplan execution summaries are valid Phase-0.5 evidence **without** a fresh re-walk. This is a compilation of evidenced findings, not new QA.

**Jira verification (read-only, this session)**: all referenced NM-#### tickets queried live against `encore.atlassian.net` (project NM). **No Jira writes.** Used purely as a dedupe filter.

---

## Classification key (mirrors the existing encore-qa-tracker)
- 🔴 RED = confirmed defect, needs a fix.
- 🟡 YELLOW = behaves as reported; by-design / product decision needed (confirmation required).
- 🟢 GREEN = issue no longer present on retest.
- blank = enablement / internal note.

---

## FINAL state — 5 rows (after 2026-06-09 curation pass)

The workbook holds **5 rows: A1 (confirmed defect, 🔴) + C1–C3 (product/UX questions, 🟡) + D1 (testability, blank).**

| Final # | Was | Color | Title | Disposition |
|---|---|---|---|---|
| A1 | C8 (question) | 🔴 RED | Pricing Detail Max Discount >100 silently traps focus (no error, no escape) | **PROMOTED to confirmed defect** — reproduced live by manual user entry 2026-06-09 (value 333 on price book 2022-PB10, Pricing Detail tab). The 100% cap is reasonable; the defect is the silent focus-trap with no validation message and no way to leave the field except manually lowering the value. |
| C1 | C4 | 🟡 | Pricing Detail grid is flat; spec describes expandable group→items hierarchy | KEEP (user: "not bs"). |
| C2 | C6 | 🟡 | New Pricebook: Price Year keeps decimals / 2-digit values | KEEP (user: "not bs"). |
| C3 | C7 | 🟡 | New Pricebook: no delete/deactivate path for a created pricebook | KEEP (user: "not bs"). |
| D1 | D1 | blank | ~19 stable `data-testid` hooks requested (module ships with effectively zero) | KEEP — enablement request. |

---

## Final curation pass — 2026-06-09 (Jira-comment dedupe + user verdicts)

Each prior candidate row was re-walked live this session AND its closest Jira ticket's **comments** (not just status) were read. User adjudicated each as "bs" (drop) / "not bs" (keep). Decisions:

| Prior # | Live + Jira-comment evidence (read this session) | Verdict |
|---|---|---|
| C1 (server-side Search filter) | Feature works; the spec's "client-side" wording is benign drift. NM-2137/2078/2029 are Encore's own *search defects* (Done) — different topic. | **DROP** (user: bs, "feature works, no problem if drifted from spec"). |
| C2 (9 vs 8 columns) | Benign "Productions Currency" → "Is Productions" + "Currency" split; all spec columns present. | **DROP** (user: bs). |
| C3 (History tab absent) | NM-1444 (History tab Story) — the tab is intentionally not delivered on this screen. | **DROP** (user: bs). |
| C4 (flat grid) | NM-1443 (Pricing Details Tab, status QA) description confirms the expandable group→items hierarchy IS the intended design; sole comment (Milan Patel, 2026-04-30): *"This ticket is currently blocked by API for Pricebook details save and fetch"* → intended-but-not-built. | **KEEP → C1** (user: "confirmed not a bs, keep"). Framed as interim-vs-final question (no Jira reference in xlsx). |
| C5 (Price shows saved override after save) | NM-2094 ("Not a bug — New Price Value Disappears After Saving"). Cat Meister comment (2026-06-03): *"The expected behavior is that the value entered in the new price field updates the price field… The new price field is only for data entry. Once it's saved it should not be populated."* Priyanka verified working 2026-06-05. → intended design. | **DROP** (user: bs). |
| C6 (Price Year keeps decimals/2-digit) | NM-2057 (Done) is only about the *required-field indicator*, NOT format validation. Dev comment (Manish): "if invalid it will display the error on Save" — but decimal/short-year acceptance is undocumented. No ticket covers the format question. | **KEEP → C2** (user: "not bs" — "a year field that accepts all numbers"). |
| C7 (no delete/deactivate path) | Zero Jira tickets (issues OR Confluence) for pricebook delete/deactivate. No UI affordance found live. Pure UX/error-recovery observation (no spec mandate — our best-practice concern). | **KEEP → C3** (user: "not bs"). |
| C8 (Override/Max Discount validation question) | NM-1463 (Override screen, QA) — 16 comments, all implementation detail (API/filters/pagination/CSS); **zero** define Override Price / Max Discount validation rules. **Then user reproduced a real defect live**: Max Discount >100 on the Pricing Detail grid traps focus with no error and no escape. | **PROMOTE → A1 🔴** (real defect, human-confirmed). |
| C9 (Export/Import payload/format) | NM-1446 (master Import/Export Story, QA) documents all 4 variants + flags + filenames (`EquipmentPricings.csv` etc.) + mechanism (export=server snapshot; export file IS the import template; import=delta→select-to-publish). Variants confirmed live (toolbar-io specs green). **Cat Meister flagged it 2026-06-03: "Need all import/export bugs to be resolved before we can test."** Manish 2026-04-24: "on hold." ~12 open export/import bugs, all Encore's own. | **DROP** — variants/mechanism answered + confirmed; remaining gap (exact CSV columns/validation) is moot, blocked on Encore's own known-broken WIP. Re-listing = handing back their tickets. |

**A1 detail (the promoted defect):** on the Pricing Detail tab, entering a Max Discount value over 100 (user used 333 on 2022-PB10) prevents leaving the cell — click-away and Tab are both inert, no error/tooltip/validation message is shown, and the only escape is to manually lower the value to ≤100. Reproduced under **faithful manual human conditions** (unlike the dropped former-A1 Save bug, which was a `playwright-cli` React-commit artifact). 🔴 RED — needs a fix; the 100% cap itself is reasonable.

**A1 internal lead (UNCONFIRMED — not in the client tracker):** the bug-pattern sweep (`agent-mistakes.md` 2026-06-10) found the SAME >100 reject mechanic on the **Product Group Override screen's Max Discount %** — `tryMaxDiscount` (`corporate-pricing-override.page.ts:283`) shows the editor stays open / refuses to commit on >100, which is the same shape as the Detail trap. This very likely means the silent focus-trap repeats on the Override screen too. It is **deliberately NOT added to the client tracker**: it is not human-confirmed, and `playwright-cli` cannot faithfully judge the trap (that fragility is precisely why A1 was missed for so long). Flagged here for a human spot-check before it ever becomes a client-facing row. Remediation (enhance the helper + re-point `TC-523` at an announced+escapable oracle) is captured in the mistakes log for the next FCC session.

---

## Prior live re-verification record — 2026-06-09 (superseded by the curation pass above for final IDs)

Kept as the historical read-evidence log (Opus CLI + Haiku replication) for the original C1–C9 candidate set, before the curation drops/renumber:

| Item | Live method (2026-06-09) | Result |
|---|---|---|
| C1 server-side filter | Opus CLI network capture + Haiku reproduce | Typing fired 0 calls; Search fired `GET /api/location/pricing/strategies?...&pageSize=50 → 200`. CONFIRMED. |
| C2 9 columns | Opus CLI `th` read + Haiku reproduce | 9 headers; spec's "Productions Currency" split into Is Productions + Currency. CONFIRMED. |
| C3 History tab absent | Opus CLI + Haiku reproduce | Only Pricing Strategy + Pricing Detail tabs; no History anywhere. CONFIRMED. |
| C4 flat grid | Opus CLI + Haiku reproduce | 2430 rows, no expand control, no row buttons, no `aria-expanded`. CONFIRMED. |
| C5 Price = saved override | Haiku spec TC-LOC-CPR-218 (faithful runner) | GREEN — saved New Price becomes the row Price after reload. CONFIRMED. |
| C6 Price Year decimals/short | Opus CLI keystrokes (light-DOM, native commit works) | `20.5` ✓, `12` ✓, `abc` → empty (letters rejected). CONFIRMED. |
| C7 no delete/deactivate path | Opus CLI affordance scan | None on create page, Details page, or Search action bar. CONFIRMED. |
| C8 Max Discount cap 100 | Haiku spec TC-LOC-CPR-523 (faithful runner) | GREEN — `>100%` rejected (capped at 100). CONFIRMED. *(See A1 — the cap reproduces, and the manner of rejection is a defect: silent focus-trap.)* |
| C9 Export/Import variants | Opus CLI menu-open + Haiku reproduce | Both menus = same 4 variants. CONFIRMED. |
| D1 near-zero testids | Opus CLI + Haiku reproduce | Search 3 generic; New Pricebook 0; Override 0; Detail 0. CONFIRMED. |

**Former-A1 (DROPPED) — live verdict:** Opus drove the Pricing Detail grid via `playwright-cli` on fixture 2021-PB6. A New-Price-only keystroke left Save disabled — BUT a control edit of **Max Discount** (the documented-reliable dirty lever) ALSO left Save disabled under the same CLI method, proving `playwright-cli` keystrokes do not commit React state on this heavy grid. The "Save won't enable" symptom is therefore a **test-harness artifact, not a product defect**. Faithful contrary evidence: (a) the user's real-human entry on price book 2022-PB3 (2026-06-09) enabled Save; (b) Detail spec TC-LOC-CPR-218 saves a New Price and it persists. Per **LR-044**, this is not a tracker bug. **No save was ever committed during probing — all fixtures untouched.**

---

## Findings DROPPED from the tracker (with reason)

**Test-harness artifact (not a defect):**
- **Former "New-Price-only edit doesn't enable Save"** — DROPPED 2026-06-09. `playwright-cli` React-commit artifact (failed even on the reliable Max-Discount lever); real-user entry enables Save and the New Price persists (TC-218 green). LR-044 → FALSE.

**Behaves correctly / benign spec drift (user verdict "bs"):**
- **Search server-side filter** (former C1) — feature works; "client-side" spec wording is benign.
- **9 vs 8 columns** (former C2) — benign Productions-Currency split.
- **History tab absent** (former C3) — intentionally not delivered here (NM-1444).
- **Price shows saved override after save** (former C5) — intended design per NM-2094 (Cat Meister: New Price is data-entry only, clears after save).

**Answered + moot (Encore's own known WIP):**
- **Export/Import payload/format** (former C9) — variants/flags/filenames/mechanism documented in NM-1446 + confirmed live; remaining gap is blocked by Encore's own flag "can't test until import/export bugs resolved" (~12 open bugs, ticket on hold). Not ours to re-raise.

**Questions we dispositioned ourselves earlier (not "genuinely no answer"):**
- Strategy "Add New dialog vs inline append"; Strategy flag interdependency; New Pricebook "Price Book Type display-only on create"; New Pricebook "dialog has boolean flags not a Type field"; New Pricebook "Save requires ≥1 strategy" — all dispositioned internally as benign/intentional.

**Encore's own already-filed tickets (do NOT hand back)** — verified read-only, dedupe only; none independently re-found as a live regression:
- NM-2029/2059/2078/2137/2095/1967, NM-1870/1889/1932/1961, NM-1625/1986/1997/1998/2005, NM-2126, NM-2164, NM-2022, NM-2047/2068/1675, and the full export/import bug set under NM-1446 (NM-1995/1996/1997/1998/2003/2004/2005/2006/2066/2133/2134/2138/2154/2045/2044/etc.).

---

## Color note
The tracker has **one 🔴 RED row (A1 — Max Discount focus-trap, confirmed live by manual entry)**, **three 🟡 YELLOW questions (C1–C3)**, and **one blank testability row (D1)**. This is the honest state after the 2026-06-09 curation pass: the hard export/import defects are Encore's own already-filed-and-mostly-tracked tickets (excluded); our own remaining findings are one real UX defect plus three genuinely-open product/UX questions plus one enablement request — all re-confirmed live on the current site.
