> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_BROWSER_TOOL_SELECTION.md`. All context below.**
>
> This is a single-shot plan (no subplans — 6 surgical edits). On invocation:
>
> 1. **Identity**: load `/identity` per the Identity field below (OWNER).
> 2. **Skills**: load `/execute` + `/regression-guard` (before + after diff). `/execute` auto-calls `/identity` and `/relevant`.
> 3. **Model + thinking tier**: Opus + think hard (surgical framework-rule authoring; judgment on where LR-038 must embed).
> 4. **Dependency gate**: none. Standalone plan.
> 5. **Context load**: read this plan in full, root `CLAUDE.md` §Learned Rules section (confirm LR-037 is the last rule), and one sample in-flight subplan (`plans/pending/SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md`) so you understand the bootstrap block you are retrofitting.
> 6. **No Phase 0 needed** — scope is fixed (6 files, enumerated). Do NOT expand scope without HALT + ASK.
> 7. **Execute phases** below in order (1 → 6). Verify after each phase with grep.
> 8. **Handoff**: flip the Status field to DONE, add the Executed date, append activity-log row (LR-028 + LR-037 wall-clock), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit.
>
> **HALT + ASK USER** if:
> - You find an existing LR with number 038 already taken (renumber to next free).
> - `/regression-guard` diff shows edits outside the 6 enumerated files.
> - A retrofit target subplan (SP-B-LO-* / SP-B-LM-*) no longer exists in `plans/pending/` (means it already executed — log + skip).
> - You discover a non-Claude agent (Copilot etc.) mid-execution is reading this plan (plan authored for Claude Code — do not self-apply if you are non-Claude).

---

# PLAN — Browser Tool Selection: Claude in Chrome vs Playwright MCP

**Status**: DONE
**Executed**: 2026-04-20
**Priority**: P0 (affects every future browser-interacting session — token + time savings compound)
**Created**: 2026-04-20
**Identity**: OWNER
**Skills**: `/execute`, `/regression-guard`
**Depends on**: none
**Estimated**: one session (~45-60 min, mostly copy-paste-verify)

---

## 1. Context — Why This Plan Exists

### The problem (observed 2026-04-20)
A Claude Code session executing SUBPLAN SP-B-LO-1 (Local Office Basic Info MCP catalog) defaulted to **Playwright MCP** for all browser interaction. It then reported to the user:

> "`browser_snapshot` burned ~4k tokens each, needed one per page mutation for fresh refs. Context budget would hold longer with Claude in Chrome's `read_page`."
>
> "Claude in Chrome inherits your live SSO session instantly. Playwright MCP's profile cache worked today but is fragile — if it expires, autonomous re-auth through Microsoft SSO + TOTP is basically impossible."

The session had to make this decision **reactively**, under user prompting. No framework guidance exists to **pre-select** the correct tool.

### The efficiency gap
For the 14 remaining in-flight SP-B-* MCP catalog sessions (Local Office ×2 + Location Mgmt ×11 + 1 reconcile), defaulting to Playwright MCP instead of Claude in Chrome costs:
- ~4k tokens per `browser_snapshot` × dozens per session × 14 sessions = **tens of thousands of wasted tokens**
- Fragile auth — Microsoft SSO + TOTP re-auth mid-session is essentially blocked for a Playwright MCP agent (autonomous re-auth is infeasible; Claude in Chrome rides the user's live Chrome session).
- Slower iteration — each `browser_snapshot` is heavier than `read_page`.

### Why a framework rule, not ad-hoc guidance
The user's directive:
> "this is not just for current subplans, also for future tasks where agents / claude need to go to website to do whatever like exploration/locators/etc.."

Ad-hoc patches to 14 current subplans do NOT fix the next 100 browser-touching tasks. The decision needs to live at the **framework-rule layer** (root CLAUDE.md) so every skill / agent / subplan inherits it automatically.

### The core asymmetry
- **Claude Code sessions** can call `mcp__Claude_in_Chrome__*` tools. They should prefer Claude in Chrome for the task types below.
- **Non-Claude agents** (Copilot, Cursor, etc.) **cannot** call Claude in Chrome tools. They must use Playwright MCP.

LR-038 encodes this asymmetry as a **two-gate decision matrix** with a **default** (Claude in Chrome for Claude Code) and clear **fallback conditions**.

---

## 2. Goal

After this plan lands:
1. Every Claude Code session involving browser work self-selects the correct tool at session start, **without user prompting**.
2. Every non-Claude agent session routes cleanly to Playwright MCP (unchanged — they don't have the alternative).
3. Future subplans / skills auto-inherit the rule via `/planning` Step 6 template and CLAUDE.md always-loaded rules.
4. In-flight SP-B-* subplans (14 files) get a one-line bootstrap addendum pointing at LR-038.
5. My own future sessions (Claude) have a memory guardrail so I default correctly.

---

## 3. Scope — Enumerated Surgical Edits (6 Files)

| # | File | Edit type | Lines added |
|---|------|-----------|-------------|
| 1 | `CLAUDE.md` (root) | **Append** — new rule `LR-038` after LR-037 | ~55 lines |
| 2 | `.claude/skills/planning/SKILL.md` | **Edit** Step 6 bootstrap template — add 1 line about browser-tool selection | 1 line |
| 3 | `.claude/skills/research/SKILL.md` | **Append** Step 0.5 gate: "If task involves live DOM, consult LR-038" | 6 lines |
| 4 | `.claude/skills/rca/SKILL.md` | **Edit** Phase 5 (MCP Replication) — prepend 1-line LR-038 reference | 2 lines |
| 5 | In-flight subplans SP-B-LO-1/2/R + SP-B-LM-1-9/R (14 files) | **Append** one bootstrap bullet — "When browsing, select browser tool per LR-038" | 1 line × 14 files |
| 6 | `C:\Users\rutvi\.claude\projects\C--Users-rutvi-projects-encore-framework\memory\feedback_browser_tool_selection.md` + `MEMORY.md` pointer | **Create** new memory + index entry | 30 lines new + 1 line in index |

**Total**: 6 functional edits, ~110 lines added, ~14 one-line-addendums to subplans.

---

## 4. NOT Touched — Explicit Exclusions

| Would-be target | Why excluded |
|---|---|
| `.claude/agents/COLLEAGUE.agent.md`, `RUTVIK.agent.md` | Personal identity files. LR-038 is framework-level — lives in CLAUDE.md which is always loaded. |
| `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` | Client-specific rules. Browser tool selection is framework-level, not client-level. |
| Skills that don't drive browser work (`/planning` body, `/cleanup`, `/deploy`, `/audit`, `/bugfix`, `/find-bugs`, etc.) | They inherit via CLAUDE.md. No per-skill duplication — single source of truth in LR-038. |
| Playwright config, test specs, page objects | Zero behavioral changes to test execution. This plan is about **exploratory / MCP-driven** browser interaction, not framework test runs. |
| Subplans with no browser work (SP-A*, SP-D*, SP-E*, SP-F*, SP-G, SP-H, SP-J, SP-K*) | Don't touch browser. No addendum needed. |
| `PLAN_HIST_COLUMN_FIRST_PIVOT.md` master plan | Reference-only. Its subplans carry the retrofit, not the master. |

---

## 5. The LR-038 Rule (Exact Text to Append to root CLAUDE.md)

**Insertion point**: After LR-037 (current line 543), before EOF. Leave one blank line separator.

```markdown

