> 🤖 **SESSION BOOTSTRAP — invoke with `/execute SUBPLAN_SHIP_NM2260_CORP_PRICING_DELIVERABLE.md`. All context below.**
>
> On invocation, self-bootstrap with NO additional prompting:
> 1. **Identity**: load `/identity OWNER` (ship op; OWNER short-circuits §2 per LR-043).
> 2. **Skills**: `/identity` (gate), `/regression-guard` (wrap the scrub edits), `/final-q` (exit).
> 3. **Model/thinking/perm**: read frontmatter — Opus / `hi` / `auto`. `xhi` clamps to `high` on CLI < 2.1.111.
> 4. **Dependency gate**: `Depends on: none`. Proceed.
> 5. **Context load**: read this file in full + `.claude/rules/pipeline.md` (LR-049 ship-via-git-archive) + `.claude/rules/deliverable.md` (LR-058) + `scripts/ship-branch.sh`.
> 5.5. **BrowserTool**: `none` — no live app interaction.
> 6. **Execute phases in order.**
> 7. **Handoff**: flip the Status field to DONE + add the Executed date, append an activity-log row (LR-028 + LR-037), `git mv` to `plans/done/`, `npm run plans:reindex`.
>
> **HALT + ASK USER** if: the deny-list gate fails on the dry-run (do NOT force) · the scrub touches anything outside the named files · the force-with-lease push would clobber an unexpected tip · scope drifts beyond NM-2260 detail+search.

---

# SUBPLAN_SHIP_NM2260_CORP_PRICING_DELIVERABLE — ship NM-2260 detail+search to the mock `corporate-pricing` branch

**Status**: SUPERSEDED
**Priority**: P2
**Created**: 2026-06-26
**Superseded by**: `plans/done/PLAN_SHIP_BRANCH_REFRESH_NM2260_61_AND_MAIN.md` (2026-06-30) — crown plan covers NM-2260 + NM-2261 + 6 locations re-ship + main rebuild; all work from this subplan is included there.
**Identity**: OWNER
**Parent**: (standalone — no master plan)
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

Ship **only** the NM-2260 Corporate Pricing coverage (the `detail` + `search` specs) to the **mock** repo `RutviK-JBS/encore_deliverables_test`, branch `corporate-pricing` (remote `encore-mock`). The plan markdown itself is unshippable (plans/ is outside client scope + trips the leak-gate marker-grep); what ships is the **test artifacts**. User decisions: **NM-2260 files only · scrub internal tokens to plain English · push only (no CI).**

### Verified facts (checked against HEAD 2026-06-26 — do not re-assume, but re-confirm at run)
- NM-2260 work is **already committed** to HEAD on `client_deliverable`: `corporate-pricing-detail.spec.ts` → DET-001..055; `corporate-pricing-search.spec.ts` → SRC-001..056. Working tree clean for corp-pricing.
- `ship-branch.sh --surface` is a **single glob** and **cannot** select two specs (verified: `A|B` is treated literally → all dropped). `--modules=CPR.DET,CPR.SRC` already trims the XLSX to exactly the two sheets (`xlsx-trim.mjs` + `module-codes.json`).
- The script archives `git archive HEAD clients/encore/`, trims **specs** by surface, ships **all of `src/` untrimmed**, runs `verify-no-forbidden.mjs` on a clean re-extract, pushes `--force-with-lease`. `encore-mock/corporate-pricing` exists at `7ab58a27` (a prior 6-spec ship) → our push is a **whole-branch lease-guarded replace** → branch becomes 2 specs.
- Leak verdict = **WOULD-LEAK, not WOULD-BLOCK**: a partial neutralize pass (`22b5b5a0`) left survivors that ship — `// BUG NM-1967` ([detail spec:373](../../clients/encore/tests/corporate-pricing/corporate-pricing-detail.spec.ts)) and `BUG-1`×5 ([pages.fixture.ts](../../clients/encore/src/fixtures/pages.fixture.ts)). NM-#### are the client's own Jira → keep.

## Bootstrap
**Identity**: OWNER. **Skills**: `/identity`, `/regression-guard` (wrap scrub), `/final-q`. **Context files**: this plan; `.claude/rules/pipeline.md` (LR-049); `.claude/rules/deliverable.md` (LR-058); `scripts/ship-branch.sh`; `scripts/xlsx-trim.mjs`; `scripts/lib/forbidden-patterns.mjs`.

