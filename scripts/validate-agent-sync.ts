#!/usr/bin/env ts-node
/**
 * Validate Agent Sync - Verifies each sub-agent file @-references its rule set.
 * Also validates SYNC marker consistency and R## rule subsets.
 *
 * Post-Copilot-eviction (PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0, 2026-04-27) the
 * `.claude/agents/{ROLE}.md` sub-agents no longer embed NEVER DO rule tables; they
 * @-reference `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md`
 * by rule-ID prefix (REQ-*, PLN-*, GEN-*, HLR-*, AUD-*, MNT-*). This validator checks
 * that linkage is intact rather than diffing embedded tables that no longer exist —
 * which is also why `npm run sync:mistakes` is a no-op here (nothing left to inject).
 *
 * Usage: npm run validate:sync
 * Exit: 0 = in sync, 1 = drift detected
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AGENT_FILE_MAP, SHARED_PATHS,
  parseCompactMistakeRow,
} from './shared-types';
import { frameworkPath, frameworkRoot } from './shared-paths';

interface ValidationResult {
  agent: string;
  registryCount: number;   // rules this agent owns in agent-mistakes.md (informational)
  agentFileCount: number;  // @-references to those rules found in the agent file
  missing: string[];       // missing linkage elements (mistakes-file ref, prefix ref)
  status: 'ok' | 'drift' | 'error';
}

const REGISTRY_PATH = SHARED_PATHS.mistakes;
const AGENTS_DIR = SHARED_PATHS.agentsDir;

// === STALE REFERENCE DETECTION ===
// Configurable deny-list of patterns eliminated during consolidations.
// Add new entries here whenever a migration removes identifiers.

interface StaleRefEntry {
  pattern: RegExp;
  replacement: string;
  since: string;
}

const STALE_REFERENCE_DENY_LIST: StaleRefEntry[] = [
  // 2026-03 consolidation: R23-R30 -> consolidated into ALL-*/GEN-*/HLR-*/AUD-* rules
  { pattern: /\bR23\b/, replacement: 'ALL-005 (self-audit checklist)', since: '2026-03-03' },
  { pattern: /\bR24\b/, replacement: 'ALL-003 (search mistakes before retry)', since: '2026-03-03' },
  { pattern: /\bR25\b/, replacement: 'S8 Context Self-Load', since: '2026-03-03' },
  { pattern: /\bR26\b/, replacement: 'ALL-004 (sync after writing rules)', since: '2026-03-03' },
  { pattern: /\bR27\b/, replacement: 'ALL-004 (capture novel patterns)', since: '2026-03-03' },
  { pattern: /\bR28\b/, replacement: 'S12 Phase B (evidence checklist)', since: '2026-03-03' },
  { pattern: /\bR29\b/, replacement: 'ALL-003/ALL-004 (learning yield)', since: '2026-03-03' },
  { pattern: /\bR30\b/, replacement: 'S13 Pre-Flight Competency Gate', since: '2026-03-03' },

  // 2026-03 consolidation: old sub-section numbers merged into S8 Session Protocol
  { pattern: /§9B\b/, replacement: 'S8 Session Protocol', since: '2026-03-03' },
  { pattern: /§9C\b/, replacement: 'S8 Session Protocol', since: '2026-03-03' },
  // NOTE: §15-§18 were reused for new sections after the 2026-03 consolidation.
  // §15=Escalation Routing, §16=Autonomy, §17=Bug Hunting, §18=Module Boundary — all CURRENT.

  // 2026-03 consolidation: agent-learnings.md deprecated (merged into agent-mistakes.md Resolution)
  { pattern: /agent-learnings\.md/, replacement: 'agent-mistakes.md Resolution column', since: '2026-03-03' },
];

// Files to scan (active code only -- exclude plan docs, historical audits, and RCA files)
const STALE_SCAN_DIRS: { dir: string; extensions: string[] }[] = [
  { dir: 'scripts', extensions: ['.ts'] },
  { dir: '.github/agents', extensions: ['.agent.md'] },
  { dir: 'docs/read_only_docs', extensions: ['.md'] },
  { dir: 'src', extensions: ['.ts'] },
  { dir: 'tests', extensions: ['.ts'] },
];

// Individual files to scan (empty after Copilot eviction — original target deleted in
// PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0; new sub-agent files at `.claude/agents/` use
// @-references rather than embedded rule blocks so STALE_SCAN over them is unnecessary).
const STALE_SCAN_FILES: string[] = [];

// Paths to EXCLUDE from scan (historical records, plan documents).
// Stored as repo-root-relative strings (forward slashes) — matched against the same form in scan logic.
const STALE_SCAN_EXCLUDES: string[] = [
  'plans',
  path.relative(frameworkRoot(), SHARED_PATHS.audits).replace(/\\/g, '/'),
  path.relative(frameworkRoot(), SHARED_PATHS.activityLog).replace(/\\/g, '/'),
  'node_modules',
];

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

