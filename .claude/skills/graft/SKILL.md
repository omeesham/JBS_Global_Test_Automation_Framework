---
name: graft
description: Graft lifecycle — split an incoming colleague ref into three lanes (their NEW territory taken as-is; their edits to code we already have tried at code level for blast radius; framework-behaviour changes tried as guilty until proven right), then splice only what is safe, verify fidelity vs the source ref, and sync the git index to the working tree so the disk never lies. Protects our codebase from their incoming code; it does not test, verify, or repair their work. Use when grafting, splicing, or integrating hand-ported code from a colleague's branch outside the pipeline.
user-invocable: true
auto-calls: identity
tools: Read, Glob, Grep, Bash, Write, Edit
---

# /graft — Graft Lifecycle (Classify → Take → Try → Splice → Sync)

This skill has three jobs, and they pull against each other on purpose.

**Job 1 — speed on their NEW territory.** The files their ticket *created* — a new module's page
objects, its specs, its selectors, its test data, its test cases, its test plan, its walk evidence,
its own plan file — are theirs. We take them as delivered. We do not re-review their craft, rewrite
them to our taste, or hold the ticket while we improve someone else's homework. If what they
delivered is weak, that is their name on it and their problem to answer for. Grafting is not a
quality gate on their labour.

**Job 2 — protection of what already works here.** A branch that adds a new module does not only add
that module. It also *edits ours*: shared page objects, base classes, components, barrels, fixtures,
shared selectors, common test data, run config, existing specs belonging to other modules, and the
one workbook that holds every module's test cases. Those edits arrive wearing a deliverable's
clothes. Job 1 says nothing about them, and the fast lane must never touch them. Every incoming edit
to a file **that already exists in our `main`** is tried at **code level** for blast radius before it
is spliced.

**Job 3 — paranoia on anything that changes how this framework behaves.** Hooks, gates, rules,
learnings ledgers, mistakes ledgers, skills, agent doctrine, config ramp knobs, check scripts,
runtime, root and per-client run config. These are not deliverables. They rewrite what every future
session on this disk believes and enforces. A colleague grafting a loosened gate into this repo
degrades the framework permanently and silently, and the degradation outlives the ticket. Every one
of these arrives **guilty until proven right**, and is tried hunk by hunk before a single line is
spliced.

## The responsibility line (read this before every graft)

> **Their code being bad is on them. Their bad code breaking our clean code — and us grafting it
> anyway — is on us.**

The whole skill follows from that one sentence:

- **We protect our codebase from their incoming code. That is the entire job.**
- We never audit their new module's quality. We never fix, improve, complete, or tidy their code. We
  never take ownership of their defects. If their module is broken, it stays broken and it stays
  theirs.
- **We do not test.** Not their module, not ours. No spec runs, no E2E, no "prove it still works".
  Testing their work would be adopting their work; re-testing ours is redundant, because if we let
  nothing through that alters our existing code, our existing code is by construction unchanged.
- The graft therefore makes **no** works / green / verified / tested claim about anything. LR-059 and
  LR-060's verification obligations attach to the person who later *runs* or *ships* the module —
  they do not attach here, because this skill never claims a behaviour. Say "grafted", never "green".

Job 2 answers exactly one question, and it is not a quality question and not a behaviour question:

**"Does this hunk change code we already have?"**

If yes, we keep ours. A blast-radius rejection is **not** a criticism of their work and is **never**
repaired by us — we keep our version, splice their module around it, and report the collision to
Rutvik and back to the colleague. Fixing their code would take their defect onto our name; that is
the one thing this skill will not do.

**The single thing we do run** is a Tier F gate's own `--self-test` (§2.4 Q3) — an incoming hook that
misfires wedges every future session on this disk, so that is self-protection, not verification of
their work. Nothing else executes.

The invariant the original skill enforced still holds and is unchanged: **a clean graft makes the
disk truthful. No ledger, no marker, no reconciliation file — the synced index IS the
reconciliation.** It prevents the NM-2265 class of defect: code `git add`-ed early, corrected later
in the working tree, never re-staged, so a later commit ships a stale version that was never the
version anyone looked at.

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

- **Manual**: user says "graft", "splice", "integrate from branch", "port code"
- Taking a colleague's finished ticket branch into this repo (NOT via the pipeline `/chain`)
- Hand-porting a feature from another branch that needs convention adaptation

## Identity Gate

Runs `/identity` Step 1.5 with caller=`/graft`. No-op if a compatible identity is active.

---

## Step 0: Classify the incoming ref into three lanes

