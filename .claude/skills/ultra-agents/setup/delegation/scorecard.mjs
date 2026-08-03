#!/usr/bin/env node
// scorecard.mjs — Orchestration efficiency scorecard. Zero npm deps; node builtins only.
// DATA DIR: process.env.SCORECARD_DIR  or  ~/.claude/delegation
import { readFileSync, writeFileSync, existsSync, readdirSync, appendFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

const DIR       = process.env.SCORECARD_DIR || join(homedir(), '.claude', 'delegation');
const LEDGER    = process.env.LEDGER_PATH  || join(DIR, 'ledger.jsonl');
const AGENTS    = process.env.AGENTS_DIR   || join(DIR, 'agents');
const WORK_TYPES = new Set(['build','review','verify','draft','rca','walk','probe','research','orchestrate']);
const OUTCOMES   = new Set(['green','bounced-then-green','refuted','env-blocked','failed']);
const AGENT_WT   = { 'council-reviewer':'review','council-planner':'draft','council-worker':'build','council-verifier':'verify' };
const LOW_RISK   = new Set(['verify','draft','probe']);

const D4 = [
  'D4 rank rules (window = last 10 per model×work_type; min 5 samples to fire any rule):',
  '  probation → proven  : ≥5 samples AND green ≥ 80%',
  '  proven → probation  : green < 60%  OR  ≥2 refuted in window',
  '  probation → benched : green < 40%',
  '  benched → anywhere  : MANUAL only — no auto-resurrection path',
  '  Hysteresis: max 1 status step per propose/commit cycle.',
  '  All transitions are PROPOSALS — Rutvik-gated before commit.',
].join('\n');

// ── helpers ──────────────────────────────────────────────────────────────────
function rlines(p) {
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').trim().split('\n').filter(Boolean);
}
function rjl(p)   { return rlines(p).map(l => JSON.parse(l)); }
function rjson(p, def = null) {
  if (!existsSync(p)) return def;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return def; }
}
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const k = argv[i].slice(2);
    a[k] = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
  }
  return a;
}
function makeOcIdx(ocs) { const x = {}; for (const o of ocs) x[o.run_id] = o; return x; }
function family(id) { return id.split('-')[0]; }
function buildWins(ledger, oi) {
  const w = {};
  for (const r of ledger) {
    const o = oi[r.run_id]; if (!o) continue;
    const k = `${r.model}::${o.work_type}`;
    (w[k] = w[k] || []).push(o);
  }
  return w;
}

function loadCosts(dir) {
  const p = join(dir, 'model-costs.json');
  if (!existsSync(p)) { console.error(`scorecard: model-costs.json not found at '${p}' — cannot compute cost estimates`); process.exit(1); }
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { console.error(`scorecard: model-costs.json at '${p}' is not valid JSON: ${e.message}`); process.exit(1); }
}


