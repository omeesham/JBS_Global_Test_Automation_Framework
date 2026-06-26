# SUBPLAN_CORP_PRICING_SHADOW_FRAMEWORK_CLOSURE — Do-or-die audit + negative-test the new guards, then ramp announce→deny (shadow tier — runs last)

> **Shadow re-home (2026-06-24, PLAN_CORP_PRICING_JIRA_DELIVERY):** renamed from `SUBPLAN_CORP_PRICING_REMEDIATION_CLOSURE.md`. Re-pointed to the Jira-delivery parent as the **final shadow-tier node** — runs LAST, after all 8 ticket deliverables + SHADOW_INTEGRATION + SHADOW_EDGE. Its job (negative-test the prevention guards + ramp closure gates announce→deny) is internal framework hardening, not a client deliverable. Content/depth unchanged. `Depends on` collapses to `SUBPLAN_CORP_PRICING_SHADOW_EDGE.md` (which transitively requires the whole chain).

**Status**: PENDING
**Priority**: P0
**Created**: 2026-06-19
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_JIRA_DELIVERY.md
**Depends on**: SUBPLAN_CORP_PRICING_SHADOW_EDGE.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: do-or-die closure audit + guard negative-tests + multi-rule verdict (Opus max per LR-041).

> Identity = OWNER as a multi-identity span (WATCHDOG audit + OWNER config-ramp); OWNER short-circuits §2 per LR-043 so the same subplan can both audit (WATCHDOG) and ramp `closure-config.json` (OWNER). AUD-017: this audit runs fresh-context and never self-grades work authored in the same session.

---

## Context

Terminal node of the remediation. Confirms every ledger row is dispositioned and the full Corporate Pricing suite is green ×2, then does the thing that makes the prevention real: **negative-tests each new guard against its original miss** (prove they would now catch it), and only then ramps the announce-mode gates to **deny**. Mirrors the Wave-1.5 do-or-die closure.

---

## Bootstrap

**Identity**: OWNER (multi-identity: WATCHDOG audit + OWNER config-ramp)

**Skills auto-called**:
- `/identity` (gate) · `/audit` (review + slop + FCC-completeness) · `/find-bugs` (adversarial closure probe) · `/regression-guard` (wrap) · `/relevant` (Phase 0.5) · `/final-q` (exit)

