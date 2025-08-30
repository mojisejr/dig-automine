'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Zap, Users, TrendingUp } from 'lucide-react';

// Loading skeleton for dashboard analytics
function DashboardAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Analytics Overview Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg bg-card/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Contract Analytics Skeleton */}
      <div className="border rounded-lg p-4 bg-card/30">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 mr-2" />
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="silk-shadow border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="h-5 w-5 bg-muted animate-pulse rounded mr-2" />
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Error fallback for dashboard analytics
function DashboardAnalyticsError() {
  return (
    <Card className="silk-shadow border-border/50">
      <CardContent className="text-center py-8">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-semibold mb-2 text-destructive">Analytics Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load analytics data. Please check your connection and try again.
        </p>
      </CardContent>
    </Card>
  );
}

// Props interface for dashboard analytics
export interface DashboardAnalyticsProps {
  userInfo?: {
    totalHashPower: bigint;
    tokenIds: bigint[];
    lastRewardClaim: bigint;
    isActive: boolean;
  };
  contractStats?: {
    totalTokens: bigint;
    activeUsers: bigint;
    current: string;
    target: string;
  };
  isLoading?: boolean;
  className?: string;
}

// Create a wrapper component for the analytics content
function DashboardAnalyticsInner({ 
  userInfo, 
  contractStats, 
  isLoading = false,
  className = '' 
}: DashboardAnalyticsProps) {
  // Show loading skeleton when data is loading
  if (isLoading) {
    return <DashboardAnalyticsSkeleton />;
  }

  // Show wallet connection prompt when no user data
  if (!userInfo) {
    return (
      <Card className="silk-shadow border-border/50">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Analytics Unavailable</h3>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to view detailed analytics and performance metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`dashboard-analytics ${className}`}>
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg bg-card/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Hash Power
              </p>
              <p className="text-2xl font-bold">
                {userInfo.totalHashPower?.toString() || "0"}
              </p>
            </div>
            <Zap className="h-8 w-8 event-info-icon" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active NFTs
              </p>
              <p className="text-2xl font-bold">
                {userInfo.tokenIds?.length || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 event-success-icon" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Mining Status
              </p>
              <p className="text-2xl font-bold">
                {userInfo.isActive ? "Active" : "Idle"}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 event-warning-icon" />
          </div>
        </div>
      </div>

      {/* Contract Analytics */}
      {contractStats && (
        <div className="border rounded-lg p-4 bg-card/30">
          <h3 className="font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Network Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total Staked NFTs
              </span>
              <span className="font-medium">
                {contractStats.totalTokens.toString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Active Users
              </span>
              <span className="font-medium">
                {contractStats.activeUsers.toString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Current Mine
              </span>
              <span className="font-medium text-xs">
                {contractStats.current.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Target Mine
              </span>
              <span className="font-medium text-xs">
                {contractStats.target.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dynamic import of the analytics component
const DashboardAnalyticsComponent = dynamic(
  () => Promise.resolve({ default: DashboardAnalyticsInner }),
  {
    loading: () => <DashboardAnalyticsSkeleton />,
    ssr: false, // Disable SSR to prevent hydration issues with real-time data
  }
) as ComponentType<DashboardAnalyticsProps>;

// Main dashboard analytics component
export function DashboardAnalytics(props: DashboardAnalyticsProps) {
  return (
    <div className="dashboard-analytics-wrapper">
      <DashboardAnalyticsComponent {...props} />
    </div>
  );
}

export default DashboardAnalytics;