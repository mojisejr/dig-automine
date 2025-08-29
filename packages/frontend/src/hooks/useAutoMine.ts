import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { 
  CONTRACT_ADDRESSES, 
  AUTOMINE_ABI, 
  DIGDRAGON_NFT_ABI,
  UserInfo, 
  ContractStats, 
  DepositedTokens 
} from '@/lib/contracts';
import { useAccount } from 'wagmi';
import { useMemo } from 'react';

// Hook for getting user information from AutoMine contract
export function useUserInfo(userAddress?: Address) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    functionName: 'getUserInfo',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const userInfo = useMemo(() => {
    if (!data) return null;
    
    const [tokenIds, totalHashPower, lastRewardClaim, isActive] = data as [
      bigint[],
      bigint,
      bigint,
      boolean
    ];
    
    return {
      tokenIds,
      totalHashPower,
      lastRewardClaim,
      isActive,
    } as UserInfo;
  }, [data]);

  return {
    userInfo,
    isLoading,
    isError,
    refetch,
  };
}

// Hook for getting contract statistics
export function useContractStats() {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    functionName: 'getContractStats',
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const contractStats = useMemo(() => {
    if (!data) return null;
    
    const [totalTokens, activeUsers, current, target] = data as [
      bigint,
      bigint,
      Address,
      Address
    ];
    
    return {
      totalTokens,
      activeUsers,
      current,
      target,
    } as ContractStats;
  }, [data]);

  return {
    contractStats,
    isLoading,
    isError,
    refetch,
  };
}

// Hook for getting all deposited tokens
export function useDepositedTokens() {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    functionName: 'getDepositedTokens',
    query: {
      refetchInterval: 60000, // Refetch every minute
    },
  });

  const depositedTokens = useMemo(() => {
    if (!data) return null;
    
    const [users, tokenIds] = data as [Address[], bigint[][]];
    
    return {
      users,
      tokenIds,
    } as DepositedTokens;
  }, [data]);

  return {
    depositedTokens,
    isLoading,
    isError,
    refetch,
  };
}

// Hook for getting current and target mine addresses
export function useMineAddresses() {
  const { data: currentMine } = useReadContract({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    functionName: 'currentMine',
  });

  const { data: targetMine } = useReadContract({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    functionName: 'targetMine',
  });

  const { data: feePercentage } = useReadContract({
    address: CONTRACT_ADDRESSES.AUTOMINE,
    abi: AUTOMINE_ABI,
    functionName: 'feePercentage',
  });

  return {
    currentMine: currentMine as Address,
    targetMine: targetMine as Address,
    feePercentage: feePercentage as bigint,
  };
}

// Hook for NFT balance and approval
export function useNFTInfo(userAddress?: Address) {
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.DIGDRAGON_NFT,
    abi: DIGDRAGON_NFT_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: isApprovedForAll } = useReadContract({
    address: CONTRACT_ADDRESSES.DIGDRAGON_NFT,
    abi: DIGDRAGON_NFT_ABI,
    functionName: 'isApprovedForAll',
    args: userAddress ? [userAddress, CONTRACT_ADDRESSES.AUTOMINE] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    nftBalance: balance as bigint,
    isApprovedForAll: isApprovedForAll as boolean,
  };
}

// Hook for contract write operations
export function useAutoMineTransactions() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Deposit NFTs
  const deposit = (tokenIds: bigint[]) => {
    writeContract({
      address: CONTRACT_ADDRESSES.AUTOMINE,
      abi: AUTOMINE_ABI,
      functionName: 'deposit',
      args: [tokenIds],
    });
  };

  // Claim rewards
  const claimReward = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.AUTOMINE,
      abi: AUTOMINE_ABI,
      functionName: 'claimReward',
    });
  };

  // Withdraw all NFTs
  const withdrawAllNFT = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.AUTOMINE,
      abi: AUTOMINE_ABI,
      functionName: 'withdrawAllNFT',
    });
  };

  // Approve NFT contract for AutoMine
  const approveNFTs = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.DIGDRAGON_NFT,
      abi: DIGDRAGON_NFT_ABI,
      functionName: 'setApprovalForAll',
      args: [CONTRACT_ADDRESSES.AUTOMINE, true],
    });
  };

  return {
    deposit,
    claimReward,
    withdrawAllNFT,
    approveNFTs,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Combined hook for dashboard data
export function useDashboardData() {
  const { address } = useAccount();
  const { userInfo, isLoading: userInfoLoading } = useUserInfo(address);
  const { contractStats, isLoading: statsLoading } = useContractStats();
  const { depositedTokens, isLoading: tokensLoading } = useDepositedTokens();
  const { currentMine, targetMine, feePercentage } = useMineAddresses();
  const { nftBalance, isApprovedForAll } = useNFTInfo(address);

  const isLoading = userInfoLoading || statsLoading || tokensLoading;

  // Calculate user's earnings (this would need to be implemented based on mining logic)
  const totalEarnings = useMemo(() => {
    // This is a placeholder - actual earnings calculation would depend on
    // mining rewards, time staked, hash power, etc.
    return BigInt(0);
  }, [userInfo]);

  // Get active miners count for the user
  const activeMiners = useMemo(() => {
    return userInfo?.tokenIds?.length || 0;
  }, [userInfo]);

  // Check if user has any active mining operations
  const hasActiveMining = useMemo(() => {
    return userInfo?.isActive && (userInfo?.tokenIds?.length || 0) > 0;
  }, [userInfo]);

  return {
    // User specific data
    userInfo,
    totalEarnings,
    activeMiners,
    hasActiveMining,
    nftBalance,
    isApprovedForAll,
    
    // Contract wide data
    contractStats,
    depositedTokens,
    currentMine,
    targetMine,
    feePercentage,
    
    // Loading states
    isLoading,
  };
}