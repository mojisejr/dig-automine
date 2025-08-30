'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { useMounted } from '@/hooks/useMounted';
import { injected } from 'wagmi/connectors';
import { bitkubTestnet } from 'wagmi/chains';
import { WalletConnectionProps } from './WalletConnection';

export function WalletConnectionInner({ 
  className = '',
  showBalance = false,
  compact = false 
}: WalletConnectionProps) {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  
  const isWrongNetwork = isConnected && chainId !== bitkubTestnet.id;

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: bitkubTestnet.id });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        onClick={handleConnect}
        className={`silk-gradient text-white border-0 ${className}`}
        size={compact ? 'sm' : 'default'}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {compact ? 'Connect' : 'Connect Wallet'}
      </Button>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="destructive" className="text-xs">
          Wrong Network
        </Badge>
        <Button
          onClick={handleSwitchNetwork}
          variant="outline"
          size={compact ? 'sm' : 'default'}
        >
          Switch Network
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-sm text-muted-foreground">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      <Button
        onClick={handleDisconnect}
        variant="outline"
        size={compact ? 'sm' : 'default'}
      >
        Disconnect
      </Button>
    </div>
  );
}