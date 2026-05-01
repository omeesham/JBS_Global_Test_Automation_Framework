# PLAN: Test Data CSV Conversion

**Status**: PENDING
**Priority**: P2-CYCLE-3
**Depends on**: PLAN_TEST_DATA_PERFECTION (all TS data must be perfected first)
**Blocks**: None

---

## Context

After PLAN_TEST_DATA_PERFECTION completes, all test data will be properly centralized in `tests/test-data/` with full spec-traceability comments. This plan converts the storage format from TypeScript to CSV so non-technical team members can read and edit test data without touching code. The approach preserves the existing `import { X } from '...'` pattern in specs via thin TypeScript shim files that load CSV at module evaluation time.

---

## Architecture: CSV + TypeScript Shim

### Why not pure CSV?
- Specs use synchronous `import { X } from` — CSV requires a loader
- Complex data (nested objects, typed arrays) needs reconstitution
- Programmatic data (`'A'.repeat(4000)`) can't exist in CSV
- TypeScript interfaces provide type safety at import boundaries

### Solution
```
CSV files (data lives here, humans edit this)
    ↓ loaded by
csv-loader.ts (synchronous parser with comment stripping, nesting, repeat directives)
    ↓ re-exported by
.data.ts shim files (typed constants, computed derivations)
    ↓ imported by
spec files (ZERO changes — same imports as before)
```

---

## CSV Format Conventions

### Comment Header (every CSV file)
```csv
# SPEC: tests/specs/setup/locations/location-currency.spec.ts
# DATASET: UNSELECTED_CURRENCY_STATES
# TC: TC-LOC-CUR-003, TC-LOC-CUR-004
# FIELDS: tcId, currency code, selector keys for Selected/IsDefault checkboxes
# VERIFIED: office 1604, 2026-03-XX
```

### Flat Array-of-Objects (most common)
```csv
# SPEC: tests/specs/setup/local-office/local-office-settings.spec.ts
# DATASET: CHECKBOX_DEFAULTS
# TC: BAS-011
key,label,checked,disabled
chkUseFulfillment,Use Fulfillment,false,false
chkUseEquipmentsQc,Use Equipments QC,false,true
```

### Key-Value Constants (simple scalars)
```csv
# SPEC: tests/specs/setup/local-office/*.spec.ts, tests/specs/setup/locations/*.spec.ts
# DATASET: COMMON_CONSTANTS
name,value
OFFICE_NO,1604
```

### Nested Object Flattening (DependencyCase)
```csv
# Dot-notation for nested arrays: restore.0.key, restore.0.action
label,trigger,triggerAction,target,targetType,expectedDisabled,expectedChecked,restore.0.key,restore.0.action,restore.1.key,restore.1.action,spinRestore.key,spinRestore.value,pending
Apply LDW -> LDW Percentage,chkApplyLDW,uncheck,spinLDWPercentage,spin,true,,chkApplyLDW,check,,,spinLDWPercentage,0.04,
```

### Programmatic Data (repeat directive)
```csv
# __repeat_char + __repeat_count columns → loader generates char.repeat(count)
name,value,__repeat_char,__repeat_count
NOTE_4000_CHARS,,A,4000
NOTE_4001_CHARS,,A,4001
```

### Simple String Arrays
```csv
# One-column CSV for SelectorKey[] arrays
key
chkApplyLDW
chkTickerCalc
chkEnableSetStrikeLaborMinutes
```

---

## File Structure: Directory Per Feature

Each `.data.ts` becomes a directory with one CSV per dataset:

```
tests/test-data/
  common.data.csv
  csv-loader.ts                              ← NEW: synchronous CSV parser
  setup/local-office/
    local-office-settings/                   ← directory replaces .data.ts
      date-offset-defaults.csv
      checkbox-defaults.csv
      one-day-job-checkboxes.csv
      default-sections.csv
      constants.csv                          ← key-value: DEFAULT_PHONE_1, etc.
      ect-fixed-cost-fields.csv
      date-offset-test-values.csv            ← from SP-02 extraction
      phone-test-values.csv                  ← from SP-02 extraction
      ...
    local-office-settings.data.ts            ← shim: loads CSVs, exports typed constants
    local-office-ect/
      constants.csv
      sections.csv
      benefits-multiplier.csv
      ...
    local-office-ect.data.ts                 ← shim
    local-office-history/
      ...
    local-office-history.data.ts             ← shim
  setup/locations/
    location-local-info/                     ← directory (most complex)
      checked-defaults.csv
      unchecked-defaults.csv
      disabled-checkboxes.csv
      disabled-checkbox-states.csv
      spin-defaults.csv
      ldw-boundaries.csv
      simple-dependencies.csv               ← dot-notation flattening
      left-panel-expected.csv
      text-field-constraints.csv
      checkbox-label-cases.csv
      local-info-test-values.csv
    location-local-info.data.ts              ← shim
    ... (similar for other features)
```

---

## csv-loader.ts Design

**File**: `tests/test-data/csv-loader.ts`

### Core API
```typescript
// Load CSV → typed array of objects
loadCsv<T>(csvPath: string): T[]

// Load key-value CSV → single string value
loadCsvValue(csvPath: string, key: string): string

// Load key-value CSV → all values as Record
loadCsvConstants(csvPath: string): Record<string, string>

// Validate selector keys exist at module load time
validateSelectorKeys(keys: string[], selectors: Record<string, any>, csvFile: string): void
```

