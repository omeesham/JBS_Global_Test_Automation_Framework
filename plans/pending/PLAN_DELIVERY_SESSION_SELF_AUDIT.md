> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_DELIVERY_SESSION_SELF_AUDIT.md`. All context below.**
>
> The agent self-bootstraps from the frontmatter + sections in this file, without additional prompting:
>
> 1. **Identity**: load `/identity WATCHDOG`. This plan audits work already done; WATCHDOG is the audit role.
> 2. **Skills**: `/audit` (review mode + slop mode), `/delegation-temp`, `/ultrathink`.
> 3. **Model + thinking + permission-mode**: read `**Model**` / `**Thinking**` / `**PermissionMode**` below.
> 4. **Dependency gate**: Phase 0 (owner interrogation) must show GO before ANY dispatch. HALT otherwise.
> 5. **Context load**: this file in full, plus `plans/pending/PLAN_DELIVERABLE_SCOPE_LOCK.md`
>    (the work under audit) and `.claude/state/ua-worker/chips/deliv-leak/SLOP-DEFINITION.md`.
> 6. **Browser tool**: `none` — no live app work in this plan.
> 7. **Execute Phase 0 first.** It is a human gate, not a formality.
> 8. **Handoff**: findings to the owner in chat; flip the Status field and add the Executed date only
>    after every lot has a dispositioned verdict.
>
> **HALT + ASK OWNER** if: any lot's finding would invalidate a decision already shipped into the
> manifest or the gate · two lots' findings conflict · a lot cannot machine-enumerate its denominator ·
> any worker proposes a repo mutation (this plan is diagnosis-only).

---

# PLAN — Delivery Session Self-Audit

**Status**: PENDING
**Priority**: P0 — blocks the push
**Created**: 2026-07-30
**Identity**: WATCHDOG
**Parent**: (none — peer of `PLAN_DELIVERABLE_SCOPE_LOCK.md`)
**Depends on**: none (runs in parallel with the scope-lock execution)
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: multi-rule judgment across eight independent audit lots, adversarial verification of
a gate mechanism, and a closure gate that decides whether a client delivery may be pushed. Getting a
false GREEN here re-ships the leak this session exists to fix.
**PermissionMode**: auto
**BrowserTool**: none

---

## 1. Context — why this plan exists

This session found that the client-delivery mirror's `main` branch carried 32 files and 289 test-case
rows the client was never meant to receive, built a manifest + an allowlist gate to make that
structurally impossible, and is now mid-way through producing a corrected payload.

**The problem is that all of that was done by the same agent, in one context, at speed.** Four defects
in this session's own work are already proven:

| # | What I got wrong | How it was caught | Blast radius |
|---|---|---|---|
| 1 | Classed `NM-####` (the **client's own** Jira prefix) as internal jargon to strip | A path-scoped rule file loaded and contradicted me | 11 audit workers inherited the wrong premise → 104 bad findings; 2 build workers stripped 132 references across 35 of the client's tickets before revert |
| 2 | Said the delivered branches use the pre-2026-07 workbook folder, in the present tense | Owner corrected me — that folder had already been renamed to `testcases/` before the delivery | Would have dismissed a real 289-row leak as a path artifact |
| 3 | Dispatched a hand-edit strip that destroyed 53 test-case IDs and broke syntax | Post-run count check | Full revert; re-scoped as a codemod |
| 4 | Dispatched a source-tree prune that broke our own build | Typecheck | Full revert; re-scoped as a payload-time transform |

Three of those four were caught by luck or by the owner — not by a control. That is the audit gap this
plan closes: **an independent, adversarial re-examination of this session's own work, run before the
push rather than after it.**

The owner's framing, verbatim: *"make sure no fuckups can pass through anything ... all fuckups, all
assumption based decisions u could have made, final deliverable, the things that should go vs not go
should be audited, the things u did should be audited, everything i said should be considered ...
nothing shitty passes, and nothing important is considered shit and removed."*

