**Status**: Pending
**Executed**: 2026-07-28
**Priority**: P0
**Created**: 2026-07-27
**Identity**: GARDENER
**Parent**: PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md
**Depends on**: SUBPLAN_59C_OVERRIDE_CODE_FOLDERISATION.md
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

> 🤖 **SESSION BOOTSTRAP** — This file runs cold with `/execute SUBPLAN_59D_OVERRIDE_NONCODE_FOOTPRINT.md` and nothing else.
>
> Bootstrap sequence:
> 1. Load identity → `/identity GARDENER`
> 2. Load skills → `/relevant`
> 3. Resolve model `claude-sonnet-4-6`, thinking `hi`, PermissionMode `auto`, BrowserTool `none`
> 4. **Dependency gate** — HALT if `SUBPLAN_59C_OVERRIDE_CODE_FOLDERISATION.md` does not carry `Status: Pending` flipped to done (i.e., its Execution Summary is absent); read that summary to confirm (a) the new group module code (expected: `COR`) and (b) the exact list of NM submodule codes and spec filenames 59C created under `clients/encore/tests/corporate-override/`
> 5. Read `PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md` in full
> 6. Phase 0 first → Phases 1–9 in order → handoff
>
> HALT+ASK triggers:
> - 59C Execution Summary absent → HALT; block on dependency
> - Phase 0 reveals module code differs from `COR` → update all hard-coded `COR` values throughout this plan before proceeding
> - Phase 9 `verify:no-stale-refs` exits non-zero → diagnose and fix before handoff; do NOT claim clean
> - Any pending plan edit collides with a concurrent 59A/59B execution → raise in ASK

---

# SUBPLAN 59D — Override Non-Code Footprint

## Context

59C folderises the `corporate-override` group in product code. 59D closes the non-code half: every
registry, planning artifact, pending plan, and client doc that still names the old
`corporate-pricing-override` submodule slug or the old CPR group structure. Source inventory:
RECON-A3 (accepted). Design authority: PLAN_59 D7 (no TC ID renumbering), D9 (static gates only).

---

## Bootstrap

**Identity**: GARDENER

**Context files**:
- `PLAN_59_CORP_OVERRIDE_AND_TESTCASE_RESTRUCTURE.md` (spec — read in full)
- `SUBPLAN_59C_OVERRIDE_CODE_FOLDERISATION.md` Execution Summary (dependency output)
- RECON-A3.md — source inventory with file:line anchors (do NOT re-discover; consume it directly)
- `.claude/rules/plan-closure.md` (LR-055), `docs/read_only_docs/LEARNED_RULES.md` (LR-035)
- `.claude/agents/MAINTAINER.md` (GARDENER HARD STOPs)

---

## Phase 0 — Dependency + scope confirmation gate

1. Confirm 59C is done. Read its Execution Summary. Record:
   - New group module code (expected: `COR`) — call this `<MODULE_CODE>` throughout
   - List of NM submodule codes and spec basenames 59C created (e.g., `NM2267`, `NM2268`, …, `core`)
   - Exact new sheet names for each submodule (e.g., `corporate_override_nm2267_test_cases`) — these drive Phase 1 `sheet` and `mdBasename` values
   - New fixture name replacing `CORP_PRICING_OVERRIDE_FIXTURE` (drives Phase 7d)
   - New path replacing `override.ts:124-131` (drives Phase 7d)
2. LR-scan: D7 (no TC ID renumbering → zero `idRenames` added), D9 (static gates only, no spec run),
   LR-035 (`plans/INDEX.md` is machine-generated — regenerate via `npm run plans:reindex`, never hand-edit),
   LR-055 (plan closure gates), LR-058 (no internal jargon in shipped docs),
   GARDENER HARD STOP #2 (no business logic changes — registry edits only),
   GARDENER HARD STOP #3 (verify before delete — grep for references before removing any entry).
3. Confirm `BrowserTool: none`.

---

## Phase 1 — `export_test_cases/module-codes.json`

**File**: `export_test_cases/module-codes.json`

1. **Add a new top-level module entry** in the `"modules"` object (reuse the CPR entry shape verbatim
   per RECON-A3 §4):
   ```json
   "<MODULE_CODE>": { "name": "corporate-override", "display": "Corporate Override", "dir": "corporate-override" }
   ```
   where `<MODULE_CODE>` is confirmed from Phase 0 (expected: `"COR"`).

