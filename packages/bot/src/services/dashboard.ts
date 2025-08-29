import { ContractService } from './contract';
import { MineMonitorService } from './mine-monitor';
import { Web3Service } from './web3';
import { BotConfig } from '../types';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export interface DashboardData {
  timestamp: string;
  botStatus: 'online' | 'offline' | 'error';
  contractStats: {
    totalTokens: number;
    activeUsers: number;
    currentMine: string;
    targetMine: string;
  };
  mineStatuses: {
    current: { name: string; isActive: boolean; address: string };
    target: { name: string; isActive: boolean; address: string };
  };
  recommendation: {
    action: 'switch' | 'wait' | 'no-action';
    reason: string;
  };
  systemHealth: {
    blockHeight: number;
    botBalance: string;
    lastOperation: string;
    errorCount: number;
  };
}

export class DashboardService {
  private web3Service: Web3Service;
  private contractService: ContractService;
  private mineMonitor: MineMonitorService;
  private config: BotConfig;
  private errorCount = 0;
  private lastOperation = 'startup';

  constructor(
    web3Service: Web3Service, 
    contractService: ContractService, 
    mineMonitor: MineMonitorService,
    config: BotConfig
  ) {
    this.web3Service = web3Service;
    this.contractService = contractService;
    this.mineMonitor = mineMonitor;
    this.config = config;
  }

  async collectDashboardData(): Promise<DashboardData> {
    try {
      logger.debug('Collecting dashboard data...', 'DASHBOARD');

      const [contractStats, mineStatuses, recommendation, blockHeight, balance] = await Promise.all([
        this.contractService.getContractStats().catch(error => {
          this.errorCount++;
          logger.error('Failed to get contract stats', error, 'DASHBOARD');
          return { totalTokens: 0, activeUsers: 0, current: '0x0', target: '0x0' };
        }),
        this.mineMonitor.checkAllMines().catch(error => {
          this.errorCount++;
          logger.error('Failed to check mine statuses', error, 'DASHBOARD');
          return {
            current: { name: 'Unknown', isActive: false, address: '0x0', lastChecked: 0 },
            target: { name: 'Unknown', isActive: false, address: '0x0', lastChecked: 0 }
          };
        }),
        this.mineMonitor.getMineSwitchRecommendation().catch(error => {
          this.errorCount++;
          logger.error('Failed to get mine recommendation', error, 'DASHBOARD');
          return { recommendation: 'no-action' as const, reason: 'Error getting recommendation', targetMine: null, stats: null };
        }),
        this.web3Service.getBlockNumber().catch(error => {
          this.errorCount++;
          return BigInt(0);
        }),
        this.web3Service.getBalance(this.web3Service.getAccount().address).catch(error => {
          this.errorCount++;
          return BigInt(0);
        })
      ]);

      const dashboardData: DashboardData = {
        timestamp: new Date().toISOString(),
        botStatus: this.errorCount === 0 ? 'online' : 'error',
        contractStats: {
          totalTokens: contractStats.totalTokens,
          activeUsers: contractStats.activeUsers,
          currentMine: contractStats.current,
          targetMine: contractStats.target
        },
        mineStatuses: {
          current: {
            name: mineStatuses.current.name,
            isActive: mineStatuses.current.isActive,
            address: mineStatuses.current.address
          },
          target: {
            name: mineStatuses.target.name,
            isActive: mineStatuses.target.isActive,
            address: mineStatuses.target.address
          }
        },
        recommendation: {
          action: recommendation.recommendation,
          reason: recommendation.reason
        },
        systemHealth: {
          blockHeight: Number(blockHeight),
          botBalance: balance.toString(),
          lastOperation: this.lastOperation,
          errorCount: this.errorCount
        }
      };

      this.saveDashboardData(dashboardData);
      return dashboardData;
    } catch (error) {
      logger.error('Failed to collect dashboard data', error, 'DASHBOARD');
      throw error;
    }
  }

  private saveDashboardData(data: DashboardData): void {
    try {
      const dashboardDir = path.join(__dirname, '../../../../docs/dashboard');
      if (!fs.existsSync(dashboardDir)) {
        fs.mkdirSync(dashboardDir, { recursive: true });
      }

      // Save current status
      const statusFile = path.join(dashboardDir, 'current-status.json');
      fs.writeFileSync(statusFile, JSON.stringify(data, null, 2));

      // Append to historical data
      const historyFile = path.join(dashboardDir, 'status-history.jsonl');
      fs.appendFileSync(historyFile, JSON.stringify(data) + '\n');

      logger.debug('Dashboard data saved', 'DASHBOARD');
    } catch (error) {
      logger.error('Failed to save dashboard data', error, 'DASHBOARD');
    }
  }

  updateLastOperation(operation: string): void {
    this.lastOperation = operation;
    logger.debug(`Updated last operation to: ${operation}`, 'DASHBOARD');
  }

  reportError(): void {
    this.errorCount++;
  }

  resetErrorCount(): void {
    this.errorCount = 0;
  }

  generateStatusReport(): string {
    const data = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../../../../docs/dashboard/current-status.json'),
      'utf8'
    )) as DashboardData;

    return `
🤖 AutoMine Bot Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Last Updated: ${new Date(data.timestamp).toLocaleString()}
🟢 Bot Status: ${data.botStatus.toUpperCase()}
📊 Contract Stats:
   • Total Staked NFTs: ${data.contractStats.totalTokens}
   • Active Users: ${data.contractStats.activeUsers}

⛏️  Mine Status:
   • Current: ${data.mineStatuses.current.name} ${data.mineStatuses.current.isActive ? '🟢' : '🔴'}
   • Target: ${data.mineStatuses.target.name} ${data.mineStatuses.target.isActive ? '🟢' : '🔴'}

🎯 Recommendation: ${data.recommendation.action.toUpperCase()}
📝 Reason: ${data.recommendation.reason}

🔧 System Health:
   • Block Height: ${data.systemHealth.blockHeight}
   • Bot Balance: ${data.systemHealth.botBalance} wei
   • Last Operation: ${data.systemHealth.lastOperation}
   • Error Count: ${data.systemHealth.errorCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }
}