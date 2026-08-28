# SUBPLAN_GUARDRAIL_CX_GATE_DEFECTS — three closure-gate (Cx) defects that block legitimate DONE flips

**Status**: PENDING
**Priority**: P1
**Created**: 2026-08-28
**Identity**: OWNER
**Parent**: none
**Depends on**: none
**Blocks**: the DONE flip of `plans/pending/PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md` (execution complete, flip held by owner ruling 2026-08-28 — see its D-25)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none *(unless the owner chooses the enumerate-nav2 route in Defect 2 — that phase would re-declare `cli` and needs its own owner authorization for old-site machine enumeration)*
**Justification**: n/a (no forbidden model/thinking combo)

---

## Context

Closing NM-3530 on 2026-08-28 ran `scripts/validate-plan-closure.mjs` against a plan whose work is
machine-verified complete (69/69 green inside the 1,143-test regression; inventories 100%
dispositioned). After the artifact-side fixes landed (C3 citation paths, Cr glob wording, ten
elided manifest keys re-bound verbatim, two split-module registrations in
`scripts/walk-coverage/lib/module-config.mjs`), Cx still FAILS on three reasons that are
**gate-side, not work-side**. The owner ruled (2026-08-28, in chat): waive the three checks by
name with dated notes; leave `coverage_mode=deny` alone; if per-check waiving is unsupported,
stop. Investigation confirmed per-check waiving is NOT supported by the existing machinery, so the
flip stopped and this plan carries the fixes. **Graduating incident (LR-069)**: this closure
attempt, plus the retroactive discovery that the only DONE precedent of the class —
`plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md` (flipped 2026-08-15, commit `7256648`)
— fails today's validator on the same parity reasons. Severity: **S1** per §3.1 (a gate producing
false positives silently blocks legitimate closure and invites mode-demotion pressure — quality
drift at the gate layer).

## Bootstrap

**Identity**: OWNER (framework tooling). **Skills**: `/identity`, `/relevant`,
`/regression-guard`, `/audit`, `/reflect`, `/final-q`.
**Context files**: `.claude/rules/guardrail-policy.md` (LR-069 §3.3 ramp / §3.5 prior-fix trial),
`.claude/rules/inventory.md` (LR-062/LR-064/LR-072), `.claude/rules/plan-closure.md` (LR-055),
`scripts/validate-plan-closure.mjs`, `scripts/walk-coverage/verify-denominator.mjs`,
`scripts/walk-coverage/lib/case-parity.mjs`, `scripts/walk-coverage/lib/coverage-manifest.mjs`,
`plans/pending/PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md` (D-25 records the incident).

## Phase 0 — Gate

1. Re-run `node scripts/validate-plan-closure.mjs plans/pending/PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md --dry-run`
   and confirm the failure set is still exactly the three reasons below (anything new = re-scope first).
2. Re-run it against `plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md` and record the
   parity failure as the false-positive baseline the fix must clear.
3. LR-069 §3.5 prior-fix trial for each defect: what did the check intend, why does it fire on
   legitimate work (`scoped-wrong` / `prose-not-mechanism` / `dead/never-fired`), what will the fix
   do differently. The 2026-08-18 commits (`2156daf`, `f4d08d5` — "stop skipping artifacts")
   likely exposed checks that had silently never executed on real artifacts; verify that timeline.

## Phase 1 — the three defects

### Defect 1 — parity engine fires unconditionally; its exemption channel is dead code

