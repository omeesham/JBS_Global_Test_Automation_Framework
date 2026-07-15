/**
 * Fixture-layer Proxy that renders each page-object action as a short, plain-English
 * step in the Playwright HTML report, so a non-technical reader sees sentences
 * ("Open the Currency tab") instead of raw locator code. Non-action members (the
 * public `page` property, getters, synchronous helpers) pass through untouched.
 */
import { test } from '@playwright/test';
import labelData from './label-jargon.json';

type LabelData = {
  jargonMap: Record<string, string>;
  deniedJargon: string[];
  handLabels: Record<string, Record<string, string>>;
};

const { jargonMap, handLabels } = labelData as LabelData;

function splitCamel(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Convert a method name into a short plain-English report label. Each word is
 * translated through the jargon map (client-facing product words); words mapped to
 * an empty string are dropped; everything else is lowercased.
 */
export function camelToLabel(methodName: string): string {
  const out: string[] = [];
  for (const word of splitCamel(methodName)) {
    const mapped: string | undefined = jargonMap[word.toLowerCase()];
    if (mapped === undefined) {
      out.push(word.toLowerCase());
    } else if (mapped !== '') {
      out.push(mapped);
    }
  }
  const label = out.join(' ').replace(/\s+/g, ' ').trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function resolveLabel(className: string, methodName: string): string {
  const perClass = handLabels[className];
  const hand = perClass ? perClass[methodName] : undefined;
  return hand !== undefined && hand !== '' ? hand : camelToLabel(methodName);
}

/**
 * Run `fn` inside a labelled test.step when a test context exists; otherwise run it
 * unwrapped. `test.info()` throws synchronously outside a running test (e.g. a
 * worker-scoped auth refresh), so it is a safe pre-check BEFORE calling test.step
 * (which would reject rather than throw). Body errors are NEVER caught here —
 * assertion failures and real errors propagate normally.
 */
async function safeStep<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let hasContext = false;
  try {
    test.info();
    hasContext = true;
  } catch {
    // Documented fallback: no active test context -> run this method unwrapped.
    hasContext = false;
  }
  if (!hasContext) {
    return fn();
  }
  return test.step(label, fn);
}

export interface WrapOptions {
  exclude?: string[];
}

/**
 * Wrap a page-object instance in a Proxy that renders each async action as a
 * plain-English `test.step` in the HTML report. Non-function members (properties,
 * the public `page`, getters) and synchronous methods pass through unchanged.
 */
export function wrapWithSteps<T extends object>(
  instance: T,
  className: string,
  options: WrapOptions = {},
): T {
  if (options.exclude?.includes(className)) {
    return instance;
  }
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver): unknown {
      const value = Reflect.get(target, prop, receiver);
      // Non-function members (properties, `page`, getter results) — return UNCHANGED.
      if (typeof value !== 'function') {
        return value;
      }
      // Synchronous functions — bind to the raw target, no step wrapping.
      if (value.constructor.name !== 'AsyncFunction') {
        return value.bind(target);
      }
      // Async functions — wrap in a labelled step. `.apply(target, ...)` (raw target,
      // not the proxy) means internal this.otherMethod() calls are not re-intercepted,
      // so the report shows no confusing nested duplicate steps.
      const label = resolveLabel(className, String(prop));
      return (...args: unknown[]): Promise<unknown> =>
        safeStep(label, () => value.apply(target, args) as Promise<unknown>);
    },
  };
  return new Proxy(instance, handler);
}
