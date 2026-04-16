# MASTER PLAN: Multi-Tenant Repo Restructure

**Status**: PENDING
**Created**: 2026-04-16
**Revised**: 2026-04-16 (WATCHDOG audit — scope boundary clarified per pivot)
**Priority**: P0 (blocks colleague handoff until SP-MT-06 verifies green)
**Parent**: none (peer to PLAN_MASTER_REPO_CLEANUP)
**Supersedes**: `SUBPLAN_REPO_01_CLIENT_DELIVERY_QUICK.md` (duplicate-carve approach abandoned)
**Supersedes**: `SUBPLAN_REPO_09_CLIENT_DELIVERY_POLISH.md` + `PLAN_CLIENT_REPO_DELIVERY.md`
(packaging/IP-scrub = colleague's work, not ours — see "Handoff boundary" below)

---

## NEXT ACTION FOR A FRESH SESSION

> Run **SP-MT-01** next: `plans/pending/SUBPLAN_MT_01_SCAFFOLD_ALIASES.md`.
> Strict order — do not start SP-MT-N+1 until SP-MT-N verifies green.
> Do not skip to SP-MT-07; each subplan's verification gate must pass first.

---

## Handoff boundary (read first — binding)

User directive, 2026-04-16:

> "we ship to colleague, they will ship to client, we ship everything in new structure,
> colleague decides what to give and what to not give… do not do work for colleague,
> focus on our core goal only, not theirs."

What this means for every subplan in this tree:

- **Our core goal**: make the repo multi-tenant. After SP-MT-06, the repo has `clients/encore/`
  holding every encore-specific artifact and the framework at root is encore-free and ready
  to host a second client.
- **Not our work**: IP scrubbing, bundle creation, ZIP files, client-facing README/LICENSE/
  FE_CONTRACT, client-side package.json pruning, client-delivery CI workflows, deciding which
  pipeline scripts reach the client. These belong to colleague after handoff.
- **Handoff moment**: after SP-MT-06 merges green. Colleague pulls the whole repo, in the new
  structure, with everything in it. They decide what their client bundle contains.
- **SP-MT-07**: not a packager. A handoff document only. See its file for reduced scope.

If a future session is tempted to "just write the packager while we're here", that violates
the pivot. Say no; open a separate plan if truly needed.

---

## Context

The repo is flat and single-client. All specs, pages, selectors, fixtures, test cases,
requirements, env files, exports, and agent mistakes embed Encore / Navigator Cloud product
knowledge. As we onboard future clients (potentially with ETL UIs and non-Microsoft auth),
this flat layout will not scale.

**User directive**: *"don't assume things would be reusable — even rules/mistakes can be encore
specific sometimes"*. Default classification when in doubt = client-specific. The framework
keeps only infrastructure that's genuinely product-agnostic.

**Binding decisions** (from planning session 2026-04-16):
1. Pipeline agents (`.github/agents/*.agent.md`) stay at repo root, parameterized for any
   client via runtime context injection.
2. Pipeline-internal scripts (planner/generator/healer/audit/sync/validate hooks) stay at
   root and become client-aware via `ACTIVE_CLIENT` env var. Client-consumable scripts
   (log cleanup, artifact prep) stay generic at root; colleague chooses which ones reach
   a given client bundle.
3. Phased execution — each subplan runs in its own session with its own verification gate.
4. Packaging & delivery-bundle decisions belong to colleague after handoff; we don't build
   them. (SP-MT-07 reduced to handoff doc accordingly.)

**Pivot reason**: We were about to produce a quick `encore_delivery/` carve (a duplicate
snapshot). User pointed out the correct model is a structural restructure so each client
folder is naturally self-contained and the framework stays constant. SP-01 reverted (5 carved
files deleted). After a second pivot, we also stopped planning a packager — that's colleague's
scope. SP-MT-01..06 deliver the restructure; SP-MT-07 writes the handoff doc.

---

## Target Architecture

```
encore_framework/                        ← REPO ROOT (framework + shared pipeline)
  .claude/, .github/workflows/           ← unchanged (IP; colleague may strip from client bundle)
  .github/agents/                        ← pipeline agents — PARAMETERIZED, stay here
  scripts/                               ← pipeline scripts (client-aware via ACTIVE_CLIENT)
    shared-paths.ts                      ← NEW helper for path resolution
  src/
    framework-contracts/                 ← type shapes
    orchestrator/, worker/, data/adapters/
    utils/                               ← generic utilities only
    common/credential-loader.ts          ← generic env-driven
  tests/examples/, tests/unit/           ← framework pattern examples + framework unit tests
  config/mcp/, pipeline-*.json           ← framework config
  docs/                                  ← framework-level docs + read_only_docs/MCP_BROWSER_GUIDE.md
  plans/, package.json, tsconfig.json
  playwright.config.ts                   ← thin shim; reads ACTIVE_CLIENT
  CLAUDE.md                              ← framework setup + skill routing; includes client addendum
  HANDOFF_TO_COLLEAGUE.md                ← NEW (SP-MT-07): framework/client boundary + IP inventory
  website/                               ← independent SaaS FE (untouched)

  clients/
    encore/                              ← ALL encore-specific content
      src/ (common/base-page.ts, utils/app-constants.ts, pages/, selectors/)
      tests/ (setup/, specs/, test-data/, seed.spec.ts)
      config/ (environments/, allure/categories.json)
      docs/ (REQUIREMENTS.md, MODULE_REGISTRY.md, read_only_docs/...)
      specs_planning/ (_internal/, test-cases/, test-plans/, audits/)
      exports/
      CLAUDE.md (encore-specific LRs)
      README.md
```

### Classification rule
- **Stays at root**: file framework could reuse for ANY client unchanged.
- **Moves to `clients/encore/`**: anything embedding Navigator Cloud / Microsoft SSO / Encore
  product knowledge.
- **Gray zone → client**: base-page (imports encore selectors), app-constants (SSO timeouts),
  allure categories (Microsoft SSO regex).
- **IP directories that stay at root**: `.claude/`, `.github/agents/`, `plans/`, pipeline
  scripts, `specs_planning/_internal/` (moved under client), `docs/read_only_docs/AGENT_SHARED_RULES.md`.
  Colleague strips whatever isn't client-consumable when they build bundles.

### Path alias wiring (added in SP-MT-01)
- `@framework/*` → `src/*`
- `@client/*` → `clients/${ACTIVE_CLIENT}/src/*`
- `@client-tests/*` → `clients/${ACTIVE_CLIENT}/tests/*`
- Playwright reads `ACTIVE_CLIENT` (default `encore`), derives `testDir`, `globalSetup`,
  `globalTeardown`, dotenv path.

---

## Execution Order

```
SP-MT-01 → SP-MT-02 → SP-MT-03 → SP-MT-04 → SP-MT-05 → SP-MT-06 → SP-MT-07
```

Strict order. Each subplan verifies green before the next starts. SP-MT-04 re-greens the
pipeline after SP-MT-03 moves `specs_planning/` (interim breakage expected during
SP-MT-03 → SP-MT-04 handoff — **do not ship between those two**).

**Colleague handoff is ready after SP-MT-06 verifies green.** SP-MT-07 produces the handoff
doc but does not move the handoff moment; a fresh colleague pull at SP-MT-06-done already
works, SP-MT-07 just makes the repo's boundary legible to them.

---

## Subplan Summary

| SP | Title | Priority | One-liner |
|---|---|---|---|
| MT-01 | Scaffold + aliases + config shim | P0 | Create `clients/encore/` skeleton + path aliases, zero behavior change |
| MT-02 | Move encore test content | P0 | Relocate specs, pages, selectors, test-data, fixtures, base-page, app-constants |
| MT-03 | Move docs + specs_planning + exports + config | P0 | Relocate non-test client content |
| MT-04 | Client-aware pipeline scripts | P0 | Refactor 20+ scripts to use ACTIVE_CLIENT-resolved paths |
| MT-05 | Split CLAUDE.md + AGENT_SHARED_RULES | P1 | Extract encore-specific LRs and rules into client addendum |
| MT-06 | Parameterize pipeline agents | P1 | Remove encore hardcodes from .github/agents/*.agent.md |
| MT-07 | Handoff readiness (not a packager) | P1 | Write `HANDOFF_TO_COLLEAGUE.md` — framework/client boundary + IP inventory |

---

## Plan Disposition (multi-tenant context)

| Existing Plan | Action | Reason |
|---|---|---|
| SUBPLAN_REPO_01_CLIENT_DELIVERY_QUICK.md | SUPERSEDED, done/ | Duplicate-carve abandoned in favor of restructure |
| SUBPLAN_REPO_09_CLIENT_DELIVERY_POLISH.md | SUPERSEDED, done/ | Packaging/IP-scrub is colleague's work post-handoff |
| PLAN_CLIENT_REPO_DELIVERY.md | SUPERSEDED, done/ | Same — entirely client-packaging content |
| PLAN_MASTER_REPO_CLEANUP.md | COEXIST | Other SP-02..SP-08, SP-10..SP-13 still valid; SP-01 and SP-09 superseded here |

---

## Out of scope (master-level)

- Renaming `src/` → `framework/` (zero-churn preserved, aliases do the visual separation).
- Workspace mode (npm/yarn/pnpm workspaces).
- Rewriting `base-page.ts` to eliminate encore-selector imports (would let it stay at framework).
- Moving `website/`.
- Onboarding a second client (clients/acme/ etc.) — validates multi-tenancy but reserved for later.
- Building a client-packaging script. Scrubbing IP. Producing ZIPs. Writing client-facing
  READMEs / LICENSEs / CI workflows / FE contracts. All colleague scope post-handoff.

---

## Risks

- **Colleague blocker delay**: 7 subplans = ~7 sessions. User accepted the trade-off.
- **SP-MT-04 largest surface**: 20+ scripts written by different agents over months; budget
  extra time, may split to SP-MT-04a/04b mid-execution.
- **Handoff timing**: do NOT hand off the repo between SP-MT-03 (breaks pipeline) and SP-MT-04
  (re-greens it). Either bundle them in one merge, or delay hand-off until after SP-MT-04.
- **Historical activity log rows** reference old paths after SP-MT-03. Recommendation: leave
  historical rows as-is; validators skip pre-baseline dates.
- **Per-LR boundary in SP-MT-05**: fuzzy. Review with user before committing.
- **Implicit encore assumptions in agents (SP-MT-06)**: grep only catches obvious hardcodes;
  implicit assumptions (SSO=TOTP) need functional regen test.
- **Scope drift on SP-MT-07**: real risk a future session reverts SP-MT-07 to the old packager
  scope. The SP-MT-07 file itself carries a pivot note reminding the reader.