Two directions, equally weighted. Defect #1 above is the **false-positive** direction — valuable
content destroyed because a classifier was confidently wrong. Most audits only look for the
false-negative direction. This one must look both ways.

---

## 2. Prior-Fix Trial (LR-069 §3.5 — mandatory: this is a recurrence-class plan)

"An audit missed something" is a class that has already been 'permanently' fixed here. Each prior fix
is tried before a new mechanism is proposed.

| Prior fix | What it did | Why it did not fire this session | Verdict |
|---|---|---|---|
| **AUD-017 / `/audit` Step 0 self-audit gate** | Blocks a session from auditing its own work — two-signal detection (activity-log recency + self-authored audit content) | **`scoped-wrong`.** It gates the `/audit` *skill invocation* against a *plan file*. This session's work was mostly worker dispatch + script authoring, and the target was a remote git ref, so neither signal could fire. The self-audit happened anyway — just not through `/audit`. | **CONVICTED** — scope must extend to session-work, not just plan-file targets |
| **Cross-family adversarial review (`/delegation-temp` §Fight-Protocol)** | Reviewer's provider ≠ executor's; no provider grades its own homework | **`different-sub-class`.** It fired correctly and caught real defects (a compile break, the `client:ship` front-door bypass, a body-level bypass). It reviews *worker output against the ticket*. It cannot catch a wrong **premise in the ticket** — every reviewer inherited `SLOP-DEFINITION.md` too. | **SURVIVES** for its class; a premise-audit lane is genuinely new (Lot A8) |
| **`/audit` Step 2.5 claim-vs-artifact cross-check** | Every specific numeric claim must be re-derived from the artifact | **`rubber-stampable` in practice.** It has no machine denominator — "every claim the session made" is model-recalled, so the claims an agent forgot are exactly the ones that go unchecked. | **CONVICTED** — Lot A2 supplies the missing machine denominator (the transcript) |
| **Machine-denominator law (`PLAN_REPO_SLOP_SWEEP.md:36-38`)** | A sweep's denominator must be machine-enumerated, never model-judged | **`scoped-wrong`.** Written for file sweeps. Nobody applied it to *instructions* or *claims*, which is where this session's misses live. | **CONVICTED** — Lots A1/A2 extend it to the transcript |

**Rewire obligations carried in this plan's scope** (LR-050 — no convicted fix left idling): Lot A1/A2
extend the machine-denominator law to transcript-derived denominators; Phase 5 files the AUD-017 scope
extension and the Step-2.5 denominator fix as concrete rule amendments. No new mechanism is proposed
where a convicted fix can simply be repaired.

---

## 3. The three anti-priming laws (structural — these are what make this audit worth running)

An audit that inherits the auditee's conclusions returns the auditee's conclusions. Defect #1 above is
the proof: one wrong sentence in a shared doctrine file became one wrong finding per worker. These
laws are binding on every ticket this plan dispatches.

**L1 — Auditors receive artifacts and the owner's verbatim words. Never my summaries.**
No ticket may contain my conclusion, my count, my classification, or my verdict as a *premise*. Where a
lot must check one of my claims, the claim is quoted as **"the claim under test"** and the ticket
demands independent re-derivation. A ticket that says "verify the 289 rows" is malformed; the correct
form is "count the withheld rows yourself, then compare to the claimed 289."

**L2 — Every denominator is machine-enumerated, and every extractor is validated before its count is trusted.**
Discovered while drafting this plan: a naive JSONL extractor over the session transcript returned **21
"user instructions"**, of which 8 were skill injections, interrupt markers, or compaction wrappers —
and it **silently omitted at least 7 instructions known to exist** (`abuse the council of copilot`,
`we need to put justifying relevant comments`, `clear all fucking assumptions!`, and others). An
unvalidated extractor produces a confident, wrong denominator, and every instruction it drops is one
the compliance audit never checks. Therefore: **each lot must first prove its extractor finds a
supplied set of known-present items, and report the count only after that proof passes.**

