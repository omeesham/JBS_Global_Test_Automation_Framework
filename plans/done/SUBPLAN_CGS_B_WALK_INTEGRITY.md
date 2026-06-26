# SUBPLAN_CGS_B_WALK_INTEGRITY — Evidence-bound provenance + mechanical lie-proof closure gate

**Status**: DONE
**Executed**: 2026-06-24
**Priority**: P1
**Created**: 2026-06-24
**Identity**: OWNER
**Parent**: PLAN_CASE_GENERATION_STANDARD.md
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

Pillar B of PLAN_CASE_GENERATION_STANDARD, independent of Pillar A. The corp-pricing rewalk was flipped DONE while controls were classified from the Jira spec instead of live-clicked, and the closure gate passed (verified). Cause: `coverage-manifest.mjs` `coverageVerdict()` checks *completeness* (Coverage_Ratio / CrossCheck / undispositioned), never *provenance* (live evidence vs inference); and `coverage_mode`/`test_status_mode` are in `announce` (warn-only). A self-declared `live` tag is gameable, so this subplan binds `live` to un-fakeable machine evidence, makes the gate verify the evidence (not the word), turns the gate on (`deny`), and rejects the whole walk on any fabrication. No new subsystem, no new rule number — all edits land in existing files (`/slop`-verified).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (BEFORE + AFTER — validator + hook are load-bearing exports)
- `/relevant` (Phase 0 injection)
- `/final-q` (Phase 4 — LR-042)

**Context files**:
- `PLAN_CASE_GENERATION_STANDARD.md` (parent)
- `scripts/validate-plan-closure.mjs` + `scripts/walk-coverage/lib/coverage-manifest.mjs` (the shared verdict function)
- `.claude/closure-config.json` (rollout modes)
- `.claude/rules/inventory.md` (LR-062/LR-064 — amended here) · `.claude/rules/pipeline.md` (LR-046/LR-060) · `.claude/rules/plan-closure.md` (LR-055 / C1–C6)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-059)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. `Depends on:` = none (orthogonal to Pillar A).
2–5. navigation.md / agent-mistakes (ALL-*) / patterns.md / LR scan (LR-062/064/059/055/046/060).
6. **BrowserTool=none** — pure framework/gate work; the negative test drives the validator via Bash, not a browser.

## Phase 0.5b — Baseline-first walk

N/A — no live module behavior classified. `baselineScope: not-applicable`.

---

## Phase 1+ — Actual work (OWNER, framework)

