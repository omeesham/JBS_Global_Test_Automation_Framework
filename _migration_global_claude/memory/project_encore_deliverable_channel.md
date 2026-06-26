---
name: Encore Deliverable Channel — Mock vs Real Ship
description: RutviK-JBS/encore_deliverables_test is a dry-run mock for testing git ship actions. Real ship to Encore client goes via JBS colleagues (not Rutvik, not Claude) outside git.
type: project
originSessionId: 849dfb50-6af8-469d-9172-2f9f4035fcdf
---
`RutviK-JBS/encore_deliverables_test` is a **dry-run staging repo** — it exists so we can test what `git archive HEAD clients/encore/` produces and whether the deny-list/hook/CI scaffolding catches IP leaks BEFORE our JBS colleagues ship the real deliverable to the Encore client.

**The Encore client will never see the git repo.** Ship to them happens via JBS colleagues handing over a folder/zip outside git. Neither Rutvik nor Claude executes the real ship.

**Why:** Stated 2026-05-01: "encore client wont get what we do on git, its just a mock test of git actions before we do it, and it wont be me or u doing it, would be others in our team."

**How to apply:**
- Force-pushing, deleting branches, or rebuilding `RutviK-JBS/encore_deliverables_test` is **internal hygiene** — no external collaborator stakes, no client-visibility risk. Treat as a normal local repo, not a production system.
- Plan/agent guards that say "confirm with user before destructive remote op on the deliverable repo" become routine confirmation, not high-risk authorization.
- The audience for ship-pipeline documentation (BUNDLE_MANIFEST, ship-client.sh, deny-list, .githooks/pre-push) is **JBS colleagues + future agents**, not the Encore client. Documentation should be operator-facing for them.
- The deliverable shape (clients/encore/ self-contained, vendored framework, gitignored agent IP) is still load-bearing — the JBS handover folder must be exactly what `git archive` produces, so JBS doesn't accidentally `cp -r` the working tree.
- "Old SHA archival" concerns on force-pushed commits drop to informational — no client follows commit SHAs on the mock.
