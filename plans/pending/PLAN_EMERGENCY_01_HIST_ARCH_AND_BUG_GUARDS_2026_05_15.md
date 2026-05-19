> SESSION BOOTSTRAP — Just invoke with `/execute plans/pending/PLAN_EMERGENCY_01_HIST_ARCH_AND_BUG_GUARDS_2026_05_15.md`. All context below.
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load /identity OWNER.
> 2. **Skills**: this plan drives shell + edit operations; no skill auto-calls beyond /identity.
> 3. **Model + thinking + permission-mode**: Sonnet `hi` / `auto` per frontmatter.
> 4. **Dependency gate**: no upstream dependencies.
> 5. **Context load**: read this plan in full before any edit.
> 5.5. **Browser tool**: `BrowserTool: none` — agent only edits source code + runs CLI scripts; Playwright runner opens browsers internally, that is not a tool choice.
> 6. **Phase 0**: re-confirm the audit evidence below is still current (read failure-summary.json snapshot if needed); HALT if conditions have changed.
> 7. **Execute phases per Rollout Sequence**. Stop on any phase that fails verification.
> 8. **Handoff**: append activity-log row per LR-028; flip Status to DONE; git mv to plans/done/; npm run plans:reindex.
>
> **HALT + ASK USER** if:
> - Any CI guard rejects a callsite the user did not authorize for migration
> - History architecture (Fix 1) discovers a history spec the audit missed — flag, do not silently extend scope
> - Timeout migration hits a literal where no `TIMEOUTS.*` bucket fits — flag, do not guess
> - Full suite run after fixes still has >1 hard failure other than the deferred ECT-014 class

---

# PLAN: EMERGENCY #1 — History Test Architecture + Bug Class Guards

**Status**: PENDING
**Priority**: P0 — EMERGENCY #1
**Created**: 2026-05-15
**Identity**: OWNER
**Depends on**: Nothing
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none
**Repo Path**: `plans/pending/PLAN_EMERGENCY_01_HIST_ARCH_AND_BUG_GUARDS_2026_05_15.md`

---

## Why this plan exists (the problems we are solving)

A 325-test suite run produced 4 hard failures. A skeptical adversarial audit by 4 parallel Sonnet auditor agents (each tasked with FALSIFYING, not confirming) revealed:

