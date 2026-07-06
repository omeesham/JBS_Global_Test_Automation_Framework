---
Status: In-Progress
PermissionMode: default
BrowserTool: cli
Identity: HEALER (phases 1-3 specs/page-objects) → GARDENER (phase 4 hygiene, phase 5 gates) → OWNER (phase 6 report)
Origin: ~/.claude/plans/beforeeach-at-line-491-fluttering-nygaard.md (full verdict-matrix adjudication lives there)
ExecutionMode: FULL autonomous foreground — live-app = oracle (fix to match reality + log), commit locally per phase, NEVER push/ship, one review at end
Progress: clients/encore/specs_planning/_internal/REMEDIATION_PROGRESS.md · Deviations: REMEDIATION_DEVIATIONS.md
---

# PLAN: Encore Deliverable Remediation — Verified Findings, RCA, Remediation

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
24. Author/extend 13 deterministic gates (one per defect type — broken chains, first-test-only baseline, swallowed failures, can't-fail assertions, save-trusted-blind, weak reset, race/missing-wait, leaked shared state, fragile locators, dead/dup code, dead-time sleeps, doc/config lies, verification-rescope). Each FAILS commit+CI with file+line+fix. Fail-green each on the clean tree before switching to blocking. Wire into `.githooks/pre-commit` AND ship/`check:all` (closes M-1).
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

---

## Execution Summary (2026-07-02 — autonomous foreground run; Status stays In-Progress per LR-046)

**Phases 1–4: COMPLETE and committed.** Phase 5: 9 of 13 defect-types now have a blocking gate (5m
weak-reset + 5l dead-export added 2026-07-06); of the remaining 4 — #13 landed as a rule (LR-019
amendment), #1 is rule-covered (infeasible as a gate), #8 is a runtime redirect to the office-pool
plan, #9 is policy-decided with encoding deferred. Strict "13 gates" line resolved per-gate per LR-046
(see "Open items" §1), NOT silently rescoped. Phase 6: complete.

### Phase 1 — P0 breakage (HEALER) — DONE
SSL-014/015 self-contained + `dependencyGate([])`; SSL-001 in-body reset removed (R1); L7 BAS-065/067
reconciled; L11 DET quirk reconciled. Verified live (SSL-013/014/015 pass ×2 + --retries=1).

### Phase 2 — reset-integrity (HEALER) — DONE
saveAndVerifyPersisted redesign (H-5/C-1/P-5/NEW-1); NEW-2 override reset→beforeEach; H-3 pricing
dropdowns; M-4 strategy flags; L8 currency restore; H-6 notes stable; C-4 pricing readiness; H-10/NEW-6
currency stale-dialog; H-7 override toast; H-8 Radix portal selectors; L3 endpoint filter.

### Phase 3 — assertion strength (HEALER) — DONE
H-12/13/14/15, NEW-5/9/13, L1/L4/L5, MEM-3/4 all fixed + committed.

### Phase 4 — hygiene (HEALER/OWNER) — DONE
M-8 (10 sleeps), R2 (CUR-001 reset), MEM-DEAD (11 fields), MEM-6 (5 dead currency dynamic selectors),
MEM-5, L6/NEW-12/L2, H-9, L13/L14, NEW-14, L9 (CI_ENV preflight). Verify-first REFUTED with evidence:
R4 (legal reload load-bearing), M-6 (visibility guard correct), L10 (documented-fragile, leave),
MEM-MGH (content-anchor already applied to Notes rows; MGH-008 correctly guarded), MEM-MISLEAD
(already documented). NEW-15 = human-only (playwright.config). PAT-catch: 55 catches surveyed — all
best-effort settle/cleanup; the load-bearing subset (click/reload/save) is now gated by #3 + annotated.

### Phase 5 — anti-recurrence gates — 9 of 13 blocking gate-types + rule #13 + #9 golden rule/WARN gate 5n (#6/#9/#10 added 2026-07-06)

