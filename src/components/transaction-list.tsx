'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import type { BaseTransaction } from '@/types/receipt';
import { fetchRecentTransactions, formatTxHash, formatTimestamp, detectActionType, detectProtocol } from '@/lib/transaction-utils';
import { isMintableTransaction } from '@/lib/protocol-detector';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface TransactionListProps {
  onSelectTransaction: (tx: BaseTransaction) => void;
  onTransactionsLoaded?: (txs: BaseTransaction[]) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function TransactionList({ onSelectTransaction, onTransactionsLoaded, onLoadingChange }: TransactionListProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<BaseTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    async function loadTransactions() {
      if (!address || !publicClient) return;
      
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);
      try {
        const txs = await fetchRecentTransactions(publicClient, address, 10);
        setTransactions(txs);
        onTransactionsLoaded?.(txs);
        setError(null);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
        setError(errorMessage);
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    }

    loadTransactions();
  }, [address, publicClient, onTransactionsLoaded, onLoadingChange]);

  const handleRetry = () => {
    if (address && publicClient) {
      async function retryLoad() {
        setLoading(true);
        onLoadingChange?.(true);
        setError(null);
        try {
          const txs = await fetchRecentTransactions(publicClient, address, 10);
          setTransactions(txs);
          onTransactionsLoaded?.(txs);
          setError(null);
        } catch (err) {
          console.error('Retry failed:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
          setError(errorMessage);
        } finally {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
      retryLoad();
    }
  };

  const handleSelect = (tx: BaseTransaction) => {
    setSelectedTx(tx.hash);
    setTimeout(() => onSelectTransaction(tx), 200);
  };

  if (!address) {
    return (
      <Card className="p-12 text-center card-glow animate-fade-in">
        <div className="space-y-4">
          <div className="text-7xl opacity-20 animate-float">🔌</div>
          <div>
            <p className="text-muted-foreground text-lg font-medium">Connect your wallet</p>
            <p className="text-muted-foreground text-sm mt-2">
              View your Base transactions and create receipts
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 card-glow">
        <div className="space-y-3">
          {[1, 2, 3].map((i: number) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Fetching your Base transactions...
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center card-glow animate-fade-in">
        <div className="space-y-4">
          <div className="text-7xl opacity-20 animate-float">⚠️</div>
          <div>
            <p className="text-muted-foreground text-lg font-medium">Unable to load transactions</p>
            <p className="text-muted-foreground text-sm mt-2">
              Please check your connection and try again
            </p>
          </div>
          <Button 
            onClick={handleRetry}
            className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 button-glow"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-12 text-center card-glow animate-fade-in">
        <div className="space-y-4">
          <div className="text-7xl opacity-20 animate-float">📭</div>
          <div>
            <p className="text-muted-foreground text-lg font-medium">No transactions found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Make a transaction on Base to get started
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);
  const hasMoreTransactions = transactions.length > 5;

  return (
    <div className="space-y-3">
      {displayedTransactions.map((tx: BaseTransaction, index: number) => {
        const actionType = detectActionType(tx);
        const protocol = detectProtocol(tx);
        const isMintable = isMintableTransaction(actionType);
        const isSelected = selectedTx === tx.hash;
        
        return (
          <Card
            key={tx.hash}
            className={`group p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fade-in ${
              isSelected 
                ? 'ring-2 ring-primary bg-accent/50 card-glow scale-[1.02]' 
                : 'hover:shadow-xl hover:card-glow'
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => handleSelect(tx)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg shadow-sm ${
                    actionType === 'swap' ? 'bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white' :
                    actionType === 'bridge' ? 'bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 text-white' :
                    actionType === 'mint' ? 'bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 text-white' :
                    actionType === 'send' ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white' :
                    actionType === 'contract' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white' :
                    'bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white'
                  }`}>
                    {actionType}
                  </span>
                  {isMintable && (
                    <span className="text-xs font-medium px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-800">
                      ✓ Mintable
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1 truncate">
                  {protocol}
                </p>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {formatTxHash(tx.hash)}
                </p>
              </div>
              <Button
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`rounded-xl font-bold transition-all duration-300 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 button-glow shadow-lg' 
                    : 'hover:border-primary hover:text-primary group-hover:translate-x-1'
                }`}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleSelect(tx);
                }}
              >
                {isSelected ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Select
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </div>
          </Card>
        );
      })}
      
      {hasMoreTransactions && (
        <Button
          onClick={() => setShowAll(!showAll)}
          variant="outline"
          className="w-full group relative overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-300 py-6 hover:shadow-lg hover:scale-[1.01]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center gap-2">
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1" />
                <span className="font-semibold">Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
                <span className="font-semibold">
                  View All Transactions <span className="text-primary">({transactions.length})</span>
                </span>
              </>
            )}
          </div>
        </Button>
      )}
    </div>
  );
}
