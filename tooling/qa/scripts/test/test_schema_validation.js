#!/usr/bin/env node
// File: tooling/qa/scripts/test/test_schema_validation.js
// Purpose: Test schema validation with union types and nested objects

const atomicIo = require('../atomic_io');

function testUnionTypeValidation() {
  console.log('\n📋 Test: Union type validation (["string", "null"])');
  
  try {
    const schema = {
      properties: {
        name: { type: ['string', 'null'] },
        age: { type: 'number' }
      },
      required: ['name']
    };
    
    // Test valid null
    const data1 = { name: null, age: 25 };
    const result1 = atomicIo.validateSchema(data1, schema);
    if (!result1.valid) {
      throw new Error(`Null should be valid for union type: ${result1.errors.join(', ')}`);
    }
    console.log('  ✓ Null value accepted');
    
    // Test valid string
    const data2 = { name: 'John', age: 25 };
    const result2 = atomicIo.validateSchema(data2, schema);
    if (!result2.valid) {
      throw new Error(`String should be valid for union type: ${result2.errors.join(', ')}`);
    }
    console.log('  ✓ String value accepted');
    
    // Test invalid type (number)
    const data3 = { name: 123, age: 25 };
    const result3 = atomicIo.validateSchema(data3, schema);
    if (result3.valid) {
      throw new Error('Number should be invalid for ["string", "null"] union');
    }
    console.log('  ✓ Invalid type rejected');
    
    console.log('✅ PASS: Union type validation works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testNestedObjectValidation() {
  console.log('\n📋 Test: Nested object validation');
  
  try {
    const schema = {
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' }
          },
          required: ['name']
        }
      },
      required: ['user']
    };
    
    // Valid nested object
    const data1 = {
      user: {
        name: 'John',
        email: 'john@example.com'
      }
    };
    
    const result1 = atomicIo.validateSchema(data1, schema);
    if (!result1.valid) {
      throw new Error(`Valid nested object rejected: ${result1.errors.join(', ')}`);
    }
    console.log('  ✓ Valid nested object accepted');
    
    // Missing required nested field
    const data2 = {
      user: {
        email: 'john@example.com'
      }
    };
    
    const result2 = atomicIo.validateSchema(data2, schema);
    if (result2.valid) {
      throw new Error('Missing required nested field should be invalid');
    }
    console.log('  ✓ Missing nested required field rejected');
    
    console.log('✅ PASS: Nested object validation works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testRequiredFieldValidation() {
  console.log('\n📋 Test: Required field validation');
  
  try {
    const schema = {
      properties: {
        task_id: { type: ['string', 'null'] },
        phase: { type: 'string' }
      },
      required: ['task_id', 'phase']
    };
    
    // Missing required field
    const data1 = { task_id: 'TASK-123' };
    const result1 = atomicIo.validateSchema(data1, schema);
    
    if (result1.valid) {
      throw new Error('Missing required field should be invalid');
    }
    console.log('  ✓ Missing required field rejected');
    
    // All required fields present
    const data2 = { task_id: 'TASK-123', phase: 'development' };
    const result2 = atomicIo.validateSchema(data2, schema);
    
    if (!result2.valid) {
      throw new Error(`Valid data rejected: ${result2.errors.join(', ')}`);
    }
    console.log('  ✓ Valid data with all required fields accepted');
    
    console.log('✅ PASS: Required field validation works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function testTypeMatchesFunction() {
  console.log('\n📋 Test: typeMatches helper function');
  
  try {
    // Test null
    if (!atomicIo.typeMatches(['string', 'null'], null)) {
      throw new Error('null should match ["string", "null"]');
    }
    console.log('  ✓ null matches ["string", "null"]');
    
    // Test string
    if (!atomicIo.typeMatches(['string', 'null'], 'test')) {
      throw new Error('string should match ["string", "null"]');
    }
    console.log('  ✓ string matches ["string", "null"]');
    
    // Test number doesn't match
    if (atomicIo.typeMatches(['string', 'null'], 123)) {
      throw new Error('number should not match ["string", "null"]');
    }
    console.log('  ✓ number does not match ["string", "null"]');
    
    // Test array
    if (!atomicIo.typeMatches('array', [1, 2, 3])) {
      throw new Error('array should match "array"');
    }
    console.log('  ✓ array matches "array"');
    
    // Test object
    if (!atomicIo.typeMatches('object', { key: 'value' })) {
      throw new Error('object should match "object"');
    }
    console.log('  ✓ object matches "object"');
    
    console.log('✅ PASS: typeMatches function works');
    return true;
    
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}`);
    return false;
  }
}

function runAllTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Schema Validation Functions');
  console.log('==================================================');
  
  const results = [];
  
  results.push(testUnionTypeValidation());
  results.push(testNestedObjectValidation());
  results.push(testRequiredFieldValidation());
  results.push(testTypeMatchesFunction());
  
  console.log('\n==================================================');
  console.log('RESULTS');
  console.log('==================================================');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  return passed === total;
}

if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runAllTests };
