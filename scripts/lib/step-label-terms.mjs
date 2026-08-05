import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = join(here, '..', '..', 'clients', 'encore', 'src', 'fixtures', 'label-jargon.json');
const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));

export const approvedTerms = data.approvedTerms;
export const deniedJargon = data.deniedJargon;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripApprovedTerms(label) {
  return [...approvedTerms]
    .sort((a, b) => b.length - a.length)
    .reduce((remaining, term) => {
      const pattern = new RegExp(`(^|[^A-Za-z0-9])${escapeRegExp(term)}(?=$|[^A-Za-z0-9])`, 'g');
      return remaining.replace(pattern, '$1 ');
    }, label);
}

export function findDeniedJargonInLabel(label) {
  const stripped = stripApprovedTerms(label);
  const tokens = stripped
    .split(/[^A-Za-z0-9]+/)
    .map(token => token.toLowerCase())
    .filter(Boolean);
  return [...new Set(tokens.filter(token => deniedJargon.includes(token)))];
}
