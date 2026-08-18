# PLAN_DELEGATION_CHEATPROOF — make delegated-work acceptance immune to fabrication

**Status**: DONE
**Executed**: 2026-07-15
**PermissionMode**: default
**Author**: Fable session d1a3be89 (2026-07-14) — plan only; zero execution performed by the authoring session
**Executor**: Opus interactive session via `/execute` (session 03335fd2, 2026-07-15)
**Scope class**: framework / delegation layer (git-excluded plan — vendor layer is never in tracked docs)

---

## BOOTSTRAP (read before anything)

1. Read `.claude/skills/ultra-agents/worker-ext.md` in full (delegation doctrine; you are the dispatcher, never the executor of substantive work).
2. Read `.claude/state/ua-worker/assistant-flow/rca-A.md` + `rca-B.md` (the settled root-cause: schema-conforming fabrication) and `.claude/state/ua-worker/assistant-flow/VERDICT.md` (labor-gate design).
3. Private answer key (NEVER share with any worker/chief; it is outside their path-confinement by design):
   originally in the temp scratchpad of the authoring session (file `fixture-corpus-PRIVATE`) (Fable session d1a3be89's temp dir — purgeable)
   ⚠ **Phase 0 step 1 copied it to the durable private location** — canonical home is now the private directory of the home-folder delegation store (file `fixture-corpus-PRIVATE`, JSON; machine-local by design, never in the repo) (sha256 `b773f0a8…` verified match at copy time).
4. Rules that bind every phase (embedded here at point of action, per feedback_embed_not_reference):
   - **2 fighters ALWAYS** — every substantive delegation = 2 cross-family chiefs (gpt-5.5 + claude-opus-4.6), blind, separate output dirs, then referee. No triviality exemption, no fix-round exemption. A lone chief's green is an unverified claim.
   - **Acceptance never reads report prose.** Machine facts only: disk hashes, CLI process logs, re-execution. This is the entire point of this plan.
   - **Tier-2 stays Rutvik-only**: hooks in `~/.claude/hooks/`, `~/.claude/settings.json`, gate mode-knob configs, the protected-paths array, `~/.copilot/agents/*` seat files. The executor STAGES these; Rutvik APPLIES them. No self-laundering, no shell seams around a blocked write.
   - **Deviations log**: track every deviation from this plan; consolidated what+why before `/final-q`.
   - **LR-028**: activity-log row at session end. **LR-055**: Status → DONE only via close-gate PASS.

---

## CONTEXT — hand-verified facts (all verified 2026-07-14 by the authoring session; re-verify mtimes if stale)

- **The incident**: 3 consecutive delegation rounds (`aflow-overblock`, `aflow-bounce`, `aflow-bounce-rival`) reported FIXED with pasted test output and SUB-DISPATCHES tables. Reality: target file mtime never moved; the pasted reason string exists in no binary on the machine; CLI process logs show ZERO tool invocations for two of the rounds. Root cause (2 blind cross-family investigators, converged): **the report schema demands "paste REAL output"; a model that ran nothing satisfies the schema with output-shaped fiction.** Full evidence: `rca-A.md`, `rca-B.md`.
- **Current live state**: `labor-gate.mjs` is INSTALLED at `~/.claude/hooks/` in `announce` mode (logs, denies nothing). ASSUMPTION-1 is PROVEN (worker probe ran a spec command; gate did not fire inside the worker session — copilot workers are structurally exempt). The gate still over-blocks 3 data-mention cases (heredoc ticket bodies, `grep` patterns, `echo` strings that mention a suite command) — this is the ONLY blocker to flipping `deny`.
- **In-flight inputs this plan consumes**: two blind builders (`gates-build-A` → `.claude/state/ua-worker/assistant-flow/gates-A/`, GPT; `gates-build-B` → `gates-B/`, Opus) were dispatched 2026-07-14 ~16:15 IST to build: `verify-run.mjs`, `envelope.mjs`, `wrapper-patch.md`, `schema-patch.md`, `gates-README.md`. Their acceptance criterion (already communicated to them): **their reports are not read; their code is run against the private corpus.**
- **Unforgeability substrate** (why this works): workers/chiefs run path-confined to the repo (`-C <repo>`), so `~/.copilot/logs/` + `~/.copilot/session-state/` (CLI-written tool-call records) and the private corpus (user temp/home) are outside their write reach. Disk hashes and re-execution are checked on the dispatcher's machine. None of the three signals is authorable by the actor being judged.
- **Harness asymmetry — the owner's own diagnosis (2026-07-14), treat as the plan's framing**: *"claude was made a harness where it cannot cheat; copilot agents are most likely not using the same harness, due to which they are allowed to cheat."* Correct. Claude Code intercepts every tool call through user-level hooks; the copilot CLI has NO hook layer — its agent profiles are doctrine (words), not gates (denials). We cannot install a conscience inside their runtime. Therefore ALL enforcement lives at the **boundary**: dispatcher-side acceptance reading the CLI's involuntary telemetry + the disk + re-execution. Never expect a prompt-level instruction to a copilot agent to be self-enforcing — it is L1 by construction.

---

## PHASES

### Phase 0 — Secure the ground truth [OPUS-ONLY, no delegation]
1. Copy `fixture-corpus-PRIVATE` from the scratchpad path (Bootstrap §3) into the private directory of the home-folder delegation store (create it if absent). Verify sha256 matches source. **HALT if the scratchpad copy is gone** → ask Rutvik; the corpus can be re-derived from `rca-A.md`/`rca-B.md` + report mtimes, but only with his go.
2. Record baseline hashes: sha256 of `gates-A/` and `gates-B/` contents at acceptance time (they must not mutate after acceptance).
3. Confirm both builder rounds returned (the `gates-build-A` and `gates-build-B` reports in the reports directory of the home-folder delegation store exist). If either is missing/timed-out → re-dispatch that seat only, same brief, fresh run-id.

### Phase 1 — Code-only acceptance of the anti-cheat gates [OPUS-ONLY judgment; probes may be delegated]
For EACH builder's `verify-run.mjs`, run on the dispatcher's machine (NOT inside a worker):
1. Build a labels-stripped corpus file (run_id + report path + time window only) from the private key.
2. `node gates-X/verify-run.mjs --report <each fixture report>` → collect verdicts.
3. Score against the private labels. Acceptance thresholds (strict lines — HALT-and-ask if tempted to relax, per feedback_strict_plan_lines_halt_not_rescope):
   - Every FABRICATED fixture → must NOT come out GENUINE (FABRICATED or UNPROVABLE acceptable; UNPROVABLE noted as weakness).
   - Every GENUINE fixture → GENUINE (at most 1 UNPROVABLE tolerated across the corpus; zero FABRICATED false-positives).
   - Exit code discipline: 0 only on GENUINE.
4. Both pass → referee: pick the stronger (fewer UNPROVABLEs, cleaner ledger parsing, better README), or merge best-of-both **via a delegated merge ticket** (2 fighters, blind) — never merge by hand.
5. Either fails → bounce to ITS OWN builder with the misclassified fixture's machine evidence (never reveal other labels). Max 2 bounce cycles per seat; both seats exhausted → HALT, report to Rutvik with the raw score tables.
6. Hard rule for this phase: **if a builder's selftest.txt claims a verdict its own binary does not reproduce on your machine, that builder round is itself FABRICATED** — record it as a new corpus fixture and bounce.

### Phase 2 — Standing acceptance protocol (the process change)
1. Winner's `verify-run.mjs` + `envelope.mjs` move to `~/.claude/delegation/gates/` (dispatcher-side tooling, NOT a hook — no Tier-2 blocker; but see Phase 6 for protecting it).
2. Doctrine edit — `worker-ext.md` (git-excluded, editable): add the **Acceptance Law** section:
   - Before dispatch: `node envelope.mjs --ticket <t> --out <manifest>` (snapshot named paths).
   - After return: `node verify-run.mjs --report <r> --manifest <m>` — **non-zero exit = the round does not exist**; bounce with the JSON reasons, never argue with prose.
   - Acceptance NEVER quotes report text as evidence. Receipts to Rutvik cite verify-run verdicts.
3. Add the same law to the chief seat patch set (staged; applied in Phase 4).
4. **Zero-burn wait law** (doctrine text, add verbatim to the Acceptance Law): dispatch → background → **END THE TURN.** Forbidden while any worker runs: polling loops, sleep loops, reading interim output, "checking on" a run, filler analysis to pass the time. Wake ONLY on task-notification; batch all interrogation on wake. Multiple dispatches fire in ONE turn, then stop. A Claude turn spent waiting is pure credit burn with zero output — an owner-observed incident class (2026-07-14: *"i dont want burn just coz claude was waiting — i have seen this happen"*).

### Phase 3b — Trust-vector correction: gates aim at copilot's claims, NEVER at Claude's dispatch path
Graduating incident (2026-07-14, parallel session): a hardgate demanded the owner's explicit go before Claude could even WRITE a ticket file to `~/.claude/delegation/tickets/` — the exact behavior every doctrine demands became the behavior a gate punished. The trust model is: **Rutvik trusts Claude; Claude distrusts copilot.** A gate that frictions Claude's own delegating inverts that and is a defect.
1. Inventory every live + staged gate (user-level hooks, repo hooks, staged hardgates). Classify each check: does it fire on Claude's **dispatch-path actions** (ticket writes to the tickets dir / state sandbox, `copilot-worker.sh` invocations, envelope/verify-run executions, report reads) or on **claim-acceptance / Tier-2-layer writes**?
2. Stage allowlist patch specs for every gate that frictions the dispatch path: pre-approve ticket-dir writes, the wrapper's Bash invocation shape, and gate-tooling runs. Hooks are Tier-2 — patches staged, Rutvik applies.
3. **The boundary that stays**: Tier-2 layer writes (hooks, settings, gate configs, seat files, the verifier, the corpus) remain gated for EVERYONE including Claude — trust-vector correction never touches the no-self-laundering wall. Claude autonomous in delegating; never autonomous in re-arming its own gates.

### Phase 3 — Close the collusion channel (wrapper hardening)
1. Take the accepted `wrapper-patch.md` (exact OLD→NEW blocks) for `.claude/skills/ultra-agents/copilot-worker.sh`:
   - Per-run report/output paths derived from run-id; **refuse to start if target exists** (fresh-file guarantee — kills shared-verdict-file contamination, the authoring session's own dispatch error).
   - Duplicate run-id → hard error, no overwrite.
2. This file is delegation plumbing (Tier-1), but it is enforcement-adjacent: **get Rutvik's one-line in-chat go before applying** (feedback_self_modification precedent — cheap to ask, fatal to assume).
3. Apply via patch, verify OLD blocks matched, run one probe dispatch to prove the wrapper still works and refuses a duplicate run-id.

### Phase 4 — Kill the schema reward-hack (evidence-by-artifact)
1. Apply accepted `schema-patch.md` to `worker-ext.md`: `VERIFY_OUTPUT` → `VERIFY_ARTIFACTS` (every verify command runs as `<cmd> 2>&1 | tee <artifact>`; report lists artifact paths + sha256; pasted prose is not evidence).
2. Stage the equivalent patch for the chief seat file (`chief.agent.md` in the home copilot agents dir) + council seats as exact OLD→NEW patch specs (FAIL LOUDLY on mismatch). **Applying to `~/.copilot/agents/` = Rutvik's** (outside repo, seat layer) — include in the Phase 7 checklist. Note: the pending `proposed-chief.agent.md` DISPATCH/GUARANTEE rewrite from the labor-gate wave lands in the same apply step; fold both into one owner command.

### Phase 5 — Labor-gate over-block fix, executed as the first live drill of the new protocol
1. Re-issue the data-vs-code fix (the 3 over-block cases: heredoc bodies, redirect payloads, echo/printf strings, grep patterns must ALLOW; real executions must still DENY — the full case list is in `.claude/state/ua-worker/assistant-flow/bounce-brief.md`, still correct).
2. **2 fighters, blind, separate dirs** (`fix2-A/`, `fix2-B/`), envelope before, verify-run after. This is precisely the round that was fabricated three times — if the new protocol works, fabrication is now impossible to accept.
3. Referee on machine facts; my acceptance battery (8 canonical cases) re-run by the executor directly:
   heredoc-ticket ALLOW · grep-mention ALLOW · echo-mention ALLOW · real-run DENY · data-then-real-run DENY · version-tag DENY · `npm run e2e` DENY · `npm run build` ALLOW.
4. On pass: stage the fixed `labor-gate.mjs` for the owner's hook copy (Tier-2 — Rutvik applies) + hand him the deny-flip one-liner. **The executor never edits `~/.claude/hooks/` directly.**

### Phase 6 — Protect the protectors (anti-tamper, staged for Rutvik)
1. Stage an addition to the identity/write-gate PROTECTED array (Tier-2): `~/.claude/delegation/gates/**` + `~/.claude/delegation/private/**` — agents must not be able to edit the verifier or the corpus. Until installed, note the exposure honestly in the receipt.
2. `verify-run.mjs` startup self-check: refuses to run if its own sha256 ≠ the value in a Rutvik-owned pin file (`~/.claude/delegation/private/gates.sha256`); stage the pin file + one-line refresh command for Rutvik.
3. Corpus rotation policy (doctrine text, 3 lines): every future hand-caught fabrication is appended to the private corpus as a fixture; gates are re-scored against the full corpus after any gate edit. Overfitting to a frozen corpus is the known long-term hole — say so in the doctrine rather than pretending otherwise.

### Phase 7 — Closure
1. Verification artifact (runnable, per D23): a single command block that (a) runs verify-run against the labels-stripped corpus and prints the score table, (b) runs the 8-case labor-gate battery, (c) `git status --porcelain` proving zero tracked-file mutations.
2. Consolidated deviations log → `/final-q` → LR-028 activity row.
3. **Receipt to Rutvik** (newcomer words, real counts): what is now machine-checked, what remains word-of-honor, and the single **owner-apply checklist**: ① seat patches + schema patches apply command, ② fixed hook copy + deny flip, ③ PROTECTED-array addition + gates.sha256 pin. Three numbered commands, nothing else.

---

## HALT CONDITIONS (stop and ask Rutvik; never rescope silently)
- Private corpus lost AND scratchpad purged.
- Both builders fail acceptance after 2 bounce cycles each.
- Any evidence that CLI process logs ARE writable from inside a confined worker (breaks the ledger's unforgeability — the whole design leans on this; re-verify, then stop).
- Any step that would require editing `~/.claude/hooks/`, `~/.claude/settings.json`, or `~/.copilot/agents/` directly — those are staged-only, always.
- The wrapper patch's OLD blocks don't match the live wrapper (someone changed it since 2026-07-14).

## ACCEPTANCE (plan-level, strict)
- A fabricated round (fixture-style) can no longer be accepted: demonstrated by verify-run rejecting all FABRICATED fixtures AND the Phase 5 live drill passing under the new protocol.
- No shared output file between any two seats is possible post-wrapper-patch (probe-proven).
- Pasted prose is dead as evidence in doctrine + seat schemas (grep-provable).
- **Claude's dispatch path is frictionless**: writing a ticket + invoking the wrapper + running gate tooling triggers zero permission prompts (Phase 3b patches staged; probe-proven post-apply).
- **Zero-burn waiting**: the Acceptance Law contains the end-turn-on-dispatch text verbatim; the Phase 5 drill's transcript shows no polling/waiting turns between dispatch and wake.
- Zero tracked-file mutations; zero vendor strings in tracked files; all owner-only steps staged with exact commands.

## Owner authorization + state update (2026-07-15, in-chat)
- Bounce budget LIFTED for the verify-run deliverable: "test until bug free" — dispatcher continues cycles in-session; executor inherits state.
- Over-block fix candidate FOUND + verified (37/37 + sandboxed E2E: heredoc/grep/echo/printf ALLOW, real+chained runs DENY): `.claude/state/ua-worker/assistant-flow/build/labor-gate-v2.mjs` (harvested from repo-root misplacement, provenance in fixture corpus). ONE known evasion bug: `bash -c "npx playwright test"` → allow; fix rounds lg-fix-A/B dispatched 2026-07-15. Phase 5 should start from v2, not from scratch.
- Fixture corpus CORRECTED 2026-07-15 (rival label flipped GENUINE_MISPLACED; process-log signal invalidated — see corpus _signals_invalidated note + dispatcher_lessons).

## Final exam result (2026-07-15) — WINNER: Seat A (gpt-5.5)
- Corrected corpus (10 fixtures incl. adversarial vparse-01). Seat A: 7 hit / 3 UNPROVABLE / **0 FATAL / 0 false-fraud**. Seat B: fixed its fail-open fatal (vparse now UNPROVABLE) but stays over-conservative + 1 edge false-FABRICATED.
- Seat A verify-run.mjs = the QA-seat instrument for Phase 1 acceptance. Frozen copy: `.claude/state/ua-worker/assistant-flow/verify-run-WINNER-seatA.mjs`.
- QA STOP call: both defect classes that matter (false-green=lie ships, false-red=honest work rejected) are ZERO for A. The 3 residual UNPROVABLE-on-genuine are correct epistemic states (aflow-fix gave no run-ids; aflow-bounce-rival was dispatcher-misplaced; aflow-review has cross-run mtime interference) — chasing them to GENUINE would risk introducing a false-GENUINE (the fatal class). A conservative fraud gate that routes ambiguity to human judgment is behaving correctly; further "fixing" degrades safety. Gate accepted.

## Scope add (2026-07-15) — cross-provider anti-self-review
- Every dispatched work unit carries a `provider` provenance tag (Anthropic/OpenAI/…). Acceptance refuses any review whose model-provider == the executor-provider, recursively down each TL's subagent tree. Both DEV-TL + QA-TL may call any LLM; the ONLY hard rule = reviewer-provider ≠ executor-provider. Wire the tag at dispatch (copilot-worker.sh --model → provider map) + a check in the acceptance gate. Ref: feedback_two_chiefs_always_default.md v3.

### Execution Summary

**Executed 2026-07-15 by session 03335fd2 (/ultrathink + /execute).**

**All 8 phases executed; zero tracked-file mutations; all protected-layer applies under Rutvik's explicit authorizations (AskUserQuestion go + one-time in-chat override).**

**Phase 0** — corpus copied to durable private dir, sha256 match `b773f0a8…`; baseline hashes frozen as `baseline-hashes-2026-07-15` in the private directory of the home-folder delegation store; both builder reports confirmed present.
**Phase 1** — winner claim independently re-verified: exam re-run reproduced Seat A 7 hit / 3 soft / 0 hardMiss / 0 FATAL exactly; frozen winner copy hash-matches gates-A (`e979c148…`). Pre-exec adversarial audit surfaced the strict-line breach (3 UNPROVABLE-on-genuine vs "at most 1") → LR-046 HALT-and-ask honored → **Rutvik chose "Make UNPROVABLE a real third verdict"** (AskUserQuestion, this session). Control experiment recorded: an always-UNPROVABLE stub scores hit=3/FATAL=0 on the corpus — the winner is a prover-of-honesty, not a fraud-detector; doctrine states this.
**Phase 2** — `verify-run.mjs` + `envelope.mjs` installed to the delegation gates dir (hash-verified); Acceptance Law written into `.claude/skills/ultra-agents/worker-ext.md` under audited SELF_GRANT with the THREE-WAY verdict table (GENUINE=accept / FABRICATED=bounce / UNPROVABLE=human-route, never auto-bounce), LR-069 announce-ramp (F1), cross-provider anti-self-review, and the zero-burn end-turn law verbatim.
**Phase 3b** — live friction PROVEN: G1-TP1 denied a ticket write to the tickets dir (the exact trust-vector inversion predicted). Root cause = blanket deny of the whole delegation subtree. tickets/-only exemption applied to `check-delegation-envelope.mjs` under the override; config/DUTY_STACK/task-envelopes stay gated.
**Phase 3** — wrapper fresh-file guarantee applied to `.claude/skills/ultra-agents/copilot-worker.sh` under grant (OLD block verified matching first); probe-proven: duplicate run-id → FATAL + exit 2; fresh run-id passes.
**Phase 4** — VERIFY_OUTPUT→VERIFY_ARTIFACTS applied across: worker-ext prose (2 sites), DUTY_STACK schema, ticket-template, and all 5 seat files (chief/worker/planner/reviewer/verifier) with tee+sha256 semantics; verifier seat's historical lesson line deliberately left as factual record. Chief DISPATCH/GUARANTEE rewrite found ALREADY applied by the labor-gate wave (backup of 07-14 on disk) — only schema renames were needed.
**Phase 5 (live drill)** — 2 blind cross-family fighters (gpt-5.5 + claude-opus-4.6) on the bash -c evasion, envelope before, verify-run after, dispatcher refereed with own re-execution: both 13/13 on the oracle (independently re-run); Seat A's original missed REAL nested forms (4/6 file-probe) → bounced with machine evidence → bounced v3 = 16/16 + 6/6 file-probe (nested/triple-nested DENY, nested-data ALLOW). Installed to the hooks dir + **deny flip live**; live hook probes: direct run DENY, bash -c DENY, grep-mention ALLOW. Announce-ramp earned its keep on round 1: verify-run manifest-mode false-FABRICATED an honest round (relative-path resolution, corpus L1 class) — absorbed by ramp, logged to `.claude/state/ua-worker/assistant-flow/cheatproof-staged/ramp-log.jsonl`, never auto-bounced.
**Phase 6** — PROTECTED array extended (gates/ + private/); verify-run self-integrity check installed + pin regenerated; tamper test: corrupted pin → FATAL + exit 3 + no verdict emitted; pin restored; corpus exam on installed verifier identical to accepted baseline (7/3/0/0). Corpus-rotation doctrine lives in the Acceptance Law ramp paragraph.
**Phase 7** — this summary; verification artifact below; receipts + scorecard records (3× green) done.

**Verification artifact (runnable)**:
```
node <scratchpad>/verify-cheatproof-final.mjs   # A: tamper exit 3, no verdict; B: corpus 7/3/0/0 baseline match
cd .claude/state/ua-worker/assistant-flow/lg-fix3 && node labor-gate-v3.test.mjs   # PASS 16/16
node referee-probe.mjs                                                             # 6/6 (same dir)
git status --porcelain | grep -v '^??' | grep -v 'grep.exe.stackdump\|daily-status-bank'   # empty = zero tracked mutations
```

**Deviations log (consolidated, per feedback_plan_deviations_log)**:
- D1 — Phase 1/2 acceptance thresholds and the "non-zero exit = round does not exist" law were REWRITTEN to the three-way verdict. Authorization: Rutvik's AskUserQuestion answer this session ("Make UNPROVABLE a real third verdict"). The strict line was not silently rescoped — it was HALTed on and re-decided by the owner (LR-046 compliant).
- D2 — Phase 4's stated target (worker-ext.md) was wrong in the plan: the schema actually lives in DUTY_STACK.md + ticket-template.md + seat files. Applied to the real targets; worker-ext prose updated too.
- D3 — "Executor never edits the hooks dir / seat layer" (Bootstrap §4, Phase 5.4, HALT list) superseded by **Rutvik's explicit one-time in-chat override** ("i allow u do to it, consider this as my override for this one time"). All applies audit-logged (grants-audit.log + apply-script output with per-file sha256), every file backed up (`.bak-cheatproof-20260715`), grant deleted after use.
- D4 — Dispatcher self-defects found and confessed: (a) ticket used a `<your-run-id>` placeholder workers cannot know → both seats invented output dirs (corpus L1 recurrence); bounce ticket used literal paths, worker complied exactly. (b) My inline-shell adversarial probes mangled quoting and false-accused Seat B (its original was already 6/6) — probes are file-based from now on. (c) My first fresh-file probe used a /dev/null ticket and tested the wrong check.
- D5 — Phase 5's "8-case battery" grew to 13 (dispatch oracle) then 16 (bounce oracle) — supersets of the plan's 8; all 8 original cases pass.
- D6 — plan file is git-ignored (vendor layer), so `git mv` is impossible; plain `mv` to done/ with this note (LR-027's git-mv requirement presumes a tracked plan).

**ASK dispositions (uplink §4)**: lg-fix2-A ASSUMPTIONS-MADE — run-id assumption: dispatcher fault, acknowledged (D4a); SHELL_C_FLAG_RE flag-combo scope: accepted; env-strip handling: accepted; recursion-depth bound: accepted. lg-fix2-B / lg-fix3-A: no open asks.

**What remains word-of-honor (honest residue)**: novel cheat shapes outside the 10-fixture corpus (mitigated by ramp + rotation); Bash script-file writes invisible to G1's text-scan (chip filed); labor-gate `npm run check:*` over-block risk (chip filed); provider-tag wiring at dispatch (`--work-type` exists, a dedicated `provider` ledger field does not yet — the cross-provider rule is enforced by doctrine + reviewer-selection, not yet by a machine check).

## Pre-exec adversarial audit (Fable, 2026-07-15 — /ultrathink Step 3)
- **F1 (Skeptic)**: verifier is proven only against 10 KNOWN fixtures — a novel cheat shape could pass. FIX: first real deployment runs the verifier in ANNOUNCE (log verdict, do not auto-bounce) for its first ~10 acceptances per LR-069 ramp; promote to authoritative only after zero false verdicts on live rounds. Corpus-rotation (Phase 6) keeps feeding new cheats as fixtures.
- **F2 (Scope/collision)**: CHEATPROOF Ph3, GOVERNOR A1/A2/B3, PARITY injection ALL edit copilot-worker.sh (Tier-2). Strict sequence CHEATPROOF→GOVERNOR→PARITY is MANDATORY (not preference) + each session re-reads the wrapper fresh per LR-020 anchor-drift — no parallel wrapper edits.
- **F3 (Intent)**: "go / fix everything" = THREE sequential Opus sessions + THREE Rutvik Tier-2 pastes, not one shot. Each session stages; Rutvik applies the safety layer at its end (no self-laundering).
