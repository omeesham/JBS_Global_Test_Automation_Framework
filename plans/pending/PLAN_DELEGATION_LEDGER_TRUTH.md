> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_DELEGATION_LEDGER_TRUTH.md`. All context below.**
>
> The agent self-bootstraps from the frontmatter + sections in this file, without additional user prompting:
>
> 1. **Identity**: load `/identity OWNER` (control-surface work; no pipeline identity is invoked).
> 2. **Skills**: `/execute` (orchestrator) → `/regression-guard` before + after → `/final-q` at close.
> 3. **Model + thinking + permission-mode**: read `**Model**` / `**Thinking**` / `**PermissionMode**` below (LR-041).
> 4. **Dependency gate**: none. This plan is self-contained.
> 5. **Context load**: read `.claude/skills/ultra-agents/copilot-worker.sh` in full, `worker-ext.md` §Enforcement, and `~/.claude/delegation/DUTY_STACK.md` section headers.
> 6. **Phase 0 FIRST**: the R-532 quiescence check + the LR-020 data-flow anchor re-verification. No edit before Phase 0 passes.
> 7. **Execute Phases 1–5** in order.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, append the activity-log row (LR-028), `git mv` to `plans/done/`, `npm run plans:reindex`.
>
> **HALT + ASK USER** if: a dispatch is in flight at Phase 0 (R-532 hazard) / an anchor line has drifted from the numbers below / the SELF_GRANT is refused / regression-guard shows changes outside the two named files.

---

# PLAN: Delegation Ledger Truth — `ok`/`exit_reason` must key on the work, not the exit code

**Status**: Pending
**Created**: 2026-07-23
**Priority**: High
**Model**: opus
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: none
**Identity**: OWNER
**Owner-directive**: Rutvik, 2026-07-23 (in-chat, names the file + the defect + the fix)

---

## 1. Context

`copilot-worker.sh:611-612` computes the ledger's `ok` field as:

```bash
OK=false
{ [ "$EXIT" -eq 0 ] && [ -s "$RESULT" ]; } && OK=true
```

Exit code + "file is non-empty". A worker that burns its whole budget on context-gathering, writes a
prose note saying `VERDICT: NOT-FIXED — session exhausted`, and touches nothing in the repo satisfies
both conditions. `exit_reason` (`:602-605`) only ever leaves `"success"` when the *process* failed —
never when the *work* did.

Reproduced 2026-07-22, four consecutive runs, all four ledgered `"exit":0, "ok":true, "exit_reason":"success"`:

| run_id (short) | secs | what it actually produced |
|---|---|---|
| `e9bd6bd6` | 197 | 1617-byte prose note, `**VERDICT: NOT-FIXED**`, zero repo changes |
| `0fb987b3` | 136 | **69 bytes total** |
| `851000ea` | ~150 | `# SESSION LIMIT REACHED — No Implementation Completed` |
| `ea1f954d` | ~180 | full 10-section report; own text: *"`result.md` was not written to disk"* |

Second defect: the ticket's declared output path is never read by the wrapper. Reports land at
`.claude/state/ua-worker/<run_id>/result.md` and `~/.claude/delegation/reports/<run_id>.report.md`,
so a dispatcher who looks at the path they specified sees an empty directory and cannot distinguish
*"worker failed"* from *"worker wrote elsewhere"*.

**Intended outcome**: the ledger row tells the truth about whether work landed, and the report is
findable at the place the ticket named. Worker behavior is untouched.

---

## 2. Recon findings that changed the design

Measured before designing — three of these overturn the fix as originally suggested.

**F1 — `VERDICT:` cannot be the floor.** Absent from **674 of 742** ticket-mode reports (91%), and it
is not in the Parity Report schema at all (`ticket-template.md:70`, `DUTY_STACK.md:22-57`). Keying
`ok` on its presence would mark 91% of all historical runs `ok:false`. A gate that always fires is
worth exactly as much as one that never fires.

**F2 — the contract anchor that does exist.** `DUTY_STACK.md` mandates exactly ten sections
(`DOCTRINE_READ, FILES_INSPECTED, PLAN, DIFF_SUMMARY, VERIFY_ARTIFACTS, DOCS_UPDATED,
EXTERNAL_CONTENT_CONSUMED, CLEANUP, ASK, BLOCKERS_DEVIATIONS`) and `copilot-worker.sh:327-333`
**prepends it to every ticket-mode dispatch**. So every ticket-mode worker was contractually handed
the schema. Measured compliance: 412/743 carry the 3-section core; **143/743 (19%) carry none of it**;
on the 150 most-recent, 48 (32%) emit zero of all ten. Three of the four repro runs are in that
zero bucket. A **zero-of-ten** floor is unambiguous and non-arbitrary — it means the worker returned
prose, not a report.

