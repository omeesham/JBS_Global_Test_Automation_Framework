# Test Case Converters

**Purpose**: Convert markdown test cases (`specs_planning/test-cases/*.md`) into various formats for import into test management tools.

## 📋 Overview

This folder contains converters that transform test case markdown files into formats required by different test management systems:

- **JSON** - Generic format for programmatic consumption
- **CSV** - Excel/spreadsheet compatible, generic test tools
- **Jira** - Jira Xray/Zephyr test case import
- **TestMo** - TestMo API import format

## 🔄 Dual-Format System (Human + Agent)

Test cases support **two parallel formats** in the same markdown file:

| Audience | Fields | Purpose |
|----------|--------|---------|
| **Human (QA)** | Preconditions (Human), Steps (Human), Expected Result (Human), Notes | Plain English, UI labels, per-step expectations |
| **Agent (Automation)** | Steps, Expected, Data | Element IDs, code syntax, parser-optimized |

### Why Dual-Format?

- **Agents** need element IDs (`chkApplyLDW`, `spinLDWPercentage`) for automation
- **QA testers** need readable instructions ("**Apply LDW** checkbox", "**LDW Percentage** field")
- **CSV export** filters by audience — human export excludes technical `_for_agent` columns

### Export Types

```bash
# Human export (default) - for QA testers
npx ts-node export_test_cases/to-csv.ts ./input.md ./output.csv

# Agent export - for automation tools
npx ts-node export_test_cases/to-csv.ts ./input.md ./output.csv --type=agent

# Full export - both human and agent columns
npx ts-node export_test_cases/to-csv.ts ./input.md ./output.csv --type=full
```

### Writing Guidelines

**Human columns (for QA):**
- One action per numbered step, plain English
- Quoted UI element labels: "Apply LDW" checkbox, "Save" button
- No arrow syntax (`→`), no element IDs (`chkApplyLDW`)
- The Steps column is action-only; per-step expectations live in the Expected Result column

**Agent columns (for automation):**
- Element IDs: `chkApplyLDW`, `spinLDWPercentage`, `btnSave`
- Arrow syntax: `action → expected`
- Key-value data: `` `field=value` ``

**Field name translation:**
| Element ID | Human Label |
|------------|-------------|
| `chkApplyLDW` | "Apply LDW" checkbox |
| `spinLDWPercentage` | "LDW Percentage" field |
| `drpOracleOrg` | "Oracle Organization" dropdown |
| `btnSave` | "Save" button |
| `txtUsername` | "Username" text field |

### What the human exporter strips and translates

The CSV exporter routes every human-column value through two helpers in `to-csv.ts`:

**`cleanMarkdown(text)`** — applied to all human columns (Title, Steps, Expected Result, Preconditions, Notes):
- `**X**` → `"X"`  (markdown bold becomes a quoted value)
- `` `X` `` → `X`  (backticks stripped)
- Emoji `[\u2705 \u26A0\uFE0F \u274C \u2744]` dropped
- Smart quotes / em-dashes / Unicode arrows / `\u2713 \u2714` checkmarks normalized to ASCII via `sanitizeUnicode`

**`humanizeAssertion(text)`** — applied to all human columns to remove DOM/a11y jargon:
- `aria-selected="true"` → `is selected` (and `="false"` variant)
- `aria-checked="true"` → `is checked`
- `aria-invalid="true"` → `is invalid`; bare `aria-invalid` → `validation error`
- Phrase forms: `field gets/has aria-invalid` → `field shows a validation error`; `does not have aria-invalid` / `no longer has aria-invalid` → `is valid`
- `Tab has aria-selected="true"` → `tab is selected`
- `disabled="true"` / `has disabled attribute` → `is disabled`; `no disabled attribute` → `is enabled`
- `Page title = "X"` → `page title is "X"`; `Input value = "X"` → `field shows "X"`
- `data-testid="..."` and `[data-testid="..."]` clauses are dropped
- `aria-label`, `aria-valuenow`, `aria-expanded` are intentionally PRESERVED (they may be deliberate accessibility documentation)

**Format change in the Steps column:**
- The pre-2026-04 `[ok]` per-step expected line has been removed — Steps is now action-only.
- The Expected Result column carries the per-TC `**Expected**:` summary, humanized.

### Re-exporting after editing source markdown

```bash
# Single file
npx ts-node export_test_cases/to-csv.ts \
  clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md \
  clients/encore/exports/local_office_settings_test_cases.csv \
  --type=human

# All files (also runs spec/markdown/csv parity check)
npm run check:tc-parity:fix
```

