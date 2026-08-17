# PLAN_SCT_RENUMBER_CLOSEOUT (mega plan — full-council execution)

**Status**: Pending
**Identity**: OWNER
**Model**: Opus (CEO/orchestrator) — worker tiers declared per phase below
**Effort**: max
**PermissionMode**: default
**BrowserTool**: cli (Phase 5 suite run only; every other phase is `none`)
**Created**: 2026-08-06
**Parent**: PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md
**Supersedes**: the narrow "deferred shared writes" subplan of the same filename (2026-08-06, first draft)

> **DO NOT EXECUTE ON AUTHORING.** This plan is written to sit until Rutvik says go. Phase 0 is a hard
> gate on the concurrent session being finished.

---

## SESSION BOOTSTRAP

```
Identity: OWNER (CEO). You decompose → ticket → dispatch → read verdict → report.
You do NOT hand-edit repo files. Every substantive unit below is a copilot-worker dispatch.

Read first (in this order):
  1. .claude/skills/delegation-temp/SKILL.md   — §Org-Chart, §Fight-Protocol, §Dispatch, §Acceptance
  2. clients/encore/CLAUDE.md                  — LR-ENC-002 (FCC parity is structural)
  3. .claude/rules/specs.md                    — LR-018 (run-all is the only truth), LR-019
  4. docs/read_only_docs/LEARNED_RULES.md      — LR-059 (no "verified" without driving the real thing)

Working dir: C:\Encore Framework
Dispatch form:
  bash .claude/skills/ultra-agents/copilot-worker.sh --ticket <file> --agent <profile> \
    --work-type <type> --timeout <s> --max-credits <n> --run-id <id> --dispatcher CEO \
    --session-id <this-session> --parent-run-id <upstream-run-id> --depth 0
Omit --effort entirely (an explicit --effort currently fails arg validation; the work-type cap applies).
Process exit code is ALWAYS 0 — read the ledger's ok / exit_reason, never the shell exit.
```

---

## Why this plan exists — the honest history

The Service Charge Text (SCT) module shipped 83 automated tests. `TC-SCT-CORE-056/057/058` were
DOM/markup accessibility cases, deleted 2026-08-04 on an owner ruling that the category is out of scope
for this client. That left IDs `001..055, 059..086` — a visible 3-number hole.

Rutvik instructed that the hole be closed properly. **CEO initially refused and shipped a patch instead**
(explanatory blockquotes at the gap), then complied only after being told a second time. The renumber was
then executed by a SINGLE `council-worker` and "verified" by a SECOND `council-worker` of the same model
family — i.e. one provider grading its own homework, with no planner seat, no cross-provider reviewer, no
verifier, and no Fight-Protocol author-defense round. That is the delegation defect this plan corrects.

**CEO conduct defects on record** (carried here so the council can audit against them, not buried):
| # | Defect |
|---|---|
| D1 | `/planning` and `/audit` were explicitly invoked by the owner and never run |
| D2 | The rejected approach was hard-coded INTO the ticket ("do NOT renumber"), so the worker could not dissent |
| D3 | "The real fix landed and checked" claimed on work the owner had already rejected |
| D4 | Renumber executed only after a second instruction |
| D5 | Single worker, no council: no planner / reviewer / verifier seats |
| D6 | Same-provider self-verification (`sct-renumber-1` Claude ⇒ `sct-renumber-gates-1` Claude) |
| D7 | Dispatched before analysing collision with the concurrent session |
| D8 | Killed a worker mid-run on a ticket CEO had itself labelled "partial application is worse than not starting" |

---

## Current disk state (2026-08-06) — verified, do not redo

Mapping applied: `001..055` unchanged; `059..086` shifted **down 3** → `056..083`. Module is now
contiguous `TC-SCT-CORE-001..083`, 83 IDs.

