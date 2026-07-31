---
name: Consult walk/field-inventory/test-case artifacts BEFORE asking clarifying questions
description: When the user provides a handoff naming surfaces other agents have explored, read `walk-evidence-*`, `field-inventories/*`, `neutral-eye-audits/*`, and `test-cases/*` for those surfaces FIRST before posing clarification questions
type: feedback
originSessionId: 086c4de6-eb2c-490d-9528-47200e7f65d1
---
Before asking the user a clarification question during plan-mode or pre-execution, check whether prior agents have already answered it in:

- `clients/${ACTIVE_CLIENT}/specs_planning/_internal/walk-evidence-*.md`
- `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/*.md`
- `clients/${ACTIVE_CLIENT}/specs_planning/_internal/old-site-baseline/*.md`
- `clients/${ACTIVE_CLIENT}/specs_planning/_internal/neutral-eye-audits/*.md`
- `clients/${ACTIVE_CLIENT}/specs_planning/test-cases/**/*.md`
- `.claude/context/navigation.md` §C Exploration Registry

**Why:** the framework's institutional memory is dense. Multiple agents have likely walked the surface the user is now handing off. Asking the user "is X a top-level tab or a sub-tab?" when a TC file explicitly shows "Verify Basic Information tab selected → Click Local Information tab" is wasted user time. User correction (verbatim, 2026-05-14, handoff-3 plan-mode session): *"this is not the first time you are walking something, this knowledge MUST and SHOULD have been stored somewhere else by other agents, why are you asking me instead of referring to other agents who ALREADY explored all these things MULTIPLE times already?"*

**How to apply:**
- In Plan mode (especially during `/questionnaire` candidate-question drafting), grep the four directories above for every named surface in the handoff before drafting a question that depends on the surface's structure.
- Permitted clarifications: business-priority calls, design choices not derivable from artifacts (e.g., "single session vs split"), policy questions (e.g., "browser tool preference"). These are HIGH-IMPACT STEERING, the kind already vetted by `feedback_question_quality.md`.
- Forbidden clarifications: structural questions a TC file, field-inventory artifact, or navigation.md §C registry can answer. Read the artifact, state your conclusion in plan body, and proceed.
- If artifacts conflict or are silent on the exact question, *cite the artifact*, state the gap, then ask. "TC-LOC-LI-001 line 74 shows BasicInfo selected then Local Information clicked as a separate step — am I right to treat them as container + default sub-tab?" beats "Are BasicInfo and Local-Info the same?".

**Connects to:** `feedback_self_first_research.md` (introspect → repo → web → user); `feedback_no_token_burn_on_rediscovery.md` (runbooks for solved workflows); `feedback_walk_evidence_artifacts.md` (walk-evidence is the canonical record); `feedback_question_quality.md` + `feedback_question_style.md` (only HIGH-IMPACT STEERING questions reach the user).
