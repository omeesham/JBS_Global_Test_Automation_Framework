# Encore Framework Memory

## Canonical Home Per Knowledge Type (P4.1 — SP-CCE-05 2026-04-27)

| Type | Where it lives | Why |
|---|---|---|
| User preferences / corrections / style | auto-memory `feedback_*.md` (this directory) | Cross-session preference layer |
| Framework rules (`LR-NNN`) | `.claude/rules/<topic>.md` (path-scoped, repo) | Single source of truth post-SP-CCE-02; cross-cutting in `docs/read_only_docs/LEARNED_RULES.md` |
| Client / project facts (Encore product, business rules) | `clients/encore/CLAUDE.md` | Active-client scope; not a user preference |
| External-system pointers (Linear, Slack, Grafana) | auto-memory `reference_*.md` | Cross-session URL/board pointers |
| User identity / vision (private contract) | auto-memory `user_*.md` | Identity facts; vision sits above skills/rules |
| Stale project facts / completed KT artifacts (>30d, non-preference) | auto-memory `_archive/` | History preservation; not loaded as live state |

**Audit cadence**: every `/compile-learnings` run dedupes feedback against `.claude/rules/*.md` and archives stale non-preference files >30d-idle. Last audit: 2026-04-27 (SP-CCE-05 archived 11 files, 70→59 active, ~192K→~122K bytes).

## Project Overview
- Playwright TypeScript test automation framework for Navigator4 (Microsoft SSO authenticated web app)
- 5-agent pipeline: Requirements → Planner → Generator → Healer → Pipeline Audit
- Sub-agent prompts at `.claude/agents/{ROLE}.md` (model-agnostic, post-Copilot-eviction)
- Shared rules in `docs/read_only_docs/AGENT_SHARED_RULES.md`; client-specific in `clients/encore/CLAUDE.md`

## User Preferences (auto-memory layer)
- `feedback_no_readiness_questions.md` — On `/execute SUBPLAN_*`: no readiness questions, run adversarial audit silently
- `feedback_save_plan_location.md` — every plan ends up in repo (`plans/pending/` or `plans/done/`); `~/.claude/plans/` scratch dir is transient, never the only home (escalated 2026-05-07)
- `feedback_question_quality.md` + `feedback_question_style.md` — questions are HIGH-IMPACT STEERING only, plain English, non-technical
- `feedback_planning_workflow.md` + `feedback_execute_audit_discipline.md` — `/planning` + `/execute` + `/audit` skill discipline
- `feedback_skill_routing.md` — always use the right skill for the task type
- `feedback_screenshot_all_items.md` — every red box / circle / highlight in a screenshot is a requirement
- `feedback_preference_pattern_learning.md` — 3+ repetitions = save once, slop-free, minimal
- `feedback_self_first_research.md` — introspect → repo → Rovo/Jira/Confluence → web → Rutvik (Rovo step added 2026-06-22 per LR-063/LR-ENC-004)

## SUPREME RULE — NEVER ASSUME (2026-03-13)
Claude must NEVER assume anything. Workflow order: **REMEMBER → ASK → AUDIT → EXECUTE**. Up to 10+ questions for complex tasks before execution. Every ambiguity = ASK FIRST. Permanent.

## Session Execution Discipline (2026-03-13)
1. Context isolation per task — fresh slate per task, forget irrelevant residue
2. Execute each task independently
3. Post-execution audit re-reads original context per task; runs 3-step RCA (Where/Why/How/Who/What-online/How-to-help) on every mismatch
4. Ultrathink criticism, no laziness, no assumptions — judge-level scrutiny

## UX & Product Principles (2026-03-13)
- "Easy to use, simple to understand" — UX is god
- Everything configurable by super admin (cascading permissions)
- Progressive disclosure (more privileges → more visibility)
- Users are "dumb": minimal input, max AI, card+button UX over typing
- Cost visibility: configurable per client by super admin

## User Identity
- Name is **Rutvik** (Windows username "rutvi" is truncated) → [user_name.md](user_name.md)

## Guiding Vision (2026-04-24) — private contract
- 10 teachings from Rutvik that sit above skills/rules/tasks. Conflict → vision wins. Repo mirror at `.claude/private/guiding-vision.md`. → [user_vision.md](user_vision.md)

