"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const diagnostics_1 = require("../framework-contracts/diagnostics");
const OUTPUT_FILE = path.join(process.cwd(), 'reports', 'failure-summary.json');
const FAILURE_HISTORY_FILE = path.join(process.cwd(), 'reports', 'failure-history.json');
function getFailureCount(testName) {
    try {
        if (!fs.existsSync(FAILURE_HISTORY_FILE))
            return 0;
        const raw = fs.readFileSync(FAILURE_HISTORY_FILE, 'utf-8');
        const history = JSON.parse(raw);
        if (!Array.isArray(history))
            return 0;
        return history.filter((entry) => entry.testName === testName).length;
    }
    catch {
        return 0;
    }
}
const SELECTOR_PREFIXES = ['btn', 'txt', 'drp', 'chk', 'lnk', 'rdo', 'dlg', 'tbl', 'err', 'col', 'spin', 'tab', 'pnl'];
class AgentReporter {
    failures = [];
    passedCount = 0;
    failedCount = 0;
    fixmeCount = 0;
    totalDuration = 0;
    onTestEnd(test, result) {
        this.totalDuration += result.duration;
        if (result.status === 'skipped') {
            const annotations = test.annotations || [];
            const isFixme = annotations.some(a => a.type === 'fixme');
            if (isFixme)
                this.fixmeCount++;
            return;
        }
        if (result.status === 'passed' || result.status === 'timedOut' && result.errors.length === 0) {
            this.passedCount++;
            return;
        }
        if (result.status === 'failed' || result.status === 'timedOut') {
            this.failedCount++;
            const fullErrorMsg = result.errors
                .map(e => e.message || e.stack || 'Unknown error')
                .join(' | ');
            const errorMsg = fullErrorMsg.substring(0, 500);
            const selectorMatch = errorMsg.match(new RegExp(`['"\`]((?:${SELECTOR_PREFIXES.join('|')})[A-Z]\\w+)['"\`]`));
            const screenshot = result.attachments.find(a => a.name === 'screenshot' && a.path);
            const trace = result.attachments.find(a => a.name === 'trace' && a.path);
            let diagnostics = null;
            const diagAttachment = result.attachments.find(a => a.name === 'diagnostics');
            if (diagAttachment?.body) {
                try {
                    diagnostics = JSON.parse(diagAttachment.body.toString('utf-8'));
                }
                catch { }
            }
            const failureCategory = this.classifyFailure(fullErrorMsg, diagnostics);
            const lastActions = [];
            const steps = result.steps || [];
            const relevantSteps = steps.slice(-5);
            for (const step of relevantSteps) {
                if (step.title && !step.title.startsWith('fixture:')) {
                    lastActions.push(step.title);
                }
            }
            this.failures.push({
                testName: test.title,
                file: test.location.file ? path.relative(process.cwd(), test.location.file) : 'unknown',
                error: errorMsg,
                fullError: fullErrorMsg,
                selector: selectorMatch?.[1] ?? null,
                duration: result.duration,
                screenshotPath: screenshot?.path
                    ? path.relative(process.cwd(), screenshot.path)
                    : null,
                tracePath: trace?.path
                    ? path.relative(process.cwd(), trace.path)
                    : null,
                lastActions,
                failureCategory,
                pageUrl: diagnostics?.urlHistory.at(-1) ?? '',
                workerIndex: test.parent?.project()?.metadata?.workerIndex ?? 0,
                retryAttempt: result.retry,
                consoleErrors: diagnostics?.consoleErrors ?? [],
                networkFailures: diagnostics?.networkFailures ?? [],
                pageErrors: diagnostics?.pageErrors ?? [],
                authChain: diagnostics?.authChain ?? [],
                domSnippet: (diagnostics?.domSnippet ?? '').substring(0, 10_240),
                urlBreadcrumbs: diagnostics?.urlBreadcrumbs ?? [],
                triage: null,
                bugReportId: null,
                bugHuntCategory: null,
                testIdStatus: null,
                changeSize: null,
                failureCount: getFailureCount(test.title),
            });
        }
    }
    classifyFailure(errorMsg, diagnostics) {
        const lower = errorMsg.toLowerCase();
        const netFails = diagnostics?.networkFailures ?? [];
        const consoleErrs = diagnostics?.consoleErrors ?? [];
        const pageErrs = diagnostics?.pageErrors ?? [];
        if (lower.includes('login.microsoftonline.com') ||
            lower.includes('b2clogin.com') ||
            lower.includes('oauth') ||
            lower.includes('401') ||
            lower.includes('403') ||
            netFails.some(n => (n.url.includes('login.microsoftonline.com') || n.url.includes('b2clogin.com') || n.url.includes('oauth')) && n.status >= 400)) {
            return diagnostics_1.FailureCategory.AUTH;
        }
        if (netFails.some(n => n.status >= 400 && !n.url.includes('login.microsoftonline.com'))) {
            return diagnostics_1.FailureCategory.NETWORK;
        }
        const selectorPattern = new RegExp(`['"\`]((?:${SELECTOR_PREFIXES.join('|')})[A-Z]\\w+)['"\`]`);
        if (selectorPattern.test(errorMsg) || lower.includes('locator') || lower.includes('selector')) {
            return diagnostics_1.FailureCategory.SELECTOR;
        }
        if (lower.includes('timeout') || lower.includes('waiting for')) {
            return diagnostics_1.FailureCategory.TIMING;
        }
        if (lower.includes('browser has been closed') || lower.includes('context closed') || lower.includes('target closed')) {
            return diagnostics_1.FailureCategory.INFRASTRUCTURE;
        }
        if (pageErrs.length > 0 ||
            consoleErrs.some(e => e.type === 'error' && (e.text.includes('unhandled') || e.text.includes('Uncaught')))) {
            return diagnostics_1.FailureCategory.APPLICATION;
        }
        if (lower.includes('expected') && lower.includes('received') && !selectorPattern.test(errorMsg)) {
            return diagnostics_1.FailureCategory.DATA;
        }
        return diagnostics_1.FailureCategory.UNKNOWN;
    }
    onEnd(_result) {
        if (this.passedCount + this.failedCount + this.fixmeCount === 0) {
            console.log('[AgentReporter] Skipping failure-summary.json write -- no tests executed');
            return;
        }
        const summary = {
            timestamp: new Date().toISOString(),
            failures: this.failures,
            passed: this.passedCount,
            failed: this.failedCount,
            fixme: this.fixmeCount,
            totalDuration: this.totalDuration,
            triageStats: null,
            bugReportFiles: [],
        };
        const reportsDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2) + '\n', 'utf-8');
    }
}
exports.default = AgentReporter;
