# Client deliverable — approval log (APPEND-ONLY)

This file is the evidence source that `scripts/deliverable/delivery-manifest.encore.json` points at
via each module's `approved_ref` field. `scripts/validate-delivery-manifest.mjs` reads the
referenced line, checks its blob sha, and requires the line to name the module code. A manifest
status that cannot resolve to a line in here does not ship.

**Append only.** Never edit or delete an existing row — a rewritten line breaks every `blob_sha`
pointing at it, and rewriting approval history is the exact failure this file exists to prevent.
Corrections are new rows that supersede old ones, and say so.

Rows are ordered oldest first. One approval per line, so a line number is a stable citation.

Format: `| date | approver | module code(s) | scope granted | source |`

| Date | Approver | Module code(s) | Scope granted | Source |
|---|---|---|---|---|
| 2026-07-30 | Rutvik (owner) | COR.N271 | approved-next — cleared to ship on the `main` release | Owner instruction, 2026-07-30 session: "THEY WERE TO BE DELIVERED, ONLY some locations module AND local office are not to be delivered! corp = everything to be delivered!" |
| 2026-07-30 | Rutvik (owner) | COR.N272 | approved-next — cleared to ship on the `main` release | Owner instruction, 2026-07-30 session: "THEY WERE TO BE DELIVERED, ONLY some locations module AND local office are not to be delivered! corp = everything to be delivered!" |
| 2026-07-30 | Rutvik (owner) | COR.N273 | approved-next — cleared to ship on the `main` release | Owner instruction, 2026-07-30 session: "THEY WERE TO BE DELIVERED, ONLY some locations module AND local office are not to be delivered! corp = everything to be delivered!" |
| 2026-07-30 | Rutvik (owner) | LOS.BAS, LOS.HIS, LOS.ECT | WITHHELD — not to be delivered | Owner instruction, 2026-07-30 session: "i never said things like local office was EVER TO BE INCLUDED!" |
| 2026-07-30 | Rutvik (owner) | LOC.CUR, LOC.LI, LOC.MGH, LOC.PRI | WITHHELD — not to be delivered | Owner instruction, 2026-07-30 session: "only some locations module AND local office are not to be delivered". These four are the locations modules with no delivered branch; the other six locations modules are delivered. |
| 2026-07-30 | Rutvik (owner) | INTERNAL.UNIT | INTERNAL ONLY — never ships to any client | Owner instruction, 2026-07-30 session, on finding a framework-internal unit-test directory in the shipped payload. Framework-internal tests have no client relevance. |

---

## Provenance note — read this before trusting a row

The 2026-07-30 rows record instructions given by the owner directly in a working session, in
response to an over-ship incident on `encore-mock/main` (`eae1ee9c`). They are transcribed here
because no prior committed artefact recorded them — which was itself part of the problem: the
delivered set had been living in a comment block at the top of `scripts/ship-branch.sh` rather than
anywhere a machine could check.

The `delivered` rows in the manifest do **not** rely on this file. Each cites the commit sha of the
branch it actually shipped on, which is stronger evidence than any written approval. This log
exists for the statuses that a commit sha cannot prove: `approved-next`, `withheld`, and
`internal-only`.

Future rows should ideally cite something external and durable — a Jira approval, a client email,
a signed-off plan — rather than a session transcript. A transcribed instruction is honest evidence
of what was said; it is not independent of the person transcribing it. Stating that limitation is
the point of this note.
