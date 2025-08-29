export interface DailyOperationSummary {
    date: string;
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    mineSwitches: number;
    gasUsed: string;
    errors: Array<{
        timestamp: string;
        operation: string;
        error: string;
    }>;
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
export declare class ReportingService {
    private reportsDir;
    private dailyOperations;
    private transactions;
    private operationStartTimes;
    constructor();
    private setupReportsDirectory;
    private loadDailyData;
    startOperation(operationId: string, operationType: string): void;
    completeOperation(operationId: string, success: boolean, transactionHash?: string, gasUsed?: string): void;
    recordTransaction(report: TransactionReport): void;
    recordError(operation: string, error: string): void;
    generateDailyReport(): DailyOperationSummary;
    private generateTransactionReport;
    private saveDailyData;
    private saveDailyReport;
    private generateMarkdownReport;
    private getDailySummary;
    private calculateUptime;
    getReportsDirectory(): string;
}
//# sourceMappingURL=reporting.d.ts.map