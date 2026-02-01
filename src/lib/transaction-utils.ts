import type { Address, PublicClient, Hash } from 'viem';
import type { BaseTransaction } from '@/types/receipt';
import { detectActionType as detectType, detectProtocol as detectProto } from './protocol-detector';

// Cache for transaction results to avoid re-fetching
const txCache = new Map<string, { data: BaseTransaction[]; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute cache

/**
 * Basescan API V2 Response Types
 */
interface BasescanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  timeStamp: string;
  isError: string;
  txreceipt_status: string;
  input?: string;
  gasUsed: string;
  gasPrice: string;
}

interface BasescanApiResponse {
  status: string;
  message: string;
  result: BasescanTransaction[] | string;
}

/**
 * Fetch recent transactions using Basescan API V2
 * This is the primary method for fetching Base transactions efficiently.
 */
export async function fetchRecentTransactions(
  client: PublicClient,
  address: Address,
  limit: number = 10
): Promise<BaseTransaction[]> {
  // Check cache first
  const cacheKey = `${address}-${limit}`;
  const cached = txCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Transaction Utils] Returning cached transactions');
    return cached.data;
  }

  try {
    // Use Basescan API V2 via our proxy route
    console.log('[Transaction Utils] Fetching from Basescan API V2 for address:', address);
    
    const params = new URLSearchParams({
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: Math.max(limit, 20).toString(), // Fetch more to account for failed txs
      sort: 'desc', // Most recent first
    });

    const response = await fetch(`/api/basescan?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[Transaction Utils] API error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch from Basescan API');
    }

    const data: BasescanApiResponse = await response.json();

    // Handle API-level errors
    if (data.status === '0' && typeof data.result === 'string') {
      if (data.message === 'No transactions found') {
        console.log('[Transaction Utils] No transactions found');
        return [];
      }
      console.error('[Transaction Utils] Basescan API error:', data.message, data.result);
      throw new Error(data.message || 'Basescan API error');
    }

    // Filter and transform transactions
    const transactions: BaseTransaction[] = [];
    
    if (Array.isArray(data.result)) {
      for (const tx of data.result) {
        // Only include confirmed successful transactions
        if (tx.isError === '0' && tx.txreceipt_status === '1') {
          transactions.push({
            hash: tx.hash as Hash,
            from: tx.from as Address,
            to: (tx.to || null) as Address | null,
            value: BigInt(tx.value),
            blockNumber: BigInt(tx.blockNumber),
            timestamp: parseInt(tx.timeStamp),
            input: tx.input as `0x${string}` | undefined,
            gasUsed: BigInt(tx.gasUsed || '0'),
            gasPrice: BigInt(tx.gasPrice || '0'),
          });

          if (transactions.length >= limit) break;
        }
      }
    }

    console.log('[Transaction Utils] Processed', transactions.length, 'confirmed transactions');

    // Cache the results
    txCache.set(cacheKey, {
      data: transactions,
      timestamp: Date.now(),
    });

    return transactions;
  } catch (error) {
    console.error('[Transaction Utils] Error fetching transactions:', error);
    
    // Return cached data if available, even if stale
    const staleCache = txCache.get(cacheKey);
    if (staleCache) {
      console.log('[Transaction Utils] Returning stale cache due to error');
      return staleCache.data;
    }

    // If all else fails, throw the error
    throw error;
  }
}

/**
 * Alternative faster method using Basescan API V2 with smaller limit
 * Useful for quick previews or when you need fewer transactions.
 */
export async function fetchRecentTransactionsFast(
  client: PublicClient,
  address: Address,
  limit: number = 10
): Promise<BaseTransaction[]> {
  const cacheKey = `fast-${address}-${limit}`;
  const cached = txCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    console.log('[Transaction Utils] Fast fetch from Basescan API V2');
    
    const params = new URLSearchParams({
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: limit.toString(),
      sort: 'desc',
    });

    const response = await fetch(`/api/basescan?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Basescan API');
    }

    const data: BasescanApiResponse = await response.json();

    if (data.status === '0') {
      if (data.message === 'No transactions found') {
        return [];
      }
      throw new Error(data.message || 'Basescan API error');
    }

    const transactions: BaseTransaction[] = [];
    
    if (Array.isArray(data.result)) {
      for (const tx of data.result) {
        if (tx.isError === '0' && tx.txreceipt_status === '1') {
          transactions.push({
            hash: tx.hash as Hash,
            from: tx.from as Address,
            to: (tx.to || null) as Address | null,
            value: BigInt(tx.value),
            blockNumber: BigInt(tx.blockNumber),
            timestamp: parseInt(tx.timeStamp),
            input: tx.input as `0x${string}` | undefined,
            gasUsed: BigInt(tx.gasUsed || '0'),
            gasPrice: BigInt(tx.gasPrice || '0'),
          });
        }
      }
    }

    txCache.set(cacheKey, {
      data: transactions,
      timestamp: Date.now(),
    });

    return transactions;
  } catch (error) {
    console.error('[Transaction Utils] Error in fast fetch:', error);
    
    // Return stale cache if available
    const staleCache = txCache.get(cacheKey);
    if (staleCache) {
      return staleCache.data;
    }

    return [];
  }
}

export function detectActionType(tx: BaseTransaction) {
  return detectType(tx.to, tx.value, tx.input);
}

export function detectProtocol(tx: BaseTransaction): string {
  const actionType = detectActionType(tx);
  return detectProto(tx.to, actionType);
}

export function formatTxHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format gas cost in ETH with appropriate precision
 * Returns a human-readable string like "0.00045 ETH" or "0.002 ETH"
 */
export function formatGasCost(gasUsed: bigint, gasPrice: bigint): string {
  const totalGasWei = gasUsed * gasPrice;
  const ethValue = Number(totalGasWei) / 1e18;
  
  // Format with appropriate precision
  if (ethValue < 0.00001) {
    return `${ethValue.toFixed(8)} ETH`;
  } else if (ethValue < 0.001) {
    return `${ethValue.toFixed(6)} ETH`;
  } else if (ethValue < 0.1) {
    return `${ethValue.toFixed(4)} ETH`;
  } else {
    return `${ethValue.toFixed(3)} ETH`;
  }
}

// Clear cache utility (can be called when needed)
export function clearTransactionCache(): void {
  txCache.clear();
}