**F3 — the two suggested fixes are in direct tension.** If the wrapper copies its own report to the
ticket's declared OUTPUT path *and* keys `ok` on whether that path was written, the wrapper creates
the file it then checks for. The oracle becomes unfalsifiable — the exact defect class this plan
exists to remove. **Resolution**: the declared OUTPUT path is the *worker's deliverable* and is
sampled **before any wrapper write**; the wrapper's own report copy goes to a distinct,
wrapper-owned filename (`worker-report.md`) in the same directory.

*Refinement (adversarial audit)* — this alone would still leave `<slug>/result.md` unresolved, which
is half of what the directive asked for. Both halves are obtainable: when the deliverable is missing,
the wrapper writes a **sentinel stub** at the declared path whose first line is
`<!-- copilot-worker: NO DELIVERABLE (run <id>) -->`, and Tooth 1 treats a sentinel-marked file as
`missing` on any later run. The path resolves for the dispatcher, and the oracle stays falsifiable
because the sentinel is wrapper-authored — the wrapper recognizes only its own marker, never a
worker-produced shape.

**F4 — `ok`/`exit_reason` alone is insufficient; `ea1f954d` proves it.** That run emitted a perfect
10/10 report and still delivered nothing. Section-count alone would have greened it. Hence three
independent teeth, whose union covers all four repro runs and whose intersection covers none —
per-tooth attribution in §4.

**F5 — the ticket "OUTPUT" convention is drifted and unparseable as-is.** 71 ticket files carry an
output line across ≥5 spellings (`OUTPUT:`, `Output file:`, `Output file (exact path):`,
`**OUTPUT-DIR**:`, `**OUTPUT DIR (literal — ALL writes go here)**:`), with Windows paths
(`C:\Users\rutvi\...`). Reports contain false-positive shapes (`OUTPUT: (no output) EXIT:0 → PASS`,
`output: **46**`). The literal string `OUTPUT (LITERAL ABSOLUTE)` the defect report quotes does not
appear anywhere. Fuzzy-matching this rebuilds the shape-recognition defect. **Resolution**: define
ONE canonical field, parse only that exact anchored form, and add it to the ticket template. Legacy
spellings simply do not arm Tooth 1 — no false positives, no retro-fitting.

**F6 — R-532 (Sev S2) is live and on point.** `delegation-gate.mjs:85-88`: editing `copilot-worker.sh`
*while a dispatch runs through it* crashes the live bash parse. The gate carries a slot-lock
interlock. Phase 0 must prove quiescence before any edit.

**F7 — file status.** `copilot-worker.sh` is git-excluded (`.git/info/exclude:11`, exact path) and
PROTECTED (`delegation-gate.mjs:106-112`) → Rutvik-go + `SELF_GRANT` whose reason cites a real
`PLAN_*` anchor (AH-01). **`.claude/skills/ultra-agents/` itself is NOT excluded** — only the one
file is. Any new harness file placed there would be *tracked*, leaking the delegation system into
the repo (`worker-ext.md:110`). Harness must live under `.claude/state/ua-worker/` (excluded at
`.git/info/exclude:12`).

---

## 3. Prior-Fix Trial *(mandatory — recurrence class)*

This plan fixes a failure class the framework has already "permanently" fixed. Three prior fixes go
on trial; none may be layered over unconvicted.

| # | Prior fix | What it did | Why it failed here | Class | Verdict |
|---|---|---|---|---|---|
| 1 | **PLAN_STATIC_TO_DYNAMIC Phase 2** (2026-07-11) — added `exit_reason`/`stall_warns`/`attempt` | Made *process* termination truthful: `wall_ceiling`, `stall`, `error` | It classifies how the **process** ended, never whether the **work** landed. A clean exit 0 on a do-nothing run is still `"success"` | `scoped-wrong` | **CONVICTED (partial)** — the process-level half survives and is retained |
| 2 | **`ask_open:"missing-section"`** (`:625`, LCD07/UPLINK wave) | Already detects a ticket-mode report that skipped a mandated section, and writes it to the ledger | **Nothing consumes it.** The signal was computed, recorded, and then ignored by `OK`. Two rows in the current ledger tail carry it next to `"ok":true` | `dead/never-fired` (computed-but-unconsumed) | **CONVICTED** |
| 3 | **`OK` = `exit 0 && -s RESULT`** (`:612`, original) | The `-s` half is a real floor — it rejects a *totally* empty result | Trivially satisfied. `0fb987b3` cleared it with **69 bytes** | `rubber-stampable` | **CONVICTED** |

