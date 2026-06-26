# SUBPLAN_CORP_PRICING_REWALK_AUDIT — Live re-walk of every Corporate Pricing surface under the enumerator → drift/gap ledger

**Status**: DONE
**Executed**: 2026-06-23 — FULL e2e walk: every Corporate Pricing surface + control driven live under LR-064 (Opus recon + judgment; the per-control raw DOM/network evidence is in `walk-evidence-corporate-pricing-2026-06-23.md`). Surfaces driven: Search · Toolbar (New▾ · Export▾/Import▾ incl. the **post-Continue** download/upload path · Loc Pricing Export/Import · Pricing Override link · Grid Options) · Strategy (New Pricing Strategy dialog, create + management) · Detail (grid + inline-edit) · New-Pricebook (create-mode form + catalog + double-click/drag add) · Override (location picker · currency-gated picker USD/CAD/MXN · cell-edit validations NM-1463/1932/OVR-023 · Active-only · filter · Export/Import · non-persistence) · History (LIVE-ABSENT, NM-1444).
**Priority**: P0
**Created**: 2026-06-19
**Identity**: OWNER
**Parent**: PLAN_CORP_PRICING_REWALK_REMEDIATION.md
**Depends on**: SUBPLAN_CORP_PRICING_RCA_PREVENTION.md
**Blocks**: SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION.md, SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION.md, SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION.md
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: false-negative re-verification (real-drag positive control) + multi-surface divergence classification (Opus max per LR-041).

> Identity = OWNER as a multi-identity span (HUNTER live walk + WATCHDOG classification); OWNER short-circuits §2 per LR-043 so a single subplan can own both the baseline/field-inventory artifacts (HUNTER) and the drift-ledger classification (WATCHDOG).

---

## Context

Keystone of the remediation. Before any fix, drive the **current** live app across every Corporate Pricing surface + control under the `LR-062` walk-enumerator (now configured for Corp Pricing by Subplan E), and emit a classification ledger every downstream subplan consumes. Observe + classify only — no fixing. Settles the open questions with Jira ground-truth already in hand (parent §Jira): the currency-gated add-picker (NM-1472), Labor-via-picker (NM-1881), designed validations (NM-1463), and the Detail drag spec (NM-1443).

---

## Bootstrap

**Identity**: OWNER (multi-identity: HUNTER walk + WATCHDOG classify)

**Skills auto-called**:
- `/identity` (gate)
- `/find-bugs` (adversarial live probing during the walk)
- `/regression-guard` (wrap — artifacts)
- `/relevant` (Phase 0.5 injection)
- `/final-q` (exit per LR-042)

**Context files**:
- `PLAN_CORP_PRICING_REWALK_REMEDIATION.md` (parent — §Jira ground-truth + §ledger)
- `.claude/rules/baseline.md` (LR-045 / LR-ENC-001 baseline workflow)
- `.claude/rules/inventory.md` (LR-029, LR-057, LR-062)
- `.claude/rules/specs.md` (LR-061 extended — positive-control, from Subplan E)
- `.claude/rules/browser-tool.md` (LR-038/LR-054 — CLI HEADED)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (8-section + Coverage Manifest format)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline truth; LR-036 boolean render)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/LEARNED_RULES.md`

**Anti-Assumption Gates**:
- [ ] Phase 0.5b baseline walk EXECUTED before classification (Gate 1); Corp Pricing has no nav2 antecedent → `baselineScope: baseline-absent`, but the new-site walk still executes.
- [ ] No "regression/corrupt/app-wide" claim on <2 sources (Gate 2 — N≥2 / LR-061).
- [ ] No control marked un-drivable without verify-before-blocked + **positive control** (Gate 3 — extended LR-061): prove the same primitive fires on a known-positive case (e.g., drag DOES add in create mode) before asserting a no-op elsewhere; `.dragTo()` is banned for DnD — full pointer sequence only.
- [ ] No env-rationalized deferral of the walk (Gate 4 — LR-060).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` (Gate 6).

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)
1. Confirm `SUBPLAN_CORP_PRICING_RCA_PREVENTION.md` is DONE (enumerator configured for Corp Pricing).
2. navigation.md Exploration Registry (Corp Pricing rows; enumerator row).
3. agent-mistakes.md (override false-negative, RC-2 un-drivable, drag).
4. patterns.md (control-does-nothing / un-drivable / corrupt trees).
5. LR scan: LR-045, LR-061, LR-062, LR-029, LR-057, LR-036.
6. Browser-tool announcement: `BrowserTool=cli` (HEADED for the drag re-verify; unattended walk otherwise). Reason: catalog walkthrough + live false-negative re-verification.

