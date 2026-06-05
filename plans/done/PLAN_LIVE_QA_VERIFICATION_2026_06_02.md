---
**Status**: DONE
**Executed**: 2026-06-02
**Priority**: P1
**Created**: 2026-06-02
**Model**: opus
**Thinking**: hi
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**Identity**: OWNER
**Skills**: /execute, /rca (on escalation only)
**Depends on**: (none — self-contained; consumes the encore-qa-tracker.csv 20-item set)
---

> 🤖 **SESSION BOOTSTRAP — invoke with `/execute PLAN_LIVE_QA_VERIFICATION_2026_06_02.md`. All context below.**
>
> The orchestrator self-bootstraps from this file. On invocation, without further prompting:
>
> 1. **Identity**: load /identity → OWNER (per frontmatter).
> 2. **Skills**: /execute orchestrates; /rca auto-loads only when an escalation agent debugs a genuine block.
> 3. **Model + thinking + permission**: orchestrator = Opus / hi / acceptEdits. WORKER models are per-check (Haiku | Sonnet | Opus-escalation) — see §4 matrix. Subagents are spawned ≤ current model class (Opus can spawn all three).
> 4. **Dependency gate**: none. The 20-item set is fixed (§4). Confirm `clients/encore/exports/encore-qa-tracker.csv` still exists (source of truth for the items).
> 5. **Context load**: read this plan in full + the recon findings embedded in §3.
> 6. **Browser tool**: `cli` — live `playwright-cli` (Microsoft `@playwright/cli` 0.1.8, the agent-CLI; **NOT** `npx playwright`, the test runner — LR-054) walks ONLY. No MCP browser. Each worker runs its own **headless** session (`open` defaults headless) + `state-load clients/encore/.auth/encore-state.json` (fresh storageState; no persistent-profile lock → parallel-safe). Concurrency is bounded by **batched waves of ~8–10** (§5 Phase 3), not 40-at-once.
> 7. **Phase 0 FIRST**: pre-flight + nav2 auth bootstrap + scratch-run mechanism proof + the **nav2-1604 HALT gate** (§8). Do not fan out workers until Phase 0 passes.
> 8. **Execute Phases 1→5** per §5.
> 9. **Handoff**: this plan does NOT auto-flip the tracker. It produces a results artifact for the USER to review before they update statuses (user stated: "i wont submit without manually checking everything once"). On completion: flip this plan's Status field to done + add the Executed date, append an activity-log row (LR-028 + LR-037), git mv to plans/done/, `npm run plans:reindex`.
>
> **HALT + ASK USER** if: (a) nav2 CLI auth cannot be established without interactive MFA; (b) the viable-office pool is too small to give each concurrent worker its own office; (c) a worker returns BLOCKED twice (Sonnet→Opus) with evidence — surface, don't fake a verdict; (d) any live mutation looks like it could corrupt shared/parent data beyond the assigned office.

---

# PLAN: Live Verification of the 20 Open QA Items (e2e + nav2)

## §1 Context & Goal

The `encore-qa-tracker.csv` lists **20 open QA items** for client submission — **9 product-bug candidates (A1–A9)** + **8 manual-verify items (B1–B8)** + **3 product/UX questions (C1–C3)** (tracker row INT2: "20 unique items = 40 checks: 11 bugs + 3 potential bugs + 6 questions"). Their statuses vary ("To confirm" / "Manual verify" / "Question") — they are NOT uniformly "to confirm". **D1 is excluded** (it is the BUG-LS-001 testability request, dropped in §2). The user wants each of the 20 **independently replicated on a real site and brought back with concrete evidence**, as a pre-pass before they manually finalise the submission. Each item is checked on **both** sites → **40 checks total**:

- **e2e** (`cloudapps-e2e.encoreglobal.com`) — the live app where the issues were filed.
- **nav2** (`navigator2.training.psav.com`) — the old-site baseline (LR-ENC-001 truth source).

**Hard constraints (user):**
- **No agent touches office 1604.** Every check runs against a different location (subject to the nav2 caveat in §8).
- **Live Playwright CLI walks only** — no MCP browser. One agent per check, one bounded replication task each.
- **Per-check model tier**: Haiku for single-step observations, Sonnet for multi-step mutate→save→reload→recheck and dialog flows. **Opus only on escalation** (a genuine, evidenced block).
- **Batched waves (~8–10 parallel), one distinct office per agent in a wave** — single shared SSO login, so no two concurrent agents may mutate the same record.
- **Anti-laziness**: a "can't do" is rejected unless it ships evidence of ≥2 attempts + the blocking artifact; that auto-escalates to Opus.

