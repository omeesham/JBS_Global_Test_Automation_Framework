# What last week's work actually did to the system

**Read-only audit. Nothing here was fixed. Every fix is your call, one at a time.**
Window: 2026-07-27 → 2026-08-05. Repository pinned at `c83b307e`, untouched throughout and verified
untouched at the end.

---

## The short version

**No commit lied.** 86 commits landed in the window; 51 made a checkable claim; every one that was opened
did what it said. Zero were false. Twenty-one plan promises were kept with commits to show it.

**The damage is in what never arrived.** Fixes written into the repository never reached the copies that
actually run. Work was built and never committed. Three uncommitted edits are armed to break a fresh clone
the moment they are committed without their targets. A 1.8 GB directory nobody tracks sits in the repo.

Nothing here says the week broke your codebase. Several things say the week's improvements are not in
effect, and one is a landmine waiting on your next commit.

---

## 1 · Findings, strongest first

### 1.1 Three uncommitted edits are armed to break a fresh clone the moment they are committed

**A fresh clone today is fine.** I said otherwise in an earlier draft and it was wrong — my own re-check
instrument caught it. The correct finding is a landmine, not a live break, and it tells you what must
never be committed alone.

Three files have **uncommitted edits** that wire them to targets which are **also uncommitted**. Commit the
edit without the target and the breakage arms:

| file (uncommitted edit) | what the edit adds | the target it needs | consequence if committed alone |
|---|---|---|---|
| `scripts/ship-client.sh` lines 108–115 | a hard dependency and an explicit refusal | `scripts/verify-approved-scope.mjs` — untracked | `client:ship` for Encore refuses to run |
| `.claude/settings.json` | registers `client-surface-gate.sh` and `client-surface-size-gate.sh` | both scripts — untracked | the gates are registered but absent, so a clone **silently fail-opens** and enforces nothing |
| `.githooks/pre-commit` | calls the delivery-manifest validator | `scripts/validate-delivery-manifest.mjs` — untracked | committing fails on a fresh clone |

None of these three wirings exist at the pinned commit — all three are worktree-only. The silent one is
still the worst of the three: a gate that is registered but missing looks installed and does nothing.

*The seat that found these classified them precisely and cited diff line ranges. I escalated its
conditional finding into a live one when writing it up. That correction is defect 12 in section 8.*

### 1.2 Two safety gates run older code than the repository holds

The repository holds the *source* of the scripts that police what workers may do; copies in your home
directory are what run. They are out of sync **in both directions.**

| script | what differs | which side runs |
|---|---|---|
| `labor-gate.mjs` line 98 | The repository treats a bare `&` as a command separator, so `allowed & forbidden` is two commands and both get gated. The running copy reads it as one allowed command. | **Running copy is older** (07-30 vs 08-03). The repository already fixed this. |
| `check-isolation-perimeter.mjs` line 189 | The repository blocks worker writes under `.claude/`; the running copy permits `.claude/rules/`. | **Running copy is newer** (08-04 vs 07-29). Permissions were widened on the machine and never returned to the repository. |

The author of the surface map conceded the first point in defence: *"installed labor-gate lacks the
source-side bare-background-operator split and should be treated as a live bypass risk until
tested/fixed."* On the second it went partial — the installed file also lists `.claude/rules/` in a
tracked-path regex on line 194, **so whether the widening was deliberate is a question only you can
answer.**

*Found by one seat, attacked by a second from the other provider, defended by the first, and re-derived
independently by the terminal judge. Four parties.*

### 1.3 The 08-03 batch of updates never reached the running system

The pattern behind 1.2. After the fight settled, the aligned count is **nine files where the repository is
newer than what runs, and two where the machine is newer than the repository.** Six configuration files
driving the delegation system are still on versions from 07-10 to 07-16.

The last time anyone compared the two sides was **2026-07-18** — before the period under audit.

*Author and cross-provider reviewer, aligned after a defence round.*

### 1.35 Five operating lessons learned in the last three days exist only on this machine

The same drift as 1.3, one layer up — and this one is about the memory files you asked about directly.

