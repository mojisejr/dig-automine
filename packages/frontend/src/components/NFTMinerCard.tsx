'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { formatEther } from 'viem';
import { useMounted } from '@/hooks/useMounted';

interface NFTMinerCardProps {
  tokenId: bigint;
  hashPower?: bigint;
  isActive: boolean;
  lastRewardClaim?: bigint;
  estimatedRewards?: bigint;
  onUnstake?: () => void;
  onClaimRewards?: () => void;
  isLoading?: boolean;
}

export function NFTMinerCard({
  tokenId,
  hashPower,
  isActive,
  lastRewardClaim,
  estimatedRewards,
  onUnstake,
  onClaimRewards,
  isLoading = false
}: NFTMinerCardProps) {
  const mounted = useMounted();
  
  // Color palette for NFT cards
  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500', 
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-blue-500'
  ];
  
  const colorIndex = Number(tokenId) % colors.length;
  const colorClass = colors[colorIndex];
  
  const formatTimeAgo = (timestamp: bigint) => {
    if (!mounted) return 'Loading...';
    
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(timestamp);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Card className="silk-shadow border-border/50 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center text-white font-bold`}>
              #{tokenId.toString().padStart(3, '0')}
            </div>
            <div>
              <CardTitle className="text-lg">NFT Miner #{tokenId.toString()}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isActive ? 'Active Mining' : 'Staked'}
              </p>
            </div>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Idle"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hash Power */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">Hash Power</span>
          </div>
          <span className="font-bold text-lg">
            {hashPower ? hashPower.toString() : '0'} HP
          </span>
        </div>
        
        {/* Estimated Rewards */}
        {estimatedRewards !== undefined && (
          <div className="flex items-center justify-between p-3 event-success rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-700">Estimated Rewards</span>
            </div>
            <span className="font-bold text-green-700">
              {formatEther(estimatedRewards)} KUB
            </span>
          </div>
        )}
        
        {/* Last Reward Claim */}
        {lastRewardClaim && lastRewardClaim > 0 && (
          <div className="flex items-center justify-between p-3 event-info rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700">Last Claim</span>
            </div>
            <span className="text-blue-700">
              {formatTimeAgo(lastRewardClaim)}
            </span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onClaimRewards && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onClaimRewards}
              disabled={isLoading || !isActive}
            >
              Claim Rewards
            </Button>
          )}
          {onUnstake && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onUnstake}
              disabled={isLoading}
            >
              Unstake
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for displaying all staked NFTs
interface StakedNFTsGridProps {
  tokenIds: bigint[];
  totalHashPower: bigint;
  isActive: boolean;
  lastRewardClaim?: bigint;
  onUnstakeAll?: () => void;
  onClaimRewards?: () => void;
  isLoading?: boolean;
}

export function StakedNFTsGrid({
  tokenIds,
  totalHashPower,
  isActive,
  lastRewardClaim,
  onUnstakeAll,
  onClaimRewards,
  isLoading = false
}: StakedNFTsGridProps) {
  if (!tokenIds || tokenIds.length === 0) {
    return (
      <Card className="silk-shadow border-border/50">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No NFTs Staked</h3>
          <p className="text-muted-foreground mb-4">
            Stake your DigDragon NFTs to start mining and earning rewards
          </p>
          <Button className="silk-gradient text-white border-0">
            Stake NFTs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="silk-shadow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Mining Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{tokenIds.length}</p>
              <p className="text-sm text-muted-foreground">NFTs Staked</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{totalHashPower.toString()}</p>
              <p className="text-sm text-muted-foreground">Total Hash Power</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Badge variant={isActive ? "default" : "secondary"} className="text-lg px-4 py-2">
                {isActive ? "Active" : "Idle"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">Status</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            {onClaimRewards && (
              <Button 
                className="flex-1 silk-gradient text-white border-0"
                onClick={onClaimRewards}
                disabled={isLoading || !isActive}
              >
                {isLoading ? "Processing..." : "Claim All Rewards"}
              </Button>
            )}
            {onUnstakeAll && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onUnstakeAll}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Unstake All"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Individual NFT Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokenIds.map((tokenId) => (
          <NFTMinerCard
            key={tokenId.toString()}
            tokenId={tokenId}
            isActive={isActive}
            lastRewardClaim={lastRewardClaim}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}