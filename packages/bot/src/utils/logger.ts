import { LogEntry } from '../types';

class Logger {
  private logLevel: 'debug' | 'info' | 'error';

  constructor(logLevel: 'debug' | 'info' | 'error' = 'info') {
    this.logLevel = logLevel;
  }

  private shouldLog(level: 'debug' | 'info' | 'error'): boolean {
    const levels = ['debug', 'info', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private createLogEntry(
    level: 'debug' | 'info' | 'error',
    message: string,
    operation?: string,
    transactionHash?: string,
    error?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      operation,
      transactionHash,
      error
    };
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}:`;
    const operation = entry.operation ? ` [${entry.operation}]` : '';
    const txHash = entry.transactionHash ? ` (tx: ${entry.transactionHash})` : '';
    
    console.log(`${prefix}${operation} ${entry.message}${txHash}`);
    
    if (entry.error) {
      console.error('Error details:', entry.error);
    }
  }

  debug(message: string, operation?: string, transactionHash?: string): void {
    if (!this.shouldLog('debug')) return;
    const entry = this.createLogEntry('debug', message, operation, transactionHash);
    this.output(entry);
  }

  info(message: string, operation?: string, transactionHash?: string): void {
    if (!this.shouldLog('info')) return;
    const entry = this.createLogEntry('info', message, operation, transactionHash);
    this.output(entry);
  }

  error(message: string, error?: any, operation?: string, transactionHash?: string): void {
    if (!this.shouldLog('error')) return;
    const entry = this.createLogEntry('error', message, operation, transactionHash, error);
    this.output(entry);
  }
}

export const logger = new Logger();

export const setLogLevel = (level: 'debug' | 'info' | 'error'): void => {
  (logger as any).logLevel = level;
};