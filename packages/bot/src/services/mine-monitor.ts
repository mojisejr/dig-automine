import { Address } from 'viem';
import { Web3Service } from './web3';
import { ContractService } from './contract';
import { BotConfig } from '../types';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export interface MineStatus {
  address: Address;
  name: string;
  isActive: boolean;
  lastChecked: number;
  statusHistory?: Array<{ isActive: boolean; timestamp: number }>;
}

export interface TimingAnalysis {
  averageActiveDuration: number; // in milliseconds
  averageInactiveDuration: number;
  lastStatusChange: number;
  predictedNextChange: number;
  confidence: number; // 0-1
}

export class MineMonitorService {
  private web3Service: Web3Service;
  private contractService: ContractService;
  private config: BotConfig;
  private statusHistory: Map<Address, Array<{ isActive: boolean; timestamp: number }>> = new Map();
  
  constructor(web3Service: Web3Service, contractService: ContractService, config: BotConfig) {
    this.web3Service = web3Service;
    this.contractService = contractService;
    this.config = config;
    this.loadStatusHistory();
  }

  async checkMineStatus(mineAddress: Address): Promise<MineStatus> {
    try {
      const mineAbi = [
        'function name() external view returns (string)',
        'function isActive() external view returns (bool)'
      ];

      const [name, isActive] = await Promise.all([
        this.web3Service.getPublicClient().readContract({
          address: mineAddress,
          abi: mineAbi,
          functionName: 'name'
        }),
        this.web3Service.getPublicClient().readContract({
          address: mineAddress,
          abi: mineAbi,
          functionName: 'isActive'
        })
      ]);

      const status: MineStatus = {
        address: mineAddress,
        name: name as string,
        isActive: isActive as boolean,
        lastChecked: Date.now()
      };

      // Update status history for timing analysis
      this.updateStatusHistory(mineAddress, isActive as boolean);

      logger.debug(`Mine ${name} status: ${isActive ? 'Active' : 'Inactive'}`, 'MINE_MONITOR');
      return status;
    } catch (error) {
      logger.error(`Failed to check mine status for ${mineAddress}`, error, 'MINE_MONITOR');
      throw error;
    }
  }

  async checkAllMines(): Promise<{ current: MineStatus, target: MineStatus }> {
    try {
      const stats = await this.contractService.getContractStats();
      
      const [currentStatus, targetStatus] = await Promise.all([
        this.checkMineStatus(stats.current),
        this.checkMineStatus(stats.target)
      ]);

      logger.info(`Mine status - Current: ${currentStatus.name} (${currentStatus.isActive ? 'Active' : 'Inactive'}), Target: ${targetStatus.name} (${targetStatus.isActive ? 'Active' : 'Inactive'})`, 'MINE_MONITOR');

      return { current: currentStatus, target: targetStatus };
    } catch (error) {
      logger.error('Failed to check all mine statuses', error, 'MINE_MONITOR');
      throw error;
    }
  }

