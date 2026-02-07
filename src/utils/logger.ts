/**
 * FILE: src/utils/logger.ts
 * PURPOSE: Centralized logging utility with file and console output
 * WHY NECESSARY: Provides consistent logging across framework with automatic file rotation
 * USED BY: All test files, page objects, utilities, adapters
 * 
 * HOW IT WORKS:
 * 1. Singleton pattern ensures single logger instance across framework
 * 2. Uses winston for structured logging with levels (info, warn, error, debug)
 * 3. Writes to logs/ directory with daily rotation
 * 4. Console output colorized by log level for readability
 * 5. Exported Log class provides static methods: info(), warn(), error(), debug()
 */

import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

export class Logger {
  private static instance: winston.Logger | null = null;

  /**
   * Get or create logger instance (Singleton pattern)
   */
  private static getLogger(): winston.Logger {
    if (!this.instance) {
      // Ensure logs directory exists
      const logsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      // Define log format
      const logFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${process.pid}] ${level.toUpperCase().padEnd(5)} AutomationFramework - ${message}`;
        })
      );

      // Create logger instance
      this.instance = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        transports: [
          // Console transport
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              logFormat
            ),
          }),
          // File transport
          new winston.transports.File({
            filename: path.join(logsDir, 'test-execution.log'),
            format: logFormat,
            options: { flags: 'a' }, // Append mode
          }),
        ],
      });
    }

    return this.instance;
  }

  /**
   * Log info message
   */
  static info(message: string): void {
    this.getLogger().info(message);
  }

  /**
   * Log error message
   */
  static error(message: string): void {
    this.getLogger().error(message);
  }

  /**
   * Log warning message
   */
  static warn(message: string): void {
    this.getLogger().warn(message);
  }

  /**
   * Log debug message
   */
  static debug(message: string): void {
    this.getLogger().debug(message);
  }

  /**
   * Close logger and flush
   */
  static close(): void {
    if (this.instance) {
      this.instance.close();
      this.instance = null;
    }
  }
}

// Export singleton instance methods
export const Log = Logger;
