# PLAN_SHIP_TO_ENCORE_DELIVERABLES_TEST — Verify CI green via dry-run ship to encore_deliverables_test

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-08
**Revised**: 2026-05-08 (post-audit — see "Audit corrections" below)
**Identity**: OWNER
**Depends on**: PLAN_ONE_GUIDE_SAID_THIS.md (DONE)
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: hi
**Justification**: Procedural ship + CI verification + leak-guard checks — `hi` sufficient.
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Pin**: TOP-OF-INDEX-PER-USER-DIRECTIVE-2026-05-08

---

## Audit corrections (2026-05-08, OWNER `/review` pass — RISK-FOCUSED for LR-049)

The original draft of this plan had **5 verified hard defects + 3 soft notes**, all in the EXECUTION step sequencing (different shape from PLAN_PRI/MGH which were RCA-heavy). Same author, same batch. SHIP is a procedural plan, so the mistake pattern is *wrong commands / wrong sequence / wrong assumption about hook scope* — high blast-radius because LR-049 governs ship and a wrong command can leak gitignored content.

| # | Severity | Original claim | Reality | Correction |
|---|---|---|---|---|
| 1 | **HARD** | Phase 2.4 says "re-run `npm run vendor:build -- --client=encore` if any `src/` file's mtime > the dist/ files'." | [package.json](package.json) defines `vendor:build` as `ts-node scripts/build-framework-vendor.ts` (no client-flag passthrough visible) and `vendor:build:all` as `node scripts/build-framework-vendor-all.mjs`. The canonical runbook [SHIP_TO_ENCORE.md:34](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md:34) says: *"if it fails: `npm run vendor:build:all` → re-run the verify"*. The runbook recommends `vendor:build:all`, not `vendor:build --client=encore`. The plan's command may silently fail or no-op the client filter. | Phase 2.4 simplified to "ship-client.sh enforces vendor-fresh automatically (line 34 calls verify-vendor-fresh.mjs and fail-fast). If it errors, run `npm run vendor:build:all` per runbook line 34, NOT `vendor:build`." |
| 2 | **HARD** | Phase 5.1: "Use `--force-with-lease=<SHA from 2.3>` to safely overwrite without clobbering unexpected remote changes." | Correct git syntax is `--force-with-lease=<refname>:<expected-sha>`. Runbook line 47 uses `--force-with-lease=main:<KNOWN_SHA_FROM_PREFLIGHT>`. Without the `main:` prefix, git treats `<SHA>` as a refname and either errors or silently degrades to a normal force-style push. | Corrected to `--force-with-lease=main:<SHA from 2.3>` |
| 3 | **HARD — high blast** | Phase 5.1 says "From the shipped output directory, push to RutviK-JBS/encore_deliverables_test main branch" but lists ZERO of the prerequisite git init/add/remote/commit steps. | `git archive` extracts a tar-tree with **NO `.git/`**. The shipped output is not a git repo until you `git init` it. Runbook lines 43-47 do all 4 steps: `git init`, `git add -A`, `git remote add origin <url>`, `git commit -m "..."`, then push. An executor following the plan literally would `cd $OUT && git push ...` and fail with "fatal: not a git repository". | Phase 5 expanded to mirror runbook 6-step sequence verbatim |
| 4 | **HARD — false safety claim** | Phase 5.2: "The pre-push hook (`.githooks/pre-push`) runs `scripts/verify-no-forbidden.mjs`. If it rejects, HALT and surface the leak to the user." | [.githooks/pre-push:14](.githooks/pre-push:14) runs `git diff --cached --name-only HEAD` against the CURRENT REPO's index. The shipped output is a FRESH `git init`'d repo. On its first push: (a) the output dir doesn't have `core.hooksPath = .githooks` registered (fresh repo defaults), so the hook DOESN'T FIRE; (b) even if it did, `git diff --cached HEAD` on a first-commit-only repo errors because there's no prior HEAD. The leak protection for the SHIPPED-OUTPUT push comes from `ship-client.sh` itself ([line 45](scripts/ship-client.sh:45)) which runs `verify-no-forbidden.mjs --target=$OUT` AFTER git archive — NOT from the pre-push hook. The pre-push hook protects pushes from the source repo `encore_framework`. | Corrected: the `ship-client.sh` post-archive deny-list grep is what gates leaks at ship time. The pre-push hook gates pushes FROM the source repo (which is NOT what this plan does). |
| 5 | **HARD — silent gap** | Phase 6.1: "Watch the GitHub Actions run on RutviK-JBS/encore_deliverables_test (the workflow at `.github/workflows/playwright-tests.yml`)." | The runbook line 50 explicitly TRIGGERS the workflow: `gh workflow run playwright-tests.yml --repo RutviK-JBS/encore_deliverables_test --ref main`. This implies the workflow has `workflow_dispatch` enabled (and may or may not also have `on: push`). The plan's "watch" approach assumes auto-trigger on push — if the workflow is `workflow_dispatch`-only, no run will ever appear and the executor will wait indefinitely. | Phase 6 expanded: trigger via `gh workflow run` first, then `gh run list` to find the run ID, then `gh run watch <ID>`. Mirrors runbook lines 50-53. |
| 6 | soft | Phase 2.4 manual mtime check redundant | `ship-client.sh:34` calls `verify-vendor-fresh.mjs --client=encore` and exits non-zero if stale. Manual pre-check is unnecessary. | Note added that ship-client.sh enforces this. |
| 7 | soft (JUDGMENT) | Plan ships with known-failing PRI + MGH specs | Both audited this session; both PENDING. User's original goal: *"max successes possible in our specs ... do not run full spec run until atleast all failing ones start successfully running atleast 2 times one after one"*. Ship runbook's success criterion is `auth + ≥1 spec passes` ([SHIP_TO_ENCORE.md:55-58](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md:55)) — BAS alone meets this. But shipping NOW with PRI/MGH red contradicts the broader user goal. | Phase 0 readiness gate now explicitly enumerates current spec status (BAS green, PRI red, MGH red, LI status) and asks the user whether to ship now or defer until PRI+MGH stabilize. |
| 8 | soft | Phase 7.2 updates `PLAN_ONE_GUIDE_SAID_THIS.md` execution summary post-hoc | That plan is in `plans/done/`. Adding a cross-reference is allowed but should be clearly marked as a post-hoc append (not modifying the original Execution Summary). | Phase 7.2 reworded: append a "Cross-references" line, do not edit the existing Execution Summary. |

