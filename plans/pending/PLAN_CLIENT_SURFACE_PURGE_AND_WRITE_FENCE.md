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
in our whole fucking repo."* The completed measurement is worse than the first pass suggested: the
folder is **2.2 GB**, and the tracked payload that actually reaches the client is **~3 MB** of it.

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

**SATISFIED 2026-07-31 — this gate is closed; do not re-litigate it.** The goal it referenced was
cleared by the owner on 2026-07-31 after Phases 1–3 and 5 ran. Recorded here because the original
wording was unsatisfiable: it gated Phase 1 on "the 13-item goal list", and **that list existed only
in a live session's TodoWrite, never in any file** — so no later reader could have determined whether
the gate was met. A gate whose condition is not written down is not a gate. Any future plan phrasing
a precondition as "the goal list" must enumerate it inline or cite a path.

Original rationale, still sound: the audit touches the same working tree that carries uncommitted
work, and auditing a dirty tree that four other sessions are also writing to produces a denominator
that is wrong the moment it is measured. Commit first, then measure.

- [x] Goal cleared by owner, 2026-07-31.
- [x] Session work committed (`d3758429`, `85f2cd4c`, `539df5c1` — path-explicit staging, see Phase 5).
- [x] Activity-log row appended (LR-028, LR-037 timestamp gate) — 2026-07-31T15:47.

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

### Completed measurement (2026-07-31, machine-measured — supersedes the first partial pass)

The `du` sweep finished and **inverted the working assumption**. The first pass named `.auth` (63 MB)
and `.playwright-cli` (40 MB) as the headline bloat. They are not: together they are **4.6%**. The
folder is 2.2 GB and two gitignored directories are **92%** of it.

| Path | Size | Git status | Tracked files | Read |
|---|---|---|---|---|
| `specs_planning` | **1.1 GB** | IGNORED (`.gitignore:188`) | **450** (1.4 MB) | 99.9% of its bytes are untracked. See sub-table. |
| `reports` | **927 MB** | IGNORED (`clients/encore/.gitignore:3`) | 0 | Top-level size only; internals not yet broken down (Phase 1 owes this) |
| `node_modules` | 95 MB | IGNORED | 0 | Expected; not a finding |
| `.auth` | 63 MB | IGNORED | 0 | 722 files, 2 persistent Chromium profiles; only 2 `*-state.json` (~20 KB) are needed |
| `.playwright-cli` | 40 MB | IGNORED | 0 | 328 files, walk scratch, console logs back to 21 May; no retention rule |
| `docs` | 1.8 MB | — | — | Needs classification |
| `logs` | 1.7 MB | — | — | Needs classification |
| `playwright-report-graft-green` | 1000 KB | — | — | Graft leftover; second report dir beside `playwright-report` |
| `testcases` | 932 KB | — | — | Deliverable XLSX — classification expected SHIPS |
| `src` | 917 KB | tracked | — | The shipped payload |
| `tests` | 840 KB | tracked | — | The shipped payload |
| `playwright-report` | 816 KB | — | — | Standard Playwright output |
| `clients/encore/clients/` | 409 KB | **untracked-and-NOT-ignored** | 0 | **Path bug** — doubled path, no rule anticipated it |
| client root, loose | ~2.4 MB | **untracked-and-NOT-ignored** | 0 | `nm22*-html-report.png` ×5 (1.5 MB), `job3b-*.png` ×5, `step*.png` ×3, `part-a/b/c*.js` ×7, `diag.js`, `review2-*.txt` ×3 |

**Inside `specs_planning` (1.1 GB):**

| Path | Size | Read |
|---|---|---|
| `specs_planning/_internal` | 637 MB | Raw `allure-results/` dumps under dated evidence dirs — thousands of UUID-named `*-result.json` / `*-attachment.txt` |
| `specs_planning/_internal.zip` | **419 MB** | **A single file.** An in-place archive of the sibling `_internal/` directory. Pure duplication, and the largest single object in the client folder. |
| `specs_planning/test-cases` | 1.5 MB | The actual work product |
| `specs_planning/test-plans` | 448 KB | The actual work product |
| `specs_planning/catalogs` | 132 KB | The actual work product |

**Inside `reports` (927 MB):**

| Path | Size | Read |
|---|---|---|
| `reports/allure-results` | **794 MB** | Raw Allure output. 86% of `reports/` on its own. |
| `reports/allure-report` | 111 MB | The rendered report, generated *from* `allure-results` — both kept |
| `reports/diagnostics` | 6.1 MB | Needs classification |
| `reports/test-results.json` | 724 KB | Needs classification |
| `reports/html-report` | 644 KB | A third report format alongside the other two |
| `reports/_cli-run.log` | 472 KB | Scratch log at the `reports/` root |
| `reports/walk-coverage` | 288 KB | Needs classification |
| `reports/fcc-completion-run` | 236 KB | Needs classification |
| `reports/junit-results.xml` | 228 KB | Needs classification |
| `reports/bugs` | **68 KB** | The filed bug JSONs — the highest-value content in the directory, at 0.007% of its size |
| `reports/screenshots`, `_extra-leaks.txt`, `_diag_pause.log`, `label-inventory.txt`, `_rerun2.log` | <300 KB total | Needs classification |

