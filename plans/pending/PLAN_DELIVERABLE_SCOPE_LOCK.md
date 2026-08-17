**Status**: Pending
**Priority**: CRITICAL
**PermissionMode**: default
**Date**: 2026-07-30
**Owner**: OWNER
**Model**: Opus
**Thinking**: ultrathink
**BrowserTool**: none (no browser work in this plan)
**Source**: Over-ship incident on `encore-mock/main` commit `eae1ee9c` (2026-07-29). 11-lot council audit of all 179 shipped files — evidence under `.claude/state/ua-worker/chips/deliv-leak/`.

---

# PLAN_DELIVERABLE_SCOPE_LOCK — make it structurally impossible to ship unapproved work

## Objective

Two outcomes, in this order:

1. **Correct the live payload.** `encore-mock/main` currently carries 32 files for modules the
   client was never given. Re-ship it with exactly the approved set and push.
2. **Make the failure unrepeatable.** Replace the human-memory scope selection with a committed
   manifest, and replace the "does the payload contain our secrets?" gate with "is everything in
   the payload approved?" — fail-closed.

Outcome 2 is the point. Outcome 1 without outcome 2 is one clean push followed by the next
accident.

**Scope of the guarantee, stated honestly.** This plan makes the **accidental** over-ship class —
the one that actually happened, where whole unapproved files ride along because scope was typed
from memory — structurally impossible: unapproved content cannot resolve, and unresolved fails
closed. It does **not** make deliberate over-ship impossible; an author editing an approved spec's
body to reach an unapproved surface is narrowed and detected (Phase 3.1d), not prevented. An
earlier draft of this objective claimed "structurally impossible" without qualification. The
adversarial review was right to call that overclaiming, and a guarantee stated more broadly than it
holds is exactly the kind of false green that caused this incident.

---

## Context — what actually happened

The 2026-07-29 ship of `encore-mock/main` put 32 files on the client's branch for modules that
were never delivered and, per the owner, are not to be delivered: the whole `local-office` surface
and four `locations` modules (currency, local-information, management-history, pricing). It also
shipped `tests/_unit/step-wrapper.spec.ts`, an internal test of our own step-labelling helper,
which executes when the client runs `npm test`.

Corporate work is **not** part of the leak — the owner has confirmed all corporate-pricing and
corporate-override scope, including NM-2271/2272/2273, is intended for delivery.

### Root cause — four independent structural defects

**RC-1 — The delivered set is a comment block.** `scripts/ship-branch.sh:21-40` is a
hand-maintained table of copy-paste recipes, one per release, mapping a branch name to
`--modules` / `--surface` glob values. It is prose. Nothing reads it, nothing validates it, and it
has no entry for the combined `main` release — so for `main` the operator hand-assembles the union
at the terminal from memory, unreviewed. That is where the 32 files entered.

**RC-2 — The only gate is a deny-list, and deny-lists cannot answer this question.**
`scripts/verify-no-forbidden.mjs` (wired at `ship-branch.sh:302-305`) checks the payload against
`scripts/lib/forbidden-patterns.mjs` DENY_GLOBS — a list of *our internal file patterns*
(`CLAUDE.md`, `specs_planning/`, `.env.local`, …). It knows what is ours and secret. It has no
concept of what is theirs and approved. Over-ship is invisible to it by construction, at any level
of diligence.

**RC-3 — The over-ship check measured the wrong direction.** The activity-log row at
`clients/encore/specs_planning/_internal/agent-activity-log.md:623` claims *"spec parity exact
(30 in / 30 on main, zero over-ship, zero under-ship)"*. That comparison was payload-vs-our-own-
working-tree. It can only ever prove "the payload contains everything we built" — a statement with
no failing case in the over-ship direction. It read green because the question it asked has no
wrong answer.

**RC-4 — Three fail-open paths in the payload builder.**
- `ship-branch.sh:270-273` — a workbook the resolver cannot classify emits a WARNING and is
  **kept**. Unknown resolves to ship.
- `ship-branch.sh:262` — the module filter's outer loop iterates directories only, so
  root-level `testcases/*.xlsx` (`encore-qa-tracker.xlsx`, `encore_test_cases.xlsx`) never enter
  the scope filter at all.
- `scripts/lib/forbidden-patterns.mjs:21-58` — no DENY_GLOBS entry matches `tests/_unit/` or any
  underscore-prefixed internal directory.

### Secondary finding — 212 slop findings across the 179 shipped files

