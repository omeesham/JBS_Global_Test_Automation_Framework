# Encore — Client-Specific Rules

**Client**: Encore (Navigator Cloud — `cloudapps-e2e.encoreglobal.com`)
**Stack**: Angular + Radix UI + Microsoft SSO
**Framework**: encore_framework (Playwright + TypeScript, see root `CLAUDE.md`)

---

## How this file is used

Agents running against the Encore client load **both** files:
1. Root `CLAUDE.md` — framework rules (apply to any Playwright + Angular client)
2. This file — rules that name Encore product surfaces, business validations, or app-specific behaviors

If a rule applies to any Angular/Playwright client, it belongs in root `CLAUDE.md`. If a rule names an Encore page, Encore Jira ticket, Encore URL, Encore office number, or Encore-specific business rule, it belongs here.

---

## Numbering convention

- **Existing rules** (LR-008, LR-012, LR-017, LR-036) keep their original numbers — grandfathered from the pre-split registry to preserve 775+ cross-references.
- **New client rules** going forward use `LR-ENC-NNN` prefix (LR-ENC-001, LR-ENC-002, …). This prevents silent collision with framework rules that continue on `LR-NNN`.
- **New framework rules** go in root `CLAUDE.md` as `LR-038`, `LR-039`, … .

---

## Product context (quick reference)

- **App**: Navigator Cloud — Encore's rental/event management platform
- **Base URL**: `cloudapps-e2e.encoreglobal.com` (E2E environment; see `clients/encore/.env.local`)
- **Environments in scope — exactly two**: `cloudapps-e2e` (automation target, FULLY WRITABLE) + `navigator2.training.psav.com` (observation-only baseline). Any other host — notably `cloudapps-dev` — is OUT: treat such a URL as a pointer to which surface is meant, translate it to the e2e equivalent on 1604, and never build env plumbing for it (**LR-ENC-007**).
- **Test office**: 1604 (hardcoded in many TCs)
- **Master / corporate office**: 1101 ("Corporate Office") — NOT a day-to-day test office, but it carries data & whole feature areas 1604 lacks (Commission — corporate-only, Navigator Contracts role; Labor — NM-1881). Empty/absent on 1604 ≠ missing — re-check 1101 first (LR-ENC-005). (Currency/pricing variety lives on 1605, not 1101.)
- **Auth**: Microsoft SSO; credentials in `clients/encore/.env.local` (**tracked in git** — a fresh clone already has working creds; see `:130`. CI additionally injects `NAVIGATOR_*` from its secret store via `.env.e2e`)
- **Module registry**: `clients/encore/docs/MODULE_REGISTRY.md` (agent-only — gitignored per root `.gitignore:185`, never ships)
- **Requirements**: `clients/encore/docs/REQUIREMENTS.md` (agent-only — gitignored per root `.gitignore:184`, never ships)
- **Jira prefix**: `NM-NNNN` (e.g., NM-1264 — Delivery ≥ Prep cross-field validation)

---

## Client-Specific Learned Rules

### LR-ENC-001: Encore baseline truth source — old-site Navigator UI (navigator2.training.psav.com)

Old site `https://navigator2.training.psav.com/#/` is the observation-only baseline truth source (0 `data-testid`; shared SSO); new site `https://cloudapps-e2e.encoreglobal.com/navigator/` is the automated app. Old site decides on any behavior uncertainty (ALL-024). Test entity: office 1604. Baseline artifacts: `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`.

<!-- CEO POINTER: LR-ENC-001 walk technique + old→new architectural divergence detail → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-ENC-001; VERIFY: worker names which divergence (ECT tab / local-office URL split / baseline-absent field) it handled and records baselineScope on the queue entry -->
<!-- CEO POINTER: LR-ENC-001 boolean render on old-site LM History (Bootstrap Glyphicon → textContent empty for TRUE) → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-ENC-001 + LR-036; VERIFY: worker states which of the 3 render formats (Glyphicon / Unicode ✔ / SVG lucide-check) the target table uses -->

