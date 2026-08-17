# PLAN — Staged per-ticket delivery of NM-2268 / NM-2269 / NM-2270 to the Encore deliverables repo

**Status**: SUPERSEDED (2026-08-14 — per-ticket delivery branches retired by Rutvik 2026-08-13; only `main` ships via `/push-encore-deliverables`. The `--branch=nm2268/69/70` instructions below describe a retired mechanism and must not be executed. Superseding context: PLAN_65_TICKET_ID_STRUCTURAL_NAMING_REMEDIATION + PLAN_66_DELIVERABLE_TRUTH_SWEEP; flagged by audit p66-p4-audit2-0814 defect 2.)
**Model**: Opus · **Thinking**: ultrathink · **PermissionMode**: default
**Owner identity**: OWNER (delivery ceremony + publishing are CLAUDE-ONLY)
**Depends on**: `plans/done/SUBPLAN_CORP_PRICING_NM2268_LOC_SEARCH.md`, `..._NM2269_OVERRIDE_FILTERS.md`, `..._NM2270_GRID_FILTERS.md` (all DONE, green ×2, pushed to `origin/main` 2026-07-20)

---

## GOAL

Prepare three delivery branches — `nm2268`, `nm2269`, `nm2270` — on the client-facing repo
`https://github.com/RutviK-JBS/encore_deliverables_test` (git remote `encore-mock`), each carrying
**only that ticket's scope**, so they can be released one at a time on Rutvik's explicit command.

**PUSH DISCIPLINE — the single most important line in this plan.** Nothing is pushed by this plan.
Every branch is prepared to a dry-run-verified state and then STOPS. A push happens only when
Rutvik types `push nm2268` (or `nm2269` / `nm2270`), and that command authorises **that one branch
only**. No batching, no "while I'm here", no inferring the next one.

---

## WHY THIS IS HARDER THAN IT LOOKS (the finding that shapes the whole plan)

**SOLVED (2026-07-20).** The original blocker: `ship-branch.sh` filtered at whole-file granularity
and `xlsx-trim.mjs` at whole-sheet, so three tickets sharing ONE spec file and ONE workbook sheet
could not be split. That limitation is gone. `scripts/spec-trim.mjs` slices a spec to a given
test-case range; `xlsx-trim.mjs --tcs=` filters workbook rows to match; `ship-branch.sh --tcs=` wires
both. Delivery is now a single command per branch — no local `delivery/*` branches, no hand-editing.

Historical context — all three tickets live in ONE spec file and ONE workbook sheet:

| Ticket | TC IDs | Location |
|---|---|---|
| NM-2268 | TC-CPR-OVR-039, 040, 041 | `corporate-pricing-override.spec.ts` |
| NM-2269 | TC-CPR-OVR-042, 043, 044 | same file |
| NM-2270 | TC-CPR-OVR-045, 046, 047, 048, 049 | same file |

So running the ship tool today on `nm2268` would ship **all three tickets' tests**. The tool cannot
solve this. The solution is to control **what the file contains at ship time** — build each delivery
branch from a reduced source state, then let the existing, proven tool do exactly what it already does.

---

## ESTABLISHED FACTS (recon-verified — do not re-derive)

Sources: `.claude/state/ua-worker/dlv-r{1,2,3a,3b,4,5,6,7}/`.

1. **Delivery precedent exists.** 16 branches already on the remote (`nm2260`–`nm2267`, `nm2305`,
   plus per-module branches). Each is a **standalone orphan commit** — no merge-base with `main` or
   with each other. Each carries the full framework snapshot; the only differentiator is which spec
   file(s) appear under `tests/`. (dlv-r7)
2. **Commit convention** — `Encore deliverable — <branch> module`, author
   `Encore Deliverable <deliverable@jade-biz.com>`, empty body, **no trailers**. `ship-branch.sh`
   produces this shape automatically; no framework history or `Co-Authored-By` reaches the remote. (dlv-r7)
3. **`nm2267` already carries** `corporate-pricing-override.spec.ts` with TC-CPR-OVR-001..038.
   Our branches extending that range is consistent with precedent — every branch is a full snapshot
   of its own spec file. (dlv-r7)