`CLAUDE.md` tells a new collaborator to copy `.claude/collaborator-memory/*.md` into their own memory
folder. That copy happened. It then stopped tracking. Of the memory files that changed on this machine
during the window, **31 have a counterpart in the repository. Twenty-two are byte-identical. Nine differ.**

**A judging seat opened all nine diffs and found that none of them contradicts the other side.** That
matters, and I had implied otherwise in an earlier draft of this section. The nine split cleanly in two:

**Four are cosmetic — the repository sanitized your quoted language and the machine never got the update.**
Same instruction, different wording. Example, from `feedback_report_state_not_activity.md`: the repository
carries *"i thought u pushed and we are done!"*; the machine carries the unsanitized original. The rule
either version teaches is identical. Keep the repository's.

**Five are the machine having learned something the repository never received.** These are additions only
— three of the five delete not a single line — dated 2026-08-03 and 08-04, after the last sync:

| the five | what only the machine knows |
|---|---|
| `feedback_worker_ticket_mechanics.md` | Never edit the dispatch wrapper while a job is live — bash resumes a running script by **byte offset**. A 5-line edit on 08-04 killed a worker with a syntax error pointing into the middle of a comment. |
| `feedback_worker_credit_budget_is_the_real_killer.md` | Budget by whether a job is *bounded*, not by whether it writes. And require incremental reporting, so a budget death doesn't take the findings with it. |
| `feedback_a_green_check_can_be_an_artifact_of_invisibility.md` | The sharpest form: the invisibility gets written down *as* the evidence. Test — what would this field contain if the instrument were pointed at nothing? |
| `feedback_claim_vs_artifact_crosscheck.md` | A *declined* claim needs the same disk check as an applied one. The applied/declined split is itself a claim. |
| `reference_playwright_cli_and_subagent_limits.md` | (cosmetic — a machine-specific path where the repository correctly carries a placeholder) |

So the finding is not "the rules disagree." It is: **the repository and the machine are each holding
content the other lacks, in both directions, and nothing reconciles them.** Every lesson this system
learned in the last three days — including three that this very audit kept re-proving the hard way — is
one machine away from being lost, and no other collaborator or fresh clone has any of it.

*Derived twice, and the second derivation corrected the first: the judging seat disputed my population and
was right; I ran the byte comparison and the addition/deletion counts myself rather than accepting either
number.*

### 1.4 The self-cleaner was built, never committed, never switched on

`PLAN_REPO_SLOP_SWEEP.md` records your decision verbatim:

> "Now. His words: now is the best time to do these things, never tomorrow. Lot C1 proceeds as part of
> this sweep, not deferred to a later plan."

Two seats concluded it was never built. **Both were wrong** — they read clones, where uncommitted files do
not exist. One flagged that risk itself rather than hiding it.

It exists: `.claude/hooks/lib/selfclean/sweep.mjs`, 20,886 bytes, written 2026-07-30, plus
`selfclean-sweep.sh`, `selfclean-config.json`, `retention-policy.json`. **None are committed.** The
launcher says on its own line 2: *"SessionStart hook (NOT REGISTERED — owner wires in settings.json)."*
`settings.json` mentions it **zero** times. Meanwhile `package.json` lines 132–135 wire **four** npm
commands at it. Those lines are committed; the target is not.

*I found this by correcting two seats. A later seat then derived it independently from exported evidence,
and the terminal judge re-verified every disk fact. **No longer resting on me.***

### 1.5 A rule tells you to run a command that no longer works

Commit `14b656d9` moved a 229-line self-test out of `parse-verdict.mjs` into its own file. The new test
passes — 45 checks. But `.claude/rules/hooks-identity.md` **lines 48 and 53** still tell you to run
`node .claude/hooks/lib/parse-verdict.mjs --self-test` after touching the chain hooks. That command now
exits with an error.

The **same shape appears again** in `check-todo-injection.mjs`: its inline self-test was removed and it now
dispatches to a replacement that is untracked, so a fresh clone loses the callee entirely.

*Two seats, on two different files, each proving it with commands you can re-run.*

### 1.55 The slop sweep measured a 1.9 GB pile outside the repo, declared it in scope, and never touched it

This is the sharpest answer to "did the plans do what they said."

