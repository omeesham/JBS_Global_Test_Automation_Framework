> 🤖 **SESSION BOOTSTRAP — invoke with `/execute PLAN_ENCORE_FULL_DELIVERABLE_RESHIP.md`. All context below.**
>
> 1. **Identity**: OWNER (ship tooling is OWNER-owned; the actual push is Claude-only per LR-049 — never a worker/subagent).
> 2. **Skills**: /execute (orchestrator), /regression-guard (wrap the pre-ship commit), /final-q (exit).
> 3. **Model/Thinking/Permission**: opus-4-8 / hi / auto.
> 4. **Dependency gate**: the corporate-pricing split commit `5f47f64e` must be HEAD-reachable (it is). The parallel locations-cleanup changes must be on disk (they are, uncommitted).
> 5. **Browser tool**: none — no live app.
> 6. **HALT + ASK** if: any per-branch deny-list gate exits non-zero, force-with-lease is rejected (remote tip moved unexpectedly), or a branch's isolation proof shows cross-contamination.

**Status**: DONE
**Executed**: 2026-07-08
**Priority**: High
**Created**: 2026-07-08
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

# PLAN — Full re-ship of ALL Encore deliverable branches

## Context

The parallel session finished a deliverable-code cleanup (net −76 lines: dead/unused removal across
`src/data/locations/location-local-info.ts`, `location-management-history.ts`, `location-shared-setup-locations.ts`,
`src/pages/locations/location-local-info.page.ts`, `src/types/index.ts`, `src/utils/auth-storage.ts`, plus
`tsconfig.json` +2 / `playwright.config.ts` −1). These live in **shared / base code** that `git archive HEAD` ships
**whole on every branch** (`ship-branch.sh` trims only `tests/` by surface + the workbook by module; `src/` and root
config ship intact). Therefore every one of the 8 deliverable branches' shipped content changes — the re-ship is
**all 8**, not just the 3 new ticket branches. My corporate-pricing ticket-submodule split is already committed
(`5f47f64e`); its Phase-H push was intentionally held for exactly this moment.

**User directives (this session)**: "push ALL deliverables = tickets + locations"; "no need to check, just push
properly" (no correctness re-verification of the parallel changes — the ship pipeline's own deny-list gate + isolation
proof still run, as they are ship-correctness, not code-correctness); "commit and push, use ultraagents … to speed up".

## The 8 branches (from `scripts/ship-branch.sh` presets)

| Branch | `--modules` | `--surface` (tests/ trim) |
|---|---|---|
| notes | LOC.NTS | `location-notes*` |
| ssl | LOC.SSL | `location-shared-setup*` |
| legal | LOC.LGL | `location-legal*` |
| account-address | LOC.ACC | `location-account-address*` |
| corporate-pricing | CPR | `corporate-pricing/**` (all 4 CPR specs + all 9 CPR sheets) |
| nm2262 | CPR.LEX | `corporate-pricing-loc-export*` |
| nm2264 | CPR.EXA | `corporate-pricing-export-all*` |
| nm2305 | CPR.LIM | `corporate-pricing-loc-import*` |

Remote: `encore-mock` = `https://github.com/RutviK-JBS/encore_deliverables_test.git`.

## Steps

### 1 — Pre-ship commit (ship archives HEAD, so all deliverable changes must be committed first)

- `/regression-guard` BEFORE snapshot on the parallel-touched files.
- Stage **only** the parallel deliverable-code changes (the 8 files above) + fold in the deferred split
  activity-log row. Author an activity-log row for the parallel cleanup if the parallel session left none
  (LR-028 + LR-037 timestamp gate).
- **Exclude** the pre-existing/foreign dirty files: `.claude/settings.local.json`,
  `_migration_global_claude/…`, `clients/encore/CLAUDE.md` (agent-only, does not ship), and the untracked
  `.playwright-cli/*`, closure-manifests, `plans/done/SUBPLAN_CORP_PRICING_NM2262_*`, `PLAN_PW_CONFIG_HARDENING.md`.
- `tsconfig.json` + `playwright.config.ts` are human-only HARD_STOP paths — stage the parallel session's existing
  edits (not authoring new ones) and **surface both diffs to the user** in the commit report.