**L3 — Both error directions carry equal weight; the false-positive direction is named first.**
Every finding is classified `LEAKED` (shit that would ship) or `DESTROYED` (value that would be
removed, or was). A lot that reports only `LEAKED` findings has done half the job and is bounced.
This law exists because defect #1 was a `DESTROYED` finding and the entire 11-worker audit was blind
to that direction.

---

## 4. Phase 0 — OWNER INTERROGATION GATE (hard, human)

**Nothing in Phases 1+ dispatches until the owner has read this plan, interrogated it, and said go.**

This is the owner's explicit instruction: *"only plan it, no action on it until i see what u found and
interrogate you on."* This phase is the gate, not a formality — an agent that reads this file and
starts dispatching has violated the plan on line one.

State to present at the gate: this plan, the eight lots, and the honest limits in §8.

---

## 5. Phase 1 — the eight audit lots

Two chief seats (`feedback_two_chiefs_always_default`), cross-provider, four lots each. Every lot is
**diagnosis-only**: no edits, no commits, no pushes, no remote mutation. Findings tables only.

### Seat assignment

| Seat | Provider family | Lots | Rationale |
|---|---|---|---|
| **DEV chief** | family X | A3, A6, A7, A8 | mechanism, mutation, scope-derivation, premise — the "is the thing built right" half |
| **QA chief** | family Y (≠ X) | A1, A2, A4, A5 | instructions, claims, both slop directions — the "did we do what was asked, honestly" half |

Neither chief may review its own lots. Fight protocol applies: reviewer finds → **author defends** →
iterate to alignment → only the aligned result reaches me. A review that reaches me without the
author's defense is a protocol defect and goes back.

---

### Lot A1 — Instruction compliance

**Question**: of everything the owner said this session, what did I honor, half-honor, quietly drop, or
contradict?

- **Denominator**: user instructions extracted from the session transcript at
  `C:\Users\RutvikKhorasiya\.claude\projects\C--Users-RutvikKhorasiya-projects-encore-framework\97fc2a8f-d682-49e5-ad02-431273e486b4.jsonl`
  (2933 lines), plus the pre-compaction instructions preserved in the summary block.
- **L2 validation set** (the extractor must find all of these before its count is trusted):
  `abuse the council of copilot` · `there is also a sloppy shitty _unit file` · `we need to put
  justifying relevant comments if its needed` · `clear all fucking assumptions!` · `do we need it?
  /slop check!` · `THEY WERE TO BE DELIVERED, ONLY some locations module AND local office` ·
  `do not change anything until i know what happened`.
- **Output**: one row per instruction — verbatim quote, date, disposition
  (`HONORED` / `PARTIAL` / `DROPPED` / `CONTRADICTED`), and the artifact evidence for the disposition.
- **The rows that matter most** are `DROPPED` and `CONTRADICTED`. A lot returning zero of either on a
  session this long is not credible and gets bounced.
- **Specifically check**: the standing constraints — *"do not change anything until i know what
  happened"*, *"only stop before pushing"*, *"corp = everything to be delivered"*, *"local office was
  never to be included"*, and the justifying-comments requirement. Each of those is a rule I was
  supposed to still be obeying at the end, not just at the moment he said it.

### Lot A2 — Claim verification

**Question**: which numbers and verdicts I reported to the owner are actually true?

- **Denominator**: every quantitative or factual claim in my assistant turns, machine-extracted from the
  same transcript (numbers, counts, "verified", "reverted in full", "exit 0", file paths, verdicts).
- **Method**: re-derive each independently from the artifact. Do **not** read my reasoning for it.
- **Claims explicitly under test** (quoted as claims, not premises): `179/179 files audited, zero gaps` ·
  `212 findings` · `32 files + 289 test-case rows leaked` · `395 violations at the real main` ·
  `883 TC ids and 35 NM tickets restored after the revert` · `typecheck exit 0` · `tc-parity exit 0` ·
  `manifest reconciles 179/179, unclassified 0` · `.env.local is a blank template, no credential leaked` ·
  `encore-qa-tracker.xlsx is clean`.
