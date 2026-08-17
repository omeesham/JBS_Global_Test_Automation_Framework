#!/usr/bin/env ts-node
/**
 * Sync Agent Mistakes - Injects rules from registry into agent files.
 *
 * Single source of truth: specs_planning/_internal/agent-mistakes.md (NEVER DO rules).
 *
 * NOTE (PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0, 2026-04-27): the original sync targets
 * (`.github/agents/playwright-*.agent.md` + `.github/copilot-instructions.md`) were
 * deleted as part of Copilot eviction. The new model-agnostic sub-agents at
 * `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md` use
 * `@`-references to agent-mistakes.md instead of injected NEVER DO blocks, so they do
 * NOT need this sync. AGENT_CONDENSED + CONTEXT_LOAD_TARGETS are now empty; the
 * MCP_CRITICAL + COMMANDS marker syncs short-circuit when the (deleted) target file
 * is absent. A proper redesign for the new architecture is deferred to a follow-up
 * subplan under PLAN_CC_ANTHROPIC_ALIGNMENT (Phase 3 skill rationalization).
 *
 * Usage: npm run sync:mistakes [--dry-run]
 * Exit: 0 = success, 1 = error
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MistakeRule, AGENT_FILE_MAP, NEVER_DO_PATTERN, SHARED_PATHS,
  parseMistakeRow,
} from './shared-types';
import { frameworkPath } from './shared-paths';

interface AgentRules {
  [agentName: string]: MistakeRule[];
}

const REGISTRY_PATH = SHARED_PATHS.mistakes;
const AGENTS_DIR = SHARED_PATHS.agentsDir;

// Agent-specific condensed format (token-efficient).
// Now empty after Copilot eviction; new .claude/agents/{ROLE}.md sub-agents @-reference
// agent-mistakes.md directly (no injected NEVER DO blocks needed).
const AGENT_CONDENSED: { [key: string]: boolean } = {};

function parseRegistry(): AgentRules {
  const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  const rules: AgentRules = {};
  
  // Split by ## headers
  const sections = content.split(/^## /m).slice(1);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (!lines[0]) continue; // Skip empty sections
    const agentName = lines[0].trim();
    rules[agentName] = [];
    
    // Parse table rows (skip header and separator)
    for (const line of lines.slice(3)) {
      const parsed = parseMistakeRow(line);
      if (parsed) {
        rules[agentName]!.push(parsed);
      }
    }
  }
  
  return rules;
}

// Planner used compact 2-column format historically; empty after Copilot eviction.
const AGENT_COMPACT_FORMAT: { [key: string]: boolean } = {};

/** Compute the highest ALL-NNN ID across agent-mistakes.md shared rules AND AGENT_SHARED_RULES.md. */
function computeHighestAllId(sharedRules: MistakeRule[]): string {
  let maxNum = 0;
  for (const rule of sharedRules) {
    const m = rule.id.match(/^ALL-(\d{3})$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1]!, 10));
  }
  if (fs.existsSync(SHARED_RULES)) {
    const content = fs.readFileSync(SHARED_RULES, 'utf-8');
    for (const m of content.matchAll(/\bALL-(\d{3})\b/g)) {
      maxNum = Math.max(maxNum, parseInt(m[1]!, 10));
    }
  }
  return maxNum > 0 ? `ALL-${String(maxNum).padStart(3, '0')}` : 'ALL-012';
}

