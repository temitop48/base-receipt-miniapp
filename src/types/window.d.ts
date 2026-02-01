import type { EIP1193Provider } from 'viem';

declare global {
  interface Window {
    okxwallet?: EIP1193Provider;
    zerionWallet?: EIP1193Provider;
    ethereum?: EIP1193Provider;
  }
}

export {};
