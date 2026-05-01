import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { FailureCategory, type NetworkFailure, type ConsoleEntry, type AuthChainEntry, type UrlBreadcrumb, type TriageResult } from '../framework-contracts/diagnostics';
export interface FailureEntry {
    testName: string;
    file: string;
    error: string;
    fullError: string;
    selector: string | null;
    duration: number;
    screenshotPath: string | null;
    tracePath: string | null;
    lastActions: string[];
    failureCategory: FailureCategory;
    pageUrl: string;
    workerIndex: number;
    retryAttempt: number;
    consoleErrors: ConsoleEntry[];
    networkFailures: NetworkFailure[];
    pageErrors: string[];
    authChain: AuthChainEntry[];
    domSnippet: string;
    urlBreadcrumbs: UrlBreadcrumb[];
    triage: TriageResult | null;
    bugReportId: string | null;
    bugHuntCategory: string | null;
    testIdStatus: string | null;
    changeSize: string | null;
    failureCount: number;
}
declare class AgentReporter implements Reporter {
    private failures;
    private passedCount;
    private failedCount;
    private fixmeCount;
    private totalDuration;
    onTestEnd(test: TestCase, result: TestResult): void;
    private classifyFailure;
    onEnd(_result: FullResult): void;
}
export default AgentReporter;