The plan body below incorporates all 8 corrections. Ship safety is maintained (LR-049, leak-guard chain) — the corrections fix syntax errors, missing steps, and false safety claims, not the discipline itself.

---

## Context

PLAN_ONE_GUIDE_SAID_THIS Q4 deferred this work: *"ship is a separate problem i will decide on"*. This plan captures the deferred work as an authored plan so it doesn't get lost.

**What "ship" means here**: the **dry-run** ship to `RutviK-JBS/encore_deliverables_test` (the gitignored mock repo for testing the git-archive ship workflow). NOT the real delivery to Encore — that goes via JBS colleagues outside git, as captured in user memory and the Encore shipping notes. Per user auto-memory: *"RutviK-JBS/encore_deliverables_test is a dry-run mock for testing git ship actions; real ship to client goes via JBS colleagues outside git (not Rutvik, not Claude)"*.

**Why this plan exists:**
- Guide 2 said: *"Do not claim CI green until shipped to encore_deliverables_test."*
- BAS spec is now green at 1w (PLAN_ONE_GUIDE_SAID_THIS done) — meets runbook's `≥1 spec passes` success criterion.
- Without shipping to the dry-run mock, we don't know if the green local run actually translates to CI green (auth secret config, workflow path, vendored framework freshness all need real-CI verification).
- The leak-guard chain (LR-049 + per-client `.gitignore` + ship-client.sh's pre+post deny-list grep) needs to be exercised end-to-end.

**This plan is intentionally GATED**: user approval required at Phase 1 ("are we ready to ship now?") before any push. After audit corrections #7, the gate now also enumerates current spec state so the user is making an informed decision.

### Provenance

- Carved from PLAN_ONE_GUIDE_SAID_THIS Q4 deferral.
- Runbook: [`clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md`](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) (gitignored, never shipped).
- Audit-revised 2026-05-08 by OWNER `/review` pass after user invoked `/ultrathink /review` to verify findings before execution. Same author-blind batch as PLAN_PRI/MGH/LI/HYGIENE/DEPENDENCY_GATE_REMOVAL.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity`
- `/regression-guard` (wrap — pre-ship and post-ship snapshots)
- `/questionnaire` (Phase 1 user-readiness gate)
- `/final-q`

**Context files**:
- `plans/done/PLAN_ONE_GUIDE_SAID_THIS.md` (provides green-at-1w state)
- `plans/pending/PLAN_PRI_STABILIZATION.md` (audited; still pending — affects Phase 0 spec-state readout)
- `plans/pending/PLAN_MGH_STABILIZATION.md` (audited; still pending — affects Phase 0)
- [`clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md`](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) (the runbook this plan executes — single source of truth for command syntax)
- [`.claude/rules/pipeline.md`](.claude/rules/pipeline.md) (LR-049 ship-via-git-archive only)
- [`clients/encore/CLAUDE.md`](clients/encore/CLAUDE.md) (LR-ENC-001)
- [`scripts/ship-client.sh`](scripts/ship-client.sh) (the actual ship script; reads its source before invoking)
- [`scripts/verify-no-forbidden.mjs`](scripts/verify-no-forbidden.mjs) (leak-guard runtime check — invoked twice by ship-client.sh)
- [`.githooks/pre-push`](.githooks/pre-push) (pre-push hook for the SOURCE REPO — NOT for the shipped output)

---

## Phase 0 — Pre-ship readiness gate (MANDATORY)

1. Confirm `Depends on:` PLAN_ONE_GUIDE_SAID_THIS.md is in `plans/done/` (`ls plans/done/ | grep ONE_GUIDE`).
2. Confirm working tree state — review `git status --short`. If non-trivial uncommitted changes exist, surface to user before ship.
3. **Spec-state readout** (corrected from audit #7):
   - BAS spec status: __ (re-run if >24h since last green run; `npx playwright test --config=clients/encore/playwright.config.ts --project=encore-local-office --workers=1 --retries=0 ...`).
   - PRI spec status: PENDING (PLAN_PRI_STABILIZATION not yet executed; expect 8 fails).
   - MGH spec status: PENDING (PLAN_MGH_STABILIZATION not yet executed; expect 9 fails).
   - LI spec status: DONE (PLAN_LI_STABILIZATION executed 2026-05-08).
4. Read [SHIP_TO_ENCORE.md](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) for the current runbook (single source of truth for commands).
5. Read [scripts/ship-client.sh](scripts/ship-client.sh) for the actual fail-fast chain (vendor-fresh → deny-list pre → git archive → deny-list post → workflow-presence → playwright --list smoke).

---

## Phase 1 — User-readiness gate (HALT for confirmation)

- [ ] **1.1**. **HALT and ask user explicitly**, including the spec-state readout from Phase 0.3:
  > "Ready to ship the dry-run NOW? Current state: BAS green, PRI failing 8 TCs (data + cascade), MGH failing 9 TCs (state drift), LI done. Runbook's CI success criterion (auth + ≥1 spec passes) is met by BAS alone — but shipping with PRI/MGH red contradicts the 'max successes' goal. Two paths: (a) ship NOW for CI verification of the BAS+framework chain; (b) wait until PRI+MGH stabilization plans land, then ship a tighter green deliverable. (a/b/wait?)"
- [ ] **1.2**. If user says "wait" or "b" — pause this plan in PENDING; do NOT push.
- [ ] **1.3**. If user says "(a) ship now" — proceed to Phase 2 with explicit awareness that PRI/MGH will be red on CI.

**LR-046 strict-line guard**: this plan MUST NOT push without user authorization. Strict.
**LR-049 strict-line guard**: ship MUST go via `npm run client:ship`. Never `cp -r`, `tar`, `zip`, or any other path.

---

## Phase 2 — Pre-flight (60 seconds)

- [ ] **2.1**. `git branch --show-current` — expect: `client_deliverable`.
- [ ] **2.2**. `git status --short | head -10` — review exact staged/unstaged diff.
- [ ] **2.3**. `git ls-remote https://github.com/RutviK-JBS/encore_deliverables_test.git refs/heads/main` — record current remote SHA for `--force-with-lease=main:<SHA>` later.
- [ ] **2.4**. Vendor-fresh check is **enforced automatically by `ship-client.sh:34`** — no manual mtime check needed. If ship-client.sh later errors with "vendor stale", run `npm run vendor:build:all` (NOT `vendor:build` — see audit correction #1) and re-run the ship command.

---

## Phase 3 — Commit any pending source changes

- [ ] **3.1**. If working tree has uncommitted changes from PLAN_ONE_GUIDE_SAID_THIS or other in-flight work, surface to user and ask which files to include in the ship commit.
- [ ] **3.2**. Stage only the files the user authorizes (avoid `git add -A` blind-stage which can pick up env files; runbook example uses `-A` — review the staged list before commit).
- [ ] **3.3**. Commit with concise message naming what shipped this round.

---

## Phase 4 — Ship via npm run client:ship

- [ ] **4.1**. Per LR-049 + SHIP_TO_ENCORE.md:
  ```
  npm run client:ship -- --client=encore --out=/tmp/encore-deliv-$(date +%Y-%m-%d)
  ```
- [ ] **4.2**. The script ([scripts/ship-client.sh](scripts/ship-client.sh)) enforces in order — fail-fast on any:
  - Line 25-28: working tree clean check (--force flag bypasses; do NOT use --force).
  - Line 31: `clients/encore` directory exists.
  - Line 34: `verify-vendor-fresh.mjs --client=encore` — vendored framework matches src/ contents.
  - Line 37: `verify-no-forbidden.mjs --client=encore` (PRE-archive deny-list against tracked files).
  - Line 42: `git archive HEAD clients/encore/` extracted with `--strip-components=2`.
  - Line 45: `verify-no-forbidden.mjs --target=$OUT` (POST-archive deny-list against output — defense-in-depth).
  - Line 50-51: `.github/workflows/*.yml` MUST exist in output (per commit `98d66a6` hard-fail rule).
  - Line 54: `npm install --silent && npx playwright test --list` smoke (no browser launch).
- [ ] **4.3**. Inspect the shipped output:
  - Confirm gitignored content is absent (no `CLAUDE.md`, no `specs_planning/`, no `.auth/`, no `read_only_docs/`).
  - Confirm `.github/workflows/playwright-tests.yml` IS present (post-2026-05-04 hard-fail rule per commit `98d66a6` — *"hard-fail if shipped output has no .github/workflows/*.yml"*).

---

## Phase 5 — Push to encore_deliverables_test mock repo

(Corrected from audit #3, #4 — full sequence required because shipped output is git-archive output, NOT a git repo)

- [ ] **5.1**. From the shipped output directory, initialise git and push (mirrors [SHIP_TO_ENCORE.md:42-47](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md:42)):
  ```bash
  cd /tmp/encore-deliv-$(date +%Y-%m-%d)
  git init
  git add -A
  git remote add origin https://github.com/RutviK-JBS/encore_deliverables_test.git
  git commit -m "Encore deliverables — <date or label>"
  git push --force-with-lease=main:<SHA from 2.3> origin HEAD:main
  ```
  - **`--force-with-lease=main:<SHA>`** (not `<SHA>` alone — corrected per audit #2) safely overwrites without clobbering unexpected remote changes.
  - **NEVER** `--force` to a shared remote.
- [ ] **5.2**. **No pre-push hook protection on this push** (corrected per audit #4). The fresh `/tmp/encore-deliv-...` repo doesn't have `core.hooksPath = .githooks` registered — the framework repo's `.githooks/pre-push` does NOT fire here. Leak protection at this point is provided by:
  1. `ship-client.sh` post-archive deny-list grep ([line 45](scripts/ship-client.sh:45)) — already ran in Phase 4.
  2. Manual visual inspection of the output dir (Phase 4.3 checks).
  3. Per-client `.gitignore` ([clients/encore/.gitignore](clients/encore/.gitignore)) — structurally excludes agent artefacts from `git archive`.

---

## Phase 6 — Verify CI run on the mock

(Corrected from audit #5 — must trigger workflow_dispatch first, not just watch)

- [ ] **6.1**. **Trigger** the workflow (mirrors [SHIP_TO_ENCORE.md:50-53](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md:50)):
  ```bash
  gh workflow run playwright-tests.yml --repo RutviK-JBS/encore_deliverables_test --ref main
  sleep 10
  gh run list --repo RutviK-JBS/encore_deliverables_test --workflow playwright-tests.yml --limit 1
  ```
  Capture the run ID from `gh run list`.
- [ ] **6.2**. **Watch** the run:
  ```bash
  gh run watch <RUN_ID> --repo RutviK-JBS/encore_deliverables_test
  ```
- [ ] **6.3**. Acceptable outcomes per runbook:
  - **Green** — auth `setup` project login completes + writes `.auth/encore-state.json` + ≥1 spec passes in `encore-local-office` or `encore-locations`. Plan satisfied.
  - **Login failure** — credentials secret missing or wrong; remediate by re-checking GitHub repo Secrets per [clients/encore/CLAUDE.md](clients/encore/CLAUDE.md) Automation User Provisioning Checklist (`NAVIGATOR_USERNAME`, `NAVIGATOR_PASSWORD`, `BASE_URL`).
  - **Other failures** (PRI/MGH spec failures expected per Phase 1.1 readout) — capture artifact, classify framework-side vs spec-side, file as separate plan if framework-side. Per runbook line 67: *"GA run RED with 0 passes → not a flake; surface the log + STOP."*
- [ ] **6.4**. Download HTML report artifact for evidence.

---

## Phase 7 — Closure

- [ ] **7.1**. Activity log row per LR-028 with ship SHA + verification verdict.
- [ ] **7.2**. **APPEND** a one-line cross-reference to `plans/done/PLAN_ONE_GUIDE_SAID_THIS.md` Execution Summary noting *"ship verified DONE via PLAN_SHIP_TO_ENCORE_DELIVERABLES_TEST 2026-05-XX"*. Do NOT edit the existing Execution Summary content (per audit correction #8).
- [ ] **7.3**. If green: move this plan to `plans/done/` with Execution Summary per LR-027.
- [ ] **7.4**. If yellow/red: keep in PENDING with named follow-up bug or sub-issue.

---

## Acceptance criteria

- [ ] User explicitly authorized the ship after seeing PRI/MGH state readout (Phase 1.3).
- [ ] `npm run client:ship` ran clean (no leak-guard rejections at any of ship-client.sh's 7 fail-fast checkpoints).
- [ ] Shipped output verified gitignored-content-free + workflow file present.
- [ ] Push to `encore_deliverables_test` succeeded via `git init / add / remote add / commit / push --force-with-lease=main:<SHA>`.
- [ ] Workflow triggered via `gh workflow run` and run ID captured.
- [ ] CI workflow run completed (terminal status reached).
- [ ] Verdict captured (green / yellow / red) with HTML report artifact.
- [ ] Activity log row.

**LR-049 strict-line guard**: ship MUST go via `npm run client:ship`. NEVER `cp -r clients/encore` or any non-git-archive path to anywhere.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Working tree has uncommitted changes the user didn't intend to ship | Phase 3 explicitly surfaces and asks; runbook's `git add -A` is a footgun if env files / agent artefacts are unstaged — review staged list before commit. |
| Vendor-fresh fails | ship-client.sh:34 fail-fasts. Fix with `npm run vendor:build:all` (NOT `vendor:build` — see audit #1), commit regenerated `clients/encore/dist/framework/`, retry ship. |
| Deny-list grep rejects (pre OR post) | Find leak source via `verify-no-forbidden.mjs`'s output, fix in source repo, retry. NEVER `--force` past the deny-list. |
| `--force-with-lease=main:<SHA>` rejects (remote changed since Phase 2.3) | Re-fetch remote SHA, re-run. NEVER `--force` to a shared remote. |
| Workflow trigger via `gh workflow run` fails (workflow not enabled / token scope) | Verify `gh auth status` shows write access to RutviK-JBS/encore_deliverables_test. The trigger requires `workflow_dispatch` to be defined in the workflow file. |
| GA run RED on PRI/MGH failures | EXPECTED per Phase 1.1 readout. Runbook line 58 tolerates spec failures; only login-fail or 0-pass is stop-and-ask. |
| Real-delivery channel (JBS colleagues) confused with this dry-run ship | Plan + runbook both explicit: this is the MOCK repo only. Real delivery = JBS colleagues hand over the folder/zip outside git. Per user auto-memory `project_encore_deliverable_channel.md`. |
| Plan author's session previously authored 6 plans in one batch with same author-blind pattern | After this plan executes, the audit batch closes (PRI + MGH still need execution; LI + HYGIENE + DEPENDENCY_GATE_REMOVAL already done). |

---

## Critical files (executor reference)

| File | Lines | Role |
|---|---|---|
| [scripts/ship-client.sh](scripts/ship-client.sh) | 1-57 | The blessed ship path; 7 fail-fast checkpoints. Read before Phase 4. |
| [scripts/verify-no-forbidden.mjs](scripts/verify-no-forbidden.mjs) | — | Leak-guard runtime check; called twice by ship-client.sh (pre + post archive). |
| [scripts/verify-vendor-fresh.mjs](scripts/verify-vendor-fresh.mjs) | — | Vendor-fresh check; called by ship-client.sh:34 + pre-push hook. |
| [.githooks/pre-push](.githooks/pre-push) | 1-37 | **Source-repo only**; does NOT gate the shipped-output's push to mock (audit correction #4). |
| [clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) | 1-81 | Canonical runbook; this plan's body is a structured wrapper around the runbook's 6 commands. |
| [clients/encore/.gitignore](clients/encore/.gitignore) | — | Per-client structural fence; first line of LR-049 defense in depth. |
| [clients/encore/.github/workflows/playwright-tests.yml](clients/encore/.github/workflows/playwright-tests.yml) | — | The CI workflow this plan triggers + watches. Verify `workflow_dispatch:` is defined (required for `gh workflow run`). |

NO change needed to:
- The ship script, deny-list grep script, verify-vendor-fresh script, or pre-push hook — all exist and behave correctly.
- The runbook — single source of truth; this plan defers to it for command syntax.
- LR-049 — already enforces the discipline.

---

## Handoff (chat-only per `feedback_handoff_in_chat_only.md`)

Final summary in chat must list:
- Pre-ship working-tree state (commit SHA + dirty paths if any).
- Ship commit SHA in source repo.
- Mock repo SHA after push (for next time's `--force-with-lease=main:<SHA>` baseline).
- CI verdict + workflow run URL + HTML report artifact link.
- Confirmation that `cp -r` was NOT used at any step (LR-049).
- Confirmation that `git init / add / remote add / commit / push` sequence was followed in `/tmp/encore-deliv-...` (audit correction #3).

Run `/regression-guard` BEFORE Phase 2 (snapshot) and AFTER Phase 7 (diff). Run `/final-q` per LR-042 with evidence-emission citing the CI run URL + artifact.

---

## Cross-plan note for next reviewer

The audit corrections at the top of this file are SHIP-specific (procedural-step errors) — different shape from PLAN_PRI / PLAN_MGH (RCA-heavy errors), but same root: same-author batch with author-blind defects. After this plan executes:

- ✅ DEPENDENCY_GATE_REMOVAL (done, exited the batch)
- ✅ LI_STABILIZATION (done, exited the batch)
- ✅ ENCORE_LIVE_DATA_HYGIENE (done, exited the batch)
- ⏳ SHIP (this plan, awaiting Phase 1.3 user gate)
- ⏳ PRI_STABILIZATION (revised, awaiting execution)
- ⏳ MGH_STABILIZATION (revised, awaiting execution)

Recommend: execute PRI + MGH FIRST, re-verify BAS + PRI + MGH all green at 1w, THEN run this plan for a clean dry-run ship. Avoids shipping with documented-but-known-red specs.