const NON_GREEN_OUTCOMES = new Set([...OUTCOMES].filter(o => o !== 'green'));
function doRecord(a) {
  const rid = a['run-id'], tkt = a.ticket, wt = a['work-type'], oc = a.outcome, ts = a.ts;
  if (!rid || !tkt || !wt || !oc) { console.error('record: --run-id --ticket --work-type --outcome all required'); process.exit(1); }
  if (!WORK_TYPES.has(wt)) { console.error(`record: invalid work-type '${wt}' (valid: ${[...WORK_TYPES].join(',')})`); process.exit(1); }
  if (!OUTCOMES.has(oc))   { console.error(`record: invalid outcome '${oc}' (valid: ${[...OUTCOMES].join(',')})`); process.exit(1); }
  if (!rjl(LEDGER).some(r => r.run_id === rid)) {
    console.error(`record: run_id '${rid}' not found in ledger.jsonl`); process.exit(1);
  }

  // A9.2 — lesson enforcement: non-green outcomes MUST carry --lesson or --lesson none:<reason≥10>.
  const lesson = typeof a.lesson === 'string' ? a.lesson : null;
  if (NON_GREEN_OUTCOMES.has(oc)) {
    if (!lesson) {
      console.error(`record: --lesson "<one-liner>" is required for outcome '${oc}'\n  (or --lesson "none:<reason≥10chars>" to explicitly waive with documented reason)`);
      process.exit(1);
    }
    if (lesson.startsWith('none:') && lesson.slice(5).trim().length < 10) {
      console.error(`record: --lesson none:<reason> requires ≥10 chars after 'none:'; got '${lesson}'`);
      process.exit(1);
    }
    // A9.2 — fault-routed lesson append.
    const fault = typeof a.fault === 'string' ? a.fault : 'worker'; // worker|dispatcher|env
    const seat  = typeof a.seat  === 'string' ? a.seat  : '';
    if (!lesson.startsWith('none:')) {
      const lessonLine = `- ${new Date().toISOString().slice(0,10)} (${rid}): ${lesson}\n`;
      if (fault === 'worker' && seat) {
        // Append to the seat's agent profile ## Lessons section (auto-create if absent).
        const agentPath = join(homedir(), '.copilot', 'agents', `${seat}.agent.md`);
        if (existsSync(agentPath)) {
          let agentText = readFileSync(agentPath, 'utf8');
          if (!agentText.includes('## Lessons')) agentText += '\n## Lessons\n';
          agentText += lessonLine;
          writeFileSync(agentPath, agentText);
          console.log(`lesson appended to ${seat}.agent.md`);
        } else {
          console.warn(`lesson: seat profile not found for '${seat}' — falling back to dispatcher-lessons.md`);
          appendFileSync(join(DIR, 'dispatcher-lessons.md'), lessonLine);
        }
      } else {
        // dispatcher or env fault → dispatcher-lessons.md
        appendFileSync(join(DIR, 'dispatcher-lessons.md'), lessonLine);
        console.log(`lesson appended to dispatcher-lessons.md (fault=${fault})`);
      }
    }
  }

  appendFileSync(join(DIR, 'outcomes.jsonl'),
    JSON.stringify({ ts: ts || 'unknown', run_id: rid, ticket_id: tkt, work_type: wt, outcome: oc, bounces: a.bounces ? Number(a.bounces) : 0 }) + '\n');
  console.log(`recorded: ${rid} → ${oc}`);
}

