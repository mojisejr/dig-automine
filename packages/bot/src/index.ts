import { getBotConfig } from './utils/config';
import { logger, setLogLevel } from './utils/logger';
import { Web3Service } from './services/web3';
import { ContractService } from './services/contract';
import { SchedulerService } from './services/scheduler';
import { MonitorService } from './services/monitor';

class AutoMineBot {
  private web3Service: Web3Service;
  private contractService: ContractService;
  private schedulerService: SchedulerService;
  private monitorService: MonitorService;
  private isRunning: boolean = false;

  constructor() {
    const config = getBotConfig();
    setLogLevel(config.logLevel);
    
    this.web3Service = new Web3Service(config);
    this.contractService = new ContractService(this.web3Service, config);
    this.schedulerService = new SchedulerService(this.contractService, this.web3Service, config);
    this.monitorService = new MonitorService(this.web3Service, this.contractService, config);
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting AutoMine Bot', 'BOT_START');

      await this.monitorService.startMonitoring();
      await this.schedulerService.start();
      
      this.isRunning = true;
      
      logger.info('AutoMine Bot started successfully', 'BOT_START');
      
      this.setupGracefulShutdown();
      
      process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception', error, 'BOT_ERROR');
        this.shutdown();
      });

      process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled rejection', reason, 'BOT_ERROR');
        this.shutdown();
      });

    } catch (error) {
      logger.error('Failed to start AutoMine Bot', error, 'BOT_START');
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isRunning) return;

    logger.info('Shutting down AutoMine Bot', 'BOT_SHUTDOWN');
    
    this.schedulerService.stop();
    this.monitorService.stopMonitoring();
    this.isRunning = false;
    
    logger.info('AutoMine Bot shutdown complete', 'BOT_SHUTDOWN');
    process.exit(0);
  }

  private setupGracefulShutdown(): void {
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully', 'BOT_SHUTDOWN');
      await this.shutdown();
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully', 'BOT_SHUTDOWN');
      await this.shutdown();
    });
  }

  async getStatus(): Promise<any> {
    try {
      const systemStatus = await this.monitorService.getSystemStatus();
      const schedulerRunning = this.schedulerService.isSchedulerRunning();
      
      return {
        botRunning: this.isRunning,
        schedulerRunning,
        ...systemStatus
      };
    } catch (error) {
      logger.error('Failed to get bot status', error, 'BOT_STATUS');
      throw error;
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

if (require.main === module) {
  const bot = new AutoMineBot();
  
  bot.start().catch((error) => {
    logger.error('Failed to start bot', error, 'BOT_STARTUP');
    process.exit(1);
  });
}

export default AutoMineBot;