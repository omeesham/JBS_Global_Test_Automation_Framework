# PLAN_LITERAL_STEP_LABELS_AND_DUAL_REFRESH — write the client's report labels by hand, retire the converter, refresh both remotes

**Status**: Pending
**Identity**: OWNER (Claude runs the pushes; every mechanical transform is delegated)
**PermissionMode**: execute
**Owner instruction (2026-08-05)**: "/planning first, take approval from fable, fix all shit and push to
main of each — as they are, no assumptions of any kind, it's just a refresh not fuckup the existing main."

---

## Bootstrap (read before executing — do not skip)

- `.claude/rules/no-wrappers.md` — why the runtime Proxy was retired; the fix-at-source principle
- `.claude/rules/deliverable.md` — LR-058, shipped client source carries zero internal vocabulary
- `clients/encore/CLAUDE.md` — LR-ENC-006, the client-readable report contract
- `.claude/rules/pipeline.md` — LR-049 ship-via-git-archive; LR-027 execution summary before done
- `plans/done/PLAN_FIX_AT_SOURCE_NOT_WRAPPERS.md` — the 2026-07-31 refactor this plan finishes
- `.claude/skills/push-repo/SKILL.md` and `.claude/skills/push-encore-deliverables/SKILL.md`
- Runbook for pushing from a dirty tree: memory `reference_team_push_worktree_runbook.md`

---

## The problem, in plain words

The Playwright HTML report goes to a non-technical client at Encore. Every step title in it is
supposed to be a short plain-English sentence.

Nobody has ever written one of those sentences. All **793** of them are guessed at runtime from the
method's own name by a converter (`camelToLabel`), with a small override table in a JSON file
covering the seven guesses that came out worst.

Two consequences, both verified this session:

1. **The client reads code vocabulary.** Around a dozen labels leak testing and accessibility terms —
   "Probe edit oracle", "Probe max discount oracle", "Probe override price oracle",
   "Capture import all merge canaries", "Get header aria sort", "Get column aria sort",
   "Get max discount aria invalid", "Get new price aria invalid", "Trigger beforeunload and stay" (×3).
   Both `oracle` and `canaries` were confirmed by reading the method bodies: they genuinely mean the
   testing concepts, not Encore's Oracle product code (which LR-058 legitimately keeps).
2. **The report is coupled to code identifiers.** Renaming a method silently rewrites what the client
   reads. Report wording is a client-facing contract; it should not move when a developer refactors.

The gate that is supposed to protect this — `scripts/check-step-labels.mjs` — describes itself in its
own header as enforcing the "readable-report contract", but its derived-label check only rejects a
fixed list of abbreviations (`ssl`, `ect`, `csv`, `btn`, …). `oracle` and `canaries` are not on that
list, so every one of those labels ships green today.

**Council record**: gpt-5.5 returned CONVERTER-IS-A-PATCH; claude-opus-4.5 graded it VERDICT-WEAKENED
(the original 54-defect count was inflated; 8–12 are real); gpt-5.5 defended and both settled on
CONVERTER-JUSTIFIED + LABEL-THE-WORST-BY-HAND. **The owner overrode that recommendation**: do the
whole job now rather than leave a mechanism that will keep producing the same defect.

## The solution, in plain words

Write all 793 labels into the source as literal text, then delete the converter.

The trick that makes this safe: **seed each literal with the exact string the converter produces
today**. The report then comes out byte-identical by construction — no churn, no re-baselining, no
live run needed to prove it. Only the dozen bad labels are deliberately changed, and each of those is
listed here by name so the diff is fully accounted for.

After that the converter has no callers and is deleted, `tests/_unit` finally goes away (finishing
Phase 4 of the July 31 plan, which was defeated when that commit deleted one unit test and added
another in the same breath), and the gate is tightened to require a real label instead of guessing one.

---

## Hard constraints (violating any of these fails the plan)

- **C1 — Byte-identical report.** Every label except the listed dozen must equal what the converter
  produces today. Proven mechanically (Phase 4), not by eyeball and not by sampling.
- **C2 — The working tree holds unrelated dirty files from other sessions**, and the count moves while
  this plan is being written (79 at drafting, 81 an hour later — other sessions are live). **The count
  is therefore recomputed immediately before staging, never read from this plan.** Only this plan's own
  paths may be staged, from an explicit allowlisted file list. Never `git add -A`, never `git add .`.
  Verified at drafting: none of the dirty files touch the label system — re-verify at execution.
- **C3 — No assumptions.** Every path, count, and label asserted here was checked against disk this
  session. Anything discovered to be different at execution time HALTS the phase and is reported.
