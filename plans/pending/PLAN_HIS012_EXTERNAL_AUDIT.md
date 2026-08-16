> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_HIS012_EXTERNAL_AUDIT.md`. All context below.**
>
> 1. **Identity**: load `/identity WATCHDOG` before any phase. All phases run under WATCHDOG identity.
> 2. **Skills**: `/execute` → `/audit` (all phases), `/rca` if a proof demo fails unexpectedly.
> 3. **Model + thinking + permission-mode**: read the frontmatter fields below.
> 4. **Dependency gate**: PLAN_71 and PLAN_72 must be in `plans/pending/` (not yet closed) or recently moved
>    to `plans/done/`. If closed, the execution summaries are the primary claims to verify in Phase 5.
> 5. **Context load**: read §1 and §2 in full before any phase. Then read the context pack in §3.
> 6. **Why this file exists (non-negotiable)**: An audit session must never be the session that produced the
>    work. PLAN_71 and PLAN_72 were produced by session `9ecfb8dc-14a9-4608-8c1f-c93847ce176a`. Any
>    continuation of that session is forbidden from executing this plan — that is self-audit (AUD-017).
> 7. **Execute phases in order.** Phase 1 is the gate: if evidence does not run, nothing downstream is
>    meaningful.
> 8. **Do not repair anything.** This plan produces findings and verdicts only. Repairs route to new tickets.
>
> **HALT + ASK RUTVIK** if: the app is unreachable after auth refresh / any proof demo crashes with an
> infrastructure error rather than a clean pass/fail / Phase 3 finds finding 8 is marked as both "known gap"
> and "fixed" in the same artifact (contradictory state requires Rutvik to decide).

---

# PLAN HIS012 EXTERNAL AUDIT: Independent verification of PLAN_71 and PLAN_72

**Status**: Pending
**Priority**: High
**Created**: 2026-08-16
**Parent**: none
**Identity**: WATCHDOG (all phases)
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**CoverageMode**: quick

---

## §0 Delegation Contract (binding — Rutvik, 2026-08-16)

**Council at all four stages: planning, execution, review, iteration.** No agent may remove, narrow, or
override this section — including a future session of Claude. Only Rutvik changes it, in chat.

- **Planning**: the design is Claude-authored; the plan document is council-drafted and adversarially reviewed by a different family before execution.
- **Execution**: every phase is delegated. Claude writes tickets, reads verdicts, judges. Claude does not write product code.
- **Review**: output is reviewed by a different family than produced it, and the reviewer's findings go back to the author to defend before reaching Claude. A review that arrives undefended goes back.
- **Iteration**: defects bounce to the originating seat. Claude self-fixes only after a bounce fails, and logs it as a routing failure.

Evidence rules at every stage: machine facts over prose · a claim needs something re-runnable · denominators are machine-derived · a worklist's paths are claims until re-resolved · no silent caps · disproving a finding is a win.

---

## §1 Why this plan exists

PLAN_71 and PLAN_72 were produced by session `9ecfb8dc-14a9-4608-8c1f-c93847ce176a`. Standing rule
(**AUD-017 / audit SKILL.md no-self-audit clause**): the session that produced work may not audit it.
The rule is not a preference — a self-audit is structurally compromised regardless of the reviewer's
intent. This file is the instrument that makes the rule operational: it defines what a fresh, uninvolved
session must check, written by the producing session specifically to expose its own potential mistakes.

**Claims under audit:**

- **PLAN_71** — The Service Charge History grid sorts through a per-header dropdown (four headers, all
  with sort affordances). A shipped test (`TC-SVC-HIS-012`) was proven tautological: it passed whether
  or not the sort affordance existed. The test was rewritten, passed 3/3 runs, and supporting artifacts
  were corrected.
- **PLAN_72** — Eight tests were shown to pass while accepting wrong values, proven by two independent
  providers with runnable demos. Seven were repaired. The eighth (TC-SVC-BAS-025 finding 8) is
  **deliberately left unasserted** and must read as a known gap, not as covered ground.

---

## §2 The audit's standard of proof

This audit does not form opinions about code. It runs things and reports outcomes.

- **A re-run is evidence. A reading is not.**
- **A passing claim requires a fresh run, not a reference to the original session's run.**
- **A gap is a finding only when it is enumerated and shown — not assumed from context.**
- An auditor who cannot reproduce a demo must record that as a finding, not as a pass.

---

## §3 Context pack (read these before starting any phase)

| Artifact | Path | Purpose |
|---|---|---|
| PLAN_71 | `plans/pending/PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST.md` | Primary claims source |
| PLAN_72 | `plans/pending/PLAN_72_FAKE_GREEN_PROVE_AND_FIX.md` | Primary claims source |
| Live walk | `.claude/state/ua-worker/chips/his012-truth/out-WALK/WALK.md` | Basis for 4-header claim |
| Artifact corrections | `.claude/state/ua-worker/chips/his012-truth/out-RECONCILE/RECONCILE.md` | Basis for correction claims |
| Prove-A demo | `.claude/state/ua-worker/chips/fake-greens/out-PROVE-A/prove-fake-greens.mjs` | Provider A proof |
| Prove-B demo | `.claude/state/ua-worker/chips/fake-greens/out-PROVE-B/prove-fake-greens.mjs` | Provider B proof |
| Mutation verify | `.claude/state/ua-worker/chips/fake-greens/out-MUTATE/mutate-verify.mjs` | Fix verification script |
| Mutation report | `.claude/state/ua-worker/chips/fake-greens/out-MUTATE/MUTATE.md` | Session's own repair claims |
| Corrected spec | `clients/encore/tests/service-charge/service-charge-history.spec.ts` | PLAN_71 output |
| Fixed spec | `clients/encore/tests/service-charge/service-charge-basic-information.spec.ts` | PLAN_72 output |

---

## §4 Phases

### Phase 1 — EVIDENCE EXISTS AND RUNS

**Owner**: WATCHDOG seat (cross-family to the session that wrote the demos)
**Dependency**: none — gate for all subsequent phases

The proof and mutation files under `.claude/state/ua-worker/chips/fake-greens/` are the entire evidentiary
foundation of both plans. If they do not run, or their outputs changed from what the session claimed,
every downstream conclusion is unsupported.

**Steps:**

1. Verify the three scripts exist on disk at their declared paths (file listing).
2. Run each independently, tee output:
   ```bash
   node .claude/state/ua-worker/chips/fake-greens/out-PROVE-A/prove-fake-greens.mjs 2>&1 | tee $OUT/phase1-prove-a.txt
   node .claude/state/ua-worker/chips/fake-greens/out-PROVE-B/prove-fake-greens.mjs 2>&1 | tee $OUT/phase1-prove-b.txt
   node .claude/state/ua-worker/chips/fake-greens/out-MUTATE/mutate-verify.mjs 2>&1 | tee $OUT/phase1-mutate.txt
   ```
3. For each script: exit code, output matches the session's claims in PLAN_72 §10.
4. Cross-check: Prove-A and Prove-B agree on FAKE-PROVEN vs NOT-FAKE-PROVEN. Any disagreement between
   them not acknowledged in PLAN_72 is a finding.

**Acceptance criteria:**
- [ ] All three scripts exist on disk (ls output in artifact).
- [ ] All three run to completion without crashing (tee'd artifacts on disk with exit codes).
- [ ] Prove-A and Prove-B both emit `FAKE-PROVEN` for findings 1–8 (or deviation is recorded).
- [ ] Mutation script shows findings 1–7 rejected by the fixed assertion.
- [ ] Any script crash or unexpected output is a **BLOCKING finding**: all subsequent phases suspended.

---

### Phase 2 — CORRECTED TEST PASSES ON A COLD SESSION

**Owner**: WATCHDOG seat with live browser (cli tool; functional-behaviour question per LR-038 v2 Gate 3)
**Dependency**: Phase 1 must complete without blocking findings

The original rewrite passed 3/3 times in the producing session. The first run of PLAN_71 itself failed on
cold state — that failure is why cold-session verification is the meaningful check. A fourth run by a
fresh session, from a cold auth state, is the evidence that matters.

**Steps:**

1. Refresh auth state:
   ```bash
   npx playwright test tests/auth.setup.ts 2>&1 | tee $OUT/phase2-auth.txt
   ```
   Confirm: output shows 1 passed, no MFA or Microsoft sign-in page.
2. Run TC-SVC-HIS-012 twice in isolation:
   ```bash
   npx playwright test --grep "TC-SVC-HIS-012" --project=chromium 2>&1 | tee $OUT/phase2-run1.txt
   npx playwright test --grep "TC-SVC-HIS-012" --project=chromium 2>&1 | tee $OUT/phase2-run2.txt
   ```
3. Read the current oracle in `service-charge-history.spec.ts`. State explicitly: what does the
   rewritten assertion check? Can it pass when the sort affordance is absent (the old failure mode)?

**Acceptance criteria:**
- [ ] Auth refresh completed without MFA or sign-in prompt (tee'd).
- [ ] Both fresh runs pass: `1 passed` in output, exit 0 (tee'd artifacts on disk).
- [ ] The current oracle is described and is confirmed non-tautological — cannot pass if the sort
      affordance is absent or the `.catch(() => null)` swallow pattern returns.
- [ ] Either run failing is a **BLOCKING finding**.

---

### Phase 3 — THE UNASSERTED CASE IS HONESTLY RECORDED

**Owner**: WATCHDOG seat (read-only, no browser)
**Dependency**: none — parallel with Phase 2 permitted

Finding 8 (TC-SVC-BAS-025) was deliberately left unasserted. If the mutation report lists it as fixed,
or the test-case document reads as covered, that is a fresh fake green created by the very work that was
fixing fake greens — a more damaging error than the original eight.

**Steps:**

1. Read finding 8's treatment in three locations:
   - `service-charge-basic-information.spec.ts` — what does the current test assert at the relevant lines?
   - `out-MUTATE/MUTATE.md` — is finding 8 listed in the passing column, the skipped column, or absent?
   - The companion test-case document for TC-SVC-BAS-025.
2. Determine unambiguously: does finding 8 read as a **known gap with a named unlock**, or as covered?
3. Is there a tracking reference (FIXME annotation, Jira ticket, deferred-to note) pointing to a concrete
   destination per LR-040?

**Acceptance criteria:**
- [ ] All three locations are read; their treatment of finding 8 is stated explicitly in the audit report.
- [ ] Finding 8 is recorded as a **known gap** in all three locations — any location reading as "covered" is a **Phase-3 finding**.
- [ ] A concrete destination exists (FIXME with description, or a linked ticket). Missing destination is a **Phase-3 finding**.

---

### Phase 4 — ARTIFACT CORRECTIONS TOLD THE TRUTH

**Owner**: WATCHDOG seat (read-only + one live browser probe for header count)
**Dependency**: none — parallel with Phases 2 and 3 permitted

PLAN_71 claims corrections at nine specific locations across four artifact files. RECONCILE.md is the
session's own account. This phase independently re-checks every named location.

**Steps:**

1. Read RECONCILE.md correction table (file, line range, original text, action taken).
2. Open each named file at each named line range. Confirm:
   - The CORRECTION note is present and appended (original text intact — corrections annotate, never delete).
   - The 2026-08-10 field inventory no longer asserts 2 as the sort-affordance count without correction.
   - The 2026-08-16 field inventory shows 4 sort buttons marked correctly (not `deferred-to-DEEP`).
3. Live re-verify header count: navigate to the History grid via CLI browser, capture and count sort
   affordance buttons. Compare to the claimed 4.

**Acceptance criteria:**
- [ ] All nine correction locations verified present on disk (enumerated list in audit artifact).
- [ ] Original wrong text is intact (annotated, not deleted) at each location.
- [ ] Live header count is 4 (structured capture or tee'd output in artifact).
- [ ] Any missing correction or wrong count is a **Phase-4 finding**.

---

### Phase 5 — CROSS-CHECK CLAIMS AGAINST DISK

**Owner**: WATCHDOG seat (read-only)
**Dependency**: Phase 1 complete; Phases 2–4 may be concurrent

The audited session is the least reliable source about its own completeness. This phase reads the plans'
execution summaries (written at plan-close time) and checks every numbered claim against an artifact.

**Steps:**

1. Read both execution summaries (if written; if not yet written, record that as a status observation and
   return after closure — do not block Phase 1–4).
2. For every numbered claim (TCs implemented, TCs dropped, MCP verification results, cited artifacts):
   - Does the cited file exist?
   - Does it contain the claimed content?
   - Is each claimed test pass backed by a tee'd output file?
3. Build a verdict table: `claim → VERIFIED / UNVERIFIED (no artifact) / CONTRADICTED`.

**Acceptance criteria:**
- [ ] Every claim in both summaries is enumerated in the Phase-5 verdict table.
- [ ] Every claim with an artifact path: file exists, contains claimed content.
- [ ] Every claimed test pass: a tee'd output file on disk (prose claim alone = UNVERIFIED).
- [ ] Any CONTRADICTED row is a **Phase-5 finding**.

---

### Phase 6 — UNDERSIZED-COVERAGE DISPOSITION

**Owner**: WATCHDOG seat (read-only)
**Dependency**: Phase 4 (needs confirmed header count)

PLAN_71 established the sort-affordance count was 2 (wrong) and is 4 (truth). Coverage was sized from
the wrong count of 2. Neither PLAN_71 nor PLAN_72 corrected the coverage sized from it. This phase
decides — not defers — whether that gap is in scope for this audit or gets its own destination.

**Steps:**

1. Check PLAN_71 and PLAN_72 for any explicit handling of the two uncovered sort affordances (headers 3
   and 4). Did either plan file, repair, or explicitly defer them?
2. Check the DEEP subplan for the History grid, if one exists, to see if these are already captured there.
3. Produce one of two outcomes — no middle ground:
   - **Addressed**: cite the artifact.
   - **Unaddressed**: name a concrete destination (e.g., "add to existing DEEP subplan for History grid"
     or "create SUBPLAN_SERVICE_CHARGE_HISTORY_DEEP with these two cases as scope"). Per LR-040, "gap
     with no owner" is not a valid outcome.

**Acceptance criteria:**
- [ ] Coverage gap for sort affordances 3 and 4 is enumerated explicitly.
- [ ] Outcome is either ADDRESSED (with citation) or UNADDRESSED (with named destination).
- [ ] "Unaddressed with no destination" is a **Phase-6 finding** — the audit itself must produce the destination.

---

## §5 Per-Identity Satisfaction

| Identity | Duty | Concrete deliverable |
|---|---|---|
| WATCHDOG | All phases, evidence collection, verdict table | `$OUT/AUDIT-REPORT.md` |
| OWNER | Dispatch, read verdicts, issue findings as new tickets if needed | New plan tickets only if blocking findings |
| HUNTER | — | skipped: no new baseline walk in scope |
| GIVER | — | skipped: no new plan to author |
| BUILDER | — | skipped: repairs are out of scope; this plan does not fix anything |
| HEALER | — | skipped: no failing spec to heal |
| GARDENER | — | skipped: no framework hygiene work in scope |

---

## §6 NOT touched

- `PLAN_71_HISTORY_SORT_TRUTH_AND_TAUTOLOGY_TEST.md` — read only.
- `PLAN_72_FAKE_GREEN_PROVE_AND_FIX.md` — read only.
- `service-charge-history.spec.ts` — read only.
- `service-charge-basic-information.spec.ts` — read only.
- Any proof or mutation script — run only, never edited.
- Any field inventory or walk-evidence artifact — read only.
- Git history — not touched.
- Any file not listed in §3, unless Phase 5 requires reading a cited artifact to verify a claim.

---

## §7 Output artifact path

```bash
OUT=.claude/state/ua-worker/chips/his012-truth/out-AUDITPLAN/audit-run
mkdir -p $OUT
```

All tee files land under `$OUT/`. Final verdict report at `$OUT/AUDIT-REPORT.md`.

---

## §8 Verification artifact (runnable command — not prose)

```bash
set -o pipefail
cd /c/Users/RutvikKhorasiya/projects/encore_framework
OUT=.claude/state/ua-worker/chips/his012-truth/out-AUDITPLAN/audit-run
mkdir -p $OUT