Nothing gets spliced before the incoming set is split. Run the classifier:

```bash
bash .claude/skills/graft/classify-incoming.sh <source-ref>
```

It prints one `D-NEW  <path>` / `D-COMMON  <path>` / `F  <path>` line per changed file and a count
summary. Self-test with `--self-test` if you have any reason to doubt it.

### Axis 1 — whose future does this change (D vs F)

The first axis is **not** "does this ship to the client". It is **whose future does this change**.

| Tier | What it is | Examples | Posture |
|---|---|---|---|
| **D — DELIVERABLE** | The colleague's ticket work product. Lands, and their name is on it. | `clients/*/src/**`, `clients/*/tests/**`, `clients/*/config/**`, `clients/*/testcases/**`, `clients/*/docs/**`, `specs_planning/test-cases/**`, `specs_planning/test-plans/**`, `specs_planning/field-inventories/**`, dated walk evidence, their own `plans/**/PLAN_*.md` / `SUBPLAN_*.md` | Split again on Axis 2. |
| **F — FRAMEWORK** | Anything that changes how this framework behaves in every future session. | `.claude/hooks/**`, `.claude/rules/**`, `.claude/skills/**`, `.claude/agents/**`, `.claude/context/**`, `.claude/settings.json`, `.claude/*-config.json`, `.claude/collaborator-memory/**`, `docs/read_only_docs/**`, `scripts/**`, `.githooks/**`, `pipeline/**`, `src/**`, root `CLAUDE.md` / `package.json` / `tsconfig.json` / `playwright.config.ts`, `plans/INDEX.md` | Guilty until proven right. Per-hunk trial (Step 2). |

A test-case markdown never ships to the client and is still Tier D — it is their ticket output.
A one-line config knob ships nothing and is Tier F — it changes what my gates do.

### Axis 2 — is this THEIR ground or OURS (D-NEW vs D-COMMON)

Tier D is **not** one lane. The fast lane exists because a file that did not exist here before cannot
regress anything here. The moment their diff touches a file we already have, that reasoning is gone.

| Lane | Machine test | Posture |
|---|---|---|
| **D-NEW** | Status `A` in `git diff --name-status main...<ref>` **AND** `git cat-file -e main:<path>` fails (the path is absent from our `main`) | Take as-is. Fast lane. Nothing of ours to regress. |
| **D-COMMON** | Anything else in Tier D — status `M`, `D`, `R`, or an `A` on a path our `main` also has, **or** any path on the shared-surface force list below | Blast-radius trial (Step 1.5), per hunk. |

Both conditions are required for D-NEW. Status `A` alone is not enough: `main...<ref>` is scoped to
the merge-base, so a file both sides added independently shows as `A` while our `main` already has
its own version. Grafting that as "new" silently overwrites ours.

**Shared-surface force list** — D-COMMON regardless of git status, because a regression here lands on
other collaborators, not on the ticket:

- `clients/*/testcases/*.xlsx` — the workbook (see below)
- `clients/*/src/**/index.ts` — barrels
- `clients/*/src/pages/components/**` and any base page / base class
- `clients/*/src/fixtures/**`, `clients/*/src/utils/**`, `clients/*/src/setup/**`,
  `clients/*/src/types/**`, `clients/*/src/reporter/**`
- `clients/*/tests/**/auth.setup.ts`

Costing one extra look on a genuinely-new shared helper is the intended trade. The reverse error is
a silent regression on someone else's green module.

### The workbook is never grafted

`clients/<id>/testcases/encore_test_cases.xlsx` is a **whole-repo aggregate**, built from every
module's markdown by `npm run xlsx:build`, which archives HEAD. Their branch rebuilt it from *their*
HEAD, so it contains their rows plus whatever was on main at their merge-base — and is missing every
test case landed since. Taking their binary wholesale silently deletes other collaborators' test
cases, and being a binary, nothing in a diff review will show you what went missing.

**Standing disposition: REJECT-KEEP-OURS, always.** Splice their test-case *markdown* (that is
D-NEW), then rebuild the workbook here from the merged markdown. Never splice their `.xlsx`. This is
the sharpest instance of the whole Job 2 problem: their edit was correct on their disk and
destructive on ours.

### Three boundary cases the F lists exist to separate

- **`clients/<id>/CLAUDE.md`** → **F**. It carries the client's `LR-ENC-*` rules. A colleague
  editing it is editing doctrine, not a deliverable.
