# SUBPLAN_CORP_PRICING_W15_99_CLOSURE — Wave-1.5 do-or-die audit closure

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-05
**Identity**: WATCHDOG
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC.md, SUBPLAN_CORP_PRICING_W15_B_TOOLBAR_IO_FCC.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: do-or-die closure gate — multi-rule judgment + adversarial verification across all Wave-1.5 artifacts; zero-tolerance verdict (LR-041 Opus-max tier for closure gates).
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-1.5 closure (F-WV15).** Do-or-die multi-agent audit of the Wave-1.5 deliverables (Override screen FCC + toolbar-I/O FCC + the WV1.5-0 scaffold/inventories), mirroring the hardened S4 workflow but scoped to Wave-1.5. Wave-1 + S4 are already closed in `done/`, so Wave-1.5 needs its **own** closure gate. Same standard as S4: derive every framework/harness demand from source, audit every Wave-1.5 artifact against it, adversarially verify each PASS, and **HALT on any defect** — re-run until 100% VERIFIED-CLEAN. **AUD-017 satisfied**: separate session + fresh-context Opus subagents (never Haiku); the auditor never self-grades its own authoring.

This subplan **annotates** the master (P1.5 milestone delivered) but does **NOT** flip the parent (F16 exemption — the master stays PENDING until Wave-2 + Wave-3 also close).

**Activation trigger**: WV1.5-A + WV1.5-B both DONE (specs green, parity clean at child level).

---

## Bootstrap

**Identity**: WATCHDOG (audit only — authors no spec/MD/XLSX). Clean re-load.
**Tools**: `Workflow` (multi-agent do-or-die audit, Opus-class fresh-context subagents; never Haiku for judgment). `/identity`, `/audit`, `/regression-guard`, `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_W15_0_RECON.md`, `_W15_A_OVERRIDE_FCC.md`, `_W15_B_TOOLBAR_IO_FCC.md`, `SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md` (the S4 workflow this mirrors), `.claude/rules/{pipeline,specs,inventory,plan-closure,baseline,angular,browser-tool}.md`, `docs/read_only_docs/{LEARNED_RULES.md,AGENT_SHARED_RULES.md}`, `clients/encore/CLAUDE.md`, `clients/encore/specs_planning/_internal/agent-mistakes.md`, deliverable tooling (`scripts/check-tc-parity.ts`, `xlsx-vocab-lint.mjs`, `export_test_cases/to-xlsx.ts`).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm WV1.5-A + WV1.5-B DONE. 2. **POM-shape gate**. 3. Clean artifacts + run the Wave-1.5 suite fresh BEFORE any RCA (LR-024); read failure-summary first (LR-018). 4. LR scan: LR-020, LR-022, LR-027, LR-040, LR-046, LR-048, LR-055, LR-ENC-002, LR-ENC-004, ALL-026, AUD-017. 5. `BrowserTool=cli`, `-s=cpr-w15-closure`.

---

## Phase 0.5b — Baseline-first walk (REQUIRED — WATCHDOG + "closure/audit" title)

1. Consume WV1.5-0 baseline-absent note. `## Baseline diff` = "baseline-absent; live-discovered nodes; intent oracle = live DOM + Q-WV15 clarifications".

---

## Phase 1 — DO-OR-DIE audit workflow (Stage A→D, multi-agent)

