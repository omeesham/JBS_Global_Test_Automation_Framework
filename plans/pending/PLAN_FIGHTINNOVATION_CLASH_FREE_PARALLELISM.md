---
**Status**: PENDING (read-only fight → design doc. ZERO CUD. Nothing builds/implements until Rutvik's separate go.)
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: A cross-family fight (opus vs gpt) DESIGNS a clash-free parallel-session architecture. Claude referees + synthesizes; it does not author the design. Read-only — no code touched.
**PermissionMode**: read-only (all workers dispatched read-mode: write + shell denied at the wrapper → structurally cannot CUD)
**BrowserTool**: none
---

# PLAN_FIGHTINNOVATION_CLASH_FREE_PARALLELISM (simple fight plan)

## What this is (one line)
Run a read-only opus-vs-gpt **fight** to design a system where parallel Claude sessions on one disk never clash or lose code — output is a **design doc**, nothing gets built here.

## Scope guard (Rutvik, 2026-07-13)
- **Task 3 (mega-audit) is NOT in this plan.** Dropped for now.
- **ZERO CUD.** Every worker runs read-only (write+shell denied). They read + reason + return a proposal. Claude writes only the design doc + this plan (never code).
- **Nothing implements** until a SEPARATE explicit Rutvik go (+ grants for protected files). This plan ends at "design chosen", not "built".

## The problem the fight must solve
Multiple Claude sessions run in parallel on ONE working tree with no isolation and no merge layer → last-write-wins → a session that reads before another's edit lands, then writes after, silently clobbers uncommitted work. Git only protects committed work.

## The rubric (the design MUST satisfy ALL — this is how the fight is scored)
- **R1** Zero clash, zero lost code, ever.
- **R2** Rutvik never thinks about branches.
- **R3** No git bloat / no manual branch-trimming (auto-pruned).
- **R4** Transparent — feels like today; no new ceremony.
- **R5** Sessions are mutually blind — isolation is automatic.
- **R6** Every session's code is guaranteed to survive, both ways.
- **R7** Disk auto-converges to the best merged version — no human merge step.
- **R8** Fits Windows 11 + git-bash + heavy node_modules + the existing hook/worker stack; must not break `client:ship`.
- **R9** Safe-by-construction — a bad/uncertain auto-merge is caught (tests) and falls back, never silently corrupts.

## Seed hypotheses (given to the fighters as priors to test/reject — NOT the answer)
- **H1** worktree-per-session + auto-merge + auto-prune (real isolation; Windows node_modules cost is the risk).
- **H2** Rutvik's branch-per-delegation (likely collapses into H1 or H3 — a branch alone doesn't isolate files on disk).
- **H3** merge-queue / per-scope cross-session lock (dead simple, zero loss, but serializes hot files).
- **H4** LLM 3-way semantic auto-merge on true conflicts (delivers R7, but needs a post-merge test-gate for R9).
- **H5** transactional / copy-on-write overlay per session (exotic; limited Windows CoW support).
- The crux the fight must resolve: **Windows worktree cost vs serialization.**

## How the fight runs (with the two guards Rutvik demanded)

### Guard A — don't overload one agent (large scope → split)
The design space is split into **facets**, each covered explicitly so no single agent drowns:
1. Isolation mechanism (how work is separated)
2. Merge/convergence (how it comes back together = best version)
3. Auto-prune / zero-git-bloat
4. Windows + node_modules + hook-stack fit
5. Safety gate (bad-merge catch + fallback)

Each fighter may use **≤3 sub-agents** (Copilot allows depth-2 nesting) to parallelize facet analysis, OR Claude issues **multiple scoped dispatches** (one per facet) if a single dispatch is too heavy. No one agent carries all 5 facets alone.

### Guard B — don't fight over 80% and drop the 20%
The fight is deliberately structured so the whole rubric is covered, not just the exciting disagreement:
- Every proposal MUST address **all 5 facets + all R1–R9** — a proposal silent on a facet is incomplete and bounced BEFORE the fight round.
- After the fight, a dedicated **completeness pass** asks: "what did BOTH fighters gloss over? which facet/requirement got no real attention because everyone argued about isolation?" Overlooked items become explicit open questions in the design doc — never silently dropped.

