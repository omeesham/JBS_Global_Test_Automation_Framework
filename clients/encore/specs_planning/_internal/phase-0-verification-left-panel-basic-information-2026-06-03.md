---
module: left-panel-basic-information
phase: 0 (dependency + browser-tool + empirical-verification gate)
date: 2026-06-03
identity: OWNER→WATCHDOG
subplan: plans/pending/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md
verdict: PROCEED
---

# Phase 0 Verification — Left Panel (Basic Information)

> Note: subplan body dated artifacts `-2026-06-01`; execution slipped to **2026-06-03**.
> All artifacts created this session use the real session date 2026-06-03 (backdating
> would falsify MCP_Session_Date + fail `check:fieldinventory-staleness` + LR-037
> activity-log mtime gate). Tracked plan-deviation #1.

## 1. Dependency gate (GATE-D0)

| Check | Result | Evidence |
|---|---|---|
| `SUBPLAN_NOTES_FCC_PILOT.md` Status DONE (paradigm infra shipped) | PASS | grep `**Status**: DONE` line 3 |
| `field-case-runner.ts` exports `saveAndVerifyCase` | PASS | `export async function saveAndVerifyCase` line 43 |
| No pre-existing `location-left-panel*.spec.ts` (net-new) | PASS | Glob `specs/**/location-left-panel*.spec.ts` → 0 files |
| Local run uses `.env.local`, never `CI_ENV=e2e` (LR-ENC-003) | PASS | setup project loaded `local` env, creds `s-prd-clickauto@psav.com` |

## 2. Browser tool decision (LR-038 v2 / LR-054)

**Browser tool: Playwright CLI.** Reason: catalog walkthrough of 14 fields + 5 dropdowns
(incl. Region/Servicing-Branch large dropdowns) + Country cascade, unattended, no MFA
(`clients/encore/CLAUDE.md` — automation user has no second-factor). LR-054 Table 2 confirms
`open`/`goto`/`click`/`fill`/`select`/`snapshot`/`eval`/`state-load`/`tracing-start` all available.
`playwright-cli` v0.1.8 installed GLOBALLY (`playwright-cli --version` → 0.1.8).

## 3. Empirical verification (nested-orbit v2 Phase 0)

| Check | Finding |
|---|---|
| **Auth freshness (decisive)** | Stored state was **STALE** — `state-load` + `goto` bounced to `/navigator/auth/sign-in` (2 runs, both orderings). Refreshed via canonical `setup` project (`npm test --prefix clients/encore -- --project=setup`): headless MS-SSO login as `s-prd-clickauto@psav.com` → authed to `/navigator/locations/1604/home`, fresh state written to `clients/encore/.auth/encore-state.json`, session+csrf cookies validated unexpired. User-authorized autonomous re-login per `clients/encore/CLAUDE.md` §"When encore needs fresh login session". |
| **SPA settle (false-negative guard)** | next-auth resolves session async — CLI `eval` of `window.location.href` immediately post-`goto` transiently returns `/auth/sign-in`; after settle it returns `/navigator/locations/1604/home`. **Mandate: poll for settled content before asserting** (reference_playwright_cli_and_subagent_limits + feedback_browser_interaction_verify_first). |
| **Shadow-root piercing** | Location Settings content lives in `<next-location-settings>` shadow root (registry row 92). CLI `eval` must deep-query-pierce; Playwright `click`/`fill`/`snapshot` pierce automatically. |
| **Page-collision / context isolation** | CLI named session `-s=encore` is a single persistent browser; per-test isolation in specs is handled by `storageState` (shared, read-only) + per-test `ensureDefaultState` baseline reset, not by the walk session. |
| **Per-TC baseline availability** | `ensureDefaultState` whole-cycle retry+throw pattern proven at `location-legal.page.ts:161-198` + `location-account-address.page.ts` (commit 5c081c9) — reusable for the Country-cascade state-leak guard (F3). |
| **Trace fidelity** | `playwright-cli tracing-start`/`tracing-stop` + `--retries=0 --workers=1` spec runs available for RCA. |

## 4. Verdict

**PROCEED.** Dependencies satisfied; CLI browser authenticated and confirmed reaching the
live app (office 1604); shadow-root + settle + cascade-cleanup risks identified with mitigations.
Proceed to Phase 0.5b (old-site baseline walk).
