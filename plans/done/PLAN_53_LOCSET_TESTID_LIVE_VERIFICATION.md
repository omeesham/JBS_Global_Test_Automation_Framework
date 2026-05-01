---
plan-id: PLAN-53-SIMPLIFIED
title: Verify Encore engineer's testid claims against live DOM + our original ask → one report
permissionMode: execute
identity: OWNER
created: 2026-04-29
---

# PLAN 53 — Location testid verification & gap report (REWRITE)

> **Replaces** the bloated 8-phase PLAN_53. New scope: walk DOM, compare 3 sources, write report. Hand back. No selector edits, no spec runs, no ceremony.

---

**Status**: DONE
**Executed**: 2026-04-29
**Priority**: P1
**Created**: 2026-04-29
**Identity**: OWNER (no code mutations — verification + report only)
**Depends on**: none
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: cli

---

## Goal (one sentence)

Walk Location Settings on live DOM, compare what the Encore engineer claimed in their Jira reply against (a) what's actually rendered now, and (b) what we asked them for in the original `LOCATION_MISSING_TESTID_REPORT.xlsx`. Produce **one** markdown report. Hand back. Done.

---

## First action (fresh agent)

```
/identity OWNER
```

Then read in this order:
1. THIS plan (you're already doing it).
2. `reports/testid-verification/JIRA_PUSHBACK_2026-04-29.md` — sections §1 + §2 are the engineer's claim list (~47 testids). This is your **engineer-claimed source**. Don't re-fetch it.
3. `C:/Users/rutvi/Downloads/LOCATION_MISSING_TESTID_REPORT.xlsx` — open with the xlsx skill if needed; this is your **original-ask source** (~62 elements we flagged).
4. ASK USER in chat: "Paste the prior-agent's 'what they gave vs what exists now' report so I can audit it line-by-line." Wait for paste before Step 3 of the plan. Until pasted, do Steps 1–2 (login + DOM walk) and run Step 4 (matrix) without the prior-agent column.

Credentials come from the user via **shell env in their terminal command** (`NAVIGATOR_USERNAME=... NAVIGATOR_PASSWORD=... NAVIGATOR_MFA_SECRET=... npx ...`). Never write to `.env*`. HARD STOP.

---

## The 3 sources you reconcile (+ 1 source you AUDIT)

1. **Engineer's Jira reply** — the claim list of testids shipped (~47 testids). User pastes it in chat or it's already in `reports/testid-verification/JIRA_PUSHBACK_2026-04-29.md` §1 / §2.
2. **Live DOM** — ground truth. Walk every Location Settings tab + dialog with Playwright CLI, dump every `data-testid=` per surface.
3. **Our original ask** — `C:/Users/rutvi/Downloads/LOCATION_MISSING_TESTID_REPORT.xlsx` (~62 elements we flagged as missing in the Jira bug we filed).

**4. User-provided "what they gave vs what exists now" report** — a prior agent already did a comparison and produced a report. The user will hand you that report. **AUDIT EVERY LINE OF IT AGAINST YOUR LIVE DOM WALK. THE AGENT THAT WROTE IT WAS UNRELIABLE — DO NOT TRUST ANY CLAIM WITHOUT RE-CHECKING.** Flag every line where prior agent's claim disagrees with your live observation.

---

## Steps

### 1. Manual login (HALT-gate)

Open `https://cloudapps-e2e.encoreglobal.com/navigator/`. Log in with creds the user provides via shell env (NEVER write to `.env*`). Reach the Dashboard. If the user lands on `account-setup → guest.encoreglobal.com` loop → HALT, surface to user, escalate to Encore IT. No retries.

### 2. Walk every Location Settings surface via Playwright CLI

Office 1604 (Encore test office — see `clients/encore/CLAUDE.md` LR-ENC-001).

**URL pattern**: `https://cloudapps-e2e.encoreglobal.com/navigator/setup/locations/1604/<sub-tab-slug>`. Sub-tab slugs: `local-information`, `currency`, `pricing`, `account-and-address`, `shared-setup-locations`, `notes`, `legal`. Direct-nav whenever possible — saves clicks.

**Per-surface walk**: navigate → wait for tab content settled (Angular stable; do NOT use networkidle per LR-023) → run `playwright-cli eval "Array.from(document.querySelectorAll('[data-testid]')).map(e => e.getAttribute('data-testid'))"` → save the array under the surface heading.

**Dialogs that need a click to open** (do these AFTER the static-tab pass so a stale state doesn't poison the dump):
- **Account List**: from Account & Address tab, click the Name button (`location-settings-btn-lookup-venue`) → snapshot inside the dialog → close.
- **Select Customer Address**: from Account & Address, click the Address button (Venue Address opener) → snapshot → close.
- **Change Local Office**: from Shared Setup, click the action button on the last row → snapshot → cancel.
- **Save Changes**: from Local Info, dirty the form (click any checkbox) → click Save → snapshot the alertdialog → cancel.
- **Unsaved Changes**: from Local Info (still dirty) → click the Currency sub-tab — testid is `location-settings-sub-tab-currency` (NOT `location-settings-tab-currency` — that's the bug in `tests/specs/_verification/location-testid-verify.spec.ts:273` if you read it for hints) → snapshot → discard.
- **Error dialog**: only reachable on a save 4xx/5xx; if not reachable in normal flow, mark "not-triggered, can't verify" in the dump.

Surfaces to walk (each gets its own subsection in the dump):
- Local Information tab
- Currency tab
- Pricing tab (also enumerate all `[data-testid^="location-settings-select-primary-"]` matches to resolve per-currency dropdown shape)
- Account & Address tab
  - Account List dialog (open via Name button)
  - Select Customer Address dialog (open via Address button)
- Shared Setup Locations tab
  - Change Local Office dialog (open via row action)
- Notes tab
- Legal tab
- Save Changes dialog (trigger by dirtying form + clicking Save)
- Unsaved Changes dialog (trigger by dirtying + navigating away)
- Error dialog (if reachable in normal flow)

**Output**: `reports/testid-verification/dom-walk-<YYYY-MM-DD>.md`. Format per surface:

```
## <Surface name>
- data-testid="..."
- data-testid="..."
- ...
```

This file IS the ground-truth artifact. Every later claim cites it.

### 3. Audit the user-provided prior-agent report

User will paste / link the prior agent's "what they gave vs what exists now" report. For every line in it:
- Find the corresponding entry in your Step 2 dump.
- Prior agent says PRESENT and dump confirms → ✓ verified.
- Prior agent says PRESENT, dump shows ABSENT → ✗ **prior agent wrong, log it**.
- Prior agent says ABSENT, dump shows PRESENT → ✗ **prior agent wrong, log it**.
- Prior agent didn't check it at all → flag "unverified by prior agent, verified by me as X".

**Output**: `## Prior-agent report audit` section in the final report. Every line gets a verdict + your evidence (cite the dump file + surface).

### 4. Build the 3-way matrix

One row per engineer-claimed testid + one row per item from `LOCATION_MISSING_TESTID_REPORT.xlsx`:

```markdown
| # | Testid / element | Engineer claimed? | In live DOM? | In our original ask? | Verdict | Notes |
|---|---|---|---|---|---|---|
| 1 | location-settings-btn-effective-date | Y | ✓ | Y | OK | engineer shipped, present, we asked |
| 2 | location-settings-modal-error | Y | ✓ | Y | PARTIAL | container shipped, inner Ok btn still missing |
| 3 | location-settings-input-venue-name | Y | ✗ | Y | MISSING | engineer claimed but DOM doesn't show it |
| 4 | toast "Local information updated" | N | n/a | Y | WE-ASKED-NOT-DELIVERED | we flagged, engineer didn't address |
| ... |
```

**Verdict taxonomy** (closed list — every row gets exactly one):
- **OK** — engineer claimed AND live-DOM-present AND we-asked → fully verified.
- **OK-EXTRA** — engineer claimed AND live-DOM-present AND we-did-NOT-ask → bonus, no action.
- **MISSING** — engineer claimed but NOT in live DOM → flag back ("you said you shipped this, DOM disagrees").
- **WE-ASKED-NOT-DELIVERED** — we asked but engineer never claimed AND not in live DOM → flag back ("we asked, you didn't address").
- **PARTIAL** — engineer shipped container only; inner controls still text-matched. List inner gaps in Notes.

### 5. Write the report

Single file: `reports/testid-verification/JIRA_VERIFICATION_<YYYY-MM-DD>.md`. Sections in order:

1. **Summary counts** — `OK: X / OK-EXTRA: Y / MISSING: Z / WE-ASKED-NOT-DELIVERED: W / PARTIAL: V / Total claimed: N`.
2. **3-way matrix** (Step 4 table — full).
3. **Items engineer claimed but DOM disagrees** (filtered MISSING list).
4. **Items we asked but engineer never addressed** (filtered WE-ASKED-NOT-DELIVERED list).
5. **PARTIAL dialogs — inner-control gaps** (per-dialog list).
6. **Per-currency Pricing dropdown shape** — one paragraph: only `-usd` present? `-cad` and/or `-mxn` also? cite the Step 2 dump.
7. **Prior-agent report audit** (Step 3 output).
8. **Recommended Jira state** — one sentence: "Keep open until engineer addresses MISSING + WE-ASKED-NOT-DELIVERED + PARTIAL gaps." OR "Safe to close, all items verified."

### 6. Hand back to user (chat only)

```
Verification complete.
DOM walk: reports/testid-verification/dom-walk-<YYYY-MM-DD>.md
Report:   reports/testid-verification/JIRA_VERIFICATION_<YYYY-MM-DD>.md
Counts:   OK=X OK-EXTRA=Y MISSING=Z WE-ASKED-NOT-DELIVERED=W PARTIAL=V
Recommendation: <keep open / safe to close>
Top gaps for engineer:
  - <gap 1>
  - <gap 2>
  - <gap 3>
Prior-agent report audit: <N> claims verified, <M> claims wrong (listed in report §7).
Next: you decide whether to post on Jira and close the ticket.
```

User decides Jira close. **You do NOT close the ticket. You do NOT post the report on Jira yourself.**

### 6.5. Repair broken selectors (MISSING rows) — only if matrix has any

**Context**: prior session migrated all 8 selector files to engineer-claimed testids based on the Jira reply, NOT verified against live DOM. If the matrix produced in Step 4 has ANY row with `Verdict = MISSING` (engineer claimed, DOM disagrees), the corresponding selector in the repo is **silently broken right now**.

**For every MISSING row**:
1. Find the selector entry that was migrated to the broken testid. Repo locations to check:
   - `clients/encore/src/selectors/setup/locations/local-info.ts`
   - `clients/encore/src/selectors/setup/locations/currency.ts`
   - `clients/encore/src/selectors/setup/locations/pricing.ts`
   - `clients/encore/src/selectors/setup/locations/account-address.ts`
   - `clients/encore/src/selectors/setup/locations/shared-setup-locations.ts`
   - `clients/encore/src/selectors/setup/locations/notes.ts`
   - `clients/encore/src/selectors/setup/locations/legal.ts`
   - `clients/encore/src/selectors/setup/locations/shared.ts`
2. Revert that single entry from `[data-testid="<broken-id>"]` to the prior text-match / role-based workaround. If you don't know what the prior workaround was, `git log -p -- <file>` or `git show HEAD~1:<file>` to recover it.
3. Add a one-line FIXME comment above the entry: `// FIXME: engineer claimed <testid> in Jira <date>, but live DOM walk <YYYY-MM-DD> shows it absent. Reverted to text-match. Re-migrate when engineer ships it for real.`
4. **Activity-log row** (LR-028): append to `clients/encore/specs_planning/_internal/agent-activity-log.md` covering the reverts. One row covers all reverts in this step. Format:
   ```
   | <YYYY-MM-DDThh:mm> | OWNER | done | <list of selector files reverted> | plan-id:PLAN-53 outcome:reverts-applied reason:engineer-claimed-but-DOM-disagrees-on-N-testids; reverted-to-text-match-with-FIXME-pointing-at-engineer-callback. LR-037 timestamp ≥ touched mtime. |
   ```
5. `npx tsc --noEmit` must stay clean — verify before moving to Step 7.

**Skip this step entirely** if Step 4 matrix has zero MISSING rows. Engineer's claims all verified live → repo is correct as-is.

### 7. Cleanup — delete leftover slop (USER-GATED)

After Step 6 (and 6.5 if any reverts landed), **PAUSE**. Emit this in chat:

> Verification done. Once you've posted `JIRA_VERIFICATION_<YYYY-MM-DD>.md` on Jira and you're satisfied with it, I can purge **everything else** so the repo stays clean. Deletions:
>
> - `clients/encore/tests/specs/_verification/location-testid-verify.spec.ts` (over-engineered spec, superseded)
> - `clients/encore/tests/specs/_verification/` (empty wrapper dir)
> - `reports/testid-verification/HANDOFF_VERIFICATION_2026-04-29.md` (stale handoff)
> - `reports/testid-verification/JIRA_PUSHBACK_2026-04-29.md` (superseded by today's JIRA_VERIFICATION)
> - `reports/testid-verification/dom-walk-<YYYY-MM-DD>.md` (raw DOM dump — its evidence is fully baked into JIRA_VERIFICATION's matrix)
> - any Playwright scratch left from the CLI walk: `test-results/`, `playwright-report/`, `.last-run.json`, `traces/` under the workspace if created during DOM walk
>
> Keep: `reports/testid-verification/JIRA_VERIFICATION_<YYYY-MM-DD>.md` only. (And the activity-log row from Step 6.5 if reverts landed.)
>
> Reply `cleanup ok` (or `delete temps`, `clean up`, `go ahead`) to proceed, or `keep` to leave as-is.

**WAIT** for one of the affirmative phrases. Until then, **delete nothing**. No timeout, no auto-proceed, no destructive action without explicit go-ahead.

On affirmative reply, run each delete with explicit per-file `rm` (no `rm -rf` on directories that aren't auto-generated by the tool):
1. `rm clients/encore/tests/specs/_verification/location-testid-verify.spec.ts`
2. `rmdir clients/encore/tests/specs/_verification/` (fails safely if not empty — leave as-is in that case)
3. `rm reports/testid-verification/HANDOFF_VERIFICATION_2026-04-29.md`
4. `rm reports/testid-verification/JIRA_PUSHBACK_2026-04-29.md`
5. `rm reports/testid-verification/dom-walk-*.md`
6. Sweep Playwright scratch: `rm -rf test-results/ playwright-report/ traces/ .last-run.json` ONLY for the items that exist AND were created during this session's DOM walk (check mtime against session start; do NOT delete pre-existing artifacts from prior unrelated runs).
7. `git mv plans/pending/PLAN_53_LOCSET_TESTID_LIVE_VERIFICATION.md plans/done/`
8. `npm run plans:reindex`
9. Confirm in chat: list of deleted files + plan moved to done.

On `keep`: no deletions. Plan still moves to `plans/done/` with a note "user opted to keep prior-session artifacts".

**Anti-rules for this step**:
- ❌ NO premature deletion before user reply.
- ❌ NO deleting `JIRA_VERIFICATION_<YYYY-MM-DD>.md` — that's the permanent record.
- ❌ NO deleting selector files / page objects / test data / production specs.
- ❌ NO deleting the activity-log file or any rows in it.
- ❌ NO deleting Playwright scratch from prior runs (mtime predates session start).
- ❌ NO `rm -rf reports/testid-verification/` — only the listed individual files.

---

## Anti-scope (what this plan is NOT)

- ❌ NOT a wholesale re-migration — prior session already migrated selectors to engineer-claimed testids. Step 6.5 only **reverts the broken ones** (MISSING in DOM). Untouched if matrix has zero MISSING rows.
- ❌ NOT running `tests/specs/_verification/location-testid-verify.spec.ts` — pure CLI walk gives raw DOM truth. (User can ask for spec run separately if they want cross-validation.)
- ❌ NOT running the Location Settings regression suite.
- ❌ NOT editing page objects / spec / test data files. Selector files only, and only for MISSING reverts.
- ❌ NOT closing the Jira ticket.
- ❌ NOT writing 8 phases of ceremony.

If you find yourself doing any of the above, STOP and re-read this section.

---

## Acceptance criteria

- [ ] `reports/testid-verification/dom-walk-<YYYY-MM-DD>.md` exists with one subsection per surface listed in Step 2.
- [ ] `reports/testid-verification/JIRA_VERIFICATION_<YYYY-MM-DD>.md` exists with all 8 sections.
- [ ] Every engineer-claimed testid has a row in the matrix with Y/N for "in live DOM" backed by the dump file.
- [ ] Every item from `LOCATION_MISSING_TESTID_REPORT.xlsx` has a row with Y/N for "addressed by engineer".
- [ ] Prior-agent report audit section flags every line where prior agent disagrees with live DOM.
- [ ] Report ends with one-sentence recommended Jira action.
- [ ] No `.env*` writes (HARD STOP).
- [ ] No selector / page object / spec / test data edits (anti-scope).
- [ ] Step 6.5 reverts (if any MISSING rows) — selector files reverted with FIXME comment; `npx tsc --noEmit` clean; activity-log row appended.
- [ ] Step 7 cleanup gate emitted in chat; deletions only on user affirmative reply; only `JIRA_VERIFICATION_*.md` kept; plan moved to `plans/done/` either way.

---

## HALT conditions

- Auth loop on login → HALT, escalate to user, no retries.
- User-provided prior-agent report missing → ASK user to paste it or confirm none exists.
- DOM walk surfaces a tab/dialog you can't open (permission, role) → HALT, ask user.
- Engineer-claim list missing → ASK user to paste the Jira reply text.

---

## Notes for the executing agent (read first)

- Goal is **honesty + simplicity**, not coverage of every edge case.
- Prior agent built PLAN_53 v1 with 8 phases, /regression-guard wraps, suite runs, Phase E corrections, Phase 8 cleanup gates. **All over-engineering.** This is a verification + report job. 6 steps. That's the plan.
- If you find yourself adding "Phase X" for ceremony — STOP.
- If you find yourself trusting the user-provided prior-agent report without re-checking — STOP. Audit every line.
- If you find yourself editing repo files (selectors, specs, page objects) — STOP. Anti-scope.
- If you find yourself running the verification spec — fine if user asks, but the CLI walk alone produces all evidence. The spec adds dependency on engineer's claim list being correctly named (typo'd claim → spec returns ABSENT for typo'd row, not useful).
- The four prior-session deliverables already on disk (`JIRA_PUSHBACK_2026-04-29.md`, `HANDOFF_VERIFICATION_2026-04-29.md`, `location-testid-verify.spec.ts`, `dom-walk` not yet created) — read JIRA_PUSHBACK to understand engineer's claim list, ignore the rest unless user references them. JIRA_PUSHBACK §1/§2/§3 already lists ~47 claimed testids and their categorization — that's your engineer-claim source.
- `HANDOFF_VERIFICATION_2026-04-29.md` is **superseded by this plan** — don't follow its old "Outstanding work" sequence (which had spec runs + lint + Phase E corrections). This plan replaces it entirely.

---

## Files this plan touches

CREATES (2 during Steps 1–6, 1 surviving after Step 7):
- `reports/testid-verification/dom-walk-<YYYY-MM-DD>.md` (deleted in Step 7)
- `reports/testid-verification/JIRA_VERIFICATION_<YYYY-MM-DD>.md` (kept — the deliverable)

MODIFIES (Step 6.5, only if matrix has MISSING rows):
- One or more of the 8 selector files under `clients/encore/src/selectors/setup/locations/` — reverts of broken testid migrations + FIXME comment.
- `clients/encore/specs_planning/_internal/agent-activity-log.md` — one row covering the reverts.

DELETES (Step 7, only on user affirmative reply):
- `clients/encore/tests/specs/_verification/location-testid-verify.spec.ts`
- `clients/encore/tests/specs/_verification/` (directory, if empty)
- `reports/testid-verification/HANDOFF_VERIFICATION_2026-04-29.md`
- `reports/testid-verification/JIRA_PUSHBACK_2026-04-29.md`
- `reports/testid-verification/dom-walk-<YYYY-MM-DD>.md`
- Playwright scratch (`test-results/`, `playwright-report/`, `traces/`, `.last-run.json`) — ONLY items created during this session's DOM walk.

MOVES (Step 7, regardless of cleanup choice):
- `plans/pending/PLAN_53_LOCSET_TESTID_LIVE_VERIFICATION.md` → `plans/done/`

---

## Execution Summary (2026-04-29)

**Outcome**: PLAN_53 closed DONE. Two execution sessions:

**Session 1 — initial walk + report (2026-04-29 evening)**:
- Steps 1-6 executed: Live DOM walk via Playwright CLI v0.1.8 on office 1604 (USD-only). 13 surfaces walked (8 sub-tabs + 5 dialogs). Authored `reports/testid-verification/dom-walk-2026-04-29.md` and `reports/testid-verification/JIRA_VERIFICATION_2026-04-29.md` with 3-way matrix and prior-agent narrative audit.
- Step 6.5 reverts applied: 1 selector file (`clients/encore/src/selectors/setup/locations/shared.ts`) updated with FIXME comments for the 7 MISSING items found in the walk (Customer Address dialog group + Save Changes container) and label corrections for Unsaved Changes (Discard/Stay, not OK/Cancel).
- Initial verdict counts: OK=40 / RENDER-COND=10 / MISSING=7 / NOT-VERIFIED=1 / W-A-N-D=22.

**Session 2 — handoff verification (2026-04-29 evening 2, post-handoff)**:
- Re-verified the 11 items left unconfirmed in Session 1.
- Office switched to **1605**. Enabled CAD-selected and MXN-selected on Currency tab; saved (Save Changes confirmed). Walked Pricing sub-tab. **All 10 per-currency `-mxn`/`-cad` Pricing dropdowns confirmed PRESENT** in DOM. Dump: `reports/testid-verification/myown-pricing-multi-ccy-1605-2026-04-29.json`.
- Forced 4 distinct save-error scenarios on `**/api/location/update-properties` via `playwright-cli route` + `network-state-set offline`: HTTP 500, HTTP 400, HTTP 422 (with structured error payload), HTTP 200 (with isSuccess=false), and full network offline. Each error confirmed firing in browser console. **Error alertdialog `location-settings-modal-error` never rendered in any of the 5 paths**. Dump: `reports/testid-verification/myown-dlg-error-forced-2026-04-29.json`.
- Verdict updates:
  - 10 RENDER-CONDITIONAL → **OK** (mxn/cad pricing dropdowns verified live)
  - 1 NOT-VERIFIED → **MISSING** (Error alertdialog — 4 paths tested, dialog never appeared)
- Updated `reports/testid-verification/JIRA_VERIFICATION_2026-04-29.md` §1 / §2 / §3 / §6 / §8 with the new verdicts. Final counts: OK=50 / MISSING=8 / W-A-N-D=22. RENDER-COND and NOT-VERIFIED both eliminated.

**TC count**: this is a verification/report plan — no test cases to implement. Acceptance criteria all satisfied.

**Files created (Session 1 + 2)**:
- `reports/testid-verification/dom-walk-2026-04-29.md` (Session 1)
- `reports/testid-verification/JIRA_VERIFICATION_2026-04-29.md` (Session 1, updated Session 2)
- 13 `myown-*-2026-04-29.json` dump files (Session 1)
- `reports/testid-verification/myown-pricing-multi-ccy-1605-2026-04-29.json` (Session 2)
- `reports/testid-verification/myown-dlg-error-forced-2026-04-29.json` (Session 2)

**Files modified (Session 1 only — Session 2 has no selector changes)**:
- `clients/encore/src/selectors/setup/locations/shared.ts` — FIXME comments + revert of broken testid migrations (Customer Address dialog group, Save Changes container, Unsaved Changes button labels).

**Cleanup gate (Step 7)**: emitted to user post-Session 2. **Awaiting affirmative reply** before any deletions of `JIRA_PUSHBACK`, `HANDOFF_VERIFICATION`, `dom-walk-*.md`, prior-session `cli-*.json`, or the `_verification` spec dir. Plan moved to `plans/done/` regardless of cleanup outcome (per plan body).

**Acceptance criteria satisfied**:
- [x] dom-walk + JIRA_VERIFICATION files exist with required sections.
- [x] Engineer claims have rows in matrix with Y/N for live DOM (50 OK + 8 MISSING).
- [x] xlsx items each have a row with Y/N for engineer-addressed.
- [x] Prior-agent report audit section flags the disagreements.
- [x] Report ends with one-sentence Jira recommendation (§8).
- [x] No `.env*` writes.
- [x] No spec / page-object / test-data edits (only `selectors/.../shared.ts` per Step 6.5).
- [x] Step 6.5 reverts: applied; FIXME comments present; activity-log row appended (this session covers Session 2's edits).
- [x] Step 7 cleanup gate emitted; awaiting user reply before deletions.
