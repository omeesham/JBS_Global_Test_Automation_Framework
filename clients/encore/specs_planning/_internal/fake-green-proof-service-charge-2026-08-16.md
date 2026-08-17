# Fake Green Proof — Service Charge Tests (2026-08-16)

**Module**: service-charge (basic-information + history)
**Client**: encore
**Date**: 2026-08-16
**Source artifacts**:
- `.claude/state/ua-worker/chips/fake-greens/out-ADJUDICATE/ADJUDICATE.md` — adjudication table
- `.claude/state/ua-worker/chips/fake-greens/out-PROVE-A/PROVE-A.md` — first independent demonstration
- `.claude/state/ua-worker/chips/fake-greens/out-PROVE-B/PROVE-B.md` — second independent demonstration
- `.claude/state/ua-worker/chips/fake-greens/out-MUTATE/MUTATE.md` — mutation verify (repairs reject wrong values)

> Eight test assertions were identified as accepting wrong values — the test passes even when the application
> behaves incorrectly. Two independent demonstrations proved each finding. This document records the per-finding
> proof and the repair status. One finding (F7) is an open gap, deliberately: its expected value was never
> confirmed against the running application.

---

## How the proof standard works

- **P1 (concrete wrong value)**: a specific wrong string or value is named; the Playwright matcher semantics are
  modelled in plain Node (no test runner); the named value is fed to the matcher model and it returns true —
  meaning the test accepts the wrong value as passing.
- **P2 (swallow fallback)**: the `.catch(()=>fallback)` pattern is identified; the fallback value is exactly what
  the assertion demands; a genuine failure path (element detached, timeout) that triggers the fallback is confirmed
  from source.
- **P3 (omission)**: every assertion in the test is exhaustively enumerated; the claimed missing property is shown
  to be absent from the enumeration — the test never checks it.

Both demonstrations (PROVE-A and PROVE-B) were produced independently by separate workers. The adjudication
(ADJUDICATE) confirmed all eight findings against source and resolved disagreements between the two workers.

---

## Findings

### F1 — TC-SVC-HIS-012 · `service-charge-history.spec.ts:289` · Class P2

**Assertion as it was:**
```typescript
const ariaSort = await allColumnHeaders.first().getAttribute('aria-sort', { timeout: 3000 }).catch(() => null);
expect(ariaSort).toBeNull();
```

**Wrong value that satisfied it:** `null` — the `.catch(() => null)` fallback.

**How it is wrong:** If the column header element detaches from the DOM after the sort click, or if the 3000 ms
timeout expires, `getAttribute` throws. The `.catch(() => null)` swallows the error and returns `null`. The
assertion `expect(ariaSort).toBeNull()` then passes — not because the present header lacks `aria-sort`, but
because the header is gone (or the read failed). A test that passes when the header has disappeared is not
proving the intended property.

**Demonstrated by:** PROVE-A (swallow fallback null, `null === null` evaluated in Node) and PROVE-B
(swallow via `Promise.reject` + catch, same evaluation).

**Assertion as it is now (after repair):**
```typescript
expect(rows.length).toBeGreaterThanOrEqual(2);
expect(ascRow0.length).toBeGreaterThan(0);
expect(ascRow0Parsed).toBe(minDate);
expect(descRow0.length).toBeGreaterThan(0);
expect(ascRow0).not.toEqual(descRow0);
```

**Does the repair reject the wrong value?** Yes — `CLOSED`. The repaired assertion set has no `toBeNull` / catch
path. The null fallback cannot satisfy a minimum-date equality check or a row-order inequality check.
*(Source: MUTATE.md F1 outcome=CLOSED)*

---

### F2 — TC-SVC-HIS-012 · `service-charge-history.spec.ts:271` · Class P3

**Assertion as it was (exhaustive enumeration of all asserted values):**
1. `expect(rowsBefore.length).toBeGreaterThanOrEqual(1)` — pre-click row count lower bound
2. `expect(ariaSort).toBeNull()` — aria-sort attribute after click

**Wrong value that satisfied it:** Row order unchanged / rows reordered in any way — the test never checked.

**How it is wrong:** `rowsBefore` is captured before the click. The test never reads rows after the click and
never compares row order. A click that reorders rows, empties the grid, or sorts through a non-ARIA mechanism
all pass, because neither of the two asserted values touches row content after the click.

**Demonstrated by:** PROVE-A (P3 enumeration, 2 asserted values listed, row order after click absent) and
PROVE-B (same enumeration, `rowsAfterOrderChanged=false` fed into scenario, test still accepts).

**Assertion as it is now (after repair):**
```typescript
expect(ascRow0Parsed).toBe(minDate);
expect(ascRow0).not.toEqual(descRow0);
```