## Constraint Discipline
- Never rationalize bypassing user constraints (plan mode, ask-perms, scope, "stop", no-commit) → [feedback_respect_plan_mode.md](feedback_respect_plan_mode.md)
- HALT for scope/ambiguity, NOT for 1-line obvious fixes — fix-and-log; checkpoint at end of work block → [feedback_halt_discipline.md](feedback_halt_discipline.md)
- Identity-switch protocol: clean re-load mid-session, not override → [feedback_identity_switch_protocol.md](feedback_identity_switch_protocol.md)
- No rush at session end: full skill discipline in TodoWrite for deferred follow-ups → [feedback_no_rush_at_session_end.md](feedback_no_rush_at_session_end.md)
- Strict plan lines (zero/all-N/every/100%) → HALT-and-ask, do NOT rescope via APPEND → [feedback_strict_plan_lines_halt_not_rescope.md](feedback_strict_plan_lines_halt_not_rescope.md) — pairs with framework LR-046 in `.claude/rules/pipeline.md`
- Track every plan-deviation during /execute; emit consolidated what+why summary before /final-q so user can audit each decision → [feedback_plan_deviations_log.md](feedback_plan_deviations_log.md)
- Restructure plans MUST enumerate stale-slop cleanup IN-SCOPE (never defer to "discover later" subplans) → [feedback_restructure_plans_include_cleanup.md](feedback_restructure_plans_include_cleanup.md) — pairs with framework LR-050 in `.claude/rules/pipeline.md`
- Closure-gate denies Status flip with TRUNCATED error — verify Depends-on / skill cites via `--content-from-stdin` dry-run BEFORE flip attempt → [feedback_closure_gate_verify_paths_first.md](feedback_closure_gate_verify_paths_first.md)
- Deliberately-failing TC (no fixme) is user-authorized when failure = upstream-bug-report evidence vehicle (LR-ENC-001 baseline-truth → e2e bug pattern) — see file for 3-clause applicability gate (a)+(b)+(c) → [feedback_failing_TC_as_bug_evidence_vehicle.md](feedback_failing_TC_as_bug_evidence_vehicle.md)

## Encore Project Facts
- `RutviK-JBS/encore_deliverables_test` is a dry-run mock for testing git ship actions; real ship to client goes via JBS colleagues outside git (not Rutvik, not Claude) → [project_encore_deliverable_channel.md](project_encore_deliverable_channel.md)
- Harvest MCP wired up (local scope, Encore-only) — for publishing timesheets + CSV export, on request only → [project_harvest_timesheet_mcp.md](project_harvest_timesheet_mcp.md)
- "Login to Claude" customer-compute QA integration — sandbox at `projects/intelliqe-sandbox/`; P0-P4 + 22-bug re-audit fixed, **Windows SEA .exe installer built+tested**, macOS authored (handoff), 124 AUTO checks green → [project_login_to_claude_sandbox.md](project_login_to_claude_sandbox.md)

## Walk & Audit Evidence
- DOM walk sessions must produce dated `walk-evidence-<module>-<YYYY-MM-DD>.md` at `specs_planning/_internal/` → [feedback_walk_evidence_artifacts.md](feedback_walk_evidence_artifacts.md)
- Consult walk-evidence / field-inventories / neutral-eye-audits / test-cases BEFORE asking clarifying questions other agents already answered → [feedback_consult_artifacts_before_asking.md](feedback_consult_artifacts_before_asking.md)

## Bug & Spec Discipline (Apr 2026)
- Never lazily SKIP tests — test the ERROR condition → [feedback_skip_discipline.md](feedback_skip_discipline.md)
- ALWAYS run individual specs after fixing before full suite → [feedback_always_run_individual_first.md](feedback_always_run_individual_first.md)
- Pattern learning cycle: every bug = sweep codebase for similar instances → [feedback_bug_pattern_learning.md](feedback_bug_pattern_learning.md)
- Discussion-item triage: empty-everywhere + no-UI-path + no-Jira = FLAG, don't file → [feedback_discussion_item_not_bug.md](feedback_discussion_item_not_bug.md)
- HIST per-column tests: content-anchored row lookup (getRowsSinceTimestamp + find by encoding pattern), not getColumnByIndex(0, N) — shared save handler interleaves rows → [feedback_history_content_anchored_lookup.md](feedback_history_content_anchored_lookup.md)

