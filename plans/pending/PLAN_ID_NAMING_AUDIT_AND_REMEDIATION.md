# PLAN_ID_NAMING_AUDIT_AND_REMEDIATION — repo-wide ID/naming consistency audit + gated remediation

> **CROSS-REF (2026-06-11 · PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT):** this plan's Phase-6 open question — "`scripts/_gen-testrail.ts` 'THROWAWAY' header vs load-bearing reality — promote or keep?" — is **answered RETIRE**. PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT deleted `_gen-testrail.ts` + the `encore_test_cases_testrail.xlsx` twin and folded the TestRail step-expanded layout into the single `encore_test_cases.xlsx` (emitted by `to-xlsx.ts` via the shared `export_test_cases/testrail-format.ts`).

> 🤖 **SESSION BOOTSTRAP — being executed interactively by OWNER in the session that authored it (user-approved via plan mode, 2026-06-10). Not chain-spawned.**
>
> **HALT + ASK** if: a gate ruling is ambiguous / a rename collides with an existing ID / parity or lint stays red after 2 evidence-based fix attempts / any strict line below cannot be satisfied as written (LR-046).

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-10
**Identity**: OWNER
**Parent**: (none — top-level governance plan)
**Depends on**: (none)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

User found `TC-LOC-CPR-608` in Corporate Pricing while Local Office uses `TC-LOS-HIS-002` and Locations uses `TC-LOC-CUR-009`. Verified during planning:

- Repo convention is `TC-{MODULE}-{SUBMODULE}-{NNN}`; Corporate Pricing (a top-level module) carries the Locations segment `LOC`, with its real submodule encoded in number bands (001/1xx/2xx/3xx/[4xx reserved → History NM-1444]/5xx/6xx). Prefix + bands were planned (`plans/done/SUBPLAN_CORP_PRICING_00_FOUNDATION.md` F10 reservation) with no recorded rationale for `LOC`. The client's own Jira seed helpers used `TC-ENC-PRC-*`.
- Confirmed corruption: `export_test_cases/to-csv.ts` `extractModule()` derives module from ID segment-1 → corp-pricing rows in `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` carry Module="locations", contradicting both the MD headers (`**Module**: corporate-pricing`) and the TestRail workbook (`scripts/_gen-testrail.ts` SHEET_META says "Corporate Pricing").
- Root cause class: existing gates (check-tc-parity guardrails 1–5, xlsx-lint C1–C7, vocab lint, verify-no-forbidden) are syntactic/set-based; none validates ID-segment ↔ module/sheet congruence.
- Additional candidates: BUG-ID scheme drift (BUG-CPR-001 vs BUG-LOC-CPR-*; 2-seg vs 3-seg same-module; BUG-SET/LS/LO ambiguity; TC-LOC-SSL vs BUG-LOC-SHR), TAB_MAP alias drift (PRI+PRC, LI+LCL, HIS+HST, HIST+HISL), numbering gaps (TC-LOC-LI-070, TC-LOS-BAS-042/043 — gap-cause must be git-verified; never renumber).
- Two scare-claims already disproven in planning (TC-LOC-MGH refs in notes MD = relocation cross-refs; TC-ENC-PRC = client seed provenance in plans only) → every finding gets adversarial verification before user ruling.

**User decisions (2026-06-10, AskUserQuestion)**: ① full consistency sweep (TC + BUG IDs + Module/Submodule columns + sheet names + code aliases + cross-refs); ② fix approved items in-session after per-pattern approval gates; ③ permanent registry-driven guards; ④ delete temp `encore_test_cases_testrail_corp_pricing.xlsx`.

---

## Bootstrap

**Identity**: OWNER (whole plan — cross-cutting governance; OWNER edits to pipeline-owned paths get activity-log rows per LR-028/feedback_owner_activity_log).
**Skills**: /final-q at exit; /reflect at closure. Audit phase runs as a multi-agent Workflow (user ultracode opt-in 2026-06-10 lifts the 5-parallel cap for this goal).
**Context files**: `.claude/context/navigation.md`; `scripts/check-tc-parity.ts`; `scripts/xlsx-lint-rules.mjs`; `export_test_cases/to-csv.ts`, `to-xlsx.ts`, `blocked-reasons.json`; `scripts/_gen-testrail.ts`; `.claude/rules/pipeline.md` (LR-027/040/041/046/048/050/055); `.claude/rules/specs.md` (LR-018/019); `clients/encore/CLAUDE.md` (LR-ENC-002/003/004); `docs/read_only_docs/LEARNED_RULES.md` (LR-028/034).

---

## Phase 0 — Dependency + tooling gate, baselines

