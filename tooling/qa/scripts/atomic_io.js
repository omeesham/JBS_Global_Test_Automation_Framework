#!/usr/bin/env node
// File: tooling/qa/scripts/atomic_io.js
// Purpose: Production-grade atomic I/O utilities with async locks, fsync, schema validation, and boundary checks
// Version: 2.0 (Hardened)

const fs = require('fs');
const path = require('path');

// ============================================================================
// ASYNC NON-BLOCKING LOCKS
// ============================================================================

/**
 * Acquire a lock file with async retry and stale lock detection
 * @param {string} lockPath - Path to lock file
 * @param {number} timeout - Max wait time in ms (default 30000)
 * @returns {Promise<Function>} Release function to call when done
 */
async function acquireLock(lockPath, timeout = 30000) {
  const startTime = Date.now();
  const STALE_THRESHOLD = 30000; // 30 seconds
  const RETRY_DELAY = 100; // 100ms between retries
  
  while (Date.now() - startTime < timeout) {
    try {
      // Check if lock exists
      if (fs.existsSync(lockPath)) {
        const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        const lockAge = Date.now() - lockData.timestamp;
        
        // Remove stale locks
        if (lockAge > STALE_THRESHOLD) {
          console.warn(`⚠ Removing stale lock (${Math.round(lockAge/1000)}s old): ${lockPath}`);
          fs.unlinkSync(lockPath);
          continue; // Try to acquire now
        }
        
        // Lock is fresh, wait and retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      
      // No lock exists, create it
      const lockDir = path.dirname(lockPath);
      if (!fs.existsSync(lockDir)) {
        fs.mkdirSync(lockDir, { recursive: true });
      }
      
      fs.writeFileSync(lockPath, JSON.stringify({
        pid: process.pid,
        timestamp: Date.now(),
        hostname: require('os').hostname()
      }));
      
      // Return release function
      return () => {
        if (fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
        }
      };
      
    } catch (error) {
      // Race condition or I/O error, retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  throw new Error(`Failed to acquire lock after ${timeout}ms: ${lockPath}`);
}

// ============================================================================
// ATOMIC WRITES WITH FSYNC
// ============================================================================

/**
 * Atomically write JSON data with fsync before rename
 * @param {string} filePath - Target file path
 * @param {object} data - Data to write
 */
function atomicWriteJSON(filePath, data) {
  const dir = path.dirname(filePath);
  const tempPath = path.join(dir, `.${path.basename(filePath)}.tmp.${process.pid}`);
  
  try {
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to temp file
    const content = JSON.stringify(data, null, 2);
    const fd = fs.openSync(tempPath, 'w');
    fs.writeSync(fd, content);
    
    // CRITICAL: fsync before rename for durability
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    
    // Atomic rename
    fs.renameSync(tempPath, filePath);
    
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

/**
 * Atomically write text data with fsync before rename
 * @param {string} filePath - Target file path
 * @param {string} content - Text content to write
 */
function atomicWriteText(filePath, content) {
  const dir = path.dirname(filePath);
  const tempPath = path.join(dir, `.${path.basename(filePath)}.tmp.${process.pid}`);
  
  try {
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to temp file
    const fd = fs.openSync(tempPath, 'w');
    fs.writeSync(fd, content);
    
    // CRITICAL: fsync before rename for durability
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    
    // Atomic rename
    fs.renameSync(tempPath, filePath);
    
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

// ============================================================================
// SCHEMA VALIDATION WITH UNION TYPE SUPPORT
// ============================================================================

/**
 * Check if value matches one of the expected types (supports union types)
 * @param {string|Array<string>} expectedTypes - Type or array of types like ["string", "null"]
 * @param {*} value - Value to check
 * @returns {boolean}
 */
function typeMatches(expectedTypes, value) {
  const types = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
  
  for (const type of types) {
    if (type === 'null' && value === null) return true;
    if (type === 'string' && typeof value === 'string') return true;
    if (type === 'number' && typeof value === 'number') return true;
    if (type === 'boolean' && typeof value === 'boolean') return true;
    if (type === 'array' && Array.isArray(value)) return true;
    if (type === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) return true;
  }
  
  return false;
}

/**
 * Validate data against schema with union type support
 * @param {object} data - Data to validate
 * @param {object} schema - JSON schema object
 * @returns {object} { valid: boolean, errors: Array<string> }
 */
function validateSchema(data, schema) {
  const errors = [];
  
  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Check field types and nested objects
  if (schema.properties) {
    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      if (field in data) {
        const value = data[field];
        
        // Handle union types (e.g., ["string", "null"])
        if (fieldSchema.type) {
          if (!typeMatches(fieldSchema.type, value)) {
            const types = Array.isArray(fieldSchema.type) ? fieldSchema.type.join('|') : fieldSchema.type;
            errors.push(`Field '${field}' has invalid type. Expected ${types}, got ${typeof value}`);
          }
        }
        
        // Validate nested objects
        if (value !== null && typeof value === 'object' && !Array.isArray(value) && fieldSchema.properties) {
          const nestedResult = validateSchema(value, fieldSchema);
          if (!nestedResult.valid) {
            errors.push(...nestedResult.errors.map(e => `${field}.${e}`));
          }
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// SYMLINK-SAFE BOUNDARY VALIDATION
// ============================================================================

/**
 * Validate file is within allowed boundaries (symlink-safe)
 * @param {string} filePath - File path to validate
 * @param {Array<string>} allowedDirs - Array of allowed directory paths
 * @returns {object} { valid: boolean, error: string|null, resolvedPath: string }
 */
function validateBoundary(filePath, allowedDirs) {
  try {
    // Resolve symlinks to real path
    const realPath = fs.existsSync(filePath) 
      ? fs.realpathSync(filePath)
      : fs.realpathSync(path.dirname(filePath)) + path.sep + path.basename(filePath);
    
    // Check if real path starts with any allowed directory
    for (const allowedDir of allowedDirs) {
      const realAllowedDir = fs.realpathSync(allowedDir);
      if (realPath.startsWith(realAllowedDir)) {
        return { valid: true, error: null, resolvedPath: realPath };
      }
    }
    
    return {
      valid: false,
      error: `File outside allowed boundaries: ${realPath}`,
      resolvedPath: realPath
    };
    
  } catch (error) {
    // Handle non-existent paths
    try {
      const dir = path.dirname(filePath);
      const realDir = fs.existsSync(dir) ? fs.realpathSync(dir) : dir;
      const constructedPath = path.join(realDir, path.basename(filePath));
      
      for (const allowedDir of allowedDirs) {
        const realAllowedDir = fs.existsSync(allowedDir) ? fs.realpathSync(allowedDir) : allowedDir;
        if (constructedPath.startsWith(realAllowedDir)) {
          return { valid: true, error: null, resolvedPath: constructedPath };
        }
      }
      
      return {
        valid: false,
        error: `File outside allowed boundaries: ${constructedPath}`,
        resolvedPath: constructedPath
      };
      
    } catch (err) {
      return {
        valid: false,
        error: `Cannot validate boundary: ${err.message}`,
        resolvedPath: filePath
      };
    }
  }
}

// ============================================================================
// ERROR ARTIFACT LOGGING
// ============================================================================

/**
 * Write error artifact for forensic debugging
 * @param {string} errorDir - Directory to write error artifacts
 * @param {string} errorType - Type of error (e.g., 'validation_failure', 'lock_timeout')
 * @param {object} errorData - Error details
 */
function writeErrorArtifact(errorDir, errorType, errorData) {
  try {
    if (!fs.existsSync(errorDir)) {
      fs.mkdirSync(errorDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${errorType}_${timestamp}_${process.pid}.json`;
    const filePath = path.join(errorDir, filename);
    
    const artifact = {
      errorType,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      cwd: process.cwd(),
      ...errorData
    };
    
    atomicWriteJSON(filePath, artifact);
    console.error(`❌ Error artifact written: ${filePath}`);
    
  } catch (err) {
    console.error(`Failed to write error artifact: ${err.message}`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  acquireLock,
  atomicWriteJSON,
  atomicWriteText,
  typeMatches,
  validateSchema,
  validateBoundary,
  writeErrorArtifact
};
