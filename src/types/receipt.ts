import type { Address, Hash } from 'viem';

export type ReceiptTag = 'First time' | 'Milestone' | 'Win' | 'Loss' | 'Chaos';

export type ActionType = 'swap' | 'mint' | 'send' | 'deploy' | 'vote' | 'bridge' | 'contract' | 'unknown';

export interface BaseTransaction {
  hash: Hash;
  from: Address;
  to: Address | null;
  value: bigint;
  blockNumber: bigint;
  timestamp: number;
  input?: `0x${string}`;
  gasUsed: bigint;
  gasPrice: bigint;
}

export interface Receipt {
  txHash: Hash;
  actionType: ActionType;
  protocol: string;
  timestamp: number;
  blockNumber: bigint;
  userNote: string;
  tag: ReceiptTag;
  chain: string;
  gasUsed: bigint;
  gasPrice: bigint;
}

export interface ReceiptMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Serializable version of Receipt where BigInt fields are converted to strings
 * Use this type when sending receipts over the network or storing in JSON
 */
export interface SerializableReceipt {
  txHash: Hash;
  actionType: ActionType;
  protocol: string;
  timestamp: number;
  blockNumber: string; // Serialized as string instead of bigint
  userNote: string;
  tag: ReceiptTag;
  chain: string;
  gasUsed: string; // Serialized as string instead of bigint
  gasPrice: string; // Serialized as string instead of bigint
}
