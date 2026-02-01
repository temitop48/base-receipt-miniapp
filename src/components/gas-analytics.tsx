'use client';

import { useMemo } from 'react';
import type { BaseTransaction } from '@/types/receipt';
import { Card } from './ui/card';
import { Fuel, TrendingUp, Hash, Zap } from 'lucide-react';
import { formatEther } from 'viem';

interface GasAnalyticsProps {
  transactions: BaseTransaction[];
  loading?: boolean;
}

export function GasAnalytics({ transactions, loading = false }: GasAnalyticsProps) {
  const stats = useMemo(() => {
    if (transactions.length === 0) {
      return {
        totalGasSpentWei: BigInt(0),
        totalGasSpentEth: '0',
        avgGasSpentEth: '0',
        transactionCount: 0,
        highestGasTx: null as BaseTransaction | null,
      };
    }

    // Calculate total gas spent
    let totalGasSpentWei = BigInt(0);
    let highestGas = BigInt(0);
    let highestGasTx: BaseTransaction | null = null;

    for (const tx of transactions) {
      const txGasCost = tx.gasUsed * tx.gasPrice;
      totalGasSpentWei += txGasCost;

      if (txGasCost > highestGas) {
        highestGas = txGasCost;
        highestGasTx = tx;
      }
    }

    // Convert to ETH
    const totalGasSpentEth = formatEther(totalGasSpentWei);
    const avgGasSpentWei = totalGasSpentWei / BigInt(transactions.length);
    const avgGasSpentEth = formatEther(avgGasSpentWei);

    return {
      totalGasSpentWei,
      totalGasSpentEth,
      avgGasSpentEth,
      transactionCount: transactions.length,
      highestGasTx,
    };
  }, [transactions]);

  // Format ETH value for display (show more decimals for small amounts)
  const formatEthDisplay = (ethString: string): string => {
    const num = parseFloat(ethString);
    if (num === 0) return '0';
    if (num < 0.0001) return num.toFixed(6);
    if (num < 0.01) return num.toFixed(4);
    return num.toFixed(4);
  };

  if (loading) {
    return (
      <Card className="p-6 card-glow">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center shadow-lg">
              <Fuel className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Gas Analytics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i: number) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse shimmer" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (stats.transactionCount === 0) {
    return (
      <Card className="p-6 card-glow animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center shadow-lg">
            <Fuel className="w-5 h-5 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Gas Analytics</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          No transaction data available yet
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 card-glow animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center shadow-lg">
          <Fuel className="w-5 h-5 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Gas Analytics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Gas Spent */}
        <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 border border-primary/20 dark:border-primary/30">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-primary/80 dark:text-primary/90 mb-1 uppercase tracking-wide">
                Total Gas Spent
              </p>
              <p className="text-2xl font-bold text-primary dark:text-primary/95">
                {formatEthDisplay(stats.totalGasSpentEth)} ETH
              </p>
              <p className="text-xs text-primary/70 dark:text-primary/80 mt-1">
                Across {stats.transactionCount} transaction{stats.transactionCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary dark:text-primary/90" />
            </div>
          </div>
        </div>

        {/* Average Gas */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-chart-2/5 to-chart-2/10 dark:from-chart-2/10 dark:to-chart-2/15 border border-chart-2/20 dark:border-chart-2/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-chart-2/10 dark:bg-chart-2/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-chart-2 dark:text-chart-2/90" />
            </div>
            <p className="text-xs font-medium text-chart-2/80 dark:text-chart-2/90 uppercase tracking-wide">
              Avg Gas
            </p>
          </div>
          <p className="text-lg font-bold text-chart-2 dark:text-chart-2/95">
            {formatEthDisplay(stats.avgGasSpentEth)}
          </p>
          <p className="text-xs text-chart-2/70 dark:text-chart-2/80 mt-0.5">ETH per tx</p>
        </div>

        {/* Transaction Count */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-chart-3/5 to-chart-3/10 dark:from-chart-3/10 dark:to-chart-3/15 border border-chart-3/20 dark:border-chart-3/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-chart-3/10 dark:bg-chart-3/20 flex items-center justify-center">
              <Hash className="w-4 h-4 text-chart-3 dark:text-chart-3/90" />
            </div>
            <p className="text-xs font-medium text-chart-3/80 dark:text-chart-3/90 uppercase tracking-wide">
              Transactions
            </p>
          </div>
          <p className="text-lg font-bold text-chart-3 dark:text-chart-3/95">
            {stats.transactionCount}
          </p>
          <p className="text-xs text-chart-3/70 dark:text-chart-3/80 mt-0.5">On Base</p>
        </div>
      </div>

      {/* Highest Gas Transaction */}
      {stats.highestGasTx && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-chart-4/5 to-chart-4/10 dark:from-chart-4/10 dark:to-chart-4/15 border border-chart-4/20 dark:border-chart-4/30">
          <p className="text-xs font-medium text-chart-4/80 dark:text-chart-4/90 mb-2 uppercase tracking-wide">
            Highest Gas Transaction
          </p>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-chart-4 dark:text-chart-4/95 truncate">
                {stats.highestGasTx.hash.slice(0, 10)}...{stats.highestGasTx.hash.slice(-8)}
              </p>
              <p className="text-xs text-chart-4/70 dark:text-chart-4/80 mt-1">
                {formatEthDisplay(formatEther(stats.highestGasTx.gasUsed * stats.highestGasTx.gasPrice))} ETH
              </p>
            </div>
            <a
              href={`https://basescan.org/tx/${stats.highestGasTx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-chart-4/80 dark:text-chart-4/90 hover:text-chart-4 dark:hover:text-chart-4 font-medium underline underline-offset-2"
            >
              View
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}
