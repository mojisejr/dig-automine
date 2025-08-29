import { Web3Service } from './services/web3';
import { ContractService } from './services/contract';
import { MineMonitorService } from './services/mine-monitor';
import { getBotConfig } from './utils/config';
import { logger } from './utils/logger';
import fs from 'fs';
import path from 'path';

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

export class BotTestRunner {
  private web3Service: Web3Service;
  private contractService: ContractService;
  private mineMonitor: MineMonitorService;
  private config: any;
  private testResults: TestResult[] = [];

  constructor() {
    try {
      this.config = getBotConfig();
      this.web3Service = new Web3Service(this.config);
      this.contractService = new ContractService(this.web3Service, this.config);
      this.mineMonitor = new MineMonitorService(this.web3Service, this.contractService, this.config);
    } catch (error) {
      logger.error('Failed to initialize test runner', error, 'TEST_RUNNER');
      throw error;
    }
  }

  private async runTest(testName: string, testFunction: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    logger.info(`🧪 Running test: ${testName}`, 'TEST_RUNNER');

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        testName,
        status: 'passed',
        duration,
        details: result
      };

      logger.info(`✅ Test passed: ${testName} (${duration}ms)`, 'TEST_RUNNER');
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        testName,
        status: 'failed',
        duration,
        details: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      logger.error(`❌ Test failed: ${testName} (${duration}ms)`, error, 'TEST_RUNNER');
      return testResult;
    }
  }

  async testConnectionAndSetup(): Promise<TestResult> {
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

  async testBotRoleVerification(): Promise<TestResult> {
    return this.runTest('Bot Role Verification', async () => {
      const hasRole = await this.contractService.verifyBotRole();
      if (!hasRole) {
        throw new Error('Bot does not have required BOT_ROLE');
      }
      return { hasRole };
    });
  }

  async testContractStatsRead(): Promise<TestResult> {
    return this.runTest('Contract Stats Read', async () => {
      const stats = await this.contractService.getContractStats();
      return stats;
    });
  }

  async testMineStatusMonitoring(): Promise<TestResult> {
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

  async testMineSwitchOperation(): Promise<TestResult> {
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

  async runAllTests(): Promise<TestReport> {
    logger.info('🚀 Starting AutoMine Bot Integration Tests', 'TEST_RUNNER');
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

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      environment: 'testnet',
      totalTests: this.testResults.length,
      passed: this.testResults.filter(r => r.status === 'passed').length,
      failed: this.testResults.filter(r => r.status === 'failed').length,
      skipped: this.testResults.filter(r => r.status === 'skipped').length,
      results: this.testResults
    };

    this.generateTestReport(report);
    
    logger.info(`📊 Test Summary: ${report.passed} passed, ${report.failed} failed, ${report.skipped} skipped`, 'TEST_RUNNER');
    
    if (report.failed > 0) {
      logger.error('Some tests failed. Check the test report for details.', null, 'TEST_RUNNER');
    } else {
      logger.info('All tests passed! Bot is ready for operation.', 'TEST_RUNNER');
    }

    return report;
  }

  private generateTestReport(report: TestReport): void {
    const reportsDir = path.join(__dirname, '../../../docs/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `bot-integration-test-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    const markdownReport = this.generateMarkdownReport(report);
    const mdReportFile = path.join(reportsDir, `bot-integration-test-${Date.now()}.md`);
    fs.writeFileSync(mdReportFile, markdownReport);

    logger.info(`📄 Test report saved to: ${reportFile}`, 'TEST_RUNNER');
    logger.info(`📋 Markdown report saved to: ${mdReportFile}`, 'TEST_RUNNER');
  }

  private generateMarkdownReport(report: TestReport): string {
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
      logger.error('Test runner crashed', error, 'TEST_RUNNER');
      process.exit(1);
    });
}