An 11-lot audit read every line of every shipped file (denominator machine-derived, 179/179, zero
gaps). Rollup: 28+ HIGH `S1` (internal ticket IDs — `NM-####` in six filenames, in `describe`/
`test` titles the client sees in their HTML report, and in code comments), HIGH `S2` (our repo
paths and internal artifact names leaked into shipped source — `clients/encore/…`,
`.machine-evidence/reject-oracle/`, `ORACLE-FACTS.md`), MEDIUM `S5` (23 disabled tests —
`test.skip` / `test.fixme` — visible in the client's report as unfinished coverage), MEDIUM `S3`
(our process vocabulary: "graft", "lot contract", "walk-A", "RCA"), plus LOW `S4`/`S10`.

Per-lot evidence: `.claude/state/ua-worker/chips/deliv-leak/out-lot{3..9}/LOT*-SLOP.md`.

---

## Bootstrap

- **Identity**: OWNER. Phase 6 spec edits may adopt GARDENER; the push in Phase 7 is OWNER-only.
- **Skills auto-called**: `/regression-guard` (before + after Phase 2–5 script changes),
  `/audit` (Phase 8), `/final-q` (closure).
- **Context files** — every one of these must be read before the phase that depends on it:
  - `.claude/rules/deliverable.md` (LR-058 — no internal jargon in shipped client source)
  - `.claude/rules/pipeline.md` (LR-049 ship discipline, LR-027 closure, LR-048 structure)
  - `.claude/rules/plan-closure.md` (LR-055)
  - `docs/read_only_docs/LEARNED_RULES.md`
  - `scripts/ship-branch.sh`, `scripts/lib/forbidden-patterns.mjs`, `scripts/verify-no-forbidden.mjs`
  - `export_test_cases/module-codes.json`
  - Audit evidence: `.claude/state/ua-worker/chips/deliv-leak/` (all lots)

---

## Phase 0 — Gate

- [ ] 0.1 Confirm `encore-mock` remote resolves to `RutviK-JBS/encore_deliverables_test` and the
      repo is still **private** (`gh api repos/RutviK-JBS/encore_deliverables_test --jq .private`
      → `true`). If it has become public, HALT and report before anything else.
- [ ] 0.2 Confirm LOT8B's bounce landed, so the audit denominator is complete at 179/179 with
      every lot carrying its per-file coverage attestation. A lot without coverage rows is an
      unproven denominator — do not proceed on it.
- [ ] 0.3 Snapshot the current remote state for rollback:
      `git fetch encore-mock main && git rev-parse encore-mock/main` → record the sha in this
      plan's Execution Summary. `eae1ee9c` is the expected value.

---

## Phase 1 — The manifest (the missing source of truth)

**Design decision — location.** The manifest lives at
`scripts/deliverable/delivery-manifest.encore.json`, **not** under `clients/encore/`. The payload
is built by `git archive HEAD clients/encore/`, so anything inside that subtree is a candidate to
ship. Placing the manifest outside it makes it structurally impossible for the manifest — which
names withheld modules and internal status vocabulary — to leak into a client payload. This is a
containment property, not a filing preference; do not move it.

- [ ] 1.1 Promote the drafted manifest from
      the Lot 11 draft delivery manifest from worker chip `deliv-leak` to
      `scripts/deliverable/delivery-manifest.encore.json`.
      Draft content is already evidence-backed: 30 modules — 19 `delivered`, 7 `withheld`,
      3 `approved-next`, 1 `internal-only`, plus a `conflicts[]` array naming every leaked module.
- [ ] 1.2 Schema, frozen here:
      - `modules[]` — `code`, `name` (plain English, client-facing, **no ticket IDs**), `status`,
        `specs[]`, `workbooks[]`, `delivered_on`, `delivered_via`, `evidence` (commit sha).
      - `status` enum, exactly: `delivered` | `approved-next` | `withheld` | `internal-only` | `unknown`.
      - `shared[]` — see 1.5. **Without this the Phase 3 gate fails everything**, because most
        shipped files belong to no single module.
      - `releases{}` — see 1.3.
- [ ] 1.3 **`main` is derived, never hand-listed.** `releases.main` resolves to *every module whose
      status is `delivered` or `approved-next`* — computed, not typed. This is the direct kill for
      RC-1: there is no union for a human to assemble, so there is no union for a human to get
      wrong. A deliberate subset requires an explicit `releases.main.exclude[]` with a reason
      string per entry, which is a reviewable diff.
- [ ] 1.4 Verify every path in every `specs[]` / `workbooks[]` / `shared[]` exists on
      `encore-mock/main`. A path that does not resolve is a manifest bug — fix it now, not at
      ship time.

- [ ] 1.5 **`shared[]` is typed and constrained, not a free list.** *(Adversarial review BLOCKER 2:
      as originally written, `shared[]` was an unconstrained pass lane — anyone could add a withheld
      module's page object to it as "needed infrastructure" and the Phase 3 gate would resolve it
      and exit 0, because it would be neither unresolved nor `internal-only`. That reopens the exact
      hole this plan exists to close.)*

      Each entry is an object, not a bare string: `path`, `category`
      (`framework` | `config` | `fixture` | `tooling`), `reason` (≥ 20 chars, plain English).

      Structural deny rules, enforced by Phase 5 validation — an entry matching any of these is
      rejected at commit time regardless of its stated reason:
      - no `tests/**/*.spec.ts`
      - no `testcases/**/*.xlsx`
      - no `src/pages/**`, `src/data/**`, or `src/selectors/**` path under a module-named
        subdirectory, unless that module's status is `delivered` or `approved-next`
      - no path under `tests/_*/`

      Build it by subtracting every module's `specs[]`/`workbooks[]` from the payload file list,
      then hand-review the remainder. Anything left over that is not genuinely shared is itself a
      finding, not a `shared[]` entry.

- [ ] 1.6 **`approved-next` carries approval evidence, not just a typed word.** *(Adversarial
      review BLOCKER 3: `releases.main` includes `approved-next` modules, and nothing proved that
      status was true — so flipping one word in the manifest ships an unapproved module, which is
      RC-1 relocated rather than fixed.)*

      Every `approved-next` row requires `approved_by` and `approved_ref`, validated in Phase 5.
      NM-2271/2272/2273 are `approved-next` on the owner's explicit 2026-07-30 instruction that
      all corporate scope is deliverable — that instruction is their `approved_ref`.

      **`approved_ref` is a resolvable pointer, not free text.** *(Round-2 finding, accepted: a
      required-non-empty string constrains blank fields, not truth — the same edit that flips
      `status` can type plausible approval prose. That is the original bug wearing a new coat.)*
      Shape: `{ "path": "<repo-relative file>", "line": <n>, "blob_sha": "<sha>" }` pointing at a
      pre-existing approval source (an activity-log row, a plan line, an approval-log entry).
      `scripts/validate-delivery-manifest.mjs` must **read that source** and confirm the referenced
      line exists, its blob sha matches, and its text names this module code. A pointer that does
      not resolve, or resolves to text not naming the module, fails the commit. Approval evidence
      that the manifest author can author is not evidence.

      **Hash-mismatch procedure — required, because otherwise this fails badly.** *(Round-3 finding:
      if the approval source file is legitimately edited, every manifest row pointing into it breaks
      at once, at commit time, with no stated recovery — and an operator facing a wall of failures
      will delete the check rather than understand it.)*
      Prefer pointing `approved_ref` at an **append-only** source (an activity-log row or a
      dedicated approval log), which does not rewrite history and so does not churn. When a mismatch
      does occur, the operator: (1) inspects the old blob via `git show <blob_sha>` to confirm the
      original approval text, (2) re-points `approved_ref` at an unchanged historical source — a
      commit-pinned path is acceptable — or (3) obtains fresh approval. Editing the sha to silence
      the error without doing (1), (2), or (3) is the one move that defeats the entire control.

      **Partial defence of the original design, recorded deliberately**: the reviewer's proposed
      remedy was to default `releases.main` to `delivered` only. That is rejected — it contradicts
      the owner's stated scope, which puts all corporate work including the three undelivered
      override tickets in the release. The reviewer's *structural* objection is accepted in full
      (a status word is not evidence); its *specific remedy* is not, because it would ship the
      wrong set. Evidence fields close the gap without overriding the owner's decision.

**Acceptance**: `node -e "JSON.parse(...)"` exits 0; module count equals
`export_test_cases/module-codes.json` count + 1 (`INTERNAL.UNIT`); every status is in the enum;
every `approved-next` row has non-empty `approved_by` + `approved_ref`; every `shared[]` entry is
an object passing the 1.5 deny rules.

---

## Phase 2 — Scope comes from the manifest, not the command line

- [ ] 2.1 Remove `--modules` and `--surface` from `scripts/ship-branch.sh`. The script accepts
      `--branch=<name>` and resolves scope by reading the manifest.
- [ ] 2.2 **No override flag.** An `--override-scope` escape hatch would restore the exact failure
      being fixed — a keystroke at a terminal that no diff records. Changing what ships means
      editing the manifest and committing it. That is the control. Anyone proposing an override
      flag later should be pointed at RC-1.
- [ ] 2.3 Delete the recipe comment block at `ship-branch.sh:21-40`. It is now a second, stale,
      unenforced copy of the truth, and a stale second copy is worse than none. Replace it with a
      three-line pointer to the manifest.
- [ ] 2.4 Fix the two fail-open paths from RC-4 in the builder: an unresolvable workbook is
      **deleted, not kept** (`ship-branch.sh:270-273`), and the module filter walks root-level
      `testcases/*.xlsx` as well as subdirectories (`ship-branch.sh:262`).

---

## Phase 3 — The inverted gate (`scripts/verify-approved-scope.mjs`)

**Design decision — path-level, not glob-level.** The gate resolves each payload file against the
manifest's explicit `specs[]` / `workbooks[]` / `shared[]` **paths**, not against a module glob
like `corporate-pricing-search*`. Glob-level membership would let any *new* file dropped inside an
already-approved module ship unseen — a hole the research pass flagged and a plausible next
incident. Path-level means a new file is unresolved until someone adds it to the manifest, which
is a reviewable commit.

**Design decision — content sha pinning stays rejected, but path-level alone is NOT sufficient.**
*(Adversarial review BLOCKER 4.)* Pinning each approved file's sha256 would force re-approval for
ordinary bug fixes to already-approved files — friction with no matching risk, since the client has
accepted those files' existence and improving their contents is the job. That reasoning holds.

But the reviewer's counter-example lands: an approved spec at an approved path can be *edited* to
add setup for a withheld module, assertions for unshipped work, or new client-visible test titles.
The path still resolves, the gate exits 0, and unapproved scope ships inside an approved file. The
original plan had no answer to that. Phase 3.1b is the answer — and it is better than sha pinning,
because it constrains *scope* while leaving *content* free to improve.

- [ ] 3.1 Write `scripts/verify-approved-scope.mjs --target=<dir> --client=encore`:
      for every file in the payload → resolve against the manifest →
      - unresolved → **FAIL**, naming the path
      - resolves to `withheld` / `internal-only` / `unknown` → **FAIL**, naming path and status
      - resolves to `delivered` / `approved-next` → pass
      Exit 0 only when every file resolved and every resolved module is shippable.
      Fail-closed: unknown means denied, always.
- [ ] 3.1b **Semantic scope check inside approved paths.** For **every payload file** — not only
      specs — extract its relative imports; for every spec additionally extract its declared TC IDs
      (`TC-*` tokens in `test(...)` / `describe(...)` titles). Then:
      - no import from **any** payload file may cross into a `withheld` or `internal-only` module's
        directory → otherwise **FAIL**, naming the importing file and the forbidden target
      - every TC ID must appear in that module's manifest `tc_ids[]` → otherwise **FAIL**
      - every `test(...)` title in a payload spec must carry a `TC-*` token → otherwise **FAIL**.
        *(Round-2 finding: a title with no TC ID has nothing to check against, so an untagged test
        is a hole straight through the TC-ID gate.)*
        **The resolver must handle simple const-array interpolation, and the rule is not relaxed.**
        *(Round-3 finding, verified: across all 833 `test(...)` declarations in the payload, 9 carry
        no literal `TC-*`. Six are in `tests/_unit/` and two in `location-pricing.spec.ts` — all
        eight leave with the over-ship removal. Exactly one legitimate case survives:
        `tests/locations/location-auto-addon.spec.ts:185`, a data-driven loop whose title is
        `` `${item.tc}: …` `` over `UNCHECK_PERSISTENCE_CASES` in
        `src/data/locations/location-auto-addon.ts`, supplying `TC-LOC-AAO-017` and `-018`.
        One case is not "many" — relaxing a scope control for a single resolvable pattern would be
        trading a real gate for five minutes of work.)*

- [ ] 3.1d **Body-level scope check — the last bypass.** *(Round-3 finding, and the sharpest of the
      whole review: every control above keys on file paths, imports, and TC IDs. An approved spec at
      an approved path with an approved TC ID can still take the raw authenticated `Page` fixture
      (`src/fixtures/pages.fixture.ts:39-42`), navigate to a withheld surface by URL string, and
      assert against it — with no import from a withheld directory to catch. Nothing in the plan
      inspected bodies, so nothing blocked it.)*

      Add to the gate: scan every payload spec body for withheld-surface route fragments and
      testid tokens drawn from the withheld modules' own selector files, and **FAIL** on a hit.

      ~~Additionally, ban raw `authenticatedSession.page` usage in payload specs.~~ **DROPPED** by
      the slop audit: redundant with the token scan above. Both defend the identical bypass — an
      approved spec reaching a withheld surface — but the scan catches it by looking for the
      withheld routes and testids, while the ban catches it by removing a legitimate API from every
      spec author. Same defence, higher cost, and the scan is the one that actually names what went
      wrong when it fires.

      **Objective wording corrected accordingly**: this plan makes the accidental over-ship class
      structurally impossible. A determined author editing a spec body to reach an unapproved
      surface is narrowed and detected, not made impossible. That distinction is stated here rather
      than papered over — see the Objective section.

      *(Round-2 finding — the import check must cover all files, not just specs: `shared[]`
      infrastructure is exactly where withheld modules are entangled. Verified on the live payload:
      `src/fixtures/pages.fixture.ts` imports 7 withheld pages (lines 2, 3, 4, 10, 11, 12, 14) and
      `src/selectors/index.ts` imports 6. A spec-only import check sees neither.)*

- [ ] 3.1c **`tc_ids[]` must not be bootstrapped from contaminated data.** *(Round-2 finding:
      Phase 1 originally populated `tc_ids[]` "from the current workbooks" — but the current
      workbooks are the ones that shipped withheld scope. Seeding the oracle from the contaminated
      artefact blesses the contamination instead of catching it.)*
      Populate `tc_ids[]` from the workbooks **filtered to approved modules only**, then verify the
      resulting ID set against the delivered branches' workbooks (`encore-mock/<branch>`), which
      predate the leak. Any ID present in `main`'s workbook but absent from every delivered branch
      is quarantined for review, not auto-accepted.

      **Quarantine disposition is a rule, not a judgement call.** *(Round-3 finding: a TC legitimately
      added to an approved module after its branch shipped lands in quarantine too. With no stated
      disposition, an operator under deadline waives the whole quarantine — and a control that gets
      waived wholesale is not a control.)* Each quarantined TC gets exactly one of:
      - **removed** from the payload, or
      - **accepted** with a per-TC approval pointer meeting the same provenance standard as
        Phase 1.6 (`{path, line, blob_sha}` that resolves and names the TC).
      There is no third option, and no bulk waiver.

- [ ] 3.2 Wire it into `ship-branch.sh` **before** the push, alongside (not replacing)
      `verify-no-forbidden.mjs`. Two layers, different questions: the deny-list still catches
      internal-file leaks; the allowlist catches unapproved scope. Neither substitutes for the other.

- [ ] 3.2b **Gate the OTHER ship path too — `ship-client.sh` and `ship-client.ps1`.**
      *(Adversarial review BLOCKER 1, and the single most serious defect it found. The original plan
      deferred these as a follow-up. That was wrong: `.claude/rules/pipeline.md:425-427` (LR-049)
      names `npm run client:ship -- --client=<id> --out=<path>` as THE blessed client-deliverable
      path. `ship-client.sh:70` archives all tracked `clients/encore/` files and runs only the
      deny-list at lines 89 and 107. Deferring it would have left the front door unlocked while we
      bolted the side window — an operator following our own documented rule would bypass every
      control in this plan.)*

      Wire `verify-approved-scope.mjs` into both scripts **before** `$OUT` is populated. If either
      cannot be gated in this plan's window, hard-disable it for Encore (exit non-zero with a
      pointer to `ship-branch.sh`) rather than leaving it live and ungated. An ungated blessed path
      is not an acceptable end state for this plan.
