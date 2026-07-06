# PLAN_GATE_BACKLOG_AND_1604_TRACKER

**Status**: PENDING
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
| HEALER | override.ts + corporate-pricing-override.spec.ts comments; any weak-reset spec fixes | `clients/encore/src/data/corporate-pricing/override.ts` + `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` (edited) | `cd clients/encore && npx playwright test tests/corporate-pricing/corporate-pricing-override.spec.ts --workers=1` → 28 passed/1 skipped |
| OWNER | gates, rules, plans, xlsx, bug JSON | `scripts/check-weak-reset.mjs`, `scripts/check-dead-exports.mjs`, `scripts/check-testid-preference.mjs` (+tests, +registry, +allowlist); `clients/encore/reports/bugs/BUG-CPR-OVR-002.json`; `clients/encore/test_cases_xlsx/encore-qa-tracker.xlsx` (rows) | `node scripts/check-weak-reset.mjs` + `node scripts/check-dead-exports.mjs` + `.test.mjs` all exit 0 |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none — no new spec TCs) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | dead-code deletions (if any) | listed in Commit C body | `npm run typecheck` clean |
| HUNTER | (none) | (none) | (none) |

## Acceptance criteria
- [ ] `node scripts/check-weak-reset.mjs` → PASS 0-FAIL on clean tree; synthetic violation → exit 1.
- [ ] `node scripts/check-dead-exports.mjs` → 0 findings post-triage; synthetic staged dead export + `--enforce` → exit 1.
- [ ] Three new `.test.mjs` green.
- [ ] Tracker read-back: A12 RED fill, C7 YELLOW fill, 9 cols, footer counts updated.
- [ ] Override spec live: 28 passed / 1 skipped.
- [ ] Pre-commit gates 5l/5m/5n wired in `.githooks/pre-commit`; every commit passes the full gate suite.
- [ ] Delegation receipt emitted (ledger run_ids + 0 Claude Agent spawns).

## Handoff
Outcomes reported in chat per commit batch; no obstacle claims (LR-039).
