# PLAN_ENCORE_NM2269_DELIVERY

**Status**: DONE
**Executed**: 2026-07-22
**Priority**: high
**Created**: 2026-07-22
**Identity**: OWNER (publishing is never delegated — the push step is OWNER-only)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: both
**BrowserToolJustification**: Playwright CLI drives the spec run headlessly; the browser pane is needed only to render and screenshot the generated HTML report, which is a pixel-level visual artifact the CLI cannot produce.
**Depends on**: none

> 🤖 **SESSION BOOTSTRAP — invoke with `/execute PLAN_ENCORE_NM2269_DELIVERY.md`. All context is below.**
>
> 1. **Identity**: OWNER. Publishing (git push to the client remote) is OWNER-only and never delegated.
> 2. **Skills**: `/push-encore-deliverables` governs the ship mechanics; `/execute` orchestrates.
> 3. **Model/thinking/permission**: per the frontmatter above.
> 4. **Dependency gate**: none. Proceed.
> 5. **Context load**: §2 Verified facts is the whole factual basis — read it before touching a command.
> 6. **Browser tool**: `both`, per the justification above.
> 7. **Execute phases 0 → 7 in order.** Phase order is load-bearing: the payload is built and inspected
>    *before* it is tested, so the test run exercises exactly what ships.
> 8. **Handoff**: flip the Status field to DONE, add the Executed date, append the activity-log row
>    (LR-028 + LR-037), `git mv` to `plans/done/`, run `npm run plans:reindex`, then `/final-q`.
>
> **HALT + ASK USER** if: any test in the shipped set is red · the payload inspection finds an
> `NM-2270` string · the shipped TC set is not a superset of `encore-mock/nm2268` · the deny-list
> check exits non-zero · the working tree's uncommitted NM-2271 work would be disturbed.

---

## 1. Context — the need

Rutvik's instruction, verbatim in substance: **NM-2268 and NM-2269 are done and ship together on a
`2269`-specific branch. NM-2270 is NOT to be shipped.** He additionally wants a **picture of the
Playwright HTML report** covering that 2268+2269 payload.

Why this is not a one-liner:

- All three tickets (`nm2268`, `nm2269`, `nm2270`) resolve to the **same ship preset** in
  `scripts/ship-branch.sh:84` — `--modules=CPR.OVR --surface='corporate-pricing-override*'`. They
  share one spec file and one workbook sheet. Excluding NM-2270 is therefore a **content-filtering**
  problem, not a preset choice.
- NM-2270 is **already committed at HEAD**. It cannot be excluded by simply leaving it uncommitted —
  it must be actively trimmed out.
- The working tree carries a **large uncommitted NM-2271 batch** (TC-050..065 plus page-object,
  selector and test-data changes). It must survive this delivery untouched.

## 2. Verified facts

Every row below was established by command output, not inference. Provenance is named so a later
reader can retry the command rather than trust this document.

