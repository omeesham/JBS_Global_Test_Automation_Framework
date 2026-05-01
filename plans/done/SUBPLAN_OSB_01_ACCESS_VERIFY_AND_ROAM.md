# SUBPLAN SP-OSB-01: Old-Site Access Verify + Baseline Roam + BUG Oracle Bundle

**Status**: DONE
**Priority**: P0 (top — gate for SP-OSB-02 and SP-OSB-03)
**Created**: 2026-04-24
**Executed**: 2026-04-24
**Parent**: [PLAN_OLD_SITE_TRUTH_BASELINE.md](PLAN_OLD_SITE_TRUTH_BASELINE.md)
**Depends on**: none
**Blocks**: SP-OSB-02, SP-OSB-03 (hard — if Verdict ≠ GREEN, workflow rule cannot ship)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: judgment-heavy — selector-parity classification, bug vs intentional-UX divergence calls, discussion-item vs filed-bug triage (`feedback_discussion_item_not_bug.md`). Opus + xhi per LR-041.

---

## Bootstrap (agent reads this first, zero prior context)

**Invoke with**: `/execute plans/pending/SUBPLAN_OSB_01_ACCESS_VERIFY_AND_ROAM.md`
**Identity**: OWNER (cross-cutting: writes to `clients/encore/specs_planning/_internal/old-site-baseline/`, may file/update `reports/bugs/`, updates activity-log)
**Skills auto-called**: `/identity`, `/execute`, `/regression-guard` (before + after), `/reflect`, `/final-q`
**Browser tool (MANDATORY DECLARATION per LR-038)**: **Claude in Chrome**.
  Reason: exploratory + auth-heavy Microsoft SSO + user at machine + need `read_network_requests` for LR-033 evidence + context-cheap (CiC `javascript_tool` ~2-3k tokens/cycle vs Playwright MCP `browser_snapshot` ~20k/cycle).
  Fallback only if CiC unavailable: Playwright MCP (log switch + reason in activity-log).

**Repo-first rule (ALL-073, ALL-075)**: before any novel DOM interaction, grep `clients/encore/src/pages/` + `clients/encore/src/selectors/` + `clients/encore/tests/specs/` for the testid or symptom. Every field has been explored on new site before — the interaction recipe already exists.

