#!/usr/bin/env ts-node
/**
 * Validate Agent Sync - Ensures registry rules match agent file NEVER DO sections.
 * Also validates SYNC marker consistency and R## rule subsets.
 * 
 * Compares specs_planning/agent-mistakes.md against .github/agents/*.agent.md
 * Reports any drift or missing rules.
 * 
 * Usage: npm run validate:sync
 * Exit: 0 = in sync, 1 = drift detected
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AGENT_FILE_MAP, NEVER_DO_PATTERN, SHARED_PATHS,
  parseCompactMistakeRow,
} from './shared-types';

interface ValidationResult {
  agent: string;
  registryCount: number;
  agentFileCount: number;
  missing: string[];
  extra: string[];
  contentMismatch: string[];
  status: 'ok' | 'drift' | 'error';
}

const REGISTRY_PATH = SHARED_PATHS.mistakes;
const AGENTS_DIR = SHARED_PATHS.agentsDir;

function parseRegistryRules(content: string, sectionName: string): Map<string, string> {
  const rules = new Map<string, string>();
  const sectionPattern = new RegExp(`## ${sectionName}[\\s\\S]*?(?=\\n## |$)`);
  const match = content.match(sectionPattern);
  
  if (!match) return rules;
  
  const lines = match[0].split('\n');
  for (const line of lines) {
    const parsed = parseCompactMistakeRow(line);
    if (parsed) {
      rules.set(parsed[0], parsed[1]);
    }
  }
  
  return rules;
}

function parseAgentFileRules(filePath: string): Map<string, string> {
  const rules = new Map<string, string>();
  
  if (!fs.existsSync(filePath)) return rules;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(NEVER_DO_PATTERN);
  
  if (!match) return rules;
  
  const lines = match[0].split('\n');
  for (const line of lines) {
    const parsed = parseCompactMistakeRow(line);
    if (parsed) {
      rules.set(parsed[0], parsed[1]);
    }
  }
  
  return rules;
}

function validateAgent(
  registryContent: string,
  sectionName: string,
  agentFile: string,
  sharedRules: Map<string, string>
): ValidationResult {
  const result: ValidationResult = {
    agent: sectionName,
    registryCount: 0,
    agentFileCount: 0,
    missing: [],
    extra: [],
    contentMismatch: [],
    status: 'ok',
  };
  
  const filePath = path.join(AGENTS_DIR, agentFile);
  
  if (!fs.existsSync(filePath)) {
    result.status = 'error';
    return result;
  }
  
  const registryRules = parseRegistryRules(registryContent, sectionName);
  const agentRules = parseAgentFileRules(filePath);
  
  // Expected = agent-specific rules only (shared rules are referenced via line, not duplicated)
  const expectedRules = registryRules;
  
  result.registryCount = expectedRules.size;
  result.agentFileCount = agentRules.size;
  
  // Find missing rules (in expected but not in agent file)
  for (const [id] of expectedRules) {
    if (!agentRules.has(id)) {
      result.missing.push(id);
    }
  }
  
  // Find extra rules (in agent file but not in expected)
  for (const id of agentRules.keys()) {
    if (!expectedRules.has(id)) {
      result.extra.push(id);
    }
  }

  // Find content mismatches (same ID, different text)
  // Allow truncated matches: agent text ending in "..." is valid if registry starts with it
  for (const [id, expectedText] of expectedRules) {
    const agentText = agentRules.get(id);
    if (agentText && agentText !== expectedText) {
      const isTruncated = agentText.endsWith('...') && expectedText.startsWith(agentText.slice(0, -3));
      if (!isTruncated) {
        result.contentMismatch.push(`${id}: registry="${expectedText}" vs agent="${agentText}"`);
      }
    }
  }
  
  if (result.missing.length > 0 || result.extra.length > 0 || result.contentMismatch.length > 0) {
    result.status = 'drift';
  }
  
  return result;
}

// ── SYNC Marker Drift Detection ──

/** Extract content between SYNC markers from a file. Returns null if markers not found. */
function extractSyncBlock(content: string, markerId: string): string | null {
  const pattern = new RegExp(`<!-- SYNC:${markerId}:START -->([\\s\\S]*?)<!-- SYNC:${markerId}:END -->`, 'm');
  const match = content.match(pattern);
  return match ? match[1]!.trim() : null;
}

