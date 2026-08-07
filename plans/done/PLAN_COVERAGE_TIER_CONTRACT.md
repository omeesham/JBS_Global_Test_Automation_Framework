# PLAN_COVERAGE_TIER_CONTRACT — Make the walk/verify/closure machinery honor the coverage tier the skill chose

**Status**: DONE
**Executed**: 2026-08-07
**Priority**: P1
**Created**: 2026-08-07
**Identity**: OWNER
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**CoverageMode**: n/a (this plan authors the contract; it does not author test coverage)

---

> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_COVERAGE_TIER_CONTRACT.md`. All context below.**
>
> The agent self-bootstraps from this file. On invocation, follow this sequence without additional user prompting:
>
> 1. **Identity**: OWNER (framework mechanism work — no pipeline artifact authored).
> 2. **Skills**: `/execute` (orchestrator). `/regression-guard` wraps Phase 3 (gate-code edits).
> 3. **Model + thinking + permission-mode**: read the frontmatter fields above (LR-041).
> 4. **Dependency gate**: none — verify `plans/pending/SUBPLAN_GUARDRAIL_RECURRENCE_TRIAL.md` status only as context, not a blocker.
> 5. **Context load**: read this plan in full + the two evidence files named in §Context + `.claude/rules/inventory.md` + `scripts/validate-plan-closure.mjs` header comments.
> 6. **Browser tool**: none (no live app interaction anywhere in this plan).
> 7. **Phase 0 FIRST**: baseline re-verification before any edit.
> 8. **Execute Phases 1–5** in order. Each phase's acceptance command must pass before the next phase starts.
> 9. **Handoff**: flip the Status field to DONE + add the Executed date, activity-log row (LR-028/LR-037), closure-gate dry-run BEFORE the flip, `git mv` to plans/done/, `npm run plans:reindex`.
>
> **HALT + ASK USER** if: LR-072 is no longer the next free rule number at execution time / any Phase-0 baseline check contradicts this plan's cited file:line anchors / regression-guard shows unrelated gate behavior changes / scope grows >30%.

---

## Context

**Owner directive (Rutvik, 2026-08-07, verbatim intent)**: "/ultracoverage = cover max, coverage = cover imp but be quick … for coverage skill i dont want my walks to take multiple hours which was only useful for ultracoverage … a gate wont say u did less coverage when it was demanded by me myself … everything should be dynamic and tied to the coverage skill i use for a given plan." ultracoverage = ample time, cutting-edge automation; coverage = tight deadline, defendable-not-proud, fast 0→100.

**Evidence base** (cross-family-reviewed research, 2026-08-07):
- `.claude/state/ua-worker/chips/cov-tuning/out-lot-a/FINDINGS-A.md` — skills layer (reviewer verdict: content verified; one gap — the execute-skill tail gates — supplemented by reviewer cites `.claude/skills/execute/SKILL.md:179,187-190,223-247,251-275,291-293`).
- `.claude/state/ua-worker/chips/cov-tuning/out-lot-b/FINDINGS-B.md` (+ CEO-CORRECTION-ADDENDUM) — rules/gates/hooks layer.

**The verified diagnosis — the owner is right, and the split is precise:**

| Layer | Mode-aware today? | Evidence |
|---|---|---|
| Case authoring: L1 vs L2/L3, §3 QUICK/DEEP families, /coverage vs /ultracoverage scopes | **YES** | .claude/skills/coverage/SKILL.md:34-35; .claude/skills/ultracoverage/SKILL.md:31-33; clients/encore/specs_planning/_internal/field-case-generation.md:93 (§3) |
| Walk execution: LR-062 100% denominator + live provenance, LR-064 TDW 4 stages, §20 BFS state-graph exhaustion + mandatory bug harvest, LR-057 3-point probes | **NO — fully mode-blind** | inventory.md:90-99, 106-136, 65-86; AGENT_SHARED_RULES.md:832-861 |
| Staleness/re-walk: LR-013 Phase 0.5, SP-AAE-05 14/30-day windows, Refresh triggers | **NO** | inventory.md:23-35; field-inventory-spec.md:19,132 |
| Closure gates: Cx (coverage_mode=deny), C1-C6, Ct, LR-040/046 | **NO** | validate-plan-closure.mjs:788-834; plan-closure.md:22-38 |
| Bug-harvest coupling: /find-bugs SFDPOT + pattern sweep wired "non-optional" into intake walks | **NO** | .claude/skills/find-bugs/SKILL.md:46-136; plans/pending/PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md:54 |

So case COUNTS already follow the skill, but walk/verify/closure COST does not — a deliberately-quick /coverage run pays ultracoverage-grade walk hours (SCT plan: 100% BFS walk + full bug harvest gate before L1 can even start, plan:238,54). That is the exact mechanism behind "walks take multiple hours which was only useful for ultracoverage."

**Design goal**: one declared tier signal, honored end-to-end — with ZERO weakening of the anti-fabrication machinery. Quick reduces *scope honestly*; it never dilutes *evidence* on what it claims.

**Residual cost, named honestly (audit finding UI1)**: quick-mode walk time still scales with FIELD COUNT, because Axis 1 FCC (every field × §2 templates) is /coverage's own promised floor — this plan removes the BFS-fixpoint, full-SFDPOT, probe-everything, and re-walk overhead, NOT the per-field L1 floor. That floor is what makes quick "defendable". If the owner ever wants a sub-FCC tier (field-subset selection), that is a /coverage contract change requiring an explicit owner decision — out of scope here, deliberately.

---

## The contract (design — authored by CEO, informed by the evidence)

### 1. `**CoverageMode**: quick | deep` — a plan-level declared tier (new rule LR-072)

- Every coverage-bearing subplan (one whose phases author TCs, run walks, or cite walk artifacts) declares `**CoverageMode**:` in frontmatter, alongside Model/Thinking/PermissionMode (same LR-041 declaration pattern).
- `/coverage` stamps `quick`; `/ultracoverage` stamps `deep`. Hand-authored plans declare explicitly.
- **Absent field = `deep` semantics** (conservative default: legacy plans and forgetful authors get today's full rigor — the contract can only ever be *invoked*, never *fallen into*).
- The tier is the OWNER's demand-signal: a gate that flags a quick plan for doing quick-scope work is, from this rule forward, a gate bug.

### 2. `deferred-to-DEEP: <scope> (<reason ≥20 chars>)` — the honest-deferral disposition token

New sanctioned disposition in the LR-062 denominator vocabulary, legal ONLY on plans whose CoverageMode is `quick`:

- Counts as **dispositioned** for Coverage_Ratio (ratio stays 100% — nothing silently skipped, every element accounted).
- **G1 — a deferral carries NO classification claim.** It is a pure deferral — no observation claim of any kind, never "read-only", never "affordance-probed", never "covered". The Pay-To-Address launcher miss (agent-mistakes.md:85-89) happened because a resting-appearance claim substituted for a probe; a deferral that smuggles a classification would recreate it. A `deferred-to-DEEP` row with any classification token alongside = validator FAIL.
- **G2 — claimed rows keep FULL rigor.** Any row the quick run DOES claim (`covered-by-TC` / `read-only-verified` / `affordance-probed`) keeps unchanged LR-062 condition-5 provenance + LR-057 probe requirements. Quick narrows the claimed set; it never cheapens a claim.
- **G4 — per-launcher granularity** (LR-057 dedup clause, agent-mistakes.md:91-97): a deferral names the specific launcher/element, never a shared dialog.
- The deferral rows are greppable and form the module's **DEEP backlog**: a later `/ultracoverage` run consumes them as its worklist (LR-040(b)-compatible recipient is the walk artifact itself + the quick plan).
- **G3 — vocabulary containment**: the token lives only in internal walk artifacts (gitignored `specs_planning/`) and plan bodies. Phase 3 adds `deferred-to-DEEP` to the `scripts/xlsx-lint-rules.mjs` deny-list so it can never leak into a client deliverable (same class as the (QUICK)/(DEEP) marker leak, agent-mistakes.md:183).

### 3. Quick-profile deltas per mode-blind mechanism

| Mechanism | Deep (unchanged = today) | Quick profile |
|---|---|---|
| LR-064 TDW Stage 1 (recon + machine enumeration) | full | **UNCHANGED** — denominator stays machine-owned (enumerate-page.mjs); tier never touches enumeration |
| LR-064 TDW Stage 2 (per-field probes) | every element | only elements needed for L1 §2 cases + applicable §3 QUICK families + anything the owner names; rest → `deferred-to-DEEP` |
| LR-064 TDW Stage 3 (blind re-drive) | random sample of live rows | retained (anti-fabrication is tier-independent) at reduced floor: min(3, live-row count) instead of the deep sample |
| §20 Walk Doctrine BFS | state-graph to fixpoint | openers hosting in-scope fields: walked fully. Other openers: enumerated + `deferred-to-DEEP` (recorded, never silent). §20's rule that presence-in-DOM alone never counts as a walked control holds for every CLAIMED row |
| §20 bug harvest + /find-bugs coupling | full SFDPOT + mandatory pattern sweep | ALL-045 `## Observations` stays mandatory (record everything seen; explicit `none` allowed); full SFDPOT category sweep NOT forced; pattern sweep fires only on CRITICAL/HIGH finds (.claude/skills/find-bugs/SKILL.md step 5 already scopes this) |
| LR-057 affordance probes | every non-interactive classification | required on every row the quick run CLASSIFIES (G2); rows not classified take `deferred-to-DEEP` instead |
| LR-013 / SP-AAE-05 staleness | 0.5a spot-check ≤14d; full re-walk when stale/missing | quick may consume a 15–30-day artifact via the existing 0.5a spot-check path (3-row log) instead of a forced full re-walk; >30d HALT unchanged (honesty floor); Refresh-trigger fired = stale, unchanged |
| Cx closure gate | rejects any non-terminal disposition | accepts `deferred-to-DEEP` when plan's CoverageMode=quick; rejects it when deep/absent; all other Cx checks (provenance, CrossCheck, PARTIAL ban, oracle ban) unchanged in both tiers |

