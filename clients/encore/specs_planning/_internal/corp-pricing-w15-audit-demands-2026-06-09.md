> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

# Corporate Pricing Wave-1.5 — Audit Demand Checklist (do-or-die closure)

**Date**: 2026-06-09  
**Identity**: WATCHDOG  
**Subplan**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md (Stage A — Demand Derivation)  
**Method**: multi-agent Workflow fan-out (3 derivation agents over framework path-rules / client+tooling / Wave-1.5 plan-contract) → dedup-merge into one canonical checklist. Every obligation cites file:line provenance — derived from source, not hardcoded.  
**Total obligations**: 61

> This checklist is the Stage-B audit oracle. Each obligation was audited PASS/FAIL/UNVERIFIABLE in the companion `corp-pricing-w15-closure-audit-2026-06-09.md`.

---

## B1 XLSX (6)

### 1. `B1-XLSX-COUNTS-EXACT`  _[blocking]_
The XLSX deliverable (clients/encore/test_cases_xlsx/encore_test_cases.xlsx) must carry EXACTLY 28 data rows on sheet corporate_pricing_override and EXACTLY 17 on corporate_pricing_toolbar_io, and these counts must be identical to (a) the implemented spec TC count and (b) the MD test-case count for each module. check:tc-parity must exit 0 with the spec TC-ID set a subset of the Markdown set which equals the XLSX set; every TC-LOC-CPR-501..528 and 601..617 in the spec must resolve to a row in its sheet — zero gaps, zero drift.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:55,101 ('new rows vs MD vs spec counts EXACT'); docs/read_only_docs/AGENT_SHARED_RULES.md:282 (ALL-071); clients/encore/CLAUDE.md:72-86 (LR-ENC-002); W15_A:109 (28 TCs); W15_B:101,138 (17 rows) [merged Set1 B1-XLSX-PARITY + B1-XLSX-SHEET-COUNTS, Set2 B1-COUNT-EXACT]

### 2. `B1-XLSX-BUILD-CLEAN`  _[blocking]_
npm run xlsx:build must exit 0 and produce a freshly rebuilt workbook reflecting the current Markdown sources (not a stale hand-edited file); auto-rebuild is mandatory on the pending_generation transition. The 21-sheet / 652-row build with corporate_pricing_override=28 + corporate_pricing_toolbar_io=17 must be confirmed.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:55,101 ('xlsx:build clean'); docs/read_only_docs/AGENT_SHARED_RULES.md:30 (R20); clients/encore/CLAUDE.md:84 (LR-ENC-002); Phase-0 evidence [merged Set1 B1-XLSX-REBUILT, Set2 B1-BUILD-LINT-CLEAN build clause]

### 3. `B1-XLSX-VOCAB-LINT-CLEAN`  _[blocking]_
npm run xlsx:lint (scripts/xlsx-vocab-lint.mjs + xlsx-lint-rules.mjs) must report lintWorkbook.ok===true: zero vocab hits AND zero integrity violations across the CPR sheets (warnings do not fail). No agent/framework/internal-process vocabulary may leak into the client deliverable.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:55,101; scripts/xlsx-lint-rules.mjs:376-382 (ok definition); clients/encore/CLAUDE.md:72-84 (LR-ENC-002); Phase-0 evidence (xlsx:lint exit 0) [merged Set1 B1-XLSX-VOCAB-LINT, Set2 B1-BUILD-LINT-CLEAN lint clause]

### 4. `B1-ENC004-INTEGRITY-C1C7`  _[blocking]_
Every corporate_pricing_override + corporate_pricing_toolbar_io row must satisfy LR-ENC-004 integrity checks C1-C7: C1 no reason-text when Automation Execution=='Pass'; C2 Coverage Status in {Automated,Pending Automation,Manual,''} and Automation Execution in {Pass,Fail,Skipped,Blocked,''}; C4 Manual rows have blank execution+reason; C5 any non-empty failure reason is a >=4-word client sentence (no internal shorthand, no new TERSE_REASON_ALLOWLIST entries for CPR); C6 per-sheet TC IDs unique AND ascending compareTcId order; C7 no garbled output (empty/dangling parens, arrow-in-parens, attributed HTML tag, truncated trailing backtick).

**Provenance**: scripts/xlsx-lint-rules.mjs:18-24 (C1-C7 spec), :208-214 (CORRUPTION), :303-374 (impl), :44-58 (enums+allowlist); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:55,101 (LR-ENC-004 invariants) [Set2 B1-ENC004-INTEGRITY-C1C7 — distinct granularity not in Set1]

### 5. `B1-VOCAB-DENYLIST`  _[blocking]_
No CPR row cell in CHECKED_COLS (TC ID, Title, Module, Submodule, Preconditions, Steps, Expected Result, Notes, Coverage Status, Automation Execution, If Failed Reason of Failure) may match any BANNED vocab pattern, including the CPR-specific authoring-residue tokens: 'DOCX', helper 'TC-ENC*' ids, '[ASSUMPTION', the section symbol, 'navigatorthe', 'helpers TC-', 'Doctrine', 'FCC-P{n}', 'encore-questions', 'walk-evidence', clarification-question ids ([A-Z]{2,}-[A-Z]+-Q{n}), '/pricing/strategies', '/navigator/api', query-param leaks (isLabor=/isMaxDiscount=/pricebookName=), full GUID, bare YYYY-MM-DD, NM-#### tickets, and framework/spec-helper identifiers.

**Provenance**: scripts/xlsx-lint-rules.mjs:38-42 (CHECKED_COLS), :81-197 (BANNED incl. :168-197 CPR-residue); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:55 [Set2 B1-VOCAB-DENYLIST — distinct deny-list detail not in Set1]