**Stage A — DEMAND DERIVATION (fan-out; discover obligations, don't assume them).** Agents read framework path-rules / cross-cutting / client+mistakes / deliverable-tooling / the Wave-1.5 plan-contract → dedup into ONE obligation checklist → emit `clients/encore/specs_planning/_internal/corp-pricing-w15-audit-demands-<MCP-DATE>.md`.

**Stage B — AUDIT (one agent per dimension; PASS/FAIL per obligation, file:line evidence):**
- **B1 XLSX** — Override + toolbar-I/O new rows vs MD vs spec counts EXACT; new-content quality benchmarked against existing module rows; LR-ENC-004 invariants; `xlsx:build` + `xlsx:lint` clean.
- **B2 Specs** — FCC two-describe shape; LR-019 per-test baseline; LR-022 (no hardcoded counts); LR-009/011 where numeric; no `data-testid` assumptions; no `test.fixme`/stubs (GEN-006); false-green (assert persisted live values after reload).
- **B3 Reuse (ALL-026)** — Override/toolbar helpers reuse `CorporatePricingBasePage`; flag any un-extracted repetition; the WV1.5-B trigger helper is shared, not copy-pasted.
- **B4 Locators** — testid-first→role→grid-header→content-anchor; LR-017 namespace registered; zero hardcoded env in selectors; no reuse of `selectors/locations/pricing.ts`.
- **B5 Pages** — extend the base; JSDoc; `typecheck` clean.
- **B6 MD + test-plan parity** — spec ⊆ MD ⊆ XLSX via `check:tc-parity`; LR-ENC-002 structural (landed WITH the spec); Selector-Mapping table present.
- **B7 Divergence-filing** — the undocumented Override screen (Q-WV15-1) + Export/Import variants (Q-WV15-2) were RAISED via `/encore-questions`, not silently absorbed; every TC traces to the live inventory OR labelled `[inference]`; WV1.5-B's real-I/O deferral is grep-verifiable in EDGE_P3 (LR-040(b)).
- **B8 Process artifacts** — activity-log row (LR-028); field-inventories (8 keys/7 sections, LR-014); missing-testid report (LR-029); the **Override fixture** actually used + restore proven across re-runs (zero cross-run drift); bands 5NN/6NN non-colliding.

**Stage C — ADVERSARIAL VERIFY (≥3 perspective-diverse skeptics per PASS).** Each Stage-B PASS handed to skeptics prompted to REFUTE "this corner is clean" (default refuted if uncertain); a PASS survives only if a majority cannot break it. Every FAIL confirmed real.

**Stage D — SYNTHESIS + DO-OR-DIE GATE.** Aggregate every obligation → `VERIFIED-CLEAN | DEFECT | UNVERIFIABLE`. **ANY `DEFECT` or `UNVERIFIABLE` = RED = HALT** — route back to WV1.5-A/B (HEALER) or the scaffold; **re-run the whole workflow after fixes until 100% VERIFIED-CLEAN**. Emit `clients/encore/specs_planning/_internal/corp-pricing-w15-closure-audit-<MCP-DATE>.md`.

---

## Phase 2 — GARDENER dedup (GATED on Stage-D 100%-clean)

ALL-026 sweep across the Override/toolbar page-object + helpers; extract any 2+ repetition into `CorporatePricingBasePage`. Structural only; `typecheck` clean. If extraction occurs, the produced file becomes a path cell here at closure.

---

## Phase 3 — Master annotation (GATED on Stage-D 100%-clean; F16 — does NOT flip parent)

Annotate `PLAN_CORP_PRICING_MASTER.md` with a "P1.5 milestone delivered" block (coverage, parity, divergences raised); move WV1.5-0/A/B/99 to `plans/done/` per LR-027; annotate each child's DONE line in the master body. **Parent stays PENDING** — Wave-2 + Wave-3 still gate. `npm run plans:reindex`.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | `(none)` | n/a |
| GIVER | (none — WATCHDOG authors no test artifacts) | `(none)` | n/a |
| BUILDER | (none) | `(none)` | n/a |
| HEALER | (none — routes defects back to WV1.5-A/B) | `(none)` | n/a |
| WATCHDOG | demand checklist + do-or-die closure verdict | `clients/encore/specs_planning/_internal/corp-pricing-w15-audit-demands-<MCP-DATE>.md`<br>`clients/encore/specs_planning/_internal/corp-pricing-w15-closure-audit-<MCP-DATE>.md` | both files exist + verdict = VERIFIED-CLEAN |
| GARDENER | dedup citation (if 2+ repetition) | `(skipped: conditional — extraction into CorporatePricingBasePage only if Stage-B B3 finds repetition; becomes a path cell if it occurs)` | `npm run typecheck` exit 0 |

---

## Acceptance criteria (strict — do-or-die)

- [ ] Demand checklist DERIVED from source (every obligation cites file:line) — not hardcoded.
- [ ] EVERY obligation has a verdict; **ZERO `UNVERIFIABLE` permitted** (unverifiable = RED).
- [ ] EVERY Stage-B PASS survived ≥3 adversarial skeptics.
- [ ] XLSX new-row counts exact vs MD+spec; quality-consistent with existing rows; `xlsx:lint` clean; zero LR-ENC-004 violations.
- [ ] Zero ALL-026 un-extracted repetitions; zero hardcoded-env in selectors; zero data-testid assumptions; zero `test.fixme`/stubs.
- [ ] Every divergence FILED (Q-WV15-1/2); WV1.5-B real-I/O deferral grep-verifiable in EDGE_P3; every TC traces to inventory or `[inference]`.
- [ ] **DO-OR-DIE**: one DEFECT/UNVERIFIABLE anywhere ⇒ RED ⇒ HALT ⇒ no closure. Re-run until 100% VERIFIED-CLEAN. No rounding to YELLOW.
- [ ] **Verdict floor**: RED ⇒ no master annotation, no `git mv` to `done/`.
- [ ] On VERIFIED-CLEAN: master annotated (NOT flipped — F16); children moved to `done/`; `plans:reindex` clean; activity-log row (LR-028).

---

## Handoff

Wave-1.5 do-or-die closure. Mirrors S4. On 100%-clean: annotates the master P1.5 milestone (parent stays PENDING per F16), closes WV1.5-0/A/B/99. RED on any defect → re-run.
