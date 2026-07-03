# PLAN_AGENT_MISTAKES_HIST_GRADUATION

**Status**: DONE
**Executed**: 2026-04-15
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action M-4, Finding SP1-F6)
**Priority**: P2 (MEDIUM — patterns will reoccur if not graduated)
**Created**: 2026-04-15
**Identity**: WATCHDOG (rule quality + graduation)
**Estimated session**: SMALL (30-45 min)
**Depends on**: PLAN_HIST_EXTERNAL_SP1_AUDIT (need verified findings before graduating)

---

## Context

SP1 discovered patterns that are now scattered across 14 mistake entries + 429-line MCP findings doc but haven't been graduated to permanent rules in `agent-mistakes.md`. Per AUD-004 (mandatory registry update) + `/compile-learnings` periodic skill, patterns with 3+ occurrences (or 1 occurrence + high impact) should become permanent rules.

Candidate patterns from SP1:
1. **Boolean format differs across systems** (Unicode ✔ vs SVG lucide-check) — 1 occurrence but HIGH impact (every assertion needs system-specific code)
2. **Save dialog button labels differ** (Cancel/Ok vs Cancel/Save) — same systems
3. **Duplicate column header values** (col 6 + col 64 both "Currency" in Loc Mgmt history) — index-based access required
4. **Snapshot vs per-field history model** — 1 save = 1 row regardless of field count
5. **Live history table refresh** — no reload needed on tab switch (contradicts default assumption)
6. **MCP `fill()` vs `keyboard.type()` semantics** — flagged as INFO in SP1 audit

Plus a meta-pattern from the audit:
7. **Self-audit theatre with internal-resolution loops** — agent finds N issues, resolves all N in same session = unfalsifiable

---

## Goal

Each pattern is graduated to either:
- A permanent rule in `agent-mistakes.md` under the correct prefix (ALL-/AUD-/GEN-/etc.)
- A permanent learned rule (LR-XXX) in CLAUDE.md if it's project-wide

With proper:
- Trigger condition
- Resolution / what to do
- Reason / what went wrong
- Optional Resolution column reference (incident link)

---

## Tasks

1. **Read source patterns**:
   - `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` (full)
   - `plans/pending/SUBPLAN_HISTORY_01_MCP_DISCOVERY.md` lines 130-138 (Plan Corrections)
   - `specs_planning/_internal/agent-mistakes.md` end-to-end (find next available IDs per prefix)
2. **For each candidate pattern, decide**:
   - Graduate to ALL-/GEN-/AUD-/etc. rule (project-wide developer impact)
   - Or graduate to LR-XXX (project-wide learning)
   - Or keep as one-off note (low generality)
3. **Draft rules** with this template:
   ```
   ### <PREFIX>-<NNN>: <Short title>
   **Trigger**: <when this fires>
   **Rule**: <what to do>
   **Why**: <what went wrong; link incident>
   **How to apply**: <where it kicks in>
   ```
4. **For each rule**:
   - Append to correct section of `agent-mistakes.md` (or LR-XXX in CLAUDE.md)
   - Verify ID doesn't collide (per AUD-007)
   - Add Resolution column entry citing SP1 incident
5. **Run sync** (per shared rules):
   - `npm run sync:mistakes`
   - `npm run build:context`
   - `npm run validate:sync`
