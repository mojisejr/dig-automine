'use client';

import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { bitkubTestnet } from 'wagmi/chains';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Zap, 
  Plus,
  Minus,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useDashboardData, useAutoMineTransactions } from '@/hooks/useAutoMine';
import { StakedNFTsGrid } from '@/components/NFTMinerCard';
import { useState, useEffect } from 'react';

export default function NFTsPage() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const [selectedTokenIds, setSelectedTokenIds] = useState<bigint[]>([]);
  
  // Check if user is on wrong network
  const isWrongNetwork = isConnected && chainId !== bitkubTestnet.id;
  
  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: bitkubTestnet.id });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };
  
  const {
    userInfo,
    nftBalance,
    isApprovedForAll,
    isLoading: dashboardLoading
  } = useDashboardData();
  
  const {
    deposit,
    claimReward,
    withdrawAllNFT,
    approveNFTs,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error
  } = useAutoMineTransactions();

  const handleStakeSelected = () => {
    if (selectedTokenIds.length > 0) {
      deposit(selectedTokenIds);
      setSelectedTokenIds([]);
    }
  };

  const handleUnstakeAll = () => {
    withdrawAllNFT();
  };

  const handleClaimRewards = () => {
    claimReward();
  };

  const handleApproveNFTs = () => {
    approveNFTs();
  };

  // Handle NFT approval success
  useEffect(() => {
    if (isConfirmed && hash) {
      console.log("NFT approval successful! Transaction hash:", hash);
    }
  }, [isConfirmed, hash]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      console.error("Transaction failed:", error.message);
    }
  }, [error]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view and manage your DigDragon NFTs
          </p>
          <Button className="silk-gradient text-white border-0">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">NFT Management</h1>
        <p className="text-muted-foreground">
          Manage your DigDragon NFTs and mining operations
        </p>
      </div>

      {/* Wrong Network Warning */}
      {isWrongNetwork && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">
                    Wrong Network Detected
                  </h3>
                  <p className="text-sm text-red-700">
                    You're connected to {chain?.name || 'Unknown Network'} (Chain ID: {chainId}). 
                    Please switch to Bitkub Testnet (Chain ID: 25925) to manage your NFTs.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSwitchNetwork}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                Switch to Testnet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total NFTs</span>
            </div>
            <p className="text-2xl font-bold">
              {dashboardLoading ? "..." : nftBalance?.toString() || "0"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Staked NFTs</span>
            </div>
            <p className="text-2xl font-bold">
              {dashboardLoading ? "..." : userInfo?.tokenIds?.length || "0"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Hash Power</span>
            </div>
            <p className="text-2xl font-bold">
              {dashboardLoading ? "..." : userInfo?.totalHashPower?.toString() || "0"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-4 w-4 rounded-full ${
                userInfo?.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">Status</span>
            </div>
            <p className="text-lg font-bold">
              {dashboardLoading ? "..." : userInfo?.isActive ? "Active" : "Idle"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status */}
      {(isPending || isConfirming || isConfirmed || error) && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {isPending && (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  <span>Transaction pending...</span>
                </>
              )}
              {isConfirming && (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
                  <span>Confirming transaction...</span>
                </>
              )}
              {isConfirmed && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Transaction confirmed!</span>
                </>
              )}
              {error && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Error: {error.message}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Required */}
      {nftBalance && nftBalance > 0 && !isApprovedForAll && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Approval Required</p>
                  <p className="text-sm text-yellow-700">
                    You need to approve the AutoMine contract to manage your NFTs
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handleApproveNFTs}
                  disabled={isPending || isConfirming}
                  className="silk-gradient text-white border-0"
                >
                  {isPending || isConfirming ? "Approving..." : "Approve NFTs"}
                </Button>
                {isConfirmed && (
                  <p className="text-xs text-green-600">
                    ✓ NFT approval successful! You can now stake your NFTs.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="staked" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="staked">Staked NFTs</TabsTrigger>
          <TabsTrigger value="available">Available NFTs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="staked" className="space-y-6">
          {dashboardLoading ? (
            <Card>
              <CardContent className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading staked NFTs...</p>
              </CardContent>
            </Card>
          ) : (
            <StakedNFTsGrid
              tokenIds={userInfo?.tokenIds || []}
              totalHashPower={userInfo?.totalHashPower || BigInt(0)}
              isActive={userInfo?.isActive || false}
              lastRewardClaim={userInfo?.lastRewardClaim}
              onUnstakeAll={handleUnstakeAll}
              onClaimRewards={handleClaimRewards}
              isLoading={isPending || isConfirming}
            />
          )}
        </TabsContent>
        
        <TabsContent value="available" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available NFTs</CardTitle>
              <CardDescription>
                Select NFTs to stake for mining. Staked NFTs will generate hash power and earn rewards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading available NFTs...</p>
                </div>
              ) : !nftBalance || nftBalance === BigInt(0) ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No NFTs Available</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any DigDragon NFTs in your wallet
                  </p>
                  <Button variant="outline">
                    Get DigDragon NFTs
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You have {nftBalance.toString()} DigDragon NFT{nftBalance > 1 ? 's' : ''} available
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Note: Individual NFT selection will be implemented in a future update.
                      Currently, you can stake all available NFTs at once.
                    </p>
                    
                    {isApprovedForAll ? (
                      <Button 
                        onClick={() => {
                          // For now, we'll create a simple array of token IDs
                          // In a real implementation, you'd fetch the actual token IDs
                          const mockTokenIds = Array.from(
                            { length: Number(nftBalance) }, 
                            (_, i) => BigInt(i + 1)
                          );
                          deposit(mockTokenIds);
                        }}
                        disabled={isPending || isConfirming}
                        className="silk-gradient text-white border-0"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isPending || isConfirming ? "Staking..." : "Stake All NFTs"}
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Please approve the contract first to stake your NFTs
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}