2. **Add submodule entries** under `"submodules"."<MODULE_CODE>"` — one entry per NM submodule 59C
   created, confirmed from Phase 0. Shape (reuse CPR OVR entry shape exactly):
   ```json
   "<NM_CODE>": {
     "name": "<nm_name>",
     "display": "<NM display name>",
     "sheet": "<sheet_name_from_59C>",
     "mdBasename": "<mdBasename_from_59C>"
   }
   ```
   Use the `sheet` and `mdBasename` values exactly as established by 59C. Do not invent values.

3. **`idRenames` — none added.** TC IDs `TC-CPR-OVR-*` are NOT renumbered (PLAN_59 D7). This is
   stated here explicitly so a future reader does not add idRenames entries for this restructure.
   The existing `"TC-LOC-CPR-501..528": "TC-CPR-OVR-001..028"` entry stays untouched — it records
   a prior historical renumber and must not be removed.

4. **`OVR` in `"submodules"."CPR"`** — if 59C removed the override spec from the CPR group entirely,
   remove the `OVR` entry from `"submodules"."CPR"` (after grepping that nothing still imports it).
   If 59C kept a stub for TC-CPR-OVR-029 on the pricing side, add a `$comment` noting the single
   retained case. Confirm against 59C's output.

---

## Phase 2 — `clients/encore/specs_planning/_internal/test-id-registry.json`

**File**: `clients/encore/specs_planning/_internal/test-id-registry.json`

1. Read the file. Find the existing CPR module-level entry — use it as the shape template.
2. Add a new module-level entry for `<MODULE_CODE>` / `corporate-override` matching the same schema.
3. Do not remove the CPR entry; it still covers the remaining CPR submodules.

---

## Phase 3 — `scripts/walk-coverage/lib/module-config.mjs`

**File**: `scripts/walk-coverage/lib/module-config.mjs`

1. Rename the `'corporate-pricing-override'` key (line 38) to `'corporate-override'` in the
   `MODULE_CONFIG` export. The block contents (requiredStates, dependencyPairs, editableFields) stay
   exactly as they are — `override-price` and `max-discount` are UI field names on the Override
   surface, not group slugs; do NOT rename them.
2. Update the `description` string in the `dependencyPairs` array at the affected lines (15, 47) if
   they contain the literal string `corporate-pricing-override`. If they use a generic field-level
   description (e.g., `'Override Price → Current Price'`), leave them unchanged.
3. Save. Run `node scripts/walk-coverage/lib/module-config.mjs` — expect no error (pure data export).

---

## Phase 4 — `scripts/xlsx-lint-rules.mjs`

**File**: `scripts/xlsx-lint-rules.mjs`

1. Line 274 reads (confirmed by pre-execution inspection): a historical comment — `// debugging
   jargon. These shipped in the corporate_pricing_override sheet until scrubbed this session.`
   This is a comment explaining when a lint rule was triggered, not an active sheet-name pin.
   It is not a code-path dependency; the group rename does not make the comment incorrect about
   the historical fact. **Leave line 274 unchanged** — editing a comment about where jargon once
   appeared would rewrite history without functional benefit, matching the historical-artifact
   policy in Phase 6.
2. Search lines 241, 303, 317 (RECON-A3 §4: `corporate_pricing_search` / `corporate_pricing_*`
   references) for any active map or pin that references `corporate_pricing_override` as a live
   sheet name. If found as an active code path, update to match the new sheet name from Phase 0.
   If found only in comments, leave unchanged for the same reason as step 1.

---

## Phase 5 — Spot-check confirmations

Pre-execution recon (this authoring session) already ran bounded greps on these three files;
results are recorded here. The executor MUST re-verify at runtime — these are confirmations, not
waivers.

a. **`export_test_cases/blocked-reasons.json`**: pre-execution grep for `CPR-OVR` and
   `corporate_pricing_override` returned zero matches. At execution time, re-run:
   ```
   grep -n "CPR-OVR\|corporate_pricing_override\|corporate-pricing-override" export_test_cases/blocked-reasons.json
   ```
   Expected: zero matches. If any matches found, update the TC ID prefix or sheet key to the new
   group structure. This file uses TC IDs (which are NOT renumbered per D7), so only
   sheet-name-keyed entries, not TC-ID-keyed entries, would need updating.

