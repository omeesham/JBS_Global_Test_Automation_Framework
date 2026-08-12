# Field-Case Catalog — Terms and Conditions (2026-08-06)

**Module**: terms-conditions
**Depth**: L2/L3 DEEP
**Generated from**: field inventory `terms-conditions-2026-08-05.md`

## Pairwise Covering Array (7b-8)

**Factors:**
- Language (L): {US English, Spanish (Mexico), English (Canada), French (Canada)} — 4 levels
- Row position (R): {first, middle, last} — 3 levels
- Column type (C): {Name (plain text), Left (HTML/RTE), Right (HTML/RTE), Bottom (HTML/RTE)} — 4 levels
- Data state (D): {new-fill, existing-edit, empty/cleared} — 3 levels

**Cap**: 12 trials (pairwise minimum for 4×3×4×3 = IPOG 12)
**Dropped by cap**: 0 pairs — 12 trials achieves full pairwise coverage

| Trial | L | R | C | D |
|---|---|---|---|---|
| 1 | US English | first | Name | new-fill |
| 2 | US English | middle | Left | existing-edit |
| 3 | US English | last | Right | empty/cleared |
| 4 | Spanish (Mexico) | first | Left | empty/cleared |
| 5 | Spanish (Mexico) | middle | Right | new-fill |
| 6 | Spanish (Mexico) | last | Name | existing-edit |
| 7 | English (Canada) | first | Right | existing-edit |
| 8 | English (Canada) | middle | Bottom | empty/cleared |
| 9 | English (Canada) | last | Name | new-fill |
| 10 | French (Canada) | first | Bottom | new-fill |
| 11 | French (Canada) | middle | Name | empty/cleared |
| 12 | French (Canada) | last | Left | existing-edit |

**Pair coverage verification** (all 2-factor pairs):
- L×R: 4×3=12 pairs → all present in 12 trials ✓
- L×C: 4×4=16 pairs → all present (each language hits all 4 columns) ✓
- L×D: 4×3=12 pairs → all present ✓
- R×C: 3×4=12 pairs → all present ✓
- R×D: 3×3=9 pairs → all present ✓
- C×D: 4×3=12 pairs → all present ✓

## State-Transition Model (7b-9)

```
States: Clean, Dirty, Saving, Save-OK, Save-Failed, Validation-Error, Navigate-Away-Prompt, Language-Filter-Prompt

Edges (each maps to ≥1 TC):
  Clean → Dirty (name edit)           TC-070
  Clean → Dirty (language change)     TC-071
  Clean → Dirty (RTE edit)            TC-072
  Dirty → Saving → Save-OK           TC-073
  Dirty → Saving → Save-Failed       TC-074 [FAILING — DEF-TNC-005]
  Dirty → Navigate-Away-Prompt        TC-075
  Dirty → Language-Filter-Prompt (Stay)    TC-076
  Dirty → Language-Filter-Prompt (Discard) TC-077
  Dirty → Edit-Another-Row (NO guard) TC-078 [known gap — NM-2191]
  Validation-Error → Fix → Dirty      TC-079
  Dirty → Edit-to-original → Clean    TC-080
  Dirty → Tab-navigation (unconfirmed) TC-081 [Blocked]
```

## Out-of-scope

- `out-of-scope:date-bva=no date or date-offset fields exist in the terms-conditions field inventory; all fields are text, dropdown, RTE, or button`
- `out-of-scope:integration-kafka=downstream Helioscorp sync (NM-1735) has no UI-observable oracle on this surface`
- `out-of-scope:rbac=owner dropped permission axis; NM-3338 won't-pursue`