### LR-ENC-002: FCC parity is structural — never lazy-defer MD/XLSX/test-plan updates

Any subplan producing/modifying/deleting a `clients/encore/tests/**/*.spec.ts` test case MUST land its MD + test-plan + XLSX parity IN the same subplan — "I'll do it later" is the FCC mistake pattern. Three defense layers: per-agent HARD STOPS, pre-commit gates A/B/C (Gate A = `check:tc-parity`), LR-048 v2 Per-Identity Satisfaction Matrix.

<!-- CEO POINTER: LR-ENC-002 HARD-STOP list + gate A/B/C mechanism detail → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-ENC-002 + AGENT_SHARED_RULES ALL-071; VERIFY: worker shows `npm run check:tc-parity` exit 0 and names the MD / test-plan / XLSX artifacts it updated -->

### LR-ENC-003: The `.env.e2e` file is CI-only; local/agent spec runs use `.env.local`

Local/agent runs use `.env.local` (**tracked in git**, has creds — verify with `git ls-files clients/encore/.env.local`); `.env.e2e` is CI-only (also tracked, no creds — CI injects `NAVIGATOR_*`/`BASE_URL`). Both files are tracked; they differ by whether they carry credentials, not by git status. Never set `CI_ENV=e2e` locally; `src/setup/global-setup.ts` throws if `CI_ENV=e2e` without `CI`. Just `npm test`.

<!-- CEO POINTER: LR-ENC-003 env-file selection mechanism detail → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-ENC-003; VERIFY: worker confirms its local run loaded `.env.local`, not `.env.e2e` -->

### LR-ENC-004: Jira-first intake for new modules — Rovo before the old-site walk

Before HUNTER Phase 1a (old-site baseline walk) for any module with **no existing baseline artifact**, AND before GIVER authors TCs touching a **BASELINE-ABSENT** field, search `encore.atlassian.net` via Rovo (Atlassian MCP) for the module's NM tickets + Confluence spec. Record findings in `clients/encore/specs_planning/_internal/jira-defect-crossref-<module>-<DATE>.md` and add a `jira_tickets: [NM-####, …]` frontmatter key to the baseline artifact — that frontmatter key is the **structural enforcement point** (greppable proof the Jira pass ran). Only if **NO** ticket exists does the feature route to `/encore-questions`.

Every Jira fact is a **LEAD**, re-verified against DOM truth (ALL-024) before it enters a TC. Jira/Confluence = **intent truth**; the live DOM (old-site > new-site) = **render truth** — a divergence between them is signal (classify per REQ-014: intentional-UX / app-bug / stale-ticket), not an automatic "Jira wins."

<!-- CEO POINTER: LR-ENC-004 headless-degradation detail (rovo_available:false + committed jira-defect-crossref-* consumed by /chain in lieu of live Rovo) → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-ENC-004 + LR-063; VERIFY: headless worker names the committed jira-defect-crossref-*.md file it consumed -->

**Trigger**: every new-module intake (HUNTER); every GIVER TC touching a baseline-absent field; every `/encore-questions` candidate a <5-min Rovo search could answer.
**Graduated from**: 2026-06-22 — PLAN_SELF_HELP_RESEARCH_MANDATE; the Encore-specific structural half of framework rule LR-063. Cross-refs LR-063, LR-045, LR-ENC-001, ALL-024, ALL-078.

### LR-ENC-005: Office 1101 ("Corporate Office") is the master/superset corporate location — re-check before declaring corporate-only data/features absent

**Scope**: corporate-only surfaces (Commission, Labor) only. This is NOT a blanket "use 1101 as the 2nd test office" — currency/pricing variety belongs on 1605, not 1101.

When a walk, spec, RCA, `/find-bugs`, or `/encore-questions` session hits an empty or absent result on office 1604 for a corporate-only surface, re-check 1101 before concluding the data is missing or the feature is corrupt. 1101 carries whole feature areas and data that 1604 legitimately does not have.