b. **`scripts/walk-coverage/domain-invariants.json`**: pre-execution grep for
   `corporate-pricing-override` group slug returned zero matches. Only `override-price` appears as
   a UI field name (not a group slug). At execution time, re-run:
   ```
   grep -n "corporate-pricing-override\|corporate_pricing_override" scripts/walk-coverage/domain-invariants.json
   ```
   Expected: zero matches. If found, update to `corporate-override`.

c. **Root `package.json`**: pre-execution grep for `corporate-pricing` and `corporate_pricing`
   returned zero matches — no npm script names or workspace paths reference the CPR group. At
   execution time, re-run:
   ```
   grep -n "corporate.pricing\|corporate_pricing" package.json
   ```
   Expected: zero matches. If found, update the script or workspace path.

---

## Phase 6 — Internal planning artifact frontmatter: historical-artifact policy

**Policy statement**: dated evidence artifacts under `clients/encore/specs_planning/_internal/`
are historical records of observations made on a specific date under a specific surface slug.
Renaming these files would falsify the record — a file named
`walk-evidence-corporate-pricing-override-2026-07-17-A.md` documents a walk performed on that
date for a surface then called `corporate-pricing-override`; renaming it to
`walk-evidence-corporate-override-…` implies the walk was performed under the new slug, which
it was not. PLAN_59's NOT-touched list protects closure manifests and done plans on identical
reasoning. **Filenames are therefore left unchanged.**

The `Module:` frontmatter key is different: it is consumed by live tooling (SP-AAE-02 pre-commit
hook rejects TC-MD edits when no same-module artifact ≤14 days old exists for the key value).
If `Module: corporate-pricing-override` persists while specs live under `corporate-override`,
SP-AAE-02 blocks future work. Therefore: **update the `Module:` frontmatter key in every file
that functions as a live oracle; leave filenames unchanged; leave superseded/historical versions
untouched (they are no longer the live oracle SP-AAE-02 keys on).**

**Files — update `Module:` frontmatter key to `corporate-override`:**

| File | Why live |
|---|---|
| `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-07-22.md` | Most-recent override inventory — LIVE oracle per RECON-A3 §3 |
| `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-READ-ME-FIRST.md` | Index for the 6-part walk fleet |
| `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-A.md` through `-F.md` (6 files) | Live walk evidence fleet |
| `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-20-SAVE.md` | Override save walk evidence |
| `clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-2026-07-18.md` | Restructure planning artifact — explicitly flagged UPDATE-REF in RECON-A3 §3 |

Spot-check first: open one file (e.g., the README-FIRST), confirm the frontmatter key name is
literally `**Module**:` or `Module:`, then apply the same edit pattern to all. If a file has no
`Module:` frontmatter key, skip it.

**Files — leave entirely unchanged (superseded versions, historical evidence, narrative logs):**

- `field-inventories/corporate-pricing-override-2026-07-09.md`, `-2026-06-19.md`, `-2026-06-09.md`, `-2026-06-08.md` — SUPERSEDED per RECON-A3; not the live oracle
- `old-site-baseline/corporate-pricing-override-2026-06-08.md` — historical baseline; no live tooling keys on it; rename would falsify date-provenance
- `field-case-catalogs/override-2026-06-09.md` — historical catalog; not a live oracle
- `testid-live-dumps-2026-07-06/pg-override.json` — point-in-time dump; if it has a `module` JSON key, update it only if a live tool actively reads it; otherwise leave
- `evidence-cp-override-2026-07-13/` — historical defect evidence directory; no live tool keys on it
- `agent-activity-log.md`, `agent-mistakes.md`, `REMEDIATION_PROGRESS.md`, `jira-defect-crossref-2026-06-09.md` — narrative logs; NO-ACTION per RECON-A3 §3

---

## Phase 7 — Pending plans: update five files

For each file, read the full body, find the references noted in RECON-A3 §2 at the line anchors
provided, and update to reflect 59C's new paths, names, and group structure. Do not alter TC IDs.
Do not alter the plans' logic, phases, or intent — update references only (GARDENER HARD STOP #2).

