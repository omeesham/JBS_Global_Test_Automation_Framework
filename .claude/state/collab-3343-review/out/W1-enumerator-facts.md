# W1 — Enumerator Type-Resolution: FACTS ONLY

## POSITIVE CONTROL

Command: `Select-String -Path "scripts/walk-coverage/enumerate-page.mjs" -Pattern "TYPE_SIGNAL_RULES" -SimpleMatch`
Output (2 hits):
```
enumerate-page.mjs:556:const TYPE_SIGNAL_RULES = [
enumerate-page.mjs:582:  for (const rule of TYPE_SIGNAL_RULES) {
```
Control passes — search tools are not blind on this repo.

## Q1

N = **13** entries in `TYPE_SIGNAL_RULES`. Source: `scripts/walk-coverage/enumerate-page.mjs:556-572`.

Verbatim:
```
R1:  match: o => o.role === 'spinbutton'                                    pattern: /numeric|spinbutton/i
R2:  match: o => o.role === 'checkbox'                                      pattern: /checkbox/i
R3:  match: o => o.role === 'switch'                                        pattern: /checkbox|switch|toggle/i
R4:  match: o => o.role === 'combobox'                                      pattern: /dropdown|combobox/i
R5:  match: o => o.role === 'listbox'                                       pattern: /dropdown|combobox|listbox/i
R6:  match: o => o.tag === 'INPUT' && o.type === 'number'                   pattern: /numeric|spinbutton/i
R7:  match: o => o.tag === 'INPUT' && o.type === '' && o.inputmode === 'decimal'  pattern: /numeric|spinbutton/i
R8:  match: o => o.tag === 'INPUT' && o.type === 'checkbox'                 pattern: /checkbox/i
R9:  match: o => o.tag === 'INPUT' && o.type === 'password'                 pattern: /password/i
R10: match: o => o.tag === 'INPUT' && (o.type === 'date' || o.type === 'datetime-local')  pattern: /date/i
R11: match: o => o.tag === 'INPUT' && o.type === 'file'                     pattern: /file/i
R12: match: o => o.tag === 'SELECT'                                         pattern: /dropdown|combobox/i
R13: match: o => o.tag === 'TEXTAREA'                                       pattern: /plain.text/i
```

## Q2

Count = **13** legal field-type names. Source: `clients/encore/specs_planning/_internal/field-case-generation.md:57-69` (§2 table rows).

```
1.  Plain text
2.  Numeric / spinbutton
3.  Password
4.  Checkbox (native + Radix)
5.  Dropdown / combobox (Radix)
6.  Cascading dropdown
7.  Multi-row FormArray (e.g. Notes)
8.  Date / offset
9.  File upload
10. Rich text / WYSIWYG
11. Lookup launcher (read-only display + search dialog)
12. Click-to-edit grid cell
13. Drag-and-drop source row
```

## Q3

Method: Node.js script testing each rule's regex pattern against all 13 taxonomy names. Executed inline via `node -`.

Raw output:
```
R1:  role=spinbutton         | count=1 | ["Numeric / spinbutton"]
R2:  role=checkbox           | count=1 | ["Checkbox (native + Radix)"]
R3:  role=switch             | count=1 | ["Checkbox (native + Radix)"]
R4:  role=combobox           | count=2 | ["Dropdown / combobox (Radix)","Cascading dropdown"]
R5:  role=listbox            | count=2 | ["Dropdown / combobox (Radix)","Cascading dropdown"]
R6:  INPUT type=number       | count=1 | ["Numeric / spinbutton"]
R7:  INPUT inputmode=decimal | count=1 | ["Numeric / spinbutton"]
R8:  INPUT type=checkbox     | count=1 | ["Checkbox (native + Radix)"]
R9:  INPUT type=password     | count=1 | ["Password"]
R10: INPUT type=date         | count=1 | ["Date / offset"]
R11: INPUT type=file         | count=1 | ["File upload"]
R12: SELECT                  | count=2 | ["Dropdown / combobox (Radix)","Cascading dropdown"]
R13: TEXTAREA                | count=1 | ["Plain text"]
```

Summary: **3 rules** match 2 types (R4, R5, R12). The remaining 10 rules each match exactly 1 type.

## Q4

`deriveFieldType` quoted in full. Source: `scripts/walk-coverage/enumerate-page.mjs:574-591`.

