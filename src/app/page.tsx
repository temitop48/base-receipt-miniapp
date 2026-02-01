'use client'
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { BaseTransaction } from '@/types/receipt';
import type { Receipt, ReceiptTag } from '@/types/receipt';
import { WalletConnect } from '@/components/wallet-connect';
import { TransactionList } from '@/components/transaction-list';
import { ReceiptCard } from '@/components/receipt-card';
import { ReceiptCustomizer } from '@/components/receipt-customizer';
import { ReceiptMinter } from '@/components/receipt-minter';
import { ThemeToggle } from '@/components/theme-toggle';
import { SeasonalThemeToggle } from '@/components/seasonal-theme-toggle';
import { GasAnalytics } from '@/components/gas-analytics';
import { BackgroundQuote } from '@/components/background-quote';
import { GasMilestoneToast } from '@/components/gas-milestone-toast';
import { WalletSearch } from '@/components/wallet-search';
import { WalletStatsDisplay } from '@/components/wallet-stats-display';
import { detectActionType, detectProtocol } from '@/lib/transaction-utils';
import { calculateTotalGasSpent, checkNewMilestone } from '@/lib/gas-milestones';
import type { GasMilestone } from '@/lib/gas-milestones';
import { useWalletStats } from '@/hooks/use-wallet-stats';
import { Card } from '@/components/ui/card';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";
import { ChevronLeft } from 'lucide-react';

type Step = 'select' | 'customize' | 'mint';