/** Map of SYNC marker IDs to their canonical source files (relative to project root). */
const SYNC_MARKER_SOURCES: Record<string, { canonical: string; targets: string[] }> = {
  'PIPELINE': {
    canonical: '.github/copilot-instructions.md',
    targets: [],  // copilot-instructions IS the canonical; no external targets synced yet
  },
  'COMMANDS': {
    canonical: '.github/copilot-instructions.md',
    targets: [],
  },
  'MCP_CRITICAL': {
    canonical: 'docs/read_only_docs/MCP_BROWSER_GUIDE.md',
    targets: ['.github/copilot-instructions.md'],
  },
  'NEVER_DO': {
    canonical: '.github/copilot-instructions.md',
    targets: [],  // NEVER DO sync is handled separately by sync:mistakes
  },
  'CONTEXT_LOAD': {
    canonical: 'docs/read_only_docs/AGENT_SHARED_RULES.md',
    targets: [
      '.github/agents/playwright-requirements.agent.md',
      '.github/agents/playwright-test-planner.agent.md',
      '.github/agents/playwright-test-generator.agent.md',
      '.github/agents/playwright-test-healer.agent.md',
      '.github/agents/playwright-pipeline-audit.agent.md',
    ],
  },
};

interface MarkerValidationResult {
  markerId: string;
  file: string;
  status: 'ok' | 'missing' | 'drift';
  details?: string;
}

function validateSyncMarkers(): MarkerValidationResult[] {
  const results: MarkerValidationResult[] = [];
  const rootDir = path.join(__dirname, '..');

  for (const [markerId, config] of Object.entries(SYNC_MARKER_SOURCES)) {
    // Check canonical file has the marker
    const canonicalPath = path.join(rootDir, config.canonical);
    if (!fs.existsSync(canonicalPath)) {
      results.push({ markerId, file: config.canonical, status: 'missing', details: 'Canonical file not found' });
      continue;
    }
    const canonicalContent = fs.readFileSync(canonicalPath, 'utf-8');
    const canonicalBlock = extractSyncBlock(canonicalContent, markerId);
    if (!canonicalBlock) {
      results.push({ markerId, file: config.canonical, status: 'missing', details: 'Markers not found in canonical file' });
      continue;
    }
    results.push({ markerId, file: config.canonical, status: 'ok' });

    // For each target, verify markers exist (content drift checking is informational only)
    for (const targetFile of config.targets) {
      const targetPath = path.join(rootDir, targetFile);
      if (!fs.existsSync(targetPath)) {
        results.push({ markerId, file: targetFile, status: 'missing', details: 'Target file not found' });
        continue;
      }
      const targetContent = fs.readFileSync(targetPath, 'utf-8');
      const targetBlock = extractSyncBlock(targetContent, markerId);
      if (!targetBlock) {
        results.push({ markerId, file: targetFile, status: 'missing', details: 'Markers not found in target file' });
      } else if (targetBlock !== canonicalBlock) {
        results.push({ markerId, file: targetFile, status: 'drift', details: `Content differs from canonical (${config.canonical}). Run: npm run sync:mistakes` });
      } else {
        results.push({ markerId, file: targetFile, status: 'ok' });
      }
    }
  }

  return results;
}

// ── R## Subset Validation ──

/** Maps agent file names to their R## subset (from AGENT_RULES declarations in agent-mistakes.md). */
function parseRuleSubsets(registryContent: string): Map<string, string[]> {
  const subsets = new Map<string, string[]>();
  const pattern = /AGENT_RULES:(\w+)\s*=\s*([\w,]+)/g;
  let match;
  while ((match = pattern.exec(registryContent)) !== null) {
    const agentKey = match[1]!;
    const rules = match[2]!.split(',').map(r => r.trim());
    subsets.set(agentKey, rules);
  }
  return subsets;
}

/** Map agent keys from AGENT_RULES to agent file names. */
const AGENT_KEY_TO_FILE: Record<string, string> = {
  'requirements': 'playwright-requirements.agent.md',
  'planner': 'playwright-test-planner.agent.md',
  'generator': 'playwright-test-generator.agent.md',
  'healer': 'playwright-test-healer.agent.md',
  'audit': 'playwright-pipeline-audit.agent.md',
};

interface RuleSubsetResult {
  agent: string;
  expected: string[];
  actual: string[];
  missing: string[];
  extra: string[];
  status: 'ok' | 'drift';
}

