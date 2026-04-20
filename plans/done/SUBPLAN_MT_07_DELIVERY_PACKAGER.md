# SUBPLAN MT-07: Handoff Readiness (NOT a Packager)

**Status**: PENDING
**Priority**: P1
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE
**Created**: 2026-04-16
**Revised**: 2026-04-16 (WATCHDOG audit — scope reduced per pivot)
**Depends on**: SP-MT-06 (agents must be client-agnostic before we declare "handoff ready")
**Blocks**: nothing — terminal subplan

---

## Pivot note (read first)

The earlier draft of SP-MT-07 rewrote `scripts/client-package.ts` to produce a scrubbed, zipped,
IP-filtered bundle for the client. User directive (2026-04-16) reset that scope:

> "we ship to colleague, they will ship to client, we ship everything in new structure, colleague
> decides what to give and what to not give… do not do work for colleague, focus on our core goal only, not theirs."

Consequences:
- We do NOT build a packager. We do NOT decide what reaches the end-client.
- We do NOT scrub `.claude/`, `.github/agents/`, `plans/`, `specs_planning/_internal/`, etc.
  Those ship as-is. Colleague strips whatever they choose.
- We do NOT rewrite `package.json` for a client-facing variant.
- We do NOT write a client-facing `README.md` or `FE_CONTRACT.md`.

Our core-goal boundary ends at a clean multi-tenant repo plus a handoff document that makes
the structure legible. That's all SP-MT-07 does now.

---

## Goal

Produce a single `HANDOFF_TO_COLLEAGUE.md` so colleague can take the repo after SP-MT-06
and route the right pieces to the right client bundles. Colleague owns packaging thereafter.

---

## Scope

### 1. Write `HANDOFF_TO_COLLEAGUE.md` at repo root

Sections:

1. **Repo boundary**
   - `clients/${CLIENT}/` — everything client-specific (specs, pages, selectors, fixtures,
     test-data, test-cases, test-plans, audits, docs, exports, env files, allure categories,
     LRs, rulebook addenda, internal agent state).
   - Repo root (outside `clients/`) — framework: reusable infrastructure, pipeline agents,
     skills, shared scripts, orchestrator, worker, website, plans/.

2. **What we hand over**
   - The whole repo, in the new multi-tenant structure. No pre-scrubbing. No curation.
   - Colleague pulls `main` after SP-MT-06 merges green.

3. **IP inventory (informational, not a script)**
   List of paths colleague will likely want to exclude from a client-facing bundle:
   - `.claude/` (Claude-side skills, identity, commands)
   - `.github/agents/` (pipeline agent prompts)
   - `.github/copilot-instructions.md`
   - `plans/`
   - `docs/read_only_docs/AGENT_SHARED_RULES.md`
   - `clients/${CLIENT}/specs_planning/_internal/` (agent state — mistakes, queue,
     activity log, performance, escalations, learnings, test-id-registry)
   - `clients/${CLIENT}/specs_planning/audits/`
   - `scripts/` pipeline-internal entries (planner-*, generator-*, healer-*, audit-*,
     requirements-*, sync-*, validate-*, capture-mistake, agent-metrics, task-context-builder,
     pipeline-orchestrator, archive-queue, detect-duplication, lint-test-cases,
     build-test-id-registry, check-tc-parity)
   - `src/orchestrator/`, `src/worker/`, `src/server/` (unless the client consumes them)
   - `website/` (our SaaS FE)
   This list is informational — it tells colleague what is IP; it does not execute a scrub.

4. **Client-consumable inventory (informational)**
   Paths that any client bundle plausibly keeps:
   - `playwright.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json`
   - `src/framework-contracts/`
   - `src/utils/` minus pipeline-coupled files
   - `src/common/credential-loader.ts`
   - `src/data/adapters/`
   - `scripts/cleanup-logs.ts`, `scripts/ensure-report-dirs.js`, `scripts/preserve-allure-history.js`
   - `clients/${CLIENT}/` (wholesale)
   Again — informational. Colleague decides.

