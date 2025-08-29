import { ContractService } from './contract';
import { Web3Service } from './web3';
import { BotConfig, MineSwitchOperation } from '../types';
export declare class SchedulerService {
    private contractService;
    private web3Service;
    private config;
    private isRunning;
    private activeOperations;
    private cronJob?;
    constructor(contractService: ContractService, web3Service: Web3Service, config: BotConfig);
    start(): Promise<void>;
    stop(): void;
    private getCronExpression;
    private performStartupCheck;
    private executeMineSwitch;
    private getNextTargetMine;
    private handleFailedOperation;
    getOperationStatus(operationId: string): Promise<MineSwitchOperation | undefined>;
    getActiveOperations(): MineSwitchOperation[];
    isSchedulerRunning(): boolean;
}
//# sourceMappingURL=scheduler.d.ts.map