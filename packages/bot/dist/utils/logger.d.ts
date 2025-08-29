declare class Logger {
    private logLevel;
    private logFile;
    constructor(logLevel?: 'debug' | 'info' | 'error');
    private setupFileLogging;
    private shouldLog;
    private createLogEntry;
    private output;
    debug(message: string, operation?: string, transactionHash?: string): void;
    info(message: string, operation?: string, transactionHash?: string): void;
    error(message: string, error?: any, operation?: string, transactionHash?: string): void;
}
export declare const logger: Logger;
export declare const setLogLevel: (level: "debug" | "info" | "error") => void;
export {};
//# sourceMappingURL=logger.d.ts.map