### 4. Gate wiring — `coverage_tier_mode` ramp knob (LR-069 pattern)

New knob in `.claude/closure-config.json`: `coverage_tier_mode: off | announce | deny`, landing `announce` (per the c6_mode / test_status_mode / recurrence_trial_mode precedent, closure-config.json:1-25, guardrail-config.json:69,75). Controls whether the tier-aware Cx acceptance of `deferred-to-DEEP` is measured-and-reported or enforced. The token acceptance itself ships behind the knob; `coverage_mode` (the Cx on/off ramp, currently `deny`) is NOT touched.

---

## Prior-Fix Trial (recurrence-gate, /planning Step 3)

**Prior fix**: LR-065's deliberate design line — "depth is delivered by the skills, not this rule: /coverage authors QUICK L1; /ultracoverage authors DEEP L2/L3" (inventory.md:151).

1. **What it did**: routed case-authoring depth through skill choice — the mode-aware half that works today.
2. **Why it doesn't cover this failure**: `different-sub-class`. It governed *which cases get authored*, and was never scoped to walk execution, verification, staleness, or closure cost. Those mechanisms predate or ignore the skill split (LR-062/LR-064/§20 all say "every walk / every agent").
3. **What this plan does differently**: extends the same tier signal from case-authoring into the walk/verify/closure layer via a declared plan-level field + one honest disposition token — no new parallel mechanism, no wrapper (per `feedback_fix_at_source_not_through_a_wrapper`: the fix lands inside LR-062's own disposition vocabulary and Cx's own validator, not around them).

