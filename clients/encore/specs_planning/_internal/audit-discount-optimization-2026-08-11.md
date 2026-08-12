# Audit — Discount Optimization Settings (NM-3342)

**Date**: 2026-08-11
**Scope**: completeness, bifurcation integrity, axis integrity, claimed-but-unproven
**Method**: independent audit pass, with every finding re-verified against disk before acceptance

---

## Verdict

**Accepted after remediation.** The audit returned `INCOMPLETE` with six findings. All six were
confirmed by independent re-check and all six are now closed. The two most consequential — an unproven
green-run claim and a self-contradicting test comment — were real and would have shipped a false
statement about the module's health.

---

## Findings and disposition

| # | Severity | Finding | Verified | Disposition |
|---|---|---|---|---|
| 1 | High | Persistence coverage rested on a test whose comment declared it "intentionally left failing", while its assertion asserted success. Both could not be true. | Yes — read at source | **Closed.** Root-caused to a test-isolation defect: the test asserted persistence on a grid row that seventeen sibling tests also mutate. Given its own dedicated row, it passes 5/5 in isolation and in all four full-suite runs. Comment removed. |
| 2 | High | All six Special Rate Exemptions cases were labelled "Pending Automation" though all six are implemented. | Yes — each ID matched to a test | **Closed.** All six relabelled Automated after per-ID confirmation against the spec; summary corrected to 6 of 6. |
| 3 | High | The claim "suite passed 34 of 34, twice" had no artifact behind it; the only recorded tally was 18 failed / 16 passed. | Yes — no artifact existed | **Closed.** Four runs now recorded under `reports/test-runs/`. At the repository's default worker count the suite passes 34/34 twice. At four workers it passed once and failed once. |
| 4 | High | The persistence finding's retraction was not recorded in the walk evidence, and the test's own comment contradicted it. | Yes | **Closed.** Walk evidence now carries the resolution; the bug record is closed as not-a-defect. |
| 5 | Medium | An internal ticket identifier leaked into a client-facing case file. | Yes | **Closed.** Removed, plus a second one the original scan missed. A broadened scan (internal artifact names, not just rule and plan identifiers) now returns zero across both files. |
| 6 | Medium | Both case files' summary headers overcounted their own cases (claimed 28 and 7; actual 27 and 6). | Yes — counted headings | **Closed.** Counts corrected to 27 and 6. No case was renumbered and none was invented; the identifier gaps are deliberate banding. |

---

## Completeness

- Field inventory: 148 of 148 elements dispositioned, cross-check clean.
- Test cases: 27 locations + 6 exemptions = 33, each mapping to exactly one implemented test. No
  duplicate identifiers; no identifier present in a spec but absent from the case files, or the reverse.
- Deliverable parity: the case identifiers now resolve in the shipped workbook. The remaining parity
  warning is pre-existing, unrelated to this module, and contains none of its cases.

## Bifurcation integrity

All 33 cases are Automated and each was individually confirmed against the spec before being labelled.
No case is marked Manual. One case had previously been marked Manual on the reasoning that it "mutates
live data" — that reasoning is invalid here, because the target environment is the writable automation
environment and other delivered modules already automate saves against it. That case is automated and
passing.

## Axis integrity

The grid's behaviour families — result fidelity, sorting, render state, empty/volume, and persistence —
each have at least one implemented test. Pagination and combination are recorded out of scope with
reasons naming concrete surface facts (the grid renders all rows without pagination).

Sorting deserves specific note: this module was briefly authored on the belief that the grid does not
sort. It does. Each column header carries an options menu containing *Sort ascending* and *Sort
descending*, and choosing either reorders rows. The earlier conclusion came from clicking the column
resize handle and from never opening the menu. The grid does not set a sort attribute on the header, so
the correct check is a change in row order, never an attribute read. Four cases cover this.

## Claimed-but-unproven

Every claim below was checked against disk rather than accepted from a report:

- Specs contain no fixed sleeps, no network-idle waits, no value assignment that bypasses the
  application's own input handling, and nothing skipped — confirmed by direct scan.
- The page object's remaining timed waits are poll intervals inside deadline-bounded loops, not fixed
  sleeps standing in for a condition.
- Zero confirmed product defects. Two defects were filed during the walk and both were retracted with
  root cause recorded; every "product defect" on this module traced back to the automation.

## Residual risk

The suite is not deterministic at four workers — one test covering search filtering failed in one of two
runs at that concurrency. The repository's configuration already defaults to a single worker and
documents an unresolved multi-worker conflict on shared application state, so this is a pre-existing
condition of the suite rather than something introduced here. It is recorded rather than hidden, and it
does not affect anyone running the suite as configured.
