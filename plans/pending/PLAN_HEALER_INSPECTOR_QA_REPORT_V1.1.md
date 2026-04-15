# Healer Inspector & QA Report System — Final Logic Plan v1.2

> **Branched from:** `PLAN_BUG_HUNTING_RULEBOOK_V2.md`
> **Relationship:** Extends the bug hunting rulebook with healer-specific inspector logic, QA report generation, and confirmation workflow.

**Status**: PENDING (READY FOR DEV)
**Scope:** Healer agent only. Self-contained HTML report as CI/git artifact. No website deployment, no server required.
**Delivery format:** `REPORT.html` (primary, self-contained) + `REPORT_SUMMARY.md` (text contexts) + `metadata.json` + filtered artifact copies.
**Phase:** A (this document). B/D roadmap at end.

---

## 1. Core Principle

When a test fails, the healer does exactly two things in sequence and must complete both before acting:

**Step 1 — Classify:** Determine why the failure happened and whether it was intentional or a genuine break.

**Step 2 — Act:** Either heal (if high-confidence intentional change) or generate a report and stop, waiting for a human QA decision before doing anything else.

**The single most important constraint in this system:** The healer NEVER takes a destructive or corrective action on a failure it classified as a bug or could not confidently classify as an intentional change. Report generation and waiting are the only allowed actions for those cases. Existing auto-heal rules are suspended for all non-CHANGE classifications.

---

## 2. Mode 1 — Inspector Phase

### 2.1 Required Inputs

Every input below must be collected before classification begins. If any critical input is missing, the failure routes directly to `NEEDS_HUMAN_TRIAGE`.

| Input | What it tells the inspector |
|---|---|
| Test result (pass/fail/flaky) | Baseline: is this a new failure or recurring? |
| Error message + stack trace | Type of failure |
| Failing selector(s) | What element was expected |
| Page URL at point of failure | Where in the app the failure occurred |
| Screenshot at failure moment | Visual proof of state |
| Playwright trace file | Full execution record |
| Network events (all calls, not just failures) | Used for Oracle persistence-failure detection |
| Console output (errors/warnings within ±3s of failure) | Were there JS errors around the failure? |
| Git diff context (files changed in last 24h touching the failing file) | Was there a recent deployment? |
| Last 5 run results for this specific test | Is this a regression or a new failure? |
| Page Object file for the failing selector | What was this element supposed to be? |

**On the ±3 second console window:** The failure timestamp comes from the test runner event. Console events come from the Playwright browser listener. Both are in Playwright's own event system. Filter console events to those whose timestamp falls within [failure_timestamp − 3000ms, failure_timestamp + 3000ms]. Events outside this window go to Layer 5 only.

**On last-5-run history:** Stored per test ID in `failure-history.json`, keyed by the test's unique ID (spec file path + test name + hash — see Section 10 on hash handling). Schema per entry:

```json
{
  "testId": "string",
  "lastResult": "pass|fail|flaky",
  "lastPassedAt": "ISO timestamp",
  "lastFailedAt": "ISO timestamp",
  "runResults": ["pass", "pass", "pass", "fail", "pass"]
}
```

### 2.2 Root Cause Classification

The inspector classifies the failure into exactly ONE category before doing anything else. All categories map directly to existing `BugHuntCategory` and `FailureCategory` enums — no new categories.

```
FAILURE
  │
  ├─ Is selector missing from DOM entirely?
  │   ├─ YES → Check git diff
  │   │    ├─ Recent commit removed this selector
  │   │    │    → BugHuntCategory: FEATURE_CHANGED / FailureCategory: SELECTOR
  │   │    ├─ data-testid present in source code but not rendering
  │   │    │    → BugHuntCategory: UNCHANGED_FAILURE / FailureCategory: APPLICATION
  │   │    └─ No recent change, no code trace
  │   │         → BugHuntCategory: TESTID_MISSING / FailureCategory: SELECTOR
  │   │
  │   └─ NO → Does trace show: write call (POST/PUT/PATCH) returned 2xx
  │        │   → page.goto() or page.reload() → assertion on persisted state fails?
  │        ├─ YES → BugHuntCategory: UNCHANGED_FAILURE / FailureCategory: DATA
  │        │         (silent persistence failure — element present, save appeared to succeed)
  │        │
  │        └─ NO → Element present but interaction fails?
  │             ├─ YES → Intermittent or timing-related?
  │             │    ├─ YES → BugHuntCategory: FLAKE / FailureCategory: TIMING
  │             │    └─ NO  → BugHuntCategory: UNCHANGED_FAILURE / FailureCategory: APPLICATION
  │             └─ NO → Navigation or URL failure?
  │                  ├─ YES → BugHuntCategory: UNCHANGED_FAILURE / FailureCategory: NETWORK
  │                  └─ NO → Data or API failure?
  │                       ├─ YES → BugHuntCategory: UNCHANGED_FAILURE / FailureCategory: DATA
  │                       └─ NO  → BugHuntCategory: UNCHANGED_FAILURE / FailureCategory: UNKNOWN
  │                                 → Force NEEDS_HUMAN_TRIAGE
```