Commit `db1c0443` widened the sweep's scope to *"everything Claude and Copilot have ever written — inside
this repository and outside it"* and enumerated a **~1.9 GB out-of-repository denominator** across three
roots. Testing that declared boundary against real file timestamps:

| what the plan claimed | what happened |
|---|---|
| Three out-of-repo cleanup lots (ORP-A1, ORP-A2) — *"Remove the above" / "Remove contents"* | **None executed.** `%LOCALAPPDATA%/Temp/claude/` (614 MB), `shell-snapshots/`, `session-env/`, `cache/` — zero files modified in the window. |
| Two triage-table deliverables — both plans say *"Produce a triage table… **Stop.**"* | **Neither table exists.** Not in the commits, not on disk. One was the memory-topic triage over 102 files; the other was the pending-plan triage. |
| Four more surfaces named in the denominator | `~/.claude/tasks/` (1,005 files), `plugins/` (728), `plans/` (33), `telemetry/` (31) — all counted, none touched, **no lot ever assigned an action to them.** |
| `SUBPLAN_OFFREPO_RECONCILIATION` — **95 findings** targeting your home directories | Filed 2026-08-03, never started. Status still Pending. **Two are security-class items.** |

The seat's own summary: *"The denominator was measured; the work never reached it."*

It was equally careful on the other side. Eight surfaces inside the declared scope *were* modified — but
it separated **runtime churn from cleanup work.** Files under `delegation/` and `session-state/` changed
because workers were writing to them, not because anyone cleaned them. Only two rows are genuine work:
the client write fence, and the in-repo deletions in `10f7394`.

*One seat, every row quoting the plan's own scope statement and citing timestamp evidence.*

### 1.6 A 1.8 GB untracked directory is sitting in the repository

`_archive/` — **55,797 files, 1.8 GB, untracked.** Found when my own staging script choked on it, not by
any lot. Eight other untracked directories sit alongside it, all inventoried.

*Judged as an inventory line, not by its contents, and the judging seat said so explicitly.*

### 1.7 PLAN_59 was pushed with two required checks red, because neither was wired

Commit `b6d617b` states it: the restructure "had been pushed while two required checks were red, because
neither check was wired to anything." That commit is the repair.

### 1.8 Two subplans were deliberately left open with no path to closing them

`b6d617b` says verbatim: *"Left open on purpose: 59A and 59D are not closed —"* because 59A's regression
evidence "was never captured" and 59D "cites a field inventory whose cross-check was never earned."

The decision and the reason are both on record. The finding is one step on: a deliberate deferral with no
recipient plan, no follow-up commit, and no closure path eight days later.

### 1.9 Things that should have been removed, updated, or added — and weren't

| kind | what |
|---|---|
| should have been removed | `scripts/clean-root.ts` and its `npm run clean:root` entry still exist. The sweep plan says: *"Retire it: absorb patterns into the sweeper's rule registry and delete the script."* |
| should have been updated | The same plan points at a design document at a path that does not exist, and says certain files are *"Protected by the self-cleaner's live-state registry"* — that registry was overturned, so those files have no stated protection while the plan claims they do. |
| half applied | Telemetry was added to three "dark" gates; the same day's review identified more. *(Flagged by the seat as inference, not a counted fact.)* |

*Line numbers for the sweep plan are as of the audited commit; that file has uncommitted edits shifting
them ~32 lines in your working copy.*

---

## 2 · Did the commits tell the truth?

**86 commits in the window. 51 make a checkable claim. 35 are neutral records.**

| verdict | count | what |
|---|---|---|
| **TRUE** | **39** | Gate and hook fixes, source refactors, ship and wiring fixes, walk-coverage features, deletions — each confirmed against its diff |
| **FALSE** | **0** | No commit message asserts anything its diff contradicts |
| **OVERSTATED** | 2 | Both the same shape: a live-run result stated as fact with no artifact. `b6d617b` — *"865 tests collect, 169 live executions with zero failures"*. `76657aa` — *"All seven produce output identical to their pre-migration capture."* The structural changes in both are real; the verification sentences are not evidenced. |
| **UNCHECKABLE** | 5 | Claims about things outside this repository — a push to a team remote, a colleague's machine, a live-app restore |
| **not opened** | 8 | Named by sha and subject in the lot's own tail. None rounded into TRUE. |