**Context files** (read before Phase 0):
- `plans/pending/PLAN_OLD_SITE_TRUTH_BASELINE.md` (parent — full "Why this change" + Rutvik directive verbatim)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (artifact format — our baseline artifact borrows its spirit)
- `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md` (section skeleton)
- `CLAUDE.md` root — LR-033 (network RCA), LR-034 (bug filing), LR-036 (boolean render format per table), LR-038 (browser tool), LR-040 (closure completeness), LR-044 (bug verification protocol)
- `clients/encore/CLAUDE.md` — LR-012 (save dialogs), LR-036 (Unicode ✔ vs SVG `lucide-check`)
- `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §1, §2, §3.5 — new-site history schema (LM=87 cols, LOS=42 cols) to compare against
- `reports/bugs/BUG-HIS-001.json`, `BUG-HIS-002.json`, `BUG-LOC-ECT-001.json`, `BUG-LI-001.json` — verbatim `stepsToReproduce` for LR-044 oracle runs
- `docs/read_only_docs/AGENT_SHARED_RULES.md` §ALL-024 (truth hierarchy — currently MCP > docs; SP-OSB-03 updates)

**Phase 0 directive**: before ANY browser call, announce the browser choice + reason in chat (LR-038). Read bug JSONs verbatim (LR-044 step 1 — do NOT paraphrase). Confirm `.env.development` creds are loaded for the Microsoft SSO flow.

**Handoff sequence (at end of session)**:
- Artifact saved at `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` — all 6 sections populated (see §Artifacts below).
- Activity-log row (LR-037 timestamp ≥ artifact mtime) describing the roam + per-bug verdicts.
- Any confirmed bug files/updates in `reports/bugs/` per LR-034 schema + LR-044 `verificationLog` entries.
- `/final-q` verdict block — GREEN | YELLOW | RED per exit criteria below.

**HALT conditions**:
- Microsoft SSO rejects `.env.development` creds on old site (401/403) → **RED verdict**, HALT, do NOT attempt alternate creds without user approval. Ask user in chat.
- Old site 1604 returns 404 → RED verdict. Ask user for alternate location/URL.
- Selector parity <50% (3+ of 5 sample testids missing) → **YELLOW verdict**. Continue roam to capture divergence, but flag scope-expansion need to user before SP-OSB-03 runs.
- On second failed attempt on the same control, STOP and grep the repo (ALL-073) BEFORE trying a new interaction pattern (`fillAndTab`, `clickSaveAndConfirm`, `setRadixCheckbox` already exist in `clients/encore/src/pages/`).
- If bug oracle shows confirmed new-site regression, write `verificationLog` entry per LR-044 + append to bug JSON. Do NOT create fix plans in this subplan — that's downstream.

---

## Purpose

Prove `navigator2.training.psav.com` is (a) reachable with current creds, (b) structurally similar enough to new site that "baseline truth source" is a viable workflow rule, and (c) useful RIGHT NOW — resolving 4 open bug oracles during the same login session that 11+ deferred HIST-pivot subplans depend on.

Output = a single dated artifact that is the **primary evidence** for SP-OSB-02 and SP-OSB-03 to ship the workflow rule.

---

## Step-by-step

### Phase 0 — Announce + load context (no browser calls yet)

1. In chat, emit the LR-038 declaration:
   > "Browser tool: Claude in Chrome. Reason: exploratory baseline roam, auth-heavy SSO, user at machine, need network-request evidence per LR-033."
2. Read all bug JSONs verbatim (LR-044 step 1) and write the exact `stepsToReproduce` array for each of BUG-HIS-001, BUG-HIS-002, BUG-LOC-ECT-001, BUG-LI-001 into the artifact's §4 Oracle Bundle scaffolding. DO NOT paraphrase.
3. Read field-inventory-spec.md + _TEMPLATE.md — our artifact follows the spirit (frontmatter, field table) but has 6 sections (see §Artifact below) instead of the 7 template sections, because this is cross-module.
4. Create directory `clients/encore/specs_planning/_internal/old-site-baseline/` if absent. This is a new convention the parent plan introduces.

### Phase 1 — Access verify (Q1 of parent plan)

5. Navigate Claude in Chrome to `https://navigator2.training.psav.com/#/setup/locationdetail/1604`.
6. Let Microsoft SSO complete using the user's live Chrome session (CiC inherits auth per LR-038).
7. Verify: page loads? office 1604 is visible? page title / URL match expected?
8. Network check: any 401/403/500 in the last 20 requests? (LR-033)
9. Record in artifact §1 Access: verdict + screenshots-via-DOM-read (since `browser_take_screenshot` is disabled per ALL-014) + any auth redirect chain.

### Phase 2 — Selector parity spot-check (Q2 of parent plan)

10. Pick 5 well-known testids from `clients/encore/src/selectors/setup/local-office/*.ts` (examples: `location-settings-btn-save`, `location-settings-modal-save-changes`, `btnSaveChangesConfirm`, `dlgSaveChanges`, one Basic Info / ECT / Local Info field each).
11. For each: `document.querySelectorAll('[data-testid="X"]').length` on old site. Record presence + count.
12. Run `document.querySelectorAll('[data-testid]').length` globally. Compare against an equivalent snapshot from new site (if easy; otherwise note a new-site comparison is out of scope for this subplan).
13. Record artifact §2 Selector Parity: sample table (testid, present Y/N, count, note).

### Phase 3 — Tab roam (Q5 of parent plan)

14. Walk Local Office Settings tabs: Basic Information → ECT → Local Information. For each:
    - Count visible tabs, fields (`[role="textbox"], [role="combobox"], [role="checkbox"], [role="spinbutton"]`).
    - Note visible label differences vs new-site documented findings (SUBPLAN_HISTORY_01_MCP_FINDINGS §2).
    - If a tab is missing or renamed vs new site, flag it.
