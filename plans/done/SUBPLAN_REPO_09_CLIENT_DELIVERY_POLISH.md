# SUBPLAN: Client Delivery Polish (V2) — SUPERSEDED

**Status**: SUPERSEDED
**Priority**: — (was P3)
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Superseded**: 2026-04-17
**Superseded by**: `PLAN_MULTI_TENANT_RESTRUCTURE.md` (packaging is colleague's scope post-handoff)
**Originally absorbed**: PLAN_CLIENT_REPO_DELIVERY (7 critical findings + IP protection)

---

## Execution Summary

Never executed. Pivot 2026-04-16:

- User directive: *"we ship to colleague, they will ship to client, we ship everything in
  new structure, colleague decides what to give and what to not give… do not do work for
  colleague, focus on our core goal only, not theirs."*
- This subplan's entire scope — rewriting `scripts/client-package.ts`, IP scrub, bundle
  creation, FE contract, CI workflow, dep trim, barrel rewrite, smoke test — is colleague's
  work after the multi-tenant handoff.
- Our scope ends at producing the multi-tenant repo (SP-MT-01..06) plus a handoff doc
  (SP-MT-07). Colleague owns packaging from there.
- This file is kept in `plans/done/` as historical context only. If colleague later asks us
  to build packaging, we open a NEW plan scoped to that explicit ask — we do not resurrect
  this one.

No code modified. No files produced.

---

## Goal (original — retained for historical context)

Replace SP-01's sloppy V1 `encore_delivery/` with polished V2. Fix the triple-audited critical findings, build automated packaging, IP leak detection.

## 7 Critical Findings (from PLAN_CLIENT_REPO_DELIVERY triple audit)

1. **C1**: dist/ is STALE — force clean build before packaging
2. **C3**: Client fixtures missing session reuse + diagnostics features
3. **C4**: dist/index.js exports DbAdapter + S3Adapter at import time — barrel rewrite needed BEFORE dep trimming
4. **H6**: allure deps not in client package.json
5. **H8**: lint/format commands but no eslint/prettier installed
6. **NEW1**: SELECTOR_CATALOG.md copied to wrong destination path
7. **NEW2**: Depth-4 imports may not be rewritten by path rewriter

## Direction

1. Read PLAN_CLIENT_REPO_DELIVERY in full — it has detailed evidence for all 7 findings
2. Fix all 7 in `scripts/client-package.ts`
3. Build `npm run client:package` that produces clean `encore_delivery/`
4. Automated `grep -r` scan for forbidden patterns (orchestrator, .claude, agents, pipeline, worker)
5. Client-facing README.md inside `encore_delivery/`
6. CI templates (GitHub Actions + Azure DevOps)
7. Move PLAN_CLIENT_REPO_DELIVERY to `plans/done/` with execution summary