| # | Fact | How established |
|---|---|---|
| F1 | `nm2268`/`nm2269`/`nm2270` share one ship preset: `MODULES=CPR.OVR`, `SURFACE=corporate-pricing-override*` | `scripts/ship-branch.sh:84`, read directly |
| F2 | Exactly **1** file at HEAD matches basename `corporate-pricing-override*` under `clients/encore/tests/` → `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` | `git ls-tree -r HEAD`, recon B2 §G3 |
| F3 | The HEAD spec contains **49** TC IDs, `TC-CPR-OVR-001..049` | recon A1 §A2; corroborated by recon A2 §W3 |
| F4 | **NM-2269 = TC-042, 043, 044** — describe at line 566 carries an explicit `(NM-2269)` tag | recon A1 §A3/§A4 (confidence HIGH) |
| F5 | **NM-2270 = TC-045, 046, 047, 048, 049** — two describes (lines 649, 753) both explicitly tagged `(NM-2270)`; every one of the five test titles carries the tag too | recon A1 §A5, recon B2 §G2 |
| F6 | **NM-2268 = TC-039, 040, 041** | recon A1 §A4 assigned this by elimination at MEDIUM confidence — but it is **independently corroborated** by F7: the client's delivered `nm2268` branch literally contains 001..041 and stops there |
| F7 | `encore-mock/nm2268` (tip `7c6f08b3672107a4b0be7c4a0b3005bc8253a91f`) ships **41** TCs, `TC-CPR-OVR-001..041`. `encore-mock/nm2267` (tip `fd8df333…`) ships 38, `001..038`. nm2268 ⊇ nm2267 | recon B2 §G1, tee'd to `B2-tcset-nm2268.verify.txt` |
| F8 | At HEAD, in files that survive into a client payload, `NM-2271` appears **0** times — the entire NM-2271 batch is uncommitted | recon B2 §G2 |
| F9 | At HEAD, in files that survive into a client payload, **every** `NM-2270` occurrence is inside the one spec file (7 hits: 2 describes + 5 test titles). None in `src/`, `config/`, or anywhere else | recon B2 §G2 |
| F10 | **No `src/` symbol exists solely to serve NM-2270.** The NM-2270 tests reuse general-purpose page methods (`setFilter`, `getSortedColumn`, `getGridOptions`) that NM-2268/2269 need anyway | recon A2 §W6 |
| F11 | **No NM-2268 or NM-2269 content is uncommitted.** Every dirty hunk in the working tree is NM-2271 (plus one NM-1932 sub-item, TC-061). TC-001..044 are unmodified vs HEAD | recon A2 §W5 Q1 |
| F12 | Workbook ↔ spec parity is **clean at HEAD**: both carry exactly `TC-CPR-OVR-001..049`; `SPEC-ONLY = ∅`, `WORKBOOK-ONLY = ∅` | recon A2 §W1/§W3, read via exceljs |
| F13 | `--tcs` → `spec-trim.mjs --keep=` is a **KEEP-list**, accepting comma lists and inclusive ranges. A missing **range endpoint** is FATAL; a missing **interior** ID only WARNs | recon B2 ESTABLISHED CONTEXT, `spec-trim.mjs:86-128, 672-687` |
| F14 | `ship-branch.sh` purges `docs/ specs_planning/ readable_externals/ .github/ .auth/ .claude/ CLAUDE.md` (`:114-115`); `src/` ships **WHOLE** with src-trim disabled (`:153-162`) | recon B2 §G2 |
| F15 | The deny-list **deliberately permits** bare `NM-####` strings — they are the client's own Jira IDs. So no gate will catch a stray NM-2270 reference for us | `forbidden-patterns.mjs:37`, `.claude/rules/deliverable.md:37` |
| F16 | `check:tc-parity`, `check:spec-quality`, `xlsx:build` live in the **root** `package.json`, not `clients/encore/package.json` (which has only `typecheck` among the gates) | recon B2 §G4 |
| F17 | **`scripts/spec-trim.mjs` cannot currently run.** It does `import ts from 'typescript'` (`:29`); root `package.json` declares `typescript@^5.3.3` in devDependencies, but it is **not installed** in root `node_modules` — `require.resolve` from the repo root returns UNRESOLVABLE. `clients/encore/node_modules/typescript` exists, but Node's ESM resolution walks up from `<REPO_ROOT>/scripts/`, so the client copy is never reached | cross-family verifier C, `C-trim-check.verify.txt` (`ERR_MODULE_NOT_FOUND`), reproduced directly by OWNER |

| F18 | **`spec-trim` and `xlsx-trim` do NOT accept the same range syntax.** `spec-trim.mjs:70-71` accepts *both* `TC-CPR-OVR-001..TC-CPR-OVR-044` (full ID both ends) and `TC-CPR-OVR-001..044` (abbreviated numeric end). `xlsx-trim.mjs:63-64, 84` accepts **only** the abbreviated numeric end — a full-ID end throws `range end "TC-CPR-OVR-044" … is not a number`. The one form both accept is **`TC-CPR-OVR-001..044`** | discovered when the first dry run FATAL'd at the xlsx step (run `nm2269-build-D`); both parsers then read directly by OWNER |
| F19 | **`ship-branch.sh:183` already hard-gates the push on `verify-no-forbidden.mjs --target="$VERIFY"`** — its own clean extract of the payload. The deny-list is enforced inside the ship, not bolted on beside it | `scripts/ship-branch.sh:11, 183`, read directly |
| F20 | **R1 is CLOSED — the R-533 sleeps did not reach HEAD.** `check:spec-quality` exits 0: `check-spec-sleeps` reports 0 fixed sleeps across 0 files; unfailable-assertions, swallowed-failures, reload-wait and vacuous-grid all 0 | run `nm2269-build-D` D1, `D-specquality.verify.txt` |