```javascript
export function deriveFieldType(observation, legalTypes) {
  const normalized = {
    tag: (observation.tag || '').toUpperCase(),
    type: (observation.type || '').toLowerCase(),
    role: (observation.role || '').toLowerCase(),
    inputmode: (observation.inputmode || '').toLowerCase(),
  };
  const matchedTypes = new Set();
  for (const rule of TYPE_SIGNAL_RULES) {
    if (rule.match(normalized)) {
      const matches = legalTypes.filter(t => rule.pattern.test(t));
      for (const m of matches) matchedTypes.add(m);
    }
  }
  if (matchedTypes.size === 1) return [...matchedTypes][0];
  // Zero matches or ambiguous (2+) — return null; caller handles disambiguation
  return matchedTypes.size >= 2 ? { ambiguous: [...matchedTypes] } : null;
}
```

**Condition for resolved type**: `matchedTypes.size === 1` — returns the single matched type name.
**Otherwise**: size ≥ 2 → returns `{ ambiguous: [...matchedTypes] }`; size 0 → returns `null`.

## Q5

`isRestingConclusive` quoted in full. Source: `scripts/walk-coverage/enumerate-page.mjs:503-509`.

```javascript
function isRestingConclusive(obs) {
  const tag = (obs.tag || '').toUpperCase();
  const role = (obs.role || '').toLowerCase();
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
  if (['checkbox', 'switch', 'spinbutton', 'combobox', 'listbox'].includes(role)) return true;
  return false;
}
```

**When tag is `BUTTON`**: tag does not match `'INPUT'`, `'SELECT'`, or `'TEXTAREA'` (line 506). Role would need to be one of `['checkbox', 'switch', 'spinbutton', 'combobox', 'listbox']` (line 507) — if role is none of those, **returns `false`** (line 508).

## Q6

Command: `Select-String -Path "clients/encore/specs_planning/_internal/field-case-generation.md" -Pattern "(?i)\bbutton\b|\btab\b|\btablist\b"` — returned hits only in prose/description columns (e.g. "spinbutton" inside type names, "Tab" in behavioral descriptions). No §2 field-type name row whose **Field type** column is "button", "tab", or "tablist".

Answer: **NONE** — no taxonomy type name corresponds to a plain button, a tab, or a tablist.

## Q7

Source: `plans/pending/PLAN_70_ENUMERATOR_TYPE_RESOLUTION_AND_NM3344_RECORD.md`.

Numbered conclusions/causes verbatim (§3 table, lines 73-78):

> | 1 | **Tab-cycle ordering.** The opener loop (`enumerate-page.mjs:641-660`) navigates to the History tab and leaves the page there; Phase 2.2 type derivation runs afterwards at `:874+`, so the `page.$eval` read at `:901` fails and the catch at `:904/:908` records `probe='unresolved'`. Note the code stores **selectors, not element handles** — the earlier "detached handle" wording was withdrawn. | repo | 23–24 controls per run |

> | 2 | **Readiness wait returns a stale count instead of failing.** `waitReady` (`:184`) uses `timeout: 20000` and, on timeout, **returns `last` rather than throwing** (`:182-204`). It governs both initial load and opener clicks (`:551`, `:651`). Repo walk notes record 38s and 90s readiness for this page. | repo | compounds 1 and 3, silently |

> | 3 | **Controls expose no native type, and the classifier has no rule for them.** Live: the 79 Basic Information percentage inputs return `type=null, inputmode=decimal`. A **positive control proves the probe works** — the same read resolves `type=text` on Location inputs elsewhere in the app. A no-tab-cycle control read and a long-readiness re-run both returned 79/79 present, 79/79 `type=null`, `changedCount=0`. | live | all 79 |

> | 4 | **The denominator counts global app-shell chrome as page controls.** The 6 controls recorded as `unresolved:edit-mode-click` are **not form fields at all** — they are the global sidebar navigation anchors (Home, Inbox, Job Search, Asset Search, Customer Search, Item Search), `tagName=A` with `href` present. | live | 6 on **every** page |

Lines 43-44 (Finding 1):
> **Finding 1 — enumerator type resolution: REAL, and worse than recorded.** It is not one defect with the stated cause; it is **three distinct causes**, and the cause named in the closed plan is not the one hurting this page.

Lines 49-50 (Finding 2):
> **Finding 2 — second rejection behaviour: NOT REAL. Refuted.** Non-numeric and numeric-out-of-range inputs behave **identically** on this page, verified live on the same day, on the same fields, in the same session

Line 87:
> **Cause 1 alone is not sufficient** — this is the load-bearing finding.

Lines 106-121 (Cause 5):
> **CAUSE 5 — THE ACTUAL KILLER, found 2026-08-16 after three failed fixes. Four corrupted bytes.** Two regexes that strip an archetype suffix — `enumerate-page.mjs` ~`:371` and ~`:533` — are written with **mojibake**: `Ã—` where the character must be `×` (U+00D7).

