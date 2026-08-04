> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_57_NM2271_OVERRIDE_GAP_CLOSURE.md`. All context below.**
>
> The executing session self-bootstraps from the frontmatter + sections in this file, with **no additional user prompting**:
>
> 1. **Identity**: OWNER (CEO/dispatcher). This plan invokes NO pipeline identity for Claude — see §Per-Identity Disposition.
> 2. **Skills**: `/delegation-temp` (re-invoke — it dies at every compact), `/ultra-agents` if >5 concurrent is ever needed (it is not, by design).
> 3. **Model + thinking + permission-mode**: read `**Model**` / `**Thinking**` / `**PermissionMode**` below (LR-041).
> 4. **Dependency gate**: verify the NM-2271 graft is still on disk and uncommitted on `main` (§Pre-flight). HALT if the working tree no longer matches.
> 5. **Context load**: this file + `.claude/state/ua-worker/chips/nm2271-graft/GAP-REPORT.md` + `out-gap-gpt/gap.md`. Nothing else — the workers read the rest.
> 6. **Browser tool**: `cli`. Claude runs ZERO browser calls; all live walking is delegated to copilot workers driving `playwright-cli` via shell (proven working 2026-07-22, `out-diag/`).
> 7. **Execute Waves 0→6 in order.** Wave gates are hard: a wave does not start until the prior wave's verdict is read.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, append an activity-log row (LR-028), `mv` to `plans/done/`, `npm run plans:reindex`. **NO git commit. NO push.** Disk-only — Rutvik decides when and where to publish.
>
> **HALT + ASK RUTVIK** if: Wave-0 recon contradicts the gap denominator by >10 slots / a lot worker reports the Labor tab lacks a field the gap list assumes / the merge would leave a real file broken / Phase 5 (gate registration) is reached / any worker requests a write outside §Scope.

---

# PLAN 57 — NM-2271 Corporate Pricing Override: Gap Closure (67 slots)

**Status**: DONE
**Created**: 2026-07-22
**Priority**: High
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**Identity**: OWNER
**Depends on**: NM-2271 graft present + uncommitted on `main` (verified 2026-07-22)

---

## 1. Context

The colleague's NM-2271 Override work is grafted onto `main` (uncommitted, 4 files `M`). Our own gap audit — two providers, blind, converging — found **67 of ~151 denominator slots uncovered (44%)**. The gaps are not random: they are the entire Labor field axis, all boundary/negative inputs, and the §2.1 rejection-affordance oracle.

Rutvik's decision changed on 2026-07-22: **close the gaps, don't just report them.**

The second-order reason this matters more than the 67 numbers: `agent-mistakes.md:49-51` records that our OWN prior automation had the >100 focus-trap *in its hands* and asserted it as a PASS — `tryMaxDiscount` returned `false` ("editor didn't commit"), the test asserted `.toBe(false)` as success, **and the helper pressed `Escape`, actively erasing the evidence of the trap a human hits.** A missing oracle does not merely fail to find a bug; it manufactures a false green over one. Every rejection case this plan writes must assert the rejection's *affordance*, not just its *fact*.

### 1.1 Why this plan exists in this shape — the burn problem

Rutvik's constraint is explicit: **do not burn Claude.** The prior session burned by (a) doing the live harvest inline after two worker failures, (b) under-budgeting two workers at 50/60 credits against my own recorded 250–400 rule so both walled before writing their deliverable and needed re-dispatch, (c) reading full worker artifacts instead of verdicts. This plan is engineered so that Claude's total contribution is **dispatch, read verdict, judge, ceremony** — nothing else. §6 makes that countable.

---

## 2. Prior-Fix Trial (LR-069 §3.5 — MANDATORY: this is a recurrence-class plan)

Coverage-miss is a failure class we have already "permanently" fixed. It happened anyway. Each prior fix goes on trial before any new mechanism is proposed.

| # | Prior fix | What it did | Why it did not fire here | Verdict |
|---|---|---|---|---|
| 1 | **LR-062** (machine-enumerated walk denominator, 100% disposition, provenance gating) | Forces a machine denominator, requires every enumerated element dispositioned, blocks date-backdating and forged timestamps | **scoped-wrong.** `corporate-pricing-override` is absent from `MODULE_CONFIG` in `scripts/walk-coverage/lib/module-config.mjs` (only `pricing` and `corporate-pricing-search` have `requiredStates`). With `requiredStates = ∅`, the `Walk_State ⊇ requiredStates` check is trivially satisfied — the Labor tab never enters the denominator, and the "skip a required state = hard-fail" power cannot fire for this surface. Compounded by `openerTestidPatterns: []` for this surface in `enumerate-page.mjs:127`, so hidden portals/dropdowns are never enumerated here either. The gate was built and never aimed at this surface. | **CONVICTED** |
| 2 | **LR-065** (grid surfaces carry `behavior-cases` per §3 family) | Mandates ≥1 QUICK TC per surface-behavior family on any grid | **dead / never-fired.** No field-inventory artifact for this surface carries a `## Coverage Manifest`; the manifest requirement only binds artifacts dated ≥ 2026-07-22. NM-2271 predates it, so nothing forced the Labor-grid behavior families (pagination, filter+sort, dirty-persistence — gap slots OVR-SBC-L2/L4/L7) to exist. | **CONVICTED** |
| 3 | **`covered-by-TC` evidence exemption** (`scripts/walk-coverage/lib/coverage-manifest.mjs:62-69`) | Treats a mapped TC-ID as "inherent evidence (a runnable spec), so it is not evidence-gated" | **rubber-stampable.** A slot passes disposition the moment *any* TC-ID is mapped to it, regardless of whether that TC asserts anything meaningful. This is precisely the mechanism by which `TC-LOC-CPR-523` — a test that pressed Escape and asserted the rejection as a pass — satisfied the gate over a live focus-trap. Depth and oracle-strength are invisible to the gate. | **CONVICTED** |

