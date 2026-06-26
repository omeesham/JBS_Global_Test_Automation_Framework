# SUBPLAN_OPI_B_POOL_SELECTION_ACCESS_CAPTURE — confirm 8 offices, prove save-access, per-constant inventory (value capture deferred to migration)

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-04
**Identity**: OWNER
**Parent**: PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md
**Depends on**: SUBPLAN_OPI_A_INFRA_FOUNDATION.md
**Blocks**: SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT.md
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: live structural-parity + save-access verification across 8 offices, dirty-capture detection, and multi-source (e2e + nav2) baseline reconciliation = adaptive browser RCA-class judgment → Opus `max`.

---

## Context

The pool offices are functionally similar to 1604 but their baselines differ (user decision #1). Before any spec migrates, we must (1) **select** 7 non-1604 offices that are STRUCTURAL clones of 1604 and whose names don't collide with SSL catalog search terms, (2) **prove the single automation user can OPEN and SAVE** each of them (else the suite silently `/home`-cascades — F2.1), and (3) **capture** each office's editable + fixed baselines without baking in a dirty value (F5.1). This subplan is the feasibility gate for the whole initiative and the one place a human (Rutvik) confirms the office numbers. Owns **F2.1, F2.2, F3.3, F3.4, F5.1, F5.2, F5.3, F8.5, F9.1, F9.2, F9.3, F10.1, F10.4, F11.1 (corp-pricing entity parity)**.

**Open input required from user:** the 7 candidate office numbers (or confirmation to discover them live from a stated criterion). nav2 is office-parameterized by URL (LR-ENC-001), so candidates can be inspected live; final selection is user-confirmed.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap)
- `/relevant` (Phase 0.5 injection)
- `/research` (only if a capture-script pattern needs external reference)
- `/final-q` (Phase 4 exit)

**Context files**:
- `plans/pending/PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION.md` (parent)
- `.claude/rules/browser-tool.md` (LR-038 v2 + LR-054 — CLI surface)
- `.claude/rules/baseline.md` (baseline-walk workflow)
- `.claude/rules/data.md` (test-data authoring), `.claude/rules/inventory.md` (field-inventory spec)
- `.claude/rules/specs.md` (LR-015 live-read provenance, LR-022 no hardcoded counts)
- `clients/encore/CLAUDE.md` (LR-ENC-001 nav2 truth source + office-parameterized URL, LR-ENC-003 env, LR-012 shared dialogs, LR-036 boolean render, LR-017 page boundaries)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `SUBPLAN_OPI_A` is in `plans/done/`.
2–5. navigation.md registry, agent-mistakes (ALL-*/REQ-*), patterns.md, LR scan (LR-038/054 CLI, LR-ENC-001 baseline, LR-015 provenance, LR-012/036).
6. **Browser-tool**: `BrowserTool=cli`. Reason: catalog/structural walkthrough across 8 offices + save-capability probe (unattended, token-efficient grep-over-disk per LR-054). Any live RCA of an inaccessible office runs HEADED cli per the LR-038 `/rca` row.

---

## Phase 0.5b — Baseline-first walk (REQUIRED — output drives per-office baseline data)

