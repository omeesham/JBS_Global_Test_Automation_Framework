---
title: v6-D Manifest + Layout — EXEMPT manifests + full schema enforcement + artifact existence/hash + no silent git errors + staged-blob authority for --changed
Parent: PLAN_CLOSURE_GATE_V6_PARENT.md
Status: PENDING-DRAFT-v6
Priority: P0-EMERGENCY
Created: 2026-05-18
Identity: OWNER
Model: claude-opus-4-7
Thinking: max
PermissionMode: auto
RiskAcknowledged: true
BrowserTool: none
Justification: max — addresses 1 CRITICAL (A1) + 2 HIGH (B3, B6) + half of B7 + C1; manifest is the evidence surface
closure_meta: false
---

## TODO — author this subplan in its own session per PROMISE-PAIRED-TEST DISCIPLINE

This is a STUB. Open via `/planning SUBPLAN_CLOSURE_GATE_V6_D_MANIFEST_LAYOUT.md` in a fresh session AFTER v6-C closes GREEN.

## Scope hint (from parent matrix)

- `scripts/validate-plan-closure.mjs` `writeManifestFile()` — PASS and EXEMPT both produce manifest (A1 fix); add `status` field to manifest so layout can distinguish
- `scripts/validate-plan-closure.mjs` `runSingle()` — `if (opts.writeManifest && (result.status === 'PASS' || result.status === 'EXEMPT'))`
- `scripts/validate-plan-closure.mjs` `runChanged()` — remove silent try/catch on gitExec; let B15 errors propagate (B3 fix); body read via `git show :${p}` (staged blob, not working tree — C1 fix)
- `scripts/validate-plan-closure.mjs` `runStaged()` — same B3 fix
- `scripts/validate-plan-layout.mjs` `checkDoneDir()` — manifest validation enforces ALL fields: plan_sha256 + validator_version + validator_config_sha256 (matches configHash()) + validator_self_hash (presence only) + additionalProperties:false-style rejection of unknown root keys (B6 fix)
- `scripts/validate-plan-layout.mjs` artifact verification — missing artifact file = RED; tampered hash = RED (B7 layout-half — pairs with v6-C's C3-half)
- `plans/_closure_manifests/.gitkeep` (NEW — ensures dir tracked)
- `scripts/validate-plan-closure.mjs --all --enforce --rewrite-manifests` migration tool (Layer 1 row M1 — v5 Phase 11; user-invoked only; bulk-rewrite manifests under new validator version when `validator_config_sha256` or `validator_self_hash` changes; idempotent re-run safe) — was silently absent from prior v6-D scope hint; reinstated 2026-05-18
- `scripts/test-fixtures/plan-closure/*.md` — 10+ new fixtures (good-manifest-pass, good-manifest-exempt, bad-manifest-missing-config-hash, bad-manifest-missing-self-hash, bad-manifest-additional-properties, bad-manifest-tampered-artifact, bad-manifest-missing-artifact-file, bad-runchanged-git-error-not-pass, good-rewrite-manifests-bumps-version)

## Defects this chunk resolves (Preservation Matrix Layer 2)

- A1 (CRITICAL): Closure manifest written for EXEMPT plans (not just PASS)
- B3 (HIGH): runChanged + runStaged no longer silently convert git errors to PASS
- B6 (HIGH): Manifest validation enforces full schema
- B7 (HIGH, layout-half): Layout missing-artifact / tampered-hash = RED (NOT skip if missing) — v6-C handles C3-half
- C1 (MEDIUM): `--changed` mode uses staged blob (same authority as `--staged`)

## Preservation Matrix Layer 1 rows this chunk owns

B5, B6, B7, B15(partial), NB1, M1, M2(partial), F3, F4, V6, V7, V10, NV2

## PROMISE-PAIRED-TEST table (to be filled in authoring session)

| Plan-body promise | Paired self-test |
|---|---|

## Acceptance

- [ ] writeManifestFile + runSingle + runChanged + runStaged + layout match plan promises.
- [ ] ≥10 fixtures + corresponding self-test assertions in both validate-plan-closure and validate-plan-layout self-tests.
- [ ] Synthetic test: EXEMPT plan → manifest written with `status: "EXEMPT"`.
- [ ] Synthetic test: git diff fails in runChanged → exit code 1 (NOT silent PASS).
- [ ] Synthetic test: manifest missing validator_config_sha256 → layout returns RED.
- [ ] Synthetic test: manifest artifact path points to missing file → layout returns RED (NOT skip).
- [ ] Synthetic test: `validate-plan-closure.mjs --all --enforce --rewrite-manifests` after bumping `validator_config_sha256` regenerates all manifests with new hash, exit 0; re-run is idempotent. (M1 / v5 Phase 11 coverage.)
- [ ] External auditor pass returns GREEN before v6-E begins.
- [ ] Closure manifest written for this subplan.