function validateRuleSubsets(registryContent: string): RuleSubsetResult[] {
  const results: RuleSubsetResult[] = [];
  const subsets = parseRuleSubsets(registryContent);

  for (const [agentKey, expectedRules] of subsets) {
    const agentFile = AGENT_KEY_TO_FILE[agentKey];
    if (!agentFile) continue;

    const filePath = path.join(AGENTS_DIR, agentFile);
    if (!fs.existsSync(filePath)) {
      results.push({ agent: agentKey, expected: expectedRules, actual: [], missing: expectedRules, extra: [], status: 'drift' });
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    // Extract R## codes from the rules table in the agent file
    const rCodePattern = /\|\s*(R\d+)\s*\|/g;
    const actualRules: string[] = [];
    let rMatch;
    while ((rMatch = rCodePattern.exec(content)) !== null) {
      const code = rMatch[1]!;
      if (!actualRules.includes(code)) {
        actualRules.push(code);
      }
    }

    const missing = expectedRules.filter(r => !actualRules.includes(r));
    const extra = actualRules.filter(r => !expectedRules.includes(r));

    results.push({
      agent: agentKey,
      expected: expectedRules,
      actual: actualRules,
      missing,
      extra,
      status: missing.length > 0 || extra.length > 0 ? 'drift' : 'ok',
    });
  }

  return results;
}

// ── Stage Flow Consistency ──

function validateStageFlow(): { status: 'ok' | 'drift'; details: string[] } {
  const rootDir = path.join(__dirname, '..');
  const details: string[] = [];

  // Read canonical stages from schema
  const schemaPath = path.join(rootDir, 'specs_planning/agent-queue.schema.json');
  if (!fs.existsSync(schemaPath)) {
    return { status: 'drift', details: ['Schema file not found'] };
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const canonicalStages: string[] = schema.properties?.queue?.items?.properties?.stage?.enum ?? [];

  if (canonicalStages.length === 0) {
    return { status: 'drift', details: ['Could not parse stages from schema'] };
  }

  // Check copilot-instructions stage flow line
  const ciPath = path.join(rootDir, '.github/copilot-instructions.md');
  if (fs.existsSync(ciPath)) {
    const ciContent = fs.readFileSync(ciPath, 'utf-8');
    for (const stage of canonicalStages) {
      if (!ciContent.includes(stage)) {
        details.push(`copilot-instructions.md missing stage: ${stage}`);
      }
    }
  }

  // Check AGENT_SHARED_RULES stage flow line
  const asrPath = path.join(rootDir, 'docs/read_only_docs/AGENT_SHARED_RULES.md');
  if (fs.existsSync(asrPath)) {
    const asrContent = fs.readFileSync(asrPath, 'utf-8');
    for (const stage of canonicalStages) {
      if (!asrContent.includes(stage)) {
        details.push(`AGENT_SHARED_RULES.md missing stage: ${stage}`);
      }
    }
  }

  return { status: details.length > 0 ? 'drift' : 'ok', details };
}

/**
 * Validates that rule IDs referenced in context-builder-prompts.json
 * exist in agent-mistakes.md or AGENT_SHARED_RULES.md.
 * Returns array of warning strings for orphaned references.
 */
function validatePromptsConfig(registryContent: string): string[] {
  const promptsPath = path.join(__dirname, '..', 'config', 'context-builder-prompts.json');
  if (!fs.existsSync(promptsPath)) return ['Prompts config not found'];

  const config = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));
  const warnings: string[] = [];

  // Collect all known rule IDs from registry (ALL-001, PLN-001, GEN-001, etc.)
  const knownIds = new Set<string>();
  const idPattern = /^[A-Z]{2,4}-\d{3}/;
  for (const line of registryContent.split('\n')) {
    const match = line.match(/\|\s*((?:ALL|COP|REQ|PLN|GEN|HLR|AUD|PMD)-\d{3})\s*\|/);
    if (match && match[1]) knownIds.add(match[1]);
  }

  // Also collect R## codes from AGENT_SHARED_RULES
  const asrPath = path.join(__dirname, '..', 'docs', 'read_only_docs', 'AGENT_SHARED_RULES.md');
  if (fs.existsSync(asrPath)) {
    const asrContent = fs.readFileSync(asrPath, 'utf-8');
    const rMatches = asrContent.matchAll(/\bR(\d{1,2})\b/g);
    for (const m of rMatches) knownIds.add(`R${m[1]}`);
  }

  // Scan all prompts for rule ID references
  for (const section of ['criticalReminders', 'selfAuditQuestions']) {
    const agents = config[section] || {};
    for (const [agent, entries] of Object.entries(agents)) {
      for (const entry of entries as string[]) {
        // Extract referenced IDs like PLN-041, ALL-013, R27
        const refs = entry.matchAll(/\b((?:ALL|COP|REQ|PLN|GEN|HLR|AUD|PMD)-\d{3}|R\d{1,2})\b/g);
        for (const ref of refs) {
          const refId = ref[1];
          if (refId && !knownIds.has(refId)) {
            warnings.push(`${section}.${agent}: references ${refId} -- not found in registry`);
          }
        }
      }
    }
  }

  return warnings;
}

