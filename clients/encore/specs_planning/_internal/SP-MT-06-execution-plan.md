# SP-MT-06 — Execution Plan

> **STALE — DO NOT EXECUTE** (annotated 2026-04-27, V0 APPEND cleanup from PLAN_CC_ANTHROPIC_ALIGNMENT V0-V11 verification)
>
> Authored 2026-04-17 to parameterize `.github/agents/*.agent.md` and `.github/copilot-instructions.md` so the same agent prompts could serve any client. The Copilot eviction work shipped instead — `.github/agents/` and `.github/copilot-instructions.md` were deleted (see `git status` head and `plans/done/PLAN_AUDIT_COPILOT.md`). The parent SUBPLAN_MT_06_PARAMETERIZE_AGENTS.md is in `plans/done/` — the goal (decoupling agent prompts from Encore-specific hardcodes) is satisfied via deletion + Claude Code-native agents at `.claude/agents/*.agent.md`, not via parameterization of GitHub agents.
>
> All internal references below to `.github/agents/*` and `.github/copilot-instructions.md` are pointers to deleted files. Do not consume this plan for execution. Kept on disk as historical context for the SP-MT track.

**Status**: STALE (do not execute)
**Created**: 2026-04-17
**Parent**: `plans/done/SUBPLAN_MT_06_PARAMETERIZE_AGENTS.md`
**Skill-composition plan**: `C:\Users\rutvi\.claude\plans\sp-mt-06-plan-then-execute-composed-barto.md`
**Session override active** (Path A): covers `.github/agents/*.agent.md` free-form edits + `clients/encore/docs/REQUIREMENTS.md` appends.

This is the verified, line-anchored, per-rule-triaged execution plan. The skill-composition plan holds the seed inventory and the adversarial-audit findings; this plan is what /execute consumes.

---

## 1. Context

`/planning` Phase 3 of the approved skill-composition plan. Adversarial audit surfaced 7 findings and the user approved Path A (session override) + 6 non-negotiables (NN-1..NN-6). This plan encodes them as binding.

The key reframe from the seed plan: **most of the session-bootstrap directive work is sync-driven, not free-form editing**. The CONTEXT_LOAD block in [AGENT_SHARED_RULES.md:179-181](../../../../docs/read_only_docs/AGENT_SHARED_RULES.md:179) is the canonical source — extend it there, run `npm run sync:mistakes`, and all 5 pipeline agents pick up the new bootstrap. Only 6 files need free-form edits, and only OUTSIDE their SYNC markers.

### 1.1 Guiding principle (user steering 2026-04-17)

> **"At the end of the day, it works. Where it lives is secondary."**

Encore is the current production client. Functional preservation of encore's pipeline + test suite is the primary acceptance criterion. Architectural cleanliness (where a rule lives, whether an example is fully generic) is secondary. When in doubt during execution:

1. Keep an encore example in place rather than risk losing signal
2. Prefer ADD (new generic directive) over REMOVE (delete encore prose)
3. Every relocated rule MUST remain reachable from the agent prompt via a cross-reference to `AGENT_RULES_${CLIENT}.md`
4. Run an inter-phase smoke (`npm test -- tests/specs/setup/locations/location-notes.spec.ts`) between Phase A, D, and E — not only at the very end

This principle extends beyond SP-MT-06 to SP-MT-07 and any future subplans in the multi-tenant arc: the composed end-state is "encore still green."

---

## 2. SYNC-marker map (NN-3 enforcement)

Verified 2026-04-17 by grep against HEAD. **Every planned edit target is OUTSIDE a SYNC marker.** The /execute step grep-re-checks per-file before the edit lands.

