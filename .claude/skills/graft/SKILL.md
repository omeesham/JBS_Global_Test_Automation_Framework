---
name: graft
description: Graft lifecycle — split an incoming colleague ref into deliverable work product (taken as-is, fast lane) and framework-behaviour changes (per-hunk trial, guilty until proven right), then splice, verify vs source, prove with a real E2E run, and sync the git index to the tested working tree so the disk never lies. Use when grafting, splicing, or integrating hand-ported code from a colleague's branch outside the pipeline.
user-invocable: true
auto-calls: identity
tools: Read, Glob, Grep, Bash, Write, Edit
---

# /graft — Graft Lifecycle (Classify → Take → Try → Splice → Prove → Sync)

This skill has two jobs, and they pull in opposite directions on purpose.

**Job 1 — speed on the colleague's work product.** Their page objects, specs, selectors, test data,
test cases, test plans, walk evidence and ticket plan are theirs. We take them as delivered. We do
not re-review their craft, rewrite them to our taste, or hold the ticket while we improve someone
else's homework. If what they delivered is weak, that is their name on it and their problem to
answer for. Grafting is not a quality gate on their labour.

**Job 2 — paranoia on anything that changes how this framework behaves.** Hooks, gates, rules,
learnings ledgers, mistakes ledgers, skills, agent doctrine, config ramp knobs, check scripts,
runtime, root and per-client run config. These are not deliverables. They rewrite what every future
session on this disk believes and enforces. A colleague grafting a loosened gate into this repo
degrades the framework permanently and silently, and the degradation outlives the ticket. Every one
of these arrives **guilty until proven right**, and is tried hunk by hunk before a single line is
spliced.

The invariant the original skill enforced still holds and is unchanged: **a clean graft makes the
disk truthful. No ledger, no marker, no reconciliation file — the synced index IS the
reconciliation.** It prevents the NM-2265 class of defect: code `git add`-ed early, corrected later
in the working tree, never re-staged, so a later commit ships a stale version that was never the
tested version.

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

- **Manual**: user says "graft", "splice", "integrate from branch", "port code"
- Taking a colleague's finished ticket branch into this repo (NOT via the pipeline `/chain`)
- Hand-porting a feature from another branch that needs convention adaptation

## Identity Gate

Runs `/identity` Step 1.5 with caller=`/graft`. No-op if a compatible identity is active.

---

## Step 0: Classify the incoming ref into two tiers

Nothing gets spliced before the incoming set is split. Run the classifier:

```bash
bash .claude/skills/graft/classify-incoming.sh <source-ref>
```

It prints one `D  <path>` / `F  <path>` line per changed file and a count summary. Self-test with
`--self-test` (43 fixtures) if you have any reason to doubt it.

### The split axis

The axis is **not** "does this ship to the client". It is **whose future does this change**.

| Tier | What it is | Examples | Posture |
|---|---|---|---|
| **D — DELIVERABLE** | The colleague's ticket work product. Lands, and their name is on it. | `clients/*/src/**`, `clients/*/tests/**`, `clients/*/config/**`, `clients/*/testcases/**`, `clients/*/docs/**`, `specs_planning/test-cases/**`, `specs_planning/test-plans/**`, `specs_planning/field-inventories/**`, dated walk evidence, their own `plans/**/PLAN_*.md` / `SUBPLAN_*.md` | Take as-is. Fast lane. |
| **F — FRAMEWORK** | Anything that changes how this framework behaves in every future session. | `.claude/hooks/**`, `.claude/rules/**`, `.claude/skills/**`, `.claude/agents/**`, `.claude/context/**`, `.claude/settings.json`, `.claude/*-config.json`, `.claude/collaborator-memory/**`, `docs/read_only_docs/**`, `scripts/**`, `.githooks/**`, `pipeline/**`, `src/**`, root `CLAUDE.md` / `package.json` / `tsconfig.json` / `playwright.config.ts`, `plans/INDEX.md` | Guilty until proven right. Per-hunk trial. |

A test-case markdown never ships to the client and is still Tier D — it is their ticket output.
A one-line config knob ships nothing and is Tier F — it changes what my gates do.

### Three boundary cases the lists exist to separate

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