Output dir is **`clients/encore/exports/`** (canonical post-restructure). The `export_test_cases/exports/` dir is orphaned; do not write there.

### Example

See [specs_planning/_internal/test-case-template.md](../specs_planning/_internal/test-case-template.md) for complete dual-format example.

Live example: TC-LOC-015 in [local-information-test-cases.md](../specs_planning/test-cases/locations/local-information-test-cases.md).

## 🏗️ Architecture

```
markdown-parser.ts          # Base parser (MD → TypeScript objects)
    ↓
types.ts                    # TypeScript interfaces (TestCase, TestStep, etc.)
    ↓
Converters:
├── to-json.ts             # TestCase → JSON
├── to-csv.ts              # TestCase → CSV
├── to-jira.ts             # TestCase → Jira CSV/API format
└── to-testmo.ts           # TestCase → TestMo JSON
```

## 📦 Files

| File | Purpose | Output Format |
|------|---------|---------------|
| `types.ts` | TypeScript interfaces for test cases | N/A |
| `markdown-parser.ts` | Parse markdown test cases | `TestCaseCollection` |
| `to-json.ts` | Generic JSON export | JSON |
| `to-csv.ts` | Generic CSV export | CSV |
| `to-jira.ts` | Jira-specific format | CSV + JSON API payload |
| `to-testmo.ts` | TestMo-specific format | JSON |

## 🚀 Usage

### TypeScript API (Programmatic)

```typescript
import { JsonConverter } from './export_test_cases/to-json';
import { CsvConverter } from './export_test_cases/to-csv';
import { JiraConverter } from './export_test_cases/to-jira';
import { TestmoConverter } from './export_test_cases/to-testmo';

const testCasesDir = './specs_planning/test-cases';

// JSON export
JsonConverter.convertToFile(testCasesDir, './exports/test-cases.json');

// CSV export
CsvConverter.convertToFile(testCasesDir, './exports/test-cases.csv');

// Jira export
JiraConverter.convertToFile(testCasesDir, './exports/jira-import.csv', 'MYPROJ');

// TestMo export
TestmoConverter.convertToFile(testCasesDir, './exports/testmo-import.json', 'suite-123');
```

### Command Line Usage

**Note**: Converters are TypeScript files. Use one of these methods:

**Method 1: ts-node (Works Immediately)**
```bash
# JSON
npx ts-node -e "require('./export_test_cases/to-json').JsonConverter.convertToFile('./specs_planning/test-cases', './exports/test-cases.json')"

# CSV
npx ts-node -e "require('./export_test_cases/to-csv').CsvConverter.convertToFile('./specs_planning/test-cases', './exports/test-cases.csv')"

# Jira (with project key)
npx ts-node -e "require('./export_test_cases/to-jira').JiraConverter.convertToFile('./specs_planning/test-cases', './exports/jira.csv', 'PROJ')"

# TestMo (with suite ID)
npx ts-node -e "require('./export_test_cases/to-testmo').TestmoConverter.convertToFile('./specs_planning/test-cases', './exports/testmo.json', 'suite-456')"
```

**Method 2: npm Scripts (Cleanest - Recommended)**
```bash
# After adding scripts to package.json (see below)
npm run export:json
npm run export:csv
npm run export:jira
npm run export:testmo
```

### Setup npm Scripts (Optional)

For cleaner commands, add to `package.json`:

```json
{
  "scripts": {
    "export:json": "ts-node export_test_cases/to-json.ts",
    "export:csv": "ts-node export_test_cases/to-csv.ts",
    "export:jira": "ts-node -e \"require('./export_test_cases/to-jira').JiraConverter.convertToFile('./specs_planning/test-cases', './exports/jira.csv', 'PROJ')\"",
    "export:testmo": "ts-node -e \"require('./export_test_cases/to-testmo').TestmoConverter.convertToFile('./specs_planning/test-cases', './exports/testmo.json', 'suite-123')\""
  }
}
```

Then run:
```bash
npm run export:json
npm run export:jira
```

## 📊 Output Formats

### JSON Format

```json
{
  "metadata": {
    "generatedAt": "2026-02-08T...",
    "totalCases": 10,
    "automated": 7,
    "manual": 3,
    "source": "./specs_planning/test-cases"
  },
  "testCases": [
    {
      "id": "TC-001",
      "title": "Login with valid credentials",
      "type": "User-Requested",
      "priority": "Critical",
      "automationStatus": "Automated",
      "description": "...",
      "preconditions": [...],
      "steps": [...],
      "testData": [...],
      "expectedResults": [...],
      "automationDetails": {
        "file": "tests/specs/auth/login.spec.ts",
        "testName": "should login with valid credentials",
        "lineRange": "15-30"
      }
    }
  ]
}
```