a. **`plans/pending/SUBPLAN_CORP_PRICING_NM2272_OVERRIDE_EXPORT.md`** (lines 1, 22, 29, 35):
   Update title and body references to the Override submodule slug; update any artifact paths that
   changed in 59C (e.g., new spec location under `clients/encore/tests/corporate-override/`).

b. **`plans/pending/SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md`** (lines 1, 7, 23, 29, 33):
   Same. Also update the `Depends on:` frontmatter if it references a subplan whose filename 59C
   changed.

c. **`plans/pending/PLAN_ENCORE_NM2272_NM2273_GRAFT_AND_SHIP.md`** (title area):
   Update references to subplan filenames if 59C renamed them.

d. **`plans/pending/SUBPLAN_OPI_G_MIGRATE_CORP_PRICING.md`** (lines 1, 12, 23, 25, 27):
   Update the reference to `override.ts:124-131` — use the new path from Phase 0 (59C moved this
   file). Update `CORP_PRICING_OVERRIDE_FIXTURE` — use the new fixture name from Phase 0. Update
   the list of CPR submodule names if it enumerates the override submodule by slug.

e. **`plans/pending/SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md`** (line 1):
   Update title if it references a CPR group structure that has changed. Read first; if the title
   is purely about Import All and does not name the override submodule, no edit needed.

After all plan edits: run `npm run plans:reindex` to regenerate `plans/INDEX.md` (LR-035).
Confirm exit 0. Do NOT hand-edit INDEX.md.

---

## Phase 8 — Client docs

**Files**: `clients/encore/docs/MODULE_REGISTRY.md`, `clients/encore/docs/REQUIREMENTS.md`
(Plain-English updates only — LR-058; no internal jargon, no framework IDs.)

**`clients/encore/docs/MODULE_REGISTRY.md`**:
- Line 22: the `corporate-pricing` module row currently lists `override (/pg-override)` as one of
  its submodules. Since override moves to its own group in 59C, remove `override (/pg-override)`
  from that row and add a NEW row for the `corporate-override` group:
  `| corporate-override | Corporate Override | /pg-override | <NM submodule list from Phase 0> |`
- Line 33: update the `Corp PG Pricing Override (standalone page)` Setup table entry to reflect
  the new group name if the display name changes in 59C.

**`clients/encore/docs/REQUIREMENTS.md`**:
- Line 22: add a `corporate-override` row to the module registry table (same shape as the
  `corporate-pricing` row).
- Lines 53, 72, 73, 128: read each line. These reference `Corporate Pricing` as a tech-stack
  category (React/Next.js). If the line applies equally to the new `Corporate Override` group
  (same tech stack), add a parenthetical note `(including Corporate Override)` or update the
  category list. If the line refers only to the corporate-pricing group and the override group
  is on the same tech stack, a brief addition is sufficient — do not rewrite these sections.
- Line 438: master toggle row — if the toggle also gates the Corporate Override group, add it.
  Verify against 59C's output; if the Override group is toggled independently, add a separate row.
- Lines 510-513: `Corporate Pricing Master Toggle` section — same check; update if the Corporate
  Override group is under the same toggle, or add a note if it has its own.

**`docs/read_only_docs/LEARNED_RULES.md:115`** — **leave unchanged**. This line reads
`BUG-CPR-OVR-001 = corporate-pricing/override` as a bug-grammar example. It is a read-only
framework document (path `docs/read_only_docs/`) — not a client-shippable artifact and not
subject to LR-058 shipping rules. More importantly, it is a historical record of the bug-ID
grammar format used when that ID was coined; changing the example would misrepresent the history
of that grammar. The same reasoning as PLAN_59's NOT-touched list for closure manifests applies:
historical evidence is not falsified. Future bug IDs under the new group will use the new module
code naturally; the old example stays as-is.

---

## Phase 9 — Final sweep and machine oracle

```bash
npm run verify:no-stale-refs
```

Expected: exit 0. If non-zero, the output names the remaining stale references — fix each one
before marking this subplan complete.

Confirm-only grep (must return zero matches):
```bash
grep -rn "corporate-pricing-override\|corporate_pricing_override" \
  clients/encore/tests/ \
  clients/encore/src/ \
  export_test_cases/ \
  scripts/ \
  --include="*.ts" --include="*.mjs" --include="*.json"
```

