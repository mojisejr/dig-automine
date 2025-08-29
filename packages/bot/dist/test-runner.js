"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotTestRunner = void 0;
const web3_1 = require("./services/web3");
const contract_1 = require("./services/contract");
const mine_monitor_1 = require("./services/mine-monitor");
const config_1 = require("./utils/config");
const logger_1 = require("./utils/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class BotTestRunner {
    constructor() {
        this.testResults = [];
        try {
            this.config = (0, config_1.getBotConfig)();
            this.web3Service = new web3_1.Web3Service(this.config);
            this.contractService = new contract_1.ContractService(this.web3Service, this.config);
            this.mineMonitor = new mine_monitor_1.MineMonitorService(this.web3Service, this.contractService, this.config);
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize test runner', error, 'TEST_RUNNER');
            throw error;
        }
    }
    async runTest(testName, testFunction) {
        const startTime = Date.now();
        logger_1.logger.info(`🧪 Running test: ${testName}`, 'TEST_RUNNER');
        try {
            const result = await testFunction();
            const duration = Date.now() - startTime;
            const testResult = {
                testName,
                status: 'passed',
                duration,
                details: result
            };
            logger_1.logger.info(`✅ Test passed: ${testName} (${duration}ms)`, 'TEST_RUNNER');
            return testResult;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const testResult = {
                testName,
                status: 'failed',
                duration,
                details: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            logger_1.logger.error(`❌ Test failed: ${testName} (${duration}ms)`, error, 'TEST_RUNNER');
            return testResult;
        }
    }
    async testConnectionAndSetup() {
        return this.runTest('Connection and Setup', async () => {
            const blockNumber = await this.web3Service.getBlockNumber();
            const account = this.web3Service.getAccount();
            const balance = await this.web3Service.getBalance(account.address);
            return {
                blockNumber: Number(blockNumber),
                account: account.address,
                balance: balance.toString(),
                rpcUrl: this.config.rpcUrl,
                chainId: this.config.chainId
            };
        });
    }
    async testBotRoleVerification() {
        return this.runTest('Bot Role Verification', async () => {
            const hasRole = await this.contractService.verifyBotRole();
            if (!hasRole) {
                throw new Error('Bot does not have required BOT_ROLE');
            }
            return { hasRole };
        });
    }
    async testContractStatsRead() {
        return this.runTest('Contract Stats Read', async () => {
            const stats = await this.contractService.getContractStats();
            return stats;
        });
    }
    async testMineStatusMonitoring() {
        return this.runTest('Mine Status Monitoring', async () => {
            const mineStatuses = await this.mineMonitor.checkAllMines();
            const recommendation = await this.mineMonitor.getMineSwitchRecommendation();
            return {
                currentMine: mineStatuses.current,
                targetMine: mineStatuses.target,
                recommendation: recommendation.recommendation,
                reason: recommendation.reason
            };
        });
    }
    async testMineSwitchOperation() {
        return this.runTest('Mine Switch Operation', async () => {
            const recommendation = await this.mineMonitor.getMineSwitchRecommendation();
            if (recommendation.recommendation !== 'switch') {
                return {
                    skipped: true,
                    reason: `Switch not recommended: ${recommendation.reason}`
                };
            }
            if (!recommendation.targetMine) {
                throw new Error('No target mine provided for switching');
            }
            const operation = await this.contractService.switchMine(recommendation.targetMine);
            if (operation.status === 'failed') {
                throw new Error(operation.error || 'Mine switch failed');
            }
            return operation;
        });
    }
    async runAllTests() {
        logger_1.logger.info('🚀 Starting AutoMine Bot Integration Tests', 'TEST_RUNNER');
        this.testResults = [];
        const tests = [
            () => this.testConnectionAndSetup(),
            () => this.testBotRoleVerification(),
            () => this.testContractStatsRead(),
            () => this.testMineStatusMonitoring(),
            () => this.testMineSwitchOperation()
        ];
        for (const test of tests) {
            const result = await test();
            this.testResults.push(result);
        }
        const report = {
            timestamp: new Date().toISOString(),
            environment: 'testnet',
            totalTests: this.testResults.length,
            passed: this.testResults.filter(r => r.status === 'passed').length,
            failed: this.testResults.filter(r => r.status === 'failed').length,
            skipped: this.testResults.filter(r => r.status === 'skipped').length,
            results: this.testResults
        };
        this.generateTestReport(report);
        logger_1.logger.info(`📊 Test Summary: ${report.passed} passed, ${report.failed} failed, ${report.skipped} skipped`, 'TEST_RUNNER');
        if (report.failed > 0) {
            logger_1.logger.error('Some tests failed. Check the test report for details.', null, 'TEST_RUNNER');
        }
        else {
            logger_1.logger.info('All tests passed! Bot is ready for operation.', 'TEST_RUNNER');
        }
        return report;
    }
    generateTestReport(report) {
        const reportsDir = path_1.default.join(__dirname, '../../../docs/reports');
        if (!fs_1.default.existsSync(reportsDir)) {
            fs_1.default.mkdirSync(reportsDir, { recursive: true });
        }
        const reportFile = path_1.default.join(reportsDir, `bot-integration-test-${Date.now()}.json`);
        fs_1.default.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        const markdownReport = this.generateMarkdownReport(report);
        const mdReportFile = path_1.default.join(reportsDir, `bot-integration-test-${Date.now()}.md`);
        fs_1.default.writeFileSync(mdReportFile, markdownReport);
        logger_1.logger.info(`📄 Test report saved to: ${reportFile}`, 'TEST_RUNNER');
        logger_1.logger.info(`📋 Markdown report saved to: ${mdReportFile}`, 'TEST_RUNNER');
    }
    generateMarkdownReport(report) {
        return `# AutoMine Bot Integration Test Report

**Date**: ${report.timestamp}  
**Environment**: ${report.environment}  
**Total Tests**: ${report.totalTests}  
**Passed**: ${report.passed} ✅  
**Failed**: ${report.failed} ${report.failed > 0 ? '❌' : ''}  
**Skipped**: ${report.skipped} ${report.skipped > 0 ? '⏭️' : ''}  

## Test Results

${report.results.map(result => {
            const status = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
            return `### ${status} ${result.testName} (${result.duration}ms)

${result.error ? `**Error**: ${result.error}\n` : ''}
${result.details ? `**Details**: \`\`\`json\n${JSON.stringify(result.details, null, 2)}\n\`\`\`\n` : ''}`;
        }).join('\n')}

## Summary

${report.failed === 0 ?
            '🎉 All tests passed! The bot is ready for automated operation.' :
            `⚠️  ${report.failed} test(s) failed. Please review and fix issues before proceeding.`}
`;
    }
}
exports.BotTestRunner = BotTestRunner;
// CLI runner
if (require.main === module) {
    const testRunner = new BotTestRunner();
    testRunner.runAllTests()
        .then(report => {
        if (report.failed > 0) {
            process.exit(1);
        }
    })
        .catch(error => {
        logger_1.logger.error('Test runner crashed', error, 'TEST_RUNNER');
        process.exit(1);
    });
}
//# sourceMappingURL=test-runner.js.map