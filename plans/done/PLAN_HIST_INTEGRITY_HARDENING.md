# PLAN: History Integrity Hardening — Parent→Column Mapping & Per-Save Correspondence

**Created**: 2026-04-17
**Status**: SUPERSEDED
**Superseded by**: [PLAN_HIST_COLUMN_FIRST_PIVOT.md](PLAN_HIST_COLUMN_FIRST_PIVOT.md) on 2026-04-20
**Executed**: 2026-04-20 (superseded — did not execute; content absorbed into master pivot plan)
**Inheritance note**: D5 (Anomaly JSON schema) and D6 (Auto-bug-filer scaffold) deliverables have been re-homed as SP-F1 and SP-F2 in the successor plan. All MCP findings on Currency (2026-04-17) remain valid input for SP-B-LM-1 Currency discovery session.
**Priority**: P0 (client delivery blocker — current HIST tests are smoke-only, cannot detect real bugs)
**Depends on**: [PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md](PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md) (completed scaffold/SP1–SP7)
**Scope**: All 8 Location-Mgmt-History integration TCs (7 Basic-Info sub-tabs + Auto Add-On) + 2 Local-Office-Settings-History integration TCs (Basic Info + ECT) = 10 surfaces total. Currency used as proof-of-pattern first.
**Audited**: 2026-04-17 MCP session on office 1604 — 4 real saves + 1 cancelled save, diffs captured across all 87 cols

---

## Context

**What we built last week (SP1–SP7, done)**:

1. Schema discovery — 87-col Location Mgmt History + 42-col Local Office History, duplicate "Currency" cols 5+63 (0-indexed), Unicode-vs-SVG cell rendering
2. Infrastructure — `getRowsSinceTimestamp`, `parseModifiedOnMs` (UTC-safe), `waitForRecentTopRow`, `clickSortColumn` with Radix retry, suiteStartTime pattern
3. 7 HIST integration TCs (one per tab: CUR, ACC, LGL, NTS, LI, PRI, SSL) + 1 Local Office HIST spec

**What's missing** — and why every HIST test passes while the app drops data silently:

Each HIST TC asserts only:
- row count > 0
- every row has `Modified By` + `Modified On`
- at least one row has a non-empty field value (set-membership check, not equality)

All assertions are `expect.soft()` — **a real bug keeps the test green**. That is not bug-finding automation. Parent-field → history-column mapping is undocumented and unverified. Negative cases (cancel, discard, validation-block) are not tested. No assertion of unchanged-field fidelity, duplicate-row absence, Modified On monotonicity, or col-63 cross-contamination.

**MCP probe confirmed today**: on Currency tab alone, 6 of 9 parent fields are completely invisible to history (all 3 merchants + all 3 IsDefault flags). The current `TC-LOC-CUR-HIST` cannot detect this — it passes regardless.

---

## MCP Findings — Currency Tab (2026-04-17, office 1604)

**Parent→column map (verified by save + diff on live DOM):**

| Currency parent field (9 total) | Hist column | Status | Evidence |
|---|---|---|---|
| USD Selected | col 5 "Currency" | ✅ TRACKED (comma list) | baseline row "USD" → CAD-add row "USD, CAD" |
| CAD Selected | col 5 | ✅ TRACKED | diff after CAD check: col 5 only changed field |
| MXN Selected | col 5 | ✅ TRACKED | 3-currency row = "USD, CAD, MXN" |
| USD Is Default | — | ❌ NOT-TRACKED | setting CAD default produced 0 visible hist change beyond the currency list — col-5 has no "*" / "(default)" / any marker |
| CAD Is Default | — | ❌ NOT-TRACKED | same |
| MXN Is Default | — | ❌ NOT-TRACKED (inferred — schema has no slot) | no "Default" column in 87 headers |
| USD Merchant | — | ❌ NOT-TRACKED | 316370→316426 save at 12:12:56 produced row at 12:13:05. Full-row scan: no col contains "316", "Bahamas", or "Merchant" |
| CAD Merchant | — | ❌ NOT-TRACKED (inferred) | no Merchant column in 87 headers |
| MXN Merchant | — | ❌ NOT-TRACKED (inferred) | same |

**Col 5 "Currency" encoding**: comma + single space separator. Single-currency = "USD". Multi = "USD, CAD, MXN". No default marker. No merchant suffix.

