/**
 * Protocol Detection for Base Transactions
 * Identifies transaction types based on contract addresses and method signatures
 */

import type { Address, Hash } from 'viem';
import type { ActionType } from '@/types/receipt';

/**
 * Known protocol contracts on Base
 */
export const KNOWN_PROTOCOLS: Record<string, { name: string; type: ActionType }> = {
  // DEX Protocols
  '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24': { name: 'Uniswap V3 Router', type: 'swap' },
  '0x2626664c2603336e57b271c5c0b26f421741e481': { name: 'Uniswap V3 Router 2', type: 'swap' },
  '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': { name: 'Aerodrome Router', type: 'swap' },
  '0x6cb442acf35158d5eda88fe602221b67b400be3e': { name: 'Aerodrome V2 Router', type: 'swap' },
  '0x327df1e6de05895d2ab08513aadd9313fe505d86': { name: 'BaseSwap Router', type: 'swap' },
  '0x8909dc15e40173ff4699343b6eb8132c65e18ec6': { name: 'SwapBased Router', type: 'swap' },
  
  // Bridge Protocols
  '0x49048044d57e1c92a77f79988d21fa8faf74e97e': { name: 'Base Bridge', type: 'bridge' },
  '0x4200000000000000000000000000000000000010': { name: 'Base L2 Bridge', type: 'bridge' },
  '0x45f1a95a4d3f3836523f5c83673c797f4d4d263b': { name: 'Stargate Bridge', type: 'bridge' },
  '0x50b6ebc2103bfec165949cc946d739d5650d7ae4': { name: 'Across Bridge', type: 'bridge' },
  
  // NFT Marketplaces
  '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': { name: 'Seaport (OpenSea)', type: 'mint' },
  '0x00000000006c3852cbef3e08e8df289169ede581': { name: 'Seaport 1.1', type: 'mint' },
  '0x0000000000000068f116a894984e2db1123eb395': { name: 'Seaport 1.4', type: 'mint' },
  '0x1e0049783f008a0085193e00003d00cd54003c71': { name: 'Zora Minter', type: 'mint' },
  '0x04e2516a2c207e84a1839755675dfd8ef6302f0a': { name: 'Zora ERC721', type: 'mint' },
  
  // Token Contracts (for transfers/approvals)
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { name: 'USDC', type: 'send' },
  '0x4200000000000000000000000000000000000006': { name: 'WETH', type: 'send' },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { name: 'DAI', type: 'send' },
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': { name: 'USDbC', type: 'send' },
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631': { name: 'AERO', type: 'send' },
  '0x532f27101965dd16442e59d40670faf5ebb142e4': { name: 'BRETT', type: 'send' },
};

/**
 * Method signatures for common transaction types
 */
export const METHOD_SIGNATURES: Record<string, ActionType> = {
  // Swap methods
  '0x38ed1739': 'swap', // swapExactTokensForTokens
  '0x8803dbee': 'swap', // swapTokensForExactTokens
  '0x7ff36ab5': 'swap', // swapExactETHForTokens
  '0x18cbafe5': 'swap', // swapExactTokensForETH
  '0x5c11d795': 'swap', // swapExactTokensForTokensSupportingFeeOnTransferTokens
  '0x791ac947': 'swap', // swapExactTokensForETHSupportingFeeOnTransferTokens
  '0xc04b8d59': 'swap', // exactInput (Uniswap V3)
  '0x5ae401dc': 'swap', // multicall (often used for swaps)
  '0x414bf389': 'swap', // exactInputSingle (Uniswap V3)
  
  // Bridge methods
  '0x09f2b0d8': 'bridge', // depositETH
  '0x8f601f66': 'bridge', // depositERC20
  '0x32b7006d': 'bridge', // bridgeETH
  '0x58a997f6': 'bridge', // relay
  
  // NFT mint methods
  '0x6a627842': 'mint', // mint
  '0xa0712d68': 'mint', // mint(uint256)
  '0x40c10f19': 'mint', // mint(address,uint256)
  '0x84bb1e42': 'mint', // mintTo
  '0x1249c58b': 'mint', // mintWithRewards
  '0x6871ee40': 'mint', // purchase
  
  // Token transfer/approve (common actions)
  '0xa9059cbb': 'send', // transfer
  '0x23b872dd': 'send', // transferFrom
  '0x095ea7b3': 'send', // approve
};

