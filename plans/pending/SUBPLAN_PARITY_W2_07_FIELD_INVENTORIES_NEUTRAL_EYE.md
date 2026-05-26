# SUBPLAN_PARITY_W2_07 — HIS + ECT Field Inventories + Neutral-Eye Audits (E2E-dependent)

**Status**: GATED (blocked until e2e environment is back)
**Priority**: P1
**Created**: 2026-05-26
**Identity**: WATCHDOG
**Parent**: PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md
**Depends on**: ALL OF WAVE 1 — W1-01, W1-03, W1-04, W1-05 (W1-02 closed-as-superseded by PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION; Wave 0 XLSX migration must also be GREEN before live walks)
**Blocks**: SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: review
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: Live DOM walks for HIS + ECT field-inventory authoring + neutral-eye audit observation. CLI is sufficient (no visual CSS, no fresh MFA).

---

## Context

W2-07 owns the e2e-dependent half of the former SP02:
- **C4** — Walk HIS + ECT tabs live; emit field-inventory MDs per the field-inventory-spec.md schema
- **C5** — Neutral-eye audit pass on HIS + ECT specs; emit audit MDs

These tasks were originally in SP02 but require live DOM observation (HIS table cell render formats, ECT field types, neutral-eye walk-the-spec-while-watching-the-app evaluation). They cannot run while e2e is down.

W1-03 already did the code-side split (page-objects + selectors + fixtures). W2-07 only does the inventory/audit observation work.

**Left-panel walkthrough explicitly EXCLUDED**: per user decision 2026-05-26 ("do not create it"), left-panel coverage is deferred to FCC master's `SUBPLAN_LEFT_PANEL_FCC` roadmap line. W2-07 covers HIS + ECT only.

Provenance: restructured from `SUBPLAN_PARITY_02_LOCAL_OFFICE_SPLIT.md` (C4 + C5 only) per Wave 1/Wave 2 split (2026-05-26).

---

## Bootstrap

**Identity**: WATCHDOG (read-only live investigation + audit artifact authoring)

**Skills auto-called**:
- `/identity`, `/audit`, `/relevant`, `/final-q`

**Context files**:
- `plans/pending/PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` — §C4, §C5
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` — schema canon
- `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md` — pattern reference for HIS + ECT inventories
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md` — pattern reference for HIS + ECT audits
- `clients/encore/specs/local-office/local-office-{history,ect}.spec.ts` — post-W1-03 split specs
- `.claude/rules/browser-tool.md` — LR-054
- `clients/encore/CLAUDE.md` — LR-036 (HIS table uses Unicode ✔; LOS HIS uses SVG lucide-check — verify per-table)

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm ALL of Wave 1 closed GREEN.
2. Confirm e2e environment reachable.
3. Read navigation.md, agent-mistakes.md per `/execute` Phase 0.
4. **BrowserTool announcement**: `BrowserTool=cli`. Reason: walks need DOM observation; CLI is sufficient.

---

## Phase 0.5b — Baseline-first walk (REQUIRED per LR-048)

This subplan triggers Phase 0.5b because Identity=WATCHDOG AND title contains "neutral-eye" AND subplan output drives TC corrections.

1. Visit baseline truth source for HIS + ECT tabs (note: ECT is baseline-absent per LR-ENC-001 — record `baselineScope: baseline-absent`, NOT a HALT).
2. Emit or refresh baseline artifacts as needed.
3. Visit new site; classify divergences per LR-ENC-001.

---

## Phase 1+ — Actual work

### Phase 1 — Drift Check (MANDATORY)

1. Re-Glob `clients/encore/specs_planning/_internal/field-inventories/` — confirm HIS + ECT files don't yet exist (or are stale).
2. Same for `_internal/neutral-eye-audits/`.
3. Read activity log since 2026-05-26.
4. Emit Drift Note. >30% stale → HALT.

### Phase 2 — C4: HIS field-inventory walk

