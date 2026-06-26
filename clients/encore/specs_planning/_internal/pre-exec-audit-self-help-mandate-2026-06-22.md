# Pre-Execution Self-Audit — PLAN_SELF_HELP_RESEARCH_MANDATE

**Date**: 2026-06-22
**Plan**: `plans/pending/PLAN_SELF_HELP_RESEARCH_MANDATE.md`
**Gate**: Phase 0.0 (MANDATORY, BLOCKING) — adversarial, fresh-context, AI-Council-grade
**Executor session**: OWNER (Opus 4.8), `/execute` + `/ultrathink`
**Method**: 4 fresh-context Sonnet auditors (Dimensions A/B/D/E, each `file:line`-cited, no rubber-stamp) + inline Rovo MCP canary (Dimension C, which subagents cannot perform — no Rovo tools in their frontmatter) + Opus synthesis.

> Per the plan's own Phase 0.0 §7: "Any DEFECT → fix the plan … and re-run the gate; never execute around a DEFECT." Defects found below were **remediated in the plan body before this verdict was emitted and before any Phase 1 edit**. This artifact records the post-remediation state.

---

## Per-dimension verdict table

| Dim | Scope | Initial finding | PROCEED/DEFECT | Remediation (plan edit) |
|---|---|---|---|---|
| **A** | Number/path integrity (LR-020) | LR-063 free (live max **LR-062** in `.claude/rules/inventory.md:88`; LEARNED_RULES.md top = LR-059). LR-ENC-004 free (max LR-ENC-003). REQ-015 free (max REQ-014), PLN-051 free (max PLN-050), GEN-045 free (max GEN-044). **HLR-NNN / AUD-NNN were placeholders** → resolved to **HLR-029** (max HLR-028) / **AUD-018** (max AUD-017). Two Context-prose paths wrong: the JIRA STORIES `.docx` and `jira_pricing_test_cases.xlsx` live under `clients/encore/docs/`, not `docs/` / `_internal/`. | DEFECT → **FIXED** | §1.2 HEALER/AUDIT rows now carry HLR-029/AUD-018; Phase 0 Step 2 records all 5 verified next-free ids + live high-water marks; Context line 38 repathed to `clients/encore/docs/`. |
| **B** | Claim re-verification (don't trust the snapshot) | All 5 findings **STILL TRUE** on live files: (a) `REQUIREMENTS.md:4` `tools:` line has zero Rovo tools; (b) `REQUIREMENTS.md:11` truth hierarchy ends `… > Jira` (last of 8); (c) `PLANNER.md` + `GENERATOR.md` → 0 jira/confluence/rovo hits; (d) `HEALER.md` + `AUDIT.md` → 0 by-design/jira hits; (e) `feedback_self_first_research.md:14` chain = `self → repo → web → Rutvik`, `encore-questions/SKILL.md` kill-list has no Jira-answerable criterion. **Zero touchpoints to strike.** | **PROCEED** | None needed — all 9 touchpoints are justified by a still-live gap. |
| **C** | Capability proof (Rovo live?) | `atlassianUserInfo` → account **active** (`RutviK`, rutvik.khorasiya@jade-biz.com). `getAccessibleAtlassianResources` → cloudId `03ec286f-d928-4c2c-b782-c8cce703ce2a`, site `encore.atlassian.net`, scopes incl. `read:jira-work`/`write:jira-work` + Confluence read/write. `getVisibleJiraProjects(cloudId)` → **2,245 lines / 116KB of projects returned** (the tool "error" was output-size truncation, NOT a failure — projects ARE returned). Server id `351f3923-22c5-4ff0-a7bd-339c0028aae5` **matches the live MCP tool prefix**. | **PROCEED** | None — capability confirmed live. Headless degrade path (§1.3 `[ROVO-SKIP]` canary on `getVisibleJiraProjects`) is correctly specified for `/chain` runs. |
| **D** | Slop / worthiness / minimalism | No full DROPs. LR-063 (framework "what") and LR-ENC-004 (Encore structural "how") are distinct layers, not duplicative. The 7 prompt/skill/memory touchpoints form a layered enforcement chain, not 7× the same rule. **2 TRIMs**: (1) HEALER BUG sub-case duplicates LR-034 Step 1 ("find the original source … Jira"); (2) PLANNER's new `## Jira/Confluence Findings` section would drift from `field-inventory-spec.md` unless the spec declares it. | DEFECT → **FIXED** | §1.2 HEALER row scoped to FEATURE_CHANGED_BIG + remove-test and now **cites LR-034 Step 1** for BUG. New §1.2 row + Stale-slop item 5 add the **optional** `## Jira/Confluence Findings` section to `field-inventory-spec.md`. |
| **E** | Goal-completion proof | Most acceptance criteria TRACE to a producing edit. **DEFECT**: criterion "each agent carries its new self-help rule id" was unverifiable for HEALER/AUDIT (placeholder ids). **Weak criterion**: `grep -i "jira\|confluence\|rovo" encore-questions/SKILL.md ≥ 1` passes vacuously today (3 pre-existing incidental hits). Several touchpoints (§14, PLANNER Phase 0.75, REQUIREMENTS Phase 0.5 prose) had no dedicated criterion. | DEFECT → **FIXED** | Acceptance criteria rewritten: concrete `grep -c` per agent id (REQ-015/PLN-051/GEN-045/HLR-029/AUD-018); the encore-questions check tightened to `grep -ic "jira-answerable"`; new criteria added for §14 and the field-inventory-spec section. Verification bash block updated to match. |

---

## Defects → remediation ledger (9 plan edits applied 2026-06-22, all BEFORE Phase 1)

1. Context line 38 — `.docx` + `.xlsx` repathed to `clients/encore/docs/` (Dim A).
2. Phase 0 Step 2 — all 5 next-free ids named + live high-water marks recorded (Dim A).
3. §1.2 HEALER row — `HLR-NNN` → `HLR-029`; scope FEATURE_CHANGED_BIG + remove-test; cite LR-034 Step 1 for BUG (Dim A + Dim D TRIM-1).
4. §1.2 AUDIT row — `AUD-NNN` → `AUD-018` (Dim A).
5. §1.2 — new `field-inventory-spec.md` optional-section row (Dim D TRIM-2).
6. Stale-slop — new item 5 for the field-inventory-spec sync (Dim D TRIM-2 / LR-050).
7. Acceptance criteria — concrete per-agent `grep -c` ids (Dim E).
8. Acceptance criteria — tightened encore-questions check + new §14 / field-inventory-spec criteria (Dim E).
9. Verification bash block — extended with the new greps (Dim E).

---

## Overall

**VERDICT: PROCEED**

Rationale: the plan's core thesis is **validated** — Dimension B confirms every one of the 5 audited gaps is still live (no settled work being redone), Dimension C confirms Rovo is connected and returns Jira projects, and Dimension D confirms no slop / no redundant rules. All Dimension-A id/path defects and Dimension-D/E refinements were corrected in the plan body before this verdict. No DEFECT remains open; execution is authorized to begin at Phase 0 → Phase 1.
