# Plan: Capture "1101 = corporate/master office" fact + preserve Commission KT as pre-intake source

**Status**: DONE
**Executed**: 2026-06-26

### Execution Summary

All 8 plan changes delivered. No deviations from the plan.

| Change | Delivered |
|---|---|
| #1 [HUNTER] `_internal/intake/commission-hunter-2026-06-26.md` | ✓ created |
| #2 [HUNTER] REQUIREMENTS.md line 1385 cross-ref | ✓ `(corporate-only — see LR-ENC-005)` appended |
| #3 [OWNER] CLAUDE.md product-context bullet | ✓ line 32 |
| #4 [OWNER] CLAUDE.md LR-ENC-005 rule block | ✓ line 110, between LR-ENC-004 and LR-008 |
| #5 [OWNER] patterns.md step 1 augment | ✓ line 64 with 1101/1605 split |
| #6 [OWNER] navigation.md §B routing row | ✓ line 73 |
| #7 [OWNER] MODULE_REGISTRY.md Commissions row | ✓ line 35 with 1101 restriction + intake pointer |
| #8 [OWNER+HUNTER] activity-log row | ✓ 2026-06-26T10:00 |

No TCs dropped or deferred. No spec/selector/code changes.

## Context

**Why:** Rutvik stated a durable fact — *"1101 is master location… it has stuff other locations DO NOT have at all… helps us automate things we wouldn't come across on 1604."* He then supplied `Legacy_Navigator_Commission_KT_Agent_Summary.docx` as *"new info on possible new tasks… in future… requirements basically a demo of the modules."*

The KT confirms it concretely: **"Commission maintenance requires Navigator Contracts role and is restricted to corporate (1101)."** So **1101 = "Corporate Office"**, and the **Commission** feature area is the canonical 1101-only surface. `MODULE_REGISTRY.md:35` already lists **Commissions** as *not-yet-automated*; there's no commission doc in-repo → the KT is the pre-intake source for that future task.

**This plan was re-audited against live files (`/audit`), which corrected 3 assumed defects** — see "Ownership & insertion facts (verified)" below. Nothing here is assumed; each target was read.

## Ownership & insertion facts (verified against §2 table + live files)

§2 column order = `[HUNTER | GIVER | BUILDER | HEALER | WATCHDOG | GARDENER | OWNER]`.

| Target | §2 / location fact | Who may write |
|---|---|---|
| `docs/REQUIREMENTS.md` (row 82 + R11) | UPDATE=HUNTER only; **OWNER=READ** | **HUNTER** (OWNER edit = violation) |
| `specs_planning/_internal/intake/<module>-<agent>-*.md` (row 89) | CREATE=all agents, OWNER=RW | HUNTER (semantic author) or OWNER |
| flat `_internal/commission-kt-*.md` | **no matching §2 row → default-DENY** | ✗ do not use |
| `docs/MODULE_REGISTRY.md` (line 122 scope) | OWNER owns `docs/`(non-REQUIREMENTS) | OWNER |
| `clients/encore/CLAUDE.md` | client config; OWNER governs LR-ENC | OWNER |
| `.claude/context/{navigation,patterns}.md` | framework `.claude/**` → never gated | OWNER |
| `_internal/agent-activity-log.md` (row 87) | APPEND for all incl. OWNER | OWNER+HUNTER row |

CLAUDE.md insertion: LR-ENC-004 ends line **107**, LR-008 starts line **109** → LR-ENC-005 goes at line **108**. activity-log header `| Timestamp | Agent | Status | Files | Description |`, last row `2026-06-25T17:30` (today 2026-06-26 → LR-037 ordering OK).

---

