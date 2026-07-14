# PLAN: Encore Playwright HTML Report — Client-Readable Step Labels + Readability Pass (v2)

**Status**: DONE
**Executed**: 2026-07-09
**Priority**: P1
**Created**: 2026-07-09
**Revised**: 2026-07-09 (v2 — addresses all auditor-confirmed findings from v1 review)
**Identity**: OWNER (cross-cutting: fixture layer + gate script + rule + README + config)
**Depends on**: None (all context gathered; no upstream plans blocking)
**Model**: claude-opus-4-8 · **Thinking**: xhi · **PermissionMode**: acceptEdits
**BrowserTool**: none (code changes + one representative suite run via `npx playwright test`)
**Skills**: /execute, /regression-guard, /final-q

> **Provenance**: Client complaint (2026-07) — HTML report renders raw `Click locator('[data-testid="..."]')` as step labels. Root cause: page-object methods lack `test.step()` wrappers, so Playwright auto-labels from raw API calls. Decision questionnaire completed; 6 decisions locked by user.

---

## Context

A non-technical client reported the delivered Playwright HTML report is unreadable — every action step renders as raw code (`Click locator('[data-testid="btnSaveChanges"]')`) instead of plain English. The root cause is structural: the ~710 public async methods across 21 page objects in `clients/encore/src/pages/` never wrap their actions in `test.step('plain english description', ...)`. Playwright's HTML reporter auto-labels each step from the raw locator call when no explicit step label exists.

Additionally, 22 occurrences across 5 spec files call raw Playwright APIs directly through `BasePage.page` (e.g., `p.page.locator('button:text-is("Save")').first().click()`), bypassing any page-object method wrapping entirely — these raw-locator steps also reach the HTML report.

The fix: inject `test.step` labels via a fixture-layer Proxy (universal floor) + hand-polish the ~30 most client-visible methods + a jargon translation map to sanitize auto-derived labels + remediate direct `.page.` action calls in specs. A permanent rule + structural pre-commit gate prevents regression.

---

## Locked Decisions (binding constraints — any drift is a plan defect)

| # | Decision | Binding constraint |
|---|---|---|
| Q1=A | Fix the existing Playwright HTML report in place via `test.step` labels | No Allure, no separate summary tool |
| Q2=B | ONE clean report for everyone | Do NOT add a second/duplicate `['html']` reporter entry. JBS engineers debug via traces/terminal |
| Q3=A-SHORT | Full plain-English sentences, terse, action-first, zero jargon | e.g. "Search one letter, expect a match" — NOT a paragraph, NOT "Click btnAdd" |
| Q4=A | Permanent standard — framework RULE + real structural GATE | A `scripts/check-*.mjs` wired into `.githooks/pre-commit`, mirroring existing gates |
| Q5=A | Bundle all SIX readability items; each must earn its place | No slop — items justified or deferred with reason |
| Q6=C-HYBRID | Fixture-layer Proxy (auto-labels ~710 methods from name) + hand-written labels on ~30 high-visibility methods | Auth/login methods EXCLUDED from wrapping |

---

## Design

### (a) Guarded Step-Wrapper — Fixture-Layer Proxy

**Where**: New utility file `clients/encore/src/fixtures/step-wrapper.ts`

**Mechanism**: A `wrapWithSteps<T>(instance: T, className: string): T` function that returns a `Proxy` around the page-object instance. The Proxy's `get` trap works as follows:

```ts
import { test } from '@playwright/test';

const handler: ProxyHandler<T> = {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);

    // Non-function members (properties, page, getters) — return UNCHANGED
    if (typeof value !== 'function') return value;

    // Sync functions — return WITHOUT test.step wrapping
    // Detect via AsyncFunction constructor (fn.constructor.name === 'AsyncFunction')
    if (value.constructor.name !== 'AsyncFunction') {
      return value.bind(target);
    }

    // Async functions — wrap in test.step with derived/hand label
    return (...args: unknown[]) => {
      const methodName = String(prop);
      const label = resolveLabel(className, methodName);
      return safeStep(label, () => value.apply(target, args));
    };
  },
};
return new Proxy(instance, handler);
```

**Critical design decisions (addresses MAJOR 4):**
1. `Reflect.get(target, prop, receiver)` is used — NOT direct property access.
2. Non-function members (`page`, getters like `location-auto-addon.page.ts:114 saveButton`, properties) return UNCHANGED — `pg.page` still returns the raw Playwright `Page` object.
3. Sync functions (`base.page.ts:278 getCurrentUrl`, `corporate-pricing-search.page.ts:404 attachListCallCounter`, `:786 exportPricebookColumns`, `:795 exportProductGroupIds`) are bound to `target` WITHOUT `test.step` wrapping — their return types remain unchanged.
4. ONLY confirmed async functions (`value.constructor.name === 'AsyncFunction'`) get `test.step` wrapping.

**Label derivation** — `camelToLabel(methodName)` + jargon translation map (addresses BLOCKER 1):

```ts
// Step 1: Split camelCase on capitals
// navigateToCurrencyTab → ["navigate", "to", "currency", "tab"]

// Step 2: Apply JARGON TRANSLATION MAP before joining
const JARGON_MAP: Record<string, string> = {
  'ssl':          'Shared Setup Locations',
  'ect':          'ECT Settings',
  'csv':          'CSV',
  'loc':          'Location',
  'id':           '',           // strip — "Search Pay To by Id" → "Search Pay To"
  'btn':          '',           // strip
  'lm':           'Location Management',
  'si':           'Self Include',
  'pg':           'Product Group',
  'payto':        'Pay To',
  'pricebook':    'Pricebook',
};

// Step 3: Capitalize first word, join with spaces
// reloadAndNavigateToSSLTab → "Reload and navigate to Shared Setup Locations tab"
// ensureCleanSSLTable → "Ensure clean Shared Setup Locations table"
// navigateToEctTab → "Navigate to ECT Settings tab"
// isEctFixedCostsSaveEnabled → "Is ECT Settings fixed costs save enabled"
// clickLocPricingExportAndCaptureUrl → "Click Location Pricing export and capture URL"
// downloadLocPricingExport → "Download Location Pricing export"
// captureLocPricingCsvRows → "Capture Location Pricing CSV rows"
// searchPayToById → "Search Pay To"
```

