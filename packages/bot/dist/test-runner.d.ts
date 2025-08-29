interface TestResult {
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    details: any;
    error?: string;
}
interface TestReport {
    timestamp: string;
    environment: 'testnet';
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    results: TestResult[];
}
export declare class BotTestRunner {
    private web3Service;
    private contractService;
    private mineMonitor;
    private config;
    private testResults;
    constructor();
    private runTest;
    testConnectionAndSetup(): Promise<TestResult>;
    testBotRoleVerification(): Promise<TestResult>;
    testContractStatsRead(): Promise<TestResult>;
    testMineStatusMonitoring(): Promise<TestResult>;
    testMineSwitchOperation(): Promise<TestResult>;
    runAllTests(): Promise<TestReport>;
    private generateTestReport;
    private generateMarkdownReport;
}
export {};
//# sourceMappingURL=test-runner.d.ts.map