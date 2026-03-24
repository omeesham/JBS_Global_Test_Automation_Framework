/**
 * @agent-doc
 * PURPOSE: DOM diffing for feature change detection -- captures and compares DOM state.
 * OWNER: human-only
 * IMPACT: medium - Used by agents to detect feature changes via DOM comparison.
 * DEPENDS-ON: none (pure utility)
 * USED-BY: src/utils/bug-hunt-classifier.ts, Healer agent, Audit agent
 */

// ── Types ──

export interface DomElement {
  tag: string;
  testId: string | null;
  text: string;
  attributes: Record<string, string>;
  children: DomElement[];
}

export interface DomSnapshot {
  url: string;
  timestamp: string;
  elements: DomElement[];
  testIdMap: Record<string, DomElement>;
}

export interface DomDiff {
  type: 'added' | 'removed' | 'modified';
  testId: string | null;
  path: string;
  before?: Partial<DomElement>;
  after?: Partial<DomElement>;
  description: string;
}

export interface DomChangeClassification {
  selectorChanges: DomDiff[];
  contentChanges: DomDiff[];
  layoutChanges: DomDiff[];
  totalChanges: number;
  affectedTestIds: string[];
  /** Placeholder -- populated by caller with affected file paths. */
  affectedFiles: string[];
}

// ── DOM capture script (runs inside page.evaluate) ──

/**
 * Serialization script intended for use with `page.evaluate()`.
 * Returns a flat-friendly recursive structure of the DOM.
 *
 * Usage:
 *   const raw = await page.evaluate(DOM_SERIALIZE_SCRIPT);
 *   const snapshot = captureDomSnapshot(url, raw);
 */
export const DOM_SERIALIZE_SCRIPT = `
(() => {
  function serialize(el) {
    const attrs = {};
    for (const a of el.attributes || []) attrs[a.name] = a.value;
    const children = [];
    for (const c of el.children) children.push(serialize(c));
    return {
      tag: el.tagName.toLowerCase(),
      testId: el.getAttribute('data-testid') || null,
      text: el.textContent?.trim().substring(0, 200) || '',
      attributes: attrs,
      children,
    };
  }
  return serialize(document.body);
})()
`;

// ── Functions ──

/**
 * Build a DomSnapshot from serialized DOM data (output of DOM_SERIALIZE_SCRIPT).
 * Accepts the root serialized element (or array of elements) and the page URL.
 */
export function captureDomSnapshot(url: string, serializedDom: DomElement | DomElement[]): DomSnapshot {
  const elements = Array.isArray(serializedDom) ? serializedDom : [serializedDom];
  const testIdMap: Record<string, DomElement> = {};

  function indexTestIds(el: DomElement): void {
    if (el.testId) {
      testIdMap[el.testId] = el;
    }
    for (const child of el.children ?? []) {
      indexTestIds(child);
    }
  }

  for (const el of elements) {
    indexTestIds(el);
  }

  return {
    url,
    timestamp: new Date().toISOString(),
    elements,
    testIdMap,
  };
}

/**
 * Compare two DOM snapshots and return an array of differences.
 * Focuses on testid-bearing elements (most important for test change detection)
 * and visible text changes.
 */
export function diffDomSnapshots(before: DomSnapshot, after: DomSnapshot): DomDiff[] {
  const diffs: DomDiff[] = [];

  const beforeIds = new Set(Object.keys(before.testIdMap));
  const afterIds = new Set(Object.keys(after.testIdMap));

  // Removed testids
  for (const id of beforeIds) {
    if (!afterIds.has(id)) {
      const el = before.testIdMap[id]!;
      diffs.push({
        type: 'removed',
        testId: id,
        path: `[data-testid="${id}"]`,
        before: { tag: el.tag, text: el.text, attributes: el.attributes },
        description: `Element with testid "${id}" (${el.tag}) was removed`,
      });
    }
  }

  // Added testids
  for (const id of afterIds) {
    if (!beforeIds.has(id)) {
      const el = after.testIdMap[id]!;
      diffs.push({
        type: 'added',
        testId: id,
        path: `[data-testid="${id}"]`,
        after: { tag: el.tag, text: el.text, attributes: el.attributes },
        description: `Element with testid "${id}" (${el.tag}) was added`,
      });
    }
  }

  // Modified testids (present in both)
  for (const id of beforeIds) {
    if (!afterIds.has(id)) continue;
    const bEl = before.testIdMap[id]!;
    const aEl = after.testIdMap[id]!;
    const changes: string[] = [];

    if (bEl.tag !== aEl.tag) {
      changes.push(`tag changed from "${bEl.tag}" to "${aEl.tag}"`);
    }
    if (bEl.text !== aEl.text) {
      changes.push(`text changed`);
    }
    // Check key attributes (class, role, type, href, value)
    const keyAttrs = ['class', 'role', 'type', 'href', 'value', 'aria-label'];
    for (const attr of keyAttrs) {
      const bVal = bEl.attributes[attr];
      const aVal = aEl.attributes[attr];
      if (bVal !== aVal) {
        changes.push(`attribute "${attr}" changed from "${bVal ?? '(none)'}" to "${aVal ?? '(none)'}"`);
      }
    }

    if (changes.length > 0) {
      diffs.push({
        type: 'modified',
        testId: id,
        path: `[data-testid="${id}"]`,
        before: { tag: bEl.tag, text: bEl.text, attributes: bEl.attributes },
        after: { tag: aEl.tag, text: aEl.text, attributes: aEl.attributes },
        description: `Element "${id}": ${changes.join('; ')}`,
      });
    }
  }

  // Also diff non-testid elements at top level for structural changes
  if (before.elements.length !== after.elements.length) {
    diffs.push({
      type: 'modified',
      testId: null,
      path: 'body',
      description: `Top-level element count changed from ${before.elements.length} to ${after.elements.length}`,
    });
  }

  return diffs;
}

/**
 * Classify an array of DomDiffs into categories: selector changes, content changes, layout changes.
 * Returns a DomChangeClassification that feeds into changeSize determination.
 */
export function classifyDomChanges(diffs: DomDiff[]): DomChangeClassification {
  const selectorChanges: DomDiff[] = [];
  const contentChanges: DomDiff[] = [];
  const layoutChanges: DomDiff[] = [];
  const affectedTestIds = new Set<string>();

  for (const diff of diffs) {
    if (diff.testId) {
      affectedTestIds.add(diff.testId);
    }

    // Selector changes: testid added/removed, or tag changed on testid element
    if (diff.testId && (diff.type === 'added' || diff.type === 'removed')) {
      selectorChanges.push(diff);
      continue;
    }

    // Layout changes: tag change, structural count change, class/role changes
    if (
      diff.testId === null ||
      diff.description.includes('tag changed') ||
      diff.description.includes('attribute "class"') ||
      diff.description.includes('attribute "role"')
    ) {
      layoutChanges.push(diff);
      continue;
    }

    // Everything else is a content change (text, value, href, aria-label)
    contentChanges.push(diff);
  }

  return {
    selectorChanges,
    contentChanges,
    layoutChanges,
    totalChanges: diffs.length,
    affectedTestIds: [...affectedTestIds],
    affectedFiles: [], // populated by caller
  };
}
