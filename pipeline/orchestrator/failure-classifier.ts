/**
 * @agent-doc
 * PURPOSE: Pattern-based failure classification for intelligent pipeline routing.
 * OWNER: human-only
 * IMPACT: high - Determines whether failures route to Healer vs back to Planner.
 * DEPENDS-ON: none (pure function, no DB)
 * USED-BY: pipeline/server/routes/worker.ts (complete-task handler)
 * RULES: Patterns are priority-ordered. First match wins. Unknown = safe fallback.
 */

export type FailureClass =
  | 'selector_not_found'    // CSS selector doesn't match any DOM element
  | 'selector_ambiguous'    // Strict mode: selector matches multiple elements
  | 'assertion_mismatch'    // Value assertion failed (expected vs actual)
  | 'typescript_compile'    // TypeScript compilation error in generated code
  | 'missing_test_cases'    // No test cases found for module
  | 'missing_selectors'     // No selector file found for module
  | 'network_api_error'     // HTTP 4xx/5xx from application under test
  | 'auth_failure'          // SSO/auth failure
  | 'timeout'               // Agent timed out or test timed out
  | 'unknown';              // Unclassifiable

export interface ClassifiedFailure {
  failureClass: FailureClass;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;            // The text that triggered classification
  upstreamBlame: string | null; // Which upstream stage is responsible (null = current stage)
}

const PATTERNS: Array<{
  pattern: RegExp;
  failureClass: FailureClass;
  upstream: string | null;
  confidence: 'high' | 'medium' | 'low';
}> = [
  // Selector issues -> Planner
  { pattern: /strict mode violation.*resolved to (\d+) elements/i, failureClass: 'selector_ambiguous', upstream: 'planning', confidence: 'high' },
  { pattern: /waiting for (locator|selector).*to be visible/i, failureClass: 'selector_not_found', upstream: 'planning', confidence: 'high' },
  { pattern: /locator.*resolved to 0 elements/i, failureClass: 'selector_not_found', upstream: 'planning', confidence: 'high' },
  { pattern: /No element matches selector/i, failureClass: 'selector_not_found', upstream: 'planning', confidence: 'high' },

  // TypeScript -> Generator
  { pattern: /TS\d{4}:/i, failureClass: 'typescript_compile', upstream: null, confidence: 'high' },
  { pattern: /error TS/i, failureClass: 'typescript_compile', upstream: null, confidence: 'high' },

  // Assertion -> could be Generator (wrong assertion) or app bug
  { pattern: /expect\(received\)\.to(Equal|Be|Contain|Have)/i, failureClass: 'assertion_mismatch', upstream: null, confidence: 'medium' },
  { pattern: /Expected.*Received/i, failureClass: 'assertion_mismatch', upstream: null, confidence: 'medium' },

  // Network/API -> app bug (neither agent's fault)
  { pattern: /net::ERR_/i, failureClass: 'network_api_error', upstream: null, confidence: 'high' },
  { pattern: /status (?:4\d{2}|5\d{2})/i, failureClass: 'network_api_error', upstream: null, confidence: 'medium' },
  { pattern: /ECONNREFUSED/i, failureClass: 'network_api_error', upstream: null, confidence: 'high' },

  // Auth
  { pattern: /login|sign.?in|sso|unauthorized|403/i, failureClass: 'auth_failure', upstream: null, confidence: 'medium' },

  // Timeout
  { pattern: /timeout.*exceeded/i, failureClass: 'timeout', upstream: null, confidence: 'high' },
  { pattern: /test.*timed out/i, failureClass: 'timeout', upstream: null, confidence: 'high' },
];

export function classifyFailure(resultData: Record<string, unknown>): ClassifiedFailure {
  const searchText = extractSearchableText(resultData);

  for (const { pattern, failureClass, upstream, confidence } of PATTERNS) {
    const match = searchText.match(pattern);
    if (match) {
      return {
        failureClass,
        confidence,
        evidence: match[0].slice(0, 200),
        upstreamBlame: upstream,
      };
    }
  }

  return {
    failureClass: 'unknown',
    confidence: 'low',
    evidence: searchText.slice(0, 200),
    upstreamBlame: null,
  };
}

function extractSearchableText(data: Record<string, unknown>): string {
  const parts: string[] = [];

  function collect(obj: unknown, depth: number) {
    if (depth > 5) return;
    if (typeof obj === 'string') { parts.push(obj); return; }
    if (Array.isArray(obj)) { obj.forEach(v => collect(v, depth + 1)); return; }
    if (obj && typeof obj === 'object') {
      Object.values(obj as Record<string, unknown>).forEach(v => collect(v, depth + 1));
    }
  }

  collect(data, 0);
  return parts.join('\n').slice(0, 10_000);
}