### LR-038: Browser tool selection — Claude in Chrome vs Playwright MCP
When any session needs to interact with a live website (exploration, locator discovery,
MCP verification, bug investigation, catalog work, live DOM reads/clicks/saves), choose
the browser tool **before** first browser call. Announce the choice + reason in the first
output or activity-log row of the session.

**Gate 1 — Agent type**
- **Claude Code (Opus or Sonnet)** → continue to Gate 2. You can call `mcp__Claude_in_Chrome__*`.
- **Copilot / Cursor / other non-Claude AI** → use Playwright MCP. STOP here. You do NOT
  have Claude in Chrome tools. Do not pretend you do.
- **Self-check for Claude Code**: if you can see any `mcp__Claude_in_Chrome__*` tool in
  your tool list, Gate 1 passes.

**Gate 2 — Task classification (Claude Code only)**

Default: **Claude in Chrome** unless Playwright MCP criteria clearly apply.

Use **Claude in Chrome** when any of these apply:
- Exploratory / catalog / locator-discovery work (you are LEARNING the DOM, not running tests)
- Auth-heavy app (Microsoft SSO + TOTP — Claude in Chrome inherits the user's live Chrome session; Playwright MCP's profile cache is fragile, autonomous re-auth is essentially infeasible)
- You need `read_network_requests` to distinguish "client blocked" vs "server rejected" vs "API silently dropped" (per LR-033)
- Context budget is tight (read_page returns compact accessibility summary; browser_snapshot burns ~4k tokens per call and needs a fresh snapshot after every DOM mutation)
- Read-heavy DOM traversal (table extraction via javascript_tool, header enumeration, etc.)
- Live bug investigation — "what happens when I click X on the real app, right now"
- User is at the machine (can intervene if something unexpected happens; you can share the tab via tabs_create_mcp)