| File | SYNC regions | Planned edits inside SYNC? |
|---|---|---|
| [.github/agents/playwright-requirements.agent.md](../../../../.github/agents/playwright-requirements.agent.md) | CONTEXT_LOAD L95-97 | No — edits at L26, L27, L70, L101, L172, L177, L179 all outside |
| [.github/agents/playwright-test-planner.agent.md](../../../../.github/agents/playwright-test-planner.agent.md) | CONTEXT_LOAD L106-108 | No — edits at L27, L28, L42 outside |
| [.github/agents/playwright-test-generator.agent.md](../../../../.github/agents/playwright-test-generator.agent.md) | CONTEXT_LOAD L120-122 | No — edits at L67, L68, L74, L85, L92, L93, L94 outside |
| [.github/agents/playwright-test-healer.agent.md](../../../../.github/agents/playwright-test-healer.agent.md) | CONTEXT_LOAD L245-247 | No — bootstrap comes via sync from AGENT_SHARED_RULES.md; no direct edit needed |
| [.github/agents/playwright-pipeline-audit.agent.md](../../../../.github/agents/playwright-pipeline-audit.agent.md) | CONTEXT_LOAD L102-104 | No — bootstrap via sync; no direct edit needed |
| [.github/agents/playwright-framework-maintainer.agent.md](../../../../.github/agents/playwright-framework-maintainer.agent.md) | (none) | N/A — fully free-form; edits at L38, L42 |
| [.github/copilot-instructions.md](../../../../.github/copilot-instructions.md) | PIPELINE L161-175, COMMANDS L181-201, NEVER_DO L228-253, MCP_CRITICAL L313-320 | No — edit at L80 (intro, well before first SYNC block at L161) |

---

## 3. Literal-hardcode table (NN-4, re-verified vs HEAD 2026-04-17)

Verified by `Grep` against HEAD. Line numbers current. /execute MUST re-grep immediately before each edit — commits between now and edit will shift lines.

| # | File | Line | Current text (quoted) | Replacement strategy |
|---|---|---|---|---|
| H1 | playwright-requirements.agent.md | 26 | "LOCATION: Office 1604 only. No other location. Ever. Unless user says otherwise." | "LOCATION: Use authorized test locations from `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md#authorized-test-data`. Do not test other locations unless user says otherwise." |
| H2 | playwright-requirements.agent.md | 27 | "URL: ... Pattern: {BASE_URL}locations/1604/settings/local-office. Do NOT guess URLs." | "URL: Copy the EXACT URL path user gives you. Map feature→module via `clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md`. Do NOT guess URLs." |
| H3 | playwright-requirements.agent.md | 70 | REQ-013 example column: "Pricing tab = Radix (div/span/button), Local Info = dt/dd..." | Keep rule kernel; replace example with generic "element-type verification matters because UI libraries (e.g. Radix, Material) use div/span/button not HTML form elements — see client rules for library-specific guidance." Move the Pricing/Local-Info example verbatim to `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md §E-REQ-EXAMPLES`. |
| H4 | playwright-requirements.agent.md | 101 | "browser_navigate to Office 1604 at the exact URL path user provided" | "`browser_navigate` to the authorized URL path user provided (office/location must match `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md#authorized-test-data`)" |
| H5 | playwright-requirements.agent.md | 172 | User example: "Test Location Local Information page. Verify left panel read-only..." | Generic placeholder: "Test `{feature-name}` page. Verify `{specified-behavior}`, make random editable changes, verify save." (Keep the encore variant of this example as a comment block below, tagged "example only — encore-specific".) |
| H6 | playwright-requirements.agent.md | 177 | JSON example `"id": "location-local-information", "feature": "Location - Local Information"` | Generic: `"id": "{module}-{feature}"`, `"feature": "{Module} - {Feature}"`; move the encore concrete example to `AGENT_RULES_ENCORE.md §E-REQ-EXAMPLES`. |
| H7 | playwright-requirements.agent.md | 179 | JSON example `"userNotes": "Office 1604. Random field modifications. Verify save."` | Generic `"userNotes": "Authorized office from REQUIREMENTS.md#authorized-test-data. Random field modifications. Verify save."` |
| H8 | playwright-test-planner.agent.md | 27 | "LOCATION: Office 1604 only..." | Same replacement as H1 |
| H9 | playwright-test-planner.agent.md | 28 | "URL: ... Pattern: {BASE_URL}locations/1604/settings/local-office..." | Same replacement as H2 |
| H10 | playwright-test-planner.agent.md | 42 | "PLN-025: Change field → revert → check Save button state. Document actual behavior. Encore forms stay dirty after revert." | Remove "Encore forms stay dirty after revert." Rule kernel: "Document actual app revert behavior (pristine vs dirty-after-revert varies by framework — see client rules)." Move the "Encore forms stay dirty" finding to `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md §E-FORM-BEHAVIOR`. |
| H11 | playwright-test-generator.agent.md | 67–94 | GEN-008..GEN-035 block | **See §5 per-rule triage table below** (NN-2). NOT wholesale relocation. |
| H12 | playwright-framework-maintainer.agent.md | 38 | MNT-009 example: "OFFICE_NO = '1604' defined identically in 3 specs" | Example becomes: `"AUTHORIZED_OFFICE constant referenced identically in 3 specs (value sourced from clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md#authorized-test-data)"`. |
| H13 | playwright-framework-maintainer.agent.md | 42 | MOD-001 example: "Local Office Settings is NOT part of the Locations module..." | Keep rule kernel (module-boundary enforcement is framework-level). Move the Local-Office-Settings concrete example to `AGENT_RULES_ENCORE.md §E-MODULE-BOUNDARIES`. |
| H14 | copilot-instructions.md | 80 | "Hybrid Playwright TypeScript framework for Navigator Cloud automation." | "Hybrid Playwright TypeScript framework for `${ACTIVE_CLIENT}` web-app automation (see `clients/${ACTIVE_CLIENT}/CLAUDE.md` for product context)." |
| H15 | agent-mistakes.md (registry, not an agent prompt directly) | ALL-013 | "Standard test location: Office 1604 (ID=1604). NEVER use another location unless user EXPLICITLY names a different one" | "Standard test data per `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md#authorized-test-data`. NEVER use other values unless user EXPLICITLY names a different one." After edit, run `npm run sync:mistakes` to propagate. |

