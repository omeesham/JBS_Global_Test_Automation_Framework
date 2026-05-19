> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 7 (anomaly writer infrastructure)

---

# SUBPLAN SP-F1: Anomaly Writer Utility + JSON Schema + afterEach Wiring

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 4 (Infrastructure — can run parallel to Group 3)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 7 (anomaly writer infrastructure)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-D0 (hist-reader.ts) present
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/identity`
**Estimated**: one session

---

## Cause

When a HIST column test fails, the information available in Playwright's default reporter is insufficient for downstream automated triage. A structured JSON anomaly artifact per failure enables SP-F2 auto-filer to dedup and propose BUG candidates, and gives humans a clean digest for gated review.

Inherited from the superseded PLAN_HIST_INTEGRITY_HARDENING D5 deliverable.

---

## Scope

**Create**: `clients/encore/src/utils/hist-anomaly-writer.ts`

Exports:
- `emitAnomaly(spec: string, tc: string, anomaly: HistAnomaly): void` — writes JSON file to `reports/bugs/anomalies/{YYYY-MM-DD}/{testId}-{seq}.json`.
- `type HistAnomaly = { ... }` — matches schema below.

**Schema** (copied verbatim from superseded plan D5):
```ts
interface HistAnomaly {
  anomalyId: string;                  // `${date}-${tcId}-${seq}`
  type: 'value-mismatch' | 'not-tracked-violation' | 'phantom-row' |
        'duplicate-row' | 'spurious-column-change' | 'modified-on-drift' |
        'modified-by-mismatch' | 'zero-row-after-save' |
        'row-after-cancel' | 'duplicate-header-same-parent';
  severity: 'critical' | 'high' | 'medium' | 'low';
  discoveredAt: string;               // ISO datetime
  tcId: string;
  specFile: string;
  parentTab: string;
  parentField: string;
  parentControlType: string;
  savedAt: string;
  historyRowAt: string;
  column: { index: number; header: string };
  expected: string;
  actual: string;
  fullRowDiffVsPrior: Array<{col: number; name: string; prev: string; now: string}>;
  evidenceArtifacts: { screenshot?: string; trace?: string };
  relatedBugCandidate?: string;
  officeNo: string;
}
```

**Wire into Playwright `afterEach`**:
- Create `clients/encore/tests/setup/hist-anomaly-hook.ts` that exports a helper registering the afterEach for HIST spec files only (by path filter).
- `local-office-history.spec.ts` + `tests/specs/setup/locations/history/*.spec.ts` import + call the hook at top of file.

**Add**: `reports/bugs/anomalies/` to `.gitignore` (run artifacts, not committed).

---

## KEEP list

- Existing `DiagnosticsCollector` — untouched. Anomaly writer is additive, not replacement.
- `reports/bugs/BUG-*.json` files — unchanged (auto-filer handles those in SP-F2).
- Structural hist specs — do NOT add anomaly hook to them (they test UI structure, not root-column mapping).

---

## Step-by-Step Execution

1. `/identity BUILDER`.
2. `/regression-guard` BEFORE.
3. Create `hist-anomaly-writer.ts` with schema + `emitAnomaly` function. Write JSON to `reports/bugs/anomalies/{YYYY-MM-DD}/`. Ensure date dir created per-run. Sequential suffix `{seq}` per test within the run.
4. Create `hist-anomaly-hook.ts` — register afterEach that checks `testInfo.status === 'failed'` and extracts context from errors to build an anomaly entry. If ambiguous context → emit a partial anomaly with `type: 'unknown'` and log a warning.
5. Update `.gitignore` — add `reports/bugs/anomalies/`.
6. Import the hook in SP-C1/C2/D1..D10 spec files (can be deferred if those specs don't exist yet — but document the import requirement in this subplan's output).
7. Unit tests: synthesize a failed test → confirm anomaly JSON written.
8. Commit: `feat(hist-pivot): SP-F1 — hist-anomaly-writer utility + afterEach wiring`.

---

## Verification

1. File exists at `clients/encore/src/utils/hist-anomaly-writer.ts`.
2. Running any HIST spec with a deliberately failing TC emits one JSON file at `reports/bugs/anomalies/{today}/`.
3. JSON matches schema (validate via `ajv` or a simple assert on required fields).
4. `.gitignore` covers the anomalies directory (run `git status` after failure — anomaly files should not appear).
5. Green tests emit NO anomaly JSONs (verify zero overhead on green runs).

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | builder | done | clients/encore/src/utils/hist-anomaly-writer.ts, clients/encore/tests/setup/hist-anomaly-hook.ts, .gitignore | SP-F1 — anomaly writer + afterEach wiring. Feeds SP-F2 auto-filer. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Schema matches D5 from superseded PLAN_HIST_INTEGRITY_HARDENING.
- LR-003: no empty catch. Emit anomaly writer errors to console + re-throw.
- Dry-run concern: anomaly files are per-run artifacts, NOT committed. Gitignore is load-bearing.
- `DiagnosticsCollector` already captures screenshot + trace — reference their paths, don't duplicate.

---

## Dependencies

- SP-D0 (hist-reader.ts) exists (for shared row types).
- Unblocks SP-F2 + formalization of SP-C*/SP-D* error paths.
