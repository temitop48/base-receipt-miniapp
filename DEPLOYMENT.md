# Base Receipts - Deployment Guide

## Overview

Base Receipts is a Web3 dApp that transforms Base blockchain transactions into beautiful, shareable NFT receipts.

---

## Quick Start

### 1. Smart Contract Deployment

The smart contract must be deployed to Base Sepolia (testnet) or Base Mainnet before users can mint receipts.

#### Install Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

#### Initialize Hardhat

```bash
npx hardhat init
```

Choose "Create a JavaScript project" and accept defaults.

#### Configure Hardhat

Create `hardhat.config.js` in the project root:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    }
  }
};
```

#### Create .env File

```bash
PRIVATE_KEY=your_wallet_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org
```

**⚠️ IMPORTANT: Never commit your `.env` file to version control!**

#### Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying BaseReceipts contract...");

  const BaseReceipts = await hre.ethers.getContractFactory("BaseReceipts");
  const receipts = await BaseReceipts.deploy();

  await receipts.waitForDeployment();
  
  const address = await receipts.getAddress();
  console.log("BaseReceipts deployed to:", address);
  console.log("Update RECEIPT_CONTRACT_ADDRESS in src/lib/contract.ts with this address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### Deploy to Base Sepolia (Testnet)

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

#### Deploy to Base Mainnet

```bash
npx hardhat run scripts/deploy.js --network base
```

#### Update Contract Address

After deployment, update `src/lib/contract.ts`:

```typescript
export const RECEIPT_CONTRACT_ADDRESS: Address = '0xYourDeployedContractAddress';
```

---

### 2. Verify Contract (Recommended)

Verify your contract on BaseScan for transparency:

```bash
npx hardhat verify --network baseSepolia YOUR_CONTRACT_ADDRESS
```

---

### 3. Frontend Configuration

The frontend is already configured and built. Just ensure:

1. **Contract Address**: Updated in `src/lib/contract.ts`
2. **Network**: The app defaults to Base mainnet. To use Base Sepolia testnet, set:
   ```
   NEXT_PUBLIC_SDK_CHAIN_ID=84532
   ```

---

## Metadata Storage

### Current Setup (Base64 Data URIs)

The app currently stores metadata as base64-encoded data URIs directly in the contract. This works but has limitations:
- No external image hosting
- SVG images embedded in metadata
- Not upgradeable

### Upgrade to IPFS with Pinata (Recommended)

For production use, upgrade to Pinata for proper IPFS storage:

1. **Benefits**:
   - Permanent, decentralized storage
   - Uploadable custom receipt images
   - Industry-standard NFT metadata
   - Better performance

2. **Cost**: Requires paid subscription

3. **Implementation**: The Pinata connection is available but requires an upgrade to access

---

## Testing the App

### On Base Sepolia (Testnet)

1. Get Base Sepolia ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect wallet to Base Sepolia
3. Make a test transaction
4. Use Base Receipts to mint it as an NFT

### On Base Mainnet

1. Ensure you have real ETH on Base
2. Connect wallet to Base
3. Select any recent transaction
4. Customize and mint as NFT

---

## Gas Fees

- **Base Sepolia**: Free (testnet ETH)
- **Base Mainnet**: ~$0.01 per mint (extremely cheap!)

---

## Project Structure

```
Base Receipts/
├── contracts/              # Smart contracts
│   ├── BaseReceipts.sol    # ERC-721 receipt contract
│   └── README.md           # Contract documentation
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── metadata/   # Metadata generation API
│   │   ├── config/         # OnchainKit configuration
│   │   └── page.tsx        # Main app page
│   ├── components/         # React components
│   │   ├── wallet-connect.tsx
│   │   ├── transaction-list.tsx
│   │   ├── receipt-card.tsx
│   │   ├── receipt-customizer.tsx
│   │   └── receipt-minter.tsx
│   ├── lib/                # Utilities
│   │   ├── contract.ts     # Contract ABI & address
│   │   ├── transaction-utils.ts
│   │   └── wagmi.ts        # Web3 configuration
│   └── types/              # TypeScript types
│       └── receipt.ts
└── DEPLOYMENT.md           # This file
```

---

## Key Features

✅ **Wallet Connection**: Supports Coinbase Wallet, MetaMask, and more
✅ **Transaction Fetching**: Automatically loads recent Base transactions
✅ **Receipt Customization**: Add personal notes and tags
✅ **NFT Minting**: One-click minting to your wallet
✅ **Beautiful UI**: Screenshot-ready receipt cards
✅ **Mobile-Friendly**: Fully responsive design
✅ **Base-Native**: Built specifically for Base blockchain

---

## Next Steps

1. **Deploy Smart Contract** to Base Sepolia or Base mainnet
2. **Update Contract Address** in the code
3. **Test the Flow** with a real transaction
4. **Consider Upgrading** to Pinata for production-grade IPFS
5. **Share Your Receipts** on social media!

---

## Support

- Base Documentation: https://docs.base.org
- OnchainKit Docs: https://onchainkit.xyz
- Wagmi Docs: https://wagmi.sh

---

## Security Notes

- Always verify contract addresses before interacting
- Keep your private keys secure and never share them
- Test thoroughly on Base Sepolia before deploying to mainnet
- The smart contract is upgradeable - consider implementing AccessControl for production

---

Built with ❤️ on Base
