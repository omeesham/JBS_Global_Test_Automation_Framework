/**
 * @agent-doc
 * PURPOSE: Central registry for creating data adapter instances at runtime. Factory pattern for Excel, JSON, Database, and S3 data sources.
 * OWNER: human-only
 * IMPACT: medium - Data-driven tests depend on this. Breaking it fails all data adapter tests. New data sources must register here.
 * DEPENDS-ON: IAdapter interface, ExcelAdapter, JsonAdapter, DbAdapter, S3Adapter
 * USED-BY: Data-driven tests, test data loading utilities
 * RULES: Keep AdapterType in sync with adapter implementations. Always validate adapter type before instantiation. New adapters must implement IAdapter interface.
 */

/** Central registry for creating data adapter instances at runtime */

import { IAdapter } from './IAdapter';
import { ExcelAdapter } from './excelAdapter';
import { JsonAdapter } from './jsonAdapter';
import { DbAdapter } from './dbAdapter';
import { S3Adapter } from './s3Adapter';

/** Valid adapter type identifiers */
export type AdapterType = 'excel' | 'json' | 'db' | 's3';

/** Adapter class constructor type for dynamic instantiation */
type AdapterConstructor = new () => IAdapter;

/** Manages registration and creation of data adapter instances */
export class AdapterFactory {
  /** Registry mapping adapter types to their constructors */
  private static adapters: Map<AdapterType, AdapterConstructor> = new Map([
    ['excel', ExcelAdapter],
    ['json', JsonAdapter],
    ['db', DbAdapter],
    ['s3', S3Adapter]
  ] as Array<[AdapterType, AdapterConstructor]>);

  /** Creates new instance of requested adapter type; throws if type unknown */
  static getAdapter(type: AdapterType): IAdapter {
    if (!this.adapters.has(type)) {
      const supportedTypes = Array.from(this.adapters.keys()).join(', ');
      throw new Error(
        `Unknown adapter type: "${type}". Supported types: ${supportedTypes}\n` +
        `To add custom adapter: AdapterFactory.registerAdapter('${type}', YourAdapterClass)`
      );
    }

    const AdapterConstructor = this.adapters.get(type)!;
    return new AdapterConstructor();
  }

  /** Adds custom adapter type to registry; warns if overwriting existing type */
  static registerAdapter(type: AdapterType, constructor: AdapterConstructor): void {
    if (this.adapters.has(type)) {
      console.warn(`[WARN]  AdapterFactory: Overwriting existing adapter type "${type}"`);
    }
    this.adapters.set(type, constructor);
    console.log(`[OK] AdapterFactory: Registered custom adapter type "${type}"`);
  }

  /** Returns list of all registered adapter type identifiers */
  static getSupportedTypes(): AdapterType[] {
    return Array.from(this.adapters.keys());
  }
}
