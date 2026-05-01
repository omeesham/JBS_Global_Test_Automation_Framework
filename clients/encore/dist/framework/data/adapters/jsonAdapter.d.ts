import { IAdapter, AdapterResult } from './IAdapter';
export declare class JsonAdapter implements IAdapter {
    load(params: {
        file?: string;
        url?: string;
        rootKey?: string;
    }): Promise<AdapterResult>;
    private loadFromFile;
    private loadFromUrl;
    private normalizeData;
    private logWarning;
}