| F21 | **The shipped artifact is the scratch's git COMMIT, not the scratch DIRECTORY.** `ship-branch.sh:175` runs `git add -A` inside the scratch, which honours the deliverable's own `.gitignore`; `:179` re-extracts *that commit* into `$VERIFY` for the deny-list; `:196-203` pushes *that commit*. So a file can sit on scratch disk and never ship. Concretely: `.env.local` (tracked in the framework repo, carrying real `NAVIGATOR_USERNAME`/`NAVIGATOR_PASSWORD`) IS present on scratch disk but is excluded by the scratch's `.gitignore:16`, so it is absent from the commit — matching `encore-mock/nm2267` and `nm2268`, which carry only `.env.e2e` (a file that states outright it holds no credentials). **Inspect a payload with `git -C <scratch> ls-files`, never with `ls`** | OWNER, on the live scratch: `ls -a` shows `.env.local`; `git ls-files` shows only `.env.e2e`; `git check-ignore -v .env.local` → `.gitignore:16` |

### Cross-family verification

All nine load-bearing claims (spec TC set, spec-file count, the NM-2269 and NM-2270 sets, the
`nm2268` remote floor, the NM-2270/NM-2271 leak surfaces, the keep-list consequence, and the
superset property) were independently re-derived from git objects by a **different model family**
(`gpt-5.5`, run `nm2269-verify-C`). Verdict: **9/9 CONFIRMED, zero refutations** — recorded in that
run's verdict file (per-run worker output, not tracked). The nine claims are re-derivable from git
objects by anyone repeating the checks.

That same verifier is what surfaced **F17**, by attempting to execute the trim rather than reading it.

### The conclusion these facts force

**Keep-set = `TC-CPR-OVR-001..044`** (44 TCs).

- It contains all of NM-2268 (039-041) and all of NM-2269 (042-044). ✔ Rutvik's "ship together".
- It excludes NM-2270 entirely (045-049). ✔ Rutvik's "NOT to be shipped".
- Because of **F9**, trimming the spec to 001..044 removes *every* NM-2270 reference from the payload —
  there is no second hiding place.
- Because of **F10**, shipping `src/` whole leaks no NM-2270-only dead code.
- Because of **F8 + F11**, the uncommitted NM-2271 work can neither leak into the payload nor be lost.
- Because of **F7**, 001..044 ⊃ 001..041 — a strict superset of what the client already holds, so
  coverage cannot regress.
- Because of **F2 + F13**, the known multi-spec `--tcs` FATAL hazard cannot fire: there is one spec
  file, and both range endpoints (001, 044) exist in it.

### Open risk carried into execution

**R1 — LR-052 sleeps.** Mistake record R-533 (2026-07-18) documents 7 `waitForTimeout` sleeps in
NM-2269 TC-042/044 that a worker wrongly dismissed as "pre-existing". Whether they were fixed before
being committed to HEAD is **not yet established**. Phase 1 settles it. If they are in HEAD, they
ship — and `check:spec-quality` will say so.

**R2 — first push.** `nm2269` does not exist on `encore-mock`. Mistake record D3 (2026-06-11)
documents `ship-branch.sh` failing on exactly this first-push path; it was fixed at commit `442f99d8`
via `git rev-parse --verify --quiet`. Phase 6 verifies the fix holds rather than assuming it.

**R3 — NM-1932 (TC-061).** Sits inside the uncommitted NM-2271 batch. **Dispositioned: out of scope.**
It is uncommitted NM-2271-session work; Rutvik's scope is 2268+2269. It ships when 2271 ships.

**R4 — the trim tool does not run (F17).** This is the one hard blocker. `--tcs` is the entire
exclusion mechanism, and `spec-trim.mjs` currently dies on a missing `typescript` import before it
trims anything. `ship-branch.sh:92-98` pre-checks only that the *file exists*, not that it *runs* —
so this would surface as a FATAL mid-ship, after the scratch tree is already built. Phase 0.5 fixes
it first.

## 3. Mechanism

