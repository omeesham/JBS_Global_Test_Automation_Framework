#!/usr/bin/env node
import fs from 'node:fs';

const path = 'clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md';
let t = fs.readFileSync(path, 'utf8');
const orig = t;

// Sweep all remaining bold patterns >40 chars (subsection markers / descriptive emphasis).
// Drop bold; these are not UI labels.
t = t.replace(/\*\*([A-Z][^*]+)\*\*:/g, '$1:');
t = t.replace(/\*\*([A-Z][^*]+)\*\*/g, '$1');

// Drop quotes from metadata-key-like patterns I quoted by mistake (followed by ' (' or ':').
// Pattern: "MCP_VERIFICATION_LOG" (header counts) -> MCP_VERIFICATION_LOG (header counts)
t = t.replace(/"(MCP_VERIFICATION_LOG)"(?= \()/g, '$1');
t = t.replace(/"(Conditionally-Disabled Fields)"(?=:)/g, '$1');
t = t.replace(/"(Conditionally-Disabled Fields)"(?= \()/g, '$1');
t = t.replace(/"(Critical Discoveries)"(?= \()/g, '$1');

if (t !== orig) {
  fs.writeFileSync(path, t, 'utf8');
  console.log('WROTE', path);
} else {
  console.log('NO CHANGE');
}