**LANDED (tested + fail-green + wired blocking in `.githooks/pre-commit`):**
| # | Gate | Script | Pre-commit |
|---|---|---|---|
| 11 | spec fixed-sleeps (`// sleep-ok:` exempt) | check-spec-sleeps.mjs | 5g |
| 4 | unfailable assertions | check-unfailable-assertions.mjs | 5h |
| 3 | swallowed failures on click/reload/save (`best-effort:` exempt) | check-swallowed-failures.mjs | 5i |
| 12 | README ↔ package.json npm-run parity | check-doc-script-parity.mjs | 5j |
| 7 | reload must stabilize (`reload-wait-exempt:` exempt) | check-reload-wait.mjs | 5k |
| 2 | first-test-only baseline (pre-existing) | check-per-test-baseline.mjs | 5e |
| 5 | save-honesty (pre-existing) | check-save-honesty.mjs | 5f |
| 6 | weak reset — bare-save anti-pattern (2026-07-06) | check-weak-reset.mjs | 5m |
| 10 | dead exports — ts-prune + baseline allowlist (2026-07-06) | check-dead-exports.mjs | 5l |

Each new gate: pure-function core + `.test.mjs` companion (13/11/10/5/7 cases), fail-green at 0 on the
current tree, wired blocking, and the wiring proven to HALT a live violation. The chain burn-down
(4 corp-pricing search sleeps → `waitForAngularStable` in the page object; 2 detail sleeps →
`expect.poll`; 1 notes negative-probe → `// sleep-ok:`; 5 best-effort catches annotated) was verified
by live run (SRC-041/042/050 + DET-037 pass --workers=1 --retries=1).

**2026-07-06 additions (#6 → 5m, #10 → 5l):** same shape — pure-function core + `.test.mjs` (6 cases
each), fail-green on the clean tree, wired blocking, synthetic HALT proven. #6 (`check-weak-reset.mjs`)
was preceded by a 14-spec bare-save audit that found zero weak resets (freeze + drift-detector). #10
(`check-dead-exports.mjs`) uses `npx -y ts-prune@0.10.3` — no `package.json` devDep — with a 12-entry
categorized baseline allowlist; offline → WARN + pass so a commit never wedges without network.

