---
description: Baseline-truth workflow for multi-client TC pipelines (LR-045)
paths:
  - "clients/*/specs_planning/**/*.md"
  - "clients/*/docs/REQUIREMENTS.md"
  - "clients/*/specs_planning/_internal/old-site-baseline/**/*.md"
  - "clients/*/reports/bugs/**/*.json"
---

# Baseline-Truth Workflow (LR-045)

Path-scoped rule pack — loads when authoring or modifying client specs_planning artifacts, REQUIREMENTS.md, or old-site-baseline notes.

Any multi-client TC-authoring pipeline MUST declare a baseline truth source per client. **Baseline truth source** = a stable/legacy site (or authoritative spec artifact) that represents **intended behavior**. The client's active app = **observed behavior**. Divergence = signal (classify as bug candidate per LR-034, requirement gap per REQ-014, or intentional UX change).

## Truth hierarchy (per ALL-024, amended 2026-04-24)

old-site DOM > live new-site MCP DOM > error-context.md > screenshots > failure-summary.json > REQUIREMENTS.md > test plans > test cases > Jira. Old-site DOM overrides new-site DOM where both exist.

## Workflow shape (applies to every Requirements → Planner → Generator loop AND every audit / find-bugs subplan that drives TC corrections)

1. **Requirements (HUNTER)**: Phase 1a — visit baseline first, emit `clients/${ACTIVE_CLIENT}/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`; Phase 1b — visit new site, compare row-by-row, classify every divergence (per REQ-014).
2. **Planner (GIVER)**: reference baseline artifact via `Baseline_Artifact` frontmatter key in the field-inventory artifact (per PLN-049). If a same-module baseline is expected but absent → HALT at Planner→Generator handoff.
3. **Generator (BUILDER)**: spot-check baseline reference (per SP-AAE-04, when landed); assert against new-site behavior, with baseline as the "intended" oracle for ambiguous cases.
4. **Audit / Neutral-eye / `/find-bugs` (WATCHDOG)**: before authoring or revising any TC correction, visit baseline first (or consume a same-module baseline artifact ≤14 days old per LR-013 spot-check); emit/refresh `old-site-baseline/<module>-<YYYY-MM-DD>.md` if missing/stale; produce a `## Baseline diff` section in the findings doc that classifies every observed-vs-baseline divergence as (a) regression-from-baseline, (b) intentional UX change (REQUIREMENTS.md / Jira justification), or (c) baseline-absent (net-new on e2e — record `baselineScope: baseline-absent` per LR-ENC-001, NOT a HALT). Bug filings carry `baselineComparison` per LR-034.
5. **`/encore-questions` (escalation path)**: feature absent on baseline → flag for client-side QA, do NOT HALT (ALL-078).

## Per-client URL + creds

Live in the client-specific rule. For Encore, see LR-ENC-001 in `clients/encore/CLAUDE.md`. Other clients get their own `LR-{CLIENT}-001` rule naming their baseline URL/creds/artifact directory.

## Observation-only default

Baseline sites are READ-ONLY observation sources. Selectors on baseline may not match the new site (for Encore, zero selector parity — baseline uses `name=`/`id=`, new site uses `data-testid`). Specs still run against the new site. Baseline artifacts are FREE-FORM observations, not a strict field-inventory schema (the existing `field-inventory-spec.md` is a starting point but baseline artifacts may deviate — see `OSB-ACCESS-VERIFY-2026-04-24.md`, 6 sections).

**Trigger**: every new multi-client framework / every Requirements / Planner / Generator / `/encore-questions` / TC-generation subplan session AND every WATCHDOG neutral-eye audit / `/find-bugs` / module-audit subplan whose output drives TC corrections (e.g. `clients/*/specs_planning/_internal/neutral-eye-audits/**/*.md` authoring sessions, SP-DQU-12..20 module audits, any future per-module audit subplan). Enforced structurally by ALL-078 (HALT gate) + REQ-014 + PLN-049 + neutral-eye audit `_TEMPLATE.md` mandatory `## Baseline diff` section.
**Graduated from**: PLAN_OLD_SITE_TRUTH_BASELINE (2026-04-24); workflow row 4 (audit/neutral-eye) added 2026-04-29 after DQU pipeline gap analysis surfaced 10-of-11 modules bypassing baseline-first (SP-DQU-02 LOS audit pre-dated LR-ENC-001; SP-DQU-12..20 left baseline as optional `Baseline_Artifact` key).
