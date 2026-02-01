'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';
import { Card } from './ui/card';

interface WalletSearchProps {
  onSearch: (address: string) => void;
  onClear: () => void;
  currentAddress: string | null;
  loading: boolean;
}

export function WalletSearch({ onSearch, onClear, currentAddress, loading }: WalletSearchProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleSearch = () => {
    setError(null);
    
    const trimmed = inputValue.trim();
    
    if (!trimmed) {
      setError('Please enter a wallet address');
      return;
    }

    if (!validateAddress(trimmed)) {
      setError('Invalid wallet address format. Must be a valid Ethereum address (0x...)');
      return;
    }

    onSearch(trimmed);
  };

  const handleClear = () => {
    setInputValue('');
    setError(null);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <Card className="p-6 glass-panel animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="text-xl font-bold">Search Wallet</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Enter wallet address (0x...)"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className={`pr-10 ${error ? 'border-red-500 dark:border-red-400' : ''}`}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={loading || !inputValue.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 button-glow flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>

            {currentAddress && (
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 animate-fade-in">
            {error}
          </p>
        )}

        {currentAddress && !error && (
          <div className="text-sm text-muted-foreground animate-fade-in">
            <span className="font-medium">Viewing wallet:</span>{' '}
            <span className="font-mono">{currentAddress.slice(0, 10)}...{currentAddress.slice(-8)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
