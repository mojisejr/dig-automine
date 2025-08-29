import { Address } from 'viem';
import { Web3Service } from './web3';
import { ContractService } from './contract';
import { BotConfig, MineSwitchOperation, UserDeposit } from '../types';
import { logger } from '../utils/logger';

export class MonitorService {
  private web3Service: Web3Service;
  private contractService: ContractService;
  private config: BotConfig;
  private isMonitoring: boolean = false;
  private userDeposits: Map<Address, UserDeposit> = new Map();
  private operationHistory: MineSwitchOperation[] = [];
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(web3Service: Web3Service, contractService: ContractService, config: BotConfig) {
    this.web3Service = web3Service;
    this.contractService = contractService;
    this.config = config;
  }

  async startMonitoring(): Promise<void> {
    try {
      logger.info('Starting monitoring service', 'MONITOR_START');
      this.isMonitoring = true;

      await this.syncUserDeposits();

      this.healthCheckInterval = setInterval(async () => {
        await this.performHealthCheck();
      }, 300000);

      logger.info('Monitoring service started successfully', 'MONITOR_START');
    } catch (error) {
      logger.error('Failed to start monitoring service', error, 'MONITOR_START');
      throw error;
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    logger.info('Monitoring service stopped', 'MONITOR_STOP');
  }

  private async syncUserDeposits(): Promise<void> {
    try {
      logger.debug('Syncing user deposits from contract', 'MONITOR_SYNC');
      
      const depositedTokens = await this.contractService.getDepositedTokens();
      this.userDeposits.clear();

      for (let i = 0; i < depositedTokens.users.length; i++) {
        const userAddress = depositedTokens.users[i];
        const tokenIds = depositedTokens.tokenIds[i];
        
        const userDeposit: UserDeposit = {
          userAddress,
          tokenIds,
          depositTimestamp: Date.now()
        };
        
        this.userDeposits.set(userAddress, userDeposit);
      }

      logger.info(`Synchronized ${this.userDeposits.size} user deposits`, 'MONITOR_SYNC');
    } catch (error) {
      logger.error('Failed to sync user deposits', error, 'MONITOR_SYNC');
    }
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.isMonitoring) return;

    try {
      logger.debug('Performing system health check', 'HEALTH_CHECK');

      const blockNumber = await this.web3Service.getBlockNumber();
      const balance = await this.web3Service.getBalance();
      const currentMine = await this.contractService.getCurrentMine();

      const minBalance = this.config.gasPrice * BigInt(this.config.gasLimit) * BigInt(50);
      
      if (balance < minBalance) {
        logger.error(`Low balance warning: ${balance} KUB (minimum: ${minBalance})`, null, 'HEALTH_CHECK');
      }

      logger.debug(`Health check passed - Block: ${blockNumber}, Balance: ${balance}, Mine: ${currentMine}`, 'HEALTH_CHECK');

      await this.syncUserDeposits();
      
    } catch (error) {
      logger.error('Health check failed', error, 'HEALTH_CHECK');
    }
  }

  async recordOperation(operation: MineSwitchOperation): Promise<void> {
    this.operationHistory.push(operation);
    
    if (this.operationHistory.length > 100) {
      this.operationHistory = this.operationHistory.slice(-50);
    }

    logger.debug(`Recorded operation ${operation.id} with status ${operation.status}`, 'OPERATION_RECORD');
  }

  getOperationHistory(): MineSwitchOperation[] {
    return [...this.operationHistory];
  }

  getUserDeposits(): UserDeposit[] {
    return Array.from(this.userDeposits.values());
  }

  async getSystemStatus(): Promise<{
    isMonitoring: boolean;
    userCount: number;
    totalNFTs: number;
    recentOperations: MineSwitchOperation[];
    currentMine: Address;
    botBalance: bigint;
  }> {
    try {
      const currentMine = await this.contractService.getCurrentMine();
      const botBalance = await this.web3Service.getBalance();
      const userDeposits = Array.from(this.userDeposits.values());
      const totalNFTs = userDeposits.reduce((sum, deposit) => sum + deposit.tokenIds.length, 0);
      const recentOperations = this.operationHistory.slice(-5);

      return {
        isMonitoring: this.isMonitoring,
        userCount: userDeposits.length,
        totalNFTs,
        recentOperations,
        currentMine,
        botBalance
      };
    } catch (error) {
      logger.error('Failed to get system status', error, 'SYSTEM_STATUS');
      throw error;
    }
  }

  async validateOperation(operation: MineSwitchOperation): Promise<boolean> {
    try {
      if (!operation.transactionHash) {
        return false;
      }

      const receipt = await this.web3Service.getPublicClient().getTransactionReceipt({
        hash: operation.transactionHash as `0x${string}`
      });

      return receipt.status === 'success';
    } catch (error) {
      logger.error(`Failed to validate operation ${operation.id}`, error, 'OPERATION_VALIDATION');
      return false;
    }
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}