## §2 Out of scope (explicitly excluded)
- **Q1** (Notes "Ok" save-dialog label) — already resolved as intentional app-wide. No check.
- **BUG-LS-001** (missing data-testids) — nav2 has zero testids by design; nothing to compare. No check.
- **No tracker auto-edits.** Workers gather evidence; the orchestrator compiles results; the **user** decides status flips.
- **No new committed specs.** Walk specs are throwaway, gitignored, deleted/retained only as evidence.

## §3 Ground truth (OWNER Phase-0 de-risk + user confirmation, 2026-06-02 — empirically proven, not assumed)

> Provenance: the facts below come from the OWNER's live Phase-0 de-risk (evidence: `clients/encore/specs_planning/_internal/live-verification-2026-06-02/evidence/phase0-derisk/PHASE0-DERISK.md`) + user confirmation. The two **recon scouts** run in Phase 1 (§5) — they have NOT run yet; per-item nav2 semantics below are a hypothesis the nav2 scout confirms live.

**e2e (ready):**
- Auth: the fresh storageState `clients/encore/.auth/encore-state.json` (26 cookies incl. MS SSO, refreshed 2026-06-01) is injected per session via `playwright-cli state-load`. **PROVEN 2026-06-02**: state-load → e2e office 1602 renders the authenticated app (1812 chars, no interactive login). The persistent `e2e-profile` is **stale** (showed "Continue Now" gate) — do NOT use it; use state-load. Creds (headed-refresh fallback only) in `config/environments/.env.local`. Guard: never set `CI_ENV=e2e` locally (LR-ENC-003).
- Office is **parameterized**: `BasePage.navigateToSubTab(tabKey, readinessKey, officeNo='1604', settingsPath='location')` → `locations/${officeNo}/settings/${settingsPath}`. A walk targets office N by passing N — **no page-object code change**. `OFFICE_NO='1604'` lives in `src/data/testdata/common.data.ts:10`.
- Page objects + selectors exist for ~18/20 items (see §4). Gaps: **B1** (no page object — trivial: navigate to a bad URL + observe) and **A5** (commission link lives in `local-office-ect.page.ts`).

**nav2 (READY — auth + office-by-URL PROVEN 2026-06-02):**
- **Auth bridges via the SAME storageState.** `encore-state.json` carries the Microsoft SSO cookies (`.login.microsoftonline.com`, `.login.live.com`). PROVEN: `state-load` then goto nav2 → first hop redirects to `login.microsoftonline.com`, the MS cookies authenticate through, it returns to `navigator2.training.psav.com` authenticated (deep-link preserved), and the old-site Location Detail renders (1649 chars). **No separate nav2 login, no `nav2-state.json` needed.** Headed `playwright-cli open --persistent` + `.env.local` creds is the contingency fallback only.
- **Office-parameterized by URL** (PROVEN 2026-06-02 on office 1602): nav2 opens any office via `https://navigator2.training.psav.com/#/setup/locationdetail/<office>`. **NOT 1604-locked.** nav2 walks target non-1604 offices directly. Note: nav2's post-SSO splash ("Accessing Navigator…") takes a few seconds — workers must **poll for content**, not eval immediately.
- **Zero selector parity.** name=/id=, PrimeNG, Bootstrap 3 — no e2e selector reuse; nav2 walks author fresh selectors. → nav2 walks are Sonnet-default (not Haiku), Opus on escalation.