---

## 4. Implicit-assumption table (PLAN-G1 enforcement; grep-proof — requires prose change)

| # | File | Where | Implicit assumption | Replacement |
|---|---|---|---|---|
| I1 | AGENT_SHARED_RULES.md | L179-181 (CONTEXT_LOAD SYNC source) | Current one-liner says "Read rules + agent-performance.json + BASE_URL from config" — no directive to read client-scoped context docs | Extend CONTEXT_LOAD to: "(1) Read your rules (inline in agent file). (2) Read `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-performance.json` (trust level, unresolved defects, learning debt). (3) Read `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md`, `clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md`, `clients/${ACTIVE_CLIENT}/CLAUDE.md`, and `clients/${ACTIVE_CLIENT}/docs/read_only_docs/AGENT_RULES_${CLIENT}.md` if present. (4) BASE_URL from config." Then `npm run sync:mistakes` propagates to all 5 pipeline agent files automatically. |
| I2 | playwright-test-generator.agent.md | GEN-008..GEN-035 block | Placement inside the generator agent implies "Angular form patterns = universal healing playbook" | Per-rule triage (see §5). Only GEN-032/GEN-033 fully relocate; 6 rules get rephrased with kernel kept; 25 stay as-is. |
| I3 | playwright-test-planner.agent.md | validation-rule guidance prose | "aria-invalid polling" treated as universal | Rephrase: "poll the error-display mechanism named in `clients/${ACTIVE_CLIENT}/docs/read_only_docs/AGENT_RULES_${CLIENT}.md` (encore uses aria-invalid; other clients may use data-invalid or a CSS class)." |
| I4 | All 6 agent files | top-of-file / workflow | No explicit directive to read `AGENT_RULES_${CLIENT}.md` alongside AGENT_SHARED_RULES.md | Handled via I1 (CONTEXT_LOAD extension) — single fix propagates. |
| I5 | playwright-framework-maintainer.agent.md | MOD-001 text | "the application's module registry" — singular, implicit encore-binding | Bind explicitly: "`clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md`". |
| I6 | playwright-requirements.agent.md | auth intake prose | Downstream assumes SSO = Microsoft, MFA = TOTP | Point agents to REQUIREMENTS.md `## Auth Protocol` anchor (see §7) — auth provider is data, not hardcode. |
| I7 | copilot-instructions.md | §Core intro | Tone/stance assumes single client | Add to intro: "Active client is determined by `ACTIVE_CLIENT` env var. Read `clients/${ACTIVE_CLIENT}/CLAUDE.md` for product context before any work." |

