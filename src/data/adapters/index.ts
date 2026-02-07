/**
 * FILE: src/data/adapters/index.ts
 * PURPOSE: Barrel export for data adapter module - provides single import point
 * CONTENTS: Re-exports all adapters, factory, and shared types
 * DEPENDENCIES: All adapter implementations and types
 * USED BY:
 *   - src/tests/[any]/[file].spec.ts (imports adapters)
 *   - src/utils/testDataLoader.ts (imports factory)
 *   - Documentation and examples
 * 
 * WHY NECESSARY:
 * Simplifies imports from tests and utilities.
 * Instead of: import { ExcelAdapter } from './adapters/excelAdapter';
 * Users can: import { ExcelAdapter, AdapterFactory } from './adapters';
 * Provides cleaner API surface and better developer experience.
 */

// Core types and interface
export type { IAdapter, AdapterRecord, AdapterMetadata, AdapterResult } from './IAdapter';

// Adapter implementations
export { ExcelAdapter } from './excelAdapter';
export { JsonAdapter } from './jsonAdapter';
export { DbAdapter } from './dbAdapter';
export { S3Adapter } from './s3Adapter';

// Factory and types
export { AdapterFactory } from './adapterFactory';
export type { AdapterType } from './adapterFactory';