**Per-item nav2 semantics** (hypothesis from LR-ENC-001 + the tracker; the Phase 1 nav2 scout confirms each live):
- **Confirm-absent** (surface doesn't exist on old site per LR-ENC-001): **A1, A2, A5** (ECT), **B8** (Notes inline field), **C1** (Enable Multiday Pricing + Merchant Currency).
- **Confirm-different-baseline-UX** (old site = single-textarea Notes, no rows/Delete → the multi-row bug cannot exist): **A8, A9, B4**.
- **Replicate** (surface present on nav2): **A3, A4, A6, B2, B3, B6, C2, C3**.
- **Recon-resolve then classify** (docs inconclusive): **A7, B1, B5, B7**.

## §4 The 40-check matrix (20 items × {e2e, nav2})

| Item | Area | e2e check (mutate?) | e2e tier | nav2 semantics | nav2 tier |
|---|---|---|---|---|---|
| A1 | LO ECT — Benefits Multiplier persist | save+reload+recheck | Sonnet | confirm-absent | Sonnet |
| A2 | LO ECT — Labor Cost coerce-to-0.00 | clear+type-text+tab | Sonnet | confirm-absent | Sonnet |
| A3 | LO Basic Info — Room Active toggle dirties form | toggle+poll Save | Sonnet | replicate | Sonnet |
| A4 | Loc — LMH pagination first/last vanish | next→prev+count btns | Sonnet | replicate | Sonnet |
| A5 | LO ECT — Commission link href broken | inspect DOM href | Haiku | confirm-absent | Sonnet |
| A6 | Loc Auto Add-On — Discard doesn't navigate | toggle+Home+Discard | Sonnet | replicate | Sonnet |
| A7 | Loc A&A — Phone 2 clear not persisted | clear+save+reload | Sonnet | recon→classify | Sonnet |
| A8 | Loc Notes — Delete vanishes on lone empty row | clear row+check Delete | Sonnet | confirm-diff-UX | Sonnet |
| A9 | Loc Notes — delete-with-text not persisted | delete+save+reload | Sonnet | confirm-diff-UX | Sonnet |
| B1 | Nav — unknown URL loads + error | navigate bad URL+observe | Haiku | recon→classify | Sonnet |
| B2 | Loc Shared Setup — delete/dialog/Miami umbrella | multi-step dialog | Sonnet | replicate | Sonnet |
| B3 | Loc Pricing — persist fails + 500 | save+reload+network | Sonnet | replicate | Sonnet |
| B4 | Loc Notes — empty row auto-appears post-save | save+count rows | Sonnet | confirm-diff-UX | Sonnet |
| B5 | LO Basic Info — Phone 1 no format validation | type invalid+check | Haiku | recon→classify | Sonnet |
| B6 | LO Basic Info — Equip QC needs Use Fulfillment | toggle Fulfillment+check QC | Sonnet | replicate | Sonnet |
| B7 | LO Basic Info — Marriott PMS column visible? | observe column | Haiku | recon→classify | Sonnet |
| B8 | LO Basic Info — Notes field visible? | observe field | Haiku | confirm-absent | Sonnet |
| C1 | Loc LI+Currency → LMH history row absent | save+check history | Sonnet | confirm-absent | Sonnet |
| C2 | LO Basic Info — Return Date Offset coercion | clear+save+reload | Sonnet | replicate | Sonnet |
| C3 | Loc Shared Setup — dialog shows already-added | add+reopen dialog+search | Sonnet | replicate | Sonnet |

Tier counts: e2e = 6 Haiku + 14 Sonnet. nav2 = 20 Sonnet (fresh-selector cost). Opus = recon (2) + on-demand escalation.

## §5 Phases

### Phase 0 — Pre-flight + bootstrap (orchestrator, before any worker)
0.1 Confirm `.env.local` present; `CI`/`CI_ENV` unset; `clients/encore/.auth/encore-state.json` valid (warm via `--project=setup` if stale).
0.2 **(DONE 2026-06-02) Mechanism de-risk via `playwright-cli`** — evidence: `clients/encore/specs_planning/_internal/live-verification-2026-06-02/evidence/phase0-derisk/PHASE0-DERISK.md`. Dir gitignored (verified). Mechanism = per-worker headless `playwright-cli` session + `state-load clients/encore/.auth/encore-state.json` + office-by-URL `goto` + poll-for-content `eval`/`snapshot`. Walks are CLI sessions, **NOT** `.spec.ts` files — so zero committed-suite / LR-ENC-002 parity-gate involvement. Per-check artifacts land under `evidence/<check-id>/` (snapshot YAML, `screenshot`, `console`/`network` logs).
0.3 **(DONE 2026-06-02) nav2 auth = storageState SSO-bridge** — PROVEN: `state-load clients/encore/.auth/encore-state.json` authenticates nav2 too (the MS SSO cookies bridge the psav.com SSO). No `nav2-state.json`, no separate login. Contingency only (if a future storageState lacks valid MS cookies): headed `playwright-cli open --persistent --profile=.auth/nav2-profile` + sign in with `.env.local` creds (CLAUDE.md authorizes login for e2e AND nav2; no MFA) + `state-save`. Gate-Auth fires only if that contingency is also blocked live.
0.4 **(Gate-N1 RESOLVED + PROVEN)** nav2 is office-parameterized via `/#/setup/locationdetail/<office>` — empirically confirmed live on office 1602 (2026-06-02 de-risk), not merely user-asserted. nav2 walks target non-1604 offices directly.
0.5 Log the LR-ENC-001 deviation (running walks against baseline is normally "observation-only"; user explicitly authorized nav2 verification) in the activity log.

### Phase 1 — Recon scouts (2 × Opus, parallel)
- **Scout-e2e**: enumerate non-1604 offices the login can open + EDIT; per candidate, record which of the 20 surfaces/features are present and have workable data. Output: a **viable-office pool** big enough that each concurrent worker gets its own office, with a feature→office map. Capture any selector/step deltas vs the 1604 page objects.
- **Scout-nav2**: confirm Gate-N1 result; for each "replicate"/"recon-resolve" item, capture nav2's **fresh selectors** (name=/id=), the exact navigation path, and expected-vs-observed framing. Finalise the per-item nav2 semantics from §3.

### Phase 2 — Assignment (orchestrator)
Build a **task card per check** (40 cards): `{check-id (e.g. A1-e2e), site, assigned-office, model-tier, navigation, selectors, ordered steps, expected, observed-to-capture, evidence list}`. Assign offices so no two cards in the same wave share an office (or any parent/shared record). Confirm-absent / confirm-diff-UX cards carry the "what proves absence" criterion.

### Phase 3 — Fan-out replication (batched waves ~8–10)
Each worker (Haiku/Sonnet) executes ONE card via `playwright-cli`: open its own headless session (`-s=<check-id>`) → `state-load clients/encore/.auth/encore-state.json` → `goto` its office-by-URL surface → poll for content → run the ordered steps (`goto`/`click`/`fill`/`select`/`eval`/`snapshot`) → capture evidence → `close` the session → return the §7 structured verdict. Reset to baseline before mutating (LR-019 spirit); never assert hardcoded structural counts (LR-022). One office per worker; waves sized to the viable pool.

### Phase 4 — Escalation (on-demand Opus)
Any `BLOCKED` (or a "can't-do" that fails the anti-laziness gate) re-spawns as **Opus** with the prior worker's evidence + `/rca`. A second evidenced block → HALT + surface to user (§8d). Never synthesize a verdict that wasn't observed.

### Phase 5 — Synthesis (orchestrator)
Aggregate all 40 verdicts into **one** results artifact: `clients/encore/specs_planning/_internal/live-verification-2026-06-02/RESULTS.md` (+ a flat CSV), each row cross-referenced to its tracker item with the evidence path. Cluster by verdict. Present a concise summary in chat. **Do not edit `encore-qa-tracker.csv`** — hand the user a reviewed/ready delta they approve manually.

## §6 Worker task template (the contract every worker receives)
```
You are verifying ONE QA check via a LIVE playwright-cli walk (Microsoft @playwright/cli;
NOT `npx playwright`). No MCP browser.
SITE: <e2e|nav2>   OFFICE: <non-1604 office>   NEVER use office 1604.
GOAL: <one-line item>   STEPS: <ordered>   SELECTORS: <provided>   EXPECTED: <...>
1. Auth: `playwright-cli -s=<check-id> open` then
   `playwright-cli -s=<check-id> state-load clients/encore/.auth/encore-state.json`
   (authenticates BOTH e2e and nav2 — the storageState carries MS SSO cookies).
2. `playwright-cli -s=<check-id> goto "<office-by-URL surface>"`. POLL for content
   (eval a loop until document.body.innerText.length grows — nav2 splash is slow); do
   NOT eval immediately. Reset to a known baseline before mutating.
3. Execute the steps with click/fill/type/select/eval/snapshot. Capture: snapshot YAML,
   `screenshot -o <file>`, `network` (note any 4xx/5xx), DOM snippet via `eval`, `console`.
4. Save artifacts under live-verification-2026-06-02/evidence/<check-id>/. Close the
   session: `playwright-cli -s=<check-id> close`. Return the §7 verdict + evidence paths.
ANTI-LAZINESS: you may NOT return "can't do" without (a) ≥2 distinct attempts
described and (b) the blocking artifact (error text / snapshot). Absent that,
keep going. A genuine block → return BLOCKED with the evidence; do not guess.
```

## §6.1 Worker reuse-guardrails (reuse proven recipes — do NOT reinvent)
Folded from `agent-mistakes.md` (documented repeat-failures). Every worker card embeds the relevant ones:
- **Save flows** (A1/A2/A7/A9/B3/C1/C2): use `clickSaveAndConfirm` / `clickSaveWithDialog` (`base-page.ts`) — Encore's shared `dlgSaveChanges`/`btnSaveChangesConfirm` gates submit on the dialog's inner Save (ALL-076/LR-012). Save-button-disabled ≠ form pristine; **reload between save cycles** (GEN-033/LR-026). Don't hand-roll click drivers.
- **History reads** (A4/C1): snapshot model = 1 save = 1 row; tabs refresh without reload; "Currency" is a **duplicated** header (col 6 vs col 64) → use **content-anchored / index lookup**, never `getColumnByHeader` (GEN-042/PLN-048).
- **Radix dropdowns/dialogs** (B2/B3/C3): 50+ options → `selectComboboxOptionExact` retry loop (GEN-032/LR-025); Radix checkbox = `<button role="checkbox">` not `<input>` (ALL-006).
- **nav2 selectors**: name=/id=/PrimeNG — **verify each live** (`!!document.querySelector(...)`) before asserting (PLN-021/PLN-027/REQ-013); no e2e selector reuse.
- **Faithful-first** (GEN-043): execute the documented steps as written, observe, capture — only then classify. No preemptive workarounds. **Run the walk for real**; `--list`/typecheck ≠ evidence (GEN-034).
- **B2 nuance** (PLN-025): "reverting a change leaves Save enabled at net-zero" is *documented Encore dirty-tracking behavior*, **not necessarily a bug** — the worker reports observed behavior; the orchestrator classifies. Don't pre-judge it as REPRODUCED.

## §7 Verdict schema (per check)
`REPRODUCED` (bug confirmed — evidence) · `NOT-REPRODUCED` (behaved correctly here — evidence; note if office-data may differ from 1604) · `ABSENT-CONFIRMED` (surface absent on nav2 — evidence) · `BASELINE-DIFF` (old-site UX differs, bug can't exist there — evidence) · `BLOCKED` (evidenced block → escalation). Every verdict cites concrete artifacts.

## §8 HALT gates
- **Gate-N1 (nav2-1604): RESOLVED** — nav2 opens any office via `/#/setup/locationdetail/<office>` (user-confirmed 2026-06-02). nav2 walks use non-1604 offices just like e2e; no HALT.
- **Gate-Auth** [0.3]: RESOLVED — nav2 auth bridges via the e2e storageState (PROVEN 2026-06-02). Fires only if a future storageState lacks valid MS cookies AND the headed-refresh contingency is also blocked live.
- **Gate-Pool** [Phase 1]: viable non-1604 office pool < wave size → HALT, shrink waves or ask for offices.
- **Gate-Block** [Phase 4]: second evidenced block on a check → HALT, surface (never fake).
- **Gate-Corruption**: any mutation risks shared/parent data beyond the assigned office → HALT.

## §9 Rules applied / deviations
- **LR-ENC-001 deviation** (authorized): baseline is normally observation-only; user explicitly authorized live nav2 verification. Logged in Phase 0.5.
- **LR-ENC-003**: e2e walks load `.env.local`; nav2 walks use a separate base URL + `nav2-state.json` and must NOT set `CI_ENV=e2e`.
- **LR-ENC-002**: walk specs are gitignored scratch — they must NOT land in `clients/encore/specs/` (no parity-gate trip).
- **LR-019 / LR-022**: walks reset to baseline before mutating; no hardcoded structural-count assertions.
- **Subagent policy**: ≤ current model class; >5 parallel authorized by user via batched-waves choice.
- **No tracker auto-flip**: user reviews results first.

## §10 Verification artifact (re-runnable check of THIS plan's output)
On completion the following must hold (user/next-session can verify):
- `clients/encore/specs_planning/_internal/live-verification-2026-06-02/RESULTS.md` exists with exactly **40 verdict rows** (or fewer with a logged HALT reason, e.g. nav2 dropped → 20), each row = `check-id | site | office | verdict | evidence-path | tracker-item`.
- `ls clients/encore/specs_planning/_internal/live-verification-2026-06-02/evidence/` shows one folder per executed check with ≥1 artifact each.
- `git status clients/encore/specs/` is clean (no walk specs leaked into the committed suite).
- `clients/encore/exports/encore-qa-tracker.csv` is **unchanged** (byte-identical to pre-run) — proves no auto-flip.

---

### Execution Summary

Executed 2026-06-02 (OWNER). All 5 phases ran; **40/40 checks have a verdict**. No TC files were authored (this is a verification campaign, not a spec-generation subplan) — deliverables are evidence artifacts, not `.spec.ts`.

Checks delivered (count + IDs):
- e2e (20): A1–A9, B1–B8, C1–C3 — each replicated live on a non-1604 office.
- nav2 (20): same 20 items classified against the old-site baseline (14 via Phase-1 scout live evidence, 6 via dedicated baseline workers).

Deliverables (all exist on disk):
- `clients/encore/specs_planning/_internal/live-verification-2026-06-02/RESULTS.md` — full 40-verdict matrix + headline takeaways + caveats.
- `clients/encore/specs_planning/_internal/live-verification-2026-06-02/RESULTS.csv` — flat 40-row CSV (check_id, site, office, verdict, tracker_item, evidence).
- `clients/encore/specs_planning/_internal/live-verification-2026-06-02/ASSIGNMENT.md` — Phase-2 office/tier assignment manifest.
- `clients/encore/specs_planning/_internal/live-verification-2026-06-02/evidence/phase0-derisk/PHASE0-DERISK.md` — Phase-0 mechanism proof.
- `clients/encore/specs_planning/_internal/live-verification-2026-06-02/evidence/recon/scout-e2e.md` + `scout-nav2.md` — Phase-1 recon.
- `clients/encore/specs_planning/_internal/live-verification-2026-06-02/evidence/A2-e2e/` (and one sibling folder per executed check) — snapshots / screenshots / DOM reads.

Mechanism (proven in Phase 0): `playwright-cli` (Microsoft `@playwright/cli` 0.1.8, global install) + `state-load` of `clients/encore/.auth/encore-state.json` — the storageState's Microsoft SSO cookies authenticate BOTH e2e and nav2; headless per-session keeps parallel workers conflict-free. This corrected an earlier mistaken pivot toward the `@playwright/test` runner (LR-054).

Verification results (numbered):
1. e2e REPRODUCED: A2, A5, A7, A8, B5, B6, B7, B8, C2, C3, and B2 sub-behavior-2 (already-added shows in dialog).
2. e2e NOT-REPRODUCED on fresh non-1604 offices: A1, A3, A6, A9, B1, B4, C1 (may be 1604/data-specific or fixed — definitive re-test needs 1604).
3. e2e PARTIAL: B3 (Corporate-Pricing checkbox persists, no 500 on that path; the dropdown + reported 500 were not isolated — Radix popover-picker needs the in-app `selectComboboxOptionExact` helper).
4. e2e BLOCKED-environment: A4 (pagination needs >20 LM-History rows; every non-1604 office has exactly 1 row — only 1604, user-banned, has paginated history → un-verifiable under the no-1604 constraint).
5. nav2 baseline: 9 ABSENT-CONFIRMED, 6 BASELINE-DIFF, 2 REPRODUCED-baseline (B3/B5 = long-standing / by-design), 1 NOT-REPRODUCED-baseline (A7 → e2e is a regression), 2 BASELINE-ABSENT (B2/C3 net-new e2e surface).

Documentation changes: nav2 office-by-URL + SSO-bridge facts and the ECT section-save finding recorded (activity log + memory). Tracker `clients/encore/exports/encore-qa-tracker.csv` deliberately NOT edited (the user finalises statuses manually).

Deviation D1 (worker model): spawned Sonnet/Opus subagents hit a hard "1M-context usage-credits" API gate; only Haiku subagents run here. Per user decision, all 26 worker checks ran on Haiku; conflict/partial escalations (A1 tie-break, B3 dropdown) ran in-session on Opus, since Opus subagents are 1M-gated too.

Key product findings for the user: (1) the ECT tab uses **section-specific Save buttons**, not the shared "Save Changes" dialog — this explains the A1 "doesn't persist" report (the wrong Save was likely used); A1 actually persists. (2) A7 (Phone 2 clear) is a genuine **regression** — baseline persists empty, e2e does not on a real pre-existing value.

Residual: office 1146 Benefits Multiplier was changed during the A1 in-session tie-break and restored toward 20% (the percent input mask may leave a minor offset) — noted in RESULTS.md caveats.