**Rewire dispositions (no fix may be layered over an unconvicted failure):**

- **#1 → in scope, Rutvik-gated.** Phase 5 registers `corporate-pricing-override` in `MODULE_CONFIG.requiredStates` (minimum: `resting`, `tab:labor`) and populates `openerTestidPatterns`. This touches shared gate infrastructure, so it does **not** execute without Rutvik's direct go (per `feedback_self_modification_needs_explicit_go`). If he declines, the conviction stands recorded and the rewire is carried as a named open item — **not silently dropped**.
- **#2 → satisfied by this plan's output.** LOT-D delivers the Labor-grid behavior families as real TCs, and Wave 6 emits a dated field-inventory artifact carrying a `## Coverage Manifest` (which, being dated ≥ 2026-07-22, is now mandatory anyway).
- **#3 → OUT of scope, filed not buried.** Making the manifest evidence-gate TC *quality* (not just TC *existence*) is a gate-design change with blast radius across every module. Wave 6 files `plans/pending/PLAN_58_COVERAGE_MANIFEST_ORACLE_GATE.md` as a stub with this trial's evidence. Closing 67 slots while this exemption stands means the next surface can still rubber-stamp — **stated plainly, not pretended away.**

---

## 3. Pre-flight (Claude, ≤3 tool calls, before Wave 0)

```bash
git branch --show-current && git status --porcelain -- clients/encore/src/data/corporate-pricing/override.ts clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts clients/encore/src/selectors/corporate-pricing/override.ts clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts
```
Expected: `main` + 4 lines each starting ` M`. Anything else → HALT (the graft moved or another session committed it).

---

## 4. The wave architecture

**Design constraint that drives everything**: six target files are shared, and four of them are single files that all 67 slots would touch. Parallel workers writing the same file corrupt it. The resolution is **fragment-then-merge**: parallel workers write only to their own private fragment file and never touch a real repo file; a single merge worker assembles. This buys parallelism without a write conflict, and it means a dead worker damages nothing.

