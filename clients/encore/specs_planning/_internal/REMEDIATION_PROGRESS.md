# Encore Deliverable remediation — Autonomous Execution Progress Tracker

> **Durable loop-state.** Read this FIRST on every wake/compaction-resume to know exactly where to continue.
> Mode: FULL autonomous foreground. Live-app = oracle (fix to match reality + log). Commit locally per phase, NEVER push/ship. One review at the end.
> Plan: `plans/pending/PLAN_ENCORE_DELIVERABLE_REMEDIATION.md` (source scratch: `~/.claude/plans/beforeeach-at-line-491-fluttering-nygaard.md`).
> Anti-stall: keep working, never voluntarily yield mid-phase; arm ScheduleWakeup fallback at each phase boundary; this file + git commits + TodoWrite are the recovery state.

## Phase status

| Phase | Scope | Status |
|---|---|---|
| 1 · P0 breakage | H-1 SSL self-contain, L7 BAS-065/067, L11 DET-018 | EDITS DONE (uncommitted) → **VERIFYING LIVE → COMMIT** |
| 2 · P1 reset-integrity | save-primitive+L3, H-6, H-7, C-4 (done); + M-4, H-10/NEW-6, L8, NEW-4, H-3, NEW-2-verify (open) | 5/11 done (uncommitted) |
| 3 · P2 assertion-strength | H-11/12/13/14/15, NEW-5/9/13, L4/L5/L1, MEM-3/4 | not started |
| 4 · P3 hygiene | 10 sleeps, dead code, README/config, catch-triage | not started |
| 5 · anti-recurrence | 13 flag+block CI gates + LR-019/046 amendment | not started |
| 6 · testid report | non-testid inventory grouped module→widget | not started |

## Uncommitted files at kickoff (2026-07-02)
- base.page.ts (save-primitive H-5/C-1/P-5 + L3/LR-056 network filter)
- corporate-pricing-override.page.ts (H-7 Log.warn on toast-timeout)
- location-notes.page.ts (H-6 waitForAngularStable)
- location-pricing.page.ts (C-4 both-signal-fail throw)
- corporate-pricing-detail.spec.ts (L11 DET-018 — New-Price enables Save, workaround removed)
- local-office-settings.spec.ts (L7 BAS-065 — empty persists, +cleanup restore '1')
- location-shared-setup-locations.spec.ts (H-1 SSL-014/015 self-contained, SSL-001 reset dropped)

## Deviation log → see REMEDIATION_DEVIATIONS.md (feeds /final-q)

## Next action
Run Phase-1 live acceptance (SSL-001/013/014/015 + BAS-065/066/067 + DET-018, workers=1 retries=1). Green → commit Phase 1 → Phase 2 remaining.