- [ ] 3.3 Add `/tests/_unit/` and `/\/tests\/_[^/]+\//` to DENY_GLOBS
      (`scripts/lib/forbidden-patterns.mjs`). Belt and braces — Phase 3.1 already blocks it via
      `internal-only`, but a second independent layer costs one line.
- [ ] 3.4 **Live-fire the gate before trusting it — ten cases, not five.** Per LR-069 and the
      gate-trip discipline, a gate that has never rejected a real violating payload is unproven.
      *(Adversarial review MAJOR 6: the original five cases could all pass while every blocker
      bypass stayed open — they tested the shapes the design already anticipated. Cases (f) through
      (j) exist specifically to exercise the bypasses the reviewer found.)*

      Fire it at all ten and record raw output + exit code for each:
      - (a) the current `eae1ee9c` tree → **FAIL**, naming all 32 files
      - (b) the corrected tree → **PASS**
      - (c) one `withheld` spec re-added → **FAIL**
      - (d) one novel unlisted file → **FAIL** as unresolved
      - (e) an empty manifest → **FAIL**, never pass-by-vacuity
      - (f) a `withheld` module's page object added to `shared[]` → **FAIL** on the 1.5 deny rules
      - (g) a module flipped to `approved-next` with empty `approved_ref` → **FAIL** at Phase 5
      - (h) an approved spec carrying a TC ID absent from `tc_ids[]` → **FAIL** at 3.1b
      - (i) an approved spec importing from a `withheld` module directory → **FAIL** at 3.1b
      - (j) `ship-client.sh` and `ship-client.ps1` run for Encore → **FAIL** or refuse, per 3.2b

      Round-2 additions — these exercise the holes the round-1 fixes left open:
      - (k) `approved_ref` pointing at a path/line that does not exist, or whose text does not name
        the module → **FAIL** at Phase 5, per 1.6
      - (l) a `shared[]` fixture or index file importing a `withheld` module → **FAIL** at 3.1b
      - (m) a payload spec with a `test(...)` title carrying no TC ID → **FAIL** at 3.1b
      - (n) `tc_ids[]` seeded with an ID present only in the contaminated `main` workbook →
        quarantined, never auto-accepted, per 3.1c

      Round-3 additions:
      - (o) an approved spec, at an approved path with an approved TC ID, navigating to a withheld
        surface by raw URL string via the raw `Page` fixture → **FAIL** at 3.1d. This is the
        body-level bypass; if this case cannot be made to fail, 3.1d is not installed.
      - (p) `approved_ref` whose `blob_sha` no longer matches its source → **FAIL** at 5.1, and the
        failure message must name the 1.6 recovery procedure rather than just erroring.