- Gate handling: the pre-existing activity-log anti-backdating FP + the SP-AAE-02 field-inventory FP will re-fire
  (the split re-touched shared files). If they block, use the SAME scoped `--no-verify` the user authorized for
  `5f47f64e`, with the substantive deny-list hand-verified green on the staged set first. Otherwise commit clean.

### 2 — Per-branch dry-run (deny-list gate — NON-negotiable, must exit 0 on a clean extract)

For each of the 8 branches: `bash scripts/ship-branch.sh --branch=<b>` (no `--push`). Confirm
`[ship-branch] deny-list clean` + exit 0. Any non-zero → **HALT** (do not push that branch).

### 3 — Push (Claude-only per LR-049; force-with-lease against the live tip)

For each branch that passed step 2: `bash scripts/ship-branch.sh --branch=<b> --push`. `ship-branch.sh` fetches the
live tip and pushes `--force-with-lease` (refuses if the remote moved). Sequential; the push is a Claude operation,
**never** delegated to an `/ultra-agents` worker (LR-049). (Delegation note: the 8 pushes are fast sequential
Claude-only git ops — there is nothing a worker may do here, so `/ultra-agents` adds no speed; it would only apply to
an optional adversarial pre-push plan review, which this plan file + the already-completed council design review cover.)

### 4 — Isolation + shared-consistency proof

- **Per-ticket isolation** (spec-glob + workbook-sheet): each of nm2262/nm2264/nm2305 carries only its own spec +
  sheet; corporate-pricing carries all 4 CPR specs + 9 CPR sheets; each locations branch carries only its own
  `location-*` spec(s). (Already proven for the 3 CPR ticket branches this session; re-confirm post-push.)
- **Shared consistency**: the 8 parallel-cleaned files are byte-identical across all 8 branches (SHA256), proving the
  shared cleanup shipped uniformly.

### 5 — Closure

- Flip `SUBPLAN_CORP_PRICING_TICKET_SUBMODULE_SPLIT.md` to DONE (its Phase-H push has now landed) — Execution Summary,
  `git mv` to `done/`, `npm run plans:reindex`, parent-cascade annotation on `PLAN_CORP_PRICING_JIRA_DELIVERY`.
- Flip THIS plan to DONE with an Execution Summary listing the 8 pushed branch tips.
- Activity-log rows (LR-028); `/final-q` exit.

## NOT touched

- No spec/page-object/data logic edits (this is a ship, not a code change). The one exception already handled is the
  out-of-scope stale-comment chip (`task_93e05386`) — NOT folded into this ship.
- Foreign dirty files (listed in Step 1) stay unstaged.
- `notes` / `ssl` / `legal` / `account-address` specs are unchanged; they re-ship only because shared `src/` changed.

## Verification (acceptance)

- [ ] Pre-ship commit contains ONLY the 8 parallel files + activity-log; foreign files excluded (`git show --stat`).
- [ ] All 8 branches: `ship-branch.sh --branch=<b>` (dry-run) → `deny-list clean` + exit 0.
- [ ] All 8 branches pushed `--force-with-lease` (no lease rejection).
- [ ] Isolation proof: each ticket branch = own spec+sheet; shared 8 files SHA256-identical across branches.
- [ ] Split subplan + this plan flipped DONE; reindex clean (0 DONE-in-pending); activity-log rows present.

## Risks

- **Force-with-lease blast radius** — mitigated: lease refuses if the remote tip moved since fetch; deny-list gate
  precedes every push; dry-run first.
- **Shipping unverified shared-code changes** — user explicitly waived correctness re-check ("no need to check");
  recorded here so the waiver is on the record (LR-059 deviation, user-authorized).
- **Gate FPs re-fire on commit** — handled via the authorized scoped `--no-verify` with the deny-list hand-verified
  green first (same as `5f47f64e`).

## Execution Summary

**Executed**: 2026-07-08 (OWNER). All 8 deliverable branches re-shipped to the mock after the parallel dead-code
cleanup landed.

