/** Cleans up log files to prevent bloat - keeps last ~30 days worth of data */

import * as fs from 'fs';
import * as path from 'path';

const RETENTION_DAYS = 30;
const MAX_LOG_LINES = 10000; // ~30 days of test activity
const KEEP_LOG_LINES = 5000;  // Trim to this when exceeded

/**
 * Trim test execution log to keep only recent entries (line-based).
 * Handles both global log and per-spec subdirectory logs (Step 9).
 */
function cleanupTestLogs(): void {
  const logsDir = path.join(process.cwd(), 'logs');

  // Clean global log
  const globalLog = path.join(logsDir, 'test-execution.log');
  trimLogFile(globalLog);

  // Clean per-spec subdirectory logs
  if (fs.existsSync(logsDir)) {
    const entries = fs.readdirSync(logsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'README.md') {
        const specLog = path.join(logsDir, entry.name, 'test-execution.log');
        trimLogFile(specLog);
      }
    }
  }
}

/** Trim a single log file if it exceeds MAX_LOG_LINES. */
function trimLogFile(logPath: string): void {
  if (!fs.existsSync(logPath)) return;

  try {
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length > MAX_LOG_LINES) {
      const trimmedLines = lines.slice(-KEEP_LOG_LINES);
      fs.writeFileSync(logPath, trimmedLines.join('\n') + '\n', 'utf-8');
      
      const removed = lines.length - KEEP_LOG_LINES;
      console.log(`Log cleanup: ${path.relative(process.cwd(), logPath)} trimmed ${removed} lines`);
    }
  } catch (error) {
    console.warn(`Log cleanup failed for ${logPath}:`, error instanceof Error ? error.message : String(error));
  }
}

/**
 * Clean up agent activity log (time-based - 30 days)
 */
function cleanupAgentLogs(): void {
  const logPath = path.join(process.cwd(), 'specs_planning', '_internal', 'agent-activity-log.md');
  
  if (!fs.existsSync(logPath)) {
    console.log('Agent activity log not found, skipping cleanup');
    return;
  }

  try {
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n');

    // Find table header separator
    let headerEndIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.trim().match(/^\|[-\s|]+\|$/)) {
        headerEndIndex = i;
        break;
      }
    }

    if (headerEndIndex === 0) {
      console.log('Agent log: Invalid format, skipping cleanup');
      return;
    }

    const header = lines.slice(0, headerEndIndex + 1);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    // Filter entries by timestamp
    const entries: string[] = [];
    for (let i = headerEndIndex + 1; i < lines.length; i++) {
      const currentLine = lines[i];
      if (!currentLine) continue;
      
      const line = currentLine.trim();
      if (!line) continue;

      // Parse ISO timestamp from markdown table: | 2026-02-11T00:00:00Z | ...
      const match = line.match(/\|\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/);
      const timestamp = match && match[1] ? new Date(match[1]) : null;

      if (timestamp && timestamp >= cutoffDate) {
        entries.push(currentLine);
      } else if (!timestamp && line.startsWith('|')) {
        entries.push(currentLine); // Keep malformed rows
      }
    }

    const newContent = [...header, ...entries].join('\n') + '\n';
    fs.writeFileSync(logPath, newContent, 'utf-8');

    const removed = lines.length - headerEndIndex - 1 - entries.length;
    if (removed > 0) {
      console.log(`Agent log cleanup: Removed ${removed} entries older than ${RETENTION_DAYS} days`);
    } else {
      console.log(`Agent log cleanup: No old entries to remove`);
    }
  } catch (error) {
    console.warn('Agent log cleanup failed:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Delete ad-hoc debug files from logs/ (anything not test-execution.log or README.md).
 * Prevents accumulation of li_run*.txt, restore_snap*.md, typecheck.txt, etc.
 */
function cleanupAdHocLogFiles(): void {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) return;

  const KEEP = new Set(['test-execution.log', 'README.md']);
  const entries = fs.readdirSync(logsDir, { withFileTypes: true });
  let deleted = 0;

  for (const entry of entries) {
    if (entry.isFile() && !KEEP.has(entry.name)) {
      try {
        fs.unlinkSync(path.join(logsDir, entry.name));
        deleted++;
      } catch { /* skip if locked */ }
    }
  }

  if (deleted > 0) {
    console.log(`Ad-hoc log cleanup: Deleted ${deleted} file(s) from logs/`);
  }
}

/**
 * Archive old audit reports (30-day retention in active folder)
 */
function archiveOldAuditReports(): void {
  const auditsDir = path.join(process.cwd(), 'specs_planning', 'audits');
  const archiveDir = path.join(auditsDir, 'archive');
  if (!fs.existsSync(auditsDir)) return;

  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(auditsDir).filter(f => f.endsWith('.md') && f !== '.gitkeep');
  let archived = 0;

  for (const file of files) {
    const filePath = path.join(auditsDir, file);
    const stat = fs.statSync(filePath);
    if (stat.mtimeMs < cutoff) {
      fs.renameSync(filePath, path.join(archiveDir, file));
      archived++;
    }
  }

  if (archived > 0) {
    console.log(`Audit archive: Moved ${archived} report(s) older than 30 days to archive/`);
  }
}

/**
 * Run all cleanup tasks
 */
export async function cleanupLogs(): Promise<void> {
  console.log('Starting log cleanup...');
  cleanupAdHocLogFiles();
  cleanupTestLogs();
  cleanupAgentLogs();
  archiveOldAuditReports();
  console.log('[OK] Log cleanup complete');
}

// Allow running as standalone script
if (require.main === module) {
  cleanupLogs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}
