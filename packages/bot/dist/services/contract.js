"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const viem_1 = require("viem");
const logger_1 = require("../utils/logger");
class ContractService {
    constructor(web3Service, config) {
        this.autoMineAbi = (0, viem_1.parseAbi)([
            'function switchMine(address _targetMine) external',
            'function getUserTokenIds(address _user) external view returns (uint256[])',
            'function getUserReward(address _user) external view returns (uint256)',
            'function getCurrentMine() external view returns (address)',
            'function getDepositedTokens() external view returns (address[], uint256[][])',
            'function hasRole(bytes32 role, address account) external view returns (bool)',
            'function BOT_ROLE() external view returns (bytes32)',
            'event MineSwitched(address indexed oldMine, address indexed newMine, uint256 timestamp)',
            'event NFTDeposited(address indexed user, uint256[] tokenIds)',
            'event RewardClaimed(address indexed user, uint256 amount, uint256 fee)'
        ]);
        this.web3Service = web3Service;
        this.config = config;
    }
    async verifyBotRole() {
        try {
            const botRoleHash = await this.web3Service.getPublicClient().readContract({
                address: this.config.autoMineContractAddress,
                abi: this.autoMineAbi,
                functionName: 'BOT_ROLE'
            });
            const hasRole = await this.web3Service.getPublicClient().readContract({
                address: this.config.autoMineContractAddress,
                abi: this.autoMineAbi,
                functionName: 'hasRole',
                args: [botRoleHash, this.web3Service.getAccount().address]
            });
            logger_1.logger.info(`Bot role verification: ${hasRole}`, 'ROLE_VERIFICATION');
            return hasRole;
        }
        catch (error) {
            logger_1.logger.error('Failed to verify bot role', error, 'ROLE_VERIFICATION');
            return false;
        }
    }
    async getCurrentMine() {
        try {
            const currentMine = await this.web3Service.getPublicClient().readContract({
                address: this.config.autoMineContractAddress,
                abi: this.autoMineAbi,
                functionName: 'getCurrentMine'
            });
            logger_1.logger.debug(`Current mine address: ${currentMine}`, 'CONTRACT_READ');
            return currentMine;
        }
        catch (error) {
            logger_1.logger.error('Failed to get current mine address', error, 'CONTRACT_READ');
            throw error;
        }
    }
    async getDepositedTokens() {
        try {
            const [users, tokenIds] = await this.web3Service.getPublicClient().readContract({
                address: this.config.autoMineContractAddress,
                abi: this.autoMineAbi,
                functionName: 'getDepositedTokens'
            });
            logger_1.logger.debug(`Found ${users.length} users with deposited tokens`, 'CONTRACT_READ');
            return { users: users, tokenIds: tokenIds };
        }
        catch (error) {
            logger_1.logger.error('Failed to get deposited tokens', error, 'CONTRACT_READ');
            throw error;
        }
    }
    async getUserTokenIds(userAddress) {
        try {
            const tokenIds = await this.web3Service.getPublicClient().readContract({
                address: this.config.autoMineContractAddress,
                abi: this.autoMineAbi,
                functionName: 'getUserTokenIds',
                args: [userAddress]
            });
            return tokenIds;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get token IDs for user ${userAddress}`, error, 'CONTRACT_READ');
            throw error;
        }
    }
    async switchMine(targetMineAddress) {
        const operationId = `switch_${Date.now()}`;
        try {
            logger_1.logger.info(`Starting mine switch operation to ${targetMineAddress}`, 'MINE_SWITCH', operationId);
            const functionData = (0, viem_1.encodeFunctionData)({
                abi: this.autoMineAbi,
                functionName: 'switchMine',
                args: [targetMineAddress]
            });
            const gasEstimate = await this.web3Service.estimateGas(this.config.autoMineContractAddress, functionData);
            const hash = await this.web3Service.getWalletClient().sendTransaction({
                to: this.config.autoMineContractAddress,
                data: functionData,
                gas: gasEstimate,
                gasPrice: this.config.gasPrice
            });
            const operation = {
                id: operationId,
                targetMine: targetMineAddress,
                timestamp: Date.now(),
                status: 'processing',
                retryCount: 0,
                transactionHash: hash
            };
            logger_1.logger.info(`Mine switch transaction sent: ${hash}`, 'MINE_SWITCH', hash);
            const receipt = await this.web3Service.waitForTransactionReceipt(hash);
            if (receipt.status === 'success') {
                operation.status = 'completed';
                logger_1.logger.info(`Mine switch completed successfully`, 'MINE_SWITCH', hash);
            }
            else {
                operation.status = 'failed';
                operation.error = 'Transaction failed on blockchain';
                logger_1.logger.error(`Mine switch transaction failed`, receipt, 'MINE_SWITCH', hash);
            }
            return operation;
        }
        catch (error) {
            const operation = {
                id: operationId,
                targetMine: targetMineAddress,
                timestamp: Date.now(),
                status: 'failed',
                retryCount: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            logger_1.logger.error(`Mine switch operation failed`, error, 'MINE_SWITCH');
            return operation;
        }
    }
}
exports.ContractService = ContractService;
//# sourceMappingURL=contract.js.map