- **Output**: claim · where I said it · independent re-derivation · `TRUE` / `FALSE` / `UNPROVABLE`.
- `UNPROVABLE` is a respected verdict and must not be guessed into `TRUE`.

### Lot A3 — Scope re-derivation: what should go vs what should not

**Question**: is the delivered/withheld classification correct — derived from primary evidence, not
from my judgment?

- **Denominator**: all 30 modules in `scripts/deliverable/delivery-manifest.encore.json`.
- **Method**: classify each module **from primary evidence only** — the owner's verbatim words, Jira,
  the plans, the approval log's cited sources. Then diff against the manifest.
- **Every status needs a primary-evidence pointer.** A status I set with no pointer, or whose only
  pointer is my own transcription of an instruction, is a finding — a transcribed instruction is not
  independent evidence of approval.
- **Specifically re-derive**: corporate = all delivered (incl. NM-2271/2272/2273) · local-office = never
  delivered · which locations modules are delivered and which are not · the `INTERNAL.UNIT` classification.
- **Both directions** (L3): a module wrongly marked delivered is a leak; a module wrongly marked
  withheld silently denies the client work they paid for and is equally a finding.

### Lot A4 — Reverse-slop: what would we destroy that has value?

**Question**: what is being removed, or was proposed for removal, that the client actually wants?

- **Denominator**: the 212 findings across the 11 lot reports, plus every removal the corrected payload
  performs, plus every token the new gate rejects.
- **Method**: for each proposed or executed removal, ask **"who owns this identifier / this content?"**
  Client-owned content is an asset. This is the generalized form of defect #1.
- **Known case to confirm is fully reverted, then look past it**: `NM-####`. The interesting output of
  this lot is the *other* cases — the ones nobody has noticed yet.
- **Also**: does the new gate reject anything legitimate? A false positive in a gate is how the gate
  gets switched off.
- **Output**: content · who owns it · what removes it · would the client miss it · severity.

### Lot A5 — Forward-slop on the corrected payload

**Question**: what slop survives into what we are actually about to ship?

- **Denominator**: the corrected payload tree — **not** `encore-mock/main`. The 11 prior lots audited
  the old leak; nobody has audited the new payload.
- **Method**: the `SLOP-DEFINITION.md` classes S1–S10, **with its corrected NOT-SLOP section binding**.
- **Read every line of every text file.** Grep finds the classes you thought of.
- **Also verify** the owner's standing rule: every surviving artifact that needs justification carries a
  plain-English, client-readable comment. Anything that cannot be justified in plain English does not ship.

### Lot A6 — Mechanism adversarial: break the gate

**Question**: how do I get an unapproved file into a client delivery past the new controls?

- **Targets**: `scripts/verify-approved-scope.mjs` · `scripts/validate-delivery-manifest.mjs` ·
  `scripts/ship-branch.sh` · `scripts/ship-client.sh` · `scripts/ship-client.ps1` ·
  `scripts/deliverable/delivery-manifest.encore.json`.
- **Stance**: adversarial. Do not review the code for correctness — **attack it.** Produce concrete
  bypasses with the exact input that achieves them.
- **Attack classes to cover at minimum**: missing-file fail-open · manifest edited in the same commit as
  the payload · a path that resolves outside the checked set · symlinks · case-insensitive filesystem
  collisions · a test id that resolves to nothing · an import that reaches a withheld page by a
  re-export chain · workbook sheets (the gate reads files; who reads inside the `.xlsx`) · the
  `client:ship` front door vs the `ship-branch` back door · CI or a script invoking the builder directly.
- **Output**: attack · does it work · file:line of the hole · minimal fix. A lot that finds zero
  bypasses is bounced — the gate is four days old and was written by one agent under time pressure.

### Lot A7 — Mutation blast radius

**Question**: every file this session changed — is the change correct, justified, and safe?

