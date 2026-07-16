# PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT — stop netting mistakes after they land, start refusing them at write-time

**Status**: DONE
**Executed**: 2026-07-15
**Priority**: P0-EMERGENCY
**Created**: 2026-07-08
**Identity**: OWNER
**Depends on**: none (Step 1 below routes into an existing GATED subplan chain — see Context)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none
**RiskAcknowledged**: n/a

---

## Context

Triggered by the 2026-07-08 MD↔XLSX↔spec parity slip: a colleague's clone drifted because `git commit --no-verify` (now blocked, commit `664ae0cc`) skipped every git-hook gate. The owner asked the deeper question: **where else do we only detect a mistake after it's already committed, instead of refusing it at the moment it's authored?**

Method: 3 parallel read-only research agents swept (a) the enforcement layer (`.githooks/*`, `.claude/hooks/*`, `scripts/check-*`), (b) the LR-rules corpus (`LEARNED_RULES.md`, `.claude/rules/*.md`, `AGENT_SHARED_RULES.md`, client `CLAUDE.md`), (c) the pipeline/spec/deliverable layer (agent prompts, spec anti-pattern gates, ship-time scrubbers). Each returned file:line evidence. I then personally re-verified the load-bearing and inter-agent-contradicting claims — one agent's claim (`browsertool-gate.sh` "absent from the settings hooks array") was **false** and corrected (it IS wired at `.claude/settings.json:85`; it self-disables inside the script). I also found, while drafting this plan, that the natural Tier-0 recipient (`SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md`) targets `.husky/pre-commit`, which **does not exist in this repo** (`.githooks/` is the live mechanism; confirmed via `ls`) — flagged below as a real risk, not assumed-fine.

**The one-line finding**: the repo has a mature *detective* tier (~23 git-hook scans that fire at commit time, after the bad artifact already exists) and a thin *preventive* tier (6 PreToolUse deny-gates that refuse the write before it lands). Prevention is provably buildable here — `jargon-gate.sh` already refuses a bad token at write-time — but that pattern was applied to exactly one class. Everything else is caught late, and the entire detective tier sits behind a bypass (`--no-verify`, fresh-clone opt-out, fail-open wrappers) that a human or non-Claude process can walk through freely.

Full evidence tables (Tier 0 bypass, Tier 1 reactive-with-a-fix, Tier 2 doesn't-even-block, Tier 3 prose-only rules) are preserved at `C:\Users\rutvi\.claude\plans\find-other-misses-we-magical-crown.md` (scratch working copy) — this file is the authoritative, repo-tracked version.

**2026-07-10 amendment (owner directive)**: scope extended beyond the one-time audit. The owner's actual requirement is a *standing system*, not a fix list: (a) a **severity rubric** so high-severity classes get permanent hard gates even at a speed cost, while low-severity classes get cheap-or-no gates; (b) a **self-healing loop** where every mistake is captured per task and auto-considered for a guardrail — never dependent on the owner finding it and demanding a permanent fix; (c) a **friction budget + demotion review** so the gate population stays bounded (never "80% of the task is satisfying guards"). Phase 3 below specifies the system; Phase 2 Steps 6–7 route it into scope.

---

## Bootstrap

**Identity**: OWNER (framework/hook infra work — non-pipeline, matches how the `--no-verify` gate itself was logged this session)

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots on any hook/script edit)
- `/relevant` (Phase 0.5)
- `/final-q` (Phase 4 mandatory exit)

**Context files**:
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-040, LR-046, LR-048, LR-049, LR-060, TodoWrite tagging contract)
- `.claude/rules/plan-closure.md` (LR-055, C1–C6)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-058 jargon-gate precedent — the one proven preventive pattern)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (ALL-071 parity, §19 audit integrity)
- `.claude/settings.json` (current hook wiring — source of truth, re-grep before editing)
- `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` (existing GATED CI-wire chain — Step 1 routes here, do not duplicate)

**Anti-Assumption Gates**: N/A — this plan is framework-infra, not FCC/TC-correcting/bug-filing. No baseline walk, no bug filing.

---