- **C4 — Pushes are never delegated.** Claude runs `git push` itself, after showing the payload.
- **C5 — The deliverable refresh is a refresh, not a re-scope.** `--branch=main` derives its module
  scope from `scripts/deliverable/delivery-manifest.encore.json` (statuses `delivered` +
  `approved-next`). That derivation is used as-is. No module list is invented, widened, or narrowed.
- **C6 — Dry run before every push**, both remotes, payload inspected and shown to the owner.

---

## Adversarial audit of this plan (run before approval — findings are folded in below)

**F1 — BLOCKER, found and confirmed against disk.** Today's derived labels are checked by
LABEL-JARGON, which only flags jargon that has *no* translation. The moment they become literal
`@step('…')` strings they fall under a **different** check — HAND-LABEL-JARGON
(`scripts/check-step-labels.mjs:165-201`) — which rejects *any* denied word, translated or not.
Five current labels would then fail the gate:

```
Capture Location Pricing CSV rows          (csv)
Open ECT Settings tab                      (ect)
Get ECT Settings field value               (ect)
Is ECT Settings fixed costs save enabled   (ect)
Is ECT Settings labor costs save enabled   (ect)
```

Note the first and second are *already* hand-written today — they live in `handLabels` — and escape
the check purely because they sit in JSON rather than in a decorator. So the gate has a blind spot
right now, and literalizing exposes it rather than creating it.

`CSV` and `ECT Settings` are the deliberate, client-correct expansions produced by `jargonMap`. The
fix is therefore **not** to reword them. Phase 4 must replace the raw denied-word scan with an
**approved-term allowlist** built from `jargonMap`'s output values (`CSV`, `ECT Settings`,
`Shared Setup Locations`, `Location`, `URL`, `Location Management`, `Self Include`, `Product Group`,
`Pay To`, `Pricebook`), so the gate keeps rejecting raw `ect`/`csv`/`ssl` while accepting their
approved expansions. **This is the one genuine design fork in the plan and is the main thing fable
is being asked to rule on.**

**F2 — the plan contradicted itself.** The verification artifact advertised
`verify-step-label-parity.mjs` as re-runnable by anyone, but as first drafted it compared against the
live converter — which Phase 4 deletes. Fixed: Phase 2 freezes the 793 expected labels into a
committed JSON fixture, and the parity script compares against that fixture from then on. This also
turns it into a permanent regression guard rather than a one-shot migration check.

**F3 — a gate I weaken cannot grade itself.** Phase 4 changes `check-step-labels.mjs` and then uses
it as acceptance. A green run proves nothing unless the strengthened rule is shown to fire. Phase 4
now requires a live-fire proof: feed it a method with a bare `@step()` and a label containing raw
`ect`, and observe both violations, before trusting any PASS.

**F4 — checked, no action needed.** Inheritance was a suspected hazard: literals are written at the
definition site, while `resolveLabel` runs on the *runtime* class. It is safe, because `camelToLabel`
ignores the class name entirely, and all seven `handLabels` overrides were confirmed to sit in the
same class where the method is defined. Recorded so the next reader does not re-derive it.

**F5 — corrected by fable.** No *real client-source decorator* exists outside
`clients/encore/src/pages/**`, so the codemod's scope is complete. The earlier wording claimed the
text `@step(` appears nowhere else, and that is false: it also appears in
`clients/encore/src/fixtures/step-decorator.ts` (the definition), `scripts/check-step-labels.mjs`
(the checker's own pattern), and `scripts/test-fixtures/negative-step-label.fixture.txt` (a gate
fixture). The codemod must therefore be scoped by path, not by a repo-wide text match.

**F6 — scope drift check against the owner's words.** He asked for main on each remote, nothing more.
The plan touches exactly two branches and no others, and invents no module scope. No drift found.

---

## Phase 1 — Build the transform (delegated: 1 worker, cross-family review)

Deliverable: a codemod script plus a proof script, both under `scripts/`.

**Why a script and not 21 label-writing workers**: the transform is fully deterministic. A script
applies it once, identically, and can be re-run and audited. Twenty-one workers writing prose into
twenty-one files would introduce twenty-one chances of drift on a job with no judgment in it.

1. `scripts/codemod-literal-step-labels.mjs` — for every `@step()` in `clients/encore/src/pages/**`,
   resolve the label exactly as `resolveLabel(className, methodName)` does today and rewrite the
   annotation to `@step('<label>')`. Must handle apostrophes in labels (none exist today — verify,
   do not assume) and must not touch `@step` annotations that already carry an argument (there are
   currently zero — verify).
2. `scripts/step-labels.baseline.json` — a frozen snapshot of what the converter produces for all 793
   `class.method` pairs, generated while the converter still exists. Committed. This is what makes the
   proof survive Phase 4 (finding F2).
