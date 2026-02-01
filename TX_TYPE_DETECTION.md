# Transaction Type-Based Receipt NFT Minting

## Overview
This implementation adds intelligent transaction type detection and restricts receipt NFT minting to specific transaction types on Base.

## Features Implemented

### 1. Protocol Detection System (`src/lib/protocol-detector.ts`)
A comprehensive protocol detection system that identifies Base transactions by:

#### Known Protocol Contracts
- **DEX Protocols**: Uniswap V3, Aerodrome, BaseSwap, SwapBased
- **Bridge Protocols**: Base Bridge, Stargate, Across
- **NFT Marketplaces**: Seaport (OpenSea), Zora
- **Token Contracts**: USDC, WETH, DAI, USDbC, AERO, BRETT

#### Method Signature Detection
- **Swap Methods**: 10+ method signatures (swapExactTokensForTokens, exactInput, etc.)
- **Bridge Methods**: depositETH, bridgeETH, relay
- **Mint Methods**: mint, mintTo, mintWithRewards, purchase
- **Token Methods**: transfer, transferFrom, approve

### 2. Transaction Type Classification
Transactions are classified into 7 types:
- **`swap`** - DEX swaps (colored purple)
- **`bridge`** - Cross-chain transfers (colored teal)
- **`mint`** - NFT minting (colored pink)
- **`send`** - Token transfers (colored gray)
- **`deploy`** - Contract deployments (colored gray)
- **`vote`** - Governance votes (colored gray)
- **`unknown`** - Unrecognized transactions (colored gray)

### 3. Supported Minting Types
Only these transaction types can be minted as receipt NFTs:
- ✅ **Swaps** (DEX trading)
- ✅ **Bridges** (Cross-chain transfers)
- ✅ **Mints** (NFT purchases)

### 4. Enhanced Transaction List UI
- **Color-coded badges** for each transaction type
- **"✓ Mintable" indicator** for supported transactions
- **Protocol name display** (e.g., "Uniswap V3 Router", "Base Bridge")
- **Transaction hash** with improved formatting

### 5. Minting Restrictions
When a user tries to mint an unsupported transaction type:
- **Clear error message** explaining why it can't be minted
- **List of supported types** displayed prominently
- **Helpful guidance** to select a different transaction

### 6. Updated Transaction Data Structure
- Added `input` field to `BaseTransaction` for method signature analysis
- Added `bridge` to `ActionType` union type
- Enhanced Basescan API integration to include transaction input data

## User Experience Flow

1. **Connect Wallet** → Wallet connected
2. **View Transactions** → List shows recent Base transactions with:
   - Transaction type (color-coded badge)
   - Mintable status indicator
   - Protocol name
   - Timestamp
3. **Select Transaction** → User clicks on a transaction
4. **Receipt Customization** → User adds notes, tags
5. **Mint Validation** → System checks if transaction type is supported
   - ✅ **Supported**: Shows "Ready to Mint" screen
   - ❌ **Unsupported**: Shows "Cannot Mint Receipt" screen with explanation
6. **Mint Receipt** → Creates permanent NFT onchain

## Technical Implementation

### Detection Algorithm
1. Check if transaction is a contract deployment (`to` is null)
2. Look up `to` address in known protocol contracts
3. Parse method signature from transaction input data
4. Fallback to value-based detection (ETH transfer)
5. Default to `unknown` if no match found

### Protocol Name Resolution
1. Check known protocol contracts by address
2. Fallback to generic name based on action type
3. Display protocol name in transaction list

### Minting Validation
1. User selects transaction and customizes receipt
2. System validates `actionType` against `SUPPORTED_MINT_TYPES`
3. If unsupported, display restriction message
4. If supported, allow minting to proceed

## Files Modified/Created

### New Files
- `src/lib/protocol-detector.ts` - Protocol detection system

### Modified Files
- `src/types/receipt.ts` - Added `bridge` to ActionType, added `input` to BaseTransaction
- `src/lib/transaction-utils.ts` - Integrated protocol detector
- `src/components/transaction-list.tsx` - Enhanced UI with type badges and protocol names
- `src/components/receipt-minter.tsx` - Added minting restrictions

## Supported Base Protocols

### DEX (6 protocols)
- Uniswap V3 Router
- Uniswap V3 Router 2
- Aerodrome Router
- Aerodrome V2 Router
- BaseSwap Router
- SwapBased Router

### Bridges (4 protocols)
- Base Bridge
- Base L2 Bridge
- Stargate Bridge
- Across Bridge

### NFT Marketplaces (5 protocols)
- Seaport (OpenSea)
- Seaport 1.1
- Seaport 1.4
- Zora Minter
- Zora ERC721

### Tokens (6 tokens)
- USDC
- WETH
- DAI
- USDbC
- AERO
- BRETT

## Future Enhancements

### Potential Additions
- [ ] Lending protocols (Aave, Compound)
- [ ] Staking platforms
- [ ] Governance protocols
- [ ] More DEX aggregators
- [ ] GameFi protocols

### Advanced Features
- [ ] Fetch transaction logs for more accurate detection
- [ ] Display token amounts and prices
- [ ] Show swap details (Token A → Token B)
- [ ] Bridge destination chain display
- [ ] Gas cost estimation

## Testing Recommendations

1. Test with **swap transactions** from Uniswap/Aerodrome
2. Test with **bridge transactions** from Base Bridge
3. Test with **NFT mint transactions** from Zora/OpenSea
4. Test with **token transfers** (should show restriction)
5. Test with **contract deployments** (should show restriction)
6. Test with **unknown transactions** (should show restriction)

## Performance Considerations

- Protocol lookup is O(1) using object/map lookups
- Method signature parsing is fast (string slice)
- No additional API calls required
- Detection happens synchronously

## Conclusion

This implementation provides intelligent transaction classification and restricts receipt minting to meaningful DeFi activities (swaps, bridges, NFT mints). The system is extensible and can easily support more protocols and transaction types in the future.
