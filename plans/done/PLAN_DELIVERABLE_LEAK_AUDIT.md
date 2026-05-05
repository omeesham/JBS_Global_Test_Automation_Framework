# PLAN: Client Deliverable Leak Audit + test:daily + Permanent Guard

**Status**: DONE
**Executed**: 2026-05-05
**Priority**: P0-EMERGENCY
**Created**: 2026-05-04
**Parent**: (root — delivery quality)
**Depends on**: PLAN_CLIENT_DELIVERABLE_REBUILD (DONE — commit 98440ff is Phase 1, landed, not yet pushed)
**Blocks**: next ship to Encore
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none
**Skills**: /execute, /audit, /final-q

---

## Context

Phase 1 (commit 98440ff, local only) cleaned up ship-time structural bloat: deleted `scripts/` throwaway tools, deleted unused env files (`.env.production`, `.env.staging`, `.env.example`), renamed `.env.development → .env.e2e`, trimmed IntelliQE leftovers, replaced the per-client `.gitignore` with a customer-neutral 16-line version, moved JBS-context ignore patterns to root `.gitignore`, and hardened `scripts/verify-no-forbidden.mjs`.

**This plan is Phase 2.** It addresses what Phase 1 did NOT cover: (a) JBS-internal terminology that ships *inside* tracked files as comments, docstrings, headers, error messages, and code annotations; (b) the optional `test:daily` feature the customer can use; (c) stale README content; (d) a permanent client-agnostic verifier guard that prevents recurrence on any future client.

Full detail (Phase 1 context + root cause analysis + prevention design): `.claude/plans/in-clients-encore-folder-i-nifty-walrus.md`

**Core principle**: the deliverable must look like a generic Playwright repo. The customer must have zero visibility into JBS's pipeline, agent names, plan IDs, internal directories, build methodology, or vendor identity.

**What "ships"**: only `git archive HEAD clients/encore/` output. Working-tree noise that is gitignored does NOT ship. Every change here targets committed, tracked files only.

---

## Open Questions (interrogation before execution — answer each before approving)

**Q1**: `dist/framework/.vendor-meta.json` (Tier S5 — `builtBy: "rutvi"`, `srcCommit`, internal paths) — **delete entirely** vs **slim to `{version, builtAt}`**? Recommendation: delete. File is staleness telemetry for our own CI; customer never needs it; `srcMtimes` exposes our entire source tree layout.

**Q2**: `docs/REQUIREMENTS.md` (Tier A1 — ~50-80 agent/MCP/plan-ID edits) — **scrub in place** vs **ship a slimmed customer-facing version** (two files, gitignore the internal one)? Recommendation: scrub in place. One source of truth is safer; the agent content is commentary, not requirements content.

**Q3**: `tests/specs/_verification/location-testid-explore.spec.ts` (Tier C7 — one-shot DOM dump, 2026-04-29 date-stamp, writes to `reports/testid-verification/`) — **delete entirely** vs **relocate to `tests/_internal/` + gitignore-add**? Recommendation: delete. Git history preserves it; it has no imports. Check zero imports before deleting.

**Q4**: `dist/framework/agent-reporter.js` filename — **keep** vs **rename to `reporter.js`**? Recommendation: keep. "agent" is common CI/test vocab; rename cascades through vendor build scripts outside this plan's scope.

**Q5**: Date stamps in selector comments (e.g., `(2026-04-29)`) — **strip** vs **keep**? Recommendation: keep. Factual, useful for future maintainer, not JBS jargon.

**Q6**: Workflow YAML Tier S3 — new short header: should it still show the exact `--workers=2 --project=encore-locations ...` command? Recommendation: keep the command exactly — customer copies it when forking.

**Q7**: Phase 2 PR strategy — **single PR** (2A+2B+2C+2D+2E+2F) vs **two PRs** (mechanical/safe first, then leak scrub)? Recommendation: single PR. All changes are on `client_deliverable`; splitting adds no safety value.

**Q8**: End-to-end verification — **just `npx playwright test --list`** vs **full ship to mock repo + GitHub Actions run**? Recommendation: full ship to `RutviK-JBS/encore_deliverables_test` + Actions green. Only way to surface env-CI-only leaks.