---

## Slop audit (self-audit, DROP bar lowered one notch per the skill's own bias rule)

25 items enumerated across 5 dependency bundles. **2 DROP, 2 KEEP-TENTATIVE**, rest KEEP.

**Dropped** — both for proven redundancy, not for "seems heavy":
- `ship-log.json` (was 4.2) — REDUNDANT-WITH 4.3, and no reader anywhere in the plan.
- Raw-`page` ban (was part of 3.1d) — REDUNDANT-WITH the 3.1d token scan; same bypass, higher cost.

**Kept after a failed drop attempt** — recorded so it is not re-litigated:
- `tests/_unit/` DENY_GLOBS entry (3.3) looked redundant with 3.1's `internal-only` status, and the
  plan itself had called it "belt and braces". It survives on a real independent-failure scenario:
  if the manifest's `INTERNAL.UNIT` row is ever missing or mistyped, 3.1 lets `_unit` through and
  the deny-glob is the only thing left. Reason upgraded from "belt and braces" to that scenario.

**Flagged KEEP-TENTATIVE** — no valid typed drop proof, but not earning their weight:
- **`tc_ids[]` machinery (3.1c + the every-title-needs-an-ID rule)** — the heaviest block in the
  plan, defending the narrowest case. It survives only because the workbooks *are* part of what the
  client receives, so unseen test cases genuinely are over-ship. **Re-audit after one real ship; if
  it never fires, cut it.**
