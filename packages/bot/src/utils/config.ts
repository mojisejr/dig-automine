import * as dotenv from 'dotenv';
import { BotConfig } from '../types';

dotenv.config();

export const getBotConfig = (): BotConfig => {
  const requiredEnvVars = [
    'RPC_URL',
    'CHAIN_ID',
    'AUTOMINE_CONTRACT_ADDRESS',
    'DIGDRAGON_NFT_CONTRACT_ADDRESS',
    'BOT_PRIVATE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    rpcUrl: process.env.RPC_URL!,
    chainId: parseInt(process.env.CHAIN_ID!),
    autoMineContractAddress: process.env.AUTOMINE_CONTRACT_ADDRESS!,
    digDragonNftContractAddress: process.env.DIGDRAGON_NFT_CONTRACT_ADDRESS!,
    currentMineAddress: process.env.CURRENT_MINE_ADDRESS || '',
    targetMineAddress: process.env.TARGET_MINE_ADDRESS || '',
    botPrivateKey: process.env.BOT_PRIVATE_KEY!,
    mineSwitchIntervalHours: parseInt(process.env.MINE_SWITCH_INTERVAL_HOURS || '24'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    gasLimit: parseInt(process.env.GAS_LIMIT || '500000'),
    gasPrice: BigInt(process.env.GAS_PRICE || '20000000000'),
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'error') || 'info'
  };
};