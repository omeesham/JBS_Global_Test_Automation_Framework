# Audit evidence — 2026-08-05 council audit (preserved copy)

These are the evidence artifacts behind every `# AUDIT FINDINGS TO DISPOSITION` section and `DECIDE:`
block wired into the tri-plan unit on 2026-08-05:

- `plans/pending/PLAN_REPO_SLOP_SWEEP.md`
- `plans/pending/PLAN_ULTRAAUDIT_FIX_WAVE.md`
- `plans/pending/PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md`

**Why this copy exists**: the audit ran from `C:\Users\rutvi\aud\`, a scratch workspace explicitly
scheduled for teardown ("anything u do for this audit is just for this audit and doesnt survive").
The plans, however, cite this evidence — so it was copied here (cp -p, sha256-verified 9/9 identical,
2026-08-05) BEFORE teardown. Evidence must outlive the run and the workspace.

| file | what it is |
|---|---|
| `AUDIT-REPORT-V2.md` | The full two-round audit report (2026-07-27 → 2026-08-05 window, 4 quadrants) |
| `PROGRESS.md` | The dispatch ledger — every lot, seat, run-id, verdict |
| `reaudit2.mjs` | The re-runnable D23 instrument (6/6 real + 0/6 self-test at close; pinned to HEAD `ca99f77c` — the pin is historical, re-pin before re-running) |
| `SWEEP-STATE-FINDINGS.md` | Council state-measure of PLAN_REPO_SLOP_SWEEP — 40 items, ~33% done (its P3 is VOID — dispatcher planted a false known-positive; see report §8) |
| `FIXWAVE-STATE-FINDINGS.md` | Council state-measure of PLAN_ULTRAAUDIT_FIX_WAVE — 17 items, ~20–25% done |
| `COPILOTUA-STATE-FINDINGS.md` | Council state-measure of PLAN_COPILOT_INTEGRATION_ULTRAAUDIT — 57 items, 60–65% done |
| `DENOM-REDERIVE-FINDINGS.md` | Blind re-derivation of the 156,018-file four-quadrant denominator |
| `CLASSIFY-HOLE-FINDINGS.md` | The classifier-hole lot — the 12-file dead cluster, 0.8% false-normal rate |
| `NEVER-ENUMERATED-FINDINGS.md` | Group verdicts over the 154,515 never-enumerated files — 147,164 bulk-dismissed with named reasons, 7,326 needing human decisions |

Do not edit these — they are the frozen record the DECIDE blocks were written against.
