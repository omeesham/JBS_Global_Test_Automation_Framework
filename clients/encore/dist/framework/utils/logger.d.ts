export declare class Logger {
    private static logFile;
    private static specContext;
    static setSpecContext(specFile: string): void;
    private static get currentLogFile();
    private static write;
    static info(message: string): void;
    static error(message: string): void;
    static warn(message: string): void;
    static debug(message: string): void;
}
export declare const Log: typeof Logger;
