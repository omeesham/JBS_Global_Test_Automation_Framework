---
name: Walk-evidence artifact discipline
description: When DOM walking for coverage gaps, save dated proof artifacts so auditors can verify what was actually walked
type: feedback
originSessionId: b16ea8eb-83ac-4762-a12a-c166231d8ef5
---
Every DOM walk session that probes app behavior for test coverage must produce a dated walk-evidence artifact at `clients/${ACTIVE_CLIENT}/specs_planning/_internal/walk-evidence-<module>-<YYYY-MM-DD>.md`.

**Why:** Auditor flagged that a walk was claimed but no proof existed. Compacted conversation summaries lose walk details, making it impossible to verify who's right. The artifact is the only durable record.

**How to apply:** During any `/execute` that includes a walk gate or DOM probe phase, create the artifact with: (1) probe ID + action + result per row, (2) existing TC coverage mapping, (3) "new uncovered scenarios" section (even if empty), (4) summary table. File naming convention: `walk-evidence-<subtab-or-module>-<YYYY-MM-DD>.md`. First example: `walk-evidence-notes-2026-05-12.md`.
