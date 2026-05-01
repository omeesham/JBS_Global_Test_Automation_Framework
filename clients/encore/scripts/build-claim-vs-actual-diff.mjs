// One-shot diff builder: engineer-claimed testids vs live DOM (CLI dumps).
// Output: reports/testid-verification/diff-claimed-vs-actual-<DATE>.md
import fs from 'node:fs';
import path from 'node:path';

const DATE = '2026-04-29';
const DIR = 'reports/testid-verification';

const tabFiles = {
  'Local Info': `cli-localinfo-${DATE}.json`,
  'Currency': `cli-currency-${DATE}.json`,
  'Pricing': `cli-pricing-${DATE}.json`,
  'Account+Address': `cli-account-address-${DATE}.json`,
  'Shared Setup': `cli-shared-setup-${DATE}.json`,
  'Notes': `cli-notes-${DATE}.json`,
  'Legal': `cli-legal-${DATE}.json`,
  'Auto Add-On': `cli-auto-addon-${DATE}.json`,
};

const tabs = {};
for (const [name, file] of Object.entries(tabFiles)) {
  tabs[name] = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
}
const accountListDlg = JSON.parse(fs.readFileSync(path.join(DIR, `cli-account-list-dialog-${DATE}.json`), 'utf8'));
const customerAddrDlg = JSON.parse(fs.readFileSync(path.join(DIR, `cli-customer-address-dialog-${DATE}.json`), 'utf8'));
const changeLocalOfficeDlg = JSON.parse(fs.readFileSync(path.join(DIR, `cli-change-local-office-dialog-${DATE}.json`), 'utf8'));

// Master union of ALL testids observed live (used for TYPO matching)
const allInDom = new Set();
for (const list of Object.values(tabs)) for (const id of list) allInDom.add(id);
for (const id of accountListDlg.innerTestids) allInDom.add(id);
allInDom.add(accountListDlg.modalTestid);
for (const id of changeLocalOfficeDlg.innerTestids) allInDom.add(id);
allInDom.add(changeLocalOfficeDlg.modalTestid);

