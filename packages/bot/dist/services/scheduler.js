"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const cron = __importStar(require("node-cron"));
const logger_1 = require("../utils/logger");
class SchedulerService {
    constructor(contractService, web3Service, config) {
        this.isRunning = false;
        this.activeOperations = new Map();
        this.contractService = contractService;
        this.web3Service = web3Service;
        this.config = config;
    }
    async start() {
        try {
            logger_1.logger.info('Starting AutoMine scheduler service', 'SCHEDULER_START');
            const hasRole = await this.contractService.verifyBotRole();
            if (!hasRole) {
                throw new Error('Bot does not have required role in AutoMine contract');
            }
            const cronExpression = this.getCronExpression();
            logger_1.logger.info(`Scheduling mine switches every ${this.config.mineSwitchIntervalHours} hours using cron: ${cronExpression}`, 'SCHEDULER_SETUP');
            this.cronJob = cron.schedule(cronExpression, async () => {
                await this.executeMineSwitch();
            }, {
                scheduled: false,
                timezone: "UTC"
            });
            this.cronJob.start();
            this.isRunning = true;
            logger_1.logger.info('Scheduler started successfully', 'SCHEDULER_START');
            await this.performStartupCheck();
        }
        catch (error) {
            logger_1.logger.error('Failed to start scheduler', error, 'SCHEDULER_START');
            throw error;
        }
    }
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.isRunning = false;
            logger_1.logger.info('Scheduler stopped', 'SCHEDULER_STOP');
        }
    }
    getCronExpression() {
        const hours = this.config.mineSwitchIntervalHours;
        if (hours === 24) {
            return '0 0 * * *';
        }
        else if (hours === 12) {
            return '0 */12 * * *';
        }
        else if (hours === 6) {
            return '0 */6 * * *';
        }
        else {
            return `0 */${hours} * * *`;
        }
    }
    async performStartupCheck() {
        try {
            logger_1.logger.info('Performing startup system check', 'STARTUP_CHECK');
            const blockNumber = await this.web3Service.getBlockNumber();
            const balance = await this.web3Service.getBalance();
            const currentMine = await this.contractService.getCurrentMine();
            const depositedTokens = await this.contractService.getDepositedTokens();
            logger_1.logger.info(`System status - Block: ${blockNumber}, Balance: ${balance}, Current Mine: ${currentMine}`, 'STARTUP_CHECK');
            logger_1.logger.info(`Monitoring ${depositedTokens.users.length} users with deposited NFTs`, 'STARTUP_CHECK');
            if (balance < this.config.gasPrice * BigInt(this.config.gasLimit) * BigInt(10)) {
                logger_1.logger.error('Bot wallet has insufficient balance for operations', null, 'STARTUP_CHECK');
            }
        }
        catch (error) {
            logger_1.logger.error('Startup check failed', error, 'STARTUP_CHECK');
        }
    }
    async executeMineSwitch() {
        if (!this.isRunning) {
            logger_1.logger.debug('Scheduler not running, skipping mine switch', 'MINE_SWITCH');
            return;
        }
        try {
            logger_1.logger.info('Starting scheduled mine switch execution', 'MINE_SWITCH');
            const depositedTokens = await this.contractService.getDepositedTokens();
            if (depositedTokens.users.length === 0) {
                logger_1.logger.info('No users with deposited NFTs found, skipping mine switch', 'MINE_SWITCH');
                return;
            }
            const currentMine = await this.contractService.getCurrentMine();
            const targetMine = this.getNextTargetMine(currentMine);
            if (currentMine.toLowerCase() === targetMine.toLowerCase()) {
                logger_1.logger.info('Already in target mine, skipping switch', 'MINE_SWITCH');
                return;
            }
            logger_1.logger.info(`Switching from ${currentMine} to ${targetMine} for ${depositedTokens.users.length} users`, 'MINE_SWITCH');
            const operation = await this.contractService.switchMine(targetMine);
            this.activeOperations.set(operation.id, operation);
            if (operation.status === 'completed') {
                logger_1.logger.info(`Mine switch operation completed successfully: ${operation.id}`, 'MINE_SWITCH');
            }
            else {
                logger_1.logger.error(`Mine switch operation failed: ${operation.id}`, operation.error, 'MINE_SWITCH');
                await this.handleFailedOperation(operation);
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to execute scheduled mine switch', error, 'MINE_SWITCH');
        }
    }
    getNextTargetMine(currentMine) {
        if (this.config.targetMineAddress && this.config.currentMineAddress) {
            return currentMine.toLowerCase() === this.config.currentMineAddress.toLowerCase()
                ? this.config.targetMineAddress
                : this.config.currentMineAddress;
        }
        logger_1.logger.error('Target mine addresses not configured properly', null, 'MINE_SWITCH');
        throw new Error('Target mine addresses not configured');
    }
    async handleFailedOperation(operation) {
        if (operation.retryCount < this.config.maxRetries) {
            logger_1.logger.info(`Retrying failed operation ${operation.id} (attempt ${operation.retryCount + 1}/${this.config.maxRetries})`, 'MINE_SWITCH_RETRY');
            setTimeout(async () => {
                try {
                    const retryOperation = await this.contractService.switchMine(operation.targetMine);
                    retryOperation.retryCount = operation.retryCount + 1;
                    this.activeOperations.set(retryOperation.id, retryOperation);
                }
                catch (error) {
                    logger_1.logger.error(`Retry attempt failed for operation ${operation.id}`, error, 'MINE_SWITCH_RETRY');
                }
            }, 30000);
        }
        else {
            logger_1.logger.error(`Operation ${operation.id} exceeded maximum retries`, null, 'MINE_SWITCH_FAILED');
        }
    }
    async getOperationStatus(operationId) {
        return this.activeOperations.get(operationId);
    }
    getActiveOperations() {
        return Array.from(this.activeOperations.values());
    }
    isSchedulerRunning() {
        return this.isRunning;
    }
}
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=scheduler.js.map