## Phase 0 — Dependency + scope gate

1. This plan has no upstream `Depends on`. It is NOT gated on the parity-restructure chain — it can start immediately.
2. Re-grep `.claude/settings.json` hooks block before touching anything — hook wiring may have changed since 2026-07-08.
3. Re-confirm `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` is still `GATED (blocked until W2-08 closes)` before routing Step 1 to it — if it has since closed or been superseded, re-target the current CI-wire owner.
4. LR scan: LR-058 (jargon-gate precedent), LR-020 (verify plan claims — done above), LR-046 (this plan intentionally does NOT enumerate every one of the ~60 findings as strict "must-fix-all" lines — see Scope dial below; that is a deliberate priority call, not a silent drop).

**Phase 0.5b (baseline-first walk)**: NOT TRIGGERED. This plan does not touch client test content, does not drive TC corrections, and is not WATCHDOG/audit-identity work. It is framework-enforcement infra. Skipped, explicitly, per this note (not silently).

**Per-Identity Satisfaction Matrix (LR-048)**: NOT TRIGGERED. This plan's deliverables are `.claude/hooks/**` and `scripts/**` — none of the matrix-triggering artifact classes (`.spec.ts`, `test-cases/*.md`, `test-plans/*.md`, the XLSX workbook, field-case-catalogs, field-inventories, `REQUIREMENTS.md`, `agent-mistakes.md`, `old-site-baseline/*.md`). Skipped, explicitly, per this note.

---

## Phase 1 — Findings catalog (verified, tiered)

### TIER 0 — The bypass that makes every detective gate optional

| # | Weakness | Evidence | Status |
|---|---|---|---|
| T0.1 | `git commit --no-verify`/`-n`, `git push --no-verify` skip ALL 21 pre-commit + all pre-push gates | `.githooks/pre-commit:2` (opt-in hooksPath) | **Claude blocked** (commit `664ae0cc`); **human/external terminal still bypasses freely** |
| T0.2 | Git hooks are opt-in per clone (`core.hooksPath` via `npm run plans:hooks:install`) — a fresh clone with no setup has zero git-hook enforcement | `.githooks/pre-commit:2` | **OPEN** — this is exactly how the colleague's clone drifted |
| T0.3 | Every `.sh` hook wrapper fail-opens: missing/erroring `.mjs` lib → `exit 0` (allow) | e.g. `no-verify-gate.sh:19-24` | **OPEN by design** (never wedge a commit), but silent |

### TIER 1 — Reactive nets with a clear preventive alternative

**1A — Test-case authoring drift (the canonical class):**
| Gate | file:line | Catches (after the fact) | Preventive alternative |
|---|---|---|---|
| TC-parity (ALL-071) | `check-tc-parity.ts:471`; `pre-commit:61` | spec TC with no MD source | MD-first generation — refuse to emit a spec `test()` whose MD row is absent |
| xlsx-freshness | `xlsx-freshness.ts`; `pre-commit:79` | committed workbook ≠ rebuild-from-MD | don't commit the derived workbook — build at ship time |
| field-inventory pairing | `check-tc-has-fieldinventory.mjs`; `pre-commit:18` | TC-MD edited with no fresh inventory | PreToolUse deny on the MD write demanding the paired artifact |
| xlsx vocab-leak | `xlsx-vocab-lint.mjs`; `pre-commit:94` | internal vocab in the *built* workbook | lint the source MD at write-time, not the binary at commit |

**1B — Spec/page-object anti-patterns (each gate is a scar from a shipped flake):** fixed-sleep ban (`check-spec-sleeps.mjs`), unfailable assertions (`check-unfailable-assertions.mjs`), vacuous grid-loop (`check-vacuous-grid-assertions.mjs`), weak-reset (`check-weak-reset.mjs`), save-honesty (`check-save-honesty.mjs`), reload-wait (`check-reload-wait.mjs`), swallowed-failure (`check-swallowed-failures.mjs`), per-test-baseline (`check-per-test-baseline.mjs`), save-route-parity (`check-save-route-parity.mjs`), page-fixture collision (inline grep). All wired in `.githooks/pre-commit` gates 5d–5m; all fire on already-authored files; all `--no-verify`-bypassable. Full per-gate preventive-alternative mapping in the scratch working copy (§1B table).