const claimed = [
  ['Local Info', 'location-settings-btn-effective-date'],
  ['Local Info', 'location-settings-modal-error'],
  ['Currency', 'location-settings-table-currency-col-code'],
  ['Currency', 'location-settings-table-currency-col-selected'],
  ['Currency', 'location-settings-table-currency-col-is-default'],
  ['Currency', 'location-settings-table-currency-col-merchant'],
  ['Pricing', 'location-settings-table-secondary-pricing'],
  ['Pricing', 'location-settings-select-primary-labor-pricing-usd'],
  ['Pricing', 'location-settings-select-primary-labor-pricing-mxn'],
  ['Pricing', 'location-settings-select-primary-labor-pricing-cad'],
  ['Pricing', 'location-settings-select-primary-equipment-pricing-usd'],
  ['Pricing', 'location-settings-select-primary-equipment-pricing-mxn'],
  ['Pricing', 'location-settings-select-primary-equipment-pricing-cad'],
  ['Pricing', 'location-settings-select-primary-internal-equipment-pricing-usd'],
  ['Pricing', 'location-settings-select-primary-internal-equipment-pricing-mxn'],
  ['Pricing', 'location-settings-select-primary-internal-equipment-pricing-cad'],
  ['Pricing', 'location-settings-select-primary-production-labor-pricing-usd'],
  ['Pricing', 'location-settings-select-primary-production-labor-pricing-mxn'],
  ['Pricing', 'location-settings-select-primary-production-labor-pricing-cad'],
  ['Pricing', 'location-settings-select-primary-production-equipment-pricing-usd'],
  ['Pricing', 'location-settings-select-primary-production-equipment-pricing-mxn'],
  ['Pricing', 'location-settings-select-primary-production-equipment-pricing-cad'],
  ['Pricing', 'location-settings-table-pricing-col-pricing-strategy'],
  ['Pricing', 'location-settings-table-pricing-col-pricebook'],
  ['Pricing', 'location-settings-table-pricing-col-currency'],
  ['Pricing', 'location-settings-table-pricing-col-is-alternate'],
  ['Pricing', 'location-settings-table-pricing-col-use-effective-dates'],
  ['Pricing', 'location-settings-table-pricing-col-start-date'],
  ['Pricing', 'location-settings-table-pricing-col-end-date'],
  ['Account+Address', 'location-settings-input-venue-name'],
  ['Account+Address', 'location-settings-input-contact-phone-1'],
  ['Account+Address', 'location-settings-btn-venue-address'],
  ['Account+Address', 'location-settings-btn-master-address'],
  ['Account List Dialog', 'location-settings-modal-account-list'],
  ['Select Customer Address', 'location-settings-modal-select-customer-address'],
  ['Select Customer Address', 'location-settings-modal-select-customer-address-btn-save'],
  ['Select Customer Address', 'location-settings-modal-select-customer-address-btn-select'],
  ['Select Customer Address', 'location-settings-modal-select-customer-address-btn-cancel'],
  ['Select Customer Address', 'location-settings-modal-select-customer-address-input-search'],
  ['Select Customer Address', 'location-settings-modal-select-customer-address-label-total-addresses'],
  ['Shared Setup', 'location-settings-table-shared-setup-col-local-office'],
  ['Shared Setup', 'location-settings-table-shared-setup-col-local-office-name'],
  ['Shared Setup', 'location-settings-table-shared-setup-col-primary-office'],
  ['Shared Setup', 'location-settings-table-shared-setup-col-shares-inventory'],
  ['Shared Setup', 'location-settings-table-shared-setup-col-actions'],
  ['Change Local Office', 'location-settings-modal-change-local-office'],
  ['Change Local Office', 'location-settings-modal-change-local-office-input-search'],
  ['Change Local Office', 'location-settings-modal-change-local-office-btn-select'],
  ['Change Local Office', 'location-settings-modal-change-local-office-btn-cancel'],
  ['Notes', 'location-settings-table-notes'],
  ['Notes', 'location-settings-btn-add-note'],
  ['Notes', 'location-settings-label-note-character-counter'],
  ['Notes', 'location-settings-label-note-character-progress'],
  ['Legal', 'location-settings-table-legal-col-language-name'],
  ['Legal', 'location-settings-table-legal-col-service-charge-name'],
  ['Legal', 'location-settings-table-legal-col-terms-and-conditions-name'],
  ['Save Changes Dialog', 'location-settings-modal-save-changes'],
  ['Unsaved Changes Dialog', 'location-settings-modal-unsaved-changes'],
];

