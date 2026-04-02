# PLAN: RCA — 7 Full-Run Test Failures (2026-03-25)

**Priority:** HIGH
**Created:** 2026-03-26
**Status:** Pending investigation
**Scope:** Diagnose only — no fixes until hypotheses are confirmed

---

## Problem Statement

Full suite run (2026-03-25, `npm test -- --project=chrome`) produced:
- **117 passed, 7 failed, 15 skipped, 91 did not run** (11.3 min)

Tests pass individually but fail in the full run. The "91 did not run" is because Playwright stops a spec file after a failure (serial mode). The 7 failures cascade — fixing the root cause may reduce failures to 1-2.

---

## Failed Tests

### Pattern A: Navigation Abort (6 specs)

| Test | Spec File | Error |
|------|-----------|-------|
| SEED-001: Auth smoke test | tests/seed.spec.ts:12 | Auth/navigation failure |
| TC-LOC-ACC-001: Navigate to Account tab | tests/specs/setup/locations/location-account-address.spec.ts:12 | net::ERR_ABORTED + timeout |
| TC-LOC-CUR-010: MXN Merchant dropdown | tests/specs/setup/locations/location-currency.spec.ts:95 | net::ERR_ABORTED + timeout |
| TC-LOC-LGL-002: Default field values | tests/specs/setup/locations/location-legal.spec.ts:24 | net::ERR_ABORTED + timeout |
| TC-LOC-NTS-008: Save via left panel | tests/specs/setup/locations/location-notes.spec.ts:103 | net::ERR_ABORTED + timeout |
| TC-LOC-PRI-001: Verify default state | tests/specs/setup/locations/location-pricing.spec.ts:20 | net::ERR_ABORTED + timeout |
| TC-LOC-SSL-008: Shares Inventory save | tests/specs/setup/locations/location-shared-setup-locations.spec.ts:74 | net::ERR_ABORTED + timeout |

**Common diagnostics:**
- Auth chain succeeds (SSO + MFA complete in all cases)
- Navigation to location settings URL triggers 20+ `net::ERR_ABORTED` requests
- URLs contain `/locations//home` (EMPTY location ID — double slash)
- Server 500 on `/navigator/api/location/labour-costs-assumptions?culture=en-US&locationId=1604&currencyId=1`
- 404s on favicon (harmless, expected)
- BSSO extension "NoExtension" info log (benign, MSAuth fallback works)

### Pattern B: Element Not Clickable (1 spec)

| Test | Spec File | Error |
|------|-----------|-------|
| TC-LOS-ECT-007: Two independent Save buttons | tests/specs/setup/local-office/local-office-ect.spec.ts | locator.click timeout 10s on `[data-testid="ect-settings-input-benefits-multiplier"]` |

**Diagnostics:**
- Navigation succeeds (different from Pattern A)
- Element exists in DOM but not clickable within 10s
- Same server 500 on `labour-costs-assumptions` API
- Duration: 11.5s (just over the 10s timeout)

---

## Root Cause Hypotheses

### H1: Backend Instability / Test Environment Degradation (MOST LIKELY)
**Evidence:**
- Server 500 on `labour-costs-assumptions` API (consistent across all failures)
- Mass `net::ERR_ABORTED` = browser aborting requests because the server isn't responding in time
- Empty location ID in URLs (`/locations//home`) = Next.js client router lost state after a failed API call
- The 500 error timestamp shows it occurred DURING navigation, not before

**Investigation steps:**
1. Check if `cloudapps-e2e.encoreglobal.com` was experiencing issues on 2026-03-25 ~19:30-21:40 UTC
2. Re-run full suite and compare — if failures are different/absent, confirms transient backend issue
3. Check server-side logs for the 500 on `labour-costs-assumptions`

### H2: Auth Session Token Revocation Under Sequential Load
**Evidence:**
- `authenticatedSession` fixture is worker-scoped — one fresh SSO login per spec file
- With 11+ spec files running sequentially (workers=1), that's 11+ separate SSO logins to the same account
- Microsoft SSO may rate-limit or revoke earlier sessions when too many are created in sequence
- seed.spec.ts failure (first spec!) contradicts this — unless the login was already flaky

**Investigation steps:**
1. Check if seed.spec.ts passes when run alone: `npm test -- tests/seed.spec.ts`
2. Run full suite with `--retries=1` — if retries pass, suggests transient auth issue
3. Check Microsoft SSO rate limits for the test account

### H3: Next.js RSC Prefetch Storm Overwhelming Backend
**Evidence:**
- All aborted URLs have `_rsc=` query params (React Server Component prefetch)
- Navigator Cloud app fires 10+ RSC prefetches simultaneously on every navigation
- Under load (full test suite = many navigations), the backend connection pool may exhaust
- Once exhausted, all subsequent requests abort with `net::ERR_ABORTED`

**Investigation steps:**
1. Count total navigation events across the full suite run
2. Add request throttling/debouncing in page objects' `navigateTo()` methods
3. Check backend connection pool settings

---

## Recommended Investigation Plan

### Step 1: Re-run and compare (5 min)
```bash
npm test -- --project=chrome --retries=1
```
If retries pass → transient issue (H1). If same failures → systematic issue (H2/H3).

### Step 2: Isolate seed.spec.ts (2 min)
```bash
npm test -- tests/seed.spec.ts --project=chrome
```
If passes alone → confirms full-run-only failure pattern.

### Step 3: Run with verbose network logging (15 min)
Enable Playwright trace on all tests (`trace: 'on'` in config), re-run, then analyze traces for the failed tests to see exact request/response timing.

### Step 4: Check backend health
Contact backend team or check monitoring for:
- `labour-costs-assumptions` API error rate on 2026-03-25
- Connection pool exhaustion events
- SSO token issuance rate limits

---

## Additional Finding: agent-reporter Bug

`failure-summary.json` only captured **1 of 7 failures** (TC-LOS-ECT-007). The other 6 failures are missing from the structured diagnostics output. This is a separate bug in `src/utils/agent-reporter.ts` — may be overwriting instead of appending, or losing data on parallel spec completion.

**Recommendation:** Investigate agent-reporter in a separate plan.

---

## Fixes (DO NOT IMPLEMENT YET)

Fixes depend on which hypothesis is confirmed:
- **H1 confirmed:** Add `retries: 1` to local config (not just CI), consider health-check before navigation
- **H2 confirmed:** Switch to shared `storageState` auth (login once, reuse token) instead of per-spec SSO login
- **H3 confirmed:** Add navigation debouncing, increase timeout for first navigation, or add `page.waitForLoadState('networkidle')` after goto
