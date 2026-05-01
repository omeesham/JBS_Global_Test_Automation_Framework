"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterFactory = void 0;
const excelAdapter_1 = require("./excelAdapter");
const jsonAdapter_1 = require("./jsonAdapter");
const dbAdapter_1 = require("./dbAdapter");
const s3Adapter_1 = require("./s3Adapter");
class AdapterFactory {
    static adapters = new Map([
        ['excel', excelAdapter_1.ExcelAdapter],
        ['json', jsonAdapter_1.JsonAdapter],
        ['db', dbAdapter_1.DbAdapter],
        ['s3', s3Adapter_1.S3Adapter]
    ]);
    static getAdapter(type) {
        if (!this.adapters.has(type)) {
            const supportedTypes = Array.from(this.adapters.keys()).join(', ');
            throw new Error(`Unknown adapter type: "${type}". Supported types: ${supportedTypes}\n` +
                `To add custom adapter: AdapterFactory.registerAdapter('${type}', YourAdapterClass)`);
        }
        const AdapterConstructor = this.adapters.get(type);
        return new AdapterConstructor();
    }
    static registerAdapter(type, constructor) {
        if (this.adapters.has(type)) {
            console.warn(`[WARN]  AdapterFactory: Overwriting existing adapter type "${type}"`);
        }
        this.adapters.set(type, constructor);
        console.log(`[OK] AdapterFactory: Registered custom adapter type "${type}"`);
    }
    static getSupportedTypes() {
        return Array.from(this.adapters.keys());
    }
}
exports.AdapterFactory = AdapterFactory;
