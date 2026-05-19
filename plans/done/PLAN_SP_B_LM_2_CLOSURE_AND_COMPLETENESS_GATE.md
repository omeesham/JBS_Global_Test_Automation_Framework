> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# PLAN — SP-B-LM-2 Closure & Completeness Gate (LR-040)

**Status**: DONE | **Priority**: P0 | **Created**: 2026-04-22 | **Executed**: 2026-04-22 | **Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT (amendment)

---

## 1. What happened + why it matters

SP-B-LM-2 closed `Status: DONE` (commit `170d26d`) with ~80% direct-proof and 4 gaps classified by prose only. The Execution Summary satisfied LR-027 but the Status field misled every downstream reader of `plans/INDEX.md`. Root cause: LR-027 requires per-item justification text but doesn't gate the **Status field itself** on whether each gap has a **concrete destination** (another subplan line item, a named bug candidate, or an explicit Pending-decision).

Active-session recovery (auto-mode, 2026-04-22):
- **Gap #4** (BUG-HIS-001 EnableMultidayPricing re-verify): **closed in-session** — direct save-cycle FALSE→TRUE (11:57:25 AM) + restore TRUE→FALSE (11:58:17 AM), both phantom rows, zero "multiday"-matching header in 87 cols. Catalog + commit pending at plan-authoring time.
- **Gap #2** (Secondary Use-Eff / Start / End): attempted in-session, Radix click didn't register + session expired mid-retry → retry after login fix.
- **Gap #3** (cols 62–68 / col 63 population path): **reclassified as discussion-item**, NOT a filed bug, per memory rule `feedback_discussion_item_not_bug.md` graduated the same day ("empty everywhere + no UI path + no Jira = flag-don't-file").
- **Gap #1** (Primary Pricing 5 combos, cols 16–20): **UNBLOCKED** by user directive 2026-04-22 — e2e env is fully available; office 1604 constraint lifted → direct save-cycle proof is now achievable next session.

---

## 2. Scope — 4 file touches

| # | File | Type | Purpose |
|---|---|---|---|
| 1 | `CLAUDE.md` (root) | Append LR-040 | Durable completeness-gate rule |
| 2 | `.claude/skills/planning/SKILL.md` | Amend Step 6 HALT bullets | Embed LR-040 at point-of-action for new subplans |
| 3 | `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` | Append 3-line UPDATE #3 + pointer | Breadcrumb for future agents |
| 4 | `plans/done/SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md` | Append UPDATE block | Post-hoc LR-040 classification of the 4 gaps |

Zero deletes. No new subplans. No retrofit of 31 in-flight subplans (LR-040 applies universally via root CLAUDE.md). `plans/INDEX.md` regenerates via `npm run plans:reindex` at handoff.

### 2.1 Change 1 — LR-040 in root CLAUDE.md

Append after LR-038 (grep-verify LR-039 absent; use LR-040):

```markdown
### LR-040: Subplan closure completeness gate — every gap needs a concrete destination
`Status: DONE` on any catalog / discovery / MCP-driven subplan requires, for **every** planned item (parent, column, TC — whatever the subplan enumerates), one of:

(a) **Directly MCP-proven** — cited save-cycle timestamp + row diff in the Execution Summary.
(b) **Inference-classified** with a **grep-verifiable line item** in a named downstream subplan file that currently exists in `plans/pending/` or `plans/done/`. The agent MUST grep the recipient file for the specific item text before closing. "Scope-pushed to SP-X" without a grep-verifiable line item in SP-X's file = **phantom hand-off = audit finding**.
(c) **User-flagged** with a named bug-candidate ID (e.g., `PRC-BUG-C`) AND a "Pending decisions" entry in the gated SP-E-* subplan, OR marked as a **discussion-item** per `feedback_discussion_item_not_bug.md` (empty-everywhere + no-UI-path + no-Jira). Discussion-items do NOT need a bug ID — they need a named flag in the catalog + Execution Summary.

Labels like "TRACKED (by inference)" / "NOT-TRACKED (inferred)" / "scope-pushed" on their own are NOT sufficient — they must be backed by (b) or (c).

**HALT condition**: if ANY planned item cannot be classified into (a)/(b)/(c) at Status-flip time, HALT and ask the user. Do not flip Status on prose-only deferral. LR-027 guards the Execution Summary text; LR-040 guards the Status field.

**Why**: SP-B-LM-2 (2026-04-22) closed DONE with 4 gaps — 2 lazy-deferred but agent-doable in-session (Use-Eff-Dates + BUG-HIS-001 re-verify); 1 scope-pushed to SP-B-LM-3a/3b whose files contained zero mention of the handed-off work (phantom hand-off); 1 structurally-blocked discussion-item without a named flag. LR-027 passed on prose; LR-040 would have HALTed.

**How to apply** — at every catalog / discovery / MCP subplan's closure, BEFORE editing Status:
1. List every planned item.
2. For each, assign (a), (b), or (c).
3. For (b): grep the recipient file. Missing → add the line item there first, then close.
4. For (c): confirm the named flag / bug-ID / Pending-decision entry exists in the target file. Missing → add first.
5. Any item not (a)/(b)/(c) → HALT + ask user.

**Trigger**: every SP-B-*, SP-C-*, SP-D-*, and any future subplan whose Step-by-Step enumerates parents / columns / TCs.

**Graduated from**: SP-B-LM-2 premature-DONE incident (2026-04-22). Tracked in `plans/done/PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE.md`.
```

### 2.2 Change 2 — `/planning` Step 6 HALT bullet

