import { Address, PrivateKeyAccount } from 'viem';
import { BotConfig } from '../types';
export declare class Web3Service {
    private config;
    private publicClient;
    private walletClient;
    private account;
    constructor(config: BotConfig);
    private setupClients;
    getBlockNumber(): Promise<bigint>;
    getBalance(address?: Address): Promise<bigint>;
    estimateGas(contractAddress: Address, functionData: `0x${string}`): Promise<bigint>;
    waitForTransactionReceipt(hash: `0x${string}`, timeout?: number): Promise<any>;
    getPublicClient(): any;
    getWalletClient(): any;
    getAccount(): PrivateKeyAccount;
}
//# sourceMappingURL=web3.d.ts.map