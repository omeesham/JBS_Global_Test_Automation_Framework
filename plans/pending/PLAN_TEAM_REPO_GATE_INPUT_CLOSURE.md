# PLAN_TEAM_REPO_GATE_INPUT_CLOSURE

**Status**: PENDING (P1–P5 executed 2026-08-12; open items listed in the Execution Log below)
**Created**: 2026-08-12
**Owner intent (verbatim ask)**: "these problems their claude is getting, should never occur ever again in future pushes … find more things their claude would get stuck on in future! things we should have pushed to main repo but havent"
**Model**: Opus (P1/P2/P5 judgment + guardrail edits) / Sonnet allowed on P3/P4 mechanical rows
**Thinking**: standard; ultrathink only at the P2 gitignore flip decision
**PermissionMode**: default (guardrail-layer edits inside — each lands via normal commit gates, no bypass)
**BrowserTool**: none
**CoverageMode**: n/a (no TC authoring)

---

## Problem class (one sentence)

The team repo's commit gates read files that git ignores and run scripts that only exist on the
authoring machine, so every gate passes here and fails on any clone — the 2026-08-12 incident
(170 orphan TCs, four vocab findings, a colleague hard-blocked twice in one day) is one instance
of a class, not a one-off.

## Root causes (all three proven live on 2026-08-12)

1. **Ignore-trap**: `.gitignore:197` (`clients/*/specs_planning/`) swallows the knowledge tree;
   everything colleagues need arrives only by manual `git add -f`, and any missed force-add is
   invisible to every gate on the authoring machine (they read disk, not the index).
2. **Gate drift**: gate-layer files edited locally and not committed mean we validate with different
   rules than the repo ships (the xlsx-lint-rules fix sat uncommitted while the committed rules
   flagged our own pushed content).
