# SUBPLAN_GUARDRAIL_CX_GATE_DEFECTS — three closure-gate (Cx) defects that block legitimate DONE flips

**Status**: DONE
**Executed**: 2026-08-28
**Priority**: P1
**Created**: 2026-08-28
**Identity**: OWNER
**Parent**: none
**Depends on**: none
**Blocks**: the DONE flip of `plans/done/PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md` (execution complete, flip held by owner ruling 2026-08-28 — see its D-25; UNBLOCKED same day by this plan's execution, flip completed — see its D-26)
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
`plans/done/PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md` (D-25 records the incident).

## Phase 0 — Gate

1. Re-run `node scripts/validate-plan-closure.mjs plans/done/PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md --dry-run`
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
node scripts/validate-plan-closure.mjs plans/done/PLAN_NM3530_DISCOUNT_MATRIX_COVERAGE_QUICK.md --dry-run
```

```bash
node scripts/validate-plan-closure.mjs plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md --dry-run
```

Both must end with the three named reasons gone (NM-3530: PASS; NM-3344: parity-clean), with
negative fixtures proving each check still bites on genuine drift.

## Acceptance criteria

- [x] Prior-fix trial recorded per defect (LR-069 §3.5) — verdicts named, no layering over unconvicted checks. *(Trials in the Execution Summary; Defect 1's trial EXONERATED the check — see D-1.)*
- [x] Defect 1: exemption channel wired or scope corrected; NM-3344 parity-clean; drift fixture still fails. *(Amended per D-1: the engine was exonerated — parity restored by re-emitting five artifacts under today's taxonomy with ZERO engine changes (A==B exactly everywhere); NM-3344 full [PASS]; drift detection proven live by the pre-refresh failures themselves (A=4002≠B=3741 failed twice on 2026-08-28 before the refresh) plus the untouched missingTemplates guard. The unwired `opts.exemptions` param stays as-is deliberately — no surgery on an exonerated check to satisfy a wrong premise.)*
- [x] Defect 2: owner-chosen route implemented; DSM baseline passes; manifest mandate still bites on new-site artifacts. *(Route (a): observation-only carve-out — old-site-baseline path + `Observation_Only: true` + `Walk_Authorization` ≥20 chars; DSM baseline passes citing the real 2026-08-25 grant; fixtures G2/G3/G4 prove the mandate still bites on old-site-without-keys, new-site-with-keys, and short authorizations.)*
- [x] Defect 3: signed cap exemption consumed; unsigned refused; criteria artifact passes only with the owner's entry. *(`oos_cap_exemptions` consumed via an opts-injectable seam mirroring `crossModuleControls`; the owner-signed 2026-08-26 route-(b) entry transcribed; fixtures G5/G6/G7 — absent fails, signed waives with a loud `warnings` echo, unsigned refused.)*
- [x] `coverage_mode` stays `deny` throughout — no mode demotion (owner ruling 2026-08-28). *(closure-config untouched — verified by the session diff.)*
- [x] NM-3530's DONE flip completes under the fixed gate, and its D-log gains the completion row. *(Flipped 2026-08-28 under `deny`, validator PASS; recorded as NM-3530 D-26.)*
- [x] LR-028 activity-log row; `/final-q` verdict block. *(Row appended with preflight green; verdict block emitted at session end, 2026-08-28.)*

## Handoff

Chat-only. On completion: re-run the NM-3530 closure (its Execution Summary, ticked criteria and
Per-Identity matrix are already in the plan file — only the Status flip + `git mv` + reindex remain).

---

## Plan-Deviations log

| # | Deviation | Resolution |
|---|---|---|
| D-1 | Defect 1's authored diagnosis ("dead exemption channel; Path B empty by construction; engine over-reach") was WRONG about the mechanism | Phase-1 research re-derived it before any code landed: the case-row emitter deliberately shares the widened-union definition with Path A (emit-case-rows.mjs header; case-parity.mjs contract comment), so parity is sound — the true cause was a STALE `reports/walk-coverage/case-rows.json` (emitted under an older taxonomy; the three re-enumerated DSM records had never emitted at all). The fix became a data refresh — five `--merge` re-emissions — with ZERO engine changes; the check is EXONERATED and its planned surgery cancelled. Captured as CEO-M14 + memory `feedback_stale_registry_convicts_the_wrong_suspect.md`. The unwired `opts.exemptions` param remains untouched (working check, no conviction); the staleness-guard residual is a grep-verifiable line in `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md` |
| D-2 | Waiving the cap un-masked a fourth failure the plan had not predicted: the criteria inventory's own elided manifest keys + unregistered module | The cap failure had short-circuited the denominator checks (they run only when coverage is otherwise complete), hiding the same key-drift class fixed on RWP/LOA the previous session. Fixed identically: 4 keys re-bound verbatim, `discount-matrix-criteria` registered resting-only with an honest evidence citation that explicitly does NOT claim zero openers (the frontier records three) |

---

### Execution Summary

**Executed**: 2026-08-28, one session, identity OWNER (plan-declared; §2-clean — tooling + config + owner-transcribed data).

**Prior-fix trials (LR-069 §3.5)**:
1. **Parity check — EXONERATED**, not convicted: the failure was a stale shared input (D-1). No layering, no surgery, check untouched.
2. **Manifest mandate — SURVIVES** for its class (`different-sub-class`): observation-only old-site baselines were never its contemplated class; a deliberately narrow carve-out added (path + two frontmatter keys + ≥20-char authorization), the mandate untouched everywhere else.
3. **15% cap — SURVIVES**; the owner's prose exemption CONVICTED as `prose-not-mechanism` and converted to a machine-readable signed entry in the same change; unsigned entries refused.

Timeline verified: NM-3344 flipped DONE 2026-08-15 (commit `7256648`); the validator's artifact-reading fixes landed 2026-08-17/18 (`1bbcd59`, `2156daf`, `f4d08d5`) — the checks began reading artifacts they had previously skipped, which is why the precedent failed retroactively today and passed then.

**Changes**:
- `scripts/walk-coverage/lib/coverage-manifest.mjs` — observation-only old-site carve-out; `loadOosCapExemptions` / `findOosCapExemption` + cap waiver with a loud `warnings` echo (both opts-injectable for tests; LR-069 rent comments name the Sev + incident).
- `scripts/walk-coverage/lib/test-coverage-manifest.mjs` — 7 fixtures G1–G7, every carve-out with a refusing twin; suite 42/42.
- `scripts/walk-coverage/lib/module-config.mjs` — the three DSM split-module registrations completed (`discount-matrix-criteria` resting-only with an honest evidence citation; RWP/LOA registered the previous session).
- `.claude/walk-exemptions.json` — `oos_cap_exemptions` carrying the owner-signed 2026-08-26 route-(b) exemption (quote of record: "exemption approved"; transcribed 2026-08-28).
- `clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-2026-08-25.md` — `Observation_Only` + `Walk_Authorization` keys citing the real Phase 0.3 grant.
- `clients/encore/specs_planning/_internal/field-inventories/discount-matrix-criteria-2026-08-25.md` — 4 elided manifest keys re-bound verbatim (D-2).
- Data (local-only per the walk-evidence policy): `reports/walk-coverage/case-rows.json` re-emitted for five artifacts — dsm-crt 2346, dsm-rwp 2629, dsm-loa 2760, svc-basic-info 4002, svc-history 4140 — every count equal to Path A exactly.

**Verification**: `node scripts/validate-plan-closure.mjs <plan> --dry-run` → **NM-3530 [PASS]** and **NM-3344 [PASS]**; `node scripts/walk-coverage/lib/test-coverage-manifest.mjs` → **42 passed, 0 failed**; negative proofs live-fired (pre-refresh parity failures) and fixture-fired (G2/G3/G4 mandate, G5/G7 cap). `coverage_mode` stayed `deny` throughout.

**Residual, named**: `case-rows.json` is local-only — a fresh clone must re-emit per artifact before closure validation; the staleness class (dop-tab1 refresh, orphan purge, taxonomy-fingerprint guard) is inherited by `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` § Inherited registry-hygiene item (grep-verified).
