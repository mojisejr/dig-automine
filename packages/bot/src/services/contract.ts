import { Address, encodeFunctionData, parseAbi } from 'viem';
import { Web3Service } from './web3';
import { BotConfig, MineSwitchOperation } from '../types';
import { logger } from '../utils/logger';

export class ContractService {
  private web3Service: Web3Service;
  private config: BotConfig;
  
  private autoMineAbi = parseAbi([
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

  constructor(web3Service: Web3Service, config: BotConfig) {
    this.web3Service = web3Service;
    this.config = config;
  }

  async verifyBotRole(): Promise<boolean> {
    try {
      const botRoleHash = await this.web3Service.getPublicClient().readContract({
        address: this.config.autoMineContractAddress as Address,
        abi: this.autoMineAbi,
        functionName: 'BOT_ROLE'
      });

      const hasRole = await this.web3Service.getPublicClient().readContract({
        address: this.config.autoMineContractAddress as Address,
        abi: this.autoMineAbi,
        functionName: 'hasRole',
        args: [botRoleHash, this.web3Service.getAccount().address]
      });

      logger.info(`Bot role verification: ${hasRole}`, 'ROLE_VERIFICATION');
      return hasRole as boolean;
    } catch (error) {
      logger.error('Failed to verify bot role', error, 'ROLE_VERIFICATION');
      return false;
    }
  }

  async getCurrentMine(): Promise<Address> {
    try {
      const currentMine = await this.web3Service.getPublicClient().readContract({
        address: this.config.autoMineContractAddress as Address,
        abi: this.autoMineAbi,
        functionName: 'getCurrentMine'
      });

      logger.debug(`Current mine address: ${currentMine}`, 'CONTRACT_READ');
      return currentMine as Address;
    } catch (error) {
      logger.error('Failed to get current mine address', error, 'CONTRACT_READ');
      throw error;
    }
  }

  async getDepositedTokens(): Promise<{ users: Address[], tokenIds: number[][] }> {
    try {
      const [users, tokenIds] = await this.web3Service.getPublicClient().readContract({
        address: this.config.autoMineContractAddress as Address,
        abi: this.autoMineAbi,
        functionName: 'getDepositedTokens'
      });

      logger.debug(`Found ${users.length} users with deposited tokens`, 'CONTRACT_READ');
      return { users: users as Address[], tokenIds: tokenIds as number[][] };
    } catch (error) {
      logger.error('Failed to get deposited tokens', error, 'CONTRACT_READ');
      throw error;
    }
  }

  async getUserTokenIds(userAddress: Address): Promise<number[]> {
    try {
      const tokenIds = await this.web3Service.getPublicClient().readContract({
        address: this.config.autoMineContractAddress as Address,
        abi: this.autoMineAbi,
        functionName: 'getUserTokenIds',
        args: [userAddress]
      });

      return tokenIds as number[];
    } catch (error) {
      logger.error(`Failed to get token IDs for user ${userAddress}`, error, 'CONTRACT_READ');
      throw error;
    }
  }

  async switchMine(targetMineAddress: Address): Promise<MineSwitchOperation> {
    const operationId = `switch_${Date.now()}`;
    
    try {
      logger.info(`Starting mine switch operation to ${targetMineAddress}`, 'MINE_SWITCH', operationId);

      const functionData = encodeFunctionData({
        abi: this.autoMineAbi,
        functionName: 'switchMine',
        args: [targetMineAddress]
      });

      const gasEstimate = await this.web3Service.estimateGas(
        this.config.autoMineContractAddress as Address,
        functionData
      );

      const hash = await this.web3Service.getWalletClient().sendTransaction({
        to: this.config.autoMineContractAddress as Address,
        data: functionData,
        gas: gasEstimate,
        gasPrice: this.config.gasPrice
      });

      const operation: MineSwitchOperation = {
        id: operationId,
        targetMine: targetMineAddress,
        timestamp: Date.now(),
        status: 'processing',
        retryCount: 0,
        transactionHash: hash
      };

      logger.info(`Mine switch transaction sent: ${hash}`, 'MINE_SWITCH', hash);
      
      const receipt = await this.web3Service.waitForTransactionReceipt(hash);
      
      if (receipt.status === 'success') {
        operation.status = 'completed';
        logger.info(`Mine switch completed successfully`, 'MINE_SWITCH', hash);
      } else {
        operation.status = 'failed';
        operation.error = 'Transaction failed on blockchain';
        logger.error(`Mine switch transaction failed`, receipt, 'MINE_SWITCH', hash);
      }

      return operation;
    } catch (error) {
      const operation: MineSwitchOperation = {
        id: operationId,
        targetMine: targetMineAddress,
        timestamp: Date.now(),
        status: 'failed',
        retryCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      logger.error(`Mine switch operation failed`, error, 'MINE_SWITCH');
      return operation;
    }
  }
}