  async shouldSwitchMine(): Promise<{ shouldSwitch: boolean, reason: string }> {
    try {
      const { current, target } = await this.checkAllMines();
      
      // Switch conditions:
      // 1. Current mine is inactive AND target mine is active
      // 2. Target mine becomes more profitable (future enhancement)
      
      if (!current.isActive && target.isActive) {
        return {
          shouldSwitch: true,
          reason: `Current mine (${current.name}) is inactive, target mine (${target.name}) is active`
        };
      }

      if (current.isActive && !target.isActive) {
        return {
          shouldSwitch: false,
          reason: `Current mine (${current.name}) is still active, target mine (${target.name}) is inactive`
        };
      }

      if (!current.isActive && !target.isActive) {
        return {
          shouldSwitch: false,
          reason: `Both mines are inactive - waiting for target mine to open`
        };
      }

      return {
        shouldSwitch: false,
        reason: `Both mines are active - no switch needed`
      };
    } catch (error) {
      logger.error('Failed to determine if mine switch is needed', error, 'MINE_MONITOR');
      return {
        shouldSwitch: false,
        reason: `Error checking mine status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getMineSwitchRecommendation(): Promise<{
    recommendation: 'switch' | 'wait' | 'no-action';
    targetMine: Address | null;
    reason: string;
    stats: { current: MineStatus, target: MineStatus };
  }> {
    try {
      const { shouldSwitch, reason } = await this.shouldSwitchMine();
      const stats = await this.checkAllMines();

      if (shouldSwitch) {
        return {
          recommendation: 'switch',
          targetMine: stats.target.address,
          reason,
          stats
        };
      }

      if (!stats.current.isActive && !stats.target.isActive) {
        return {
          recommendation: 'wait',
          targetMine: stats.target.address,
          reason: 'Waiting for target mine to become active',
          stats
        };
      }

      return {
        recommendation: 'no-action',
        targetMine: null,
        reason,
        stats
      };
    } catch (error) {
      logger.error('Failed to get mine switch recommendation', error, 'MINE_MONITOR');
      throw error;
    }
  }

  private loadStatusHistory(): void {
    try {
      const historyFile = path.join(__dirname, '../../../../docs/mine-history.json');
      if (fs.existsSync(historyFile)) {
        const data = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        this.statusHistory = new Map(Object.entries(data).map(([addr, history]) => [addr as Address, history as any]));
        logger.debug('Loaded mine status history', 'MINE_MONITOR');
      }
    } catch (error) {
      logger.error('Failed to load mine status history', error, 'MINE_MONITOR');
    }
  }

  private saveStatusHistory(): void {
    try {
      const historyFile = path.join(__dirname, '../../../../docs/mine-history.json');
      const data = Object.fromEntries(this.statusHistory.entries());
      fs.writeFileSync(historyFile, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error('Failed to save mine status history', error, 'MINE_MONITOR');
    }
  }

  private updateStatusHistory(mineAddress: Address, isActive: boolean): void {
    const timestamp = Date.now();
    
    if (!this.statusHistory.has(mineAddress)) {
      this.statusHistory.set(mineAddress, []);
    }

    const history = this.statusHistory.get(mineAddress)!;
    const lastEntry = history[history.length - 1];

    // Only record if status changed
    if (!lastEntry || lastEntry.isActive !== isActive) {
      history.push({ isActive, timestamp });
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      this.saveStatusHistory();
      logger.debug(`Status change recorded for mine ${mineAddress}: ${isActive}`, 'MINE_MONITOR');
    }
  }

  analyzeMineTiming(mineAddress: Address): TimingAnalysis | null {
    const history = this.statusHistory.get(mineAddress);
    
    if (!history || history.length < 4) {
      return null; // Not enough data
    }

    const activePeriods: number[] = [];
    const inactivePeriods: number[] = [];
    
    for (let i = 1; i < history.length; i++) {
      const duration = history[i].timestamp - history[i - 1].timestamp;
      
      if (history[i - 1].isActive) {
        activePeriods.push(duration);
      } else {
        inactivePeriods.push(duration);
      }
    }

    const averageActive = activePeriods.length > 0 
      ? activePeriods.reduce((a, b) => a + b, 0) / activePeriods.length 
      : 0;
    
    const averageInactive = inactivePeriods.length > 0 
      ? inactivePeriods.reduce((a, b) => a + b, 0) / inactivePeriods.length 
      : 0;

    const lastEntry = history[history.length - 1];
    const timeSinceLastChange = Date.now() - lastEntry.timestamp;
    
    // Simple prediction: assume pattern continues
    const expectedDuration = lastEntry.isActive ? averageActive : averageInactive;
    const predictedNextChange = lastEntry.timestamp + expectedDuration;
    
    // Confidence based on data consistency
    const allDurations = [...activePeriods, ...inactivePeriods];
    const variance = allDurations.length > 1 ? this.calculateVariance(allDurations) : 0;
    const confidence = Math.max(0, 1 - (variance / Math.max(averageActive, averageInactive)));

    return {
      averageActiveDuration: averageActive,
      averageInactiveDuration: averageInactive,
      lastStatusChange: lastEntry.timestamp,
      predictedNextChange,
      confidence: Math.min(confidence, 1)
    };
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  async getOptimalSwitchTiming(): Promise<{
    currentMineAnalysis: TimingAnalysis | null;
    targetMineAnalysis: TimingAnalysis | null;
    recommendation: string;
    optimalWindow: { start: number; end: number } | null;
  }> {
    try {
      const stats = await this.contractService.getContractStats();
      
      const currentAnalysis = this.analyzeMineTiming(stats.current);
      const targetAnalysis = this.analyzeMineTiming(stats.target);

      let recommendation = 'Insufficient data for timing analysis';
      let optimalWindow = null;

      if (currentAnalysis && targetAnalysis) {
        const now = Date.now();
        
        // If current mine is predicted to become inactive soon and target will be active
        if (currentAnalysis.predictedNextChange < now + (60 * 60 * 1000)) { // Within 1 hour
          optimalWindow = {
            start: Math.max(now, targetAnalysis.predictedNextChange - (30 * 60 * 1000)), // 30 min buffer
            end: currentAnalysis.predictedNextChange
          };
          recommendation = 'Optimal switch window identified based on timing patterns';
        } else {
          recommendation = 'Current timing patterns suggest waiting for better opportunity';
        }
      }

      return {
        currentMineAnalysis: currentAnalysis,
        targetMineAnalysis: targetAnalysis,
        recommendation,
        optimalWindow
      };
    } catch (error) {
      logger.error('Failed to analyze optimal switch timing', error, 'MINE_MONITOR');
      throw error;
    }
  }
}