export default function HomePage() {
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth(isInFarcaster)
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (document.readyState !== 'complete') {
            await new Promise<void>(resolve => {
              if (document.readyState === 'complete') {
                resolve()
              } else {
                window.addEventListener('load', () => resolve(), { once: true })
              }

            })
          }

    

          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully - app fully loaded')
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error)
          
          setTimeout(async () => {
            try {
              await sdk.actions.ready()
              console.log('Farcaster SDK initialized on retry')
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError)
            }

          }, 1000)
        }

      }

    

      initializeFarcaster()
    }, [])
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [selectedTx, setSelectedTx] = useState<BaseTransaction | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [transactions, setTransactions] = useState<BaseTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);
  const [currentMilestone, setCurrentMilestone] = useState<GasMilestone | null>(null);
  
  // Wallet analytics state
  const [searchedWallet, setSearchedWallet] = useState<string | null>(null);
  const { stats, loading: statsLoading, error: statsError, fetchStats, clearStats } = useWalletStats();

  // Check for new milestones when transactions are loaded
  useEffect(() => {
    if (transactions.length > 0 && !loadingTransactions) {
      const totalGasSpent = calculateTotalGasSpent(transactions);
      const newMilestone = checkNewMilestone(totalGasSpent);
      
      if (newMilestone) {
        setCurrentMilestone(newMilestone);
      }
    }
  }, [transactions, loadingTransactions]);

  // Fetch stats for connected wallet automatically
  useEffect(() => {
    if (address && !searchedWallet) {
      fetchStats(address);
    }
  }, [address, searchedWallet, fetchStats]);

  const handleWalletSearch = (walletAddress: string) => {
    setSearchedWallet(walletAddress);
    fetchStats(walletAddress);
  };

  const handleClearSearch = () => {
    setSearchedWallet(null);
    clearStats();
    if (address) {
      fetchStats(address);
    }
  };

  const handleSelectTransaction = (tx: BaseTransaction) => {
    setSelectedTx(tx);
    setTimeout(() => setCurrentStep('customize'), 150);
  };

  const handleCustomize = (note: string, tag: ReceiptTag) => {
    if (!selectedTx) return;

    const newReceipt: Receipt = {
      txHash: selectedTx.hash,
      actionType: detectActionType(selectedTx),
      protocol: detectProtocol(selectedTx),
      timestamp: selectedTx.timestamp,
      blockNumber: selectedTx.blockNumber,
      userNote: note,
      tag: tag,
      chain: 'Base',
      gasUsed: selectedTx.gasUsed,
      gasPrice: selectedTx.gasPrice,
    };

    setReceipt(newReceipt);
    setTimeout(() => setCurrentStep('mint'), 150);
  };

  const handleReset = () => {
    setCurrentStep('select');
    setSelectedTx(null);
    setReceipt(null);
  };

  const handleBackToSelect = () => {
    setCurrentStep('select');
    setSelectedTx(null);
  };

  const handleBackToCustomize = () => {
    setCurrentStep('customize');
  };

  return (
    <div className="min-h-screen base-bg transition-colors duration-300 relative">
      {/* Frosted glass background layers */}
      <div className="fixed inset-0 frosted-layer-1 pointer-events-none" />
      <div className="fixed inset-0 frosted-layer-2 pointer-events-none" />
      
      {/* Anime-inspired background quote */}
      <BackgroundQuote />
      
      {/* Gas Milestone Toast - Quietly celebratory */}
      <GasMilestoneToast
        milestone={currentMilestone}
        onDismiss={() => setCurrentMilestone(null)}
      />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl pt-20 sm:pt-16 relative z-10">
        <header className="mb-8 sm:mb-12 glass-header rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="float-animation w-full sm:w-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 bg-clip-text text-transparent mb-2">
                Base Receipts
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                Transform your Base transactions into beautiful, shareable NFTs ✨
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <SeasonalThemeToggle />
              <ThemeToggle />
              <WalletConnect />
            </div>
          </div>
          
          {/* Enhanced Step Indicator - Mobile Optimized */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
            <StepIndicator step={1} active={currentStep === 'select'} completed={currentStep !== 'select'} label="Select" />
            <div className="flex-1 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full bg-primary transition-all duration-500 ease-out ${currentStep !== 'select' ? 'w-full' : 'w-0'}`} />
            </div>
            <StepIndicator step={2} active={currentStep === 'customize'} completed={currentStep === 'mint'} label="Customize" />
            <div className="flex-1 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full bg-primary transition-all duration-500 ease-out ${currentStep === 'mint' ? 'w-full' : 'w-0'}`} />
            </div>
            <StepIndicator step={3} active={currentStep === 'mint'} completed={false} label="Mint" />
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Back button with animation - Mobile Optimized */}
            {currentStep !== 'select' && (
              <button
                onClick={currentStep === 'customize' ? handleBackToSelect : handleBackToCustomize}
                className="group flex items-center gap-2 text-primary hover:text-primary/80 text-sm sm:text-base font-semibold transition-all duration-300 hover:gap-3 min-h-[44px] -ml-2 px-2 py-2 rounded-lg hover:bg-primary/5"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to {currentStep === 'customize' ? 'transactions' : 'customize'}</span>
                <span className="sm:hidden">Back</span>
              </button>
            )}

            {currentStep === 'select' && (
              <div className="animate-fade-in space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Your Recent Transactions</h2>
                  <TransactionList 
                    onSelectTransaction={handleSelectTransaction}
                    onTransactionsLoaded={setTransactions}
                    onLoadingChange={setLoadingTransactions}
                  />
                </div>
                <div>
                  <GasAnalytics transactions={transactions} loading={loadingTransactions} />
                </div>
              </div>
            )}

            {currentStep === 'customize' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Customize Your Receipt</h2>
                <Card className="p-4 sm:p-6 glass-panel">
                  <ReceiptCustomizer onSave={handleCustomize} />
                </Card>
              </div>
            )}

            {currentStep === 'mint' && receipt && (
              <div className="animate-fade-in">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Mint Your Receipt</h2>
                <ReceiptMinter receipt={receipt} onSuccess={handleReset} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Preview</h2>
              {receipt ? (
                <ReceiptCard receipt={receipt} showShareButton={currentStep === 'mint'} />
              ) : selectedTx ? (
                <ReceiptCard
                  receipt={{
                    txHash: selectedTx.hash,
                    actionType: detectActionType(selectedTx),
                    protocol: detectProtocol(selectedTx),
                    timestamp: selectedTx.timestamp,
                    blockNumber: selectedTx.blockNumber,
                    userNote: '',
                    tag: 'Milestone',
                    chain: 'Base',
                    gasUsed: selectedTx.gasUsed,
                    gasPrice: selectedTx.gasPrice,
                  }}
                  showShareButton={false}
                />
              ) : (
                <Card className="p-8 sm:p-12 text-center glass-panel animate-fade-in">
                  <div className="space-y-4">
                    <div className="text-5xl sm:text-7xl opacity-20 animate-float">📜</div>
                    <div>
                      <p className="text-muted-foreground text-base sm:text-lg font-medium">
                        Select a transaction to preview
                      </p>
                      <p className="text-muted-foreground text-xs sm:text-sm mt-2">
                        Your receipt will appear here
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Wallet Analytics Section - Positioned under Receipt Card */}
            {currentStep === 'select' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Wallet Analytics</h2>
                
                {/* Wallet Search */}
                <WalletSearch
                  onSearch={handleWalletSearch}
                  onClear={handleClearSearch}
                  currentAddress={searchedWallet}
                  loading={statsLoading}
                />
                
                {/* Wallet Stats Display */}
                <WalletStatsDisplay
                  stats={stats}
                  loading={statsLoading}
                  error={statsError}
                  walletAddress={searchedWallet || address || null}
                  isConnectedWallet={!searchedWallet && !!address}
                />
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-border text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" className="fill-current text-blue-600 dark:text-blue-400"/>
            </svg>
            <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
              Base Receipts
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Humanize your onchain activity 💙</p>
        </footer>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  step: number;
  active: boolean;
  completed: boolean;
  label: string;
}

function StepIndicator({ step, active, completed, label }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
          active
            ? 'bg-primary text-primary-foreground ring-2 sm:ring-4 ring-primary/20 dark:ring-primary/30 scale-110 button-glow animate-ring-pulse'
            : completed
            ? 'bg-primary text-primary-foreground scale-100'
            : 'bg-muted text-muted-foreground scale-90'
        }`}
      >
        {completed ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="text-sm sm:text-base lg:text-lg">{step}</span>
        )}
      </div>
      <span className={`text-[10px] sm:text-xs font-bold transition-colors duration-300 hidden sm:block ${
        active ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        {label}
      </span>
    </div>
  );
}