Use **Playwright MCP** when any of these apply:
- Long unattended CI-style run (no human nearby to intervene)
- Framework spec execution or anything driven by our `authenticatedSession` fixture — that runs under `npm test`, not MCP (so this criterion mostly excludes itself — if you're running our specs, you're not calling MCP tools at all)
- Determinism is critical (exact event timing, pixel-perfect reproducibility, no risk of user interference on shared tab)
- Multi-tab isolation with guarantee of no user interference
- Claude in Chrome is unavailable (extension not installed, tab closed, etc.) — fall-back mode

**Default for Claude Code when uncertain**: **Claude in Chrome**. It is cheaper in tokens, faster in iteration, and rides the user's live auth session. Switch to Playwright MCP only when a specific criterion above applies.

**Mandatory announcement** (accountability)
First output or activity-log row of any browser-interacting session must declare the
choice and the reason, e.g.:
> "Browser tool: Claude in Chrome. Reason: exploratory catalog, ≤15 fields, auth-heavy, user at machine."
> "Browser tool: Playwright MCP. Reason: unattended nightly run, no user available."

**Mid-session switch**: allowed. Log the switch + reason in activity-log notes.

**Trigger**: Every session whose plan or request involves any of:
- `/research` with a live-DOM phase
- `/rca` Phase 5 (MCP Replication)
- `/find-bugs` with live app interaction
- `/bugfix` when reproducing on live app
- Any subplan whose Skills field includes `/research` + MCP, or whose Step-by-Step involves "live DOM", "MCP session", "catalog", "locator discovery", "live verification"

**Graduated from**: Session 2026-04-20 — Claude Code agent executing SP-B-LO-1 defaulted to Playwright MCP, burned 4k-token `browser_snapshot`s per mutation, hit context pressure, and had to self-diagnose + switch mid-session. User directive: encode the selection logic at the framework layer so no future agent has to reactively decide.
```

---

## 6. The `/planning` SKILL Step 6 Template Addition

**File**: `.claude/skills/planning/SKILL.md`
**Edit**: Add one line to the bootstrap template (inside the code-fenced block at Step 6, between bullets 5 and 6).

**Before** (current):
```markdown
> 5. **Context load**: read master plan §1-§3 + this subplan in full.
> 6. **Phase 0 FIRST (if present)**: execute Phase 0 date-forensic self-discovery before any edits.
```

**After**:
```markdown
> 5. **Context load**: read master plan §1-§3 + this subplan in full.
> 5.5. **Browser tool selection (if this subplan browses a live app)**: select per LR-038. Announce choice + reason in first output.
> 6. **Phase 0 FIRST (if present)**: execute Phase 0 date-forensic self-discovery before any edits.
```

Also add to the numbered list narrative earlier in Step 6 a matching bullet:
```markdown
2.5. Resolve browser tool (Claude in Chrome vs Playwright MCP) per LR-038 if subplan interacts with a live app
```

---

## 7. The `/research` SKILL Gate

**File**: `.claude/skills/research/SKILL.md`
**Edit**: Add a new Step 0.5 (or equivalent early section) immediately after the existing Step 0.

**Text to insert**:
```markdown
## Step 0.5: Browser Tool Selection (if research involves live DOM)

