# SUBPLAN_NM1715_BI_03_OLDSITE_BASELINE — walk the old site in full and decide what "correct" means for every field

**Status**: PENDING
**Priority**: P0
**Created**: 2026-08-13
**Identity**: HUNTER
**Parent**: PLAN_NM1715_LOC_BASIC_INFO_COVERAGE.md
**Depends on**: SUBPLAN_NM1715_BI_02_FIELD_DENOMINATOR.md
**Blocks**: SUBPLAN_NM1715_BI_04 family (04a…04n — files authored after SP-02 sizing per the parent merge-down clause)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**CoverageMode**: quick
**CompactionBudget**: ~2

Binding (LR-046 strict line): deferred-to-DEEP is FORBIDDEN in this subplan and its artifacts — the quick tier governs cost elsewhere, never deferral here. Rutvik's order is FULL baseline.

---

## Context

LR-ENC-001 makes the old Navigator UI the baseline truth source: it decides any behavior uncertainty.
Rutvik's instruction for this plan was explicit — **FULL baseline, everything done properly, as per
the rules** — not a targeted spot-check.

The existing baseline artifacts for this sub-module are dated 2026-06-03 and 2026-06-11: 71 and 63
days old, both past the LR-013 staleness threshold. They are superseded here, not refreshed.

Access is already established — this subplan starts by walking, not by hunting for credentials.

---

## Access (established 2026-04-24, do not re-litigate)

From `_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (verdict: **GREEN**) and LR-ENC-001:

| Fact | Value |
|---|---|
| Baseline URL | `https://navigator2.training.psav.com/#/setup/locationdetail/1604` |
| New-site equivalent | `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` |
| Auth | **No manual login.** Live Chrome inherits the user's Microsoft SSO cookies. |
| Test entity | office 1604 |
| Prior artifact | the 2026-06-11 baseline recorded `Baseline_URL` as exactly this URL |

**Browser tool: `playwright-cli`, per Rutvik's direct instruction 2026-08-13 ("playwright-cli. only!!!").**
The 2026-04-24 access record happens to describe a live-Chrome session inheriting SSO, but that is a
record of how it was done once — **not** evidence that the CLI cannot do it. Per **LR-054**,
`playwright-cli` is not `npx playwright`, and its capabilities must be checked against Table 2 in
`.claude/rules/browser-tool.md` before any CLI limit is claimed. Drive the old site with the CLI's
persistent auth state. If a genuine capability gap appears, consult LR-054 Table 2 first, then raise
it with Rutvik with the specific command and error — do not silently fall back to Chrome.

Upside worth noting: CLI keeps this subplan **delegable**, which a Chrome-MCP walk would not have been.

**Two structural facts that break naive assumptions — internalise before walking:**

1. **Old site is ONE page with embedded tabs. New site is TWO pages at different URLs.** There is no
   1:1 path match, and the "corresponding page" frequently does not exist at the same path. Some
   new-site surfaces have **no** old-site equivalent at all (the access record documents ECT Settings
   and `/settings/local-office` as absent).
2. **Old site has zero `data-testid`** — its selectors are `name=` / `id=`.

**FLAG-01 (binding wording, from the access record):** the instruction is **visit + observe**. Never
"reuse selectors on old site". Never "navigate to the corresponding page on old site". Observe
behavior; record it.

---

## Bootstrap

**Identity**: HUNTER

**Skills auto-called**: `/identity`, `/relevant`, `/regression-guard` (wrap), `/final-q` (exit, LR-042)

**Context files**:
- `plans/pending/PLAN_NM1715_LOC_BASIC_INFO_COVERAGE.md` (parent)
- `plans/pending/SUBPLAN_NM1715_BI_02_FIELD_DENOMINATOR.md` (predecessor — supplies the denominator)
- `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md`
- `clients/encore/specs_planning/_internal/requirements-nm1715-basic-information-2026-08-13.md` (SP-1 output)
- `.claude/rules/baseline.md` (LR-034 / LR-045 baseline artifacts)
- `.claude/rules/browser-tool.md` (LR-038 v2, LR-054)
- `.claude/rules/inventory.md` (LR-013 staleness, LR-062)
- `clients/encore/CLAUDE.md` (LR-ENC-001, LR-ENC-005)

