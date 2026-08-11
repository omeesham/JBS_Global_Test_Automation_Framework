---
artifact: false-green-sweep
client: encore
module: service-charge
session_date: 2026-08-10
author_identity: OWNER
sweep_source: gpt-5.5 audit (nm3344-audit2-0810/result.md) + remediation reports (nm3344-fixdocs-0810/result.md, nm3344-fixspecs-0810/result.md)
---

# False-Green Sweep — Service Charge (2026-08-10)

## Oracle vs fixme split

Of the 33 authored test cases across both specs:

- **21 carry a real oracle** (can pass or fail based on actual application behaviour)
- **12 are `test.fixme`** pending live confirmation (will be skipped by the test runner)

Fixme counts taken from grep (not from this ticket's list):
- `service-charge-basic-information.spec.ts`: **10** `test.fixme` occurrences
- `service-charge-history.spec.ts`: **2** `test.fixme` occurrences

These 12 fixme tests produce no runtime signal until the e2e environment stabilises and a live walk
confirms their oracles. They cannot go green or red — they are structurally excluded from the run.

---

## Findings

### Finding 1 — Tautological assertions in Basic Information spec

**Verdict**: FALSE-GREEN

**What it was**: Approximately 10 tests in `service-charge-basic-information.spec.ts` asserted only
`expect(['true', 'false', null]).toContain(someValue)` or `expect(value).not.toBeNull()`. Every
reachable value satisfies these assertions regardless of what the application actually does. The
tests went green without validating the requirement they were supposed to cover.

**File:line (pre-fix)**:
`clients/encore/tests/service-charge/service-charge-basic-information.spec.ts:97-102`, `:173-178`,
`:199-204`, `:215-220`, `:246-251`, `:262-267`, `:282-285`, `:300-302`, `:317-319`, `:330-342`

**Fixed**: YES — converted to `test.fixme` by remediation run `nm3344-fixspecs-0810`.
Confirmed: `grep -c test.fixme service-charge-basic-information.spec.ts` → 10.

**Recurrence condition**: A future author writes a NEEDS-LIVE-CONFIRM test without converting it
to `test.fixme`, or converts a fixme to a real test before running it against a live enabled
environment and recording the actual observed value as the oracle.

---

### Finding 2 — History spec implemented row-count and append behaviour against an unwalked tab

**Verdict**: FALSE-GREEN

**What it was**: `TC-SVC-HIS-002` and `TC-SVC-HIS-003` in `service-charge-history.spec.ts` (lines
97–131) implemented row-count-before/after-save assertions and new-row-append assertions against
the History tab. The History tab was never successfully walked — only a heading pattern and four
column names are legitimate observed facts. The spec was asserting invented behaviour. Additionally,
`TC-SVC-HIS-003` mutated a percentage value on shared office 1604 to trigger the history delta,
meaning a mid-test assertion failure would have left office 1604 permanently modified.

**File:line (pre-fix)**:
`clients/encore/tests/service-charge/service-charge-history.spec.ts:97-131`

**Fixed**: YES — `TC-SVC-HIS-002` and `TC-SVC-HIS-003` converted to `test.fixme`; all data
mutation (percentage change + save) removed from the history spec by remediation run
`nm3344-fixspecs-0810`. Confirmed: `grep -c test.fixme service-charge-history.spec.ts` → 2.

**Recurrence condition**: A future author implements History-tab behaviour assertions before
a successful live walk of the History tab is completed and recorded in a walk-evidence artifact.

---

### Finding 3 — Save tests restored original value inline (state leak on mid-test failure)

**Verdict**: STATE-LEAK

**What it was**: Five save tests in `service-charge-basic-information.spec.ts`
(`BAS-004/020/021/023/030`) restored the original percentage value as part of the test body, after
post-save assertions. A failure in any assertion between the save and the restore would exit the
test early, leaving the modified value persisted on shared office 1604.

**File:line (pre-fix)**:
`clients/encore/tests/service-charge/service-charge-basic-information.spec.ts:114-122`,
`:382-390`, `:407-419`, `:461-473`, `:575-586`

**Fixed**: YES — all five save tests wrapped in `try/finally` blocks by remediation run
`nm3344-fixspecs-0810`, guaranteeing restore even on assertion failure. Confirmed:
`grep "try/finally" ... -> 5` as reported in fixspecs result.

**Recurrence condition**: A future save test restores the original value in the test body rather
than in a `finally` block (or an `afterEach`/`afterAll` cleanup hook).

---

### Finding 4 — Invented save-dialog literal in both specs

**Verdict**: FALSE-GREEN

**What it was**: Both `service-charge-basic-information.spec.ts:26-27` and
`service-charge-history.spec.ts:24-25` hardcoded
`[role="alertdialog"]:has-text("Save Changes") button:has-text("Ok")` as the save-dialog
selector. The inventory explicitly states the save dialog was never observed (Save was never
activated during the walk due to environment condition — `service-charge-basic-information-2026-08-10.md` §Save-cycle observations). The dialog title text `"Save Changes"` was an invention; it would make save-cycle tests brittle if the actual dialog text differs.

**File:line (pre-fix)**:
`clients/encore/tests/service-charge/service-charge-basic-information.spec.ts:26-27`
`clients/encore/tests/service-charge/service-charge-history.spec.ts:24-25`

**Fixed**: YES — the hardcoded CSS-has-text selector removed from both files by remediation run
`nm3344-fixspecs-0810`; replaced with `getByRole('alertdialog').getByRole('button', { name: 'Ok' })`
which does not assert the dialog title literal. The dialog title itself remains unconfirmed and
must be MCP-verified before any test asserts it.

**Recurrence condition**: A future author adds a save-dialog selector that asserts specific
dialog title text before MCP verification of the actual rendered dialog title on the live page.