**Col 63 "Currency" (duplicate)**: stayed `""` across all 4 Currency saves. Confirms col 63 is Pricing-tab-owned.

**Cancel save = 0 history rows**: verified 12:22:52 cancelled save; top row at 12:23:56 was still 12:19:56 from the previous confirmed save. Cancel works correctly.

**No-op save**: Save button stays disabled when form clean → no row can be produced from a no-op.

**Clean save fidelity**: each Currency save changed ONLY col 5 + Modified On, no accidental writes elsewhere. ✅

**Baseline drift (independent finding)**: on arrival USD IsDefault was `false`, not the `true` the spec baseline expects. `TC-LOC-CUR-001` idempotent enforcement auto-recovers on next run, but this confirms prior CUR-027 cleanup left the system in a non-baseline state — latent drift risk.

---

## Bug Candidates (tracked in this plan, filing gated on user approval)

| ID | Title | Severity | Evidence |
|---|---|---|---|
| CUR-BUG-A | USD/CAD/MXN Merchant changes are not recorded in Location Management History | High | MCP 12:13:05 row after merchant change — zero cols contain merchant ID |
| CUR-BUG-B | IsDefault flag is not recorded in Location Management History | High | MCP 12:19:56 row after CAD-default set — no marker anywhere |
| CUR-BUG-C | CUR-027 cleanup fails to restore USD IsDefault baseline | Medium | Live state on arrival: USD IsDefault=false |
| AAO-BUG-A | All 5 Auto Add-On checkbox fields NOT-TRACKED in Location Management History | High | SP1 §8; `TC-LOC-AAO-HIST` bifurcation already codifies the hypothesis — MCP-confirm in Phase B7 |
| LOS-BAS-BUG-? | PO Number / PO Number Label / Room Configuration suspected NOT-TRACKED in Local Office Settings History | High (pending MCP) | SP1 suspected-list; confirm per field in Phase C1 |
| LOS-ECT-BUG-A | All ECT editable rows (BenefitsMultiplier / HistoricalSubrental / LaborCost) NOT-TRACKED — saves produce no history rows at all | High | SP1 §8 explicitly states; `TC-LOS-ECT-HIST` comment already references — confirm in Phase C2 |

All six go through LR-034 bug-filing protocol when user authorizes. Similar "NOT-TRACKED" analysis must be repeated per tab and fed into the same protocol — catalog likely grows to 20–30 BUG-* reports across all 10 surfaces.

---

## Scope (in / out)

**IN scope for this plan:**

- Per-tab parent→hist-column map (documented + tested)
- **State-space enumeration per parent field** (by control type — see D1 taxonomy): one HIST TC per valid state equivalence class, not per save count
- Per-save row correspondence TCs (N saves = N rows, each with correct exact values)
- Hard `expect()` with structured diagnostic logs — never `expect.soft()` on HIST assertions
- Negative tests: cancel, discard, validation-block, no-op
- Unchanged-field fidelity (assert fields I did NOT change are equal to prior row)
- Col-63 (and every other duplicate-header column) cross-contamination guard
- **Duplicate-header column audit** per history surface: every repeated header name is classified intentional-different-parent OR same-parent-bug; file bug per same-parent dup
- **Boolean-column encoding verification** (Unicode ✔ vs SVG per LR-036) — assert both true ("✔"/SVG present) and false ("" / SVG absent) explicitly per parent
- Modified By identity assertion
- Modified On monotonicity assertion
- Duplicate-row absence (exactly one row per confirmed save)
- NOT-TRACKED field assertions (phantom-row pattern: row exists, but the changed value is verifiably absent)
- Baseline-drift guard at suite start
- **Structured anomaly logging per HIST failure** (D5) and **auto-bug-filer scaffold** (D6) — machine-readable input for future automated bug filing from run artifacts

**OUT of scope for this plan:**

- New history UI features, column additions, sort/pagination changes — app-side
- Any work outside existing HIST test files

**Known edge case — top-level Basic Info fields:**

Local Office Name, Active, Live Date, Tax Mode, Country, Region, Servicing Branch Office, Line Of Business, Pay To Address, Union, eCommerce Active, Enable Productions Orders are direct Basic Info fields (not sub-tab fields). They share the Save button with every sub-tab, so their history changes surface in whichever sub-tab spec triggers a save. No dedicated spec isolates saves of these fields.

