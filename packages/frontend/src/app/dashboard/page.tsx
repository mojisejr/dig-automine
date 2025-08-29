"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  TrendingUp,
  Coins,
  Activity,
  Settings,
  BarChart3,
  Zap,
  Clock,
  Target,
  Users,
  AlertCircle,
} from "lucide-react";
import { useAccount, useBalance, useSwitchChain, useChainId } from "wagmi";
import { formatEther } from "viem";
import { bitkubTestnet } from "wagmi/chains";
import { useDashboardData, useAutoMineTransactions } from "@/hooks/useAutoMine";
import { useUserEvents, useRealTimeUpdates } from "@/hooks/useContractEvents";
import { NETWORK_CONFIG } from "@/lib/contracts";
import { useState, useEffect } from "react";
// import { toast } from "sonner";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  // Check if user is on wrong network
  const isWrongNetwork = isConnected && chainId !== bitkubTestnet.id;

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: bitkubTestnet.id });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    userInfo,
    totalEarnings,
    activeMiners,
    hasActiveMining,
    nftBalance,
    isApprovedForAll,
    contractStats,
    isLoading: dashboardLoading,
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
    error,
  } = useAutoMineTransactions();

  // Real-time event listening
  const userEvents = useUserEvents(address);
  useRealTimeUpdates(address);

  // Handle NFT approval success
  useEffect(() => {
    if (isConfirmed && hash) {
      console.log("NFT approval successful! Transaction hash:", hash);
      // toast.success("NFT approval successful! You can now deposit your NFTs.");
    }
  }, [isConfirmed, hash]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      console.error("Transaction failed:", error.message);
      // toast.error(`Transaction failed: ${error.message}`);
    }
  }, [error]);

  return (
    <div className="bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold silk-gradient-text">
                Dashboard
              </h1>
              <Badge className="silk-gradient text-white border-0">
                Phase 1C.1
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="silk-border">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
        {/* Transaction Status */}
        {(isPending || isConfirming || isConfirmed || error) && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 min-h-0">
                {isPending && (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-800">
                      Transaction pending...
                    </span>
                  </>
                )}
                {isConfirming && (
                  <>
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-yellow-800">
                      Confirming transaction...
                    </span>
                  </>
                )}
                {isConfirmed && (
                  <>
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-green-800">
                      Transaction confirmed!
                    </span>
                  </>
                )}
                {error && (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <div className="text-red-800 break-words overflow-hidden">
                      <span className="font-medium">Error:</span>
                      <div className="text-sm mt-1 break-all">
                        {error.message}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                      You're connected to {chain?.name || "Unknown Network"}{" "}
                      (Chain ID: {chainId}). Please switch to Bitkub Testnet
                      (Chain ID: 25925) to use this application.
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

        {/* Stats Overview */}
        {!isConnected ? (
          <Card className="border-amber-200 bg-amber-50 mb-8">
            <CardContent className="flex items-center gap-4 pt-6">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800">
                  Wallet Not Connected
                </h3>
                <p className="text-sm text-amber-700">
                  Please connect your wallet to access the dashboard features.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Earnings
                </CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold silk-gradient-text">
                  {dashboardLoading
                    ? "Loading..."
                    : `${formatEther(totalEarnings)} KUB`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total earnings from mining
                </p>
              </CardContent>
            </Card>

            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Miners
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? "..." : activeMiners}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active miners
                </p>
              </CardContent>
            </Card>

            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Wallet Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balance
                    ? `${parseFloat(balance.formatted).toFixed(4)} ${
                        balance.symbol
                      }`
                    : "0.0000 KUB"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </CardContent>
            </Card>

            <Card className="silk-hover silk-shadow border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mounted ? (
                    chainId === bitkubTestnet.id ? "Bitkub Testnet" : 
                    chain?.name || "Unknown Network"
                  ) : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Chain ID: {mounted ? chainId || "N/A" : "..."}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mining Status */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="mining" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mining">Mining Status</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="mining" className="space-y-6">
                <Card className="silk-shadow border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 silk-gradient-text" />
                      Active Mining Operations
                    </CardTitle>
                    <CardDescription>
                      Monitor your automated mining processes in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mining Operation 1 */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">NFT Miner #001</p>
                          <p className="text-sm text-muted-foreground">
                            Dragon Collection
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">12.34 KUB/day</p>
                        <p className="text-sm text-muted-foreground">
                          Running 2h 34m
                        </p>
                      </div>
                    </div>

                    {/* Mining Operation 2 */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">NFT Miner #002</p>
                          <p className="text-sm text-muted-foreground">
                            Phoenix Collection
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">8.76 KUB/day</p>
                        <p className="text-sm text-muted-foreground">
                          Running 5h 12m
                        </p>
                      </div>
                    </div>

                    {/* Mining Operation 3 */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">NFT Miner #003</p>
                          <p className="text-sm text-muted-foreground">
                            Crystal Collection
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">15.23 KUB/day</p>
                        <p className="text-sm text-muted-foreground">
                          Optimizing...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card className="silk-shadow border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Performance Analytics
                    </CardTitle>
                    <CardDescription>
                      Detailed insights into your mining performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>
                          Analytics charts will be implemented in Phase 1C.2
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card className="silk-shadow border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Mining History
                    </CardTitle>
                    <CardDescription>
                      Track your past mining activities and rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-card/30">
                        <div>
                          <p className="font-medium">
                            Mining Session Completed
                          </p>
                          <p className="text-sm text-muted-foreground">
                            2 hours ago
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500">
                            +24.56 KUB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-card/30">
                        <div>
                          <p className="font-medium">Reward Claimed</p>
                          <p className="text-sm text-muted-foreground">
                            6 hours ago
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500">
                            +18.34 KUB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-card/30">
                        <div>
                          <p className="font-medium">NFT Staked</p>
                          <p className="text-sm text-muted-foreground">
                            1 day ago
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-500">
                            Dragon #1234
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mining Status */}
            <Card className="silk-shadow border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Mining Status
                </CardTitle>
                <CardDescription>
                  Current mining operations and NFT status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Loading mining status...
                    </p>
                  </div>
                ) : !isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Connect wallet to view mining status
                    </p>
                  </div>
                ) : userInfo?.tokenIds && userInfo.tokenIds.length > 0 ? (
                  <div className="space-y-3">
                    {userInfo.tokenIds.map((tokenId, index) => {
                      const colors = [
                        "from-purple-500 to-pink-500",
                        "from-blue-500 to-cyan-500",
                        "from-green-500 to-emerald-500",
                        "from-orange-500 to-red-500",
                        "from-indigo-500 to-purple-500",
                      ];
                      const colorClass = colors[index % colors.length];

                      return (
                        <div
                          key={tokenId.toString()}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                            >
                              #{tokenId.toString().padStart(3, "0")}
                            </div>
                            <div>
                              <p className="font-medium">
                                NFT Miner #{tokenId.toString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Staked & Mining
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              userInfo.isActive ? "default" : "secondary"
                            }
                          >
                            {userInfo.isActive ? "Active" : "Idle"}
                          </Badge>
                        </div>
                      );
                    })}

                    <div className="border-t pt-4" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Total Hash Power</p>
                        <p className="text-sm text-muted-foreground">
                          {userInfo.totalHashPower.toString()} HP
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={claimReward}
                          disabled={isPending || isConfirming}
                        >
                          <Coins className="h-4 w-4 mr-2" />
                          {isPending || isConfirming
                            ? "Processing..."
                            : "Claim Rewards"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No NFTs staked for mining
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      NFT Balance: {nftBalance?.toString() || "0"}
                    </p>
                    {nftBalance && nftBalance > 0 ? (
                      <div className="space-y-2">
                        {!isApprovedForAll && (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={approveNFTs}
                              disabled={isPending || isConfirming}
                            >
                              {isPending || isConfirming
                                ? "Approving..."
                                : "Approve NFTs"}
                            </Button>
                            {isConfirmed && (
                              <p className="text-xs text-green-600">
                                ✓ NFT approval successful! You can now deposit
                                your NFTs.
                              </p>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Stake your DigDragon NFTs to start mining
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        You need DigDragon NFTs to start mining
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallet Status */}
            <Card className="silk-shadow border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Wallet Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isConnected ? (
                  <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="font-medium mb-2">Wallet Not Connected</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your wallet to start mining
                    </p>
                    <Button className="silk-gradient text-white border-0 w-full">
                      Connect Wallet
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="font-medium mb-2">Wallet Connected</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Network: {chain?.name || "Unknown"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="silk-shadow border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isConnected ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect wallet to access actions
                    </p>
                    <Button className="w-full silk-gradient text-white border-0">
                      Connect Wallet
                    </Button>
                  </div>
                ) : (
                  <>
                    {nftBalance && nftBalance > 0 && !isApprovedForAll && (
                      <div className="space-y-2">
                        <Button
                          className="w-full silk-gradient text-white border-0"
                          onClick={approveNFTs}
                          disabled={isPending || isConfirming}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {isPending || isConfirming
                            ? "Approving..."
                            : "Approve NFTs"}
                        </Button>
                        {isConfirmed && (
                          <p className="text-xs text-green-600 text-center">
                            ✓ NFT approval successful! You can now deposit your
                            NFTs.
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full silk-gradient text-white border-0"
                      onClick={() => {
                        // For now, stake all available NFTs
                        // In a real implementation, you'd have a modal to select specific NFTs
                        if (nftBalance && nftBalance > 0) {
                          const mockTokenIds = Array.from(
                            { length: Number(nftBalance) },
                            (_, i) => BigInt(i + 1)
                          );
                          deposit(mockTokenIds);
                        }
                      }}
                      disabled={
                        !nftBalance ||
                        nftBalance === BigInt(0) ||
                        !isApprovedForAll ||
                        isPending ||
                        isConfirming
                      }
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {isPending || isConfirming ? "Staking..." : "Stake NFT"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start silk-border"
                      onClick={withdrawAllNFT}
                      disabled={
                        !userInfo?.tokenIds ||
                        userInfo.tokenIds.length === 0 ||
                        isPending ||
                        isConfirming
                      }
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {isPending || isConfirming
                        ? "Unstaking..."
                        : "Unstake NFT"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start silk-border"
                      onClick={claimReward}
                      disabled={isPending || isConfirming || !hasActiveMining}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      {isPending || isConfirming
                        ? "Processing..."
                        : "Claim Rewards"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Live Events */}
            <Card className="silk-shadow border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Live Contract Events
                </CardTitle>
                <CardDescription>
                  Real-time updates from the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Connect wallet to view events
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {userEvents.depositEvents
                      .slice(0, 3)
                      .map((event, index) => (
                        <div
                          key={`deposit-${index}`}
                          className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-200"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">NFT Deposited</p>
                            <p className="text-xs text-muted-foreground">
                              {event.tokenIds.length} NFT
                              {event.tokenIds.length > 1 ? "s" : ""} staked
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Just now
                          </div>
                        </div>
                      ))}

                    {userEvents.withdrawEvents
                      .slice(0, 3)
                      .map((event, index) => (
                        <div
                          key={`withdraw-${index}`}
                          className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-200"
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">NFT Withdrawn</p>
                            <p className="text-xs text-muted-foreground">
                              {event.tokenIds.length} NFT
                              {event.tokenIds.length > 1 ? "s" : ""} unstaked
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Just now
                          </div>
                        </div>
                      ))}

                    {userEvents.rewardEvents.slice(0, 3).map((event, index) => (
                      <div
                        key={`reward-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 border border-blue-200"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Reward Claimed</p>
                          <p className="text-xs text-muted-foreground">
                            {formatEther(event.amount)} KUB earned
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Just now
                        </div>
                      </div>
                    ))}

                    {userEvents.depositEvents.length === 0 &&
                      userEvents.withdrawEvents.length === 0 &&
                      userEvents.rewardEvents.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            No recent events
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="silk-shadow border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Connect wallet to view activity
                    </p>
                  </div>
                ) : dashboardLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading activity...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userInfo?.lastRewardClaim &&
                    userInfo.lastRewardClaim > 0 ? (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Last Reward Claim
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              Number(userInfo.lastRewardClaim) * 1000
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {userInfo?.tokenIds && userInfo.tokenIds.length > 0 ? (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {userInfo.tokenIds.length} NFT
                            {userInfo.tokenIds.length > 1 ? "s" : ""} Staked
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Currently mining with{" "}
                            {userInfo.totalHashPower.toString()} HP
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {userInfo?.isActive ? (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Mining Active</p>
                          <p className="text-xs text-muted-foreground">
                            Earning rewards continuously
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Mining Inactive</p>
                          <p className="text-xs text-muted-foreground">
                            Stake NFTs to start earning
                          </p>
                        </div>
                      </div>
                    )}

                    {(!userInfo?.tokenIds ||
                      userInfo.tokenIds.length === 0) && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          No recent mining activity
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
