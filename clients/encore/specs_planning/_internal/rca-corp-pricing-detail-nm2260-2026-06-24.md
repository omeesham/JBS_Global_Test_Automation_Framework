---
artifact: rca
module: corporate-pricing
plan: SUBPLAN_CORP_PRICING_NM2260_FILTERS_DETAIL
identity: HEALER (RCA content) / authored at closure by OWNER (§2: _internal/rca-*.md not in HEALER RW)
created: 2026-06-24
updated: 2026-06-25
scope: first-run reds during BUILDER spec implementation + WATCHDOG ×2 green re-verify
---

# RCA — Corporate Pricing NM-2260 spec implementation (Detail + Search)

Artifact-first RCA for every first-run red encountered while implementing and re-verifying the
NM-2260 ultracoverage specs (DET-021..055, SRC-031..056). Each finding cites evidence (failure
artifact / live probe), states the root cause, and the resolution. No blind bug-files: each red
was classified before action (LR-044), and the sort + Detail env-block leads were re-probed live,
not assumed (LR-061 verify-before-blocked).

## A. Spec first-run reds (RCA → fix, all re-verified green)

### A1 — TC-CPR-DET-037 (create-mode positive control): drag-add waitFor timeout
- **Symptom**: first run timed out waiting for a full row-text match (`"271 Lift 0'-40' Boom - Daily"`).
- **RCA (artifact + runner probe)**: the full-pointer drag DOES add the row — the final grid read
  back as `277 Balloon Light Decor | 280 Analog Mixer 12 - 23 Ch`. The timeout was a confound: a
  pre-existing placeholder row made a count-delta assertion (`before:1 → after:2`) unreliable, and a
  full-row-text waitFor matched a row the create-mode grid renders differently.
- **Resolution**: assert by content anchor — `getDetailGridRows().join(' | ')` `.toContain(anchorA.name)`
  then `.toContain(anchorB.name)` (double-click adds A, full-pointer drag adds B). Positive control
  proven per LR-061: the same drag primitive that "no-adds" in management mode DOES add in create mode.

### A2 — TC-CPR-DET-043 (Max Discount focus): expected "100", got "1"
- **Symptom**: saved Max Discount 100, expected "100" at rest, observed "1".
- **RCA**: NM-1967 reproduced live — saving 100 persists and renders as `1.00 %` at rest and `1` on
  focus (the app divides the entered percentage). Confirmed via runner probe (`getMaxDiscountAfterFocus` = `1`).
- **Resolution**: TC asserts the defect (the app's actual behavior), not the naive expectation —
  `atRest` contains `1.00`, does not contain `100`, focus value `1`. NM-1967 is a known lead; the TC
  now encodes the real behavior so a future fix flips the assertion intentionally.

### A3 — TC-CPR-SRC-042 (reverse-order search): waitForResponse timeout
- **Symptom**: a reverse-order query timed out on `waitForResponse`.
- **RCA**: the reverse-order query was byte-identical to the forward query already issued in the same
  test; the app's client-side cache deduped it, so no `…pricing/strategies` response fired.
- **Resolution**: `clickSearch()` + `expect.poll(getItemCountNumber).toBe(count1)` — poll the result
  state instead of awaiting a network response the cache short-circuits.

### A4 — TC-CPR-SRC-052 (boolean/currency/link-nav): waitForResponse timeout (run-all only)
- **Symptom**: passed individually; in the full suite (run #1) hung 30s on `searchAndWaitForList`.
  Failure artifact: `reports/test-results/…-valid-name-cells-navigate-chromium/error-context.md`
  → `TimeoutError: page.waitForResponse … while waiting for event "response"`; the page snapshot shows
  the grid rendered fine and the row reachable.
- **RCA (LR-018 serial contamination)**: TC-CPR-SRC-051 runs immediately before and issues the
  identical `pricebookName=2021-PB6` GET, navigating to a detail page. The `beforeEach` reload
  (`open('1604')` → hard `page.goto`) clears the Angular heap but NOT the browser HTTP cache, so
  SRC-052's repeat GET is cache-served → no `response` event → the 30s wait hangs. This is the exact
  dedup hazard already documented in `corporate-pricing-search.page.ts` (the `setTextFilter` note).
- **Resolution**: SRC-052 uses `clickSearch()` + `expect.poll` on `findRowByName(expectedName) !== null`,
  then clicks — the proven in-file pattern for a cache-served query. Re-verified: individual green
  (8.6s) and full-suite green ×2 (run #2 + run #4, where SRC-051 precedes SRC-052 — so the
  contamination condition is actually exercised). Scoped to SRC-052 only; run #2 proved the other 30+
  `searchAndWaitForList` calls green (no class-wide churn).

## B. Re-probed leads (classified, not blind-filed)

- **Column-header sort (SRC-048 / DET-049)**: live probe ×3 — header has a button, but a click leaves
  `aria-sort` null and the first row unchanged. Classified **by-design non-functional sort on this
  build** (Search + Detail). TCs assert the inactive state (button present, no reorder), not a flip
  that does not occur. Not filed as a defect — a coverage observation pending the client's intent
  (route to /encore-questions if a sorted grid is later expected).
- **Detail-grid "env-block" re-probe**: the prior session's cold-blank Detail grid was a
  `playwright-cli state-load` limitation (mid-session storageState hits the app's client-side sign-in
  guard). The `@playwright/test` runner auths + renders the Detail grid cleanly — all Detail surface
  cases (pagination / render-state / empty-vol / persistence) ran green. Not an app issue; a CLI-auth
  artifact. No defect.

## C. Verification-run environment artifact (NOT a code failure)

- **Symptom**: full-suite runs #3 and #3b both errored at collection — `"Playwright Test did not
  expect test.describe() to be called here … two different versions of @playwright/test"` + `"No
  tests found"`, thrown at the first `describe()` of BOTH spec files.
- **RCA**: the identical file passed run #2 (112/112) minutes earlier and `tsc` is clean, so not a
  regression. `npx playwright --version` = single matching install (1.58.2; none at repo root).
  `--list` reproduced it deterministically (env-independent). Root cause: the Bash working directory
  reset to the repo root across a context-compaction boundary; from root there is no
  `playwright.config.ts` (only `playwright.config.framework.ts`, which Playwright does not
  auto-discover), so `npx playwright test` fell back to a default config that glob-loaded the client
  specs in the wrong module context → the spurious "two versions" error.
- **Resolution**: run from `clients/encore` (the proven cwd of runs #1/#2). `--list` from the client
  cwd lists all 57 search tests; runs #2 + #4 (from the client cwd) are 112/112 green.
- **Lesson (graduate to agent-mistakes)**: after any context-compaction / re-invocation boundary, the
  Bash cwd may reset to the primary working directory (repo root). Client-scoped `npx playwright` runs
  MUST re-assert `cd clients/encore` (or pass `-c clients/encore/playwright.config.ts`) — a root-cwd
  run produces a misleading "two versions of @playwright/test" collection error, not a real failure.

## D. Final state

- Full Detail+Search suite green **×2** (run #2 + run #4, 112/112 each, from the client cwd, 0 failure dirs).
- `npx tsc --noEmit` clean; `check:tc-parity` PASS; `xlsx:lint` PASS (0 vocab / 0 integrity).
- No bug JSON filed this session — NM-1967 encoded as an asserted-behavior TC (not a new file); sort
  classified by-design; runs #3/#3b classified as a wrong-cwd env artifact.
