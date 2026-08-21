# TICKET S1-A — Gate-mode documentation drift: FACTS, RELEVANCE, BLAST RADIUS

## EXECUTION MODE
edit — the ONLY file you may create or modify is your OUTPUT path below. Touching any other file is a
hard failure of this ticket. You need edit mode purely so the shell is available for grep / node / git.
You are NOT here to fix anything. Another stage does that.

## WHY
A suspected contradiction was noticed between this repo's agent documentation and its shipped gate
config. Before anyone edits a word, we need the facts, whether the change is worth making at all, and
what else it would touch. You establish that. A separate adversarial reviewer is, in parallel, trying to
prove the contradiction is NOT real. You will not see its answers and it will not see yours.

## THE PREMISE UNDER TEST (do not assume it is true)
- P1: `.claude/agents/REQUIREMENTS.md` states the unresolved-probe gate's current mode is `announce` and
  that promotion to `deny` is an open owner decision.
- P2: `.claude/guardrail-config.json` sets `unresolved_probe_mode` to `deny`.
- P3: `scripts/walk-coverage/verify-denominator.mjs` treats that value as blocking.
- P4 (the conclusion): the documentation therefore contradicts shipped behaviour and should be corrected.

## MEASUREMENT CONTRACT
Paste the exact command and its raw output for every answer. `file:line` on every quote.

**POSITIVE CONTROL (mandatory, first section).** Prove your search is not blind: grep for a string you
have already read with your own eyes in `scripts/walk-coverage/verify-denominator.mjs` and show the hit.
Until that control passes, an empty result proves nothing.

**Scoping note — recursive greps from the repo root time out on this machine.** Scope every search to
specific directories (`.claude/`, `scripts/`, `docs/read_only_docs/`, `plans/`) and exclude
`node_modules`, `_archive`, `out-*`, `dist`, `logs`, `test-results`. If a search does not complete, say
so and narrow it — never report a timed-out search as a zero result.

## QUESTIONS (numbered, in order)

Q1. Quote P1's sentence verbatim with `file:line`, plus 5 lines of surrounding context so its scope is
    visible. State plainly which gate that sentence is talking about.

Q2. Quote the `unresolved_probe_mode` value from `.claude/guardrail-config.json` with `file:line`.

Q3. Quote `readUnresolvedProbeMode()` in full with line numbers, and state verbatim what it returns for
    each possible config value including absent/unreadable.

Q4. Quote the block that consumes that mode and decides whether a failure is pushed as a hard reason or
    an announce-prefixed one. State exactly what changes between the two modes.

Q5. **Is there more than one gate here?** Enumerate every distinct gate/mode key in
    `.claude/guardrail-config.json` (list all keys and values verbatim) and every distinct
    `*_mode` reader in `scripts/`. State whether P1's sentence could be describing a *different* gate
    than P2's key. This is the question most likely to overturn the premise — treat it as such.

Q6. **Every other place carrying a mode claim about this gate.** Search `.claude/`, `docs/`, `plans/`,
    `scripts/` for `UNRESOLVED-PROBE-GATE`, `unresolved_probe_mode`, and `Current gate mode`. Report
    every hit with `file:line` and the claim it makes. Give the hit count first. This is the blast
    radius: how many files would have to change for the repo to be self-consistent.

Q7. **Git history of the drift.** `git log --oneline -10 -- .claude/guardrail-config.json` and
    `git log --oneline -10 -- .claude/agents/REQUIREMENTS.md`. Then find the commit that set
    `unresolved_probe_mode` to `deny` (`git log -S'"unresolved_probe_mode"' --oneline -- .claude/guardrail-config.json`)
    and quote its message. State whether the doc was touched in the same commit.

Q8. **The ramp obligation.** Quote LR-069 §3.3 (ramp discipline, announce → deny) verbatim from
    `.claude/rules/guardrail-policy.md` with line numbers. State, from the rule's own text, what a
    promotion to `deny` is required to produce. Then state whether any such record exists for this gate,
    with the search you ran.

Q9. **Relevance — is this worth doing at all?** Answer only from evidence, not opinion:
    (a) Which agents or skills load `.claude/agents/REQUIREMENTS.md`? Show the references that cause it
        to be read (`grep` for `REQUIREMENTS.md` and for `requirements` in `.claude/agents/`,
        `.claude/skills/`, `.claude/settings.json`, and any launcher/registry file you find).
    (b) Does the stale sentence sit inside a HARD STOP or other behaviour-governing block, or is it
        incidental prose? Quote the enclosing heading.
    (c) Is there any machine check that reads this prose? If not, say NONE.

Q10. **What would break.** For the minimal edit (correcting the mode sentence only), list every check,
     hook, or test that reads `.claude/agents/REQUIREMENTS.md` and could fail on a text change. Search
     `.claude/hooks/`, `scripts/check-*`, and any `*fixtures*.mjs` for that filename. Give the hit count
     first; `NONE` is a valid and useful answer.

## OUTPUT (LITERAL ABSOLUTE): C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/collab-3343-review/out/S1A-gate-doc-facts.md

## REQUIRED SECTIONS
`## POSITIVE CONTROL` · `## Q1`..`## Q10` · `## VERDICT-ON-P4` (one of `SUPPORTED` / `NOT-SUPPORTED` /
`UNDETERMINED`, plus the single piece of evidence that decides it) · `## ASSUMPTIONS-MADE` · `## ASK`
(write `none` if empty) · final line `## END-OF-REPORT 14 sections`

A cell you cannot fill says `UNVERIFIED` and why. Never drop it. Never guess.
