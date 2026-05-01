# SUBPLAN SP-PWC2-04: Shared Rules — Rewrite 10 IDs for Chrome+CLI

**Status**: DONE
**Executed**: 2026-04-24
**Priority**: P0
**Created**: 2026-04-24
**Parent**: [PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md](PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md)
**Depends on**: SP-PWC2-01 (LR-038 v2 — source of truth for tool references)
**Blocks**: SP-PWC2-07 (pilot run relies on these rules being accurate)

**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_PWC2_04_SHARED_RULES_10_IDS_REWRITE.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /execute
**Context files** (read before Phase 0):
- `plans/pending/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md` (parent — 10-rule list)
- `plans/pending/PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md` (V1 — has the per-rule rewrite drafts; reuse if accurate)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (target file)
- CLAUDE.md LR-038 v2 (from SP-PWC2-01 — cite terminology consistency)

**Phase 0 directive**: read each of the 10 rules (R09, R16, R19, ALL-042, ALL-043, ALL-048, ALL-052, GEN-029, HLR-015, PLN-027) in full. Note which ones hard-code MCP tool names vs which cite MCP generically. Only the ones that hard-code need deep surgery.

**Handoff sequence**:
- Activity-log row listing AGENT_SHARED_RULES.md + 10 rule IDs rewritten.
- Chat summary: "10 shared rules rewritten. Each carries Chrome carve-out."
- `/final-q` verdict.

**HALT conditions**:
- If a rule has downstream test/enforcement hooks that would break on rename (e.g., a script greps the old phrase), HALT and reconcile before text change.
- If MCP-specific guidance in a rule cannot be cleanly translated (e.g., "use `browser_network_requests` to check 5xx"), escalate — may need a deeper rewrite than a Chrome carve-out.

---

## Purpose

