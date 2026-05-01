export type AdapterRecord = Record<string, any>;
export type AdapterMetadata = {
    source: string;
    loadedAt: string;
    warning?: string;
    rowCount?: number;
};
export type AdapterResult = {
    records: AdapterRecord[];
    metadata: AdapterMetadata;
};
export interface IAdapter {
    load(params: any): Promise<AdapterResult>;
}