- BrowserTool: none (repo-artifact work only). No subplan dependencies.
- Isolation commit of prior-session dirt (navigation.md + 6 plans/done corp-pricing subplans) — DONE pre-plan-commit (3dc11f49). Remediation commits use explicit `git add <paths>`.
- Artifact home: `clients/encore/specs_planning/_internal/id-audit-2026-06-10/`.
- Baselines captured to artifact home: `npx playwright test --list` → `baseline-list.txt`; exceljs read-only dump of both workbooks → `baseline-xlsx-dump.json`; `npm run check:tc-parity` + `npm run xlsx:lint` green pre-audit (HALT if red).
- `git tag audit-pre-remediation`.

## Phase 0.5b — Baseline-first walk

`baselineScope: baseline-absent / not-applicable` — this is a repo-artifact governance audit (IDs, workbooks, validators); no live-site surface is walked and no old-site baseline exists for repo artifacts. No `old-site-baseline/` artifact is emitted or consumed.

## Phase 1 — Audit workflow (Workflow tool; find → verify → synthesize)

10 read-only finder agents (F1 MD grammar · F2 specs · F3 both workbooks · F4 export-pipeline code tables · F5 BUG census · F6 test plans · F7 sequence gaps + git gap-cause · F8 cross-ref integrity (blocked-reasons keys, TERSE_REASON_ALLOWLIST, field-inventories/catalogs) · F9 live-state docs + LIVE-vs-HISTORICAL file inventory · F10 validation-gap matrix) → mechanical dedup (`{CLASS}::{SUBJECT_KEY}`) → 3-lens adversarial verification per merged finding (A Evidence-Skeptic re-derives from primary artifacts; B Design-Intent Historian classifies PLANNED-WITH-RATIONALE/PLANNED-NO-RATIONALE/UNPLANNED-DRIFT/RELOCATION-BY-DESIGN; C Blast-Radius scores S0-shipped-wrong…S3-cosmetic) → synthesis into pattern classes. Persisted: `findings-raw/`, `findings-merged.json`, `verdict-report.md` in the artifact home. AUD-017: synthesis may not overturn a Lens-A REFUTED — orchestrator personally reads cited evidence first and records it.

## Phase 2 — Verdict report + user approval gates

Verdict report block per pattern class (verdict chain, cost-to-FIX vs cost-to-KEEP, recommendation). AskUserQuestion gates: **Gate 1** PC-1/2/3 (TC-LOC-CPR ruling: A full re-grammar+renumber / B re-grammar keep numeric tails / C keep IDs + registry override fixes Module column + allowlist / D = C now, rename deferred; surfaces that both workbooks were already delivered) + client-communication artifact if A/B. **Gate 2** BUG-ID style (standardize-3-segment / register-only / defer). **Gate 3** hygiene batch (alias collapse, gap ledger, cross-ref fixes). **Gate 4** guard strictness (FAIL now / WARN burn-in / new-IDs-only). No fix proceeds without its gate ruling.

## Phase 3 — Remediation (approved items only)

