'use client';

import { WalletSelector } from './wallet-selector';

export function WalletConnect() {
  return (
    <div className="flex justify-end">
      <WalletSelector />
    </div>
  );
}