Phase A2's unchanged-field fidelity assertions will catch drift, but dedicated isolated-save coverage for these top-level fields is a P2 follow-up (not in this plan's scope). Document as a known gap in Phase A1's REQUIREMENTS.md update.

---

## Documentation layers (where findings live — authoritative hierarchy)

Client requirement: "everything saveable should appear in history; duplicates = bug." Findings from this plan's MCP work land in several places, each authoritative for a different concern:

| Layer | Location | What it holds | Authority for |
|---|---|---|---|
| **Requirements** (authoritative) | `clients/encore/docs/REQUIREMENTS.md` — new §"History Tracking" | Parent→column map per tab, NOT-TRACKED registry, duplicate-header registry, boolean-encoding registry, control-type taxonomy | "What the history IS supposed to contain, MCP-verified" |
| **Test plans** | `clients/encore/specs_planning/test-plans/setup/**/*.md` + matching `test-cases/` | Per-tab TC list (e.g., HIST-CUR-STATE-01..07 enumerated) | "Which states & transitions are covered" |
| **Specs** (executable proof) | `clients/encore/tests/specs/setup/**/*.spec.ts` | Hard-assert TCs per D2 pattern | Continuous verification each run |
| **Bug filings** (manual) | `reports/bugs/BUG-{MODULE}-{NNN}.json` per LR-034 | Confirmed app bugs (NOT-TRACKED, duplicate-same-parent, wrong-value) | Gated on user approval (LR-034 step 1–3) |
| **Anomaly log** (new, auto-emitted per run — D5) | `reports/bugs/anomalies/{YYYY-MM-DD}/{testId}-{seq}.json` | Every HIST failure emitted as structured JSON (schema in D5) | Machine-readable run artifacts → future auto-filer input |
| **Session activity log** | `clients/encore/specs_planning/_internal/agent-activity-log.md` per LR-028 | One row per session: agent, files, timestamps | Audit trail |
| **Framework rules** | Root `CLAUDE.md` LR-NNN | Patterns graduated from 3+ occurrences | Cross-client reuse |

**Rule of thumb**: test cases + specs are the WHAT (coverage); REQUIREMENTS.md is the WHY (authoritative expectation that tests enforce). Both needed. The anomaly log closes the loop between spec failures and LR-034 bug filings — today manual, future automated.

---

## Deliverables

### D1 — `clients/encore/docs/REQUIREMENTS.md` §"History Tracking" (new section)

Add a new top-level section with five registries, each MCP-verified per tab:

**D1.a — Control-type taxonomy (applied to every parent field):**

| Control type | Valid-state equivalence classes | Example on Currency |
|---|---|---|
| Independent checkbox | 2: checked (✔), unchecked ("") | Auto Add-On checkboxes (each row independent) |
| Multi-checkbox group (n items, validation may restrict) | up to 2ⁿ; typically n+1 if "≥1 required": one state per cardinality × each valid combination | Currency "Selected" col (3 items, validation requires ≥1 → 7 valid combos) |
| Pseudo-radio (checkbox-widget behaving exclusively across n peers) | n+1 states (0 or exactly 1 active) | Currency "Is Default" (only one row can be default) |
| True radio group (n options) | n states | Billing Type (Master / Direct) |
| Combobox (k options) | k+1 (empty + k values) | Servicing Branch Office |
| Textbox (free-form) | equivalence classes: {empty, valid, invalid-type, whitespace-only, at-max-length, over-max-length, special chars if applicable} | Phone 1/2, PO Number, Local Office Name |
| Date picker | {empty, valid past, valid future, boundary, invalid} | Live Date, Effective Date |

Every field entry in D1.b MUST declare its control type + the state set required for HIST coverage.

**D1.b — Parent→column map per tab (example stub — Currency):**

