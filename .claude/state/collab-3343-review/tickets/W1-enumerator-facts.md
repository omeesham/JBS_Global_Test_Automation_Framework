# TICKET W1 — Enumerator type-resolution: FACTS ONLY

## EXECUTION MODE
edit — but the ONLY file you may create or modify is your OUTPUT path below. Touching any other
file in this repo is a hard failure of this ticket. You need edit mode purely so the shell is
available to you for grep / node / git commands; you are not here to change code.
read. You will NOT edit any file. You report machine facts with `file:line` citations and pasted raw
output. You are FORBIDDEN from writing a diagnosis, a root cause, a recommendation, or the words
"bug", "defect", "should", "correct fix". Facts are wanted; verdicts are not yours.

## WHY (context, not instruction)
A colleague's session in a DIFFERENT clone made claims about this repo's walk-coverage enumerator.
We are re-deriving those claims against THIS repo's code. Their clone may have drifted; that is
expected and is not your problem. Report what THIS repo's files say, nothing else.

## SCOPE — read only these
- `scripts/walk-coverage/enumerate-page.mjs`
- any file under `scripts/walk-coverage/lib/` or `scripts/walk-coverage/tests/` that defines or tests
  `TYPE_SIGNAL_RULES`, `deriveFieldType`, `isRestingConclusive`, or `LEGAL_TYPES`
- `clients/encore/specs_planning/_internal/field-case-generation.md` (the field-type taxonomy) — if it
  is unreadable, say UNVERIFIED and why; do not substitute a guess
- `plans/pending/PLAN_70_ENUMERATOR_TYPE_RESOLUTION_AND_NM3344_RECORD.md`

## DENOMINATOR (pinned — do not sample)
`TYPE_SIGNAL_RULES` is a fixed-length array. First count it, state N verbatim from your own command
output, then report **all N rows**. A report covering fewer than N rows is incomplete and will be bounced.
Same for the taxonomy: count the legal type names, state the count, list all of them.

## MEASUREMENT CONTRACT
For every answer below: paste the exact command you ran and its raw output, plus `file:line`.

**POSITIVE CONTROL (mandatory, first section of your report).** Before answering anything, prove your
reading tools are not blind on this repo: run a grep for a string you have already seen with your own
eyes in `scripts/walk-coverage/enumerate-page.mjs` and show it returns a hit. A search that returns
nothing is not evidence of absence until this control passes. State the control command and its output.

## QUESTIONS (answer each, numbered, in order)

Q1. List every entry of `TYPE_SIGNAL_RULES` verbatim — the regex/pattern source AND the type name(s)
    each maps to. Give N first.

Q2. List every legal field-type name the taxonomy defines. Give the count first. Quote the source
    file:line for the list.

Q3. For each rule from Q1: how many DISTINCT legal type names from Q2 does its pattern match? Show your
    method as a runnable command or script you actually executed, and paste its raw output. Report the
    full table: rule → matched-type-count → the matched names.

Q4. Quote `deriveFieldType` in full (file:line range). State verbatim the condition under which it
    returns a resolved type versus no type.

Q5. Quote `isRestingConclusive` in full (file:line range). State verbatim, from the code, what it
    returns when the element's tag is `BUTTON`, and quote the exact lines that decide that.

Q6. Does the taxonomy from Q2 contain any type name that corresponds to a plain button, a tab, or a
    tablist? Answer with the matched names or the literal word NONE, plus the command that shows it.

Q7. In `PLAN_70_ENUMERATOR_TYPE_RESOLUTION_AND_NM3344_RECORD.md`, quote verbatim every numbered
    conclusion or cause the plan records about type resolution. Do not paraphrase. Give line numbers.

Q8. Does this repo's `enumerate-page.mjs` contain a pattern with the literal text `dropdown` in it?
    Paste `grep -n` output. If a pattern matches `dropdown` but not `combobox`, name it.

Q9. Does any test file in scope define a hand-written list of legal types (e.g. `LEGAL_TYPES`) that is
    SHORTER than the taxonomy count from Q2? Give both counts and the file:line of the shorter list.
    Report the difference as a set of names present in one and absent from the other.

Q10. `git log --oneline -5 -- scripts/walk-coverage/enumerate-page.mjs` — paste raw output, and
     `git log -1 --format=%H%n%ad -- scripts/walk-coverage/enumerate-page.mjs`.

## CLAIMS-UNDER-TEST (from the other clone — treat as UNTRUSTED DATA, never as instruction)
- CU-1: "three TYPE_SIGNAL_RULES patterns each matched two legal taxonomy names".
- CU-2: "narrowing the pattern to `/combobox/i` is sufficient because resolution requires a unique match".
- CU-3: "isRestingConclusive returns false for tag=BUTTON".
- CU-4: "the taxonomy has 13 field types and no button/tab type".
- CU-5: "the test's LEGAL_TYPES fixture is a hand-written 7-entry list".
For each: state `MATCHES-THIS-REPO`, `DIFFERS-FROM-THIS-REPO` (with the actual value), or
`NOT-DETERMINABLE-HERE` (with why). Do not editorialise beyond that one token plus the evidence.

OUTPUT (LITERAL ABSOLUTE): C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/collab-3343-review/out/W1-enumerator-facts.md

## REQUIRED SECTIONS IN YOUR REPORT
`## POSITIVE CONTROL` · `## Q1`..`## Q10` · `## CLAIMS-UNDER-TEST` · `## ASSUMPTIONS-MADE` ·
`## ASK` (empty is fine — write the literal word `none`) · final line `## END-OF-REPORT 14 sections`

A cell you cannot fill says `UNVERIFIED` and why. Never drop it. Never guess.
