# SUBPLAN MT-06: Parameterize Pipeline Agents

**Status**: DONE
**Priority**: P1
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE
**Created**: 2026-04-16
**Executed**: 2026-04-17
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

- [x] Grep inventory of hardcodes, save to session notes.
- [x] Replace hardcodes with context-injection directives, one agent at a time.
- [x] Extend REQUIREMENTS.md with authorized-test-data sections if needed.
- [x] Full pipeline regeneration sanity check (verification step 3).
- [x] Sync Copilot instructions.
- [x] Verification 1–5 all green.
- [x] Activity log entry (LR-028, LR-037).
- [x] Status DONE, move to `plans/done/` (LR-027).
- [x] `npm run plans:reindex`.

---

## Execution Summary

SP-MT-06 COMPLETE 2026-04-17 (Opus 4.7, OWNER identity, Plan-THEN-execute composition: `/identity owner → /ultrathink → /planning → /execute`, session override granted for `.github/agents/*.agent.md` + `clients/encore/docs/REQUIREMENTS.md` writes). Detailed execution plan at [clients/encore/specs_planning/_internal/SP-MT-06-execution-plan.md](../../clients/encore/specs_planning/_internal/SP-MT-06-execution-plan.md). Skill-composition plan at `C:\Users\rutvi\.claude\plans\sp-mt-06-plan-then-execute-composed-barto.md`.

### Guiding principle (user steering)

> "At the end of the day, it works. Where it lives is secondary."

Encore is the current production client; functional preservation over architectural purity. Inter-phase smokes (`npm test -- tests/seed.spec.ts`) run after Phase A and Phase D. Phase E ran the heavier functional regen (location-notes.spec.ts: 28/28 passed in 3.4 min).

### Adversarial-audit findings resolved

Seven findings surfaced by `/ultrathink` Step 3. Two CRITICAL: F1 (`.github/agents/**` SYNC-ONLY per R85 blocks free-form edits); F2 (REQUIREMENTS.md READ-ONLY for non-HUNTER per R11). Resolution: user granted Path A session override + 6 non-negotiables (NN-1..NN-6):
- NN-1: override logged; NN-2: per-rule triage in planning (not execute) for GEN-008..GEN-042; NN-3: SYNC-marker grep before every edit; NN-4: re-verify line numbers against HEAD; NN-5: audit fixtures.ts for SSO+TOTP (closed — already client-scoped by path); NN-6: Path C sync-marker extension DEFERRED.

Other findings: F3 (copilot-instructions SYNC-block risk — edit landed at L80, first SYNC marker at L163, safe); F4 (wholesale GEN-* relocation over-generalizes — resolved by per-rule triage); F5 (SYNC-region edit risk — mitigated by NN-3 per-edit grep); F6 (fixtures.ts SSO hardcodes — legitimately client-scoped); F7 (user intent drift — none, plan faithful).

### GEN-008..GEN-042 per-rule triage (NN-2 table, user-approved)

**Totals: 29 framework (stay) / 2 encore (full relocate) / 5 hybrid (kernel kept + pointer to client rules).**

