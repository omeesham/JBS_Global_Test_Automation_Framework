> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 6. **Phase 0 FIRST (if present in Step-by-Step)**: execute the "Phase 0 — Date-Forensic Self-Discovery" step before any code or doc edits. Document findings (with dispositions) in your activity-log row.
> 7. **Execute Phases 1+** per Step-by-Step in order.
> 8. **Handoff**: on success, apply the Handoff Signals block — set the file's Status field to DONE + Executed date in this file, append activity-log row (LR-028 + LR-037 wall-clock time ≥ mtime of every touched file), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit (one commit per LR-027 boundary).
>
> **HALT + ASK USER** (do NOT silently proceed) if:
> - Any `**Depends on**` item is not DONE.
> - Phase 0 uncovers scope extension >30% beyond the listed starting point (user confirms before acting on unscoped items).
> - Genuine ambiguity in scope beyond the master plan §3 KEEP list.
> - `/regression-guard` diff shows changes unrelated to this subplan's stated scope.
> - Activity-log preflight (`npm run validate:activity-log:preflight`) would fail for your row.

---

# SUBPLAN SP-F1: Anomaly Writer Utility + JSON Schema + afterEach Wiring

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 4 (Infrastructure — can run parallel to Group 3)
**Status**: Pending
**Priority**: P1
**Created**: 2026-04-20
**Depends on**: SP-D0 (hist-reader.ts) present
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