**File counts**: `specs_planning` = 2,751 files. The shipped payload (`src` + `tests` + `testcases`)
is a few thousand at most. For `reports`, see the drift warning immediately below — its count is not
a stable number.

### ⚠ The tree is LIVE — every figure here is a snapshot, not a census

Measured 2026-07-31, twenty minutes apart, with the identical command from the identical directory:

| Measure | ~12:05 | ~12:30 | Δ |
|---|---|---|---|
| `find reports -type f` | 91,634 | 52,022 | **−39,612 files** |
| `du -sh reports` | 927 MB | 647 MB | **−280 MB** |

Nothing in this plan caused that. Concurrent sessions are writing and pruning under
`clients/encore/` continuously, and `reports/allure-results` is the churn surface. Three consequences,
all load-bearing:

1. **The earlier figures in this document were accurate when taken and are stale now.** They are kept
   as a dated observation, not corrected away — the drift is the finding.
2. **Phase 1 must record its measurement window** (start and end timestamp) and label its output a
   snapshot. A census of a moving tree that does not state when it was taken is not reproducible, and
   a later reader will treat a stale number as a current one — exactly what happened here.
3. **Do not size a control off any single reading.** The 92%-of-bloat claim survives (the ratio is
   stable even as the absolute shrinks), but any threshold expressed in absolute MB or file count
   will be wrong within the hour. Arm B's size governor must therefore budget on *growth rate or
   ratio*, not on a fixed ceiling.

Independently confirmed: a full-disk walk returned **59,427** files for the whole client folder,
which matches the Phase 1 git enumeration exactly (635 tracked + 58,763 ignored + 29 untracked).
The identity `disk_walk == tracked ∪ ignored ∪ untracked` **reconciles**. An earlier suspicion of a
~34,000-file gap was an artifact of comparing a fresh git enumeration against a stale disk count —
the git side was right.

### It is one class, not five

The five hypotheses below are not five problems. Measured directly:

| Source | Size |
|---|---|
| `reports/allure-results` | 794 MB |
| `reports/allure-report` (generated from the above) | 111 MB |
| `specs_planning/_internal/defence-evidence-2026-06-01/run1+run2/allure-results` | 336 MB |
| **Subtotal — raw Allure output and its rendering** | **1,241 MB (56% of the folder)** |
| `specs_planning/_internal.zip` — archives `_internal`, which is 336 MB Allure of its 637 MB | up to +419 MB |

So **one writer class — raw Allure output that nothing prunes** — accounts for at least 56% and
plausibly ~75% of a 2.2 GB folder, and for roughly 90,000 of its ~94,000 files. It was then amplified
twice: **copied** into a dated evidence directory, and **archived** in place on top of that.

This is a better result than five separate RCAs, and it should be stated in the plan rather than
discovered again in Phase 3: fix retention on Allure output and the problem is mostly gone. The
remaining items (`.auth` profiles, `.playwright-cli` scratch, the doubled path, loose root files) are
real and still in scope, but they are the tail, not the story.

### Three findings this measurement forces

**1. The bloat never touched the ship boundary.** `specs_planning`, `reports`, `.auth` and
`.playwright-cli` are all gitignored, so `git archive` already excludes them — 92% of the bloat could
never have reached the client. **This plan's original framing was wrong**: it treated the folder as a
delivery-quality problem. It is primarily a *local disk and retention* problem, with a much smaller
delivery-hygiene problem sitting beside it. Phase 4 is corrected accordingly.

**2. The tracked set and the ignore fence disagree.** `.gitignore:188` ignores
`clients/*/specs_planning/`, yet **450 files under it are tracked**. That state can only be reached by
force-adds (`git add -f`), and it is why routine `git add` on those paths behaves confusingly — it was
hit live during the 2026-07-30 session. A directory that is simultaneously ignored and tracked is an
unstable fence, and it is a finding in its own right regardless of size.

**3. The danger bucket is small but is exactly the class the fence must stop.**
Untracked-and-not-ignored under `clients/encore/` = the doubled `clients/` dir plus ~20 loose root
files (~2.8 MB total). Zero bytes of it was anticipated by any rule. Size is not the point — *nothing
stopped the write* is the point.

**Still owed by Phase 1**: the internal breakdown of `reports/` (927 MB, top-level figure only), and
per-file mtimes across the whole tree. Do not treat any directory as clean merely because its
top-level size is small.

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

### Working hypotheses (to be proven or refuted, not assumed — ordered by measured size)

- **`_internal.zip` at 419 MB — the single largest object.** An agent archived `_internal/` in place
  and never removed the archive, so the directory and its own zip now sit side by side. *Questions
  Phase 3 must answer*: which run produced it, was it ever consumed, and what was the intent (a
  handoff? a backup before a destructive edit?). *Prediction*: a one-shot agent convenience with no
  cleanup step, and the fix is that in-place archives are never written under a client folder.
