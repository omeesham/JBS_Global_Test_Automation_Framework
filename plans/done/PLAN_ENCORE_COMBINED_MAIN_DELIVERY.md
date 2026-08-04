# PLAN_ENCORE_COMBINED_MAIN_DELIVERY

**Status**: DONE
**Executed**: 2026-07-21
**Priority**: high
**Created**: 2026-07-21
**Identity**: OWNER (publishing is never delegated — push step is OWNER-only)
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

## 1. Context — the need

Rebuild the `main` branch of the CLIENT deliverables repo (`encore-mock` →
`RutviK-JBS/encore_deliverables_test`) so it carries the **latest of the two already-delivered
specs combined** — the `locations` surface **+** the `corporate-pricing` surface — as **one**
orphan snapshot, and **nothing more**.

**Hard constraint (user, emphatic):** NM-2268/2269/2270 ("Product Group Override automation",
framework commit `3d43c6e9`, TCs `TC-CPR-OVR-039..049`) is DONE on disk but **NOT to be
delivered**. It must be **fully scrubbed** — zero footprint in the payload. It ships later via its
own `plans/pending/PLAN_STAGED_TICKET_DELIVERY_NM2268_70.md` (NOT touched by this plan).

**Vision (user, verbatim intent — 2026-07-21):** the shipped specs **remain the SAME as what was
already delivered (same TC set) — JUST updated to latest code — with NO over- or under-delivery.**
Override is the *illustrative* case (this sprint added 039..049 on top of an already-shipped spec →
ship only 001..038), but the rule is GENERAL: for **every** spec, the shipped TC set must equal what
the two delivered branches (`encore-mock/locations`, `encore-mock/corporate-pricing`) already carry —
not HEAD's set if HEAD diverged. ⟹ a **TC-parity diff across all 15 specs is mandatory** (Phase 1.5);
any HEAD-extra TC (over-deliver) is trimmed to the delivered set, any delivered-missing TC
(under-deliver) HALTs. **Do not assume override is the only delta — prove it.**

**Autonomy (user, 2026-07-21):** standing GO to **push** once (a) I am sure + (b) the vision is
confirmed complete. Decide autonomously WITHOUT assuming — the parity + NM checks are the proof, not
a guess. `fable` is Rutvik's proxy but used FRUGALLY: I embody the vision and adjudicate myself; spawn
fable only if a real fork survives my reasoning. Never bounce a decision back to the user.

### Recon (run `recon-deliv-combined-0721`, verified on-disk by OWNER — see §2)

| Branch | Tip | Ships |
|---|---|---|
| `encore-mock/main` | `bdf2f752` (2026-07-07) | STALE: 3 corp specs (DET/SRC/STR) + 6 location specs. Missing EXA/IMA/LEX/LIM/NPB/OVR. |
| `encore-mock/locations` | `5d51475f` (2026-07-15) | 6 location specs. |
| `encore-mock/corporate-pricing` | `76013080` (2026-07-15) | 9 corp specs; override = **OVR-001..038 only** (no NM). |

All three remote branches are CLEAN of `2268/2269/2270`. NM lives only in framework HEAD.

### Two corrections to the recon (caught by OWNER; both would have caused a wrong delivery)

1. **`ship-branch.sh --tcs` is a `--keep` list, NOT `--exclude`** (`ship-branch.sh:146` →
   `spec-trim.mjs --keep=`). And it is applied to **every** surviving spec via the
   `find … *.spec.ts` loop, with range endpoints required to exist in **each** file
   (`spec-trim.mjs:672-680`). In a combined 15-spec ship, any `--tcs=…OVR…` **FATALs** on the
   first locations spec. **`--tcs` is unusable for a combined ship.**
2. **`src/` ships WHOLE and the deny-list excludes `NM-####` by design**
   (`forbidden-patterns.mjs:115`). `override.page.ts:555` ships a comment reading `NM-2268`, so a
   spec-only trim **leaks NM into src and the gate would not catch it**. → the strict (spec **+**
   src **+** workbook) scrub is **mandatory**.

---

## 2. Verified facts (OWNER, on-disk — not taken from the worker's prose)