- **`clients/<id>/specs_planning/_internal/agent-mistakes.md`, `agent-activity-log.md`,
  `bug-archetypes.md`, `field-case-generation.md`, `field-inventory-spec.md`,
  `active-experiments.md`** → **F**. These are the learnings and mistakes ledgers. Every future
  session reads them. Dated evidence artifacts in the same directory stay **D**.
- **`clients/<id>/playwright.config.ts`, `package.json`, `tsconfig.json`, `.env.*`,
  `scripts/**`** → **F**. They ship, and they also change how specs execute on my disk. LR-050's
  graduating incident was exactly this: a drifted `fullyParallel: true` that nobody noticed for six
  days.

### Default direction

**Anything the classifier does not recognise is Tier F, and anything it cannot prove is new is
D-COMMON.** Unknown costs one extra look; a mis-filed D-NEW costs a silent regression on a clean
deliverable, and a mis-filed Tier D costs a silently degraded framework. Same posture as LR-074
§74.3 — the deny set is "what I cannot read", not "what I have thought of". Do not widen the D-NEW
test or the Tier D lists to make a graft go faster; widen them only when a genuinely new *class* of
ticket work product appears, and add a self-test fixture in the same edit.

### The speed guarantee

If the classifier reports **0 Tier F files and 0 D-COMMON files**, skip Steps 1.5 and 2 entirely.
The graft is pure fast lane: splice, sync, done. That is the common shape of a clean net-new-module
delivery, and it stays fast.

If either lane is non-empty, **the lanes land as separate index states** (Step 3 Phase A / B / C).
A contested change never holds the clean part of the delivery hostage. If every D-COMMON and Tier F
hunk is rejected, their new module still lands today.

---

## Step 1: D-NEW — take it as-is

Splice D-NEW in one batch pass. Do not review it file by file. Do not audit their assertions, their
naming, their selector choices, or their coverage. Do not run their specs. That is the colleague's
work and the colleague's accountability.

### What "as-is" does not cover

Three checks still run, because they protect **my disk**, not their work quality. None of them is a
judgement about how good their code is, and none of them executes their code:

1. **Path legality.** Every D-NEW path must survive the client-surface classes A1–A4
   (`.claude/hooks/lib/check-client-surface-write.mjs`): no self-nested `clients/`, no stray
   dot-directory, no loose file at client root, no in-place archive. A "deliverable" change that
   lands outside the client surface was mis-classified — re-run Step 0.
2. **Secrets.** No credential, token, connection string, or `.env.local` content rides in. Scan the
   Tier D diff before splicing.
3. **Ship-gate compliance.** The result must still pass `node scripts/verify-no-forbidden.mjs`
   (LR-049). A deliverable that cannot ship is not a deliverable.

Any of the three failing is a **HOLD**, reported to Rutvik and back to the colleague — never a
silent local fix. Silently repairing their delivery hides the defect from the person who needs to
learn it.

### Their module's correctness is not our problem

We do not run their specs, so we will not know whether their module works, and that is intentional.
If their code is broken, it lands broken and it lands with their name on it. The one thing we owe is
that it landed *without touching ours* — that is Step 1.5's job, and it is settled by reading code,
not by running it.

---

## Step 1.5: D-COMMON — the blast-radius trial (code level, no execution)

Run only if Step 0 found D-COMMON files.

### 1.5.1 What this trial is, and what it is not

This is **not** a code review and **not** a test. Do not read their hunk asking whether it is good,
idiomatic, well named, or well tested. Do not run anything to find out. Read it asking one thing
only:

**Does this hunk change code we already have?**

Granularity is **per hunk**, never per file. A shared page object can be ACQUIT on an added method
and REJECT on a changed selector in the same file.

The colleague's commit message, PR description, or plan prose is a **claim**, not evidence
(`feedback_worker_report_claims_need_own_grep`). "Refactor, no behaviour change" is the single most
common wrapper on a behaviour change. Read the diff yourself.

### 1.5.2 Auto-REJECT: deletions and removals

Anything **removed** from a pre-existing file is rejected on sight. It does not enter the four
questions. Deletions are the highest-blast-radius edit in a graft and the only class that would be
invisible even to a test run — nothing goes red when a test case, an assertion, or a spec simply
stops existing.

- A pre-existing file deleted (status `D`) or renamed away (status `R`)
- An exported symbol, method, or type removed or renamed in a shared module
- A selector key removed from a shared selector file
- A row, field, or case removed from shared test data
- A `test(` / `expect(` removed from an existing spec belonging to another module
- A test case removed from an existing `test-cases/*.md`
- Any workbook `.xlsx` change (§ "The workbook is never grafted")

