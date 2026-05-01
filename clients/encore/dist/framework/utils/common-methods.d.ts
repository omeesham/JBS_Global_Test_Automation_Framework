import { Page } from '@playwright/test';
import { IConfig } from '../framework-contracts';
export declare class CommonMethods {
    constructor(_page: Page);
    static initProp(): IConfig;
    static generateTotpCode(secret: string): string;
}
