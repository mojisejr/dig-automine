"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogLevel = exports.logger = void 0;
class Logger {
    constructor(logLevel = 'info') {
        this.logLevel = logLevel;
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }
    createLogEntry(level, message, operation, transactionHash, error) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            operation,
            transactionHash,
            error
        };
    }
    output(entry) {
        const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}:`;
        const operation = entry.operation ? ` [${entry.operation}]` : '';
        const txHash = entry.transactionHash ? ` (tx: ${entry.transactionHash})` : '';
        console.log(`${prefix}${operation} ${entry.message}${txHash}`);
        if (entry.error) {
            console.error('Error details:', entry.error);
        }
    }
    debug(message, operation, transactionHash) {
        if (!this.shouldLog('debug'))
            return;
        const entry = this.createLogEntry('debug', message, operation, transactionHash);
        this.output(entry);
    }
    info(message, operation, transactionHash) {
        if (!this.shouldLog('info'))
            return;
        const entry = this.createLogEntry('info', message, operation, transactionHash);
        this.output(entry);
    }
    error(message, error, operation, transactionHash) {
        if (!this.shouldLog('error'))
            return;
        const entry = this.createLogEntry('error', message, operation, transactionHash, error);
        this.output(entry);
    }
}
exports.logger = new Logger();
const setLogLevel = (level) => {
    exports.logger.logLevel = level;
};
exports.setLogLevel = setLogLevel;
//# sourceMappingURL=logger.js.map