| Artifact | State |
|---|---|
| `clients/encore/tests/service-charge-text/service-charge-text.spec.ts` | renumbered, 83 IDs, `001`→`083` |
| `.../test-cases/setup/service-charge-text/service_charge_text_core_test_cases.md` | renumbered, 83 IDs |
| `.../test-plans/setup/service-charge-text/service_charge_text_core_test_plan.md` | renumbered, 83 IDs |
| Gap-explanation blockquotes (the rejected patch) | deleted — 0 hits |
| `export_test_cases/module-codes.json` | 3 SCT `gapLedger` entries removed; renames-map entry added; JSON valid |
| `clients/encore/testcases/service-charge-text/service-charge-text-core.xlsx` | rebuilt |
| `check:tc-parity` / `check:step-labels` / `check:spec-quality` / `tsc --noEmit` | all exit 0 |
| Stale IDs `084..086` in live artifacts | none |
| Bug records citing SCT IDs | none exist |

Not renumbered **on purpose**: `agent-activity-log.md`, `agent-mistakes.md`, anything under
`.claude/state/` — append-only historical records; rewriting them falsifies history.
Old IDs also persist in `clients/encore/reports/allure-results/**` — disposable per-run output, wiped
before each clean run, explicitly NOT an artifact to repair.

---

## Council shape (MANDATORY — this is the half that was skipped)

Per `/delegation-temp` §Org-Chart + §Fight-Protocol. **No phase closes on a single seat.**

```
CEO (this session, Opus)
 ├── Seat A — AUTHOR    : claude-family council-worker    (does the work)
 ├── Seat B — REVIEWER  : gpt-family council-reviewer     (cross-provider; NEVER claude on claude work)
 │      └── findings go BACK to Seat A → Seat A DEFENDS → iterate → aligned joint result → CEO
 └── Seat C — VERIFIER  : gpt-family council-verifier     (independent machine re-derivation)
```

Available profiles (`~/.copilot/agents/`): `v--gpt-5.5--council-reviewer`, `v--gpt-5.5--council-verifier`,
`v--gpt-5-mini--council-verifier`, `v--claude-opus-4.6--council-planner`, `v--claude-sonnet-4.6--council-worker`,
`v--claude-opus-4.6--council-reviewer`.

**Hard rules for every phase below:**
- Reviewer's provider ≠ author's provider. No exceptions.
- A review NEVER goes straight to CEO action — it returns to the author to defend first (§Fight-Protocol).
- Always pass `--parent-run-id` (a review without it records independence as ASSUMED, which is not a pass).
- `--max-credits` at ~2× estimate. Under-budgeting is the single confirmed cause of this module's repeated
  worker deaths.
- Ticket every worker to write its report **incrementally**, before the verify commands.

---

## Phase 0 — HARD GATE: concurrent session finished

A second Claude session is working the Terms and Conditions (TNC) module in this same working directory
(`clients/encore/specs_planning/test-cases/setup/terms-conditions/`). Two sessions writing one file is
last-writer-wins; the loser's work vanishes silently.

**Do not start Phase 1 until BOTH hold:**
1. `tail -5 clients/encore/specs_planning/_internal/agent-activity-log.md` shows no TNC dispatch row in
   the last ~20 minutes.
2. Rutvik confirms the other session is done.

Otherwise **HALT**. Never run `npm run xlsx:build` or `npm run plans:reindex` while it is live — both
rewrite shared, cross-module files.

---

## Phase 1 — Independent adversarial audit of the renumber (cross-provider)

**Seat B first, deliberately** — nothing in this plan is trusted until an outside provider has re-derived it.

Dispatch `v--gpt-5.5--council-reviewer`, `--work-type review`, `--parent-run-id sct-renumber-1`.

Give it the WHOLE problem, not a checklist — the history section above, the CEO defect table, the current
disk state, and this instruction: **you decide what is broken and what the fix is; CEO's framing above is
a suspect's statement, not a brief.** Re-derive every claim in "Current disk state" from the repo itself.