Overturned only by Rutvik's explicit in-chat instruction, one-shot, per hunk.

### 1.5.3 The four questions

Each surviving D-COMMON hunk answers all four, from the diff and from grep, or stays rejected.
Every one is answerable without executing a line.

1. **Who else depends on this file?** Grep the importers across the whole client surface, not just
   their module:
   ```bash
   grep -rn "$(basename <path> .ts)" clients/<id>/src clients/<id>/tests
   ```
   If the only consumers are files from *their* D-NEW set, the hunk cannot reach our code →
   **ACQUIT**. This is the common, cheap outcome, and it is decided entirely by grep.
2. **Is it purely ADDITIVE, or does it ALTER?** Additive is safe: a new export, a new method, a new
   selector key, a new data row, a new `test(` appended. Altering is not, and altering means any
   edit to a line that was already there — a changed signature or default, a changed selector value,
   a changed shared data value, a changed method body, a changed timeout or wait, a changed
   assertion inside an existing spec, a re-ordered fixture, a re-pointed barrel export. **Any
   altered pre-existing line → REJECT-KEEP-OURS.** No exceptions for "it's equivalent" or "it's a
   cleanup"; equivalence is a behaviour claim, and we do not evaluate behaviour claims.
3. **Did OUR side touch this file too?** A silent overwrite of our own newer work is the worst
   outcome available here, and it produces no conflict marker:
   ```bash
   git log --oneline $(git merge-base main <ref>)..main -- <path>
   ```
   Non-empty → **HOLD**. Never resolve a touch collision by taking theirs.
4. **Is it on the self-protected control surface?** Cross-check against §2.3 — a `clients/*/scripts/**`
   or run-config path that reached this lane was mis-classified; send it to Step 2.

### 1.5.4 Verdicts

Three, and only three, per hunk:

- **ACQUIT** — additive only, and it reaches nothing of ours (Q1/Q2). Splice it in Phase B.
- **REJECT-KEEP-OURS** — **we keep our version of that hunk** and splice their module around it. We
  do not patch their module to compensate, and we do not fix their hunk. Record it in the receipt and
  report the collision to the colleague — they own the decision about what to do with it.
- **HOLD** — needs Rutvik's call: a touch collision (Q3), or their new module cannot run without the
  rejected hunk (§2.6 dependency trap, same disposition).

Never a blanket verdict. "Their shared-file edits look fine" is not a verdict.

---

## Step 2: Tier F — the trial (guilty until proven right)

Run only if Step 0 found Tier F files.

### 2.1 The default verdict is REJECT

Every Tier F hunk starts rejected. It gets grafted only when it earns an explicit **ACQUIT** with
evidence I gathered myself. Granularity is **per hunk**, never per file and never per branch — a
file can be ACQUIT on two hunks and REJECT on a third.

The colleague's commit message, PR description, or plan prose is a **claim**, not evidence. Re-run
their check, re-read their cited file, re-grep their asserted line yourself before believing any of
it (`feedback_worker_report_claims_need_own_grep`).

### 2.2 Auto-REJECT: weakenings

A change that reduces an existing protection is rejected on sight. It does not enter the five
questions. It is overturned only by Rutvik's explicit in-chat instruction, one-shot, per hunk.

This is the single most important list in the skill, because it is the exact shape of *"a collaborator
hit a gate, so the collaborator removed the gate."*

- A gate mode knob downgraded in any `.claude/*-config.json` — `deny` → `announce` → `off`
  (`guardrail-config.json`, `closure-config.json`, `identity-gate-config.json`,
  `selfclean-config.json`, `retention-policy.json`)
- An allowlist widened — `ALLOWED_DIRS`, `ALLOWED_ROOT_FILES`, `DOT_DIR_EXEMPT`,
  `walk-unresolved-allowlist.json`, or any new exemption / skip / bypass branch
- A check deleted, or its call site removed from `package.json`, `.githooks/**`, or
  `.claude/settings.json`
- A hook unwired or reordered in `.claude/settings.json`
- A regex loosened, an assertion softened, a threshold raised, a timeout extended to make something
  pass
- `--no-verify`, `--force`, `|| true`, `2>/dev/null`, or `continue-on-error` added anywhere on a
  gate path
- A `HARD STOP`, `[HALT]`, or `FORBIDDEN` line removed from an agent file, skill, or rule
- A rule's `Trigger:` narrowed so it fires less often
- A test fixture deleted or an expected verdict flipped to match new behaviour instead of the
  behaviour being fixed

