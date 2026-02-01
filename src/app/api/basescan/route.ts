import { NextRequest, NextResponse } from 'next/server';

/**
 * Basescan API V2 Proxy Route
 * 
 * This endpoint proxies requests to Etherscan API V2 with Base chain support.
 * Uses chainid=8453 to fetch Base mainnet transactions via the unified Etherscan V2 API.
 */

const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || 'E4YZR6V3344CVMICQ71V1SA7TKHUV3DDP9';
const ETHERSCAN_V2_ENDPOINT = 'https://api.etherscan.io/v2/api';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const startBlock = searchParams.get('startblock') || '0';
    const endBlock = searchParams.get('endblock') || '99999999';
    const page = searchParams.get('page') || '1';
    const offset = searchParams.get('offset') || '10';
    const sort = searchParams.get('sort') || 'desc';

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Build Etherscan V2 API request with Base chainid
    const params = new URLSearchParams({
      chainid: '8453', // Base mainnet
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: startBlock,
      endblock: endBlock,
      page: page,
      offset: offset,
      sort: sort,
      apikey: BASESCAN_API_KEY,
    });

    const apiUrl = `${ETHERSCAN_V2_ENDPOINT}?${params.toString()}`;

    console.log('[Basescan API] Fetching transactions for address:', address);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Basescan API] HTTP error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Basescan API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check for API-level errors
    if (data.status === '0' && data.message !== 'No transactions found') {
      console.error('[Basescan API] API error:', data.message, data.result);
      return NextResponse.json(
        { error: data.message || 'Basescan API error', details: data.result },
        { status: 400 }
      );
    }

    // Handle "No transactions found" as success with empty array
    if (data.message === 'No transactions found') {
      console.log('[Basescan API] No transactions found for address:', address);
      return NextResponse.json({
        status: '1',
        message: 'OK',
        result: [],
      });
    }

    console.log('[Basescan API] Successfully fetched', data.result?.length || 0, 'transactions');

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Basescan API] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: errorMessage },
      { status: 500 }
    );
  }
}
