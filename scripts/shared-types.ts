/**
 * Shared types for pipeline scripts.
 * Single source of truth -- all scripts import from here.
 *
 * SHARED_PATHS is re-exported from shared-paths.ts (SP-MT-04). Callers keep
 * `import { SHARED_PATHS } from './shared-types'` unchanged; the paths now
 * resolve against clients/${ACTIVE_CLIENT}/... instead of the flat layout.
 */

// ── Queue Types ──

export interface FixScope {
  failedTestIds: string[];           // e.g. ["TC-LOC-LI-020", "TC-LOC-LI-030"]
  failureSummaryPath: string | null; // path to failure-summary.json
  description: string;               // what needs fixing
  failureCategories?: Record<string, number>; // e.g. { "AUTH": 2, "SELECTOR": 1 }
}

export interface QueueItemArtifacts {
  testCaseFile?: string | null;
  testPlanFile?: string | null;
  specFiles?: string[];
  csvExport?: string | null;
  [key: string]: unknown;
}

export interface QueueItemHistory {
  agent?: string;
  action?: string;
  date?: string;
  timestamp?: string;
  notes?: string;
}

export interface UITestingChecklist {
  fieldDiscovery?: boolean;
  dependencyMapping?: boolean;
  boundaryTesting?: boolean;
  errorVerification?: boolean;
  saveReloadCycles?: boolean;
  crossFieldValidation?: boolean;
  errorRecovery?: boolean;
  dialogSymmetry?: boolean;
  selectorReconciliation?: boolean;
  explorationCleanup?: boolean;
  completedAt?: string | null;
}

export interface QueueItem {
  id: string;
  feature?: string;
  module: string;
  stage: string;
  priority?: string;
  lockedBy?: string | null;
  lockedAt?: string | null;
  intent: string;
  userNotes?: string;
  artifacts?: QueueItemArtifacts;
  history?: QueueItemHistory[];
  injectedContext?: InjectedContext | Record<string, unknown>;
  uiTestingChecklist?: UITestingChecklist;
  selfAuditPassed?: boolean;  // Set by agent after passing self-audit checklist
  generatorRunCount?: number; // R10 enforcement: tracks test run invocations per item
  sessionStartedAt?: string;  // ISO timestamp set by generator-pre-run.ts; used by post-complete time metric
  fixScope?: FixScope;        // Failure scope for Generator fix mode
  automatableCount?: number;   // TCs with Automatable: Yes
  totalTcCount?: number;       // All TCs including No/Blocked
  skippedTcIds?: string[];     // TC IDs marked Automatable: No or Blocked
  removedCoverage?: string[];  // TC IDs removed from spec by agent (missing-coverage) -- permanent
  // Audit enforcement gates (Fix 8)
  blocked?: boolean;           // True = item blocked from advancing until audit clears it
  blockedBy?: string;          // Agent/reason that triggered the block (e.g. 'audit', 'healer')
  blockedReason?: string;      // Human-readable explanation of why blocked
  auditCleared?: boolean;      // True = audit agent has reviewed and cleared the block
  // Outcome tracking (Fix 12)
  outcomeTracking?: {
    injectedRuleIds: string[];     // Rules that were active when agent worked this item
    injectedAt: string;            // When context was injected
    completedAt?: string;          // When item was marked completed
    succeeded?: boolean;           // Whether the task passed all gates
    defectsFound?: string[];       // Defect IDs found during audit
    retryCount?: number;           // Number of retry cycles
  };
  // Bug Hunt 4-Category Rulebook fields
  /** Detailed bug hunt classification from classifier. */
  bugHuntCategory?: string;
  /** Reason for escalation when bugHuntCategory is FEATURE_CHANGED_BIG. */
  escalationReason?: string;
  /** True when big feature change blocks this item until prior agents rework. */
  blockedByBigChange?: boolean;
  /** True when prior agent rework is in progress for this item. */
  awaitingPriorAgentRework?: boolean;
  /** Context injected when user force-continues past a big change escalation. */
  forceOverrideContext?: {
    overriddenAt: string;
    overriddenBy: string;
    originalEscalationId: string;
    staleArtifacts: string[];
  };
  // Pipeline handoff context (Phase 2C) -- written by post-complete gates
  completionContext?: {
    phaseCompleted: string;          // Stage that just completed (e.g. 'generation', 'healing')
    artifactsModified: string[];     // File paths modified during this phase
    testsPassed: boolean;            // Whether tests passed (relevant for generation/healing)
    defectsFound: number;            // Count of defects found (relevant for audit)
    recommendedNextStage: string;    // Suggested next stage based on outcome
  };
  [key: string]: unknown;
}

