# CSV-MD Delta Investigation — 2026-05-26

**Author**: Forensics subagent (Opus 4.7) on behalf of Rutvik
**Trigger**: `npm run check:tc-parity` reports 75-TC delta (CSV-only) after SP00 closed
**Inputs**: 11 CSVs at `clients/encore/test_cases_csv/`, 13 MDs at `clients/encore/specs_planning/test-cases/setup/{locations,local-office}/`
**Methodology**: set-diff via the parity script's own regex + a permissive `^#{2,3} TC-[A-Z0-9-]+:` MD regex to detect script blind-spots; git-blame on injected rows; spec file cross-check
**Authority**: Read-only on everything except this file

---

## Headline — the 75 number is wrong; the real CSV-only count is 38

`scripts/check-tc-parity.ts:41` uses this regex:

```
/^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+)?-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):/gm
```

This pattern allows AT MOST two letter-groups before the number/letter token (`(?:-[A-Z]+)?` is optional and singular). It does NOT match three letter-groups like `TC-LOC-LI-NE-NNN`.

**Permissive regex** (`/^#{2,3}\s+(TC-[A-Z0-9-]+):/gm`) finds **477 MD TCs**, not 400. The 77 MD TCs the strict regex silently drops are:

- **37 TCs** `TC-LOC-LI-NE-011..047` (locations_local_information MD, lines 1194–1691) — present in MD, falsely reported as CSV-only
- **26 TCs** `TC-LOC-NTS-FCC-001..032` (locations_notes MD, lines 599–924) — old FCC IDs orphaned in MD after SP00 rename
- **14 TCs** `TC-LOC-SSL-FCC-001..014` (locations_shared_setup_locations MD, lines 780–1094) — old FCC IDs orphaned in MD after SP00 rename

After fixing the regex bug, the **true delta** is:

| Direction | Count |
|---|---|
| In CSV but NOT in MD | **38** (was reported as 75) |
| In MD but NOT in CSV | **40** (the FCC ID orphans the parity script never reported because both regexes failed differently) |

The 75-number conflates two real problems with one tooling bug:
1. **Tooling bug (37 of 75)** — parity-script regex doesn't match 3-segment prefixes; LI-NE-* TCs are in MD and in CSV; no action needed on these.
2. **Real gap (38 of 75)** — TCs added direct to CSV by SP00 augment-v2 + SP00 FCC rename completion, never propagated to MD.

The reciprocal 40 MD-only TCs (old FCC IDs) are the OTHER half of the same SP00 rename gap.

---

## Plan-claim contradictions (LR-020 findings)

**`plans/done/SUBPLAN_PARITY_00_OFFLINE_CSV_SPEC_PARITY_PATCH.md`** lines 30 and 592:

> v2 added orphan-row injection: 5 spec-fixme TCs that have no CSV row (SSL-026, SSL-030, SSL-FCC-009, SSL-FCC-012, NTS-FCC-022) ...

> Orphan-injected (5 TCs): NTS-035, SSL-031, SSL-032, SSL-026, SSL-030 — spec has fixme tests; CSV row authored with real content from spec body

Both of these prose assertions contain false-negative MD-presence claims that I cross-checked against the live MD files:

| TC | SP00 claim | Live state | Verdict |
|---|---|---|---|
| `TC-LOC-NTS-035` | "no MD entry" implied (orphan-injected) | MD present at `locations_notes_test_cases.md:462` | **CONTRADICTION** |
| `TC-LOC-SSL-026` | "no CSV row" → orphan-injected | MD present at `locations_shared_setup_locations_test_cases.md:595` | **CONTRADICTION** (MD has it; CSV correctly has it now) |
| `TC-LOC-SSL-030` | implied orphan | MD present at `locations_shared_setup_locations_test_cases.md:685` | **CONTRADICTION** |
| `TC-LOC-SSL-031` | orphan-injected | MD absent | matches |
| `TC-LOC-SSL-032` | orphan-injected | MD absent | matches |

The SP00 doc's mental model treats "no CSV row" as equivalent to "spec-only" — but for NTS-035 / SSL-026 / SSL-030, the MD entries DID exist all along; only the CSV row was missing. SP00 augment-v2 added the missing CSV rows correctly. The doc just mis-summarized the gap.

