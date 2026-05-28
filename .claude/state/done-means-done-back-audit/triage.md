# Phase 0.5 Back-Audit Triage — GATE-RB0 input (2026-05-28)

## 0.5.1 Inventory
14 matrix-bearing plans (see matrix-inventory.txt).

## 0.5.2 Dry-run C6 results (see c6-dryrun-results.txt)
- PASS: 1  → `PLAN_DONE_MEANS_DONE.md` (dogfood — its matrix is already C6-clean: paths/(none)).
- FAIL: 13 → all FCC/PARITY/structural-cure historical plans.

## 0.5.3 Failure-reason classification (evidence: per-plan item-reason scan)
ALL 13 failures are **100% vague-prose** cells:
- vague-prose total: 71 cells across 13 plans
- file-missing (STALE-PATH): 0
- malformed: 0
- true C6 regex/parser bug (valid form wrongly rejected): 0

Confirmed via synthetic tests (fixtures/) — C6 correctly ACCEPTS file-path / (skipped:≥20) / (none)
and only REJECTS vague prose + missing files. PLAN_DONE_MEANS_DONE.md PASS proves valid matrices pass.

## Interpretation — two rates
- **True C6-defect false-positive rate** (cell already valid but C6 wrongly fails, OR stale-moved-path): **0%**.
- **Plan-literal "FALSE-POSITIVE" per 0.5.3** (vague-prose-but-work-was-done on a healthy historical plan): **13/14 = 93%**.

The 93% is NOT a C6 bug — it is BLAST RADIUS: 13 closed/pending healthy plans predate LR-048 v3 and
used vague matrix cells. Under hard-deny, any future EDIT to those 13 would be blocked until cleaned.
C6 is working exactly as designed (it rejects vague prose, which is the user's explicit mandate).

## 0.5.4 Rollout decision (GATE-RB0)
Plan thresholds: ≤10% → hard-deny; 10–25% → announce-only ramp; >25% → HALT + surface to user.
The 93% (plan-literal) exceeds 25% → **surfaced to user** per the plan's GATE-RB0 instruction.
Recommendation: **announce-only** (not HALT) — the >25% trigger's stated cause ("C6 regex wrong / LR-048
v3 over-strict") is FALSE here (true defect rate 0%); the rate is historical blast radius, which is
exactly what announce-only is designed to absorb. Decision recorded below after user input.

## DECISION: announce-only → 5-plan ramp → deny (user-selected 2026-05-28 via AskUserQuestion "Warn-only, then ramp")
- Phase 2.2b lands `c6_mode = "announce"` in `.claude/closure-config.json`.
- New plans still get hard prevention at AUTHORING time (/planning Step 3 vague-prose gate) and at
  CLOSURE time (/final-q v3 matrix-delivery audit floors verdict to YELLOW).
- Existing 13 historical plans get a non-blocking stderr warning on closure edits — NOT blocked.
- Phase 4: after 5 post-landing plan closures with no surprises, flip `c6_mode = "deny"`; record in
  `.claude/state/done-means-done-back-audit/ramp-complete.json`. (Post-closure follow-up obligation.)
