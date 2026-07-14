#!/usr/bin/env node
// redact.mjs — deterministic deny-list secret scrubber for UPLINK boundary redaction.
// No LLM, no network. Case-insensitive where appropriate.
// Idempotent: redact(redact(x)) === redact(x) via [REDACTED] negative lookaheads.

const R = '[REDACTED]';

// Each entry: [regex, replacement]. Applied in order.
// (?!\[REDACTED\]) negative lookahead on every value capture ensures idempotency.
const SUBS = [
  // 1. HTTP Authorization / Proxy-Authorization header — redact full line value
  //    (?! *\[REDACTED\]) blocks backtracking: \s* in group-1 can retreat to 0, which would
  //    position group-2 at the trailing space; the wider lookahead prevents that false match.
  [/(Authorization\s*:\s*)((?! *\[REDACTED\]).*)$/gim, `$1${R}`],

  // 2. Bearer token in any context (catches standalone occurrences in prose/logs)
  [/(\bbearer\s+)((?!\[REDACTED\])\S+)/gi, `$1${R}`],

  // 3. Cookie / Set-Cookie header — redact full line value
  //    Same \s*-backtrack guard as pattern 1.
  [/((?:Set-)?Cookie\s*:\s*)((?! *\[REDACTED\]).*)$/gim, `$1${R}`],

  // 4. Connection strings with inline credentials: scheme://user:pass@host
  [/(\w[\w+.\-]*:\/\/[^:@\s/]+:)((?!\[REDACTED\])[^@\s/]*)(@)/g, `$1${R}$3`],

  // 5. Known secret-token prefixes: sk-, ghp_, gho_, ghu_, ghs_, ghr_, glpat-
  [/\b(?:sk-|ghp_|gho_|ghu_|ghs_|ghr_|glpat-)[A-Za-z0-9/_+\-]{10,}/g, R],

  // 6. .env-style KEY=value where KEY name contains a sensitive word (uppercase identifiers)
  [/\b([A-Z_]*(?:KEY|TOKEN|SECRET|PASSWORD|AUTH|COOKIE|CONN)[A-Z0-9_]*)\s*=\s*((?!\[REDACTED\])\S+)/g, `$1=${R}`],

  // 7. password= / passwd= / pwd= (case-insensitive; catches lowercase config values)
  [/\b(password|passwd|pwd)\s*=\s*((?!\[REDACTED\])\S+)/gi, `$1=${R}`],

  // 8. api[_-]?key / secret / token label=value or label:value (case-insensitive)
  [/\b(api[_-]?key|secret|token)\s*([=:])\s*((?!\[REDACTED\])\S+)/gi, `$1$2${R}`],

  // 9. Long (>=20-char) alnum+/_+- run after underscore-delimited key-ish label
  //    e.g. access_token, oauth_secret, client_api_key
  [/\b(\w+_(?:key|secret|token|password|auth|api|cookie|conn)(?:_\w+)*)\s*([=:])\s*((?!\[REDACTED\])[A-Za-z0-9/_+\-]{20,})/gi, `$1$2${R}`],
];

export function redact(text) {
  if (typeof text !== 'string') return text;
  let s = text;
  for (const [re, sub] of SUBS) {
    s = s.replace(re, sub);
  }
  return s;
}

// A string VALUE sitting directly under a sensitive OBJECT KEY is redacted whole,
// even when the value itself carries no secret pattern (e.g. { password: 'hunter2' }).
// Array elements are judged by CONTENT — the array's key never taints them (so a
// { tokens: ['API_KEY=abc', 'safe-value'] } keeps 'safe-value').
const SENSITIVE_KEY = /(?:password|passwd|pwd|secret|token|api[_-]?key|authorization|auth|cookie|credential|conn)/i;

export function redactObject(obj, keyHint) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (keyHint && SENSITIVE_KEY.test(keyHint)) return R;
    return redact(obj);
  }
  if (Array.isArray(obj)) return obj.map((v) => redactObject(v));
  if (typeof obj === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = redactObject(v, k);
    }
    return result;
  }
  return obj;
}