3. `scripts/verify-step-label-parity.mjs` — reads every literal `@step('X')` back out and asserts it
   matches the **baseline fixture**, with an allowlist of the deliberate changes from Phase 3. Exits
   non-zero on any unexplained difference. **This script is the C1 proof and stays runnable forever.**

**Acceptance**: all three exist; the codemod is idempotent (a second run changes nothing);
`npx tsc --noEmit` clean in `clients/encore/` after the codemod runs.

## Phase 2 — Run the codemod (Claude)

Generate the baseline fixture first, then run the codemod, then run the parity proof — all while the
converter still exists. A failure here HALTS; the converter is not deleted until parity is green.

**Acceptance**: `node scripts/verify-step-label-parity.mjs` exits 0 with 793 labels checked and 0
unexplained differences.

## Phase 3 — Replace the twelve bad labels (Claude authors, cross-family seat reviews)

Each is client-facing prose, so Claude writes it and a seat reviews it for plain English. Proposed:

| Method | Today | Proposed |
|---|---|---|
| `getHeaderAriaSort` | Get header aria sort | Read the column's sort direction |
| `getColumnAriaSort` | Get column aria sort | Read the column's sort direction |
| `getMaxDiscountAriaInvalid` | Get max discount aria invalid | Check whether Max Discount is flagged invalid |
| `getNewPriceAriaInvalid` | Get new price aria invalid | Check whether New Price is flagged invalid |
| `probeEditOracle` | Probe edit oracle | Try editing the cell and record what happens |
| `probeMaxDiscountOracle` | Probe max discount oracle | Try editing Max Discount and record what happens |
| `probeOverridePriceOracle` | Probe override price oracle | Try editing Override Price and record what happens |
| `captureImportAllMergeCanaries` | Capture import all merge canaries | Record the rows used to check the merge |
| `triggerBeforeunloadAndStay` (×3) | Trigger beforeunload and stay | Attempt to leave the page, then stay |

The exact final wording is the reviewing seat's to improve; the allowlist in Phase 1's proof script is
updated to match whatever lands.

**Acceptance**: `npm run check:step-labels` passes; the parity script passes with exactly these
entries allowlisted and no others.

## Phase 4 — Retire the converter (delegated: 1 worker, cross-family review)

Only after Phases 2 and 3 are green.

- Delete `clients/encore/src/fixtures/label-derivation.ts`.
- Delete `clients/encore/tests/_unit/label-derivation.spec.ts` and the now-empty `tests/_unit/`
  directory. (This file is git-tracked — confirmed via `git ls-files`.)
- `clients/encore/src/fixtures/step-decorator.ts` — drop the `resolveLabel` fallback; an omitted label
  becomes a compile-time error rather than a guess.
- `clients/encore/src/fixtures/label-jargon.json` — keep **only** `deniedJargon`. It is still live:
  `scripts/check-step-labels.mjs:182` uses it for the hand-written-label check. `jargonMap` and
  `handLabels` become dead and go.
- `scripts/lib/label-derivation.mjs` — reduce to the term data the checker still needs (see the
  approved-terms note below). Its `camelToLabel` / `resolveLabel` / `untranslatedJargon` exports go.
- **`scripts/check-step-labels.test.mjs` — found by fable, missed by the first draft.** It imports
  `camelToLabel`, `untranslatedJargon` and `resolveLabel` at line 9, so deleting those exports breaks
  it. Rewrite it to test the new gate behaviour (approved terms pass, raw abbreviations fail, empty
  label fails) or retire it. **`node --test scripts/check-step-labels.test.mjs` joins the acceptance
  battery** — a plan that silently leaves a broken test behind is not done.
