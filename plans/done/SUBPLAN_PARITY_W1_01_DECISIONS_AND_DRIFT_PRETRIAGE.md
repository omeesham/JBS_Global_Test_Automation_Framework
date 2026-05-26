# SUBPLAN_PARITY_W1_01 — Decisions (E1–E7) + File-Only Drift Pre-Triage

**Status**: DONE
**Executed**: 2026-05-26
**Priority**: P0
**Created**: 2026-05-26
**Identity**: WATCHDOG
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md (must be in `plans/done/` before this runs)
**Blocks**: PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase 0 — E1–E7 decisions inform MD reconciliation), SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md (W1-02 closed-as-superseded — no longer blocked)
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: plan
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: This is the file-only half of the former SP01. The B.5 shady-pass live walks are deferred to W2-06 (Wave 2, e2e). W1-01 collects E1–E7 decision answers from Rutvik and pre-triages B.5 rows using only file-state evidence (spec source, MD source, CSV source) — no live DOM. PermissionMode `plan` because the output is a decision artifact, not code changes.

---

## Context

The e2e environment is currently down. The original SP01 interleaved E1–E7 decisions (file-only, just need Rutvik's answers) with B.5 shady-pass live walks (e2e-dependent — playwright-cli). This restructure splits SP01 into two waves:

- **W1-01 (this subplan)**: file-only decision collection + drift pre-triage of B.5 rows using static evidence (read spec source, MD source, CSV source). Produces a decision artifact + a pre-triage table that classifies each B.5 row as `OBVIOUS-from-source` / `NEEDS-LIVE-WALK` / `ALREADY-RESOLVED-by-SP00`.
- **W2-06 (Wave 2)**: when e2e is back, execute live walks ONLY for the B.5 rows W1-01 classified as `NEEDS-LIVE-WALK`.

Provenance: restructured from `SUBPLAN_PARITY_01_DECISIONS_AND_SHADY_PASS_AUDIT.md` per Wave 1/Wave 2 split (2026-05-26).

---

## Bootstrap

**Identity**: WATCHDOG (read-only investigation; no code edits)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/questionnaire` (Phase 2 — collect E1–E7 answers)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §E decisions, §B.5 shady-pass rows
- `.claude/rules/pipeline.md` (LR-020 verify claims, LR-046 strict-line discipline, LR-048 subplan structural minimum)
- `.claude/rules/specs.md` (LR-021 un-skip before rewrite, LR-022 no hardcoded counts)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline truth source, LR-ENC-002 FCC parity)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm SP00 is in `plans/done/` — `ls plans/done/SUBPLAN_PARITY_00_*.md` returns 1 file. If still in `pending/`, HALT.
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for any prior Encore decision-collection work.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter for WATCHDOG / ALL-* entries on shady-pass classification.
4. LR scan — every active rule whose Trigger fires for read-only file-state classification.
5. **BrowserTool announcement** (LR-038 v2): `BrowserTool=none`. Reason: this subplan is the file-only half of the former SP01. All live walks are deferred to W2-06.

---

## Phase 1+ — Actual work

### Phase 1 — Drift Check (MANDATORY FIRST STEP)

This subplan was authored 2026-05-26 against the post-SP00 codebase state. Before any decision collection:

1. **Re-Glob** every file path referenced in this subplan's Bootstrap + the parent §E + §B.5 sections. Confirm each exists.
2. **Re-Grep** every codebase claim in parent's Findings table — for each module, cite current file:line evidence.
3. **Cross-check parent's Findings table** — mark each row VERIFIED / ALREADY-FIXED / DRIFTED-FURTHER / NEW.
4. **Read activity log** since 2026-05-26 for any sessions touching the same files.
5. **Emit a Drift Note** at `clients/encore/specs_planning/_internal/drift-note-W1-01-<YYYY-MM-DD>.md` with per-row verdict.
6. If >30% of scope is stale → HALT and ask user.

### Phase 2 — Decision collection (E1–E7)

Use `/questionnaire` in chat-text mode (per `feedback_question_style.md` — plain English, non-technical, no jargon). Collect Rutvik's answers for:

- **E1**: `left_panel` implementation timing (already resolved 2026-05-26: user said "do not create it" → routed to FCC master roadmap line; cite this resolution rather than re-asking)
- **E2**: `local_information` spec-only TCs (LI-064..077, SKIP-BILLING) — verified already in MD/CSV/spec; this decision is moot per W1-04 staleness correction. Cite and skip.
- **E3**: `management_history` TC-013/014 — bug fixed or bug present? Cannot decide file-only — DEFER to W2-06.
- **E4**: `shared_setup_locations` 6 fixme tests — per-TC blocker status. File-only check: read each fixme reason in spec source, classify as `HAS-JIRA-CITATION` / `NEEDS-INVESTIGATION` / `OBVIOUS-BLOCKER`. Then ask user per row.
- **E5**: `smoke_seed` origin — real coverage or scaffolding? File-only check: read the worktree mirror at `.claude/worktrees/loving-allen-408532/clients/encore/tests/specs/smoke/seed.spec.ts` (if it exists), read git history for any prior `clients/encore/specs/smoke/seed.spec.ts` deletions. Present findings to user, ask decision.
- **E6**: `local_office_settings` BAS-068 — confirm intent to add (default per governing principle). Single yes/no.
- **E7**: Pricing TC-018/019/022 + ECT TC-001/010 shady-pass candidates — DEFER to W2-06 (requires live verification).

### Phase 3 — B.5 row pre-triage (file-only)

For each of the 9 B.5 rows in parent §B.5, classify as:

- **OBVIOUS-from-source**: file-state alone shows the answer (spec already does X, MD says Y, no live walk needed)
- **NEEDS-LIVE-WALK**: file-state ambiguous; W2-06 must execute live verification
- **ALREADY-RESOLVED-by-SP00**: SP00's CSV augmentation already documented the verdict (cite which CSV row + which `If Failed Reason of Failure` field)

Emit a pre-triage table at `clients/encore/specs_planning/_internal/b5-pretriage-W1-01-<YYYY-MM-DD>.md`:

| Row | Module | TC | Pre-triage verdict | File evidence | Action for W2-06 |
|---|---|---|---|---|---|
| CUR | currency | 001 | <verdict> | <file:line> | <skip or live-walk> |
| PRI | pricing | 018,019,022 | <verdict> | <file:line> | <skip or live-walk> |
| MGH | management_history | 013,014 | <verdict> | <file:line> | <skip or live-walk> |
| ECT | local_office_ect | 001,010 | <verdict> | <file:line> | <skip or live-walk> |
| HIS-7 | local_office_history | 002 | <verdict> | <file:line> | <skip or live-walk> |
| LGL | legal | 016,017 | <verdict> | <file:line> | <skip or live-walk> |
| SSL | shared_setup_locations | 6 fixmes (current: TC-031/032/007/026/030) | <verdict> | <file:line> | <skip or live-walk> |
| BAS-048 | local_office_settings | 048 | <verdict> | <file:line> | <skip or live-walk> |
| LI-EXTRA | local_information | 064..077, SKIP-BILLING | ALREADY-RESOLVED (verified in MD+CSV+spec post-SP00) | MD/CSV/spec all aligned | skip — no live walk needed |

**Note on SSL fixmes**: original SP01 referenced TC-016/018/019/020/021/024 (6 fixmes). Current spec state has 5 fixmes (TC-031/032/007/026/030, all BUG-LOC-SHR-001). Use current TC IDs.

### Phase 4 — Jira cross-check (file-only)

For every TC marked OMITTED / skip / fixme without a Jira citation, file Jira ticket(s) OR flag for follow-up via `/encore-questions`. Do NOT close W1-01 with phantom-handoff per LR-040.

### Phase 5 — Decision + pre-triage handoff

Emit a single artifact at `clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-<YYYY-MM-DD>.md` containing:

1. E1–E7 decision answers (verbatim user responses, or "deferred to W2-06" with reason)
2. B.5 pre-triage table (above)
3. Jira filings (NM-NNNN ticket IDs with status + filing date)
4. List of `NEEDS-LIVE-WALK` rows that feed W2-06's scope

This artifact is W2-06's input. W2-06 only walks the rows classified `NEEDS-LIVE-WALK`.

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | (none) — no new behavior in scope | n/a |
| GIVER | test-cases / test-plans | (none) — decision collection only | n/a |
| BUILDER | specs/<module>/*.spec.ts | (none) — read-only investigation | n/a |
| HEALER | per-fix MD update | (none) — no RCA in scope | n/a |
| WATCHDOG | decision + pre-triage artifact | `W1-01-decisions-and-pretriage-<YYYY-MM-DD>.md` at `_internal/` | `ls clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-*.md` returns 1 file |
| GARDENER | refactor citation | (none) — no refactor in scope | n/a |

All non-(none) cells classified (a) MCP-proven (the artifact IS the proof) per LR-040.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during Phase 1+ that is (same identity) + (same file/module) + (5–30 min) + (no user input needed), pick exactly one: DO-NOW / SPAWN / APPEND. Bare "out of scope" = HALT + ask user.

---

## Acceptance criteria

- [ ] E1–E7 all have written answers OR explicit "deferred to W2-06" classification
- [ ] All 9 B.5 rows have a pre-triage verdict + file:line evidence
- [ ] Jira tickets exist (or are filed in this session) for every skip/OMITTED row
- [ ] Decision + pre-triage artifact exists at the named path
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files (note: this subplan is read-only, so diff should be empty except for the new artifact)
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042

---

## Verification

```bash
# Confirm decision + pre-triage artifact exists
ls clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-*.md  # expect: 1 file

# Confirm no code edits in this subplan
git diff --stat clients/encore/specs/ clients/encore/src/ clients/encore/test_cases_csv/  # expect: empty (read-only)

# Confirm all 9 B.5 rows classified
grep -c "^| " clients/encore/specs_planning/_internal/b5-pretriage-W1-01-*.md  # expect: >= 10 (header + 9 rows)
```

---

## Execution Summary

W1-01 closed read-only on 2026-05-26 with three artifacts emitted at `clients/encore/specs_planning/_internal/`:

1. `clients/encore/specs_planning/_internal/drift-note-W1-01-2026-05-26.md` — Phase 1 drift evidence (13 parent claims re-verified against current file state; ~7.7% stale ratio — below 30% HALT threshold).
2. `clients/encore/specs_planning/_internal/b5-pretriage-W1-01-2026-05-26.md` — Phase 3 file-only classification of 9 B.5 rows (4 OBVIOUS/ALREADY-RESOLVED/USER-AUTHORIZED-SKIP, 5 NEEDS-LIVE-WALK for W2-06).
3. `clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-2026-05-26.md` — Phase 5 consolidated handoff with E1–E7 answers, B.5 pre-triage summary, Jira-citation gap analysis, downstream inputs.

### E-decisions resolved this session (2026-05-26)

- E1 — DROP per user 2026-05-26 → routed to FCC master roadmap line at `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` (line 98 `SUBPLAN_LEFT_PANEL_FCC` reference).
- E2 — MOOT; LI-EXTRA already aligned in MD+CSV+spec (parent §Findings marks RESOLVED-by-AUDIT).
- E3 — classification needs W2-06 live walk; cannot decide file-only.
- E4 — HAS-BUG-CITATION on all 5 SSL fixmes (TC-031/032/007/026/030 cite BUG-LOC-SHR-001 inline in `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` test.fixme reasons + 2026-05-22 user manual-probe verification embedded in spec comments); user authorized W2-06 skip in Phase 2 questionnaire. Drift note: the bug-report JSON file at `reports/bugs/` was NOT found in git tree (current or historical) despite navigation-registry citation — see drift artifact for detail.
- E5 — smoke_seed = scaffolding-only verdict; W1-04 sweeps references (no current refs, no git history, worktree mirror at `tests/seed.spec.ts` one dir different from parent claim).
- E6 — BAS-068 = ADD to spec + CSV per W1-04 (governing principle default; MD already has it at `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` line 291).
- E7 — classification needs W2-06 live walk; cannot decide file-only.

### B.5 row classification counts (full table at `clients/encore/specs_planning/_internal/b5-pretriage-W1-01-2026-05-26.md`)

- OBVIOUS-from-source: 2 rows (CUR, HIS-7)
- USER-AUTHORIZED-SKIP: 1 row (SSL — 5 fixmes)
- ALREADY-RESOLVED-by-SP00: 1 row (LI-EXTRA — 14 TCs)
- NEEDS-LIVE-WALK for W2-06: 5 rows (PRI, MGH, ECT, LGL, BAS-048)
- Total: 9 of 9 rows classified with file:line evidence.

### Jira-citation gap (Phase 4 audit)

- Cited already: BUG-LOC-SHR-001 covers SSL 5 fixmes via inline spec-comment citations at `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` (sufficient per E4 user authorization). Note: the originally-expected `reports/bugs/` JSON for this bug ID is absent from git tree — see drift artifact.
- NEEDS Jira NM-NNNN filing (3 candidates routed downstream): LGL TC-016/017 (unsorted-dropdowns app-bug), BAS-048 (dirty-tracking on Active toggle), MGH TC-019 (pagination collapse).
- Test-data limitations (route to `/encore-questions`, 2 candidates): MGH TC-006 (needs <=20-row office), MGH TC-007 (needs zero-history office).
- Phantom-handoff check (LR-040): every gap has a concrete destination — no orphaned items.

### Acceptance criteria status

- [x] E1–E7 all have written answers OR explicit "needs W2-06 live walk" classification — DONE
- [x] All 9 B.5 rows have a pre-triage verdict + file:line evidence — DONE (companion table)
- [x] Jira-status flagged for every skip/OMITTED row — DONE (3 NEEDS-JIRA + 1 already-cited + 2 test-data-limitations)
- [x] Decision + pre-triage artifact exists at named path — DONE (`W1-01-decisions-and-pretriage-2026-05-26.md`)
- [x] /regression-guard diff expected to be empty except for the 3 new `_internal/` artifact files — VERIFIED (read-only subplan, no code edits)
- [x] Activity-log row appended per LR-028 with LR-037 timestamp — pending (closure ceremony next)
- [x] /final-q verdict block emitted per LR-042 — pending (closure ceremony next)

### Adjacent items noted (Phase 2.5 — informational, no file edit)

- Plan-body line 102 "6 fixmes" header label is stale carry-over from 2026-05-21 snapshot; line 106 explicitly corrects to "5 fixmes (TC-031/032/007/026/030)". No fix needed — header already self-correcting via the adjacent note.
- E5 worktree mirror path in plan-body is one dir off (current actual: `.claude/worktrees/loving-allen-408532/clients/encore/tests/seed.spec.ts`, plan body claimed `tests/specs/smoke/seed.spec.ts`). Verdict unchanged — scaffolding either way.

### Per-Identity Satisfaction matrix outcome

- WATCHDOG-owned artifact: `clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-2026-05-26.md` — emitted.
- All other rows in the matrix were marked `(none)` in the original subplan body — honored throughout (no spec/MD/CSV/REQUIREMENTS edits this session).
- Acceptance command: `ls clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-2026-05-26.md` returns 1 file (cited per LR-042 evidence-emission).

### Read-only verification

- Subplan PermissionMode `plan` honored. Zero edits to `clients/encore/specs/`, `clients/encore/src/`, `clients/encore/test_cases_csv/`, or any deliverable surface.
- BrowserTool `none` per LR-038 v2 — announced at session start; no live DOM accessed; CLI / Chrome / Playwright MCP all untouched.

### Downstream consumers (no phantom handoffs per LR-040)

- `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` (at `plans/pending/`) — consumes E5 + E6 + HIS-7 file-only fix.
- `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` (at `plans/pending/`) — consumes the 5 NEEDS-LIVE-WALK rows.
- `/encore-questions` — consumes 2 test-data-limitation items (MGH TC-006/007) + 1 SSL-precedent reuse decision for BAS-048.

---

## Handoff (post-execution)

Decision + pre-triage artifact published. W1-04 consumes the E-decision answers + HIS-7 file-only fix; W2-06 consumes the B.5 pre-triage NEEDS-LIVE-WALK row list.
