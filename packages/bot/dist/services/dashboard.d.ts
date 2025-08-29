import { ContractService } from './contract';
import { MineMonitorService } from './mine-monitor';
import { Web3Service } from './web3';
import { BotConfig } from '../types';
export interface DashboardData {
    timestamp: string;
    botStatus: 'online' | 'offline' | 'error';
    contractStats: {
        totalTokens: number;
        activeUsers: number;
        currentMine: string;
        targetMine: string;
    };
    mineStatuses: {
        current: {
            name: string;
            isActive: boolean;
            address: string;
        };
        target: {
            name: string;
            isActive: boolean;
            address: string;
        };
    };
    recommendation: {
        action: 'switch' | 'wait' | 'no-action';
        reason: string;
    };
    systemHealth: {
        blockHeight: number;
        botBalance: string;
        lastOperation: string;
        errorCount: number;
    };
}
export declare class DashboardService {
    private web3Service;
    private contractService;
    private mineMonitor;
    private config;
    private errorCount;
    private lastOperation;
    constructor(web3Service: Web3Service, contractService: ContractService, mineMonitor: MineMonitorService, config: BotConfig);
    collectDashboardData(): Promise<DashboardData>;
    private saveDashboardData;
    updateLastOperation(operation: string): void;
    reportError(): void;
    resetErrorCount(): void;
    generateStatusReport(): string;
}
//# sourceMappingURL=dashboard.d.ts.map