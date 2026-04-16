# SUBPLAN MT-06: Parameterize Pipeline Agents

**Status**: PENDING
**Priority**: P1
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE
**Created**: 2026-04-16
**Depends on**: SP-MT-05 (client rule files exist for agents to reference)
**Blocks**: SP-MT-07 (packaging needs agents that don't bake in encore)

---

## Goal

Remove encore-specific hardcodes from `.github/agents/*.agent.md` and `.claude/agents/*` so the same agent prompts serve any client. Agents read the active client's REQUIREMENTS.md, MODULE_REGISTRY.md, and CLAUDE.md at session start and load product context from there instead of from embedded rules.

---

## Scope

### 1. Scan for hardcodes

Grep surface:
- `.github/agents/playwright-requirements.agent.md`
- `.github/agents/playwright-test-planner.agent.md`
- `.github/agents/playwright-test-generator.agent.md`
- `.github/agents/playwright-test-healer.agent.md`
- `.github/agents/playwright-pipeline-audit.agent.md`
- `.github/agents/playwright-framework-maintainer.agent.md`
- `.github/copilot-instructions.md`
- `.claude/agents/RUTVIK.agent.md`
- `.claude/agents/COLLEAGUE.agent.md` (likely already generic; verify)

Known hardcodes to remove (per exploration):
- Office 1604 references (planner rule)
- "Navigator Cloud" product name
- `cloudapps-e2e.encoreglobal.com` URL
- "Location Settings", "Local Office Settings" module names in rule examples
- `TC-LOC-LI-*`, `TC-ECT-*` test ID patterns
- "Microsoft SSO / TOTP" auth assumptions
- Encore form dirty behavior assumptions (those belong in client CLAUDE.md now)

### 2. Replacement strategy — context injection

At the TOP of each agent prompt, add:
> **Session bootstrap**: Before doing any work, read the active client's context:
> 1. `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md` — product requirements
> 2. `clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md` — page/module map
> 3. `clients/${ACTIVE_CLIENT}/CLAUDE.md` — client-specific learning rules
> 4. `clients/${ACTIVE_CLIENT}/docs/read_only_docs/AGENT_RULES_ENCORE.md` (or equivalent per-client rules)

Replace specific hardcodes:
- "Office 1604 only" → "Use only the office/location identifiers listed in `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md#authorized-test-data` (Requirements doc must enumerate authorized values)."
- "Navigator Cloud" → "the active client's application (see `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md`)."
- URL hardcodes → removed; agents read BASE_URL from `clients/${ACTIVE_CLIENT}/config/environments/.env.{env}`.
- Test ID patterns → remove example patterns; each client's MODULE_REGISTRY owns its naming convention.

### 3. Update `clients/encore/docs/REQUIREMENTS.md` to carry authorized test data

SP-MT-06 requires the client requirements doc to be AUTHORITATIVE for data that was previously hardcoded in agents. Audit and, if necessary, add:
- Section: "Authorized Test Data" listing office numbers, user accounts, client entity IDs allowed in tests.
- Section: "Auth Protocol" specifying SSO provider, MFA type, session model.
- Section: "Module Naming Conventions" specifying TC ID format, selector prefix conventions.

If current REQUIREMENTS.md lacks these, this subplan adds them (with user confirmation of the authoritative values).

### 4. Per-client agent-rule extension (design, don't implement)

Document an extension point in the agent prompts:
> If the active client has `clients/${ACTIVE_CLIENT}/.agent-rules/*.md`, read those in ADDITION to the baseline agent rules.

No directory created in SP-MT-06 unless encore genuinely needs one. This is scaffolding for future clients.

### 5. Sync Copilot instructions

`npm run sync:copilot` (if it exists) or manual sync of `.github/copilot-instructions.md` to mirror `.github/agents/*.agent.md` changes.

---

## Verification

```
# 1. No encore hardcodes in agent prompts
grep -rE "1604|Navigator Cloud|encoreglobal|TC-LOC-LI|TC-ECT" .github/agents/ .github/copilot-instructions.md .claude/agents/
# Expected: 0 matches (or matches only inside example text clearly labeled as "example only")

# 2. Agents reference client-scoped context
grep -c 'clients/\${ACTIVE_CLIENT}' .github/agents/*.agent.md
# Expected: ≥ 6 (one per agent)

# 3. Full pipeline regeneration of one module from scratch
#    Pick a small existing spec (e.g., clients/encore/tests/specs/setup/locations/location-notes.spec.ts).
#    Run: requirements:pre-run → planner:pre-run → generator:pre-run → audit:pre-run chain.
#    Generated artifacts should reference encore data (Office from REQUIREMENTS.md, not hardcoded 1604).
#    Compare generated spec to current file — functionally equivalent.

# 4. Tests still green
npm test

# 5. REQUIREMENTS.md has authorized test data section
grep -c '^#.*Authorized Test Data\|^#.*Auth Protocol' clients/encore/docs/REQUIREMENTS.md
# Expected: ≥ 2
```

---

## Out of scope

- Building the actual second-client scaffold (clients/acme/) — future work.
- Re-running the full production pipeline to regenerate ALL specs — only one module is used as a sanity check.
- Renaming existing encore test IDs (leave as-is; new conventions apply to future work).

---

## Risks

- **Implicit assumptions survive grep**: "SSO always uses TOTP" isn't a literal string but is an embedded assumption. Mitigation: the full pipeline regeneration test (verification step 3) exercises the real path and catches behavioral regressions.
- **REQUIREMENTS.md completeness**: agents rely on it being authoritative. If it's missing info (e.g., authorized offices), the refactor surfaces that gap. May extend session to fill gaps.
- **Copilot sync drift**: if `.github/copilot-instructions.md` is manually-edited elsewhere, we may stomp human changes. Review diff carefully.
- **Client-specific healing rules**: LR-025 (Radix retry), LR-026 (Angular dirty state) are encore UI behaviors but agents may have inlined them as general healing heuristics. SP-MT-05 puts them in client CLAUDE.md; SP-MT-06 ensures agents look up there rather than having embedded copies.

---

## Critical files (touch list)

**Edited**:
- `.github/agents/playwright-requirements.agent.md`
- `.github/agents/playwright-test-planner.agent.md`
- `.github/agents/playwright-test-generator.agent.md`
- `.github/agents/playwright-test-healer.agent.md`
- `.github/agents/playwright-pipeline-audit.agent.md`
- `.github/agents/playwright-framework-maintainer.agent.md`
- `.github/copilot-instructions.md`
- `.claude/agents/RUTVIK.agent.md` (if encore-scoped content)
- `clients/encore/docs/REQUIREMENTS.md` (add sections if missing)

**New**: none (unless extension-point rules directory becomes useful).

---

## Session checklist

- [ ] Grep inventory of hardcodes, save to session notes.
- [ ] Replace hardcodes with context-injection directives, one agent at a time.
- [ ] Extend REQUIREMENTS.md with authorized-test-data sections if needed.
- [ ] Full pipeline regeneration sanity check (verification step 3).
- [ ] Sync Copilot instructions.
- [ ] Verification 1–5 all green.
- [ ] Activity log entry (LR-028, LR-037).
- [ ] Status DONE, move to `plans/done/` (LR-027).
- [ ] `npm run plans:reindex`.