```
Tab: Currency
  Parent field                 Control type       Hist col          Status            States to test
  USD Selected                 multi-checkbox     col 5 "Currency"  TRACKED           ✔,""    (× 7 combos)
  CAD Selected                 multi-checkbox     col 5             TRACKED           ✔,""
  MXN Selected                 multi-checkbox     col 5             TRACKED           ✔,""
  USD Is Default               pseudo-radio       —                 NOT-TRACKED (B)   each of (USD/CAD/MXN/none) as default
  CAD Is Default               pseudo-radio       —                 NOT-TRACKED
  MXN Is Default               pseudo-radio       —                 NOT-TRACKED
  USD Merchant                 combobox(2)        —                 NOT-TRACKED (A)   each of 2 options + change
  CAD Merchant                 combobox(1)        —                 NOT-TRACKED
  MXN Merchant                 combobox(0)        —                 NOT-TRACKED       (no options — untestable)

Tab: Local Information
  Billing Type                 radio(Master/Direct)  col 12          TRACKED           Master, Direct
  Apply LDW                    checkbox              col 25 "Enable LDW" TRACKED       ✔, ""
  ... (full inventory ~40 parents)
```

**D1.c — NOT-TRACKED registry:**
Every parent with no mapped column gets a row: `{tab, field, controlType, validStates, bugId, mcpEvidenceSessionDate}`. Confirmed NOT-TRACKED rows feed D3 bug filings.

**D1.d — Duplicate-header registry:**
Every repeated header name in the 87-col (and 42-col) schemas gets classified:
- **Intentional different-parent** (e.g., col 5 "Currency" = primary; col 63 "Currency" = pricing) → document the owner tab per column, keep both
- **Same-parent bug** (same field, two columns) → file BUG-HIS-* per LR-034

**D1.e — Boolean-encoding registry (per LR-036):**
Every boolean column gets: `{colIndex, header, encoding: "unicode-checkmark" | "svg-lucide-check" | "text", detectionPattern}`. Tests for boolean columns MUST use the registry's detection rule, not guess.

MCP-verified per tab. No inference beyond what was saved and diffed. Each registry entry carries an MCP session date so staleness is detectable.

### D2 — Hardened `TC-LOC-CUR-HIST` (Currency proof-of-pattern)

Replace the current single soft-assert test with ~22 TCs covering the full state-space per D1.a taxonomy. Four families:

**(i) Selected multi-checkbox state-space — 7 valid combos (0-checked is blocked by validation, covered under NEG-03):**

| TC ID | Pre-save state | Expected col 5 |
|---|---|---|
| HIST-CUR-STATE-01 | USD only (USD default) | `"USD"` |
| HIST-CUR-STATE-02 | CAD only (CAD default) | `"CAD"` |
| HIST-CUR-STATE-03 | MXN only (MXN default) | `"MXN"` |
| HIST-CUR-STATE-04 | USD + CAD (USD default) | `"USD, CAD"` |
| HIST-CUR-STATE-05 | USD + MXN (USD default) | `"USD, MXN"` |
| HIST-CUR-STATE-06 | CAD + MXN (CAD default) | `"CAD, MXN"` |
| HIST-CUR-STATE-07 | USD + CAD + MXN (USD default) | `"USD, CAD, MXN"` |

Each asserts: hard equality on col 5 + `diffVsPrior = [col5, col71-ModifiedOn]` (no spurious field writes).

**(ii) Is Default pseudo-radio cycle (NOT-TRACKED verification — expect identical col 5 regardless of which row is default):**

| TC ID | Setup | Assertion |
|---|---|---|
| HIST-CUR-DEF-01 | USD+CAD, USD default → save; swap to CAD default → save | col 5 is "USD, CAD" in BOTH rows; no col in 87 changes other than col 71 |
| HIST-CUR-DEF-02 | USD+CAD+MXN, MXN default → save | col 5 = "USD, CAD, MXN"; no default marker anywhere |
| HIST-CUR-DEF-03 | USD selected, uncheck USD default (no default), dialog-confirm save | col 5 = "USD"; row appears; no default marker |

**(iii) Merchant NOT-TRACKED (phantom-row pattern — every merchant change produces row, but nothing merchant-related in 87 cols):**

| TC ID | Action | Assertion |
|---|---|---|
| HIST-CUR-MER-01 | USD merchant 316370→316426 → save | row count +1 AND `assertNoTrackedFor(['316370','316426','Bahamas','PSAV US','Merchant'], row)` passes (zero matches outside Modified By email) |
| HIST-CUR-MER-02 | CAD merchant value change (when CAD selected) → save | same pattern |
| HIST-CUR-MER-03 | MXN merchant — SKIP | no options available; document as untestable in REQUIREMENTS.md |