- **Denominator**: `git status --porcelain` + `git diff` for the working tree, filtered to files this
  session actually touched (the rest predate it — establish which is which from mtime and the diff
  content, do not assume).
- **Known session mutations to cover**: the 9 files EX7 edited · `scripts/lib/forbidden-patterns.mjs` ·
  `clients/encore/src/utils/field-case-runner.ts` (the evidence-directory rename) · `.gitignore` ·
  the three ship scripts.
- **Specifically**: does the `.machine-evidence` → `.test-evidence` rename leave any dangling reader,
  and is the new directory actually gitignored? Untracked `clients/encore/.machine-evidence/` still
  exists on disk — establish whether that is stale output or a live writer.
- **Repo hygiene**: untracked junk sitting in the tree — `100`, `accept-denom.mjs`,
  `clients/encore/clients/` (a nested client directory), `clients/encore/diag.js`, and seven `.png`
  screenshots. For each: whose is it, does it ship, does it get committed by an unlucky `git add -A`.
- **Output**: file · change · justified (y/n) · breaks anything (y/n) · would it ship.

### Lot A8 — Premise audit (the lot that would have caught defect #1)

**Question**: are the *premises* the other lots are standing on actually true?

- **Targets**: `SLOP-DEFINITION.md` · `scripts/deliverable/delivery-manifest.encore.json` ·
  `scripts/deliverable/approval-log.md` · `plans/pending/PLAN_DELIVERABLE_SCOPE_LOCK.md`.
- **Method**: for every classification rule, definition, or approval row in those files, find the
  **independent authority** that confirms it — a rule file, the owner's words, a Jira record, product
  documentation. A premise with no authority, or one contradicted by an existing authority, is a finding.
- **This is the lot that pays for the whole plan.** Defect #1 was a single wrong sentence in a shared
  doctrine file that multiplied into 11 workers' output. The check that would have caught it —
  *"grep the repo for an existing authority on this question before writing a definition many workers
  will consume"* — is exactly this lot's method.
- **Output**: premise · verbatim · authority found · `CONFIRMED` / `CONTRADICTED` / `UNSOURCED` ·
  what it contaminated if wrong.

---

## 6. Phase 2 — Synthesis and adversarial defense

1. Each chief synthesizes its four lots into one findings table.
2. Cross-review: each chief attacks the other's synthesis. Author defends. Iterate to alignment.
3. **Conflict rule**: two lots disagreeing is a finding in itself, escalated to me — never silently
   resolved by picking the more confident report.
