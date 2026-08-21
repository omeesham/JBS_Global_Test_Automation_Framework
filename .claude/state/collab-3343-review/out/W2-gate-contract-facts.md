## POSITIVE CONTROL
COMMAND: Select-String -Path scripts\check-interaction-coverage.mjs -Pattern 'claim-census' -Context 0,0
RAW OUTPUT:

scripts\check-interaction-coverage.mjs:718:  // Oracle 5 — claim-census (1117 + NM-2011)
scripts\check-interaction-coverage.mjs:812:        name: 'claim-census',
scripts\check-interaction-coverage.mjs:815:        reason: `CLAIM-CENSUS VIOLATION: ${claimEls.length} element(s) carry claim-sourced dispositions with no valid census evidence — ` +
scripts\check-interaction-coverage.mjs:821:        name: 'claim-census',
scripts\check-interaction-coverage.mjs:830:        name: 'claim-census',
scripts\check-interaction-coverage.mjs:1396:  assert(r24.checks.some(c => c.name === 'claim-census' && c.verdict === 'UNCHECKABLE'),
scripts\check-interaction-coverage.mjs:1483:  // T29: Oracle 5 RED — basis: "claim:*" with no census → claim-census FAIL
scripts\check-interaction-coverage.mjs:1484:  console.log('\n=== T29: Oracle 5 — claim basis, no census → claim-census FAIL ===');
scripts\check-interaction-coverage.mjs:1497:  assert(r29.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'),
scripts\check-interaction-coverage.mjs:1498:    'claim-census verdict is FAIL for unverified claim');
scripts\check-interaction-coverage.mjs:1500:  // T30: Oracle 5 RED — unrecognized basis prefix → claim-census UNCHECKABLE
scripts\check-interaction-coverage.mjs:1514:  assert(r30.checks.some(c => c.name === 'claim-census' && c.verdict === 'UNCHECKABLE'),
scripts\check-interaction-coverage.mjs:1515:    'claim-census verdict is UNCHECKABLE for unrecognized basis prefix');
scripts\check-interaction-coverage.mjs:1517:  // T31: Oracle 5 GREEN — claim + valid census (real file) both present → claim-census PASS
scripts\check-interaction-coverage.mjs:1518:  console.log('\n=== T31: Oracle 5 — claim + valid census (real file) present → claim-census PASS ===');
scripts\check-interaction-coverage.mjs:1538:  assert(r31.checks.find(c => c.name === 'claim-census').pass,
scripts\check-interaction-coverage.mjs:1539:    'claim + valid census (real file) both present → claim-census PASS');
scripts\check-interaction-coverage.mjs:1542:  // T32: Oracle 5 GREEN — observed basis only, no claims → oracle N/A, claim-census PASS
scripts\check-interaction-coverage.mjs:1543:  console.log('\n=== T32: Oracle 5 — observed basis only → claim-census PASS (N/A) ===');
scripts\check-interaction-coverage.mjs:1553:  assert(r32.checks.find(c => c.name === 'claim-census').pass,
scripts\check-interaction-coverage.mjs:1554:    'observed-only basis → claim-census PASS (no claims to verify)');
scripts\check-interaction-coverage.mjs:1571:  assert(r33.checks.some(c => c.name === 'claim-census' && c.verdict === 'UNCHECKABLE'),
scripts\check-interaction-coverage.mjs:1572:    'claim-census verdict is UNCHECKABLE');
scripts\check-interaction-coverage.mjs:1630:  assert(r38.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'), 'claim-census FAIL — empty census: invalid');
scripts\check-interaction-coverage.mjs:1641:  assert(r39.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'), 'claim-census FAIL — whitespace census: invalid');
scripts\check-interaction-coverage.mjs:1652:  assert(r40.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'), 'claim-census FAIL — non-existent census artifact');
scripts\check-interaction-coverage.mjs:1683:  assert(r47.checks.some(c => c.name === 'claim-census' && c.verdict === 'UNCHECKABLE'), 'claim-census UNCHECKABLE for empty observed:');
scripts\check-interaction-coverage.mjs:1694:  assert(r48.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'), 'claim-census FAIL for uppercase CLAIM: — case is not an escape hatch');
scripts\check-interaction-coverage.mjs:1777:  assert(r55.checks.some(c => c.name === 'claim-census' && c.verdict === 'FAIL'),
scripts\check-interaction-coverage.mjs:1778:    'claim-census FAIL — unrelated format cannot corroborate');
scripts\check-interaction-coverage.mjs:1921:  assert(r65.checks.some(c => c.name === 'claim-census' && !c.pass),
scripts\check-interaction-coverage.mjs:1922:    'claim-census catches unlinkable census — artifact does not mention claim subject');
scripts\check-interaction-coverage.mjs:2143:    // T82: S5-claim-census (1117) → claim-census must fire
scripts\check-interaction-coverage.mjs:2144:    console.log('\n=== T82: Corpus S5-claim-census — claim-census fires ===');
scripts\check-interaction-coverage.mjs:2145:    const s5 = byId['S5-claim-census'];
scripts\check-interaction-coverage.mjs:2146:    assert(s5 !== undefined, 'S5-claim-census specimen present in corpus');
scripts\check-interaction-coverage.mjs:2150:      assert(rs5.checks.some(c => c.name === 'claim-census' && !c.pass),
scripts\check-interaction-coverage.mjs:2151:        'S5: claim-census fires — claim-sourced disposition with no machine-readable census evidence');




## Q1
Literal UNRESOLVED-PROBE-GATE is absent in scoped scripts/check-interaction-coverage.mjs; nearest probe gate found is degenerate-probe-guard.
COMMAND: Select-String -Path scripts\check-interaction-coverage.mjs -Pattern 'UNRESOLVED-PROBE-GATE|UNRESOLVED|unresolved' -Context 0,0
RAW OUTPUT:

QUOTE:
127:   // Degenerate-probe guard: PROBED elements must carry actual probe data
128:   const degenerateProbeViolations = [];
129:   if (Array.isArray(map.elements)) {
130:     for (const el of map.elements) {
131:       if (el.emissionStatus === 'PROBED') {
132:         if (!Array.isArray(el.probes) || el.probes.length === 0 ||
133:             el.probes.some(p => !p || typeof p !== 'object')) {
134:           degenerateProbeViolations.push(el.elementId || '(unknown)');
135:         }
136:       }
137:     }
138:   }
139:   checks.push({
140:     name: 'degenerate-probe-guard',
141:     verdict: degenerateProbeViolations.length === 0 ? 'PASS' : 'UNCHECKABLE',
142:     pass: degenerateProbeViolations.length === 0,
143:     reason: degenerateProbeViolations.length === 0
144:       ? 'All PROBED elements carry well-formed probe arrays'
145:       : `UNCHECKABLE (â‰  PASS): ${degenerateProbeViolations.length} PROBED element(s) with missing/empty/malformed probes array â€” ` +
146:         `"I probed it" with no probe data is not evidence: [${degenerateProbeViolations.join(', ')}]`,
147:   });


## Q2
Every distinct way an element can stop counting against degenerate-probe-guard: for each PROBED element, have probes as a non-empty array and every probe object truthy/non-null object. Manifest disposition is not read by this block.
QUOTE:
127:   // Degenerate-probe guard: PROBED elements must carry actual probe data
128:   const degenerateProbeViolations = [];
129:   if (Array.isArray(map.elements)) {
130:     for (const el of map.elements) {
131:       if (el.emissionStatus === 'PROBED') {
132:         if (!Array.isArray(el.probes) || el.probes.length === 0 ||
133:             el.probes.some(p => !p || typeof p !== 'object')) {
134:           degenerateProbeViolations.push(el.elementId || '(unknown)');
135:         }
136:       }
137:     }
138:   }
139:   checks.push({
140:     name: 'degenerate-probe-guard',
141:     verdict: degenerateProbeViolations.length === 0 ? 'PASS' : 'UNCHECKABLE',
142:     pass: degenerateProbeViolations.length === 0,
143:     reason: degenerateProbeViolations.length === 0
144:       ? 'All PROBED elements carry well-formed probe arrays'
145:       : `UNCHECKABLE (â‰  PASS): ${degenerateProbeViolations.length} PROBED element(s) with missing/empty/malformed probes array â€” ` +
146:         `"I probed it" with no probe data is not evidence: [${degenerateProbeViolations.join(', ')}]`,
147:   });

MANIFEST parser code that reads dispositions (separate file/helper, not the Q1 block):
69: const OBSERVATION_DISPOSITIONS = ['affordance-probed', 'read-only-verified'];
70: const ALL_DISPOSITIONS = ['covered-by-TC', 'affordance-probed', 'read-only-verified', 'out-of-scope', 'DIFFERENTIAL-DATA-REQUIRED', 'deferred-to-DEEP'];
71: 
72: export function parseCoverageSignals(text) {
73:   const t = text || '';
74:   // Tolerate optional **bold** wrappers on frontmatter keys (real artifacts use both forms â€” SA-2).
75:   const parsedSessionDate = parseMcpSessionDateField(t);
76:   const mcpDate = parsedSessionDate.status === 'parsed' ? parsedSessionDate.sessionDate : '';
77:   const walkModeM = t.match(/(?:\*\*)?Walk_Mode(?:\*\*)?\s*:\s*(quick|deep)\b/i);
78:   const walkMode = walkModeM ? walkModeM[1].toLowerCase() : 'deep';
79:   const hasManifest = /^#{2,3}\s+Coverage Manifest/im.test(t) || /(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:/i.test(t);
80: 
81:   const ratioM = t.match(/(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:\s*(\d+)\s*\/\s*(\d+)/i);
82:   let ratioComplete = false, ratio = null;
83:   if (ratioM) {
84:     const n = +ratioM[1], m = +ratioM[2];
85:     ratio = { n, m };
86:     ratioComplete = m > 0 && n === m;
87:   } else if (/(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:[^\n]*\b100\s*%/i.test(t)) {
88:     ratioComplete = true; ratio = { explicit: '100%' };
89:   }
90: 
91:   const ccM = t.match(/(?:\*\*)?CrossCheck(?:\*\*)?\s*:\s*([^\n]+)/i);
92:   const crossCheck = ccM ? ccM[1].trim().replace(/^`|`$/g, '').replace(/<[^>]*>/g, '').trim() : '';
93:   const crossCheckClean = /^clean\b/i.test(crossCheck);
94: 
95:   const partial = /(?:\*\*)?coverageScope(?:\*\*)?\s*:\s*['"`]?\s*PARTIAL/i.test(t);
96:   const undispositioned = (t.match(/_undispositioned_/g) || []).length;
97:   const manifestRows = extractManifestRows(t);
98: 
99:   const completionRef = (t.match(/(?:\*\*)?Completion_Record(?:\*\*)?\s*:\s*([^\n]+)/i) || [])[1]?.trim() || '';
100:   const hasCompletionRecord = !!completionRef;
101:   return { mcpDate, hasManifest, ratio, ratioComplete, crossCheck, crossCheckClean, partial, undispositioned, manifestRows, completionRef, hasCompletionRecord, walkMode };
102: }
103: 
104: // Split a markdown table row into cells, respecting backslash-escaped bars (\|) which are NOT
105: // cell delimiters. Strips the leading and trailing outer bars. NM-3344 severity: high â€” without
106: // this, keys containing literal bars (e.g. struct:a|Home|â€¦) are truncated at the first bar.
107: function splitTableRow(line) {
108:   const inner = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
109:   const cells = [];
110:   let current = '';
111:   let inCodeSpan = false;
112:   for (let i = 0; i < inner.length; i++) {
113:     if (inner[i] === '`') {
114:       inCodeSpan = !inCodeSpan;
115:       current += inner[i];
116:     } else if (inner[i] === '|' && !inCodeSpan) {
117:       let bsCount = 0;
118:       let j = i - 1;
119:       while (j >= 0 && inner[j] === '\\') { bsCount++; j--; }
120:       if (bsCount % 2 === 1) {
121:         current += inner[i];
122:         continue;
123:       }
124:       cells.push(current);
125:       current = '';
126:     } else {
127:       current += inner[i];
128:     }
129:   }
130:   cells.push(current);
131:   return cells;
132: }
133: 
134: // Extract the content from a cell that may be backtick-wrapped with a trailing annotation,
135: // e.g. `struct:button|Order Search|â€¦` _(Aâˆ–B â€” disabled)_ â†’ struct:button|Order Search|â€¦
136: function stripBacktickWrap(cell) {
137:   const trimmed = cell.trim();
138:   const m = trimmed.match(/^`([^`]+)`/);
139:   if (m) return m[1].trim();
140:   return trimmed.replace(/^`+|`+$/g, '').trim();
141: }
142: 
143: // Parse the Coverage Manifest table rows. Each row is a markdown table line whose cells carry a
144: // disposition token (`covered-by-TC` / `affordance-probed` / `read-only-verified` / `out-of-scope`).
145: // We capture per row: { disposition, controlRef (the id/key cell, prefix-stripped), provenance
146: // (live|oracle|''), evidence (the `evidence:` pointer, or ''), raw }. Scans only the Coverage
147: // Manifest section so unrelated tables elsewhere in the artifact are never misread.
148: export function extractManifestRows(text) {
149:   const t = text || '';
150:   const headingM = t.match(/^#{2,3}\s+Coverage Manifest[^\n]*$/im);
151:   if (!headingM) return [];
152:   const after = t.slice(headingM.index + headingM[0].length);
153:   // Section ends at the next markdown heading of any level.
154:   const nextHeading = after.match(/^#{1,6}\s/m);
155:   const section = nextHeading ? after.slice(0, nextHeading.index) : after;
156: 
157:   const rows = [];
158:   for (const line of section.split('\n')) {
159:     if (!/^\s*\|/.test(line)) continue;                 // not a table row
160:     if (/^\s*\|[-:\s|]+\|\s*$/.test(line)) continue;     // separator row
161:     // Split on unescaped bars only (a backslash before a bar means the bar is part of the key,
162:     // not a cell delimiter). After splitting, unescape \| â†’ | in each cell.
163:     const cells = splitTableRow(line).map(c => c.trim().replace(/\\\|/g, '|'));
164:     // Disposition cell = first cell whose (backtick-stripped) text starts with a known token.
165:     let disposition = '';
166:     for (const c of cells) {
167:       const bare = c.replace(/^`+|`+$/g, '').trim();
168:       const hit = ALL_DISPOSITIONS.find(d => bare.toLowerCase().startsWith(d.toLowerCase() + ':') || bare.toLowerCase() === d.toLowerCase());
169:       if (hit) { disposition = hit; break; }
170:     }
171:     if (!disposition) continue;                          // header row or non-disposition row
172:     // controlRef = the id/key cell â€” first cell that looks like `prefix:value` / `testid:â€¦` / `id:â€¦`.
173:     // A cell may be backtick-wrapped with a trailing annotation: `key` _(Aâˆ–B â€” disabled)_
174:     // so extract the backtick-delimited content when present.
175:     let controlRef = '';
176:     for (const c of cells) {
177:       const bare = stripBacktickWrap(c);
178:       if (/^(testid|id|struct|aria|role|name):/i.test(bare)) { controlRef = bare; break; }
179:     }
180:     if (!controlRef && cells.length > 1) controlRef = stripBacktickWrap(cells[1]);
181:     const provM = line.match(/provenance\s*:\s*(live|oracle)\b/i);
182:     const evM = line.match(/evidence\s*:\s*([^\s|`]+)/i);
183:     rows.push({
184:       disposition,
185:       controlRef,
186:       provenance: provM ? provM[1].toLowerCase() : '',
187:       evidence: evM ? evM[1] : '',
188:       raw: line.trim(),
189:     });
190:   }


## Q3
Legal disposition tokens accepted by manifest parser and parser row extraction regex:
69: const OBSERVATION_DISPOSITIONS = ['affordance-probed', 'read-only-verified'];
70: const ALL_DISPOSITIONS = ['covered-by-TC', 'affordance-probed', 'read-only-verified', 'out-of-scope', 'DIFFERENTIAL-DATA-REQUIRED', 'deferred-to-DEEP'];
71: 
72: export function parseCoverageSignals(text) {
73:   const t = text || '';
74:   // Tolerate optional **bold** wrappers on frontmatter keys (real artifacts use both forms â€” SA-2).
75:   const parsedSessionDate = parseMcpSessionDateField(t);
76:   const mcpDate = parsedSessionDate.status === 'parsed' ? parsedSessionDate.sessionDate : '';
77:   const walkModeM = t.match(/(?:\*\*)?Walk_Mode(?:\*\*)?\s*:\s*(quick|deep)\b/i);
78:   const walkMode = walkModeM ? walkModeM[1].toLowerCase() : 'deep';
79:   const hasManifest = /^#{2,3}\s+Coverage Manifest/im.test(t) || /(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:/i.test(t);
80: 
81:   const ratioM = t.match(/(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:\s*(\d+)\s*\/\s*(\d+)/i);
82:   let ratioComplete = false, ratio = null;
83:   if (ratioM) {
84:     const n = +ratioM[1], m = +ratioM[2];
85:     ratio = { n, m };
86:     ratioComplete = m > 0 && n === m;
87:   } else if (/(?:\*\*)?Coverage_Ratio(?:\*\*)?\s*:[^\n]*\b100\s*%/i.test(t)) {
88:     ratioComplete = true; ratio = { explicit: '100%' };
89:   }
90: 
91:   const ccM = t.match(/(?:\*\*)?CrossCheck(?:\*\*)?\s*:\s*([^\n]+)/i);
92:   const crossCheck = ccM ? ccM[1].trim().replace(/^`|`$/g, '').replace(/<[^>]*>/g, '').trim() : '';
93:   const crossCheckClean = /^clean\b/i.test(crossCheck);
94: 
95:   const partial = /(?:\*\*)?coverageScope(?:\*\*)?\s*:\s*['"`]?\s*PARTIAL/i.test(t);
96:   const undispositioned = (t.match(/_undispositioned_/g) || []).length;
97:   const manifestRows = extractManifestRows(t);
98: 
99:   const completionRef = (t.match(/(?:\*\*)?Completion_Record(?:\*\*)?\s*:\s*([^\n]+)/i) || [])[1]?.trim() || '';
100:   const hasCompletionRecord = !!completionRef;
101:   return { mcpDate, hasManifest, ratio, ratioComplete, crossCheck, crossCheckClean, partial, undispositioned, manifestRows, completionRef, hasCompletionRecord, walkMode };
102: }
103: 
104: // Split a markdown table row into cells, respecting backslash-escaped bars (\|) which are NOT
105: // cell delimiters. Strips the leading and trailing outer bars. NM-3344 severity: high â€” without
106: // this, keys containing literal bars (e.g. struct:a|Home|â€¦) are truncated at the first bar.
107: function splitTableRow(line) {
108:   const inner = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
109:   const cells = [];
110:   let current = '';
111:   let inCodeSpan = false;
112:   for (let i = 0; i < inner.length; i++) {
113:     if (inner[i] === '`') {
114:       inCodeSpan = !inCodeSpan;
115:       current += inner[i];
116:     } else if (inner[i] === '|' && !inCodeSpan) {
117:       let bsCount = 0;
118:       let j = i - 1;
119:       while (j >= 0 && inner[j] === '\\') { bsCount++; j--; }
120:       if (bsCount % 2 === 1) {
121:         current += inner[i];
122:         continue;
123:       }
124:       cells.push(current);
125:       current = '';
126:     } else {
127:       current += inner[i];
128:     }
129:   }
130:   cells.push(current);
131:   return cells;
132: }
133: 
134: // Extract the content from a cell that may be backtick-wrapped with a trailing annotation,
135: // e.g. `struct:button|Order Search|â€¦` _(Aâˆ–B â€” disabled)_ â†’ struct:button|Order Search|â€¦
136: function stripBacktickWrap(cell) {
137:   const trimmed = cell.trim();
138:   const m = trimmed.match(/^`([^`]+)`/);
139:   if (m) return m[1].trim();
140:   return trimmed.replace(/^`+|`+$/g, '').trim();
141: }
142: 
143: // Parse the Coverage Manifest table rows. Each row is a markdown table line whose cells carry a
144: // disposition token (`covered-by-TC` / `affordance-probed` / `read-only-verified` / `out-of-scope`).
145: // We capture per row: { disposition, controlRef (the id/key cell, prefix-stripped), provenance
146: // (live|oracle|''), evidence (the `evidence:` pointer, or ''), raw }. Scans only the Coverage
147: // Manifest section so unrelated tables elsewhere in the artifact are never misread.
148: export function extractManifestRows(text) {
149:   const t = text || '';
150:   const headingM = t.match(/^#{2,3}\s+Coverage Manifest[^\n]*$/im);
151:   if (!headingM) return [];
152:   const after = t.slice(headingM.index + headingM[0].length);
153:   // Section ends at the next markdown heading of any level.
154:   const nextHeading = after.match(/^#{1,6}\s/m);
155:   const section = nextHeading ? after.slice(0, nextHeading.index) : after;
156: 
157:   const rows = [];
158:   for (const line of section.split('\n')) {
159:     if (!/^\s*\|/.test(line)) continue;                 // not a table row
160:     if (/^\s*\|[-:\s|]+\|\s*$/.test(line)) continue;     // separator row
161:     // Split on unescaped bars only (a backslash before a bar means the bar is part of the key,
162:     // not a cell delimiter). After splitting, unescape \| â†’ | in each cell.
163:     const cells = splitTableRow(line).map(c => c.trim().replace(/\\\|/g, '|'));
164:     // Disposition cell = first cell whose (backtick-stripped) text starts with a known token.
165:     let disposition = '';
166:     for (const c of cells) {
167:       const bare = c.replace(/^`+|`+$/g, '').trim();
168:       const hit = ALL_DISPOSITIONS.find(d => bare.toLowerCase().startsWith(d.toLowerCase() + ':') || bare.toLowerCase() === d.toLowerCase());
169:       if (hit) { disposition = hit; break; }
170:     }
171:     if (!disposition) continue;                          // header row or non-disposition row
172:     // controlRef = the id/key cell â€” first cell that looks like `prefix:value` / `testid:â€¦` / `id:â€¦`.
173:     // A cell may be backtick-wrapped with a trailing annotation: `key` _(Aâˆ–B â€” disabled)_
174:     // so extract the backtick-delimited content when present.
175:     let controlRef = '';
176:     for (const c of cells) {
177:       const bare = stripBacktickWrap(c);
178:       if (/^(testid|id|struct|aria|role|name):/i.test(bare)) { controlRef = bare; break; }
179:     }
180:     if (!controlRef && cells.length > 1) controlRef = stripBacktickWrap(cells[1]);
181:     const provM = line.match(/provenance\s*:\s*(live|oracle)\b/i);
182:     const evM = line.match(/evidence\s*:\s*([^\s|`]+)/i);
183:     rows.push({
184:       disposition,
185:       controlRef,
186:       provenance: provM ? provM[1].toLowerCase() : '',
187:       evidence: evM ? evM[1] : '',
188:       raw: line.trim(),
189:     });
190:   }


## Q4
Exemption allowlist mechanism present for C1 overrides at .claude/closure-overrides.json; current contents:
COMMAND: Get-Content .claude\closure-overrides.json
RAW OUTPUT:
{
  "$schema": "./closure-overrides.schema.json",
  "version": 1,
  "overrides": [],
  "meta_plans": [
    "PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md"
  ]
}

Path constant and lock/read restrictions:
47: const OVERRIDES_PATH = join(REPO_ROOT, '.claude', 'closure-overrides.json');
48: const STATE_DIR = join(REPO_ROOT, '.claude', 'state');
49: const ATTEMPTS_DIR = join(STATE_DIR, 'closure-attempts');
50: const AUDITS_DIR = join(STATE_DIR, 'closure-audits');
51: const FAIL_CLOSED_DIR = STATE_DIR;
52: const FIXTURE_DIR = join(REPO_ROOT, 'scripts', 'test-fixtures', 'plan-closure');
53: // C6 rollout-state config (PLAN_DONE_MEANS_DONE Phase 2.2). NOT a per-token override â€”
54: // a rollout-mode knob for the C6 check class. Lives in closure-config.json (a SEPARATE,
55: // agent-writable file), NOT closure-overrides.json (which is a lock-path the agent cannot edit).

37: const LOCK_PATH_RX = /\.claude[\/\\]closure-overrides(?:\.schema)?\.json|\.claude[\/\\]closure-overrides-authors\.txt|\.claude[\/\\]closure-gate-landed-at\.txt|plans[\/\\]_closure_manifests[\/\\][^\s'"]+\.manifest\.json/i;
38: 
39: const PLAN_PATH_RX = /^plans[\/\\](pending|done)[\/\\][^\/\\]+\.md$/;
40: 
41: const READ_ONLY_PREFIX_RX = /^\s*(cat\s|type\s|Get-Content\s|git\s+show\s|git\s+cat-file\s|git\s+diff\s|git\s+log\s|git\s+status\b|git\s+blame\b|git\s+rev-parse\b|git\s+ls-files\b|git\s+show-ref\b|ls\s|dir\s|Test-Path\s|head\s|tail\s|wc\s|grep\s|egrep\s|fgrep\s|findstr\s|Select-String\s)/i;
42: 
43: const WRITE_OP_RX = /(>\s|>>\s|\|\s*tee\b|Tee-Object|Set-Content|Add-Content|Out-File|New-Item|Move-Item|Copy-Item|mv\s|cp\s|sed\s+.*-i\b|cat\s+>|cat\s+>>|\[(?:IO|System\.IO)\.File\]::Write|fs\.writeFile|fs\.appendFile|require\(.fs.\)\.write)/i;

211:   // B1 + V1: LOCK-PATHS CHECK FIRST (before any plan-path filter)
212:   if (LOCK_PATH_RX.test(relPath) || LOCK_PATH_RX.test(targetPath)) {
213:     fireTelemetry('check-plan-closure', 'deny', relPath);
214:     emitDeny(`[PLAN-CLOSURE LOCK] "${relPath}" is a closure-gate lock path. Only the user may edit this file directly. Agent writes are denied across both Edit/Write AND Bash matchers (R2).`);
215:     return;

371:   if (allReadOnly) {
372:     emitAllow('Lock-path read-only inspection allowed');
373:     return;
374:   }
375: 
376:   fireTelemetry('check-plan-closure', 'deny', cmd.slice(0, 80));
377:   emitDeny(`[PLAN-CLOSURE LOCK] Bash command mentions closure-gate lock path. Only read-only inspection commands (cat, type, Get-Content, git show/diff/log/status, ls, dir, Test-Path) without write/redirect operators are allowed. Agent writes to lock paths are denied (R2).`);

Override read/use code:
228: function checkC1(body, planBasename, overrides) {
229:   const findings = [];
230:   const lines = body.split('\n');
231:   let inFence = false;
232: 
233:   for (let i = 0; i < lines.length; i++) {
234:     const line = lines[i];
235:     if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
236:     if (inFence) continue;
237:     if (shouldDropLineC1(line)) continue;
238: 
239:     for (const rx of CLOSURE_FORBIDDEN_C1) {
240:       const m = line.match(rx);
241:       if (m) {
242:         const token = m[0].trim();
243:         const isOverridden = overrides.some(o =>
244:           o.plan === planBasename &&
245:           o.path_match === 'exact' &&
246:           o.tokens.includes(token) &&
247:           new Date(o.expires_at) > new Date()
248:         );

1271: function loadOverrides(mode) {
1272:   try {
1273:     let content;
1274:     if (mode === 'staged') {
1275:       content = gitExec('git show :.claude/closure-overrides.json');
1276:     } else if (mode === 'stdin' || mode === 'retro' || mode === 'enforce') {
1277:       content = gitExec('git show HEAD:.claude/closure-overrides.json');
1278:     } else {
1279:       content = readFileSync(OVERRIDES_PATH, 'utf-8');
1280:     }
1281:     const parsed = JSON.parse(content);
1282:     return parsed.overrides || [];


## Q5
claim-census sub-check in full:
718:   // Oracle 5 â€” claim-census (1117 + NM-2011)
719:   // Basis prefix is normalised to lowercase â€” CLAIM:x is treated as claim:x (no case escape).
720:   // Known prefixes: observed | claim | census. Empty content after colon â†’ UNCHECKABLE.
721:   // Census validation: content non-empty AND artifact must exist on disk.
722:   // Per-claim binding requires a schema-level link field (not present); document-level
723:   // binding is implemented: any valid census in the map corroborates claims on the same surface.
724:   {
725:     const KNOWN_PREFIXES = ['observed', 'claim', 'census'];
726:     const allElements = Array.isArray(map.elements) ? map.elements : [];
727:     const claimEls = [];
728:     const uncheckableBasisEls = [];
729:     let hasValidCensus = false;
730:     const validCensusEntries = [];
731: 
732:     for (const el of allElements) {
733:       const parsed = parseBasis(el.basis);
734:       if (!parsed) continue; // non-string basis â€” schema validation handles it
735:       const { prefix, content } = parsed;
736:       if (prefix === null || !KNOWN_PREFIXES.includes(prefix)) {
737:         if (el.basis && String(el.basis).trim()) uncheckableBasisEls.push(el);
738:         continue;
739:       }
740:       if (!content) {
741:         uncheckableBasisEls.push(el); // known prefix but nothing after colon â†’ UNCHECKABLE
742:         continue;
743:       }
744:       if (prefix === 'claim') {
745:         claimEls.push(el);
746:       } else if (prefix === 'census') {
747:         // Census must resolve, have meaningful content, and bind to claims on this surface.
748:         const absPath = existsSync(content) ? content :
749:           existsSync(resolve(ROOT, content)) ? resolve(ROOT, content) : null;
750:         if (!absPath) {
751:           uncheckableBasisEls.push(el); // census artifact missing
752:           continue;
753:         }
754:         let censusContent;
755:         try { censusContent = readFileSync(absPath, 'utf-8'); } catch {
756:           uncheckableBasisEls.push(el); continue;
757:         }
758:         if (!censusContent.trim()) { uncheckableBasisEls.push(el); continue; }
759:         // Reject known non-census formats (package manifests, configs)
760:         let isUnrelatedFormat = false;
761:         try {
762:           const j = JSON.parse(censusContent);
763:           if (j && typeof j === 'object' &&
764:               ('dependencies' in j || 'devDependencies' in j || 'scripts' in j)) {
765:             isUnrelatedFormat = true;
766:           }
767:         } catch { /* not JSON â€” fine for text census */ }
768:         if (isUnrelatedFormat) { uncheckableBasisEls.push(el); continue; }
769:         // Binding: path or content must relate to census/evidence/surface
770:         const surfaceName = (map.surface || '').toLowerCase();
771:         const cl = censusContent.toLowerCase();
772:         const pl = content.toLowerCase();
773:         const bound =
774:           pl.includes('census') || pl.includes('verify') || pl.includes('evidence') || pl.includes('walk') ||
775:           cl.includes('census') || cl.includes('verified') || cl.includes('confirmed') ||
776:           (surfaceName.length > 3 && cl.includes(surfaceName));
777:         if (bound) { validCensusEntries.push({ el, content: censusContent }); }
778:         else { uncheckableBasisEls.push(el); }
779:       }
780:       // observed: with non-empty content â†’ valid, no tracking needed
781:     }
782: 
783:     // F2 defense: census must demonstrably link to claim subjects.
784:     // An artifact that does not mention what the claim is about corroborates nothing.
785:     if (validCensusEntries.length > 0) {
786:       if (claimEls.length > 0) {
787:         const claimSubjectTokens = new Set();
788:         for (const cel of claimEls) {
789:           const p = parseBasis(cel.basis);
790:           if (p && p.content) {
791:             for (const tok of p.content.toLowerCase().split(/[-_\s.,;:\/]+/)) {
792:               if (tok.length > 2) claimSubjectTokens.add(tok);
793:             }
794:           }
795:         }
796:         for (const { el: censusEl, content: cc } of validCensusEntries) {
797:           const ccl = cc.toLowerCase();
798:           const linked = [...claimSubjectTokens].some(tok => ccl.includes(tok));
799:           if (linked) { hasValidCensus = true; }
800:           else { uncheckableBasisEls.push(censusEl); }
801:         }
802:       } else {
803:         hasValidCensus = true;
804:       }
805:     }
806: 
807:     const isFail = claimEls.length > 0 && !hasValidCensus;
808:     const isUncheckable = !isFail && uncheckableBasisEls.length > 0;
809: 
810:     if (isFail) {
811:       checks.push({
812:         name: 'claim-census',
813:         verdict: 'FAIL',
814:         pass: false,
815:         reason: `CLAIM-CENSUS VIOLATION: ${claimEls.length} element(s) carry claim-sourced dispositions with no valid census evidence â€” ` +
816:           `external claims must be verified against machine-readable data before steering a disposition: ` +
817:           `[${claimEls.map(e => e.elementId || '(unknown)').join(', ')}] See .claude/rules/guardrail-policy.md Â§LR-071 for resolution steps.`,
818:       });
819:     } else if (isUncheckable) {
820:       checks.push({
821:         name: 'claim-census',
822:         verdict: 'UNCHECKABLE',
823:         pass: false,
824:         reason: `UNCHECKABLE (â‰  PASS): ${uncheckableBasisEls.length} element(s) carry an invalid or unresolvable basis â€” ` +
825:           `expected observed:|claim:|census: with non-empty content, census artifacts must exist on disk: ` +
826:           `[${uncheckableBasisEls.map(e => e.elementId || '(unknown)').join(', ')}]`,
827:       });
828:     } else {
829:       checks.push({
830:         name: 'claim-census',
831:         verdict: 'PASS',
832:         pass: true,
833:         reason: claimEls.length === 0
834:           ? 'No claim-sourced dispositions â€” oracle 5 does not apply'
835:           : `${claimEls.length} claim(s) corroborated by verified census artifact(s)`,
836:       });
837:     }
838:   }

Condition: hasValidCensus = true only when a valid census entry exists and, if claim entries exist, census content contains at least one token parsed from claim basis content; zero claim entries emits PASS with reason No claim-sourced dispositions — oracle 5 does not apply.

## Q6
check-interaction-coverage.mjs supports --self-test; self-test path loads schema and fixture data, not --file.
20:  * CLI:
21:  *   node scripts/check-interaction-coverage.mjs --self-test           â†’ exit 0 on all pass
22:  *   node scripts/check-interaction-coverage.mjs --file <path.json>    â†’ exit 0/1
23:  *   node scripts/check-interaction-coverage.mjs --plan <planPath.md>  â†’ exit 0/1

1028: // â”€â”€ Self-test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
1029: 
1030: async function selfTest() {
1031:   const schemaResult = await loadSchema();
1032:   if (!schemaResult.ok) {
1033:     console.error(`VERDICT: FAIL â€” ${schemaResult.error}`);
1034:     process.exit(1);
1035:   }

 mode code:
908: // â”€â”€ --file mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
909: 
910: async function checkFile(filePath) {
911:   const absPath = resolve(filePath);
912: 
913:   if (!existsSync(absPath)) {
914:     return {
915:       pass: false,
916:       checks: [{
917:         name: 'artifact-exists',
918:         pass: false,
919:         reason: `Coverage artifact missing: ${filePath} â€” fail-closed (gate cannot validate what it cannot read)`,
920:       }],
921:     };
922:   }
923: 
924:   const schemaResult = await loadSchema();
925:   if (!schemaResult.ok) {
926:     return { pass: false, checks: [{ name: 'schema-load', pass: false, reason: schemaResult.error }] };
927:   }
928: 
929:   let map;
930:   try {
931:     const raw = readFileSync(absPath, 'utf-8');
932:     map = JSON.parse(raw);
933:   } catch (err) {
934:     return {
935:       pass: false,
936:       checks: [{
937:         name: 'artifact-parse',
938:         pass: false,
939:         reason: `Coverage artifact unreadable: ${err.message} â€” fail-closed`,
940:       }],
941:     };
942:   }
943: 
944:   return validateArtifact(map, schemaResult.mod, { mapDir: dirname(absPath) });
945: }

COMMAND: node scripts\check-interaction-coverage.mjs --self-test | Select-Object -Last 15
RAW OUTPUT:

=== T87: basis-artifact-provenance — observed: file exists → PASS (honest control) ===
  PASS: observed: file exists → basis-artifact-provenance PASS (honest control)
  PASS: basis-artifact-provenance verdict is PASS when cited file exists beside map

=== T88: basis-artifact-provenance — observed: file missing → FAIL ===
  PASS: observed: file missing → basis-artifact-provenance non-PASS
  PASS: basis-artifact-provenance FAIL — citation present but cited file does not exist beside map

=== T89: basis-artifact-provenance — observed: no filename → UNCHECKABLE (absent citation) ===
  PASS: observed: with no filename → basis-artifact-provenance non-PASS (absent citation is UNCHECKABLE)
  PASS: basis-artifact-provenance UNCHECKABLE — absent citation (observed: with no filename)

=== Results: 189/189 passed ===
VERDICT: PASS


## Q7
cross-check.mjs exists and supports --self-test; self-test uses synthetic fixtures, no browser/file deps per header and code.
COMMAND: Get-ChildItem -Path . -Filter cross-check.mjs -Recurse | Select-Object FullName,Length
RAW OUTPUT:

FullName                                                                                                                                                   Length
--------                                                                                                                                                   ------
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\chips\g76\rca-actlog\merge-repro\scratch2\scripts\walk-coverage\cross-check.mjs  12741
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\chips\g76\rca-actlog\scratch\scripts\walk-coverage\cross-check.mjs               12741
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\chips\naming-audit\out-pre1-gpt\origin-base\scripts\walk-coverage\cross-chec...  12741
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\chips\nm3344-close\out-P2B\r3-tmp\scripts\walk-coverage\cross-check.mjs          12456
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\closure-stdout-0813\fixture\scratch-instrument\scripts\walk-coverage\cross-c...  12456
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\closure-stdout-0813\fixture\scratch-live-fixed\scripts\walk-coverage\cross-c...  12456
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\closure-stdout-0813\fixture\scratch-live-prefix\scripts\walk-coverage\cross-...  12456
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\closure-stdout-0813\fixture\scratch-live-v3-fixed\scripts\walk-coverage\cros...  12456
C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\state\ua-worker\closure-stdout-0813\fixture\scratch-live-v3-prefix\scripts\walk-coverage\cro...  12456
C:\Users\RutvikKhorasiya\projects\encore_framework\clients\encore\reports\circularity-attack-0815\scratch-checker\scripts\walk-coverage\cross-check.mjs     12456
C:\Users\RutvikKhorasiya\projects\encore_framework\clients\encore\reports\circularity-attack-0815\scratch-field-inventory-checker\scripts\walk-coverage...  12456
C:\Users\RutvikKhorasiya\projects\encore_framework\clients\encore\reports\circularity-attack-0815\scratch-merge-malformed\scripts\walk-coverage\cross-c...  12456
C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\walk-coverage\cross-check.mjs                                                                    12456



1: #!/usr/bin/env node
2: // scripts/walk-coverage/cross-check.mjs
3: // PLAN_EXHAUSTIVE_WALK_GUARANTEE â€” Phase 3: M4 cross-check + fresh-context critic stability gate.
4: //
5: // Three modes:
6: //   --manifest <path>       Load an enumerator JSON; print union/intersection/Aâ–³B counts + review list.
7: //   --diff <jsonA> <jsonB>  Stability check: diff two enumeration JSONs by entry-key SET; report orphans.
8: //   --self-test             Synthetic fixtures (no browser, no file deps). Exit 1 on any failure.
9: //

140: // ---- mode: --self-test ---------------------------------------------------------------------
141: 
142: function runSelfTest() {
143:   let passed = 0, failed = 0;
144:   function ok(name, cond, detail = '') {
145:     if (cond) { console.log(`  [PASS] ${name}`); passed++; }
146:     else { console.log(`  [FAIL] ${name}${detail ? ' â€” ' + detail : ''}`); failed++; }
147:   }
148: 
149:   // ---- setAlgebra over synthetic union ----
150:   const entries = [
151:     { key: 'a', role: 'button', name: 'Save',       why: 'native:button',  inA: true,  inB: true  },   // intersection
152:     { key: 'b', role: 'button', name: 'SaveDis',    why: 'native:button',  inA: true,  inB: false, disabled: true  }, // A-only disabled
153:     { key: 'c', role: 'tablist', name: 'NavTabs',   why: 'focusable',      inA: false, inB: true  },   // B-only focusable tablist
154:     { key: 'd', role: 'checkbox', name: 'IsAlt',    why: 'role:checkbox',  inA: true,  inB: true  },   // intersection
155:   ];
156: 
157:   const alg = setAlgebra(entries);
158:   ok('setAlgebra union count = 4',         alg.unionCount === 4,         `got ${alg.unionCount}`);
159:   ok('setAlgebra intersection count = 2',  alg.intersectionCount === 2,  `got ${alg.intersectionCount}`);
160:   ok('setAlgebra symDiff count = 2',       alg.symDiffCount === 2,       `got ${alg.symDiffCount}`);
161:   ok('Aâ–³B direction A-only (disabled Save)',
162:     alg.symDiff.find(s => s.key === 'b')?.in === 'A-only',
163:     JSON.stringify(alg.symDiff));
164:   ok('Aâ–³B direction B-only (focusable tablist)',
165:     alg.symDiff.find(s => s.key === 'c')?.in === 'B-only',
166:     JSON.stringify(alg.symDiff));
167: 
168:   // ---- disabled-Save is in Aâ–³B review set as A-only ----
169:   const disabledSaveItem = alg.symDiff.find(s => s.key === 'b');
170:   ok('disabled-Save appears in Aâ–³B as A-only',  disabledSaveItem?.in === 'A-only', JSON.stringify(disabledSaveItem));
171:   ok('disabled-Save carries disabled=true flag', disabledSaveItem?.disabled === true, JSON.stringify(disabledSaveItem));
172: 
173:   // ---- focusable-tablist is in Aâ–³B review set as B-only ----
174:   const tblItem = alg.symDiff.find(s => s.key === 'c');
175:   ok('focusable-tablist appears in Aâ–³B as B-only', tblItem?.in === 'B-only', JSON.stringify(tblItem));
176: 
177:   // ---- keySetDiff: identical sets â†’ zero orphans ----
178:   const ea = [{ key: 'x' }, { key: 'y' }, { key: 'z' }];
179:   const eb = [{ key: 'x' }, { key: 'y' }, { key: 'z' }];
180:   const diffSame = keySetDiff(ea, eb);
181:   ok('keySetDiff identical sets â†’ aOnly=0', diffSame.aOnly.length === 0, JSON.stringify(diffSame.aOnly));
182:   ok('keySetDiff identical sets â†’ bOnly=0', diffSame.bOnly.length === 0, JSON.stringify(diffSame.bOnly));
183: 
184:   // ---- keySetDiff: one added key in A â†’ 1 aOnly ----
185:   const ec = [{ key: 'x' }, { key: 'y' }, { key: 'z' }, { key: 'w' }];
186:   const ed = [{ key: 'x' }, { key: 'y' }, { key: 'z' }];
187:   const diffAdded = keySetDiff(ec, ed);
188:   ok('keySetDiff one added key in A â†’ aOnly=1', diffAdded.aOnly.length === 1 && diffAdded.aOnly[0] === 'w',
189:     JSON.stringify(diffAdded));
190:   ok('keySetDiff one added key in A â†’ bOnly=0', diffAdded.bOnly.length === 0, JSON.stringify(diffAdded.bOnly));
191: 
192:   // ---- keySetDiff: one key only in B â†’ 1 bOnly ----
193:   const diffBOnly = keySetDiff(ed, ec);
194:   ok('keySetDiff one key only in B â†’ bOnly=1', diffBOnly.bOnly.length === 1 && diffBOnly.bOnly[0] === 'w',
195:     JSON.stringify(diffBOnly));
196:   ok('keySetDiff one key only in B â†’ aOnly=0', diffBOnly.aOnly.length === 0, JSON.stringify(diffBOnly.aOnly));
197: 
198:   // ---- crossCheckVerdict: all-dispositioned â†’ 'clean' ----
199:   const fullyDispositioned = [
200:     { key: 'a', inA: true,  inB: true,  disposition: 'covered-by-TC: LOC-001' },
201:     { key: 'b', inA: true,  inB: false, disposition: 'affordance-probed: AP-042' },
202:     { key: 'c', inA: false, inB: true,  disposition: 'read-only-verified' },
203:   ];
204:   ok('crossCheckVerdict all-dispositioned â†’ clean', crossCheckVerdict(fullyDispositioned) === 'clean',
205:     crossCheckVerdict(fullyDispositioned));
206: 
207:   // ---- crossCheckVerdict: one undispositioned â†’ not clean ----
208:   const partiallyDispositioned = [
209:     { key: 'a', inA: true,  inB: true,  disposition: 'covered-by-TC: LOC-001' },
210:     { key: 'b', inA: true,  inB: false, disposition: '' },   // empty = undispositioned
211:     { key: 'c', inA: false, inB: true,  disposition: 'read-only-verified' },
212:   ];
213:   const verdictPartial = crossCheckVerdict(partiallyDispositioned);
214:   ok('crossCheckVerdict one undispositioned â†’ not clean', verdictPartial !== 'clean', verdictPartial);
215:   ok('crossCheckVerdict mentions undispositioned count',  verdictPartial.includes('undispositioned'), verdictPartial);
216: 
217:   // ---- crossCheckVerdict: no disposition field at all â†’ not clean ----
218:   const noneDispositioned = [
219:     { key: 'a', inA: true,  inB: true  },
220:     { key: 'b', inA: true,  inB: false },
221:   ];
222:   const verdictNone = crossCheckVerdict(noneDispositioned);
223:   ok('crossCheckVerdict no disposition field â†’ not clean', verdictNone !== 'clean', verdictNone);
224: 
225:   // ---- summary ----
226:   console.log(`\nwalk-coverage cross-check fixtures: ${passed} passed, ${failed} failed, ${passed + failed} total`);
227:   process.exit(failed > 0 ? 1 : 0);

250: const args = parseArgs(process.argv);
251: 
252: if (args['self-test']) {
253:   runSelfTest();
254: } else if (args['manifest']) {
255:   runManifest(args['manifest']);
256: } else if (args['diff']) {
257:   // --diff <jsonA> <jsonB> â€” the two paths follow --diff sequentially
258:   // parse them from argv directly (they come after --diff)
259:   const diffIdx = process.argv.indexOf('--diff');
260:   const pathA = process.argv[diffIdx + 1];
261:   const pathB = process.argv[diffIdx + 2];
262:   if (!pathA || !pathB) {
263:     console.error('[cross-check] ERROR: --diff requires two JSON paths: --diff <jsonA> <jsonB>');
264:     process.exit(1);
265:   }
266:   runDiff(pathA, pathB);
267: } else {
268:   console.log(`
269: cross-check.mjs â€” M4 cross-check + fresh-context critic stability gate.
270: 
271: Usage:
272:   node scripts/walk-coverage/cross-check.mjs --manifest <path-to-enumerator-json>
273:       Load an enumerator JSON, print union/intersection/Aâ–³B counts + review list.
274: 
275:   node scripts/walk-coverage/cross-check.mjs --diff <jsonA> <jsonB>
276:       Stability check: diff two enumeration JSONs by entry-key set; report orphans.
277:       Zero orphans â‡’ deterministic. Non-zero â‡’ flag for manual inspection.
278: 
279:   node scripts/walk-coverage/cross-check.mjs --self-test
280:       Synthetic fixtures (no browser, no file deps). Exit 1 on any failure.

COMMAND: node scripts\walk-coverage\cross-check.mjs --self-test | Select-Object -Last 15
RAW OUTPUT:
  [PASS] disabled-Save appears in A△B as A-only
  [PASS] disabled-Save carries disabled=true flag
  [PASS] focusable-tablist appears in A△B as B-only
  [PASS] keySetDiff identical sets → aOnly=0
  [PASS] keySetDiff identical sets → bOnly=0
  [PASS] keySetDiff one added key in A → aOnly=1
  [PASS] keySetDiff one added key in A → bOnly=0
  [PASS] keySetDiff one key only in B → bOnly=1
  [PASS] keySetDiff one key only in B → aOnly=0
  [PASS] crossCheckVerdict all-dispositioned → clean
  [PASS] crossCheckVerdict one undispositioned → not clean
  [PASS] crossCheckVerdict mentions undispositioned count
  [PASS] crossCheckVerdict no disposition field → not clean

walk-coverage cross-check fixtures: 18 passed, 0 failed, 18 total


## Q8
Scoped hook delegates C1/C2/C3 to scripts/validate-plan-closure.mjs; hook failure rendering:
243:   // Pipe projected body to validator
244:   if (!existsSync(VALIDATOR_PATH)) {
245:     failClosed('validate-plan-closure.mjs not found', planBasename);
246:     return;
247:   }
248: 
249:   try {
250:     const result = execSync(
251:       `node "${VALIDATOR_PATH}" --plan "${targetPath}" --content-from-stdin --json`,
252:       { cwd: REPO_ROOT, encoding: 'utf-8', input: projectedBody, timeout: 30000 },
253:     );
254: 
255:     let parsed;
256:     try {
257:       parsed = JSON.parse(result);
258:     } catch {
259:       failClosed(`Validator output not JSON: ${result.slice(0, 200)}`, planBasename);
260:       return;
261:     }
262: 
263:     if (parsed.status === 'PASS' || parsed.status === 'EXEMPT' || parsed.status === 'SKIP') {
264:       recordAttempt(planBasename, parsed.status);
265:       // C6 announce-mode (Phase 2.2b): non-blocking stderr warning if C6 / parent-cascade
266:       // would fail under deny. Validator already kept them out of the verdict (status PASS).
267:       if ((parsed.c6_mode || 'off') === 'announce') {
268:         const announceMsg = buildC6AnnounceWarning(parsed, planBasename);
269:         if (announceMsg) { fireTelemetry('check-plan-closure', 'announce', planBasename); process.stderr.write(announceMsg); }
270:       }
271:       if ((parsed.coverage_mode || 'off') === 'announce') {
272:         const covMsg = buildCoverageAnnounceWarning(parsed, planBasename);
273:         if (covMsg) { fireTelemetry('check-plan-closure', 'announce', planBasename); process.stderr.write(covMsg); }
274:       }
275:       emitAllow(`Plan closure validation: ${parsed.status}`);
276:       return;
277:     }
278: 
279:     recordAttempt(planBasename, 'FAIL');
280: 
281:     const checks = parsed.checks || [];
282:     const failedChecks = checks.filter(c => c.status === 'FAIL');
283:     // Validator emits per-check `items` (not `findings`); render reason/token/path/target so
284:     // the deny message carries actionable detail (fixes a pre-existing empty-detail bug).
285:     const details = failedChecks.map(c =>
286:       `${c.check}: ${(c.items || []).map(f =>
287:         f.reason || f.token || f.path || f.target || (typeof f === 'string' ? f : JSON.stringify(f))
288:       ).join('; ')}`
289:     ).join('\n');
290: 
291:     fireTelemetry('check-plan-closure', 'deny', planBasename);
292:     emitDeny(`[PLAN-CLOSURE FAIL] Status: DONE blocked by closure validation.\n\n${details}\n\nC1 is overridable via .claude/closure-overrides.json (user-only). C2/C3/C4/C5/C6 are NOT overridable â€” remediate the plan body.`);

Nearest labelled C1/C2/C3 implementation:
209: // === C1: Forbidden incompleteness tokens ===
210: const CLOSURE_FORBIDDEN_C1 = [
211:   /(?<![A-Za-z])NOT-WALKED(?![A-Za-z])/,
212:   /(?<![A-Za-z])NOT WALKED(?![A-Za-z])/i,
213:   /(?<![A-Za-z])PROBABLE-(?:FAIL|PASS|SKIP)-(?:APP|FRAMEWORK|TEST)(?![A-Za-z])/,
214:   /(?<![A-Za-z])BLOCKED-BY-FIXME-DESIGN(?![A-Za-z])/,
215:   /\bsurface-exists\s*:\s*divergent\b/i,
216:   /^\s*(?:dom-snippet|dom-screenshot-path|observed-live|network-capture-row|repro-steps|why-gap|proposed-TC-title|proposed-TC-assertion|evidence|verbatim)\s*:\s*"?\(?(?:not captured|n\/a|N\/A|NOT[\s-]?WALKED|not exercised|not walked|partial|deferred|TBD|TODO|placeholder)\)?"?\s*$/im,
217:   /(?:^|\n)\s*[-*|]\s.{0,120}\bnot captured\b(?![A-Za-z-])/i,
218:   /(?:^|\n)\s*[-*|]\s.{0,120}\bnot exercised\b(?![A-Za-z-])/i,
219: ];
220: 
221: function shouldDropLineC1(line) {
222:   if (/^#{1,6}\s/.test(line)) return true;
223:   if (/^>\s/.test(line)) return true;
224:   if (/\be\.g\.\b|\bexample\b|\bfor example\b/i.test(line)) return true;
225:   return false;
226: }
227: 
228: function checkC1(body, planBasename, overrides) {
229:   const findings = [];
230:   const lines = body.split('\n');
231:   let inFence = false;
232: 
233:   for (let i = 0; i < lines.length; i++) {
234:     const line = lines[i];
235:     if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
236:     if (inFence) continue;
237:     if (shouldDropLineC1(line)) continue;
238: 
239:     for (const rx of CLOSURE_FORBIDDEN_C1) {
240:       const m = line.match(rx);
241:       if (m) {
242:         const token = m[0].trim();
243:         const isOverridden = overrides.some(o =>
244:           o.plan === planBasename &&
245:           o.path_match === 'exact' &&
246:           o.tokens.includes(token) &&
247:           new Date(o.expires_at) > new Date()
248:         );
249:         findings.push({
250:           check: 'C1',
251:           line: i + 1,
252:           token,
253:           overridden: isOverridden,
254:           overridable: true,
255:           text: line.trim().slice(0, 120),
256:         });
257:       }
258:     }
259:   }
260: 
261:   const unoverridden = findings.filter(f => !f.overridden);
262:   return {
263:     check: 'C1',
264:     status: unoverridden.length > 0 ? 'FAIL' : 'PASS',
265:     overridable: true,
266:     items: findings,
267:   };
268: }

270: // === C2: LR-027 execution summary skeleton ===
271: function checkC2(body) {
272:   const executedRx = /(?:^|\n)\s*(?:\*\*)?Executed(?:\*\*)?\s*:\s*([^\n]+)/i;
273:   const hasExecuted = executedRx.test(body);
274: 
275:   const summaryRx = /^(#{2,4})\s+Execution Summary\s*$/im;
276:   const summaryMatch = body.match(summaryRx);
277: 
278:   if (!summaryMatch) {
279:     return { check: 'C2', status: 'FAIL', overridable: false, items: [
280:       { reason: 'Missing Execution Summary heading (## through ####)' },
281:     ] };
282:   }
283: 
284:   const headingLevel = summaryMatch[1].length;
285:   const startIdx = summaryMatch.index + summaryMatch[0].length;
286:   const restBody = body.slice(startIdx);
287:   const nextHeadingRx = new RegExp(`^#{1,${headingLevel}}\\s`, 'm');
288:   const nextMatch = restBody.match(nextHeadingRx);
289:   const sectionBody = nextMatch ? restBody.slice(0, nextMatch.index) : restBody;
290: 
291:   const contentLines = sectionBody.split('\n').filter(l => l.trim().length > 0);
292: 
293:   const C2_PATH_RX = /(?:\.[a-zA-Z]|[a-zA-Z0-9_-])(?:[a-zA-Z0-9_.-]|[\/\\])+\.(?:ts|tsx|js|mjs|cjs|sh|bash|md|json|yml|yaml|html|css|go|rs|py|png|jpg|jpeg|mp4|webm|zip|trace|svg|gif|pdf|log|txt|har|xml|csv|diff|patch)/;
294:   const hasCitedPath = C2_PATH_RX.test(sectionBody);
295: 
296:   const items = [];
297:   if (!hasExecuted) items.push({ reason: 'Missing Executed: date field' });
298:   if (contentLines.length < 10) items.push({ reason: `Execution Summary has ${contentLines.length} content lines (need >= 10)` });
299:   if (!hasCitedPath) items.push({ reason: 'No cited file path in Execution Summary' });
300: 
301:   return {
302:     check: 'C2',
303:     status: items.length > 0 ? 'FAIL' : 'PASS',
304:     overridable: false,
305:     items,
306:   };
307: }

309: // === C3: Cited artifact paths exist ===
310: const CITED_PATH_RX_PLAIN = /(?<![A-Za-z0-9_])((?:\.[a-zA-Z]|[a-zA-Z0-9_-])(?:[a-zA-Z0-9_.-]|[\/\\])+\.(?:png|jpg|jpeg|mp4|webm|zip|json|trace|yml|yaml|html|svg|gif|pdf|log|txt|har|xml|md|csv|diff|patch))(?![A-Za-z0-9_])/g;
311: const CITED_PATH_RX_MD = /\[[^\]]*\]\(([^)]+\.(?:png|jpg|jpeg|mp4|webm|zip|json|trace|yml|yaml|html|svg|gif|pdf|log|txt|har|xml|md|csv|diff|patch))\)/g;
312: 
313: /**
314:  * Check whether a repo-relative path is covered by a PORTABLE .gitignore rule.
315:  * Uses `git check-ignore -v` (no shell) to get the source file of the match,
316:  * then accepts only matches from tracked .gitignore files â€” rules in
317:  * .git/info/exclude or a user's global excludes file are local-only and would
318:  * not apply in a colleague's clone, so those paths fall back to strict (FAIL).
319:  *
320:  * Defect 1 fix (g78-V17): execFileSync with argv array â€” no shell, so
321:  * backticks, $(), quotes, semicolons in path names are never interpreted.
322:  * Defect 2 fix (g78-V17): only portable .gitignore sources accepted.
323:  *
324:  * Exit codes: 0 = ignored, 1 = not ignored, 128+ = error.
325:  * On error, returns false (fail-closed: treat as not ignored â†’ FAIL verdict preserved).
326:  */
327: function isPathGitignored(repoRelativePath) {
328:   try {
329:     const out = execFileSync('git', ['check-ignore', '-v', '--', repoRelativePath], {
330:       cwd: REPO_ROOT,
331:       stdio: ['pipe', 'pipe', 'pipe'],
332:       encoding: 'utf-8',
333:     });
334:     // Exit 0 â†’ path is ignored by some rule. Parse the source file.
335:     // Format: <source>:<linenum>:<pattern>\t<pathname>
336:     // Accept only if source is a tracked .gitignore (not .git/info/exclude,
337:     // not a global excludes file, not an empty/unrecognizable source).
338:     const sourceFile = parseCheckIgnoreSource(out);
339:     if (!sourceFile) {
340:       process.stderr.write(
341:         `[C3] WARNING: git check-ignore -v output not parseable for "${repoRelativePath}", treating as not ignored (fail-closed)\n`
342:       );
343:       return false;
344:     }
345:     if (!isPortableIgnoreSource(sourceFile)) {
346:       process.stderr.write(
347:         `[C3] INFO: "${repoRelativePath}" ignored by local-only rule in ${sourceFile}, treating as not ignored (not portable)\n`
348:       );
349:       return false;
350:     }
351:     return true;
352:   } catch (err) {
353:     if (err.status === 1) {
354:       // Exit 1 â†’ path is NOT ignored
355:       return false;
356:     }
357:     // Any other exit code (128, etc.) is an unexpected error.
358:     // Fail-closed: treat as not ignored so C3 still catches it.
359:     process.stderr.write(
360:       `[C3] WARNING: git check-ignore returned unexpected exit code ${err.status} for "${repoRelativePath}"\n`
361:     );
362:     return false;
363:   }
364: }
365: 
366: /**
367:  * Parse the source file from `git check-ignore -v` output.
368:  * Format: <source>:<linenum>:<pattern>\t<pathname>
369:  * Returns the source file path, or null if unparseable.
370:  */
371: function parseCheckIgnoreSource(output) {
372:   if (!output || typeof output !== 'string') return null;
373:   const line = output.split('\n')[0];
374:   if (!line) return null;
375:   // The format uses tab to separate the rule part from the pathname.
376:   // The rule part is <source>:<linenum>:<pattern>.
377:   // Source itself may contain colons (e.g., C:\...) on Windows â€” split from
378:   // the right: find the tab first, then parse the left side.
379:   const tabIdx = line.indexOf('\t');
380:   const rulePart = tabIdx >= 0 ? line.slice(0, tabIdx) : line;
381:   // Split rulePart as <source>:<linenum>:<pattern>.
382:   // linenum is always numeric. Find the LAST two colons where the middle
383:   // segment is numeric to handle Windows drive-letter paths (C:\foo).
384:   const colonPositions = [];
385:   for (let i = 0; i < rulePart.length; i++) {
386:     if (rulePart[i] === ':') colonPositions.push(i);
387:   }
388:   // Need at least two colons: source:linenum:pattern
389:   if (colonPositions.length < 2) return null;
390:   // Try pairs of colons from the end to handle colons in the source path
391:   for (let j = colonPositions.length - 1; j >= 1; j--) {
392:     const patternStart = colonPositions[j] + 1;
393:     const lineNumStart = colonPositions[j - 1] + 1;
394:     const lineNumStr = rulePart.slice(lineNumStart, colonPositions[j]);
395:     if (/^\d+$/.test(lineNumStr)) {
396:       return rulePart.slice(0, colonPositions[j - 1]);
397:     }
398:   }
399:   return null;
400: }
401: 
402: /**
403:  * Check whether a check-ignore source file is portable (exists in every clone).
404:  * Tracked .gitignore files are portable. .git/info/exclude and global excludes are not.
405:  */
406: function isPortableIgnoreSource(sourceFile) {
407:   if (!sourceFile) return false;
408:   // .git/info/exclude is never cloned
409:   const normalized = sourceFile.replace(/\\/g, '/');
410:   if (normalized.includes('.git/info/exclude')) return false;
411:   // Global excludes file â€” typically outside the repo (home dir). If the source
412:   // is not under REPO_ROOT, it cannot be a tracked file.
413:   const repoRootNorm = REPO_ROOT.replace(/\\/g, '/');
414:   if (!normalized.startsWith(repoRootNorm + '/') && !normalized.startsWith('./') && !isRelativeToRepo(normalized)) {
415:     return false;
416:   }
417:   // Must be a .gitignore file (at any depth) that git tracks.
418:   // Resolve to repo-relative and check with git ls-files.
419:   const absSource = resolve(REPO_ROOT, sourceFile);
420:   const relSource = relative(REPO_ROOT, absSource).replace(/\\/g, '/');
421:   try {
422:     const tracked = execFileSync('git', ['ls-files', '--', relSource], {
423:       cwd: REPO_ROOT,
424:       stdio: ['pipe', 'pipe', 'pipe'],
425:       encoding: 'utf-8',
426:     });
427:     return tracked.trim().length > 0;
428:   } catch {
429:     return false;
430:   }
431: }
432: 
433: /** Helper: check if a path is relative (no drive letter, no leading /) */
434: function isRelativeToRepo(p) {
435:   return !(/^[A-Za-z]:/.test(p) || p.startsWith('/'));
436: }
437: 
438: function extractCitedPaths(body) {
439:   const paths = new Set();
440:   const lines = body.split('\n');
441:   let inFence = false;
442:   let ancestorHeading = '';
443: 
444:   for (const line of lines) {
445:     if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
446:     if (inFence) continue;
447:     if (/^#{1,6}\s/.test(line)) {
448:       ancestorHeading = line;
449:       continue;
450:     }
451:     if (/^>\s/.test(line)) continue;
452:     if (/\be\.g\.\b|\bhypothetical\b|\bwould be\b|<placeholder>|<TBD>/i.test(line)) continue;
453:     if (/## Example|## Templates|## Hypothetical/i.test(ancestorHeading)) continue;
454: 
455:     let m;
456:     const plainRx = new RegExp(CITED_PATH_RX_PLAIN.source, 'g');
457:     while ((m = plainRx.exec(line)) !== null) {
458:       paths.add(m[1]);
459:     }
460:     const mdRx = new RegExp(CITED_PATH_RX_MD.source, 'g');
461:     while ((m = mdRx.exec(line)) !== null) {
462:       paths.add(m[1]);
463:     }
464:   }
465: 
466:   return [...paths];
467: }
468: 
469: function normalizePath(p) {
470:   return p.replace(/\\/g, '/');
471: }
472: 
473: function resolveRepoPathFromCitation(rawP) {
474:   const norm = normalizePath(rawP);
475:   let resolved = norm;
476:   if (/^[A-Z]:[\/]/.test(rawP) || rawP.startsWith('/')) {
477:     const rel = relative(REPO_ROOT, rawP.replace(/\\/g, sep));
478:     if (rel.startsWith('..')) return null;
479:     resolved = normalizePath(rel);
480:   }
481:   return resolved;
482: }
483: 
484: function collectVouchableIgnoredArtifacts(body, planPath) {
485:   const artifacts = [];
486:   const seen = new Set();
487:   const planBasename = basename(planPath);
488:   for (const rawP of extractCitedPaths(body)) {
489:     const norm = normalizePath(rawP);
490:     if (/^https?:\/\//.test(norm)) continue;
491:     if (!norm.includes('/')) continue;
492:     if (/^node_modules\/|^dist\/|^build\/|^coverage\//.test(norm)) continue;
493:     if (/<|>|\{|\}/.test(norm)) continue;
494:     if (/^[A-Z][A-Z0-9_]*_(?:DIR|PATH|ROOT)\//.test(norm)) continue;
495:     if (/(?:^|\/)(?:foo|bar|baz|qux|example|placeholder|sample)\.[a-z]+$/i.test(norm)) continue;
496:     if (/^(?:Users|home)\/[^/]+\/\.claude\//i.test(norm)) continue;
497:     if (/^~\//.test(rawP) || /^~\//.test(norm)) continue;
498:     if (/^\.claude\/plans\//.test(norm)) continue;
499:     if (norm === `plans/done/${planBasename}`) continue;
500:     if (norm === `plans/pending/${planBasename}`) continue;
501:     if (norm === `plans/_closure_manifests/${planBasename}.manifest.json`) continue;
502:     const resolved = resolveRepoPathFromCitation(rawP);
503:     if (!resolved || seen.has(resolved)) continue;
504:     const absPath = join(REPO_ROOT, resolved);
505:     if (!existsSync(absPath)) continue;
506:     if (!isPathGitignored(resolved)) continue;
507:     const fileStat = statSync(absPath);
508:     if (!fileStat.isFile()) continue;
509:     artifacts.push({ path: resolved, sha256: sha256(readFileSync(absPath)) });
510:     seen.add(resolved);
511:   }
512:   return artifacts;
513: }
514: 
515: function checkC3(body, planPath) {
516:   const rawPaths = extractCitedPaths(body);
517:   const planBasename = basename(planPath);
518:   const manifestPath = join(MANIFEST_DIR, `${planBasename}.manifest.json`);
519:   let manifest = null;
520:   if (existsSync(manifestPath)) {
521:     try { manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')); } catch {}
522:   }
523: 
524:   const items = [];
525:   for (const rawP of rawPaths) {
526:     const norm = normalizePath(rawP);
527:     if (/^https?:\/\//.test(norm)) continue;
528:     if (!norm.includes('/')) continue;
529:     if (/^node_modules\/|^dist\/|^build\/|^coverage\//.test(norm)) continue;
530:     if (/<|>|\{|\}/.test(norm)) continue;
531:     // Template-variable directory prefixes â€” e.g. `REPORTS_DIR/foo.json`, `BUNDLE_DIR/x.csv`.
532:     // First segment is ALL_CAPS_WITH_UNDERSCORES and ends in `_DIR` / `_PATH` / `_ROOT`.
533:     if (/^[A-Z][A-Z0-9_]*_(?:DIR|PATH|ROOT)\//.test(norm)) continue;
534:     // Placeholder filenames â€” `foo.csv`, `bar.md`, `baz.json`, `example.yml`, `placeholder.txt`.
535:     // Final segment is exactly one of these stub names. Treated as documentation, not a concrete claim.
536:     if (/(?:^|\/)(?:foo|bar|baz|qux|example|placeholder|sample)\.[a-z]+$/i.test(norm)) continue;
537:     // External user/scratch paths â€” `Users/<name>/.claude/...`, `~/.claude/...`, `home/<name>/.claude/...`.
538:     // These reference machine-local artifacts that legitimately don't live in the repo.
539:     if (/^(?:Users|home)\/[^/]+\/\.claude\//i.test(norm)) continue;
540:     if (/^~\//.test(rawP) || /^~\//.test(norm)) continue;
541:     // `.claude/plans/...` is a user-home subdir (Claude scratch plans). The repo's `.claude/`
542:     // has skills/agents/hooks/rules/context/settings/state but never `plans/`.
543:     // Path-regex strips the `~/` prefix, so we catch the bare `.claude/plans/` form here.
544:     if (/^\.claude\/plans\//.test(norm)) continue;
545:     // ALL-087: closure-time self-reference. A plan being validated may cite its OWN eventual
546:     // `done/` location and its OWN manifest path (both don't exist yet during pre-flip validation).
547:     // Skip these â€” they're forward-references that resolve at commit time.
548:     if (norm === `plans/done/${planBasename}`) continue;
549:     if (norm === `plans/pending/${planBasename}`) continue;
550:     if (norm === `plans/_closure_manifests/${planBasename}.manifest.json`) continue;
551: 
552:     const resolvedPath = resolveRepoPathFromCitation(rawP);
553:     if (!resolvedPath) {
554:       items.push({ path: rawP, status: 'external-path', severity: 'WARN' });
555:       continue;
556:     }
557:     const resolved = resolvedPath;
558: 
559:     const absPath = join(REPO_ROOT, resolved);
560:     if (existsSync(absPath)) continue;
561: 
562:     // C3 gitignore-aware: a missing path that is gitignored cannot exist on any clone.
563:     // A tracked closure manifest is therefore required to carry the author's vouch
564:     // that the file existed where the plan was closed.
565:     if (isPathGitignored(resolved)) {
566:       const vouched = manifest && manifest.artifacts && manifest.artifacts.find(a => normalizePath(a.path) === resolved);
567:       if (vouched) {
568:         items.push({ path: resolved, status: 'gitignored-vouched', severity: 'INFO' });
569:         continue;
570:       }
571:       items.push({
572:         path: resolved,
573:         status: 'gitignored-unvouched',
574:         severity: 'FAIL',
575:         message: `Cited path "${resolved}" is absent and gitignored. The path must be listed in ${basename(manifestPath)} artifacts. Run --write-manifest where the file exists, or remove the citation.`,
576:       });
577:       continue;
578:     }
579: 
580:     items.push({ path: resolved, status: 'missing', severity: 'FAIL' });
581:   }
582: 
583:   const fails = items.filter(i => i.severity === 'FAIL');
584:   return {
585:     check: 'C3',
586:     status: fails.length > 0 ? 'FAIL' : 'PASS',
587:     overridable: false,
588:     items,
589:   };
590: }


## Q9
No integrity-strike literal in scoped hook:
COMMAND: Select-String -Path .claude\hooks\lib\check-plan-closure.mjs -Pattern 'integrity strike|integrity-strikes|recordIntegrity|strike' -Context 0,0
RAW OUTPUT:

Nearest code in validator records kind walk-provenance-fabrication:
1478: // === Integrity strike (SUBPLAN_CGS_B task 5 â€” whole-walk rejection + collective penalty) ===
1479: // A single fabrication (oracle / missing-provenance / missing-or-stale evidence on an
1480: // observation-claiming walk row, detected by Cx with fabrication:true) already FAILS the entire
1481: // plan closure (Cx folds into the verdict under coverage_mode=deny). On top of that we write an
1482: // APPEND-ONLY integrity strike to .claude/state/integrity-strikes.jsonl â€” a durable, collective
1483: // record that a fabricated walk was submitted for closure. Append-only JSONL: never rewritten,
1484: // only grown, so the strike history cannot be quietly laundered.
1485: function recordIntegrityStrike(planPath, fabricationItems) {
1486:   try {
1487:     if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
1488:     const strikeFile = join(STATE_DIR, 'integrity-strikes.jsonl');
1489:     const entry = {
1490:       timestamp: new Date().toISOString(),
1491:       plan: basename(planPath),
1492:       kind: 'walk-provenance-fabrication',
1493:       artifacts: fabricationItems.map(i => ({ artifact: i.artifact, reasons: i.reasons })),
1494:     };
1495:     appendFileSync(strikeFile, JSON.stringify(entry) + '\n', 'utf-8');
1496:     return strikeFile;
1497:   } catch {
1498:     return null;   // never wedge closure on a strike-log write failure
1499:   }

1564:   // Integrity strike: a fabricated walk submitted for closure under an ENFORCING coverage gate.
1565:   // Gated to genuine closure attempts â€” never on the hook's projected-state pass (--content-from-stdin)
1566:   // and never in measurement mode (--dry-run) â€” so a single keystroke-edit can't spam the strike log.
1567:   if (!opts.contentFromStdin && !opts.dryRun && result.coverage_mode === 'deny') {
1568:     const cx = (result.checks || []).find(c => c.check === 'Cx');
1569:     const fabrication = cx ? (cx.items || []).filter(i => i.fabrication) : [];
1570:     if (fabrication.length > 0) {
1571:       const sf = recordIntegrityStrike(absPath, fabrication);
1572:       if (sf) console.log(`[INTEGRITY-STRIKE] walk fabrication recorded â†’ ${relative(REPO_ROOT, sf)}`);
1573:     }

Strike reason strings are the Cx abrication item reasons passed through rtifacts: fabricationItems.map(i => ({ artifact: i.artifact, reasons: i.reasons })).

## Q10
LEARNED_RULES.md LR-072 entry:
274: ## LR-072: CoverageMode contract â€” coverage-bearing subplans declare `quick | deep`; deferral token `deferred-to-DEEP` accepted only under `quick`; absent field = `deep` default. Full body: `.claude/rules/inventory.md`.

Full body in .claude/rules/inventory.md:
166: ## LR-072: CoverageMode contract â€” plan-level declared tier governs walk/verify/closure cost
167: 
168: **Paths**: `.claude/rules/inventory.md` (governing LR-062 disposition vocabulary, LR-064 TDW walk execution, LR-065 surface-axis floor, LR-013/SP-AAE-05 staleness, Cx closure gate).
169: 
170: Every **coverage-bearing subplan** (one whose phases author TCs, run walks, or cite walk artifacts) MUST declare `**CoverageMode**: quick | deep` in frontmatter alongside `Model` / `Thinking` / `PermissionMode` (LR-041 pattern). `/coverage` stamps `quick`; `/ultracoverage` stamps `deep`. Hand-authored plans declare explicitly.
171: 
172: **Absent field = `deep` semantics** (conservative default â€” legacy plans and forgetful authors get today's full rigor; the contract can only ever be *invoked*, never *fallen into*).
173: 
174: **Token grammar**: `deferred-to-DEEP: <element/launcher id> (<reason â‰¥20 chars>)`
175: - Legal **only** on plans whose `CoverageMode` is `quick`.
176: - Counts as **dispositioned** for LR-062 `Coverage_Ratio` (ratio stays 100% â€” nothing silently skipped).
177: - **G1 â€” no classification claim**: a deferral row carries NO other disposition token alongside it. Any `deferred-to-DEEP` row co-appearing with `covered-by-TC` / `affordance-probed` / `read-only-verified` = validator FAIL (the Pay-To-Address miss recreated otherwise).
178: - **G2 â€” claimed rows keep FULL rigor**: any row the quick run DOES claim (`covered-by-TC` / `read-only-verified` / `affordance-probed`) keeps unchanged LR-062 condition-5 provenance + LR-057 probe requirements. Quick narrows the claimed set; it never cheapens a claim.
179: - **G3 â€” vocabulary containment**: the token lives only in internal walk artifacts (gitignored `specs_planning/`) and plan bodies. It is in the `scripts/xlsx-lint-rules.mjs` deny-list so it can never leak into a client deliverable.
180: - **G4 â€” per-launcher granularity**: a deferral names the specific launcher/element, never a shared dialog (LR-057 dedup clause). This is a doctrine-layer discipline (walk-time judgment, reviewer-checked); the machine layer enforces the token FORMAT â€” non-empty element/launcher id and reason â‰¥20 chars (validated by coverage-manifest.mjs at Cx time).
181: 
182: **Walk_Mode dual-home**: the walk manifest gains a `Walk_Mode: quick | deep` frontmatter field stamped at walk time (absent = deep). The Cx closure path reads BOTH the plan's `**CoverageMode**:` AND the artifact's `Walk_Mode:` and **FAILS on mismatch** â€” a deep plan citing a quick-walked artifact must not close green off deferral rows.
183: 

Code enforcing quick/deep mismatch and deferral grammar:
1028: function checkCx(body, planPath, landingDate, cliCoverageTierMode) {
1029:   const items = [];
1030:   // Parse the plan's declared CoverageMode (absent = 'deep' by contract â€” conservative default).
1031:   const planCoverageModeRaw = parseField(body, 'CoverageMode').toLowerCase();
1032:   const planCoverageMode = (planCoverageModeRaw === 'quick') ? 'quick' : 'deep';
1033:   const tierMode = resolveCoverageTierMode(cliCoverageTierMode);
1034:   // Fixture-path scoping: walk artifacts under scripts/test-fixtures/ are deliberately-shaped
1035:   // samples (incl. intentionally-fabricated ones) for the gate's own self-tests. A REAL plan that
1036:   // merely references a fixture path in prose (e.g. this gate's own subplan documenting its
1037:   // negative-test) must NOT be Cx-failed by reading that fixture as a production walk artifact â€”
1038:   // but a FIXTURE PLAN (itself under test-fixtures/) MUST still process them, or the cx-provenance
1039:   // negative tests would no-op. So: exclude fixture citations unless the plan itself is a fixture.
1040:   const planIsFixture = normalizePath(planPath).includes('test-fixtures/');
1041:   const cited = extractCitedPaths(body).map(normalizePath)
1042:     .filter(p => WALK_ARTIFACT_RX.test(p) && (planIsFixture || !p.includes('test-fixtures/')))
1043:     .filter(p => isArtifactOwner(body, p));
1044:   const seen = new Set();
1045:   for (const rel of cited) {
1046:     if (seen.has(rel)) continue;
1047:     seen.add(rel);
1048:     const abs = join(REPO_ROOT, rel);
1049:     if (!existsSync(abs)) continue;   // missing cited path â†’ C3's job, not Cx's
1050:     let text = '';
1051:     try { text = readFileSync(abs, 'utf-8'); } catch { continue; }
1052:     // artifactPath enables the provenance sub-gate's on-disk evidence verification
1053:     // (exists / fresh / names-control). provenanceFail marks a FABRICATION-class incompleteness
1054:     // (oracle / missing-provenance / missing-or-stale evidence on an observation-claiming row),
1055:     // distinct from a mundane ratio/crosscheck gap â€” runSingle turns it into an integrity strike.
1056:     const v = coverageVerdict(text, landingDate, { artifactPath: abs });
1057:     if (!v.applicable) continue;      // grandfathered or no coverage manifest present
1058:     if (!v.complete) items.push({ artifact: rel, reasons: v.reasons, severity: 'FAIL', fabrication: !!v.provenanceFail });
1059:     // Tier-mode cross-check: deep plan citing a quick-mode artifact = mismatch FAIL.
1060:     if (tierMode !== 'off') {
1061:       const artifactWalkMode = (v.walkMode || 'deep').toLowerCase();
1062:       if (planCoverageMode === 'deep' && artifactWalkMode === 'quick') {
1063:         const msg = `tier-mismatch: plan declares deep coverage but cites a quick-mode artifact (${rel})`;
1064:         items.push({ artifact: rel, reasons: [msg], severity: tierMode === 'deny' ? 'FAIL' : 'WARN', fabrication: false });
1065:       }

77:   const walkModeM = t.match(/(?:\*\*)?Walk_Mode(?:\*\*)?\s*:\s*(quick|deep)\b/i);
78:   const walkMode = walkModeM ? walkModeM[1].toLowerCase() : 'deep';

534:   // Tier-aware deferral check (PLAN_COVERAGE_TIER_CONTRACT Phase 3.1):
535:   // deferred-to-DEEP is a valid disposition ONLY when Walk_Mode: quick.
536:   // In deep or absent mode, deferral rows are not accepted â€” they are not a valid terminal disposition.
537:   const deferredRows = (s.manifestRows || []).filter(r => r.disposition === 'deferred-to-DEEP');
538:   if (deferredRows.length > 0 && s.walkMode !== 'quick') {
539:     for (const row of deferredRows) {
540:       reasons.push(`row "${row.controlRef || '(unlabeled)'}": deferred-to-DEEP is only valid when Walk_Mode: quick (artifact Walk_Mode: ${s.walkMode})`);
541:     }
542:   }
543:   // G4 format check: deferred-to-DEEP token must carry non-empty launcher/element id AND reason â‰¥20 chars.
544:   // Grammar: deferred-to-DEEP: <id> (<reason â‰¥20 chars>)
545:   for (const row of deferredRows) {
546:     const m = row.raw.match(/deferred-to-DEEP\s*:\s*(\S+)\s+\(([^)]*)\)/i);
547:     if (!m || !m[1] || m[1].trim().length === 0) {
548:       reasons.push(`row "${row.controlRef || '(unlabeled)'}": deferred-to-DEEP missing launcher/element id (grammar: deferred-to-DEEP: <id> (<reason â‰¥20 chars>))`);
549:     } else if (!m[2] || m[2].trim().length < 20) {
550:       reasons.push(`row "${row.controlRef || '(unlabeled)'}": deferred-to-DEEP reason <20 chars (grammar: deferred-to-DEEP: <id> (<reason â‰¥20 chars>))`);


## Q11
COMMAND: git --no-pager log --oneline -5 -- scripts\check-interaction-coverage.mjs .claude\hooks\lib\check-plan-closure.mjs
RAW OUTPUT:
e5d53e620 checkpoint(q123): wave 7 — the read-only gate stops blocking real work, and two ids collide
0f8aa6c55 checkpoint(q123): wave 6 — the bounce closed three bypasses and revealed what it cost
841a09a3b checkpoint(q123): wave 5 — a gate got a real floor, and a worker broke another one
64d86b08c feat(walk-coverage): surface the human-catch route where the checker actually fires
445b590ed fix(walk-coverage): a filter probe cannot opt out of the count oracles by omitting a field


## CLAIMS-UNDER-TEST
CU-1: MATCHES-THIS-REPO. Evidence: scripts/check-interaction-coverage.mjs:722-723 says document-level binding is implemented, and scripts/check-interaction-coverage.mjs:773-799 sets hasValidCensus by valid census entries plus claim-subject token link.
CU-2: DIFFERS-FROM-THIS-REPO (+ actual value: zero claims gives green-by-absence). Evidence: scripts/check-interaction-coverage.mjs:807-835; with zero claim entries reason is No claim-sourced dispositions — oracle 5 does not apply.
CU-3: DIFFERS-FROM-THIS-REPO (+ actual value: .claude/closure-overrides.json overrides array is empty; coverage manifest dispositions include parser tokens but this does not prove an already-shipped module's pass path here). Evidence: Q4 current contents and coverage-manifest.mjs:69-70.
CU-4: DIFFERS-FROM-THIS-REPO (+ actual value: cross-check.mjs --self-test is synthetic fixtures/no file deps). Evidence: scripts/walk-coverage/cross-check.mjs:5-9, 140-227, tail output in Q7.
CU-5: DIFFERS-FROM-THIS-REPO (+ actual value: self-test tail reports 189 passed, 0 failed). Evidence: Q6 raw tail.

## ASSUMPTIONS-MADE
none

## ASK
none

## END-OF-REPORT 15 sections
