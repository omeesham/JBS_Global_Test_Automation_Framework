#!/usr/bin/env node
// scripts/check-lr-embed-parity.mjs
// PLAN_CORP_PRICING_REWALK_REMEDIATION — META guard (identity-currency parity).
//
// Every LR rule that MANDATES embedding into a pipeline agent's system prompt must actually be
// embedded there. Post-Copilot-eviction there is NO sync mechanism keeping the agent prompts
// (.claude/agents/*.md) current with the LR rules that name them (`sync-agent-mistakes.ts` is a
// no-op) — a prompt rewrite can silently drop an embed and no gate notices. That is the META miss
// in the Corp Pricing RCA: advisory rules weren't synced into the 5 identities.
//
// This is a CURATED parity registry, NOT a fuzzy rule-body parser (which would be noisy: many rules
// mention an agent in passing without mandating an embed). When a rule body adds an explicit
// "embed in <AGENT>" / "<AGENT> HARD STOP" mandate, add its (lr, agents) row to EMBED_REQUIREMENTS
// below — the check then guarantees that embed never silently rots out of the prompt.
//
// Usage:  node scripts/check-lr-embed-parity.mjs            (exit 1 on any gap, 0 when clean)
//         npm run check:lr-embed-parity
//         node scripts/check-lr-embed-parity.mjs --json

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const AGENTS_DIR = join(REPO_ROOT, '.claude', 'agents');

// identity / pipeline role → prompt filename
const AGENT_FILE = {
  requirements: 'REQUIREMENTS.md',
  planner: 'PLANNER.md',
  generator: 'GENERATOR.md',
  healer: 'HEALER.md',
  audit: 'AUDIT.md',
  maintainer: 'MAINTAINER.md',
};

// CURATED registry of embed-mandated LR rules → the agent prompts that MUST carry them (by LR token).
// Add a row when a rule body adds an "embed in <agent>" / "<agent> HARD STOP" mandate. Seeded from
// the Corp Pricing RCA owner-identity table (M1/M3/M4) plus the already-mandated walk rules.
const EMBED_REQUIREMENTS = [
  { lr: 'LR-061', agents: ['requirements', 'planner', 'generator', 'healer', 'audit'], note: 'verify-before-blocked + positive-control (M1)' },
  { lr: 'LR-060', agents: ['generator', 'healer', 'audit'], note: 'no-red-close test-status deferral (M3)' },
  { lr: 'LR-040', agents: ['requirements', 'planner'], note: 'empty-surface investigation c.1/c.2/c.3 (M4)' },
  { lr: 'LR-062', agents: ['requirements', 'planner', 'audit'], note: 'machine-enumerated walk completeness' },
  { lr: 'LR-064', agents: ['requirements', 'planner', 'audit'], note: 'Tiered Delegated Walk' },
  { lr: 'LR-057', agents: ['requirements', 'planner'], note: 'affordance probe' },
];

function main() {
  const json = process.argv.includes('--json');
  const cache = {};
  const gaps = [];
  let checked = 0;

  if (EMBED_REQUIREMENTS.length === 0) {
    const msg = 'EMBED_REQUIREMENTS registry is empty — expected at least one embed mandate in scripts/check-lr-embed-parity.mjs';
    if (json) process.stdout.write(JSON.stringify({ checked: 0, gaps: [], status: 'FAIL', error: msg }, null, 2) + '\n');
    else console.error(`[FAIL] LR-embed parity: ${msg}`);
    process.exit(1);
  }

  for (const req of EMBED_REQUIREMENTS) {
    for (const agent of req.agents) {
      checked++;
      const file = AGENT_FILE[agent];
      if (!file) { gaps.push({ lr: req.lr, agent, reason: `unknown agent "${agent}" (not in AGENT_FILE map)` }); continue; }
      if (!(agent in cache)) {
        const p = join(AGENTS_DIR, file);
        cache[agent] = existsSync(p) ? readFileSync(p, 'utf-8') : null;
      }
      const body = cache[agent];
      if (body === null) { gaps.push({ lr: req.lr, agent, file, reason: `prompt file missing: ${file}` }); continue; }
      if (!body.includes(req.lr)) {
        gaps.push({ lr: req.lr, agent, file, reason: `embed-mandated ${req.lr} (${req.note}) NOT found in ${file}` });
      }
    }
  }

  if (checked === 0) {
    const msg = `EMBED_REQUIREMENTS has ${EMBED_REQUIREMENTS.length} entries but all have empty agent lists — 0 (lr,agent) pairs checked`;
    if (json) process.stdout.write(JSON.stringify({ checked: 0, gaps: [], status: 'FAIL', error: msg }, null, 2) + '\n');
    else console.error(`[FAIL] LR-embed parity: ${msg}`);
    process.exit(1);
  }

  if (json) {
    process.stdout.write(JSON.stringify({ checked, gaps, status: gaps.length ? 'FAIL' : 'PASS' }, null, 2) + '\n');
  } else if (gaps.length) {
    console.error(`[FAIL] LR-embed parity: ${gaps.length} gap(s) across ${checked} embed-mandated (lr,agent) pairs:`);
    for (const g of gaps) console.error(`  - ${g.lr} -> ${g.agent}: ${g.reason}`);
  } else {
    console.log(`[PASS] LR-embed parity: all ${checked} embed-mandated (lr,agent) pairs present.`);
  }
  process.exit(gaps.length ? 1 : 0);
}

main();
