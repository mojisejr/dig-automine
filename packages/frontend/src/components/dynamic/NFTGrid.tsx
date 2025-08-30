'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

// Loading skeleton for NFT grid
function NFTGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Card Skeleton */}
      <Card className="silk-shadow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="h-8 w-16 bg-muted animate-pulse rounded mx-auto mb-2" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded mx-auto" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>

      {/* NFT Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="silk-shadow border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted animate-pulse rounded-lg" />
                  <div>
                    <div className="h-5 w-24 bg-muted animate-pulse rounded mb-1" />
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                <div className="h-9 w-24 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Error fallback for NFT grid
function NFTGridError() {
  return (
    <Card className="silk-shadow border-border/50">
      <CardContent className="text-center py-8">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-semibold mb-2 text-destructive">Failed to Load NFTs</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading your NFT data. Please refresh the page.
        </p>
      </CardContent>
    </Card>
  );
}

// Dynamic import of the actual NFT grid component
const NFTGridComponent = dynamic(
  () => import('../NFTMinerCard').then(mod => ({ default: mod.StakedNFTsGrid })),
  {
    loading: () => <NFTGridSkeleton />,
    ssr: false, // Disable SSR to prevent hydration issues with dynamic NFT data
  }
) as ComponentType<any>;

// Props interface for NFT grid
export interface NFTGridProps {
  tokenIds: bigint[];
  totalHashPower: bigint;
  isActive: boolean;
  lastRewardClaim?: bigint;
  onUnstakeAll?: () => void;
  onClaimRewards?: () => void;
  isLoading?: boolean;
}

// Main NFT grid component with error boundary
export function NFTGrid(props: NFTGridProps) {
  return (
    <div className="nft-grid-wrapper">
      <NFTGridComponent {...props} />
    </div>
  );
}

export default NFTGrid;