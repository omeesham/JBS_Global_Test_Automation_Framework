# SUBPLAN_PARITY_01 — Decisions + Shady-Pass Live Audit [SUPERSEDED]

**Status**: SUPERSEDED
**Superseded by**: `SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md` (file-only half: E1-E7 + pre-triage) + `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` (e2e half: live walks for NEEDS-LIVE-WALK rows)
**Superseded date**: 2026-05-26
**Reason**: Restructured into Wave 1 (file-only) + Wave 2 (e2e) per user request to maximize productivity while e2e environment is down.

### Execution Summary (LR-027 — required for superseded plans)

- Tasks: E1-E7 decisions + B.5 9-row shady-pass live walks + Jira filings for OMITTED/skip TCs
- Implemented: 0 (none executed; restructured before run)
- Routed to W1-01 (file-only): E1-E7 questionnaire, file-only drift pre-triage, B.5 row classification (OBVIOUS / NEEDS-LIVE-WALK / ALREADY-RESOLVED-by-SP00)
- Routed to W2-06 (e2e): B.5 live walks for NEEDS-LIVE-WALK rows only
- Justification: e2e environment down at restructure time; splitting allowed file-only decisions to proceed immediately
- Traceability artifact: `plans/pending/_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md`

---

**Parent**: `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md`
**Phase**: 1 + 2 of parent (SUPERSEDED)
**PermissionMode**: review
**BrowserTool**: cli
**BrowserToolJustification**: Live DOM verification for shady-pass classification (HONEST adaptation vs SHADY shortcut vs MD-stale).
**Skills**: /questionnaire, /audit
**Identity**: WATCHDOG (read-only investigation; no code edits)
**Created**: 2026-05-20

## Change Log (for future audit)

- **2026-05-25 (same-day revert)** — Prior 2026-05-25 SP00 cross-thread additions reverted. SP00 was directionally reversed + consolidated in the same session: it now generates throwaway demo CSVs, pushes to a remote branch, then restores source CSVs — no `.fixme` stubs added to specs at any time. The prior Drift Check "SP00 awareness" subsection (noting `BLOCKED-BY-PARITY-PATCH-SP00` markers in specs) is no longer applicable and was removed. Original pre-2026-05-25 SP01 content unchanged. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

---

## Bootstrap (read first, in this order)

1. `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — sections "Governing principle", "B.5 Shady-pass audit", "E. Decisions"
2. `.claude/rules/browser-tool.md` — LR-054 (playwright-cli capability table) — required reading before any CLI claim
3. `clients/encore/CLAUDE.md` — LR-ENC-001 baseline, Office 1604, auth story
4. `clients/encore/specs_planning/_internal/old-site-baseline/` — most recent baseline artifact for any module touched

## Drift Check (MANDATORY FIRST STEP — do not skip)

**Evidence discipline binding (per parent §rule 4)**: every claim in this session needs proof — fresh Read/Grep/playwright-cli output captured this session, cited with file:line or artifact path. Banned phrases: "I assume", "should be", "probably", "seems to", etc. After 2 failed attempts at same problem → STOP guessing, switch to artifact-first RCA. Closure requires an Evidence Audit table.

Authored 2026-05-21. Other plans may have landed since. Before any work:

1. **Re-Glob** every file path referenced in this subplan's Bootstrap + Step-by-step. Confirm each still exists at the stated path.
2. **Re-Grep** every codebase claim in parent's Findings table + §B.5 Shady-pass rows (e.g., "spec has BAS-068 missing", "MD header says 28", "6 fixme tests in shared_setup"). Compare to current state.
3. **Cross-check parent's `Findings (from audit)` table** at `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — mark each row VERIFIED / ALREADY-FIXED / DRIFTED-FURTHER / NEW.
4. **Read activity log** at `clients/encore/specs_planning/_internal/agent-activity-log.md` for entries since 2026-05-21 touching the same files.
5. **Emit a Drift Note** as the first artifact of this session — per-row verdict on every claim this subplan relies on.
6. If >30% of scope is stale → HALT, surface to user, request re-planning. Otherwise proceed with updated scope.

---

## Scope (IN)

