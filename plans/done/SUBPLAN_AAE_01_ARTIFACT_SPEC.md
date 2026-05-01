# SUBPLAN SP-AAE-01: Field-Inventory Artifact Spec — Format, Naming, Template

**Status**: DONE
**Executed**: 2026-04-23
**Priority**: P0
**Created**: 2026-04-23
**Parent**: [PLAN_AGENT_AUTHORING_EFFICIENCY.md](PLAN_AGENT_AUTHORING_EFFICIENCY.md)
**Depends on**: none (this is the foundation subplan — freezes the format before any consumer ships)
**Blocks**: SP-AAE-02 (hook), SP-AAE-03 (planner emits it), SP-AAE-04 (consumers read it), SP-AAE-05 (heuristic greps it)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: Defining the artifact contract that every other subplan consumes. Format churn later = re-work across 5 subplans + 11 existing artifacts. Opus + xhi for judgment-heavy format design.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_AAE_01_ARTIFACT_SPEC.md`
**Identity**: GARDENER
**Skills auto-called**: /identity, /planning, /research, /regression-guard
**Context files** (read before Phase 0):
- `plans/pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md` (parent — AAE-D1 defines artifact location)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md` (reference — the de facto proto-artifact)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md` (shape inspiration)
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (Rules 5 + 6 inform what artifact must cover)
- LR-014, LR-015 (FIELD INVENTORY completeness + defaults-from-dated-MCP)

**Phase 0 directive**: grep all `_internal/neutral-eye-audits/` and `catalogs/` files for field inventory patterns; extract common columns + sections. Do NOT invent columns that don't already appear somewhere.

**Handoff sequence**:
- Activity-log row on close (LR-037).
- Hand off to SP-AAE-02 (hook) with the frozen format + template path.

**HALT conditions**:
- Any field-inventory data already in use in `catalogs/` or `neutral-eye-audits/` doesn't fit the proposed format → extend format, don't fork.
- Proposed format breaks LR-014 (missing testid column) or LR-015 (missing dated MCP session) → rewrite.

---

## Purpose

Freeze the **field-inventory artifact** format. Every downstream subplan in this plan + every test-case authoring subplan in the repo (current + future) depends on this format being stable.

## Step-by-step

1. **Phase 0 — Survey existing proto-artifacts**:
   - List every file under `clients/encore/specs_planning/_internal/neutral-eye-audits/` and `clients/encore/specs_planning/catalogs/`.
   - For each, extract the column headers + section names it uses to describe fields.
   - Build a union of columns seen in the wild.
2. **Draft the spec**:
   - Frontmatter fields: `Module`, `Client`, `MCP_Session_Date`, `MCP_Session_Tool` (Claude in Chrome or Playwright MCP per LR-038), `Author_Identity`, `Page_URL`.
   - Mandatory sections:
     - `## Field Inventory` — table: `Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes`.
     - `## Labels + Section Names` — exact text captured from DOM.
     - `## Save-cycle observations` — save dialog text, post-save toast text, dirty-state behavior.
     - `## Known App Bugs` — link to BUG-*.json IDs per LR-034.
     - `## Staleness signal` — last-verified timestamp + freshness window.
3. **Write the template** to `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md` with all sections skeleton + inline instructions.
4. **Write the format spec doc** to `clients/encore/specs_planning/_internal/field-inventory-spec.md` — explains mandatory fields, sample rows, grep rules downstream subplans will run.
5. **Migration note**: document how existing `neutral-eye-audits/local-office-settings-2026-04-22.md` can be promoted to this format without data loss (LOS is first consumer via SP-DQU-03).
6. **Access matrix governance** (added during execution; surfaced as a HALT condition early in the run): write the per-agent ownership rules for the new folder + sibling spec doc into [AGENT_SHARED_RULES.md §2](../../docs/read_only_docs/AGENT_SHARED_RULES.md), and record the rationale as a new Decision (AAE-D9) in the parent plan. Eliminates need for per-write override on every downstream subplan that touches field-inventory artifacts.

---

## Artifacts produced