// ── report ────────────────────────────────────────────────────────────────────
function doReport(a) {
  const ledger   = rjl(LEDGER);
  const outcomes = rjl(join(DIR, 'outcomes.jsonl'));
  const costs    = loadCosts(DIR);
  const policy   = rjson(join(DIR, 'routing-policy.json'), { work_types: {} });
  const reg      = rjson(join(DIR, 'model-registry.json'), { models: [] });
  const rows     = a.session ? ledger.filter(r => r.run_id.startsWith(a.session)) : ledger;
  const oi       = makeOcIdx(outcomes);

  // Per-model dispatch counts (must match ledger exactly)
  const mCounts = {};
  for (const r of rows) mCounts[r.model] = (mCounts[r.model] || 0) + 1;

  // Per (model × work_type) stats
  const stats = {};
  for (const r of rows) {
    const o  = oi[r.run_id];
    const wt = o ? o.work_type : (AGENT_WT[r.agent] || 'legacy');
    const k  = `${r.model}::${wt}`;
    const s  = stats[k] = stats[k] || { model: r.model, wt, d: 0, g: 0, b: 0, rf: 0, wo: 0 };
    s.d++;
    if (o) { s.wo++; if (o.outcome === 'green') s.g++; if (o.outcome === 'bounced-then-green') s.b++; if (o.outcome === 'refuted') s.rf++; }
  }

  const pct = (n, d) => d ? `${Math.round(100 * n / d)}%` : '—';
  console.log('\n=== SCORECARD REPORT ===');
  console.log(`${'model'.padEnd(36)}${'wt'.padEnd(11)}${'disp'.padEnd(7)}${'green%'.padEnd(8)}${'bounce%'.padEnd(9)}${'refute%'.padEnd(9)}est.$`);
  console.log('─'.repeat(88));
  const sRows = [];
  for (const [, s] of Object.entries(stats).sort((a, b) => b[1].d - a[1].d)) {
    const { model, wt, d, g, b, rf, wo } = s;
    const ce   = costs?.models?.[model];
    const burn = (ce?.multiplier != null && costs?.per_request_usd != null)
      ? `$${(d * ce.multiplier * costs.per_request_usd).toFixed(4)}` : '— (unverified)';
    console.log(`${model.padEnd(36)}${wt.padEnd(11)}${String(d).padEnd(7)}${pct(g, wo).padEnd(8)}${pct(b, wo).padEnd(9)}${pct(rf, wo).padEnd(9)}${burn}`);
    sRows.push({ model, work_type: wt, dispatches: d, green_pct: wo ? Math.round(100 * g / wo) : null });
  }

  const noOc = rows.filter(r => !oi[r.run_id]);
  console.log(`\nuntyped/unknown-outcome dispatches: ${noOc.length}`);
  if (noOc.length) process.stderr.write(`[NAG] ${noOc.length} dispatches lack outcome rows. Recent (last 5): ${noOc.slice(-5).map(r => r.run_id).join(', ')}\n`);

  // Per-model dispatch counts table
  console.log('\n=== PER-MODEL DISPATCH COUNTS ===');
  for (const [m, c] of Object.entries(mCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${m}: ${c}`);

  // D9 — pin-freshness
  const regIds  = new Set((reg.models || []).map(m => m.id));
  const polMods = new Set(Object.values(policy.work_types || {}).flatMap(arr => arr.map(e => e.model)));
  console.log('\n=== D9 PIN FRESHNESS ===');
  const agDir = join(homedir(), '.copilot', 'agents');
  if (existsSync(agDir)) {
    for (const f of readdirSync(agDir).filter(f => f.endsWith('.agent.md'))) {
      const pin = (readFileSync(join(agDir, f), 'utf8').match(/^model:\s*(.+)$/m) || [])[1]?.trim();
      if (!pin) { console.log(`  ${f}: no model pin found`); continue; }
      if (!regIds.has(pin)) { console.log(`  STALE-PIN: ${f} pins '${pin}' — NOT in model-registry`); continue; }
      console.log(`  FRESH: ${f} pins '${pin}' ∈ registry`);
      const agWt = AGENT_WT[f.replace('.agent.md', '')];
      if (agWt && policy.work_types[agWt]) {
        const better = (policy.work_types[agWt] || []).filter(e => e.status === 'proven' && e.model !== pin);
        if (better.length) console.log(`  PIN-PROPOSAL: ${f} — policy proven alternatives for '${agWt}': ${better.map(e => e.model).join(',')}`);
      }
    }
  } else { console.log('  (no agents dir found)'); }

  // D10 — catalog-diff
  console.log('\n=== D10 CATALOG DIFF ===');
  const catFile = join(DIR, 'candidates.txt');
  const cat = new Set();
  if (existsSync(catFile)) rlines(catFile).filter(l => !l.startsWith('#')).forEach(m => cat.add(m.trim()));
  for (const m of (reg.models || [])) cat.add(m.id);
  let newModels = 0;
  for (const m of cat) {
    if (!polMods.has(m)) {
      for (const wt of LOW_RISK) console.log(`  NEW-MODEL: '${m}' not in routing-policy — probation candidate for '${wt}'`);
      newModels++;
    }
  }
  if (!newModels) console.log('  (all catalog models present in routing-policy)');

  // D12a — doctrine cross-copy
  console.log('\n=== D12 DOCTRINE CROSS-COPY ===');
  const SCHEMA_FIELDS = ['DOCTRINE_READ','FILES_INSPECTED','PLAN','DIFF_SUMMARY','VERIFY_ARTIFACTS','EXTERNAL_CONTENT_CONSUMED','ASK','DOCS_UPDATED','CLEANUP','BLOCKERS_DEVIATIONS'];
  const docCopies = [join(homedir(), '.copilot', 'agents', 'council-worker.agent.md'), join(DIR, 'ticket-template.md')];
  let allSchemasClean = true;
  for (const cp of docCopies) {
    if (!existsSync(cp)) {
      console.log(`  DOCTRINE-MISSING: ${basename(cp)} expected doctrine copy not found`);
      allSchemasClean = false; continue;
    }
    const text = readFileSync(cp, 'utf8');
    const missing = SCHEMA_FIELDS.filter(f => !text.includes(f));
    if (missing.length) {
      console.log(`  DOCTRINE-DRIFT: ${basename(cp)} missing schema field(s): ${missing.join(', ')}`);
      allSchemasClean = false;
    }
  }
  if (allSchemasClean) console.log('  (all embedded copies carry the full parity schema)');

  // D12c — lesson hygiene (agent profiles + 3 living files per A9.4)
  console.log('\n=== D12 LESSON HYGIENE ===');
  let anyBloated = false;
  // Seat profiles live in ~/.copilot/agents (where fault-routed lessons append per A9.2);
  // AGENTS (~/.claude/delegation/agents) may also hold sandbox/parity copies. Check BOTH so the
  // bloat guard actually watches the files that grow.
  const agentDirs = [join(homedir(), '.copilot', 'agents'), AGENTS];
  let anyAgentDir = false;
  for (const ad of agentDirs) {
    if (!existsSync(ad)) continue;
    anyAgentDir = true;
    for (const file of readdirSync(ad).filter(f => f.endsWith('.agent.md'))) {
      const n = readFileSync(join(ad, file), 'utf8').split('\n').length - 1;
      if (n > 100) {
        console.log(`  LESSON-BLOAT: ${file} is ${n} lines (>100) — consider consolidating lessons`);
        anyBloated = true;
      }
    }
  }
  if (!anyAgentDir) console.log('  (no agents dir found)');
  // A9.4 — extend budget nag to living files.
  const livingFiles = ['dispatcher-lessons.md', 'interrogation-bank.md', 'weakness-map.md'];
  for (const lf of livingFiles) {
    const lfPath = join(DIR, lf);
    if (!existsSync(lfPath)) { console.log(`  (${lf} not yet created — expected at build time)`); continue; }
    const n = readFileSync(lfPath, 'utf8').split('\n').length - 1;
    if (n > 100) {
      console.log(`  LESSON-BLOAT: ${lf} is ${n} lines (>100) — consolidate+prune stale/contradicted entries (SI-6)`);
      anyBloated = true;
    }
  }
  if (!anyBloated) console.log('  (all agent profiles and living files within the 100-line lesson budget)');

  // UPLINK vital signs (PLAN_UPLINK_PROTOCOL Phase 4.2 — announce-mode read from uplink-ledger.jsonl; UPLINK_DOCTRINE §6)
  console.log('\n=== UPLINK VITAL SIGNS ===');
  const uplinkLedger = rjl(join(DIR, 'uplink-ledger.jsonl'));
  if (!uplinkLedger.length) {
    console.log('  (no uplink consults recorded yet — announce mode; nothing fires until Phase 7)');
  } else {
    const consults = uplinkLedger.length;
    const enforceRows = uplinkLedger.filter(r => r.complied === true || r.complied === false);
    const complied = uplinkLedger.filter(r => r.complied === true).length;
    const cacheHits = uplinkLedger.filter(r => r.cache_hit === true).length;
    const parked = uplinkLedger.filter(r => r.outcome === 'parked').length;
    const byClass = {};
    for (const r of uplinkLedger) byClass[r.class || 'unknown'] = (byClass[r.class || 'unknown'] || 0) + 1;
    const compliancePct = enforceRows.length ? Math.round(100 * complied / enforceRows.length) : null;
    console.log(`  consults: ${consults} total  |  ${Object.entries(byClass).map(([c, n]) => `${c}:${n}`).join(' ')}`);
    console.log(`  advisory compliance: ${compliancePct == null ? '— (no enforce rows yet — announce mode)' : compliancePct + '%'}  (target ~100 — §6 sign 4)`);
    console.log(`  cache-hit: ${Math.round(100 * cacheHits / consults)}%   consults-parked: ${parked}`);
    // §6 sign 4 — compliance is the first thing to fix; every other number is noise while it's low
    if (compliancePct != null && compliancePct < 100) console.log(`  [ALARM §6.4] advisory compliance ${compliancePct}% < 100% — fix compliance FIRST; every other vital sign is noise while it's low.`);
    // §6 sign 1 — dead ratchet: consult count flat across last 3 report runs (consults must trend DOWN as questions graduate to rules)
    const histPath = join(DIR, 'uplink-report-history.jsonl');
    appendFileSync(histPath, JSON.stringify({ ts: new Date().toISOString(), consults, compliancePct }) + '\n');
    const histAll = rjl(histPath);
    if (histAll.length > 3) writeFileSync(histPath, histAll.slice(-3).map(r => JSON.stringify(r)).join('\n') + '\n');
    const hist = histAll.slice(-3);
    if (hist.length === 3 && hist[0].consults === hist[1].consults && hist[1].consults === hist[2].consults) {
      console.log(`  [ALARM §6.1] consult count flat (${consults}) across last 3 reports — dead ratchet: consults must trend DOWN as answers graduate into rules (Phase 4.1). Check the graduation loop.`);
    }
  }

  writeFileSync(join(DIR, 'scorecard.json'), JSON.stringify({ generated: new Date().toISOString(), rows: sRows, model_counts: mCounts }, null, 2) + '\n');
  console.log('\n(scorecard.json written)');
}

// ── propose ───────────────────────────────────────────────────────────────────
function doPropose() {
  const ledger   = rjl(LEDGER);
  const outcomes = rjl(join(DIR, 'outcomes.jsonl'));
  const policy   = rjson(join(DIR, 'routing-policy.json'), { work_types: {} });
  const oi   = makeOcIdx(outcomes);
  const wins = buildWins(ledger, oi);
  let n = 0;
  for (const [k, ocs] of Object.entries(wins)) {
    const [model, wt] = k.split('::');
    const win = ocs.slice(-10);
    if (win.length < 5) continue;
    const g  = win.filter(o => o.outcome === 'green').length;
    const rf = win.filter(o => o.outcome === 'refuted').length;
    const gp = g / win.length;
    const status = ((policy.work_types[wt] || []).find(e => e.model === model) || {}).status || 'probation';
    if (status === 'benched') continue;
    if (status === 'probation' && gp >= 0.8)           { console.log(`PROPOSAL [${model}::${wt}::probation->proven] green=${Math.round(100*gp)}% n=${win.length}`); n++; }
    else if (status === 'proven' && (gp < 0.6 || rf >= 2)) { console.log(`PROPOSAL [${model}::${wt}::proven->probation] green=${Math.round(100*gp)}% refuted=${rf} n=${win.length}`); n++; }
    else if (status === 'probation' && gp < 0.4)       { console.log(`PROPOSAL [${model}::${wt}::probation->benched] green=${Math.round(100*gp)}% n=${win.length}`); n++; }
  }
  if (!n) console.log('No rank-change proposals. (Small-N guard active or no thresholds triggered — all seeds proven with 0 outcome samples.)');
}

// ── commit ────────────────────────────────────────────────────────────────────
function doCommit(a) {
  const cid = a.change;
  if (!cid || cid === true) { console.error('commit: --change <id> is required'); process.exit(1); }
  const logPath = join(DIR, 'routing-changes.log');
  if (existsSync(logPath) && readFileSync(logPath, 'utf8').includes(`change-id:${cid}`)) {
    console.log(`commit: '${cid}' already applied (idempotent no-op).`); return;
  }
  const ledger   = rjl(LEDGER);
  const outcomes = rjl(join(DIR, 'outcomes.jsonl'));
  const pPath    = join(DIR, 'routing-policy.json');
  const pol      = rjson(pPath, { version: '1', updated: 'unknown', work_types: {} });
  const oi  = makeOcIdx(outcomes);
  const wins = buildWins(ledger, oi);
  let found = false;
  for (const [k, ocs] of Object.entries(wins)) {
    const [model, wt] = k.split('::');
    const win = ocs.slice(-10);
    if (win.length < 5) continue;
    const g  = win.filter(o => o.outcome === 'green').length;
    const rf = win.filter(o => o.outcome === 'refuted').length;
    const gp = g / win.length;
    const pe     = (pol.work_types[wt] || []).find(e => e.model === model);
    const status = pe?.status || 'probation';
    if (status === 'benched') continue;
    let ns = null;
    if (status === 'probation' && gp >= 0.8)            ns = 'proven';
    else if (status === 'proven' && (gp < 0.6 || rf >= 2)) ns = 'probation';
    else if (status === 'probation' && gp < 0.4)         ns = 'benched';
    if (!ns) continue;
    const pid = `${model}::${wt}::${status}->${ns}`;
    if (pid !== cid) continue;
    const ent = { model, status: ns, since: new Date().toISOString(), evidence: `scorecard commit ${pid}` };
    if (pe) Object.assign(pe, ent);
    else { pol.work_types[wt] = pol.work_types[wt] || []; pol.work_types[wt].push(ent); }
    pol.updated = new Date().toISOString();
    writeFileSync(pPath, JSON.stringify(pol, null, 2) + '\n');
    appendFileSync(logPath, `approved: in-chat ${new Date().toISOString()}  change-id:${cid}\n`);
    console.log(`committed: ${cid}`); found = true; break;
  }
  if (!found) { console.error(`commit: no active proposal matches '${cid}'`); process.exit(1); }
}

// ── select ────────────────────────────────────────────────────────────────────
function doSelect(a) {
  const wt  = a['work-type'];
  const fam = a['exclude-family'] || (typeof a['for-model'] === 'string' ? family(a['for-model']) : null);
  if (!wt)  { console.error('select: --work-type is required'); process.exit(1); }
  if (!fam) { console.error('select: --exclude-family or --for-model is required'); process.exit(1); }
  const policy  = rjson(join(DIR, 'routing-policy.json'), { work_types: {} });
  const costs   = loadCosts(DIR);
  const entries = (policy.work_types[wt] || []).filter(e => e.status === 'proven' && family(e.model) !== fam);
  if (!entries.length) {
    process.stderr.write(`select: no cross-family proven model for '${wt}' excluding family '${fam}'\n`);
    process.exit(1);
  }
  if (entries.every(e => costs?.models?.[e.model]?.multiplier != null)) {
    entries.sort((a, b) => costs.models[a.model].multiplier - costs.models[b.model].multiplier);
  }
  console.log(entries[0].model);
}

// ── main ──────────────────────────────────────────────────────────────────────
const [cmd, ...rest] = process.argv.slice(2);
const a = parseArgs(rest);
switch (cmd) {
  case 'record':  doRecord(a); break;
  case 'report':  doReport(a); break;
  case 'propose': doPropose(a); break;
  case 'commit':  doCommit(a); break;
  case 'select':  doSelect(a); break;
  default:
    console.log(`scorecard.mjs <record|report|propose|commit|select> [opts]\n\nselect: --work-type <wt> --exclude-family <fam>  (or --for-model <id>)  → print chosen cross-family proven model\n\n${D4}`);
    if (cmd && cmd !== '--help' && cmd !== 'help') process.exit(1);
}
