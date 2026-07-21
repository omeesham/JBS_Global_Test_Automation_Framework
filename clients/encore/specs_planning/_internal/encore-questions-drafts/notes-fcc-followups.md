---
artifact: encore-questions-draft
client: encore
module: notes
session_date: 2026-05-21
author_identity: GIVER (audit remediation)
parent_plan: SUBPLAN_NOTES_FCC_PILOT
related_catalog: ../field-case-catalogs/notes-2026-05-19.md
status: pending-user-trigger
---

# Notes FCC follow-up questions (pending user `/encore-questions` invocation)

Per CLAUDE.md EXPLICIT-ONLY policy, agents must NOT auto-invoke `/encore-questions`.
Rutvik triggers `/encore-questions` when ready; this file is the draft seed.

## FCC-005: Server-side max content length for Notes textarea

**Context**: Notes textarea has a soft client-side limit of 4000 characters (JS-enforced via Angular `Validators.maxLength(4000)`); no HTML `maxlength` attribute. Paste/programmatic input can exceed 4000 (TC-LOC-NTS-036 proves 4001 chars persist server-side).

**Open question**: what is the server-side hard limit, if any? FCC-005 was deferred during the Notes pilot because the answer determines whether to author a 10000-char persist test (and similar boundary tests at 50k, 100k, 1M).

**What we know**:
- Client: no `maxlength` HTML attribute.
- Angular validator: `Validators.maxLength(4000)` enforced as **soft** (paste exceeds it; counter shows overage; save still succeeds for 4001 per TC-036).
- Server: persisted 4001 chars without truncation (TC-036 reload assertion). Behavior at 10000+ unverified.

**Ask Encore**:
1. Is there a server-side max content length for the `notes.notes.{i}.note` field? If yes, what is it?
2. What does the server do on over-limit submission — 400 reject, silent truncate, or accept-and-store-truncated?
3. Is the client-side `Validators.maxLength(4000)` an enforcement intent or a guideline? (i.e., should automation treat 4001 as a soft warning or a real boundary?)

**Once answered**:
- If server has a real max (e.g., 10000 / 100000), author `TC-LOC-NTS-FCC-005-PERSIST-N-CHARS` and `TC-LOC-NTS-FCC-005-OVER-LIMIT-N+1-CHARS`.
- If server has no real max, document the absence in `field-inventories/notes-2026-05-11.md` and close FCC-005 as `NOT-AUTOMATABLE / no-hard-limit`.

**Trace**: `field-case-catalogs/notes-2026-05-19.md` § Cases EXPLICITLY DEFERRED → FCC-005.