**(iv) Metadata + fidelity + negative cases:**

| TC ID | What it tests |
|---|---|
| HIST-CUR-META-01 | `Modified By` equals authenticated test user email — hard string equality |
| HIST-CUR-META-02 | `Modified On` strictly greater than prior row's Modified On (monotonicity) |
| HIST-CUR-META-03 | Col 63 ("Currency" duplicate) is unchanged across every Currency save (cross-contamination guard) |
| HIST-CUR-META-04 | Unchanged-field fidelity — for each save, every col NOT in the expected-change set equals prior row's col |
| HIST-CUR-NEG-01 | Cancel save dialog → row count unchanged; top row's Modified On is prior save's timestamp |
| HIST-CUR-NEG-02 | Discard "Unsaved changes" dialog → row count unchanged |
| HIST-CUR-NEG-03 | Validation-block: uncheck all 3 currencies → Save disabled → row count unchanged |
| HIST-CUR-NEG-04 | No-op Save attempt (no dirty state) → Save disabled; no row; no-op is safe |

**~22 TCs total**. Every TC uses hard `expect()` — zero `expect.soft()`. Failures emit a D5-format anomaly JSON to `reports/bugs/anomalies/` (schema below).

### D3 — Bug filings (CUR-BUG-A/B/C) per LR-034 protocol

`reports/bugs/BUG-LOC-CUR-001.json` through `BUG-LOC-CUR-003.json`. Each references the MCP evidence in this plan.

### D4 — Rollout to 9 other HIST specs (LI, ACC, LGL, NTS, PRI, SSL, **AAO**, **LOS-BAS**, **LOS-ECT**)

Same pattern per tab:
1. MCP-probe each tab → build parent→column map (D1.b) + state-space (D1.a)
2. Rewrite HIST TC as per-save correspondence covering the FULL valid state-space, not a sampled subset (~15–25 TCs each depending on field count)
3. Run the duplicate-header audit for the relevant schema (87-col or 42-col) and register findings per D1.d
4. File per-tab BUG-* reports for all NOT-TRACKED parents + duplicate-same-parent findings
5. Convert every soft assert to hard assert + emit D5 anomaly JSON on failure

### D5 — Anomaly log format (machine-readable HIST-failure artifact)

Every failing HIST assertion writes a JSON file to `reports/bugs/anomalies/{YYYY-MM-DD}/{testId}-{seqNN}.json`. Schema (aligns with `src/framework-contracts/diagnostics.ts` FailureCategory pattern):

```json
{
  "anomalyId": "2026-04-17-HIST-CUR-STATE-04-01",
  "type": "value-mismatch" | "not-tracked-violation" | "phantom-row" | "duplicate-row" | "spurious-column-change" | "modified-on-drift" | "modified-by-mismatch" | "zero-row-after-save" | "row-after-cancel" | "duplicate-header-same-parent",
  "severity": "critical" | "high" | "medium" | "low",
  "discoveredAt": "2026-04-17T12:19:56.742Z",
  "tcId": "HIST-CUR-STATE-04",
  "specFile": "clients/encore/tests/specs/setup/locations/location-currency.spec.ts",
  "parentTab": "Currency",
  "parentField": "USD+CAD Selected",
  "parentControlType": "multi-checkbox",
  "savedAt": "2026-04-17T12:17:06.742Z",
  "historyRowAt": "2026-04-17T12:17:17Z",
  "column": { "index": 5, "header": "Currency" },
  "expected": "USD, CAD",
  "actual": "USD",
  "fullRowDiffVsPrior": [{ "col": 5, "name": "Currency", "prev": "USD", "now": "USD" }],
  "evidenceArtifacts": {
    "screenshot": "test-results/{tcId}-failure.png",
    "trace": "test-results/{tcId}.trace.zip"
  },
  "relatedBugCandidate": "CUR-BUG-B",
  "officeNo": "1604"
}
```

Utility at `src/utils/hist-anomaly-writer.ts` exposes `emitAnomaly(spec, tc, anomaly)`. Called from test `afterEach` on failure. Output location already inside `reports/bugs/` so it ships with existing bug-report directory conventions.

### D6 — Auto-bug-filer scaffold (`scripts/anomaly-to-bug.mjs`)