- Resolve E1..E7 (parent §E) by asking Rutvik via `/questionnaire` — per-decision yes/no chain
- Live-walk the 9 shady-pass rows in parent §B.5 via playwright-cli, classify each as HONEST / SHADY / MD-stale
- Emit a Phase-2 verdict artifact at `clients/encore/specs_planning/_internal/shady-pass-verdicts-2026-05-20.md` with per-row verdict + corrective-action recommendation
- Confirm or file Jira tickets for any TC marked OMITTED/skip without one (LGL TC-016/017, BAS-048, SSL fixmes, ECT-001/010 if SHADY)

## Scope (OUT)

- No code edits to specs / pages / selectors / CSVs / MDs (Phase 7 territory)
- No re-running the audit table (already done in parent)
- No structural split of local-office (SUBPLAN_PARITY_02)

## Step-by-step

1. **Read parent + relevant rules** (Bootstrap above)
2. **Run `/questionnaire`** with E1..E7 from parent §E — collect per-decision answers
3. **Live walk per B.5 row** using playwright-cli:
   - Authenticate via `.auth/e2e-state.json`; refresh via `open --persistent` if Entra redirect
   - For each row: navigate to the relevant page, run the MD's specified action, observe actual behavior, compare to spec's assertion
   - Capture screenshot or snapshot per row (`.playwright-cli/shady-{ROW}-{date}.yml`)
4. **Classify each row** per parent §B.5 decision tree (HONEST / SHADY / MD-stale)
5. **Cross-check Jira** for every TC marked OMITTED/skip — confirm ticket exists + bug reproduces. File NM-NNNN ticket(s) for any unjustified skip.
6. **Emit verdict artifact** at `clients/encore/specs_planning/_internal/shady-pass-verdicts-2026-05-20.md` with frontmatter, per-row verdict table, evidence links, and the corrective-action list that feeds SUBPLANs 04–07
7. **Hand off** via activity log row (LR-028) noting which decisions were resolved + which await Jira filings

## Verification

- E1..E7 all have written answers (no "TBD" left)
- All 9 B.5 rows have HONEST/SHADY/MD-stale verdict + evidence path
- Jira tickets exist (or are filed in this session) for every skip/OMITTED row
- Verdict artifact exists at the named path, ≥1 evidence file per row
- Activity log row appended with `subplan: SUBPLAN_PARITY_01` + session bookends

## Reflect + Graduate (mandatory before /final-q)

Per parent §rule 5. Workflow per root-cause mistake found:

1. **Reflection seed for SP01** — likely mistakes to investigate:
   - Why did shady-pass patterns make it past prior `/final-q` and `/audit`? (Check: did existing rules like LR-022 no-hardcoded-counts, LR-021 un-skip-before-rewrite, LR-031 SKIP-requires-investigation actually fire? If yes, why didn't they catch? If no, why not — wrong trigger/path-scope?)
   - Why were E1–E7 decisions deferred to a separate subplan instead of caught upstream during original spec authoring?

2. **Pre-graduate check** — for each mistake found this session:
   - Grep `clients/encore/specs_planning/_internal/agent-mistakes.md`
   - Grep `docs/read_only_docs/LEARNED_RULES.md` + `.claude/rules/*.md`
   - Grep `~/.claude/projects/*/memory/feedback_*.md`
   - Grep `clients/encore/CLAUDE.md`

3. **Decision per mistake**:
   - Existing learning → escalate structurally (CI / hook / sharper trigger) — append note to existing learning body. NO duplicate memory rule.
   - No existing learning → add ONE in canonical location with `Graduated from: SUBPLAN_PARITY_01`.

4. **Emit Reflection table** in `/final-q` artifact:

   | Root-cause mistake | Already-existing learning? | Action taken |
   |---|---|---|

5. **Anti-duplicate check** — Grep new learning against registries; >70% similarity → rollback + structural escalation.

Closure-gate rejects if (a) Reflection table missing, (b) any near-duplicate added, (c) any mistake mapped to "more reading" / "be more careful" actions.

## Closure

- LR-028 activity log entry at session end
- Surface unresolved decisions to user before marking subplan done
- Move to `plans/done/` only via `/final-q` GREEN per LR-027
