"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle } from "lucide-react";

// Loading component for wallet connection
function WalletConnectionSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
    </div>
  );
}

// Error fallback component
function WalletConnectionError() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="destructive" className="text-xs">
        <AlertCircle className="h-3 w-3 mr-1" />
        Wallet Error
      </Badge>
    </div>
  );
}

// Dynamic import of the actual wallet connection component
const WalletConnectionComponent = dynamic(
  () =>
    import("@/components/dynamic/WalletConnectionInner").then((mod) => ({
      default: mod.WalletConnectionInner,
    })),
  {
    loading: () => <WalletConnectionSkeleton />,
    ssr: false, // Disable SSR for wallet connection to prevent hydration issues
  }
) as ComponentType<WalletConnectionProps>;

// Props interface for wallet connection
export interface WalletConnectionProps {
  className?: string;
  showBalance?: boolean;
  compact?: boolean;
}

// Main wallet connection component with error boundary
export function WalletConnection(props: WalletConnectionProps) {
  return (
    <div className="wallet-connection-wrapper">
      <WalletConnectionComponent {...props} />
    </div>
  );
}

export default WalletConnection;