Post-run job that ingests `reports/bugs/anomalies/{YYYY-MM-DD}/*.json` and produces/updates `reports/bugs/BUG-*.json` per LR-034 schema. Rules:

1. Group anomalies by `(parentTab, parentField, type)` — each group is a candidate bug.
2. Dedup: search existing `reports/bugs/BUG-*.json` for a match on (module, title-substring, type). If found → append the new anomaly to an `evidenceRuns[]` array on the existing bug (no new BUG-* created).
3. If no existing bug and anomaly severity ≥ medium → create `BUG-AUTO-{MODULE}-{NNN}.json` with LR-034-compliant fields, sourcing from anomaly JSON.
4. Default behaviour = dry-run (write to `reports/bugs/auto-filer-dryrun-{date}.md` for review). Live-write gated behind env `HIST_AUTO_FILE=true`.
5. Dedup keys match LR-034 step 3 contract. No silent BUG creation without human review until `HIST_AUTO_FILE=true` is explicitly enabled per run.

This is the **scaffold** — it ships wired to dry-run mode. Turning on live auto-filing is a separate decision after a month of dry-run observation to validate dedup accuracy.

---

## Work Items

**Phase A — Currency proof-of-pattern (days 1–3):**

- A1. Write D1 "History Tracking" section into REQUIREMENTS.md with all 5 registries (taxonomy, parent→col per tab-Currency, NOT-TRACKED, duplicate-header, boolean-encoding). Include control-type declarations for all 9 Currency parents.
- A2. Replace `TC-LOC-CUR-HIST` in [location-currency.spec.ts](clients/encore/tests/specs/setup/locations/location-currency.spec.ts) with the **22** TCs from D2 (7 state + 3 default + 3 merchant + 4 meta + 4 negative + 1 duplicate-header cross-check).
- A3. Extract a reusable helper `readHistoryRowSince(sinceMs)` returning full 87-col row object (reuse existing `getRowsSinceTimestamp` — widen the header list to all 87).
- A4. Extract a reusable helper `diffRowsByCol(row, priorRow)` returning `{col, header, prev, now}[]`.
- A5. Extract a reusable helper `assertNoTrackedFor(substrings[], row)` — scans all 87 cols for any substring, hard-fails on match (drives the phantom-row tests).
- A6. **New** — implement `src/utils/hist-anomaly-writer.ts` per D5 schema. Wire into Playwright `afterEach` so failures emit JSON to `reports/bugs/anomalies/{date}/`.
- A7. **New** — run duplicate-header audit on the 87-col schema: list every repeated header, classify each, update D1.d registry. For col 5 + col 63 "Currency" (known): document as intentional-different-parent (primary vs pricing).
- A8. Run the 22 new Currency TCs locally → triage any failures into (app bug | test bug | finding). Expect: MER-01/02 + DEF-01/02/03 should PASS because phantom-row assertions are the expected behaviour (verifies the NOT-TRACKED bug, not a test failure).
- A9. File BUG-LOC-CUR-001..003 per LR-034 when user authorizes.
- A10. **Boolean-encoding spot-check** per LR-036 — for every col 5 save, also assert col 2 "Active" = "✔" unchanged (since we never touch Active). Confirms boolean-encoding helper works.

**Phase B — Roll out to other 7 Location tabs (days 3–9, 1 day each except B7 ~0.5d):**

- B1. Local Information (~40 parent fields — biggest map)
- B2. Account and Address (~6 parents)
- B3. Legal (~4 parents)
- B4. Notes (~1 aggregate parent — snapshot col 69)
- B5. Pricing (~2 parents)
- B6. Shared Setup Locations (~3 parents — Action/ID/Name; SP6 already flagged "snapshot model doesn't populate these" → likely NOT-TRACKED per row, to be confirmed)
- B7. **Auto Add-On** (~0.5 day; simpler than other tabs)
  - SP1 §8 already asserts all 5 Auto Add-On checkboxes lack a mapped column in the 87-col history. `TC-LOC-AAO-HIST` already bifurcates on "0 rows vs >0 rows".
  - MCP-probe each of the 5 Auto Add-On checkbox parents individually → confirm whether save produces a row AT ALL (current test hedges both outcomes).
  - Tighten bifurcation → hard assertion on the confirmed outcome. Either "every AAO save produces a Modified-By/On-only row" OR "AAO saves produce zero rows" — pick based on MCP evidence. No more "either is fine" soft asserts.
  - File `BUG-LOC-AAO-001` (bulk): all 5 AAO checkbox fields NOT-TRACKED in 87-col schema.
  - Remove all `expect.soft()` from `TC-LOC-AAO-HIST`.

