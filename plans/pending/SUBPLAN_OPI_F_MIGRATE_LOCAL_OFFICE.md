# SUBPLAN_OPI_F_MIGRATE_LOCAL_OFFICE — migrate Local Office Settings + ECT to per-office

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT.md
**Blocks**: SUBPLAN_OPI_Z_FINAL_FLIP_AND_CLEANUP.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: n/a

---

## Context

Migrates the separate Local Office Settings page (`/settings/local-office`, distinct URL/page per LR-017) specs — `local-office-settings` (Basic Information: date offsets, checkboxes, phone, PO fields) and `local-office-ect` (ECT Settings, section-specific Save buttons). The ECT tab uses SECTION-specific Save buttons (e.g. `ect-settings-btn-save-fixed-costs-btn`), NOT the shared Save Changes dialog (LR-ENC-001) — a pool office whose ECT section set differs would break section-save selectors, so OPI_B's structural-parity check on ECT sections (F10.4) gates this. Owns **F8.4 (local-office), F10.4**. No new TCs → no Phase 0.5b. (Local-office HISTORY row identity is handled in OPI_E.)

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (gate) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/rca` (`--workers=2` flake — HEADED cli) · `/final-q` (exit)

**Context files**:
- parent + `plans/done/SUBPLAN_OPI_C_*` (recipe) + `plans/done/SUBPLAN_OPI_B_*` (per-office local-office baselines + ECT section parity)
- `.claude/rules/specs.md` (LR-018/019/024), `.claude/rules/browser-tool.md`, `.claude/rules/data.md`
- `clients/encore/CLAUDE.md` (LR-008 date offsets, LR-017 page boundary, LR-ENC-001 ECT section-save gotcha, LR-ENC-002 parity, LR-036 boolean render)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm OPI_C in `plans/done/`.
2–5. navigation.md, agent-mistakes (GEN-*/ALL-*), patterns.md, LR scan (LR-008/017/036, LR-ENC-001 ECT).
6. **Browser-tool**: `BrowserTool=cli`. Runner for spec runs; `--workers=2` flake RCA = HEADED cli.

---

## Phase 1+ — Actual work (OPI_C recipe per spec)

1. **local-office-settings** (`local-office-settings.data.ts` + spec) — `DATE_OFFSET_DEFAULTS`, `CHECKBOX_DEFAULTS`, `DEFAULT_PHONE_1`, default order type, PO fields → per-office editable maps (BAS-001 comprehensive baseline resets to per-office values). Keep LR-008 positivity RULES flat. `reloadBasicInfo(officeNo)` → `office` fixture.
2. **local-office-ect** (`local-office-ect.data.ts` + spec) — ECT values → per-office FIXED maps; confirm each pool office exposes the SAME ECT sections (F10.4, from OPI_B) so section-save selectors (`ect-settings-btn-save-*`) resolve. If any pool office lacks a section a test exercises → flag to OPI_B for pool replacement (do NOT silently skip).
3. Both specs: live-read each pool office's values for these tabs at migration (LR-015, reconcile vs nav2 F5.1, dated provenance — no OPI_B pre-capture); `OFFICE_NO`→`office` fixture; resolve `*For(office)` in-body only (F1.1); Save-enabled-before-confirm (F2.2); run `--workers=1` (==today) then `--workers=2` isolation.

**Sonnet boundary**: data + spec edits [SONNET-SAFE]; ECT section-save verification + `--workers=2` RCA [OPUS-ONLY].

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Stray `'1604'` in touched files → DO-NOW. ECT section-parity gap → APPEND grep-verifiable line to OPI_B (pool replacement) and notify user. No bare "out of scope".

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — captured in OPI_B | (none) |
| GIVER | test-cases / test-plans / XLSX | (skipped: data-sourcing refactor only, no TC semantics change; parity verifies clean) | `npm run check:tc-parity` exit 0 |
| BUILDER | `tests/local-office/local-office-settings.spec.ts`, `tests/local-office/local-office-ect.spec.ts` (+ their data) | per-office maps + `office`-fixture specs; first-run pass | `cd clients/encore && npx playwright test tests/local-office/local-office-settings.spec.ts tests/local-office/local-office-ect.spec.ts --list` |
| HEALER | per-fix MD | (none) | (none) |
| WATCHDOG | findings | (none) | (none) |
| GARDENER | refactor citation | (none) | (none) |

---

## Acceptance criteria

- [ ] Both local-office specs migrated; data files expose per-office editable/fixed maps with all 8 office entries.
- [ ] ECT section-save selectors resolve on every pool office (F10.4) — proven by a `--workers=2` ECT run, or any gap escalated to OPI_B.
- [ ] Both specs green `--workers=1` (==today) AND green in isolation at `--workers=2` on distinct offices.
- [ ] Zero module-level `*For(` resolution (F1.1). `npm run check:tc-parity` exit 0. `npm run typecheck` clean.
- [ ] `/regression-guard`. Activity-log row (LR-028). `/final-q` verdict.

---

## Verification

```bash
cd clients/encore && npx playwright test tests/local-office/local-office-settings.spec.ts --workers=2   # expect: green on distinct offices
cd clients/encore && npx playwright test tests/local-office/local-office-ect.spec.ts --workers=2        # expect: green; ECT section-save resolves
grep -rnE "import .*OFFICE_NO" clients/encore/tests/local-office/local-office-{settings,ect}.spec.ts     # expect: empty
```

---

## Handoff (post-execution)

Both Local Office Settings specs are per-office and isolated at workers=2, with ECT section-save proven on every pool office. With OPI_C/D/E/F complete, all 14 specs are migrated off the single-1604 dependency. The only remaining work is OPI_Z: make `officeNo` required (compiler catches any straggler), deprecate the hardcoded HOME_URL env, flip the default worker counts back up, prove the FULL suite green at workers=4 and 8, sweep residual 1604 literals, and close the parent.
