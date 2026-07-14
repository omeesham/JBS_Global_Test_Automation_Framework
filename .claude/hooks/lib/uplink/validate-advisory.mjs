#!/usr/bin/env node
// validate-advisory.mjs — deterministic schema validator for UPLINK advisory objects.
// No network, no LLM, no external deps.

const KNOWN_KEYS = new Set(['verdict', 'next_action', 'prohibitions', 'success_check', 'escalate']);

export function validateAdvisory(obj) {
  const violations = [];

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    violations.push('advisory must be a plain object');
    return { valid: false, violations };
  }

  // Unknown top-level keys
  for (const k of Object.keys(obj)) {
    if (!KNOWN_KEYS.has(k)) violations.push(`unknown key: ${k}`);
  }

  // verdict: non-empty string
  if (typeof obj.verdict !== 'string' || obj.verdict.trim() === '') {
    violations.push('verdict must be a non-empty string');
  }

  // next_action: string + no-labor fenced-code check
  if (typeof obj.next_action !== 'string') {
    violations.push('next_action must be a string');
  } else {
    // Create per-call regex instance to avoid lastIndex state across calls.
    const fenceRx = /```([^\n]*)\n([\s\S]*?)```/g;
    let match;
    while ((match = fenceRx.exec(obj.next_action)) !== null) {
      const inner = match[2];
      // Trim the trailing newline before the closing fence to avoid counting a phantom blank line.
      const content = inner.endsWith('\n') ? inner.slice(0, -1) : inner;
      const lineCount = content.split('\n').length;
      if (lineCount > 5) {
        violations.push('no-labor: next_action carries >5 lines of code');
        break;
      }
    }
  }

  // prohibitions: array (may be empty)
  if (!Array.isArray(obj.prohibitions)) {
    violations.push('prohibitions must be an array');
  }

  // success_check: non-empty string
  if (typeof obj.success_check !== 'string' || obj.success_check.trim() === '') {
    violations.push('success_check must be a non-empty string');
  }

  // escalate: boolean
  if (typeof obj.escalate !== 'boolean') {
    violations.push('escalate must be a boolean');
  }

  return { valid: violations.length === 0, violations };
}
