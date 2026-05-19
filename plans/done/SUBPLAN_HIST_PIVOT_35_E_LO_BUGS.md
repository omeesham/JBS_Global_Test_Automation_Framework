> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LO_HISTORY_COVERAGE Phase 7 closure (LO bug triage)

---

# SUBPLAN SP-E-LO: Bug Filings — Local Office NOT-TRACKED Fields (Batch)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 5 (Bug filing — gated on user approval)
**Status**: FOLDED
**Folded into**: PLAN_LO_HISTORY_COVERAGE Phase 7 closure (LO bug triage)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LO-R (catalog) + SP-C1 + SP-C2 (test evidence)
**Identity**: WATCHDOG or OWNER
**Skills**: `/find-bugs` + `/audit` + `/identity`
**Estimated**: one session

---

## Cause

Batch-file LR-034-compliant bug reports for every MCP-confirmed NOT-TRACKED field and every SAME-PARENT-DUPLICATE column on the Local Office Settings History surface. Keeps user triage scope bounded to one surface at a time.

Folded-in scope from SUBPLAN_HISTORY_08_BUG_REPORTS.md (superseded).

---

## Scope

**Inputs**:
- `clients/encore/specs_planning/catalogs/hist-root-map-local-office.md` — NOT-TRACKED registry + duplicate-header registry
- `reports/bugs/anomalies/{YYYY-MM-DD}/*.json` — SP-C1/C2 emitted anomalies (via SP-F1)
- `reports/bugs/auto-filer-dryrun-*.md` — SP-F2 proposed candidates (if generated)

**Outputs**: `reports/bugs/BUG-LOS-*.json` per LR-034 schema. Expected: 8–15 bugs.

**Skip-test pairing**: For each filed bug, if a corresponding SP-C* TC exists that fails because of the bug, update the TC with `test.skip('bug-blocked: BUG-LOS-{NNN}')` per LR-034 step 6.

---

## KEEP list

- Pre-existing bugs: BUG-LOC-LOS-001 (Room Active save no-op), BUG-HIS-001 (EnableMultidayPricing), BUG-HIS-002 (Merchant). Dedup against these — do NOT refile.
- Catalog files — read, not modified.
- Anomaly JSONs — read, not deleted.

---

## Step-by-Step Execution

1. `/identity WATCHDOG` (or OWNER).
2. **Gate check** — confirm user approval received. If not, STOP. Mark status WAITING in subplan.
3. Read the catalog + anomaly digest.
4. For each NOT-TRACKED entry:
   a. LR-034 step 1: verify requirement source (REQUIREMENTS.md §Local Office Settings History / Functional Requirement .docx).
   b. LR-034 step 2: MCP-confirm the bug on live DOM if not already proved.
   c. LR-034 step 3: dedup against `reports/bugs/BUG-*.json`.
   d. LR-034 step 4: generate ID (`BUG-LOS-{NNN}` or `BUG-LOS-BAS-{NNN}` / `BUG-LOS-ECT-{NNN}` grouping).
   e. LR-034 step 5: write JSON with required fields.
   f. LR-034 step 6: update affected TCs with `test.skip('bug-blocked: ...')`.
   g. LR-034 step 7: report to user.
5. For each SAME-PARENT-DUPLICATE header: same protocol.
6. Compile summary report + append to session notes.
7. Commit: `fix(hist-pivot): SP-E-LO — file N BUG-LOS-* reports for NOT-TRACKED findings`.

---

## Verification

1. Every NOT-TRACKED entry in the catalog has a BUG file OR a documented exemption (e.g., "intentional per requirement §X").
2. Every filed BUG passes LR-034 required-fields validation.
3. TCs blocked by filed bugs carry `bug-blocked` skip marker.
4. Summary reported to user.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | watchdog | done | reports/bugs/BUG-LOS-*.json, clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts | SP-E-LO — filed N bugs for Local Office NOT-TRACKED fields. TCs blocked where applicable. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- LR-030 — if DOM contradicts requirement, investigate source before filing. Don't silently overwrite docs.
- LR-031 — exhaustive investigation before SKIP; this subplan's SKIP markers are bug-blocked and require filed BUG IDs.
- LR-032 — MCP-verify, don't theorize.
- LR-033 — network RCA checklist when "save does nothing" suspected.

---

## Dependencies

- SP-B-LO-R catalog complete.
- SP-C1 + SP-C2 test runs complete (anomaly evidence gathered).
- SP-F1 + SP-F2 complete (anomaly pipeline + digest available).
- User approval (GATE).
