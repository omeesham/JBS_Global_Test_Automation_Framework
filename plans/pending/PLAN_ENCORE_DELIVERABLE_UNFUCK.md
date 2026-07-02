---
Status: In-Progress
PermissionMode: default
BrowserTool: cli
Identity: HEALER (phases 1-3 specs/page-objects) → GARDENER (phase 4 hygiene, phase 5 gates) → OWNER (phase 6 report)
Origin: ~/.claude/plans/beforeeach-at-line-491-fluttering-nygaard.md (full verdict-matrix adjudication lives there)
ExecutionMode: FULL autonomous foreground — live-app = oracle (fix to match reality + log), commit locally per phase, NEVER push/ship, one review at end
Progress: clients/encore/specs_planning/_internal/UNFUCK_PROGRESS.md · Deviations: UNFUCK_DEVIATIONS.md
---

# PLAN: Encore Deliverable Unfuck — Verified Findings, RCA, Remediation

## Bootstrap (read before executing)
- Repo: `C:\Users\rutvi\projects\encore_framework`; client surface: `clients/encore/` (self-contained Playwright/TS suite for Navigator Cloud).
- Creds: `clients/encore/.env.local` (gitignored, NEVER commit). Run: `npm test -- --grep "<id>"` from `clients/encore/`. NEVER `CI_ENV=e2e` locally (LR-ENC-003).
- Live app: `cloudapps-e2e.encoreglobal.com`, test office 1604 (1605 multi-currency, 1607 has pricing dropdown data, 1101 corporate master).
- Ship discipline: LR-049 — deliver only via `git archive`/`client:ship`, never `cp -r`. LR-058 — no internal jargon in shipped `clients/encore/` files (this plan lives at repo root, exempt).
- Orchestration: OWNER orchestrates; cheapest-capable tier applies mechanical diffs (Haiku), the tier above reviews the actual diff, Opus owns every live spec run + RCA + disposition. The tier that writes a fix never signs it off (AUD-017).