export interface CompletedLogEntry {
  id: string;
  feature: string;
  module: string;
  completedAt: string;
  archivedAt: string;
  historyLength: number;
  artifacts?: Record<string, string>;
  lastAction?: string;
}

/** Per-agent context shared across all queue items for the same agent (avoids 8x duplication) */
export interface SharedAgentContext {
  mistakeIds: string[];
  mistakesRef: string;
  learningsSummary: string[];
  learningsRef: string;
  recentDefects: string[];
  criticalReminders: string[];
  selfAuditQuestions: string[];
  lastRunFailures?: InjectedContext['lastRunFailures'];
}

export interface QueueFile {
  version: string;
  lastUpdated: string;
  config: Record<string, unknown>;
  sharedAgentContext?: Record<string, SharedAgentContext>;
  queue: QueueItem[];
  completedLog?: CompletedLogEntry[];
}

// ── Mistake / Rule Types ──

export interface MistakeRule {
  id: string;
  never: string;
  correct: string;
}

export interface LearningEntry {
  id: string;          // LRN-001
  category: string;    // SELECTOR, TIMING, LOGIC, DATA, SCOPE, FORMAT, NAVIGATION, AUTH
  trigger: string;     // What went wrong (symptom)
  rootCause: string;   // Why it went wrong
  solution: string;    // How to do it correctly
  agent: string;       // Who learned it
  date: string;        // When
}

export interface InjectedContext {
  generatedAt: string;
  targetAgent: string;
  // Compact: ID-only references (agents have full rules via sync:mistakes + §8 Context Self-Load)
  mistakeIds: string[];
  mistakesRef: string;
  // Compact: category + short trigger (full text in learningsRef)
  learningsSummary: string[];
  learningsRef: string;
  // Ref-only: agents read REQUIREMENTS.md directly
  moduleContextRef?: string;
  recentDefects: string[];
  criticalReminders: string[];
  selfAuditQuestions: string[];
  lastRunFailures?: {
    timestamp: string;
    failures: Array<{ testName: string; error: string; selector: string | null }>;
    passed: number;
    failed: number;
    fixme: number;
  };
  // Ref-only: agents read files directly when needed
  testPlanRef?: string;
  existingSpecRef?: string;
  // Normalized selector keys for the item
  selectorKeys?: string[];
  // Auto-detected feature characteristics for this item
  featureTags?: string[];
  // Escalations from other agents pending for this agent
  pendingEscalations?: Array<{
    id: string;
    from: string;
    severity: string;
    summary: string;
    artifacts: string[];
  }>;
  // Deprecated: kept for backward compat during transition, will be removed
  mistakes?: MistakeRule[];
  learnings?: LearningEntry[];
  moduleContext?: string;
  testPlanExcerpt?: string;
  existingSpecExcerpt?: string;
}

// ── Escalation Types ──

export interface EscalationEntry {
  id: string;                    // ESC-001, ESC-002, ...
  createdBy: string;             // agent name: requirements | planner | generator | healer | audit
  createdAt: string;             // ISO timestamp
  pendingFor: string;            // agent name responsible for fixing
  severity: 'error' | 'warning'; // error = blocks correctness, warning = quality improvement
  category: string;              // stale-tc | wrong-selector | missing-coverage | wrong-requirement | logic-error | outdated-artifact
  summary: string;               // one-line: what's wrong (machine-readable, not prose)
  evidence: string;              // what proved it: MCP result, file:line, DOM snapshot ref
  affectedArtifacts: string[];   // file paths that need updating
  status: 'open' | 'resolved' | 'wontfix';
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolution: string | null;     // one-line: what was done to fix it
}

export interface EscalationQueue {
  version: string;
  escalations: EscalationEntry[];
  lastCleaned: string;           // ISO timestamp of last auto-cleanup
}

// ── Shared Constants ──

