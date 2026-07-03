# SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE — Wave-1 audit, suite, dedup, master closure (WATCHDOG → GARDENER)

**Status**: DONE
**Executed**: 2026-06-05
**Priority**: P1
**Created**: 2026-06-05
**Identity**: WATCHDOG
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_1445_SEARCH_P1.md, SUBPLAN_CORP_PRICING_1441_MGMT_STRATEGY_P1.md, SUBPLAN_CORP_PRICING_1443_PRICING_DETAIL_P1.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a
**Justification**: closure-gate + multi-spec neutral-eye audit + false-green judgment across 3 screens = max-effort RCA-class review (LR-041).

---

## Context

Wave-1 closure for the Corporate Pricing module: after Search (S1), Strategy (S2), and Detail (S3) land P1-green, this subplan runs the **full corporate-pricing suite**, verifies parity across all three screens, performs a **neutral-eye structural + false-green audit**, files the **missing-testid report** for the Encore team (LR-029), runs a **GARDENER dedup sweep** (extract repeated page-object patterns into the base per ALL-026), and records the **P1-milestone annotation in the master** — but does NOT close the master (F16: the parent stays PENDING until the FCC + edge waves close). Runs as a **separate session from the builders** (AUD-017: an auditor never self-grades same-session work).

**The audit (Phase 1) is a `Workflow` (multi-agent, user-authorized 2026-06-05) — do-or-die, zero-assumption.** It (A) DERIVES every framework/harness demand from source — not a hardcoded checklist that could miss a corner; (B) AUDITS every Wave-1 artifact against it across every dimension (XLSX counts + data-quality-vs-existing-rows, specs, reusable code, locators, pages, parity, divergence-filing, process artifacts); (C) ADVERSARIALLY refutes each "clean" verdict with independent skeptics; (D) GATES closure on **100% VERIFIED-CLEAN** — a single defective or unverified item = RED = HALT = no closure, re-run until spotless. The intent is to out-audit the manual auditor before they ever look.

---

## Bootstrap

**Identity**: WATCHDOG (Phases 0.5b–1) → GARDENER (Phase 2) → OWNER (Phase 3 closure). Clean re-load at each switch.

**Skills auto-called**: `/identity`, `/audit` (review mode), `/regression-guard` (wrap Phase 2), `/final-q` (exit).
**Tools**: `Workflow` (Phase 1 multi-agent audit — Opus-class subagents, fresh-context per AUD-017). Subagents NEVER Haiku (audit = judgment).

**Context files**:
- `PLAN_CORP_PRICING_MASTER.md` (Divergence Ledger — confirm all D1–D8 reflected), S0/S1/S2/S3
- `.claude/rules/pipeline.md` (LR-027/040/046/048/055), `.claude/rules/plan-closure.md` (C1–C6), `.claude/rules/baseline.md`, `.claude/rules/browser-tool.md`, `.claude/rules/inventory.md` (LR-029)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `clients/encore/CLAUDE.md` (LR-ENC-002 parity)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm S1/S2/S3 all DONE in `plans/done/`.
2. Read navigation.md §C, agent-mistakes.md, patterns.md.
3. LR scan: LR-027/040/046/048/055, LR-029, LR-051/052/053, LR-ENC-002, AUD-017.
4. **Browser-tool**: `BrowserTool=cli`, `-s=cpr-audit` on `clients/encore/.auth/encore-state.json` (live-DOM testid audit + any false-green re-walk).

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — WATCHDOG identity)

1. Consume S0 `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md` (baseline-absent, ≤14d). `## Baseline diff` = "baseline-absent; all assertions validated against live new-site DOM".

---

## Phase 1 — WATCHDOG: DO-OR-DIE multi-agent audit `Workflow`

> Runs a `Workflow` (multi-agent, user-authorized). Opus-class subagents, fresh-context (AUD-017 doubly satisfied). Cost is secondary to correctness — mandate: "not a single mistake scope, cannot assume any single thing, do or die; anything a manual auditor could catch must be caught first."

