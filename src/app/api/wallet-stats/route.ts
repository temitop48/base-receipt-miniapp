import { NextRequest, NextResponse } from 'next/server';

/**
 * Wallet Stats API Route
 * 
 * Fetches comprehensive wallet interaction analytics from BaseScan API
 * for any wallet address on Base network.
 */

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || 'E4YZR6V3344CVMICQ71V1SA7TKHUV3DDP9';
const ETHERSCAN_V2_ENDPOINT = 'https://api.etherscan.io/v2/api';
const BASE_CHAIN_ID = '8453';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  input: string;
  isError: string;
  contractAddress: string;
  gasUsed: string;
  gasPrice: string;
}

interface WalletStats {
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

// Known bridge contract addresses on Base
const BRIDGE_CONTRACTS: Record<string, string> = {
  '0x49048044d57e1c92a77f79988d21fa8faf74e97e': 'Base Native Bridge',
  '0x3154cf16ccdb4c6d922629664174b904d80f2c35': 'Base Bridge',
  '0x866e82a600a1414e583f7f13623f1ac5d58b0afa': 'Hop Protocol',
  '0x46ae9bab8cea96610807a275ebd36f8e916b5c61': 'Stargate Bridge',
  '0x10e6593cdda8c58a1d0f14c5164b376352a55f2f': 'Synapse Bridge',
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    console.log('[Wallet Stats API] Fetching stats for address:', address);

    // Fetch all transactions (we need more data for accurate stats)
    const params = new URLSearchParams({
      chainid: BASE_CHAIN_ID,
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: '10000', // Get up to 10k transactions for accurate stats
      sort: 'asc', // Ascending to get first transaction
      apikey: BASESCAN_API_KEY,
    });

    const apiUrl = `${ETHERSCAN_V2_ENDPOINT}?${params.toString()}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Wallet Stats API] HTTP error:', response.status);
      return NextResponse.json(
        { error: `BaseScan API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check for API-level errors
    if (data.status === '0' && data.message !== 'No transactions found') {
      console.error('[Wallet Stats API] API error:', data.message);
      return NextResponse.json(
        { error: data.message || 'BaseScan API error' },
        { status: 400 }
      );
    }

    // Handle no transactions
    if (data.message === 'No transactions found' || !data.result || data.result.length === 0) {
      console.log('[Wallet Stats API] No transactions found for address:', address);
      
      // Fetch balance even if no transactions
      const balanceParams = new URLSearchParams({
        chainid: BASE_CHAIN_ID,
        module: 'account',
        action: 'balance',
        address: address,
        apikey: BASESCAN_API_KEY,
      });

      const balanceResponse = await fetch(`${ETHERSCAN_V2_ENDPOINT}?${balanceParams.toString()}`);
      const balanceData = await balanceResponse.json();
      
      const balance = balanceData.status === '1' ? balanceData.result : '0';

      return NextResponse.json({
        balance,
        volume: '0',
        nativeTxs: 0,
        tokenTxs: 0,
        walletAge: 0,
        firstTransactionDate: 'N/A',
        uniqueActiveDays: 0,
        uniqueActiveWeeks: 0,
        uniqueActiveMonths: 0,
        totalContractInteractions: 0,
        uniqueContractInteractions: 0,
        depositedAmount: '0',
        nativeBridgeUsed: [],
        totalTransactions: 0,
      });
    }

    const transactions: Transaction[] = data.result;

    // Calculate stats
    const stats = calculateWalletStats(transactions, address.toLowerCase());

    console.log('[Wallet Stats API] Successfully calculated stats for', address);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Wallet Stats API] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch wallet stats', details: errorMessage },
      { status: 500 }
    );
  }
}

function calculateWalletStats(transactions: Transaction[], walletAddress: string): WalletStats {
  let totalVolume = BigInt(0);
  let nativeTxs = 0;
  let tokenTxs = 0;
  let depositedAmount = BigInt(0);
  let totalContractInteractions = 0;
  const contractAddresses = new Set<string>();
  const bridgesUsed = new Set<string>();
  const activeDays = new Set<string>();
  const activeWeeks = new Set<string>();
  const activeMonths = new Set<string>();

  // Process each transaction
  for (const tx of transactions) {
    const value = BigInt(tx.value || '0');
    const timestamp = parseInt(tx.timeStamp) * 1000;
    const date = new Date(timestamp);
    const isSuccessful = tx.isError === '0';

    if (!isSuccessful) continue;

    // Track activity patterns
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    activeDays.add(dayKey);
    activeWeeks.add(weekKey);
    activeMonths.add(monthKey);

    // Calculate volume (all successful transactions)
    if (value > 0) {
      totalVolume += value;
    }

    // Detect transaction type
    const isContractInteraction = tx.to && tx.input && tx.input !== '0x';
    const hasContractAddress = tx.contractAddress && tx.contractAddress !== '';
    const toAddress = tx.to?.toLowerCase() || '';
    const fromAddress = tx.from?.toLowerCase() || '';

    // Token transactions (has contract address)
    if (hasContractAddress) {
      tokenTxs++;
    }
    // Native ETH transactions (no contract address and has value)
    else if (value > 0) {
      nativeTxs++;
    }

    // Deposited amount (incoming transactions)
    if (toAddress === walletAddress && value > 0) {
      depositedAmount += value;
    }

    // Contract interactions
    if (isContractInteraction) {
      totalContractInteractions++;
      if (toAddress) {
        contractAddresses.add(toAddress);
      }
    }

    // Check for bridge usage
    if (toAddress && BRIDGE_CONTRACTS[toAddress]) {
      bridgesUsed.add(BRIDGE_CONTRACTS[toAddress]);
    }
  }

  // Get first transaction
  const firstTx = transactions[0];
  const firstTxTimestamp = parseInt(firstTx.timeStamp) * 1000;
  const firstTxDate = new Date(firstTxTimestamp);
  const walletAge = Math.floor((Date.now() - firstTxTimestamp) / (1000 * 60 * 60 * 24)); // Age in days

  // Get current balance (use the last known value from transactions)
  // Note: This is an approximation. For accurate balance, we'd need to call the balance API
  let balance = BigInt(0);
  for (const tx of transactions) {
    const toAddress = tx.to?.toLowerCase() || '';
    const fromAddress = tx.from?.toLowerCase() || '';
    const value = BigInt(tx.value || '0');

    if (toAddress === walletAddress && tx.isError === '0') {
      balance += value;
    }
    if (fromAddress === walletAddress && tx.isError === '0') {
      balance -= value;
      // Subtract gas costs
      const gasCost = BigInt(tx.gasUsed || '0') * BigInt(tx.gasPrice || '0');
      balance -= gasCost;
    }
  }

  return {
    balance: balance.toString(),
    volume: totalVolume.toString(),
    nativeTxs,
    tokenTxs,
    walletAge,
    firstTransactionDate: firstTxDate.toISOString(),
    uniqueActiveDays: activeDays.size,
    uniqueActiveWeeks: activeWeeks.size,
    uniqueActiveMonths: activeMonths.size,
    totalContractInteractions,
    uniqueContractInteractions: contractAddresses.size,
    depositedAmount: depositedAmount.toString(),
    nativeBridgeUsed: Array.from(bridgesUsed),
    totalTransactions: transactions.length,
  };
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
