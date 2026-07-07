# SUBPLAN — NM-2305 Loc Pricing Import: harden the suite against the council review

<!-- BOOTSTRAP -->
**Status**: DONE
**Identity**: OWNER (orchestrator; pipeline-artifact edits delegated to a Sonnet subagent under OWNER oversight per the root CLAUDE.md subagent model — "spawn agents and audit their work")
**PermissionMode**: default (real edits + live app; mutation-safe office 5897 only)
**BrowserTool**: cli (Playwright runner temp probes for live recon; functional round-trip, unattended)
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Ticket**: NM-2305 (follow-up hardening after the shipped suite's 2-vendor council review)
<!-- /BOOTSTRAP -->

## Context

The 2-vendor `/ultra-agents` council review (gpt-5.5 `MATERIAL_ISSUES`, opus-4.6 `NO_MATERIAL_ISSUES`)
of the shipped NM-2305 suite returned 28 raw items → **20 deduped (M1–M20)**. Every item was
re-verified against source. Disposition: **16 FIX (M1–M16)**, **2 DEFER (M17/M18 — own subplan)**,
**2 SKIP (M19/M20 — user-approved)**. The shipped suite is sound and safe as-is; this is hardening +
coverage, not a bug repair.

Live probes on office 5897 (2026-07-07) grounded M13–M16 (NEVER-ASSUME) and **overturned two
assumptions** (captured live from the office-5897 probes):
- Only **IsAlternate** is import-writable (IsInternal/IsLabor/IsProduction report "updated" but do not change).
- A novel pricebook is **silently dropped** (createdCount:0, row never appears) — import updates, never creates.
- Replace scope is per-**(location, currency)**, not per-location (a USD file leaves a location's CAD rows intact).
- Header-only CSV → distinct client rejection *"Please check the upload file format."* (≠ empty.csv).

## Per-item disposition (all M1–M20)

### FIX — page object (M1–M5) · spec (M6–M12) · coverage (M13–M16)
| # | Item | Fix |
|---|---|---|
| M1 | Promise.race classifier unsound | Rewrite `uploadFileToOpenDialog`: arm `waitForRequest(PUT import)` before file-choose; classify on request-fired; fail loudly on "neither" |
| M2 | Rejection regex closed-enumeration → 60s hang | Removed the fixed regex; read the dialog text after the request window (no enumeration) |
| M3 | `.catch(()=>null)` swallows crash/nav | Re-throw non-`TimeoutError` in the request-wait catch |
| M4 | Returns before dialog hides on 200 | `await` dialog hidden on the success branch |
| M5 | `restoreLocPricingRows` no CSV escaping (unused) | Add RFC-4180 `toCsvField` quoting |
| M6 | TC-046 listener armed after open | Arm the request listener BEFORE opening the affordance |
| M7 | TC-045 asserts no message | Assert an error IS surfaced (error-family match) + no PUT + no change |
| M8 | TC-042 survivors on IsAlternate+count only | Assert both survivor rows full 11-column `toEqual` (LR-068) |
| M9 | "other locations untouched" reads only 5897 | Capture canary office 1101 slice before/after; assert unchanged (order-agnostic) |
| M10 | beforeEach reset trusts PUT success | Re-read export, assert 5897 == 3 baseline rows (LR-067 persistence-verified) |
| M11 | `requireRow` hardcodes OFFICE in error | Parameterize `locationNo` (default OFFICE) |
| M12 | Stale headers (spec/MD/data) + per-location wording | Refresh 3 files + refine to per-(location,currency); note write-scope + novel-drop |
| M13 | Header-only CSV untested (≠ 0-byte) | Fixture + TC-049: client-rejected "Please check the upload file format", no PUT, 5897 unchanged |
| M14 | No non-IsAlternate field coverage | Fixture + TC-050: only IsAlternate written; IsInternal/IsLabor/IsProduction stay 0 (live-observed) |
| M15 | No create-new-row coverage | Fixture + TC-051: novel pricebook silently dropped (createdCount:0, row absent) |
| M16 | No multi-location automation | **Documented finding** — no sanctioned 2nd throwaway office (5897-only contract); per-(loc,currency) scope + M9 canary cover "others untouched"; one-time live multi-loc verification stands |

### DEFER — APPROVED (user, this session; own follow-up subplan `SUBPLAN_CORP_PRICING_IMPORT_SCHEMA_AND_CURRENCY`)
| # | Item | Reason |
|---|---|---|
| M17 | Schema-robustness matrix (dup rows / unknown loc / column-order / header-case / extra-missing cols) | 5+ server behaviors, each must be live-observed first — a mini-project, not a hardening pass |
| M18 | Currency CAD/MXN fidelity | 5897 is USD-only; needs recon for a safe non-USD throwaway office |

### SKIP — APPROVED (user, this session)
| # | Item | Reason |
|---|---|---|
| M19 | TC-048 bounded loc-1430 500 repro | loc 1430 = non-throwaway production office (breaks 5897-only safety); the 500 is document-level not row-count-gated (won't repro bounded) — both reviewers agree documented-not-automated is sound |
| M20 | beforeEach double CSV download | Correctness-neutral; the pre-import capture IS the mutation-safety guarantee (M10 adds a deliberate persistence re-read) |

## Execution (delegated)
- **Phase A (Sonnet subagent, code)**: page object M1–M5, spec M6–M12, coverage TCs M13–M15, 3 new fixtures + `npm run typecheck` + `npm run check:spec-quality` + `check:per-test-baseline`.
- **Phase B (Sonnet subagent, parity)**: test-cases MD + test-plan (TC-049/050/051 + count + Axis-2 M16 finding) + `npm run xlsx:build` + `npm run check:tc-parity`.
- **Oversight (Opus, me)**: exact edit-spec design (I own judgment), live probes, review every diff, full-suite ×2 run, 5897 baseline confirm, fresh HTML report screenshot, closure.

## Per-Identity Satisfaction

| Identity | Artifacts | Concrete Deliverable |
|---|---|---|
| BUILDER/HEALER (delegated to Sonnet) | page object + spec + data + fixtures | clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts |
| GIVER (delegated to Sonnet) | test-cases + test-plan + xlsx | clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md |
| OWNER (me) | subplan + activity log | clients/encore/specs_planning/_internal/agent-activity-log.md |
| WATCHDOG (me) | post-execution audit | (none) |

## Verification
- `npx playwright test corporate-pricing-toolbar-io --workers=1` → green ×2 (serial-safe).
- `npm run typecheck` clean; `npm run check:tc-parity` exit 0; `npm run check:spec-quality` + `check:per-test-baseline` pass.
- Fresh export of 5897 = exactly the 3 baseline rows (all IsAlternate=0).
- HTML report screenshot: TC-041..047 + TC-049/050/051 green → delivered in chat for the Encore ticket.

## Execution Summary

**Executed**: 2026-07-07

**Outcome**: 16 council items fixed and verified; 2 deferred (approved); 2 skipped (approved). Delegated
model: Opus (me) designed every edit + ran all live app work + reviewed every diff; a Sonnet subagent
applied the deterministic edits (code + parity). All NM-2305 tests green on two consecutive full-file runs.

**What landed**:
- Page object (`corporate-pricing-search.page.ts`): `uploadFileToOpenDialog` rewritten to classify on the
  real PUT firing (request-armed before file-choose), re-throw non-timeout errors, await dialog-hidden on
  success, and throw on an unclassifiable "neither" outcome (M1–M4); RFC-4180 `toCsvField` escaping in
  `restoreLocPricingRows` (M5).
- Spec (`corporate-pricing-toolbar-io.spec.ts`): TC-046 listener armed before open (M6); TC-045 asserts a
  surfaced error (M7); TC-042 asserts both survivor rows at full 11 columns + a canary office untouched
  (M8/M9); `beforeEach` persistence-verified reset (M10); `requireRow` parameterized (M11); stale headers +
  per-(location,currency) wording refreshed (M12); new TC-049 (header-only rejection), TC-050 (only
  IsAlternate is import-writable), TC-051 (novel pricebook silently dropped) (M13–M15).
- Data (`toolbar-io.ts`): `rejectHeaderOnlyMessage`, 3 new fixture keys, per-currency + write-scope docs.
- Fixtures: `header-only.csv`, `field-writability.csv`, `create-novel.csv`.
- Parity: test-cases MD (count 51 = 49 auto + 2 manual, 3 new TC blocks, Axis-2 + multi-location gap note),
  test-plan (per-currency + Coverage Index), `encore_test_cases.xlsx` rebuilt. `check:tc-parity` exit 0.

**Live evidence (office 5897, 2026-07-07)** — overturned 2 review assumptions (NEVER-ASSUME):
- Only `IsAlternate` is import-writable; Internal/Labor/Production report "updated" but do not change.
- A novel pricebook is silently dropped (createdCount 0, never appears) — import updates, never creates.
- Replace scope is per-(location, currency), not per-location (a USD file leaves CAD rows intact) — a
  currency probe leak was caught by the `toBe(3)` guard and cleaned; 5897 confirmed back at 3 baseline rows.

**Verification**: full `corporate-pricing-toolbar-io` file ×2 (workers=1) → my 10 NM-2305 tests green both
runs; `npm run typecheck` clean; `check:spec-quality` + `check:per-test-baseline` + `check:tc-parity` pass;
5897 confirmed at baseline; a fresh HTML report screenshot (11/11 green, NM-2305-only) was delivered in
chat for the ticket.

**Deferred (approved, own follow-up)** → `SUBPLAN_CORP_PRICING_IMPORT_SCHEMA_AND_CURRENCY`: M17 (schema
robustness matrix), M18 (CAD/MXN currency fidelity — needs a non-USD safe office).
**Skipped (approved)**: M19 (loc-1430 500 repro — breaks 5897-only safety), M20 (beforeEach double download
— correctness-neutral).

**Deviation / honest caveat**: the full file also shows 4 pre-existing failures — TC-008/009/010/011,
the separate **Import ▾** grid-scoped menu affordance (NM-2265), whose variant click drifted to a
Year(s)+Currency gate. Proven out of scope: they use methods this change never touched, fail identically
in isolation, and run before the NM-2305 tests. User confirmed out of scope; left for NM-2265.
