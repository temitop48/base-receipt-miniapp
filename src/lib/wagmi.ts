import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';

const chainId = process.env.NEXT_PUBLIC_SDK_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_SDK_CHAIN_ID)
  : base.id;
  
export const activeChain = chainId === 84532 ? baseSepolia : base;
  
export const config = createConfig({
  chains: [activeChain],
  connectors: [
    coinbaseWallet({
      appName: 'Base Receipts',
      preference: 'all',
    }),
    metaMask({
      dappMetadata: {
        name: 'Base Receipts',
      },
    }),
    injected({ target: 'rabby' }),
    injected({ 
      target: {
        id: 'okxWallet',
        name: 'OKX Wallet',
        provider: (window: Window & typeof globalThis) => window.okxwallet,
      }
    }),
    injected({ 
      target: {
        id: 'zerion',
        name: 'Zerion',
        provider: (window: Window & typeof globalThis) => window.zerionWallet,
      }
    }),
  ],
  transports: {  
    [base.id]: http('https://mainnet.base.org', {
      batch: {
        wait: 50, // Batch requests within 50ms window
      },
      retryCount: 3,
      retryDelay: 150,
      timeout: 10_000,
    }),
    [baseSepolia.id]: http('https://sepolia.base.org', {
      batch: {
        wait: 50,
      },
      retryCount: 3,
      retryDelay: 150,
      timeout: 10_000,
    }),
  }
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5_000,
    },
  },
});