This replaces the previous audit's framing of "31 claims, 12 judged, 19 unjudged" — that arithmetic was
never the real population.

---

## 3 · Did the plans do what they said?

| grade | count | what |
|---|---|---|
| **Kept** | **21** | Eleven plan promises plus checkpoint waves 1–10, each with the commit that did it |
| **Broken** | 1 | PLAN_59 — section 1.7 |
| **Deferred, no closure path** | 1 | 59A/59D — section 1.8 |
| **Changed mid-flight, recorded** | 1 | A guardrail criterion re-homed to a named custodian. The custodian exists and names the obligation — **but has never run, and the criterion has never been measured** |
| **Ungradeable** | 1 | Waves 11–15 is a documentation-only commit: zero code changed, so its recorded outcomes cannot be confirmed or denied |

The seat also corrected me: I said that run was fifteen commits. It is **eleven**.

---

## 4 · What the previous audit got wrong

**Of roughly thirty work units in that audit, exactly one ever signalled that it finished.** Six were
incomplete and treated as finished — **including the report you were handed**, which never wrote its own
sign-off; the instruction telling it to sits unexecuted at its line 404.

One unit had written into its own status file that it left three things unwritten. That was banked as a
completed contest and cited four times in your report. A number in that report was credited to a
contesting seat that only derived it in passing, outside its assigned work, before dying — the table it
appeared in was built by the dispatcher and placed in the seat's evidence folder, where its location read
as authorship.

**One caveat that convicts me rather than that audit:** three of three fresh units here also filled every
slot and skipped their completion token. That is my ticket template — the token instruction sits after the
last slot. What survives regardless is the banked-as-complete half, which rests on those units' own
written statements that they were incomplete.

**The "one of thirty" headline rests on a single derivation.** A second seat attacked it with the raw
execution logs and confirmed three specific things before dying — the one complete unit is genuinely
complete, a sampled incomplete one genuinely incomplete, three rows needed correcting without status
change — but its citation for the headline itself was the first seat's own log. Not independent.

---

## 5 · Where the work held up

Roughly **630 lines of removals** across the highest-risk committed files were read and found legitimate:
self-tests moved into proper test files with call sites updated, comments compressed without touching the
checks underneath, stale paths corrected, a proxy wrapper removed only after decorators replaced it.

**The uncommitted work is mostly good too** — all 41 modified files were read: fail-closed fixes, chain
state that now pauses on bad state instead of continuing, orchestrator failures that no longer fall
through to success, a malformed SQL `WHERE  AND` fixed. The problem is not the work; it is that it is
uncommitted while committed files depend on it.

Surface counts reproduced independently: 18 agent files with no source, 9 orphan hook files. The seventeen
agent definitions matching their sources held on a **2-of-17 spot check**, which the checking seat declared.

---

## 6 · Consolidation — the efficiency question

You asked whether four files could be one, or each of the four smaller. A dedicated investigation ran.

### Where the same thing is said in more than one place

