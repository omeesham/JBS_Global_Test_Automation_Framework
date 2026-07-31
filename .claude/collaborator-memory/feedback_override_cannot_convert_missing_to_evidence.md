---
name: override cannot convert missing evidence into evidence
description: Override scope — authorize honest classification of gathered evidence; never launder missing artifacts, phantom handoffs, or unmet strict lines.
type: feedback
originSessionId: 032b5623-3230-4901-a762-30fc92436d4b
---
An override (closure-override, plan-override, audit-override, identity-override, BrowserTool-override, BUG-verification override, any future override) **CANNOT convert missing evidence into evidence**.

**Why:** Overrides exist as an escape hatch for legitimate edge cases the framework's general rules cannot anticipate — e.g., a Playwright `test.fixme(true,...)` skip is a real structural limitation (the test literally cannot execute its assertion), not laziness. Overrides are NOT a tool for laundering laziness, missing artifacts, phantom handoffs, or unmet strict-line contracts. The principle: if the override lets the agent skip *producing* evidence, the override is forbidden. If the override only authorizes a specific honest *classification* of evidence that was actually gathered, the override is fine.

**How to apply** — at every override-design decision (validator gates, audit-skill verdicts, identity-switch handshakes, BrowserTool justifications, BUG-* verification log overrides, future override surfaces):

- **C1-class forbidden-token scans** (`BLOCKED-BY-FIXME-DESIGN`, `PROBABLE-FAIL-*`, `surface-exists: divergent` used as honest classification tokens): OVERRIDABLE per-token per-plan with a structural reason. The token must reflect a real limitation observed at walk time, not a placeholder for work the agent didn't do.
- **C2-class skeleton checks** (`Execution Summary`, `Executed: YYYY-MM-DD`, body-length minimum, ≥1 cited artifact inside summary): NOT overridable. The content exists or it doesn't.
- **C3-class artifact-existence checks** (cited PNG / trace / screenshot path on disk OR in manifest with hash match): NOT overridable. Cited evidence must be real evidence — citing an artifact that doesn't exist is fabrication, not classification.
- **C4-class phantom-handoff / circular-handoff** (recipient grep + recipient-Status non-DONE): NOT overridable. "Deferred to SP-D" must actually grep-match in SP-D; A↔B both DONE is mutual exoneration — both forms are evidence-laundering.
- **C5-class strict-line-vs-deviation axis-match** (LR-046): NOT overridable. The plan author wrote `every`, `zero`, `all N`, `100%` — that contract is the contract. Overriding it post-hoc converts a violation into a closure.
- **BUG-* verification log reclassifications** (LR-044): overridable per RCA-category (`ISOLATION`/`HALLUCINATION`/`MISREAD`/`STALE`/`ENVIRONMENTAL`/`ROLE-OR-OFFICE-DEPENDENT`), but ONLY when the verifier actually re-ran the steps and observed the new evidence. Skipping the re-run and claiming a reclassification = forbidden.
- **Identity-switch and BrowserTool overrides**: authorize a known structural exception (e.g., OWNER editing a pipeline path), never authorize skipping an artifact (e.g., the walk-evidence file).

**Test question for any override request:** "Does this override let the agent skip *producing* evidence?" — if YES, forbidden. "Does it only authorize a specific honest *classification* of evidence already gathered?" — if YES, fine.

**Test question when designing an override surface:** "Could a lazy agent use this to claim work that wasn't done?" — if YES, narrow the scope until the answer is NO.

**Graduated from:** 2026-05-18 user correction during PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT design. Initial draft proposed broad override scope spanning C1–C5; user interrupted with the principle verbatim ("override cannot convert missing evidence into evidence"). Revised design restricts override to C1-only and adds explicit "NOT OVERRIDABLE" annotations on C2/C3/C4/C5 deny messages so future agents cannot rationalize a broader override path.
