# Audit — Discount Matrix › Company Matrix (2026-08-20)

**Module**: discount-matrix / company-matrix
**Office**: 1604 (`cloudapps-e2e.encoreglobal.com`), cross-checked on 1101
**Tier**: quick
**Cases**: `TC-DSM-CMX-001..042`
**Browser tool**: Playwright CLI + standalone node scripts (LR-038 v2 default). Playwright MCP not used.

This records what was verified, how, and what survived. It is deliberately blunt about the two things
this session got wrong, because both were caught late and both are the reusable lesson.

---

## 1. Test execution

| Run | Command | Result |
|---|---|---|
| 1 | `npx playwright test tests/discount-matrix/company-matrix.spec.ts --retries=0` | **43 passed (6.3 m)** — 42 spec tests + 1 auth-setup test running as a project dependency |
| 2 | identical | **42 passed, 1 failed** — `TC-DSM-CMX-003` timed out |
| 3 | `--grep "TC-DSM-CMX-00[234]" --retries=0 --repeat-each=5` (post-fix) | **16 passed (4.8 m)** — 15 executions + setup, zero failures |

Run 1 and run 2 disagreeing is the whole reason the suite is run twice. A single green run would have
shipped a flake.

### The flake, and why it was a real defect

`TC-DSM-CMX-003` failed with
`TimeoutError: locator.textContent: Timeout 10000ms exceeded` on `tbody tr` `.nth(2).locator('td').nth(1)`.

Root cause, in `company-matrix.page.ts`: `getTierRangeLabels()` snapshotted the row count once, then read
each row in a **separate round trip**. A criteria-bar re-key repaints the grid — switching Currency from
USD to CAD takes it from 9 rows to an empty state — so a repaint landing mid-loop detached `rows.nth(2)`
and the read blocked until timeout.

Fix: both `getTierRangeLabels()` and `getRowValues()` now perform **one atomic DOM read** (`evaluateAll` /
`row.evaluate`), so a repaint can only land before or after, never during. No wait, no retry, no raised
timeout was added — a wait narrows the window, it does not close it. Guard behaviour and error messages
are unchanged; `getRowValues` still returns exactly 21 values.

Verified by 5 repetitions each of the three re-key tests: all green.

---

## 2. Coverage

**Machine denominator: 21.** Provenance `reports/walk-coverage/1604-discount-matrix.json`, both dialog
branches `ok: true`, measured against a healthy 9-row grid.
`cross-check.mjs --self-test` → 18 passed, 0 failed.

One known shortfall, filed as **D14**: the Edit Tier dialog's 21 percentage inputs collapse into a single
`role:input:` entry with no `occurrences`, so dialog *fields* contribute 1 rather than 21. This is a limit
of the enumerator's portal scan, not of the surface. Those inputs are covered behaviourally by
`TC-DSM-CMX-022` and the Edit Tier cases, which read all 21 values directly.

Both input entries resolve `type: null, resolved: false` — one is a `role:`-keyed entry with no CSS path,
the other's probe ran after its dialog had closed. Neither is asserted to have a type it was not measured
to have.

---

## 3. Spec-quality gate

`npm run check:spec-quality`, run from the repo root (it does not exist in the client package — an earlier
attempt from `clients/encore` failed for that reason, not for a code reason).

Exit non-zero, but **zero findings touch this module**. Verified by direct grep of the gate output:
`DSM-CMX` → 0 hits, `discount-matrix` → 0 hits. Every failure belongs to `TC-CPR-OVR`, `TC-DOP-EXM`,
`TC-DOP-OPT`, `TC-LOC-PRI`, `TC-SVC-BAS`, `TC-SVC-HIS` — six other modules, all missing
`reject-oracle` receipts. This session modified none of those specs. Spun out as its own task rather than
fixed inline.

---

## 4. Defects

| ID | Status |
|---|---|
| `BUG-DSM-CMX-001` | Filed — out-of-range percentage silently disables **Update** with no message |
| `BUG-DSM-CMX-002` | Filed — first Edit Tier percentage field opens as raw `0.17` while the other twenty open as `17%` |
| Save → navigate write loss | **BUG-CANDIDATE**, not filed — needs a baseline comparison; tracked as D13 |

No DOM or markup accessibility findings are recorded anywhere in this module's artifacts, per the standing
owner rule. The testid gap report raises 17 controls as an automation-stability ask only.

---

## 5. Two things this session got wrong

Recorded because both were confidently wrong, and confidence was the problem.

### 5.1 A critical bug filed against a healthy module

`BUG-DSM-CMX-003` was filed claiming Discount Matrix served no data on any office. **It was retracted the
same day.** The module works: 9 rows and a `15%` threshold on both 1604 and 1101, confirmed by screenshot.

The cause was a partially decayed `encore-state.json`. That state fails silently and asymmetrically — the
shell renders, HTTP stays 200, the console stays clean, the RSC payload carries `"error": null`, and
**some modules keep serving data while others do not**. `service-charge` returned 79 rows in the same
session where `discount-matrix` returned none, and that observation was used to rule auth out. It does not
rule auth out.

Four investigation runs eliminated launch args, viewport, locale, timezone, an `about:blank` pre-nav,
office identity and elapsed time. Session freshness was never varied, because one worker reported that a
fresh SSO login had already happened and the test failed anyway. **That claim was never re-derived, and it
was false.** It was the only load-bearing fact in the chain.

Standing rule now recorded in `REQUIREMENTS.md` § *Session Timeout Handling*: before attributing any
missing-data symptom to the application, run `--project=setup`, confirm exit 0, confirm the state file's
mtime is newer than the failing measurement, then re-measure. A healthy sibling module is not a session
control.

### 5.2 An invented blocker

The old-site baseline was reported as blocked pending a human sign-in. `clients/encore/CLAUDE.md`
§ *"When encore needs fresh login session"* states the repository's unattended mechanism covers nav2, that
the account has no second factor, and that asking a human to sign in is itself a defect. The blocker was
withdrawn; D13 now names the real unlock.

### 5.3 Worker output that did not survive checking

Two council workers produced unusable output, both caught by re-running their claims rather than reading
them:

- One read a sandbox `Permission denied` error as proof the application session had expired, and reported
  `git status --porcelain` as empty. The real output was 17 lines. Bounced, no credit.
- One made the correct page-object edits and then ended its turn mid-run, leaving a stub report. The edits
  were verified directly on disk; the proof run was re-dispatched separately.

---

## 6. Verification commands, re-runnable

```bash
# Suite (43 = 42 spec + 1 auth setup)
cd clients/encore && npx playwright test tests/discount-matrix/company-matrix.spec.ts --retries=0

# Flake guard on the three re-key cases
cd clients/encore && npx playwright test tests/discount-matrix/company-matrix.spec.ts --grep "TC-DSM-CMX-00[234]" --retries=0 --repeat-each=5

# Denominator provenance
node -e "const r=require('./reports/walk-coverage/1604-discount-matrix.json'); console.log(r.denominator, JSON.stringify(r.branches))"

# Coverage cross-check
node scripts/walk-coverage/cross-check.mjs --self-test
```
