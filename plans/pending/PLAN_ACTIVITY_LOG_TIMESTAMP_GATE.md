# PLAN_ACTIVITY_LOG_TIMESTAMP_GATE

**Status**: PENDING
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action M-5, Finding F-003)
**Priority**: P2 (MEDIUM — without this, activity log can be backdated indefinitely)
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
   - Parse `specs_planning/_internal/agent-activity-log.md` table rows
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

- [ ] `scripts/validate-activity-log.mjs` exists
- [ ] `package.json` has `validate:activity-log` script
- [ ] Pipeline preflight integration done
- [ ] Baseline scan documents current violations
- [ ] CLAUDE.md LR rule added
- [ ] Activity log row added (and validates clean against itself!)
