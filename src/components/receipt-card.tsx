'use client';

import type { Receipt } from '@/types/receipt';
import { formatTxHash, formatTimestamp, formatGasCost } from '@/lib/transaction-utils';
import { Card } from './ui/card';
import { ShieldCheck, Clock, ExternalLink, Flame } from 'lucide-react';
import { Button } from './ui/button';
import { ShareToX } from './share-to-x';

interface ReceiptCardProps {
  receipt: Receipt;
  showShareButton?: boolean;
}

export function ReceiptCard({ receipt, showShareButton = false }: ReceiptCardProps) {
  const receiptId = `receipt-${receipt.txHash}`;

  const tagColors: Record<string, string> = {
    'First time': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Milestone': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Win': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'Loss': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    'Chaos': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card id={receiptId} className="max-w-md mx-auto overflow-hidden glass-card transition-all duration-300 hover:scale-[1.01] animate-receipt-appear relative">
        {/* Subtle Base Logo Watermark - positioned in center background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <svg 
          width="300" 
          height="300" 
          viewBox="0 0 111 111" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-[0.03] dark:opacity-[0.05]"
        >
          <path 
            d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" 
            className="fill-current text-blue-600 dark:text-blue-400"
          />
        </svg>
      </div>

      {/* Header with Base official gradient - Mobile Optimized */}
      <div className="bg-gradient-to-br from-primary via-primary to-[hsl(221,95%,45%)] dark:from-primary dark:via-primary dark:to-[hsl(221,95%,55%)] p-5 sm:p-6 lg:p-8 text-white relative overflow-hidden z-10">
        {/* Frost-inspired decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/8 rounded-full blur-3xl animate-frost-pulse" />
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-[hsl(195,65%,88%)]/10 rounded-full blur-2xl animate-frost-pulse" style={{ animationDelay: '1.2s' }} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <h2 className="text-2xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Receipt</h2>
              {/* Base Logo Badge */}
              <div className="backdrop-blur-sm bg-white/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 sm:gap-2">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" fill="white"/>
                </svg>
                <span className="text-[10px] sm:text-xs font-bold">Base</span>
              </div>
            </div>
            <div className="text-right backdrop-blur-sm bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
              <p className="text-[10px] sm:text-xs opacity-80 font-medium">Chain</p>
              <p className="font-bold text-base sm:text-lg">{receipt.chain}</p>
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2 backdrop-blur-sm bg-white/10 p-3 sm:p-4 rounded-lg sm:rounded-xl">
            <p className="text-[10px] sm:text-xs opacity-80 font-medium">Transaction Hash</p>
            <p className="font-mono text-xs sm:text-sm font-semibold break-all">{formatTxHash(receipt.txHash)}</p>
          </div>
        </div>
      </div>

      {/* Content - Mobile Optimized */}
      <div className="p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 bg-card relative z-10">
        {/* Trust Badge - Verified on Base with timestamp - Mobile Optimized */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 animate-badge-entrance">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                Verified on Base
              </h4>
              <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Official onchain transaction receipt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-0 sm:pl-13 pt-2 border-t border-emerald-200 dark:border-emerald-800/50 flex-wrap">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-mono">
              {formatTimestamp(receipt.timestamp)}
            </p>
            <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-500 ml-auto">
              Block #{receipt.blockNumber.toString()}
            </span>
          </div>
        </div>

        {/* Gas Cost Badge - Compact pill-shaped design with Base blue */}
        <div className="flex items-center justify-center animate-fade-in">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border border-blue-200 dark:border-blue-800/50 backdrop-blur-sm">
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-300">
              Gas:
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-semibold text-blue-800 dark:text-blue-200">
              {formatGasCost(receipt.gasUsed, receipt.gasPrice)}
            </span>
          </div>
        </div>

        {/* BaseScan Verification Link - Mobile Optimized */}
        <a 
          href={`https://basescan.org/tx/${receipt.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button 
            variant="outline" 
            className="w-full min-h-[44px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 transition-all duration-200 group"
          >
            <ExternalLink className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm sm:text-base">Verify on BaseScan</span>
          </Button>
        </a>

        <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-border">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 font-medium">Action</p>
            <p className="font-bold text-lg sm:text-xl uppercase bg-gradient-to-r from-primary to-[hsl(221,95%,55%)] dark:from-primary dark:to-[hsl(221,90%,65%)] bg-clip-text text-transparent">
              {receipt.actionType}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 font-medium">Protocol</p>
            <p className="font-bold text-base sm:text-lg text-foreground">{receipt.protocol}</p>
          </div>
        </div>

        {receipt.userNote && (
          <div className="bg-secondary/50 dark:bg-secondary/20 p-3.5 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border border-border/50 backdrop-blur-sm animate-fade-in">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 font-medium">Personal Note</p>
            <p className="text-xs sm:text-sm italic text-foreground leading-relaxed">&ldquo;{receipt.userNote}&rdquo;</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 font-medium">Receipt Tag</p>
            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold ${tagColors[receipt.tag] || 'bg-muted text-muted-foreground'} backdrop-blur-sm inline-block`}>
              {receipt.tag}
            </div>
          </div>
        </div>

        {/* Base branding footer */}
        <div className="pt-4 sm:pt-5 border-t border-border flex items-center justify-center gap-2">
          <svg width="12" height="12" className="sm:w-[14px] sm:h-[14px] opacity-60" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" className="fill-current text-primary"/>
          </svg>
          <p className="text-[10px] sm:text-xs font-bold bg-gradient-to-r from-primary to-[hsl(221,95%,55%)] dark:from-primary dark:to-[hsl(221,90%,65%)] bg-clip-text text-transparent">
            Built on Base
          </p>
        </div>
      </div>
      </Card>

      {/* Share to X Button - Only shown when enabled */}
      {showShareButton && (
        <div className="max-w-md mx-auto animate-fade-in">
          <ShareToX receipt={receipt} receiptElementId={receiptId} />
        </div>
      )}
    </div>
  );
}
