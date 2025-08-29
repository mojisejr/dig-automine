"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./utils/config");
const logger_1 = require("./utils/logger");
const web3_1 = require("./services/web3");
const contract_1 = require("./services/contract");
const scheduler_1 = require("./services/scheduler");
const monitor_1 = require("./services/monitor");
class AutoMineBot {
    constructor() {
        this.isRunning = false;
        const config = (0, config_1.getBotConfig)();
        (0, logger_1.setLogLevel)(config.logLevel);
        this.web3Service = new web3_1.Web3Service(config);
        this.contractService = new contract_1.ContractService(this.web3Service, config);
        this.schedulerService = new scheduler_1.SchedulerService(this.contractService, this.web3Service, config);
        this.monitorService = new monitor_1.MonitorService(this.web3Service, this.contractService, config);
    }
    async start() {
        try {
            logger_1.logger.info('Starting AutoMine Bot', 'BOT_START');
            await this.monitorService.startMonitoring();
            await this.schedulerService.start();
            this.isRunning = true;
            logger_1.logger.info('AutoMine Bot started successfully', 'BOT_START');
            this.setupGracefulShutdown();
            process.on('uncaughtException', (error) => {
                logger_1.logger.error('Uncaught exception', error, 'BOT_ERROR');
                this.shutdown();
            });
            process.on('unhandledRejection', (reason, promise) => {
                logger_1.logger.error('Unhandled rejection', reason, 'BOT_ERROR');
                this.shutdown();
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to start AutoMine Bot', error, 'BOT_START');
            throw error;
        }
    }
    async shutdown() {
        if (!this.isRunning)
            return;
        logger_1.logger.info('Shutting down AutoMine Bot', 'BOT_SHUTDOWN');
        this.schedulerService.stop();
        this.monitorService.stopMonitoring();
        this.isRunning = false;
        logger_1.logger.info('AutoMine Bot shutdown complete', 'BOT_SHUTDOWN');
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
            const systemStatus = await this.monitorService.getSystemStatus();
            const schedulerRunning = this.schedulerService.isSchedulerRunning();
            return {
                botRunning: this.isRunning,
                schedulerRunning,
                ...systemStatus
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