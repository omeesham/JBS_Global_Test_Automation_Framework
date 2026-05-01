export declare enum FailureCategory {
    AUTH = "AUTH",
    NETWORK = "NETWORK",
    SELECTOR = "SELECTOR",
    TIMING = "TIMING",
    APPLICATION = "APPLICATION",
    DATA = "DATA",
    INFRASTRUCTURE = "INFRASTRUCTURE",
    UNKNOWN = "UNKNOWN"
}
export interface NetworkFailure {
    url: string;
    status: number;
    statusText: string;
    body: string;
    timestamp: number;
}
export interface ConsoleEntry {
    type: string;
    text: string;
    location: string;
    timestamp: number;
}
export interface AuthChainEntry {
    url: string;
    status: number;
    redirectedFrom: string | null;
    timestamp: number;
}
export interface UrlBreadcrumb {
    url: string;
    timestamp: number;
}
export declare enum TriageDisposition {
    BUG = "BUG",
    FEATURE_CHANGE = "FEATURE_CHANGE",
    TEST_DEFECT = "TEST_DEFECT",
    UNCERTAIN = "UNCERTAIN"
}
export declare enum TriageConfidence {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare enum BugSeverity {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export interface TriageSignal {
    signalId: string;
    weight: 'strong' | 'moderate' | 'weak';
    direction: TriageDisposition;
    evidence: string;
}
export interface TriageResult {
    disposition: TriageDisposition;
    confidence: TriageConfidence;
    reasoning: string;
    signals: TriageSignal[];
    mcpVerified: boolean;
    tcExpectedValue: string | null;
    actualValue: string | null;
    changeDescription: string | null;
    bugSeverity: BugSeverity | null;
    bugHuntCategory?: BugHuntCategory;
    changeSize?: ChangeSize;
    testIdStatus?: TestIdStatus;
    autonomyDecision?: AutonomyDecision;
}
export interface BugReport {
    id: string;
    testCaseId: string;
    testFile: string;
    module: string;
    feature: string;
    severity: BugSeverity;
    title: string;
    description: string;
    stepsToReproduce: string[];
    expectedBehavior: string;
    actualBehavior: string;
    pageUrl: string;
    screenshotPath: string | null;
    failureCategory: FailureCategory;
    triageResult: TriageResult;
    status: BugStatus;
    createdAt: string;
    queueItemId: string;
    sourceAgent?: string;
    errorHash?: string;
    bugHuntCategory?: BugHuntCategory;
    rcaEvidence?: {
        consoleErrors?: string[];
        networkFailures?: string[];
        domSnippet?: string;
        screenshotUrl?: string;
        traceUrl?: string;
        harEntries?: string[];
    };
    runId?: string;
    confidence?: TriageConfidence;
    updatedAt?: string;
}
export type BugStatus = 'open' | 'confirmed' | 'in_progress' | 'fixed' | 'verified' | 'closed' | 'wont_fix' | 'not_a_bug';
export interface TriageItem {
    testName: string;
    testFile: string;
    pageUrl: string;
    failureCategory: FailureCategory;
    triage: TriageResult;
    whatHappened: string;
    whyItHappened: string;
    whatToDo: string;
}
export interface TriageGroup {
    rootCause: string;
    disposition: TriageDisposition;
    confidence: TriageConfidence;
    severity: BugSeverity | null;
    items: TriageItem[];
}
export interface TriageReport {
    runId: string;
    timestamp: string;
    totalFailures: number;
    groups: TriageGroup[];
    summary: {
        bugs: number;
        featureChanges: number;
        testDefects: number;
        uncertain: number;
    };
    mcpVerificationAvailable: boolean;
}
export interface DiagnosticSnapshot {
    consoleErrors: ConsoleEntry[];
    networkFailures: NetworkFailure[];
    pageErrors: string[];
    urlHistory: string[];
    urlBreadcrumbs: UrlBreadcrumb[];
    authChain: AuthChainEntry[];
    domSnippet?: string;
    harEntries?: HarEntry[];
    domState?: string;
}
export interface HarEntry {
    url: string;
    method: string;
    status: number;
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    requestBody?: string;
    responseBody?: string;
    timestamp: number;
    duration: number;
}
export declare enum BugHuntCategory {
    UNCHANGED_FAILURE = "UNCHANGED_FAILURE",
    FEATURE_CHANGED_SMALL = "FEATURE_CHANGED_SMALL",
    FEATURE_CHANGED_BIG = "FEATURE_CHANGED_BIG",
    TESTID_MISSING = "TESTID_MISSING",
    TESTID_CHANGED = "TESTID_CHANGED",
    FLAKE = "FLAKE",
    INFRASTRUCTURE_TRANSIENT = "INFRASTRUCTURE_TRANSIENT"
}
export declare enum ChangeSize {
    SMALL = "SMALL",
    BIG = "BIG"
}
export declare enum TestIdStatus {
    PRESENT = "PRESENT",
    MISSING = "MISSING",
    CHANGED = "CHANGED"
}
export declare enum AutonomyDecision {
    AUTONOMOUS = "AUTONOMOUS",
    HUMAN_REVIEW = "HUMAN_REVIEW"
}
export declare const BUG_HUNT_TO_DISPOSITION: Record<BugHuntCategory, TriageDisposition>;
export interface AgentNotification {
    id: string;
    fromAgent: string;
    toAgent: string;
    type: 'stale_artifact' | 'selector_change' | 'big_change_escalation';
    affectedFiles: string[];
    changeSummary: string;
    timestamp: string;
    acknowledged: boolean;
}
export interface BugHuntEscalation {
    id: string;
    sourceAgent: string;
    targetAgent: string;
    reason: string;
    changeScopeFiles: string[];
    affectedSelectors: string[];
    blockedItemId: string;
    pageId?: string;
    status: 'open' | 'resolved' | 'overridden' | 'rework_in_progress';
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
}
export interface TestIdTracker {
    selectorKey: string;
    expectedTestId: string;
    actualTestId: string | null;
    status: TestIdStatus;
    lastVerified: string;
    pageUrl: string;
}
export interface BugHuntClassification {
    bugHuntCategory: BugHuntCategory;
    disposition: TriageDisposition;
    changeSize: ChangeSize | null;
    testIdStatus: TestIdStatus | null;
    autonomyDecision: AutonomyDecision;
    confidence: TriageConfidence;
    reasoning: string;
}
