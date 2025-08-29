import { getBotConfig } from './utils/config';
import { logger, setLogLevel } from './utils/logger';
import { Web3Service } from './services/web3';
import { ContractService } from './services/contract';
import { MineMonitorService } from './services/mine-monitor';
import { DashboardService } from './services/dashboard';

class AutoMineBot {
  private web3Service: Web3Service;
  private contractService: ContractService;
  private mineMonitor: MineMonitorService;
  private dashboard: DashboardService;
  private config: any;
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = getBotConfig();
    setLogLevel(this.config.logLevel);
    
    this.web3Service = new Web3Service(this.config);
    this.contractService = new ContractService(this.web3Service, this.config);
    this.mineMonitor = new MineMonitorService(this.web3Service, this.contractService, this.config);
    this.dashboard = new DashboardService(this.web3Service, this.contractService, this.mineMonitor, this.config);
  }

  async start(): Promise<void> {
    try {
      logger.info('🚀 Starting AutoMine Bot for Phase 1B.1 Integration Testing', 'BOT_START');

      // Step 1: Verify bot role and permissions
      logger.info('🔐 Verifying bot permissions...', 'BOT_START');
      const hasRole = await this.contractService.verifyBotRole();
      if (!hasRole) {
        throw new Error('Bot does not have required BOT_ROLE permissions');
      }
      logger.info('✅ Bot role verified', 'BOT_START');

      // Step 2: Initial system check
      logger.info('🔍 Performing initial system check...', 'BOT_START');
      await this.dashboard.collectDashboardData();
      logger.info('✅ System check complete', 'BOT_START');

      // Step 3: Start monitoring loop
      logger.info('📊 Starting monitoring loop...', 'BOT_START');
      this.startMonitoringLoop();
      
      this.isRunning = true;
      
      logger.info('🎉 AutoMine Bot started successfully', 'BOT_START');
      logger.info(this.dashboard.generateStatusReport(), 'BOT_STATUS');
      
      this.setupGracefulShutdown();
      this.setupErrorHandlers();

    } catch (error) {
      logger.error('❌ Failed to start AutoMine Bot', error, 'BOT_START');
      throw error;
    }
  }

  private startMonitoringLoop(): void {
    const monitoringInterval = 30000; // 30 seconds
    
    this.monitoringInterval = setInterval(async () => {
      try {
        this.dashboard.updateLastOperation('monitoring');
        
        const recommendation = await this.mineMonitor.getMineSwitchRecommendation();
        
        if (recommendation.recommendation === 'switch' && recommendation.targetMine) {
          logger.info(`🔄 Executing mine switch to ${recommendation.targetMine}`, 'AUTO_SWITCH');
          this.dashboard.updateLastOperation('switching_mine');
          
          const operation = await this.contractService.switchMine(recommendation.targetMine);
          
          if (operation.status === 'completed') {
            logger.info('✅ Mine switch completed successfully', 'AUTO_SWITCH', operation.transactionHash);
          } else {
            logger.error('❌ Mine switch failed', operation.error, 'AUTO_SWITCH');
            this.dashboard.reportError();
          }
        }

        // Update dashboard
        await this.dashboard.collectDashboardData();
        
        // Log status every 5 minutes (10 monitoring cycles)
        if (Date.now() % (10 * monitoringInterval) < monitoringInterval) {
          logger.info(this.dashboard.generateStatusReport(), 'BOT_STATUS');
        }

      } catch (error) {
        logger.error('Error in monitoring loop', error, 'MONITORING_LOOP');
        this.dashboard.reportError();
      }
    }, monitoringInterval);

    logger.info(`⏱️  Monitoring loop started (${monitoringInterval/1000}s intervals)`, 'BOT_START');
  }

  private setupErrorHandlers(): void {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error, 'BOT_ERROR');
      this.shutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', reason, 'BOT_ERROR');
      this.shutdown();
    });
  }

  async shutdown(): Promise<void> {
    if (!this.isRunning) return;

    logger.info('🛑 Shutting down AutoMine Bot', 'BOT_SHUTDOWN');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isRunning = false;
    
    logger.info('✅ AutoMine Bot shutdown complete', 'BOT_SHUTDOWN');
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
      const dashboardData = await this.dashboard.collectDashboardData();
      
      return {
        botRunning: this.isRunning,
        ...dashboardData
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