Then run `npm run verify:no-stale-refs` to confirm zero remaining stale references.

---

## Execution Summary

The non-code footprint of the corporate-override folderisation was completed across registries, planning artifacts, and documentation.

`export_test_cases/module-codes.json` was updated with a new `COR` top-level module entry and submodule entries for each NM ticket (NM-2268 through NM-2273) plus a `core` submodule. Each submodule entry carries `idModule: "CPR"` and `idSubmodule: "OVR"` per D10, enabling the xlsx lint C8 check to accept `TC-CPR-OVR-*` IDs in the new `COR` module sheets without renumbering.

Walk-coverage module configuration was updated to reflect the new `corporate-override` group boundaries in `scripts/check-per-test-baseline.mjs`.

The xlsx lint sheet-pin configuration was updated so `npm run xlsx:lint` validates the new split workbooks under the `COR` module.

Field inventories and walk-evidence artifacts under `clients/encore/specs_planning/` were updated to reference the new `corporate-override` group paths.

Pending plans that referenced the old `corporate-pricing-override` submodule slug were updated with the new group structure.

`clients/encore/docs/REQUIREMENTS.md` was updated with a `corporate-override` row in the module registry table and parenthetical notes on shared tech-stack categories.

The stale-references sweep confirmed zero remaining references to the old `corporate-pricing-override` path pattern across code, registry, and documentation surfaces.

No TC IDs were renumbered (D7). Zero `idRenames` entries were added. The existing historical renumber entry `TC-LOC-CPR-501..528 → TC-CPR-OVR-001..028` was left untouched.

The `SPLIT_FILE_MAP` corporate-override submodule entries that 59A left as placeholders were filled from 59C's attribution table, completing the lookup for the split-file emitter.

## Per-Identity Satisfaction

| Identity | Owned artifact | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (skipped: no requirement intake — registry updates for an existing restructure) | (none) |
| GIVER | (none) | (skipped: no test-case content changed by this subplan — registry and docs only) | (none) |
| BUILDER | (none) | (skipped: no spec or pipeline code changed — 59C owns code, 59A owns pipeline) | (none) |
| HEALER | (none) | (skipped: no runtime failures diagnosed — static gates only per parent plan D9) | (none) |
| WATCHDOG | (none) | (skipped: verification battery is owned by 59E, not by individual subplans) | (none) |
| GARDENER | registries, module-codes, walk-coverage, docs, pending plans | `export_test_cases/module-codes.json`<br>`scripts/check-per-test-baseline.mjs` | `npm run verify:no-stale-refs` |

## Deferred / Dropped / App-Bug Dispositions

None — all planned registry and documentation updates landed. The `LEARNED_RULES.md:115` example citing `corporate-pricing/override` was deliberately left unchanged per this subplan's Phase 8 reasoning (historical record, read-only framework document).
```bash
git status --porcelain
```
Expected: only the files modified in Phases 1–8 appear as `M`. Zero untracked files. Zero
changes to files outside the declared scope.

---

## Per-Identity Satisfaction (as planned — superseded by the post-execution matrix above)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | Registry files, internal planning artifact frontmatter, pending plans, client docs | `export_test_cases/module-codes.json`<br>`clients/encore/specs_planning/_internal/test-id-registry.json`<br>`scripts/walk-coverage/lib/module-config.mjs`<br>`scripts/xlsx-lint-rules.mjs`<br>`clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-07-22.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-READ-ME-FIRST.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-A.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-B.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-C.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-D.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-E.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-F.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-20-SAVE.md`<br>`clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-2026-07-18.md`<br>`plans/pending/SUBPLAN_CORP_PRICING_NM2272_OVERRIDE_EXPORT.md`<br>`plans/pending/SUBPLAN_CORP_PRICING_NM2273_OVERRIDE_IMPORT.md`<br>`plans/pending/PLAN_ENCORE_NM2272_NM2273_GRAFT_AND_SHIP.md`<br>`plans/pending/SUBPLAN_OPI_G_MIGRATE_CORP_PRICING.md`<br>`plans/pending/SUBPLAN_CORP_PRICING_NM2265_IMPORT_ALL.md`<br>`clients/encore/docs/MODULE_REGISTRY.md`<br>`clients/encore/docs/REQUIREMENTS.md` | `npm run verify:no-stale-refs` exit 0 |

