> NEEDS TO BE CHECKED FOR LEFTOVER SLOP (LR-050 — restructure plans must enumerate stale-slop cleanup IN-SCOPE).

# PLAN: Vertical Submodule Delivery + SOX Compliance Adoption

**Status**: PENDING
**Priority**: P0-EMERGENCY (queue position: #2 — see banner below)
**Created**: 2026-05-04
**Depends on**: PLAN_VERTICAL_RESTRUCTURE_PENDING.md (Plan A — produces the per-submodule queue this plan ships from), PLUS 3 HIGH-priority Encore questions answered (H1 repo · H2 layout · H6 SOX scope — see companion audit `~/.claude/plans/plan-vertical-delivery-sox-check-all-kind-beaver.md`). All earlier strict deps (`SUBPLAN_DEPENDENCY_AWARE_MIGRATION_REMAINING`, `SUBPLAN_DYNAMIC_WORKERS_FRAMEWORK`, `PLAN_DELIVERABLE_LEAK_AUDIT`) closed 2026-05-05.
**Blocks**: per-submodule NM-XXXX PR cycle (once execution begins post-Encore-call)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none
**Skills**: /execute, /regression-guard, /audit, /final-q
**Story Points**: 5
**Author**: Rutvik (via Claude Opus 4.7)

---

## 🚦 STATUS 2026-05-06 — L2-FROZEN. QUEUE POSITION #2.

**Sibling plan**: [`PLAN_VERTICAL_RESTRUCTURE_PENDING.md`](PLAN_VERTICAL_RESTRUCTURE_PENDING.md) is **queue position #1** — restructuring `plans/pending/` into per-submodule bundles. That plan does NOT need Encore confirmation; it's runnable now.

**This plan (Plan B / position #2) is FROZEN until Encore answers 3 HIGH-priority questions** in the companion audit at `~/.claude/plans/plan-vertical-delivery-sox-check-all-kind-beaver.md` (cleansed 2026-05-07 from 9 → 3 under the "ship without getting asswhooped" lens). Until those answers come back:

- ❌ NO edits to `clients/encore/CLAUDE.md` (no LR-ENC-002 / LR-ENC-003 added)
- ❌ NO edits to `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md`
- ❌ NO PR / branch / push activity targeting `Encore-Global` or any other repo
- ❌ NO `feature/NM-XXXX-*` branch creation in any repo
- ❌ NO cycle execution per the "When picked up: execution shape" section below

**What unfreezes this plan**: the 3 HIGH questions answered (H1 repo URL · H2 directory layout · H6 SOX scope for test code).

**Working assumption while frozen**: Plan A (#1) executes in parallel and produces ready-to-ship submodules in queue. When this plan unfreezes, the first ready submodule pushes via the (then-confirmed) cycle.

---

## ⛔ PRE-EXECUTION VERIFICATION GATE — read this first

**Nothing in this plan is confirmed yet. Everything is best-guess.**

As of 2026-05-04, Rutvik has **NOT**:
- Looked at the Jira ticket list yet.
- Talked to the Encore team about exactly what we have to do.
- Confirmed the PR target, default branch, reviewer, repo layout, or "definition of done" with anyone at Encore.

So every decision below (D1–D5) and every rule we plan to encode (LR-ENC-002, LR-ENC-003) is **provisional**. The plan was authored using only the three SOX / Branching / Story-Point docs Encore shared + what Rutvik thinks-is-true today. That is **NOT** the same as Encore having said "yes, do it this way."

### Hard gate — this plan does NOT execute until ALL of these are TRUE

1. Rutvik has reviewed the actual Jira ticket list (NM-XXXX → submodule mapping).
2. Rutvik has had at least one call with the Encore team to walk through this plan.
3. Every question in "Questions for the next Encore call" below is answered.
4. Every D1–D5 assumption is either confirmed verbatim or **replaced** with the Encore-confirmed answer.
5. Rutvik invokes `/execute PLAN_VERTICAL_DELIVERY_SOX` in chat AFTER conditions 1–4 are confirmed cleared.

**If any of 1–5 is missing → HALT.** Do not improvise. Do not execute partially. The whole point of this plan is SOX-clean delivery; bypassing the verification gate would itself be a SOX failure.

### Questions for the next Encore call — see companion audit

The cleansed list (3 HIGH only — MED + LOW dropped 2026-05-07 under the "ship without getting asswhooped" lens) lives in `~/.claude/plans/plan-vertical-delivery-sox-check-all-kind-beaver.md` under "Revised Encore question list — prioritised". Single source of truth — don't fork it here.

**HIGH-priority blockers** (these 3 must be answered before this plan unfreezes):

- [ ] **H1** Repo URL — which specific repo in `https://github.com/Encore-Global` is the e2e-tests home?
- [ ] **H2** Directory layout in target repo — where do shipped files land?
- [ ] **H6** SOX scope — is the e2e test repo in or out?

When all 3 are checked off, this plan can move to "ready" status and the Pre-Execution Verification Gate's 5 conditions are revisited.

**Known constraints** (no Encore Q needed — Rutvik directives 2026-05-06/07; baked into LR-ENC-002 when this plan unfreezes):

- We ship only things tracked in Jira NM project (no untracked work crosses the ship boundary).
- 1 NM-XXXX ticket = 1 ship cycle (self-imposed discipline regardless of H6 outcome).
- We self-decide scope per ticket.
- Auto-user / repo + Jira NM-project access already provisioned by Encore.

**Dropped from earlier draft** (2026-05-07 cleanse — preserved here for traceability; full reasons in companion audit):

- H3 first-ticket-scope (we decide, not them) · H4 CI ownership (their CI, their problem) · H5 secrets (auto-user given) · H7 branch protection (their engineers approve) · H8 bug-filing channel (Jira, already known) · H9 communication channel (not a ship-blocker).
- All 7 MED + 6 LOW (defaults work; cascade from HIGH dismissals).

---

## Sequence in queue (refreshed 2026-05-06)

**Strict deps closed** (all DONE 2026-05-05):
- `PLAN_DEPENDENCY_AWARE_FAILURE` — `dependencyGate(deps[])` fixture landed.
- `PLAN_DYNAMIC_WORKERS` — worker resolver config landed.
- `PLAN_DELIVERABLE_LEAK_AUDIT` — leak verifier + pre-push guard landed.

**Current gate**: 3 HIGH-priority Encore questions in the companion audit (H1, H2, H6 — cleansed 2026-05-07 from 9). Until those answers come back, this plan stays L2-FROZEN per the banner above. The Pre-Execution Verification Gate that follows enumerates what "answered" looks like.

**Parallel work**: [`PLAN_VERTICAL_RESTRUCTURE_PENDING.md`](PLAN_VERTICAL_RESTRUCTURE_PENDING.md) (Plan A / queue position #1) does NOT block this plan. Plan A produces ready-to-ship submodules independently of Encore; this plan handles the actual push once unfrozen.

**Save-time scope**: this plan file is updated only — no edits to `plans/INDEX.md` (auto-regen), no edits to `clients/encore/CLAUDE.md`, no edits to `SHIP_TO_ENCORE.md`. All such edits happen WHEN this plan unfreezes, per the "When picked up" section below.

---

## Context

Encore handed us three governing documents (Kevin Carroll, May 2026):
- **SOX Compliance Reference** — every prod change ties to one NM-XXXX Jira ticket; 1 ticket → 1 PR; documented review; full ticket → PR → commit → deploy traceability.
- **Branching & Pull Requests** — Gitflow: `feature/NM-XXXX-short-description` from `develop`; never direct-commit to `develop`/`main`/`release/*`/`hotfix/*`; ≥1 independent reviewer.
- **Story Point Estimation** — 1 (Trivial) / 2 (Small) / 3 (Basic) / 5 (Complex) / 8 (More complex) / 13 (Most complex — break down) / 21 (Too big — MUST break down).

These bind us forever for Encore. Today the framework runs **horizontally** (feature-X across all submodules → feature-Y across all submodules). Encore wants **vertical** — finish ONE submodule end-to-end, ship as ONE PR, close ONE Jira ticket, then the next.

This plan captures the **intent and shape** of that pivot — to be executed AFTER the leak audit and dynamic workers plans land, AND after the Pre-Execution Verification Gate clears.

---

## Tentative assumptions — UNVERIFIED (Rutvik's best guess, 2026-05-04)

> ⚠ Each row below is a working assumption, **not** a confirmed fact. The Encore call must validate or replace each one. After validation, this section becomes "Confirmed decisions."

| # | Assumption (tentative) | Verification source needed |
|---|------------------------|---------------------------|
| D1 | **PR location**: `https://github.com/Encore-Global` (Rutvik has access). We file `feature/NM-XXXX-*` PRs against `develop` directly. JBS handoff is no longer the git path for Encore. | Encore confirms repo URL + branch + that we file directly. |
| D2 | **Granularity**: Per Jira ticket. Today's tickets are submodule-overall with no defined scope; we self-define internal scope per ticket. If Jira refines, follow Jira. | Encore shares actual Jira list + confirms scope-self-definition is OK. |
| D3 | **"100% done"**: Our best definition until Jira specifies — take a submodule, finish all its test-case-quality upgrade subplans, ship → 1 Jira solved. | Encore confirms there's no written acceptance criteria + accepts our definition. |
| D4 | **Test-case-quality plans (e.g., dep-gate)**: Fold into per-submodule PRs. Each submodule's PR carries its share of dep-gate migration. | Encore confirms one PR per submodule is fine (vs. one PR per framework feature). |
| D5 | **Dep-aware framework + dynamic workers**: NOT folded into per-submodule PRs. They remain as existing standalone plans and are this plan's strict prereqs. Leak audit is a parallel effort that gates the actual ship to Encore but does not block this plan's start. | Encore confirms framework-level changes can ship as their own PRs (separate from submodule PRs). |

---

## Delivery model (vertical + SOX) — applies AFTER verification gate clears

```
1 NM-XXXX Jira ticket
  = 1 feature branch (feature/NM-XXXX-short-description) in Encore-Global
  = 1 PR against develop
  = 1 submodule's complete test-case-quality upgrade
  = 1 reviewer-approved merge
```

The framework repo (`encore_framework`) stays the source of truth (page objects, selectors, specs, plans). The Encore-Global repo receives shipped artifacts via per-ticket feature branches. Framework-repo branching stays unconstrained internally; SOX rules bind the **delivery** repo.

### Definition of "100% done" per submodule (until Jira refines / Encore confirms)

For one submodule:
1. **Dep-gate migration applied** to that submodule's specs (per existing dep-aware subplans).
2. **All in-scope test cases pass** on CI.
3. **Leak audit clean** for files under that submodule.
4. **Story-pointed** in PR description (1/2/3/5/8/13/21).
5. **PR template filled**: ticket reference, summary of what+why, test evidence (CI run link or HTML report), reviewer assigned.
6. **No direct commits** to `develop`.

Items 1–3 = work content. 4–6 = SOX evidence.

### One-ticket cycle — DEFERRED until Encore answers

The cycle commands previously drafted here had a structural defect (`scripts/ship-client.sh:40` does `rm -rf "$OUT"`, which would nuke the Encore-Global checkout if pointed at it — F4 in companion audit). Cycle to be:

1. **Dry-run** on a throwaway feature branch in `Encore-Global` BEFORE first publication.
2. **Confirmed shape (subject to Encore answers H1 repo URL + H2 directory layout)**: ship to `/tmp/encore-deliv-<date>/`, rsync contents (excluding `.git`) into the Encore-Global feature-branch checkout, `git add -A && git commit && git push`, `gh pr create --base develop`.
3. **Re-author** this section with verified commands once H1+H2 are answered (H4+H5 dropped from question list 2026-05-07 — CI ownership = their problem; secrets = auto-user already given). Update [`SHIP_TO_ENCORE.md`](../../clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) in the same change.

Until then: NO cycle execution. NO branch creation in `Encore-Global`. Plan A's submodules sit ready-to-ship internally, in queue.

---

## SOX rules to encode (AFTER verification gate clears, not before)

In `clients/encore/CLAUDE.md` (Encore-specific; follows existing LR-ENC-NNN pattern; LR-ENC-001 already present):

### LR-ENC-002 — placeholder

Body to be drafted from H6 (SOX scope for test code) answer post-Encore-call. H7 (branch protection / CODEOWNERS) + H8 (bug filing channel) + H9 (communication channel) dropped 2026-05-07 — first PR surfaces required reviewers/checks; bug filing already in Jira; communication channel not a ship-blocker. Pre-baked clauses (1-ticket-1-PR per Rutvik discipline; "ship only things tracked in Jira") are workflow rules regardless of H6 outcome. Earlier draft removed 2026-05-06 to prevent foot-gun copy-paste before the call.

### LR-ENC-003 — placeholder

Body deferred. Story-point applicability question (was L5) dropped 2026-05-07 — defaults: tag plan + PR with our estimate, revise per Encore feedback. LR-ENC-003 likely becomes a one-line discipline note rather than full ceremony if defaults hold. Earlier draft removed 2026-05-06 — no rule encoded into `clients/encore/CLAUDE.md` until call answers.

> Both rules deferred until H6 answered in the Encore call (H7/H8/H9 + L5 dropped 2026-05-07 under the cleanse). Drafting from assumption was the F5 foot-gun called out in the audit.

---

## When picked up: execution shape (high-level)

After the two strict deps ship AND the Pre-Execution Verification Gate clears, the work-shape for this plan is:

1. **Encode rules**: add LR-ENC-002 + LR-ENC-003 to `clients/encore/CLAUDE.md` (revised per Encore-call answers).
2. **Update ship runbook**: rewrite `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` for the Encore-Global PR flow (replace JBS-handoff section).
3. **Brand existing dep-aware subplans**: add `nm_ticket: NM-XXXX` and `story_points: N` to the 5 existing dep-aware subplans' frontmatter as Jira tickets are confirmed. No body changes.
4. **First submodule PR**: likely `setup/locations/location-currency` (pilot subplan ready, golden-reference) — but Encore's Jira list may dictate a different first ticket. Then dependency chain: read-heavy → state-heavy (incl. `location-local-information` per Rutvik's example) → remaining.
5. **`plans/INDEX.md` update**: surface the per-submodule queue ONLY when execution starts — NOT now (per Rutvik's explicit instruction at save-time).

No file edits at the time this plan is saved. All work above is dormant until the deps ship AND the verification gate clears.

---

## Slop check (what we ARE / AREN'T doing)

**ARE doing (when execution begins, not now):**
- Two LR-ENC entries in `clients/encore/CLAUDE.md` (single home), revised per Encore-call answers.
- Edits to `SHIP_TO_ENCORE.md` (stale runbook would mislead).
- Per-submodule plan wrappers, lazy-created as Jira tickets confirm.

**NOT doing — ever (per /slop + /simplify):**
- Pre-push or pre-commit hook for Jira-ID enforcement (discipline first; hook only if discipline fails twice).
- New `.claude/rules/sox-*.md` cross-cutting file (single-client today; promote later if needed).
- Per-spec ticket metadata (frontmatter on the plan suffices).
- New skill, new agent, new pipeline stage.
- Automated reviewer assignment (manual until pain shows up).
- Branching changes in `encore_framework` repo (source-of-truth repo stays flexible; SOX binds delivery repo only).
- INDEX.md edit at save-time (deferred to execution per Rutvik's explicit instruction).
- Edits to existing horizontal plans / subplans at save-time.
- **Executing without the verification gate clearing** (top of file) — this is the biggest "not doing."

---

## Risks

| Risk | Mitigation |
|------|------------|
| **Plan executes on assumptions, not facts** — biggest risk | L2-FROZEN banner + 3 HIGH-Q gate. HALT if any HIGH-Q unanswered. |
| Discipline drift — someone commits without NM-XXXX | LR-ENC-002 (when authored post-call) referenced in every plan; first violation triggers hook proposal. |
| Encore-Global access is per-user (Rutvik's account) — Claude can't push from CI | All Encore-Global git ops go through Rutvik or a service account; agent runs never auto-push to delivery repo. **GitHub access continuity** is its own dependency — if the account access changes, the channel breaks; backup access path needed. |
| Repo layout wrong → first PR is messy | H2 in question list; treat first submodule PR as layout discovery; iterate runbook after merge. |
| Horizontal subplans were sized as one PR; per-submodule PRs may be smaller-than-expected | Story points expose this — break large items down before ticket creation. |
| **CODEOWNERS / branch protection / required CI checks** in target repo may force reviewers / status checks we haven't met | First PR will surface the requirements (H7 dropped from questions 2026-05-07 — accepted as discoverable-on-first-PR). |
| **Env divergence** — specs pass on `cloudapps-e2e.encoreglobal.com` (our env) but Encore CI may run a different env (their internal) | First red CI run surfaces env mismatch as "wrong env" not real bugs (M2 dropped from questions 2026-05-07 — their CI, their problem). |
| **Existing test code in target repo** may merge-conflict with our ship | Resolve at first PR by either rebasing or replacing depending on what's there (M1 dropped from questions 2026-05-07 — discoverable on first clone). |
| **Plan A produces ready-to-ship submodules but Plan B stays frozen** — submodules sit in queue with no push channel | By design. JBS mock channel (`RutviK-JBS/encore_deliverables_test`) remains as fallback for internal QA cycles while waiting. Encore call cadence is the unfreeze trigger. |
| **Allure / artifact retention** policy mismatch | LOW-priority Q; default 30-day retention, adjust if Encore policy differs. |

---

## References

- Encore SOX Compliance Reference (Kevin Carroll, 2026-05).
- Encore Branching & Pull Requests (Kevin Carroll) — Gitflow https://nvie.com/posts/a-successful-git-branching-model/
- Encore Story Point Estimation (Kevin Carroll).
- `clients/encore/CLAUDE.md` (existing LR-ENC-001).
- `clients/encore/docs/MODULE_REGISTRY.md`.
- `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md`.
- Existing plans: `plans/pending/PLAN_DELIVERABLE_LEAK_AUDIT.md`, `plans/pending/PLAN_DYNAMIC_WORKERS.md`, `plans/pending/PLAN_DEPENDENCY_AWARE_FAILURE.md` + 5 dep-aware subplans.
- Memory: `project_encore_deliverable_channel.md` (now stale post-D1; update only when execution begins, not at save-time).
