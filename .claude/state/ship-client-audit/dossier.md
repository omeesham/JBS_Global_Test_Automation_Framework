# ship-client.sh — evidence dossier + proposed disposition (FOR ADVERSARIAL REVIEW)

Date: 2026-07-28. Author: Claude (Anthropic). Reviewer must be non-Anthropic (cross-family).
Repo: C:\Users\RutvikKhorasiya\projects\encore_framework

## The observed symptom

`scripts/ship-client.sh:34` runs `node scripts/verify-no-forbidden.mjs --client="$CLIENT"` under
`set -euo pipefail`. For encore it exits 1 (453 tracked-but-deny-listed files), so the script aborts
before its `git archive` step at line 54.

## Q1 — Every reference in the repo (machine-enumerated via ripgrep for `ship-client|client:ship`)

LIVE WIRING:
- `package.json:79` — `"client:ship": "bash scripts/ship-client.sh"` (the npm entry point)
- `scripts/ship-client.sh` (76 lines) and `scripts/ship-client.ps1` (58 lines, PowerShell twin;
  same pre-flight at its line 29, same `$LASTEXITCODE` abort at line 30)

DOCTRINE / DOCS naming it as THE ship path:
- `CLAUDE.md:154,157` — "Ships via `npm run client:ship`"; "Ship discipline: NEVER `cp -r`. Always `npm run client:ship`."
- `.claude/rules/pipeline.md` LR-049 (~line 412) — "Client deliverables ship through one and only one path"
- `.claude/doctrine-ledger.json:483` — LR-049 `"enforced_by": "scripts/ship-client.sh:34"` — the ledger
  names the EXACT line that always fails.
- `BUNDLE_MANIFEST.md:20`, `.claude/agents/RUTVIK.agent.md:18`
- `scripts/check-doc-script-parity.test.mjs:29,35` — a test asserting the doc reference exists
- `scripts/check-shared-deps.mjs:55` — comment only
- `scripts/ship-branch.sh:5`, `scripts/xlsx-trim.mjs:5`, `.claude/context/navigation.md:74` — all say the
  per-module tooling must NEVER be wired into `client:ship` (i.e. they treat client:ship as the real path)
- ~30 plan files under `plans/pending/` and `plans/done/`

CI: **none.** `.github/workflows/` does not exist on disk and `git ls-files .github/` returns empty.
`ship-smoke.yml` (which ran `npm run client:ship ... --out=./_ship-test`) last appears at `f99eed76`
(2026-05-19) and is gone from HEAD. So no CI job is currently red because of this.

## Q2 — When it started failing, and what caused it

Method: for each commit, apply THAT commit's `DENY_GLOBS` to THAT commit's
`git ls-tree -r --name-only <sha> -- clients/encore/`. Script: scratchpad `replay.sh`.

| commit | date | subject | tracked | offending | verdict |
|---|---|---|---|---|---|
| a14d5c5c | 2026-05-01 | ship-client.sh born | 90 | 0 | PASS |
| 98169cbf | 2026-05-04 | F1-F26 remediation | 118 | 0 | PASS |
| 8f0026df | 2026-05-11 | root cleanup | 117 | 0 | PASS |
| f99eed76 | 2026-05-19 | notes-latest snapshot | 97 | 0 | PASS |
| ab9b4a3f | 2026-05-27 | xlsx Phase B | 102 | 0 | PASS |
| 994e80c9 | 2026-06-05 | pre-restructure baseline | 107 | 0 | PASS |
| 45be5528 | 2026-06-08 | broaden deny-list to whole docs/ | 159 | **53** | FAIL — all 53 are `specs_planning/**`, ZERO are `docs/` |
| 4598416a | 2026-06-08 | restore Encore CLAUDE.md | 197 | 89 | FAIL |
| 592fc2bf | 2026-06-10 | block comment jargon | 116 | 0 | PASS |
| 4a24e140 | 2026-06-26 | pc migration snapshot | 116 | 0 | PASS |
| **e0f63b32** | **2026-06-26** | **chore(migration): force-include work artifacts** | **431** | **315** | **FAIL — never passes again** |
| e6207ed0 | 2026-06-30 | drop GitHub workflow | 430 | 315 | FAIL |
| 3156c352 | 2026-07-09 | corporate-pricing | 460 | 327 | FAIL |
| 93a07763 | 2026-07-16 | trim04 | 461 | 328 | FAIL |
| 3608e32f | 2026-07-24 | gates enforcement wave | 588 | 446 | FAIL |
| HEAD | 2026-07-28 | — | 631 | 453 | FAIL |

All listed SHAs are ancestors of HEAD (`git merge-base --is-ancestor` = true for each). The PASS/FAIL
oscillation across 2026-06-08 → 2026-06-26 reflects parallel machine-snapshot lineages
("pc migration snapshot", "revert-SHA baseline"), not a fix; the durable break is **e0f63b32**.

**ROOT CAUSE = deliberate force-tracking of internal artifacts, NOT the `/docs/` deny-glob broadening.**
The `/docs/` broadening hypothesis is REFUTED by two independent facts:
1. At `45be5528` — the very commit that broadened the glob — all 53 offenders are `specs_planning/**`
   and zero are `docs/`. The broadening contributed nothing at the moment it landed.
2. Counterfactual on HEAD: delete `/\/docs\//` from `DENY_GLOBS` and re-run → **448 of 453 still offend.**
   Current HEAD breakdown: `specs_planning/**` 422, `docs/**` 5, `/CLAUDE.md` 1, `.env.local` 1,
   nested test-results artifacts 24. docs/ is 1.1% of the failure.

## Q3 — Is the `--client` failure a bug in the check, or intended behaviour?

**Intended, correct, and load-bearing. The check is not the defect.**