1. **Provenance token (amend LR-062 + LR-064 + walk-evidence row):** any disposition that *claims observation* (`affordance-probed` / `read-only-verified` / live `covered-by-TC`) MUST carry `provenance: live` + a cited machine-emitted evidence artifact (network row endpoint+200+server-timestamp / snapshot / screenshot). `provenance: oracle` = classified-from-spec. The LR-064 walk-evidence per-field row carries the evidence pointer + Opus verdict.
2. **Gate checks evidence, not the word (one-function edit):** extend `parseCoverageSignals` + `coverageVerdict` in `coverage-manifest.mjs` — a manifest is `complete` only if every observation-claiming row is `provenance: live` AND its cited evidence file (a) exists, (b) is freshly timestamped this session (not reused), (c) names that control/endpoint. Any `oracle` / evidence-missing / stale → incomplete → Cx FAIL. Auto-propagates to both `validate-plan-closure.mjs` Cx and `check-execution-completion.mjs` (the two importers).
3. **Evidence can't be hand-authored (extend existing PreToolUse hook):** block agent `Write`/`Edit` whose target is the walk evidence dir — proof must come from `playwright-cli`, mirroring the `browsertool-gate` / `todo-injection-gate` pattern.
4. **Blind independent re-drive (amend LR-064 Stage-3):** a second cheap worker (blind, no answer-key) re-drives a random sample of `live` rows; contradiction with cited evidence → reject.
5. **Whole-walk rejection + strike log:** a single fabrication fails the entire plan closure and writes an append-only integrity strike under `.claude/state/` (the collective penalty).
6. **Delegation-down HALT (amend LR-064):** workers unavailable + can't finish a strict live-walk in budget → HALT + report; NEVER oracle-classify and close (the exact trigger of the original miss).
7. **Flip to `deny` (guarded):** in `.claude/closure-config.json` set `coverage_mode` + `test_status_mode` → `deny`. FIRST run `node scripts/validate-plan-closure.mjs --all --report-only --coverage-mode=deny --test-status-mode=deny` to bound blast radius (the grandfather clause exempts the 17 pre-2026-06-19 artifacts); remediate/grandfather any real hit, THEN flip.
8. **Negative-test fixture:** add a fixture under `scripts/test-fixtures/plan-closure/` — a plan with a strict "every control live" line citing a walk artifact with one `provenance: oracle` row — and assert it FAILs; flip the row to `live` + evidence → PASS.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes → DO-NOW / SPAWN / APPEND with grep-verifiable recipient. Bare "out of scope" = HALT + ask (LR-040 + LR-046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | none | (none) | — |
| GIVER | none | (none) | — |
| BUILDER | none | (none) | — |
| HEALER | none | (none) | — |
| WATCHDOG | none | (none) | — |
| GARDENER | none | (none) | — |
| OWNER | coverage-manifest verdict + closure-config + LR amendments + fixture | `scripts/walk-coverage/lib/coverage-manifest.mjs`<br>`.claude/closure-config.json`<br>`.claude/rules/inventory.md` | `node scripts/validate-plan-closure.mjs --self-test` |

---

## Acceptance criteria

- [ ] `coverageVerdict()` rejects `provenance: oracle` (and missing/stale evidence) on observation-claiming rows; both importers (Cx + Stop hook) inherit it.
- [ ] PreToolUse hook blocks agent writes into the walk-evidence dir.
- [ ] LR-062 + LR-064 amended (provenance + blind re-drive + delegation-down HALT); LR-064 Stage-3 names the re-drive.
- [ ] Negative-test fixture FAILS on an oracle row, PASSES on live+evidence (`--coverage-mode=deny`).
- [ ] `--all --report-only` shows no new false-positives; then `coverage_mode` + `test_status_mode` = `deny`.
- [ ] `/regression-guard` before/after = no silent breakage on validator/hook/config.
- [ ] Activity-log row per LR-028 (timestamp ≥ touched-file mtimes).
- [ ] `/final-q` verdict block (GREEN | YELLOW | RED).

## Verification

```bash
node scripts/validate-plan-closure.mjs --self-test                                   # validator green
node scripts/validate-plan-closure.mjs scripts/test-fixtures/plan-closure/<oracle-fixture>.md --enforce --coverage-mode=deny --json   # expect Cx FAIL
node scripts/validate-plan-closure.mjs --all --report-only                           # no new false-positives
grep -E '"coverage_mode"|"test_status_mode"' .claude/closure-config.json             # expect "deny"
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md`. Describes what landed (provenance gate, evidence no-hand-write hook, LR-062/064 amendments, the `deny` flip with blast-radius check, negative-test fixture) and the residual (deliberate correlated forgery — now audit-catchable, not silent).

---

## Execution Summary

**Executed**: 2026-06-24 (OWNER). All 8 Phase-1 tasks landed; one user-authorized deviation (`test_status_mode` — see Deviations).

- **Task 1 — provenance token (LR-062 cond 5 + LR-064 + manifest row):** `coverageVerdict` now requires `provenance: live` + a machine-emitted `evidence:` pointer on every observation-claiming disposition (`affordance-probed` / `read-only-verified`); `provenance: oracle` on such a row is rejected. Amended `.claude/rules/inventory.md` LR-062 (new condition 5) + LR-064.
- **Task 2 — gate checks evidence, not the word:** extended `parseCoverageSignals` (new `manifestRows` + `extractManifestRows`) + `coverageVerdict` (opts.artifactPath fs-evidence checks — exists / embedded-date ≥ session date / names-control; new `provenanceFail` flag) in `scripts/walk-coverage/lib/coverage-manifest.mjs`. Both importers inherit it: `scripts/validate-plan-closure.mjs` `checkCx` (passes artifactPath, flags fabrication) + `.claude/hooks/lib/check-execution-completion.mjs` (Stop hook).
- **Task 3 — evidence can't be hand-authored:** extended the always-on PreToolUse gate `.claude/hooks/lib/check-todo-injection.mjs` (`isEvidenceDirTarget`) to DENY agent Edit/Write into `.playwright-cli/`; Bash (playwright-cli) is unaffected. Verified deny/allow via real hook stdin.
- **Task 4 — blind independent re-drive:** LR-064 Stage-3 amended — a 2nd blind worker re-drives a random sample of `provenance: live` rows; contradiction with cited evidence → reject.
- **Task 5 — whole-walk rejection + strike log:** a fabrication (Cx `provenanceFail`) fails the whole plan closure AND appends an integrity strike to `.claude/state/integrity-strikes.jsonl` (enforce-only — never on hook stdin / dry-run). `.claude/state/*.jsonl` added to `.gitignore` (runtime state, like its `*.json` siblings).
- **Task 6 — delegation-down HALT:** LR-064 amended — workers unavailable + can't finish a strict live-walk in budget → HALT + report, never oracle-classify-and-close.
- **Task 7 — flip to deny (guarded):** blast-radius run (`--all` under deny) showed **0 Cx false-positives** across 377 `plans/done/` plans (`pricing-2026-06-19` provenance-grandfathered before the 2026-06-24 landing date). Flipped `coverage_mode` → `deny` in `.claude/closure-config.json`. `test_status_mode` HELD at `announce` (see Deviations). Threaded mode flags through `runAll` so `--all --coverage-mode=deny` is honored, not silently ignored. Also fixed the blank Cx console line (renders `artifact: reasons`).
- **Task 8 — negative-test fixtures:** `scripts/test-fixtures/plan-closure/cx-provenance-oracle.md` (Cx FAIL under deny) + `cx-provenance-live.md` (Cx PASS), backed by `scripts/test-fixtures/plan-closure/field-inventories/cx-walk-oracle.md` / `cx-walk-live.md` / `cx-evidence-input-name.json`. Verified: oracle → FAIL + integrity strike + exit 1; live → PASS + exit 0.
- **Tests:** coverage-manifest unit suite 21/21 (9 new provenance cases, incl. the no-false-positive + honest-inference guards); validator `--self-test` 28/28; execution-completion 26/26; todo-injection 83/83. `/regression-guard` before/after CLEAN — exports purely additive (`+PROVENANCE_GATE_LANDING_DATE`, `+extractManifestRows`; `coverageVerdict` 3rd param backward-compatible); both importers resolve.
- **Parent:** `PLAN_CASE_GENERATION_STANDARD.md` stays PENDING (its Phase-1 Corp-Pricing proof + `test_status_mode` acceptance are unmet); this child's DONE line was annotated in the parent body per LR-027.

## Deviations

1. **`test_status_mode` left at `announce` (NOT flipped to `deny`) — user-authorized 2026-06-24.** Task 7 said flip both `coverage_mode` + `test_status_mode` → `deny`. The guarded blast-radius run found `coverage_mode` clean (0 Cx hits → flipped), but flipping `test_status_mode` → `deny` would newly edit-block 5 pre-existing, user-authorized DONE plans — surfaced by the pre-existing `Ct` check (not this subplan's code). The closure-config `_test_status_provenance` note assigns the `test_status_mode` deny-ramp to a separate plan's later subplan, gated on its own negative-test against the original miss. Per LR-046 (strict plan line vs live state → HALT-and-ask, not unilateral rescope), I surfaced the choice in plain English; the user chose "leave it." The walk-integrity gate this subplan actually owns (`coverage_mode`) is enforcing.