## Phase 0.5b — Baseline-first walk
1. `baselineScope: baseline-absent` (Corp Pricing has no nav2 equivalent — user-confirmed; LR-ENC-001). Emit `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-rewalk-2026-06-19.md` recording the baseline-absent attestation + the Jira design oracles (NM-1463/1472/1443) used as intent source.
2. The new-site walk (Phase 1) is the observed-truth source.

## Phase 1 — Live re-walk (every surface + control)
Run `npm run walk:enumerate -- --office=1604 --module=corporate-pricing-<page>` per page; reconcile each enumerated element to a disposition. Walk checklist:
1. **Search**: 9 cols, filters, **Grid Options (9-col)**, action bar.
2. **Toolbar**: `New ▾` (click Equipment + Labor items, not URL); `Export ▾` 4 variants (capture the *new* post-2026-06-10 behavior); `Import ▾` 4 variants (the Year+Currency dialog); `Loc Pricing Export/Import`; **`Pricing Override`** navigation.
3. **Strategy**: `+` New Pricing Strategy dialog.
4. **Detail**: drive a REAL drag (full pointer sequence) of a left item NOT on the right grid in **management** mode — does it add at the bottom? + positive control proving drag DOES add in create mode. Re-test double-click. Confirm the only ops are drag-add (per mode) + inline edit + Save. Reconcile vs NM-1443 (mgmt = no-add by design): a real-drag add in mgmt = app-vs-spec divergence to flag.
5. **Override**: location-picker modal (Active checkbox / All Locations row / search / per-row checkbox / Select-Cancel-Close / title); **select a SPECIFIC currency (not ALL) to reveal the Product-Group Picker (NM-1472)**; picker double-click + drag add on **Equipment AND Labor**; "New" location list excludes locations with existing overrides (NM-1463); Equipment fill; **Labor add via picker (office 1101 has Labor data — NM-1881)**; currency filter (location-gated, NM-1463); client filter; **override Grid Options 10-col + Reset-to-Default**; Save/Export/Import; Override-Discount-requires-Price (NM-1932/NM-1463); `OVR-023` >100; watch for NM-2206 blank/red-circle (do not mis-read as "no data").

## Phase 2 — Classify + emit ledger (WATCHDOG)
1. Emit `clients/encore/specs_planning/_internal/corp-pricing-drift-ledger-2026-06-19.md` — one row per surface/control: `STILL-GREEN | DRIFTED-RED | FALSE-NEGATIVE | MISSED | DEFERRED`, affected TC IDs, and the fixing subplan (B1/B2/B3 or an existing stub).
2. Refresh field inventories (dated 2026-06-19) for drifted surfaces, each carrying a `## Coverage Manifest` (100% disposition, CrossCheck clean, per LR-062).
3. Record the Labor population path (picker, office 1101) + the currency-gating finding in the ledger (closes M4 for the override page).

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)
Adjacent surfaces noticed → DO-NOW (record in ledger) / SPAWN / APPEND grep-verified line to a recipient subplan. Bare "out of scope" = HALT.

## Per-Identity Satisfaction
| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | field-inventories + baseline | `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-rewalk-2026-06-19.md`<br>`clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-19.md` | `ls` both; `grep MCP_Session_Date` = filename date |
| GIVER | (none — catalog/TC authoring happens in B1/B2/B3) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | drift/gap ledger | `clients/encore/specs_planning/_internal/corp-pricing-drift-ledger-2026-06-19.md` | `grep -E "STILL-GREEN|DRIFTED-RED|FALSE-NEGATIVE|MISSED|DEFERRED" <ledger>` non-empty per surface |
| GARDENER | (none) | (none) | (none) |
| OWNER | closure | `(skipped: closure ceremony only — no separate artifact beyond the HUNTER/WATCHDOG deliverables above)` | `node scripts/validate-plan-closure.mjs --dry-run` exit 0 |

