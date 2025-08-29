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
    getDepositedTokens(): Promise<{
        users: Address[];
        tokenIds: number[][];
    }>;
    getUserTokenIds(userAddress: Address): Promise<number[]>;
    switchMine(targetMineAddress: Address): Promise<MineSwitchOperation>;
}
//# sourceMappingURL=contract.d.ts.map