3.0 **`export_test_cases/module-codes.json` registry first** (JSON not code — consumers span CJS ts-node `check-tc-parity.ts` and ESM `xlsx-lint-rules.mjs`; repo's only TS↔MJS share pattern is twin-file+drift-test, a drift surface a registry must avoid). Keys: `modules`, `submodules` (+`aliases`, sheet), `idPrefixOverrides`, `exceptions` (allowlist — matched exceptions print NOTE lines, never silent), `bugPrefixes`, `gapLedger`. Load-time shape self-test in each consumer.
3.1 **TC rename iff Gate-1 = A/B**, one synchronized change (LR-ENC-002): rename-map gen with global-uniqueness assert vs union of ALL existing TC IDs (HALT on collision) → 6 specs (titles + dependsOn; Node utf8 rewrites, longest-key-first) → 6 MDs → 6 test plans → `blocked-reasons.json` keys → registry/code tables → `npm run xlsx:build` → `_gen-testrail.ts` → parity+lint → LIVE docs only (navigation.md §C, corp field-inventories/catalogs). `plans/done/*` untouched (historical records; closure manifests hash content; rename-map.csv is the bridge). If Gate-1 = C/D: registry `idPrefixOverrides` + exception entry; regen both workbooks (PC-3 Module fix ships regardless).
3.2 **BUG-ID standardization iff Gate-2 approves**: registry `bugPrefixes`; rename on-disk JSONs (+`formerIds` ledger); LIVE refs only; regen+lint proves no BUG ID leaks into the workbook.
3.3 **Hygiene iff Gate-3 approves**: TAB_MAP alias collapse (legacy codes → registry `aliases`, WARN on use); `gapLedger` entries with git-archaeology verdicts (no renumbering); individual cross-ref fixes.
3.4 Delete untracked temp `clients/encore/test_cases_xlsx/encore_test_cases_testrail_corp_pricing.xlsx` (user-approved 2026-06-10).

## Phase 4 — Permanent guards (land before the rename commit, allowlist pre-seeded per Gate 4)

- `scripts/check-tc-parity.ts` **Guardrail 6** (registry-driven): 6a unregistered module code FAIL · 6b module code ≠ containing-path module FAIL-unless-exception · 6c submodule code unregistered/≠ basename FAIL (alias = WARN) · 6d XLSX Module/Submodule cells ≠ registry display FAIL · 6e sheet name ≠ registry FAIL · 6f orphan blocked-reasons/allowlist keys FAIL · 6g undocumented new gap WARN. **Guardrail 7**: BUG-ID grammar (strictness per Gate 4).
- `scripts/xlsx-lint-rules.mjs` **C8**: row Module/Submodule = registry display for sheet AND ID-prefix maps (incl. overrides) to same module; exported `loadModuleRegistry()`; rides existing build/commit(5b)/ship wiring, zero hook changes.
- Hook 5 trigger regex extension (pre-commit: also fire parity on `module-codes.json` + `test-cases/**` changes) — flagged to user before edit (hooks are infra).

## Phase 5 — Verification matrix

V1 registry shape self-tests · V2 `npm run check:tc-parity` exit 0 (exception NOTE lines only) · V3 `npm run xlsx:lint` exit 0 · V4 sheet-name unit test · V5 `--list` census count == baseline, 0 old-prefix hits (iff rename) · V6 old-ID residue grep 0 hits in LIVE files (excl. plans/done, closure manifests, audit artifacts) iff rename · V7 structured xlsx diff vs baseline dump — expected cell deltas only, per-sheet row counts unchanged · V8 xlsx freshness check green · V9 5 green corp suites individually green (`.env.local`; iff spec files changed) · V10 toolbar-io failure set == exactly the 10 known-red W15-B stale tests (pre-registered; any other membership = HALT) iff spec files changed · V11 `verify-no-forbidden.mjs` green · V12 hook dry-run commit passes · V13 guards negative-tested: synthetic wrong-module fixture + pre-fix workbook copy must FAIL guardrail-6/C8 · V14 `npm run validate:activity-log:preflight` green.

## Stale-cleanup enumeration (LR-050)

1. Temp `encore_test_cases_testrail_corp_pricing.xlsx` — delete (Phase 3.4); verify: `Test-Path` false.
2. TAB_MAP duplicate alias entries in `to-csv.ts` — collapse into registry `aliases` iff Gate-3 approves; verify: grep TAB_MAP for retired codes returns registry-comment only.
3. `scripts/_gen-testrail.ts` "THROWAWAY" header vs load-bearing reality — Phase 6 user question (promote or keep); no unilateral change.
4. Stale `TC-LOC-CPR` references in LIVE docs after rename (navigation.md, field-inventories, catalogs) — V6 grep gate.
5. `.recover-scratch/` stale-ID debris (TC-023-030 etc.) — REPORT-only in verdict report; not acted on without user approval (out of approved scope).

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none — no live-site walk; baseline-absent per Phase 0.5b) | (none) | (none) |
| GIVER | test-cases MDs, test-plans, XLSX workbook (corp-pricing set; OWNER-executed per LR-028 activity log) | clients/encore/test_cases_xlsx/encore_test_cases.xlsx (regenerated) <br> clients/encore/specs_planning/_internal/id-audit-2026-06-10/verdict-report.md | `npm run check:tc-parity` exit 0 |
| BUILDER | specs/corporate-pricing/*.spec.ts title/dependsOn renames (iff Gate-1 = A/B; OWNER-executed) | clients/encore/specs_planning/_internal/id-audit-2026-06-10/id-rename-map.csv | `npx playwright test --list` count == baseline |
| HEALER | (none — no failing-spec RCA in scope) | (none) | (none) |
| WATCHDOG | findings tables (audit-driven; no spec/MD/XLSX edits in audit phase) | clients/encore/specs_planning/_internal/id-audit-2026-06-10/findings-merged.json | findings file exists + every pattern class carries a 3-lens verdict chain |
| GARDENER | (none — structural refactors limited to registry-driven table reads, covered under OWNER rows above) | (none) | (none) |

(Cells updated at closure to reflect gate rulings — e.g. BUILDER row flips to `(skipped: Gate-1 ruling C — no rename)` if applicable. Honest-state discipline per LR-055 C6.)

## Acceptance criteria

- [ ] Audit workflow completed; findings-merged.json + verdict-report.md exist with 3-lens verdict chains per pattern class.
- [ ] User ruled on Gates 1–4; rulings recorded verbatim in verdict-report.md.
- [ ] Approved remediations applied; non-approved patterns recorded as BY-DESIGN (registry exception) or DEFERRED with tracking note.
- [ ] `module-codes.json` registry exists; guardrail 6 (+7) and C8 landed and negative-tested (V13).
- [ ] Verification matrix V1–V14 executed; each item green or HALT-escalated.
- [ ] Temp testrail corp xlsx deleted.
- [ ] Activity-log row appended; navigation.md §C audit row added; plan moved to done with Execution Summary + deviations log.

## Handoff

Chat-only at session end (LR-039/feedback_handoff_in_chat_only): outcomes + gate rulings + deviations summary before /final-q. No repo handoff files.
