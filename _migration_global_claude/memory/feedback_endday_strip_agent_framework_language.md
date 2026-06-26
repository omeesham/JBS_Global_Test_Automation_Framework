---
name: endday-strip-agent-framework-language
description: "/end-day output to Encore (or any client whose stake is the product, not our process) must describe HUMAN QA work only — strip every sentence whose TOPIC is internal process / agent workflow / framework mechanics / plan-system / repo restructure, even when individual words pass the kill-list. Encore sees only what a single human QA tester produced."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1d9ce98d-3781-4b05-9790-d7a9efb27cc5
---

When composing `/end-day` (or `/end-week`, `/standup`, or any client-facing status update) for Encore — and by extension any client whose stake is the tested product, not our internal pipeline — every line's TOPIC must be a HUMAN-QA OUTPUT, not an internal-process or framework-mechanic update.

**Why:** Encore pays for testing of their product. They don't care that we have agents, closure-gates, planning systems, lifecycle plans, repo restructures, RCA processes, framework defenses, or any internal scaffolding. The user pushed back hard 2026-05-26 after a V4 SHIELD output (week of 2026-05-18..22) leaked sentence-level descriptions like: "internal process for closing planning work" (closure-gate v5 build), "planning efforts" (plan closures), "internal cleanup pass on the project shape" (repo restructure), "end-to-end planning workflow" (multi-agent Requirements→Planner→Generator), "save-cycle test runner for multi-row forms" (field-case-runner.ts internals), "internal root-cause-investigation process" (RCA-laziness hardening), "Notes pilot lifecycle" (lifecycle plan), "live walks before tests run — anchors the test setup to the correct page elements" (framework defenses), "fresh-eyes review" / "rolled-up plans cascade-closed". All factually accurate, all internal-process leaks, all rejected. Word-level kill-list is necessary but not sufficient — the leak happens at the sentence-topic level.

**How to apply:**

1. **Sentence-topic test (mandatory before each line is printed)**: ask "Can this sentence be reframed as 'Rutvik walked / added / found / ran / verified / closed [a thing the client recognizes]'?" If NO, the sentence is internal-process leak → DROP. Re-asking is not enough — the topic itself is wrong.

2. **Topic whitelist** (allowed sentence topics, all framed as Rutvik-the-single-human did them):
   - Walking through a named Encore module (Shared Setup Locations, Notes, Local Office, Locations, Currency, Pricing, Legal, Local Information, Account & Address, Auto Add-On, Equipment Cost Tracking, Management History, Basic Information, Shared Setup)
   - Adding / removing / updating specs or skips on a named module
   - Filing / re-verifying / following up on a bug
   - Running a module's test set and observing pass/fail behavior
   - Spotting an environment / app behavior pattern during a run
   - A peer-review or second-look check on a test set (acceptable framing — "second pair of eyes")
   - Tool-level QA upgrades the client benefits from (Allure reporting, CI test runs)

3. **Topic blacklist** (banned sentence topics — no whitelist exception):
   - Internal process improvements (closure-gates, validation hooks, plan-closure machinery, pipeline orchestration, identity systems)
   - Agent workflow descriptions (Requirements → Planner → Generator, multi-agent, end-to-end planning workflow)
   - Repo / project restructure (project shape, shared utilities, scaffolding, vendoring, deliverable shape)
   - Plan-level mechanics (planning efforts, lifecycle plans, rolled-up plans, cascade-closed, plan IDs, planning closures)
   - Framework internals (test runner helpers, safety checks on infrastructure, anchoring infrastructure, framework defenses, save-cycle runners)
   - RCA-process tightening, audit-process tightening, review-process tightening
   - Anything that names or implies internal staff / agent identities (HUNTER, GIVER, BUILDER, HEALER, WATCHDOG, OWNER, GARDENER — or plain-English disguises like "fresh-eyes auditor", "planner", "generator")

4. **Coverage shortfall is fine**: a day with mostly internal work may produce only 1–2 client-visible lines, or even 0. That's honest — say "nothing client-visible to report today" rather than padding with internal-process descriptions. The big restructure / closure-gate day produces fewer report lines, not more.

5. **"Pretend there's only one human"**: Rutvik. Frame all output as Rutvik-the-human walked / added / found / ran. No mention of "we", "our team", "the pipeline", "the agents", "the process", "the workflow", "two work sessions" (collapses to "across the day").

6. **Universal-client scope**: this rule applies to every current and future client where the client buys QA OUTPUT (not QA-engine-development). Encore today; any other client whose contract is "test our product" inherits the same constraint. Clients who specifically pay for pipeline development (rare) are the exception — explicit confirmation required.

**Related:** extends [[feedback_endday_v4_default_meeting_safe.md]] (V4 meeting-defense was right framing but allowed sentence-topic leaks) + [[feedback_endday_hide_multitenant.md]] (client-bespoke framing hides multi-client mechanics) + the `/end-day` SKILL.md Hard KILL LIST (word-level guard — necessary but not sufficient; this rule is the sentence-topic guard above it) + [[feedback_embed_not_reference.md]] (this rule is also embedded into `/end-day` SKILL.md as a mandatory pre-print test, not left as a memory-only reference).

**Scope:** any client-facing report — `/end-day`, `/end-week`, `/standup`, ad-hoc status updates, email drafts to Encore.