**No production code is wrong**; the SP00 doc's Execution Summary just over-counts the "orphan-injected" claim. Suggest a follow-up edit to the SP00 doc when you next touch it, but no urgent action.

---

## Per-TC ledger (all 75 CSV-only IDs the parity script reports)

Origin codes:
- `MD-PRESENT-script-bug` — regex bug missed an existing MD entry; no real delta
- `SP00-FCC-rename-spec-only` — renamed by SP00 in spec+CSV; MD still has the OLD FCC ID
- `SP00-orphan-injected-spec-only` — injected to CSV by SP00 augment-v2; spec has the test; MD has no entry (different ID-shape from SP00 rename, but same root cause: spec invented an ID before MD was authored)
- `SP00-orphan-injected-but-MD-has-it` — injected to CSV by SP00 augment-v2 because CSV row was missing; MD entry was already present (SP00 doc mis-reports as no-MD)
- `documentation-marker` — string appears in CSV as cross-reference text, not as its own row

Disposition codes:
- `no-action` — false positive from script regex
- `backfill-to-MD` — content is real and present in spec; MD should be authored from spec body
- `update-SP00-doc-claim` — CSV row is fine and MD is fine; only the SP00 doc needs a small correction
- `keep-as-is` — intentional skipped ID, documented inline

### Cluster 1 — `TC-LOC-LI-NE-011..047` (37 rows) — TOOLING BUG, not a real gap

| TC ID | CSV file | Origin | Recommended disposition | Notes |
|---|---|---|---|---|
| TC-LOC-LI-NE-011 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1194; regex bug misses 3-segment prefix `LOC-LI-NE` |
| TC-LOC-LI-NE-012 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1211 |
| TC-LOC-LI-NE-013 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1228 |
| TC-LOC-LI-NE-014 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1242 |
| TC-LOC-LI-NE-015 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1255 |
| TC-LOC-LI-NE-016 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1268 |
| TC-LOC-LI-NE-017 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1281 |
| TC-LOC-LI-NE-018 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1294 |
| TC-LOC-LI-NE-019 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1307 |
| TC-LOC-LI-NE-020 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1320 |
| TC-LOC-LI-NE-021 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1333 |
| TC-LOC-LI-NE-022 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1346 |
| TC-LOC-LI-NE-023 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1359 |
| TC-LOC-LI-NE-024 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1372 |
| TC-LOC-LI-NE-025 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1385 |
| TC-LOC-LI-NE-026 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1398 |
| TC-LOC-LI-NE-027 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1411 |
| TC-LOC-LI-NE-028 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1424 |
| TC-LOC-LI-NE-029 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1437 |
| TC-LOC-LI-NE-030 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1450 |
| TC-LOC-LI-NE-031 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1463 |
| TC-LOC-LI-NE-032 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1476 |
| TC-LOC-LI-NE-033 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1489 |
| TC-LOC-LI-NE-034 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1502 |
| TC-LOC-LI-NE-035 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1515 |
| TC-LOC-LI-NE-036 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1528 |
| TC-LOC-LI-NE-037 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1541 |
| TC-LOC-LI-NE-038 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1554 |
| TC-LOC-LI-NE-039 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1569 |
| TC-LOC-LI-NE-040 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1584 |
| TC-LOC-LI-NE-041 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1599 |
| TC-LOC-LI-NE-042 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1614 |
| TC-LOC-LI-NE-043 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1629 |
| TC-LOC-LI-NE-044 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1644 (title differs only in "Behavior" vs "Behaviour" spelling) |
| TC-LOC-LI-NE-045 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1660 (title differs only in "Behavior" vs "Behaviour" spelling) |
| TC-LOC-LI-NE-046 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1676 (title differs only in "Behavior" vs "Behaviour" spelling) |
| TC-LOC-LI-NE-047 | locations_local_information_test_cases.csv | MD-PRESENT-script-bug | no-action | MD line 1691 (title differs only in "Behavior" vs "Behaviour" spelling) |