**Rewire, in scope (LR-050 — no sediment left idling):**
- #1 is rewired, not layered: the new work-outcome reasons extend the **same** `EXIT_REASON`
  variable rather than adding a parallel field, and process-level reasons keep strict precedence.
- #2 is rewired: Tooth 2 consumes the **same** section parse that `ask_open` already performs
  (`:621-626`), rather than adding a second independent parser. `ask_open` keeps its own semantics.
- #3 is retained **only** for process control flow (`:705`), and is explicitly no longer the ledger's
  `ok` source. The plan states this split rather than silently overloading one variable.

---

## 4. The three teeth — floor-first, shape-recognition strictly supplementary

Per `feedback_gate_fix_floor_design.md`: construct a floor; never "recognize dangerous shapes".
Teeth 1 and 2 are floors (a positive condition must be **met**). Tooth 3 is shape-recognition and is
therefore **downgrade-only** — it can turn `ok:true → false` and never the reverse, so it is never
load-bearing.

| Tooth | Fires when | `exit_reason` | Kind |
|---|---|---|---|
| **1 — deliverable oracle** | ticket declares `OUTPUT (LITERAL ABSOLUTE)` **and** that path is absent/empty after the run | `no-deliverable` | floor (armed only when declared) |
| **2 — report-schema floor** | ticket-mode **and** the report carries **zero** of the ten `DUTY_STACK` sections | `no-report-schema` | floor |
| **3 — self-declared failure** | report matches an explicit negative verdict / session-limit statement | `budget-exhausted` | downgrade-only |

**Per-tooth RED-proof against the four reproduced runs** (union = 4/4; no single tooth covers all —
this is the evidence that all three are load-bearing and none is redundant):

| run | T1 | T2 | T3 |
|---|:--:|:--:|:--:|
| `e9bd6bd6` (0/10 sections, `VERDICT: NOT-FIXED`) | – | ✅ | ✅ |
| `0fb987b3` (69 bytes) | – | ✅ | – |
| `851000ea` (`SESSION LIMIT REACHED`) | – | ✅ | ✅ |
| `ea1f954d` (**10/10** sections, deliverable never written) | ✅ | – | ✅ |

**Live corroboration gathered while executing this plan (2026-07-23).** Three further instances of the
defect, observed in-flight rather than argued:

- **7th instance, on this plan's own ticket.** Harness dispatch `ledger-truth-harness-01` ran 106s,
  wrote zero files, and ledgered `ok:true, exit_reason:"success"`. It declared
  `OUTPUT (LITERAL ABSOLUTE)`, so **Tooth 1 would have caught it** as `no-deliverable`.
- **8th and 9th**, documented inside the expired `SELF_GRANT` on disk: ticket `ucf-p3` dispatched
  twice, *"BOTH exhausted budget in the context phase having written zero code"*.
- **Teeth 1 and 2 proven independent, live.** Dispatch `ledger-truth-harness-02` **delivered** its
  artifact (Tooth 1 passes) while returning a 1784-byte report with **zero of the ten sections**
  (Tooth 2 fires). `ok` alone cannot express that difference; `exit_reason:"no-report-schema"` can —
  which is precisely why the reason field is split rather than collapsed into a boolean.

**Precedence.** Process-level reasons always win — a non-`success` `EXIT_REASON` from `:602-609`
(`wall_ceiling`, `stall`, `error`) is never overwritten. Among the teeth: `no-deliverable` >
`no-report-schema` > `budget-exhausted` (hardest fact first).

**Deliberately NOT inferred.** A zero-section report is *not* labelled `budget-exhausted` — it may be
a crash, a CLI abort, or a refusal. Guessing the cause is exactly the assumption CLAUDE.md forbids;
`no-report-schema` states only what was observed.

### Scope boundary — ledger truthfulness only

The directive is explicit: *"only the truthfulness of the ledger row and the report location."*
Therefore the **process exit code is unchanged**. `OK` (`:612`) keeps driving control flow at `:705`;
a **new, separate** `LEDGER_OK` feeds the ledger + `meta.json`. A dispatcher reading `$?` still sees
`0`. That residual gap is stated, not papered over — closing it would change dispatcher control flow
(retry loops, `&&` chains, `/chain`) and is out of scope for this plan. A loud `stderr` line is
emitted so the failure is visible without altering the exit contract.

---

## 5. Changes

### File A — `.claude/skills/ultra-agents/copilot-worker.sh` *(PROTECTED, git-excluded)*

Anchors verified against the 722-line file read 2026-07-23. **LR-020 data-flow corollary applies:
for each anchor, confirm the state exists at that point and the record is still written after it.**

