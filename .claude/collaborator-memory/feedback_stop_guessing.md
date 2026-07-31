---
name: Stop guessing after 2 failures — switch to evidence-based RCA
description: After 2 failed attempts at the same fix category, STOP trying variations. Do root-cause analysis with evidence before attempt #3. Embedded in /execute Phase 2 item #3.
type: feedback
---

After 2 failed attempts at the same category of fix, STOP. You're guessing, not fixing.

**Why:** SSL session 2026-04-07 — iterated through 5 location numbers (1099→0001→990001→7777→990002) because root cause (permanent ghost pattern) wasn't investigated after attempt #2. Same pattern repeated in planning: 4 plan rounds because root cause (didn't read actual files) wasn't investigated after round #2.

**How to apply:**
- Embedded in /execute Phase 2 item #3 (extended clause). Will be read every time Phase 2 executes.
- Pattern: try X → fail → try Y → fail → STOP → write what you know → hypothesize root cause → verify with evidence → THEN try a fix that addresses root cause.
- Applies to code fixes, planning iterations, debugging, test data selection — any iterative problem-solving.
- The signal that you're guessing: each attempt changes a DIFFERENT variable without understanding WHY the previous one failed.