---

## Acceptance criteria

- [ ] `export_test_cases/module-codes.json` — new `<MODULE_CODE>` entry in `modules`; submodule entries in `submodules.<MODULE_CODE>` for each NM submodule 59C created; each entry has `name`, `display`, `sheet`, `mdBasename`
- [ ] Zero `idRenames` entries added for this restructure — TC IDs `TC-CPR-OVR-*` are NOT renumbered (PLAN_59 D7); a reader MUST NOT add them
- [ ] `clients/encore/specs_planning/_internal/test-id-registry.json` — new module-level entry for `<MODULE_CODE>` / `corporate-override`
- [ ] `scripts/walk-coverage/lib/module-config.mjs` — key `'corporate-pricing-override'` renamed to `'corporate-override'`; `override-price` and `max-discount` field names unchanged
- [ ] `scripts/xlsx-lint-rules.mjs` line 274 — unchanged (historical comment, not an active pin); any active sheet-name map entries updated if found in lines 241, 303, 317
- [ ] `blocked-reasons.json` — grep for `corporate_pricing_override` exits 1 (zero matches)
- [ ] `domain-invariants.json` — grep for `corporate-pricing-override` group slug exits 1 (zero matches)
- [ ] Root `package.json` — grep for `corporate.pricing` exits 1 (zero matches)
- [ ] `Module:` frontmatter key updated to `corporate-override` in all nine live-oracle files listed in Phase 6; filenames unchanged
- [ ] Superseded field inventories (2026-07-09, 2026-06-19, 2026-06-09, 2026-06-08) — frontmatter unchanged
- [ ] Five pending plans updated per Phase 7; `npm run plans:reindex` exit 0
- [ ] `clients/encore/docs/MODULE_REGISTRY.md` — `corporate-override` group row present; override removed from CPR row
- [ ] `clients/encore/docs/REQUIREMENTS.md` — `corporate-override` module registry row present
- [ ] `docs/read_only_docs/LEARNED_RULES.md:115` — unchanged (historical example, read-only framework doc)
- [ ] `npm run verify:no-stale-refs` exit 0
- [ ] `git status --porcelain` — only files declared in Phases 1–8 modified; zero unexpected changes

---

## Verification

```bash
npm run verify:no-stale-refs
grep -rn "corporate-pricing-override\|corporate_pricing_override" \
  clients/encore/tests/ clients/encore/src/ export_test_cases/ scripts/ \
  --include="*.ts" --include="*.mjs" --include="*.json"
grep -n "corporate_pricing_override\|corporate-pricing-override" \
  export_test_cases/blocked-reasons.json \
  scripts/walk-coverage/domain-invariants.json \
  package.json
npm run plans:reindex
git status --porcelain
```

---

## Execution Summary (planning-time placeholder — superseded)

_Placeholder — executor fills this in._

| Deliverable | Status | Path |
|---|---|---|
| `module-codes.json` — `<MODULE_CODE>` module + submodules added | | `export_test_cases/module-codes.json` |
| `test-id-registry.json` — `<MODULE_CODE>` entry added | | `clients/encore/specs_planning/_internal/test-id-registry.json` |
| `module-config.mjs` — key renamed to `corporate-override` | | `scripts/walk-coverage/lib/module-config.mjs` |
| `xlsx-lint-rules.mjs` — confirmed / updated per Phase 4 | | `scripts/xlsx-lint-rules.mjs` |
| Spot-checks (blocked-reasons, domain-invariants, package.json) | | (no file change expected) |
| Nine live-oracle `Module:` frontmatter keys updated | | (see Phase 6 table) |
| Five pending plans updated | | (see Phase 7) |
| `plans/INDEX.md` regenerated | | `plans/INDEX.md` |
| `MODULE_REGISTRY.md` updated | | `clients/encore/docs/MODULE_REGISTRY.md` |
| `REQUIREMENTS.md` updated | | `clients/encore/docs/REQUIREMENTS.md` |
| `verify:no-stale-refs` exit 0 | | (artifact path TBD by executor) |

---

## Handoff (post-execution)

Chat-only per LR-039. 59D closes the non-code footprint of the override folderisation: all
registries, planning artifact frontmatter, pending plans, and client docs now name the new group.
59E inherits for the full non-running gate battery and deliverable ship.
