/**
 * Unit tests for agent-notification-writer.ts — per-file atomic notification system.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  writeNotification,
  readPendingNotifications,
  ackNotification,
  ackAllNotifications,
  notifyStaleArtifacts,
} from '../../utils/agent-notification-writer';

const TEST_DIR = path.join(__dirname, '../../specs_planning/_internal/agent-notifications');

// Clean up test notifications before/after
function cleanTestNotifications() {
  if (fs.existsSync(TEST_DIR)) {
    const files = fs.readdirSync(TEST_DIR).filter(f => f.includes('-test-') || f.includes('-healer-'));
    for (const file of files) {
      try { fs.unlinkSync(path.join(TEST_DIR, file)); } catch {}
    }
  }
}

beforeEach(cleanTestNotifications);
afterAll(cleanTestNotifications);

describe('writeNotification', () => {
  it('creates a notification file', () => {
    const id = writeNotification({
      fromAgent: 'test-healer',
      toAgent: 'test-generator',
      type: 'stale_artifact',
      affectedFiles: ['specs/test.spec.ts'],
      changeSummary: 'Button label changed',
    });

    expect(id).toContain('test-healer');
    expect(id).toContain('test-generator');

    const filePath = path.join(TEST_DIR, `${id}.json`);
    expect(fs.existsSync(filePath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(content.fromAgent).toBe('test-healer');
    expect(content.toAgent).toBe('test-generator');
    expect(content.type).toBe('stale_artifact');
    expect(content.acknowledged).toBe(false);

    // Clean up
    fs.unlinkSync(filePath);
  });
});

describe('readPendingNotifications', () => {
  it('reads notifications for specific agent', () => {
    const id1 = writeNotification({
      fromAgent: 'test-healer',
      toAgent: 'test-generator',
      type: 'stale_artifact',
      affectedFiles: ['file1.ts'],
      changeSummary: 'change 1',
    });

    const id2 = writeNotification({
      fromAgent: 'test-healer',
      toAgent: 'test-planner',
      type: 'stale_artifact',
      affectedFiles: ['file2.ts'],
      changeSummary: 'change 2',
    });

    const forGenerator = readPendingNotifications('test-generator');
    expect(forGenerator.length).toBe(1);
    expect(forGenerator[0].changeSummary).toBe('change 1');

    const forPlanner = readPendingNotifications('test-planner');
    expect(forPlanner.length).toBe(1);
    expect(forPlanner[0].changeSummary).toBe('change 2');

    // Clean up
    ackNotification(id1);
    ackNotification(id2);
  });
});

describe('ackNotification', () => {
  it('deletes the notification file', () => {
    const id = writeNotification({
      fromAgent: 'test-healer',
      toAgent: 'test-generator',
      type: 'stale_artifact',
      affectedFiles: [],
      changeSummary: 'test',
    });

    expect(ackNotification(id)).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, `${id}.json`))).toBe(false);

    // Second ack returns false (already deleted)
    expect(ackNotification(id)).toBe(false);
  });
});

describe('ackAllNotifications', () => {
  it('acknowledges all notifications for an agent', () => {
    writeNotification({ fromAgent: 'test-healer', toAgent: 'test-generator', type: 'stale_artifact', affectedFiles: [], changeSummary: 'a' });
    writeNotification({ fromAgent: 'test-healer', toAgent: 'test-generator', type: 'stale_artifact', affectedFiles: [], changeSummary: 'b' });

    const count = ackAllNotifications('test-generator');
    expect(count).toBe(2);

    const remaining = readPendingNotifications('test-generator');
    expect(remaining.length).toBe(0);
  });
});

describe('notifyStaleArtifacts', () => {
  it('writes notifications to both generator and planner', () => {
    const ids = notifyStaleArtifacts('test-healer', ['spec.ts'], 'button label changed');
    expect(ids.length).toBe(2);

    const forGen = readPendingNotifications('generator');
    const forPlan = readPendingNotifications('planner');

    // These target real agent names (generator, planner), not test- prefixed
    expect(forGen.length).toBeGreaterThanOrEqual(1);
    expect(forPlan.length).toBeGreaterThanOrEqual(1);

    // Clean up
    ids.forEach(id => ackNotification(id));
  });
});
