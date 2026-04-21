/** Defines the standard contract that all data source adapters must implement */

/** Single row/record from any data source (normalized key-value format) */
export type AdapterRecord = Record<string, any>;

/** Context about data source and load operation (source, timestamp, optional warning) */
export type AdapterMetadata = {
  source: string;
  loadedAt: string;
  warning?: string;
  rowCount?: number;
};

/** Standard return type for all adapter load operations */
export type AdapterResult = {
  records: AdapterRecord[];
  metadata: AdapterMetadata;
};

/** Contract for all data adapters. load must always resolve (never reject); use warning metadata for errors */
export interface IAdapter {
 /** Loads data from adapter source, returns normalized AdapterResult (always resolves) */
  load(params: any): Promise<AdapterResult>;
}
