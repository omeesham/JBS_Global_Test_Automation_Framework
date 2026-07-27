#!/usr/bin/env ts-node
/**
 * Test Case Linter - Validates test case markdown files against agent rules.
 * Catches violations BEFORE audit to reduce correction cycles.
 * 
 * Rules enforced:
 * - PLN-018: No code names in Steps (chk, spin, rdo, txt, drp, btn prefixes)
 * - PLN-021: No arrows (->) in Data sections
 * - PLN-014: No TBD/unverified test accounts
 * - PLN-015: No uncertain language (if visible, varies by, if exists, or)
 * - AUD-005: No DISCOVER_ placeholders
 * - SUB-001: TC ID submodule code must be in KNOWN_SUB_CODES canonical list
 * 
 * Usage: npm run lint:testcases [path]
 * Exit: 0 = clean, 1 = violations found
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { KNOWN_SUB_CODES } from '../export_test_cases/types';
import { SHARED_PATHS } from './shared-types';

interface Violation {
  rule: string;
  file: string;
  line: number;
  text: string;
  severity: 'error' | 'warning';
}

interface LintResult {
  violations: Violation[];
  filesChecked: number;
  passed: boolean;
}

// Rule definitions with regex patterns
const RULES = {
  'PLN-018': {
    name: 'No code names in Steps',
    // Match code prefixes in **Steps**: sections
    pattern: /\*\*Steps\*\*:.*(?:chk|spin|rdo|txt|drp|btn)[A-Z][a-zA-Z]+/g,
    severity: 'error' as const,
    message: 'Code prefix found in Steps section'
  },
  'PLN-021': {
    name: 'No arrows in Data values',
    // Match -> inside Data: sections or backtick values
    pattern: /\*\*Data\*\*:.*\u2192|`[^`]*\u2192[^`]*`/g,
    severity: 'warning' as const,
    message: 'Arrow (->) in Data/value - use "from X to Y" format'
  },
  'PLN-014': {
    name: 'No TBD test accounts',
    // Match TBD, requires verification, unspecified accounts
    pattern: /(?:test\s*account|login|user)[^.]*(?:TBD|requires?\s+verification|unspecified)/gi,
    severity: 'error' as const,
    message: 'Unverified test account - specify actual account'
  },
  'PLN-015': {
    name: 'No uncertain language in Steps',
    // Match vague navigation phrases
    pattern: /\*\*Steps\*\*:.*(?:if\s+(?:visible|exists|available)|varies\s+by|may\s+be|or\s+similar)/gi,
    severity: 'warning' as const,
    message: 'Uncertain language in Steps - be specific'
  },
  'AUD-005': {
    name: 'No DISCOVER_ placeholders',
    // Match unfilled discovery placeholders
    pattern: /DISCOVER_[A-Za-z_]+/g,
    severity: 'error' as const,
    message: 'Unfilled DISCOVER_ placeholder'
  },
  // === NEW RULES (Phase 4 Expansion) ===
  'PLN-019': {
    name: 'No error keys in Steps',
    // Match ERR_*, ERROR_*, MSG_* constants in Steps
    pattern: /\*\*Steps\*\*:.*(?:ERR_|ERROR_|MSG_)[A-Z_]+/g,
    severity: 'warning' as const,
    message: 'Error key in Steps - use actual message text, move key to Notes'
  },
  'PLN-027': {
    name: 'TC ID format consistency',
    // TC IDs should be TC-{MODULE}-{SUBMOD}-{NNN} format
    pattern: /^##\s+TC-[A-Z]+-\d+[^-]/gm,
    severity: 'warning' as const,
    message: 'TC ID may not follow TC-MOD-SUBMOD-NNN pattern'
  },
  'PLN-012': {
    name: 'Contradictory absolute language',
    // "always" or "permanently" near "disabled" or "enabled" - flag for review
    pattern: /(?:always|permanently|never)\s+(?:disabled|enabled|hidden|visible)/gi,
    severity: 'warning' as const,
    message: 'Absolute language detected - verify field is truly unconditional'
  },
  'PLN-024': {
    name: 'Unverified field references',
    // Common placeholder patterns for unverified fields
    pattern: /(?:\[TBD\]|\[VERIFY\]|\[CHECK\]|field\s+doesn't\s+exist|not\s+found\s+in\s+DOM)/gi,
    severity: 'error' as const,
    message: 'Unverified field reference - verify field exists in live DOM'
  },
  'AUD-008': {
    name: 'Validation timing conflict',
    // Both "on save" and "on load" for same validation concept
    pattern: /(?:on\s+save|after\s+save).*(?:on\s+load|after\s+reload)|(?:on\s+load|after\s+reload).*(?:on\s+save|after\s+save)/gi,
    severity: 'warning' as const,
    message: 'Potential validation timing conflict - verify when validation occurs'
  },
  'PLN-031': {
    name: 'Implicit preconditions',
    // Steps that test state changes without declaring initial state
    pattern: /\d+\.\s+(?:Uncheck|Check|Toggle|Click)\s+\*\*[^*]+\*\*(?!\s+checkbox\s+(?:is|from))/g,
    severity: 'warning' as const,
    message: 'Consider explicitly stating initial field state in Preconditions'
  },
  'GEN-002': {
    name: 'Hardcoded selector pattern',
    // Raw CSS selectors that should be in selectors file
    pattern: /(?:page\.locator|getByRole|querySelector)\s*\(\s*['"][.#\[][\w\s\-_='"#.\[\]]+['"]\s*\)/g,
    severity: 'error' as const,
    message: 'Hardcoded selector - use src/selectors/index.ts'
  },
  'PLN-020': {
    name: 'API/dev instructions in Steps',
    // API calls, function names, or developer terms in Steps
    pattern: /\*\*Steps\*\*:.*(?:API:|api\/|\.then\(|\.catch\(|function\(|=>|console\.)/gi,
    severity: 'warning' as const,
    message: 'API/dev instruction in Steps - move to Notes or Preconditions'
  },
  'AUD-010': {
    name: 'Uncertain language flags',
    // TBD, may be, might, could be, uncertain, unverified
    pattern: /(?:\(TBD\)|\bTBD\b|may\s+be|might\s+be|could\s+be|uncertain|unverified\s+assumption)/gi,
    severity: 'warning' as const,
    message: 'Uncertain language - resolve or flag as known limitation'
  },
  // === COVERAGE VALIDATION RULES (PLN-034 to PLN-040) ===
  'PLN-034': {
    name: 'Missing save-reload-verify pattern',
    // Flag test case files that mention editing but never mention reload/persist
    pattern: /\*\*Steps\*\*:.*(?:Edit|Change|Set|Enter|Modify).*(?!\b(?:reload|refresh|persist|verify after)\b)/gi,
    severity: 'warning' as const,
    message: 'Consider adding save-reload-verify cycle for editable fields'
  },
  'PLN-035': {
    name: 'Missing date validation tests',
    // Flag date TCs without past/future boundary testing keywords
    pattern: /##\s+TC-[A-Z]+-\d+[A-Z]?:.*(?:date|Date)(?!.*(?:past|future|before|after|invalid))/gi,
    severity: 'warning' as const,
    message: 'Date TC may need boundary/relationship tests (past dates, date ranges)'
  },
  'PLN-039': {
    name: 'Missing boundary tests for numeric fields',
    // Flag numeric TC headers without boundary/limit keywords
    pattern: /##\s+TC-[A-Z]+-\d+[A-Z]?:.*(?:percentage|amount|number)(?!.*(?:min|max|boundary|limit))/gi,
    severity: 'warning' as const,
    message: 'Numeric TC may need boundary value tests (min/max/edge)'
  }
};

/** Submodule code set -- derived from canonical KNOWN_SUB_CODES in types.ts. */
const KNOWN_SUB_CODE_SET: Set<string> = new Set(KNOWN_SUB_CODES);