**Verdict: SURVIVES** — the prior design is extended, not convicted. No layering over a failed fix: nothing in the evidence shows LR-065's case-depth split failing at its own job.

---

## Step-by-Step

### Phase 0 — Baseline re-verification (MANDATORY, no edits)

1. Re-verify anchors this plan builds on (LR-020 data-flow check): `inventory.md` LR-062 disposition list + Cx enforcement paragraph; `validate-plan-closure.mjs` checkCx() at ~:788-834 and its `coverageVerdict()` import; `scripts/walk-coverage/lib/coverage-manifest.mjs` verdict function ~:203-218; `scripts/walk-coverage/verify-denominator.mjs` ~:40-48; `closure-config.json` knob block. Line numbers are 2026-08-07 observations — **re-derive at execution time; never trust this plan's numbers** (machine-derived-count rule, PLAN_FIX_AT_SOURCE_NOT_WRAPPERS precedent).
2. Confirm `LR-072` is still the next free number: `grep -rho "LR-0[0-9][0-9]" .claude/rules/ docs/read_only_docs/LEARNED_RULES.md clients/encore/CLAUDE.md | sort -u | tail -3`. Taken → HALT and renumber with user visibility.
3. Confirm `.claude/walk-exemptions.json` is still `{"exemptions":[]}` (it stays human-only and untouched — deferral is NOT exemption; exemption removes from denominator, deferral disposits inside it).

