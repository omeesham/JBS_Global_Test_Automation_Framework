#!/usr/bin/env node
import fs from 'node:fs';

const path = 'export_test_cases/to-csv.ts';
let t = fs.readFileSync(path, 'utf8');
const orig = t;

// Make every `\*\*XYZ\*\*` token in a regex literal optional-bold:
//   \*\*XYZ\*\*  ->  (?:\*\*)?XYZ(?:\*\*)?
// Captures both bolded `**XYZ**:` (legacy) and unbolded `XYZ:` (post-SP-DQU-05B convention).
// Only touches occurrences where the surrounding context is a regex (heuristic: line contains `body.match(`
// or `text.replace(/`). To be safe, do file-wide string substitution — the patterns `\*\*Word\*\*` only
// appear in regex literals in this file.

const replacements = [
  // Plain metadata keys
  ['\\*\\*Status\\*\\*', '(?:\\*\\*)?Status(?:\\*\\*)?'],
  ['\\*\\*Steps\\*\\*', '(?:\\*\\*)?Steps(?:\\*\\*)?'],
  ['\\*\\*Expected\\*\\*', '(?:\\*\\*)?Expected(?:\\*\\*)?'],
  ['\\*\\*Data\\*\\*', '(?:\\*\\*)?Data(?:\\*\\*)?'],
  ['\\*\\*Notes\\*\\*', '(?:\\*\\*)?Notes(?:\\*\\*)?'],
  ['\\*\\*Cleanup\\*\\*', '(?:\\*\\*)?Cleanup(?:\\*\\*)?'],
  ['\\*\\*Automatable\\*\\*', '(?:\\*\\*)?Automatable(?:\\*\\*)?'],
  ['\\*\\*Automation File\\*\\*', '(?:\\*\\*)?Automation File(?:\\*\\*)?'],
  ['\\*\\*Completed saves to verify\\*\\*', '(?:\\*\\*)?Completed saves to verify(?:\\*\\*)?'],
  ['\\*\\*Completed saves\\*\\*', '(?:\\*\\*)?Completed saves(?:\\*\\*)?'],
  ['\\*\\*MCP_VERIFICATION_LOG\\*\\*', '(?:\\*\\*)?MCP_VERIFICATION_LOG(?:\\*\\*)?'],
  ['\\*\\*Preconditions\\*\\*', '(?:\\*\\*)?Preconditions(?:\\*\\*)?'],
  // (Human) variants
  ['\\*\\*Preconditions \\(Human\\)\\*\\*', '(?:\\*\\*)?Preconditions \\(Human\\)(?:\\*\\*)?'],
  ['\\*\\*Steps \\(Human\\)\\*\\*', '(?:\\*\\*)?Steps \\(Human\\)(?:\\*\\*)?'],
  ['\\*\\*Expected Result \\(Human\\)\\*\\*', '(?:\\*\\*)?Expected Result \\(Human\\)(?:\\*\\*)?'],
];

for (const [from, to] of replacements) {
  t = t.split(from).join(to);
}

// Special-case: `\n\*\*` at start of statusMetaMatch anchor — keep the leading-newline anchor BUT
// the `\*\*Status\*\*` was already covered above, becoming `\n(?:\*\*)?Status(?:\*\*)?`.
// Result: matches both `\n**Status**:` (legacy bolded) AND `\nStatus:` (unbolded) at start of a line.

// Lookahead `\*\*` (any bolded marker referenced as terminator inside lookaheads in the
// stepsMatch / expectedMatch / etc. regexes). Those are already covered by the table above.

// Also fix `body.match(/\n\*\*/` patterns where bare `\*\*` appears as a generic anchor.
// Currently only one site: statusMetaMatch's terminator includes `\n\*\*` as a "next bolded section"
// signal. Post-conversion that line should ALSO accept unbolded sections — so generalize to:
//   `\n\*\*`  ->  `\n(?:\*\*|[A-Z][A-Za-z_ ]*:)`
// This matches either the legacy bold-section start OR a plain "Word:" line start. But the test for
// section start needs care; conservative approach is to leave `\n\*\*` as one valid match alternative
// AND to add the unbolded `\n[A-Z][A-Za-z_ ]+:` alternative inside any terminator lookahead that
// uses it. Currently only line 209's `(?=\n\n|\n\*\*|\n---|\n##|$)` uses `\n\*\*` standalone.
t = t.replace(
  /\(\?=\\n\\n\|\\n\\\*\\\*\|\\n---\|\\n##\|\$\)/g,
  '(?=\\n\\n|\\n\\*\\*|\\n[A-Z][A-Za-z_ ]+:|\\n---|\\n##|$)'
);

if (t !== orig) {
  fs.writeFileSync(path, t, 'utf8');
  console.log('WROTE', path);
} else {
  console.log('NO CHANGE');
}
