import { createPublicClient, createWalletClient, http, Address, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { BotConfig } from '../types';
import { logger } from '../utils/logger';

export class Web3Service {
  private config: BotConfig;
  private publicClient: any;
  private walletClient: any;
  private account: PrivateKeyAccount;

  constructor(config: BotConfig) {
    this.config = config;
    this.account = privateKeyToAccount(config.botPrivateKey as `0x${string}`);
    this.setupClients();
  }

  private setupClients(): void {
    try {
      const bitkubChain = {
        id: this.config.chainId,
        name: 'Bitkub Chain',
        network: 'bitkub',
        nativeCurrency: {
          decimals: 18,
          name: 'KUB',
          symbol: 'KUB',
        },
        rpcUrls: {
          default: {
            http: [this.config.rpcUrl],
          },
          public: {
            http: [this.config.rpcUrl],
          },
        },
      } as const;

      this.publicClient = createPublicClient({
        chain: bitkubChain,
        transport: http()
      });

      this.walletClient = createWalletClient({
        account: this.account,
        chain: bitkubChain,
        transport: http()
      });

      logger.info('Web3 clients initialized successfully', 'WEB3_SETUP');
    } catch (error) {
      logger.error('Failed to setup Web3 clients', error, 'WEB3_SETUP');
      throw error;
    }
  }

  async getBlockNumber(): Promise<bigint> {
    try {
      const blockNumber = await this.publicClient.getBlockNumber();
      logger.debug(`Current block number: ${blockNumber}`, 'BLOCKCHAIN_INFO');
      return blockNumber;
    } catch (error) {
      logger.error('Failed to get block number', error, 'BLOCKCHAIN_INFO');
      throw error;
    }
  }

  async getBalance(): Promise<bigint> {
    try {
      const balance = await this.publicClient.getBalance({
        address: this.account.address
      });
      logger.debug(`Bot wallet balance: ${balance} KUB`, 'WALLET_INFO');
      return balance;
    } catch (error) {
      logger.error('Failed to get wallet balance', error, 'WALLET_INFO');
      throw error;
    }
  }

  async estimateGas(contractAddress: Address, functionData: `0x${string}`): Promise<bigint> {
    try {
      const gasEstimate = await this.publicClient.estimateGas({
        account: this.account,
        to: contractAddress,
        data: functionData
      });
      
      const gasWithBuffer = gasEstimate + (gasEstimate * BigInt(20) / BigInt(100));
      logger.debug(`Gas estimated: ${gasEstimate}, with buffer: ${gasWithBuffer}`, 'GAS_ESTIMATION');
      return gasWithBuffer;
    } catch (error) {
      logger.error('Failed to estimate gas', error, 'GAS_ESTIMATION');
      throw error;
    }
  }

  async waitForTransactionReceipt(hash: `0x${string}`, timeout: number = 60000): Promise<any> {
    try {
      logger.info(`Waiting for transaction confirmation: ${hash}`, 'TRANSACTION_WAIT');
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
        timeout
      });
      
      if (receipt.status === 'success') {
        logger.info(`Transaction confirmed successfully: ${hash}`, 'TRANSACTION_CONFIRMED', hash);
      } else {
        logger.error(`Transaction failed: ${hash}`, null, 'TRANSACTION_FAILED', hash);
      }
      
      return receipt;
    } catch (error) {
      logger.error(`Transaction timeout or error: ${hash}`, error, 'TRANSACTION_ERROR', hash);
      throw error;
    }
  }

  getPublicClient() {
    return this.publicClient;
  }

  getWalletClient() {
    return this.walletClient;
  }

  getAccount(): PrivateKeyAccount {
    return this.account;
  }
}