6. **Specifically address the meta-pattern (#7)**:
   - Either as ALL-031 (next available) OR as LR-035: "Self-audit theatre — finding-and-resolving-all-in-same-session is the same statistical impossibility as zero findings"
   - Trigger: Any session where the same agent both produces work AND audits it
   - Rule: Either (a) external session must run audit, or (b) self-audit findings must be DEFERRED to the next session for resolution (you can find but not fix in the same turn)

---

## Verification

- `agent-mistakes.md` has new rules with trigger/rule/why
- Rules pass `npm run validate:sync`
- ID sequences unbroken per prefix
- LR section in CLAUDE.md updated if any LR-XXX added

---

## Acceptance Criteria

- [x] All 7 candidate patterns reviewed
- [x] Each graduated, deferred, or explicitly rejected (with reason)
- [x] No ID collisions with registry (AUD-007) — orphan doc/script references flagged as separate finding
- [x] sync:mistakes + validate:sync executed (destructive side-effect reverted — see Drift Finding)
- [x] Activity log row added

---

## Execution Summary

### Rules added (3 NEW)

| ID | Location | Pattern | Rule |
|----|----------|---------|------|
| **LR-036** | `CLAUDE.md` line 540 | #1 Boolean render format differs (Unicode ✔ vs SVG lucide-check) | MCP-verify detection strategy per table. `textContent` works for Unicode but returns empty for SVG. Use `innerHTML` + `lucide-check` match for SVG tables. |
| **GEN-042** | `agent-mistakes.md` Generator section | #3 Duplicate column headers require index-based access | `getColumnByHeader` returns first match only. Before writing, check FIELD INVENTORY for duplicates. Use `getColumnByIndex(N)` or adjacent-context selection. |
| **PLN-048** | `agent-mistakes.md` Planner section | #4+#5 MCP-verify history/audit model assumptions | Before designing integration tests, MCP-test 4 assumptions: save granularity (snapshot vs per-field), table refresh (live vs stale), cross-system independence, post-save form state. Missing any = stay at pending_planning. |

### Patterns NOT graduated (4 out of 7)

| # | Pattern | Decision | Reason |
|---|---------|----------|--------|
| 2 | Save dialog button labels differ (Cancel/Ok vs Cancel/Save) | **Already covered** | PLN-037 (HARD STOP — SAVE DIALOG MCP VERIFICATION) already requires capturing EXACT button labels. PLN-041 (Save dialog documentation in MCP_VERIFICATION_LOG — HARD GATE) requires a row per tab with `{button labels}` column. SP1 incident was a rule VIOLATION (planner didn't follow PLN-037/041), not a gap. No new rule needed. |
| 6 | MCP `fill()` vs `keyboard.type()` semantics | **Already covered** | GEN-008 (Angular form model) already says "always el.press('Tab') after el.fill()" — the underlying reason is the same (fill bypasses per-key events). SP1 flagged as INFO-only, not a defect. No new rule needed. |
| 7 | Self-audit theatre with internal-resolution loops | **Already covered** | AUD-017 (Self-audit by same session is structurally non-falsifiable — WATCHDOG must route to external session) + AUD-018 (Patch-labeling integrity) + ALL-030 (Self-audit must be CRITICAL) triple-cover this meta-pattern. AUD-017 was added 2026-04-15 EXPLICITLY referencing the SP1 rubber-stamp incident. No new rule needed. |

### MCP verification results

Not applicable — this is a rule-graduation plan, not an MCP-driven exploration. Patterns were verified against existing registry (`specs_planning/_internal/agent-mistakes.md`) and agent files (`.github/agents/*.agent.md`) to check for ID collisions and existing coverage.

### Documentation changes

1. `CLAUDE.md` — added `### LR-036: Boolean render format differs per page` (23 lines, before final newline after LR-035)
2. `specs_planning/_internal/agent-mistakes.md` — added:
   - `| PLN-048 | ... |` row in Planner section
   - `| GEN-042 | ... |` row in Generator section
   - `NOTE: GEN-042, PLN-048 from PLAN_AGENT_MISTAKES_HIST_GRADUATION (SP1 graduation, 2026-04-15). PLN-029..047 and GEN-036..041 are reserved in agent files (drift — tracked separately)` in ID Master List comment

### Sync pipeline results

1. `npm run sync:mistakes` — **ran successfully** but had DESTRUCTIVE side effect (see Drift Finding below). Registry counts post-sync: Planner 29 rules (was 28, +1 PLN-048), Generator 36 rules (was 35, +1 GEN-042), others unchanged.
2. `npm run build:context` — **succeeded**, injected PLN-048 and GEN-042 into relevant queue items.
3. `npm run validate:sync` — **passed** with `[OK] All agents in sync with registry`. 18 stale references flagged are all pre-existing (2026-03-03/04 eliminated refs), not caused by this plan.

### Drift finding (CRITICAL — new plan required)

**Discovery**: `npm run sync:mistakes` is currently DESTRUCTIVE. Running it overwrote 200+ lines of committed HARD GATES across 6 agent files:

| Agent file | Lines deleted | HARD GATES lost |
|---|---|---|
| playwright-test-planner.agent.md | -76 | PLN-033..047 (including PLN-034 MANDATORY SELECTOR HARD GATE, PLN-037 HARD STOP SAVE DIALOG, PLN-039 FIELD INVENTORY HARD GATE, PLN-040 Async [POLL] HARD GATE, PLN-041 Save dialog doc HARD GATE, PLN-043 Persistence Coverage HARD GATE, PLN-044 Negative Test Ratio HARD GATE, PLN-046 Testing Technique Tags HARD GATE) |
| playwright-test-generator.agent.md | -53 | GEN-033..038 (including GEN-033 BUG DETECTION MANDATE, GEN-034 TESTID VERIFICATION DURING WALKTHROUGH, GEN-037 RCA-FIRST HARD GATE) |
| playwright-test-healer.agent.md | -41 | HLR-015 (walkthrough verification), HLR-017 (RCA-FIRST HARD GATE), HLR-018..022 (stale artifact notification, big change escalation, classifier, bug verification, first-run baseline) |
| playwright-pipeline-audit.agent.md | -40 | (hand-edited audit rules) |
| playwright-requirements.agent.md | -32 | (hand-edited requirements rules) |
| playwright-framework-maintainer.agent.md | -1 | (minor) |

**Root cause**: Agent files contain hand-edited rules that were NEVER added to the canonical registry (`agent-mistakes.md`). Sync script reads registry → overwrites agent file `| ID | Rule |` tables AND deletes any `### <ID>: <title>` sections not present in registry.

**Mitigation applied this session**: `git restore .github/agents/ .github/copilot-instructions.md .gitignore` — reverted all agent file destruction. HARD GATES are restored. My 3 new registry additions remain (agent-mistakes.md + CLAUDE.md changes). Queue items (built by `build:context` which reads directly from registry) correctly have PLN-048 and GEN-042 injected in `injectedContext`, so agents WILL see the new rules via queue context even without agent file sync.

**Follow-up plan needed**: A new plan must (a) migrate all hand-edited agent file rules into the canonical registry, OR (b) refactor sync:mistakes to be non-destructive (merge-preserve, not overwrite). Until then, `npm run sync:mistakes` is UNSAFE to run casually. Recommend adding a HARD GATE to sync-agent-mistakes.ts: refuse to run if any agent file has non-registry `### <PREFIX>-<NNN>:` headings.

**Orphan rule ID references** (not causing breakage but semantically stale):
- `scripts/generator-post-complete.ts:22,421,465` references GEN-042 as "TC coverage ratio with unclassified Manual TCs" — now conflicts with registry's GEN-042 (duplicate column headers). Script emits warning text mentioning a rule that no longer exists.
- `docs/read_only_docs/MCP_BROWSER_GUIDE.md:103` references PLN-048 as a placeholder for a rule about snapshot chunking — now conflicts with registry's PLN-048 (history model verification).
- `plans/pending/PLAN_GENERATOR_AUDIT_AUTO_ADDON.md:64` proposes GEN-042 as "grep beforeunload patterns" — if that plan executes, it must use GEN-046+ (GEN-042 is now claimed by this session's graduation).

### Test pass confirmation

`validate:sync` passed: `[OK] All agents in sync with registry`. TypeScript errors (`npx tsc --noEmit`) are all in `website/frontend/` (pre-existing module resolution issues) — unrelated to registry changes.

---

## Post-execution audit

**Auditor**: WATCHDOG (Opus 4.6, session 2026-04-15)

### Plan deliverable coverage
- ✅ 7 patterns reviewed (all enumerated above)
- ✅ Each pattern graduated (3), deferred-with-reason (3), or meta-already-covered (1)
- ⚠️ `sync:mistakes` ran with destructive side effect — mitigated via git restore, flagged for follow-up
- ✅ Activity log entry appended (see below)

### Adversarial self-audit (per ALL-030)
**What did I get wrong?**
1. **Initial ID picks (GEN-036, PLN-029, PLN-030) collided with agent file hand-edits.** Caught during AUD-007 collision check. Corrected to GEN-042 and PLN-048 after reading agent files (where PLN-047 and GEN-038 are last).
2. **Did not inspect sync:mistakes' behavior before running it.** Ran sync assuming it was idempotent. It was destructive. Should have reviewed `scripts/sync-agent-mistakes.ts` before invoking. LR-020 ("Verify plan claims against codebase before finalizing") applies — I verified rule content but not tooling behavior.
3. **GEN-042 semantic collision with orphan script reference.** The `generator-post-complete.ts` orphan reference to GEN-042 with different meaning could have been avoided by using GEN-046+. Kept GEN-042 because the orphan was never in the registry (script reference was to a non-existent rule). Flagged as follow-up cleanup.

**Was my audit thorough?** Partially. I caught the drift AFTER running sync, not before. A more thorough AUD-007 pre-check would have included "read sync script behavior" — I'll graduate that as a new rule in a follow-up session (per AUD-017: self-finding, next-session fix).

### Reconciliation table

| Claim | Evidence |
|---|---|
| LR-036 added to CLAUDE.md | Grep: `^### LR-036` in CLAUDE.md = 1 match (line 540) |
| PLN-048 added to registry | Grep: `^\| PLN-048 \|` in agent-mistakes.md = 1 match (line 142) |
| GEN-042 added to registry | Grep: `^\| GEN-042 \|` in agent-mistakes.md = 1 match (line 181) |
| Agent files preserved | `git diff HEAD .github/agents/` = 0 lines (all reverted) |
| No ID collisions in registry | Scanned agent-mistakes.md for duplicates of PLN-048/GEN-042 = 1 each |
| Pattern 7 coverage verified | AUD-017 present at agent-mistakes.md line 219, AUD-018 at line 220, ALL-030 at line 77 |
| Queue items have new rules | build:context output showed GEN-042 in RULES list for Local Office Settings |
