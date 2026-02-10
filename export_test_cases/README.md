# Test Case Converters

**Purpose**: Convert markdown test cases (`specs_planning/test-cases/*.md`) into various formats for import into test management tools.

## 📋 Overview

This folder contains converters that transform test case markdown files into formats required by different test management systems:

- **JSON** - Generic format for programmatic consumption
- **CSV** - Excel/spreadsheet compatible, generic test tools
- **Jira** - Jira Xray/Zephyr test case import
- **TestMo** - TestMo API import format

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
      "title": "Login with valid credentials and MFA",
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
        "testName": "should login with valid credentials and MFA",
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
      "name": "Login with valid credentials and MFA",
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