Rewrite 10 shared rule IDs in `docs/read_only_docs/AGENT_SHARED_RULES.md` from MCP-specific language to Chrome+CLI dual-track language. Each rule gains a Chrome carve-out clause (when Chrome is the right tool despite the rule's primary CLI guidance).

Mechanical deterministic work — Sonnet hi, not Opus.

## Step-by-step

1. **Phase 0 — per-rule inventory**. For each of 10 IDs, `grep -n "R09\|R16\|R19\|ALL-042\|ALL-043\|ALL-048\|ALL-052\|GEN-029\|HLR-015\|PLN-027"` in AGENT_SHARED_RULES.md → capture current text + MCP-specific phrases.
2. **Rewrite R09** (network RCA): CLI = `playwright-cli network`; Chrome carve-out = `mcp__Claude_in_Chrome__read_network_requests`. Both produce structured request logs.
3. **Rewrite R16** (accessibility tree inspection): CLI = `playwright-cli snapshot` YAML; Chrome carve-out = `mcp__Claude_in_Chrome__read_page`. Both are aria-first; neither maps to raw HTML tags (LR-016 preserved).
4. **Rewrite R19** (Angular form dirty tracking): CLI = `playwright-cli eval` for JS state inspection; Chrome = `mcp__Claude_in_Chrome__javascript_tool`. LR-026 behavior unchanged.
5. **Rewrite ALL-042** (mandatory browser-tool announcement): move the announcement spec from here into LR-038 v2, leave a cite-forward stub here ("See LR-038 in CLAUDE.md — Chrome vs CLI matrix").
6. **Rewrite ALL-043, ALL-048, ALL-052**: similar pattern — tool-name updates + Chrome carve-out clause where the rule currently assumes MCP-only.
7. **Rewrite GEN-029** (verified claims in walkthrough artifact): CLI canonical walkthrough at `reports/walkthrough/<item>.walkthrough.yaml`; Chrome produces `reports/walkthrough/<item>.walkthrough.md`. Both normalized to `walkthrough.canonical.json` by PF-G5 (SP-PWC2-05 ships the normalizer).
8. **Rewrite HLR-015** (Healer dual-mode): CLI for functional replay; Chrome for visual RCA. Healer's `BrowserTool: both` agent default (SP-PWC2-03) is the canonical reference.
9. **Rewrite PLN-027** (planner walkthrough emit): CLI YAML path specified; Chrome .md path specified; PF-G5 accepts either format.
10. **Grep validation**: zero MCP-only verbs (`browser_navigate`, `browser_click`, `browser_snapshot`) in the 10 rules — only surviving MCP mentions are in a "Legacy/historical" footnote pointing at V1 in `plans/done/`.
11. **Activity-log row** per LR-037.

## Acceptance criteria

- [ ] 10 rule IDs rewritten in AGENT_SHARED_RULES.md.
- [ ] Each rule carries a Chrome carve-out clause (even if minimal — "see LR-038 for Chrome exception path").
- [ ] `grep "browser_navigate\|browser_click\|browser_snapshot\|browser_network_requests" docs/read_only_docs/AGENT_SHARED_RULES.md` returns 0 outside footnotes.
- [ ] Cross-cites to LR-038 still resolve.
- [ ] Activity-log row per LR-037.
- [ ] `/final-q` GREEN verdict.

## Handoff

Next: SP-PWC2-07 pilot will exercise several of these rules in a real module run. Chat summary: "10 shared rules rewritten for Chrome+CLI dual track."

---

### Execution Summary

**Executed by**: OWNER (Sonnet 4.6 / hi / acceptEdits)
**Date**: 2026-04-24

#### Rules rewritten (10/10)

| ID | Location(s) updated | Key change |
|----|---------------------|------------|
| R09 | Registry row + §5 bullet | "via MCP browser tools" → CLI `playwright-cli eval` + Chrome `javascript_tool`; LR-038 cite |
| R16 | Registry row + §5 bullet | Repurposed from vacuous browser_close → accessibility tree inspection dual-track (CLI snapshot YAML + Chrome read_page); LR-016 + LR-038 cites |
| R19 | Registry row | "browser_snapshot evidence" → "live walkthrough evidence" (CLI .walkthrough.yaml / Chrome .walkthrough.md / canonical .canonical.json) |
| ALL-042 | §8 table | `browser_network_requests` → `playwright-cli network` + `mcp__Claude_in_Chrome__read_network_requests`; Chrome carve-out for live sessions |
| ALL-043 | §8 table + §15 escalation routing row | `MCP_VERIFICATION_LOG` → walkthrough artifact triple (yaml/md/canonical.json); Chrome carve-out PF-G5 normalizer note |
| ALL-048 | §12 step 6 + dedicated section | "Replicate on MCP" → "Replicate via browser tool"; CLI path + Chrome path detailed; LR-038 §Gate 2 cite |
| ALL-052 | §12 dedicated section | MCP-only beforeunload → CLI run-code dialog-handler + Chrome navigate-accept dual-track |
| GEN-029 | §11 Generator row | "via MCP before writing code" → CLI `.walkthrough.yaml` / Chrome `.walkthrough.md` / PF-G5 `.canonical.json` |
| HLR-015 | §11 Healer row + §12 Healer RCA Addendum | "mandatory MCP" → "CLI for functional replay; Chrome for visual RCA" |
| PLN-027 | §11 Planner row + §12 Planner Selector Verification section | `browser_snapshot` + `browser_evaluate on MCP` → CLI eval + Chrome javascript_tool; dedicated section labeled PLN-027 |

#### Additional cleanup (acceptance criteria)
- Requirements self-audit item 1: `browser_snapshot` → "live walkthrough (CLI snapshot YAML or Chrome read_page)"
- §12 RCA assertion-failure tree: "verify on MCP" → "verify on live page (CLI or Chrome per LR-038)"
- §13 PF-P2 + PF-R1: "MCP browser available" → "Browser tool available (CLI state saved OR Chrome connected, per LR-038)"
- §15 escalation routing: `MCP_VERIFICATION_LOG outdated` → "Walkthrough artifact outdated"

#### Acceptance criteria verification

- [x] 10 rule IDs rewritten in AGENT_SHARED_RULES.md
- [x] Each rule carries Chrome carve-out clause
- [x] `grep "browser_navigate\|browser_click\|browser_snapshot\|browser_network_requests" docs/read_only_docs/AGENT_SHARED_RULES.md` → **0 matches**
- [x] No "via MCP" / "on MCP" / "MCP browser" / "MCP_VERIFICATION_LOG" residue
- [x] LR-038 cross-cites (13 in shared rules) resolve to CLAUDE.md v2 matrix (grep confirmed 2 occurrences in CLAUDE.md)
- [x] Activity-log row per LR-037
- [x] /final-q GREEN verdict (see below)