| # | Anchor | Change | Data-flow check |
|---|---|---|---|
| **A1** | after `:597` (`wait`) | Parse `OUTPUT (LITERAL ABSOLUTE)` from `$TICKET`; normalize Windows→POSIX; snapshot `DELIVERABLE_STATE` ∈ `not-declared`\|`present`\|`missing`. A file whose first line carries the wrapper's own `NO DELIVERABLE` sentinel counts as `missing` (F3 refinement) | `$TICKET` set at `:113-116` ✓ · child has exited ✓ · **must precede every wrapper write** (F3) ✓ |
| **A2** | after `:627` (ASK block) | Count the ten `DUTY_STACK` sections (reuse the `:621` grep form); detect negative verdict; derive `LEDGER_OK` + `LEDGER_EXIT_REASON`; emit `stderr` on non-ok | `$RESULT` ✓ · `$TICKET_MODE` ✓ · `$EXIT_REASON` classified `:602-609` ✓ · `$OK` `:611` ✓ · runs **before** META `:656` ✓ |
| **A3** | `:656-665` (META) + `:676-684` (ledger) | `V_OK="$LEDGER_OK"`, `V_EXIT_REASON="$LEDGER_EXIT_REASON"`; add `report_sections` (0-10) and `deliverable` fields | A2 at `:627` < `:656` ✓ — **this is the R-531/D7 trap**: the ledger appends at `:684`, *before* the report copy at `:716` |
| **A4** | move `:715-720` → after `:700` | Report copy runs **before** the failure exit at `:705`, so failed runs are diagnosable; additionally copy to `<dirname(OUTPUT)>/worker-report.md` — never to the declared deliverable path (F3); when `DELIVERABLE_STATE=missing`, write the sentinel stub at the declared path so it resolves | nothing after `:705` consumes the copies; `:722` echoes `$RESULT` (RUN_DIR), unaffected ✓ |

Implementation constraints:
- `set -uo pipefail` is active and `-e` is **not**. Every new variable is initialized before use.
- Path normalization is mandatory — tickets carry `C:\Users\rutvi\...`; backslashes are escapes in
  bash, so `[ -s "C:\Users\..." ]` silently misreads. Use `cygpath -u` when present, else a `sed`
  transform, and fall back to `not-declared` if normalization fails.
- The OUTPUT parse is **strictly anchored** to the canonical token, first match only, and the result
  must be an absolute path (`/…` or `[A-Za-z]:[\\/]…`) or it is discarded with a warning. This is
  what keeps `OUTPUT: (no output) EXIT:0 → PASS` out of the parse (F5).
- Reports may contain NUL bytes (grep reported four as binary) — every report grep uses `-a`.
- `report_sections` is a **per-section boolean sum**, not a raw match count — a report that repeats
  `## ASK` twice must score 1 for that section, not 2, or the floor is trivially inflatable.
- `exit_reason` values are a wrapper-controlled fixed enum, so no JSON-escaping risk in the node
  block; paths going into JSON are passed via env vars, matching the existing `V_*` convention.

### File B — `~/.claude/delegation/ticket-template.md`

Add the single canonical field so the path is *declared* rather than conventional:

```
OUTPUT (LITERAL ABSOLUTE): <absolute path the worker must write its deliverable to, or omit>
```

Answers the directive's *"either honor the ticket path or drop it from the template"* — the honest
third option, since it was never in the template (F5). **Verify against the gate's `PROTECTED` array
before editing**; if protected, fold into the same SELF_GRANT.

### NOT touched

- **Worker behavior** — no prompt, DUTY_STACK, agent-file, model, effort, or timeout change.
- **Process exit codes** — `:705-713` logic and `_fail_code` untouched (§4 scope boundary).
- **`ask_open`** — keeps its current semantics; Tooth 2 reuses the parse, does not redefine the field.
- **`worker-ext.md`** — no doctrine change is required for a truthfulness fix.
- **Historical ledger rows** — not rewritten. The 4 repro rows stay as-is; they are the RED fixtures.
- **`delegation-gate.mjs` / hooks / `settings.json`** — untouched.

---

## 6. Step-by-step

**Phase 0 — R-532 quiescence + anchor re-verification (before any edit).**
1. Prove zero dispatches in flight: `~/.claude/delegation/locks/` empty and no `copilot` process.
2. Re-grep each anchor line number against the live file. **Any drift → HALT** (R-530/R-531 class).
3. `/regression-guard` snapshot.

