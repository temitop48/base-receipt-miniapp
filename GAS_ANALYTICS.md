# Gas Analytics Feature

## Overview

The Gas Analytics feature provides users with comprehensive insights into their gas spending on Base. It automatically calculates and displays gas costs across all fetched transactions.

## Implementation Details

### Data Collection

Gas data is automatically fetched from the Basescan API V2 along with transaction data. The API provides:
- `gasUsed`: Amount of gas consumed by the transaction
- `gasPrice`: Price per unit of gas in wei

### Calculations

**Total Gas Spent (ETH):**
```
totalGas = sum(gasUsed * gasPrice) for all transactions
totalGasETH = totalGas / 10^18
```

**Average Gas per Transaction:**
```
avgGas = totalGas / transactionCount
avgGasETH = avgGas / 10^18
```

### Components

#### `GasAnalytics` Component (`src/components/gas-analytics.tsx`)
- **Purpose**: Displays gas spending statistics with beautiful UI
- **Props**:
  - `transactions`: Array of BaseTransaction objects with gas data
  - `loading`: Boolean indicating if transactions are being fetched
- **Features**:
  - Total gas spent in ETH
  - Average gas per transaction
  - Transaction count
  - Highest gas transaction with link to Basescan
  - Automatic formatting for small ETH amounts (0.0001 to 0.0000001 ETH)

### Type Updates

#### `BaseTransaction` Interface (`src/types/receipt.ts`)
Added two new fields:
```typescript
gasUsed: bigint;   // Amount of gas used in the transaction
gasPrice: bigint;  // Gas price in wei
```

### Data Flow

1. **Transaction Fetching** (`src/lib/transaction-utils.ts`):
   - Basescan API returns gas data for each transaction
   - `gasUsed` and `gasPrice` are parsed from API response
   - Values are converted to BigInt for precision

2. **Transaction List** (`src/components/transaction-list.tsx`):
   - Fetches transactions with gas data
   - Passes transactions to parent via `onTransactionsLoaded` callback
   - Notifies parent of loading state via `onLoadingChange` callback

3. **Main Page** (`src/app/page.tsx`):
   - Receives transaction data and loading state
   - Passes to `GasAnalytics` component for display

4. **Gas Analytics Display** (`src/components/gas-analytics.tsx`):
   - Calculates statistics using `useMemo` for performance
   - Formats ETH values for display
   - Shows loading skeleton while fetching
   - Links highest gas transaction to Basescan

## Features

### Summary Statistics

**Total Gas Spent Card:**
- Large orange gradient card
- Shows total ETH spent on gas
- Displays number of transactions

**Average Gas Card:**
- Blue gradient card
- Shows average gas per transaction in ETH

**Transaction Count Card:**
- Purple gradient card
- Displays total number of confirmed transactions

**Highest Gas Transaction:**
- Amber gradient card
- Shows transaction hash (truncated)
- Displays gas cost in ETH
- Links to Basescan for verification

### Visual Design

- Color-coded cards with gradient backgrounds
- Icon indicators for each metric
- Loading skeletons during data fetch
- Responsive grid layout
- Dark mode support

## Performance

- Uses `useMemo` to prevent unnecessary recalculations
- Caches transaction data for 60 seconds
- Efficient BigInt arithmetic
- No additional API calls (uses existing transaction data)

## Error Handling

- Gracefully handles missing gas data (defaults to 0)
- Displays appropriate message when no transactions available
- Works seamlessly with existing error states

## Accuracy

- Gas totals match Basescan data
- Uses BigInt for precision (no rounding errors)
- Only includes confirmed, successful transactions
- Excludes failed transactions from calculations

## Browser Compatibility

- Works in all modern browsers
- BigInt support (ES2020+)
- formatEther from viem handles conversion