**Anti-Assumption Gates**:
- [ ] Gate 1 — this **is** the baseline walk; it must EXECUTE, not merely exist.
- [ ] Gate 2 — no "regression / corrupt / app-wide" claim on <2 evidence sources (LR-061).
- [ ] Gate 4 — env defers only the env-blocked step.
- [ ] Gate 6 — all phases complete or a user-signed `## Deferral Authorization`.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `SUBPLAN_NM1715_BI_02_FIELD_DENOMINATOR.md` is in `plans/done/` and read its field count.
2. Read `.claude/context/navigation.md` Exploration Registry.
3. Read `agent-mistakes.md`, filtered to `REQ-*` / `ALL-*`.
4. Read `.claude/context/patterns.md` — "corrupt/atypical" tree especially.
5. LR scan — LR-013, LR-034, LR-045, LR-061, LR-ENC-001, LR-ENC-005.
6. **Browser-tool announcement**: `BrowserTool=cli` — `playwright-cli` per Rutvik's standing
   instruction. Consult LR-054 Table 2 before claiming any CLI limit.

---

## Phase 0.5b — Baseline-first walk (THIS SUBPLAN — NON-DELETABLE)

1. Open the baseline URL with playwright-cli using its persistent auth state. Confirm SSO is inherited; no manual login expected. If the CLI profile lacks the SSO cookie, consult LR-054 Table 2 in .claude/rules/browser-tool.md, then raise it with Rutvik with the exact command and error — never fall back to a browser session.
2. Locate the Basic Information surface within the old site's single-page tab structure. It will not
   sit at a matching path — navigate by tab, not by URL.
3. Walk it in full. For every field in SP-2's denominator, observe and record: presence, label,
   control type, default value, validation behavior, enabled/disabled state, and any dependency on
   another field. Selectors are `name=`/`id=` — record them as observation aids only, never for reuse.
4. Emit `clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-<YYYY-MM-DD>.md`,
   superseding the 2026-06-03 and 2026-06-11 artifacts.

---

## Phase 1 — Classify every divergence

For **every** field in SP-2's denominator, assign exactly one:

- **(a) regression-from-baseline** — old site does it, new site does not, and nothing authorises the
  change. Candidate bug; must satisfy Gate 2 (≥2 evidence sources) before being called a regression.
- **(b) intentional UX change** — cite the Jira key from SP-1's harvest or the row in
  `clients/encore/docs/REQUIREMENTS.md`. An uncited (b) is not a disposition.
- **(c) baseline-absent** — the field is net-new on the current site with no old-site counterpart.
  Record `baselineScope: baseline-absent` per LR-ENC-001. **This is NOT a HALT** — the access record
  already establishes that whole surfaces exist on the new site and not the old one.

Produce a `## Baseline diff` section. Zero fields may be left unclassified.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Per adjacent fix: **DO-NOW**, **SPAWN**, or **APPEND** with `grep -F` verification. Bare "out of
scope" = HALT + ask (LR-040 / LR-046).

---

## Per-Identity Satisfaction

Dated cells are refreshed to the actual emission date at closure (C6).

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site baseline artifact | `clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-08-13.md` | `ls clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-08-13.md` exits 0 |
| GIVER | (none) | `(none)` | — |
| BUILDER | (none) | `(none)` | — |
| WATCHDOG | (none) | `(none)` | — |
| HEALER | (none) | `(none)` | — |
| GARDENER | (none) | `(none)` | — |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Dated baseline artifact exists, superseding the 2026-06-03 / 2026-06-11 pair.
- [ ] `## Baseline diff` dispositions **every** field in SP-2's denominator into (a) / (b) / (c) — zero unclassified.
- [ ] Every (b) cites a Jira key or a `docs/REQUIREMENTS.md` row.
- [ ] Every (a) satisfies Gate 2 (≥2 evidence sources) before the word "regression" is used.
- [ ] Every (c) carries `baselineScope: baseline-absent`.
- [ ] No selector from the old site is reused anywhere (FLAG-01) — observation only.
- [ ] The emitted baseline artifact contains zero deferred-to-DEEP tokens.
- [ ] `/regression-guard` before/after — no silent breakage.
- [ ] Activity-log row per LR-028, timestamp ≥ all touched-file mtimes (LR-037).
- [ ] `/final-q` verdict per LR-042.

---

## Verification

```bash
# Fresh baseline artifact exists and is today's
ls -t clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-*.md | head -1

# Every disposition class is actually used / accounted for
grep -cE "regression-from-baseline|intentional UX change|baseline-absent" $(ls -t clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-*.md | head -1)

# The old URL is recorded, so the next session does not have to hunt for it again
grep -n "navigator2.training.psav.com" $(ls -t clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-*.md | head -1)
```

---

## Handoff (post-execution)

Basic Information gains a current statement of intended behavior, field by field, replacing artifacts
that were more than two months old. Every field now carries a disposition explaining whether today's
behavior is inherited, deliberately changed with a cited authority, or genuinely new.
`SUBPLAN_NM1715_BI_04_BEHAVIOR_WALK.md` inherits that classification so its per-field probing starts
from what the field is meant to do rather than from what it happens to do.
