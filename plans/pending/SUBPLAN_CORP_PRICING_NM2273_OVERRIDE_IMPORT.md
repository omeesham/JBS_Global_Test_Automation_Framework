# SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT — Import dialog gate + malformed rejection + file-IO edge + framework closure audit/gate ramp

**Status**: PENDING
**Priority**: P1
**Created**: 2026-07-17
**Identity**: BUILDER
**Depends on**: SUBPLAN_CORP_PRICING_NM2272_OVERRIDE_EXPORT.md
**Blocks**: (none — last of the six sprint tickets; carries framework closure tail)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli

> Superseded-by-the-six: absorbs GAP_CLOSURE Phase T2273 (import) + import-side file-IO edge from
> SHADOW_EDGE + SHADOW_FRAMEWORK_CLOSURE's do-or-die audit + gate-ramp tail as the closing phase
> (NM-2273 runs LAST of the 6). Two new runnable TCs: Upload-disabled-until-file + malformed.csv
> clean rejection on a healthy office.

---

## Context

NM-2273 is the final sprint ticket and the only one touching the Override import dialog. It covers:
(1) the Upload button disabled-until-file-selected gate (walk-A certified), (2) uploading the
existing `malformed.csv` fixture on a healthy office (1105 or 1107, NOT 1604 which is HTTP 500) and
asserting a readable rejection with zero rows changed after reload, (3) import-side file-IO edge
cases (empty file, oversized file boundary). Valid round-trip (upload a correct CSV → rows updated)
is **UNBLOCKED as of 2026-07-17** — round-trip proved on office 4107 (evidence E,
`walk-evidence-corporate-pricing-override-2026-07-17-E.md` Steps 5a+5b); Encore 4543 only blocks
1604-specific imports, NOT the round-trip on 4107. See Phase 4.

Because NM-2273 runs last of the six, it also carries the SHADOW_FRAMEWORK_CLOSURE tail: the do-or-die
audit of the full Corporate Pricing remediation chain and the announce→deny gate ramp. That phase
switches identity to WATCHDOG.

**Walk-certified data beds**: Import dialog — walk-A office 1101 (snapshot evidence from scratch worker artifact, not tracked):
dialog title "Import All Pricing Overrides", controls: "Choose a file to import data." paragraph,
"Upload file" button, "Attached file" showing "No file selected", "Upload progress" progressbar,
"Cancel" button (`data-testid="pg-override-upload-dialog-cancel"`), "Upload" button (disabled until
file selected). Export tenant-wide = 8995 rows (walk-A).

**Target offices — CANDIDATES, NOT CERTIFIED.** 1105 (9 Equipment rows, walk-A) / 1107 (walk-B) / 4107
(round-trip proven, evidence E) are *starting points for Phase 0.7*, not pre-approved beds. No phase may
consume an office this Context section names; every phase consumes the office Phase 0.7 certifies live.
**1604 = HTTP 500 on location selection alone (NM-2011, dup key 4543) — never use, never certify.**

**Existing fixtures**: `malformed.csv` and `empty.csv` exist in `clients/encore/src/data/corporate-pricing/toolbar-io.ts`
fixture registry. Existing import spec: `clients/encore/tests/corporate-pricing/corporate-pricing-loc-import.spec.ts`
already uses `malformed.csv` for location-level import — Override import reuses the same fixture via
its own page-object method.

**Gap provenance**: RCA-MATRIX.md.

**Bug findings (live-confirmed 2026-07-17)**: NM-2011 — office 1604 dup-key 4543 HTTP 500 LIVE, wrongly closed "could not recreate" (evidence C). NM-1940 — export file fails re-import on empty-Override-Price row LIVE (evidence E). NM-2186 — import UI stuck "Uploading… 50%", applies in background LIVE (evidence E). Dialog Active checkbox — `activeOnly` param appears server-side ignored, BUG-CANDIDATE (evidence C Job 3).

---

## Bootstrap

**Identity**: BUILDER (Phases 1–4); WATCHDOG (Phase 5 closure audit); OWNER (Phase 5 gate ramp)

**Skills auto-called**:
- `/identity`, `/regression-guard` (wrap), `/relevant`, `/final-q`

