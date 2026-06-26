#!/usr/bin/env node
// scripts/walk-coverage/enumerate-page.mjs
// PLAN_EXHAUSTIVE_WALK_GUARANTEE — Phase 1 enumerator.
//
// A standalone Playwright script (NOT `playwright-cli eval`) that produces the machine-enumerated
// walk DENOMINATOR for a live page: it shadow-pierces the DOM, tags every interactive element by
// Heuristic-A v2 + Heuristic-B (lib/deep-pierce.mjs), self-expands to a fixpoint (tabs/openers mount
// new DOM; the grid cascade-parent toggles enable children), runs a CDP `getEventListeners`
// G1-recovery pass to catch click-handler <div>/<span> that have no role/testid/tabindex, collapses
// homogeneous grid/virtualized rows to per-column archetypes, and emits both a JSON provenance file
// and a ready-to-paste `## Coverage Manifest` markdown block (M3).
//
// It is a Playwright SCRIPT precisely so it can open a CDPSession — page-context eval cannot reach
// `DOMDebugger.getEventListeners` (pilot F1). It reuses the canonical saved SSO session
// (clients/encore/.auth/encore-state.json); it does NOT reimplement login (avoids the raw-chromium
// anti-pattern, LR-054 Instance 3) and ABORTS on a login redirect rather than enumerating the login
// page as a bogus tiny denominator (adversarial-audit S1).
//
// Usage:
//   node scripts/walk-coverage/enumerate-page.mjs --office=1604 --module=pricing
//   node scripts/walk-coverage/enumerate-page.mjs --url=<full-url> --state=<label> [--no-cdp] [--headed]
//   npm run walk:enumerate -- --office=1604 --module=pricing
//
// Browser-tool: Playwright CLI/script family (LR-038 v2 / browser-tool.md). Unattended catalog walk.

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inPageEnumerate, collapseArchetypes, setAlgebra, renderManifest } from './lib/deep-pierce.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

// ---- CLI args -------------------------------------------------------------------------------
function parseArgs(argv) {
  const o = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) o[m[1]] = m[2] === undefined ? true : m[2];
  }
  return o;
}
const args = parseArgs(process.argv);

const DEFAULT_AUTH = join(REPO_ROOT, 'clients', 'encore', '.auth', 'encore-state.json');
const FALLBACK_AUTH = join(REPO_ROOT, '.auth', 'e2e-state.json');
const BASE = 'https://cloudapps-e2e.encoreglobal.com/navigator';

// Corporate Pricing live-verified pricebook fixtures (source: clients/encore .../data/corporate-pricing/common.ts
// CORPORATE_PRICING_FIXTURES). Override either with --pricebook=<guid> when a fixture rots. Used by the
// details-tab entries below to land on a real pricebook (the Details/Strategy/Detail screens require a guid).
const CPR_STRATEGY_GUID = '5f2a4088-9268-b033-4925-a48146afb1cb';  // 2022-NP Tier 1 (Active)  — Pricing Strategy fixture
const CPR_DETAIL_GUID   = '91acb5ca-20e2-ce8e-a9ab-8c370925fd65';  // 2021-PB6     (Inactive) — Pricing Detail fixture

