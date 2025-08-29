"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Service = void 0;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const logger_1 = require("../utils/logger");
class Web3Service {
    constructor(config) {
        this.config = config;
        this.account = (0, accounts_1.privateKeyToAccount)(config.botPrivateKey);
        this.setupClients();
    }
    setupClients() {
        try {
            const bitkubChain = {
                id: this.config.chainId,
                name: 'Bitkub Chain',
                network: 'bitkub',
                nativeCurrency: {
                    decimals: 18,
                    name: 'KUB',
                    symbol: 'KUB',
                },
                rpcUrls: {
                    default: {
                        http: [this.config.rpcUrl],
                    },
                    public: {
                        http: [this.config.rpcUrl],
                    },
                },
            };
            this.publicClient = (0, viem_1.createPublicClient)({
                chain: bitkubChain,
                transport: (0, viem_1.http)()
            });
            this.walletClient = (0, viem_1.createWalletClient)({
                account: this.account,
                chain: bitkubChain,
                transport: (0, viem_1.http)()
            });
            logger_1.logger.info('Web3 clients initialized successfully', 'WEB3_SETUP');
        }
        catch (error) {
            logger_1.logger.error('Failed to setup Web3 clients', error, 'WEB3_SETUP');
            throw error;
        }
    }
    async getBlockNumber() {
        try {
            const blockNumber = await this.publicClient.getBlockNumber();
            logger_1.logger.debug(`Current block number: ${blockNumber}`, 'BLOCKCHAIN_INFO');
            return blockNumber;
        }
        catch (error) {
            logger_1.logger.error('Failed to get block number', error, 'BLOCKCHAIN_INFO');
            throw error;
        }
    }
    async getBalance(address) {
        try {
            const targetAddress = address || this.account.address;
            const balance = await this.publicClient.getBalance({
                address: targetAddress
            });
            logger_1.logger.debug(`Wallet balance for ${targetAddress}: ${balance} KUB`, 'WALLET_INFO');
            return balance;
        }
        catch (error) {
            logger_1.logger.error('Failed to get wallet balance', error, 'WALLET_INFO');
            throw error;
        }
    }
    async estimateGas(contractAddress, functionData) {
        try {
            const gasEstimate = await this.publicClient.estimateGas({
                account: this.account,
                to: contractAddress,
                data: functionData
            });
            const gasWithBuffer = gasEstimate + (gasEstimate * BigInt(20) / BigInt(100));
            logger_1.logger.debug(`Gas estimated: ${gasEstimate}, with buffer: ${gasWithBuffer}`, 'GAS_ESTIMATION');
            return gasWithBuffer;
        }
        catch (error) {
            logger_1.logger.error('Failed to estimate gas', error, 'GAS_ESTIMATION');
            throw error;
        }
    }
    async waitForTransactionReceipt(hash, timeout = 60000) {
        try {
            logger_1.logger.info(`Waiting for transaction confirmation: ${hash}`, 'TRANSACTION_WAIT');
            const receipt = await this.publicClient.waitForTransactionReceipt({
                hash,
                timeout
            });
            if (receipt.status === 'success') {
                logger_1.logger.info(`Transaction confirmed successfully: ${hash}`, 'TRANSACTION_CONFIRMED', hash);
            }
            else {
                logger_1.logger.error(`Transaction failed: ${hash}`, null, 'TRANSACTION_FAILED', hash);
            }
            return receipt;
        }
        catch (error) {
            logger_1.logger.error(`Transaction timeout or error: ${hash}`, error, 'TRANSACTION_ERROR', hash);
            throw error;
        }
    }
    getPublicClient() {
        return this.publicClient;
    }
    getWalletClient() {
        return this.walletClient;
    }
    getAccount() {
        return this.account;
    }
}
exports.Web3Service = Web3Service;
//# sourceMappingURL=web3.js.map