**Does the repair reject the wrong value?** Yes — `CLOSED`. An unchanged or wrongly-ordered row0 fails both
the minimum-date check and the ascending-vs-descending inequality.
*(Source: MUTATE.md F2 outcome=CLOSED)*

---

### F3 — TC-SVC-BAS-029 · `service-charge-basic-information.spec.ts:623` · Class P3

**Assertion as it was (exhaustive enumeration):**
1. `expect(rowCount).toBe(SC_ROW_COUNT)` — count of `[data-testid^="service-charge-percentage-"]` is 79

`await sc.getPercentageByIndex(AUDIO_IDX)` is called but its return value is not wrapped in `expect()` — the
call only proves it did not throw; whatever it returns is discarded.

**Wrong value that satisfied it:** Row 8 carrying any label other than "Audio Conferencing" — the label was
never asserted.

**How it is wrong:** The page can render 79 percentage inputs with the wrong service labels, or with row 8 no
longer being Audio Conferencing (rows reordered by a sort, for instance), and the test still passes because
only the count is checked.

**Demonstrated by:** PROVE-A (P3 enumeration, 1 asserted value, label absent) and PROVE-B
(`row8Label="Not Audio Conferencing"` fed, test accepts).

**Assertion as it is now (after repair):**
```typescript
expect(rowCount).toBe(SC_ROW_COUNT);
expect(rowLabel).toBe('Audio Conferencing');
expect(percentageValue).toContain(' %');
```

**Does the repair reject the wrong value?** Yes — `CLOSED`. The label assertion rejects any value other than
exactly `'Audio Conferencing'`.
*(Source: MUTATE.md F3 outcome=CLOSED)*

---

### F4 — TC-SVC-BAS-007 · `service-charge-basic-information.spec.ts:219` · Class P1

**Assertion as it was:**
```typescript
expect(await input.inputValue()).toContain('24.00');
```

**Wrong value that satisfied it:** `"24.005 %"`

**How it is wrong:** `String.prototype.includes('24.00')` is true for `"24.005 %"` because `"24.00"` appears as
a substring. The test was meant to prove two-decimal rounding, but an unrounded value `24.005 %` passes.

**Demonstrated by:** PROVE-A (`'24.005 %'.includes('24.00') = true` evaluated in Node) and PROVE-B
(same evaluation, both `toContain` and `not.toBe('true')` accepted with `inputValue="24.005 %"`).

**Assertion as it is now (after repair):**
```typescript
expect(await input.inputValue()).toBe('24.00 %');
```

**Does the repair reject the wrong value?** Yes — `CLOSED`. `Object.is('24.005 %', '24.00 %')` is false.
*(Source: MUTATE.md F4 outcome=CLOSED)*

---

### F5 — TC-SVC-BAS-012 · `service-charge-basic-information.spec.ts:290` · Class P1

**Assertion as it was:**
```typescript
expect(await input.inputValue()).toContain('24.00');
```

**Wrong value that satisfied it:** `"024.00 %"`

**How it is wrong:** `"024.00 %".includes('24.00')` is true. The test was meant to prove that a leading zero is
stripped on normalisation, but the un-normalised value `024.00 %` passes.

**Demonstrated by:** PROVE-A (`'024.00 %'.includes('24.00') = true`) and PROVE-B (same evaluation).

**Assertion as it is now (after repair):**
```typescript
expect(await input.inputValue()).toBe('24.00 %');
```

**Does the repair reject the wrong value?** Yes — `CLOSED`. `Object.is('024.00 %', '24.00 %')` is false.
*(Source: MUTATE.md F5 outcome=CLOSED)*

---

### F6 — TC-SVC-BAS-014 · `service-charge-basic-information.spec.ts:326` · Class P1

**Assertion as it was:**
```typescript
expect(await input.inputValue()).toContain('0.00');
```

**Wrong values that satisfied it:** `"10.00 %"` and `"100.00 %"` (both independently)

**How it is wrong:** Both `"10.00 %".includes('0.00')` and `"100.00 %".includes('0.00')` are true. The test was
meant to prove that a clear-to-zero operation lands on zero, but any value containing the substring `0.00`
(including non-zero values) passes.

**Demonstrated by:** PROVE-A (both wrong values evaluated in Node, both accepted) and PROVE-B (same evaluation,
two separate wrong values each accepted).

**Assertion as it is now (after repair):**
```typescript
expect(await input.inputValue()).toBe('0.00 %');
```

**Does the repair reject the wrong value?** Yes — `CLOSED`. Neither `"10.00 %"` nor `"100.00 %"` equals
`'0.00 %'` under `Object.is`.
*(Source: MUTATE.md F6 outcome=CLOSED)*

---