Phase order is deliberate: the payload is **built and inspected before it is tested**, so the HTML
report Rutvik receives is a run of exactly the bytes the client gets — not of the working tree, which
differs from HEAD by the whole NM-2271 batch.

### Phase 0 — Preflight

```bash
git rev-parse --abbrev-ref HEAD          # record the starting branch; we must return to it
TREE_SNAP="$(mktemp)"; git status --short > "$TREE_SNAP"   # Phase 0 snapshot
```

Record the current branch and the exact dirty-file list. **The uncommitted NM-2271 work is sacred** —
no `checkout`, no `stash`, no `reset` at any point in this plan.

### Phase 0.5 — Trim-tool preflight (resolves R4 / F17)

`spec-trim.mjs` is the exclusion mechanism; if it cannot run, nothing else in this plan matters.
Restore the **already-declared** root devDependency without touching any tracked file:

```bash
npm install typescript@5.3.3 --no-save
node -e "console.log(require.resolve('typescript',{paths:['.']}))"   # must now resolve
```

`--no-save` keeps `package.json` and `package-lock.json` untouched — `node_modules/` is gitignored,
so this leaves zero tracked-file diff. It restores the state the root `package.json` already
declares (`typescript@^5.3.3`); it does not add a new dependency.

**Then prove the trim actually works before trusting it with the delivery** — `ship-branch.sh` only
checks that the script *exists*, never that it *runs*:

```bash
mkdir -p $TMPDIR/nm2269-trimtest/tests/corporate-pricing
git show HEAD:clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts \
  > $TMPDIR/nm2269-trimtest/tests/corporate-pricing/corporate-pricing-override.spec.ts
node scripts/spec-trim.mjs $TMPDIR/nm2269-trimtest/tests/corporate-pricing/corporate-pricing-override.spec.ts \
  --keep=TC-CPR-OVR-001..TC-CPR-OVR-044
grep -c 'NM-2270' $TMPDIR/nm2269-trimtest/tests/corporate-pricing/corporate-pricing-override.spec.ts   # expect 0
grep -oE 'TC-CPR-OVR-[0-9]+' $TMPDIR/nm2269-trimtest/tests/corporate-pricing/corporate-pricing-override.spec.ts | sort -u | wc -l   # expect 44
```

Expected: exit 0, **0** NM-2270 hits, **44** TC IDs. Anything else → HALT; the keep-list mechanism is
not trustworthy and the delivery must not proceed on it.

Delete `$TMPDIR/nm2269-trimtest` afterwards (§5).

### Phase 1 — Gate battery on the working tree (LR-060 obligation 4)

Run from the repo root (F16):

```bash
npm run typecheck
npm run check:tc-parity
npm run check:spec-quality
```

Settles **R1**. A `check-spec-sleeps` failure naming `TC-CPR-OVR-042` or `044` means the R-533 sleeps
reached HEAD and are about to ship.

**If R1 fires** → HALT and report to Rutvik with the offending `file:line` list. Do not ship, and do
not quietly fix — a spec edit at this point changes what he was told is "done", and that is his call.

### Phase 2 — Build the payload (dry run, no push)

```bash
bash scripts/ship-branch.sh \
  --branch=nm2269 \
  --modules=CPR.OVR \
  --surface='corporate-pricing-override*' \
  --tcs=TC-CPR-OVR-001..044 \
  --keep-scratch
```

No `--push` — this is a dry run, which is the safety property the whole process rests on.
`--keep-scratch` preserves the payload tree for Phases 3 and 4. Record the printed `SCRATCH=` path.

> **A dry run that filters everything out also exits 0.** Verify the payload, never the exit code.

### Phase 3 — Inspect the payload

Against the scratch tree:

1. **TC set** — the spec carries exactly 44 IDs, `001..044`:
   `grep -oE 'TC-CPR-OVR-[0-9]+' <SCRATCH>/tests/corporate-pricing/corporate-pricing-override.spec.ts | sort -u`
2. **NM-2270 is gone** — `grep -rn 'NM-2270' <SCRATCH>/` must return **nothing**. This is the single
   most important check in the plan.

