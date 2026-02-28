/** Barrel export for data adapter module - provides single import point */

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
