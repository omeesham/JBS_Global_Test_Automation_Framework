---
name: End-day skill — simplify to phase-level, don't enumerate internal work
description: When using /end-day skill, aggregate today's work into phase-level themes (audit, fix, execute). Don't list internal modules/sub-tasks. Match yesterday's granularity.
type: feedback
originSessionId: 20553684-0faf-4369-a208-414c24756127
---
**Rule**: When composing end-day status, pick the HIGHEST-level noun that captures the work. Group by phase of work (audit / fix / execute / review), not by internal module list or technical sub-activities.

**Why**: Client cares about WHAT WAS DONE on WHICH FEATURE, not the laundry list of how. On 2026-04-15 I enumerated "Local Information, Currency, Pricing modules" + "automating daily planning updates + validation checks" when Rutvik's actual framing was "audited subplans 1-4, fixed things we found, executed subplans 6-7". Three phases — not three module lists.

**How to apply**:
1. BEFORE composing lines, ask: "what's the ONE-SENTENCE summary of today by phase?" Not "here are 5 things I did"
2. Group by work phase (audit, fix, execute, review, plan, improve) — not by individual module
3. Name the FEATURE/MODULE at its highest level ("History module") — don't drill into sub-modules unless the sub-module IS the deliverable
4. Drop internal scaffolding (validation checks, automation, infrastructure) unless it's a named client-visible artifact like "Allure 2.x→3.x" or "CSV bug report"
5. Match yesterday's granularity — if yesterday said "History tracking module", today says "History module", NOT "Local Information, Currency, Pricing History integration"

**Specificity refinement** (updating feedback_endday_specificity.md):
- Specific = GOOD for named client-visible artifacts: "Allure reporting 2.x→3.x", "CSV report for Jira", "missing test ID coverage report"
- Specific = BAD for enumerating internal modules/sub-activities: "Local Information, Currency, Pricing modules", "validation checks and automation"

**Test**: Before outputting, re-read yesterday's lines. If today's lines have MORE technical detail than yesterday's → simplify. Client's trust comes from consistency of granularity.
