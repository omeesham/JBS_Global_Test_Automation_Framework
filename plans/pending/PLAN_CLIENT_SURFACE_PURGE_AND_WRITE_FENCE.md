# PLAN_CLIENT_SURFACE_PURGE_AND_WRITE_FENCE

**Status**: PENDING
**Priority**: HIGH
**Created**: 2026-07-30
**Identity**: OWNER
**Parent**: (none — top-level plan)
**Depends on**: (none)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none (no live UI work in this plan)

---

## Context — why this plan exists

`clients/encore/` is not an ordinary directory. It is **the ship boundary** — the one folder whose
tracked contents become the client's deliverable via `npm run client:ship` (LR-049). Everything about
its cleanliness is therefore a delivery-quality question, not a housekeeping preference.

On 2026-07-30 the owner opened the folder in Explorer and found a `clients/` directory **inside**
`clients/encore/`. That is not a naming quirk — it is a path bug that wrote real files to a nonsense
location, and nothing in the repo noticed. His words: *"i dont know how many shitty fuckups are alive
in our whole fucking repo."* A first measurement pass the same night confirmed the folder had grown
to well over 100 MB around a payload that is a small fraction of that.

**The deeper problem is not the mess. It is that the mess was possible.** Every artifact catalogued
below was written by an agent, on purpose, into a folder no agent should be able to write to freely.
Detection found them months later by accident. The owner's instruction is explicit and it is the
governing constraint of this plan:

> *"we have to block shit happening instead of find shit and then fix it… no agent should be allowed
> to shit my fucking repo in any fucking case!"*

So this plan has two halves and they are not equal. **The fence is the deliverable; the purge is the
one-time debt payment that proves the fence was needed.** A plan that only cleans is a plan that
schedules its own repetition.

### What we are actually trying to achieve

1. **Know the true contents of the ship boundary** — every file, machine-enumerated, classified as
   SHIPS / AGENT-ONLY-LEGITIMATE / SLOP. Not sampled. Not model-guessed.
2. **Understand why each slop class exists** — an RCA per class, so the fix targets the writer and not
   the residue. A deleted file with an un-diagnosed writer comes back next week.
3. **Make the recurrence structurally impossible** — a write-time fence that denies agent writes to
   the client surface outside a declared allowlist.
4. **Pay off the existing debt safely** — archive-move, never delete; owner confirms every batch.

### What this plan is NOT

- Not a licence to delete. **No file is removed by any agent in this plan.** Every removal is an
  archive-move plus a prune-check plus the owner's per-batch confirmation.
- Not a rewrite of the client's shipped source. `src/`, `tests/`, `config/` change only if the audit
  finds genuine slop *inside* them, and every such change is a separately justified item.
- Not a substitute for the in-flight goal. See Phase 0.

---

## Bootstrap

- **Identity**: OWNER
- **Skills auto-called**: `/identity`, `/relevant`, `/audit --mode=slop`, `/rca`, `/regression-guard`, `/final-q`
- **Context files** (read before Phase 1):
  - `CLAUDE.md` — repo structure, ship discipline, Supreme Rules
  - `clients/encore/CLAUDE.md` — active-client rules
  - `.claude/rules/pipeline.md` — LR-050 (restructure plans enumerate cleanup in-scope), LR-049 (ship via git archive), LR-027/028/040/060
  - `.claude/rules/guardrail-policy.md` — LR-069 (severity rubric + ramp discipline + bloat governor), §3.5 (recurrence convicts the prior fix)
  - `.claude/rules/hooks-identity.md` — LR-043, what a PreToolUse hook may do
  - `.claude/skills/audit/SKILL.md` — the `--mode=slop` DROP/KEEP algorithm
  - `.claude/skills/rca/SKILL.md` — the RCA discipline applied per slop class
  - `clients/encore/.gitignore` — the current, and only, structural fence

---

## Phase 0 — the in-flight goal closes first (gate)

This plan **must not preempt** the open goal it was raised alongside. Phase 1 does not begin until the
13-item goal list is either closed or explicitly parked by the owner, and the session's commit,
activity-log row (LR-028) and `/reflect` have landed.

