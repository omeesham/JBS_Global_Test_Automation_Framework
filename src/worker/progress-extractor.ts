/**
 * Extracts sanitized progress messages from Claude CLI stdout.
 * Filters out JSON blobs, secrets, and noise — keeps user-friendly status updates.
 */

const TOOL_PATTERNS: Array<[RegExp, string]> = [
  [/browser_navigate.*?"url":\s*"([^"]+)"/, 'Navigating to $1'],
  [/browser_click.*?"(ref|element)":\s*"([^"]+)"/, 'Clicking $2'],
  [/browser_snapshot/, 'Taking page snapshot'],
  [/browser_type.*?"text":\s*"([^"]{1,40})/, 'Typing "$1"'],
  [/browser_evaluate/, 'Running browser script'],
  [/browser_fill_form/, 'Filling form fields'],
  [/Read\s+tool.*?file.*?["']([^"']+)["']/, 'Reading $1'],
  [/Write\s+tool.*?file.*?["']([^"']+)["']/, 'Writing $1'],
  [/Edit\s+tool.*?file.*?["']([^"']+)["']/, 'Editing $1'],
  [/Grep\s+tool.*?["']([^"']+)["']/, 'Searching for "$1"'],
  [/Glob\s+tool.*?["']([^"']+)["']/, 'Finding files: $1'],
];

const ACTIVITY_PATTERNS: Array<[RegExp, string]> = [
  [/TC-[A-Z]+-[A-Z]+-\d{3}/, (m: string) => `Working on ${m}`],
  [/Creating\s+(\S+\.(ts|md|json))/, 'Creating $1'],
  [/Writing\s+(\S+\.(ts|md|json|csv))/, 'Writing $1'],
  [/Saving\s+(\S+)/, 'Saving $1'],
  [/selector[s]?\s+(added|created|verified|updated)/i, 'Selectors $1'],
  [/test\s*case[s]?\s+(created|updated|written)/i, 'Test cases $1'],
  [/Searching\s+(.{1,60})/, 'Searching $1'],
  [/Analyzing\s+(.{1,60})/, 'Analyzing $1'],
  [/complete|finished|done/i, 'Stage work completed'],
] as any;

const FILTER_PATTERNS = [
  /^\s*\{[\s\S]*\}\s*$/,          // Full JSON objects
  /^\s*\[[\s\S]*\]\s*$/,          // Full JSON arrays
  /api[_-]?key|secret|token|password|credential/i,
  /sk-[a-zA-Z0-9]+/,              // API keys
  /Bearer\s+[a-zA-Z0-9]/,         // Bearer tokens
  /^\s*$/,                         // Empty lines
  /^[─━═┃│]+$/,                   // Box-drawing lines
  /^\s*at\s+\S+\s+\(/,           // Stack traces
];

export interface ProgressMessage {
  message: string;
  timestamp: string;
}

export class ProgressExtractor {
  private lastSendTime = 0;
  private minIntervalMs: number;
  private buffer: string[] = [];

  constructor(minIntervalMs = 2000) {
    this.minIntervalMs = minIntervalMs;
  }

  /**
   * Process a line of stdout from Claude CLI.
   * Returns a sanitized progress message if one is detected and rate-limit allows,
   * or null if the line should be skipped.
   */
  extract(line: string): ProgressMessage | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) return null;

    // Filter out sensitive/noisy content
    for (const pattern of FILTER_PATTERNS) {
      if (pattern.test(trimmed)) return null;
    }

    // Try tool patterns first (most specific)
    for (const [pattern, template] of TOOL_PATTERNS) {
      const match = trimmed.match(pattern);
      if (match) {
        const msg = template.replace(/\$(\d)/g, (_, i) => match[parseInt(i)] || '');
        return this.rateLimited(msg);
      }
    }

    // Try activity patterns
    for (const [pattern, template] of ACTIVITY_PATTERNS) {
      const match = trimmed.match(pattern);
      if (match) {
        const msg = typeof template === 'function'
          ? template(match[0])
          : template.replace(/\$(\d)/g, (_, i) => match[parseInt(i)] || '');
        return this.rateLimited(msg);
      }
    }

    // For short non-JSON lines that look like status updates, pass through
    if (trimmed.length < 120 && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      // Only pass through if it looks like natural language (has spaces)
      if (trimmed.includes(' ') && /[a-zA-Z]/.test(trimmed)) {
        return this.rateLimited(trimmed.substring(0, 120));
      }
    }

    return null;
  }

  /** Force-send a message regardless of rate limit (for important events) */
  force(message: string): ProgressMessage {
    this.lastSendTime = Date.now();
    return { message, timestamp: new Date().toISOString() };
  }

  private rateLimited(message: string): ProgressMessage | null {
    const now = Date.now();
    if (now - this.lastSendTime < this.minIntervalMs) {
      this.buffer.push(message);
      return null;
    }
    this.lastSendTime = now;
    this.buffer = [];
    return { message, timestamp: new Date().toISOString() };
  }

  /** Flush any buffered message (call on completion) */
  flush(): ProgressMessage | null {
    if (this.buffer.length === 0) return null;
    const last = this.buffer[this.buffer.length - 1]!;
    this.buffer = [];
    return { message: last, timestamp: new Date().toISOString() };
  }
}
