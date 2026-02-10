/**
 * FILE: src/selectors/index.ts
 * PURPOSE: TypeScript selector constants (PLACEHOLDER - Currently using CSV only)
 * WHY NECESSARY: Reserved for future migration to TypeScript selectors if needed
 * USED BY: CommonMethods.getSelector() checks this first, falls back to CSV
 *
 * HOW IT WORKS:
 * 1. Framework currently uses CSV-only approach (object_repository/*.csv)
 * 2. This file kept as placeholder for future TS selector migration if requested
 * 3. CommonMethods.getSelector() will use TS selectors if populated
 * 4. For now, all selectors come from CSV files
 *
 * FUTURE MIGRATION:
 * If client requests TypeScript selectors:
 * - Add selector objects here (LoginSelectors, HomeSelectors, etc.)
 * - getTsSelector() will return selectors from TS instead of CSV
 * - Provides type safety and faster lookup (no file I/O)
 */

/**
 * Get TypeScript selector by element name
 * @returns selector string or null if not found
 *
 * NOTE: Currently returns null (CSV-only mode)
 * Populate selector objects above to enable TS selector lookup
 */
export function getTsSelector(elementName: string): string | null {
  // Currently empty - using CSV only
  // Future: return ALL_SELECTORS[elementName] ?? null;
  return null;
}

export type SelectorKey<T> = keyof T & string;
