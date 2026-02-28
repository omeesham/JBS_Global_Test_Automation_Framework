#!/usr/bin/env ts-node
/**
 * Task Context Builder - Injects relevant mistakes + system prompts into queue tasks.
 * 
 * For each queue item, this script:
 * 1. Identifies the target agent (based on stage)
 * 2. Extracts relevant mistake rules for that agent
 * 3. Extracts relevant system prompts from AGENT_SHARED_RULES.md
 * 4. Includes module-specific context from REQUIREMENTS.md
 * 5. Builds an "injectedContext" object attached to the queue item
 * 
 * This ensures agents have ALL relevant info when working on a task,
 * without needing to remember or look up rules manually.
 * 
 * Usage: npm run build:context [--queue-item-id]
 * Exit: 0 = success, 1 = error
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MistakeRule, InjectedContext, QueueItem, QueueFile, SharedAgentContext,
  SHARED_PATHS, parseMistakeRow, extractMarkdownSection,
} from './shared-types';

const PATHS = SHARED_PATHS;

// Map module names to their actual REQUIREMENTS.md section headings
const MODULE_SECTION_MAP: { [module: string]: string[] } = {
  'locations': [
    'Setup Module',
    'Local Information Tab',
    'Field Validation Rules',
    'Legal Data Validations',
    'Currency Tab',
    'Pricing Tab',
    'Left Panel',
    'Legal Tab',
    'Account and Address Tab',
    'Notes Tab',
    'Shared Setup Locations Tab',
    'Auto Add-On Tab',
    'Location Management History',
  ],
};

// Cross-inject: extra mistake sections pulled for an agent beyond its own section.
// Fixes orphaned rules (e.g. "Planning Mode" rules never reaching any agent).
const CROSS_INJECT_SECTIONS: { [agent: string]: string[] } = {
  'Planner': ['Planning Mode'],
};

// Individual rules from OTHER sections that should also be injected for an agent.
// Use when an agent edits code owned by another agent's section.
const CROSS_INJECT_RULES: { [agent: string]: string[] } = {
  'Planner': ['COP-013'],
};

// Map queue stages to agent sections in mistakes registry
const STAGE_TO_AGENT: { [stage: string]: string } = {
  'pending_requirements': 'Requirements',
  'requirements': 'Requirements',
  'pending_planning': 'Planner',
  'planning': 'Planner',
  'pending_generation': 'Generator',
  'generation': 'Generator',
  'testing': 'Generator',
  'pending_healing': 'Healer',
  'healing': 'Healer',
  'completed': 'Audit',
  'fixme': 'Healer',
};

// Critical reminders & self-audit questions -- loaded from config to separate prompt text from build logic
const promptConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'context-builder-prompts.json'), 'utf-8'));
const CRITICAL_REMINDERS: { [agent: string]: string[] } = promptConfig.criticalReminders;
const SELF_AUDIT_QUESTIONS: { [agent: string]: string[] } = promptConfig.selfAuditQuestions;

function parseMistakesForAgent(agent: string): MistakeRule[] {
  if (!fs.existsSync(PATHS.mistakes)) return [];
  
  const content = fs.readFileSync(PATHS.mistakes, 'utf-8');
  const rules: MistakeRule[] = [];
  
  // Agent-specific rules only (shared ALL-001..004 are referenced via line in agent files)
  const sectionText = extractMarkdownSection(content, agent);
  
  if (sectionText) {
    const lines = sectionText.split('\n');
    for (const line of lines) {
      const parsed = parseMistakeRow(line);
      if (parsed) {
        rules.push(parsed);
      }
    }
  }
  
  // Cross-inject: pull rules from additional sections (e.g. "Planning Mode" -> Planner)
  const crossSections = CROSS_INJECT_SECTIONS[agent] || [];
  for (const section of crossSections) {
    const crossText = extractMarkdownSection(content, section);
    if (crossText) {
      const seenIds = new Set(rules.map(r => r.id));
      for (const line of crossText.split('\n')) {
        const parsed = parseMistakeRow(line);
        if (parsed && !seenIds.has(parsed.id)) {
          rules.push(parsed);
          seenIds.add(parsed.id);
        }
      }
    }
  }
  
  // Cross-inject individual rules from other sections
  const crossRuleIds = CROSS_INJECT_RULES[agent] || [];
  if (crossRuleIds.length > 0) {
    const seenIds = new Set(rules.map(r => r.id));
    const allLines = content.split('\n');
    for (const line of allLines) {
      const parsed = parseMistakeRow(line);
      if (parsed && crossRuleIds.includes(parsed.id) && !seenIds.has(parsed.id)) {
        rules.push(parsed);
        seenIds.add(parsed.id);
      }
    }
  }
  
  return rules;
}

function getRecentDefects(agent: string): string[] {
  if (!fs.existsSync(PATHS.performance)) return [];
  
  try {
    const content = fs.readFileSync(PATHS.performance, 'utf-8');
    const perf = JSON.parse(content);
    const agentKey = agent.toLowerCase();
    
    if (perf.agents && perf.agents[agentKey] && perf.agents[agentKey].defects) {
      return perf.agents[agentKey].defects
        .filter((d: { resolved?: boolean }) => !d.resolved)
        .slice(0, 5)
        .map((d: { id: string; description: string }) => `${d.id}: ${d.description}`);
    }
  } catch {
    // Ignore parse errors
  }
  
  return [];
}

/** Build shared context for an agent (cached per agent, stored once at queue level) */
function buildSharedAgentContext(agent: string): SharedAgentContext {
  const agentLower = agent.toLowerCase();
  const allMistakes = parseMistakesForAgent(agent);

  // Extract resolution entries from mistake rules (learnings merged into Resolution column)
  const resolutions = allMistakes
    .filter(r => r.correct && r.correct !== '-' && r.correct.trim() !== '')
    .map(r => `${r.id}: ${r.correct.substring(0, 80)}${r.correct.length > 80 ? '...' : ''}`);

  const shared: SharedAgentContext = {
    mistakeIds: allMistakes.map(r => r.id),
    mistakesRef: `specs_planning/agent-mistakes.md (${allMistakes.length} rules)`,
    learningsSummary: resolutions.slice(0, 10),
    learningsRef: 'specs_planning/agent-mistakes.md (Resolution column)',
    recentDefects: getRecentDefects(agentLower),
    criticalReminders: CRITICAL_REMINDERS[agent] || [],
    selfAuditQuestions: SELF_AUDIT_QUESTIONS[agent] || [],
  };

  // Failure data
  const failureSummaryPath = path.join(__dirname, '../reports/failure-summary.json');
  if (fs.existsSync(failureSummaryPath)) {
    try {
      const failureData = JSON.parse(fs.readFileSync(failureSummaryPath, 'utf-8'));
      shared.lastRunFailures = {
        timestamp: failureData.timestamp ?? new Date().toISOString(),
        failures: (failureData.failures ?? []).map((f: { testName?: string; error?: string; selector?: string | null }) => ({
          testName: f.testName ?? '',
          error: f.error ?? '',
          selector: f.selector ?? null,
        })),
        passed: failureData.passed ?? 0,
        failed: failureData.failed ?? 0,
        fixme: failureData.fixme ?? 0,
      };
    } catch { /* ignore */ }
  }

  return shared;
}

