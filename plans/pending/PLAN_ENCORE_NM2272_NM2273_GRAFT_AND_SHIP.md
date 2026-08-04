---
name: PLAN_ENCORE_NM2272_NM2273_GRAFT_AND_SHIP
Status: PENDING
Priority: High
Created: 2026-07-24
Identity: OWNER (orchestrator/CEO — decompose → ticket → dispatch → verify verdict). Per-phase pipeline work is delegated to council workers and audited via the Per-Identity Satisfaction matrix (§Per-Identity).
Depends on: current working-tree state (uncommitted NM-2271 override graft already on disk) — see Phase A.
Model: claude-opus-4-8
Thinking: xhi
PermissionMode: acceptEdits
BrowserTool: Playwright CLI (E2E ×2 proof only; live import target = the colleague's already-certified office 4107). Per `.claude/rules/browser-tool.md`. No Chrome-MCP row applies.
Mode: /delegation-temp ON (CEO), /ultra-agents ON (caps lifted for this goal). Substantive labor is ticketed to council-workers; CEO writes tickets, dispatches, reads verdicts, judges. Publishing (Phase F) is OWNER-only, never delegated.
---

# PLAN — Graft colleague branches NM-2272 (override EXPORT) + NM-2273 (override IMPORT) onto our disk `main`, verify per-identity, ship to the client deliverables repo

## Context

The user wants the colleague's two Corporate-Pricing → Product-Group Override branches grafted **together** onto our disk `main`, quality-verified per pipeline identity, then shipped to the client repo `encore_deliverables_test` on branches `corporate-pricing` and `main`.

**Scope is GRAFT, not gap-work.** Direct user constraint: *"do not find gaps or fix them, just graft whatever we got, as long as code quality of everything is top notch and all /identity are satisfied with their respective work area."* No coverage expansion, no target re-certification, no test-logic "improvements." The only transformation permitted beyond a straight splice is what is **mechanically required** to make three independent branches co-exist in one tree (TC-ID de-collision + binary/INDEX regeneration) — that is conflict resolution, not gap-filling.

### Verified reality (recon done 2026-07-24 — every number below is `git`-confirmed, no assumptions)

Branch base for all three = `origin/main` @ `4591adbc`. **They are independent SIBLINGS, not a stack:**

| Branch | Tip | Commits over main | What it adds |
|---|---|---|---|
| NM-2271 | b8b1100b | +4 | grid equipment/labor (TCs 050–065) — **already on our disk, uncommitted** |
| NM-2272 | a7970f13 | +1 | override **EXPORT** — 22 TCs, page +153 / selectors +20 / data +81 / spec +470 |
| NM-2273 | ee6fe7f9 | +2 | override **IMPORT** — validation matrix + partial-success API fix; page +112 / selectors +13 / data +79 / spec +400 / 9 CSV fixtures |

**Four load-bearing findings that change the shape of the job:**

1. **TC-ID COLLISION.** NM-2272's own `gapLedger` reserves 050–065 for NM-2271 and declares *"NM-2272 starts at 066."* But NM-2273 **also** mints `TC-CPR-OVR-066–068`. Merged as-is → duplicate IDs → parity + `--list` break. Resolution is **mechanical de-collision** (Phase C), not a gap fix.
2. **3-WAY FILE OVERLAP on a dirty tree.** All three branches edit the same six files (`src/data/corporate-override/override.ts`, `src/pages/corporate-override/corporate-override.page.ts`, `src/selectors/corporate-override/override.ts`, `tests/.../corporate-override-nm2272.spec.ts` + `corporate-override-nm2273.spec.ts`, `specs_planning/.../test_cases.md`, `.../test_plan.md`) **plus** the binary `testcases/encore_test_cases.xlsx`. The disk already holds NM-2271's uncommitted versions of these. Grafting is a real 3-way reconcile, not two clean patches.
3. **DERIVED ARTIFACTS must be REGENERATED, never diff-applied.** The binary `.xlsx` cannot be 3-way merged → rebuild from combined test-cases (`npm run xlsx:build`). NM-2272 hand-churns `plans/INDEX.md` (566 lines) → drop that diff, `npm run plans:reindex` (LR-035: INDEX is auto-generated, never hand-edited).
4. **"Phases 5–6 wearing an import plan's clothes."** The colleague's `SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md` already marks **Phase 5** (framework closure audit + gate ramp) and **Phase 6** (PARKED office alignment) as *"COLLEAGUE-OWNED, NOT EXECUTED THIS SESSION"* with a Deferral Authorization. Phases **0.7–4** are the import CODE that is real and graftable. This plan grafts 0.7–4, **preserves 5–6 as deferred/parked** (does not execute them, does not let them gate completion), and adds a one-line pointer that Phase 6's true home is `PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT`.

### Two destinations (do not conflate — LR-049)

- **Our repo (`origin`, team):** the full graft — spec, page objects, selectors, data, fixtures, `specs_planning/` test-cases/plans, the two NM-2273 subplans, xlsx. Stays on disk. **Never pushed to `origin` by this plan** (user's standing rule: team-repo pushes are his call).
- **Client repo (`encore-mock`):** only the shipped test surface — the override `.spec.ts` + its xlsx sheets, filtered by `ship-branch.sh`. `specs_planning/`, `docs/`, `.claude/` are purged by the ship script and must never appear (Phase F leak-check).

---

## Bootstrap

- **Identity**: OWNER orchestrates. Graft-splice/verify phases delegate to BUILDER-seat council-workers; the per-identity audit delegates to a WATCHDOG-seat worker; publishing is OWNER-only.
- **Skills auto-called**: `/graft` (splice→verify→prove→sync discipline), `/regression-guard` (wrap every code mutation), `/audit` (Phase E + post-execution), `/push-encore-deliverables` (Phase F), `/delegation-temp` + `/ultra-agents` (dispatch posture).
- **Context files every executor must load**:
  - `.claude/skills/graft/SKILL.md` — the 5-step graft invariant (index synced to tested tree; **never `git add` before E2E green**).
  - `.claude/skills/push-encore-deliverables/SKILL.md` — ship mechanics (one branch per invocation; dry-run before `--push`; verify payload not exit code).
  - `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 (ownership) + §4 (POM naming / worker ladder).
  - `.claude/rules/pipeline.md` — LR-035 (INDEX auto-gen), LR-048 (this plan's structure), LR-049 (ship via git-archive only), LR-059/LR-060 (real-E2E + spec-quality-on-worktree before any green claim).
  - `.claude/rules/browser-tool.md` — CLI-default; auth path `clients/encore/.auth/encore-state.json`.
  - Source of truth for the graft: `origin/NM-2272` @ `a7970f13`, `origin/NM-2273` @ `ee6fe7f9` (fetched 2026-07-24).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY, blocking)

1. Confirm `origin/NM-2272` and `origin/NM-2273` are fetched at the SHAs above (`git rev-parse`). If a re-fetch moved either tip, **HALT** — the recon below is keyed to these SHAs.
2. Confirm `encore-mock` remote resolves to `encore_deliverables_test` and both target branches exist (`git ls-remote --heads encore-mock corporate-pricing main`). Confirmed 2026-07-24.
3. Browser-tool = Playwright CLI (Gate: default). E2E only in Phase D; import tests reuse the colleague's certified office **4107** — this plan does **not** re-run Phase 0.7 target certification (that is the colleague's completed work; re-doing it is out of scope).
4. Labor gate: every `npx tsc`, `npx playwright test`, `--list`, and live walk is **ticketed to a T0/T1 council-worker** via `copilot-worker.sh`. The CEO never runs them inline.

> **Phase 0.5b (baseline-first walk)** — NOT REQUIRED. Identity ≠ WATCHDOG, no `/find-bugs`, title is a graft/ship not an audit, and this plan authors zero new behavior (it relocates the colleague's already-walked work). `baselineScope: baseline-absent-by-graft`.

---

## Phase A — Safety snapshot + disk baseline (OWNER, do FIRST — BLOCKING GATE)

The disk is dirty (in-progress NM-2271 graft + a large pile of untracked probe/debug junk). Establish a truthful, reversible base before touching anything.

1. **Non-destructive snapshot** of the current tree to the scratchpad (NOT a branch — user keeps only `main`): `git stash create` → record the returned SHA; `git diff HEAD > <scratch>/pre-graft-2272-2273.patch`; `git status --porcelain > <scratch>/pre-graft-status.txt`. This is the rollback point. **Do not `git stash pop`/`checkout`/`reset`/`clean` anything.**
2. **Junk is flagged, NEVER deleted.** The untracked debris (`part-*.js`, `diag.js`, `accept-denom.mjs`, `test-regex.mjs`, `100`, `*.png` screenshots, `out-e2e/`, `out-lots/`, `out-merge/`, `.machine-evidence/`, `clients/encore/clients/`, `*.bak-lcd07`, `scripts/validate-tcs.mjs`, `scripts/xlsx-trim.test.mjs`) is inventoried into `<scratch>/junk-inventory.txt` and surfaced to the user for a **separate** cleanup decision. This plan does not remove user data (memory: never delete without asking). It DOES confirm none of it is a graft input.
3. **Capture the current NM-2271-on-disk override baseline** (ticketed): current `TC-CPR-OVR-*` ID set in the spec (`grep -oE 'TC-CPR-OVR-[0-9]+' | sort -u`), row count in `test_cases.md`, and `npx tsc --noEmit` result. Save to `<scratch>/disk-baseline-2271.txt`.
4. **GATE**: if the current disk does **not** typecheck clean, **HALT and surface** — do not graft onto a broken base (any post-graft breakage must be attributable to the graft, not pre-existing). If the NM-2271 disk state is materially incomplete, surface that too before proceeding.

**Acceptance**: snapshot SHA + patch + junk inventory + disk baseline all written to scratchpad; disk typechecks clean (or a HALT is raised).

---

## Phase B — Graft NM-2272 (EXPORT) onto disk (BUILDER-seat worker + cross-provider reviewer)

Source = `origin/NM-2272` @ `a7970f13`; incremental diff = `git diff origin/main...origin/NM-2272`.

1. **Splice the client-shippable code additively** (per `/graft` Step 1 — anchor-first, atomic): the export methods into `override.page.ts`, export selectors into `selectors/override.ts`, export data into `data/override.ts`, and the 22 export TCs into `override.spec.ts`. **Validate every insertion anchor across all files BEFORE writing any file.** Abort loudly on any missing/ambiguous anchor.
2. **Detect true conflicts vs additive** (adversarial guard — do NOT blind-append). Run `git merge-tree` / a `--3way` dry apply of the NM-2272 hunks against the current disk (which carries NM-2271). Any hunk that edits an **existing** shared line/method/selector (not a clean addition) is a real conflict → resolve by hand, cite the both-sides context, never silently clobber. Additive-only hunks (new TCs, new methods) splice clean.
3. **Splice the internal artifacts**: export TCs into `specs_planning/.../test_cases.md`, scenarios into `test_plan.md`. Keep NM-2272's `066+` numbering (it is the reserved-lower set — see Phase C).
4. **Explicitly EXCLUDED from the splice** (regenerated/decided later, not diff-applied): the binary `.xlsx` (Phase D), `plans/INDEX.md` (Phase D reindex), `package.json`/`package-lock.json` Playwright bump `^1.58.2 → ^1.60.0` (**DECISION: do NOT graft the bump** unless Phase D proves the new specs require ≥1.60 — flag if they do), `export_test_cases/module-codes.json` gapLedger churn (fold only the entries needed for the final ID map in Phase C).
5. **Verify vs source** (`/graft` Step 2): diff the spliced export additions against `origin/NM-2272`; confirm import paths, selector naming, and POM conventions match our tree. Fix discrepancies in the working tree (not staged).
6. **Reviewer** (provider ≠ worker's provider) re-checks the splice against source. **Do not `git add`.**

**Acceptance**: `override.spec.ts` contains all 22 export TCs; `npx tsc --noEmit` green (ticketed); reviewer verdict GENUINE; index untouched (no `git add`).

---

## Phase C — Graft NM-2273 (IMPORT) + resolve the TC-ID collision (BUILDER-seat worker + reviewer)

Source = `origin/NM-2273` @ `ee6fe7f9`; incremental diff = `git diff origin/main...origin/NM-2273`.

1. **Resolve the TC-ID collision FIRST** (mechanical, blocking): grep the **exact** ID ranges in both the already-spliced NM-2272 set and the incoming NM-2273 set (`grep -oE 'TC-CPR-OVR-[0-9]+' | sort -u`). **DECISION: export (NM-2272) keeps its `066…NN` numbering; the NM-2273 import TCs are renumbered to continue AFTER export's highest ID.** Apply the renumber **consistently and atomically** across: `override.spec.ts` titles, `test_cases.md`, `test_plan.md`, and any `gapLedger`/`module-codes.json` reference. Produce a `<scratch>/tc-id-remap-2273.txt` (old→new) as the audit trail. This is de-collision only — **no TC content changes**.
2. **Splice the import code additively** (same anchor-first + conflict-detection discipline as Phase B step 2): import methods into `override.page.ts`, import selectors, import data, the (renumbered) import TCs into `override.spec.ts`.
3. **Splice the 9 net-new CSV fixtures** into `clients/encore/fixtures/import-all/` (no conflict — new files): `override-discount-over-100.csv`, `override-extra-columns.csv`, `override-header-only.csv`, `override-invalid-currency.csv`, `override-negative-price.csv`, `override-nonexistent-location.csv`, `override-nonexistent-pg.csv`, `override-nonnumeric-price.csv`, `override-too-few-columns.csv`.
4. **Graft the NM-2273 subplans as GIVER artifacts, with the Phase 5–6 separation the user asked for:**
   - `SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md` — bring it in. Keep **Phases 0.7–4** (the import work that was executed). Keep **Phase 5** (framework closure/gate-ramp) and **Phase 6** (parked office alignment) **exactly as the colleague marked them: DEFERRED / PARKED, NOT EXECUTED.** Add one line under Phase 6: *"Real home: `plans/pending/PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT.md` — Corp-Pricing-wide, not 2273-specific."* Do **not** execute 5–6; they do **not** gate this plan's completion.
   - `SUBPLAN_CORP_PRICING_NM2273_REMEDIATION.md` — bring it in as-is (colleague's validation-matrix/doc-parity/re-audit record). Documentation only; do not execute its phases.
5. **Verify vs source** + reviewer, same as Phase B. **Do not `git add`.**

**Acceptance**: zero duplicate `TC-CPR-OVR-*` IDs across the merged spec (`grep -oE 'TC-CPR-OVR-[0-9]+' | sort | uniq -d` → empty); remap file written; 9 fixtures present; import subplan carries 0.7–4 live and 5–6 explicitly deferred; `npx tsc --noEmit` green; reviewer verdict GENUINE.

---

## Phase D — Regenerate derived artifacts + full quality gate (BUILDER/OWNER + workers)

1. **Regenerate the xlsx from combined test-cases** (never diff-apply the binary): `npm run xlsx:build`, then `npm run check:tc-parity` → **exit 0** (spec ↔ test_cases.md ↔ xlsx parity across all three grafts' TCs). A non-zero parity is almost always a leftover collision or a missed TC — fix, do not suppress.
2. **Regenerate `plans/INDEX.md`**: `npm run plans:reindex` (LR-035). Drop NM-2272's hand-edited INDEX diff entirely.
3. **Typecheck**: `npx tsc --noEmit` (from `clients/encore`) → exit 0 (ticketed).
4. **Spec-quality on the WORKING TREE** (LR-060 obligation 4 — mandatory before any green claim): `npm run check:spec-quality` → pass. Catches weak/silent-swallow assertions in the grafted specs before they can be called "verified."
5. **Real E2E proof** (`/graft` Step 3 + LR-059): run `corporate-override/corporate-override-nm2272.spec.ts` and `corporate-override/corporate-override-nm2273.spec.ts` **green ×2** (ticketed to a T0/T1 worker; import TCs use certified office 4107). This proves the **working tree**, which is why the index is synced only after (Phase F), never before. Persist both run summaries.
6. **Commit-gate battery** (push-ready ≠ just-green — memory `feedback_commit_gate_battery_before_pushready`): run the repo's pre-commit checks (`check:spec-quality`, `check:tc-parity`, step-labels, and the rest of the `check:*` family the pre-commit hook runs). All green.

**Acceptance**: tc-parity exit 0; INDEX reindexed; tsc exit 0; spec-quality pass; override spec green ×2 (two dated run summaries); commit-gate battery green. Any red → HALT, do not proceed to identity audit or ship.

---

## Phase E — Per-identity satisfaction audit (WATCHDOG-seat worker + OWNER judgment)

The user's explicit bar: *"all /identity are satisfied with their respective work area."* This is a **quality verification of what was grafted**, NOT a coverage hunt. For each identity, confirm its owned artifact in the grafted result is coherent and top-notch; do NOT add new coverage.

| Identity | Work area to verify in the grafted result | Pass condition |
|---|---|---|
| HUNTER | target/baseline recon artifacts (colleague's Phase 0.7 import-target certification; any export baseline) | artifact exists, names a certified office (4107), and marks 1604 only as rejected — `grep` confirms |
| GIVER | `test_cases.md` + `test_plan.md` + xlsx | `check:tc-parity` exit 0; zero duplicate TC IDs; every TC well-formed |
| BUILDER | `override.spec.ts` + page objects + selectors + data + fixtures | `npx playwright test --list` resolves every grafted TC ID; tsc clean; green ×2 |
| HEALER | the colleague's "partial-success API fix" (NM-2273) | fix present in page object/data, coherent, covered by an import TC — no dangling reference |
| WATCHDOG | colleague's audit/remediation artifacts (NM-2273 REMEDIATION subplan; `agent-mistakes.md` additions) | grafted intact, internally consistent, no phantom cross-refs |
| GARDENER | structural cleanliness (no orphaned import, no dead selector, no duplicate `describe`) | tsc + lint clean; no duplicated block from the 3-way splice |
| OWNER | `plans/INDEX.md`, activity-log row, this plan's closure | INDEX reindexed; LR-028 row present; matrix fully resolved |

Delegate the audit to a WATCHDOG-seat worker (provider ≠ Phase B/C workers); CEO reads the verdict and makes the accept/flag call. **Any "satisfied" claim must cite a machine fact** (a grep, a parity exit code, a `--list` resolution) — never prose. This phase doubles as the ultrathink **post-execution audit gate**.

**Acceptance**: every row PASS with cited evidence, or a specific flag surfaced to the user. No row rubber-stamped.

---

## Phase F — Ship to the CLIENT deliverables repo (OWNER only, PUBLISH-GATED)

Publishing is Explicit-Permission-Required. **Nothing pushes without the user's per-branch GO.**

0. **Pre-req — local commit for the archive.** `scripts/ship-branch.sh` archives `HEAD`, so the grafted content must be in a commit. Make a **LOCAL commit on `main`** (per `/graft` Step 4: `git add` the grafted paths only *after* Phase D green, assert `git diff --quiet` = index==worktree, then commit). **This is a local commit only — it is NOT pushed to `origin`/the team repo** (user's standing rule preserved). ⚠ **Surface this to the user before doing it** — it is the one step that touches the "disk-only" posture, even though a local commit ≠ a push.
1. **Read `scripts/ship-branch.sh` arg parsing** to confirm the real flags (`--branch`/`--modules`/`--surface`/`--tcs`/`--push`) before relying on any — per the skill's own instruction. Copy the `--surface` glob from an existing preset that already ships this spec.
2. **Ship #1 → `corporate-pricing`** (one invocation, one branch):
   - Dry-run (no `--push`). Inspect the **payload, not the exit code**: which spec files survived, the exact TC-ID set, which xlsx sheets, and confirm **no `specs_planning/` / `docs/` / `.claude/` / `CLAUDE.md` / `.env.local`** leaked.
   - Coverage-regression check vs `encore-mock/corporate-pricing`: every TC-ID the client already has for this spec must still be present (a shrunk set = slicing bug → STOP).
   - Report payload to the user → **wait for GO** → `--push` → verify on remote (tip SHA, shipped TC count, leak-check `clean`).
3. **Ship #2 → `main`** (SEPARATE invocation — never batch branches): repeat the full dry-run → payload inspection → coverage check → **user GO** → `--push` → remote verify. The client `main` is a standalone orphan full-framework snapshot; confirm the override spec is added **without dropping** other modules' already-shipped specs.
4. After each successful push, **STOP** (skill rule: one authorisation = one branch).

**Acceptance**: two dry-runs shown and approved; two pushes verified on remote; leak-check `clean` on both; coverage non-regressed on both.

---

## Per-Identity Satisfaction (LR-048)

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | colleague import-target certification artifact (grafted, not re-authored) | `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-import-target-2026-07-23.md` (verify present + coherent) | `grep -c 1604 <artifact>` shows rejected-only |
| GIVER | `clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_nm2272_test_cases.md` + `corporate_override_nm2273_test_cases.md` + test_plan.md + `clients/encore/testcases/encore_test_cases.xlsx` | merged, de-collided, xlsx regenerated | `npm run check:tc-parity` exit 0 |
| BUILDER | `clients/encore/tests/corporate-override/corporate-override-nm2272.spec.ts` + `corporate-override-nm2273.spec.ts` + page objects/selectors/data + `clients/encore/fixtures/import-all/*.csv` | 22 export + import TCs spliced, green ×2 | `npx playwright test --list corporate-override/corporate-override-nm2272.spec.ts corporate-override/corporate-override-nm2273.spec.ts` resolves all IDs |
| HEALER | NM-2273 partial-success API fix (grafted) | present + covered by an import TC | `npm run check:tc-parity` exit 0 |
| WATCHDOG | `plans/pending/SUBPLAN_CORP_PRICING_NM2273_REMEDIATION.md` + `agent-mistakes.md` additions (grafted) | intact, consistent | Phase E audit verdict PASS |
| GARDENER | structural cleanliness after 3-way splice | no dupes/orphans | `npx tsc --noEmit` exit 0 |
| OWNER | `plans/INDEX.md` reindex + LR-028 activity-log row + this plan's closure + client ship | INDEX reindexed; log row landed; two client pushes verified | `npm run plans:reindex:check` exit 0 |

## Acceptance criteria (whole plan)

- [ ] Phase A snapshot + junk inventory + disk baseline written; disk typechecked clean before graft (or HALT surfaced).
- [ ] NM-2272 export code + TCs grafted; conflicts (if any) hand-resolved with both-sides context, not clobbered.
- [ ] NM-2273 import code + TCs + 9 fixtures grafted; **zero duplicate `TC-CPR-OVR-*` IDs** (`... | sort | uniq -d` empty); remap file written.
- [ ] Import subplan carries Phases 0.7–4 live and 5–6 explicitly DEFERRED/PARKED with the office-migration pointer; neither 5 nor 6 executed.
- [ ] Playwright bump NOT grafted unless proven required (flagged if it was).
- [ ] xlsx regenerated (`check:tc-parity` exit 0); `plans/INDEX.md` reindexed (not hand-edited); tsc clean; `check:spec-quality` pass; override spec **green ×2**; commit-gate battery green.
- [ ] Per-identity audit: every row PASS with a cited machine fact, or a specific flag surfaced. No rubber-stamp.
- [ ] `/graft` index-sync invariant honored: `git add` only after E2E green; `git diff --quiet` = 0 before any commit.
- [ ] Client ship: two dry-runs approved; `corporate-pricing` and `main` pushed in **separate** invocations; leak-check `clean`; coverage non-regressed — **each push gated on an explicit user GO**.
- [ ] Closure: activity-log row (LR-028); `/reflect`; ultrathink gates (adversarial audit ✔ recorded below, post-execution audit = Phase E) all satisfied.

## Adversarial Plan Audit (ultrathink gate — recorded, not rubber-stamped)

- **Skeptic — "this will fail because…"** the splice could treat NM-2272/2273 as purely additive to NM-2271 and silently clobber a shared line if any branch edits (not appends to) a common helper/selector. → Mitigated: Phase B/C step 2 mandates `git merge-tree`/`--3way` conflict detection; blind-append is forbidden; true conflicts are hand-resolved with both-sides context.
- **Skeptic #2 — the binary xlsx and INDEX.md.** A naive graft would 3-way-merge the `.xlsx` (impossible → corruption) or diff-apply NM-2272's 566-line INDEX churn (LR-035 violation). → Mitigated: Phase D regenerates both from source; both are excluded from the splice.
- **Scope — over-reach risk.** The plan must not re-certify targets, re-walk coverage, or "improve" tests (user: don't find/fix gaps). → Guard: Phases are verify-quality only; the sole permitted transform is mechanical de-collision + derived-artifact regen. TC content is never edited.
- **Scope — under-reach risk.** Client `main` is a full-framework orphan snapshot; shipping the override spec must not drop other modules' shipped specs. → Guard: Phase F coverage-regression check on both branches.
- **User intent — "graft whatever we got."** De-collision and Phase 5–6 separation could look like scope creep. → Confirmed in-bounds: the collision **breaks compilation/parity** (mandatory to fix), and 5–6 separation is the explicit *"take care of this"* ask. Both are conflict/organization, not gap-filling.

## Decisions I made (objective calls — confirm or correct at plan review)

1. **TC-ID de-collision**: export (NM-2272) keeps `066…`, import (NM-2273) renumbers to follow. (Alt: renumber export instead — say so if you prefer.)
2. **Playwright bump `1.58→1.60`**: NOT grafted unless the specs prove they need it. (Keeps our pinned toolchain stable.)
3. **Phases 5–6 of the import subplan**: grafted as **deferred/parked**, not executed; Phase 6 pointed at `PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT`.
4. **Local commit before ship (Phase F.0)**: a *local* commit on `main` (never pushed to `origin`) so `ship-branch.sh` can archive it. This is the one step touching your "disk-only" posture — flagged for your explicit OK.
5. **Junk on the tree**: inventoried and surfaced, **not deleted** — you decide cleanup separately.

## Handoff

Executor picks up at Phase 0. All labor is ticketed to council-workers (DEV=opus seat, QA=gpt seat, cross-provider); the CEO writes tickets, dispatches in background, reads verdicts, and judges — no inline self-work. The graft ends **disk-only and index-synced** for our repo; the **only** pushes are the two user-gated client-repo ships in Phase F. `origin`/team-repo is never pushed by this plan.
