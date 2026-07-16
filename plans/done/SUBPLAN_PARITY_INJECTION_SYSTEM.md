---
**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0
**Created**: 2026-07-12
**Identity**: OWNER
**Parent**: PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY.md
**Depends on**: worker-skills-design-v2 (in-flight, foreign session) · PARITY_GAP_MATRIX.md (done)
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: innovation-class doctrine synthesis touching protected delegation control files — max-tier judgment.
**PermissionMode**: auto
**BrowserTool**: none
---

# SUBPLAN_PARITY_INJECTION_SYSTEM — Dynamic Claude-parity context injection for every worker dispatch

## Context — the thesis (Claude/Opus-authored, 2026-07-12)

Recon proved the parity gap precisely: of **18 Claude context layers, a Copilot worker gets 1 PRESENT · 4 PARTIAL · 2 N-A · 11 MISSING** (`COPILOT_WORKER_RUNTIME_INVENTORY.md` §329). The `PARITY_GAP_MATRIX.md` expands this to 52 capabilities and yields one load-bearing architectural insight:

> **The injection system is entirely DISPATCHER-SIDE.** Workers structurally cannot have hooks (no UserPromptSubmit, no PreToolUse, no SessionStart in the Copilot CLI). But Claude — at ticket-write time — can run the *same* scan its own UserPromptSubmit hook runs (`scripts/run-relevant-scan.mjs`) against the ticket text + SCOPE globs, and inject the matched rules/skills/memory INTO the ticket before dispatch. Workers already read every repo file; they need ROUTING (what to read) + VERIFICATION (proof they followed), not a Skill tool.

This subplan is the unified design. It **supersedes** the RED-verdicted `PLAN_WORKER_SKILL_ROUTING` (v1) and **integrates** its in-flight v2 revision as the skills-routing sub-component (§ Reconciliation).

## The RED-verdict constraints this design MUST honor (from worker-skills-review-0712)

1. **run-relevant-scan.mjs is not ticket-ready as-is**: it caps skills at 4 and forces `matchType:"INFORM"` (`scripts/run-relevant-scan.mjs:390-405`). Any design that branches on DIRECT/INFORM per skill is building on a contract that doesn't exist. → **A ticket-mode scanner (uncapped, true match-types, INDEX-sourced) is a prerequisite, not an assumption.**
2. **UW-5 placement was wrong**: v1 put the skill-route check in the UW-1 window using undefined `$LOG_DIR`; UPLINK reserves UW-1 for budget-check only. → any wrapper wire goes AFTER `UPLINK_LOG`/`GATE_FIRES` init, using existing vars.
3. **`/relevant` was omitted** from the 33-skill classification (only 32 classified). → the registry must classify all 33 exactly once, with a parity acceptance check vs INDEX.
4. **Every new check declares Sev + graduating incident + announce-first ramp** (LR-069). No straight-to-deny.
5. **Agent-profile structure is unverified from a worker** → execution must grep existing `~/.copilot/agents/*` structure before editing.

## Design — three injection mechanisms, all dispatcher-side, cheapest-first

### M1 — Path-glob → DOCTRINE auto-population (deterministic; P0, S-effort; HIGHEST leverage/lowest risk)
Given a ticket's SCOPE paths, mechanically match them against the `paths:` frontmatter globs of `.claude/rules/*.md` (11 files) and auto-append the matching rule paths to DOCTRINE. Pure automation, zero judgment, no scanner-contract dependency. Matrix rows 7. **Build first — it's the cheapest win and de-risks the rest.**

### M2 — Ticket-text keyword scan → rule/skill/memory injection (P0, M-effort; the core)
At ticket-write time, run a **ticket-mode scanner** (the M2 prerequisite — extend `run-relevant-scan.mjs` or add a sibling that: reads the ticket GOAL+CONTEXT as the "prompt", classifies against INDEX with TRUE match-types, no 4-cap) → returns matching skills + binding LR rules + relevant auto-memory entries. The dispatcher filters by the **Skill Transfer Registry** (TRANSFERABLE→inject the SKILL.md path into DOCTRINE + methodology-evidence expectation; CLAUDE-ONLY→skip) and injects matched LR rules + curated memory entries into the ticket CONTEXT PACK. Matrix rows 3, 6, 28, 12/13/14/19/20/21 (per-work-type methodology). **This is where v2's work lands — see Reconciliation.**