4. **Non-contiguous / out-of-order TC IDs are the established norm** on this remote (TC-OVR-023 and
   TC-LIM-008 are absent; TC-DET-037 sits after TC-DET-055). **The "numbering gap tell" concern is
   closed — it is not a tell in this repo.** (dlv-r7)
5. **`ship-branch.sh` dry-runs by default.** Without `--push` it prepares and verifies, then exits 0
   (`ship-branch.sh:148`). The remote is hardcoded to `encore-mock` (`:49-50`) — it cannot
   accidentally push anywhere else. This is our safety property. (dlv-r6)
6. **No CI, no PR template, no branch-naming rules** on the remote. Nothing to trip. (dlv-r1)
7. **`verify-no-forbidden --client=encore` exits 1** (328 forbidden tracked files) — this is NOT a
   blocker. `ship-branch.sh` purges `docs/` and `specs_planning/` from its scratch tree
   (`:100-101`) and gates on `--target=<clean re-extract>` (`:141`), which all 9 prior branches passed. (dlv-r6)
8. **The workbook is the biggest disclosure surface.** `encore_test_cases.xlsx` has 23 sheets with
   per-TC `Coverage Status` + `Automation Status` (including Blocked/Skipped reasons) plus an
   Overview sheet aggregating all 22 modules. `xlsx-trim.mjs --modules=CPR.OVR` reduces it to the
   override sheet + Overview, but **all 139 override rows survive** — including the other tickets'.
   The workbook is rebuilt from markdown by `xlsx:build`, so reducing the markdown reduces the sheet. (dlv-r4)
9. **The freshness gate rebuilds from markdown and diffs against the committed workbook**
   (`xlsx-freshness.ts:88-111`). Reducing markdown AND rebuilding the workbook keeps them consistent,
   so the gate passes. Reducing only one of them fails it. (dlv-r4)

---

## KNOWN LEAK SURFACES TO FIX PER BRANCH (dlv-r5)

| ID | Surface | Action |
|---|---|---|
| L-1 | `describe` block titles literally contain `(NM-2269)` and `(NM-2270)` | Strip the ticket ref from any describe that survives into an earlier branch |
| L-2 | `WALK_SORT_ORACLES` in `src/data/corporate-override/override.ts` is commented `(NM-2270)` and used only by TC-046/047/049 | Remove from branches that don't carry those tests; the dependency graph was in worker state and is not portable evidence |
| L-3 | TC-041's skip reason cites `NM-2126` | **Keep** — NM-2126 is the client's own Jira ID and TC-041 is in NM-2268's scope. Legitimate cross-reference, matches existing `NM-####` refs already shipped in other specs. |
| L-4 | Untracked junk in `clients/encore/` root — nested `clients/` dir, `*.png`, `review2-*.txt` | Delete or ignore before any ship; would ship if ever staged |

**NOT a leak, do not "fix":** TC-048 appearing after TC-049 in file order. Fact 4 establishes this is
normal here (TC-DET-037 does the same on an already-delivered branch). Reordering would be churn.

---

## DECISION MADE — cumulative snapshot, not a bare 3-test file

Rutvik's phrasing was "strip the specs and xlsx cases for that area". That admits two readings, and
the choice is load-bearing, so it is stated here rather than buried:

- **(chosen) Cumulative** — `nm2268` carries TC-001..041: everything already delivered, plus this
  ticket's three. Matches every existing branch on the remote (each is a full snapshot of its own
  spec file — `nm2260` carries all 55 detail TCs, `nm2267` carries all 38 override TCs). Reviewer
  sees a coherent, runnable file.
- **(rejected) Bare** — `nm2268` carries only TC-039..041. Would be a 3-test file inconsistent with
  every other branch, and would read as coverage having *shrunk* from the 38 already delivered on
  `nm2267`.

If Rutvik wants bare slices instead, only the TC ranges in Phases 1–3 change; the mechanism is identical.

## PHASES

### Phase 0 — Pre-flight (once, before any branch)

- [ ] Confirm working tree clean of unrelated changes; confirm `main` is the HEAD state that passed
      green ×2.
- [ ] Confirm `git remote -v` still shows `encore-mock` → `encore_deliverables_test`.
- [ ] The push itself runs via the `/push-encore-deliverables <branch>` skill (dry-run first, payload
      inspection, one branch per invocation). See the PUSH PROTOCOL section below.

