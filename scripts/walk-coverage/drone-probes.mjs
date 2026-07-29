#!/usr/bin/env node
// scripts/walk-coverage/drone-probes.mjs
// PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION Phase 1 — Drone probe definitions per element class.
//
// Each definition is a deterministic playwright-cli sequence template.
// Tier-0 drones (cheapest models, ≤15 locators/batch) execute these verbatim
// and emit strict JSON facts — no prose, no conclusions.
//
// Effect observables are class-specific (plan lines 56-59).
// R4: every probe MUST emit a record — silence is structurally forbidden.
// R3: context-selector probes MUST name a second independent source.
//
// ESM, Node >=18. Matches repo script style.

/**
 * @typedef {object} ProbeDefinition
 * @property {string} class - Element class name
 * @property {string[]} requiredActions - Deterministic actions to execute
 * @property {string} effectObservable - What effectObserved measures
 * @property {string} zeroEffectProtocol - What to do on zero-delta
 * @property {string} emissionContract - R4 emission requirement
 * @property {string} [secondSourceContract] - R3 requirement (context-selector only)
 */

/** @type {Record<string, ProbeDefinition>} */
export const PROBE_DEFINITIONS = {
  'filter': {
    class: 'filter',
    requiredActions: [
      'record-baseline: count rows visible (API/footer, not DOM)',
      'toggle-filter-on: activate the filter (check checkbox / select option)',
      'record-after-on: count rows visible',
      'toggle-filter-off: deactivate the filter (uncheck / reset)',
      'record-after-off: count rows visible',
      'assert: before == after-off (reversibility)',
    ],
    effectObservable: 'row-count delta between filter states',
    zeroEffectProtocol: 'Zero-delta auto-files as structured suspicion; disposition becomes DIFFERENTIAL-DATA-REQUIRED; fires data-doctrine ladder (self-produce other-side state → self-serve hunt → escalate)',
    emissionContract: 'PROBED with effectObserved:boolean and probes[] containing before/after row counts. Zero-delta is never terminal.',
  },

  'sort': {
    class: 'sort',
    requiredActions: [
      'record-baseline: read first visible cell content in the sort column',
      'click-sort-asc: activate ascending sort on the column',
      'record-after-asc: read first visible cell content',
      'click-sort-desc: activate descending sort',
      'record-after-desc: read first visible cell content',
      'assert: at least one of asc/desc differs from baseline (order changed)',
    ],
    effectObservable: 'first-cell content delta between sort directions',
    zeroEffectProtocol: 'If all identical — data may be single-row or all-same-value. File suspicion if row count > 1.',
    emissionContract: 'PROBED with effectObserved:boolean per column.',
  },

  'pagination': {
    class: 'pagination',
    requiredActions: [
      'record-baseline: read page indicator (e.g. "Page 1 of 5") + first row content',
      'click-next: go to next page',
      'record-after-next: read page indicator + first row content',
      'assert: page indicator changed AND first row differs',
      'if-rows-per-page-control: change rows-per-page value and verify row count updates',
    ],
    effectObservable: 'page-indicator delta + first-row content delta',
    zeroEffectProtocol: 'If page does not change, office may lack sufficient rows. Emit DATA-BLOCKED with unlock naming the required row count.',
    emissionContract: 'PROBED with effectObserved:boolean, or DATA-BLOCKED with reason + unlock.',
  },

  'editable-cell': {
    class: 'editable-cell',
    requiredActions: [
      'record-baseline: read current cell value',
      'click-cell: activate edit mode (cell becomes input)',
      'type-value: enter a new value',
      'commit: press Enter or Tab to commit',
      'assert: cell shows new value',
      'save: click Save button',
      'verify-persist: reload page and verify value persisted',
      'restore: revert to original value + save',
    ],
    effectObservable: 'dirty-flag + Save-enable delta; persisted value after reload',
    zeroEffectProtocol: 'N/A — edit always has observable effect (cell value change).',
    emissionContract: 'PROBED with effectObserved:boolean.',
  },

  'guard': {
    class: 'guard',
    requiredActions: [
      'make-dirty: edit any field to create unsaved changes',
      'navigate-away: attempt to leave the page (click a nav link)',
      'assert-prompt: dirty-state prompt/dialog appears',
      'click-stay: choose to stay on the page',
      'assert: still on the same page with changes intact',
      'navigate-away-again: attempt to leave again',
      'click-leave: choose to leave',
      'assert: navigated away, changes discarded',
    ],
    effectObservable: 'prompt appearance + both prompt actions (stay/leave) honored',
    zeroEffectProtocol: 'If no prompt appears after dirty edit + navigate-away → file as BUG-CONFIRMED (missing guard).',
    emissionContract: 'PROBED with effectObserved:boolean. Navigate-away is mandatory (not deferred to DEEP).',
  },

  'io': {
    class: 'io',
    requiredActions: [
      'export: trigger the export action (button click)',
      'assert-export: file downloaded or download dialog appeared',
      'record-export-content: read the exported file (CSV/XLSX columns, row count)',
      'import: open the import dialog',
      'upload-exported-file: use the exported file as import input',
      'assert-round-trip: import accepts the system\'s own output (I9 invariant)',
    ],
    effectObservable: 'download fired (export) + file accepted (import round-trip)',
    zeroEffectProtocol: 'If export produces no file → suspicion. If import rejects own export → BUG-CONFIRMED (NM-1940 class).',
    emissionContract: 'PROBED or DATA-BLOCKED. Round-trip is the primary assertion.',
  },

  'menu-disclosure': {
    class: 'menu-disclosure',
    requiredActions: [
      'open-menu: click the menu/disclosure trigger',
      'enumerate-items: list ALL visible menu items',
      'for-each-state-changing-item: exercise the action + verify effect + restore',
      'reset-restore-default: if a reset/restore-default item exists, it is a MANDATORY probe — exercise it and verify all settings revert to defaults',
      'close-menu: dismiss the menu',
    ],
    effectObservable: 'per-item: state change observed + restored. Reset item: all settings revert.',
    zeroEffectProtocol: 'Omitting a reset item while exercising other menu items is a partial-implementation gap.',
    emissionContract: 'PROBED per item. Each menu item individually emitted: PROBED, DATA-BLOCKED, or UNCLASSIFIED.',
  },

  'add-picker': {
    class: 'add-picker',
    requiredActions: [
      'open-add-flow: click the add/create button',
      'assert-dialog: add dialog/form appears',
      'fill-required-fields: populate required fields with valid data',
      'commit: submit/save the new record',
      'assert-created: new record appears in the list/grid',
      'or-emit-deferral: if user-authorized deferral, emit with authorization reference',
    ],
    effectObservable: 'new record visible in list after commit',
    zeroEffectProtocol: 'If flow cannot complete → DATA-BLOCKED or USER-AUTHORIZED-DEFERRAL.',
    emissionContract: 'PROBED or DATA-BLOCKED or USER-AUTHORIZED-DEFERRAL.',
  },

  'context-selector': {
    class: 'context-selector',
    requiredActions: [
      'record-baseline: note current scope (e.g. current office ID) + grid content summary',
      'open-selector: click the scope-changing control (e.g. Change Local Office)',
      'enumerate-options: list ALL options the selector offers',
      'cross-check-options: compare option set against a SECOND INDEPENDENT SOURCE (R3)',
      'select-different: choose a different scope option',
      'assert-scope-change: entire data context replaced (grid content changed)',
      'record-after: note new scope + grid content summary',
    ],
    effectObservable: 'entire data context replaced — grid content delta across scope switch',
    zeroEffectProtocol: 'If scope switch produces no content change → suspicion (may be same data across scopes, or selector is non-functional).',
    emissionContract: 'PROBED with effectObserved:boolean + secondSource:{type, ref}. Missing secondSource = R3 schema rejection.',
    secondSourceContract: 'The selector\'s own option set MUST be cross-checked against a second, independent source. The selector is not permitted to be its own oracle. The second source must be named (API list, sibling screen, export, DB count). A context-selector record whose option set cites no second source is rejected by the schema.',
  },
};