/**
 * Maps agent-mistakes.md section headers -> sub-agent file basenames.
 * Files live at `.claude/agents/<basename>` (model-agnostic per PLAN_CC_ANTHROPIC_ALIGNMENT Phase 0.1).
 * The legacy `Copilot` section keeps a SKIP value so historical agent-mistakes rows still parse;
 * no Copilot file exists to sync into.
 */
export const AGENT_FILE_MAP: Record<string, string> = {
  'Shared': 'ALL',
  'Copilot': 'SKIP',
  'Requirements': 'REQUIREMENTS.md',
  'Planner': 'PLANNER.md',
  'Generator': 'GENERATOR.md',
  'Healer': 'HEALER.md',
  'Audit': 'AUDIT.md',
  'Framework Maintainer': 'MAINTAINER.md',
  'Copilot Planning Mode': 'SKIP',
};

/** Regex to detect RULES/NEVER DO section boundaries in agent files. */
export const NEVER_DO_PATTERN = /## (?:NEVER DO|RULES)[\s\S]*?(?=\n---|\n## (?!(?:NEVER DO|RULES))|```\n---)/;

/**
 * Common file paths used across pipeline scripts.
 * Delegates to shared-paths.ts — single source of truth for client-aware paths.
 * See scripts/shared-paths.ts for the full key list and the module-load-capture constraint.
 */
export { SHARED_PATHS } from './shared-paths';

// ── Shared Parsing Utilities ──

/**
 * Parse a 3-column mistake table row: `| ID | NEVER | CORRECT |`
 * Returns null if line doesn't match.
 */
/**
 * Escape-aware markdown table cell splitter.
 * Replaces `\|` (escaped pipe inside cells) with a placeholder before splitting
 * on `|`, then restores literal `|` in each cell value.
 */
function splitMdTableRow(line: string): string[] {
  const PLACEHOLDER = '\x00PIPE\x00';
  const safe = line.replace(/\\\|/g, PLACEHOLDER);
  return safe.split('|').map(cell => cell.split(PLACEHOLDER).join('|').trim());
}

export function parseMistakeRow(line: string): MistakeRule | null {
  if (!line.trimStart().startsWith('|')) return null;
  const cells = splitMdTableRow(line).filter(c => c !== '');
  if (cells.length < 3) return null;
  const id = cells[0]!;
  if (!/^[A-Z]+-\d+[A-Z]?$/.test(id)) return null;
  return { id, never: cells[1]!, correct: cells[2]! };
}

/**
 * Parse a 2-column mistake table row: `| ID | NEVER |`
 * Returns [id, text] or null.
 */
export function parseCompactMistakeRow(line: string): [string, string] | null {
  if (!line.trimStart().startsWith('|')) return null;
  const cells = splitMdTableRow(line).filter(c => c !== '');
  if (cells.length < 2) return null;
  const id = cells[0]!;
  if (!/^[A-Z]+-\d+[A-Z]?$/.test(id)) return null;
  return [id, cells[1]!];
}

/**
 * Extract a `## SectionName` block from markdown content.
 * Returns the full section text or empty string if not found.
 */
export function extractMarkdownSection(content: string, sectionName: string): string {
  const pattern = new RegExp(`## ${sectionName}[\\s\\S]*?(?=\\n## |$)`);
  const match = content.match(pattern);
  return match ? match[0] : '';
}

/**
 * Parse a learning table row: `| ID | Category | Trigger | Root Cause | Solution | Agent | Date |`
 * Handles escaped pipes (`\|`) inside cell content (e.g. PowerShell pipeline commands).
 */
export function parseLearningRow(line: string): LearningEntry | null {
  if (!line.trimStart().startsWith('|')) return null;
  const cells = splitMdTableRow(line).filter(c => c !== '');
  if (cells.length < 7) return null;
  const id = cells[0]!;
  if (!/^LRN-\d+$/.test(id)) return null;
  // If there are extra cells (embedded unescaped pipes), rejoin middle columns into solution
  // Expected: [id, category, trigger, rootCause, solution..., agent, date]
  const agent = cells[cells.length - 2]!;
  const date = cells[cells.length - 1]!;
  const solution = cells.slice(4, cells.length - 2).join(' | ');
  return {
    id,
    category: cells[1]!,
    trigger: cells[2]!,
    rootCause: cells[3]!,
    solution,
    agent,
    date,
  };
}
