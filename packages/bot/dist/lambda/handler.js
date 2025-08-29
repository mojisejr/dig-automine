"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusHandler = exports.mineSwitchHandler = void 0;
const config_1 = require("../utils/config");
const logger_1 = require("../utils/logger");
const web3_1 = require("../services/web3");
const contract_1 = require("../services/contract");
const monitor_1 = require("../services/monitor");
const mineSwitchHandler = async (event, context) => {
    const startTime = Date.now();
    try {
        logger_1.logger.info('Lambda function started', 'LAMBDA_START');
        const config = (0, config_1.getBotConfig)();
        (0, logger_1.setLogLevel)(config.logLevel);
        const web3Service = new web3_1.Web3Service(config);
        const contractService = new contract_1.ContractService(web3Service, config);
        const monitorService = new monitor_1.MonitorService(web3Service, contractService, config);
        const hasRole = await contractService.verifyBotRole();
        if (!hasRole) {
            throw new Error('Bot does not have required role in AutoMine contract');
        }
        const depositedTokens = await contractService.getDepositedTokens();
        if (depositedTokens.users.length === 0) {
            logger_1.logger.info('No users with deposited NFTs found', 'LAMBDA_EXECUTION');
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'No users with deposited NFTs',
                    executionTime: Date.now() - startTime
                })
            };
        }
        const currentMine = await contractService.getCurrentMine();
        const targetMine = getTargetMine(currentMine, config);
        if (currentMine.toLowerCase() === targetMine.toLowerCase()) {
            logger_1.logger.info('Already in target mine', 'LAMBDA_EXECUTION');
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'Already in target mine',
                    executionTime: Date.now() - startTime
                })
            };
        }
        logger_1.logger.info(`Switching mine from ${currentMine} to ${targetMine}`, 'LAMBDA_EXECUTION');
        const operation = await contractService.switchMine(targetMine);
        await monitorService.recordOperation(operation);
        const response = {
            success: operation.status === 'completed',
            operation: {
                id: operation.id,
                status: operation.status,
                transactionHash: operation.transactionHash,
                targetMine: operation.targetMine
            },
            userCount: depositedTokens.users.length,
            executionTime: Date.now() - startTime
        };
        logger_1.logger.info(`Lambda execution completed: ${operation.status}`, 'LAMBDA_COMPLETE');
        return {
            statusCode: operation.status === 'completed' ? 200 : 500,
            body: JSON.stringify(response)
        };
    }
    catch (error) {
        logger_1.logger.error('Lambda execution failed', error, 'LAMBDA_ERROR');
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTime: Date.now() - startTime
            })
        };
    }
};
exports.mineSwitchHandler = mineSwitchHandler;
const statusHandler = async (event, context) => {
    try {
        const config = (0, config_1.getBotConfig)();
        const web3Service = new web3_1.Web3Service(config);
        const contractService = new contract_1.ContractService(web3Service, config);
        const monitorService = new monitor_1.MonitorService(web3Service, contractService, config);
        const status = await monitorService.getSystemStatus();
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                status,
                timestamp: new Date().toISOString()
            })
        };
    }
    catch (error) {
        logger_1.logger.error('Status check failed', error, 'STATUS_CHECK');
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.statusHandler = statusHandler;
function getTargetMine(currentMine, config) {
    if (config.targetMineAddress && config.currentMineAddress) {
        return currentMine.toLowerCase() === config.currentMineAddress.toLowerCase()
            ? config.targetMineAddress
            : config.currentMineAddress;
    }
    throw new Error('Target mine addresses not configured');
}
//# sourceMappingURL=handler.js.map