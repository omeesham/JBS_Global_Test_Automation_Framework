# PLAN_GATE_BACKLOG_AND_1604_TRACKER

**Status**: DONE
**Executed**: 2026-07-06
**Priority**: P1
**Created**: 2026-07-06
**Identity**: OWNER (gates, rules, plans, xlsx, bug JSON) + HEALER (spec/data comment edits + any spec fixes)
**Parent**: plans/pending/PLAN_ENCORE_DELIVERABLE_REMEDIATION.md (Phase 5 — 5 deferred gates)
**Depends on**: none (the OPI plan is referenced, not blocked-on)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli — **Justification**: WS-E LR-029 live testid sweep drives playwright-cli across corporate-pricing surfaces; 1604 evidence already gathered this session.
**Subagents**: Copilot worker fleet (`.claude/skills/ultra-agents/copilot-worker.sh`) under `/ultra-agents` — read-mode extraction + gpt-5.5 cross-review; Claude Agent spawns blocked by the spawn-guard. Delegation receipt required at close.

## Context

The remediation plan's Phase 5 required 13 anti-recurrence pre-commit gates; 7 landed (gates 5e–5k) + rule #13 (LR-019 amendment). 5 deferred. User decisions 2026-07-06 (this plan executes them):
- **#6 weak-reset** → BUILD (Copilot-fleet audit + registry + drift-detector gate).
- **#8 leaked-shared-state** → LEAVE; it is a runtime workers≥2 collision already owned by parked `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (workers default 1 today). Deliverable = cross-ref only.
- **#9 fragile-locators** → NEW GOLDEN RULE (testid-first; tracked fallback; switch back when Encore adds testids). Encode everywhere + WARN gate + LR-029-verified sweep.
- **#10 dead-code** → BUILD gate (ts-prune local-or-npx; no package.json edit).
- **1604 write-up** → live-verified defect (grid 0 items vs same-screen Export listing 8 rows for 1604; import with product group 4298 → raw `same key 4543` server exception where 4543 is a LocationId; clean import reports success but nothing persists; office 1606 is the healthy control). Client question rows in the shipping QA tracker + internal bug record + revert-note comments.

Adversarial-audit refinements (F1–F5) folded in below.

## Bootstrap
- **Identity**: OWNER default; adopt `/identity HEALER` for edits to `clients/encore/tests/**` + `clients/encore/src/data/**`.
- **Skills**: /ultrathink (quality gates), /ultra-agents (fleet), /regression-guard (wrap gate/script edits), /final-q (exit).
- **Context files**: this plan; PLAN_ENCORE_DELIVERABLE_REMEDIATION.md; `.claude/rules/specs.md` (LR-018/019/067), `inventory.md` (LR-014/029), `pipeline.md` (LR-046/048/060), `deliverable.md` (LR-058); `docs/read_only_docs/LEARNED_RULES.md` (LR-034 bug protocol); `.claude/skills/ultra-agents/worker-ext.md`.

## Phase 0 — Preconditions (DONE this session)
- Copilot fleet verified functional (CLI 1.0.68, council agents present, smoke read anchor-verified accurate).
- 14 save-capable specs confirmed by independent grep (`REAL_SAVE_HELPERS` pattern): 4 corporate-pricing + 10 locations/local-office.
- Materialize this plan (here) → commit 0 (INDEX regen via hook; never hand-edit INDEX per LR-035).

## Adversarial-audit refinements (ultrathink Step 3)
- **F1** WS-D fleet workers do PURE quoted EXTRACTION (helper→field→line + reset-method body verbatim); Opus computes the coverage law + mismatches.
- **F2** #6 gate = **registry + drift-detector**, not a per-field prover. Mechanism-type: `baseline-restore-all`/`fcc` = covers-all; `partial-manual` = must enumerate. Value = one-time audit (find+fix real gaps) + freeze truth + detect drift.
- **F3** WS-E: land golden-rule edits + WARN gate 5n first (no browser); LR-029 sweep → gap-report v2 + D2 refresh is a separable follow-on.
- **F4** Verify `check-doc-script-parity.mjs` (gate 5j) requirements before committing any new `check-*.mjs`.
- **F5** Order: WS-A → WS-D → WS-C → WS-E → WS-B+F. Delegation receipt (fleet ledger run_ids + 0 Claude Agent spawns) at close.

