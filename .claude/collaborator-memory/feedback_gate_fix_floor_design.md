---
name: gate-fix-floor-design
description: "Never spec a guard as 'recognize the dangerous shapes' — spec it as 'the old verdict is the floor, only prove your way down'. 3 rounds × 2 gates of holes taught this."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 03335fd2-8e12-4e12-bcec-d6faadb69f0d
  modified: 2026-07-30T17:13:23.272Z
---

Any rule of the form *"ALLOW when the input isn't recognized as dangerous"* makes every unrecognized shape a hole. The dispatcher (Claude) wrote that polarity **three times in one session across two different gates**, each time believing it was the principled fix.

**Incidents (2026-07-15, both chips):**
- labor-gate: body classifier = blacklist → `echo x | npx playwright test`, `env CI=1 npx playwright test`, `./node_modules/.bin/playwright test`, `cross-env`, `$VAR`, `eval`, depth-cap-forgets-ancestor, `node scripts/run-playwright.mjs` all ALLOWed a real suite the ORIGINAL blocked.
- G1 envelope hook: "strip quoted regions as inert data" → `bash -c "echo x > <protected>"` blinded the gate; **10 regressions**, incl. a real write to `~/.claude/hooks/gates.sha256`, the sha-pin anchoring the whole anti-tamper system.
- The pin was protected only **by accident** — the original's greedy regex truncated `gates.sha256` → `gates.sh`, which happened to match. Every "clean" fix removed the accident and with it the protection. Extension whitelists are the wrong axis: protection is a question about the PATH.

**Why:** a guard's spec must make holes structurally impossible, not merely unlisted. Workers implement the spec faithfully — a polarity bug in the ticket becomes a polarity bug in the safety layer, and its test suite goes green because the tests are written to the same spec.

**How to apply — the FLOOR construction (use this wording in the ticket):**
> The existing gate's verdict is the FLOOR. Compute it first. If it says DENY, you may downgrade to ALLOW **only if you can PROVE** the specific narrow reason (e.g. the path occurs solely inside an affirmatively-identified inert region). Cannot prove it → the floor stands.

Under that shape an unrecognized input can never buy an ALLOW, and the worst available failure is a false DENY (friction, not a hole). Attempt 4 landed clean on the first try with this framing after 3 failures without it. Also: cross-provider review earned its cost — gpt-5.5 found the pin hole Claude missed; verify its claims yourself against the ORIGINAL to separate regression from pre-existing. Related: [[labor-gate-known-holes]], [[file-based-probes-only]], [[two-chiefs-always-default]].

## The concrete mechanism — a skip evaluated BEFORE classification can always be induced (2026-07-30)

The same class recurred in labor-gate across **two more** rounds, and the mechanism is sharper than
"blacklist polarity": it is **ordering**. `checkCommand()` ran its data-command skip *first*, on the whole
segment, before any classification — so prefixing `echo x |` made the gate skip the segment entirely and
never look at what followed. Round 2 fixed the wrong function; round 3 made the skip pipeline-aware and
closed seven prefixes but left `echo x | bash -c "<gated>"` open, because the shell-unwrap also only ran
at segment level while the thing that *executes* is the pipeline part.

The generalisable rule: **whenever a guard has an early-exit "this input is safe" branch, that branch is
the attack surface, and its position in the control flow is the bug.** Classify first on the smallest
unit that actually executes; let the skip be the *last* decision, reachable only when nothing triggered.
Ask of any gate: what is the earliest `continue` / `return allow`, and what does an attacker have to
prepend to reach it?

Two operational habits that caught this where code-reading did not:
- **Build a case harness, not a case list.** A durable runner with expected verdicts
  (`.claude/state/ua-worker/chips/q123/gate-probe/`) turns every future round into a regression test
  against the same bar, instead of a fresh set of remembered strings. Each round adds cases; none are lost.
- **The `allow` rows are half the suite.** A gate that starts denying legitimate traffic is worse than
  the bypass. Every round must prove no over-fire, not just new denials.
- **A coincidence is not a control.** One bypass variant was denied only because the pipeline splitter
  was not quote-aware and split inside a quoted payload by luck. Find these and name them — a fix that
  "cleans up" the coincidence silently removes the protection, which is exactly how the `gates.sha256`
  pin nearly died above.
