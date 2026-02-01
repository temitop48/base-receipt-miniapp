'use client';

import { formatEther } from 'viem';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  Activity, 
  Coins, 
  Calendar, 
  Target, 
  GitBranch,
  ArrowDownToLine 
} from 'lucide-react';

export interface WalletStats {
  balance: string;
  volume: string;
  nativeTxs: number;
  tokenTxs: number;
  walletAge: number;
  firstTransactionDate: string;
  uniqueActiveDays: number;
  uniqueActiveWeeks: number;
  uniqueActiveMonths: number;
  totalContractInteractions: number;
  uniqueContractInteractions: number;
  depositedAmount: string;
  nativeBridgeUsed: string[];
  totalTransactions: number;
}

interface WalletStatsDisplayProps {
  stats: WalletStats | null;
  loading: boolean;
  error: string | null;
  walletAddress: string | null;
  isConnectedWallet: boolean;
}

export function WalletStatsDisplay({ 
  stats, 
  loading, 
  error, 
  walletAddress,
  isConnectedWallet 
}: WalletStatsDisplayProps) {
  if (loading) {
    return (
      <Card className="p-6 glass-panel animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-pulse" />
            <h3 className="text-xl font-bold">Wallet Analytics</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i: number) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse shimmer" 
                   style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 glass-panel animate-fade-in">
        <div className="text-center space-y-2">
          <div className="text-5xl opacity-20">⚠️</div>
          <p className="text-muted-foreground font-medium">{error}</p>
        </div>
      </Card>
    );
  }

  if (!stats || !walletAddress) {
    return (
      <Card className="p-8 glass-panel animate-fade-in text-center">
        <div className="space-y-4">
          <div className="text-6xl opacity-20 animate-float">📊</div>
          <div>
            <p className="text-muted-foreground text-lg font-medium">
              {isConnectedWallet 
                ? 'Connect your wallet to view analytics' 
                : 'Enter a wallet address to view analytics'}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Comprehensive onchain interaction statistics
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const formatValue = (value: string): string => {
    try {
      const eth = formatEther(BigInt(value));
      const num = parseFloat(eth);
      if (num === 0) return '0 ETH';
      if (num < 0.0001) return '< 0.0001 ETH';
      if (num < 1) return `${num.toFixed(4)} ETH`;
      return `${num.toFixed(2)} ETH`;
    } catch {
      return '0 ETH';
    }
  };

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="p-6 glass-panel animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h3 className="text-xl font-bold">Wallet Analytics</h3>
            </div>
            <p className="text-sm font-mono text-muted-foreground break-all">
              {walletAddress}
            </p>
          </div>
          {isConnectedWallet ? (
            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              External Wallet
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Balance */}
          <StatCard
            icon={<Wallet className="w-4 h-4" />}
            label="Balance"
            value={formatValue(stats.balance)}
            variant="blue"
          />

          {/* Volume */}
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Total Volume"
            value={formatValue(stats.volume)}
            variant="purple"
          />

          {/* Native TXs */}
          <StatCard
            icon={<Activity className="w-4 h-4" />}
            label="Native TXs"
            value={stats.nativeTxs.toLocaleString()}
            variant="teal"
          />

          {/* Token TXs */}
          <StatCard
            icon={<Coins className="w-4 h-4" />}
            label="Token TXs"
            value={stats.tokenTxs.toLocaleString()}
            variant="pink"
          />

          {/* Wallet Age */}
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label="Wallet Age"
            value={`${stats.walletAge} days`}
            variant="orange"
          />

          {/* Active Days */}
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="Active Days"
            value={stats.uniqueActiveDays.toLocaleString()}
            variant="blue"
          />

          {/* Active Weeks */}
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="Active Weeks"
            value={stats.uniqueActiveWeeks.toLocaleString()}
            variant="purple"
          />

          {/* Active Months */}
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="Active Months"
            value={stats.uniqueActiveMonths.toLocaleString()}
            variant="teal"
          />

          {/* Total Contract Interactions */}
          <StatCard
            icon={<GitBranch className="w-4 h-4" />}
            label="Total Interactions"
            value={stats.totalContractInteractions.toLocaleString()}
            variant="pink"
          />

          {/* Unique Contracts */}
          <StatCard
            icon={<GitBranch className="w-4 h-4" />}
            label="Unique Contracts"
            value={stats.uniqueContractInteractions.toLocaleString()}
            variant="orange"
          />

          {/* Deposited Amount */}
          <StatCard
            icon={<ArrowDownToLine className="w-4 h-4" />}
            label="Deposited"
            value={formatValue(stats.depositedAmount)}
            variant="blue"
          />

          {/* Total Transactions */}
          <StatCard
            icon={<Activity className="w-4 h-4" />}
            label="Total TXs"
            value={stats.totalTransactions.toLocaleString()}
            variant="purple"
          />
        </div>

        {/* Bridges Used */}
        {stats.nativeBridgeUsed.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Native Bridges Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.nativeBridgeUsed.map((bridge: string, index: number) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="text-xs"
                >
                  {bridge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* First Transaction */}
        {stats.firstTransactionDate !== 'N/A' && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              First transaction: {new Date(stats.firstTransactionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant: 'blue' | 'purple' | 'teal' | 'pink' | 'orange';
}

function StatCard({ icon, label, value, variant }: StatCardProps) {
  const variantStyles: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    teal: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900',
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {label}
        </p>
      </div>
      <p className="text-lg font-bold truncate" title={value}>
        {value}
      </p>
    </div>
  );
}
