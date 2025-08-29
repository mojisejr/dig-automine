"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const logger_1 = require("../utils/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class DashboardService {
    constructor(web3Service, contractService, mineMonitor, config) {
        this.errorCount = 0;
        this.lastOperation = 'startup';
        this.web3Service = web3Service;
        this.contractService = contractService;
        this.mineMonitor = mineMonitor;
        this.config = config;
    }
    async collectDashboardData() {
        try {
            logger_1.logger.debug('Collecting dashboard data...', 'DASHBOARD');
            const [contractStats, mineStatuses, recommendation, blockHeight, balance] = await Promise.all([
                this.contractService.getContractStats().catch(error => {
                    this.errorCount++;
                    logger_1.logger.error('Failed to get contract stats', error, 'DASHBOARD');
                    return { totalTokens: 0, activeUsers: 0, current: '0x0', target: '0x0' };
                }),
                this.mineMonitor.checkAllMines().catch(error => {
                    this.errorCount++;
                    logger_1.logger.error('Failed to check mine statuses', error, 'DASHBOARD');
                    return {
                        current: { name: 'Unknown', isActive: false, address: '0x0', lastChecked: 0 },
                        target: { name: 'Unknown', isActive: false, address: '0x0', lastChecked: 0 }
                    };
                }),
                this.mineMonitor.getMineSwitchRecommendation().catch(error => {
                    this.errorCount++;
                    logger_1.logger.error('Failed to get mine recommendation', error, 'DASHBOARD');
                    return { recommendation: 'no-action', reason: 'Error getting recommendation', targetMine: null, stats: null };
                }),
                this.web3Service.getBlockNumber().catch(error => {
                    this.errorCount++;
                    return BigInt(0);
                }),
                this.web3Service.getBalance(this.web3Service.getAccount().address).catch(error => {
                    this.errorCount++;
                    return BigInt(0);
                })
            ]);
            const dashboardData = {
                timestamp: new Date().toISOString(),
                botStatus: this.errorCount === 0 ? 'online' : 'error',
                contractStats: {
                    totalTokens: contractStats.totalTokens,
                    activeUsers: contractStats.activeUsers,
                    currentMine: contractStats.current,
                    targetMine: contractStats.target
                },
                mineStatuses: {
                    current: {
                        name: mineStatuses.current.name,
                        isActive: mineStatuses.current.isActive,
                        address: mineStatuses.current.address
                    },
                    target: {
                        name: mineStatuses.target.name,
                        isActive: mineStatuses.target.isActive,
                        address: mineStatuses.target.address
                    }
                },
                recommendation: {
                    action: recommendation.recommendation,
                    reason: recommendation.reason
                },
                systemHealth: {
                    blockHeight: Number(blockHeight),
                    botBalance: balance.toString(),
                    lastOperation: this.lastOperation,
                    errorCount: this.errorCount
                }
            };
            this.saveDashboardData(dashboardData);
            return dashboardData;
        }
        catch (error) {
            logger_1.logger.error('Failed to collect dashboard data', error, 'DASHBOARD');
            throw error;
        }
    }
    saveDashboardData(data) {
        try {
            const dashboardDir = path_1.default.join(__dirname, '../../../../docs/dashboard');
            if (!fs_1.default.existsSync(dashboardDir)) {
                fs_1.default.mkdirSync(dashboardDir, { recursive: true });
            }
            // Save current status
            const statusFile = path_1.default.join(dashboardDir, 'current-status.json');
            fs_1.default.writeFileSync(statusFile, JSON.stringify(data, null, 2));
            // Append to historical data
            const historyFile = path_1.default.join(dashboardDir, 'status-history.jsonl');
            fs_1.default.appendFileSync(historyFile, JSON.stringify(data) + '\n');
            logger_1.logger.debug('Dashboard data saved', 'DASHBOARD');
        }
        catch (error) {
            logger_1.logger.error('Failed to save dashboard data', error, 'DASHBOARD');
        }
    }
    updateLastOperation(operation) {
        this.lastOperation = operation;
        logger_1.logger.debug(`Updated last operation to: ${operation}`, 'DASHBOARD');
    }
    reportError() {
        this.errorCount++;
    }
    resetErrorCount() {
        this.errorCount = 0;
    }
    generateStatusReport() {
        const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../../../../docs/dashboard/current-status.json'), 'utf8'));
        return `
🤖 AutoMine Bot Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Last Updated: ${new Date(data.timestamp).toLocaleString()}
🟢 Bot Status: ${data.botStatus.toUpperCase()}
📊 Contract Stats:
   • Total Staked NFTs: ${data.contractStats.totalTokens}
   • Active Users: ${data.contractStats.activeUsers}

⛏️  Mine Status:
   • Current: ${data.mineStatuses.current.name} ${data.mineStatuses.current.isActive ? '🟢' : '🔴'}
   • Target: ${data.mineStatuses.target.name} ${data.mineStatuses.target.isActive ? '🟢' : '🔴'}

🎯 Recommendation: ${data.recommendation.action.toUpperCase()}
📝 Reason: ${data.recommendation.reason}

🔧 System Health:
   • Block Height: ${data.systemHealth.blockHeight}
   • Bot Balance: ${data.systemHealth.botBalance} wei
   • Last Operation: ${data.systemHealth.lastOperation}
   • Error Count: ${data.systemHealth.errorCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.js.map