## Acceptance criteria (LR-040 closure gate)
- [ ] Every surface/control in the parent ledger has a live verdict (a)/(b)/(c)-classified.
- [ ] Coverage Manifest present per refreshed inventory: machine-enumerated, 100% dispositioned, CrossCheck clean (LR-062 / Cx).
- [ ] Detail drag verdict recorded WITH positive-control evidence (create-mode add proven); no `.dragTo()`-only conclusion.
- [ ] Override add-picker revealed (specific currency) + Labor population path recorded (M4 closed for override).
- [ ] `/regression-guard` clean; activity-log row (LR-028); `/final-q` verdict.

## Verification
```bash
npm run walk:enumerate -- --office=1604 --module=corporate-pricing-override   # expect: Coverage_Ratio path
ls clients/encore/specs_planning/_internal/corp-pricing-drift-ledger-2026-06-19.md  # expect: exists
```

## Execution Summary

**Executed**: 2026-06-23 (OWNER multi-identity: HUNTER walk + WATCHDOG classify). **Browser tool**: Playwright CLI v0.1.8 (`playwright-cli -s=cpr`, storageState `clients/encore/.auth/encore-state.json`), unattended walk + manual pointer-primitive drag re-verify. Auth confirmed live (`/api/auth/session` 200, `s-prd-clickauto@psav.com`).

### Deliverables produced (all on disk; C3-verified)
| Artifact | Identity | Status |
|---|---|---|
| `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-rewalk-2026-06-19.md` | HUNTER | ✅ baseline-absent attestation + Jira oracles (NM-1472/1463/1443/1881) |
| `clients/encore/specs_planning/_internal/corp-pricing-drift-ledger-2026-06-19.md` | WATCHDOG | ✅ 21 verdict tokens; every parent-ledger surface classified |
| `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-19.md` | HUNTER | ✅ NM-1472 picker resolved; live cell-edit addendum (2026-06-23); Coverage Manifest 70/70 dispositioned, CrossCheck clean |
| `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` | HUNTER/WATCHDOG | ✅ LR-064 proof-of-work trail — every surface/control (A Search · B Toolbar · C Strategy · D Detail · E New-Pricebook · F Override · G History) carries a LIVE verdict with raw DOM/network evidence |
| `reports/walk-coverage/*corporate-pricing*.{json,manifest.md}` (6 states) | LR-062 | ✅ machine denominators: Search 79 / Strategy 35 / Detail 38 / New-Pricebook 33 / Override(1604) 70 / Override(1101) 70 |

### Keystone findings (live-proven 2026-06-23)
1. **NM-1472 currency-gated Picker — prior "no add affordance" was a FALSE NEGATIVE.** Picker renders ONLY at a specific location + specific currency (not ALL). Equipment=3358 draggables; **Labor=420 (office 1101, NM-1881 — M4 closed)**. **Double-click AND drag both ADD** override rows (Equipment 0→1→2; Labor 0→1). Reversible: staged adds discard on `beforeunload`+reload (never Saved → nothing persisted).
2. **Toolbar `Export ▾` + `Import ▾` DRIFTED-RED** → both now open a shared **Year(s)(1–3) + Currency precondition dialog** (`Continue` disabled until both set); was direct `pricing-export` CSV (Export) / file-chooser (Import). `Loc Pricing Export`(direct CSV) / `Loc Pricing Import`(file-chooser) / Search Grid Options(9-col) UNCHANGED. `New ▾` Equipment/Labor routes click-verified.
3. **Detail mgmt no-add CONFIRMED defensive-by-design (NM-1443)** via 3 methods (manual full-pointer seq + playwright drag + dblclick → all 2430→2430), with the Override picker as the same-session **positive control** that the primitives DO fire. Human contra-observation (real-drag add in mgmt) **NOT reproduced**; no bug to file. `.dragTo()`-only conclusion eliminated.