| TC | Original Sonnet RCA | Audit verdict |
|---|---|---|
| ECT-014 | "App redirects to `/auth/sign-in` on session expiry" | **WRONG**. Actual failure: Next.js "Application error: client-side exception" crash page on retry, URL stays on `base_url`. The proposed `/auth/sign-in` URL check is inert for this failure mode. |
| NTS-031 | "Playwright `fill()` drops `\n` for Angular FormControl" | **CORRECT**. JUnit log + History DOM prove fill() produced an empty Angular model on multiline payload. |
| LGL-001 | "API failures cause 5s timeout" | **PARTIAL**. Mechanism right (5s timeout, table renders late). Cause wrong (`Failed to fetch` errors fired ~208s AFTER the timeout — they're effect, not cause). Real cause: skeleton-first table render exceeds 5s. Fix incomplete: 4 other 5s timeouts in same file untouched. |
| MGH-008 | "App only stores changed fields in history" | **WRONG**. Active is populated in row 0 while Country/Currency are empty — falsifies the "changed fields" theory. The proposed "remove Country from expectations" fix HIDES the real bug. The bug reproduces under workers=1, so concurrency was a red herring. **Real defect: the spec reads "row 0" written by some OTHER spec, not by itself.** |

**These 4 incidents are symptoms of 3 architectural problem classes** (the 4th — ECT-014 — is an app-side defect the framework cannot fully fix). Each class will continue producing flakes until the class itself is killed.

---

## Problem class definitions

### Class A (PRIMARY): History tests read non-deterministic state
**Symptom**: TC-LOC-MGH-008.
**Pattern**: A test reads `row 0` of a history table and asserts on its cell values, **without first writing that row itself**. The values depend on whichever spec last touched the underlying record. Different saves write different field subsets (proven by DOM evidence: row 0 has Active populated but Country/Currency empty; row 1 — 4 seconds older — has all three populated). This is non-deterministic even with `workers=1`.

**Blast radius** (per Explore agent inventory):
- `location-management-history.spec.ts:99, 122, 138, 154` — 4 row-0 reads in TC-008, 009, 010, 011.
- Any future history spec that follows the same anti-pattern.

### Class B: Hardcoded short timeouts in page objects
**Symptom**: TC-LOC-LGL-001.
**Pattern**: Page objects use raw `timeout: N_000` literals. Tables render with a skeleton-first pattern that occasionally exceeds 5s. The `Failed to fetch` errors blamed by the original RCA fired AFTER the timeout (~208 seconds after test start, vs 5s timeout) — they're teardown noise, not the cause. The real cause is render delay.

**Blast radius** (per Explore agent inventory):
- **79 hardcoded timeout literals** across 12 page-object files.
- 45 at `5_000`, 12 at `5_000` underscore variant, 13 at `15_000`, 5 at `10_000`, 6 at 30s+.
- Same file `location-legal.page.ts` had 6 such literals; only 2 fixed so far (lines 50, 59); 4 still raw (158, 162, 171, 192).

### Class C: Playwright `fill()` silently drops multi-line text in Angular textareas
**Symptom**: TC-LOC-NTS-031.
**Pattern**: `textarea.fill('line1\nline2\nline3')` produces an empty Angular `FormControl.value` for some bindings. The save then persists an empty string, History row shows empty Notes. The framework has a workaround (`pasteIntoNote` — native `HTMLTextAreaElement.prototype.value` setter + dispatched `input`/`change` events) but it lives in ONE page object, not a framework-wide helper. Any new textarea added in the future will hit the same trap.

**Blast radius** (per Explore agent inventory):
- 2 textarea callsites currently use `.fill(` directly:
  - `clients/encore/src/pages/setup/locations/location-notes.page.ts:64` (vulnerable, multiline payload bug already proven)
  - `clients/encore/src/pages/setup/locations/location-form-helpers.page.ts:137` (generic — may be a textarea)
- No framework-wide safe textarea helper exists.

### Class D (DEFERRED): Auth/session crash on retry
**Symptom**: TC-LOS-ECT-014.
**Pattern**: NextAuth `/api/auth/session` network-aborts mid-run → app APIs cascade 500s → on Playwright retry the app renders a Next.js "Application error" client-side exception crash page. The URL stays on `base_url`, so URL-based detection misses it.

**User decision**: SKIP for this plan. Quote: *"its not our fault the app logs us out.. we will see that later."* This is an app-side defect; framework will not absorb the complexity of mid-test session heartbeat infra. File a bug against the app team with the network-failure timing evidence.

---

## Decisions captured from user

- **Q1 (Class A — history)**: B + hard rule. Every history TC is self-contained: capture timestamp at start → edit a field at its source page → save → navigate to history → find THIS test's row via `getRowsSinceTimestamp(sinceMs)` → assert on the row this test produced. **CI guard physically blocks** `getRowValues(0)` / `getColumnByHeader(0, …)` / `getColumnByIndex(0, …)` in any history spec. User's words: *"if its the automation script writing the name, why would it forget? it has to be a rule."*
- **Q2 (Class B — timeouts)**: A. Full migration of all 79 raw timeout literals to named `TIMEOUTS.*` constants. CI guard blocks new `timeout: N_000` literals in `src/pages/**`.
- **Q3 (Class D — auth)**: SKIP. Deferred to app team.
- **Implicit Q4 (Class C — textarea)**: Same architectural pattern — promote `pasteIntoNote`'s mechanism to a framework-wide `BasePage.fillTextareaSafe`; migrate the 2 callsites; CI guard blocks `.fill(` on textarea locators.

---

## What stays as-is (already correct, do NOT revert)

- `clients/encore/src/pages/setup/locations/location-legal.page.ts:50, 59` — these correctly bumped 2 of the 6 timeouts; Fix 2 finishes the file
- `clients/encore/src/pages/setup/locations/location-notes.page.ts:55-67` — the `\n` branch in `fillNote` works; Fix 3 generalizes it (branch becomes redundant once `fillTextareaSafe` is universal)
- `clients/encore/tests/infra/auth-storage.ts:65, 80` — `/auth/sign-in` URL check; user said *"leave it"* (cheap, inert today, may catch a related future scenario)

## What gets reverted

- `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts:108` — restore `'Country' ||` in the `toBeTruthy` guard temporarily, then remove the entire guard once TC-008 is split into per-field self-contained TCs.
- `clients/encore/tests/test-data/setup/locations/location-management-history.data.ts` — restore `'Country': 'United States'` in `ROW_1_EXPECTED`. Will be redesigned per Fix 1 as a per-field map.

---

## FIX 1 (PRIMARY) — History Test Self-Containment (kills Class A)

### Why this approach is defendable

Three alternatives were evaluated:

| Approach | Defendability |
|---|---|
| **Relax assertions to `toBeTruthy()`** (what was done initially) | NOT DEFENDABLE — hides the real bug. The original `'Country': 'United States'` value was MCP-verified from the real app; removing it eliminates coverage of whether Country renders in history at all. |
| **Add an "audit project" that runs serial after writes** | PARTIALLY DEFENDABLE — solves concurrency, but the bug also reproduces with `workers=1`. Doubles wall-clock time. Doesn't address the core defect: test doesn't own its data. |
| **Self-contained tests (test writes its own row, reads its own row)** | **DEFENDABLE** — eliminates the dependency on any other spec's state. Works regardless of worker count. Test owns the data end-to-end. Failures are localized to the field under test. |

**Defense statement**: The original MGH-008 violated the basic property of a unit test — that the test controls its own preconditions. It was reading state produced by an unrelated spec, which is by definition non-deterministic. The self-contained pattern restores test ownership of preconditions. It is the same pattern already in use by `location-hist-notes.spec.ts` (confirmed by Explore agent as canonically correct).

### The contract — every history TC that asserts cell values

```
1. const sinceMs = Date.now()                              // sign with time
2. Navigate to the field's source page                      // go to the root
3. Edit the field with a deterministic, unique-per-TC value // make the change
4. Save and confirm                                          // persist
5. Navigate to the history page                             // go to history
6. const rows = historyPage.getRowsSinceTimestamp(sinceMs)  // find THIS test's row
7. Assert: the edited field shows the new value + metadata // verify
```

**Rules**:
- **One TC per (field, source-page) pair.** Aggregating multiple field assertions into one TC is forbidden — it makes failures non-localizable.
- **Pure structural tests** (column headers present, row count > 0, sort indicator state) are EXEMPT from steps 2–5. They don't assert cell values.
- **Sort tests** assert relative ordering across rows (row N < row M for ascending), not specific cell values.

### Existing reusable infrastructure (do not reinvent)

- **`getRowsSinceTimestamp(sinceMs, headers, maxRows)`** exists at `clients/encore/src/pages/setup/locations/location-management-history.page.ts:216-260`. Currently unused by the MGH spec. Already proven by `location-hist-notes.spec.ts:124` as the canonical pattern. No new code needed for MGH — just adopt it.
- **`sortByModifiedOnDesc()`** — same page object, used by hist-notes spec.

### Concrete restructure: TC-LOC-MGH-008

Currently: one TC asserting Country, Active, Currency, Local Office, Local Office Name, Modified By, Oracle Product Code, all on `row 0`.

Split into:

| New TC | Edits | Asserts on the row THIS test wrote |
|---|---|---|
| **TC-LOC-MGH-008a (Country edit-flow)** | Country at Location Settings | Country === new value; metadata fields populated (Modified By, Modified On); identifiers present (Local Office='1604', Local Office Name='Parker Palm Springs', Oracle Product Code) |
| **TC-LOC-MGH-008b (Active edit-flow)** | Toggle Active at Location Settings | Active flipped; same metadata + identifier assertions |
| **TC-LOC-MGH-008c (Currency edit-flow)** | Currency at Location Settings | Currency === new value; same metadata + identifier assertions |

Each TC reverts its change at teardown so the system stays clean for subsequent runs.

**Why 3 TCs and not 7+**: metadata fields (Modified By, Modified On, Oracle Product Code) and immutable identifiers (Local Office, Local Office Name) appear on EVERY save regardless of which field changed. So we don't need separate TCs for them — they get asserted as part of each editable-field TC. Net: 3 TCs cover everything the original TC-008 was trying to verify, each is self-contained.

### Sort tests (TC-LOC-MGH-009/010/011)

Today: each reads `getColumnByHeader(0, 'Modified On')` after sorting — asserts on row-0 value.

Refactor: assert **relative ordering** across the visible rows. For ascending sort: `row[0].ModifiedOn < row[N-1].ModifiedOn`. For descending: reverse. Compare parsed timestamps, not literal text. No row-0 value assertion needed — the sort behavior is verifiable by ordering alone.

### CI guard — `scripts/check-history-spec-contract.js`

Scans `clients/encore/tests/specs/**/*history*.spec.ts` AND `**/*hist*.spec.ts`. For each `test(...)` block:

1. **Reject** if body matches `getRowValues\(0`, `getColumnByHeader\(0,`, or `getColumnByIndex\(0,`. Exit code 1 with file:line.
2. **Reject** if the test contains cell-value assertions (`expect(row[...]).` patterns) AND does NOT call `getRowsSinceTimestamp` or `findRowSince`.
3. **Reject** if the test contains cell-value assertions AND has zero save method calls (`clickSave`, `saveAndConfirm`, `clickSaveWithDialog`) earlier in the test body.

Pure structural tests (no cell-value assertions) are auto-exempt.

Wired into `pretest` hook → build refuses to run tests if the contract is violated. **A future engineer cannot accidentally reintroduce the bug.**

---

## FIX 2 — Named Timeout Constants (kills Class B)

### Why this approach is defendable

Three alternatives:

| Approach | Defendability |
|---|---|
| **Fix only the 13 table-render hotspots** | NOT DEFENDABLE — the other 66 raw literals can flake under the same skeleton-render condition. The class isn't killed; it just shrinks. |
| **Bump every literal to 30s globally** | NOT DEFENDABLE — masks real bugs (a button that takes 30s to enable is broken, not slow). Loses signal. |
| **Named buckets per semantic role + full migration + CI guard** | **DEFENDABLE** — each timeout has a documented reason and a single source of truth. Tuning the value tunes the whole bucket. Future literals are physically blocked. |

**Defense statement**: 79 scattered numbers is technical debt that has already produced one production failure (TC-LGL-001). Named buckets convert magic numbers into intent. The CI guard prevents the debt from accumulating again.

### New file: `clients/encore/src/core/timeouts.ts`

```typescript
export const TIMEOUTS = {
  UI_ACTION: 5_000,        // button click, dialog open/close, focus blur
  TABLE_RENDER: 15_000,    // skeleton-first table or grid render
  FORM_READY: 15_000,      // form initial render with API fetch
  SECTION_READY: 15_000,   // tab/section visible after click (Angular routing + skeleton)
  NAVIGATION: 30_000,      // page-level navigation
  AUTH_FLOW: 90_000,       // Microsoft SSO redirect chain
  CLEANUP: 3_000,          // dropdown close, dialog dismiss (no-op on failure OK)
} as const;
```

### Migration classification

| Current literal | Context | Replace with |
|---|---|---|
| `5_000` on `tbl*` / grid / section visible | Skeleton-first render | `TABLE_RENDER` |
| `5_000` on dialog / button visible | UI feedback | `UI_ACTION` (no value change, naming only) |
| `5_000` on `.catch(()=>{})` cleanup | Best-effort | `CLEANUP` |
| `15_000` on tables | Already correct | `TABLE_RENDER` |
| `30_000` on navigation | Already correct | `NAVIGATION` |
| `90_000` on auth | Already correct | `AUTH_FLOW` |

### CI guard — `scripts/check-hardcoded-timeouts.js`

Scans `clients/encore/src/pages/**/*.ts` for `timeout:\s*\d+_?\d*\b`. Rejects any match with file:line and suggests the correct `TIMEOUTS.*` constant based on the surrounding context (table/section/grid → `TABLE_RENDER`, dialog/button → `UI_ACTION`, cleanup `.catch` → `CLEANUP`).

---

## FIX 3 — Safe Textarea Fill Helper (kills Class C)

### Why this approach is defendable

Two alternatives:

| Approach | Defendability |
|---|---|
| **Per-callsite branch (`if text.includes('\n')`)** | PARTIALLY DEFENDABLE — works for the known callsite. Doesn't prevent future textareas from hitting the same trap. |
| **Framework helper + full migration + CI guard** | **DEFENDABLE** — single safe path for all textareas. Future code that types `textarea.fill(` is physically blocked from merging. |

**Defense statement**: The `pasteIntoNote` mechanism is proven (TC-007 4001-char boundary test passes). Promoting it to a framework helper standardizes the safe path. The CI guard prevents anyone from reintroducing the unsafe path.

### New BasePage method

```typescript
async fillTextareaSafe(locator: Locator, text: string): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.UI_ACTION });
  await locator.focus();
  await locator.evaluate((el: HTMLTextAreaElement, t: string) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set;
    setter?.call(el, t);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, text);
  await locator.press('Tab');
}
```

### Migration

| File:line | Today | New |
|---|---|---|
| `location-notes.page.ts:55-67` | `fillNote` has `\n` branch → `pasteIntoNote` | `fillNote` always calls `this.fillTextareaSafe(textarea, text)` — branch removed |
| `location-notes.page.ts:75-94` | `pasteIntoNote` self-contained | Thin alias for `fillTextareaSafe` — preserves TC-007/TC-021 callsite compatibility |
| `location-form-helpers.page.ts:137` | Generic `el.fill(value)` | Branch on `tagName === 'TEXTAREA'`: textareas route to `fillTextareaSafe`; inputs stay on `fill()` |

### CI guard — `scripts/check-textarea-fill.js`

Scans `clients/encore/src/pages/**/*.ts` for `.fill(` calls. Resolves the locator's selector key against the selectors files. If the resolved selector targets a `<textarea>` element, REJECT with file:line + suggestion to use `fillTextareaSafe`.

---

## FIX 4 — CI Wire-Up (locks all 3 fixes in)

### `package.json` changes

Add:
```json
"check:anti-patterns": "node scripts/check-history-spec-contract.js && node scripts/check-hardcoded-timeouts.js && node scripts/check-textarea-fill.js",
"pretest": "npm run check:anti-patterns"
```

(If `pretest` already exists, chain the existing command + the new one.)

If/when GitHub Actions CI is wired, add the same `npm run check:anti-patterns` step before tests run.

---

## Files Created

- `clients/encore/src/core/timeouts.ts`
- `clients/encore/scripts/check-history-spec-contract.js`
- `clients/encore/scripts/check-hardcoded-timeouts.js`
- `clients/encore/scripts/check-textarea-fill.js`

## Files Modified

**Fix 1 (history)**:
- `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts` — TC-008 split into 008a/b/c; TC-009/010/011 refactored to relative ordering
- `clients/encore/tests/test-data/setup/locations/location-management-history.data.ts` — restore Country; redesign `ROW_1_EXPECTED` as per-field map
- `clients/encore/src/pages/setup/local-office/local-office-settings.page.ts` — add `getHistoryRowsSinceTimestamp` (mirror of MGH version)
- `clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts` — audit + restructure any TCs that violate the contract

**Fix 2 (timeouts)**: all 12 page-object files in `clients/encore/src/pages/**` with hardcoded literals (79 replacements total)

**Fix 3 (textarea)**:
- `clients/encore/src/core/base-page.ts` — add `fillTextareaSafe`
- `clients/encore/src/pages/setup/locations/location-notes.page.ts` — simplify `fillNote`, alias `pasteIntoNote`
- `clients/encore/src/pages/setup/locations/location-form-helpers.page.ts` — textarea branch

**Fix 4 (CI)**:
- `clients/encore/package.json` — `check:anti-patterns` script + `pretest` hook

**Documentation**:
- `clients/encore/CLAUDE.md` — add "History test contract" section pointing at this plan's rules

## Files NOT Touched (explicit out-of-scope)

- `clients/encore/tests/infra/auth-storage.ts` — keep `/auth/sign-in` URL check (Q3 deferred)
- `clients/encore/tests/infra/auth.setup.ts` — unchanged
- `clients/encore/tests/infra/fixtures.ts` — unchanged (no heartbeat fixture)
- `clients/encore/tests/infra/global-setup.ts` — unchanged
- All non-history specs — only touched if they contain a hardcoded timeout migrated under Fix 2; their test logic stays the same
- TC-LOS-ECT-014 — deferred app-side issue

---

## Verification

### Fix 1 (history)
- `node clients/encore/scripts/check-history-spec-contract.js` → exit 0
- `npx playwright test --grep "TC-LOC-MGH-008a"` → passes
- `npx playwright test location-management-history` → all TCs pass with strict assertions (no `toBeTruthy()` relaxations on Country/Active/Currency)
- Negative test: introduce a `getRowValues(0)` line in a history spec → guard exits non-zero with file:line

### Fix 2 (timeouts)
- `node clients/encore/scripts/check-hardcoded-timeouts.js` → exit 0
- `grep -rn 'timeout: \d' clients/encore/src/pages/` → zero matches outside `timeouts.ts`
- `npx playwright test --grep "TC-LOC-LGL-001"` 5 consecutive runs → 100% pass rate
- Negative test: introduce `timeout: 5_000` in a page object → guard exits non-zero

### Fix 3 (textarea)
- `node clients/encore/scripts/check-textarea-fill.js` → exit 0
- `npx playwright test --grep "TC-LOC-NTS-031"` → passes (multiline content visible in history)
- Negative test: introduce `txtNoteInputAll.fill(...)` in a page object → guard exits non-zero

### End-to-end
- `npm run check:anti-patterns` → exit 0
- Clean full suite run: `npm run clean:reports` → `npx playwright test --project=chromium --workers=1`
  - TC-LOC-NTS-031, TC-LOC-LGL-001, TC-LOC-MGH-008a/b/c → all pass with strict assertions
  - TC-LOS-ECT-014 may still fail (deferred — app-side); no other new hard failures
- `npm run typecheck` → exit 0

---

## Rollout Sequence

Sequential — stop and HALT-to-user on any phase failure:

| Phase | Fix | Scope | Verification gate |
|---|---|---|---|
| 0 | Save this plan to repo at `plans/pending/PLAN_EMERGENCY_01_HIST_ARCH_AND_BUG_GUARDS_2026_05_15.md`; run `npm run plans:reindex` | 1 file write + index regen | Plan visible in `plans/INDEX.md` |
| 1 | **Fix 1 (HISTORY — PRIMARY)** | ~4 spec/data/page-object files | TC-LOC-MGH-008a/b/c pass with strict assertions; CI guard exit 0 |
| 2 | Fix 2 (timeouts) | ~12 page-object files, 79 edits | Full suite stable; CI guard exit 0 |
| 3 | Fix 3 (textarea) | 3 files | TC-LOC-NTS-031 passes; CI guard exit 0 |
| 4 | Fix 4 (CI wire-up) | `package.json` | `npm run check:anti-patterns` exit 0 |

**Why this order**: Fix 1 first because it's the headline EMERGENCY — kills the highest-blast-radius class (any future history test). Fix 2 next because it's mechanical and low-risk. Fix 3 third because it's the most isolated change. Fix 4 last because the guards are a safety net — wire them after migrations land, so they don't block their own enabling commits.

---

## Open out-of-scope items (track separately, NOT in this plan)

1. **TC-LOS-ECT-014 root cause** — Next.js client-side exception on retry. File a bug against the Encore app team with the `failure-summary.json` evidence (`net::ERR_ABORTED` on `/api/auth/session` at the 1.1-min mark, "Application error" screenshot from `retry1/test-failed-1.png`). Framework will not attempt to mask the crash.
2. **TC-029/TC-030 intermittent Notes-empty issue** — auditor flagged a separate concurrent-save pollution (`sinceMs` window timing) affecting non-multiline payloads. Track separately.
3. **Dedicated read-only audit office** — `OFFICE_NO_READONLY = '1605'` was considered. **Not needed once Fix 1 lands** — self-contained tests don't need office isolation because they only read their own writes. Revisit only if a new history audit pattern emerges that genuinely cannot be made self-contained.