**Second constraint**: memory records that workers die batch-writing multiple files at the end. Therefore **every dispatch produces exactly ONE deliverable file**, with incremental appends allowed.

**Third constraint**: `--max-credits` floor is 400 on every read+reason+write dispatch. Non-negotiable — under-budgeting is what caused the re-dispatch waste last session.

### Wave 0a — Live recon walk *(1 worker · sonnet T2 · `--work-type walk` · OFF-REPO: yes · 400cr · timeout 1500)*

We do **not** know the Labor tab. The gap list assumes Labor mirrors Equipment (28 slots depend on that assumption). Writing 28 TCs on an assumption violates the supreme NEVER-ASSUME rule.

Worker drives `playwright-cli` and returns ONE file `out-recon/labor-and-oracle-matrix.md` containing:
- Labor tab's actual column set; which columns are editable; whether **Max Discount %** exists on Labor at all.
- The rejection-UX matrix for every (field × tab × invalid-class) cell: does it commit? `aria-invalid`? computed border? **is there an explanatory error message anywhere in the DOM?** is it escapable (Esc / click-away / Tab)? Save button state after.
- Whether office 1101 (LR-ENC-005, master corporate location) exposes multi-currency rows — this decides whether the 3 currency-filter slots are automatable or stay blocked.
- Grid Options control's real accessible name (`agent-mistakes.md:31` — the shipped `:text-is("Grid Options")` selector is broken because it is an sr-only icon button; do not repeat it).

**Ticket carries**: exact commands, auth-state path `clients/encore/.auth/encore-state.json`, DOCTRINE = `.claude/skills/rca/SKILL.md`, `.claude/rules/browser-tool.md`, `clients/encore/specs_planning/_internal/field-case-generation.md` §2 + §2.1.

### Wave 0b — Independent re-execution *(1 worker · gpt-5.5 T4 · `--mode edit` · 350cr)*

Off-repo parity law: a live walk cannot be reviewed on paper. A **different-provider** worker replays 0a's recorded steps, pastes its own raw output, and diffs against 0a's claims. Mismatch = bounce 0a. Claude reads only the diff verdict.

**Gate**: Wave 1 does not start until 0b confirms the Labor field set. If Labor lacks Max Discount %, **LOT-C's 13 slots are phantom** → the denominator is corrected (documented as a correction to the GAP REPORT, never silently dropped) and LOT-C is re-scoped before dispatch.

### Wave 1 — Foundation + adversarial design debate *(2 dispatches, sequential)*

**1a — Foundation build** *(opus T3 · `--work-type build` · 450cr)*. One worker extends the three shared source files and freezes the contract:
- `src/data/corporate-pricing/override.ts` — BVA/negative value sets per field per tab.
- `src/pages/corporate-pricing/corporate-pricing-override.page.ts` — Labor-tab equivalents, a **revert-to-original** helper (LR-009 net-zero), and a **rejection-oracle assert helper** that captures *announced* + *escapable* and, critically, **does not press Escape before capturing** (the `agent-mistakes.md:49` masking defect).
- `src/selectors/corporate-pricing/override.ts` — any missing selectors, using live-verified accessible names.
- Deliverable: **ONE file** `out-lots/API-CONTRACT.md` — exact helper signatures, exact data-constant names, and **one fully worked exemplar** (one complete TC + its spec block, oracle included) that all four lots clone. The exemplar is what stops four workers inventing four dialects.

**1b — Adversarial critique of the contract** *(gpt-5.5 T4 · `--work-type review` · 350cr)*. "Let them fight it out," aimed where it actually pays: at the design, before it is cloned 67 times. The rival attacks the contract for oracle weakness, LR-019 baseline drift, and helper-API gaps. Findings bounce to 1a. **Both green → the contract freezes.**

