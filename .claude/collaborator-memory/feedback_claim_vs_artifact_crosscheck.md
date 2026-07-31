---
name: Self-review must cross-check stated claims against artifacts
description: When user asks "review if correct", checking frontmatter/paths isn't review — must re-read every specific claim made during session against its artifact
type: feedback
originSessionId: f154573a-478c-415c-8c57-970944ac4881
---
When the user asks "is what you did correct?" / "review" / "did you do it right?", NEVER declare "nothing to fix" based on narrow technical compliance checks (frontmatter present, files exist, paths resolve). Those are the *easy* checks. They're not the check that matters.

**The check that matters**: for every **specific claim** made to the user during the session that names a concrete fact — run order, sort position, exact counts, dependency chain, INDEX layout, line numbers — re-read the actual artifact and compare. Claim ≠ artifact = `screwed`, not `done`.

**Why**: root cause of client-review embarrassment on Local Office Settings was agent authoring from spec-memory instead of live-DOM evidence. Self-review has the same failure mode: reviewing from claim-memory ("I said X works, must be true") instead of artifact-evidence ("grep the INDEX, does it actually show X?"). User catches it every time because they read the artifact; I don't.

**How to apply**:
1. List every specific claim made in chat during the session (run order, file count, path, sequence).
2. For each, run the exact tool call that would confirm or disprove it. Don't trust gut.
3. If a claim doesn't match the artifact, tag it `screwed`.
4. If the user *flagged* a specific concern, the check that would disprove their flag is MANDATORY before dismissing. User-flagged + agent-dismissed-without-check = automatic `screwed`.
5. Heuristic: if initial gut-review sounds like "looks good, nothing to fix" and took <30 seconds, I rubber-stamped. Redo with actual tool calls.

**Embedded in**: `/final-q` SKILL.md Step 4.5 (not CLAUDE.md LR-list — rules-list entries get forgotten under pressure per feedback_embed_not_reference.md).

**Repeat-offense history**: ALL-030 rubber-stamp pattern + session 2026-04-23 (authored anti-rubber-stamp system while rubber-stamping the self-review of that same system — ironic timing, agent-mistakes AUD-001).
