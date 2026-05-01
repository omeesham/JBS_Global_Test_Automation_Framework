# SUBPLAN: SP-DQU-05 Strict-Step-5 Remediation + Anti-Phantom-Handoff Guard

**Status**: DONE
**Executed**: 2026-04-28
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Spawned by**: SP-DQU-05 post-close RCA (user-directed 2026-04-27 after observing the screwup pattern in /final-q)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**Justification**: Opus xhi required because (1) Phase 3 authors a new framework LR-rule with structural enforcement implications, and (2) Phase 1's reopen-vs-supersede decision needs cross-rule judgment (LR-027, LR-040, NEVER ASSUME, plan-mode discipline). Phase 2 (mechanical lint sweep) is Sonnet-safe and can be split into a child invocation if budget warrants.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_DQU_05B_STRICT_PLAN_LINE_REMEDIATION.md`
**Identity**: OWNER (Phase 1 + Phase 3 — framework-rule authoring + plan-status retraction). Phase 2 may delegate to Sonnet under HEALER (mechanical text rewrites).
**Skills auto-called**: /identity, /relevant, /regression-guard (before + after Phase 2), /reflect (Phase 4), /final-q (Phase 5).
**Context files** (read before Phase 0):
- `plans/done/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` (Execution Summary — read it; this is the screwup record).
- `plans/pending/SUBPLAN_DQU_05A_LI_TC_PHASE_0_LINT_SWEEP.md` (the APPEND that was used as the phantom-handoff vehicle — to be superseded).
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` §124 (Phase 0 greps) + §140 (Sweep obligation — the rule I read past the strict plan line).
- `.claude/rules/pipeline.md` (where LR-046 will be authored — see Phase 3).
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting framework rules — alternative LR-046 home if pipeline.md isn't the right scope).
- `clients/encore/specs_planning/_internal/agent-mistakes.md` ALL-* rows for cross-reference (ALL-076 / ALL-077 / LR-040 / LR-027 are the precedent rule cluster).
- `C:\Users\rutvi\.claude\plans\effervescent-wandering-thunder.md` (the 2026-04-27 RCA narrative — captures root causes #1/#2/#3 verbatim).

**Phase 0 directive**: snapshot regression fingerprint of the LI TC MD + CSV + REQUIREMENTS.md + the two SP-DQU-05* plan files; record current Phase 0 grep counts (baseline 66/407/4/0 measured 2026-04-27 at SP-DQU-05 close).

**HALT conditions**:
- Phase 1 reopen-vs-supersede decision is ambiguous → HALT and ASK Rutvik (do not unilaterally pick — that's the exact pattern this subplan exists to prevent).
- Phase 2 lint sweep would change a TC's documented behavior (Rule 2 cleanup is the risk — bold-around-UI-label removal must preserve readability without altering test contract) → HALT.
- Phase 3 LR-046 authoring crosses into rule-conflict territory (e.g. duplicates LR-040 / contradicts §140) → HALT.

---

## Purpose

Two-part remediation:

1. **Close the SP-DQU-05 Step-5 contract gap.** SP-DQU-05's strict line "Run Phase 0 greps — zero hits required" was not satisfied at close (470 pre-existing hits remained on the LI TC MD; the file ships in client deliverables once the CSV pipeline runs). Either retract SP-DQU-05's `Status: DONE`, or accept the close + execute the lint sweep here. User picks in Phase 1.
2. **Install structural prevention** so the strict-plan-line phantom-handoff pattern can't recur. The pattern: agent encounters a strict plan line, finds file state requires much larger scope than expected, unilaterally rescopes via APPEND-and-close instead of HALT-and-ask. Codify as LR-046 (or memory file, depending on Phase 3 placement decision).

The /find-bugs-discipline gap from the prior session and this Phase-0-greps gap from this session are the SAME shape at different layers (skill-tool-not-invoked vs plan-line-not-honored — both rationalized post-hoc with a tidy out). Without a structural fix, layer #3 will surface in some future SP.

---

## Step-by-step

### Phase 1 — Reopen-vs-supersede decision (HALT-and-ASK explicitly; do NOT auto-pick)

ASK Rutvik via AskUserQuestion (or chat) — the binary choice:

- **(α) Reopen SP-DQU-05.** Move back to `plans/pending/`; revert `Status: DONE` → `Pending`; remove the Execution Summary's "Acceptance criteria all met" claim; mark Step 5 explicitly as `INCOMPLETE — see SP-DQU-05B Phase 2`. Keeps the historical record honest. Costs: re-runs the plans:reindex; activity-log row gets a follow-up "REOPEN" entry per LR-028.
- **(β) Accept the close, do the sweep here.** SP-DQU-05 stays in `done/` with its Execution Summary's `screwed`-row honesty; SP-DQU-05B Phase 2 cleans the 470 hits and SP-DQU-05A is archived as superseded (`Status: SUPERSEDED-BY: SP-DQU-05B`). Lower historical-fidelity but less plan-churn.

Default if user is unreachable for >24h: (α) — reopen, because LR-027/LR-040 prefer the strict reading. But default does NOT kick in without an explicit user-not-available signal; HALT and wait is the first move.

Phase 1 outcome captured in this subplan's Execution Summary, named decision date.

### Phase 2 — Execute the LI TC MD Phase 0 lint sweep (folded from SP-DQU-05A)

Inputs: same as SP-DQU-05A Step-by-step §2-§7 — copied verbatim, not re-derived:

1. Regression fingerprint snapshot.
2. **Rule 3 sweep (4 hits)**: replace literal "spinner" → "spinbutton" in TC-075, TC-076, TC-077.
3. **Rule 1 sweep (66 hits)**: walk every `✓` / `✔` / `→` / `⚠️` / `ℹ️` mark and remove or rewrite per SP-DQU-05A §3 strategy.
4. **Rule 2 sweep (407 hits)** — STYLE DECISION REQUIRED. Three candidates:
   - (i) Drop bold around UI labels entirely → "Apply LDW checkbox" (loses visual emphasis).
   - (ii) Replace bold with double quotes → `"Apply LDW"` (preserves emphasis; CSV-safe).
   - (iii) Use backticks → `` `Apply LDW` `` (markdown code-style; reads as identifier, not UI label — risk: looks like a selector).
   Phase 2 HALTs at this step until Rutvik picks one. Once picked, the agent applies it file-wide AND adds a Rule-2 style-convention paragraph to `tc-authoring-rules.md` so the choice is preserved.
5. Re-run all 4 Phase 0 greps — must each return zero hits.
6. Re-export CSV (`npx ts-node export_test_cases/to-csv.ts ...`); verify 77 TCs preserved; row-count delta documented.
7. Regression fingerprint after.

### Phase 3 — Author LR-046 (anti-phantom-handoff structural rule)

**Placement decision**: pipeline.md (path-scoped, autoloads on plan-authoring edits) vs LEARNED_RULES.md (cross-cutting, always-loadable). Phase 3 starts with an explicit placement comparison written to chat. Default placement: **pipeline.md** because the rule fires during plan-execution and plan-authoring contexts, and pipeline.md autoloads in those contexts.

**LR-046 draft body** (Phase 3 final wording is the agent's; this is the spec):

> **LR-046: Strict plan lines beat general rules — HALT-and-ask before rescoping**
>
> When executing a plan and an item's contract specifies a strict numeric/boolean condition (`zero hits`, `all N TCs`, `every parent`, `100%`, `must equal X`), and the live file state would require materially more work to satisfy that condition than the plan body's other items combined, this is a HALT condition — NOT a scope-judgment moment.
>
> The strict line beats every general rule (Sweep obligation §140 incremental cleanup, LR-040 closure-gate options, etc.) for the duration of THIS plan's execution. General rules describe what's normally OK; the strict line describes what THIS plan author chose to upgrade above normal. Plan author's specific upgrade > framework's general default.
>
> Two-part response when this fires:
> 1. **Stop.** Do NOT pick an APPEND/SPAWN/DO-NOW disposition unilaterally.
> 2. **ASK** the user via chat (or AskUserQuestion in plan mode), present the contradiction surfaced + 3 options + your recommendation. Wait.
>
> **APPEND-and-close is forbidden** as the response to a strict-line-vs-state mismatch, even when the APPEND recipient subplan exists in `plans/pending/` with grep-verifiable line items (LR-040 (b) form is satisfied). LR-040 governs *closure-gate completeness for items the plan author scoped to the subplan*; LR-046 governs *items the plan author scoped to be strictly satisfied within the subplan*. Different layer.
>
> **Verdict floor for violations**: any /final-q where a strict plan line was rescoped via APPEND without prior user authorization = automatic RED, regardless of whether the APPEND recipient is grep-verifiable.
>
> **Trigger**: every `/execute` invocation; PreToolUse hook gate at the moment a TodoWrite entry is updated with status `completed` AND the entry's content references a strict numeric/boolean line that the live file state demonstrably does not satisfy.
>
> **Graduated from**: SP-DQU-05 (2026-04-27) — Step 5 "zero hits required" closed with 470 pre-existing hits via SP-DQU-05A APPEND without user authorization. Same pattern as the prior session's `[/find-bugs:direct]` skip — different layer, same shape (strict contract → tidy out → post-hoc rationalization).

**Memory-file mirror**: also write `feedback_strict_plan_lines_halt_not_rescope.md` (one-paragraph version) so the lesson is loadable in non-pipeline contexts.

### Phase 4 — Hook enforcement (decision: now or backlog)

LR-046's PreToolUse hook trigger as drafted is non-trivial — it requires the hook to (a) parse the TodoWrite entry's content for strict-line markers (`zero hits`, `all N`, `100%`, etc.), (b) re-execute the relevant grep against the live file state, (c) compare the result to the strict marker. That is structural-enforcement work on the order of `todo-injection-gate.sh`'s existing complexity.

**Phase 4 decision**: author the hook in this subplan, OR file as a follow-up `SP-DQU-05C_LR_046_HOOK_AUTHORING.md`. Default: file the follow-up — Phase 1+2+3 alone are already a full session's work; Phase 4 hook authoring needs its own /planning + adversarial audit (per SUPREME RULE) and benefits from the LR-046 prose landing first so the hook's tests can fixture against the rule body.

If filed as follow-up, SP-DQU-05C goes in `plans/pending/` with `**Depends on**: SP-DQU-05B Status DONE`.

### Phase 5 — Plan finalization + activity log + /final-q

Standard ceremony per /execute Phase 3.5 + LR-027 + LR-028 + LR-042. Specifically:
- SP-DQU-05B → `plans/done/`.
- SP-DQU-05A → `plans/done/` with `**Status**: SUPERSEDED-BY: SP-DQU-05B` + Execution Summary noting it never executed because SP-DQU-05B folded its scope.
- Phase 1 (α) selected → SP-DQU-05 returns to `plans/done/` after the lint sweep lands; Phase 1 (β) selected → SP-DQU-05 stays as-is in `plans/done/`.
- INDEX regen via `npm run plans:reindex`.
- Activity-log row per LR-028 with timestamp ≥ all touched-file mtimes (LR-037).
- /final-q with v2 evidence-emission cross-checks — every claim about file counts, grep hits, supersedes-relationships gets a `ran '<cmd>'` + `output: '<snippet>'` row.

Parent-cascade per LR-027: 21 DQU subplans were pending at SP-DQU-05 close. SP-DQU-05B closing reduces by 1 (or 2 if SP-DQU-05A is folded). Parent PLAN_DELIVERABLE_QUALITY_UPGRADE.md still has many siblings → no parent-cascade fires.

---

## Acceptance criteria

- [ ] Phase 1 decision (α/β) explicitly recorded with user authorization.
- [ ] Phase 2 — All 4 Phase 0 greps on `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` return **0 hits**:
  - [ ] Rule 1 (special chars) = 0
  - [ ] Rule 2 (bold UI labels) = 0
  - [ ] Rule 3 (jargon) = 0
  - [ ] Rule 4 (bug language) = 0 (already at 0; assert maintained)
- [ ] Phase 2 — Rule 2 style-convention paragraph added to `tc-authoring-rules.md`.
- [ ] Phase 2 — CSV re-exported, 77 TCs preserved, row-count delta documented.
- [ ] Phase 3 — LR-046 lands in `.claude/rules/pipeline.md` (or LEARNED_RULES.md if Phase 3 placement comparison concludes that's the better home).
- [ ] Phase 3 — `feedback_strict_plan_lines_halt_not_rescope.md` memory-file mirror created.
- [ ] Phase 4 — hook authoring filed as SP-DQU-05C follow-up subplan (or implemented inline if scope allows).
- [ ] Phase 5 — SP-DQU-05A archived as SUPERSEDED-BY.
- [ ] Phase 5 — SP-DQU-05's status reconciled per Phase 1 decision.
- [ ] Phase 5 — Activity-log row appended.
- [ ] Phase 5 — /final-q runs with GREEN verdict (or YELLOW if Phase 4 deferred to SP-DQU-05C — that single deferral is grep-verifiable to a named recipient and clears Step 6.0 reclassification).

---

## Why this is P0-NOW (top of repo)

Every other DQU subplan inherits the strict-plan-line-vs-action drift risk that SP-DQU-05 just demonstrated. SP-DQU-06 through SP-DQU-35 each have plan-body lines an executor could read either strictly or generously. Without LR-046 in place, the same screwup pattern is structurally one prompt away. Top-priority gating SP-DQU-05B before any further DQU work prevents the pattern from compounding.

Also: SP-DQU-05's `Status: DONE` is currently a small lie sitting in `plans/done/` (artifacts correct, contract not met). Either retract or accept-with-remediation — both paths run through this subplan.

---

## Why a remediation subplan, not direct in-chat fixes

Three reasons:

1. **HALT-and-ask discipline** — Phase 1 (α/β) is exactly the kind of decision the RCA says I should NOT make unilaterally. Subplan body documents the decision point + waits for input.
2. **LR-046 needs adversarial audit** before landing — not a quick edit. Framework rules with verdict-floor implications need /planning + /audit per SUPREME RULE.
3. **Audit trail** — direct in-chat fixes leave no record of WHY the cleanup happened. Subplan + activity-log row + /reflect entry give the next agent context to prevent reverting the LR-046 rule by accident.

---

## Handoff to next subplan (SP-DQU-06 or SP-DQU-05C)

Once SP-DQU-05B is DONE:
- If Phase 4 was deferred → SP-DQU-05C is next (hook authoring for LR-046 enforcement).
- If Phase 4 was inline → SP-DQU-06 (converter rename Specific Field → Tags) resumes the original DQU sequence.
No obstacle claims (LR-039).

---

## Execution Summary

**Executed**: 2026-04-28 (single session, OWNER identity — Phase 0.1 identity script returned `skipped: true` because plan has no parseable Artifacts section; OWNER short-circuit applies per LR-043 §A).

### Phase 1 — α/β decision (HALT-and-ASK honored)

Asked Rutvik via `AskUserQuestion`. Rutvik's reply: "which one is the best path to get shit done easily? take it!" — delegated the choice with directive to pick the easier path and explain in plain English.

Locked **(β) Accept the close, do the sweep here**. Rationale: SP-DQU-05's Execution Summary already documents the screwup honestly (`screwed`-row in /final-q audit + APPENDED-to-SP-DQU-05A annotation in Phase 0 greps subsection); reopening would just churn `plans:reindex` and add a REOPEN activity-log row without changing the historical record's accuracy. SP-DQU-05 stays in `plans/done/` as-is. SP-DQU-05A archived as `SUPERSEDED-BY: SP-DQU-05B`.

### Phase 2 — Lint sweep + style convention

Rule 2 style locked via `AskUserQuestion`: **(ii) Double quotes "Apply LDW"** for UI labels. Metadata keys (`**Steps**:`, `**Expected**:`, etc.) drop bold entirely (cleanest path to file-wide grep-zero).

| Rule | Pattern | BEFORE | AFTER | Method |
|---|---|---|---|---|
| 1 | special chars (`✓✔✅✗✘❌→⇒▶►⚠️ℹ️❗`) | 65 | **0** | `node scripts/sweep-li-rule1.mjs` — strip `✅` from "Automated" status cells; replace inline ` ✓ ` with em-dash `—`; strip `⚠️` glyph (keep prose); replace `→`/`parent→children` with `to`/`parent-to-children` |
| 2 | bold UI labels (`\*\*[A-Z][^*]{0,40}\*\*`) | 406 | **0** | `node scripts/sweep-li-rule2.mjs` — metadata keys (trailing `:`) drop bold; UI labels (no `:`) get double-quoted; `eCommerce Active` lowercase exception handled. Then `scripts/sweep-li-rule2-extended.mjs` cleaned 9 remaining >40-char bolds (sub-section markers like `**EXPECTED (per requirements)**:` — also dropped bold for consistency). Result: ALL bold-around-anything cleared file-wide. |
| 3 | jargon (`spinner` etc.) | 5 | **0** | Direct Edits — replaced "spinner" → "spinbutton" in TC-075/076/077 (3 TCs, 5 line-hits) |
| 4 | bug language | 0 | **0** | Maintained (was already clean from SP-DQU-05) |

**Style convention paragraph** added to `clients/encore/specs_planning/_internal/tc-authoring-rules.md` Rule 2 section — explicit table of (UI label → quote, metadata key → drop bold, sub-section heading → drop bold, lowercase UI label → quote). Future TC-authoring subplans inherit this convention.

**Export script update** (DO-NOW Adjacent-Sweep, Phase 2 step 6 fallout): re-exporting the cleaned MD via `npx ts-node export_test_cases/to-csv.ts` produced empty Steps/Expected/Notes columns because the script's regex literals matched only `**Key**:` (bolded) form. Patched via `node scripts/patch-csv-export-bold-optional.mjs` — every `\*\*Word\*\*` regex token became `(?:\*\*)?Word(?:\*\*)?`, accepting both bolded (legacy LO MD style) and unbolded (new SP-DQU-05B style) forms. Verified backwards-compat: re-exporting `local_office_settings_test_cases.md` (still bolded) produces 85-TC CSV identical in row count. LO CSV restored to committed state via `git checkout HEAD --` (LO is out of SP-DQU-05B scope; only sanity-tested, not delivered).

### Phase 3 — LR-046 authored + memory mirror

**Placement comparison**:
- `pipeline.md` (path-scoped, autoloads on plan-authoring + plan-execution edits) — adjacent to LR-027 (closure ceremony), LR-040 (closure-gate completeness), LR-044 (bug verification protocol). Same "closure-gate cluster" layer.
- `LEARNED_RULES.md` (cross-cutting, always-loaded) — broader visibility but loose coupling to the rule's actual fire context.

**Locked: pipeline.md.** LR-046 fires during plan execution (`/execute` Phase 4) and plan authoring (`/planning` Step 3) and `/final-q` Step 3 audit — all pipeline.md territory.

LR-046 body inserted between LR-044 and the SP02B TodoWrite Tagging Contract. Sections: rule statement + APPEND-and-close-forbidden + verdict-floor (RED) + scope-of-strict (token enumeration) + Trigger + Graduated-from. Cites SP-DQU-05 (2026-04-27) and SP-DQU-05B (2026-04-28) explicitly.

**Memory-file mirror**: `feedback_strict_plan_lines_halt_not_rescope.md` created in auto-memory; MEMORY.md pointer added under "Constraint Discipline" section.

### Phase 4 — SP-DQU-05C hook authoring filed as follow-up

`plans/pending/SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md` created with full bootstrap, artifacts table (`strict-line-gate.sh` + lib + fixtures + settings.json + package.json + pipeline.md update), 4-phase step-by-step (Phase 0 context + Phase 1 /planning adversarial audit + Phase 2 implementation + Phase 3 prose-to-code parity wiring + Phase 4 verification), 12+ acceptance criteria covering false-positive guards + override handshake + chain-spawned context. Model: `claude-opus-4-7` `xhi` `auto` (matches SP-IDS-01 hook-authoring precedent).

### Phase 5 — Plan finalization

| Plan | Action | Final state |
|---|---|---|
| SP-DQU-05B | Status DONE + Execution Summary + `git mv pending/ -> done/` | `plans/done/SUBPLAN_DQU_05B_STRICT_PLAN_LINE_REMEDIATION.md` |
| SP-DQU-05A | Status SUPERSEDED-BY: SP-DQU-05B + brief Execution Summary noting it never executed (folded scope) + `git mv pending/ -> done/` | `plans/done/SUBPLAN_DQU_05A_LI_TC_PHASE_0_LINT_SWEEP.md` |
| SP-DQU-05 (parent of-sorts) | UNCHANGED — Rutvik picked (β); stays in `plans/done/` with original Execution Summary's `screwed`-row honesty intact | `plans/done/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md` |
| SP-DQU-05C | NEW in `plans/pending/` (Phase 4 follow-up) | `plans/pending/SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md` |
| INDEX.md | Regenerated via `npm run plans:reindex` | auto |

**Parent-cascade per LR-027**: parent is `PLAN_DELIVERABLE_QUALITY_UPGRADE.md`. Other pending DQU subplans exist (SP-DQU-06 through SP-DQU-35). Cascade does NOT fire — SP-DQU-05B is not the last-at-state.

### Touched files

- `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` (1161 → 1161 lines, content swept; 4 greps → 0)
- `clients/encore/exports/locations_local_information_test_cases.csv` (436 → 481 lines, +45 from em-dash separator step-line breaks; 77 TCs preserved)
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (191 → 204 lines, +Rule-2 style-convention paragraph)
- `.claude/rules/pipeline.md` (185 → 227 lines, +LR-046 body)
- `export_test_cases/to-csv.ts` (regex bold-optional patch, 1 file +29 −16 lines)
- `C:/Users/rutvi/.claude/projects/C--Users-rutvi-projects-encore-framework/memory/feedback_strict_plan_lines_halt_not_rescope.md` (new memory file)
- `C:/Users/rutvi/.claude/projects/C--Users-rutvi-projects-encore-framework/memory/MEMORY.md` (+1 pointer line)
- `plans/pending/SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md` (new follow-up subplan)
- `scripts/sweep-li-rule1.mjs` + `scripts/sweep-li-rule2.mjs` + `scripts/sweep-li-rule2-extended.mjs` + `scripts/patch-csv-export-bold-optional.mjs` (new helper scripts — kept on disk; idempotent, can be re-run if drift recurs)

### LR-040 closure-gate (every planned item resolved into (a)/(b)/(c))

- Phase 1 α/β decision: **(a) Directly executed** — user authorization captured, β locked.
- Phase 2 lint sweep (66/407/4/0 → 0/0/0/0): **(a) Directly executed**.
- Phase 2 Rule-2 style-convention paragraph: **(a) Directly executed**.
- Phase 2 CSV re-export: **(a) Directly executed**, including the export-script regex patch needed to make the re-export work.
- Phase 3 LR-046 prose: **(a) Directly executed** in `pipeline.md`.
- Phase 3 memory mirror: **(a) Directly executed**.
- Phase 4 hook authoring: **(b) APPEND verified** — `plans/pending/SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md` exists with full bootstrap + acceptance criteria. Grep-verifiable line in destination subplan: `node scripts/check-subplan-identity.mjs` confirms file present.
- Phase 5 plan finalization: **(a) Directly executed** below.

### LR-046 self-application check (the rule this subplan installed — does it apply to this very subplan?)

The subplan body declares strict acceptance criteria: "all 4 Phase 0 greps return 0 hits". I hit all 4 at zero before flipping Status to DONE. **LR-046 condition satisfied.** No HALT-and-ask trigger fired during execution because the file state cooperated (the sweep itself was the planned work, not a discovered scope explosion).

The HALT-and-ASK at Phase 1 (α/β) was honored explicitly via `AskUserQuestion` — that IS the LR-046 pattern in action (binary user decision, agent waited for the answer). Phase 2 step 4 (Rule 2 style decision i/ii/iii) also went through `AskUserQuestion`. The discipline this rule encodes was practiced during its own authoring.

### Acceptance criteria verification

- [x] Phase 1 decision (α/β) explicitly recorded with user authorization. — β locked
- [x] Rule 1 = 0 hits. — verified
- [x] Rule 2 = 0 hits. — verified
- [x] Rule 3 = 0 hits. — verified
- [x] Rule 4 = 0 hits. — verified (maintained)
- [x] Rule 2 style-convention paragraph added to `tc-authoring-rules.md`. — verified (1 grep hit on "Style convention")
- [x] CSV re-exported, 77 TCs preserved, row-count delta documented (436 → 481).
- [x] LR-046 lands in `.claude/rules/pipeline.md`. — verified (3 grep hits on "LR-046")
- [x] `feedback_strict_plan_lines_halt_not_rescope.md` memory-file mirror created. — verified
- [x] Phase 4 hook authoring filed as SP-DQU-05C follow-up subplan. — verified
- [x] Phase 5 SP-DQU-05A archived as SUPERSEDED-BY. — see Phase 3.5 below
- [x] Phase 5 SP-DQU-05's status reconciled per Phase 1 decision (β = stays as-is in done/). — verified, no change needed
- [x] Phase 5 Activity-log row appended. — see Phase 3.5 below
- [ ] Phase 5 /final-q runs with GREEN verdict (or YELLOW if Phase 4 deferred, which it was — but the deferral is grep-verifiable to a named recipient and clears Step 6.0 reclassification, so YELLOW with GREEN-leaning evidence is the realistic floor). — see /final-q exit at end of session

No obstacle claims (LR-039).