### F7 — TC-SVC-BAS-030 · `service-charge-basic-information.spec.ts:642` · Class P3 · ⚠ OPEN GAP

**Assertion as it was (exhaustive enumeration):**
1. `expect(await sc.waitForSaveActive()).toBe(true)` — save button active after edit
2. `expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain(editValue)` — saved value persists after reload

The companion test-case document additionally expects no sort affordance on the History column headers. This
expectation appears in the source as a `// NEEDS-LIVE-CONFIRM` comment — it was never wrapped in `expect()`.

**Wrong value that satisfied it:** Sort affordance present + saved value `"34.00 %"` with editValue `"34.00"`.

**How it is wrong:** The test never checks whether sort affordance exists. A sort-capable grid and a
persistence-only test both pass, so the documented sort-affordance expectation is untested.

**FIXME — this finding is not repaired:**
The sort-affordance expectation was deliberately left unasserted because the expected value (does the History
grid have sort affordance or not?) was never confirmed against the running application before the fix was
written. The walk evidence in
`clients/encore/specs_planning/_internal/walk-evidence-service-charge-history-sort-2026-08-16.md`
now confirms that the History grid *does* have sort affordance (all 4 headers have dropdown sort menus). That
walk evidence is what would close this gap: update TC-SVC-BAS-030 to remove the "no sort affordance" expectation
(since the grid demonstrably has it), and assert the correct behaviour instead.

**What would close it:** Read the walk evidence, determine the correct expected behaviour for BAS-030's companion
sort-affordance expectation now that the live DOM is known, and replace the `// NEEDS-LIVE-CONFIRM` comment with
an actual `expect()`.

**Assertion as it is now:** Unchanged — same two assertions, no sort-affordance check added.
**Does the current assertion set reject the wrong value?** No — `CHANGED-SHAPE`. The wrong value still passes.
*(Source: MUTATE.md F7 outcome=CHANGED-SHAPE)*

---

### F8 — TC-SVC-BAS-025 · `service-charge-basic-information.spec.ts:588` · Class P2

**Assertion as it was:**
```typescript
expect(
  await authPage.locator('[role="dialog"], [role="alertdialog"]').first().isVisible().catch(() => false)
).toBe(false);
```

**Wrong value that satisfied it:** `false` — the `.catch(() => false)` fallback.

**How it is wrong:** If `.isVisible()` throws (element absent from DOM, locator failure), the catch fires and
returns `false`. The assertion `expect(false).toBe(false)` then passes — not because no dialog is visible, but
because the dialog check itself failed. Additionally, a dialog that appears *after* the synchronous snapshot
also returns `false` without throwing.

**Demonstrated by:** PROVE-A (swallow fallback false, `Object.is(false, false) = true`) and PROVE-B
(same evaluation via `swallowRejectsTo(false)`).

**Assertion as it is now (after repair):**
```typescript
expect(await sc.isSaveEnabled()).toBe(false);
await expect(authPage.locator('[role="dialog"], [role="alertdialog"]')).not.toBeVisible({ timeout: 3000 });
```

**Does the repair reject the wrong value?** Yes — `CLOSED`. `not.toBeVisible` with a bounded wait rejects a
visible dialog during that window instead of coercing the failure to `false`. The catch-to-false path is gone.
*(Source: MUTATE.md F8 outcome=CLOSED)*

---

## Summary

| # | Test | Class | Wrong value | Proved by | Repaired? |
|---|---|---|---|---|---|
| F1 | TC-SVC-HIS-012 | P2 | null (catch fallback) | PROVE-A + PROVE-B | CLOSED |
| F2 | TC-SVC-HIS-012 | P3 | row order never checked | PROVE-A + PROVE-B | CLOSED |
| F3 | TC-SVC-BAS-029 | P3 | wrong row label | PROVE-A + PROVE-B | CLOSED |
| F4 | TC-SVC-BAS-007 | P1 | `"24.005 %"` | PROVE-A + PROVE-B | CLOSED |
| F5 | TC-SVC-BAS-012 | P1 | `"024.00 %"` | PROVE-A + PROVE-B | CLOSED |
| F6 | TC-SVC-BAS-014 | P1 | `"10.00 %"`, `"100.00 %"` | PROVE-A + PROVE-B | CLOSED |
| F7 | TC-SVC-BAS-030 | P3 | sort affordance unasserted | PROVE-A + PROVE-B | **OPEN GAP** — see above |
| F8 | TC-SVC-BAS-025 | P2 | false (catch fallback) | PROVE-A + PROVE-B | CLOSED |

7 of 8 findings are repaired. F7 carries a `FIXME` because its expected value was never confirmed against the
running application before the repairs were written. The walk evidence now exists to close it; see the
FIXME entry above for the specific unlock.
