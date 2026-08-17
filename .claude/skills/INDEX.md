# Skill Index

One line per skill. Used by `/relevant` for sub-task skill matching.
Maintained manually — update when creating or modifying skills.

**Skill count**: 33 (29 + `/coverage` + `/ultracoverage` added 2026-06-24 SUBPLAN_CGS_A; `/graft` added 2026-07-09 (graft-safety automation — NM-2265 stale-index prevention); `/innovation` added 2026-07-12 PLAN_UPLINK_PROTOCOL (anti-over-delegation: frontier model authors novel thinking, delegation only feeds); `/slop` and `/upgrade` merged into `/audit` as `--mode={review|slop|upgrade}` per SUBPLAN_CCE_03; alias commands at `.claude/commands/{slop,upgrade}.md` preserve muscle memory).

| Skill | Triggers | Match Types | Auto-Calls |
|---|---|---|---|
| /identity | session start, pipeline work, "be the HUNTER/GIVER/etc", switch identity | DIRECT | — |
| /planning | plan, design, how should we, approach, create a plan | DIRECT | identity, research |
| /execute | execute, implement, build this, do it, run the plan | DIRECT | identity, relevant, regression-guard, reflect, final-q |
| /chain | run all plans, execute pending, chain, autonomous, batch execute, chain status, chain resume, chain stop, chain skip, chain reset (DISABLE-MODEL-INVOCATION — explicit /chain only) | DIRECT | identity |
| /chain_audit | audit next done plan, walk through done plans, chain audit, chain_audit status, chain_audit reset, audit plan execution | DIRECT | identity, audit |
| /audit | audit, find issues, what's missing, what broke, check everything (default review mode); slop, sloppy, over-engineered, reduce surface, minimize edits, inflated (--mode=slop); upgrade, does this apply, just wrote a rule (--mode=upgrade) | VERIFY | identity, reflect (review mode only) |
| /bugfix | fix, broken, not working, error, crash | DIRECT | identity, regression-guard, reflect |
| /rca | RCA, root cause, why is this failing, analyze failure | DIRECT | identity |
| /cleanup | clean up, dead code, remove unused, orphaned | DIRECT | identity, regression-guard |
| /graft | graft, splice, integrate from branch, port code — classify an incoming colleague ref into Tier D (their ticket work product, taken as-is) vs Tier F (framework behaviour: hooks/gates/rules/learnings/config, tried per-hunk guilty-until-proven-right), then splice, verify vs source, prove with a real E2E, sync git index to the tested worktree so the disk never lies (NM-2265 stale-index prevention) | DIRECT | identity |
| /review | review, check this code, code review, PR | VERIFY | identity |
| /research | research, best practices, how do others, unfamiliar API | INFORM | identity |
| /find-bugs | find bugs, QA, break it, stress test, what could go wrong | DIRECT | identity |
| /coverage | create test cases, cover this module, coverage, test cases for <module> (DEFAULT for unqualified) — authors SUBPLAN_<MODULE>_COVERAGE_QUICK.md (field FCC + L1 surface must-asserts) | DIRECT | identity |
| /ultracoverage | ultracoverage, deep coverage, exhaustive/max test cases, cover <module> fully/thoroughly — auto-calls /coverage then authors SUBPLAN_<MODULE>_COVERAGE_DEEP.md (depth-chunked L2/L3) | DIRECT | identity, coverage |
| /deploy | deploy, push to prod, ship it, go live (DISABLE-MODEL-INVOCATION — explicit /deploy only) | DIRECT | identity, regression-guard, review |
| /reflect | session end, what did we learn, retrospective | VERIFY | — |
| /final-q | final question, are you really done, audit todos, session end completeness check | VERIFY | — |
| /regression-guard | any code change, before+after snapshots | WRAP | — |
| /questionnaire | questions, ask me, steering, gaps, doubts | INFORM | — |
| /compile-learnings | compile learnings, graduate patterns, 3+ occurrences | DIRECT | identity |
| /share-kt | KT, knowledge transfer, share learnings | DIRECT | identity |
| /relevant | check skills, what skills should I use, complex multi-step | INFORM | — |
| /sonnet | sonnet mode, use sonnet, model guardrails | WRAP | — |
| /report | EXPLICIT ONLY — `/report <subject> for <encore\|jbs>` produces tier-appropriate artifact (agent-only md / human+agent md+light html / human-only visual html + optional --deck pptx) under clients/<client>/readable_externals/<audience>/. Never auto-routes. (DISABLE-MODEL-INVOCATION) | DIRECT | — |
| /ultrathink | ultrathink, ultra think, ultrathink this — quality-gated wrapper that injects mandatory plan + audit gates before sub-skill execution | WRAP | identity, planning, execute, audit, reflect |
| /innovation | innovate, innovation, novel, first of its kind, design a new system/doctrine/pattern, greenfield with no repo precedent — frontier model authors the novel thinking; delegation only feeds evidence/verification/drafts-from-a-Claude-design (NOT side-effecting) | WRAP | — |
| /ultra-agents | EXPLICIT ONLY — lifts subagent count/class/tier caps for the current core goal; fan out a large multi-class army to exhaustively catch deeply-hidden updates. Goal-scoped; re-invoke when the core goal changes. (DISABLE-MODEL-INVOCATION) | WRAP | — |
| /encore-questions | EXPLICIT ONLY — generate live-Chrome-verified batch of questions for the Encore client-side QA contact. Sub-commands: `submitted`, `resolve`, `reset`. Private (not auto-routed) (DISABLE-MODEL-INVOCATION) | DIRECT | — |
| /standup | EXPLICIT ONLY — mid-day scrum standup in DID / DOING / THEN / AND format, plain-English ~20s read. Private | DIRECT | — |
| /end-day | EXPLICIT ONLY — daily client status update for timesheets, multi-source reconciled (plans done/, file mtimes, git, activity log, uncommitted). Private (DISABLE-MODEL-INVOCATION) | DIRECT | — |
| /end-week | EXPLICIT ONLY — weekly client status summary from prior week's /end-day outputs. Private (DISABLE-MODEL-INVOCATION) | DIRECT | — |
| /next-this-week | EXPLICIT ONLY — forward-looking TODAY-focus + PENDING-up-next sections in plain English. Private | DIRECT | — |

**Alias commands** (`.claude/commands/`):
- `/slop` → routes to `/audit slop` (preserves trigger muscle memory; same DROP/KEEP algorithm).
- `/upgrade` → routes to `/audit upgrade` (preserves trigger muscle memory; same self-referential rule check).

**Side-effecting skills with `disable-model-invocation: true`** (auto-routing OFF — user must type the slash command):
- `/chain`, `/deploy`, `/end-day`, `/end-week`, `/encore-questions`, `/report` — chosen because each writes/sends/commits side effects that should never be auto-triggered by ambient phrases.
- `/ultra-agents` — because unlimited multi-class subagent spawning is cost-significant; must never auto-trigger on an ambient phrase.