### The rounds
0. **Ring (Claude, referee):** the problem + rubric + facets + seeds above (this document).
1. **Opening (parallel, blind, read-only):** opus-4.6 proposes design A; gpt-5.5 proposes design B. Each covers all 5 facets + R1–R9 + own weaknesses. (Fighters may self-research + use ≤3 sub-agents.)
2. **Fight (read-only):** each gets the other's proposal + refutes it against the rubric + defends/upgrades its own.
3. **Completeness pass:** the Guard-B check — surface what both skipped.
4. **Judgment (Claude, referee):** score both vs R1–R9, synthesize the winning design (may graft best of both + the completeness findings), document the loser's surviving points. Claude does NOT author its own design — if Claude has an idea, it goes back as a question to the fighters, not into the verdict.
5. **Output:** `design doc` at `.claude/state/fightinnovation/clash-isolation/verdict.md` — read-only artifact for Rutvik to review + vision-align.

## Fighters
- opus-4.6 (T3) vs gpt-5.5 (T4) — opposite families, the whole point. Change only if Rutvik wants different.

## Deferred (NOT in this plan — each needs a separate Rutvik go)
- Formalizing this into a reusable `/fightinnovation` skill.
- Implementing the chosen design (touches protected control files → go + grants).
- Real 2-parallel-session proof (LR-059).
- Task 3 mega-audit (dropped for now).

## Acceptance (of THIS plan)
- [x] A design doc exists naming ONE chosen architecture, scored against all R1–R9, with loser's surviving points recorded. → `.claude/state/fightinnovation/clash-isolation/verdict.md`
- [x] All 5 facets covered; the completeness pass ran and its overlooked-items list is in the doc. → verdict.md §Guard B (OQ1–OQ5).
- [x] Zero CUD — no code changed by the fight (both refutation rounds ran via `--task` = structural read-only; CUD-check `byzg4hfcm` found no code files touched). Only verdict.md + this plan written (state/plans, not code).
- [x] Claude authored zero fighter proposals (referee-only) — proposals at `.claude/state/ua-worker/{fight-clash-opus,fight-clash-gpt,refute-opus,refute-gpt}/result.md`; Claude wrote only the ring/refute briefs + verdict synthesis.

## FIGHT OUTCOME (2026-07-13) — design chosen
Both fighters **converged independently** and agreed all three tie-breaks after refutation. Full synthesis + scorecard: **[verdict.md](../../.claude/state/fightinnovation/clash-isolation/verdict.md)**.

**Chosen architecture — "isolated worktree + inline gated convergence":**
1. **Isolation** — worktree-per-session + NTFS junctions to existing `node_modules` (proven live on this machine).
2. **Crash safety** — write-quiescent autosave to the session branch (not continuous, not hidden refs — avoids partial-write corruption).
3. **Convergence** — inline at session end (NO daemon); merge built + gated in an ephemeral verify-worktree off `main`; `main` fast-forwarded only after gates pass → `main` never holds unverified state.
4. **Safety gate (R9)** — conflict-scan → `git diff --check` → `tsc --noEmit` → targeted tests → `client:ship` dry-run; fail ⇒ PARK the branch + surface to Rutvik.
5. **Auto-prune** — remove worktree/branch after merge; orphan-sweep salvages crashed sessions.
6. **True conflicts** — LLM 3-way merge; low confidence ⇒ park-and-ask (never silent).

**Open questions to close AT implementation (Guard B — the 20% both glossed over), OQ1 is code-loss-critical:**
- **OQ1** shared mutable non-code state (`.claude/state/`, `reports/`, `.auth/`) still clashes across worktrees — junctions only solve `node_modules`. **Resolve first.**
- **OQ2** `client:ship` must run against converged `main`, blocked while merge-lock held.
- **OQ3** hook-stack + `core.hooksPath` resolution inside a worktree — verify live (LR-059).
- **OQ4** `git worktree remove --force` must not recurse through the junction and delete real `node_modules`.
- **OQ5** the `alias claude=` wrapper only isolates if EVERY launch path (terminal/IDE/shortcut) routes through it.

**Next (each its own explicit Rutvik go — nothing fires now):** implement the chosen design (protected control files → go + grants + 2-session LR-059 proof, close OQ1 first) · formalize `/fightinnovation` skill · Task 3 mega-audit.