**Special case — data-testid missing on an Encore-owned page:** Classify as `TESTID_MISSING`. Do NOT attempt to work around it. File as a bug for the Encore team. The healer must not heal this — it is a product defect.

### 2.3 Oracle Scoring — Change vs Breakage

After root cause classification, run the Oracle. Every signal that fires adds to the CHANGE or BUG score.

| Signal | Weight | Direction |
|---|---|---|
| All write calls (POST/PUT/PATCH) returned 2xx but assertion on persisted state fails after page.goto() or page.reload() | +3 | BUG — silent persistence failure |
| 2 or more tests fail with the same FailureCategory on the same URL path pattern in this run | +2 | BUG — correlated app-level failure, not a selector change |
| Git commit in last 24h touches the failing selector's source file | +3 | CHANGE |
| That commit message contains "refactor", "rename", "redesign", "update UI", "cleanup" | +2 | CHANGE |
| Same failure appears in more than 3 tests simultaneously in this run | +2 | CHANGE (feature moved) |
| Failure is isolated to exactly ONE test | +2 | BUG |
| Network returned 4xx or 5xx at point of failure | +3 | BUG |
| Console shows unhandled JS error within ±3s of failure | +2 | BUG |
| Test passed in all last 5 runs (zero failure history for this test) | +3 | BUG |
| Test has flaky history (more than 2 intermittent results in last 5 runs) | +3 | FLAKY |
| data-testid missing on Encore-owned page | +3 | TESTID_BUG |

**On detecting persistence failures:** The pattern is: a write call (POST/PUT/PATCH) completes with 2xx → `page.goto()` or `page.reload()` occurs → an assertion fails on an element's checked/value/text state. The Oracle reads the Playwright trace to identify this sequence — it is not inferred from the error message alone.

**On correlated multi-test failures:** Two tests (e.g. PRI-020 and PRI-025) failing with the same `FailureCategory: DATA` on the same URL path pattern scores +2 BUG. This is a correlated app-level failure, not a feature-moved CHANGE. The plan's original ">3 tests = CHANGE" signal remains, but 2+ with the same category and URL is explicitly a BUG indicator.

**Scoring rules:**

- CHANGE total exceeds BUG total by 3 or more → `INTENTIONAL_CHANGE`
- BUG total exceeds CHANGE total (any margin) → `BUG_CANDIDATE`
- FLAKY signals dominate → `FLAKY_CANDIDATE`
- Tied, or either total below 3 → `NEEDS_HUMAN_TRIAGE`

**Confidence calculation:**

| Score gap | Confidence |
|---|---|
| 6 or more | HIGH |
| 3 to 5 | MEDIUM |
| 0 to 2 | LOW |

### 2.4 Confidence Gate — The Critical Routing Rule

```
If classification = INTENTIONAL_CHANGE AND confidence = HIGH
  → Route to Mode 2A (Heal)

Everything else (all other classifications, or any confidence below HIGH)
  → Route to Mode 2B (Report + Wait)
```

Any doubt = report and wait for the human. Even a probable INTENTIONAL_CHANGE with MEDIUM confidence goes to Report + Wait.

---

## 3. Mode 2A — Heal Path

**Entry condition:** Classification = `INTENTIONAL_CHANGE` AND confidence = `HIGH`. Existing auto-heal behavior is active on this path only. For all other classifications, existing auto-heal rules are suspended.

**Steps:**

1. Locate the failing selector in the current DOM
2. **Check whether the selector actually changed** — compare the failing selector string to what is currently in the DOM at that location. If the element is present with the **same testid and same selector string**, the selector has NOT changed. The element exists and is interactable but has wrong state. This is an app-level bug, not a selector change. Immediately downgrade to `BUG_CANDIDATE` and switch to Mode 2B. Do NOT update the Page Object.
3. If a genuinely different selector is found (testid changed, element renamed): update the Page Object file with the new selector
4. Log the healing action to `healer-activity.log` with: test ID, old selector, new selector, page object file + line, triggering commit SHA
5. Generate `HEAL_SUMMARY.md` (not a full bug report — see Section 8.4)
6. If the selector is NOT found in the DOM at all: downgrade to `BUG_CANDIDATE`, switch immediately to Mode 2B