**Canonical corporate-only instances**:
- **Commission** — restricted to 1101 + Navigator Contracts role; pre-intake KT at `clients/encore/specs_planning/_internal/intake/commission-hunter-2026-06-26.md`
- **Labor** — Labor data lives on 1101 (NM-1881), not 1604

**Anti-pattern**: concluding "field/feature is missing/corrupt" from one office's empty state without verifying on 1101.

**Trigger**: any walk/spec/RCA/`/find-bugs`/`/encore-questions` session hitting an empty corporate-only surface on 1604; any time a future meeting/KT produces new info scoped to 1101 (store it under `clients/encore/specs_planning/_internal/intake/`).

**Cross-refs**: NM-1881 (Labor), `_internal/intake/commission-hunter-2026-06-26.md` (Commission KT), `patterns.md` "corrupt/atypical" tree, LR-061 (N≥2 evidence), LR-ENC-001 (baseline truth).

### LR-ENC-006: Client-readable Playwright report — every page-object action renders as a plain-English step

The Encore HTML report ships to a non-technical client, so every public async page-object method that performs a user-visible action MUST render as a short plain-English sentence (≤ ~12 words, no selectors / `data-testid` / locator code) — via an `@step` annotation on each method plus the `label-jargon.json` map; `LoginPage` excluded. Enforced by pre-commit `npm run check:step-labels`.

<!-- CEO POINTER: LR-ENC-006 @step annotation / label-derivation / jargon-map / raw-`.page.<action>`-ban mechanism detail → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-ENC-006 + clients/encore/src/fixtures/label-derivation.ts + label-jargon.json; VERIFY: worker ran `npm run check:step-labels` green and left no raw `.page.<action>` in specs -->

### LR-ENC-007: Two environments only — `cloudapps-e2e` (fully writable) + `navigator2` (observation-only) on office 1604; any other env is OUT

**Sev**: S1 per LR-069 §3.1 (silent quality drift surviving to commit — a plan, spec, selector or config built
against a dead environment reads as ordinary work and no existing gate catches it). **Graduating incident**:
2026-08-03 — a Service Charge Text automation request arrived as a `cloudapps-dev` / office `1609` URL.
`cloudapps-dev` has zero references repo-wide; `.env.local`, `.env.e2e`, `playwright.config.ts`, the saved SSO
state and `scripts/walk-coverage/enumerate-page.mjs`’s hard-coded `BASE` all target `cloudapps-e2e`. Inheriting
the URL literally would have added an env profile, a second auth state and a `BASE` override for an environment
the owner had already abandoned. Owner ruling: *"we have to look on e2e and nav2 only."*

**The two in-scope environments — there is no third:**

| Role | URL | Discipline |
|---|---|---|
| Automation target (new site) | `https://cloudapps-e2e.encoreglobal.com/navigator/` | **FULLY WRITABLE** — see below |
| Baseline truth (old site) | `https://navigator2.training.psav.com/#/` | **Observation-only** per LR-ENC-001 + REQUIREMENTS HARD STOP #4 |

**Default test office on both: 1604.**