/** Build per-item context (item-specific + agent-shared data inlined for non-empty fields) */
function buildContextForItem(item: QueueItem, shared: SharedAgentContext): InjectedContext {
  const agent = STAGE_TO_AGENT[item.stage] || 'Planner';

  // Determine correct module context ref for THIS item (not copy-paste)
  const moduleLower = item.module.toLowerCase();
  const featureLower = (item.feature || '').toLowerCase();
  let moduleRef = `docs/REQUIREMENTS.md ## ${item.module}`;
  
  if (MODULE_SECTION_MAP[moduleLower]) {
    // Find the best matching section for this specific item's feature
    const sections = MODULE_SECTION_MAP[moduleLower]!;
    const matchedSection = sections.find(s => 
      featureLower.includes(s.toLowerCase().replace(/ /g, '-')) ||
      s.toLowerCase().includes(featureLower.replace(/-/g, ' '))
    );
    moduleRef = matchedSection 
      ? `docs/REQUIREMENTS.md ### ${matchedSection}`
      : `docs/REQUIREMENTS.md ### ${sections[0]}`;
  }

  // Inline agent-shared data into per-item context (no empty arrays with pointer strings)
  const context: InjectedContext = {
    generatedAt: new Date().toISOString(),
    targetAgent: agent,
    mistakeIds: shared.mistakeIds,
    mistakesRef: shared.mistakesRef,
    learningsSummary: shared.learningsSummary,
    learningsRef: shared.learningsRef,
    recentDefects: shared.recentDefects,
    criticalReminders: shared.criticalReminders,
    selfAuditQuestions: shared.selfAuditQuestions,
    moduleContextRef: moduleRef,
  };

  // Per-item: file refs
  const testPlanFile = item.artifacts?.testPlanFile;
  if (testPlanFile && typeof testPlanFile === 'string') {
    const testPlanPath = path.isAbsolute(testPlanFile) ? testPlanFile : path.join(__dirname, '..', testPlanFile);
    if (fs.existsSync(testPlanPath)) {
      context.testPlanRef = testPlanFile;
    }
  }

  const specFiles = item.artifacts?.specFiles;
  if (specFiles && Array.isArray(specFiles) && specFiles.length > 0 && specFiles[0]) {
    const specPath = path.isAbsolute(specFiles[0]) ? specFiles[0] : path.join(__dirname, '..', specFiles[0]);
    if (fs.existsSync(specPath)) {
      context.existingSpecRef = specFiles[0];
    }
  }

  // Per-item: normalize selectorKeys to array format
  const selectorKeys = item.selectorKeys as unknown;
  if (selectorKeys) {
    if (typeof selectorKeys === 'string') {
      context.selectorKeys = selectorKeys.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(selectorKeys)) {
      context.selectorKeys = selectorKeys;
    }
  }

  // Per-item: last run failures if available
  if (shared.lastRunFailures) {
    context.lastRunFailures = shared.lastRunFailures;
  }

  return context;
}

