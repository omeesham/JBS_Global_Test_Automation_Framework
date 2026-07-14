# FIGHT — Opening Round — Clash-Free Parallel-Session Architecture

## YOUR ROLE
You are a FIGHTER in a cross-family design fight. An opposing frontier model (different vendor) is independently proposing a rival design to the SAME problem; later you will see its proposal and try to refute it while defending yours. Right now, in this OPENING round, you propose YOUR single best architecture — blind, before seeing the rival. Referee (Claude) will score both against the rubric and synthesize a winner. This is a DESIGN task.

## HARD MODE CONSTRAINT — READ-ONLY, ZERO CUD
Do NOT create, update, or delete ANY file. Do NOT run mutating shell. You may READ any repo file and reason. Your deliverable is your PROPOSAL TEXT returned as your result — nothing written to disk. (The dispatch is read-mode; write/shell are denied — respect it, do not try to escape it.)

## THE PROBLEM
Rutvik runs MULTIPLE Claude-Code sessions in parallel on ONE git working tree, each executing a plan and dispatching Copilot workers, with NO session aware another is live. There is no isolation and no merge layer → plain last-write-wins on disk: a session that reads a file before another session's edit lands, then writes after, silently clobbers the other's UNCOMMITTED work. Git only protects committed work. This has already lost real code multiple times. Design the permanent fix.

## THE RUBRIC — your design MUST satisfy ALL of these; address EACH explicitly
- R1 Zero clash, zero lost code, ever.
- R2 Rutvik never thinks about branches (no naming, picking, or reasoning about them).
- R3 No git bloat / no manual branch-trimming — anything created is auto-pruned.
- R4 Transparent — feels like today; work just happens on disk; no new ceremony Rutvik must perform.
- R5 Sessions are mutually blind — isolation is automatic; a session need not look at or coordinate with others.
- R6 Every session's code is guaranteed to survive — both/all sessions, not just the last writer.
- R7 Disk auto-converges to the BEST merged version — no human merge step.
- R8 Fits the real environment: Windows 11 + git-bash, HEAVY node_modules, Playwright, the existing hook/delegation/worker stack; must NOT break `client:ship` (which does `git archive HEAD clients/<id>/`).
- R9 Safe-by-construction — a bad or uncertain auto-merge is CAUGHT (e.g. tests/typecheck) and falls back; it must never silently ship a corrupt "best version".

## COVER ALL 5 FACETS (a proposal silent on any facet is INCOMPLETE and will be bounced before the fight)
1. **Isolation** — how concurrent work is kept from colliding on disk.
2. **Merge/convergence** — how isolated work recombines into the single best version.
3. **Auto-prune / zero-git-bloat** — how transient artifacts (branches/worktrees/overlays) are cleaned with zero manual action.
4. **Environment fit** — Windows + node_modules cost + hook stack + not breaking client:ship.
5. **Safety gate** — how a bad/uncertain merge is detected and rolled back (R9).

## SEED HYPOTHESES (priors to TEST, ADOPT, REJECT, or BEAT — not the answer; you may propose something better)
- H1 worktree-per-session + auto-merge + auto-prune. (Real isolation; but per-worktree node_modules on Windows is the cost risk — address it: junctions? shared store? pnpm? copy?)
- H2 branch-per-delegation, shared working dir. (Warning: a branch WITHOUT its own working directory does not isolate files on disk — say whether this collapses into H1/H3.)
- H3 merge-queue / per-scope cross-session lock. (Dead simple, zero loss, but serializes hot files — quantify the parallelism cost.)
- H4 LLM 3-way semantic auto-merge on true conflicts. (Delivers R7's "best version" but a wrong merge corrupts → must pair with the R9 gate.)
- H5 transactional / copy-on-write overlay per session. (Windows CoW support is limited — is it viable?)
- THE CRUX you must resolve head-on: **Windows worktree cost vs serialization.**

## READ THESE REPO FILES for environment reality before proposing
- `.claude/skills/ultra-agents/copilot-worker.sh` (how workers are dispatched, `-C $REPO`, slot-locks)
- `.claude/skills/ultra-agents/worker-ext.md` (the delegation doctrine + concurrency model)
- `package.json` + `clients/encore/package.json` (node_modules weight; per-client packages)
- `CLAUDE.md` (repo structure section — `client:ship` = git archive of `clients/<id>/`)
- the `.claude/hooks/` directory listing (hooks are per-repo, not per-worktree — a constraint)

## PARALLELIZE IF THE SCOPE IS HEAVY
You MAY spawn ≤3 sub-agents (depth 2; they spawn nothing) to analyze facets in parallel, OR do it directly if you can hold it. Do not drown a single thread — but do NOT let facet 3/4/5 get a shallow treatment because you spent all effort on isolation-vs-merge. Every facet + every R gets real attention.

## OUTPUT FORMAT (your result text)
1. **ARCHITECTURE** — the design in concrete terms (what happens on session start, during work, at session end; what git commands/mechanisms run; who triggers them).
2. **PER-FACET** — one paragraph each for facets 1–5.
3. **PER-REQUIREMENT** — one line each: how the design satisfies R1…R9 (or honestly flag any it only partially meets).
4. **KNOWN WEAKNESSES** — where your own design is weakest / what you'd attack if you were the opponent.
5. **CRUX CALL** — your explicit answer to Windows-worktree-cost vs serialization, with reasoning.
