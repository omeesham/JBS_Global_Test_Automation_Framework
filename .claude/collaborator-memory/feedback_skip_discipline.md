---
name: SKIP Discipline & Bug Investigation
description: Never lazily SKIP tests — exhaust all investigation, test error conditions, file bugs. Agents must investigate with MCP, not theorize.
type: feedback
---

Three rules graduated from Copilot session audit 2026-04-10 (LR-030, LR-031, LR-032):

1. **Requirement contradiction = investigate as bug** (LR-030): When MCP DOM contradicts REQUIREMENTS.md, STOP and investigate. Find original requirement source. Never silently update docs to match DOM — that destroys evidence. ALL-024 says "stop and report" but was being half-applied (DOM wins, no report).

2. **SKIP requires exhaustive investigation** (LR-031): Before marking ANY TC as SKIP — verify you tested the ERROR condition (not just read the valid state). If plan says "when value = X", change to X first. Missing DOM change = evidence of BUG, not "untestable." A TC skipped without trying the error condition = audit finding.

3. **Investigate, don't theorize** (LR-032): When MCP browser is open, TEST hypotheses live. Don't write "Steps to Replicate" for the user. Use network interception for RCA. 30s of testing > 30 lines of theory.

**Why:** Copilot session missed BUG-LI-001 (Oracle required + Save silent no-op) because it lazily SKIP'd TC-078/079 without testing error conditions. Rutvik had to discover the bug manually. ALL-030 (rubber-stamp audit) was a REPEAT OFFENSE.

**How to apply:** Every time a TC is marked SKIP or a requirement contradiction is found — these rules trigger. Check CLAUDE.md LR-030/031/032 for full trigger conditions.