**Rationale**: the audit will touch the same working tree that carries the goal's uncommitted work.
Auditing a dirty tree that four other sessions are also writing to produces a denominator that is
wrong the moment it is measured. Commit first, then measure.

- [ ] Goal items closed or parked, with the parked ones named.
- [ ] Session work committed (main branch, path-explicit staging — see Phase 5 for why).
- [ ] Activity-log row appended (LR-028, LR-037 timestamp gate).

## Phase 0.5b — baseline-first walk: **N/A, with reason**

LR-048 requires a baseline-first walk when a plan's title contains "audit". It does not apply here:
Phase 0.5b governs **old-site UI baselines** for behavioural audits of a client's application surface.
This plan audits **repository files**, not application behaviour; there is no old-site counterpart to
a directory listing. No `old-site-baseline/*.md` artifact is produced or consumed.

---

## Phase 1 — the machine denominator (delegated: gather)

**No model may enumerate this folder.** A model listing "the files in clients/encore" inherits its own
blind spots, which is precisely how a `clients/` inside `clients/encore/` survived since 13 July.
Per the machine-denominator law the denominator comes from tools, then gets classified by judgment.

Three enumerations, all machine-produced, reconciled against each other:

1. **Tracked** — `git ls-files clients/encore/` → what actually ships.
2. **Ignored-but-present** — `git ls-files --others --ignored --exclude-standard clients/encore/` →
   agent-only content that is correctly fenced.
3. **Untracked-and-not-ignored** — `git ls-files --others --exclude-standard clients/encore/` →
   **the danger set.** These are files no rule anticipated. Everything in this bucket is slop-suspect
   by default; a file here that is legitimate proves `.gitignore` has a gap.

Plus a full-disk walk (`Get-ChildItem -Force` / `find`) with size and mtime per file, because a
gitignored directory can be enormous while contributing zero rows to any git listing — which is
exactly the `.auth` case below.

**Reconciliation rule**: `disk_walk == tracked ∪ ignored ∪ untracked`. Any file on disk that appears
in none of the three git listings is a finding in its own right.

**Deliverable**: `clients/encore/specs_planning/_internal/client-surface-census-2026-07-30.md` —
one row per file: path, size, mtime, git-status bucket, last-touching commit (or "never committed").

### What the first measurement pass already found (2026-07-30, machine-measured)

These are real numbers taken tonight; they scope the work but do **not** replace Phase 1.

| Path | Size | Files | First read |
|---|---|---|---|
| `.auth/e2e-profile` | 37 MB | — | Persistent Chromium profile (cache, service workers, IndexedDB) |
| `.auth/walk-b-profile` | 26 MB | — | Second persistent Chromium profile |
| `.auth` (total) | 63 MB | 722 | Only 2 files (`*-state.json`, ~20 KB each) are actually needed |
| `.playwright-cli` | 40 MB | 328 | Walk scratch: 4× 570 KB CSV exports, console logs back to 21 May |
| `clients/encore/clients/` | 409 KB | 4 | **Path bug** — doubled path, untracked, never noticed |
| `playwright-report-graft-green` | 1000 KB | — | Graft leftover; a second report dir beside `playwright-report` |
| `playwright-report` | 816 KB | — | Standard Playwright output |
| `docs` | 1.8 MB | 5 | Needs classification |
| `logs` | 1.7 MB | 1 | Needs classification |
| client root, loose | — | ~20 | `job3b-*.png` ×4, `nm22*-html-report.png` ×5, `part-a/b/c*.js` ×7, `diag.js`, `review2-*.txt` ×3, `step*.png` ×3 |

**Not yet measured** — the `du` sweep timed out before reaching `reports/`, `scripts/`,
`specs_planning/`, `src/`, `tests/`, `testcases/`. Phase 1 must cover them; do not assume they are
clean because they are absent from this table.

---

## Phase 2 — classify every file (delegated: gather, CEO decides)

Each census row gets exactly one disposition. Workers propose with evidence; the disposition is the
dispatcher's call.

