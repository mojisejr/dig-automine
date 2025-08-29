import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface DailyOperationSummary {
  date: string;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  mineSwitches: number;
  gasUsed: string;
  errors: Array<{ timestamp: string; operation: string; error: string }>;
  performance: {
    averageResponseTime: number;
    uptime: number;
    successRate: number;
  };
}

export interface TransactionReport {
  hash: string;
  operation: string;
  timestamp: string;
  gasUsed: string;
  gasPrice: string;
  cost: string;
  status: 'success' | 'failed';
  error?: string;
}

export class ReportingService {
  private reportsDir: string;
  private dailyOperations: Array<any> = [];
  private transactions: TransactionReport[] = [];
  private operationStartTimes: Map<string, number> = new Map();

  constructor() {
    this.reportsDir = path.join(__dirname, '../../../../docs/reports');
    this.setupReportsDirectory();
    this.loadDailyData();
  }

  private setupReportsDirectory(): void {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }

      // Create subdirectories
      const subdirs = ['daily', 'transactions', 'gas-analysis', 'performance'];
      for (const subdir of subdirs) {
        const fullPath = path.join(this.reportsDir, subdir);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
      }

      logger.debug('Reports directory structure created', 'REPORTING');
    } catch (error) {
      logger.error('Failed to setup reports directory', error, 'REPORTING');
    }
  }

  private loadDailyData(): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyFile = path.join(this.reportsDir, 'daily', `${today}.json`);
      
      if (fs.existsSync(dailyFile)) {
        const data = JSON.parse(fs.readFileSync(dailyFile, 'utf8'));
        this.dailyOperations = data.operations || [];
        this.transactions = data.transactions || [];
      }
    } catch (error) {
      logger.error('Failed to load daily data', error, 'REPORTING');
    }
  }

  startOperation(operationId: string, operationType: string): void {
    this.operationStartTimes.set(operationId, Date.now());
    this.dailyOperations.push({
      id: operationId,
      type: operationType,
      startTime: Date.now(),
      status: 'in_progress'
    });
    logger.debug(`Operation started: ${operationType}`, 'REPORTING', operationId);
  }

  completeOperation(operationId: string, success: boolean, transactionHash?: string, gasUsed?: string): void {
    const startTime = this.operationStartTimes.get(operationId);
    const duration = startTime ? Date.now() - startTime : 0;

    const operation = this.dailyOperations.find(op => op.id === operationId);
    if (operation) {
      operation.status = success ? 'completed' : 'failed';
      operation.duration = duration;
      operation.transactionHash = transactionHash;
      operation.gasUsed = gasUsed;
      operation.endTime = Date.now();
    }

    this.operationStartTimes.delete(operationId);
    this.saveDailyData();

    logger.debug(`Operation ${success ? 'completed' : 'failed'}: ${operationId} (${duration}ms)`, 'REPORTING', transactionHash);
  }

  recordTransaction(report: TransactionReport): void {
    this.transactions.push(report);
    this.saveDailyData();
    this.generateTransactionReport(report);
    logger.debug(`Transaction recorded: ${report.operation}`, 'REPORTING', report.hash);
  }

  recordError(operation: string, error: string): void {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      operation,
      error
    };

    const dailySummary = this.getDailySummary();
    dailySummary.errors.push(errorEntry);
    this.saveDailyData();

    logger.error(`Error recorded for ${operation}: ${error}`, null, 'REPORTING');
  }

  generateDailyReport(): DailyOperationSummary {
    const today = new Date().toISOString().split('T')[0];
    const todayOperations = this.dailyOperations.filter(op => 
      new Date(op.startTime).toISOString().split('T')[0] === today
    );

    const successful = todayOperations.filter(op => op.status === 'completed');
    const failed = todayOperations.filter(op => op.status === 'failed');
    const mineSwitches = todayOperations.filter(op => op.type === 'mine_switch');

    const totalGasUsed = this.transactions
      .filter(tx => tx.timestamp.split('T')[0] === today)
      .reduce((sum, tx) => sum + BigInt(tx.gasUsed || '0'), 0n);

    const durations = successful.map(op => op.duration || 0).filter(d => d > 0);
    const averageResponseTime = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;

    const summary: DailyOperationSummary = {
      date: today,
      totalOperations: todayOperations.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      mineSwitches: mineSwitches.length,
      gasUsed: totalGasUsed.toString(),
      errors: failed.map(op => ({
        timestamp: new Date(op.startTime).toISOString(),
        operation: op.type,
        error: op.error || 'Unknown error'
      })),
      performance: {
        averageResponseTime,
        uptime: this.calculateUptime(),
        successRate: todayOperations.length > 0 ? successful.length / todayOperations.length : 1
      }
    };

    this.saveDailyReport(summary);
    return summary;
  }

  private generateTransactionReport(transaction: TransactionReport): void {
    const txFile = path.join(this.reportsDir, 'transactions', `${transaction.hash}.json`);
    fs.writeFileSync(txFile, JSON.stringify(transaction, null, 2));
  }

  private saveDailyData(): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyFile = path.join(this.reportsDir, 'daily', `${today}.json`);
      
      const data = {
        date: today,
        operations: this.dailyOperations,
        transactions: this.transactions,
        lastUpdated: new Date().toISOString()
      };

      fs.writeFileSync(dailyFile, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error('Failed to save daily data', error, 'REPORTING');
    }
  }

  private saveDailyReport(summary: DailyOperationSummary): void {
    try {
      const reportFile = path.join(this.reportsDir, `daily-summary-${summary.date}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(summary, null, 2));

      // Also save as markdown
      const mdReport = this.generateMarkdownReport(summary);
      const mdFile = path.join(this.reportsDir, `daily-summary-${summary.date}.md`);
      fs.writeFileSync(mdFile, mdReport);

      logger.info(`Daily report generated for ${summary.date}`, 'REPORTING');
    } catch (error) {
      logger.error('Failed to save daily report', error, 'REPORTING');
    }
  }

  private generateMarkdownReport(summary: DailyOperationSummary): string {
    return `# AutoMine Bot Daily Report - ${summary.date}

## 📊 Operation Summary
- **Total Operations**: ${summary.totalOperations}
- **Successful**: ${summary.successfulOperations} ✅
- **Failed**: ${summary.failedOperations} ${summary.failedOperations > 0 ? '❌' : ''}
- **Mine Switches**: ${summary.mineSwitches}
- **Success Rate**: ${(summary.performance.successRate * 100).toFixed(1)}%

## ⛽ Gas Usage
- **Total Gas Used**: ${summary.gasUsed}
- **Estimated Cost**: ${summary.gasUsed ? (BigInt(summary.gasUsed) * BigInt('20000000000')).toString() : '0'} wei

## 📈 Performance Metrics
- **Average Response Time**: ${summary.performance.averageResponseTime}ms
- **System Uptime**: ${(summary.performance.uptime * 100).toFixed(1)}%

## ❌ Errors
${summary.errors.length === 0 ? 'No errors reported today! ✅' : 
  summary.errors.map(error => `- **${error.timestamp}**: ${error.operation} - ${error.error}`).join('\n')}

---
*Generated by AutoMine Bot Reporting Service*
`;
  }

  private getDailySummary(): DailyOperationSummary {
    return this.generateDailyReport();
  }

  private calculateUptime(): number {
    // Simple uptime calculation - can be enhanced with actual downtime tracking
    const today = new Date().toISOString().split('T')[0];
    const todayOperations = this.dailyOperations.filter(op => 
      new Date(op.startTime).toISOString().split('T')[0] === today
    );

    if (todayOperations.length === 0) return 1;

    const failed = todayOperations.filter(op => op.status === 'failed').length;
    return Math.max(0, 1 - (failed / todayOperations.length));
  }

  getReportsDirectory(): string {
    return this.reportsDir;
  }
}