## RCA Discipline (Apr 2026)
- Read failure artifacts BEFORE re-running specs → [feedback_read_artifacts_before_rerun.md](feedback_read_artifacts_before_rerun.md)
- Clean artifacts + run fresh BEFORE RCA (LR-024) → [feedback_clean_before_rca.md](feedback_clean_before_rca.md)
- Don't over-plan spec fixing — run, observe, RCA from evidence, fix → [feedback_spec_fixing_no_overplan.md](feedback_spec_fixing_no_overplan.md)
- Angular save button disabled ≠ form pristine; clickTab handles Unsaved dialog → [feedback_angular_save_dirty_race.md](feedback_angular_save_dirty_race.md)
- Clean run = verified-clean (test:cli, confirm dirs gone); report counts only from deduped summary.json confirmed to be THIS run — never assume cleaned, never quote stale stdout → [feedback_clean_full_run_integrity.md](feedback_clean_full_run_integrity.md)

## Sonnet Execution
- Sonnet max = file edits, spec writing, page objects (deterministic). Opus = MCP, RCA, browser interaction (adaptive) → [feedback_sonnet_task_split.md](feedback_sonnet_task_split.md)

## Browser Tool (LR-038 v2)
- Default = Playwright CLI. Chrome only on named rows (visual/CSS, fresh MFA, explicit `pause:` step). "Auth-heavy" repeat sessions and "user-reads-verdict-later" do NOT qualify for Chrome → [feedback_browser_tool_selection.md](feedback_browser_tool_selection.md)
- Verify DOM via JS before pivoting (Angular unfocused format ≠ actual value) → [feedback_browser_interaction_verify_first.md](feedback_browser_interaction_verify_first.md)
- `playwright-cli` installed GLOBALLY (`npm ls -g`, not project node_modules); one `state-load encore-state.json` auths BOTH e2e+nav2 (MS-SSO cookie bridge, no nav2-state.json); Sonnet/Opus subagents 1M-credit-gated → only Haiku spawns → [reference_playwright_cli_and_subagent_limits.md](reference_playwright_cli_and_subagent_limits.md)

## Handoff Discipline (Apr 2026)
- Opus handoffs go in CHAT only, never in repo files → [feedback_handoff_in_chat_only.md](feedback_handoff_in_chat_only.md)
- Never hand off errors/blockers AND never trust received ones (LR-039) → [feedback_handoff_no_blockers.md](feedback_handoff_no_blockers.md)

## Plan / Subplan Authoring
- Bootstrap block at top of EVERY subplan → [feedback_bootstrap_in_subplans.md](feedback_bootstrap_in_subplans.md)
- PermissionMode tag matches plan type → [feedback_plan_permissionmode_tag.md](feedback_plan_permissionmode_tag.md)
- Rutvik's reused "no cut corners / full identity sweep / feel free for subplans / /review /audit" prompt is general boilerplate — extract intent for task size; non-negotiables = full 7-identity coverage (zero `(skipped)` cells) + no code-level mistakes (verify paths/counts vs live tree); don't auto-split small tasks → [feedback_general_quality_prompt_intent.md](feedback_general_quality_prompt_intent.md)
- Before renumbering "gaps", verify each gap's CAUSE (deleted vs relocated-to-another-sheet) — relocated cases keep old IDs; naive renumber mints duplicates → [feedback_renumber_verify_gap_cause.md](feedback_renumber_verify_gap_cause.md)

