<!-- Trimmed per mega.md Phase 1C. Correct templates only. -->
# Code Commenting Standards

**Philosophy**: 1 concise comment per logical block. WHY/WHERE > WHAT. No obvious comments.

---

## Quick Reference

| Location | Template | Example |
|----------|----------|---------|
| Module header | `@agent-doc` block with PURPOSE, OWNER, IMPACT, DEPENDS-ON, USED-BY, RULES | See `src/common/base-page.ts` |
| File header | `/** Purpose in 1-2 sentences */` | `/** Home POM - handles home/dashboard page interactions */` |
| Import | `// What it provides - file path` | `// Import logger (writes to logs/app.log) - src/utils/logger.ts` |
| Interface | JSDoc: description + `@example` | `/** Login credentials - required/optional fields for auth */` |
| Class | JSDoc: description + `@extends` + `@see` | `/** Auth API Client. @extends {BaseApiClient} @see base-api.ts */` |
| Method | JSDoc: 1-line + `@param` + `@returns` | `/** Login via API. @param {LoginRequest} creds @returns {Promise<LoginResponse>} */` |
| Constructor | JSDoc: 1-line + `@param` | `/** Constructor - initializes HTTP client via parent class */` |
| Inline | `// WHY/WHERE comment` + code | `// Wait for SPA routing to settle after login` |

---

## Module Header Template (`@agent-doc`)

```typescript
/**
 * @agent-doc
 * PURPOSE: What the file does (1 sentence)
 * OWNER: Which page object / module owns this
 * IMPACT: What breaks if this file is wrong
 * DEPENDS-ON: Files this imports from
 * USED-BY: Files that import this
 * RULES: Framework rules that apply
 */
```

---

## Method JSDoc Template

```typescript
/**
 * Method description (1 sentence)
 *
 * @param {Type} paramName - Description
 * @returns {Type} Description
 * @throws {Error} Conditions
 *
 * @example
 * const result = await instance.method(param);
 *
 * @see {@link RelatedClass} - file path
 */
```

---

## Inline Comment Template

```typescript
// WHY comment - explain non-obvious behavior or connection
await page.waitForURL(/\/home/);

// Multi-line for complex logic:
// POST to /api/auth/login - uses inherited this.post() from BaseApiClient (base-api.ts:78)
const response = await this.post<LoginResponse>('/api/auth/login', credentials);
```

---

## When to Comment

| Always | If helpful | Never |
|--------|-----------|-------|
| File headers | Private methods (if complex) | Obvious code (`i++`) |
| Public classes/interfaces (JSDoc) | Constants (if purpose unclear) | Self-explaining names |
| Public methods (JSDoc + examples) | Type assertions (why needed) | Standard patterns (after first explanation) |
| Complex logic, regex, workarounds | | |
| Integration points + imports | | |

---

## Encoding & Character Policy

- **No emoji in executable code**: Never use emoji or multi-byte Unicode symbols in `console.log`, `Log.*`, string literals, or return values that reach stdout
- **ASCII icon map**: `[OK]`, `[ERR]`, `[WARN]`, `[STOP]`, `[ok]`, `[~]`, `[#]`, `[?]`, `[time]`, `[skip]`, `[info]`, `->`
- **Comments are exempt**: Unicode arrows (`→`) and emoji in `//` and `/* */` comments never reach stdout — OK to use
- **Root cause**: Windows CMD Code Page 437 corrupts UTF-8 emoji bytes when console output is piped via `>` to log files
- **Rule**: ALL-022 in `specs_planning/_internal/agent-mistakes.md`

---

## Density Rules

- **JSDoc**: 5-15 lines max per method
- **Inline**: 1 line per logical block (2-4 code lines)
- **Imports**: 1 line each
- Use `{@link ClassName}` for IDE navigation, `@see` for related files

---

## Selector Annotations

Every selector key in `src/selectors/**/*.ts` MUST have a single-line JSDoc annotation with 4 required tags:

```typescript
/** @where {Page > Section > Subsection} @el {type} @text "{visible text}" @keys {space-separated keywords} */
btnSaveLegal: 'tabpanel:has(...) button:has-text("Save")',
```

| Tag | Purpose | Example |
|-----|---------|---------|
| `@where` | Hierarchical UI location | `Setup > Location > Legal tab` |
| `@el` | Element type: `button`, `input`, `checkbox`, `dropdown`, `link`, `dialog`, `table`, `tab`, `label`, `cell`, `row`, `panel`, `radio`, `spinbutton`, `datepicker` | `button` |
| `@text` | Exact visible text (quoted). `{param}` for dynamic | `"Save"` |
| `@keys` | Freeform searchable keywords: synonyms, visual cues, functional descriptions | `save legal submit service-charge` |

**Dynamic selectors** add `@param`:
```typescript
/** @where Currency tab grid @el checkbox @text "{currency}" @keys select toggle @param currency — currency code */
chkCurrencySelected: (currency: string) => `...`,
```

**Rules**:
- Every new selector MUST have full annotation — no exceptions
- When editing selectors: preserve annotations, update if element changes
- Keywords: include synonyms (`submit` for save), functional cues (`discard changes`), visual cues (`bottom of grid`)
- Regenerate catalog after changes: `npm run selectors:catalog`
- Catalog output: `src/selectors/SELECTOR_CATALOG.md`

---

## Sync Marker Convention

Use HTML comment markers to delimit content that is auto-synced from a canonical source. This prevents duplication drift.

**Format**: `<!-- SYNC:{SECTION_ID}:{START|END} -->`

```markdown
<!-- SYNC:PIPELINE:START -->
(auto-synced content here — do not edit manually)
<!-- SYNC:PIPELINE:END -->
```

| Marker | Canonical Source | Synced To |
|--------|----------------|-----------|
| `SYNC:PIPELINE` | `.github/copilot-instructions.md` | (inline) |
| `SYNC:COMMANDS` | `.github/copilot-instructions.md` | (inline) |
| `SYNC:NEVER_DO` | `specs_planning/_internal/agent-mistakes.md` | `.github/copilot-instructions.md`, agent files |
| `SYNC:MCP_CRITICAL` | `docs/read_only_docs/MCP_BROWSER_GUIDE.md` | `.github/copilot-instructions.md` |

**Rules**:
- Always pair START/END markers — validator (`npm run validate:sync`) checks for both
- Content between markers is owned by the canonical source — edit there, not in targets
- Adding a new synced section: add marker pair in both source and target, update `SYNC_MARKER_SOURCES` in `scripts/validate-agent-sync.ts`

---

## References

- **Best Example**: `api-testing/api-helpers/auth-api.ts`
- **Architecture**: `docs/read_only_docs/ARCHITECTURE.md`

**Version**: 1.2 | **Updated**: 2026-02-24
