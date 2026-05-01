import { IAdapter, AdapterResult } from './IAdapter';
export declare class DbAdapter implements IAdapter {
    private client;
    private isStubMode;
    load(params: {
        query: string;
        params?: any[];
        database?: string;
    }): Promise<AdapterResult>;
    private initializeClient;
    private checkCredentials;
    private logWarning;
}