## Execution identity map
- **`/identity HUNTER`** for changes #1 + #2 (requirements-intake domain).
- **OWNER** for changes #3–#7 (framework/client governance).
- One consolidated `OWNER+HUNTER` activity-log row (#7).

## Changes

### 1. [HUNTER] NEW — `clients/encore/specs_planning/_internal/intake/commission-hunter-2026-06-26.md`

Faithful transcription of the KT (no lossy paraphrase / no invented detail). **Header guards against misuse** (because `inventory.md` path-scopes this dir):
- **SOURCE**: client KT docx (2026-06-26). **STATUS**: pre-intake reference for a *possible future* Commission task — **NOT a field-inventory, NOT a baseline artifact, NOT live-verified** (no `MCP_Session_Date`; do not consume as Phase-0.5 walkthrough evidence). When committed → HUNTER Jira-first intake (LR-ENC-004) + old-site baseline walk; this file seeds, does not replace, that.
- **RESTRICTION**: corporate office **1101** only · **Navigator Contracts role** · venue commissions only (sales → Compass CRM, out of scope).

Body (verbatim-faithful): commission priority **CMP → Order-Level Adjustment → Product Code → DPCD → Tier Flat**; Tier Flat (base table by Location+Service Type, thresholds, profit-only, location-dependent ETS/Service-Charge); DPCD (flag-gated bands reduce Tier Flat, e.g. 16.01–17.00%, 100%→none, applies before Tier Flat); Product Code (overrides DPCD+Tier Flat; Category/Subcategory/Class/Subclass/Item; inheritance; "Use Default Commission" reverts; **known UI issue: checkbox may not refresh**); Order-Level Adjustment (manual per-order, overrides DPCD+Tier Flat); CMP (rare, CMP-only, 0→none); Validation (Commission by Order; daily-billing→Commission by DRO; **Mexico = daily billing**; **never switch Billing Way Event→Daily in testing**); Maintenance (manual / Import-Export / Copy Within / Copy To / History: Modify·Remove·Copy); Testing focus (hierarchy, boundary calcs, DPCD thresholds, product-hierarchy inheritance, order overrides, import/export/copy/history, service-charge/ETS).

### 2. [HUNTER] `clients/encore/docs/REQUIREMENTS.md` line 1385 — 1-token cross-ref

Append `(corporate-only — see LR-ENC-005)` to the existing Labor-on-1101 note. (No new Commission section — REQUIREMENTS.md is for *verified* behavior; unverified KT stays in the intake file.) Runs under HUNTER because OWNER is READ-only here (R11).

### 3. [OWNER] `clients/encore/CLAUDE.md` — Product context line (~line 31)
```
- **Master / corporate office**: 1101 ("Corporate Office") — NOT a day-to-day test office, but it carries data & whole feature areas 1604 lacks (Commission — corporate-only, Navigator Contracts role; Labor — NM-1881). Empty/absent on 1604 ≠ missing — re-check 1101 first (LR-ENC-005). (Currency/pricing variety lives on 1605, not 1101.)
```

### 4. [OWNER] `clients/encore/CLAUDE.md` — new LR-ENC-005 at line 108 (after LR-ENC-004, before LR-008)

**Office 1101 ("Corporate Office") is the master/superset corporate location — re-check before declaring corporate-only data/features absent.** Scope **corporate-only surfaces (Commission, Labor)** — NOT a blanket "1101 is the 2nd office" (currency/pricing variety = 1605). Covers when-to-use; canonical instances (Commission → intake KT; Labor → NM-1881); anti-pattern (concluding "missing/corrupt" from one office's empty state); **Trigger** = any walk/spec/RCA/`/find-bugs`/`/encore-questions` hitting an empty corporate-only surface on 1604. Cross-refs: NM-1881, intake KT, `patterns.md` "corrupt/atypical" tree, LR-061 (N≥2), LR-ENC-001.

### 5. [OWNER] `.claude/context/patterns.md` — augment "corrupt/atypical" tree step 1 (~line 64)

Keep the generic "test a SECOND office," ADD scoped detail (don't replace):
```
1. Test a SECOND office — does it reproduce? … Pick the right alternate: corporate-only surfaces (Commission, Labor) live on office 1101 ("Corporate Office"); currency/pricing variety lives on 1605. Re-check the right one before concluding missing/corrupt (LR-ENC-005).
```

### 6. [OWNER] `.claude/context/navigation.md` — new §B routing row (proactive index)
```
| Work a corporate-only surface (Commission, Labor) or find data empty/absent on office 1604 | Corporate-only data lives on **office 1101 ("Corporate Office")**, not 1604 (Commission needs Navigator Contracts role; Labor = NM-1881). Currency/pricing variety = 1605. | LR-ENC-005 |
```

### 7. [OWNER] `clients/encore/docs/MODULE_REGISTRY.md` line 35 — extend the 2-col cell

Keep the `| Section | Known sub-pages |` shape; append into the sub-pages cell:
```
| **Commissions** | CMP, Allow DPCD, Tier/Flat, Product Code — **corporate office 1101 only (Navigator Contracts role)**; pre-intake KT: `specs_planning/_internal/intake/commission-hunter-2026-06-26.md` |
```

### 8. [OWNER+HUNTER] `clients/encore/specs_planning/_internal/agent-activity-log.md` — append one row (LR-028)

`| 2026-06-26T<HH:MM> | OWNER+HUNTER | done | <files touched> | <why> |` — timestamp ≥ all touched-file mtimes (LR-037; trivially satisfied, last row is 2026-06-25).

---

## Out of scope (deliberately)
- **No formal plan/queue entry for Commission automation** — "possible" future; intake file + registry pointer carry the signal. When committed: HUNTER Jira-first intake (LR-ENC-004) + baseline walk.
- **No new Commission section in REQUIREMENTS.md** — verified-behavior doc; unverified KT belongs in the intake file (cross-ref only).
- **No `/regression-guard`** — 100% markdown prose; it fingerprints code structure.
- **No auto-memory file** — canonical-home table routes client facts → `clients/encore/CLAUDE.md`.
- **No spec/page-object/selector/test-data changes.**

## Verification
1. `ls clients/encore/specs_planning/_internal/intake/commission-hunter-2026-06-26.md` + spot-read → all 9 KT sections + "pre-intake, NOT field-inventory/baseline, 1101/Navigator-Contracts" header.
2. `grep -rn "1101" clients/encore/CLAUDE.md .claude/context/patterns.md .claude/context/navigation.md` → product line, LR-ENC-005, patterns step, §B row — each scoping 1101 to corporate-only (and naming 1605 for currency).
3. `grep -n "LR-ENC-005" clients/encore/docs/REQUIREMENTS.md` → line 1385 cross-ref landed (under HUNTER).
4. `grep -n "commission-hunter" clients/encore/docs/MODULE_REGISTRY.md` → Commissions cell points to the intake file + names the 1101 restriction; row still 2-column.
5. `tail -1 clients/encore/specs_planning/_internal/agent-activity-log.md` → `OWNER+HUNTER` row, timestamp 2026-06-26 ≥ mtimes.
6. LR-ENC-005 renders `###` at line ~108, between LR-ENC-004 and LR-008; cross-refs resolve.
7. (Ownership self-check) Re-run the §2 lookup: no OWNER write landed on REQUIREMENTS.md; the intake file sits under the `intake/` glob, not a flat default-deny path.