- **Browser-tool doctrine** is stated twice — `.claude/rules/browser-tool.md` (130 lines) and
  `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (216 lines) repeat the same transport roles, the same
  "default = CLI" ruling, and the same `playwright-cli` vs `npx playwright` table.
- **"Consult navigation first"** is stated in three files: `CLAUDE.md`, `AGENT_SHARED_RULES.md`, and
  `navigation.md` itself.
- **Identity hook semantics** are stated in three: `CLAUDE.md`, `hooks-identity.md`, and the identity skill.
- **The client jargon ban** is stated in three: the deliverable rule, and two agent prompts that copy it.

### What has accumulated

| where | current cost | what it means |
|---|---|---|
| `plans/pending/` | **128 files, 24,023 lines, 2.2 MB** | Executable plans mixed with large read-only audit registers. No retention rule. |
| `_TRIPLAN_RECONCILIATION.md` | **3,417 lines** | A collision matrix, a staged register, an imported finding set, a coverage ledger and a wave log, all in one pending file. Realistic as an index: 400–700. |
| `.claude/collaborator-memory/` | **140 files**, of which **62 have no reference anywhere else in the repository** | The seat explicitly warned: a loader may read every file in that directory regardless of references. **Do not delete on the grep alone.** |
| `_archive/` | **55,797 files, 1.8 GB, untracked** | Found when my staging choked on it. |
| `~/.claude/delegation/` | **2,023 files**, 17 setup-managed; `reports/` holds 1,627 (6.8 MB) | Per-run accumulation, no retention rule. |
| `~/.copilot/agents/` | 35 files, 17 current; **7 with doubled name prefixes** from a broken copy step | |
| `~/.claude/hooks/` | 20 files: 11 current, 7 dated backups, **2 oneliners files — one is a live hook, not a backup** | |
| `.claude/state/` · `~/.copilot/` root | 17 per-session warning files; 4.6 MB stale DB backups; a 139 MB session store | *these three rows are mine and were never reviewed* |

**Candidates, not verdicts.** Every proposed merge in the full lot carries a *"what would break"* column —
which references would dangle, which line anchors would move — because you review these one at a time.
Nothing here should be deleted on the strength of this table.

---

## 7 · What was never checked

**Never run:**
- Line-by-line judgment of the gitignored and home-directory surfaces. Those got inventory and parity
  comparison; nobody read what changed inside them.
- The first audit's own self-grading instrument, never re-examined by anyone this run.

**Started, not finished:**
- The attack on the completion census stopped at two of seven sections; three of its four attack axes
  never ran, including the check on who really produced which numbers.
- **The census's author never answered its reviewer.** That fight is still one-sided. (The surface map's
  fight completed: four concessions, two partials, and the author caught an error in the attack.)
- The efficiency investigation is in flight.

**Named tails inside completed work:**
- 8 in-scope commits not opened, by sha.
- 14 staged untracked files not individually content-audited, by name and size.
- The content-level review's unread files with deleted-line counts — largest are client test-case documents
  (outside your scope) and `plans/INDEX.md` at 1,289 lines, but **`check-identity-switch.mjs` at 89 deleted
  lines is in that tail and is in scope.**
- Nine plan items ungraded; five omission criteria sets not re-run.
- The 35 commits classified neutral were excluded by reading subjects, not diffs.

---

## 8 · Where I was wrong

**Eighteen defects this run were mine. Zero were the seats'.**

Two of them — 16 and 17 — happened *after* I had written the corresponding lessons into my own memory
files. That is the sharpest evidence in this report for why 1.35 matters: writing a rule down is not the
same as it firing. The eighteenth is the same shape one level up: my own operating plan told me how to
keep the ledger, and I read that plan, and then kept the ledger a different way for twenty dispatches.

| # | what I did | how it surfaced |
|---|---|---|
| 1 | Staged a census but copied none of the 207 execution logs — it ran on three of four required records | the seat's own gaps section |
| 2 | Copied files without preserving timestamps, so "touched last week?" was unanswerable | the seat declared it undeterminable rather than guessing |
| 3 | Wrote a timestamp sidecar that produced only headers | I caught it before dispatch |
| 4 | Sent two reviews to attack documents I never staged | *"This is a fatal blocker. I cannot attack a document that was not provided."* It halted with no assumptions. |
| 5 | Under-budgeted a review at 180 credits against an 874-file input and shaped it to read for eight steps before writing. It died at two slots of seven. | its own status file |
| 6 | Called a ledger warning harmless three times without checking. Also repeated a seat's "seven weeks" arithmetic — it is three | a later seat, and the defending author, both caught it |
| 7 | Built a ticket template whose completion token sits after the last slot — three of three units skipped it | three consecutive returns |
| 8 | Wrote in the plan that the first audit's evidence pack "is not on disk anywhere." It exists, with 13 files | the terminal judge |
| 9 | Told a worker to read the live repository — my own plan documents that workers cannot leave their clone, and I had read that section that day | it refused to substitute a different subject and signed off correctly |
| 10 | Staged a file to one clone and referenced it from another | the seat declared the fallback rather than hiding it |
| 12 | Wrote that a fresh clone is broken in three places. It is not — all three wirings are uncommitted-worktree-only and absent at the pinned commit. The seat had said so precisely by citing diff line ranges; I turned its conditional into a live break. | **my own re-check instrument failed on it**, which is what an instrument is for |
| 11 | My staging copied untracked directories and ran away on `_archive/` — 23,257 files before I killed it; the residue then survived cleanup and inflated the manifest to 27,112. **I nearly dispatched against a staging whose manifest was a lie.** | I caught it by checking the count against the copy list instead of trusting it |
| 13 | My first attempt to reproduce the orphan population returned zero. The timestamp rows are date-then-tab-then-path, so my extraction pulled the time field and every "path" was the string `00:00` | I ran a known-positive before trusting the rerun, because a zero is not a result until the probe is shown able to find something |
| 14 | My corrected rebuild gave 11 where the seat had 74. Two over-exclusions, both mine: I dropped the memory directory as runtime churn — it is 45 written files — and I excluded every file in the install directories rather than only those with a real counterpart, which dropped the very gate backup the seat had flagged | I checked the gap instead of preferring my own number |
| 15 | **The seat caught me on a fact.** I built the "no repository counterpart" test against install *target* directories and never against the repository's memory *source* — the directory `CLAUDE.md` itself names. Thirty-one of my 72 orphans have a counterpart there. The real count is **41**. | the judging seat disputed the exclusion in its own findings; I re-ran its check myself and it was exactly right |
| 16 | A second broken probe, two hours after the first. I searched both copies of a rule file for a phrase and got zero from each, which read as a refutation of the seat's claim. The phrase is line-wrapped and capitalised, so no single-line search could ever have matched it | I ran a known-positive on the same file before believing the zero. The seat was exactly right. The rule held because I applied it, not because I remembered it. |
| 17 | I wrote that the repository and the machine "state one version of a rule and load a different one." **Zero of the nine diffs support that.** None contradicts the other side. I had written the section before the lot that judged it | the lot judged it, and this is the defect I had logged to my own memory one round earlier — committed again immediately after writing it down |
| 18 | Sixteen lots returned and my ledger recorded **zero** as accepted, against an operating plan that says in terms that a lot is unfinished until its row says so and that a resumed session restarts at the first unfinished row. The judgement was real; the bookkeeping of it was not. **A session resuming after a compaction would have restarted this entire audit from its first lot.** | re-reading my own plan, which is the only reason it was caught |

I also attached a real quote to the wrong file — the *"NOT REGISTERED"* line is verbatim from
`selfclean-sweep.sh` line 2, not from `sweep.mjs`. Same four-file group, wrong member.

And I substituted my own summary of three skills for the skills themselves, then skipped three obligations
the summary had dropped. That is this audit's own thesis, demonstrated on me.

---

## 9 · The count

**Verified twice — ten claims**, each derived by two independent parties that agreed:
the added and deleted line totals · the seven doubled-prefix agent files · the orphan counts · the
misattributed count in the old report · the banked-incomplete unit · the source-to-installed pairing rule ·
the two gate differences · **the self-cleaner** · **the scorecard gap being three weeks, not seven** ·
**the memory sync gap and its shape — four cosmetic, five machine-only, none contradicting (1.35)**.

**In four of those ten, one of the two derivations is mine** — made before the seat ran and withheld from
its instructions, which is what makes the agreement meaningful rather than an echo. The tenth is the
sharpest of the set: the seat and I *disagreed*, it was right, and the disagreement is what produced the
finding.

**Not verified twice — ten claims**, numbered so the count is checkable rather than asserted:

1. the slop sweep's unreached boundary (1.55)
2. the fresh-clone landmines (1.1)
3. the stale rule instruction (1.5)
4. the archive directory (1.6)
5. PLAN_59's two red checks (1.7)
6. the 59A/59D deferral (1.8)
7. the omission rows (1.9)
8. the commit-claims result (section 2)
9. the plan promise ledger (section 3)
10. the consolidation candidates (section 6)

**10 claims verified twice · 10 not verified · both lists are directly above · section 7 lists the work
that never ran at all.**