/**
 * Get the probe definition for an element class.
 * @param {string} elementClass
 * @returns {ProbeDefinition | null}
 */
export function getProbeDefinition(elementClass) {
  return PROBE_DEFINITIONS[elementClass] || null;
}

/**
 * List all supported element classes.
 * @returns {string[]}
 */
export function listClasses() {
  return Object.keys(PROBE_DEFINITIONS);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const scriptName = 'drone-probes.mjs';
const isMain = process.argv[1]?.endsWith(scriptName) || process.argv[1]?.endsWith('drone-probes');

if (isMain) {
  const args = process.argv.slice(2);
  if (args[0] === '--list') {
    console.log('Supported element classes:');
    for (const [cls, def] of Object.entries(PROBE_DEFINITIONS)) {
      console.log(`  ${cls}: ${def.requiredActions.length} actions, effect=${def.effectObservable.slice(0, 60)}...`);
    }
    process.exit(0);
  } else if (args[0] === '--class' && args[1]) {
    const def = getProbeDefinition(args[1]);
    if (!def) {
      console.error(`Unknown class "${args[1]}". Use --list to see supported classes.`);
      process.exit(1);
    }
    console.log(JSON.stringify(def, null, 2));
    process.exit(0);
  } else {
    console.log(`Usage:\n  node ${scriptName} --list\n  node ${scriptName} --class <element-class>`);
    process.exit(1);
  }
}
