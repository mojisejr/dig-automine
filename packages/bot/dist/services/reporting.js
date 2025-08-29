"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
class ReportingService {
    constructor() {
        this.dailyOperations = [];
        this.transactions = [];
        this.operationStartTimes = new Map();
        this.reportsDir = path_1.default.join(__dirname, '../../../../docs/reports');
        this.setupReportsDirectory();
        this.loadDailyData();
    }
    setupReportsDirectory() {
        try {
            if (!fs_1.default.existsSync(this.reportsDir)) {
                fs_1.default.mkdirSync(this.reportsDir, { recursive: true });
            }
            // Create subdirectories
            const subdirs = ['daily', 'transactions', 'gas-analysis', 'performance'];
            for (const subdir of subdirs) {
                const fullPath = path_1.default.join(this.reportsDir, subdir);
                if (!fs_1.default.existsSync(fullPath)) {
                    fs_1.default.mkdirSync(fullPath, { recursive: true });
                }
            }
            logger_1.logger.debug('Reports directory structure created', 'REPORTING');
        }
        catch (error) {
            logger_1.logger.error('Failed to setup reports directory', error, 'REPORTING');
        }
    }
    loadDailyData() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const dailyFile = path_1.default.join(this.reportsDir, 'daily', `${today}.json`);
            if (fs_1.default.existsSync(dailyFile)) {
                const data = JSON.parse(fs_1.default.readFileSync(dailyFile, 'utf8'));
                this.dailyOperations = data.operations || [];
                this.transactions = data.transactions || [];
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to load daily data', error, 'REPORTING');
        }
    }
    startOperation(operationId, operationType) {
        this.operationStartTimes.set(operationId, Date.now());
        this.dailyOperations.push({
            id: operationId,
            type: operationType,
            startTime: Date.now(),
            status: 'in_progress'
        });
        logger_1.logger.debug(`Operation started: ${operationType}`, 'REPORTING', operationId);
    }
    completeOperation(operationId, success, transactionHash, gasUsed) {
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
        logger_1.logger.debug(`Operation ${success ? 'completed' : 'failed'}: ${operationId} (${duration}ms)`, 'REPORTING', transactionHash);
    }
    recordTransaction(report) {
        this.transactions.push(report);
        this.saveDailyData();
        this.generateTransactionReport(report);
        logger_1.logger.debug(`Transaction recorded: ${report.operation}`, 'REPORTING', report.hash);
    }
    recordError(operation, error) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            operation,
            error
        };
        const dailySummary = this.getDailySummary();
        dailySummary.errors.push(errorEntry);
        this.saveDailyData();
        logger_1.logger.error(`Error recorded for ${operation}: ${error}`, null, 'REPORTING');
    }
    generateDailyReport() {
        const today = new Date().toISOString().split('T')[0];
        const todayOperations = this.dailyOperations.filter(op => new Date(op.startTime).toISOString().split('T')[0] === today);
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
        const summary = {
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
    generateTransactionReport(transaction) {
        const txFile = path_1.default.join(this.reportsDir, 'transactions', `${transaction.hash}.json`);
        fs_1.default.writeFileSync(txFile, JSON.stringify(transaction, null, 2));
    }
    saveDailyData() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const dailyFile = path_1.default.join(this.reportsDir, 'daily', `${today}.json`);
            const data = {
                date: today,
                operations: this.dailyOperations,
                transactions: this.transactions,
                lastUpdated: new Date().toISOString()
            };
            fs_1.default.writeFileSync(dailyFile, JSON.stringify(data, null, 2));
        }
        catch (error) {
            logger_1.logger.error('Failed to save daily data', error, 'REPORTING');
        }
    }
    saveDailyReport(summary) {
        try {
            const reportFile = path_1.default.join(this.reportsDir, `daily-summary-${summary.date}.json`);
            fs_1.default.writeFileSync(reportFile, JSON.stringify(summary, null, 2));
            // Also save as markdown
            const mdReport = this.generateMarkdownReport(summary);
            const mdFile = path_1.default.join(this.reportsDir, `daily-summary-${summary.date}.md`);
            fs_1.default.writeFileSync(mdFile, mdReport);
            logger_1.logger.info(`Daily report generated for ${summary.date}`, 'REPORTING');
        }
        catch (error) {
            logger_1.logger.error('Failed to save daily report', error, 'REPORTING');
        }
    }
    generateMarkdownReport(summary) {
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
    getDailySummary() {
        return this.generateDailyReport();
    }
    calculateUptime() {
        // Simple uptime calculation - can be enhanced with actual downtime tracking
        const today = new Date().toISOString().split('T')[0];
        const todayOperations = this.dailyOperations.filter(op => new Date(op.startTime).toISOString().split('T')[0] === today);
        if (todayOperations.length === 0)
            return 1;
        const failed = todayOperations.filter(op => op.status === 'failed').length;
        return Math.max(0, 1 - (failed / todayOperations.length));
    }
    getReportsDirectory() {
        return this.reportsDir;
    }
}
exports.ReportingService = ReportingService;
//# sourceMappingURL=reporting.js.map