## Phases (detail lives in the workstream tasks; summary)
- **WS-A (1604)** — HEALER comments (revert-to-1604 note w/ original values embedded) → commit override.ts+spec (re-verify 28/1); `clients/encore/reports/bugs/BUG-CPR-OVR-002.json` (LR-034 schema, baseline-absent); exceljs tracker rows A12 (RED) + C7 (YELLOW) + footer counts; `.claude/state/encore-questions-submitted.json`. Commits A (HEALER) + B (OWNER).
- **WS-D (#6)** — `scripts/check-weak-reset.mjs` + `weak-reset-registry.json` + `.test.mjs`. Registry seeded by fleet fan-out (14 read-mode extractors → gpt-5.5 review → Opus coverage-law + disposition). Small gaps fixed now (HEALER, LR-018 + LR-019-amendment verify); larger → waiver + backlog line. Wire pre-commit gate 5m; prove HALT.
- **WS-C (#10)** — `scripts/check-dead-exports.mjs` + `.test.mjs` + `dead-exports-allowlist.json` (ts-prune local-or-`npx -y ts-prune@0.10.3`; offline → WARN+exit0). Fail-green triage → wire gate 5l; prove HALT.
- **WS-E (#9)** — golden-rule block in `AGENT_SHARED_RULES.md`; rewrite LR-014 in `.claude/rules/inventory.md` (keep LR-029); repoint `SUBPLAN_PRODUCTS_00_FOUNDATION.md:74` grep; touch `PLANNER.md`/`HEALER.md`; new WARN-only `scripts/check-testid-preference.mjs` (gate 5n, always exit 0). Then LR-029 live sweep → `testid-gap-report` v2 + switch-back checklist → refresh tracker D2.
- **WS-B (#8) + WS-F** — remediation plan #8 bullet → OPI cross-ref (note workers default); rewrite Phase-5 deferred block to final dispositions + honest LR-046 note (9 blocking + 1 WARN + 1 rule + 1 redirect + 1 infeasible). Master plan stays In-Progress (its open item 2 not requested now).

## Per-Identity Satisfaction
| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HEALER | override.ts + corporate-pricing-override.spec.ts comments; any weak-reset spec fixes | clients/encore/src/data/corporate-pricing/override.ts<br>clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts | `cd clients/encore && npx playwright test tests/corporate-pricing/corporate-pricing-override.spec.ts --workers=1` → 28 passed/1 skipped |
| OWNER | gates, rules, plans, xlsx, bug JSON | scripts/check-weak-reset.mjs<br>scripts/check-weak-reset.test.mjs<br>scripts/check-dead-exports.mjs<br>scripts/check-dead-exports.test.mjs<br>scripts/dead-exports-allowlist.json<br>scripts/check-testid-preference.mjs<br>scripts/check-testid-preference.test.mjs<br>clients/encore/reports/bugs/BUG-CPR-OVR-002.json<br>clients/encore/test_cases_xlsx/encore-qa-tracker.xlsx | `node scripts/check-weak-reset.mjs` + `node scripts/check-dead-exports.mjs` + `.test.mjs` all exit 0 |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none — no new spec TCs) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | dead-code deletions (if any) | (skipped: WS-C triage allowlisted all 12 baseline dead-exports rather than deleting; zero GARDENER deletions this plan) | `npm run typecheck` clean |
| HUNTER | (none) | (none) | (none) |

## Acceptance criteria
- [x] `node scripts/check-weak-reset.mjs` → PASS 0-FAIL on clean tree; synthetic violation → exit 1. (WS-D, `97631f25`)
- [x] `node scripts/check-dead-exports.mjs` → 0 findings post-triage; synthetic staged dead export + `--enforce` → exit 1. (WS-C, `609e4dc1`)
- [x] Three new `.test.mjs` green. (check-weak-reset 6/6, check-dead-exports 6/6, check-testid-preference 13/13)
- [x] Tracker read-back: A12 RED fill, C7 YELLOW fill, 9 cols, footer counts updated. (WS-A, `77234bd0`)
- [x] Override spec live: 28 passed / 1 skipped. (WS-A)
- [x] Pre-commit gates 5l/5m/5n wired in `.githooks/pre-commit`; every commit passes the full gate suite. (5n `d97923b2`)
- [x] Delegation receipt emitted (ledger run_ids + 0 Claude Agent spawns). (Execution Progress delegation receipt)

## Execution Progress (2026-07-06)
- **WS-A (1604 write-up)** — DONE, commit `77234bd0`. override.ts + spec revert-to-1604 notes; `BUG-CPR-OVR-002.json` (LR-034, baseline-absent); tracker A12 (RED) + C7 (YELLOW) + footer; questions-state. Override spec 28 passed / 1 skipped.
- **WS-D (#6 weak-reset)** — DONE, commit `97631f25`. Copilot-fleet audit (14 specs; 12 ok + 3 self-extracted) found ZERO bare-save resets. Delivered `check-weak-reset.mjs` as a bare-save detector (per adversarial finding F2 the per-field registry was runtime-infeasible — the gate is a freeze + drift-detector, not oversold as a per-field prover). Gate 5m wired; 6/6 unit tests; synthetic HALT proven.
- **WS-C (#10 dead-code)** — DONE, commit `609e4dc1`. `check-dead-exports.mjs` (ts-prune via `npx -y ts-prune@0.10.3`, offline → WARN+pass) + `.test.mjs` (6/6) + 12-entry categorized `dead-exports-allowlist.json`. Gate 5l wired; synthetic HALT proven; full-tree scan fail-green.
- **WS-B (#8) + WS-F (closure)** — DONE, commit `21a3b859`. #8 cross-ref to `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (workers default 1); remediation Phase-5 dispositions rewritten with honest LR-046 accounting (9 blocking + 1 rule + 1 runtime-redirect + 1 policy-decided-encoding-deferred).
- **WS-E (#9 golden rule + live sweep)** — DONE, commits `d97923b2` (Arm 1: golden-rule encode + WARN gate 5n) + Arm 2 (this batch: LR-029 live sweep → gap-report v2 + D2 refresh). Golden rule (testid-first; tracked fallback; switch-back) encoded in `AGENT_SHARED_RULES.md` §5 + §10 + `.claude/rules/inventory.md` LR-014 rewrite (LR-029 kept mandatory) + `PLANNER.md`/`HEALER.md` + `SUBPLAN_PRODUCTS_00_FOUNDATION.md:74` grep repoint. WARN-only gate 5n wired (`scripts/check-testid-preference.mjs` + test 13/13; synthetic WARN proven, always exit 0). **LR-029 live sweep** (playwright-cli, office 1604, fresh auth 2026-07-06) **corrected v1's "zero testids" claim**: the Search screen exposes 3 generic component testids (`e2e-card-header`/`e2e-card-title`/`e2e-checkbox`, none per-control), the other 4 surfaces (pg-override, new-pricebook eq/labor, details incl. Strategy + Pricing Detail tabs) zero → `testid-gap-report-2026-07-06.md` v2 (live-verified) + `testid-live-dumps-2026-07-06/` + D2 tracker Status refreshed to live-confirmed.

**Delegation receipt** (`/ultra-agents` + worker-ext.md): Copilot worker fleet — 15 ledger runs (1 smoke + 14 extractors), 12 ok / 3 self-extracted (largest specs timed out); **0 Claude Agent spawns** after `/ultra-agents` (spawn-guard honored; the fleet is free — "save limits" respected). Every fleet claim anchor-verified against source.

## Deferral Authorization (SUPERSEDED 2026-07-06)
**SUPERSEDED — no longer in effect.** WS-E was originally deferred to a fresh session (user choice "WS-C+B+F now, WS-E fresh", 2026-07-06). The user then reversed that in-session with **"/execute properly this task"** (targeting WS-E), and WS-E was executed and landed the same day (see the WS-E line under Execution Progress). No work remains deferred; the original deferral text lives in git history (commit `85c7f5cc`). This plan closes DONE.

## Execution Summary

**Executed 2026-07-06.** All six workstreams (WS-A…WS-F) landed; the parent
`PLAN_ENCORE_DELIVERABLE_REMEDIATION.md` stays In-Progress (its open item 2 — full
`corporate-pricing-search.spec.ts` + clean full-suite acceptance — was NOT in this plan's scope and
was not requested).

- **TCs implemented**: 0 (this is a gate/infra + client-tracker plan, not a spec-authoring plan). **TCs dropped**: 0.
- **Gates delivered** (remediation Phase 5 backlog): #6 weak-reset `scripts/check-weak-reset.mjs` (pre-commit 5m, `97631f25`); #10 dead-export `scripts/check-dead-exports.mjs` + allowlist (pre-commit 5l, `609e4dc1`); #9 testid-first golden rule + WARN-only `scripts/check-testid-preference.mjs` (pre-commit 5n, `d97923b2`). #8 → cross-referenced to `PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (runtime workers≥2, workers default 1 today); #1 → rule-covered. Honest LR-046 accounting recorded in the parent (`21a3b859`).
- **MCP / live verification (LR-029, 2026-07-06)**: playwright-cli live sweep of the Corporate Pricing surfaces (Search, pg-override, New Pricebook eq/labor, Pricebook Details incl. Pricing Strategy + Pricing Detail tabs; office 1604, fresh auth). Finding: Search exposes 3 generic component `data-testid`s (`e2e-card-header`, `e2e-card-title`, `e2e-checkbox` — none per-control); the other four surfaces expose zero. This **corrected** v1's "entire module uses ZERO data-testid" claim. Raw dumps: `clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/`.
- **Documentation changes**: golden rule encoded in `AGENT_SHARED_RULES.md` §5/§10, `.claude/rules/inventory.md` LR-014 (rewritten; LR-029 kept), `.claude/agents/PLANNER.md` + `HEALER.md`, `SUBPLAN_PRODUCTS_00_FOUNDATION.md:74` grep repointed. Client-facing `testid-gap-report-2026-07-06.md` v2 (live-verified) + QA-tracker D2 Status refreshed.
- **Test pass confirmation**: `scripts/check-testid-preference.test.mjs` 13/13; `check-dead-exports.test.mjs` 6/6; `check-weak-reset.test.mjs` 6/6. Override spec 28 passed / 1 skipped (WS-A). Every commit passed the full pre-commit gate suite (5a–5n). Synthetic HALT/WARN proven for each new gate.
- **Delegation receipt**: Copilot worker fleet — 15 ledger runs for WS-D extraction (12 ok / 3 self-extracted); **0 Claude Agent spawns** after `/ultra-agents`. WS-E used no fleet (Opus-direct doc edits + Opus-only LR-029 live sweep — correctly not delegated per F1/F3).

## Handoff
Outcomes reported in chat per commit batch; no obstacle claims (LR-039).