Each sub-phase = repeat A1–A7 pattern with helpers from A3–A5 reused.

**Phase C — Local Office Settings History (42-col, days 10–11):**

- C1. **Harden `TC-LOS-BAS-HIST`** (local-office-settings.spec.ts:839).
  - MCP-probe Basic Info parents: date offsets (Prep/Set/Delivery/Return/Strike/Pickup), Phone 1/2, PO Number, PO Number Label, Room Configuration, Section Configuration, Logo, discount exemption toggles, Default Order Type, Default Labor to Hourly, Fulfillment/QC cascade.
  - Build 42-col parent→column map. Replace current `TC-LOS-BAS-HIST` with per-save correspondence TCs (pattern from Phase A2).
  - File `BUG-LOS-BAS-001+` for each MCP-confirmed NOT-TRACKED field (SP1 suspects: PO Number, PO Number Label, Room Configuration).

- C2. **Harden `TC-LOS-ECT-HIST`** (local-office-ect.spec.ts:248).
  - MCP-confirm SP1 §8 finding — BenefitsMultiplier, HistoricalSubrental, LaborCost edits produce NO history rows at all (NOT-TRACKED at save level, not just column level).
  - Tighten current `expect.soft()` to hard assertion on the confirmed outcome.
  - File `BUG-LOS-ECT-001` (bulk): all 6 ECT editable TCs (ECT-005/009/013/014/015/016) NOT-TRACKED in the 42-col schema.

- C3. **Audit `local-office-history.spec.ts`** structural tests.
  - Grep for any remaining `expect.soft()` in the 42-col structural tests; convert to hard asserts with diagnostic logs.

**Phase D — CI integration (day 12):**

- D1. Verify all HIST TCs run in the regression pipeline
- D2. Audit assertion-mode: grep for `expect.soft` in all HIST specs, fail CI if any remain
- D3. Add reporting: failed HIST TCs attach a markdown diagnostic (expected vs actual row diff) to the Playwright report
- D4. Verify anomaly writer emits JSON to `reports/bugs/anomalies/{date}/` on every failure; ensure emitted files are in `.gitignore` paths only at the run-artifact level (we keep catalog BUG-* tracked, not per-run anomalies)

**Phase E — Anomaly-log → auto-bug-filer scaffold (days 13–14):**

- E1. Implement `scripts/anomaly-to-bug.mjs` per D6 rules. Default = dry-run writing a markdown digest to `reports/bugs/auto-filer-dryrun-{date}.md`.
- E2. Dedup logic: unit-test against a fixture of synthetic anomaly JSONs + existing BUG-* files. Confirm:
  - New-anomaly → new BUG-AUTO-* created (dry-run preview)
  - Same-anomaly-reappearing → appended to existing BUG's `evidenceRuns[]`, no duplicate BUG-* file
  - Severity-floor honored (medium+ → candidate; low → logged but not filed)
- E3. Wire into `npm run` — add script `npm run hist:anomaly-filer` (dry-run) and document `HIST_AUTO_FILE=true npm run hist:anomaly-filer` for live mode.
- E4. Update `clients/encore/docs/REQUIREMENTS.md` §"History Tracking" with a "Run-to-bug flow" diagram pointing from spec-failure → anomaly-JSON → dedup → BUG-* filing.
- E5. Document in `agent-activity-log.md` per LR-028.

---

## Validation / Acceptance