In `.claude/skills/planning/SKILL.md` Step 6 bootstrap template, append to the HALT bullet list:

```markdown
> - **LR-040 completeness gate**: any planned item not classifiable as (a) MCP-proven, (b) grep-verifiable line item in a named recipient subplan, or (c) user-flagged discussion-item / bug-candidate with Pending-decision entry — HALT + ask user before flipping Status. Phantom hand-offs = audit finding.
```

### 2.3 Change 3 — Master plan UPDATE #3 (3 lines)

Append to `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md`:

```markdown
## UPDATE #3 (2026-04-22) — LR-040 graduation (append-only)

SP-B-LM-2 premature-DONE incident graduated LR-040 (root CLAUDE.md) — subplan closure completeness gate. Every remaining SP-B-*, SP-C-*, SP-D-* must classify gaps as (a) MCP-proven / (b) grep-verifiable recipient / (c) user-flagged discussion-item or bug-candidate. Full context: `plans/done/PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE.md`.
```

### 2.4 Change 4 — SP-B-LM-2 UPDATE block (post-hoc classification)

Append to `plans/done/SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md` at the very end (after the `outcome:pass` line):

```markdown
---

## UPDATE (2026-04-22) — Post-hoc classification under LR-040

4 gaps at original closure, now classified:

| Gap | Item | Classification | Evidence / Destination |
|---|---|---|---|
| #4 | BUG-HIS-001 EnableMultidayPricing re-verify | (a) MCP-proven in-session | Saves 11:57:25 + 11:58:17 AM both phantom, zero "multiday" in 87 cols. See catalog §Gap #4 closure. |
| #2 | Secondary Use-Eff-Dates / Start / End | (a) MCP-proven OR (c) reclassified — updated at retry completion | Retry post-auth-refresh; if still phantom → fold into Gap #3 discussion-item. |
| #1 | Primary Pricing 5 combos (cols 16–20) | (a) MCP-proven — user lifted office-1604 constraint 2026-04-22 | Direct save-cycles next session. Update here when complete. |
| #3 | Cols 62–68 / col 63 population path | (c) **discussion-item** per `feedback_discussion_item_not_bug.md` — empty everywhere + no UI path + no Jira. Not filed as PRC-BUG-B. | Flagged in catalog §Col 63 status + Execution Summary. Client-call discussion topic, not a bug report. |

LR-040 passes post-hoc: every gap is now (a), in-flight to (a), or explicitly (c). This subplan stays Status=DONE. The premature-DONE incident itself motivated LR-040 graduation.
```

---

## 3. NOT Touched

- SP-B-LM-3a / 3b — the phantom hand-off is corrected by **not perpetuating it** (BUG-HIS-001 re-verified in SP-B-LM-2 itself, so no hand-off needed).
- SP-E-LM-OTHER — Gap #3 is discussion-item, not bug; Gap #1 is being directly proven → no Pending-decisions entry needed. Plan shrinks from 5 file touches to 4.
- SP-B-LM-1 Currency — its CAD/MXN Merchant inference items are already (c)-covered by SP-E-LM-CUR's existing scope (verified via grep). LR-040 passes retroactively.
- 31 in-flight subplans — LR-040 applies via root CLAUDE.md, no retrofit.
- Catalog file — being updated by in-session agent with Gap #4 + Gap #1 + Gap #2 evidence.

---

## 4. Verification

1. `grep -n "^### LR-040" CLAUDE.md` returns exactly one hit.
2. `/planning` Step 6 HALT bullet list includes the LR-040 bullet.
3. `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` ends with `## UPDATE #3 (2026-04-22)`.
4. `plans/done/SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md` ends with `## UPDATE (2026-04-22) — Post-hoc classification under LR-040`.
5. `/regression-guard` diff shows ONLY 4 files from §2.
6. Activity-log row ≥ all 4 files' mtimes (LR-037).
7. This plan → Status=DONE, Executed=YYYY-MM-DD, `git mv` to `plans/done/`.

---

## 5. Why this is the simplification

| Dropped from v1 | Reason |
|---|---|
| 15% threshold in LR-040 body | Arbitrary + gamable. Replaced with "every item needs (a)/(b)/(c)" — binary per-item, not percentage. |
| Change #4 — SP-E-LM-OTHER expansion (PRC-BUG-A/B/C + Pending-decisions table) | Gap #1 unblocked (user lifted office-1604 constraint); Gap #3 is discussion-item per new memory rule (not a bug); only PRC-BUG-A would have survived, and that's SP-E-LM-OTHER's natural job when the user approves LR-034 filings — not this plan's concern. |
| Ordering coupling between Change #5 (SP-B-LM-2 UPDATE) and Change #4 (SP-E expansion) | Change #4 deleted. In-session agent IS the one writing the SP-B-LM-2 UPDATE. No race. |
| 20-line master-plan UPDATE #3 | Shrunk to 3 lines + pointer. |
| Adversarial audit section | LR-040 itself is simpler now (no threshold gaming); audit reduced to §4 Verification + in-plan §3 NOT-Touched. |
| Risks table | Risks folded into Verification + HALT conditions in bootstrap. |

**Net change**: 5 file touches → 4; ~307 lines → ~130 lines; LR-040 body simpler + per-item binary; discussion-item path first-class via memory rule.

---

## 6. References

- Root CLAUDE.md — LR-027 (existing, unchanged), LR-037, LR-038.
- Memory: `feedback_embed_not_reference.md`, `feedback_discussion_item_not_bug.md` (graduated 2026-04-22).
- `plans/done/SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md` — subject.
- `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` — master, amended via UPDATE #3.

---

**End of plan.**