**2026-07-06 addition (#9 → 5n, testid-first golden rule) — DONE:** #9 (fragile-locators) landed as a
POLICY — the testid-first golden rule: use `data-testid` when present; else the next-best stable
locator + a tracked gap; switch back when the app adds one — encoded in `AGENT_SHARED_RULES.md` §5/§10,
`.claude/rules/inventory.md` LR-014 (rewritten; LR-029 kept), `PLANNER.md`/`HEALER.md`, plus a
**WARN-only** pre-commit gate 5n (`check-testid-preference.mjs`, always exit 0 — a static gate cannot
see the live DOM, so it reminds rather than blocks; that is why #9 is not counted among the 9 blocking
gates). An LR-029 live sweep of the Corporate Pricing surfaces corrected the earlier "zero testids"
claim (Search exposes 3 generic component testids; the other surfaces zero). With #9 encoded, all five
deferred Phase-5 items (#1 rule-covered · #6 gate 5m · #8 runtime-redirect · #9 golden rule + 5n · #10
gate 5l) are resolved. Delivered by the child plan
[PLAN_GATE_BACKLOG_AND_1604_TRACKER.md](../done/PLAN_GATE_BACKLOG_AND_1604_TRACKER.md) — **DONE
2026-07-06** (executed #6/#9/#10 gates + the 1604 override write-up). This parent stays **In-Progress**
on its own open item 2 (full `corporate-pricing-search.spec.ts` + clean full-suite acceptance — outside
the child plan's scope, not yet requested).

**Rule #13 (process gap, the actual SSL RCA) — DONE:** LR-019 amendment in `.claude/rules/specs.md` —
wiring a reset requires a chain-scan BEFORE + a FULL-suite run AFTER; a `--grep` subset is a silent
LR-046 rescope. This is the adequate defense for the runtime-chain class (which no structural regex
can see, confirmed below).

**DISPOSITION (2026-07-06 — per-gate decisions, user-authorized; resolves the former DEFERRED block per LR-046):**
- **#1 broken chains — RULE-COVERED (no structural gate; infeasible as one).** A structural regex
  cannot see a *runtime* output→input chain wipe (the plan's own RCA states this). The only static
  signals are `dependencyGate([...])` (280 annotation-only calls = noise) or `// Depends on` prose
  (0 hits, and would not have caught the original, which used `dependencyGate`). The adequate defense
  is the LR-019 amendment / rule #13 (chain-scan-before + full-run-after), which landed. A 0-hit prose
  tripwire has near-zero value and was deliberately not added.
- **#6 weak reset — DONE (gate 5m, commit 97631f25, 2026-07-06).** `scripts/check-weak-reset.mjs`
  forbids the "bare-save reset" anti-pattern (a beforeEach/afterEach that saves without restoring a
  baseline). A 14-spec audit found zero such resets, so the gate is a freeze + drift-detector; the
  per-field prover is the same runtime-infeasibility as #1 and was NOT oversold as one. 6/6 unit tests;
  synthetic HALT proven; fires on staged `clients/*/tests/**/*.spec.ts`.
- **#8 leaked shared state — POLICY-REDIRECT (runtime, not a commit-time gate).** This is a *runtime*
  workers≥2 write collision on shared Encore app state (offices 1604/1605), not a coding defect a
  static gate can catch. It is already owned by
  `plans/pending/PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (the per-worker office-pool
  isolation design, which subsumes the 1604/1605 write-map). Today the collision cannot occur:
  `workers` defaults to 1 everywhere (`clients/encore/playwright.config.ts:38`). No gate authored here
  — the office-pool plan is the correct home.
- **#9 fragile locators — POLICY DECIDED, ENCODING DEFERRED (not closed here).** The user set the
  testid golden rule on 2026-07-06: use a `data-testid` when present; otherwise use the next-best
  locator AND record the gap (tracker/report); switch back to the testid when one is added. Encoding it
  everywhere (rules + agents) + a WARN-only preference gate (5n) + a live testid sweep of the
  corp-pricing surfaces → gap-report v2 is a separable follow-on — a static gate cannot know the live
  DOM, so it is WARN by design, not blocking. Deferred to a focused follow-up.
- **#10 dead/duplicate code — DONE (gate 5l, commit 609e4dc1, 2026-07-06).** `scripts/check-dead-exports.mjs`
  runs ts-prune via `npx -y ts-prune@0.10.3` (no `package.json` devDep needed — the earlier human-only
  blocker is gone); offline → WARN + pass. 12 baseline findings frozen in
  `scripts/dead-exports-allowlist.json` (2 config-referenced false positives + 6 public type surface +
  1 auth-storage utility + 3 authored test-data), each with a ≥20-char reason. 6/6 unit tests; synthetic
  HALT proven; fires on staged `clients/*/{src,tests}/**/*.ts`.

### Phase 6 — data-testid gap report — DONE
`clients/encore/specs_planning/_internal/testid-gap-report-2026-07-02.md` — per-module coverage +
widget-family grouping + suggested naming + priority order. Explicitly labelled internal groundwork
requiring per-module live-DOM confirmation (LR-029) before any client message; outbound ask stays on
the user-triggered `/encore-questions` / `/report` path.

### Open items for user review (the "one review at end")
1. **Phase 5 strict "13 gates" line — RESOLVED per-gate (2026-07-06, user-authorized).** Honest LR-046
   accounting: the strict "author/extend 13 gates" line does NOT resolve as 13 blocking pre-commit
   gates. It resolves as —
   - **9 blocking gates**: 5e–5k (the original 7) + 5m weak-reset (#6) + 5l dead-export (#10).
   - **1 rule, not a gate** (#1 broken chains): a structural regex cannot see a runtime chain wipe; the
     LR-019 amendment (chain-scan-before + full-run-after) is the landed defense.
   - **1 runtime redirect** (#8 leaked shared state): owned by
     `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md`; not a commit-time coding defect (workers
     default 1 today).
   - **1 policy decided, encoding deferred** (#9 fragile locators): the testid golden rule is decided;
     its rule-encoding + WARN-only gate 5n + live testid sweep are a separable, non-blocking follow-on.

   Per LR-046 this is the EXPLICIT per-gate disposition the user authorized on 2026-07-06 — NOT a
   silent rescope of the strict line.
2. **Recommended final acceptance (STILL OPEN)**: a FULL run of `corporate-pricing-search.spec.ts` (the
   sleep burn-down was verified via `--grep` subset, not the whole file) + a clean full-suite run per
   LR-018. Not requested in the 2026-07-06 gate-backlog work — deferred until you ask.
3. Status stays **In-Progress** — not flipped to DONE. Two items remain genuinely open: the #9
   golden-rule encoding + live sweep (item 1, deferred follow-on) and the final full-suite acceptance
   (item 2). LR-046: no silent rescope; LR-060: no self-authored deferral.