> **Inspect the COMMIT, not the directory (F21).** Every payload question — "does X ship?" — is
> answered by `git -C <SCRATCH> ls-files`, never by `ls <SCRATCH>`. The scratch directory holds
> tar-extracted files that `git add -A` then filters through the deliverable's own `.gitignore`.
> An `ls`-based inspection reports files that never reach the client and will generate false alarms.
3. **NM-2271 is absent** — same grep for `NM-2271`, expect nothing (F8 predicts this).
4. **Workbook** — read `<SCRATCH>/test_cases_xlsx/encore_test_cases.xlsx` with **exceljs** (grep
   cannot see inside an xlsx) and confirm the `CPR.OVR` sheet holds 44 rows, `001..044`.
5. **No internal material** — confirm absence of `specs_planning/`, `docs/`, `.claude/`, `CLAUDE.md`,
   `.env.local`.
6. **Deny-list on a CLEAN extract** (LR-049 caveat — never run this against the scratch dir itself,
   whose `node_modules/`/`.git/` produce false-positive marker hits that mask the real result):
   ```bash
   git archive HEAD | tar -x -C <FRESH_TMP>
   node scripts/verify-no-forbidden.mjs --target=<FRESH_TMP>
   ```

### Phase 3.5 — Coverage-regression proof

```bash
git fetch encore-mock nm2268
git show encore-mock/nm2268:tests/corporate-pricing/corporate-pricing-override.spec.ts \
  | grep -oE 'TC-CPR-OVR-[0-9]+' | sort -u > "$NM2268_TCS"
```

Diff against the Phase 3 payload set. **Every ID the client already has must still be present.**
Expected: payload = `001..044` ⊃ nm2268 = `001..041`, with `042,043,044` as the only additions and
**zero** removals. A removal is almost always a slicing bug — STOP and report.

### Phase 4 — Run the shipped payload → HTML report (LR-059)

The run happens **inside the scratch payload**, not the repo, so the report proves the delivered
bytes pass.

```bash
cd <SCRATCH>
# node_modules + local env are gitignored and therefore absent from the payload by design:
#   Windows: mklink /J node_modules <REPO>/clients/encore/node_modules
#   (or: cmd //c mklink //J node_modules "<REPO>\clients\encore\node_modules")
cp <REPO>/clients/encore/.env.local .env.local      # LR-ENC-003: .env.local, never .env.e2e
cp -r <REPO>/clients/encore/.auth .auth             # reuse the saved SSO state
npx playwright test tests/corporate-pricing/corporate-pricing-override.spec.ts --reporter=html
```

The payload spec already contains only 001..044, so **no `--grep` filtering is needed** — the trim
did the selection. That is why this ordering was chosen.

**Fallback if the scratch run cannot be made to work** (missing browser binaries, junction refused):
run in-repo with `npx playwright test corporate-pricing-override --grep-invert "NM-2270|NM-2271|NM-1932" --reporter=html`.
This yields the same 44 TCs, **but** it exercises the working tree, which differs from HEAD by the
uncommitted NM-2271 selector/page changes (notably `ovrLocationModalDialog` tightened to
`:has-text("Change Local Office")`, which TC-039/040 touch). If the fallback is used, **say so
explicitly in the handoff** — the report then proves the working tree, not the shipped bytes.

**Red test → HALT.** Never ship a red or non-compiling spec; a trimmed file that no longer passes is
worse than no delivery.

### Phase 5 — Screenshot the report

```bash
npx playwright show-report          # serves the report on a local port
```

Open the served URL in the browser pane, screenshot the summary view showing the passing
`TC-CPR-OVR-001..044` set, and save the image locally as an untracked screenshot.
Deliver the screenshot to Rutvik in chat.

### Phase 6 — Push (OWNER-only)

Only after Phases 1–5 pass. Re-run the identical Phase 2 command **plus `--push`**:

```bash
bash scripts/ship-branch.sh \
  --branch=nm2269 \
  --modules=CPR.OVR \
  --surface='corporate-pricing-override*' \
  --tcs=TC-CPR-OVR-001..044 \
  --push
```

`nm2269` is a **first push** to this remote (R2). If it fails with
`cannot parse expected object name 'encore-mock/nm2269'`, the D3 regression has returned — STOP,
report, and do not hand-craft a push around it. Never edit `ship-branch.sh` mid-delivery to make a
push succeed; fix the content, not the gate.

### Phase 7 — Verify the remote, then restore