**Context files**:
- Walk-evidence A+B (2026-07-17); RCA-MATRIX.md
- `.claude/rules/specs.md` (LR-019, LR-066, LR-067, LR-068)
- `clients/encore/CLAUDE.md` (LR-ENC-002, LR-ENC-003, LR-ENC-005)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md`
- `.claude/rules/plan-closure.md` (LR-055 C1–C6 + ramp knobs) — for Phase 5
- `.claude/closure-config.json` — for Phase 5 gate ramp

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm NM2272 is done. Walk-evidence files exist.
2. Read navigation.md, agent-mistakes.md (BUILDER), patterns.md.
3. LR scan: LR-019, LR-022, LR-033, LR-055, LR-060, LR-066, LR-067, LR-068, LR-ENC-002, LR-ENC-003, LR-ENC-005.
4. `BrowserTool=cli`.
5. **Phase 0.7 is the first work step.** No test authoring begins until it names a certified target.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

Consumed from walk fleet 2026-07-17. `baselineScope: baseline-absent` (net-new module).

---

## Phase 0.7 — Certify a healthy import target FIRST (BUILDER) — **BLOCKING GATE**

**This is the first task of this subplan. Nothing in Phases 1–4 may begin until it produces a certified
target.** Provenance: Rutvik 2026-07-23.

### Why this phase exists

Office **1604 fails on location selection alone** — selecting it in the Override screen fires the grid
API and returns HTTP 500 (NM-2011, duplicate product-group key 4543). That is not an import defect; it
is a *target* defect that poisons every test aimed at that office before the import surface is even
reached. Automating against a target with that class of fault produces red tests that say nothing about
the feature under test.

Every "healthy office" claim in this plan and its sibling (1105, 1107, 4107) is inherited from earlier
walk notes. **Inherited health is a hypothesis, not a certification** — this repo has already been burned
by claims recorded without the observation that would justify them (see
`plans/pending/PLAN_58_COVERAGE_MANIFEST_ORACLE_GATE.md`). Certify live, in this session, before building.

### The job

1. **Pick a candidate and certify it live.** Candidate order (strongest first — do not skip ahead
   without recording why):
   - **4107** — designated e2e office AND the only office with a proven clean import round-trip
     (`walk-evidence-corporate-pricing-override-2026-07-17-E.md`, Steps 5a/5b/6).
   - **1105**, **1107** — asserted healthy in walk-A/walk-B; unverified for import.
   - Any other office. The e2e tenant is disposable — you are **not** limited to a named list.
   - **NEVER 1604.**

2. **Certification checklist — every item observed live, not inferred.** Record the actual observation
   (value seen, count seen), never a bare ✓:
   - [ ] Selecting the office in the Override location picker completes with **no HTTP 500 and no error
         toast**. Watch the network, not just the screen (LR-033) — a silent client-side failure and a
         server 500 look identical in a screenshot.
   - [ ] The grid renders. Record the Equipment row count and the Labor row count **separately** — an
         office with zero Labor rows cannot carry the Labor half of this surface.
   - [ ] Record the currency (or currencies) present. Multi-currency offices behave differently
         (NM-1472 currency gating).
   - [ ] The office's rows appear in the tenant-wide export, so an import round-trip can actually
         target them.
   - [ ] No product-group key appears twice for this office — the 4543 defect class is a duplicate key.

3. **If a candidate fails any item, move to the next candidate and keep going.** Do not stop, do not
   report "no healthy office found", and do not proceed on a partial pass. Standing instruction
   (Rutvik): if the target lacks what you need, find another target — do not stop until you have one.
   Record each rejected candidate and the specific item it failed; a rejection list is evidence, and the
   next agent should not re-test what you already disqualified.

4. **Know the blast radius before you write to anything.** The import file is **tenant-wide**, and the
   semantics are **UPSERT-ALL**: every row in the uploaded CSV gets its Mod Date + Updated By stamped,
   including rows whose values did not change (evidence E). So the certified target governs which
   *values* you change, but the *metadata* touch is tenant-wide. State this explicitly in the artifact
   so nobody later mistakes a refreshed Mod Date elsewhere for a bug.

5. **Emit the artifact**:
   `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-import-target-<YYYY-MM-DD>.md`
   containing: the certified office, every checklist observation with its real value, the rejected
   candidates with their failing item, and the blast-radius note.

### Gate

Phases 1–4 consume **the office named in that artifact**. If the artifact does not exist or does not
name a certified target, **HALT** — do not fall back to a hardcoded office from this plan's Context
section, and do not proceed against 1604 under any circumstance.

---

## Phase 1 — Upload button disabled until file selected (BUILDER)

1. Author NEW TC: open import dialog on **the Phase 0.7 certified office** → assert "Upload" button is
   disabled; assert "No file selected" text visible. This is the gate that prevents empty uploads.
   Walk-A certified: "Upload" button disabled until file selected.
2. Assert dialog title "Import All Pricing Overrides" and presence of Cancel button.
3. After file selection (use any fixture), assert "Upload" button becomes enabled.

---

## Phase 2 — Malformed CSV clean rejection (BUILDER)

1. Author NEW TC: on **the Phase 0.7 certified office** (never 1604), open import dialog → upload existing
   `malformed.csv` fixture → assert a readable rejection message appears (error banner / toast /
   inline message — walk the actual UI response). Assert zero rows changed: capture row snapshot
   before import, reload after rejection, compare row data unchanged.
2. Per LR-019: per-test baseline in `beforeEach` — snapshot grid state before import attempt.
3. Per LR-067: save-honesty — verify the rejection truly prevented mutation (reload + compare).

---

## Phase 3 — Import-side file-IO edge cases (BUILDER)

1. Author NEW TC(s) from existing `empty.csv` fixture: upload empty file → assert readable rejection
   (not a crash or silent success). Zero rows changed after reload.
2. If additional import-side edge families are identified from the SHADOW_EDGE allocation (oversized
   file, wrong extension), record as `blocked-pending-fixture` if no fixture exists — do NOT
   fabricate test data without walk-certified evidence of the expected behavior.

---

## Phase 4 — Valid import round-trip (BUILDER) [UNBLOCKED 2026-07-17]

**UNBLOCKED** — round-trip proved on office 4107 (evidence E,
`walk-evidence-corporate-pricing-override-2026-07-17-E.md`, Steps 5a + 5b + 6). Encore 4543 blocks
1604-specific imports only; 4107 is clean. No preview screen (direct commit, unlike NM-2265 sibling);
UPSERT-ALL semantics (every row in CSV gets Mod Date + Updated By updated, even unchanged rows).

**TC to author — positive round-trip.** Target = **the Phase 0.7 certified office**. The steps below are
the worked example from evidence E on office 4107 (row 4107/4298, `152.00 → 152.01 → 152.00`) — if Phase
0.7 certifies 4107, use them verbatim; if it certifies a different office, keep the *sequence* and
re-derive the office/product-group/price values from that office's own live grid. Do NOT carry 4107's
values onto another office.
1. Export: trigger Export button → save CSV (tenant-wide, `ProductGroupOverrides_YYYYMMDD_HHMMSSUTC.csv`).
2. Pre-process fixture: filter out rows where column[6] (Override Price) is empty — NM-1940 workaround;
   the raw export contains one such row (`1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0`) that
   aborts the entire import. Remove it before upload.
3. Modify target row: change 4107/4298 Override Price by a small delta (e.g. 152.00 → 152.01).
4. Set file on input:
   `page.locator('[data-testid="pg-override-upload-dialog-file-input"]').setInputFiles(filePath)`.
5. Click Upload:
   `page.locator('[data-testid="pg-override-upload-dialog-upload"]').click()`.
6. Handle NM-2186: expect "Uploading… 50%" stuck UI — do NOT wait for dialog close (it never closes);
   wait for POST to complete, then dismiss via Escape or Cancel if available.
7. NM-2073: `await page.reload()` then re-select office 4107 via location picker before reading grid.
8. Assert: grid shows modified Override Price (152.01).
9. Restore: repeat steps 1–7 with original value (152.00); assert restored.

**TC to author — NM-1940 negative path (regression documentation):**
Upload the raw unmodified export (no pre-processing, empty-Override-Price row intact) → assert
dialog shows error: `Error Row#:19, Msg: LocationId, ProductGroupId, OverridePrice is required.`
→ assert grid data unchanged after reload + re-select (full rollback, no partial apply). This TC
documents the NM-1940 live regression. Cite evidence E Step 4.

