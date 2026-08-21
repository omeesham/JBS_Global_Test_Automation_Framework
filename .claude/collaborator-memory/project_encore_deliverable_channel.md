---
name: project-encore-deliverable-channel
description: Both push remotes moved to the omeesham org on 2026-08-21. The Encore deliverable target is now a SHARED team repo, not a private mock — force-push discipline changed.
metadata:
  type: project
---

**Migration date: 2026-08-21.** Both push destinations moved to the `omeesham` org. The old repos are frozen history, not delete-me garbage.

| Purpose | New target (live) | Old target (frozen) | Local alias for the old one |
|---|---|---|---|
| Framework / team repo (`/push-repo`) | `omeesham/JBS_Global_Test_Automation_Framework`, branch `main` | `RutviK-JBS/qa_agentic_framework_global` | `origin-old` |
| Encore deliverable (`/push-encore-deliverables`) | `omeesham/EncoreGlobal_AI_Test_Framework`, branch `dev-rutvik` | `RutviK-JBS/encore_deliverables_test`, branch `main` | `encore-mock-old` |

**The safety property changed, and this is the part that matters.** The old `encore_deliverables_test` was Rutvik's own dry-run mock — force-pushing it had no external stakes. `omeesham/EncoreGlobal_AI_Test_Framework` is a **shared team repo** carrying other people's work: `dev-vamsee`, `dev-vikas`, `develop`, `feature/sprint16`, `feature/sprint16-vamsee-location-settings`, and `main`. Our lane is `dev-rutvik` and nothing else.

**How to apply:**
- Force-push `dev-rutvik` only. Never force-push `main`, `develop`, or any `dev-*` / `feature/*` branch belonging to someone else.
- Before any force-push to `dev-rutvik`, confirm the branch tip is ours. On 2026-08-21 it was safe precisely because `dev-rutvik` and `main` pointed at the identical commit (`6c05be75`), so nothing unique could be orphaned. Re-derive that check every time; do not assume it still holds.
- We have `push` but **not** `admin`/`maintain` on either omeesham repo. Branch protection and settings are not ours to change.
- The Encore client still never touches git — JBS colleagues hand over the folder/zip outside git. That part is unchanged.

Wired in: [[project-encore-deliverable-channel]] is mirrored at `.claude/collaborator-memory/project_encore_deliverable_channel.md`; live mechanisms are `.claude/skills/push-repo/SKILL.md`, `.claude/skills/push-encore-deliverables/SKILL.md`, `scripts/ship-branch.sh` (`REMOTE_URL`), `.claude/context/navigation.md` row 74, and `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md`. See also [[reference-combined-deliverable-ship]] and [[feedback-gate-push-on-denylist]].