- **`_internal` at 637 MB — of which 336 MB is measured raw `allure-results`** across two runs in a
  single dated evidence dir. Evidence capture copied the *entire* Allure output (thousands of UUID
  files per run) rather than the report or a digest, and nothing prunes dated evidence dirs.
  *Prediction*: needs a retention rule plus a rule about what "evidence" means — a summarised
  artifact, not a raw run dump. *Open*: the other ~300 MB of `_internal` is not yet attributed.
- **`reports` at 927 MB — measured: `allure-results` 794 MB + `allure-report` 111 MB = 97.6%.** Three
  report formats are retained simultaneously (`allure-report`, `html-report`, `junit-results.xml`)
  alongside the raw results they are all generated from. *Prediction*: no retention rule ever existed
  and the raw results were never intended to be kept once rendered. **Constraint**: reports and
  results are never removed without asking; this is archive-and-confirm, not clean.
- **`.auth` at 63 MB** — Playwright `launchPersistentContext` writing full browser profiles. Storage
  state is ~20 KB; the profile is 3000× that. *Prediction*: profiles do not belong under the client
  folder at all, and nothing prunes them.
- **`.playwright-cli` at 40 MB** — walk scratch with no retention policy. Every walk appends; nothing
  ever prunes. *Prediction*: needs a retention rule, not a one-time clean.
- **The doubled `clients/` path** — a relative path (`clients/encore/…`) resolved while the process cwd
  was already `clients/encore/`. Suspect any script or ticket that hard-codes a repo-relative path
  without anchoring to the repo root. *Prediction*: the fix is cwd-anchoring plus a fence that refuses
  the nonsense path outright.
- **Loose files at the client root** — agents defaulting to cwd when a ticket did not name an absolute
  output path. *Prediction*: this is the same root cause as the doubled path, and one fence closes both.
- **450 tracked files under an ignored directory** — force-adds accumulated over time. *Questions*: was
  each `-f` deliberate (the four agent-runtime files at `.gitignore:202-205` are re-included on
  purpose), or is some of it accidental? *Prediction*: a legitimate core plus drift, and the fix is an
  explicit re-include list in `.gitignore` so `git add` stops needing `-f`.

**Prior-fix trial is mandatory for the retention class.** `.gitignore:188` and
`clients/encore/.gitignore:3` are prior fixes that *did* work for their stated purpose — they kept
this content out of the deliverable. They were never retention controls and must not be convicted for
failing a job they never had. What is missing is a control that no one ever built. Name that honestly
rather than blaming the ignore rules.

---

## Phase 4 — the fences (the actual deliverable, CEO-authored)

**Two arms, because the measurement proved one arm is not enough.** The original plan had only Arm A.
Arm A would have caught the doubled `clients/` dir and the loose root files — ~2.8 MB, or **0.1%** of
the problem. It would not have stopped a single byte of the 2.0 GB, because every one of those writes
lands *inside* a legitimate, allowlisted, gitignored directory. A fence that stops 0.1% of the measured
failure and is described as "the deliverable" is the kind of thing this plan exists to prevent.

### Arm A — path fence (unanticipated locations)

A PreToolUse gate that **denies** agent writes to `clients/<id>/` outside a declared allowlist.
Targets the untracked-and-not-ignored bucket: the doubled path, loose root scratch, anything no rule
anticipated.

> **⚠ Arm A cannot see the writer that caused most of this mess. State that plainly or the plan lies
> about its own coverage.** PreToolUse fires on *Claude's* `Edit`/`Write`/`NotebookEdit` calls. It does
> **not** fire on (a) Copilot workers, which run as a separate process via `copilot-worker.sh`, or
> (b) anything Claude does through `Bash` — `mv`, `cp`, `>` redirects, a script that writes files. The
> RCA attributes the doubled path and the root scratch to worker `cwd` defaults, so **Arm A would not
> have caught the exact incident that motivated it.** Arm A's real job is the residue: Claude's own
> direct file writes to unanticipated paths. The control that reaches workers is **Arm C**, which is
> therefore not a companion or a footnote — it is the primary fence for the primary writer, and if only
> one of the two gets built, build Arm C.

**Design constraints, all load-bearing:**

- **Allowlist, not denylist.** A denylist enumerates the mess we already found; an allowlist covers the
  mess we have not imagined yet. **The allowlist must be enumerated in full before the gate is
  written, because everything absent from it is denied.** An earlier draft of this line listed only
  `src/`, `tests/`, `config/` and six root files — that would have denied the test runner's own
  output, the healer's only input, `npm install`, and the activity log. The complete set:
  - **Directories**: `src/`, `tests/`, `config/`, `testcases/`, `docs/`, `specs_planning/`,
    `reports/`, `scripts/`, `node_modules/`, `.auth/`, `.playwright/`, `.playwright-cli/`
  - **Root files**: `package.json`, `package-lock.json`, `playwright.config.ts`, `tsconfig.json`,
    `.gitignore`, `README.md`, `.env.e2e`, `.env.local`, `CLAUDE.md`
  - **Derivation, not judgement**: this set must be regenerated from `git ls-files -- clients/<id>` +
    the census's KEEP rows at gate-authoring time and re-verified whenever the shipped layout changes.
    A hand-maintained second copy drifts; that drift is a repo-wide denial.
  - **Blast-radius check before flipping to deny**: run one full `npm test` and one `npm install` with
    the gate in `announce` and confirm **zero** announce lines on legitimate paths. A gate whose ramp
    produced no announcements has not been tested — it has been assumed.
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