### 6. `B1-SCHEMA-PARITY-QUALITY`  _[quality]_
CPR sheets must conform to the canonical 11-column MODULE_SHEET_HEADERS schema (TC ID/Title/Module/Submodule/Preconditions/Steps/Expected Result/Notes/Coverage Status/Automation Execution/If Failed Reason of Failure; no resurrected 'Specific Field'/'Tags' columns), and new-row content quality must be benchmarked against existing module sheets (no degraded/placeholder content).

**Provenance**: export_test_cases/to-xlsx.ts:64-79 (MODULE_SHEET_HEADERS); scripts/xlsx-lint-rules.mjs:38-42; SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:55 ('quality benchmarked against existing module rows') [Set2 B1-SCHEMA-PARITY — distinct]

---

## B2 specs (26)

### 7. `B2-FCC-TWO-DESCRIBE`  _[blocking]_
Both specs must use the FCC two-describe shape (read/structure/filter describe + commit/save-cycle describe) per LR-ENC-002, with all 28 override + 17 toolbar TC IDs resolving via npx playwright test --list. Override spec uses 3 describes (read/structure/filters; edit-behavior; save-cycle mutation); toolbar uses 4 (Export/Import/LocPricing/GridOptions).

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:56 (B2 'FCC two-describe shape'); clients/encore/CLAUDE.md:72-86 (LR-ENC-002); corporate-pricing-override.spec.ts:37,153,223; corporate-pricing-toolbar-io.spec.ts:25,73,122,145 [Set2 B2-FCC-TWO-DESCRIBE — distinct]

### 8. `B2-FIRST-RUN-PASS`  _[blocking]_
All 45 Wave-1.5 tests (28 override + 17 toolbar-io) must pass on a fresh clean run AND pass individually first; run-all is the only truth and individual-then-run-all confirms no serial contamination. Clean artifacts + run fresh BEFORE any RCA (LR-024). Phase-0 evidence: 46 passed (45 + auth), 0 failed.

**Provenance**: .claude/rules/specs.md:12-23 (LR-018); .claude/rules/specs.md:75-90 (LR-024); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:40 (Phase 0 clean+run fresh) [Set1 B2-FIRST-RUN-PASS]

### 9. `B2-LR019-PERTEST-BASELINE`  _[blocking]_
Every fixed-set/save/persistence test must enforce a PER-TEST baseline in beforeEach (not first-test-only). Override read/filter/edit describes call reloadAndReselect(LOC) in beforeEach (lines 38-41,154-157); save-cycle describe uses saveAndVerifyCase (compile-required baseline) plus afterEach ensureDefaultState (224-227). Toolbar Grid Options uses ensureAllGridColumnsVisible in beforeEach AND afterEach (148-157). Verify no net-zero-vulnerable test lacks a per-test baseline.

**Provenance**: .claude/rules/specs.md:26-57 (LR-019); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:56; corporate-pricing-override.spec.ts:38-41,154-157,224-227; corporate-pricing-toolbar-io.spec.ts:148-157 [merged Set1 B2-PER-TEST-BASELINE, Set2 B2-LR019-PERTEST-BASELINE]

### 10. `B2-LR009-NETZERO`  _[blocking]_
Error-recovery/revert assertions must use a recovery value DIFFERENT from the server-saved value OR explicitly assert net-zero disables Save. TC-LOC-CPR-519 reverts Override Price to its original to prove Save disables (net-zero, LR-009/026) — confirm the asserted direction (revert => Save disabled) is the deliberate net-zero check, not a recovery-to-original test that would falsely fail.

**Provenance**: .claude/rules/angular.md:11-19 (LR-009); .claude/rules/angular.md:36-57 (LR-026); corporate-pricing-override.spec.ts:172-179; SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:56 [merged Set1 B2-NETZERO-LR009, Set2 B2-LR009-LR011-NUMERIC-GUARDS LR-009 clause]

### 11. `B2-LR011-NAN-RELOAD`  _[quality]_
Any test entering non-numeric text into a numeric Angular input (TC-LOC-CPR-522 'abc') must clear model corruption via reload/escape, not by typing a valid value back. Verify probeOverridePriceInput restores clean state (escape/reload at override.page.ts:303-304) so subsequent tests are not poisoned by NaN model state, and the assertion proves non-numeric is coerced/rejected (no alpha retained).

**Provenance**: .claude/rules/angular.md:29-34 (LR-011); corporate-pricing-override.spec.ts:196-200; corporate-pricing-override.page.ts:302-304; SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:56 [merged Set1 B2-LR011-RELOAD, Set2 B2-LR009-LR011-NUMERIC-GUARDS LR-011 clause]

### 12. `B2-MAXDISC-CAP-REAL`  _[blocking]_
TC-LOC-CPR-523 must assert the REAL Max-Discount-capped-at-100 behavior (>100% rejected, inline editor does not commit) per the live-discovered CPR-WV15-Q3 finding, NOT an invented/weakened expectation. The assertion (tryMaxDiscount(150)===false) must match observed reality, backed by live evidence in the field-inventory/Execution Summary since the screen is undocumented and live DOM is the oracle.

**Provenance**: corporate-pricing-override.spec.ts:202-211; SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:56; W15_A:60-61,109,112-113 (cap-at-100, CPR-WV15-Q3); docs/read_only_docs/LEARNED_RULES.md:30-38 (LR-030 investigate-not-assume) [merged Set1 B7-MAXDISCOUNT-CAP-EVIDENCE + Set2 B2-LR009-LR011-NUMERIC-GUARDS TC-523 clause]

### 13. `B2-LR022-NO-HARDCODED-COUNTS`  _[blocking]_
No assertion may hard-code an exact structural DOM count (.toBe(N)/.toHaveLength(N)) unless the count is the feature under test; grid reads must be content-anchored. TC-LOC-CPR-505 asserts 'all 10 column headers' via toContain per-column (not .toBe(10)); 514/515/132 use toBe(0) for empty-state. Verify these are content/existence/empty-state assertions, not brittle incidental-count assertions.