### Phase 1 — Author the contract rule (docs layer)

1. **LR-072** in `.claude/rules/inventory.md` (path-scoped with the machinery it governs): the CoverageMode declaration contract, the `deferred-to-DEEP` token grammar `deferred-to-DEEP: <element/launcher id> (<reason ≥20 chars>)`, guards G1–G4, the absent-field=deep default, and the "gate flagging demanded-quick scope = gate bug" sentence. Trigger line: every coverage-bearing subplan authoring + every walk artifact consuming session.
2. Cross-reference stubs: one-line pointers in `docs/read_only_docs/LEARNED_RULES.md` (numbering ledger) and `clients/encore/CLAUDE.md` is NOT needed (framework-level, not client). Update `.claude/rules/pipeline.md` LR-041 block: add CoverageMode to the declared-fields list for coverage-bearing subplans (declaration required only when the plan is coverage-bearing; n/a allowed otherwise).

### Phase 2 — Rules/doctrine layer edits

1. `inventory.md` LR-062: add `deferred-to-DEEP` to the disposition vocabulary with the quick-only legality note + G1 no-classification clause.
2. `inventory.md` LR-064: add the TDW-Q profile table (Stage 2 scope rule, Stage 3 reduced floor min(3, live-rows), Stages 1/4 unchanged).
3. `inventory.md` LR-065: append one line — the ≥1-QUICK-TC-per-applicable-family floor is tier-independent (it IS the quick floor; unchanged).
4. `docs/read_only_docs/AGENT_SHARED_RULES.md` §20: add the quick-profile subsection (opener scoping + Observations-mandatory/SFDPOT-not-forced + G2 claimed-rows-full-rigor).
5. `clients/encore/specs_planning/_internal/field-inventory-spec.md`: staleness quick-path note (0.5a spot-check legal at 15–30d under quick; >30d HALT unchanged) + Coverage Manifest section documents the new token.
6. `clients/encore/specs_planning/_internal/field-case-generation.md`: §3 note that deferred families/elements are recorded via the token in the walk artifact (authoring-side pointer only; §2/§3 case content untouched).

### Phase 3 — Machine layer (wrap with /regression-guard)

1. **Mode lives in TWO places, deliberately** (audit finding S1): the walk MANIFEST gains a `Walk_Mode: quick | deep` frontmatter field stamped at walk time (absent = deep), because the execution-completion Stop hook scans artifacts on disk with NO plan context — it can only read artifact-embedded mode. The Cx closure path has BOTH the plan and the artifact: it reads the plan's `**CoverageMode**:` AND the artifact's `Walk_Mode:` and **FAILS on mismatch** (a deep plan citing a quick-walked artifact must not close green off deferral rows; a quick plan citing a deep artifact is fine — deep is a superset).
2. `scripts/walk-coverage/lib/coverage-manifest.mjs`: `coverageVerdict()` learns the token + reads `Walk_Mode:` from the manifest — single source, so BOTH importers (closure Cx preventive + Stop-hook detective) inherit (existing shared-verdict pattern, inventory.md Cx paragraph).
3. `scripts/walk-coverage/verify-denominator.mjs`: token accepted as a disposition; G1 enforcement (deferral + classification token on the same row = FAIL).
4. `scripts/validate-plan-closure.mjs` checkCx(): parse the plan's `**CoverageMode**:` field; cross-check vs artifact `Walk_Mode:` (mismatch rule above); token legal only under quick; behavior behind new `coverage_tier_mode` knob read via a `resolveCoverageTierMode()` clone of resolveC6Mode() (validate-plan-closure.mjs:62-70 pattern).
5. **SP-AAE-02 pre-commit staleness hook** (audit finding SC1): the 14-day TC-MD-edit window would override the Phase-2.5 quick staleness path at commit time regardless of tier. Locate the hook script implementing SP-AAE-02 (execution-time discovery — start from `field-inventory-spec.md` §SP-AAE-02 and `.claude/hooks/`), and extend its window to 30d when the paired artifact carries `Walk_Mode: quick`. If the hook cannot read the artifact cheaply, HALT and surface — do not ship an incoherent pair of windows.
6. `.claude/closure-config.json`: add `coverage_tier_mode: "announce"` + `_coverage_tier_comment` + ramp fields (copy the `recurrence_trial_*` block shape, guardrail-config.json:69-74).
7. `scripts/xlsx-lint-rules.mjs`: add `deferred-to-DEEP` to the deny-list (G3).
8. **Fixtures**: `.claude/hooks/lib/test-coverage-tier-fixtures.mjs` (mirror `test-todo-injection-fixtures.mjs` pattern): (a) quick plan + quick artifact + deferral rows → PASS; (b) deep plan + deferral row → FAIL; (c) absent CoverageMode + deferral row → FAIL; (d) deferral row carrying `read-only-verified` → FAIL (G1); (e) quick plan, ratio <100% → FAIL (deferral ≠ ratio waiver); (f) deep plan citing a `Walk_Mode: quick` artifact → FAIL (mode-mismatch, audit finding S2).

