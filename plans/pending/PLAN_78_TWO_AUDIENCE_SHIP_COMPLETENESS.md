> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_78_TWO_AUDIENCE_SHIP_COMPLETENESS.md`. All context below.**
>
> 1. **Identity**: OWNER for all phases except the Phase 4c test-case-MD reword, which adopts `/identity GIVER` before writing (the identity write-gate blocks OWNER writes to GIVER-owned artifacts inside `/execute`).
> 2. **Skills**: `/delegation-temp` + `/ultra-agents` (council dispatch), `/final-q` at exit. `/push-repo` only on Rutvik's per-instance GO.
> 3. **Model + thinking + permission-mode**: per frontmatter below.
> 4. **Dependency gate**: none blocking. PLAN_77 (citation deliverability) is the sibling — read its §Phases and §Plan-Deviations D5 before Phase 1; do not redo its work. PLAN_75/PLAN_68 are orthogonal (burn policy / TestRail format) — do not touch their scope or their in-flight working-tree files.
> 5. **Context load**: this file end-to-end + `.claude/skills/delegation-temp/SKILL.md` (§Fight-Protocol, §Dispatch, §Acceptance) + `.claude/skills/ultra-agents/worker-ext.md` + `.claude/rules/plan-closure.md` + `.claude/rules/guardrail-policy.md` (LR-069 §3.3/§3.5, LR-074) + `scripts/lib/forbidden-patterns.mjs`.
> 6. **Phase 0 FIRST** — reconcile the five already-dispatched evidence lots against the ledger before dispatching anything new.
> 7. **Zero-burn law**: dispatch → background → END THE TURN. Wake on notification. Batch every dispatch of a wave into one turn.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, activity-log row (LR-028/LR-037), git mv to done/, `npm run plans:reindex`, Receipt v3.
>
> **HALT + ASK RUTVIK** if: any fix would need a gate exemption, allowlist entry, or threshold change (council may RECOMMEND; only Rutvik authorizes) · any push (per-instance GO, always) · any deletion (archive-move + prune-check + per-item confirm only) · the Phase 3 GO batch itself · anything would touch `encore-mock` / `encore_deliverables_test` (never) · scope grows past the strata defined in §Completeness.

# PLAN 78: Two-Audience Ship Completeness — colleagues never blocked, client fence proven

**Status**: PENDING
**Priority**: P0 — colleagues were blocked 5+ times in one day; the owner called it shameful
**Created**: 2026-08-18
**Identity**: OWNER (Phase 4c adopts GIVER for test-case-MD writes — see Bootstrap 1)
**Depends on**: none (PLAN_77 sibling read-only input; its landed mechanism is extended, not redone)
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: multi-rule judgment across closure gates, client-fence S0 calls, per-item council adjudication, and Prior-Fix Trial verdicts — exactly the LR-041 class that requires max.
**PermissionMode**: auto
**BrowserTool**: none
**CoverageMode**: (not coverage-bearing — authors no TCs, runs no walks, cites no walk artifacts; Phase 4c rewords 6 existing Expected-Result sentences without changing any TC's coverage)

## Context

One repo, two audiences, opposite rules. `origin` (qa_agentic_framework_global) serves **colleagues**, who need everything — specs, plans, evidence, delegation tooling, shared automation credentials. `encore-mock` serves **the client**, who gets only shipped test code. Withholding from colleagues blocks them (5+ incidents in one day). Leaking to the client is trust-destroying on first occurrence (LR-069 S0).

Root cause, verified by execution this session: **gates resolve inputs against the filesystem; git carries only tracked files.** On the author's machine both halves exist and every gate is green; on a colleague's clone the untracked half is absent and the gate fails with no route out. The asymmetry is invisible from the author's side by construction. Five recurrences convict the reactive per-plan repair approach (LR-069 §3.5).

**What is already in flight** (goal g78 — five read-only evidence lots, dispatched before this plan):

| Lot | Ticket | Model | Charter | State at authoring |
|---|---|---|---|---|
| A1 | `.claude/state/ua-worker/chips/g78/tickets/a1-closure-gate-clone-census.md` | opus | closure gate over all 641 tracked plans in a detached worktree | running |
| A2 | `.../a2-npm-gate-battery-clone.md` | gpt-5.5 | the 49 npm gate scripts + 3 git hooks in a detached worktree | running |
| B | `.../b-client-overship-audit.md` | gpt-5.5 | ship simulation, survivor adjudication, 4 fence attacks | running |
| C | `.../c-referenced-but-untracked-sweep.md` | opus | static sweep: every path the repo names vs `git ls-files` | **landed clean** (ledger `exit 0, ok true`) |
| D | `.../d-colleague-cold-start-walk.md` | gpt-5.5 | documented onboarding path walked in order in a clean worktree | **landed clean** (ledger `exit 0, ok true`) |

The five lots are kept — the decomposition (execute the gates / sweep the references / walk the human path / attack the fence) is sound. This plan adds what they cannot produce: the per-item **council fights**, the cross-lot **reconciliation**, the **live defects** found after dispatch, the **durable mechanisms**, and the **closing proof**.

**Live defects found after the lots were dispatched** (verified directly, not worker claims):

1. `node scripts/xlsx-vocab-lint.mjs` exits 1 in the working tree (6 hits: `alertdialog` ×4 in terms_conditions_core TC-041/076/077/090, `row-index` ×1 in TC-SCT-CORE-083, `Dirty state` ×1 in TC-TNC-CORE-079). The token sources exist **at HEAD** in the tracked MDs (`git show HEAD:clients/encore/specs_planning/test-cases/setup/terms-conditions/terms_conditions_core_test_cases.md | grep -c alertdialog` → 6). Whether a *clean clone* lints red is A2's open question (the lint reads the built workbook, and 35 workbooks are modified in this working tree by a parallel session) — but the reword is warranted either way: the tokens sit in tracked sources and flow into every future `xlsx:build`. `.githooks/pre-commit` §5b fires this lint on ANY staged test-case MD or `testcases/*.xlsx`, so while red it blocks every committer who touches those paths, whatever their own change was.
2. The lint hardcodes `clients/encore/testcases/encore_test_cases.xlsx` (no argument support) and never inspects `encore-qa-tracker.xlsx` — a client-facing workbook a gate is believed to cover and does not. Client-fence coverage hole.
3. The modified `encore-qa-tracker.xlsx` in the working tree **lost its colour fills** (HEAD: fills=5, solidFills=3, red/yellow/green present, styleAttrs=131; working copy: fills=2, solidFills=0, styleAttrs=0) — the client's RED/YELLOW/GREEN severity legend would arrive visually dead. Cross-family review (ledger row `g77-trackreview-0818`, `exit 0, ok true`) also found two content defects: one bug record not honestly covered by the generic row claiming to cover it, and one row asserting "not reproducible, recommend closing" while the underlying record is open with no retraction. File is uncommitted and held. This is the concrete instance of the plan's whole risk: work serving one audience degrading the artifact the other audience receives.
4. Findings already landed from C and D that shape scope: six colleague-setup hooks (`.claude/skills/ultra-agents/setup/hooks/check-*.mjs`) reference two untracked plans; `.claude/skills/end-day/SKILL.md` untracked while a tracked skill references it; `docs/SETUP.md:53-55` requires copying `clients/encore/.env.server.example` **which exists nowhere**; the env story is told three contradictory ways across README/setup/client docs; `docs/read_only_docs/ARCHITECTURE.md:171-242` carries eight dead paths; root `README.md` points at missing `HANDOFF_TO_COLLEAGUE.md`, `MCP_BROWSER_GUIDE.md`, `AGENT_RULES_ENCORE.md`; `.claude/skills/planning/SKILL.md:57` cites `plans/pending/SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md` which exists nowhere on disk; **18** untracked plan `.md` files (15 under `plans/pending|done` + 3 under `plans/_archive/`) plus a `gate-fires.log` misplaced inside `plans/pending/` — three lots reported 15/18/19 for "the same" count because nobody stated scope, which is itself a design input (see §Council, law 3).

## Completeness — how "nothing can block a colleague" is derived, not asserted

A blocker reaches a colleague through exactly four media. Each medium gets a machine-derived denominator and a distinct proof method:

| # | Medium | Denominator (machine derivation) | Proof method | Owner |
|---|---|---|---|---|
| 1 | **A gate that executes** | ALL `package.json` scripts (not just the 49 regex-matched — the regex is a convenience, not a boundary; every script is enumerated and classified gate/non-gate with per-script reason) + 3 `.githooks/*` + every hook command named in tracked `.claude/settings.json` + `.claude/skills/ultra-agents/setup/hooks/*.mjs` | Executed (or per-name justified exclusion) in a detached-worktree clone condition | A2 + Phase 1 settings-hook census + Phase 5 re-run |
| 2 | **A reference that resolves at read/load time** | Every path named by every tracked file (C's extractor, corpus 2,043 path-bearing files, 5,903 raw hits) | Static cross-check vs `git ls-files`, classified — **strata below** | C + Phase 1 strata completion |
| 3 | **An instruction a human follows** | The documented onboarding chain in reading order (root CLAUDE.md FIRST-RUN → @-table → docs/SETUP.md → INDEX → client CLAUDE.md → READMEs) | Walked in order in a worktree; contradiction and staleness of CONTENT checked, not just file presence | D + Phase 5 re-walk |
| 4 | **Environment** (node_modules, credentials, home-dir setup, OS) | The SETUP-STEP class inside A2/D | Only counts as fine if a tracked doc actually instructs it — quote the doc line, else it is an undership of documentation | A2 + D |

**The stratum decision for medium 2** (C classified 141 of 5,903 raw hits — honest, but 2.4% cannot answer Rutvik's question): classification is completed to 100% for **stratum E (executable)** — every path consumed by medium-1 items — and **stratum O (orientation)** — every path named by root `CLAUDE.md`, `clients/*/CLAUDE.md`, `.claude/rules/**`, `.claude/skills/**`, `.claude/agents/**`, `docs/**`, root `README.md`, `.githooks/**`. Both strata are enumerated by file-list, not by model judgment. The residual tail — prose references inside `plans/**` bodies — is **deliberately not swept per-item**: PLAN_77 measured that tail (1,259 unreachable citations, 505 repaired, done-plans healed on touch by `scripts/check-citation-deliverability.mjs`), colleagues are DEGRADED not BLOCKED by frozen-plan prose, and the Phase 4 mechanism (M3) catches every one at its next edit. The scope-out is explicit, defended, and reversible by Rutvik in the Phase 3 GO batch.

**The completeness critic**: Phase 2's attacker ticket carries a standing extra duty — name a fifth medium or a missed stratum, or state NONE with reasoning. A completeness claim survives only after an adversary paid to break it could not.

## Council — seats, fights, verdict finality, evidence law

Fight-Protocol (delegation-temp §Fight-Protocol) instantiated. **Review is never terminal; the author always defends; only aligned results reach the CEO.**

**Seats** (worker fleet is `claude-opus-4.6` and `gpt-5.5` only — the two models the wrapper serves):

| Fight | Subject | Seat-1 (author, defends) | Seat-2 (attacker) | Why this pairing |
|---|---|---|---|---|
| F1 | Colleague-side worklist (merged A1+A2+C+D dispositions) | opus (authored the merge in Phase 1) | gpt-5.5 | merge author defends the unified position; cross-family attack |
| F2 | Client-side fence (lot B findings + every F1 item flagged `clients/**`) | gpt-5.5 (B's author position) | opus | B's author defends its own attack results; opus attacks the attacker — no provider grades its own homework in either fight |
| R-x | Every Phase 4 implementation lot | implementing model | the other family | build → review → defend → align, per lot |

**Round cap**: attack → defense → second attack → second defense = **maximum 2 attack rounds**. Items still disputed after round 2 go to the CEO with BOTH positions verbatim (never paraphrased — `feedback_i_escalate_seat_findings_in_the_retelling.md`). The CEO judges; the CEO does not re-derive from scratch. Alignment = a joint per-item verdict table both seats sign: `AGREED-<disposition>` or `DISPUTED(+both positions)`.

**Verdict vocabulary (F1, per item)**: `TRACK` (ship to colleagues) · `GENERATE-LOCALLY` (+ the exact doc block and where it lands) · `FIX-REFERENCE` (reword/repoint) · `STOP-CITING` · `KEEP-LOCAL` (intentional, WITH the tracked pointer text that tells a colleague what to do instead — an unbacked KEEP-LOCAL is a BLOCKS in disguise) · `NEVER-SHIP` (PII/secrets). Every item under `clients/**` additionally carries a `CLIENT-FENCE` flag routing it through F2 before any implementation.

**Authority boundaries** (what makes a verdict final):

- Council aligns → CEO accepts → implementable, **except**:
- **Rutvik-only, always**: gate loosenings (exemption / allowlist entry / threshold change — council may recommend, never execute) · new tracking under `clients/<id>/` (creates a ship candidate) · anything touching the assistant-layer secrecy boundary · deletions (archive-move + prune-check + per-item confirm) · pushes · the tracker-workbook commit (client-facing artifact).
- **Strengthen-vs-loosen rule**: deny-glob ADDITIONS and check-coverage EXTENSIONS are strengthenings — implementable after council alignment + CEO accept, but still listed in the Phase 3 GO batch when client-visible, because the client deliverable's content changes.
- `PLAN_REPO_MARKER_AND_PAIRING_REMEDIATION.md` stays local permanently (quotes scrubbed personal data). Any council output proposing to ship it is evidence the analysis is wrong, not grounds to ship it. `.auth/**` and `.playwright-cli/storage-state-*.json` are never tracked under any reasoning.

**Evidence law** (the acceptance contract for every dispatch in this plan — learned from this goal's own measured failures, including the dispatcher's):

1. **Ledger first.** No result is accepted without its row in `.claude/state/ua-worker/ledger.jsonl` (the wrapper writes it at `copilot-worker.sh:185`) showing `exit`, `ok`, `exit_reason`, `deliverable`, `model_verdict`. A complete-looking result file with no ledger row is UNPROVEN — reconcile before reading. Rows land at run completion; a skeleton result + no row = still running, not dead. First-line sentinel `<!-- copilot-worker: NO DELIVERABLE` = nothing was delivered regardless of other fields.
2. **Machine verdicts for mutation lots.** Every Phase 4 build ticket gets `envelope.mjs` pre-dispatch and `verify-run.mjs` post-return; dispositions per the three-way law (GENUINE accept · FABRICATED hard bounce with `reasons[]` · UNPROVABLE routes to CEO judgment, never auto-bounce).
3. **Every count carries its scope.** A finding stating a number states the exact command and enumeration scope that produced it. The 15/18/19 untracked-plans divergence was three correct counts with three unstated scopes; adjudication time is for dispositions, not arithmetic reconciliation.
4. **An absence names where it looked.** A negative result is admissible only with (a) the exact location(s) searched, (b) the exact command, (c) a known-positive control proving the probe can find. This goal's dispatcher concluded a live ledger "does not exist" from one wrong-directory lookup — the same shape as the failure class this plan exists to end.
5. **Evidence rides the ticket.** Fight and review tickets EMBED the tables/excerpts under dispute in the ticket body. Workers are never asked to read `.claude/state/**`, other untracked scratch, or `~/` home paths (D's walk proved home-dir reads are policy-denied — a phase assuming them silently no-ops). Large reports travel as distilled per-item tables, not full narratives; a seat may request specific excerpts via `## ASK` (one bounce).
6. **ASK gates acceptance.** Non-empty `## ASK` blocks acceptance until every item is dispositioned. `## ASSUMPTIONS-MADE` is mandatory; two workers' conflicting assumptions = HALT + surface.
7. **Dispatch mechanics** (standing, from memory rules): preflight every dispatch with `node scripts/dispatch-preflight.mjs`; `--max-credits` mandatory at 2× estimate; `--work-type` always; `--session-id` + `--parent-run-id` provenance; tee everything; one command ≤ ~20 min — shard; disjoint file sets for parallel tickets; ASCII-only inserted text (the U+FFFD em-dash corruption class from PLAN_77); never edit a wrapper mid-dispatch.

## Phases

### Phase 0 — Reconcile the in-flight lots (CEO-only, no new dispatch until done)

1. For each of A1/A2/B/C/D: match result file ↔ ledger row per Evidence law 1. C and D verified landed (`exit 0, ok true`). A1/A2/B: wait for notifications — zero-burn, END TURN. On a death (error exit / stall-kill / budget-exhausted / no-deliverable stub): death-RCA per §Failure discipline, then re-dispatch the SAME ticket + death context (ANTI-RESCUE: never self-do the lot). No re-dispatch past attempt 2 without RCA.
2. Read the three landed-late messages' claims ONLY via their evidence (this plan's Context already encodes the verified ones). Do not inherit the retracted claims (the wrong-directory ledger conclusion; "vocab gate red on main" — open, A2-owned).
3. Confirm the five tickets' worktrees were removed (`git worktree list`) and `git status --porcelain` shows no lot-caused mutations.

**Gate to Phase 1**: five accepted lots (ledger-verified), or a named partial set with the missing lot re-dispatched and its absence carried as an explicit denominator gap in every downstream table.

### Phase 1 — Unify (one merge lot + two independent probes + one census, parallel where disjoint)

**W1a — Merged worklist** (opus, work-type draft, ~500cr): input = the five lots' disposition/finding tables EMBEDDED in the ticket. Output = ONE per-item worklist, deduped by path, columns: item · path(s) · lots that found it (provenance) · each lot's proposed disposition · conflict flag · `CLIENT-FENCE` flag (`clients/**`) · classification incl. the new **CONTRADICTS** class (content contradictions à la the three-way env story — file-existence checks score them clean; D-style reading catches them). Counts carry scope (Evidence law 3). The 18-plans item carries the per-file breakdown INCLUDING the named tension: `PLAN_ASSISTANT_LAYER.md` + `SUBPLAN_ASSISTANT_LAYER_HARDGATES.md` are referenced by six tracked colleague-setup hooks AND sit under the worker-ext "zero vendor strings in tracked files" secrecy posture — tracking them versus rewording the hooks is a genuine fight, likely Rutvik-terminal.
**W1b — Modified-workbook adjudication probe** (gpt-5.5, work-type verify, ~300cr): denominator = `git status --porcelain -- 'clients/encore/testcases/'` (35 modified workbooks at authoring). For each: HEAD-vs-working-copy style battery (fills count, solidFills, RGB set, styleAttrs, sheet/row counts) → verdict `REGENERATED-EQUIVALENT` / `DEGRADED` / `CONTENT-CHANGED(+what)`. The tracker's known degradation is the seeded positive control — the battery must find it or the battery is broken (Evidence law 4).
**W1c — Vocab reword draft** (gpt-5.5, work-type draft, ~200cr): for the 6 lint hits, draft minimal Expected-Result rewordings that keep meaning and satisfy the lint (e.g. `alertdialog` → "warning dialog"), prove lint-green on a patched COPY in scratch, and check whether the matching test-plan Scenario text quotes the same sentences (GIVER HARD STOP #8 TC↔plan sync — list every file the apply step must touch). No repo edits.
**W1d — Claude-hook census** (folds into W1a's ticket): every hook command in tracked `.claude/settings.json` and every `.claude/skills/ultra-agents/setup/hooks/*.mjs` → does the invoked file exist in `git ls-files`, does `node --check` parse it. This surface is what a colleague's Claude executes on every session; no lot covered it explicitly.

### Phase 2 — The fights

**F1** (colleague side): attacker ticket (gpt-5.5, work-type review, ~400cr) = W1a's worklist embedded + duty to attack per-item dispositions AND the completeness argument (name a fifth medium / missed stratum or state NONE). Defense ticket (opus, ~300cr) = attacker's objections embedded verbatim + original positions; author defends or concedes per item. Max 2 attack rounds; then joint verdict table; DISPUTED rows to CEO with both positions verbatim.
**F2** (client side): same shape, seats reversed (gpt-5.5 defends B's findings + the `CLIENT-FENCE`-flagged F1 items; opus attacks). F2's mandatory agenda: the `.gitignore` negation set under `clients/encore/` · `DENY_GLOBS` edge cases · the `.env.local` ship-survival verdict (B must have answered definitively; if it ships, S0 → immediate Rutvik line-item) · second-order leaks (survivors referencing stripped paths) · the strip-ordering hazard · the vocab-lint tracker-workbook coverage hole · the un-ignore-pairing gap (PLAN_77 D5: gitignore and deny-list cover DISJOINT sets; un-ignoring removes the only fence).
CEO reads only aligned tables + DISPUTED rows. Output of Phase 2 = final per-item verdict table, each row `AGREED-*` (implementable or GO-batched per §Authority) or CEO-adjudicated.

### Phase 3 — The Rutvik GO batch (ONE message, one-liner + options + recommendation per item)

Everything §Authority reserves for him, in one batched message: (1) the TRACK list touching `clients/**` with paired deny entries · (2) the 18-plans disposition (recommendation from F1; the assistant-layer pair called out separately) · (3) client-visible strengthenings (deny additions, lint coverage extension to `encore-qa-tracker.xlsx`) · (4) the `alertdialog` gate-design question (informational if the reword suffices — reword-at-source needs no token-set change) · (5) archive-move candidates (`gate-fires.log` misplaced in `plans/pending/`, per-item confirm) · (6) tracker-workbook repaired-commit authorization · (7) the medium-2 tail scope-out (approve or widen). Wait for answers only where an item is GO-gated; everything council-final proceeds in parallel.

### Phase 4 — Implementation (cross-family build→review→defend→align per lot; disjoint file sets; envelope+verify-run on every build)

**4a — Tracking + references + docs** (per approved verdicts):
- Track the approved TRACK list (by targeted gitignore rule where an ignore is what hides it — the 2026-08-12 precedent; `git add` for plain-untracked; NEVER force-add patterns the 2026-08-12 precedent died to remove). Any `clients/**` item lands only WITH its paired deny entry in the same commit.
- FIX-REFERENCE lot: the C/D breakage list (SETUP.md env-example dead end — create the sanitized `.env.server.example` or reword; the three-way env contradiction unified to ONE canonical telling with the others pointing at it; ARCHITECTURE.md dead paths; README dead pointers; `planning/SKILL.md:57` dead cite repointed to LR-069 §3.5 + custodian subplan; setup-hooks' references per the 18-plans verdict; `next-this-week` ↔ untracked `end-day` per verdict).
- GENERATE-LOCALLY doc blocks: exact commands, placed where the colleague hits the need (the `PLAN_NM3344` "Coverage-check prerequisite for colleagues" section is the shape).
**4b — Mechanisms** (each lands `announce` per LR-069 §3.3 with its graduating incident named in the gate header; no verdict-logic changes to existing gates):
- **M1 — clone-condition step in `/push-repo`**: before any origin push, run the colleague-blocking check set inside a `git worktree add --detach` of the push candidate (closure validator over plans touched in range + the A2-derived fast gate subset + `node --check` over the Phase-1 hook census set). This is the Prior-Fix Trial's convicted-fix rewire: the push battery measured the author's disk; it now also measures what git carries. Skill-step + script; budgeted ≤ the push ceremony (it is not a per-commit hook).
- **M2 — un-ignore-pairing check**: a check (pre-commit, announce) that fires when a staged diff narrows any `clients/**/.gitignore` (removes/negates an ignore) without a same-commit `DENY_GLOBS` change or an explicit ship-intent marker in the commit message. Graduating incident: the bug-records un-ignore (PLAN_77 D5 / TICKET-g77).
- **M3 — citation-deliverability scope extension**: extend `scripts/check-citation-deliverability.mjs` beyond plan files to the stratum-O surfaces (skills/rules/agents/docs), same announce posture. This is the heal-on-touch mechanism that makes the medium-2 tail scope-out safe.
- **M4 — lint coverage**: parameterize `xlsx-vocab-lint.mjs` input (or add the tracker path) so both client-facing workbooks are inspected — strengthening, F2-reviewed, GO-batched (client-visible).
**4c — Client-artifact repairs**:
- Tracker workbook: rebuild from `git show HEAD:clients/encore/testcases/encore-qa-tracker.xlsx` as base, re-apply the intended content delta, fix the two content-honesty defects (the uncovered bug record; the "recommend closing" row vs the open record), restore fills to HEAD parity. Oracle battery from W1b re-run by the cross-family reviewer with its own hands. Commit only on Rutvik's GO (Phase 3 item 6).
- Vocab reword: adopt `/identity GIVER`; apply W1c's patch to the MD sources (+ synced test-plan Scenario text where quoted), `npm run xlsx:build`, `node scripts/xlsx-vocab-lint.mjs` exit 0, `npm run check:tc-parity` exit 0. **Sequencing constraint**: those MDs are staged by a parallel session. At execution moment check their staged/mtime state — if the parallel session is still mid-flight, deliver the patch to it and record the handoff (PLAN_77 D7 precedent) instead of committing over it; if quiescent, apply + `git commit --only` the touched files. Never commit another session's unrelated staged content.
- W1b `DEGRADED` verdicts beyond the tracker: same repair shape per file, batched.

### Phase 5 — The closing proof (the answer to "are we done")

Fresh `git worktree add --detach` at post-Phase-4 HEAD. Four verify tickets, each cross-family vs its Phase-4 implementer:
1. Re-run A1's battery (inherit denominator: all plan files, count restated with scope).
2. Re-run A2's battery (all npm scripts + hooks + the settings/setup hook census).
3. Re-walk D's path in order — including the CONTRADICTS check on the unified env story; home-dir steps marked CEO-verified (workers cannot read `~`).
4. Re-attack B's fence on the NEW HEAD (Phase 4 added tracked files under `clients/**` — the fence must be re-attacked after, not before; survivor list re-enumerated, count restated).
**Pass = zero colleague-blocking failures and zero fence breaches**, or every residual named with its unlock (`feedback_blocked_reasons_name_the_unlock.md`) and dispositioned in the verdict table. A residual with no unlock = the plan is not done. Increments inherit the parent denominators — no re-scoping at proof time.

### Phase 6 — Closure

Verdict table + Receipt v3 (jobs/agents/reviewer/self-work/waste, reconcilable against the ledger) · activity-log row (LR-028/037) · flip the Status field + Executed date · git mv to done/ · `npm run plans:reindex` · `/final-q`. Deviations recorded in the log below as they occur, not at the end.

## Prior-Fix Trial (LR-069 §3.5 — recurrence class, mandatory)

| # | Prior fix | What it did | Why it failed to fire this time | Verdict |
|---|---|---|---|---|
| 1 | Reactive per-plan repair (each colleague report fixed one plan) | Repaired individual plans as colleagues hit walls | `scoped-wrong` — treated instances, never measured the class; 5 recurrences in one day | **CONVICTED** — retired as a practice by this plan's class-wide measurement + Phase 5 proof; no code to remove, the practice itself is the sediment |
| 2 | Commit-gate battery + `/push-repo` checks | Gate the push with quality checks | `scoped-wrong` — every check reads the AUTHOR's working tree; the author-disk oracle is green precisely when the clone is red | **CONVICTED** — rewired in-scope as M1 (clone-condition step inside `/push-repo`) |
| 3 | PLAN_77 `check-citation-deliverability.mjs` | Authoring-time announce when a plan cites a git-undeliverable path | `scoped-wrong` (plan files only — npm gates, hooks, skills, docs uncovered) + still `announce`, so it warns and cannot block | **SURVIVES, extended** — M3 widens scope to stratum O; ramp continues per LR-069, not force-promoted here |
| 4 | 2026-08-12 `specs_planning/` un-ignore | Made walk evidence tracked so gates are satisfiable on clones | Fixed its artifact class; other classes (plans, skills, env examples, setup hooks) kept failing | **SURVIVES** — its track-by-rule method is this plan's implementation precedent |
| 5 | LR-049 three-layer ship defense | gitignore + rule + deny-list keep internal content from the client | It held for overship — but PLAN_77 D5 exposed that gitignore and deny-list cover DISJOINT sets, so every un-ignore silently removes the only fence with no layer noticing | **SURVIVES for its class**; the pairing gap is a `different-sub-class` — M2 is its new mechanism, graduating incident named |
| 6 | LR-039 (handoff never hands a blocker) | Governs chat handoffs | `different-sub-class` — never claimed to guard git-carried state; not this class's fix | **SURVIVES** (not convicted; cited to close the "should it have fired?" question honestly) |
| 7 | Step-3 Prior-Fix-Trial machine layer (`SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md`) | Machine-check recurrence plans carry a trial section | `dead/never-fired` for its citation — the cited file exists nowhere on disk; the gate binds as prose only | **CONVICTED (citation)** — Phase 4a repoints the cite; the prose gate itself is honored by this very section |

No new mechanism in this plan layers over an unconvicted failed fix: M1 rewires conviction #2, M2 answers #5's named sub-class with its incident, M3 extends the surviving #3, M4 extends an existing lint's coverage.

## What becomes stale (LR-050 — enumerated in-scope)

1. The three contradictory env tellings → superseded by the single canonical telling; the other two become pointers (Phase 4a names each file).
2. `docs/SETUP.md:53-55` copy-from-example instruction → either the example file now exists or the instruction is reworded; no third state.
3. `.claude/skills/planning/SKILL.md:57` dead cite → repointed.
4. Dead README/ARCHITECTURE paths (C+D lists) → fixed or removed, per verdict table.
5. The working-tree tracker workbook (degraded copy) → replaced by the repaired rebuild; the degraded copy is not archived (it is a defect, not a record — but per no-autonomous-deletion it is overwritten by the repair, not `rm`'d separately).
6. `gate-fires.log` inside `plans/pending/` → archive-move candidate, per-item Rutvik confirm (Phase 3 item 5).
7. This plan's own scratch (`.claude/state/ua-worker/chips/g78/**`) → session state, untracked, left in place per evidence-retention (`feedback_evidence_must_outlive_the_run_and_the_repo.md`).

## NOT touched

- `validate-plan-closure.mjs` verdict logic, closure/guardrail-config ramp values, `walk-unresolved-allowlist.json` — no exemptions, no thresholds, no verdict-logic edits anywhere.
- `plans/pending/PLAN_REPO_MARKER_AND_PAIRING_REMEDIATION.md` — never shipped, never tracked, never cited into tracked files.
- `.auth/**`, `.playwright-cli/storage-state-*.json` — never tracked; the 2026-05 history blob's filter-repo remediation stays out-of-scope (separate security follow-up, already on record).
- `encore-mock` / `encore_deliverables_test` — nothing is pushed there by this plan, ever.
- PLAN_75 / PLAN_68 scope and their in-flight working-tree files; PLAN_74's gate-defect ownership; PLAN_77's landed commits.
- `copilot-worker.sh`, `worker-ext.md`, `~/.claude/**` control surfaces — PROTECTED; nothing here edits them (M1 edits `/push-repo` skill + adds a script, which are not on the PROTECTED list).
- The delegation org-chart/burn policy (PLAN_75's territory).

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | test-case MDs (6 Expected-Result rewords) + synced test-plan text + rebuilt workbook | clients/encore/specs_planning/test-cases/setup/terms-conditions/terms_conditions_core_test_cases.md<br>clients/encore/specs_planning/test-cases/setup/service-charge-text/service_charge_text_core_test_cases.md<br>clients/encore/testcases/encore_test_cases.xlsx | `node scripts/xlsx-vocab-lint.mjs` exit 0 AND `npm run check:tc-parity` exit 0 |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none — council seats are Copilot workers, not the WATCHDOG pipeline identity; findings live in this plan's verdict table) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | this plan file (incl. the appended `## Council verdict table` section — the table lives IN the tracked plan, never in untracked state, per this plan's own doctrine), mechanisms, doc/reference repairs, repaired tracker workbook | plans/pending/PLAN_78_TWO_AUDIENCE_SHIP_COMPLETENESS.md<br>scripts/check-unignore-pairing.mjs<br>clients/encore/testcases/encore-qa-tracker.xlsx | `node scripts/check-unignore-pairing.mjs --help` exit 0; `grep -q '## Council verdict table' plans/done/PLAN_78_TWO_AUDIENCE_SHIP_COMPLETENESS.md` exit 0 with zero unresolved DISPUTED rows; Phase 5 four-ticket proof PASS lines quoted in Execution Summary |

Duty-coverage (Step 3 Layer-0): GIVER HARD STOPS reflected — #8 TC↔plan sync (W1c lists + Phase 4c edits the quoted Scenario text), #9 count check (reword only, counts unchanged — asserted by tc-parity), #10 post-complete/xlsx rebuild (Phase 4c runs `xlsx:build` + parity). #1–7, #12–18 excused: `out-of-scope: no live walk, no field coverage change — text-only reword of existing TCs`. No other pipeline identity's artifacts are touched.

## Acceptance criteria

- [ ] Phase 0 reconciliation table: five lots × (ledger row quoted, accepted/re-dispatched). Any re-dispatch carries its death-RCA row.
- [ ] Merged worklist exists with per-item provenance, scoped counts, and zero UNKNOWN rows left undispositioned (an UNKNOWN survives only with its named settling probe).
- [ ] F1 and F2 joint verdict tables exist; every row `AGREED-*` or CEO-adjudicated with both positions quoted verbatim; the completeness critic's answer (fifth medium or NONE + reasoning) recorded.
- [ ] The Phase 3 GO batch sent as ONE message; every Rutvik-gated item shows his answer before its implementation commit.
- [ ] Every Phase 4 build lot has: envelope manifest, verify-run verdict (GENUINE, or UNPROVABLE with the CEO's recorded judgment), cross-family review, and a defense round (or `no-objections` from the attacker).
- [ ] M1–M3 land in `announce` with graduating incidents named in their headers; M4 lands only with its GO. Zero gate exemptions, allowlist entries, or threshold changes anywhere in the diff (`git diff` on the config lock-paths is empty).
- [ ] Tracker workbook: fills/solidFills/RGB/styleAttrs at HEAD parity or better, both content defects fixed, reviewer re-derived the numbers with its own battery; committed only after GO.
- [ ] Vocab lint exit 0 on the working tree after Phase 4c, with the parallel-session handoff recorded if the apply was handed off rather than committed.
- [ ] Phase 5: all four proof tickets landed with inherited denominators restated; zero colleague-blocking failures and zero fence breaches, OR every residual named with its unlock in the verdict table.
- [ ] `git ls-files | grep -E '\.auth/|storage-state'` empty, verified after the final tracking commit, output quoted.
- [ ] Explicit statement in the Execution Summary that the PII plan was neither tracked nor cited into tracked files.
- [ ] Receipt v3 with counts reconcilable against `.claude/state/ua-worker/ledger.jsonl`.

## Merged worklist (Phase 1 output — CEO synthesis of nine evidence lots)

Provenance codes: **A1T** closure classification · **A2** npm gate battery (partial) · **B1** ship census · **B2** fence attacks · **B3** second-order leaks · **C** static reference sweep · **D** cold-start walk · **W1b2** workbook adjudication · **W1c** vocab reword draft.

Every count below states its scope. Where two lots disagreed, the reconciliation is given rather than one number chosen silently.

### Colleague side — F1 agenda

| # | Item | Evidence | Proposed disposition |
|---|---|---|---|
| L1 | 18 untracked plan `.md` (15 under `plans/pending\|done`, 3 under `plans/_archive/`) + a `gate-fires.log` misplaced inside `plans/pending/` | C, D | TRACK the non-sensitive ones; archive-move the stray log (Rutvik per-item) |
| L1a | `PLAN_ASSISTANT_LAYER.md` + `SUBPLAN_ASSISTANT_LAYER_HARDGATES.md` — referenced by six tracked colleague-setup hooks, but under the "zero vendor strings in tracked files" posture | C | **Rutvik-terminal**: track vs reword the hooks |
| L2 | `.claude/skills/end-day/SKILL.md` untracked while tracked `next-this-week/SKILL.md:20` references it | C | TRACK — a whole capability is absent for colleagues |
| L3 | `docs/SETUP.md:53-55` instructs copying `clients/encore/.env.server.example`, **which exists nowhere** | C + D (independent) | Create a sanitized example, or reword. No third state |
| L4 | The env story told three contradictory ways (root README vs setup doc vs client doc; client README path wrong from repo root) | D | **CONTRADICTS** — one canonical telling, others become pointers |
| L5 | `docs/read_only_docs/ARCHITECTURE.md:171-242` — 8 dead paths describing a structure that no longer exists | C | FIX-REFERENCE or remove the section |
| L6 | Dead doc pointers: root `README.md:10` → `HANDOFF_TO_COLLEAGUE.md`; `docs/README.md:9` → `config/environments/.env.example`; README → `MCP_BROWSER_GUIDE.md`, `AGENT_RULES_ENCORE.md` | C, D | FIX-REFERENCE |
| L7 | `.claude/skills/planning/SKILL.md:57` cites `SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md`, absent from disk — the Prior-Fix-Trial gate cites its own missing machine layer | C | FIX-REFERENCE → LR-069 §3.5 + the live custodian subplan |
| L8 | **419 of 477 done-plans FAIL closure on a clean clone (88%).** `--all` reads `plans/done/` only; the 155 pending plans are never evaluated, by design | A1T | See L8a–L8c. **Zero UNDERSHIP** — no tracked source a colleague needs is missing |
| L8a | 99 plans cite gitignored client internals (`specs_planning/`, `readable_externals/`); 47 cite `.claude/state/` run artifacts; 39 cite auth/env files | A1T | GENERATE-LOCALLY — document the command where the reader hits it (NM3344 section is the shape) |
| L8b | Deleted/moved tracked files, ~17 parent plans cited by ~60+ children after a pending→done move, 3 plans citing dead worktree paths, ~12 relative-path resolution failures, ~30 singletons | A1T | STALE-REFERENCE — repair citations; heal-on-touch via M3 |
| L8c | Scope reconciliation: an earlier lot reported 209/241. Its capture was **truncated** — footer landed at line 240 with 5 verdicts after it. `git ls-files 'plans/done/*.md'` = 477 confirms A1T | A2 vs A1T | A1T's 419/477 is authoritative |
| L9 | `npm run lint` red on a clean clone — 428 problems (234 errors), incl. `website/frontend/vite.config.ts` linted but excluded from `tsconfig.json` | A2 | Blocks every colleague from clone onward |
| L10 | `npm run plans:reindex:check` red on a clean clone — "INDEX.md is STALE" | A2 | Likely downstream of L1; verify before fixing |
| L11 | `npm run xlsx:freshness` aborts without `.auth/encore-state.json` | A2 | SETUP-STEP — and the **model failure**: it names its own unlock. Hold it up as the pattern |
| L12 | Setup README Step 4's stated expected output is wrong — the verification command emits a session warning and exits 2 | D | FIX-REFERENCE |
| L13 | **Denominator gap**: A2 executed 17 of 49 npm gates; 32 unmeasured. Hook analysis never ran | A2 | Carry as an explicit gap in every downstream table; close in Phase 5 |
| L14 | **Denominator gap**: C classified 141 of 5,903 raw reference hits (2.4%) | C | Strata decision per §Completeness — Rutvik ratifies the tail scope-out |

### Client side — F2 agenda

| # | Item | Evidence | Proposed disposition |
|---|---|---|---|
| K1 | **BREAKS — the deliverable does not run on arrival.** `.env.local` is correctly stripped, but `README.md:28,30`, `.env.e2e:5,15-16`, `playwright.config.ts:6` and `src/setup/global-setup.ts:17,88,129` all direct the reader to it, and **no template ships**. First `npm test` fails: "Missing required env var: BASE_URL. Open .env.local…" | B3 (verified by CEO) | Ship a sanitized `.env.local.example` + reword. Highest priority on this side |
| K2 | **REVEALS** — the shipped `clients/encore/.gitignore` carries our own words: "Agent-internal artifacts kept on disk but never shipped", "Internal artifacts — never ship to client", naming `CLAUDE.md` and `.auth/` | B3 (verified by CEO) | Reword the shipped copy; it discloses posture, not secrets |
| K3 | **REVEALS** — `src/utils/field-case-runner.ts:37-38,117` comments disclose the internal repo layout and an internal receipt path | B3 | Reword comments |
| K4 | **REVEALS** — `src/fixtures/label-jargon.json` ships our shorthand list, and **no shipped script references it** | B3 | Dead weight plus disclosure — strongest case for removal from the ship |
| K5 | **REVEALS** — a skipped spec hard-codes `clients/encore/.auth/encore-state.json`; inert while skipped, breaks on unskip | B3 | Repoint to the generated relative path |
| K6 | **Latent** — the dated-script deny pattern is written for full repo paths; ship passes **stripped** paths, so it cannot fire. Verified by CEO with both controls behaving | B2 (verified by CEO) | Strengthening: fix the pattern's path form |
| K7 | **Latent** — an empty or malformed exclusion list is not independently detected; `ship-client.sh` continues. Caught today only by a later check | B2 | Strengthening: assert the list is non-empty |
| K8 | **5 of 35 modified workbooks DEGRADED.** Tracker: fills 5→2, solidFills 3→0, red/yellow/green RGB → none, styleAttrs 131→0 — its severity legend arrives dead. The other 4 lost 2 column-width definitions per sheet alongside legitimate row growth. All 35 CONTENT-CHANGED; 0 REGENERATED-EQUIVALENT | W1b2 (control fired) | Repair the tracker before any commit; the other 4 are cosmetic, batch-fix |
| K9 | Tracker content defects: one bug record not honestly covered by the row claiming to cover it; one row says "not reproducible, recommend closing" while the record is open with no retraction | g77 trackreview | Fix both in the repaired rebuild |
| K10 | `xlsx-vocab-lint.mjs` hardcodes `encore_test_cases.xlsx` (line 18, no argument support) and never inspects `encore-qa-tracker.xlsx` | CEO + W1c | Strengthening: cover both workbooks — client-visible, GO-batched |
| K11 | Six internal-vocabulary phrases in tracked test-case sources, with drafted replacements proven token-clean, plus one title and its test-plan mirror the six-hit list missed | W1c (citations verified by CEO) | Apply under GIVER in Phase 4c, respecting the parallel-session sequencing constraint |
| K12 | **Fence verified holding**: 560 archived → 366 stripped → 194 survive; all 17 bug records present-before/absent-after; `.env.local` removed; `git ls-files \| grep -E '\.auth/\|storage-state'` empty with a firing positive control; `!reports/bugs/` admits nothing beyond itself; sibling `bugsolo/` still ignored | B1, B2 (3 spot-audits by CEO) | No action — this is the baseline the fights must not regress |

## Council fight log

(One row per fight round — fight id, round, attacker's material objections, conceded/defended split, resulting verdict-table delta. Joint verdict tables land in `## Council verdict table` at Phase 2 close.)

| Fight | Round | Seat | Objections | Outcome |
|---|---|---|---|---|
| F2 (client) | 1 — attack | opus, 394s, exit 0 | 5 material | 2 CEO-verified, 1 refuted-but-productive, 2 open for the defence |
| F1 (colleague) | 1 — attack | gpt-5.5, 1032s, exit 0 | 4 material | **1 kills the headline conclusion (CEO-verified)**, 2 CEO-verified, 1 new medium |

### F1 round 1 — the attack that overturned the colleague-side conclusion

The attacker could not use `git worktree add --detach` — the harness denied it — and substituted `git clone --local --no-hardlinks`, which gives the same tracked-files-only tree with `.git` present. Acceptable, and the substitution is recorded because the next seat should use the same route rather than re-discovering the denial.

**O6 — VOID. Retracted 2026-08-18 by Rutvik: he delivered that report to Encore manually himself.**

The artifact's absence from the repository was never a failure — it simply never lived there. Everything below is preserved only so the next reader does not re-derive the same wrong conclusion from the same evidence, and the retraction is why the "zero UNDERSHIP" line in L8 stands rather than falls.

**The lesson, which outlives the finding:** every observation below was individually true — the file is absent, untracked, has no git history, and the plan really does say the builder was discarded. The conclusion drawn from them was still wrong, because the repository cannot see a person handing a file to a client outside it. Absence in git is not evidence of loss; it is evidence of absence in git. Nothing in the ladder of checks I ran could have caught this, because the missing input was a human action, not a file. **Ask the person before concluding a thing is lost.**

Struck through — do not act on any of it:

~~**O6 — the zero-undership claim is FALSE. CEO-verified. This is the finding of the audit.**~~

`plans/done/PLAN_CORP_PRICING_MISSING_TESTID_XLSX.md` promises a Jira-ready report at `clients/encore/specs_planning/_internal/CORPORATE_PRICING_MISSING_TESTID_REPORT.xlsx` — 122 rows, in the exact format Encore had already approved for two earlier modules. CEO re-derivation, each with a firing positive control:

- The plan cites the path in three places (lines 25, 72, 86), including a matrix row claiming a Node read-back confirmed 122 rows.
- The file is **absent from disk**.
- It is **untracked and has no git history at all** — `git log --all -- <path>` is empty, while the same probe against the plan file itself returns a commit, so the probe fires.
- The plan's own line 53 states how it was built: *"One-off Node script (session scratchpad, not committed) using `exceljs`… Run once, verify, discard."*

So the generator was discarded **by design**, and the artifact was gitignored and never committed. The consequence is worse than the attacker stated: it is not that a colleague cannot regenerate it — **nobody can, including us.** The artifact existed at execution time, was fenced out of git, and is now gone from the author's machine too. A colleague asked to send or check that report has no way to produce it and no way to verify the 122-row claim.

**The generalisation, which matters more than the instance.** The worklist filed 99 plans under GITIGNORED_CLIENT as GENERATE-LOCALLY. That classification silently assumed a generator exists. This case proves the assumption is not free — at least one of those artifacts was built by a script that was deliberately thrown away. **How many of the 99 have no committed generator is unmeasured**, and until it is measured the GENERATE-LOCALLY disposition is an assertion, not a finding. That scope question goes to the defence.

**O7 — L10 is not downstream of L1. CEO-accepts.** The worklist guessed the stale plan index was a side effect of the 18 untracked plan files. The attacker ran `npm run plans:reindex:check` in a clean tracked-only clone, where those files do not exist, and still got `INDEX.md is STALE`. It is an independent defect.

**O8 — L12's replacement command is itself stale. CEO-accepts.** The setup guide's verification step points at `.claude/scripts/verify-setup.mjs`, which fails with MODULE_NOT_FOUND. The instruction and its correction were both wrong.

**O9 — a fifth medium: local git configuration, specifically hook-install state.** Accepted as a real addition to the four media. `npm ci` runs a `prepare` script that sets `core.hooksPath=.githooks`. Every gate in the "gates that execute" medium quietly assumes that repo-local config was applied. A colleague who installs with `--ignore-scripts`, imports through an IDE, or works from a copied checkout has all the tracked files and **no active hooks** — so the protective layer is silently absent while everything looks correct. Nothing announces this.

Also measured on the clean clone, confirming worklist items rather than overturning them: `npm run lint` exits 1 with `428 problems (234 errors, 194 warnings)`, first error `clients\encore\playwright.config.ts … TSConfig does not include this file`; `npm run xlsx:freshness` exits 1 and names its own unlock; `npm run clean:results` fails with ENOENT on a missing results directory; `npm run client:ship -- --help` exits 2 with `Unknown arg: --help`.

### F2 round 1 — the attack, and what survived CEO verification

The attacker re-derived 560/366/194 independently (they reconcile exactly), read all 194 survivors, and found **no confidential material** on the list. K12's core claim survives its own adversary. Its five material objections, each spot-audited by the CEO rather than accepted:

**O1 — "the fence was breached as recently as this sprint." REFUTED as stated, but it found something real.**
The attacker reasoned from a dated comment on the `/reports/bugs/` deny pattern that the fence was a late reactive patch, and that before it the `.gitignore` negation would have shipped 17 internal bug records. The history refutes the causal story: `git log -S` shows the negation `!reports/bugs/`, the 17 bug files, and the deny pattern all landed in **one commit** — `1a9f8d6d1`, whose message is *"send 17 bug records to colleagues, fence them from the client."* Un-ignoring and fencing were done atomically. There was never an unfenced window on main.

But the same dig surfaced a genuine exposure the attacker did not find, recorded below as **K13**.

**O2 — K2 should be upgraded from REVEALS to DISCLOSES-POSTURE, and ranked above K1.** Open for the defence. The argument: a missing env template reads as forgetfulness and is fixed in an hour, whereas a shipped file telling the client in our own words that a category of material must *"never ship to client"* tells them they are receiving a filtered view. One is embarrassing; the other invites the question *what else*.

**O3 — the tracker is not degraded, it is destroyed.** CEO-verified as consistent. An independent ExcelJS read found **zero cells carrying fills**. This does not contradict the prior lot's `fills=2` — that counted style-table definitions, where 2 is the empty default; this counted cells actually using one. Both measurements agree: the severity colour coding is entirely gone, not partially lost.

**O4 — the "30 fine" verdict has a method blind spot.** Open for the defence, and it is a fair hit. Counting *how many* column-width definitions were lost cannot distinguish a narrow column that was always narrow from a wide column collapsed to the 8-character default, which would render long test-case text unreadable. "Cosmetic" is a claim about what was *in* the column, and nothing measured that.

**O5 — the mechanism fails open, not closed.** Open for the defence. `DENY_GLOBS` is a denylist: anything newly tracked under `clients/encore/` ships until someone adds a pattern for it. The attacker proposes an allowlist so the default is refusal. K6 and K7 are named as symptoms of this one root rather than separate defects.

### K13 — new, CEO-derived from O1's dig: the fence is branch-scoped

`origin/NM-3345_3346` is an unmerged remote branch, 3 commits ahead of main and 153 behind. It carries **5 tracked internal bug records and does NOT carry the deny pattern** (verified: `git ls-tree -r origin/NM-3345_3346 -- clients/encore/reports/bugs/` returns 5; `git show origin/NM-3345_3346:scripts/lib/forbidden-patterns.mjs` has no `/reports/bugs/` entry).

`ship-client.sh` archives `HEAD` — whichever branch is checked out. Shipping from that branch delivers those 5 records to the client. Merging it into main is safe (main's fence is newer and the files are a subset of the 17 already tracked); **shipping from it is not.** The general defect: the fence lives in the working tree, so it is only ever as current as the branch someone ships from, and the ship script never checks that the branch it is archiving carries an up-to-date fence.

Severity S0 under LR-069 §3.1 — client-facing, gate on the first occurrence rather than on likelihood. Low probability, but nothing in the mechanism prevents it and nothing would announce it.

### CEO note on method

The CEO's own first confirmation of the fence used `grep -c 'reports.bugs'` and returned **0**, which would have read as "the fence is missing from HEAD." The pattern was broken — `.` matches one character and the file contains `reports\/bugs`, which is two. Re-run as `reports..bugs` with a deliberately-failing control alongside it, the fence is present. Logged here because it is the exact failure this plan's Evidence law exists to catch, and it nearly inverted a load-bearing finding.

### L15 — the fix that never left the author's machine (CEO-found, 2026-08-18) — S0

This is the plan's own thesis caught happening, in the middle of executing the plan.

The vocabulary lint was the confirmed colleague blocker: a pre-commit gate refusing any commit that
stages a test-case markdown containing internal shorthand. A worker applied six token-proven wording
changes, the workbook was rebuilt, and `node scripts/xlsx-vocab-lint.mjs` returned `vocab hits: 0 …
PASS`, exit 0. That was reported as cleared.

It was not cleared. `scripts/xlsx-lint-rules.mjs` was modified in the working tree and had never been
committed. Bound to the committed version of that module, the same command on the same workbook
returns **exit 1 with 19 `[C7] truncated trailing backtick` violations**. Every colleague has the
committed version. The green was an artifact of a file only this machine had.

The wording fix itself was sound — vocab hits are 0 under both versions. What blocks a colleague is a
second, unrelated check that the uncommitted edit silences.

**What the silenced check was actually seeing.** The linter replaces registered source-code literals
with the words `quoted literal` before scanning for corruption. When a literal sat inside backticks,
the substitution left the backticks behind, and the corruption rule then flagged the orphaned backtick
it had just created. All 19 are the linter reporting its own edit as damage. The working-tree change
deletes the whole balanced span instead of substituting inside it.

**Proven, not assumed** (`.claude/state/ua-worker/chips/g78/v3/`, re-run independently by the CEO
against the real module rather than the worker's harness): all 19 rows individually traced to a
registered literal with balanced backticks in the markdown source — none genuinely malformed. A
damaged control workbook built for the purpose still fails the patched gate on two rows, one of them
`TC-SVC-BAS-002` — a row among the 19 — proving the patch silences the manufactured backtick while
still catching real damage in the same cell. Span-deletion branch counts on live data: fenced 0,
parenthesised 3, bare 95; every match is exactly the registered literal.

**Why it belongs in this plan.** It is the L-class failure in its purest form, and it is a
**recurrence**: commit `65cf9eb76` (2026-08-12, *"let the workbook lint read quoted test input as test
input"*) fixed this same false-positive class by substituting text — and left the backticks, which
manufactured the next 19. Per LR-069 §3.5 that prior fix is **CONVICTED** (`scoped-wrong` — it
neutralised the literal but not the delimiters it lived inside). The working-tree change completes it
rather than layering over it, which is why the disposition is "commit it", not "add another rule".

The general lesson is not about backticks. **A gate's own source is an input to that gate.** Every
green measured on this machine is measured against the working tree; every red a colleague sees is
measured against `HEAD`. Nothing in the pre-commit chain compares the two, so a gate fix can sit
uncommitted indefinitely while its author reads green — and the more useful the fix, the longer it
survives unnoticed, because nothing on this side ever fails.

Disposition: **needs Rutvik.** It makes a gate quieter, which is his call by standing constraint,
notwithstanding that the evidence says it should be committed.

## Plan-Deviations log

| # | Deviation | Why | Disposition |
|---|---|---|---|
| — | (recorded during execution, per event, not at closure) | | |

## Verification artifact (D23)

```
# The plan's own existence + gates:
ls plans/pending/PLAN_78_TWO_AUDIENCE_SHIP_COMPLETENESS.md   # exists, Status: PENDING
# After execution, the one-command truth of the whole effort:
git worktree add --detach "$TMP" HEAD && (cd "$TMP" && npm install --silent \
  && node scripts/validate-plan-closure.mjs --file <any-plan> --dry-run \
  && node scripts/xlsx-vocab-lint.mjs)          # a colleague's exact condition, green
git worktree remove --force "$TMP"
```

## Handoff

Chat only, outcome language per LR-039. The Receipt names what was fought, what Rutvik decided, and what now mechanically prevents recurrence.
