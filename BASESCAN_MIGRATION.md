# Basescan API V2 Migration

## Overview

Successfully migrated Base Receipts from deprecated Basescan V1 API to the unified **Etherscan API V2** with Base chain support.

## What Changed

### 1. New API Route: `/api/basescan`
- Created server-side proxy endpoint for secure Basescan API V2 requests
- Uses Etherscan V2 unified endpoint: `https://api.etherscan.io/v2/api`
- Explicitly includes `chainid=8453` for Base mainnet
- Handles errors gracefully with detailed logging

### 2. Updated Transaction Fetching
- Replaced slow block-by-block iteration with efficient Basescan API calls
- Now fetches confirmed transactions only (`isError=0` and `txreceipt_status=1`)
- Includes 1-minute caching to reduce API calls
- Proper error handling with fallback to stale cache

### 3. Environment Configuration
- Added `BASESCAN_API_KEY` environment variable support
- Created `.env.example` file for documentation
- API key is optional but recommended for higher rate limits

## How to Use

### 1. Get a Basescan API Key (Recommended)
1. Visit https://basescan.org/myapikey
2. Create a free account
3. Generate your API key

### 2. Configure Environment Variable
Add to your `.env.local` file:
```bash
BASESCAN_API_KEY=your_api_key_here
```

### 3. No API Key? No Problem!
The app works without an API key but will be subject to lower rate limits.

## API Endpoints

### Basescan V2 API Route
**Endpoint**: `GET /api/basescan`

**Query Parameters**:
- `address` (required) - Wallet address to fetch transactions for
- `startblock` (optional) - Starting block number (default: 0)
- `endblock` (optional) - Ending block number (default: 99999999)
- `page` (optional) - Page number (default: 1)
- `offset` (optional) - Number of transactions per page (default: 10)
- `sort` (optional) - Sort order: 'asc' or 'desc' (default: desc)

**Example Request**:
```bash
GET /api/basescan?address=0x123...&offset=10&sort=desc
```

**Response Format**:
```json
{
  "status": "1",
  "message": "OK",
  "result": [
    {
      "hash": "0xabc...",
      "from": "0x123...",
      "to": "0x456...",
      "value": "1000000000000000000",
      "blockNumber": "12345678",
      "timeStamp": "1704067200",
      "isError": "0",
      "txreceipt_status": "1"
    }
  ]
}
```

## Benefits

✅ **Faster**: No more iterating through blocks - instant transaction history  
✅ **Accurate**: Uses official Basescan data matching basescan.org  
✅ **Reliable**: Confirmed transactions only (no failed or pending txs)  
✅ **Efficient**: Built-in caching reduces redundant API calls  
✅ **Future-proof**: Uses supported V2 API (V1 is deprecated)  

## Technical Details

### Chainid Configuration
- **Base Mainnet**: `chainid=8453`
- **Base Sepolia**: `chainid=84532`

Currently configured for Base mainnet. To switch to testnet, update the `chainid` parameter in `/api/basescan/route.ts`.

### Rate Limits
- **Without API Key**: ~5 requests/second
- **With Free API Key**: ~5 requests/second
- **With Pro API Key**: Higher limits available

### Caching Strategy
- In-memory cache with 60-second TTL
- Fallback to stale cache on API errors
- Per-address + limit caching for efficiency

## Troubleshooting

### "Unable to load transactions"
1. Check your internet connection
2. Verify wallet is connected to Base network
3. Ensure Basescan API is accessible
4. Check browser console for detailed error logs

### "NOTOK" or deprecated endpoint errors
This should no longer occur! If you see this:
1. Clear browser cache
2. Restart the dev server
3. Check that you're using the latest code

### No transactions showing
1. Verify the address has transactions on Base
2. Check basescan.org to confirm
3. Wait a moment for transactions to be indexed

## Migration Notes

### Before (V1 - Deprecated)
```
❌ https://api.basescan.org/api
❌ Slow block-by-block iteration
❌ No confirmed transaction filtering
❌ "You are using a deprecated V1 endpoint" errors
```

### After (V2 - Current)
```
✅ https://api.etherscan.io/v2/api
✅ Fast API-based fetching
✅ Confirmed transactions only
✅ No deprecation warnings
```

## Resources

- [Basescan API Documentation](https://docs.basescan.org/api-endpoints/accounts)
- [Etherscan API V2 Migration Guide](https://docs.etherscan.io/v/etherscan-v2/)
- [Base Network Documentation](https://docs.base.org/)

---

**Migration completed**: January 26, 2026  
**Status**: ✅ Successful  
**Build**: ✅ Passing