- `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md`
- `clients/encore/specs_planning/_internal/field-inventory-spec.md`
- Migration notes section in the spec doc covering the LOS neutral-eye artifact promotion.
- 3 new rows in `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 (field-inventory ownership) + governance paragraph cross-linked to parent plan AAE-D9.
- New Decision row [AAE-D9](PLAN_AGENT_AUTHORING_EFFICIENCY.md) in parent plan, plus follow-up notes flagging SP-AAE-03 / SP-AAE-04 / SP-AAE-06 identity selections for the agent that picks them up.

## Success criteria

- [ ] Template exists with all mandatory sections.
- [ ] Spec doc defines every mandatory frontmatter field and column.
- [ ] Migration note shows how to promote LOS audit artifact in ≤10 minutes.
- [ ] Grep rules for SP-AAE-02 hook documented (what the hook will look for).
- [ ] LR-014 + LR-015 coverage confirmed (testid column mandatory; MCP session date mandatory).
- [ ] LR-040 closure gate: every section has (a) purpose, (b) required content, (c) grep-verifiable presence rule.

## Handoff

- Activity-log row (LR-028 + LR-037).
- Chat handoff to SP-AAE-02 owner: template path + spec path + grep rules summary.
- On close: `git mv` this file to `plans/done/`, update Status + Executed, run `npm run plans:reindex`.

---

## Execution Summary (2026-04-23)

**Executed by**: GARDENER (research + design phases) → mid-session switch → OWNER (writes + governance + finalization). The bootstrap declared GARDENER, but `/execute` Phase 0 file-ownership check surfaced that all artifact paths fall outside GARDENER's §2 scope. Resolved without override via clean identity switch (full re-load of OWNER's Step 8 inline definition; not a banner relabel) + adding three new §2 ownership rows. See ALL-077 for the rule + `feedback_identity_switch_protocol.md` for the protocol.

**Deliverables shipped (all 6 success criteria GREEN)**:

1. ✅ `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md` — 246 lines, 7 mandatory sections + 5 optional sections + activity-log row template + inline `<!-- comments -->` walking the author through every placeholder. Verified by grep: `grep -cE '^## (URL\(s\)|Live-state|Field Inventory|Labels|Save-cycle|Known App Bugs|Staleness)'` = 7/7.
2. ✅ `clients/encore/specs_planning/_internal/field-inventory-spec.md` — 249 lines, defines all 8 mandatory frontmatter keys with greppable regex rules + 7 mandatory-section §-blocks (each with Purpose / Required content / Grep rule per LR-040) + 5 optional sections + 16 grep rules + 3 sample rows + LR coverage table covering LR-014/015/026/034/036/038/040/042 + revision history.
3. ✅ Migration note for LOS — 8-step paint-by-numbers procedure documented in spec doc; "10 minutes" wall-clock estimate; source neutral-eye-audit file stays in place; promotion deferred to SP-DQU-03 per AAE-D8 (out of SP-AAE-01 scope).
4. ✅ Grep rules for SP-AAE-02 hook — 16 rules in spec doc § "Grep rules summary": 8 frontmatter regex rules + 7 mandatory-section presence rules + 1 column-shape rule + filename ↔ MCP_Session_Date consistency check.
5. ✅ LR-014 covered: §3 (Field Inventory) text + sample rows + grep rule enforce non-empty `data-testid` column with explicit fallback string. LR-015 covered: frontmatter `MCP_Session_Date` is the timestamp anchor; §3 says Default Value MUST come from live DOM read on that date; §2 (Live-state caveat) records drift vs documented defaults.
6. ✅ LR-040 closure gate: every mandatory section in spec doc has the (a) Purpose / (b) Required content / (c) Grep rule triplet. Verified by `grep -cE '^### §[1-7] —'` = 7/7.

**Out-of-scope work surfaced + handled inline** (added during execution):

7. ✅ **Access matrix governance** — added 3 new rows to [`AGENT_SHARED_RULES.md` §2](../../docs/read_only_docs/AGENT_SHARED_RULES.md) granting OWNER RW on the format files + GIVER CREATE on per-module artifacts + WATCHDOG UPDATE on per-module artifacts (refresh on neutral-eye re-audit) + others READ. Plus a governance paragraph cross-linking to AAE-D9. Eliminates need for per-write override on every downstream subplan that touches field-inventory artifacts. ASR §2 row count: 219 → 222.
8. ✅ **Parent plan AAE-D9 Decision** — recorded the access matrix rationale + the SP-AAE-03/04/06 follow-up note flagging that those subplans' identity assignments need cross-checking against the actual `npm run sync:mistakes` write paths (likely OWNER, not GARDENER as currently authored).
9. ✅ **ALL-077 rule** — added to `agent-mistakes.md` with full SP-AAE-01 incident as the canonical example. Trigger: any /execute Phase 0 OR any subplan authoring. Resolution paths (a)/(b)/(c) documented; override explicitly excluded as a workflow.
10. ✅ **Two new memory files** — `feedback_identity_switch_protocol.md` (proper mid-session switch, no override) and `feedback_no_rush_at_session_end.md` (deferred follow-up work gets full skill discipline, never collapsed to one line). MEMORY.md index updated.
11. ✅ **Navigation registry** — `.claude/context/navigation.md` §B got 2 new routing rows (field-inventory authoring + identity-switch lookup); §C got 1 new exploration entry (Field-inventory artifact format = Complete, dated 2026-04-23).

**Nothing dropped, nothing deferred-without-justification, nothing rationalized as "scope creep"**. LR-040 closure gate at the subplan level: every planned item is (a) MCP-proven (n/a — no MCP this session) OR (b) grep-verifiable in the artifact (every success criterion has a grep above) OR (c) documented as out-of-scope with a named target subplan (LOS migration → SP-DQU-03; hook implementation → SP-AAE-02; SP-AAE-03/04/06 identity follow-up → AAE-D9 follow-up note in parent plan).

**Browser tool**: none used this session — no live-DOM walk required (this subplan freezes a format spec, doesn't author a per-module artifact). LR-038 N/A.

**Regression guard verdict**: GREEN. Before/after structural diff matches expectations exactly: ASR +3 rows, parent plan +1 Decision row + follow-up paragraph, subplan body +1 step (Step 6) + +Execution Summary, _internal/ tree +1 folder + +1 file, no rows removed or shifted unexpectedly.

**Audit verdict**: GREEN. No undone work, no rationalized skips, no LR-001..006 implementation defects (N/A — no code emitted), all cross-references to LR rules verified to exist in CLAUDE.md or clients/encore/CLAUDE.md.

**Reflect output**: 1 mistake (ALL-077), 2 preferences (identity-switch protocol + no-rush at session end), 0 patterns, 0 references. Memory + navigation + agent-mistakes all updated.

**Handoff to SP-AAE-02 owner**:

- Template path: `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md`
- Spec path: `clients/encore/specs_planning/_internal/field-inventory-spec.md`
- Grep rules: 16 rules in spec doc § "Grep rules summary" — copy-paste ready for the hook script. Critical: hook MUST exclude `_TEMPLATE.md` itself from validation (file-name exclusion already documented).
- §2 ownership: GIVER CREATE per-module artifacts (the hook fires on commit; the planner is the primary author), so the hook author should NOT need to update §2 — that landed in this subplan.