**Cluster verdict**: zero action on the TCs. One action item on the script: fix the regex (see Tooling section below).

Minor cosmetic finding: CSV titles use British "Behaviour" for LI-NE-044..047, MD titles use American "Behavior". Mention only — not in scope of this investigation.

### Cluster 2 — `TC-LOC-NTS-039..061` (23 rows) — SP00 FCC rename, MD still has old FCC IDs

The CSV rows were injected by SP00 commit `99226fa` (2026-05-26). The MATCHING SPEC tests at `clients/encore/specs/locations/location-notes.spec.ts:42-661` exist with the new IDs. The MD file `locations_notes_test_cases.md:599-924` STILL has the OLD `TC-LOC-NTS-FCC-001..032` IDs.

Each TC below maps 1:1 to a TC-LOC-NTS-FCC-NNN MD section (the mapping was 23 spec FCC tests → 23 new NTS-039..061 IDs per SP00 change-log entry 4). The MD entries can be backfilled by renaming the existing FCC-suffixed MD sections, not by writing new content.

| TC ID | CSV file | Origin | Recommended disposition | Notes |
|---|---|---|---|---|
| TC-LOC-NTS-039 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to existing MD section `## TC-LOC-NTS-FCC-001:` line 599. Rename header + propagate new ID in body. |
| TC-LOC-NTS-040 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-002:` line 612 |
| TC-LOC-NTS-041 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-006:` line 625 |
| TC-LOC-NTS-042 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-007:` line 638 |
| TC-LOC-NTS-043 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-008:` line 651 |
| TC-LOC-NTS-044 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-010:` line 677 (NTS-FCC-009 was tab-char — possibly intentionally dropped during rename; verify) |
| TC-LOC-NTS-045 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-012:` line 690 |
| TC-LOC-NTS-046 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-014:` line 716 |
| TC-LOC-NTS-047 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-015:` line 729 |
| TC-LOC-NTS-048 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-016:` line 742 |
| TC-LOC-NTS-049 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-017:` line 755 |
| TC-LOC-NTS-050 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-018:` line 768 |
| TC-LOC-NTS-051 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-019:` line 781 |
| TC-LOC-NTS-052 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-020:` line 794 |
| TC-LOC-NTS-053 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-021:` line 807 |
| TC-LOC-NTS-054 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-023:` line 833 |
| TC-LOC-NTS-055 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-024:` line 846 |
| TC-LOC-NTS-056 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-025:` line 859 |
| TC-LOC-NTS-057 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-026:` line 872 |
| TC-LOC-NTS-058 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-027:` line 885 |
| TC-LOC-NTS-059 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-028:` line 898 |
| TC-LOC-NTS-060 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-029:` line 911 |
| TC-LOC-NTS-061 | locations_notes_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-NTS-FCC-032:` line 924 |

NTS-FCC-009 in MD has the tab-character test which appears to NOT have made it into the 039..061 rename — verify against spec to decide whether to keep MD-only or drop.

**ESCALATION**: the 23 backfills can be done deterministically via rename, but the FCC-009 (tab character) edge case needs Rutvik to confirm — keep or drop.

### Cluster 3 — `TC-LOC-PRI-034` (1 row) — intentional gap, not a real TC

| TC ID | CSV file | Origin | Recommended disposition | Notes |
|---|---|---|---|---|
| TC-LOC-PRI-034 | locations_pricing_test_cases.csv | documentation-marker | keep-as-is | Mentioned only in Notes cell of TC-LOC-PRI-035 row at CSV line 35: "TC-LOC-PRI-034 intentionally does not exist (skipped ID)". Also documented in MD test-plan at `locations_pricing_test_plan.md:404` and test-cases MD at `locations_pricing_test_cases.md:525`. The script's match-anywhere regex picks up the cross-reference text. No row, no spec test, no missing MD entry. |

### Cluster 4 — `TC-LOC-SSL-031..044` (14 rows) — mixed (SP00 FCC rename + 2 spec-only orphans)