If this research session will interact with a live web app (exploration, locator discovery,
live-DOM verification, catalog work):

1. Consult **LR-038** (root CLAUDE.md) to pick Claude in Chrome vs Playwright MCP.
2. Default for Claude Code: **Claude in Chrome**.
3. Announce the choice in your first output and your activity-log row.
4. Skip this step if research is purely web-search / docs-reading (no live app).
```

---

## 8. The `/rca` SKILL Phase 5 Addition

**File**: `.claude/skills/rca/SKILL.md`
**Edit**: At the top of Phase 5 ("MCP Replication"), prepend one line.

**Text to insert** (immediately after Phase 5's header, before the table):
```markdown
**Browser tool selection**: before opening any live app, pick Claude in Chrome vs Playwright MCP per LR-038. For RCA on auth-heavy apps (Navigator4 SSO), Claude in Chrome is usually right.
```

---

## 9. In-Flight Subplan Retrofit (14 Files)

**Target files** (all in `plans/pending/`):
- `SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_06_B_LO_2_ECT_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_07_B_LO_R_RECONCILE.md`
- `SUBPLAN_HIST_PIVOT_08_B_LM_1_CURRENCY_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_10_B_LM_3a_LOCAL_INFO_PART_A.md`
- `SUBPLAN_HIST_PIVOT_11_B_LM_3b_LOCAL_INFO_PART_B.md`
- `SUBPLAN_HIST_PIVOT_12_B_LM_4_ACCOUNT_ADDRESS_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_13_B_LM_5_LEGAL_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_16_B_LM_8_AUTO_ADDON_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_17_B_LM_9_TOP_LEVEL_CATALOG.md`
- `SUBPLAN_HIST_PIVOT_18_B_LM_R_RECONCILE.md`

**Edit pattern** — insert one new bullet between current bullets 5 and 6 in each file's bootstrap blockquote:

**Find** (common across all 14 files):
```markdown
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 6. **Phase 0 FIRST (if present in Step-by-Step)**: execute the "Phase 0 — Date-Forensic Self-Discovery" step before any code or doc edits. Document findings (with dispositions) in your activity-log row.
```

**Replace with**:
```markdown
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 5.5. **Browser tool selection**: this subplan interacts with the live app. Select Claude in Chrome vs Playwright MCP per **LR-038** (root CLAUDE.md). Default for Claude Code: **Claude in Chrome** (auth-heavy, catalog work, token-efficient). Announce choice + reason in your first output and activity-log row.
> 6. **Phase 0 FIRST (if present in Step-by-Step)**: execute the "Phase 0 — Date-Forensic Self-Discovery" step before any code or doc edits. Document findings (with dispositions) in your activity-log row.
```

**Implementation note**: all 14 files share the exact "5. Context load" → "6. Phase 0" transition. A single Python/Node scriptlet or parallel Edit calls works. Do NOT use sed for this — the text spans two lines with markdown bullets; an Edit-tool per file is safer.

---

## 10. Memory Entry

**File 1**: `C:\Users\rutvi\.claude\projects\C--Users-rutvi-projects-encore-framework\memory\feedback_browser_tool_selection.md`

**Content** (new file):
```markdown
---
name: Browser tool selection — Claude in Chrome vs Playwright MCP
description: Claude Code sessions default to Claude in Chrome for exploratory/catalog/live-DOM work; Playwright MCP only when unattended or determinism is critical. Non-Claude agents always use Playwright MCP. See LR-038.
type: feedback
---
When any session I run needs to interact with a live web app (Navigator4 or any target), I
select the browser tool per **LR-038** (root CLAUDE.md) and announce the choice + reason in
my first output.

**Default for me (Claude Code)**: Claude in Chrome. It is cheaper in tokens (`read_page` is compact
vs `browser_snapshot` ~4k tokens per call), faster, inherits the user's live SSO session, and has
`read_network_requests` for LR-033 network RCA.