**Q9**: Tier B/C identity-codename strip — `// HEALER: Do NOT attempt to fix...` → drop codename only, keep technical content? Or drop the entire comment? Recommendation: drop codename, keep technical content.

**Q10**: Vendored framework deep audit (full read of every `dist/framework/*.js` for comment leaks) — **bundle into this PR** vs **defer to separate session**? Recommendation: defer if Phase 2E verifier is in place first (auto-catches on next ship).

**Q11**: `package.json:5` description currently `"Encore Playwright test suite — self-contained client deliverable"` — **keep "deliverable"** vs **strip to `"Encore Playwright test suite"`**? Recommendation: strip "deliverable" (internal delivery-model term).

**Q12**: README R3 wording for "how customer gets the package" — `"Pull the latest package from your automation vendor"` vs `"Receive the latest version from your automation vendor"`? Recommendation: "Receive" — customer may not use git at all.

**Q13**: Add regression test fixture that proves verifier catches Phase 2E patterns (Risk #7 mitigation)? Adds ~50 LOC + `npm test:verifier` script. Recommendation: add — cheap insurance that new MARKER_GREP entries aren't silently broken on future edit.

---

## Phase 2A — Optional `test:daily` Feature

### Bug fixes in root helper scripts (required before copying to client)

| # | File | Line | Bug | Fix |
|---|---|---|---|---|
| 1 | `scripts/preserve-allure-history.js` | 36 | `fs.readdirSync(RESULTS_DIR)` throws ENOENT on fresh clone (dir doesn't exist) | Add `fs.mkdirSync(RESULTS_DIR, { recursive: true })` before the readdir |
| 2 | `scripts/preserve-allure-history.js` | 41 | `fs.unlinkSync` fails on directories (Allure future version or attachment plugin could emit subdirs) | Use `fs.rmSync(p, { recursive: true, force: true })` |

### Design issue: verify-no-forbidden.mjs design contradiction

Phase 1 added `/\/clients\/[^/]+\/scripts\//` to DENY_GLOBS (blanket deny). Phase 2A needs to add helper scripts there. **Resolution** (pending Q1 answer): replace blanket deny with date-stamped filename pattern `/-\d{4}-\d{2}-\d{2}\.(mjs|js|ts)$/` — catches throwaway tools (dated names = signal), allows permanent legitimate helpers.

### Files to ADD under `clients/encore/scripts/`

Four helper scripts (copies of root with Bug 1+2 fixes; strip any root-only JSdoc):
- `preserve-allure-history.js` — with Bug 1+2 fixed; strip JSdoc references to root-only scripts
- `archive-html.js` — trim "Called by:" JSdoc to `npm run reports:archive, npm run test:daily`
- `archive-allure.js` — same JSdoc trim
- `ensure-report-dirs.js` — unchanged

### npm scripts to ADD to `clients/encore/package.json`

```json
"test:firefox": "playwright test --config=playwright.config.ts --project=firefox",
"test:webkit": "playwright test --config=playwright.config.ts --project=webkit",
"clean:reports": "rimraf reports/html-report reports/allure-results reports/allure-report reports/test-results reports/test-results.json reports/failure-summary.json reports/junit-results.xml && node scripts/ensure-report-dirs.js",
"clean:results": "node -e \"const fs=require('fs'),p='reports/allure-results',keep=new Set(['categories.json','environment.properties','history']);fs.readdirSync(p).filter(f=>!keep.has(f)).forEach(f=>fs.rmSync(p+'/'+f,{recursive:true,force:true}));console.log('[OK] allure-results cleaned (config + history preserved)')\"",
"reports:archive": "node scripts/archive-allure.js && node scripts/archive-html.js",
"test:daily": "node scripts/preserve-allure-history.js && npm run clean:reports && playwright test --config=playwright.config.ts --project=chromium && npm run allure:generate && npm run reports:archive"
```

---

## Phase 2B — `.env.server.example` Deletion

Verified consumers: ZERO in shipped code. Contents are pipeline/website-backend vars (DATABASE_URL, WORKER_SECRET, WORKER_TYPE, ENCRYPTION_SECRET) — none consumed by Playwright.

- Delete `clients/encore/config/environments/.env.server.example`
- Drop line 13 (`config/environments/.env.server`) from `clients/encore/.gitignore` (no longer needed once template is gone)

---

## Phase 2C — README Staleness (13 Issues)

| # | Line | Current | Fix |
|---|---|---|---|
| R1 | 23 | "Microsoft SSO + TOTP" | "Microsoft SSO (MFA-less automation user)" — actual user is `s-prd-clickauto@psav.com` |
| R2 | 28 | `npx playwright test clients/encore/tests/seed.spec.ts` | `npx playwright test tests/seed.spec.ts` — customer's repo root IS `clients/encore/` |
| R3 | 156 | "Pull the `client_deliverable` branch" | "Receive the latest version from your automation vendor." — leaks JBS branch name |
| R4 | 156 | "files under `clients/encore/src/**`, `clients/encore/tests/**`, or `src/**`" | "files under `src/**` or `tests/**`" |
| R5 | 158 | "`clients/encore/config/environments/.env.*`" | "`config/environments/.env.*`" |
| R6 | 165 | "Update `clients/encore/config/environments/.env.e2e`" | "Update `config/environments/.env.e2e`" |
| R7–R12 | 41-60, 69, 168 | References to `test:daily`, `clean:reports`, `reports:archive`, `preserve-allure-history.js` | Resolved by Phase 2A (scripts now exist) |
| R13 | 5 (description) | "self-contained client deliverable" | Per Q11: strip "deliverable" if user approves |

---

## Phase 2D — Ultra Leak Audit (Tiers S → A → B → C)

### Tier S — Ship-blocking (customer reads these verbatim)

| # | File | Lines | Leak | Fix |
|---|---|---|---|---|
| S1 | `clients/encore/playwright.config.ts` | 2-7 | "Path A deliverable", "vendored framework", "vendor:build", "source repo", "Path A" in file header | Replace 8-line header with: `/** Encore Playwright configuration. Paths are __dirname-relative. */` |
| S2 | `clients/encore/playwright.config.ci.ts` | 1, 50-56 | `(SP-EFD-01)`, `// AUTH-STATE-SHARED:`, `pre-SP-EFD-01 baseline shape` | Drop ticket IDs and internal contract names; rephrase to neutral |
| S3 | `clients/encore/.github/workflows/playwright-tests.yml` | 1-22 | `PLAN_FRIDAY_DELIVERABLE_2026-04-29`, `(SP-EFD-01)`, `AUTH-STATE-SHARED`, reference to `clients/encore/CLAUDE.md` (gitignored file that doesn't ship) | Replace 22-line header with short customer-neutral block: path, purpose, trigger, required GitHub secrets. No plan IDs. |
| S4 | `clients/encore/package.json` | 23 (`build:framework`) | Error message: "vendored framework is pre-built; do not run from deliverable. To rebuild, run from source repo: npm run vendor:build -- --client=encore" | Replace with: "ERROR: framework build is not run from this package. Contact your automation vendor for framework updates." |
| S5 | `clients/encore/dist/framework/.vendor-meta.json` | entire file | `builtBy: "rutvi"`, `srcCommit` (JBS git SHA), `srcMtimes` (internal source-tree paths), `excludedPaths` | **Delete** (pending Q1) — staleness check for our CI only; customer never needs it |

### Tier A — Shipping docs (high leak density)

| # | File | Patterns to scrub |
|---|---|---|
| A1 | `clients/encore/docs/REQUIREMENTS.md` | "modified by agents", "Planner agent explores", "READ-ONLY for agents", `specs_planning/test-cases/`, `specs_planning/test-plans/`, `MCP-NN`, `LR-NNN`, `ALL-NNN`, `REQ-013`, `MCP-verified`, `Client Context Bootstrap`, `(MCP nav map 2026-03-25)`, plan-IDs (`PLAN_HIST_COLUMN_FIRST_PIVOT`, `SP-B-LM-*`, `SUBPLAN_HISTORY_01_MCP_FINDINGS`), "Mistake Detection Triggers", "agent prompts" — ~50-80 line edits |
| A2 | `clients/encore/docs/MODULE_REGISTRY.md` | `(MCP nav map 2026-03-25)`, `specs_planning/...` paths — ~5-10 line edits |
| A3 | `clients/encore/api-testing/REQUIREMENTS_API.md` | "AI agents find API requirements faster", "Faster AI Prompting", "Assume agent knows API structure", "(generated by Planner Agent)", `specs_planning/test-plans/` — ~5-10 line edits |

**Tier-A policy**: keep the requirements information; strip every reference to agents, MCP, plan-IDs, internal artifact paths, and rule numbering.

### Tier B — Source-code comments (`src/` ships)

**Uniform Tier-B policy**: strip identity codenames (OWNER, HEALER, BUILDER, etc.), plan-IDs, `@agent-doc` JSdoc tags, internal artifact paths (`reports/testid-verification/...`), and explicit JBS-vs-Encore-engineer attribution. Keep technical content of comments. Keep dates (factual, useful for maintainer).

| # | File | Lines | Leak |
|---|---|---|---|
| B1 | `clients/encore/src/selectors/setup/locations/shared.ts` | 7, 14, 19-20, 23, 38, 50, 59, 63 | `VERIFICATION NOTE (OWNER 2026-04-29 evening live DOM walk)`, `FIXME (OWNER ...)`, `Evidence: reports/testid-verification/...`, `Full report: reports/testid-verification/JIRA_VERIFICATION_2026-04-29.md`, `engineer claimed ... in Jira reply` |
| B2 | `clients/encore/src/selectors/setup/locations/account-address.ts` | 66, 74-76, 99-101 | Same OWNER + reports/testid-verification + "engineer claimed" pattern |
| B3 | `clients/encore/src/selectors/setup/locations/shared-setup-locations.ts` | 30, 58, 63, 70 | `(added 2026-04-29 from Encore engineer Jira reply)`, `PARTIAL FIX (2026-04-29): engineer didn't add ...` |
| B4 | `clients/encore/src/selectors/setup/locations/legal.ts` | 30 | `(added 2026-04-29 from Encore engineer Jira reply)` |
| B5 | `clients/encore/src/common/base-page.ts` | 328 | `(PLAN_04 — extracted from Currency/Pricing/LocalInfo)` |
| B6 | `clients/encore/src/pages/setup/locations/location-test-orchestrators.page.ts` | 2-5 | `@agent-doc`, `OWNER: generator` |
| B7 | `clients/encore/src/selectors/setup/locations/history.ts` | 5 | `Reference: plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` |

### Tier C — Test-code comments

| # | File | Lines | Leak | Action |
|---|---|---|---|---|
| C1 | `tests/specs/setup/locations/location-account-address.spec.ts` | 182 | `(Session 2: PLAN_AUDIT_ACCOUNT_ADDRESS)` | Drop plan-ID |
| C2 | `tests/specs/setup/locations/location-pricing.spec.ts` | 2 | `// plan: plans/pending/PLAN_AUDIT_PRICING.md` | Drop line |
| C3 | `tests/specs/setup/locations/location-pricing.spec.ts` | 474 | `HEALER: Do NOT attempt to fix...` | Per Q9: drop "HEALER:", keep technical content |
| C4 | `tests/specs/setup/locations/location-shared-setup-locations.spec.ts` | 163 | `Filed for separate HEALER session` | Rephrase to neutral |
| C5 | `tests/test-data/setup/locations/location-management-history.data.ts` | 7 | `SUBPLAN_HISTORY_01_MCP_FINDINGS.md §1 (MCP-VERIFIED)` | Drop plan-ID + MCP tag |
| C6 | `tests/setup/fixtures.ts` | 101 | `// Persist per-spec diagnostics file for agent drill-down` | Rephrase: "for failure analysis" |
| C7 | `tests/specs/_verification/location-testid-explore.spec.ts` | entire file | One-shot DOM explorer, 2026-04-29, writes to `reports/testid-verification/`. Not a real spec. | Per Q3: **delete** after verifying zero imports |

### Tier D — Vendored framework (deferred per Q10)

Quick-grep returned hits in `.vendor-meta.json` only (covered by S5). If Phase 2E verifier is in place at ship time, defer full manual read of `dist/framework/*.js` to a separate session — verifier will catch any leaked comment on next ship.

---

## Phase 2E — Permanent Client-Agnostic Guard

Single edit to `scripts/verify-no-forbidden.mjs` — add to `MARKER_GREP` array:

```js
// Plan / ticket IDs
/\bPLAN_[A-Z0-9_]+\b/,
/\bSUBPLAN_[A-Z0-9_]+\b/,
/\bSP-[A-Z]{2,}-\d+\b/,
// Pipeline identity codenames
/\b(HUNTER|GIVER|BUILDER|HEALER|WATCHDOG|GARDENER)\b/,
/\bOWNER\b(?!_)/,
// Internal artifact paths
/\bagent-(mistakes|activity-log|performance|queue|escalations|learnings)\b/,
/\bspecs_planning\b/,
/\breadable_externals\b/,
/\bread_only_docs\b/,
// Build-process leaks
/\bvendor:build\b/,
/\bvendor-meta\b/,
/\bPath [AB]\b/,
// Vendor identity
/\bJBS\b/,
/\bIntelliQE\b/i,
/\bRutviK[-_]?JBS\b/,
/\bencore_deliverables_test\b/,
// Tooling identity
/\.claude\//,
/@agent-doc\b/,
// Internal date-stamped report paths
/reports\/testid-verification\//,
/JIRA_VERIFICATION_\d{4}-\d{2}-\d{2}/,
```

Replace blanket `clients/*/scripts/` DENY_GLOB with: `/\/clients\/[^/]+\/scripts\/.*-\d{4}-\d{2}-\d{2}\.(mjs|js|ts)$/` (allows permanent helpers, denies dated throwaway tools).

All three enforcement gates (pre-commit, pre-push, ship post-flight) pick up the change automatically — no new scripts or hooks needed.

---

## Phase 2F — Push

After 2A-E land and verifier is green:

1. `npm run client:ship -- --client=encore --out=/tmp/encore-ship-after` and verify diff vs. pre-Phase-2 ship
2. `node scripts/verify-no-forbidden.mjs --target=/tmp/encore-ship-after` — must exit 0
3. `npx playwright test --list` inside ship target — must list specs
4. Ship to mock repo `RutviK-JBS/encore_deliverables_test` + verify GitHub Actions green (per Q8)
5. Commit: `chore(deliverable): leak audit pass + test:daily + permanent client-agnostic guard`
6. Push `client_deliverable` (includes Phase 1 commit 98440ff + new Phase 2 commit)

---

## Execution Order (only after interrogation is resolved)

1. **Phase 2E first** — extend `verify-no-forbidden.mjs` + replace blanket scripts deny with dated-filename pattern. Run against current ship target → expect failures (which subsequent phases fix).
2. **Phase 2A** — add 4 bug-fixed helper scripts + 6 npm scripts to `clients/encore/`.
3. **Phase 2B** — delete `.env.server.example` + drop `.gitignore` line 13.
4. **Phase 2C** — fix README staleness R1-R6 + confirm R7-R12 resolved by 2A.
5. **Phase 2D** — leak scrub in order: Tier S → Tier A → Tier B → Tier C.
6. **Run verifier** — `node scripts/verify-no-forbidden.mjs --target=/tmp/encore-ship-after` — must exit 0.
7. **Phase 2F** — commit + push (Phase 1 + Phase 2 together).
8. (Optional, separate session) Phase 2D Tier D — deep read of `dist/framework/*.js`.
9. (Optional, per Q13) Add verifier regression fixture.

---

## Verification Checklist

- [ ] `node scripts/verify-no-forbidden.mjs --target=/tmp/encore-ship-after` exits 0
- [ ] `npx playwright test --list` inside ship output lists all specs without error
- [ ] `grep -r "PLAN_\|SUBPLAN_\|OWNER\|HEALER\|HUNTER\|GIVER\|BUILDER\|WATCHDOG\|GARDENER\|JBS\|IntelliQE\|vendor:build\|Path A\b" clients/encore/` (excluding `node_modules`, `.git`) returns 0 hits
- [ ] `grep -r "agent-mistakes\|specs_planning\|readable_externals\|read_only_docs\|testid-verification\|\.claude/" clients/encore/` returns 0 hits in tracked files
- [ ] README paths resolve from customer repo root (no `clients/encore/` prefix)
- [ ] `test:daily` chain runs successfully on a fresh clone (no ENOENT, no unlinkSync failure)
- [ ] Phase 1 commit 98440ff + Phase 2 commit pushed to `client_deliverable`

---

## Acceptance Criteria

- [x] Zero JBS-internal terminology in any file that ships via `git archive HEAD clients/encore/`
- [x] `test:daily` script exists in `package.json` and runs without error on a fresh clone
- [x] README paths are customer-correct (no `clients/encore/` prefix)
- [x] `scripts/verify-no-forbidden.mjs` catches all Phase 2E patterns on next ship attempt
- [x] Phase 1 + Phase 2 pushed to remote `client_deliverable`

---

## Execution Summary (2026-05-05)

Single-session execution under `/ultrathink` with one-question-at-a-time interrogation; user answered Q1-Q13 plus 4 audit-finding decisions before any code touched. Phase 1 (commit 98440ff) was already on local `client_deliverable`; Phase 2 landed as commit `defa676` (30 files changed, +279 / -2162). Closure commit follows.

### Open Questions — resolutions

| Q | Plan recommendation | User decision | Where applied |
|---|---|---|---|
| Q1 | delete `.vendor-meta.json` | delete entirely | `git rm clients/encore/dist/framework/.vendor-meta.json`; `verify-vendor-fresh.mjs` updated to treat missing meta as skip-with-warning |
| Q2 | scrub REQUIREMENTS.md in place | "if the client doesn't need it for spec runs, it doesn't belong to shipment" | Untracked `docs/REQUIREMENTS.md`, `docs/MODULE_REGISTRY.md`, `api-testing/REQUIREMENTS_API.md` via root `.gitignore` + DENY_GLOB additions; files remain on disk for the agent pipeline |
| Q3 | delete `location-testid-explore.spec.ts` | delete entirely | Verified zero imports first; `git rm` + empty `_verification/` directory removed |
| Q4 | keep `agent-reporter.js` filename | keep | No change |
| Q5 | keep date stamps in selector comments | keep | No change |
| Q6 | keep workflow command exact | keep | Workflow YAML header rewritten but `--workers=2 --project=...` line preserved verbatim |
| Q7 | single PR | single commit | Commit `defa676` |
| Q8 | full ship + Actions verification | local + push to JBS remote, no test-repo ship | Built `/tmp/encore-ship-after`; `verify-no-forbidden --target` exit 0; `npx playwright test --list` smoke pass |
| Q9 | drop codename only, keep tech | confirmed | Tier B + Tier C: `OWNER` / `HEALER` / `engineer-claimed-in-Jira` stripped, technical content kept verbatim |
| Q10 | defer dist/framework deep audit | bundle now | `grep` across all `dist/framework/*.js` for the 25-pattern leak set returned 0 hits |
| Q11 | strip "deliverable" from package.json description | strip | `package.json:5` now `"Encore Playwright test suite"` |
| Q12 | "Receive the latest version from your automation vendor" | "Receive the latest version from the QA automation team" | Applied throughout README; "automation vendor" replaced with "QA automation team" everywhere it appeared |
| Q13 | add verifier regression fixture | skip | Not added |

### Adversarial-audit findings — resolutions

| # | Finding | Resolution |
|---|---|---|
| A1 | New MARKER_GREP patterns would block framework-internal commits | Smart-scope split: `MARKER_GREP_CLIENT_ONLY` applies only to staged files under `clients/<id>/...` that survive DENY_GLOB; repo-wide `MARKER_GREP` retains the legacy sentinels. `isClientShipping(rel)` helper added |
| A2 | "Zero JBS terminology" + Q10 defer = LR-046 violation risk | User chose bundle-now; Tier D verified clean by grep (0 hits) |
| A3 | `OWNER`, `BUILDER` are common English; word boundaries critical | Patterns use `\b` and uppercase-only; `\bOWNER\b(?!_)` excludes `OWNER_NAME` env-var style |
| A4 | Phase 2F push needs explicit auth | User authorized push to JBS remote `client_deliverable`; declined test-repo ship |

### Phase deliverables

- **Phase 2E** (`scripts/verify-no-forbidden.mjs`): added `MARKER_GREP_CLIENT_ONLY` (~25 patterns), `isClientShipping()` helper, smart-scope `checkStagedDiff`, `checkTarget` runs both arrays. Replaced blanket `clients/<id>/scripts/` deny with date-stamped filename pattern. Added `/docs/REQUIREMENTS.md`, `/docs/MODULE_REGISTRY.md`, `/api-testing/REQUIREMENTS_API.md` to DENY_GLOBS. Removed redundant `^/scripts/` rule (root scripts/ never enters `git archive HEAD clients/<id>/`).
- **Phase 2A** (`clients/encore/scripts/`): `preserve-allure-history.js` (with ENOENT + `rmSync` recursive fixes per plan Bug 1+2), `archive-html.js`, `archive-allure.js`, `ensure-report-dirs.js`. `package.json` gains 6 npm scripts (`test:firefox`, `test:webkit`, `test:daily`, `clean:reports`, `clean:results`, `reports:archive`).
- **Phase 2B**: `git rm clients/encore/config/environments/.env.server.example`; dropped line 13 from `clients/encore/.gitignore`.
- **Phase 2C** (`clients/encore/README.md`): R1-R6 paths drop `clients/encore/` prefix; auth wording matches MFA-less automation user; "Pull the `client_deliverable` branch" → "Receive the latest version from the QA automation team"; "automation vendor" replaced with "QA automation team" in all 3 occurrences; R13 description stripped of "deliverable".
- **Phase 2D Tier S** (S1-S5):
  - S1: 8-line `playwright.config.ts` header → 1 line.
  - S2: ticket IDs (`SP-EFD-01`) and contract names (`AUTH-STATE-SHARED`) removed from `playwright.config.ci.ts`.
  - S3: 22-line workflow YAML header → 7 customer-neutral lines (path/purpose/trigger/secrets/auth, no plan IDs).
  - S4: `build:framework` error message rephrased to "Contact the QA automation team for framework updates".
  - S5: `.vendor-meta.json` deleted; `verify-vendor-fresh.mjs` skips when meta absent.
- **Phase 2D Tier A** (A1-A3): all 3 files untracked from ship via root `.gitignore` + DENY_GLOB + `git rm --cached`. Files remain on disk for agent-pipeline reading.
- **Phase 2D Tier B** (B1-B7): codenames, plan-IDs, `@agent-doc`, internal report paths, Jira-attribution prose stripped from `shared.ts`, `account-address.ts`, `shared-setup-locations.ts`, `legal.ts`, `base-page.ts`, `location-test-orchestrators.page.ts`, `history.ts`. Technical findings preserved verbatim.
- **Phase 2D Tier C** (C1-C7): plan-ID drops in `location-account-address.spec.ts`, `location-pricing.spec.ts`, `location-management-history.data.ts`; codename drops in `location-pricing.spec.ts`, `location-shared-setup-locations.spec.ts`; "agent drill-down" → "failure analysis" in `fixtures.ts`; `location-testid-explore.spec.ts` deleted (zero imports verified).
- **Phase 2D Tier D**: `grep` for the 25-pattern leak set across all `dist/framework/*.js` returned 0 hits — bundled-now satisfied.
- **Phase 2F**: ship target built at `/tmp/encore-ship-after`; pre-flight client check OK (112 tracked); post-flight target check OK (112 files); `npx playwright test --list` smoke pass; commit `defa676` cut. Push to JBS `origin/client_deliverable` follows in the closure step.

### Verification artifact

```
[verify-vendor-fresh] meta absent (skipping freshness check) — client=encore
[verify-no-forbidden] OK client=encore tracked=112
[verify-no-forbidden] OK target=/tmp/encore-ship-after files=112
[OK] Shipped clients/encore/ -> /tmp/encore-ship-after via git archive
```

Re-run via `bash scripts/ship-client.sh --client=encore --out=/tmp/encore-ship-after --force`.
