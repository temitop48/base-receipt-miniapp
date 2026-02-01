'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Share2, Download, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { Receipt } from '@/types/receipt';
import { formatTxHash } from '@/lib/transaction-utils';

interface ShareToXProps {
  receipt: Receipt;
  receiptElementId: string;
}

export function ShareToX({ receipt, receiptElementId }: ShareToXProps) {
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [imageDownloaded, setImageDownloaded] = useState<boolean>(false);

  const generateTweetText = (): string => {
    const actionEmoji: Record<string, string> = {
      swap: '🔄',
      mint: '🎨',
      send: '📤',
      deploy: '🚀',
      vote: '🗳️',
      bridge: '🌉',
      contract: '📝',
      unknown: '⚡',
    };

    const emoji = actionEmoji[receipt.actionType] || '⚡';

    // Concise, authentic copy
    const tweetLines: string[] = [
      `${emoji} Just ${receipt.actionType === 'mint' ? 'minted' : receipt.actionType === 'swap' ? 'swapped' : receipt.actionType === 'send' ? 'sent' : 'completed'} on @base`,
    ];

    // Add protocol if meaningful
    if (receipt.protocol && receipt.protocol !== 'Unknown' && receipt.protocol !== 'Base') {
      tweetLines.push(`via ${receipt.protocol}`);
    }

    // Add user note if present (keep it short)
    if (receipt.userNote && receipt.userNote.length <= 80) {
      tweetLines.push(`\n"${receipt.userNote}"`);
    }

    // Base branding
    tweetLines.push('\n✨ Built on Base');

    // Transaction link
    tweetLines.push(`\n🔗 ${`https://basescan.org/tx/${receipt.txHash}`}`);

    // Hashtags - minimal and relevant
    tweetLines.push('\n#Base #Onchain');

    return tweetLines.join(' ');
  };

  const captureReceiptImage = async (): Promise<Blob | null> => {
    const element = document.getElementById(receiptElementId);
    if (!element) {
      console.error('Receipt element not found');
      return null;
    }

    try {
      // Generate high-quality PNG
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Convert to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Failed to capture receipt image:', error);
      return null;
    }
  };

  const downloadImage = (blob: Blob): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `base-receipt-${formatTxHash(receipt.txHash)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show confirmation
    setImageDownloaded(true);
    setTimeout(() => setImageDownloaded(false), 3000);
  };

  const handleShare = async (): Promise<void> => {
    setIsSharing(true);

    try {
      // Generate tweet text
      const tweetText = generateTweetText();

      // Capture and download receipt image
      const imageBlob = await captureReceiptImage();
      if (imageBlob) {
        downloadImage(imageBlob);
      }

      // Open X (Twitter) compose with pre-filled text
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      
      // Small delay to ensure image download starts first
      await new Promise(resolve => setTimeout(resolve, 500));
      
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to share to X:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <Button
        onClick={handleShare}
        disabled={isSharing}
        className="w-full min-h-[48px] sm:min-h-[44px] bg-primary hover:bg-[hsl(221,100%,45%)] text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all duration-200 group text-sm sm:text-base button-glow"
        size="lg"
      >
        {isSharing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Preparing...
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Share to X
          </>
        )}
      </Button>

      {imageDownloaded && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 sm:p-3 animate-fade-in">
          <Check className="w-4 h-4 flex-shrink-0" />
          <p className="font-medium">
            Receipt saved! Attach it to your post on X
          </p>
        </div>
      )}

      <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-relaxed px-2">
        Opens X with pre-filled text. Receipt image downloads automatically - attach it to your post!
      </p>
    </div>
  );
}
