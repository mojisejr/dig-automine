import { LogEntry } from '../types';
import fs from 'fs';
import path from 'path';

class Logger {
  private logLevel: 'debug' | 'info' | 'error';
  private logFile: string | null = null;

  constructor(logLevel: 'debug' | 'info' | 'error' = 'info') {
    this.logLevel = logLevel;
    this.setupFileLogging();
  }

  private setupFileLogging(): void {
    try {
      const logsDir = path.join(__dirname, '../../../../docs/logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      const date = new Date().toISOString().split('T')[0];
      this.logFile = path.join(logsDir, `bot-${date}.log`);
    } catch (error) {
      console.error('Failed to setup file logging:', error);
    }
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
    const logLine = `${prefix}${operation} ${entry.message}${txHash}`;
    
    console.log(logLine);
    
    if (entry.error) {
      console.error('Error details:', entry.error);
    }

    // Write to file
    if (this.logFile) {
      try {
        const fileLogLine = `${logLine}${entry.error ? `\nError: ${JSON.stringify(entry.error, null, 2)}` : ''}\n`;
        fs.appendFileSync(this.logFile, fileLogLine);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
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