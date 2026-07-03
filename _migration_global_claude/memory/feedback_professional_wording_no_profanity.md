---
name: professional-wording-no-profanity
description: "User wants professional, profanity-free wording in authored repo artifacts (plan names, titles, docs, prose)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6c7d4db2-42ea-4115-9203-4a3cb1ed5753
---

User instruction (2026-06-19): when authoring or renaming repo artifacts, use professional, profanity-free wording — verbatim: "better the wording on it please, no abuse." Given on the PLAN_EXHAUSTIVE_WALK_GUARANTEE Phase 5 scratch-plan migration, where the literal target name carried a crude word. Resolution: rename to `PLAN_PRICING_INCIDENT_PREVENTION.md` (title "Pricing Incident Audit → …"), and the user chose to migrate (not skip).

**Why:** any artifact may be read by colleagues, the AI Council, or clients; "no abuse" = no profanity / crude language. Professional tone is the default for authored output.

**How to apply:** all newly-authored plan names, file names, titles, headings, and prose use clean professional vocabulary (e.g., "incident" / "regression" / "defect" / "failure" — never crude or informal terms). Any pre-existing crude wording in the repo (in `LR-ENC-002`'s pattern text, some plan bodies, and agent-mistakes entries) is cleaned when editing that artifact for another reason, or on an explicit cleanup request. Update (2026-07-03): the user explicitly authorized a full repo-wide sweep of the crude word + variants, which was executed with a permanent recurrence guard — so a sweep is no longer "unrequested". Pairs with [[feedback_endday_strip_agent_framework_language]] (clean-language discipline for reports).