function generateNeverDoSection(rules: MistakeRule[], condensed: boolean, compact: boolean, sharedRules: MistakeRule[]): string {
  let output = '## RULES\n\n';
  const lastAllId = computeHighestAllId(sharedRules);
  output += `> Shared rules ALL-001\u2013${lastAllId} apply (see AGENT_SHARED_RULES.md)\n\n`;

  if (compact) {
    // 2-column format (token-efficient, rule only)
    output += '| ID | Rule |\n';
    output += '|----|------|\n';
    for (const rule of rules) {
      const ruleText = rule.never.length > 120 ? rule.never.substring(0, 117) + '...' : rule.never;
      output += `| ${rule.id} | ${ruleText} |\n`;
    }
  } else if (condensed) {
    // 3-column format for agent files (rule + resolution)
    output += '| ID | Rule | Resolution |\n';
    output += '|----|------|------------|\n';
    for (const rule of rules) {
      const ruleText = rule.never.length > 103 ? rule.never.substring(0, 100) + '...' : rule.never;
      const resolution = rule.correct.length > 103 ? rule.correct.substring(0, 100) + '...' : rule.correct;
      output += `| ${rule.id} | ${ruleText} | ${resolution} |\n`;
    }
  } else {
    // Full format
    output += '| ID | Rule | Resolution |\n';
    output += '|----|------|------------|\n';
    for (const rule of rules) {
      output += `| ${rule.id} | ${rule.never} | ${rule.correct} |\n`;
    }
  }
  return output;
}

function injectIntoAgentFile(filePath: string, newSection: string): { changed: boolean; diff: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Find existing NEVER DO section (between ## NEVER DO and next ##)
  const match = content.match(NEVER_DO_PATTERN);
  
  if (!match) {
    return { changed: false, diff: `No NEVER DO section found in ${path.basename(filePath)}` };
  }
  
  const oldSection = match[0];
  const newContent = content.replace(NEVER_DO_PATTERN, newSection.trim());
  
  if (oldSection.trim() === newSection.trim()) {
    return { changed: false, diff: `${path.basename(filePath)}: No changes needed` };
  }
  
  // Generate diff
  const oldLines = oldSection.split('\n').length;
  const newLines = newSection.split('\n').length;
  const diff = `${path.basename(filePath)}: ${oldLines} lines -> ${newLines} lines`;
  
  return { changed: true, diff };
}

// ── SYNC Marker Infrastructure ──
// The original PIPELINE_INSTRUCTIONS / playwright-*.agent.md targets were deleted in the
// Copilot eviction (PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0, 2026-04-27). The constants below
// remain so the sync functions can short-circuit cleanly when files are missing.

const PIPELINE_INSTRUCTIONS = frameworkPath(path.join('.github', 'copilot-instructions.md')); // deleted file; functions short-circuit if absent
const PKG_JSON = frameworkPath('package.json');
const SHARED_RULES = frameworkPath(path.join('docs', 'read_only_docs', 'AGENT_SHARED_RULES.md'));

/** Agent files that receive CONTEXT_LOAD sync (empty after Copilot eviction). */
const CONTEXT_LOAD_TARGETS: string[] = [];

/** Curated commands shown to agents. [displayCmd, scriptKey|null, description] */
const FEATURED_COMMANDS: [string, string | null, string][] = [
  ['npm test', 'test', 'All tests'],
  ['npm run test:chrome', 'test:chrome', 'Chrome only'],
  ['npm run test:headed', 'test:headed', 'UI visible'],
  ['npm run test:debug', 'test:debug', 'Debug mode'],
  ['npm run typecheck', 'typecheck', 'TypeScript validation'],
  ['CI_ENV=staging npm test', null, 'Environment switch'],
  ['npm run build', 'build', 'Compile src/ -> dist/'],
  ['npm run build:clean', 'build:clean', 'Clean + rebuild'],
  ['npm run client:ship', 'client:ship', 'Ship client deliverable'],
  ['npm run lint:testcases', 'lint:testcases', 'Lint test case markdown'],
  ['npm run pipeline:validate', 'pipeline:validate', 'Full validation (sync + queue integrity + lint)'],
  ['npm run planner:post-complete [id]', 'planner:post-complete', 'Rebuild XLSX + validate checklist (hard gate: selfAuditPassed)'],
  ['npm run planner:export-all', 'planner:export-all', 'Rebuild XLSX workbook (covers all pending items)'],
  ['npm run generator:post-complete [id]', 'generator:post-complete', 'Validate spec output (hard gate: no --force bypass)'],
  ['npm run queue:archive', 'queue:archive', 'Archive completed items, prune old log'],
  ['npm run queue:compact', 'queue:compact', 'Also compact active item contexts'],
  ['npm run queue:validate', 'queue:validate', 'Cross-check queue, activity log, performance'],
];

/** Extract content between SYNC markers (exclusive of markers themselves) */
function extractSyncBlock(content: string, markerId: string): string | null {
  const startTag = `<!-- SYNC:${markerId}:START -->`;
  const endTag = `<!-- SYNC:${markerId}:END -->`;
  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1) return null;
  return content.slice(startIdx + startTag.length, endIdx);
}

