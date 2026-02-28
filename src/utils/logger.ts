/**
 * @agent-doc
 * PURPOSE: Simple logging utility that writes to console and file. Writes to logs/test-execution.log with timestamp, PID, level, and message.
 * OWNER: human-only
 * IMPACT: critical - All test output, debugging, and audit trails depend on this. Breaking it makes tests un-debuggable.
 * DEPENDS-ON: None (only Node.js built-ins: path, fs)
 * USED-BY: All pages, all tests, all utilities, all agents
 * RULES: Never delete Log.info() calls. Never change log format without updating log parsers. Keep file rotation working.
 */

/**
 * Simple logging utility that writes to console and file.
 * Log file auto-trimmed to ~30 days via cleanup script (scripts/cleanup-logs.ts).
 * Writes to logs/test-execution.log with timestamp, PID, level, and message.
 * Set LOG_LEVEL=debug environment variable to enable debug logs.
 */

import * as path from 'path';
import * as fs from 'fs';

export class Logger {
  private static logFile = path.join(process.cwd(), 'logs', 'test-execution.log');

  // WARNING: workers=1 only -- static field not safe with parallel workers.
  // If workers > 1, switch to testInfo-scoped approach via fixtures.
  private static specContext: string = 'global';

  /**
   * Set spec context for per-spec log routing.
   * Called from fixtures.ts with testInfo.file.
   */
  static setSpecContext(specFile: string): void {
    this.specContext = path.basename(specFile, '.spec.ts');
    const specLogDir = path.join(process.cwd(), 'logs', this.specContext);
    if (!fs.existsSync(specLogDir)) {
      fs.mkdirSync(specLogDir, { recursive: true });
    }
  }

  /** Get current log file path based on spec context. */
  private static get currentLogFile(): string {
    if (this.specContext === 'global') {
      return this.logFile;
    }
    return path.join(process.cwd(), 'logs', this.specContext, 'test-execution.log');
  }

  /**
   * Write log entry to console and file.
   * @param level - Log level (INFO, ERROR, WARN, DEBUG)
   * @param message - Log message
   * @private
   */
  private static write(level: string, message: string): void {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const line = `${timestamp} [${process.pid}] ${level.padEnd(5)} AutomationFramework - ${message}`;
    
    // Console output
    console.log(line);
    
    // File output - ensure logs directory exists
    const logPath = this.currentLogFile;
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Append to log file
    fs.appendFileSync(logPath, line + '\n', 'utf-8');
  }

  /**
   * Log info-level message.
   * @param message - Message to log
   */
  static info(message: string): void {
    this.write('INFO', message);
  }

  /**
   * Log error-level message.
   * @param message - Error message to log
   */
  static error(message: string): void {
    this.write('ERROR', message);
  }

  /**
   * Log warning-level message.
   * @param message - Warning message to log
   */
  static warn(message: string): void {
    this.write('WARN', message);
  }

  /**
   * Log debug-level message (only if LOG_LEVEL=debug).
   * @param message - Debug message to log
   */
  static debug(message: string): void {
    if (process.env.LOG_LEVEL === 'debug') {
      this.write('DEBUG', message);
    }
  }
}

// Export singleton instance methods
export const Log = Logger;