**e2e is FULLY WRITABLE — never ask permission to mutate it.** It is the automation environment; it exists to be
typed in, saved to, added to and worn out by specs and walks. Adding rows, editing fields, triggering save dialogs
and leaving test residue on 1604 are normal, expected and pre-authorized (owner, 2026-08-05: *"its e2e = automation
env = claude’s env = automation scripts env"*). Do NOT pause a walk, downgrade a required state, or raise a question
because a step would change data there. The ONLY constraints on e2e are collision constraints with a concurrently-
running session (no second test-runner, no shared auth-state rewrite) — never data-protection ones. **navigator2 is
the opposite**: zero mutations, always.

**How to apply** — when a request, ticket, screenshot or link names any other host or office:

1. Treat the URL as a **pointer to WHICH SURFACE is meant** — never as a build target. Translate it to the
   `cloudapps-e2e` equivalent on office 1604 and proceed.
2. **Never** create env plumbing for the out-of-scope environment: no `.env.<env>` file, no second auth state, no
   `BASE` override, no extra Playwright project, no config branch.
3. **Never** hard-code the out-of-scope host or office into a plan, spec, selector, page object, test data file or
   walk config. A grep for the dead host across the work product should return zero hits outside a provenance line.
4. **Verify the surface exists on e2e/1604 before assuming the translation worked.** If it does not, **HALT and ask**
   — never silently retarget to a different office, and never resurrect the out-of-scope environment as a workaround.
   Run the LR-040(c) c.1/c.2/c.3 ladder plus the §20.4 data rungs first, so "it isn’t on 1604" is an evidenced finding.

**Office carve-outs are NOT environment carve-outs.** These stay valid — they select a different *office within e2e*,
never a different host: **1101** for corporate-only surfaces (Commission, Labor) per LR-ENC-005; **1605** for
currency/pricing variety; the multi-location pool for parallel-isolation work.

**Deliberately prose-tier (no gate).** The mechanical form would be a new forbidden-pattern entry in
`scripts/lib/forbidden-patterns.mjs`, which per LR-069 §3.3 must land at `announce` and ramp, and a hook/gate change
needs an explicit owner GO. Promote on the second confirmed recurrence.

**Trigger**: any request, ticket, Jira link, screenshot or handoff naming a Navigator host other than `cloudapps-e2e`
/ `navigator2`, or an office other than 1604 where 1604 would do; every new-module intake; every plan or spec about to
hard-code a base URL or office.

**Cross-refs**: LR-ENC-001, LR-ENC-003, LR-ENC-005, LR-040(c), LR-069, REQUIREMENTS HARD STOP #1.

**History**: authored 2026-08-03, lost as an uncommitted working-tree edit, restored and committed 2026-08-27.

### LR-ENC-008: Lazy-loading surfaces — prove FUNCTIONAL settle before recording any contract; enabled ≠ functional

Encore's heavy tabs (canonical: Discount Matrix Location Activation, ~2041 rows) hydrate in stages for MINUTES: skeletons → placeholder rows → footer total + enabled controls → **functional handlers last**. Four confidently-wrong contracts came from reads inside that window (all NM-3530, 2026-08-25/26): LOA recorded "empty grid" (holds 2041 rows, data lands ~43s in); RWP toolbar recorded "all disabled at rest" (data actions are enabled); the rescinded readings surviving in the inventory; and BUG-DSM-LOA-001 filed as "search filters nothing" when the truth was a ~1.5–2-min post-load dead window during which the ENABLED search box silently swallows input — identical typing succeeds after the window (evidence: `reports/walk-coverage/dsm-loa-search-reverify2.json`; the owner later ruled that window accepted loading behaviour and the bug was withdrawn, 2026-08-26 — the misread lesson stands regardless).

- Before recording any grid/toolbar/field contract: prove settle — skeletons 0, rows carry text, footer/count present, controls enabled.
- Before recording any NEGATIVE functional claim ("does nothing", "filters nothing", "inert"): additionally prove the claim survives a **varied-wait retry** — repeat the identical interaction after +60s and +120s idle. A control that is enabled is NOT necessarily wired yet; only a no-op that persists across varied waits may be filed as non-functional.
- N≥2 offices with the SAME wait profile share the bias — independence comes from varying the WAIT, not the entity.

**Trigger**: any walk, probe, bug filing, or case authoring on a Loading/lazy Encore surface; any "control does nothing" verdict there.
**Graduated from**: the 4-instance loading-window class above (memory `feedback_loading_window_misreads.md` — its own text set graduation at the 3rd instance).

### LR-008: Date offset validation — positivity constraints per field type
Date-offset fields have sign constraints (relative-to-start Prep/Set/Delivery ≤ 0; relative-to-end Return/Strike/Pickup ≥ 0; Delivery additionally ≥ Prep per NM-1264). Test values must respect ALL constraints for the field under test.
<!-- CEO POINTER: LR-008 per-field-type offset sign rules → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-008; VERIFY: worker's test values satisfy every offset constraint for the field (incl. Delivery≥Prep) -->

### LR-012: Save dialogs are SHARED unless MCP-proven otherwise
Default assumption: all Location Settings tabs use the shared "Save Changes" dialog
(dlgSaveChanges / btnSaveChangesConfirm from shared.ts). Do NOT create custom dialog
selectors unless MCP verification proves a custom dialog exists.
**Trigger**: Any new page object for Location Settings tabs.

### LR-017: Different pages MUST have separate selector namespaces and directories
Pages at different URLs are DIFFERENT pages — never merge selectors into a shared flat object or co-locate files. Each page group gets its own selector partition + directory + collision boundary. Location Settings (`/settings/location`) ≠ Local Office Settings (`/settings/local-office`).
<!-- CEO POINTER: LR-017 per-page selector-namespace + directory-mirroring rules (tests/ + src/pages|selectors|data per module: locations, local-office, corporate-pricing) → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-017 + REQUIREMENTS.md + MODULE_REGISTRY.md; VERIFY: new page object lives in its own module dir, no shared flat selector object -->

### LR-036: Boolean render format differs per page — MCP-verify detection per table
Boolean cells render differently per table in the same Angular app (Unicode ✔ readable via `textContent`; SVG `lucide-check` → `textContent` EMPTY for BOTH states; empty cell = FALSE). NEVER assume two tables share a format — MCP-verify per table before any boolean-reading helper, and branch `getColumnByHeader()` on table type.
<!-- CEO POINTER: LR-036 per-table boolean detection patterns (Unicode `includes('✔')`; SVG `innerHTML.includes('lucide-check')`; empty=FALSE) → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-036 + LR-ENC-001 Glyphicon case; VERIFY: worker names which render format each asserted table uses -->

---

## Related docs (Encore-specific, lookup from here)

| File | Purpose |
|---|---|
| `clients/encore/specs_planning/_internal/agent-mistakes.md` | Encore-specific agent mistake log (graduates to LR-ENC-NNN here when patterns repeat) |

---

## Automation User Provisioning Checklist

Ops-only onboarding for a new automation user (not CEO always-on craft): provision the M365 user with **no second-factor authentication configured**, set `NAVIGATOR_USERNAME` / `NAVIGATOR_PASSWORD` / `BASE_URL` in `clients/encore/.env.local` (**tracked in git** — committing it is the intended behaviour so colleagues get a working clone; GitHub Actions removed per client request), run `npm run test:cli`, verify green.

<!-- CEO POINTER: full automation-user provisioning steps → ops runbook, not CEO always-on context (full steps in git history + docs/SETUP.md); VERIFY: the "no second-factor authentication configured" fact above is the LR-054 anti-MFA-hallucination anchor — keep it greppable in this file -->

## When encore needs fresh login session

Always use this file to read the creds and login without hallucinating and waiting for user to log you in, this works on e2e and nav2 envs. Creds live in `clients/encore/.env.local` — **this file is TRACKED in git and ships with the repo, so a fresh clone already has it.** Read it before asking anyone for credentials.

The automation account has **no second factor**, so sign-in is fully unattended: run `npm ci` (repo root and `clients/encore/`), then the auth setup (`clients/encore/tests/auth.setup.ts`), which consumes `NAVIGATOR_USERNAME` / `NAVIGATOR_PASSWORD` and writes `clients/encore/.auth/encore-state.json`. That `.auth/` state file is genuinely gitignored (it is a live session token) — it is regenerated locally, never shared. Asking a human to log in manually is a defect: check the filesystem before concluding a file is absent.