---

## Phase 5 — Framework closure: do-or-die audit + gate ramp (from SHADOW_FRAMEWORK_CLOSURE)

**Identity switch**: WATCHDOG (audit) → OWNER (gate ramp). This phase runs ONLY after all five
preceding NM ticket plans (NM2268–NM2272) are DONE and green.

1. **Do-or-die audit (WATCHDOG)**: every drift-ledger row dispositioned (STILL-GREEN re-verified /
   fixed / named-and-deferred). Full `corporate-pricing` suite green ×2 (`--workers=1`).
   `check:tc-parity` / `xlsx:lint` / `typecheck` exit 0. No `(skipped)` Per-Identity cells without
   ≥20-char reason (C6). Fresh-context adversarial review (AUD-017 — no self-grade).
2. **Negative-test prevention guards (WATCHDOG)**: prove each guard catches its original miss —
   M1 positive-control (LR-061), M2 enumerator (LR-062 Cx) incl. cold-start hardening,
   M3 no-red-close, M4 empty-surface (LR-040(c)), M5 surface-family Cx (LR-065). META parity exit 0.
3. **Gate ramp (OWNER)**: only after Phase 5.2 passes — flip `coverage_mode` / `test_status_mode`
   announce→deny in `.claude/closure-config.json`. Record ramp + negative-test evidence.

