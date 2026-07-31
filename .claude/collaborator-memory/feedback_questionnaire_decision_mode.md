---
name: Questionnaire Skill Needs Decision Mode
description: When reviewing plans or scoping work, questionnaire should present items with pros/cons and ask permission before deciding — not just yes/no steering.
type: feedback
---

When a "vision questionnaire" scenario occurs (plan review, scope decisions, delivery decisions), the questionnaire skill should switch to **Decision Mode**:
- Present each item with pros/cons table
- Group items by impact (REQUIRED / DECIDE / SKIP)
- Maintain a running decision tracker
- Ask permission before making scope decisions
- Support "batch audit" where many items need individual steering

**Why:** The client delivery plan review (2026-03-25) showed that simple yes/no questions miss the nuance. Rutvik wants to see tradeoffs and make informed decisions, not rubber-stamp the agent's choices. "understand the need!" — the agent must present options, not just recommend.

**How to apply:** Auto-detect when reviewing a plan, scoping work, or making vision decisions (triggers: "audit against", "is it required", "each item", "pros and cons"). Switch from yes/no to options-with-tradeoffs format. Always ask before deciding scope items.
