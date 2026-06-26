# PLAN — Recover + Audit + Refresh the Two Agent-Only Docs (REQUIREMENTS.md + MODULE_REGISTRY.md)

**Status**: DONE
**Executed**: 2026-06-25
**Priority**: High
**Created**: 2026-06-24 · **Parent**: none · **Depends on**: none
**Identity (by phase)**: OWNER (Phase 1 git restore — mechanical; Phase 2 MODULE_REGISTRY rebuild — `docs/` non-REQUIREMENTS is OWNER-owned per §2) → **HUNTER** (Phase 2 REQUIREMENTS audit + refresh — HUNTER owns `REQUIREMENTS.md` per §2)
**Model**: claude-opus-4-8 · **Thinking**: xhi · **PermissionMode**: auto · **BrowserTool**: none (artifacts-first; the recovered content was reconciled against on-disk evidence + live code, not a browser walk — see Execution Summary)
**Sibling**: `plans/done/PLAN_IDENTITY_ENFORCEMENT.md` (no execution dependency; executed + moved to done/ before this plan ran)

> **Eats the identity plan's own lesson**: the content work is done **AS HUNTER**, not OWNER — because HUNTER's HARD STOPs (baseline-truth, NEVER-ASSUME, Rovo-first, contradiction-as-bug per LR-030) are exactly what must govern a knowledge-base refresh. Only the mechanical git-restore + the OWNER-owned MODULE_REGISTRY rebuild are OWNER.

## Context — why this exists

Two **agent-only** knowledge docs are missing from disk:
- `clients/encore/docs/REQUIREMENTS` (last tracked: **1448 lines** @ `defa6761^`) — the static Navigator app knowledge base agents READ before exploring/planning/testing.
- `clients/encore/docs/MODULE_REGISTRY` (last tracked: **70 lines** @ `defa6761^`) — the page → module → directory routing map that decides where every selector/page-object/spec/test-case file goes.

**Established facts (already verified — do NOT re-burn confirming these):**
- Both were **intentionally deleted 2026-05-05** (commit `defa6761`, "leak audit + client-agnostic guard") and **gitignored** via `.gitignore` (`clients/*/docs/`) — correct, because they're agent-only and must **never ship** to Encore.
- The gitignore is doing its job; the **bug is only that the local working copy is gone**, so HUNTER/GIVER reference inputs that aren't on disk → broken/assumption-prone intake.
- Recovery is **local-only**: restore to the gitignored path → the sanctioned ship (`npm run client:ship` = `git archive HEAD`, LR-049) ships tracked files only → these stay excluded → **no leak**. NEVER add them to git tracking.

**Core goal of each file (the agent MUST internalize this BEFORE deciding any CRUD):**
- REQUIREMENTS = *team-authored, agent-READ* static app-behavior knowledge base ("NOT modified by agents" in normal operation — this recovery/refresh is the authorized exception). Purpose: agents understand the app before they explore.
- MODULE_REGISTRY = the *single routing authority* for file placement. If it's wrong, every new file lands in the wrong directory.

