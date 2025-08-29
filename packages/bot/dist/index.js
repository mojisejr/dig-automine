"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./utils/config");
const logger_1 = require("./utils/logger");
const web3_1 = require("./services/web3");
const contract_1 = require("./services/contract");
const mine_monitor_1 = require("./services/mine-monitor");
const dashboard_1 = require("./services/dashboard");
class AutoMineBot {
    constructor() {
        this.isRunning = false;
        this.monitoringInterval = null;
        this.config = (0, config_1.getBotConfig)();
        (0, logger_1.setLogLevel)(this.config.logLevel);
        this.web3Service = new web3_1.Web3Service(this.config);
        this.contractService = new contract_1.ContractService(this.web3Service, this.config);
        this.mineMonitor = new mine_monitor_1.MineMonitorService(this.web3Service, this.contractService, this.config);
        this.dashboard = new dashboard_1.DashboardService(this.web3Service, this.contractService, this.mineMonitor, this.config);
    }
    async start() {
        try {
            logger_1.logger.info('🚀 Starting AutoMine Bot for Phase 1B.1 Integration Testing', 'BOT_START');
            // Step 1: Verify bot role and permissions
            logger_1.logger.info('🔐 Verifying bot permissions...', 'BOT_START');
            const hasRole = await this.contractService.verifyBotRole();
            if (!hasRole) {
                throw new Error('Bot does not have required BOT_ROLE permissions');
            }
            logger_1.logger.info('✅ Bot role verified', 'BOT_START');
            // Step 2: Initial system check
            logger_1.logger.info('🔍 Performing initial system check...', 'BOT_START');
            await this.dashboard.collectDashboardData();
            logger_1.logger.info('✅ System check complete', 'BOT_START');
            // Step 3: Start monitoring loop
            logger_1.logger.info('📊 Starting monitoring loop...', 'BOT_START');
            this.startMonitoringLoop();
            this.isRunning = true;
            logger_1.logger.info('🎉 AutoMine Bot started successfully', 'BOT_START');
            logger_1.logger.info(this.dashboard.generateStatusReport(), 'BOT_STATUS');
            this.setupGracefulShutdown();
            this.setupErrorHandlers();
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to start AutoMine Bot', error, 'BOT_START');
            throw error;
        }
    }
    startMonitoringLoop() {
        const monitoringInterval = 30000; // 30 seconds
        this.monitoringInterval = setInterval(async () => {
            try {
                this.dashboard.updateLastOperation('monitoring');
                const recommendation = await this.mineMonitor.getMineSwitchRecommendation();
                if (recommendation.recommendation === 'switch' && recommendation.targetMine) {
                    logger_1.logger.info(`🔄 Executing mine switch to ${recommendation.targetMine}`, 'AUTO_SWITCH');
                    this.dashboard.updateLastOperation('switching_mine');
                    const operation = await this.contractService.switchMine(recommendation.targetMine);
                    if (operation.status === 'completed') {
                        logger_1.logger.info('✅ Mine switch completed successfully', 'AUTO_SWITCH', operation.transactionHash);
                    }
                    else {
                        logger_1.logger.error('❌ Mine switch failed', operation.error, 'AUTO_SWITCH');
                        this.dashboard.reportError();
                    }
                }
                // Update dashboard
                await this.dashboard.collectDashboardData();
                // Log status every 5 minutes (10 monitoring cycles)
                if (Date.now() % (10 * monitoringInterval) < monitoringInterval) {
                    logger_1.logger.info(this.dashboard.generateStatusReport(), 'BOT_STATUS');
                }
            }
            catch (error) {
                logger_1.logger.error('Error in monitoring loop', error, 'MONITORING_LOOP');
                this.dashboard.reportError();
            }
        }, monitoringInterval);
        logger_1.logger.info(`⏱️  Monitoring loop started (${monitoringInterval / 1000}s intervals)`, 'BOT_START');
    }
    setupErrorHandlers() {
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('Uncaught exception', error, 'BOT_ERROR');
            this.shutdown();
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error('Unhandled rejection', reason, 'BOT_ERROR');
            this.shutdown();
        });
    }
    async shutdown() {
        if (!this.isRunning)
            return;
        logger_1.logger.info('🛑 Shutting down AutoMine Bot', 'BOT_SHUTDOWN');
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isRunning = false;
        logger_1.logger.info('✅ AutoMine Bot shutdown complete', 'BOT_SHUTDOWN');
        process.exit(0);
    }
    setupGracefulShutdown() {
        process.on('SIGINT', async () => {
            logger_1.logger.info('Received SIGINT, shutting down gracefully', 'BOT_SHUTDOWN');
            await this.shutdown();
        });
        process.on('SIGTERM', async () => {
            logger_1.logger.info('Received SIGTERM, shutting down gracefully', 'BOT_SHUTDOWN');
            await this.shutdown();
        });
    }
    async getStatus() {
        try {
            const dashboardData = await this.dashboard.collectDashboardData();
            return {
                botRunning: this.isRunning,
                ...dashboardData
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get bot status', error, 'BOT_STATUS');
            throw error;
        }
    }
    isActive() {
        return this.isRunning;
    }
}
if (require.main === module) {
    const bot = new AutoMineBot();
    bot.start().catch((error) => {
        logger_1.logger.error('Failed to start bot', error, 'BOT_STARTUP');
        process.exit(1);
    });
}
exports.default = AutoMineBot;
//# sourceMappingURL=index.js.map