## Enforcement Discipline (Apr 2026)
- Handoffs must execute code, not re-plan → [feedback_execute_not_over_plan.md](feedback_execute_not_over_plan.md)
- Embed at point of action, never separate rules list → [feedback_embed_not_reference.md](feedback_embed_not_reference.md)
- Stop guessing after 2 failures — switch to evidence-based RCA → [feedback_stop_guessing.md](feedback_stop_guessing.md)
- "ultrathink" = `/ultrathink` skill auto-routes → [feedback_ultrathink_enforcement.md](feedback_ultrathink_enforcement.md)
- Copilot can't enforce framework — pipeline runs on Claude Code → [feedback_copilot_vs_claude_code.md](feedback_copilot_vs_claude_code.md)
- Self-review must cross-check claims vs artifacts (LR-042 evidence-emission) → [feedback_claim_vs_artifact_crosscheck.md](feedback_claim_vs_artifact_crosscheck.md)
- In do-or-die Workflow audits, a synthesis agent can auto-refute real skeptic DEFECTs (even with categorically-false claims) → manually read every overturned `file:line` before accepting the verdict; synthesis ≠ oracle (AUD-017 extension) → [feedback_verify_synthesis_refutations.md](feedback_verify_synthesis_refutations.md)
- No hardcoded env values (currency/locale/office) in selector files — per-context entries match currency.ts pattern → [feedback_no_hardcoded_env_in_selectors.md](feedback_no_hardcoded_env_in_selectors.md)
- OWNER edits to pipeline-owned paths still need an activity-log row (LR-028 keys on FILES, not agent identity) → [feedback_owner_activity_log.md](feedback_owner_activity_log.md)
- Override cannot convert missing evidence into evidence — authorize honest classification of gathered evidence, never launder missing artifacts / phantom handoffs / unmet strict lines → [feedback_override_cannot_convert_missing_to_evidence.md](feedback_override_cannot_convert_missing_to_evidence.md)
- Deliverable push MUST be hard-gated on the deny-list exit code (run verify-no-forbidden on a CLEAN `git archive HEAD` extract, not a node_modules/.git-polluted scratch); never echo-and-continue → [feedback_gate_push_on_denylist.md](feedback_gate_push_on_denylist.md)

## Verification & Real-E2E Discipline (2026-06-18 — graduated LR-059)
- NO "works/verified/tested/green" claim for an integration feature without driving the REAL counterpart end-to-end; a self-built sim that obeys your own new protocol is circular + hides version-skew false greens → [feedback_real_verification.md](feedback_real_verification.md) + framework **LR-059** in `docs/read_only_docs/LEARNED_RULES.md`
- Parity/equivalence proofs run BLIND + full — new system (and delegated workers) never see the answer-key; form your own result first, then diff; no tweaking for forced success; diff on stable features not volatile IDs → [feedback_blind_parity_proof.md](feedback_blind_parity_proof.md)
- Agent/connector lifecycle (disconnect/remove/revoke) = SERVER-authoritative: server forgets immediately, UI reflects at once, the agent detects deregistration and stands down; never make user-visible state wait on the agent confirming → [feedback_server_authoritative_lifecycle.md](feedback_server_authoritative_lifecycle.md)
- Apply the UX vision (progressive disclosure / contextual actions / optimistic feedback / terminal confirmation) to EVERY UI proactively, unprompted → [feedback_apply_ux_vision_to_every_ui.md](feedback_apply_ux_vision_to_every_ui.md)
- An audit/bug-hunt recommendation can conflict with EXISTING designed behavior — verify against tests/architecture before implementing, or you ship a regression breaking a tested feature (BUG-040 register-binding broke the designed multi-connector + per-connector-token isolation; reverted after RTE-02a went red). Distinguish "test encodes OLD bug I fixed → update test" from "test encodes DESIGNED behavior → revert my change". → [feedback_verify_recommendations_vs_design.md](feedback_verify_recommendations_vs_design.md)

