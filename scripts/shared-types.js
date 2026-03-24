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
exports.SHARED_PATHS = exports.NEVER_DO_PATTERN = exports.AGENT_FILE_MAP = void 0;
exports.parseMistakeRow = parseMistakeRow;
exports.parseCompactMistakeRow = parseCompactMistakeRow;
exports.extractMarkdownSection = extractMarkdownSection;
exports.parseLearningRow = parseLearningRow;
const path = __importStar(require("path"));
exports.AGENT_FILE_MAP = {
    'Shared': 'ALL',
    'Copilot': 'copilot',
    'Requirements': 'playwright-requirements.agent.md',
    'Planner': 'playwright-test-planner.agent.md',
    'Generator': 'playwright-test-generator.agent.md',
    'Healer': 'playwright-test-healer.agent.md',
    'Audit': 'playwright-pipeline-audit.agent.md',
    'Framework Maintainer': 'playwright-framework-maintainer.agent.md',
    'Copilot Planning Mode': 'SKIP',
};
exports.NEVER_DO_PATTERN = /## (?:NEVER DO|RULES)[\s\S]*?(?=\n---|\n## (?!(?:NEVER DO|RULES))|```\n---)/;
exports.SHARED_PATHS = {
    queue: path.join(__dirname, '../specs_planning/_internal/agent-queue.json'),
    mistakes: path.join(__dirname, '../specs_planning/_internal/agent-mistakes.md'),
    learnings: path.join(__dirname, '../specs_planning/_internal/agent-mistakes.md'),
    activityLog: path.join(__dirname, '../specs_planning/_internal/agent-activity-log.md'),
    requirements: path.join(__dirname, '../docs/REQUIREMENTS.md'),
    performance: path.join(__dirname, '../specs_planning/_internal/agent-performance.json'),
    escalations: path.join(__dirname, '../specs_planning/_internal/agent-escalations.json'),
    notifications: path.join(__dirname, '../specs_planning/_internal/agent-notifications'),
    testIdInventory: path.join(__dirname, '../specs_planning/_internal/testid-inventory'),
    agentsDir: path.join(__dirname, '../.github/agents'),
    exports: path.join(__dirname, '../export_test_cases/exports'),
    testCases: path.join(__dirname, '../specs_planning/test-cases'),
};
function splitMdTableRow(line) {
    const PLACEHOLDER = '\x00PIPE\x00';
    const safe = line.replace(/\\\|/g, PLACEHOLDER);
    return safe.split('|').map(cell => cell.split(PLACEHOLDER).join('|').trim());
}
function parseMistakeRow(line) {
    if (!line.trimStart().startsWith('|'))
        return null;
    const cells = splitMdTableRow(line).filter(c => c !== '');
    if (cells.length < 3)
        return null;
    const id = cells[0];
    if (!/^[A-Z]+-\d+[A-Z]?$/.test(id))
        return null;
    return { id, never: cells[1], correct: cells[2] };
}
function parseCompactMistakeRow(line) {
    if (!line.trimStart().startsWith('|'))
        return null;
    const cells = splitMdTableRow(line).filter(c => c !== '');
    if (cells.length < 2)
        return null;
    const id = cells[0];
    if (!/^[A-Z]+-\d+[A-Z]?$/.test(id))
        return null;
    return [id, cells[1]];
}
function extractMarkdownSection(content, sectionName) {
    const pattern = new RegExp(`## ${sectionName}[\\s\\S]*?(?=\\n## |$)`);
    const match = content.match(pattern);
    return match ? match[0] : '';
}
function parseLearningRow(line) {
    if (!line.trimStart().startsWith('|'))
        return null;
    const cells = splitMdTableRow(line).filter(c => c !== '');
    if (cells.length < 7)
        return null;
    const id = cells[0];
    if (!/^LRN-\d+$/.test(id))
        return null;
    const agent = cells[cells.length - 2];
    const date = cells[cells.length - 1];
    const solution = cells.slice(4, cells.length - 2).join(' | ');
    return {
        id,
        category: cells[1],
        trigger: cells[2],
        rootCause: cells[3],
        solution,
        agent,
        date,
    };
}