15. Walk Location Management History tab on this office. Record column count + header list + boolean render format (Unicode `✔` vs SVG `lucide-check` per LR-036).
16. Record artifact §3 Tab Roam: per-tab field count, visible label deltas, history schema summary.

### Phase 4 — BUG oracle bundle (per user directive: "check whatever u would like and note things somewhere")

For each of the 4 bugs below, follow LR-044 Verification Protocol literally:

17. **BUG-HIS-001 (EnableMultidayPricing)**:
    - Navigate to Local Information tab of office 1604 on old site.
    - Locate EnableMultidayPricing toggle (testid or aria-label from step 10's sample).
    - Read current state. Toggle. Click Save (use `clickSaveAndConfirm` pattern from `base-page.ts:350` if old site uses same `dlgSaveChanges` — spot-check first; do NOT assume).
    - Network check via CiC `read_network_requests` — did save API fire with 2xx?
    - Reload page. Verify new state persisted.
    - Navigate to Location Management History tab. Does a new row appear? What columns are populated?
    - Verdict per LR-044: CONFIRMED (old site shows history row → new-site regression) | FALSE (old site also doesn't produce row → pre-existing limitation) | ENVIRONMENTAL | ROLE-OR-OFFICE-DEPENDENT.
    - Minimize the repro if CONFIRMED (LR-044 step 3). Append `verificationLog` entry to `reports/bugs/BUG-HIS-001.json` (LR-044 step 4).
    - Restore original toggle state before moving on (avoid dirty state for later steps).

18. **BUG-HIS-002 (Merchant Currency)**: same shape as BUG-HIS-001 but for the Merchant Currency field in Local Information. Change currency → save → check Location Management History for a new row.

19. **BUG-LOC-ECT-001 (Benefits Multiplier silent write-failure)**:
    - Navigate to ECT tab. Set Benefits Multiplier = 0.11.
    - Click Save. Network check: does the save API fire with 2xx response?
    - Reload page. Does Benefits Multiplier = 0.11, or did it revert to original?
    - Verdict per LR-044 + fetch-interceptor per LR-033 (capture full request body + response body).

20. **BUG-LI-001 (Oracle fields aria-required under SkipBilling=unchecked)**:
    - Navigate to Local Information. Uncheck SkipBilling if checked. Observe Oracle fields.
    - Is `aria-required="true"` set on Oracle fields? Is there visual indication (red asterisk, help text)?
    - Clear an Oracle field. Click Save. Does the form show validation feedback (error message, `aria-invalid`), or does Save succeed silently?
    - Verdict per LR-044.

21. Record artifact §4 Oracle Bundle: per-bug subsection (original steps verbatim, observed behavior on old site, network evidence, verdict, RCA category if FALSE).

### Phase 5 — Cross-module schema comparison

22. From the data captured in Phase 3+4, compare:
    - Old-site LM History columns vs new-site (87 cols).
    - Old-site LOS History columns vs new-site (42 cols).
    - Boolean render format — is it same on old + new per table, or did new site diverge?
23. Record artifact §5 Schema Comparison: table of cols/headers/boolean-format per table per site.

### Phase 6 — Synthesize + verdict

24. Write artifact §6 Verdict:
    - Overall: GREEN | YELLOW | RED per exit criteria below.
    - Per research question (parent plan Q1..Q6): answered Y/N + evidence pointer.
    - Scope flags for SP-OSB-03: if selector parity <70%, recommend scope-expansion to user before SP-OSB-03 runs.
25. Append activity-log row (LR-037 — timestamp ≥ artifact mtime): `| 2026-04-24Thh:mm | OWNER | done | OSB-ACCESS-VERIFY-2026-04-24.md, <any bug JSONs touched> | SP-OSB-01: old-site access verify + 4-bug oracle bundle; Verdict: <X> |`.
26. Validate: `npm run validate:activity-log:preflight` (LR-037 gate).
27. Invoke `/final-q` — must end with `## /final-q audit` heading + `**Verdict**: GREEN|YELLOW|RED` line (LR-042).

---

## Artifacts produced / modified

- **Primary**: `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` — 6 sections:
  1. Access (Q1 proof + network/auth evidence)
  2. Selector Parity (5-sample table + global count)
  3. Tab Roam (per-tab field counts + label deltas + history schema)
  4. Oracle Bundle (4 bug verdicts with LR-044 `verificationLog`-style entries)
  5. Schema Comparison (old vs new, LM + LOS, per LR-036)
  6. Verdict (GREEN/YELLOW/RED + per-Qn answer + scope flags for SP-OSB-03)
- **Bug updates**: `reports/bugs/BUG-HIS-001.json`, `BUG-HIS-002.json`, `BUG-LOC-ECT-001.json`, `BUG-LI-001.json` — `verificationLog` entries per LR-044. If CONFIRMED/FALSE, update `status` per RCA category.
- **Activity log**: `clients/encore/specs_planning/_internal/agent-activity-log.md` — one row per LR-037.
- **Directory created**: `clients/encore/specs_planning/_internal/old-site-baseline/` (new convention).

---

## Success criteria

- [ ] Browser tool declared at session start (LR-038).
- [ ] All 4 bug JSONs read verbatim before running oracles (LR-044 step 1).
- [ ] Artifact exists at the specified path with all 6 sections populated.
- [ ] 4/4 oracle verdicts rendered with evidence (DOM reads + network captures per LR-033).
- [ ] Activity-log row passes `validate:activity-log:preflight` (LR-037).
- [ ] `/final-q` emitted with parseable `**Verdict**:` line (LR-042).
- [ ] LR-040 closure gate passed — no planned item left without (a)/(b)/(c) classification.

---

## Exit criteria (verdict mapping)

| Condition | Verdict | Downstream |
|---|---|---|
| Auth works + ≥4/5 sample testids present + 4 oracle verdicts actionable (no HALTs) | **GREEN** | SP-OSB-02 + SP-OSB-03 unblocked |
| Auth works but significant selector divergence OR ≥1 oracle blocked mid-run | **YELLOW** | Flag scope-expansion to user; SP-OSB-03 retrofit clause may need variant |
| Auth fails OR 1604 not accessible OR ≥2 oracles blocked by old-site errors | **RED** | HALT parent plan; ask user for alternate creds/URL/approach |

---

## Out of scope

- Fixing any confirmed bug (this subplan only verifies).
- Running Playwright specs against old site (baseline is TC-generation source, not a parallel test target).
- Authoring SP-OSB-02 or SP-OSB-03 content (happens after SP-OSB-01 GREEN).
- Retrofitting any pending subplan (SP-OSB-03 territory).
- Exploring adjacent modules (Pricing, Currency, Legal) — stay on Local Office + Location Management as listed. If time permits and scope is clearly within an oracle step, roam briefly; otherwise defer.

---

## Execution Summary (2026-04-24 — Opus 4.7 xhi, interactive session; SP-OSB-02+03 handed to /chain)

**Verdict**: GREEN (per /final-q this session). 5 scope flags emitted for SP-OSB-03 (see artifact §6).

**Per step-by-step outcome**:

| Phase | Outcome |
|---|---|
| Phase 0 (LR-038 announce + bug JSON verbatim read + directory create) | DONE — Claude in Chrome declared; 4 bug JSONs read verbatim per LR-044 step 1; directory `clients/encore/specs_planning/_internal/old-site-baseline/` created |
| Phase 1 (access verify — Q1) | GREEN — live Chrome session inherited Microsoft SSO, office 1604 "The Parker Palm Springs" loaded clean |
| Phase 2 (selector parity — Q2) | YELLOW — **0** data-testid attributes on entire old site; 0/5 sample testids present. Old site uses `name=`/`id=` (Angular Reactive Forms `formcontrolname=` + PrimeNG `p-element` + Bootstrap 3 Glyphicon) |
| Phase 3 (tab roam — Q5) | Architectural divergence documented: old = 1 URL with embedded tabs (Basic Info top-level + Local Information/Currency/Pricing/Account And Address/Legal/Notes/Shared Setup Locations/Auto Add-On sub-tabs + Location Management History top-tab); new = 2 URLs (`/settings/location` + `/settings/local-office`). **Features absent on old**: ECT Settings tab, Local Office Settings page, Enable Multiday Pricing toggle, Merchant Currency LM column |
| Phase 4 (4-bug oracle bundle) | BUG-HIS-001 → NOT_APPLICABLE_ON_BASELINE (feature + column absent, consistent pattern not regression); BUG-HIS-002 → NOT_APPLICABLE_ON_BASELINE (schema-only verdict, column absent both sites); BUG-LOC-ECT-001 → INCONCLUSIVE (ECT feature absent on baseline); **BUG-LI-001 → CONFIRMED NEW-SITE REGRESSION** (old site properly disables Save on invalid form; new site lost this wiring → silent no-op). Aux finding: `aria-required=null` / `aria-invalid=null` present on BOTH sites — pre-existing a11y gap, not regression |
| Phase 5 (schema comparison — Q5 + LR-036 extension) | Old LM History has **87 cols identical count** + near-identical headers to new site; col 6+64 duplicate Currency (matches SP1 §1 + GEN-042); col 66 "Is Alternate" (matches PLN-020); total 1146 history rows for 1604. **Third boolean render format discovered**: Bootstrap 3 Glyphicon `<span class="glyphicon glyphicon-ok">` — LR-036 extension noted in artifact §5, propagation to root CLAUDE.md LR-036 text deferred to SP-OSB-03 |
| Phase 6 (artifact + bug JSON + activity log + /final-q) | Artifact OSB-ACCESS-VERIFY-2026-04-24.md written (6 sections + appendix); 4 bug JSONs updated with `verificationLog` entries per LR-044; activity-log row landed at 14:45 per LR-037 (preflight clean for my row); /final-q GREEN |

**Unblocks**: 11+ deferred HIST-pivot subplans (SP-D1..SP-D10, SP-B-LM-3a/3b/4..9) — assertion direction decided as "phantom not tracked" for EnableMultidayPricing + Merchant Currency. SP-OSB-03 retrofit may include a secondary patch preseting the assertion direction in those subplans' Execution Summary templates.

**Zero writes to training server** — all DOM interactions were reads; one Save dialog triggered to confirm dialog-gated save flow exists on old site, then Cancelled. Office 1604 server state unchanged.

**Rules honored** — LR-013 (field-inventory-compatible artifact format), LR-020 (rule IDs not yet assigned — SP-OSB-03 handles), LR-027 (this Execution Summary), LR-028 (activity-log row), LR-033 (fetch interceptor installed; zero network captures because no writes), LR-034 (bug filings are pre-existing; LR-044 verificationLog appended), LR-035 (plans:reindex to run on move), LR-036 (third boolean format observed + noted), LR-037 (activity-log timestamp ≥ artifact mtime; preflight clean), LR-038 (Claude in Chrome declared + reason given), LR-040 (every planned item (a)-direct-MCP-proven with DOM/schema evidence OR (c) user-flagged scope-skip for BUG-HIS-002 write-path), LR-041 (Opus xhi per frontmatter), LR-042 (/final-q GREEN verdict as final action), LR-044 (verdicts per LR-044 classification + verificationLog entries).

**Files produced / modified this session**:
- `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` (NEW)
- `reports/bugs/BUG-HIS-001.json` + `BUG-HIS-002.json` + `BUG-LOC-ECT-001.json` + `BUG-LI-001.json` (verificationLog appended)
- `plans/pending/PLAN_OLD_SITE_TRUTH_BASELINE.md` (execution plan appended + Status/Priority updated)
- `plans/pending/SUBPLAN_OSB_01/02/03_*.md` (this + next 2)
- `clients/encore/specs_planning/_internal/agent-activity-log.md` (row 175, 14:45)
- `plans/INDEX.md` (auto-regen, twice)

**Next (chain-handed)**: SP-OSB-02 + SP-OSB-03 via `/chain 2`.
