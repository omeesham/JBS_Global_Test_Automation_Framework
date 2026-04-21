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

# SUBPLAN SP-F2: Auto-Bug-Filer Script + Dedup + Dry-run Digest

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 4 (Infrastructure)
**Status**: Pending
**Priority**: P1
**Created**: 2026-04-20
**Depends on**: SP-F1 complete (anomaly writer emits JSON)
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/identity`
**Estimated**: one session

---

## Cause

Closes the loop from HIST spec failure → anomaly JSON → LR-034-compliant bug candidate. Ships dry-run only by default so human triage gates any real BUG file creation.

Inherited from superseded PLAN_HIST_INTEGRITY_HARDENING D6.

---

## Scope

**Create**: `scripts/anomaly-to-bug.mjs`

Behavior:
1. Reads all JSON files in `reports/bugs/anomalies/{YYYY-MM-DD}/*.json` (or `--since YYYY-MM-DD` flag).
2. Groups anomalies by `(parentTab, parentField, type)` — each group is a candidate bug.
3. Dedup: searches existing `reports/bugs/BUG-*.json` for a match on (module, title-substring, type). If found:
   - Appends new anomaly reference to the existing bug's `evidenceRuns[]` array (live mode only; dry-run just logs intent).
4. If no existing bug + anomaly severity ≥ medium + live mode: creates `BUG-AUTO-{MODULE}-{NNN}.json` per LR-034 schema.
5. Default = DRY-RUN: writes `reports/bugs/auto-filer-dryrun-{date}.md` digest (human-readable) instead of modifying `reports/bugs/BUG-*.json`.
6. Live mode gated behind env `HIST_AUTO_FILE=true`.
7. Unit tests against synthetic anomaly fixtures (new + repeat bug scenarios).

**Add to package.json**: `"hist:anomaly-filer": "node scripts/anomaly-to-bug.mjs"` (dry-run).

---

## KEEP list

- Existing `reports/bugs/BUG-*.json` files — read, never modified in dry-run.
- LR-034 bug filing protocol — script respects its dedup and required-field rules.
- `anomaly-to-bug.mjs` does NOT auto-skip tests (that's a human + SP-E* responsibility).

---

## Step-by-Step Execution

1. `/identity BUILDER`.
2. Design `anomaly-to-bug.mjs`:
   - CLI args: `--since YYYY-MM-DD`, `--dry-run` (default true), `--out <path>`.
   - Read anomaly JSONs.
   - Group by `(parentTab, parentField, type)`.
   - For each group: dedup query against `reports/bugs/BUG-*.json`. Decision: new candidate / append to existing / skip.
   - Write digest markdown with a table per group + decision + rationale.
   - If `HIST_AUTO_FILE=true`: write real BUG files (gated).
3. Author digest format example (template in file header).
4. Unit tests:
   - Fixture with one new anomaly → dry-run digest proposes one new BUG-AUTO-*.
   - Fixture with same anomaly + matching existing BUG → digest says "append to BUG-XYZ-001 (mock)".
   - Fixture with low-severity anomaly → digest logs but proposes no bug.
5. Wire `package.json` script.
6. Commit: `feat(hist-pivot): SP-F2 — auto-bug-filer script + dry-run digest`.

---

## Verification

1. `scripts/anomaly-to-bug.mjs` exists.
2. `npm run hist:anomaly-filer` runs successfully, produces digest file.
3. Dry-run default does NOT modify `reports/bugs/BUG-*.json`.
4. Unit tests pass.
5. Digest is human-readable (reviewer can accept/reject each proposed bug).
6. `HIST_AUTO_FILE=true` is documented but NOT yet exercised (no live mode this session).

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | builder | done | scripts/anomaly-to-bug.mjs, package.json | SP-F2 — auto-bug-filer + dry-run digest. Dedup logic unit-tested. Live mode gated behind HIST_AUTO_FILE. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- LR-034 protocol dictates required BUG file fields — script must respect.
- Dedup key examples: (Local Office, Room Configuration, not-tracked-violation) → title pattern "Room Configuration not recorded in Local Office Settings History".
- Digest should include: group key, anomaly count, matched existing bug (if any), proposed new bug title, severity, evidence summary.
- Future: after ~1 month of dry-run validation, decide to enable live. NOT this session's concern.

---

## Dependencies

- SP-F1 (anomaly writer must exist + emit valid JSONs).
- Can run parallel with SP-C*/SP-D* implementation.
- Feeds SP-E-* bug filing sessions (reviewers use digest as input).