| Class | Meaning | Action |
|---|---|---|
| **SHIPS** | Tracked, and belongs in the client deliverable | Keep; verify it passes the deny-list |
| **SHIPS-BUT-DIRTY** | Tracked and shipping, but carries slop *inside* it (dead code, internal vocabulary, commented-out blocks) | `/audit --mode=slop` at line level; fix in place |
| **AGENT-ONLY-LEGITIMATE** | Gitignored, never ships, and genuinely needed (auth state, config) | Keep; confirm the `.gitignore` fence actually covers it |
| **AGENT-ONLY-ROT** | Gitignored, never ships, no longer needed (stale profiles, old logs, superseded reports) | Archive-move candidate |
| **SLOP** | Should never have been written here at all | Archive-move candidate + mandatory RCA |
| **MISPLACED** | Real content, wrong location (the doubled `clients/` path) | Move to the right place, or archive if duplicated |

**The line-level pass** (`SHIPS` and `SHIPS-BUT-DIRTY` only): the owner asked for every line to be
slop-checked. Applying that to 100 MB of browser cache is waste; applying it to the shipped payload is
the point. Line-level review is therefore scoped to the **tracked** set — the files a client actually
receives — and directory-level disposition covers the rest. Any deviation from this scoping is
recorded in the census with its reason.

---

## Phase 3 — RCA per slop class (delegated: rca, CEO judges)

The owner's requirement is that we understand *why the slop exists*, not merely that it does. Per
LR-069 §3.5, where a prior fix already claimed to cover a class, that prior fix goes on trial first —
it is the prime suspect, and layering a new mechanism on an unconvicted-but-failed old one is
forbidden.

One RCA per class, each answering the same four questions:

1. **Which writer produced it?** Name the script, skill, hook or agent behaviour — with file:line, or
   with the evidence that identifies it. "An agent did it" is not an answer.
2. **What allowed the write?** No gate? A gate that does not cover this path? A gate in `announce`
   mode? A relative path resolved from an unexpected cwd?
3. **Was there a prior fix for this class?** If yes: put it on trial — `scoped-wrong` |
   `prose-not-mechanism` | `rubber-stampable` | `dead/never-fired` | `different-sub-class`. Verdict
   `SURVIVES` or `CONVICTED`. A CONVICTED fix is rewired or retired **in this plan**, never left idling.
4. **What makes recurrence structurally impossible?** Must be a mechanism. Prose is not an answer.

### Working hypotheses (to be proven or refuted, not assumed)

- **The doubled `clients/` path** — a relative path (`clients/encore/…`) resolved while the process cwd
  was already `clients/encore/`. Suspect any script or ticket that hard-codes a repo-relative path
  without anchoring to the repo root. *Prediction*: the fix is cwd-anchoring plus a fence that refuses
  the nonsense path outright.
- **`.auth` at 63 MB** — Playwright `launchPersistentContext` writing full browser profiles. Storage
  state is ~20 KB; the profile is 3000× that. *Prediction*: profiles do not belong under the client
  folder at all, and nothing prunes them.
- **`.playwright-cli` at 40 MB** — walk scratch with no retention policy. Every walk appends; nothing
  ever prunes. *Prediction*: needs a retention rule, not a one-time clean.
- **Loose files at the client root** — agents defaulting to cwd when a ticket did not name an absolute
  output path. *Prediction*: this is the same root cause as the doubled path, and one fence closes both.

---

## Phase 4 — the write fence (the actual deliverable, CEO-authored)

A PreToolUse gate that **denies** agent writes to `clients/<id>/` outside a declared allowlist.

**Design constraints, all load-bearing:**

