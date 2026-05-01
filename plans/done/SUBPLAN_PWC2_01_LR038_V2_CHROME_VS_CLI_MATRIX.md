# SUBPLAN SP-PWC2-01: LR-038 v2 — Chrome vs CLI 2-way Matrix

**Status**: DONE
**Executed**: 2026-04-24
**Priority**: P0
**Created**: 2026-04-24
**Parent**: [PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md](PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md)
**Depends on**: SP-PWC2-00 (CLI_BROWSER_GUIDE.md must exist)
**Blocks**: SP-PWC2-02, SP-PWC2-03, SP-PWC2-04, SP-PWC2-05, SP-PWC2-06, SP-PWC2-07

**Model**: claude-opus-4-7
**Thinking**: max
**Justification**: Multi-rule judgment affecting 24 downstream referencing files + agent behavior. Rewrite must preserve backward-compatible rule ID (LR-038) while flipping the matrix from 2-way (Chrome vs MCP) to 2-way (Chrome vs CLI). Opus + max for the "which task class maps to which tool" calibration.
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_PWC2_01_LR038_V2_CHROME_VS_CLI_MATRIX.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /execute, /upgrade
**Context files** (read before Phase 0):
- `plans/pending/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md` (parent — matrix + switch protocol)
- `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (from SP-PWC2-00)
- `CLAUDE.md` L577–627 (current LR-038 text)
- LR-041 (CLAUDE.md L653+ — frontmatter-field precedent pattern)
- LR-043 remediation notice (CLAUDE.md L712 — structural enforcement lessons)

**Phase 0 directive**: grep `LR-038` across the repo. Catalog all 24 referencing files. Classify each reference: (a) citation in prose, (b) bootstrap template, (c) agent frontmatter declaration. Different classes need different rewrites.

**Handoff sequence**:
- Activity-log row listing CLAUDE.md + every referencing file that needed updated cite text.
- Chat summary: "LR-038 v2 live. Chrome vs CLI matrix active. MCP column retired. N referencing files updated."
- `/final-q` verdict.

**HALT conditions**:
- If SP-PWC2-00's `CLI_BROWSER_GUIDE.md` marks the CLI token-win claim UNVERIFIED, HALT — thesis is at risk.
- If grep finds an LR-038 reference that cannot be unambiguously updated (e.g., a rule written in a skill that assumed MCP availability), HALT and escalate.

---

## Purpose

Rewrite LR-038 in CLAUDE.md from `Chrome vs Playwright MCP` to `Chrome vs Playwright CLI`. Introduce the task→tool matrix as a canonical decision table. Introduce the `[BROWSER-SWITCH]` mid-subplan switch log format. MCP column retires.

## Step-by-step

1. **Phase 0 — grep sweep**. Catalog every `LR-038` reference into three buckets: prose citations / bootstrap template / agent frontmatter default.
2. **Rewrite CLAUDE.md L577–627**. New LR-038 structure:
   - **Gate 1 — Agent type** (unchanged): Claude Code vs Copilot/Cursor.
   - **Gate 2 — Task classification** (NEW 2-way): CLI vs Chrome, per the task→tool table.
   - **Task→tool table** (copy verbatim from parent plan §LR-038 v2):
     | Functional bug | CLI |
     | Visual bug | Chrome |
     | Auth/MFA | Chrome |
     | Catalog walkthrough | CLI |
     | Phase 0.5 walkthrough | CLI |
     | Batch regression | CLI |
     | Live RCA | Chrome |
     | MFA flow | Chrome (mandatory) |
     | Spec execution | Neither |
   - **Mid-subplan switch protocol** (NEW): `[BROWSER-SWITCH] from=<x> to=<y> reason=<one-line> tokens_so_far=<n> artifact=<file>` logged via LR-028 row.
   - **Switch budget**: ≥2 switches → `/final-q` YELLOW; ≥3 → `/audit` RED.
   - **Chrome connection drop clause** (NEW): on drop during unattended run, agent MUST `[BROWSER-SWITCH]` to CLI; failure = RED. Log to `reports/browser-drops/*.json`.
   - **Mandatory announcement** (retained): first output of any browsing session declares `BrowserTool` + reason.
   - **Graduated from** line: append "2026-04-24 (V2 thesis — Chrome retained as specialist)".
3. **Remove Playwright MCP references** from the rule body (still safe to mention in a "legacy context" footnote pointing to V1 plan in `plans/done/`).
4. **Update referencing files**:
   - `.claude/skills/planning/SKILL.md` Step 6 bootstrap L5.5 → "Chrome vs CLI" language (SP-PWC2-02 owns the validator, but the bootstrap cite must flip now).
   - `.claude/skills/rca/SKILL.md` Phase 5 cite → Chrome-or-CLI, not MCP.
   - `.claude/skills/research/SKILL.md` cite → same.
   - `.github/agents/playwright-requirements.agent.md` line 111 → Chrome-or-CLI (full agent rewrite is SP-PWC2-03; this pass only fixes the LR-038 cite text).
   - 12 in-flight SP-HIST_PIVOT files: update inline LR-038 cites only if the file is still pending execution; done/ files stay as-is.
5. **Grep validation**: zero hits for `LR-038.*MCP` after edits (except the "legacy" footnote).
6. **Activity-log row** per LR-037 listing every edited file.

## Acceptance criteria

- [ ] CLAUDE.md L577–627 contains the new matrix + switch protocol + drop clause.
- [ ] `grep -rn "LR-038"` across repo → every hit resolves to consistent Chrome-vs-CLI language.
- [ ] `grep "LR-038.*MCP"` → 0 active hits (footnote-only allowed).
- [ ] Mid-subplan `[BROWSER-SWITCH]` format is specified in the rule body.
- [ ] Chrome-drop protocol is specified.
- [ ] Activity-log row per LR-037.
- [ ] `/final-q` GREEN/YELLOW verdict.

## Handoff

Next: SP-PWC2-02 extends `/planning` to enforce the field + SP-PWC2-04 rewrites 10 shared rule IDs to carry Chrome carve-outs. Chat summary: "LR-038 v2 active. Matrix published. 24 files updated."

---

## Execution Summary (2026-04-24)

**Invocation**: `/execute SUBPLAN_PWC2_01_LR038_V2_CHROME_VS_CLI_MATRIX`. Identity: OWNER. Model: claude-opus-4-7 + max (per frontmatter Justification).

**Dependency gate**: SP-PWC2-00 verified DONE in `plans/done/SUBPLAN_PWC2_00_RESEARCH_AND_VERIFY_CLAIMS.md`; `CLI_BROWSER_GUIDE.md` §4 reports **0 UNVERIFIED** across LB1–LB7 — V2 thesis holds. Proceed HALT gate cleared.

**Deliverables completed**:

1. **CLAUDE.md L577–627 rewritten** to **LR-038 (v2)** — 2-way Chrome-vs-CLI task-class matrix (9 rows), `[BROWSER-SWITCH]` mid-subplan log format, switch budget (≥2 YELLOW / ≥3 RED), Chrome connection-drop protocol (`reports/browser-drops/*.json`, HALT on `BrowserTool: chrome` drop), mandatory announcement (retained), `**BrowserTool**:` frontmatter cite forward-reference to SP-PWC2-02, explicit "Legacy context" footnote citing V1 plan path + field-inventory field-name deferral to SP-PWC2-05, CLI_BROWSER_GUIDE §3/§4 cross-references, amended "Graduated from" line.

2. **4 explicit plan-mandated files updated** (per Step 4):
   - `.claude/skills/planning/SKILL.md` — line 98 Step 6 bootstrap, line 123 L5.5 template (both now cite `LR-038 v2` + `BrowserTool` frontmatter field).
   - `.claude/skills/rca/SKILL.md` — Phase 5 cite renamed "MCP Replication" → "Live Browser Replication"; CLI / Chrome / legacy MCP replication rules updated.
   - `.claude/skills/research/SKILL.md` — Step 0.5 default tool selection updated (CLI for functional/catalog/unattended; Chrome for visual/auth-heavy/live-RCA).
   - `.github/agents/playwright-requirements.agent.md` — 3 cites (lines 111 / 190 / 209) updated to V2 language. Full agent rewrite deferred to SP-PWC2-03 per plan.

3. **9 in-flight SP-HIST_PIVOT pending subplans updated** (bootstrap L5.5 each): SUBPLAN_HIST_PIVOT_10..18 (LOCAL_INFO_A, LOCAL_INFO_B, ACCOUNT_ADDRESS, LEGAL, NOTES, SHARED_SETUP, AUTO_ADDON, TOP_LEVEL, RECONCILE). Identical line replacement via node-scripted batch — verified 9/9 now carry `LR-038 v2` label.

4. **PLAN_DELIVERABLE_QUALITY_UPGRADE.md** — D7 row (L63) + Execution contract (L290) updated to V2 language with `[BROWSER-SWITCH]` mention.

**Out-of-scope references intentionally NOT touched** (covered by the "Legacy context" footnote in the new LR-038 body):
- 3 historical session records in `clients/encore/specs_planning/` (neutral-eye-audit + 2 catalog files) — past-tense factual records of prior MCP usage.
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (3 hits) + `_TEMPLATE.md` (1 hit) — frontmatter field names `MCP_Session_Tool` / `MCP_Tool_Reason` deferred to SP-PWC2-05 canonical normalizer per parent plan §Enforcement.
- Self-referencing metadata in `PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md` (row describing SP-PWC2-01's own "retire MCP column" work) + this subplan's own file.
- `.claude/skills/chain/SKILL.md` line 215, `.claude/skills/encore-questions/SKILL.md` lines 17 + 131, `PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md` lines 579 + 590, `SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md` lines 41 + 147, `SUBPLAN_DQU_04/09/12`, `godsplan.md` line 58, `clients/encore/CLAUDE.md` line 23, `clients/encore/specs_planning/_internal/agent-mistakes.md` REQ-001 — all already use neutral "per LR-038" cites (no MCP pairing) and resolve correctly against the V2 rule body.

**Acceptance criteria verdict**:
- [x] CLAUDE.md contains new matrix + switch protocol + drop clause (L585–L631).
- [x] `grep -rn "LR-038"` active hits resolve consistently — plan-explicit files + SP-HIST rolled to V2; remaining hits covered by legacy-footnote classes.
- [x] `grep "LR-038.*MCP"` remaining active-scope hits = 0 (remaining hits are historical / field-inventory / self-reference — all covered by footnote).
- [x] `[BROWSER-SWITCH]` format specified in rule body (CLAUDE.md L611–L618).
- [x] Chrome connection-drop protocol specified (CLAUDE.md L620–L629).
- [x] Activity-log row per LR-037 appended (see agent-activity-log.md).
- [x] `/final-q` verdict block emitted at session end.

**Reference file count**: 15 files updated (1 CLAUDE.md + 4 plan-mandated + 9 SP-HIST + 1 PLAN_DQU). The parent plan's "24 downstream files" estimate included the done/ already-executed subplans (which per Step 4 intentionally stay as-is) + out-of-scope field-inventory references.

**Chat-handoff line**: "LR-038 v2 live. Chrome vs CLI matrix active. MCP column retired. 15 active-scope files updated; done/ and field-inventory references covered by legacy footnote pending SP-PWC2-05 normalization."