/** Replace content between SYNC markers, preserving the markers */
function replaceSyncBlock(content: string, markerId: string, newInner: string): string {
  const startTag = `<!-- SYNC:${markerId}:START -->`;
  const endTag = `<!-- SYNC:${markerId}:END -->`;
  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1) return content;
  return content.slice(0, startIdx + startTag.length) + newInner + content.slice(endIdx);
}

/** Build COMMANDS block from curated list, validated against package.json */
function buildCommandsBlock(): string {
  const pkg = JSON.parse(fs.readFileSync(PKG_JSON, 'utf-8'));
  const scripts: Record<string, string> = pkg.scripts || {};
  const warnings: string[] = [];
  const lines: string[] = ['```bash'];
  for (const [cmd, key, desc] of FEATURED_COMMANDS) {
    if (key && !scripts[key]) {
      warnings.push(`  [WARN] COMMANDS: script "${key}" not found in package.json`);
      continue;
    }
    lines.push(`${cmd.padEnd(40)}# ${desc}`);
  }
  lines.push('```');
  for (const w of warnings) console.log(w);
  return '\n' + lines.join('\n') + '\n';
}

/** Sync COMMANDS: generated from curated list -> .github/copilot-instructions.md (deleted; no-op). */
function syncCommands(dryRun: boolean): string {
  if (!fs.existsSync(PIPELINE_INSTRUCTIONS)) return '[WARN] COMMANDS: copilot-instructions.md not found';

  let target = fs.readFileSync(PIPELINE_INSTRUCTIONS, 'utf-8');
  const tgtBlock = extractSyncBlock(target, 'COMMANDS');
  if (tgtBlock === null) return '[WARN] COMMANDS: no SYNC markers in copilot-instructions.md';

  const newBlock = buildCommandsBlock();
  if (tgtBlock.trim() === newBlock.trim()) return '[ok] COMMANDS: copilot-instructions.md in sync';

  if (!dryRun) {
    target = replaceSyncBlock(target, 'COMMANDS', newBlock);
    fs.writeFileSync(PIPELINE_INSTRUCTIONS, target, 'utf-8');
    return '[OK] COMMANDS: copilot-instructions.md synced from package.json';
  }
  return '[~] COMMANDS: drift detected (dry-run, would sync)';
}

/** Sync CONTEXT_LOAD: canonical in AGENT_SHARED_RULES.md -> all 5 agent files */
function syncContextLoad(dryRun: boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(SHARED_RULES)) {
    results.push('[WARN] CONTEXT_LOAD: AGENT_SHARED_RULES.md not found');
    return results;
  }

  const canonical = fs.readFileSync(SHARED_RULES, 'utf-8');
  const srcBlock = extractSyncBlock(canonical, 'CONTEXT_LOAD');
  if (!srcBlock) {
    results.push('[WARN] CONTEXT_LOAD: no SYNC markers in AGENT_SHARED_RULES.md');
    return results;
  }

  for (const agentFile of CONTEXT_LOAD_TARGETS) {
    const filePath = path.join(AGENTS_DIR, agentFile);
    if (!fs.existsSync(filePath)) {
      results.push(`[WARN] CONTEXT_LOAD: ${agentFile} not found`);
      continue;
    }

    let target = fs.readFileSync(filePath, 'utf-8');
    const tgtBlock = extractSyncBlock(target, 'CONTEXT_LOAD');
    if (tgtBlock === null) {
      results.push(`[WARN] CONTEXT_LOAD: no SYNC markers in ${agentFile}`);
      continue;
    }

    if (srcBlock === tgtBlock) {
      results.push(`[ok] CONTEXT_LOAD: ${agentFile} in sync`);
      continue;
    }

    if (!dryRun) {
      target = replaceSyncBlock(target, 'CONTEXT_LOAD', srcBlock);
      fs.writeFileSync(filePath, target, 'utf-8');
      results.push(`[OK] CONTEXT_LOAD: ${agentFile} synced from AGENT_SHARED_RULES.md`);
    } else {
      results.push(`[~] CONTEXT_LOAD: ${agentFile} drift detected (dry-run, would sync)`);
    }
  }

  return results;
}

