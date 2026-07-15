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

export const NOTE_4000_CHARS = 'A'.repeat(4000);
export const NOTE_4001_CHARS = 'A'.repeat(4001);
export const NOTE_2000_CHARS = 'B'.repeat(2000);
export const NOTE_40_CHARS = 'C'.repeat(40);

export const NOTE_ROW_A = 'Row A'; // 5 chars
export const NOTE_ROW_B = 'Row B'; // 5 chars
export const NOTE_ROW_C = 'Row C'; // 5 chars

export const NOTE_SPECIAL_CHARS = '"test", <div>, &amp;, é, ñ';
export const NOTE_XSS = '<script>alert(1)</script>';
export const NOTE_SQL = "'; DROP TABLE notes; --";
export const NOTE_EMOJI = 'café résumé 😀 中文';

export const NOTE_COUNTER_EMPTY = '0/4000';
export const NOTE_COUNTER_FULL = '0 Left';

export const KEYBOARD_TEST = {
  text: 'Keyboard test',
  singleChar: 'a',
} as const;

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

export const NOTE_ROW_ALPHA = 'Row Alpha';           // 9 chars
export const NOTE_ROW_BETA = 'Row Beta';             // 8 chars
export const NOTE_ROW_GAMMA = 'Row Gamma';           // 9 chars
export const NOTE_KEEP_FIRST = 'Keep First';         // 10 chars
export const NOTE_DELETE_ME = 'Delete Me';           // 9 chars
export const NOTE_KEEP_LAST = 'Keep Last';           // 9 chars
export const NOTE_CANCEL_TEST = 'Cancel test note';  // 16 chars

export const NOTE_SEQ_A = 'Sequential A';            // 12 chars
export const NOTE_SEQ_B = 'Sequential B';            // 12 chars
export const NOTE_ORIGINAL = 'Original text';        // 13 chars
export const NOTE_EDITED = 'Edited text';            // 11 chars
export const NOTE_DELETE_CHECK = 'Delete check';     // 12 chars

export const NOTE_1_CHAR = 'a';
export const NOTE_3999_CHARS = 'A'.repeat(3999);
export const NOTE_WHITESPACE_ONLY = '   ';
export const NOTE_LEADING_WS = '  hello';
export const NOTE_TRAILING_WS = 'hello  ';
export const NOTE_TAB_CHAR = 'a\tb';
export const NOTE_NEWLINE_MULTI = 'line1\nline2\nline3';
// NOTE_HTML_ENTITY removed — dropped as duplicate of TC-013 (SPECIAL_CONTENT_TESTS already covers `&amp;`).
export const NOTE_APPEND_BASE = 'Base text';
export const NOTE_APPEND_SUFFIX = ' — appended';
export const NOTE_PREPEND_PREFIX = 'Prepended — ';
export const NOTE_REPLACE_BASE = 'Hello world there';
export const NOTE_REPLACE_SLICE = { start: 6, end: 11, replacement: 'EARTH' };
export const NOTE_2ROW_A = 'Row Alpha-2row';
export const NOTE_2ROW_B = 'Row Beta-2row';
export const NOTE_5ROW = ['r1', 'r2', 'r3', 'r4', 'r5'];
export const NOTE_MIXED_SHORT = 'a';
export const NOTE_MIXED_LONG = 'B'.repeat(4000);
export const NOTE_CANCEL_RESAVE_INITIAL = 'Initial draft';
export const NOTE_CANCEL_RESAVE_FINAL = 'Final saved';
export const NOTE_ESCAPE_DIALOG = 'Escape test';
export const NOTE_IDEMPOTENT = 'Idempotent test';
export const NOTE_SEQUENTIAL_A = 'Sequential A';
export const NOTE_SEQUENTIAL_B = 'Sequential B';
// NOTE_DELETE_WORKAROUND_BASE removed 2026-05-20 — only used by a dropped case (duplicate of TC-012 + TC-026 step 3).