- **Approved-term durability (fable's F1 ruling).** The new gate accepts approved client terms and
  rejects raw abbreviations. Those approved terms must NOT be read from `jargonMap`, because this same
  phase deletes it. Freeze them in a named constant or a retained JSON field that survives the
  deletion, and prove both directions live: `CSV` and `ECT Settings` pass, raw `csv` / `ect` / `ssl`
  fail, and a bare or empty `@step()` fails.
- `scripts/check-step-labels.mjs` — three changes:
  - Retire the LABEL-JARGON check (nothing is derived any more).
  - Strengthen DECORATOR-MISSING to require a **non-empty label argument**, so the gate finally
    enforces what its own header claims.
  - **Rework HAND-LABEL-JARGON per finding F1**: reject raw abbreviations (`ect`, `csv`, `ssl`, …)
    but accept the approved expansions drawn from `jargonMap`'s output values. Without this the five
    labels listed in F1 wedge the gate and the whole plan stalls.
  - Keep SPEC-RAW-PAGE unchanged.
  - **Live-fire proof required (F3)**: before trusting any PASS, feed the checker a bare `@step()`
    and a label containing raw `ect`, and confirm it reports both violations.
- `scripts/generate-label-inventory.mjs` — update to read literals, or retire it. Decide from its
  callers; do not guess.
- Sweep stale references: `scripts/deliverable/delivery-manifest.encore.json`,
  `scripts/lib/forbidden-patterns.mjs` (the `/tests/_unit/` deny entry can stay as a permanent guard —
  it costs nothing and blocks recurrence), `scripts/deliverable/strip-internal-language.mjs`,
  `scripts/deliverable/approval-log.md`.

**Acceptance**: `npx tsc --noEmit` clean; `npm run check:step-labels` passes; `grep -rn "camelToLabel\|resolveLabel\|label-derivation" clients/encore scripts` returns only the deniedJargon remnant.

## Phase 5 — Gate battery, then push the framework repo (Claude)

Per `/push-repo`. We are on `main`, currently `0 0` against `origin/main`.

1. Stage **only** this plan's paths (C2). Never `git add -A`.
2. Commit.
3. `npm run check:spec-quality` · `check:tc-parity` · `check:step-labels` · `check:untracked-knowledge`
4. Secret sweep and delegation-material sweep on `origin/main..HEAD` per the skill's Steps 3 and 4.
5. `git push origin main`, then verify `git rev-list --left-right --count origin/main...HEAD` → `0 0`.

Pre-push scans `origin/main..HEAD` (confirmed at `.githooks/pre-push:26-27`), so the 79 dirty files are
outside the scan. No worktree is needed for this push — the pollution here is uncommitted, not committed.

## Phase 6 — Refresh the client deliverable main (Claude)

Per `/push-encore-deliverables main`. **Hard ordering (fable's required edit 6): this phase does not
begin until Phase 5 is complete and the framework push is verified `0 0` against origin/main.** The
client repo is never refreshed from an unproven framework state.

**The owner must see this before it goes**: deliverable `main` was last shipped **2026-07-31 11:38**,
which is **8.5 hours before** the Proxy refactor landed (48d5933f, 20:06 the same day). All **21**
branches that actually exist on the remote still carry the retired `step-wrapper.ts` and none carry
`step-decorator.ts`. (`ship-branch.sh` defines 22 branch *presets* — the two numbers measure different
things, and three presets have no branch on the remote. Only `main` is in scope here either way.) This
refresh therefore ships the whole July-31 refactor plus this plan's work — a large delta, not a small
patch. That is expected and is the point of a refresh, but it is not a one-file change and must not be
described as one.

1. `bash scripts/ship-branch.sh --branch=main` — **dry run**, no `--push`.
2. Inspect the payload per the skill's Steps 3 and 4: spec files, TC-ID sets, no coverage regression,
   and no `specs_planning/`, `docs/`, `.claude/`, `CLAUDE.md`, `.env.local`, or `tests/_unit/`.
3. Show the owner the payload and the delta.
4. `bash scripts/ship-branch.sh --branch=main --push`.
5. Verify on the remote: tip SHA, shipped TC count, leak check, and confirm `step-decorator.ts` is
   present and `step-wrapper.ts` is gone.
6. **Stop.** One invocation authorises one branch. The other 20 branches are out of scope.

---

## What this plan deliberately does NOT do

- Does not touch any of the 79 unrelated dirty files.
- Does not ship any branch other than `main` on either remote.
- Does not change module scope on the deliverable — the manifest derivation decides it.
- Does not modify specs, test cases, or the workbook, so LR-ENC-002 FCC parity is not engaged.
  (If any gate disagrees at execution time, that is a HALT, not a workaround.)
- Does not relocate `tests/_unit` to a framework test directory. The July 31 plan suggested that;
  this plan deletes the file instead, because the converter it tested is going away.

## Verification artifact (re-runnable by anyone)

```bash
node scripts/verify-step-label-parity.mjs          # exits 0; 793 labels, 12 allowlisted changes
node --test scripts/check-step-labels.test.mjs     # passes against the NEW gate behaviour
cd clients/encore && npx tsc --noEmit               # silent
npm run check:step-labels                           # PASS, 0 violations
git ls-files clients/encore/tests/_unit | wc -l      # 0
git ls-tree -r encore-mock/main --name-only | grep -c "fixtures/step-wrapper.ts"   # 0
git ls-tree -r encore-mock/main --name-only | grep -c "fixtures/step-decorator.ts" # 1
```

## Rollback

Framework: the push is one commit on `main`; `git revert` it. Deliverable: every branch there is a
standalone orphan commit, so the previous `main` tip (`ec1d0c109`) can be force-restored if needed —
that requires the owner's explicit go, as it rewrites what the client sees.