### Features
1. **Comment stripping**: Lines starting with `#` removed before parsing
2. **Boolean parsing**: `"true"` → `true`, `"false"` → `false` (string values preserved)
3. **Nested reconstitution**: `restore.0.key` + `restore.0.action` → `restore: [{ key, action }]`
4. **Repeat directives**: `__repeat_char` + `__repeat_count` → generated string
5. **Caching**: Module-level `Map<string, any>` prevents re-parsing
6. **Synchronous**: Uses `fs.readFileSync` + `XLSX.read` (not async AdapterFactory)

### Why not extend ExcelAdapter?
- ExcelAdapter is async (`Promise<AdapterResult>`) — breaks `import { X } from` pattern
- csv-loader is simpler, synchronous, test-data-specific
- ExcelAdapter stays for runtime data-driven tests (the AdapterFactory pattern)

---

## Shim File Pattern

Each `.data.ts` shim shrinks from data-heavy to loader calls:

```typescript
// tests/test-data/setup/locations/location-currency.data.ts (AFTER conversion)
import { loadCsv, loadCsvValue, loadCsvConstants } from '../../csv-loader';
import * as path from 'path';

const DIR = path.join(__dirname, 'location-currency');

/** @specs location-currency.spec.ts | @tc TC-LOC-CUR-001 */
export const CURRENCY_COLUMN_HEADERS = loadCsv<{ header: string }>(
  path.join(DIR, 'column-headers.csv')
).map(r => r.header);

/** @specs location-currency.spec.ts | @tc TC-LOC-CUR-003, TC-LOC-CUR-004 */
export const UNSELECTED_CURRENCY_STATES = loadCsv<{
  tcId: string; currency: string; selectedKey: string; isDefaultKey: string;
}>(path.join(DIR, 'unselected-currency-states.csv'));

// ... etc
```

**Key**: Specs don't change. Same `import { CURRENCY_COLUMN_HEADERS } from '...'` as before.

---

## Type Safety Preservation

### Kept in TypeScript
- Interfaces (`BoundaryCase`, `DependencyCase`, `SpinDefault`, etc.)
- Generic typing on `loadCsv<T>()`
- Computed derivations (`ACTIVE_DEPENDENCIES = SIMPLE_DEPENDENCIES.filter(...)`)
- `SelectorKey` type alias

### Lost (mitigated)
- Compile-time `keyof typeof Selectors` enforcement on CSV string values
- **Mitigation**: `validateSelectorKeys()` called in shim files — fails at module load if CSV has invalid selector key

---

## Migration Phases

### Phase 1: Infrastructure
1. Create `tests/test-data/csv-loader.ts`
2. Write unit tests for csv-loader (comment stripping, boolean parsing, nesting, repeat)
3. Verify tests pass

### Phase 2: Canary (common.data)
1. Create `common.data.csv`
2. Rewrite `common.data.ts` as shim
3. Run all specs — zero regressions

### Phase 3: Simple files (one at a time)
Order: auto-addon → currency → legal → shared-setup → pricing → account-address → local-office-settings → ect → history

For each:
1. Create CSV directory + files
2. Rewrite `.data.ts` as shim
3. Run affected spec — verify pass
4. Next file

### Phase 4: Complex files
1. `location-notes.data.ts` — tests repeat directive + special char quoting
2. `location-local-info.data.ts` — tests nested reconstitution (SIMPLE_DEPENDENCIES)

### Phase 5: Agent prompt updates
- Generator: create CSV + shim instead of data-heavy `.data.ts`
- Healer: understand CSV + shim structure
- Shared rules: new ALL-XXX rule for CSV data standard

### Phase 6: Full regression
- Run complete test suite
- Type check (`npx tsc --noEmit`)
- Verify every CSV has comment headers
- Verify no data literals remain in `.data.ts` shim files

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| CSV quoting breaks XSS/SQL strings | xlsx library handles RFC 4180 quoting; unit test with all special content |
| Nested reconstitution wrong shape | Unit test with exact SIMPLE_DEPENDENCIES data; compare to original TS object |
| Boolean/number parsing false positives | Only parse booleans; strings stay as strings (no auto-number conversion) |
| `'0000'` parsed as `0` | Explicitly: NO number parsing in csv-loader. All values are strings unless boolean |
| Agent generates wrong CSV format | Provide CSV templates in agent prompt; csv-loader validates and rejects malformed |
| Performance concern | CSV files are tiny (<50 rows); module-level caching eliminates re-parsing |

---

## Files Touched

**New files**:
- `tests/test-data/csv-loader.ts`
- `tests/test-data/csv-loader.test.ts` (unit tests)
- ~40 CSV files across feature directories

**Modified files**:
- 12 `.data.ts` files (rewritten as thin shims)
- 0 spec files (unchanged — that's the point)
- 3 agent prompt files (Generator, Healer, Shared Rules)
- 1 example file (`data-driven-pattern.spec.ts`)

---

## Success Criteria

- [ ] All test data values live in CSV files
- [ ] All `.data.ts` files are thin shims (no inline data, only loader calls + types)
- [ ] All spec imports unchanged
- [ ] Full test suite passes with zero regressions
- [ ] Every CSV has traceability comment header
- [ ] csv-loader unit tests cover all features
- [ ] Agent prompts updated for CSV-first generation
- [ ] Non-technical team member can open a CSV and understand what it affects