## Q8

Command: `Select-String -Path "scripts/walk-coverage/enumerate-page.mjs" -Pattern "dropdown" -CaseSensitive`

Output:
```
560: { match: o => o.role === 'combobox',    pattern: /dropdown|combobox/i },
561: { match: o => o.role === 'listbox',     pattern: /dropdown|combobox|listbox/i },
570: { match: o => o.tag === 'SELECT',       pattern: /dropdown|combobox/i },
1084: // Portals are only present when their trigger (select, dropdown, menu) is open.
```

Yes, three TYPE_SIGNAL_RULES patterns contain the literal text `dropdown`: R4 (line 560), R5 (line 561), R12 (line 570). All three also contain `combobox`. **No pattern matches `dropdown` but not `combobox`** — all three contain both alternatives.

## Q9

Source: `scripts/walk-coverage/tests/enumerate-page-fixes.test.mjs:19-22`.

```javascript
const LEGAL_TYPES = [
  'Numeric/spinbutton', 'Plain text', 'Checkbox', 'Dropdown/combobox',
  'Date', 'Password', 'File upload',
];
```

Test fixture count: **7**. Taxonomy count (Q2): **13**.

Difference — 6 names present in taxonomy but absent from test fixture:
1. `Cascading dropdown`
2. `Multi-row FormArray (e.g. Notes)`
3. `Date / offset` (taxonomy) vs `Date` (test) — names differ
4. `Rich text / WYSIWYG`
5. `Lookup launcher (read-only display + search dialog)`
6. `Click-to-edit grid cell`
7. `Drag-and-drop source row`

Additionally, the test uses shortened names (e.g. `Numeric/spinbutton` vs taxonomy `Numeric / spinbutton`; `Checkbox` vs `Checkbox (native + Radix)`; `Dropdown/combobox` vs `Dropdown / combobox (Radix)`). The test's 7 names are **not string-identical** to the taxonomy's names — they omit parenthetical qualifiers and spaces around `/`.

## Q10

```
ee370ddcd fix(walk-coverage): let a surface be named when the URL cannot tell them apart
f9f577131 fix(walk-coverage): stop the element counter giving up while the page loads
1bbcd592c fix(gates,deps): unblock both collaborators — pin Playwright, stop two Cx false positives
afe8d1103 fix(gates): readiness by stability, not testid count; mtime convicts only local edits (PLAN_76)
fb58ffed6 chore(sync): land the rest of the working tree for colleagues
---
ee370ddcd3ec4a5392abba8a4402541c79b2d680
Tue Aug 18 18:05:19 2026 +0530
```

## CLAIMS-UNDER-TEST

**CU-1**: "three TYPE_SIGNAL_RULES patterns each matched two legal taxonomy names".
→ **MATCHES-THIS-REPO**. R4, R5, R12 each match 2 taxonomy names (Q3 output).

**CU-2**: "narrowing the pattern to `/combobox/i` is sufficient because resolution requires a unique match".
→ **NOT-DETERMINABLE-HERE**. Whether `/combobox/i` would produce a unique match depends on the taxonomy names passed at runtime. Against the Q2 taxonomy: `/combobox/i` matches `Dropdown / combobox (Radix)` (1 hit) — unique. But this is a counterfactual about a code change not present in this repo; the current code uses `/dropdown|combobox/i`.

**CU-3**: "isRestingConclusive returns false for tag=BUTTON".
→ **MATCHES-THIS-REPO** (conditionally). Returns `false` when role is not in `['checkbox', 'switch', 'spinbutton', 'combobox', 'listbox']`. A BUTTON with no ARIA role or a non-listed role → `false`. A BUTTON with `role=checkbox` → `true`. (See Q5.)

**CU-4**: "the taxonomy has 13 field types and no button/tab type".
→ **MATCHES-THIS-REPO**. 13 types (Q2). No button/tab/tablist type name (Q6).

**CU-5**: "the test's LEGAL_TYPES fixture is a hand-written 7-entry list".
→ **MATCHES-THIS-REPO**. 7 entries at `enumerate-page-fixes.test.mjs:19-22` (Q9).

## ASSUMPTIONS-MADE

- Taxonomy type names are taken from the §2 table's "Field type" column only (lines 57-69), not from §3 or §5.
- CU-2 evaluated against the §2 taxonomy names; runtime `legalTypes` may differ if `loadFieldCaseTaxonomy()` produces different strings.

## ASK

none

## END-OF-REPORT 14 sections
