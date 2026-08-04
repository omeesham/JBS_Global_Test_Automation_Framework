# PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR — make `client:ship` runnable again by gating the payload, not the index

**Status**: DONE
**Executed**: 2026-07-28
**Priority**: P1
**Created**: 2026-07-28
**Identity**: GARDENER
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

`npm run client:ship -- --client=encore` has been unable to complete since 2026-06-26. Its pre-flight at
`scripts/ship-client.sh:34` runs `node scripts/verify-no-forbidden.mjs --client=encore`, which exits 1 on
453 tracked-but-deny-listed files, and `set -euo pipefail` aborts the script before its `git archive` step
at line 54.

This was already surfaced twice and deferred for an owner decision — `plans/done/SUBPLAN_CORP_PRICING_NM2271_GRID_EQUIPMENT_LABOR.md:449`
and `clients/encore/specs_planning/_internal/agent-activity-log.md:149` (both 2026-07-21, both citing 328
files, which matches the replay for that date). This plan is that decision: **REPAIR**.

Evidence dossier: `.claude/state/ship-client-audit/dossier.md`.
Cross-family adversarial review: `.claude/state/ua-worker/shipclient-review-0728/result.md` (VERDICT:
MATERIAL_ISSUES — diagnosis upheld, first-draft repair design rejected on three counts; this plan is the
redesign).

### Findings that drive the design (machine-verified)

