/**
 * @agent-doc
 * PURPOSE: Validate selector registry against live DOM -- detects PRESENT/MISSING/CHANGED testids.
 * OWNER: human-only
 * IMPACT: high - Core utility for test-ID tracking across pipeline runs.
 * DEPENDS-ON: src/selectors/index.ts
 * USED-BY: Planner (PLN-034 hard gate), Healer (testid lifecycle), Audit (AUD-025 reconciliation)
 */

import * as fs from 'fs';
import * as path from 'path';
import { ALL_SELECTORS } from '../selectors/index';

// ── Types ──

export interface SelectorRegistryEntry {
  /** Selector key name (e.g., "btnSave", "txtFirstName"). */
  key: string;
  /** Selector value (CSS selector string, e.g., "[data-testid='btnSave']"). */
  value: string;
  /** Source module name (e.g., "ALL_SELECTORS"). */
  source: string;
}

export interface SelectorValidationResult {
  key: string;
  expectedValue: string;
  actualPresent: boolean;
  status: 'PRESENT' | 'MISSING' | 'CHANGED';
  pageUrl: string;
}

export interface TestIdChange {
  key: string;
  previousStatus: 'PRESENT' | 'MISSING' | 'CHANGED';
  currentStatus: 'PRESENT' | 'MISSING' | 'CHANGED';
  description: string;
}

export interface TestIdInventory {
  pageSlug: string;
  timestamp: string;
  results: SelectorValidationResult[];
}

// ── Functions ──

/**
 * Build a registry of all selectors from src/selectors/index.ts.
 * Returns an array of { key, value, source } objects.
 */
export function buildSelectorRegistry(): SelectorRegistryEntry[] {
  const entries: SelectorRegistryEntry[] = [];
  for (const [key, value] of Object.entries(ALL_SELECTORS)) {
    entries.push({ key, value, source: 'ALL_SELECTORS' });
  }
  return entries;
}

/**
 * Extract the data-testid value from a selector string.
 * Handles patterns like: [data-testid='btnSave'], [data-testid="btnSave"], data-testid=btnSave
 * Returns null if the selector doesn't contain a data-testid.
 */
function extractTestIdFromSelector(selector: string): string | null {
  const match = selector.match(/data-testid[=~|^$*]*['"]?([^'"\]]+)['"]?\]/);
  return match?.[1] ?? null;
}

/**
 * Validate selector registry entries against an array of testids found in live DOM.
 * @param registry - Array of selector registry entries (from buildSelectorRegistry)
 * @param domTestIds - Array of data-testid values found in the current DOM
 * @param pageUrl - URL of the page being validated
 * @returns Array of validation results showing PRESENT/MISSING/CHANGED status
 */
export function validateSelectorsAgainstDom(
  registry: SelectorRegistryEntry[],
  domTestIds: string[],
  pageUrl: string = '',
): SelectorValidationResult[] {
  const domTestIdSet = new Set(domTestIds);
  const results: SelectorValidationResult[] = [];

  for (const entry of registry) {
    const expectedTestId = extractTestIdFromSelector(entry.value);
    if (!expectedTestId) {
      // Selector doesn't use data-testid -- skip validation
      continue;
    }

    const present = domTestIdSet.has(expectedTestId);

    results.push({
      key: entry.key,
      expectedValue: expectedTestId,
      actualPresent: present,
      status: present ? 'PRESENT' : 'MISSING',
      pageUrl,
    });
  }

  return results;
}

/**
 * Compare two validation runs and detect changes in testid status.
 * @param previous - Results from a prior validation run
 * @param current - Results from the current validation run
 * @returns Array of changes detected between the two runs
 */
export function detectTestIdChanges(
  previous: SelectorValidationResult[],
  current: SelectorValidationResult[],
): TestIdChange[] {
  const changes: TestIdChange[] = [];
  const prevMap = new Map(previous.map(r => [r.key, r]));
  const currMap = new Map(current.map(r => [r.key, r]));

  // Check all keys in current results
  for (const [key, curr] of currMap) {
    const prev = prevMap.get(key);
    if (!prev) {
      // New selector added to registry
      changes.push({
        key,
        previousStatus: 'MISSING',
        currentStatus: curr.status,
        description: `New selector "${key}" — status: ${curr.status}`,
      });
      continue;
    }

    if (prev.status !== curr.status) {
      changes.push({
        key,
        previousStatus: prev.status,
        currentStatus: curr.status,
        description: `Selector "${key}" changed from ${prev.status} to ${curr.status}`,
      });
    }

    // Detect value change (same key, different expected value means selector was updated)
    if (prev.expectedValue !== curr.expectedValue) {
      changes.push({
        key,
        previousStatus: prev.status,
        currentStatus: 'CHANGED',
        description: `Selector "${key}" expected testid changed from "${prev.expectedValue}" to "${curr.expectedValue}"`,
      });
    }
  }

  // Check for removed selectors (in previous but not in current)
  for (const [key, prev] of prevMap) {
    if (!currMap.has(key)) {
      changes.push({
        key,
        previousStatus: prev.status,
        currentStatus: 'MISSING',
        description: `Selector "${key}" removed from registry`,
      });
    }
  }

  return changes;
}

// ── Inventory persistence (file-based MVP) ──

const INVENTORY_BASE_DIR = path.join(
  process.cwd(),
  'specs_planning',
  '_internal',
  'testid-inventory',
);

/**
 * Load a testid inventory from disk for a given page slug.
 * Returns null if the file doesn't exist.
 */
export function loadTestIdInventory(pageSlug: string): TestIdInventory | null {
  const filePath = path.join(INVENTORY_BASE_DIR, `testid-inventory-${pageSlug}.json`);
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as TestIdInventory;
  } catch {
    return null;
  }
}

/**
 * Save a testid inventory to disk for a given page slug.
 * Creates the directory structure if it doesn't exist.
 */
export function saveTestIdInventory(pageSlug: string, inventory: TestIdInventory): void {
  if (!fs.existsSync(INVENTORY_BASE_DIR)) {
    fs.mkdirSync(INVENTORY_BASE_DIR, { recursive: true });
  }
  const filePath = path.join(INVENTORY_BASE_DIR, `testid-inventory-${pageSlug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(inventory, null, 2) + '\n', 'utf-8');
}
