# Worker Doctrine Index

Lookup-only pointer registry. Workers read this to learn WHICH existing doc to cite in the ticket
`DOCTRINE` field — full technique is NOT stored here; read it from the cited source.

## Encore Walk / Divergence
- Full technique: `clients/encore/CLAUDE.md` → LR-ENC-001, LR-ENC-004, LR-ENC-005
- Baseline artifacts: `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`
- Cite in HUNTER/GIVER tickets: `DOCTRINE: clients/encore/CLAUDE.md LR-ENC-001`

## DOM Detection / Selectors
- Full technique: `.claude/rules/angular.md` + `clients/encore/CLAUDE.md` LR-036, LR-012, LR-017
- Cite in BUILDER/GIVER tickets: `DOCTRINE: clients/encore/CLAUDE.md LR-036`

## Spec Execution
- Individual-first / SKIP investigation / real-E2E: `docs/read_only_docs/AGENT_SHARED_RULES.md` §4
- FCC parity + gates: `clients/encore/CLAUDE.md` LR-ENC-002 (`npm run check:tc-parity`)
- Report readability: `clients/encore/CLAUDE.md` LR-ENC-006 (`npm run check:step-labels`)

## Env Config
- Full env rules: `clients/encore/CLAUDE.md` LR-ENC-003
- Login/creds + no-2FA fact: `clients/encore/CLAUDE.md` § "When encore needs fresh login session"

## Walk Oracles (INTERIM until PLAN_FORCED_DISCOVERY lands its machine gate)
- Full technique: `plans/pending/PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md` → "Cross-Check Kernel"
  (5 oracle classes: zero-effect/differential-data, UI-vs-persisted parity both directions,
  export→import round-trip, count-oracle API/footer-never-DOM, claim-vs-data census)
- MANDATORY: every walk/probe ticket's ACCEPTANCE carries the applicable oracle classes; a walk
  ticket whose ACCEPTANCE has none of them = dispatcher defect (bounce the ticket, not the worker)
- Cite in walk tickets: `DOCTRINE: plans/pending/PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md Cross-Check Kernel`

## Date / Field Constraints
- Date-offset sign rules: `clients/encore/CLAUDE.md` LR-008

## Ticket-Craft: WRITE-AS-YOU-GO (dispatcher-side; put this IN every read/review ticket)
- **Symptom**: worker exits 0, ledger says `success`, and `result.md` is empty or missing —
  the session ended before the batch write. All findings lost. Cost is a full re-dispatch.
- **Observed**: 3 seats lost in one session (2026-07-21, `depth-ev-a-01/-a-02`, `depth-ev-c-01`);
  a 4th (`dlv-reverify-gate-r2-01`) died the same way. `ask_open: missing-section` in the ledger
  is the tell. Prior occurrence 2026-07-17 (3 deaths) — this is a RECURRENCE, not a first offence.
- **Contract to paste into the ticket** (not optional on any multi-question read/review ticket):
  1. FIRST action = create the output file containing only the section headings.
  2. Append each answer IMMEDIATELY after finding it — never hold answers to write at the end.
  3. If budget runs low: STOP READING and append what you have. Partial on disk = SUCCESS; empty = failure.
- **Also**: narrow the question set. A 6-question ticket dies; a 3-question ticket lands. If a ticket
  needs more, split it into disjoint lots rather than trusting one session to survive.
- **Dispatcher note**: a seat that dies this way is a *ticket* defect first (over-scope / batch-write),
  not a worker defect — fix the ticket before spending a second attempt (CONSULT-at-attempt-2).