**Provenance**: .claude/rules/specs.md:67-73 (LR-022); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:56,102; corporate-pricing-override.spec.ts:67-70,129-135; W15_A:65,96 [merged Set1 B2-NO-HARDCODED-COUNTS, Set2 B2-LR022-NO-HARDCODED-COUNTS]

### 14. `B2-NO-OPAQUE-BOOLEAN-OR`  _[quality]_
No assertion of the form expect(a===x || a===y).toBe(true) — opaque OR-expression booleans are forbidden; branching or toContain([...]) required. Scan both Wave-1.5 specs for this pattern.

**Provenance**: .claude/rules/specs.md:109-120 (LR-051) [Set1 B2-NO-OPAQUE-BOOLEAN-OR]

### 15. `B2-LR052-NO-FIXED-WAIT-IN-POLL`  _[blocking]_
No fixed waitForTimeout(N) may be the sole synchronization inside a count/state polling loop; waitForFunction polling on the actual transition is required. corporate-pricing-override.page.ts uses page.waitForTimeout at lines 158, 164, 265, 292 — each MUST be adjudicated as either (permitted) incidental post-action settle or (violation) sole-sync inside a count/state recheck loop. This overlaps Sweep 9; both must agree.

**Provenance**: .claude/rules/specs.md:122-132 (LR-052); PLAN_BIG_PIVOT_FCC_MASTER.md:126 (Sweep 9); corporate-pricing-override.page.ts:158,164,265,292 [Set1 B2-NO-FIXED-WAIT-IN-POLL]

### 16. `B2-LR023-NO-NETWORKIDLE`  _[blocking]_
No page object or spec may use waitForLoadState('networkidle') or waitUntil:'networkidle' for this Angular SPA — waitForAngularStable + concrete data signals required; reloads use domcontentloaded + waitForAngularStable. Scan both specs and both page objects.

**Provenance**: docs/read_only_docs/LEARNED_RULES.md:13-22 (LR-023) [Set1 B2-NO-NETWORKIDLE]

### 17. `B2-LR056-ENDPOINT-FILTER`  _[blocking]_
Every request/response listener observing save or export behavior must filter on the backend API path (/navigator/api/...), never a page-URL substring (avoids capturing Next.js RSC/hydration POSTs as false positives). Override save asserts POST /navigator/api/location/corporate-price-pg-override; toolbar export asserts /navigator/api/location/pricing/pricing-export and /location-export with isLabor/isMaxDiscount on the backend path. Verify no page-URL-substring filter is used in spec or page object.

**Provenance**: .claude/rules/specs.md:145-182 (LR-056); corporate-pricing-override.spec.ts:17-18; corporate-pricing-toolbar-io.spec.ts:18,128-132; SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:56; W15_A:108,W15_B:102 [merged Set1 B2-NETWORK-FILTER-BACKEND, Set2 B2-LR056-ENDPOINT-FILTER]