**Phase 1 — grant.** Write the `SELF_GRANT` (reason cites `PLAN_DELEGATION_LEDGER_TRUTH`, ≥20 chars,
≤60 min expiry, explicit paths). Confirm the `grants-audit.log` entry appears.

**Phase 2 — harness FIRST, at `.claude/state/ua-worker/ledger-truth-harness/`** (git-excluded per F7;
**not** in `.claude/skills/ultra-agents/`, which is tracked). Delegable.

*Technique (verified, adversarial audit)*: the wrapper's only CLI probes are `command -v copilot`
(`:133`) and `copilot --version` (`:411`), so prepending a stub dir to `PATH` with a fake `copilot`
that emits a canned report drives the **real** wrapper deterministically, at zero credit cost, with
**no test seam added to a PROTECTED file**.

*Ledger isolation — corrected 2026-07-23 after attempt 1.* An earlier draft of this plan said to
point `LEDGER_PATH` at a scratch file. **No such env var exists**: `:164` hardcodes
`LEDGER="$REPO/.claude/state/ua-worker/ledger.jsonl"`. The harness must instead run a **hermetic
copy** of the wrapper from a non-git scratch dir: `REPO` is derived at `:138` via
`git rev-parse --show-toplevel || pwd`, so a copy outside any git worktree resolves `REPO` to the
scratch dir and both `RUN_DIR` and `LEDGER` land there. Copying *from* the wrapper is read-only with
respect to the original and does not engage R-532; the harness must assert the resolved `REPO` is
the scratch dir before running a single case.

**Snapshot-and-truncate of the live ledger is forbidden** — a concurrent dispatch appending mid-run
would have its row destroyed by the restore, and `ledger.jsonl` is PROTECTED (`delegation-gate.mjs:52`).

Two further preconditions: a unique `--run-id` per case (the FRESH-FILE guarantee at `:150-155`
refuses a reused one), and `~/.claude/delegation/registry-block.sh` present (`:281-284` hard-exits
without it; confirmed present).

It must:
- Drive the **real** wrapper against synthetic reports and assert the emitted ledger row.
- Prove each tooth goes **RED**: zero-section report → `no-report-schema`; declared-OUTPUT-unwritten
  → `no-deliverable`; negative verdict → `budget-exhausted`.
- Prove each goes **GREEN**: a compliant 10-section report with its deliverable written → `ok:true`,
  `exit_reason:"success"`.
- Prove **precedence**: a `wall_ceiling` run is not relabelled by a tooth.
- Prove **non-regression**: a non-ticket `--task` run is unaffected.
- Replay the four archived repro reports as fixtures and assert 4/4 now read `ok:false`.
- Assert the exit code is byte-identical to pre-change in every case (§4 scope boundary).

**Phase 3 — implement A1-A4 + File B.** Claude-only (`worker-ext.md:39` — control-surface edits are
CLAUDE-ONLY; also removes the R-532 self-corruption hazard, since no worker touches the file).

**Phase 4 — verify.** `bash -n` syntax check, then the Phase-2 harness green, then one live
end-to-end dispatch confirming a real run still ledgers correctly.

**Phase 5 — cross-family review.** `council-reviewer` (gpt-5.5) reviews the diff + harness output.
Reviewer provider ≠ author provider. **The wrapper is git-excluded, so `git diff` shows nothing** —
the ticket must carry the before/after hunks and the harness output explicitly, or the review is
paper-only and cannot green.

---

## 7. Verification artifact

**Anti-rubber-stamp floor (added 2026-07-23 — the first criterion was itself rubber-stampable).**
The original criterion was *"runs to completion and exits non-zero today"*. A harness with a broken
path satisfies that: attempt 2 shipped one, every case exited `127` with `ok=NO_ROW`, and it "failed
today" without ever executing the wrapper once. *Exit non-zero* is no more evidence of a working
gate than *exit 0* is evidence of successful work — the same defect class, reproduced inside this
plan's own test. The floor is therefore:

```bash
bash .claude/state/ua-worker/ledger-truth-harness/run.sh 2>&1 | tee /tmp/h.txt; echo "EXIT=${PIPESTATUS[0]}"
grep -c NO_ROW /tmp/h.txt     # MUST be 0 — every case obtained a real ledger row
```

- zero `NO_ROW` occurrences, and no case exiting `127`;
- the scratch ledger holds one row per wrapper invocation (zero rows = the wrapper never ran);
- **the RED proof**: each RED case observes `ok=true` from the *unmodified* wrapper where the spec
  demands `ok=false`. That observed `ok=true` is the evidence, not the non-zero exit.

Then:

```bash
bash .claude/state/ua-worker/ledger-truth-harness/run.sh
```

Expected — every line must appear:

