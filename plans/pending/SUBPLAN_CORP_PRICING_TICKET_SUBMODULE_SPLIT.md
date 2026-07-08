# SUBPLAN — Corporate Pricing: split toolbar-io into one real submodule per NM ticket

**Status**: PENDING
**Priority**: P1
**Created**: 2026-07-08
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: none
**Blocks**: SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**BrowserToolJustification**: verification runs the existing Playwright suite (test runner, not agent-driven browsing); no live UI walk in this subplan.

---

## Context

Branches `nm2262`/`nm2264`/`nm2305` on `encore-mock` are byte-identical: all three tickets' tests live in ONE spec (`clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts`) under ONE registry submodule (`TIO`), and each branch ships that same file + the same `corporate_pricing_toolbar_io` sheet. User decision: full split — each ticket becomes its own real submodule (registry code, renumbered TC-IDs, own docs, own Excel sheet, own spec), then re-ship so each branch carries only its own ticket.

Provenance: executes the council-audited plan `~/.claude/plans/steady-meandering-crab.md` (Plan v2 — Copilot council: gpt-5.5 reviewer `VERDICT: MATERIAL_ISSUES` + opus-4.6 deep-read + sonnet sweep; every claim hand-verified against the repo). Two v1 errors corrected in v2: TC-048 is a live Manual MD case (not "never-minted"), and 4 exporter/parity files carry hardcoded submodule mirrors that must be updated atomically with the registry.

New submodules: `LEX` (Loc Pricing Export = NM-2262), `EXA` (Export ▾ dialog/Export-All = NM-2264), `LIM` (Loc Pricing Import = NM-2305). Baseline `TIO` keeps TC-001..017.

---

## Bootstrap

**Identity**: OWNER (orchestrator). Per-phase adoption: **BUILDER** for Phase B (spec writes), **GIVER** for Phase C (test-case/test-plan writes). Council edit-workers (opus-4.6) physically author the pipeline files under exact Claude-authored specs; Claude hard-audits every diff.

**Skills auto-called**:
- `/identity` (Step 1.5 gate; BUILDER at Phase B, GIVER at Phase C)
- `/ultra-agents` (active — Copilot council does the labor; Claude gates + commits + ships)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5 injection)
- `/audit` (Phase 3 post-execution)
- `/final-q` (Phase 4 exit per LR-042)

**Context files** (every rule this subplan depends on):
- Parent: `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md`
- `.claude/rules/pipeline.md` — LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-049, LR-050, LR-060
- `.claude/rules/data.md` — LR-001, LR-002 (catalog↔impl parity)
- `.claude/rules/deliverable.md` — LR-049, LR-058 (no internal jargon in shipped source)
- `.claude/skills/ultra-agents/worker-ext.md` — council mode + delegation receipt
- `.claude/context/navigation.md` §B/§C, `.claude/context/patterns.md`
- `export_test_cases/module-codes.json` (single source of truth for module/submodule codes)

---

## Phase 0 — Dependency + tool gate

- Registry drift gate is live: `scripts/check-tc-parity.ts:291-303` hard-throws if `types.ts` KNOWN_SUB_CODES ≠ `module-codes.json` code set ("Mint codes in the registry FIRST, mirror in types.ts"). ⇒ Phase A must be ATOMIC across all 4 files.
- Council infra verified live (both agent files present, `copilot-worker.sh` executable, ledger clean).
- No browser dependency. LIM spec mutates office 5897 (serial `--workers=1`).

---

## Phases

### A — Registry + hardcoded mirrors (ONE atomic edit set — Claude-direct, too critical to delegate)

Add `LEX`/`EXA`/`LIM` under `CPR` in `export_test_cases/module-codes.json` (name/display/sheet/mdBasename) + `idRenames` summary entries, AND mirror in the 3 hardcoded files that are NOT registry-derived:
- `export_test_cases/types.ts` KNOWN_SUB_CODES (drift gate).
- `export_test_cases/to-xlsx.ts` SHEET_NAMES + SHEET_DISPLAY_NAMES (+ line-14 sheet-list comment).
- `export_test_cases/to-csv.ts` TAB_MAP (precondition phrase per submodule).

Sheet names (≤31): `corporate_pricing_loc_export` (28) / `corporate_pricing_export_all` (28) / `corporate_pricing_loc_import` (28). `xlsx-lint` C8 + `xlsx-trim.mjs` derive from the registry dynamically — no further edits. Historical closure manifests stay frozen.

### B — Specs (BUILDER; council edit-workers + Claude hard-audit each diff)