## Context
Commit `ff4642fc` wired per-test `beforeEach` baseline resets but broke the SSL-013→014→015 chain (the `ensureCleanSSLTable` reset wipes SSL-013's unsaved row). A third-party (Copilot) audit produced ~150 claimed findings + a testid sweep. This session re-verified EVERY enumerated claim (6 read-only subagents + orchestrator re-reads), ran the RCA, and produced this remediation covering 100% of surviving findings (strict line — nothing dropped; external-dependency items become report-to-Encore actions).

## RCA one-liner
The SSL beforeEach was verified only by a bounded smoke (`--grep ACC-017|NTS-001|SSL-001`, 4 passed — documented in activity-log row 83), but the governing plan required the FULL `location-shared-setup-locations` run. Narrowing to SSL-001 (which can't hit the 013→015 chain) without a documented deferral (LR-046/LR-060 gap) let the break ship. Every automated gate is structural regex and cannot see a runtime chain break.

## Per-Identity Satisfaction (LR-048 v2)
| Identity | Scope in this plan | Concrete Deliverable |
|---|---|---|
| HEALER | Phases 1-3 — spec + page-object fixes, live verification | edited spec/page-object files + green live runs per phase |
| GARDENER | Phase 4 hygiene + Phase 5 anti-recurrence gates | removed sleeps/dead code; authored/wired 13 flag+block gates fail-green |
| OWNER | Phase 6 testid report + plan governance | `testid-gap-report-2026-07-02.md` + activity-log rows + /final-q |
| GIVER | (none) — no new test-plan authoring | (skipped: this is remediation of existing specs, not new intake) |
| BUILDER | (none) — no net-new spec generation from test cases | (skipped: fixes to existing specs only) |
| HUNTER | (none) — no requirements/baseline intake | (skipped: no new module) |
| WATCHDOG | post-execution audit gate | Phase-3.5 audit: every deliverable DONE / refuted-with-proof / MODIFIED-with-justification |

## Remediation Plan (every surviving ID mapped; nothing dropped)

### Phase 1 — P0 active breakage — HEALER  [EDITS DONE, VERIFYING+COMMIT]
1. **H-1 (D2)**: SSL-014 + SSL-015 self-contained (each adds its own unsaved 1099 row via clickAdd→searchInDialog→poll→selectFirstDialogRow→clickDialogSelect); `dependencyGate([])`; SSL-001 redundant in-body reset removed (**R1**).
2. **L7**: BAS-065/067 reconciled against live app — clearing Return offset persists EMPTY (not re-defaulted to '1'); +in-test cleanup restore.
3. **L11**: DET-018 — a New-Price-only edit enables Save; Max-Discount workaround removed.
4. **Verify (LR-018)**: SSL-001/013/014/015 + BAS-065/066/067 + DET-018 individually, `--workers=1 --retries=1`.

### Phase 2 — P1 reset-integrity & swallowed failures — HEALER (page objects)  [5/11 DONE]
5. **H-5+C-1+P-5+NEW-1-nuance** (DONE): `saveAndVerifyPersisted` per-attempt try/catch + session guard (`isAuthUrl`) + failure trail.
6. **L3/LR-056** (DONE): `clickSaveWithDialog` network listener filters `/navigator/api/` endpoints only.
7. **H-6** (DONE): notes reload += `waitForAngularStable` both sides of tab click.
8. **H-7** (DONE): override `saveAndConfirm` `Log.warn` on toast-timeout (return stays void).
9. **C-4** (DONE): `waitForPricingDataLoaded` throws only when BOTH grid + dropdown signals fail.
10. **NEW-2** (verify): confirm `saveAndVerifyCase` runs `baseline` before `act` in field-case-runner.ts; if not, add beforeEach reset.
11. **M-4**: strategy `ensureDefaultState` resets the 4 flag checkboxes (live-verify persist + defaults first).
12. **H-10+NEW-6**: currency — pre-clear stale error dialogs + bounded wait on error-dialog check.
13. **L8**: CUR-010 restores USD-default in-test (assert save result per LR-067).
14. **NEW-4**: root-cause BAS-027/028 "discarded section" leakage (headed CLI walk); fix; remove BAS-025 defensive filter.
15. **H-3**: crash-safety dropdown reset — needs live default values (1604 dropdowns empty-but-editable; downgraded — document if no default exists).
16. **Verify (LR-018)**: each touched spec individually, `--retries=1`.

### Phase 3 — P2 assertion strength — HEALER (specs)
17. H-12 (drop `.catch(()=>'')` from STR-021), H-13 (`/\d/`→strict numeric), H-14+NEW-A5 (PRI-016 multi-currency office or assert non-match hidden), H-15 (CUR-012 reload-before-assert), NEW-5 (2× `a||b`→LR-051 branch), NEW-9 (3× `>=0` tautologies), NEW-13 (LGL-006 assert absence of search input), H-11 (`toContain('12')`→exact).
18. L4+NEW-11 (escape/exact combobox text + post-select verify), L5 (getLoginError `waitFor visible`), L1 (getFieldDisplayValue null-vs-empty), MEM-4 (toggleCheckbox asserts change), MEM-3 (loginWithMicrosoft throws/document contract).

### Phase 4 — P3 hygiene (enumerated in-scope, LR-050) — GARDENER
19. M-8 (remove 10 DIAGNOSTIC-PAUSE sleeps — legal ×6, left-panel ×4; prove ×2 stable), R2 (CUR-001 assert-only), R4 (drop legal TC-012 redundant reload).
20. Dead code (grep-verified each): MEM-DEAD (11 fields corp common.ts), MEM-6 (deprecated auth/dynamic selectors). NEW-10 was FALSE (methods live) — skip.
21. MEM-5 (credential metadata excludes password), L6 (guard `new URL('')`), NEW-12 (unify baseUrl cascade), L2 (safe URL join), M-6 (isOnBasicInformation→aria-selected), L10 (scope Venue dd reads), MEM-MGH (content-anchored MGH-008), MEM-MISLEAD (comment on btnUnsavedChangesOk), H-9/PAT-sidebar (restore beforeunload+viewport ×2 sites), L13/L14 (README), NEW-14/NEW-15 (doc).
22. L9 (verify-first): `npm test` preflight; trim CI_ENV required-list per LR-ENC-003 if truly required.
23. PAT-catch triage: ~34 swallow-class `.catch(()=>{})` — propagate/log load-bearing ones; document best-effort probes.

### Phase 5 — anti-recurrence: FLAG + BLOCK in CI (no auto-repair) — GARDENER
24. Author/extend 13 deterministic gates (one per fuckup type — broken chains, first-test-only baseline, swallowed failures, can't-fail assertions, save-trusted-blind, weak reset, race/missing-wait, leaked shared state, fragile locators, dead/dup code, dead-time sleeps, doc/config lies, verification-rescope). Each FAILS commit+CI with file+line+fix. Fail-green each on the clean tree before switching to blocking. Wire into `.githooks/pre-commit` AND ship/`check:all` (closes M-1).
25. LR-019 amendment (`.claude/rules/specs.md`) for chain-scan-before + full-run-after; cross-ref LR-046/LR-060.
26. Process capture (agent-mistakes + LEARNED_RULES + activity-log); commit 1604/1605 cross-spec write map (feeds gate #8); worker-count warning near playwright.config.

### Phase 6 — data-testid report — OWNER
27. Build `clients/encore/specs_planning/_internal/testid-gap-report-2026-07-02.md`: non-testid inventory grouped module→widget family + suggested `data-testid` names + per-file % table.
28. Prepare LR-058-clean client-facing ask (user triggers `/encore-questions` or `/report` explicitly).

## Verification (LR-018 order)
1. Per-fix: touched spec INDIVIDUALLY `--retries=1 --workers=1` (retry-pass proves isolation).
2. Gates green: check-per-test-baseline, check-save-honesty, tc-parity, jargon scan.
3. Full clean run: `npm run clean` (verify dirs gone) → `npm run test:cli`; counts only from this run's deduped summary.json.
4. SSL acceptance: `--grep "TC-LOC-SSL-01[3-5]"` 3/3 twice + once `--retries=1` forcing mid-chain retry.
5. LR-058 jargon scan clean; post-execution audit + /final-q + /reflect close the gates.

## Decisions (defaulted)
- D1 Testid = report + keep running. D2 Chain = self-contained tests. D3 TC-DET-043 = leave as-is with clarifying comment (documented, not hidden). D4 C-2/C-3/H-4 FCC waivers = KEEP (verify backlog entry only).