- **Post-push attestation (Phase 4.1)** — with 7.5's staging-ref verification in place this reruns
  the same gate binary against a second tree, catching only push-time corruption. Thin, not redundant.

Efficacy check after the drops — happy path ships, withheld content still fails closed, and each
dropped item's defended scenario is covered by the item it was redundant with. EFFICACY-CONFIRMED.

      Absence of a deny is not evidence of a gate. A case that cannot be made to fail on demand
      means the control it claims to test does not exist.

---

## Phase 4 — Post-push attestation, and honest logging

- [ ] 4.1 After the push, fetch the remote branch and re-run
      `verify-approved-scope.mjs` against the **remote** tree — not the local scratch directory.
      The scratch dir is the thing being tested; it cannot also be the oracle.
- [ ] 4.2 ~~Append the machine verdict to a dedicated deliverable ship log.~~ **DROPPED** by the
      slop audit: redundant with 4.3. Both record the same fact — the gate's verdict for a ship run
      — and 4.3 puts it in the activity log, which is the record we actually read and already
      commit. Nothing in this plan ever read `ship-log.json`; a new append-only file with no reader
      is surface, not safety. The run details (timestamp, branch, remote sha, file count, resolved
      module list) move into the 4.3 row instead.
- [ ] 4.3 **The activity-log row quotes the gate's verdict, never prose.** RC-3 was a
      human-authored claim of "zero over-ship" in a log row. From here the row carries the gate's
      exit code and its output line. If the gate did not run, the row says so.

---

## Phase 5 — Manifest integrity at commit time

- [ ] 5.1 `scripts/validate-delivery-manifest.mjs`: no duplicate codes; every `status` in the enum;
      every `delivered` row has a resolvable commit sha; no `withheld` or `internal-only` row
      carries a `delivered_on`; every listed path exists in the working tree; every `shared[]`
      entry is an object passing the Phase 1.5 deny rules; and — the one that carries real weight —
      **every `approved-next` row's `approved_ref` resolves**: the file exists, the line exists,
      the blob sha matches, and the referenced text names that module code. Structural validity is
      cheap; this is the check that makes the status field mean something.