/** Section header in agent-mistakes.md -> the rule-ID prefix each sub-agent @-references. */
const AGENT_RULE_PREFIX: Record<string, string> = {
  'Requirements': 'REQ',
  'Planner': 'PLN',
  'Generator': 'GEN',
  'Healer': 'HLR',
  'Audit': 'AUD',
  'Framework Maintainer': 'MNT',
};

function validateAgent(
  registryContent: string,
  sectionName: string,
  agentFile: string,
): ValidationResult {
  const result: ValidationResult = {
    agent: sectionName,
    registryCount: 0,
    agentFileCount: 0,
    missing: [],
    status: 'ok',
  };

  const filePath = path.join(AGENTS_DIR, agentFile);

  if (!fs.existsSync(filePath)) {
    result.status = 'error';
    return result;
  }

  // How many rules this agent owns in the registry (informational only).
  result.registryCount = parseRegistryRules(registryContent, sectionName).size;

  const content = fs.readFileSync(filePath, 'utf-8');
  const prefix = AGENT_RULE_PREFIX[sectionName];

  // Linkage contract (post-Copilot-eviction): the agent file must (a) point at
  // agent-mistakes.md and (b) name its own rule-ID prefix, so the rule reference
  // cannot silently rot. Embedded rule tables were removed by design.
  if (!/agent-mistakes\.md/.test(content)) {
    result.missing.push('agent-mistakes.md reference');
  }
  if (prefix) {
    const prefixRef = new RegExp(`\\b${prefix}-(?:\\*|\\d)`);
    if (!prefixRef.test(content)) {
      result.missing.push(`${prefix}-* prefix reference`);
    }
    result.agentFileCount = (content.match(new RegExp(`\\b${prefix}-(?:\\*|\\d{3})`, 'g')) ?? []).length;
  }

  if (result.missing.length > 0) {
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

/** Map of SYNC marker IDs to their canonical source files (relative to project root).
 *
 *  NOTE (PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0, 2026-04-27): the original PIPELINE / COMMANDS /
 *  NEVER_DO / MCP_CRITICAL targets pointed at `.github/copilot-instructions.md` (deleted) and
 *  the playwright-*.agent.md files (deleted). The map is now empty; the only remaining marker
 *  worth tracking (CONTEXT_LOAD) is canonical-only — the new `.claude/agents/{ROLE}.md` files
 *  use `@`-references to AGENT_SHARED_RULES.md instead of injected blocks, so there is nothing
 *  to keep in sync. Re-population is deferred to a follow-up subplan.
 */
const SYNC_MARKER_SOURCES: Record<string, { canonical: string; targets: string[] }> = {};

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

/** Map agent keys from AGENT_RULES to sub-agent file basenames at `.claude/agents/`.
 *  Repointed in PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0.1 (model-agnostic sub-agents). */
const AGENT_KEY_TO_FILE: Record<string, string> = {
  'requirements': 'REQUIREMENTS.md',
  'planner': 'PLANNER.md',
  'generator': 'GENERATOR.md',
  'healer': 'HEALER.md',
  'audit': 'AUDIT.md',
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

  // Read canonical stages from schema (framework-level — same for every client).
  // SP-MT-03 kept schema/template/example files at repo root; only live data (queue,
  // performance, activity log, mistakes) moved into clients/${ACTIVE_CLIENT}/.
  const schemaPath = frameworkPath(path.join('specs_planning', '_internal', 'agent-queue.schema.json'));
  if (!fs.existsSync(schemaPath)) {
    return { status: 'drift', details: ['Schema file not found'] };
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const canonicalStages: string[] = schema.properties?.queue?.items?.properties?.stage?.enum ?? [];

  if (canonicalStages.length === 0) {
    return { status: 'drift', details: ['Could not parse stages from schema'] };
  }

  // (Removed) check of `.github/copilot-instructions.md` stage flow — file deleted in
  // PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0.3 (Copilot eviction). Pipeline stage definitions
  // now live in `config/pipeline-definition.json` and `.claude/agents/{ROLE}.md`.

  // Check AGENT_SHARED_RULES stage flow line
  const asrPath = frameworkPath(path.join('docs', 'read_only_docs', 'AGENT_SHARED_RULES.md'));
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
  const promptsPath = frameworkPath(path.join('config', 'context-builder-prompts.json'));
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
  const asrPath = frameworkPath(path.join('docs', 'read_only_docs', 'AGENT_SHARED_RULES.md'));
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
        // Extract referenced IDs like PLN-041, ALL-013, GEN-008
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

// === Stale Reference Detection Functions ===

interface StaleRefFinding {
  file: string;
  line: number;
  matched: string;
  replacement: string;
  since: string;
}

/** Recursively collect files from a directory matching given extensions. */
function collectFilesFromDir(
  baseDir: string,
  extensions: string[],
  rootDir: string,
): string[] {
  const results: string[] = [];
  const absDir = path.join(rootDir, baseDir);
  if (!fs.existsSync(absDir)) return results;

  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      // Skip excluded directories
      if (STALE_SCAN_EXCLUDES.some(ex => relPath.replace(/\\/g, '/').startsWith(ex))) continue;
      results.push(...collectFilesFromDir(relPath, extensions, rootDir));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(relPath);
    }
  }
  return results;
}

/** Scan active code files for stale references from the deny-list. */
function validateStaleReferences(): StaleRefFinding[] {
  const rootDir = path.join(__dirname, '..');
  const findings: StaleRefFinding[] = [];
  const filesToScan = new Set<string>();

  // Collect files from scan directories
  for (const { dir, extensions } of STALE_SCAN_DIRS) {
    for (const f of collectFilesFromDir(dir, extensions, rootDir)) {
      filesToScan.add(f);
    }
  }

  // Add individual files
  for (const f of STALE_SCAN_FILES) {
    if (fs.existsSync(path.join(rootDir, f))) {
      filesToScan.add(f);
    }
  }

  // Scan each file
  for (const relFile of filesToScan) {
    // Skip excluded paths
    const normalized = relFile.replace(/\\/g, '/');
    if (STALE_SCAN_EXCLUDES.some(ex => normalized.startsWith(ex) || normalized === ex)) continue;

    const absPath = path.join(rootDir, relFile);
    if (!fs.existsSync(absPath)) continue;

    const content = fs.readFileSync(absPath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i]!;
      for (const entry of STALE_REFERENCE_DENY_LIST) {
        if (entry.pattern.test(lineText)) {
          // Reset lastIndex for global-like patterns
          entry.pattern.lastIndex = 0;
          const matchResult = lineText.match(entry.pattern);
          findings.push({
            file: normalized,
            line: i + 1,
            matched: matchResult ? matchResult[0] : entry.pattern.source,
            replacement: entry.replacement,
            since: entry.since,
          });
        }
      }
    }
  }

  return findings;
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
  const results: ValidationResult[] = [];

  for (const [sectionName, agentFile] of Object.entries(AGENT_FILE_MAP)) {
    if (agentFile === 'SKIP' || agentFile === 'ALL') continue;
    results.push(validateAgent(registryContent, sectionName, agentFile));
  }
  
  let hasErrors = false;
  
  console.log('\n--- Validation Results ---\n');
  
  for (const result of results) {
    const icon = result.status === 'ok' ? '[OK]' : result.status === 'drift' ? '[WARN]' : '[ERR]';
    console.log(`${icon} ${result.agent} (owns ${result.registryCount} rules / ${result.agentFileCount} @-refs in file)`);

    if (result.missing.length > 0) {
      console.log(`   Missing linkage: ${result.missing.join(', ')}`);
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

  // ── Orphaned NEVER DO Section Detection ──
  console.log('\n--- Orphaned NEVER DO Detection ---\n');
  const agentFiles = Object.values(AGENT_FILE_MAP).filter(f => f.endsWith('.agent.md'));
  let orphanFound = false;
  for (const agentFile of agentFiles) {
    const filePath = path.join(AGENTS_DIR, agentFile);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const rulesCount = (content.match(/## RULES/g) || []).length;
    const neverDoCount = (content.match(/## NEVER DO/g) || []).length;
    if (rulesCount > 0 && neverDoCount > 0) {
      console.log(`[ERR] ${agentFile}: Has BOTH ## RULES and ## NEVER DO sections. Remove the orphaned ## NEVER DO section.`);
      hasErrors = true;
      orphanFound = true;
    }
    if (rulesCount > 1) {
      console.log(`[ERR] ${agentFile}: Has ${rulesCount} ## RULES sections. Should have exactly 1.`);
      hasErrors = true;
      orphanFound = true;
    }
  }
  if (!orphanFound) {
    console.log('[OK] No orphaned NEVER DO sections found');
  }

  // ── Stale Reference Detection ──
  console.log('\n--- Stale Reference Detection ---\n');
  const staleFindings = validateStaleReferences();
  if (staleFindings.length === 0) {
    console.log('[OK] No stale references found');
  } else {
    console.log(`[WARN] Stale references found: ${staleFindings.length}`);
    for (const f of staleFindings) {
      console.log(`  STALE: ${f.file}:${f.line} -- "${f.matched}" -> use "${f.replacement}" (eliminated ${f.since})`);
    }
    // Informational only -- does not fail the build
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