#### The four proven classes — deny on landing, no ramp (owner directive, 2026-07-31)

Rutvik's instruction: *"make sure this plan knows what to prevent in future from slopping our encore
folder in most permanent strictest way possible."* The ramp-first rule in LR-069 §3.3 exists so an
unproven gate cannot wedge work on a class it misjudges. These four classes are not unproven — each
one was **measured on disk this session**, each is decidable from the path string alone in constant
time, and none has a single legitimate instance anywhere in the repo's history. Under §3.1 they are
S0-shaped (they produced a 2.2 GB surface that nobody noticed for six months, and the doubled-path
class silently wrote real evidence files to a nonsense location). **They land at `deny`, not
`announce`.** Every other pattern the fence covers still ramps normally.

| # | Denied shape | Constant-time rule | What it actually stopped |
|---|---|---|---|
| A1 | Self-nesting | path contains `clients/<id>/clients/` | The doubled directory — 4 real evidence files written to a nonsense path, unnoticed for months |
| A2 | New dot-directory | a path segment starts with `.` and is not in `{.auth, .playwright, .playwright-cli}` | 5 stray `.claude/` state dirs, one of them nested inside `.playwright-cli/` |
| A3 | New file at client root | depth-1 file under `clients/<id>/` not in the declared root set | 26 scratch files: `part-*.js`, `diag.js`, screenshots, `review2-*.txt` |
| A4 | Archive of a source tree written in place | `*.zip`/`*.tar`/`*.tar.gz`/`*.7z` under `clients/<id>/` **excluding `reports/**`** | `_internal.zip`, 418 MB, never read by anything, ever |

> **A4's exclusion is load-bearing, not a softening.** Playwright writes `trace.zip` (and
> `attachments/trace-*.zip`) into `reports/test-results/` on every retry — **42 were on disk when this
> was checked**. A rule reading "any `*.zip` under the client folder" denies the runner's own output on
> every failed test. A4 targets *an agent archiving a tree in place*; runner output under `reports/`
> is Arm B's retention problem, never Arm A's deny. **A4 supersedes the zip clause in B1** — B1 keeps
> only the raw-runner-output-tree shape. Two rules for one shape with two different ramps was a defect
> in this plan's first draft (Arm A said deny-on-landing, B1 said announce-first); this line is the
> resolution.

The allowlist (default-deny on everything else) still ramps announce→deny per §3.3 — it is the arm
that judges *unimagined* shapes, and that judgement can be wrong. A1–A4 cannot be wrong: there is no
correct reason to nest a client inside itself, drop a new dot-directory, scatter files at the client
root, or zip a tree in place.

#### Why "strictest" also means "provably firing"

A deny that never fires is indistinguishable from no gate at all, and this repo has ≥8 gates shipped
dark (LR-069 §3.4 known-gap). Strictness is therefore three obligations, not one:

1. **Live-fire proof per class.** The self-test drives a real violating path through each of A1–A4 and
   asserts a deny — a passing self-test that never exercised the deny branch proves nothing
   (`feedback_a_green_check_can_be_an_artifact_of_invisibility`).
2. **Discrimination proof.** A legitimate write (`src/pages/foo.page.ts`, `tests/x.spec.ts`) must
   ALLOW in the same self-test run. A gate that denies everything, or allows everything, carries no
   information (`feedback_a_signal_that_never_varies_is_not_a_signal`).
3. **Telemetry from the first commit.** Every verdict — allow and deny — appends to
   `.claude/state/gate-fires.log`. Without it the LR-069 demotion review runs blind and the gate is
   unauditable.

#### Why the override is Rutvik's, not an agent's

The LR-043 §A one-shot handshake stays for the ramping allowlist. **A1–A4 have no agent-reachable
override.** An agent that wants one is, by construction, about to recreate the exact class this plan
was written to end. The only bypass is the `closure-overrides.json` precedent (LR-055): a file the
agent cannot edit, changed by Rutvik, committed by Rutvik. That asymmetry is the permanence.

#### Arm C — the primary fence: refuse the ticket, not just the write

**Build this first.** The RCA found the cause: **tickets that name no absolute output path, so a
worker's `cwd` decides where files land.** Every root-scratch file, the doubled path, and several
stray dot-dirs trace to that one defect — and every one of those writes came from a worker process
Arm A cannot observe (see the ⚠ above). Arm C is the only arm that reaches the writer that made the
mess.

**Current state, verified 2026-07-31**: `copilot-worker.sh:725` prints
`WARN — OUTPUT (LITERAL ABSOLUTE) is not an absolute path, ignoring: …` and **runs the job anyway**.
That warning is the exact moment the junk got written; nobody reads worker stderr in time to stop it.
`:813` handles the missing-field case the same way. Arm C converts both to a hard refusal before
dispatch (`exit 2`, no run started).