function formatContextForDisplay(context: InjectedContext, shared?: SharedAgentContext): string {
  let output = '';
  
  output += `\n### Context for ${context.targetAgent} (generated ${context.generatedAt})\n\n`;

  // Use shared context for agent-level fields, fall back to per-item if no shared
  const selfAuditQ = shared?.selfAuditQuestions ?? context.selfAuditQuestions;
  const reminders = shared?.criticalReminders ?? context.criticalReminders;
  const defects = shared?.recentDefects ?? context.recentDefects;
  const learnSummary = shared?.learningsSummary ?? context.learningsSummary;
  const learnRef = shared?.learningsRef ?? context.learningsRef;
  const mistakeIds = shared?.mistakeIds ?? context.mistakeIds;
  const mistakeRef = shared?.mistakesRef ?? context.mistakesRef;
  
  // Self-audit questions FIRST
  if (selfAuditQ.length > 0) {
    output += '**[?] SELF-AUDIT QUESTIONS (answer each BEFORE marking complete):**\n';
    for (let i = 0; i < selfAuditQ.length; i++) {
      output += `${i + 1}. ${selfAuditQ[i]}\n`;
    }
    output += '\n';
  }
  
  if (reminders.length > 0) {
    output += '**[WARN] CRITICAL REMINDERS:**\n';
    for (const reminder of reminders) {
      output += `- ${reminder}\n`;
    }
    output += '\n';
  }
  
  if (defects.length > 0) {
    output += '**[!!] RECENT DEFECTS (avoid repeating):**\n';
    for (const defect of defects) {
      output += `- ${defect}\n`;
    }
    output += '\n';
  }
  
  if (learnSummary.length > 0) {
    output += `**[LEARN] RESOLUTIONS (${learnSummary.length} patterns -- full: ${learnRef}):**\n`;
    for (const l of learnSummary) {
      output += `- ${l}\n`;
    }
    output += '\n';
  }
  
  if (mistakeIds.length > 0) {
    output += `**RULES (${mistakeIds.length}): ${mistakeIds.join(', ')}**\n`;
    output += `Full text: ${mistakeRef}\n\n`;
  }
  
  if (context.moduleContextRef) {
    output += `**MODULE CONTEXT:** ${context.moduleContextRef}\n\n`;
  }
  
  return output;
}