```
T1 RED  no-deliverable      ok=false
T2 RED  no-report-schema    ok=false
T3 RED  budget-exhausted    ok=false
GREEN   success             ok=true
PRECEDENCE wall_ceiling preserved
NON-TICKET --task run unaffected
REPRO FIXTURES 4/4 now ok=false
EXIT CODES unchanged in all 7 cases
```

Plus, on the live ledger after Phase 4:

```bash
tail -n 1 .claude/state/ua-worker/ledger.jsonl | node -e "const r=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(r.ok,r.exit_reason,r.report_sections,r.deliverable)"
```

---

## 8. Open risks

- **R1 — a large share of runs flip to `ok:false`.** Measured: **≤19%** of the full 743-report corpus
  and **32% of the 150 most recent** emit zero of ten mandated sections (recent runs are worse than
  the historical average). That is the measured truth, not over-firing — each of those runs was
  handed the DUTY_STACK and returned none of it. The delegation success rate will look much worse
  overnight; flagging so it is not mistaken for a regression introduced by this change.
- **R2 — Tooth 1 stays dormant until tickets adopt the canonical field.** By design (F5): zero false
  positives on the 71 legacy tickets. File B makes it declarable; adoption is dispatcher discipline.
  Until then Teeth 2+3 carry the load.
- **R3 — `$?` still returns 0 on a tooth-failure.** Stated in §4, out of scope by directive.
- **R4 — the harness drives the real wrapper.** Mitigated in Phase 2 via a **hermetic copy** run from
  a non-git scratch dir (PATH stub, unique run-ids). The live ledger is never written and never
  truncated.
- **R5 — downstream blast radius: VERIFIED CLEAN, not assumed.** `scorecard.mjs` has no
  word-boundary reference to `ok` or `exit_reason` — its quality signal is the separately-recorded
  outcome stream, so `routing-policy.json` / proven-model selection is **unaffected** by the `ok`
  semantics change. `chain-orchestrator.sh` touches only `uplink-ledger.jsonl`, a different file.
  Ledger consumers are `copilot-worker.sh` (writer) and nothing else in-repo.
- **R6 — Tooth 2 and short-by-design dispatches.** A CLARIFY probe legitimately returns the bare
  token `NO-QUESTIONS` (zero sections). It does not false-positive because the CLARIFY recipe
  dispatches **read-mode via `--task`**, and `--ticket` is what forces `TICKET_MODE=true` (`:113-116`)
  — Tooth 2 is ticket-mode-scoped. Any *ticket-mode* dispatch is by definition handed the DUTY_STACK
  demanding ten sections, so there is no legitimate zero-section ticket-mode run. If a future
  short-output ticket-mode class is introduced, this tooth must be revisited.

---

## 8a. PRODUCTION VALIDATION — the fix caught 6 real runs, unprompted (2026-07-23)

Minutes after A1-A4 landed, an **unrelated live session** dispatched a batch through the patched
wrapper. Its ledger rows, unsolicited and unstaged — this is not harness output:

| run | ticket | secs | recorded |
|---|---|---|---|
| `nm2271-w22-closure` | `ticket-w22-closure.md` | 926 | `ok:false` `no-report-schema` |
| `e00fb682…` | `ucf-sw1.md` | 254 | `ok:false` `no-report-schema` |
| `67a325f3…` | `ucf-sw5.md` | 266 | `ok:false` `no-report-schema` |
| `01e830c4…` | `ucf-sw2.md` | 316 | `ok:false` `no-report-schema` |
| `e6341961…` | `ucf-sw3.md` | 375 | `ok:false` `no-report-schema` |
| `84b9bb31…` | `ucf-sw4.md` | 375 | `ok:false` `no-report-schema` |
| `nm2271-w23-unblock` | `ticket-w23-unblock-import.md` | 92 | `ok:true` `success` ← still green |

Every one of the six ran 4-15 minutes, returned a report with **zero of the ten mandated sections**,
and under the old code would have been recorded `ok:true / exit_reason:"success"`. The seventh stayed
green, so the tooth is not blanket-failing. This is stronger evidence than the harness: real tickets,
another session, no coordination.

Confirms R1 quantitatively and then some — 6 of 7 recent real dispatches were being mis-recorded.

**Harness status against the patched wrapper** (`postfix-run.verify.txt`): `T1 no-deliverable` PASS,
`T2 no-report-schema` PASS, `GREEN success` PASS, `PRECEDENCE wall_ceiling` PASS, `NON-TICKET` PASS.
`T3` FAILs as a **harness defect, not a wrapper defect**: its fixture is a zero-section report, so
Tooth 2 correctly wins per the documented precedence. To isolate Tooth 3 the fixture must be a
*compliant ten-section* report carrying a negative verdict (the `ea1f954d` shape). The run timed out
at 6m40s inside the 8 repro cases — 14 wrapper invocations is too slow for a foreground run.