Two things Arm C must get right, or it becomes theatre:
- **Refuse before spending.** The check runs at ticket-parse time, before any credits are consumed —
  a refusal after the worker has run has already allowed the write.
- **`OUTPUT (LITERAL ABSOLUTE)` is optional on some ticket shapes today** (read-only probes declare no
  output). Refusing those breaks legitimate dispatches. The rule is: *if the field is present it must
  be absolute; if the ticket's `WORK-TYPE` produces artifacts it must be present.* Enumerate which
  work-types produce artifacts before writing the check — guessing here re-runs the allowlist mistake
  one layer down.

### Arm B — accumulation fence (the 92%)

**A per-write gate is the wrong instrument for accumulation, and the plan must say so plainly.** No
individual write in the 2.0 GB looks wrong. `allure-results/0071dc72-…-result.json` is a legitimate
file with a legitimate name in a legitimate directory. There is no per-call signal to deny on, and a
gate that walks a 1 GB directory to measure it blows the ≤200 ms budget (LR-069 §3.4) on every write
in the session. Arm B is therefore **three controls at three different layers**, not one hook:

- **B1 — shape denial (PreToolUse, cheap, deny-capable).** Two shapes are always wrong under a client
  folder and both are detectable from the path alone, in constant time:
  - an archive written in place (`*.zip`, `*.tar`, `*.tar.gz`, `*.7z`) anywhere under `clients/<id>/`
    — this is the 419 MB `_internal.zip` class;
  - a raw runner-output tree written under `specs_planning/` (`**/allure-results/**`,
    `**/test-results/**`, `**/trace.zip`) — this is the 637 MB class.
  Same ramp discipline as Arm A: `announce` first, telemetry from day one, promote on the criterion.
- **B2 — retention rule with an owner (config, not prose).** Every accumulating directory gets a
  declared retention policy in one place — `.playwright-cli`, `.auth` profiles, `reports/`,
  `specs_planning/_internal/<dated-evidence>/`. A directory with no policy row is itself a finding.
  **Enforcement is report-and-confirm, never autonomous delete** — Phase 5's constraint governs here
  without exception.
  **Owner ruling (Rutvik, 2026-07-31) — the policy classifies CONTENT, not directories.** Two classes:
  - `regenerable-cache` — browser profiles, `.playwright/cli.config.json`, `node_modules`. **Never
    deleted by policy or by hand**: removal is pure waste — the next run just regenerates it slower.
  - `dead-output` — downloaded CSVs, console/run logs, report trees, evidence snapshots, stray
    session-state dirs: anything that will NOT come back on its own. This is the only class the
    retention policy expires, by age.
  One folder can hold both classes (`.playwright-cli/` holds a regenerable profile AND months of dead
  CSVs/logs) — the policy applies per content class WITHIN the folder, never folder-wholesale.
- **B3 — size governor (Stop hook, measure once per session, report only).** One `du` at session end,
  compared against a recorded budget per directory. Over budget → a line in the session's output
  naming the directory and its growth. This is the control that would have caught 2.0 GB in week one
  instead of month six. It reports; it never deletes and never blocks.

**Why B3 is a Stop hook and not a PreToolUse gate**: measuring is expensive and accumulation is slow.
Once per session is enough to catch it early, and costs nothing per write. The failure this whole plan
responds to is not that a bad write happened — it is that **nothing ever looked**.

**Honest limit**: B1 denies two known shapes. It does not deny shapes nobody has thought of yet, and
claiming otherwise would repeat the framing error this phase corrects. B3 is the general net precisely
because it needs no foreknowledge of the shape — which is why it is not optional.

---

## Phase 5 — pay off the debt (owner-gated, no autonomous deletion)

**Owner posture change (Rutvik, 2026-07-31) — the presumption is FLIPPED.** Every file under
`clients/encore/` is slop until it proves otherwise. KEEP requires one concrete cited proof:
SHIPPED (declared layout + reachable), MANDATED (a skill/rule/hook names it, file:line), or
REFERENCED (live code/config cites it — a reference from another delete-candidate does not count).
"Probably needed" = delete-candidate. Regenerable-cache content is exempt from removal per the
Arm B owner ruling (deleting it is waste, it comes back); only dead-output is ever removed.

**Re-enumerate at execution time — the list is a seed, not the scope.** The tree is live; new slop
appears between sessions. The executing agent MUST re-run the enumeration (git ls-files triad +
untracked + ignored-tree listing), diff against the dispositioned set in
`.claude/state/ua-worker/chips/purge/out-redisp-lot-a/LOT-A.md` + `out-redisp-lot-b/LOT-B.md`
(2026-07-31 re-audit, flipped presumption), and disposition anything NEW by the same rule. A frozen
list from a prior session is never treated as the denominator.

**Standing class authorizations.** When the owner confirms a batch, his yes covers the CLASS
(path-shape + content-class), not just the enumerated files — so a new `part-x.js` at client root or
a new stray `.claude/` dir found at execution time is pre-authorized by the earlier yes on its class.
Record each confirmed class in the batch record. Anything matching NO confirmed class is presented
fresh — never inferred-approved.