### CSV Format

```csv
Test Case ID,Title,Type,Priority,Automation Status,Description,...
"TC-001","Login with valid credentials","User-Requested","Critical","Automated","Verify login flow",...
```

### Jira CSV Format

```csv
Test Case Key,Test Summary,Test Priority,Test Type,Test Description,...
"PROJ-001","Login with valid credentials","Highest","Automated","Verify login flow",...
```

### TestMo JSON Format

```json
{
  "meta": {
    "version": "1.0",
    "generatedAt": "2026-02-08T...",
    "source": "Hybrid Framework Export"
  },
  "suite_id": "suite-123",
  "tests": [
    {
      "name": "Login with valid credentials",
      "external_id": "TC-001",
      "priority": 1,
      "status": "ready",
      "steps": [...],
      "custom_fields": {...}
    }
  ]
}
```

## 🔧 Customization

### Adding New Converters

1. Create `to-[tool].ts` file
2. Implement converter class with `convert()` and `convertToFile()` methods
3. Use `MarkdownParser.parseDirectory()` to get test cases
4. Map to tool-specific format

Example:
```typescript
import { MarkdownParser } from './markdown-parser';

export class MyToolConverter {
  static convert(testCasesDir: string): string {
    const collection = MarkdownParser.parseDirectory(testCasesDir);
    // Transform to MyTool format
    return JSON.stringify(transformed);
  }

  static convertToFile(testCasesDir: string, outputPath: string): void {
    const output = this.convert(testCasesDir);
    require('fs').writeFileSync(outputPath, output, 'utf-8');
  }
}
```

### Modifying Parsed Fields

Edit `markdown-parser.ts` → `parseTestCase()` method to extract additional fields from markdown.

## 🎯 Integration Examples

### Jira API Integration

```typescript
import axios from 'axios';
import { JiraConverter } from './export_test_cases/to-jira';

const apiPayload = JiraConverter.convertToJiraApi('./specs_planning/test-cases', 'MYPROJ');

for (const testCase of apiPayload) {
  await axios.post('https://jira.example.com/rest/api/2/issue', testCase, {
    auth: { username: 'user', password: 'token' }
  });
}
```

### TestMo API Integration

```typescript
import axios from 'axios';
import { TestmoConverter } from './export_test_cases/to-testmo';

const collection = TestmoConverter.convert('./specs_planning/test-cases', 'suite-123');

await axios.post('https://app.testmo.com/api/tests/import', collection, {
  headers: { 'Authorization': `Bearer ${process.env.TESTMO_API_KEY}` }
});
```

## ⚠️ Submodule Code Mapping

The CSV exporter maps TC ID submodule codes (e.g., `PRI` in `TC-LOC-PRI-001`) to human-readable names via `subMap` in `to-csv.ts`:

| Code | Maps To | Example ID |
|------|---------|------------|
| `CUR` | `currency` | `TC-LOC-CUR-001` |
| `PRI` | `pricing` | `TC-LOC-PRI-001` |
| `PRC` | `pricing` (legacy) | — |
| `LI` | `local_information` | `TC-LOC-LI-001` |
| `LCL` | `local_information` (legacy) | — |
| `ACC` | `account_address` | — |
| `LGL` | `legal` | — |
| `NTS` | `notes` | — |

**When adding a new submodule code**: Update BOTH locations (COP-013):
1. `export_test_cases/to-csv.ts` → `subMap` in `extractSubmodule()`
2. `scripts/lint-test-cases.ts` → `KNOWN_SUB_CODES` set

Unmapped codes trigger a `console.warn()` at export time and fail `npm run lint:testcases` with error `SUB-001`.

## 📝 Notes

- **Converters only** - No API integration yet (add later when needed)
- **Source of truth** - Markdown test cases in `specs_planning/test-cases/`
- **Automation tracking** - Converters preserve automation file paths and status
- **Extensible** - Easy to add new formats by creating new converters

## 🚀 Next Steps

When API integration is needed:

1. Create `scripts/exporters/` folder
2. Add tool-specific API clients (jira-exporter.ts, testmo-exporter.ts)
3. Use converters to prepare data
4. POST to tool APIs with authentication
5. Add npm scripts for one-command export

For now, converters provide **format transformation** - API upload scripts will be added when required.