---

## Phase 6 — PARKED: Office alignment (from PLAN_LEGACY_OFFICE_MIGRATION_AND_GAP_RETROFIT)

**PARKED** — do NOT execute until Rutvik explicitly green-lights. Migrate import tests to designated
offices {4104, 4107, 9220, 9311, 2463, 8843}. 9311/2463 ZERO override data (walk-certified); data
seeding prerequisite. 4104/4107/8843 are thin. Provenance: Rutvik 2026-07-17.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW / APPEND with grep-verification. Bare deferral = HALT + ask.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | import-target certification artifact (Phase 0.7 — pre-build recon, executed by the BUILDER seat; no identity switch) | `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-import-target-<YYYY-MM-DD>.md` | artifact exists AND names a certified office; `grep -c "1604" <artifact>` shows it only as a rejected/never-use entry |
| GIVER | test-cases MD + test-plan MD + XLSX | `clients/encore/specs_planning/test-cases/corporate_pricing_override_test_cases.md` (Upload-disabled + malformed-rejection + empty-file TCs) | `npm run check:tc-parity` exit 0 |
| BUILDER | corporate-override-import.spec.ts + page object extensions | `clients/encore/tests/corporate-override/corporate-override-import.spec.ts` (Phase 1–3 TCs) | `npx playwright test --list` resolves new TC IDs; spec run green ×2 |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | closure audit findings + guard negative-test report | `clients/encore/specs_planning/_internal/corp-pricing-remediation-closure-audit-2026-06-19.md` (Phase 5 audit verdict) | audit verdict GREEN; full suite green ×2 |
| GARDENER | (none) | (none) | (none) |
| OWNER | gate ramp | `.claude/closure-config.json` (Phase 5 ramp) | `grep -E "coverage_mode\|test_status_mode" .claude/closure-config.json` = `deny` (post-Phase 5) |

---

## Acceptance criteria

- [ ] **Phase 0.7 target certification artifact exists**, names one certified office, records every
      checklist item with its observed value (not a bare ✓), lists rejected candidates with the item each
      failed, and carries the tenant-wide UPSERT-ALL blast-radius note
- [ ] **Every Phase 1–4 TC targets the certified office from that artifact** — grep the spec for the
      office constant and confirm it matches; zero TCs target 1604
- [ ] Upload-disabled-until-file TC: assert Upload button disabled before file selection, enabled after
- [ ] Malformed CSV rejection TC: `malformed.csv` on healthy office (1105/1107) → readable error + zero rows changed (LR-067)
- [ ] Empty file edge TC: `empty.csv` → readable rejection + zero rows changed
- [ ] Valid round-trip TC: export → pre-process (filter empty-Override-Price rows per NM-1940 workaround) → modify 4107/4298 → upload → handle NM-2186 50%-stuck → reload+re-select → assert value → restore (evidence E)
- [ ] NM-1940 negative-path TC: raw unmodified export upload → assert `Error Row#:19, Msg: LocationId, ProductGroupId, OverridePrice is required.` rejection, grid unchanged after reload
- [ ] Framework closure audit: every ledger row dispositioned; full suite green ×2; parity/lint/typecheck exit 0
- [ ] All 5 prevention guards (M1–M5) negative-tested to DENY/flag their original miss
- [ ] Gates ramped announce→deny with recorded evidence
- [ ] Per-test baseline (LR-019); save honesty (LR-067); effect deltas (LR-068)
- [ ] MD + test-plan + XLSX parity (LR-ENC-002); `npm run check:tc-parity` exit 0
- [ ] Full override spec run green ×2; `/regression-guard`; activity-log; `/final-q`

---

## Verification

```bash
npx playwright test --list corporate-pricing-override   # expect: new TC IDs for import phases
npm run check:tc-parity                                  # expect: exit 0
```

---

## Handoff (post-execution)

Chat-only per LR-039. Final sprint ticket: import dialog gate, malformed CSV rejection, file-IO edge,
plus framework closure audit and gate ramp. This is the terminal node — no successor ticket inherits.
