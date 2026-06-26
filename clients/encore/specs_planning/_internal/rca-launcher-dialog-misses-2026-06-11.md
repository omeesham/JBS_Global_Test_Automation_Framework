# RCA — Launcher-Dialog Coverage Misses (Pay To + Master Bill To)

**Date**: 2026-06-11
**Identity**: OWNER (no §2 row covers `rca-*.md` → OWNER-only write)
**Method**: artifact-first `/rca` (Kepner-Tregoe IS/IS-NOT + Fishbone + 5 Whys), grounded in the 2026-06-11 live walk evidence.
**Incidents**: two coverage misses, both user-discovered 2026-06-11.
**Subplan**: SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC Phase 1.5

---

## Classification

| | Incident A — Pay To affordance miss | Incident B — Master Bill To shared-dialog conflation |
|---|---|---|
| Type | **TOTAL miss** (field classified read-only; launcher never seen) | **PARTIAL miss** (launcher's open proven; select/update/persist never proven) |
| Surface | Location Settings left panel — Pay To Address | Account & Address tab — Master Bill To Address |
| Severity | High — a whole interactive surface (search dialog, 7-row table, 5 filters, persist) had ZERO coverage | Medium — one of three launchers had no per-launcher select/persist proof |
| Detection | user escalation (screenshot) | user-directed check |

---

## Incident A — Evidence chain

1. **Baseline correctly saw it, classification threw it away.** `old-site-baseline/left-panel-basic-information-2026-06-03.md:43` recorded old-site Pay To Address as "clickable label/link … (link, not a value field)". But **`BL-DIV-4` (line 84) closed the divergence as "(b) intentional UX change" with NO new-site click-probe** — pure assumption.
2. **The test plan even hinted at it.** `locations_left_panel_basic_information_test_plan.md:39`: "Verify Pay To Address label may be clickable link (address picker)" — an unescalated, unactioned hint.
3. **The TC was launcher-blind.** TC-LOC-LP-004 asserts only that the display **input** is `[disabled]` — TRUE, but blind to the label launcher. Its "click → no focus" oracle even *touched* the launcher and recorded the dead disabled-input behavior as the whole story.
4. **No process layer demanded a probe.** `field-inventory-spec.md`, the `field-case-generation.md` §2 taxonomy, PLANNER.md, and the LR-013 spot-check oracle all permit recording a field as read-only/disabled **without** probing its label/container for a hidden interactive affordance.
5. **Live proof (2026-06-11):** the Pay To Address label opens a **"Pay To List"** dialog (5 filters, 13-col sortable table, 7 rows, per-row checkbox, Select-disabled-until-checked, save→`PUT update-properties`, **selection persists**). Old-site re-probe confirms the label is `cursor=pointer` on BOTH sites → the divergence is **PARITY (interactive↔interactive)**, the exact opposite of BL-DIV-4's "intentional static UX change".

## Incident B — Evidence chain

1. **Coverage stopped at "opens".** TC-LOC-ACC-012 proves the shared "Select Customer Address" dialog OPENS from the Master launcher (`btnAccMasterAddress` / `openMasterAddressDialog()` page object :329). No test selected a row via the **Master** launcher, verified the **Master** `dd` fields update, or measured Master persistence.
2. **Dialog-level coverage was treated as launcher-level coverage.** ACC-027's selection/persistence flow is hardcoded to **Venue**. Because the *same dialog* was exercised via Venue, the Master launcher was silently assumed covered.
3. **Live proof (2026-06-11):** opening the dialog from the **Master** launcher and selecting a different address **updates the Master `dd`s, leaves Venue unchanged, and PERSISTS through save+reload** — whereas the **Venue** selection does NOT persist (ACC-027, `location-account-address.spec.ts:371-388`). **Same dialog, opposite persistence per launcher.** Dialog-level coverage via Venue could never have revealed Master's behavior.

---

## Kepner-Tregoe IS / IS-NOT

| Dimension | IS | IS-NOT |
|---|---|---|
| What | read-only/launcher fields whose interactive affordance was never click-probed (A); launchers sharing a dialog where only one launcher's full cycle was proven (B) | ordinary editable fields (those got full FCC value cases) |
| Where | Pay To Address (left panel); Master Bill To Address (account-address) | Venue Name + Venue Address (GREEN — each independently proven) |
| When | classification/authoring time of the 2026-06-03 left-panel walk + the account-address coverage | at runtime (the live app always behaved as a launcher) |
| Extent | exactly the fields where a non-editable display masks an interactive control, OR a dialog is reachable from >1 launcher | not a value-correctness or selector-staleness class |

## 5 Whys (converges to ONE root cause)

1. Why was Pay To missed? → it was classified read-only from the disabled display input.
2. Why classified read-only without seeing the launcher? → nothing required probing the **label/container** for a hidden affordance.
3. Why did the baseline divergence get closed as "intentional UX change"? → BL-DIV-4 was closed without a **new-site click-probe** — assumption over evidence.
4. Why was Master assumed covered? → the shared dialog was exercised via Venue, and coverage was dedup'd **per-dialog**, not **per-launcher**.
5. Why per-dialog dedup? → no rule stated that a dialog reachable from multiple launchers needs each launcher's own select→update(→persist) proof.

**ROOT CAUSE (single, shared):** the field-coverage process had **no affordance-probe gate** — (i) a non-editable classification never required click-probing field + label + container, and (ii) a baseline "interactive→static" divergence could be closed as intentional without a new-site probe, and (iii) shared-dialog coverage was dedup'd per-dialog instead of per-launcher. All three are the same omission: **coverage was reasoned from the field's *resting appearance* and from *dialog identity*, not from its *exercised affordance per entry point*.**

---

## Per-phase-role accountability (honest)

- **HUNTER role**: recorded the old-site Pay To as a link (correct) but closed BL-DIV-4 as intentional-UX-change without a new-site probe (the originating error).
- **GIVER role**: authored the "may be clickable link" test-plan hint and never escalated it; never demanded per-launcher coverage for the shared address dialog.
- **WATCHDOG role**: false-green/completeness audits passed both gaps because the oracle asserts presence of expected outcomes, never absence of an unprobed affordance.
- *Note*: the 2026-06-03 left-panel inventory's literal `Author_Identity` frontmatter reads `OWNER` (line 8). Accountability attaches to the phase **roles** above, not to that recorded umbrella identity.

---

## Prevention (→ Phase 5.5)

1. **LR-057** (`.claude/rules/inventory.md`): affordance probe mandatory before classifying any field read-only/static/disabled — record an `affordance:` token from a live click-probe of (1) control, (2) label, (3) row/container. A baseline "interactive→static" divergence may NEVER be closed as intentional-UX-change without a new-site click-probe. **Per-launcher coverage clause**: a dialog serving multiple launchers is dedup'd per-LAUNCHER, never per-dialog. **No-taxonomy-row clause**: a Control Type / `affordance:` value with no matching `field-case-generation.md` §2 template → HALT.
2. `field-inventory-spec.md`: `affordance:` token mandate in Notes for non-editable Control Types + optional `## Launcher dialogs` section + Revision-history entry.
3. `field-case-generation.md`: new §2 row "Lookup launcher (read-only field + search dialog)" + fix stale `src/core/` runner paths.
4. PLANNER.md HARD STOP #18 + REQUIREMENTS.md HARD STOP #9 — affordance-probe hard stop (REQUIREMENTS authorizes bounded non-mutating baseline interaction so it can't collide with HARD STOP #4's "No clicks").
5. Master `PLAN_BIG_PIVOT_FCC_MASTER.md` Sweep 12 (`UNPROBED-AFFORDANCE`) + count-prose update.

**Graduating incidents**: Pay To Address / BL-DIV-4 (total miss, 2026-06-03) + Master Bill To shared-dialog conflation (partial miss). Cross-ref `agent-mistakes.md` entries dated 2026-06-11.
