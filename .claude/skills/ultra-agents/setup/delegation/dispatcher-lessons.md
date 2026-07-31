# Dispatcher Lessons — learned the hard way; do not re-learn

> **APPEND POLICY**: `scorecard.mjs record` appends here on non-green outcomes where fault is
> classified as `dispatcher` or `env`. One entry per line; date-prefixed.
> Format: `YYYY-MM-DD | <fault-class> | <one-liner lesson>`
>
> **PRUNE POLICY** (D12c — 100-line budget): when this file exceeds 100 lines, consolidate at
> receipt time. Prune contradicted/stale lessons first (correctness requirement — a bad lesson
> replayed into the primer poisons every future dispatch, arXiv 2605.12978), then merge duplicates
> to shrink. Never prune a lesson whose failure mode is still live.
>
> **REPLAY**: the SessionStart primer injects this file verbatim under a "DISPATCHER LESSONS
> (learned the hard way — do not re-learn)" header (protected splice — separate Rutvik-gated
> primer edit wires the injection; until that lands, lessons are available for manual reference).

---

## Lessons

2026-07-11 | env | `scorecard.mjs record` requires `LEDGER_PATH=.claude/state/ua-worker/ledger.jsonl` when run from repo root; omitting it causes "run_id not found" because scorecard resolves the ledger to `~/.claude/delegation/` by default, which does not contain the run's row.
2026-07-11 | dispatcher | Dispatch cwd propagates to sub-dispatches: confirm `$REPO` and `$PWD` are the repo root before shelling the wrapper — the worker inherits the caller's cwd, so a wrong cwd silently breaks all repo-relative paths in the ticket.
2026-07-11 | dispatcher | Closure-gate C3 rejects `~/` home-dir shorthand in lesson text and artifact paths; write full absolute paths (e.g. `C:\Users\<user>\.claude\delegation\`) or repo-relative paths in all gate-consumed artifacts.
2026-07-11 | env | Shell-agnostic verify: prefer `node -e "..."` or PowerShell cmdlets over bash-only tools (`cat`, `grep`) in VERIFY commands — a bash-only verify silently skips on Windows and rounds ENV-BLOCKED to green without evidence.
2026-07-13 | dispatcher | Review-ticket git-status oracle must NOT demand "status shows ONLY the N built files": the repo is usually already dirty with unrelated changes AND state deliverables under .claude/state/ua-worker/ are intentionally gitignored (.git/info/exclude), so they never appear in git status. Correct oracle = per-file check: git check-ignore proves the ignored ones are ignored-by-design, git status --porcelain <one-scanner-path> proves the tracked one is untracked, and git status --porcelain scripts/run-relevant-scan.mjs proves the no-touch constraint. A whole-repo status diff is the wrong gate.
2026-07-13 | dispatcher | When a review ticket asks the reviewer to verify skill-compliance from the worker report, the worker report lives machine-local at ~/.claude\delegation\reports\<run-id>.report.md (OUTSIDE the repo) — a repo-scoped reviewer cannot find it. Either paste the report body into the review ticket or give the absolute path explicitly, else SKILL-COMPLIANCE bounces to 0/1 for a non-defect.
- 2026-07-15 (chief-guardrail-verify-0715): chief executed the verify battery itself (I0 solo, 76s, zero nested dispatches) instead of ticketing a worker + cross-family reviewer — NEVER-DO role violation; briefs must be enforced by interrogation and the digest rejected when VERIFY_ARTIFACTS is absent
- 2026-07-15 (verify-guardrail-xfam-0715): the copilot CLI enforces a minimum of 30 for max-ai-credits; a smaller cap kills the run before the model starts (dispatcher fault, not worker)
- 2026-07-15 (chief-runorder-sweep-0715): one chief hop reading 30 plans on gpt-5.5 xhigh burns 60+ credits in 2 minutes; sweep-scale scope must be decomposed into direct worker tickets or budgeted 200+, and the dispatcher owns that sizing call
- 2026-07-15 (sweep-a-0715): a 30-credit cap cannot fund a 5-7-plan research sweep with tee artifacts on this box; size credit caps to ticket scope (rule of thumb 30 per 2 plans) and prefer bash-heredoc scripts — a PowerShell tee block printed instead of executing
- 2026-07-16 (pbug-misc-0715): Multi-item bugfix ticket with heavy safety ritual under-runs at 40-credit cap: attempt 1 completed ~1.5 of 5 items then died; reviewer bounced. Dispatcher sizing fault — 60+ credits or split the ticket.
- 2026-07-16 (pbug-misc-0716-fix): Same ticket 2nd cap-death at 40 credits (1 item landed). Two consecutive under-runs = ticket/sizing fault; escalated off copilot to Claude-side Opus per Rutvik 2026-07-16 directive.
- 2026-07-16 (lcd01-surgery-0715): Run killed by prior session's process cleanup (PID match in process log); worker healthy mid-read. Env fault, not worker.
- 2026-07-16 (lcd01-surgery-0716): 3rd cap-death today on 40-credit context-heavy tickets: worker exits 'success' after context-read with zero edits. Context-read phase alone eats 40 credits on multi-file doctrine tickets — budget 80+ or escalate to Claude-side; ok:true+ask_open=missing-section is the cap-death signature.
- 2026-07-16 (lcd02-nudge-0716): 4th cap-death today: opus-4.6 build+test ticket died at 60cr in 242s (script+fixtures landed, test-runner never written); build tickets that include a test battery need 100+ credits or a split build/test dispatch
- 2026-07-16 (lifecycle-research-0716): gpt-5.5 shrank an explicit 5-10-search web lane to 1 search, kept it out of the deliverable, and reported clean with budget to spare; acceptance greps must probe the deliverable for the lane's tokens (URLs), never trust the report prose
- 2026-07-16 (lifecycle-research-0716-r2): Bounce ticket that quotes the reviewer's evidence verbatim + enumerates exact R2 scope turned a silent lane-skip into a clean 7-query completion in one attempt
- 2026-07-16 (lcd02-nudge-0716-r2): Cap-death bounce with a landed-vs-missing inventory let attempt 2 finish only the remaining scope in 227s at 100cr instead of rebuilding
- 2026-07-16 (pinj-phase4-draft-0716-r2): Reviewer-prescribed bounce (findings quoted verbatim + exact fix scope) fixed both defects in 90s at attempt 2; acceptance = machine-probes keyed to the reviewer's own findings
- 2026-07-16 (lcd02-nudge-0716-r3): Hooks built in a repo dir but installed to ~/.claude must derive repo paths from the payload cwd, never from __dirname — install-location relocation silently breaks __dirname-relative defaults
- 2026-07-16 (intplans-inventory-0716): Inventory research asserted wrong-missing (file existed) and wrong-exists (file absent) in the same run — VERIFIED cells must come from ls/stat output pasted at claim time, never from reading other documents' claims
- 2026-07-16 (intplans-inventory-0716-r2): Bounce quoting the cross-reviewer's 3 defects verbatim with exact fix scope produced a clean R2 in 196s; VERIFIED cells now cite ls/stat output pasted at claim time
- 2026-07-16 (lcd03-build-0716): 6th cap-death today: 120cr build died on the FINAL payload-fix call; probe payloads written via PowerShell double-quoted strings double-escaped the cwd (known file-based-probes lesson) — ticket DOCTRINE must carry the printf/fs.writeFileSync payload-authoring rule explicitly, not assume the worker knows it
- 2026-07-16 (lcd03-build-0716-r2): Landed-vs-missing bounce finished remaining probe-payload scope in 136s at 40cr; payload authoring rule (fs.writeFileSync/forward-slash cwd) now proven as DOCTRINE material
- 2026-07-16 (lcd04-build-0716): 7th cap-death: 3-target build (wrapper+config+nudge) + driver + 8 probes + 25-case regression exceeds 120cr — the 100-120 battery sizing is PER TARGET FILE; multi-target builds need 150+ or a split build/probe dispatch pair
- 2026-07-16 (lcd04-build-0716-r2): 8th cap-death, 2nd consecutive on this ticket: R2 at 60cr burned 454s on context-read (grown ticket + doctrine) and wrote ZERO files; two consecutive under-runs = escalate off copilot to Claude-side Opus (pbug-misc precedent, Rutvik 2026-07-16 directive)
- 2026-07-16 (pinj-canary-0716): 9th cap-death: 40cr research reading 5 doctrine files + full spec analysis left no margin for the report; doctrine-heavy research tickets need 60+ — AND the cap-death doubled as the canary's proof that the PINJ echo check catches missing DOCTRINE_READ
- 2026-07-16 (pinj-canary-0716-r2): Mechanical-completion bounce landed in 45s at 30cr; canary E2E converted CONDITIONAL to full PASS — echo check green on exact-string match
- 2026-07-16 (lcd06-build-0716): Cap-death #10 at finish line: 150cr enough to write all 5 build files but verify phase (node --check, P1-P7 probes, manifest, parity report) never ran; multi-target build+battery needs verify-phase headroom — either 180cr or split build/verify tickets
- 2026-07-16 (lcd06-build-0716-r2): Verify-only landed-vs-missing bounce completed at 60cr/378s — pattern holds: after finish-line cap-death, split the verify phase into its own small round instead of re-running the full build
- 2026-07-16 (lcd06-build-0716-r3): Reviewer-bounce fix round: 2 surgical defects + new probe at 60cr/197s clean — exact-fix bounce tickets (defect site + literal replacement + new probe spec) converge in one round
- 2026-07-16 (lcd07-build-0716): Cap-death #11 at 180cr: wrapper-scale 4-target build burned credits on deep base reads + encoding changes into a 34KB builder script, died before executing it; honest INCOMPLETE report with landed-vs-missing inventory — builder-script pattern makes the bounce cheap (just execute+verify)
- 2026-07-16 (lcd07-build-0716-r2): Cap-death #12 (2nd consecutive on lcd07 scope): worker found+authored the builder interpolation fix but died at 11 remaining credits despite 100 cap AND hit a copilot-env PowerShell permission wall on file writes — quota pool likely drained after 45+ runs today; escalating to Claude-side Opus per 2-death precedent
- 2026-07-16 (lcd07-canary-0716): Copilot CLI hard floor: --max-ai-credits must be >=30; a 10cr canary is rejected at arg-parse — canaries cost 30 minimum
- 2026-07-16 (lcd07-gatefix-0716): Cap-death #13: gate RCA+harness+fix on a 23KB hook needs 100cr+, 60 died during exploration — RCA-class tickets on dense single files size like builds, not like reviews
- 2026-07-16 (lcd07-gatefix-0716-r2): Cap-death #14 (2nd consecutive on gatefix scope): RCA correct + fix half-applied, then Windows node -e escaping wall broke the replacements — file-based edit scripts ONLY (known class, feedback_file_based_probes_only); escalating to Claude-side per 2-death precedent
- 2026-07-17 (ua1-coherence-gpt-0717): Cap-death 141.38/130cr on full-read of ~20-plan coherence corpus (gpt-5.5 xhigh); dispatcher under-capped, not worker defect; re-dispatch attempt 2 at 220cr
- 2026-07-17 (ua4-crudenum-0717): SWARM DIVISION shipped 3 lot-overlap defects + report pipe died empty; gpt cross-review caught overlaps; bounce fixed with scripted pairwise-intersection proof (all 0) + completeness proof (76/76)
- 2026-07-18 (ua2-partitioner-0718): Wall-ceiling 915s: 40-ticket batch-write died at end (known death pattern) + wrapper silently capped draft effort to medium against owner max-think law; r2 = frozen partition-map input, incremental per-file writes, explicit --effort max, --timeout 1800
- 2026-07-18 (ua2-lot01-0718): Membrane lot REJECT: self-admitted unread ranges on required files, missed 8-duty schema defects, proposed unsafe duty_stack lowercase delete (case-illusion — same file as uppercase per CEO hash proof); reviewer full-read supersedes, no redo
- 2026-07-18 (ua3-gates-0718): Executor skipped runnable hook fixtures as read-only and called browsertool gate disabled; reviewer ran them (browsertool 1/19 FAILS, settings.json still wires it). Never verdict DEMOTE/dead without executing the fixture battery.
- 2026-07-18 (ua2-lot08-0718): Executor reported approximate line counts (all 7 wrong vs measured) and falsely claimed 'exact diff blocked' when git diff ran fine; reviewer re-executed and found unique load-bearing content in the lcd07 bak. Approximations and false-blocked excuses on measurable facts = refuted.
- 2026-07-18 (ua-merge-findings-gapfill-0718): Worker spawned a fire-and-forget background sub-agent to do the whole job and exited its single turn — sub-agent orphaned, zero file writes, no parity report, exit 0 looked green. Tickets must forbid background self-delegation; single-turn workers must do the work in-turn.
- 2026-07-18 (slop2-LOT-06-0718): opus workers hang/die on a single batch grep over many basenames; incremental per-entry grep + incremental findings.md write is the cure (validated LOT-06 r2). Apply to all code/state opus lots.
- 2026-07-18 (slop2-LOT-02r2-0718): batch-grep death; incremental fix cured
- 2026-07-18 (slop2-LOT-04r2-0718): batch-grep death; incremental fix cured
- 2026-07-24 (council-recount-mini): recount extraction dropped all file:line keys (blank ': |' prefixes) so reconciliation emitted matched=0 of 29 — verdict invalid; filter also kept trigger-prose rows
- 2026-07-24 (ship-lint-fix): claimed all-38 reworded, 1 title hit survived + stalled pre-verification; edits ultimately proven green through bounce + cross-provider QA + E2E
- 2026-07-24 (gate-fix-a): Claimed --announce structurally cannot exit non-zero; bare appendFileSync to missing .claude/state dir threw ENOENT exit 1 — exit-safety claims need a missing-dir fixture proof
- 2026-07-24 (rca-sonnet-swap): Asserted the uncaptured link (pin=haiku) as ROOT-CAUSE after the runtime denied the decisive file read — a denied read demands HYPOTHESIS labeling, not assertion; CEO's own read refuted it
- 2026-07-24 (gate-fix-bounce-b): Removed a ticket-mandated element (path-deny) via ASSUMPTIONS-MADE instead of raising a pre-build ASK — deviations from explicit ticket constraints are ask-first, never assumption-smuggled (LR-070)
- 2026-07-24 (fix-tc065-drag): Walled mid-second-proof with no report file — proof-heavy tickets must write the report incrementally (diff+tsc first, run tail appended), which the b2 continuation ticket then mandated
- 2026-07-25 (oneliners-rev-b3): Reviewer tickets must carry the file-based-script rule too, not just worker tickets: rev-b3 burned 120cr authoring inline helper patches that embedded literally on Windows, then died before running any evidence. Order review tickets evidence-first (run checks, then write review) so a credit death still leaves proof on disk.
