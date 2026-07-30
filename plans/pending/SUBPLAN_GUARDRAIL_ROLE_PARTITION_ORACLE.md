# SUBPLAN_GUARDRAIL_ROLE_PARTITION_ORACLE

**Status**: PENDING
**Priority**: High — closes the one coverage class the generative oracle structurally cannot derive
**Created**: 2026-07-29
**Identity**: OWNER
**Parent**: (none — standalone guardrail stub per LR-069 §3.3.3)
**Depends on**: `scripts/walk-coverage/generate-invariants.mjs`; `scripts/walk-coverage/interaction-map-schema.mjs` (`capability` field); `scripts/check-interaction-coverage.mjs`; `scripts/walk-coverage/domain-invariants.json` (`coverageGaps`)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

## LR-069 §3.4 rent header

**Severity**: S1 — silent quality drift that survives to ship. A permission defect is invisible to every
existing check, so it reaches production behind a green suite.
**Graduating incident**: NAV-4180 — a user holding the Sales Read Only role can add recommendations to
the Price Guide. Surfaced 2026-07-25 by the domain-rule harvest for
[PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md](PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md), which recorded
it in its own `coverageGaps` rather than burying it as an ordinary row.

## Context

The parent plan's central claim is that a surface is covered the moment it is catalogued: extract the
surface's metamodel, generate every invariant its shape implies, check. That holds for **CRUD shape** —
verbs, filters, grids, io pairs, typed fields — because those are what the extractor reads.

**Role is not part of the shape it extracts.** Every kernel oracle and every generated invariant
(I1–I11) reasons about *a single actor's view of data*. Not one of them re-executes an action under a
**different role** and asserts refusal. A walk performed as an admin cannot observe NAV-4180 at all: the
control is present, it works, the data is correct. The defect is that somebody *else* can reach it.

So permission invariants fall outside the generated set entirely — not by oversight but by construction.
This subplan adds the missing axis.

A second class with no oracle home surfaced in the same harvest and is carried here rather than left to
orphan: **state-precondition** (NAV-3357 — no proposal may be raised while a Quote DocuSign is active or
pending). Lower severity than the permission gap, same structural shape: a rule about *when* an action is
legal that no single-actor CRUD invariant expresses.

## Bootstrap

- **Identity**: OWNER
- **Skills auto-called**: `/identity`; `/execute` when run
- **Context files**: this file; [PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md](PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md) (the parent gap record + the I1–I11 algebra); `.claude/rules/guardrail-policy.md` (LR-069 §3.3 ramp, §3.4 budgets); `.claude/rules/inventory.md` (LR-062 denominator, LR-064 tiered walk); `.claude/rules/browser-tool.md`

## Phase 0 — Unlock gate

**The named unlock: per-role test credentials.** Every walk this pipeline runs today authenticates as a
single automation account. A role-partition oracle cannot execute at all without at least two accounts —
one holding the permitted role, one holding a restricted role such as Sales Read Only.

Verify what exists before building anything: check `clients/encore/.env.local` for any second account,
and confirm with the client which roles are provisionable on the E2E environment. If only one account
exists, this is a **named blocker with a named unlock** — escalate via `/encore-questions` for a
read-only-role account. Do not proceed to Phase 2 on a single account and do not simulate a role.

### Role vocabulary — found 2026-07-30, no longer a gap

This subplan was authored without naming which roles to partition against. Two Confluence sources
supply that, found during the domain-oracle harvest:

- **Navigator Legacy Permissions — Design Spec** (Confluence page `3871342594`, space NM) —
  *"Document all security roles (permissions), access levels, and authorization patterns used in the
  legacy Navigator HeliosWeb application… preserving exact role keys, client UI gates, and backend API
  enforcement."* This describes the **application actually under test** and is therefore the primary
  source. **Read it before Phase 1** — it carries the exact role keys the oracle must assert against,
  and the client-UI-gate vs backend-API-enforcement split is precisely the both-directions distinction
  Phase 1 requires.
- **Pricing** (Confluence page `3866099713`) — the successor microservice enforces three policies:
  `PricingRead` on GETs, `PricingWrite` on POST/PUT/DELETE, `PricingDelete` on strategy deletion.
  **Design-spec, not live-verified** — it documents the rewrite, not today's behaviour. Useful as the
  shape the read/write partition is heading toward; not evidence of what the live app enforces now.

### What the legacy permissions spec actually gives us (read 2026-07-30)

Confluence page `3871342594` was read in full. It supplies more than names — it supplies the whole
partition mechanism, and it changes what Phase 2 needs.

**The governing role for this surface is `NavRevenueMgmt`** — "Price books, discount pricing, **PG
overrides**". Setup-screen edit gate: `roleCanEdit(NavRevenueMgmt)`. Menu visibility: corp +
`roleCanView(NavRevenueMgmt)`. Backend: `PricebookController` / `PriceGuideController` /
`DiscountMatrixController` enforce `NAVOrderEntry` **and** `NavRevenueMgmt`.

**Access is a three-level scalar, not a boolean** — this is the both-directions mechanism the invariant
needs:

| Value | Constant | View | Edit |
|---|---|---|---|
| 1 | `ACCESS_TYPE_NONE` | No | No |
| 2 | `ACCESS_TYPE_READ` | **Yes** | **No** |
| 3 | `ACCESS_TYPE_EDIT` | Yes | Yes |