> **LR-019 hazard, carried into the ticket** (`agent-mistakes.md:37`): `reloadAndReselect()` is a *reload*, not a value baseline. A prior TC hardcoded `'445.00'` and would false-fail against correct app behavior once a save-cycle left the row drifted. Every new BVA test must **enforce** its starting value, not assume it.
>
> **Counter-hazard** (`agent-mistakes.md:147`): the previous attempt to fix that with a heavy `ensureDefaultState()` in `beforeEach` blew the 60s hook timeout on a heavy page and was reverted. The contract must therefore enforce the baseline **cheaply and per-test**, not via a heavyweight global hook. Both hazards go in the ticket; solving one by causing the other is a bounce.

### Wave 2 — Lot builds *(4 workers, PARALLEL, fragments only · 400cr each)*

Under the 5-concurrent cap — no `/ultra-agents` boost needed, no consent required.

| Lot | Scope | Slots | Model |
|---|---|---|---|
| **A** | Equipment field axis — Override Price (8) + Max Discount % (11) + Active (1) | 20 | opus T3 (oracle-heaviest) |
| **B** | Labor Override Price (14) + Labor Active (1), incl. editor-reveals + oracle | 15 | sonnet T2 |
| **C** | Labor Max Discount % (13) | 13 | sonnet T2 |
| **D** | Toolbar + SBC — picker 4, currency 3, text 1, import 2, rows-per-page 4, product-group 1, SBC-E 1, SBC-L 3 | 19 | opus T3 (most heterogeneous) |

20 + 15 + 13 + 19 = **67** ✓

Each writes exactly ONE file: `out-lots/LOT-<X>/fragment.md`, containing `<<<TESTCASES>>>` and `<<<SPEC>>>` sections. **No lot worker touches a repo file.**

**Provisional TC IDs**: lots use `TC-CPR-OVR-<LOT>-NN` (e.g. `TC-CPR-OVR-A-01`). Final numbering is assigned once, by the merge worker. Four workers doing independent ID arithmetic is a collision waiting to happen; one worker with a mapping table is not.

**Every lot ticket carries in DOCTRINE**: `.claude/agents/BUILDER.md` (its HARD STOPS govern this work — see §Per-Identity Disposition), `.claude/rules/specs.md`, `.claude/rules/angular.md`, `field-case-generation.md` §2 + §2.1, the frozen `API-CONTRACT.md`, and the `agent-mistakes.md` hazards above.

### Wave 3 — Merge *(2 workers, PARALLEL — disjoint files · 400cr each)*

- **3a — docs** *(opus T3)*: assembles the four `<<<TESTCASES>>>` sections into `corporate_pricing_override_test_cases.md`, assigns final IDs from 066 up, updates `corporate_pricing_override_test_plan.md` counts + traceability, and emits `out-merge/TC-ID-REMAP.md` (provisional → final) so the trace stays auditable.
- **3b — code** *(opus T3)*: assembles the four `<<<SPEC>>>` sections into `corporate-pricing-override.spec.ts` using 3a's remap, then runs `npx tsc --noEmit` + `npm run check:spec-quality` + lint, tee'd to artifacts.

**Atomic-write rule (the single highest-risk failure in this plan)**: 3b writes to a **staging copy** first, typechecks the staging copy, and only replaces the real spec file once green. A merge worker that dies mid-write must leave the real files untouched. Without this, a budget death lands a syntactically broken spec file on `main`.

### Wave 4 — Real E2E *(1 worker · sonnet T2 · OFF-REPO · 400cr · timeout 1800)*

LR-059: no green claim without driving the real thing. Full spec run, tee'd with sha256. Reports pass/fail per TC + **wall-clock runtime** (65 → ~105 tests on a live app; if runtime doubles, that is a finding for Rutvik, not something to hide). Expect real failures — new tests against a live app always shake out. Budget one bounce round back to the owning lot worker; Claude does not fix them.

### Wave 5 — Cross-provider QA *(1 worker · gpt-5.5 T4 · `--mode edit` · 400cr)*

Different provider from every builder (opus/sonnet), per the no-provider-grades-its-own-homework rule. Reviews the full diff **and independently re-executes** the E2E (pyramid layer 4 — the work is off-repo, so paper review can never green it). Emits ≤10-line DIGEST + VERDICT with claim-level VERIFIED / UNPROVEN / ENV-BLOCKED.