- [ ] 5.2 Call it from `.githooks/pre-commit` when the manifest is staged. An invalid manifest
      must not be committable — it is now the single source of truth, and a corrupt source of
      truth fails silently at ship time, which is the worst possible moment.

---

## Phase 6 — Slop remediation on files that stay

Findings on the 32 departing files need no work — they leave. This phase covers findings in files
that remain in the payload. Full evidence: `out-lot{3..9}/LOT*-SLOP.md`.

- [ ] ~~6.1 Strip `NM-####` from titles, comments, and workbook cells.~~ **WITHDRAWN — the premise
      was wrong.** `NM-####` is **Encore's own Jira prefix**, not ours
      (`clients/encore/CLAUDE.md`, "Jira prefix"). It is deliberately kept in shipped source by
      product decision: `scripts/lib/forbidden-patterns.mjs:115` lists it under DELIBERATELY
      EXCLUDED, and `.claude/rules/deliverable.md` LR-058 lists it under KEPT. A reference like
      `NM-1463` links a test to *their* bug and is useful to them.

      The audit's 104 `S1` findings inherited this error from my own
      `SLOP-DEFINITION.md`, which listed `NM-####` as an internal leak. Workers stripped 132
      references across 35 client tickets before it was caught; reverted in full on the owner's
      decision (2026-07-30), repo verified back to 883 TC ids and typecheck clean.
      `SLOP-DEFINITION.md` is corrected so no future run repeats it.

      **Generalised lesson, worth more than the fix**: before classing a token as internal
      vocabulary, establish *who owns the identifier*. "It looks like a code" is not the test.
      The same audit correctly caught `graft`, `lot contract`, `walk-A` — those are ours.

- [ ] ~~6.2 Rename the six `nm####` spec and workbook filenames.~~ **WITHDRAWN — same reason.**
      Those filenames name the client's own tickets. Renaming them would destroy traceability the
      client benefits from, and would churn `export_test_cases/module-codes.json` plus TC parity
      for no gain.
- [ ] 6.3 **HIGH `S2` — our paths and artifacts in shipped source.** `src/utils/field-case-runner.ts`
      lines 37, 38, 117 name `clients/encore/…` and `.machine-evidence/reject-oracle/`;
      `src/data/corporate-override/override.ts:420` cites `ORACLE-FACTS.md`. Rewrite these to
      describe behaviour without naming our repo layout.
- [ ] 6.4 **MEDIUM `S5` — 23 disabled tests.** Each `test.skip` / `test.fixme` gets a decision:
      un-skip it (LR-021 — try the original logic first), or remove it from the shipped payload.
      Shipping a visibly disabled test tells the client the coverage they paid for is unfinished.
      Per LR-031 a skip needs exhaustive investigation, not a shrug — do that work here.
- [ ] 6.5 **MEDIUM `S3` — process vocabulary.** "graft", "lot contract", "walk-A", "RCA",
      "bed-recount-w18.md" and similar, out of every surviving file.
- [ ] 6.6 **Owner rule, applied to survivors** — anything kept must carry a plain-English comment
      saying why it is there. If the reason cannot be written for a client audience, the thing does
      not ship. Two outcomes only: justified-and-commented, or removed.
- [ ] 6.7 Re-run the audit on the corrected payload. Zero HIGH findings is the bar for Phase 7.

---

## Phase 7 — Re-ship `main` and push

- [ ] 7.0 **Sever the entanglement FIRST — deleting the 32 files alone ships a broken suite.**
      *(Round-2 finding, verified live on `encore-mock/main`: two shared files import the withheld
      modules — `src/fixtures/pages.fixture.ts` at lines 2, 3, 4, 10, 11, 12, 14 (7 imports, plus
      the Local Office fixture properties it exposes around lines 374–386), and
      `src/selectors/index.ts` (6 imports). Remove the 32 files without editing these two and the
      payload fails `tsc` and will not run at all in the client's hands. A broken deliverable is a
      worse outcome than the over-ship it was meant to correct.)*

      **PRUNE THE PAYLOAD, NOT THE SOURCE.** *(Execution finding, 2026-07-30 — this phase originally
      said to edit the two files in `clients/encore/` directly. That was wrong and was proven wrong
      by trying it: the withheld modules still live in our repo and we still develop them, and
      **7 files** import the selectors barrel — `local-office-{ect,history,settings}.page.ts`,
      `location-{currency,local-info,pricing}.page.ts`, and `src/data/locations/location-local-info.ts`.
      Pruning the barrel at source breaks our own typecheck and blocks work on modules we are still
      building. The attempt was reverted.)*

      The pruning is a **payload-time transform inside `ship-branch.sh`**, applied to the extracted
      scratch copy after the withheld files are removed and before the gate runs. Our source tree
      is never modified; the shipped copy carries only the delivered wiring. This is the same shape
      as every other step in the builder — the payload is a derived artifact, not a checkout.

      Mechanically: for each of `src/fixtures/pages.fixture.ts` and `src/selectors/index.ts` in the
      scratch dir, remove the import lines, fixture properties, type entries, and barrel re-exports
      belonging to withheld modules — driven by the manifest's withheld list, not a hardcoded set,
      so it stays correct when the withheld set changes.

      **Then prove the payload works, standalone.** *(Round-3 finding: both files co-locate
      delivered and withheld entries — `pages.fixture.ts:44-64`, `src/selectors/index.ts:44-56` —
      so pruning risks cutting a delivered fixture alongside a withheld one, and `typecheck` will
      not always catch a fixture that is merely unreachable.)*
      - `npx tsc --noEmit` **inside the scratch payload** exits 0 — the payload must compile on its
        own, which is the only typecheck that describes what the client receives
      - a real delivered-locations spec runs end-to-end from the payload (not `--list`) and passes
      - the import sweep re-runs across every payload file and finds zero withheld references