function main() {
  console.log('='.repeat(60));
  console.log('Agent Sync Validation');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`[ERR] Registry not found: ${REGISTRY_PATH}`);
    process.exit(1);
  }
  
  const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  const sharedRules = parseRegistryRules(registryContent, 'Shared');
  const results: ValidationResult[] = [];
  
  for (const [sectionName, agentFile] of Object.entries(AGENT_FILE_MAP)) {
    if (agentFile === 'SKIP' || agentFile === 'copilot' || agentFile === 'ALL') continue;
    results.push(validateAgent(registryContent, sectionName, agentFile, sharedRules));
  }
  
  let hasErrors = false;
  
  console.log('\n--- Validation Results ---\n');
  
  for (const result of results) {
    const icon = result.status === 'ok' ? '[OK]' : result.status === 'drift' ? '[WARN]' : '[ERR]';
    console.log(`${icon} ${result.agent} (${result.registryCount} registry / ${result.agentFileCount} in file)`);
    
    if (result.missing.length > 0) {
      console.log(`   Missing in agent file: ${result.missing.join(', ')}`);
      hasErrors = true;
    }
    
    if (result.extra.length > 0) {
      console.log(`   Extra in agent file (not in registry): ${result.extra.join(', ')}`);
      hasErrors = true;
    }
    
    if (result.contentMismatch.length > 0) {
      console.log(`   Content mismatch:`);
      for (const mismatch of result.contentMismatch) {
        console.log(`     - ${mismatch}`);
      }
      hasErrors = true;
    }
    
    if (result.status === 'error') {
      console.log(`   [ERR] Agent file not found`);
      hasErrors = true;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // ── SYNC Marker Validation ──
  console.log('\n--- SYNC Marker Validation ---\n');
  const markerResults = validateSyncMarkers();
  for (const mr of markerResults) {
    const icon = mr.status === 'ok' ? '[OK]' : mr.status === 'drift' ? '[DRIFT]' : '[WARN]';
    const detail = mr.details ? ` — ${mr.details}` : '';
    console.log(`${icon} SYNC:${mr.markerId} in ${mr.file}${detail}`);
    if (mr.status !== 'ok') hasErrors = true;
  }

  // ── R## Subset Validation ──
  console.log('\n--- R## Subset Validation ---\n');
  const ruleSubsetResults = validateRuleSubsets(registryContent);
  for (const rsr of ruleSubsetResults) {
    const icon = rsr.status === 'ok' ? '[OK]' : '[WARN]';
    console.log(`${icon} ${rsr.agent} (${rsr.expected.length} expected / ${rsr.actual.length} actual)`);
    if (rsr.missing.length > 0) {
      console.log(`   Missing in agent file: ${rsr.missing.join(', ')}`);
      // R## drift is informational for now — don't fail the build
    }
    if (rsr.extra.length > 0) {
      console.log(`   Extra in agent file: ${rsr.extra.join(', ')}`);
    }
  }

  // ── Stage Flow Consistency ──
  console.log('\n--- Stage Flow Consistency ---\n');
  const stageResult = validateStageFlow();
  if (stageResult.status === 'ok') {
    console.log('[OK] Stage flow consistent across all files');
  } else {
    for (const detail of stageResult.details) {
      console.log(`[WARN] ${detail}`);
    }
    // Stage drift is informational — don't fail the build
  }

  // ── Prompts Config Validation ──
  console.log('\n--- Prompts Config Validation ---\n');
  const promptResults = validatePromptsConfig(registryContent);
  if (promptResults.length === 0) {
    console.log('[OK] All referenced rule IDs in prompts config exist in registry');
  } else {
    for (const pr of promptResults) {
      console.log(`[WARN] ${pr}`);
    }
    // Orphaned references are informational — don't fail the build
  }

  console.log('\n' + '='.repeat(60));
  
  if (hasErrors) {
    console.log('[ERR] DRIFT DETECTED - Run `npm run sync:mistakes` to fix');
    process.exit(1);
  } else {
    console.log('[OK] All agents in sync with registry');
    process.exit(0);
  }
}

main();