/**
 * Transaction types that are supported for receipt minting
 */
export const SUPPORTED_MINT_TYPES: ActionType[] = ['swap', 'bridge', 'mint', 'send', 'contract'];

/**
 * Detect the action type of a transaction
 */
export function detectActionType(
  to: Address | null,
  value: bigint,
  input?: `0x${string}`
): ActionType {
  // Contract deployment
  if (!to) {
    return 'deploy';
  }

  const toAddressLower = to.toLowerCase();

  // Check known protocol contracts first
  const knownProtocol = KNOWN_PROTOCOLS[toAddressLower];
  if (knownProtocol) {
    return knownProtocol.type;
  }

  // Check method signature if input data exists
  if (input && input.length >= 10) {
    const methodSig = input.slice(0, 10);
    const detectedType = METHOD_SIGNATURES[methodSig];
    if (detectedType) {
      return detectedType;
    }
  }

  // If we have input data but no recognized method, it's a contract interaction
  if (input && input.length > 10 && input !== '0x') {
    return 'contract';
  }

  // Fallback: if value > 0, it's a simple send
  if (value > 0n) {
    return 'send';
  }

  // Truly unknown (no data, no value, unrecognized)
  return 'unknown';
}

/**
 * Detect the protocol name for a transaction
 */
export function detectProtocol(
  to: Address | null,
  actionType: ActionType
): string {
  if (!to) {
    return 'Contract Deployment';
  }

  const toAddressLower = to.toLowerCase();

  // Check known protocols
  const knownProtocol = KNOWN_PROTOCOLS[toAddressLower];
  if (knownProtocol) {
    return knownProtocol.name;
  }

  // Fallback based on action type
  switch (actionType) {
    case 'swap':
      return 'DEX Swap';
    case 'bridge':
      return 'Bridge Transfer';
    case 'mint':
      return 'NFT Mint';
    case 'send':
      return 'Token Transfer';
    case 'deploy':
      return 'Contract Deployment';
    case 'vote':
      return 'Governance Vote';
    case 'contract':
      // Display truncated contract address for unknown contracts
      return `Contract: ${to.slice(0, 6)}...${to.slice(-4)}`;
    default:
      return 'Unknown Protocol';
  }
}

/**
 * Check if a transaction type is supported for minting
 */
export function isMintableTransaction(actionType: ActionType): boolean {
  return SUPPORTED_MINT_TYPES.includes(actionType);
}

/**
 * Get a user-friendly description of why a transaction can't be minted
 */
export function getMintRestrictionReason(actionType: ActionType): string | null {
  if (isMintableTransaction(actionType)) {
    return null;
  }

  switch (actionType) {
    case 'deploy':
      return 'Contract deployments are not supported for receipt minting.';
    case 'vote':
      return 'Governance votes are not supported for receipt minting.';
    case 'unknown':
      return 'This transaction type is not recognized. Only swaps, bridges, token transfers, NFT mints, and contract interactions can be minted.';
    default:
      return 'This transaction type is not supported for receipt minting.';
  }
}

/**
 * Get enhanced transaction data from Basescan API
 * This fetches additional details like input data for better classification
 */
export async function fetchTransactionDetails(txHash: Hash): Promise<{
  input: `0x${string}`;
  isError: boolean;
} | null> {
  try {
    const params = new URLSearchParams({
      txhash: txHash,
    });

    const response = await fetch(`/api/basescan/tx?${params.toString()}`);
    
    if (!response.ok) {
      console.warn('[Protocol Detector] Failed to fetch tx details');
      return null;
    }

    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      return {
        input: data.result.input as `0x${string}`,
        isError: data.result.isError === '1',
      };
    }

    return null;
  } catch (error) {
    console.error('[Protocol Detector] Error fetching tx details:', error);
    return null;
  }
}