- [ ] 7.1 Build the corrected payload from the manifest: `releases.main` = 19 `delivered` +
      3 `approved-next` modules. Expected result: the 32 over-ship files gone; ~147 files remain,
      with the two shared files from 7.0 modified rather than removed.
- [ ] 7.2 Remove the `encore-local-office` project from `playwright.config.ts` and its
      `testIgnore` reference (config lines 121, 125, 146, 150–151). A config naming a surface that
      no longer ships is a broken config in the client's hands.
- [ ] 7.3 Gate battery, all of which must pass before the push: `verify-approved-scope.mjs` exit 0
      · `verify-no-forbidden.mjs` exit 0 · `npm run typecheck` clean · `npm run check:tc-parity`
      exit 0 · `npx playwright test --list` resolves every TC ID in the payload.
- [ ] 7.4 Show the owner the exact payload diff — files removed, files kept, module list — and get
      the go before pushing. He has pre-authorised the push; this is the payload confirmation, not
      a re-ask of the decision.
- [ ] 7.5 **Push to a staging ref first, verify there, then move `main`.** *(Adversarial review
      MAJOR 5: the original sequence pushed `main` and only then attested — so a gate that passed
      locally for the wrong reason would publish bad content to the client-visible branch, and the
      "rollback" was a sha written down in a plan with no command attached.)*

      Sequence, in order:
      1. `git push --force-with-lease encore-mock <scratch>:refs/heads/_staging-main`
      2. Fetch `_staging-main` and run `verify-approved-scope.mjs` against **that fetched tree**
      3. Only on exit 0, fast-forward/force `main` to the same sha
      4. Delete `_staging-main`

      Force-push is acceptable here: the repo is a private dry-run staging mirror with no external
      consumers.

- [ ] 7.5b **Scripted rollback, not a written-down sha.** If step 2 fails, or if Phase 4's
      attestation fails after `main` moves, immediately restore Phase 0.3's recorded sha:
      `git push --force-with-lease encore-mock <phase-0.3-sha>:refs/heads/main`. Write this command
      into the Execution Summary with the sha filled in *before* step 1 runs, so recovery never
      depends on reconstructing it under pressure.

- [ ] 7.6 Phase 4 attestation against the pushed remote tree.

---

## Phase 8 — Make it stick

- [ ] 8.1 New rule `LR-071` in `.claude/rules/deliverable.md`: client payload scope derives from
      the committed manifest; the allowlist gate is fail-closed and runs pre-push; ship-time claims
      in the activity log quote a machine verdict, never prose.
- [ ] 8.2 Log the incident to `clients/encore/specs_planning/_internal/agent-mistakes.md` as an
      `ALL-NNN` row — the pattern is *"a green check whose denominator was our own work"*, which
      generalises well beyond shipping and is worth every future agent recognising.
- [ ] 8.3 `/audit` this plan's execution in a **separate session** (AUD-017 — a session cannot
      grade its own work).
- [ ] 8.4 `/final-q`, then move to `plans/done/` per LR-027 with an Execution Summary.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) — no requirements or baseline work | `(none)` | — |
| GIVER | workbooks + `export_test_cases/module-codes.json` (Phase 6.2 renames) | `export_test_cases/module-codes.json` | `npm run check:tc-parity` exit 0 |
| BUILDER | `tests/**/*.spec.ts` (Phase 6.1/6.2/6.4/6.5 edits) | `clients/encore/tests/corporate-override/` | `npx playwright test --list` resolves all TC IDs |
| HEALER | `(skipped: no RCA-driven spec fix in scope — this plan removes and re-words content, it does not diagnose failures)` | `(skipped: no RCA-driven spec fix in scope — see left)` | — |
| WATCHDOG | Phase 8.3 external audit findings | `(skipped: produced by the separate audit session per AUD-017, not by this plan)` | — |
| GARDENER | `scripts/ship-branch.sh`, `scripts/lib/forbidden-patterns.mjs`, `scripts/verify-approved-scope.mjs` | `scripts/verify-approved-scope.mjs` | `npm run typecheck` clean |
| OWNER | manifest, hook, push, activity log | `scripts/deliverable/delivery-manifest.encore.json`<br>`scripts/validate-delivery-manifest.mjs`<br>`scripts/deliverable/ship-log.json` | `node scripts/validate-delivery-manifest.mjs` exit 0 |

---

## What this plan deliberately does NOT do

- **No CI pipeline on the deliverable repo.** Worth doing; not the fix for this incident, and
  bundling it would delay the fix that is.
- **No content sha pinning** — reasoned and rejected at Phase 3, with the gap it left now closed by
  the semantic scope check at Phase 3.1b instead.
- **No scope override flag** — reasoned and rejected at Phase 2.2.

**Withdrawn exclusion**: an earlier draft deferred `ship-client.sh` / `ship-client.ps1` to a
follow-up. The adversarial review correctly called that a BLOCKER — LR-049 makes `client:ship` the
blessed deliverable path, so leaving it ungated would have let an operator following our own
documented rule bypass every control here. It is now in scope at Phase 3.2b.

