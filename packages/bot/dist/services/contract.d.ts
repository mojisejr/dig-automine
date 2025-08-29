import { Address } from 'viem';
import { Web3Service } from './web3';
import { BotConfig, MineSwitchOperation } from '../types';
export declare class ContractService {
    private web3Service;
    private config;
    private autoMineAbi;
    constructor(web3Service: Web3Service, config: BotConfig);
    verifyBotRole(): Promise<boolean>;
    getCurrentMine(): Promise<Address>;
    getContractStats(): Promise<{
        totalTokens: number;
        activeUsers: number;
        current: Address;
        target: Address;
    }>;
    getUserInfo(userAddress: Address): Promise<{
        tokenIds: number[];
        totalHashPower: number;
        lastRewardClaim: number;
        isActive: boolean;
    }>;
    getDepositedTokens(): Promise<{
        users: Address[];
        tokenIds: number[][];
    }>;
    switchMine(targetMineAddress: Address): Promise<MineSwitchOperation>;
}
//# sourceMappingURL=contract.d.ts.map