```bash
git fetch encore-mock nm2269
git show encore-mock/nm2269:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -cE 'TC-CPR-OVR-[0-9]+'
git show encore-mock/nm2269:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -c 'NM-2270'   # expect 0
git ls-tree -r encore-mock/nm2269 --name-only | grep -E 'specs_planning|\.claude|CLAUDE\.md|\.env\.local' && echo "LEAK" || echo "clean"
```

Report the tip SHA, the shipped TC count, and the leak-check result. Confirm the working tree still
matches the Phase 0 snapshot and we are on the original branch. Then **STOP** — one
invocation authorises exactly one branch.

## 4. NOT touched (explicit)

- **The uncommitted NM-2271 batch** (TC-050..065, page-object/selector/data additions, the two MD
  files). Not committed, not stashed, not reverted, not shipped.
- **NM-1932 / TC-061** — out of scope per R3.
- **`encore-mock/nm2268` and `nm2267`** — existing delivered branches, read-only references here.
- **`scripts/ship-branch.sh`, `spec-trim.mjs`, `xlsx-trim.mjs`, the deny-list** — used, never edited.
- **The workbook `encore_test_cases.xlsx` in the repo** — read via exceljs; `xlsx:build` is NOT run.
- **The spec file itself** — trimming happens in the throwaway scratch tree, never in the repo.

## 5. Stale-cleanup (LR-050)

What this plan creates that must not be left behind:

| Artifact | Disposition |
|---|---|
| `<SCRATCH>` tree from `--keep-scratch` | delete after Phase 7 verification |
| `<FRESH_TMP>` clean extract (Phase 3.6) | delete after the deny-list check |
| `node_modules` junction + copied `.env.local` / `.auth` inside `<SCRATCH>` | removed with the scratch tree; **verify the `.env.local` copy is gone** — it is a credential-bearing file |
| `<SCRATCH>/playwright-report/` + `test-results/` | keep only the screenshot; delete the rest with the scratch |
| `$TMPDIR/nm2269-trimtest/` (Phase 0.5 proof) | delete after the trim proof passes |
| root `node_modules/typescript` installed in Phase 0.5 | **keep** — it restores a declared devDependency that was missing; removing it would re-break the trim tool. Zero tracked-file impact |
| Phase 0 tree snapshot + the nm2268 TC-ID list (both temp files) | delete at closure |
| HTML report screenshot (untracked, local-only) | **keep** — this is a Rutvik deliverable. It is untracked and must NOT be committed to the client repo |

Note: the repo root already carries untracked screenshot/scratch debris from prior sessions
(`job3b-*.png`, `step1-*.png`, `review2-*.txt`, `accept-denom.mjs`, `test-regex.mjs`). Out of scope
for this plan — flagged so it is not mistaken for this delivery's leavings.

## 6. Acceptance criteria

- [ ] Phase 0.5: `typescript` resolves from the repo root, and the standalone trim proof yields exactly **44** TC IDs and **0** NM-2270 hits.
- [ ] Phase 0.5 leaves `package.json` and `package-lock.json` unmodified (`git status --short` shows neither).
- [ ] Phase 1 gate battery passes, or R1 is reported to Rutvik and the plan HALTs.
- [ ] Payload spec contains exactly **44** TC IDs, `TC-CPR-OVR-001..044`.
- [ ] `grep -rn 'NM-2270' <SCRATCH>/` returns **zero** hits.
- [ ] `grep -rn 'NM-2271' <SCRATCH>/` returns **zero** hits.
- [ ] Workbook `CPR.OVR` sheet in the payload holds **44** rows (verified via exceljs, not grep).
- [ ] `verify-no-forbidden.mjs` exits **0** against a clean extract, and the push is gated on that exit code.
- [ ] Payload TC set is a strict superset of `encore-mock/nm2268`'s `001..041`, with zero removals.
- [ ] All 44 tests pass; the HTML report is generated.
- [ ] Screenshot saved and its path given to Rutvik.
- [ ] `encore-mock/nm2269` exists on the remote with 44 TCs, 0 `NM-2270` hits, and a clean leak-check.
- [ ] Working tree at the end is byte-identical to the Phase 0 snapshot; original branch restored.
- [ ] Closure ceremony complete (LR-027 Execution Summary, LR-028 activity-log row, reindex, `/final-q`).

## 7. Per-Identity Satisfaction