### Phase 4 — Skills layer

1. `.claude/skills/coverage/SKILL.md`: stamp `**CoverageMode**: quick` into authored subplans; add the quick-walk profile section (TDW-Q + §20-Q + staleness quick-path + find-bugs decoupling); state the delivery intent: quick 0→100 for an SCT-class module targets same-day, not multi-day.
2. `.claude/skills/ultracoverage/SKILL.md`: stamp `**CoverageMode**: deep`; add the upgrade path — Step 0.5: grep the module's walk artifact for `deferred-to-DEEP` rows and seed the DEEP worklist from them.
3. `.claude/skills/planning/SKILL.md` Step 3 validator: add step 12 — coverage-bearing subplan without `**CoverageMode**:` → HALT (same grep-and-HALT posture as steps 1-3).
4. `.claude/skills/chain/SKILL.md` queue-build: validate CoverageMode presence/value on coverage-bearing subplans (PRESENT-value validator, LR-041 pattern).
5. `.claude/skills/find-bugs/SKILL.md`: one paragraph — when invoked inside a CoverageMode:quick walk phase, Observations mandatory, full-SFDPOT not forced, pattern-sweep on CRITICAL/HIGH only (cites §20-Q).

### Phase 5 — Verification + closure

1. Run fixture battery: `node .claude/hooks/lib/test-coverage-tier-fixtures.mjs` → all fixtures pass.
2. Closure dry-runs (both tiers): `node scripts/validate-plan-closure.mjs --file <synthetic-quick-plan> --dry-run` (token accepted, announce line emitted) and same for a synthetic deep plan (token rejected). Synthetic plans live under the fixtures dir, not plans/.
3. Regression: `node scripts/validate-plan-closure.mjs --file plans/done/PLAN_ENCORE_NM2269_DELIVERY.md --dry-run` → verdict unchanged vs pre-change run (capture pre-change output in Phase 0; a stale baseline is not a control — build both sides same-session).
4. `npm run typecheck` clean (if the touched .mjs files are typechecked; else `node --check` each edited script AND execute each on a real fixture payload — a syntax check is not a run).
4b. `npm run plans:reindex` on the unchanged tree parses plans carrying the new `**CoverageMode**:` field with zero status/field drift vs pre-change reindex output (audit finding SC2 — reindex regex-watches Status/Priority/Created/Executed/Parent; prove the new field is inert to it).
5. Activity-log row (LR-028/LR-037), closure-gate dry-run on THIS plan, Status flip, `git mv`, `npm run plans:reindex`.

---

## What becomes stale / removal tasks (LR-050 enumeration)

- No file removals. No mechanism is retired — Cx, LR-062, TDW, §20 all continue; they gain a tier parameter (fix-at-source, zero wrappers, zero parallel paths).
- `PLAN_SERVICE_CHARGE_TEXT_AUTOMATION.md` (pending): NOT edited by this plan (LR-046 — its strict lines stand as authored). After this plan lands, the owner may re-declare it `CoverageMode: quick` for Phase B; flagged as a follow-up decision, not silently rescoped.
- Prose in `/coverage` SKILL.md promising "quick" without a mechanism becomes true rather than stale — no cleanup needed beyond Phase 4.1 edits.

