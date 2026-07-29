# Corporate Pricing Override — walk evidence, 2026-07-17

These are the evidence artifacts the Override test-case plan was authored against. Drop all six
`.md` files into:

```
clients/encore/specs_planning/_internal/
```

They are not in git — `.gitignore` excludes `clients/*/specs_planning/`, which is why they never
arrived with the repo. That is the whole reason for this hand-off.

## About `RCA-MATRIX.md` — it does not exist

It was searched for repo-wide and under every plausible name. **No reconciliation-matrix artifact
for the 2026-07-17 Override walk was ever created.** The only similarly-named file is
`rca-corp-pricing-detail-nm2260-2026-06-24.md`, which is a different RCA from June and unrelated.

Do not wait for it and do not reconstruct one. The reconciliation content lives inline in these six
files as observation and verdict blocks.

## What each file certifies

| File | Covers |
|---|---|
| **A** | Offices 1101 (empty), 1105, 9460. Interactive probes: Active filter, sort, hide/restore, cell edit, dirty-guard dialog. Boolean render differs per tab — Equipment uses an SVG check, Labor uses `aria-checked` (LR-036). |
| **B** | Offices 1606, 1107, 1115, 1974 (pagination bed), 1604 HTTP 500. Blank Override Price renders as an em-dash (NM-1932). |
| **C** | 1604 crash with verbatim response body, NM-2011 repro both orders, 1117 census, Change-Local-Office dialog Active checkbox behaviour (2651 active / 512 inactive). |
| **D** | Drag-and-drop Add-Override. Product Group Picker only appears when currency ≠ ALL. Dropped rows land INACTIVE at 0.00. |
| **E** | Export/import round-trip on 4107. Import rejects the whole file on one empty Override Price (NM-1940); import stalls at 50% in the UI but applies server-side (NM-2186). UPSERT-ALL semantics. |
| **F** | Office 1222 inactive. The location-lookup API ignores `activeOnly` — both values return the same active-only set. |

## Two caveats worth knowing before you certify against these

1. **File B has roughly ten NOT-CAPTURED items** — flagged inside the file itself. Those specific
   claims were recorded from run narration without a corroborating tee'd verify file. Anything you
   certify that leans on them should cite the weaker sourcing or get a fresh look. Every other file
   states its claims verbatim with evidence references.
2. **The raw tee'd output directories (`raw-A/` … `raw-EA4/`) are not included** — they are large and
   machine-local, so you cannot re-hash them. Every technical claim is stated verbatim in the prose,
   which is what the test cases were authored from.

Selectors, office IDs, prices, API endpoints, timestamps and hashes are exactly as recorded on
2026-07-17. Only descriptive headers naming the tooling that ran the walk were reworded.

## Observations

### Bugs / Defects

none (retrofitted — original walk did not record findings)

### Suggestions / Improvements

none (retrofitted — original walk did not record findings)
