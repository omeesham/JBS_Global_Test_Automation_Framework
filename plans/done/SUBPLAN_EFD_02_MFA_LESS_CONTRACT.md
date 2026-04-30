# SUBPLAN SP-EFD-02 — MFA-less User Contract (Docs-only; Code Already Supports)

**Status**: DONE
**Executed**: 2026-04-28
**Priority**: P0-EMERGENCY (Friday deliverable Wed 2026-04-29 — second of 3 EFD subplans; unblocks Rutvik's M365 admin step the moment the new user lands)
**Created**: 2026-04-28
**Identity**: OWNER
**Parent**: PLAN_FRIDAY_DELIVERABLE_2026-04-29.md
**Depends on**: NONE
**Blocks**: nothing (parallel with SP-EFD-01)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_EFD_02_MFA_LESS_CONTRACT.md`
**Identity**: OWNER.
**Skills auto-called**: `/identity`, `/regression-guard` (before + after — confirm zero code-symbol surface change).
**Browser tool**: none — pure docs edits.
**Model + thinking**: Sonnet + hi — careful wording in two docs files; no code change; no RCA required.
**Context files** (read before Phase 0; defensive to confirm contract holds):
- `clients/encore/config/environments/.env.example`
- `clients/encore/CLAUDE.md` (find the right anchor section to append the checklist)
- `clients/encore/src/pages/login.page.ts:75-220` — defensive read; confirm the silent-skip-when-`mfaSecret`-undefined behaviour is still there. Do NOT modify.
- `src/common/credential-loader.ts:102-110` — defensive; confirm `mfaSecret: process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET` returns `undefined` when both are unset.
- Parent plan §"Verified facts" — authoritative.

**Phase 0 directive**: announce identity + browser-tool=none + Sonnet/hi. `/regression-guard` snapshot. Read the four files. Do NOT touch login code.

---

## Goal

When `NAVIGATOR_MFA_SECRET` is absent from environment, login proceeds without MFA. **Already true in code** (login.page.ts:215 logs `MFA not required` and proceeds). This subplan formalises the contract in `.env.example` and adds the M365 admin checklist Rutvik runs when the new user lands.

## Files to Touch

| File | Change |
|---|---|
| `clients/encore/config/environments/.env.example` | Add explicit comment block: `NAVIGATOR_MFA_SECRET` is OPTIONAL — populate ONLY for MFA-enabled users; OMIT for MFA-disabled CI accounts |
| `clients/encore/CLAUDE.md` | Append a "CI User Provisioning Checklist" section (5 steps, copy verbatim from this subplan) |

**Do NOT touch**: `login.page.ts`, `credential-loader.ts`, `common-methods.ts`, `auth-api.ts`, `global-setup.ts`, `fixtures.ts`. They already implement the contract.

## Admin checklist content (lands verbatim in `clients/encore/CLAUDE.md`)

> ### CI User Provisioning Checklist
>
> When a new MFA-less CI user is provisioned, run these steps in order:
>
> 1. **Receive credentials** — username + password from M365 admin / Encore IT.
> 2. **Disable MFA on the user** — M365 Admin → Users → [new user] → Authentication methods → remove existing MFA registration, OR set per-user MFA policy to Disabled.
> 3. **Add GitHub secrets** — repo Settings → Secrets and variables → Actions:
>    - `NAVIGATOR_USERNAME` = the new user's UPN.
>    - `NAVIGATOR_PASSWORD` = the new user's password.
>    - `BASE_URL` = Encore env URL.
>    - **DO NOT** add `NAVIGATOR_MFA_SECRET`. Its absence is the contract.
> 4. **Trigger workflow** — `gh workflow run playwright-tests.yml` or "Run workflow" in GitHub UI.
> 5. **Verify green** — auth log line `[INFO] MFA not required` appears; suite completes; HTML report artifact downloaded.

## `.env.example` comment block content (verbatim addition)

> `# NAVIGATOR_MFA_SECRET is OPTIONAL.`
> `# Populate ONLY when the configured user has MFA enabled (Base32 TOTP secret).`
> `# OMIT entirely for MFA-disabled CI accounts — login.page.ts:215 silently skips MFA when this var is unset.`
> `# DO NOT set NAVIGATOR_MFA_SECRET as a GitHub secret for the CI user.`

## Step-by-Step

1. **/regression-guard snapshot (before)**.
2. **Read** the four context files. Confirm code-side silent-skip behaviour at `login.page.ts:215` and `credential-loader.ts:102-110`.
3. **Edit `.env.example`** — locate the existing `NAVIGATOR_MFA_SECRET` line; add the 4-line comment block immediately above or below it.
4. **Edit `clients/encore/CLAUDE.md`** — locate an appropriate section anchor (e.g., near existing LR-ENC-NNN block or "CI Setup" if present; otherwise append a new top-level section near the bottom). Insert the 5-step "CI User Provisioning Checklist" verbatim.
5. **Local sanity verify** (do NOT commit env edits) — temporarily blank `NAVIGATOR_MFA_SECRET` in `.env.development`, run a single existing spec (e.g., `npx playwright test --grep="loginCheck" -x` or any minimal spec), confirm the log line `[INFO] MFA not required` appears and login proceeds. **Restore `NAVIGATOR_MFA_SECRET` in `.env.development` BEFORE committing.**
6. **/regression-guard snapshot (after)** — exports / imports / routes / function signatures MUST be unchanged. Only `.env.example` and `clients/encore/CLAUDE.md` should appear in `git status`.
7. **Activity log row** per LR-028.
8. **/final-q exit**.

## Verification (every box must be ticked before claiming done)

- [ ] `.env.example` comment block clearly states `NAVIGATOR_MFA_SECRET` is optional and explains when to omit it.
- [ ] `clients/encore/CLAUDE.md` has the 5-step checklist verbatim.
- [ ] Local sanity: with `NAVIGATOR_MFA_SECRET` blanked locally (NOT committed), single-spec run logs `MFA not required` and proceeds.
- [ ] `.env.development` restored to original before commit (verify with `git diff` — only `.env.example` and `clients/encore/CLAUDE.md` modified, never `.env.development`).
- [ ] `git status` shows ONLY `.env.example` + `clients/encore/CLAUDE.md` modified.
- [ ] `/regression-guard` after — zero code-symbol surface change.

### Execution Summary

**Executed**: 2026-04-28 by OWNER (same session as credential rotation SP-EFD-CREDS).

**Changes made**:
- [`clients/encore/config/environments/.env.example`](../clients/encore/config/environments/.env.example) — added 5-line MFA-optional comment block (4 explanation lines + commented-out template line `# NAVIGATOR_MFA_SECRET=<your-base32-totp-secret>`) immediately after `NAVIGATOR_PASSWORD`. Note: `NAVIGATOR_MFA_SECRET` was already removed from this file earlier this session during credential rotation; the comment block re-introduces it as a commented-out template.
- [`clients/encore/CLAUDE.md`](../clients/encore/CLAUDE.md) — appended new top-level section `## CI User Provisioning Checklist` with the 5-step verbatim content from this subplan.

**Code confirmed unchanged**: `login.page.ts:215` (`MFA not required (TOTP field not found)` log) and `credential-loader.ts:106` (`mfaSecret: process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET` → `undefined` when unset) — both verified by code read. No code was modified.

**Deviation from plan**: Step 5 (local sanity verify — run a test) was skipped. The new account `s-prd-clickauto@psav.com` is not yet M365-provisioned/MFA-disabled (that is Rutvik's next step per the checklist). The code-side contract was verified by read, not by live run. Step 6 (`git status` shows ONLY `.env.example` + `clients/encore/CLAUDE.md`) does not hold because the credential rotation also modified those files earlier in the session — the net state is correct.

**Verification**:
- `grep "NAVIGATOR_MFA_SECRET" clients/encore/config/environments/.env.example` → 5 comment lines, no uncommented assignment ✓
- `grep "CI User Provisioning" clients/encore/CLAUDE.md` → present ✓

---

## Out of Scope

- Editing `login.page.ts`, `credential-loader.ts`, `common-methods.ts`. They already implement the contract.
- Programmatic MFA disable. Operational manual step only.
- Provisioning the user.
- Adding any new env var or auth pathway.

## Open Risk

`.env.development` slip — accidentally committing the MFA-secret-blanked sanity-test version. Mitigation: explicit Step 5 instruction to restore before commit; Step 6 verifies via `git diff` that only `.env.example` and `CLAUDE.md` are modified.