## NOT touched (and why)

- `coverage_mode` knob (`deny`) — the anti-fabrication Cx ramp stays fully armed.
- `enumerate-page.mjs` / machine denominator — enumeration is tier-independent by design (G2's foundation).
- `.claude/walk-exemptions.json` + its human-only write gate — exemption ≠ deferral; registry stays human-only and empty.
- LR-062 condition-5 provenance rules — untouched in both tiers.
- `worker-ext.md`, hooks registration in `~/.claude/` — outside repo scope; no delegation-stack changes.
- Shipped deliverable content — no client-visible artifact changes (G3 guards the boundary).

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | rules + gates + skills + fixtures | .claude/rules/inventory.md<br>docs/read_only_docs/AGENT_SHARED_RULES.md<br>clients/encore/specs_planning/_internal/field-inventory-spec.md<br>clients/encore/specs_planning/_internal/field-case-generation.md<br>scripts/walk-coverage/lib/coverage-manifest.mjs<br>scripts/walk-coverage/verify-denominator.mjs<br>scripts/validate-plan-closure.mjs<br>.claude/closure-config.json<br>scripts/xlsx-lint-rules.mjs<br>.claude/hooks/lib/test-coverage-tier-fixtures.mjs<br>.claude/skills/coverage/SKILL.md<br>.claude/skills/ultracoverage/SKILL.md<br>.claude/skills/planning/SKILL.md<br>.claude/skills/chain/SKILL.md<br>.claude/skills/find-bugs/SKILL.md | `node .claude/hooks/lib/test-coverage-tier-fixtures.mjs` exit 0 |

## Acceptance criteria

- [x] LR-072 exists in `.claude/rules/inventory.md` with token grammar + G1–G4 verbatim (G4 reworded DOCTRINE-layer per review fix F4 — format machine-checked, semantics reviewer-checked)
- [x] Fixture battery passes: all 6 promised fixtures delivered as 7 (e split into e + e2) — `node .claude/hooks/lib/test-coverage-tier-fixtures.mjs` exit 0, CEO-verified 3×
- [x] Walk manifests gain `Walk_Mode:` support; Cx fails on plan/artifact mode mismatch (fixture f drives the real validator)
- [x] `coverage_tier_mode: "announce"` present in `.claude/closure-config.json`; `coverage_mode` still `"deny"` (grep-verified)
- [x] Cx regression: dry-run verdict on PLAN_ENCORE_NM2269_DELIVERY identical pre/post change (same-session control, signature C3/png)
- [x] `/coverage` + `/ultracoverage` SKILL.md stamp their CoverageMode; `/planning` Step 3 has the CoverageMode HALT (step 12); `/chain` queue-build validates it
- [x] `deferred-to-DEEP` in xlsx-lint deny-list (xlsx-lint-rules.mjs:204)
- [x] Zero edits to `coverage_mode` value, enumerate-page.mjs, walk-exemptions.json (git diff scope check clean)

## Verification artifact (D23)

```bash
node .claude/hooks/lib/test-coverage-tier-fixtures.mjs && grep -n "coverage_tier_mode" .claude/closure-config.json && grep -n "deferred-to-DEEP" .claude/rules/inventory.md scripts/xlsx-lint-rules.mjs && grep -n "CoverageMode" .claude/skills/coverage/SKILL.md .claude/skills/ultracoverage/SKILL.md
```
Expected: fixtures exit 0; each grep returns ≥1 hit.

## Plan-Deviations log

| # | Deviation |
|---|---|
| D1 | Phase 3 (F1 fix) collided with pending PLAN_UNIQUE_CASE_COVERAGE_FLOOR Phase 1 item 4 (landed via commit 367363ff2, 2026-07-23), which had demoted Coverage_Ratio to a reported signal on the premise "a computed number nobody blocks on". This plan's contract requires the ratio blocking. Resolution: LR-062 rule text + this plan's contract win — ratio re-promoted to blocking; the deferral token makes it consumable, voiding the demotion's premise; UCF plan annotated SUPERSEDED on that item; its type-binding check untouched. Surfaced by cross-family review E (finding M2); CEO verified provenance via `git show HEAD:` before ruling — the initial "worker invented scope" reading was WRONG and is retracted. |

### Execution Summary

**Executed 2026-08-07 via full council delegation** (owner directive: /execute + /ultrathink through Copilot council). CEO orchestrated; council workers did all substantive edits; cross-family gpt-5.5 reviewed twice (full review E: MATERIAL_ISSUES → 5 defects fixed; delta review G: CLEAN, every fix VERIFIED at file:line).

**TC accounting (LR-027)**: n/a — framework-mechanism plan; no test cases authored or dropped.

**Phase outcomes** (all 5 phases DONE, zero deferred):
1. Phase 0 — baseline verified (LR-072 free, anchors re-derived, walk-exemptions empty, pre-change Cx control captured at `.claude/state/ua-worker/chips/cov-tier-exec/regression-control-PRE.txt`).
2. Phases 1-2 (runs cov-exec-a-docs + cov-exec-a2-finish) — LR-072 authored (`.claude/rules/inventory.md:166`), LR-062 token vocabulary, LR-064 TDW-Q, LR-065 tier-independence line, LR-041 CoverageMode field (`.claude/rules/pipeline.md:127`), §20-Q (AGENT_SHARED_RULES), `Walk_Mode` manifest key + quick staleness path (field-inventory-spec row 10), fcg.md §3 pointer (:111), CASE_GENERATION_STANDARD pointer (:85), LEARNED_RULES ledger line.
3. Phase 3 (runs cov-exec-b-machine + b2a + b2b + f-fixes + i-comments) — `coverageVerdict()` Walk_Mode + token (coverage-manifest.mjs), G1 enforcement (verify-denominator.mjs), checkCx tier branch + mismatch rule + `resolveCoverageTierMode()` + `--coverage-tier-mode` flag (validate-plan-closure.mjs), `coverage_tier_mode: "announce"` + ramp fields (closure-config.json:27), `deferred-to-DEEP` deny-list entry (xlsx-lint-rules.mjs:204), SP-AAE-02 quick 30d window (check-tc-has-fieldinventory.mjs:250,320), fixture battery `.claude/hooks/lib/test-coverage-tier-fixtures.mjs`.
4. Phase 4 (run cov-exec-c-skills) — all 5 SKILL.md files wired (coverage stamps quick + profile + residual note; ultracoverage stamps deep + Step 0.5 backlog grep; planning validator step 12; chain queue-build check; find-bugs quick paragraph).
5. Phase 5 — fixture battery **7/7 PASS exit 0** (exceeds the 6 promised: fixture (e) split into (e) ratio-only + (e2) undispositioned per review fix F4), CEO-re-run independently 3×; regression control dry-run signature **identical pre/post** (C3 FAIL on the NM2269 plan's long-missing html-report png — the known pre-existing signature, nothing new); `node --check` clean on every edited script; `npm run plans:reindex` parsed the CoverageMode field inert (this plan listed correctly, row confirmed); git scope check clean (one anomaly, export_test_cases/module-codes.json, traced by mtime+diff to pre-session SCT/TNC work).

**Review trail**: E (MATERIAL_ISSUES: ratio-floor regression concern, announce-leak, fixture-(f) reimplementation, G4 prose-only, stale step-count) → all five fixed in runs f-fixes/i-comments → G (CLEAN, F1-F5 VERIFIED). The ratio-floor finding resolved as deviation D1 (see Plan-Deviations log — pre-existing demotion from PLAN_UNIQUE_CASE_COVERAGE_FLOOR reconciled, both plans cross-annotated).

**Documentation changes**: all listed in Per-Identity OWNER row; no client-shipped artifact touched (G3 held — deny-list entry proves the boundary).

**Verification** (re-runnable):
```
node .claude/hooks/lib/test-coverage-tier-fixtures.mjs && grep -n "coverage_tier_mode" .claude/closure-config.json && grep -n "deferred-to-DEEP" .claude/rules/inventory.md scripts/xlsx-lint-rules.mjs && grep -n "CoverageMode" .claude/skills/coverage/SKILL.md .claude/skills/ultracoverage/SKILL.md
```

## Handoff

Chat-only per `feedback_handoff_in_chat_only.md`; outcomes stated per LR-039 (no blocker claims). The DEEP-backlog consumption path (/ultracoverage Step 0.5) is the designed follow-up surface; SCT plan re-declaration is an owner decision flagged in §What-becomes-stale.
