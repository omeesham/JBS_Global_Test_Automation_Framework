"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsCollector = void 0;
exports.attachDiagnostics = attachDiagnostics;
const diagnostics_1 = require("../framework-contracts/diagnostics");
const MAX_BODY_LENGTH = 2048;
const SELECTOR_PREFIXES = ['btn', 'txt', 'drp', 'chk', 'lnk', 'rdo', 'dlg', 'tbl', 'err', 'col', 'spin', 'tab', 'pnl'];
class DiagnosticsCollector {
    page;
    consoleEntries = [];
    networkFailures = [];
    pageErrors = [];
    urlHistory = [];
    urlBreadcrumbs = [];
    authChain = [];
    allResponses = [];
    constructor(page) {
        this.page = page;
        this.attachListeners();
    }
    attachListeners() {
        this.page.on('console', (msg) => {
            try {
                this.consoleEntries.push({
                    type: msg.type(),
                    text: msg.text(),
                    location: msg.location() ? `${msg.location().url}:${msg.location().lineNumber}` : '',
                    timestamp: Date.now(),
                });
            }
            catch { }
        });
        this.page.on('pageerror', (error) => {
            try {
                this.pageErrors.push(error.message || String(error));
            }
            catch { }
        });
        this.page.on('response', async (response) => {
            try {
                const status = response.status();
                const url = response.url();
                if (url.includes('login.microsoftonline.com') || url.includes('b2clogin.com') || url.includes('oauth')) {
                    this.authChain.push({
                        url,
                        status,
                        redirectedFrom: response.request().redirectedFrom()?.url() ?? null,
                        timestamp: Date.now(),
                    });
                }
                try {
                    const req = response.request();
                    this.allResponses.push({
                        url,
                        method: req.method(),
                        status,
                        timestamp: Date.now(),
                        duration: 0,
                    });
                }
                catch { }
                if (status >= 400) {
                    let body = '';
                    try {
                        body = (await response.text()).substring(0, MAX_BODY_LENGTH);
                    }
                    catch { }
                    this.networkFailures.push({
                        url,
                        status,
                        statusText: response.statusText(),
                        body,
                        timestamp: Date.now(),
                    });
                }
            }
            catch { }
        });
        this.page.on('requestfailed', (request) => {
            try {
                const failure = request.failure();
                this.networkFailures.push({
                    url: request.url(),
                    status: 0,
                    statusText: failure?.errorText ?? 'Request failed',
                    body: '',
                    timestamp: Date.now(),
                });
            }
            catch { }
        });
        this.page.on('framenavigated', (frame) => {
            try {
                if (frame === this.page.mainFrame()) {
                    this.urlBreadcrumbs.push({ url: frame.url(), timestamp: Date.now() });
                }
            }
            catch { }
        });
    }
    recordUrl() {
        try {
            this.urlHistory.push(this.page.url());
        }
        catch { }
    }
    getNetworkFailures() {
        return this.networkFailures;
    }
    getConsoleErrors() {
        return this.consoleEntries.filter(e => e.type === 'error' || e.type === 'warning');
    }
    getConsoleLogs() {
        return this.consoleEntries.filter(e => e.type === 'error' || e.type === 'warning' || e.type === 'info');
    }
    getUrlBreadcrumbs() {
        return [...this.urlBreadcrumbs];
    }
    getAuthChain() {
        return this.authChain;
    }
    captureHar() {
        const maxSize = parseInt(process.env.HAR_MAX_SIZE ?? '1048576', 10);
        const failedIndices = [];
        for (let i = 0; i < this.allResponses.length; i++) {
            const resp = this.allResponses[i];
            if (resp && resp.status >= 400) {
                failedIndices.push(i);
            }
        }
        if (failedIndices.length === 0)
            return [];
        const includeIndices = new Set();
        for (const idx of failedIndices) {
            for (let j = Math.max(0, idx - 5); j <= Math.min(this.allResponses.length - 1, idx + 5); j++) {
                includeIndices.add(j);
            }
        }
        const entries = [];
        let totalSize = 0;
        for (const idx of Array.from(includeIndices).sort((a, b) => a - b)) {
            const entry = this.allResponses[idx];
            if (!entry)
                continue;
            const entrySize = JSON.stringify(entry).length;
            if (totalSize + entrySize > maxSize)
                break;
            entries.push(entry);
            totalSize += entrySize;
        }
        return entries;
    }
    async captureDomState() {
        try {
            const dom = await this.page.evaluate(() => document.documentElement.outerHTML);
            return (dom ?? '').substring(0, 51_200);
        }
        catch {
            return '';
        }
    }
    getNetworkErrorSummary() {
        const errors = this.networkFailures.filter(n => n.status >= 400);
        if (errors.length === 0)
            return 'No API errors';
        return errors.map(e => `${e.status} ${e.url.split('/').pop()}: ${e.body.substring(0, 200)}`).join('\n');
    }
    getSnapshot() {
        return {
            consoleErrors: this.getConsoleLogs(),
            networkFailures: [...this.networkFailures],
            pageErrors: [...this.pageErrors],
            urlHistory: [...this.urlHistory],
            urlBreadcrumbs: this.getUrlBreadcrumbs(),
            authChain: [...this.authChain],
        };
    }
    async generateErrorContext(testName, failingSelector) {
        try {
            const analysis = await this.page.evaluate((selector) => {
                const dialogs = document.querySelectorAll('[role="alertdialog"], [role="dialog"]');
                const overlays = document.querySelectorAll('[data-radix-popper-content-wrapper], [data-state="open"][role="dialog"]');
                const alerts = document.querySelectorAll('[role="alert"]');
                const invalidFields = Array.from(document.querySelectorAll('[aria-invalid="true"]')).map(el => {
                    return el.getAttribute('aria-label') || el.getAttribute('data-testid') || el.tagName;
                });
                const disabledButtons = Array.from(document.querySelectorAll('button[disabled]')).map(el => el.getAttribute('data-testid') || el.textContent?.trim().slice(0, 40) || 'unknown');
                let selectorFound = null;
                if (selector) {
                    const el = document.querySelector(`[data-testid="${selector}"]`);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        selectorFound = {
                            exists: true,
                            visible: rect.width > 0 && rect.height > 0,
                            disabled: el.hasAttribute('disabled'),
                        };
                    }
                    else {
                        selectorFound = { exists: false, visible: false, disabled: false };
                    }
                }
                return {
                    url: location.href,
                    title: document.title,
                    dialogCount: dialogs.length,
                    overlayCount: overlays.length,
                    alertCount: alerts.length,
                    invalidFields,
                    disabledButtons,
                    selectorFound,
                    domSnippet: document.documentElement.outerHTML.slice(0, 20_480),
                };
            }, failingSelector).catch(() => null);
            if (!analysis)
                return `# Error Context: ${testName}\n\nPage unavailable at capture time.\n`;
            const lines = [
                `# Error Context: ${testName}`,
                '',
                '## Page State',
                `- URL: ${analysis.url}`,
                `- Title: ${analysis.title}`,
                '',
                '## Blocking Elements',
                `- Dialogs: ${analysis.dialogCount}`,
                `- Overlays: ${analysis.overlayCount}`,
                `- Alerts: ${analysis.alertCount}`,
            ];
            if (failingSelector && analysis.selectorFound) {
                lines.push('', `## Selector: ${failingSelector}`);
                lines.push(`- In DOM: ${analysis.selectorFound.exists ? 'YES' : 'NO'}`);
                if (analysis.selectorFound.exists) {
                    lines.push(`- Visible: ${analysis.selectorFound.visible ? 'YES' : 'NO'}`);
                    lines.push(`- Disabled: ${analysis.selectorFound.disabled ? 'YES' : 'NO'}`);
                }
            }
            if (analysis.invalidFields.length > 0) {
                lines.push('', '## Invalid Fields', ...analysis.invalidFields.map(f => `- ${f}`));
            }
            if (analysis.disabledButtons.length > 0) {
                lines.push('', '## Disabled Buttons', ...analysis.disabledButtons.map(b => `- ${b}`));
            }
            lines.push('', '## DOM Snapshot', '```html', analysis.domSnippet, '```');
            return lines.join('\n');
        }
        catch {
            return `# Error Context: ${testName}\n\nCapture failed — page may be closed.\n`;
        }
    }
    classifyFailure(errorMsg) {
        const lower = errorMsg.toLowerCase();
        if (lower.includes('login.microsoftonline.com') ||
            lower.includes('b2clogin.com') ||
            lower.includes('oauth') ||
            lower.includes('401') ||
            lower.includes('403') ||
            this.networkFailures.some(n => (n.url.includes('login.microsoftonline.com') || n.url.includes('b2clogin.com') || n.url.includes('oauth')) && n.status >= 400)) {
            return diagnostics_1.FailureCategory.AUTH;
        }
        if (this.networkFailures.some(n => n.status >= 400 && !n.url.includes('login.microsoftonline.com'))) {
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
        if (this.pageErrors.length > 0 ||
            this.consoleEntries.some(e => e.type === 'error' && (e.text.includes('unhandled') || e.text.includes('Uncaught')))) {
            return diagnostics_1.FailureCategory.APPLICATION;
        }
        if (lower.includes('expected') && lower.includes('received') && !selectorPattern.test(errorMsg)) {
            return diagnostics_1.FailureCategory.DATA;
        }
        return diagnostics_1.FailureCategory.UNKNOWN;
    }
}
exports.DiagnosticsCollector = DiagnosticsCollector;
function attachDiagnostics(page) {
    const collector = new DiagnosticsCollector(page);
    page.__diagnosticsCollector = collector;
    return collector;
}