Its documented contract (`verify-no-forbidden.mjs:12`): "`--client=<id>` : git ls-files clients/<id>/ +
filter against DENY_GLOBS, fail if any match."

`git archive HEAD clients/<id>/` ships **tracked** files and ignores `.gitignore` entirely. So a
tracked-but-denied file is exactly a file that WILL land in the deliverable. Machine-verified on HEAD:

    git archive HEAD clients/encore/ | tar -t | grep -cE 'clients/encore/(specs_planning|docs)/'
    => 547

547 internal paths are inside the archive stream right now. The pre-flight is refusing a real IP leak.

**The asymmetry with ship-branch.sh explained.** `ship-branch.sh:142-143` does
`rm -rf "$SCRATCH/docs" "$SCRATCH/specs_planning" ...` immediately after its archive, then verifies a
clean re-extract at line 277. It *repairs the payload*. `ship-client.sh` has **no removal step at all** —
line 54 archives straight into `$OUT`. So the two scripts are not asymmetric by oversight in the check;
they are asymmetric in the pipeline. `ship-branch.sh` was written 2026-06-11, i.e. AFTER internal
artifacts began being force-tracked, and its `rm -rf` exists precisely because `git archive` carries them.
`ship-client.sh` was written 2026-05-01, when nothing internal was tracked (90 files, 0 offenders), so it
never needed a removal step — and never grew one when reality changed.

Note ship-client.sh's own post-flight at line 57 (`--target="$OUT"`) would also catch the leak, but only
AFTER extracting 547 internal files to disk. The line-34 pre-flight is the fail-fast of the same condition.

## Q4 — Did any recorded run ever use it?

**Yes — it ran green at least twice, both inside the PASS window, and it is already recorded as broken.**

GREEN runs:
- `plans/done/PLAN_CLIENT_DELIVERABLE_REBUILD.md:1107` — "H3 Idempotency | PASS —
  `diff -r ... /tmp/encore-d1 /tmp/encore-d2` returns exit 0 (byte-identical shipped output across
  consecutive `npm run client:ship` runs)." (2026-05-01 era; replay says PASS.)
- `plans/done/PLAN_UNIFIED_MATSUMOTO_2026_05_19.md:426` — "Check 9: `npm run client:ship --client=encore
  --out=/tmp/encore-dryrun --force` — 84 files shipped via `git archive`". (2026-05-19; replay says PASS
  at f99eed76, tracked=97.)

ALREADY-RECORDED BREAKAGE (independent corroboration of the replay):
- `plans/done/SUBPLAN_CORP_PRICING_NM2271_GRID_EQUIPMENT_LABOR.md:449` — "**A5 — `npm run client:ship --
  --client=encore` currently ABORTS.** Its `verify-no-forbidden --client=encore` pre-flight exits 1 on
  **328** tracked agent-only files under `clients/encore/`. Pre-existing as of sync commit `3d43c6e`;
  the gate is correctly refusing an IP leak. Owner decision required — deliberately not touched here."
  328 matches the replay exactly at 93a07763 (2026-07-16).
- `clients/encore/specs_planning/_internal/agent-activity-log.md:149` (2026-07-21) repeats the same
  FLAGGED-FOR-OWNER finding with the same 328 count.

NOT-a-run: `SUBPLAN_TRIM_04`/`TRIM_06` record the ship smoke as DEFERRED because the working tree was
dirty. That is truthful but tells us nothing about line 34 — the dirty-tree check at line 25 exits 3
first, so those runs never reached the deny-list.

## Proposed disposition (ATTACK THIS)

**REPAIR, not delete, not leave.** Reasoning:
- DELETE is wrong: LR-049, CLAUDE.md, the doctrine-ledger, and ~30 plans all name `client:ship` as the
  single blessed full-client ship path. `ship-branch.sh` only does per-module pushes to the Encore mock
  and is explicitly documented as never-a-substitute. Deleting leaves the framework with no full-client
  ship path and orphans a doctrine rule.
- LEAVE is wrong: the doctrine-ledger asserts LR-049 is `enforced_by: scripts/ship-client.sh:34` — a line
  that has been unreachable-green for a month. A rule whose named enforcer always aborts is a false green.
- The index must NOT be "fixed": `git rm --cached` on the 422 specs_planning files would undo e0f63b32's
  deliberate force-include, which exists so colleagues receive work artifacts through the team-remote path.
  Destroying that to satisfy a ship gate is the wrong trade.

Proposed change: give `ship-client.sh` (and `.ps1`) the deny-path removal step `ship-branch.sh` already
has — archive, strip the deny-listed paths from `$OUT`, then run the existing `--target` verification,
which is the check that asks the right question (is the PAYLOAD clean?) rather than the wrong one
(is the INDEX clean?).

## Questions the reviewer MUST answer (attack each; default to REFUTED if unproven)

1. Is "root cause = force-tracking (e0f63b32), not the /docs/ broadening" actually established, or did I
   misread the replay? Re-run the replay yourself.
2. Is the 547-path `git archive` leak count reproducible? Re-run the command.
3. Does removing/demoting the line-34 pre-flight weaken any gate that nothing else covers? Specifically:
   is `--target` at line 57 a strictly stronger check than `--client` at line 34 for the shipped payload,
   or is there a class of leak `--client` catches that `--target` cannot?
4. Does adding an `rm -rf` inside `$OUT` create the hazard flagged in
   `plans/pending/PLAN_VERTICAL_DELIVERY_SOX.md:153` (F4 — `rm -rf "$OUT"` could nuke a real checkout if
   `--out` is pointed at one)? Does the proposed change make that worse?
5. Is there a fourth option I have not considered that beats repair?
6. Anything in this dossier that is asserted without machine evidence — name it.