4. I read the machine facts and the raw findings myself before accepting anything
   (`feedback_worker_report_claims_need_own_grep` — a worker's acceptance is a claim).
5. Findings are ranked and dispositioned: `MUST-FIX-BEFORE-PUSH` / `FIX-AFTER` / `ACCEPT-WITH-REASON`.

---

## 7. Phase 3 — Verdict gate

The audit's output is a **push decision**, presented to the owner:

- **GREEN** — no `MUST-FIX-BEFORE-PUSH` finding. Push may proceed on the owner's go.
- **YELLOW** — findings exist, all fixable inside the current work. Fix, re-verify the affected lots
  only, then re-present.
- **RED** — a finding invalidates a decision already built into the manifest or the gate. Stop. The
  scope-lock work is reopened before anything is pushed.

**The verdict does not authorize the push.** The owner does. This gate only establishes whether the
push is defensible.

---

## 8. Honest limits of this plan (stated up front so the verdict is not oversold)

1. **A clean audit is not proof of a clean delivery.** Eight lots reduce the chance a defect survives;
   they do not eliminate it. The prior audit was thorough and still shipped a wrong premise to 11 workers.
2. **The workers can be wrong too.** Cross-family review and the fight protocol are mitigations, not
   guarantees. Lot A8 exists precisely because a shared wrong premise defeats reviewer diversity.
3. **The transcript is a lossy record.** Compaction summarized the earlier session; some of my reasoning
   is gone. Lots A1/A2 audit what was *said and written*, which is the durable part — not what I thought.
4. **This plan was written by the agent under audit.** I chose the lots, which means I chose the blind
   spots. Lot A8's premise audit covers this plan itself, and the owner's Phase 0 interrogation is the
   real control. If a lot is missing, that is a defect this plan cannot self-detect.

---

## 9. Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) — no requirements intake | `(none)` | n/a |
| GIVER | (none) — no test cases or plans authored | `(none)` | n/a |
| BUILDER | (none) — diagnosis-only plan, zero code produced | `(none)` | n/a |
| HEALER | (none) — no RCA-driven fixes in scope | `(none)` | n/a |
| WATCHDOG | findings tables (all eight lots) | `.claude/state/ua-worker/chips/deliv-audit/SYNTHESIS.md`<br>`.claude/state/ua-worker/chips/deliv-audit/out-a1/A1-INSTRUCTION-COMPLIANCE.md`<br>`.claude/state/ua-worker/chips/deliv-audit/out-a2/A2-CLAIM-VERIFICATION.md`<br>`.claude/state/ua-worker/chips/deliv-audit/out-a3/A3-SCOPE-REDERIVATION.md`<br>`.claude/state/ua-worker/chips/deliv-audit/out-a4/A4-REVERSE-SLOP.md`<br>`.claude/state/ua-worker/chips/deliv-audit/out-a5/A5-FORWARD-SLOP.md`<br>`.claude/state/ua-worker/chips/deliv-audit/out-a6/A6-GATE-ATTACKS.md`<br>`.claude/state/ua-worker/chips/deliv-audit/out-a7/A7-BLAST-RADIUS.md`<br>`.claude/state/ua-worker/chips/deliv-audit/out-a8/A8-PREMISE-AUDIT.md` | every path resolves; `SYNTHESIS.md` carries a verdict line |
| GARDENER | (none) — no refactor in scope | `(none)` | n/a |
| OWNER | rule amendments from §2's convicted fixes | `plans/pending/PLAN_DELIVERY_SESSION_SELF_AUDIT.md` (this file, Phase 5 section appended at closure) | `grep -c "AUD-017 scope extension" plans/pending/PLAN_DELIVERY_SESSION_SELF_AUDIT.md` ≥ 1 |

---

## 10. Acceptance criteria

- [ ] Phase 0 gate passed — owner interrogated this plan and said go. **No dispatch before this.**
- [ ] All eight lots returned, each with a machine-enumerated denominator **and** its L2 extractor-validation proof.
- [ ] Every lot's findings carry both `LEAKED` and `DESTROYED` classifications (L3); a single-direction lot was bounced and re-run.
- [ ] Lot A6 produced at least one concrete gate bypass with a minimal fix, or a defended argument for why none exists.
- [ ] Lot A8 sourced every premise in the four doctrine files to an independent authority, or flagged it `UNSOURCED`.
- [ ] Cross-chief review completed with author defense on every finding (fight protocol — no review reached me unanswered).
- [ ] Every `MUST-FIX-BEFORE-PUSH` finding is fixed and its lot re-run, or explicitly accepted by the owner with a recorded reason.
- [ ] Zero repo mutations by any audit worker — `git status --porcelain` diff before/after the audit shows only the audit's own report files.
- [ ] The two convicted prior fixes from §2 have concrete rule amendments filed (AUD-017 scope; `/audit` Step 2.5 denominator).
- [ ] Verdict presented to the owner. The push remains his call.

---

## 11. Verification artifact

Run after the audit completes — it should print the verdict and prove every lot landed:

```bash
ls .claude/state/ua-worker/chips/deliv-audit/out-a*/  && grep -h "^VERDICT:" .claude/state/ua-worker/chips/deliv-audit/SYNTHESIS.md
```

Expected: eight non-empty output directories, and one `VERDICT: GREEN|YELLOW|RED` line.

---

## 12. Plan deviations

| # | Deviation | Reason | Date |
|---|---|---|---|
| — | (none yet) | | |