**Context files**:
- `PLAN_CORP_PRICING_JIRA_DELIVERY.md` (parent — acceptance criteria + conservation contract) + `corp-pricing-drift-ledger-2026-06-19.md`
- `.claude/rules/plan-closure.md` (LR-055 C1–C6 + ramp knobs) ; `.claude/rules/pipeline.md` (LR-027/040/046/060)
- `.claude/rules/inventory.md` (LR-062 Cx) ; `.claude/rules/specs.md` (LR-061)
- `.claude/closure-config.json` ; `scripts/validate-plan-closure.mjs`
- `clients/encore/specs_planning/_internal/agent-mistakes.md` (AUD-017 self-grade ban)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md`

**Anti-Assumption Gates**:
- [ ] Phase 0.5b baseline walk EXECUTED (WATCHDOG identity → REQUIRED); `baselineScope: baseline-absent` consumed from Subplan A.
- [ ] N≥2 before any "regression/app-wide" verdict (Gate 2).
- [ ] Verify-before-blocked + positive control on any re-checked control (Gate 3).
- [ ] No env-rationalized deferral of the audit (Gate 4).
- [ ] No silent checkpoint (Gate 6).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)
1. Confirm the full Jira-delivery chain is DONE: all 8 NM ticket deliverables + SHADOW_INTEGRATION + SHADOW_EDGE (the parent's child list). HALT if any pending.
2. `npm run check:tc-parity` BEFORE any mode work (ALL-071 pre-check) — non-zero exit = CRITICAL P0.
3. navigation.md + agent-mistakes.md (AUD-017) + patterns.md. 4. LR scan: LR-027, LR-040, LR-055, LR-060, LR-061, LR-062. 5. `BrowserTool=none` (artifact audit).

## Phase 0.5b — Baseline-first walk
Consumes `corporate-pricing-rewalk-2026-06-19.md` (baseline-absent attest). No new baseline; the audit reads artifacts.

## Phase 1 — Do-or-die multi-dimension audit
1. Every drift-ledger row dispositioned (STILL-GREEN re-verified / fixed / named-and-deferred to a PENDING subplan — never a task chip).
2. Full `corporate-pricing` suite green ×2 (`--workers=1` + full suite); `check:tc-parity` / `xlsx:lint` / `typecheck` exit 0.
3. No `(skipped)` Per-Identity cells across the child subplans without a ≥20-char reason (C6).
4. Fresh-context adversarial review of each remediation claim (AUD-017 — no self-grade).

## Phase 2 — NEGATIVE-TEST the prevention guards (the point of the whole plan)
Prove each new guard now catches its original miss:
1. **M1 positive-control (LR-061):** a `.dragTo()`-only "no-op" conclusion is rejected by the rule/agent embed; the audit confirms the Detail verdict carries positive-control evidence.
2. **M2 enumerator (LR-062 Cx):** removing a TC for override Grid Options makes the Coverage Manifest flag it undispositioned (Cx < 100%).
   - **M2-enumerator cold-start hardening (from Subplan A re-walk 2026-06-23):** the FIRST authenticated load of any CPR page in a cold Playwright session renders blank (`next-auth CLIENT_FETCH_ERROR` on `/api/auth/session` at first paint; no login redirect, so the abort never fires) → `enumerate-page.mjs` captured `denominator=1` on the first Search run; a re-run recovered (Search=79). Harden `scripts/walk-coverage/enumerate-page.mjs` to reload-retry when the post-`waitReady` denominator is ≤1 (or the body has no app-mount), so a cold-start blank cannot yield a bogus tiny denominator. Negative-test: a forced first-paint-blank run must NOT emit denominator=1 (it retries to the real number).
3. **M3 no-red-close:** feed the old close-with-red scenario (a plan owning red tests, deferring to a task chip) to `validate-plan-closure.mjs` → expect DENY (no PENDING-recipient + named TC IDs).
4. **M4 empty-surface (LR-040(c)):** an empty-state-only Labor close without a recorded population path is rejected.
5. **M5 surface-family disposition (LR-065 → LR-062 Cx):** a grid archetype with NO `behavior-cases:` disposition (neither covered families nor an `out-of-scope:<family>` token) makes the Coverage Manifest flag the surface undispositioned (Cx < 100%) → closure DENY. Prove the gate catches a stripped `behavior-cases:` disposition BEFORE ramping `coverage_mode` to deny — this is the gate that ENFORCES the new per-ticket SBC/SBC-MAX surface families across all 8 deliverables + the SHADOW_EDGE residue.
6. **META parity:** the LR-embed parity check exits 0 (all owning identities carry their embeds).

## Phase 3 — Ramp announce→deny (OWNER)
Only after Phase 2 passes: flip `coverage_mode` / `test_status_mode` (and the `c6`/Cx knobs as applicable) announce→deny in `.claude/closure-config.json`; record the ramp + negative-test evidence. The `coverage_mode`→deny ramp is what makes the LR-065 surface-family `behavior-cases:` disposition (the new per-ticket SBC/SBC-MAX axis) closure-enforced module-wide — proven catchable by M5 above.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)
Any residual finding → DO-NOW / SPAWN / APPEND grep-verified line. Bare "out of scope" = HALT.

## Per-Identity Satisfaction
| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | closure audit findings + guard negative-test report | `clients/encore/specs_planning/_internal/corp-pricing-remediation-closure-audit-2026-06-19.md` | audit verdict GREEN; full suite green ×2 |
| GARDENER | (none) | (none) | (none) |
| OWNER | gate ramp | `.claude/closure-config.json` | `grep -E "coverage_mode|test_status_mode" .claude/closure-config.json` = `deny` (post-Phase-2) |

## Acceptance criteria (LR-040 closure gate)
- [ ] Every ledger row dispositioned; full `corporate-pricing` suite green ×2; parity/lint/typecheck exit 0.
- [ ] All 5 prevention guards (M1–M5) negative-tested to DENY/flag their original miss — including M5 surface-family Cx (LR-065); META parity check exits 0.
- [ ] Gates ramped announce→deny with recorded negative-test evidence.
- [ ] No `(skipped)` matrix cells without ≥20-char reason across the child subplans.
- [ ] Parent `PLAN_CORP_PRICING_JIRA_DELIVERY.md` closed per LR-027 (Execution Summary cites the child chain + conservation-audit result; parent-cascade annotations done).
- [ ] `/regression-guard` clean; activity-log row (LR-028); `/final-q` verdict.

## Verification
```bash
npx playwright test corporate-pricing --workers=1   # expect: 0 failed/flaky/skipped, ×2
node scripts/validate-plan-closure.mjs --enforce --plan plans/pending/PLAN_CORP_PRICING_JIRA_DELIVERY.md  # expect: PASS
grep -E "coverage_mode|test_status_mode" .claude/closure-config.json  # expect: deny (post-Phase-3)
```

## Handoff
Closes the remediation: suite green ×2, ledger fully dispositioned, the four prevention guards proven to catch their original misses and ramped to deny, and the parent master closed. Corporate Pricing is now a trustworthy module where every "done" is provably done and the miss-class is structurally prevented.
