# SUBPLAN MT-05: Split CLAUDE.md + AGENT_SHARED_RULES

**Status**: PENDING
**Priority**: P1
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE
**Created**: 2026-04-16
**Depends on**: SP-MT-04 (pipeline scripts working with client-aware paths)
**Blocks**: SP-MT-06 (agent parameterization uses the split rule files as reference)

---

## Goal

Extract encore-specific Learning Rules (LRs) and §12 rule cluster from framework-level docs into per-client addenda. The framework keeps rules that apply to any Playwright + Angular + modern-browser client; the client gets rules that name Navigator Cloud features, Encore-specific behaviors, or Encore UI patterns.

---

## Scope

### 1. Create `clients/encore/CLAUDE.md`

Encore-specific LRs (move from root CLAUDE.md):
- LR-008 — Date offset positivity constraints (Location Settings date fields)
- LR-009 — Angular form dirty tracking — never test recovery to original value
- LR-010 — Cross-field validation is ALWAYS async — use expect.poll
- LR-011 — Reload after non-numeric input to clear Angular model corruption
- LR-012 — Save dialogs are SHARED unless MCP-proven otherwise (Location Settings tabs)
- LR-015 — Default values from dated MCP sessions only (FIELD INVENTORY)
- LR-016 — Accessibility tree element types do NOT match actual HTML tags
- LR-017 — Different pages MUST have separate selector namespaces (Location Settings vs Local Office Settings)
- LR-019 — First test in describe.serial MUST enforce baseline state
- LR-025 — Radix UI large-option dropdowns need retry on option selection
- LR-026 — Angular form dirty state is unreliable — always handle defensively
- LR-036 — Boolean render format differs per page (Unicode ✔ vs SVG lucide-check)

Judgment flags — review with user before moving:
- LR-013 — Generator Phase 0.5 walkthrough is MANDATORY (pipeline-level, but references encore context)
- LR-014 — FIELD INVENTORY testid column must be complete (pipeline rule, but FIELD INVENTORY is encore planner output)
- LR-018 — Spec-fixing workflow — run-all is the only truth (generic Playwright workflow)

Default: framework unless the rule explicitly names encore UI or product behavior.

Also include in `clients/encore/CLAUDE.md`:
- Client-specific onboarding notes (credentials setup, BASE_URL)
- Encore product context summary (Navigator Cloud, setup modules, SSO via Microsoft + TOTP)
- Pointer to `clients/encore/docs/REQUIREMENTS.md` and `clients/encore/docs/MODULE_REGISTRY.md`

### 2. Prune root `CLAUDE.md`

Framework-applicable LRs stay at root:
- LR-001 — Verify function signatures before calling
- LR-002 — Catalog ↔ Implementation parity
- LR-003 — No empty catch blocks
- LR-004 — React cleanup audit
- LR-005 — useCallback/useEffect dependency audit
- LR-006 — Validate external data structure before access
- LR-007 — MCP-verify ALL planner claims (generic pipeline rule — keep framework)
- LR-020 — Verify all plan claims against actual codebase before finalizing
- LR-021 — Un-skip before rewrite
- LR-022 — No hardcoded structural counts in assertions
- LR-023 — No networkidle in Angular SPA (applies to any Angular client — framework)
- LR-024 — Clean artifacts and run fresh BEFORE any RCA
- LR-027 — Plan finalization execution summary mandatory
- LR-028 — Activity log entry at session end
- LR-029 — Never audit selectors without live DOM verification
- LR-030 — Requirement contradiction = investigate as bug
- LR-031 — SKIP requires exhaustive investigation
- LR-032 — MCP agents must investigate, not theorize
- LR-033 — Network RCA checklist
- LR-034 — Bug Filing Protocol
- LR-035 — plans/INDEX.md is auto-generated
- LR-037 — Activity log timestamps must be ≥ referenced file mtimes

Add a one-line pointer near the top of root CLAUDE.md:
> **Client-specific rules**: see `clients/${ACTIVE_CLIENT}/CLAUDE.md` for product-level rules (e.g., for Encore: Angular form quirks, Radix retries, Navigator Cloud table render formats).

### 3. Split `docs/read_only_docs/AGENT_SHARED_RULES.md`

