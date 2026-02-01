'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Receipt } from '@/types/receipt';
import { RECEIPT_NFT_ABI, RECEIPT_CONTRACT_ADDRESS } from '@/lib/contract';
import { serializeBigInt } from '@/lib/utils';
import { downloadReceiptImage } from '@/lib/receipt-image';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, Loader2, AlertCircle, Sparkles, Rocket, Ban, Download } from 'lucide-react';
import { isMintableTransaction, getMintRestrictionReason } from '@/lib/protocol-detector';
import { ReceiptCard } from './receipt-card';
import { ReceiptCardExport } from './receipt-card-export';

interface ReceiptMinterProps {
  receipt: Receipt;
  onSuccess: () => void;
}

type MintStage = 'idle' | 'preparing' | 'confirming' | 'minting' | 'success';

export function ReceiptMinter({ receipt, onSuccess }: ReceiptMinterProps) {
  const { address } = useAccount();
  const [metadataURI, setMetadataURI] = useState<string>('');
  const [isCreatingMetadata, setIsCreatingMetadata] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mintStage, setMintStage] = useState<MintStage>('idle');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string>('');

  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createMetadata = async (): Promise<string> => {
    setIsCreatingMetadata(true);
    setMintStage('preparing');
    setError('');

    try {
      // Serialize BigInt values to strings before sending to API
      const serializableReceipt = serializeBigInt(receipt);
      
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt: serializableReceipt }),
      });

      if (!response.ok) {
        throw new Error('Failed to create metadata');
      }

      const data: { metadataURI: string } = await response.json();
      return data.metadataURI;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create metadata';
      setError(message);
      setMintStage('idle');
      throw err;
    } finally {
      setIsCreatingMetadata(false);
    }
  };

  const handleMint = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    // Check if transaction type is supported for minting
    if (!isMintableTransaction(receipt.actionType)) {
      const reason = getMintRestrictionReason(receipt.actionType);
      setError(reason || 'This transaction type is not supported for minting');
      return;
    }

    try {
      let uri = metadataURI;
      if (!uri) {
        uri = await createMetadata();
        setMetadataURI(uri);
      }

      setMintStage('confirming');
      writeContract({
        address: RECEIPT_CONTRACT_ADDRESS,
        abi: RECEIPT_NFT_ABI,
        functionName: 'mintReceipt',
        args: [receipt.txHash, uri],
      });
    } catch (err) {
      console.error('Minting error:', err);
      setMintStage('idle');
    }
  };

  // Update mint stage based on transaction state
  if (isPending && mintStage !== 'confirming') {
    setMintStage('confirming');
  }
  if (isConfirming && mintStage !== 'minting') {
    setMintStage('minting');
  }
  if (isSuccess && mintStage !== 'success') {
    setMintStage('success');
  }

  const handleDownloadReceipt = async (): Promise<void> => {
    setIsDownloading(true);
    setDownloadError('');
    
    try {
      // Use export-optimized receipt ID
      const exportReceiptId = `receipt-export-${receipt.txHash}`;
      await downloadReceiptImage(
        exportReceiptId,
        `base-receipt-${receipt.txHash.slice(0, 10)}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download receipt';
      setDownloadError(message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isSuccess) {
    const exportReceiptId = `receipt-export-${receipt.txHash}`;
    
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Export-optimized receipt card - positioned off-screen with opacity 0 */}
        <div 
          style={{
            position: 'absolute',
            left: '-10000px',
            top: '0',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <ReceiptCardExport 
            receipt={receipt} 
            id={exportReceiptId}
          />
        </div>

        <Card className="p-10 text-center space-y-6 card-glow relative overflow-hidden">
        {/* Confetti Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i: number) => (
            <div key={i} className="confetti-particle rounded-full" />
          ))}
        </div>

        {/* Success Icon with Enhanced Animations */}
        <div className="flex justify-center relative z-10">
          <div className="relative animate-success-scale-in">
            {/* Multiple radial burst layers */}
            <div className="absolute inset-0 bg-emerald-500/30 dark:bg-emerald-400/30 rounded-full blur-3xl animate-radial-burst" />
            <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full blur-2xl animate-glow-expand" />
            
            {/* Custom Checkmark SVG with draw animation */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 rounded-full flex items-center justify-center">
              <svg 
                className="w-14 h-14" 
                viewBox="0 0 52 52" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  className="animate-checkmark-draw"
                  d="M14 27L22 35L38 17" 
                  stroke="white" 
                  strokeWidth="5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {/* Sparkles with twinkle animation */}
            <Sparkles className="w-8 h-8 text-blue-500 dark:text-blue-400 absolute -top-2 -right-2 animate-sparkle-twinkle" />
            <Sparkles className="w-6 h-6 text-emerald-500 dark:text-emerald-400 absolute -bottom-1 -left-1 animate-sparkle-twinkle" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Content with staggered animations */}
        <div className="space-y-3 relative z-10">
          <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent animate-float-up stagger-1">
            Receipt Minted! 🎉
          </h3>
          
          {/* Anime-inspired success message */}
          <p className="text-xl font-medium text-foreground/80 dark:text-foreground/70 animate-float-up stagger-2 italic">
            ありがとうございます
          </p>
          <p className="text-sm text-muted-foreground animate-float-up stagger-2">
            (Arigatou gozaimasu - Thank you)
          </p>
          
          <p className="text-muted-foreground text-lg animate-float-up stagger-3">
            Your Base receipt is now a permanent onchain NFT
          </p>
          {hash && (
            <div className="bg-secondary/50 dark:bg-secondary/20 p-5 rounded-xl border border-border/50 animate-float-up stagger-4">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Transaction Hash</p>
              <p className="text-xs font-mono text-foreground font-semibold break-all">
                {hash}
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 space-y-3 relative z-10 animate-float-up stagger-5">
          {/* Download Receipt Button */}
          <Button 
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-base py-6 button-glow transition-all duration-300"
            size="lg"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Minted Receipt
              </>
            )}
          </Button>

          {downloadError && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-3 animate-shake">
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">{downloadError}</p>
            </div>
          )}

          <Button 
            onClick={onSuccess} 
            variant="outline"
            className="w-full border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-base py-6 transition-all duration-300"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Another Receipt
          </Button>
          <p className="text-xs text-muted-foreground animate-float-up stagger-6">
            Download your NFT receipt as an image for sharing! 📸
          </p>
        </div>
      </Card>
      </div>
    );
  }

  const isProcessing = isPending || isConfirming || isCreatingMetadata;
  const canMint = isMintableTransaction(receipt.actionType);
  const restrictionReason = getMintRestrictionReason(receipt.actionType);

  // Show restriction message if transaction type is not supported
  if (!canMint) {
    return (
      <Card className="p-8 space-y-6 card-glow animate-fade-in border-amber-200 dark:border-amber-800">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 dark:bg-amber-400/20 rounded-2xl blur-xl" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-2xl flex items-center justify-center">
                <Ban className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-foreground">Cannot Mint Receipt</h3>
          <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              {restrictionReason}
            </p>
          </div>
          <div className="bg-secondary/30 dark:bg-secondary/10 p-5 rounded-xl border border-border/50 space-y-2">
            <p className="text-sm font-semibold text-foreground">
              ✓ Supported Transaction Types:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-xs font-medium px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800">
                DEX Swaps
              </span>
              <span className="text-xs font-medium px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg border border-teal-200 dark:border-teal-800">
                Bridge Transfers
              </span>
              <span className="text-xs font-medium px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-lg border border-pink-200 dark:border-pink-800">
                NFT Mints
              </span>
              <span className="text-xs font-medium px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800">
                Token Transfers
              </span>
              <span className="text-xs font-medium px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800">
                Contract Interactions
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Select a different transaction from the list to create a receipt NFT
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6 card-glow animate-fade-in">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-2xl blur-xl" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center">
              {isProcessing ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : (
                <Rocket className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
        </div>
        <h3 className="text-3xl font-bold text-foreground">Ready to Mint</h3>
        <p className="text-muted-foreground text-lg">
          Transform this {receipt.actionType} into a permanent NFT
        </p>
      </div>

      {/* Progress indicator */}
      {isProcessing && (
        <div className="space-y-3 animate-slide-in">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold text-primary">
              {mintStage === 'preparing' && 'Preparing...'}
              {mintStage === 'confirming' && 'Awaiting confirmation...'}
              {mintStage === 'minting' && 'Minting...'}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ${
                mintStage === 'preparing' ? 'w-1/3' :
                mintStage === 'confirming' ? 'w-2/3' :
                mintStage === 'minting' ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <div className="space-y-2 pt-2">
            <MintStep 
              label="Creating metadata"
              active={mintStage === 'preparing'}
              completed={mintStage !== 'idle' && mintStage !== 'preparing'}
            />
            <MintStep 
              label="Confirm in wallet"
              active={mintStage === 'confirming'}
              completed={mintStage === 'minting' || mintStage === 'success'}
            />
            <MintStep 
              label="Minting onchain"
              active={mintStage === 'minting'}
              completed={mintStage === 'success'}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">{error}</p>
        </div>
      )}

      {!isProcessing && (
        <div className="space-y-3 bg-secondary/30 dark:bg-secondary/10 p-5 rounded-xl border border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Network</span>
            <span className="font-bold text-foreground flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" className="fill-current text-blue-600 dark:text-blue-400"/>
              </svg>
              {receipt.chain}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Est. Gas Fee</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">~$0.01</span>
          </div>
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💎 Your receipt will be permanently stored onchain
            </p>
          </div>
        </div>
      )}

      <Button
        onClick={handleMint}
        disabled={isProcessing || !address}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg py-7 button-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        size="lg"
      >
        {isProcessing ? (
          <span className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            {mintStage === 'preparing' && 'Preparing Metadata'}
            {mintStage === 'confirming' && 'Check Your Wallet'}
            {mintStage === 'minting' && 'Minting NFT...'}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Mint Receipt NFT
          </span>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        This will create a permanent onchain record of your transaction
      </p>
    </Card>
  );
}

function MintStep({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
        completed ? 'bg-emerald-500 dark:bg-emerald-400' :
        active ? 'bg-blue-500 dark:bg-blue-400 ring-4 ring-blue-200 dark:ring-blue-900' :
        'bg-muted'
      }`}>
        {completed ? (
          <CheckCircle2 className="w-3 h-3 text-white" />
        ) : active ? (
          <Loader2 className="w-3 h-3 text-white animate-spin" />
        ) : null}
      </div>
      <span className={`transition-colors duration-300 ${
        active ? 'text-foreground font-semibold' :
        completed ? 'text-muted-foreground line-through' :
        'text-muted-foreground'
      }`}>
        {label}
      </span>
    </div>
  );
}
