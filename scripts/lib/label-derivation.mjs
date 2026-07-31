/**
 * Single-source label logic for the readable-report tooling. The DATA is loaded from
 * clients/encore/src/fixtures/label-jargon.json (the same file label-derivation.ts imports at
 * runtime); camelToLabel MIRRORS label-derivation.ts's runtime copy and must stay behaviourally
 * identical to it. Imported by generate-label-inventory.mjs and check-step-labels.mjs.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = join(here, '..', '..', 'clients', 'encore', 'src', 'fixtures', 'label-jargon.json');
const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));

export const jargonMap = data.jargonMap;
export const deniedJargon = data.deniedJargon;
export const handLabels = data.handLabels;

export function splitCamel(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean);
}

export function camelToLabel(methodName) {
  const out = [];
  for (const word of splitCamel(methodName)) {
    const mapped = jargonMap[word.toLowerCase()];
    if (mapped === undefined) {
      out.push(word.toLowerCase());
    } else if (mapped !== '') {
      out.push(mapped);
    }
  }
  const label = out.join(' ').replace(/\s+/g, ' ').trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function resolveLabel(className, methodName) {
  const perClass = handLabels[className];
  const hand = perClass ? perClass[methodName] : undefined;
  return hand !== undefined && hand !== '' ? hand : camelToLabel(methodName);
}

/**
 * Return the camel-split tokens of a method name that are recognised jargon
 * (deniedJargon) but have NO translation in jargonMap — these would leak raw
 * jargon into a report label, so a gate should reject them.
 */
export function untranslatedJargon(methodName) {
  const hits = [];
  for (const word of splitCamel(methodName)) {
    const key = word.toLowerCase();
    if (deniedJargon.includes(key) && !(key in jargonMap)) {
      hits.push(word);
    }
  }
  return hits;
}
