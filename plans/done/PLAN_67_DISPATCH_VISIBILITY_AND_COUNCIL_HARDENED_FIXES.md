> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_67_DISPATCH_VISIBILITY_AND_COUNCIL_HARDENED_FIXES.md`. All context below.**
>
> 1. **Identity**: OWNER (framework/control work; no pipeline identities invoked).
> 2. **Skills**: /execute (orchestrator), /ultra-agents delegation via copilot-worker.sh, /regression-guard wraps builds, /audit verify at end, /final-q exit.
> 3. **Model + thinking + permission-mode**: per frontmatter below (LR-041).
> 4. **Dependency gate**: PLAN_65 + PLAN_66 are DONE in plans/done/ (both landed in commit 594de2d7c). HALT if absent.
> 5. **Context load**: this file in full + `.claude/rules/guardrail-policy.md` (LR-069) + `scripts/check-tc-has-fieldinventory.mjs` + `export_test_cases/to-xlsx.ts`.
> 5.5. **Browser tool**: none — no live-app interaction in this plan.
> 6. **Councils run BEFORE builds** — no build ticket dispatches until its council converged.
> 7. **Every dispatch in this plan MUST itself be visible**: tracked `run_in_background: true` Bash calls only — this plan's own subject matter. A detached dispatch while executing this plan is an S0 incident.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, activity-log row (LR-028+LR-037), move to plans/done/, reindex, scoped commit. **NO PUSH under any circumstances** — shipping stays Rutvik-invoked.
>
> **HALT + ASK RUTVIK** if: council seats still disagree on a client-facing or safety-tier point after round 3 / any gate-severity LOOSENING is proposed / scope grows >30%.

# PLAN_67: Dispatch Visibility Gate + Council-Hardened Fixes (rename-gate, exporter date churn)

**Status**: DONE
**Executed**: 2026-08-14
**Priority**: P0
**Created**: 2026-08-14
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: S0 anti-deception gate design + adversarial council judgment + multi-rule closure (LR-069/LR-055/LR-046) — executed inline by the owner session.
**PermissionMode**: auto
**BrowserTool**: none

---

## Context

Rutvik's order (2026-08-14, verbatim intent): *"block all ways of copilot delegation which are NOT visible to me in claude code … no agent can hide whats going on … it would be a deceptive fooling technique"* — plus council-harden two follow-ups so neither is a disguised gate-loosening: the field-inventory rename-gate fix (chip `task_bfda6ea3`) and the exporter `buildIsoDate` churn (recorded in PLAN_66).

Graduating incident (Sev S0 — deception/trust class): this session dispatched Copilot workers via shell `&` detachment inside foreground Bash calls — no Claude Code task tracking, no notification, invisible to the owner (mistake M4 in the 594de2d7c session's final-q). The sanctioned visible modes are: tracked background Bash (`run_in_background: true`, renders as a task + notifies) and plain foreground Bash (renders live, blocks until done). Everything else is an invisibility primitive.

Recon facts (verified 2026-08-14):
- `.claude/settings.json` PreToolUse matcher for shell gates is `Bash|mcp__Claude_in_Chrome__.*` — the **PowerShell tool is not matched at all** (existing Bash-side gates are silently absent there).
- Dispatch surface: `bash .claude/skills/ultra-agents/copilot-worker.sh --ticket … --agent …` (LOCAL-ONLY wrapper around the `copilot` CLI).
- `export_test_cases/to-xlsx.ts:529` `const buildIsoDate = new Date().toISOString().slice(0, 10);` consumed at `:708` (per-row "Last Updated" Notes/Reason col) and `:743` — every rebuild stamps today into cells, so content-identical rebuilds still churn git.
- LR-074 is free (0 hits across rules files); next plan number 67 is free.

## Council mechanics (applies to Phases V/R/B)

- **Seats**: `claude-opus-4.6` effort `max` (position/defense) vs `gpt-5.5` effort `xhigh` (adversarial attack) — cross-family per worker-ext routing (T3 vs T4). Dispatched via `copilot-worker.sh`, agents `council-worker`/`council-reviewer`, evidence under `.claude/state/ua-worker/chips/p67-visibility-0814/`.
- **Protocol per item**: round 1 opus position paper (grounded in real file:line reads — LR-020) → round 2 gpt attack (must hunt bypasses AND gate-loosening) → round 3 opus rebuttal/absorption if needed. Convergence = zero unrebutted CRITICAL/MAJOR attacks. Claude (owner session) judges; ≤3 rounds; residual safety-tier disagreement → HALT + one-liner to Rutvik.
- **Ticket doctrine injection** (/relevant): every ticket's DOCTRINE cites LR-069 (sev class, ramp, telemetry, bloat governor, §3.5 no-layering), LR-020 (verify anchors at the line, data-flow corollary), LR-001/LR-003 (signatures, no empty catch), worker mechanics (one file per dispatch, literal absolute output paths, tee, `set -o pipefail`, NO git stash/stage/commit, no sub-agents), and per-item context files.

## Phase V — Visibility gate (block invisible dispatch)

- **V1 (council r1, opus)**: threat-model position paper. MUST enumerate invisibility vectors at minimum: trailing/infix `&` detach, `nohup`, `setsid`, `disown`, `screen`/`tmux -d`, `start /b`, PowerShell `Start-Process`/`Start-Job`/hidden windows, `schtasks`/`at`/cron-like scheduling, wrapper-script indirection (write `x.sh` then detach it), `bash -c` nesting, env-var/path indirection to the dispatch script, node `child_process` `detached:true`, MCP scheduler tools, and the unmatched-PowerShell-tool hole. Then propose the gate: PreToolUse deny rules, matcher scope (`Bash|PowerShell`), fail policy (fail-CLOSED when the command references the dispatch surface; fail-OPEN otherwise), `dispatch_visibility_mode` knob in `.claude/guardrail-config.json` (S0 → lands `deny`), telemetry via `fireTelemetry`, false-positive analysis (`&&`, `2>&1`, `&` inside quoted strings, legit parallel `cmd1 & cmd2`). Seed position to attack: **detachment primitives are denied for ALL commands** (not only dispatch-referencing ones — wrapper indirection defeats reference-matching; `run_in_background: true` is the sanctioned alternative), and **PowerShell may never run the dispatch surface** (Bash-only dispatch). Also: decide repo-local `.claude/settings.json` vs ALSO mirroring into `~/.claude/settings.json` (all-projects coverage; control-file protocol applies).
  Two adversarial-audit findings the position MUST also cover: **(F1) detective layer** — preventive pattern-matching can never see inside wrapper scripts/npm scripts Claude authors, but every `copilot-worker.sh` run appends a provenance row (`--session-id`) to `.claude/state/ua-worker/ledger.jsonl` regardless of how it was launched; design a session-end reconciliation (ledger rows for this session vs dispatches visible as tool calls) that flags any invisible dispatch loudly (final-q Step 4.9 extension or Stop-hook) — prevention + detection, not prevention alone. **(F2) knob protection** — this is an S0 anti-deception gate: an agent-writable `dispatch_visibility_mode` knob would let the gated party ungate itself; the knob must be Rutvik-only (lock-path pattern like `.claude/closure-overrides.json`) or absent entirely (hard deny).
- **V2 (council r2, gpt)**: attack for bypasses the enumeration missed, over-blocking false positives, and any way the proposed gate itself could be silently disabled (knob laundering, hook chain ordering, fail-open abuse).
- **V3**: converge → frozen spec in chips dir.
- **V4 (build, sonnet-4.6 max)**: `.claude/hooks/lib/check-dispatch-visibility.mjs` + `.claude/hooks/dispatch-visibility-gate.sh` + fixture test `.claude/hooks/lib/test-dispatch-visibility-fixtures.mjs` (≥10 cases incl. allow-controls) + wiring: add to the existing `Bash|…` PreToolUse entry AND a **separate NEW matcher entry for `PowerShell`** carrying only this gate (F3: widening the existing entry would fire four untested sibling gates on PowerShell input — collateral risk; keep them untouched). LR-069 header (Sev S0, graduating incident above). Worker does NOT edit settings.json — it delivers the exact JSON edit; the owner session applies it (control file, Rutvik-ordered).
- **V5 (review, gpt-5.5)**: adversarial code review, re-runs fixtures itself.
- **V6 (owner)**: live trip probe pair — (deny) a real dispatch command with ` &` detach → expect PreToolUse DENY + `gate-fires.log` row; (allow) the same dispatch foreground `--help` and one tracked `run_in_background: true` no-op → both pass. Evidence tee'd to chips dir.

## Phase R — Rename-gate fix, council-hardened (no loosening)

- **R1 (council r1, opus)**: read `scripts/check-tc-has-fieldinventory.mjs` (gitOldContent ~L274 reads `HEAD:<newPath>` — empty for renames → false "all content new") + its test file + incident (commit 594de2d7c blocked; owner skip token consumed, audit row in `reports/diagnostics/fieldinventory-skips.log`). Position paper on the fix: resolve rename pairs via `git diff --cached --name-status -M`, read old content from `HEAD:<oldPath>` for R entries. MUST answer the loosening question explicitly: does pass-on-R100 create ANY laundering path (rename+edit same commit R<100, rename commit then edit commit, copy-then-delete instead of rename, case-only renames on Windows, whitespace-only deltas, module-name transfer losing inventory pairing)?
- **R2 (gpt attack)**: hunt gate-loosening + bypasses; freshness windows and deny posture MUST remain untouched.
- **R3**: converge → hardened spec.
- **R4 (build, sonnet)**: implement + extend `scripts/check-tc-has-fieldinventory.test.mjs` with ≥3 new classes: pure-R100 → pass; rename+content-block edit → violation under NEW module name; plain-A new TC md → violation (unchanged). Full existing test file stays green. Zero changes to skip-token logic, freshness, or deny default.
- **R5 (review, gpt)** → **R6 (owner)**: re-run tests; then dismiss chip `task_bfda6ea3` (superseded — fixed here).

## Phase B — Exporter buildIsoDate churn, council-fixed

- **B1 (council r1, opus)**: ground in `to-xlsx.ts:529/708/743` + `sp00-augment-logic.ts` + one committed workbook's actual cells. What does each date-consuming cell MEAN to the client? Options to weigh: (1) write-if-content-equal (skip writing a workbook whose non-volatile content is unchanged), (2) deterministic date derived from source content (e.g. the TC md's own last-change date — arguably the honest "Last Updated" semantic), (3) keep build-date but isolate it so diffs are reviewable, (4) drop the stamp (client-facing semantic change — flag). Constraint: "pass = as per previous deliveries" doctrine — no client-visible semantic break without flagging to Rutvik.
- **B2 (gpt attack)** → **B3**: converge; if the winning design changes client-visible semantics → HALT + one-liner to Rutvik BEFORE build.
- **B4 (build, sonnet)**: implement at source (no wrapper). Prefer unit-level determinism proof (pure-function test) over live rebuilds. If ANY workbook rebuild is required for verification: ticket MUST state the `.auth/encore-state.json` prerequisite (poison mechanism, PLAN_66) and the owner verifies resolved-cell distribution (103 Pass / 1 Skipped TC-CPR-OVR-040 / 0 Blocked) before accepting.
- **B5 (review, gpt)** → **B6 (owner)**: double-build byte-stability (or design-equivalent) proof recorded.

## Phase C — Closure

- LR-074 rule in `.claude/rules/guardrail-policy.md` (verify number still free at write time): visible-dispatch law — sanctioned modes, deny list, knob, telemetry, graduating incident. Memory: `feedback_dispatch_must_be_visible.md` + MEMORY.md line.
- Battery: fixture suites (visibility + rename-gate) green, `npm run test:xlsx-tripwire` green, `bash -n` both hook shells, `node scripts/lib/check-structural-names.mjs` exit 0, typecheck if TS touched.
- Plan DONE via closure gate (dry-run first), move to done/, reindex, activity-log row, /final-q v2. Scoped commit (never `git add -A`). **NO PUSH.**

## NOT touched

Ship scripts, `.githooks/` chain, delegation supervisor wires in `~/.claude/delegation/` (overlap checked by V1, not modified), client specs/test-cases, workbooks (except the B6-gated verification rebuild if the council mandates one), skip-token logic.

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |

(OWNER framework deliverables are governed by the Acceptance criteria below — hook lib/shell/fixtures, gate fix + tests, exporter fix + proof, LR-074, memory, plan artifacts.)

## Acceptance criteria

- [ ] Visibility gate denies every council-enumerated invisible vector; fixture suite ≥10 cases green incl. allow-controls.
- [ ] Live probe pair recorded: dispatch+detach DENIED (telemetry row in `.claude/state/gate-fires.log`) + tracked/foreground dispatch ALLOWED.
- [ ] PreToolUse matcher covers `PowerShell` via its own new entry (the pre-existing hole is closed without touching sibling gates).
- [ ] Detective layer designed + landed: session-end ledger-vs-visible-dispatch reconciliation flags any invisible dispatch (F1).
- [ ] The gate has NO agent-writable off-switch: knob is Rutvik-only lock-path or absent (F2).
- [ ] Rename-gate: 3 new fixture classes pass; full existing test file green; zero loosening (deny default, freshness windows, skip-token logic byte-identical in behavior).
- [ ] buildIsoDate: converged design implemented at source with determinism/stability proof; zero workbook content drift beyond the sanctioned date mechanism; any rebuild followed the auth-prerequisite + distribution-verify discipline.
- [ ] Councils: every CRITICAL/MAJOR attack has a recorded disposition (rebutted or absorbed) in chips dir; no unresolved safety-tier disagreement.
- [ ] LR-074 authored; memory written + indexed; chip `task_bfda6ea3` dismissed as superseded; battery green; activity-log row; /final-q emitted; scoped commit landed; `git log origin/main..HEAD` shows local-only (NO PUSH).

## Execution Summary

Run on 2026-08-14 as OWNER. Council shape: opus/sonnet authors, gpt-5.5 (effort xhigh) attacks, owner judges.

### Phase V — visibility gate

Two layers landed. **Preventive** (`.claude/hooks/lib/check-dispatch-visibility.mjs` + `dispatch-visibility-gate.sh` + fixtures) went through seven adversarial rounds; each round found a fresh bypass, which convicted pattern-enumeration as the design. The gate now declares the shell forms it parses and denies everything it cannot parse when a dispatch token is present — codified as LR-074 §74.3. A single `canonicalizePath` primitive and a single `executableOf` primitive over a quote-aware statement splitter replaced four layered matchers (LR-069 §3.5).

Owner-run probes, live against the real gate: 20/20 preventive cases correct, including all eight previously-confirmed bypasses (`FOO=1 copilot`, `( copilot … )`, backticks, `$( )`, `eval`, `bash -c`, `timeout`, plain `copilot`) and the package-runner family (`npm exec` / `npx` / `pnpm dlx` / `pnpm exec` / `yarn dlx` / `bunx` reaching `copilot`). Zero false denials across 26 real repository commands, including the verbatim `.githooks/pre-push` body, `npm run typecheck`, and `npm exec tsc -- --noEmit`.

**Detective** (`check-visibility-reconcile.mjs` + `visibility-reconcile.sh` + fixtures) matches ledger rows to visible tool calls one-to-one by `run_id`, requires the wrapper in executable position, and never counts an unmodeled context as visible. The real 18 MB session transcript reconciles clean; heredoc-wrapped, echo-quoted, and quoted-separator laundering each flag every row.

A cross-family review classified 17 remaining preventive allowances: 2 silent (closed above), 14 detected by the detective layer, 1 inert. `resolveRunnerTarget()` now serves both layers so a runner spelling cannot be closed in one and left open in the other.

### Phase R — rename gate

Accepted at verdict ACCEPT, 79/79 fixtures, with zero loosening: deny default, freshness windows, and skip-token behavior unchanged. A control probe refuted the build's own claim in the safe direction.

### Phase B — exporter

Four protections, each now provably breakable — a protection whose removal breaks no test was treated as absent:

| Protection | Status | Proof |
|---|---|---|
| Skip guard (`computeSkipEligible`) | HOLDS | Production guard funnels to one helper; deleting `blobIdsOk` fails `test:xlsx-dates` |
| Skip-path stale-split prune | **GAP found → closed** | New Test 10b; deleting the skip-path call fails it, restoring passes |
| `SPLIT_FILE_MAP` bijection | HOLDS | All three violation shapes hard-fail and name the offenders |
| S0 augmentation integration | **GAP found → closed** | New `S0-BIND` guard + Test 12; severing `augmentByTcId` aborts the build |

Two of the four were genuinely untested before this plan. The `S0-BIND` guard is the only production behavior change; a cross-family safety review judged it **SAFE** — `augmentByTcId` pre-populates one row per TC ID before any auth, Playwright, or registry step, so an empty map can only mean a severed integration, never a legitimate build.

### Battery

`npm run typecheck`, `test:xlsx-dates`, `test:xlsx-tripwire`, `check:structural-names`, `plans:validate-layout`, `plans:validate-closure:changed`, `verify-no-forbidden --staged-diff`, the pre-commit BUG-1 grep, and `verify:no-stale-refs` — all exit 0. No Playwright suite was run (standing constraint). Tracked workbooks are byte-identical to `HEAD`; no `*.xlsx` is staged.

### What is NOT done — read this before trusting the gate

1. **`.claude/settings.json` is NOT wired.** The gate is built, tested, and correct, but it is not switched on. The exact four-edit JSON diff is staged at `.claude/state/ua-worker/chips/p67-visibility-0814/SETTINGS-WIRING-PENDING-APPROVAL.md` awaiting Rutvik's separate GO. Acceptance criterion 3 (PowerShell matcher entry) is therefore **unmet in effect** — the entry is authored, not applied. Until wiring lands, both layers are dormant.
2. **The residual is permanent.** A process launched outside the wrapper whose command is assembled at runtime from character codes or base64 writes no ledger row and carries no readable name. Neither layer sees it. LR-074 §74.4 states this outright and no artifact from this plan may claim the class is closed.
3. **Orphan detection is detection, not prevention.** It makes a surviving worker visible after the fact; it does not stop one being created.

### Plan Deviations

- **D1 — S0 incident during execution.** Stopping a running dispatch killed only its tracked shell; `copilot-worker.sh` survived as an orphan for roughly twenty minutes, rebuilt all 34 workbooks under `clients/encore/testcases/` twice, deleted a probe file, and edited `export_test_cases/to-xlsx.ts` concurrently with the replacement worker, corrupting that worker's evidence. Found only by manual process enumeration. Contained: processes killed, workbooks restored and re-verified after a pause, contaminated review re-run on a clean tree. Closed by `classifyOrphans()` in the detective layer plus `scripts/kill-orphaned-worker.mjs` (`npm run kill:orphan`, print-only unless `--kill`). Recorded in `feedback_taskstop_orphans_the_worker.md`.
- **D2 — a stopped run leaves no ledger row at all.** Measured: `grep '"run_id":"p67-b23-funnel-0814"' ledger.jsonl` returns zero rows for a run that executed ~20 minutes. The wrapper writes its row on completion, so the ledger under-counts dispatches and any ledger-keyed reconciliation is blind to a stopped run. Two builds reasoned from the opposite assumption. Orphan classification is therefore process-based, not `ts_end`-based.
- **D3 — ticket sharding, not effort, fixes wall-ceiling deaths.** Four large review tickets died at the ceiling with empty reports while their ledger rows read `success`. The same work split into two-question tickets finished in minutes and found the two real exporter gaps. Large tickets in this series were a dispatcher defect, not a worker defect.

### Verification artifact

```bash
npm run typecheck && npm run test:xlsx-dates && npm run test:xlsx-tripwire && node .claude/hooks/lib/test-dispatch-visibility-fixtures.mjs && node .claude/hooks/lib/test-visibility-reconcile-fixtures.mjs
```

Expected: all exit 0; fixture suites report 163 and 53 passing respectively.

## Post-closure addendum — 2026-08-14, same day

Work continued after this plan was closed. Two commits landed against the gate — `373871096` and `46441ca14` — and they exist because the closure above was wrong in a way worth recording rather than quietly overwriting.

### Correction 1 — the "zero false denials" claim was measured against a blind corpus

The Phase V summary states zero false denials across 26 real repository commands, naming the verbatim `.githooks/pre-push` body. That is true as written and misleading as read. The `.githooks/pre-commit` body was **denied**, and so was ordinary English: `git commit -m "fix the crash at startup"`, `echo "look at this"`, a test filter containing the word "at". Nine executable names — `at`, `nohup`, `setsid`, `disown`, `coproc`, `screen`, `tmux`, `schtasks`, `start`, `wsl.exe` — were matched as free text anywhere in a command instead of in executable position. Wired on, the gate would have made a session unusable within minutes.

The 163 fixtures passed because **not one of them contained ordinary prose**. The corpus could not see the defect it existed to catch. Fixed in `373871096`: those patterns now resolve through `executableOf` per split statement; dispatch-argument detection ignores quoted text; an absolute path to the wrapper resolves through the single `canonicalizePath`; ANSI-C quoting is denied only on a risky escape. Fixtures 163 → 205, including every `.githooks/*` body read from disk at test time so they cannot drift.

### Correction 2 — `classifyOrphans` wording

The commit message for `3de7294e5` says `classifyOrphans` reports a worker that outlives its stopped dispatch. It does surface that case, but as `untracked`, not `orphan` — because a stopped run writes no ledger row at all (D2). The class is reported; the label in that sentence is imprecise. Recorded here rather than by rewriting history.

### What `46441ca14` added

The wrapper ledger at `.claude/state/ua-worker/ledger.jsonl` had **no write protection**: an agent could append forged rows so an unseen dispatch looked reconciled, or truncate the file to erase real ones. That matters because the ledger is the only evidence the detective layer has. Writes are now refused, reads stay open, and the wrapper's own append is unaffected — it happens inside the spawned worker, never as an inspected command.

Three spellings were missing from the process-creation list: the snake_case internal binding name for synchronous spawn, the sync exec-file helper (unreachable behind the previous word boundary), and the thread-module entry point.

### Plan Deviations (continued)

- **D4 — three dispatches died at exit 126; the cause was my own ticket text.** One ticket failed three times with `node: Permission denied` from the npm shim while 76 other dispatches that hour succeeded, two of them fired in the same second. A cross-family RCA pulled Defender Operational events 1116/1117 at 15:50:24, 15:52:04 and 16:09:24 — exactly the three death timestamps — classifying the copilot loader's command line as `Trojan:Win32/SuspExec.SE`. **Ticket text is passed on the process command line.** That ticket was the only one quoting literal process-spawn invocations, including an inline-eval one-liner spawning a process named `copilot`; Defender was behaving correctly. Re-dispatching the identical work with those APIs described rather than quoted ran to completion. Two corrections to the RCA's own conclusions were required: its "timing, not shape" reading cannot hold (two concurrent dispatches survived the same second), and its proposed one-shot wrapper retry on exit 126 would have burned credits against a deterministic block. No wrapper change was made. Recorded in `feedback_ticket_text_rides_the_command_line.md` — which also carries the sharper consequence: a secret in a ticket is readable by anything that can list processes.
- **D5 — the same false-DENY class recurred one round after being fixed.** Adding the three spellings above reintroduced it: `grep -rn "worker_threads" src/` and a commit message mentioning `execFileSync` were both refused, and the suite went green at 224 for the same reason it had at 163 — no prose in the corpus. Bounced back scoped to the class rather than the four cases found: all nine pattern entries now match only inside statements that actually evaluate inline code, and every entry carries prose cases that must pass, including one asserting that a note discussing these APIs can still be written. Fixtures 205 → 262. Per LR-069 §3.5 the prior fix is convicted, not layered over — the whole list moved, not the three new rows. Recorded in `feedback_a_guards_test_corpus_must_contain_what_it_must_not_block.md`.

## Prior-Fix Trial

The false-DENY class — a guard reading a *description* of a command as the command — recurred twice in one day after being fixed, so the prior fixes go on trial before anything new lands.

| Prior fix | What it did | Why it did not prevent this instance | Verdict |
|---|---|---|---|
| The 163-fixture corpus (`3de7294e5`) | Asserted gate behavior across 163 command shapes and claimed zero false denials over 26 real repository commands | `scoped-wrong` — every fixture was a *command shape*. None was ordinary English, a commit message, or a real hook body, so the corpus was structurally incapable of observing a prose false positive. It went green while the gate refused the word "at". | **CONVICTED** |
| Executable-position scoping of the detachment list (`373871096`) | Routed nine detachment executable names through `executableOf` per split statement | `different-sub-class` — it corrected the A1 detachment list only. The M2 process-creation list is a separate list that still matched against the whole command, so adding three spellings to it reproduced the class one round later. The fix holds for what it covered; its lesson was simply not carried across. | **SURVIVES** |
| The labor gate's compound-command splitter (`~/.claude/hooks/labor-gate.mjs`) | Splits a command on `&&`, `\|\|`, `;` and newline, then classifies each fragment by leading program | `scoped-wrong` — the splitter does not track quote state, so a multi-line commit message is chopped and a line of its body is classified as a standalone command. Every downstream layer is quote-aware; the first splitter is not. | **CONVICTED** |

**Where each convicted fix lived.** Stated in plain text so the closure validator can read them — it strips inline-code spans before scanning: the convicted corpus is .claude/hooks/lib/test-dispatch-visibility-fixtures.mjs:829, the pattern list it failed to guard is .claude/hooks/lib/check-dispatch-visibility.mjs:597, the sibling list already moved one round earlier is .claude/hooks/lib/check-dispatch-visibility.mjs:428, and the deleted whole-command scan is .claude/hooks/lib/check-dispatch-visibility.mjs:670.

The corpus conviction is anchored at `.claude/hooks/lib/test-dispatch-visibility-fixtures.mjs:829` — the first case of the prose block that had to be added, in a file that previously held 163 command-shape assertions and not one sentence of English. The mechanism it failed to guard is anchored at `.claude/hooks/lib/check-dispatch-visibility.mjs:597`, the process-creation pattern list, and at `.claude/hooks/lib/check-dispatch-visibility.mjs:428`, the detachment list that had already been moved to executable position one round earlier. The labor-gate conviction is anchored at `labor-gate.mjs:80` (absolute path `~/.claude/hooks/labor-gate.mjs`, outside this repo) — the quote-unaware compound-command splitter.

**Rewire, not layer.** The removal diff is real, not additive: `hasEncodedSpawn` at `.claude/hooks/lib/check-dispatch-visibility.mjs:670` no longer tests the pattern list against the whole command at all. That whole-command scan was **deleted** and replaced by a per-statement inline-eval gate (`isNodeInlineEval`, `.claude/hooks/lib/check-dispatch-visibility.mjs:614`), so every one of the nine entries changed behaviour — not just the three that were added. Nothing was left idling beside it. The convicted corpus was likewise replaced rather than extended: prose cases are now mandatory per entry, and the `.githooks/*` bodies are read from disk at test time so the fixtures cannot drift from the real hooks.

### Protection-parity table

Every protection the deleted whole-command scan provided, and where it lives now. A conviction may not drop coverage — this is the check that the rewire lost nothing.

| Protective function of the removed whole-command scan | Surviving mechanism after the rewire | Proof |
|---|---|---|
| Deny inline evaluation reaching a child-process API | `isNodeInlineEval` gate at `.claude/hooks/lib/check-dispatch-visibility.mjs:614`, applied per split statement | Fixtures M2-F01..F05, SPAWN-01..06; owner-run probe: direct `-e`, `--eval`, `-p` all DENY |
| Deny the same through a package runner | Same gate, executable resolved via `resolveRunnerTarget` before the eval-flag test | PROSE-DENY-01/02/07; owner-run probe: `npx node -e …` DENY |
| Deny the same wrapped in a shell invocation | Same gate, inner payload extracted from the `bash -c` wrapper | PROSE-DENY-03; owner-run probe: `bash -c "node -e …"` DENY |
| Deny an encoded/assembled payload (character codes, base64) | Retained as list entries, now scoped to eval context | M2-F04, M2-F05 |
| Incidentally denied a heredoc writing a spawner script | Retained — heredoc bodies remain an unmodeled context under LR-074 §74.3 | Owner-run probe: heredoc writing a spawner DENY; running it afterwards ALLOW, the documented §74.4 residual |
| Incidentally denied ordinary prose mentioning these APIs | **Deliberately dropped** — this was the defect, not a protection | PROSE-01..31 assert those commands must ALLOW |

The convicted labor-gate splitter has a tested patch and fixtures at `.claude/state/ua-worker/chips/p67-visibility-0814/C1-LABOR-GATE.md`; it is a control file and is **not** applied, so that conviction remains open and is recorded in `### Still not done` below rather than claimed as fixed.

### Still not done

1. **`.claude/settings.json` remains unwired.** The owner gave an in-chat GO on 2026-08-14. The second factor is absent: `~/.claude/delegation/SELF_GRANT` expired at 13:34:41, is scoped to `.claude/rules/guardrail-policy.md`, and its own reason line excludes settings wiring. Claude cannot author its own grant (LR-074 §74.1), so the gate stays dormant.
2. **A labor-gate defect of the same class is diagnosed but unpatched.** `~/.claude/hooks/labor-gate.mjs` splits commands on newlines and semicolons without tracking quote state, so a multi-line commit message whose body contains a command shape is read as that command — reproduced against the real module on this session's own blocked commit. A tested patch and fixtures exist at `.claude/state/ua-worker/chips/p67-visibility-0814/C1-LABOR-GATE.md`; it is a control file and waits on the same grant.
3. **The residual is unchanged.** LR-074 §74.4 still holds: a script written to disk and then run carries no readable token. Writing such a script by heredoc is refused; running it afterwards is not.

### Updated verification artifact

```bash
node .claude/hooks/lib/test-dispatch-visibility-fixtures.mjs && node .claude/hooks/lib/test-visibility-reconcile-fixtures.mjs
```

Expected: both exit 0; suites report 262 and 53 passing. (The figures in the original artifact above — 163 and 53 — were correct at closure and are superseded.)

## Handoff

Chat-only per LR-039: outcomes + next actions, no blocker prose. Deviations logged as D-rows in this file per the taxonomy.