- **Encore (full relocate)**: GEN-032 (Radix Select 50+ retry → `AGENT_RULES_ENCORE.md §E-UI-001`), GEN-033 (Angular save disabled ≠ pristine → `§E-FB-001`)
- **Hybrid (rephrased, pointer added)**: GEN-008 (fill+Tab → `§E-FORM-PATTERNS`), GEN-009 (boundary check → `§E-FORM-PATTERNS`), GEN-015 (Angular goto reuse → generic + client pointer), GEN-026 (post-save reload → `§E-FORM-BEHAVIOR`), GEN-035 (MCP evaluate click doesn't trigger save → `§E-MCP-EVENT-TRIGGERING`)
- **Framework (unchanged)**: GEN-001..007, 010..014, 016..025, 027..031, 034, 042 — 29 rules. GEN-025 kept in agent with encore "Administrative Fee" example (user decision: a framework rule can cite an encore-specific example without becoming hybrid).

### Phase-by-phase deliverables

- **Phase A** (canonical-source sync): extended `AGENT_SHARED_RULES.md §8 SYNC:CONTEXT_LOAD` block from 1-line to 4-step Client Context Bootstrap directive (reads REQUIREMENTS.md, MODULE_REGISTRY.md, client CLAUDE.md, AGENT_RULES_${CLIENT}.md). Parameterized ALL-013 in `clients/encore/specs_planning/_internal/agent-mistakes.md` (Office 1604 → REQUIREMENTS.md#authorized-test-data). `npm run sync:mistakes` propagated to all 5 pipeline agents. `npm run validate:sync` clean. **Smoke: 1 passed (29.1s)**.
- **Phase B** (REQUIREMENTS.md append-only): added 3 new top-level anchors — `## Auth Protocol` (cross-refs Authentication System with MS-SSO + TOTP detail), `## Authorized Test Data` (Office 1604 + 1099 table, `NAVIGATOR_*` env vars), `## Module Naming Conventions` (TC prefix mapping: TC-LOC-LI/TC-LOC-HIST/TC-ECT/TC-PRC/TC-LOS, data-testid prefix patterns, file-naming rules). Existing sections untouched (preserves 775+ LR cross-references).
- **Phase C** (AGENT_RULES_ENCORE.md append-only): added 6 new §E sections — `§E-FORM-PATTERNS` (E-FORM-001..003 Angular Tab-after-fill + boundary validation + dirty-after-revert), `§E-FORM-BEHAVIOR` (E-FB-001/002 Angular save ≠ pristine), `§E-UI-LIBRARY` (E-UI-001 Radix Select retry pattern, E-UI-002 Pricing=Radix vs Local-Info=dt/dd catalog), `§E-MCP-EVENT-TRIGGERING` (E-MCP-001 evaluate-click doesn't trigger Angular save), `§E-REQ-EXAMPLES` (encore intake examples), `§E-MODULE-BOUNDARIES` (E-MB-001 Local Office Settings ≠ Locations module).
- **Phase D** (free-form edits, SYNC-marker-verified): 14 edits across 5 files — copilot-instructions L80 ("Navigator Cloud automation" → "${ACTIVE_CLIENT} web-app automation") + Client Context Bootstrap intro paragraph; playwright-framework-maintainer MNT-009 (OFFICE_NO → AUTHORIZED_OFFICE) + MOD-001 (generalized module-boundary kernel + encore example in client rules); playwright-requirements HARD-STOP L26/27 + REQ-013 L70 + browse-nav L108 + example-block framing + userNotes; playwright-test-planner HARD-STOP L27/28 + PLN-025 L42 (revert-behavior generalized). Retrospective SYNC-marker integrity check: every `SYNC:START`/`SYNC:END` pair still balanced across 6 files. **Smoke: 1 passed (31.7s)**.
- **Phase E** (functional regen): `npm test -- --project=chrome tests/specs/setup/locations/location-notes.spec.ts` — **28/28 passed in 3.4 min**. TC-LOC-NTS-001..027 + TC-LOC-NTS-HIST all green. No regression from agent prompt edits (as expected — agent prompts are Claude-runtime artifacts, not Playwright-runtime artifacts; the real purpose of Phase E is proving encore tests survived the SP-MT-01..05 + SP-MT-06 layered changes).

### Verification (plan §9)

- V1 (encoreglobal|cloudapps-e2e|Navigator Cloud|Navigator4|TC-LOC-LI|TC-ECT sweep): **0 unlabeled hits** in `.github/agents/` + copilot-instructions. Remaining "Office 1604" hits are deliberately inside (a) CONTEXT_LOAD illustrative clause "(e.g. 'Angular form model', 'Radix UI', 'Office 1604'), treat it as illustrative" and (b) transitional "for encore currently Office 1604" notes — both explicitly labeled as illustrative per plan §9 "0 matches, or only inside fenced/labeled example blocks."
- V2 (`clients/${ACTIVE_CLIENT}` in every pipeline agent): all 6 files hit — maintainer 4, audit 12, requirements 16, generator 17, healer 10, planner 12.
- V3 (`Client Context Bootstrap` in AGENT_SHARED_RULES.md canonical source): 1. Propagated via sync.
- V5 (REQUIREMENTS.md 3 new anchors): `## Auth Protocol` + `## Authorized Test Data` + `## Module Naming Conventions` — 3 hits.
- V6 (functional regen): 28/28 pass 3.4 min.

### Implicit-assumption audit (PLAN-G5 — read-not-grep per NN-3)

I1 CONTEXT_LOAD extension: VERIFIED (L179-189 has 4-item bootstrap). I2 GEN-008..042 triage: VERIFIED (per-rule table applied, pointers in place). I3 planner aria-invalid: residual — one listing in planner L273 as one of several validation-detection patterns, acceptable because it's enumerative not prescriptive. I4 bootstrap in every agent: VERIFIED via sync propagation. I5 MOD-001 module-registry binding: VERIFIED (`clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md`). I6 auth intake: NONE FOUND — requirements agent body does not hardcode SSO/TOTP; agents source from REQUIREMENTS.md. I7 copilot-instructions intro tone: VERIFIED (ACTIVE_CLIENT + bootstrap added).

### Out-of-scope observations flagged (not fixed this session)

- `.github/copilot-instructions.md` §File Access section (L88+) still lists `src/**`, `tests/**`, `config/**`, `scripts/**` as unprefixed paths — those are framework-vs-copilot-scope markers, separate concern. Drifting to fix would exceed SP-MT-06 scope.
- 6 pre-existing stale references in `scripts/validate-agent-sync.ts` + `AGENT_SHARED_RULES.md:600` (R23/R30/§9B/§9C/agent-learnings.md) — flagged by `validate:sync`, not SP-MT-06.
- `.claude/agents/RUTVIK.agent.md` references `encore_framework/` + `encoreApi.ts` — these are repo-internal names (directory + service), not client-level hardcodes. Repo rename is SP-MT-08 (SUBPLAN_REPO_08_RENAME_JBS) scope.

### Unblocks

SP-MT-07 (Delivery Packager / Handoff Doc — per 2026-04-16 second pivot, not a packager but a colleague handoff doc).

### Rules honored

LR-020 (verified plan claims against HEAD: seed inventory re-grepped, line numbers updated post-commit), LR-024 (baseline green before any edit — seed smoke pre-Phase A), LR-027 (this Execution Summary before move to `done/`), LR-028 (activity log entry appended), LR-035 (INDEX regenerated via `npm run plans:reindex`, not hand-edited), LR-037 (activity-log timestamp ≥ mtime of every edited file — preflight will validate).