// Extended rules for deeper validation
const EXTENDED_RULES = {
  'PLN-018-STEP': {
    name: 'Code names in numbered steps',
    // More targeted: look for code names after step numbers
    pattern: /\d+\.\s+(?:Verify|Check|Click|Enter|Set|Clear)\s+(?:chk|spin|rdo|txt|drp|btn)[A-Z]/g,
    severity: 'error' as const,
    message: 'Code prefix in step action'
  }
};

// Structural section validation rules (file-level, not line-level)
const STRUCTURAL_RULES = {
  'STRUCT-001': {
    name: 'FIELD INVENTORY section required',
    check: (content: string) => /^## FIELD INVENTORY/im.test(content),
    message: 'Missing "## FIELD INVENTORY" section. Every test case file must document all editable fields in a table.',
  },
  'STRUCT-002': {
    name: 'Validation Rules section required',
    check: (content: string) => /^## Validation Rules/im.test(content),
    message: 'Missing "## Validation Rules" section. Required even if N/A — add "## Validation Rules\\nN/A — [reason]".',
  },
  'STRUCT-003': {
    name: 'MCP_VERIFICATION_LOG section required',
    check: (content: string) => /^## MCP_VERIFICATION_LOG/im.test(content),
    message: 'Missing "## MCP_VERIFICATION_LOG" section. Every test case file must include MCP verification evidence.',
  },
};

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md') && (entry.name.includes('test-cases') || entry.name.includes('test_cases'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/** Find all .spec.ts files recursively under a directory. */
function findSpecFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSpecFiles(fullPath));
    } else if (entry.name.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function lintFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Check each rule
  for (const [ruleId, rule] of Object.entries({ ...RULES, ...EXTENDED_RULES })) {
    // Line-by-line check for better line numbers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      const matches = line.match(rule.pattern);
      
      if (matches && matches[0]) {
        violations.push({
          rule: ruleId,
          file: filePath,
          line: i + 1,
          text: matches[0].substring(0, 80) + (matches[0].length > 80 ? '...' : ''),
          severity: rule.severity
        });
      }
    }
  }

  // Structural section rules (file-level checks)
  for (const [ruleId, rule] of Object.entries(STRUCTURAL_RULES)) {
    if (!rule.check(content)) {
      violations.push({
        rule: ruleId,
        file: filePath,
        line: 1,
        text: rule.message,
        severity: 'error',
      });
    }
  }

  // Structural rule: validate TC ID submodule codes against KNOWN_SUB_CODES
  // [A-Z]? after \d+ allows optional alpha suffix (e.g., TC-LOC-LI-007A)
  const tcIdPattern = /^##\s+(TC-[A-Z]+-([A-Z]+)-\d+[A-Z]?)/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const match = line.match(tcIdPattern);
    if (match && match[2]) {
      const subCode = match[2];
      if (!KNOWN_SUB_CODE_SET.has(subCode)) {
        violations.push({
          rule: 'SUB-001',
          file: filePath,
          line: i + 1,
          text: `Unknown submodule code "${subCode}" in ${match[1]} -- add to KNOWN_SUB_CODES in export_test_cases/types.ts`,
          severity: 'error'
        });
      }
    }
  }

  // Step 13: Every TC must have Automatable: field
  const tcHeaders: { id: string; line: number }[] = [];
  const tcHeaderPattern = /^##\s+(TC-[A-Z]+-[A-Z]+-\d+[A-Z]?)/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const match = line.match(tcHeaderPattern);
    if (match?.[1]) {
      tcHeaders.push({ id: match[1], line: i + 1 });
    }
  }

  for (const tc of tcHeaders) {
    // Search for Automatable: field within this TC's section (next 30 lines)
    const sectionEnd = Math.min(tc.line + 30, lines.length);
    let hasAutomatable = false;
    for (let j = tc.line; j < sectionEnd; j++) {
      const sectionLine = lines[j] ?? '';
      if (sectionLine.match(/^\*\*Automatable\*\*:\s*/i) || sectionLine.match(/^Automatable:\s*/i)) {
        hasAutomatable = true;
        break;
      }
      // Stop if we hit the next TC
      if (j > tc.line && sectionLine.match(/^##\s+TC-/)) break;
    }
    if (!hasAutomatable) {
      violations.push({
        rule: 'AUT-001',
        file: filePath,
        line: tc.line,
        text: `${tc.id} missing Automatable: field (required: Yes, No, or Blocked:[reason])`,
        severity: 'warning'
      });
    }
  }

  // Step 13: TCs with Automatable: No must NOT appear as active tests in any spec
  const nonAutomatableTCs: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const autoNoMatch = line.match(/^\*\*Automatable\*\*:\s*No/i) || line.match(/^Automatable:\s*No/i);
    if (autoNoMatch) {
      // Walk backwards to find the TC ID
      for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
        const prevLine = lines[j] ?? '';
        const tcMatch = prevLine.match(/^##\s+(TC-[A-Z]+-[A-Z]+-\d+[A-Z]?)/);
        if (tcMatch?.[1]) {
          nonAutomatableTCs.push(tcMatch[1]);
          break;
        }
      }
    }
  }

  if (nonAutomatableTCs.length > 0) {
    // Check spec files for active tests matching these TC IDs
    const specsDir = path.join(process.cwd(), 'tests', 'specs');
    if (fs.existsSync(specsDir)) {
      const specFiles = findSpecFiles(specsDir);
      for (const specFile of specFiles) {
        const specContent = fs.readFileSync(specFile, 'utf-8');
        for (const tcId of nonAutomatableTCs) {
          // Look for the TC as an active test (not fixme, not commented)
          const tcPattern = new RegExp(`test\\s*\\(.*${tcId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
          const fixmePattern = new RegExp(`test\\.fixme\\s*\\(.*${tcId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
          if (tcPattern.test(specContent) && !fixmePattern.test(specContent)) {
            violations.push({
              rule: 'AUT-002',
              file: filePath,
              line: 0,
              text: `${tcId} is Automatable: No but appears as active test in ${path.relative(process.cwd(), specFile)}`,
              severity: 'error'
            });
          }
        }
      }
    }
  }
  
  return violations;
}

/**
 * Selector-TC reconciliation: check that selector names referenced in
 * test plan dependency maps exist in src/selectors/index.ts.
 * Reports missing selectors as errors.
 */
function reconcileSelectors(filePath: string, content: string): Violation[] {
  const violations: Violation[] = [];
  const selectorPrefixes = ['btn', 'txt', 'drp', 'chk', 'lnk', 'rdo', 'dlg', 'tbl', 'err', 'col', 'spin'];
  
  // Build set of known selectors from all files under src/selectors/
  const selectorDir = SHARED_PATHS.selectors;
  if (!fs.existsSync(selectorDir)) return violations;
  
  const knownSelectors = new Set<string>();
  const keyPattern = /^\s*(\w+)\s*:/gm;

  // Recursively read all .ts files under src/selectors/
  function scanDir(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { scanDir(fullPath); continue; }
      if (!entry.name.endsWith('.ts')) continue;
      const source = fs.readFileSync(fullPath, 'utf-8');
      let keyMatch: RegExpExecArray | null;
      while ((keyMatch = keyPattern.exec(source)) !== null) {
        if (keyMatch[1]) knownSelectors.add(keyMatch[1]);
      }
    }
  }
  scanDir(selectorDir);
  
  const lines = content.split('\n');
  // Match backtick-wrapped selector names with known prefixes
  const prefixGroup = selectorPrefixes.join('|');
  const selectorRefPattern = new RegExp(`\`((?:${prefixGroup})[A-Z]\\w+)\``, 'g');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    let refMatch: RegExpExecArray | null;
    while ((refMatch = selectorRefPattern.exec(line)) !== null) {
      const selectorName = refMatch[1];
      if (selectorName && !knownSelectors.has(selectorName)) {
        violations.push({
          rule: 'SEL-001',
          file: filePath,
          line: i + 1,
          text: `Selector "${selectorName}" referenced but not found in src/selectors/`,
          severity: 'error',
        });
      }
    }
  }
  
  return violations;
}

function formatViolation(v: Violation): string {
  const icon = v.severity === 'error' ? '[ERR]' : '[WARN]';
  const relativePath = path.relative(process.cwd(), v.file);
  return `${icon} [${v.rule}] ${relativePath}:${v.line}\n   ${v.text}`;
}

function runLint(targetPath?: string): LintResult {
  const searchPath = targetPath || SHARED_PATHS.testCases;
  const files = findMarkdownFiles(searchPath);
  
  if (files.length === 0) {
    console.log(`No test case files found in: ${searchPath}`);
    return { violations: [], filesChecked: 0, passed: true };
  }
  
  const allViolations: Violation[] = [];
  
  for (const file of files) {
    const fileViolations = lintFile(file);
    const content = fs.readFileSync(file, 'utf-8');
    const selectorViolations = reconcileSelectors(file, content);
    allViolations.push(...fileViolations, ...selectorViolations);
  }
  
  return {
    violations: allViolations,
    filesChecked: files.length,
    passed: allViolations.filter(v => v.severity === 'error').length === 0
  };
}

function printReport(result: LintResult): void {
  console.log('\n========================================');
  console.log('  TEST CASE LINT REPORT');
  console.log('========================================\n');
  
  console.log(`Files checked: ${result.filesChecked}`);
  console.log(`Violations: ${result.violations.length}`);
  
  const errors = result.violations.filter(v => v.severity === 'error');
  const warnings = result.violations.filter(v => v.severity === 'warning');
  
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}\n`);
  
  if (result.violations.length > 0) {
    // Group by rule
    const byRule: Record<string, Violation[]> = {};
    for (const v of result.violations) {
      if (!byRule[v.rule]) byRule[v.rule] = [];
      byRule[v.rule]!.push(v);
    }
    
    for (const [rule, violations] of Object.entries(byRule)) {
      const ruleInfo = RULES[rule as keyof typeof RULES] || EXTENDED_RULES[rule as keyof typeof EXTENDED_RULES];
      console.log(`\n--- ${rule}: ${ruleInfo?.name || 'Unknown'} (${violations.length}) ---`);
      
      // Show first 5 per rule to avoid spam
      for (const v of violations.slice(0, 5)) {
        console.log(formatViolation(v));
      }
      if (violations.length > 5) {
        console.log(`   ... and ${violations.length - 5} more`);
      }
    }
  }
  
  console.log('\n========================================');
  if (result.passed) {
    console.log('  [OK] PASSED (no errors, warnings only)');
  } else {
    console.log('  [ERR] FAILED (errors found)');
  }
  console.log('========================================\n');
}

// CLI entry point
const args = process.argv.slice(2);
const staged = args.includes('--staged');

if (staged) {
  // Staged-files-only mode: lint only test-case MDs in the git staging area.
  // Allows the pre-commit hook to gate on new defects without blocking on
  // pre-existing errors in unstaged files.
  const stagedOutput = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf-8' });
  const stagedFiles = stagedOutput
    .split(/\r?\n/)
    .filter(f => /^clients\/[^/]+\/specs_planning\/test-cases\/.+\.md$/.test(f))
    .filter(f => {
      const basename = path.basename(f);
      return basename.includes('test-cases') || basename.includes('test_cases');
    })
    .map(f => path.resolve(process.cwd(), f))
    .filter(f => fs.existsSync(f));

  if (stagedFiles.length === 0) {
    console.log('[lint:testcases --staged] No staged test-case files — skipping.');
    process.exit(0);
  }

  const allViolations: Violation[] = [];
  for (const file of stagedFiles) {
    allViolations.push(...lintFile(file));
    const content = fs.readFileSync(file, 'utf-8');
    allViolations.push(...reconcileSelectors(file, content));
  }

  const result: LintResult = {
    violations: allViolations,
    filesChecked: stagedFiles.length,
    passed: allViolations.filter(v => v.severity === 'error').length === 0
  };

  printReport(result);
  process.exit(result.passed ? 0 : 1);
} else {
  const targetPath = args.filter(a => !a.startsWith('--'))[0];
  const result = runLint(targetPath);
  printReport(result);
  process.exit(result.passed ? 0 : 1);
}