### 2.3 HALT: the self-protected control surface

These are never auto-grafted at any verdict. Stop and ask Rutvik, per LR-074 §74.1 — changing them
requires his in-chat GO plus a grant he writes:

- `.claude/settings.json`
- `.claude/hooks/visibility-reconcile.sh` and `.claude/hooks/lib/check-visibility-reconcile.mjs`
- `.claude/skills/ultra-agents/copilot-worker.sh` and the delegation grant files
- Anything under `.claude/delegation/`
- Any `.claude/skills/**/SKILL.md` — skill definitions are doctrine and are gated by
  `~/.claude/hooks/delegation-gate.mjs`

### 2.4 The five questions

Each surviving Tier F hunk answers all five, with evidence, or stays rejected.

1. **What incident produced this?** LR-069 §3.4: no incident, no gate. A hook, gate, or rule change
   with no named graduating incident is REJECTED. The incident must be something I can read — an
   `agent-mistakes.md` row, a plan, an RCA, a bug ID. "It seemed safer" is not an incident.
2. **Does it weaken an existing protection?** Cross-check against §2.2. If yes → auto-REJECT, stop
   here.
3. **Does it fire correctly on MY disk?** Their gate ran against their tree. Run its `--self-test`
   here — **this is the one execution this skill permits**, because an incoming hook that misfires
   wedges every future session on this disk. Then run the check that actually matters: point it at
   **real work it must NOT block**. A guard whose corpus contains only attacks goes green while
   refusing legitimate work, and a false DENY outranks an exotic bypass
   (`feedback_a_guards_test_corpus_must_contain_what_it_must_not_block`). A gate arriving with no
   must-not-block corpus is REJECTED. Also confirm the PreToolUse budget: ≤200ms per call
   (LR-069 §3.4).
4. **Does it collide with what we already have?** Check for a duplicate `LR-NNN` (a collision
   silently overwrites the existing rule, LR-020), a skill-name collision, a hook-name collision, a
   config-key collision, and — the one that matters most — a **duplicate mechanism**. If they layered
   a new gate on top of an existing gate covering the same class, that is a REJECT: LR-069 §3.5 says
   recurrence convicts the prior fix, and the correct move is rewire-or-retire, never layering.
5. **Is it on the self-protected control surface?** Cross-check against §2.3. If yes → HALT and ask.

### 2.5 Verdicts

Three, and only three, per hunk:

- **ACQUIT** — evidence answered all five. Splice it in Phase C.
- **REJECT** — drop it. Record the hunk and the reason in the receipt, so Rutvik knows what he is not
  carrying and the colleague gets a real answer when they ask where their change went.
- **HOLD** — needs Rutvik's call. One line, the options, and a recommendation.

Never a blanket verdict on a branch. "The framework changes look fine" is not a verdict.

### 2.6 The dependency trap

The most common way rot actually enters: a D-NEW file that will not compile or run without a hunk we
rejected in Step 1.5 or Step 2. Their page object imports a helper they added to `src/`; their spec
needs the selector they changed in our shared selector file. Reject it and their module breaks.

**Do not resolve this by accepting the change to make things compile.** That reasoning — *"I had to
take it or nothing works"* — is how every weakening and every regression in this skill would get in.
It is also not resolved by us rewriting their module to drop the dependency: that hides the coupling
from the person who created it and puts their defect on our name.

Disposition: **HOLD**. Report it to Rutvik with the specific dependency named, and report it back to
the colleague. The legitimate outcomes are: Rutvik authorises the hunk, or the colleague re-delivers
without the coupling. "Their module is broken on our disk" is an acceptable end state — it is not
our defect and not our repair.

---

## Step 3: Splice deterministically

Write the accepted code into the target files with an **anchor-first, atomic** splice:

- Validate EVERY insertion anchor across ALL target files BEFORE writing any file. Each anchor must
  match exactly once — abort loudly if any anchor is missing or ambiguous.
- Never partially splice. If one anchor fails, write nothing (no half-applied state to recover).

Three phases, in this order:

- **Phase A — D-NEW.** The whole batch. Runs regardless of what Steps 1.5 and 2 concluded.
- **Phase B — D-COMMON ACQUIT only.** Skipped entirely when Step 1.5 acquitted nothing.
- **Phase C — Tier F ACQUIT only.** Skipped entirely when Step 2 acquitted nothing.

Do NOT `git add` in any phase. The working tree now holds unverified ported code.

