import { Address } from 'viem';
import { Web3Service } from './web3';
import { ContractService } from './contract';
import { BotConfig, MineSwitchOperation, UserDeposit } from '../types';
export declare class MonitorService {
    private web3Service;
    private contractService;
    private config;
    private isMonitoring;
    private userDeposits;
    private operationHistory;
    private healthCheckInterval?;
    constructor(web3Service: Web3Service, contractService: ContractService, config: BotConfig);
    startMonitoring(): Promise<void>;
    stopMonitoring(): void;
    private syncUserDeposits;
    private performHealthCheck;
    recordOperation(operation: MineSwitchOperation): Promise<void>;
    getOperationHistory(): MineSwitchOperation[];
    getUserDeposits(): UserDeposit[];
    getSystemStatus(): Promise<{
        isMonitoring: boolean;
        userCount: number;
        totalNFTs: number;
        recentOperations: MineSwitchOperation[];
        currentMine: Address;
        botBalance: bigint;
    }>;
    validateOperation(operation: MineSwitchOperation): Promise<boolean>;
    isMonitoringActive(): boolean;
}
//# sourceMappingURL=monitor.d.ts.map