---

## 5. GEN-008 → GEN-042 per-rule triage (NN-2 — user must review BEFORE any edit)

Scope: [playwright-test-generator.agent.md:60-95](../../../../.github/agents/playwright-test-generator.agent.md#L60-L95). 36 rules in the GEN-* table. Each rule classified:

- **framework** — stays in agent prompt as-is. Universal to any web-app automation.
- **encore** — moves fully to `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md`. Literally names Angular/Radix/encore tech.
- **hybrid** — rule kernel stays (rephrased), specific example moves to client rules.

| Rule | One-line summary | Disposition | Reason |
|---|---|---|---|
| GEN-001 | All selectors from src/selectors/index.ts | framework | Code-org rule |
| GEN-002 | Data-driven: data arrays + batch page methods | framework | Architecture |
| GEN-003 | Fixtures only, no constructors | framework | Architecture |
| GEN-004 | typecheck → test → generator:post-complete workflow | framework | Workflow |
| GEN-005 | MCP browser lifecycle discipline | framework | MCP discipline |
| GEN-006 | No placeholder tests | framework | Quality |
| GEN-007 | `--grep "TC-ID"` for single TC during fix | framework | Dev discipline |
| GEN-008 | "Angular form model: always `el.press('Tab')` after `el.fill()`..." | **hybrid** | Kernel: "verify framework fires change events after fill". Encore part (Angular/Tab/inputValue): to client §E-FORM-PATTERNS |
| GEN-009 | "Boundary data verification... Angular disables Save on boundary violation" | **hybrid** | Kernel: type→blur→check before commit. Encore example (Angular disable behavior): to client rules |
| GEN-010 | PowerShell-targeted process cleanup | framework | Dev-env rule |
| GEN-011 | AUTH/INFRASTRUCTURE escalation | framework | Escalation protocol |
| GEN-012 | Pre-classified skip handling | framework | Skip discipline |
| GEN-013 | Manual TC classification | framework | Triage |
| GEN-014 | No framework file edits by generator | framework | File discipline |
| GEN-015 | RCA protocol + "Same-URL goto in Angular may reuse component" | **hybrid** | Kernel generic. Angular-goto example to client rules |
| GEN-016 | Phase 0 execution plan before code | framework | Workflow |
| GEN-017 | RCA reads artifacts in order | framework | RCA discipline |
| GEN-018 | Debug runs = `--grep` only | framework | Debug discipline |
| GEN-019 | Check BasePage before creating methods | framework | DRY |
| GEN-020 | Grep existing fixtures before writing beforeEach | framework | DRY |
| GEN-021 | Report TC conflicts with live DOM | framework | Reporting |
| GEN-022 | Spec-level DRY | framework | DRY (ALL-026 enforcement) |
| GEN-023 | Grep interfaces before creating | framework | DRY |
| GEN-024 | Never hardcode CSS selectors in page objects | framework | Selector discipline |
| GEN-025 | "Combobox: exact match. `:has-text()` is contains" | framework | User decision 2026-04-17: kernel is Playwright-universal. Keep "Administrative Fee / Legal" example in place as encore illustration — a framework rule can cite an encore-specific example without becoming hybrid |
| GEN-026 | "Post-save state reset: reload. Angular dirty-state doesn't reset" | **hybrid** | Kernel: "reload between dirty-tracking-framework tests after save". "Angular dirty-state" wording → client |
| GEN-027 | Selector namespace: check shared.ts before new file | framework | DRY |
| GEN-028 | Accessibility tree element types ≠ HTML tags | framework | Universal (graduated as LR-016) |
| GEN-029 | Verify HTML before role-based selectors | framework | Universal |
| GEN-030 | RCA-FIRST: Kepner-Tregoe IS/IS-NOT analysis | framework | RCA framework |
| GEN-031 | Pipeline gate proposals: no HALT on first run | framework | Pipeline design |
| GEN-032 | "Radix UI Select with 50+ options: retry loop (max 3)..." | **encore** | Explicitly Radix library |
| GEN-033 | "Angular save button disabled ≠ form pristine" | **encore** | Explicitly Angular dirty-state |
| GEN-034 | Never declare completion without running tests | framework | Workflow |
| GEN-035 | "MCP evaluate-based button clicks don't trigger Angular/React save" | **hybrid** | Kernel: framework-aware event triggering. Angular/React examples → client |
| GEN-042 | Duplicate column headers: index-based/adjacent-context access | framework | Generic DOM pattern |

**Totals**: 29 framework (stay) / 2 encore (full relocation) / 5 hybrid (kernel stays, example moves). Final — GEN-025 reclassified framework per user 2026-04-17.

**User review gate**: /execute HALTS before editing `playwright-test-generator.agent.md` until user confirms this table. If user adjusts a disposition, /planning reruns for that rule.

---

## 6. `clients/encore/tests/setup/fixtures.ts` audit (NN-5)

Grep against HEAD 2026-04-17 found SSO/TOTP/Microsoft hardcodes at L142, L172, L184, L187, L189, L200, L204. Also `clients/encore/tests/setup/global-setup.ts:128` has `login.microsoftonline.com` OAuth URL.

**Resolution**: **NO PARAMETERIZATION NEEDED.** The file is already at `clients/encore/tests/setup/fixtures.ts` — client-scoped by path. Microsoft SSO + TOTP is encore's auth flow; it belongs embedded in encore's fixture. Future clients (`clients/acme/tests/setup/fixtures.ts`) will carry their own auth flow.

**Action**: Document this as a design decision in the execution summary. Add one-line comment at top of `fixtures.ts` noting "Client-scoped: encore uses Microsoft SSO + TOTP. Future clients add their own clients/<name>/tests/setup/fixtures.ts." No functional edit to fixtures.ts.

Risk residual: none — fixtures.ts is already correctly isolated. F6 is closed as "discovered no work needed."

---

## 7. REQUIREMENTS.md anchor decision (PLAN-G3)

Current [REQUIREMENTS.md](../../docs/REQUIREMENTS.md) state:
- L11 `## Authentication System` (contains SSO+TOTP detail)
- L62 `### URL Structure` (1604 embedded in example)
- L106 `## Test Data Strategy` (env vars listed, no "Authorized Test Data" section)
- No "Module Naming Conventions" section

**Decision**: Additive. Do NOT rename existing sections (would break external cross-references — e.g. `agent-mistakes.md` may link to `#authentication-system`). Instead:

1. **Add** `## Auth Protocol` section with one-liner + anchor-forward to "Authentication System".
2. **Add** `## Authorized Test Data` section enumerating Office 1604, `NAVIGATOR_USERNAME` variable, authorized client/entity IDs. Pulls from existing `## Test Data Strategy` but makes authorized-values explicit.
3. **Add** `## Module Naming Conventions` section: TC ID format (`TC-LOC-*`, `TC-ECT-*`, `TC-PRC-*`), selector data-testid prefix patterns, file-naming rules. Cross-reference `MODULE_REGISTRY.md`.

Agent prompts reference the NEW anchors. Old references continue to work (nothing removed).

---

## 8. Execution phase plan

### Phase A — canonical source edits (small, low-risk)

A1. **Edit `AGENT_SHARED_RULES.md` CONTEXT_LOAD block** (I1). Not itself a SYNC marker edit; it IS the canonical source. Adds the 4-line client-context bootstrap directive.
A2. **Edit `agent-mistakes.md` registry**: H15 (ALL-013 parameterization).
A3. **Run `npm run sync:mistakes`**: propagates CONTEXT_LOAD to all 5 pipeline agents + ALL-013 update.
A4. **Run `npm run validate:agent-sync`**: confirm no drift after sync.

### Phase B — REQUIREMENTS.md extensions (single file, append-only)

B1. Append `## Auth Protocol`, `## Authorized Test Data`, `## Module Naming Conventions` sections.

### Phase C — client rule file receives relocations

C1. Edit `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` — add sections:
   - §E-FORM-PATTERNS (GEN-008, GEN-009 examples, H10 PLN-025 encore finding)
   - §E-UI-LIBRARY (GEN-032 full rule, H3 REQ-013 Radix example)
   - §E-FORM-BEHAVIOR (GEN-026 Angular wording, GEN-033 full rule)
   - §E-MCP-EVENT-TRIGGERING (GEN-035 Angular/React wording)
   - §E-REQ-EXAMPLES (H5, H6 encore examples)
   - §E-MODULE-BOUNDARIES (H13 Local-Office-Settings example)

### Phase D — free-form agent prompt edits (override-authorized)

Per-file, in order of increasing blast radius. Before each Edit call: grep target file for `SYNC:` and confirm target line is outside any SYNC:START..SYNC:END range (NN-3). If inside → refuse and escalate.

D1. copilot-instructions.md (H14 at L80, intro-paragraph addition from I7)
D2. playwright-framework-maintainer.agent.md (H12 L38, H13 L42)
D3. playwright-requirements.agent.md (H1 L26, H2 L27, H3 L70, H4 L101, H5 L172, H6 L177, H7 L179)
D4. playwright-test-planner.agent.md (H8 L27, H9 L28, H10 L42, I3 prose)
D5. playwright-test-generator.agent.md (H11 per §5 triage: 2 rules full-relocate, 6 rules rephrased, 28 rules untouched)

Between D-steps: `/regression-guard` snapshot of `src/` + `tests/setup/`. Agent prompts don't import code, but the Phase 6 regen test does.

**Inter-phase smoke (functional preservation per §1.1)**:
- After Phase A sync: `npm test -- tests/specs/setup/locations/location-notes.spec.ts` — encore must stay green after CONTEXT_LOAD extension
- After Phase D completes: same smoke — agent prompts changed but encore tests use the live auth flow + fixtures, not agent prompts; must stay green
- HALT if either smoke regresses. Phase E regen is only meaningful if baseline is green.

### Phase E — functional regeneration test (PLAN-G4 + PLAN-G5)

E0. Baseline capture BEFORE any edit (should have been done earlier — verify now):
   - `git stash` guarantees current `location-notes.spec.ts` is untouched during edits
   - Copy current spec to `tmp/baseline/location-notes.spec.ts` (local only, not committed)
   - Record current `npm test -- tests/specs/setup/locations/location-notes.spec.ts` result

E1. Post-edit regeneration: manually drive the pipeline with new prompts:
   - HUNTER (requirements) for "Location Notes tab" — produces requirements JSON
   - GIVER (planner) produces test plan (agents must pull office from REQUIREMENTS.md#authorized-test-data)
   - BUILDER (generator) produces spec — compare to baseline
   - WATCHDOG (audit) reviews

E2. Diff regenerated vs baseline:
   - **Pass**: same TC coverage, same data-testid selectors, same office value (1604 — sourced from REQUIREMENTS.md, not hardcode), green test run
   - **Fail**: any drift → HALT, fix the agent prompt (don't paper over with manual spec edits)

E3. Wider `npm test` to catch regressions elsewhere.

### Phase F — audit + close (PLAN-G5, Phase 7)

F1. `/audit` — read every implicit-assumption row (§4) and GEN-* triage row (§5) against final prompts. Grep = insufficient evidence.
F2. `/reflect` — capture new patterns.
F3. LR-028 activity log entry (timestamp ≥ mtime of every edited file per LR-037).
F4. Update `SUBPLAN_MT_06_PARAMETERIZE_AGENTS.md` execution summary per LR-027. Move to `plans/done/`.
F5. `npm run plans:reindex`.

---

## 9. Verification

```bash
# V1 — No encore hardcodes in agent prompts (outside labeled examples)
grep -rE "1604|Navigator Cloud|Navigator4|encoreglobal|cloudapps-e2e" .github/agents/ .github/copilot-instructions.md
# Expected: 0 matches, or only inside fenced "example (encore-specific)" blocks.

# V2 — Client-scoped context injection in every pipeline agent
grep -c 'clients/\${ACTIVE_CLIENT}' .github/agents/*.agent.md
# Expected: ≥ 5 (one per pipeline agent). Maintainer may be 0 if its MOD-001 example moved to client rules.

# V3 — SYNC in AGENT_SHARED_RULES.md has the bootstrap directive
grep -A5 "SYNC:CONTEXT_LOAD:START" docs/read_only_docs/AGENT_SHARED_RULES.md
# Expected: 4-line bootstrap covering REQUIREMENTS.md + MODULE_REGISTRY.md + CLAUDE.md + AGENT_RULES_${CLIENT}.md

# V4 — Sync propagated cleanly
npm run validate:agent-sync
# Expected: 0 drift

# V5 — REQUIREMENTS.md has the 3 new anchors
grep -cE '^##[[:space:]]+Authorized Test Data|^##[[:space:]]+Auth Protocol|^##[[:space:]]+Module Naming Conventions' clients/encore/docs/REQUIREMENTS.md
# Expected: 3

# V6 — Functional regeneration equivalent
npm test -- tests/specs/setup/locations/location-notes.spec.ts
# Expected: green, diff against tmp/baseline/location-notes.spec.ts functionally equivalent

# V7 — No wider regressions
npm test
# Expected: no regressions beyond pre-existing known-skips

# V8 — Implicit-assumption audit (must read, not grep — NN-3, PLAN-G5)
# For each row in §4: open target file, confirm assumption is gone or properly relocated. Checkbox in /audit output.
```

---

## 10. Critical files touch list (quick-reference)

**Canonical sources (sync-driven)**:
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — CONTEXT_LOAD block (L179-181)
- `clients/encore/specs_planning/_internal/agent-mistakes.md` — ALL-013

**Free-form edits (session override authorized)**:
- `.github/agents/playwright-requirements.agent.md` (7 rows)
- `.github/agents/playwright-test-planner.agent.md` (3 rows + I3 prose)
- `.github/agents/playwright-test-generator.agent.md` (per §5 triage: 2 rules relocate, 6 rephrase)
- `.github/agents/playwright-framework-maintainer.agent.md` (2 rows)
- `.github/copilot-instructions.md` (L80 + I7 intro)

**Client rule extensions**:
- `clients/encore/docs/REQUIREMENTS.md` — 3 new sections
- `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` — 6 new §E- sections receive relocated rules/examples

**Activity log**:
- `clients/encore/specs_planning/_internal/agent-activity-log.md` — 1 row (per LR-028 + LR-037)

**Not touched (documented as deliberate)**:
- `clients/encore/tests/setup/fixtures.ts` — SSO/TOTP hardcodes legitimately client-scoped by path
- `.claude/agents/RUTVIK.agent.md` — repo-internal names (encore_framework/, encoreApi.ts) are SP-MT-08 scope

---

## 11. Gates (all must pass before Phase F close)

- [ ] PLAN-G1: §3 + §4 both populated ✓ (this file)
- [ ] PLAN-G2: every row has a replacement strategy ✓ (no "TBD" in §3 or §4)
- [ ] PLAN-G3: §7 decides REQUIREMENTS.md anchors; Phase B creates them
- [ ] PLAN-G4: Phase E0 captures baseline BEFORE Phase D starts
- [ ] PLAN-G5: Phase F1 /audit reads not greps every §4 + §5 row
- [ ] NN-1: session override logged ✓ (at /identity Step 7 time)
- [ ] NN-2: §5 triage table shown to user for review BEFORE /execute touches generator prompt
- [ ] NN-3: per-file SYNC-marker grep embedded in each D-step
- [ ] NN-4: §3 verified vs HEAD ✓ (this file); re-grep at each D-step start
- [ ] NN-5: §6 closes fixtures.ts as "no work needed, already client-scoped" ✓
- [ ] NN-6: Path C deferred — do not reopen this session