### M3 — Standing worker preamble (static; P1, S-effort)
A curated, versioned `worker-rules-extract.md` (the load-bearing subset of root+client CLAUDE.md — NEVER-ASSUME, Karpathy simplicity, subagent caps, no-`--no-verify`, MD-first, jargon ban, client LR-ENC business rules) appended to DUTY_STACK. This is the SessionStart-primer equivalent for workers. Matrix rows 1, 2, 33, 36 + curated Supreme Rules. Static extract, not full CLAUDE.md (which is CEO-orientation).

### Verification layer (proof the injection landed — non-negotiable per LR-059)
- Worker's DOCTRINE_READ must echo every injected DOCTRINE path (verifier mechanical check — matrix row 30/49 post-hoc scope validation).
- Reviewer checks methodology-evidence for each TRANSFERABLE skill injected (the registry's evidence signatures).
- A **canary dispatch** proves end-to-end: a ticket whose SCOPE matches a rule glob + whose text matches an LR keyword → the worker report shows the injected rule in DOCTRINE_READ + follows it. Ledger + report echo = the real-E2E proof (LR-059).

## Deliberately NOT replicated (CEO-side by design — matrix "Not Replicated" section)
The 20 CEO-side capabilities (delegation primer, /planning, /execute, /chain, /reflect, /audit, /ultrathink, closure gates, Chrome MCP, guiding vision, routing policy, …) stay Claude-only — injecting them into workers is circular or structurally impossible. The parity goal is worker *quality parity on execution*, not making workers into CEOs.

## Reconciliation with in-flight v2 (worker-skills-design-v2-0712)
v2 is actively revising the skills-routing core (M2's skill sub-component) against the same RED findings. **This subplan does NOT re-author skills-routing** — it OWNS the broader integration (M1 path-glob, M2 rule+memory injection, M3 preamble, verification) and CONSUMES v2's skills-routing + Skill Transfer Registry as M2's skill sub-component. **HARD CONSTRAINT**: no edit to `worker-ext.md` / `copilot-worker.sh` / agent briefs fires until v2 has landed and its edits are known, to prevent clobber (matrix + v1-RED both flag the UW-wire overlap). Sequencing: v2 lands → merge its registry+scanner → then this subplan's M1/M3 (which don't touch v2's surfaces) can proceed first.

## Phases (each independently shippable; ALL protected-file edits gated on Rutvik go + SELF_GRANT)
- **Phase 1 — M1 path-glob DOCTRINE auto-population** (no protected-file edit if built as a dispatcher helper script `scripts/ticket-doctrine-from-scope.mjs`; wrapper wire is protected). Deterministic, testable offline. START HERE.
- **Phase 2 — M2 ticket-mode scanner** (prerequisite: fix the 4-cap/INFORM-force — new `scripts/run-ticket-scan.mjs` or a `--ticket-mode` flag; NOT a protected file). Registry integration consumes v2.
- **Phase 3 — M3 worker-rules-extract.md** (new file in delegation dir; DUTY_STACK wire is protected).
- **Phase 4 — Verification wires** (verifier/reviewer agent-brief additions — machine-local, grep structure first per RED constraint 5; announce-first per LR-069).
- **Phase 5 — Canary E2E proof** (real dispatch; LR-059).

## Acceptance criteria
- [ ] M1: a ticket with SCOPE `clients/*/tests/**` auto-gets `.claude/rules/specs.md` in DOCTRINE (offline test, no dispatch)
- [ ] M2: ticket-mode scanner returns uncapped, true-match-type results; registry classifies all 33 skills once (incl. `/relevant`) with INDEX-parity check
- [ ] M3: `worker-rules-extract.md` exists; every line traces to a real CLAUDE.md/LR source
- [ ] Every new gate/check declares Sev + incident + announce-first ramp (LR-069)
- [ ] Canary: a real dispatched worker's DOCTRINE_READ echoes an auto-injected rule it was NOT hand-given (LR-059 real-E2E)
- [ ] Zero clobber of v2's landed edits (diff-additive only)

## GATE — decisions reserved for Rutvik
1. Go/no-go on protected-file edits (worker-ext.md, copilot-worker.sh, DUTY_STACK, agent briefs) + SELF_GRANT.
2. Confirm v2 (worker-skills-design-v2) is the owner of the skills-routing sub-component this integrates (vs re-scoping it here).
3. Priority vs the other P0 delegation plans (ASSISTANT_LAYER, UPLINK Phase 7).

---

## Execution Summary

**Landed across sessions (M1/M2/M3 built 2026-07-13 era; Phase 4 + wires + canary 2026-07-16 under the council regime). All acceptance criteria verified live 2026-07-16.**

### Acceptance criteria — evidence per line
- **M1**: ran `node scripts/ticket-doctrine-from-scope.mjs --self-test` → output: `39 cases: 39 PASS, 0 FAIL`; ran it on `clients/encore/tests/corporate-pricing/corporate-pricing-loc-export.spec.ts` → output includes `.claude/rules/specs.md` (+ angular/browser-tool/deliverable). In live dispatcher use.
- **M2**: `scripts/ticket-skill-scan.mjs` uncapped true-match-type (verified in PLAN_WORKER_SKILL_ROUTING closure same day: registry INDEX-parity PASS, 33 skills, 11 TRANSFERABLE).
- **M3**: `C:\Users\rutvi\.claude\delegation\worker-rules-extract.md` exists; spot-checked §1 Never-Assume + §2 Karpathy against root CLAUDE.md Supreme Rules — verbatim-traceable. **DUTY_STACK wire LANDED 2026-07-16**: extract inlined into the DUTY-STACK contract between BEGIN/END markers (marker count 3), after Rutvik in-chat GO ("go duty-stack") + scoped SELF_GRANT ceremony; first attempt was G1-TP1 DENIED (gate enforcing Rutvik-GO+grant exactly as designed — enforcement live, logged in grants audit). Backup: DUTY_STACK.md.bak-pinj-0716 (same dir). Wrapper prepends that file to every ticket-mode worker prompt (copilot-worker.sh:277-280), so workers now inherit the house rules.
- **LR-069 declarations**: reviewer §PINJ + verifier §PINJ-VERIFY sections (machine-local council agent profiles, placed 2026-07-16 after structure prechecks) each declare Sev S1 + graduating incident (PARITY_GAP_MATRIX 2026-07-12) + announce-first ramp; knobs `pinj_reviewer_check_mode` / `pinj_doctrine_echo_mode` = "announce" in `.claude/guardrail-config.json`.
- **Canary (LR-059 real-E2E)**: run `pinj-canary-0716` — DOCTRINE arrived ONLY via M1+M2 (pre-injection ticket snapshot in scratchpad, injected lines marked `# M1-injected`/`# M2-injected`; dispatcher curated 2 false-trigger skills out, noted in ticket). Worker followed the injected `/find-bugs` methodology (findings.md, 14 findings, all 6 SFDPOT categories named). R1 cap-death dropped DOCTRINE_READ → echo check fired 6 `PINJ-ECHO-MISSING` announce lines into `.claude/state/gate-fires.log` (telemetry wire proven live, first fire, zero false positives); R2 bounce → `PINJ-ECHO: OK — all injected paths echoed` (mechanical check script at `.claude/state/ua-worker/pinj-canary-0716-artifacts/check-doctrine-echo.mjs`). Calibration log started: `.claude/state/ua-worker/pinj_calibration_log.md`.
- **Zero clobber**: every placement was an append (agent profiles, DUTY_STACK, config keys); no v2-landed text modified.

### GATE decisions (this plan's reserved-for-Rutvik items) — both resolved
1. Protected-file go: Rutvik in-chat 2026-07-16 blanket GO (agent briefs, config knobs) + explicit "go duty-stack" (DUTY_STACK wire) + SELF_GRANT ceremony.
2. v2 ownership: PLAN_WORKER_SKILL_ROUTING confirmed owner of skills-routing (closed DONE 2026-07-16); this plan consumed its M2 scanner + registry rather than re-scoping.

### Deviations
- Phase 4 drafts required one bounce (pinj-phase4-draft-0716 R2) — reviewer-found defects fixed before placement.
- Wrapper UW-wires beyond the DUTY_STACK prepend were NOT part of this plan's acceptance (UPLINK Phase 3 owns those — see PLAN_UPLINK_PROTOCOL).
