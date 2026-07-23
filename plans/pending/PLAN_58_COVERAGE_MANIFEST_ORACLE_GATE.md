# PLAN 58 — Coverage Manifest Oracle Gate: making unverified claims structurally visible

**Status**: Pending
**Created**: 2026-07-22
**Priority**: Medium
**Model**: opus
**Thinking**: hi
**PermissionMode**: default

---

## 1. Problem Statement

Four artifacts that were treated as authoritative turned out to contain unverified claims, and each one sent workers in the wrong direction for hours:

1. **SELECTOR-MAP.md** listed a "Close" button on the location picker that **does not exist** — its own verification line read *"used implicitly"*. The real control is "Cancel".
2. **ORACLE-FACTS.md** stated office 1134 was the **only** office with Labor rows; office 9460 has 212. That single line produced **6 false CHEAT verdicts** in an audit.
3. A page-object helper measured "can the user escape a rejected cell?" by waiting for the editor to **detach** — which never happens on this app, so it silently reported a focus trap for weeks.
4. A row-count locator was page-wide and counted rows from a **second table**, including its "No results." empty-state row.

**Common shape: a claim recorded without the observation that would justify it, then trusted downstream.**

## 2. Evidence

All four cases share one structural deficiency: the artifact (selector map, oracle fact file, page-object helper, locator) had no field distinguishing "I observed this live" from "I inferred this from code / copied this from another source / guessed." Downstream consumers — workers, auditors, the orchestrator — treated every entry as equally verified because nothing in the format said otherwise.

- SELECTOR-MAP.md Control #1: `Verification: Used implicitly` — self-documenting that it was NOT verified, but placed in a file titled as the live-verified authority.
- ORACLE-FACTS.md Labor office claim: no provenance tag, no walk date, no DOM screenshot — just a prose assertion.
- `probeEditOracle` helper: measured detachment (a DOM implementation detail) instead of the user-observable outcome (can Tab/Escape move focus?). No specification of what "escapable" means in testable terms.
- Row-count locator: `tbody tr` used without scoping to the target table. No verification that the count matches the visible grid.

## 3. Proposed Direction

A gate that makes an unverified claim structurally visible — not by adding process, but by adding a machine-readable provenance field:

- **Every selector/oracle/fact entry carries a `verified:` field** with one of:
  - `live-observation: <date> <method> <evidence-ref>` — the claim was read off the DOM in a dated session.
  - `repo-inferred: <source-file:line>` — derived from selector/code files without live verification.
  - `carried-forward: <source-artifact> <date>` — copied from another artifact.
  - `unverified` — no observation backs this claim.

- **A pre-use check** (in the worker brief, or as a hook) flags any entry with `verified: unverified` or `verified: repo-inferred` when it is about to be used as authoritative input to a test, an audit verdict, or a worker dispatch. The flag does not block — it warns, loudly, so the consumer can verify before trusting.

- **Scope**: selector maps, oracle fact files, helper specification comments (the "what does this measure?" doc on any shared helper). NOT every test constant — only entries that downstream agents treat as ground truth.

This is a **stub**. The full design — the provenance schema, the hook mechanism, the migration path for existing artifacts, the interaction with LR-062's walk coverage gate — is not authored here. The four cases above are the evidence that motivates it.