**Anything the classifier does not recognise is Tier F.** Unknown costs one extra look; a mis-filed
Tier D costs a silently degraded framework. Same posture as LR-074 §74.3 — the deny set is "what I
cannot read", not "what I have thought of". Do not widen the Tier D lists to make a graft go faster;
widen them only when a genuinely new *class* of ticket work product appears, and add a self-test
fixture in the same edit.

### The speed guarantee

If the classifier reports **0 Tier F files**, skip Step 2 entirely. The graft is pure fast lane:
splice, prove, sync, done.

If Tier F is non-empty, **the two tiers land as separate index states** (Step 3 Phase A / Phase B).
A contested framework change never holds the client deliverable hostage. If every Tier F hunk is
rejected, the deliverable still lands today.

---

## Step 1: Tier D — take it as-is

Splice Tier D in one batch pass. Do not review it file by file. Do not audit their assertions, their
naming, their selector choices, or their coverage. That is the colleague's work and the colleague's
accountability.

### What "as-is" does not cover

Three checks still run, because they protect **my disk**, not their work quality. None of them is a
judgement about how good their code is:

1. **Path legality.** Every Tier D path must survive the client-surface classes A1–A4
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

### What a red Tier D spec means

If their spec is red because their assertion is wrong, that is theirs — record it in the receipt and
move on; do not fix it. If their spec is red because it depends on a Tier F change we have not
accepted, that is a **graft problem**, not a quality problem — see Step 2.6.

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
   here. Then run the check that actually matters: point it at **real work it must NOT block**. A
   guard whose corpus contains only attacks goes green while refusing legitimate work, and a false
   DENY outranks an exotic bypass (`feedback_a_guards_test_corpus_must_contain_what_it_must_not_block`).
   A gate arriving with no must-not-block corpus is REJECTED. Also confirm the PreToolUse budget:
   ≤200ms per call (LR-069 §3.4).
4. **Does it collide with what we already have?** Check for a duplicate `LR-NNN` (a collision
   silently overwrites the existing rule, LR-020), a skill-name collision, a hook-name collision, a
   config-key collision, and — the one that matters most — a **duplicate mechanism**. If they layered
   a new gate on top of an existing gate covering the same class, that is a REJECT: LR-069 §3.5 says
   recurrence convicts the prior fix, and the correct move is rewire-or-retire, never layering.
5. **Is it on the self-protected control surface?** Cross-check against §2.3. If yes → HALT and ask.

### 2.5 Verdicts

Three, and only three, per hunk:

- **ACQUIT** — evidence answered all five. Splice it in Phase B.
- **REJECT** — drop it. Record the hunk and the reason in the receipt, so Rutvik knows what he is not
  carrying and the colleague gets a real answer when they ask where their change went.
- **HOLD** — needs Rutvik's call. One line, the options, and a recommendation.

Never a blanket verdict on a branch. "The framework changes look fine" is not a verdict.

### 2.6 The dependency trap

The most common way framework rot actually enters: a Tier D file that will not compile or run
without a rejected Tier F change. Their page object imports a helper they added to `src/`; reject the
helper and their spec breaks.

**Do not resolve this by accepting the framework change to make things compile.** That reasoning —
*"I had to take it or nothing works"* — is how every weakening in this list would get in.

Disposition: **HOLD**. Report it to Rutvik with the specific dependency named, and report it back to
the colleague. Do not silently rewrite their code to remove the dependency either — that hides the
coupling from the person who created it. The legitimate outcomes are: Rutvik authorises the Tier F
hunk, or the colleague re-delivers without the coupling.

---

## Step 3: Splice deterministically

Write the accepted code into the target files with an **anchor-first, atomic** splice:

- Validate EVERY insertion anchor across ALL target files BEFORE writing any file. Each anchor must
  match exactly once — abort loudly if any anchor is missing or ambiguous.
- Never partially splice. If one anchor fails, write nothing (no half-applied state to recover).

Two phases, in this order:

- **Phase A — Tier D.** The whole batch. Runs regardless of what Step 2 concluded.
- **Phase B — Tier F ACQUIT only.** Skipped entirely when Step 2 acquitted nothing.

Do NOT `git add` in either phase. The working tree now holds unverified ported code.

