"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogLevel = exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Logger {
    constructor(logLevel = 'info') {
        this.logFile = null;
        this.logLevel = logLevel;
        this.setupFileLogging();
    }
    setupFileLogging() {
        try {
            const logsDir = path_1.default.join(__dirname, '../../../../docs/logs');
            if (!fs_1.default.existsSync(logsDir)) {
                fs_1.default.mkdirSync(logsDir, { recursive: true });
            }
            const date = new Date().toISOString().split('T')[0];
            this.logFile = path_1.default.join(logsDir, `bot-${date}.log`);
        }
        catch (error) {
            console.error('Failed to setup file logging:', error);
        }
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
        const logLine = `${prefix}${operation} ${entry.message}${txHash}`;
        console.log(logLine);
        if (entry.error) {
            console.error('Error details:', entry.error);
        }
        // Write to file
        if (this.logFile) {
            try {
                const fileLogLine = `${logLine}${entry.error ? `\nError: ${JSON.stringify(entry.error, null, 2)}` : ''}\n`;
                fs_1.default.appendFileSync(this.logFile, fileLogLine);
            }
            catch (error) {
                console.error('Failed to write to log file:', error);
            }
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