// ---- per-module walk config (the M1 "per-module whitelist" for deterministic self-expand) ----
// Generic affordance-probe self-expand also runs (role=tab unselected, aria-expanded=false); the
// whitelist makes the validated pricing path deterministic + bounded.
const MODULE_CONFIG = {
  pricing: {
    path: (office) => `${BASE}/locations/${office}/settings/location`,
    // Activate the Radix sub-tab by TESTID, not role — the pilot proved getByRole did not flip the
    // sub-tab; the trusted testid click does (O2). After click, wait for a pricing-content marker to
    // mount (tab-switch O1 race) before enumerating.
    activateTabs: ['location-settings-sub-tab-pricing'],
    // Wait on the STRONG, last-to-render marker (the grid table) — NOT a cheap early match like
    // btn-effective-date, which returned before the 1117-element grid hydrated (live-found O1 race).
    contentMarker: '[data-testid="location-settings-table-secondary-pricing"]',
    openerTestidPatterns: [/toggle-settings-panel/i, /toggle-settings/i],
    cascadeParentTestidPatterns: [/is-alternate/i],
    excludeOptionRoles: true,                   // cmdk option lists are NOT denominator elements (M2)
  },

  // ===========================================================================================
  // Corporate Pricing — 5 surfaces (RCA M2: applies the existing LR-062 enumerator to the module
  // whose Wave-1/1.5 walks were author-judgment, not machine-enumerated). Content markers are
  // text/role anchors because these screens ship near-zero data-testids (live audit 2026-06-05/08/09);
  // contentMarker is best-effort (the enumerator try/catches an absent marker and proceeds). The
  // `openerTestidPatterns` lists are EMPTY: these screens have no testid openers, so generic opener
  // clicking stays conservatively off (the resting + self-expand passes still enumerate the surface).
  // ===========================================================================================
  'corporate-pricing-search': {
    path: (office) => `${BASE}/locations/${office}/settings/corporate-pricing`,
    // The "N items found" footer paints BEFORE data (S1 race) — wait on a real results row, not the footer.
    contentMarker: 'tbody tr',
    openerTestidPatterns: [],
    excludeOptionRoles: true,
  },
  'corporate-pricing-strategy': {
    path: (office) => `${BASE}/locations/${office}/settings/corporate-pricing/details/${args.pricebook || CPR_STRATEGY_GUID}`,
    // Details tabs are TEXT buttons (no testid, aria-selected not exposed) → the enumerator's testid
    // tab-activation cannot flip tabs; this entry enumerates the DEFAULT Pricing Strategy tab. Use the
    // 'corporate-pricing-detail' entry for the Pricing Detail grid.
    contentMarker: 'text=Pricing Strategy',
    openerTestidPatterns: [],
    excludeOptionRoles: true,
  },
  'corporate-pricing-detail': {
    path: (office) => `${BASE}/locations/${office}/settings/corporate-pricing/details/${args.pricebook || CPR_DETAIL_GUID}`,
    // Same TEXT-tab caveat as strategy: the URL lands on the default Strategy tab — to enumerate the
    // Pricing Detail GRID the re-walk must first click the "Pricing Detail" text tab (no testid to
    // drive). Heavy page (~2430 rows + ~3707 draggables) → readiness is slow; that is expected.
    contentMarker: 'text=Pricing Detail',
    openerTestidPatterns: [],
    excludeOptionRoles: true,
  },
  'corporate-pricing-new-pricebook': {
    path: (office) => `${BASE}/locations/${office}/settings/corporate-pricing/add?type=${args.type || 'equipment'}`,
    // Light-DOM React create form (--type route param fixes the disabled Type combobox). Pass
    // --type=labor to enumerate the Labor catalog variant.
    contentMarker: 'h1:has-text("New Pricebook")',
    openerTestidPatterns: [],
    excludeOptionRoles: true,
  },
  'corporate-pricing-override': {
    path: (office) => `${BASE}/locations/${office}/settings/corporate-pricing/pg-override`,
    contentMarker: 'h1:text-is("Product Group Override")',
    openerTestidPatterns: [],
    excludeOptionRoles: true,
    // NM-1472 PRECONDITION (why the original walk missed the add-affordance): the Product-Group Picker
    // (double-click + drag add) renders ONLY after a SPECIFIC location AND a SPECIFIC currency are
    // selected — walks that used Currency=ALL never saw it. The resting enumeration here captures the
    // location-gated empty state + the "Select a location" launcher + the Equipment/Labor tabs; the
    // re-walk (the keystone audit subplan) MUST drive a location + a non-ALL currency to enumerate the
    // picker's add controls. Labor product groups repro on office 1101 (NM-1881), not 1604.
  },
};

// ---- readiness gate (O1): poll a shadow-pierced testid count until stable (LR-052 poll-not-sleep,
//      LR-023 no-networkidle). Standard short poll interval is a poll cadence, not a fixed sleep. ----
async function waitReady(page, { minTestids = 8, stableReads = 2, interval = 300, timeout = 20000 } = {}) {
  let last = -1, stable = 0, waited = 0;
  while (waited < timeout) {
    let c = 0;
    try {
      c = await page.evaluate(() => {
        function deep(root) {
          let n = 0; const k = root.querySelectorAll('*');
          for (const e of k) { if (e.getAttribute && e.getAttribute('data-testid')) n++; if (e.shadowRoot) n += deep(e.shadowRoot); }
          return n;
        }
        return deep(document);
      });
    } catch { /* mid-navigation; retry */ }
    if (c >= minTestids && c === last) { if (++stable >= stableReads) return c; } else stable = 0;
    last = c;
    await page.waitForTimeout(interval);
    waited += interval;
  }
  return last;
}

