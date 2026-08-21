---
module: discount-matrix
submodule: company_matrix
baselineSite: https://navigator2.training.psav.com/#/
office: 1604
date: 2026-08-19
baselineScope: baseline-unreachable
jira_tickets: [NM-2218, NM-2219, NM-3235, NM-3236, NM-3237, NM-3239, NM-3255, NM-3256, NM-3062, NM-3229, NM-3233, NM-3387, NM-3390, NM-3435]
provenance: live (three authentication attempts, all blocked — see below)
---

# Old-site baseline — Discount Matrix / Company Matrix (2026-08-19)

## Verdict: BASELINE-UNREACHABLE — not baseline-absent

**A legacy counterpart is documented to exist.** `clients/encore/specs_planning/_internal/jira-research/discount-matrix-and-service-charge-text-qa-reference.md`
names the legacy components `discount-pricing-matrix.component.ts` and `company-matrix.component.ts`,
and NM-2219 explicitly cites `company-matrix.component.ts` / `.html` as its legacy reference. Several
defect tickets (NM-3236, NM-3237, NM-3239) compare observed behaviour against "the Training
Environment". So the baseline is real; it simply could not be authenticated today.

Recording this as `baseline-absent` would be a false claim, and per LR-045 row 4(c) / ALL-078 an
unreachable baseline is **not a HALT** — it is recorded and execution continues.

## Three attempts, all blocked at authentication

| Run | State loaded | Outcome |
|---|---|---|
| `dsm-cmx-baseline-0819` | `encore-state.json` (refreshed 13:38 today) | Microsoft SSO PKCE callback fired (`#code=…&state=…`), then landed on the legacy app's OWN expired-login route `#/login/exp/` rendering `<app-login>` (Angular 17.3.12, "Navigator Order Entry 2026.03.12.978.1"). Stayed there. |
| `dsm-cmx-baseline2-0819` | `nav2-state.json` (saved 2026-08-11, 8 days old) | Redirected to a Microsoft account picker: `Pick an account / s-prd-clickauto@psav.com / Use another account`. No credential typed; run stopped. |
| `dsm-nav2-sso-0819` | `nav2-state.json` | Clicked the already-listed account tile (account **selection**, not authentication). Microsoft then rendered `Enter password`. **Hard stop — no credential typed.** Verdict `SSO: PASSWORD-REQUIRED`. |

## Corrected framework fact

A prior memory note claimed one `state-load` of `encore-state.json` authenticates **both** e2e and nav2
via the Microsoft SSO cookie bridge. **That is refuted** by attempt 1: the SSO callback completes and the
legacy host still rejects the session. nav2 has its own state file and its own session.

## The exact unlock

`clients/encore/tests/auth.setup.ts` refreshes **only** `encore-state.json` — there is no nav2 equivalent
anywhere in `playwright.config.ts`, `src/setup/`, or `src/utils/auth-storage.ts`. So `nav2-state.json`
has **no automated refresh path** and ages out on its own (~7 days, Entra FedAuth). Either:

1. **A human completes one headed sign-in** — `playwright-cli open --persistent --profile=.auth\e2e-profile`
   against `navigator2.training.psav.com`, sign in, then `playwright-cli state-save -s=nav2`. One-off,
   buys ~7 days.
2. **Extend the auth setup to cover nav2** — a second setup project reusing `performSsoLogin` against the
   legacy host, writing `nav2-state.json`. This is new auth infrastructure and was **not** undertaken
   here: it is outside this subplan's scope and touches the shared authentication layer.

No agent may type a credential into the login form to work around this.

## Consequence for Company Matrix coverage

Every new-site observation in
`clients/encore/specs_planning/_internal/walk-evidence/discount-matrix-company-matrix-2026-08-19.md`
stands on its own live evidence and is unaffected. What is **not** established is whether any observed
behaviour is a *regression from* legacy or an *intentional change*. Specifically left open:

- Whether the percentage fraction semantics (`0.14` → `14%`, whole numbers appended unchanged) matches
  legacy or is new. NM-3235's premise — "other percentage fields in the application correctly handle
  both" — is a legacy-parity claim that cannot be checked today.
- Whether the legacy grid rendered percentages as editable inputs or static text (the new grid is static
  text with editing in a dialog).
- Whether legacy showed sequential integer IDs. **Note this one is already settled by product ruling and
  needs no baseline**: NM-2219 records "CMM 7/27/2026: The export file contains the GUID … This is
  acceptable and expected."

Both bugs filed from this session (`BUG-DSM-CMX-001`, `BUG-DSM-CMX-002`) therefore carry
`baselineComparison: not-checked` with this artifact named as the reason — not `baseline-absent`.

---

## Coverage Manifest

**MCP_Session_Date**: 2026-08-19
**Walk_Mode**: quick
**Coverage_Ratio**: 0/0 — nothing was enumerated, so nothing is undispositioned. The denominator is zero because authentication to the legacy site failed on all three attempts recorded above, so no control was ever rendered to this session. Read this as "the walk did not happen", NOT as "the surface has no controls" — the legacy counterpart is documented to exist (see the Verdict section).
**CrossCheck**: not clean — no artifact this pipeline produces carries per-entry `disposition` fields, so `crossCheckVerdict()` cannot return clean for any module. Every delivered module reports the same. Not a defect of this artifact.
**Completion_Record**: none — no enumeration run completed, so no completion record exists to cite.
**Enumeration_Script**: not run. `npm run walk:enumerate` requires an authenticated session on the legacy host; that is the exact precondition that failed.
**Auth_State**: `clients/encore/.auth/nav2-state.json` — present but rejected by the legacy host on 2026-08-19.
**Mutation_Attestation**: Zero mutations. No session was ever established, so no field could be edited, saved, added or deleted.

### Manifest rows

| Element key | Type | Date | Disposition |
|---|---|---|---|
| (none enumerated) | n/a | 2026-08-19 | out-of-scope: baseline-unreachable — the legacy host refused authentication on all three attempts, so zero controls were enumerated. The new-site coverage for this module does not depend on this baseline; it is sourced from the live e2e walk recorded in `field-inventories/discount-matrix-company-matrix-2026-08-20.md`. |

**Why this manifest exists with a zero denominator**: artifacts dated on or after 2026-07-22 must carry a Coverage Manifest. An unreachable baseline still needs one, stating plainly that the denominator is zero and why — the alternative, omitting the section, is indistinguishable from having forgotten it.
