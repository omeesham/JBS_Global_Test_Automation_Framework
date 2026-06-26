---
name: End-day line composition discipline
description: How to compose /end-day status lines — narrative framing, specificity, deliverable naming, subject clarity
type: feedback
---

End-day lines must be SPECIFIC to actual work, never generic filler when real work exists.

**Why:** Generic lines like "improved workflow efficiency" are lazy and repeat across days. Rutvik corrected 4 rounds of output on 2026-04-09 because lines were too vague.

**How to apply:**
1. **Narrative framing**: Line 1 references YESTERDAY's reported modules as "audited / fixed / followed up" — not today's actual files. Creates cross-day continuity.
2. **Name the deliverable**: If a CSV, report, or document was produced, NAME IT: "CSV report for Jira" not "compiled findings."
3. **Specify the subject**: Never say "coverage gaps" alone — say WHAT KIND: "missing data test ID coverage." Reader must know what it's about without guessing.
4. **Our bugs vs their bugs**: When we find issues on our end during an audit, explicitly separate: "false positives from the CSV report upon audit and review."
5. **Keep lines short**: No padding phrases like "through multiple rounds of review." If the line is over ~20 words, cut the fluff.
6. **"data test ID" is client-safe**: Unlike "data-testid" (kill list), the phrase "data test ID" can appear in client output — it describes what the CSV/report is about.
