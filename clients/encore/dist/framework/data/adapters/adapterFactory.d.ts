import { IAdapter } from './IAdapter';
export type AdapterType = 'excel' | 'json' | 'db' | 's3';
type AdapterConstructor = new () => IAdapter;
export declare class AdapterFactory {
    private static adapters;
    static getAdapter(type: AdapterType): IAdapter;
    static registerAdapter(type: AdapterType, constructor: AdapterConstructor): void;
    static getSupportedTypes(): AdapterType[];
}
export {};