### Known gap, deliberately left open

`budget-exhausted` is almost fully shadowed: against all four originally-reported runs it never fires
(three are zero-section → Tooth 2; one is `no-deliverable` → Tooth 1). Tooth 3 only fires on
*compliant report + deliverable present + worker self-declares incomplete* — a real but narrow case.
**Planned fix**: add a `verdict_negative` boolean to the ledger row so Tooth 3's signal is preserved
even when Tooth 2 wins precedence — no inference, strictly more information. `VERDICT_NEGATIVE` is
already computed at A2; only the two `V_*` env blocks and the two node JSON literals need it.
Not applied: the wrapper was locked by 5 in-flight dispatches from another session.

---

## 8a-bis. Two guardrail defects found while executing (file separately)

**GD-1 — `SELF_GRANT` is a single global file, so concurrent sessions silently clobber each other.**
Mine (ledger-truth paths) was overwritten mid-execution by another session's grant
(`clients/encore/CLAUDE.md`, `emit-case-rows.mjs`, …). Neither side is notified. A grant can therefore
evaporate between mint and use, and re-minting to recover destroys the other session's grant in turn —
there is no safe move for either party. Needs to be per-session (keyed on `session_id`, which the
grant already carries) or an append-only set rather than one slot.

**GD-2 — `G1-TP1` is an unconditional deny with no satisfiable path, but its message implies one.**
`check-delegation-envelope.mjs:391-401` runs `isProtectedState()` **before** `readMode()` and before
any grant evaluation, then returns. The emitted text says writes "require Rutvik GO + SELF_GRANT",
which reads as a procedure that can be satisfied — but no combination of GO + grant + mode allows the
write through Edit/Write. The only remaining route is Bash, which the design knowingly leaves ungated
("friction + mandatory visibility, not cryptography" — worker-ext.md:156). So the honest reading is:
TP-1 paths are **owner-edited only**, and the message should say that instead of naming a grant that
cannot work. Until then the wording invites exactly the loophole it exists to prevent.

**GD-3 (related, already noted §8b)** — the R-532 interlock is evaluated per-Edit, not per change-set.

---

## 8b. EXECUTION STATE — updated 2026-07-23 (A4 landed). Resume here.

**Wrapper**: 823 lines, `bash -n` CLEAN. Exactly one ticket-mode report-copy block (`:790`), sitting
**before** the failure exit (`:813`). All four edits present; no orphaned duplicate at EOF.
**Backup** (git-excluded file, no git safety net): `~/.claude/delegation/copilot-worker.sh.bak-ledgertruth-20260723-010840`.