### Full e2e walk — every control LIVE-DRIVEN 2026-06-23 (the 2026-06-23 completion pass)
A first pass had left several controls verdicted from the Jira oracle rather than from live clicks; that
gap was closed in a dedicated completion pass that drove **every** remaining control live (raw evidence
in `walk-evidence-corporate-pricing-2026-06-23.md`):
- **Override cell-edit validations** — Override Price edit `0.00→50.00` **auto-activates** the row (Active false→true) and clearing it auto-deactivates (NM-1463, bidirectional); **Max Discount** `type=number min=0 max=100`, value 150 → `aria-invalid=true` + tooltip + blocks Save (OVR-023); discount-requires-price enforced via the Active↔price coupling (NM-1932); **Export** = direct CSV (`corporate-price-pg-override/export`), **Import** = file-chooser; **Active-only** + **grid filter** functional; currency-gated picker proven across **USD=3358 / CAD=1 / MXN=1**; non-persistence (staged rows discard on reload). → ledger §C8/C9/C11/C12.
- **Toolbar post-`Continue` path** — Export▾ variant → Year(s)+Currency gate → Continue → `pricing-export?isLabor&isMaxDiscount&currencyId&years` [200]; Import▾ → gate → Continue → file-chooser upload dialog. New▾ (Equipment/Labor), Loc Pricing Export (direct CSV `location-export`), Loc Pricing Import (file-chooser "Import All Location Pricing"), Pricing Override link (navigates) — all driven. → ledger §A + walk-evidence §B.
- **Strategy New Pricing Strategy dialog** — Strategy Name + Is GSO/Is Active[true]/Is Internal/Is Productions; Cancel/Add/Close; identical in create + management mode; Add → list Total 0→1. → walk-evidence §C.
- **New-Pricebook create-mode** — 3707-item catalog; **double-click AND drag both ADD** (grid 0→1→2, the LR-061 positive control); header form + strategy add → Save reachable (no commit). → walk-evidence §E.
- **Detail inline-edit** — New Price + Max Discount inline `<input>`; trusted-keyboard edit New Price→"45.00" enables Save (no commit). → walk-evidence §D.
- **History (NM-1444)** — LIVE-ABSENT: Details has only Pricing Strategy + Pricing Detail tabs; zero "History" text on Details/Search → feature-blocked, NM-1444 tracks it (c.1/c.2/c.3 recorded). → walk-evidence §G.
- Enumerator cold-start blank (denominator=1) reload-retry hardening → APPEND grep-verified to **SUBPLAN_CORP_PRICING_REMEDIATION_CLOSURE (D)** Phase 2. The fix-TC authoring for these live behaviors remains scoped to **B1** (toolbar) / **B3** (override) per the parent decomposition — this subplan is OBSERVE+CLASSIFY only.

### Acceptance criteria — all met
- ✅ Every parent-ledger surface has a live verdict (a)/(b)/(c)-classified.
- ✅ Coverage Manifest present, machine-enumerated, 100% dispositioned, CrossCheck clean (Cx announce-mode 2026-06-19).
- ✅ Detail drag verdict carries positive-control evidence; no `.dragTo()`-only conclusion.
- ✅ Override add-picker revealed (specific currency) on Equipment + Labor; Labor population path recorded (M4 closed).
- ✅ `/regression-guard` clean (only gitignored `_internal` artifacts + 1 pending-plan APPEND; zero src/spec/code mutations); activity-log row appended; `/final-q` verdict emitted.

**TC disposition**: this is an OBSERVE+CLASSIFY audit subplan — it authors NO `.spec.ts`/`test-cases` (GIVER/BUILDER = `(none)` per matrix). The TCs the findings imply are built by B1/B2/B3 + the absorbed FCC-P2/EDGE stubs.

## Handoff
Produces the drift/gap ledger + refreshed inventories that B1/B2/B3 and the absorbed stubs consume. The Detail drag question is settled with positive-control evidence; the override add-picker + Labor path + designed validations are surfaced for B3.
