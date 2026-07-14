# VERDICT — Clash-Free Parallel Sessions (Claude referee synthesis)

**Fight**: opus-4.6 vs gpt-5.5, read-only (zero CUD, verified — no code files touched by either fighter).
**Rounds**: opening (blind, parallel) → refutation → this synthesis.
**Referee**: Claude authored ZERO fighter proposals. This doc grafts the two convergent proposals; it does not invent a third design.

---

## Outcome in one line
Both fighters **independently converged** on the same architecture and, after refutation, **agreed on the same three tie-breaks**. There is no split decision to arbitrate — the synthesis is their agreement, written down.

---

## The chosen architecture — "isolated worktree + inline gated convergence"

### 1. Isolation (R1/R5/R6) — worktree-per-session + NTFS junctions
- A wrapper (`claude-iso()`, aliased as `claude`) creates a git **worktree** per session under `.claude/worktrees/<session-id>` branched off `main`.
- Heavy untracked deps (`node_modules/`) are **NTFS junctions** (`mklink /J`) to the repo's existing copy — near-zero disk, no reinstall.
- Each session works entirely inside its own worktree → sessions are **mutually blind by construction**; there is no shared live file for last-write-wins to corrupt.
- **Proven on THIS machine today**: the existing `.claude/worktrees/amazing-swanson-775132` worktree runs with working junctions (git 2.43.0, 23,654 + 3,382 node_modules files). Zero new infrastructure — this is why both fighters grounded here.