### Delivery mechanism — one command per branch (no `delivery/*` branches)

`ship-branch.sh --tcs=<range>` does everything from `HEAD` in a scratch tree: slices the spec to the
range, filters the workbook rows to match, then dry-runs (no `--push`). Cumulative snapshot — each
branch carries TC-001 through its own ticket's last TC.

| Branch | Command (dry-run; add `--push` only on the owner's word) |
|---|---|
| `nm2268` | `bash scripts/ship-branch.sh --branch=nm2268 --modules=CPR.OVR --tcs=TC-CPR-OVR-001..041` |
| `nm2269` | `bash scripts/ship-branch.sh --branch=nm2269 --modules=CPR.OVR --tcs=TC-CPR-OVR-001..044` |
| `nm2270` | `bash scripts/ship-branch.sh --branch=nm2270 --modules=CPR.OVR --tcs=TC-CPR-OVR-001..049` |

Per branch: dry-run → inspect payload (right TC range, workbook rows match, no future-ticket `NM-`
string) → coverage-regression check vs `encore-mock/nm2267` (every already-delivered TC-ID still
present) → **HALT and await `push <branch>`**.

### Source-level pruning — ATTEMPTED and RETIRED (2026-07-20)

A per-ticket branch ships the page-object / selectors / data files **whole**. A general
reachability-based dead-code eliminator (`scripts/src-trim.mjs`) was built to strip future-ticket
helpers from shipped source, but it proved unreliable on this codebase — decorators, dynamic access,
and cross-file imports produced both wrong removals that broke `tsc` and missed-removals. **Owner
decision: ship the src tree whole.** Rationale: the client reviewer scrutinizes the workbook and spec
runs, not un-called page-object helpers; the genuine tells — future-ticket TEST CASES and
ticket-named CONSTANTS/COMMENTS — are already removed by `spec-trim` + `xlsx-trim` and a one-line
comment scrub, so no `NM-2269`/`NM-2270` string survives the payload. `src-trim.mjs` is left on disk
but its step in `ship-branch.sh` is disabled; re-enable only if rebuilt on a proven tool (knip/ts-prune).

### Phase 4 — Final combined refresh (DEFERRED — cannot be built yet)

Once all six tickets (our three + the colleague's three) are reviewed, refresh the full-module
`corporate-pricing` branch with the complete override spec. **Blocked on work that does not exist
yet.** Do not attempt. When the colleague's tickets land, this phase gets its own plan.

---

## PUSH PROTOCOL (the only way anything leaves this machine)

1. Rutvik types `push nm2268` (or `nm2269` / `nm2270`) — the literal branch name.
2. Re-run the dry run for that branch and confirm exit 0.
3. Run the identical command **plus `--push`**.
4. Verify: `git fetch encore-mock <branch>` then `git ls-tree -r encore-mock/<branch> --name-only`
   and confirm the spec's TC range.
5. Report the pushed tip SHA.
6. **STOP.** Do not touch the next branch. Authorisation was for one branch.

---

## ACCEPTANCE CRITERIA

- [ ] Three local `delivery/nm226{8,9,0}` branches exist, each dry-run verified at exit 0.
- [ ] Each branch's scratch output contains exactly its ticket's TC range and no later ticket's IDs
      or ticket-number strings — proven by grep against the scratch tree, not by assertion.
- [ ] Each branch typechecks and runs green before being considered ready.
- [ ] `git ls-remote encore-mock` shows **no** `nm2268`/`nm2269`/`nm2270` until Rutvik commands each push.
- [ ] Nothing pushed to `origin` by this plan.

---

## RISKS

- **Reduced spec fails green.** Removing tests can break shared setup. Mitigation: the depgraph drives
  removals, and green is a gate not a formality. If a branch can't go green, report it — do not ship red.
- **Workbook/markdown drift.** Reducing one without the other fails the freshness gate. Both, always.
- **Wrong-branch push.** Mitigated structurally: the remote is hardcoded, and `--push` is absent from
  every command in this plan except step 3 of the push protocol.
- **The `delivery/*` branches are local-only.** If one is accidentally pushed to `origin`, the
  colleague repo gets a truncated spec. Never push `delivery/*` anywhere.

---

## Execution Summary

_(to be completed at closure — LR-027)_