function findSimilar(claimedId, candidateSet) {
  const tokens = claimedId.split('-').filter((t) => !['location', 'settings'].includes(t));
  let best = null;
  let bestScore = 0;
  for (const candidate of candidateSet) {
    let score = 0;
    for (const t of tokens) if (candidate.includes(t)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  const need = Math.max(2, Math.floor(tokens.length * 0.5));
  return bestScore >= need ? { match: best, score: bestScore, total: tokens.length } : null;
}

let ok = 0;
let typo = 0;
let missing = 0;
const rows = [];
for (const [area, id] of claimed) {
  let presentIn = null;
  for (const [tabName, list] of Object.entries(tabs)) {
    if (list.includes(id)) {
      presentIn = tabName;
      break;
    }
  }
  if (!presentIn) {
    if (id === accountListDlg.modalTestid || accountListDlg.innerTestids.includes(id)) presentIn = 'Account List Dialog';
    else if (id === changeLocalOfficeDlg.modalTestid || changeLocalOfficeDlg.innerTestids.includes(id)) presentIn = 'Change Local Office Dialog';
  }
  let verdict, note;
  if (presentIn) {
    verdict = 'OK';
    note = `Found in: ${presentIn}`;
    ok++;
  } else {
    const similar = findSimilar(id, allInDom);
    if (similar) {
      verdict = 'TYPO';
      note = `Closest in DOM: \`${similar.match}\` (${similar.score}/${similar.total} tokens match)`;
      typo++;
    } else {
      verdict = 'MISSING';
      note = 'No exact + no similar match in any captured tab/dialog';
      missing++;
    }
  }
  rows.push({ area, claimed: id, verdict, note });
}

const lines = [];
lines.push('# Engineer Claim vs Live DOM — Diff Matrix (CLI-verified 2026-04-29)');
lines.push('');
lines.push('**Source**: live DOM exploration via `playwright-cli` on `cloudapps-e2e.encoreglobal.com`, office 1604.');
lines.push('**Per-tab/dialog dumps**: `reports/testid-verification/cli-<surface>-2026-04-29.json` (13 files).');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push('| Verdict | Count |');
lines.push('|---|---|');
lines.push(`| OK (exact match in live DOM) | ${ok} |`);
lines.push(`| TYPO (similar but not exact) | ${typo} |`);
lines.push(`| MISSING (no exact + no similar) | ${missing} |`);
lines.push(`| **Total engineer-claimed** | **${claimed.length}** |`);
lines.push('');
lines.push('## Per-row verdict');
lines.push('');
lines.push('| # | Area | Engineer-claimed testid | Verdict | Note |');
lines.push('|---|---|---|---|---|');
rows.forEach((r, i) => {
  lines.push(`| ${i + 1} | ${r.area} | \`${r.claimed}\` | **${r.verdict}** | ${r.note} |`);
});
lines.push('');
lines.push('## Notes on dialog surfaces');
lines.push('');
lines.push('- **Save Changes alertdialog** — opened (toggled Active checkbox → clicked Save). Container has NO `data-testid`. ZERO inner testids. Engineer claim `location-settings-modal-save-changes` MISSING.');
lines.push('- **Unsaved Changes alertdialog** — did NOT trigger. Set Default LDW input to `5.00` (form WAS dirty — Save button enabled), tabbed away, clicked Currency sub-tab. Tab navigation succeeded directly with no Unsaved Changes dialog firing. Open question for engineer: was the dirty-guard removed, or does it only fire on certain navigation paths (e.g. browser back/close, top-level tab switch)?');
lines.push('- **Select Customer Address dialog** — opened (clicked `location-settings-btn-venue-address`). Container has NO `data-testid`. ZERO inner testids. ALL 6 engineer claims for this dialog MISSING.');
lines.push('- **Account List dialog** — opened (clicked `location-settings-btn-lookup-venue`). Container `location-settings-modal-account-list` PRESENT. **10 inner testids PRESENT** (not previously documented in JIRA pushback): `-input-account-number/-name/-address/-city`, `-select-account-state/-country`, `-btn-search-account`, `-btn-reset-account-search`, `-btn-select-account`, `-btn-cancel-account-search`. Engineer shipped MORE than they claimed.');
lines.push('- **Change Local Office dialog** — opened (clicked `location-settings-btn-add-shared-location-1` on Shared Setup tab). Container + 3 inner testids ALL PRESENT.');
lines.push('');
lines.push('## Pricing per-currency dropdown shape');
lines.push('');
lines.push('Engineer shipped per-currency keying. **Office 1604 only renders USD** — `-usd` variants present for all 5 dropdown kinds (labor, equipment, internal-equipment, production-labor, production-equipment). `-mxn` and `-cad` are absent in the DOM for office 1604 (would render in offices with those currencies enabled). This means the 10 `-mxn`/`-cad` testids are not "missing" — they are render-conditional. Verifying them requires running this exploration on a multi-currency office.');
lines.push('');
lines.push('## Caveats / open questions');
lines.push('');
lines.push('- Pricing tab earlier failed via the test runner (15s readiness timeout on `corporate-pricing` checkbox). Live CLI exploration shows the testid IS present; the page-object readiness wait simply needed more time. Suggests the page object should bump the Pricing readiness timeout, but that decision is not in scope for this exploration.');
lines.push('- The Local Info tab capture happened on the freshly-loaded page where 89 testids were present. The earlier `location-testid-verify.spec.ts` run reported 0/5 PRESENT for Local Info + Currency probes — that result was wrong (the spec ran before the DOM finished hydrating, OR ran in the wrong frame context). The live CLI dump is authoritative.');
lines.push('- Verification was performed on a single test user, office 1604. RBAC may render differently for other users.');
lines.push('');

const out = path.join(DIR, `diff-claimed-vs-actual-${DATE}.md`);
fs.writeFileSync(out, lines.join('\n'));
console.log('Saved:', out);
console.log(`Summary: OK=${ok}  TYPO=${typo}  MISSING=${missing}  /  total=${claimed.length}`);