### Wave 6 — Claude only *(ceremony, no delegable work remains)*

Read verdicts → spot-audit → judge → record. Deliverables:
1. `GAP-REPORT.md` annotated CLOSED with the slot → final-TC mapping (and any denominator correction from Wave 0b).
2. Dated field-inventory artifact with a `## Coverage Manifest` (mandatory for artifacts dated ≥ 2026-07-22).
3. Activity-log row (LR-028).
4. `plans/pending/PLAN_58_COVERAGE_MANIFEST_ORACLE_GATE.md` stub (trial conviction #3).
5. Memory correction: `reference_delegation_tooling_gotchas.md` fact 4 is **stale** — the `--model` silent-pin bug is fixed in `copilot-worker.sh` (variant-agent materialization, fail-closed, verified 2026-07-22 at lines ~250-270). Leaving a fixed bug recorded as live is how a future session over-engineers around nothing.
6. Receipt v3.

---

## 5. Scope carve-outs (honest — each names its unlock)

| Slot(s) | Disposition |
|---|---|
| **OVR-CUR-3/4/5** (currency, 3) | Implement **only if** Wave 0a finds multi-currency rows on 1101 (LR-ENC-005). Otherwise stays blocked, unlock named: *"an office whose Override grid carries rows in ≥2 currencies."* The TC is **not** deleted. |
| **OVR-IMP-4** (empty-price whole-file rejection, NM-1940) | Implement. The import *rejects*, so it mutates nothing. |
| **OVR-IMP-3** (valid-CSV UPSERT-ALL, NM-2186) | **Data-mutation risk**: rewrites every row of an office and is known to stall at 50% in the UI while applying server-side. Implement **only** against a designated e2e office with a verified restore step; otherwise blocked, unlock named. `agent-mistakes.md:208-210` also requires live-verifying the submit trigger + write semantics + real failure status **before** authoring — the Jira-described symptom is not the real one (NM-2407 returns HTTP 500, not a 504). Wave 0a covers this. |
| **TC-CPR-OVR-023** (>100) | Un-fixme it. Its stated blocker — *"intended behavior unknown until the defect is fixed and live"* — is now **dead**: the 2026-07-21 harvest established the contract (rejected, `aria-invalid`, red border, Save disabled, click-away wedge, escapable, no error message). Rewrite as a real test asserting the observed contract, with the missing error-message and the click-away wedge carried as the documented bug per the failing-TC-as-bug-evidence 3-clause gate. |
| **TC-CPR-OVR-041** (RBAC) | Out of scope. Unlock already named (a second automation account without the 1101 Revenue Management role). Untouched. |

---

## 6. How Claude does not burn (the part Rutvik asked for)

**Claude's total footprint across all 6 waves: ~7 wake points × ≤5 tool calls = ~35 tool calls.** That is the number to check this plan against.

| Burn source (all observed last session) | Structural prevention |
|---|---|
| Doing the work inline | Every deliverable belongs to a worker. Zero repo files are written by Claude except the four ceremony artifacts in Wave 6. |
| Polling a running worker | **Dispatch → background → END TURN.** No sleeps, no "just checking", no filler analysis. Wake on notification only. Multiple dispatches fire in ONE turn, then stop. |
| Re-dispatch after under-budgeting | **Hard floor 400 credits** on every read+reason+write dispatch. This is the fix for my own recorded 50cr/60cr self-miss. |
| Reading full worker reports | Claude reads **only**: the ledger row (`exit`, `ok`, `exit_reason`, `model`), the verify-run `verdict` field, and the ≤10-line DIGEST. Never the fragments. Never the parity report body. |
| Re-reading a diff after a green review | Forbidden. That is re-doing the reviewer's job. Claude line-reads only on reviewer/verifier disagreement, RISK:high, or a specific suspicion. |
| Self-rescuing a stalled worker | **ANTI-RESCUE**: never. Wait for timeout, then dispatch a fresh worker with the same ticket + stall context. |
| Burning attempt 3 on a bad ticket | At attempt ≥2, fix the **ticket** (ambiguous goal? missing doctrine? wrong tier?). Most "model failures" are spec failures. |
| Context bloat from 4 fragments | Claude never opens a fragment. The merge worker does. |

**Verification of claims, without reading the work** (worker output is untrusted): before reading any digest, pre-write 3–7 trap questions predicting where a lazy worker would slip, then spot-audit **≥3 claims with targeted greps against disk** — not file reads. Machine facts only: a report's prose is never evidence.

**Cost ceiling**: 12 core dispatches × ~400cr ≈ 4,800, plus a 3-bounce reserve ≈ 1,200 → **~6,000 credits**. Reported honestly in the Receipt, including waste.

**Known limit, stated rather than pretended away**: `/delegation-temp` dies at every `/compact` — the primer injects instructions, not identity. **Re-invoke it after every compaction during execution**, or the discipline above silently degrades into good intentions.

---

## 7. NOT touched

- `scripts/walk-coverage/**` — Phase 5 only, and only on Rutvik's direct go.
- `coverage-manifest.mjs` evidence-gating — filed as PLAN_58, deliberately not patched here.
- Any git commit or push. **Disk-only.** Rutvik decides when and where.
- Any branch. Everything stays on `main`.
- `TC-CPR-OVR-041` (RBAC) and the existing 65 TCs, except TC-023 (un-fixme'd) and any TC whose rejection oracle is upgraded in place.
- `.claude/hooks/**`, `~/.claude/delegation/**` control surface.

---

## 8. Per-Identity Disposition (LR-048)

This plan invokes **no Claude pipeline identity**. Execution runs as OWNER dispatching external copilot workers. The duty-coverage requirement is therefore satisfied by **routing each role's HARD STOPS into the executing worker's ticket DOCTRINE** — the duties govern the agent that actually does the work, which is the point of the rule:

| Role whose duties govern | Routed to | Concrete deliverable |
|---|---|---|
| BUILDER (spec/page-object authoring) | `.claude/agents/BUILDER.md` cited in every Wave-2 lot ticket + Wave-1a foundation ticket | `clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` |
| GIVER (test-case + plan authoring) | `.claude/agents/GIVER.md` cited in the Wave-3a merge ticket | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md` |
| WATCHDOG (audit) | `.claude/agents/WATCHDOG.md` cited in the Wave-5 review ticket | `.claude/state/ua-worker/chips/nm2271-graft/out-review/DIGEST.md` |
| HEALER (failure triage) | `.claude/skills/rca/SKILL.md` cited in the Wave-4 bounce ticket | `.claude/state/ua-worker/chips/nm2271-graft/out-e2e/run.verify.txt` |
| OWNER (ceremony) | Claude, Wave 6 | `clients/encore/specs_planning/_internal/agent-activity-log.md`<br>`.claude/state/ua-worker/chips/nm2271-graft/GAP-REPORT.md` |

---

## 9. Verification Artifact (D23)

Runnable proof of closure — re-runnable by anyone, no prose required:

```bash
diff <(grep -oE 'TC-CPR-OVR-[0-9]{3}' clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md | sort -u) <(grep -oE 'TC-CPR-OVR-[0-9]{3}' clients/encore/tests/corporate-pricing/corporate-pricing-override.spec.ts | sort -u) && echo "PARITY OK"
```

Expected: `PARITY OK` — every test case has a spec and every spec has a test case, zero orphans either way.

Plus, all four must hold at closure:
1. `grep -oE 'TC-CPR-OVR-[0-9]{3}' <test-cases> | sort -u | wc -l` → **≥ 105** (65 existing + ≥40 new; exact count set by Wave 3a's remap).
2. `cd clients/encore && npx tsc --noEmit` → exit 0.
3. `npm run check:spec-quality` → pass.
4. `git status --porcelain` shows the changed files as **modified-uncommitted on `main`** — no commit, no branch.

---

## 10. Plan-Deviations log

| # | Deviation | Why | Disposition |
|---|---|---|---|
| — | *(none yet — populated during execution)* | | |

---

## Execution Summary (2026-07-23)

**Outcome**: 67/67 gap slots dispositioned. 62 new tests written; suite now 127 cases.
Final verification — all four shards green: A 18/18 · B 15/15 · C 13/13 · D 15/15 (+1 blocked). 0 failures.

### Deferred (2) — both name their recipient
| Slot | Disposition |
|---|---|
| `OVR-IMP-3` | Deferred to `plans/pending/SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md` Phase 4, which owns the valid CSV UPSERT-ALL export -> modify -> upload -> restore round-trip. The prior blocked reason was factually wrong: the 2026-07-17 walk verified a restore path. |
| `OVR-IMP-4` | Deferred to `plans/pending/SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md` Phase 4, which already names the NM-1940 negative-path rejection TC. The prior blocked reason was factually wrong: the rejection is observable via the dialog alert and the 2026-07-17 walk verified 152.00 -> 152.01 -> 152.00 restore. |

### Cross-provider audit of all 127 cases (gpt-5.5, 4 ledgers, one row per case)
Found five defects a pass count cannot show, because all five were **green**:
- `TC-117` — "import rejected" asserted only an unchanged row count, so it **passed if the import succeeded**
- `TC-119` — filtered to a single row, then sorted it; sorting one row can never change anything
- `TC-023` (`fixme`) and `TC-041` (`skip`, empty body) — both claimed as covered by the case markdown
- `TC-007` — `typeof state === 'boolean'` on a helper that coerces null to `false`; cannot fail
- `TC-013` — asserted the anchor row present after filtering by that anchor's own ID; true either way

### Root cause of every run failure — all test-side, zero app defects
Nine failures, one dominant cause: **escapability was measured by waiting for the cell editor to detach from
the DOM**, which never happens on this app (Angular empties the node but keeps it attached). `escapable` was
therefore effectively hardcoded `false`, reporting a focus trap that a controlled cross-provider probe
disproved in 8/8 cases. Two Equipment tests were red on that phantom; six Labor tests had a **true** claim
withdrawn because of it. Remaining failure: one expected-value error (`<input type="number">` exposes `13`,
not the cell display `13.00`).

### Artifacts corrected — each had misled workers for hours
| Artifact | Claim | Reality |
|---|---|---|
| `SELECTOR-MAP.md` | location picker has a `Close` button | It has **Cancel**. The entry's own verification line read *"used implicitly"* — never observed. `Close` belongs to the Import dialog. |
| `ORACLE-FACTS.md` | office 1134 is the **ONLY** office with Labor rows | Office `9460` has **212**. This one line produced **6 false CHEAT verdicts** in the audit. |
| row locator | `tbody tr` counts grid rows | Page-wide — also counted a **second table** (product-group picker), including its `No results.` empty-state row. |
| `probeEditOracle` step 7 | waits for editor detach | Detach never occurs; the wait always failed, wrapped in `.catch(() => {})` so it never reported. |

### Integrity properties held
- **No expected value was edited to match the app** at any point (`CHEAT-CATALOGUE` shape #8).
- All 8 escapability assertions **restored, not removed** — a worker's proposal to delete one and annotate
  it away was rejected, and the real bug found instead.
- All five confirmed defects still asserted **as defects** by passing tests: `0.5` → `50.00 %` (100× discount
  misread), `1.2.3` silent corruption, `abc` blanking with Save **enabled**, no validation message on
  rejection, two editors open at once.
- Gates: 0 fixed sleeps · 0 `detached` waits · 0 `.first()` spinbuttons · 0 swallowed waits · `tsc` exit 0.

### Follow-up filed
`plans/pending/PLAN_58_COVERAGE_MANIFEST_ORACLE_GATE.md` — the systemic pattern behind all four artifact
corrections: **a claim recorded without the observation that would justify it, then trusted downstream.**

**Delivery**: disk-only, on `main`, uncommitted — per standing instruction.