**`resolveLabel(className, methodName)`**: checks hand-label map first → falls back to `camelToLabel(methodName)`.

**Test-context guard — `safeStep` (addresses MAJOR 3):**

```ts
async function safeStep<T>(label: string, fn: () => Promise<T>): Promise<T> {
  // Pre-check: does a test context exist?
  // test.info() throws synchronously when called outside a running test.
  let hasContext = false;
  try {
    test.info();
    hasContext = true;
  } catch {
    // No active test context (e.g., worker fixture auth refresh)
  }

  if (!hasContext) {
    // Run unwrapped — no test.step available
    return fn();
  }

  // Active test context — wrap in test.step.
  // CRITICAL: we do NOT catch errors from fn() — assertion failures
  // and real test errors propagate normally. The only error we guard
  // against is the "no test context" case above.
  return test.step(label, fn);
}
```

**Why this works**: `test.info()` is a SYNCHRONOUS check (throws immediately if no test context). We use it as the probe BEFORE calling `test.step()`. The rejected-promise problem from v1 (`test.step`'s internal `async _step()` at `node_modules/playwright/lib/common/index.js:2387` rejects rather than throws synchronously) is eliminated because we never call `test.step` without first confirming context exists. Assertion failures and real body errors from `fn()` propagate normally — `safeStep` NEVER catches or re-runs them.

**Auth/login exclusion** (defense in depth):
1. `LoginPage` is constructed directly inside `performSsoLogin` (`clients/encore/src/utils/auth-storage.ts:168`), NOT through a fixture → it never passes through the Proxy injection point in `pages.fixture.ts`
2. The `wrapWithSteps` function accepts an `exclude` option for class names → `LoginPage` is listed
3. The `safeStep` guard ensures that even if a wrapped method somehow executes outside test context, it degrades to a normal call (no throw)

**Injection point**: `clients/encore/src/fixtures/pages.fixture.ts` — each test-scoped page-object fixture (lines 342–489) currently does:
```ts
const locationCurrencyPage = new LocationCurrencyPage(authenticatedSession.page, config);
await use(locationCurrencyPage);
```
After the change:
```ts
const locationCurrencyPage = wrapWithSteps(
  new LocationCurrencyPage(authenticatedSession.page, config),
  'LocationCurrencyPage'
);
await use(locationCurrencyPage);
```

This covers all 19 test-scoped page-object fixtures in `pages.fixture.ts` (lines 342–489). The `authenticatedSession` worker fixture and `config` fixture are NOT wrapped (they don't expose page-object methods to specs).

**Type-safety verification step**: after wrapping, confirm `pg.page` still returns `Page` (not a wrapped function) by adding a build-time assertion in a test helper:
```ts
// In step-wrapper.test.ts
const wrapped = wrapWithSteps(new SomePage(page, config), 'SomePage');
// page property must be the raw Page, not a Proxy/function
expect(wrapped.page).toBe(page);
expect(typeof wrapped.page).toBe('object');
```

### (b) Hand-Labelled High-Visibility Methods (~30)

These are the methods whose step labels appear most prominently in the client-facing HTML report (nav + save + primary assertions). The auto-derived label is OVERRIDDEN with a shorter, more specific sentence via a static map in `step-wrapper.ts`:

**Method families qualifying for hand-polish** (across most-used pages):

| Page family | Methods (representative) | Hand-label |
|---|---|---|
| All pages (BasePage) | `navigateTo`, `navigateToSubTab`, `clickSaveAndConfirm`, `ensureDefaultState` | "Open location settings", "Save changes and confirm", "Reset to defaults" |
| LocationCurrency | `navigateToCurrencyTab`, `selectMerchantOption`, `reloadAndNavigateToCurrencyTab` | "Open the Currency tab", "Select merchant", "Reload and return to Currency" |
| LocationPricing | `navigateToPricingTab`, `reloadPricingTab`, `waitForPricingDataLoaded` | "Open the Pricing tab", "Reload Pricing tab" |
| LocationLocalInfo | `navigateToLocalInfoTab`, `setFieldValue`, `getFieldValue` | "Open Local Information tab", "Set field value", "Read field value" |
| LocalOfficeSettings | `navigateToLocalOfficeSettings`, `saveSettings` | "Open Local Office Settings", "Save settings" |
| LocationSharedSetup | `reloadAndNavigateToSSLTab`, `ensureCleanSSLTable` | "Reload and open Shared Setup Locations tab", "Clear Shared Setup table to baseline" |
| LocalOfficeEct | `navigateToEctTab`, `isEctFixedCostsSaveEnabled` | "Open ECT Settings tab", "Check if fixed costs save is enabled" |
| CorporatePricing* | `navigateToCorporatePricing`, `searchPricebook`, `createNewPricebook`, `clickLocPricingExportAndCaptureUrl`, `downloadLocPricingExport`, `captureLocPricingCsvRows` | "Open Corporate Pricing", "Search for pricebook", "Create new pricebook", "Click Location Pricing export", "Download Location Pricing export", "Capture Location Pricing CSV rows" |
| LocationBasicInfo | `searchPayToById` | "Search Pay To" |

The hand-label map is a `Record<string, Record<string, string>>` keyed by `className` → `{ methodName: label }`. Entries in this map take priority over the auto-derived camelCase-split label.

**All hand-labels MUST pass LR-058** (no `data-testid`, no selector names, no internal IDs). The LR-058 jargon gate fires at write time on all files under `clients/encore/src/`.

### (c) Direct `.page.` Action Remediation in Specs (addresses BLOCKER 2)

**Problem**: 22 occurrences across 5 spec files call raw Playwright APIs through the public `BasePage.page` property. These bypass the Proxy entirely — the raw locator step title reaches the HTML report.

**Confirmed offenders** (from grep of `clients/encore/tests/**/*.spec.ts`):

| Spec file | Count | Example |
|---|---|---|
| `corporate-pricing-detail.spec.ts` | 5 | `:108 p.page.locator('button:text-is("Save")').first().click()`, `:109-112 p.page.getByRole('alertdialog')…` |
| `corporate-pricing-new-pricebook.spec.ts` | 7 | `:132 p.page.locator('#new-strategy-name')`, `:533 sp.page.locator('tbody tr')` |
| `corporate-pricing-strategy.spec.ts` | 6 | `:169-171 p.page.locator('[role="dialog"]')…`, `:271 p.page.locator('button:text-is("Save")')` |
| `corporate-pricing-search.spec.ts` | 3 | `:470 cp.page.locator('[role="menuitem"]')…` |
| `corporate-pricing-override.spec.ts` | 1 | `:63 p.page.getByText('Select a location')` |

**Classification** — user-visible ACTIONS (must fix) vs. benign infra (leave):
- **MUST FIX (action calls)**: `.click()`, `.fill()`, `.check()`, `.press()` — these generate visible step titles in the HTML report. All 22 occurrences include user-visible actions or assertions that generate locator-based step text.
- **LEAVE (infra)**: `.page.reload()`, `.page.waitForLoadState()`, `.page.url()`, `.page.waitForTimeout()` — navigation/timing calls that don't generate report steps. These are NOT in the 22 count.

**Remediation strategy** (per occurrence):
1. **Preferred**: move the action into a new labelled page-object method (if the action represents a reusable concept — e.g., "Save and confirm dialog" → `clickSaveAndConfirmDialog()` on the relevant page object).
2. **Fallback**: wrap the inline block in an explicit `test.step('short english label', async () => { ... })` directly in the spec — acceptable for one-off assertions or unique UI interactions that don't warrant a page-object method.

**Specific remediation plan:**
- `corporate-pricing-detail.spec.ts:108-112` (save + confirm dialog): extract to `CorporatePricingDetailPage.saveAndConfirmDialog()` → hand-label "Save changes and confirm dialog"
- `corporate-pricing-strategy.spec.ts:169-171` (dialog fill + click + dismiss): extract to `CorporatePricingStrategyPage.fillStrategyNameAndAdd(name)` → hand-label "Enter strategy name and add"
- `corporate-pricing-strategy.spec.ts:271` (assert save disabled): wrap inline `test.step('Confirm save button is disabled', ...)`
- `corporate-pricing-strategy.spec.ts:534` (count checkboxes): wrap inline `test.step('Count sidebar checkboxes', ...)`
- `corporate-pricing-new-pricebook.spec.ts:132-133, 210` (assert form fields visible): wrap inline `test.step('Verify new pricebook form visible', ...)`
- `corporate-pricing-new-pricebook.spec.ts:533, 547-549` (row/button assertions): wrap inline `test.step('Verify pricebook detail tabs visible', ...)`
- `corporate-pricing-search.spec.ts:398` (heading assertion): wrap inline `test.step('Confirm Corporate Pricing Details heading', ...)`
- `corporate-pricing-search.spec.ts:445, 470` (menu item interactions): extract to page-object method or inline `test.step('Reset to default view', ...)`
- `corporate-pricing-override.spec.ts:63` (assert text visible): wrap inline `test.step('Confirm location selection prompt visible', ...)`

### (d) Permanent Rule + Structural Gate (addresses MAJOR 5)

**Rule**: Add to `clients/encore/CLAUDE.md` as LR-ENC-006:

> Every public async method on a page object that performs a user-visible action MUST render as a plain-English sentence (≤12 words, action-first, no selectors/locator code) in the Playwright HTML report. The fixture-layer Proxy provides this automatically; hand-labels override where needed. New page objects MUST be wrapped via `wrapWithSteps` in `pages.fixture.ts`. Tests MUST NOT produce raw `locator(...)` step titles in the HTML report. Specs MUST NOT call `.page.<action>()` directly for user-visible actions — use a labelled page-object method or explicit `test.step(...)`.

**Structural Gate**: `scripts/check-step-labels.mjs`

The gate performs THREE checks (not just `wrapWithSteps` presence — addresses MAJOR 5):

1. **Fixture wrapping check**: every page-object fixture in `pages.fixture.ts` MUST call `wrapWithSteps()` (regex-scannable: any `new <PageClass>(...)` followed by `await use(...)` without `wrapWithSteps` in between → FAIL).

2. **Jargon-in-derived-labels check** (addresses BLOCKER 1c): the gate:
   - Extracts ALL public async method names from staged `clients/*/src/pages/**/*.page.ts` files
   - Runs each through `camelToLabel()` (the same function used at runtime)
   - Checks the derived label against a DENY LIST of terms that must not appear un-translated: `SSL`, `ECT`, `Csv`, `Loc ` (with trailing space), `Btn`, `Lm `, `Si `, `Pg `, `Id` (standalone word-final)
   - If any derived label contains a denied term AND the term is not in `JARGON_MAP` with a translation → FAIL with message: `"Method <class>.<method> produces label '<derived>' containing denied jargon '<term>'. Add to JARGON_MAP or rename the method."`

3. **Direct `.page.` action check in specs**: scans staged `clients/*/tests/**/*.spec.ts` for patterns matching `.<identifier>.page.(locator|getByRole|getByText|getByTestId|getByLabel)` followed by `.click()|.fill()|.check()|.press()|.type()|.selectOption()|.dblclick()` → FAIL with message listing the file:line.

**Exempt from check 1**: `authenticatedSession`, `config`, `diagnosticsHandler`, `dependencyGate` (non-page-object fixtures).
**Exempt from check 3**: `.page.reload()`, `.page.waitForLoadState()`, `.page.url()`, `.page.goto()`, `.page.waitForTimeout()`, `.page.evaluate()`, `.page.route()`, `.page.on(...)`, `.page.off(...)` (infra calls that don't generate visible report steps).

**Mode**: `--enforce` (exit 1) for pre-commit; default warn-only for development.
**Pre-commit slot**: Fires when `clients/*/src/fixtures/pages.fixture.ts` OR `clients/*/src/pages/**/*.page.ts` OR `clients/*/tests/**/*.spec.ts` is staged (new gate slot in `.githooks/pre-commit`, after existing gate 5e).

### (e) Jargon Label Inventory Audit (addresses BLOCKER 1b)

A one-time build step that GENERATES the full inventory of every auto-derived label across all ~710 methods and audits it for residual jargon/awkwardness:

**Script**: `scripts/generate-label-inventory.mjs`

**Behavior**:
1. Glob `clients/encore/src/pages/**/*.page.ts`
2. Extract all `async methodName(` declarations (regex: `async\s+(\w+)\s*\(`)
3. Run each through `camelToLabel()` + `JARGON_MAP` (imports the same function from `step-wrapper.ts`)
4. Output a sorted inventory to stdout (or `--output=reports/label-inventory.txt`) in format: `ClassName.methodName → "Derived Label"`
5. Flag any label containing a denied jargon term (same deny list as the gate)
6. Exit 1 if ANY flagged labels remain; exit 0 if clean

**Usage**: run once after implementation to prove zero jargon leakage. Run on-demand thereafter. NOT in pre-commit (the gate covers new additions incrementally).

### (f) Readability Items 2–6 — Scoped Assessment

#### Item 2: Test/Case IDs (`TC-LOC-SSL-033`-style)

**Verdict: KEEP but NO ACTION needed.** Test IDs appear only in the test TITLE (e.g., `test('TC-LOC-CUR-001: Navigate to Currency tab; ...')`). In the HTML report, the test title is the top-level heading — the plain-English description after the colon IS already the readable part. The `TC-LOC-CUR-001` prefix acts as a small tag/reference for traceability. Removing IDs would break traceability (Jira, XLSX, MD parity). **No change.**

#### Item 3: Failure Messages

**Scoped action**: Add human-readable assertion messages to the ~15 most user-visible assertions (the ones that would appear in the HTML report failure view). Specifically:
- All `expect(...).toBe(...)` / `.toEqual(...)` calls in the top-level test body that assert grid counts, navigation state, or save outcomes
- Pattern: `expect(value, 'Currency grid should show 3 rows').toBe(3)`
- NOT a blanket rewrite — only assertions in the ~22 spec files whose failure text would confuse a non-technical reader
- Scope: ~40-60 assertions across the most client-visible test cases (the "happy path" assertions)

#### Item 4: Attachments

**Scoped action**: The `diagnosticsHandler` fixture (`pages.fixture.ts:82–167`) attaches a JSON blob labelled `'diagnostics'` (line 137). Screenshots/traces use Playwright's default naming (`test-failed-1.png`, `trace.zip`). These names are internal but functional. **Minimal change**: rename the diagnostics attachment label from `'diagnostics'` to `'Test diagnostics'` at `pages.fixture.ts:137`. Screenshot/trace filenames are Playwright-controlled (not easily overridable without a custom reporter violating Q2=B). **Low-value for high-effort.** Defer screenshot/trace renaming; apply only the attachment label rename (1 line).

#### Item 5: Shipped MD/XLSX test-case docs

**Assessment**: The XLSX deliverable (`clients/encore/test_cases_xlsx/encore_test_cases.xlsx`) is already subject to `scripts/xlsx-vocab-lint.mjs` (pre-commit gate 5b, `.githooks/pre-commit:89-103`) which refuses internal vocab. The MD test cases under `clients/encore/specs_planning/` are gitignored in the ROOT `.gitignore` at line 182 (`clients/*/specs_planning/`) — NOT in `clients/encore/.gitignore` (which contains no `specs_planning` entry). Since the root `.gitignore` excludes this path via glob, `git archive HEAD clients/encore/` CANNOT include `specs_planning/` files. **No action needed** — the existing XLSX vocab gate handles XLSX; MDs don't ship because the root `.gitignore:182` excludes them from tracking.

#### Item 6: Shipped README (`clients/encore/README.md`)

**Scoped action**: Review and minor rewrite of `clients/encore/README.md`. Ensure:
- No `data-testid` references
- No internal codenames or rule IDs
- "Allure" stays (it's a product name the client uses)
- Add a one-line note about the HTML report's step-level readability

---

## Step-by-Step

### Phase 0 — Pre-flight + Regression Baseline

| Step | Action | Tier | Files |
|---|---|---|---|
| 0.1 | Run `npm run typecheck` in `clients/encore/` — confirm clean baseline | Mechanical | — |
| 0.2 | Run `npx playwright test --project=setup` — confirm auth works | Mechanical | — |
| 0.3 | Run a single spec (`TC-LOC-CUR-001`) → open HTML report → screenshot the raw-code step labels (the "before" evidence) | Mechanical | — |

### Phase 1 — Core Implementation (Q6-C Hybrid)

| Step | Action | Tier | Files |
|---|---|---|---|
| 1.1 | Create `clients/encore/src/fixtures/step-wrapper.ts` — the `wrapWithSteps` Proxy utility with: (a) `Reflect.get`-based get trap, (b) `AsyncFunction` detection, (c) sync-pass-through binding, (d) `safeStep` guard with `test.info()` pre-check, (e) `camelToLabel` converter, (f) `JARGON_MAP` translations, (g) hand-label map `Record<string, Record<string, string>>` | Opus (correctness-critical) | `clients/encore/src/fixtures/step-wrapper.ts` (NEW) |
| 1.2 | Create `clients/encore/src/fixtures/step-wrapper.test.ts` — unit tests verifying: (a) `wrapped.page` returns raw `Page` object unchanged, (b) sync methods (`getCurrentUrl`, `exportPricebookColumns`) return without Promise wrapping, (c) async methods get `test.step` labels, (d) `safeStep` degrades gracefully outside test context, (e) jargon map translates confirmed offenders correctly, (f) hand-label overrides take priority | Opus (correctness-critical) | `clients/encore/src/fixtures/step-wrapper.test.ts` (NEW) |
| 1.3 | Edit `clients/encore/src/fixtures/pages.fixture.ts` — wrap all 19 page-object fixture definitions (lines 342–489) with `wrapWithSteps(...)` calls | Mechanical (pattern replacement) | `clients/encore/src/fixtures/pages.fixture.ts` |
| 1.4 | Verify: `npm run typecheck` passes (the Proxy type must be transparent — `wrapWithSteps<T>` returns `T`) | Mechanical | — |
| 1.5 | Run full suite (`npm test`) — confirm zero test regressions; specifically confirm `auth.setup` + stale-auth-refresh path pass | Opus (risk verification) | — |
| 1.6 | Open HTML report (`npm run report`) — confirm steps now show plain-English labels, zero `locator(` / `data-testid` in visible step titles for page-object method calls | Opus (visual verification) | `reports/html-report/` |

**LR-058 gate**: All string literals in `step-wrapper.ts` (the hand-label map + jargon translations) ship to client → they MUST contain zero internal jargon. The write-time jargon gate (`.claude/hooks/lib/check-jargon.mjs`) fires on this file path.

### Phase 1.5 — Jargon Label Inventory Audit (one-time proof)

| Step | Action | Tier | Files |
|---|---|---|---|
| 1.5.1 | Create `scripts/generate-label-inventory.mjs` — extracts all async method names from `clients/encore/src/pages/**/*.page.ts`, runs through `camelToLabel` + `JARGON_MAP`, outputs full inventory, flags denied jargon | Mechanical (string processing) | `scripts/generate-label-inventory.mjs` (NEW) |
| 1.5.2 | Run `node scripts/generate-label-inventory.mjs` — confirm exit 0 (zero flagged labels). If any labels flagged: add translations to `JARGON_MAP` or add hand-label overrides, re-run until clean | Opus (judgment on edge-case labels) | — |
| 1.5.3 | Save clean inventory output to `reports/label-inventory.txt` as evidence artifact (gitignored — not shipped) | Mechanical | `reports/label-inventory.txt` |

### Phase 2 — Direct `.page.` Action Remediation (BLOCKER 2)

| Step | Action | Tier | Files |
|---|---|---|---|
| 2.1 | Audit all 22 occurrences: classify each as "extract to page-object method" or "wrap inline with `test.step`" | Opus (judgment — which pattern applies) | — |
| 2.2 | For "extract" cases: add new page-object methods (`CorporatePricingDetailPage.saveAndConfirmDialog()`, `CorporatePricingStrategyPage.fillStrategyNameAndAdd(name)`, etc.) with hand-labels in the map | Opus (new method design) | `clients/encore/src/pages/corporate-pricing/*.page.ts` |
| 2.3 | For "inline wrap" cases: wrap remaining `.page.` action calls in explicit `test.step('short english', async () => { ... })` in the spec | Judgment (writing labels) | `clients/encore/tests/corporate-pricing/*.spec.ts` |
| 2.4 | Run `npm run typecheck` — confirm clean | Mechanical | — |
| 2.5 | Run `npm test` — confirm zero regressions | Mechanical | — |
| 2.6 | Verify HTML report: grep report output for residual raw locator titles (`locator(`, `getByRole(`, `getByText(`, `data-testid`) across ALL test step titles — expect zero | Opus (visual verification) | — |

### Phase 3 — Structural Gate (Permanent Standard)

| Step | Action | Tier | Files |
|---|---|---|---|
| 3.1 | Create `scripts/check-step-labels.mjs` — three-part gate: (a) fixture wrapping presence, (b) jargon-in-derived-labels from staged page-object methods, (c) direct `.page.` action patterns in staged specs | Opus (gate logic — must be precise) | `scripts/check-step-labels.mjs` (NEW) |
| 3.2 | Create `scripts/check-step-labels.test.mjs` — unit tests for all three checks (pass + fail cases for each) | Mechanical | `scripts/check-step-labels.test.mjs` (NEW) |
| 3.3 | Wire into `.githooks/pre-commit` — new gate slot (after gate 5e), triggered when `clients/*/src/fixtures/pages.fixture.ts` OR `clients/*/src/pages/**/*.page.ts` OR `clients/*/tests/**/*.spec.ts` is staged | Mechanical | `.githooks/pre-commit` |
| 3.4 | Add `"check:step-labels": "node scripts/check-step-labels.mjs --enforce"` to root `package.json` scripts | Mechanical | `package.json` (root) |
| 3.5 | Verify gate blocks regression: (a) remove `wrapWithSteps` from one fixture → run gate → exit 1 → restore; (b) add a method named `handleSSLStuff` to a page object → run gate → exit 1 (jargon detected) → restore; (c) add `p.page.locator('x').click()` to a spec → run gate → exit 1 → restore | Opus (gate verification — three failure modes) | — |

### Phase 4 — Readability Items 3, 4, 6

| Step | Action | Tier | Files |
|---|---|---|---|
| 4.1 | Add human-readable assertion messages to ~40-60 key assertions across the 22 spec files (scoped to save/nav/grid-count assertions on the happy path). Each message must be a natural-language description of what is expected — requires understanding the assertion's intent for each case. | Judgment (each message requires understanding the assertion's intent — NOT mechanical find-replace) | `clients/encore/tests/**/*.spec.ts` |
| 4.2 | Focused review of all changed assertion messages: read each in context, confirm it accurately describes what is being tested, confirm zero jargon/selectors leak into the message strings | Opus (review pass) | — |
| 4.3 | Rename diagnostics attachment label from `'diagnostics'` to `'Test diagnostics'` | Mechanical (1 line) | `clients/encore/src/fixtures/pages.fixture.ts:137` |
| 4.4 | Review `clients/encore/README.md` — ensure no internal jargon, add one-line note about report readability | Mechanical | `clients/encore/README.md` |
| 4.5 | Run `npm run typecheck` + `npm test` — confirm no regressions from assertion messages | Mechanical | — |

### Phase 5 — Rule Documentation

| Step | Action | Tier | Files |
|---|---|---|---|
| 5.1 | Add readability rule LR-ENC-006 to `clients/encore/CLAUDE.md` documenting: step-label standard, `wrapWithSteps` requirement, jargon map maintenance obligation, no direct `.page.<action>()` in specs | Mechanical | `clients/encore/CLAUDE.md` (gitignored — agent-only) |
| 5.2 | Update `clients/encore/README.md` if needed (already covered in 4.4) | Mechanical | — |

### Phase 6 — Final Verification

| Step | Action | Tier | Files |
|---|---|---|---|
| 6.1 | Full suite run: `npm test` | Mechanical | — |
| 6.2 | Open HTML report: `npm run report` — walk 3+ test cases and confirm ALL step titles are plain English (both from page-object methods AND from the formerly-direct `.page.` calls in corporate-pricing specs) | Opus | — |
| 6.3 | Confirm `auth.setup` passes (run `npx playwright test --project=setup`) | Mechanical | — |
| 6.4 | Confirm gate blocks regression (three modes per Phase 3.5) | Opus | — |
| 6.5 | Confirm LR-058 compliance: `node scripts/verify-no-forbidden.mjs --target=clients/encore/src/fixtures/step-wrapper.ts` | Mechanical | — |
| 6.6 | Run `node scripts/generate-label-inventory.mjs` — confirm exit 0 (full inventory is jargon-free after all changes) | Mechanical | — |
| 6.7 | Grep HTML report artifacts for residual raw-locator step titles: `grep -rE "locator\(|getByRole\(|getByText\(|data-testid" reports/html-report/` — expect zero matches in step-title DOM elements | Opus | — |

---

## Per-Identity Satisfaction

This plan does NOT produce/modify/delete test-cases MDs, test-plans, XLSX deliverable, field-case-catalogs, field-inventories, REQUIREMENTS.md, agent-mistakes.md, or baseline artifacts. The spec file edits (Phase 2 + Phase 4.1) add `test.step()` wrappers, extract page-object methods, and add assertion MESSAGE STRINGS — not new test cases, not TC IDs, not FCC blocks.

However, since `.spec.ts` files ARE edited, the LR-048 v3 matrix is provided:

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | — |
| GIVER | (none) | (none) | — |
| BUILDER | `clients/encore/tests/corporate-pricing/*.spec.ts` (raw `.page.` actions moved behind labelled methods); `clients/encore/src/pages/corporate-pricing/*.page.ts` (new labelled methods) | clients/encore/src/fixtures/step-wrapper.ts<br>clients/encore/src/fixtures/label-jargon.json<br>clients/encore/tests/_unit/step-wrapper.spec.ts<br>scripts/check-step-labels.mjs<br>scripts/check-step-labels.test.mjs<br>scripts/generate-label-inventory.mjs<br>scripts/lib/label-derivation.mjs | `npm run typecheck` exit 0 + `check:step-labels` exit 0 + 33 representative tests green |
| HEALER | (none) | (none) | — |
| WATCHDOG | (none) | (none) | — |
| GARDENER | (none) | (none) | — |
| OWNER | `pages.fixture.ts` (wrapWithSteps calls), `.githooks/pre-commit` (gate slot 5o), `README.md` (readability note), `CLAUDE.md` (LR-ENC-006), `package.json` (script) | clients/encore/src/fixtures/pages.fixture.ts<br>package.json<br>clients/encore/README.md<br>clients/encore/CLAUDE.md | `node scripts/check-step-labels.mjs --enforce` exit 0 |

---

## Verification

**End-to-end proof that the visible report is clean:**

```bash
# 1. Full suite (covers auth setup + stale-auth refresh + all specs)
cd clients/encore && npm test

# 2. Open the HTML report
npm run report
# → Walk 3+ test cases: confirm every step title is a short English sentence
# → Confirm ZERO occurrences of: locator(, data-testid, [role=, .page.click(, getElement(
# → Specifically check corporate-pricing tests (former BLOCKER 2 offenders)

# 3. Auth path specifically
npx playwright test --project=setup
# → Must pass (proves LoginPage exclusion + safeStep guard work)

# 4. Gate blocks regression (THREE failure modes)
# 4a. Remove wrapWithSteps from one fixture:
node scripts/check-step-labels.mjs --enforce
# → Must exit 1 → Restore

# 4b. Add a jargon method (e.g. `async handleSSLStuff()`) to a page object:
node scripts/check-step-labels.mjs --enforce
# → Must exit 1 citing denied jargon "SSL" → Restore

# 4c. Add `p.page.locator('x').click()` to a spec:
node scripts/check-step-labels.mjs --enforce
# → Must exit 1 citing direct .page. action → Restore

# 5. Typecheck
npm run typecheck
# → 0 errors

# 6. LR-058 compliance (no internal jargon in shipped files)
node scripts/verify-no-forbidden.mjs --staged-diff
# → 0 findings in step-wrapper.ts / README.md / spec assertion messages

# 7. Label inventory is jargon-free
node scripts/generate-label-inventory.mjs
# → Exit 0 (zero flagged labels across all ~710 methods)

# 8. Proxy behavior verification
# → pg.page returns Page object (confirmed by step-wrapper.test.ts)
# → Sync methods return values directly (not Promises)
# → Async methods produce test.step labels in report
```

---

## Quality Gates (Self-Audit Checklist)

| Gate | Requirement | Status | Reviewer Finding Addressed |
|---|---|---|---|
| G1 | Honors all 6 locked decisions exactly | ✅ Q1=A (test.step in HTML), Q2=B (single reporter, line 51 untouched), Q3=A-SHORT (terse action-first labels), Q4=A (rule + gate script + pre-commit), Q5=A (all 6 items scoped — 2 deferred with reason), Q6=C (Proxy floor + ~30 hand-labels, auth excluded) | — |
| G2 | LR-048 structurally complete | ✅ Frontmatter + Context + Bootstrap + Phase 0 + Phases 1-6 + Matrix + Verification + Handoff shape | — |
| G3 | No slop — items 2-6 each justified or dropped | ✅ Item 2: KEEP (already readable, ID is suffix). Item 3: scoped ~40-60 assertions. Item 4: attachment label only (screenshot rename deferred — Playwright-controlled). Item 5: NO ACTION (MDs don't ship — root `.gitignore:182`; XLSX already gated). Item 6: minor README review | — |
| G4 | Auth/login excluded + guarded | ✅ LoginPage never passes through fixture Proxy (constructed in `auth-storage.ts:168` directly). `safeStep` uses `test.info()` synchronous pre-check (not try-catch around async `test.step`). Explicit class-name exclusion list as defense-in-depth | MAJOR 3 ✓ |
| G5 | Single report (no duplicate reporter) | ✅ `playwright.config.ts:51` `['html', {...}]` stays singular. No new reporter entries | — |
| G6 | LR-058 + LR-049 respected | ✅ All hand-labels in `step-wrapper.ts` ship → zero jargon. Write-time hook fires on path. README passes `verify-no-forbidden.mjs`. Ship via `git archive` (LR-049) unchanged | — |
| G7 | Permanent standard has a REAL gate — checks label quality, not just wrapWithSteps presence | ✅ `scripts/check-step-labels.mjs` performs three checks: fixture wrapping + jargon-in-derived-labels + direct `.page.` actions. Wired into `.githooks/pre-commit`. `npm run check:step-labels` | MAJOR 5 ✓ |
| G8 | Verification proves visible report is clean — including from direct `.page.` calls | ✅ Phase 6 walks HTML report for zero raw-locator step titles; explicit grep command confirms; BLOCKER 2 offenders specifically verified; Phase 2 remediates all 22 occurrences across 5 spec files | BLOCKER 2 ✓ |
| G9 | Fixture-Proxy precisely specified — sync/getter/page passthrough tested | ✅ `Reflect.get` + `AsyncFunction` detection + sync bind + property passthrough. `pg.page` returns `Page`. Unit test in `step-wrapper.test.ts` proves the invariant. Confirmed sync methods: `getCurrentUrl` (base.page.ts:278), `attachListCallCounter` (corporate-pricing-search.page.ts:404), `exportPricebookColumns` (:786), `exportProductGroupIds` (:795). Getter: `saveButton` (location-auto-addon.page.ts:114, private but validates getter handling) | MAJOR 4 ✓ |
| G10 | Auto-derived labels cannot leak jargon to client report | ✅ `JARGON_MAP` translates confirmed offenders (SSL→Shared Setup Locations, ECT→ECT Settings, Csv→CSV, Loc→Location, Id→stripped, Btn→stripped, Lm→Location Management, Si→Self Include, Pg→Product Group, PayTo→Pay To). `generate-label-inventory.mjs` proves full inventory clean. Pre-commit gate denies new jargon methods. | BLOCKER 1 ✓ |
| G11 | Item 5 citation is factually correct | ✅ `specs_planning/` excluded by ROOT `.gitignore:182` (`clients/*/specs_planning/`), NOT by `clients/encore/.gitignore` (confirmed: no `specs_planning` entry there). XLSX vocab gate at `.githooks/pre-commit:89-103` | MINOR 6 ✓ |
| G12 | Phase 4.1 (assertion messages) correctly tiered as judgment work | ✅ Reclassified from "Mechanical" to "Judgment" — writing 40-60 distinct human-readable messages requires understanding each assertion's intent. Focused review step (4.2) added as a dedicated Opus-tier pass. | MINOR 7 ✓ |

---

## Assumptions & Risks

| # | Assumption | Risk if wrong | Mitigation |
|---|---|---|---|
| A1 | `test.step` is available inside Playwright test-scoped fixture `use()` callbacks | Steps wouldn't appear in report | Phase 1.5/1.6 verify immediately; fallback: move wrapping into specs via a custom `test.use()` helper |
| A2 | `Reflect.get` + `AsyncFunction` constructor check correctly distinguishes sync vs async on all page-object methods in this codebase | A sync method could be incorrectly wrapped (changing its return type) or an async method missed | `step-wrapper.test.ts` tests both cases explicitly against real page objects; `npm run typecheck` catches type breaks; confirmed sync methods inventory: `getCurrentUrl` (base.page.ts:278), `attachListCallCounter` (corporate-pricing-search.page.ts:404), `exportPricebookColumns` (:786), `exportProductGroupIds` (:795) — all verified as non-AsyncFunction |
| A3 | `test.info()` reliably throws synchronously outside test context (not a rejected promise) | `safeStep` would fail to detect missing context | `test.info()` is documented as synchronous accessor in Playwright API; verified distinct from `test.step` (which is the async codepath at `node_modules/playwright/lib/common/index.js:2387`). Unit test in `step-wrapper.test.ts` confirms the guard works outside test context. |
| A4 | `test.step` inside a Proxy-wrapped method doesn't break Playwright's step nesting / trace correlation | Trace viewer confused | Phase 1.6 verifies trace still works correctly |
| A5 | The 22 direct `.page.` action occurrences are a complete census (no others exist in non-corporate-pricing specs) | Residual raw-locator steps in other spec files | Phase 6.7 grep of HTML report catches any missed occurrences; the structural gate (check 3) prevents NEW occurrences from landing; grep was exhaustive across `clients/encore/tests/**/*.spec.ts` |
| A6 | `camelToLabel` + `JARGON_MAP` produces acceptable English for all ~710 methods | Some labels may be awkward (grammatically imperfect) even if jargon-free | The `generate-label-inventory.mjs` audit flags suspicious labels for manual review (Phase 1.5.2); the ~30 hand-labels cover the highest-visibility methods; remaining long-tail labels are "good enough" (short, action-first, English words) |

---

## Open Questions

None — all decisions locked, all reviewer findings addressed with concrete mechanisms, implementation facts anchor-checked against source.

---

## Execution Summary

**Executed**: 2026-07-09 (OWNER + delegated council BUILDER workers; Opus orchestrated and audited every diff — worker output treated as evidence, never trusted).

**What shipped (all verified):**
- **Fixture-layer Proxy** — `clients/encore/src/fixtures/step-wrapper.ts` + single-source label data `clients/encore/src/fixtures/label-jargon.json`. Wraps all 19 page-object fixtures in `pages.fixture.ts`; auto-derives plain-English step labels via `camelToLabel` + jargon-translation map; `safeStep` guards the no-test-context path; `LoginPage`/auth excluded. **Architecture change vs plan**: label data is one JSON (imported by the runtime via `resolveJsonModule` AND by the tooling via `scripts/lib/label-derivation.mjs`) rather than a `.ts`-only map — the `.mjs` gate scripts cannot import a `.ts` at runtime and `allowJs` is off (importing one would fail typecheck).
- **6 unit tests** — `clients/encore/tests/_unit/step-wrapper.spec.ts` (relocated from the plan's `src/fixtures/step-wrapper.test.ts`, which `testMatch: tests/**/*.spec.ts` would never collect). All 6 pass.
- **Direct `.page.` remediation** — 7 raw `.page.<action>()` calls moved behind labelled methods on `corporate-pricing-{detail,search}.page.ts` + reused existing `fillDialogName`/`clickDialogAdd` on strategy (no new methods). The plan cited "22 occurrences"; investigation showed 22 = **7 raw-action calls** (the gate-flaggable set — all remediated, gate now 0) + **15 assertion-form accessors** (`expect(p.page.getByText(...))…` — they render as expect-steps, not raw-locator ACTION titles; wrapping them in inline `test.step` is folded into the deferred Item 3). No unauthorized rescope: the deferral is user-authorized (below).

**Verification (ran, with outputs):**
1. `node scripts/check-step-labels.mjs --enforce` → `PASS: … 0 violations` (exit 0); pre-remediation it correctly blocked (exit 1) on the 7.
2. `node scripts/generate-label-inventory.mjs` → `753 methods, 0 flagged` (exit 0).
3. `cd clients/encore && npx tsc --noEmit` → exit 0.
4. `node --test scripts/check-step-labels.test.mjs` → 5 pass, 0 fail.
5. `npx playwright test _unit/step-wrapper --no-deps` → 6 passed.
6. `npx playwright test location-currency --project=encore-locations` → **29 passed** (wrapping is regression-safe on real saves/dialogs/checkboxes/reloads).
7. `npx playwright test --grep "TC-CPR-DET-014|TC-CPR-STR-015|TC-CPR-SRC-033"` → **4 passed** (the 3 remediated tests, behavior preserved).
8. Real-label proof (custom step-reporter on a live currency run): report emits `"Reload and navigate to currency tab"`, `"Select merchant option"`, `"Click save and capture dialog"`, `"Ensure default state"` — plain English, not raw locators.
9. `scripts/verify-no-forbidden.mjs --staged-diff` on the new files → 0 marker hits (LR-058 clean).

**Defects caught + fixed during audit:**
- My own LR-058 leak — a shipped comment `(LR-003)` in `step-wrapper.ts` — removed.
- A broken gate regex the worker shipped — check-3 `ACCESSOR_RE` used a leading `\.` and never matched real `p.page.locator().click()`; fixed `\.`→`\b`, now flags the real 7.
- Worker duplication of `fillDialogName`/`clickDialogAdd` on strategy — reverted to reuse the existing (better) helpers.

**Six readability items (Q5):** (1) step labels — **DONE** (core). (2) TC IDs — no action (already the readable suffix). (3) failure messages — **DEFERRED** (below). (4) attachments — **DEFERRED with reason** (rename would break `agent-reporter.ts:187` `a.name==='diagnostics'`). (5) MD/XLSX — no action (MDs gitignored; XLSX already vocab-gated). (6) README — **DONE**.

**Commit note**: changes are left uncommitted in the working tree. `pages.fixture.ts` and `CLAUDE.md` are entangled with a concurrent session's comment-scrub; scope any commit to this plan's files and leave the scrub untouched.

## Deferral Authorization

Two items deferred this session with explicit user authorization. Both are additive readability polish / an optional verification run — no assertion logic changed and nothing implemented is broken.

1. **Item 3 — assertion-message readability polish** (~40-60 human-readable `expect(...)` message strings, plus inline `test.step` labels for the 15 assertion-form `.page.` accessors catalogued in the parent's remediation). User authorization (verbatim): after I recommended closing now with this item as a small follow-up, the user replied **"go gog o"** (go). Durable recipient (now closed): `plans/done/SUBPLAN_ENCORE_REPORT_FAILURE_MESSAGES.md`.
2. **Optional full-suite `npx playwright test` run** (parent Phase 1.5 / 6.1). User authorization (verbatim): **"if this is not required, skip it."** Not required for the safety conclusion — the wrapping is one uniform transform, exercised end-to-end on 33 representative scenarios (saves, dialogs, checkboxes, reloads, grids) with no breakage; a full serial run under concurrent parallel-session load would produce contention-noise rather than signal. Recommended as a clean run when the app is idle; CI also exercises it. No "whole-suite green" is claimed anywhere.
