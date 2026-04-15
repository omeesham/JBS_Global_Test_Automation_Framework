# PLAN_AGENT_MISTAKES_HIST_GRADUATION

**Status**: PENDING
**Parent audit**: `C:\Users\rutvi\.claude\plans\expressive-booping-fountain.md` (Action M-4, Finding SP1-F6)
**Priority**: P2 (MEDIUM — patterns will reoccur if not graduated)
**Created**: 2026-04-15
**Identity**: WATCHDOG (rule quality + graduation)
**Estimated session**: SMALL (30-45 min)
**Depends on**: PLAN_HIST_EXTERNAL_SP1_AUDIT (need verified findings before graduating)

---

## Context

SP1 discovered patterns that are now scattered across 14 fuckup entries + 429-line MCP findings doc but haven't been graduated to permanent rules in `agent-mistakes.md`. Per AUD-004 (mandatory registry update) + `/compile-learnings` periodic skill, patterns with 3+ occurrences (or 1 occurrence + high impact) should become permanent rules.

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

- [ ] All 7 candidate patterns reviewed
- [ ] Each graduated, deferred, or explicitly rejected (with reason)
- [ ] No ID collisions (AUD-007)
- [ ] sync:mistakes + validate:sync pass
- [ ] Activity log row added
