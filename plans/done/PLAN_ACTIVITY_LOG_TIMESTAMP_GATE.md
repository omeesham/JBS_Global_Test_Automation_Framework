# PLAN_ACTIVITY_LOG_TIMESTAMP_GATE

**Status**: DONE
**Executed**: 2026-04-17 (built) · 2026-07-06 (closed)
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action M-5, Finding F-003)
**Priority**: P2-CYCLE-3
**Created**: 2026-04-15
**Identity**: BUILDER (script + pipeline gate)
**Estimated session**: MEDIUM (60-90 min)
**Depends on**: NONE

---

## Context

The audit caught Copilot writing activity-log entries claiming completion at 2026-04-14T09:00 while file mtimes for the same files are 14:32-20:47 (6-12 hour gap). Either premature claim or backdated entry — either way the log is fiction.

If activity log timestamps are unreliable, every downstream gate that uses temporal anchoring (AUD-008) is misled.

---

## Goal

Activity log timestamps are validated against actual filesystem state. Specifically: an entry's timestamp MUST be ≥ the latest mtime (or git-commit time, if committed) of every file in the entry's `files` column.

Implementation: a script + pipeline preflight gate that catches violations.

---

## Tasks

1. **Write `scripts/validate-activity-log.mjs`**:
   - Parse `clients/encore/specs_planning/_internal/agent-activity-log.md` table rows
   - For each row:
     - Extract: timestamp, files list
     - For each file in files:
       - Get mtime: `fs.statSync(file).mtimeMs`
       - If file is in git: get last commit time `git log -1 --format=%cI <file>`
       - Use the LATER of the two as "true file time"
     - Compare row timestamp to true file time
     - If row timestamp < true file time by > 1 minute → VIOLATION
   - Output report:
     - Total rows checked
     - Violations (with row#, claim time, actual file time, delta)
2. **Add npm script**:
   ```json
   "validate:activity-log": "node scripts/validate-activity-log.mjs"
   ```
3. **Add to pipeline preflight** (`scripts/pipeline-preflight.ts` or similar):
   - Run validate:activity-log as part of PF-XX gate
   - Fail preflight if violations exist
4. **Optional: Auto-fix mode**:
   - `npm run validate:activity-log -- --fix` → updates row timestamp to actual latest file time
   - Use sparingly — preserve evidence
5. **Document in CLAUDE.md** as new LR-XXX:
   - "Activity log timestamps must be ≥ all referenced file mtimes. Backdating forbidden. Validated by `npm run validate:activity-log`."
6. **Run baseline scan**:
   - `npm run validate:activity-log` against current log
   - Document all current violations (for historical record)
   - Don't auto-fix history — let it stand as evidence of past pattern

---

## Verification

- Script runs cleanly
- Catches the SP3 09:00 vs 19:04 violation
- Pipeline preflight fails if violations exist
- CLAUDE.md updated with new LR rule

---

## Acceptance Criteria

- [x] `scripts/validate-activity-log.mjs` exists
- [x] `package.json` has `validate:activity-log` script
- [x] Pipeline preflight integration done (`pipeline:preflight` → `validate:activity-log:preflight`; also pre-commit gate #6 in `.githooks/pre-commit`)
- [x] Baseline scan documents current violations — the founding SP3 violation is recorded in LR-037's "Graduated from" line rather than a separate artifact
- [x] LR rule added — as **LR-037** in `docs/read_only_docs/LEARNED_RULES.md` (the canonical cross-cutting-rules home per the numbering convention; root `CLAUDE.md` references it), not literally inside `CLAUDE.md`
- [x] Activity log row added (closure row appended 2026-07-06; validates clean under `--staged`)

---

## Execution Summary

**Executed**: 2026-04-17 (original build) · 2026-07-06 (closure + note on staged-scoping follow-on)

**Original delivery (2026-04-17, BUILDER)** — the temporal-integrity gate for the activity log was built as specified:

1. **Script** — `scripts/validate-activity-log.mjs` parses the activity-log table rows, computes each referenced file's true time as `max(fs mtime, git commit time)`, and flags any row whose `When` is earlier than that by more than a 1-minute tolerance. First committed `c7578758` (2026-04-17).
2. **npm scripts** — `package.json` exposes `validate:activity-log` (full report) and `validate:activity-log:preflight` (scoped preflight).
3. **Pipeline + hook integration** — `pipeline:preflight` runs `validate:activity-log:preflight` as its final gate; `.githooks/pre-commit` gate #6 runs it whenever the activity log is staged.
4. **Rule** — codified as **LR-037** in `docs/read_only_docs/LEARNED_RULES.md`. The founding violation (an SP3 row claiming 2026-04-14T09:00 while the referenced files' mtimes were 14:32–20:47) is recorded in the rule's "Graduated from" line — the baseline-scan record the plan called for.

**Follow-on (2026-07-06)** — a separate session added a `--staged` mode and rewired gate #6 + the preflight script from `--latest-per-file --recent=5` to `--staged`, removing a false-positive class where a later commit legitimately re-touches a file that an older, already-committed row referenced. Full detail is the source of truth in `docs/read_only_docs/LEARNED_RULES.md` LR-037 §Validation ("Staged-scoping fix (2026-07-06)") and the 21-case `scripts/validate-activity-log.test.mjs`; this closure defers to those rather than duplicating them.

**Closure-time correction** — the Task-1 reference to the log file was a bare relative path (`specs_planning/_internal/…`); corrected to the repo-relative `clients/encore/specs_planning/_internal/agent-activity-log.md` so the closure gate's artifact-existence check resolves.

**Verification (2026-07-06)**:
- `node scripts/validate-activity-log.mjs --staged` → exit 0 on a clean tree.
- `node scripts/validate-activity-log.test.mjs` → 21 passed, 0 failed.
- The founding SP3 violation remains reproducible under the full-scan flags.

**TC scope**: none — this is a tooling / pipeline-gate plan; the deliverable is the validation script plus its own unit test, not product `.spec.ts` cases.

**Documentation changes**: LR-037 authored and maintained in `docs/read_only_docs/LEARNED_RULES.md`; this Execution Summary.
