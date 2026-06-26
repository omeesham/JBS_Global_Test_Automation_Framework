---
name: Reporting-skill Shield (default) vs Armor (more-detail)
description: On /standup, /end-day, /end-week, /next-this-week — default to strategic-vague SHIELD (no grab-handles, groups like "location area"); only ARMOR (`more-detail`) may name 2–3 tabs; never dump all 8.
type: feedback
originSessionId: b9ff0e23-41b6-45fc-8ddf-8b6e55f32c47
---
Reporting skills (`/standup`, `/end-day`, `/end-week`, `/next-this-week`) emit in **SHIELD mode by default** — strategic-vague, stripped of grab-handles (exact counts, full module lists, recipient names, specific deadlines). ARMOR mode (`more-detail` toggle or its synonyms) is meeting ammo — may name **at most 2–3** active/notable modules. The **full 8-tab module dump is forbidden in all modes**, including ARMOR.

**Why:** 2026-04-23 session — canonical `/standup` examples and `/end-day` translation tables were emitting 8-tab dumps ("Local Info, Pricing, Currency, Legal, Account & Address, Shared Setup, Notes, Auto Add-On") as the GOLD STANDARD pattern. Every line invited a PM grilling ("Why Currency? Status on each?"). Rutvik's directive: "everyone in company is non-technical, treat users as lazy" + "reporting should give grilling no foothold by default." Grab-handles are weapons; SHIELD strips them.

**How to apply:**
- When authoring / modifying any reporting skill: SHIELD default, ARMOR is opt-in via explicit `more-detail` / `expand on` / `arm me` / `meeting mode` / `a bit more detail`.
- SHIELD uses grouped nouns: "the location area", "the location tabs", "a report we owe the client", "a short summary".
- ARMOR may name 2–3 tabs + keep deliverable noun ("CSV for Jira", "bug report"), but never list 4+ modules.
- Every canonical example in skill docs must show BOTH a SHIELD and an ARMOR block (mirroring `.claude/skills/next-this-week/SKILL.md` lines 181–210).
- DUMBASS test (every mode): can a non-technical listener picture the user action on screen? If not, rewrite.
- GRILL test (SHIELD only): 0–1 natural PM follow-ups = pass; 2+ = rewrite vaguer.
