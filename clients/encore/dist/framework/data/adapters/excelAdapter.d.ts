import { IAdapter, AdapterResult } from './IAdapter';
export declare class ExcelAdapter implements IAdapter {
    load(params: {
        file: string;
        sheet?: string;
    }): Promise<AdapterResult>;
    private logWarning;
}
