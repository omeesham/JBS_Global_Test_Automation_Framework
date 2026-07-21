# Phase 0 — Empirical Verification Verdict

**Plan**: `plans/pending/PLAN_FRAMEWORK_LIFECYCLE_NOTES_PILOT_V2.md`
**Date**: 2026-05-21 PM
**Author**: OWNER session under `/execute /relevant ultrathink`
**Companion**: `notes-pilot-baseline-2026-05-21.md` (Phase 0.4 per-TC baseline)

---

## 0.1 — Page-collision theory

**Check**: insert `console.log('PAGE-IDENTITY:', page === locationNotesPage.page, 'URL:', page.url())` into FCC-024 body; run `--retries=0 --grep "FCC-024"`.

**Output captured**:
```
PHASE0_PAGE_IDENTITY: false URL: about:blank
```

**Verdict**: **THEORY HOLDS**. The destructured `page` fixture IS a different Page object from `locationNotesPage.page`, AND it starts on `about:blank`. BUG-1 (page-collision) is structurally real.

---

## 0.2 — Context-options propagation (Council Flag 1 expanded)

**Check**: log viewport, locale, timezone from BOTH bare `page` and `locationNotesPage.page`.

**Output captured**:
```
PHASE0_CTX_OPTIONS_REAL: {"width":1920,"height":1080} en-US tz= America/New_York
PHASE0_CTX_OPTIONS_BARE: {"width":1920,"height":1080} en-US tz= America/New_York
```

**Verdict**: **THEORY REFUTED**. BOTH contexts have `viewport: 1920×1080`, `locale: en-US`, `timezoneId: America/New_York`. Playwright Test runner correctly propagates project `use:` config to manual `browser.newContext()` calls (the test runner intercepts the call and applies use: options).

**Plan-amend implication (per Phase 0 gate "Gap absent → A-4 scope shrinks")**:
- A-4 SHARED_CONTEXT_OPTIONS bundle (viewport/locale/timezoneId/permissions): **DROP from scope** — already correct in framework behavior.
- A-4 manual `tracing.start/stop`: see 0.3 below — also drop.
- The plan's "honest bug count = 7" (LR-046 strict line) is reduced to **6 distinct active bugs**: A-1 + A-2 + A-3 + A-5 + B + F. A-4 is REFUTED-EMPIRICALLY, not rescoped-via-APPEND.

---

## 0.3 — Trace fidelity for manual context

**Check**: run FCC-024 with `--trace=on`; inspect resulting `trace.zip` for real-app URLs.

**Output**:
- `trace.zip` size: 3.2 MB (sane content present)
- `1-trace.network` contains URLs from `https://cloudapps-e2e.encoreglobal.com/navigator/...` (real app)
- `1-trace.trace` records navigation to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` AND `about:blank` (both contexts captured in one trace stream)

**Verdict**: **AUTO-ATTACH WORKS**. The trace captures operations from BOTH the bare-page context and the authenticatedSession context. A-4's conditional `tracing.start/stop` wiring is unnecessary.

---

## 0.4 — TC-mapping baseline

See companion artifact: `notes-pilot-baseline-2026-05-21.md`.

**Summary**:
- 3 hard failures (FCC-024, FCC-025, FCC-029) — direct BUG-1 symptoms.
- 3 vacuous passes (FCC-026, FCC-027, TC-LOC-SSL-029) — BUG-1 present, masked by page-object cleanup or non-asserting listener.
- 1 app bug failure (FCC-022) — plan-classified `test.fixme()`.
- 1 unrelated pass (TC-LOC-NTS-009) — D-1 hydration race is preventive, not reactive.

---

## 0.5 — Final verdict

**PROCEED with one amendment**:

| Group | Original scope | Verdict | Notes |
|---|---|---|---|
| Phase 0 | empirical verification | DONE | this artifact + companion baseline |
| Group A-1 | rewrite 6 specs to drop bare `page` | PROCEED | confirmed by 0.1 + 0.4 |
| Group A-2 | extract `performSsoLogin` to auth-storage.ts | PROCEED | structural duplication still real |
| Group A-3 | hoist `stateMissing` check | PROCEED | structural waste still real |
| Group A-4 | SHARED_CONTEXT_OPTIONS bundle + tracing.start/stop | **DROP** | refuted by 0.2 + 0.3 — Playwright Test already correct |
| Group A-5 | try/finally around probe close | PROCEED | leak risk on validateState throw still real |
| Group B-1 | testMatch:[] on chrome/firefox/webkit + delete test:chrome | PROCEED | verified absent dependencies at config:96-115/140-147 |
| Group B-2 | testIgnore on chromium for locations + local-office | PROCEED | verified overlap |
| Group C-1 | page-topology logging in diagnosticsHandler | PROCEED | provides future BUG-1-class detection |
| Group C-2 | context-attached trace/video | DROP | merged into A-4 drop |
| Group D-1 | tab-readiness hydration race fix | PROCEED (preventive) | TC-009 currently passing; D-1 is stability guard |
| Group D-2 | URL-only tab guards → isOn<Tab>Tab() | PROCEED | 8 beforeEach sites verified |
| Group D-3 | scope getActiveTopLevelTab locator | PROCEED | verified `.first()` brittle pattern |
| Group D-4 | Notes pilot — 8 TCs to GREEN after A+B+C+D-1..3 | PROCEED-WITH-AMENDMENT | strict line "57 passed + 1 fixme" carries outcome-discovery risk on FCC-026/027 (vacuous → real); per LR-039 + feedback_failing_TC_as_bug_evidence_vehicle, fail-after-A1 = bug evidence, not re-plan |
| Group E | pre-commit lint guard | PROCEED | preventive |
| Group F | CI config consolidate (.ci.ts → .ts) | PROCEED-WITH-PRE-CHECK | grep CI files for divergent flags before consolidating |
| Stale-slop 1 | diagnostics-collector dedup (root copy delete) | PROCEED | root copy has zero importers per grep |
| Stale-slop 2 | commit deleted .playwright-cli snapshots | PROCEED | bundled with Group A PR |
| Stale-slop 3 | remove test:chrome npm script | PROCEED | bundled with Group B PR |
| Stale-slop 4 | delete dormant commonMethods/loginPage/homePage fixtures | PROCEED | zero spec usage |
| Stale-slop 5 | v1 BUG-9/10/11 — no separate action | NO-OP | already neutralized by Group B |

---

## Honest bug count (LR-046 strict line, updated)

**6 distinct active bugs, not 7**:
1. A-1 page fixture collision (3 hard fails + 3 vacuous passes per 0.4)
2. A-2 SSO duplication
3. A-3 cold-start wasted context
4. ~~A-4 manual newContext use: propagation gap~~ — **REFUTED EMPIRICALLY** (0.2 + 0.3)
5. A-5 probe context leak
6. B project matrix
7. F missing CI config

Plus the 3 spec-hygiene patterns (D-1/D-2/D-3), 1 observability capability (C-1), 1 lint guard (E), 5 stale-slop items.

---

## What to file as honest amend to the plan body

In `plans/pending/PLAN_FRAMEWORK_LIFECYCLE_NOTES_PILOT_V2.md`:
- Strike A-4 entirely (or convert to "VERIFIED-CORRECT — no action needed").
- Update Group A section heading: 4 active workstreams (A-1, A-2, A-3, A-5), not 5.
- Update the "Honest Bug Count" tail section: 6, not 7.
- Add cross-reference to this verdict artifact at the top of the plan.
