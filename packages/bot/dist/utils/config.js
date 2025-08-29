"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBotConfig = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const getBotConfig = () => {
    const requiredEnvVars = [
        'RPC_URL',
        'CHAIN_ID',
        'AUTOMINE_CONTRACT_ADDRESS',
        'DIGDRAGON_NFT_CONTRACT_ADDRESS',
        'BOT_PRIVATE_KEY'
    ];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
    return {
        rpcUrl: process.env.RPC_URL,
        chainId: parseInt(process.env.CHAIN_ID),
        autoMineContractAddress: process.env.AUTOMINE_CONTRACT_ADDRESS,
        digDragonNftContractAddress: process.env.DIGDRAGON_NFT_CONTRACT_ADDRESS,
        currentMineAddress: process.env.CURRENT_MINE_ADDRESS || '',
        targetMineAddress: process.env.TARGET_MINE_ADDRESS || '',
        botPrivateKey: process.env.BOT_PRIVATE_KEY,
        mineSwitchIntervalHours: parseInt(process.env.MINE_SWITCH_INTERVAL_HOURS || '24'),
        maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
        gasLimit: parseInt(process.env.GAS_LIMIT || '500000'),
        gasPrice: BigInt(process.env.GAS_PRICE || '20000000000'),
        logLevel: process.env.LOG_LEVEL || 'info'
    };
};
exports.getBotConfig = getBotConfig;
//# sourceMappingURL=config.js.map