function isLoginRedirect(url) {
  return /login\.microsoftonline\.com|login\.microsoft\.com|\/oauth2\/|\/saml2\/|sts\./i.test(url || '');
}

// Robust Radix tab activation by TESTID (the pilot proved getByRole-by-name does not flip the
// sub-tab). Click → verify aria-selected flips → retry (a premature click on an under-hydrated page
// is a no-op even when trusted — O1/O2). Then wait for the strong content marker + settle.
async function activateTabByTestid(page, testid, contentMarker) {
  const loc = page.locator(`[data-testid="${testid}"]`);
  for (let attempt = 1; attempt <= 5; attempt++) {
    if (!(await loc.count())) { await page.waitForTimeout(700); continue; }
    try { await loc.first().click({ timeout: 8000 }); } catch { /* not actionable yet */ }
    const sel = await loc.first().getAttribute('aria-selected').catch(() => null);
    if (sel === 'true') {
      if (contentMarker) { try { await page.waitForSelector(contentMarker, { timeout: 12000 }); } catch { /* marker absent in this data state */ } }
      await waitReady(page);
      return { ok: true, attempts: attempt };
    }
    await page.waitForTimeout(900);   // page/Radix not wired yet — settle and retry
  }
  return { ok: false, attempts: 5 };
}

// ---- merge enumerated entries into the accumulator (union by key; OR the A/B membership) ----
function mergeEntries(accum, entries, branch, excludeOptionRoles) {
  let added = 0;
  for (const e of entries) {
    if (excludeOptionRoles && e.role === 'option') continue;   // M2: option-sets not denominator elements
    const prev = accum.get(e.key);
    if (!prev) {
      accum.set(e.key, { ...e, branches: branch ? [branch] : [] });
      added++;
    } else {
      prev.inA = prev.inA || e.inA;
      prev.inB = prev.inB || e.inB;
      if (branch && !prev.branches.includes(branch)) prev.branches.push(branch);
    }
  }
  return added;
}

// ---- CDP G1-recovery: cursor:pointer candidates → DOMDebugger.getEventListeners confirm ----
async function cdpG1Recovery(page, candidates, cap = 80) {
  const hits = [];
  if (!candidates || !candidates.length) return hits;
  let cdp;
  try { cdp = await page.context().newCDPSession(page); } catch { return hits; }
  const INTERACTION = new Set(['click', 'mousedown', 'pointerdown', 'mouseup', 'pointerup', 'dblclick', 'keydown']);
  for (const c of candidates.slice(0, cap)) {
    try {
      const ev = await cdp.send('Runtime.evaluate', { expression: `window.__wcCands[${c.idx}]`, objectGroup: 'wc-g1' });
      const objectId = ev && ev.result && ev.result.objectId;
      if (!objectId) continue;
      const res = await cdp.send('DOMDebugger.getEventListeners', { objectId });
      const types = (res.listeners || []).map(l => l.type);
      if (types.some(t => INTERACTION.has(t))) hits.push({ key: c.key, role: c.role, name: c.name, listeners: types });
    } catch { /* node gone / not resolvable */ }
  }
  try { await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'wc-g1' }); } catch {}
  return hits;
}

// ---- one enumeration of the current state (Pass A + Pass B + candidates), per frame ----
async function enumerateState(page) {
  const out = { entries: [], candidates: [], stats: { scanned: 0, shadowHosts: 0 } };
  // Frame walk (G5) is the outer loop. The main frame holds the pricing surface; iframe scanning is
  // by-construction insurance (not pricing-exercised — pilot §7.3).
  for (const frame of page.frames()) {
    let r;
    try { r = await frame.evaluate(inPageEnumerate); } catch { continue; }
    out.entries.push(...r.entries);
    // candidates index into THAT frame's window.__wcCands; CDP G1 below resolves them on the main frame
    if (frame === page.mainFrame()) out.candidates = r.candidates;
    out.stats.scanned += r.stats.scanned;
    out.stats.shadowHosts += r.stats.shadowHosts;
  }
  return out;
}