`scripts/walk-coverage/lib/case-parity.mjs` `reconcile(pathA, pathB, opts)` supports named
per-archetype exemptions, but the ONLY call site
(`scripts/walk-coverage/verify-denominator.mjs:445`) invokes `reconcile(pathA, computePathB(rows))`
with no `opts` — `exemptions.length === 0` makes every A≠B a hard FAIL. Path B is
empty-by-construction (B=0) for artifacts authored outside the FCC case-row emitter (all QUICK-tier
modules; DSM: "0/29040 rows matched, scope: field_key fallback"), and even emitter-linked
service-charge fails (A=4002 B=3741, 29/29 controls unresolved — "parity confirms equal widened
estimates, not resolved coverage" by its own log line). **Fix direction**: wire a human-approved
exemption source (extend `.claude/walk-exemptions.json` with a `parity_exemptions` list —
`{archetype, artifact, reason, approved_by, date}`) into the call site, AND/OR scope the zero-tolerance
check to artifacts whose rows carry `source_artifact` linkage with resolved controls, so the check
measures what the emitter actually produced rather than failing widened estimates. **Acceptance**:
NM-3344 dry-run parity-clean with zero exemption entries OR with owner-signed entries the report
names; a deliberately drifted fixture still FAILS; `--self-test` (if present) green.

### Defect 2 — old-site-baseline artifacts have no lawful satisfaction path

`coverage-manifest.mjs` (manifest-absent branch, ~line 548) unconditionally FAILS any walk artifact
dated ≥ 2026-07-22 with no coverage manifest. An old-site baseline produced under a bounded,
owner-authorized observation walk (NM-3530 Phase 0.3: one non-mutating tab click per tab, no
enumerator) can never satisfy it, and machine-enumerating the baseline site exceeds that
authorization (the enumerator self-expands openers). **Fix direction — owner decision recorded
here, implemented in this plan**: either (a) an explicit `baselineScope`-aware carve-out — an
old-site-baseline artifact whose frontmatter declares an observation-only walk with an owner
authorization pointer passes with an INFO line instead of FAIL; or (b) the owner authorizes old-site
machine enumeration as standard baseline practice and the DSM baseline gets its nav2 manifest
(BrowserTool: cli, own session). **Acceptance**: the DSM baseline artifact passes by whichever
route; a post-mandate NEW-site artifact with no manifest still FAILS.

### Defect 3 — the 15% out-of-scope cap has no owner-exemption hook

`coverage-manifest.mjs` Item 3 (~line 654) caps in-module out-of-scope rows at 15% with exactly one
escape: evidence-based `outside-module` shell exclusion (control present in ANOTHER module's
inventory). A whole sibling-owned tab (Company Matrix, NM-3343) has no inventory anywhere, so its
6 rows can never leave the denominator, and the owner's signed route-(b) exemption (NM-3530 Phase
0.05, chat, 2026-08-26) is invisible to the machine. **Fix direction**: a file-based, owner-signed
cap exemption (`.claude/walk-exemptions.json` `oos_cap_exemptions`:
`{artifact, plan, reason, approved_by, date}`) consumed by Item 3 — the cap math is untouched for
everything unsigned; the exemption's presence and text are echoed in the verdict so nothing is
silent. **Acceptance**: criteria artifact (7/17) passes ONLY with the signed entry present; removing
the entry restores the FAIL; an agent-authored entry without `approved_by` is refused.

## Phase 2 — verification

```bash
node scripts/validate-plan-closure.mjs plans/pending/PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md --dry-run
```

```bash
node scripts/validate-plan-closure.mjs plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md --dry-run
```

Both must end with the three named reasons gone (NM-3530: PASS; NM-3344: parity-clean), with
negative fixtures proving each check still bites on genuine drift.

## Acceptance criteria

- [ ] Prior-fix trial recorded per defect (LR-069 §3.5) — verdicts named, no layering over unconvicted checks.
- [ ] Defect 1: exemption channel wired or scope corrected; NM-3344 parity-clean; drift fixture still fails.
- [ ] Defect 2: owner-chosen route implemented; DSM baseline passes; manifest mandate still bites on new-site artifacts.
- [ ] Defect 3: signed cap exemption consumed; unsigned refused; criteria artifact passes only with the owner's entry.
- [ ] `coverage_mode` stays `deny` throughout — no mode demotion (owner ruling 2026-08-28).
- [ ] NM-3530's DONE flip completes under the fixed gate, and its D-log gains the completion row.
- [ ] LR-028 activity-log row; `/final-q` verdict block.

## Handoff

Chat-only. On completion: re-run the NM-3530 closure (its Execution Summary, ticked criteria and
Per-Identity matrix are already in the plan file — only the Status flip + `git mv` + reindex remain).
