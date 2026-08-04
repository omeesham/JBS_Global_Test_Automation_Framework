# SUBPLAN — /oneliners auto-relearn (close the last open gap)

**Status**: DONE
**Executed**: 2026-07-26
**Identity**: OWNER
**PermissionMode**: acceptEdits
**Parent**: PLAN_ONELINERS_RUTVIK_CLONE (closed 2026-07-26 — this subplan is the named recipient of its single open item)
**Authored**: 2026-07-26

> **Path convention for this plan**: every machine-local artifact is named descriptively (e.g. "the
> rebuilder", "the output style file"), never as an absolute home-directory path. Those paths are
> outside the repo and unresolvable to the closure validator; citing them as paths fails check C3.
> This convention is deliberate, learned from the parent plan's closure remediation.

## Bootstrap (read before executing)

1. Root `CLAUDE.md` — Supreme Rules, Karpathy quality rules, delegation posture.
2. The parent plan in `plans/done/PLAN_ONELINERS_RUTVIK_CLONE.md` — §3 architecture, §6 guardrails.
3. `.claude/skills/ultra-agents/worker-ext.md` — delegation, protected-file discipline, receipt format.
4. Memory: the corpus-filter lesson (three classes of machine text) and the one-file-per-dispatch
   worker rule. Both are load-bearing here.

## 1. The gap, stated plainly

The parent plan shipped a global, default-ON switch that makes chat replies compact and written in
Rutvik's own voice. Prompt capture works everywhere. Staleness is counted. **Nothing rebuilds the
voice card from the captured messages.** The card was hand-built once; it is frozen. The only
"refresh" mechanism was a text nudge at 200 new rows telling the session to dispatch a worker —
which (a) needs a human to notice it, and (b) only works inside this repo.

Rutvik's requirement was explicit: learn "dynamically and continuously", "automatically not just
when i ask for it", and self-heal. A frozen card meets none of that.

## 2. Design decisions (and why)

**D1 — Deterministic extraction, not an LLM rebuild.** The rebuilder counts; it does not reason.
Every exemplar quote is sliced out of the corpus and then independently re-proven to be an exact
substring of it. Rationale: the dominant defect in the hand-built card was *fabricated quotes* —
three review rounds were needed to catch that only 2 of 10 sampled quotes were real. A deterministic
extractor is structurally incapable of that failure. Secondary wins: zero token cost, zero auth
(the parent plan's final proof was blocked for hours by an expired CLI token), runs in every
project, and is testable.

**D2 — Split the style file into a stable half and a generated half.** Qualitative judgments (voice,
lexicon, orthography, interaction moves, negative rules) and the whole Reply Contract and Guardrails
are stable and human-authored. Only a sentinel-delimited data block is machine-regenerated. A
validation gate asserts the bytes outside the sentinels are byte-identical after every rebuild, so a
bad regeneration is bounded — it can never damage the honesty floor or the anti-caricature rules.

**D3 — Seed corpus copied out of the repo.** The 3939-row machine-verified corpus lived in an
untracked repo scratch directory that could be garbage-collected. It is now copied into the
user-level Claude config directory (hash-verified identical), so the rebuilder has no repo
dependency and requirement "works in all projects" actually holds.

**D4 — Trigger from the existing prompt hook, detached.** The hook already runs on every prompt in
every project. At the staleness threshold it spawns the rebuilder detached and returns immediately,
so prompt latency is unaffected. A lock directory prevents concurrent rebuilds. Threshold drops from
200 to 40 new messages — roughly daily for his volume, which is what "day to day" requires.

**D5 — Recency-weighted, bucket-balanced, profanity-capped exemplars.** Newest messages weigh 3x the
oldest so the card stays current. Exemplars are drawn round-robin across move-types (approval,
question, criticism, urgency, directive) so the card shows his range rather than eight variations of
one mood. The count of profane exemplars is capped at the corpus's own profanity rate. Without that
cap, a recency pass over one frustrating week yields a maximally angry card — and the consumer of
the card mirrors its register back at him.

**D6 — Secret-shaped rows are rejected.** The card is a file on disk. A new reject class drops any
message matching credential patterns or containing a long opaque blob. This did not exist in the
capture filter and is a real gap being closed here, not a restatement.

## 3. Scope

IN: the rebuilder script; an independent contract test battery; the style-file restructure; the hook
trigger change; the toggle skill's new manual `relearn` subcommand and richer status; the seed
corpus install; one real end-to-end rebuild against live config.

OUT (explicitly, so it is not mistaken for done): expanding the style beyond chat scope; the
email-voice use case; any change to the Reply Contract's line caps; any transcript re-mining.

## 4. Steps

| # | Step | Owner | Delegated |
|---|---|---|---|
| 1 | Copy the machine-verified corpus into the user-level config as the frozen seed; verify by hash | OWNER | no — global config is Claude-only |
| 2 | Restructure the output style: stable half + sentinel-delimited generated block | OWNER | no — global config is Claude-only |
| 3 | Author the rebuilder from a Claude-authored spec | worker | yes — ticket `TICKET-oneliners-relearn-build.md` |
| 4 | Author an independent contract battery, written blind against the same spec | worker | yes — ticket `TICKET-oneliners-relearn-battery.md` |
| 5 | Cross-family adversarial review of both, plus the hook diff | reviewer | yes — different vendor family than the authors |
| 6 | Run the battery against the rebuilder; bounce on any failure | worker | yes |
| 7 | Edit the prompt hook: detached spawn + lock replaces the text nudge | OWNER | no — protected control file, needs an audited grant |
| 8 | Update the toggle skill: `relearn` subcommand, last-rebuild in status | OWNER | no — skill definition is protected |
| 9 | Install the reviewed rebuilder into the user-level config and run it for real | OWNER | no — writes global config |
| 10 | Prove the switch still behaves: ON vs OFF, and no style leakage into code | OWNER | no — needs the real session |

## 5. Acceptance

A1. The rebuilder exits 0 on a valid fixture and leaves every byte outside the sentinels identical.
A2. It exits 1 and writes nothing when any gate fails (missing sentinel, no corpus, too few quotes).
A3. Every exemplar in the produced card is an exact substring of the corpus, proven by a check
    independent of the rebuilder's own output.
A4. No exemplar contains machine-injected text, a filesystem path, or credential-shaped text.
A5. The independent battery reports at least 24 cases and demonstrably FAILS a deliberately broken
    stub — a battery that cannot fail a broken target proves nothing.
A6. The hook spawns the rebuilder without measurably delaying prompt submission, and never throws.
A7. A real rebuild runs against live config and the switch still answers ON-style and OFF-style
    correctly afterwards.
A8. The staleness counter resets to 0 only on a successful install, and is left untouched on failure.

## 6. Risks

R1 — A bad rebuild ships a degraded card silently. Mitigated by the six gates, the byte-identity
check on the stable half, backups of the previous card, and "write nothing on failure".
R2 — Concurrent sessions rebuild simultaneously. Mitigated by an atomic lock directory with a stale
timeout.
R3 — The rebuilt card takes effect only in the NEXT session, because output styles load into the
system prompt at session start. This is inherent to the mechanism, not a defect; it is stated here
rather than papered over.
R4 — The threshold of 40 is a judgment call, not a measurement. If it proves too chatty or too slow
it is a one-number change; that is fine-tuning, not a design flaw.

## Per-Identity Satisfaction

| Identity | Applies? | Concrete Deliverable |
|---|---|---|
| HUNTER | no | (skipped: no requirements intake — the parent plan already captured and locked the requirement set with Rutvik directly) |
| GIVER | yes | `.claude/state/ua-worker/chips/oneliners/ARM-AUTO-REBUILD.md` |
| BUILDER | yes | `.claude/state/ua-worker/chips/oneliners/tickets/TICKET-oneliners-relearn-build.md` |
| HEALER | no | (skipped: no failing spec or defect under repair — this is new construction, not a heal) |
| WATCHDOG | yes | `.claude/state/ua-worker/chips/oneliners/tickets/TICKET-oneliners-relearn-battery.md` |
| GARDENER | no | (skipped: no framework hygiene sweep in scope — the only cleanup is the nudge line this plan replaces) |
| OWNER | yes | `.claude/state/ua-worker/chips/oneliners/staged-hook/oneliners-style.mjs` |

## Deviations

**D-1 — Step 7 (the automatic trigger) is BLOCKED by a safety gate, not by difficulty.**

The plan assumed the prompt hook could be edited under an audited grant. It cannot. A separate
Tier-2 state gate (`G1-TP1`, in the delegation-envelope hook, spec `SUBPLAN_ASSISTANT_LAYER_HARDGATES.md`)
denies every write under the hooks directory *unconditionally*: the deny fires before the mode check
and the function contains no grant branch at all. Its own message says "Rutvik GO + SELF_GRANT",
but no code path accepts one. That is correct design, not a bug — the gate protecting the hook layer
must not be openable by an agent editing the hook layer, or it protects nothing. A scoped
`SELF_GRANT` was minted and is genuinely unusable here; this is recorded rather than worked around.

Consequence: the rebuilder, its tests, the restructured style file, the seed corpus, and a manual
trigger all ship. **The automatic firing does not.** Two ways to arm it, both needing one word from
Rutvik because both are persistent-configuration changes:

- **(a) Hook trigger** — the designed path. He applies the prepared patch (or grants the gate an
  exception once). Fires on prompt volume, so it tracks how much he actually writes.
- **(b) OS scheduled task** — a daily job that runs the rebuilder directly. Touches no protected
  state, costs zero tokens, and runs no matter which project he is in. Simpler and more robust.

Recommendation: **(b)**. It is less machinery, cannot thrash, cannot slow a prompt, and matches
"day to day" more literally than a volume counter does.

Until one is armed, the honest status is: the card regenerates **on request** (`/oneliners relearn`),
not on its own. That is stated plainly rather than reported as done.

**D-2 — Step 7 unblocked by Rutvik personally, exactly as the gate intended.** He chose weekly-on-
session-start over both original options — a better trigger than either: it only fires when he is
actually working, needs no scheduler, and a skipped week self-corrects on the next session. He also
asked for it to run as a delegated subagent; that was declined with reasons and he accepted. A model
in this loop would cost tokens weekly and could invent a quote he never wrote, which is precisely
the failure the deterministic design exists to prevent. It spawns the counting script instead.
He applied the patch himself with a prepared one-liner; the live hook was then hash-verified
identical to the staged version, syntax-checked, and confirmed to no longer carry the old nudge.

## Status at hand-off (2026-07-26, session ended for travel)

**Shipped and verified live:**
- Seed corpus (3939 rows) in user-level config, hash-identical to the machine-verified source.
- Output style restructured: stable half (contract, judgments, guardrails) + sentinel-delimited
  generated block. Currently carrying the 8 previously-verified quotes. The switch works today.
- Weekly session-start trigger armed in the prompt hook, hash-verified, behaviour-tested across
  five cases (announce, warn-after-2-failures, silent-when-current, capture, garbage-stdin).
- Toggle skill carries `/oneliners relearn` and a status line that states plainly that automatic
  rebuild is not yet live.

**NOT shipped — deliberately:**
The rebuilder is **not installed**. It sits in repo scratch at 11/24 mid-fix. The hook therefore
no-ops: it checks for the script, does not find it, and does nothing. Zero risk in this state — the
feature behaves exactly as it did before this session, with the trigger pre-armed for when the
script is clean.

**Why it is not installed:** a cross-family adversarial review returned BOUNCE with five defects,
two of them serious:
1. A message containing a line break could be rendered onto the card as text that exists nowhere in
   his writing (`yes` + newline + `no` printed as `"yes / no"`). Caused by the dispatcher's own spec,
   which validated the pre-render value while the card displayed the post-render one. This is the
   exact fabrication class the whole design exists to prevent.
2. A message containing the card's own sentinel string installs a second sentinel and permanently
   breaks every future rebuild. Reachable in ordinary use — anything pasted into chat becomes corpus.
3. A credential split across two lines evades the secret filter.
4. The frontmatter flag is accepted from anywhere in the file rather than the frontmatter block.
5. `--dry-run` writes the log on a gate failure, which the weekly trigger reads.

**Update, later the same session (after Rutvik left):** the five-defect fix landed and **all five
were independently re-proven fixed by the dispatcher's own hostile probe**, not accepted on the
worker's report:

| Defect | Probe result |
|---|---|
| 1 — rendered quote must be verbatim | multiline row `yes\nno` → 8 quotes, 0 containing ` / `, 0 non-verbatim vs corpus re-read from disk |
| 2 — sentinel poisoning | rows carrying BEGIN and END sentinels → installed file has exactly 1 of each, both runs |
| 3 — split secret | newline-broken opaque blob and `sk-` token → 0 leaked, 8 quotes still produced |
| 4 — frontmatter flag position | flag in body but not frontmatter → exit 1, file byte-unchanged |
| 5 — dry-run purity | dry-run with failing gates → `rebuild.log` never created |

The 24-case battery also reports 24/24 against the fixed file, but that is only a no-regression
signal: those 24 cases test none of the five defects. Cases 25–29 (`TICKET-oneliners-relearn-battery-r4.md`)
are the real coverage and had not landed when the session closed.

A round-2 cross-family review was dispatched (`TICKET-oneliners-relearn-review-r2.md`), aimed
specifically at what the repair might have broken — over-rejection by the sentinel filter, ordinary
prose tripping the whitespace-collapsed secret check, and the single-line restriction starving the
exemplar pool into a permanent failure. Precedent says this matters: round 1 found five holes in a
file that looked clean.

**Still deliberately NOT installed.** Waiting a week for a slightly stale card costs nothing; a bad
install is exactly the "you said it was done and days later I found out" failure this whole design
exists to avoid.

**Next session, in order:** read the round-2 verdict and the r4 battery result; require 29/29 plus
1/29 against a no-op stub and an ACCEPT verdict; then install the script into the user-level config
and run it once for real. The trigger needs no further action — it activates the moment the script
exists.

## Execution Summary

Shipped complete and proven end to end. The voice card now regenerates itself from Rutvik's real
messages, weekly, with no action from him.

**Delivered**
1. Frozen 3939-row seed corpus copied into user-level config, hash-verified identical, removing the
   last dependency on an untracked repo scratch directory.
2. Output style split into a stable half and a sentinel-delimited generated block, so a bad
   regeneration can never damage the reply contract, the honesty floor, or the anti-caricature rules.
3. Deterministic rebuilder (no model call, so it cannot invent a quote), authored from a
   Claude-written spec via `.claude/state/ua-worker/chips/oneliners/tickets/TICKET-oneliners-relearn-build.md`,
   installed to user-level config and run for real.
4. Independent 29-case contract battery, authored blind against the same spec by a second agent:
   `.claude/state/ua-worker/chips/oneliners/out-relearn-battery/test-rebuild-contract.mjs`. Verified
   1/29 against a do-nothing stub, so it cannot pass vacuously.
5. Weekly session-start trigger, applied by Rutvik himself with a prepared command because gate
   `G1-TP1` denies all agent writes to the hooks directory. Staged patch:
   `.claude/state/ua-worker/chips/oneliners/staged-hook/oneliners-style.mjs`.
6. `/oneliners relearn` manual trigger plus an honest status readout in the toggle skill.

**Proven, by the dispatcher's own probes rather than worker reports**
- Trigger fires at 25 days stale and stays silent when the card is fresh.
- First real run: 3966 rows loaded, 0 parse skips, 3793 surviving, 8 exemplars, all six gates PASS.
- Every displayed quote is an exact substring of the corpus, re-read from disk.
- Backup taken, stale counter reset to 0, no lock left behind, all 7 user settings intact.

**Defects found and closed** — 1 by the battery, 5 by round-1 review, 3 by round-2 review, 2 by
direct probing. The two most serious: the card could display `"yes / no"` for a message actually
written as two lines (fabrication, caused by this plan's own spec), and a pasted sentinel string
could double the marker and brick every future rebuild.

**Rounds spent on one filter: four.** Reject counts went 548 → 481 → 480 → 136. The first three
specs were guessed; only the fourth was derived from measuring the corpus. Recorded as a lesson
rather than smoothed over — see the Deviations section.

**Known limitation, deliberately accepted**: 136 rows (~3%) are still discarded as secret-shaped.
All 136 were read individually; none is a credential — they are long plan names and URLs carrying a
digit and an uppercase letter. No security exposure, no visible effect on the card. Refinement
handed to a named follow-up task rather than left as prose.

## Deviations (process lessons)

**L-1 — a count can hide a bug for three rounds.** 548 → 481 → 480 looked like progress and was
noise. The bug only became visible when the rejected rows were listed and read. Every ticket after
that demanded the survivors be enumerated, not counted.

**L-2 — three consecutive specs were wrong, and the worker was right every time.** It implemented
each faithfully. The failure was guessing the rule instead of measuring the data first. Once
measured (`'/' 301, '-' 255, '_' 210, '+' 3, '=' 1`), the correct rule was obvious in one pass.

**L-3 — a green test suite is not evidence about an untested defect.** The battery reported 29/29
while three blocking defects were live. The round-2 reviewer stated this explicitly and was right.

**L-4 — one adversarial pass is not enough.** Round 1 found five defects in a file that passed its
own tests; round 2 found three more in the repaired version, two of which were caused by the repair.