**No agent deletes anything in this plan.** The sequence per batch (pre-authorized classes included):

1. `git mv` / `mv` to `_archive/client-surface-purge-<date>/`, preserving relative structure.
2. `node scripts/prune-check.mjs` — prove zero live references to every moved path.
3. Present the batch to the owner as a list, per item, with size and the reason (for pre-authorized
   classes: present as a post-move report naming the class authorization it rode on).
4. Only on his per-batch confirmation (or a cited standing class authorization) does anything leave
   the archive.

Reports and results are never removed without asking — that constraint holds here without exception.
The 2026-07-31 grouped delete list awaiting the owner's per-group yes lives at
`.claude/state/ua-worker/chips/purge/ARCHIVE-BATCH-PROPOSAL.md` (superseded groups) + the chat-issued
8-group list; fold both into the batch record on first execution.

### 2026-07-31 findings record — research already burned, do NOT rediscover

Full evidence: `.claude/state/ua-worker/chips/purge/out-redisp-lot-a/LOT-A.md` (635 tracked files,
KEEP 237 / DELETE-CANDIDATE 198 / DELETE-ASK 200) + `out-redisp-lot-b/LOT-B.md` (untracked 29 exact +
ignored trees, 46s measurement window). The compact facts an executing agent needs:

**STATUS 2026-07-31: groups 1–8 EXECUTED.** Owner approved 1–7 ("yes"), then 8 conditional-on-gates.
All content is archive-moved to `_archive/client-surface-purge-2026-07-31/`, preserving relative
paths. **Nothing is deleted — the archive is the holding pen until Rutvik says delete.**
`clients/encore` measured **2.2 GB → 175 MB** at 15:20. Post-move audit: 635 tracked files, 320 absent
from disk, 320 found in the archive at the same relative path, **0 unexplained**. Each denied class
below maps to something this execution actually removed, which is why Arm A's A1–A4 land at `deny`.

> **⚠ The 175 MB number was already stale two hours later — read this before quoting it.** A re-measure
> at 17:0x returned **256 MB**, with `reports/` back to **86 MB** from zero: a test run regenerated it.
> That is not drift in the measurement, it is **the finding**. The purge removed 2 GB of accumulated
> runner output and the accumulation restarted immediately, because **nothing in this plan is built
> yet** — no retention policy (B2), no size governor (B3). Two consequences:
> 1. **Every size figure in this plan is a dated observation, never a current state.** Re-measure at
>    execution time; do not reconcile against these numbers.
> 2. **The purge without Arm B is a treadmill.** The one-time cleanup bought a few hours. If only one
>    thing gets built, B2+B3 stop the regrowth; Arm A only stops shapes that were already rare.
>
> Two more corrections to the audit numbers above, both found by an adversarial review of this plan:
> - **The audit measured the git INDEX, not HEAD.** `git ls-files` reads the index, so a file whose
>   deletion is *staged* counts as "not tracked" and never enters the missing set. `client:ship` runs
>   `git archive HEAD`, so **HEAD is what ships** — the audit checked the wrong reference. Re-run it as
>   `git ls-tree -r --name-only HEAD -- clients/<id>` to audit what a client would actually receive.
> - That defect hid a real file: `clients/encore/src/fixtures/step-wrapper.ts` is **in HEAD** (ships
>   today), **absent from disk**, **not in the archive**, and **imported by nothing** — superseded by
>   `step-decorator.ts` (modern Playwright decorators). Its deletion is already staged by another
>   session; committing that staged deletion is the fix. Unrelated to this purge — it predates it by
>   two commits (`8875b232`, `4ea2cfea`) — but it is a dead file shipping to the client right now.

