# TICKET S1-B — ADVERSARIAL: prove the documentation is NOT wrong

## EXECUTION MODE
edit — the ONLY file you may create or modify is your OUTPUT path below. Touching any other file is a
hard failure of this ticket. Edit mode exists here purely to give you a shell for grep / node / git.
You are not fixing anything.

## YOUR JOB
Someone claims this repo's agent documentation contradicts its shipped gate configuration and should be
edited. **Your job is to REFUTE that claim**, not to confirm it. Assume the person who raised it was
careless. Find the reading under which the documentation is correct as written, or under which the edit
would be wrong or harmful.

**Default to REFUTED when you are uncertain.** A confirmation you cannot fully evidence is worth less
than an honest "I could not break this, and here is exactly what I tried."

Another agent is independently establishing the facts. You will not see its work and it will not see
yours. Do not try to guess what it found.

## THE CLAIM YOU ARE ATTACKING
> "`.claude/agents/REQUIREMENTS.md` says the unresolved-probe gate is in `announce` (warn-only) mode,
> but `.claude/guardrail-config.json` sets `unresolved_probe_mode` to `deny` and
> `scripts/walk-coverage/verify-denominator.mjs` treats `deny` as blocking. The documentation is stale
> and the sentence should be corrected."

## LINES OF ATTACK — work each one and report what you found, even when it fails

A1. **Wrong gate.** Is the sentence in `REQUIREMENTS.md` actually about a *different* gate than the one
    `unresolved_probe_mode` controls? Enumerate every gate-mode key in the config and every mode-reader
    in `scripts/`. If two gates could plausibly match the prose, the claim collapses.

A2. **Wrong file / more than one config.** Is there more than one `guardrail-config.json`, or an
    override layer (a `.local` variant, a per-client copy, an env var, a CLI flag) that means the
    repo-root value is not the effective one? Search for every read of that filename.

A3. **The prose is historical or scoped.** Does the sentence carry a date, a phase reference, or a
    conditional that makes it accurate as a record rather than a current-state claim? Quote enough
    surrounding context to settle it.

A4. **The config value is the wrong one.** Is `deny` in the config actually unreachable — shadowed by a
    later key, sitting in a disabled block, in a section the reader never consults, or overridden at
    runtime? Read the parse path, do not assume the JSON key is live.

A5. **The edit would be harmful.** Would correcting the sentence break a fixture, a hook test, a
    snapshot, a parity check, or an agent contract that pins that text? Search `.claude/hooks/`,
    `scripts/check-*`, and any fixtures files for the filename and for the quoted phrase.

A6. **It does not matter.** Is `.claude/agents/REQUIREMENTS.md` actually loaded by anything? If nothing
    reads it, the drift is inert and the edit is churn. Show the references, or their absence.

## MEASUREMENT CONTRACT
Paste the exact command and its raw output for every line of attack. `file:line` on every quote.

**POSITIVE CONTROL (mandatory, first section).** Prove your search is not blind: grep for a string you
have already read with your own eyes in `.claude/guardrail-config.json` and show the hit. Until that
control passes, an empty result proves nothing — and half your attacks above rest on absences.

**Scoping note — recursive greps from the repo root time out on this machine.** Scope to `.claude/`,
`scripts/`, `docs/read_only_docs/`, `plans/`; exclude `node_modules`, `_archive`, `out-*`, `dist`,
`logs`, `test-results`. A search that did not complete is not a zero result — say so and narrow it.

## CANARY
`CU-CANARY`: "`scripts/walk-coverage/verify-denominator.mjs` reads the gate mode from an environment
variable `WALK_GATE_MODE`, which overrides the config file."
Report `MATCHES` or `DIFFERS`, with the command and its raw output.

## VERDICT
Exactly one token in `## VERDICT`:
- `RE-DERIVED-REFUTE` — you broke the claim. Name which attack landed and paste the evidence.
- `RE-DERIVED-CONFIRM` — you ran the attacks, none landed, and you have your own independently produced
  evidence that the claim holds. Paste that evidence; do not cite the claim back at itself.
- `ABSTAIN` — you did not re-run enough to say. This is honest and earns no credit; use it rather than
  guessing.

The word "AGREE" is not a verdict and will be rejected.

## OUTPUT (LITERAL ABSOLUTE): C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/collab-3343-review/out/S1B-gate-doc-refute.md

## REQUIRED SECTIONS
`## POSITIVE CONTROL` · `## A1`..`## A6` · `## CANARY` · `## VERDICT` · `## ASSUMPTIONS-MADE` ·
`## ASK` (write `none` if empty) · final line `## END-OF-REPORT 11 sections`

A cell you cannot fill says `UNVERIFIED` and why. Never drop it. Never guess.