/** Run all marker syncs, return result messages */
function syncAllMarkers(dryRun: boolean): string[] {
  return [
    syncCommands(dryRun),
    // PIPELINE: canonical was .github/copilot-instructions.md (deleted) — no external targets, skip
    ...syncContextLoad(dryRun),
  ];
}

function syncAgent(agentFile: string, rules: MistakeRule[], dryRun: boolean, sharedRules: MistakeRule[]): string {
  const filePath = path.join(AGENTS_DIR, agentFile);

  if (!fs.existsSync(filePath)) {
    return `[WARN] ${agentFile}: File not found`;
  }

  const condensed = AGENT_CONDENSED[agentFile] || false;
  const compact = AGENT_COMPACT_FORMAT[agentFile] || false;
  const newSection = generateNeverDoSection(rules, condensed, compact, sharedRules);
  const { changed, diff } = injectIntoAgentFile(filePath, newSection);
  
  if (changed && !dryRun) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const newContent = content.replace(NEVER_DO_PATTERN, newSection.trim());
    fs.writeFileSync(filePath, newContent, 'utf-8');
    return `[OK] ${diff} (synced)`;
  } else if (changed) {
    return `[~] ${diff} (dry-run, would sync)`;
  } else {
    return `[ok] ${diff}`;
  }
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  
  console.log('='.repeat(60));
  console.log('Agent Mistakes Sync');
  console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'LIVE'}`);
  console.log('='.repeat(60));
  
  // Parse registry
  const rules = parseRegistry();
  console.log(`\nParsed ${Object.keys(rules).length} agent sections from registry:`);
  for (const [agent, agentRules] of Object.entries(rules)) {
    console.log(`  - ${agent}: ${agentRules.length} rules`);
  }
  
  console.log('\n--- NEVER DO Sync ---\n');
  
  const results: string[] = [];
  
  // Shared rules are referenced via line in each agent file, NOT merged into tables
  const sharedRules = rules['Shared'] || [];
  if (sharedRules.length > 0) {
    console.log(`  -> ${sharedRules.length} Shared rules referenced (not merged) in all agents`);
  }
  
  for (const [agentName, agentFile] of Object.entries(AGENT_FILE_MAP)) {
    if (agentFile === 'SKIP' || agentFile === 'ALL') continue;
    
    const agentRules = rules[agentName] || [];
    // Agent-specific rules only -- shared rules are referenced via line above table
    if (agentRules.length === 0) {
      results.push(`[WARN] ${agentFile}: No rules found in registry for "${agentName}"`);
      continue;
    }
    
    results.push(syncAgent(agentFile, agentRules, dryRun, sharedRules));
  }
  
  for (const result of results) {
    console.log(result);
  }

  // ── SYNC Marker Sync ──
  console.log('\n--- SYNC Marker Sync ---\n');
  const markerResults = syncAllMarkers(dryRun);
  for (const mr of markerResults) {
    console.log(mr);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (dryRun) {
    console.log('Dry-run complete. Run without --dry-run to apply changes.');
  } else {
    console.log('Sync complete.');
  }
  
  process.exit(0);
}

main();
