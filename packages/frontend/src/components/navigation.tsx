"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, LayoutDashboard, Wallet, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { useMounted } from "@/hooks/useMounted";
import { injected } from "wagmi/connectors";
import { bitkubTestnet } from "wagmi/chains";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mounted = useMounted();
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  
  // Check if user is on wrong network
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

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
  ];

  return (
    <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 silk-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AM</span>
            </div>
            <span className="font-bold text-xl silk-gradient-text">
              AutoMine
            </span>
            <Badge className="silk-gradient text-white border-0 text-xs">
              v1C.1
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "silk-gradient text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && isConnected ? (
              <div className="flex items-center gap-2">
                {isWrongNetwork ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      Wrong Network
                    </Badge>
                    <Button
                      onClick={handleSwitchNetwork}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                    >
                      Switch to Testnet
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-silk-600">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                      {chain?.name || 'Testnet'}
                    </Badge>
                  </>
                )}
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  size="sm"
                  className="border-silk-600 text-silk-600 hover:bg-silk-50"
                >
                  Disconnect
                </Button>
              </div>
            ) : mounted ? (
              <Button
                onClick={handleConnect}
                className="silk-gradient text-white border-0"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="w-32 h-9 bg-muted animate-pulse rounded-md" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors w-full ${
                      isActive
                        ? "silk-gradient text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-border/50">
                {mounted && isConnected ? (
                  <div className="space-y-2">
                    <div className="text-sm text-silk-600 text-center">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                    {isWrongNetwork ? (
                      <div className="space-y-2">
                        <Badge variant="destructive" className="w-full justify-center text-xs">
                          Wrong Network - Please Switch
                        </Badge>
                        <Button
                          onClick={handleSwitchNetwork}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                        >
                          Switch to Bitkub Testnet
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className="w-full justify-center text-xs border-green-500 text-green-600">
                        Connected to {chain?.name || 'Testnet'}
                      </Badge>
                    )}
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full border-silk-600 text-silk-600 hover:bg-silk-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : mounted ? (
                  <Button
                    onClick={handleConnect}
                    className="silk-gradient text-white border-0 w-full"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="w-full h-9 bg-muted animate-pulse rounded-md" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
