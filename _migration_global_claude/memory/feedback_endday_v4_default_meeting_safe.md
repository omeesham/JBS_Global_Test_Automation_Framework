---
name: end-day V4 default — meeting-defense format
description: /end-day default style as of 2026-05-15 is V4 meeting-defense, not casual Rutvik voice — professional plain English with vibe+tech 2-part sentences, real module names allowed, internal codes / packaging mechanics / customer-neutral framing banned
type: feedback
originSessionId: 24602550-2c5b-4a34-b17c-2fdd837a2c75
---
`/end-day` defaults to V4 MEETING-DEFENSE style. Override with `/end-day legacy-voice` for the old casual Rutvik voice.

**Why**: User feedback 2026-05-15 — V1 sanitized version was "full of lies" (claimed work that didn't happen, e.g., ECT today). V2 raw-truth version was "too much" (revealed packaging mechanics, customer-neutral framing, internal codes — bad for Encore eyes). V4 middle path satisfies "realistic so I can defend in real meetings without lying" + "professional, readable by anyone" + "techies AND morons both" — without leaking internal mechanics.

**How to apply** — every `/end-day` invocation (default + retroactive backfill):

1. **Tone**: professional plain English. NOT casual ("yeah I cleaned up some stuff"), NOT corporate-stiff ("Per the strategic initiative, I executed Phase 2 deliverables"). Each line is something Rutvik can read aloud in a meeting without sounding scripted.

2. **Sentence structure**: 1 sentence = 2 parts, em-dash separator. `<vibe clause> — <tech clause>`. Vibe clause is accessible to a PM / business stakeholder. Tech clause adds simple technical specifics for QA leads / devs in the room. Both audiences get value from the same line.

3. **Real Encore module names**: Locations, Local Office, Notes, ECT, Management History, Local Information, Pricing, Currency, Legal, Account & Address, Auto Add-On, Shared Setup, Basic Information.

4. **Real activity verbs**: filed a bug, walked tabs, verified data, fixed assertion, ran suite, captured findings, compiled report, closed plan, tightened check, reorganized doc, added coverage.

5. **Auth specifics OK when Encore-known**: Entra Federation, MFA (as legacy).

6. **Stay-behind-reality on today**: present continuous ("Working on", "Continuing", "Tidied up") — never "finished / closed" for today's work even if a plan moved DONE today.

7. **NEW kill-list additions** (on top of existing skill kill list line 192):
   - ship / shipped / shipping / delivery
   - deliverable / deliverables
   - customer-neutral / client-neutral
   - vendor / vendoring / vendored
   - per-client / multi-client / multi-tenant / client-split / client-scoped / client-side
   - packaging mechanics / repo restructure (as outward-facing framing)
   - Exact percentages and counts: "98.3% pass rate" / "288/293" / "12 bugs + 10 questions" — say "strong pass rate", "small failing bucket", "a bug-and-question report"
   - Internal codes: BUG-XXX-NNN IDs, LR-NNN, F-numbers, specific TC-XX..XX numeric ranges, plan IDs (PLAN_*, SUBPLAN_*)
   - Hyper-specific framework internals: waitForFunction, expect.poll, Locator.count, otplib — soften to "polling call", "row count check", "legacy token code"

8. **Pacing-constraint clause**: if the user explicitly invokes a pacing constraint ("3 visible per 2-week sprint", "show only N tasks", "stretch this across the week"), it constrains BREADTH — pick which themes surface and which are dropped — but does NOT excuse factual lies. Today's lines must trace to today's actual file mtimes. A pacing constraint that would require claiming work that did not happen today is a HALT condition — ask the user.

**Cross-ref**: `.claude/skills/end-day/SKILL.md` Phase 3 "DEFAULT STYLE — V4 Meeting-Defense Format" section (canonical source).