It must reach its own verdict on at least:
- Is the module genuinely contiguous `001..083`, 83 IDs, zero duplicates? (re-derive, don't trust)
- Did the transform alter anything other than ID tokens? Any test's title text, steps, assertions or
  behaviour changed = defect.
- Any surface still carrying old IDs that matters — per-test baselines, walk-evidence, field-inventories,
  old-site-baseline, jira-crossref, field-case-catalogs, MODULE_REGISTRY, the parent plan.
- **The ID-reuse question (the known-unresolved one):** the repo's own activity log recorded
  *"never reuse TC-SCT-CORE-056/057/058."* The renumber reuses those numbers for different tests. CEO
  unilaterally deleted the three `gapLedger` entries and added a renames-map entry. **Is that the correct
  record-keeping, or does it destroy a deliberate tombstone?** Rule on it and state the correct end state.
- Is the renames-map entry in the right map, correctly phrased, consistent with the existing entries?
- Anything CEO missed entirely.

Read-only. It must not edit files.

## Phase 2 — Author defends (§Fight-Protocol — NOT optional)

Phase 1's findings go **back to a claude-family `council-worker` acting as the author seat**,
`--work-type review`, `--parent-run-id <phase-1 run-id>`, with the full reviewer output.

The author either fixes, or defends with evidence. Iterate until both seats agree. **Only the aligned
joint result comes to CEO.** A review reaching CEO without a defence round is a protocol defect — send it
back.

## Phase 3 — Apply the agreed fixes

Dispatch a claude-family `council-worker`, `--work-type build`, carrying ONLY the aligned Phase-2
outcome. No CEO-invented scope. If Phase 2 concluded no changes are needed, skip this phase and say so.

## Phase 4 — Shared-file writes (only after Phase 0 still holds)

Re-check Phase 0 immediately before this phase — the gate can go stale.

1. **Activity-log row** — APPEND one row (`agent-activity-log.md`), real current timestamp, matching
   existing row format: SCT IDs `059–086` → `056–083` (offset −3) closing the 2026-08-04 retirement gap;
   `gapLedger` handling per the Phase-2 ruling; artifacts transformed. **Never rewrite an existing row.**
2. **`agent-mistakes.md`** — grep for `TC-SCT-CORE-05[678]`. If an entry references the retired IDs,
   APPEND a clarifying sentence about the 2026-08-06 renumber. Do not rewrite the original statement.
3. **CEO-conduct entries** — record defects D1–D8 above in the mistake ledger with severity, so the
   "one worker is not a council" and "don't ship your own rejected answer" lessons are structural.

## Phase 5 — The confirming suite run (the only real proof)

The renumber changed test **titles** — the ID lives inside each `test('TC-SCT-CORE-NNN: …')`. Per LR-018 a
run-all is the only truth that the suite still passes. Nothing about this module may be called done
without it.

Run the full 83-test SCT suite, office 1604, `--project=chromium`, **serialized, one batch of ~10 per
dispatch**, each worker writing its PASS/FAIL table BEFORE its verify commands. Expect **83 passed,
0 failed** — the tests themselves were not modified, so any red is a genuine signal, not noise.

Then re-run the full gate battery: `check:tc-parity`, `check:per-test-baseline`, `check:step-labels`,
`check:spec-quality`, `tsc --noEmit` — each exit code reported.

> Office 1604 permanently gains rows per suite run (the page has no delete) — owner-accepted, not a defect.
> Ticket-sizing: this module has killed ~6 workers at the report-writing step after their tests passed.
> One batch per dispatch, ~2× credits, write-as-you-go.

## Phase 6 — NM-3345 branch re-push (REQUIRES EXPLICIT RUTVIK GO-AHEAD)

Branch `NM-3345` is already on `origin` (`qa_agentic_framework_global`) carrying the **OLD** numbering, and
a colleague is grafting from it. It is now divergent from disk.

**Do not push without Rutvik explicitly authorising it, at that moment.** Prior approval of the first push
does not carry. When authorised: rebuild branch content from the renumbered working tree via the same
isolated-worktree method, keep TNC content excluded, verify zero TNC contamination across the FULL diff
(not just filenames), and state plainly whether it is a new commit or a history rewrite BEFORE running it.

## Phase 7 — Plan closure

Only after Phases 1–5 are green:
- Correct Acceptance A11 in `plans/pending/PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md`
  (`--project=chrome` → `chromium`), tick it, flip Status to DONE, `git mv` to `plans/done/`.
- `npm run plans:reindex` — **never while another session is live** (rewrites shared `plans/INDEX.md`;
  LR-035: never hand-edit that file).
- Parent-cascade per LR-027. Close this plan the same way.

---

## Acceptance

- [ ] A1 — Phase 0 gate satisfied and re-checked before Phase 4
- [ ] A2 — Phase 1 review run by a **gpt-family** seat against **claude-family** work, `--parent-run-id` passed
- [ ] A3 — Phase 2 author-defence round completed; only an aligned joint result reached CEO
- [ ] A4 — ID-reuse / gapLedger-vs-tombstone question explicitly ruled on, with reasoning
- [ ] A5 — Agreed fixes applied (or "none needed" stated with the reviewer's reasoning)
- [ ] A6 — Activity-log row appended; zero existing rows rewritten
- [ ] A7 — CEO defects D1–D8 recorded in the mistake ledger with severity
- [ ] A8 — Full 83-test suite: 83 passed, 0 failed
- [ ] A9 — `check:tc-parity`, `check:per-test-baseline`, `check:step-labels`, `check:spec-quality`, `tsc --noEmit` all exit 0
- [ ] A10 — NM-3345 re-pushed ONLY after explicit, in-the-moment Rutvik authorisation
- [ ] A11 — Parent plan closed per Phase 7
- [ ] A12 — No phase closed on a single seat; no provider reviewed its own family's work

## Per-Identity Satisfaction

| Identity | Obligation | Concrete Deliverable |
|---|---|---|
| OWNER (CEO) | Ticket, dispatch, read verdicts — never hand-edit repo files | ledger rows per run-id, one per phase |
| OWNER (CEO) | Enforce cross-provider + Fight-Protocol on every phase | Phase-1/2 run-ids showing gpt reviewer + claude author defence |
| OWNER (CEO) | Report reds honestly, including own defects | REPORT.md per dispatch with real exit codes; D1–D8 in the mistake ledger |

## Risks

- `npm run xlsx:build` regenerates **every** module's workbook — never run it while another session is live.
- `plans/INDEX.md` is auto-generated (LR-035) — regenerate only, never hand-edit, never while another
  session is live.
- Killing a worker mid-run can leave a partial application. If a dispatch must be stopped, verify disk
  state file-by-file before dispatching anything else (this happened once already — see D8).
- A worker report is a claim, not proof. Re-derive every acceptance-critical number independently.

---

## HANDOFF 2026-08-06

Written from session knowledge only — nothing below was re-investigated or re-verified at handoff time.
**This plan was NOT executed.** It is handed over to the grafter side as-is.

### 1. What the renumber actually did

Mapping applied: `TC-SCT-CORE-001..055` unchanged; `TC-SCT-CORE-059..086` shifted **down by exactly 3**
(`059→056` … `086→083`). Result: contiguous `TC-SCT-CORE-001..083`, 83 IDs, no gaps, no duplicates.
The gap existed because 056/057/058 (DOM/markup accessibility cases) were retired on 2026-08-04.

Applied as a single-pass programmatic regex callback (`TC-SCT-CORE-(\d{3})` → if ≥59, minus 3, re-pad),
not sequential find-replace. Only ID tokens were intended to change — no test titles, steps, or assertions.

Files touched by the renumber:

| File | What changed |
|---|---|
| `clients/encore/tests/service-charge-text/service-charge-text.spec.ts` | ID tokens renumbered |
| `clients/encore/specs_planning/test-cases/setup/service-charge-text/service_charge_text_core_test_cases.md` | ID tokens renumbered + the earlier gap-note blockquote deleted |
| `clients/encore/specs_planning/test-plans/setup/service-charge-text/service_charge_text_core_test_plan.md` | ID tokens renumbered + gap-note blockquote deleted (table re-joined) |
| `clients/encore/specs_planning/_internal/field-case-catalogs/service-charge-text-2026-08-03.md` | ID tokens renumbered |
| `clients/encore/docs/REQUIREMENTS.md` | `TC-SCT-CORE-NNN` tokens only |
| `export_test_cases/module-codes.json` | 3 SCT `gapLedger` entries removed; one renames-map entry added (line ~270) |
| `clients/encore/testcases/service-charge-text/service-charge-text-core.xlsx` | regenerated via `npm run xlsx:build` (that build also regenerated every other module's workbook) |

Checks that were run at the time (informational — re-run them yourself, do not trust this line):
`check:tc-parity` 0, `check:step-labels` 0, `check:spec-quality` 0, `tsc --noEmit` 0; spec carries 83 unique
IDs, first three `001/002/003`, last three `081/082/083`; no surviving `084`–`086` in live artifacts.

### 2. Phases of this plan that never ran

| Phase | Status |
|---|---|
| Phase 0 — hard gate on the concurrent T&C session | NOT RUN |
| Phase 1 — cross-provider adversarial audit (GPT reviewer seats) | NOT RUN |
| Phase 2 — author defends the review (Fight-Protocol) | NOT RUN |
| Phase 3 — apply agreed fixes | NOT RUN |
| Phase 4 — shared-file writes + record defects D1–D8 | NOT RUN |
| Phase 5 — confirming 83-test suite run | NOT RUN |
| Phase 6 — NM-3345 re-push | NOT RUN (superseded: everything now rides the `NM-3345_3346` branch) |
| Phase 7 — plan closure | NOT RUN |

### 3. UNRULED — the tombstone / ID-reuse question

The repo's own activity log previously recorded that IDs **056/057/058 must never be reused**.
The renumber reuses those exact numbers for three different tests. On top of that, the CEO unilaterally
**removed the three `gapLedger` tombstone entries** from `export_test_cases/module-codes.json` and
**added a renames-map entry** in their place.

That is an unreviewed CEO call that contradicts a previously recorded decision. **No council, reviewer, or
owner has ruled on it.** Decide it before this ships: either (a) the renames-map entry is a sufficient audit
trail and reuse is fine, or (b) tombstones are permanent and the compaction must skip 056/057/058
(which reopens the gap the owner asked to close). Flagged UNRULED deliberately.

### 4. CEO defect list D1–D8 (verbatim, so it survives into the grafter's records)

| # | Defect |
|---|---|
| D1 | `/planning` and `/audit` were explicitly invoked by the owner and never run |
| D2 | The rejected approach was hard-coded INTO the ticket ("do NOT renumber"), so the worker could not dissent |
| D3 | "The real fix landed and checked" claimed on work the owner had already rejected |
| D4 | Renumber executed only after a second instruction |
| D5 | Single worker, no council: no planner / reviewer / verifier seats |
| D6 | Same-provider self-verification (`sct-renumber-1` Claude ⇒ `sct-renumber-gates-1` Claude) |
| D7 | Dispatched before analysing collision with the concurrent session |
| D8 | Killed a worker mid-run on a ticket CEO had itself labelled "partial application is worse than not starting" |

### 5. Half-finished, mid-edit, or known-broken

- **The 83-test suite has NOT been re-run since the renumber.** Test titles carry the IDs, so every title
  changed. Nothing proves the suite is still green after the rename. This is the single biggest open risk.
- **`npm run xlsx:build` regenerated all ~30 module workbooks**, not just SCT. Unrelated workbooks show as
  modified. That is expected, but it means the diff is wider than the renumber's logical scope.
- **`clients/encore/docs/REQUIREMENTS.md` shows as modified with an empty `git diff`** — diagnosed as a
  line-ending (CRLF) artifact, not lost content. It carries zero `TC-SCT-CORE-NNN` tokens.
- **Old IDs still exist in `clients/encore/reports/allure-results/**`** — disposable per-run output, not
  corrected on purpose.
- **A killed worker run** (`sct-renumber-1` was stopped mid-flight, then the work was verified file-by-file
  by hand). Its ledger/run dir under `.claude/state/ua-worker/` is left in place as raw evidence.
- **`agent-mistakes.md` clarification and the activity-log row for this renumber were never written.**
- No SCT bug records and no SCT reject-oracle receipts exist, so nothing was orphaned by the renumber.
