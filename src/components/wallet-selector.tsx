'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import type { Connector } from 'wagmi';

const activeChainId = process.env.NEXT_PUBLIC_SDK_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_SDK_CHAIN_ID)
  : base.id;

const targetChain = activeChainId === baseSepolia.id ? baseSepolia : base;

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  connector: Connector;
}

export function WalletSelector() {
  const { address, isConnected, chain, connector: currentConnector } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showModal, setShowModal] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // Check if on wrong network
  useEffect(() => {
    if (isConnected && chain && chain.id !== targetChain.id) {
      setShowNetworkError(true);
    } else {
      setShowNetworkError(false);
    }
  }, [isConnected, chain]);

  const getWalletIcon = (connectorName: string): string => {
    const lowerName = connectorName.toLowerCase();
    if (lowerName.includes('coinbase')) return '🔵';
    if (lowerName.includes('metamask')) return '🦊';
    if (lowerName.includes('rabby')) return '🐰';
    if (lowerName.includes('okx')) return '⭕';
    if (lowerName.includes('zerion')) return '🔷';
    return '👛';
  };

  const getWalletOptions = (): WalletOption[] => {
    return connectors.map((connector: Connector) => ({
      id: connector.id,
      name: connector.name,
      icon: getWalletIcon(connector.name),
      connector,
    }));
  };

  const handleConnect = async (connector: Connector) => {
    try {
      setConnectingWallet(connector.id);
      await connect({ connector, chainId: targetChain.id });
      setShowModal(false);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: targetChain.id });
      setShowNetworkError(false);
    } catch (error) {
      console.error('Network switch failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowNetworkError(false);
  };

  const shortenAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-all button-glow"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-md border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Connect Wallet</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Choose your preferred wallet to connect to Base Receipts
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 mt-4">
              {getWalletOptions().map((wallet: WalletOption) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.connector)}
                  disabled={isPending || connectingWallet === wallet.id}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="text-3xl">{wallet.icon}</span>
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{wallet.name}</span>
                  {connectingWallet === wallet.id && (
                    <span className="ml-auto text-sm text-primary font-medium">Connecting...</span>
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By connecting, you agree to Base Receipts terms
            </p>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Connected - show wallet info with dropdown
  return (
    <div className="flex items-center gap-2">
      {/* Network Error Alert */}
      {showNetworkError && (
        <Card className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <span className="text-sm text-amber-900 dark:text-amber-400 font-medium">Wrong network</span>
          <Button
            onClick={handleSwitchNetwork}
            size="sm"
            className="ml-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-lg"
          >
            Switch to {targetChain.name}
          </Button>
        </Card>
      )}

      {/* Connected Wallet Dropdown */}
      {!showNetworkError && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-card border-border hover:bg-accent px-4 py-2 rounded-xl font-semibold transition-all"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-mono">{address && shortenAddress(address)}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 border-border">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Connected with</p>
              <p className="text-sm font-semibold flex items-center gap-2">
                {currentConnector && (
                  <>
                    <span>{getWalletIcon(currentConnector.name)}</span>
                    <span>{currentConnector.name}</span>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {address && shortenAddress(address)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <CheckCircle className="w-3 h-3" />
                {chain?.name || 'Connected'}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setShowModal(true)}
              className="cursor-pointer"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Switch Wallet
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleDisconnect}
              className="cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Switch Wallet Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Switch Wallet</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Connect with a different wallet provider
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {getWalletOptions().map((wallet: WalletOption) => {
              const isCurrentWallet = currentConnector?.id === wallet.id;
              
              return (
                <button
                  key={wallet.id}
                  onClick={() => {
                    if (!isCurrentWallet) {
                      handleDisconnect();
                      setTimeout(() => handleConnect(wallet.connector), 100);
                    }
                  }}
                  disabled={isPending || connectingWallet === wallet.id || isCurrentWallet}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    isCurrentWallet
                      ? 'border-primary bg-accent cursor-default'
                      : 'border-border hover:border-primary hover:bg-accent cursor-pointer'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-3xl">{wallet.icon}</span>
                  <span className="font-semibold text-foreground">{wallet.name}</span>
                  {isCurrentWallet && (
                    <span className="ml-auto text-sm text-primary flex items-center gap-1 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </span>
                  )}
                  {connectingWallet === wallet.id && (
                    <span className="ml-auto text-sm text-primary font-medium">Connecting...</span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
