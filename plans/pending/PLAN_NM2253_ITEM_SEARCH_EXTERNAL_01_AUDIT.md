# PLAN_NM2253_ITEM_SEARCH_EXTERNAL_01_AUDIT — fresh-session WATCHDOG audit of the NM-2253 Item Search QUICK delivery

**Status**: PENDING
**Priority**: P2
**Created**: 2026-09-01
**Identity**: WATCHDOG
**Parent**: PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md (plans/done/ after its closure)
**Depends on**: none (the delivery is committed on branch NM-2253)
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: cli
**CoverageMode**: quick (audits a quick-tier delivery — LR-072 gate discipline: `deferred-to-DEEP` rows are the owner's demand signal, not findings)
**ActiveClient**: encore

> **SESSION BOOTSTRAP** — run in a FRESH session (that is the point):
> 1. `/identity WATCHDOG` (full MODE A ceremony — read `.claude/agents/AUDIT.md` in full).
> 2. This plan exists because the producing session may not self-grade (AUD-017 / AGENT_SHARED_RULES §19): the entire NM-2253 delivery — HUNTER walk, GIVER artifacts, BUILDER specs, bug filings, closure — was produced by one session (commits `8cd3a355`, `0c375154`, `55611cc8`, `9f6418f6`, `dee425df` + the closure commit(s) dated 2026-09-01 on branch NM-2253). Findings land in THIS file, not in the producer's artifacts.
> 3. Execute the producer plan's Phase 3 contract verbatim (reproduced below) and verify the claims table.
> 4. Runner discipline: strictly sequential — confirm no other spec run/CLI session is active before any live probe.

---

## What to audit (the producer plan's Phase 3 contract, verbatim scope)

Emit `clients/encore/specs_planning/_internal/audit-item-search-<AUDIT-DATE>.md`:

1. **FCC-completeness** — every inventory field × applicable field-case-generation §2 columns covered-or-dispositioned (inventories: `item-search-product-search-2026-08-31.md`, `item-search-product-code-2026-08-31.md`, `item-search-product-groups-2026-08-31.md`).
2. **Surface-completeness** — every applicable §3 family ≥1 QUICK TC or reasoned out-of-scope (catalog: `field-case-catalogs/item-search-2026-08-31.md`).
3. **Walk completeness** — Coverage_Ratio 100%, CrossCheck clean, opener frontier empty, G1-clean deferrals (walk-evidence + the 2 machine-bound manifests; AUDIT HARD STOPs #11/#11b — audit the TDW verdict trail for rubber-stamps).
4. **Bug-loop closure** — every `walk-evidence-item-search-2026-08-31.md` Observations bucket item dispositioned. Expected state: item 1 → `BUG-ISR-PCD-001` filed; item 2 → held under owner ruling OR-1 (enabled-but-inert View Availability — verify the ruling citation, challenge if thin); items 3–4 → discussion-items; item 5 (added 2026-09-01) → `BUG-ISR-PRS-001` filed. Verify both bug JSONs pass the LR-034 enum gate content-wise and their evidence pointers resolve.
5. **Divergence ledger** — D1/D2 (+ D3–D5 added at closure) resolved with classification; OR-1..OR-6 owner rulings faithfully implemented in the case set.
6. **Machine gates re-run** — `npm run check:tc-parity` exit 0; `npm run check:spec-quality`; module suite re-run green (producer's last full run: 42 passed, 6.1m, 2026-09-01 — reproduce, respecting the sequential-runner rule).
7. **LR-ENC-008 spot-audit** — sample 3 lazy-surface TCs; no contract recorded from an unsettled read.

## Producer-session 10-claim verification table (verify each — do not trust)

| # | Claim | Where it lives | How to check |
|---|---|---|---|
| C1 | 41 TCs total (PRS 21 · PCD 10 · PGR 10), spec↔MD↔XLSX parity clean | test-case MDs + `testcases/encore_test_cases.xlsx` | `npm run check:tc-parity` (ISR sheets 21/10/10 rows) |
| C2 | Full module green: 42 passed incl. auth setup; TC-ISR-PRS-021 is `test.fail()` and its failure IS the spills assertion (not an incidental crash) | `tests/item-search/*.spec.ts` | re-run suite; read TC-021 failure detail in the report |
| C3 | Date pair validation live: Prep > Return → red message + Search disabled; Reset clears | TC-ISR-PRS-020 (green) | re-run or live probe |
| C4 | Date overflow defect real: 7/12 months Prep (Oct +12, Nov +27, Dec +27, Jan +11, Feb +17, Aug +5, Sep-2027 +30 px), Return +23 px | `BUG-ISR-PRS-001` + PRS inventory rows + screenshot `.playwright-cli/page-2026-09-01T10-59-30-124Z.png` | re-measure ≥2 months live (LR-061 N≥2) |
| C5 | View→Category silent no-op with 4 working sibling positive controls | `BUG-ISR-PCD-001` + walk-evidence item 1 | live re-probe (LR-ENC-008 varied waits) |
| C6 | TC-006 truncation contract measured on the cell's inner element (td always reads fitting); positive control found 192 clipped cells | PRS inventory + `item-search.page.ts` `findTruncationSamples` | read the code; spot-check live |
| C7 | nav2 baseline env-blocked (TLS ClientHello rejection, 6 retries) — NOT a skipped walk | `old-site-baseline/item-search-2026-08-31.md` | verify evidence trail; optionally 1 fresh retry |
| C8 | Nothing persisted on the live app: no Save clicked anywhere; dialogs exited via Close/Cancel; date probes ended with Reset | specs + walk-evidence probe log | grep specs for save-path calls; review probe log |
| C9 | 42 `deferred-to-DEEP` rows seeded into `SUBPLAN_PRODUCTS_DQU.md` (grep-verified at closure) | DQU § NM-2253 seeds | re-grep the 42 ids vs inventories |
| C10 | The two known parity FLAG families (CPR/LOS/LOC title divergence) and the TC-SVC-HIS-012 reject-oracle announce are PRE-EXISTING, not introduced by this delivery | tc-parity + spec-quality output | compare against `main`/pre-NM-2253 state |

## Deliverable

`audit-item-search-<AUDIT-DATE>.md` (WATCHDOG-owned path) + findings table (severity/evidence/recipient + copy-pastable remediation prompts). Terminal node — report only, no auto-invoke. Close this plan per LR-027 (Execution Summary, DONE, `git mv` to done/, reindex).