**Why step 2 matters:** A persistence bug (element present in DOM with correct testid, wrong state after reload) will cause Mode 2A to "find" the element, perform a no-op Page Object update with the same selector, declare success, and loop identically on the next run. Step 2 explicitly breaks this loop.

---

## 4. Mode 2B — Report Path

**Entry condition:** Any classification that is not (INTENTIONAL_CHANGE + HIGH confidence).

**The healer generates the report and then STOPS.** No healing, no skipping, no further action until QA provides a decision via `metadata.json`.

---

## 5. Report Format — Self-Contained HTML

**The primary report is `REPORT.html`.** It is a single self-contained HTML file with no external dependencies. All CSS is inline. All images are embedded as base64. It opens directly from the filesystem (`file://` protocol), from a CI artifact download, or from a git-hosted path. No server, no build step, no deployment.

This is NOT a markdown file viewed in GitHub. It is a rich visual QA tool that happens to be portable as a file.

**Why HTML over markdown for the primary report:**
- Markdown requires the reader to mentally parse formatting — HTML renders it immediately
- Layered evidence (show/hide toggles) requires JavaScript — markdown can't do this
- Screenshot viewing, severity-coded headers, evidence cards, and Oracle scorecards are all visual elements that markdown handles badly
- QA testers using Allure and Playwright HTML reports are already comfortable with browser-based reports — this speaks their language

**`REPORT_SUMMARY.md` still exists** as a secondary output for contexts where plain text is needed: GitHub PR comments, Slack notifications, email. It is 15–20 lines max. It is not the primary report.

---

## 6. HTML Report Design Specification

### 6.1 Overall Structure

```
┌──────────────────────────────────────────────────────────────┐
│  SEVERITY HEADER BAR (full width, color-coded)               │
│  [CRITICAL] BUG-PRC-025 · Pricing > Toggles                  │
│  Corporate Pricing uncheck does not persist after save       │
├──────────────────────────────────────────────────────────────┤
│  STATUS STRIP: [PENDING CONFIRMATION]  [Classification: BUG] │
│  [Confidence: HIGH]  [Module: Pricing]  [When: 2026-04-01]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐  ┌─────────────────────────────────┐ │
│  │  QUICK FACTS       │  │  ORACLE VERDICT                 │ │
│  │  (left card)       │  │  (right card)                   │ │
│  └────────────────────┘  └─────────────────────────────────┘ │
│                                                              │
│  STEPS TO REPLICATE (full width, numbered, highlighted)      │
│                                                              │
│  ┌────────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │  SCREENSHOT    │ │  NETWORK      │ │  CONSOLE ERRORS   │  │
│  │  (expandable)  │ │  (filtered)   │ │  (±3s window)     │  │
│  └────────────────┘ └───────────────┘ └───────────────────┘  │
│                                                              │
│  [+ SHOW FULL ARTIFACTS]  ← collapsed toggle                │
│                                                              │
│  ══════════════════════════════════════════════════════════  │
│  QA DECISION PANEL (always visible, prominent)               │
│  Instructions + metadata.json path + copy-path button        │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Severity Header Bar

Full-width bar at the top, color-coded:

| Severity | Header background | Text |
|---|---|---|
| CRITICAL | `#C0392B` (deep red) | White |
| HIGH | `#E67E22` (orange) | White |
| MEDIUM | `#F39C12` (amber) | Dark |
| LOW | `#7F8C8D` (gray) | White |

Content in the header bar:
- Left: `[SEVERITY BADGE]  BUG-{MOD}-{NNN}  ·  Module > SubModule`
- Center: Title (what broke, on what page)
- Right: Status badge (`PENDING CONFIRMATION` / `CONFIRMED BUG` / `HEALED`)

### 6.3 Quick Facts Card

Two-column card layout. Left column field names, right column values. Compact, scannable.

| Field | Value |
|---|---|
| What failed | Plain English: "Checkbox state did not persist after save and reload" |
| Where | Clickable URL (opens in new tab) |
| When | Human timestamp: "Today at 14:32 · Pipeline #447" |
| Last passed | "2 days ago" (derived from lastPassedAt) |
| Regression | Colored badge: `YES — REGRESSION` (red) / `NEW FAILURE` (orange) / `RECURRING` (gray) |
| Failing selector | Monospace code block |
| Environment | "Staging · Chromium · 1920×1080" |
| Branch | "main · abc1234" |

### 6.4 Oracle Verdict Card

Visual scorecard — not a text dump. Shows which signals fired and which did not.