| TC ID | CSV file | Origin | Recommended disposition | Notes |
|---|---|---|---|---|
| TC-LOC-SSL-031 | locations_shared_setup_locations_test_cases.csv | SP00-orphan-injected-spec-only | backfill-to-MD (with blocker text) | Spec at `location-shared-setup-locations.spec.ts:248` has `test.fixme(true, 'FIXME(BUG-LOC-SHR-001): random per-row Delete becomes non-clickable after add+save+reload...')`. SP00 augment-v2 injected this CSV row. No MD entry exists. Backfill MD with content: title `delete-MIDDLE row + save + reload`, `Status: Blocked` + cite BUG-LOC-SHR-001. |
| TC-LOC-SSL-032 | locations_shared_setup_locations_test_cases.csv | SP00-orphan-injected-spec-only | backfill-to-MD (with blocker text) | Spec at `location-shared-setup-locations.spec.ts:363` `test.fixme(true, 'FIXME(BUG-LOC-SHR-001): Same random per-row Delete-non-clickable bug...')`. No MD entry. Backfill `5-row N-boundary push` test case as blocked by same bug. |
| TC-LOC-SSL-033 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to existing MD `## TC-LOC-SSL-FCC-001:` line 780 |
| TC-LOC-SSL-034 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-002:` line 804 |
| TC-LOC-SSL-035 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-003:` line 828 |
| TC-LOC-SSL-036 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-004:` line 852 |
| TC-LOC-SSL-037 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-005:` line 876 |
| TC-LOC-SSL-038 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-006:` line 900 |
| TC-LOC-SSL-039 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-007:` line 924 |
| TC-LOC-SSL-040 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-008:` line 948 |
| TC-LOC-SSL-041 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-010:` line 998 (FCC-009 was the fixme'd middle-delete test — renamed to SSL-031, see row above) |
| TC-LOC-SSL-042 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-011:` line 1022 |
| TC-LOC-SSL-043 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-013:` line 1070 (FCC-012 was the 5-row push fixme — renamed to SSL-032, see row above) |
| TC-LOC-SSL-044 | locations_shared_setup_locations_test_cases.csv | SP00-FCC-rename-spec-only | backfill-to-MD | Maps to MD `## TC-LOC-SSL-FCC-014:` line 1094 |

---

## Reciprocal 40 MD-only TCs (the other half of the gap; will resolve when SP00 rename is propagated to MD)

These are MD sections with the OLD FCC IDs that should be RENAMED to match the new CSV/spec IDs. They are NOT separate TCs needing their own row — they are the same content under the old names.

| MD-only TC ID | MD file | Maps to current CSV ID | Disposition |
|---|---|---|---|
| TC-LOC-NTS-FCC-001 | locations_notes_test_cases.md:599 | TC-LOC-NTS-039 | rename MD header |
| TC-LOC-NTS-FCC-002 | locations_notes_test_cases.md:612 | TC-LOC-NTS-040 | rename MD header |
| TC-LOC-NTS-FCC-006 | locations_notes_test_cases.md:625 | TC-LOC-NTS-041 | rename MD header |
| TC-LOC-NTS-FCC-007 | locations_notes_test_cases.md:638 | TC-LOC-NTS-042 | rename MD header |
| TC-LOC-NTS-FCC-008 | locations_notes_test_cases.md:651 | TC-LOC-NTS-043 | rename MD header |
| TC-LOC-NTS-FCC-009 | locations_notes_test_cases.md:664 | (no current spec/CSV mapping) | **ESCALATE** — tab-char test; drop MD entry or restore in spec/CSV? |
| TC-LOC-NTS-FCC-010 | locations_notes_test_cases.md:677 | TC-LOC-NTS-044 | rename MD header |
| TC-LOC-NTS-FCC-012 | locations_notes_test_cases.md:690 | TC-LOC-NTS-045 | rename MD header |
| TC-LOC-NTS-FCC-013 | locations_notes_test_cases.md:703 | (need spec verify) | likely TC-LOC-NTS-046 (verify) |
| TC-LOC-NTS-FCC-014 | locations_notes_test_cases.md:716 | TC-LOC-NTS-046 (or shifted) | verify |
| TC-LOC-NTS-FCC-015 | locations_notes_test_cases.md:729 | TC-LOC-NTS-047 | rename MD header |
| TC-LOC-NTS-FCC-016 | locations_notes_test_cases.md:742 | TC-LOC-NTS-048 | rename MD header |
| TC-LOC-NTS-FCC-017 | locations_notes_test_cases.md:755 | TC-LOC-NTS-049 | rename MD header |
| TC-LOC-NTS-FCC-018 | locations_notes_test_cases.md:768 | TC-LOC-NTS-050 | rename MD header |
| TC-LOC-NTS-FCC-019 | locations_notes_test_cases.md:781 | TC-LOC-NTS-051 | rename MD header |
| TC-LOC-NTS-FCC-020 | locations_notes_test_cases.md:794 | TC-LOC-NTS-052 | rename MD header |
| TC-LOC-NTS-FCC-021 | locations_notes_test_cases.md:807 | TC-LOC-NTS-053 | rename MD header |
| TC-LOC-NTS-FCC-022 | locations_notes_test_cases.md:820 | (need spec verify) | **ESCALATE** — SP00 doc says NTS-FCC-022 was orphan-injected but MD HAS it. Verify spec state. |
| TC-LOC-NTS-FCC-023 | locations_notes_test_cases.md:833 | TC-LOC-NTS-054 | rename MD header |
| TC-LOC-NTS-FCC-024 | locations_notes_test_cases.md:846 | TC-LOC-NTS-055 | rename MD header |
| TC-LOC-NTS-FCC-025 | locations_notes_test_cases.md:859 | TC-LOC-NTS-056 | rename MD header |
| TC-LOC-NTS-FCC-026 | locations_notes_test_cases.md:872 | TC-LOC-NTS-057 | rename MD header |
| TC-LOC-NTS-FCC-027 | locations_notes_test_cases.md:885 | TC-LOC-NTS-058 | rename MD header |
| TC-LOC-NTS-FCC-028 | locations_notes_test_cases.md:898 | TC-LOC-NTS-059 | rename MD header |
| TC-LOC-NTS-FCC-029 | locations_notes_test_cases.md:911 | TC-LOC-NTS-060 | rename MD header |
| TC-LOC-NTS-FCC-032 | locations_notes_test_cases.md:924 | TC-LOC-NTS-061 | rename MD header |
| TC-LOC-SSL-FCC-001 | locations_shared_setup_locations_test_cases.md:780 | TC-LOC-SSL-033 | rename MD header |
| TC-LOC-SSL-FCC-002 | locations_shared_setup_locations_test_cases.md:804 | TC-LOC-SSL-034 | rename MD header |
| TC-LOC-SSL-FCC-003 | locations_shared_setup_locations_test_cases.md:828 | TC-LOC-SSL-035 | rename MD header |
| TC-LOC-SSL-FCC-004 | locations_shared_setup_locations_test_cases.md:852 | TC-LOC-SSL-036 | rename MD header |
| TC-LOC-SSL-FCC-005 | locations_shared_setup_locations_test_cases.md:876 | TC-LOC-SSL-037 | rename MD header |
| TC-LOC-SSL-FCC-006 | locations_shared_setup_locations_test_cases.md:900 | TC-LOC-SSL-038 | rename MD header |
| TC-LOC-SSL-FCC-007 | locations_shared_setup_locations_test_cases.md:924 | TC-LOC-SSL-039 | rename MD header |
| TC-LOC-SSL-FCC-008 | locations_shared_setup_locations_test_cases.md:948 | TC-LOC-SSL-040 | rename MD header |
| TC-LOC-SSL-FCC-009 | locations_shared_setup_locations_test_cases.md:972 | TC-LOC-SSL-031 (per spec rename) | rename MD header; note the `[FIXME]` annotation already present |
| TC-LOC-SSL-FCC-010 | locations_shared_setup_locations_test_cases.md:998 | TC-LOC-SSL-041 | rename MD header |
| TC-LOC-SSL-FCC-011 | locations_shared_setup_locations_test_cases.md:1022 | TC-LOC-SSL-042 | rename MD header |
| TC-LOC-SSL-FCC-012 | locations_shared_setup_locations_test_cases.md:1045 | TC-LOC-SSL-032 (per spec rename) | rename MD header; note the `[FIXME]` annotation already present |
| TC-LOC-SSL-FCC-013 | locations_shared_setup_locations_test_cases.md:1070 | TC-LOC-SSL-043 | rename MD header |
| TC-LOC-SSL-FCC-014 | locations_shared_setup_locations_test_cases.md:1094 | TC-LOC-SSL-044 | rename MD header |

---

## Methodology caveats

1. **Title cross-check is loose** — verified MD-PRESENT by ID alone, not by content. Some MD titles may have drifted from the CSV title text (already observed for LI-NE-044..047 "Behaviour" vs "Behavior" spelling).
2. **NTS-FCC-009 → ??? mapping unclear** — the SP00 change-log says 23 NTS FCC renames, MD has 26 NTS-FCC headers (001, 002, 006-010, 012-029, 032). Renaming-by-position math: 26 MD headers + the holes (003-005, 011, 030, 031) suggests the rename was 23 of the 26. I do NOT have evidence which 3 were dropped during rename. Mapping table above is best-effort; spec body comparison required to confirm exact MD-to-new-ID pairs for NTS-FCC-006..014.
3. **Spec is not exhaustively confirmed for every CSV row's source-of-truth status** — I spot-checked NTS-039, SSL-031, SSL-032, and the entire NTS-039..061 + SSL-031..044 block via `Grep` for spec test IDs. Each CSV row's `id: 'TC-...'` annotation in the spec file is the canonical source-of-truth signal.
4. **SP00 doc Execution Summary is internally inconsistent** with the live file state for 3 TCs (NTS-035, SSL-026, SSL-030) per LR-020 — flagged above. No urgent action.
5. **`scripts/check-tc-parity.ts` is reporting silently wrong numbers** because its `getMarkdownTcIds()` regex doesn't handle 3-segment prefixes. Until the regex is fixed, the script's "75 in CSV not in MD" headline is misleading. Recommended fix: replace `(TC-[A-Z]+(?:-[A-Z]+)?-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*)` with `(TC-[A-Z0-9-]+)` and add a length-and-shape sanity check inside the loop if needed. **This is out-of-scope for this investigation but should be filed separately.**

---

## Suggested next-action checklist (for Rutvik, not executed here)

1. **Tooling fix** — patch `scripts/check-tc-parity.ts:41` to use a permissive regex; rerun and confirm headline numbers (expect: ~38 CSV-only / ~40 MD-only, NOT 75/0).
2. **MD backfill — Cluster 2 (23 TCs)** — rename `## TC-LOC-NTS-FCC-NNN:` headers in `locations_notes_test_cases.md` per the mapping table above (lines 599-924). Mechanical; no new content.
3. **MD backfill — Cluster 4 SSL renames (12 of 14 TCs)** — same rename mechanics in `locations_shared_setup_locations_test_cases.md` (lines 780-1094).
4. **MD backfill — Cluster 4 SSL orphans (2 TCs: SSL-031 / SSL-032)** — author new MD sections with `Status: Blocked` citing BUG-LOC-SHR-001. Content can be lifted from spec test body + CSV "Steps" / "Expected Result" / "Notes" columns.
5. **ESCALATE — NTS-FCC-009 (tab character)** — Rutvik confirms: was this dropped during rename or got a new ID? If dropped, delete MD section. If kept, find the new ID and rename MD header.
6. **ESCALATE — NTS-FCC-022 → NTS-NNN mapping** — SP00 doc says NTS-FCC-022 was orphan-injected; live MD has the section. Verify whether MD-NTS-FCC-022 is the same content as the new CSV row that SP00 added, or a different test that needs separate handling.
7. **No-action — Cluster 1 (37 LI-NE TCs)** — entirely a script-regex bug. Will resolve when item #1 is done.
8. **No-action — Cluster 3 (PRI-034)** — intentional skipped ID; will continue to appear in the parity script's match-anywhere regex output as a phantom (the row's Notes cell mentions it). Could be fixed by making the script's CSV-side parser column-aware (only match `TC-` in the TC ID column, not anywhere), but lowest priority.