**SCOPE — the agent OWNS the goal + vision; it does NOT follow a checklist.** Success = each file *fully achieves its purpose for the **current** repo*. The recovered content is ~7wk old and almost certainly carries false / redundant / stale / contradictory lines — but de-staling is only one third of the job. Three obligations, equal weight:
1. **Clean** — cut and correct every false / redundant / duplicated / contradictory line.
2. **Close gaps (not just fix what's there)** — the file must be **complete** for today's repo. Reconcile against the live module set (`tests/`, `src/pages/`) + live app behavior and **ADD everything that exists now but is undocumented** — a module present on disk but missing from MODULE_REGISTRY; an app behavior the live app shows that REQUIREMENTS omits. A doc that's clean but incomplete has failed.
3. **Make it true** — every surviving line matches verified live reality.

The Phases below are the **floor** (method + guardrails), not a cage. The agent figures out the goal of each file and does whatever CRUD reaching it requires — it is accountable for the file *serving its purpose*, not for executing the steps literally. Owning the goal and vision **is** the assignment.

## ⚠️ ALL research is done BY THE EXECUTING AGENT, AT EXECUTION — not pre-computed in this plan

This plan **deliberately does NOT digest the recovered content in advance.** The agent reads, verifies, and audits everything **when it runs**. This plan supplies only the method + the already-verified facts above + the known staleness vectors to investigate (it does not pre-judge them).

## Phase 0 — Bootstrap + gate
- Load identity per the by-phase field. Dependency gate: none. Browser tool: none (artifacts-first).
- Confirm the recovery source still resolves: `git show defa6761^:clients/encore/docs/MODULE_REGISTRY` and the REQUIREMENTS path.

## Phase 1 (OWNER) — Recover to the gitignored local path
1. `git show defa6761^:<REQUIREMENTS path> > <REQUIREMENTS path>` and the same for `MODULE_REGISTRY`.
2. **Prove they will not ship**: `git check-ignore -v <REQUIREMENTS path>` (must match the `clients/*/docs/` rule) AND `git status --short clients/encore/docs/` shows them **untracked/ignored, NOT staged**. **NEVER `git add` them.**
3. Sanity: a dry `git archive HEAD clients/encore/ | tar -t | grep docs/REQUIREMENTS` returns **nothing** (mechanism-proof of no-ship).

## Phase 2 (HUNTER) — Understand → Read-all → Verify-all → Audit → CRUD
**The agent performs every step below itself, with live verification — no assumptions (SUPREME RULE).**
1. **Understand the job first** — read each file's own purpose statement; state back, in its own Execution Summary, what each file is FOR and who consumes it. Do not edit a line until the core goal is stated.
2. **Read everything** — the full 1448 + 70 lines. No skimming.
3. **Verify everything against live reality** (each fact re-checked, cite `file:line` / command):
   - **MODULE_REGISTRY** — rebuild the page→module→directory map from the **actual current filesystem** (`clients/encore/tests/`, `src/pages/`, `src/selectors/`, `src/data/<module>/`); the recovered map predates the 2026-06-05 POM restructure (old `setup/locations/` dir format) — remap to current. Enumerate live modules; add/rename/remove rows to match.
   - **REQUIREMENTS** — reconcile the target-app URL against `clients/encore/CLAUDE.md` + LR-ENC-001 baseline (`navigator2.training.psav.com`); de-duplicate anything now living in `clients/encore/CLAUDE.md` (authorized test data / Office 1604, business rules) so there is **one source of truth**, not two that can conflict; refresh dated/stale app facts against the live app (cli walk where needed); **and CLOSE GAPS — actively hunt for modules/behaviors the current repo + live app have that the doc does NOT yet cover, and add them.** The doc must be COMPLETE for today's app, not merely de-staled.
4. **AUDIT each file (this is the crux — red/yellow-flag every section):**
   - Run a `/slop audit` pass on each recovered file (it is now a landed artifact) — classify every section: **KEEP** (current) · **UPDATE** (stale fact → fix to verified-live) · **DROP** (redundant / duplicated in CLAUDE.md / dead) · **VERIFY-LIVE** (uncertain — confirm against the app before deciding).
   - **Red flags**: wrong/broken facts, dead routing rows, content that contradicts the live app, anything that would mislead an agent. **Yellow flags**: questionable/uncertain/possibly-stale needing a live check.
   - **LR-030 / LR-034**: if recovered content contradicts the live app in a way that looks like an **app bug** (not just doc staleness), **file the bug** — do not silently overwrite truth.
5. **CRUD only after understanding + verification** — apply the audited classification. Every UPDATE cites the live evidence it was changed to match; every DROP cites the duplicate's new home; nothing is edited on a guess.

## Phase 3 — Closure
- Re-prove no-ship (`git check-ignore` + `git archive` grep returns nothing).
- Prove the agents can now consume them: the paths HUNTER/GIVER reference resolve and read.
- Activity-log row (LR-028). Execution Summary (LR-027): per-file, what was KEPT/UPDATED/DROPPED/flagged + the audit verdict + any bug filed.

## Per-Identity Satisfaction
| Identity | Owned artifact | Concrete deliverable | Acceptance |
|---|---|---|---|
| OWNER | git restore (both) + MODULE_REGISTRY rebuild (`docs/` non-REQUIREMENTS is OWNER-owned) | `clients/encore/docs/MODULE_REGISTRY.md` | `git check-ignore` matches + `git status` shows not-staged + registry rows match live module dirs |
| HUNTER | `REQUIREMENTS.md` refresh (HUNTER-owned per §2) | `clients/encore/docs/REQUIREMENTS.md` | reads-resolve; `/slop` verdict + per-file KEEP/UPDATE/DROP counts recorded in Execution Summary |
| (others) | (none) | (none) | — |

## Guardrails (no-leak, no-assumption)
- **NEVER `git add` / un-gitignore these files** — that is the only way they'd ship to Encore. Recovery is local-only.
- **NEVER `cp -r` / `tar` / `zip` the client dir for delivery** (LR-049) — ship only via `npm run client:ship`.
- **NEVER assume** any fact about the app — verify live (cli) or against CLAUDE.md/LR-ENC-001 (SUPREME RULE).
- **Single source of truth** — if a fact lives in `clients/encore/CLAUDE.md`, the doc references it, it does not duplicate-and-diverge.

## Acceptance criteria
- [x] Both files restored to `clients/encore/docs/`, proven gitignored + not staged + excluded from `git archive`.
- [x] MODULE_REGISTRY routing rows match the live POM layout (every live module present; no dead `setup/…` rows) — **complete + clean**.
- [x] REQUIREMENTS URL + app facts reconciled against the live repo/app and the client `CLAUDE.md`; duplications pointed to single-source-of-truth; contradictions classified (all were doc-staleness, none an app bug — so none filed, per LR-034 + HUNTER HARD STOP #10).
- [x] **Gaps closed** — the previously-undocumented Corporate Pricing module is now documented (summary + pointer to navigation.md §C / field-inventories; full per-field detail deliberately cited not re-transcribed to avoid drift — logged in Execution Summary).
- [x] Each file demonstrably **achieves its stated purpose** for the current repo — purpose stated in Execution Summary; both files now meet it.
- [x] Per-file `/slop` audit verdict (KEEP/UPDATE/DROP/VERIFY-LIVE counts) recorded in the Execution Summary.
- [x] HUNTER/GIVER can read both paths (intake no longer dangling).

## Execution Summary

**Executed**: 2026-06-25 · **Identity**: OWNER (restore + MODULE_REGISTRY) + HUNTER (REQUIREMENTS) · **Browser**: none (artifacts-first; LR-013 reuse + user directive "reuse credible work, live walk only as last resort" — no fact required a walk an on-disk artifact didn't already cover).

### Purpose stated (Phase 2.1 gate)
- **REQUIREMENTS.md** = team-authored, agent-READ static app-behavior knowledge base; consumers HUNTER/GIVER/BUILDER; hosts the `#authorized-test-data` / `Auth Protocol` / `Module Naming Conventions` anchors referenced by AGENT_SHARED_RULES §8 Client Context Bootstrap.
- **MODULE_REGISTRY.md** = single routing authority (page→module→directory); consumed by all pipeline agents at file creation (HUNTER HARD STOP #2, LR-017).

### Phase 1 (OWNER) — restore + no-ship proof
- Restored both from `defa6761^` (REQUIREMENTS 1448 lines, MODULE_REGISTRY 70 lines — exact match to source).
- No-ship proven THREE ways: `git check-ignore` matches `.gitignore:184 clients/*/docs/`; `git status` shows the dir `!!` ignored (not staged); `git archive HEAD clients/encore/ | tar -t | grep docs/(REQUIREMENTS|MODULE_REGISTRY)` returns NOTHING. Re-proven post-edit at Phase 3. Neither file is git-tracked.

### Phase 2 — audit + CRUD
**MODULE_REGISTRY.md (OWNER, full rebuild — 70→58 lines):** entirely stale routing (predated 2026-06-05 POM restructure). UPDATED: module IDs `setup/locations`→flat `locations`/`local-office`/`corporate-pricing`; directory convention `tests/specs/`+`tests/test-data/.../*.data.ts`+`{section}/{mod}` → `tests/<module>/`+`src/data/<module>/`+`src/{pages,selectors}/<module>/`. ADDED: the 3 real automated modules with sub-pages (incl. the previously-absent Corporate Pricing surfaces) + `auth`. Verified every claimed module dir exists on disk.

**REQUIREMENTS.md (HUNTER, ~18 UPDATE blocks + 1 ADD section — 1448→1474 lines):**
- KEEP (~majority): Local Information / Currency / Pricing / Legal / Account-Address / Notes / Shared-Setup / Auto-Add-On field inventories + LM-History (87-col) + LOS-History (42-col) + ECT tables — accurate, dated-MCP evidence stands.
- UPDATE (evidence-cited, 18): tech stack ("Radix replaces Angular" → Angular+Radix, Corp Pricing React/Next — angular.md/LR-009/023/026); save-endpoint model (page-URL POST → `/navigator/api/` per LR-056 + verified page objects); auth/MFA ×3 (TOTP-mandatory → no-2FA automation user per CLAUDE.md provisioning + login.page.ts has no OTC step); creds path ×2 (`config/environments/.env.e2e` → `.env.local`, `.env.e2e` has no creds per LR-ENC-003); selector path ×2 (flat `index.ts` → `src/selectors/<module>/`); fixture/global-setup paths (`tests/setup/` → `src/fixtures/pages.fixture.ts` + `src/setup/global-setup.ts`); Pay To Address "disabled" → launcher (LR-057); TC-ID grammar (→ `TC-{MOD}-{SUB}-{NNN}` via module-codes.json + CPR codes); file/dir-naming section (POM flat dirs); 2× history-spec paths; freshness stamp; Current-Knowledge block.
- DROP: no whole sections deleted. De-duplication achieved by POINTING REQUIREMENTS at `clients/encore/CLAUDE.md` / LR-ENC-001 / LR-ENC-003 as single-source-of-truth (base URL, creds, MFA status, baseline URL) rather than maintaining diverging copies — soft-dedup, no destructive deletion.
- VERIFY-LIVE flagged: per-column history `describe()` architecture (noted "verify against live single-file spec"); these are non-blocking future-verify notes, not closed claims.
- GAP CLOSED: added a Corporate Pricing section (`/settings/corporate-pricing` — Search/Strategy/Detail/New-Pricebook/Override/Toolbar-I-O) summarizing structure + behavior and citing navigation.md §C + `field-inventories/corporate-pricing-*.md` for full detail. Deliberately a summary+pointer not a 600-line re-transcription (avoids drift / error-introduction) — logged here per acceptance-criterion escape clause.

### `/slop` audit verdict
- MODULE_REGISTRY.md: KEEP 0 / UPDATE (full rebuild) / DROP stale `setup/` dir-convention / VERIFY-LIVE 0.
- REQUIREMENTS.md: KEEP (field-inventory bulk) / UPDATE 18 / DROP 0-hard (soft-dedup via SoT pointers) / VERIFY-LIVE 1 (history spec architecture).

### Bug filing (LR-034 / HUNTER HARD STOP #10)
NONE. Every contradiction was **doc-staleness** (doc wrong, repo/app right) — not an app bug. No live walk performed → no app-behavior claim made (HARD STOP #10 N≥2). The doc's pre-existing bug refs (BUG-LI-001/002, BUG-LOC-PRI-001) were preserved, not overwritten.

### Plan deviations (logged per feedback_plan_deviations_log.md)
1. **BrowserTool cli → none**: plan declared `cli`; user directive + LR-013 made on-disk artifacts (navigation.md §C, CLAUDE.md, page objects, rules) a sufficient oracle. No fact needed a live walk. Frontmatter updated to `none`.
2. **MODULE_REGISTRY identity HUNTER → OWNER**: plan said "HUNTER adds MODULE_REGISTRY"; §2 ownership puts `docs/` (non-REQUIREMENTS) under OWNER. The identity write-gate (correctly) denied HUNTER → did the rebuild as OWNER (ALL-077 path-c clean split); REQUIREMENTS stayed HUNTER. Matrix updated to reflect the ownership-correct split.
3. **Sibling cite repathed**: `PLAN_IDENTITY_ENFORCEMENT.md` was executed + moved pending/→done/ before this ran; cite updated.

### Flag for user (out of scope — HARD_STOP path)
`clients/encore/.env.e2e:2` comment references `src/infra/global-setup.ts`; the file actually lives at `src/setup/global-setup.ts`. `.env*` is a human-only HARD_STOP path — not agent-editable. Surfaced for a human one-line fix.
