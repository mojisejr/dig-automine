import * as cron from 'node-cron';
import { ContractService } from './contract';
import { Web3Service } from './web3';
import { BotConfig, MineSwitchOperation } from '../types';
import { logger } from '../utils/logger';
import { Address } from 'viem';

export class SchedulerService {
  private contractService: ContractService;
  private web3Service: Web3Service;
  private config: BotConfig;
  private isRunning: boolean = false;
  private activeOperations: Map<string, MineSwitchOperation> = new Map();
  private cronJob?: cron.ScheduledTask;

  constructor(contractService: ContractService, web3Service: Web3Service, config: BotConfig) {
    this.contractService = contractService;
    this.web3Service = web3Service;
    this.config = config;
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting AutoMine scheduler service', 'SCHEDULER_START');

      const hasRole = await this.contractService.verifyBotRole();
      if (!hasRole) {
        throw new Error('Bot does not have required role in AutoMine contract');
      }

      const cronExpression = this.getCronExpression();
      logger.info(`Scheduling mine switches every ${this.config.mineSwitchIntervalHours} hours using cron: ${cronExpression}`, 'SCHEDULER_SETUP');

      this.cronJob = cron.schedule(cronExpression, async () => {
        await this.executeMineSwitch();
      }, {
        scheduled: false,
        timezone: "UTC"
      });

      this.cronJob.start();
      this.isRunning = true;

      logger.info('Scheduler started successfully', 'SCHEDULER_START');

      await this.performStartupCheck();
    } catch (error) {
      logger.error('Failed to start scheduler', error, 'SCHEDULER_START');
      throw error;
    }
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      logger.info('Scheduler stopped', 'SCHEDULER_STOP');
    }
  }

  private getCronExpression(): string {
    const hours = this.config.mineSwitchIntervalHours;
    
    if (hours === 24) {
      return '0 0 * * *';
    } else if (hours === 12) {
      return '0 */12 * * *';
    } else if (hours === 6) {
      return '0 */6 * * *';
    } else {
      return `0 */${hours} * * *`;
    }
  }

  private async performStartupCheck(): Promise<void> {
    try {
      logger.info('Performing startup system check', 'STARTUP_CHECK');

      const blockNumber = await this.web3Service.getBlockNumber();
      const balance = await this.web3Service.getBalance();
      const currentMine = await this.contractService.getCurrentMine();
      const depositedTokens = await this.contractService.getDepositedTokens();

      logger.info(`System status - Block: ${blockNumber}, Balance: ${balance}, Current Mine: ${currentMine}`, 'STARTUP_CHECK');
      logger.info(`Monitoring ${depositedTokens.users.length} users with deposited NFTs`, 'STARTUP_CHECK');

      if (balance < this.config.gasPrice * BigInt(this.config.gasLimit) * BigInt(10)) {
        logger.error('Bot wallet has insufficient balance for operations', null, 'STARTUP_CHECK');
      }
    } catch (error) {
      logger.error('Startup check failed', error, 'STARTUP_CHECK');
    }
  }

  private async executeMineSwitch(): Promise<void> {
    if (!this.isRunning) {
      logger.debug('Scheduler not running, skipping mine switch', 'MINE_SWITCH');
      return;
    }

    try {
      logger.info('Starting scheduled mine switch execution', 'MINE_SWITCH');

      const depositedTokens = await this.contractService.getDepositedTokens();
      
      if (depositedTokens.users.length === 0) {
        logger.info('No users with deposited NFTs found, skipping mine switch', 'MINE_SWITCH');
        return;
      }

      const currentMine = await this.contractService.getCurrentMine();
      const targetMine = this.getNextTargetMine(currentMine);

      if (currentMine.toLowerCase() === targetMine.toLowerCase()) {
        logger.info('Already in target mine, skipping switch', 'MINE_SWITCH');
        return;
      }

      logger.info(`Switching from ${currentMine} to ${targetMine} for ${depositedTokens.users.length} users`, 'MINE_SWITCH');

      const operation = await this.contractService.switchMine(targetMine);
      this.activeOperations.set(operation.id, operation);

      if (operation.status === 'completed') {
        logger.info(`Mine switch operation completed successfully: ${operation.id}`, 'MINE_SWITCH');
      } else {
        logger.error(`Mine switch operation failed: ${operation.id}`, operation.error, 'MINE_SWITCH');
        await this.handleFailedOperation(operation);
      }

    } catch (error) {
      logger.error('Failed to execute scheduled mine switch', error, 'MINE_SWITCH');
    }
  }

  private getNextTargetMine(currentMine: Address): Address {
    if (this.config.targetMineAddress && this.config.currentMineAddress) {
      return currentMine.toLowerCase() === this.config.currentMineAddress.toLowerCase()
        ? this.config.targetMineAddress as Address
        : this.config.currentMineAddress as Address;
    }
    
    logger.error('Target mine addresses not configured properly', null, 'MINE_SWITCH');
    throw new Error('Target mine addresses not configured');
  }

  private async handleFailedOperation(operation: MineSwitchOperation): Promise<void> {
    if (operation.retryCount < this.config.maxRetries) {
      logger.info(`Retrying failed operation ${operation.id} (attempt ${operation.retryCount + 1}/${this.config.maxRetries})`, 'MINE_SWITCH_RETRY');
      
      setTimeout(async () => {
        try {
          const retryOperation = await this.contractService.switchMine(operation.targetMine as Address);
          retryOperation.retryCount = operation.retryCount + 1;
          this.activeOperations.set(retryOperation.id, retryOperation);
        } catch (error) {
          logger.error(`Retry attempt failed for operation ${operation.id}`, error, 'MINE_SWITCH_RETRY');
        }
      }, 30000);
    } else {
      logger.error(`Operation ${operation.id} exceeded maximum retries`, null, 'MINE_SWITCH_FAILED');
    }
  }

  async getOperationStatus(operationId: string): Promise<MineSwitchOperation | undefined> {
    return this.activeOperations.get(operationId);
  }

  getActiveOperations(): MineSwitchOperation[] {
    return Array.from(this.activeOperations.values());
  }

  isSchedulerRunning(): boolean {
    return this.isRunning;
  }
}