**Switch to Playwright MCP** when: unattended CI-style run, determinism is critical, pixel-perfect
reproducibility needed, or Claude in Chrome unavailable. Not by default.

**Why:** Session 2026-04-20 — I executed SP-B-LO-1 defaulting to Playwright MCP. `browser_snapshot`
burned 4k tokens each, needed one per DOM mutation. Hit context pressure. User flagged the
inefficiency and directed the rule be encoded at framework level so no future agent of mine
(or anyone's) has to reactively switch mid-session.

**How to apply:**
- At session start, if the plan involves live DOM: check LR-038 Gate 1 (am I Claude Code? yes),
  Gate 2 (task classification). Default to Claude in Chrome.
- Announce choice: "Browser tool: Claude in Chrome. Reason: <exploratory catalog / auth-heavy /
  token-tight / user at machine>."
- If mid-session Claude in Chrome fails (extension crash, tab closed, auth expired in my tab
  specifically), switch to Playwright MCP and log the switch with reason.
- NEVER default to Playwright MCP silently. That was the 2026-04-20 failure mode.

**Related memories:**
- [feedback_sonnet_task_split.md](feedback_sonnet_task_split.md) — Sonnet can't do MCP browser work
  (framework rule). LR-038 is about WHICH browser tool; Sonnet guardrails are about WHETHER to
  browse at all.
```

**File 2**: `MEMORY.md` — add index entry in the appropriate section.

**Edit**: add to a new or existing subsection (I'll place it under a new "Browser Tool Discipline" header just above "Pipeline Architecture"):
```markdown
## Browser Tool Discipline (2026-04-20)
- **Claude Code default = Claude in Chrome** for exploration/catalog/live-DOM work. Playwright MCP only for unattended or determinism-critical runs. LR-038 encodes the matrix. → [feedback_browser_tool_selection.md](feedback_browser_tool_selection.md)
```

---

## 11. Active Rules Applied in This Plan

- **LR-020** (verify plan vs codebase) — every file + line cited has been grep/read-verified in Step 1 exploration
- **LR-028** (session bookkeeping) — execution session will append an activity-log row
- **LR-035** (plans/INDEX auto-gen) — no manual INDEX.md edits; `npm run plans:reindex` runs at handoff
- **LR-037** (activity log timestamps) — execution session uses current wall-clock
- **/planning** Step 6 bootstrap block — this plan's own bootstrap adheres to the rule + its parser-safe paraphrasing ("flip the Status field to DONE", not literal bold+colon strings)

---

## 12. Verification (End-to-End)

After execution, all of the following must be true:

1. `grep -n "LR-038" CLAUDE.md` — returns exactly one hit (the rule definition line).
2. `grep -rn "LR-038" .claude/skills/` — returns ≥3 hits (/planning, /research, /rca).
3. `grep -rn "LR-038" plans/pending/SUBPLAN_HIST_PIVOT_*.md` — returns exactly 14 hits (one per B_* subplan).
4. `ls memory/feedback_browser_tool_selection.md` — file exists.
5. `grep "feedback_browser_tool_selection" memory/MEMORY.md` — returns one hit.
6. `npm run plans:reindex:check` — clean (no staleness).
7. `npm run validate:activity-log:preflight` — passes (LR-037 clean).
8. `/regression-guard` fingerprint diff: exactly the 6 file categories touched (CLAUDE.md, 3 skill files, 14 subplans, 2 memory files). Zero unrelated changes.
9. **Smoke read**: Re-read LR-038 cold. A fresh agent should be able to decide Claude in Chrome vs Playwright MCP from the rule text alone, without any other context. If ambiguous on re-read → revise before committing.

---

## 13. Adversarial Audit (ultrathink gate)

**Q1. What if Claude in Chrome is not installed on the user's machine?**
LR-038 self-check ("can I see `mcp__Claude_in_Chrome__*` in my tool list?") catches this. If absent, Gate 1 falls through to Playwright MCP. No failure mode.

**Q2. What if Claude Code can't reliably distinguish its own identity?**
The tool-list self-check is the source of truth. An agent CAN always see its own tool list. Copilot's tool list lacks `mcp__Claude_in_Chrome__*`; Claude Code's includes it. Deterministic.

**Q3. Won't LR-038 add bloat to every CLAUDE.md load?**
~55 lines. CLAUDE.md is always loaded — one-time cost. Saves ≥4k tokens per skipped `browser_snapshot`. Net positive after the first avoided snapshot in any browser-touching session.

**Q4. What if an agent ignores LR-038 (e.g., ANTHROPIC model updates change behavior)?**
LR-038 is reinforced at THREE points: (1) root CLAUDE.md (always loaded), (2) /planning subplan template (inherited by every future subplan), (3) /research + /rca early-phase gates (fires for skill-driven sessions). Triple-embedded. Skipping all three = explicit violation, audit-catchable.

**Q5. What about the `/bugfix`, `/find-bugs`, `/audit` skills? Do they need gates too?**
They auto-call `/identity` and inherit CLAUDE.md. LR-038's trigger list names them explicitly. Adding per-skill gates would be duplication — the rule fires via CLAUDE.md load. Kept the skill-gate edits to the TWO skills (/research, /rca) where browser interaction is the **primary mode**, not a side activity.

**Q6. Mid-session switch from Claude in Chrome to Playwright MCP?**
LR-038 explicitly allows it with a logged reason. Mid-session tab close, auth expiry in the user's tab specifically, user needs to use the browser themselves — all valid switch triggers.

**Q7. What about non-Claude agents executing this plan?**
The plan's own bootstrap HALT condition catches this: "If you are non-Claude (Copilot etc.), do not self-apply — LR-038 doesn't change your behavior (you always route to Playwright MCP)." They can READ the rule, but shouldn't claim to "default to Claude in Chrome" since they can't.

**Q8. What if a subplan's activity-log row violates LR-037 because the addendum edit was done separately?**
The retrofit is a single additive edit per file — 1 line inserted. Execution session makes all 14 edits in one phase, then appends one activity-log row with all 14 files listed. mtime on all 14 files = mtime at Edit time = ≤ activity-log wall clock. Clean.

**Q9. What about the master `PLAN_HIST_COLUMN_FIRST_PIVOT.md` — does it need to reference LR-038?**
It's a reference-only plan (DO NOT EXECUTE banner at top). Its subplans carry the retrofit. Adding LR-038 to the master adds noise without changing behavior. **Excluded.** Verified against §4 exclusion list.

**Q10. What if a future subplan is authored BEFORE this plan executes?**
Then `/planning` Step 6 template doesn't have the LR-038 line yet — the subplan would miss it. **Mitigation**: /planning is a user-invoked skill, unlikely to run during this short plan's execution window (~45-60 min). If a race happens, LR-038 still applies because it's in CLAUDE.md; the subplan bootstrap just wouldn't explicitly reference it. Minor degradation, not a correctness bug.

**Q11. Is 55 lines too much for a single LR?**
Compared to LR-034 (bug filing — ~40 lines with JSON schema) and LR-037 (activity log timestamps — ~22 lines with validation flags), LR-038 at ~55 lines is in the normal range for a behaviorally-significant rule. The matrix requires explicit criteria + agent-type branching + announcement template. Not inflatable without dropping clarity.

**Q12. Over-engineering check.**
Alternative 1: single line "use Claude in Chrome by default" in CLAUDE.md. Rejected — no guidance on when to switch, no agent-type branching, Copilot would wrongly think it applies. Alternative 2: patch only 14 current subplans. Rejected — user explicitly said "also for future tasks". Alternative 3: separate file like `docs/BROWSER_TOOL_SELECTION.md`. Rejected — CLAUDE.md is always loaded; separate file needs manual import per skill. **Current design is the minimum surface that satisfies both current + future coverage.**

---

## 14. Execution Phase Order (for the running session)

1. **Phase 1** — Append LR-038 to `CLAUDE.md` (§5 text above).
2. **Phase 2** — Edit `.claude/skills/planning/SKILL.md` Step 6 template (§6 above).
3. **Phase 3** — Edit `.claude/skills/research/SKILL.md` — add Step 0.5 (§7 above).
4. **Phase 4** — Edit `.claude/skills/rca/SKILL.md` — Phase 5 prepend (§8 above).
5. **Phase 5** — Retrofit 14 SP-B-* subplans — one Edit per file, 1 line inserted between bullets 5 and 6 (§9 above).
6. **Phase 6** — Write `feedback_browser_tool_selection.md` + update `MEMORY.md` index (§10 above).
7. **Phase 7** — Run verification commands (§12 above). If any fail, fix forward.
8. **Phase 8** — Handoff: flip the Status field to DONE, add the Executed date, append activity-log row, `git mv` this plan to `plans/done/`, run `npm run plans:reindex`, commit.

**Commit message**:
```
feat(framework): LR-038 browser tool selection — Claude in Chrome vs Playwright MCP

- New root rule LR-038 with two-gate matrix + announcement template
- /planning Step 6 template inherits browser-tool selection bullet
- /research + /rca skill gates reference LR-038
- 14 in-flight SP-B-* HIST pivot subplans retrofitted
- Memory feedback entry for Claude Code default behavior
```

---

## 15. Risks

| Risk | Mitigation |
|---|---|
| LR-038 conflicts with an existing framework instruction | Grep before write: `grep -n "LR-038" CLAUDE.md` returns zero. If hit, HALT + renumber. |
| Subplan retrofit string doesn't match (file format drift) | Each Edit uses unique 2-line surrounding context. If not unique, read the file and adjust. |
| Future Anthropic model change removes Claude in Chrome tools | LR-038 self-check handles this — tool absence = fall-back to Playwright MCP. |
| User wants a different default | Rule is one line to flip. Current default "Claude in Chrome for Claude Code" is defensible; if user overrides, single-character edit. |
| /research or /rca gates forgotten by agents | LR-038 in CLAUDE.md is always loaded; skill gates are belt-and-suspenders. Even if an agent ignores the gate, the rule still binds. |
| Execution session expands scope beyond 6 enumerated files | `/regression-guard` diff at end flags unrelated changes. HALT condition in this plan's bootstrap enforces it. |

---

## 16. Handoff Signals

On successful completion:
1. Flip this plan's Status field to DONE and add the Executed date.
2. Append activity-log row:
   ```
   | YYYY-MM-DDThh:mm | owner | done | CLAUDE.md, .claude/skills/planning/SKILL.md, .claude/skills/research/SKILL.md, .claude/skills/rca/SKILL.md, plans/pending/SUBPLAN_HIST_PIVOT_{05..18}_*.md (14 files), memory/feedback_browser_tool_selection.md, memory/MEMORY.md | LR-038 browser tool selection landed. 6 categories, ~110 lines. 14 in-flight subplans retrofitted. Memory guardrail written. |
   ```
3. `git mv plans/pending/PLAN_BROWSER_TOOL_SELECTION.md plans/done/`.
4. `npm run plans:reindex`.
5. One commit per LR-027 boundary (this plan = one commit).

---

## 17. Summary for User

**What this plan does**:
Encodes a durable framework rule (LR-038) so every Claude Code session involving browser work
defaults to Claude in Chrome (cheaper tokens, inherits live SSO, has `read_network_requests`)
and uses Playwright MCP only when unattended or determinism is critical. Non-Claude agents
(Copilot, etc.) route cleanly to Playwright MCP since they can't access Claude in Chrome.

**Surface area**: 6 file categories, ~110 lines added, 14 one-line subplan retrofits. No test
code / no framework test changes.

**Why this is durable**: rule lives in root CLAUDE.md (always loaded), is referenced by
/planning's subplan template (inherited by all future subplans), and gated early in /research
and /rca (the two skills where browser interaction is primary). Triple-embedded.

**Why it's surgical**: agent identity files, client-specific rules, test code, and subplans
that don't touch the browser are all explicitly excluded.

**Accountability hook**: LR-038 requires every browser-interacting session to announce its
tool choice + reason in first output. If an agent picks wrong, it's visible.