**Inputs gathered first (feed the workflow; LR-024/LR-018 — clean artifacts + run-all-is-truth BEFORE any judgment):**
- **Full suite**: `npm test -- corporate-pricing` (filename filter for all `corporate-pricing*.spec.ts`, NOT a name-grep — F5; `.env.local`) → verified-clean run (`feedback_clean_full_run_integrity.md` — counts only from THIS run's deduped summary.json).
- **Parity**: `npm run check:tc-parity` exit 0 (spec ⊆ MD ⊆ XLSX, all 3 screens). **Workbook**: `npm run xlsx:build` + `npm run xlsx:lint` clean.

**Stage A — DEMAND DERIVATION (fan-out; DISCOVER obligations from source, never a hardcoded list).** One agent per source emits `{id, demand, source file:line, applies-to}`:
- A1 framework path-rules `.claude/rules/{specs,angular,inventory,pipeline,data,baseline,browser-tool,hooks-identity,plan-closure}.md`.
- A2 cross-cutting `docs/read_only_docs/{LEARNED_RULES.md,AGENT_SHARED_RULES.md}` (ALL-* + §-rules).
- A3 client + mistakes `clients/encore/CLAUDE.md` (LR-ENC-001/002/003/004, LR-008/012/017/036) + `agent-mistakes.md` (ALL/REQ/PLN/GEN/HEAL/AUD-* — esp. ALL-026/072/077, GEN-006/009/044, PLN-006/050).
- A4 deliverable/parity tooling `scripts/{check-tc-parity.ts,xlsx-vocab-lint.mjs,xlsx-lint-rules.mjs}`, `export_test_cases/to-xlsx.ts`, `humanize.ts`, `planner-post-complete.ts` + `field-case-generation.md` + `field-inventory-spec.md` + tc-authoring-rules.
- A5 plan-contract: master Doctrine + Divergence Ledger D1–D8 + the F1–F19 remediation + each Wave-1 subplan's Acceptance criteria.
- **Barrier → dedup** into ONE master obligation checklist → emit `clients/encore/specs_planning/_internal/corp-pricing-audit-demands-<MCP-DATE>.md` (this IS "exactly what the framework/harness demands").

**Stage B — AUDIT (pipeline; one agent per dimension; PASS/FAIL per obligation with file:line evidence):**
- **B1 XLSX workbook** — new Corp-Pricing rows vs MD vs spec **counts exact**; **new-content quality benchmarked against existing module rows** (column semantics/format/vocab parity); LR-ENC-004 invariants (no jargon/framework-IDs/`test.fixme`/ticket-IDs/bare-dates; C1 reason⇒not-Pass; status enums; Manual⇒no-reason); `xlsx:build`+`xlsx:lint` self-lint clean.
- **B2 Specs** — FCC two-describe; LR-019 per-test baseline; LR-051/052; LR-022 (no hardcoded counts vs virtualized grid); LR-036 boolean branches; no data-testid assumptions; **no `test.fixme`/stubs (GEN-006)**; false-green (assertions assert persisted live values after reload).
- **B3 Reusable code (ALL-026)** — any setup/nav/assertion/cleanup repeated across 2+ page objects MUST be in `corporate-pricing.page.ts` base; flag every un-extracted repetition.
- **B4 Locators** — testid-first → role → grid-header → content-anchor priority; LR-017 namespace isolation + registered in `buildAllSelectors`; **zero hardcoded env (currency/office/locale)**; no reuse of `selectors/locations/pricing.ts`.
- **B5 Pages** — extend the base; JSDoc on public methods; sane signatures; no business logic in selectors; `typecheck` clean.
- **B6 Test-cases MD + test-plans** — parity (`check:tc-parity`); FCC structural (LR-ENC-002 — MD+plan+XLSX landed WITH the spec); Selector-Mapping table present.
- **B7 Divergence-filing** — each D1–D8 + every F2 divergence (8↔9 columns, History-absent, route-param, staging-price) **RAISED via `/encore-questions`, not silently absorbed**; every TC traces to a DOCX line OR is labeled inference (F6).
- **B8 Process artifacts** — activity-log row (LR-028, LR-037 timestamp ≥ mtimes); walk-evidence (F19); field-inventories (8 keys + 7 sections, LR-014); missing-testid report (LR-029 — live DOM via `-s=cpr-audit` `document.querySelectorAll('[data-testid]')`, NOT selector files) → `clients/encore/specs_planning/_internal/corporate-pricing-missing-testids-report.md`; **TWO fixtures (F1) actually used + restore proven across re-runs (zero cross-run drift)**.

**Stage C — ADVERSARIAL VERIFY (per verdict; ≥3 independent, perspective-diverse skeptics).** Every Stage-B **PASS** → skeptics prompted to REFUTE "this corner is clean" (default *refuted* if uncertain); survives only if a majority cannot break it. Every **FAIL** confirmed real. The 1%-botched net.

**Stage D — SYNTHESIS + DO-OR-DIE GATE.** Aggregate every obligation → `VERIFIED-CLEAN | DEFECT | UNVERIFIABLE`. **ANY `DEFECT` or ANY `UNVERIFIABLE` = automatic RED = HALT** — no closure. Defects route back to the owning S1/S2/S3 (HEALER) or GARDENER; **re-run the WHOLE workflow after fixes until 100% `VERIFIED-CLEAN`**. Emit verdict + evidence → `clients/encore/specs_planning/_internal/corp-pricing-closure-audit-<MCP-DATE>.md`; log audit mistakes to `agent-mistakes.md`. **Phases 2 + 3 do NOT begin until Stage D = 100% clean.**

---

## Phase 2 — GARDENER: dedup + structural (identity switch)

> **GATED: begins ONLY when Phase 1 Stage D = 100% VERIFIED-CLEAN (do-or-die). Any RED ⇒ HALT, fix, re-run the workflow first.** Re-load GARDENER. `/regression-guard` BEFORE.
1. Per ALL-026: any setup/nav/assertion/read pattern repeated across 2+ of the 3 page objects → extract into `corporate-pricing.page.ts` (the base class `CorporatePricingBasePage`, F3 — no `.base.page.ts` infix). No business-logic change. **If a method is extracted, replace the GARDENER matrix row's `(skipped: …)` cell with the actual file path at closure (F13 — converts the conditional skip to a real deliverable, C6-clean).**
2. `npm run typecheck` + lint clean; JSDoc on public methods; barrel exports correct. `/regression-guard` AFTER (exports/signatures intact).

---

## Phase 3 — OWNER: master closure (identity switch)

> **GATED + VERDICT FLOOR: begins ONLY when Phase 1 Stage D = 100% VERIFIED-CLEAN. Workflow RED ⇒ S4 CANNOT annotate the master or move ANY child to `done/`.**

1. Annotate each child's DONE line in `PLAN_CORP_PRICING_MASTER.md` body (LR-027 parent-cascade annotation).
2. **Do NOT flip the parent to DONE (F16 — auto-close EXEMPTION per the master's Closure section).** The Wave-2 (FCC) + Wave-3 (edge) + gated stubs are authored and PENDING, so they gate closure: record a **"P1 milestone delivered"** annotation in the master body, leave the parent PENDING, and `git mv` only the closed Wave-1 children (S1/S2/S3 + this S4) to `plans/done/`. The parent flips to DONE only when the LAST pending `SUBPLAN_CORP_PRICING_*` (across FCC + edge) closes.
3. `npm run plans:reindex`; `npm run plans:validate-closure:changed` (LR-055 C1–C6 PASS).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: reused S0 clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md per LR-013 14-day window; net-new baseline-absent)` | grep baseline artifact |
| GIVER | (none) — parity check only, no TC authoring | `(none)` | `npm run check:tc-parity` exit 0 |
| BUILDER | (none) | `(none)` | n/a |
| HEALER | suite failures (conditional) | `(skipped: HEALER engages only if the suite surfaces a regression; fixes route back to the owning S1/S2/S3 spec, no separate artifact)` | `npm test -- corporate-pricing` green |
| WATCHDOG | demand checklist + closure-audit verdict + missing-testid report | `clients/encore/specs_planning/_internal/corp-pricing-audit-demands-2026-06-05.md`<br>`clients/encore/specs_planning/_internal/corp-pricing-closure-audit-2026-06-05.md`<br>`clients/encore/specs_planning/_internal/corporate-pricing-missing-testids-report.md` | all 3 files exist + Stage D = 100% VERIFIED-CLEAN + `npm run check:tc-parity` exit 0 |
| GARDENER | base page dedup | `clients/encore/src/pages/corporate-pricing/corporate-pricing.page.ts` | `npm run typecheck` exit 0 |

---

## Acceptance criteria

- [ ] `npm test -- corporate-pricing` green from a verified-clean run; counts from THIS run's deduped summary.json.
- [ ] `npm run check:tc-parity` exit 0 across all three screens; `xlsx:build` + `xlsx:lint` clean.
- [ ] **Demand checklist DERIVED from source** (Stage A) — every obligation carries a file:line citation; emitted to `corp-pricing-audit-demands-<MCP-DATE>.md`. Not a hardcoded list.
- [ ] **EVERY obligation has a verdict; ZERO `UNVERIFIABLE` permitted** at closure (unverifiable = RED, same as defect).
- [ ] **EVERY Stage-B PASS survived ≥3 adversarial skeptics** (majority-refute ⇒ downgrade to DEFECT).
- [ ] **XLSX**: new-row counts exact vs MD+spec; new content quality-consistent with existing module rows; **zero LR-ENC-004 violations**.
- [ ] **Zero** ALL-026 un-extracted repetitions; **zero** hardcoded-env in selectors; **zero** data-testid assumptions; **zero** `test.fixme`/stubs.
- [ ] Every divergence FILED (not absorbed); every TC traces to DOCX or labeled inference (F6).
- [ ] **DO-OR-DIE**: one DEFECT/UNVERIFIABLE anywhere ⇒ RED ⇒ HALT ⇒ no closure. No rounding up to YELLOW. Re-run the workflow until 100% VERIFIED-CLEAN; verdict emitted to `corp-pricing-closure-audit-<MCP-DATE>.md`.
- [ ] **Verdict floor**: workflow RED ⇒ Phases 2 + 3 do not run; master not annotated; no child moved to `done/`.
- [ ] (On 100% clean) GARDENER dedup + typecheck/lint clean; `/regression-guard` no silent breakage.
- [ ] (On 100% clean) Parent **annotated "P1 milestone delivered" but NOT flipped to DONE** (F16 — stays PENDING until FCC + edge close); Wave-1 children `git mv`'d to `plans/done/`; `plans:reindex` clean; `validate-closure` C1–C6 PASS on the closed children (LR-055).
- [ ] Activity-log row (LR-028); `/final-q` verdict block (LR-042).

---

## Verification

```bash
npm test -- corporate-pricing            # filename filter (F5); all P1 corporate-pricing specs green (.env.local)
npm run check:tc-parity                   # expect: exit 0
npm run xlsx:build && npm run xlsx:lint   # expect: workbook builds + lints clean (LR-ENC-004)
ls clients/encore/specs_planning/_internal/corp-pricing-audit-demands-*.md      # Stage A demand checklist emitted
ls clients/encore/specs_planning/_internal/corp-pricing-closure-audit-*.md      # Stage D verdict (must read VERIFIED-CLEAN)
npm run plans:validate-closure:changed    # expect: C1-C6 PASS on closed children (parent stays PENDING per F16)
```

---

## Execution Summary

**Executed**: 2026-06-05

**What S4 delivered** (closure/audit subplan — authors no TCs; verifies, dedups, and closes Wave-1):

1. **DO-OR-DIE multi-agent audit** (`Workflow`, Opus-class, fresh-context per AUD-017): Stage A derived 87 framework/harness obligations from source → `corp-pricing-audit-demands-2026-06-05.md`; Stage B audited all 8 dimensions (B1 XLSX, B2 specs, B3 reuse, B4 locators, B5 pages, B6 MD/plans, B7 divergence, B8 process); Stage C ran ≥3 perspective-diverse adversarial skeptics per PASS; Stage D synthesized the verdict → `corp-pricing-closure-audit-2026-06-05.md`.
2. **Round-1 verdict: DEFECT (10 defects D1–D10).** User authorized full remediation. Fixed at the correct layers: D1/D2 (45 wrong preconditions + 34 residue rows) at MD source + the `humanize.ts` scrub bug + CPR `TAB_MAP` in both `humanize.ts`/`to-csv.ts` + 6 `xlsx-lint-rules.mjs` deny-list patterns; D3 (5 shared primitives) extracted into `CorporatePricingBasePage`; D4 (18 JSDoc) added; D5/D6 (MD claim/trace) corrected; D7/D8 (divergences) raised via `/encore-questions` drafts; D9 (ensureDefaultState — restore safety holds; claim documented); D10 (backdating) cleared by this closure row.
3. **Round-2 re-audit (fresh-context, adversarial): VERIFIED-CLEAN.** 8/8 dimensions clean on the fixed artifacts; B8/D10 resolved by the closure activity-log row + `validate-activity-log --recent=8 --latest-per-file` EXIT 0.
4. **GARDENER dedup** (ALL-026): 5 primitives (`isSaveEnabled`, `clickSaveButtonOrThrow`, `confirmSaveDialogIfPresent`, `isVisibleSafe`, `readAllTexts`) + the init-log extracted into `corporate-pricing.page.ts`; no business-logic change; regression-guard 0 API removed.
5. **Missing-testid report** filed for the Encore team (LR-029, live-DOM verified) → `corporate-pricing-missing-testids-report.md`.
6. **Master annotation**: `PLAN_CORP_PRICING_MASTER.md` records the **"P1 milestone delivered"** annotation + S4 DONE line; parent left **PENDING** per F16 (Wave-2 FCC + Wave-3 edge + gated 1440/1444 stubs gate closure).

**Verification evidence** (LR-042):
- `npm test -- specs/corporate-pricing` (clean run, `.env.local`) → **64 passed** (63 `TC-LOC-CPR-*` + 1 auth-setup), **0 unexpected / 0 flaky / 0 skipped** (this-run deduped `clients/encore/reports/test-results.json`: `expected:64, unexpected:0, flaky:0, skipped:0`, duration 8.7m).
- `npm run check:tc-parity` → exit 0 (spec ↔ MD ↔ XLSX = 63/63/63 across all three screens).
- `npm run xlsx:build && npm run xlsx:lint` → workbook builds + self-lints clean (LR-ENC-004; 0 residue, correct preconditions in all 63 CPR rows).
- `npm run typecheck` → exit 0 (post-dedup).
- `node scripts/validate-activity-log.mjs --recent=8 --latest-per-file` → EXIT 0 (closure row supersedes the remediation backdating).

**TCs implemented**: 0 (S4 authors no test cases — Wave-1 TCs `TC-LOC-CPR-001..018 / 101..125 / 201..220` were delivered by S1/S2/S3). **TCs dropped**: 0.

**Divergences raised (not absorbed)**: D1 (8↔9 columns), D2 (server-side filtering), D5/CPR-STRAT-Q1 (History absent), CPR-DETAIL-Q3 (flat grid), CPR-DETAIL-Q4 (New-Price override) — all staged as `/encore-questions` drafts.

**Deviations from plan**: (1) Phase 1 returned DEFECT, triggering a user-authorized in-session remediation round (acting HEALER/GARDENER/GIVER) before the Round-2 re-audit — the plan's "re-run until VERIFIED-CLEAN" path. (2) Phase 2.5 adjacent-sweep items (selector comment, `'1604'` default, normText idiom) APPENDED to the master housekeeping (grep-verified, tracked to the Wave-2 FCC subplans) rather than DO-NOW, to preserve the just-verified-clean state — the re-audit classified all three CLEAN/non-blocking. (3) Pre-existing backdating on `locations_legal_test_cases.md` (a non-CPR file from an earlier session, surfaced only at `--recent=12`) is flagged as out-of-scope for this closure, not laundered into the CPR closure row.

## Handoff

Corporate Pricing **P1** (DOCX-functional) delivered, audited, and parity-clean across Search/Strategy/Detail. Master plan annotated with the P1 milestone but LEFT PENDING (F16). Wave-2 (FCC) + Wave-3 (edge) + gated 1440/1444 exist as PENDING stubs (F18) — each gets its full design next, seeded by the field-inventories produced in Wave 1; the master closes only when the last of them closes.
