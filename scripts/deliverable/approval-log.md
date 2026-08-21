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


---

**Migration note (2026-08-13):** The corporate-override submodule codes were renamed as part of a structural naming remediation. Old ticket-ID codes map to new feature-based codes as follows: N268 -> LPK (Location Picker), N269 -> FLT (Filters), N270 -> GSR (Grid Sort), N271 -> LGR (Labor Grid), N272 -> EXP (Export), N273 -> IMP (Import). Approvals recorded in the rows above under the old codes carry forward to the new codes. Any reference to a COR.N26x or COR.N27x code from a session on or before 2026-08-12 refers to the same submodule now identified by the corresponding new code.
| 2026-08-14 | Rutvik (owner) | COR.LGR | approved-next — carries forward approval recorded at line 18 (COR.N271); code renamed N271→LGR under PLAN_65 structural remediation 2026-08-13 | Migration: COR.N271 approval row line 18; PLAN_65 code rename 2026-08-13 |
| 2026-08-14 | Rutvik (owner) | COR.EXP | approved-next — carries forward approval recorded at line 19 (COR.N272); code renamed N272→EXP under PLAN_65 structural remediation 2026-08-13 | Migration: COR.N272 approval row line 19; PLAN_65 code rename 2026-08-13 |
| 2026-08-14 | Rutvik (owner) | COR.IMP | approved-next — carries forward approval recorded at line 20 (COR.N273); code renamed N273→IMP under PLAN_65 structural remediation 2026-08-13 | Migration: COR.N273 approval row line 20; PLAN_65 code rename 2026-08-13 |
| 2026-08-14 | Rutvik (owner) | SVC.BAS | approved-next — owner approval given directly in chat 2026-08-14 (PLAN_66 C3 residual: status was set 4b542701c with no log row; owner confirmed "YES") | Rutvik chat approval 2026-08-14; PLAN_66_DELIVERABLE_TRUTH_SWEEP |
| 2026-08-14 | Rutvik (owner) | SVC.HIS | approved-next — owner approval given directly in chat 2026-08-14 (PLAN_66 C3 residual: status was set 4b542701c with no log row; owner confirmed "YES") | Rutvik chat approval 2026-08-14; PLAN_66_DELIVERABLE_TRUTH_SWEEP |
| 2026-08-21 | Rutvik (owner) | DOP.OPT | approved-next — NM-3342 Discount Optimization (Locations tab, 35 TCs) handed to a collaborator for review on branch encore-mock/NM-3342 only; owner instruction in chat 2026-08-21 was to push the full 3342 ticket to its own ticket-named branch, and never to main | Rutvik chat approval 2026-08-21; Jira NM-3342 |
| 2026-08-21 | Rutvik (owner) | DOP.EXM | approved-next — NM-3342 Special Rate Exemptions by Service Type (6 TCs) handed to a collaborator for review on branch encore-mock/NM-3342 only; owner instruction in chat 2026-08-21 was to push the full 3342 ticket to its own ticket-named branch, and never to main | Rutvik chat approval 2026-08-21; Jira NM-3342 |
| 2026-08-21 | Rutvik (owner) | DSM.CMX | approved-next — NM-3343 Discount Matrix (Company Matrix, 42 TCs) handed to a collaborator for review on branch feature/sprint16-vikas-NM-3343 only; owner instruction in chat 2026-08-21 was to push the full 3343 ticket to its own ticket-named branch under time pressure, never to main | Rutvik chat approval 2026-08-21; Jira NM-3343 |