- HEAD override spec = `TC-CPR-OVR-001..049`; delivered branch = `001..038`; `3d43c6e9` added net-new `039..049` (11 TCs). ✔
- `3d43c6e9^` override spec = `001..038` = the latest **non-NM** state (nothing after `3d43c6e9` touched the spec). ✔
- The 6 client-shippable override paths and their post-NM history:
  - `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts` — untouched after `3d43c6e9`.
  - `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` — untouched after `3d43c6e9`; carries `NM-2268` comment at :555 + ~13 helper methods for 039..049.
  - `clients/encore/src/data/corporate-pricing/override.ts` — only later change is `bb80bc3c` (reworded a comment on an **NM line** → disappears anyway).
  - `clients/encore/src/selectors/corporate-pricing/override.ts` — untouched after `3d43c6e9`.
  - `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` — untouched after `3d43c6e9`.
  - `clients/encore/test_cases_xlsx/encore-qa-tracker.xlsx` — **ships** (present in the delivered corp-pricing branch tree); touched by `3d43c6e9`, untouched after. Ships WHOLE (ship-branch only module-trims `encore_test_cases.xlsx`, never the tracker) → its NM rows would leak unless scrubbed. **[audit finding F2]**
- ⟹ A single **atomic** `git checkout 3d43c6e9^ -- <those 6 paths>` yields the exact "latest-minus-NM" override surface. The kept `001..038` predate the NM page-object methods, so removal is compile-safe (typecheck confirms).
- Your uncommitted WIP does not include any of the 5 override paths, and `ship-branch.sh` archives **committed HEAD** — so the build cannot corrupt your working tree.

---

## 3. Mechanism (surgical; Karpathy-simplest that is provably clean)