## Step 4: Verify vs real source

Audit every spliced change against the authoritative source (the colleague's ref) AND our
conventions:

1. Diff the spliced code against the source ref for completeness.
2. Check naming, import paths, selectors, and patterns match our codebase.
3. Fix ALL discrepancies **in the working tree** — corrections stay on disk, still not staged.

Scope note: this is a *fidelity* check (did the port land completely and in our idiom), not a
*quality* review of Tier D content. Step 1 already settled that their craft is theirs.

## Step 5: Prove with a REAL E2E run

Run the actual Playwright spec(s) for the grafted feature and require green (LR-059: no "works /
verified" claim without driving the real counterpart end-to-end). The E2E validates the **working
tree** — which is exactly why the index must be synced to it afterward, never before.

Run the grafted specs solo or via `--grep`. Never run the full suite
(`feedback_no_full_suite_runs_ever`); report "passes solo", not "suite green".

If a spec fails: diagnose which tier owns the failure before touching anything.

- Tier D content defect → the colleague's. Record it, do not fix it.
- Graft fidelity defect (Step 4 missed something) → fix in the working tree and re-run.
- Dependency on a rejected Tier F hunk → Step 2.6, HOLD.

If any Tier F was acquitted this session, also run `npm run check:spec-quality` on the working tree
before any "done" / "green" / "verified" claim (LR-060 obligation 4).

## Step 6: Sync index to the tested tree — THE INVARIANT

Only after E2E is green:

```bash
git add <graft-paths>                 # stage every grafted path
git diff --quiet -- <graft-paths>     # assert zero index-vs-worktree drift (exit 0 required)
```

If `git diff --quiet` exits non-zero, the graft is NOT done — a path drifted between staging and now;
re-stage and re-assert until it exits 0.

- **Never `git add` before the E2E is green** — that early staging is exactly what created the stale
  index in NM-2265.
- Phase A and Phase B may sync separately. The final assertion runs over the **union** of both path
  sets.
- **No commit.** The graft ends staged-and-consistent, disk-only, until a separate ship session.
- **Nothing rejected in Step 2 may be on disk.** Rejected hunks are not staged, not stashed, not left
  as commented-out code, not parked in a branch-local file. Verify: `git status --porcelain` shows no
  unexpected Tier F path.

## Step 7: Receipt + activity log

Emit a receipt Rutvik can read in ten seconds:

```
GRAFT <source-ref> → main
Tier D taken as-is:  N files — <one line: what feature>
Tier F ACQUIT:       N hunks — <what, and the incident that justified it>
Tier F REJECT:       N hunks — <what, and why not>
Tier F HOLD:         N hunks — <needs your call>
E2E:                 <spec> passes solo
Index == worktree:   clean
```

An empty Tier F section is stated explicitly (`Tier F: none`), not omitted — silence reads as "not
checked".

Then record the graft per LR-028 session bookkeeping (activity-log row listing the grafted files).

---

## Backstop (defense-in-depth, not the prevention)

`.claude/hooks/graft-ship-gate.sh` blocks a Claude-issued `git commit` if any staged file still has
unstaged worktree changes — catching a drift that slipped past Step 6. **Scope**: it gates ONLY
Claude's Bash tool, not a human terminal, a GUI, another agent, or CI. Step 6's invariant is the
actual prevention; the hook is the safety net for the one vector it can see.

Nothing else in this skill is enforced by a hook. Steps 0–2 are agent discipline, and they are
rubber-stampable by construction — the only mechanical part is the classifier, which tells you *what*
needs the trial, not whether you actually ran it. Treat that honestly: a graft receipt claiming Tier F
verdicts without cited evidence per hunk is worth nothing.

## Verification Artifact (D23)

Confirm a graft is clean (copy-pasteable — replace `<graft-paths>` with the real files):

```bash
git diff --quiet -- <graft-paths> && echo "GRAFT CLEAN: index == worktree" || echo "DRIFT — re-stage before ship"
```

Exit 0 + "GRAFT CLEAN" = safe to ship. Anything else = re-stage required before commit.

Confirm the tier classifier is still sound after any edit to its lists:

```bash
bash .claude/skills/graft/classify-incoming.sh --self-test
```
