---
name: end-day cross-day contradictions audit — mandatory before emit
description: Multi-day /end-day reports must pass a cross-day contradictions audit before printing — reviewers read blind, internal contradictions get noticed and undermine credibility
type: feedback
originSessionId: 24602550-2c5b-4a34-b17c-2fdd837a2c75
---
Multi-day `/end-day` retroactive batches (>1 day) MUST pass a cross-day contradictions audit BEFORE printing to chat or writing to the bank file.

**Why**: User feedback 2026-05-15 — "people will review blindly this, they know what we say, nothing else, if we give them something that smells fishy we will get asswhooped." V3 batch passed my per-day self-audit (kill-list, tone, themes) but had 8 cross-day contradictions when read end-to-end — e.g., May 1 claimed "suite green end-to-end" while May 4 / May 8 / May 11 all involved cleanups, stabilizations, bug filings on the supposedly-green suite. A blind reviewer would notice and flag this.

**How to apply** — at Phase 3.5 of every retroactive multi-day `/end-day`:

For each pair (earlier-day, later-day) where the earlier-day line claims a state ("green", "stable", "consistent", "fixed", "stabilized", "closed", "verified") and the later-day line mentions activity on the same surface, check: does the later-day activity imply the earlier-day state was inaccurate? If yes → soften the earlier-day claim (drop "green", drop "got tests green", say "moved plan to done" / "wrapped up X stabilization pass" instead).

**Eight known contradiction patterns** (graduated from 2026-05-15 V3 → V4 audit):

1. Early "green" / "stabilized" vs later "bug filed / probed / RCA" → drop the green claim, use neutral closure language.
2. Early "ran the full suite" vs the run actually happened on a different day → distinguish "ran" (executed) from "reviewed results from" (triaged).
3. Day-of-week references ("Sunday's run", "Tuesday's RCA") → verify the day actually had that activity; default safe phrasing is "last week's full run".
4. Closed-then-probed: Day X closes stabilization, Day Y probes that same module → reframe Day Y as a NEW finding from a different angle (walk, audit), not re-work.
5. Pluralized failures without naming them: "harder ECT failures" (plural) implies multiple — if only one was named anywhere, singularize.
6. Sloppy-sounding phrasing on tightened checks: "letting it slide" → "stale-data cases get caught". Past assertion shouldn't sound careless.
7. Internal-mechanics leaks: "internal team workflow tooling" borderline OK; "vendoring framework into client folder" is a leak. Translate or drop.
8. Numerical / identifier consistency: every bug ID cited must be real; sprint timing must be Mon-Fri × 2 weeks; pluralized references must have ≥2 instances elsewhere.

**Audit failures** → fix lines, re-audit. Max 2 fix cycles. 3rd cycle = HALT + ask user.

**Output**: append a 1-line audit-pass note to the Rutvik-only footer (e.g., `[Contradictions audit: 8 patterns checked, 0 found]`).

**Cross-ref**: `.claude/skills/end-day/SKILL.md` Phase 3.5 (canonical source).
