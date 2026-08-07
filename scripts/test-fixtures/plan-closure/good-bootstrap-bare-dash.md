# PLAN_FIXTURE_BOOTSTRAP_BARE_DASH

> 🤖 **SESSION BOOTSTRAP** — This fixture contains a bare `---` line inside the bootstrap blockquote.
>
> This context block intentionally includes a separator-like line below.

---

> Additional bootstrap content after the bare dash above.
> The parser must skip the first `---` because non-empty content after it starts with `>`.
>

---

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-08-07
**Executed**: 2026-08-07

---

## Objective

Validate that stripLeadingBootstrap correctly skips a bare `---` inside the bootstrap blockquote.

## Scope

- Regression fixture for review-K defect 3.
- Verifies parser finds correct terminating `---` before frontmatter.

## Steps

1. Step A — bootstrap block contains a bare `---` line before real frontmatter separator
2. Step B — fixed scanner skips `---` followed by `>` lines and strips only at the correct one
3. Step C — validatePlan reads Status: DONE and proceeds to full validation

## Execution Summary

All three steps completed as specified.

- Step A delivered: first `---` is bare and inside the bootstrap section; followed by more blockquote lines.
- Step B delivered: fixed scanner checks what follows each `---` and skips when next non-empty starts with `>`.
- Step C delivered: second `---` is the real separator; followed by `**Status**: DONE`, correctly parsed.
- No deviations from fixture scope were necessary.
- C2 skeleton present with well over 10 content lines of meaningful detail.
- No handoffs generated — this is a leaf fixture with no downstream dependencies.
- No strict lines in acceptance criteria requiring C5 validation.
- Validator expected verdict: PASS after bare-dash-aware stripLeadingBootstrap fix.
- Evidence: fixture self-validates against C1 through C5 checks.
- Audit trail: authored for regression coverage of bare-dash-inside-bootstrap defect in scripts/validate-plan-closure.mjs.

## Acceptance

- [x] Bootstrap block precedes frontmatter with a bare `---` inside the blockquote section
- [x] Status: DONE is present in frontmatter (after the SECOND `---` separator)
- [x] Execution summary exceeds 10 content lines
- [x] No forbidden tokens present
