"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorService = void 0;
const logger_1 = require("../utils/logger");
class MonitorService {
    constructor(web3Service, contractService, config) {
        this.isMonitoring = false;
        this.userDeposits = new Map();
        this.operationHistory = [];
        this.web3Service = web3Service;
        this.contractService = contractService;
        this.config = config;
    }
    async startMonitoring() {
        try {
            logger_1.logger.info('Starting monitoring service', 'MONITOR_START');
            this.isMonitoring = true;
            await this.syncUserDeposits();
            this.healthCheckInterval = setInterval(async () => {
                await this.performHealthCheck();
            }, 300000);
            logger_1.logger.info('Monitoring service started successfully', 'MONITOR_START');
        }
        catch (error) {
            logger_1.logger.error('Failed to start monitoring service', error, 'MONITOR_START');
            throw error;
        }
    }
    stopMonitoring() {
        this.isMonitoring = false;
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        logger_1.logger.info('Monitoring service stopped', 'MONITOR_STOP');
    }
    async syncUserDeposits() {
        try {
            logger_1.logger.debug('Syncing user deposits from contract', 'MONITOR_SYNC');
            const depositedTokens = await this.contractService.getDepositedTokens();
            this.userDeposits.clear();
            for (let i = 0; i < depositedTokens.users.length; i++) {
                const userAddress = depositedTokens.users[i];
                const tokenIds = depositedTokens.tokenIds[i];
                const userDeposit = {
                    userAddress,
                    tokenIds,
                    depositTimestamp: Date.now()
                };
                this.userDeposits.set(userAddress, userDeposit);
            }
            logger_1.logger.info(`Synchronized ${this.userDeposits.size} user deposits`, 'MONITOR_SYNC');
        }
        catch (error) {
            logger_1.logger.error('Failed to sync user deposits', error, 'MONITOR_SYNC');
        }
    }
    async performHealthCheck() {
        if (!this.isMonitoring)
            return;
        try {
            logger_1.logger.debug('Performing system health check', 'HEALTH_CHECK');
            const blockNumber = await this.web3Service.getBlockNumber();
            const balance = await this.web3Service.getBalance();
            const currentMine = await this.contractService.getCurrentMine();
            const minBalance = this.config.gasPrice * BigInt(this.config.gasLimit) * BigInt(50);
            if (balance < minBalance) {
                logger_1.logger.error(`Low balance warning: ${balance} KUB (minimum: ${minBalance})`, null, 'HEALTH_CHECK');
            }
            logger_1.logger.debug(`Health check passed - Block: ${blockNumber}, Balance: ${balance}, Mine: ${currentMine}`, 'HEALTH_CHECK');
            await this.syncUserDeposits();
        }
        catch (error) {
            logger_1.logger.error('Health check failed', error, 'HEALTH_CHECK');
        }
    }
    async recordOperation(operation) {
        this.operationHistory.push(operation);
        if (this.operationHistory.length > 100) {
            this.operationHistory = this.operationHistory.slice(-50);
        }
        logger_1.logger.debug(`Recorded operation ${operation.id} with status ${operation.status}`, 'OPERATION_RECORD');
    }
    getOperationHistory() {
        return [...this.operationHistory];
    }
    getUserDeposits() {
        return Array.from(this.userDeposits.values());
    }
    async getSystemStatus() {
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
        }
        catch (error) {
            logger_1.logger.error('Failed to get system status', error, 'SYSTEM_STATUS');
            throw error;
        }
    }
    async validateOperation(operation) {
        try {
            if (!operation.transactionHash) {
                return false;
            }
            const receipt = await this.web3Service.getPublicClient().getTransactionReceipt({
                hash: operation.transactionHash
            });
            return receipt.status === 'success';
        }
        catch (error) {
            logger_1.logger.error(`Failed to validate operation ${operation.id}`, error, 'OPERATION_VALIDATION');
            return false;
        }
    }
    isMonitoringActive() {
        return this.isMonitoring;
    }
}
exports.MonitorService = MonitorService;
//# sourceMappingURL=monitor.js.map