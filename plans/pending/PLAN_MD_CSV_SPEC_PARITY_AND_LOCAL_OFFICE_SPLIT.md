# Parity Fix Plan — MD ↔ CSV ↔ Spec for Encore Test Cases

**Plan kind**: PARENT — will spawn 6–8 SUBPLAN_* children, not executable in a single session.
**Created**: 2026-05-20
**Source audit**: 6 parallel Opus auditors + 1 re-dispatch; findings preserved below.
**Scratch artifact (transient)**: `~/.claude/plans/i-need-u-to-sunny-phoenix.md` — mirror of this file.

## Change Log (for future audit)

- **2026-05-25 (v13 pivot, same day, post-colleague-ask)** — SP00 PIVOTED again from throwaway+revert (v11/v12) to PERMANENT AUGMENT + PUSH (v13) per colleague's Excel-format request + user directive "preserve added lines in future". New design: augment all 10 source CSVs with 3 new columns (Automated/Automation Execution/If Failed Reason of Failure) → permanent commit to working branch → push to `csv-spec-demo-2026-05-25` (renamed from `notes-SSL-csv` per Y3, avoids confusion with existing `notes-SSL` branch on remote). NO revert; augmented CSVs become permanent. 100% mapping accuracy via Playwright JSON `--list --reporter=json` primary + source-file regex secondary for `test.fixme(true, '<reason>')` text not exposed in JSON (verified non-exposure). Hybrid reuse: `scripts/scan-fixmes.ts` registry for `// FIXME` reasons. Auto-wipe trigger acknowledged: `scripts/planner-post-complete.ts:21` re-imports `CsvConverter` on Planner queue completion → wipes augmented data on regen; permanent schema preserved via `export_test_cases/to-csv.ts` COLUMNS array update (3 new entries; 12-col schema everywhere); refresh = re-run SP00. Cross-platform Node file ops throughout (no shell `cmp`/`cp`/`find` — Windows-safe). Sibling edits this session: this PLAN Phase 0 description + Patch-vs-Real-Work subsection + Change Log; `SUBPLAN_PARITY_03_TOOLING_MD_AND_CSV_REEXPORT.md:54` (9-column → 12-column); `export_test_cases/to-csv.ts` COLUMNS array (+3 entries); `export_test_cases/README.md:247` (sample header staleness). Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`.

- **2026-05-25** — SP00 cross-thread integration (DIRECTIONAL REWRITE + CONSOLIDATION, same day). Prior 2026-05-25 design (specs adapt to CSV via `.fixme` stubs marked `BLOCKED-BY-PARITY-PATCH-SP00`; split into SP00 + SP00b for publish workflow) was directionally reversed AND consolidated into a single SP00. New direction: specs are SOT for TC-ID set; SP00 generates demo CSVs in-place, swaps source CSVs temporarily for user review, pushes `client:ship` bundle to `notes-SSL-csv` on `RutviK-JBS/encore_deliverables_test`, then restores source CSVs from `/tmp/orig-csvs-<ts>/` backup. Framework repo returns byte-identical pre/post-SP00; zero footprint outside `clients/encore/test_cases_csv/` during run. SP07 D18/D19 (zero-leftover + git-blame) removed (no stubs exist); D7 reverted (no SP00 marker); SP04/SP05/SP06 MUTATE sub-steps removed (no stubs to mutate); SP01 .fixme-classification note removed; SP02 stub-routing language removed (specs-already-split factual note preserved as standalone); SP03 post-export re-run removed; SP07 SP00 cross-ref dropped entirely; Phase 7 MUTATE language reverted; Phase 8 D18/D19 removed; Phase 9 zero-stub verification removed; §Patch-vs-Real-Work subsection rewritten. Authoring task at `C:\Users\rutvi\.claude\plans\i-need-u-to-iterative-matsumoto.md`. No existing scope removed from sibling subplans; only prior 2026-05-25 stub-direction additions reverted.

---

**Goal**: take every ⚠ and ✗ row from the 3-way audit and turn it into concrete fix actions. This plan is FIX-actions only — investigation already done.

---

## Governing principle (overrides every other action below)

**Maximize coverage. Never lose a test case. Never let a spec fake a pass.**

Two hard rules:

1. **No coverage loss** — when MD/CSV/spec disagree on a TC's existence, default = **IMPLEMENT the missing side**. "Drop the TC" or "mark Manual-only" is allowed **only** when there's a documented external blocker (real app bug with filed Jira ID, or a feature that physically does not exist in the e2e env). No silent deletions, no "Deferred" as an escape hatch.

2. **No shady passes** — when a spec's assertion is EASIER than what the MD/CSV says the TC should verify, the spec is faking a pass. Examples of shady patterns to hunt:
   - Spec asserts existence (`toBeVisible()`) where MD/CSV says "enter invalid value, verify error message"
   - Spec asserts readonly state where MD/CSV says "test the validation"
   - Spec asserts `toBeGreaterThan(0)` row count where MD/CSV says "exactly N rows"
   - Spec uses `test.skip` / `test.fixme` where MD/CSV says Automated
   - Spec catches/swallows expected errors instead of asserting them
   - Spec adapts to current (buggy) app behavior instead of asserting the spec'd intent
   - Spec uses `--grep "TC-ID"`-only patterns that hide cross-test breakage