# Phase 1 — proof scripts run
node .claude/state/ua-worker/chips/fake-greens/out-PROVE-A/prove-fake-greens.mjs 2>&1 | tee $OUT/phase1-prove-a.txt; echo "PROVE-A exit: $?" | tee -a $OUT/phase1-prove-a.txt
node .claude/state/ua-worker/chips/fake-greens/out-PROVE-B/prove-fake-greens.mjs 2>&1 | tee $OUT/phase1-prove-b.txt; echo "PROVE-B exit: $?" | tee -a $OUT/phase1-prove-b.txt
node .claude/state/ua-worker/chips/fake-greens/out-MUTATE/mutate-verify.mjs 2>&1 | tee $OUT/phase1-mutate.txt; echo "MUTATE exit: $?" | tee -a $OUT/phase1-mutate.txt

# Phase 2 — cold-session test runs
npx playwright test --grep "TC-SVC-HIS-012" --project=chromium 2>&1 | tee $OUT/phase2-run1.txt; echo "RUN1 exit: $?" | tee -a $OUT/phase2-run1.txt
npx playwright test --grep "TC-SVC-HIS-012" --project=chromium 2>&1 | tee $OUT/phase2-run2.txt; echo "RUN2 exit: $?" | tee -a $OUT/phase2-run2.txt

sha256sum $OUT/*.txt 2>&1 | tee $OUT/PHASE-HASHES.txt
```

Expected outcomes:
- `phase1-prove-a.txt` and `phase1-prove-b.txt`: each finding prints wrong value satisfying pre-fix assertion; exit 0.
- `phase1-mutate.txt`: findings 1–7 show wrong value **rejected** by fixed assertion; finding 8 absent or marked `SKIP-KNOWN-GAP`; exit 0.
- `phase2-run1.txt`, `phase2-run2.txt`: `1 passed` in output, exit 0.

Any deviation from expected outcomes = finding. Findings do not require a pass verdict.

---

## §9 Plan-Deviations log

| # | Deviation | Reason | Disposition |
|---|---|---|---|
| — | none yet | — | — |