### Phase 1 — Build the scrubbed delivery branch (reversible, local, NO push)
```bash
git switch -c delivery/main-combined            # branch AT current HEAD; WIP carries over untouched
PATHS="clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts \
  clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts \
  clients/encore/src/data/corporate-pricing/override.ts \
  clients/encore/src/selectors/corporate-pricing/override.ts \
  clients/encore/test_cases_xlsx/encore_test_cases.xlsx \
  clients/encore/test_cases_xlsx/encore-qa-tracker.xlsx \
  clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md \
  clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md"
git checkout 3d43c6e9^ -- $PATHS
git commit -m "delivery: combined main, NM-2268/69/70 scrubbed to pre-NM state" -- $PATHS
```
**Why 8 paths, not 6 (F3 — caught by the build worker's aborted commit):** `3d43c6e9` is a **mixed team-sync commit** (~65 files); only these 8 are override-specific — everything else it touched (`credential-loader.ts`, skills, plans, CLAUDE.md, …) is latest code we KEEP, never reverted. The 2 MD files (`*_test_cases.md`, `*_test_plan.md`) are `specs_planning/` → **stripped from the client payload**, but they carry `OVR-039..049` and the pre-commit `check:tc-parity` (ALL-071) gate blocks the commit on MD>XLSX unless they're reverted in lockstep. `encore_test_cases.xlsx` delta `3d43c6e9^→HEAD` is proven to be **exactly** `OVR-039..049` (0 other rows), so the file-level revert is surgical.
Path-limited commit → only the 5 override paths are committed; every other uncommitted change stays uncommitted and untouched.

**Compile gate (must pass before any ship):** `cd clients/encore && npx tsc --noEmit` and
`npx playwright test --list` resolve with zero errors (proves removing the NM methods didn't break OVR-001..038).

### Phase 1.5 — Parity vs the delivered branches (the "no over/under-deliver" proof)

**Reference = the two DELIVERED branches, never the stale `encore-mock/main`** (which currently
carries only 3 corp specs + 6 loc — far less than delivered; we force-replace it). Delivered set =
`encore-mock/locations` (6 spec files) ∪ `encore-mock/corporate-pricing` (9 spec files) = **15**.

**(a) Spec-FILE-set parity** — the extract's spec files (by `tests/…` name) MUST equal exactly the
union of the two delivered branches' spec files:
```bash
{ git ls-tree -r --name-only encore-mock/locations | grep '\.spec\.ts$';
  git ls-tree -r --name-only encore-mock/corporate-pricing | grep '\.spec\.ts$'; } | sort -u > /tmp/delivered_files.txt
# after the dry-run: ( cd <VERIFY> && find tests -name '*.spec.ts' | sort -u ) > /tmp/extract_files.txt
comm -23 /tmp/delivered_files.txt /tmp/extract_files.txt   # UNDER (delivered file missing) → HALT
comm -13 /tmp/delivered_files.txt /tmp/extract_files.txt   # OVER  (HEAD-only spec file) → drop it
```
Both `comm` outputs MUST be empty.

**(b) TC-set parity within each shared file:**
For each shipped spec, compare the delivery-branch TC set against the SAME spec in the delivered
branch (`encore-mock/locations` for `location-*`, `encore-mock/corporate-pricing` for
`corporate-pricing-*`). Delivered-branch trees are stripped to `tests/…`:
```bash
for f in $(git ls-tree -r --name-only HEAD clients/encore/tests | grep '\.spec\.ts$'); do
  rel=${f#clients/encore/}                       # tests/<...>.spec.ts
  case "$rel" in */location-*) B=locations;; *) B=corporate-pricing;; esac
  head=$(git show HEAD:"$f" | grep -oE 'TC-[A-Z0-9-]+' | sort -u)
  dlv=$(git show encore-mock/$B:"$rel" 2>/dev/null | grep -oE 'TC-[A-Z0-9-]+' | sort -u)
  echo "== $rel (vs $B) =="
  echo "OVER (head-only, must be 0 after scrub): $(comm -23 <(echo "$head") <(echo "$dlv") | tr '\n' ' ')"
  echo "UNDER (delivered-only, must be 0):       $(comm -13 <(echo "$head") <(echo "$dlv") | tr '\n' ' ')"
done
```
- **After the override scrub, EVERY spec must show OVER=∅ and UNDER=∅.** Override should now read OVER=∅ (039..049 gone), UNDER=∅ (001..038 kept).
- Any residual **OVER** (a HEAD-extra TC on another spec) → trim it to the delivered set with `spec-trim.mjs --drop=<ids>` on the delivery branch (latest code kept, extra TC removed), re-commit, re-run parity. This is the general over-deliver guard.
- Any **UNDER** (delivered TC missing at HEAD) → **HALT**, surface to `fable` — a delivered case vanishing is a regression, not a scrub.

### Phase 2 — Dry run the combined ship (NO `--push`, keep scratch to inspect)
```bash
bash scripts/ship-branch.sh --branch=main \
  --modules=LOC.ACC,LOC.AAO,LOC.LP,LOC.LGL,LOC.NTS,LOC.SSL,CPR \
  --surface='location-account-address*,location-auto-addon*,location-left-panel-basic-information*,location-legal*,location-notes*,location-shared-setup*,corporate-pricing/**' \
  --keep-scratch
```
No `--tcs` (spec + workbook already scrubbed on the branch). Dry run runs build + trim + deny-list.

### Phase 3 — Inspect the payload (OWNER verification — the whole point)
Against the printed `VERIFY=<dir>` clean re-extract:
- **Text files** (spec/src/comments): `grep -rE '2268|2269|2270|NM-?226|NM-?227' <VERIFY>` → **MUST be 0 hits**.
- override spec in the extract tops at `TC-CPR-OVR-038`; `grep -r 'OVR-039\|OVR-04' <VERIFY>` → 0.
- **Workbook cells** (F1 — `grep` cannot see inside `.xlsx`; read cells with exceljs). From repo root:
  ```bash
  node -e 'const E=require("exceljs");(async()=>{for(const f of process.argv.slice(1)){const wb=new E.Workbook();await wb.xlsx.readFile(f);const h=[];wb.eachSheet(s=>s.eachRow(r=>r.eachCell(c=>{const v=String(c.value??"");if(/OVR-0(39|4[0-9])|2268|2269|2270|NM-?226|NM-?227/.test(v))h.push(s.name+":"+v);})));console.log(f.split(/[\\/]/).pop(), h.length?("NM HITS "+h.join(" | ")):"CLEAN");}})();' \
    <VERIFY>/test_cases_xlsx/encore_test_cases.xlsx <VERIFY>/test_cases_xlsx/encore-qa-tracker.xlsx
  ```
  BOTH workbooks MUST print `CLEAN`.
- **Coverage-regression:** every TC-ID in `encore-mock/corporate-pricing` (9 specs) and `encore-mock/locations` (6 specs) is present in the extract (combined is a superset; the only intentional delta is the never-delivered OVR-039..049).
- No `specs_planning/`, `.claude/`, `CLAUDE.md`, `docs/`, `.env.local` in the extract (deny-list already ran, plus manual confirm).
- 15 spec files present (6 locations + 9 corp-pricing).

### Phase 3.5 — Vision-completeness adjudication (fable used FRUGALLY; else I AM fable)
The completeness rule is objective and already encoded, so OWNER (embodying Rutvik's vision)
adjudicates directly from the evidence: **COMPLETE ⟺ Phase-1.5 parity shows OVER=∅ AND UNDER=∅ for
all 15 specs AND Phase-3 NM checks (text + both workbook cell-reads) are all clean AND the extract
carries exactly the 6 location + 9 corp specs.** If that holds → COMPLETE, proceed. Spawn the actual
`fable` agent ONLY if a genuine fork survives my reasoning (e.g. a spec shows OVER/UNDER and it's
ambiguous whether an extra/missing TC is scrub vs regression) — frugal use, never reflexive. Never
bounce the call to the user.

### Phase 4 — Push (OWNER-ONLY; standing user GO)
The user gave **standing authorization** to push once I am sure AND fable says COMPLETE ("push it to
the main!", "GO!"). No fresh chat gate needed. Report the payload to the user for the record, then:
```bash
bash scripts/ship-branch.sh --branch=main --modules=… --surface='…' --push
```
Publishing stays OWNER — the worker never pushes.

### Phase 5 — Verify remote + clean up
```bash
git fetch encore-mock main
git show encore-mock/main:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -c 'TC-CPR-OVR'   # = 38
git ls-tree -r encore-mock/main --name-only | grep -E 'specs_planning|\.claude|CLAUDE\.md|\.env\.local' && echo LEAK || echo clean
git switch main            # MANDATORY final state — user asked explicitly: end on `main`
git branch -D delivery/main-combined
git rev-parse --abbrev-ref HEAD   # MUST print: main
git status --porcelain            # WIP intact, untouched
```
Report tip SHA, shipped TC count, leak-check = clean, **and confirm HEAD = `main` with WIP intact**. Then STOP.

---

## Execution Summary

_Executed 2026-07-21._

**Pushed** `encore-mock/main` tip **`89cc092f`** ("Encore deliverable — main module"), force-replacing the stale `bdf2f75` (3 corp specs) with the combined deliverable — **15 specs** (9 corporate-pricing + 6 locations), latest code.

**Scrub proven on the remote (independently re-verified from git objects, not worker prose):**
- override spec = **OVR-001..038** (38 unique TCs), **zero** `TC-CPR-OVR-039..049`.
- **zero** `2268/2269/2270` in shipped text (`git grep` over `tests/` + `src/`).
- both workbooks **CLEAN** via exceljs cell-read (`encore_test_cases.xlsx`, `encore-qa-tracker.xlsx`).
- deny-list clean; no `specs_planning/`, `.claude/`, `CLAUDE.md`, `docs/`, `.env.local` leak.

**No over/under-deliver:** TC-parity over all 15 delivered specs vs `encore-mock/locations` (6) + `encore-mock/corporate-pricing` (9) = **OVER=0 / UNDER=0** — shipped TC set equals the delivered set exactly.

**Compile:** `npx tsc --noEmit` exit 0; `npx playwright test --list` = 737 tests, exit 0.

**Mechanism:** throwaway `delivery/main-combined` off HEAD; atomic `git checkout 3d43c6e9^ --` of **8** override-specific paths (spec + 3 src + 2 xlsx + 2 MD). `3d43c6e9` is a MIXED team-sync commit (~65 files); only the 8 override paths were reverted — all other bundled latest code kept. The 2 MD files (`specs_planning/`, non-shipping) were reverted in lockstep to clear the `check:tc-parity` pre-commit gate. `encore_test_cases.xlsx` delta `3d43c6e9^→HEAD` was verified = **exactly** `OVR-039..049` (0 collateral), so the file-level revert was surgical.

**Local state restored:** repo back on `main`, `delivery/main-combined` deleted, the 8 override paths clean on `main` — NM-2268/69/70 remains intact locally for `PLAN_STAGED_TICKET_DELIVERY_NM2268_70.md` (untouched).

**Deviations:** build attempt 1 correctly HALTED on the `check:tc-parity` gate (my ticket under-scoped the revert 6→8 paths — a prompt-issue, no worker bounce); corrected in attempt 2. My initial NM verification pattern `NM-?226` was over-broad (matched already-delivered 2261/2262/2264/2265); tightened to the exact `2268/2269/2270` scrub target — 0 hits.

**Delegation:** 3 sonnet dispatches (research ×1, build ×2, all capped). Publishing (dry-run + push) done by OWNER, never delegated. Crux facts re-proven personally from git objects.

## Verification artifact (post-execution — re-runnable)
```bash
git fetch encore-mock main
git show encore-mock/main:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -oE 'TC-CPR-OVR-[0-9]+' | sort -u | wc -l   # => 38
git show encore-mock/main:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -cE 'OVR-039|OVR-04[0-9]'                    # => 0
git ls-tree -r --name-only encore-mock/main | grep -cE '\.spec\.ts$'                                                                     # => 15
git grep -cE '2268|2269|2270' encore-mock/main -- tests src                                                                              # => (no output = 0)
```

---

## 4. NOT touched (explicit)
- `plans/pending/PLAN_STAGED_TICKET_DELIVERY_NM2268_70.md` — the *future* NM-2268/70 delivery. Untouched.
- The paused `NM2305` chain. Untouched.
- Your uncommitted WIP (the modified/untracked files in `git status`). Untouched — only the 5 override paths are committed, on a throwaway branch that is deleted in Phase 5.
- `encore-mock/locations` and `encore-mock/corporate-pricing` branches — not modified; `main` is force-rebuilt as a fresh orphan (standard for this remote).
- `ship-branch.sh` / `spec-trim.mjs` / any gate — never edited to make a push pass (push-skill rule).

## 5. Stale-cleanup (LR-050) & scaffolding notes
- The only artifact created is the scratch `delivery/main-combined` branch — deleted in Phase 5. Nothing else becomes stale.
- LR-048 Per-Identity Satisfaction Matrix is **N/A**: this is an OWNER one-shot ship op, not a pipeline test-authoring subplan — no new TCs are authored, no queue entry, no baseline/planner/generator artifacts. The only `.spec.ts` change is an **atomic revert-to-pre-NM** for delivery scrub, owned by OWNER.

## 6. Acceptance criteria
- [ ] Phase 1 branch built; `tsc --noEmit` + `playwright test --list` green.
- [ ] Phase 2 dry-run exits 0 with deny-list clean.
- [ ] Phase 3: `grep 2268|2269|2270|NM-?226|NM-?227` over the extract = **0 hits**; override tops at OVR-038; 15 specs present; zero coverage regression vs both source branches.
- [ ] Phase 4: payload shown; explicit user "go" recorded before `--push`.
- [ ] Phase 5: remote `main` override TC count = 38; leak-check clean; scratch branch deleted; original branch restored with WIP intact.

## 6b. Adversarial audit (ultrathink GATE 1) — findings resolved
- **F1** (verification hole): `grep` cannot see inside `.xlsx` binaries → Phase 3 now reads workbook **cells** via exceljs for both workbooks. Resolved.
- **F2** (scope gap): `encore-qa-tracker.xlsx` ships whole and carried NM rows → added to the atomic `3d43c6e9^` checkout (Phase 1). Resolved.
- **Interpretation confirmed on record**: "latest of the two shipped specs" = HEAD's current TC content for the already-delivered spec files (e.g. SRC now 58 vs the old branch's 56), minus ONLY the never-delivered NM-2268/69/70. NOT a byte-reproduction of the 2026-07-15 branch snapshots. If the intent was "reproduce the old snapshots exactly", HALT and re-scope.
- **Compile gate** is the safety net for the src revert; **Phase-3 whole-extract grep + workbook cell-read** is the safety net for any stray NM reference regardless of source file.

## 7. Verification artifact
`git show encore-mock/main:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -cE 'TC-CPR-OVR-[0-9]+'` → **38**, and
`git show encore-mock/main:tests/corporate-pricing/corporate-pricing-override.spec.ts | grep -cE 'OVR-039|OVR-04[0-9]'` → **0**.
