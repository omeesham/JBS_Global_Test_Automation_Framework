# SUBPLAN_PARITY_W2_06 — Shady-Pass Live Audit + Verdicts (E2E-dependent)

**Status**: GATED (blocked until e2e environment is back)
**Priority**: P0
**Created**: 2026-05-26
**Identity**: WATCHDOG
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: ALL OF WAVE 1 — SUBPLAN_PARITY_W1_01, W1_03, W1_04, W1_05 (W1-02 closed-as-superseded by PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION; Wave 0 XLSX migration must also be GREEN before live audit)
**Blocks**: SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: review
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: Live DOM verification for shady-pass classification (HONEST adaptation vs SHADY shortcut vs MD-stale). Per `.claude/rules/browser-tool.md` LR-038 v2 — CLI is default for headless verdict capture; no fresh MFA or visual CSS work needed.

---

## Context

W2-06 executes the LIVE-WALK half of the former SP01. W1-01 pre-triaged the 9 B.5 rows into:
- `OBVIOUS-from-source` (resolved file-only by W1-04)
- `ALREADY-RESOLVED-by-SP00` (resolved by SP00's CSV augmentation)
- `NEEDS-LIVE-WALK` (deferred to W2-06 — this subplan)

W2-06's scope is ONLY the `NEEDS-LIVE-WALK` rows. Reading W1-01's artifact tells W2-06 exactly which rows to walk.

Provenance: restructured from `SUBPLAN_PARITY_01_DECISIONS_AND_SHADY_PASS_AUDIT.md` (B.5 live-walk half) per Wave 1/Wave 2 split (2026-05-26).

---

## Bootstrap

**Identity**: WATCHDOG (read-only live investigation; no code edits)

**Skills auto-called**:
- `/identity`, `/audit`, `/relevant`, `/final-q`

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §B.5 shady-pass rows
- `clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-<date>.md` — pre-triage table (W2-06's scope filter)
- `clients/encore/specs_planning/_internal/old-site-baseline/` — baseline truth source per LR-ENC-001
- `.claude/rules/browser-tool.md` — LR-054 (playwright-cli capability table)
- `clients/encore/CLAUDE.md` — LR-ENC-001 baseline, Office 1604, auth story

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm ALL of Wave 1 closed GREEN (W1-01 through W1-05).
2. Confirm e2e environment is reachable: `gh auth status` + `playwright-cli` smoke test against `cloudapps-e2e.encoreglobal.com`.
3. Read navigation.md, agent-mistakes.md per `/execute` Phase 0.
4. **BrowserTool announcement**: `BrowserTool=cli`. Reason: shady-pass classification needs live DOM observation; CLI is sufficient (no visual CSS work, no fresh MFA flow needed since `.auth/e2e-state.json` is preserved).

---

## Phase 0.5b — Baseline-first walk (REQUIRED per LR-048)

This subplan triggers Phase 0.5b because Identity=WATCHDOG AND title contains "audit" AND subplan output drives TC corrections.

1. Visit baseline truth source `https://navigator2.training.psav.com/#/` first per `.claude/rules/baseline.md` workflow.
2. Emit or refresh `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md` for any module where the latest baseline is >14 days old.
3. Visit new site `https://cloudapps-e2e.encoreglobal.com/navigator/` per LR-ENC-001.
4. Classify each observed-vs-baseline divergence as: (a) regression-from-baseline / (b) intentional UX change / (c) baseline-absent (per LR-ENC-001 — NOT a HALT).

---

## Phase 1+ — Actual work

### Phase 1 — Drift Check (MANDATORY)

1. Re-Read W1-01's pre-triage artifact — confirm `NEEDS-LIVE-WALK` row list.
2. Confirm the rows still need walking (W2-08 may have already fixed some out-of-order).
3. Re-Grep current spec state for each shady-pass row.
4. Read activity log since W1-01 closure.
5. Emit Drift Note. >30% stale → HALT.

### Phase 2 — Per-row live walk

For each row marked `NEEDS-LIVE-WALK` in W1-01's pre-triage:

1. **Auth setup**: load `.auth/e2e-state.json`; refresh via `playwright-cli open --persistent` if Entra redirect.
2. **Navigate** to the relevant page (Office 1604 → module → tab).
3. **Execute the MD's specified action** (enter invalid value, click button, etc.).
4. **Observe actual behavior** via `playwright-cli snapshot` + `eval` for DOM state.
5. **Compare to spec's assertion** (read spec file at the line in question).
6. **Capture evidence** at `.playwright-cli/shady-{ROW}-{date}.yml` (snapshot artifact) + `.playwright-cli/shady-{ROW}-{date}.network.json` (network log if relevant).

### Phase 3 — Classify each row

Per parent §B.5 decision tree:

- **HONEST adaptation** → field/UI physically blocks the MD scenario. Document the adaptation in MD as "test adapted because <reason>".
- **SHADY pass** → spec asserts something easier than MD intent. Mark for rewrite in W2-08.
- **MD/CSV stale** → app behavior changed. Mark MD+CSV for update.

### Phase 4 — Jira cross-check

For every TC marked OMITTED/skip without a Jira citation, file Jira NM-NNNN ticket OR flag via `/encore-questions`. Do NOT close W2-06 with phantom-handoff per LR-040.

### Phase 5 — Verdict artifact

Emit `clients/encore/specs_planning/_internal/shady-pass-verdicts-<YYYY-MM-DD>.md` with frontmatter, per-row verdict table, evidence links, corrective-action list. This artifact is W2-08's input.

| Row | TC | Verdict | Evidence path | Corrective action for W2-08 |
|---|---|---|---|---|
| CUR | CUR-001 | HONEST/SHADY/STALE | path | rewrite/keep/update-MD |
| ... | ... | ... | ... | ... |

### Phase 6 — Hand off via activity log

Append LR-028 row noting decisions resolved + Jira filings.

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | refreshed baseline artifact per Phase 0.5b | `ls clients/encore/specs_planning/_internal/old-site-baseline/*-<date>.md` |
| GIVER | test-cases.md, test-plans.md, CSV | (none) — verdict capture only; MD/CSV edits are W2-08 | n/a |
| BUILDER | specs/<module>/*.spec.ts | (none) — verdict capture only | n/a |
| HEALER | per-fix MD update | (none) | n/a |
| WATCHDOG | shady-pass-verdicts artifact | `shady-pass-verdicts-<date>.md` + per-row evidence files | `ls _internal/shady-pass-verdicts-*.md` returns 1 + `.playwright-cli/shady-*.yml` >= live-walk row count |
| GARDENER | refactor citation | (none) | n/a |

All non-(none) cells classified (a) MCP-proven per LR-040.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during live walks (e.g., dead CSS, broken images, console errors on the page under test): DO-NOW / SPAWN / APPEND. Bare "out of scope" = HALT.

---

## Acceptance criteria

- [ ] Every `NEEDS-LIVE-WALK` row from W1-01 has a verdict + evidence path
- [ ] No row left UNCLASSIFIED
- [ ] Jira tickets exist (or filed in this session) for every skip/OMITTED row
- [ ] Verdict artifact exists at `_internal/shady-pass-verdicts-<date>.md` with all NEEDS-LIVE-WALK rows
- [ ] Per-row evidence file present at `.playwright-cli/shady-*-<date>.yml`
- [ ] Baseline artifact refreshed for any module walked
- [ ] `/regression-guard` snapshot before/after — read-only walk, expect zero source diff (only new artifact files)
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted

---

## Verification

```bash
# Verdict artifact present
ls clients/encore/specs_planning/_internal/shady-pass-verdicts-*.md  # expect: 1 file

# Per-row evidence present
ls .playwright-cli/shady-*.yml | wc -l  # expect: >= NEEDS-LIVE-WALK row count

# No source code edits
git diff --stat clients/encore/specs/ clients/encore/src/ clients/encore/test_cases_csv/  # expect: empty
```

---

## Wave 2 read-only parallelization constraint

W2-06 and W2-07 can run in parallel ONLY IF strictly read-only. No shared dirty app state. No mutations during walks. If either subplan needs to save/edit in the app, they must run sequentially with W2-06 first.

---

## Handoff (post-execution)

Shady-pass verdicts captured. W2-08 inherits the verdict table and executes corrective spec rewrites.