```
ORACLE VERDICT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUG signals                         CHANGE signals
────────────────────                ─────────────────────
✓ Persistence failure  +3           ✓ Git commit touched  +3
✓ 2 tests same pattern +2           ✗ Keyword in commit   +0
✗ Network 4xx/5xx      +0           ✗ Feature moved >3    +0
✗ Console JS error     +0
✗ Isolated to 1 test   +0
✗ Passed last 5 runs   +0
                     ────                              ────
BUG TOTAL:            5             CHANGE TOTAL:       3

Decision: BUG score exceeds CHANGE score by 2 → BUG_CANDIDATE
Confidence: MEDIUM (gap 0–5)
[Phase A signals only — git-diff depth and run-history signals added in Phase B]
```

Visual treatment:
- Fired signals (✓) are shown in normal text
- Unfired signals (✗) are grayed out but still listed — QA can see what was checked
- Score totals are bolded
- The decision line is highlighted
- Confidence badge is colored (GREEN = HIGH, AMBER = MEDIUM, RED = LOW)

### 6.5 Steps to Replicate

Full-width section. Numbered list with visual treatment:

```
PRECONDITIONS
  User role:   [Pricing Admin]
  Data state:  [Location with pricing configured]
  Environment: [https://staging.example.com]

STEPS

  1  Navigate to staging.example.com and log in as Pricing Admin
  2  From the left navigation, click Locations
  3  Select any location with pricing configured
  4  Click the Settings tab
  5  Click the Pricing sub-tab
  6  In the pricing grid, locate the Corporate Pricing toggle row
  7  Uncheck the Corporate Pricing checkbox
  8  Click Save

  ┌─────────────────────────────────────────────────────────┐
  │ ⚠  STEP 9 — FAILURE POINT                              │
  │  Reload the page and verify Corporate Pricing remains   │
  │  unchecked                                              │
  │  Expected: Checkbox is unchecked, change persisted      │
  │  Actual:   Checkbox is checked — uncheck did not save   │
  └─────────────────────────────────────────────────────────┘

NOTES
  Reproducibility: Consistent (3 of 3 manual runs)
  Also failing:    PRI-020 with identical symptom on same page
```

Design:
- Steps 1–8 are plain numbered rows, light background
- Step N (failure point) is a visually distinct highlighted box — amber/red border, heavier typography
- Preconditions are a subtle card above the steps
- Notes at bottom in muted text

### 6.6 Evidence Cards (three-panel row)

Three cards displayed side by side (or stacked on narrow viewports):

**Card 1 — Screenshot**

- Shows the failure screenshot at native resolution, clipped to fit card
- Click to open full-size in a lightbox (pure CSS/JS, no external lib)
- Caption: "At step N — element [selector] shows wrong state"
- In Phase A: raw screenshot. Phase C adds: bounding box annotation overlay.

**Card 2 — Network Evidence**

For normal failures (4xx/5xx): table of failed requests only.