3. **Advisory theater**: `check:untracked-knowledge` finds the gap (it listed today's missing files)
   but exits 0 on findings, so its `/push-repo` Step-2 slot enforces nothing.

## Found backlog — things their Claude WILL hit next (verified this session)

| # | Stuck-point | Evidence | Phase |
|---|---|---|---|
| B1 | `check-doctrine-ledger` exits 1 on origin/main itself — 2 uncovered LR-071 prescriptive rules committed 2026-07-31 (`guardrail-policy.md:140,168`). Their agent already hit it and had to hand-wave it as "unrelated". | reproduced against committed state with local edits stashed | P1 |
| B2 | Committed `scripts/xlsx-freshness.ts:160` tells the blocked user to run `npm run xlsx:build:with-run-json` — that script exists only in our dirty package.json. A colleague who follows the gate's own fix hint gets "npm missing script". | committed grep + dirty diff `+xlsx:build:with-run-json` | P1 |
| B3 | 21 tracked files dirty on our disk, including gate scripts (`check-tc-has-fieldinventory.mjs`, `walk-coverage/lib/coverage-manifest.mjs`, `verify-denominator.mjs`, `identity-ownership.mjs`), rules (`inventory.md` carries LR-072 the ledger will demand), skills, `AGENT_SHARED_RULES.md`, `closure-config.json`, and a client page object (`corporate-override.page.ts`, +22 lines colleagues don't have). Each is either an unshipped fix or sediment. | `git status` triage 2026-08-12 | P1 |
| B4 | 12 tracked case documents have no `## MCP_VERIFICATION_LOG` (corporate-pricing ×4, local-office ×2, locations ×6). Grandfathered only until someone stages a behavioural edit — then STRUCT-003 blocks a colleague who cannot honestly author a log for a walk they never ran. | `grep -L` sweep 2026-08-12 | P4 |
| B5 | 10 untracked `??` scripts under `scripts/` (check-worker-fabrication, validate-tcs, verify-approved-scope, walk-coverage libs, …). No committed file references them today (verified — zero dangling refs), but the next commit that cites one recreates B2. | ref-scan 2026-08-12 | P1 triage |
| B6 | Field-inventory freshness (14d) + owner-attested skip token are machine-local: a colleague editing an old module's md cannot pass without a fresh walk. Design intent, not a bug — but nothing in the repo tells them the walk-first path. | gate source read | P4 doc row |

## Phases

### P1 — Ship the backlog (no structural change, pure catch-up)
- [ ] Triage each of the 21 dirty tracked files: **ship** (commit with honest message) or **revert**
      (name why in the commit that follows). Zero files left dirty at phase end. The two decision
      defaults: gate-layer fixes ship; half-finished rule prose reverts to HEAD.
- [ ] B2: ship the package.json line so the freshness gate's printed fix works on clones.
- [ ] B1: add the 2 missing doctrine-ledger entries for LR-071 (plus LR-072's entry if
      `.claude/rules/inventory.md` ships in the triage). Acceptance: `node
      scripts/check-doctrine-ledger.mjs` exits 0 **with all local edits stashed**.
- [ ] B5: each untracked script either ships (referenced, tested) or moves to
      `.claude/state/_archive/` — per the deletion protocol, present the archive list to Rutvik.
- [ ] Push via `/push-repo` (full battery).

### P2 — Kill the ignore-trap at source (the structural cure)
- [ ] Verify first (NEVER ASSUME): confirm the client-ship layer (`delivery-manifest.encore.json` +
      deny-list + LR-049 archive path) excludes `specs_planning/**` regardless of tracked state —
      prove with a dry-run `npm run client:ship` payload listing. HALT to Rutvik if it does not.
- [ ] Replace `.gitignore:197` blanket ignore with targeted ignores of runtime state only (the
      per-client lines 204-214 already enumerate them: daily-status-bank, agent-activity-log,
      agent-performance, agent-metrics-report, test-id-registry, audits/*). Knowledge dirs
      (test-cases, test-plans, field-inventories, old-site-baseline, walk-evidence*,
      field-case-catalogs, jira-*) become normally tracked — no force-add ritual, `git status`
      shows them, the miss class dies at birth.
- [ ] One sweep commit adding the newly visible knowledge artifacts (expected bulk: the
      `check:untracked-knowledge` census, minus runtime state). Secret-sweep the batch with the
      /push-repo Step-3/4 greps before commit.
- [ ] `CLAUDE.md` repo-structure note + `.claude/rules/pipeline.md` row updated to match.

### P3 — Make the closure check enforcing (smallest possible gate change, LR-069 rubric)
- [ ] Narrow mode for `check:untracked-knowledge`: `--enforce-gate-inputs` fails (exit 1) only on
      untracked files under the **gate-read classes** (test-cases md, test-plans md,
      field-inventories md) for modules that have committed specs; the 3,500-file bulk census stays
      advisory. No new scanner — a flag on the existing one.
- [ ] Wire that flag into `.githooks/pre-push` next to the freshness gate (fires on pushes touching
      specs/testcases/registry — same trigger pattern), announce-mode for 5 fires per LR-069 ramp,
      then blocking. Telemetry row to `gate-fires.log` on every fire.
- [ ] Add a **gate-drift tripwire** to `/push-repo` Step 2 (skill prose + one command): `git status
      --porcelain -- scripts/ .githooks/ .claude/rules/ export_test_cases/` must be empty or every
      line explicitly dispositioned in the push report. Costs one command; kills root-cause 2.

### P4 — Retire the grandfather debt (so B4 never ambushes a colleague)
- [ ] For each of the 12 log-less documents: if a tracked walk/field-inventory artifact for that
      module exists, backfill `## MCP_VERIFICATION_LOG` by transcription (same method as
      terms-conditions 2026-08-12 — observations only, unresolved rows marked not settled, dated to
      the source walk). Delegate transcription per module; CEO verifies each against its source
      artifact before staging.
- [ ] Modules with no walk artifact on the branch get an explicit `## MCP_VERIFICATION_LOG` header
      with a one-line pointer to the walk that must produce it — visible debt instead of ambush.
- [ ] Workbook impact check per batch: transcription must not change Steps/Expected content, so
      `xlsx:freshness` Check A must stay green without a rebuild. Any batch that dirties the
      workbook is scoped wrong — stop and re-read.
- [ ] B6: one README row in `specs_planning/test-cases/` naming the walk-first path and the
      skip-token's owner-only nature.

### P5 — Prove it for a stranger (the acceptance the whole class lacked)
- [ ] Fresh `git clone` into a temp dir (not this working tree), `npm ci`, then: full gate battery
      (`check:tc-parity`, `check:spec-quality` including doctrine-ledger, `check:step-labels`,
      `xlsx:freshness`, `lint:testcases`, `xlsx:lint`) — all must exit 0 with zero local edits.
- [ ] Rehearse the colleague path on the clone: stage a whitespace-plus-real-word behavioural edit
      to one case md per module family, confirm pre-commit passes or fails only on the *intended*
      freshness rule, then discard.
- [ ] Record the rehearsal transcript as the plan's closure evidence. This re-run becomes a
      standing `/push-repo` Step-6b row: after any push that touches gate scripts, rules, or
      specs_planning, name the clean-clone proof or name that it was skipped.

## Anti-slop guardrails (what this plan deliberately does NOT do)
- No new scanner, no wrapper: P3 is a flag on the existing check; P2 deletes a rule instead of
  adding a compensating one (fix at source, not through a wrapper).
- No gate weakening anywhere: nothing in any phase lowers what a gate asserts — B1 adds ledger
  entries, it does not exempt rules; P4 adds evidence, it does not relax STRUCT-003.
- No blanket force-add: P2's sweep commit is enumerated and secret-swept, not `git add -f -A`.
- Retirement: once P2+P3 land and fire clean twice, the `/push-repo` prose warning about
  force-adds is obsolete — delete it in the same commit that flips P3 to blocking (never keep both).

## Execution Log — 2026-08-12

Executed the same day it was authored. Pushed across origin/main `79bfe976d..293128e2c`.

**P1 — backlog shipped.** All 21 dirty tracked files dispositioned (every one SHIP; nothing
reverted) plus the 10 untracked guard scripts. Landed as: the LR-072 CoverageMode wave (19 files),
three gate-satisfiability fixes, the corporate-override skeleton-row race fix, and the guard-script
batch. B1 closed — the doctrine ledger now adjudicates the two LR-071 reason-string rules as an
honest UNENFORCED S1 (their emitters exist at `check-interaction-coverage.mjs:264/:815` but the
script is wired to no entrypoint; recipient named) and anchors LR-072 to
`validate-plan-closure.mjs:811`; `check-doctrine-ledger` exits 0 on a clean clone. B2 closed —
`xlsx:build:with-run-json` shipped, so the freshness gate's printed fix works for a colleague.
B5 closed — every untracked script tracked; none needed archiving.

**P2 — ignore-trap killed.** Ship-exclusion proved FIRST (run `gic-ship-proof-0812`): deny-glob at
`forbidden-patterns.mjs:23`, the staging-delete loop in `ship-client.sh:71-74`, and two post-ship
verification gates, all independent of git state. Raw archive carries 316 `specs_planning` entries;
283 are files and all 283 are on the exclusion list — the delta is exactly 33 directory entries,
reconciled by the dispatcher from the worker's own artifacts. `.gitignore:197` replaced with a
comment recording why it died; 49 hidden knowledge artifacts swept in; one personal account
identifier redacted where the commit deny-list caught it.

**P3 — closure gate live.** `--enforce-gate-inputs` added to the existing checker (no new scanner),
wired into pre-push behind `untracked_gate_inputs_mode` (announce; telemetry to `gate-fires.log`;
deny after 5 clean pushes). Live-fired both directions before commit. The `/push-repo` gate-drift
tripwire landed under a Rutvik-approved, path-scoped, 15-minute grant — and caught real drift on
its first run (two test files whose subjects were tracked without them).

**P4 — grandfather debt retired, and it was bigger than scoped.** All 12 documents now carry a
verification log; 10 transcribed from dated walk artifacts, 2 (locations legal, locations local
information) carrying an honest no-artifact header because none exists. Staging them exposed that
all 12 also lacked `## Validation Rules` and 4 lacked `## FIELD INVENTORY` — pre-existing in every
HEAD version, invisible because the lint reads staged files only. Both backfilled; `N/A — <specific
reason>` used where sources documented nothing. Test-case lint: 0 errors on the staged set;
workbook byte-identical, freshness green without a rebuild.

**P5 — clone rehearsal green.** Fresh clone at `52862bc69`, `npm ci`, all 12 battery commands exit
0 with zero local edits; the dispatcher independently re-ran three of them inside the clone. Commit
path rehearsed (gates fired in order, then reset) and the untracked-plant trip reproduced exit 1.

**Two worker defects caught and bounced, neither shipped:**
1. `gic-log-backfill-0812` marked two modules no-artifact for "ambiguous scope";
   `walk-evidence-hist-ssl-acc-2026-06-02.md` names both in its section headings. Bounced, fixed.
2. `gic-struct-sections-0812` gave the export module a Year/Currency/Continue precondition dialog
   appearing in **zero** of the two artifacts that file cites — borrowed from the import module,
   whose own walk says the export variants were never exercised. Bounced; rows removed and replaced
   with a line recording that the export path's dialog is un-enumerated.

**Dispatcher error, disclosed:** a `git stash -u` run to test whether some lint errors predated the
work did not fully re-apply and briefly reverted a worker's 12 files. Restored each from the stash
blob, verified, dropped the stash; nothing lost. Do not use stash on this tree.

### Open — why this plan stays PENDING

- `untracked_gate_inputs_mode` is at `announce`; flip to `deny` after 5 clean pushes (ramp target
  2026-09-11). Until then P3 warns rather than blocks.
- 19 pre-existing `STRUCT-001` / `STRUCT-002` lint errors remain in files outside the 12 (notably
  `local_office_ect`), same grandfather class, found during P4. Not scoped here; whoever stages one
  next will hit it.
- `locations_legal` and `locations_local_information` still need a real walk to populate their
  verification tables — visible debt, recorded in the documents themselves.
- (the referenced worker report template does not exist at this path) deliberately left untracked: stray worker narration misfiled into
  `scripts/`, not repo material.

## HALT lines
- P2 ship-exclusion proof fails → HALT (client-leak risk outranks colleague convenience).
- Any P1 triage file whose diff mixes a shippable fix with unreviewable sediment → split or HALT;
  never ship a mixed diff to the guardrail layer.
- P4 transcription for a module whose walk artifact contradicts its case doc → stop that module,
  file the contradiction (LR-030), do not paper over.