**The 8-group delete list (sizes at 2026-07-31T13:22, tree is live — re-measure, don't reconcile):**
1. Root scratch — 26 files ~2.4MB (13 PNGs, 8 `part-*.js`/`diag.js`, 3 `review2-*.txt`,
   `playwright-report-graft-green/`, `.machine-evidence/`).
2. Doubled path `clients/encore/clients/` — cwd-bug duplicates, originals exist at correct path.
3. Agent droppings — FIVE stray `.claude` dirs (`./`, `.playwright-cli/`, doubled path,
   `specs_planning/`, `specs_planning/_internal/`), `logs/` (3MB), gate-fires logs, regguard txt,
   `.dedupe-tmp/`, `scripts/walks/`.
4. `.playwright-cli` dead contents ONLY — stale CSVs + console/run logs back to May. The profile and
   `.playwright/cli.config.json` are regenerable-cache: STAY.
5. `reports/` — 9 subtrees, all run output: allure-results 51,931 files/460MB, bugs, diagnostics,
   fcc-completion, html-report, screenshots, test-results, verify-nm2268, walk-coverage (~473MB).
6. `_internal.zip` 418MB — zero references found by RCA + re-grep; nothing has ever read it.
7. `defence-evidence-2026-06-01/` — 2,446 files ~620MB June run snapshot; 200 of them git-tracked
   (deletion includes untracking those).
8. `specs_planning` one-off planning artifacts — per-file recheck complete (LOT-A.md
   `## REDISPOSITION-R2 (bounce)`): **179 DELETE-CANDIDATE / 19 KEEP** of 198. The 19th KEEP
   (`daily-status-bank.json`, read by end-day + end-week skills) was missed by BOTH worker passes and
   caught by dispatcher spot-grep — CEO-corrected, not bounced a third time. Worker's other 18 KEEPs
   carry verified cites (skills/rules/hooks/CLAUDE.md); navigation.md-only hits ruled NOT proof.
   **OWNER RULING (Rutvik, 2026-07-31): group 8 approved CONDITIONAL on gates.** His condition:
   "if the gates are fine, I am fine with their removal." Verified fine: walk-evidence gates
   (LR-013/PF-G5, LR-062) demand a fresh artifact per walk, never historical files; every file a
   gate/rule/hook names by path is in the 19 KEEPs which stay; prune-check flags anything a pending
   plan still cites (flagged files remain archived, never deleted). The 179 ride the same
   archive-move → prune-check pipeline as groups 1–7.

**KEEP proofs already verified (don't re-litigate):** `src/**`+`tests/**`+configs+lockfile (shipped
layout, reporter cited at playwright.config.ts:70, globalSetup :168); `testcases/*.xlsx` +
`specs_planning/test-cases|test-plans` (ALL-071/LR-ENC-002); `.auth/` (playwright.config.ts:128,:154,:161 +
auth.setup.ts — owner's login sessions); `node_modules` (regenerable but constantly needed = waste to
delete); LR-049 force-tracked docs set; mandated memory files with cites: `agent-activity-log.md` +
`agent-mistakes.md` (LR-028), `bug-archetypes.md` + `active-experiments.md` (audit SKILL + AGENT_SHARED_RULES),
`field-inventory-spec.md` + `field-case-generation.md` (root CLAUDE.md @-references) — the last four
were missed by the first worker pass and caught by dispatcher grep (lesson: lump verdicts hide
mandated files; per-file proof or evidence-cited subgroups only).

**Already executed:** `readable_externals/jbs/2026-04-23_multi-tenant-handoff/` archive-moved to
`_archive/client-surface-purge-2026-07-31/` on owner order (2026-07-31); only historical plan records
reference it.

### Reference-check lessons (2026-07-31 execution — read before running the check again)

1. **`prune-check.mjs` was O(candidates × repo) — FIXED at source 2026-07-31.** It re-walked and
   re-read the whole repo once per candidate; at 595 candidates it produced zero output in 25+ minutes
   and was killed. `scanRefs()` is replaced by `buildRefIndex()` (one walk, all stems) + `refsFor()`
   (per-candidate lookup, still excluding self-references), and `_archive` joined `SKIP_DIRS` so
   already-pruned content is never counted as a live reference. **612 candidates now complete in 90
   seconds.** Two operational notes for the next run: exclude bulk machine-output trees
   (`allure-results`, `test-results`) and check those as directories, and expect false positives —
   the checker matches the bare basename as a substring, so a candidate named `spec.json`, `csv.json`,
   or `console.log` matches nearly every source file. Read the cited file before acting on a verdict.
2. **A slop-inventory citation is NOT a live reference.** The first pass "found" 74 referenced files;
   ~19 of those were cited only by documents whose purpose is to LIST slop —
   `PLAN_CLIENT_SURFACE_PURGE_AND_WRITE_FENCE.md` (this file), `_REPO_SLOP_FINDINGS.md`,
   `PLAN_REPO_SLOP_SWEEP.md`, `PLAN_ENCORE_NM2272_NM2273_GRAFT_AND_SHIP.md` §"Junk is flagged".
   Exclude those from the scan, or a purge can never complete — the delete list keeps citing itself.
3. **Genuine references did exist and mattered.** 59 archived files were cited by real work: pending
   subplans (`SUBPLAN_59D_OVERRIDE_NONCODE_FOOTPRINT`, `PLAN_ID_NAMING_AUDIT_AND_REMEDIATION`,
   `PLAN_ENCORE_DELIVERABLE_REMEDIATION`) and by walk-coverage machinery
   (`scripts/walk-coverage/fixtures/kernel-oracle-fixtures.json`, `freeze-nm2271-inputs.mjs`,
   `domain-invariants.json` cite walk-evidence + field-inventory + old-site-baseline files by path).
   All 59 were restored to their original paths. **The lump verdict would have broken the coverage
   engine** — this is the third time in this purge that a group-level judgement hid live files.
4. **Post-move audit that proves it:** `git ls-files -- clients/encore` → for each, does it exist on
   disk, and if not, is it at the same relative path under the archive? Result after the corrected
   run: 635 tracked, 320 absent, 320 found in the archive, **0 unexplained**. `clients/encore` =
   **175 MB**, down from 2.2 GB.

5. **What the fixed checker found on the rerun** (612 candidates, 90s): 484 safe, 48 untouchable
   (modified in the last 24h), 80 live-ref. Of the 80, most were substring artefacts; **9 paths had
   genuine citations and were restored**: `reports/bugs/` (the bug-baseline gate and four pending
   plans read these), `reports/walk-coverage/` (`accept-denom.mjs` + walk-coverage fixtures),
   `reports/label-inventory.txt`, `.playwright-cli/multi-loc.js` (two pending subplans),
   the id-audit trio (`id-rename-map.json`, `baseline-testrail-dump.json`, `dump-testrail.mjs` —
   consumed by `remediate.mjs`/`fix-offbyone.mjs` under PLAN_ID_NAMING_AUDIT_AND_REMEDIATION),
   `clients/encore/specs_planning/_internal/evidence-cp-override-2026-07-13/raw-evidence.md`, and `scripts/walks/`.

**Commit discipline for this plan and for the session that opened it**: the working tree currently
carries ~125 modified files from **four concurrent sessions**, and HEAD is on
`checkpoint/q123-slop-wave-2026-07-30`, not `main`. Staging is **path-explicit, per session's own
files**. No `git add -A`. No branch switching while other sessions hold the tree. Publishing (push)
remains the owner's, never an agent's.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| OWNER | census, RCA set, both fence arms, retention policy, size governor, ramp config, archive batches | `clients/encore/specs_planning/_internal/client-surface-census-2026-07-30.md`<br>`.claude/hooks/lib/check-client-surface-write.mjs`<br>`.claude/hooks/lib/check-client-surface-size.mjs`<br>`.claude/retention-policy.json`<br>`.claude/guardrail-config.json` | `node .claude/hooks/lib/check-client-surface-write.mjs --self-test` exits 0<br>`node .claude/hooks/lib/check-client-surface-size.mjs --self-test` exits 0 |
| WATCHDOG | slop findings table over the tracked set | (skipped: findings are recorded inline in the census file's disposition column rather than a separate WATCHDOG table, so one artifact carries both) | census file has a non-empty disposition for every row |
| GARDENER | archive-moves of AGENT-ONLY-ROT and SLOP |  `_archive/client-surface-purge-2026-07-31/` | `node scripts/prune-check.mjs` reports zero live refs |
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
- [ ] **Arm A** exists, self-tests green, emits fire telemetry, and is recorded in `.claude/guardrail-config.json` with `ramp_started` / `ramp_target` / `ramp_note`.
- [ ] **Arm A** proven by live fire: a deliberate write to a non-allowlisted path under `clients/encore/` is announced (or denied, post-ramp), with the telemetry line pasted.
- [ ] **A1–A4 each proven by live fire at `deny`** — one violating write per class, run for real, verdict pasted: `clients/encore/clients/x.md` (self-nesting) · `clients/encore/.claude/state/y.log` (new dot-dir) · `clients/encore/scratch.js` (client-root file) · `clients/encore/anything.zip` (in-place archive). A self-test that never executed the deny branch does not satisfy this row.
- [ ] **A1–A4 proven to DISCRIMINATE** — in the same run, `clients/encore/src/pages/x.page.ts` and `clients/encore/tests/x.spec.ts` are ALLOWED, verdicts pasted. All-deny is as broken as all-allow.
- [ ] **A1–A4 carry no agent-reachable override** — grep the gate source for the LR-043 handshake and confirm these four classes do not consult it; the only bypass is an owner-edited lock-path file.
- [ ] **Arm C** — `copilot-worker.sh` refuses a ticket whose `OUTPUT (LITERAL ABSOLUTE)` is missing or relative; proven by dispatching one such ticket and pasting the refusal.
- [ ] **B1** proven by live fire on both shapes: a `*.zip` write under `clients/encore/` and an `allure-results/` write under `specs_planning/` each produce a telemetry line. Both pasted.
- [ ] **B2** — every accumulating directory named in the census carries a retention-policy row; any directory with no row is reported as a finding rather than silently omitted.
- [ ] **B3** — the size governor runs at session end, compares against recorded budgets, and its output is pasted for a session where at least one directory is over budget. It deletes nothing.
- [ ] `reports/` is dispositioned per sub-directory (measurement done: `allure-results` 794 MB + `allure-report` 111 MB = 97.6%). Retaining raw results, a rendered Allure report, an HTML report and a JUnit XML simultaneously is either justified in writing or reduced.
- [ ] The ~300 MB of `specs_planning/_internal` not attributed to `allure-results` is measured and dispositioned.
- [ ] `_internal.zip` (419 MB) is opened far enough to say what it archives and whether anything in it exists nowhere else, **before** it is proposed for archive-move.
- [ ] The 450-tracked-files-inside-an-ignored-directory state is resolved: each tracked path is either a deliberate re-include listed explicitly in `.gitignore`, or untracked. `git add` on `specs_planning/` no longer requires `-f` for the deliberate set.
- [ ] The doubled `clients/encore/clients/` path is resolved and its root cause named with file:line or equivalent evidence.
- [ ] Zero files deleted by any agent. Every removal is archive-move + prune-check + owner confirmation, with the confirmation quoted.
- [ ] `npm run client:ship -- --client=encore --out=<temp>` still succeeds and its deny-list check passes.
- [ ] `/final-q` verdict block emitted per LR-042.

---

## Handoff

Chat only, per `feedback_handoff_in_chat_only.md`. Reports outcomes, not obstacles (LR-039).
