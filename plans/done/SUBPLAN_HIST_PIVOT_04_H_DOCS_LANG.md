> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-H: REQUIREMENTS.md §History Tracking — Language Revision

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 1 (Top Priority)
**Status**: DONE
**Executed**: 2026-04-20
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: none (parallel with SP-A*)
**Identity**: HUNTER (Requirements — owns REQUIREMENTS.md)
**Skills**: `/planning` + `/identity`
**Estimated**: one session (~1 hour)

---

## Cause

The two §History Tracking sections in `clients/encore/docs/REQUIREMENTS.md` describe the old integration-per-spec pattern. The schema, NOT-TRACKED registry, data formats, cross-system independence rules, and LR-036 encoding notes are all valid domain knowledge and STAY. Only the "each spec verifies after save" language needs revision — so future HUNTER/GIVER/BUILDER sessions don't re-create the dead pattern.

---

## Scope — Exact Files + Actions

**File**: [REQUIREMENTS.md](../../clients/encore/docs/REQUIREMENTS.md)

**Section 1**: §Location Management History (lines 826–961)
**Section 2**: §Local Office Settings History (lines 1176–1273)

**Language edits only** (no content deletions):

| Find (paraphrased) | Replace with |
|---|---|
| "each spec verifies that saves produce a correct history row" | "the dedicated hist-column test suite (`tests/specs/setup/locations/history/*.spec.ts` for Location Mgmt, `local-office-history.spec.ts` for Local Office) verifies that each hist column reflects its root field's state — driven by the root-column catalog at `clients/encore/specs_planning/catalogs/hist-root-map-*.md`" |
| "appended as final TC in each describe.serial block" | "tested via per-column state-space TCs organized by root-tab in the dedicated hist specs" |
| Any reference to `TC-LOC-*-HIST` or `TC-LOS-*-HIST` as the vehicle of verification | Replace with reference to `TC-LOCH-COL-*` or `TC-LOSH-COL-*` (new per-column TC IDs) |
| "integration-per-spec" | "column-first per-root-tab" |

**Also add** (new small subsection at end of each §):

> **Test Architecture (2026-04-20 pivot)**: History coverage lives exclusively in dedicated hist specs. Each hist column has its own `describe()` block enumerating state-space per the root field's control type (per D1.a taxonomy). Basic-info specs carry NO history code. See [PLAN_HIST_COLUMN_FIRST_PIVOT.md](../../plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md) and the per-surface root-column catalogs.

---

## KEEP list — DO NOT TOUCH

- All 87-column / 42-column schema content.
- All NOT-TRACKED field registry entries (inputs to SP-E bug filings).
- All data-format rules (boolean Unicode vs SVG — LR-036).
- All MCP-verification date stamps (e.g., "MCP-VERIFIED: 2026-04-13 14:43").
- Cross-system independence rule (Local Office ≠ Location Management).
- Snapshot-model explanation (1 save = 1 full-row snapshot, not delta).
- TC-LOS-HIS-003 correction note (line 1183).
- `AGENT_RULES_ENCORE.md` §E5, §E-UI-002, §E-MCP-001 — untouched.

---

## Step-by-Step Execution

### Phase 0 — Date-Forensic Self-Discovery (MANDATORY)

**Principle**: REQUIREMENTS.md isn't the only HUNTER-sphere artifact that was touched during HIST integration. The commit history for 2026-04-13 → 2026-04-17 is your guide. Use your own brain — find every doc/artifact in HUNTER's sphere that was written/modified in that window, and decide whether its HIST-related content needs revision or is fine as-is.

1. Run inside HUNTER sphere:
   ```
   git log --since=2026-04-13 --until=2026-04-18 --name-only --pretty=format:"%h %ad %s" --date=short -- clients/encore/docs/ docs/read_only_docs/ README.md HANDOFF_TO_COLLEAGUE.md reports/bugs/
   ```
