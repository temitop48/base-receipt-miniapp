# Base Receipts Smart Contract

## Overview

This directory contains the Solidity smart contract for Base Receipts NFTs.

## Contract: BaseReceipts.sol

An ERC-721 NFT contract that allows users to mint receipts for their Base transactions.

### Features

- **Mint receipts**: Users can mint a receipt NFT for any Base transaction
- **Unique receipts**: Each transaction can only be minted once
- **Metadata storage**: Receipt metadata is stored via tokenURI
- **Transaction mapping**: Easy lookup of token IDs by transaction hash

### Deployment Instructions

#### Prerequisites

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
```

#### Compile

```bash
npx hardhat compile
```

#### Deploy to Base Sepolia

1. Create a `.env` file:
```
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

2. Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

3. Create deployment script `scripts/deploy.js`:
```javascript
async function main() {
  const BaseReceipts = await ethers.getContractFactory("BaseReceipts");
  const receipts = await BaseReceipts.deploy();
  await receipts.waitForDeployment();
  
  console.log("BaseReceipts deployed to:", await receipts.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

4. Deploy:
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

5. Update `src/lib/contract.ts` with the deployed address

#### Deploy to Base Mainnet

Change network configuration to Base mainnet:
```javascript
base: {
  url: "https://mainnet.base.org",
  accounts: [process.env.PRIVATE_KEY]
}
```

### Contract Functions

- `mintReceipt(txHash, metadataURI)`: Mint a receipt for a transaction
- `receiptExists(txHash)`: Check if a receipt exists for a transaction
- `getTokenIdByTxHash(txHash)`: Get the token ID for a transaction
- `tokenURI(tokenId)`: Get metadata URI for a receipt

### Gas Optimization

The contract is optimized for gas efficiency:
- Minimal storage usage
- Single mapping for transaction tracking
- No unnecessary iterations

### Security

- Uses OpenZeppelin's audited ERC721 implementation
- Prevents duplicate minting
- Requires valid inputs