5. **Existing `scripts/client-package.ts` status**
   - File exists but its path constants predate multi-tenant.
   - After SP-MT-03 moves content, those paths are stale.
   - We explicitly leave it untouched. Colleague audits and rewrites as they see fit.
   - If colleague does not need a packager at all, they can delete it.

6. **Environment variables**
   - `ACTIVE_CLIENT` — set in `config/environments/.env.development` (default `encore`).
   - Switching clients: override via `.env.local` or command line.

7. **How to onboard a second client (for colleague's roadmap)**
   - `mkdir -p clients/acme/{src,tests,config,docs,specs_planning,exports}`
   - Copy / adapt `clients/encore/CLAUDE.md` → `clients/acme/CLAUDE.md` (strip encore LRs,
     add acme-specific rules).
   - Set `ACTIVE_CLIENT=acme` for that session.
   - Our framework + agents run against the new client without code changes in `src/` or `scripts/`.

8. **Pipeline state for colleague**
   - After SP-MT-04 the pipeline resolves paths via `SHARED_PATHS` and respects `ACTIVE_CLIENT`.
   - After SP-MT-06 agents read product context from the active client's docs.
   - Colleague can run the pipeline as-is, or skip it and use the repo purely for running tests.

### 2. Short pointer at repo-root `README.md`

Add a 2–3 line section: "Multi-tenant structure — see HANDOFF_TO_COLLEAGUE.md for the
framework ↔ client boundary and the IP / client-consumable inventories."

If no root README exists, do NOT create one this session — document in
HANDOFF_TO_COLLEAGUE.md instead.

### 3. Verification that our core goal is met

No packaging verification (we aren't packaging). What we verify:
- `HANDOFF_TO_COLLEAGUE.md` exists, covers all 8 sections above.
- `clients/encore/` contains every encore-specific path promised by SP-MT-01..06.
- Root `src/`, `scripts/`, `.github/agents/`, etc. are free of encore hardcodes
  (re-verifies SP-MT-06 work).
- `npm test` green (re-verifies SP-MT-02/04/06 work is intact).
- `npm run typecheck` green.
- `npm run pipeline:preflight` green (proves pipeline works end-to-end in the new layout).

---

## Out of scope (hard)

- Rewriting `scripts/client-package.ts`.
- Producing any ZIP, bundle, dist/, or encore_delivery/ artifact.
- Deciding which pipeline scripts reach the client.
- Writing a client-facing README, LICENSE, FE_CONTRACT, or CI workflow.
- Running a bundle-install smoke test.
- IP grep verification inside any produced bundle (no bundle to grep).
- Coordinating with the colleague's FE contract details.

All of the above are colleague scope after handoff.

---

## Risks

- **Temptation to over-deliver**: natural to slip back into "let me just rewrite client-package.ts
  while I'm here." Don't. The session must stop at the handoff doc.
- **IP inventory drift**: the inventory is a point-in-time snapshot. If new IP directories are
  added later (e.g., a `scripts/new-agent-hook.ts`), the inventory goes stale. Mitigation: note
  in HANDOFF doc itself that colleague treats it as a starting checklist, not an exhaustive
  rule, and we refresh on each major change.
- **Colleague may need a packager sooner than the handoff doc implies**: if they block, that's
  a NEW session's scope — they ask, we scope a separate plan explicitly for that need. Don't
  pre-build.

---

## Critical files (touch list)

**New**:
- `HANDOFF_TO_COLLEAGUE.md` (repo root)

**Edited**:
- `README.md` (repo root) — only if it already exists. Add a pointer line. Otherwise leave alone.

**Not touched**:
- `scripts/client-package.ts` — stale paths, colleague owns.
- `package.json` scripts for `client:package` — left as-is.
- `.github/workflows/` — no new CI added; colleague owns release automation.

---

## Session checklist

- [ ] Draft `HANDOFF_TO_COLLEAGUE.md` covering all 8 sections.
- [ ] Sanity-check inventories against current repo state (don't copy from this plan — grep repo).
- [ ] Verification 1–5 green.
- [ ] Activity log entry (LR-028, LR-037).
- [ ] Status DONE, move to `plans/done/` (LR-027).
- [ ] `npm run plans:reindex`.
