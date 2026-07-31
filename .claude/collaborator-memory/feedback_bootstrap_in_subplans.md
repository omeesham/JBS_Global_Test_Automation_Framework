---
name: Bootstrap block at top of every subplan
description: Every subplan file must carry a SESSION BOOTSTRAP blockquote at the top so the user invokes with just `/execute <filename>` — zero additional prompting required
type: feedback
originSessionId: 29c0c6c3-e9da-41d9-a325-57a297d1de1f
---
Every subplan file MUST embed a SESSION BOOTSTRAP block at its very top (before the `# SUBPLAN` heading). The user will never want to type a detailed prompt to start a session — they will only type `/execute <filename>`. Every piece of context the agent needs lives inside the subplan file.

**Why:** Scale (Rutvik routinely has 40+ subplans in flight) + consistency (prompts drift when re-typed) + audit-friendliness (anyone can pick up a subplan cold and see the full invocation protocol) + self-documenting (future agents / colleagues don't need tribal knowledge).

**How to apply:** When authoring ANY plan or subplan in any project, the FIRST content is a blockquote `> 🤖 **SESSION BOOTSTRAP — ...**` that lists:
1. Identity to load (referencing the Identity frontmatter field)
2. Skills + auto-call chain (referencing the Skills field)
3. Model + thinking tier (Opus/Sonnet + think / think hard / think harder / ultrathink)
4. Dependency gate — verify Depends-on items DONE, HALT if blocked
5. Context files to read (master plan sections, catalogs, etc.)
6. Phase 0 directive — if Phase 0 exists in Step-by-Step, run it FIRST, no edits before Phase 0 completes
7. Execute remaining phases
8. Handoff sequence (flip Status to DONE, add Executed date, append activity-log row with LR-037 wall-clock time, git mv to done/, npm run plans:reindex, commit per LR-027 boundary)
9. HALT + ASK USER conditions — dependency blocker / ambiguity / Phase 0 >30% scope extension / regression-guard unrelated changes / LR-037 preflight would fail

**Critical parser note:** Do NOT put literal `**Status**: DONE` or `**Executed**: <date>` (bold + colon) inside the bootstrap. The `plans-reindex.mjs` regex matches these as frontmatter and falsely marks the file as DONE. Paraphrase: "flip the Status field to DONE", "add the Executed date". Applies to all reindex-tracked labels: Status, Priority, Created, Executed, Parent.

**Enforced in:** `.claude/skills/planning/SKILL.md` Step 6 (updated 2026-04-20). Every future /planning invocation must emit subplans with this bootstrap block.

**Example landed in project:** 39 pending `SUBPLAN_HIST_PIVOT_*.md` files in `plans/pending/` all carry this block as of 2026-04-20.