with `roleCanEdit → Value === 3` and `roleCanView → Value > 1`. So the refusal direction is
concretely testable: `NavRevenueMgmt` at Value 2 must render the surface and refuse the mutation.

**Roles are location-scoped and reload on office change** — served by
`GET User/Role?locationId=&userName=&culture=`, cached in `SessionKeys.Roles`, "refreshed on local
office change". **This may unblock Phase 2 without new accounts**: the same automation account can hold
different access values at different offices. Phase 0's first action should now be to call that
endpoint across the offices we already use and look for a `NavRevenueMgmt` value that differs. If one
exists, the partition is testable today.

**Ready-made fixture source**: the spec's own *Client / Server Discrepancies* table documents nine
cases where the client UI gate and the backend API enforcement disagree — e.g. payment entry requires
`NavPayment` in the UI while `PaymentController` checks only `NAVOrderEntry`; `NavVenueTransferApprover`
is defined and never enforced; the room-dashboard check is commented out. **That table is the
role-partition bug class, already catalogued.** NAV-4180 belongs to it: Price Guide edit is
`NAVOrderEntry` locally but `NavRevenueMgmt` at corp, so a role that should not edit can reach it.
Phase 2 should fixture from this table rather than inventing cases.

**What remains blocked**: two accounts with genuinely different `NavRevenueMgmt` values, **if** the
per-office lookup above finds none. That would still be an `/encore-questions` escalation — but it is
now a last resort rather than the starting point, and it asks for a specific role at a specific access
value instead of "a read-only account".

Phases 1 and 3 are buildable without the credentials; Phase 2 is not.

## Phase 1 — Extend the metamodel, not just the checker

**This is the load-bearing design decision.** Appending a single NAV-4180 regression fixture would be
the one-off fix the parent plan's own doctrine convicts. The class is `crud-derivable` once *actor* is
part of the shape — so the fix extends the **generator**.

Add `roles` / `actor` to the metamodel M that `scripts/walk-coverage/generate-invariants.mjs` consumes,
and emit a new invariant row from it — the role-partition invariant — the same way I1 is emitted from
the presence of a filter. The contract of that invariant, stated so it is greppable:

> **Role-partition invariant**: for each mutating action on the surface, re-execute it under each
> configured role and assert **both directions** — the action is **refused** for a role that should not
> hold it, and **succeeds** for a role that should. A one-directional check proves nothing, exactly as a
> filter probed in one direction proves nothing.

Both directions are non-negotiable, for the reason the parent plan already established for filters: an
assertion that only ever observes one side of a partition cannot distinguish a working control from a
dead one.

`--superset-proof` must continue to pass, and the anti-hardcode property must hold for the new row:
remove `roles` from a metamodel and the role invariant must disappear from the generated set.

## Phase 2 — RED fixture and checker sub-check

Transcribe NAV-4180 into a fixture under `scripts/walk-coverage/fixtures/` — real ticket, real surface,
recording that the Sales Read Only role reached the Price Guide recommendation action. Add a
`role-partition` sub-check to `scripts/check-interaction-coverage.mjs` that **fails** that fixture, and
**passes** an honest control where the same action is correctly refused.

Wire the disposition through `scripts/walk-coverage/interaction-map-schema.mjs`, whose existing
`capability` field is the natural carrier — extend it rather than adding a parallel field.

An honest control is mandatory: without a case that must come back clean, the sub-check cannot be
distinguished from one that fails everything.

## Phase 3 — Carry the state-precondition class

Add `state-precondition` as a second named row: an action legal only under a precondition on another
object's state (NAV-3357 — no proposal while a Quote DocuSign is active/pending). Same treatment —
derive it from the metamodel where the shape allows, fixture it, check it. If it proves genuinely
underivable from shape, record that in `domain-invariants.json` as a domain rule with its source rather
than forcing it into the generated set.

## Phase 4 — Close the parent's gap record

Remove the permission-invariant entry from `coverageGaps` in
`scripts/walk-coverage/domain-invariants.json` **only** once the oracle demonstrably catches NAV-4180,
and record what replaced it. A gap deleted without a mapped replacement is a feature drop wearing a
cleanup costume — the protection-parity discipline applies.

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | the role-partition sub-check | scripts/check-interaction-coverage.mjs | node scripts/check-interaction-coverage.mjs --self-test |
| GARDENER | (none) | (none) | (none) |
| OWNER | generator + schema + fixtures | scripts/walk-coverage/generate-invariants.mjs<br>scripts/walk-coverage/interaction-map-schema.mjs | node scripts/walk-coverage/generate-invariants.mjs --superset-proof |

## Acceptance criteria

- [ ] Phase 0 unlock resolved: a second account with a restricted role exists, or the blocker is escalated with the unlock named
- [ ] `roles`/`actor` present in the metamodel; the role-partition invariant is **generated** from it, not hardcoded — proven by removing `roles` and watching the row disappear
- [ ] Both directions asserted: refusal for the restricted role AND success for the permitted role
- [ ] NAV-4180 fixture exists and the checker FAILs it; an honest control PASSes
- [ ] `--superset-proof` still exits 0 with `ANTI_HARDCODE: PASS`
- [ ] `state-precondition` (NAV-3357) carried as a named row, derived or recorded as a domain rule with its source
- [ ] `coverageGaps` permission entry removed only after the oracle catches NAV-4180, with the replacement named

## Handoff

Chat-only per LR-039. Outcomes, not obstacles.
