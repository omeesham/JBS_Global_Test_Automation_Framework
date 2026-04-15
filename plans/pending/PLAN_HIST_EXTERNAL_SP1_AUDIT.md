# PLAN_HIST_EXTERNAL_SP1_AUDIT

**Status**: PENDING
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action CR-2, Findings F-002 + SP1-F4)
**Priority**: P0 (CRITICAL — current SP1 audit is rubber-stamp / ALL-030 repeat offense)
**Created**: 2026-04-15
**Identity**: WATCHDOG (Mode 2 Agent Audit, OPUS/OWNER lens)
**Estimated session**: MEDIUM (60-90 min — 14 patches + spot checks)
**Depends on**: PLAN_HIST_COMMIT_HISTORY_WORK (so you're auditing committed state, not worktree)

---

## Context

`SUBPLAN_HISTORY_01_MCP_DISCOVERY.md` line 145 says: *"Auditor: WATCHDOG (Copilot, /ultrathink /audit)"* — i.e. **the same Copilot session that ran SP1 also "audited" itself**. It found 14 fuckups (SP1 lines 149-164), conveniently RESOLVED all 14 in the same session, and downgraded its own grade from A- to B+.

This is the exact rubber-stamp pattern Rutvik flagged previously (ALL-030 repeat offense, MEMORY.md). Not falsifiable. Not trustable.

We need an **independent** WATCHDOG pass: different session, no investment in the original outcome, spot-check every "RESOLVED" claim against actual file content.

---

## Goal

A second-pair-of-eyes audit of SP1 that:
1. Verifies each of the 14 fuckup "RESOLVED/PATCHED" claims against the cited section in `SP1_MCP_FINDINGS.md`
2. Verifies each "tag added to master plan" claim against `PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md`
3. Adds at least 1 new finding NOT in Copilot's self-audit (per AUD-001: assume errors exist)
4. Produces a verdict: SP1 is genuinely DONE, or needs further work

Output: append `## External Audit (2026-04-XX)` section to `SUBPLAN_HISTORY_01_MCP_DISCOVERY.md`.

---

## Tasks

1. **Load WATCHDOG identity**: `/identity WATCHDOG` (or auto-route via `/audit`)
2. **Read in this order**:
   - `.github/agents/playwright-pipeline-audit.agent.md` (your own rules)
   - `plans/pending/SUBPLAN_HISTORY_01_MCP_DISCOVERY.md` (claims to audit)
   - `plans/pending/SP1_MCP_FINDINGS.md` (the deliverable — full 429 lines)
   - `plans/pending/PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md` (where the 7 tags allegedly were added)
3. **For each of the 14 fuckups (SP1 lines 149-164)**:
   - Read the "Resolution" column claim
   - Open the cited file/section and verify the patch text actually exists
   - Mark each: ✅ VERIFIED-PRESENT / ❌ MISSING / ⚠️ PARTIAL
4. **MCP re-verification (minimum 3 critical claims)**:
   - Open Playwright MCP browser, navigate to Office 1604
   - Re-confirm: 87-col Loc Mgmt history table populated
   - Re-confirm: SVG lucide-check boolean rendering on Local Office (pick ONE row, snapshot)
   - Re-confirm: pagination "X / Y" format (NOT "X of Y")
   - If any re-verification disagrees with SP1 findings → CRITICAL finding
5. **Apply WATCHDOG checklist** (agent file lines 175 "Self/MCP" + AUD-001..016):
   - AUD-001: Find at least 1 NEW finding Copilot missed
   - AUD-008: State your audit window explicitly (2026-04-13 14:42 to 2026-04-15)
   - AUD-011: Audit your own audit at the end
   - AUD-013: Verify MCP truth hierarchy was respected
6. **Update `agent-mistakes.md`** with any genuinely new patterns found (AUD-004, MANDATORY)
7. **Write external audit section**:
   ```markdown
   ## External Audit (2026-04-XX) — by [agent identity]

   **Auditor**: WATCHDOG ([model], session [date])
   **NOT THE SAME SESSION as SP1 execution** — independent verification.

   ### Spot-check results (14 fuckup patches)
   | FU-ID | Claim | Verified? | Evidence |
   |---|---|---|---|

   ### MCP re-verification
   | Claim | Re-verified? | Notes |
   |---|---|---|

   ### NEW findings (not in Copilot's self-audit)
   ...

   ### Final grade: [A/B/C/D/F]
   ```

---

## Verification

- New `## External Audit` section added to SUBPLAN_HISTORY_01 with date ≠ 2026-04-13
- Activity log shows TWO entries for SP1 — `owner: done` (original) + `watchdog: audit` (this one)
- agent-mistakes.md has at least 1 new entry from this audit (or explicit "no new patterns" note)

---

## Acceptance Criteria

- [ ] All 14 fuckup patches verified ✅/❌/⚠️ with evidence
- [ ] At least 3 MCP re-verifications run
- [ ] At least 1 NEW finding logged
- [ ] External audit section written, signed with auditor identity + session date
- [ ] Activity log updated with `watchdog: audit` row
- [ ] Self-audit (L1-L3) completed and logged