### 2. Crash safety (R6) — write-quiescent autosave
- A debounced background loop commits to the **session branch** only when the worktree is dirty AND no file write happened in the last ~10–30 s (quiescence via `find -newer`).
- **Rejected**: continuous autosave to a hidden-ref namespace (gpt's opening). Both fighters agreed it (a) can commit a **partial/corrupt file** mid-write, and (b) adds a ref namespace + janitor to manage.
- Worst case on crash: lose ~30 s of work, never hours, never a half-written file.

### 3. Convergence (R7) — inline, session-end, off-`main` verify
- Fires **inline at session end** (NO standing daemon — unanimous). An atomic `mkdir` merge-lock serializes concurrent session-ends.
- The merge is built and gated in an **ephemeral verify-worktree off `main`**; `main` is fast-forwarded to the verified commit **only after all gates pass**.
- **`main` NEVER holds unverified state, even transiently** — this is gpt's safety *principle* delivered through opus's inline *mechanism*. It kills the "merge → typecheck → reset --hard" crash window (a SIGKILL/BSOD mid-typecheck would otherwise leave `main` broken and `client:ship` could archive garbage).

### 4. Safety gate (R9) — layered, park-on-fail
- Order: conflict-marker scan → `git diff --check` → `npx tsc --noEmit` → (optional) targeted tests → `client:ship` dry-run compatibility.
- A failing gate **PARKS the session branch** (kept, surfaced to Rutvik) — never merged, never discarded.

### 5. Auto-prune (R3) — no git bloat, no manual trimming
- After a successful merge: `git worktree remove` + `git branch -d` for that session.
- **Orphan sweep** on next session start: dead worktrees (crashed sessions) are salvaged (last autosave commit merged through the same gate) then removed.
- Junctions are pointers, not copies → no node_modules bloat accumulates.

### 6. True-conflict fallback (R7 partial → R9) — LLM merge, else park-and-ask
- When the off-`main` merge hits a genuine same-hunk conflict, an LLM 3-way semantic merge is attempted; **low confidence ⇒ PARK + ask Rutvik**. Auto-convergence handles the common case; it never silently resolves a real semantic conflict.

---

## The three tie-breaks (both fighters agreed)

| # | Disagreement | Resolution (agreed by BOTH) |
|---|---|---|
| 1 | Merge safety model | **gpt's principle + opus's mechanism**: `main` never holds unverified code, achieved by an **inline ephemeral verify-worktree** (~2 s), not a daemon. |
| 2 | Crash safety | **Write-quiescent autosave** on the session branch — not continuous, not a hidden-ref namespace (avoids partial-write corruption). |
| 3 | Daemon vs inline | **Inline, unanimous** — at 1–5 sessions a daemon is a silent-failure liability (dies over a weekend → refs pile up → `client:ship` ships stale). |

**Loser's surviving points (recorded, not discarded)**: gpt's off-disk-verification *principle* won and is in the design. gpt's daemon, hidden-ref namespace, and lockfile-hash immutable dep-cache were rejected as over-engineering for this scale. opus's original merge-then-reset was conceded (crash window) and upgraded to the verify-worktree.

---

## Guard B — completeness pass (what BOTH fighters glossed over)
The fight focused on merge/crash/daemon. These facet-level items got **no real attention** and are the "20% both forgot" — they are OPEN QUESTIONS for the implementation go, not silently dropped:

- **OQ1 — shared mutable non-code state.** Junctions solve `node_modules`, but `.claude/state/`, `reports/`, `.auth/` are shared/gitignored mutable dirs. Two worktrees writing `.claude/state/*.json` (todo-state, chain state, gate-fires.log) still clash. **Decision needed**: per-session vs shared-append vs junction-read-only per dir. (Highest-risk gap — the isolation is incomplete without it.)
- **OQ2 — `client:ship` ordering.** `client:ship` runs `git archive HEAD clients/<id>/`. It MUST run against a converged `main`, never a session worktree HEAD, and must be blocked while a merge-lock is held. Wire the ship gate to the convergence lock.
- **OQ3 — hook-stack path resolution inside a worktree.** PreToolUse/PostToolUse hooks + `core.hooksPath` must resolve correctly when cwd is a worktree (git rewrites `.git` to a gitdir pointer). Needs a live verification, not an assumption (LR-059).
- **OQ4 — Windows junction teardown.** `git worktree remove --force` must NOT recurse through the `node_modules` junction and delete the real target. Verify on a throwaway worktree before trusting the prune path.
- **OQ5 — the wrapper alias vs the actual launch path.** How Claude Code is actually invoked on this machine (shortcut, terminal, IDE) determines whether a bash `alias claude=` even fires. The isolation is only automatic (R4/R5) if every launch path routes through the wrapper.

---

## Rubric scorecard (R1–R9)
- **R1** zero clash / lost code — ✅ by isolation + gated merge (contingent on OQ1 for non-code state).
- **R2** no branch-thinking — ✅ branches are internal, auto-created + auto-pruned.
- **R3** no git bloat / manual trim — ✅ auto-prune + junctions.
- **R4** transparent — ✅ *if* every launch routes through the wrapper (OQ5).
- **R5** mutually blind — ✅ separate worktrees.
- **R6** code survives both ways — ✅ session branch + write-quiescent autosave + orphan-sweep salvage.
- **R7** auto-converge to best version — ✅ common case; true conflicts → LLM merge → park-and-ask.
- **R8** Windows / node_modules / hook-stack / client:ship fit — ⚠ mostly proven; OQ2/OQ3/OQ4 need live verification.
- **R9** safe-by-construction — ✅ off-`main` verify + layered gate + park-on-fail; no silent corruption path.

**Net**: R1–R7 satisfied by construction; R8/R9 have five named open questions (OQ1–OQ5) to close at implementation time. OQ1 is the one that can still lose code and must be resolved first.

---

## Status of this verdict
- This is a **design doc only**. ZERO CUD. Nothing is built.
- Implementation touches protected control files (wrapper, hooks, `client:ship`) → requires a **separate explicit Rutvik go + scoped grants**, and a real 2-parallel-session proof (LR-059) before it is trusted.
- Deferred siblings (each its own go): the reusable `/fightinnovation` skill; Task 3 mega-audit.