- Extract encore-specific §12 rules (Office 1604 hardcode, Navigator URL patterns, Encore form dirty behavior, `TC-LOC-LI-*` test ID patterns) into `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md`.
- Keep framework-level rules (R01 Search-before-create, file ownership table, selector naming conventions, fixture patterns, evidence-based fixes) at root.
- Ownership table: paths in the table change from `src/pages/**` → `clients/${ACTIVE_CLIENT}/src/pages/**`. Update table entries to use the placeholder.

### 4. Skills that read LRs

Skills like `/audit`, `/bugfix`, `/reflect`, `/execute` cite LRs by number. After the split, they need to read both root CLAUDE.md and `clients/${ACTIVE_CLIENT}/CLAUDE.md` when looking up an LR.

Update affected skill SKILL.md files to include a note:
> When looking up LRs, check both root `CLAUDE.md` and `clients/${ACTIVE_CLIENT}/CLAUDE.md`.

Alternative: rewrite LR numbers so framework and client don't collide (e.g., client LRs renumber as `LR-ENC-001..012`). Decide in session.

### 5. Validation (no LR lost, no LR duplicated)

Script or manual check:
- Every LR number referenced somewhere in the repo (pipeline scripts, agent prompts, skill files, docs) must resolve to exactly ONE canonical home (framework OR client).
- No LR number appears in both files.

---

## Verification

```
# 1. No LR duplicated between root CLAUDE.md and client CLAUDE.md
diff <(grep -oE 'LR-[0-9]{3}' CLAUDE.md | sort -u) \
     <(grep -oE 'LR-[0-9]{3}' clients/encore/CLAUDE.md | sort -u)
# Expected: completely disjoint sets

# 2. Every LR referenced elsewhere resolves
for lr in $(grep -rhoE 'LR-[0-9]{3}' scripts/ .github/agents/ .claude/skills/ docs/ | sort -u); do
  grep -l "^### $lr" CLAUDE.md clients/encore/CLAUDE.md || echo "MISSING: $lr"
done

# 3. AGENT_SHARED_RULES.md has no encore-specific content
grep -iE '1604|navigator|encoreglobal|TC-LOC' docs/read_only_docs/AGENT_SHARED_RULES.md
# Expected: 0 matches

# 4. AGENT_RULES_ENCORE.md has the extracted encore content
test -f clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md
grep -c '1604' clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md
# Expected: > 0

# 5. Pipeline still runs
npm run pipeline:validate
npm test
```

---

## Out of scope

- Moving actual rule content to scripts (rule text stays in MD files; scripts just reference).
- Parameterizing agent prompts — SP-MT-06.
- Building client packaging — SP-MT-07.

---

## Risks

- **Boundary judgment is fuzzy**: some rules say "Angular form dirty tracking" (sounds framework-generic) but were discovered in Encore-specific scenarios. Default: keep at framework unless the rule names encore-specific UI/features. Review the final split with user before committing.
- **Rule numbering collision**: framework LR-025 and a hypothetical future encore LR-025 would silently overwrite each other in lookup. Recommended: renumber client LRs as `LR-ENC-NNN` OR move to a shared monotonic registry. Decide in session.
- **Skill LR lookups**: skills that do live grep for LR definitions need two-path awareness. Some skills may naively `grep CLAUDE.md` — those break silently. Budget time to audit and update ~12 skills.

---

## Critical files (touch list)

**New**:
- `clients/encore/CLAUDE.md`
- `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md`

**Edited**:
- `CLAUDE.md` (root) — prune LRs, add pointer to client CLAUDE.md
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — prune §12 encore rules, update ownership table paths
- `.claude/skills/*/SKILL.md` for audit/bugfix/reflect/execute/compile-learnings/find-bugs/chain/ultrathink — add two-path LR lookup note

---

## Session checklist

- [ ] Draft the LR split, share with user for review BEFORE committing.
- [ ] Decide numbering scheme (LR-ENC-NNN vs shared monotonic).
- [ ] Extract and move rules one file at a time.
- [ ] Validation steps 1–5 all green.
- [ ] Activity log entry (LR-028, LR-037).
- [ ] Status DONE, move to `plans/done/` (LR-027).
- [ ] `npm run plans:reindex`.