1. **Root cause is force-tracking, not the deny-glob broadening.** Replaying each commit's own `DENY_GLOBS`
   against its own `git ls-tree` shows PASS from 2026-05-01 (`a14d5c5c`, 90 tracked / 0 offending) through
   2026-06-05, and permanent FAIL from `e0f63b32` (2026-06-26, "chore(migration): force-include work
   artifacts") where tracked jumped 116 → 431 and offending 0 → 315. Counterfactual: deleting the
   `/\/docs\//` glob from HEAD leaves **448 of 453** offenders. `specs_planning/**` is 422 of 453.
2. **The check is correct and load-bearing.** `git archive HEAD clients/encore/ | tar -t | grep -cE
   'clients/encore/(specs_planning|docs)/'` = **547**. `git archive` ships tracked files and ignores
   `.gitignore`, so every one of those would land in the deliverable. The pre-flight is refusing a real leak.
3. **`ship-client.sh` has no removal step at all.** `ship-branch.sh:142-143` strips the denied directories
   from its scratch copy before verifying; `ship-client.sh:54` archives straight into `$OUT`. The two
   scripts differ in pipeline, not in check strictness.
4. **`ship-branch.sh`'s own coverage is accidental, not designed.** Its hand-written `rm -rf` list omits
   `.env.local`, which IS tracked (`git ls-files --error-unmatch clients/encore/.env.local` succeeds) and
   IS deny-listed (`/\.env\.local$/`). It survives only because `ship-branch.sh:265-269` does a throwaway
   `git init` + `git add -A`, which re-applies the *shipped* `clients/encore/.gitignore` — whose lines
   15-18 happen to list `.env.local`. Delete that gitignore line and `ship-branch.sh` starts shipping live
   credentials (LR-ENC-003: `.env.local` is tracked with real creds by design). This is a latent hole in
   the live path, found while reviewing the broken one.
5. **No CI depends on this.** `.github/workflows/` does not exist on disk and `git ls-files .github/` is
   empty; `ship-smoke.yml` last appears at `f99eed76` (2026-05-19).
6. **It did work, and is still maintained.** Green runs recorded at
   `plans/done/PLAN_CLIENT_DELIVERABLE_REBUILD.md:1107` and
   `plans/done/PLAN_UNIFIED_MATSUMOTO_2026_05_19.md:426` (84 files shipped). Commit `2cd02c5e` (2026-07-28)
   still edits the file.

### Why REPAIR and not DELETE or LEAVE

- **DELETE rejected**: `client:ship` is the only full-client, any-client, any-destination ship path.
  `ship-branch.sh` is Encore-only, module-scoped, and hard-wired to push to `encore_deliverables_test`.
  LR-049, `CLAUDE.md:154,157`, `.claude/doctrine-ledger.json:483`, `BUNDLE_MANIFEST.md:20` and ~30 plans
  name `client:ship` as the blessed path; deleting it orphans a doctrine rule and leaves no general ship.
- **LEAVE rejected**: `.claude/doctrine-ledger.json:483` records LR-049 as `enforced_by:
  scripts/ship-client.sh:34` — a line that has aborted every run for a month. A rule whose named enforcer
  can never reach green is a false green, which is exactly the class of defect this repo's gate work exists
  to kill.
- **Index repair rejected**: `git rm --cached` on the 422 `specs_planning/**` files would undo `e0f63b32`'s
  deliberate force-include, which exists so colleagues receive work artifacts over the team remote. The ship
  gate must not dictate the team remote's contents.

### Reviewer objections this design answers

| # | Objection | How this plan answers it |
|---|---|---|
| M1 | Copying `ship-branch.sh`'s literal strip list still leaves `/.env.local`, so `--target` fails after stripping | Exclusions are **derived from `DENY_GLOBS`**, never hand-listed — `.env.local` is covered because the glob covers it |
| M2 | Repair leaves the arbitrary `rm -rf "$OUT"` hazard unresolved | Phase 3 stages into `mktemp -d`, verifies, and only then populates `$OUT`; `$OUT` must be absent/empty or `--force`, and is refused if it is a git worktree |
| M3 | A hand-coded strip list duplicates `DENY_GLOBS` and has already drifted | One shared helper (`--emit-exclusions`) consumed by `.sh`, `.ps1`, and `ship-branch.sh` — no second copy of the list exists anywhere |
| m4 | Intent claims about *why* `ship-branch.sh` and `e0f63b32` were written are inference | Dossier + this plan label them inference; only the replay numbers and file contents are stated as fact |
| m5 | Post-extract deletion is not the only repair path | Adopted the reviewer's alternative — `git archive` exclude pathspecs, so denied files never enter the payload at all |

---

## Bootstrap

- **Identity**: GARDENER (structural refactor of framework tooling; no business logic, no spec logic).
- **Skills auto-called**: `/identity`, `/regression-guard` (before + after), `/final-q`.
- **Context files**:
  - `.claude/rules/pipeline.md` (LR-049 ship discipline, LR-028 activity log, LR-048 structural minimum)
  - `.claude/rules/deliverable.md` (LR-058)
  - `.claude/rules/guardrail-policy.md` (LR-069 — this plan modifies a gate)
  - `docs/read_only_docs/LEARNED_RULES.md` (LR-059 real-verification)
  - `scripts/lib/forbidden-patterns.mjs` (the single source of truth being extended)
  - `.claude/state/ship-client-audit/dossier.md` (evidence)
  - `.claude/state/ua-worker/shipclient-review-0728/result.md` (review verdict)

**LR-048 §5 (Phase 0.5b)**: NOT triggered — Identity is GARDENER not WATCHDOG, no `/find-bugs`, title
carries no audit token, and no output drives TC corrections.
**LR-048 §6.5 (Per-Identity Satisfaction Matrix)**: NOT triggered — this plan touches no `.spec.ts`,
`test-cases/*.md`, `test-plans/*.md`, XLSX workbook, `field-case-catalogs/*.md`, `field-inventories/*.md`,
`REQUIREMENTS.md`, `agent-mistakes.md`, or `old-site-baseline/*.md`.

---

## Phase 0 — Dependency + tool gate

- [ ] **0.1** `node scripts/check-subplan-identity.mjs plans/pending/PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md` → HALT on violations.
- [ ] **0.2** `/regression-guard` baseline fingerprint captured before any edit.
- [ ] **0.3** Confirm no browser work is in scope (BrowserTool: none). No live app is touched by this plan.

---

## Phase 1 — Single source of truth for exclusions

- [ ] **1.1** Add an `--emit-exclusions=<client>` mode to `scripts/verify-no-forbidden.mjs`. It runs
      `git ls-files clients/<id>/`, filters through the **existing** `matchesDeny()` from
      `scripts/lib/forbidden-patterns.mjs`, and prints one repo-relative path per line to stdout (exit 0
      even when the list is non-empty — this mode reports, it does not judge).
- [ ] **1.2** No new pattern list is introduced anywhere. `DENY_GLOBS` in
      `scripts/lib/forbidden-patterns.mjs` remains the only definition. (Answers M3.)
- [ ] **1.3** Unit-check the new mode against the known HEAD state: the emitted list must contain
      `clients/encore/.env.local`, `clients/encore/CLAUDE.md`, and at least one `specs_planning/` path, and
      its line count must equal the offender count reported by `--client=encore`.

## Phase 2 — Exclude at archive time, not after

- [ ] **2.1** In `scripts/ship-client.sh`, replace the line-34 `--client` pre-flight with a call to
      `--emit-exclusions`, converting each emitted path into a `git archive` exclude pathspec
      (`':(exclude)<path>'`).
- [ ] **2.2** Feed those pathspecs to the `git archive` invocation so denied files never enter the payload.
      (Answers m5 — no post-extract deletion.)
- [ ] **2.3** Handle the empty-exclusion case (a clean client) without passing a malformed pathspec.
- [ ] **2.4** Handle argument-length limits on Windows: if the exclusion list would overflow the command
      line, write the pathspecs to a temp file and use `git archive --pathspec-from-file`. Verify which
      branch is taken for encore's 453 paths and record it in the Execution Summary.

## Phase 3 — Remove the `rm -rf "$OUT"` hazard

- [ ] **3.1** Stage the archive extract into `mktemp -d`, not directly into `$OUT`. (Answers M2.)
- [ ] **3.2** Run the existing `--target` verification against the staged directory — this is now the
      authoritative gate, and it asks the correct question (is the *payload* clean?) rather than the
      unanswerable one (is the *index* clean?).
- [ ] **3.3** Only after `--target` exits 0, populate `$OUT`. Refuse when `$OUT` is a git worktree
      (`git -C "$OUT" rev-parse --git-dir` succeeds) or is a non-empty directory without `--force`.
      The unconditional `rm -rf "$OUT"` at the current line 52 is deleted.
- [ ] **3.4** Keep the existing post-ship checks (no `.github/workflows`, XLSX presence, playwright
      `--list` smoke) unchanged and in their current order.

## Phase 4 — PowerShell parity

- [ ] **4.1** Apply the identical redesign to `scripts/ship-client.ps1` — same `--emit-exclusions` source,
      same temp-staging, same `$OUT` refusal rules. It must not grow its own copy of any pattern list.
- [ ] **4.2** Add the `$LASTEXITCODE` checks flagged as S1/S2 in `plans/pending/_ULTRAAUDIT_FINDINGS.md`
      rows P2-LOT17-06 and P2-LOT17-07 (missing after `npm install`, `npx playwright test --list`, and
      `tar`), since this plan is rewriting those exact lines. Cite the finding IDs in the diff.

## Phase 5 — Close the latent hole in the live path

- [ ] **5.1** `scripts/ship-branch.sh` currently depends on the shipped `clients/encore/.gitignore` to keep
      `.env.local` out of its payload (Finding 4). Replace its hand-written `rm -rf` list at lines 142-143
      with the same `--emit-exclusions`-driven strip, so its safety stops being coincidental.
- [ ] **5.2** Do NOT change `ship-branch.sh`'s behaviour in any other way — no preset changes, no push-path
      changes. Dry-run must remain the default.

## Phase 6 — Truth-up the references

- [ ] **6.1** `.claude/doctrine-ledger.json:483` — update LR-049's `enforced_by` to the line that actually
      enforces it after this change (the `--target` gate), not the deleted pre-flight.
- [ ] **6.2** Re-run `node scripts/check-doc-script-parity.test.mjs` — it asserts the `client:ship` doc
      reference and must stay green.
- [ ] **6.3** Add a short note to `.claude/rules/pipeline.md` LR-049 stating that the ship gate is
      payload-scoped, and that tracked-but-deny-listed files are excluded at archive time rather than
      blocking the ship. No new LR number.

## Phase 7 — Real verification (LR-059)

- [ ] **7.1** `bash scripts/ship-client.sh --client=encore --out=<temp> --force` → exit 0. Tee the output.
- [ ] **7.2** Against that output directory, assert **zero** denied paths:
      `node scripts/verify-no-forbidden.mjs --target=<temp>` → exit 0, and an explicit
      `find <temp> -path '*specs_planning*' -o -name '.env.local' -o -name 'CLAUDE.md'` → empty.
- [ ] **7.3** Idempotency, matching the original 2026-05-01 acceptance: ship twice to two directories and
      `diff -r` them (excluding `node_modules`, `reports`, `.auth`, `package-lock.json`) → exit 0.
- [ ] **7.4** `bash scripts/ship-branch.sh --branch=nm2273` (dry-run, no `--push`) → exit 0 and deny-list
      clean, proving Phase 5 did not regress the live path.
- [ ] **7.5** Negative test: temporarily add a dummy tracked file matching a deny glob, confirm the ship
      excludes it rather than aborting, then remove it. Absence-of-deny proves nothing — this payload must
      survive validation to count.
- [ ] **7.6** `npx tsc --noEmit` clean; `/regression-guard` diff vs the Phase 0.2 baseline contains ONLY
      the intended changes.

---

## Acceptance criteria

- [ ] `npm run client:ship -- --client=encore --out=<path>` completes with exit 0 on the current HEAD.
- [ ] The shipped output contains zero deny-listed paths, proven by `--target` exit 0 **and** an explicit
      find for `specs_planning`, `.env.local`, and `CLAUDE.md`.
- [ ] `DENY_GLOBS` in `scripts/lib/forbidden-patterns.mjs` is still the only place the deny list is defined;
      `grep -rn 'rm -rf.*specs_planning' scripts/` returns zero hits.
- [ ] `scripts/ship-client.sh` no longer contains an unconditional `rm -rf "$OUT"`.
- [ ] `scripts/ship-client.ps1` has `$LASTEXITCODE` checks after `tar`, `npm install`, and `playwright test --list`.
- [ ] `scripts/ship-branch.sh` dry-run for at least one branch is still green, and its `.env.local`
      exclusion no longer depends on the shipped `.gitignore`.
- [ ] `.claude/doctrine-ledger.json` LR-049 `enforced_by` points at a line that can actually reach green.
- [ ] `node scripts/check-doc-script-parity.test.mjs` green; `npx tsc --noEmit` clean.
- [ ] Ship idempotency (`diff -r` of two consecutive ships) exits 0.
- [ ] LR-028 activity-log row written for the pipeline-path edits.

---

## Out of scope (stated, not silently dropped)

- The 453 tracked internal files stay tracked. `e0f63b32`'s force-include is not reversed.
- `ship-branch.sh` presets, module mapping, and push behaviour are untouched beyond Phase 5.1.
- No CI workflow is recreated; `.github/workflows/` stays absent.
- The remaining `_ULTRAAUDIT_FINDINGS.md` rows for `ship-client.ps1` outside P2-LOT17-06/07 are not
  addressed here.

## Execution Summary

**Status: executed 2026-07-28. All phases complete EXCEPT Phase 6.3, which is Rutvik-only.**

| Phase | Outcome |
|---|---|
| 1 | `--emit-exclusions=<client>` added to `verify-no-forbidden.mjs`. Emits 453 repo-relative paths for encore, exit 0, derives from the existing `matchesDeny` — zero new pattern literals. |
| 2, 3 | `ship-client.sh` rewired: temp staging, derived strip, `--target=<staging>` as the authoritative gate, unconditional git-worktree refusal, non-empty `$OUT` refusal without `--force`, `--target=$OUT` restored as defence in depth before the smoke, `node_modules` cleaned after it. |
| 4 | `ship-client.ps1` brought to parity. Also closed `_ULTRAAUDIT_FINDINGS` P2-LOT17-06/07 (+10 `$LASTEXITCODE` checks) and P2-LOT17-01 (XLSX checks, so exit 6/7/8 are real). |
| 5 | `ship-branch.sh` strip list now derived, not hand-written. |
| 6.1, 6.2 | Doctrine-ledger LR-049 `enforced_by` corrected `ship-client.sh:34` → `:79`. `check-doc-script-parity.test.mjs` green (5/5). |
| 6.3 | **DEFERRED — Rutvik-only.** See Deferred below. |
| 7 | Verified independently by Claude, not accepted from worker reports. |

### Evidence (all re-run by Claude; artifacts under `.claude/state/ship-client-audit/`)

- `bash scripts/ship-client.sh --client=encore --out=<dir> --force` → **exit 0**, **178 files** (631 tracked − 453 excluded, exact).
- `verify-no-forbidden.mjs --target=<out>` → exit 0. Explicit find for `specs_planning` / `.env.local` / `CLAUDE.md` → **0 hits**.
- Idempotency: two consecutive ships, `diff -r` → **exit 0** (matches the original 2026-05-01 H3 acceptance).
- `pwsh ship-client.ps1` → **exit 0**, **178 files**, deny-list clean.
- **bash ↔ PowerShell payload parity `diff -r` → exit 0.**
- Canary: a throwaway git repo passed as `--out` is refused by the worktree guard with the correct message; `CANARY.txt` survived. (Round 1's "pass" was invalid — the ship had aborted at the deny gate before reaching `$OUT` logic. Re-proved.)
- `ship-branch.sh --branch=nm2273` and `--branch=notes` dry-runs → exit 0, deny-list clean.
- `git status --porcelain -- clients/` identical before and after every run.
- `npx tsc --noEmit` — one error, **pre-existing**: proven by stashing only these files and re-running (identical error with and without).

### Finding 4 confirmed by direct experiment (the credential leak)

Built `ship-branch.sh`'s scratch with the old code and the new code and compared:

- OLD → `/tmp/tmp.sciHMaaAeR/.env.local` present.
- NEW → absent, 0 hits.

**Both runs printed "deny-list clean"** — the old one was carrying real credentials and still passed its own gate, because that gate ran on a re-packed copy the shipped `.gitignore` had filtered, not on the built tree. Exposure was narrow (the normal push path re-packs), but `--keep-scratch` + a manual push, or one edit to `clients/encore/.gitignore` lines 15-18, would have sent live credentials to `encore_deliverables_test`.

### Review + bounce history (worker output was never accepted on its report)

Cross-family adversarial review of the evidence dossier (gpt-5.5) returned **MATERIAL_ISSUES**: diagnosis upheld, first-draft repair design rejected on three counts. The design in this plan is the redesign. Three subsequent worker bounces, all found by Claude re-running acceptance rather than reading reports:

1. `cp -r` in the blessed ship script (LR-049 is grep-enforced — a hit in the counter-example script is a landmine); a comment that would have led the next reader into an argv overflow; a silent-failure path on the exclusion query.
2. Exit-code collision (`5` meant both "emit failed" and "GitHub workflow present"); `$OUT` no longer verified after the copy — an S0 floor drop introduced BY the fix.
3. PowerShell decoded node's UTF-8 output as **ibm437**, mangling 24 paths containing `—`/`→` so they were never stripped; the staging gate caught it and refused. That worker's report had claimed the ship passed — it did not reproduce.

Two suspected defects were tested and cleared rather than "fixed" on suspicion: the `[[ -e ]] && rm` loop does not trip `set -e`; the `node_modules`/`reports` cleanup deletes nothing tracked (`git ls-files clients/encore/reports/` → 0).

### Deferred — Rutvik-only, NOT done

`.claude/rules/pipeline.md` LR-049 lines 417 and 420 remain factually wrong, on machine evidence, and were **already wrong before this plan**:

- Line 417 "Refuses if vendored framework is stale" — `scripts/verify-vendor-fresh.mjs` was deleted 2026-07-16 (`93a07763`); `grep -n vendor scripts/ship-client.sh` → no matches.
- Line 417 "if any forbidden pattern is staged" — the ship never inspected git-staged files; that is the pre-commit hook's `--staged-diff` mode.
- Line 420 cites the same deleted vendor check.

Claude is structurally barred from this edit: `.claude/rules/**` is a protected control file, and the `SELF_GRANT` that would authorise it is itself hook-owned and explicitly never Claude-self-approved. Replacement text was handed to Rutvik in chat. **Until it lands, a future session reading LR-049 may revert this working fix to match the stale prose.**

### Deviation log

- Phase 2.4 specified `git archive --pathspec-from-file` as the overflow fallback. That option does **not exist** in git 2.43.0.windows.1 (verified). Inline `:(exclude)` pathspecs do work, but 453 of them (~27 KB) approach the Windows command-line limit. Adopted: archive whole, strip the derived list inside the temp staging dir, then gate. Payload outcome is identical and the `$OUT` hazard the reviewer objected to does not arise, because the deletion happens in a throwaway directory before the gate.
- Phase 4 grew to include `_ULTRAAUDIT_FINDINGS` P2-LOT17-01/06/07, because the plan rewrote those exact lines and leaving known false-green defects in rewritten code would have been dishonest.

## Handoff

Chat-only, per `feedback_handoff_in_chat_only.md`. Reports outcomes, not obstacles (LR-039).
