# Phase 0 Verification — Launcher Dialog Gaps (Workstreams A + B)

**Subplan**: SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC
**Date**: 2026-06-11
**Identity**: OWNER
**Verdict**: **PROCEED**

---

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| All 3 Depends-on subplans DONE in `plans/done/` | ✅ PASS | `plans/done/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md`, `SUBPLAN_ACCOUNT_ADDRESS_FCC.md`, `SUBPLAN_NOTES_FCC_PILOT.md` all present (`ls -la` confirmed) |
| `field-case-runner.ts` exports `saveAndVerifyCase` | ✅ PASS | `clients/encore/src/utils/field-case-runner.ts:41` `export async function saveAndVerifyCase(c: FieldCase)` |
| Both target specs / page objects / selectors / data exist | ✅ PASS | A: `location-left-panel-basic-information.{spec.ts,page.ts}` + `selectors/.../left-panel-basic-information.ts` + `data/.../location-left-panel-basic-information.ts`. B: `location-account-address.{spec.ts,page.ts}` + `selectors/.../account-address.ts` + `data/.../location-account-address.ts` |
| Next-free TC numbers confirmed (not assumed) | ✅ PASS | LP: max existing = `TC-LOC-LP-027` (27 IDs) → **next-free TC-LOC-LP-028**. ACC: max existing = `TC-LOC-ACC-031` (29 IDs) → **next-free TC-LOC-ACC-032**. Both match subplan expectation. |
| Local runs use `.env.local` (never `CI_ENV=e2e`) | ✅ PASS | LR-ENC-003 honored; spec runs will use `npm test` (loads `.env.local`) |
| Browser tool = CLI, announced | ✅ PASS | **Browser tool: Playwright CLI.** Reason: dialog walkthroughs + unattended save-restore cycles; no visual/CSS assertion, no fresh-passkey need, no mid-execution `pause:` step (LR-038 v2; LR-054 Table 2 covers click/fill/snapshot/state-load/network). |
| Auth lands on app (no Entra redirect — Gate 3) | ✅ PASS | `playwright-cli -s=e2e open <app>` → `state-load clients/encore/.auth/encore-state.json` → re-`goto` → `document.title` = "Location Settings \| Navigator" (AUTHED). State file mtime 2026-06-11 17:16 (fresh). |

## Empirical verification gate

- **Page/context**: single persistent `playwright-cli -s=e2e` session, headless, storageState `encore-state.json`. Shadow-piercing reads via recursive `treeWalker` deep-walk in `eval`/`run-code`; Playwright AX `snapshot` + `click`/`fill` pierce shadow automatically (LR-054, navigation row 63).
- **Network filter (LR-056)**: backend save endpoint is `PUT /navigator/api/location/update-properties` (captured live, see field-inventory `## Launcher dialogs`), NOT a page-URL substring. The `?_rsc=` GETs are Next.js RSC noise.
- **Per-TC baseline**: both target specs already carry per-test `ensureDefaultState()` in `beforeEach` (LR-019); this subplan adds a verify-only Pay To check + restore-anchored cleanup for the new save-cycle cases.

## Restore anchors frozen BEFORE any save (MANDATORY — Phase 1)

- **A (Pay To)**: `GET /navigator/api/location/1604` → `data.financial.payToId === 1` (`payToName "Encore"`). Name is ambiguous (≥2 "Encore" rows, IDs 1 & 4) → **ID-anchored restore only**.
- **B (Master Bill To)**: `data.billToAddress` = `{ address1: "8899 Beverly Blvd Ste 412", city: "WEST HOLLYWOOD", state: "CA", postalCode: "90048", country: "United States", id: "8ad746d8-ae4e-e611-abd6-005056ae089c" }`.

## Re-verification command (auditable)

```bash
playwright-cli -s=e2e open "https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location"
playwright-cli -s=e2e state-load clients/encore/.auth/encore-state.json
playwright-cli -s=e2e goto "https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location"
playwright-cli --raw -s=e2e eval "() => fetch('/navigator/api/location/1604',{headers:{accept:'application/json'},cache:'no-store'}).then(r=>r.json()).then(j=>'payToId='+j.data.financial.payToId+' billTo='+j.data.billToAddress.address1)"
# expected: payToId=1 billTo=8899 Beverly Blvd Ste 412
```

**PROCEED** — all gates green; anchors frozen.