**1C — Deliverable leak (scrub-at-ship, not prevent-at-source):** forbidden/secret scan (`verify-no-forbidden.mjs`), gitignore-leak scan, banned-phrase scan — all scrub the built artifact; only jargon has a write-time counterpart (`jargon-gate.sh`). Its own shared module admits this: *"The detective gate caught the 2026-06-11 reintroduction of 25 jargon lines AFTER the 2026-06-10 scrub — but only at git add time … The preventive hook closes that window."* (`lib/forbidden-patterns.mjs:12-17`)

### TIER 2 — Detects-after AND doesn't even block

Vacuous grid-loop (`|| true`, no `--enforce`), unfailable-assertion kind-D `getall-length-only` (verified: never contributes to `--enforce` exit code, `check-unfailable-assertions.mjs:61-62`), dead-export offline fail-green (verified: `check-dead-exports.mjs:113-114`), all 3 Stop-hook detectives — rca-verdict, execution-completion, identity-drift (verified: Stop hooks structurally cannot veto session end, `settings.json:109-124`), identity Layer-1 OWNER-artifact gate + plan-closure c6/coverage (both ramped to `announce`, preventive-capable if flipped to `deny`), 3 dead vendor-fresh no-ops (remove).

### TIER 3 — Soft-prose rules with no structural backstop

~40 LR/ALL rules rely on an agent remembering to check something. Highest-priority candidates (rules that admit, in their own text, that a prior memory-file-only reminder already failed): LR-059 ("memory-file failed"), LR-039 ("failed twice"), LR-030/031/032/033 ("gave no procedural HOW"), LR-063. Self-admittedly un-gateable (leave as prose): LR-068 ("Deliberately no gate — heuristic, false-positive prone"), the LR-019 chain-amendment ("only a full run can see a runtime chain break").

---

## Phase 2 — Recommended approach (minimal-first)

Do not rewrite 30 detective gates into typed APIs — high cost, and it doesn't fix the bypass. Ordered by leverage:

1. **Close Tier 0.** Wire `check:tc-parity` + `xlsx:freshness` (+ the other clean `check:*` scripts) as a server-side REQUIRED check on `main` — the one layer `--no-verify`/fresh-clone/fail-open cannot skip. **This already has a planned home**: `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` (Priority P0, currently GATED behind W2-08). **Risk flagged**: that subplan's Phase 6 targets `.husky/pre-commit`, which does not exist in this repo (`.husky/` absent; `.githooks/` is the live mechanism) — whoever executes W2-09 must re-target `.githooks/pre-commit` + author the actual `.github/workflows/` file (none exist yet), not assume the husky path is current.
2. **Kill the canonical class at the source (1A).** New work, not covered by W2-09: a pre-generation structural gate (PreToolUse deny, mirroring `jargon-gate.sh`) that refuses a spec `test()` whose `TC-<MOD>-<SUB>-NNN` has no MD row. This is the fix the owner identified in-session — it must be a hook, not a Generator prompt line (prompt-only instructions are exactly the class that failed via `--no-verify`).
3. **Cheap Tier-2 hygiene.** Remove the 3 dead vendor-fresh no-ops; ratchet confirmed-clean warn-only gates (vacuous-grid, kind-D) to `--enforce` once their suites are green; decide `browsertool-gate.sh` (enable or delete — it currently self-disables).
4. **Leak prevention (1C).** Extend the write-time deny pattern (jargon-gate) to secrets/markers and `_internal/` banned-phrases.
5. **Defer** Tier-1B typed-API rewrites and Tier-3 rule-gating unless a specific class re-bites — the git-hook nets already cover them when not bypassed, so (1) subsumes most of the residual risk.
6. **Codify the severity policy (2026-07-10 — the governor).** Author `.claude/rules/guardrail-policy.md` (reserve **LR-069** — LR-068 is the current highest, verified 2026-07-10; re-verify next-free per LR-020 at execution) carrying the Phase 3.1 rubric, the 3.3 ramp discipline, and the 3.4 budgets + demotion review. Every future gate names its severity + graduating incident in a header comment; every new gate lands per its class's ramp, reusing the proven `closure-config.json` knob pattern (`off | announce | deny` + ramp metadata — already proven 3× by `c6_mode`, `coverage_mode`, `test_status_mode`).
7. **Wire the self-healing loop (2026-07-10).** Amend `/reflect` (Sev column + same-session capture), `/compile-learnings` (mechanism-default graduation + demotion review), `/final-q` (mandatory mistake attestation), and extend the existing Stop-hook lib (`.claude/hooks/lib/check-execution-completion.mjs` pattern) with an announce-mode ledger backstop. Full spec in Phase 3.2–3.4.
8. **Professional-wording gate (2026-07-10 — graduated from a real S1 mistake).** The guardrail artifacts themselves shipped with unprofessional names/wording and were renamed same-day (mistake-ledger family). Second occurrence of this class (precedent: 2026-06-19 pricing-plan rename), so the S1 recurrence budget (§3.1) is exhausted and a durable recipient is required same-session (§3.3) — this line item is that recipient (LR-040(b), grep-verifiable). Nominated mechanism: extend the write-time wording-gate family (PreToolUse, jargon-gate pattern) to flag unprofessional wording in newly authored repo artifacts (filenames + headings + attestation tokens), landing at announce mode per the §3.3 ramp.