async function main() {
  const office = args.office || '1604';
  const moduleName = args.module || 'pricing';
  const cfg = MODULE_CONFIG[moduleName];
  if (!cfg && !args.url) { console.error(`No config for module "${moduleName}" and no --url given.`); process.exit(2); }
  const url = args.url || cfg.path(office);
  const state = args.state || `${office}-${moduleName}`;
  const authPath = args.auth || (existsSync(DEFAULT_AUTH) ? DEFAULT_AUTH : FALLBACK_AUTH);
  const maxCycles = parseInt(args['max-cycles'] || '6', 10);
  const useCdp = !args['no-cdp'];
  const headed = !!args.headed;

  if (!existsSync(authPath)) {
    console.error(`[FATAL] auth state not found: ${authPath}. Refresh via: playwright-cli open --persistent --profile=.auth\\e2e-profile`);
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({ storageState: authPath });
  const page = await context.newPage();
  // O3: auto-handle beforeunload / app dialogs so a dirty form can't wedge eval.
  page.on('dialog', d => d.accept().catch(() => {}));

  const report = { state, url, office, module: moduleName, authPath: authPath.replace(REPO_ROOT, '.'),
                   date: args.date || new Date().toISOString().slice(0, 10), cycles: [], branches: [] };

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitReady(page);
    if (isLoginRedirect(page.url())) {
      console.error(`[ABORT-S1] redirected to login (${page.url()}). The saved session is stale — refresh ${authPath} via 'playwright-cli open --persistent' then 'state-save', and re-run. NOT enumerating the login page.`);
      await browser.close();
      process.exit(3);
    }

    const accum = new Map();
    const excludeOptions = cfg ? cfg.excludeOptionRoles : true;

    // --- activate configured sub-tabs by testid (trusted click + verify-retry — O1/O2) ---
    if (cfg && cfg.activateTabs) {
      report.tabActivate = [];
      for (const testid of cfg.activateTabs) {
        const res = await activateTabByTestid(page, testid, cfg.contentMarker);
        report.tabActivate.push({ testid, ...res });
        if (!res.ok) report.tabActivateNote = `failed to activate ${testid} after ${res.attempts} attempts (aria-selected never true)`;
      }
    }

    if (args.debug) {
      const sel = await page.locator('[data-testid="location-settings-sub-tab-pricing"]').first().getAttribute('aria-selected').catch(() => '?');
      const gridCount = await page.locator('[data-testid="location-settings-table-secondary-pricing"]').count().catch(() => -1);
      const altCount = await page.locator('[data-testid="location-settings-table-pricing-col-is-alternate"]').count().catch(() => -1);
      const frames = page.frames().length;
      console.error(`[debug] pre-enumerate: pricing aria-selected=${sel} gridCount=${gridCount} colIsAltCount=${altCount} frames=${frames} url=${page.url()}`);
    }

    // --- resting-state enumeration + CDP G1 on its candidates (Pay To Address lives here) ---
    let cur = await enumerateState(page);
    if (args.debug) console.error(`[debug] resting enumerate: entries=${cur.entries.length} scanned=${cur.stats.scanned} candidates=${cur.candidates.length}`);
    mergeEntries(accum, cur.entries, 'resting', excludeOptions);
    let g1hits = [];
    if (useCdp) {
      g1hits = await cdpG1Recovery(page, cur.candidates);
      for (const h of g1hits) {
        const prev = accum.get(h.key);
        if (prev) { prev.inA = true; if (!prev.why || prev.why === 'focusable') prev.why = 'cdp:listener'; }
        else accum.set(h.key, { key: h.key, role: h.role, name: h.name, why: 'cdp:listener', inA: true, inB: false, disabled: false, branches: ['resting'] });
      }
    }
    report.cycles.push({ cycle: 0, action: 'resting', scanned: cur.stats.scanned, shadowHosts: cur.stats.shadowHosts,
                         candidates: cur.candidates.length, g1hits: g1hits.length, accum: accum.size });

    // --- self-expand to fixpoint: activate NEW openers each cycle until no new keys ---
    const activated = new Set();
    for (let cycle = 1; cycle <= maxCycles; cycle++) {
      cur = await enumerateState(page);
      // openers = configured testid patterns + generic (role=tab unselected, aria-expanded=false).
      const openerKeys = cur.entries.filter(e => {
        if (activated.has(e.key)) return false;
        const k = e.key.toLowerCase();
        if (cfg && cfg.openerTestidPatterns && cfg.openerTestidPatterns.some(re => re.test(k))) return true;
        return false;   // generic opener clicking is intentionally conservative (avoid mutating state)
      });
      let clicked = 0;
      for (const e of openerKeys) {
        const sel = e.key.startsWith('testid:') ? `[data-testid="${e.key.slice(7)}"]` : null;
        if (!sel) continue;
        try {
          const loc = page.locator(sel);
          if (await loc.count()) { await loc.first().click({ timeout: 5000 }); await waitReady(page); clicked++; activated.add(e.key); }
        } catch { activated.add(e.key); }
      }
      const after = await enumerateState(page);
      const added = mergeEntries(accum, after.entries, `expand-${cycle}`, excludeOptions);
      report.cycles.push({ cycle, openersClicked: clicked, added, accum: accum.size });
      if (clicked === 0 || added === 0) break;   // fixpoint: a full pass added zero new keys
    }

    // --- cascade lifecycle (detect → toggle → accumulate → restore) ---
    if (cfg && cfg.cascadeParentTestidPatterns) {
      const cascadeKeys = [...accum.keys()].filter(k => {
        const low = k.toLowerCase();
        return k.startsWith('testid:') && cfg.cascadeParentTestidPatterns.some(re => re.test(low));
      });
      for (const k of cascadeKeys.slice(0, 1)) {   // pilot: row-0 Is-Alternate represents the column archetype
        const sel = `[data-testid="${k.slice(7)}"]`;
        try {
          const loc = page.locator(sel).first();
          if (!(await loc.count())) continue;
          const before = accum.size;
          await loc.click({ timeout: 5000 });        // toggle ON (trusted — O2)
          await waitReady(page);
          const onState = await enumerateState(page);
          const added = mergeEntries(accum, onState.entries, 'cascade:alt-on', excludeOptions);
          await loc.click({ timeout: 5000 }).catch(() => {});   // O4: RESTORE before any navigation
          await waitReady(page);
          report.branches.push({ branch: 'cascade:alt-on', parentKey: k, addedKeys: added, accumBefore: before, accumAfter: accum.size });
        } catch (e) { report.branches.push({ branch: 'cascade:alt-on', parentKey: k, error: String(e).slice(0, 120) }); }
      }
    }

    // --- archetype-collapse (F3/G8) + set algebra (M4) ---
    const rawEntries = [...accum.values()];
    const entries = collapseArchetypes(rawEntries, parseInt(args['archetype-threshold'] || '4', 10));
    const algebra = setAlgebra(entries);

    report.denominator = entries.length;
    report.rawBeforeArchetypeCollapse = rawEntries.length;
    report.setAlgebra = { union: algebra.unionCount, intersection: algebra.intersectionCount, symDiff: algebra.symDiffCount };
    report.symDiffReview = algebra.symDiff;
    report.g1Recovered = g1hits;
    report.entries = entries;

    // --- emit JSON provenance + markdown manifest scaffold ---
    const outDir = join(REPO_ROOT, 'reports', 'walk-coverage');
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    const jsonPath = args.out ? resolve(REPO_ROOT, args.out) : join(outDir, `${state}.json`);
    writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf-8');
    const manifestMd = renderManifest({ walkState: `office=${office} module=${moduleName}`, entries,
      machineFoundDate: report.date, sourceJson: `reports/walk-coverage/${state}.json` });
    const mdPath = jsonPath.replace(/\.json$/, '.manifest.md');
    writeFileSync(mdPath, manifestMd, 'utf-8');

    console.log(`[walk:enumerate] state=${state} denominator=${entries.length} (raw=${rawEntries.length}, archetype-collapsed)`);
    console.log(`  union=${algebra.unionCount} intersection=${algebra.intersectionCount} A△B-review=${algebra.symDiffCount} | CDP-G1 hits=${g1hits.length}`);
    console.log(`  cycles=${report.cycles.length} branches=${report.branches.length}`);
    console.log(`  JSON: ${jsonPath.replace(REPO_ROOT, '.')}`);
    console.log(`  Manifest: ${mdPath.replace(REPO_ROOT, '.')}`);
  } catch (e) {
    console.error(`[FATAL] ${String(e).slice(0, 300)}`);
    await browser.close();
    process.exit(1);
  }
  await browser.close();
}

main();
