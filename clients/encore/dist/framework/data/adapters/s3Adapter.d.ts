import { IAdapter, AdapterResult } from './IAdapter';
export declare class S3Adapter implements IAdapter {
    private client;
    private isStubMode;
    load(params: {
        bucket: string;
        key: string;
        region?: string;
    }): Promise<AdapterResult>;
    private initializeClient;
    private checkCredentials;
    private streamToString;
    private parseContent;
    private logWarning;
}