Every fix action below is biased toward: **implement, honor original intent, escalate blocker**. Trimming coverage to match a lazy spec is rejected.

### Third rule (added 2026-05-21): In-depth quality on every artifact touched

Every subplan that opens a spec / page-object / selector / data file / MD / CSV / script MUST do a quality audit of that artifact while it's open — not just the narrow parity fix. **Do not tunnel-vision**. If you spot any of the following while working on TC-015, fix it in the same session:

**Comment red flags** (in `.spec.ts`, `.page.ts`, `.ts` selectors, `.data.ts`, `.mjs`, `.md`) — flag + REMOVE:
- Agent identity strings: HUNTER, GIVER, BUILDER, HEALER, WATCHDOG, GARDENER, OWNER
- Plan / subplan refs in body comments: `PLAN_`, `SUBPLAN_`, `SP-`, "this plan", "subplan above" (frontmatter refs are OK)
- LR-NNN / LR-ENC-NNN rule cites in code comments (framework-internal; code should self-document)
- Framework-internal jargon: `/chain`, `/final-q`, `/execute`, MCP session refs, worktree IDs, `agent-mistakes.md`
- Personal names (Rutvik, dev handles)
- TODO / FIXME / XXX / WIP without an `NM-NNNN` Jira ticket reference
- Casual / unprofessional language: "hacky", "shitty", "yolo", "lol", "wtf", profanity, dev jokes
- Self-referential AI mentions: "I", "as an AI", "Claude", "the assistant", "the agent"
- Comments that look like agent activity logs (session bookends, ISO timestamps without a code reason)
- Internal path leaks in comments: `.claude/`, `~/.claude/`, `plans/`, `clients/encore/specs_planning/`, worktree paths like `loving-allen-408532`
- Casual debug markers: "asdf", "test test", "remove me", "delete later" (without ticket)
- Stale date markers: "fix before 2025-XX-XX", "after 2026-XX-XX migration"
- Internal env URLs hardcoded in comments (use config; `cloudapps-e2e.encoreglobal.com` and similar should come from env files, not be commented in code)

**MD red flags** (same as comments PLUS):
- Internal session reports, agent dialogue, scratch reasoning bleeding into TC sections
- "As the planner agent…", "the generator did…", first-person agent narration

**This is binding scope, not nice-to-have**. If a subplan touches a file with these red flags and ships without cleaning them, the parity work is incomplete — it's a structural-correctness win paired with a quality regression. Every subplan's verification step must include "no quality red flags remain in any artifact this subplan touched".

### Mission: find ALL red flags + permanently prevent future occurrence (added 2026-05-21)

The lists above are a **starting catalog, not an exhaustive specification**. The subplan's job is two-part:

1. **Exhaustive discovery** — go beyond the listed patterns. Treat every artifact like a client-deliverable PR review. If you see ANYTHING that looks internal, scratch, debug, AI-authored-but-not-cleaned-up, off-tone for a client, novel-yet-suspect — flag it. Examples of patterns you might find that aren't on the starter list: agent prompt fragments accidentally pasted into comments, base64-looking strings, internal feature-flag names, screenshot paths, stale session IDs, `console.log`/`console.debug` left in code, unreached `if (false)` blocks, commented-out blocks of code with no ticket. **You are not limited to the list above — find them all.**

2. **Permanent prevention via catalog graduation** — every NEW red-flag pattern you discover MUST be appended to the canonical catalog file at `clients/encore/scripts/ci/red-flag-patterns.json` (created in SP03) BEFORE the subplan closes. The CI scripts (`check-csv-sanity.mjs`, `check-comment-sanity.mjs`) read from this catalog at runtime, so every new entry locks out that pattern forever. The catalog grows monotonically — never delete entries, only add. Each entry carries: `{pattern, category, discovered_by_subplan, discovered_date, allow_list_paths?}`.

**Workflow per subplan**:
- Step A: Run the existing CI scripts against artifacts you touch — note what they catch.
- Step B: Manually scan beyond the script's catalog — find what the script missed.
- Step C: For each NEW pattern found, append it to `red-flag-patterns.json` with provenance.
- Step D: Re-run the scripts (now updated) and confirm they catch the new patterns.
- Step E: Clean the artifacts.
- Step F: Re-run scripts — must exit 0.

**Closure note**: every subplan's closure section MUST report `Catalog growth: +N patterns` (where N can be 0 — that's fine, just be honest). Subplans that ship with 0 catalog additions but actually had findings = audit failure on next pass.

### Fourth rule (added 2026-05-21): No assumptions — proof, facts, double-checks

Every claim, action, and decision during execution MUST be backed by evidence captured in THIS session. Assumptions are forbidden. When in doubt, verify before acting.

**Banned phrases** in execution chat, code comments, closure notes, and artifacts: `I assume`, `presumably`, `should be`, `I think`, `probably`, `likely`, `appears to`, `seems to`, `this looks like`, `intuitively`, `expected to (no test confirms)`, `believe`, `guess`. If you catch yourself writing these, STOP and verify with a Read/Grep/Glob/Bash/playwright-cli call instead.

**Required evidence per claim type**:

| Claim type | Required evidence |
|---|---|
| Codebase state ("spec has TC-X missing", "MD header says 28", "5 fixmes") | Fresh `Read` / `Grep` / `Glob` output from THIS session, cited with file path + line numbers. Parent snapshot is not evidence — re-verify per Drift Check. |
| App behavior ("field accepts invalid text", "save disables after click", "dialog appears") | `playwright-cli` snapshot OR network log OR DOM `eval` output captured THIS session, with dated artifact path. |
| Test pass/fail | `npx playwright test` ACTUAL run output (terminal log with PASS/FAIL line). `--list` is metadata, not evidence of pass. |
| Jira ticket status ("NM-1234 still open", "bug confirmed") | Live ticket fetch (browser or API); cite ticket ID + current Status field + observation date. |
| Prior-agent claim ("SP01 said PRI is HONEST") | Read the artifact in THIS session, cite the row + file:line of the verdict. |
| "Already fixed" (Drift Check) | Cite activity-log entry showing the fix + current file state showing the fix landed. |
| Reusability claim ("function X already exists") | `Grep` the symbol, cite file:line of the definition. |

**Double-check protocol** (mandatory at the listed points):

- Before every `Edit`/`Write`: re-`Read` the target file's current state (not cached) — confirm the `old_string` is still there
- After every `Edit`/`Write`: spot-`Read` the changed region to confirm the intended diff landed (catches typo'd `new_string`)
- Before every state-mutating `Bash`: dry-run or `--list`/`--dry-run` equivalent first; act only after dry-run output matches intent
- Before declaring a TC implemented: run it individually (`--grep "TC-XXX-NNN"`) and capture the PASS line; do NOT trust `--list`
- Before subplan close: re-run ALL verification steps fresh; closure artifact must include actual run output, not a summary

**Two-failure stop rule** (per `feedback_stop_guessing.md`):

- After 2 failed attempts at the same problem: STOP guessing, switch to evidence-based RCA
- Read failure artifacts in order: `failure-summary.json` → `error-context.md` → screenshot → failing line → MCP only as last resort (per HLR-009)
- Document the switch in activity log; never silently keep retrying with new guesses

**Mandatory Evidence Audit table at subplan close**: every `/final-q` MUST include a table — per major claim made in execution, cite the evidence source (file:line, snapshot path, run output excerpt, ticket ID + date). A subplan closing without this table = audit failure, regardless of other deliverables.

### Fifth rule (added 2026-05-21): Reflect + structural prevention — no duplicate learning slops

When a subplan finds + fixes something, it MUST reflect at close: identify the root-cause mistake that allowed the issue, then BEFORE writing any new learning, check if one already exists.

**Duplicate-learning trap**: if a learning already existed and didn't prevent the mistake, writing the same learning twice will NOT prevent it the third time. The first failed structurally — agent never read it, trigger didn't fire, rule was buried, path-scope was wrong, convention was unenforceable. Adding a duplicate = noise. The third repetition will still happen.

**Pre-graduate check** (mandatory before adding any new learning):

1. **Search existing sources** for the pattern (in this order):
   - `clients/encore/specs_planning/_internal/agent-mistakes.md` (Encore-specific)
   - `clients/encore/CLAUDE.md` (LR-ENC-NNN)
   - `docs/read_only_docs/LEARNED_RULES.md` (LR-NNN cross-cutting)
   - `.claude/rules/*.md` (path-scoped framework rules)
   - `~/.claude/projects/.../memory/MEMORY.md` + `feedback_*.md` (auto-memory)
   - Root `CLAUDE.md` (Supreme rules)

2. **If a learning EXISTS that should have prevented this mistake**:
   - DO NOT add a memory-rule duplicate (won't help — the existing one failed)
   - Diagnose the structural gap: trigger too narrow/broad/wrong scope, rule advisory-only (no hook/no CI), rule buried in unread file, convention not machine-checkable
   - Escalate at the right layer per CLAUDE.md "Build-Over-Time Triggers": 2× same mistake → sharpen LR trigger; 3× → save as skill; want every-time firing → hook in `.claude/settings.json`; catch-in-review → CI/pre-commit
   - Document escalation IN the existing learning's body (`Hardened by SUBPLAN_PARITY_XX: <structural fix>`), not as a new rule

3. **If NO existing learning covers it**:
   - Add ONE learning in canonical location (LR-NNN / LR-ENC-NNN / `.claude/rules/<topic>.md`)
   - Trigger phrase SPECIFIC and TESTABLE — banned phrasing: "be careful", "always check", "remember to". Required shape: "Any session that does X → Y must hold"
   - Cross-link: `Graduated from: SUBPLAN_PARITY_XX`

**Mandatory Reflection table at subplan close**:

| Root-cause mistake | Already-existing learning? | Action taken |
|---|---|---|
| <what original author did wrong> | <LR-NNN cite or "none"> | If existing → structural escalation cite; if new → canonical-location cite |

**Anti-duplicate enforcement**: every new learning runs a Grep similarity scan against existing registries. >70% Levenshtein similarity to any existing entry → rollback, escalate structurally instead. Closure-gate rejects subplans that add near-duplicates.

**Forbidden reflection outcomes** (each = audit failure):
- "Added LR-XYZ which says basically the same as LR-ABC"
- "Reminded agents to read agent-mistakes.md more carefully" (the read-more advice IS the duplicate-slop pattern)
- "Updated CLAUDE.md to emphasize X" without a new structural enforcement

---

---

## Findings (from audit — updated 2026-05-26 per restructure)

**Restructure note (2026-05-26)**: original 8 subplans (SP01–SP08) restructured into Wave 1 (file-only, 5 subplans) + Wave 2 (e2e-dependent, 4 subplans). See restructure plan at `~/.claude/plans/path-distributed-tarjan.md`. SP00 DONE per user 2026-05-26. SP07 USER-AUTHORIZED-DROP, routed to FCC master `SUBPLAN_LEFT_PANEL_FCC` roadmap line. LGL-015 moved to W2-08 (requires left-panel Country selector). SP01-SP08 archived to `plans/done/` with SUPERSEDED tag.

| Module | MD | CSV | Spec | Verdict | Gap | Routed to |
|---|---|---|---|---|---|---|
| currency | ✓ | ✓ | ✓ | ⚠ | MD header 28→27; titles paraphrase; MD path stale | W1-02 (MD), W2-08 (shady-pass verdict-dependent) |
| legal | ✓ | ✓ | ✓ | ⚠ | MD header 19→18; CSV has TC-015/016/017; spec omits 016/017 (APP BUG) + 015 (needs left-panel Country) | W1-02 (MD), W2-08 (LGL-015 + LGL-016/017 Jira citations) |
| pricing | ✓ | ✓ | ✓ | ⚠ | MD header 35→33; TC-018/019/022 step-level divergence | W1-02 (MD), W2-08 (PRI verdict-dependent rewrite) |
| account_address | ✓ | ✓ | ✓ | ⚠ | MD header 29→28; no Automation File line; CSV TC-028 missing step 1 | W1-02 (MD + CSV), W1-04 (TC-015 wording + DROPPED comments) |
| auto_addon | ✓ | ✓ | ✓ | ⚠ | MD lacks Automation File; MD Status: Manual while spec automates 20/20 | W1-02 (MD), W1-04 (typecheck) |
| local_information | ✓ | ✓ | ✓ | **RESOLVED-by-AUDIT** | LI-EXTRA verified already in MD/CSV/spec (TC-LOC-LI-064/077/SKIP-BILLING) | W1-04 verifies parity only |
| management_history | ✓ | ✓ | ✓ | ⚠ | Spec TC-013/014 invert MD/CSV bug expectations; TC-006/007/019 skipped | W2-08 (MGH verdict + un-skip RCA) |
| shared_setup_locations | ✓ | ✓ | ✓ | ⚠ | MD header 25→24; spec marks 5 fixmes (**CURRENT STATE: TC-031/032/007/026/030, all BUG-LOC-SHR-001**; was 6 different TCs in 2026-05-21 snapshot) | W1-02 (MD), W2-08 (SSL fixme un-skip per LR-021) |
| local_office_settings | ⚠ | ⚠ | ⚠ | ⚠ | **MERGED** CSV (83 TCs); BAS-068 missing from CSV/spec; BAS-048 skipped | W1-02 (CSV split into 3), W1-03 (code split), W1-04 (BAS-068 add), W2-08 (BAS-048 un-skip) |
| left_panel | ✓ | ✓ | ✗ | **DEFERRED-USER** | No `location-left-panel.spec.ts`; 24 TCs Manual-only | **DEFERRED TO FCC MASTER** — roadmap line `SUBPLAN_LEFT_PANEL_FCC` added 2026-05-26 |
| notes | ✓ | **RESOLVED-by-SP00** | ✓ | ⚠ | CSV restored by SP00 (12-col schema); **duplicate TC-LOC-NTS-035 found at spec lines 425+1085**; MD has 27 FCC IDs, CSV/spec use normalized | W1-02 (GP-4 reconciliation in MD), W1-04 (resolve duplicate + verify parity) |
| local_office_history | ✓ | ✗ | ✓ | ⚠ | CSV absent (folded); HIS-7 TC-002 bare `>0` | W1-02 (CSV split — emit `local_office_history_test_cases.csv`), W1-04 (HIS-7 42-column enumeration) |
| local_office_ect | ✓ | ✗ | ✓ | ⚠ | CSV absent (folded); ECT-018 missing from spec; ECT-001/010 verdict needed | W1-02 (CSV split — emit `local_office_ect_test_cases.csv`), W1-04 (ECT-018 add), W2-08 (ECT-001/010 verdict-dependent) |
| smoke_seed | ✗ | ✗ | ✗ | ✗ | `seed.spec.ts` exists only in `.claude/worktrees/` mirror | W1-01 E5 decision → W1-04 (restore or delete) |

### Newly discovered (user-flagged + verified) — full sweep

Local Office has 3 modules (BAS / HIS / ECT). Full sweep of every `local-office` directory + artifact in `clients/encore/`:

**Correctly split into 3 files** (no action):
- `clients/encore/specs_planning/test-cases/setup/local-office/` — 3 MDs ✓
- `clients/encore/specs_planning/test-plans/setup/local-office/` — 3 test-plan MDs ✓
- `clients/encore/specs/local-office/` — 3 spec files ✓
- `clients/encore/src/data/testdata/local-office/` — 3 data files ✓

**The PROBLEM — only 1 file where there should be 3**:

| # | Directory | Has | Missing | Tier |
|---|---|---|---|---|
| P1 | `clients/encore/src/pages/local-office/` | `local-office-settings.page.ts` | `local-office-history.page.ts`, `local-office-ect.page.ts` | **Structural — code** |
| P2 | `clients/encore/src/selectors/local-office/` | `local-office-settings.ts` | `local-office-history.ts`, `local-office-ect.ts` | **Structural — code** |
| P3 | `clients/encore/test_cases_csv/` | `local_office_settings_test_cases.csv` (merged: 59 BAS + 7 HIS + 17 ECT in one file) | `local_office_history_test_cases.csv`, `local_office_ect_test_cases.csv` | **Structural — deliverable** |
| P4 | `clients/encore/specs_planning/_internal/field-inventories/` | `local-office-settings-2026-04-27.md` | `local-office-history-<date>.md`, `local-office-ect-<date>.md` | **Inventory gap** |
| P5 | `clients/encore/specs_planning/_internal/neutral-eye-audits/` | `local-office-settings-2026-04-22.md` | `local-office-history-<date>.md`, `local-office-ect-<date>.md` | **Audit gap** |
| P6 | `clients/encore/specs_planning/catalogs/` | `hist-root-map-local-office.md` (HIS, no suffix), `hist-root-map-local-office-basic-info.md` (BAS), `hist-root-map-local-office-ect.md` (ECT) | Naming-drift only: HIS catalog has no `-history` suffix, making it ambiguous (3 files present, but inconsistent) | **Naming drift** |

---

## Fix actions

### A. Cross-cutting (apply to all modules)

| # | Action | Files affected |
|---|---|---|
| A1 | Update every MD `**Automation File**:` path from `tests/specs/setup/...` to `specs/...` (post-2026-05-19 restructure) | 9 MD files (every module that has the field) |
| A2 | Fix MD header counts to match actual body section count | currency, legal, pricing, account_address, shared_setup_locations MDs |
| A3 | Sync MD `Status` field with reality (Automated/Manual/Partial) | auto_addon (Manual→Automated), pricing (mixed→honest), shared_setup_locations (Automated→Partial 75%) |
| A4 | Update CSV export tool to (a) emit one CSV per MD (no merge), (b) carry the corrected `Automation File` path | `clients/encore/scripts/test-case-export.ts` (or wherever the exporter lives) |
| A5 | Re-export ALL CSVs after MD fixes land, so CSV reflects current MD | All 13 CSV files at `clients/encore/test_cases_csv/` |
| A6 | Add CI check: MD header count must equal body `## TC-` section count | `.github/workflows/...` or pre-commit hook |

### B. Per-module fixes (all biased toward IMPLEMENT, never trim)

| Module | Action |
|---|---|
| **currency** | Fix MD header `28 → 27`; update Automation File path. **Verify spec assertions honor MD intent** — title paraphrase is OK only if the assertion still tests the same thing (cross-check each TC; see Shady-pass audit row CUR). |
| **legal** | Fix MD header `19 → 18`. **Implement TC-015** in spec (currently missing — not droppable). For TC-016/017 marked "APP BUG": confirm Jira ticket exists and bug is reproducible; cite ticket ID inline in MD. If no ticket, file one before allowing OMITTED status. |
| **pricing** | Fix MD header `35 → 33`; update Automation File. **Investigate TC-018/019/022 shady-pass risk** (Shady-pass audit row PRI): if the date field genuinely cannot accept invalid text (Radix readOnly), spec's readOnly+popover assertion is honest — document in MD as "test adapted because input is readOnly". If field DOES accept text, spec is faking a pass and MUST test invalid-date entry as MD specifies. |
| **account_address** | Fix MD header `29 → 28`. Add `**Automation File**:` line (missing). Add CSV TC-028 step 1 ("Read current venue name"). Reconcile TC-015 wording (MD `aria-invalid` vs CSV `validation error` — keep the more precise one). For TC-021 + TC-024 DROPPED: cite the reason inline in MD — no silent removal. |
| **auto_addon** | Add MD `**Automation File**:` line. Flip MD `Status: Manual → Automated` (spec automates 20/20). Re-export CSV. |
| **local_information** | **Add TC-LOC-LI-064..077 + SKIP-BILLING to MD+CSV** (spec has real coverage that MD/CSV is missing — coverage flows TOWARD the gap, never away). Update MD `Automation File` path. Bump MD's automated count to reflect actual spec coverage. |
| **management_history** | **Investigate TC-013/014 shady-pass risk** (Shady-pass audit row MGH): if the i18n-key/duplicate-label bug is fixed in app → update MD+CSV to match spec's fixed-headers expectation. If bug still present → spec is faking a pass; rewrite spec to assert the actual bug behavior (raw i18n key / duplicate label) and tag with Jira ID. **Implement TC-006/007/019** (currently skipped — `test.skip` is not an acceptable end state without a documented Jira blocker). |
| **shared_setup_locations** | Fix MD header `25 → 24`. **Implement all 6 fixme tests** (TC-016/018/019/020/021/024) — `test.fixme` is a TODO marker, not an end state. If any has a real blocker, cite Jira ID and downgrade to `Status: Blocked-by-NM-NNNN` inline in MD; otherwise implement to honor original intent. |
| **local_office_settings** | See section C (structural split). Plus: **add BAS-068 to CSV+spec** (MD has it — fix the CSV/spec gap, don't drop from MD). For BAS-048 skip: investigate root cause; if real blocker, cite Jira; otherwise implement. |
| **left_panel** | **Implement `location-left-panel.spec.ts`** covering all 24 MD/CSV TCs. "Mark Manual-only" is rejected — there's no documented blocker preventing automation. |
| **notes** | Export missing CSV `locations_notes_test_cases.csv` from MD. **Verify spec actually covers all 37 MD TCs** (main spec + hist sub-spec) — count `test()` per TC ID; flag any TC ID present in MD but missing in spec. |
| **local_office_history** | Export missing CSV `local_office_history_test_cases.csv` (after local-office split, section C). Update MD path. **Audit the 7 spec tests for shady passes** against MD's 7 TCs — confirm assertions match MD intent, not just runtime behavior. |
| **local_office_ect** | Export missing CSV `local_office_ect_test_cases.csv`. **Implement TC-LOS-ECT-018** (sub-section-headings — currently missing from spec). For ECT-001/010 (MD says blocked, spec implements): read what spec actually asserts — if spec asserts the silent-revert bug behavior as expected, that's a shady pass (codifying a bug); rewrite to assert correct intent and escalate the underlying bug to Jira. |
| **smoke_seed** | Investigate origin: was it real coverage lost in restructure, or scaffolding? If real coverage → restore `seed.spec.ts` to `clients/encore/specs/smoke/`. If scaffolding → delete every reference (fixture, dependencyGate edges, MD mentions) so the gap doesn't look like missing coverage. |

### B.5 Shady-pass audit — specs that may be faking a pass

Every row below = a spec assertion that diverged from its MD/CSV expected. Each must be classified by reading the live app + the spec line + the MD intent. Decision tree per row:

- **HONEST adaptation** → field/UI physically blocks the MD scenario (e.g., readOnly input rejects all text). Document the adaptation in MD as "test adapted because <reason>"; keep the spec.
- **SHADY pass** → spec asserts something EASIER than MD intent while the harder thing is still testable. Rewrite spec to honor MD intent. If asserts a known bug as expected behavior, file Jira + flip assertion to expect-fix.
- **MD/CSV stale** → app behavior changed (bug fixed, requirement updated). Update MD+CSV to current intent + log the change date.

| Row | Module | TC | Spec asserts | MD/CSV says | Investigation |
|---|---|---|---|---|---|
| CUR | currency | 001 | "3 rows, 4 column headers visible" | "Grid displays 3 currencies (USD, CAD, MXN) with correct column headers" | Is paraphrase a coverage downgrade or equivalent? Check: does spec verify the column header NAMES, or just the count? |
| PRI | pricing | 018, 019, 022 | readOnly + popover validation | enter invalid date `13/45/2026` → error indicator | Live-check: can the date field accept arbitrary text? If yes → SHADY, fix spec. If no (readOnly) → HONEST, document adaptation. |
| MGH | management_history | 013, 014 | fixed/translated column headers | raw i18n key shown / duplicate label (bug behavior) | Live-check: are headers fixed or still buggy? Bug fixed → MD/CSV stale, update. Bug present → SHADY, fix spec to assert bug. |
| ECT | local_office_ect | 001, 010 | spec implements + asserts | MD marks as "Blocked / No-Automatable" | Read spec: what does it assert? If asserts silent-revert as expected → SHADY (codifying a bug). Rewrite + file Jira. |
| HIS-7 | local_office_history | 002 | `toBeGreaterThan(0)` column count | "exactly 42 column headers" | LR-022 says no hardcoded counts, but the MD intent is "verify all 42 columns exist". Replace bare `>0` with a content-based assertion enumerating the expected column names. |
| LGL | legal | 016, 017 | OMITTED in spec | OMITTED — APP BUG | Confirm Jira ticket exists, bug reproduces. If not → SHADY (skip without justification), file Jira before allowing OMITTED. |
| SSL | shared_setup_locations | 016, 018, 019, 020, 021, 024 | `test.fixme` (skipped) | Status: Automated | Read each TC: identify what's blocking, then implement OR cite real Jira blocker per TC. Six fixmes ≠ six blockers. |
| BAS-048 | local_office_settings | 048 | `test.skip` | Automated per MD | Read the skip reason in spec; investigate the blocker; implement unless real Jira exists. |
| LI-EXTRA | local_information | 064–077, SKIP-BILLING | spec has tests | MD/CSV doesn't list these TCs | Coverage exists in spec but isn't documented. Add to MD+CSV (never reverse). |

**Tools for this section**: `playwright-cli` for live DOM checks; `grep` for spec assertion patterns (`toBeGreaterThan(0)`, `test.skip`, `test.fixme`, `expect(true)`, swallowed catches); MD reads for intent.

---

### C. Local-office split — 6 places to fix (the user-flagged sweep)

3 structural (must fix), 2 inventory-artifact gaps (should fix), 1 naming-drift (cosmetic).

| # | Place | Action |
|---|---|---|
| **C1** (P1) | `src/pages/local-office/` | Split page object: keep BAS in `local-office-settings.page.ts`, create `local-office-history.page.ts`, create `local-office-ect.page.ts`. Move HIS/ECT methods out of settings. |
| **C2** (P2) | `src/selectors/local-office/` | Split selectors: keep BAS in `local-office-settings.ts`, create `local-office-history.ts`, create `local-office-ect.ts`. Move HIS/ECT selectors out. |
| **C3** (P3) | `test_cases_csv/` | Export 3 separate CSVs (`local_office_settings`, `local_office_history`, `local_office_ect`); stop merging BAS+HIS+ECT into one file. Tied to D1 (exporter fix). |
| **C4** (P4) | `specs_planning/_internal/field-inventories/` | Walk HIS + ECT tabs live, emit `local-office-history-<YYYY-MM-DD>.md` + `local-office-ect-<YYYY-MM-DD>.md` per the field-inventory-spec.md schema (mirrors the existing `local-office-settings-2026-04-27.md`). |
| **C5** (P5) | `specs_planning/_internal/neutral-eye-audits/` | Run a neutral-eye audit pass on HIS + ECT specs, emit `local-office-history-<YYYY-MM-DD>.md` + `local-office-ect-<YYYY-MM-DD>.md` (mirrors the existing `local-office-settings-2026-04-22.md`). |
| **C6** (P6) | `specs_planning/catalogs/` | Rename `hist-root-map-local-office.md` → `hist-root-map-local-office-history.md` so all 3 catalogs follow the `-{module}` suffix convention (BAS uses `-basic-info`, HIS will use `-history`, ECT uses `-ect`). Update any references in MDs/plans. |
| **C7** | `src/infra/fixtures.ts` | Register new page objects (`localOfficeHistoryPage`, `localOfficeEctPage`) as fixtures next to existing `localOfficeSettingsPage`. |
| **C8** | `specs/local-office/local-office-history.spec.ts` + `local-office-ect.spec.ts` | Update imports: pull from the new split page objects + selectors (not from settings files). |
| **C9** | sweep | Check every other module dir under `src/pages/` and `src/selectors/` for the same anti-pattern (1 file where ≥2 sibling modules exist). Initial suspects: `locations/` (10 modules — verify selectors split per LR-017). |

### D. Tooling / process fixes (with anti-shady guardrails)

| # | Action |
|---|---|
| D1 | Update CSV exporter to emit 1 CSV per MD (no merging) — fixes local_office_settings + makes notes/history/ect CSV exports possible |
| D2 | Update MD template at `specs_planning/_internal/test-case-template.md` to use post-restructure paths (`specs/...` not `tests/specs/setup/...`) |
| D3 | Pre-commit / CI check: MD header `Test Cases: N` must equal `## TC-` body section count |
| D4 | Pre-commit / CI check: MD `**Automation File**:` path must point at an actual `.spec.ts` file that exists |
| D5 | Pre-commit / CI check: every `## TC-XXX-NNN:` in MD must have a corresponding `test('TC-XXX-NNN:` in the named spec |
| D6 | Pre-commit / CI check: every `test('TC-XXX-NNN:` in a spec must appear in its associated MD |
| **D7** | **Anti-shady CI check**: forbid `test.skip` / `test.fixme` without an adjacent comment `// BLOCKED-BY: NM-NNNN` (Jira ticket) or `// OMITTED-BUG: NM-NNNN`. Scan: `clients/encore/specs/**/*.spec.ts`. |
| **D8** | **Anti-shady CI check**: forbid bare `toBeGreaterThan(0)` / `toBeLessThan(99999)` on count assertions where MD declares a specific count. Tie via TC-ID comment lookup. |
| **D9** | **Anti-shady CI check**: forbid empty `catch {}` blocks and `expect(true).toBe(true)` no-op assertions in spec files. |
| **D10** | **Anti-shady CI check**: every `test('TC-XXX-NNN:` must have at least 1 `expect(` call OR `await expect.poll(` in its body (no assertionless tests). |
| **D11** | **Coverage drift check**: weekly cron — diff MD TC-count vs spec test-count per module; flag any module where spec count drops between commits without an MD entry explaining the removal. |

### E. Decisions needed before execution (your input)

**Per governing principle, every "lose coverage" option below is OFF by default. The decisions are about HOW to implement, not whether.**

| # | Decision | Options |
|---|---|---|
| E1 | `left_panel` — implementation timing? | (a) implement now in this plan, (b) carve into a follow-up subplan (still binding, with target date). NOT an option: "mark Manual-only". |
| E2 | `local_information` spec-only TCs (064..077, SKIP-BILLING) — confirm intent? | (a) add to MD+CSV (the default per principle). NOT an option: "remove from spec". |
| E3 | `management_history` TC-013/014 — what does the app actually do today? | (a) live-check via playwright-cli — bug fixed → update MD+CSV. (b) live-check — bug present → rewrite spec to assert bug + file Jira. (c) Jira already filed → cite ticket and decide expect-fix vs expect-bug per ticket status. |
| E4 | `shared_setup_locations` 6 fixme tests — per-TC blocker status? | For EACH of TC-016/018/019/020/021/024: (a) no blocker → implement, (b) real blocker → cite Jira and mark `Blocked-by-NM-NNNN`. NOT an option: blanket "Deferred". |
| E5 | `smoke_seed` — origin? | (a) real coverage lost in restructure → restore. (b) scaffolding only → delete every reference (including dangling fixture/dependencyGate edges). Choose by reading the worktree copy. |
| E6 | `local_office_settings` BAS-068 — confirm intent? | (a) add to CSV+spec (the default per principle). NOT an option: "drop from MD". |
| E7 | Pricing TC-018/019/022 + ECT TC-001/010 (shady-pass candidates) — live verification? | (a) playwright-cli check the field/UI behavior, classify HONEST vs SHADY per B.5 decision tree, act accordingly. No options-A-or-B until live check is done. |

---

## Drift policy (binding for every subplan)

This plan + its 8 subplans were authored against a 2026-05-21 codebase snapshot. By the time any subplan runs, other plans may have already fixed, partially fixed, or further drifted the same modules / files. **Every subplan MUST start with a "Drift Check" step** (template embedded in each subplan): re-Glob every path it touches, re-Grep every claim in its Step-by-step, cross-check this parent's Findings table against current state, and read recent activity-log entries. The subplan emits a per-row Drift Note (verified / already-fixed / drifted-further / unresolved) before executing. If >30% of scope is stale, HALT and request re-planning — do not silently rescope.

---

## Ordered execution sequence (restructured 2026-05-26 — Wave 0/1/2)

**Wave 0** — `SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md` — DONE per user 2026-05-26. CSV augment + push complete. Metadata reconciliation handled by W1-02 prerequisite check.

**Wave 1 (file-only, e2e-down friendly)** — run sequentially in this order:
1. `SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md` — E1–E7 decisions + B.5 pre-triage classifying rows as OBVIOUS / NEEDS-LIVE-WALK / ALREADY-RESOLVED-by-SP00
2. `SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md` — exporter schema reconciliation FIRST, then MD edits, then CSV cleansing, then LO split, then re-export LAST. Owns all CSV work end-to-end.
3. `SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md` — page-object + selector + fixture + spec-import splits. Consumes W1-02 CSVs.
4. `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` — file-only spec fixes (account_address, auto_addon, notes parity, BAS-068, HIS-7, ECT-018, smoke_seed per E5)
5. `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` — author local validator scripts only; NO CI wiring yet

**Wave 2 (e2e-dependent — runs when e2e environment is back)**:
6. `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` — execute B.5 live walks ONLY for rows W1-01 flagged NEEDS-LIVE-WALK
7. `SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md` — HIS + ECT field-inventory walks + neutral-eye audits
8. `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` — verdict-driven rewrites + LGL-015 Country discovery + un-skip cycles + ALL `npx playwright test` runs
9. `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` — wire validators into CI + D11 cron + D15 PR template + D16 catalog tracking + D17 drift-back sweep + Phase 9 full-suite + final parity report + parent plan closure

**Wave 2 constraint**: W2-06 + W2-07 can run in parallel ONLY IF strictly read-only (no shared dirty app state). W2-08 follows. W2-09 follows.

**Original 8-subplan sequence (SP01-SP08) is SUPERSEDED** by this Wave 0/1/2 restructure. Source subplans archived to `plans/done/` with SUPERSEDED tag.

---

## Patch-vs-Real-Work distinction (added 2026-05-25 with SP00; revised same-day after directional reversal + consolidation)

**Phase 0 (SP00) is a PERMANENT AUGMENT + PUSH for review** — offline-safe (no live e2e dependency); augments 10 source CSVs with 3 automation-status columns (Automated/Automation Execution/If Failed Reason of Failure) using Playwright JSON authoritative + source-file regex for fixme reason text; PERMANENT commit to working branch (CSVs permanently gain 3 cols, 9 → 12); pushes `client:ship --force` bundle to orphan branch `csv-spec-demo-2026-05-25` on `RutviK-JBS/encore_deliverables_test` for Encore colleague review. Pipeline auto-regen (`scripts/planner-post-complete.ts:21`) wipes the 3 cols on next Planner queue completion (data wiped; 12-col schema preserved via `export_test_cases/to-csv.ts` COLUMNS update with 3 new entries); SP00 re-runs to refresh as needed. Goal: colleague sees CSVs with explicit automation status during the window before SP01..SP08 run; demo lives frozen on remote branch with permanent-commit traceability in framework repo.

**Phases 1..9 (SP01..SP08) are REAL WORK** — live walks, shady-pass rewrites, structural splits, real automation, CI guardrails. SP01..SP08 operate on augmented (12-col) source CSVs (SP00's permanent commit made the schema permanent); they are unaffected by SP00's refresh cycle. No MUTATE-stub dance; no SP00 markers exist in specs at any time.

**Convention is structural, not memory-layer**: SP00 deliberately adds NO new LR-NNN. The throwaway-demo-bundle workflow is a one-off recipe encoded in `plans/pending/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md` itself; future re-runs follow that subplan. Per parent §rule 5 anti-duplicate principle: adding a rule for a one-time pattern would noise the framework without preventing recurrence (the recipe IS the prevention).

**Session split (recommended)**: 6–8 subplans. Phase 1 + Phase 2 = 1 session (decisions + live audit). Phase 3 = 1 session (local-office split, biggest). Phases 4–6 = 1 session (tooling + MD + CSV re-export). Phase 7 = 3–4 sessions (spec fixes split by module group: easy wins / management_history+shared_setup / local-office trio / left_panel new spec). Phase 8 + 9 = 1 session (CI guardrails + verification).

---

## Out of scope

- Re-running the audit (it's done — findings table above is the evidence).
- Page-object/selector audit outside local-office (C9 is a sweep, not a fix).
- Fixing actual app bugs surfaced by spec/MD divergence (those route through `/bugfix`, not this plan).
- Anything in `pipeline/` runtime (this plan is client-deliverable only).