This plan is a **delivery**, not an authoring pass — it ships existing artifacts read-only. Rows are
`(none)` by design, and that is stated explicitly rather than left silent (LR-048).

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | none — no new behavior explored | `(none)` | `(none)` |
| GIVER | none — test-cases/test-plan/workbook are read-only inputs, trimmed only in a throwaway scratch tree | `(skipped: delivery plan ships existing GIVER artifacts unchanged; no MD or workbook edit occurs in the repo)` | `npm run check:tc-parity` exit 0 (Phase 1) |
| BUILDER | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` — read-only unless R1 fires | `(skipped: spec is shipped as-is; if the R1 sleep check fails the plan HALTs to Rutvik rather than editing)` | `npm run check:spec-quality` exit 0 (Phase 1) |
| HEALER | none | `(none)` | `(none)` |
| WATCHDOG | payload inspection findings | `(skipped: per-run HTML report screenshot delivered in chat, never tracked in the repo)` | Phase 3 grep set + Phase 7 remote leak-check |
| GARDENER | scratch/temp cleanup per §5 | `(skipped: cleanup is inline in Phase 7 and §5, no structural refactor in this plan)` | `git status --short` matches the Phase 0 snapshot |
| OWNER | the push itself + closure ceremony | `plans/done/PLAN_ENCORE_NM2269_DELIVERY.md`<br>`clients/encore/specs_planning/_internal/agent-activity-log.md` | `git show encore-mock/nm2269 --stat` resolves |

## 8. Verification artifact (re-runnable)

After execution, any reader can re-confirm the delivery with these four commands:

```bash
git fetch encore-mock nm2269
git show encore-mock/nm2269:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -oE 'TC-CPR-OVR-[0-9]+' | sort -u | wc -l
git show encore-mock/nm2269:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -c 'NM-2270'
git ls-tree -r encore-mock/nm2269 --name-only | grep -cE 'specs_planning|\.claude|CLAUDE\.md'
```

Expected output, in order: **44** · **0** · **0**.

## 9. Plan-Deviations log

| ID | Deviation | Disposition |
|---|---|---|
| D-1 | The plan originally specified `--tcs=TC-CPR-OVR-001..TC-CPR-OVR-044`. `spec-trim` accepted it (kept 44 / dropped 5) but `xlsx-trim` FATAL'd on it — the two tools accept different range syntaxes (F18). | Corrected to `--tcs=TC-CPR-OVR-001..044`, the one form both parsers accept. Plan-authoring defect, caught by the dry run doing its job. Phase 0.5's standalone trim proof did not catch it because it exercised `spec-trim` alone. |
| D-2 | `npm run typecheck` exits 2 on `scripts/task-context-builder.ts` and `src/data/adapters/excelAdapter.ts`. | **Pre-existing, PROVEN not assumed**: both files are absent from the Phase 0 dirty-tree snapshot, so they are unmodified at HEAD. Neither is under `clients/encore/`, so neither ships. Not a delivery blocker; not fixed here (out of scope, and untouched code). |
| D-3 | `npm run check:tc-parity` exits 1: 16 TCs (`TC-CPR-OVR-050..065`) present in spec+markdown but absent from the workbook. | **Caused by the uncommitted NM-2271 work**, which adds those TCs to the working-tree spec/MD while the workbook (verified clean at HEAD) has not been rebuilt. At HEAD, parity is exactly clean (`SPEC-ONLY = ∅`, `WORKBOOK-ONLY = ∅`, F12). The delivery archives HEAD, so the shipped payload is unaffected. Not a delivery blocker; resolving it is NM-2271's job, not this delivery's. |
| D-4 | The Phase 3.6 deny-list instruction (`git archive HEAD` → whole-repo extract) returned 668 hits. | **Defective instruction, not a real leak** — a full-repo archive includes `pipeline/`, `.claude/`, and `plans/`, which are naturally marker-dense and are never part of a client payload. Superseded by F19: `ship-branch.sh:183` already runs the deny-list against its own payload extract and hard-gates the push on it. The standalone step is redundant and was removed. |

## Execution Summary

**Executed**: 2026-07-22 · **Outcome**: shipped and verified on the remote.

### What shipped

`encore-mock/nm2269`, tip **`b7ad1ff6253fb755c74ec1ac7e2fa0db03460c30`**, authored as
`Encore Deliverable <deliverable@jade-biz.com>`, message `Encore deliverable — nm2269 module`.

- **44 TCs**: `TC-CPR-OVR-001..044` = all of NM-2268 (039-041) + all of NM-2269 (042-044).
- **NM-2270 excluded**: TC-045..049 dropped; `grep -c 'NM-2270'` on the pushed spec = **0**.
- **NM-2271 excluded**: 0 hits — it was uncommitted throughout and structurally could not ship.
- **Workbook**: `encore_test_cases.xlsx` → `corporate_pricing_override` sheet carries exactly 44
  unique TC IDs (`001..044`), 0 NM-2270; all 21 other module sheets pruned. `encore-qa-tracker.xlsx`
  ships untrimmed but carries 0 override rows and 0 NM-2270, and is pre-existing on nm2267/nm2268.
- **Leak check on the remote**: no `specs_planning/`, `.claude/`, `CLAUDE.md`, `.env.local`, `docs/`.
- **Coverage**: strict superset of `encore-mock/nm2268` (`001..041`). `REMOVED = ∅`, `ADDED = 042,043,044`.

### Test evidence (LR-059 — real E2E on the shipped bytes)

Run inside the built payload, not the working tree, because the tree carried an uncommitted NM-2271
selector change that TC-039/040 touch.

**43 passed · 0 failed · 0 flaky · 2 skipped · 8.1 min.** Screenshot delivered to Rutvik in chat (per-run artifact, not tracked).

The 2 skips are pre-existing, documented, name their unlock, and are already present in the same
state on the client's nm2268 — no new gap:
- `TC-CPR-OVR-023` — Max Discount % out-of-range; field enters a stuck state, intended behavior
  unknown until the defect is fixed.
- `TC-CPR-OVR-041` — RBAC read-only gate; every automation account we hold has equivalent access.
  Unlock named: a second automation account without the 1101 Revenue Management role (see NM-2126).

### Verification (numbered)

1. Cross-family re-derivation of the 9 load-bearing claims (`gpt-5.5`, run `nm2269-verify-C`) — **9/9 CONFIRMED, 0 refutations**.
2. `check:spec-quality` exit 0 — closes R1; the R-533 sleeps never reached HEAD.
3. Standalone trim proof — `kept: 44, dropped: 5`, dropping exactly 045..049.
4. First-push path audited before use (run `nm2269-firstpush-F`) — `FIX-PRESENT`; push took the
   no-lease branch as predicted and created the branch cleanly.
5. Post-push remote verification — 44 TCs, 0 NM-2270, clean leak check, both workbooks read via exceljs.

### Deviations

Four logged in §9. The load-bearing one is **D-1**: `spec-trim` and `xlsx-trim` accept different
range syntaxes, so the plan's original `--tcs` value passed the spec trim and FATAL'd the xlsx trim.
Corrected to `TC-CPR-OVR-001..044`. Plus **F17** (the trim tool could not run at all until root
`typescript` was restored) and **F21** (the shipped artifact is the scratch's git commit, not the
scratch directory — an `ls`-based inspection produces false alarms, and did produce one here).

### Working-tree integrity

The uncommitted NM-2271 batch is intact — all 36 entries from the Phase 0 snapshot still present,
diff shows additions only, no removals. The pushed `src/utils/field-case-runner.ts` matches HEAD, not
the dirty tree, confirming uncommitted work did not ship.

Additional working-tree entries appeared during execution (`package.json` + `check:ramp-expiry`,
`guardrail-config.json`, `walk-coverage/*`, `field-case-runner.ts`, `.machine-evidence/`). These are
**not from this delivery** — no ticket here references them, and the activity log shows a concurrent
delegation session (`dg-phase1c-bounce`, `dg-phase3b-helper`, `dg-falsegreen`) running build tickets
at 12:33-12:38. Left untouched.

### Open hygiene item (not a delivery defect)

13 leftover ship scratch directories under the system temp dir each contain a `.env.local` copy with
real automation credentials, left by prior ship runs. Local-only, never client-facing, but worth a
sweep. This delivery's own scratch (`tmp.tI6v3uYLFl`) could not be removed — held by a lingering
process — and is flagged for manual deletion.