- **Allowlist, not denylist.** A denylist enumerates the mess we already found; an allowlist covers the
  mess we have not imagined yet. The allowlist is the shipped layout that `CLAUDE.md` already
  documents: `src/`, `tests/`, `config/`, plus the named root files (`package.json`,
  `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `README.md`, `.env.e2e`) and the
  gitignored-but-legitimate set the Phase 2 census confirms.
- **Deny is the point, but it lands in `announce` first.** Per LR-069 §3.3, an S1 gate never ships
  straight to deny. Ramp knob in `.claude/guardrail-config.json`; promote on the recorded criterion.
  Severity: **S1** — silent quality drift surviving to commit/ship, with an S0 edge (anything that
  would leak into a deliverable). Graduating incident: this plan's own census.
- **Budget**: ≤200 ms per call (LR-069 §3.4 PreToolUse budget). A path-prefix check against a static
  allowlist meets that comfortably; anything requiring a directory walk does not.
- **Fire telemetry from day one.** Every verdict appends to `.claude/state/gate-fires.log`. The
  known-gap note in LR-069 §3.4 records ≥8 gates shipped dark; this one does not join them.
- **Absolute-path discipline in tickets is the companion control.** The fence stops the write; the
  ticket template stops the intent. Both, or agents will keep aiming at the client folder and merely
  failing louder.
- **Fail-open on exception**, logged to `.claude/state/hook-failures.log`. A broken gate must never
  wedge a session.

**Escape hatch**: the LR-043 §A one-shot break-glass handshake, unchanged. Discretionary, never workflow.

---

## Phase 5 — pay off the debt (owner-gated, no autonomous deletion)

**No agent deletes anything in this plan.** The sequence per batch:

1. `git mv` / `mv` to `_archive/client-surface-purge-2026-07-30/`, preserving relative structure.
2. `node scripts/prune-check.mjs` — prove zero live references to every moved path.
3. Present the batch to the owner as a list, per item, with size and the reason.
4. Only on his per-batch confirmation does anything leave the archive.

Reports and results are never removed without asking — that constraint holds here without exception.

**Commit discipline for this plan and for the session that opened it**: the working tree currently
carries ~125 modified files from **four concurrent sessions**, and HEAD is on
`checkpoint/q123-slop-wave-2026-07-30`, not `main`. Staging is **path-explicit, per session's own
files**. No `git add -A`. No branch switching while other sessions hold the tree. Publishing (push)
remains the owner's, never an agent's.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| OWNER | census, RCA set, fence, ramp config, archive batches | `clients/encore/specs_planning/_internal/client-surface-census-2026-07-30.md`<br>`.claude/hooks/lib/check-client-surface-write.mjs`<br>`.claude/guardrail-config.json` | `node .claude/hooks/lib/check-client-surface-write.mjs --self-test` exits 0 |
| WATCHDOG | slop findings table over the tracked set | (skipped: findings are recorded inline in the census file's disposition column rather than a separate WATCHDOG table, so one artifact carries both) | census file has a non-empty disposition for every row |
| GARDENER | archive-moves of AGENT-ONLY-ROT and SLOP | `_archive/client-surface-purge-2026-07-30/` | `node scripts/prune-check.mjs` reports zero live refs |
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |

---

## Acceptance criteria

- [ ] Phase 0 gate satisfied — goal closed or parked, session committed, activity-log row landed.
- [ ] Census exists and is machine-derived; `disk_walk == tracked ∪ ignored ∪ untracked` reconciles, with every unreconciled file reported.
- [ ] **Every** census row carries exactly one of the six dispositions. Zero blanks.
- [ ] Every file in the untracked-and-not-ignored bucket is either dispositioned SLOP or has a named `.gitignore` gap filed against it.
- [ ] One RCA per slop class, each naming the writer, the permitting gap, the prior-fix trial verdict, and the structural fix.
- [ ] Every CONVICTED prior fix is rewired or removed **within this plan** — none left idling.
- [ ] The write fence exists, self-tests green, emits fire telemetry, and is recorded in `.claude/guardrail-config.json` with `ramp_started` / `ramp_target` / `ramp_note`.
- [ ] The fence is proven by live fire: a deliberate write to a non-allowlisted path under `clients/encore/` is announced (or denied, post-ramp), with the telemetry line pasted.
- [ ] The doubled `clients/encore/clients/` path is resolved and its root cause named with file:line or equivalent evidence.
- [ ] Zero files deleted by any agent. Every removal is archive-move + prune-check + owner confirmation, with the confirmation quoted.
- [ ] `npm run client:ship -- --client=encore --out=<temp>` still succeeds and its deny-list check passes.
- [ ] `/final-q` verdict block emitted per LR-042.

---

## Handoff

Chat only, per `feedback_handoff_in_chat_only.md`. Reports outcomes, not obstacles (LR-039).
