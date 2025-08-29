export interface BotConfig {
    rpcUrl: string;
    chainId: number;
    autoMineContractAddress: string;
    digDragonNftContractAddress: string;
    currentMineAddress: string;
    targetMineAddress: string;
    botPrivateKey: string;
    mineSwitchIntervalHours: number;
    maxRetries: number;
    gasLimit: number;
    gasPrice: bigint;
    logLevel: 'debug' | 'info' | 'error';
}
export interface MineSwitchOperation {
    id: string;
    targetMine: string;
    timestamp: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    retryCount: number;
    transactionHash?: string;
    error?: string;
}
export interface UserDeposit {
    userAddress: string;
    tokenIds: number[];
    depositTimestamp: number;
    lastMineSwitchTimestamp?: number;
}
export interface LogEntry {
    timestamp: string;
    level: 'debug' | 'info' | 'error';
    message: string;
    operation?: string;
    transactionHash?: string;
    error?: any;
}
//# sourceMappingURL=index.d.ts.map