## End-Day Reporting Skill Feedback
- **V4 default style (2026-05-15)**: meeting-defense format — professional plain English, vibe+tech 2-part sentences, real Encore module names, NO packaging mechanics / customer-neutral framing / internal codes → [feedback_endday_v4_default_meeting_safe.md](feedback_endday_v4_default_meeting_safe.md)
- **Strip agent/framework/process language at SENTENCE-TOPIC level (2026-05-26)**: word-level kill-list isn't enough — every line's TOPIC must be human-QA output (module walks, test adds, bugs, runs, findings), NOT internal-process/agent-mechanic. Coverage shortfall on internal-heavy days is OK. → [feedback_endday_strip_agent_framework_language.md](feedback_endday_strip_agent_framework_language.md)
- **Cross-day contradictions audit (mandatory before emit)**: multi-day batches must pass 8-pattern audit; reviewers read blind → [feedback_endday_contradictions_audit.md](feedback_endday_contradictions_audit.md)
- **Pacing ≠ license to lie**: pacing constraints scope breadth (drops), not invent missing themes → [feedback_pacing_constraint_vs_truth.md](feedback_pacing_constraint_vs_truth.md)
- Older feedback (still active layered under V4): Specific, not generic; phase-level not enumerated; honesty + Encore-only scope; multi-source data; client-bespoke framing; stay BEHIND reality; never overstate scope; Shield/Armor toggle; no-lies/more-detail toggles; plain-English + plan-ID strip
- → [feedback_endday_specificity.md](feedback_endday_specificity.md), [feedback_endday_composition.md](feedback_endday_composition.md), [feedback_endday_simplify.md](feedback_endday_simplify.md), [feedback_endday_honesty_scope.md](feedback_endday_honesty_scope.md), [feedback_endday_data_sources.md](feedback_endday_data_sources.md), [feedback_endday_hide_multitenant.md](feedback_endday_hide_multitenant.md), [feedback_endday_stay_behind_reality.md](feedback_endday_stay_behind_reality.md), [feedback_endday_no_overstating_scope.md](feedback_endday_no_overstating_scope.md), [feedback_reporting_shield_and_armor.md](feedback_reporting_shield_and_armor.md), [feedback_reporting_toggles.md](feedback_reporting_toggles.md), [feedback_plain_english_reporting.md](feedback_plain_english_reporting.md), [feedback_encore_questions_compact.md](feedback_encore_questions_compact.md)

## Questionnaire / Decision Mode
- Decision Mode for plan/scope/vision scenarios → [feedback_questionnaire_decision_mode.md](feedback_questionnaire_decision_mode.md)

## Debugging (legacy IntelliQE/preview-era — kept for cross-product reference)
- Verify on live preview, not curl alone → [feedback_verify_on_preview.md](feedback_verify_on_preview.md)
- Trace error path UI→network→backend, don't hypothesize → [feedback_debug_methodology.md](feedback_debug_methodology.md)
- Windows cross-spawn arg limitation, pipe via stdin → [feedback_windows_cli_args.md](feedback_windows_cli_args.md)
- preview_start reused ≠ alive → [feedback_preview_reuse_check.md](feedback_preview_reuse_check.md)
- Real verification = full user journey → [feedback_real_verification.md](feedback_real_verification.md)
- Chat must NEVER be blocked by cards/forms → [feedback_chat_not_blocked.md](feedback_chat_not_blocked.md)

## Misc Preferences
- Direct communication, no BS; trusts autonomous execution; prefers minimal code; never delete reports/results without asking → [feedback_dont_destroy_user_data.md](feedback_dont_destroy_user_data.md)
- Professional, profanity-free wording in authored artifacts (plan names/titles/docs); don't sweep existing repo profanity unasked → [feedback_professional_wording_no_profanity.md](feedback_professional_wording_no_profanity.md)
- Report commands: `npm run report` (last only), `npm run allure:report` (all history) → [feedback_report_commands.md](feedback_report_commands.md), [feedback_allure_accumulates.md](feedback_allure_accumulates.md)
- No token-burn on rediscovery: persist solved workflows as runbooks (≤80 lines), gitignored if internal. First example: `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` → [feedback_no_token_burn_on_rediscovery.md](feedback_no_token_burn_on_rediscovery.md)

## Archived (memory/_archive/, point-in-time history; not loaded)
- `kt_response_to_notcluely.md`, `reference_notcluely_kt.md`, `reference_notcluely_patterns.md` — completed KT 2026-03-17/18
- `reference_cli_steering.md` — outdated CLI steering snapshot
- `project_intelliqe_integration.md`, `project_saas_vision.md`, `project_cli_cost_model.md` — IntelliQE/SaaS-era product context
- `project_client_delivery_model.md`, `project_datatestid_hard_rule.md`, `project_pending_plans_priority.md`, `project_ssl_fix_handoff.md` — completed/superseded project facts
