declare class AutoMineBot {
    private web3Service;
    private contractService;
    private schedulerService;
    private monitorService;
    private isRunning;
    constructor();
    start(): Promise<void>;
    shutdown(): Promise<void>;
    private setupGracefulShutdown;
    getStatus(): Promise<any>;
    isActive(): boolean;
}
export default AutoMineBot;
//# sourceMappingURL=index.d.ts.map