2. Enumerate candidates. Expected high-signal hits (but don't limit yourself):
   - `clients/encore/docs/REQUIREMENTS.md` — primary scope, already listed
   - `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` — §E5/E-UI-002/E-MCP-001 HIST rules (check: these are domain, likely KEEP)
   - `README.md` — any HIST mention?
   - `HANDOFF_TO_COLLEAGUE.md` — any HIST mention?
   - `clients/encore/CLAUDE.md` — any HIST client rules pointing at old pattern?
   - `reports/bugs/BUG-HIS-001.json` + `BUG-HIS-002.json` — `affectedTests` arrays likely reference TC-*-HIST IDs deleted by SP-A1. Either update to new per-column TC IDs (if catalogs lend them yet) or replace with placeholder `"pending SP-D* execution"`.
   - Agent prompts in `.github/agents/*.agent.md` — line-number citations INTO REQUIREMENTS.md §History range go stale once you edit the section. Check and update post-edit.
3. Classify per file: **REVISE** (old pattern language), **KEEP** (domain knowledge / MCP evidence / cross-system rules), or **UPDATE-REFS** (stale refs to deleted TCs).
4. Document candidates + dispositions in your activity-log row. Scope extensions beyond REQUIREMENTS.md go there.

### Phase 1 — REQUIREMENTS.md Revision (after Phase 0 complete)

1. `/identity HUNTER`.
2. Read both sections in full (826–961, 1176–1273).
3. For each paragraph: decide TEACHES-SCHEMA (keep verbatim) or TEACHES-WORKFLOW (revise per table above). Schema teachings include column lists, NOT-TRACKED, data formats, encoding rules. Workflow teachings include "how tests verify" and "where tests live".
4. Apply edits via Edit tool (preserve line structure where possible — easier review).
5. Append the new "Test Architecture (2026-04-20 pivot)" subsection at end of each §.
6. Sanity-read the whole section post-edit — coherent narrative without broken references.
7. Verify schema content (column lists, NOT-TRACKED entries, dates) is byte-identical pre-vs-post on the parts that should not change.
8. Commit: `docs(hist-pivot): SP-H — REQUIREMENTS.md §History Tracking language revision for column-first pivot`.

---

## Verification

1. `grep -n "each spec verifies" clients/encore/docs/REQUIREMENTS.md` returns zero hits (or only in unrelated sections).
2. `grep -n "TC-LOC-.*-HIST\|TC-LOS-.*-HIST" clients/encore/docs/REQUIREMENTS.md` returns zero hits (old TC IDs gone).
3. Both sections still contain their full column lists + NOT-TRACKED registries + boolean-encoding rules (byte-equal on kept content).
4. New "Test Architecture (2026-04-20 pivot)" subsection present at end of each §.
5. Cross-reference to master plan and catalogs is present and correct (relative path works).

---

## Handoff Signals

1. the file's Status field to DONE + Executed date.
2. Activity-log row (LR-037 wall-clock):
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/docs/REQUIREMENTS.md | SP-H — revised language in §Location Management History + §Local Office Settings History sections for column-first pivot (schema content unchanged) |
   ```
3. `git mv` this file to `plans/done/`.
4. `npm run plans:reindex`.

---

## Context for Cold-Start Session

- Master plan §3 HUNTER row classifies both sections as **REVISE** (not delete).
- The schema content is INPUT for SP-B-LO/LM discovery sessions — keep intact.
- LR-030 says never silently overwrite docs to match DOM. This subplan is explicit revision, not silent overwrite.
- LR-020 says verify plan claims against codebase. After SP-A* completes, the old integration pattern is actually gone — the REQUIREMENTS.md edits match physical reality.

---

## Execution Summary

**Executed**: 2026-04-20

### Phase 0 — Date-Forensic Findings

Git log (2026-04-13→2026-04-18) covered: REQUIREMENTS.md, AGENT_RULES_ENCORE.md, clients/encore/CLAUDE.md, .github/agents/*.agent.md, README.md, HANDOFF_TO_COLLEAGUE.md, reports/bugs/.

| File | Classification | Action Taken |
|------|---------------|--------------|
| REQUIREMENTS.md §826-1033 (Location Management History) | KEEP — all domain knowledge, NO old workflow language found | ADD: Test Architecture subsection |
| REQUIREMENTS.md §1176-1274 (Local Office Settings History) | KEEP — same | ADD: Test Architecture subsection |
| AGENT_RULES_ENCORE.md | KEEP — `TC-LOC-HIST-*` is new naming convention, not old pattern | No action |
| clients/encore/CLAUDE.md | KEEP — LR-036 domain rules only | No action |
| README.md, HANDOFF_TO_COLLEAGUE.md | KEEP — no HIST workflow language | No action |
| .github/agents/*.agent.md | No line-number citations into §History range | No action |
| reports/bugs/BUG-HIS-001.json | UPDATE-REFS needed — stale `TC-LOC-LI-HIST` in affectedTests | OUT OF HUNTER SCOPE — deferred |
| reports/bugs/BUG-HIS-002.json | UPDATE-REFS needed — stale `TC-LOC-CUR-HIST` in affectedTests | OUT OF HUNTER SCOPE — deferred |

**Key finding**: The old integration-per-spec workflow language (paraphrased targets in plan) does NOT exist in REQUIREMENTS.md — no REPLACE actions were needed. The plan's ADD steps were the only actionable work.

### Phase 1 — REQUIREMENTS.md Edits

- Added `**Test Architecture (2026-04-20 pivot)**` paragraph at end of §Location Management History (after Save Dialog, before Plan vs DOM — line 998 post-edit)
- Added `**Test Architecture (2026-04-20 pivot)**` paragraph at end of §Local Office Settings History (after NOT-TRACKED table, before `---` — line 1276 post-edit)
- Diff: 2 additions, 0 deletions to existing schema content

### MCP Verification Results

1. `grep "each spec verifies"` → 0 hits ✅
2. `grep "TC-LOC-.*-HIST\|TC-LOS-.*-HIST"` → 0 hits (TC-LOC-HIST-* at line 1395 is new naming, KEEP) ✅
3. `grep "integration-per-spec"` → 0 hits ✅
4. `grep "Test Architecture (2026-04-20 pivot)"` → 2 hits (lines 998, 1276) ✅
5. NOT-TRACKED registries, boolean encoding rules, MCP dates, column schema — all intact ✅

### Deferred Items

- `reports/bugs/BUG-HIS-001.json` and `BUG-HIS-002.json` have stale TC-LOC-LI-HIST / TC-LOC-CUR-HIST in `affectedTests` arrays. HUNTER cannot write to reports/bugs/ (file ownership violation). Recommend a separate WATCHDOG session or override to update these after SP-D* sessions establish final TC-LOCH-COL-* IDs.

---

## Dependencies

- Can run in parallel with SP-A*. Ideally runs AFTER SP-A1/A2/A3 so the doc edits describe the actual code state at time of commit.
- Unblocks: discovery sessions (SP-B-*) benefit from the revised docs but don't strictly require them.