1. Visit nav2 old-site truth per LR-ENC-001 for each candidate office: `https://navigator2.training.psav.com/#/setup/locationdetail/<office>` to read the **intended** defaults (guards F5.1 — a possibly-dirty e2e live value is reconciled against nav2's intended value).
2. Emit `clients/encore/specs_planning/_internal/old-site-baseline/office-pool-capture-<office>-<capture-date>.md` per office (provenance: nav2 intended vs e2e observed, capture date, who/what). NOTE: the `<capture-date>` is the DAY THIS SUBPLAN ACTUALLY RUNS (this plan is parked — do NOT hardcode 2026-06-04, the original authoring date); update the matrix + verification paths below to the real date at closure.
3. Classify each per-office divergence from 1604 as (a) structural-parity-OK (clone), (b) cosmetic value diff (expected — goes into a per-office map), or (c) **structural mismatch** (missing tab / different column count / different ECT sections / different currency rows → office is REJECTED from the pool, F9.3/F10.4).
4. Record `baselineScope` per office.

---

## Phase 1+ — Actual work

1. **Candidate selection (F3.3, F9.3):** with the user-provided/confirmed candidate numbers, for each candidate verify against 1604:
   - Same tabs present (Location Settings sub-tabs + Local Office Settings + ECT sections).
   - Same management-history column count (87) — else flag (F8.5).
   - Same checkbox SET + same currency-row structure.
   - **Name does NOT contain** any SSL catalog search term in use: `Boston`, `Chicago`, `Dallas`, `Denver`, `Atlanta`, `Miami`, `Marriott`, `Test Server` (F3.3).
   - Confirm SSL catalog scoping is GLOBAL (not office-scoped) so Boston=77 etc. hold from any office (F3.4).
   - **Corporate Pricing entity parity (F11.1, for OPI_G):** confirm the office has an equivalent Corporate Pricing set — at least one detail-fixture pricebook + one strategy-fixture pricebook (reachable via `/locations/<office>/settings/corporate-pricing`) + a Product Group Override row on `/pg-override`. The pricebook GUIDs are office-specific (1604's `91acb5ca…`/`5f2a4088…` won't exist elsewhere). Record the office's corp-pricing capability: FULL (has all three), or CORP-PRICING-INCAPABLE (→ OPI_G uses the single-office pricebook-pool fallback for that slot; do NOT silently drop it). Live-read the candidate's pricebook list to classify; do NOT assume parity from the locations check.
   Reject any candidate failing structural parity; request a replacement from the user. **Final 8 (1604 + 7) are user-confirmed.**
2. **Save-access preflight (F2.1, F2.2):** add a pool-access check to the `setup` project (`clients/encore/tests/auth.setup.ts` — was `src/infra/auth.setup.ts` pre-2026-06-05 restructure; `auth.setup.ts` now lives in `tests/` — or a new `pool-access.setup.ts` gated into the `setup` project where `browser` + storageState exist). For EACH pool office: navigate to `/locations/<office>/settings/location`, confirm the editable form anchor renders (NOT a `/home` skeleton), and confirm a save-capable control is ENABLED after a no-op dirty toggle (then discard). FAIL the whole run loudly, naming the office, if any is inaccessible or read-only. (F2.2: enabled-Save check prevents the silent `{success:true}` on a disabled Save.)
3. **Per-constant inventory + capture discipline (F5.1, F5.2, F5.3, F10.1):** inventory the 78 office-dependent consts (which are office-dependent VALUES vs office-independent catalogs/rules that stay flat) so migration scope is estimable. Do NOT build a monolithic capture script — per-office VALUE capture happens per-tab during migration (C–G) via live-read (LR-015, the `LP_DEFAULTS` pattern). Record the capture discipline migrations MUST apply:
   - Capture each office **twice on different days** (or: once live + once vs nav2 intended) and **diff**; a value that differs between captures is suspected-dirty → reconcile against nav2 before baking (F5.1).
   - Capture **disabled/enabled state per checkbox**, not just checked/unchecked (F5.3) — `DISABLED_CHECKBOX_STATES` becomes per-office.
   - Capture left-panel **Country/TaxMode/Region** per office with care (cascade-sensitive — F10.1).
   - Assert ≥1 **pairwise-distinct** identity field across offices (F5.2 — a self-checking mapping).
   - "Warm" each office with ≥1 recent save so history-freshness windows hold (F4.2).
   - Record `capturedOn` + provenance per office (F9.1 — re-capture is cheap, never hand-maintained).
4. **Populate `OFFICE_POOL`** in `office-pool.ts` with the confirmed 8. Do NOT add per-office map ENTRIES to tab data files here — C–G LIVE-READ each tab's values per office at migration time (LR-015) and reconcile per the discipline above. OPI_B does NOT pre-capture values (no monolithic script).
5. **Document the swap procedure (F9.2)** in the parent or a runbook: how to drop/replace a decommissioned office (pool > workers gives slack).

**Sonnet boundary**: all live walks, save-probes, dirty-capture reconciliation, and structural-parity judgment are [OPUS-ONLY] (MCP/CLI + adaptive). Emitting the artifact files from gathered data is [SONNET-SAFE].

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent capture-script reuse or inventory nits → DO-NOW (same file) or APPEND grep-verifiable line to the relevant migration subplan (C–G) for the tab whose values were captured. No bare "out of scope".

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | `_internal/old-site-baseline/*.md` (per-office capture provenance) | `clients/encore/specs_planning/_internal/old-site-baseline/office-pool-capture-1604-<capture-date>.md`<br>(+ one per confirmed pool office; stamp `<capture-date>` to the real run date at closure — NOT 2026-06-04) | `ls clients/encore/specs_planning/_internal/old-site-baseline/office-pool-capture-*.md` |
| GIVER | test-cases / test-plans / XLSX | (none) — no TC semantics change; only data provenance captured | (none) |
| BUILDER | tests/**/*.spec.ts | (none) — no spec edits in this subplan (migration is C–G) | (none) |
| HEALER | per-fix MD | (none) | (none) |
| WATCHDOG | findings table | (skipped: selection/capture subplan, not an audit; structural-parity rejections logged in the per-office baseline artifacts above) | (none) |
| GARDENER | refactor citation | (none) — no monolithic capture script; per-office value capture is per-tab live-read in C–G | (none) |

---

## Acceptance criteria (LR-040 closure gate — enumerates the 8 offices)

- [ ] **(a)** For each of the 8 confirmed offices: structural-parity verdict recorded in its dated baseline artifact (live-proven, cited).
- [ ] **(a)** Save-access preflight passes for all 8 (or run FAILs loudly naming the offender) — proven by one preflight run.
- [ ] **(a)** Per-office baseline values captured + dirty-reconciled (twice/nav2-cross-checked) with provenance in the artifacts.
- [ ] **(c)** Any candidate rejected for structural mismatch is named in its artifact with the mismatch + a user-facing request for a replacement.
- [ ] **(a/c)** Each office's Corporate Pricing capability (FULL vs CORP-PRICING-INCAPABLE) is recorded in its baseline artifact (F11.1) — feeds OPI_G's per-office maps vs single-office fallback decision.
- [ ] `OFFICE_POOL` contains the 8 user-confirmed numbers; no office name collides with an SSL search term (grep the names).
- [ ] `/regression-guard` before/after on `office-pool.ts` + setup project.
- [ ] Activity-log row per LR-028 (LR-037 timestamps).
- [ ] `/final-q` verdict block emitted.

---

## Verification

```bash
grep -n "OFFICE_POOL" clients/encore/src/data/office-pool.ts            # expect: 8 entries, index 0 = '1604'
ls clients/encore/specs_planning/_internal/old-site-baseline/office-pool-capture-*.md  # expect: 8 artifacts (stamped with the actual capture date, not 2026-06-04)
cd clients/encore && npx playwright test --project=setup                # expect: pool-access preflight passes for all 8
# name-collision guard:
grep -Ei "boston|chicago|dallas|denver|atlanta|miami|marriott|test server" clients/encore/src/data/office-pool.ts  # expect: empty
```

---

## Handoff (post-execution)

Confirms and seeds the 8-office pool: structural parity proven per office, the automation user's save-access verified by a setup-time preflight that fails loud on any inaccessible office, and a per-constant inventory of the 78 office-dependent consts (which are values vs flat). `OFFICE_POOL` now holds all 8. Per-office VALUE capture is NOT done here — each migration (C–G) live-reads its tab's values per office (LR-015) and reconciles vs nav2 (F5.1) per the recorded discipline. Next: OPI_C migrates Legal as the pilot and establishes the repeatable per-spec recipe.
