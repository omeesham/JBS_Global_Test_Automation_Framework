---
name: feedback-never-propagate-a-derived-id-to-file-mapping
description: A ledger/index that maps finding-IDs to file paths is a CLAIM — never copy that mapping into a worker ticket; give the worker the FILE plus the source-of-truth index and make it derive the IDs.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 26eef3b7-4743-40c6-9eac-6d60ef6c8935
  modified: 2026-07-30T14:02:07.042Z
---

When a derived artifact (a ledger, an index, a triage table, a group listing) maps **item IDs → file
paths**, that mapping is a worker's claim, not ground truth. **Never transcribe it into the next
ticket.** Invert the ticket: name the **FILE** as authoritative, point the worker at the
source-of-truth index, and have it derive which IDs actually target that file.

**Why:** on 2026-07-30 (q123 tri-plan) the fix-wave ledger's group listing said
`P2-06..07 | Fix wrong-rule-home in .claude/skills/compile-learnings/SKILL.md`. I copied that into
`ticket-fw-compile.md` verbatim. All four IDs I passed were wrong — `_ULTRAAUDIT_FINDINGS.md` maps
P2-06 → `~/.claude/delegation/DUTY_STACK.md`, P2-07 → `worker-ext.md`, P25-M05 →
`encore-questions/SKILL.md`, P25-M06 → `coverage/SKILL.md`. The file's REAL findings were P2-19 and
P2-23. The worker caught it only because the ticket ALSO named the file and the class
("wrong-rule-home"), so it could re-derive; it refused the mismatch, found the right IDs, and applied
those. With an ID-only ticket it would have edited the wrong file or applied nothing.

The blast radius is what makes this a rule and not an anecdote: that ledger carried **146 OPEN rows**,
and every slice ticket built from its ID→file column would have inherited the same defect.

**How to apply:**
- Ticket shape: `FILE = <path>` (authoritative) + `INDEX = <source-of-truth path>` + the finding
  CLASS. Instruct: "locate every finding in INDEX whose target is FILE; if an ID I named does not
  resolve to FILE, that is my error — report it and use the ones that do."
- Always give the class/description alongside any ID. The class is what let the worker self-correct.
- Treat a worker that refuses a mismatched instruction and reports the discrepancy as having done the
  job right — that is the behaviour to reinforce, not a failure to follow orders.

## The bare PATH is not an address either (2026-07-30, same session, 2nd occurrence)

The rule above says an ID→file mapping is a claim. The corollary: a **bare relative path inside a
finding is also a claim**, because the same filename often exists at several depths.

Same wave, twice:
- A finding cited `src/rotation.ts`. No root `src/rotation.ts` exists — the only one is
  `.claude/skills/ultra-agents/tavily-mcp/src/rotation.ts`.
- Findings in that same lot cited `tsconfig.json`, `src/index.ts`, and `.gitignore`. All three DO exist
  at repo root — and all three meant the nested `tavily-mcp` copies. Applying them at root would have
  edited the framework's real config, `.gitignore`, and contracts barrel.

What disambiguated it was **the finding's own content, not the path**: the `tsconfig.json` finding
mentioned `test-client.ts` in `include`, which only the tavily-mcp tsconfig has. Root uses `**/*.ts`.

**How to apply:** in every R-phase ticket, require a `## PATH RESOLUTION` section — glob the basename
repo-wide, list every match, and pick using evidence from the finding body. A single match still gets
stated. `REFUSE — GONE` when no match exists; never guess which file "was probably meant". Danger is
highest when the path exists at root AND nested, because then nothing errors — the wrong file just
quietly changes.

Related: [[feedback-worker-report-claims-need-own-grep]] (same shape one layer up — a report's claim
needs your own grep), [[feedback-ticket-literal-paths]], [[feedback-worker-one-file-per-dispatch]].
