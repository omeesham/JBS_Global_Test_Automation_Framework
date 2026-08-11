# SUBPLAN_GUARDRAIL_RUN_ID_ARTIFACT_PATH

Status: pending
Class: internal run-id / artifact-path references leaking in shipped source comments
Graduating incident: tnc-walk-r3-2026-08-06 at
  clients/encore/src/selectors/terms-conditions/terms-conditions.ts:65
  (removed by NM-3344 Comment A replacement; was never gated by forbidden-patterns.mjs)
Proposed mechanism: /\b[a-z]+-r\d+-\d{4}-\d{2}-\d{2}\b/ targeting the run-id family
Prerequisite: NM-3344 must land first; fail-green re-confirmed on clean shipped tree before
  this pattern is added to SOURCE_COMMENT_JARGON.
Scope: SOURCE_COMMENT_JARGON only.