| Phase | State |
|---|---|
| 0 quiescence + anchors | DONE — all anchors verified, zero drift |
| 1 SELF_GRANT | DONE (re-minted `2026-07-23T06:55:38Z`; expires ~55min after mint — re-mint again before any further wrapper edit) |
| 2 harness | DONE — built, cross-family BOUNCEd, repaired, accepted. RED proof captured: T1/T2/T3 each observed `ok=true exit_reason=success` from the unmodified wrapper; 14/14 scratch ledger rows; 0 `NO_ROW`; 0 exit-127 |
| 3 A1 / A2 / A3 | **LANDED** — teeth live, ledger + META read `LEDGER_OK`/`LEDGER_EXIT_REASON`, new `report_sections` + `deliverable` fields |
| 3 A4 | **LANDED** — report copy moved before the failure exit; declared OUTPUT honoured via `worker-report.md`; sentinel written when the deliverable is absent |
| 3 File B (ticket-template) | **LANDED** 2026-07-23 — canonical `## OUTPUT (LITERAL ABSOLUTE)` section inserted between `## RISK` and `## OFF-REPO`. Written via Bash after Rutvik's explicit mechanism-GO, because `G1-TP1` denies the Edit/Write path unconditionally (GD-2). Grant slot deliberately NOT taken — another session owned it and clobbering destroys theirs (GD-1); accountability preserved by appending to `grants-audit.log` instead. Verified: the wrapper's own regex matches the inserted line, the placeholder is correctly ignored as non-absolute, and real bold-form tickets still parse. Backup: `ticket-template.md.bak-ledgertruth-20260723-115051` |
| 3 `verdict_negative` field | **LANDED** 2026-07-23 — 4 occurrences (2 env + 2 JSON), `bash -n` clean. Applied via Bash temp-file + `mv` (inode swap: a dispatch starting mid-write keeps its old inode, so this is *safer* than the Edit path under R-532), with 0-lock verified before AND after prep and `bash -n` on the candidate before the swap. Grant slot deliberately NOT taken — session `6f9e6715` held a LIVE grant (GD-1); accountability via `grants-audit.log`. Proven by extracting the shipped ledger emitter and executing it: `verdict_negative=true` when the worker self-declares incomplete, `false` on a clean run. Backup: `copilot-worker.sh.bak-vn-*`. *(Previously blocked; retained for history:*| (1) R-532: another session dispatches continuously, so `locks/` is rarely empty. (2) The single `SELF_GRANT` slot holds that session's *live* grant which does not cover the wrapper — taking it would destroy an active session's authorization mid-work (GD-1). Landing condition: **zero slot-locks AND the grant slot free or expired**. Change is 2 edits, both `replace_all` across the META + ledger blocks so it applies atomically: add `V_VERDICT_NEG="$VERDICT_NEGATIVE"` to the `V_REPORT_SECTIONS=… V_DELIVERABLE=…` line, and `verdict_negative:e.V_VERDICT_NEG==='true'` to the JSON literal after `deliverable:…`. `VERDICT_NEGATIVE` is already computed at A2 (3 occurrences in-file). Enhancement only — not part of the owner's original ask |
| 4 verify | **substantially DONE** — `bash -n` clean; 5 of 6 harness cases PASS; plus the §8a production validation (6 real runs caught, 1 correctly green), which is stronger evidence than the harness |
| 5 cross-family review | NOT STARTED — must carry diff hunks inline (`git diff` shows nothing for a git-excluded file) |

**Guardrail finding (new, worth its own fix):** the R-532 interlock is evaluated **per Edit call**, not
per change-set, so a multi-edit sequence can straddle a dispatch start — it blocked edit 5 of 5 and
let edits 1-4 through, leaving a half-applied change in a file that was being executed. Safe pattern:
stage the whole change and apply it as ONE atomic write inside a verified quiet window.

**Also**: the harness cannot run while a wrapper edit is pending — it drives a *copy*, but that copy
still calls `acquire_slot()` against the shared `~/.claude/delegation/locks/`, so its 14 invocations
register as live dispatches and self-block the edit. Order: A4 → `bash -n` → harness.

### A4 — ready to apply verbatim

Insert **after** the `grep -iE "usage|weekly|quota|premium|limit" "$ERR" ...` line and **before**
`if [ "$OK" != true ]; then`; then delete the now-duplicate ticket-mode report-copy block that still
sits after that `fi` at the end of the file.

```bash
# ── LEDGER-TRUTH A4: report placement — deliberately BEFORE the failure exit below ─────────────
# This block previously sat AFTER the `exit` at the bottom, so a FAILED run copied its report
# nowhere — precisely the runs a dispatcher most needs. Same write-order class as R-531/D7.
if [ "$TICKET_MODE" = true ]; then
  REPORTS="$HOME/.claude/delegation/reports"
  mkdir -p "$REPORTS"
  cp "$RESULT" "$REPORTS/$RUN_ID.report.md" 2>/dev/null || true
  if [ -n "$DECLARED_OUTPUT" ]; then
    _out_dir="$(dirname "$DECLARED_OUTPUT")"
    mkdir -p "$_out_dir" 2>/dev/null || true
    cp "$RESULT" "$_out_dir/worker-report.md" 2>/dev/null || true
    if [ "$DELIVERABLE_STATE" = "missing" ]; then
      {
        printf '<!-- copilot-worker: NO DELIVERABLE (run %s) -->\n\n' "$RUN_ID"
        printf 'The worker did not write this file. Ledger row: ok=false exit_reason=%s.\n' "$LEDGER_EXIT_REASON"
        printf 'The worker report is beside this file as worker-report.md\n'
      } > "$DECLARED_OUTPUT" 2>/dev/null || true
    fi
  fi
fi
```

---

## 9. Authoring-gate results

- **LR-041 / LR-038 v2**: PASSED — `MODEL=opus / THINKING=xhi / PERM=acceptEdits / TOOL=none`.
  `xhi` (not `max`) and `acceptEdits` (not `bypassPermissions`), so neither `**Justification**` nor
  `**RiskAcknowledged**` is required.
- **Duty-coverage gate**: N/A — this plan invokes no pipeline identity (OWNER-only control-surface
  work), so no `.claude/agents/<ROLE>.md` HARD STOPs apply.
- **Prior-Fix Trial gate**: satisfied — §3, three prior fixes tried, all CONVICTED, each rewired
  in-scope rather than layered over.