---

## Adversarial review — round 1 (gpt-5.5, cross-family)

Verdict **REJECT** — 4 BLOCKER, 2 MAJOR. Full report was in worker chip `deliv-leak` Lot 12; those files were never tracked, so they do not travel with the repo.

| # | Severity | Defect | Disposition |
|---|---|---|---|
| 1 | BLOCKER | `ship-client.sh`/`.ps1` left ungated while LR-049 names it the blessed path | **Accepted** → Phase 3.2b |
| 2 | BLOCKER | `shared[]` an unconstrained pass lane for withheld module paths | **Accepted** → Phase 1.5 |
| 3 | BLOCKER | `approved-next` status asserted, never evidenced — RC-1 relocated | **Accepted in substance, remedy amended** → Phase 1.6 |
| 4 | BLOCKER | Path-level allowlist permits semantic over-ship inside an approved file | **Accepted** → Phase 3.1b |
| 5 | MAJOR | Push-then-detect; rollback was a written sha with no command | **Accepted** → Phase 7.5 / 7.5b |
| 6 | MAJOR | Live-fire set never exercised the bypasses in rows 1–4 | **Accepted** → Phase 3.4 (5 → 10 cases) |

Row 3 is the only partial: the structural objection is accepted in full, but the proposed remedy
(default `main` to `delivered` only) is rejected because it contradicts the owner's stated scope —
all corporate work ships, including the three override tickets with no delivery branch. Approval-
evidence fields close the gap without overriding that decision. Reasoning at Phase 1.6.

---

## Adversarial review — round 2 (gpt-5.5, same reviewer, amended plan)

Verdict **REJECT** — 2 CLOSED, 4 PARTIALLY-CLOSED. Report was in worker chip `deliv-leak` Lot 12; those files were never tracked, so they do not travel with the repo.

| R1 finding | R2 verdict | Disposition |
|---|---|---|
| 1 — ungated `client:ship` | CLOSED | — |
| 5 — push-then-detect | CLOSED | — |
| 2 — `shared[]` pass lane | PARTIALLY-CLOSED — deny rules block module paths but shared files still *import* withheld modules | **Accepted** → 3.1b import check widened to every payload file; entanglement severed at 7.0 |
| 3 — `approved-next` unevidenced | PARTIALLY-CLOSED — non-empty text is not proof | **Accepted** → 1.6 `approved_ref` is now a resolvable `{path,line,blob_sha}`, validated at 5.1 |
| 4 — semantic over-ship | PARTIALLY-CLOSED — `tc_ids[]` seeded from contaminated workbooks; untagged titles escape | **Accepted** → 3.1c clean-seed + quarantine; 3.1b requires a TC ID on every title |
| 6 — live-fire gaps | PARTIALLY-CLOSED | **Accepted** → 3.4 cases (k)–(n) |

**Highest-value finding of the whole review, and it changes execution**: `src/fixtures/pages.fixture.ts`
and `src/selectors/index.ts` import the withheld modules — 7 and 6 imports respectively, verified
directly against `encore-mock/main`. Deleting the 32 files without editing these two produces a
payload that does not compile. The naive removal would have replaced an over-ship with a broken
deliverable. Handled at Phase 7.0, which now runs before any payload is built.

---

## Adversarial review — round 3 (gpt-5.5, same reviewer)

Verdict **ACCEPT-WITH-CHANGES** — 3 CLOSED, 1 STILL-PARTIAL. Report was in worker chip `deliv-leak` Lot 12; those files were never tracked, so they do not travel with the repo.

Four must-fix items, all folded in:

| # | Finding | Landed at |
|---|---|---|
| 1 | Quarantine had no disposition rule — an operator under deadline waives it wholesale | Phase 3.1c |
| 2 | `blob_sha` pins mass-break on a legitimate edit, with no recovery procedure | Phase 1.6 |
| 3 | One real data-driven test title has no literal TC ID — handle it, don't relax the rule | Phase 3.1b |
| 4 | **Body-level bypass**: approved path + approved TC ID + raw `Page` fixture → navigate to a withheld surface by URL string, no import to catch | Phase 3.1d, live-fire (o) |

Finding 4 is the review's sharpest. Every control up to that point keyed on paths, imports, and TC
IDs — none inspected a spec body. It also correctly caught the Objective overclaiming
"structurally impossible"; that wording is now scoped to the accidental class, which is what the
plan actually guarantees.

Finding 3 verified independently before accepting: 9 of 833 payload `test(...)` declarations lack a
literal `TC-*`. Eight are in files being removed (`tests/_unit/` ×6, `location-pricing.spec.ts` ×2).
Exactly one legitimate case survives — `location-auto-addon.spec.ts:185`, whose IDs come from
`UNCHECK_PERSISTENCE_CASES`. The reviewer's "one is not many, so do not relax the rule" is correct.

Reviewer's explicit guidance on sequencing, accepted: do **not** delay the live leak correction for
the deliverable-repo CI pipeline, which stays out of scope.

**Status: cleared to execute.** Three rounds, each finding real defects — a compile break, a
front-door bypass, and a body-level bypass. Diminishing returns reached; further rounds would cost
more in delay than they would return in findings.

---

## Verification artifact

```bash
node scripts/verify-approved-scope.mjs --target=<payload-dir> --client=encore; echo "exit=$?"
```

Expected: `exit=0` on the corrected payload, and `exit=1` naming all 32 files when pointed at the
`eae1ee9c` tree. A gate that cannot produce the second result is not installed.