For persistence failures (all 2xx, data didn't stick): special treatment:

```
Network: All calls returned 2xx
Failure is in data persistence, not network layer.

Last write before reload:
  PATCH /api/locations/{id}/pricing · 200 OK · 1.2s
  Request:  {"corporatePricing": false, "includeServiceFee": true}
  Response: {"success": true, "updatedAt": "2026-04-01T14:32:09Z"}

The save appeared to succeed. The checkbox reverted after reload.
Check the response body above — look for partial updates, silent
validation errors, or any field not matching what was sent.
```

This panel is NEVER empty when there is a persistence failure. The 200 OK write call's request/response is always shown with a clear explanation.

**Card 3 — Console Errors**

Only errors/warnings within ±3s of the failure. Each entry shows:
- Colored level badge (red = ERROR, amber = WARN)
- Relative timestamp ("1.8s before failure")
- Message text

If empty: panel shows "No console errors in ±3s window" — not hidden, explicitly empty so QA knows it was checked.

### 6.7 Full Artifacts Section (collapsed by default)

Collapsed behind a toggle button: `[+ Show full artifacts]`

When expanded:

```
FULL ARTIFACTS

  Playwright Trace     [Open in trace viewer →]   artifacts/trace.zip
  Video Recording      [Download .webm]           artifacts/video.webm
  Full Console Log     [Download .txt]            artifacts/console-full.txt
  Full Network HAR     [Download .har]            artifacts/network-full.har
  All Screenshots      [Browse folder]            artifacts/
  Stack Trace          [Expand ▼]
    TimeoutError: expect(locator).not.toBeChecked()...
    (full stack trace in expandable block)
```

All links are relative paths — they work when the HTML file and the artifacts/ folder are co-located. No absolute paths.

### 6.8 QA Decision Panel (always visible, bottom of page)

Prominent, never collapsible. This is the call-to-action for the QA tester.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QA ACTION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current status: PENDING CONFIRMATION

After reviewing this report, edit metadata.json:

  File: reports/bugs/BUG-PRC-025/metadata.json   [Copy path]

  Set "qaDecision" to one of:
  ┌──────────────────────────────────────────────────────────────┐
  │  "confirm_bug"    → Real bug. Test will be skipped.          │
  │  "false_positive" → Not a bug. Healer will attempt fix.      │
  │  "defer"          → Not reviewed yet. Re-queued next run.    │
  └──────────────────────────────────────────────────────────────┘

  [Copy confirm_bug snippet]   [Copy false_positive snippet]
```

The "Copy" buttons use the Clipboard API to copy a pre-filled metadata.json snippet:

```json
{
  "qaDecision": "confirm_bug"
}
```

QA can paste this directly into their editor. One click → open file → paste → save.

### 6.9 Print Stylesheet

`@media print` CSS ensures Layers 1–4 print cleanly:
- Severity header: prints in grayscale if color printing not available
- Oracle card: prints with ✓/✗ symbols intact
- Steps: prints with FAILURE POINT box clearly visible
- Full Artifacts section: does NOT print (hidden via print CSS)
- QA Decision panel: prints with the metadata.json path shown (so physical copy still has the action)

### 6.10 Technical Requirements for REPORT.html

- Single file — no external CSS, JS libraries, fonts, or images
- All images embedded as base64 within the HTML
- All CSS in a `<style>` block within the `<head>`
- All JavaScript inline in `<script>` blocks — used only for: Layer 5 toggle, lightbox for screenshot, clipboard copy buttons, print media rules
- Maximum file size target: 2MB (enforced by limiting base64 screenshot to the failure-moment screenshot only; video is a link, not embedded)
- Works via `file://` protocol — no `fetch()`, no `XMLHttpRequest`, no absolute URLs
- Works in Chrome, Firefox, Safari — no IE/Edge legacy support required
- Responsive: renders on 1280px+ screens at full fidelity; degrades gracefully on narrower viewports (cards stack vertically)
- Dark mode: respects `prefers-color-scheme: dark` via CSS variables

---

## 7. QA Confirmation Flow

### 7.1 The Confirmation Mechanism

For Phase A (git/CI artifact level), the mechanism is file-based. This is the single canonical mechanism.

After reviewing `REPORT.html`, the QA tester edits one field in `metadata.json`:

```json
{
  "qaDecision": "pending"
}
```

QA changes `"pending"` to one of:

| Value | Meaning | What happens next |
|---|---|---|
| `"confirm_bug"` | This is a real bug | Test is skipped with bug ID; entry written to blocked-tests.json |
| `"false_positive"` | Not a bug | Heal path is triggered; report archived |
| `"defer"` | Not reviewed yet | No action; age timestamp updated; re-queued on next healer run |

The QA Decision panel in REPORT.html provides the path to the file and clipboard snippets to minimize friction.

### 7.2 Confirmation State Machine

```
PENDING_CONFIRMATION (set at report generation)
    │
    ├─ qaDecision = "confirm_bug" → CONFIRMED_BUG
    │     Action: add test.skip('bug-blocked: BUG-{ID}') annotation
    │     Action: append entry to blocked-tests.json
    │     Stop
    │
    ├─ qaDecision = "false_positive" → CONFIRMED_FALSE_POSITIVE
    │     Action: trigger Mode 2A heal path
    │     Action: update metadata.json status
    │     Stop
    │
    └─ qaDecision = "defer" → INVESTIGATE_LATER
          Action: update age timestamp
          Action: re-queue for next healer invocation
          Stop
```

### 7.3 Healer Polling — When Does It Check?

The healer checks all pending reports at the START of every healer invocation, before processing any new failures:

1. Scan all `reports/bugs/*/metadata.json`
2. For each with `qaDecision = "confirm_bug"` and `status = PENDING_CONFIRMATION`: execute confirm logic
3. For each with `qaDecision = "false_positive"` and `status = PENDING_CONFIRMATION`: execute false-positive logic
4. For each with `qaDecision = "defer"`: update age timestamp only
5. Then proceed to inspect new failures

---

## 8. File Output Specification

### 8.1 Directory Structure Per Bug

```
reports/bugs/BUG-{MOD}-{NNN}/
  ├── REPORT.html            ← Primary report (rich self-contained UI, opens in browser)
  ├── REPORT_SUMMARY.md      ← Text summary for PR comments, Slack, email (15–20 lines max)
  ├── metadata.json          ← Machine-readable state, Oracle data, qaDecision field
  └── artifacts/
      ├── screenshot-failure.png   ← File copy from test-results (never symlink)
      ├── console-errors.txt       ← Filtered: errors/warnings within ±3s only
      ├── network-failures.json    ← Filtered: 4xx/5xx/timeout + persistence-failure write calls
      ├── trace.zip                ← File copy from test-results
      ├── video.webm               ← File copy from test-results (if captured)
      ├── console-full.txt         ← Full console output, all levels
      └── network-full.har         ← Full network log, all requests
```

**On artifact handling:** Always file copy, never symlink. Symlinks break on Windows CI and become stale after `test-results/` is cleaned. Copy at report generation time so the report package is permanently self-contained.

### 8.2 metadata.json Schema

All fields are optional at the interface level (`?`). Fields the healer cannot populate are omitted rather than set to null, except for `lastPassedAt` and `lastFailedAt` where null has a meaningful state (no history).

```json
{
  "bugId": "BUG-PRC-025",
  "title": "[Pricing > Toggles] Corporate Pricing uncheck does not persist after save",
  "module": "Pricing",
  "subModule": "Toggles",
  "severity": "HIGH",
  "classification": "BUG_CANDIDATE",
  "bugHuntCategory": "UNCHANGED_FAILURE",
  "failureCategory": "DATA",
  "confidence": "MEDIUM",
  "status": "PENDING_CONFIRMATION",
  "qaDecision": "pending",
  "persistenceFailure": true,
  "correlatedTests": ["PRI-020"],
  "createdAt": "2026-04-01T14:32:11Z",
  "lastReviewedAt": null,
  "testId": "tests/specs/pricing/location-pricing.spec.ts > PRI-025",
  "specFile": "tests/specs/pricing/location-pricing.spec.ts",
  "failingSelector": "[data-testid='corporate-pricing-checkbox']",
  "pageUrl": "https://staging.example.com/app/locations/123/settings/pricing",
  "environment": "staging",
  "browser": "chromium",
  "viewport": "1920x1080",
  "branchName": "main",
  "commitSha": "abc1234",
  "lastPassedAt": "2026-03-30T09:15:00Z",
  "lastFailedAt": null,
  "regressionFlag": true,
  "runHistory": ["pass", "pass", "pass", "pass", "pass"],
  "oracleScoring": {
    "changeScore": 3,
    "bugScore": 5,
    "confidence": "MEDIUM",
    "phaseNote": "Phase A signals only. Git-diff depth and run-history correlation signals added in Phase B.",
    "signals": [
      { "signal": "persistenceFailure2xx", "weight": 3, "direction": "BUG", "fired": true },
      { "signal": "correlatedTestsSamePattern", "weight": 2, "direction": "BUG", "fired": true },
      { "signal": "networkError4xx5xx", "weight": 3, "direction": "BUG", "fired": false },
      { "signal": "consoleJsError", "weight": 2, "direction": "BUG", "fired": false },
      { "signal": "isolatedToOneTest", "weight": 2, "direction": "BUG", "fired": false },
      { "signal": "passedLastFiveRuns", "weight": 3, "direction": "BUG", "fired": false },
      { "signal": "gitCommitTouchingFile", "weight": 3, "direction": "CHANGE", "fired": true },
      { "signal": "commitMessageKeyword", "weight": 2, "direction": "CHANGE", "fired": false },
      { "signal": "featureMovedSimultaneous", "weight": 2, "direction": "CHANGE", "fired": false }
    ]
  },
  "lastWriteCall": {
    "method": "PATCH",
    "url": "/api/locations/123/settings/pricing",
    "status": 200,
    "responseTimeMs": 847,
    "requestSummary": "{\"corporatePricing\": false, \"includeServiceFee\": true}",
    "responseSummary": "{\"success\": true, \"updatedAt\": \"2026-04-01T14:32:09Z\"}"
  },
  "networkFailures": [],
  "consoleErrors": [],
  "stackTrace": "...",
  "screenshotPath": "artifacts/screenshot-failure.png",
  "tracePath": "artifacts/trace.zip",
  "videoPath": "artifacts/video.webm",
  "stepsToReproduce": [
    "Navigate to staging and log in as Pricing Admin",
    "From the left navigation, click Locations",
    "Select any location with pricing configured",
    "Click the Settings tab",
    "Click the Pricing sub-tab",
    "In the pricing grid, locate the Corporate Pricing row",
    "Uncheck the Corporate Pricing checkbox",
    "Click Save",
    "Reload the page and verify Corporate Pricing remains unchecked — FAILURE POINT"
  ],
  "preconditions": {
    "userRole": "Pricing Admin",
    "dataState": "Location with Corporate Pricing currently enabled",
    "environment": "staging"
  },
  "expectedBehavior": "Corporate Pricing checkbox remains unchecked after save and reload",
  "actualBehavior": "Checkbox reverts to checked after reload — save appeared to succeed (200 OK) but change was not persisted"
}
```

### 8.3 REPORT_SUMMARY.md Format (text-only secondary output)

```markdown
## BUG-PRC-025 | HIGH | Pricing > Toggles

**What broke:** Corporate Pricing uncheck does not persist after save and reload
**Where:** `/app/locations/{id}/settings/pricing` — staging
**When:** 2026-04-01 14:32 UTC · Branch: main · Commit: abc1234
**Last passed:** 2026-03-30 (5 consecutive passes) — REGRESSION

**Why we think it's a bug (confidence: MEDIUM):**
Save returned 200 OK but the uncheck reverted after reload.
Same symptom also seen in PRI-020 on the same page.

**Steps to replicate (from app):**
1. Log in as Pricing Admin → Locations → Settings → Pricing
2. Uncheck Corporate Pricing → Save
3. Reload the page → checkbox reverted → FAILURE

**Evidence:** Screenshot · Network: 200 OK (persistence failure) · Console: 0 errors
**Full report:** `reports/bugs/BUG-PRC-025/REPORT.html`
**Also failing:** PRI-020 with identical symptom

---
*Status: Pending QA confirmation. Edit metadata.json: confirm_bug | false_positive | defer*
```

### 8.4 HEAL_SUMMARY.md Format (Mode 2A output only)

```markdown
## Heal Summary — {timestamp}

- Test: `{spec file} > {test name}`
- Old selector: `{old}`
- New selector: `{new}` (found in current DOM, testid changed)
- Page Object updated: `{file path}` line {N}
- Trigger: Git commit `{sha}` — {commit message summary}
- Status: HEALED — test should pass on next run
```

---

## 9. test.skip and Recovery Lifecycle

### 9.1 When QA Confirms a Bug

The healer does three things in sequence:

1. Adds `test.skip('bug-blocked: BUG-{MOD}-{NNN}')` annotation to the failing test
2. Updates `metadata.json` → `status: "CONFIRMED_BUG"`
3. Appends entry to `reports/bugs/blocked-tests.json`:

```json
[
  {
    "bugId": "BUG-PRC-025",
    "testId": "tests/specs/pricing/location-pricing.spec.ts > PRI-025",
    "specFile": "tests/specs/pricing/location-pricing.spec.ts",
    "blockedAt": "2026-04-01T14:45:00Z",
    "status": "blocked"
  }
]
```

### 9.2 Recovery — Removing the Skip

The healer checks `blocked-tests.json` at the start of every invocation, before inspecting new failures.

For each entry with `status: "blocked"`:

1. Read the corresponding `metadata.json`
2. If `qaDecision` has been updated to `"resolved"` by QA (indicating they believe the fix was deployed):
   - Run the test in isolation
   - If PASSES: remove `test.skip()`, update `blocked-tests.json` to `status: "verified"`, update `metadata.json` to `status: "VERIFIED_FIXED"`
   - If STILL FAILS: keep the skip; add re-check timestamp to `metadata.json`; notify QA that fix is incomplete

**QA must actively set `qaDecision = "resolved"`** in `metadata.json` when they believe a fix was deployed. The skip is a deliberate hold, not a timeout.

---

## 10. Hash Function and History Migration

**New hash function (v2):** `hash(testId + failingSelector + pageUrlPath)` — URL path only, stripping query params and dynamic ID segments.

**Transition strategy (dual-hash lookup):**

1. Compute v2 hash → check `failure-history.json` → if found, use it
2. If not found → compute v1 hash → check → if found, migrate entry to v2 key and proceed
3. If neither found → new failure, no history

Applies to ALL history lookups. On-demand migration, no batch step required.

---

## 11. INDEX Files

`reports/bugs/INDEX.md` and `reports/bugs/INDEX.json` are fully regenerated by scanning all `reports/bugs/*/metadata.json` on every report create/update. Never appended.

`INDEX.md`:

```markdown
# Bug Report Index

Last updated: {timestamp}

| Bug ID | Title | Module | Severity | Classification | Status | Date | Confidence |
|---|---|---|---|---|---|---|---|
| BUG-PRC-025 | Corporate Pricing uncheck does not persist | Pricing | HIGH | BUG_CANDIDATE | PENDING | 2026-04-01 | MEDIUM |
```

`INDEX.json`: array of metadata objects for programmatic consumption.

**On git storage:** Store `reports/` as a CI artifact rather than a committed directory if working with concurrent PRs. For local/single-user setups, committing is fine.

---

## 12. Integration With Existing Report Systems

**Allure:** Write a plaintext attachment to the Allure result: `Bug report: BUG-{MOD}-{NNN} — see reports/bugs/BUG-{MOD}-{NNN}/REPORT.html`.

**Playwright HTML Report:** Write a plaintext attachment: `Bug report: BUG-{MOD}-{NNN} — see reports/bugs/BUG-{MOD}-{NNN}/REPORT.html`.

The healer report is the QA-human triage view. Allure and Playwright HTML are the test-runner execution views.

---

## 13. What the Healer Must NOT Do

- Must NOT heal a selector when classification is `BUG_CANDIDATE`, `NEEDS_HUMAN_TRIAGE`, `FLAKY_CANDIDATE`, or `TESTID_BUG` — existing auto-heal rules are suspended for all non-CHANGE paths
- Must NOT update a Page Object file when the failing selector is already present in the DOM with the same testid — same element in wrong state is an app bug, not a selector change; updating with the same value is a no-op that masks the bug and causes an infinite heal loop
- Must NOT auto-submit to Jira or any external system — export file only; human triggers submission
- Must NOT include full console logs in REPORT.html — filtered errors within ±3s only
- Must NOT include full HAR inline in REPORT.html — failed requests panel only (plus persistence-failure write call when relevant)
- Must NOT replace Allure or Playwright HTML reporters — augment only
- Must NOT heal a missing data-testid on Encore-owned pages — file TESTID_BUG and stop
- Must NOT apply `test.skip` without QA having set `qaDecision = "confirm_bug"` in metadata.json
- Must NOT use symlinks for artifact copying — file copies only
- Must NOT append to INDEX.md — always regenerate from full scan

---

## 14. Acceptance Criteria

| # | Criterion |
|---|---|
| AC-1 | Inspector runs and completes classification before any heal or report action |
| AC-2 | Oracle scoring, all evaluated signals (fired and unfired), and Phase A qualifier appear in every REPORT.html |
| AC-3 | Steps to Replicate represent the full browser journey from login, not test code method names |
| AC-4 | Layers 1–4 visible on page load, no JS required for them |
| AC-5 | Layer 5 (full artifacts) collapsed behind toggle, JS-powered |
| AC-6 | Network panel shows 4xx/5xx/timeout requests AND last write call's response body for persistence failures |
| AC-7 | Console panel shows only errors/warnings within ±3s of failure; panel explicitly shows "0 errors in window" if empty |
| AC-8 | Module and SubModule appear in every report |
| AC-9 | QA sets `qaDecision` in metadata.json before `test.skip` is applied — no auto-skip |
| AC-10 | Recovery loop checks blocked-tests.json on every healer invocation before inspecting new failures |
| AC-11 | Heal path produces HEAL_SUMMARY.md only — not a full bug report |
| AC-12 | REPORT.html is a self-contained file that opens via `file://` with no external dependencies |
| AC-13 | INDEX.md and INDEX.json are fully regenerated from scan on every report creation or update |
| AC-14 | Artifacts are file copies, not symlinks |
| AC-15 | Bug ID NNN counter derived by scanning existing directories — no hard-coded counter, no race condition |
| AC-16 | Only `INTENTIONAL_CHANGE` + `HIGH` confidence routes to Mode 2A heal; everything else routes to Mode 2B |
| AC-17 | Confidence label in every report includes "Phase A signals only" qualifier |
| AC-18 | Hash migration uses dual-lookup (v2 then v1 fallback) for all history reads |
| AC-19 | Mode 2A checks that the found selector differs from the failing selector before updating the Page Object — same testid in DOM triggers immediate BUG_CANDIDATE downgrade, not a no-op update |
| AC-20 | Persistence failure Oracle signal fires when trace shows 2xx write → reload → state assertion fail |

---

## 15. Phase Roadmap

### Phase A — This Plan

Self-contained `REPORT.html` + `REPORT_SUMMARY.md` + `metadata.json` + filtered artifact copies. Manual confirmation via `metadata.json` edit. Full classification, Oracle scoring, and recovery lifecycle.

### Phase B — Extended Oracle

- Git-diff depth signals (actual diff content, not just file-touch)
- Simultaneous-failure cross-run analysis
- Enriched run-history correlation
- Remove "Phase A signals only" qualifier once live

### Phase C — Screenshot Annotation

- Bounding box overlay on failure screenshot showing where the failing element was expected
- Works for missing-element bugs; for persistence bugs, highlights the element in wrong state
- Implemented via canvas or CSS overlay — does not modify the original PNG

### Phase D — Integrations

- Jira export JSON (generated on confirm, never auto-submitted)
- Allure custom label injection (`allure.label('bugId', ...)`)
- Website TriagePanel wire-up
- Chat-based confirmation as an alternative UX

---

*End of Plan v1.2*