1. Authenticate via `.auth/e2e-state.json`.
2. Navigate to Office 1604 → Local Office → History tab.
3. Walk every field on the page systematically per `field-inventory-spec.md` schema:
   - Field label
   - Field type (text / dropdown / checkbox / table / boolean toggle)
   - Default value
   - Validation rules
   - Selector (testid if present, else CSS path)
   - Render format for booleans (Unicode ✔ vs SVG lucide-check — per LR-036)
4. Capture DOM snapshot at each field; cite snapshot path.
5. Emit `clients/encore/specs_planning/_internal/field-inventories/local-office-history-<YYYY-MM-DD>.md` with frontmatter + per-field rows.

### Phase 3 — C4: ECT field-inventory walk

Same as Phase 2 but for ECT Settings tab (Office 1604 → Local Office → ECT Settings).

ECT is baseline-absent per LR-ENC-001 — frontmatter must declare `baselineScope: baseline-absent`. Not a HALT.

Emit `clients/encore/specs_planning/_internal/field-inventories/local-office-ect-<YYYY-MM-DD>.md`.

### Phase 4 — C5: HIS neutral-eye audit

1. Read `local-office-history.spec.ts` (post-W1-03 split).
2. For each test, walk the live app following the test's steps.
3. Observe: does the spec's assertion match what a fresh user would see?
4. Flag any drift between spec assertion and live behavior.
5. Emit `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-history-<YYYY-MM-DD>.md`.

### Phase 5 — C5: ECT neutral-eye audit

Same as Phase 4 but for `local-office-ect.spec.ts`.

Emit `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-ect-<YYYY-MM-DD>.md`.

### Phase 6 — Cross-reference with W2-06

If W2-06's shady-pass verdicts overlap with W2-07's neutral-eye findings (e.g., HIS-7 row from B.5), cross-link the verdict + audit findings in both artifacts.

---

## Per-Identity Satisfaction Matrix (LR-048 v2)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline | refreshed if stale | `ls clients/encore/specs_planning/_internal/old-site-baseline/*history* *ect*` |
| GIVER | test-cases.md | (none) — observation only | n/a |
| BUILDER | specs | (none) — observation only | n/a |
| HEALER | MD update | (none) | n/a |
| WATCHDOG | field-inventories + neutral-eye-audits | 2 inventory MDs + 2 audit MDs | `ls _internal/field-inventories/local-office-*-<date>.md` returns 2 + `ls _internal/neutral-eye-audits/local-office-*-<date>.md` returns 2 |
| GARDENER | refactor | (none) | n/a |

All non-(none) cells classified (a) MCP-proven per LR-040.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For every adjacent fix noticed during walks: DO-NOW / SPAWN / APPEND.

---

## Acceptance criteria

- [ ] HIS field-inventory MD emitted with frontmatter + every field row
- [ ] ECT field-inventory MD emitted (with `baselineScope: baseline-absent`)
- [ ] HIS neutral-eye audit MD emitted
- [ ] ECT neutral-eye audit MD emitted
- [ ] LR-036 boolean render format verified per table (HIS = Unicode; LOS HIS = SVG; recorded in inventory)
- [ ] Any drift discovered in audits cross-linked to W2-06 verdicts
- [ ] `/regression-guard` diff: 4 new MDs, zero source edits
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes
- [ ] `/final-q` verdict block emitted

---

## Verification

```bash
# 4 new MDs present
ls clients/encore/specs_planning/_internal/field-inventories/local-office-history-*.md  # expect: 1
ls clients/encore/specs_planning/_internal/field-inventories/local-office-ect-*.md  # expect: 1
ls clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-history-*.md  # expect: 1
ls clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-ect-*.md  # expect: 1

# No source edits
git diff --stat clients/encore/specs/ clients/encore/src/  # expect: empty
```

---

## Wave 2 read-only parallelization constraint

W2-06 and W2-07 can run in parallel ONLY IF strictly read-only. If either needs to save/edit in the app, run sequentially.

---

## Handoff (post-execution)

HIS + ECT field-inventories + neutral-eye-audits published. W2-08 inherits any new shady-pass findings discovered during the walks (cross-linked to W2-06 verdicts).
