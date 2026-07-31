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
 * Converts a camelCase method name into a plain-English label suitable for
 * the Playwright HTML report. Applies the jargon map to expand or strip
 * domain-specific abbreviations.
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

/**
 * Resolves the final step label for a page-object method: returns the
 * hand-written override from `label-jargon.json` if one exists, otherwise
 * falls back to the auto-derived `camelToLabel` output.
 */
export function resolveLabel(className: string, methodName: string): string {
  const perClass = handLabels[className];
  const hand = perClass ? perClass[methodName] : undefined;
  return hand !== undefined && hand !== '' ? hand : camelToLabel(methodName);
}
