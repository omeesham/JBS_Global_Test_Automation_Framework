#!/usr/bin/env node
// File: tooling/qa/scripts/agent_helpers.js
// Purpose: Safe helper functions for dev agent operations (validation, auto-fix)
// Version: 2.0 (Simplified - removed redundant QA review function)

const fs = require('fs');
const path = require('path');

// ============================================================================
// FINDING VALIDATION FUNCTIONS
// ============================================================================

/**
 * Count issues from findings markdown
 * @param {string} findingsMarkdown - Markdown content from findings file
 * @returns {number} Number of issues found
 */
function countIssues(findingsMarkdown) {
  // Look for common patterns indicating issues
  const criticalMatches = findingsMarkdown.match(/🔴|CRITICAL|❌/g);
  const mediumMatches = findingsMarkdown.match(/🟡|MEDIUM|⚠️/g);
  const minorMatches = findingsMarkdown.match(/🟢|MINOR|ℹ️/g);
  
  const critical = criticalMatches ? criticalMatches.length : 0;
  const medium = mediumMatches ? mediumMatches.length : 0;
  const minor = minorMatches ? minorMatches.length : 0;
  
  return critical + medium + minor;
}

// ============================================================================
// FINDING VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a single finding by checking if it's real
 * @param {string} issueText - Text describing the issue
 * @param {string} filePath - File where issue is claimed
 * @param {number|null} lineNumber - Line number where issue is claimed
 * @returns {object} { valid: boolean, reason: string, evidence: string }
 */
function validateFinding(issueText, filePath, lineNumber = null) {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      reason: 'File does not exist',
      evidence: `File not found: ${filePath}`
    };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // If line number provided, check that specific line
  if (lineNumber !== null) {
    if (lineNumber > lines.length) {
      return {
        valid: false,
        reason: 'Line number out of range',
        evidence: `File has ${lines.length} lines, issue claims line ${lineNumber}`
      };
    }
    
    const line = lines[lineNumber - 1];
    return {
      valid: true,
      reason: 'Line exists and can be checked',
      evidence: `Line ${lineNumber}: ${line.trim()}`
    };
  }
  
  // Generic validation - issue is potentially valid if file exists
  return {
    valid: true,
    reason: 'File exists, manual review needed',
    evidence: `File: ${filePath} (${lines.length} lines)`
  };
}

// ============================================================================
// SAFE AUTO-FIX FUNCTIONS
// ============================================================================

/**
 * Generate auto-fix patch for a validated finding
 * CRITICAL: Returns patch suggestion ONLY - does NOT mutate files
 * @param {object} validation - Validation result with file, line, issue details
 * @returns {object} { patch: string, applied: false, filePath: string }
 */
function applyAutoFix(validation) {
  const { filePath, lineNumber, issueType, issueText } = validation;
  
  // SAFETY: This function NEVER modifies files directly
  // It only generates patch suggestions for manual or explicit application
  
  let patchSuggestion = '';
  
  if (issueType === 'missing_try_catch') {
    patchSuggestion = generateTryCatchPatch(filePath, lineNumber);
  } else if (issueType === 'console_log') {
    patchSuggestion = generateLoggerPatch(filePath, lineNumber);
  } else if (issueType === 'typo') {
    patchSuggestion = generateTypoPatch(filePath, lineNumber, validation.correction);
  } else {
    patchSuggestion = `# Auto-fix not available for: ${issueType}\n# Manual review required\n`;
  }
  
  return {
    patch: patchSuggestion,
    applied: false, // CRITICAL: Never auto-applied
    filePath,
    lineNumber,
    issueType,
    message: 'Patch generated - requires explicit application by dev agent'
  };
}

/**
 * Generate try-catch wrapper patch
 */
function generateTryCatchPatch(filePath, lineNumber) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const targetLine = lines[lineNumber - 1];
  const indent = targetLine.match(/^\s*/)[0];
  
  return `--- ${filePath}
+++ ${filePath}
@@ -${lineNumber},1 +${lineNumber},7 @@
-${targetLine}
+${indent}try {
+${targetLine}
+${indent}} catch (error) {
+${indent}  console.error('Error:', error);
+${indent}  // TODO: Add proper error handling
+${indent}}
`;
}

/**
 * Generate logger replacement patch
 */
function generateLoggerPatch(filePath, lineNumber) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const targetLine = lines[lineNumber - 1];
  const replaced = targetLine.replace(/console\.log\(/g, 'Log.info(');
  
  return `--- ${filePath}
+++ ${filePath}
@@ -${lineNumber},1 +${lineNumber},1 @@
-${targetLine}
+${replaced}
`;
}

/**
 * Generate typo correction patch
 */
function generateTypoPatch(filePath, lineNumber, correction) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const targetLine = lines[lineNumber - 1];
  
  return `--- ${filePath}
+++ ${filePath}
@@ -${lineNumber},1 +${lineNumber},1 @@
-${targetLine}
+${correction}
`;
}

// ============================================================================
// FEEDBACK GENERATION
// ============================================================================

/**
 * Generate worker feedback markdown from validation results
 * @param {Array<object>} validations - Array of validation results
 * @returns {string} Markdown-formatted feedback
 */
function generateFeedback(validations) {
  const feedback = [];
  
  feedback.push('# Worker Validation of QA Findings');
  feedback.push('');
  feedback.push(`Validated ${validations.length} finding(s)`);
  feedback.push('');
  
  let validCount = 0;
  let falseAlarmCount = 0;
  let partialCount = 0;
  
  validations.forEach((val, idx) => {
    feedback.push(`## Finding #${idx + 1}: ${val.findingTitle || 'Untitled'}`);
    feedback.push('');
    feedback.push(`**QA Claim:** ${val.claim || 'N/A'}`);
    feedback.push('');
    
    if (val.validation === 'VALID') {
      feedback.push('**My Validation:** ✅ VALID');
      validCount++;
    } else if (val.validation === 'FALSE_ALARM') {
      feedback.push('**My Validation:** ❌ FALSE ALARM');
      falseAlarmCount++;
    } else {
      feedback.push('**My Validation:** ⚠️ PARTIALLY VALID');
      partialCount++;
    }
    
    feedback.push('');
    feedback.push('**Evidence:**');
    feedback.push('```');
    feedback.push(val.evidence || 'No evidence provided');
    feedback.push('```');
    feedback.push('');
    feedback.push('**Explanation:**');
    feedback.push(val.explanation || 'No explanation provided');
    feedback.push('');
    
    if (val.validation === 'FALSE_ALARM' && val.mistakePattern) {
      feedback.push('**QA Mistake Pattern:**');
      feedback.push(val.mistakePattern);
      feedback.push('');
    }
    
    feedback.push('---');
    feedback.push('');
  });
  
  feedback.push('## Summary');
  feedback.push('');
  feedback.push(`- ✅ Valid: ${validCount}`);
  feedback.push(`- ❌ False Alarms: ${falseAlarmCount}`);
  feedback.push(`- ⚠️ Partially Valid: ${partialCount}`);
  feedback.push('');
  
  return feedback.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  countIssues,
  validateFinding,
  applyAutoFix,
  generateFeedback
};
