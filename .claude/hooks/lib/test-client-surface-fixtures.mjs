#!/usr/bin/env node
// test-client-surface-fixtures.mjs — fixture table for the client-surface write gate.
//
// Imported by check-client-surface-write.mjs --self-test.
// Each entry: { path, expectedVerdict, expectedRule, mode?, description }
// mode defaults to 'deny' for deny-path assertions, 'deny' for allow-path assertions.
// (Running in deny mode exercises both halves of the allowlist branch.)

export const FIXTURES = [
  // ── MUST DENY ──────────────────────────────────────────────────────────────

  {
    description: 'A1 — self-nested clients dir',
    path: 'clients/encore/clients/x.md',
    expectedVerdict: 'deny',
    expectedRule: 'A1',
    mode: 'deny',
  },
  {
    description: 'A2 — stray dot-directory .claude',
    path: 'clients/encore/.claude/state/y.log',
    expectedVerdict: 'deny',
    expectedRule: 'A2',
    mode: 'deny',
  },
  {
    description: 'A3 — loose file at client root (scratch.js)',
    path: 'clients/encore/scratch.js',
    expectedVerdict: 'deny',
    expectedRule: 'A3',
    mode: 'deny',
  },
  {
    description: 'A3 — loose file at client root (part-a.js)',
    path: 'clients/encore/part-a.js',
    expectedVerdict: 'deny',
    expectedRule: 'A3',
    mode: 'deny',
  },
  {
    description: 'A4 — archive at root',
    path: 'clients/encore/anything.zip',
    expectedVerdict: 'deny',
    expectedRule: 'A4',
    mode: 'deny',
  },
  {
    description: 'A4 — graduating incident: archive inside specs_planning (proves A1-A4 run before allowlist)',
    path: 'clients/encore/specs_planning/_internal.zip',
    expectedVerdict: 'deny',
    expectedRule: 'A4',
    mode: 'deny',
  },
  {
    description: 'allowlist deny — randomdir not in allowed top-level dirs',
    path: 'clients/encore/randomdir/file.txt',
    expectedVerdict: 'deny',
    expectedRule: 'allowlist',
    mode: 'deny',
  },

  // ── MUST ALLOW ─────────────────────────────────────────────────────────────

  {
    description: 'allow — src page object',
    path: 'clients/encore/src/pages/x.page.ts',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — spec file',
    path: 'clients/encore/tests/x.spec.ts',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — .env.local at root (proves A2 does not test filenames)',
    path: 'clients/encore/.env.local',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — dotfile deep inside specs_planning (proves A2 does not test filenames in subdirs)',
    path: 'clients/encore/specs_planning/_internal/intake/.gitkeep',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — .auth directory (exempt from A2)',
    path: 'clients/encore/.auth/encore-state.json',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — trace.zip under reports/ (proves A4 reports/ exclusion)',
    path: 'clients/encore/reports/test-results/foo/trace.zip',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — allure results under reports/',
    path: 'clients/encore/reports/allure-results/0071dc72-result.json',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — agent activity log inside specs_planning',
    path: 'clients/encore/specs_planning/_internal/agent-activity-log.md',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — ordinary markdown under specs_planning/test-cases (B1 must not be a blanket ban)',
    path: 'clients/encore/specs_planning/test-cases/mod.md',
    expectedVerdict: 'allow',
    mode: 'deny',
  },

  // ── B1: raw runner-output tree under specs_planning/ ───────────────────────

  {
    description: 'B1 deny — allure-results tree under specs_planning (evidence-capture class)',
    path: 'clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/0071dc72-result.json',
    expectedVerdict: 'deny',
    expectedRule: 'B1',
    mode: 'deny',
  },
  {
    description: 'B1 deny — test-results tree under specs_planning',
    path: 'clients/encore/specs_planning/_internal/evidence/test-results/x/y.png',
    expectedVerdict: 'deny',
    expectedRule: 'B1',
    mode: 'deny',
  },
  {
    description: 'B1 announce — allure-results tree in announce mode returns allow with reason',
    path: 'clients/encore/specs_planning/_internal/evidence/run2/allure-results/abc-result.json',
    expectedVerdict: 'allow',
    expectedRule: 'B1',
    mode: 'announce',
  },
  {
    description: 'A4 deny — trace.zip under specs_planning (A4 supersedes B1 zip clause; A4 fires first)',
    path: 'clients/encore/specs_planning/_internal/evidence/trace.zip',
    expectedVerdict: 'deny',
    expectedRule: 'A4',
    mode: 'deny',
  },
  {
    description: 'allow — package-lock.json at root (allowed root file)',
    path: 'clients/encore/package-lock.json',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — out of scope: src/utils (not under clients/)',
    path: 'src/utils/thing.ts',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
  {
    description: 'allow — out of scope: plans/ directory',
    path: 'plans/pending/SOME_PLAN.md',
    expectedVerdict: 'allow',
    mode: 'deny',
  },
];