## Step 4: Verify the splice against the source ref

This is a **fidelity and containment** check on the splice itself — did the right bytes land, and did
nothing land that we rejected. It is not a review of their content and not a test of anything.

1. Diff the spliced code against the source ref for completeness — every ACQUIT'd hunk present, in
   full.
2. Check naming and import paths resolve in our tree (read, do not run).
3. **Confirm every rejection held.** For each REJECT-KEEP-OURS hunk, re-read the target file and
   prove our version is what is on disk. A splice that quietly carried a rejected hunk in with its
   neighbours is the exact failure this check exists to catch — and with no test run anywhere in this
   skill, this read is the only thing standing between a rejection and a silent regression. Do it per
   hunk, by eye, against `git show main:<path>`.
4. Fix ALL fidelity discrepancies **in the working tree** — corrections stay on disk, still not
   staged. "Fidelity" means *our splice was wrong*, never *their code was wrong*.

## Step 5: Sync index to the tree — THE INVARIANT

Only after Step 4 is complete and no further edits are pending:

```bash
git add <graft-paths>                 # stage every grafted path
git diff --quiet -- <graft-paths>     # assert zero index-vs-worktree drift (exit 0 required)
```

If `git diff --quiet` exits non-zero, the graft is NOT done — a path drifted between staging and now;
re-stage and re-assert until it exits 0.

- **Never `git add` mid-splice** — early staging plus a later working-tree correction is exactly what
  created the stale index in NM-2265.
- Phases A, B and C may sync separately. The final assertion runs over the **union** of all three
  path sets.
- **No commit.** The graft ends staged-and-consistent, disk-only, until a separate ship session.
- **Nothing rejected in Step 1.5 or Step 2 may be on disk.** Rejected hunks are not staged, not
  stashed, not left as commented-out code, not parked in a branch-local file. Verify:
  `git status --porcelain` shows no unexpected path, and every REJECT-KEEP-OURS file matches our
  version.

## Step 6: Receipt + activity log

Emit a receipt Rutvik can read in ten seconds:

```
GRAFT <source-ref> → main
D-NEW taken as-is:      N files — <one line: what feature>
D-COMMON ACQUIT:        N hunks — <what, and why it reaches nothing of ours>
D-COMMON KEEP-OURS:     N hunks — <what they changed, what we kept, reported back>
D-COMMON HOLD:          N hunks — <needs your call>
Tier F ACQUIT:          N hunks — <what, and the incident that justified it>
Tier F REJECT:          N hunks — <what, and why not>
Tier F HOLD:            N hunks — <needs your call>
Rejections held:        verified per hunk against git show main:<path>
Index == worktree:      clean
Not claimed:            nothing was run or tested — no green/verified claim on their module or ours
```

An empty lane is stated explicitly (`D-COMMON: none`, `Tier F: none`), not omitted — silence reads as
"not checked". The `Not claimed` line is mandatory and never dropped: it is what stops a downstream
reader treating a grafted module as a tested one.

Then record the graft per LR-028 session bookkeeping (activity-log row listing the grafted files).

---

## Backstop (defense-in-depth, not the prevention)

`.claude/hooks/graft-ship-gate.sh` blocks a Claude-issued `git commit` if any staged file still has
unstaged worktree changes — catching a drift that slipped past Step 5. **Scope**: it gates ONLY
Claude's Bash tool, not a human terminal, a GUI, another agent, or CI. Step 5's invariant is the
actual prevention; the hook is the safety net for the one vector it can see.

Nothing else in this skill is enforced by a hook. Steps 0–2 are agent discipline, and they are
rubber-stampable by construction — the only mechanical part is the classifier, which tells you *what*
needs the trial, not whether you actually ran it. Treat that honestly: a graft receipt claiming
D-COMMON or Tier F verdicts without cited evidence per hunk is worth nothing. This matters more here
than in a skill that ends with a test run, because there is no test run to catch a rubber stamp —
Step 4's per-hunk rejection re-read is the last line, and it only works if it is genuinely performed.

## Verification Artifact (D23)

Confirm a graft is clean (copy-pasteable — replace `<graft-paths>` with the real files):

```bash
git diff --quiet -- <graft-paths> && echo "GRAFT CLEAN: index == worktree" || echo "DRIFT — re-stage before ship"
```

Exit 0 + "GRAFT CLEAN" = safe to ship. Anything else = re-stage required before commit.

Confirm the lane classifier is still sound after any edit to its lists:

```bash
bash .claude/skills/graft/classify-incoming.sh --self-test
```
