import { useWatchContractEvent } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { Address, Log } from 'viem';
import { CONTRACT_ADDRESSES, AUTOMINE_ABI } from '@/lib/contracts';

// Event types
export interface DepositEvent {
  user: Address;
  tokenIds: bigint[];
  timestamp: bigint;
}

export interface WithdrawEvent {
  user: Address;
  tokenIds: bigint[];
  timestamp: bigint;
}

export interface RewardClaimEvent {
  user: Address;
  amount: bigint;
  timestamp: bigint;
}

export interface MiningStatusEvent {
  user: Address;
  isActive: boolean;
  timestamp: bigint;
}

// Hook for watching Deposit events
export function useDepositEvents(userAddress?: Address) {
  const [events, setEvents] = useState<DepositEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'NFTDeposited',
    args: userAddress ? { user: userAddress } : undefined,
    onLogs(logs) {
      const newEvents = logs.map((log: any) => ({
        user: log.args.user,
        tokenIds: log.args.tokenIds,
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      }));
      
      setEvents(prev => [...newEvents, ...prev].slice(0, 50)); // Keep last 50 events
      
      // Log successful deposits
      if (userAddress && newEvents.some(event => event.user.toLowerCase() === userAddress.toLowerCase())) {
        console.log(`Successfully staked ${newEvents[0].tokenIds.length} NFT(s)`);
      }
    },
  });

  return { events, isLoading };
}

// Hook for watching Withdraw events
export function useWithdrawEvents(userAddress?: Address) {
  const [events, setEvents] = useState<WithdrawEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'NFTWithdrawn',
    args: userAddress ? { user: userAddress } : undefined,
    onLogs(logs) {
      const newEvents = logs.map((log: any) => ({
        user: log.args.user,
        tokenIds: log.args.tokenIds,
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      }));
      
      setEvents(prev => [...newEvents, ...prev].slice(0, 50));
      
      // Log successful withdrawals
      if (userAddress && newEvents.some(event => event.user.toLowerCase() === userAddress.toLowerCase())) {
        console.log(`Successfully unstaked ${newEvents[0].tokenIds.length} NFT(s)`);
      }
    },
  });

  return { events, isLoading };
}

// Hook for watching RewardClaim events
export function useRewardClaimEvents(userAddress?: Address) {
  const [events, setEvents] = useState<RewardClaimEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'RewardClaimed',
    args: userAddress ? { user: userAddress } : undefined,
    onLogs(logs) {
      const newEvents = logs.map((log: any) => ({
        user: log.args.user,
        amount: log.args.amount,
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      }));
      
      setEvents(prev => [...newEvents, ...prev].slice(0, 50));
      
      // Log successful reward claims
      if (userAddress && newEvents.some(event => event.user.toLowerCase() === userAddress.toLowerCase())) {
        console.log(`Successfully claimed ${(Number(newEvents[0].amount) / 1e18).toFixed(4)} KUB rewards`);
      }
    },
  });

  return { events, isLoading };
}

// Hook for watching MiningStatus events
export function useMiningStatusEvents(userAddress?: Address) {
  const [events, setEvents] = useState<MiningStatusEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'MineSwitch',
    args: undefined, // MineSwitch doesn't filter by user
    onLogs(logs) {
      const newEvents = logs.map((log: any) => ({
        user: log.args.user,
        isActive: log.args.isActive,
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      }));
      
      setEvents(prev => [...newEvents, ...prev].slice(0, 50));
      
      // Log mining status changes
      if (userAddress && newEvents.some(event => event.user.toLowerCase() === userAddress.toLowerCase())) {
        const status = newEvents[0].isActive ? 'started' : 'stopped';
        console.log(`Mining ${status}`);
      }
    },
  });

  return { events, isLoading };
}

// Combined hook for all user events
export function useUserEvents(userAddress?: Address) {
  const { events: depositEvents } = useDepositEvents(userAddress);
  const { events: withdrawEvents } = useWithdrawEvents(userAddress);
  const { events: rewardEvents } = useRewardClaimEvents(userAddress);
  const { events: statusEvents } = useMiningStatusEvents(userAddress);

  // Combine and sort all events by timestamp
  const allEvents = [
    ...depositEvents.map(e => ({ ...e, type: 'deposit' as const })),
    ...withdrawEvents.map(e => ({ ...e, type: 'withdraw' as const })),
    ...rewardEvents.map(e => ({ ...e, type: 'reward' as const })),
    ...statusEvents.map(e => ({ ...e, type: 'status' as const }))
  ].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return {
    allEvents: allEvents.slice(0, 20), // Return last 20 events
    depositEvents,
    withdrawEvents,
    rewardEvents,
    statusEvents
  };
}

// Hook for real-time data refresh
export function useRealTimeUpdates(userAddress?: Address) {
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Watch for any contract events that should trigger a data refresh
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'NFTDeposited',
    onLogs() {
      setLastUpdate(Date.now());
      setRefreshTrigger(prev => prev + 1);
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'NFTWithdrawn',
    onLogs() {
      setLastUpdate(Date.now());
      setRefreshTrigger(prev => prev + 1);
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'RewardClaimed',
    onLogs() {
      setLastUpdate(Date.now());
      setRefreshTrigger(prev => prev + 1);
    },
  });

  // Manual refresh function
  const refresh = useCallback(() => {
    setLastUpdate(Date.now());
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    lastUpdate,
    refreshTrigger,
    refresh
  };
}

// Hook for contract statistics with real-time updates
export function useRealTimeStats() {
  const [stats, setStats] = useState({
    totalStaked: BigInt(0),
    totalUsers: BigInt(0),
    totalRewardsClaimed: BigInt(0),
    lastUpdate: Date.now()
  });

  // Watch for events that affect global stats
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'NFTDeposited',
    onLogs(logs) {
      // Update stats when new deposits happen
      setStats(prev => ({
        ...prev,
        lastUpdate: Date.now()
      }));
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'NFTWithdrawn',
    onLogs(logs) {
      // Update stats when withdrawals happen
      setStats(prev => ({
        ...prev,
        lastUpdate: Date.now()
      }));
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    eventName: 'RewardClaimed',
    onLogs(logs) {
      // Update stats when rewards are claimed
      setStats(prev => ({
        ...prev,
        lastUpdate: Date.now()
      }));
    },
  });

  return stats;
}