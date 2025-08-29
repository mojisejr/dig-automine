declare class AutoMineBot {
    private web3Service;
    private contractService;
    private mineMonitor;
    private dashboard;
    private config;
    private isRunning;
    private monitoringInterval;
    constructor();
    start(): Promise<void>;
    private startMonitoringLoop;
    private setupErrorHandlers;
    shutdown(): Promise<void>;
    private setupGracefulShutdown;
    getStatus(): Promise<any>;
    isActive(): boolean;
}
export default AutoMineBot;
//# sourceMappingURL=index.d.ts.map