- **Pre-ship commit** `a3328f15` — the 8 parallel dead-code-cleanup files (net +16/−80: `auth-storage.ts`,
  `types/index.ts`, `tsconfig.json`, `playwright.config.ts`, `location-local-info` page+data,
  `location-management-history`, `location-shared-setup`) + the deferred activity-log rows. Foreign dirty files
  (`.claude/settings.local.json`, `_migration_global_claude/…`, `clients/encore/CLAUDE.md`) excluded. `--no-verify`
  (user-authorized) for the pre-existing anti-backdating log FP; deny-list hand-verified clean on the staged set.
  Per user directive, the parallel work's correctness was NOT re-tested (typecheck was already green per its log).
- **Dry-run** — all 8 branches `ship-branch.sh --branch=<b>`: deny-list clean, exit 0.
- **Push** — all 8 `--push` force-with-lease, deny-list clean each, no lease rejections. Remote tips: notes
  b9e13b3e / ssl 935a7cce / legal 31e1823e / account-address 596dfc27 / corporate-pricing 97cc9328 /
  nm2262 012b0203 / nm2264 490eb338 / nm2305 127ec75b.
- **Proof (on remote)** — surface isolation: each locations branch carries only its own `location-*` spec; each
  nm-branch exactly one ticket spec; corporate-pricing carries all 9 CPR specs. Shared consistency:
  `src/utils/auth-storage.ts` + `src/types/index.ts` SHA256-identical across all 8 branches; dead code confirmed
  removed.
- **TCs**: none (this is a ship, not a code change).
- **HARD_STOP config note**: `tsconfig.json` (+`*.ts` to include) and `playwright.config.ts` (−unused import) were
  the parallel session's edits, staged (not authored) and surfaced to the user.

**Delegation receipt**: 0 Claude Agent spawns; the push is Claude-only per LR-049 (never delegated to a worker).

## Addendum (2026-07-08) — completeness correction

**This plan's original title/Context/Execution Summary claimed "ALL deliverable branches" / "all 8" were re-shipped.
That was WRONG.** The mock (`RutviK-JBS/encore_deliverables_test`) carries **14** deliverable branches, not 8 —
`scripts/ship-branch.sh` simply had no presets for the other 6, and this plan conflated "the 8 presets" with "all
branches" without checking `git ls-remote`. User caught the miss. The corrective ship (6 branches — `auto-addon`,
`left-panel-basic-info`, `locations`, `nm2260`, `nm2261`, `nm2263`) landed the same day, tracked in the activity-log
row below. `corporate-pricing` aggregate was deliberately HELD (not re-pushed — user directive) since it was already
current.

Corrected final state — all 14 branches carry the dead-code cleanup as of this addendum:

| Branch | New tip (post-addendum re-ship) |
|---|---|
| notes | b9e13b3e (unchanged, already current) |
| ssl | 935a7cce (unchanged, already current) |
| legal | 31e1823e (unchanged, already current) |
| account-address | 596dfc27 (unchanged, already current) |
| corporate-pricing | 97cc9328 (unchanged, already current — HELD, not re-pushed this round) |
| nm2262 | 012b0203 (unchanged, already current) |
| nm2264 | 490eb338 (unchanged, already current) |
| nm2305 | 127ec75b (unchanged, already current) |
| auto-addon | f467efbd (re-shipped) |
| left-panel-basic-info | a7e985c (re-shipped) |
| locations | 3e56e9d (re-shipped) |
| nm2260 | 13af634 (re-shipped) |
| nm2261 | b675842 (re-shipped) |
| nm2263 | e2d9354 (re-shipped) |

Verified post-addendum: all 14 branches' `src/utils/auth-storage.ts`, `src/types/index.ts`, `tsconfig.json`,
`playwright.config.ts` are blob-identical to HEAD (force-fetched `+refs/heads/*:refs/remotes/encore-mock/*` — a
non-force fetch silently keeps stale tracking refs for any branch rewritten via `--force-with-lease`, which nearly
produced a false STALE reading during this verification); the 6 re-shipped branches pass surface isolation (own
spec-set only) and the forbidden-path leak scan (clean).

**Lesson (for `/reflect`)**: a re-ship's branch set must be verified against `git ls-remote --heads <mock-remote>`,
never against `scripts/ship-branch.sh`'s preset list alone — the preset list is a convenience cache, not the source
of truth for "which branches exist." Separately: any post-push verification via local git refs MUST force-fetch
(`+refs/heads/*:...`), or a rewritten branch reads as stale when it isn't.