- Every HIST spec has zero `expect.soft()` calls
- Every HIST spec has at least one cancel-negative TC asserting 0 rows
- Every HIST spec has at least one NOT-TRACKED-phantom-row TC (where applicable)
- Every HIST spec covers the **full valid state-space per field per D1.a taxonomy** (not a sampled subset) — documented in the matching `test-plans/` and `test-cases/` files
- `clients/encore/docs/REQUIREMENTS.md` §"History Tracking" exists with all 5 registries populated for all 10 history surfaces (parent→col, NOT-TRACKED, duplicate-header, boolean-encoding, control-type)
- `reports/bugs/BUG-LOC-*.json` + `BUG-LOS-*.json` exists for every MCP-confirmed NOT-TRACKED parent field and every same-parent-duplicate-header across all surfaces (~20–30 reports estimated)
- `src/utils/hist-anomaly-writer.ts` exists; `reports/bugs/anomalies/{YYYY-MM-DD}/` directory populated on every run that has HIST failures
- `scripts/anomaly-to-bug.mjs` exists and runs in dry-run mode, producing readable digest
- Running the full suite against an office with known-good state passes all HIST TCs
- Intentionally corrupting a saved value (via API) causes the relevant HIST TC to fail AND an anomaly JSON to be emitted with correct `type`, `expected`, `actual` fields

---

## Risks

- **R1 MCP-probe time per tab**: ~1 hour per tab for rigorous parent→column mapping. Budgeting 1 day per tab accounts for MCP + rewrite + triage + cleanup. Confirmed feasible on Currency.
- **R2 Snapshot model quirks**: Notes uses a single aggregate col, SSL uses 3 cols that may not populate per SP6 findings. Pattern may need branching per-tab. Spec A2 is the proof case.
- **R3 Baseline drift between probes**: each tab's spec must enforce its own baseline at suite start (like CUR-001 does) — strengthen where absent. Add to per-tab B1–B6 checklist.
- **R4 NOT-TRACKED may be intentional**: some "not in history" fields might be by-design (low-value audit fields). Must reconcile each CUR-BUG-* candidate with the Functional Requirement doc before filing. LR-030/034 compliance.
- **R5 Soft→hard assertion transition can reveal unknown bugs**: expected. Each new failure triggers LR-034 triage (app bug? test bug? data corruption? serial contamination?). Budget 15–20% extra time for this.
- **R6 Combinatorial explosion on wide tabs**: Local Information has ~40 parents; literal cartesian (2⁴⁰ states) is infeasible. Mitigate via state-equivalence-class coverage: test each field's equivalence classes independently + a small set of cross-field combos driven by documented dependencies (e.g., Apply LDW → LDW Percentage). Document the "independent vs coupled" split in D1.a per field.
- **R7 Boolean-encoding divergence (per LR-036)**: history cells render booleans as Unicode ✔ (Location Mgmt History) or SVG lucide-check (Local Office History). Helper selection per surface is MANDATORY — generic `textContent` assertions fail silently on SVG tables. D1.e boolean-encoding registry + a shared `assertBooleanCell(cell, expected, schema)` helper eliminates the risk.
- **R8 Anomaly writer false positives**: the writer emits on EVERY HIST failure, including test-logic bugs (not app bugs). Until auto-filer runs live, every anomaly JSON must be human-triaged before filing. E2 unit tests protect the dedup from over-filing the same app bug.

---

## Out-of-band notes captured during this session

- Office 1604 Currency tab was left with `USD+CAD+MXN` all selected, CAD default, USD merchant = 316426 at the end of the MCP probe. `TC-LOC-CUR-001` idempotent baseline enforcement will self-heal on next run.
- `plans/pending/SUBPLAN_HISTORY_08_BUG_REPORTS.md` is now partially superseded by D3 here — consolidate or leave as the formal bug-filing gate for the larger catalog. Recommend: move SP8 → subsumed-by reference this plan, or keep SP8 as the BUG-filing dispatcher and make D3 the input source.

---

## Parent / related plans

- **Parent**: [PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md](PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md) — SP1–SP7 scaffold (done)
- **Supersedes/extends**: [SUBPLAN_HISTORY_08_BUG_REPORTS.md](SUBPLAN_HISTORY_08_BUG_REPORTS.md) — D3 here is the direct successor
- **Related**: [PLAN_BUG_HUNTING_RULEBOOK_V2.md](PLAN_BUG_HUNTING_RULEBOOK_V2.md) — D5/D6 anomaly-log + auto-filer scaffold aligns with this rulebook's bug-detection philosophy; when V2 is active the anomaly JSON schema is the expected input format
- **Depends-on (external)**: LR-034 bug-filing protocol (framework rule); LR-036 boolean-encoding registry; LR-028 session activity log; LR-037 activity-log timestamp gate
- **Produces-for-future**: an initial `reports/bugs/anomalies/` corpus and dry-run digests that inform a later "turn on live auto-filing" decision