### 18. `B2-LR036-BOOLEAN-RENDER`  _[blocking]_
Active-column boolean reads must use the MCP-verified render format for THIS grid (Radix checkbox aria-checked per the spec's LR-036 4th-render-format note), not a textContent helper borrowed from another table. Verify readActiveState reads aria-checked (override.page.ts) and TC-LOC-CPR-507 asserts a real boolean (typeof===boolean).

**Provenance**: clients/encore/CLAUDE.md:120-142 (LR-036); corporate-pricing-override.spec.ts:80-85; corporate-pricing-override.page.ts (readActiveState) [Set1 B2-LR036-BOOLEAN-RENDER]

### 19. `B2-NO-TESTID-ASSUMPTION-NO-FIXME`  _[blocking]_
Specs must contain zero data-testid assumptions (CPR ships effectively zero automation-grade testids; specs use text/role/grid-header/content-anchored locators) AND zero lazy test.skip()/test.fixme()/placeholder/stub tests (GEN-006). All 45 CPR-W15 tests must be live assertions; any skip/fixme must be bug-blocked with a BUG-ID and un-skip attempted per LR-021/LR-031.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:56,102; corporate-pricing-missing-testids-report.md:37-39 (effectively zero testids); docs/read_only_docs/LEARNED_RULES.md:42-57 (LR-031); .claude/rules/specs.md:59-65 (LR-021); PLAN_BIG_PIVOT_FCC_MASTER.md:124 (Sweep 7) [merged Set1 B2-NO-LAZY-SKIP, Set2 B2-NO-TESTID-ASSUMPTION-NO-FIXME]

### 20. `B25-FALSE-GREEN-11-PATTERNS`  _[blocking]_
Every Corporate Pricing spec under audit must survive ALL 11 false-green patterns from the False-Green Sweep Doctrine table at PLAN_BIG_PIVOT_FCC_MASTER.md:118-128 (CITE that table, do not duplicate): (1) .catch(()=>{}) swallow; (2) bare built-in page destructured alongside custom fixture; (3) vacuous .toHaveCount(0)/.toBeHidden() on missing element; (4) .isVisible()/.isEnabled() used as if/ternary branch; (5) force:true+.catch; (6) all-negative-assertion tests; (7) stale test.skip/test.fixme; (8) page.on() on built-in page; (9) sole waitForTimeout sync; (10) assert-via-page-after-pageObject-setup; (11) expect.poll() timeout >10s. Any hit = DEFECT = RED. NOTE: search.page.ts uses .catch(()=>{}) at lines 193,301,368,401,444,445,446,476,504,505 and override.page.ts at 84,211,234,264,287,289,290,302,303,304; the toolbar TC-606 dismiss path used .catch per W15_B:125 — each must be adjudicated as permitted cleanup-best-effort vs a swallowed real action failure.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:108-128 (11-pattern table); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:57,103; W15_B:125 (.catch on dismiss); corporate-pricing-search.page.ts:193,301,368,401,444-446,476,504-505; corporate-pricing-override.page.ts:84,211,234,264,287-290,302-304 [merged Set1 B25-FG-SWEEP1..11 umbrella + Set2 B25-FALSE-GREEN-11-PATTERNS]

### 21. `B25-FG-SWEEP1-CATCH`  _[blocking]_
Sweep 1: no .catch(()=>{}) swallowing an ACTION failure (click/fill/edit) that would silently pass on a wrong page or absent element. The ~20 .catch sites in search.page.ts + override.page.ts must each be confirmed to wrap cleanup/best-effort waits (Escape, waitFor hidden/detached), NOT a load-bearing action whose failure the test depends on detecting.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:118 (Sweep 1); .claude/rules/data.md (LR-003 no empty catch); corporate-pricing-override.page.ts:84,234; corporate-pricing-search.page.ts:444 [Set1 B25-FG-SWEEP1-CATCH — kept distinct for granular file:line adjudication]

### 22. `B25-FG-SWEEP2-PAGE-DESTRUCTURE`  _[blocking]_
Sweep 2: no test may destructure the built-in page fixture alongside the custom corporatePricing*Page fixture (built-in page lands on about:blank => vacuous green). Both specs destructure only the custom page object (corporatePricingOverridePage:p / corporatePricingSearchPage:p) and use p.page — verify zero bare ', page' in any test signature. This is the doctrine closure-gate strict-zero gate.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:119,144-149 (Sweep 2 + closure gate); corporate-pricing-override.spec.ts:38,43; corporate-pricing-toolbar-io.spec.ts:26,31 [merged Set1 B25-FG-SWEEP2 + Set2 B25-FALSE-GREEN-CLOSURE-GATE bare-page clause]

### 23. `B25-FG-SWEEP3-VACUOUS-NEGATIVE`  _[blocking]_
Sweep 3: every .toBeHidden()/.toHaveCount(0)/.toBe(0)-on-missing assertion must be guarded by a positive precondition proving the right page/state (else vacuously true on a wrong page). TC-LOC-CPR-503/508/514/515 assert getVisibleRowCount()===0; verify each is preceded by positive proof (URL/empty-state text/'Select a location' visible at line 59).

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:120 (Sweep 3); corporate-pricing-override.spec.ts:55-60,87-93,129-135,137-142 [Set1 B25-FG-SWEEP3]

### 24. `B25-FG-SWEEP4-ISVISIBLE-BRANCH`  _[blocking]_
Sweep 4: no .isVisible()/.isEnabled() used inside an if/ternary that silently takes a wrong branch when the element is absent. Scan both specs + both page objects for conditional control flow keyed on isVisible/isEnabled without an explicit assertion (note search.page.ts:444 uses count()>0 branching — confirm not a false-green branch).

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:121 (Sweep 4); corporate-pricing-search.page.ts:444 [Set1 B25-FG-SWEEP4]

### 25. `B25-FG-SWEEP5-FORCE-CATCH`  _[blocking]_
Sweep 5: no force:true click combined with .catch() (bypasses actionability AND swallows failure). Scan both page objects for force:true on interactive actions.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:122 (Sweep 5) [Set1 B25-FG-SWEEP5]

### 26. `B25-FG-SWEEP6-ALL-NEGATIVE`  _[quality]_
Sweep 6: no test (and no describe block) consists solely of negative assertions with no positive proof of behavior. Each describe must contain positive-behavior tests (Save enables, value persists after reload, header restores, variant fires endpoint). Verify the read/structure describe and the toolbar describes are not all-negative.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:123 (Sweep 6) [Set1 B25-FG-SWEEP6]

### 27. `B25-FG-SWEEP7-STALE-SKIP`  _[blocking]_
Sweep 7 / closure gate: no surviving test.skip/test.fixme masking a fixed bug. The W15 specs declare 0 dropped TCs and a green suite — confirm there is zero skip/fixme; if any exists it must be un-skipped+verified (LR-021) or re-skipped with an updated app-bug comment + verification date.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:124,144-149 (Sweep 7 + closure gate); .claude/rules/specs.md:59-65 (LR-021); W15_A:111,W15_B:107 (0 dropped) [merged Set1 B2-NO-LAZY-SKIP Sweep-7 angle + Set2 B25-FALSE-GREEN-CLOSURE-GATE skip clause]

### 28. `B25-FG-SWEEP8-EVENT-LISTENER`  _[blocking]_
Sweep 8: any page.on()/waitForRequest/waitForResponse listener must attach to the real page-object's page (p.page), not a stray built-in page that would monitor about:blank and return empty arrays. Verify export-URL capture helpers (clickExportVariantAndCaptureUrl, clickLocPricingExportAndCaptureUrl) and the override save listener listen on the correct page context.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:125 (Sweep 8); corporate-pricing-toolbar-io.spec.ts:37-63,128-132; corporate-pricing-override.spec.ts:17-18 [Set1 B25-FG-SWEEP8]

### 29. `B25-FG-SWEEP9-SOLE-TIMEOUT`  _[blocking]_
Sweep 9: no page.waitForTimeout as the SOLE synchronization for a state transition. override.page.ts:158,164,265,292 must each be confirmed as an incidental settle paired with a real wait/assert, not the only thing standing between an action and its read. Overlaps LR-052 (B2-LR052); both must reach the same verdict.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:126 (Sweep 9); corporate-pricing-override.page.ts:158,164,265,292 [Set1 B25 Sweep9 angle — kept distinct from B2-LR052 for cross-check]

### 30. `B25-FG-SWEEP10-WRONGPAGE-SETUP`  _[blocking]_
Sweep 10: no test performs setup via bare page.* then asserts via the page object (or vice-versa) such that setup lands on the wrong page and the assertion reads UNCHANGED real state. Verify setup and assertion share the same page-object context throughout both specs.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:127 (Sweep 10) [Set1 B25-FG-SWEEP10]

### 31. `B25-FG-SWEEP11-LONG-POLL`  _[quality]_
Sweep 11: no expect.poll() with timeout >10s that would mask underlying flake. Scan both specs and both page objects for poll/waitFor timeouts exceeding 10s.

**Provenance**: PLAN_BIG_PIVOT_FCC_MASTER.md:128 (Sweep 11) [Set1 B25-FG-SWEEP11]

### 32. `B25-ASSERTION-MATCHES-XLSX-INTENT`  _[blocking]_
Each spec assertion must prove the documented Expected Result of its matching XLSX/MD test-case — NOT a weakened, inverted, or removed condition that exists only to make the spec pass green. check:tc-parity catches ID/count drift; this catches assertion-semantics drift it is blind to. Any assertion-vs-XLSX-intent drift = DEFECT = RED.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:57 (B2.5 clause ii),103 ('each assertion matches its XLSX test-case intent (no drift-to-pass)') [Set2 B25-ASSERTION-MATCHES-XLSX-INTENT — distinct, the closure subplan's own requirement absent from Set1]

---

## B3 reuse (2)

### 33. `B3-REUSE-ALL026`  _[quality]_
BUILDER must prove reuse before creating new methods/constants (ALL-026/ALL-038/ALL-040). Override/toolbar helpers reuse CorporatePricingBasePage; the WV1.5-B trigger+variant helper must be a SINGLE shared helper on the search/base page object (NOT copy-pasted per variant). Override save-cycle reuses saveAndVerifyCase (field-case-runner.ts); override.page.ts reuses shared save-dialog handling (LR-012). Verify no duplicate save-cycle runner and zero un-extracted 2+ repetition (Phase-2 GARDENER dedup is gated on this).

**Provenance**: docs/read_only_docs/AGENT_SHARED_RULES.md:265-267 (ALL-038/040); clients/encore/CLAUDE.md:105-109 (LR-012); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:58,71-73,102; W15_B:64; corporate-pricing-override.spec.ts:7,231; corporate-pricing-toolbar-io.spec.ts:26 [merged Set1 B3-REUSE-SEARCH-BEFORE-CREATE, Set2 B3-ALL026-REUSE]

### 34. `B3-NO-RAW-PAGE-IN-SPEC`  _[quality]_
No raw page.* interaction logic in spec files (POM discipline) — all DOM interaction routes through page-object methods. Both specs use p.page only for url()/getByText assertions; verify no raw locator-driven clicks/fills live in either spec.

**Provenance**: docs/read_only_docs/AGENT_SHARED_RULES.md:22 (R12),266 (ALL-039) [Set1 B3-NO-RAW-PAGE-IN-SPEC]

---

## B4 locators (4)

### 35. `B4-LR017-PARTITION-EXCLUDED`  _[blocking]_
The corporate-pricing selector partition must remain DELIBERATELY EXCLUDED from ALL_SELECTORS (LR-017) — generic keys (btnSearch/btnReset/Save) collide across screens; an intra-module collision check must verify the 6 screen partitions do not collide with each other, and there is no reuse of selectors/locations/pricing.ts.

**Provenance**: clients/encore/CLAUDE.md:111-118 (LR-017); clients/encore/src/selectors/index.ts:108-124; SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:59 [Set1 B4-LR017-PARTITION-EXCLUDED]

### 36. `B4-SELECTORS-IN-PARTITION`  _[quality]_
All locators must live in the corporate-pricing selector partition files (search.ts/override.ts/etc.) referenced via the imported namespace — no scattered inline CSS in page objects beyond generic role/text locators; zero hardcoded env (currency/locale/office) in selector files. Verify override.page.ts pulls from the OverrideSelectors namespace and the toolbar reuses search selectors.

**Provenance**: docs/read_only_docs/AGENT_SHARED_RULES.md:23 (R13); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:59; corporate-pricing-override.page.ts (OS.* usage); feedback_no_hardcoded_env_in_selectors [Set1 B4-SELECTORS-IN-PARTITION + zero-hardcoded-env clause]

### 37. `B4-LOCATOR-HIERARCHY-NO-FRAGILE`  _[quality]_
Locators must follow the testid-first -> role -> grid-column-header -> content-anchor hierarchy (CPR ships effectively zero automation-grade testids); no nth-child, auto-generated IDs, or deep class chains. Documented live corrections must be honored (grid <th> nests a 'Resize column' button so :text-is must be :has-text; Grid Options is an icon button[aria-label='Grid Options'] not :text-is). Scan override + search selector files for banned fragile patterns.

**Provenance**: docs/read_only_docs/AGENT_SHARED_RULES.md:167-169 (locator priority); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:59 (testid-first->role->grid-header->content-anchor); W15_A:112 (:text-is->:has-text); W15_B:105 (icon button[aria-label]) [merged Set1 B4-NO-FRAGILE-LOCATORS, Set2 B4-LOCATOR-HIERARCHY]

### 38. `B4-LIVE-VERIFIED-LOCATORS`  _[blocking]_
Every selector used by the new specs must resolve on the live DOM (verified via CLI/Chrome per LR-029, not file-inspection alone). The 2026-06-09 override field-inventory + live-grounding note must back the locators; confirm the field-inventory cited by the spec exists and is <=14 days fresh per LR-013 spot-check (2-3 fields).

**Provenance**: docs/read_only_docs/AGENT_SHARED_RULES.md:19 (R09); .claude/rules/inventory.md:54-61 (LR-029); .claude/rules/inventory.md:23-37 (LR-013); corporate-pricing-override.spec.ts:11 [Set1 B4-LIVE-VERIFIED-LOCATORS]

---

## B5 pages (4)

### 39. `B5-PAGE-INHERITANCE`  _[blocking]_
CorporatePricingOverridePage must extend CorporatePricingBasePage (which extends BasePage), reusing inherited nav/save-dialog/Angular-stability helpers. The toolbar-io spec must reuse corporatePricingSearchPage (no dedicated toolbar page object) and that search page must expose the toolbar methods (openExportMenu, openImportMenu, openGridOptions, etc.). Verify the class hierarchy and JSDoc presence.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:60 (B5 extend the base; JSDoc); corporate-pricing-override.page.ts:3,39; audit prompt KEY FILES [merged Set1 B5-PAGE-INHERITANCE + closure B5 clause]

### 40. `B5-FIXTURE-WIRED`  _[blocking]_
The corporatePricingOverridePage and corporatePricingSearchPage fixtures must be registered in src/fixtures/pages.fixture.ts and resolvable (no direct constructor use in specs). Both specs import { test, expect } from the fixtures barrel and consume the page via fixture injection.

**Provenance**: docs/read_only_docs/AGENT_SHARED_RULES.md:24 (R14); corporate-pricing-override.spec.ts:1; corporate-pricing-toolbar-io.spec.ts:1 [Set1 B5-FIXTURE-WIRED]

### 41. `B5-ENSURE-DEFAULT-STATE-THROWS`  _[blocking]_
The mutation-restore helper ensureDefaultState(ANCHOR, DEFAULTS, LOC) must be a bounded-retry read->re-set->save->reload->re-verify that THROWS on residual drift (save-success alone never proves reset landed, per the Legal pattern); it must not be a best-effort no-throw stub. Toolbar's ensureAllGridColumnsVisible restore must similarly be proven across re-runs with zero cross-run drift.

**Provenance**: .claude/rules/specs.md:39-57 (LR-019 path 2 / ensureDefaultState pattern); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:63 (restore proven across re-runs, zero drift); corporate-pricing-override.spec.ts:226,234,304; W15_A:95 [Set1 B5-ENSURE-DEFAULT-STATE-THROWS]

### 42. `B5-TYPECHECK-CLEAN`  _[blocking]_
Client-scoped typecheck (npm run typecheck --prefix clients/encore) must exit 0. The root-level typecheck failure must be POSITIVELY confirmed to be confined to the single deprecated dead script scripts/build-framework-vendor.ts (tracked by PLAN_ROOT_CLIENT_DEDUPE, package.json:5 DEPRECATED) and OUT of Wave-1.5 scope — not assumed. The client-scoped typecheck is the deliverable gate.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:60 (B5 typecheck clean); audit prompt Phase-0 + boundary note; clients/encore/CLAUDE.md repo-structure [merged Set1 CROSS-TYPECHECK-CLEAN into B5 pages dimension per closure subplan B5]

---

## B6 MD/test-plan parity (4)

### 43. `B6-MD-SPEC-PARITY`  _[blocking]_
The Markdown test-case files (corporate_pricing_override_test_cases.md = 28 TC, corporate_pricing_toolbar_io_test_cases.md = 17 TC) must each contain every implemented spec TC-ID with Status=Automated, titles and one-liner steps matching the spec intent; spec subset-of MD subset-of XLSX via check:tc-parity. Markdown is the client deliverable; drift = invisible tests.

**Provenance**: docs/read_only_docs/AGENT_SHARED_RULES.md:282 (ALL-071); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:61 (spec subset MD subset XLSX); clients/encore/CLAUDE.md:72-86 (LR-ENC-002) [Set1 B6-MD-SPEC-PARITY]

### 44. `B6-TEST-PLAN-SCENARIOS-SELECTOR-MAP`  _[quality]_
Each test-plan (corporate_pricing_override_test_plan.md, corporate_pricing_toolbar_io_test_plan.md) must contain Scenarios covering the FCC blocks (tabs, location-gating, filters, edit/BVA, save-cycle, export/import variants, grid-options persistence) so every TC has a matching plan scenario, AND a Selector-Mapping table must be present (per closure B6).

**Provenance**: docs/read_only_docs/AGENT_SHARED_RULES.md:301 (Planner self-audit item 1); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:61 (Selector-Mapping table present); clients/encore/CLAUDE.md:72-84 (LR-ENC-002) [merged Set1 B6-TEST-PLAN-SCENARIOS + closure Selector-Mapping clause]

### 45. `B6-FIELD-INVENTORY-FRESH`  _[blocking]_
The override field-inventory cited by the spec (corporate-pricing-override-2026-06-09.md) must exist, carry all 8 mandatory frontmatter keys + 7 sections per field-inventory-spec.md, have MCP_Session_Date equal to the filename date, and be <=14 days fresh (dated today). The toolbar-io field-inventory (corporate-pricing-toolbar-io-2026-06-08.md) must satisfy the same and be within freshness.

**Provenance**: .claude/rules/inventory.md:23-37 (LR-013); .claude/rules/inventory.md:39-42 (LR-014); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:63 (LR-014 8 keys/7 sections); corporate-pricing-override.spec.ts:11; corporate-pricing-toolbar-io.spec.ts:6-7 [Set1 B6-FIELD-INVENTORY-FRESH]

### 46. `B6-MISSING-TESTID-REPORT`  _[quality]_
The missing-testid report (corporate-pricing-missing-testids-report.md) must be present and LR-029-compliant (live-DOM verified, not selector-file-only), documenting that CPR ships effectively zero automation-grade testids — backing the content-anchored locator strategy.

**Provenance**: .claude/rules/inventory.md:54-61 (LR-029); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:63 (missing-testid report LR-029); clients/encore/specs_planning/_internal/corporate-pricing-missing-testids-report.md [Set1 B4-LIVE-VERIFIED partial + closure B8 missing-testid clause — distinct artifact obligation]

---

## B7 divergence-filing (3)

### 47. `B7-DIVERGENCE-FILED-OR-CLASSIFIED`  _[blocking]_
Every suspicious/buggy behavior surfaced during FCC must be classified per the bug doctrine, not silently absorbed. The undocumented Override screen (Q-WV15-1) + Export/Import variants (Q-WV15-2) must be RAISED via /encore-questions; NM-1870 (Current Price blank) and NM-1889 (filter matches wrong columns) asserted NOT-REPRODUCED in-spec must each have a dated LR-044 live verdict in the field-inventory/divergence draft; CPR-WV15-Q3 (Max Discount cap) recorded. Every TC traces to the live inventory OR is labelled [inference]. Confirm none required a BUG-*.json that was skipped.

**Provenance**: docs/read_only_docs/LEARNED_RULES.md:30-38 (LR-030),112-153 (LR-034/LR-044); .claude/rules/baseline.md:22-26 (row 4); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:62; corporate-pricing-override.spec.ts:72,128; W15_A:113-114 [merged Set1 B7-DIVERGENCE-FILED-OR-CLASSIFIED + closure B7 traces-to-inventory-or-inference clause]

### 48. `B7-BASELINE-ABSENT-RECORDED`  _[blocking]_
The Override + toolbar screens are absent from the baseline/DOCX (net-new on e2e) — divergences must be recorded as baselineScope: baseline-absent and escalated via /encore-questions (Q-WV15-1/2), NOT HALTed and NOT filed as regression-from-baseline. Any BUG filed (if any) must carry baselineComparison classification per LR-034.

**Provenance**: .claude/rules/baseline.md:22-26 (row 4c); clients/encore/CLAUDE.md:42-70 (LR-ENC-001); docs/read_only_docs/LEARNED_RULES.md:132-139 (LR-034); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:46; W15_A:22,48 [Set1 B7-BASELINE-ABSENT-RECORDED]

### 49. `B7-EDGE-P3-DEFERRAL-GREPVERIFIABLE`  _[blocking]_
WV1.5-B's real download/upload round-trip + import validation deferral (and any RBAC/NM-2126 NOT-AUTOMATABLE) must be classified per LR-040 (a) MCP-proven, (b) grep-verifiable line item in a named downstream subplan that exists in plans/pending|done, or (c) user-flagged bug-ID/discussion-item — never prose-only. Confirm SUBPLAN_CORP_PRICING_EDGE_P3.md actually contains the deferred toolbar-io real-I/O round-trip line item.

**Provenance**: .claude/rules/pipeline.md:63-84 (LR-040); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:62,104; W15_B:24,61,110; audit prompt deferral target [merged Set1 B8-LR040-GAP-DESTINATION + closure B7 EDGE_P3 clause]

---

## B8 process-artifacts (7)

### 50. `B8-CLOSURE-EXEC-SUMMARY`  _[blocking]_
Each subplan moved to plans/done/ (W15_0/A/B) must carry Status: DONE + Executed date + an Execution Summary enumerating TCs implemented (count+IDs), TCs dropped (with NOT-AUTOMATABLE/DEFERRED/APP-BUG justification), MCP verification results, doc changes, and dated pass confirmation (LR-027). The W15_99 closure subplan governs the parent.

**Provenance**: .claude/rules/pipeline.md:25-46 (LR-027); W15_A:101-118,W15_B:97-138 [Set1 B8-CLOSURE-EXEC-SUMMARY]

### 51. `B8-CLOSURE-GATE-C1-C6`  _[blocking]_
validate-plan-closure must PASS (or carry a valid override) for every Status:DONE flip — C2 Execution-Summary skeleton, C3 cited artifact paths exist on disk, C4 no phantom/circular handoff + parent-cascade annotation (master is pending), C5 strict-line/deviation axis-match, C6 Per-Identity matrix delivery (every Concrete-deliverable cell = existing file path / (skipped:reason>=20chars) / (none)). Verify the W15 subplans' matrices have no vague-prose cells.

**Provenance**: .claude/rules/plan-closure.md:13-53 (LR-055 C1-C6); .claude/rules/pipeline.md:254-308 (LR-048 v3 matrix); W15_A:78-92 (Per-Identity Satisfaction) [Set1 B8-CLOSURE-GATE-C1-C6]

### 52. `B8-PER-IDENTITY-MATRIX-COMPLETE`  _[blocking]_
The W15_A/B Per-Identity Satisfaction matrices must enumerate every touched artifact class (spec, test-cases.md, test-plan.md, XLSX, field-inventory) with each cell either an existing file path, an honest (skipped:reason>=20chars), or explicit (none) — silence on any identity row is an LR-048 violation. Documented deviations (e.g. W15_A HUNTER row's refreshed field-inventory emitted as a GIVER artifact; HEALER activated by first-run failures) must be present in the Execution Summary.

**Provenance**: .claude/rules/pipeline.md:270-308 (LR-048 v3); clients/encore/CLAUDE.md:72-86 (LR-ENC-002); W15_A:78-92,117; W15_B:74-83 [Set1 B8-PER-IDENTITY-MATRIX-COMPLETE]

### 53. `B8-PARENT-CASCADE`  _[blocking]_
Each child closure (W15_0/A/B) must annotate its DONE line inside the still-pending parent (PLAN_CORP_PRICING_MASTER.md) with format '- [child](../done/child.md) — DONE YYYY-MM-DD, summary'; and the master must NOT be prematurely flipped (F16 exemption — parent stays PENDING until Wave-2 + Wave-3 also close). Verify the annotation exists and the auto-close clause was correctly suppressed.

**Provenance**: .claude/rules/pipeline.md:46-48 (LR-027 parent-cascade annotation); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:24,77,106-107; W15_A:121 (F16) [Set1 B8-PARENT-CASCADE]

### 54. `B8-ACTIVITY-LOG-ROW`  _[blocking]_
An agent-activity-log.md row must exist for every Wave-1.5 session that touched pipeline files (specs, page objects, selectors, data, test-cases, test-plans, field-inventories), with a When timestamp >= the latest mtime of every listed file (no backdating; 1-minute tolerance per LR-037).

**Provenance**: .claude/rules/pipeline.md:50-61 (LR-028); docs/read_only_docs/LEARNED_RULES.md:171-185 (LR-037); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:63 [Set1 B8-ACTIVITY-LOG-ROW]

### 55. `B8-STRICT-LINE-NO-RESCOPE`  _[blocking]_
If any W15 plan line is strict (zero/all-N/every/100%/must-equal) — e.g. 'all 28 TCs', 'all 4 variants', 'every variant', 'zero ALL-026 un-extracted repetitions', 'ZERO UNVERIFIABLE permitted' — it must be satisfied as written, not rescoped via APPEND/SPAWN/DO-NOW without prior user authorization; any such rescope floors the verdict to RED (LR-046). The closure subplan's own do-or-die strict lines (one DEFECT/UNVERIFIABLE = RED = HALT, no rounding to YELLOW) bind this audit.

**Provenance**: .claude/rules/pipeline.md:138-178 (LR-046); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:99,102,105 (strict do-or-die lines); W15_A:109; corporate-pricing-toolbar-io.spec.ts:31-35 (all 4 variants) [Set1 B8-STRICT-LINE-NO-RESCOPE]

### 56. `B8-BANDS-NON-COLLIDING`  _[blocking]_
The TC bands 5NN (Override, 501-528) and 6NN (toolbar-io, 601-617) must be non-colliding with each other and with the existing CPR bands (0NN Search, 1NN Strategy, 2NN Detail) — no duplicate TC IDs across the module's specs/MD/XLSX. The Override fixture must be the one actually used and proven restore-clean across re-runs.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:63 (bands 5NN/6NN non-colliding; Override fixture used + restore proven); W15_A:109; W15_B:101 [Set1 B8 process bands clause — distinct]

---

## cross (5)

### 57. `CROSS-BROWSERTOOL-DECLARED`  _[quality]_
Each Wave-1.5 subplan must declare BrowserTool: cli in frontmatter with justification, and any mid-subplan browser switch must be logged; >=2 switches => YELLOW, >=3 => RED. W15_A/B/99 declare BrowserTool: cli — verify no undeclared Chrome usage occurred and the LR-054 (playwright-cli != npx playwright) capability boundary was respected (no manufactured CLI-limit HALTs).

**Provenance**: .claude/rules/browser-tool.md:50 (frontmatter declaration),60-64 (switch budget),LR-054; W15_A:15-16; W15_B:15-16; SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:15 [Set1 CROSS-BROWSERTOOL-DECLARED + LR-054 boundary]

### 58. `CROSS-MODEL-THINKING-PERMMODE`  _[quality]_
Each W15 subplan frontmatter must declare valid Model + Thinking + PermissionMode combos per LR-041 (Opus xhi valid; Opus max requires a Justification line; forbidden = Sonnet lo/max, Opus lo/mid). W15_A/B declare Opus / xhi / auto; W15_99 declares Opus / max / auto with a Justification line — verify all three comply.

**Provenance**: .claude/rules/pipeline.md:86-110 (LR-041); W15_A:11-13; W15_B:11-13; SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:10-13 (max + Justification) [Set1 CROSS-MODEL-THINKING-PERMMODE]

### 59. `CROSS-NO-HANDOFF-BLOCKERS`  _[quality]_
No closure artifact or Execution Summary may carry blocker-framing handoffs (named failure modes, 'refuses to', 'impossible', pre-warnings to the next session) per LR-039. Verify the W15 summaries describe outcomes, and that spec header notes (recon 'false negative', NM not-reproduced verdicts) are evidence records, not contaminating obstacle claims. AUD-017: the auditor must not self-grade its own authoring (fresh-context, separate session).

**Provenance**: docs/read_only_docs/LEARNED_RULES.md:189-214 (LR-039); SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:22 (AUD-017); corporate-pricing-override.spec.ts:13-14 [Set1 CROSS-NO-HANDOFF-BLOCKERS + AUD-017]

### 60. `CROSS-DELIVERABLE-NO-LEAK`  _[quality]_
Nothing agent-internal (CLAUDE.md, specs_planning/, field-inventories, plan files, internal NM-defect crossref) may leak into the shippable spec/page/selector/data/XLSX in a way that exposes internal IP; the deliverable ships via git-archive only (LR-049). Verify the specs' header comments are acceptable test documentation and the MD/XLSX layer is clean per xlsx vocab-lint (NM-#### / query-param / framework-id tokens must not appear in deliverable cells).

**Provenance**: .claude/rules/pipeline.md:321-349 (LR-049); clients/encore/CLAUDE.md repo-structure ship discipline; scripts/xlsx-lint-rules.mjs BANNED [Set1 CROSS-DELIVERABLE-NO-LEAK]

### 61. `CROSS-AGENTMISTAKES-MISSING`  _[info]_
The closure subplan's Bootstrap (line 34) and Phase-0 LR-scan name clients/encore/specs_planning/_internal/agent-mistakes.md as a context file, but that file does NOT exist on disk (only agent-activity-log.md is present; verified via ls). Any ALL-* mistake-log obligation (ALL-026 reuse, ALL-077/LR-054 CLI-hallucination advisory, AUD-017) therefore could not be cross-checked against the named file and must be sourced from the rules that graduated from it. Downstream Stage-B must NOT treat the missing file as a defect in the deliverable (it is a stale plan-context reference), but MUST flag that this audit-input could not be consulted — and verify the ALL-* obligations via their graduated rule homes instead.

**Provenance**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md:34,40 (names agent-mistakes.md); clients/encore/CLAUDE.md related-docs table (points to agent-mistakes.md); filesystem ls of _internal/ (file absent); .claude/rules/browser-tool.md (LR-054/ALL-077) [Set2 BX-AGENTMISTAKES-MISSING — distinct provenance-gap flag]

---