- Create `corporate-pricing-loc-export.spec.ts` (lift the NM-2262 describe + `const LOC`), `corporate-pricing-export-all.spec.ts` (lift the 3 NM-2264 describes + `expectWellFormedExportMatrix` + local `VARIANTS/EXP/CUR`), `corporate-pricing-loc-import.spec.ts` (lift the NM-2305 describe incl. its pre-describe block + `resolve` import).
- Renumber titles per the map below. Each new file: own plain-English JSDoc header (NM-#### allowed; zero internal jargon — LR-058). New tags: `@corporate-pricing @loc-pricing-export` / `@export-all` / `@loc-pricing-import`.
- Slim `corporate-pricing-toolbar-io.spec.ts` to TC-001..017 + rewrite its stale header.
- Data module `src/data/corporate-pricing/toolbar-io.ts` stays SHARED (page object imports all 4 API constants; `locExport.expectedHeaders` consumed by both LEX and LIM). New specs import from it.

### C — Docs (GIVER; council lifts + Claude authors new LIM content)

- Split `corporate_pricing_toolbar_io_test_cases.md` and `..._test_plan.md` into per-submodule docs (registry mdBasename) per the audited line-map. Apply the renumber map to ALL content incl. `Depends_On` + Notes bodies. Cross-submodule `Depends_On` (EXA→TIO-001, LIM-*→TIO-013) KEEP the TIO IDs (still live in the TIO doc) + gain a "(baseline toolbar submodule)" annotation.
- **Author the missing LIM Scenario sections** — the test-plan currently stops at TC-040 (041..051 exist only as Coverage-Index bullets; pre-existing gap). This is NEW GIVER content, not a pure lift → council-reviewer pass + Claude gate before commit.
- Each new doc frontmatter points at its own spec + recomputed totals (TIO 17 / LEX 7 / EXA 16 / LIM 11).

### D — XLSX rebuild

`npm run xlsx:build` (root). Verify: 3 new sheets exist, TIO sheet holds only 001..017, per-sheet TC-ID sets match the map.

### E — Ripple updates (all hand-verified pending artifacts, LR-020)

- `plans/pending/SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md` — retarget to its OWN new submodule/spec/branch; forbid reuse of vacated TIO-018+ IDs (its Phase-1 drift-fix of TIO-007..011 in the slimmed toolbar-io stays valid).
- `plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md` — one-line "(re-homed to LEX/EXA/LIM)" annotations on the 3 DONE rows (history stays).
- `plans/pending/SUBPLAN_OPI_G_MIGRATE_CORP_PRICING.md` — add the 3 new spec files to its lists.
- `.claude/context/navigation.md` — registry rows.
- `src/data/corporate-pricing/toolbar-io.ts` JSDoc consumer list.

### F — Verification (before any commit/claim)

- `npx playwright test --list` per file (cwd `clients/encore`): TIO=17, LEX=7, EXA=16, LIM=10 declarations.
- Zero-stale-ID grep = ZERO hits: `TC-CPR-TIO-0(1[89]|2[0-9]|3[0-9]|4[0-9]|5[01])` across tests/src/test-cases/test-plans.
- Root: `npm run check:tc-parity` exit 0 + `npm run check:spec-quality` (working tree, LR-060 ob.4) + `npx tsc --noEmit` per client tsconfig.
- Run each new spec individually `--workers=1` (LIM mutates office 5897), then the corporate-pricing dir suite. Green = LEX/EXA/LIM fully green + zero NEW failures vs today's baseline; the 4 known NM-2265-owned reds (TIO-008..011, Import ▾ dialog drift) are documented, expected, out of scope.

### G — Commit (ONE commit; must precede ship)

One commit carrying registry+specs+docs+xlsx together (Gate 5a xlsx-freshness fires on any of them) through the full pre-commit gate stack. `ship-branch.sh` archives HEAD → uncommitted work never ships.

### H — Re-ship (Claude-only, LR-049; never a worker)

Add branch presets to `scripts/ship-branch.sh` (`nm2262 → loc-export* / CPR.LEX`; `nm2264 → export-all* / CPR.EXA`; `nm2305 → loc-import* / CPR.LIM`). Dry-run each (deny-list exit 0 on a CLEAN `git archive` extract) → `--push` force-with-lease. Proof: the 3 branches' spec files + xlsx sheet lists now DIFFER (SHA256 + workbook sheet names). `corporate-pricing` module branch re-shipped too (carries all 4 files + all CPR sheets via `--modules=CPR`).

### I — Bookkeeping

Activity-log rows (LR-028), `npm run plans:reindex` (LR-035), formal closure (LR-027/040/060), `/reflect` + delegation receipt.

---

## Renumber map (single source; applied to spec titles, MD headers/bodies/Notes, test-plan, Depends_On)

| Old | New | Notes |
|---|---|---|
| TIO-001..017 | unchanged | baseline stays TIO |
| TIO-018..024 | **LEX-001..007** | LEX-007 = old 024 (Manual data-blocked; `test.skip` stays) |
| TIO-025..040 | **EXA-001..016** | |
| TIO-041..051 | **LIM-001..011** | LIM-008 = old 048 (Manual, MD-only; TC-041 note "see TC-048" → "see LIM-008") |

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline / REQUIREMENTS.md | (none) — no new app behavior; tickets already have baseline from prior NM work | (none) |
| GIVER | test-cases.md, test-plans.md, XLSX workbook | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_loc_export_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_export_all_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_loc_import_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_loc_export_test_plan.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_export_all_test_plan.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_loc_import_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | tests/corporate-pricing/*.spec.ts | `clients/encore/tests/corporate-pricing/corporate-pricing-loc-export.spec.ts`<br>`clients/encore/tests/corporate-pricing/corporate-pricing-export-all.spec.ts`<br>`clients/encore/tests/corporate-pricing/corporate-pricing-loc-import.spec.ts` | `npx playwright test --list` resolves LEX/EXA/LIM TC IDs |
| HEALER | per-fix MD update | (none) — no RCA-driven fix in scope | (none) |
| WATCHDOG | findings table | (none) — audit is inline `/audit`, no findings artifact emitted | (none) |
| GARDENER | refactor citation | (none) — no structural framework refactor | (none) |
| OWNER | registry, exporter mirrors, xlsx, ripple plans, ship script | `export_test_cases/module-codes.json`<br>`export_test_cases/types.ts`<br>`export_test_cases/to-xlsx.ts`<br>`export_test_cases/to-csv.ts`<br>`scripts/ship-branch.sh` | `npm run check:tc-parity` exit 0; `npx tsc --noEmit` clean |

---

## Acceptance criteria

- [ ] Phase A atomic: `npm run check:tc-parity` exit 0 (drift gate green) after registry+3 mirrors updated together.
- [ ] 3 new spec files exist; `toolbar-io.spec.ts` slimmed to 001..017; `--list` counts = TIO 17 / LEX 7 / EXA 16 / LIM 10.
- [ ] Zero-stale-ID grep returns **zero** hits (strict line — LR-046: HALT-and-ask if state can't reach zero).
- [ ] 3 new test-cases MD + 3 new test-plan docs exist; LIM Scenario sections authored; recomputed totals correct.
- [ ] XLSX: 3 new sheets present; TIO sheet = 001..017 only.
- [ ] `npm run check:spec-quality` passes on the working tree (LR-060 ob.4) before any green claim.
- [ ] Each new spec green individually + zero NEW failures vs baseline (TIO-008..011 reds documented as NM-2265 scope).
- [ ] ONE commit precedes ship; deny-list gate exit 0 on clean extract per branch.
- [ ] nm2262/nm2264/nm2305 branches now DIFFER (spec SHA256 + xlsx sheet names); each carries only its own ticket's **spec + sheet**. Shared `src/` (page object, data module, import fixtures) ships whole on every branch by existing design (Locked Decision 3) — branch isolation is spec+sheet level, NOT `src/` level.

---

## Deferral Authorization

**Deferred phase**: Phase H — the outbound re-ship (`ship-branch.sh --push` for nm2262 / nm2264 / nm2305, plus the broader all-deliverable-branch re-ship). Phases A–G (registry, specs, docs, xlsx, ripple, ONE local commit) are complete on disk + verified; only the outbound push is held.

**Status impact**: this subplan stays `PENDING` until the push lands and the branch-difference proof (spec SHA256 + xlsx sheet-name diff, deny-list exit 0 per branch) is captured. Do NOT flip `Status: DONE` before then (LR-060 obligation 1).

**Authorized by** (user, 2026-07-08 chat, verbatim): "hold on pushing until the parallel work is done, rest u do ur stuff, just dont push, hold final trigger so latest changes can be completed on disk before we push the deliverables, we may need to push all deliverables that we previously did on the deliverable branch."

**Reason**: parallel deliverable-code changes are landing on disk; `ship-branch.sh` archives `HEAD`, so the push must wait until every on-disk deliverable change is committed, then re-ship all deliverable branches together.

**Resume trigger**: user's explicit go after parallel work completes → Phase H dry-run (deny-list exit 0 per branch) → `--push` force-with-lease; re-ship the `corporate-pricing` branch (+ any other deliverable branches named) in the same pass.

---

## Handoff

Chat-only per `feedback_handoff_in_chat_only.md`; outcomes-only per LR-039. Delegation receipt (ledger run_ids + Claude Agent-spawn count) emitted at goal end per worker-ext.
