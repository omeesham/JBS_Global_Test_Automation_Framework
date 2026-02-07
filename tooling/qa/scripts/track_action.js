#!/usr/bin/env node
// File: tooling/qa/scripts/track_action.js
// Purpose: Atomic state updates for ACTIVE_TASK.json with locking and validation

const fs = require('fs');
const path = require('path');
const atomicIo = require('./atomic_io');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const ACTIVE_TASK_PATH = path.join(PROJECT_ROOT, 'tooling/qa/current/ACTIVE_TASK.json');
const LOCK_PATH = path.join(PROJECT_ROOT, 'tooling/qa/current/.active_task.lock');
const SCHEMA_PATH = path.join(PROJECT_ROOT, 'tooling/qa/current/ACTIVE_TASK.schema.json');
const ERROR_DIR = path.join(PROJECT_ROOT, 'tooling/qa/current/errors');

/**
 * Track an action (worker or QA) with atomic state update
 * @param {string} agent - 'worker' or 'qa'
 * @param {object} actionData - Action details
 * @returns {Promise<void>}
 */
async function trackAction(agent, actionData) {
  let releaseLock = null;
  
  try {
    // Acquire lock (async, non-blocking)
    releaseLock = await atomicIo.acquireLock(LOCK_PATH, 30000);
    
    // Read current state
    let currentState = {
      task_id: null,
      verification_dir: null,
      phase: 'idle',
      last_worker_action: null,
      last_qa_action: null
    };
    
    if (fs.existsSync(ACTIVE_TASK_PATH)) {
      const content = fs.readFileSync(ACTIVE_TASK_PATH, 'utf8');
      currentState = JSON.parse(content);
    }
    
    // Load schema for validation
    let schema = null;
    if (fs.existsSync(SCHEMA_PATH)) {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
      
      // Validate existing state
      const validation = atomicIo.validateSchema(currentState, schema);
      if (!validation.valid) {
        console.warn('⚠ Current state has validation errors:');
        validation.errors.forEach(err => console.warn(`  - ${err}`));
        atomicIo.writeErrorArtifact(ERROR_DIR, 'state_validation_before', {
          errors: validation.errors,
          state: currentState
        });
      }
    }
    
    // Update state based on agent
    const timestamp = new Date().toISOString();
    
    if (agent === 'worker' || agent === 'dev') {
      currentState.last_worker_action = {
        timestamp,
        action: actionData.action || 'unknown',
        files_modified: actionData.files_modified || [],
        status: actionData.status || 'success',
        artifact_files: actionData.artifact_files || []
      };
      
      // Update phase based on action
      if (actionData.phase) {
        currentState.phase = actionData.phase;
      } else if (actionData.status === 'precheck_fail') {
        currentState.phase = 'development'; // Stay in development until precheck passes
      } else if (actionData.action && actionData.action.includes('validated QA')) {
        currentState.phase = 'worker_validation';
      }
      
      // Update task_id and verification_dir if provided
      if (actionData.task_id !== undefined) {
        currentState.task_id = actionData.task_id;
      }
      if (actionData.verification_dir !== undefined) {
        currentState.verification_dir = actionData.verification_dir;
      }
      
    } else if (agent === 'qa') {
      currentState.last_qa_action = {
        timestamp,
        action: actionData.action || 'unknown',
        files_reviewed: actionData.files_reviewed || [],
        status: actionData.status || 'completed',
        artifact_files: actionData.artifact_files || []
      };
      
      // Update phase based on action
      if (actionData.phase) {
        currentState.phase = actionData.phase;
      } else if (actionData.status === 'findings_created') {
        currentState.phase = 'qa_review';
      }
      
      // Update task_id and verification_dir if provided
      if (actionData.task_id !== undefined) {
        currentState.task_id = actionData.task_id;
      }
      if (actionData.verification_dir !== undefined) {
        currentState.verification_dir = actionData.verification_dir;
      }
    }
    
    // Validate new state before writing
    if (schema) {
      const validation = atomicIo.validateSchema(currentState, schema);
      if (!validation.valid) {
        atomicIo.writeErrorArtifact(ERROR_DIR, 'state_validation_after', {
          errors: validation.errors,
          state: currentState,
          actionData
        });
        throw new Error(`State validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
    // Atomic write with fsync
    atomicIo.atomicWriteJSON(ACTIVE_TASK_PATH, currentState);
    
    console.log(`✓ Action tracked: ${agent} - ${actionData.action || 'unknown'}`);
    
  } catch (error) {
    console.error(`❌ Failed to track action: ${error.message}`);
    atomicIo.writeErrorArtifact(ERROR_DIR, 'track_action_failure', {
      agent,
      actionData,
      error: error.message,
      stack: error.stack
    });
    throw error;
    
  } finally {
    // Release lock
    if (releaseLock) {
      releaseLock();
    }
  }
}

/**
 * Read current active task state
 * @returns {object} Current state
 */
function readState() {
  if (!fs.existsSync(ACTIVE_TASK_PATH)) {
    return {
      task_id: null,
      verification_dir: null,
      phase: 'idle',
      last_worker_action: null,
      last_qa_action: null
    };
  }
  
  return JSON.parse(fs.readFileSync(ACTIVE_TASK_PATH, 'utf8'));
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node track_action.js <agent> <action> [key=value...]');
    console.log('');
    console.log('Examples:');
    console.log('  node track_action.js worker "implemented login feature" files_modified=src/login.ts status=success');
    console.log('  node track_action.js qa "reviewed files" files_reviewed=src/login.ts status=findings_created');
    console.log('  node track_action.js worker precheck status=precheck_fail');
    process.exit(1);
  }
  
  const agent = args[0];
  const action = args[1];
  const actionData = { action };
  
  // Parse additional key=value arguments
  for (let i = 2; i < args.length; i++) {
    const [key, value] = args[i].split('=');
    if (key && value) {
      // Handle arrays (comma-separated)
      if (value.includes(',')) {
        actionData[key] = value.split(',');
      } else {
        actionData[key] = value;
      }
    }
  }
  
  trackAction(agent, actionData)
    .then(() => {
      console.log('✓ State updated successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  trackAction,
  readState
};