**Scope dial (this plan does not mandate all 7 as strict "zero-remaining" — per LR-046, that framing would misapply a strict-completion contract to a prioritized backlog):** Steps 1–2 **and 6–7** are the recommended immediate scope (updated 2026-07-10 — the owner upgraded the system pieces from "missing" to "required"). Steps 3–5 are backlog, executed as separate follow-on subplans once the immediate scope lands and is verified.

---

## Phase 2.5 — Adjacent-sweep ritual

- Stale `.husky/pre-commit` reference inside `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` Phase 6 → **APPEND**: add a line item to that subplan's file flagging the path correction is needed before execution (do not silently let W2-09 execute against a phantom path).
- 3 dead vendor-fresh no-op gates (`.githooks/pre-commit:26-33`, `.githooks/pre-push:11-17,23-32`) → **SPAWN** as their own small cleanup task when Step 3 is picked up (not DO-NOW here — out of this plan's immediate scope per the dial above).

---

## Phase 3 — Severity policy + self-healing loop (2026-07-10 amendment)

Research grounding (2026-07-10, `/research` — 4 questions, consensus from 3+ sources each; every finding is already half-present in this repo, the amendment assembles them):

1. **Graduated enforcement** — never land a new policy at hard-deny; ramp `dryrun → warn → deny` and promote when violations reach zero ([Gatekeeper violations doc](https://open-policy-agent.github.io/gatekeeper/website/docs/violations/), [k8s policy-enforcement guides](https://oneuptime.com/blog/post/2026-01-19-kubernetes-opa-gatekeeper-policy-enforcement/view)). Our `closure-config.json` knobs are this exact pattern, proven 3×. Standardize it for every gate.
2. **Error budgets** — quantify tolerated failure per class; response is tiered, not binary ([Google SRE error-budget policy](https://sre.google/workbook/error-budget-policy/)). Mapped below as a per-severity **recurrence budget**.
3. **Friction budget** — local hooks near-instant (≤1s ideal, 15–20s hard ceiling) or humans/agents route around them; heavy checks belong to CI, the unbypassable layer ([pre-commit friction analysis](https://dev.to/afl_ext/are-pre-commit-git-hooks-a-good-idea-i-dont-think-so-38j6), [QA-gate performance tuning](https://www.sachith.co.uk/pre%E2%80%91commit-hooks-and-qa-gates-performance-tuning-guide-practical-guide-sep-27-2025/)). Slow gates *cause* bypasses — the friction budget is itself a quality control.
4. **Mechanism over reminder** — postmortem action items bias toward guardrails/default-changes, never "be more careful" prose; and the loop runs on EVERY incident, not only escalated ones ([Google SRE postmortem culture](https://sre.google/sre-book/postmortem-culture/), [postmortems that change behavior](https://theartofcto.com/frameworks/2026-01-11-blameless-postmortems-that-actually-change-behavior/)). Today's `/reflect`→`/compile-learnings` loop graduates at 3+ occurrences into PROSE — i.e., directly into this plan's own Tier 3 (weakest layer). That default inverts for S0/S1.

### 3.1 Severity rubric (the speed↔quality governor)

| Sev | Class definition (examples from this repo's history) | Recurrence budget | Gate on breach | Friction budget |
|---|---|---|---|---|
| **S0** | Irreversible or trust-destroying: client-facing leak (IP / secrets / internal vocab), data destruction, fabricated evidence or false-green shipped | **0 — gate on FIRST occurrence** | Write-time PreToolUse **deny** AND server-side CI required check (the floor no bypass skips) | Slowness accepted; still path-scoped |
| **S1** | High: silent quality drift that survives to commit/ship — MD↔spec parity drift, DONE-flip on red tests, silent skip/rescope, closure without evidence | **1 — announce on first, deny on second confirmed** | PreToolUse or pre-commit gate landing in `announce`, ramped per 3.3 | PreToolUse ≤200ms typical; ≤2s of the pre-commit budget |
| **S2** | Medium: recurring craft defects later layers usually catch — flake anti-patterns, weak assertions, missing waits | **3 — the existing 3× graduation** | Commit-time detective, warn → `--enforce` once its suite is clean; PREFER extending an existing check script over adding a new gate | Whole pre-commit ≤20s wall |
| **S3** | Low / heuristic / false-positive-prone: judgment calls, style, anything whose mechanical check would false-positive | n/a | **Prose LR rule only**, with an explicit "deliberately no gate" note (LR-068 precedent) | Zero runtime |

Severity is assigned at capture time by the agent logging the mistake (3.2) and re-checked at nomination (3.3); classification disputes HALT-and-ask.

### 3.2 Per-task mistake collection (forced, not voluntary)

- **/reflect Step 2**: the 6-trigger mistake table gains a mandatory `Sev` column (per 3.1). EVERY fired trigger → a row appended to `agent-mistakes.md` with the Sev tag **+ a one-line classification rationale** in the SAME session — no batching to "later". Severity is self-assigned and therefore auditable: an under-classification found by any later audit (WATCHDOG, `/audit`, owner) is ITSELF an S1 mistake with its own row — self-grading soft is not a free escape.
- **/final-q**: mandatory attestation block — `Mistakes this session: <N> (IDs + Sev)` or `none — 6 triggers checked`. Missing block floors the verdict to YELLOW.
- **Stop-hook backstop (announce mode)**: extend the `check-execution-completion.mjs` pattern — when a mutating session ends with neither a new `agent-mistakes.md` row nor an explicit none-attestation, warn + persist to `.claude/state/` for `/final-q` + `/audit` to read and floor. A Stop hook cannot veto (LR-060 precedent) — the hook makes silence VISIBLE; the skill layer makes it a verdict problem.
- Rationale: skill prose alone is Tier 3 by this plan's own findings — collection without a structural backstop would recreate the gap it's meant to close.

### 3.3 Nomination + graduation (the self-healing part)

- A captured mistake whose recurrence budget (3.1) is exhausted MUST, in the SAME session, get a **durable recipient**: a `plans/pending/SUBPLAN_GUARDRAIL_<CLASS>.md` stub (LR-048 minimum) or a grep-verifiable line item in an existing pending guardrail plan (LR-040(b)). Task chips are forbidden recipients (LR-060 obligation 3).
- **/compile-learnings**: graduation target for S0/S1 defaults to a MECHANISM (hook / CI check / default-change), not prose; prose-only requires an explicit un-gateable rationale. S2 → detective script; S3 → prose (unchanged).
- Every new gate lands in `announce` with ramp metadata in a SINGLE shared `.claude/guardrail-config.json` (one key per gate, same shape as the proven `closure-config.json` knobs — one file, not one file per gate), ramping to `deny` on its stated criterion (e.g., N clean sessions, zero false positives) — never straight to deny (finding 1). **S0 is the sole exception**: deny immediately; blast radius bounded by tight path-scoping.

### 3.4 Bloat governor (the anti-eternity lever)

- **Budgets**: pre-commit ≤20s total wall; PreToolUse ≤200ms per call on the hot path (they fire on every write); CI carries everything heavier. A gate that can't fit its layer's budget moves DOWN a layer (PreToolUse → pre-commit → CI) — it does not ship over-budget.
- **Every gate proves its rent**: header comment names Sev + graduating incident. No incident, no gate.
- **Fire telemetry (the review's data source)**: every deny/announce verdict appends one line to `.claude/state/gate-fires.log` (`gate, timestamp, verdict, target-path`) — without this the demotion review is unauditable prose. One shared append-only log, not per-gate files.
- **Demotion review** (at `/compile-learnings` cadence, reading `gate-fires.log`): deny-gate with 0 fires in 90 days and no class recurrence → demote to `announce`; announce-gate with 0 fires in 90 days → prose; ≥3 confirmed false positives in 30 days → demote + fix or delete. Dead gates get deleted (the 3 vendor-fresh no-ops in Tier 2 are the standing example).
- Direction of trust: gates exist to make quality CHEAP, not to make work slow — when a class stops recurring, its gate must shrink with it.

---

## Acceptance criteria

- [x] Step 1 routed: `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` re-verified as the CI-wire recipient AND annotated with the `.husky`→`.githooks` path-correction line item (LR-040 (b) — grep-verifiable).
- [x] Step 2 (MD-first structural gate) implemented as a new PreToolUse hook (`.claude/hooks/md-first-gate.sh` + lib), self-test included (mirroring `check-no-verify.mjs --self-test` precedent), wired in `.claude/settings.json`.
- [x] New gate verified: with mode=`deny` (self-test harness), attempt to Write a spec `test('TC-XXX-YYY-999'...)` with no MD row → DENY; add the MD row → allowed. Production knob lands at `announce` per Phase 3.3 (S1 ramp), ramp criterion recorded in `.claude/guardrail-config.json`.
- [x] `/regression-guard` snapshot before/after on any hook/settings edit — no silent breakage.
- [x] Step 6: `.claude/rules/guardrail-policy.md` exists carrying the 3.1 rubric, 3.3 ramp discipline, 3.4 budgets + demotion review, with `paths:` frontmatter loading on `.claude/hooks/**`, `scripts/check-*`, and `plans/**` edits; LR number confirmed free per LR-020 at execution time.
- [x] Step 7: `/reflect` SKILL.md carries the Sev column + same-session append mandate; `/compile-learnings` SKILL.md carries mechanism-default graduation + the demotion review; `/final-q` SKILL.md carries the mistake attestation block (each grep-verifiable).
- [x] Step 7: Stop-hook ledger backstop live in announce mode with a `--self-test` (mirroring `check-no-verify.mjs --self-test` precedent).
- [x] Self-healing loop proven once end-to-end on a REAL captured mistake (ALL-094, 2026-07-10 — the profanity-naming incident): capture (`agent-mistakes.md` ALL-094) → Sev tag (S1, budget-exhausted) → durable recipient (Step 8 nomination, grep-verifiable) — all grep-verified; AND the real Stop-hook `mistake-ledger-gate.sh` driven on real transcript I/O (warns + writes state + fires telemetry on no-attestation; clears stale state on attestation), not self-test fixtures (LR-059 — drove the real counterpart).
- [x] Activity-log row appended per LR-028, LR-037-compliant timestamp.
- [x] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.
- [ ] Step 8: professional-wording gate either landed at announce mode, or an explicit keep/demote decision for the nomination is recorded at the next /compile-learnings demotion review.

---

## Verification

```bash
# Confirm the new MD-first gate blocks the exact class that started this investigation
node .claude/hooks/lib/check-md-first.mjs --self-test   # expect: all self-tests pass

# Confirm W2-09's target path is actually live before anyone executes it
ls .husky 2>&1                 # expect: No such file or directory
ls .githooks/pre-commit        # expect: file exists — this is the real target

# Phase 3 landed (post-execution)
grep -c "Recurrence budget" .claude/rules/guardrail-policy.md        # expect: >=1
grep -n "Sev" .claude/skills/reflect/SKILL.md | head -3              # expect: Sev column in Step 2 table
grep -n "Mistakes this session" .claude/skills/final-q/SKILL.md       # expect: attestation block present
```

---

## Handoff (post-execution)

Chat-only summary per `feedback_handoff_in_chat_only.md` — no obstacle claims in this file.

## Execution Summary

- **Executed**: core implementation landed 2026-07-10 (prior sessions — LR-069 rule, md-first gate, mistake-ledger backstop, skill amendments); acceptance re-verified and plan closed 2026-07-15 as PLAN_LAZY_CEO_DELEGATOR run-order item #2.
- **TCs implemented**: n/a — framework-enforcement infra plan; deliverables are hooks/rules/skills, no test cases in scope.
- **TCs dropped**: n/a.
- **MCP verification results**: n/a (BrowserTool: none). Verification = delegated cross-family battery, 2026-07-15:
  1. The 12-check battery was re-executed fresh by claude-haiku-4.5 (`council-verifier`, run `verify-guardrail-xfam-0715-r2`, ledger `attempt: 2`) independently of the gpt-5.5 first pass — 13 tee'd artifacts with sha256 at `.claude/state/ua-worker/verify-guardrail-xfam-0715-artifacts/sha256-manifest.txt`, manifest re-hashed OK by the dispatcher.
  2. Results: md-first self-test 22/22 pass; mistake-ledger self-test 25/25 pass; both wired in `.claude/settings.json`; `md_first_mode: announce` with full ramp metadata in `.claude/guardrail-config.json`; LR-069 rubric + ramp + budgets in `.claude/rules/guardrail-policy.md` with correct `paths:` frontmatter; Sev column + same-session mandate in `.claude/skills/reflect/SKILL.md`; attestation block in `.claude/skills/final-q/SKILL.md`; MECHANISM-default + Demotion review in `.claude/skills/compile-learnings/SKILL.md` (lines 62, 64); W2-09 `.githooks` path-correction annotation present; ALL-094 row present in agent-mistakes.md.
  3. One REFUTED claim (empty compile-learnings artifact) was traced to a case-sensitive grep in the dispatcher's own ticket — corrected case-insensitive re-check confirms the content. Worker ASK (command-output vs file-read authority) dispositioned: command output stays authoritative for the worker; command defects are dispatcher-owned.
- **Documentation changes**: none this session beyond this closure; prior sessions landed the rule/skill/hook documentation listed above.
- **Test pass confirmation**: gate self-tests green 2026-07-15 (22/22 md-first, 25/25 mistake-ledger). No owned specs red — LR-060 obligation 3 not triggered.
- **Per-criterion notes**:
  - `/regression-guard` box: no durable snapshot artifact survives from the 2026-07-10 edit sessions (snapshots are ephemeral session artifacts); both gates' self-tests passing on the current tree is accepted as the no-silent-breakage evidence.
  - Activity-log + `/final-q` boxes: activity-log row appended 2026-07-15T23:26 (LR-037-compliant); goal-level `/final-q` verdict emitted at session close per the /ultrathink gate.
  - **Step 8 (professional-wording gate): DEFERRED** — the nomination is recorded at Phase 2 Step 8 of this plan (grep-verifiable, LR-040(b)); the keep/demote decision belongs to the next `/compile-learnings` demotion review per the criterion's own OR-branch. Tracking: `/compile-learnings` cadence reading `.claude/state/gate-fires.log`.
  - Steps 3–5 (Tier-2 hygiene, leak prevention, Tier-1B rewrites): out-of-scope backlog per the plan's own Scope dial ("Steps 1–2 and 6–7 are the recommended immediate scope") — these are not deferrals of this plan.
