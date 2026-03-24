export interface FixScope {
    failedTestIds: string[];
    failureSummaryPath: string | null;
    description: string;
    failureCategories?: Record<string, number>;
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
    selfAuditPassed?: boolean;
    generatorRunCount?: number;
    sessionStartedAt?: string;
    fixScope?: FixScope;
    automatableCount?: number;
    totalTcCount?: number;
    skippedTcIds?: string[];
    removedCoverage?: string[];
    blocked?: boolean;
    blockedBy?: string;
    blockedReason?: string;
    auditCleared?: boolean;
    outcomeTracking?: {
        injectedRuleIds: string[];
        injectedAt: string;
        completedAt?: string;
        succeeded?: boolean;
        defectsFound?: string[];
        retryCount?: number;
    };
    bugHuntCategory?: string;
    escalationReason?: string;
    blockedByBigChange?: boolean;
    awaitingPriorAgentRework?: boolean;
    forceOverrideContext?: {
        overriddenAt: string;
        overriddenBy: string;
        originalEscalationId: string;
        staleArtifacts: string[];
    };
    completionContext?: {
        phaseCompleted: string;
        artifactsModified: string[];
        testsPassed: boolean;
        defectsFound: number;
        recommendedNextStage: string;
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
export interface MistakeRule {
    id: string;
    never: string;
    correct: string;
}
export interface LearningEntry {
    id: string;
    category: string;
    trigger: string;
    rootCause: string;
    solution: string;
    agent: string;
    date: string;
}
export interface InjectedContext {
    generatedAt: string;
    targetAgent: string;
    mistakeIds: string[];
    mistakesRef: string;
    learningsSummary: string[];
    learningsRef: string;
    moduleContextRef?: string;
    recentDefects: string[];
    criticalReminders: string[];
    selfAuditQuestions: string[];
    lastRunFailures?: {
        timestamp: string;
        failures: Array<{
            testName: string;
            error: string;
            selector: string | null;
        }>;
        passed: number;
        failed: number;
        fixme: number;
    };
    testPlanRef?: string;
    existingSpecRef?: string;
    selectorKeys?: string[];
    featureTags?: string[];
    pendingEscalations?: Array<{
        id: string;
        from: string;
        severity: string;
        summary: string;
        artifacts: string[];
    }>;
    mistakes?: MistakeRule[];
    learnings?: LearningEntry[];
    moduleContext?: string;
    testPlanExcerpt?: string;
    existingSpecExcerpt?: string;
}
export interface EscalationEntry {
    id: string;
    createdBy: string;
    createdAt: string;
    pendingFor: string;
    severity: 'error' | 'warning';
    category: string;
    summary: string;
    evidence: string;
    affectedArtifacts: string[];
    status: 'open' | 'resolved' | 'wontfix';
    resolvedBy: string | null;
    resolvedAt: string | null;
    resolution: string | null;
}
export interface EscalationQueue {
    version: string;
    escalations: EscalationEntry[];
    lastCleaned: string;
}
export declare const AGENT_FILE_MAP: Record<string, string>;
export declare const NEVER_DO_PATTERN: RegExp;
export declare const SHARED_PATHS: {
    queue: string;
    mistakes: string;
    learnings: string;
    activityLog: string;
    requirements: string;
    performance: string;
    escalations: string;
    notifications: string;
    testIdInventory: string;
    agentsDir: string;
    exports: string;
    testCases: string;
};
export declare function parseMistakeRow(line: string): MistakeRule | null;
export declare function parseCompactMistakeRow(line: string): [string, string] | null;
export declare function extractMarkdownSection(content: string, sectionName: string): string;
export declare function parseLearningRow(line: string): LearningEntry | null;