## Phase 0 — Pre-flight (read-only)
1. Confirm clean tree + HEAD has DET-055 / SRC-056. Confirm `encore-mock` remote + current `corporate-pricing` tip.
2. Enumerate the exact shipping fileset (2 trimmed specs + entire `clients/encore/src/` + trimmed XLSX + tracked infra). Grep that set for non-whitelisted internal tokens (`// BUG`, `BUG-<MOD>-`, `BUG-1`, `DOCX `, `helper \d`, codenames, `specs_planning`, `.claude/`). NM-#### allowed.
3. Watch item: `forbidden-patterns.mjs` `DENY_GLOBS` includes `/^\.github\//` — the prior ship succeeded, so confirm the dry-run gate passes on `.github/` rather than assume.

## Phase 1 — Leak scrub (modifies shipping files → commit on `client_deliverable`)
- `clients/encore/tests/corporate-pricing/corporate-pricing-detail.spec.ts:373`: `// BUG NM-1967:` → `// KNOWN APP DEFECT (NM-1967):` (keep the NM ID; drop the `// BUG` framing).
- `clients/encore/src/fixtures/pages.fixture.ts`: replace the `BUG-1` label (≈lines 91/94/310/322/334) with a neutral descriptor (e.g. `bare-page-collision`).
- Any other non-whitelisted token from Phase 0 step 2 in the shipping set → neutralize to plain English (LR-058).
- **Out of scope** (don't scrub): `override.spec.ts` / `new-pricebook.spec.ts` (trimmed out, don't ship); non-corp `src/` (already shipped gate-clean prior).
- `/regression-guard` before/after. `npx tsc --noEmit` + `npm run check:tc-parity` clean. Commit on `client_deliverable` (do NOT push to `origin` unless the user asks).

## Phase 2 — NM-2260-only spec scoping (minimal generic tooling tweak)
- `scripts/ship-branch.sh` trim loop keeps one `$SURFACE` glob. Make `--surface` accept a **comma-separated list** (mirror the existing comma `--modules`): split on `,`, keep a spec if it matches ANY listed surface (`for s in $SURFACE_LIST; do case "$rel" in $s|*/$s) keep ;; esac; done`). ~5 lines, generic, internal-tooling only.
- Verify deterministically (read-only replication of archive+trim into an inspectable temp dir) that **exactly** `corporate-pricing-detail.spec.ts` + `corporate-pricing-search.spec.ts` survive and the other four CPR specs drop — **before** any push.

## Phase 3 — Dry-run ship (no push)
```bash
bash scripts/ship-branch.sh --branch=corporate-pricing \
  --modules=CPR.DET,CPR.SRC \
  --surface='corporate-pricing/corporate-pricing-detail.spec.ts,corporate-pricing/corporate-pricing-search.spec.ts'
```
Expect: `deny-list clean`; `[xlsx-trim] kept: corporate_pricing_detail, corporate_pricing_search, Overview`; exit 0. Gate fails (e.g. `.github/`) → **HALT + RCA, do not force.**

## Phase 4 — Push (force-with-lease)
Re-run Phase 3 with `--push`. Lease-guarded replace of `encore-mock/corporate-pricing` against tip `7ab58a27`.

## Phase 5 — Verify + report (no CI)
`git fetch encore-mock corporate-pricing` (read-only) → new tip; `git ls-tree -r encore-mock/corporate-pricing --name-only | grep spec` shows only the 2 specs; report tip SHA + shipped fileset. **Do not** touch the mock CI workflow or push to `origin`.

## Per-Identity Satisfaction
| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| OWNER | scrub commit + ship-branch tweak + push | `clients/encore/tests/corporate-pricing/corporate-pricing-detail.spec.ts`<br>`clients/encore/src/fixtures/pages.fixture.ts`<br>`scripts/ship-branch.sh` | `bash scripts/ship-branch.sh --branch=corporate-pricing --modules=CPR.DET,CPR.SRC --surface='…detail…,…search…'` dry-run exit 0 |
| HUNTER | (none) | `(none)` | (none) |
| GIVER | (none — no new TCs) | `(none)` | (none) |
| BUILDER | (none — scrub only, no test logic change) | `(none)` | (none) |
| HEALER | (none) | `(none)` | (none) |
| WATCHDOG | (none) | `(none)` | (none) |
| GARDENER | (none) | `(none)` | (none) |

## Acceptance criteria
- [ ] Phase 2 replication proves **exactly 2 specs** survive (named check).
- [ ] Phase 3 dry-run prints `deny-list clean` + 2 kept XLSX sheets → exit 0.
- [ ] `git grep -nE '// BUG|BUG-1' <shipping files>` → 0 non-whitelisted hits.
- [ ] Post-push: `git ls-tree -r encore-mock/corporate-pricing` lists 2 specs + full `src/` + 2-sheet XLSX; tip SHA changed from `7ab58a27`.
- [ ] Activity-log row per LR-028 (LR-037 timestamp). `/final-q` verdict.

## Handoff
Chat-only per `feedback_handoff_in_chat_only.md`; outcomes only (LR-039). Report the new branch tip SHA + the 2-spec fileset.
