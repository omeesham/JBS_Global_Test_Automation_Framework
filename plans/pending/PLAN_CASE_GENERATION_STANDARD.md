# PLAN_CASE_GENERATION_STANDARD — Codify the case-generation technique + lie-proof live-walk

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-24
**Identity**: OWNER
**Depends on**: none
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

Two root problems, verified live 2026-06-23/24 (recovered session `aa086a5c` + corp-pricing rewalk `297af44b`):

1. **No codified case-generation *technique*.** `clients/encore/specs_planning/_internal/field-case-generation.md` §2 is field-*input* types only (11 rows) — zero surface/behavior families. Every grid in Encore (Corp Pricing Search/Override/Detail, LM/LOS History, Item Search) can close green with no pagination/sort/result-fidelity/link-render/file-I/O cases. FCC is a *delivery accelerator* that became the de-facto method only because it was the one hook-enforced generator. ISTQB methods + SFDPOT exist but only as an after-the-fact audit lens / on-demand skill — never wired into the front-line generator.
2. **The live walk can be faked.** Controls were classified from the Jira spec instead of live-clicked, a strict "every control LIVE" line was silently rescoped, the plan flipped DONE — and the closure gate passed, because it checks *completeness* (no blank dispositions), not *provenance* (live evidence vs inference), and the gate is in `announce` (warn-only).

**Meta root cause:** the framework enforces **completeness**, never **provenance**, at both layers; the strongest guards are behavioral (lose to pressure) or switched off.

**This plan = two independent pillars under one index:**
- **[SUBPLAN_CGS_A_STANDARD_AND_SKILLS.md](../done/SUBPLAN_CGS_A_STANDARD_AND_SKILLS.md)** — **DONE 2026-06-24** (Standard `docs/read_only_docs/CASE_GENERATION_STANDARD.md` + `field-case-generation.md` §3 + LR-065/LR-064/LR-057 + 4 agent FCC embeds + `/coverage` + `/ultracoverage` skills + cleanup landed; closure gate PASS). — the Case-Generation Standard (field + surface families, ISTQB/SFDPOT methods, L0–L3 depth) wired into the pipeline, exposed as `/coverage` (QUICK subplan) + `/ultracoverage` (DEEP subplan) per module, with brain-first live exploration of unknown types.
- **[SUBPLAN_CGS_B_WALK_INTEGRITY.md](../done/SUBPLAN_CGS_B_WALK_INTEGRITY.md)** — **DONE 2026-06-24**, evidence-bound provenance gate landed: `coverageVerdict` rejects `provenance: oracle` / missing-or-stale evidence on observation rows (LR-062 condition 5), both importers (closure Cx + execution-completion Stop hook) inherit it, a PreToolUse gate blocks hand-authored evidence in `.playwright-cli/`, LR-064 gains the blind re-drive + delegation-down HALT, fabrication writes an integrity strike, negative-test fixtures verify FAIL/PASS, and `coverage_mode` is flipped to `deny`. `test_status_mode` held at `announce` (user-authorized deviation — it is a separate pre-existing gate owned by PLAN_CORP_PRICING_REWALK_REMEDIATION Subplan D; see this subplan's Execution Summary).

Either pillar ships alone. Full design + verified-facts + `/slop` decisions: scratch plan `~/.claude/plans/i-fucked-up-i-refactored-cascade.md`.

**Locked decisions:** Standard = lean framework read-only doc (`docs/read_only_docs/CASE_GENERATION_STANDARD.md`) + Encore instance (`field-case-generation.md` §3) · mechanical block now (`deny`) · 2 subplans/module (QUICK+DEEP) · per-depth DEEP chunking · Corp-Pricing-first / new-now / old-deferred · render-fail → RCA → *potential* bug · pipeline-wide default · unknown type → brain-first live probe → `/research` fallback → HALT last resort. New framework rule: **LR-065** only (LR-066/LR-ENC-005 dropped per `/slop` — folded into LR-062/LR-064 amendments + plan body + the Standard).

---

## Rollout (sequence — this is a one-time ordering, not a recurring rule)

- **Phase 0** — close the deferred ISTQB/SFDPOT completeness diff (prove the 7 surface families miss nothing) BEFORE landing the Standard.
- **Pillar A then/with Pillar B** — land the Standard + wiring + skills; land the provenance gate + `deny` flip (guarded).
- **Phase 1 — Corp Pricing first** — `/coverage corporate-pricing` → QUICK+DEEP subplans; execute QUICK; prove the Search grid now asserts pagination/sort/link-render.
- **Phase 2** — every new module gets surface families by default. **Phase 3** — old modules deferred (pulled in only on a filed grid bug or incidental re-walk).

---

## Acceptance criteria

- [ ] Both child subplans closed (each its own closure gate PASS).
- [ ] `docs/read_only_docs/CASE_GENERATION_STANDARD.md` exists; `field-case-generation.md` has §3; LR-065 in `.claude/rules/inventory.md`.
- [ ] `/coverage` + `/ultracoverage` registered in `.claude/skills/INDEX.md`.
- [ ] `coverage_mode` + `test_status_mode` = `deny` in `.claude/closure-config.json` (guarded flip — no new false-positives in `--all --report-only`).
- [ ] Corp Pricing proof: QUICK + DEEP subplans authored; QUICK executed; Search-grid spec asserts pagination/sort/link-render.

## Verification

```bash
node scripts/plans-reindex.mjs --check                       # INDEX reflects the 3 new files
node scripts/validate-plan-closure.mjs plans/pending/SUBPLAN_CGS_A_STANDARD_AND_SKILLS.md --dry-run   # structural
node scripts/validate-plan-closure.mjs plans/pending/SUBPLAN_CGS_B_WALK_INTEGRITY.md --dry-run
```
