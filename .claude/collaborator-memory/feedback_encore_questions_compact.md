---
name: /encore-questions output must be compacted — no verbose paragraphs, no "What we want back" line, no guiding parentheticals
description: Format rule for the /encore-questions skill — compact 2-sentence questions only, no coaching prose, no theme headings, strip guidance the reader already infers
type: feedback
originSessionId: 3c4f5ff3-0e3d-4d99-b0a0-966a8e17d018
---
`/encore-questions` output format is COMPACTED. Reader (Rutvik / the Encore QA) already knows what to do with a question — do NOT explain the response expectation.

**Why**: directive 2026-04-23. The first invocation emitted 3 questions in 3–5 line paragraphs with `**What we want back**: answer. Jira ticket if it's a bug.` tails and guiding parentheticals like `(like Add/Remove a Pricing Strategy, which has no visible button on office 1604)`. Too verbose — reader already knows they can reply with an answer, file a Jira, or send a screenshot. Reader does not need coaching on what workflow to imagine.

**How to apply**:
- Max 2 short sentences per question + priority tag. No paragraph, no sub-bullet list.
- **Strip** `**What we want back:**` line entirely.
- **Strip** guiding parentheticals that speculate on what the answer might be (e.g., "(like Add/Remove a Pricing Strategy)", "(admin-only screen, API call)").
- **Strip** confidence framing ("we can see both right now", "in every single save we've tested") — keep concrete numbers ("15 saves across 3 edits", "87-column grep"), drop adverbs.
- **Strip** `### Theme N — ...` headings. Output is a flat `Q1 Q2 Q3` list with priority tags.
- **Strip** "Filed locally as: BUG-XXX-NNN" from body (move to `more-detail` footer only).
- The question itself stays — single clause, one line, intentional-or-bug phrasing OK.

Target format:
```
**Q1 [P0]** <One-sentence observation — concrete numbers OK, framing adverbs out.>
<One-sentence question — single clause, no guiding parentheticals.>
```

Codified in `.claude/skills/encore-questions/SKILL.md` Phase 6 Output format block (HARD rules section).
