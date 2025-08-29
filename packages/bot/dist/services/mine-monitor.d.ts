import { Address } from 'viem';
import { Web3Service } from './web3';
import { ContractService } from './contract';
import { BotConfig } from '../types';
export interface MineStatus {
    address: Address;
    name: string;
    isActive: boolean;
    lastChecked: number;
    statusHistory?: Array<{
        isActive: boolean;
        timestamp: number;
    }>;
}
export interface TimingAnalysis {
    averageActiveDuration: number;
    averageInactiveDuration: number;
    lastStatusChange: number;
    predictedNextChange: number;
    confidence: number;
}
export declare class MineMonitorService {
    private web3Service;
    private contractService;
    private config;
    private statusHistory;
    constructor(web3Service: Web3Service, contractService: ContractService, config: BotConfig);
    checkMineStatus(mineAddress: Address): Promise<MineStatus>;
    checkAllMines(): Promise<{
        current: MineStatus;
        target: MineStatus;
    }>;
    shouldSwitchMine(): Promise<{
        shouldSwitch: boolean;
        reason: string;
    }>;
    getMineSwitchRecommendation(): Promise<{
        recommendation: 'switch' | 'wait' | 'no-action';
        targetMine: Address | null;
        reason: string;
        stats: {
            current: MineStatus;
            target: MineStatus;
        };
    }>;
    private loadStatusHistory;
    private saveStatusHistory;
    private updateStatusHistory;
    analyzeMineTiming(mineAddress: Address): TimingAnalysis | null;
    private calculateVariance;
    getOptimalSwitchTiming(): Promise<{
        currentMineAnalysis: TimingAnalysis | null;
        targetMineAnalysis: TimingAnalysis | null;
        recommendation: string;
        optimalWindow: {
            start: number;
            end: number;
        } | null;
    }>;
}
//# sourceMappingURL=mine-monitor.d.ts.map