function main() {
  const targetId = process.argv[2]; // Optional: specific queue item ID
  const outputFormat = process.argv.includes('--json') ? 'json' : 'display';
  
  console.log('='.repeat(60));
  console.log('Task Context Builder');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(PATHS.queue)) {
    console.error(`[ERR] Queue file not found: ${PATHS.queue}`);
    process.exit(1);
  }
  
  const queueContent = fs.readFileSync(PATHS.queue, 'utf-8');
  const queue: QueueFile = JSON.parse(queueContent);
  
  // ── Build shared agent context (once per agent, stored at queue level) ──
  const agentsNeeded = new Set<string>();
  for (const item of queue.queue) {
    if (item.stage === 'completed' && !targetId) continue;
    if (targetId && item.id !== targetId) continue;
    agentsNeeded.add(STAGE_TO_AGENT[item.stage] || 'Planner');
  }

  const sharedCtx: Record<string, SharedAgentContext> = {};
  for (const agent of agentsNeeded) {
    sharedCtx[agent] = buildSharedAgentContext(agent);
    console.log(`\nShared context for ${agent}: ${sharedCtx[agent].mistakeIds.length} mistakes, ${sharedCtx[agent].learningsSummary.length} learnings`);
  }
  queue.sharedAgentContext = sharedCtx;

  // ── Build per-item context (item-specific data only) ──
  let itemsProcessed = 0;
  
  for (const item of queue.queue) {
    if (item.stage === 'completed' && !targetId) continue;
    if (targetId && item.id !== targetId) continue;
    
    console.log(`  Building item context: ${item.id} (stage: ${item.stage})`);
    const agent = STAGE_TO_AGENT[item.stage] || 'Planner';
    const shared = sharedCtx[agent] ?? buildSharedAgentContext(agent);
    const context = buildContextForItem(item, shared);
    item.injectedContext = context;
    itemsProcessed++;

    // Outcome tracking: record which rules were injected (Fix 12)
    item.outcomeTracking = {
      ...(item.outcomeTracking || {}),
      injectedRuleIds: shared.mistakeIds,
      injectedAt: context.generatedAt,
      // Preserve existing outcome data (completedAt, succeeded, defectsFound set by post-complete/audit)
      completedAt: item.outcomeTracking?.completedAt as string | undefined,
      succeeded: item.outcomeTracking?.succeeded as boolean | undefined,
      defectsFound: item.outcomeTracking?.defectsFound as string[] | undefined,
      retryCount: (item.outcomeTracking?.retryCount as number) ?? 0,
    };
    
    if (outputFormat === 'display') {
      console.log(formatContextForDisplay(context, sharedCtx[context.targetAgent]));
    } else {
      console.log(JSON.stringify(context, null, 2));
    }
  }
  
  // Save updated queue
  queue.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PATHS.queue, JSON.stringify(queue, null, 2), 'utf-8');
  
  console.log('\n' + '='.repeat(60));
  console.log(`[OK] Context built for ${itemsProcessed} queue item(s), ${agentsNeeded.size} shared agent context(s)`);
  console.log(`   Queue saved to: ${PATHS.queue}`);
  process.exit(0);
}

main();
