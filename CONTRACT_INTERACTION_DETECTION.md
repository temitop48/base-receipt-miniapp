# Smart Contract Interaction Detection

## Overview
Base Receipts now automatically detects and categorizes smart contract interactions in your Base transactions. This enables you to mint receipt NFTs for any contract interaction, even if the specific protocol isn't recognized.

## How It Works

### Detection Algorithm
The system identifies contract interactions using a multi-step process:

1. **Known Protocol Check**: First checks if the contract address matches any known protocols (DEX, bridge, NFT marketplace, etc.)
2. **Method Signature Analysis**: Examines the function signature (first 4 bytes of input data) to identify common actions
3. **Contract Interaction Detection**: If input data exists but isn't recognized, classifies it as a generic "contract" interaction
4. **Fallback Logic**: If no input data but value > 0, it's a simple ETH transfer

### Transaction Types
- **swap**: DEX swaps (Uniswap, Aerodrome, etc.)
- **bridge**: Bridge transfers (Base Bridge, Stargate, etc.)
- **mint**: NFT mints (Zora, OpenSea, etc.)
- **send**: Token transfers and approvals
- **contract**: Generic smart contract interactions (NEW!)
- **deploy**: Contract deployments (not mintable)
- **vote**: Governance votes (not mintable)
- **unknown**: Unrecognized transactions (not mintable)

## Visual Indicators

### Transaction List Badges
Contract interactions are displayed with a distinctive **indigo gradient badge**:
- 🟣 Purple = Swap
- 🟦 Teal = Bridge
- 🩷 Pink = NFT Mint
- 🔵 Blue = Token Transfer
- 🟣 Indigo = Contract Interaction (NEW!)
- ⚫ Gray = Other/Unknown

### Protocol Display
For unrecognized contracts, the system displays a truncated contract address:
```
Contract: 0x1234...5678
```

This ensures users can always identify which contract they interacted with, even if the protocol name isn't in the database.

## Mintable Transactions
All contract interactions are now eligible for receipt NFT minting! The supported types are:
- ✅ DEX Swaps
- ✅ Bridge Transfers
- ✅ NFT Mints
- ✅ Token Transfers
- ✅ Contract Interactions (NEW!)

## Technical Implementation

### Files Modified
1. **src/types/receipt.ts**: Added 'contract' to ActionType union
2. **src/lib/protocol-detector.ts**: 
   - Updated detection logic to identify contract interactions
   - Added 'contract' to SUPPORTED_MINT_TYPES
   - Enhanced protocol name display for unknown contracts
3. **src/components/transaction-list.tsx**: Added indigo badge styling for contract transactions
4. **src/components/receipt-minter.tsx**: Added "Contract Interactions" to supported types UI

### Detection Logic
```typescript
// If we have input data but no recognized method, it's a contract interaction
if (input && input.length > 10 && input !== '0x') {
  return 'contract';
}
```

This ensures that any transaction with calldata that doesn't match known patterns is still properly categorized as a contract interaction rather than being labeled as "unknown".

## Benefits
- **Complete Coverage**: No more "unknown" transactions for legitimate contract interactions
- **Better UX**: Users can mint receipts for any DeFi activity, not just recognized protocols
- **Clear Labeling**: Truncated contract addresses help users identify transactions
- **Extensible**: Easy to add new known protocols without breaking contract detection

## Future Enhancements
Possible improvements for contract interaction detection:
- Contract name resolution via Base contract verification API
- Token/NFT metadata enrichment for better display
- Historical interaction tracking for repeat contracts
- Integration with OnchainKit's identity features for verified contracts

## Usage Example
When a user interacts with a new DeFi protocol that isn't in the known protocols list:

1. Transaction appears with "contract" badge (indigo)
2. Protocol displays as "Contract: 0xabcd...1234"
3. User can select and mint a receipt NFT
4. Receipt metadata includes the full contract address
5. Transaction is permanently recorded onchain

This ensures Base Receipts works with the entire Base ecosystem, not just a predefined list of protocols!
