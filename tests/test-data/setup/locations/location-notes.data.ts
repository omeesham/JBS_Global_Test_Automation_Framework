/**
 * Test data for: Location Notes tab
 * Consumed by: tests/specs/setup/locations/location-notes.spec.ts
 * Office: 1604 (Parker Palm Springs)
 * Last verified: 2026-04-01
 *
 * Changing values here affects the listed spec.
 */

// ---- Standard Test Strings ----
export const NOTE_TEXT_SHORT = 'Test note for exploration'; // 25 chars
export const NOTE_ROW1 = 'First note';   // 10 chars
export const NOTE_ROW2 = 'Second note';  // 11 chars
export const NOTE_HELLO = 'Hello';       // 5 chars
export const NOTE_WORLD = 'World';       // 5 chars
export const NOTE_END = 'End';           // 3 chars
export const NOTE_SAVED = 'Saved note content';     // 18 chars
export const NOTE_PERSISTENT = 'Persistent note';   // 15 chars
export const NOTE_TEMPORARY = 'Temporary text';     // 14 chars
export const NOTE_UNSAVED = 'Unsaved text';         // 12 chars
export const NOTE_LIFECYCLE = 'Sequential test note'; // 20 chars

// ---- Boundary Strings ----
export const NOTE_4000_CHARS = 'A'.repeat(4000);
export const NOTE_4001_CHARS = 'A'.repeat(4001);
export const NOTE_2000_CHARS = 'B'.repeat(2000);
export const NOTE_40_CHARS = 'C'.repeat(40);

// ---- Row manipulation strings ----
export const NOTE_ROW_A = 'Row A'; // 5 chars
export const NOTE_ROW_B = 'Row B'; // 5 chars
export const NOTE_ROW_C = 'Row C'; // 5 chars

// ---- Special Content ----
export const NOTE_SPECIAL_CHARS = '"test", <div>, &amp;, é, ñ';
export const NOTE_XSS = '<script>alert(1)</script>';
export const NOTE_SQL = "'; DROP TABLE notes; --";
export const NOTE_EMOJI = 'café résumé 😀 中文';

// ---- Counter Display Constants ----
export const NOTE_COUNTER_EMPTY = '0/4000';
export const NOTE_COUNTER_FULL = '0 Left';

// ---- Keyboard Test Values ----
export const KEYBOARD_TEST = {
  text: 'Keyboard test',
  singleChar: 'a',
} as const;

// ---- Data-Driven: Special Content Save+Reload (TC-013, TC-018, TC-019, TC-020) ----
export interface SpecialContentData {
  tcId: string;
  name: string;
  text: string;
}

export const SPECIAL_CONTENT_TESTS: SpecialContentData[] = [
  { tcId: '013', name: 'Special/HTML characters stored correctly', text: NOTE_SPECIAL_CHARS },
  { tcId: '018', name: 'XSS payload stored as text', text: NOTE_XSS },
  { tcId: '019', name: 'SQL injection stored as text', text: NOTE_SQL },
  { tcId: '020', name: 'Emoji and unicode preserved', text: NOTE_EMOJI },
];
