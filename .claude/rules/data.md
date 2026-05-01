---
description: General coding hygiene — function signatures, catalog parity, error handling, React lifecycle, external data
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "scripts/**/*.ts"
  - "scripts/**/*.mjs"
  - "website/**/*.ts"
  - "website/**/*.tsx"
---

# Coding Hygiene Rules

Path-scoped rule pack — loads when editing TypeScript / JavaScript source under `src/`, `scripts/`, or `website/`.

## LR-001: Verify function signatures before calling (3+ occurrences)

Before calling ANY function from another module: read its actual signature (params, types, return).
Never assume from the plan or memory. Wrong param = wrong data = silent corruption.
**Trigger**: Any plan that calls functions across files.

## LR-002: Catalog ↔ Implementation parity (1 occurrence, CRITICAL)

When adding entries to a catalog/registry/config (ACTION_CATALOG, route tables, SSE events):
MUST add corresponding implementation (case handler, route handler, event listener).
Catalog entry without implementation = advertised but broken feature.
**Trigger**: Any addition to lookup tables, switch statements, event maps.

## LR-003: No empty catch blocks (4+ occurrences)

FORBIDDEN: `catch { }`, `catch(() => {})`, `catch { /* ignore */ }`.
Every catch MUST: (1) re-throw, (2) set error state for UI, or (3) log + documented fallback.
Silent swallowing hides failures users can't diagnose.
**Trigger**: Every try/catch in new code.

## LR-004: React cleanup audit (1 occurrence)

Every `setInterval`, `setTimeout`, `addEventListener`, `EventSource` in React:
verify cleanup in `useEffect` return / `useRef`. No cleanup = memory leak.
**Trigger**: Any React component using timers/listeners/subscriptions.

## LR-005: useCallback / useEffect dependency audit (2 occurrences)

Before finalizing React hooks: verify every variable referenced in the body
is either (a) in the dependency array, or (b) accessed via `useRef`.
Stale closure = renders with old data = invisible bugs.
**Trigger**: Any `useCallback`, `useMemo`, `useEffect` in new code.

## LR-006: Validate external data structure before access (1 occurrence, CRITICAL)

Before accessing nested properties on data from APIs, files, or DB:
check structure exists first. Use optional chaining + fallback.
Never assume shape from plan/memory — the source may have changed format.
**Trigger**: Any code parsing API responses, file reads, or DB JSONB.
