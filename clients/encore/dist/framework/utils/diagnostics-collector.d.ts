import type { Page } from '@playwright/test';
import { FailureCategory, type NetworkFailure, type ConsoleEntry, type AuthChainEntry, type DiagnosticSnapshot, type UrlBreadcrumb, type HarEntry } from '../framework-contracts/diagnostics';
export declare class DiagnosticsCollector {
    private readonly page;
    private consoleEntries;
    private networkFailures;
    private pageErrors;
    private urlHistory;
    private urlBreadcrumbs;
    private authChain;
    private allResponses;
    constructor(page: Page);
    private attachListeners;
    recordUrl(): void;
    getNetworkFailures(): NetworkFailure[];
    getConsoleErrors(): ConsoleEntry[];
    getConsoleLogs(): ConsoleEntry[];
    getUrlBreadcrumbs(): UrlBreadcrumb[];
    getAuthChain(): AuthChainEntry[];
    captureHar(): HarEntry[];
    captureDomState(): Promise<string>;
    getNetworkErrorSummary(): string;
    getSnapshot(): DiagnosticSnapshot;
    generateErrorContext(testName: string, failingSelector?: string | null): Promise<string>;
    classifyFailure(errorMsg: string): FailureCategory;
}
export declare function attachDiagnostics(page: Page): DiagnosticsCollector;
