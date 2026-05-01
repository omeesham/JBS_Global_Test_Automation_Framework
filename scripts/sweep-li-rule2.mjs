#!/usr/bin/env node
import fs from 'node:fs';

const path = 'clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md';
let t = fs.readFileSync(path, 'utf8');
const orig = t;

// Step 1: metadata keys (bold + trailing colon) -> drop bold, keep colon.
//   **Steps**:        -> Steps:
//   **MCP_VERIFICATION_LOG**: -> MCP_VERIFICATION_LOG:
t = t.replace(/\*\*([A-Z][^*]{0,40})\*\*:/g, '$1:');

// Step 2: bold UI labels (uppercase-start, NOT followed by colon) -> double quotes.
//   **Apply LDW**     -> "Apply LDW"
//   **Allow ETS**     -> "Allow ETS"
t = t.replace(/\*\*([A-Z][^*]{0,40})\*\*(?!:)/g, '"$1"');

// Step 3: lowercase-start UI label exception
t = t.replace(/\*\*(eCommerce Active)\*\*/g, '"$1"');

if (t !== orig) {
  fs.writeFileSync(path, t, 'utf8');
  console.log('WROTE', path);
} else {
  console.log('NO CHANGE');
}
