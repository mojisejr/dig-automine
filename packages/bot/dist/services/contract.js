"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const viem_1 = require("viem");
const logger_1 = require("../utils/logger");
class ContractService {
    constructor(web3Service, config) {
        this.autoMineAbi = (0, viem_1.parseAbi)([
            'function switchMine(address _targetMine) external',
            'function getUserInfo(address _user) external view returns (uint256[] memory tokenIds, uint256 totalHashPower, uint256 lastRewardClaim, bool isActive)',
            'function getContractStats() external view returns (uint256 totalTokens, uint256 activeUsers, address current, address target)',
            'function getDepositedTokens() external view returns (address[] memory users, uint256[][] memory tokenIds)',
            'function hasRole(bytes32 role, address account) external view returns (bool)',
            'function BOT_ROLE() external view returns (bytes32)',
            'function currentMine() external view returns (address)',
            'function targetMine() external view returns (address)',
            'function feePercentage() external view returns (uint256)',
            'event NFTDeposited(address indexed user, uint256[] tokenIds, uint256 totalHashPower)',
            'event NFTWithdrawn(address indexed user, uint256[] tokenIds)',
            'event RewardClaimed(address indexed user, uint256 grossReward, uint256 fee, uint256 netReward)',
            'event MineSwitch(address indexed from, address indexed to, uint256 totalTokens)',
            'event EmergencyUnstake(address indexed admin, address indexed user, uint256[] tokenIds)'
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
                functionName: 'currentMine'
            });
            logger_1.logger.debug(`Current mine address: ${currentMine}`, 'CONTRACT_READ');
            return currentMine;
        }
        catch (error) {
            logger_1.logger.error('Failed to get current mine address', error, 'CONTRACT_READ');
            throw error;
        }
    }
    async getContractStats() {
        try {
            const [totalTokens, activeUsers, current, target] = await this.web3Service.getPublicClient().readContract({
                address: this.config.autoMineContractAddress,
                abi: this.autoMineAbi,
                functionName: 'getContractStats'
            });
            logger_1.logger.debug(`Contract stats - Tokens: ${totalTokens}, Users: ${activeUsers}`, 'CONTRACT_READ');
            return {
                totalTokens: Number(totalTokens),
                activeUsers: Number(activeUsers),
                current: current,
                target: target
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get contract stats', error, 'CONTRACT_READ');
            throw error;
        }
    }
    async getUserInfo(userAddress) {
        try {
            const [tokenIds, totalHashPower, lastRewardClaim, isActive] = await this.web3Service.getPublicClient().readContract({
                address: this.config.autoMineContractAddress,
                abi: this.autoMineAbi,
                functionName: 'getUserInfo',
                args: [userAddress]
            });
            return {
                tokenIds: tokenIds.map(id => Number(id)),
                totalHashPower: Number(totalHashPower),
                lastRewardClaim: Number(lastRewardClaim),
                isActive: isActive
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to get user info for ${userAddress}`, error, 'CONTRACT_READ');
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
            const formattedTokenIds = tokenIds.map(userTokens => userTokens.map(id => Number(id)));
            logger_1.logger.debug(`Retrieved ${users.length} users with deposited tokens`, 'CONTRACT_READ');
            return {
                users: users,
                tokenIds: formattedTokenIds
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get deposited tokens', error, 'CONTRACT_READ');
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