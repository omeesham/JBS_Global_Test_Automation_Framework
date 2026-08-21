Let me read all the needed files in parallel sections.

Let me read the test-case files to get existing TC IDs.

Let me quickly grab the TC ID list from both test-case files.

I have all the context needed. Let me create the catalog now.

Now I have enough context to create the catalog.

---

# REPORT TICKET-dop-fcc-catalog-0818

## DOCTRINE_READ
- `.claude/skills/coverage/SKILL.md` (via context pack — skill routing only, no structural doc in that file that changes catalog format)
- `clients/encore/specs_planning/_internal/field-case-generation.md` — §2 field-type templates, §2.1 rejection oracle, §3 surface families, LR-065
- `.claude/rules/inventory.md` — LR-062 denominator, LR-065 surface families
- `clients/encore/specs_planning/_internal/field-case-catalogs/service-charge-2026-08-10.md` — FORMAT REFERENCE (section structure, frontmatter keys, table shape)

## FILES_INSPECTED
- `discount-optimization-locations-2026-08-11.md` (full field inventory Tab 1)
- `discount-optimization-exemption-2026-08-11.md` (full field inventory Tab 2)
- `discount_optimization_locations_test_cases.md` (TC-DOP-OPT band, 35 cases)
- `discount_optimization_exemption_test_cases.md` (TC-DOP-EXM band, 6 cases)
- `service-charge-2026-08-10.md` (format reference)

## PLAN
1. Read all four doctrine + context files in parallel
2. Extract every field/control from both inventories; classify each against §2
3. Map each §2 family row to an existing TC-DOP-{OPT,EXM}-NNN or mark deferred/out-of-scope
4. Apply §3 surface families to both grids; cross-ref existing TCs per family
5. Write catalog to OUTPUT path in exact reference structure; run verify commands

## DIFF_SUMMARY
`clients/encore/specs_planning/_internal/field-case-catalogs/discount-optimization-2026-08-18.md` — new file, 18 737 bytes (~290 lines). Replaced a copilot-worker stub comment with the full catalog. No other files touched.

## VERIFY_ARTIFACTS
- `ls.verify.txt` sha256=`44B3597856991A1346A5EB75930268B980F6B4FD78B5AD96DD8321ADCDF8D8B6` cmd=`Get-Item <file> | Tee-Object ls.verify.txt`
- `grep-c.verify.txt` sha256=`DE7FF1CF171A39575B1613C92BE5E224AF8DF195B4494F5E095DC3F0917D8B48` cmd=`(Select-String -Pattern "TC-DOP-(OPT|EXM)-[0-9]+|deferred-to-DEEP|out-of-scope" -AllMatches).Matches.Count | Tee-Object grep-c.verify.txt` → **131** matches
- `head40.verify.txt` sha256=`60DB68DA526C049F410B2CE177367E8DC2F728B0E724727A3AF6934261A70B15` cmd=`Get-Content <file> | Select-Object -First 40 | Tee-Object head40.verify.txt`

Artifacts at: `C:/Users/VikasYadav/.copilot/session-state/e08e84d6-9175-49fe-86af-659310c2ad71/files/`

## DOCS_UPDATED
none-needed-because this is a new internal artifact (gitignored); no existing docs reference it

## EXTERNAL_CONTENT_CONSUMED
none — all sources are in-repo artifacts named in DOCTRINE and CONTEXT PACK

## CLEANUP
nothing to clean — no debug prints, no temp files introduced

## ASK
ASSUMPTIONS-MADE:
- **Allow Special Rate §2 type**: classified as Checkbox/boolean toggle (§2 row) because the inventory describes it as a per-row toggle button that switches a Yes/No boolean (`allowSpecialRate`); the toggle affordance maps to the §2 checkbox family even though the render is a button, not a native checkbox element.
- **Special Rate Start Date LR-008 classification**: cannot determine from inventory whether this date offset carries a positive or negative sign constraint (the inventory records only that valid dates enable Save and invalid formats produce a red border). Marked `deferred-to-DEEP` rather than guessing the sign.
- **Tab 2 sorting**: inventory explicitly states "no sortable headers were enumerated on this tab" — sorted as `out-of-scope` accordingly.
- **No new TCs authored**: the ticket asks for the catalog (family-mapping document), not new TC authoring. All mapped families point to existing TC-DOP-NNN IDs.

## BLOCKERS_DEVIATIONS
none

## END-OF-REPORT 11 sections

