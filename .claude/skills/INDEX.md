# Skill Index

One line per skill. Used by `/relevant` for sub-task skill matching.
Maintained manually — update when creating or modifying skills.

| Skill | Triggers | Match Types |
|---|---|---|
| /identity | session start, pipeline work, "be the HUNTER/GIVER/etc", switch identity | DIRECT |
| /planning | plan, design, how should we, approach, create a plan | DIRECT |
| /execute | execute, implement, build this, do it, run the plan | DIRECT |
| /chain | run all plans, execute pending, chain, autonomous, batch execute, chain status, chain resume, chain stop, chain skip, chain reset | DIRECT |
| /audit | audit, find issues, what's missing, what broke, check everything | VERIFY |
| /bugfix | fix, broken, not working, error, crash | DIRECT |
| /rca | RCA, root cause, why is this failing, analyze failure | DIRECT |
| /cleanup | clean up, dead code, remove unused, orphaned | DIRECT |
| /review | review, check this code, code review, PR | VERIFY |
| /research | research, best practices, how do others, unfamiliar API | INFORM |
| /find-bugs | find bugs, QA, break it, stress test, what could go wrong | DIRECT |
| /deploy | deploy, push to prod, ship it, go live | DIRECT |
| /reflect | session end, what did we learn, retrospective | VERIFY |
| /final-q | final question, are you really done, audit todos, session end completeness check | VERIFY |
| /regression-guard | any code change, before+after snapshots | WRAP |
| /questionnaire | questions, ask me, steering, gaps, doubts | INFORM |
| /compile-learnings | compile learnings, graduate patterns, 3+ occurrences | DIRECT |
| /share-kt | KT, knowledge transfer, share learnings | DIRECT |
| /relevant | check skills, what skills should I use, complex multi-step | INFORM |
| /upgrade | does this apply, upgrade check, self-referential | VERIFY |
| /sonnet | sonnet mode, use sonnet, model guardrails | WRAP |
